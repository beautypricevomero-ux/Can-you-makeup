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
      return;
    }

    setPickedIds([]);
    setSelected([]);
    setSecondsLeft(activeTier.secs);
    setIsFinished(false);
    setCheckoutLoading(false);
    setCheckoutError(null);
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

  function swipeLeft() {
    if (!currentProduct || isFinished) return;
    setPickedIds((prev) => (prev.includes(currentProduct.id) ? prev : [...prev, currentProduct.id]));
  }

  function swipeRight() {
    if (!currentProduct || isFinished) return;
    setSelected((prev) => (prev.some((product) => product.id === currentProduct.id) ? prev : [...prev, currentProduct]));
    setPickedIds((prev) => (prev.includes(currentProduct.id) ? prev : [...prev, currentProduct.id]));
  }

  function finishNow() {
    setSecondsLeft(0);
    setIsFinished(true);
  }

  function resetGame() {
    if (!activeTier) return;
    setPickedIds([]);
    setSelected([]);
    setSecondsLeft(activeTier.secs);
    setIsFinished(false);
    setCheckoutLoading(false);
    setCheckoutError(null);
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

  if (settingsLoading) return <p>Caricamento impostazioni…</p>;
  if (settingsError)
    return (
      <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p>Errore: {settingsError}</p>
        <button className="btn" onClick={reloadSettings} type="button">
          Riprova
        </button>
      </div>
    );
  if (!settings) return null;

  const timerTotal = activeTier?.secs ?? 0;
  const feeLabel = activeTier ? activeTier.fee.toFixed(2) : "0.00";

  return (
    <Guard>
      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-900">Gioca — Tier {activeTier?.label ?? activeTierId}</h1>
            <p className="text-sm text-gray-600">
              Fee {feeLabel}€ · Tempo limite {timerTotal}s · Prodotti nel carrello: {selected.length}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.tiers.map((tier) => {
              const isActive = tier.id === activeTierId;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleTierSelect(tier.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-gray-900 text-white shadow"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  Tier {tier.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <TimerBar total={timerTotal} left={secondsLeft} />
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <span>
              Tempo rimasto: <span className="font-semibold text-gray-900">{secondsLeft}s</span>
            </span>
            <span>
              Selezionati: <span className="font-semibold text-gray-900">{selected.length}</span>
            </span>
          </div>
        </div>

        {productsError && (
          <div className="space-y-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p>Errore nel caricamento dei prodotti: {productsError}</p>
            <button className="btn" onClick={reloadProducts} type="button">
              Riprova
            </button>
          </div>
        )}

        {productsLoading && <p>Caricamento prodotti…</p>}

        {!productsLoading && !isFinished && currentProduct && (
          <div className="space-y-5">
            <SwipeCard product={currentProduct} onLeft={swipeLeft} onRight={swipeRight} />
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button className="btn w-full justify-center sm:w-auto" onClick={swipeLeft} type="button">
                👎 Scarta
              </button>
              <button className="btn w-full justify-center sm:w-auto" onClick={swipeRight} type="button">
                👍 Aggiungi al carrello
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span>Prodotti visti: {pickedIds.length}</span>
              <button onClick={finishNow} className="underline" type="button">
                Termina ora
              </button>
            </div>
          </div>
        )}

        {!productsLoading && !isFinished && !currentProduct && hasAnyProducts && (
          <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
            <p>Hai visto tutti i prodotti disponibili per questo tier.</p>
            <button className="btn" onClick={finishNow} type="button">
              Vai al riepilogo
            </button>
          </div>
        )}

        {!productsLoading && !hasAnyProducts && !productsError && (
          <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            <p>Nessun prodotto disponibile per i settori configurati.</p>
            <p>
              Aggiorna i pesi nella pagina {""}
              <Link href="/settings" className="font-medium underline">
                Settings
              </Link>{" "}
              e riprova.
            </p>
          </div>
        )}

        {isFinished && (
          <div className="space-y-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-emerald-900">Riepilogo selezione</h2>
              <p className="text-sm text-emerald-800">
                {selected.length > 0
                  ? `Hai scelto ${selected.length} prodotto${selected.length === 1 ? "" : "i"} per un totale stimato di ${formattedTotal} €.`
                  : "Tempo scaduto: non hai selezionato prodotti durante questa sessione."}
              </p>
            </div>

            {selected.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2">
                {selected.map((product) => {
                  const imageUrl = product.images?.[0]?.url ?? "https://picsum.photos/seed/placeholder/800/600";
                  const price = product.variants?.[0]?.price;
                  return (
                    <li key={product.id} className="flex gap-3 rounded-2xl bg-white/90 p-3 shadow-sm backdrop-blur">
                      <img
                        src={imageUrl}
                        alt={product.images?.[0]?.altText ?? product.title}
                        className="h-20 w-20 rounded-xl object-cover"
                        loading="lazy"
                      />
                      <div className="flex flex-1 flex-col justify-between text-sm text-gray-700">
                        <div className="space-y-1">
                          <p className="font-semibold text-gray-900">{product.title}</p>
                          {product.description && (
                            <p className="text-xs text-gray-500">{product.description}</p>
                          )}
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

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                className="btn w-full justify-center sm:w-auto"
                onClick={handleCheckout}
                type="button"
                disabled={selected.length === 0 || checkoutLoading}
              >
                {checkoutLoading ? "Apro il checkout…" : "Vai al checkout"}
              </button>
              <button className="btn w-full justify-center sm:w-auto" onClick={resetGame} type="button">
                🔄 Ricomincia il tier
              </button>
              <button className="btn w-full justify-center sm:w-auto" onClick={reloadProducts} type="button">
                ♻️ Ricarica prodotti
              </button>
            </div>

            {checkoutError && <p className="text-sm text-red-600">{checkoutError}</p>}
            <p className="text-xs text-emerald-700">Checkout mock: l’URL di destinazione è una demo.</p>
          </div>
        )}
      </section>
    </Guard>
  );
}
