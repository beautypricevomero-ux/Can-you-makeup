import Link from "next/link";
export default function Navbar() {
  return (
    <header className="border-b">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">Can You Makeup</Link>
        <nav className="flex gap-4">
          <Link href="/play">Gioca</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </div>
    </header>
  );
}
