import { z } from "zod";
import { zoneRank } from "./climate.ts";
import { CLIMATE_TAG_IDS, expandClimateTags, type ClimateNoteMap } from "./plant-climate-tags.ts";
import type { PlantKind, Sun, Water } from "./types.ts";

/**
 * Relative `.ts` specifiers are for `node scripts/import-plants.mjs`.
 * Node requires the extension; the bundler accepts it. This module is the
 * catalog validator, not a client import.
 */

const PLANT_KINDS = [
  "tree",
  "evergreen",
  "shrub",
  "perennial",
  "grass",
  "ground",
  "edible",
] as const satisfies readonly PlantKind[];
type _KindsCovered = Exclude<PlantKind, (typeof PLANT_KINDS)[number]> extends never ? true : never;
const _kindsCovered: _KindsCovered = true;
void _kindsCovered;

const SUNS = ["full", "part", "shade"] as const satisfies readonly Sun[];
type _SunsCovered = Exclude<Sun, (typeof SUNS)[number]> extends never ? true : never;
const _sunsCovered: _SunsCovered = true;
void _sunsCovered;

const WATERS = ["low", "moderate", "high"] as const satisfies readonly Water[];
type _WatersCovered = Exclude<Water, (typeof WATERS)[number]> extends never ? true : never;
const _watersCovered: _WatersCovered = true;
void _watersCovered;

const USDA_ZONE = /^\d{1,2}[ab]$/i;
const KEBAB_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const climateNoteSchema = z.string().min(1).max(400);

/** Partial climate map. Unknown climate keys fail. Latin duplicates are allowed. */
export const climateNoteMapSchema = z
  .strictObject({
    marine: climateNoteSchema.optional(),
    arid: climateNoteSchema.optional(),
    mediterranean: climateNoteSchema.optional(),
    continental: climateNoteSchema.optional(),
    humid: climateNoteSchema.optional(),
    tropical: climateNoteSchema.optional(),
  })
  .optional();

export const plantImportRowSchema = z
  .strictObject({
    id: z.string().regex(KEBAB_ID, "Expected a kebab-case id").max(48),
    name: z.string().min(1).max(80),
    latin: z.string().min(1).max(160),
    kind: z.enum(PLANT_KINDS),
    zoneMin: z.string().regex(USDA_ZONE, "Expected a USDA zone like 8b"),
    zoneMax: z.string().regex(USDA_ZONE, "Expected a USDA zone like 8b"),
    sun: z.enum(SUNS),
    water: z.enum(WATERS),
    heightFt: z.number().positive().finite().max(400),
    spreadFt: z.number().positive().finite().max(400),
    note: z.string().min(1).max(400),
    avoid: climateNoteMapSchema,
    caution: climateNoteMapSchema,
    tags: z
      .array(z.enum(CLIMATE_TAG_IDS))
      .max(CLIMATE_TAG_IDS.length)
      .superRefine((tags, ctx) => {
        const seen = new Set<string>();
        tags.forEach((tag, index) => {
          if (seen.has(tag)) {
            ctx.addIssue({
              code: "custom",
              path: [index],
              message: `Duplicate tag "${tag}"`,
            });
          }
          seen.add(tag);
        });
      })
      .optional(),
  })
  .superRefine((row, ctx) => {
    if (zoneRank(row.zoneMin) > zoneRank(row.zoneMax)) {
      ctx.addIssue({
        code: "custom",
        path: ["zoneMin"],
        message: `${row.id}: zoneMin ${row.zoneMin} is warmer than zoneMax ${row.zoneMax}`,
      });
    }
  });

export const plantCatalogSchema = z
  .strictObject({
    version: z.literal(1),
    updated: z.iso.datetime({ offset: true }).optional(),
    plants: z.array(plantImportRowSchema).max(2000),
  })
  .superRefine((catalog, ctx) => {
    const seen = new Map<string, number>();
    catalog.plants.forEach((plant, index) => {
      const first = seen.get(plant.id);
      if (first !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["plants", index, "id"],
          message: `Duplicate plant id "${plant.id}" (also at plants[${String(first)}])`,
        });
        return;
      }
      seen.set(plant.id, index);
    });
  });

export type PlantImportRow = z.infer<typeof plantImportRowSchema>;
export type PlantCatalogFile = z.infer<typeof plantCatalogSchema>;

export type CatalogPlant = {
  id: string;
  name: string;
  latin: string;
  kind: PlantImportRow["kind"];
  zoneMin: string;
  zoneMax: string;
  sun: PlantImportRow["sun"];
  water: PlantImportRow["water"];
  heightFt: number;
  spreadFt: number;
  note: string;
  avoid: ClimateNoteMap;
  caution: ClimateNoteMap;
};

/** Drop tags and merge climate-tag copy. Explicit avoid/caution wins. */
export function toCatalogPlant(row: PlantImportRow): CatalogPlant {
  const notes = expandClimateTags(row.tags, row.avoid, row.caution);
  return {
    id: row.id,
    name: row.name,
    latin: row.latin,
    kind: row.kind,
    zoneMin: row.zoneMin,
    zoneMax: row.zoneMax,
    sun: row.sun,
    water: row.water,
    heightFt: row.heightFt,
    spreadFt: row.spreadFt,
    note: row.note,
    avoid: notes.avoid,
    caution: notes.caution,
  };
}
