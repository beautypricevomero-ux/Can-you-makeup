import Image from "next/image";
import Link from "next/link";

const LOGO_URL = "https://cdn.shopify.com/s/files/1/0498/2115/5488/files/Logo-2.png?v=1749562237";

export default function Home() {
  return (
    <section className="relative overflow-hidden rounded-[34px] border border-pink-100/70 bg-white/80 p-6 shadow-2xl backdrop-blur-lg sm:rounded-[40px] sm:p-8 lg:p-12">
      <div className="pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full bg-pink-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-fuchsia-200/45 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:gap-12">
        <div className="space-y-6">
          <Image
            src={LOGO_URL}
            alt="Beauty Price"
            width={240}
            height={80}
            className="h-12 w-auto"
            priority
          />
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#e0116b]">Beauty swipe experience</p>
          <h1 className="text-3xl font-bold leading-tight text-[#2a1020] sm:text-4xl">Can You Makeup</h1>
          <p className="text-sm text-[#5f3a4d] sm:text-base">
            La demo che porta il beauty commerce nell’esperienza swipe di Tinder: 100 prodotti mock, timer dinamico e checkout demo.
            Scegli un tier, scarta o aggiungi al volo e scopri il riepilogo finale.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/play?tier=t30"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e0116b] via-[#ff2c93] to-[#ff87c2] px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-pink-200/70 transition hover:-translate-y-0.5 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-300 sm:px-7 sm:text-base"
            >
              💄 Gioca Tier 30€
            </Link>
            <Link href="/play?tier=t50" className="btn justify-center text-sm sm:text-base">
              ✨ Gioca Tier 50€
            </Link>
          </div>
          <div className="space-y-2 text-xs text-[#73506a] sm:text-sm">
            <p>
              100 prodotti mock divisi tra occhi, labbra e viso vengono mostrati in base alle percentuali configurate nella pagina{" "}
              <Link href="/settings" className="font-semibold text-[#e0116b] underline">
                Settings
              </Link>
              .
            </p>
            <p>Al termine del timer potrai aprire un checkout demo con i prodotti aggiunti al carrello.</p>
          </div>
        </div>
        <div className="relative mx-auto flex h-[360px] w-full max-w-xs items-end justify-center sm:h-[420px]">
          <div className="absolute inset-x-6 top-0 rounded-full bg-white/90 py-3 text-center text-xs font-semibold uppercase tracking-[0.45em] text-[#e0116b] shadow-lg shadow-pink-100/70">
            Swipe &amp; shop
          </div>
          <div className="absolute -left-6 top-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#e0116b] shadow-xl shadow-pink-200/60">
            ❤️
          </div>
          <div className="absolute -right-5 top-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/70 bg-white/80 text-2xl text-[#6f3751] shadow-xl shadow-pink-200/50">
            ✕
          </div>
          <div className="relative h-full w-full overflow-hidden rounded-[36px] bg-gradient-to-br from-pink-200 via-pink-100 to-fuchsia-100 shadow-[0_25px_55px_-20px_rgba(224,17,107,0.35)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_rgba(255,255,255,0)_55%)]" />
            <div className="absolute bottom-6 left-6 right-6 rounded-[28px] bg-white/90 p-6 text-left text-[#4a1d33] shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#e0116b]">Occhi</span>
                <span className="rounded-full bg-[#ffe6f1] px-3 py-1 text-xs font-semibold text-[#c31357]">29,90€</span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-[#2a1020]">Mascara Aurora</h3>
              <p className="mt-2 text-sm text-[#5f3a4d]">
                Volume intenso e curvatura estrema in un solo swipe. Resistente all’acqua con finish glossy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
