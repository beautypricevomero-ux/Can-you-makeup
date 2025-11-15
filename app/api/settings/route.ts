import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

let SETTINGS = {
  tiers: [
    { id: "t30", label: "30€", fee: 30, secs: 90 },
    { id: "t50", label: "50€", fee: 50, secs: 120 }
  ],
  sectorsByTier: {
    t30: [
      { id: "eyes", label: "Occhi", weight: 40, handles: ["occhi"] },
      { id: "lips", label: "Labbra", weight: 35, handles: ["labbra"] },
      { id: "skin", label: "Viso/Teint", weight: 25, handles: ["viso"] }
    ],
    t50: [
      { id: "eyes", label: "Occhi", weight: 30, handles: ["occhi"] },
      { id: "lips", label: "Labbra", weight: 30, handles: ["labbra"] },
      { id: "skin", label: "Viso/Teint", weight: 40, handles: ["viso"] }
    ]
  }
};

export async function GET() { return NextResponse.json(SETTINGS); }
export async function POST(req: NextRequest) {
  const body = await req.json();
  SETTINGS = body;
  return NextResponse.json({ ok: true });
}
