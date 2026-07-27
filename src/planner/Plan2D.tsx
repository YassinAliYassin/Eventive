/**
 * The 2D plan editor: a single canvas plus the pointer/keyboard handling that
 * turns gestures into plan operations. Painting lives in draw2d.ts.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { catalogEntry } from "./catalog";
import { drawPlan, rotationHandlePosition } from "./draw2d";
import type { Draft } from "./draw2d";
import {
  cornerMap,
  dist,
  normalizeAngle,
  openingSpan,
  projectOnWall,
  snapAngle,
  snapToGrid,
  sub,
  uid,
  wallLength,
} from "./geometry";
import type { Point, Room } from "./geometry";
import {
  CORNER_MERGE_DISTANCE,
  addItem,
  addOpening,
  drawRoomRect,
  drawWallChain,
  findCornerNear,
  findItemAt,
  findWallNear,
  mergeCorners,
  moveCorner,
  updateItem,
  updateOpening,
} from "./operations";
import type { Plan, Selection, Tool } from "./types";
import { OPENING_DEFAULTS } from "./types";
import { fitView, toWorld, zoomAt } from "./view";
import type { View } from "./view";

const CORNER_GRAB_PX = 10;
const HANDLE_GRAB_PX = 10;

interface Plan2DProps {
  plan: Plan;
  rooms: Room[];
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  pendingCatalogId: string | null;
  selection: Selection | null;
  onSelect: (selection: Selection | null) => void;
  apply: (mutator: (plan: Plan) => Plan, options?: { silent?: boolean }) => void;
  checkpoint: () => void;
  options: { grid: boolean; dimensions: boolean; furniture: boolean };
  /** Bumping this refits the view to the plan. */
  fitToken: number;
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>;
}

type Drag =
  | { kind: "pan"; x: number; y: number }
  | { kind: "corner"; id: string }
  | { kind: "item"; id: string; dx: number; dy: number }
  | { kind: "rotate"; id: string }
  | { kind: "wall"; id: string; origin: Point; positions: Record<string, Point> }
  | { kind: "opening"; wallId: string; openingId: string }
  | { kind: "rect"; a: Point }
  | null;

export function Plan2D(props: Plan2DProps) {
  const { plan, rooms, tool, onToolChange, selection, onSelect, apply, checkpoint } = props;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<Drag>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [view, setView] = useState<View>({ scale: 40, offsetX: 80, offsetY: 80 });
  const [hover, setHover] = useState<Selection | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [rectDraft, setRectDraft] = useState<{ a: Point; b: Point } | null>(null);
  const [cursor, setCursor] = useState<Point | null>(null);
  const [placeRotation, setPlaceRotation] = useState(0);

  const setCanvas = useCallback(
    (node: HTMLCanvasElement | null) => {
      localCanvasRef.current = node;
      if (props.canvasRef) props.canvasRef.current = node;
    },
    [props.canvasRef]
  );

  /* ---------------- sizing ---------------- */

  useLayoutEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.max(1, width), height: Math.max(1, height) });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Fit to the building, not to every prop: a tree parked 15 m away should not
  // shrink the house to a third of the pane. Items only set the bounds when
  // there is nothing built yet.
  const bounds = useMemo(() => {
    const xs: number[] = [];
    const ys: number[] = [];
    if (plan.corners.length > 0) {
      for (const c of plan.corners) {
        xs.push(c.x);
        ys.push(c.y);
      }
    } else {
      for (const i of plan.items) {
        const reach = Math.max(i.width, i.depth) / 2;
        xs.push(i.x - reach, i.x + reach);
        ys.push(i.y - reach, i.y + reach);
      }
    }
    if (xs.length === 0) return { minX: 0, minY: 0, maxX: 10, maxY: 8 };
    return {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
    };
  }, [plan.corners, plan.items]);

  useEffect(() => {
    setView(fitView(bounds, size.width, size.height));
    // Refit only on explicit request or a resize — not on every plan edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.fitToken, size.width, size.height]);

  /* ---------------- painting ---------------- */

  useEffect(() => {
    const canvas = localCanvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = size.width * ratio;
    canvas.height = size.height * ratio;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const pendingEntry = props.pendingCatalogId ? catalogEntry(props.pendingCatalogId) : null;

    drawPlan(ctx, {
      plan,
      rooms,
      view,
      width: size.width,
      height: size.height,
      selection,
      hover,
      draft,
      rectDraft,
      openingPreview:
        isOpeningTool(tool) && cursor ? openingPreviewAt(plan, cursor, tool) : null,
      itemPreview:
        tool === "item" && pendingEntry && cursor
          ? { entry: pendingEntry, at: cursor, rotation: placeRotation }
          : null,
      showGrid: props.options.grid,
      showDimensions: props.options.dimensions,
      showFurniture: props.options.furniture,
      showCorners: tool !== "item",
    });
  }, [
    plan,
    rooms,
    view,
    size,
    selection,
    hover,
    draft,
    rectDraft,
    cursor,
    tool,
    placeRotation,
    props.pendingCatalogId,
    props.options,
  ]);

  /* ---------------- helpers ---------------- */

  const pointerWorld = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
      const rect = event.currentTarget.getBoundingClientRect();
      return toWorld(event.clientX - rect.left, event.clientY - rect.top, view);
    },
    [view]
  );

  const snapped = useCallback(
    (point: Point, event: { altKey: boolean }): Point =>
      event.altKey ? point : snapToGrid(point, plan.settings.gridSize),
    [plan.settings.gridSize]
  );

  const hitTest = useCallback(
    (world: Point): Selection | null => {
      const grab = CORNER_GRAB_PX / view.scale;

      if (selection?.kind === "item") {
        const item = plan.items.find((i) => i.id === selection.id);
        if (item && dist(world, rotationHandlePosition(item)) <= HANDLE_GRAB_PX / view.scale) {
          return { kind: "item", id: item.id };
        }
      }

      const corner = findCornerNear(plan, world, grab);
      if (corner) return { kind: "corner", id: corner.id };

      const opening = findOpeningAt(plan, world);
      if (opening) {
        return { kind: "opening", id: opening.openingId, parentId: opening.wallId };
      }

      if (props.options.furniture) {
        const item = findItemAt(plan, world);
        if (item) return { kind: "item", id: item.id };
      }

      const wall = findWallNear(plan, world);
      if (wall) return { kind: "wall", id: wall.wall.id };

      const room = rooms.find((r) => pointInside(world, r.polygon));
      if (room) return { kind: "room", id: room.id };

      return null;
    },
    [plan, rooms, selection, view.scale, props.options.furniture]
  );

  /* ---------------- pointer ---------------- */

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const world = pointerWorld(event);
    const panning = event.button === 1 || event.button === 2 || tool === "pan";

    if (panning) {
      dragRef.current = { kind: "pan", x: event.clientX, y: event.clientY };
      return;
    }

    if (tool === "wall") {
      const point = draftPoint(world, draft, event, plan);
      const points = draft?.points ?? [];
      // Clicking the first point closes the loop.
      if (points.length >= 2 && dist(point, points[0]) < CORNER_MERGE_DISTANCE) {
        commitChain([...points, points[0]]);
        return;
      }
      setDraft({ points: [...points, point], cursor: point });
      return;
    }

    if (tool === "room") {
      const point = snapped(world, event);
      dragRef.current = { kind: "rect", a: point };
      setRectDraft({ a: point, b: point });
      return;
    }

    if (isOpeningTool(tool)) {
      const preview = openingPreviewAt(plan, world, tool);
      if (preview) {
        const defaults = OPENING_DEFAULTS[preview.type];
        const id = uid("o");
        apply((current) =>
          addOpening(current, preview.wallId, {
            id,
            type: preview.type,
            t: preview.t,
            width: defaults.width,
            height: defaults.height,
            sill: defaults.sill,
          })
        );
        onSelect({ kind: "opening", id, parentId: preview.wallId });
      }
      return;
    }

    if (tool === "item" && props.pendingCatalogId) {
      const entry = catalogEntry(props.pendingCatalogId);
      const point = snapped(world, event);
      const id = uid("i");
      apply((current) =>
        addItem(current, {
          id,
          catalogId: entry.id,
          x: point.x,
          y: point.y,
          rotation: placeRotation,
          width: entry.width,
          depth: entry.depth,
          height: entry.height,
          elevation: entry.elevation ?? 0,
          color: entry.color,
        })
      );
      onSelect({ kind: "item", id });
      if (!event.shiftKey) onToolChange("select");
      return;
    }

    // Select tool.
    const hit = hitTest(world);
    onSelect(hit);

    if (!hit) {
      dragRef.current = { kind: "pan", x: event.clientX, y: event.clientY };
      return;
    }

    if (hit.kind === "item") {
      const item = plan.items.find((i) => i.id === hit.id)!;
      checkpoint();
      if (
        selection?.kind === "item" &&
        selection.id === item.id &&
        dist(world, rotationHandlePosition(item)) <= HANDLE_GRAB_PX / view.scale
      ) {
        dragRef.current = { kind: "rotate", id: item.id };
      } else {
        dragRef.current = { kind: "item", id: item.id, dx: world.x - item.x, dy: world.y - item.y };
      }
      return;
    }

    if (hit.kind === "corner") {
      checkpoint();
      dragRef.current = { kind: "corner", id: hit.id };
      return;
    }

    if (hit.kind === "opening" && hit.parentId) {
      checkpoint();
      dragRef.current = { kind: "opening", wallId: hit.parentId, openingId: hit.id };
      return;
    }

    if (hit.kind === "wall") {
      const wall = plan.walls.find((w) => w.id === hit.id)!;
      const positions: Record<string, Point> = {};
      for (const id of [wall.start, wall.end]) {
        const corner = plan.corners.find((c) => c.id === id);
        if (corner) positions[id] = { x: corner.x, y: corner.y };
      }
      checkpoint();
      dragRef.current = { kind: "wall", id: wall.id, origin: world, positions };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const world = pointerWorld(event);
    setCursor(world);
    const drag = dragRef.current;

    if (!drag) {
      if (tool === "wall" && draft) {
        setDraft({ ...draft, cursor: draftPoint(world, draft, event, plan) });
      }
      setHover(tool === "select" ? hitTest(world) : null);
      return;
    }

    switch (drag.kind) {
      case "pan": {
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        dragRef.current = { kind: "pan", x: event.clientX, y: event.clientY };
        setView((v) => ({ ...v, offsetX: v.offsetX + dx, offsetY: v.offsetY + dy }));
        break;
      }
      case "corner": {
        const point = snapped(world, event);
        apply((current) => moveCorner(current, drag.id, point), { silent: true });
        break;
      }
      case "item": {
        const point = snapped({ x: world.x - drag.dx, y: world.y - drag.dy }, event);
        apply((current) => updateItem(current, drag.id, { x: point.x, y: point.y }), {
          silent: true,
        });
        break;
      }
      case "rotate": {
        const item = plan.items.find((i) => i.id === drag.id);
        if (!item) break;
        const raw = (Math.atan2(world.y - item.y, world.x - item.x) * 180) / Math.PI + 90;
        const rotation = event.altKey ? raw : Math.round(raw / 15) * 15;
        apply((current) => updateItem(current, drag.id, { rotation: normalizeAngle(rotation) }), {
          silent: true,
        });
        break;
      }
      case "wall": {
        const rawDelta = sub(world, drag.origin);
        const delta = event.altKey
          ? rawDelta
          : snapToGrid(rawDelta, plan.settings.gridSize);
        apply(
          (current) => {
            let next = current;
            for (const [id, origin] of Object.entries(drag.positions)) {
              next = moveCorner(next, id, { x: origin.x + delta.x, y: origin.y + delta.y });
            }
            return next;
          },
          { silent: true }
        );
        break;
      }
      case "opening": {
        const wall = plan.walls.find((w) => w.id === drag.wallId);
        const opening = wall?.openings.find((o) => o.id === drag.openingId);
        if (!wall || !opening) break;
        const projection = projectOnWall(world, wall, cornerMap(plan));
        if (!projection) break;
        const length = wallLength(wall, cornerMap(plan));
        const margin = length > 0 ? opening.width / 2 / length : 0;
        const t = Math.min(1 - margin, Math.max(margin, projection.t));
        apply((current) => updateOpening(current, wall.id, opening.id, { t }), { silent: true });
        break;
      }
      case "rect": {
        setRectDraft({ a: drag.a, b: snapped(world, event) });
        break;
      }
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (drag?.kind === "rect" && rectDraft) {
      const { a, b } = rectDraft;
      apply((current) => drawRoomRect(current, a, b));
      setRectDraft(null);
      if (!event.shiftKey) onToolChange("select");
      return;
    }

    // Dropping a corner on top of another welds them together.
    if (drag?.kind === "corner") {
      const moved = plan.corners.find((c) => c.id === drag.id);
      if (moved) {
        const target = plan.corners.find(
          (c) => c.id !== moved.id && dist(c, moved) <= CORNER_MERGE_DISTANCE
        );
        if (target) {
          apply((current) => mergeCorners(current, moved.id, target.id), { silent: true });
          onSelect({ kind: "corner", id: target.id });
        }
      }
    }
  };

  const handleDoubleClick = () => {
    if (tool === "wall" && draft && draft.points.length >= 2) commitChain(draft.points);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const factor = Math.exp(-event.deltaY * 0.0015);
    setView((v) => zoomAt(v, factor, event.clientX - rect.left, event.clientY - rect.top));
  };

  const commitChain = (points: Point[]) => {
    if (points.length >= 2) apply((current) => drawWallChain(current, points));
    setDraft(null);
    setPlaceRotation(0);
  };

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (event.key === "Escape") {
        if (draft) {
          setDraft(null);
        } else if (tool !== "select") {
          onToolChange("select");
        } else {
          onSelect(null);
        }
        return;
      }

      if (event.key === "Enter" && draft) {
        commitChain(draft.points);
        return;
      }

      if ((event.key === "r" || event.key === "R") && tool === "item") {
        setPlaceRotation((r) => normalizeAngle(r + (event.shiftKey ? -45 : 45)));
        return;
      }

      if (selection?.kind === "item") {
        const item = plan.items.find((i) => i.id === selection.id);
        if (!item) return;
        const step = event.shiftKey ? plan.settings.gridSize * 4 : plan.settings.gridSize;
        const nudges: Record<string, Point> = {
          ArrowLeft: { x: -step, y: 0 },
          ArrowRight: { x: step, y: 0 },
          ArrowUp: { x: 0, y: -step },
          ArrowDown: { x: 0, y: step },
        };
        const nudge = nudges[event.key];
        if (nudge) {
          event.preventDefault();
          apply((current) =>
            updateItem(current, item.id, { x: item.x + nudge.x, y: item.y + nudge.y })
          );
        }
        if (event.key === "r" || event.key === "R") {
          apply((current) =>
            updateItem(current, item.id, {
              rotation: normalizeAngle(item.rotation + (event.shiftKey ? -15 : 15)),
            })
          );
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  /* ---------------- render ---------------- */

  const cursorStyle =
    tool === "pan"
      ? "grab"
      : tool === "select"
        ? hover
          ? "pointer"
          : "default"
        : "crosshair";

  return (
    <div ref={wrapperRef} className="relative h-full w-full overflow-hidden">
      <canvas
        ref={setCanvas}
        className="block touch-none select-none"
        style={{ cursor: cursorStyle }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setCursor(null);
          setHover(null);
        }}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onContextMenu={(event) => event.preventDefault()}
      />
      {tool === "wall" && (
        <HintBar text="Click to place wall points · double-click or Enter to finish · Esc to cancel · Alt for free angles" />
      )}
      {tool === "room" && <HintBar text="Drag to sketch a rectangular room" />}
      {isOpeningTool(tool) && <HintBar text="Click a wall to drop the opening in" />}
      {tool === "item" && (
        <HintBar text="Click to place · R rotates · Shift-click to keep placing" />
      )}
    </div>
  );
}

function HintBar({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-line-soft bg-panel-raised px-4 py-1.5 text-[11px] font-medium text-ink-dim shadow-sm backdrop-blur">
      {text}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Tool helpers
 * ------------------------------------------------------------------ */

function isOpeningTool(tool: Tool): tool is "door" | "window" | "arch" {
  return tool === "door" || tool === "window" || tool === "arch";
}

function openingPreviewAt(
  plan: Plan,
  world: Point,
  tool: "door" | "window" | "arch"
): { wallId: string; t: number; type: "door" | "window" | "arch"; width: number } | null {
  const hit = findWallNear(plan, world, 0.6);
  if (!hit) return null;
  const defaults = OPENING_DEFAULTS[tool];
  const length = wallLength(hit.wall, cornerMap(plan));
  const margin = length > 0 ? defaults.width / 2 / length : 0;
  return {
    wallId: hit.wall.id,
    t: Math.min(1 - margin, Math.max(margin, hit.t)),
    type: tool,
    width: defaults.width,
  };
}

function findOpeningAt(
  plan: Plan,
  world: Point
): { wallId: string; openingId: string } | null {
  const corners = cornerMap(plan);
  for (const wall of plan.walls) {
    const projection = projectOnWall(world, wall, corners);
    if (!projection || projection.distance > wall.thickness / 2 + 0.08) continue;
    const length = wallLength(wall, corners);
    const along = projection.t * length;
    for (const opening of wall.openings) {
      const span = openingSpan(opening, length);
      if (along >= span.start && along <= span.end) {
        return { wallId: wall.id, openingId: opening.id };
      }
    }
  }
  return null;
}

/** Wall-drawing point: grid snapped, angle snapped to the previous point. */
function draftPoint(
  world: Point,
  draft: Draft | null,
  event: { altKey: boolean; shiftKey: boolean },
  plan: Plan
): Point {
  const existing = findCornerNear(plan, world, CORNER_MERGE_DISTANCE);
  if (existing) return { x: existing.x, y: existing.y };

  let point = event.altKey ? world : snapToGrid(world, plan.settings.gridSize);
  const last = draft?.points[draft.points.length - 1];
  if (last && !event.altKey) {
    point = snapAngle(last, point, event.shiftKey ? 45 : 15);
    point = snapToGrid(point, plan.settings.gridSize / 2);
  }
  return point;
}

function pointInside(p: Point, polygon: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}
