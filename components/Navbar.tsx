import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold text-gray-900">
          Can You Makeup
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-gray-600">
          <Link href="/play?tier=t30" className="transition hover:text-gray-900">
            Gioca
          </Link>
          <Link href="/settings" className="transition hover:text-gray-900">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
