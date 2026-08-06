/**
 * Server-only staff roster. PINs here are only ever used once, to seed the
 * hashed PIN stored in data/timesheet.json — they are never sent to the client.
 * Edit this list to add/remove staff, then restart the server.
 */
export interface StaffSeed {
  id: string;
  name: string;
  role: string;
  pin: string;
}

export const STAFF_SEED: StaffSeed[] = [
  { id: "tinashe-moyo", name: "Tinashe Moyo", role: "Site Supervisor", pin: "1024" },
  { id: "rutendo-chikwava", name: "Rutendo Chikwava", role: "Events Crew", pin: "2048" },
  { id: "farai-ndlovu", name: "Farai Ndlovu", role: "Events Crew", pin: "3072" },
  { id: "chiedza-mutasa", name: "Chiedza Mutasa", role: "Hospitality Lead", pin: "4096" },
  { id: "tafadzwa-sibanda", name: "Tafadzwa Sibanda", role: "Logistics", pin: "5120" },
];
