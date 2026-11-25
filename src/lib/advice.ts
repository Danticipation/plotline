import { climateLabel, getPlace, zoneRank } from "@/lib/climate";
import { getPlant, type Plant } from "@/lib/plants";
import type { Lot, Placed, Spot, SpotKind, Sun, Verdict } from "@/lib/types";

export type Advice = {
  verdict: Verdict;
  headline: string;
  reasons: string[];
  sun: Sun;
  spotName: string | null;
  spotKind: SpotKind | null;
  nearest: { name: string; feet: number } | null;
};

type Issue = { level: "no" | "marginal"; text: string };

export function effectiveZone(lot: Lot) {
  const place = getPlace(lot.placeId);
  return lot.zoneOverride || place?.zone || "8a";
}

export function spotAt(lot: Lot, x: number, y: number): Spot | null {
  for (let i = lot.spots.length - 1; i >= 0; i--) {
    const spot = lot.spots[i];
    if (x >= spot.x && y >= spot.y && x <= spot.x + spot.w && y <= spot.y + spot.h) return spot;
  }
  return null;
}

function sunHere(lot: Lot, x: number, y: number): { sun: Sun; spot: Spot | null } {
  const spot = spotAt(lot, x, y);
  if (spot && (spot.kind === "bed" || spot.kind === "lawn")) return { sun: spot.sun, spot };
  if (spot) return { sun: spot.sun, spot };
  for (const structure of lot.spots) {
    if (structure.kind !== "structure") continue;
    const northBand =
      x >= structure.x &&
      x <= structure.x + structure.w &&
      y < structure.y &&
      structure.y - y <= 10 &&
      y >= 0;
    if (northBand) return { sun: "shade", spot: null };
  }
  return { sun: "full", spot: null };
}

function distToRect(px: number, py: number, spot: Spot) {
  const cx = Math.max(spot.x, Math.min(px, spot.x + spot.w));
  const cy = Math.max(spot.y, Math.min(py, spot.y + spot.h));
  return Math.hypot(px - cx, py - cy);
}

function sunIssue(need: Sun, site: Sun): Issue | null {
  if (need === site) return null;
  if (need === "full" && site === "shade") {
    return { level: "no", text: "It wants full sun. This spot is shade, and it will stall." };
  }
  if (need === "shade" && site === "full") {
    return { level: "no", text: "It wants shade. Full sun here will scorch it." };
  }
  if (need === "full" && site === "part") {
    return { level: "marginal", text: "It prefers full sun. Part shade slows it. It does not kill it." };
  }
  if (need === "shade" && site === "part") {
    return { level: "marginal", text: "It prefers deeper shade than this part-sun spot." };
  }
  if (need === "part" && site === "full") {
    return { level: "marginal", text: "Part shade is the sweet spot. Full sun here is a little harsh." };
  }
  if (need === "part" && site === "shade") {
    return { level: "marginal", text: "It will live in shade, and flower better with some sun." };
  }
  return null;
}

export function climateIssues(plant: Plant, lot: Lot): Issue[] {
  const place = getPlace(lot.placeId);
  if (!place) return [];
  const zone = effectiveZone(lot);
  const issues: Issue[] = [];
  const avoided = plant.avoid[place.climate];
  if (avoided) {
    issues.push({
      level: "no",
      text: `${avoided} ${place.name} is ${climateLabel(place.climate)}.`,
    });
  }
  const rank = zoneRank(zone);
  const min = zoneRank(plant.zoneMin);
  const max = zoneRank(plant.zoneMax);
  if (rank < min - 2) {
    issues.push({
      level: "no",
      text: `Hardy from ${plant.zoneMin} to ${plant.zoneMax}. Zone ${zone} is colder than it survives.`,
    });
  } else if (rank > max + 2) {
    issues.push({
      level: "no",
      text: `Listed through ${plant.zoneMax}. Zone ${zone} stays too warm for it.`,
    });
  } else if (rank < min) {
    issues.push({
      level: "marginal",
      text: `Zone ${zone} is a step colder than its usual ${plant.zoneMin}–${plant.zoneMax}.`,
    });
  } else if (rank > max) {
    issues.push({
      level: "marginal",
      text: `Zone ${zone} is warmer than its listing, ${plant.zoneMin}–${plant.zoneMax}.`,
    });
  }
  const caution = plant.caution[place.climate];
  if (caution && !avoided) {
    issues.push({ level: "marginal", text: caution });
  }
  return issues;
}

export function climateVerdict(plant: Plant, lot: Lot): Verdict {
  const issues = climateIssues(plant, lot);
  if (issues.some((issue) => issue.level === "no")) return "no";
  if (issues.some((issue) => issue.level === "marginal")) return "marginal";
  return "yes";
}

function woody(plant: Plant) {
  return plant.kind === "tree" || plant.kind === "evergreen" || (plant.kind === "edible" && plant.heightFt >= 8);
}

export function adviseAt(plantId: string, x: number, y: number, lot: Lot, ignoreId?: string): Advice | null {
  const plant = getPlant(plantId);
  const place = getPlace(lot.placeId);
  if (!plant || !place) return null;
  const zone = effectiveZone(lot);
  const { sun, spot } = sunHere(lot, x, y);
  const issues: Issue[] = [];

  if (x < 0 || y < 0 || x > lot.widthFt || y > lot.depthFt) {
    issues.push({ level: "no", text: "The trunk is off the property." });
  }

  if (spot && (spot.kind === "structure" || spot.kind === "patio" || spot.kind === "path" || spot.kind === "water")) {
    issues.push({
      level: "no",
      text: `That's the ${spot.name.toLowerCase()}, not soil. Pull it back into a bed.`,
    });
  }

  issues.push(...climateIssues(plant, lot));

  const sunProblem = sunIssue(plant.sun, sun);
  if (sunProblem) issues.push(sunProblem);

  if (plant.spreadFt > lot.widthFt * 0.9 || plant.spreadFt > lot.depthFt * 0.9) {
    issues.push({
      level: "no",
      text: `It wants about ${Math.round(plant.spreadFt)} ft across. The lot is ${Math.round(lot.widthFt)} by ${Math.round(lot.depthFt)}. It does not fit.`,
    });
  } else if (plant.spreadFt > lot.widthFt * 0.7 || plant.spreadFt > lot.depthFt * 0.7) {
    issues.push({
      level: "marginal",
      text: `At ${Math.round(plant.spreadFt)} ft across, this plant will own a lot that is only ${Math.round(lot.widthFt)} by ${Math.round(lot.depthFt)}.`,
    });
  }

  if (woody(plant)) {
    for (const structure of lot.spots) {
      if (structure.kind !== "structure") continue;
      const dist = distToRect(x, y, structure);
      const min = Math.max(6, Math.min(16, plant.spreadFt * 0.45));
      if (dist > 0.4 && dist < min * 0.65) {
        issues.push({
          level: "no",
          text: `Too close to the ${structure.name.toLowerCase()}. A ${Math.round(plant.heightFt)} ft ${plant.name.toLowerCase()} needs about ${Math.round(min)} ft or it hits the eaves and the foundation.`,
        });
        break;
      }
      if (dist > 0.4 && dist < min) {
        issues.push({
          level: "marginal",
          text: `Close to the ${structure.name.toLowerCase()}. Give it closer to ${Math.round(min)} ft so the mature crown stays off the roof.`,
        });
        break;
      }
    }
  }

  let nearest: Advice["nearest"] = null;
  let worstSpace: Issue | null = null;
  const radius = plant.spreadFt / 2;
  const strict = woody(plant) || plant.kind === "shrub";
  for (const other of lot.placed) {
    if (other.id === ignoreId) continue;
    const neighbor = getPlant(other.plantId);
    if (!neighbor) continue;
    const dist = Math.hypot(other.x - x, other.y - y);
    if (!nearest || dist < nearest.feet) nearest = { name: neighbor.name, feet: dist };
    const need = ((radius + neighbor.spreadFt / 2) * (strict ? 0.85 : 0.5));
    if (dist < need * 0.6 && strict) {
      const issue: Issue = {
        level: "no",
        text: `${Math.round(dist)} ft from the ${neighbor.name.toLowerCase()}. Their crowns will lock together. They want about ${Math.round(need)} ft.`,
      };
      if (!worstSpace || worstSpace.level === "marginal") worstSpace = issue;
    } else if (dist < need && strict) {
      if (!worstSpace) {
        worstSpace = {
          level: "marginal",
          text: `${Math.round(dist)} ft from the ${neighbor.name.toLowerCase()}. A little tight once both are grown.`,
        };
      }
    }
  }
  if (worstSpace) issues.push(worstSpace);

  const overhang = Math.max(
    0,
    radius - x,
    x + radius - lot.widthFt,
    radius - y,
    y + radius - lot.depthFt,
  );
  if (woody(plant) || plant.kind === "shrub") {
    if (overhang > radius * 0.45) {
      issues.push({
        level: "no",
        text: "More than half the mature canopy crosses the property line.",
      });
    } else if (overhang > 2) {
      issues.push({
        level: "marginal",
        text: `The mature canopy crosses the lot line by about ${Math.round(overhang)} ft.`,
      });
    }
  }

  if (plant.water === "low" && lot.soil === "clay") {
    issues.push({
      level: "marginal",
      text: "Clay holds winter water. This plant wants drainage. A raised or gritty bed is the difference.",
    });
  }
  if (plant.water === "high" && lot.soil === "sand") {
    issues.push({
      level: "marginal",
      text: "Sand dries fast, and this one wants steady moisture.",
    });
  }

  if (spot && (spot.kind === "bed" || spot.kind === "lawn")) {
    const mates = lot.placed.filter((other) => {
      if (other.id === ignoreId) return false;
      return spotAt(lot, other.x, other.y)?.id === spot.id;
    });
    const waters = new Set(
      mates
        .map((other) => getPlant(other.plantId)?.water)
        .filter((water): water is NonNullable<typeof water> => Boolean(water)),
    );
    waters.add(plant.water);
    if (waters.has("low") && waters.has("high")) {
      issues.push({
        level: "marginal",
        text: "This bed mixes a dry plant with a thirsty one. They will not share a hose happily.",
      });
    }
  }

  if (spot?.kind === "lawn" && (plant.kind === "ground" || plant.kind === "perennial")) {
    issues.push({
      level: "marginal",
      text: "The lawn will swallow this. Put it in a bed.",
    });
  }

  const nos = issues.filter((issue) => issue.level === "no");
  const marginals = issues.filter((issue) => issue.level === "marginal");
  const verdict: Verdict = nos.length ? "no" : marginals.length ? "marginal" : "yes";
  const where = spot ? `the ${spot.name.toLowerCase()}` : "open ground";
  const sunWord = sun === "full" ? "full sun" : sun === "part" ? "part shade" : "shade";
  let headline: string;
  if (verdict === "no") headline = `No. ${nos[0].text}`;
  else if (verdict === "marginal") headline = `Marginal. ${marginals[0].text}`;
  else {
    headline = `Yes. ${plant.name} fits zone ${zone} at ${place.name}, ${where} gives it ${sunWord}, and a ${Math.round(plant.spreadFt)} ft canopy stays in bounds.`;
  }

  return {
    verdict,
    headline,
    reasons: issues.map((issue) => issue.text),
    sun,
    spotName: spot?.name ?? null,
    spotKind: spot?.kind ?? null,
    nearest: nearest ? { name: nearest.name, feet: Math.round(nearest.feet) } : null,
  };
}

export function advisePlaced(placed: Placed, lot: Lot) {
  return adviseAt(placed.plantId, placed.x, placed.y, lot, placed.id);
}

export function lotReview(lot: Lot) {
  const rows = lot.placed
    .map((placed) => {
      const plant = getPlant(placed.plantId);
      const advice = advisePlaced(placed, lot);
      if (!plant || !advice) return null;
      return { placed, plant, advice };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
  const nos = rows.filter((row) => row.advice.verdict === "no");
  const marginals = rows.filter((row) => row.advice.verdict === "marginal");
  return { rows, nos, marginals, yes: rows.length - nos.length - marginals.length };
}
