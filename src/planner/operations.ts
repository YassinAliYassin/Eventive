/**
 * Pure plan transforms. Every editing gesture in the UI ends up calling one of
 * these, which keeps undo/redo trivial: the store only has to remember the
 * plans these functions return.
 */

import { dist, projectOnWall, uid, cornerMap } from "./geometry";
import type { Point } from "./geometry";
import type { Corner, Item, Opening, Plan, Wall } from "./types";

/** Corners closer than this to a click are reused instead of duplicated. */
export const CORNER_MERGE_DISTANCE = 0.18;

function touch(plan: Plan): Plan {
  return { ...plan, updatedAt: Date.now() };
}

export function findCornerNear(plan: Plan, point: Point, radius = CORNER_MERGE_DISTANCE): Corner | null {
  let best: Corner | null = null;
  let bestDist = radius;
  for (const corner of plan.corners) {
    const d = dist(corner, point);
    if (d <= bestDist) {
      bestDist = d;
      best = corner;
    }
  }
  return best;
}

export function findWallNear(
  plan: Plan,
  point: Point,
  radius = 0.25
): { wall: Wall; t: number; point: Point } | null {
  const corners = cornerMap(plan);
  let best: { wall: Wall; t: number; point: Point } | null = null;
  let bestDist = Infinity;
  for (const wall of plan.walls) {
    const projection = projectOnWall(point, wall, corners);
    if (!projection) continue;
    const tolerance = Math.max(radius, wall.thickness / 2 + 0.05);
    if (projection.distance <= tolerance && projection.distance < bestDist) {
      bestDist = projection.distance;
      best = { wall, t: projection.t, point: projection.point };
    }
  }
  return best;
}

export function findItemAt(plan: Plan, point: Point): Item | null {
  // Iterate backwards so the most recently placed item wins the click.
  for (let i = plan.items.length - 1; i >= 0; i -= 1) {
    const item = plan.items[i];
    const dx = point.x - item.x;
    const dy = point.y - item.y;
    if (Math.hypot(dx, dy) > Math.max(item.width, item.depth)) continue;
    const rad = (item.rotation * Math.PI) / 180;
    const localX = dx * Math.cos(-rad) - dy * Math.sin(-rad);
    const localY = dx * Math.sin(-rad) + dy * Math.cos(-rad);
    if (Math.abs(localX) <= item.width / 2 && Math.abs(localY) <= item.depth / 2) return item;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Corners & walls
 * ------------------------------------------------------------------ */

/** Returns the id of a corner at `point`, creating one if none is close by. */
export function ensureCorner(plan: Plan, point: Point): { plan: Plan; id: string } {
  const existing = findCornerNear(plan, point);
  if (existing) return { plan, id: existing.id };

  const onWall = findWallNear(plan, point);
  if (onWall && onWall.t > 0.02 && onWall.t < 0.98) {
    const split = splitWall(plan, onWall.wall.id, onWall.point);
    if (split.id) return { plan: split.plan, id: split.id };
  }

  const corner: Corner = { id: uid("c"), x: point.x, y: point.y };
  return { plan: { ...plan, corners: [...plan.corners, corner] }, id: corner.id };
}

export function connectWall(plan: Plan, startId: string, endId: string): Plan {
  if (startId === endId) return plan;
  const exists = plan.walls.some(
    (w) =>
      (w.start === startId && w.end === endId) || (w.start === endId && w.end === startId)
  );
  if (exists) return plan;
  const wall: Wall = {
    id: uid("w"),
    start: startId,
    end: endId,
    thickness: plan.settings.wallThickness,
    height: plan.settings.wallHeight,
    openings: [],
  };
  return touch({ ...plan, walls: [...plan.walls, wall] });
}

/** Draws a connected chain of walls through the given points. */
export function drawWallChain(plan: Plan, points: Point[]): Plan {
  if (points.length < 2) return plan;
  let next = plan;
  let previousId: string | null = null;
  for (const point of points) {
    const result = ensureCorner(next, point);
    next = result.plan;
    if (previousId) next = connectWall(next, previousId, result.id);
    previousId = result.id;
  }
  return touch(next);
}

/** Four walls forming a closed rectangle. */
export function drawRoomRect(plan: Plan, a: Point, b: Point): Plan {
  if (Math.abs(a.x - b.x) < 0.2 || Math.abs(a.y - b.y) < 0.2) return plan;
  const corners: Point[] = [
    { x: a.x, y: a.y },
    { x: b.x, y: a.y },
    { x: b.x, y: b.y },
    { x: a.x, y: b.y },
  ];
  return drawWallChain(plan, [...corners, corners[0]]);
}

export function moveCorner(plan: Plan, id: string, point: Point): Plan {
  return touch({
    ...plan,
    corners: plan.corners.map((c) => (c.id === id ? { ...c, x: point.x, y: point.y } : c)),
  });
}

/** Collapses `sourceId` onto `targetId`, rewiring and de-duplicating walls. */
export function mergeCorners(plan: Plan, sourceId: string, targetId: string): Plan {
  if (sourceId === targetId) return plan;
  const seen = new Set<string>();
  const walls: Wall[] = [];
  for (const wall of plan.walls) {
    const start = wall.start === sourceId ? targetId : wall.start;
    const end = wall.end === sourceId ? targetId : wall.end;
    if (start === end) continue;
    const key = [start, end].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    walls.push({ ...wall, start, end });
  }
  return touch({
    ...plan,
    walls,
    corners: plan.corners.filter((c) => c.id !== sourceId),
  });
}

/** Inserts a corner mid-wall, replacing it with two walls. */
export function splitWall(plan: Plan, wallId: string, point: Point): { plan: Plan; id: string | null } {
  const wall = plan.walls.find((w) => w.id === wallId);
  if (!wall) return { plan, id: null };

  const corner: Corner = { id: uid("c"), x: point.x, y: point.y };
  const shared = { thickness: wall.thickness, height: wall.height, exterior: wall.exterior };

  // Openings follow whichever half they fall in, with t remapped to that half.
  const projection = projectOnWall(point, wall, cornerMap(plan));
  const split = projection ? projection.t : 0.5;
  const first: Opening[] = [];
  const second: Opening[] = [];
  for (const opening of wall.openings) {
    if (opening.t <= split && split > 0.001) first.push({ ...opening, t: opening.t / split });
    else if (split < 0.999) second.push({ ...opening, t: (opening.t - split) / (1 - split) });
  }

  const walls = plan.walls.flatMap<Wall>((w) =>
    w.id !== wallId
      ? [w]
      : [
          { ...shared, id: uid("w"), start: w.start, end: corner.id, openings: first },
          { ...shared, id: uid("w"), start: corner.id, end: w.end, openings: second },
        ]
  );

  return {
    plan: touch({ ...plan, corners: [...plan.corners, corner], walls }),
    id: corner.id,
  };
}

function pruneOrphans(plan: Plan): Plan {
  const used = new Set<string>();
  for (const wall of plan.walls) {
    used.add(wall.start);
    used.add(wall.end);
  }
  return { ...plan, corners: plan.corners.filter((c) => used.has(c.id)) };
}

export function removeWall(plan: Plan, id: string): Plan {
  return touch(pruneOrphans({ ...plan, walls: plan.walls.filter((w) => w.id !== id) }));
}

export function removeCorner(plan: Plan, id: string): Plan {
  return touch(
    pruneOrphans({
      ...plan,
      corners: plan.corners.filter((c) => c.id !== id),
      walls: plan.walls.filter((w) => w.start !== id && w.end !== id),
    })
  );
}

export function updateWall(plan: Plan, id: string, patch: Partial<Wall>): Plan {
  return touch({
    ...plan,
    walls: plan.walls.map((w) => (w.id === id ? { ...w, ...patch } : w)),
  });
}

/* ------------------------------------------------------------------ *
 * Openings
 * ------------------------------------------------------------------ */

export function addOpening(plan: Plan, wallId: string, opening: Opening): Plan {
  return touch({
    ...plan,
    walls: plan.walls.map((w) =>
      w.id === wallId ? { ...w, openings: [...w.openings, opening] } : w
    ),
  });
}

export function updateOpening(
  plan: Plan,
  wallId: string,
  openingId: string,
  patch: Partial<Opening>
): Plan {
  return touch({
    ...plan,
    walls: plan.walls.map((w) =>
      w.id === wallId
        ? {
            ...w,
            openings: w.openings.map((o) => (o.id === openingId ? { ...o, ...patch } : o)),
          }
        : w
    ),
  });
}

export function removeOpening(plan: Plan, wallId: string, openingId: string): Plan {
  return touch({
    ...plan,
    walls: plan.walls.map((w) =>
      w.id === wallId ? { ...w, openings: w.openings.filter((o) => o.id !== openingId) } : w
    ),
  });
}

/* ------------------------------------------------------------------ *
 * Items
 * ------------------------------------------------------------------ */

export function addItem(plan: Plan, item: Item): Plan {
  return touch({ ...plan, items: [...plan.items, item] });
}

export function updateItem(plan: Plan, id: string, patch: Partial<Item>): Plan {
  return touch({
    ...plan,
    items: plan.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  });
}

export function removeItem(plan: Plan, id: string): Plan {
  return touch({ ...plan, items: plan.items.filter((i) => i.id !== id) });
}

/**
 * The caller supplies the new id so that this stays a pure function of its
 * inputs — React may invoke a reducer twice, and a copy that minted its own id
 * would produce a different plan each time.
 */
export function duplicateItem(plan: Plan, id: string, newId: string): Plan {
  const source = plan.items.find((i) => i.id === id);
  if (!source) return plan;
  const copy: Item = { ...source, id: newId, x: source.x + 0.4, y: source.y + 0.4 };
  return touch({ ...plan, items: [...plan.items, copy] });
}

/* ------------------------------------------------------------------ *
 * Rooms & settings
 * ------------------------------------------------------------------ */

export function setRoomStyle(
  plan: Plan,
  id: string,
  patch: { name?: string; floorColor?: string }
): Plan {
  return touch({
    ...plan,
    rooms: { ...plan.rooms, [id]: { ...plan.rooms[id], ...patch } },
  });
}

export function updateSettings(plan: Plan, patch: Partial<Plan["settings"]>): Plan {
  const settings = { ...plan.settings, ...patch };
  // Wall height and thickness are plan-wide defaults; pushing them onto walls
  // that still match the old default keeps the model consistent.
  const walls = plan.walls.map((w) => ({
    ...w,
    height: patch.wallHeight !== undefined && w.height === plan.settings.wallHeight ? patch.wallHeight : w.height,
    thickness:
      patch.wallThickness !== undefined && w.thickness === plan.settings.wallThickness
        ? patch.wallThickness
        : w.thickness,
  }));
  return touch({ ...plan, settings, walls });
}
