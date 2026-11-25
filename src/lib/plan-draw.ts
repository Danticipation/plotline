import { adviseAt } from "@/lib/advice";
import { FT_PER_M } from "@/lib/format";
import { getPlant, type Plant } from "@/lib/plants";
import type { Lot, PlantKind, Selection, Spot, SpotKind, Unit, Verdict } from "@/lib/types";

export type View = { ppm: number; ox: number; oy: number };

export type PreviewPlant = { plantId: string; x: number; y: number };

export type DrawModel = {
  lot: Lot;
  unit: Unit;
  cssW: number;
  cssH: number;
  dpr: number;
  zoom: number;
  panX: number;
  panY: number;
  selected: Selection;
  livePlant: { id: string; x: number; y: number } | null;
  liveSpot: { id: string; x: number; y: number } | null;
  preview: PreviewPlant | null;
  draft: { kind: SpotKind; x: number; y: number; w: number; h: number } | null;
};

type Palette = {
  paper: string;
  paperDeep: string;
  ink: string;
  muted: string;
  line: string;
  moss: string;
  mossDeep: string;
  clay: string;
};

let palette: Palette | null = null;

export function readPalette(): Palette {
  if (palette) return palette;
  const style = getComputedStyle(document.documentElement);
  const pick = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  palette = {
    paper: pick("--color-paper", "#f3efe6"),
    paperDeep: pick("--color-paper-deep", "#e6dfd0"),
    ink: pick("--color-ink", "#1e261c"),
    muted: pick("--color-muted", "#5e675c"),
    line: pick("--color-line", "#ddd4c4"),
    moss: pick("--color-moss", "#2c6a42"),
    mossDeep: pick("--color-moss-deep", "#1e4a2e"),
    clay: pick("--color-clay", "#c2653a"),
  };
  return palette;
}

export function computeView(cssW: number, cssH: number, lotW: number, lotD: number, zoom: number, panX: number, panY: number): View {
  const padL = 56;
  const padR = 16;
  const padT = 14;
  const padB = 40;
  const availW = Math.max(20, cssW - padL - padR);
  const availH = Math.max(20, cssH - padT - padB);
  const ppm = Math.min(availW / Math.max(lotW, 1), availH / Math.max(lotD, 1)) * zoom;
  const ox = padL + (availW - lotW * ppm) / 2 + panX;
  const oy = padT + (availH - lotD * ppm) / 2 + panY;
  return { ppm, ox, oy };
}

export function worldToScreen(view: View, x: number, y: number) {
  return { sx: view.ox + x * view.ppm, sy: view.oy + y * view.ppm };
}

export function screenToWorld(view: View, sx: number, sy: number) {
  return { x: (sx - view.ox) / view.ppm, y: (sy - view.oy) / view.ppm };
}

function spotRect(spot: Spot, live: DrawModel["liveSpot"]) {
  if (live && live.id === spot.id) return { ...spot, x: live.x, y: live.y };
  return spot;
}

function drawSpot(ctx: CanvasRenderingContext2D, view: View, spot: Spot, colors: Palette, selected: boolean) {
  const a = worldToScreen(view, spot.x, spot.y);
  const w = spot.w * view.ppm;
  const h = spot.h * view.ppm;
  ctx.save();
  if (spot.kind === "structure") {
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = colors.ink;
    ctx.fillRect(a.sx, a.sy, w, h);
    ctx.globalAlpha = 1;
  } else if (spot.kind === "lawn") {
    ctx.save();
    ctx.beginPath();
    ctx.rect(a.sx, a.sy, w, h);
    ctx.clip();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = colors.moss;
    ctx.fillRect(a.sx, a.sy, w, h);
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = colors.moss;
    ctx.lineWidth = 1;
    for (let i = -h; i < w + h; i += 8) {
      ctx.beginPath();
      ctx.moveTo(a.sx + i, a.sy);
      ctx.lineTo(a.sx + i + h, a.sy + h);
      ctx.stroke();
    }
    ctx.restore();
  } else if (spot.kind === "bed") {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = colors.clay;
    ctx.fillRect(a.sx, a.sy, w, h);
    ctx.globalAlpha = 1;
  } else if (spot.kind === "patio") {
    ctx.fillStyle = colors.paperDeep;
    ctx.fillRect(a.sx, a.sy, w, h);
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    const step = 14;
    for (let x = step; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(a.sx + x, a.sy);
      ctx.lineTo(a.sx + x, a.sy + h);
      ctx.stroke();
    }
    for (let y = step; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(a.sx, a.sy + y);
      ctx.lineTo(a.sx + w, a.sy + y);
      ctx.stroke();
    }
  } else if (spot.kind === "path") {
    ctx.strokeStyle = colors.ink;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = Math.max(3, Math.min(w, h) * 0.18);
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    if (w >= h) {
      ctx.moveTo(a.sx, a.sy + h / 2);
      ctx.lineTo(a.sx + w, a.sy + h / 2);
    } else {
      ctx.moveTo(a.sx + w / 2, a.sy);
      ctx.lineTo(a.sx + w / 2, a.sy + h);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  } else if (spot.kind === "water") {
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = colors.mossDeep;
    ctx.fillRect(a.sx, a.sy, w, h);
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = colors.mossDeep;
    ctx.lineWidth = 1;
    for (let y = 6; y < h; y += 7) {
      ctx.beginPath();
      ctx.moveTo(a.sx + 4, a.sy + y);
      ctx.lineTo(a.sx + w - 4, a.sy + y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = selected ? colors.clay : colors.ink;
  ctx.lineWidth = selected ? 2 : 1;
  ctx.strokeRect(a.sx + 0.5, a.sy + 0.5, w, h);
  if (w > 46 && h > 18) {
    ctx.fillStyle = spot.kind === "structure" ? colors.paper : colors.ink;
    ctx.font = "500 12px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(spot.name, a.sx + w / 2, a.sy + Math.min(h / 2, 16));
  }
  ctx.restore();
}

function drawKindMark(ctx: CanvasRenderingContext2D, kind: PlantKind, r: number) {
  ctx.beginPath();
  if (kind === "tree") {
    ctx.moveTo(-r * 0.7, 0);
    ctx.lineTo(r * 0.7, 0);
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(0, r * 0.7);
  } else if (kind === "evergreen") {
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      ctx.moveTo(Math.cos(a) * r * 0.25, Math.sin(a) * r * 0.25);
      ctx.lineTo(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.72);
    }
  } else if (kind === "shrub") {
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
  } else if (kind === "perennial") {
    for (const [dx, dy] of [
      [0, 0],
      [-0.35, -0.2],
      [0.35, -0.15],
      [-0.2, 0.35],
      [0.28, 0.32],
    ] as const) {
      ctx.moveTo(dx * r + 1.6, dy * r);
      ctx.arc(dx * r, dy * r, 1.6, 0, Math.PI * 2);
    }
  } else if (kind === "grass") {
    for (let i = -2; i <= 2; i++) {
      ctx.moveTo(i * r * 0.18, r * 0.35);
      ctx.lineTo(i * r * 0.18, -r * 0.45);
    }
  } else if (kind === "ground") {
    for (let y = -r * 0.45; y <= r * 0.45; y += Math.max(4, r * 0.28)) {
      ctx.moveTo(-r * 0.55, y);
      ctx.lineTo(r * 0.55, y);
    }
  } else {
    const s = r * 0.28;
    ctx.rect(-s, -s, s * 2, s * 2);
  }
  ctx.stroke();
}

function drawPlant(
  ctx: CanvasRenderingContext2D,
  view: View,
  plant: Plant,
  x: number,
  y: number,
  colors: Palette,
  selected: boolean,
  verdict: Verdict | null,
) {
  const c = worldToScreen(view, x, y);
  const r = Math.max(3, (plant.spreadFt / 2) * view.ppm);
  ctx.save();
  ctx.translate(c.sx, c.sy);
  ctx.fillStyle = colors.moss;
  ctx.globalAlpha = plant.kind === "evergreen" ? 0.34 : 0.16;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = selected ? 2 : 1.25;
  ctx.stroke();
  ctx.lineWidth = 1;
  drawKindMark(ctx, plant.kind, r);
  if (verdict === "no") {
    ctx.fillStyle = colors.clay;
    ctx.beginPath();
    ctx.arc(r * 0.62, -r * 0.62, Math.max(3.5, Math.min(7, r * 0.16)), 0, Math.PI * 2);
    ctx.fill();
  } else if (verdict === "marginal") {
    ctx.strokeStyle = colors.clay;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(r * 0.62, -r * 0.62, Math.max(3.5, Math.min(7, r * 0.16)), 0, Math.PI * 2);
    ctx.stroke();
  }
  if (selected) {
    ctx.strokeStyle = verdict === "no" ? colors.clay : verdict === "marginal" ? colors.ink : colors.mossDeep;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function dimension(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  colors: Palette,
  vertical: boolean,
) {
  ctx.save();
  ctx.strokeStyle = colors.ink;
  ctx.fillStyle = colors.ink;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const tick = 4;
  ctx.beginPath();
  if (vertical) {
    ctx.moveTo(x1 - tick, y1);
    ctx.lineTo(x1 + tick, y1);
    ctx.moveTo(x2 - tick, y2);
    ctx.lineTo(x2 + tick, y2);
  } else {
    ctx.moveTo(x1, y1 - tick);
    ctx.lineTo(x1, y1 + tick);
    ctx.moveTo(x2, y2 - tick);
    ctx.lineTo(x2, y2 + tick);
  }
  ctx.stroke();
  ctx.font = "500 12px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  ctx.translate(midX, midY);
  if (vertical) ctx.rotate(-Math.PI / 2);
  const width = ctx.measureText(label).width;
  ctx.fillStyle = colors.paperDeep;
  ctx.fillRect(-width / 2 - 4, -8, width + 8, 16);
  ctx.fillStyle = colors.ink;
  ctx.fillText(label, 0, 0);
  ctx.restore();
}

export function drawPlan(ctx: CanvasRenderingContext2D, model: DrawModel) {
  const colors = readPalette();
  const { cssW, cssH, dpr, lot } = model;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.fillStyle = colors.paperDeep;
  ctx.fillRect(0, 0, cssW, cssH);
  const view = computeView(cssW, cssH, lot.widthFt, lot.depthFt, model.zoom, model.panX, model.panY);
  const origin = worldToScreen(view, 0, 0);
  const far = worldToScreen(view, lot.widthFt, lot.depthFt);
  ctx.fillStyle = colors.paper;
  ctx.fillRect(origin.sx, origin.sy, far.sx - origin.sx, far.sy - origin.sy);

  const step = model.unit === "ft" ? 5 : 2 * FT_PER_M;
  ctx.beginPath();
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 1;
  for (let x = 0; x <= lot.widthFt + 0.01; x += step) {
    const a = worldToScreen(view, x, 0);
    const b = worldToScreen(view, x, lot.depthFt);
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
  }
  for (let y = 0; y <= lot.depthFt + 0.01; y += step) {
    const a = worldToScreen(view, 0, y);
    const b = worldToScreen(view, lot.widthFt, y);
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
  }
  ctx.stroke();

  for (const spot of lot.spots) drawSpot(ctx, view, spotRect(spot, model.liveSpot), colors, model.selected?.kind === "spot" && model.selected.id === spot.id);

  if (model.draft && model.draft.w > 0 && model.draft.h > 0) {
    const a = worldToScreen(view, model.draft.x, model.draft.y);
    ctx.save();
    ctx.strokeStyle = colors.clay;
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(a.sx, a.sy, model.draft.w * view.ppm, model.draft.h * view.ppm);
    ctx.restore();
  }

  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 1.75;
  ctx.strokeRect(origin.sx + 0.5, origin.sy + 0.5, far.sx - origin.sx, far.sy - origin.sy);

  for (const placed of lot.placed) {
    const plant = getPlant(placed.plantId);
    if (!plant) continue;
    const pos = model.livePlant?.id === placed.id ? model.livePlant : placed;
    const advice = adviseAt(plant.id, pos.x, pos.y, lot, placed.id);
    drawPlant(
      ctx,
      view,
      plant,
      pos.x,
      pos.y,
      colors,
      model.selected?.kind === "plant" && model.selected.id === placed.id,
      advice?.verdict ?? null,
    );
  }

  if (model.preview) {
    const plant = getPlant(model.preview.plantId);
    if (plant) {
      const advice = adviseAt(plant.id, model.preview.x, model.preview.y, lot);
      ctx.save();
      ctx.globalAlpha = 0.85;
      drawPlant(ctx, view, plant, model.preview.x, model.preview.y, colors, true, advice?.verdict ?? null);
      ctx.restore();
    }
  }

  drawNorth(ctx, origin.sx + 22, origin.sy + 22, colors.ink, colors.paper);

  const unitLabel = (ft: number) => {
    if (model.unit === "ft") return `${Math.round(ft)} ft`;
    return `${Math.round((ft / FT_PER_M) * 10) / 10} m`;
  };
  dimension(ctx, origin.sx, far.sy + 18, far.sx, far.sy + 18, unitLabel(lot.widthFt), colors, false);
  dimension(ctx, origin.sx - 22, origin.sy, origin.sx - 22, far.sy, unitLabel(lot.depthFt), colors, true);

  if (lot.placed.length === 0 && !model.preview) {
    ctx.fillStyle = colors.muted;
    ctx.font = "500 14px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cx = (origin.sx + far.sx) / 2;
    const cy = (origin.sy + far.sy) / 2;
    ctx.fillText("Drag a plant onto the lot", cx, cy);
    ctx.font = "400 12px Outfit, sans-serif";
    ctx.fillText("Circles are mature spread, to scale", cx, cy + 18);
  }

  return view;
}

function drawNorth(ctx: CanvasRenderingContext2D, x: number, y: number, ink: string, paper: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = paper;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(4, 4);
  ctx.lineTo(0, 1.5);
  ctx.lineTo(-4, 4);
  ctx.closePath();
  ctx.fill();
  ctx.font = "600 9px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("N", 0, -14);
  ctx.restore();
}

export function hitPlant(model: DrawModel, view: View, sx: number, sy: number) {
  const { lot } = model;
  for (let i = lot.placed.length - 1; i >= 0; i--) {
    const placed = lot.placed[i];
    const plant = getPlant(placed.plantId);
    const pos = model.livePlant?.id === placed.id ? model.livePlant : placed;
    const center = worldToScreen(view, pos.x, pos.y);
    const r = Math.max(16, ((plant?.spreadFt ?? 4) / 2) * view.ppm);
    if (Math.hypot(sx - center.sx, sy - center.sy) <= r) return placed;
  }
  return null;
}

export function hitSpot(model: DrawModel, x: number, y: number) {
  const { lot } = model;
  for (let i = lot.spots.length - 1; i >= 0; i--) {
    const spot = spotRect(lot.spots[i], model.liveSpot);
    if (x >= spot.x && y >= spot.y && x <= spot.x + spot.w && y <= spot.y + spot.h) return lot.spots[i];
  }
  return null;
}
