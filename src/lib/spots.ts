import { clamp, snapHalf, uid } from "@/lib/format";
import type { Lot, Spot, SpotKind, Sun } from "@/lib/types";

const KIND_NAME: Record<SpotKind, string> = {
  bed: "Bed",
  lawn: "Lawn",
  patio: "Patio",
  path: "Path",
  water: "Water",
  structure: "House",
};

export function nextSpotName(lot: Lot, kind: SpotKind) {
  const count = lot.spots.filter((spot) => spot.kind === kind).length + 1;
  const base = KIND_NAME[kind];
  return count === 1 ? base : `${base} ${count}`;
}

export function sunForNewSpot(lot: Lot, kind: SpotKind, x: number, y: number, w: number, h: number): Sun {
  if (kind === "structure" || kind === "patio" || kind === "path" || kind === "water") return "full";
  const cx = x + w / 2;
  const cy = y + h / 2;
  const house = lot.spots.find((spot) => spot.kind === "structure");
  if (!house) return kind === "lawn" ? "full" : "full";
  const overHouseX = cx >= house.x && cx <= house.x + house.w;
  if (overHouseX && cy < house.y) return "shade";
  if (overHouseX && cy > house.y + house.h) return "full";
  if (house && Math.abs(cx - (house.x + house.w / 2)) > house.w / 2) return "part";
  return "full";
}

export function typicalSpots(width: number, depth: number): Spot[] {
  const spots: Spot[] = [];
  const houseW = clamp(Math.round(width * 0.52), 16, Math.max(12, width - 10));
  const houseH = clamp(Math.round(Math.min(28, depth * 0.32)), 12, Math.max(12, depth * 0.5));
  const hx = snapHalf(Math.max(2, (width - houseW) / 2));
  const hy = snapHalf(Math.max(2, Math.min(10, depth * 0.08)));
  if (hy + houseH < depth - 6) {
    spots.push({
      id: uid(),
      kind: "structure",
      name: "House",
      x: hx,
      y: hy,
      w: houseW,
      h: houseH,
      sun: "full",
    });
  }
  const bedH = clamp(Math.round(depth * 0.07), 4, 6);
  const bedY = hy + houseH + 1;
  if (spots.length && bedY + bedH < depth - 8) {
    spots.push({
      id: uid(),
      kind: "bed",
      name: "South bed",
      x: hx,
      y: bedY,
      w: houseW,
      h: bedH,
      sun: "full",
    });
  }
  if (hy >= 6) {
    spots.push({
      id: uid(),
      kind: "bed",
      name: "North bed",
      x: hx,
      y: 1,
      w: houseW,
      h: snapHalf(hy - 2),
      sun: "shade",
    });
  }
  const lawnY = (spots.find((spot) => spot.name === "South bed")?.y ?? hy + houseH) + bedH + 1;
  const lawnH = depth - lawnY - 2;
  if (lawnH >= 8) {
    spots.push({
      id: uid(),
      kind: "lawn",
      name: "Lawn",
      x: 2,
      y: snapHalf(lawnY),
      w: snapHalf(width - 4),
      h: snapHalf(lawnH),
      sun: "full",
    });
  }
  return spots;
}
