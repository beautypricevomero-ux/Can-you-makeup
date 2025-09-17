"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

export default function Guard({ children }: { children: ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/shopify/verify-pass");
        if (!res.ok) throw new Error("verify-pass failed");
        const data: { ok?: boolean } = await res.json();
        if (active) setOk(Boolean(data.ok));
      } catch (error) {
        // Per la demo permettiamo comunque l'accesso in caso di errore di rete.
        if (active) setOk(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (ok === null) return <p>Verifica accesso al gioco…</p>;

  if (!ok)
    return (
      <div className="space-y-3 rounded-lg border border-pink-100 bg-pink-50 p-4 text-[#5f3a4d]">
        <p>
          Per giocare devi acquistare il <b>Game Pass</b> (es. 30€).
        </p>
        <Link href="/#pass" className="btn">
          Acquista il Pass
        </Link>
      </div>
    );

  return <>{children}</>;
}
