import { Router, Request, Response, NextFunction } from "express";
import { WORK_LOCATIONS } from "../src/data/workLocations";
import { getPayPeriodByKey, getPayPeriodForDate, isWithinPeriod, listRecentPayPeriods } from "../src/lib/payPeriod";
import {
  TimesheetError,
  clockIn,
  clockOut,
  getOpenEntry,
  getPublicStaff,
  getStaffName,
  listAllEntries,
  listEntriesForStaff,
  requireValidPin,
} from "./timesheetStore";

const ADMIN_KEY = process.env.TIMESHEET_ADMIN_KEY || "eventive-admin";
if (!process.env.TIMESHEET_ADMIN_KEY) {
  console.warn(
    "⚠️  TIMESHEET_ADMIN_KEY is not set — using an insecure default. Set it in production."
  );
}

export const timesheetRouter = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

timesheetRouter.get("/staff", (_req, res) => {
  res.json({ staff: getPublicStaff() });
});

timesheetRouter.get("/locations", (_req, res) => {
  res.json({ locations: WORK_LOCATIONS });
});

timesheetRouter.get("/periods", (_req, res) => {
  const periods = listRecentPayPeriods(12).map((p) => ({ key: p.key, label: p.label }));
  res.json({ periods, currentKey: getPayPeriodForDate(new Date()).key });
});

timesheetRouter.get("/status/:staffId", (req, res) => {
  const entry = getOpenEntry(req.params.staffId);
  res.json({ clockedIn: !!entry, entry });
});

timesheetRouter.post(
  "/clock-in",
  asyncHandler(async (req, res) => {
    const { staffId, pin, locationId } = req.body ?? {};
    const entry = await clockIn(staffId, pin, locationId);
    res.status(201).json({ entry });
  })
);

timesheetRouter.post(
  "/clock-out",
  asyncHandler(async (req, res) => {
    const { staffId, pin } = req.body ?? {};
    const entry = await clockOut(staffId, pin);
    res.json({ entry });
  })
);

timesheetRouter.post("/my-entries", (req, res) => {
  const { staffId, pin, period } = req.body ?? {};
  requireValidPin(staffId, pin);
  const payPeriod = period ? getPayPeriodByKey(period) : getPayPeriodForDate(new Date());
  const entries = listEntriesForStaff(staffId).filter((e) => isWithinPeriod(e.clockIn, payPeriod));
  const totalHours = Math.round(entries.reduce((sum, e) => sum + (e.hours ?? 0), 0) * 100) / 100;
  res.json({ period: { key: payPeriod.key, label: payPeriod.label }, entries, totalHours });
});

function requireAdmin(req: Request): void {
  const key = req.header("x-admin-key");
  if (key !== ADMIN_KEY) throw new TimesheetError("Invalid admin key.", 401);
}

timesheetRouter.get("/summary", (req, res) => {
  requireAdmin(req);
  const periodKey = typeof req.query.period === "string" ? req.query.period : undefined;
  const payPeriod = periodKey ? getPayPeriodByKey(periodKey) : getPayPeriodForDate(new Date());
  const entries = listAllEntries().filter((e) => isWithinPeriod(e.clockIn, payPeriod));

  const byStaff = new Map<string, typeof entries>();
  for (const entry of entries) {
    const list = byStaff.get(entry.staffId) ?? [];
    list.push(entry);
    byStaff.set(entry.staffId, list);
  }

  const staffTotals = [...byStaff.entries()]
    .map(([staffId, staffEntries]) => ({
      staffId,
      staffName: getStaffName(staffId),
      totalHours: Math.round(staffEntries.reduce((sum, e) => sum + (e.hours ?? 0), 0) * 100) / 100,
      entries: staffEntries,
    }))
    .sort((a, b) => a.staffName.localeCompare(b.staffName));

  res.json({ period: { key: payPeriod.key, label: payPeriod.label }, staffTotals });
});

timesheetRouter.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof TimesheetError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Unexpected server error." });
});
