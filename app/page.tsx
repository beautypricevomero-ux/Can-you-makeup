import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-8 rounded-3xl bg-white p-10 shadow-xl">
      <div className="space-y-3 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Demo interattiva</p>
        <h1 className="text-4xl font-bold text-gray-900">Can You Makeup</h1>
        <p className="text-base text-gray-600">
          Scegli il tier e prova subito l’esperienza d’acquisto in stile Tinder: swipe, timer e checkout mock inclusi.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start">
        <Link href="/play?tier=t30" className="btn w-full justify-center sm:w-auto">
          💄 Gioca Tier 30€
        </Link>
        <Link href="/play?tier=t50" className="btn w-full justify-center sm:w-auto">
          ✨ Gioca Tier 50€
        </Link>
      </div>

      <div className="space-y-2 text-sm text-gray-500">
        <p>
          Il gioco mostra 100 prodotti mock distribuiti sui settori Occhi, Labbra e Viso in base alle percentuali salvate nelle
          impostazioni.
        </p>
        <p>
          Puoi aggiornare i pesi dalla pagina <Link href="/settings" className="font-medium text-gray-700 underline">Settings</Link>
          , poi ricaricare il gioco per vedere il nuovo mix.
        </p>
      </div>
    </section>
  );
}
