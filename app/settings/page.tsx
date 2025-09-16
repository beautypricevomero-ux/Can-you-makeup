"use client";

import { useEffect, useMemo, useState } from "react";

type Tier = {
  id: string;
  label: string;
  fee: number;
  secs: number;
};

type Sector = {
  id: string;
  label: string;
  weight: number;
  handles: string[];
};

type Settings = {
  tiers: Tier[];
  sectorsByTier: Record<string, Sector[]>;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Impossibile caricare le impostazioni");
        const data: Settings = await res.json();
        if (active) {
          setSettings(data);
          setError(null);
        }
      } catch (err) {
        if (active) setError((err as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  const totals = useMemo(() => {
    if (!settings) return {} as Record<string, number>;
    return Object.fromEntries(
      Object.entries(settings.sectorsByTier).map(([tierId, sectors]) => [
        tierId,
        sectors.reduce((sum, sector) => sum + sector.weight, 0),
      ]),
    );
  }, [settings]);

  function updateSector(tierId: string, index: number, patch: Partial<Sector>) {
    setSettings((prev) => {
      if (!prev) return prev;
      const nextSectors = (prev.sectorsByTier[tierId] ?? []).map((sector, i) =>
        i === index ? { ...sector, ...patch } : sector,
      );
      return {
        ...prev,
        sectorsByTier: {
          ...prev.sectorsByTier,
          [tierId]: nextSectors,
        },
      };
    });
  }

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Salvataggio non riuscito");
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/75 p-5 text-sm text-gray-600 shadow-lg backdrop-blur-sm sm:p-6">
        Caricamento impostazioni…
      </section>
    );
  if (error && !settings)
    return (
      <section className="space-y-3 rounded-[28px] border border-rose-200/70 bg-rose-50/80 p-5 text-sm text-rose-700 shadow-lg sm:p-6">
        <p>Errore: {error}</p>
        <button className="btn" onClick={reload} type="button">
          Riprova
        </button>
      </section>
    );

  if (!settings) return null;

  return (
    <section className="relative overflow-hidden rounded-[34px] border border-white/60 bg-white/75 p-4 shadow-2xl backdrop-blur-sm sm:rounded-[40px] sm:p-6 md:p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Impostazioni di gioco</h1>
        <p className="text-sm text-gray-600">
          Modifica nomi dei settori, pesi percentuali e collegamenti alle collection Shopify. I cambiamenti sono salvati in memoria per la demo.
        </p>
      </header>

      <div className="mt-6 space-y-6">
        {settings.tiers.map((tier) => (
          <div key={tier.id} className="space-y-4 rounded-2xl border border-gray-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Tier {tier.label}</h2>
                <p className="text-sm text-gray-500">
                  Fee {tier.fee.toFixed(2)}€ · Tempo limite {tier.secs}s
                </p>
              </div>
              <p className="text-sm font-medium text-gray-600">Peso totale: {totals[tier.id] ?? 0}</p>
            </div>

            <div className="space-y-4">
              {settings.sectorsByTier[tier.id]?.map((sector, index) => (
                <div key={sector.id} className="grid gap-3 rounded-xl border border-gray-100 bg-white/80 p-4 sm:grid-cols-3">
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Nome settore
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm"
                      value={sector.label}
                      onChange={(event) => updateSector(tier.id, index, { label: event.target.value })}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    Peso (%)
                    <input
                      type="number"
                      min={0}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm"
                      value={sector.weight}
                      onChange={(event) =>
                        updateSector(tier.id, index, { weight: Math.max(0, Number(event.target.value) || 0) })
                      }
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 sm:col-span-1">
                    Collection handles
                    <input
                      className="rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm"
                      placeholder="collection-a, collection-b"
                      value={sector.handles.join(", ")}
                      onChange={(event) =>
                        updateSector(tier.id, index, {
                          handles: event.target.value
                            .split(",")
                            .map((handle) => handle.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button className="btn w-full justify-center sm:w-auto" onClick={saveSettings} disabled={saving} type="button">
          {saving ? "Salvataggio…" : "Salva impostazioni"}
        </button>
        {saved && <span className="text-sm text-green-600">Impostazioni salvate ✔️</span>}
        {error && settings && <span className="text-sm text-red-600">{error}</span>}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Nota: per un’integrazione reale salva questi dati in Shopify (metafields o app) e sostituisci le API mock.
      </p>
    </section>
  );
}
