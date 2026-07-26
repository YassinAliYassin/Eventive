import { useReveal } from "../../hooks/useReveal";

const PILLARS = [
  {
    tag: "01 — Standard",
    title: "Exceeding the Expectations",
    description:
      "Our core corporate credo. Every soundcheck, floral element, and beverage pour is calibrated to absolute perfection.",
  },
  {
    tag: "02 — Location",
    title: "Harare Logistics Hub",
    description:
      "Centrally coordinated from our elite warehouse hub in Harare, supporting robust transport logistics and rapid setups nationwide.",
  },
  {
    tag: "03 — Reliability",
    title: "Uncompromising Reliability",
    description:
      "100% guaranteed silent diesel generator backup, safety-certified riggers, and weather-proof luxury marquees.",
  },
  {
    tag: "04 — Heritage",
    title: "Cultural & Corporate Prestige",
    description:
      "Deep cultural respect for traditional Roora celebrations, combined seamlessly with elite modern corporate styling.",
  },
];

export function About() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="about" className="py-28">
      <div ref={ref} className="max-w-[1180px] mx-auto px-7">
        <div className="reveal grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-14 items-start mb-20">
          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brass-bright inline-flex items-center gap-2.5 mb-5">
              <span className="w-[18px] h-px bg-brass-bright inline-block" />
              Our Corporate Legacy
            </div>
            <h2 className="font-serif font-medium text-paper text-[30px] md:text-[40px] leading-tight mb-6">
              Zimbabwe&apos;s premier full-service events management &amp; mobile hospitality agency
            </h2>
            <p className="text-[15px] text-ink mb-4">
              Founded to redefine the structural and hospitality landscape of high-profile gatherings in
              Southern Africa, <strong className="text-azure font-semibold">Eventive</strong> delivers
              turn-key execution for corporate summits, state galas, majestic weddings, and intimate
              private celebrations.
            </p>
            <p className="text-[15px] text-ink">
              Operating from our primary{" "}
              <strong className="text-azure font-semibold">Logistics Hub in Harare</strong>, we run a
              sophisticated network servicing Harare, Bulawayo, Victoria Falls, Nyanga, and Selous — with
              elite inventory ranging from custom modular bar structures to linear-array concert audio and
              luxury glass marquees.
            </p>
          </div>

          <div className="glass rounded-[32px] p-9 text-center">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink-dim">
              Est. Harare, ZW
            </div>
            <h4 className="font-serif text-[26px] text-azure my-2.5">Eventive Zimbabwe</h4>
            <p className="text-[13px] text-ink">
              Seamlessly fusing traditional Southern African hospitality with elite, state-of-the-art
              global production standards — one logistics chain, start to finish.
            </p>
          </div>
        </div>

        <div className="reveal mb-10">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brass-bright inline-flex items-center gap-2.5 mb-5">
            <span className="w-[18px] h-px bg-brass-bright inline-block" />
            The Pillars of Our Craft
          </div>
          <h3 className="font-serif font-medium text-[26px] md:text-[30px] text-paper">
            Behind every flawless event stands our engineering, artistry, and discipline.
          </h3>
        </div>

        <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-5">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="glass rounded-3xl p-8">
              <div className="font-mono text-[10px] text-brass-bright tracking-[0.08em] uppercase">
                {pillar.tag}
              </div>
              <h4 className="font-serif text-[22px] text-paper my-3">{pillar.title}</h4>
              <p className="text-[13.5px] text-ink">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
