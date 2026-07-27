/**
 * Plan totals. Separated from the panels so the same numbers can feed the
 * inspector, an export, or a quote later on.
 */

import { CATALOG_BY_ID } from "./catalog";
import { cornerMap, wallLength } from "./geometry";
import type { Room } from "./geometry";
import type { Plan } from "./types";

/** Rule of thumb for standing receptions — floor area per guest. */
export const STANDING_AREA_PER_GUEST = 1.2;

export interface PlanMetrics {
  floorArea: number;
  wallRun: number;
  openings: number;
  /** Chairs actually placed, not table capacity. */
  seats: number;
  tables: number;
  /** Items drawn from the Event category — stage, rounds, bar, dance floor. */
  eventItems: number;
  danceFloorArea: number;
  stageArea: number;
  standingCapacity: number;
}

const SEAT_IDS = new Set(["banquet-chair", "dining-chair", "armchair", "office-chair"]);
const TABLE_IDS = new Set(["banquet-round", "cocktail-table", "trestle-table", "dining-table", "patio-set"]);

export function planMetrics(plan: Plan, rooms: Room[]): PlanMetrics {
  const corners = cornerMap(plan);
  const floorArea = rooms.reduce((sum, room) => sum + room.area, 0);

  let seats = 0;
  let tables = 0;
  let eventItems = 0;
  let danceFloorArea = 0;
  let stageArea = 0;

  for (const item of plan.items) {
    if (SEAT_IDS.has(item.catalogId)) seats += 1;
    if (TABLE_IDS.has(item.catalogId)) tables += 1;
    if (CATALOG_BY_ID.get(item.catalogId)?.category === "Event") eventItems += 1;
    if (item.catalogId === "dance-floor") danceFloorArea += item.width * item.depth;
    if (item.catalogId === "stage-deck") stageArea += item.width * item.depth;
  }

  return {
    floorArea,
    wallRun: plan.walls.reduce((sum, wall) => sum + wallLength(wall, corners), 0),
    openings: plan.walls.reduce((sum, wall) => sum + wall.openings.length, 0),
    seats,
    tables,
    eventItems,
    danceFloorArea,
    stageArea,
    standingCapacity: Math.floor(floorArea / STANDING_AREA_PER_GUEST),
  };
}

/**
 * True when the plan is an event layout rather than a home. A dining table and
 * four chairs is a house; banquet rounds and a stage deck is a function.
 */
export function isEventLayout(metrics: PlanMetrics): boolean {
  return metrics.eventItems > 0;
}
