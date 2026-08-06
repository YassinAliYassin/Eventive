import fs from "fs";
import path from "path";
import crypto from "crypto";
import { STAFF_SEED } from "./timesheetSeed";

export class TimesheetError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

interface StoredStaff {
  id: string;
  name: string;
  role: string;
  pinHash: string;
  pinSalt: string;
}

interface StoredEntry {
  id: string;
  staffId: string;
  locationId: string;
  clockIn: string;
  clockOut: string | null;
  hours: number | null;
}

interface Store {
  staff: StoredStaff[];
  entries: StoredEntry[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "timesheet.json");

function hashPin(pin: string, salt: string): string {
  return crypto.scryptSync(pin, salt, 64).toString("hex");
}

function seedStaff(): StoredStaff[] {
  return STAFF_SEED.map((s) => {
    const pinSalt = crypto.randomBytes(16).toString("hex");
    return { id: s.id, name: s.name, role: s.role, pinSalt, pinHash: hashPin(s.pin, pinSalt) };
  });
}

let cache: Store | null = null;
let writeQueue: Promise<void> = Promise.resolve();

function readFromDisk(): Store {
  if (!fs.existsSync(DATA_FILE)) {
    const fresh: Store = { staff: seedStaff(), entries: [] };
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(fresh, null, 2));
    return fresh;
  }
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw) as Store;

  // Pick up any new roster members added to the seed since the file was created,
  // without disturbing already-recorded entries or existing staff PINs.
  const knownIds = new Set(parsed.staff.map((s) => s.id));
  const missing = STAFF_SEED.filter((s) => !knownIds.has(s.id));
  if (missing.length > 0) {
    for (const s of missing) {
      const pinSalt = crypto.randomBytes(16).toString("hex");
      parsed.staff.push({ id: s.id, name: s.name, role: s.role, pinSalt, pinHash: hashPin(s.pin, pinSalt) });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(parsed, null, 2));
  }
  return parsed;
}

function getStore(): Store {
  if (!cache) cache = readFromDisk();
  return cache;
}

function persist(): Promise<void> {
  const store = getStore();
  writeQueue = writeQueue.then(
    () =>
      new Promise<void>((resolve, reject) => {
        fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), (err) => (err ? reject(err) : resolve()));
      })
  );
  return writeQueue;
}

export function getPublicStaff() {
  return getStore().staff.map((s) => ({ id: s.id, name: s.name, role: s.role }));
}

function findStaff(staffId: string): StoredStaff {
  const staff = getStore().staff.find((s) => s.id === staffId);
  if (!staff) throw new TimesheetError("Unknown staff member.", 404);
  return staff;
}

function verifyPin(staff: StoredStaff, pin: string): boolean {
  if (!pin || typeof pin !== "string") return false;
  const attempt = hashPin(pin, staff.pinSalt);
  const a = Buffer.from(attempt, "hex");
  const b = Buffer.from(staff.pinHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function requireValidPin(staffId: string, pin: string): void {
  const staff = findStaff(staffId);
  if (!verifyPin(staff, pin)) throw new TimesheetError("Incorrect PIN.", 401);
}

export function getOpenEntry(staffId: string): StoredEntry | null {
  const store = getStore();
  return store.entries.find((e) => e.staffId === staffId && e.clockOut === null) ?? null;
}

export async function clockIn(staffId: string, pin: string, locationId: string): Promise<StoredEntry> {
  findStaff(staffId);
  requireValidPin(staffId, pin);
  if (!locationId) throw new TimesheetError("Select a location to sign in.", 400);
  if (getOpenEntry(staffId)) throw new TimesheetError("Already signed in — sign out first.", 409);

  const entry: StoredEntry = {
    id: crypto.randomUUID(),
    staffId,
    locationId,
    clockIn: new Date().toISOString(),
    clockOut: null,
    hours: null,
  };
  getStore().entries.push(entry);
  await persist();
  return entry;
}

export async function clockOut(staffId: string, pin: string): Promise<StoredEntry> {
  findStaff(staffId);
  requireValidPin(staffId, pin);
  const entry = getOpenEntry(staffId);
  if (!entry) throw new TimesheetError("Not currently signed in.", 409);

  entry.clockOut = new Date().toISOString();
  const ms = new Date(entry.clockOut).getTime() - new Date(entry.clockIn).getTime();
  entry.hours = Math.round((ms / 3_600_000) * 100) / 100;
  await persist();
  return entry;
}

export function listEntriesForStaff(staffId: string): StoredEntry[] {
  return getStore()
    .entries.filter((e) => e.staffId === staffId)
    .sort((a, b) => b.clockIn.localeCompare(a.clockIn));
}

export function listAllEntries(): StoredEntry[] {
  return [...getStore().entries].sort((a, b) => b.clockIn.localeCompare(a.clockIn));
}

export function getStaffName(staffId: string): string {
  return getStore().staff.find((s) => s.id === staffId)?.name ?? staffId;
}
