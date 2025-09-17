import { NextResponse } from "next/server";

export type MockProduct = {
  id: string;
  sector: "eyes" | "lips" | "skin";
  title: string;
  description: string;
  images: { url: string; altText?: string }[];
  variants: { id: string; price: { amount: string; currencyCode: "EUR" } }[];
};

const SECTOR_COUNTS: Record<MockProduct["sector"], number> = {
  eyes: 38,
  lips: 32,
  skin: 30,
};

const SECTOR_DETAILS: Record<MockProduct["sector"], { bases: string[]; adjectives: string[]; benefits: string[] }> = {
  eyes: {
    bases: [
      "Mascara",
      "Eyeliner",
      "Palette Ombretti",
      "Primer Occhi",
      "Gel Sopracciglia",
      "Matita Sopracciglia",
      "Illuminante Occhi",
    ],
    adjectives: [
      "Mega Volume",
      "Allungante",
      "Ultra Black",
      "Starlight",
      "Feather",
      "Catwalk",
      "Velvet",
      "Galaxy",
    ],
    benefits: [
      "uno sguardo magnetico",
      "ciglia a ventaglio",
      "tratti definiti",
      "un finish a lunga tenuta",
      "uno smokey eye impeccabile",
      "un look naturale",
      "un tratto preciso",
    ],
  },
  lips: {
    bases: [
      "Rossetto",
      "Lip Gloss",
      "Lip Balm",
      "Tinta Labbra",
      "Matita Labbra",
      "Olio Labbra",
      "Plumper",
    ],
    adjectives: [
      "Satin",
      "Matte",
      "Brillante",
      "Velvet",
      "Cushion",
      "Luminous",
      "Sheer",
      "Crystal",
    ],
    benefits: [
      "labbra idratate",
      "un colore intenso",
      "definizione perfetta",
      "una brillantezza specchiata",
      "un volume immediato",
      "un comfort quotidiano",
      "un finish elegante",
    ],
  },
  skin: {
    bases: [
      "Fondotinta",
      "Primer Viso",
      "Correttore",
      "Illuminante",
      "Blush",
      "Bronzer",
      "Setting Spray",
      "Cipria",
    ],
    adjectives: [
      "Glow",
      "Soft Matte",
      "Perfecting",
      "Radiant",
      "Airbrush",
      "Lightweight",
      "Filter",
      "Serum",
    ],
    benefits: [
      "una base uniforme",
      "un incarnato luminoso",
      "pelle levigata",
      "una tenuta estrema",
      "un finish naturale",
      "un colorito sano",
      "un effetto seconda pelle",
    ],
  },
};

function createRng(seed: number) {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createMockProducts(): MockProduct[] {
  const rng = createRng(2024);
  const results: MockProduct[] = [];
  const sectorOrder: MockProduct["sector"][] = ["eyes", "lips", "skin"];
  let globalIndex = 1;

  for (const sectorId of sectorOrder) {
    const count = SECTOR_COUNTS[sectorId];
    const detail = SECTOR_DETAILS[sectorId];

    for (let i = 0; i < count; i += 1) {
      const base = detail.bases[i % detail.bases.length];
      const adjective = detail.adjectives[Math.floor(rng() * detail.adjectives.length)];
      const benefit = detail.benefits[Math.floor(rng() * detail.benefits.length)];
      const productId = `${sectorId}-${String(globalIndex).padStart(3, "0")}`;
      const price = (10 + rng() * 30).toFixed(2);

      results.push({
        id: productId,
        sector: sectorId,
        title: `${base} ${adjective}`,
        description: `${base} ${adjective} pensato per ${benefit}.`,
        images: [{ url: `https://picsum.photos/seed/${productId}/800/600` }],
        variants: [
          {
            id: `gid://shopify/ProductVariant/${productId}`,
            price: {
              amount: price,
              currencyCode: "EUR",
            },
          },
        ],
      });

      globalIndex += 1;
    }
  }

  return results;
}

const MOCK_PRODUCTS = createMockProducts();

export async function GET() {
  return NextResponse.json({ products: MOCK_PRODUCTS });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawSectors = Array.isArray((body as { sectors?: unknown }).sectors) ? (body as { sectors: { id?: unknown }[] }).sectors : [];
  const wanted = new Set<MockProduct["sector"]>();

  for (const entry of rawSectors) {
    if (entry && typeof entry.id === "string") {
      if (entry.id === "eyes" || entry.id === "lips" || entry.id === "skin") {
        wanted.add(entry.id);
      }
    }
  }

  if (wanted.size === 0) {
    return NextResponse.json({ products: MOCK_PRODUCTS });
  }

  const filtered = MOCK_PRODUCTS.filter((product) => wanted.has(product.sector));
  return NextResponse.json({ products: filtered });
}
