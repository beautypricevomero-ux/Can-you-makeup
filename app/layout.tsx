import Link from "next/link";
import "./../styles/globals.css";

export const metadata = {
  title: "Can You Makeup",
  description: "Gioco d’acquisto stile Tinder",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="app-body">
        <header className="app-header">
          <Link href="/" className="brand" aria-label="Can You Makeup home">
            <img src="/logo.svg" alt="Can You Makeup" width={160} height={48} />
          </Link>
          <nav className="app-nav">
            <Link href="/play">Gioca</Link>
            <Link href="/settings">Impostazioni</Link>
          </nav>
        </header>
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
