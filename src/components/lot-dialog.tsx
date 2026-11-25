import { useState } from "react";
import { X } from "lucide-react";
import { PLACES, getPlace } from "@/lib/climate";
import { fromDisplay, toDisplay } from "@/lib/format";
import { usePlot } from "@/lib/store";
import type { Soil, Unit } from "@/lib/types";
import { Button } from "@/components/ui/button";

const SOILS: { id: Soil; label: string }[] = [
  { id: "loam", label: "Loam" },
  { id: "clay", label: "Clay" },
  { id: "sand", label: "Sand" },
  { id: "unknown", label: "Unsure" },
];

const ZONES = Array.from({ length: 9 }, (_, index) => [`${index + 3}a`, `${index + 3}b`]).flat();

export function LotDialog({ onClose }: { onClose: () => void }) {
  const lot = usePlot((state) => state.lot);
  const unit = usePlot((state) => state.unit);
  const setUnit = usePlot((state) => state.setUnit);
  const setLotMeta = usePlot((state) => state.setLotMeta);
  const clearPlants = usePlot((state) => state.clearPlants);
  const reset = usePlot((state) => state.reset);
  const [name, setName] = useState(lot.name);
  const [width, setWidth] = useState(String(Math.round(toDisplay(lot.widthFt, unit) * 10) / 10));
  const [depth, setDepth] = useState(String(Math.round(toDisplay(lot.depthFt, unit) * 10) / 10));
  const [placeId, setPlaceId] = useState(lot.placeId);
  const [soil, setSoil] = useState<Soil>(lot.soil);
  const [zone, setZone] = useState(lot.zoneOverride ?? "");
  const [confirmClear, setConfirmClear] = useState(false);
  const [error, setError] = useState("");
  const place = getPlace(placeId);

  function apply() {
    const widthFt = fromDisplay(Number(width), unit);
    const depthFt = fromDisplay(Number(depth), unit);
    if (!Number.isFinite(widthFt) || !Number.isFinite(depthFt) || widthFt < 10 || depthFt < 10 || widthFt > 400 || depthFt > 400) {
      setError("Keep each side between 10 and 400 feet.");
      return;
    }
    setLotMeta({
      name: name.trim() || "Back lot",
      widthFt: Math.round(widthFt * 2) / 2,
      depthFt: Math.round(depthFt * 2) / 2,
      placeId,
      soil,
      zoneOverride: zone || null,
    });
    onClose();
  }

  function changeUnit(next: Unit) {
    if (next === unit) return;
    const widthFt = fromDisplay(Number(width), unit);
    const depthFt = fromDisplay(Number(depth), unit);
    setUnit(next);
    if (Number.isFinite(widthFt)) setWidth(String(Math.round(toDisplay(widthFt, next) * 10) / 10));
    if (Number.isFinite(depthFt)) setDepth(String(Math.round(toDisplay(depthFt, next) * 10) / 10));
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="lot-title">
      <div className="max-h-5/6 w-full overflow-y-auto border border-line bg-paper p-5 sm:max-w-lg sm:rounded-lg">
        <div className="flex items-start gap-3">
          <h2 id="lot-title" className="font-display text-3xl leading-none">The lot</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="ml-auto inline-flex size-11 items-center justify-center rounded-md border border-line">
            <X className="size-4" />
          </button>
        </div>
        <label className="mt-4 block text-sm">
          Name
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-moss" />
        </label>
        <div className="flex gap-2 pt-3">
          {(["ft", "m"] as const).map((item) => (
            <button key={item} type="button" aria-pressed={unit === item} onClick={() => changeUnit(item)} className={`h-11 rounded-md px-4 text-sm ${unit === item ? "bg-ink text-paper" : "border border-line"}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 pt-3">
          <label className="text-sm">
            Width
            <input inputMode="decimal" value={width} onChange={(event) => setWidth(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 tabular-nums outline-none focus:border-moss" />
          </label>
          <label className="text-sm">
            Depth
            <input inputMode="decimal" value={depth} onChange={(event) => setDepth(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 tabular-nums outline-none focus:border-moss" />
          </label>
        </div>
        <p className="pt-2 text-xs text-muted">Plants that land outside a smaller lot get removed.</p>
        <label className="mt-4 block text-sm">
          City
          <select value={placeId} onChange={(event) => setPlaceId(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-moss">
            {PLACES.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label className="mt-3 block text-sm">
          Zone override
          <select value={zone} onChange={(event) => setZone(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-moss">
            <option value="">Use {place?.zone ?? "the city zone"}</option>
            {ZONES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-4 gap-1 pt-4">
          {SOILS.map((item) => (
            <button key={item.id} type="button" aria-pressed={soil === item.id} onClick={() => setSoil(item.id)} className={`h-11 rounded-md text-sm ${soil === item.id ? "bg-ink text-paper" : "border border-line"}`}>
              {item.label}
            </button>
          ))}
        </div>
        {error && <p className="pt-3 text-sm text-clay">{error}</p>}
        <Button variant="primary" className="mt-4 w-full" onClick={apply}>Save the lot</Button>
        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
          {confirmClear ? (
            <Button variant="clay" onClick={() => { clearPlants(); setConfirmClear(false); }}>Confirm, pull every plant</Button>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmClear(true)}>Pull every plant</Button>
          )}
          <Button variant="ghost" onClick={() => { reset(); onClose(); }}>Start a different lot</Button>
        </div>
      </div>
    </div>
  );
}
