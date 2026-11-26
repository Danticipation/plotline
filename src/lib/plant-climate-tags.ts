import type { Climate } from "./types.ts";

/**
 * Import-time climate copy for optional catalog tags.
 *
 * Tags are a shared table, not per-city notes. `expandClimateTags` merges
 * them into avoid/caution. An explicit avoid or caution string on the row
 * wins for that climate. Two tags that disagree on the same climate fail
 * the import, so stack only tags whose copy does not overlap.
 *
 * Used on current rows: coastal, interior-west, cascade, large-tree,
 * drought-tolerant-mature.
 * Reserved (valid, not on a row yet): desert-native, pnw-native,
 * needs-acid, low-desert.
 * large-tree is a size flag and adds no climate copy.
 */
export const CLIMATE_TAG_IDS = [
  "desert-native",
  "pnw-native",
  "coastal",
  "interior-west",
  "cascade",
  "large-tree",
  "drought-tolerant-mature",
  "needs-acid",
  "low-desert",
] as const;

export type ClimateTag = (typeof CLIMATE_TAG_IDS)[number];

export const CLIMATES = [
  "marine",
  "arid",
  "mediterranean",
  "continental",
  "humid",
  "tropical",
] as const satisfies readonly Climate[];

type _ClimatesCovered = Exclude<Climate, (typeof CLIMATES)[number]> extends never ? true : never;
const _climatesCovered: _ClimatesCovered = true;
void _climatesCovered;

export type ClimateNoteMap = Partial<Record<Climate, string>>;

export type ClimateTagNotes = {
  avoid?: ClimateNoteMap;
  caution?: ClimateNoteMap;
};

export const CLIMATE_TAG_NOTES: Record<ClimateTag, ClimateTagNotes> = {
  "desert-native": {
    avoid: {
      marine: "Wet winters rot a desert-native plant. It wants a dry season.",
      humid: "Humidity and heavy soil are outside a desert-native range.",
      tropical: "It wants a dry season, not year-round rain.",
    },
    caution: {
      continental: "Cold is fine if the soil drains. A wet freeze on the crown is not.",
    },
  },
  "pnw-native": {
    avoid: {
      arid: "Dry heat and alkaline soil are outside a Pacific Northwest native range.",
      tropical: "It needs a cool season and a real winter.",
    },
    caution: {
      humid: "It can live in humidity, but it is at its best in the marine West.",
      mediterranean: "A long dry summer is harder than a Willamette August.",
    },
  },
  coastal: {
    avoid: {
      arid: "Inland desert heat and alkaline soil are the wrong site.",
      continental: "Hard freezes and dry winter wind are outside a coastal range.",
    },
    caution: {
      humid: "Salt and fog are fine. Stagnant summer humidity is a different climate.",
    },
  },
  "interior-west": {
    avoid: {
      humid: "Humid summers and heavy soil are outside the interior West.",
      tropical: "No dry air, and no winter chill.",
    },
    caution: {
      marine: "A mild winter is fine if the soil drains. Wet clay is a poor bet.",
    },
  },
  cascade: {
    avoid: {
      arid: "Hot desert air is the opposite of a Cascade mountain plant.",
      tropical: "It wants a long cold rest.",
    },
    caution: {
      marine: "Cool is fine. Waterlogged valley soil is the risk.",
      humid: "Warm humidity invites disease it does not meet in the mountains.",
    },
  },
  "large-tree": {},
  "drought-tolerant-mature": {
    caution: {
      mediterranean: "Dry summers are fine once it is established. Water it the first two years.",
    },
  },
  "needs-acid": {
    avoid: {
      arid: "Alkaline desert soil yellows acid-loving plants.",
    },
    caution: {
      mediterranean: "It can work in a raised, acid bed with summer water.",
    },
  },
  "low-desert": {
    avoid: {
      marine: "A wet winter kills a low-desert plant.",
      humid: "Humidity and poor drainage take it out.",
      continental: "Hard freezes split it.",
      tropical: "It still wants a dry season.",
    },
  },
};

type Bucket = "avoid" | "caution";

function otherBucket(bucket: Bucket): Bucket {
  switch (bucket) {
    case "avoid":
      return "caution";
    case "caution":
      return "avoid";
    default: {
      const neverBucket: never = bucket;
      return neverBucket;
    }
  }
}

function assertTagTable() {
  for (const tag of CLIMATE_TAG_IDS) {
    const notes = CLIMATE_TAG_NOTES[tag];
    for (const climate of CLIMATES) {
      if (notes.avoid?.[climate] && notes.caution?.[climate]) {
        throw new Error(`Tag "${tag}" sets both avoid and caution for ${climate}`);
      }
    }
  }
}

let tableChecked = false;

export function expandClimateTags(
  tags: readonly ClimateTag[] | undefined,
  explicitAvoid: ClimateNoteMap | undefined,
  explicitCaution: ClimateNoteMap | undefined,
): { avoid: ClimateNoteMap; caution: ClimateNoteMap } {
  if (!tableChecked) {
    assertTagTable();
    tableChecked = true;
  }

  const generated: Record<Bucket, ClimateNoteMap> = { avoid: {}, caution: {} };
  const owners: Record<Bucket, Partial<Record<Climate, ClimateTag>>> = { avoid: {}, caution: {} };

  for (const tag of tags ?? []) {
    const notes = CLIMATE_TAG_NOTES[tag];
    applyTag(tag, "avoid", notes.avoid, generated, owners);
    applyTag(tag, "caution", notes.caution, generated, owners);
  }

  const avoid: ClimateNoteMap = {};
  const caution: ClimateNoteMap = {};
  for (const climate of Object.keys(explicitAvoid ?? {}) as Climate[]) {
    const text = explicitAvoid?.[climate];
    if (text) avoid[climate] = text;
  }
  for (const climate of Object.keys(explicitCaution ?? {}) as Climate[]) {
    const text = explicitCaution?.[climate];
    if (text) caution[climate] = text;
  }
  for (const climate of CLIMATES) {
    if (avoid[climate] || caution[climate]) continue;
    if (generated.avoid[climate]) avoid[climate] = generated.avoid[climate];
    else if (generated.caution[climate]) caution[climate] = generated.caution[climate];
  }
  return { avoid, caution };
}

function applyTag(
  tag: ClimateTag,
  bucket: Bucket,
  notes: ClimateNoteMap | undefined,
  generated: Record<Bucket, ClimateNoteMap>,
  owners: Record<Bucket, Partial<Record<Climate, ClimateTag>>>,
) {
  if (!notes) return;
  const other = otherBucket(bucket);
  for (const climate of CLIMATES) {
    const text = notes[climate];
    if (!text) continue;
    const existing = generated[bucket][climate];
    if (existing && existing !== text) {
      throw new Error(
        `Tags "${owners[bucket][climate]}" and "${tag}" disagree on ${bucket}.${climate}`,
      );
    }
    if (generated[other][climate]) {
      throw new Error(`Tags "${owners[other][climate]}" and "${tag}" both speak for ${climate}`);
    }
    generated[bucket][climate] = text;
    owners[bucket][climate] = tag;
  }
}

/** Explicit copy must survive expansion. Tagless rows must not gain notes. */
export function expansionDrift(
  row: { tags?: readonly string[]; avoid?: ClimateNoteMap; caution?: ClimateNoteMap },
  expanded: { avoid: ClimateNoteMap; caution: ClimateNoteMap },
): string | null {
  const buckets: Bucket[] = ["avoid", "caution"];
  for (const bucket of buckets) {
    const explicit = row[bucket] ?? {};
    for (const climate of Object.keys(explicit) as Climate[]) {
      if (expanded[bucket][climate] !== explicit[climate]) {
        return `explicit ${bucket}.${climate} was not kept`;
      }
    }
    if (row.tags?.length) continue;
    for (const climate of Object.keys(expanded[bucket]) as Climate[]) {
      if (explicit[climate] !== expanded[bucket][climate]) {
        return `tagless row gained ${bucket}.${climate}`;
      }
    }
  }
  return null;
}
