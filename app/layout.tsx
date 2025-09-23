import "../styles/globals.css";

export const metadata = {
  title: "ALL YOU CAN MAKEUP",
  description: "Timer per il gioco delle live TikTok",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="app-body">{children}</body>
    </html>
  );
}