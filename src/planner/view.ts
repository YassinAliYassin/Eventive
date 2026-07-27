/** Pan/zoom transform shared by the 2D canvas and its pointer handling. */

import type { Point } from "./geometry";

export interface View {
  /** Pixels per metre. */
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const MIN_SCALE = 4;
export const MAX_SCALE = 300;

export function toScreen(p: Point, view: View): Point {
  return { x: p.x * view.scale + view.offsetX, y: p.y * view.scale + view.offsetY };
}

export function toWorld(px: number, py: number, view: View): Point {
  return { x: (px - view.offsetX) / view.scale, y: (py - view.offsetY) / view.scale };
}

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/** Zooms about a screen-space anchor so the point under the cursor stays put. */
export function zoomAt(view: View, factor: number, anchorX: number, anchorY: number): View {
  const scale = clampScale(view.scale * factor);
  const applied = scale / view.scale;
  return {
    scale,
    offsetX: anchorX - (anchorX - view.offsetX) * applied,
    offsetY: anchorY - (anchorY - view.offsetY) * applied,
  };
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function fitView(
  bounds: Bounds,
  width: number,
  height: number,
  padding = 64
): View {
  const spanX = Math.max(0.5, bounds.maxX - bounds.minX);
  const spanY = Math.max(0.5, bounds.maxY - bounds.minY);
  const scale = clampScale(
    Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY)
  );
  const centreX = (bounds.minX + bounds.maxX) / 2;
  const centreY = (bounds.minY + bounds.maxY) / 2;
  return {
    scale,
    offsetX: width / 2 - centreX * scale,
    offsetY: height / 2 - centreY * scale,
  };
}
