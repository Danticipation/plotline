import { clamp, snapHalf } from "@/lib/format";
import { getPlant } from "@/lib/plants";
import { usePlot } from "@/lib/store";
import type { Spot } from "@/lib/types";

function inside(spot: Spot, x: number, y: number) {
  return x >= spot.x && x <= spot.x + spot.w && y >= spot.y && y <= spot.y + spot.h;
}

export function placeInBestSpot(plantId: string) {
  const { lot, selected, addPlant } = usePlot.getState();
  const plant = getPlant(plantId);
  const spread = Math.max(plant?.spreadFt ?? 4, 2);
  const tall =
    !!plant &&
    (plant.kind === "tree" || plant.kind === "evergreen" || (plant.kind === "edible" && plant.heightFt >= 8));
  const selectedSpot = lot.spots.find(
    (spot) => spot.id === selected?.id && (spot.kind === "bed" || spot.kind === "lawn"),
  );
  const wantsShade = plant?.sun === "shade";
  const lawn = lot.spots.find((spot) => spot.kind === "lawn");
  const bed =
    lot.spots.find((item) => item.kind === "bed" && item.sun === (wantsShade ? "shade" : "full")) ??
    lot.spots.find((item) => item.kind === "bed");
  const spot = selectedSpot ?? (tall ? lawn ?? bed : bed ?? lawn);
  let x = lot.widthFt / 2;
  let y = lot.depthFt * 0.72;
  if (spot) {
    const inSpot = lot.placed.filter((item) => inside(spot, item.x, item.y)).length;
    const cols = Math.max(1, Math.floor(spot.w / Math.max(Math.min(spread, spot.w), 3)));
    const col = inSpot % cols;
    const row = Math.floor(inSpot / cols);
    x = spot.x + ((col + 0.5) * spot.w) / cols;
    y = spot.y + Math.min(spot.h - 0.6, (row + 0.5) * Math.max(2.5, Math.min(spread, spot.h) * 0.45));
    if (tall && spot.kind === "lawn") {
      const house = lot.spots.find((item) => item.kind === "structure");
      if (house) {
        const clearance = Math.max(8, Math.min(16, spread * 0.45));
        const south = house.y + house.h + clearance;
        if (south < spot.y + spot.h - 1) y = Math.max(y, south);
      }
    }
  }
  addPlant(plantId, snapHalf(clamp(x, 1, lot.widthFt - 1)), snapHalf(clamp(y, 1, lot.depthFt - 1)));
}
