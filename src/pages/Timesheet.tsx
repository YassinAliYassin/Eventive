import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, LogIn, LogOut, MapPin } from "lucide-react";
import type { ClockStatus, StaffMember, TimeEntry, WorkLocation } from "../types/timesheet";
import { ApiError, clockIn, clockOut, fetchLocations, fetchMyEntries, fetchPeriods, fetchStaff, fetchStatus } from "../lib/timesheetApi";

const FIELD_CLASS =
  "w-full bg-white/70 border border-line rounded-2xl px-4 py-3 text-paper text-[13.5px] placeholder:text-ink-dim/70 focus:outline-none focus:border-azure focus:ring-2 focus:ring-azure/20 transition-all";

const BUTTON_CLASS =
  "font-mono text-xs tracking-[0.08em] uppercase py-3.5 px-6 rounded-full border-none cursor-pointer transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-ZW", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZW", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Timesheet() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [periods, setPeriods] = useState<{ key: string; label: string }[]>([]);

  const [staffId, setStaffId] = useState("");
  const [pin, setPin] = useState("");
  const [locationId, setLocationId] = useState("");
  const [period, setPeriod] = useState("");

  const [status, setStatus] = useState<ClockStatus | null>(null);
  const [entries, setEntries] = useState<TimeEntry[] | null>(null);
  const [totalHours, setTotalHours] = useState<number | null>(null);

  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchStaff().then((r) => setStaffList(r.staff)).catch(() => setMessage({ kind: "error", text: "Couldn't load staff list." }));
    fetchLocations().then((r) => setLocations(r.locations)).catch(() => undefined);
    fetchPeriods().then((r) => {
      setPeriods(r.periods);
      setPeriod(r.currentKey);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    setStatus(null);
    setEntries(null);
    setTotalHours(null);
    setMessage(null);
    if (!staffId) return;
    fetchStatus(staffId).then(setStatus).catch(() => undefined);
  }, [staffId]);

  const locationName = useMemo(
    () => (id: string) => locations.find((l) => l.id === id)?.name ?? id,
    [locations]
  );

  async function handleClockIn() {
    if (!staffId || !pin || !locationId) {
      setMessage({ kind: "error", text: "Choose your name, PIN, and site first." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await clockIn(staffId, pin, locationId);
      const next = await fetchStatus(staffId);
      setStatus(next);
      setMessage({ kind: "success", text: "Signed in. Have a great shift!" });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof ApiError ? err.message : "Sign in failed." });
    } finally {
      setBusy(false);
    }
  }

  async function handleClockOut() {
    if (!staffId || !pin) {
      setMessage({ kind: "error", text: "Enter your PIN to sign out." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await clockOut(staffId, pin);
      const next = await fetchStatus(staffId);
      setStatus(next);
      setMessage({ kind: "success", text: "Signed out. Hours recorded." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof ApiError ? err.message : "Sign out failed." });
    } finally {
      setBusy(false);
    }
  }

  async function handleViewEntries() {
    if (!staffId || !pin) {
      setMessage({ kind: "error", text: "Enter your PIN to view your timesheet." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetchMyEntries(staffId, pin, period);
      setEntries(res.entries);
      setTotalHours(res.totalHours);
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof ApiError ? err.message : "Couldn't load timesheet." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans py-16 px-4">
      <div className="max-w-[640px] mx-auto">
        <Link to="/" className="font-serif italic text-[20px] text-paper inline-block mb-8">
          ← Eventive
        </Link>

        <div className="glass-strong rounded-[32px] p-8 sm:p-9 mb-6">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-clay-bright mb-2">
            Staff Portal
          </div>
          <h1 className="font-serif font-medium text-paper text-[28px] sm:text-[32px] mb-6">Time Sheet</h1>

          <div className="mb-5">
            <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim mb-2">
              Your Name
            </label>
            <select value={staffId} onChange={(e) => setStaffId(e.target.value)} className={`${FIELD_CLASS} cursor-pointer`}>
              <option value="">Select your name…</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.role}
                </option>
              ))}
            </select>
          </div>

          {staffId && (
            <>
              <div className="mb-5">
                <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim mb-2">
                  PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className={`${FIELD_CLASS} tracking-[0.4em]`}
                />
              </div>

              {status?.clockedIn && status.entry ? (
                <div className="mb-6 rounded-2xl bg-azure-soft/60 border border-azure/20 px-5 py-4">
                  <div className="flex items-center gap-2 text-azure-bright font-mono text-[11px] tracking-[0.08em] uppercase mb-1">
                    <Clock className="w-3.5 h-3.5" /> Currently signed in
                  </div>
                  <div className="text-paper-dim text-[14px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-ink-dim" />
                    {locationName(status.entry.locationId)} · since {formatTime(status.entry.clockIn)}
                  </div>
                </div>
              ) : (
                <div className="mb-5">
                  <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim mb-2">
                    Site
                  </label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className={`${FIELD_CLASS} cursor-pointer`}
                  >
                    <option value="">Select the site you're working at…</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.town})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {message && (
                <div
                  className={`mb-5 rounded-xl px-4 py-3 text-[13px] ${
                    message.kind === "error" ? "bg-clay-soft text-clay-bright" : "bg-azure-soft text-azure-bright"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-3">
                {status?.clockedIn ? (
                  <button
                    onClick={handleClockOut}
                    disabled={busy}
                    className={`${BUTTON_CLASS} bg-clay text-white hover:bg-clay-bright shadow-clay/20 flex-1`}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                ) : (
                  <button
                    onClick={handleClockIn}
                    disabled={busy}
                    className={`${BUTTON_CLASS} bg-azure text-white hover:bg-azure-bright shadow-azure/20 flex-1`}
                  >
                    <LogIn className="w-4 h-4" /> Sign In
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {staffId && pin.length === 4 && (
          <div className="glass rounded-[32px] p-8 sm:p-9">
            <h2 className="font-serif font-medium text-paper text-[22px] mb-1">My Hours</h2>
            <p className="text-[12.5px] text-ink-dim mb-5">Pay periods run the 26th to the 25th.</p>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className={`${FIELD_CLASS} cursor-pointer`}>
                {periods.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleViewEntries}
                disabled={busy}
                className={`${BUTTON_CLASS} bg-paper text-white hover:bg-paper-dim shadow-none shrink-0`}
              >
                View
              </button>
            </div>

            {entries && (
              <>
                <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-line-soft">
                  <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim">Total Hours</span>
                  <span className="font-serif text-[26px] text-paper">{totalHours}</span>
                </div>
                {entries.length === 0 ? (
                  <p className="text-[13px] text-ink-dim">No entries in this pay period yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {entries.map((e) => (
                      <div key={e.id} className="flex items-center justify-between text-[13px] gap-3">
                        <div className="min-w-0">
                          <div className="text-paper-dim font-medium">{formatDate(e.clockIn)}</div>
                          <div className="text-ink-dim text-[11.5px] truncate">{locationName(e.locationId)}</div>
                        </div>
                        <div className="text-right shrink-0 font-mono text-[12px] text-ink">
                          {formatTime(e.clockIn)} – {e.clockOut ? formatTime(e.clockOut) : "…"}
                          <div className="text-azure-bright">{e.hours ?? "—"} h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
