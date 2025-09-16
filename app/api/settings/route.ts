import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type TierSetting = {
  id: string;
  label: string;
  fee: number;
  secs: number;
};

type SectorSetting = {
  id: "eyes" | "lips" | "skin";
  label: string;
  weight: number;
  handles: string[];
};

type SettingsPayload = {
  tiers: TierSetting[];
  sectorsByTier: Record<string, SectorSetting[]>;
};

const DEFAULT_SETTINGS: SettingsPayload = {
  tiers: [
    { id: "t30", label: "30€", fee: 30, secs: 90 },
    { id: "t50", label: "50€", fee: 50, secs: 120 },
  ],
  sectorsByTier: {
    t30: [
      { id: "eyes", label: "Occhi", weight: 40, handles: ["occhi"] },
      { id: "lips", label: "Labbra", weight: 35, handles: ["labbra"] },
      { id: "skin", label: "Viso", weight: 25, handles: ["viso"] },
    ],
    t50: [
      { id: "eyes", label: "Occhi", weight: 30, handles: ["occhi"] },
      { id: "lips", label: "Labbra", weight: 30, handles: ["labbra"] },
      { id: "skin", label: "Viso", weight: 40, handles: ["viso"] },
    ],
  },
};

let SETTINGS: SettingsPayload = DEFAULT_SETTINGS;

export async function GET() {
  return NextResponse.json(SETTINGS);
}

export async function POST(req: NextRequest) {
  // Salvataggio in-memory (per la demo). In produzione: DB o metafields Shopify.
  const body = (await req.json()) as SettingsPayload;
  SETTINGS = body;
  return NextResponse.json({ ok: true });
}
