import type { ClockStatus, StaffMember, StaffPeriodTotal, TimeEntry, WorkLocation } from "../types/timesheet";

const BASE = "/api/timesheet";

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body?.error ?? "Something went wrong.");
  }
  return body as T;
}

export function fetchStaff(): Promise<{ staff: StaffMember[] }> {
  return request("/staff");
}

export function fetchLocations(): Promise<{ locations: WorkLocation[] }> {
  return request("/locations");
}

export function fetchPeriods(): Promise<{ periods: { key: string; label: string }[]; currentKey: string }> {
  return request("/periods");
}

export function fetchStatus(staffId: string): Promise<ClockStatus> {
  return request(`/status/${encodeURIComponent(staffId)}`);
}

export function clockIn(staffId: string, pin: string, locationId: string): Promise<{ entry: TimeEntry }> {
  return request("/clock-in", { method: "POST", body: JSON.stringify({ staffId, pin, locationId }) });
}

export function clockOut(staffId: string, pin: string): Promise<{ entry: TimeEntry }> {
  return request("/clock-out", { method: "POST", body: JSON.stringify({ staffId, pin }) });
}

export function fetchMyEntries(
  staffId: string,
  pin: string,
  period?: string
): Promise<{ period: { key: string; label: string }; entries: TimeEntry[]; totalHours: number }> {
  return request("/my-entries", { method: "POST", body: JSON.stringify({ staffId, pin, period }) });
}

export function fetchAdminSummary(
  adminKey: string,
  period?: string
): Promise<{ period: { key: string; label: string }; staffTotals: StaffPeriodTotal[] }> {
  const query = period ? `?period=${encodeURIComponent(period)}` : "";
  return request(`/summary${query}`, { headers: { "x-admin-key": adminKey } });
}
