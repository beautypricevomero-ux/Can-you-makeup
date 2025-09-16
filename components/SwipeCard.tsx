"use client";

import { useRef, useState } from "react";

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
};

type SwipeCardProps = {
  product: SwipeCardProduct;
  onLeft: () => void;
  onRight: () => void;
};

const SWIPE_THRESHOLD = 80;

export default function SwipeCard({ product, onLeft, onRight }: SwipeCardProps) {
  const [dx, setDx] = useState(0);
  const dragState = useRef({ startX: 0, dx: 0, active: false });

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

  return (
    <div
      onPointerDown={handlePointerDown}
      className="relative select-none touch-none rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      style={{ transform: `translateX(${dx}px) rotate(${dx / 20}deg)`, transition: dragState.current.active ? "none" : "transform .15s ease" }}
    >
      <img
        src={imageUrl}
        alt={product.images?.[0]?.altText ?? product.title}
        className="h-64 w-full rounded-xl object-cover"
        loading="lazy"
      />
      <div className="mt-3 space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
        {shortDescription && <p className="text-sm text-gray-600">{shortDescription}</p>}
        {price && (
          <p className="text-sm font-semibold text-gray-900">
            {price.amount} {price.currencyCode}
          </p>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-5 text-2xl text-gray-300">
        <span aria-hidden>👎</span>
        <span aria-hidden>👍</span>
      </div>
    </div>
  );
}
