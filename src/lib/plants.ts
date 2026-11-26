import type { Climate, PlantKind, Sun, Water } from "@/lib/types";
import { PLANTS } from "./plants.generated";

export type Plant = {
  id: string;
  name: string;
  latin: string;
  kind: PlantKind;
  zoneMin: string;
  zoneMax: string;
  sun: Sun;
  water: Water;
  heightFt: number;
  spreadFt: number;
  note: string;
  avoid: Partial<Record<Climate, string>>;
  caution: Partial<Record<Climate, string>>;
};

export { PLANTS };

const byId = new Map(PLANTS.map((plant) => [plant.id, plant]));

export function getPlant(id: string) {
  return byId.get(id) ?? null;
}

export const KIND_LABEL: Record<PlantKind, string> = {
  tree: "Tree",
  evergreen: "Evergreen",
  shrub: "Shrub",
  perennial: "Flower",
  grass: "Grass",
  ground: "Groundcover",
  edible: "Edible",
};

export const FILTERS: { id: "all" | PlantKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "tree", label: "Trees" },
  { id: "evergreen", label: "Evergreen" },
  { id: "shrub", label: "Shrubs" },
  { id: "perennial", label: "Flowers" },
  { id: "grass", label: "Grasses" },
  { id: "ground", label: "Ground" },
  { id: "edible", label: "Edibles" },
];
