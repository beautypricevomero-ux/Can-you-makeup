import Link from "next/link";

export default function Home() {
  return (
    <section>
      <h1 style={{fontSize:"28px", fontWeight:600, marginBottom:12}}>Can You Makeup</h1>
      <p>Demo online pronta. Clicca per provare:</p>
      <ul style={{marginTop:12, lineHeight:1.8}}>
        <li><Link href="/play">Gioca (swipe)</Link></li>
        <li><Link href="/settings">Settings (settori/percentuali)</Link></li>
      </ul>
    </section>
  );
}