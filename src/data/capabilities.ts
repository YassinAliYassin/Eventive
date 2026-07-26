/*
 * The single source of truth for what Eventive actually owns and where it
 * operates. The planner endpoint feeds this to the model as grounding so it can
 * only ever propose real inventory — an ungrounded model will happily invent
 * equipment the business does not have, and a visitor would read that as a
 * commitment.
 *
 * Keep this in sync with the Services and About sections. If the fleet changes,
 * change it here.
 */

export const COVERAGE = [
  "Harare",
  "Bulawayo",
  "Victoria Falls",
  "Nyanga",
  "Selous",
] as const;

export const STRUCTURES = [
  "Presidential clear-glass marquee (aluminium frame, glass wall panels)",
  "Sandy Bedouin stretch tents (wind-tested)",
  "Premium white peg-and-pole marquee (high peak, draped ceilings)",
  "Staging, skirting, and aluminium truss rigging towers",
];

export const TECHNICAL = [
  "Line-array concert sound for 100–1,500 guests, with professional mixing consoles",
  "Intelligent wash and uplighting, spotlights, warm fairylights",
  "Silent diesel generators, 10kVA–45kVA, for full load-shedding bypass",
  "Truss and gobo projectors for custom corporate or bridal monograms",
];

export const HOSPITALITY = [
  "Luxury mobile coffee bar with dual-boiler espresso machines and certified baristas",
  "Rustic wooden modular bar (mahogany, under-counter shelving, warm LED)",
  "LED glow bar structure, programmable to brand colours",
  "Gold-brass and marble bar for presidential-tier gatherings",
];

export const CATERING = [
  "Zim heritage feast — flame-grilled boerewors and choma, traditional sadza, slow-roasted meats",
  "Elite international buffet — prime roasts, salads, desserts",
  "Silver-service wait staff trained in high-tier protocol",
  "Mixologists and crowd-safety marshals",
];

/** Capacity envelope the sound and staging inventory is specified for. */
export const CAPACITY = { min: 100, max: 1500 } as const;

/** Typical build cadence, mirrored from the run-of-show manifests. */
export const BUILD_CADENCE = [
  "Structure assembly typically begins two days out (D-2)",
  "Lighting and sound tuning the day before (D-1)",
  "Event morning is styling and final checks, not construction",
];

/** Flattened brief handed to the model. Plain text keeps the prompt legible. */
export function capabilitySheet(): string {
  const section = (title: string, items: readonly string[]) =>
    `${title}:\n${items.map((i) => `  - ${i}`).join("\n")}`;

  return [
    section("Coverage (owned transport and rigging routes)", COVERAGE),
    section("Structures", STRUCTURES),
    section("Technical production", TECHNICAL),
    section("Bars and hospitality", HOSPITALITY),
    section("Catering and staffing", CATERING),
    section("Build cadence", BUILD_CADENCE),
    `Guest capacity: ${CAPACITY.min}–${CAPACITY.max} guests.`,
    "All inventory is owned and operated by Eventive. There are no sub-hires.",
  ].join("\n\n");
}
