import Link from "next/link";
import type { ReactNode } from "react";

import "./../styles/globals.css";

export const metadata = {
  title: "Can You Makeup",
  description: "Gioco d’acquisto stile Tinder",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="it">
      <body>
        <header
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "24px 24px 0",
          }}
        >
          <Link
            href="/"
            aria-label="Can You Makeup homepage"
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: "0.35ch",
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            <span style={{ color: "#111" }}>Can</span>
            <span style={{ color: "#da3833" }}>You</span>
            <span style={{ color: "#111" }}>Makeup</span>
          </Link>
        </header>
        <main style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}