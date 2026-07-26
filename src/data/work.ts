/*
 * ─────────────────────────────────────────────────────────────────────────────
 * TODO — REPLACE BEFORE LAUNCH
 *
 * Every image below is licence-free stock, not an Eventive job. Swap `image`
 * for your own photography from these builds.
 *
 * Titles deliberately describe the BUILD (what was rigged, staged, or served)
 * rather than naming a client, so nothing here claims a client relationship
 * you have not agreed to publish. If you add client names, get written sign-off
 * first — and keep `venue` accurate to where the work actually happened.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type WorkCategory = "Corporate" | "Weddings" | "Roora" | "Private";

export interface WorkItem {
  id: string;
  title: string;
  category: WorkCategory;
  venue: string;
  guests: string;
  scope: string;
  image: string;
}

export const WORK_CATEGORIES: WorkCategory[] = ["Corporate", "Weddings", "Roora", "Private"];

export const WORK: WorkItem[] = [
  {
    id: "clear-span-summit",
    title: "Clear-Span Summit Build",
    category: "Corporate",
    venue: "Celebration Centre, Harare",
    guests: "1,200 guests",
    scope: "Line-array audio, staged plenary, 45kVA silent backup, delegate catering.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "glass-marquee-garden",
    title: "Glass Marquee Garden Ceremony",
    category: "Weddings",
    venue: "Wild Geese Lodge, Harare",
    guests: "480 guests",
    scope: "Presidential clear-glass marquee, festoon canopy, silver-service crew.",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "roora-homestead",
    title: "Homestead Roora Setup",
    category: "Roora",
    venue: "Private homestead, Mashonaland",
    guests: "260 guests",
    scope: "Stretch tents, traditional feast service, generator power, marshals.",
    image:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "highlands-retreat",
    title: "Highlands Executive Retreat",
    category: "Corporate",
    venue: "Troutbeck Resort, Nyanga",
    guests: "180 guests",
    scope: "Breakout staging, gobo branding, mobile espresso bar, transport logistics.",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "zambezi-reception",
    title: "Zambezi Destination Reception",
    category: "Weddings",
    venue: "Elephant Hills, Victoria Falls",
    guests: "320 guests",
    scope: "Bedouin stretch tents, intelligent uplighting, LED glow bar, mixologists.",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "bushveld-milestone",
    title: "Bushveld Milestone Celebration",
    category: "Private",
    venue: "Chengeta Safari Lodge, Selous",
    guests: "140 guests",
    scope: "Rustic modular bar, warm fairylight wash, heritage flame-grill menu.",
    image:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "castle-heritage-gala",
    title: "Castle Heritage Gala",
    category: "Private",
    venue: "Nesbitt Castle, Bulawayo",
    guests: "300 guests",
    scope: "Truss rigging, marble-and-brass bar, full technical production crew.",
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=900",
  },
  {
    id: "courtyard-roora",
    title: "Courtyard Roora Reception",
    category: "Roora",
    venue: "Private courtyard, Harare",
    guests: "180 guests",
    scope: "Peg-and-pole marquee, draped ceilings, sadza and slow-roast service.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=900",
  },
];
