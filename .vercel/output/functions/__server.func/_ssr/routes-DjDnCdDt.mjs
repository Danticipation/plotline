import { i as __toESM } from "../_runtime.mjs";
import { b as require_jsx_runtime, q as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as QUICK_PLACES, d as effectiveZone, f as getPlace, g as suggestedSoil, h as nearestPlace, i as PLANTS, m as lotReview, n as KIND_LABEL, o as adviseAt, p as getPlant, r as PLACES, s as advisePlaced, t as FILTERS, u as climateVerdict } from "./advice-CaUb1y07.mjs";
import { a as Ruler, c as Minus, d as Grid3x3, f as Flower2, i as Sparkles, l as LocateFixed, m as Camera, o as Plus, p as Droplets, r as Square, s as MousePointer2, t as X, u as House } from "../_libs/lucide-react.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DjDnCdDt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FT_PER_M = 3.280839895;
function clamp(n, min, max) {
	if (max < min) return max;
	return Math.max(min, Math.min(max, n));
}
function snapHalf(n) {
	return Math.round(n * 2) / 2;
}
function toDisplay(ft, unit) {
	return unit === "ft" ? ft : ft / FT_PER_M;
}
function fromDisplay(value, unit) {
	return unit === "ft" ? value : value * FT_PER_M;
}
function formatFt(ft, unit, digits = 0) {
	const v = toDisplay(ft, unit);
	return `${digits === 0 ? Math.round(v) : Math.round(v * 10 ** digits) / 10 ** digits} ${unit}`;
}
function uid() {
	return Math.random().toString(36).slice(2, 10);
}
var KIND_NAME = {
	bed: "Bed",
	lawn: "Lawn",
	patio: "Patio",
	path: "Path",
	water: "Water",
	structure: "House"
};
function nextSpotName(lot, kind) {
	const count = lot.spots.filter((spot) => spot.kind === kind).length + 1;
	const base = KIND_NAME[kind];
	return count === 1 ? base : `${base} ${count}`;
}
function sunForNewSpot(lot, kind, x, y, w, h) {
	if (kind === "structure" || kind === "patio" || kind === "path" || kind === "water") return "full";
	const cx = x + w / 2;
	const cy = y + h / 2;
	const house = lot.spots.find((spot) => spot.kind === "structure");
	if (!house) return kind === "lawn" ? "full" : "full";
	const overHouseX = cx >= house.x && cx <= house.x + house.w;
	if (overHouseX && cy < house.y) return "shade";
	if (overHouseX && cy > house.y + house.h) return "full";
	if (house && Math.abs(cx - (house.x + house.w / 2)) > house.w / 2) return "part";
	return "full";
}
function typicalSpots(width, depth) {
	const spots = [];
	const houseW = clamp(Math.round(width * .52), 16, Math.max(12, width - 10));
	const houseH = clamp(Math.round(Math.min(28, depth * .32)), 12, Math.max(12, depth * .5));
	const hx = snapHalf(Math.max(2, (width - houseW) / 2));
	const hy = snapHalf(Math.max(2, Math.min(10, depth * .08)));
	if (hy + houseH < depth - 6) spots.push({
		id: uid(),
		kind: "structure",
		name: "House",
		x: hx,
		y: hy,
		w: houseW,
		h: houseH,
		sun: "full"
	});
	const bedH = clamp(Math.round(depth * .07), 4, 6);
	const bedY = hy + houseH + 1;
	if (spots.length && bedY + bedH < depth - 8) spots.push({
		id: uid(),
		kind: "bed",
		name: "South bed",
		x: hx,
		y: bedY,
		w: houseW,
		h: bedH,
		sun: "full"
	});
	if (hy >= 6) spots.push({
		id: uid(),
		kind: "bed",
		name: "North bed",
		x: hx,
		y: 1,
		w: houseW,
		h: snapHalf(hy - 2),
		sun: "shade"
	});
	const lawnY = (spots.find((spot) => spot.name === "South bed")?.y ?? hy + houseH) + bedH + 1;
	const lawnH = depth - lawnY - 2;
	if (lawnH >= 8) spots.push({
		id: uid(),
		kind: "lawn",
		name: "Lawn",
		x: 2,
		y: snapHalf(lawnY),
		w: snapHalf(width - 4),
		h: snapHalf(lawnH),
		sun: "full"
	});
	return spots;
}
var emptyLot = () => ({
	name: "Back lot",
	widthFt: 60,
	depthFt: 80,
	soil: "loam",
	placeId: "corvallis",
	zoneOverride: null,
	spots: [],
	placed: []
});
var usePlot = create()(persist((set) => ({
	configured: false,
	unit: "ft",
	lot: emptyLot(),
	selected: null,
	configure: (input) => set({
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
			placed: []
		}
	}),
	setUnit: (unit) => set({ unit }),
	select: (selected) => set({ selected }),
	addPlant: (plantId, x, y) => {
		const id = uid();
		set((state) => ({
			lot: {
				...state.lot,
				placed: [...state.lot.placed, {
					id,
					plantId,
					x: snapHalf(x),
					y: snapHalf(y)
				}]
			},
			selected: {
				kind: "plant",
				id
			}
		}));
		return id;
	},
	movePlant: (id, x, y) => set((state) => ({ lot: {
		...state.lot,
		placed: state.lot.placed.map((plant) => plant.id === id ? {
			...plant,
			x: snapHalf(x),
			y: snapHalf(y)
		} : plant)
	} })),
	removePlant: (id) => set((state) => ({
		lot: {
			...state.lot,
			placed: state.lot.placed.filter((plant) => plant.id !== id)
		},
		selected: state.selected?.id === id ? null : state.selected
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
				sun: sunForNewSpot(state.lot, input.kind, x, y, w, h)
			};
			return {
				lot: {
					...state.lot,
					spots: [...state.lot.spots, spot]
				},
				selected: {
					kind: "spot",
					id
				}
			};
		});
		return id;
	},
	updateSpot: (id, patch) => set((state) => ({ lot: {
		...state.lot,
		spots: state.lot.spots.map((spot) => spot.id === id ? {
			...spot,
			...patch
		} : spot)
	} })),
	moveSpot: (id, x, y) => set((state) => ({ lot: {
		...state.lot,
		spots: state.lot.spots.map((spot) => spot.id === id ? {
			...spot,
			x: snapHalf(x),
			y: snapHalf(y)
		} : spot)
	} })),
	removeSpot: (id) => set((state) => ({
		lot: {
			...state.lot,
			spots: state.lot.spots.filter((spot) => spot.id !== id)
		},
		selected: state.selected?.id === id ? null : state.selected
	})),
	setLotMeta: (patch) => set((state) => {
		const lot = {
			...state.lot,
			...patch
		};
		if (patch.widthFt != null || patch.depthFt != null) {
			lot.placed = state.lot.placed.filter((plant) => plant.x >= 0 && plant.y >= 0 && plant.x <= lot.widthFt && plant.y <= lot.depthFt);
			lot.spots = state.lot.spots.filter((spot) => spot.x < lot.widthFt && spot.y < lot.depthFt && spot.x + spot.w > 0 && spot.y + spot.h > 0);
		}
		return {
			lot,
			selected: state.selected && (state.selected.kind === "plant" && !lot.placed.some((plant) => plant.id === state.selected?.id) || state.selected.kind === "spot" && !lot.spots.some((spot) => spot.id === state.selected?.id)) ? null : state.selected
		};
	}),
	addPlacements: (items) => set((state) => ({ lot: {
		...state.lot,
		placed: [...state.lot.placed, ...items.map((item) => ({
			id: uid(),
			plantId: item.plantId,
			x: snapHalf(item.x),
			y: snapHalf(item.y)
		}))]
	} })),
	clearPlants: () => set((state) => ({
		lot: {
			...state.lot,
			placed: []
		},
		selected: state.selected?.kind === "plant" ? null : state.selected
	})),
	reset: () => set({
		configured: false,
		selected: null,
		lot: emptyLot()
	})
}), {
	name: "plotline.v1",
	skipHydration: true
}));
function inside(spot, x, y) {
	return x >= spot.x && x <= spot.x + spot.w && y >= spot.y && y <= spot.y + spot.h;
}
function placeInBestSpot(plantId) {
	const { lot, selected, addPlant } = usePlot.getState();
	const plant = getPlant(plantId);
	const spread = Math.max(plant?.spreadFt ?? 4, 2);
	const tall = !!plant && (plant.kind === "tree" || plant.kind === "evergreen" || plant.kind === "edible" && plant.heightFt >= 8);
	const selectedSpot = lot.spots.find((spot) => spot.id === selected?.id && (spot.kind === "bed" || spot.kind === "lawn"));
	const wantsShade = plant?.sun === "shade";
	const lawn = lot.spots.find((spot) => spot.kind === "lawn");
	const bed = lot.spots.find((item) => item.kind === "bed" && item.sun === (wantsShade ? "shade" : "full")) ?? lot.spots.find((item) => item.kind === "bed");
	const spot = selectedSpot ?? (tall ? lawn ?? bed : bed ?? lawn);
	let x = lot.widthFt / 2;
	let y = lot.depthFt * .72;
	if (spot) {
		const inSpot = lot.placed.filter((item) => inside(spot, item.x, item.y)).length;
		const cols = Math.max(1, Math.floor(spot.w / Math.max(Math.min(spread, spot.w), 3)));
		const col = inSpot % cols;
		const row = Math.floor(inSpot / cols);
		x = spot.x + (col + .5) * spot.w / cols;
		y = spot.y + Math.min(spot.h - .6, (row + .5) * Math.max(2.5, Math.min(spread, spot.h) * .45));
		if (tall && spot.kind === "lawn") {
			const house = lot.spots.find((item) => item.kind === "structure");
			if (house) {
				const clearance = Math.max(8, Math.min(16, spread * .45));
				const south = house.y + house.h + clearance;
				if (south < spot.y + spot.h - 1) y = Math.max(y, south);
			}
		}
	}
	addPlant(plantId, snapHalf(clamp(x, 1, lot.widthFt - 1)), snapHalf(clamp(y, 1, lot.depthFt - 1)));
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function isSoil(value) {
	return value === "loam" || value === "clay" || value === "sand" || value === "unknown";
}
function asNum(value, min, max) {
	if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new Error("Bad number");
	return value;
}
function validate(input) {
	if (!input || typeof input !== "object") throw new Error("Bad request");
	const data = input;
	if (typeof data.placeId !== "string" || !getPlace(data.placeId)) throw new Error("Unknown place");
	if (data.zoneOverride != null && (typeof data.zoneOverride !== "string" || data.zoneOverride.length > 4)) throw new Error("Bad zone");
	if (!isSoil(data.soil)) throw new Error("Bad soil");
	if (typeof data.name !== "string" || data.name.length > 80) throw new Error("Bad name");
	const widthFt = asNum(data.widthFt, 8, 500);
	const depthFt = asNum(data.depthFt, 8, 500);
	if (!Array.isArray(data.spots) || data.spots.length > 24) throw new Error("Too many spots");
	if (!Array.isArray(data.placed) || data.placed.length > 60) throw new Error("Too many plants");
	const spots = data.spots.map((spot) => {
		if (!spot || typeof spot !== "object") throw new Error("Bad spot");
		const row = spot;
		const kind = row.kind;
		if (kind !== "bed" && kind !== "lawn" && kind !== "patio" && kind !== "path" && kind !== "water" && kind !== "structure") throw new Error("Bad spot");
		const sun = row.sun;
		if (sun !== "full" && sun !== "part" && sun !== "shade") throw new Error("Bad sun");
		if (typeof row.name !== "string") throw new Error("Bad spot");
		const x = asNum(row.x, -50, 600);
		const y = asNum(row.y, -50, 600);
		const w = asNum(row.w, 0, 600);
		const h = asNum(row.h, 0, 600);
		return {
			name: row.name.slice(0, 40),
			kind,
			x,
			y,
			w,
			h,
			sun
		};
	});
	const placed = data.placed.map((plant) => {
		if (!plant || typeof plant !== "object") throw new Error("Bad plant");
		const row = plant;
		if (typeof row.plantId !== "string" || !getPlant(row.plantId)) throw new Error("Bad plant");
		return {
			plantId: row.plantId,
			x: asNum(row.x, -20, 600),
			y: asNum(row.y, -20, 600)
		};
	});
	return {
		placeId: data.placeId,
		zoneOverride: typeof data.zoneOverride === "string" ? data.zoneOverride : null,
		soil: data.soil,
		name: data.name,
		widthFt,
		depthFt,
		spots,
		placed
	};
}
var askPlotline = createServerFn({ method: "POST" }).validator(validate).handler(createSsrRpc("2d8c1bc44b463c61ddabecf8b89e4e3b683684fac9ca12cc618569b9a0deb7a1"));
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function Button({ variant = "ghost", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss disabled:opacity-50", variant === "primary" && "bg-moss text-paper hover:bg-moss-deep", variant === "ghost" && "border border-line bg-paper text-ink hover:border-ink", variant === "ink" && "bg-ink text-paper", variant === "clay" && "border border-clay bg-paper text-clay", className),
		...props
	});
}
var SUNS = [
	{
		id: "full",
		label: "Full sun"
	},
	{
		id: "part",
		label: "Part shade"
	},
	{
		id: "shade",
		label: "Shade"
	}
];
function VerdictBar({ onOpen }) {
	const lot = usePlot((state) => state.lot);
	const selected = usePlot((state) => state.selected);
	const review = lotReview(lot);
	let badge = null;
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onOpen,
		className: "flex w-full items-start gap-3 border-t border-line bg-paper px-3 py-3 text-left xl:hidden",
		children: [badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { verdict: badge }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "line-clamp-2 text-sm leading-snug",
			children: text
		})]
	});
}
function InspectorBody({ onAsk }) {
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
		if (!placed || !plant || !advice) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "p-4 text-sm text-muted",
			children: "That plant is gone."
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-muted uppercase",
						children: "What it is"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl leading-tight",
						children: plant.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted italic",
						children: plant.latin
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-2 text-sm leading-relaxed",
						children: plant.note
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "pt-2 text-sm text-muted",
						children: [
							KIND_LABEL[plant.kind],
							" · zones ",
							plant.zoneMin,
							"–",
							plant.zoneMax,
							" · ",
							sunWord(plant.sun),
							" · ",
							plant.water,
							" water"
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-muted uppercase",
						children: "Size"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm tabular-nums",
						children: [
							formatFt(plant.heightFt, unit, plant.heightFt < 1 ? 1 : 0),
							" tall · ",
							formatFt(plant.spreadFt, unit, plant.spreadFt < 1 ? 1 : 0),
							" across"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Drawn at mature spread, to scale. Not a nursery pot."
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-muted uppercase",
						children: "Should it go here"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 pt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { verdict: advice.verdict }), advice.spotName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-muted",
							children: ["In the ", advice.spotName.toLowerCase()]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-2 text-sm leading-relaxed",
						children: advice.headline
					}),
					advice.reasons.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "list-disc pt-2 pl-4 text-sm leading-relaxed text-muted",
						children: advice.reasons.slice(1).map((reason) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: reason }, reason))
					}),
					advice.nearest && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "pt-2 text-sm text-muted",
						children: [
							"Nearest neighbor is the ",
							advice.nearest.name.toLowerCase(),
							", ",
							advice.nearest.feet,
							" ft away."
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "clay",
					onClick: () => removePlant(placed.id),
					children: "Pull it out"
				})
			]
		});
	}
	if (selected?.kind === "spot") {
		const spot = lot.spots.find((item) => item.id === selected.id);
		if (!spot) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "p-4 text-sm text-muted",
			children: "That spot is gone."
		});
		const sunLocked = spot.kind === "structure" || spot.kind === "patio" || spot.kind === "path" || spot.kind === "water";
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-muted uppercase",
						children: "Spot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						defaultValue: spot.name,
						"aria-label": "Spot name",
						onBlur: (event) => updateSpot(spot.id, { name: event.target.value.trim().slice(0, 40) || spot.name }),
						className: "mt-1 w-full border-b border-line bg-transparent font-display text-3xl outline-none focus:border-moss"
					}, spot.id),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "pt-2 text-sm text-muted tabular-nums",
						children: [
							formatFt(spot.w, unit),
							" wide · ",
							formatFt(spot.h, unit),
							" deep"
						]
					})
				] }),
				!sunLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pb-2 text-xs tracking-wide text-muted uppercase",
					children: "Sun in this spot"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-1",
					children: SUNS.map((sun) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": spot.sun === sun.id,
						onClick: () => updateSpot(spot.id, { sun: sun.id }),
						className: cn("h-11 rounded-md text-sm", spot.sun === sun.id ? "bg-ink text-paper" : "border border-line"),
						children: sun.label
					}, sun.id))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-muted",
					children: "Drag plants into this spot, or drag them back to the list to pull them out. North of the house reads as shade."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "clay",
					onClick: () => removeSpot(spot.id),
					children: "Remove spot"
				})
			]
		});
	}
	const review = lotReview(lot);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-muted uppercase",
					children: "This lot"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl leading-tight",
					children: lot.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "pt-1 text-sm text-muted",
					children: [
						place?.name,
						" · zone ",
						zone,
						" · ",
						lot.soil,
						" soil"
					]
				}),
				place && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-2 text-sm leading-relaxed",
					children: place.blurb
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "pt-2 text-sm tabular-nums text-muted",
					children: [
						formatFt(lot.widthFt, unit),
						" × ",
						formatFt(lot.depthFt, unit),
						" · about ",
						place?.rainIn,
						" in of rain"
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed",
				children: lot.placed.length === 0 ? "Nothing planted yet. The circles you drop are mature spread, so a bad fit shows up before you dig." : review.nos.length ? `${review.nos.length} should come out. The rest can stay, with the notes on the marginal ones.` : review.marginals.length ? "No hard refusals. A few are marginal — open them before you commit." : "Everything planted can live in this climate, in the spot it sits."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "pt-2",
				children: [review.nos.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full items-start gap-2 py-2 text-left",
					onClick: () => select({
						kind: "plant",
						id: row.placed.id
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { verdict: "no" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm",
						children: row.plant.name
					})]
				}) }, row.placed.id)), review.marginals.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full items-start gap-2 py-2 text-left",
					onClick: () => select({
						kind: "plant",
						id: row.placed.id
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { verdict: "marginal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm",
						children: row.plant.name
					})]
				}) }, row.placed.id))]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "primary",
				onClick: onAsk,
				children: "Ask Plotline"
			})
		]
	});
}
function Badge({ verdict }) {
	const label = verdict === "yes" ? "Yes" : verdict === "no" ? "No" : "Marginal";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex h-7 shrink-0 items-center rounded-md px-2 text-xs font-medium", verdict === "yes" && "bg-moss text-paper", verdict === "no" && "bg-clay text-paper", verdict === "marginal" && "border border-ink text-ink"),
		children: label
	});
}
function sunWord(sun) {
	if (sun === "full") return "full sun";
	if (sun === "part") return "part shade";
	return "shade";
}
function AskPanel({ onClose }) {
	const lot = usePlot((state) => state.lot);
	const addPlacements = usePlot((state) => state.addPlacements);
	const place = getPlace(lot.placeId);
	const review = lotReview(lot);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [summary, setSummary] = (0, import_react.useState)("");
	const [moves, setMoves] = (0, import_react.useState)([]);
	const [placed, setPlaced] = (0, import_react.useState)(false);
	async function ask() {
		setLoading(true);
		setError("");
		try {
			const result = await askPlotline({ data: {
				placeId: lot.placeId,
				zoneOverride: lot.zoneOverride,
				soil: lot.soil,
				name: lot.name,
				widthFt: lot.widthFt,
				depthFt: lot.depthFt,
				spots: lot.spots.map(({ name, kind, x, y, w, h, sun }) => ({
					name,
					kind,
					x,
					y,
					w,
					h,
					sun
				})),
				placed: lot.placed.map(({ plantId, x, y }) => ({
					plantId,
					x,
					y
				}))
			} });
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
		addPlacements(moves.map((move) => ({
			plantId: move.plantId,
			x: move.xFt,
			y: move.yFt
		})));
		setPlaced(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "ask-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-5/6 w-full overflow-y-auto border border-line bg-paper p-5 sm:max-w-lg sm:rounded-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "ask-title",
						className: "font-display text-3xl leading-none",
						children: "Ask Plotline"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						onClick: onClose,
						className: "ml-auto inline-flex size-11 items-center justify-center rounded-md border border-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "pt-3 text-sm leading-relaxed text-muted",
					children: [
						place?.name,
						", zone ",
						lot.zoneOverride || place?.zone,
						". The yes or no under each plant is instant. This asks once for a layout, in writing."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-3 text-sm leading-relaxed",
					children: lot.placed.length === 0 ? "The lot is empty. A layout can start it." : review.nos.length ? `${review.nos.length} already planted should come out.` : "Nothing planted is a hard no."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "pt-2",
					children: review.nos.slice(0, 4).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { verdict: "no" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: row.plant.name
						})]
					}, row.placed.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "primary",
					className: "mt-4",
					onClick: ask,
					disabled: loading,
					children: loading ? "Reading the lot…" : summary ? "Ask again" : "Ask for a layout"
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-3 text-sm text-clay",
					children: error
				}),
				summary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed",
							children: summary
						}),
						moves.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "pt-3",
							children: moves.map((move) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "border-t border-line py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: move.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: move.note
								})]
							}, `${move.plantId}-${move.xFt}-${move.yFt}`))
						}),
						moves.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ink",
							className: "mt-2",
							onClick: dropAll,
							disabled: placed,
							children: placed ? "Placed on the lot" : "Drop these on the lot"
						})
					]
				})
			]
		})
	});
}
function elevationLayout(w, h, lotW) {
	return {
		w,
		h,
		horizon: h * .34,
		ground: h * .88,
		basePpm: w * .78 / Math.max(lotW, 1)
	};
}
function project(layout, lotW, lotD, x, y) {
	const south = Math.max(0, Math.min(1, y / Math.max(lotD, 1)));
	const sy = layout.horizon + south * (layout.ground - layout.horizon);
	const persp = .55 + south * .7;
	const ppm = layout.basePpm * persp;
	return {
		sx: layout.w / 2 + (x - lotW / 2) * layout.basePpm * (.62 + south * .5),
		sy,
		ppm,
		south
	};
}
function unproject(layout, lotW, lotD, sx, sy) {
	const span = layout.ground - layout.horizon;
	const south = Math.max(0, Math.min(1, (sy - layout.horizon) / span));
	const y = south * lotD;
	const perspX = layout.basePpm * (.62 + south * .5);
	return {
		x: lotW / 2 + (sx - layout.w / 2) / perspX,
		y
	};
}
function drawElevation(ctx, lot, cssW, cssH, dpr, selectedId, live, camera, ink, paper, moss, clay, muted) {
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, cssW, cssH);
	const layout = elevationLayout(cssW, cssH, lot.widthFt);
	if (!camera) {
		ctx.fillStyle = paper;
		ctx.fillRect(0, 0, cssW, cssH);
		const corners = [
			project(layout, lot.widthFt, lot.depthFt, 0, lot.depthFt),
			project(layout, lot.widthFt, lot.depthFt, lot.widthFt, lot.depthFt),
			project(layout, lot.widthFt, lot.depthFt, lot.widthFt, 0),
			project(layout, lot.widthFt, lot.depthFt, 0, 0)
		];
		ctx.beginPath();
		ctx.moveTo(corners[0].sx, corners[0].sy);
		for (const corner of corners.slice(1)) ctx.lineTo(corner.sx, corner.sy);
		ctx.closePath();
		ctx.fillStyle = moss;
		ctx.globalAlpha = .1;
		ctx.fill();
		ctx.globalAlpha = 1;
		ctx.strokeStyle = ink;
		ctx.lineWidth = 1.25;
		ctx.stroke();
	}
	const spots = [...lot.spots].sort((a, b) => a.y - b.y);
	for (const spot of spots) {
		const pts = [
			project(layout, lot.widthFt, lot.depthFt, spot.x, spot.y + spot.h),
			project(layout, lot.widthFt, lot.depthFt, spot.x + spot.w, spot.y + spot.h),
			project(layout, lot.widthFt, lot.depthFt, spot.x + spot.w, spot.y),
			project(layout, lot.widthFt, lot.depthFt, spot.x, spot.y)
		];
		ctx.beginPath();
		ctx.moveTo(pts[0].sx, pts[0].sy);
		for (const pt of pts.slice(1)) ctx.lineTo(pt.sx, pt.sy);
		ctx.closePath();
		ctx.globalAlpha = camera ? .35 : spot.kind === "structure" ? .88 : .28;
		ctx.fillStyle = spot.kind === "structure" ? ink : spot.kind === "bed" ? clay : moss;
		if (!camera || spot.kind === "structure") ctx.fill();
		ctx.globalAlpha = camera ? .7 : 1;
		ctx.strokeStyle = spot.kind === "structure" ? paper : ink;
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.globalAlpha = 1;
	}
	const plants = lot.placed.map((placed) => {
		const plant = getPlant(placed.plantId);
		const pos = live?.id === placed.id ? live : placed;
		return plant ? {
			placed,
			plant,
			pos
		} : null;
	}).filter((row) => Boolean(row)).sort((a, b) => a.pos.y - b.pos.y);
	for (const row of plants) {
		const p = project(layout, lot.widthFt, lot.depthFt, row.pos.x, row.pos.y);
		drawSilhouette(ctx, row.plant.kind, p.sx, p.sy, row.plant.heightFt * p.ppm, row.plant.spreadFt * p.ppm, ink, camera ? paper : moss, row.placed.id === selectedId, clay);
		if (row.placed.id === selectedId) {
			ctx.fillStyle = ink;
			ctx.font = "600 13px Outfit, sans-serif";
			ctx.textAlign = "center";
			ctx.textBaseline = "bottom";
			ctx.fillText(row.plant.name, p.sx, p.sy - row.plant.heightFt * p.ppm - 6);
		}
	}
	if (!camera) {
		const feet = project(layout, lot.widthFt, lot.depthFt, lot.widthFt * .12, lot.depthFt * .96);
		drawFigure(ctx, feet.sx, feet.sy, feet.ppm, ink);
		ctx.fillStyle = muted;
		ctx.font = "500 12px Outfit, sans-serif";
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillText("6 ft", feet.sx + 14, feet.sy - 6 * feet.ppm * .5);
	}
	return layout;
}
function drawSilhouette(ctx, kind, x, y, height, spread, ink, fill, selected, clay) {
	ctx.save();
	ctx.fillStyle = fill;
	ctx.strokeStyle = selected ? clay : ink;
	ctx.lineWidth = selected ? 2 : 1.25;
	ctx.globalAlpha = .92;
	ctx.beginPath();
	if (kind === "evergreen") {
		ctx.moveTo(x, y - height);
		ctx.lineTo(x + spread / 2, y);
		ctx.lineTo(x - spread / 2, y);
		ctx.closePath();
	} else if (kind === "grass") {
		const blades = 5;
		for (let i = 0; i < blades; i++) {
			const bx = x - spread / 2 + spread * i / 4;
			ctx.moveTo(bx, y);
			ctx.lineTo(bx + spread * .04, y - height * (.7 + i % 2 * .25));
		}
	} else if (kind === "ground") ctx.ellipse(x, y - height * .3, spread / 2, Math.max(4, height), 0, 0, Math.PI * 2);
	else if (kind === "shrub" || kind === "perennial") ctx.ellipse(x, y - height * .45, spread / 2, height * .5, 0, 0, Math.PI * 2);
	else {
		ctx.moveTo(x - spread * .04, y);
		ctx.lineTo(x - spread * .04, y - height * .38);
		ctx.lineTo(x + spread * .04, y - height * .38);
		ctx.lineTo(x + spread * .04, y);
		ctx.ellipse(x, y - height * .62, spread / 2, height * .38, 0, 0, Math.PI * 2);
	}
	ctx.fill();
	ctx.globalAlpha = 1;
	ctx.stroke();
	ctx.restore();
}
function drawFigure(ctx, x, y, ppm, ink) {
	const h = 6 * ppm;
	ctx.save();
	ctx.strokeStyle = ink;
	ctx.lineWidth = Math.max(1.25, ppm * .06);
	ctx.beginPath();
	ctx.arc(x, y - h + h * .1, Math.max(2, h * .08), 0, Math.PI * 2);
	ctx.moveTo(x, y - h * .78);
	ctx.lineTo(x, y - h * .42);
	ctx.moveTo(x, y - h * .7);
	ctx.lineTo(x - h * .16, y - h * .48);
	ctx.moveTo(x, y - h * .7);
	ctx.lineTo(x + h * .16, y - h * .48);
	ctx.moveTo(x, y - h * .42);
	ctx.lineTo(x - h * .12, y);
	ctx.moveTo(x, y - h * .42);
	ctx.lineTo(x + h * .12, y);
	ctx.stroke();
	ctx.restore();
}
function hitElevation(lot, layout, sx, sy, live) {
	let found = null;
	const plants = [...lot.placed].sort((a, b) => a.y - b.y);
	for (const placed of plants) {
		const plant = getPlant(placed.plantId);
		if (!plant) continue;
		const pos = live?.id === placed.id ? live : placed;
		const p = project(layout, lot.widthFt, lot.depthFt, pos.x, pos.y);
		const height = plant.heightFt * p.ppm;
		const spread = plant.spreadFt * p.ppm;
		if (sx >= p.sx - spread / 2 && sx <= p.sx + spread / 2 && sy >= p.sy - height && sy <= p.sy + 8) found = placed.id;
	}
	return found;
}
var palette = null;
function readPalette() {
	if (palette) return palette;
	const style = getComputedStyle(document.documentElement);
	const pick = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
	palette = {
		paper: pick("--color-paper", "#f3efe6"),
		paperDeep: pick("--color-paper-deep", "#e6dfd0"),
		ink: pick("--color-ink", "#1e261c"),
		muted: pick("--color-muted", "#5e675c"),
		line: pick("--color-line", "#ddd4c4"),
		moss: pick("--color-moss", "#2c6a42"),
		mossDeep: pick("--color-moss-deep", "#1e4a2e"),
		clay: pick("--color-clay", "#c2653a")
	};
	return palette;
}
function computeView(cssW, cssH, lotW, lotD, zoom, panX, panY) {
	const padL = 56;
	const padR = 16;
	const padT = 14;
	const padB = 40;
	const availW = Math.max(20, cssW - padL - padR);
	const availH = Math.max(20, cssH - padT - padB);
	const ppm = Math.min(availW / Math.max(lotW, 1), availH / Math.max(lotD, 1)) * zoom;
	return {
		ppm,
		ox: padL + (availW - lotW * ppm) / 2 + panX,
		oy: padT + (availH - lotD * ppm) / 2 + panY
	};
}
function worldToScreen(view, x, y) {
	return {
		sx: view.ox + x * view.ppm,
		sy: view.oy + y * view.ppm
	};
}
function screenToWorld(view, sx, sy) {
	return {
		x: (sx - view.ox) / view.ppm,
		y: (sy - view.oy) / view.ppm
	};
}
function spotRect(spot, live) {
	if (live && live.id === spot.id) return {
		...spot,
		x: live.x,
		y: live.y
	};
	return spot;
}
function drawSpot(ctx, view, spot, colors, selected) {
	const a = worldToScreen(view, spot.x, spot.y);
	const w = spot.w * view.ppm;
	const h = spot.h * view.ppm;
	ctx.save();
	if (spot.kind === "structure") {
		ctx.globalAlpha = .92;
		ctx.fillStyle = colors.ink;
		ctx.fillRect(a.sx, a.sy, w, h);
		ctx.globalAlpha = 1;
	} else if (spot.kind === "lawn") {
		ctx.save();
		ctx.beginPath();
		ctx.rect(a.sx, a.sy, w, h);
		ctx.clip();
		ctx.globalAlpha = .14;
		ctx.fillStyle = colors.moss;
		ctx.fillRect(a.sx, a.sy, w, h);
		ctx.globalAlpha = .35;
		ctx.strokeStyle = colors.moss;
		ctx.lineWidth = 1;
		for (let i = -h; i < w + h; i += 8) {
			ctx.beginPath();
			ctx.moveTo(a.sx + i, a.sy);
			ctx.lineTo(a.sx + i + h, a.sy + h);
			ctx.stroke();
		}
		ctx.restore();
	} else if (spot.kind === "bed") {
		ctx.globalAlpha = .2;
		ctx.fillStyle = colors.clay;
		ctx.fillRect(a.sx, a.sy, w, h);
		ctx.globalAlpha = 1;
	} else if (spot.kind === "patio") {
		ctx.fillStyle = colors.paperDeep;
		ctx.fillRect(a.sx, a.sy, w, h);
		ctx.strokeStyle = colors.line;
		ctx.lineWidth = 1;
		const step = 14;
		for (let x = step; x < w; x += step) {
			ctx.beginPath();
			ctx.moveTo(a.sx + x, a.sy);
			ctx.lineTo(a.sx + x, a.sy + h);
			ctx.stroke();
		}
		for (let y = step; y < h; y += step) {
			ctx.beginPath();
			ctx.moveTo(a.sx, a.sy + y);
			ctx.lineTo(a.sx + w, a.sy + y);
			ctx.stroke();
		}
	} else if (spot.kind === "path") {
		ctx.strokeStyle = colors.ink;
		ctx.globalAlpha = .45;
		ctx.lineWidth = Math.max(3, Math.min(w, h) * .18);
		ctx.setLineDash([6, 5]);
		ctx.beginPath();
		if (w >= h) {
			ctx.moveTo(a.sx, a.sy + h / 2);
			ctx.lineTo(a.sx + w, a.sy + h / 2);
		} else {
			ctx.moveTo(a.sx + w / 2, a.sy);
			ctx.lineTo(a.sx + w / 2, a.sy + h);
		}
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.globalAlpha = 1;
	} else if (spot.kind === "water") {
		ctx.globalAlpha = .18;
		ctx.fillStyle = colors.mossDeep;
		ctx.fillRect(a.sx, a.sy, w, h);
		ctx.globalAlpha = .55;
		ctx.strokeStyle = colors.mossDeep;
		ctx.lineWidth = 1;
		for (let y = 6; y < h; y += 7) {
			ctx.beginPath();
			ctx.moveTo(a.sx + 4, a.sy + y);
			ctx.lineTo(a.sx + w - 4, a.sy + y);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
	}
	ctx.strokeStyle = selected ? colors.clay : colors.ink;
	ctx.lineWidth = selected ? 2 : 1;
	ctx.strokeRect(a.sx + .5, a.sy + .5, w, h);
	if (w > 46 && h > 18) {
		ctx.fillStyle = spot.kind === "structure" ? colors.paper : colors.ink;
		ctx.font = "500 12px Outfit, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(spot.name, a.sx + w / 2, a.sy + Math.min(h / 2, 16));
	}
	ctx.restore();
}
function drawKindMark(ctx, kind, r) {
	ctx.beginPath();
	if (kind === "tree") {
		ctx.moveTo(-r * .7, 0);
		ctx.lineTo(r * .7, 0);
		ctx.moveTo(0, -r * .7);
		ctx.lineTo(0, r * .7);
	} else if (kind === "evergreen") for (let i = 0; i < 8; i++) {
		const a = Math.PI * 2 * i / 8;
		ctx.moveTo(Math.cos(a) * r * .25, Math.sin(a) * r * .25);
		ctx.lineTo(Math.cos(a) * r * .72, Math.sin(a) * r * .72);
	}
	else if (kind === "shrub") ctx.arc(0, 0, r * .45, 0, Math.PI * 2);
	else if (kind === "perennial") for (const [dx, dy] of [
		[0, 0],
		[-.35, -.2],
		[.35, -.15],
		[-.2, .35],
		[.28, .32]
	]) {
		ctx.moveTo(dx * r + 1.6, dy * r);
		ctx.arc(dx * r, dy * r, 1.6, 0, Math.PI * 2);
	}
	else if (kind === "grass") for (let i = -2; i <= 2; i++) {
		ctx.moveTo(i * r * .18, r * .35);
		ctx.lineTo(i * r * .18, -r * .45);
	}
	else if (kind === "ground") for (let y = -r * .45; y <= r * .45; y += Math.max(4, r * .28)) {
		ctx.moveTo(-r * .55, y);
		ctx.lineTo(r * .55, y);
	}
	else {
		const s = r * .28;
		ctx.rect(-s, -s, s * 2, s * 2);
	}
	ctx.stroke();
}
function drawPlant(ctx, view, plant, x, y, colors, selected, verdict) {
	const c = worldToScreen(view, x, y);
	const r = Math.max(3, plant.spreadFt / 2 * view.ppm);
	ctx.save();
	ctx.translate(c.sx, c.sy);
	ctx.fillStyle = colors.moss;
	ctx.globalAlpha = plant.kind === "evergreen" ? .34 : .16;
	ctx.beginPath();
	ctx.arc(0, 0, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.globalAlpha = 1;
	ctx.strokeStyle = colors.ink;
	ctx.lineWidth = selected ? 2 : 1.25;
	ctx.stroke();
	ctx.lineWidth = 1;
	drawKindMark(ctx, plant.kind, r);
	if (verdict === "no") {
		ctx.fillStyle = colors.clay;
		ctx.beginPath();
		ctx.arc(r * .62, -r * .62, Math.max(3.5, Math.min(7, r * .16)), 0, Math.PI * 2);
		ctx.fill();
	} else if (verdict === "marginal") {
		ctx.strokeStyle = colors.clay;
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc(r * .62, -r * .62, Math.max(3.5, Math.min(7, r * .16)), 0, Math.PI * 2);
		ctx.stroke();
	}
	if (selected) {
		ctx.strokeStyle = verdict === "no" ? colors.clay : verdict === "marginal" ? colors.ink : colors.mossDeep;
		ctx.lineWidth = 1.5;
		ctx.setLineDash([4, 3]);
		ctx.beginPath();
		ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
		ctx.stroke();
	}
	ctx.restore();
}
function dimension(ctx, x1, y1, x2, y2, label, colors, vertical) {
	ctx.save();
	ctx.strokeStyle = colors.ink;
	ctx.fillStyle = colors.ink;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
	const tick = 4;
	ctx.beginPath();
	if (vertical) {
		ctx.moveTo(x1 - tick, y1);
		ctx.lineTo(x1 + tick, y1);
		ctx.moveTo(x2 - tick, y2);
		ctx.lineTo(x2 + tick, y2);
	} else {
		ctx.moveTo(x1, y1 - tick);
		ctx.lineTo(x1, y1 + tick);
		ctx.moveTo(x2, y2 - tick);
		ctx.lineTo(x2, y2 + tick);
	}
	ctx.stroke();
	ctx.font = "500 12px Outfit, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	const midX = (x1 + x2) / 2;
	const midY = (y1 + y2) / 2;
	ctx.translate(midX, midY);
	if (vertical) ctx.rotate(-Math.PI / 2);
	const width = ctx.measureText(label).width;
	ctx.fillStyle = colors.paperDeep;
	ctx.fillRect(-width / 2 - 4, -8, width + 8, 16);
	ctx.fillStyle = colors.ink;
	ctx.fillText(label, 0, 0);
	ctx.restore();
}
function drawPlan(ctx, model) {
	const colors = readPalette();
	const { cssW, cssH, dpr, lot } = model;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, cssW, cssH);
	ctx.fillStyle = colors.paperDeep;
	ctx.fillRect(0, 0, cssW, cssH);
	const view = computeView(cssW, cssH, lot.widthFt, lot.depthFt, model.zoom, model.panX, model.panY);
	const origin = worldToScreen(view, 0, 0);
	const far = worldToScreen(view, lot.widthFt, lot.depthFt);
	ctx.fillStyle = colors.paper;
	ctx.fillRect(origin.sx, origin.sy, far.sx - origin.sx, far.sy - origin.sy);
	const step = model.unit === "ft" ? 5 : 2 * FT_PER_M;
	ctx.beginPath();
	ctx.strokeStyle = colors.line;
	ctx.lineWidth = 1;
	for (let x = 0; x <= lot.widthFt + .01; x += step) {
		const a = worldToScreen(view, x, 0);
		const b = worldToScreen(view, x, lot.depthFt);
		ctx.moveTo(a.sx, a.sy);
		ctx.lineTo(b.sx, b.sy);
	}
	for (let y = 0; y <= lot.depthFt + .01; y += step) {
		const a = worldToScreen(view, 0, y);
		const b = worldToScreen(view, lot.widthFt, y);
		ctx.moveTo(a.sx, a.sy);
		ctx.lineTo(b.sx, b.sy);
	}
	ctx.stroke();
	for (const spot of lot.spots) drawSpot(ctx, view, spotRect(spot, model.liveSpot), colors, model.selected?.kind === "spot" && model.selected.id === spot.id);
	if (model.draft && model.draft.w > 0 && model.draft.h > 0) {
		const a = worldToScreen(view, model.draft.x, model.draft.y);
		ctx.save();
		ctx.strokeStyle = colors.clay;
		ctx.setLineDash([5, 4]);
		ctx.lineWidth = 1.5;
		ctx.strokeRect(a.sx, a.sy, model.draft.w * view.ppm, model.draft.h * view.ppm);
		ctx.restore();
	}
	ctx.strokeStyle = colors.ink;
	ctx.lineWidth = 1.75;
	ctx.strokeRect(origin.sx + .5, origin.sy + .5, far.sx - origin.sx, far.sy - origin.sy);
	for (const placed of lot.placed) {
		const plant = getPlant(placed.plantId);
		if (!plant) continue;
		const pos = model.livePlant?.id === placed.id ? model.livePlant : placed;
		const advice = adviseAt(plant.id, pos.x, pos.y, lot, placed.id);
		drawPlant(ctx, view, plant, pos.x, pos.y, colors, model.selected?.kind === "plant" && model.selected.id === placed.id, advice?.verdict ?? null);
	}
	if (model.preview) {
		const plant = getPlant(model.preview.plantId);
		if (plant) {
			const advice = adviseAt(plant.id, model.preview.x, model.preview.y, lot);
			ctx.save();
			ctx.globalAlpha = .85;
			drawPlant(ctx, view, plant, model.preview.x, model.preview.y, colors, true, advice?.verdict ?? null);
			ctx.restore();
		}
	}
	drawNorth(ctx, origin.sx + 22, origin.sy + 22, colors.ink, colors.paper);
	const unitLabel = (ft) => {
		if (model.unit === "ft") return `${Math.round(ft)} ft`;
		return `${Math.round(ft / FT_PER_M * 10) / 10} m`;
	};
	dimension(ctx, origin.sx, far.sy + 18, far.sx, far.sy + 18, unitLabel(lot.widthFt), colors, false);
	dimension(ctx, origin.sx - 22, origin.sy, origin.sx - 22, far.sy, unitLabel(lot.depthFt), colors, true);
	if (lot.placed.length === 0 && !model.preview) {
		ctx.fillStyle = colors.muted;
		ctx.font = "500 14px Outfit, sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const cx = (origin.sx + far.sx) / 2;
		const cy = (origin.sy + far.sy) / 2;
		ctx.fillText("Drag a plant onto the lot", cx, cy);
		ctx.font = "400 12px Outfit, sans-serif";
		ctx.fillText("Circles are mature spread, to scale", cx, cy + 18);
	}
	return view;
}
function drawNorth(ctx, x, y, ink, paper) {
	ctx.save();
	ctx.translate(x, y);
	ctx.fillStyle = paper;
	ctx.strokeStyle = ink;
	ctx.lineWidth = 1.25;
	ctx.beginPath();
	ctx.arc(0, 0, 12, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.fillStyle = ink;
	ctx.beginPath();
	ctx.moveTo(0, -8);
	ctx.lineTo(4, 4);
	ctx.lineTo(0, 1.5);
	ctx.lineTo(-4, 4);
	ctx.closePath();
	ctx.fill();
	ctx.font = "600 9px Outfit, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("N", 0, -14);
	ctx.restore();
}
function hitPlant(model, view, sx, sy) {
	const { lot } = model;
	for (let i = lot.placed.length - 1; i >= 0; i--) {
		const placed = lot.placed[i];
		const plant = getPlant(placed.plantId);
		const pos = model.livePlant?.id === placed.id ? model.livePlant : placed;
		const center = worldToScreen(view, pos.x, pos.y);
		const r = Math.max(16, (plant?.spreadFt ?? 4) / 2 * view.ppm);
		if (Math.hypot(sx - center.sx, sy - center.sy) <= r) return placed;
	}
	return null;
}
function hitSpot(model, x, y) {
	const { lot } = model;
	for (let i = lot.spots.length - 1; i >= 0; i--) {
		const spot = spotRect(lot.spots[i], model.liveSpot);
		if (x >= spot.x && y >= spot.y && x <= spot.x + spot.w && y <= spot.y + spot.h) return lot.spots[i];
	}
	return null;
}
function LensView({ onClose }) {
	const wrapRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const videoRef = (0, import_react.useRef)(null);
	const streamRef = (0, import_react.useRef)(null);
	const lot = usePlot((state) => state.lot);
	const selected = usePlot((state) => state.selected);
	const [camera, setCamera] = (0, import_react.useState)("off");
	const [size, setSize] = (0, import_react.useState)({
		w: 0,
		h: 0
	});
	const liveRef = (0, import_react.useRef)(null);
	const dragRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		const measure = () => {
			const rect = wrap.getBoundingClientRect();
			setSize({
				w: rect.width,
				h: rect.height
			});
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(wrap);
		return () => observer.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas || size.w < 2 || size.h < 2) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const colors = readPalette();
		canvas.width = Math.floor(size.w * dpr);
		canvas.height = Math.floor(size.h * dpr);
		drawElevation(ctx, lot, size.w, size.h, dpr, selected?.kind === "plant" ? selected.id : null, liveRef.current, camera === "on", colors.ink, colors.paper, colors.moss, colors.clay, colors.muted);
	}, [
		lot,
		selected,
		size,
		camera
	]);
	(0, import_react.useEffect)(() => {
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
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "environment" },
				audio: false
			});
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
	function point(event) {
		const canvas = canvasRef.current;
		if (!canvas) return null;
		const rect = canvas.getBoundingClientRect();
		return {
			sx: event.clientX - rect.left,
			sy: event.clientY - rect.top
		};
	}
	function onPointerDown(event) {
		const local = point(event);
		if (!local) return;
		const layout = elevationLayout(size.w, size.h, lot.widthFt);
		const id = hitElevation(lot, layout, local.sx, local.sy, liveRef.current);
		if (!id) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		dragRef.current = {
			id,
			moved: false
		};
		usePlot.getState().select({
			kind: "plant",
			id
		});
	}
	function onPointerMove(event) {
		const drag = dragRef.current;
		const local = point(event);
		if (!drag || !local) return;
		const world = unproject(elevationLayout(size.w, size.h, lot.widthFt), lot.widthFt, lot.depthFt, local.sx, local.sy);
		const x = snapHalf(clamp(world.x, .5, lot.widthFt - .5));
		const y = snapHalf(clamp(world.y, .5, lot.depthFt - .5));
		drag.moved = true;
		liveRef.current = {
			id: drag.id,
			x,
			y
		};
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
		if (drag?.moved && liveRef.current) usePlot.getState().movePlant(drag.id, liveRef.current.x, liveRef.current.y);
		liveRef.current = null;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-40 flex flex-col bg-paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 items-center gap-2 border-b border-line px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl leading-none",
							children: "From the south edge"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Looking north. Drag a plant nearer, farther, or sideways. The figure is 6 ft."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: toggleCamera,
						className: "h-11 shrink-0 rounded-md border border-line px-3 text-sm",
						children: camera === "on" ? "Close camera" : "Camera"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close view",
						onClick: onClose,
						className: "inline-flex size-11 items-center justify-center rounded-md border border-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})
				]
			}),
			camera === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 py-2 text-sm text-clay",
				children: "The camera stayed off. This view still shows the lot, with a person for scale. Nothing is uploaded either way."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: wrapRef,
				className: "relative min-h-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					playsInline: true,
					muted: true,
					className: camera === "on" ? "absolute inset-0 h-full w-full object-cover" : "hidden"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "absolute inset-0 h-full w-full touch-none",
					onPointerDown,
					onPointerMove,
					onPointerUp
				})]
			})
		]
	});
}
var SOILS$1 = [
	{
		id: "loam",
		label: "Loam"
	},
	{
		id: "clay",
		label: "Clay"
	},
	{
		id: "sand",
		label: "Sand"
	},
	{
		id: "unknown",
		label: "Unsure"
	}
];
var ZONES = Array.from({ length: 9 }, (_, index) => [`${index + 3}a`, `${index + 3}b`]).flat();
function LotDialog({ onClose }) {
	const lot = usePlot((state) => state.lot);
	const unit = usePlot((state) => state.unit);
	const setUnit = usePlot((state) => state.setUnit);
	const setLotMeta = usePlot((state) => state.setLotMeta);
	const clearPlants = usePlot((state) => state.clearPlants);
	const reset = usePlot((state) => state.reset);
	const [name, setName] = (0, import_react.useState)(lot.name);
	const [width, setWidth] = (0, import_react.useState)(String(Math.round(toDisplay(lot.widthFt, unit) * 10) / 10));
	const [depth, setDepth] = (0, import_react.useState)(String(Math.round(toDisplay(lot.depthFt, unit) * 10) / 10));
	const [placeId, setPlaceId] = (0, import_react.useState)(lot.placeId);
	const [soil, setSoil] = (0, import_react.useState)(lot.soil);
	const [zone, setZone] = (0, import_react.useState)(lot.zoneOverride ?? "");
	const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
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
			zoneOverride: zone || null
		});
		onClose();
	}
	function changeUnit(next) {
		if (next === unit) return;
		const widthFt = fromDisplay(Number(width), unit);
		const depthFt = fromDisplay(Number(depth), unit);
		setUnit(next);
		if (Number.isFinite(widthFt)) setWidth(String(Math.round(toDisplay(widthFt, next) * 10) / 10));
		if (Number.isFinite(depthFt)) setDepth(String(Math.round(toDisplay(depthFt, next) * 10) / 10));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6",
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "lot-title",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-5/6 w-full overflow-y-auto border border-line bg-paper p-5 sm:max-w-lg sm:rounded-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "lot-title",
						className: "font-display text-3xl leading-none",
						children: "The lot"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Close",
						onClick: onClose,
						className: "ml-auto inline-flex size-11 items-center justify-center rounded-md border border-line",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-sm",
					children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						onChange: (event) => setName(event.target.value),
						className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-moss"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2 pt-3",
					children: ["ft", "m"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": unit === item,
						onClick: () => changeUnit(item),
						className: `h-11 rounded-md px-4 text-sm ${unit === item ? "bg-ink text-paper" : "border border-line"}`,
						children: item
					}, item))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm",
						children: ["Width", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							inputMode: "decimal",
							value: width,
							onChange: (event) => setWidth(event.target.value),
							className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 tabular-nums outline-none focus:border-moss"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm",
						children: ["Depth", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							inputMode: "decimal",
							value: depth,
							onChange: (event) => setDepth(event.target.value),
							className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 tabular-nums outline-none focus:border-moss"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-2 text-xs text-muted",
					children: "Plants that land outside a smaller lot get removed."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-sm",
					children: ["City", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: placeId,
						onChange: (event) => setPlaceId(event.target.value),
						className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-moss",
						children: PLACES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: item.name
						}, item.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-sm",
					children: ["Zone override", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: zone,
						onChange: (event) => setZone(event.target.value),
						className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-moss",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: "",
							children: ["Use ", place?.zone ?? "the city zone"]
						}), ZONES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item,
							children: item
						}, item))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-4 gap-1 pt-4",
					children: SOILS$1.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": soil === item.id,
						onClick: () => setSoil(item.id),
						className: `h-11 rounded-md text-sm ${soil === item.id ? "bg-ink text-paper" : "border border-line"}`,
						children: item.label
					}, item.id))
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-3 text-sm text-clay",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "primary",
					className: "mt-4 w-full",
					onClick: apply,
					children: "Save the lot"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-2 border-t border-line pt-4",
					children: [confirmClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "clay",
						onClick: () => {
							clearPlants();
							setConfirmClear(false);
						},
						children: "Confirm, pull every plant"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => setConfirmClear(true),
						children: "Pull every plant"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: () => {
							reset();
							onClose();
						},
						children: "Start a different lot"
					})]
				})
			]
		})
	});
}
var PlanCanvas = (0, import_react.forwardRef)(function PlanCanvas({ tool, preview, onLift }, ref) {
	const wrapRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const viewRef = (0, import_react.useRef)(computeView(300, 300, 60, 80, 1, 0, 0));
	const zoomRef = (0, import_react.useRef)(1);
	const panRef = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const sizeRef = (0, import_react.useRef)({
		w: 0,
		h: 0
	});
	const toolRef = (0, import_react.useRef)(tool);
	const previewRef = (0, import_react.useRef)(preview);
	const dragRef = (0, import_react.useRef)(null);
	const livePlant = (0, import_react.useRef)(null);
	const liveSpot = (0, import_react.useRef)(null);
	const draftRef = (0, import_react.useRef)(null);
	const [tick, setTick] = (0, import_react.useState)(0);
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
			draft
		});
	};
	(0, import_react.useEffect)(() => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		const measure = () => {
			const rect = wrap.getBoundingClientRect();
			sizeRef.current = {
				w: rect.width,
				h: rect.height
			};
			setTick((value) => value + 1);
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(wrap);
		return () => observer.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		paint();
	}, [
		lot,
		selected,
		unit,
		preview,
		tick,
		tool
	]);
	(0, import_react.useEffect)(() => {
		document.fonts?.ready.then(() => paint()).catch(() => void 0);
	}, []);
	(0, import_react.useImperativeHandle)(ref, () => ({ clientToWorld(clientX, clientY) {
		const canvas = canvasRef.current;
		if (!canvas) return null;
		const rect = canvas.getBoundingClientRect();
		if (clientX < rect.left || clientY < rect.top || clientX > rect.right || clientY > rect.bottom) return null;
		return screenToWorld(viewRef.current, clientX - rect.left, clientY - rect.top);
	} }));
	function worldFromEvent(event) {
		const canvas = canvasRef.current;
		if (!canvas) return null;
		const rect = canvas.getBoundingClientRect();
		return {
			sx: event.clientX - rect.left,
			sy: event.clientY - rect.top,
			...screenToWorld(viewRef.current, event.clientX - rect.left, event.clientY - rect.top)
		};
	}
	function onPointerDown(event) {
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
			draft: null
		};
		if (toolRef.current === "select") {
			const plant = hitPlant(model, viewRef.current, point.sx, point.sy);
			if (plant) {
				const pos = livePlant.current?.id === plant.id ? livePlant.current : plant;
				dragRef.current = {
					type: "plant",
					id: plant.id,
					dx: point.x - pos.x,
					dy: point.y - pos.y,
					x: pos.x,
					y: pos.y,
					moved: false
				};
				state.select({
					kind: "plant",
					id: plant.id
				});
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
					moved: false
				};
				state.select({
					kind: "spot",
					id: spot.id
				});
				return;
			}
			dragRef.current = {
				type: "pan",
				clientX: event.clientX,
				clientY: event.clientY,
				panX: panRef.current.x,
				panY: panRef.current.y,
				moved: false
			};
			return;
		}
		dragRef.current = {
			type: "draft",
			kind: toolRef.current,
			x0: point.x,
			y0: point.y,
			x1: point.x,
			y1: point.y
		};
	}
	function onPointerMove(event) {
		const drag = dragRef.current;
		const point = worldFromEvent(event);
		if (!drag || !point) return;
		if (drag.type === "plant") {
			const x = snapHalf(point.x - drag.dx);
			const y = snapHalf(point.y - drag.dy);
			if (Math.hypot(x - drag.x, y - drag.y) > .4) drag.moved = true;
			drag.x = x;
			drag.y = y;
			livePlant.current = {
				id: drag.id,
				x,
				y
			};
			paint();
		} else if (drag.type === "spot") {
			const lotNow = usePlot.getState().lot;
			const x = snapHalf(clamp(point.x - drag.dx, -drag.w + 2, lotNow.widthFt - 2));
			const y = snapHalf(clamp(point.y - drag.dy, -drag.h + 2, lotNow.depthFt - 2));
			if (Math.hypot(x - drag.x, y - drag.y) > .4) drag.moved = true;
			drag.x = x;
			drag.y = y;
			liveSpot.current = {
				id: drag.id,
				x,
				y
			};
			paint();
		} else if (drag.type === "pan") {
			const dx = event.clientX - drag.clientX;
			const dy = event.clientY - drag.clientY;
			if (Math.hypot(dx, dy) > 4) drag.moved = true;
			panRef.current = {
				x: drag.panX + dx,
				y: drag.panY + dy
			};
			paint();
		} else if (drag.type === "draft") {
			drag.x1 = point.x;
			drag.y1 = point.y;
			const x = Math.min(drag.x0, drag.x1);
			const y = Math.min(drag.y0, drag.y1);
			draftRef.current = {
				kind: drag.kind,
				x,
				y,
				w: Math.abs(drag.x1 - drag.x0),
				h: Math.abs(drag.y1 - drag.y0)
			};
			paint();
		}
	}
	function onPointerUp(event) {
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
			} else if (drag.moved) state.movePlant(drag.id, drag.x, drag.y);
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
			if (w >= 3 && h >= 3) state.addSpot({
				kind: drag.kind,
				x,
				y,
				w,
				h
			});
		}
		paint();
	}
	function zoomBy(factor) {
		zoomRef.current = clamp(zoomRef.current * factor, .7, 3.5);
		setTick((value) => value + 1);
	}
	function fit() {
		zoomRef.current = 1;
		panRef.current = {
			x: 0,
			y: 0
		};
		setTick((value) => value + 1);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "relative min-h-0 flex-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "h-full w-full touch-none",
			onPointerDown,
			onPointerMove,
			onPointerUp,
			onPointerCancel: onPointerUp
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute top-2 right-2 flex gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Zoom out",
					onClick: () => zoomBy(.9),
					className: "inline-flex size-11 items-center justify-center rounded-md border border-line bg-paper text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: fit,
					className: "inline-flex h-11 items-center rounded-md border border-line bg-paper px-3 text-sm text-ink",
					children: "Fit"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Zoom in",
					onClick: () => zoomBy(1.1),
					className: "inline-flex size-11 items-center justify-center rounded-md border border-line bg-paper text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
				})
			]
		})]
	});
});
function PlantMark({ kind, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 36 36",
		className: cn("size-9 shrink-0 text-ink", className),
		"aria-hidden": true,
		children: [
			kind === "tree" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "18",
				r: "11",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 8v20M8 18h20",
				stroke: "currentColor",
				strokeWidth: "1.25"
			})] }),
			kind === "evergreen" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 4 31 30H5Z",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 30v4",
				stroke: "currentColor",
				strokeWidth: "1.5"
			})] }),
			kind === "shrub" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "13",
					cy: "20",
					r: "7",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "23",
					cy: "20",
					r: "7",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "18",
					cy: "14",
					r: "7",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.4"
				})
			] }),
			kind === "perennial" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "18",
					cy: "18",
					r: "2.2",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "11",
					cy: "14",
					r: "2",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "25",
					cy: "14",
					r: "2",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "24",
					r: "2",
					fill: "currentColor"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "24",
					cy: "24",
					r: "2",
					fill: "currentColor"
				})
			] }),
			kind === "grass" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M8 28 12 8M14 28 16 10M18 28V8M22 28 20 10M24 28 28 8",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.4"
			}),
			kind === "ground" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
				cx: "18",
				cy: "20",
				rx: "12",
				ry: "7",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.4"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M8 18h20M9 22h18",
				stroke: "currentColor",
				strokeWidth: "1.2"
			})] }),
			kind === "edible" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "18",
				r: "11",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "13",
				y: "13",
				width: "10",
				height: "10",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.25"
			})] })
		]
	});
}
function PlantRail({ lifting, onPlantPointerDown }) {
	const lot = usePlot((state) => state.lot);
	const unit = usePlot((state) => state.unit);
	const [filter, setFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [fitsOnly, setFitsOnly] = (0, import_react.useState)(true);
	const rows = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return PLANTS.map((plant) => ({
			plant,
			verdict: climateVerdict(plant, lot)
		})).filter((row) => filter === "all" ? true : row.plant.kind === filter).filter((row) => q ? `${row.plant.name} ${row.plant.latin}`.toLowerCase().includes(q) : true).filter((row) => fitsOnly ? row.verdict !== "no" : true).sort((a, b) => verdictRank(a.verdict) - verdictRank(b.verdict) || a.plant.name.localeCompare(b.plant.name));
	}, [
		filter,
		query,
		fitsOnly,
		lot
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		"data-plant-rail": true,
		"data-pullout": lifting ? "" : void 0,
		className: cn("flex min-h-0 shrink-0 flex-col border-line bg-paper", "max-md:order-2 max-md:border-t md:order-1 md:w-72 md:border-r", lifting && "bg-paper-deep"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-3 pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl leading-none",
					children: lifting ? "Pull out" : "Plants"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": fitsOnly,
					onClick: () => setFitsOnly((value) => !value),
					className: cn("ml-auto h-10 rounded-md px-3 text-sm", fitsOnly ? "bg-moss text-paper" : "border border-line text-ink"),
					children: "Fits here"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 pt-1 text-xs text-muted",
				children: lifting ? "Release over this list to pull the plant out." : "Tap to drop one in a bed, or drag it to a spot."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 overflow-x-auto px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Search",
					"aria-label": "Search plants",
					className: "h-10 w-28 shrink-0 rounded-md border border-line bg-paper px-3 text-sm text-ink outline-none focus:border-moss"
				}), FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": filter === item.id,
					onClick: () => setFilter(item.id),
					className: cn("h-10 shrink-0 rounded-md px-3 text-sm", filter === item.id ? "bg-ink text-paper" : "text-muted"),
					children: item.label
				}, item.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 gap-2 overflow-auto px-3 pb-3 max-md:h-32 md:flex-1 md:flex-col",
				children: [rows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "px-1 text-sm text-muted",
					children: [
						"Nothing in this climate under that filter.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "underline",
							onClick: () => setFitsOnly(false),
							children: "Show plants that do not belong"
						})
					]
				}), rows.map(({ plant, verdict }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onPointerDown: (event) => onPlantPointerDown(event, plant.id),
					className: "flex w-40 shrink-0 items-center gap-2 rounded-md border border-line bg-paper p-2 text-left md:w-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlantMark, { kind: plant.kind }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-medium",
								children: plant.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "block text-xs text-muted tabular-nums",
								children: [
									formatFt(plant.heightFt, unit, plant.heightFt < 1 ? 1 : 0),
									" × ",
									formatFt(plant.spreadFt, unit, plant.spreadFt < 1 ? 1 : 0)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictWord, { verdict })
						]
					})]
				}, plant.id))]
			})
		]
	});
}
function verdictRank(verdict) {
	if (verdict === "yes") return 0;
	if (verdict === "marginal") return 1;
	return 2;
}
function VerdictWord({ verdict }) {
	if (verdict === "yes") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-moss",
		children: "Yes for this climate"
	});
	if (verdict === "marginal") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-clay",
		children: "Marginal here"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs text-clay",
		children: "No for this climate"
	});
}
var SOILS = [
	{
		id: "loam",
		label: "Loam"
	},
	{
		id: "clay",
		label: "Clay"
	},
	{
		id: "sand",
		label: "Sand"
	},
	{
		id: "unknown",
		label: "Unsure"
	}
];
function SetupScreen() {
	const configure = usePlot((state) => state.configure);
	const [name, setName] = (0, import_react.useState)("Back lot");
	const [unit, setUnit] = (0, import_react.useState)("ft");
	const [width, setWidth] = (0, import_react.useState)("60");
	const [depth, setDepth] = (0, import_react.useState)("80");
	const [placeId, setPlaceId] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	const [soil, setSoil] = (0, import_react.useState)("loam");
	const [soilTouched, setSoilTouched] = (0, import_react.useState)(false);
	const [typical, setTypical] = (0, import_react.useState)(true);
	const [locNote, setLocNote] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const place = placeId ? getPlace(placeId) : null;
	const matches = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return PLACES.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 6);
	}, [query]);
	function pickPlace(id) {
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
		navigator.geolocation.getCurrentPosition((pos) => {
			const nearest = nearestPlace(pos.coords.latitude, pos.coords.longitude);
			pickPlace(nearest.place.id);
			setLocNote(nearest.miles > 80 ? `Nearest known climate is ${nearest.place.name}, about ${Math.round(nearest.miles)} miles away.` : `Using ${nearest.place.name}.`);
		}, () => setLocNote("Location stayed off. Search the city. The zone is what matters."), {
			enableHighAccuracy: false,
			timeout: 8e3,
			maximumAge: 6e4
		});
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
			typical
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "h-dvh overflow-y-auto bg-paper text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative border border-line p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, { className: "-top-px -left-px border-t-2 border-l-2" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, { className: "-top-px -right-px border-t-2 border-r-2" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, { className: "-bottom-px -left-px border-b-2 border-l-2" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Corner, { className: "-right-px -bottom-px border-r-2 border-b-2" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-muted uppercase",
						children: "Measured landscape"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-5xl leading-none",
						children: "Plotline"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm pt-3 text-sm leading-relaxed",
						children: "A lot with real dimensions. Trees and plants at their grown size. A straight answer about whether that plant belongs there."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 pt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "min-w-0 flex-1 text-sm",
							children: ["Lot name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: name,
								onChange: (event) => setName(event.target.value),
								className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-moss"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-1",
								children: ["ft", "m"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": unit === item,
									onClick: () => setUnit(item),
									className: cn("h-11 w-12 rounded-md text-sm", unit === item ? "bg-ink text-paper" : "border border-line"),
									children: item
								}, item))
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: ["Width", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								inputMode: "decimal",
								value: width,
								onChange: (event) => setWidth(event.target.value),
								className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 tabular-nums outline-none focus:border-moss"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "text-sm",
							children: ["Depth", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								inputMode: "decimal",
								value: depth,
								onChange: (event) => setDepth(event.target.value),
								className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 tabular-nums outline-none focus:border-moss"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-2 text-xs text-muted",
						children: "North is the top of the plan. The south side of a house gets the sun."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "min-w-0 flex-1 text-sm",
									children: ["Where is it", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: query,
										onChange: (event) => setQuery(event.target.value),
										placeholder: place ? place.name : "Search a city",
										"aria-label": "Search a city",
										className: "mt-1 h-11 w-full rounded-md border border-line bg-paper px-3 outline-none focus:border-moss"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: locate,
									"aria-label": "Use this location",
									className: "mt-5 inline-flex size-11 items-center justify-center rounded-md border border-line",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-4" })
								})]
							}),
							locNote && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "pt-2 text-xs text-muted",
								children: locNote
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2 pt-3",
								children: (matches.length ? matches : QUICK_PLACES.map((id) => getPlace(id))).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => pickPlace(item.id),
									className: cn("h-10 rounded-md px-3 text-sm", placeId === item.id ? "bg-ink text-paper" : "border border-line"),
									children: item.name
								}, item.id))
							}),
							place && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-md bg-paper-deep p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-medium",
									children: ["Zone ", place.zone]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "pt-1 text-sm leading-relaxed text-muted",
									children: [
										place.blurb,
										" About ",
										place.rainIn,
										" inches of rain."
									]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pb-2 text-sm",
							children: "Soil"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-1",
							children: SOILS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": soil === item.id,
								onClick: () => {
									setSoilTouched(true);
									setSoil(item.id);
								},
								className: cn("h-11 rounded-md text-sm", soil === item.id ? "bg-ink text-paper" : "border border-line"),
								children: item.label
							}, item.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-4 flex items-start gap-3 text-sm leading-snug",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: typical,
							onChange: (event) => setTypical(event.target.checked),
							className: "mt-1 size-4 accent-moss"
						}), "Start with a house, a sunny south bed, a shady north bed, and a lawn."]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-3 text-sm text-clay",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "primary",
						className: "mt-5 w-full",
						onClick: open,
						children: "Open the lot"
					})
				]
			})
		})
	});
}
function Corner({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("pointer-events-none absolute size-3 border-ink", className) });
}
var TOOLS = [
	{
		id: "select",
		label: "Move",
		icon: MousePointer2
	},
	{
		id: "bed",
		label: "Bed",
		icon: Flower2
	},
	{
		id: "lawn",
		label: "Lawn",
		icon: Grid3x3
	},
	{
		id: "patio",
		label: "Patio",
		icon: Square
	},
	{
		id: "path",
		label: "Path",
		icon: Minus
	},
	{
		id: "water",
		label: "Water",
		icon: Droplets
	},
	{
		id: "structure",
		label: "House",
		icon: House
	}
];
function StudioGate() {
	(0, import_react.useEffect)(() => {
		usePlot.persist.rehydrate();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Studio, {});
}
function Studio() {
	if (!usePlot((state) => state.configured)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupScreen, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Planner, {});
}
function Planner() {
	const lot = usePlot((state) => state.lot);
	const planRef = (0, import_react.useRef)(null);
	const [tool, setTool] = (0, import_react.useState)("select");
	const [lifting, setLifting] = (0, import_react.useState)(false);
	const [sheet, setSheet] = (0, import_react.useState)(false);
	const [ask, setAsk] = (0, import_react.useState)(false);
	const [lens, setLens] = (0, import_react.useState)(false);
	const [lotOpen, setLotOpen] = (0, import_react.useState)(false);
	const [ghost, setGhost] = (0, import_react.useState)(null);
	const [preview, setPreview] = (0, import_react.useState)(null);
	const place = getPlace(lot.placeId);
	const zone = effectiveZone(lot);
	(0, import_react.useEffect)(() => {
		function onKey(event) {
			if (event.key !== "Delete" && event.key !== "Backspace") return;
			const target = event.target;
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
	function onPlantPointerDown(event, plantId) {
		if (event.button !== 0) return;
		const startX = event.clientX;
		const startY = event.clientY;
		let active = false;
		let max = 0;
		function move(ev) {
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
			setGhost({
				plantId,
				px: ev.clientX,
				py: ev.clientY
			});
			setPreview(world && world.x >= 0 && world.y >= 0 && world.x <= lot.widthFt && world.y <= lot.depthFt ? {
				plantId,
				x: snapHalf(world.x),
				y: snapHalf(world.y)
			} : null);
		}
		function up(ev) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex h-dvh flex-col overflow-hidden bg-paper text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex shrink-0 items-center gap-2 border-b border-line px-3 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl leading-none",
							children: "Plotline"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted",
							children: [
								"Zone ",
								zone,
								" · ",
								place?.name,
								" · ",
								lot.name
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": "Lot settings",
						onClick: () => setLotOpen(true),
						className: "inline-flex h-11 items-center gap-2 rounded-md border border-line px-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ruler, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Lot"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": "Stand in the lot",
						onClick: () => setLens(true),
						className: "inline-flex h-11 items-center gap-2 rounded-md border border-line px-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "View"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": "Ask Plotline",
						onClick: () => setAsk(true),
						className: "inline-flex h-11 items-center gap-2 rounded-md bg-moss px-3 text-sm text-paper",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "Ask"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col md:flex-row",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlantRail, {
						lifting,
						onPlantPointerDown
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 min-w-0 flex-1 flex-col max-md:order-1 md:order-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex shrink-0 gap-1 overflow-x-auto border-b border-line px-2 py-2",
								children: TOOLS.map((item) => {
									const Icon = item.icon;
									const on = tool === item.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										"aria-pressed": on,
										onClick: () => setTool(item.id),
										className: `inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm ${on ? "bg-ink text-paper" : "text-ink"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
									}, item.id);
								})
							}),
							tool !== "select" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-3 pb-1 text-xs text-muted",
								children: "Drag a rectangle on the lot. North is up."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanCanvas, {
								ref: planRef,
								tool,
								preview,
								onLift: setLifting
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictBar, { onOpen: () => setSheet(true) })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "hidden min-h-0 w-80 shrink-0 overflow-y-auto border-l border-line xl:order-3 xl:flex xl:flex-col",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorBody, { onAsk: () => setAsk(true) })
					})
				]
			}),
			sheet && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-30 flex items-end bg-ink/40 xl:hidden",
				role: "dialog",
				"aria-modal": "true",
				"aria-label": "Plant notes",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Close notes",
					className: "absolute inset-0",
					onClick: () => setSheet(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-h-5/6 w-full overflow-y-auto border-t border-line bg-paper",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end px-3 pt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSheet(false),
							className: "h-11 rounded-md border border-line px-4 text-sm",
							children: "Close"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InspectorBody, { onAsk: () => {
						setSheet(false);
						setAsk(true);
					} })]
				})]
			}),
			ask && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AskPanel, { onClose: () => setAsk(false) }),
			lens && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LensView, { onClose: () => setLens(false) }),
			lotOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LotDialog, { onClose: () => setLotOpen(false) }),
			ghost && ghostPlant && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none fixed z-50 flex items-center gap-2 rounded-md border border-ink bg-paper px-2 py-1 text-sm",
				style: {
					left: ghost.px + 14,
					top: ghost.py + 14
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlantMark, {
					kind: ghostPlant.kind,
					className: "size-7"
				}), ghostPlant.name]
			})
		]
	});
}
var SplitComponent = StudioGate;
//#endregion
export { SplitComponent as component };
