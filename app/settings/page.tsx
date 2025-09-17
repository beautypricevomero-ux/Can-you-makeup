"use client";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ fetch("/api/settings").then(r=>r.json()).then(setData); }, []);
  if (!data) return <p>Caricamento…</p>;

  function updateTierSector(tierId:string, idx:number, key:string, value:any) {
    setData((d:any)=>({
      ...d,
      sectorsByTier: {
        ...d.sectorsByTier,
        [tierId]: d.sectorsByTier[tierId].map((s:any,i:number)=> i===idx ? { ...s, [key]: value } : s)
      }
    }));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/settings", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(data) });
    setSaving(false);
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Impostazioni gioco</h1>
      {data.tiers.map((t:any) => (
        <div key={t.id} className="border rounded p-4 space-y-3">
          <h3 className="font-medium">{t.label} — {t.fee}€ (tempo {t.secs}s)</h3>
          {data.sectorsByTier[t.id].map((s:any, idx:number)=>(
            <div key={s.id} className="grid sm:grid-cols-3 gap-3">
              <input className="border p-2 rounded" value={s.label} onChange={e=>updateTierSector(t.id, idx, "label", e.target.value)} />
              <input className="border p-2 rounded" type="number" value={s.weight} onChange={e=>updateTierSector(t.id, idx, "weight", Number(e.target.value))} />
              <input className="border p-2 rounded" placeholder="collection handles, separati da virgola"
                     value={s.handles.join(",")} onChange={e=>updateTierSector(t.id, idx, "handles", e.target.value.split(",").map(x=>x.trim()))} />
            </div>
          ))}
        </div>
      ))}
      <button className="btn" onClick={save} disabled={saving}>{saving ? "Salvo…" : "Salva impostazioni"}</button>
      <p className="text-sm opacity-70">Suggerimento: mappa ogni settore a una o più <b>collection</b> Shopify.</p>
    </section>
  );
}
