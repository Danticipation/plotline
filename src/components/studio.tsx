import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Camera, Ruler, Sparkles } from "lucide-react";
import { effectiveZone } from "@/lib/advice";
import { getPlace } from "@/lib/climate";
import { getPlant } from "@/lib/plants";
import { placeInBestSpot } from "@/lib/place";
import { snapHalf } from "@/lib/format";
import { usePlot } from "@/lib/store";
import type { Tool } from "@/lib/types";
import { AskPanel } from "@/components/ask-panel";
import { InspectorBody, VerdictBar } from "@/components/inspector";
import { LensView } from "@/components/lens-view";
import { LotDialog } from "@/components/lot-dialog";
import { PlanCanvas, type PlanHandle } from "@/components/plan-canvas";
import { PlantMark } from "@/components/plant-mark";
import { PlantRail } from "@/components/plant-rail";
import { SetupScreen } from "@/components/setup-screen";
import {
  Droplets,
  Flower2,
  Grid3x3,
  House,
  Minus,
  MousePointer2,
  Square,
} from "lucide-react";

const TOOLS: { id: Tool; label: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Move", icon: MousePointer2 },
  { id: "bed", label: "Bed", icon: Flower2 },
  { id: "lawn", label: "Lawn", icon: Grid3x3 },
  { id: "patio", label: "Patio", icon: Square },
  { id: "path", label: "Path", icon: Minus },
  { id: "water", label: "Water", icon: Droplets },
  { id: "structure", label: "House", icon: House },
];

export function StudioGate() {
  useEffect(() => {
    void usePlot.persist.rehydrate();
  }, []);
  return <Studio />;
}

function Studio() {
  const configured = usePlot((state) => state.configured);
  if (!configured) return <SetupScreen />;
  return <Planner />;
}

function Planner() {
  const lot = usePlot((state) => state.lot);
  const planRef = useRef<PlanHandle>(null);
  const [tool, setTool] = useState<Tool>("select");
  const [lifting, setLifting] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [ask, setAsk] = useState(false);
  const [lens, setLens] = useState(false);
  const [lotOpen, setLotOpen] = useState(false);
  const [ghost, setGhost] = useState<{ plantId: string; px: number; py: number } | null>(null);
  const [preview, setPreview] = useState<{ plantId: string; x: number; y: number } | null>(null);
  const place = getPlace(lot.placeId);
  const zone = effectiveZone(lot);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) return;
      const state = usePlot.getState();
      if (!state.selected) return;
      event.preventDefault();
      if (state.selected.kind === "plant") state.removePlant(state.selected.id);
      else state.removeSpot(state.selected.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onPlantPointerDown(event: PointerEvent<HTMLButtonElement>, plantId: string) {
    if (event.button !== 0) return;
    const startX = event.clientX;
    const startY = event.clientY;
    let active = false;
    let max = 0;
    function move(ev: globalThis.PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      max = Math.max(max, Math.hypot(dx, dy));
      if (!active) {
        if (ev.pointerType === "touch") {
          const up = startY - ev.clientY;
          if (up < 18 || Math.abs(dx) > up) return;
        } else if (max < 6) return;
        active = true;
      }
      const world = planRef.current?.clientToWorld(ev.clientX, ev.clientY) ?? null;
      setGhost({ plantId, px: ev.clientX, py: ev.clientY });
      setPreview(world && world.x >= 0 && world.y >= 0 && world.x <= lot.widthFt && world.y <= lot.depthFt ? { plantId, x: snapHalf(world.x), y: snapHalf(world.y) } : null);
    }
    function up(ev: globalThis.PointerEvent) {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const world = planRef.current?.clientToWorld(ev.clientX, ev.clientY);
      setGhost(null);
      setPreview(null);
      if (!active) {
        if (max < 8) placeInBestSpot(plantId);
        return;
      }
      if (!world) return;
      const current = usePlot.getState().lot;
      if (world.x < 0 || world.y < 0 || world.x > current.widthFt || world.y > current.depthFt) return;
      usePlot.getState().addPlant(plantId, world.x, world.y);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const ghostPlant = ghost ? getPlant(ghost.plantId) : null;

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-paper text-ink">
      <header className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl leading-none">Plotline</p>
          <p className="truncate text-xs text-muted">
            Zone {zone} · {place?.name} · {lot.name}
          </p>
        </div>
        <button type="button" aria-label="Lot settings" onClick={() => setLotOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-md border border-line px-3 text-sm">
          <Ruler className="size-4" />
          <span className="hidden sm:inline">Lot</span>
        </button>
        <button type="button" aria-label="Stand in the lot" onClick={() => setLens(true)} className="inline-flex h-11 items-center gap-2 rounded-md border border-line px-3 text-sm">
          <Camera className="size-4" />
          <span className="hidden sm:inline">View</span>
        </button>
        <button type="button" aria-label="Ask Plotline" onClick={() => setAsk(true)} className="inline-flex h-11 items-center gap-2 rounded-md bg-moss px-3 text-sm text-paper">
          <Sparkles className="size-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <PlantRail lifting={lifting} onPlantPointerDown={onPlantPointerDown} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col max-md:order-1 md:order-2">
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-line px-2 py-2">
            {TOOLS.map((item) => {
              const Icon = item.icon;
              const on = tool === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTool(item.id)}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm ${on ? "bg-ink text-paper" : "text-ink"}`}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          {tool !== "select" && <p className="px-3 pb-1 text-xs text-muted">Drag a rectangle on the lot. North is up.</p>}
          <PlanCanvas ref={planRef} tool={tool} preview={preview} onLift={setLifting} />
          <VerdictBar onOpen={() => setSheet(true)} />
        </div>
        <aside className="hidden min-h-0 w-80 shrink-0 overflow-y-auto border-l border-line xl:order-3 xl:flex xl:flex-col">
          <InspectorBody onAsk={() => setAsk(true)} />
        </aside>
      </div>
      {sheet && (
        <div className="fixed inset-0 z-30 flex items-end bg-ink/40 xl:hidden" role="dialog" aria-modal="true" aria-label="Plant notes">
          <button type="button" aria-label="Close notes" className="absolute inset-0" onClick={() => setSheet(false)} />
          <div className="relative max-h-5/6 w-full overflow-y-auto border-t border-line bg-paper">
            <div className="flex justify-end px-3 pt-3">
              <button type="button" onClick={() => setSheet(false)} className="h-11 rounded-md border border-line px-4 text-sm">
                Close
              </button>
            </div>
            <InspectorBody onAsk={() => { setSheet(false); setAsk(true); }} />
          </div>
        </div>
      )}
      {ask && <AskPanel onClose={() => setAsk(false)} />}
      {lens && <LensView onClose={() => setLens(false)} />}
      {lotOpen && <LotDialog onClose={() => setLotOpen(false)} />}
      {ghost && ghostPlant && (
        <div className="pointer-events-none fixed z-50 flex items-center gap-2 rounded-md border border-ink bg-paper px-2 py-1 text-sm" style={{ left: ghost.px + 14, top: ghost.py + 14 }}>
          <PlantMark kind={ghostPlant.kind} className="size-7" />
          {ghostPlant.name}
        </div>
      )}
    </main>
  );
}
