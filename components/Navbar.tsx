import Link from "next/link";

export default function Navbar() {
  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-30 flex justify-center px-4 pt-6 sm:px-6">
      <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-white/60 bg-white/80 px-5 py-3 shadow-lg shadow-rose-100/50 backdrop-blur-lg">
        <Link href="/" className="text-base font-semibold text-gray-900 transition hover:text-rose-500">
          Can You Makeup
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
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
    </header>
  );
}
