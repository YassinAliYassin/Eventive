import { Compass, Gem, ShieldCheck, Sparkles } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";
import { SectionLabel } from "../ui/SectionLabel";

const PILLARS = [
  {
    tag: "01 — Standard",
    icon: Sparkles,
    title: "Exceeding the Expectations",
    description:
      "Our core corporate credo. Every soundcheck, floral element, and beverage pour is calibrated to absolute perfection.",
  },
  {
    tag: "02 — Location",
    icon: Compass,
    title: "Harare Logistics Hub",
    description:
      "Centrally coordinated from our elite warehouse hub in Harare, supporting robust transport logistics and rapid setups nationwide.",
  },
  {
    tag: "03 — Reliability",
    icon: ShieldCheck,
    title: "Uncompromising Reliability",
    description:
      "100% guaranteed silent diesel generator backup, safety-certified riggers, and weather-proof luxury marquees.",
  },
  {
    tag: "04 — Heritage",
    icon: Gem,
    title: "Cultural & Corporate Prestige",
    description:
      "Deep cultural respect for traditional Roora celebrations, combined seamlessly with elite modern corporate styling.",
  },
];

export function About() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="about" className="relative z-[1] py-28">
      <div ref={ref} className="mx-auto max-w-[1180px] px-7">
        <div className="mb-20 grid grid-cols-1 items-start gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="reveal">
            <SectionLabel className="mb-5">Why We Are Building This</SectionLabel>
            <h2 className="mb-6 text-section font-medium text-balance font-serif text-paper">
              A full-service events management &amp; mobile hospitality company, built for Zimbabwe
            </h2>
            <p className="mb-4 text-[15px] text-pretty text-ink">
              <strong className="font-semibold text-azure">Eventive</strong> is being established to
              bring turn-key execution to high-profile gatherings in Southern Africa — corporate summits,
              state galas, weddings, and intimate private celebrations — with the structure and
              hospitality handled by one accountable team.
            </p>
            <p className="text-[15px] text-pretty text-ink">
              We work from a{" "}
              <strong className="font-semibold text-azure">logistics hub in Harare</strong>, with routes
              covering Bulawayo, Victoria Falls, Nyanga, and Selous — and inventory ranging from custom
              modular bar structures to line-array concert audio and glass marquees, all of it ours.
            </p>
          </div>

          <div className="glass lift reveal rounded-hero p-9 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-dim">
              Est. Harare, ZW
            </div>
            <h3 className="my-2.5 font-serif text-[26px] text-azure">Eventive Zimbabwe</h3>
            <span aria-hidden="true" className="mx-auto mb-4 block h-px w-10 bg-clay/40" />
            <p className="text-[13px] text-pretty text-ink">
              Traditional Southern African hospitality, run to international production standards — one
              logistics chain, start to finish.
            </p>
          </div>
        </div>

        <div className="reveal mb-10">
          <SectionLabel className="mb-5">The Pillars of Our Craft</SectionLabel>
          <h3 className="text-subsection font-medium text-balance font-serif text-paper">
            Behind every flawless event stands our engineering, artistry, and discipline.
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="glass lift reveal rounded-card p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-clay-bright">
                    {pillar.tag}
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-azure-soft text-azure">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                </div>
                <h4 className="my-3 font-serif text-[22px] text-paper">{pillar.title}</h4>
                <p className="text-[13.5px] text-pretty text-ink">{pillar.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
