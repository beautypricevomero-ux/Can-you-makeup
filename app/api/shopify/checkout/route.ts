import { NextResponse } from "next/server";
export async function POST() {
  // Demo: reindirizza a una pagina finta così testiamo il flusso completo
  return NextResponse.json({ webUrl: "https://example.com/checkout-demo" });
}