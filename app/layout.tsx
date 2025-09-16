import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Can You Makeup",
  description: "Gioco d’acquisto stile Tinder",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body className="app-body text-slate-900">
        <div className="relative flex min-h-screen flex-col overflow-hidden">
          <div className="pointer-events-none absolute -left-32 top-32 hidden h-80 w-80 rounded-full bg-rose-300/30 blur-3xl md:block" />
          <div className="pointer-events-none absolute -right-24 top-1/3 hidden h-96 w-96 rounded-full bg-orange-200/40 blur-[120px] lg:block" />
          <Navbar />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 pb-16 pt-24 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
