import type { Unit } from "@/lib/types";

export const FT_PER_M = 3.280839895;

export function clamp(n: number, min: number, max: number) {
  if (max < min) return max;
  return Math.max(min, Math.min(max, n));
}

export function snapHalf(n: number) {
  return Math.round(n * 2) / 2;
}

export function toDisplay(ft: number, unit: Unit) {
  return unit === "ft" ? ft : ft / FT_PER_M;
}

export function fromDisplay(value: number, unit: Unit) {
  return unit === "ft" ? value : value * FT_PER_M;
}

export function formatFt(ft: number, unit: Unit, digits = 0) {
  const v = toDisplay(ft, unit);
  const n = digits === 0 ? Math.round(v) : Math.round(v * 10 ** digits) / 10 ** digits;
  return `${n} ${unit}`;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
