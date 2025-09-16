import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur-lg lg:p-12">
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-rose-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-orange-200/50 blur-3xl" />
      <div className="relative grid gap-12 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <Image
            src="/beauty-price-logo.svg"
            alt="Beauty Price"
            width={240}
            height={80}
            className="h-12 w-auto"
            priority
          />
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-400">Beauty swipe experience</p>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">Can You Makeup</h1>
          <p className="text-base text-gray-600">
            La demo che porta il beauty commerce nell’esperienza swipe di Tinder: 100 prodotti mock, timer dinamico e checkout demo.
            Scegli un tier, scarta o aggiungi al volo e scopri il riepilogo finale.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/play?tier=t30"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-400 px-7 py-3 text-base font-semibold text-white shadow-xl shadow-rose-200/70 transition hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
            >
              💄 Gioca Tier 30€
            </Link>
            <Link href="/play?tier=t50" className="btn justify-center text-base">
              ✨ Gioca Tier 50€
            </Link>
          </div>
          <div className="space-y-2 text-sm text-gray-500">
            <p>
              100 prodotti mock divisi tra occhi, labbra e viso vengono mostrati in base alle percentuali configurate nella pagina {" "}
              <Link href="/settings" className="font-semibold text-rose-500 underline"> Settings</Link>.
            </p>
            <p>Al termine del timer potrai aprire un checkout demo con i prodotti aggiunti al carrello.</p>
          </div>
        </div>
        <div className="relative mx-auto flex h-[420px] w-full max-w-xs items-end justify-center">
          <div className="absolute inset-x-6 top-0 rounded-full bg-white/80 py-3 text-center text-xs font-semibold uppercase tracking-[0.45em] text-rose-400 shadow-lg shadow-rose-100/70">
            Swipe &amp; shop
          </div>
          <div className="absolute -left-6 top-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-rose-500 shadow-xl shadow-rose-200/60">
            ❤️
          </div>
          <div className="absolute -right-5 top-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 bg-white/80 text-2xl text-gray-500 shadow-xl shadow-rose-200/50">
            ✕
          </div>
          <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-gradient-to-br from-rose-200 via-rose-100 to-amber-100 shadow-[0_25px_55px_-20px_rgba(244,63,94,0.35)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(255,255,255,0)_55%)]" />
            <div className="absolute bottom-6 left-6 right-6 rounded-[28px] bg-white/85 p-6 text-left text-gray-800 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400">Occhi</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">29,90€</span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-gray-900">Mascara Aurora</h3>
              <p className="mt-2 text-sm text-gray-600">
                Volume intenso e curvatura estrema in un solo swipe. Resistente all’acqua con finish glossy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
