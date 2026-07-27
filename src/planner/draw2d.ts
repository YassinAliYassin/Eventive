/**
 * Canvas painting for the plan view. Pure drawing — every function here takes
 * state and a context and returns nothing, so the React layer only has to
 * decide *when* to repaint, never *how*.
 */

import { catalogEntry } from "./catalog";
import type { CatalogEntry } from "./catalog";
import {
  cornerMap,
  formatArea,
  formatLength,
  itemCorners,
  normalize,
  openingSpan,
  radians,
  sub,
  wallEnds,
} from "./geometry";
import type { Point, Room } from "./geometry";
import type { Item, OpeningType, Plan, Selection } from "./types";
import { toScreen } from "./view";
import type { View } from "./view";

export const PALETTE = {
  sheet: "#f6f4f0",
  gridMinor: "rgba(16, 23, 34, 0.06)",
  gridMajor: "rgba(16, 23, 34, 0.13)",
  wall: "#2b3644",
  wallInterior: "#57657a",
  wallHint: "rgba(43, 54, 68, 0.35)",
  room: "rgba(216, 229, 243, 0.55)",
  roomText: "#495667",
  accent: "#2f5d8f",
  accentSoft: "rgba(47, 93, 143, 0.18)",
  clay: "#b2543a",
  ink: "#101722",
  itemStroke: "rgba(16, 23, 34, 0.45)",
  dimension: "#8a94a3",
};

export interface Draft {
  points: Point[];
  cursor: Point | null;
  closing?: boolean;
}

export interface DrawState {
  plan: Plan;
  rooms: Room[];
  view: View;
  width: number;
  height: number;
  selection: Selection | null;
  hover: Selection | null;
  draft: Draft | null;
  rectDraft: { a: Point; b: Point } | null;
  openingPreview: { wallId: string; t: number; type: OpeningType; width: number } | null;
  itemPreview: { entry: CatalogEntry; at: Point; rotation: number } | null;
  showGrid: boolean;
  showDimensions: boolean;
  showFurniture: boolean;
  showCorners: boolean;
}

const isSelected = (selection: Selection | null, kind: string, id: string) =>
  selection?.kind === kind && selection.id === id;

export function drawPlan(ctx: CanvasRenderingContext2D, state: DrawState): void {
  const { view, width, height } = state;

  ctx.save();
  ctx.fillStyle = PALETTE.sheet;
  ctx.fillRect(0, 0, width, height);

  if (state.showGrid) drawGrid(ctx, state);
  drawRooms(ctx, state);
  drawWalls(ctx, state);
  if (state.showFurniture) drawItems(ctx, state);
  if (state.showCorners) drawCorners(ctx, state);
  if (state.showDimensions) drawDimensions(ctx, state);
  drawDrafts(ctx, state);
  drawPreviews(ctx, state);
  drawScaleBar(ctx, view, width, height, state.plan.settings.units);
  ctx.restore();
}

/* ------------------------------------------------------------------ *
 * Grid
 * ------------------------------------------------------------------ */

function drawGrid(ctx: CanvasRenderingContext2D, state: DrawState): void {
  const { view, width, height } = state;
  let step = state.plan.settings.gridSize || 0.25;
  while (step * view.scale < 9) step *= 2;
  const majorEvery = Math.max(1, Math.round(1 / step)) * (step * view.scale < 24 ? 5 : 1);

  const startX = Math.floor(-view.offsetX / view.scale / step) * step;
  const endX = startX + width / view.scale + step;
  const startY = Math.floor(-view.offsetY / view.scale / step) * step;
  const endY = startY + height / view.scale + step;

  ctx.lineWidth = 1;
  for (let x = startX, i = 0; x <= endX; x += step, i += 1) {
    const sx = Math.round(x * view.scale + view.offsetX) + 0.5;
    const major = Math.abs(Math.round(x / step) % majorEvery) === 0;
    ctx.strokeStyle = major ? PALETTE.gridMajor : PALETTE.gridMinor;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, height);
    ctx.stroke();
  }
  for (let y = startY; y <= endY; y += step) {
    const sy = Math.round(y * view.scale + view.offsetY) + 0.5;
    const major = Math.abs(Math.round(y / step) % majorEvery) === 0;
    ctx.strokeStyle = major ? PALETTE.gridMajor : PALETTE.gridMinor;
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(width, sy);
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ *
 * Rooms
 * ------------------------------------------------------------------ */

function drawRooms(ctx: CanvasRenderingContext2D, state: DrawState): void {
  const { plan, rooms, view } = state;
  for (const room of rooms) {
    const style = plan.rooms[room.id];
    const selected = isSelected(state.selection, "room", room.id);
    ctx.beginPath();
    room.polygon.forEach((p, index) => {
      const s = toScreen(p, view);
      if (index === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    });
    ctx.closePath();
    ctx.fillStyle = style?.floorColor
      ? hexToRgba(style.floorColor, selected ? 0.55 : 0.38)
      : selected
        ? PALETTE.accentSoft
        : PALETTE.room;
    ctx.fill();
    if (selected) {
      ctx.strokeStyle = PALETTE.accent;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Labels last so walls never sit on top of the text.
  for (const room of rooms) {
    const centre = toScreen(room.centroid, view);
    const name = plan.rooms[room.id]?.name ?? "Room";
    const size = Math.max(11, Math.min(16, view.scale * 0.34));
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `600 ${size}px Inter, system-ui, sans-serif`;
    ctx.fillText(name.toUpperCase(), centre.x, centre.y - size * 0.6);
    ctx.fillStyle = PALETTE.roomText;
    ctx.font = `500 ${size * 0.85}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.fillText(formatArea(room.area, plan.settings.units), centre.x, centre.y + size * 0.7);
  }
}

/* ------------------------------------------------------------------ *
 * Walls & openings
 * ------------------------------------------------------------------ */

function drawWalls(ctx: CanvasRenderingContext2D, state: DrawState): void {
  const { plan, view } = state;
  const corners = cornerMap(plan);

  for (const wall of plan.walls) {
    const ends = wallEnds(wall, corners);
    if (!ends) continue;

    const selected = isSelected(state.selection, "wall", wall.id);
    const hovered = isSelected(state.hover, "wall", wall.id);
    const dir = normalize(sub(ends.b, ends.a));
    const half = wall.thickness / 2;
    const length = Math.hypot(ends.b.x - ends.a.x, ends.b.y - ends.a.y);
    const extendedStart = { x: ends.a.x - dir.x * half, y: ends.a.y - dir.y * half };
    const extendedLength = length + wall.thickness;

    const at = (distance: number): Point => ({
      x: extendedStart.x + dir.x * distance,
      y: extendedStart.y + dir.y * distance,
    });

    // Solid runs are everything the openings do not consume.
    const gaps = [...wall.openings]
      .map((opening) => {
        const span = openingSpan(opening, length);
        return { opening, start: span.start + half, end: span.end + half };
      })
      .sort((a, b) => a.start - b.start);

    const segments: Array<[number, number]> = [];
    let cursor = 0;
    for (const gap of gaps) {
      if (gap.start > cursor) segments.push([cursor, gap.start]);
      cursor = Math.max(cursor, gap.end);
    }
    if (cursor < extendedLength) segments.push([cursor, extendedLength]);

    ctx.lineCap = "butt";
    ctx.lineWidth = Math.max(1.5, wall.thickness * view.scale);
    ctx.strokeStyle = selected
      ? PALETTE.accent
      : hovered
        ? PALETTE.wallInterior
        : wall.exterior === false
          ? PALETTE.wallInterior
          : PALETTE.wall;

    for (const [from, to] of segments) {
      if (to - from < 0.001) continue;
      const p = toScreen(at(from), view);
      const q = toScreen(at(to), view);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }

    for (const gap of gaps) {
      drawOpening(ctx, state, gap.opening.type, at(gap.start), at(gap.end), dir, half);
    }
  }
}

function drawOpening(
  ctx: CanvasRenderingContext2D,
  state: DrawState,
  type: OpeningType,
  from: Point,
  to: Point,
  dir: Point,
  half: number
): void {
  const { view } = state;
  const p = toScreen(from, view);
  const q = toScreen(to, view);
  const normalDir = { x: -dir.y, y: dir.x };
  const t = half * view.scale;

  ctx.lineWidth = Math.max(1, view.scale * 0.02);
  ctx.strokeStyle = PALETTE.wallHint;

  if (type === "window") {
    // Two lines along the reveal, like a plan-view window.
    for (const offset of [-t * 0.55, t * 0.55]) {
      ctx.beginPath();
      ctx.moveTo(p.x + normalDir.x * offset, p.y + normalDir.y * offset);
      ctx.lineTo(q.x + normalDir.x * offset, q.y + normalDir.y * offset);
      ctx.stroke();
    }
    return;
  }

  if (type === "arch") {
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }

  // Doors: leaf plus swing arc, drawn from the hinge at the start of the gap.
  const width = Math.hypot(q.x - p.x, q.y - p.y);
  const leaves = type === "double-door" ? 2 : 1;
  const leafWidth = width / leaves;

  ctx.strokeStyle = PALETTE.wallHint;
  for (let i = 0; i < leaves; i += 1) {
    const hinge = i === 0 ? p : q;
    const sweep = i === 0 ? 1 : -1;
    const along = { x: (q.x - p.x) / width, y: (q.y - p.y) / width };
    const start = Math.atan2(along.y * sweep, along.x * sweep);

    ctx.beginPath();
    ctx.moveTo(hinge.x, hinge.y);
    ctx.lineTo(
      hinge.x + normalDir.x * leafWidth * -1,
      hinge.y + normalDir.y * leafWidth * -1
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(hinge.x, hinge.y, leafWidth, start, start + (sweep > 0 ? -Math.PI / 2 : Math.PI / 2), sweep > 0);
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ *
 * Corners
 * ------------------------------------------------------------------ */

function drawCorners(ctx: CanvasRenderingContext2D, state: DrawState): void {
  const { plan, view } = state;
  for (const corner of plan.corners) {
    const selected = isSelected(state.selection, "corner", corner.id);
    const hovered = isSelected(state.hover, "corner", corner.id);
    if (!selected && !hovered && view.scale < 14) continue;
    const s = toScreen(corner, view);
    const r = selected || hovered ? 6 : 3.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fillStyle = selected ? PALETTE.accent : "#ffffff";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = selected ? PALETTE.accent : PALETTE.wall;
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ *
 * Items
 * ------------------------------------------------------------------ */

function drawItems(ctx: CanvasRenderingContext2D, state: DrawState): void {
  for (const item of state.plan.items) {
    drawItem(ctx, state, item, 1);
  }
  const selection = state.selection;
  if (selection?.kind === "item") {
    const item = state.plan.items.find((i) => i.id === selection.id);
    if (item) drawItemHandles(ctx, state, item);
  }
}

function drawItem(
  ctx: CanvasRenderingContext2D,
  state: DrawState,
  item: Item,
  alpha: number
): void {
  const { view } = state;
  const entry = catalogEntry(item.catalogId);
  const centre = toScreen(item, view);
  const selected = isSelected(state.selection, "item", item.id);
  const hovered = isSelected(state.hover, "item", item.id);
  const w = item.width * view.scale;
  const d = item.depth * view.scale;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(centre.x, centre.y);
  ctx.rotate(radians(item.rotation));

  const round = entry.shape === "round-table" || entry.shape === "cylinder" || entry.shape === "tree" || entry.shape === "plant";
  ctx.beginPath();
  if (round) ctx.ellipse(0, 0, w / 2, d / 2, 0, 0, Math.PI * 2);
  else roundedRect(ctx, -w / 2, -d / 2, w, d, Math.min(4, w / 6, d / 6));

  ctx.fillStyle = hexToRgba(item.color, entry.shape === "rug" ? 0.5 : 0.85);
  ctx.fill();
  ctx.lineWidth = selected ? 2 : 1;
  ctx.strokeStyle = selected ? PALETTE.accent : hovered ? PALETTE.clay : PALETTE.itemStroke;
  ctx.stroke();

  // A small tick on the "front" edge so orientation is readable at a glance.
  if (["chair", "sofa", "bed", "screen", "toilet", "counter"].includes(entry.shape)) {
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 2, -d / 2 + 2);
    ctx.lineTo(w / 2 - 2, -d / 2 + 2);
    ctx.strokeStyle = hexToRgba(PALETTE.ink, 0.35);
    ctx.lineWidth = Math.max(1.5, d * 0.12);
    ctx.stroke();
  }

  const label = item.label ?? entry.name;
  if (w > 46 && d > 20) {
    ctx.rotate(-radians(item.rotation));
    ctx.font = `500 ${Math.min(11, Math.max(8, w * 0.12))}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = hexToRgba(PALETTE.ink, 0.7);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 0);
  }
  ctx.restore();
}

function drawItemHandles(ctx: CanvasRenderingContext2D, state: DrawState, item: Item): void {
  const { view } = state;
  const corners = itemCorners(item).map((p) => toScreen(p, view));
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = PALETTE.accent;
  ctx.lineWidth = 1.5;
  for (const c of corners) {
    ctx.beginPath();
    ctx.rect(c.x - 3, c.y - 3, 6, 6);
    ctx.fill();
    ctx.stroke();
  }
  const handle = toScreen(rotationHandlePosition(item), view);
  const centre = toScreen(item, view);
  ctx.beginPath();
  ctx.moveTo(centre.x, centre.y);
  ctx.lineTo(handle.x, handle.y);
  ctx.strokeStyle = PALETTE.accentSoft;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(handle.x, handle.y, 5, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.accent;
  ctx.fill();
}

/** World-space position of the rotation grip, above the item's front edge. */
export function rotationHandlePosition(item: Item): Point {
  const rad = radians(item.rotation);
  const reach = item.depth / 2 + Math.max(0.35, item.depth * 0.35);
  return {
    x: item.x + Math.sin(rad) * reach,
    y: item.y - Math.cos(rad) * reach,
  };
}

/* ------------------------------------------------------------------ *
 * Dimensions
 * ------------------------------------------------------------------ */

function drawDimensions(ctx: CanvasRenderingContext2D, state: DrawState): void {
  const { plan, view } = state;
  const corners = cornerMap(plan);
  ctx.font = `500 10px "JetBrains Mono", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const wall of plan.walls) {
    const ends = wallEnds(wall, corners);
    if (!ends) continue;
    const a = toScreen(ends.a, view);
    const b = toScreen(ends.b, view);
    const pixels = Math.hypot(b.x - a.x, b.y - a.y);
    if (pixels < 44) continue;

    const selected = isSelected(state.selection, "wall", wall.id);
    const metres = Math.hypot(ends.b.x - ends.a.x, ends.b.y - ends.a.y);
    // Keep labels upright: flip any wall that would read upside-down.
    let angle = Math.atan2(b.y - a.y, b.x - a.x);
    if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;

    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const offset = (wall.thickness * view.scale) / 2 + 10;

    ctx.save();
    ctx.translate(mid.x, mid.y);
    ctx.rotate(angle);
    ctx.fillStyle = selected ? PALETTE.accent : PALETTE.dimension;
    ctx.fillText(formatLength(metres, plan.settings.units), 0, -offset);
    ctx.restore();
  }
}

/* ------------------------------------------------------------------ *
 * Drafts and previews
 * ------------------------------------------------------------------ */

function drawDrafts(ctx: CanvasRenderingContext2D, state: DrawState): void {
  const { view, plan } = state;

  if (state.draft && state.draft.points.length > 0) {
    const points = [...state.draft.points];
    if (state.draft.cursor) points.push(state.draft.cursor);
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(2, plan.settings.wallThickness * view.scale);
    ctx.strokeStyle = hexToRgba(PALETTE.accent, 0.55);
    ctx.beginPath();
    points.forEach((p, index) => {
      const s = toScreen(p, view);
      if (index === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    });
    ctx.stroke();

    const last = state.draft.points[state.draft.points.length - 1];
    if (state.draft.cursor && last) {
      labelSegment(ctx, state, last, state.draft.cursor);
    }
    for (const p of state.draft.points) {
      const s = toScreen(p, view);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.accent;
      ctx.fill();
    }
  }

  if (state.rectDraft) {
    const { a, b } = state.rectDraft;
    const p = toScreen(a, view);
    const q = toScreen(b, view);
    ctx.lineWidth = Math.max(2, plan.settings.wallThickness * view.scale);
    ctx.strokeStyle = hexToRgba(PALETTE.accent, 0.55);
    ctx.strokeRect(p.x, p.y, q.x - p.x, q.y - p.y);
    labelSegment(ctx, state, { x: a.x, y: a.y }, { x: b.x, y: a.y });
    labelSegment(ctx, state, { x: b.x, y: a.y }, { x: b.x, y: b.y });
  }
}

function labelSegment(
  ctx: CanvasRenderingContext2D,
  state: DrawState,
  a: Point,
  b: Point
): void {
  const { view, plan } = state;
  const metres = Math.hypot(b.x - a.x, b.y - a.y);
  if (metres < 0.05) return;
  const p = toScreen(a, view);
  const q = toScreen(b, view);
  const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
  const text = formatLength(metres, plan.settings.units);
  ctx.font = `600 11px "JetBrains Mono", ui-monospace, monospace`;
  const width = ctx.measureText(text).width + 10;
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  roundedRect(ctx, mid.x - width / 2, mid.y - 19, width, 16, 4);
  ctx.fill();
  ctx.fillStyle = PALETTE.accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, mid.x, mid.y - 11);
}

function drawPreviews(ctx: CanvasRenderingContext2D, state: DrawState): void {
  const { plan, view } = state;

  if (state.openingPreview) {
    const wall = plan.walls.find((w) => w.id === state.openingPreview!.wallId);
    const corners = cornerMap(plan);
    const ends = wall ? wallEnds(wall, corners) : null;
    if (wall && ends) {
      const length = Math.hypot(ends.b.x - ends.a.x, ends.b.y - ends.a.y);
      const dir = normalize(sub(ends.b, ends.a));
      const centre = state.openingPreview.t * length;
      const halfWidth = state.openingPreview.width / 2;
      const from = {
        x: ends.a.x + dir.x * Math.max(halfWidth, centre - halfWidth),
        y: ends.a.y + dir.y * Math.max(halfWidth, centre - halfWidth),
      };
      const to = {
        x: ends.a.x + dir.x * Math.min(length, centre + halfWidth),
        y: ends.a.y + dir.y * Math.min(length, centre + halfWidth),
      };
      const p = toScreen(from, view);
      const q = toScreen(to, view);
      ctx.lineCap = "butt";
      ctx.lineWidth = Math.max(3, wall.thickness * view.scale);
      ctx.strokeStyle = hexToRgba(PALETTE.clay, 0.7);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
    }
  }

  if (state.itemPreview) {
    const { entry, at, rotation } = state.itemPreview;
    drawItem(
      ctx,
      state,
      {
        id: "preview",
        catalogId: entry.id,
        x: at.x,
        y: at.y,
        rotation,
        width: entry.width,
        depth: entry.depth,
        height: entry.height,
        elevation: entry.elevation ?? 0,
        color: entry.color,
      },
      0.55
    );
  }
}

/* ------------------------------------------------------------------ *
 * Scale bar
 * ------------------------------------------------------------------ */

function drawScaleBar(
  ctx: CanvasRenderingContext2D,
  view: View,
  width: number,
  height: number,
  units: Plan["settings"]["units"]
): void {
  const candidates = [0.5, 1, 2, 5, 10, 20, 50];
  const metres = candidates.find((c) => c * view.scale > 60) ?? 100;
  const pixels = metres * view.scale;
  const x = width - pixels - 24;
  const y = height - 26;

  ctx.strokeStyle = hexToRgba(PALETTE.ink, 0.5);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x, y);
  ctx.lineTo(x + pixels, y);
  ctx.lineTo(x + pixels, y - 4);
  ctx.stroke();

  ctx.font = `500 10px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillStyle = hexToRgba(PALETTE.ink, 0.6);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(formatLength(metres, units), x + pixels / 2, y + 4);
}

/* ------------------------------------------------------------------ *
 * Small helpers
 * ------------------------------------------------------------------ */

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function hexToRgba(hex: string, alpha: number): string {
  if (hex.startsWith("rgba") || hex.startsWith("rgb")) return hex;
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const value = Number.parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
