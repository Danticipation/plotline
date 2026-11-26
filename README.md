# Plotline

Measured landscape plans. Draw a lot, drop plants at their real mature size, and get a straight **yes**, **marginal**, or **no** for that climate and that spot.

The plan is a top-down drawing, north up. Circles are mature spread, not nursery pots, so a tree that will hit the eaves or the property line shows up before anyone digs.

## What you can do

- Set a lot by name, size (feet or meters), soil, and city. Location can come from the browser and snaps to the nearest catalog city.
- Start from a typical house, beds, and lawn, or draw your own.
- Draw **beds**, **lawn**, **patio**, **path**, **water**, and the **house**. Drag to move them. North of a house is treated as shade.
- Browse about 40 plants (trees, evergreens, shrubs, flowers, grasses, groundcovers, edibles). The rail is sorted by whether they belong in this climate.
- Tap a plant to drop it in the best open spot, or drag it onto the plan. Positions snap to half a foot.
- Open the **View** to see the same planting as an elevation. The camera, if you allow it, sits behind that drawing so you can stand in the yard and compare.
- **Ask Plotline** for a short written layout and up to four suggested placements. The instant yes/no does not depend on that.

Plans stay in this browser under the `plotline.v1` key. There is no account and no server copy of the lot.

## How a verdict is decided

Each plant has a USDA zone range, a sun preference, a water need, a mature height and spread, and climate notes (`avoid` is a hard no, `caution` is marginal). The lot has a city (climate, rainfall, default zone), an optional zone override, and a soil.

A placement is refused or marked marginal when, among other checks:

- the climate or zone is wrong for the species
- the spot’s sun does not match what the plant wants (full sun, part shade, or shade; a band just north of a house counts as shade)
- the trunk is on a house, patio, path, or water
- the mature canopy does not fit the lot, crosses the property line, or sits too close to a building or another woody plant
- a dry plant and a thirsty plant share a bed, or a low-water plant is asked to live in clay (or a thirsty one in sand)

The inspector states the reason in one sentence. The catalog and the rules live in code, not in a model: [`src/lib/plants.ts`](src/lib/plants.ts), [`src/lib/climate.ts`](src/lib/climate.ts), and [`src/lib/advice.ts`](src/lib/advice.ts).

## Ask

**Ask** sends the current lot (place, zone, soil, spots, and what is already planted) to the xAI API and returns a short summary plus at most four moves. Suggested plants are limited to ones the climate rules do not already refuse. The model is `grok-4.5`.

This needs `XAI_API_KEY` in the server environment. Without it, Ask says the assistant is unavailable. The yes / marginal / no under each plant still works.

## Cities and plants

Thirty-one cities, weighted toward the West but including desert, humid, continental, and tropical climates. Adding a city is a row in `PLACES`. Adding a plant is a row in `PLANTS` with zone bounds, sun, water, size, and any climate to avoid.

## Stack

- [React 19](https://react.dev/) and [TanStack Start](https://tanstack.com/start) (file routes, Vite)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand) with `persist` for the lot
- Canvas for the plan ([`src/lib/plan-draw.ts`](src/lib/plan-draw.ts)) and the elevation ([`src/lib/elevation.ts`](src/lib/elevation.ts))

## Develop

Node 22.

```bash
npm install
npm run dev
```

The dev server listens on port **8080**.

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build, then database migrations if a database is configured |
| `npm run plants:import` | Validate `data/plants.v1.json` and regenerate `src/lib/plants.generated.ts` |
| `npm run typecheck` | Regenerates the plant catalog, then `tsc --noEmit` |
| `npm test` | Script and library tests |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build |

Plant rows live in `data/plants.v1.json`. Edit that file and run `npm run plants:import` (or `npm run typecheck`, which imports first). Do not hand-edit `src/lib/plants.generated.ts`. Optional climate tags expand into avoid/caution; an explicit note on the row wins.

The planner does not require a database. Auth and Postgres wiring in `src/lib` is unused by the lot itself.

### Layout

```text
src/routes/            app shell and the home route
src/components/        studio, plan canvas, plant rail, inspector, setup, ask, view
src/lib/plants.ts      catalog API (`getPlant`, labels); the list is generated
data/plants.v1.json    plant catalog source of truth
src/lib/climate.ts     cities, zones, climate labels
src/lib/advice.ts      yes / marginal / no
src/lib/advise.functions.ts   Ask (server)
src/lib/store.ts       lot state, localStorage key plotline.v1
src/lib/plan-draw.ts   top-down drawing
src/lib/elevation.ts   standing view
```

## Deploy

The production target is Vercel. Set `XAI_API_KEY` only if you want Ask. Do not put that key in a `VITE_` variable. It must stay on the server.
