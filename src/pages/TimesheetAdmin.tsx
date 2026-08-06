import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import type { StaffPeriodTotal, WorkLocation } from "../types/timesheet";
import { ApiError, fetchAdminSummary, fetchLocations, fetchPeriods } from "../lib/timesheetApi";

const FIELD_CLASS =
  "w-full bg-white/70 border border-line rounded-2xl px-4 py-3 text-paper text-[13.5px] placeholder:text-ink-dim/70 focus:outline-none focus:border-azure focus:ring-2 focus:ring-azure/20 transition-all";

const BUTTON_CLASS =
  "font-mono text-xs tracking-[0.08em] uppercase py-3.5 px-6 rounded-full border-none cursor-pointer transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-ZW", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function toCsv(periodLabel: string, staffTotals: StaffPeriodTotal[], locations: WorkLocation[]): string {
  const locationName = (id: string) => locations.find((l) => l.id === id)?.name ?? id;
  const rows = [["Pay Period", periodLabel], [], ["Staff", "Date", "Site", "Clock In", "Clock Out", "Hours"]];
  for (const staff of staffTotals) {
    for (const entry of staff.entries) {
      rows.push([
        staff.staffName,
        new Date(entry.clockIn).toLocaleDateString("en-ZW"),
        locationName(entry.locationId),
        new Date(entry.clockIn).toLocaleTimeString("en-ZW"),
        entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString("en-ZW") : "",
        String(entry.hours ?? ""),
      ]);
    }
    rows.push(["", "", "", "", "Total", String(staff.totalHours)]);
  }
  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
}

export default function TimesheetAdmin() {
  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [periods, setPeriods] = useState<{ key: string; label: string }[]>([]);
  const [period, setPeriod] = useState("");
  const [locations, setLocations] = useState<WorkLocation[]>([]);

  const [summary, setSummary] = useState<{ period: { key: string; label: string }; staffTotals: StaffPeriodTotal[] } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchPeriods().then((r) => {
      setPeriods(r.periods);
      setPeriod(r.currentKey);
    }).catch(() => undefined);
    fetchLocations().then((r) => setLocations(r.locations)).catch(() => undefined);
  }, []);

  async function loadSummary(key: string, adminKeyOverride?: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetchAdminSummary(adminKeyOverride ?? adminKey, key);
      setSummary(res);
      setAuthed(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load summary.");
      setAuthed(false);
    } finally {
      setBusy(false);
    }
  }

  function handleUnlock() {
    if (!adminKey) return;
    loadSummary(period);
  }

  function handlePeriodChange(key: string) {
    setPeriod(key);
    if (authed) loadSummary(key);
  }

  function handleExport() {
    if (!summary) return;
    const csv = toCsv(summary.period.label, summary.staffTotals, locations);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timesheet-${summary.period.key}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const grandTotal = summary?.staffTotals.reduce((sum, s) => sum + s.totalHours, 0) ?? 0;

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans py-16 px-4">
      <div className="max-w-[820px] mx-auto">
        <Link to="/timesheet" className="font-serif italic text-[20px] text-paper inline-block mb-8">
          ← Time Sheet
        </Link>

        <div className="glass-strong rounded-[32px] p-8 sm:p-9 mb-6">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-clay-bright mb-2">
            Admin
          </div>
          <h1 className="font-serif font-medium text-paper text-[28px] sm:text-[32px] mb-6">Timesheet Summary</h1>

          {!authed && (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                placeholder="Admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                className={FIELD_CLASS}
              />
              <button onClick={handleUnlock} disabled={busy} className={`${BUTTON_CLASS} bg-azure text-white hover:bg-azure-bright shadow-azure/20 shrink-0`}>
                Unlock
              </button>
            </div>
          )}

          {error && <div className="mt-4 rounded-xl px-4 py-3 text-[13px] bg-clay-soft text-clay-bright">{error}</div>}
        </div>

        {authed && summary && (
          <div className="glass rounded-[32px] p-8 sm:p-9">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <select value={period} onChange={(e) => handlePeriodChange(e.target.value)} className={`${FIELD_CLASS} cursor-pointer`}>
                {periods.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
              <button onClick={handleExport} className={`${BUTTON_CLASS} bg-paper text-white hover:bg-paper-dim shadow-none shrink-0`}>
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>

            <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-line-soft">
              <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim">
                {summary.period.label} · All Staff
              </span>
              <span className="font-serif text-[26px] text-paper">{Math.round(grandTotal * 100) / 100} h</span>
            </div>

            {summary.staffTotals.length === 0 ? (
              <p className="text-[13px] text-ink-dim">No entries in this pay period.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {summary.staffTotals.map((staff) => (
                  <div key={staff.staffId}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="font-medium text-paper text-[14.5px]">{staff.staffName}</span>
                      <span className="font-mono text-[12px] text-azure-bright">{staff.totalHours} h</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {staff.entries.map((e) => (
                        <div key={e.id} className="flex items-center justify-between text-[12px] text-ink-dim">
                          <span>{locations.find((l) => l.id === e.locationId)?.name ?? e.locationId}</span>
                          <span className="font-mono">
                            {formatDateTime(e.clockIn)} – {e.clockOut ? formatDateTime(e.clockOut) : "in progress"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
