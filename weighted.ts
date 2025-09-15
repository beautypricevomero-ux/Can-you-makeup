export type SectorConfig = {
  id: string;
  label: string;
  weight: number;
  handles: string[];
};

export function drawSectorId(sectors: SectorConfig[]) {
  const total = sectors.reduce((s, x)=>s + x.weight, 0);
  let r = Math.random() * total;
  for (const s of sectors) {
    if ((r -= s.weight) <= 0) return s.id;
  }
  return sectors[sectors.length - 1].id;
}
