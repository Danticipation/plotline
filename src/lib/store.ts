import { create } from "zustand";
import { persist } from "zustand/middleware";
import { snapHalf, uid } from "@/lib/format";
import { nextSpotName, sunForNewSpot, typicalSpots } from "@/lib/spots";
import type { Lot, Selection, Soil, SpotKind, Unit } from "@/lib/types";

export type ConfigureInput = {
  name: string;
  widthFt: number;
  depthFt: number;
  soil: Soil;
  placeId: string;
  unit: Unit;
  typical: boolean;
};

type PlotState = {
  configured: boolean;
  unit: Unit;
  lot: Lot;
  selected: Selection;
  configure: (input: ConfigureInput) => void;
  setUnit: (unit: Unit) => void;
  select: (selected: Selection) => void;
  addPlant: (plantId: string, x: number, y: number) => string;
  movePlant: (id: string, x: number, y: number) => void;
  removePlant: (id: string) => void;
  addSpot: (input: { kind: SpotKind; x: number; y: number; w: number; h: number }) => string;
  updateSpot: (id: string, patch: Partial<Lot["spots"][number]>) => void;
  moveSpot: (id: string, x: number, y: number) => void;
  removeSpot: (id: string) => void;
  setLotMeta: (patch: Partial<Pick<Lot, "name" | "widthFt" | "depthFt" | "soil" | "placeId" | "zoneOverride">>) => void;
  addPlacements: (items: { plantId: string; x: number; y: number }[]) => void;
  clearPlants: () => void;
  reset: () => void;
};

const emptyLot = (): Lot => ({
  name: "Back lot",
  widthFt: 60,
  depthFt: 80,
  soil: "loam",
  placeId: "corvallis",
  zoneOverride: null,
  spots: [],
  placed: [],
});

export const usePlot = create<PlotState>()(
  persist(
    (set) => ({
      configured: false,
      unit: "ft",
      lot: emptyLot(),
      selected: null,
      configure: (input) =>
        set({
          configured: true,
          unit: input.unit,
          selected: null,
          lot: {
            name: input.name.trim() || "Back lot",
            widthFt: input.widthFt,
            depthFt: input.depthFt,
            soil: input.soil,
            placeId: input.placeId,
            zoneOverride: null,
            spots: input.typical ? typicalSpots(input.widthFt, input.depthFt) : [],
            placed: [],
          },
        }),
      setUnit: (unit) => set({ unit }),
      select: (selected) => set({ selected }),
      addPlant: (plantId, x, y) => {
        const id = uid();
        set((state) => ({
          lot: {
            ...state.lot,
            placed: [...state.lot.placed, { id, plantId, x: snapHalf(x), y: snapHalf(y) }],
          },
          selected: { kind: "plant", id },
        }));
        return id;
      },
      movePlant: (id, x, y) =>
        set((state) => ({
          lot: {
            ...state.lot,
            placed: state.lot.placed.map((plant) =>
              plant.id === id ? { ...plant, x: snapHalf(x), y: snapHalf(y) } : plant,
            ),
          },
        })),
      removePlant: (id) =>
        set((state) => ({
          lot: { ...state.lot, placed: state.lot.placed.filter((plant) => plant.id !== id) },
          selected: state.selected?.id === id ? null : state.selected,
        })),
      addSpot: (input) => {
        const id = uid();
        set((state) => {
          const x = snapHalf(input.x);
          const y = snapHalf(input.y);
          const w = snapHalf(input.w);
          const h = snapHalf(input.h);
          const spot = {
            id,
            kind: input.kind,
            name: nextSpotName(state.lot, input.kind),
            x,
            y,
            w,
            h,
            sun: sunForNewSpot(state.lot, input.kind, x, y, w, h),
          };
          return {
            lot: { ...state.lot, spots: [...state.lot.spots, spot] },
            selected: { kind: "spot" as const, id },
          };
        });
        return id;
      },
      updateSpot: (id, patch) =>
        set((state) => ({
          lot: {
            ...state.lot,
            spots: state.lot.spots.map((spot) => (spot.id === id ? { ...spot, ...patch } : spot)),
          },
        })),
      moveSpot: (id, x, y) =>
        set((state) => ({
          lot: {
            ...state.lot,
            spots: state.lot.spots.map((spot) =>
              spot.id === id ? { ...spot, x: snapHalf(x), y: snapHalf(y) } : spot,
            ),
          },
        })),
      removeSpot: (id) =>
        set((state) => ({
          lot: { ...state.lot, spots: state.lot.spots.filter((spot) => spot.id !== id) },
          selected: state.selected?.id === id ? null : state.selected,
        })),
      setLotMeta: (patch) =>
        set((state) => {
          const lot = { ...state.lot, ...patch };
          if (patch.widthFt != null || patch.depthFt != null) {
            lot.placed = state.lot.placed.filter(
              (plant) => plant.x >= 0 && plant.y >= 0 && plant.x <= lot.widthFt && plant.y <= lot.depthFt,
            );
            lot.spots = state.lot.spots.filter(
              (spot) => spot.x < lot.widthFt && spot.y < lot.depthFt && spot.x + spot.w > 0 && spot.y + spot.h > 0,
            );
          }
          const selectedGone =
            state.selected &&
            ((state.selected.kind === "plant" && !lot.placed.some((plant) => plant.id === state.selected?.id)) ||
              (state.selected.kind === "spot" && !lot.spots.some((spot) => spot.id === state.selected?.id)));
          return { lot, selected: selectedGone ? null : state.selected };
        }),
      addPlacements: (items) =>
        set((state) => ({
          lot: {
            ...state.lot,
            placed: [
              ...state.lot.placed,
              ...items.map((item) => ({
                id: uid(),
                plantId: item.plantId,
                x: snapHalf(item.x),
                y: snapHalf(item.y),
              })),
            ],
          },
        })),
      clearPlants: () =>
        set((state) => ({
          lot: { ...state.lot, placed: [] },
          selected: state.selected?.kind === "plant" ? null : state.selected,
        })),
      reset: () => set({ configured: false, selected: null, lot: emptyLot() }),
    }),
    { name: "plotline.v1", skipHydration: true },
  ),
);
