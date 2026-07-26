/*
 * Fresh People is the same business as Eventive, trading in South Africa.
 *
 * Everything below is taken from the Fresh People site's own source
 * (github.com/YassinAliYassin/fresh-people-co-za — src/pages/Services.jsx for
 * the four services and their features, components/FAQ.jsx for coverage and
 * staffing turnaround, pages/About.jsx for the founding year). Keep it in step
 * when that site changes; it is one business describing itself twice.
 *
 * The staff figures were settled in the Fresh People repo (branch
 * claude/staff-count-correction): 50 is the active roster, 500+ is the number
 * trained since 2014, many since placed into permanent roles with clients. Both
 * appear below with those meanings — keep them in step with that site.
 */

export interface FreshPeopleGroup {
  id: string;
  title: string;
  blurb: string;
  items: string[];
  /** Deep link to the matching service page on fresh-people.co.za. */
  href: string;
}

const BASE = "https://fresh-people.co.za";

export const FRESH_PEOPLE_GROUPS: FreshPeopleGroup[] = [
  {
    id: "staffing",
    title: "Event Staffing",
    blurb:
      "Waiters, bartenders, baristas, runners, marshals, ushers, hosts, and kitchen support.",
    items: [
      "Professional wait staff",
      "RSA-certified bartenders",
      "Skilled baristas",
      "Event marshals & ushers",
      "Commis chefs & kitchen support",
    ],
    href: `${BASE}/services/hospitality-staff`,
  },
  {
    id: "equipment",
    title: "Equipment & Supply",
    blurb: "Bar stock, glassware, bar tools, and coffee station supplies.",
    items: [
      "Premium bar stock",
      "Crystal & glassware",
      "Professional bar tools",
      "Coffee station setup",
      "Equipment delivery & pickup",
    ],
    href: `${BASE}/services/event-logistics`,
  },
  {
    id: "logistics",
    title: "Logistics & Setup",
    blurb:
      "Call-time planning, table settings, venue setup, breakdown crews, and décor support.",
    items: [
      "Table setting & styling",
      "Décor coordination",
      "Venue layout planning",
      "Setup & breakdown crews",
      "Timeline management",
    ],
    href: `${BASE}/services/event-logistics`,
  },
  {
    id: "management",
    title: "Event Management",
    blurb: "On-site coordination and full event support from briefing to close-out.",
    items: [
      "End-to-end event planning",
      "On-site coordination",
      "Vendor management",
      "Budget planning",
      "Post-event reporting",
    ],
    href: `${BASE}/services/event-coordinators`,
  },
];

/** Each of these is stated on the Fresh People site. Keep them true in both places. */
export const FRESH_PEOPLE_FACTS = [
  { value: "2014", label: "Trading Since" },
  { value: "50", label: "Active Staff" },
  { value: "500+", label: "Trained & Placed" },
  { value: "24–48 hrs", label: "Urgent Requests" },
];

export const FRESH_PEOPLE_COVERAGE =
  "Johannesburg · Randburg · Sandton · Fourways · Midrand · Pretoria";

export const FRESH_PEOPLE_URL = BASE;
