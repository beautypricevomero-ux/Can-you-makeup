"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import styles from "./page.module.css";

type Tier = { id: string; label: string; fee: number; secs: number };
type Sector = { id: string; label: string; weight: number; handles: string[] };
type Settings = {
  tiers: Tier[];
  sectorsByTier: Record<string, Sector[]>;
};
type Product = {
  id: string;
  sector: string;
  title: string;
  description?: string;
  images?: { url: string; altText?: string }[];
  variants?: { id: string; price: { amount: string; currencyCode: string } }[];
};

type Stage = "checkout" | "playing" | "summary";
type SessionResult = "timeout" | "completed";
type Cooldown = { type: "reject" | "keep"; seconds: number };
type CheckoutFormData = {
  name: string;
  email: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

type CheckoutState = "idle" | "processing" | "error";

const TICKET_KEY = (tierId: string) => `cym-ticket-${tierId}`;

function formatPrice(amount?: string, currencyCode?: string) {
  if (!amount) return "";
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currencyCode || "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

function selectNextProduct(pool: Product[], pickedIds: string[], sectors: Sector[]) {
  const available = pool.filter((p) => !pickedIds.includes(p.id));
  if (!available.length) return null;
  if (!sectors.length) return available[0];
  const totalWeight = sectors.reduce((sum, s) => sum + s.weight, 0);
  for (let i = 0; i < 30; i += 1) {
    let ticket = Math.random() * totalWeight;
    let chosen = sectors[0];
    for (const sector of sectors) {
      ticket -= sector.weight;
      if (ticket <= 0) {
        chosen = sector;
        break;
      }
    }
    const sectorProducts = available.filter((p) => p.sector === chosen.id);
    if (sectorProducts.length) {
      return sectorProducts[Math.floor(Math.random() * sectorProducts.length)];
    }
  }
  return available[0];
}

function TimerBar({ total, left }: { total: number; left: number }) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (left / total) * 100)) : 0;
  return (
    <div className={styles.timerWrapper} role="timer" aria-live="polite">
      <div className={styles.timerBar}>
        <div className={styles.timerBarFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.timerLabel}>{left}s</span>
    </div>
  );
}

function ActionNotification({ cooldown }: { cooldown: Cooldown | null }) {
  if (!cooldown) return null;
  const isReject = cooldown.type === "reject";
  return (
    <div className={styles.notification} role="status" aria-live="assertive">
      <span className={styles.notificationIcon}>{isReject ? "⏳" : "🛒"}</span>
      <div>
        <p className={styles.notificationTitle}>
          {isReject ? "Pausa rifiuto" : "Prodotto nel carrello"}
        </p>
        <p className={styles.notificationCopy}>
          Attendi ancora <strong>{cooldown.seconds}s</strong> prima del prossimo swipe.
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
  const [dx, setDx] = useState(0);
  const startXRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    startXRef.current = event.clientX;
    activeRef.current = true;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!activeRef.current || startXRef.current === null) return;
    setDx(event.clientX - startXRef.current);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!activeRef.current || startXRef.current === null) return;
    const delta = event.clientX - startXRef.current;
    activeRef.current = false;
    startXRef.current = null;
    setDx(0);
    if (delta > 80) onKeep();
    else if (delta < -80) onReject();
  };

  const price = product.variants?.[0]?.price;

  return (
    <div
      className={`${styles.swipeCard} ${disabled ? styles.cardDisabled : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ transform: `translateX(${dx}px) rotate(${dx / 22}deg)` }}
    >
      <div className={styles.cardImageWrapper}>
        <img
          src={product.images?.[0]?.url || "https://picsum.photos/seed/makeup/640/640"}
          alt={product.title}
          className={styles.cardImage}
        />
        <span className={styles.cardBadge}>{sectorLabel || product.sector}</span>
      </div>
      <div className={styles.cardBody}>
        <h2>{product.title}</h2>
        {product.description ? (
          <p>{product.description}</p>
        ) : (
          <p>Scopri tutti i dettagli direttamente nello store Shopify.</p>
        )}
        <div className={styles.cardPrice}>{formatPrice(price?.amount, price?.currencyCode)}</div>
      </div>
      <div className={styles.cardOverlay}>
        <button
          type="button"
          className={`${styles.circleButton} ${styles.rejectButton}`}
          onClick={onReject}
          disabled={disabled}
          aria-label="Rifiuta prodotto"
        >
          ✕
        </button>
        <button
          type="button"
          className={`${styles.circleButton} ${styles.keepButton}`}
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

function CheckoutStep({
  tier,
  onSubmit,
  state,
}: {
  tier: Tier;
  onSubmit: (values: CheckoutFormData) => void;
  state: CheckoutState;
}) {
  const [values, setValues] = useState<CheckoutFormData>({
    name: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const disabled = state === "processing";

  return (
    <div className={styles.checkoutWrapper}>
      <div className={styles.checkoutIntro}>
        <h1>Prima il biglietto, poi il gioco</h1>
        <p>
          Per sbloccare il tier <strong>{tier.label}</strong> completa il checkout demo. Riceverai un link di prova e potrai
          iniziare subito a giocare.
        </p>
        <div className={styles.checkoutSummary}>
          <div>
            <span className={styles.summaryLabel}>Tier</span>
            <span className={styles.summaryValue}>{tier.label}</span>
          </div>
          <div>
            <span className={styles.summaryLabel}>Tempo di gioco</span>
            <span className={styles.summaryValue}>{tier.secs} secondi</span>
          </div>
          <div>
            <span className={styles.summaryLabel}>Totale</span>
            <span className={styles.summaryValue}>{formatPrice(String(tier.fee), "EUR")}</span>
          </div>
          <p className={styles.checkoutNote}>Checkout mock: l’URL di destinazione è una demo.</p>
        </div>
      </div>
      <form
        className={styles.checkoutForm}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(values);
        }}
      >
        <label>
          Nome e cognome
          <input
            required
            value={values.name}
            onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Maria Rossi"
            autoComplete="name"
            disabled={disabled}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            value={values.email}
            onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="maria@example.com"
            autoComplete="email"
            disabled={disabled}
          />
        </label>
        <label>
          Numero carta
          <input
            required
            value={values.cardNumber}
            onChange={(event) => setValues((prev) => ({ ...prev, cardNumber: event.target.value }))}
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            autoComplete="cc-number"
            disabled={disabled}
          />
        </label>
        <div className={styles.checkoutRow}>
          <label>
            Scadenza
            <input
              required
              value={values.expiry}
              onChange={(event) => setValues((prev) => ({ ...prev, expiry: event.target.value }))}
              placeholder="MM/AA"
              autoComplete="cc-exp"
              disabled={disabled}
            />
          </label>
          <label>
            CVV
            <input
              required
              value={values.cvv}
              onChange={(event) => setValues((prev) => ({ ...prev, cvv: event.target.value }))}
              inputMode="numeric"
              placeholder="123"
              autoComplete="cc-csc"
              disabled={disabled}
            />
          </label>
        </div>
        {state === "error" && <p className={styles.checkoutError}>Checkout non riuscito. Riprova.</p>}
        <button type="submit" className="btn" disabled={disabled}>
          {state === "processing" ? "Elaboro il pagamento…" : "Completa checkout demo"}
        </button>
      </form>
    </div>
  );
}

function SummaryView({
  tier,
  keep,
  reason,
  onRestart,
  onCheckout,
  onReload,
}: {
  tier: Tier;
  keep: Product[];
  reason: SessionResult | null;
  onRestart: () => void;
  onCheckout: () => void;
  onReload: () => void;
}) {
  return (
    <div className={styles.summaryWrapper}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryIcon}>{reason === "timeout" ? "⏳" : "🧺"}</div>
        <h1>Riepilogo selezione</h1>
        <p className={styles.summaryLead}>
          {reason === "timeout"
            ? "Tempo scaduto: non hai selezionato prodotti durante questa sessione."
            : keep.length
            ? `Hai aggiunto ${keep.length} prodotto${keep.length > 1 ? "i" : ""} al carrello del tier ${tier.label}.`
            : "Hai visto tutti i prodotti disponibili per questo tier."}
        </p>
        <div className={styles.summaryActions}>
          <button className="btn" onClick={onCheckout}>
            Vai al checkout
          </button>
          <button className="btn secondary" onClick={onRestart}>
            Ricomincia il tier
          </button>
          <button className="btn secondary" onClick={onReload}>
            Ricarica prodotti
          </button>
        </div>
      </div>
      {keep.length > 0 && (
        <div className={styles.keepList}>
          <h2>Prodotti messi da parte</h2>
          <ul>
            {keep.map((product) => (
              <li key={product.id}>
                <span>{product.title}</span>
                <span>{formatPrice(product.variants?.[0]?.price?.amount, product.variants?.[0]?.price?.currencyCode)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PlayPage({ searchParams }: { searchParams: { tier?: string } }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stage, setStage] = useState<Stage>("checkout");
  const [activeTierId, setActiveTierId] = useState<string | null>(null);
  const [pool, setPool] = useState<Product[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [keep, setKeep] = useState<Product[]>([]);
  const [current, setCurrent] = useState<Product | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [actionCooldown, setActionCooldown] = useState<Cooldown | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const tierFromParams = searchParams?.tier;

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data: Settings = await fetch("/api/settings").then((response) => response.json());
        if (ignore) return;
        setSettings(data);
        const initialTier = data.tiers.find((t) => t.id === tierFromParams) || data.tiers[0] || null;
        setActiveTierId(initialTier?.id ?? null);
      } catch {
        setSettings(null);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [tierFromParams]);

  const activeTier = useMemo(() => {
    if (!settings || !activeTierId) return null;
    return settings.tiers.find((tier) => tier.id === activeTierId) ?? null;
  }, [settings, activeTierId]);

  const sectorLabels = useMemo(() => {
    if (!settings || !activeTierId) return {} as Record<string, string>;
    const sectors = settings.sectorsByTier[activeTierId] ?? [];
    return sectors.reduce<Record<string, string>>((acc, sector) => {
      acc[sector.id] = sector.label;
      return acc;
    }, {} as Record<string, string>);
  }, [settings, activeTierId]);

  const finishRound = useCallback(
    (reason: SessionResult) => {
      setStage("summary");
      setResult(reason);
      setCurrent(null);
      setActionCooldown(null);
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    },
    []
  );

  const triggerCooldown = useCallback((type: "reject" | "keep") => {
    const duration = type === "reject" ? 10 : 30;
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
      cooldownRef.current = null;
    }
    setActionCooldown({ type, seconds: duration });
    const interval = setInterval(() => {
      setActionCooldown((prev) => {
        if (!prev) {
          clearInterval(interval);
          return null;
        }
        if (prev.seconds <= 1) {
          clearInterval(interval);
          return null;
        }
        return { ...prev, seconds: prev.seconds - 1 };
      });
    }, 1000);
    cooldownRef.current = interval;
  }, []);

  const startRound = useCallback(
    async (tierId: string) => {
      if (!settings) return;
      const tier = settings.tiers.find((t) => t.id === tierId);
      const sectors = settings.sectorsByTier[tierId] ?? [];
      setStage("playing");
      setResult(null);
      setPicked([]);
      setKeep([]);
      setPool([]);
      setCurrent(null);
      setFetchError(null);
      setActionCooldown(null);
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      setSecondsLeft(tier?.secs ?? 0);
      setIsFetching(true);
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
        const next = selectNextProduct(products, [], sectors);
        setCurrent(next);
        if (!next) {
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

  useEffect(() => {
    if (stage !== "playing") return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage === "playing" && secondsLeft === 0) {
      finishRound("timeout");
    }
  }, [stage, secondsLeft, finishRound]);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!settings || !activeTierId || stage !== "checkout") return;
    const paid = typeof window !== "undefined" && window.localStorage.getItem(TICKET_KEY(activeTierId)) === "paid";
    if (paid) {
      void startRound(activeTierId);
    }
  }, [settings, activeTierId, stage, startRound]);

  const handleTierChange = useCallback(
    (tierId: string) => {
      if (!settings || tierId === activeTierId) return;
      const hasTicket = typeof window !== "undefined" && window.localStorage.getItem(TICKET_KEY(tierId)) === "paid";
      setActiveTierId(tierId);
      setResult(null);
      setPicked([]);
      setKeep([]);
      setPool([]);
      setCurrent(null);
      setActionCooldown(null);
      setSecondsLeft(0);
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
      if (hasTicket) {
        void startRound(tierId);
      } else {
        setStage("checkout");
      }
    },
    [settings, activeTierId, startRound]
  );

  const handleCheckoutSubmit = useCallback(
    async (formValues: CheckoutFormData) => {
      if (!activeTierId || !settings) return;
      setCheckoutState("processing");
      try {
        const response = await fetch("/api/shopify/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variantIds: [],
            customer: formValues,
            tier: activeTierId,
          }),
        });
        if (!response.ok) throw new Error("Checkout error");
        const data = await response.json();
        if (data?.webUrl) {
          window.open(data.webUrl, "_blank", "noopener,noreferrer");
        }
        if (typeof window !== "undefined") {
          window.localStorage.setItem(TICKET_KEY(activeTierId), "paid");
        }
        setCheckoutState("idle");
        await startRound(activeTierId);
      } catch (error) {
        setCheckoutState("error");
      }
    },
    [activeTierId, settings, startRound]
  );

  const handleReject = useCallback(() => {
    if (!settings || !activeTierId || !current || stage !== "playing" || actionCooldown) return;
    const sectors = settings.sectorsByTier[activeTierId] ?? [];
    const newPicked = [...picked, current.id];
    setPicked(newPicked);
    const next = selectNextProduct(pool, newPicked, sectors);
    if (next) {
      setCurrent(next);
    } else {
      finishRound("completed");
    }
    triggerCooldown("reject");
  }, [settings, activeTierId, current, stage, actionCooldown, picked, pool, finishRound, triggerCooldown]);

  const handleKeep = useCallback(() => {
    if (!settings || !activeTierId || !current || stage !== "playing" || actionCooldown) return;
    const sectors = settings.sectorsByTier[activeTierId] ?? [];
    const newPicked = [...picked, current.id];
    setPicked(newPicked);
    setKeep((prev) => [...prev, current]);
    const next = selectNextProduct(pool, newPicked, sectors);
    if (next) {
      setCurrent(next);
    } else {
      finishRound("completed");
    }
    triggerCooldown("keep");
  }, [settings, activeTierId, current, stage, actionCooldown, picked, pool, finishRound, triggerCooldown]);

  const handleRestart = useCallback(() => {
    if (!activeTierId) return;
    void startRound(activeTierId);
  }, [activeTierId, startRound]);

  if (!settings || !activeTier) {
    return <p>Caricamento impostazioni…</p>;
  }

  const hasTicket = typeof window !== "undefined" && window.localStorage.getItem(TICKET_KEY(activeTier.id)) === "paid";

  return (
    <section className={styles.page}>
      <ActionNotification cooldown={actionCooldown} />
      <div className={styles.tierPicker}>
        {settings.tiers.map((tier) => (
          <button
            key={tier.id}
            type="button"
            className={`${styles.tierButton} ${tier.id === activeTier.id ? styles.tierButtonActive : ""}`}
            onClick={() => handleTierChange(tier.id)}
          >
            <span>{tier.label}</span>
            <small>{tier.secs}s • {formatPrice(String(tier.fee), "EUR")}</small>
          </button>
        ))}
      </div>

      {stage === "checkout" && (
        <CheckoutStep tier={activeTier} onSubmit={handleCheckoutSubmit} state={checkoutState} />
      )}

      {stage === "playing" && (
        <div className={styles.gameArea}>
          <header className={styles.gameHeader}>
            <div>
              <h1>Tier {activeTier.label}</h1>
              <p className={styles.gameSubtitle}>Hai scelto il biglietto {hasTicket ? "attivo" : "demo"}. Gioca finché il tempo lo permette.</p>
            </div>
            <TimerBar total={activeTier.secs} left={secondsLeft} />
          </header>
          <div className={styles.cardStage}>
            {isFetching && !current ? (
              <div className={styles.loadingCard}>Caricamento prodotti…</div>
            ) : current ? (
              <SwipeCard
                product={current}
                disabled={!!actionCooldown}
                onReject={handleReject}
                onKeep={handleKeep}
                sectorLabel={sectorLabels[current.sector]}
              />
            ) : (
              <div className={styles.loadingCard}>Nessun prodotto disponibile per questo tier.</div>
            )}
          </div>
          <footer className={styles.gameFooter}>
            <div>
              <strong>{keep.length}</strong> prodotti nel carrello demo
            </div>
            <div>Swipe a sinistra per scartare, a destra per mettere nel carrello.</div>
          </footer>
        </div>
      )}

      {stage === "summary" && (
        <SummaryView
          tier={activeTier}
          keep={keep}
          reason={result}
          onRestart={handleRestart}
          onCheckout={() => setStage("checkout")}
          onReload={() => {
            if (activeTierId) {
              void startRound(activeTierId);
            }
          }}
        />
      )}

      {fetchError && <p className={styles.error}>{fetchError}</p>}
    </section>
  );
}
