import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <h1>Can You Makeup</h1>
        <p>
          Scopri nuovi prodotti con una meccanica swipe veloce: scegli il tier, acquista il biglietto
          e prova a completare il carrello prima che il tempo scada.
        </p>
        <div className={styles.actions}>
          <Link href="/play" className="btn">
            Inizia a giocare
          </Link>
          <Link href="/settings" className="btn secondary">
            Gestisci settori
          </Link>
        </div>
      </div>
      <div className={styles.preview}>
        <div className={styles.previewCard}>
          <span className={styles.previewBadge}>Occhi</span>
          <h3>Mascara Aurora</h3>
          <p>Curvatura estrema in un solo swipe. Formula waterproof con finish glossy.</p>
          <div className={styles.previewPrice}>29,90€</div>
        </div>
        <div className={styles.floatingActions}>
          <span className={styles.reject}>✕</span>
          <span className={styles.like}>❤</span>
        </div>
      </div>
    </section>
  );
}
