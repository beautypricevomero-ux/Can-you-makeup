export type SectorConfig = {
  id: string;
  label: string;
  weight: number;
  handles: string[];
};

export function drawSectorId(sectors: SectorConfig[]) {
  if (sectors.length === 0) return "";

  const normalized = sectors.map((sector) => ({
    ...sector,
    weight: Number.isFinite(sector.weight) && sector.weight > 0 ? sector.weight : 0,
  }));

  const total = normalized.reduce((sum, sector) => sum + sector.weight, 0);
  if (total <= 0) return normalized[0].id;

  let remaining = Math.random() * total;
  for (const sector of normalized) {
    remaining -= sector.weight;
    if (remaining <= 0) return sector.id;
  }

  return normalized[normalized.length - 1].id;
}
