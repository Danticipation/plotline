import { useEffect, useRef, useState, type PointerEvent } from "react";
import { X } from "lucide-react";
import { drawElevation, elevationLayout, hitElevation, unproject } from "@/lib/elevation";
import { clamp, snapHalf } from "@/lib/format";
import { readPalette } from "@/lib/plan-draw";
import { usePlot } from "@/lib/store";

export function LensView({ onClose }: { onClose: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lot = usePlot((state) => state.lot);
  const selected = usePlot((state) => state.selected);
  const [camera, setCamera] = useState<"off" | "on" | "denied">("off");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const liveRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const dragRef = useRef<{ id: string; moved: boolean } | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w < 2 || size.h < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const colors = readPalette();
    canvas.width = Math.floor(size.w * dpr);
    canvas.height = Math.floor(size.h * dpr);
    drawElevation(
      ctx,
      lot,
      size.w,
      size.h,
      dpr,
      selected?.kind === "plant" ? selected.id : null,
      liveRef.current,
      camera === "on",
      colors.ink,
      colors.paper,
      colors.moss,
      colors.clay,
      colors.muted,
    );
  }, [lot, selected, size, camera]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function toggleCamera() {
    if (camera === "on") {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCamera("off");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamera("on");
    } catch {
      setCamera("denied");
    }
  }

  function point(event: { clientX: number; clientY: number }) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { sx: event.clientX - rect.left, sy: event.clientY - rect.top };
  }

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const local = point(event);
    if (!local) return;
    const layout = elevationLayout(size.w, size.h, lot.widthFt);
    const id = hitElevation(lot, layout, local.sx, local.sy, liveRef.current);
    if (!id) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id, moved: false };
    usePlot.getState().select({ kind: "plant", id });
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    const local = point(event);
    if (!drag || !local) return;
    const layout = elevationLayout(size.w, size.h, lot.widthFt);
    const world = unproject(layout, lot.widthFt, lot.depthFt, local.sx, local.sy);
    const x = snapHalf(clamp(world.x, 0.5, lot.widthFt - 0.5));
    const y = snapHalf(clamp(world.y, 0.5, lot.depthFt - 0.5));
    drag.moved = true;
    liveRef.current = { id: drag.id, x, y };
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const colors = readPalette();
    drawElevation(ctx, lot, size.w, size.h, dpr, drag.id, liveRef.current, camera === "on", colors.ink, colors.paper, colors.moss, colors.clay, colors.muted);
  }

  function onPointerUp() {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.moved && liveRef.current) {
      usePlot.getState().movePlant(drag.id, liveRef.current.x, liveRef.current.y);
    }
    liveRef.current = null;
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-paper">
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl leading-none">From the south edge</p>
          <p className="text-xs text-muted">Looking north. Drag a plant nearer, farther, or sideways. The figure is 6 ft.</p>
        </div>
        <button type="button" onClick={toggleCamera} className="h-11 shrink-0 rounded-md border border-line px-3 text-sm">
          {camera === "on" ? "Close camera" : "Camera"}
        </button>
        <button type="button" aria-label="Close view" onClick={onClose} className="inline-flex size-11 items-center justify-center rounded-md border border-line">
          <X className="size-4" />
        </button>
      </div>
      {camera === "denied" && (
        <p className="px-3 py-2 text-sm text-clay">The camera stayed off. This view still shows the lot, with a person for scale. Nothing is uploaded either way.</p>
      )}
      <div ref={wrapRef} className="relative min-h-0 flex-1">
        <video ref={videoRef} playsInline muted className={camera === "on" ? "absolute inset-0 h-full w-full object-cover" : "hidden"} />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        />
      </div>
    </div>
  );
}
