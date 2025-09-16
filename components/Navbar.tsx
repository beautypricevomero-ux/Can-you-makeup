import Image from "next/image";
import Link from "next/link";

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
      <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-[28px] border border-white/60 bg-white/80 px-4 py-3 shadow-lg shadow-rose-100/50 backdrop-blur-lg sm:rounded-full sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-gray-900 transition hover:text-rose-500 sm:text-base"
        >
          <Image
            src="/beauty-price-logo.svg"
            alt="Beauty Price"
            width={168}
            height={48}
            className="h-7 w-auto sm:h-8"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-600 sm:flex">
          <Link href="/" className="transition hover:text-rose-500">
            Home
          </Link>
          <Link href="/play?tier=t30" className="transition hover:text-rose-500">
            Gioca
          </Link>
          <Link href="/settings" className="transition hover:text-rose-500">
            Settings
          </Link>
        </nav>
      </div>
      <nav className="pointer-events-auto flex w-full max-w-sm items-center justify-between rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-semibold text-gray-600 shadow-md shadow-rose-100/40 backdrop-blur sm:hidden">
        <Link href="/" className="flex flex-1 justify-center rounded-full px-2 py-1 transition hover:text-rose-500">
          Home
        </Link>
        <Link href="/play?tier=t30" className="flex flex-1 justify-center rounded-full px-2 py-1 transition hover:text-rose-500">
          Gioca
        </Link>
        <Link href="/settings" className="flex flex-1 justify-center rounded-full px-2 py-1 transition hover:text-rose-500">
          Settings
        </Link>
      </nav>
    </header>
  );
}
