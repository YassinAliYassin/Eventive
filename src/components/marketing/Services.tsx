import { Coffee, GraduationCap, Lightbulb, Milk, Sparkles, Tent, UtensilsCrossed } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";
import { Button } from "../ui/Button";
import { SectionLabel } from "../ui/SectionLabel";

const SERVICES = [
  {
    tag: "Hospitality Elite",
    icon: Coffee,
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
    icon: Tent,
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
    icon: Lightbulb,
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
    icon: UtensilsCrossed,
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

const COFFEE_BAR_INCLUDES = [
  { icon: Coffee, label: "Commercial Espresso Kit" },
  { icon: Milk, label: "High-Grade Milks & Syrups" },
  { icon: Sparkles, label: "Custom Cup Branding" },
  { icon: GraduationCap, label: "Certified Barista Crew" },
];

export function Services() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="services" className="relative z-[1] py-28">
      <div ref={ref} className="mx-auto max-w-[1180px] px-7">
        <div className="mb-14 max-w-[760px]">
          <SectionLabel className="reveal mb-5">Stock Equipment &amp; Turn-Key Services</SectionLabel>
          <h2 className="reveal mb-5 text-section font-medium text-balance font-serif text-paper">
            What we deliver to your stage.
          </h2>
          <p className="reveal text-[15px] text-pretty text-ink">
            We own and manage our complete logistics pipeline — no dependence on third-party sub-hires,
            ensuring gold-standard quality and uninterrupted delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="glass lift reveal rounded-panel p-9">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-azure-soft text-azure">
                    <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                  </span>
                  <span className="inline-block rounded-full bg-clay-soft px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-clay-bright">
                    {service.tag}
                  </span>
                </div>
                <h3 className="mb-2.5 font-serif text-[26px] text-balance text-paper">{service.title}</h3>
                <p className="mb-6 text-[13.5px] text-pretty text-ink">{service.description}</p>
                <ul className="flex flex-col gap-3 border-t border-line-soft pt-6">
                  {service.items.map(([label, detail]) => (
                    <li key={label} className="relative pl-4 text-[12.5px] text-pretty text-ink">
                      <span aria-hidden="true" className="absolute left-0 top-[0.55em] h-1 w-1 rounded-full bg-azure" />
                      <strong className="font-semibold text-paper">{label}</strong> — {detail}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="glass-strong reveal mt-5 flex flex-wrap items-center justify-between gap-9 rounded-panel p-10">
          <div>
            <SectionLabel className="mb-4">Special Focus</SectionLabel>
            <h3 className="mb-3 font-serif text-[28px] italic text-balance text-paper">
              The Artisan Mobile Coffee Bar experience
            </h3>
            <p className="max-w-[520px] text-[13.5px] text-pretty text-ink">
              Unlike standard self-serve urns, our mobile espresso bar offers single-origin Arabica beans
              sourced from Zimbabwe&apos;s Eastern Highlands and East Africa — served in elegant porcelain or
              custom-branded cups.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-3 font-mono text-[10.5px] text-ink-dim">
              {COFFEE_BAR_INCLUDES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon aria-hidden="true" className="h-3.5 w-3.5 text-clay" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <Button href="#contact" withArrow>
            Add to Quote
          </Button>
        </div>
      </div>
    </section>
  );
}
