import Link from "next/link";

export default function Navbar() {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 16px",
      borderBottom: "1px solid #eee",
      marginBottom: 24
    }}>
      <Link href="/">🏠 Home</Link>
      <div style={{ display: "flex", gap: 16 }}>
        <Link href="/play">Gioca</Link>
        <Link href="/settings">Settings</Link>
      </div>
    </nav>
  );
}