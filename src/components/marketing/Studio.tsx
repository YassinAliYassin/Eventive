import { useReveal } from "../../hooks/useReveal";

const CAPABILITIES = [
  {
    title: "Draw the property",
    body: "Sketch walls to scale, drop in doors and windows, and watch rooms and floor areas resolve themselves as each loop closes.",
  },
  {
    title: "Walk it in 3D",
    body: "Every edit rebuilds the model live — orbit the whole property, drop the walls for a dollhouse view, or walk the floor at eye height.",
  },
  {
    title: "Lay out the event",
    body: "Banquet rounds, stage decks, dance floors and bar counters at true dimensions, so a seating plan survives contact with the venue.",
  },
];

export function Studio() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="studio" className="py-28">
      <div ref={ref} className="max-w-[1180px] mx-auto px-7">
        <div className="reveal glass rounded-[32px] px-8 md:px-12 py-12">
          <div className="max-w-[760px]">
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-clay-bright inline-flex items-center gap-2.5 mb-5">
              <span className="w-[18px] h-px bg-clay-bright inline-block" />
              Property Studio
            </div>
            <h2 className="font-serif font-medium text-paper text-[34px] md:text-[42px] mb-5">
              Plan the space before the trucks roll.
            </h2>
            <p className="text-[15px] text-ink">
              A floor-plan tool built into Eventive: draw the house, the hall or the marquee, furnish
              it, and hand the client a 3D walkthrough of their event before a single crate is
              packed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {CAPABILITIES.map((capability) => (
              <article
                key={capability.title}
                className="rounded-[22px] border border-line-soft bg-white/50 px-6 py-6"
              >
                <h3 className="font-serif text-[21px] leading-tight text-paper mb-2.5">
                  {capability.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-ink">{capability.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/studio"
              className="inline-flex items-center gap-2 rounded-full bg-azure px-7 py-3.5 text-[14px] font-semibold text-white transition hover:bg-azure-bright"
            >
              Open Property Studio
            </a>
            <span className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-dim">
              Runs in the browser · nothing to install
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
