"use client";

import { useEffect, useRef, useState } from "react";

type ProductImage = {
  url: string;
  altText?: string | null;
};

type ProductVariant = {
  id: string;
  price?: {
    amount: string;
    currencyCode: string;
  } | null;
};

export type SwipeCardProduct = {
  id: string;
  title: string;
  description?: string | null;
  images?: ProductImage[] | null;
  variants?: ProductVariant[] | null;
  sector?: "eyes" | "lips" | "skin";
};

type SwipeCardProps = {
  product: SwipeCardProduct;
  onLeft: () => void;
  onRight: () => void;
};

const SWIPE_THRESHOLD = 80;

const SECTOR_LABELS: Record<string, string> = {
  eyes: "Occhi",
  lips: "Labbra",
  skin: "Viso",
};

const SECTOR_ACCENTS: Record<string, string> = {
  eyes: "bg-rose-500/90 text-white",
  lips: "bg-fuchsia-500/90 text-white",
  skin: "bg-amber-400/90 text-white",
};

export default function SwipeCard({ product, onLeft, onRight }: SwipeCardProps) {
  const [dx, setDx] = useState(0);
  const [cardHeight, setCardHeight] = useState(() => 420);
  const dragState = useRef({ startX: 0, dx: 0, active: false });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateHeight = () => {
      const viewportHeight = window.innerHeight || 0;
      const computed = Math.min(viewportHeight * 0.72, 480);
      setCardHeight(Math.max(360, Math.round(computed)));
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    window.addEventListener("orientationchange", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      window.removeEventListener("orientationchange", updateHeight);
    };
  }, []);

  function resetDrag() {
    dragState.current = { startX: 0, dx: 0, active: false };
    setDx(0);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (dragState.current.active) return;

    dragState.current = { startX: e.clientX, dx: 0, active: true };

    const handleMove = (ev: PointerEvent) => {
      if (!dragState.current.active) return;
      const delta = ev.clientX - dragState.current.startX;
      dragState.current.dx = delta;
      setDx(delta);
    };

    const cleanup = () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointercancel", handleCancel);
    };

    const handleUp = () => {
      if (!dragState.current.active) return;
      const finalDx = dragState.current.dx;
      resetDrag();
      cleanup();

      if (finalDx > SWIPE_THRESHOLD) onRight();
      else if (finalDx < -SWIPE_THRESHOLD) onLeft();
    };

    const handleCancel = () => {
      if (!dragState.current.active) return;
      resetDrag();
      cleanup();
    };

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp, { once: true });
    document.addEventListener("pointercancel", handleCancel, { once: true });
  }

  const imageUrl = product.images?.[0]?.url ?? "https://picsum.photos/seed/placeholder/800/600";
  const price = product.variants?.[0]?.price;
  const description = product.description?.trim() ?? "";
  const shortDescription = description.length > 140 ? `${description.slice(0, 140)}…` : description;
  const sector = product.sector ?? null;
  const sectorLabel = sector ? SECTOR_LABELS[sector] ?? null : null;
  const sectorAccent = sector ? SECTOR_ACCENTS[sector] ?? "bg-white/80 text-gray-800" : null;
  const rotation = Math.max(-18, Math.min(18, dx / 22));

  return (
    <div
      className="relative mx-auto w-full max-w-[420px] select-none touch-pan-y"
      style={{ minHeight: cardHeight }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[38px] bg-gradient-to-br from-white/70 via-white/30 to-white/10 blur-2xl" />
      <div
        onPointerDown={handlePointerDown}
        className="relative w-full overflow-hidden rounded-[34px] border border-white/60 bg-white/60 shadow-[0_32px_60px_-30px_rgba(244,63,94,0.55)] backdrop-blur sm:rounded-[38px]"
        style={{
          height: cardHeight,
          transform: `translateX(${dx}px) rotate(${rotation}deg)`,
          transition: dragState.current.active ? "none" : "transform .18s ease, height .3s ease",
        }}
      >
        <img
          src={imageUrl}
          alt={product.images?.[0]?.altText ?? product.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        <div className="pointer-events-none absolute left-6 top-6 flex flex-col gap-3">
          {sectorLabel && (
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${sectorAccent}`}>
              <span aria-hidden className="text-lg">•</span>
              {sectorLabel}
            </span>
          )}
          {price && (
            <span className="inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-1 text-xs font-semibold text-white shadow">
              {price.amount} {price.currencyCode}
            </span>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
          <div className="rounded-[28px] bg-white/85 p-5 shadow-lg backdrop-blur">
            <h3 className="text-2xl font-semibold text-gray-900">{product.title}</h3>
            {shortDescription && <p className="mt-2 text-sm text-gray-600">{shortDescription}</p>}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 bg-white/80 text-3xl text-gray-500 shadow-xl shadow-rose-200/50">
            ✕
          </span>
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 bg-white/80 text-3xl text-rose-500 shadow-xl shadow-rose-200/60">
            ❤️
          </span>
        </div>
      </div>
    </div>
  );
}
