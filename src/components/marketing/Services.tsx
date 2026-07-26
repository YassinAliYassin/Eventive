import { useReveal } from "../../hooks/useReveal";

const SERVICES = [
  {
    tag: "Hospitality Elite",
    title: "Mobile Coffee & Beverage Bars",
    description:
      "Signature beverage setups featuring handcrafted modular bar counters, elite mixologists, and full-service warm or cold hospitality.",
    items: [
      ["Luxury Mobile Coffee Bar", "handcrafted station with dual-boiler espresso machines and certified baristas."],
      ["Rustic Wooden Modular Bar", "solid mahogany panels with under-counter shelving and warm LED washes."],
      ["LED Glow Bar Structure", "programmable illuminated curves matched to your branding."],
      ["Gold-Brass & Marble Bar", "polished-brass frameworks with marble tops for presidential-tier gatherings."],
    ],
  },
  {
    tag: "Structural Design",
    title: "Luxury Marquees & Tent Structures",
    description:
      "Weather-proof, safety-engineered, and majestic modular structures for premium temporary venues anywhere in Zimbabwe.",
    items: [
      ["Presidential Clear-Glass Marquee", "heavy-duty aluminum frames with pristine glass-wall panels."],
      ["Sandy Bedouin Stretch Tents", "flexible, wind-tested architectural covers for elegant landscapes."],
      ["Premium White Peg & Pole Marquee", "traditional high-peak silhouettes with draped ceilings."],
      ["Staging & Truss Rigging", "safety-certified staging with skirting and aluminum rigging towers."],
    ],
  },
  {
    tag: "Technical Production",
    title: "High-End Sound, Lighting & Backups",
    description:
      "Concert-grade production, customized power backups, and immersive lighting choreography for flawless reliability.",
    items: [
      ["Line-Array Concert Sound", "clear coverage for 100 to 1,500 guests with pro mixing consoles."],
      ["Intelligent Wash & Uplighting", "color-coordinated fixtures, spotlights, warm fairylights."],
      ["Silent Diesel Generators", "10kVA to 45kVA backup to bypass load-shedding entirely."],
      ["Truss & Gobo Projectors", "custom corporate or bridal monograms projected on-site."],
    ],
  },
  {
    tag: "Cuisine & Staffing",
    title: "Gourmet Catering & Elite Service Crews",
    description:
      "Impeccable culinary journeys celebrating local heritage and international gastronomy, served by trained event teams.",
    items: [
      ["Zim Heritage Feast", "flame-grilled Boerewors/Choma, traditional Sadza, slow-roasted meats."],
      ["Elite International Buffet", "multi-course offerings with prime roasts, salads, and desserts."],
      ["Silver-Service Wait Staff", "impeccably dressed hosts trained in high-tier protocol."],
      ["Mixologists & Marshals", "seasoned crowd safety controllers and cocktail creators."],
    ],
  },
];

export function Services() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="services" className="py-28">
      <div ref={ref} className="max-w-[1180px] mx-auto px-7">
        <div className="reveal max-w-[760px] mb-14">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brass-bright inline-flex items-center gap-2.5 mb-5">
            <span className="w-[18px] h-px bg-brass-bright inline-block" />
            Stock Equipment &amp; Turn-Key Services
          </div>
          <h2 className="font-serif font-medium text-paper text-[34px] md:text-[42px] mb-5">
            What we deliver to your stage.
          </h2>
          <p className="text-[15px] text-ink">
            We own and manage our complete logistics pipeline — no dependence on third-party sub-hires,
            ensuring gold-standard quality and uninterrupted delivery.
          </p>
        </div>

        <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICES.map((service) => (
            <div key={service.title} className="glass rounded-[28px] p-9">
              <span className="inline-block font-mono text-[9.5px] tracking-[0.1em] uppercase text-azure bg-azure-soft px-3 py-1.5 rounded-full mb-5">
                {service.tag}
              </span>
              <h3 className="font-serif text-[26px] text-paper mb-2.5">{service.title}</h3>
              <p className="text-[13.5px] text-ink mb-6">{service.description}</p>
              <ul className="flex flex-col gap-3 border-t border-line-soft pt-6">
                {service.items.map(([label, detail]) => (
                  <li key={label} className="text-[12.5px] text-ink pl-4 relative">
                    <span className="absolute left-0 text-azure">—</span>
                    <strong className="text-paper font-semibold">{label}</strong> — {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="reveal glass-strong rounded-[28px] mt-5 p-10 flex justify-between items-center gap-9 flex-wrap">
          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brass-bright inline-flex items-center gap-2.5 mb-4">
              <span className="w-[18px] h-px bg-brass-bright inline-block" />
              Special Focus
            </div>
            <h3 className="font-serif italic text-[28px] text-paper mb-3">
              The Artisan Mobile Coffee Bar experience
            </h3>
            <p className="text-[13.5px] text-ink max-w-[520px]">
              Unlike standard self-serve urns, our mobile espresso bar offers single-origin Arabica beans
              sourced from Zimbabwe&apos;s Eastern Highlands and East Africa — served in elegant porcelain or
              custom-branded cups.
            </p>
            <div className="flex gap-5 flex-wrap mt-5 font-mono text-[10.5px] text-ink-dim">
              <span>☕ Commercial Espresso Kit</span>
              <span>🥛 High-Grade Milks &amp; Syrups</span>
              <span>✨ Custom Cup Branding</span>
              <span>🎓 Certified Barista Crew</span>
            </div>
          </div>
          <a
            href="#contact"
            className="font-mono text-xs tracking-[0.08em] uppercase bg-azure text-white px-8 py-4 rounded-full hover:bg-azure-bright transition-colors whitespace-nowrap shadow-md shadow-azure/20"
          >
            Add to Quote
          </a>
        </div>
      </div>
    </section>
  );
}
