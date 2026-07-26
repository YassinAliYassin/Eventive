/*
 * ─────────────────────────────────────────────────────────────────────────────
 * TODO — CONFIRM WITH FRESH PEOPLE BEFORE LAUNCH.
 *
 * This describes a partner company's offering, and it was assembled from public
 * search results, NOT from fresh-people.co.za directly — that domain was
 * unreachable from the build environment, so nothing here has been read at
 * source. Publishing another company's service list inaccurately is their
 * problem as much as yours.
 *
 * Have someone at Fresh People confirm every line, and check the coverage,
 * response, and deployment claims at the bottom especially — those are
 * commitments, and they are the easiest to get wrong.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface FreshPeopleGroup {
  id: string;
  title: string;
  blurb: string;
  items: string[];
}

export const FRESH_PEOPLE_GROUPS: FreshPeopleGroup[] = [
  {
    id: "talent",
    title: "Talent & Staffing",
    blurb:
      "Vetted, trained crews placed on brand activations, functions, and corporate events across Gauteng.",
    items: [
      "Brand ambassadors",
      "Bartenders and mixologists",
      "Waitstaff and hospitality crew",
      "Coffee baristas",
      "Events marshals",
      "Event security",
    ],
  },
  {
    id: "support",
    title: "Event Support & Equipment",
    blurb:
      "The consumables and hardware that keep a bar and a service line running, supplied with the crew.",
    items: [
      "Bar stock supply",
      "Drinks glassware",
      "Bar equipment",
      "Event table set-up",
      "Event decoration",
      "Coffee machines, coffees and teas",
      "Cups — ceramic or disposable",
    ],
  },
  {
    id: "management",
    title: "Planning & Management",
    blurb:
      "End-to-end event planning and on-the-day management, for clients who want the whole function handled.",
    items: [
      "Event planning",
      "Event management",
      "On-site coordination",
    ],
  },
];

/** Headline facts shown as a strip. Each one is a commitment — verify before launch. */
export const FRESH_PEOPLE_FACTS = [
  { value: "RSA-certified", label: "Hospitality Staff" },
  { value: "24 hrs", label: "Typical Response" },
  { value: "48–72 hrs", label: "Talent Deployment" },
];

export const FRESH_PEOPLE_COVERAGE =
  "Johannesburg · Sandton · Randburg · Rosebank · Fourways";

export const FRESH_PEOPLE_URL = "https://fresh-people.co.za";
