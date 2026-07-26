import { VENUES } from "../../data/venues";
import { useReveal } from "../../hooks/useReveal";

export function Venues() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="venues" className="py-28">
      <div ref={ref} className="max-w-[1180px] mx-auto px-7">
        <div className="reveal max-w-[760px] mb-10">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-clay-bright inline-flex items-center gap-2.5 mb-5">
            <span className="w-[18px] h-px bg-clay-bright inline-block" />
            Nationwide Coverage
          </div>
          <h2 className="font-serif font-medium text-paper text-[34px] md:text-[42px] mb-5">
            Venues on the manifest.
          </h2>
          <p className="text-[15px] text-ink">
            Our transport and rigging crews are calibrated to these routes — or bring the full Eventive
            build to your own private estate, homestead, or courtyard.
          </p>
        </div>

        <div className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VENUES.map((venue) => (
            <article
              key={venue.id}
              className="group relative h-[420px] rounded-[28px] overflow-hidden shadow-[0_12px_40px_rgba(16,23,34,0.14)] hover:-translate-y-1 transition-transform duration-300"
            >
              {/* Photograph fills the card; the glass panel below frosts it directly */}
              <img
                src={venue.image}
                alt={venue.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700"
              />

              <span className="absolute top-4 left-4 glass-chip font-mono text-[10.5px] tracking-[0.12em] uppercase text-clay-bright px-3.5 py-2 rounded-full">
                {venue.location}
              </span>

              <div className="glass-photo absolute inset-x-3 bottom-3 rounded-[22px] px-6 py-5">
                <h3 className="font-serif text-[24px] leading-tight text-paper mb-2">{venue.name}</h3>
                <p className="text-[13px] leading-relaxed text-ink mb-4">{venue.description}</p>
                <div className="flex justify-between items-baseline border-t border-line-soft pt-3.5">
                  <span className="font-mono text-[10.5px] tracking-[0.12em] uppercase text-ink-dim">
                    Capacity
                  </span>
                  <strong className="font-sans font-bold text-[17px] text-azure tracking-tight">
                    {venue.capacity}
                  </strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
