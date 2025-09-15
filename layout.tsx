import "@/styles/globals.css";
import Navbar from "@/components/Navbar";

export const metadata = { title: "Can You Makeup", description: "Gioco d’acquisto stile Tinder" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
