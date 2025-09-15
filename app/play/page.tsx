"use client";

import { useEffect, useMemo, useState, useRef } from "react";

/* ------------------ Tipi ------------------ */
type Tier = { id: string; label: string; fee: number; secs: number };
type Sector = { id: string; label: string; weight: number; handles: string[] };
type Settings = {
  tiers: Tier[];
  sectorsByTier: Record<string, Sector[]>;
};
type Product = {
  id: string;
  sector: string; // "eyes" | "lips" | "skin" ...
  title: string;
  description?: string;
  images?: { url: string; altText?: string }[];
  variants?: { id: string; price: { amount: string; currencyCode: string } }[];
};

/* ------------------ Utils: estrazione pesata ------------------ */
function drawSectorId(sectors: Sector[]) {
  const total = sectors.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const s of sectors) {
    if ((r -= s.weight) <= 0) return s.id;
  }
  return sectors[sectors.length - 1]?.id ?? "";
}

/* ------------------ TimerBar (inline) ------------------ */
function TimerBar({ total, onEnd }: { total: number; onEnd: () => void }) {
  const [left, setLeft] = useState(total);
  useEffect(() => {
    const i = setInterval(() => setLeft((x) => x - 1), 1000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (left <= 0) onEnd();
  }, [left, onEnd]);
  const pct = Math.max(0, (left / total) * 100);
  return (
    <div style={{ width: "100%", height: 8, background: "#eee", borderRadius: 999 }}>
      <div
        style={{
          width: `${pct}%`,
          height: 8,
          background: "#111",
          borderRadius: 999,
          transition: "width .5s linear",
        }}
      />
    </div>
  );
}

/* ------------------ SwipeCard (inline) ------------------ */
function SwipeCard({
  product,
  onLeft,
  onRight,
}: {
  product: Product;
  onLeft: () => void;
  onRight: () => void;
}) {
  const [dx, setDx] = useState(0);
  const startXRef = useRef<number | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    startXRef.current = e.clientX;
    function move(ev: PointerEvent) {
      if (startXRef.current == null) return;
      setDx(ev.clientX - startXRef.current);
    }
    function up() {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      if (dx > 80) onRight();
      else if (dx < -80) onLeft();
      setDx(0);
      startXRef.current = null;
    }
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        userSelect: "none",
        touchAction: "none",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
        transform: `translateX(${dx}px) rotate(${dx / 20}deg)`,
        transition: dx === 0 ? "transform .15s ease" : "none",
        position: "relative",
      }}
    >
      <img
        src={product.images?.[0]?.url || "https://picsum.photos/seed/placeholder/800/600"}
        alt={product.title}
        style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 12, background: "#f3f4f6" }}
      />
      <div style={{ marginTop: 12 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>{product.title}</h3>
        <p style={{ opacity: 0.7, marginTop: 4 }}>
          {(product.description || "").slice(0, 120)}{product.description && product.description.length > 120 ? "..." : ""}
        </p>
        <p style={{ marginTop: 6, fontWeight: 600 }}>
          {product.variants?.[0]?.price?.amount} {product.variants?.[0]?.price?.currencyCode}
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: 16,
          pointerEvents: "none",
          color: "rgba(0,0,0,.25)",
          fontSize: 22,
        }}
      >
        <span>👎</span>
        <span>👍</span>
      </div>
    </div>
  );
}

/* ------------------ Guard semplice (inline) ------------------ */
function Guard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/shopify/verify-pass")
      .then((r) => r.json())
      .then((d) => setOk(!!d.ok))
      .catch(() => setOk(true)); // fallback per la demo
  }, []);
  if (ok === null) return <p>Verifica accesso al gioco…</p>;
  if (!ok)
    return (
      <div>
        <p>Per giocare devi acquistare il <b>Game Pass</b>.</p>
        <a href="/#pass" style={{ display: "inline-block", marginTop: 8, padding: "8px 12px", border: "1px solid #ccc", borderRadius: 8 }}>
          Acquista il Pass
        </a>
      </div>
    );
  return <>{children}</>;
}

/* ------------------ Pagina Gioco ------------------ */
export default function PlayPage({ searchParams }: { searchParams: { tier?: string } }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pool, setPool] = useState<Product[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [keep, setKeep] = useState<Product[]>([]);
  const [time, setTime] = useState(90);
  const tier = searchParams?.tier || "t30";

  // carica settings + prodotti mock
  useEffect(() => {
    (async () => {
      const s: Settings = await fetch("/api/settings").then((r) => r.json());
      setSettings(s);
      setTime(s.tiers.find((t) => t.id === tier)?.secs ?? 90);

      const sectors = s.sectorsByTier[tier];
      const res = await fetch("/api/shopify/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectors }),
      });
      const { products } = await res.json();
      setPool(products);
    })().catch(() => {});
  }, [tier]);

  // prodotto corrente estratto pesando i settori
  const current = useMemo(() => {
    if (!settings || pool.length === 0) return null;
    const sectors = settings.sectorsByTier[tier];
    for (let i = 0; i < 100; i++) {
      const sid = drawSectorId(sectors);
      const candidates = pool.filter((p) => p.sector === sid && !picked.includes(p.id));
      if (candidates.length) {
        const p = candidates[Math.floor(Math.random() * candidates.length)];
        return p;
      }
    }
    const rest = pool.filter((p) => !picked.includes(p.id));
    return rest[0] || null;
  }, [settings, pool, picked, tier]);

  function swipeLeft() {
    if (current) setPicked((prev) => [...prev, current.id]);
  }
  function swipeRight() {
    if (current) {
      setKeep((k) => [...k, current]);
      setPicked((prev) => [...prev, current.id]);
    }
  }

  async function onEnd() {
    if (!keep.length) {
      alert("Tempo scaduto! Nessun prodotto selezionato.");
      return;
    }
    const variantIds = keep.map((k) => k.variants?.[0]?.id).filter(Boolean);
    const payload = {
      variantIds,
      discountCode: process.env.NEXT_PUBLIC_DEFAULT_DISCOUNT_CODE, // opzionale
    };
    const res = await fetch("/api/shopify/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const { webUrl } = await res.json();
    window.location.href = webUrl;
  }

  if (!settings) return <p>Caricamento impostazioni…</p>;

  return (
    <Guard>
      <section style={{ display: "grid", gap: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>Gioca — Tier {tier}</h1>
        <TimerBar total={time} onEnd={onEnd} />

        {current ? (
          <div style={{ display: "grid", gap: 12 }}>
            <SwipeCard product={current} onLeft={swipeLeft} onRight={swipeRight} />
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={swipeLeft}
                style={{ padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8 }}
              >
                Non mi piace
              </button>
              <button
                onClick={swipeRight}
                style={{ padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8 }}
              >
                Aggiungi al carrello
              </button>
            </div>
            <p style={{ opacity: 0.7, textAlign: "center" }}>Selezionati: {keep.length}</p>
          </div>
        ) : (
          <div>
            <p>Hai visto tutti i prodotti disponibili per questo tier.</p>
            <button
              onClick={onEnd}
              style={{ marginTop: 8, padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8 }}
            >
              Vai al checkout
            </button>
          </div>
        )}
      </section>
    </Guard>
  );
}