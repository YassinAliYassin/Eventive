/*
 * ─────────────────────────────────────────────────────────────────────────────
 * BUILD FORMATS — not a portfolio.
 *
 * Eventive is being set up, so it has no completed jobs to show. Everything here
 * describes a CONFIGURATION the company is equipped to deliver: what gets rigged,
 * the kind of venue it suits, and the capacity it is specified for. Nothing
 * claims an event that has happened.
 *
 * TODO — every image is licence-free stock. Replace `image` with your own
 * photography as real builds are completed.
 *
 * If this later becomes a genuine portfolio, change the section copy in
 * Work.tsx too — the headings there are deliberately written in the language of
 * capability ("what we are set up to build"), not of past work.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type WorkCategory = "Corporate" | "Weddings" | "Roora" | "Private";

export interface WorkItem {
  id: string;
  title: string;
  category: WorkCategory;
  /** The kind of setting this configuration is designed around. */
  suitedTo: string;
  /** Capacity the format is specified for — an upper bound, not an attendance. */
  capacity: string;
  scope: string;
  image: string;
}

export const WORK_CATEGORIES: WorkCategory[] = ["Corporate", "Weddings", "Roora", "Private"];

export const WORK: WorkItem[] = [
  {
    id: "clear-span-summit",
    title: "Clear-Span Summit Build",
    category: "Corporate",
    suitedTo: "Celebration Centre, Harare",
    capacity: "Up to 1,200 guests",
    scope: "Line-array audio, staged plenary, 45kVA silent backup, delegate catering.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "glass-marquee-garden",
    title: "Glass Marquee Garden Ceremony",
    category: "Weddings",
    suitedTo: "Wild Geese Lodge, Harare",
    capacity: "Up to 480 guests",
    scope: "Presidential clear-glass marquee, festoon canopy, silver-service crew.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "roora-homestead",
    title: "Homestead Roora Setup",
    category: "Roora",
    suitedTo: "Private homestead, Mashonaland",
    capacity: "Up to 260 guests",
    scope: "Stretch tents, traditional feast service, generator power, marshals.",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "highlands-retreat",
    title: "Highlands Executive Retreat",
    category: "Corporate",
    suitedTo: "Troutbeck Resort, Nyanga",
    capacity: "Up to 180 guests",
    scope: "Breakout staging, gobo branding, mobile espresso bar, transport logistics.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "zambezi-reception",
    title: "Zambezi Destination Reception",
    category: "Weddings",
    suitedTo: "Elephant Hills, Victoria Falls",
    capacity: "Up to 320 guests",
    scope: "Bedouin stretch tents, intelligent uplighting, LED glow bar, mixologists.",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "bushveld-milestone",
    title: "Bushveld Milestone Celebration",
    category: "Private",
    suitedTo: "Chengeta Safari Lodge, Selous",
    capacity: "Up to 140 guests",
    scope: "Rustic modular bar, warm fairylight wash, heritage flame-grill menu.",
    image:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "castle-heritage-gala",
    title: "Castle Heritage Gala",
    category: "Private",
    suitedTo: "Nesbitt Castle, Bulawayo",
    capacity: "Up to 300 guests",
    scope: "Truss rigging, marble-and-brass bar, full technical production crew.",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "courtyard-roora",
    title: "Courtyard Roora Reception",
    category: "Roora",
    suitedTo: "Private courtyard, Harare",
    capacity: "Up to 180 guests",
    scope: "Peg-and-pole marquee, draped ceilings, sadza and slow-roast service.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=900",
  },
];
