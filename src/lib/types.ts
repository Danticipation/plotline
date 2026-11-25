export type Sun = "full" | "part" | "shade";
export type Water = "low" | "moderate" | "high";
export type Soil = "loam" | "clay" | "sand" | "unknown";
export type Unit = "ft" | "m";
export type Climate =
  | "marine"
  | "arid"
  | "mediterranean"
  | "continental"
  | "humid"
  | "tropical";
export type PlantKind =
  | "tree"
  | "evergreen"
  | "shrub"
  | "perennial"
  | "grass"
  | "ground"
  | "edible";
export type SpotKind = "bed" | "lawn" | "patio" | "path" | "water" | "structure";
export type Tool = "select" | SpotKind;
export type Verdict = "yes" | "marginal" | "no";

export type Spot = {
  id: string;
  kind: SpotKind;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  sun: Sun;
};

export type Placed = {
  id: string;
  plantId: string;
  x: number;
  y: number;
};

export type Lot = {
  name: string;
  widthFt: number;
  depthFt: number;
  soil: Soil;
  placeId: string;
  zoneOverride: string | null;
  spots: Spot[];
  placed: Placed[];
};

export type Selection = { kind: "plant" | "spot"; id: string } | null;
