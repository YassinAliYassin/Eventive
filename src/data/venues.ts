export interface Venue {
  id: string;
  name: string;
  location: string;
  description: string;
  capacity: string;
  image: string;
}

export const VENUES: Venue[] = [
  {
    id: "celebration-centre",
    name: "Celebration Centre",
    location: "Harare",
    description:
      "Zimbabwe's premier indoor auditorium and world-class summit venue in Borrowdale — unmatched class, acoustics, and scale.",
    capacity: "2,500 guests",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "wild-geese-lodge",
    name: "Wild Geese Lodge",
    location: "Harare",
    description:
      "Breathtaking rolling savannah gardens and dramatic local hills — the peak of luxury garden wedding landscapes.",
    capacity: "500 guests",
    image: "https://www.wildgeeselodge.com/images/phocagallery/SavanahSpot/DSCF7760.jpg",
  },
  {
    id: "nesbitt-castle",
    name: "Nesbitt Castle",
    location: "Bulawayo",
    description:
      "A majestic, authentic gothic castle surrounded by ancient woodlands — perfect for grand heritage celebrations.",
    capacity: "350 guests",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "chengeta-safari-lodge",
    name: "Chengeta Safari Lodge",
    location: "Selous",
    description:
      "Nestled in pristine African wilderness just outside Harare — a rustic yet highly sophisticated bushveld setting.",
    capacity: "400 guests",
    image: "https://zambezicruisesafaris.com/wp-content/uploads/2022/02/Chengeta-Gardens.jpg",
  },
  {
    id: "troutbeck-resort",
    name: "Troutbeck Resort",
    location: "Nyanga",
    description:
      "Scenic highland luxury amidst the Eastern Highlands mountains and pine forests — ideal for elite corporate retreats.",
    capacity: "300 guests",
    image: "https://africansun.com/wp-content/uploads/2024/03/Property-General-Troutbeck-43-scaled.jpg",
  },
  {
    id: "elephant-hills",
    name: "Elephant Hills Resort",
    location: "Victoria Falls",
    description:
      "Perched on a hill overlooking the Zambezi River and the legendary Falls — a magnificent destination wedding hub.",
    capacity: "800 guests",
    image: "https://www.elephanthillshotel.com/wp-content/uploads/Exterior/aerial-view-ehh-1024x683.jpg",
  },
];
