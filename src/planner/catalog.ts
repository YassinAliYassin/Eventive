/**
 * The furnishing catalogue. Each entry carries a real-world default footprint
 * (metres) and a `shape` telling the 3D renderer which primitive assembly to
 * build — deliberately geometry-only, so the tool ships with no asset pipeline
 * and nothing to download.
 */

export type ItemShape =
  | "box"
  | "cylinder"
  | "round-table"
  | "chair"
  | "sofa"
  | "bed"
  | "plant"
  | "rug"
  | "counter"
  | "screen"
  | "stage"
  | "toilet"
  | "bath"
  | "car"
  | "tree"
  | "speaker"
  | "arch";

export interface CatalogEntry {
  id: string;
  name: string;
  category: string;
  width: number;
  depth: number;
  height: number;
  color: string;
  shape: ItemShape;
  /** Wall-mounted pieces sit at this elevation and hug the nearest wall. */
  elevation?: number;
}

export const CATEGORIES = [
  "Living",
  "Dining & kitchen",
  "Bedroom",
  "Bathroom",
  "Workspace",
  "Event",
  "Outdoor",
] as const;

export const CATALOG: CatalogEntry[] = [
  // Living
  { id: "sofa-3", name: "Sofa (3 seat)", category: "Living", width: 2.1, depth: 0.9, height: 0.8, color: "#8ea3bd", shape: "sofa" },
  { id: "sofa-2", name: "Loveseat", category: "Living", width: 1.5, depth: 0.9, height: 0.8, color: "#8ea3bd", shape: "sofa" },
  { id: "armchair", name: "Armchair", category: "Living", width: 0.85, depth: 0.85, height: 0.8, color: "#b2856f", shape: "sofa" },
  { id: "coffee-table", name: "Coffee table", category: "Living", width: 1.1, depth: 0.6, height: 0.42, color: "#a8794f", shape: "box" },
  { id: "tv-unit", name: "TV unit", category: "Living", width: 1.8, depth: 0.45, height: 0.5, color: "#6f6a63", shape: "counter" },
  { id: "tv", name: "Television", category: "Living", width: 1.3, depth: 0.08, height: 0.75, color: "#1b1f26", shape: "screen", elevation: 0.9 },
  { id: "rug", name: "Rug", category: "Living", width: 2.4, depth: 1.6, height: 0.02, color: "#c8b49a", shape: "rug" },
  { id: "plant", name: "Potted plant", category: "Living", width: 0.6, depth: 0.6, height: 1.3, color: "#4f7d52", shape: "plant" },
  { id: "bookshelf", name: "Bookshelf", category: "Living", width: 1.0, depth: 0.35, height: 1.9, color: "#8a6a49", shape: "box" },

  // Dining & kitchen
  { id: "dining-table", name: "Dining table", category: "Dining & kitchen", width: 1.8, depth: 0.9, height: 0.75, color: "#a8794f", shape: "box" },
  { id: "dining-chair", name: "Dining chair", category: "Dining & kitchen", width: 0.45, depth: 0.5, height: 0.9, color: "#8a6a49", shape: "chair" },
  { id: "kitchen-counter", name: "Kitchen counter", category: "Dining & kitchen", width: 2.4, depth: 0.6, height: 0.9, color: "#d8d3cb", shape: "counter" },
  { id: "island", name: "Kitchen island", category: "Dining & kitchen", width: 1.8, depth: 0.9, height: 0.92, color: "#d8d3cb", shape: "counter" },
  { id: "fridge", name: "Fridge", category: "Dining & kitchen", width: 0.75, depth: 0.7, height: 1.8, color: "#c3c8ce", shape: "box" },
  { id: "stove", name: "Stove", category: "Dining & kitchen", width: 0.6, depth: 0.62, height: 0.9, color: "#3a3f47", shape: "counter" },
  { id: "sink", name: "Sink", category: "Dining & kitchen", width: 0.8, depth: 0.6, height: 0.9, color: "#b9c0c7", shape: "counter" },

  // Bedroom
  { id: "bed-double", name: "Double bed", category: "Bedroom", width: 1.6, depth: 2.0, height: 0.55, color: "#c9d3e2", shape: "bed" },
  { id: "bed-king", name: "King bed", category: "Bedroom", width: 1.9, depth: 2.1, height: 0.55, color: "#c9d3e2", shape: "bed" },
  { id: "bed-single", name: "Single bed", category: "Bedroom", width: 0.95, depth: 1.95, height: 0.5, color: "#c9d3e2", shape: "bed" },
  { id: "wardrobe", name: "Wardrobe", category: "Bedroom", width: 1.6, depth: 0.6, height: 2.1, color: "#9d7c58", shape: "box" },
  { id: "nightstand", name: "Nightstand", category: "Bedroom", width: 0.45, depth: 0.4, height: 0.55, color: "#9d7c58", shape: "box" },
  { id: "dresser", name: "Dresser", category: "Bedroom", width: 1.2, depth: 0.5, height: 0.85, color: "#9d7c58", shape: "box" },

  // Bathroom
  { id: "toilet", name: "Toilet", category: "Bathroom", width: 0.4, depth: 0.7, height: 0.78, color: "#f1f2f3", shape: "toilet" },
  { id: "bath", name: "Bathtub", category: "Bathroom", width: 1.7, depth: 0.75, height: 0.55, color: "#f1f2f3", shape: "bath" },
  { id: "shower", name: "Shower", category: "Bathroom", width: 0.9, depth: 0.9, height: 2.0, color: "#cfe0e8", shape: "box" },
  { id: "basin", name: "Basin", category: "Bathroom", width: 0.6, depth: 0.45, height: 0.85, color: "#f1f2f3", shape: "counter" },

  // Workspace
  { id: "desk", name: "Desk", category: "Workspace", width: 1.4, depth: 0.7, height: 0.75, color: "#a8794f", shape: "box" },
  { id: "office-chair", name: "Office chair", category: "Workspace", width: 0.6, depth: 0.6, height: 1.0, color: "#3a3f47", shape: "chair" },
  { id: "boardroom-table", name: "Boardroom table", category: "Workspace", width: 3.6, depth: 1.2, height: 0.75, color: "#6b4f35", shape: "box" },
  { id: "filing", name: "Filing cabinet", category: "Workspace", width: 0.5, depth: 0.6, height: 1.3, color: "#8d949c", shape: "box" },

  // Event — the pieces Eventive actually installs on site
  { id: "banquet-round", name: "Banquet round (10 pax)", category: "Event", width: 1.8, depth: 1.8, height: 0.75, color: "#f0ece4", shape: "round-table" },
  { id: "cocktail-table", name: "Cocktail table", category: "Event", width: 0.8, depth: 0.8, height: 1.1, color: "#f0ece4", shape: "round-table" },
  { id: "trestle-table", name: "Trestle table", category: "Event", width: 1.8, depth: 0.75, height: 0.75, color: "#f0ece4", shape: "box" },
  { id: "banquet-chair", name: "Banquet chair", category: "Event", width: 0.45, depth: 0.45, height: 0.92, color: "#c9a961", shape: "chair" },
  { id: "stage-deck", name: "Stage deck (2×1)", category: "Event", width: 2.0, depth: 1.0, height: 0.6, color: "#2b3644", shape: "stage" },
  { id: "dance-floor", name: "Dance floor (6×6)", category: "Event", width: 6.0, depth: 6.0, height: 0.04, color: "#d9c9a8", shape: "rug" },
  { id: "bar-counter", name: "Bar counter", category: "Event", width: 2.4, depth: 0.7, height: 1.1, color: "#5a4632", shape: "counter" },
  { id: "buffet-line", name: "Buffet line", category: "Event", width: 3.0, depth: 0.8, height: 0.9, color: "#b9b0a2", shape: "counter" },
  { id: "dj-booth", name: "DJ booth", category: "Event", width: 1.8, depth: 0.8, height: 1.1, color: "#1f2530", shape: "counter" },
  { id: "speaker", name: "Speaker stack", category: "Event", width: 0.55, depth: 0.5, height: 1.9, color: "#15181d", shape: "speaker" },
  { id: "lectern", name: "Lectern", category: "Event", width: 0.6, depth: 0.5, height: 1.2, color: "#6b4f35", shape: "box" },
  { id: "backdrop", name: "Ceremony arch", category: "Event", width: 2.2, depth: 0.4, height: 2.6, color: "#e6ddcd", shape: "arch" },
  { id: "marquee-pole", name: "Marquee pole", category: "Event", width: 0.2, depth: 0.2, height: 3.2, color: "#8d949c", shape: "cylinder" },

  // Outdoor
  { id: "tree", name: "Tree", category: "Outdoor", width: 3.0, depth: 3.0, height: 5.0, color: "#4a7a4e", shape: "tree" },
  { id: "shrub", name: "Shrub", category: "Outdoor", width: 1.0, depth: 1.0, height: 0.8, color: "#5f8a55", shape: "plant" },
  { id: "car", name: "Parked car", category: "Outdoor", width: 1.8, depth: 4.4, height: 1.45, color: "#5b6470", shape: "car" },
  { id: "pool", name: "Pool", category: "Outdoor", width: 8.0, depth: 4.0, height: 0.05, color: "#5aa7c4", shape: "rug" },
  { id: "patio-set", name: "Patio table", category: "Outdoor", width: 1.4, depth: 1.4, height: 0.75, color: "#9aa3ac", shape: "round-table" },
];

export const CATALOG_BY_ID = new Map(CATALOG.map((entry) => [entry.id, entry]));

export function catalogEntry(id: string): CatalogEntry {
  return CATALOG_BY_ID.get(id) ?? CATALOG[0];
}
