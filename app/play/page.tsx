"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Guard from "@/components/Guard";
import TimerBar from "@/components/TimerBar";
import SwipeCard, { type SwipeCardProduct } from "@/components/SwipeCard";
import { drawSectorId, type SectorConfig } from "@/weighted";

type Tier = {
  id: string;
  label: string;
  fee: number;
  secs: number;
};

type Sector = SectorConfig;

type Settings = {
  tiers: Tier[];
  sectorsByTier: Record<string, Sector[]>;
};

type Product = SwipeCardProduct & {
  sector: "eyes" | "lips" | "skin";
};

type FlashTone = "negative" | "positive";

type FlashMessage = {
  id: number;
  message: string;
  tone: FlashTone;
};

const SECTOR_NAMES: Record<Product["sector"], string> = {
  eyes: "Occhi",
  lips: "Labbra",
  skin: "Viso",
};

export default function PlayPage({ searchParams }: { searchParams?: { tier?: string } }) {
  const tierParam = searchParams?.tier;
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [settingsReloadKey, setSettingsReloadKey] = useState(0);
  const [productsReloadKey, setProductsReloadKey] = useState(0);
  const [manualTierId, setManualTierId] = useState<string | null>(null);
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  useEffect(() => {
    let active = true;

    setSettingsLoading(true);

    (async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Impossibile caricare le impostazioni");
        const data: Settings = await res.json();
        if (!active) return;
        setSettings(data);
        setSettingsError(null);
      } catch (error) {
        if (!active) return;
        setSettings(null);
        setSettingsError((error as Error).message);
      } finally {
        if (active) setSettingsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [settingsReloadKey]);

  useEffect(() => {
    let active = true;

    setProductsLoading(true);
    setProductsError(null);

    (async () => {
      try {
        const res = await fetch("/api/shopify/products", { cache: "no-store" });
        if (!res.ok) throw new Error("Impossibile caricare i prodotti mock");
        const data: { products: Product[] } = await res.json();
        if (!active) return;
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (error) {
        if (!active) return;
        setProducts([]);
        setProductsError((error as Error).message);
      } finally {
        if (active) setProductsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [productsReloadKey]);

  useEffect(() => {
    if (!settings) return;
    const validIds = new Set(settings.tiers.map((tier) => tier.id));
    setManualTierId((current) => (current && validIds.has(current) ? current : null));
  }, [settings]);

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(null), 2400);
    return () => window.clearTimeout(id);
  }, [flash]);

  const activeTierId = useMemo(() => {
    if (!settings) return tierParam ?? "t30";
    const validIds = new Set(settings.tiers.map((tier) => tier.id));
    if (manualTierId && validIds.has(manualTierId)) return manualTierId;
    if (tierParam && validIds.has(tierParam)) return tierParam;
    return settings.tiers[0]?.id ?? "t30";
  }, [manualTierId, settings, tierParam]);

  const activeTier = settings?.tiers.find((tier) => tier.id === activeTierId) ?? null;

  useEffect(() => {
    if (!activeTier) {
      setPickedIds([]);
      setSelected([]);
      setSecondsLeft(0);
      setIsFinished(false);
      setCheckoutLoading(false);
      setCheckoutError(null);
      setFlash(null);
      return;
    }

    setPickedIds([]);
    setSelected([]);
    setSecondsLeft(activeTier.secs);
    setIsFinished(false);
    setCheckoutLoading(false);
    setCheckoutError(null);
    setFlash(null);
  }, [activeTierId, activeTier?.secs, productsReloadKey, settingsReloadKey]);

  const sectorsForTier = useMemo(() => {
    if (!settings) return [] as Sector[];
    return settings.sectorsByTier[activeTierId] ?? [];
  }, [activeTierId, settings]);

  const filteredProducts = useMemo(() => {
    if (sectorsForTier.length === 0) return products;
    const allowed = new Set(sectorsForTier.map((sector) => sector.id));
    return products.filter((product) => allowed.has(product.sector));
  }, [products, sectorsForTier]);

  const remainingProducts = useMemo(() => {
    if (filteredProducts.length === 0) return [] as Product[];
    const seen = new Set(pickedIds);
    return filteredProducts.filter((product) => !seen.has(product.id));
  }, [filteredProducts, pickedIds]);

  const remainingBySector = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const product of remainingProducts) {
      if (!map[product.sector]) map[product.sector] = [];
      map[product.sector].push(product);
    }
    return map;
  }, [remainingProducts]);

  const hasAnyProducts = filteredProducts.length > 0;
  const hasRemainingProducts = remainingProducts.length > 0;

  useEffect(() => {
    if (isFinished) return;
    if (!activeTier) return;
    if (secondsLeft <= 0) {
      setSecondsLeft(0);
      setIsFinished(true);
      return;
    }

    const id = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearTimeout(id);
  }, [secondsLeft, isFinished, activeTier]);

  useEffect(() => {
    if (isFinished) return;
    if (productsLoading) return;
    if (!hasAnyProducts) return;
    if (!hasRemainingProducts) {
      setIsFinished(true);
      setSecondsLeft(0);
    }
  }, [isFinished, productsLoading, hasAnyProducts, hasRemainingProducts]);

  const currentProduct = useMemo(() => {
    if (isFinished) return null;
    if (!hasRemainingProducts) return null;
    if (sectorsForTier.length === 0) {
      return remainingProducts[Math.floor(Math.random() * remainingProducts.length)];
    }

    for (let attempt = 0; attempt < 50; attempt += 1) {
      const sectorId = drawSectorId(sectorsForTier);
      const candidates = remainingBySector[sectorId];
      if (candidates && candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    return remainingProducts[Math.floor(Math.random() * remainingProducts.length)];
  }, [hasRemainingProducts, isFinished, remainingBySector, remainingProducts, sectorsForTier]);

  const selectedTotal = useMemo(() => {
    return selected.reduce((sum, product) => {
      const amount = Number.parseFloat(product.variants?.[0]?.price?.amount ?? "0");
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);
  }, [selected]);

  const formattedTotal = useMemo(() => {
    return selectedTotal.toLocaleString("it-IT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [selectedTotal]);

  const reloadSettings = () => setSettingsReloadKey((key) => key + 1);
  const reloadProducts = () => setProductsReloadKey((key) => key + 1);

  function showFlash(message: string, tone: FlashTone) {
    setFlash({ id: Date.now(), message, tone });
  }

  function applyPenalty(amount: number, message: string, tone: FlashTone) {
    setSecondsLeft((prev) => Math.max(0, prev - amount));
    showFlash(message, tone);
  }

  function swipeLeft() {
    if (!currentProduct || isFinished) return;
    setPickedIds((prev) => {
      if (prev.includes(currentProduct.id)) return prev;
      applyPenalty(10, "-10s! Scartando un prodotto perdi tempo prezioso.", "negative");
      return [...prev, currentProduct.id];
    });
  }

  function swipeRight() {
    if (!currentProduct || isFinished) return;
    let added = false;
    setSelected((prev) => {
      if (prev.some((product) => product.id === currentProduct.id)) return prev;
      added = true;
      return [...prev, currentProduct];
    });
    setPickedIds((prev) => {
      if (prev.includes(currentProduct.id)) return prev;
      return [...prev, currentProduct.id];
    });
    if (added) {
      applyPenalty(30, "-30s! Hai aggiunto un prodotto al carrello: il timer accelera.", "positive");
    }
  }

  function finishNow() {
    setSecondsLeft(0);
    setIsFinished(true);
    setFlash(null);
  }

  function resetGame() {
    if (!activeTier) return;
    setPickedIds([]);
    setSelected([]);
    setSecondsLeft(activeTier.secs);
    setIsFinished(false);
    setCheckoutLoading(false);
    setCheckoutError(null);
    setFlash(null);
  }

  function handleTierSelect(id: string) {
    if (id === activeTierId) {
      resetGame();
    } else {
      setManualTierId(id);
    }
  }

  async function handleCheckout() {
    if (selected.length === 0) return;
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const variantIds = selected
        .map((product) => product.variants?.[0]?.id)
        .filter((id): id is string => Boolean(id));

      const res = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantIds }),
      });

      if (!res.ok) throw new Error("Checkout mock non disponibile");
      const data: { webUrl: string } = await res.json();
      window.location.href = data.webUrl;
    } catch (error) {
      setCheckoutError((error as Error).message);
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (settingsLoading)
    return (
      <Guard>
        <div className="rounded-[32px] border border-white/60 bg-white/80 p-6 text-center text-sm text-gray-600 shadow-lg shadow-rose-100/50">
          Caricamento impostazioni…
        </div>
      </Guard>
    );

  if (settingsError)
    return (
      <Guard>
        <div className="space-y-4 rounded-[32px] border border-rose-200/70 bg-rose-50/80 p-6 text-sm text-rose-700 shadow-lg">
          <p>Errore: {settingsError}</p>
          <button className="btn" onClick={reloadSettings} type="button">
            Riprova
          </button>
        </div>
      </Guard>
    );

  if (!settings) return null;

  const timerTotal = activeTier?.secs ?? 0;
  const feeLabel = activeTier ? activeTier.fee.toFixed(2) : "0.00";
  const summaryIcon = selected.length > 0 ? "💖" : "⌛";
  const summaryText =
    selected.length > 0
      ? `Hai scelto ${selected.length} prodotto${selected.length === 1 ? "" : "i"} per un totale stimato di ${formattedTotal} €.`
      : "Tempo scaduto: non hai selezionato prodotti durante questa sessione.";

  return (
    <Guard>
      <section className="relative overflow-hidden rounded-[34px] border border-white/60 bg-white/70 p-4 shadow-2xl backdrop-blur-lg sm:rounded-[40px] sm:p-6 md:p-8">
        <div className="pointer-events-none absolute -left-28 top-10 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />

        {flash && (
          <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2 sm:top-6">
            <div
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur ${
                flash.tone === "negative" ? "bg-rose-500/90" : "bg-emerald-500/90"
              }`}
              role="status"
              aria-live="assertive"
            >
              <span aria-hidden>{flash.tone === "negative" ? "⚡" : "💖"}</span>
              <span>{flash.message}</span>
            </div>
          </div>
        )}

        <div className="relative space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-400">Sessione makeup</p>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Gioca — Tier {activeTier?.label ?? activeTierId}</h1>
              <p className="text-sm text-gray-600">
                Fee {feeLabel}€ · Tempo iniziale {timerTotal}s · Prodotti nel carrello {selected.length}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {settings.tiers.map((tier) => {
                const isActive = tier.id === activeTierId;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => handleTierSelect(tier.id)}
                    aria-pressed={isActive}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 ${
                      isActive
                        ? "bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-400 text-white shadow-lg shadow-rose-200/70"
                        : "border border-white/70 bg-white/70 text-gray-700 shadow-sm hover:-translate-y-0.5 hover:text-rose-500"
                    }`}
                  >
                    Tier {tier.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <TimerBar total={timerTotal} left={secondsLeft} />
            <div className="grid grid-cols-2 gap-3 text-[0.7rem] font-medium text-gray-500 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:text-xs md:text-sm">
              <span className="text-gray-600">
                Tempo rimasto: <span className="font-semibold text-gray-900">{secondsLeft}s</span>
              </span>
              <span className="text-gray-600">
                Prodotti in carrello: <span className="font-semibold text-gray-900">{selected.length}</span>
              </span>
              <span className="text-gray-600">
                Prodotti visti: <span className="font-semibold text-gray-900">{pickedIds.length}</span>
              </span>
            </div>
          </div>

          {productsError && (
            <div className="space-y-4 rounded-[28px] border border-rose-200/70 bg-rose-50/80 p-6 text-sm text-rose-700 shadow-lg">
              <p>Errore nel caricamento dei prodotti: {productsError}</p>
              <button className="btn" onClick={reloadProducts} type="button">
                Riprova
              </button>
            </div>
          )}

          {productsLoading && (
            <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 text-center text-sm text-gray-600 shadow-inner">
              Caricamento prodotti…
            </div>
          )}

          {!productsLoading && !isFinished && currentProduct && (
            <div className="space-y-6 sm:space-y-8">
              <SwipeCard product={currentProduct} onLeft={swipeLeft} onRight={swipeRight} />
              <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
                <div className="flex w-full max-w-[160px] flex-col items-center gap-2 sm:w-auto sm:gap-3">
                  <button
                    className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 bg-white/85 text-2xl text-gray-500 shadow-[0_20px_45px_-20px_rgba(15,23,42,0.4)] transition hover:-translate-y-1 sm:h-20 sm:w-20 sm:text-3xl"
                    onClick={swipeLeft}
                    type="button"
                    aria-label="Scarta prodotto"
                  >
                    ✕
                  </button>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gray-500 sm:text-xs">Scarta</span>
                </div>
                <div className="flex w-full max-w-[160px] flex-col items-center gap-2 sm:w-auto sm:gap-3">
                  <button
                    className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/80 bg-gradient-to-br from-rose-500 via-fuchsia-500 to-amber-400 text-3xl text-white shadow-[0_28px_60px_-22px_rgba(244,63,94,0.6)] transition hover:-translate-y-1 sm:h-24 sm:w-24"
                    onClick={swipeRight}
                    type="button"
                    aria-label="Aggiungi al carrello"
                  >
                    ❤️
                  </button>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-rose-500 sm:text-xs">Aggiungi</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 sm:justify-between">
                <span className="font-medium text-gray-600">Prodotti visti: {pickedIds.length}</span>
                <button
                  onClick={finishNow}
                  className="font-semibold text-rose-500 underline decoration-dotted decoration-rose-400/70 transition hover:text-rose-600"
                  type="button"
                >
                  Termina ora
                </button>
              </div>
            </div>
          )}

          {!productsLoading && !isFinished && !currentProduct && hasAnyProducts && (
            <div className="space-y-4 rounded-[28px] border border-emerald-200/70 bg-emerald-50/80 p-6 text-sm text-emerald-700 shadow-lg">
              <p>Hai visto tutti i prodotti disponibili per questo tier.</p>
              <button className="btn" onClick={finishNow} type="button">
                Vai al riepilogo
              </button>
            </div>
          )}

          {!productsLoading && !hasAnyProducts && !productsError && (
            <div className="space-y-3 rounded-[28px] border border-amber-200/70 bg-amber-50/80 p-6 text-sm text-amber-700 shadow-lg">
              <p>Nessun prodotto disponibile per i settori configurati.</p>
              <p>
                Aggiorna i pesi nella pagina
                {" "}
                <Link href="/settings" className="font-semibold text-amber-600 underline">
                  Settings
                </Link>
                {" "}
                e riprova.
              </p>
            </div>
          )}

          {isFinished && (
            <div className="space-y-8 rounded-[32px] border border-emerald-200/70 bg-white/85 p-6 text-center shadow-xl backdrop-blur sm:p-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 shadow-inner">
                {summaryIcon}
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-900">Riepilogo selezione</h2>
                <p className="text-sm text-emerald-800">{summaryText}</p>
              </div>

              {selected.length > 0 && (
                <ul className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:max-h-none sm:grid-cols-2">
                  {selected.map((product) => {
                    const imageUrl = product.images?.[0]?.url ?? "https://picsum.photos/seed/placeholder/800/600";
                    const price = product.variants?.[0]?.price;
                    const sectorLabel = SECTOR_NAMES[product.sector];
                    return (
                      <li key={product.id} className="flex gap-3 rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                        <img
                          src={imageUrl}
                          alt={product.images?.[0]?.altText ?? product.title}
                          className="h-20 w-20 rounded-2xl object-cover"
                          loading="lazy"
                        />
                        <div className="flex flex-1 flex-col justify-between text-left text-sm text-gray-700">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">{sectorLabel}</p>
                            <p className="font-semibold text-gray-900">{product.title}</p>
                            {product.description && <p className="text-xs text-gray-500">{product.description}</p>}
                          </div>
                          {price && (
                            <p className="text-sm font-semibold text-gray-900">
                              {price.amount} {price.currencyCode}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleCheckout}
                  type="button"
                  disabled={selected.length === 0 || checkoutLoading}
                >
                  {checkoutLoading ? "Apro il checkout…" : "Vai al checkout"}
                </button>
                <button className="btn justify-center" onClick={resetGame} type="button">
                  🔄 Ricomincia il tier
                </button>
                <button className="btn justify-center" onClick={reloadProducts} type="button">
                  ♻️ Ricarica prodotti
                </button>
              </div>

              {checkoutError && <p className="text-sm text-rose-600">{checkoutError}</p>}
              <p className="text-xs text-emerald-700">Checkout mock: l’URL di destinazione è una demo.</p>
            </div>
          )}
        </div>
      </section>
    </Guard>
  );
}
