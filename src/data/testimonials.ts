/*
 * ─────────────────────────────────────────────────────────────────────────────
 * TODO — PLACEHOLDER TESTIMONIALS. DO NOT LAUNCH AS-IS.
 *
 * None of these are real. Every `name` is literally "Client Name" so that if
 * this ships by accident it reads as an unfilled template rather than as a
 * genuine review — do not "tidy" that up by inventing a person.
 *
 * To go live: replace each entry with a quote you have WRITTEN PERMISSION to
 * publish, attributed to a real person who gave it. Publishing invented
 * testimonials as real is a misrepresentation, and in many markets it is
 * actionable false advertising. If you have no permissioned quotes yet, delete
 * this file and remove <Testimonials /> from App.tsx — an absent section costs
 * you far less than a fabricated one.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "placeholder-1",
    quote:
      "Placeholder quote — replace with a permissioned client testimonial about the build, the crew, and how the day actually ran.",
    name: "Client Name",
    role: "Corporate Summit · Harare",
  },
  {
    id: "placeholder-2",
    quote:
      "Placeholder quote — replace with a permissioned client testimonial covering setup, timing, and the standard of service on site.",
    name: "Client Name",
    role: "Garden Wedding · Nyanga",
  },
  {
    id: "placeholder-3",
    quote:
      "Placeholder quote — replace with a permissioned client testimonial about the equipment, the power backup, or the catering.",
    name: "Client Name",
    role: "Roora Celebration · Bulawayo",
  },
];
