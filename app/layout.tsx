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
      <body className="bg-gray-50 text-gray-900">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </body>
    </html>
  );
}
