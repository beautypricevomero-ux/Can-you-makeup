"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import styles from "./page.module.css";

type Tier = { id: string; label: string; fee: number; secs: number };
type Sector = { id: string; label: string; weight: number; handles: string[] };
type Settings = { tiers: Tier[]; sectorsByTier: Record<string, Sector[]> };
type Product = {
  id: string;
  sector: string;
  title: string;
  description?: string;
  images?: { url: string; altText?: string }[];
  variants?: { id: string; price: { amount: string; currencyCode: string } }[];
};

type Stage = "intro" | "ticket" | "checkout" | "countdown" | "playing" | "summary" | "address";
type SessionResult = "timeout" | "completed";
type ActionToast = { type: "reject" | "keep"; penalty: number; remaining: number };
type CheckoutFormData = { name: string; email: string; cardNumber: string; expiry: string; cvv: string };
type CheckoutState = "idle" | "processing" | "error";
type ShippingForm = { fullName: string; address: string; city: string; zip: string; notes: string };

const REJECT_PENALTY_SECONDS = 10;
const KEEP_PENALTY_SECONDS = 30;
const STORAGE_KEY = "cym-paid-tiers";
const EMPTY_CHECKOUT: CheckoutFormData = { name: "", email: "", cardNumber: "", expiry: "", cvv: "" };
const EMPTY_SHIPPING: ShippingForm = { fullName: "", address: "", city: "", zip: "", notes: "" };

function formatCurrency(value: number | string | undefined, currencyCode = "EUR") {
  if (typeof value === "undefined") return "";
  const numeric = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(numeric)) return "";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(numeric);
}

function parsePrice(product: Product): number {
  const amount = product.variants?.[0]?.price?.amount;
  const numeric = typeof amount === "string" ? Number(amount) : 0;
  return Number.isNaN(numeric) ? 0 : numeric;
}

function selectNextProduct(
  pool: Product[],
  pickedIds: string[],
  sectors: Sector[],
  maxPrice?: number
) {
  const available = pool.filter((item) => !pickedIds.includes(item.id));
  if (available.length === 0) return null;
  let candidatePool = available;
  if (typeof maxPrice === "number") {
    const filtered = available.filter((item) => parsePrice(item) <= maxPrice + 1e-2);
    if (filtered.length === 0) {
      return null;
    }
    candidatePool = filtered;
  }
  if (candidatePool.length === 0) return null;
  if (sectors.length === 0) return candidatePool[0];

  const sectorEntries = sectors
    .map((sector) => ({
      sector,
      products: candidatePool.filter((item) => item.sector === sector.id),
    }))
    .filter((entry) => entry.products.length > 0);

  if (sectorEntries.length === 0) {
    return candidatePool[Math.floor(Math.random() * candidatePool.length)];
  }

  const totalWeight = sectorEntries.reduce((sum, entry) => sum + entry.sector.weight, 0);
  let ticket = Math.random() * totalWeight;
  for (const entry of sectorEntries) {
    ticket -= entry.sector.weight;
    if (ticket <= 0) {
      return entry.products[Math.floor(Math.random() * entry.products.length)];
    }
  }

  const fallback = sectorEntries[sectorEntries.length - 1];
  return fallback.products[Math.floor(Math.random() * fallback.products.length)];
}

function TimerBar({ total, left }: { total: number; left: number }) {
  const width = total > 0 ? Math.max(0, Math.min(100, (left / total) * 100)) : 0;
  return (
    <div className={styles.timer} role="timer" aria-live="polite">
      <div className={styles.timerTrack}>
        <div className={styles.timerFill} style={{ width: `${width}%` }} />
      </div>
      <span className={styles.timerLabel}>{left}s</span>
    </div>
  );
}

function ActionNotification({ toast }: { toast: ActionToast | null }) {
  if (!toast) return null;
  return (
    <div className={styles.toast} role="status" aria-live="assertive">
      <div className={styles.toastIcon}>{toast.type === "reject" ? "⏳" : "🛒"}</div>
      <div>
        <p className={styles.toastTitle}>
          {toast.type === "reject" ? "Prodotto scartato" : "Prodotto nel carrello"}
        </p>
        <p className={styles.toastBody}>
          Hai consumato <strong>{toast.penalty}s</strong>. Tempo residuo: <strong>{toast.remaining}s</strong>.
        </p>
      </div>
    </div>
  );
}

function SwipeCard({
  product,
  disabled,
  onReject,
  onKeep,
  sectorLabel,
}: {
  product: Product;
  disabled: boolean;
  onReject: () => void;
  onKeep: () => void;
  sectorLabel?: string;
}) {
  const [deltaX, setDeltaX] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const active = useRef(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    pointerStart.current = event.clientX;
    active.current = true;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!active.current || pointerStart.current === null) return;
    setDeltaX(event.clientX - pointerStart.current);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!active.current || pointerStart.current === null) return;
    const delta = event.clientX - pointerStart.current;
    pointerStart.current = null;
    active.current = false;
    setDeltaX(0);
    if (delta > 80) {
      onKeep();
    } else if (delta < -80) {
      onReject();
    }
  };

  const price = product.variants?.[0]?.price;

  return (
    <div
      className={`${styles.productCard} ${disabled ? styles.cardDisabled : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ transform: `translateX(${deltaX}px) rotate(${deltaX / 25}deg)` }}
    >
      <div className={styles.productImageWrap}>
        <img
          src={product.images?.[0]?.url || "https://picsum.photos/seed/makeup/720/720"}
          alt={product.images?.[0]?.altText || product.title}
        />
        {sectorLabel ? <span className={styles.sectorBadge}>{sectorLabel}</span> : null}
      </div>
      <div className={styles.productBody}>
        <h2>{product.title}</h2>
        <p>{product.description || "Scopri tutti i dettagli sul nostro catalogo."}</p>
        <div className={styles.priceTag}>{formatCurrency(price?.amount, price?.currencyCode)}</div>
      </div>
      <div className={styles.swipeOverlay}>
        <button
          type="button"
          className={`${styles.controlButton} ${styles.reject}`}
          onClick={onReject}
          disabled={disabled}
          aria-label="Rifiuta prodotto"
        >
          ✕
        </button>
        <button
          type="button"
          className={`${styles.controlButton} ${styles.keep}`}
          onClick={onKeep}
          disabled={disabled}
          aria-label="Aggiungi al carrello"
        >
          ❤
        </button>
      </div>
    </div>
  );
}

export default function PlayPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [activeTierId, setActiveTierId] = useState<string | null>(null);
  const [paidTickets, setPaidTickets] = useState<Set<string>>(new Set());
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormData>(() => ({ ...EMPTY_CHECKOUT }));
  const [shippingForm, setShippingForm] = useState<ShippingForm>(() => ({ ...EMPTY_SHIPPING }));
  const [addressSubmitted, setAddressSubmitted] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [valueLimit, setValueLimit] = useState(0);
  const [cartValue, setCartValue] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(1);
  const [pool, setPool] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [keptProducts, setKeptProducts] = useState<Product[]>([]);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [actionToast, setActionToast] = useState<ActionToast | null>(null);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTier = useMemo(() => settings?.tiers.find((tier) => tier.id === activeTierId) ?? null, [settings, activeTierId]);
  const currentSectorLabel = useMemo(() => {
    if (!settings || !activeTier || !currentProduct) return undefined;
    return settings.sectorsByTier[activeTier.id]?.find((sector) => sector.id === currentProduct.sector)?.label;
  }, [settings, activeTier, currentProduct]);

  useEffect(() => {
    void fetch("/api/settings")
      .then((response) => response.json())
      .then((data) => setSettings(data));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: string[] = JSON.parse(stored);
        setPaidTickets(new Set(parsed));
      } catch (error) {
        // ignore malformed storage
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(paidTickets)));
  }, [paidTickets]);

  const finishRound = useCallback(
    (outcome: SessionResult) => {
      setResult(outcome);
      setStage("summary");
      setSecondsLeft(0);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      setActionToast(null);
    },
    []
  );

  useEffect(() => {
    if (stage !== "playing") return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage === "playing" && secondsLeft === 0) {
      finishRound("timeout");
    }
  }, [stage, secondsLeft, finishRound]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const resetRoundState = useCallback(
    (preserveRetries: boolean) => {
      setPickedIds([]);
      setKeptProducts([]);
      setPool([]);
      setCurrentProduct(null);
      setCartValue(0);
      setFetchError(null);
      setResult(null);
      setShippingForm(() => ({ ...EMPTY_SHIPPING }));
      setAddressSubmitted(false);
      if (!preserveRetries) {
        setAttemptsLeft(1);
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      setActionToast(null);
    },
    []
  );

  const startRound = useCallback(
    async (tier: Tier, limit: number) => {
      if (!settings) return;
      setStage("playing");
      setIsFetching(true);
      const sectors = settings.sectorsByTier[tier.id] ?? [];
      try {
        const response = await fetch("/api/shopify/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectors }),
        });
        if (!response.ok) throw new Error("Bad response");
        const data = await response.json();
        const products: Product[] = data.products ?? [];
        setPool(products);
        const next = selectNextProduct(products, [], sectors, limit);
        if (next) {
          setCurrentProduct(next);
        } else {
          finishRound("completed");
        }
      } catch (error) {
        setFetchError("Impossibile caricare i prodotti. Riprova più tardi.");
        setStage("summary");
      } finally {
        setIsFetching(false);
      }
    },
    [settings, finishRound]
  );

  const startCountdown = useCallback(
    (tier: Tier, preserveRetries = false) => {
      resetRoundState(preserveRetries);
      const multiplier = 2 + Math.random() * 0.5;
      const limit = Number((tier.fee * multiplier).toFixed(2));
      setValueLimit(limit);
      setSecondsLeft(tier.secs);
      setCountdownValue(3);
      setStage("countdown");
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      let current = 3;
      countdownTimerRef.current = setInterval(() => {
        current -= 1;
        if (current > 0) {
          setCountdownValue(current);
        } else {
          setCountdownValue(0);
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          void startRound(tier, limit);
        }
      }, 1000);
    },
    [resetRoundState, startRound]
  );

  const showActionToast = useCallback((type: "reject" | "keep", penalty: number, remaining: number) => {
    setActionToast({ type, penalty, remaining });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setActionToast(null);
      toastTimerRef.current = null;
    }, 2400);
  }, []);

  const handleTicketSelection = useCallback(
    (tierId: string) => {
      if (!settings) return;
      const tier = settings.tiers.find((item) => item.id === tierId);
      if (!tier) return;
      setActiveTierId(tierId);
      setCheckoutState("idle");
      setCheckoutForm(() => ({ ...EMPTY_CHECKOUT }));
      if (paidTickets.has(tierId)) {
        startCountdown(tier, false);
      } else {
        setStage("checkout");
      }
    },
    [settings, paidTickets, startCountdown]
  );

  const handleCheckoutSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!activeTier) return;
      setCheckoutState("processing");
      setTimeout(() => {
        setCheckoutState("idle");
        setPaidTickets((prev) => {
          const next = new Set(prev);
          next.add(activeTier.id);
          return next;
        });
        startCountdown(activeTier, false);
      }, 1800);
    },
    [activeTier, startCountdown]
  );

  const handleReject = useCallback(() => {
    if (!settings || !activeTier || !currentProduct || stage !== "playing") return;
    const sectors = settings.sectorsByTier[activeTier.id] ?? [];
    const nextPicked = [...pickedIds, currentProduct.id];
    setPickedIds(nextPicked);
    const remainingBudget = Math.max(0, valueLimit - cartValue);
    const nextProduct = selectNextProduct(pool, nextPicked, sectors, remainingBudget);
    if (nextProduct) {
      setCurrentProduct(nextProduct);
    } else {
      finishRound("completed");
    }
    setSecondsLeft((prev) => {
      const penalty = Math.min(REJECT_PENALTY_SECONDS, prev);
      const next = Math.max(0, prev - REJECT_PENALTY_SECONDS);
      showActionToast("reject", penalty, next);
      return next;
    });
  }, [settings, activeTier, currentProduct, stage, pickedIds, valueLimit, cartValue, pool, finishRound, showActionToast]);

  const handleKeep = useCallback(() => {
    if (!settings || !activeTier || !currentProduct || stage !== "playing") return;
    const productPrice = parsePrice(currentProduct);
    const sectors = settings.sectorsByTier[activeTier.id] ?? [];
    const nextPicked = [...pickedIds, currentProduct.id];
    setPickedIds(nextPicked);
    setKeptProducts((prev) => [...prev, currentProduct]);
    let updatedCartValue = cartValue;
    setCartValue((prev) => {
      updatedCartValue = Number((prev + productPrice).toFixed(2));
      return updatedCartValue;
    });
    const remainingBudget = Math.max(0, valueLimit - updatedCartValue);
    const nextProduct = selectNextProduct(pool, nextPicked, sectors, remainingBudget);
    if (nextProduct) {
      setCurrentProduct(nextProduct);
    } else {
      finishRound("completed");
    }
    setSecondsLeft((prev) => {
      const penalty = Math.min(KEEP_PENALTY_SECONDS, prev);
      const next = Math.max(0, prev - KEEP_PENALTY_SECONDS);
      showActionToast("keep", penalty, next);
      return next;
    });
  }, [settings, activeTier, currentProduct, stage, pickedIds, valueLimit, cartValue, pool, finishRound, showActionToast]);

  const handleRepeat = useCallback(() => {
    if (!activeTier || attemptsLeft <= 0) return;
    setAttemptsLeft((prev) => Math.max(0, prev - 1));
    startCountdown(activeTier, true);
  }, [activeTier, attemptsLeft, startCountdown]);

  const handleConfirm = useCallback(() => {
    setStage("address");
  }, []);

  const handleShippingSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAddressSubmitted(true);
    },
    []
  );

  const totalValue = useMemo(() => Number(cartValue.toFixed(2)), [cartValue]);
  const ticketPrice = activeTier?.fee ?? 0;
  const savings = Math.max(0, Number((totalValue - ticketPrice).toFixed(2)));
  const savingsPercent = totalValue > 0 ? Math.round((savings / totalValue) * 100) : 0;

  return (
    <section className={styles.page}>
      <ActionNotification toast={actionToast} />

      {!settings ? (
        <div className={styles.loader}>Caricamento impostazioni…</div>
      ) : null}

      {stage === "intro" && (
        <div className={styles.stepCard}>
          <h1 className={styles.introTitle}>All You Can Makeup</h1>
          <p className={styles.introCopy}>
            Il tuo limite sarà solo il tempo: tutto quello che metterai nel carrello sarà tuo!
          </p>
          <button type="button" className={styles.glowButton} onClick={() => setStage("ticket")}>GIOCA</button>
        </div>
      )}

      {stage === "ticket" && settings && (
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>Scegli il taglio del tuo biglietto</h2>
          <div className={styles.ticketGrid}>
            {settings.tiers.map((tier) => (
              <details key={tier.id} className={styles.ticketCard}>
                <summary className={styles.ticketSummary}>
                  <span className={styles.ticketPrice}>{formatCurrency(tier.fee)}</span>
                  <span className={styles.ticketTime}>{tier.secs}s di tempo</span>
                </summary>
                <div className={styles.ticketBody}>
                  <p>
                    Ideale per esplorare i settori Low Cost, Low Cost Plus, Semi Luxury, Luxury ed Extra Luxury con tempo dedicato a
                    riempire il carrello.
                  </p>
                  {paidTickets.has(tier.id) ? <span className={styles.ticketBadge}>Biglietto già acquistato</span> : null}
                  <button type="button" onClick={() => handleTicketSelection(tier.id)}>
                    Scegli questo biglietto
                  </button>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {stage === "checkout" && activeTier && (
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>Fake checkout</h2>
          <p className={styles.stepSubtitle}>
            Completa il pagamento del biglietto da {formatCurrency(activeTier.fee)} per sbloccare {activeTier.secs} secondi di shopping.
          </p>
          <form className={styles.form} onSubmit={handleCheckoutSubmit}>
            <div className={styles.formRow}>
              <label htmlFor="name">Nome e cognome</label>
              <input
                id="name"
                name="name"
                required
                value={checkoutForm.name}
                onChange={(event) => setCheckoutForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={checkoutForm.email}
                onChange={(event) => setCheckoutForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="cardNumber">Numero carta</label>
              <input
                id="cardNumber"
                name="cardNumber"
                inputMode="numeric"
                required
                value={checkoutForm.cardNumber}
                onChange={(event) => setCheckoutForm((prev) => ({ ...prev, cardNumber: event.target.value }))}
              />
            </div>
            <div className={styles.formGroup}>
              <div className={styles.formRow}>
                <label htmlFor="expiry">Scadenza</label>
                <input
                  id="expiry"
                  name="expiry"
                  placeholder="MM/AA"
                  required
                  value={checkoutForm.expiry}
                  onChange={(event) => setCheckoutForm((prev) => ({ ...prev, expiry: event.target.value }))}
                />
              </div>
              <div className={styles.formRow}>
                <label htmlFor="cvv">CVV</label>
                <input
                  id="cvv"
                  name="cvv"
                  required
                  inputMode="numeric"
                  value={checkoutForm.cvv}
                  onChange={(event) => setCheckoutForm((prev) => ({ ...prev, cvv: event.target.value }))}
                />
              </div>
            </div>
            <button type="submit" className={styles.glowButton} disabled={checkoutState === "processing"}>
              {checkoutState === "processing" ? "Elaborazione in corso…" : "Paga e continua"}
            </button>
          </form>
        </div>
      )}

      {stage === "countdown" && activeTier && (
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>Preparati allo shopping</h2>
          <p className={styles.stepSubtitle}>
            Hai {activeTier.secs} secondi per riempire il carrello con i prodotti che ami.
          </p>
          <div className={styles.countdownCircle}>
            {countdownValue > 0 ? countdownValue : "Via!"}
          </div>
        </div>
      )}

      {stage === "playing" && activeTier && (
        <div className={styles.playground}>
          <header className={styles.playHeader}>
            <div className={styles.badges}>
              <span className={styles.tierBadge}>{activeTier.label}</span>
              <span className={styles.infoBadge}>Valore carrello {formatCurrency(totalValue)}</span>
              <span className={styles.infoBadge}>{keptProducts.length} prodotti</span>
            </div>
            <TimerBar total={activeTier.secs} left={secondsLeft} />
          </header>

          <div className={styles.playBody}>
            {isFetching && !currentProduct ? (
              <div className={styles.loader}>Caricamento prodotti…</div>
            ) : null}
            {currentProduct ? (
              <SwipeCard
                product={currentProduct}
                disabled={secondsLeft <= 0}
                onReject={handleReject}
                onKeep={handleKeep}
                sectorLabel={currentSectorLabel}
              />
            ) : null}
          </div>
        </div>
      )}

      {stage === "summary" && activeTier && (
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>Riepilogo del tuo round</h2>
          {fetchError ? <p className={styles.error}>{fetchError}</p> : null}
          {!fetchError && (
            <>
              <p className={styles.stepSubtitle}>
                Biglietto da {formatCurrency(ticketPrice)} · Valore prodotti {formatCurrency(totalValue)}
              </p>
              <p className={styles.savings}>
                Complimenti hai risparmiato {formatCurrency(savings)}
                {totalValue > 0 ? ` (${savingsPercent}%)` : ""} sui tuoi prodotti.
              </p>
              <ul className={styles.summaryList}>
                {keptProducts.map((product) => (
                  <li key={product.id}>
                    <div>
                      <h3>{product.title}</h3>
                      <p>{product.description}</p>
                    </div>
                    <span>{formatCurrency(product.variants?.[0]?.price.amount, product.variants?.[0]?.price.currencyCode)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className={styles.summaryActions}>
            <button type="button" className={styles.glowButton} onClick={handleConfirm} disabled={!!fetchError}>
              CONFERMA
            </button>
            <button type="button" onClick={handleRepeat} disabled={attemptsLeft <= 0 || !!fetchError}>
              RIPETI GIOCO
            </button>
          </div>
          <p className={styles.attempts}>Tentativi rimasti: {attemptsLeft}</p>
        </div>
      )}

      {stage === "address" && (
        <div className={styles.stepCard}>
          <h2 className={styles.stepTitle}>Indirizzo di spedizione</h2>
          {addressSubmitted ? (
            <div className={styles.successBox}>
              <p>
                Grazie {shippingForm.fullName}! Abbiamo registrato il tuo ordine per un valore di {formatCurrency(totalValue)}. Ti
                invieremo una conferma all'indirizzo {checkoutForm.email} appena sarà pronto.
              </p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleShippingSubmit}>
              <div className={styles.formRow}>
                <label htmlFor="fullName">Nome e cognome</label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  value={shippingForm.fullName}
                  onChange={(event) => setShippingForm((prev) => ({ ...prev, fullName: event.target.value }))}
                />
              </div>
              <div className={styles.formRow}>
                <label htmlFor="address">Indirizzo</label>
                <input
                  id="address"
                  name="address"
                  required
                  value={shippingForm.address}
                  onChange={(event) => setShippingForm((prev) => ({ ...prev, address: event.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <div className={styles.formRow}>
                  <label htmlFor="city">Città</label>
                  <input
                    id="city"
                    name="city"
                    required
                    value={shippingForm.city}
                    onChange={(event) => setShippingForm((prev) => ({ ...prev, city: event.target.value }))}
                  />
                </div>
                <div className={styles.formRow}>
                  <label htmlFor="zip">CAP</label>
                  <input
                    id="zip"
                    name="zip"
                    required
                    value={shippingForm.zip}
                    onChange={(event) => setShippingForm((prev) => ({ ...prev, zip: event.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <label htmlFor="notes">Note</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={shippingForm.notes}
                  onChange={(event) => setShippingForm((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </div>
              <button type="submit" className={styles.glowButton}>
                Conferma indirizzo
              </button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
