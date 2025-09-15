"use client";
import { useEffect, useState } from "react";
export default function TimerBar({ total, onEnd }:{ total:number; onEnd:()=>void }) {
  const [left, setLeft] = useState(total);
  useEffect(() => {
    const i = setInterval(()=>setLeft(x=>x-1), 1000);
    return () => clearInterval(i);
  }, []);
  useEffect(()=>{ if (left<=0) onEnd(); }, [left, onEnd]);
  const pct = Math.max(0, (left/total)*100);
  return (
    <div className="w-full h-2 bg-gray-200 rounded">
      <div className="h-2 bg-black rounded" style={{ width: `${pct}%` }} />
    </div>
  );
}
