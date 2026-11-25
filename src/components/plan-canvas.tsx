import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { clamp, snapHalf } from "@/lib/format";
import {
  computeView,
  drawPlan,
  hitPlant,
  hitSpot,
  screenToWorld,
  type PreviewPlant,
} from "@/lib/plan-draw";
import { usePlot } from "@/lib/store";
import type { SpotKind, Tool } from "@/lib/types";

export type PlanHandle = {
  clientToWorld: (clientX: number, clientY: number) => { x: number; y: number } | null;
};

type Drag =
  | { type: "plant"; id: string; dx: number; dy: number; x: number; y: number; moved: boolean }
  | { type: "spot"; id: string; dx: number; dy: number; x: number; y: number; w: number; h: number; moved: boolean }
  | { type: "pan"; clientX: number; clientY: number; panX: number; panY: number; moved: boolean }
  | { type: "draft"; kind: SpotKind; x0: number; y0: number; x1: number; y1: number };

export const PlanCanvas = forwardRef<PlanHandle, { tool: Tool; preview: PreviewPlant | null; onLift: (on: boolean) => void }>(
  function PlanCanvas({ tool, preview, onLift }, ref) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const viewRef = useRef(computeView(300, 300, 60, 80, 1, 0, 0));
    const zoomRef = useRef(1);
    const panRef = useRef({ x: 0, y: 0 });
    const sizeRef = useRef({ w: 0, h: 0 });
    const toolRef = useRef(tool);
    const previewRef = useRef(preview);
    const dragRef = useRef<Drag | null>(null);
    const livePlant = useRef<{ id: string; x: number; y: number } | null>(null);
    const liveSpot = useRef<{ id: string; x: number; y: number } | null>(null);
    const draftRef = useRef<DrawDraft | null>(null);
    const [tick, setTick] = useState(0);
    const lot = usePlot((state) => state.lot);
    const selected = usePlot((state) => state.selected);
    const unit = usePlot((state) => state.unit);
    toolRef.current = tool;
    previewRef.current = preview;

    const paint = () => {
      const canvas = canvasRef.current;
      const size = sizeRef.current;
      if (!canvas || size.w < 2 || size.h < 2) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.floor(size.w * dpr);
      const nextH = Math.floor(size.h * dpr);
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      const state = usePlot.getState();
      const draft = draftRef.current;
      viewRef.current = drawPlan(ctx, {
        lot: state.lot,
        unit: state.unit,
        cssW: size.w,
        cssH: size.h,
        dpr,
        zoom: zoomRef.current,
        panX: panRef.current.x,
        panY: panRef.current.y,
        selected: state.selected,
        livePlant: livePlant.current,
        liveSpot: liveSpot.current,
        preview: previewRef.current,
        draft,
      });
    };

    useEffect(() => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const measure = () => {
        const rect = wrap.getBoundingClientRect();
        sizeRef.current = { w: rect.width, h: rect.height };
        setTick((value) => value + 1);
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(wrap);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      paint();
      // Repaint when the plan, the tool ghost, or the measured size changes.
      // paint closes over refs, so the lot/preview/tick values are the triggers.
    }, [lot, selected, unit, preview, tick, tool]);

    useEffect(() => {
      document.fonts?.ready.then(() => paint()).catch(() => undefined);
    }, []);

    useImperativeHandle(ref, () => ({
      clientToWorld(clientX: number, clientY: number) {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        if (clientX < rect.left || clientY < rect.top || clientX > rect.right || clientY > rect.bottom) return null;
        return screenToWorld(viewRef.current, clientX - rect.left, clientY - rect.top);
      },
    }));

    function worldFromEvent(event: { clientX: number; clientY: number }) {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return {
        sx: event.clientX - rect.left,
        sy: event.clientY - rect.top,
        ...screenToWorld(viewRef.current, event.clientX - rect.left, event.clientY - rect.top),
      };
    }

    function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
      if (event.button !== 0) return;
      const point = worldFromEvent(event);
      if (!point) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      const state = usePlot.getState();
      const model = {
        lot: state.lot,
        unit: state.unit,
        cssW: sizeRef.current.w,
        cssH: sizeRef.current.h,
        dpr: 1,
        zoom: zoomRef.current,
        panX: panRef.current.x,
        panY: panRef.current.y,
        selected: state.selected,
        livePlant: livePlant.current,
        liveSpot: liveSpot.current,
        preview: null,
        draft: null,
      };
      if (toolRef.current === "select") {
        const plant = hitPlant(model, viewRef.current, point.sx, point.sy);
        if (plant) {
          const pos = livePlant.current?.id === plant.id ? livePlant.current : plant;
          dragRef.current = { type: "plant", id: plant.id, dx: point.x - pos.x, dy: point.y - pos.y, x: pos.x, y: pos.y, moved: false };
          state.select({ kind: "plant", id: plant.id });
          onLift(true);
          return;
        }
        const spot = hitSpot(model, point.x, point.y);
        if (spot) {
          dragRef.current = {
            type: "spot",
            id: spot.id,
            dx: point.x - spot.x,
            dy: point.y - spot.y,
            x: spot.x,
            y: spot.y,
            w: spot.w,
            h: spot.h,
            moved: false,
          };
          state.select({ kind: "spot", id: spot.id });
          return;
        }
        dragRef.current = {
          type: "pan",
          clientX: event.clientX,
          clientY: event.clientY,
          panX: panRef.current.x,
          panY: panRef.current.y,
          moved: false,
        };
        return;
      }
      dragRef.current = { type: "draft", kind: toolRef.current, x0: point.x, y0: point.y, x1: point.x, y1: point.y };
    }

    function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
      const drag = dragRef.current;
      const point = worldFromEvent(event);
      if (!drag || !point) return;
      if (drag.type === "plant") {
        const x = snapHalf(point.x - drag.dx);
        const y = snapHalf(point.y - drag.dy);
        if (Math.hypot(x - drag.x, y - drag.y) > 0.4) drag.moved = true;
        drag.x = x;
        drag.y = y;
        livePlant.current = { id: drag.id, x, y };
        paint();
      } else if (drag.type === "spot") {
        const lotNow = usePlot.getState().lot;
        const x = snapHalf(clamp(point.x - drag.dx, -drag.w + 2, lotNow.widthFt - 2));
        const y = snapHalf(clamp(point.y - drag.dy, -drag.h + 2, lotNow.depthFt - 2));
        if (Math.hypot(x - drag.x, y - drag.y) > 0.4) drag.moved = true;
        drag.x = x;
        drag.y = y;
        liveSpot.current = { id: drag.id, x, y };
        paint();
      } else if (drag.type === "pan") {
        const dx = event.clientX - drag.clientX;
        const dy = event.clientY - drag.clientY;
        if (Math.hypot(dx, dy) > 4) drag.moved = true;
        panRef.current = { x: drag.panX + dx, y: drag.panY + dy };
        paint();
      } else if (drag.type === "draft") {
        drag.x1 = point.x;
        drag.y1 = point.y;
        const x = Math.min(drag.x0, drag.x1);
        const y = Math.min(drag.y0, drag.y1);
        draftRef.current = { kind: drag.kind, x, y, w: Math.abs(drag.x1 - drag.x0), h: Math.abs(drag.y1 - drag.y0) };
        paint();
      }
    }

    function onPointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
      const drag = dragRef.current;
      dragRef.current = null;
      onLift(false);
      if (!drag) return;
      const state = usePlot.getState();
      if (drag.type === "plant") {
        const target = document.elementFromPoint(event.clientX, event.clientY);
        const pull = Boolean(target?.closest("[data-pullout]"));
        livePlant.current = null;
        if (pull || drag.x < 0 || drag.y < 0 || drag.x > state.lot.widthFt || drag.y > state.lot.depthFt) {
          if (drag.moved || pull) state.removePlant(drag.id);
        } else if (drag.moved) {
          state.movePlant(drag.id, drag.x, drag.y);
        }
      } else if (drag.type === "spot") {
        liveSpot.current = null;
        if (drag.moved) state.moveSpot(drag.id, drag.x, drag.y);
      } else if (drag.type === "pan") {
        if (!drag.moved) state.select(null);
      } else if (drag.type === "draft") {
        const x = snapHalf(Math.min(drag.x0, drag.x1));
        const y = snapHalf(Math.min(drag.y0, drag.y1));
        const w = snapHalf(Math.abs(drag.x1 - drag.x0));
        const h = snapHalf(Math.abs(drag.y1 - drag.y0));
        draftRef.current = null;
        if (w >= 3 && h >= 3) state.addSpot({ kind: drag.kind, x, y, w, h });
      }
      paint();
    }

    function zoomBy(factor: number) {
      zoomRef.current = clamp(zoomRef.current * factor, 0.7, 3.5);
      setTick((value) => value + 1);
    }

    function fit() {
      zoomRef.current = 1;
      panRef.current = { x: 0, y: 0 };
      setTick((value) => value + 1);
    }

    return (
      <div ref={wrapRef} className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <button type="button" aria-label="Zoom out" onClick={() => zoomBy(0.9)} className="inline-flex size-11 items-center justify-center rounded-md border border-line bg-paper text-ink">
            <Minus className="size-4" />
          </button>
          <button type="button" onClick={fit} className="inline-flex h-11 items-center rounded-md border border-line bg-paper px-3 text-sm text-ink">
            Fit
          </button>
          <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.1)} className="inline-flex size-11 items-center justify-center rounded-md border border-line bg-paper text-ink">
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    );
  },
);

type DrawDraft = { kind: SpotKind; x: number; y: number; w: number; h: number };
