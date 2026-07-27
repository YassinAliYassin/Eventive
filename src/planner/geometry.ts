/**
 * Geometry helpers for the planner: vector maths, snapping, and the room
 * detection that turns the wall graph into closed floor polygons.
 */

import type { Corner, Item, Opening, Plan, Units, Wall } from "./types";

export interface Point {
  x: number;
  y: number;
}

export interface Room {
  /** Stable across edits as long as the loop keeps the same corners. */
  id: string;
  cornerIds: string[];
  polygon: Point[];
  area: number;
  centroid: Point;
}

let idCounter = 0;
export function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

/* ------------------------------------------------------------------ *
 * Vectors
 * ------------------------------------------------------------------ */

export const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
export const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
export const scale = (a: Point, k: number): Point => ({ x: a.x * k, y: a.y * k });
export const len = (a: Point): number => Math.hypot(a.x, a.y);
export const dist = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

export function normalize(a: Point): Point {
  const l = len(a);
  return l < 1e-9 ? { x: 0, y: 0 } : { x: a.x / l, y: a.y / l };
}

/** Left-hand normal in screen space (x right, y down). */
export const normal = (a: Point): Point => ({ x: -a.y, y: a.x });

export const degrees = (rad: number): number => (rad * 180) / Math.PI;
/** Wraps any angle into 0..360. */
export const normalizeAngle = (deg: number): number => ((deg % 360) + 360) % 360;
export const radians = (deg: number): number => (deg * Math.PI) / 180;

/* ------------------------------------------------------------------ *
 * Snapping
 * ------------------------------------------------------------------ */

export function snapToGrid(p: Point, grid: number): Point {
  if (grid <= 0) return p;
  return { x: Math.round(p.x / grid) * grid, y: Math.round(p.y / grid) * grid };
}

/** Snaps `to` onto the nearest ray from `from` at a multiple of stepDeg. */
export function snapAngle(from: Point, to: Point, stepDeg = 15): Point {
  const d = sub(to, from);
  const l = len(d);
  if (l < 1e-6) return to;
  const step = radians(stepDeg);
  const angle = Math.round(Math.atan2(d.y, d.x) / step) * step;
  return { x: from.x + Math.cos(angle) * l, y: from.y + Math.sin(angle) * l };
}

/* ------------------------------------------------------------------ *
 * Walls
 * ------------------------------------------------------------------ */

export function cornerMap(plan: Plan): Map<string, Corner> {
  return new Map(plan.corners.map((c) => [c.id, c]));
}

export function wallEnds(
  wall: Wall,
  corners: Map<string, Corner>
): { a: Point; b: Point } | null {
  const a = corners.get(wall.start);
  const b = corners.get(wall.end);
  if (!a || !b) return null;
  return { a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y } };
}

export function wallLength(wall: Wall, corners: Map<string, Corner>): number {
  const ends = wallEnds(wall, corners);
  return ends ? dist(ends.a, ends.b) : 0;
}

/** Angle of the wall in degrees, clockwise from +X. */
export function wallAngle(wall: Wall, corners: Map<string, Corner>): number {
  const ends = wallEnds(wall, corners);
  if (!ends) return 0;
  return degrees(Math.atan2(ends.b.y - ends.a.y, ends.b.x - ends.a.x));
}

/** Point at parameter t (0..1) along the wall centreline. */
export function pointAlongWall(
  wall: Wall,
  corners: Map<string, Corner>,
  t: number
): Point {
  const ends = wallEnds(wall, corners);
  if (!ends) return { x: 0, y: 0 };
  return { x: ends.a.x + (ends.b.x - ends.a.x) * t, y: ends.a.y + (ends.b.y - ends.a.y) * t };
}

export interface Projection {
  /** Clamped 0..1 position along the wall. */
  t: number;
  point: Point;
  /** Perpendicular distance from the query point to the wall centreline. */
  distance: number;
}

export function projectOnWall(
  p: Point,
  wall: Wall,
  corners: Map<string, Corner>
): Projection | null {
  const ends = wallEnds(wall, corners);
  if (!ends) return null;
  const d = sub(ends.b, ends.a);
  const l2 = d.x * d.x + d.y * d.y;
  if (l2 < 1e-9) return { t: 0, point: ends.a, distance: dist(p, ends.a) };
  let t = ((p.x - ends.a.x) * d.x + (p.y - ends.a.y) * d.y) / l2;
  t = Math.max(0, Math.min(1, t));
  const point = { x: ends.a.x + d.x * t, y: ends.a.y + d.y * t };
  return { t, point, distance: dist(p, point) };
}

/**
 * The four plan-space corners of a wall drawn with its thickness. Ends are
 * extended by half the thickness so that perpendicular joins fill in cleanly —
 * the same cheap mitre trick blueprint3d uses.
 */
export function wallQuad(wall: Wall, corners: Map<string, Corner>): Point[] {
  const ends = wallEnds(wall, corners);
  if (!ends) return [];
  const dir = normalize(sub(ends.b, ends.a));
  const half = wall.thickness / 2;
  const n = scale(normal(dir), half);
  const a = sub(ends.a, scale(dir, half));
  const b = add(ends.b, scale(dir, half));
  return [add(a, n), add(b, n), sub(b, n), sub(a, n)];
}

/* ------------------------------------------------------------------ *
 * Polygons
 * ------------------------------------------------------------------ */

export function polygonArea(points: Point[]): number {
  return Math.abs(signedArea(points));
}

export function signedArea(points: Point[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return sum / 2;
}

export function centroid(points: Point[]): Point {
  const a = signedArea(points);
  if (Math.abs(a) < 1e-9) {
    const n = points.length || 1;
    return {
      x: points.reduce((s, p) => s + p.x, 0) / n,
      y: points.reduce((s, p) => s + p.y, 0) / n,
    };
  }
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    const cross = p.x * q.y - q.x * p.y;
    cx += (p.x + q.x) * cross;
    cy += (p.y + q.y) * cross;
  }
  return { x: cx / (6 * a), y: cy / (6 * a) };
}

export function pointInPolygon(p: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    const intersects =
      a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

/* ------------------------------------------------------------------ *
 * Room detection
 * ------------------------------------------------------------------ */

export function roomId(cornerIds: string[]): string {
  return [...cornerIds].sort().join("|");
}

/**
 * Finds the enclosed faces of the wall graph.
 *
 * Standard planar-graph face traversal: walk every directed edge, and at each
 * node take the neighbour with the smallest counter-clockwise turn from the
 * edge you arrived on. Every face of the graph is produced exactly once. The
 * outer boundary of each connected component comes out with the opposite
 * winding to the interior faces, so it is dropped by sign; dangling walls trace
 * out and back and collapse to (near) zero area, so they drop by size.
 */
export function detectRooms(plan: Plan): Room[] {
  const corners = cornerMap(plan);
  const neighbours = new Map<string, string[]>();

  for (const wall of plan.walls) {
    if (!corners.has(wall.start) || !corners.has(wall.end) || wall.start === wall.end) continue;
    if (!neighbours.has(wall.start)) neighbours.set(wall.start, []);
    if (!neighbours.has(wall.end)) neighbours.set(wall.end, []);
    const fromStart = neighbours.get(wall.start)!;
    const fromEnd = neighbours.get(wall.end)!;
    if (!fromStart.includes(wall.end)) fromStart.push(wall.end);
    if (!fromEnd.includes(wall.start)) fromEnd.push(wall.start);
  }

  const angleBetween = (from: string, to: string): number => {
    const a = corners.get(from)!;
    const b = corners.get(to)!;
    return Math.atan2(b.y - a.y, b.x - a.x);
  };

  const nextEdge = (prev: string, current: string): string | null => {
    const options = neighbours.get(current) ?? [];
    if (options.length === 0) return null;
    if (options.length === 1) return options[0]; // dead end: turn back
    const back = angleBetween(current, prev);
    let best: string | null = null;
    let bestDelta = Infinity;
    for (const next of options) {
      if (next === prev) continue;
      let delta = angleBetween(current, next) - back;
      while (delta <= 0) delta += Math.PI * 2;
      while (delta > Math.PI * 2) delta -= Math.PI * 2;
      if (delta < bestDelta) {
        bestDelta = delta;
        best = next;
      }
    }
    return best ?? prev;
  };

  const visited = new Set<string>();
  const rooms: Room[] = [];
  const seenRoomIds = new Set<string>();

  for (const [start, adj] of neighbours) {
    for (const first of adj) {
      const seed = `${start}->${first}`;
      if (visited.has(seed)) continue;

      const loop: string[] = [start];
      let prev = start;
      let current = first;
      let guard = 0;

      while (guard < 1000) {
        guard += 1;
        visited.add(`${prev}->${current}`);
        if (current === start) break;
        loop.push(current);
        const next = nextEdge(prev, current);
        if (!next) break;
        prev = current;
        current = next;
      }

      if (current !== start || loop.length < 3) continue;

      const polygon = loop.map((id) => {
        const c = corners.get(id)!;
        return { x: c.x, y: c.y };
      });
      const area = signedArea(polygon);
      // Screen space is y-down, so interior faces come out negative here.
      if (area >= 0 || Math.abs(area) < 0.4) continue;

      const id = roomId(loop);
      if (seenRoomIds.has(id)) continue;
      seenRoomIds.add(id);

      rooms.push({
        id,
        cornerIds: loop,
        polygon,
        area: Math.abs(area),
        centroid: centroid(polygon),
      });
    }
  }

  return rooms.sort((a, b) => b.area - a.area);
}

/* ------------------------------------------------------------------ *
 * Hit testing
 * ------------------------------------------------------------------ */

export function itemCorners(item: Item): Point[] {
  const rad = radians(item.rotation);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw = item.width / 2;
  const hd = item.depth / 2;
  return [
    { x: -hw, y: -hd },
    { x: hw, y: -hd },
    { x: hw, y: hd },
    { x: -hw, y: hd },
  ].map((p) => ({
    x: item.x + p.x * cos - p.y * sin,
    y: item.y + p.x * sin + p.y * cos,
  }));
}

export function hitItem(p: Point, item: Item): boolean {
  return pointInPolygon(p, itemCorners(item));
}

/* ------------------------------------------------------------------ *
 * Units
 * ------------------------------------------------------------------ */

const M_TO_FT = 3.280839895;

export function formatLength(metres: number, units: Units): string {
  if (units === "ft") {
    const totalInches = metres * M_TO_FT * 12;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches - feet * 12);
    if (inches === 12) return `${feet + 1}′0″`;
    return `${feet}′${inches}″`;
  }
  return metres >= 10 ? `${metres.toFixed(1)} m` : `${metres.toFixed(2)} m`;
}

export function formatArea(squareMetres: number, units: Units): string {
  if (units === "ft") return `${Math.round(squareMetres * M_TO_FT * M_TO_FT)} ft²`;
  return `${squareMetres.toFixed(1)} m²`;
}

/* ------------------------------------------------------------------ *
 * Openings
 * ------------------------------------------------------------------ */

/** Opening extents as distances along the wall, clamped to the wall length. */
export function openingSpan(
  opening: Opening,
  wallLen: number
): { start: number; end: number } {
  const half = opening.width / 2;
  const centre = Math.max(half, Math.min(wallLen - half, opening.t * wallLen));
  return { start: Math.max(0, centre - half), end: Math.min(wallLen, centre + half) };
}
