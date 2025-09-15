"use client";
import { useRef, useState } from "react";

export default function SwipeCard({ product, onLeft, onRight }:{
  product: any; onLeft:()=>void; onRight:()=>void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dx, setDx] = useState(0);

  function onPointerDown(e: React.PointerEvent) {
    const startX = e.clientX;
    function move(ev: PointerEvent){
      setDx(ev.clientX - startX);
    }
    function up(){
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      if (dx > 80) onRight();
      else if (dx < -80) onLeft();
      setDx(0);
    }
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  }

  return (
    <div
      ref={ref}
      className="relative border rounded-xl p-4 select-none touch-none"
      onPointerDown={onPointerDown}
      style={{ transform:`translateX(${dx}px) rotate(${dx/20}deg)`, transition: dx===0 ? "transform .15s ease": "none" }}
    >
      <img src={product.images?.[0]?.url || "/placeholder.png"} alt={product.title} className="w-full h-64 object-cover rounded" />
      <div className="mt-3">
        <h3 className="text-lg font-medium">{product.title}</h3>
        <p className="text-sm opacity-70">{(product.description || '').slice(0,120)}...</p>
        <p className="mt-1 font-semibold">{product.variants?.[0]?.price?.amount} {product.variants?.[0]?.price?.currencyCode}</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <span className="text-xl opacity-20">👎</span>
        <span className="text-xl opacity-20">👍</span>
      </div>
    </div>
  );
}
