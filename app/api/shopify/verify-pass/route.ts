import { NextResponse } from "next/server";
export async function GET() {
  // Demo: sempre ok. In produzione: controlla acquisto "Game Pass".
  return NextResponse.json({ ok: true });
}