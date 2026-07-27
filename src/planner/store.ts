/**
 * Plan state: an undo/redo stack plus autosave to localStorage.
 *
 * Editing gestures that stream (dragging a corner, sliding a door along a wall)
 * pass `silent: true` so the history gets one entry per gesture instead of one
 * per mouse move. The gesture takes a `checkpoint()` on mouse-down first.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { Plan } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const STORAGE_KEY = "eventive.planner.v1";
const HISTORY_LIMIT = 60;

interface HistoryState {
  past: Plan[];
  present: Plan;
  future: Plan[];
}

type Action =
  | { type: "apply"; mutator: (plan: Plan) => Plan; silent?: boolean }
  | { type: "checkpoint" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "load"; plan: Plan };

function reducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case "apply": {
      const next = action.mutator(state.present);
      if (next === state.present) return state;
      if (action.silent) return { ...state, present: next };
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      };
    }
    case "checkpoint":
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: state.present,
        future: [],
      };
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: next,
        future: rest,
      };
    }
    case "load":
      return { past: [], present: action.plan, future: [] };
    default:
      return state;
  }
}

export function usePlanner(initial: Plan) {
  const [state, dispatch] = useReducer(reducer, { past: [], present: initial, future: [] });

  const apply = useCallback(
    (mutator: (plan: Plan) => Plan, options?: { silent?: boolean }) =>
      dispatch({ type: "apply", mutator, silent: options?.silent }),
    []
  );
  const checkpoint = useCallback(() => dispatch({ type: "checkpoint" }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const load = useCallback((plan: Plan) => dispatch({ type: "load", plan }), []);

  // Autosave, debounced so a drag does not hammer localStorage.
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => savePlan(state.present), 400);
    return () => window.clearTimeout(timer.current);
  }, [state.present]);

  return useMemo(
    () => ({
      plan: state.present,
      apply,
      checkpoint,
      undo,
      redo,
      load,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }),
    [state.present, state.past.length, state.future.length, apply, checkpoint, undo, redo, load]
  );
}

/* ------------------------------------------------------------------ *
 * Persistence
 * ------------------------------------------------------------------ */

export function savePlan(plan: Plan): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Private browsing or a full quota — autosave is a convenience, not a
    // guarantee, and the user still has JSON export.
  }
}

export function loadSavedPlan(): Plan | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizePlan(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearSavedPlan(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Accepts anything that claims to be a plan (imported file, stale localStorage
 * entry) and returns something the renderer can survive.
 */
export function normalizePlan(input: unknown): Plan {
  const raw = (input ?? {}) as Partial<Plan>;
  const settings = { ...DEFAULT_SETTINGS, ...(raw.settings ?? {}) };
  const corners = Array.isArray(raw.corners)
    ? raw.corners
        .filter((c) => c && typeof c.id === "string")
        .map((c) => ({ id: c.id, x: Number(c.x) || 0, y: Number(c.y) || 0 }))
    : [];
  const cornerIds = new Set(corners.map((c) => c.id));
  const walls = Array.isArray(raw.walls)
    ? raw.walls
        .filter((w) => w && cornerIds.has(w.start) && cornerIds.has(w.end) && w.start !== w.end)
        .map((w) => ({
          id: w.id,
          start: w.start,
          end: w.end,
          thickness: Number(w.thickness) || settings.wallThickness,
          height: Number(w.height) || settings.wallHeight,
          exterior: Boolean(w.exterior),
          openings: Array.isArray(w.openings)
            ? w.openings.map((o) => ({
                id: o.id,
                type: o.type ?? "door",
                t: Math.min(1, Math.max(0, Number(o.t) || 0.5)),
                width: Number(o.width) || 0.9,
                height: Number(o.height) || 2.1,
                sill: Number(o.sill) || 0,
              }))
            : [],
        }))
    : [];
  const items = Array.isArray(raw.items)
    ? raw.items
        .filter((i) => i && typeof i.id === "string")
        .map((i) => ({
          id: i.id,
          catalogId: i.catalogId ?? "box",
          x: Number(i.x) || 0,
          y: Number(i.y) || 0,
          rotation: Number(i.rotation) || 0,
          width: Number(i.width) || 1,
          depth: Number(i.depth) || 1,
          height: Number(i.height) || 1,
          elevation: Number(i.elevation) || 0,
          color: i.color ?? "#9aa3ac",
          label: i.label,
        }))
    : [];

  return {
    id: raw.id ?? "plan",
    name: raw.name ?? "Untitled property",
    corners,
    walls,
    items,
    rooms: raw.rooms && typeof raw.rooms === "object" ? raw.rooms : {},
    settings,
    updatedAt: Number(raw.updatedAt) || Date.now(),
  };
}
