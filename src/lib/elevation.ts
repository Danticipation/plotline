import { getPlant } from "@/lib/plants";
import type { Lot, PlantKind } from "@/lib/types";

export type ElevLayout = {
  w: number;
  h: number;
  horizon: number;
  ground: number;
  basePpm: number;
};

export function elevationLayout(w: number, h: number, lotW: number): ElevLayout {
  return {
    w,
    h,
    horizon: h * 0.34,
    ground: h * 0.88,
    basePpm: (w * 0.78) / Math.max(lotW, 1),
  };
}

export function project(layout: ElevLayout, lotW: number, lotD: number, x: number, y: number) {
  const south = Math.max(0, Math.min(1, y / Math.max(lotD, 1)));
  const sy = layout.horizon + south * (layout.ground - layout.horizon);
  const persp = 0.55 + south * 0.7;
  const ppm = layout.basePpm * persp;
  const sx = layout.w / 2 + (x - lotW / 2) * layout.basePpm * (0.62 + south * 0.5);
  return { sx, sy, ppm, south };
}

export function unproject(layout: ElevLayout, lotW: number, lotD: number, sx: number, sy: number) {
  const span = layout.ground - layout.horizon;
  const south = Math.max(0, Math.min(1, (sy - layout.horizon) / span));
  const y = south * lotD;
  const perspX = layout.basePpm * (0.62 + south * 0.5);
  const x = lotW / 2 + (sx - layout.w / 2) / perspX;
  return { x, y };
}

export function drawElevation(
  ctx: CanvasRenderingContext2D,
  lot: Lot,
  cssW: number,
  cssH: number,
  dpr: number,
  selectedId: string | null,
  live: { id: string; x: number; y: number } | null,
  camera: boolean,
  ink: string,
  paper: string,
  moss: string,
  clay: string,
  muted: string,
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  const layout = elevationLayout(cssW, cssH, lot.widthFt);
  if (!camera) {
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, cssW, cssH);
    const corners = [
      project(layout, lot.widthFt, lot.depthFt, 0, lot.depthFt),
      project(layout, lot.widthFt, lot.depthFt, lot.widthFt, lot.depthFt),
      project(layout, lot.widthFt, lot.depthFt, lot.widthFt, 0),
      project(layout, lot.widthFt, lot.depthFt, 0, 0),
    ];
    ctx.beginPath();
    ctx.moveTo(corners[0].sx, corners[0].sy);
    for (const corner of corners.slice(1)) ctx.lineTo(corner.sx, corner.sy);
    ctx.closePath();
    ctx.fillStyle = moss;
    ctx.globalAlpha = 0.1;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }

  const spots = [...lot.spots].sort((a, b) => a.y - b.y);
  for (const spot of spots) {
    const pts = [
      project(layout, lot.widthFt, lot.depthFt, spot.x, spot.y + spot.h),
      project(layout, lot.widthFt, lot.depthFt, spot.x + spot.w, spot.y + spot.h),
      project(layout, lot.widthFt, lot.depthFt, spot.x + spot.w, spot.y),
      project(layout, lot.widthFt, lot.depthFt, spot.x, spot.y),
    ];
    ctx.beginPath();
    ctx.moveTo(pts[0].sx, pts[0].sy);
    for (const pt of pts.slice(1)) ctx.lineTo(pt.sx, pt.sy);
    ctx.closePath();
    ctx.globalAlpha = camera ? 0.35 : spot.kind === "structure" ? 0.88 : 0.28;
    ctx.fillStyle = spot.kind === "structure" ? ink : spot.kind === "bed" ? clay : moss;
    if (!camera || spot.kind === "structure") ctx.fill();
    ctx.globalAlpha = camera ? 0.7 : 1;
    ctx.strokeStyle = spot.kind === "structure" ? paper : ink;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  const plants = lot.placed
    .map((placed) => {
      const plant = getPlant(placed.plantId);
      const pos = live?.id === placed.id ? live : placed;
      return plant ? { placed, plant, pos } : null;
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort((a, b) => a.pos.y - b.pos.y);

  for (const row of plants) {
    const p = project(layout, lot.widthFt, lot.depthFt, row.pos.x, row.pos.y);
    drawSilhouette(
      ctx,
      row.plant.kind,
      p.sx,
      p.sy,
      row.plant.heightFt * p.ppm,
      row.plant.spreadFt * p.ppm,
      ink,
      camera ? paper : moss,
      row.placed.id === selectedId,
      clay,
    );
    if (row.placed.id === selectedId) {
      ctx.fillStyle = ink;
      ctx.font = "600 13px Outfit, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(row.plant.name, p.sx, p.sy - row.plant.heightFt * p.ppm - 6);
    }
  }

  if (!camera) {
    const feet = project(layout, lot.widthFt, lot.depthFt, lot.widthFt * 0.12, lot.depthFt * 0.96);
    drawFigure(ctx, feet.sx, feet.sy, feet.ppm, ink);
    ctx.fillStyle = muted;
    ctx.font = "500 12px Outfit, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("6 ft", feet.sx + 14, feet.sy - 6 * feet.ppm * 0.5);
  }

  return layout;
}

function drawSilhouette(
  ctx: CanvasRenderingContext2D,
  kind: PlantKind,
  x: number,
  y: number,
  height: number,
  spread: number,
  ink: string,
  fill: string,
  selected: boolean,
  clay: string,
) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = selected ? clay : ink;
  ctx.lineWidth = selected ? 2 : 1.25;
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  if (kind === "evergreen") {
    ctx.moveTo(x, y - height);
    ctx.lineTo(x + spread / 2, y);
    ctx.lineTo(x - spread / 2, y);
    ctx.closePath();
  } else if (kind === "grass") {
    const blades = 5;
    for (let i = 0; i < blades; i++) {
      const bx = x - spread / 2 + (spread * i) / (blades - 1);
      ctx.moveTo(bx, y);
      ctx.lineTo(bx + spread * 0.04, y - height * (0.7 + (i % 2) * 0.25));
    }
  } else if (kind === "ground") {
    ctx.ellipse(x, y - height * 0.3, spread / 2, Math.max(4, height), 0, 0, Math.PI * 2);
  } else if (kind === "shrub" || kind === "perennial") {
    ctx.ellipse(x, y - height * 0.45, spread / 2, height * 0.5, 0, 0, Math.PI * 2);
  } else {
    ctx.moveTo(x - spread * 0.04, y);
    ctx.lineTo(x - spread * 0.04, y - height * 0.38);
    ctx.lineTo(x + spread * 0.04, y - height * 0.38);
    ctx.lineTo(x + spread * 0.04, y);
    ctx.ellipse(x, y - height * 0.62, spread / 2, height * 0.38, 0, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();
  ctx.restore();
}

function drawFigure(ctx: CanvasRenderingContext2D, x: number, y: number, ppm: number, ink: string) {
  const h = 6 * ppm;
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineWidth = Math.max(1.25, ppm * 0.06);
  ctx.beginPath();
  ctx.arc(x, y - h + h * 0.1, Math.max(2, h * 0.08), 0, Math.PI * 2);
  ctx.moveTo(x, y - h * 0.78);
  ctx.lineTo(x, y - h * 0.42);
  ctx.moveTo(x, y - h * 0.7);
  ctx.lineTo(x - h * 0.16, y - h * 0.48);
  ctx.moveTo(x, y - h * 0.7);
  ctx.lineTo(x + h * 0.16, y - h * 0.48);
  ctx.moveTo(x, y - h * 0.42);
  ctx.lineTo(x - h * 0.12, y);
  ctx.moveTo(x, y - h * 0.42);
  ctx.lineTo(x + h * 0.12, y);
  ctx.stroke();
  ctx.restore();
}

export function hitElevation(lot: Lot, layout: ElevLayout, sx: number, sy: number, live: { id: string; x: number; y: number } | null) {
  let found: string | null = null;
  const plants = [...lot.placed].sort((a, b) => a.y - b.y);
  for (const placed of plants) {
    const plant = getPlant(placed.plantId);
    if (!plant) continue;
    const pos = live?.id === placed.id ? live : placed;
    const p = project(layout, lot.widthFt, lot.depthFt, pos.x, pos.y);
    const height = plant.heightFt * p.ppm;
    const spread = plant.spreadFt * p.ppm;
    if (sx >= p.sx - spread / 2 && sx <= p.sx + spread / 2 && sy >= p.sy - height && sy <= p.sy + 8) {
      found = placed.id;
    }
  }
  return found;
}
