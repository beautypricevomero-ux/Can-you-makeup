import { NextResponse } from "next/server";
import { MOCK_PRODUCTS } from "./data";

export async function POST(req: Request) {
  try {
    const { sectors } = await req.json();
    const allowed = new Set<string>(Array.isArray(sectors) ? sectors.map((s: any) => s.id) : []);
    const products = MOCK_PRODUCTS.filter((product) => allowed.size === 0 || allowed.has(product.sector));
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ products: [] }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ products: MOCK_PRODUCTS });
}
