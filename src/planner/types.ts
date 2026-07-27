/**
 * Core data model for the property planner.
 *
 * The structure follows the approach proven by open-source floor planners
 * (blueprint3d, react-planner, Sweet Home 3D): the plan is a *graph*, not a
 * list of shapes. Corners are nodes, walls are edges between them, and rooms
 * are not stored at all — they are detected as the closed faces of that graph
 * (see geometry.ts). Moving one corner therefore drags every wall and room
 * attached to it, which is what makes editing feel architectural instead of
 * like dragging rectangles around.
 *
 * All lengths are metres. Angles are degrees, clockwise, 0 = +X axis.
 * Plan space is x → right, y → down (screen-like), and maps to the 3D scene as
 * (x, y) → (x, z) with y-up for height.
 */

export interface Corner {
  id: string;
  x: number;
  y: number;
}

export type OpeningType = "door" | "double-door" | "window" | "arch";

export interface Opening {
  id: string;
  type: OpeningType;
  /** Centre of the opening along the wall, 0..1 from wall.start to wall.end. */
  t: number;
  width: number;
  height: number;
  /** Height of the opening's bottom edge above the floor. Doors are 0. */
  sill: number;
}

/** Sensible real-world sizes used whenever an opening is created. */
export const OPENING_DEFAULTS: Record<OpeningType, { width: number; height: number; sill: number }> = {
  door: { width: 0.9, height: 2.1, sill: 0 },
  "double-door": { width: 1.6, height: 2.1, sill: 0 },
  window: { width: 1.2, height: 1.3, sill: 0.9 },
  arch: { width: 1.8, height: 2.3, sill: 0 },
};

export const OPENING_LABELS: Record<OpeningType, string> = {
  door: "Door",
  "double-door": "Double door",
  window: "Window",
  arch: "Opening",
};

export interface Wall {
  id: string;
  start: string;
  end: string;
  thickness: number;
  height: number;
  openings: Opening[];
  /** Interior walls render lighter in 3D and are excluded from the shell. */
  exterior?: boolean;
}

export interface Item {
  id: string;
  catalogId: string;
  /** Centre point in plan space. */
  x: number;
  y: number;
  /** Rotation in degrees, clockwise in plan view. */
  rotation: number;
  width: number;
  depth: number;
  height: number;
  /** Height of the item's base above the floor — for wall-mounted things. */
  elevation: number;
  color: string;
  label?: string;
}

export interface RoomStyle {
  name?: string;
  floorColor?: string;
}

export type Units = "m" | "ft";

export interface PlanSettings {
  wallHeight: number;
  wallThickness: number;
  /** Grid/snap spacing in metres. */
  gridSize: number;
  units: Units;
}

export interface Plan {
  id: string;
  name: string;
  corners: Corner[];
  walls: Wall[];
  items: Item[];
  /** Keyed by the derived room id (see geometry.roomId). */
  rooms: Record<string, RoomStyle>;
  settings: PlanSettings;
  updatedAt: number;
}

/** Editor tools. `pan` is also reachable with middle/right-drag at any time. */
export type Tool = "select" | "pan" | "wall" | "room" | "door" | "window" | "arch" | "item";

export type SelectionKind = "corner" | "wall" | "item" | "room" | "opening";

export interface Selection {
  kind: SelectionKind;
  id: string;
  /** For openings: the wall that owns it. */
  parentId?: string;
}

export const DEFAULT_SETTINGS: PlanSettings = {
  wallHeight: 2.7,
  wallThickness: 0.2,
  gridSize: 0.25,
  units: "m",
};
