export type MockProduct = {
  id: string;
  sector: string;
  title: string;
  description: string;
  images: { url: string; altText: string }[];
  variants: { id: string; price: { amount: string; currencyCode: string } }[];
};

type SectorBaseProduct = {
  brand: string;
  product: string;
  basePrice: number;
  description: string;
  image: string;
};

type SectorDefinition = {
  id: string;
  label: string;
  priceRange: [number, number];
  bases: SectorBaseProduct[];
  variantLabel: string;
};

const SHADE_NAMES = [
  "Soft Rose",
  "Coral Bloom",
  "Nude Whisper",
  "Berry Velvet",
  "Golden Hour",
  "Amber Crush",
  "Pink Sorbet",
  "Plum Mirage",
  "Mocha Dream",
  "Cherry Spark",
  "Peach Blush",
  "Ruby Glaze",
  "Bronze Aura",
  "Honey Glow",
  "Vanilla Frost",
  "Caramel Silk",
  "Opal Light",
  "Fuchsia Pop",
  "Crimson Muse",
  "Sienna Flame",
  "Champagne Mist",
  "Mulberry Kiss",
  "Satin Taupe",
  "Petal Cloud",
  "Cocoa Dusk",
  "Mauve Muse",
  "Copper Shine",
  "Velvet Fig",
  "Icy Quartz",
  "Sunset Terra"
];

const IMAGE_BASE = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const SECTOR_CONFIGS: SectorDefinition[] = [
  {
    id: "low-cost",
    label: "Low Cost",
    priceRange: [3.2, 9.9],
    variantLabel: "Shade",
    bases: [
      {
        brand: "Essence",
        product: "Lash Princess Mascara",
        basePrice: 4.99,
        description: "Mascara con scovolino conico per volume istantaneo e ciglia da bambola.",
        image: IMAGE_BASE("photo-1521572267365-211f52a87b97"),
      },
      {
        brand: "Catrice",
        product: "Liquid Camouflage Concealer",
        basePrice: 5.49,
        description: "Correttore ad alta coprenza resistente all'acqua e alle lunghe giornate.",
        image: IMAGE_BASE("photo-1512496015851-a90fb38ba796"),
      },
      {
        brand: "KIKO Milano",
        product: "Smart Fusion Lipstick",
        basePrice: 5.99,
        description: "Rossetto cremoso dal finish satinato che coccola le labbra con vitamine E e C.",
        image: IMAGE_BASE("photo-1516728778615-2d590ea1855f"),
      },
      {
        brand: "NYX",
        product: "Butter Gloss",
        basePrice: 6.5,
        description: "Gloss leggero dal profumo di vaniglia per un effetto lucido non appiccicoso.",
        image: IMAGE_BASE("photo-1522335789202-529729f65ee6"),
      },
      {
        brand: "Revolution",
        product: "Reloaded Eyeshadow Palette",
        basePrice: 8.5,
        description: "Palette iconica con 15 ombretti super pigmentati per look giorno e sera.",
        image: IMAGE_BASE("photo-1542385151-460c83d4953e"),
      },
      {
        brand: "Rimmel",
        product: "Stay Matte Pressed Powder",
        basePrice: 6.99,
        description: "Cipria compatta opacizzante che controlla la lucidità fino a 5 ore.",
        image: IMAGE_BASE("photo-1526045478516-99145907023c"),
      },
      {
        brand: "Lottie London",
        product: "Stamp Liner",
        basePrice: 7.5,
        description: "Eyeliner doppio con stampo per creare look grafici in un gesto.",
        image: IMAGE_BASE("photo-1577110289392-58e4a94a8f2c"),
      },
      {
        brand: "W7",
        product: "Honolulu Bronzer",
        basePrice: 8.99,
        description: "Terra abbronzante dall'effetto sunkissed per scaldare l'incarnato.",
        image: IMAGE_BASE("photo-1515378791036-0648a3ef77b2"),
      },
      {
        brand: "Pupa",
        product: "Vamp! Mini Mascara",
        basePrice: 9.5,
        description: "Versione travel del mascara best seller per volume intenso e definizione.",
        image: IMAGE_BASE("photo-1502784444185-1a1b6067e572"),
      },
      {
        brand: "Maybelline",
        product: "Colorama Nail Polish",
        basePrice: 3.99,
        description: "Smalto brillante che asciuga in pochi minuti con finish ultra lucido.",
        image: IMAGE_BASE("photo-1470115636492-6d2b56f9146e"),
      },
    ],
  },
  {
    id: "low-cost-plus",
    label: "Low Cost Plus",
    priceRange: [10.0, 17.0],
    variantLabel: "Shade",
    bases: [
      {
        brand: "Maybelline",
        product: "Fit Me Matte + Poreless Foundation",
        basePrice: 11.99,
        description: "Fondotinta modulabile che minimizza i pori e mantiene l'effetto matte.",
        image: IMAGE_BASE("photo-1586495777996-f0641fba66dc"),
      },
      {
        brand: "L'Oréal Paris",
        product: "Infallible More Than Concealer",
        basePrice: 12.99,
        description: "Correttore full coverage che dura fino a 24 ore senza segnare.",
        image: IMAGE_BASE("photo-1585386959984-a4155226801d"),
      },
      {
        brand: "ColourPop",
        product: "Super Shock Highlighter",
        basePrice: 12.0,
        description: "Illuminante cremoso che si trasforma in polvere per un bagliore specchiato.",
        image: IMAGE_BASE("photo-1522335789204-9963293f7cf1"),
      },
      {
        brand: "Morphe",
        product: "9W Smoke & Shadow Palette",
        basePrice: 15.0,
        description: "Palette compatta con nuance fredde e calde per smoky look professionali.",
        image: IMAGE_BASE("photo-1542838687-2c3f7bcf0683"),
      },
      {
        brand: "BH Cosmetics",
        product: "Weekend Vibes Blush",
        basePrice: 13.5,
        description: "Blush baked luminoso ispirato ai brunch di fine settimana.",
        image: IMAGE_BASE("photo-1542838686-73e84db6c140"),
      },
      {
        brand: "Pixi",
        product: "Glow Tonic Serum",
        basePrice: 16.5,
        description: "Siero esfoliante delicato che restituisce luminosità immediata.",
        image: IMAGE_BASE("photo-1612810806695-30f89d30b428"),
      },
      {
        brand: "Zoeva",
        product: "Caramel Melange Palette",
        basePrice: 16.99,
        description: "Palette gourmand con finish matte e metallic per occhi magnetici.",
        image: IMAGE_BASE("photo-1522335789203-aabd1fc54bc9"),
      },
      {
        brand: "Milani",
        product: "Baked Bronzer",
        basePrice: 14.0,
        description: "Terra cotta brillante che avvolge il viso con riflessi dorati.",
        image: IMAGE_BASE("photo-1503342217505-b0a15ec3261c"),
      },
      {
        brand: "Real Techniques",
        product: "Everyday Essentials Kit",
        basePrice: 16.5,
        description: "Set di pennelli sintetici per una base impeccabile e sfumature precise.",
        image: IMAGE_BASE("photo-1542838687-2c3f7bcf0683"),
      },
      {
        brand: "KVD Beauty",
        product: "Tattoo Liner Mini",
        basePrice: 15.5,
        description: "Eyeliner liquido waterproof con punta ultra sottile per tratti grafici.",
        image: IMAGE_BASE("photo-1600189164724-9c3c0f54796a"),
      },
    ],
  },
  {
    id: "semi-luxury",
    label: "Semi Luxury",
    priceRange: [17.0, 25.0],
    variantLabel: "Shade",
    bases: [
      {
        brand: "NARS",
        product: "Blush Orgasm",
        basePrice: 24.5,
        description: "Blush pesca-rosato cult con riflessi dorati per un effetto bonne mine.",
        image: IMAGE_BASE("photo-1522336572468-97b06e8ef143"),
      },
      {
        brand: "Fenty Beauty",
        product: "Gloss Bomb Universal",
        basePrice: 19.5,
        description: "Gloss ultra brillante con burro di karité per labbra levigate.",
        image: IMAGE_BASE("photo-1514996937319-344454492b37"),
      },
      {
        brand: "Huda Beauty",
        product: "Obsessions Palette",
        basePrice: 24.0,
        description: "Palette compatta da 9 ombretti con pigmenti intensi e zero fallout.",
        image: IMAGE_BASE("photo-1522336216736-bc60236cf9f5"),
      },
      {
        brand: "Benefit",
        product: "Hoola Bronzer",
        basePrice: 21.99,
        description: "Bronzer iconico matte per scolpire e riscaldare l'incarnato.",
        image: IMAGE_BASE("photo-1526045478516-99145907023c"),
      },
      {
        brand: "Too Faced",
        product: "Better Than Sex Mascara",
        basePrice: 23.5,
        description: "Mascara ultra volumizzante con formula arricchita da collagene.",
        image: IMAGE_BASE("photo-1502784444185-1a1b6067e572"),
      },
      {
        brand: "Urban Decay",
        product: "All Nighter Setting Spray",
        basePrice: 24.5,
        description: "Spray fissativo che mantiene il makeup fresco fino a 16 ore.",
        image: IMAGE_BASE("photo-1522335789200-2b6e636dd392"),
      },
      {
        brand: "Rare Beauty",
        product: "Soft Pinch Liquid Blush",
        basePrice: 22.0,
        description: "Blush liquido leggerissimo modulabile per un effetto naturale.",
        image: IMAGE_BASE("photo-1522335789201-7da0525d6b32"),
      },
      {
        brand: "Anastasia BH",
        product: "Brow Wiz",
        basePrice: 21.0,
        description: "Matita automatica ultra sottile per sopracciglia precise e naturali.",
        image: IMAGE_BASE("photo-1601046935725-b4b39294f35a"),
      },
      {
        brand: "Laura Mercier",
        product: "Caviar Stick Eye Colour",
        basePrice: 24.0,
        description: "Ombretto in stick cremoso a lunga tenuta con finish multidimensionale.",
        image: IMAGE_BASE("photo-1596464716121-2ee6b37c2a12"),
      },
      {
        brand: "Kiehl's",
        product: "Ultra Facial Cream",
        basePrice: 24.99,
        description: "Crema idratante iconica che garantisce 24 ore di comfort e morbidezza.",
        image: IMAGE_BASE("photo-1615634260167-9996af6d88d1"),
      },
    ],
  },
  {
    id: "luxury",
    label: "Luxury",
    priceRange: [25.0, 60.0],
    variantLabel: "Edition",
    bases: [
      {
        brand: "Dior",
        product: "Rouge Dior Lipstick",
        basePrice: 38.0,
        description: "Rossetto couture ricaricabile con finish satinato e trattamento floreale.",
        image: IMAGE_BASE("photo-1522335789204-9963293f7cf1"),
      },
      {
        brand: "Chanel",
        product: "Les Beiges Healthy Glow",
        basePrice: 52.0,
        description: "Powder compatta che illumina e uniforma la carnagione con naturalezza.",
        image: IMAGE_BASE("photo-1542838687-2c3f7bcf0683"),
      },
      {
        brand: "YSL",
        product: "Touche Éclat Concealer",
        basePrice: 36.0,
        description: "Penna illuminante iconica che cancella i segni di stanchezza.",
        image: IMAGE_BASE("photo-1522335789203-aabd1fc54bc9"),
      },
      {
        brand: "Lancôme",
        product: "Hypnôse Drama Mascara",
        basePrice: 34.5,
        description: "Mascara con scovolino curvo per volume intenso e ciglia nere profonde.",
        image: IMAGE_BASE("photo-1502784444185-1a1b6067e572"),
      },
      {
        brand: "Charlotte Tilbury",
        product: "Airbrush Flawless Finish",
        basePrice: 45.0,
        description: "Cipria finissima che sfuma i pori e leviga la pelle come un filtro.",
        image: IMAGE_BASE("photo-1522335789200-2b6e636dd392"),
      },
      {
        brand: "Hourglass",
        product: "Ambient Lighting Palette",
        basePrice: 59.0,
        description: "Trio di polveri illuminanti che ricreano la luce perfetta in ogni momento.",
        image: IMAGE_BASE("photo-1512207846876-3f98ef7f54df"),
      },
      {
        brand: "Guerlain",
        product: "Météorites Pearls",
        basePrice: 52.5,
        description: "Perle colorate che illuminano l'incarnato con riflessi personalizzati.",
        image: IMAGE_BASE("photo-1586495777996-f0641fba66dc"),
      },
      {
        brand: "Clé de Peau Beauté",
        product: "Radiant Corrector",
        basePrice: 55.0,
        description: "Correttore lussuoso che idrata e illumina con trattamento skincare.",
        image: IMAGE_BASE("photo-1600189164724-9c3c0f54796a"),
      },
      {
        brand: "Pat McGrath Labs",
        product: "Mothership Quad",
        basePrice: 55.0,
        description: "Quad di ombretti con pigmenti gioiello e formule vellutate.",
        image: IMAGE_BASE("photo-1522336216736-bc60236cf9f5"),
      },
      {
        brand: "La Mer",
        product: "The Lip Volumizer",
        basePrice: 52.0,
        description: "Trattamento labbra che idrata profondamente e dona volume istantaneo.",
        image: IMAGE_BASE("photo-1514996937319-344454492b37"),
      },
    ],
  },
  {
    id: "extra-luxury",
    label: "Extra Luxury",
    priceRange: [60.0, 1000.0],
    variantLabel: "Edition",
    bases: [
      {
        brand: "La Prairie",
        product: "Skin Caviar Foundation",
        basePrice: 230.0,
        description: "Fondotinta siero con caviale incapsulato per un incarnato scolpito.",
        image: IMAGE_BASE("photo-1611162616305-4a7a5366c8e2"),
      },
      {
        brand: "Tom Ford",
        product: "Shade and Illuminate Palette",
        basePrice: 75.0,
        description: "Palette contouring e highlight in crema dall'effetto seconda pelle.",
        image: IMAGE_BASE("photo-1522335789202-529729f65ee6"),
      },
      {
        brand: "Clé de Peau Beauté",
        product: "The Serum",
        basePrice: 270.0,
        description: "Siero iconico che attiva il potenziale della pelle con estratti preziosi.",
        image: IMAGE_BASE("photo-1612810806695-30f89d30b428"),
      },
      {
        brand: "Sisley",
        product: "Black Rose Cream Mask",
        basePrice: 119.0,
        description: "Maschera sontuosa che leviga e rimpolpa con estratti di rosa nera.",
        image: IMAGE_BASE("photo-1615634260167-9996af6d88d1"),
      },
      {
        brand: "Chantecaille",
        product: "Futur Skin Foundation",
        basePrice: 85.0,
        description: "Fondotinta in gel oil-free con finish naturale e ingredienti botanici.",
        image: IMAGE_BASE("photo-1621155333446-913a1b090e64"),
      },
      {
        brand: "Westman Atelier",
        product: "Lit Up Highlight Stick",
        basePrice: 62.0,
        description: "Stick illuminante clean con finish vetro e ingredienti skincare.",
        image: IMAGE_BASE("photo-1601046935449-0ef1c9d50f9c"),
      },
      {
        brand: "Augustinus Bader",
        product: "The Rich Cream",
        basePrice: 240.0,
        description: "Crema rigenerante con TFC8™ per una pelle rinnovata giorno dopo giorno.",
        image: IMAGE_BASE("photo-1596465538426-c2744809c3cf"),
      },
      {
        brand: "Dior",
        product: "L'Or de Vie La Crème",
        basePrice: 430.0,
        description: "Trattamento anti-età con estratti di uve d'eccezione di Château d'Yquem.",
        image: IMAGE_BASE("photo-1606812606090-2088ef78f27e"),
      },
      {
        brand: "Valmont",
        product: "Prime Renewing Pack",
        basePrice: 195.0,
        description: "Maschera cult effetto photoshopping che distende e rivitalizza all'istante.",
        image: IMAGE_BASE("photo-1601046935725-b4b39294f35a"),
      },
      {
        brand: "Hermès",
        product: "Rouge Hermès Satin",
        basePrice: 72.0,
        description: "Rossetto couture con case ricaricabile firmata Pierre Hardy.",
        image: IMAGE_BASE("photo-1522335789204-9963293f7cf1"),
      },
    ],
  },
];

function clampPrice(value: number, [min, max]: [number, number]) {
  return Math.min(max, Math.max(min, value));
}

function formatPrice(value: number) {
  return value.toFixed(2);
}

export function buildMockProducts(targetPerSector = 100): MockProduct[] {
  const products: MockProduct[] = [];
  let productCounter = 1;
  let variantCounter = 1;

  for (const sector of SECTOR_CONFIGS) {
    const variantsPerBase = Math.ceil(targetPerSector / sector.bases.length);
    let producedForSector = 0;

    for (const base of sector.bases) {
      for (let i = 0; i < variantsPerBase && producedForSector < targetPerSector; i += 1) {
        const shadeIndex = (producedForSector + i) % SHADE_NAMES.length;
        const modifier = (i % 6) * 0.35 - 0.5;
        const rawPrice = base.basePrice + modifier;
        const price = clampPrice(rawPrice, sector.priceRange);
        const id = `${sector.id.toUpperCase()}-${String(productCounter).padStart(3, "0")}`;
        const variantId = `gid://can-you-makeup/ProductVariant/${variantCounter}`;
        const variantName = SHADE_NAMES[shadeIndex];

        products.push({
          id,
          sector: sector.id,
          title: `${base.brand} ${base.product} ${sector.variantLabel} ${variantName}`,
          description: `${base.description} Tonalità ${variantName}.`,
          images: [
            {
              url: base.image,
              altText: `${base.brand} ${base.product}`,
            },
          ],
          variants: [
            {
              id: variantId,
              price: {
                amount: formatPrice(price),
                currencyCode: "EUR",
              },
            },
          ],
        });

        productCounter += 1;
        variantCounter += 1;
        producedForSector += 1;
      }
    }
  }

  return products;
}

export const MOCK_PRODUCTS = buildMockProducts();
