import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let SETTINGS = {
  tiers: [
    { id: "t30", label: "Biglietto 30€", fee: 30, secs: 120 },
    { id: "t50", label: "Biglietto 50€", fee: 50, secs: 200 },
    { id: "t80", label: "Biglietto 80€", fee: 80, secs: 350 },
    { id: "t100", label: "Biglietto 100€", fee: 100, secs: 500 },
  ],
  sectorsByTier: {
    t30: [
      { id: "low-cost", label: "Low Cost", weight: 32, handles: ["low-cost"] },
      { id: "low-cost-plus", label: "Low Cost Plus", weight: 28, handles: ["low-cost-plus"] },
      { id: "semi-luxury", label: "Semi Luxury", weight: 20, handles: ["semi-luxury"] },
      { id: "luxury", label: "Luxury", weight: 12, handles: ["luxury"] },
      { id: "extra-luxury", label: "Extra Luxury", weight: 8, handles: ["extra-luxury"] },
    ],
    t50: [
      { id: "low-cost", label: "Low Cost", weight: 24, handles: ["low-cost"] },
      { id: "low-cost-plus", label: "Low Cost Plus", weight: 26, handles: ["low-cost-plus"] },
      { id: "semi-luxury", label: "Semi Luxury", weight: 24, handles: ["semi-luxury"] },
      { id: "luxury", label: "Luxury", weight: 16, handles: ["luxury"] },
      { id: "extra-luxury", label: "Extra Luxury", weight: 10, handles: ["extra-luxury"] },
    ],
    t80: [
      { id: "low-cost", label: "Low Cost", weight: 18, handles: ["low-cost"] },
      { id: "low-cost-plus", label: "Low Cost Plus", weight: 24, handles: ["low-cost-plus"] },
      { id: "semi-luxury", label: "Semi Luxury", weight: 26, handles: ["semi-luxury"] },
      { id: "luxury", label: "Luxury", weight: 20, handles: ["luxury"] },
      { id: "extra-luxury", label: "Extra Luxury", weight: 12, handles: ["extra-luxury"] },
    ],
    t100: [
      { id: "low-cost", label: "Low Cost", weight: 15, handles: ["low-cost"] },
      { id: "low-cost-plus", label: "Low Cost Plus", weight: 22, handles: ["low-cost-plus"] },
      { id: "semi-luxury", label: "Semi Luxury", weight: 24, handles: ["semi-luxury"] },
      { id: "luxury", label: "Luxury", weight: 22, handles: ["luxury"] },
      { id: "extra-luxury", label: "Extra Luxury", weight: 17, handles: ["extra-luxury"] },
    ],
  },
};

export async function GET() {
  return NextResponse.json(SETTINGS);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  SETTINGS = body;
  return NextResponse.json({ ok: true });
}
