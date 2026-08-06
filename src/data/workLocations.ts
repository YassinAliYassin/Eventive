import type { WorkLocation } from "../types/timesheet";
import { VENUES } from "./venues";

/** Sites staff can clock in at — event venues plus non-event locations. */
export const WORK_LOCATIONS: WorkLocation[] = [
  ...VENUES.map((venue) => ({ id: venue.id, name: venue.name, town: venue.location })),
  { id: "head-office", name: "Head Office", town: "Harare" },
  { id: "warehouse", name: "Warehouse & Stores", town: "Harare" },
];
