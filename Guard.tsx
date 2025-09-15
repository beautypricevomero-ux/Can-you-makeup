"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Guard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/shopify/verify-pass").then(r=>r.json()).then(d=>setOk(!!d.ok));
  }, []);
  if (ok === null) return <p>Verifica accesso al gioco…</p>;
  if (!ok) return (
    <div className="space-y-3">
      <p>Per giocare devi acquistare il <b>Game Pass</b> (es. 30€).</p>
      <Link href="/#pass" className="btn">Acquista il Pass</Link>
    </div>
  );
  return <>{children}</>;
}
