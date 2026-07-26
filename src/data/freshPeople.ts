/*
 * Fresh People is the same business as Eventive, trading in South Africa.
 *
 * Everything below is taken from the Fresh People site's own source
 * (github.com/YassinAliYassin/fresh-people-co-za — pages/ServiceDetail.jsx for
 * the four services and their breakdowns, pages/Services.jsx for the card
 * blurbs, components/FAQ.jsx for coverage and staffing turnaround,
 * pages/About.jsx for the founding year). Keep it in step when that site
 * changes; it is one business describing itself twice.
 *
 * The staff figures were settled in the Fresh People repo (branch
 * claude/staff-count-correction): 50 is the active roster, 500+ is the number
 * trained since 2014, many since placed into permanent roles with clients.
 */

export interface FreshPeopleDetail {
  title: string;
  desc: string;
  highlights: string[];
}

export interface FreshPeopleGroup {
  id: string;
  title: string;
  /** One-line positioning, shown under the title in the dialog. */
  subtitle: string;
  /** Short line for the card face. */
  blurb: string;
  /** Fuller opening paragraph for the dialog. */
  hero: string;
  /** The breakdown a visitor sees on opening the card. */
  detail: FreshPeopleDetail[];
  /** Why this service, in the words of the Fresh People site. */
  whyChoose: string[];
}

export const FRESH_PEOPLE_GROUPS: FreshPeopleGroup[] = [
  {
    id: "staffing",
    title: "Event Staffing",
    subtitle: "Your event, perfectly staffed",
    blurb: "Waiters, bartenders, baristas, marshals, and kitchen support.",
    hero: "From craft cocktail bars to high-end galas — we supply the human engine that drives your event.",
    detail: [
      {
        title: "Waiters & Waitresses",
        desc: "RSA-certified professionals trained in fine dining etiquette, wine service, and guest relations.",
        highlights: ["Uniformed & trained", "Wine service certified", "Multi-language options", "Full table service"],
      },
      {
        title: "Bartenders",
        desc: "Mixologists and speed bartenders who turn your bar into an experience. Flair optional, skill guaranteed.",
        highlights: ["RSA certified", "Cocktail specialists", "High-volume capable", "Inventory management"],
      },
      {
        title: "Baristas",
        desc: "Third-wave coffee professionals with their own gear, running espresso stations and latte art on site.",
        highlights: ["Own equipment", "Latte art skilled", "Espresso mastery", "Event-grade machines"],
      },
      {
        title: "Event Marshals & Security",
        desc: "Crowd control with a smile. Professional, assertive when needed, invisible when not.",
        highlights: ["PSIRA registered", "Crowd management", "Access control", "First aid trained"],
      },
      {
        title: "Commis Chefs & Kitchen",
        desc: "Back-of-house support who keep the plates flowing and the kitchen running to time.",
        highlights: ["Professional chefs", "Plating standards", "Dietary accommodation", "HACCP trained"],
      },
    ],
    whyChoose: [
      "Every staff member vetted & trained",
      "Uniforms provided, or matched to your brand",
      "Replacements available within 2 hours",
      "10+ years staffing Johannesburg events",
    ],
  },
  {
    id: "equipment",
    title: "Equipment & Supply",
    subtitle: "Everything but the venue",
    blurb: "Bar stock, glassware, bar tools, and coffee station supplies.",
    hero: "Premium bar stock, crystal glassware, professional tools — delivered, set up, and collected. You focus on the guests.",
    detail: [
      {
        title: "Bar Stock & Beverages",
        desc: "Curated wine lists, craft beers, premium spirits, and mixers, from a licensed supplier.",
        highlights: ["Premium selections", "Volume discounts", "Cold-chain delivery", "Licensed supplier"],
      },
      {
        title: "Glassware & Table Setting",
        desc: "Crystal glasses, charger plates, cutlery, and linens, in the finish your styling calls for.",
        highlights: ["Crystal & glass options", "Linen in every colour", "Charger plates", "Porcelain & ceramics"],
      },
      {
        title: "Bar Equipment",
        desc: "From portable bars to ice machines, blenders to beer taps — the bar arrives with the crew.",
        highlights: ["Portable bar setups", "Ice machines", "Blenders & equipment", "Beer & wine chillers"],
      },
      {
        title: "Coffee Station Setup",
        desc: "Full coffee bars with baristas, beans, cups, and machines, for café-quality service on site.",
        highlights: ["Espresso machines", "Premium beans", "Branded cups", "Full station setup"],
      },
    ],
    whyChoose: [
      "Delivery & collection included",
      "Backup equipment on standby",
      "Setup & breakdown crews",
      "One invoice for staff and gear",
    ],
  },
  {
    id: "logistics",
    title: "Logistics & Setup",
    subtitle: "Precision behind the scenes",
    blurb: "Venue layout, décor, setup and breakdown crews, timeline management.",
    hero: "Venue layouts, décor coordination, setup and breakdown — we handle the chaos so the event runs to time.",
    detail: [
      {
        title: "Venue Layout & Planning",
        desc: "Floor plans, traffic flow analysis, and spatial optimisation, so the room works as hard as it can.",
        highlights: ["Floor plan design", "Traffic flow analysis", "Capacity optimisation", "Accessibility compliance"],
      },
      {
        title: "Décor & Styling",
        desc: "Floral arrangements, lighting design, installations, and themed décor.",
        highlights: ["Floral arrangements", "Lighting design", "Themed installations", "Backdrop & staging"],
      },
      {
        title: "Setup & Breakdown",
        desc: "Crews that arrive early, work fast, and are gone before guests arrive — then return to pack it all up.",
        highlights: ["Early setup crews", "Fast & efficient", "Post-event breakdown", "Waste removal"],
      },
      {
        title: "Timeline Management",
        desc: "Minute-by-minute schedules, vendor coordination, and real-time adjustments on the day.",
        highlights: ["Minute-by-minute plans", "Vendor coordination", "Real-time adjustments", "Emergency protocols"],
      },
    ],
    whyChoose: [
      "10+ years event logistics",
      "Real-time problem solving",
      "Established vendor network",
      "Insured & bonded crews",
    ],
  },
  {
    id: "management",
    title: "Event Management",
    subtitle: "Your event, our command",
    blurb: "Planning, on-site coordination, vendor management, post-event reporting.",
    hero: "End-to-end event planning, on-site coordination, and vendor management — hand over the vision and we run it.",
    detail: [
      {
        title: "Event Planning",
        desc: "Concept to execution: budgets, timelines, vendor selection, and creative direction.",
        highlights: ["Budget planning", "Concept development", "Vendor sourcing", "Timeline creation"],
      },
      {
        title: "On-Site Coordination",
        desc: "A dedicated event manager who runs the day, handles problems, and keeps every detail on track.",
        highlights: ["Dedicated manager", "Crisis management", "Real-time coordination", "Guest services"],
      },
      {
        title: "Vendor Management",
        desc: "We negotiate with caterers, AV teams, venues, and entertainers, and hold them to the brief.",
        highlights: ["Contract negotiation", "Quality assurance", "Payment coordination", "Performance tracking"],
      },
      {
        title: "Post-Event Services",
        desc: "Feedback collection, vendor payments, damage reports, and what to change next time.",
        highlights: ["Guest feedback", "Vendor reviews", "Financial reconciliation", "Improvement reports"],
      },
    ],
    whyChoose: [
      "Single point of contact",
      "Budget optimisation",
      "Crisis management trained",
      "Reporting after every event",
    ],
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

export const FRESH_PEOPLE_URL = "https://fresh-people.co.za";
