import { useMemo, useState } from "react";
import { LocateFixed } from "lucide-react";
import { PLACES, QUICK_PLACES, getPlace, nearestPlace, suggestedSoil } from "@/lib/climate";
import { cn } from "@/lib/cn";
import { fromDisplay } from "@/lib/format";
import { usePlot } from "@/lib/store";
import type { Soil, Unit } from "@/lib/types";
import { Button } from "@/components/ui/button";

const SOILS: { id: Soil; label: string }[] = [
  { id: "loam", label: "Loam" },
  { id: "clay", label: "Clay" },
  { id: "sand", label: "Sand" },
  { id: "unknown", label: "Unsure" },
];

export function SetupScreen() {
  const configure = usePlot((state) => state.configure);
  const [name, setName] = useState("Back lot");
  const [unit, setUnit] = useState<Unit>("ft");
  const [width, setWidth] = useState("60");
  const [depth, setDepth] = useState("80");
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [soil, setSoil] = useState<Soil>("loam");
  const [soilTouched, setSoilTouched] = useState(false);
  const [typical, setTypical] = useState(true);
  const [locNote, setLocNote] = useState("");
  const [error, setError] = useState("");

  const place = placeId ? getPlace(placeId) : null;
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PLACES.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  function pickPlace(id: string) {
    setPlaceId(id);
    setQuery("");
    if (!soilTouched) {
      const next = getPlace(id);
      if (next) setSoil(suggestedSoil(next.climate));
    }
  }

  function locate() {
    if (!navigator.geolocation) {
      setLocNote("This browser did not share a location. Search the city.");
      return;
    }
    setLocNote("Looking up the nearest climate…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = nearestPlace(pos.coords.latitude, pos.coords.longitude);
        pickPlace(nearest.place.id);
        setLocNote(
          nearest.miles > 80
            ? `Nearest known climate is ${nearest.place.name}, about ${Math.round(nearest.miles)} miles away.`
            : `Using ${nearest.place.name}.`,
        );
      },
      () => setLocNote("Location stayed off. Search the city. The zone is what matters."),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  }

  function open() {
    const widthFt = fromDisplay(Number(width), unit);
    const depthFt = fromDisplay(Number(depth), unit);
    if (!placeId || !place) {
      setError("Pick the city. Climate is how Plotline decides yes or no.");
      return;
    }
    if (!Number.isFinite(widthFt) || !Number.isFinite(depthFt) || widthFt < 10 || depthFt < 10 || widthFt > 400 || depthFt > 400) {
      setError(unit === "ft" ? "Use a lot between 10 and 400 feet on each side." : "Use a lot between about 3 and 120 meters on each side.");
      return;
    }
    setError("");
    configure({
      name,
      widthFt: Math.round(widthFt * 2) / 2,
      depthFt: Math.round(depthFt * 2) / 2,
      soil,
      placeId,
      unit,
      typical,
    });
  }

  return (
    <main className="h-dvh overflow-y-auto bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8">
        <div className="relative border border-line p-5 sm:p-6">
          <Corner className="-top-px -left-px border-t-2 border-l-2" />
          <Corner className="-top-px -right-px border-t-2 border-r-2" />
          <Corner className="-bottom-px -left-px border-b-2 border-l-2" />
          <Corner className="-right-px -bottom-px border-r-2 border-b-2" />
          <p className="text-xs tracking-wide text-muted uppercase">Measured landscape</p>
          <h1 className="font-display text-5xl leading-none">Plotline</h1>
          <p className="max-w-sm pt-3 text-sm leading-relaxed">
            A lot with real dimensions. Trees and plants at their grown size. A straight answer about whether that plant belongs there.
          </p>

          <div className="flex items-center gap-2 pt-5">
            <label className="min-w-0 flex-1 text-sm">
              Lot name
              <input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-moss" />
            </label>
            <div className="pt-5">
              <div className="grid grid-cols-2 gap-1">
                {(["ft", "m"] as const).map((item) => (
                  <button key={item} type="button" aria-pressed={unit === item} onClick={() => setUnit(item)} className={cn("h-11 w-12 rounded-md text-sm", unit === item ? "bg-ink text-paper" : "border border-line")}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
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
          <p className="pt-2 text-xs text-muted">North is the top of the plan. The south side of a house gets the sun.</p>

          <div className="pt-5">
            <div className="flex items-center gap-2">
              <label className="min-w-0 flex-1 text-sm">
                Where is it
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={place ? place.name : "Search a city"}
                  aria-label="Search a city"
                  className="mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-moss"
                />
              </label>
              <button type="button" onClick={locate} aria-label="Use this location" className="mt-5 inline-flex size-11 items-center justify-center rounded-md border border-line">
                <LocateFixed className="size-4" />
              </button>
            </div>
            {locNote && <p className="pt-2 text-xs text-muted">{locNote}</p>}
            <div className="flex flex-wrap gap-2 pt-3">
              {(matches.length ? matches : QUICK_PLACES.map((id) => getPlace(id)!)).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pickPlace(item.id)}
                  className={cn("h-10 rounded-md px-3 text-sm", placeId === item.id ? "bg-ink text-paper" : "border border-line")}
                >
                  {item.name}
                </button>
              ))}
            </div>
            {place && (
              <div className="mt-3 rounded-md bg-paper-deep p-3">
                <p className="text-sm font-medium">Zone {place.zone}</p>
                <p className="pt-1 text-sm leading-relaxed text-muted">{place.blurb} About {place.rainIn} inches of rain.</p>
              </div>
            )}
          </div>

          <div className="pt-5">
            <p className="pb-2 text-sm">Soil</p>
            <div className="grid grid-cols-4 gap-1">
              {SOILS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={soil === item.id}
                  onClick={() => {
                    setSoilTouched(true);
                    setSoil(item.id);
                  }}
                  className={cn("h-11 rounded-md text-sm", soil === item.id ? "bg-ink text-paper" : "border border-line")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-4 flex items-start gap-3 text-sm leading-snug">
            <input type="checkbox" checked={typical} onChange={(event) => setTypical(event.target.checked)} className="mt-1 size-4 accent-moss" />
            Start with a house, a sunny south bed, a shady north bed, and a lawn.
          </label>

          {error && <p className="pt-3 text-sm text-clay">{error}</p>}
          <Button variant="primary" className="mt-5 w-full" onClick={open}>
            Open the lot
          </Button>
        </div>
      </div>
    </main>
  );
}

function Corner({ className }: { className: string }) {
  return <span className={cn("pointer-events-none absolute size-3 border-ink", className)} />;
}
