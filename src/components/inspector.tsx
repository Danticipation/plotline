import { advisePlaced, lotReview } from "@/lib/advice";
import { getPlace } from "@/lib/climate";
import { cn } from "@/lib/cn";
import { formatFt } from "@/lib/format";
import { KIND_LABEL, getPlant } from "@/lib/plants";
import { usePlot } from "@/lib/store";
import type { Sun, Verdict } from "@/lib/types";
import { Button } from "@/components/ui/button";

const SUNS: { id: Sun; label: string }[] = [
  { id: "full", label: "Full sun" },
  { id: "part", label: "Part shade" },
  { id: "shade", label: "Shade" },
];

export function VerdictBar({ onOpen }: { onOpen: () => void }) {
  const lot = usePlot((state) => state.lot);
  const selected = usePlot((state) => state.selected);
  const review = lotReview(lot);
  let badge: Verdict | null = null;
  let text = "Drag a plant onto the lot. Circles are mature size.";
  if (selected?.kind === "plant") {
    const placed = lot.placed.find((plant) => plant.id === selected.id);
    const advice = placed ? advisePlaced(placed, lot) : null;
    const plant = placed ? getPlant(placed.plantId) : null;
    if (advice && plant) {
      badge = advice.verdict;
      text = advice.headline;
    }
  } else if (selected?.kind === "spot") {
    const spot = lot.spots.find((item) => item.id === selected.id);
    if (spot) text = `${spot.name}. ${spot.sun === "full" ? "Full sun" : spot.sun === "part" ? "Part shade" : "Shade"}.`;
  } else if (review.nos.length) {
    badge = "no";
    text = `${review.nos.length} ${review.nos.length === 1 ? "plant does" : "plants do"} not belong. Tap for why.`;
  } else if (lot.placed.length) {
    badge = "yes";
    text = `${lot.placed.length} planted. Nothing here is a hard no.`;
  }

  return (
    <button type="button" onClick={onOpen} className="flex w-full items-start gap-3 border-t border-line bg-paper px-3 py-3 text-left xl:hidden">
      {badge && <Badge verdict={badge} />}
      <span className="line-clamp-2 text-sm leading-snug">{text}</span>
    </button>
  );
}

export function InspectorBody({ onAsk }: { onAsk: () => void }) {
  const lot = usePlot((state) => state.lot);
  const unit = usePlot((state) => state.unit);
  const selected = usePlot((state) => state.selected);
  const removePlant = usePlot((state) => state.removePlant);
  const removeSpot = usePlot((state) => state.removeSpot);
  const updateSpot = usePlot((state) => state.updateSpot);
  const select = usePlot((state) => state.select);
  const place = getPlace(lot.placeId);
  const zone = lot.zoneOverride || place?.zone;

  if (selected?.kind === "plant") {
    const placed = lot.placed.find((plant) => plant.id === selected.id);
    const plant = placed ? getPlant(placed.plantId) : null;
    const advice = placed ? advisePlaced(placed, lot) : null;
    if (!placed || !plant || !advice) return <p className="p-4 text-sm text-muted">That plant is gone.</p>;
    return (
      <div className="flex flex-col gap-4 p-4">
        <div>
          <p className="text-xs tracking-wide text-muted uppercase">What it is</p>
          <h2 className="font-display text-3xl leading-tight">{plant.name}</h2>
          <p className="text-sm text-muted italic">{plant.latin}</p>
          <p className="pt-2 text-sm leading-relaxed">{plant.note}</p>
          <p className="pt-2 text-sm text-muted">
            {KIND_LABEL[plant.kind]} · zones {plant.zoneMin}–{plant.zoneMax} · {sunWord(plant.sun)} · {plant.water} water
          </p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-muted uppercase">Size</p>
          <p className="text-sm tabular-nums">
            {formatFt(plant.heightFt, unit, plant.heightFt < 1 ? 1 : 0)} tall · {formatFt(plant.spreadFt, unit, plant.spreadFt < 1 ? 1 : 0)} across
          </p>
          <p className="text-sm text-muted">Drawn at mature spread, to scale. Not a nursery pot.</p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-muted uppercase">Should it go here</p>
          <div className="flex items-center gap-2 pt-1">
            <Badge verdict={advice.verdict} />
            {advice.spotName && <span className="text-sm text-muted">In the {advice.spotName.toLowerCase()}</span>}
          </div>
          <p className="pt-2 text-sm leading-relaxed">{advice.headline}</p>
          {advice.reasons.length > 1 && (
            <ul className="list-disc pt-2 pl-4 text-sm leading-relaxed text-muted">
              {advice.reasons.slice(1).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
          {advice.nearest && (
            <p className="pt-2 text-sm text-muted">
              Nearest neighbor is the {advice.nearest.name.toLowerCase()}, {advice.nearest.feet} ft away.
            </p>
          )}
        </div>
        <Button variant="clay" onClick={() => removePlant(placed.id)}>
          Pull it out
        </Button>
      </div>
    );
  }

  if (selected?.kind === "spot") {
    const spot = lot.spots.find((item) => item.id === selected.id);
    if (!spot) return <p className="p-4 text-sm text-muted">That spot is gone.</p>;
    const sunLocked = spot.kind === "structure" || spot.kind === "patio" || spot.kind === "path" || spot.kind === "water";
    return (
      <div className="flex flex-col gap-4 p-4">
        <div>
          <p className="text-xs tracking-wide text-muted uppercase">Spot</p>
          <input
            key={spot.id}
            defaultValue={spot.name}
            aria-label="Spot name"
            onBlur={(event) => updateSpot(spot.id, { name: event.target.value.trim().slice(0, 40) || spot.name })}
            className="mt-1 w-full border-b border-line bg-transparent font-display text-3xl outline-none focus:border-moss"
          />
          <p className="pt-2 text-sm text-muted tabular-nums">
            {formatFt(spot.w, unit)} wide · {formatFt(spot.h, unit)} deep
          </p>
        </div>
        {!sunLocked && (
          <div>
            <p className="pb-2 text-xs tracking-wide text-muted uppercase">Sun in this spot</p>
            <div className="grid grid-cols-3 gap-1">
              {SUNS.map((sun) => (
                <button
                  key={sun.id}
                  type="button"
                  aria-pressed={spot.sun === sun.id}
                  onClick={() => updateSpot(spot.id, { sun: sun.id })}
                  className={cn("h-11 rounded-md text-sm", spot.sun === sun.id ? "bg-ink text-paper" : "border border-line")}
                >
                  {sun.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <p className="text-sm leading-relaxed text-muted">
          Drag plants into this spot, or drag them back to the list to pull them out. North of the house reads as shade.
        </p>
        <Button variant="clay" onClick={() => removeSpot(spot.id)}>
          Remove spot
        </Button>
      </div>
    );
  }

  const review = lotReview(lot);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="text-xs tracking-wide text-muted uppercase">This lot</p>
        <h2 className="font-display text-3xl leading-tight">{lot.name}</h2>
        <p className="pt-1 text-sm text-muted">
          {place?.name} · zone {zone} · {lot.soil} soil
        </p>
        {place && <p className="pt-2 text-sm leading-relaxed">{place.blurb}</p>}
        <p className="pt-2 text-sm tabular-nums text-muted">
          {formatFt(lot.widthFt, unit)} × {formatFt(lot.depthFt, unit)} · about {place?.rainIn} in of rain
        </p>
      </div>
      <div>
        <p className="text-sm leading-relaxed">
          {lot.placed.length === 0
            ? "Nothing planted yet. The circles you drop are mature spread, so a bad fit shows up before you dig."
            : review.nos.length
              ? `${review.nos.length} should come out. The rest can stay, with the notes on the marginal ones.`
              : review.marginals.length
                ? "No hard refusals. A few are marginal — open them before you commit."
                : "Everything planted can live in this climate, in the spot it sits."}
        </p>
        <ul className="pt-2">
          {review.nos.map((row) => (
            <li key={row.placed.id}>
              <button type="button" className="flex w-full items-start gap-2 py-2 text-left" onClick={() => select({ kind: "plant", id: row.placed.id })}>
                <Badge verdict="no" />
                <span className="text-sm">{row.plant.name}</span>
              </button>
            </li>
          ))}
          {review.marginals.map((row) => (
            <li key={row.placed.id}>
              <button type="button" className="flex w-full items-start gap-2 py-2 text-left" onClick={() => select({ kind: "plant", id: row.placed.id })}>
                <Badge verdict="marginal" />
                <span className="text-sm">{row.plant.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Button variant="primary" onClick={onAsk}>
        Ask Plotline
      </Button>
    </div>
  );
}

export function Badge({ verdict }: { verdict: Verdict }) {
  const label = verdict === "yes" ? "Yes" : verdict === "no" ? "No" : "Marginal";
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-md px-2 text-xs font-medium",
        verdict === "yes" && "bg-moss text-paper",
        verdict === "no" && "bg-clay text-paper",
        verdict === "marginal" && "border border-ink text-ink",
      )}
    >
      {label}
    </span>
  );
}

function sunWord(sun: Sun) {
  if (sun === "full") return "full sun";
  if (sun === "part") return "part shade";
  return "shade";
}
