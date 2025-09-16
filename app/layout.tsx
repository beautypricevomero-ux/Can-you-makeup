import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Can You Makeup",
  description: "Gioco d’acquisto stile Tinder",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body className="app-body text-slate-900">
        <div className="relative flex min-h-screen min-h-[100svh] flex-col overflow-hidden">
          <div className="pointer-events-none absolute -left-32 top-32 hidden h-80 w-80 rounded-full bg-rose-300/30 blur-3xl md:block" />
          <div className="pointer-events-none absolute -right-24 top-1/3 hidden h-96 w-96 rounded-full bg-orange-200/40 blur-[120px] lg:block" />
          <Navbar />
          <main
            className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 pb-20 pt-[5.75rem] sm:gap-10 sm:pt-[6.5rem]"
            style={{
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 5.75rem)",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2.5rem)",
            }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
