import { useMemo, useState, type PointerEvent } from "react";
import { climateVerdict } from "@/lib/advice";
import { cn } from "@/lib/cn";
import { formatFt } from "@/lib/format";
import { FILTERS, PLANTS } from "@/lib/plants";
import { PlantMark } from "@/components/plant-mark";
import { usePlot } from "@/lib/store";
import type { PlantKind, Verdict } from "@/lib/types";

export function PlantRail({
  lifting,
  onPlantPointerDown,
}: {
  lifting: boolean;
  onPlantPointerDown: (event: PointerEvent<HTMLButtonElement>, plantId: string) => void;
}) {
  const lot = usePlot((state) => state.lot);
  const unit = usePlot((state) => state.unit);
  const [filter, setFilter] = useState<"all" | PlantKind>("all");
  const [query, setQuery] = useState("");
  const [fitsOnly, setFitsOnly] = useState(true);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLANTS.map((plant) => ({ plant, verdict: climateVerdict(plant, lot) }))
      .filter((row) => (filter === "all" ? true : row.plant.kind === filter))
      .filter((row) => (q ? `${row.plant.name} ${row.plant.latin}`.toLowerCase().includes(q) : true))
      .filter((row) => (fitsOnly ? row.verdict !== "no" : true))
      .sort((a, b) => verdictRank(a.verdict) - verdictRank(b.verdict) || a.plant.name.localeCompare(b.plant.name));
  }, [filter, query, fitsOnly, lot]);

  return (
    <aside
      data-plant-rail
      data-pullout={lifting ? "" : undefined}
      className={cn(
        "flex min-h-0 shrink-0 flex-col border-line bg-paper",
        "max-md:order-2 max-md:border-t md:order-1 md:w-72 md:border-r",
        lifting && "bg-paper-deep",
      )}
    >
      <div className="flex items-center gap-2 px-3 pt-3">
        <h2 className="font-display text-xl leading-none">{lifting ? "Pull out" : "Plants"}</h2>
        <button
          type="button"
          aria-pressed={fitsOnly}
          onClick={() => setFitsOnly((value) => !value)}
          className={cn(
            "ml-auto h-10 rounded-md px-3 text-sm",
            fitsOnly ? "bg-moss text-paper" : "border border-line text-ink",
          )}
        >
          Fits here
        </button>
      </div>
      <p className="px-3 pt-1 text-xs text-muted">
        {lifting ? "Release over this list to pull the plant out." : "Tap to drop one in a bed, or drag it to a spot."}
      </p>
      <div className="flex items-center gap-2 overflow-x-auto px-3 py-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search"
          aria-label="Search plants"
          className="h-10 w-28 shrink-0 rounded-md border border-line bg-paper px-3 text-sm text-ink outline-none focus:border-moss"
        />
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              "h-10 shrink-0 rounded-md px-3 text-sm",
              filter === item.id ? "bg-ink text-paper" : "text-muted",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex min-h-0 gap-2 overflow-auto px-3 pb-3 max-md:h-32 md:flex-1 md:flex-col">
        {rows.length === 0 && (
          <p className="px-1 text-sm text-muted">
            Nothing in this climate under that filter.{" "}
            <button type="button" className="underline" onClick={() => setFitsOnly(false)}>
              Show plants that do not belong
            </button>
          </p>
        )}
        {rows.map(({ plant, verdict }) => (
          <button
            key={plant.id}
            type="button"
            onPointerDown={(event) => onPlantPointerDown(event, plant.id)}
            className="flex w-40 shrink-0 items-center gap-2 rounded-md border border-line bg-paper p-2 text-left md:w-auto"
          >
            <PlantMark kind={plant.kind} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{plant.name}</span>
              <span className="block text-xs text-muted tabular-nums">
                {formatFt(plant.heightFt, unit, plant.heightFt < 1 ? 1 : 0)} × {formatFt(plant.spreadFt, unit, plant.spreadFt < 1 ? 1 : 0)}
              </span>
              <VerdictWord verdict={verdict} />
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function verdictRank(verdict: Verdict) {
  if (verdict === "yes") return 0;
  if (verdict === "marginal") return 1;
  return 2;
}

function VerdictWord({ verdict }: { verdict: Verdict }) {
  if (verdict === "yes") return <span className="text-xs text-moss">Yes for this climate</span>;
  if (verdict === "marginal") return <span className="text-xs text-clay">Marginal here</span>;
  return <span className="text-xs text-clay">No for this climate</span>;
}
