# eventive

Upcoming Zim events company — marketing site plus **Property Studio**, a
browser-based floor-plan and 3D property tool.

## Running it

```bash
npm install
npm run dev          # vite dev server
npm run build        # client bundle + bundled express server
npm start            # serve the build
npm run type-check   # tsc --noEmit
npm run lint
```

The marketing site is at `/`; Property Studio is at `/studio` (three.js is
lazy-loaded, so it never ships with the marketing bundle).

## Property Studio

A floor-plan editor with a live 3D model beside it — draw the property, furnish
it, then orbit it, drop the walls for a dollhouse view, or walk it at eye height.

### The model

The plan is a **graph, not a set of shapes**: corners are nodes, walls are edges
between them, and rooms are never stored — they are the enclosed faces of that
graph, found by planar face traversal on every edit. Move one corner and every
wall, room, floor area and 3D surface attached to it follows. This is the
approach proven by [blueprint3d](https://github.com/furnishup/blueprint3d),
[react-planner](https://github.com/cvdlab/react-planner) and
[Sweet Home 3D](http://www.sweethome3d.com/) — the two-pane "plan on the left,
model on the right" layout comes from the same lineage.

| File | Role |
| --- | --- |
| `src/planner/types.ts` | Plan, walls, openings, items, settings |
| `src/planner/geometry.ts` | Vector maths, snapping, room (face) detection |
| `src/planner/operations.ts` | Pure plan transforms — every edit goes through one |
| `src/planner/store.ts` | Undo/redo stack, autosave, import sanitising |
| `src/planner/draw2d.ts`, `Plan2D.tsx` | Canvas plan view and its gestures |
| `src/planner/scene3d.ts`, `items3d.ts`, `View3D.tsx` | three.js scene, furniture meshes, React wrapper |
| `src/planner/catalog.ts` | Furnishings, house and event, at real dimensions |
| `src/planner/metrics.ts` | Areas, wall runs, seats and standing capacity |
| `src/planner/samples.ts` | Starter plans |

### What it does

- **Draw** walls point by point (grid and 15° angle snapping), or drag out a
  rectangular room. Drop a corner onto another to weld them together.
- **Cut openings** — doors, double doors, windows, arches — by clicking a wall.
  They slide along it, and the 3D model gets the hole, frame, glazing and a door
  leaf hung open.
- **Furnish** from a catalogue of house and event pieces at true sizes: banquet
  rounds, stage decks, dance floors, bar counters, beds, baths, trees, cars.
- **Edit anywhere** — select a wall, room, opening or item in either view and
  change it in the inspector; drag furniture directly in the 3D view.
- **Read the numbers** — wall lengths, room areas and totals update as you draw,
  in metres or feet and inches. Type an exact length onto a wall and its far
  corner slides to suit, carrying everything attached to it.
- **Size the event** — for layouts using event kit, the inspector reports seats
  actually placed, table count, dance floor area and standing capacity at
  1.2 m² a guest.
- **Undo/redo** the whole history, with autosave to the browser.
- **Export** the plan as PNG, the 3D view as a render, or the editable plan as
  JSON (which imports back).

### Keyboard

`V` select · `W` walls · `R` room · `D` door · `N` window · `F` furnishings ·
`H` pan · `Ctrl+Z` / `Ctrl+Shift+Z` undo/redo · `Delete` removes the selection ·
arrows nudge · `R` rotates a selected item · hold `Alt` to ignore the grid ·
`Esc` cancels.

The walkthrough collides with walls and passes through doorways and arches, so
a client sees the space the way they will actually move through it.

### Known limits

- Single storey — no floor levels or roofs.
- Furniture does not block the walkthrough, only walls do.
- Rooms must be closed loops; a half-drawn wall has no floor until it joins up.
