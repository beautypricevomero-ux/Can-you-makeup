import "./../styles/globals.css";

export const metadata = {
  title: "Can You Makeup",
  description: "Gioco d’acquisto stile Tinder",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <main style={{maxWidth: "720px", margin: "0 auto", padding: "24px"}}>
          {children}
        </main>
      </body>
    </html>
  );
}