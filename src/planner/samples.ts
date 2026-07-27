/**
 * Starter plans. They double as the documentation for the data model — every
 * feature the editor supports (openings, room naming, wall-hugging furniture,
 * outdoor items beyond the building) shows up in at least one of them.
 */

import { catalogEntry } from "./catalog";
import { detectRooms, pointInPolygon, uid } from "./geometry";
import type { Item, Opening, OpeningType, Plan, Wall } from "./types";
import { DEFAULT_SETTINGS, OPENING_DEFAULTS } from "./types";

interface OpeningSpec {
  type: OpeningType;
  t: number;
  width?: number;
  height?: number;
  sill?: number;
}

interface WallSpec {
  from: string;
  to: string;
  exterior?: boolean;
  thickness?: number;
  height?: number;
  openings?: OpeningSpec[];
}

interface ItemSpec {
  catalog: string;
  x: number;
  y: number;
  rotation?: number;
  label?: string;
  color?: string;
  elevation?: number;
  width?: number;
  depth?: number;
  height?: number;
}

interface RoomSpec {
  at: [number, number];
  name: string;
  floorColor?: string;
}

interface PlanSpec {
  id: string;
  name: string;
  settings?: Partial<Plan["settings"]>;
  points: Record<string, [number, number]>;
  walls: WallSpec[];
  items?: ItemSpec[];
  rooms?: RoomSpec[];
}

function makeOpening(spec: OpeningSpec): Opening {
  const defaults = OPENING_DEFAULTS[spec.type];
  return {
    id: uid("o"),
    type: spec.type,
    t: spec.t,
    width: spec.width ?? defaults.width,
    height: spec.height ?? defaults.height,
    sill: spec.sill ?? defaults.sill,
  };
}

function makeItem(spec: ItemSpec): Item {
  const entry = catalogEntry(spec.catalog);
  return {
    id: uid("i"),
    catalogId: entry.id,
    x: spec.x,
    y: spec.y,
    rotation: spec.rotation ?? 0,
    width: spec.width ?? entry.width,
    depth: spec.depth ?? entry.depth,
    height: spec.height ?? entry.height,
    elevation: spec.elevation ?? entry.elevation ?? 0,
    color: spec.color ?? entry.color,
    label: spec.label,
  };
}

function buildPlan(spec: PlanSpec): Plan {
  const settings = { ...DEFAULT_SETTINGS, ...spec.settings };
  const cornerIds = new Map<string, string>();
  const corners = Object.entries(spec.points).map(([key, [x, y]]) => {
    const id = uid("c");
    cornerIds.set(key, id);
    return { id, x, y };
  });

  const walls: Wall[] = spec.walls.map((w) => ({
    id: uid("w"),
    start: cornerIds.get(w.from)!,
    end: cornerIds.get(w.to)!,
    thickness: w.thickness ?? settings.wallThickness,
    height: w.height ?? settings.wallHeight,
    exterior: w.exterior,
    openings: (w.openings ?? []).map(makeOpening),
  }));

  const plan: Plan = {
    id: spec.id,
    name: spec.name,
    corners,
    walls,
    items: (spec.items ?? []).map(makeItem),
    rooms: {},
    settings,
    updatedAt: Date.now(),
  };

  // Room ids are derived from the detected loops, so names are attached by
  // pointing at a spot inside the room rather than by hardcoding an id.
  const detected = detectRooms(plan);
  for (const room of spec.rooms ?? []) {
    const match = detected.find((candidate) =>
      pointInPolygon({ x: room.at[0], y: room.at[1] }, candidate.polygon)
    );
    if (match) plan.rooms[match.id] = { name: room.name, floorColor: room.floorColor };
  }

  return plan;
}

/* ------------------------------------------------------------------ *
 * Sample 1 — a four-room family house
 * ------------------------------------------------------------------ */

const HOUSE: PlanSpec = {
  id: "sample-house",
  name: "Borrowdale family house",
  points: {
    a: [0, 0],
    b: [7, 0],
    c: [12, 0],
    d: [12, 4.5],
    e: [12, 9],
    f: [7, 9],
    g: [3.5, 9],
    h: [0, 9],
    i: [0, 6],
    j: [3.5, 6],
    k: [7, 6],
    l: [7, 4.5],
  },
  walls: [
    // Shell
    { from: "a", to: "b", exterior: true, openings: [{ type: "door", t: 0.3, width: 1.0 }, { type: "window", t: 0.72 }] },
    { from: "b", to: "c", exterior: true, openings: [{ type: "window", t: 0.5 }] },
    { from: "c", to: "d", exterior: true, openings: [{ type: "window", t: 0.5, width: 1.4 }] },
    { from: "d", to: "e", exterior: true, openings: [{ type: "window", t: 0.5, width: 1.4 }] },
    { from: "e", to: "f", exterior: true, openings: [{ type: "window", t: 0.5 }] },
    { from: "f", to: "g", exterior: true, openings: [{ type: "window", t: 0.6, width: 0.8, sill: 1.4 }] },
    { from: "g", to: "h", exterior: true, openings: [{ type: "door", t: 0.7, width: 0.9 }] },
    { from: "h", to: "i", exterior: true, openings: [{ type: "window", t: 0.5, width: 1.0 }] },
    { from: "i", to: "a", exterior: true, openings: [{ type: "window", t: 0.4, width: 1.8, height: 1.6, sill: 0.7 }] },
    // Partitions
    { from: "b", to: "l", exterior: false, openings: [{ type: "door", t: 0.72 }] },
    { from: "l", to: "k", exterior: false, openings: [{ type: "door", t: 0.5 }] },
    { from: "k", to: "f", exterior: false, openings: [] },
    { from: "l", to: "d", exterior: false, openings: [] },
    { from: "i", to: "j", exterior: false, openings: [{ type: "arch", t: 0.55, width: 1.6 }] },
    { from: "j", to: "k", exterior: false, openings: [{ type: "door", t: 0.75 }] },
    { from: "j", to: "g", exterior: false, openings: [] },
  ],
  rooms: [
    { at: [3.5, 3], name: "Living / dining", floorColor: "#c9a97e" },
    { at: [9.5, 2.2], name: "Main bedroom", floorColor: "#bb9e7d" },
    { at: [9.5, 6.7], name: "Bedroom 2", floorColor: "#bb9e7d" },
    { at: [1.7, 7.5], name: "Kitchen", floorColor: "#cfcac0" },
    { at: [5.2, 7.5], name: "Bathroom", floorColor: "#c3ccd2" },
  ],
  items: [
    // Living
    { catalog: "rug", x: 2.6, y: 2.2 },
    { catalog: "sofa-3", x: 2.6, y: 0.75 },
    { catalog: "armchair", x: 0.75, y: 2.4, rotation: 90 },
    { catalog: "coffee-table", x: 2.6, y: 2.2 },
    { catalog: "tv-unit", x: 2.6, y: 4.0, rotation: 180 },
    { catalog: "tv", x: 2.6, y: 4.05, rotation: 180, elevation: 0.55 },
    { catalog: "plant", x: 6.3, y: 0.5 },
    { catalog: "dining-table", x: 5.4, y: 3.4, rotation: 90 },
    { catalog: "dining-chair", x: 4.65, y: 2.9, rotation: 90 },
    { catalog: "dining-chair", x: 4.65, y: 3.9, rotation: 90 },
    { catalog: "dining-chair", x: 6.15, y: 2.9, rotation: 270 },
    { catalog: "dining-chair", x: 6.15, y: 3.9, rotation: 270 },
    // Kitchen
    { catalog: "kitchen-counter", x: 1.4, y: 8.6 },
    { catalog: "stove", x: 3.1, y: 8.6 },
    { catalog: "fridge", x: 0.45, y: 6.5 },
    { catalog: "island", x: 1.8, y: 7.3 },
    // Bathroom
    { catalog: "bath", x: 4.5, y: 8.55 },
    { catalog: "toilet", x: 6.6, y: 8.5 },
    { catalog: "basin", x: 6.6, y: 6.4, rotation: 180 },
    // Main bedroom
    { catalog: "bed-king", x: 9.5, y: 1.35 },
    { catalog: "nightstand", x: 8.3, y: 0.45 },
    { catalog: "nightstand", x: 10.7, y: 0.45 },
    { catalog: "wardrobe", x: 11.6, y: 3.2, rotation: 90 },
    // Bedroom 2
    { catalog: "bed-double", x: 9.3, y: 6.2 },
    { catalog: "wardrobe", x: 11.6, y: 7.9, rotation: 90 },
    { catalog: "desk", x: 7.45, y: 5.6, rotation: 90 },
    { catalog: "office-chair", x: 8.2, y: 5.6, rotation: 270 },
    // Outside
    { catalog: "tree", x: -2.5, y: 2.0 },
    { catalog: "tree", x: 15.0, y: 7.5 },
    { catalog: "car", x: -3.0, y: 7.0, rotation: 90 },
  ],
};

/* ------------------------------------------------------------------ *
 * Sample 2 — a marquee reception, laid out the way Eventive installs one
 * ------------------------------------------------------------------ */

/** A banquet round with its chairs already spaced around it. */
function banquetRound(x: number, y: number, seats = 10, radius = 1.35): ItemSpec[] {
  const specs: ItemSpec[] = [{ catalog: "banquet-round", x, y }];
  for (let i = 0; i < seats; i += 1) {
    const angle = (i / seats) * Math.PI * 2;
    specs.push({
      catalog: "banquet-chair",
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      rotation: (angle * 180) / Math.PI - 90,
    });
  }
  return specs;
}

const MARQUEE: PlanSpec = {
  id: "sample-marquee",
  name: "Garden marquee reception",
  settings: { wallHeight: 3.2, wallThickness: 0.12, gridSize: 0.5 },
  points: {
    a: [0, 0],
    b: [24, 0],
    c: [24, 14],
    d: [0, 14],
  },
  walls: [
    { from: "a", to: "b", exterior: true },
    {
      from: "b",
      to: "c",
      exterior: true,
      openings: [{ type: "arch", t: 0.5, width: 4.0, height: 3.0 }],
    },
    {
      from: "c",
      to: "d",
      exterior: true,
      openings: [
        { type: "arch", t: 0.3, width: 3.0, height: 3.0 },
        { type: "arch", t: 0.7, width: 3.0, height: 3.0 },
      ],
    },
    {
      from: "d",
      to: "a",
      exterior: true,
      openings: [{ type: "arch", t: 0.5, width: 4.0, height: 3.0 }],
    },
  ],
  rooms: [{ at: [12, 7], name: "Marquee floor", floorColor: "#d9cdb8" }],
  items: [
    // Stage and production
    { catalog: "stage-deck", x: 10, y: 1.1 },
    { catalog: "stage-deck", x: 12, y: 1.1 },
    { catalog: "stage-deck", x: 14, y: 1.1 },
    { catalog: "backdrop", x: 12, y: 0.5, label: "Ceremony backdrop" },
    { catalog: "speaker", x: 8.4, y: 1.1 },
    { catalog: "speaker", x: 15.6, y: 1.1 },
    { catalog: "dj-booth", x: 18.5, y: 1.2 },
    // Floor
    { catalog: "dance-floor", x: 12, y: 6.0 },
    // Guest tables
    ...banquetRound(3.6, 4.2),
    ...banquetRound(3.6, 8.4),
    ...banquetRound(3.6, 12.0),
    ...banquetRound(7.6, 10.6),
    ...banquetRound(20.4, 4.2),
    ...banquetRound(20.4, 8.4),
    ...banquetRound(20.4, 12.0),
    ...banquetRound(16.4, 10.6),
    ...banquetRound(12.0, 11.8),
    // Service
    { catalog: "bar-counter", x: 22.6, y: 1.6, rotation: 90 },
    { catalog: "buffet-line", x: 8.0, y: 13.4 },
    { catalog: "buffet-line", x: 16.0, y: 13.4 },
    { catalog: "cocktail-table", x: 22.0, y: 5.5 },
    { catalog: "cocktail-table", x: 22.0, y: 7.5 },
    { catalog: "lectern", x: 15.0, y: 2.6 },
    // Structure
    { catalog: "marquee-pole", x: 6.0, y: 3.5 },
    { catalog: "marquee-pole", x: 18.0, y: 3.5 },
    { catalog: "marquee-pole", x: 6.0, y: 10.5 },
    { catalog: "marquee-pole", x: 18.0, y: 10.5 },
    // Grounds
    { catalog: "tree", x: -4.0, y: 3.0 },
    { catalog: "tree", x: -4.5, y: 11.0 },
    { catalog: "tree", x: 28.0, y: 7.0 },
    { catalog: "car", x: -6.0, y: 17.0 },
    { catalog: "car", x: -3.0, y: 17.0 },
    { catalog: "car", x: 0, y: 17.0 },
  ],
};

/* ------------------------------------------------------------------ *
 * Sample 3 — a bare site to start from
 * ------------------------------------------------------------------ */

const BLANK: PlanSpec = {
  id: "sample-blank",
  name: "New property",
  points: { a: [0, 0], b: [10, 0], c: [10, 8], d: [0, 8] },
  walls: [
    { from: "a", to: "b", exterior: true, openings: [{ type: "door", t: 0.5 }] },
    { from: "b", to: "c", exterior: true, openings: [{ type: "window", t: 0.5 }] },
    { from: "c", to: "d", exterior: true, openings: [{ type: "window", t: 0.5 }] },
    { from: "d", to: "a", exterior: true, openings: [{ type: "window", t: 0.5 }] },
  ],
  rooms: [{ at: [5, 4], name: "Room" }],
};

export interface SampleDefinition {
  id: string;
  name: string;
  blurb: string;
  create: () => Plan;
}

export const SAMPLES: SampleDefinition[] = [
  {
    id: "house",
    name: "Family house",
    blurb: "Four rooms, 108 m² — a worked example of walls, doors and furnishing.",
    create: () => buildPlan(HOUSE),
  },
  {
    id: "marquee",
    name: "Marquee reception",
    blurb: "24 × 14 m marquee: stage, dance floor, nine rounds of ten.",
    create: () => buildPlan(MARQUEE),
  },
  {
    id: "blank",
    name: "Empty shell",
    blurb: "One 10 × 8 m room to build out from scratch.",
    create: () => buildPlan(BLANK),
  },
];

export function createSample(id: string): Plan {
  const sample = SAMPLES.find((s) => s.id === id) ?? SAMPLES[0];
  return sample.create();
}
