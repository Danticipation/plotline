import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { c as climateIssues, d as effectiveZone, f as getPlace, i as PLANTS, l as climateLabel, o as adviseAt, p as getPlant } from "./advice-CaUb1y07.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/advise.functions-BHh-gYxE.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
function asLot(input) {
	const spots = input.spots.map((spot, index) => ({
		...spot,
		id: `s${index}`
	}));
	return {
		name: input.name,
		widthFt: input.widthFt,
		depthFt: input.depthFt,
		soil: input.soil,
		placeId: input.placeId,
		zoneOverride: input.zoneOverride,
		spots,
		placed: input.placed.map((plant, index) => ({
			...plant,
			id: `p${index}`
		}))
	};
}
function textOf(content) {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content.map((part) => {
		if (typeof part === "string") return part;
		if (part && typeof part === "object" && "text" in part) return String(part.text);
		return "";
	}).join("");
}
function parseMoves(raw, lot) {
	const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
	const body = fenced ? fenced[1] : raw;
	const start = body.indexOf("{");
	const end = body.lastIndexOf("}");
	if (start < 0 || end < start) throw new Error("unreadable");
	const parsed = JSON.parse(body.slice(start, end + 1));
	const summary = typeof parsed.summary === "string" ? parsed.summary.slice(0, 900) : "";
	const moves = [];
	if (Array.isArray(parsed.moves)) for (const move of parsed.moves.slice(0, 4)) {
		if (!move || typeof move !== "object") continue;
		const row = move;
		const plant = typeof row.plantId === "string" ? getPlant(row.plantId) : null;
		if (!plant || typeof row.xFt !== "number" || typeof row.yFt !== "number") continue;
		const margin = Math.min(plant.spreadFt / 4, 4);
		const x = Math.min(lot.widthFt - 1, Math.max(1, row.xFt));
		const y = Math.min(lot.depthFt - 1, Math.max(1, row.yFt));
		moves.push({
			plantId: plant.id,
			name: plant.name,
			xFt: Math.round(Math.min(lot.widthFt - margin, Math.max(margin, x)) * 2) / 2,
			yFt: Math.round(Math.min(lot.depthFt - margin, Math.max(margin, y)) * 2) / 2,
			note: typeof row.note === "string" ? row.note.slice(0, 180) : ""
		});
	}
	return {
		summary,
		moves
	};
}
var askPlotline_createServerFn_handler = createServerRpc({
	id: "2d8c1bc44b463c61ddabecf8b89e4e3b683684fac9ca12cc618569b9a0deb7a1",
	name: "askPlotline",
	filename: "src/lib/advise.functions.ts"
}, (opts) => askPlotline.__executeServer(opts));
var askPlotline = createServerFn({ method: "POST" }).validator(validate).handler(askPlotline_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "The written layout needs the assistant, and it is not available right now."
	};
	const place = getPlace(data.placeId);
	if (!place) return {
		ok: false,
		error: "Unknown place"
	};
	const lot = asLot(data);
	const zone = effectiveZone(lot);
	const catalog = PLANTS.filter((plant) => !climateIssues(plant, lot).some((issue) => issue.level === "no")).slice(0, 22).map((plant) => `${plant.id}|${plant.name}|${plant.sun}|${plant.heightFt}x${plant.spreadFt}ft|${plant.water}`).join("\n");
	const spots = lot.spots.map((spot) => `${spot.name} ${spot.kind} ${spot.sun} ${Math.round(spot.x)},${Math.round(spot.y)} ${Math.round(spot.w)}x${Math.round(spot.h)}`).join("\n");
	const placed = lot.placed.map((plant) => {
		const known = getPlant(plant.plantId);
		const advice = adviseAt(plant.plantId, plant.x, plant.y, lot, plant.id);
		const line = advice?.headline ?? "";
		return `${known?.name ?? plant.plantId} @${Math.round(plant.x)},${Math.round(plant.y)} ${advice?.verdict ?? ""}: ${line.slice(0, 140)}`;
	}).join("\n");
	const prompt = `You are Plotline. Say no when a plant does not belong. North is up. South of a building is sunny.
JSON only, no markdown:
{"summary":"2 to 4 sentences","moves":[{"plantId":"id","xFt":0,"yFt":0,"note":"one sentence"}]}
At most 4 moves. plantId must be copied from the catalog. Keep trunks inside the lot and off houses, patios, paths, and water. Shade plants go in shade beds. If a planted line is NO, say to pull it out and do not repeat it.
xFt yFt are feet from the northwest corner.

Lot ${lot.widthFt}x${lot.depthFt}ft. ${place.name}. Zone ${zone}. ${climateLabel(place.climate)}. Rain ${place.rainIn}in. Soil ${lot.soil}.
Spots:
${spots || "(none)"}
Planted:
${placed || "(none)"}
Catalog:
${catalog}`;
	try {
		const response = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			signal: AbortSignal.timeout(4e4),
			body: JSON.stringify({
				model: "grok-4.5",
				temperature: .2,
				max_tokens: 900,
				reasoning_effort: "low",
				messages: [{
					role: "user",
					content: prompt
				}]
			})
		});
		if (!response.ok) return {
			ok: false,
			error: `The assistant did not answer (${response.status}). The yes or no on each plant still stands.`
		};
		const parsed = parseMoves(textOf((await response.json()).choices?.[0]?.message?.content), lot);
		if (!parsed.summary) return {
			ok: false,
			error: "The layout came back empty. Try once more."
		};
		return {
			ok: true,
			summary: parsed.summary,
			moves: parsed.moves
		};
	} catch (error) {
		console.error("plotline ask failed", error);
		if (error instanceof Error && error.name === "TimeoutError") return {
			ok: false,
			error: "The layout took too long. The yes or no on each plant still stands."
		};
		return {
			ok: false,
			error: "The assistant did not answer. The yes or no on each plant still stands."
		};
	}
});
//#endregion
export { askPlotline_createServerFn_handler };
