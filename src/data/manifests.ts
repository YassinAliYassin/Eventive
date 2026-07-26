export interface ManifestRow {
  time: string;
  title: string;
  description: string;
  category: string;
}

export interface Manifest {
  key: string;
  tabLabel: string;
  title: string;
  rows: ManifestRow[];
}

export const MANIFESTS: Manifest[] = [
  {
    key: "wedding",
    tabLabel: "Garden Wedding",
    title: "Wild Geese Lodge — Garden Wedding",
    rows: [
      {
        time: "D-2 Days",
        title: "Marquee Structure Assembly",
        description: "Eventive crew erects the glass marquee at Wild Geese Lodge, tests layout anchoring.",
        category: "Setup",
      },
      {
        time: "D-1 Day",
        title: "Lighting & Sound Tuning",
        description: "Technicians lay festoons, fairy lights, sound-check the PA system.",
        category: "Setup",
      },
      {
        time: "07:00 AM",
        title: "Floral Setup & Decor Prep",
        description: "Styling team arranges fresh white lilies and eucalyptus runners on rustic wooden tables.",
        category: "Styling",
      },
      {
        time: "10:00 AM",
        title: "Backup Generator Hot Test",
        description: "Ensure the 20kVA silent generator is fully fueled and idling in case of grid outages.",
        category: "Logistics",
      },
      {
        time: "02:00 PM",
        title: "Arrival of Guests",
        description: "Soft background acoustic tracks played over PA.",
        category: "Entertainment",
      },
      {
        time: "02:30 PM",
        title: "Main Wedding Ceremony",
        description: "Vows exchanged under custom floral archway. Microphones live.",
        category: "Ceremony",
      },
      {
        time: "04:30 PM",
        title: "Cocktail Hour & Photos",
        description: "Canapés and Mazoe cordials served under stretch tent while couple photographs.",
        category: "Catering",
      },
      {
        time: "06:30 PM",
        title: "Grand Reception & Feast",
        description: "Zimbabwean braai meats, Kariba bream, and hot sadza served in chaffing dishes.",
        category: "Catering",
      },
      {
        time: "08:30 PM",
        title: "Opening of Dancefloor",
        description: "Intelligent lights synchronize, DJ live set begins with local classics and Afrobeats.",
        category: "Entertainment",
      },
    ],
  },
  {
    key: "lobola",
    tabLabel: "Roora / Lobola",
    title: "Private Estate — Roora / Lobola Celebration",
    rows: [
      {
        time: "D-1 Day",
        title: "Homestead Stretch Tent Setup",
        description: "Erect elegant sand-colored stretch tent in the family estate.",
        category: "Setup",
      },
      {
        time: "07:00 AM",
        title: "Traditional Decor Arranged",
        description: "Set wooden tables with handcrafted calabash decor, beaded items, brass plates.",
        category: "Styling",
      },
      {
        time: "08:00 AM",
        title: "Groom's Family Arrival",
        description: "Eventive staff guides the groom's delegation with soft Zimbabwean welcoming songs.",
        category: "Logistics",
      },
      {
        time: "09:00 AM",
        title: "Marriage Negotiation Sessions",
        description: "Traditional Roora discussions begin inside the main house. Hot tea served.",
        category: "Ceremony",
      },
      {
        time: "01:00 PM",
        title: "The Revelation Ceremony",
        description: "Bride's entrance celebration — ululation, drumming, and wireless PA with family songs.",
        category: "Ceremony",
      },
      {
        time: "02:00 PM",
        title: "Zimbabwean Heritage Feast",
        description: "Traditional buffet: roasted meats, hot sadza, relish, peanut-butter greens, local desserts.",
        category: "Catering",
      },
      {
        time: "04:00 PM",
        title: "After-Roora Dance & Music",
        description: "Socializing under the stretch tent — Sungura, Afro-jazz & local classics.",
        category: "Entertainment",
      },
    ],
  },
  {
    key: "corporate",
    tabLabel: "Corporate Summit",
    title: "Celebration Centre — Corporate Summit",
    rows: [
      {
        time: "D-1 Day",
        title: "Stage & Backdrop Construction",
        description: "Assemble the polished wood stage and mount branded LED presentation backdrops.",
        category: "Setup",
      },
      {
        time: "07:30 AM",
        title: "AV Rigging & Feed Integration",
        description: "Test cordless lapel mics, presentation slide feeds, and output monitors.",
        category: "Setup",
      },
      {
        time: "08:30 AM",
        title: "Delegate Registration & Coffee Bar",
        description: "Warm beverages, premium Eastern Highlands coffee, and pastries served at reception.",
        category: "Hospitality",
      },
      {
        time: "09:00 AM",
        title: "Opening Panels & Speeches",
        description: "Clear speech audio across the auditorium, slide timings synced perfectly.",
        category: "Ceremony",
      },
      {
        time: "11:00 AM",
        title: "Networking Break",
        description: "Savory treats and tea bars active under high-end cocktail tables.",
        category: "Catering",
      },
      {
        time: "01:00 PM",
        title: "Executive Lunch & Carvery",
        description: "Delegates served a premium buffet in the side gardens under clean pavilions.",
        category: "Catering",
      },
      {
        time: "04:30 PM",
        title: "Closing Remarks & Cocktail",
        description: "Ambient stage lighting transitions to sunset gold, soft jazz, bar active.",
        category: "Entertainment",
      },
    ],
  },
];
