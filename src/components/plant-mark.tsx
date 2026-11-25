import { cn } from "@/lib/cn";
import type { PlantKind } from "@/lib/types";

export function PlantMark({ kind, className }: { kind: PlantKind; className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={cn("size-9 shrink-0 text-ink", className)} aria-hidden>
      {kind === "tree" && (
        <>
          <circle cx="18" cy="18" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 8v20M8 18h20" stroke="currentColor" strokeWidth="1.25" />
        </>
      )}
      {kind === "evergreen" && (
        <>
          <path d="M18 4 31 30H5Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 30v4" stroke="currentColor" strokeWidth="1.5" />
        </>
      )}
      {kind === "shrub" && (
        <>
          <circle cx="13" cy="20" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="23" cy="20" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="18" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </>
      )}
      {kind === "perennial" && (
        <>
          <circle cx="18" cy="18" r="2.2" fill="currentColor" />
          <circle cx="11" cy="14" r="2" fill="currentColor" />
          <circle cx="25" cy="14" r="2" fill="currentColor" />
          <circle cx="12" cy="24" r="2" fill="currentColor" />
          <circle cx="24" cy="24" r="2" fill="currentColor" />
        </>
      )}
      {kind === "grass" && (
        <path d="M8 28 12 8M14 28 16 10M18 28V8M22 28 20 10M24 28 28 8" fill="none" stroke="currentColor" strokeWidth="1.4" />
      )}
      {kind === "ground" && (
        <>
          <ellipse cx="18" cy="20" rx="12" ry="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M8 18h20M9 22h18" stroke="currentColor" strokeWidth="1.2" />
        </>
      )}
      {kind === "edible" && (
        <>
          <circle cx="18" cy="18" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="13" y="13" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.25" />
        </>
      )}
    </svg>
  );
}
