import { useState } from "react";
import { X } from "lucide-react";
import { lotReview } from "@/lib/advice";
import { askPlotline, type AskMove } from "@/lib/advise.functions";
import { getPlace } from "@/lib/climate";
import { usePlot } from "@/lib/store";
import { Badge } from "@/components/inspector";
import { Button } from "@/components/ui/button";

export function AskPanel({ onClose }: { onClose: () => void }) {
  const lot = usePlot((state) => state.lot);
  const addPlacements = usePlot((state) => state.addPlacements);
  const place = getPlace(lot.placeId);
  const review = lotReview(lot);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [moves, setMoves] = useState<AskMove[]>([]);
  const [placed, setPlaced] = useState(false);

  async function ask() {
    setLoading(true);
    setError("");
    try {
      const result = await askPlotline({
        data: {
          placeId: lot.placeId,
          zoneOverride: lot.zoneOverride,
          soil: lot.soil,
          name: lot.name,
          widthFt: lot.widthFt,
          depthFt: lot.depthFt,
          spots: lot.spots.map(({ name, kind, x, y, w, h, sun }) => ({ name, kind, x, y, w, h, sun })),
          placed: lot.placed.map(({ plantId, x, y }) => ({ plantId, x, y })),
        },
      });
      if (!result.ok) {
        setError(result.error);
        setSummary("");
        setMoves([]);
      } else {
        setSummary(result.summary);
        setMoves(result.moves);
        setPlaced(false);
      }
    } catch {
      setError("The assistant did not answer. The yes or no on each plant still stands.");
    } finally {
      setLoading(false);
    }
  }

  function dropAll() {
    addPlacements(moves.map((move) => ({ plantId: move.plantId, x: move.xFt, y: move.yFt })));
    setPlaced(true);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="ask-title">
      <div className="max-h-5/6 w-full overflow-y-auto border border-line bg-paper p-5 sm:max-w-lg sm:rounded-lg">
        <div className="flex items-start gap-3">
          <h2 id="ask-title" className="font-display text-3xl leading-none">Ask Plotline</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="ml-auto inline-flex size-11 items-center justify-center rounded-md border border-line">
            <X className="size-4" />
          </button>
        </div>
        <p className="pt-3 text-sm leading-relaxed text-muted">
          {place?.name}, zone {lot.zoneOverride || place?.zone}. The yes or no under each plant is instant. This asks once for a layout, in writing.
        </p>
        <p className="pt-3 text-sm leading-relaxed">
          {lot.placed.length === 0
            ? "The lot is empty. A layout can start it."
            : review.nos.length
              ? `${review.nos.length} already planted should come out.`
              : "Nothing planted is a hard no."}
        </p>
        <ul className="pt-2">
          {review.nos.slice(0, 4).map((row) => (
            <li key={row.placed.id} className="flex items-center gap-2 py-1">
              <Badge verdict="no" />
              <span className="text-sm">{row.plant.name}</span>
            </li>
          ))}
        </ul>
        <Button variant="primary" className="mt-4" onClick={ask} disabled={loading}>
          {loading ? "Reading the lot…" : summary ? "Ask again" : "Ask for a layout"}
        </Button>
        {error && <p className="pt-3 text-sm text-clay">{error}</p>}
        {summary && (
          <div className="pt-4">
            <p className="text-sm leading-relaxed">{summary}</p>
            {moves.length > 0 && (
              <ul className="pt-3">
                {moves.map((move) => (
                  <li key={`${move.plantId}-${move.xFt}-${move.yFt}`} className="border-t border-line py-3">
                    <p className="text-sm font-medium">{move.name}</p>
                    <p className="text-sm text-muted">{move.note}</p>
                  </li>
                ))}
              </ul>
            )}
            {moves.length > 0 && (
              <Button variant="ink" className="mt-2" onClick={dropAll} disabled={placed}>
                {placed ? "Placed on the lot" : "Drop these on the lot"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
