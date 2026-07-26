/*
 * No `image` field, deliberately. Photography of these venues belongs to the
 * venues (and to the photographers who shot it) — hotlinking it from their sites
 * used their bandwidth and published their work without a licence. The cards are
 * typographic instead. Do not add images back without written permission for
 * each one.
 */
export interface Venue {
  id: string;
  name: string;
  location: string;
  description: string;
  capacity: string;
}

export const VENUES: Venue[] = [
  {
    id: "celebration-centre",
    name: "Celebration Centre",
    location: "Harare",
    description:
      "Zimbabwe's premier indoor auditorium and world-class summit venue in Borrowdale — unmatched class, acoustics, and scale.",
    capacity: "2,500 guests",
  },
  {
    id: "wild-geese-lodge",
    name: "Wild Geese Lodge",
    location: "Harare",
    description:
      "Breathtaking rolling savannah gardens and dramatic local hills — the peak of luxury garden wedding landscapes.",
    capacity: "500 guests",
  },
  {
    id: "nesbitt-castle",
    name: "Nesbitt Castle",
    location: "Bulawayo",
    description:
      "A majestic, authentic gothic castle surrounded by ancient woodlands — perfect for grand heritage celebrations.",
    capacity: "350 guests",
  },
  {
    id: "chengeta-safari-lodge",
    name: "Chengeta Safari Lodge",
    location: "Selous",
    description:
      "Nestled in pristine African wilderness just outside Harare — a rustic yet highly sophisticated bushveld setting.",
    capacity: "400 guests",
  },
  {
    id: "troutbeck-resort",
    name: "Troutbeck Resort",
    location: "Nyanga",
    description:
      "Scenic highland luxury amidst the Eastern Highlands mountains and pine forests — ideal for elite corporate retreats.",
    capacity: "300 guests",
  },
  {
    id: "elephant-hills",
    name: "Elephant Hills Resort",
    location: "Victoria Falls",
    description:
      "Perched on a hill overlooking the Zambezi River and the legendary Falls — a magnificent destination wedding hub.",
    capacity: "800 guests",
  },
];
