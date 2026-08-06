/**
 * Pay periods run from the 26th of one month through the 25th of the next
 * (e.g. 26 Jul – 25 Aug), rather than following calendar months.
 */

export interface PayPeriod {
  /** Stable sort/lookup key, e.g. "2026-07" — the month the period starts in. */
  key: string;
  start: Date;
  end: Date;
  label: string;
}

const MONTH_LABEL = new Intl.DateTimeFormat("en-US", { month: "short" });

function startOfDay(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day, 0, 0, 0, 0);
}

function endOfDay(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day, 23, 59, 59, 999);
}

function periodKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function formatLabel(start: Date, end: Date): string {
  const startStr = `${start.getDate()} ${MONTH_LABEL.format(start)}`;
  const endStr = `${end.getDate()} ${MONTH_LABEL.format(end)} ${end.getFullYear()}`;
  return `${startStr} – ${endStr}`;
}

/** Returns the 26th–25th pay period that contains the given date. */
export function getPayPeriodForDate(date: Date): PayPeriod {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();

  let startYear = year;
  let startMonth = monthIndex;

  if (day < 26) {
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }

  let endYear = startYear;
  let endMonth = startMonth + 1;
  if (endMonth > 11) {
    endMonth = 0;
    endYear += 1;
  }

  const start = startOfDay(startYear, startMonth, 26);
  const end = endOfDay(endYear, endMonth, 25);

  return {
    key: periodKey(startYear, startMonth),
    start,
    end,
    label: formatLabel(start, end),
  };
}

/** Looks up a pay period by its key ("YYYY-MM" of the start month). */
export function getPayPeriodByKey(key: string): PayPeriod {
  const [yearStr, monthStr] = key.split("-");
  const startYear = Number(yearStr);
  const startMonth = Number(monthStr) - 1;
  return getPayPeriodForDate(startOfDay(startYear, startMonth, 26));
}

/** Most recent `count` pay periods, newest first (defaults to including the current one). */
export function listRecentPayPeriods(count: number, from: Date = new Date()): PayPeriod[] {
  const periods: PayPeriod[] = [];
  let cursor = getPayPeriodForDate(from);
  for (let i = 0; i < count; i++) {
    periods.push(cursor);
    const prevAnchor = new Date(cursor.start);
    prevAnchor.setDate(prevAnchor.getDate() - 1);
    cursor = getPayPeriodForDate(prevAnchor);
  }
  return periods;
}

export function isWithinPeriod(timestamp: string, period: PayPeriod): boolean {
  const t = new Date(timestamp).getTime();
  return t >= period.start.getTime() && t <= period.end.getTime();
}
