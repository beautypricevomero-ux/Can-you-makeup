import Image from "next/image";
import Link from "next/link";

const LOGO_URL = "https://cdn.shopify.com/s/files/1/0498/2115/5488/files/Logo-2.png?v=1749562237";

export default function Navbar() {
  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-30 flex flex-col items-center gap-3"
      style={{
        paddingLeft: "var(--app-shell-gutter)",
        paddingRight: "var(--app-shell-gutter)",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)",
      }}
    >
      <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-[28px] border border-pink-100/80 bg-white/90 px-4 py-3 shadow-lg shadow-pink-100/60 backdrop-blur-lg sm:rounded-full sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-[#47132c] transition hover:text-[#e0116b] sm:text-base"
        >
          <Image
            src={LOGO_URL}
            alt="Beauty Price"
            width={168}
            height={48}
            className="h-7 w-auto sm:h-8"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-[#6f3751] sm:flex">
          <Link href="/" className="transition hover:text-[#e0116b]">
            Home
          </Link>
          <Link href="/play?tier=t30" className="transition hover:text-[#e0116b]">
            Gioca
          </Link>
          <Link href="/settings" className="transition hover:text-[#e0116b]">
            Settings
          </Link>
        </nav>
      </div>
      <nav className="pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-full border border-pink-100/80 bg-white/90 px-4 py-2 text-xs font-semibold text-[#6f3751] shadow-md shadow-pink-100/60 backdrop-blur sm:hidden">
        <Link href="/" className="flex flex-1 justify-center rounded-full px-2 py-1 transition hover:text-[#e0116b]">
          Home
        </Link>
        <Link
          href="/play?tier=t30"
          className="flex flex-1 justify-center rounded-full px-2 py-1 transition hover:text-[#e0116b]"
        >
          Gioca
        </Link>
        <Link href="/settings" className="flex flex-1 justify-center rounded-full px-2 py-1 transition hover:text-[#e0116b]">
          Settings
        </Link>
      </nav>
    </header>
  );
}
