export interface StaffMember {
  id: string;
  name: string;
  role: string;
}

export interface WorkLocation {
  id: string;
  name: string;
  town: string;
}

export interface TimeEntry {
  id: string;
  staffId: string;
  locationId: string;
  clockIn: string;
  clockOut: string | null;
  /** Populated once clockOut is set. */
  hours: number | null;
}

export interface ClockStatus {
  clockedIn: boolean;
  entry: TimeEntry | null;
}

export interface PayPeriodSummary {
  key: string;
  label: string;
  totalHours: number;
  entries: TimeEntry[];
}

export interface StaffPeriodTotal {
  staffId: string;
  staffName: string;
  totalHours: number;
  entries: TimeEntry[];
}
