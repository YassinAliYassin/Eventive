import { MapPin, Users } from "lucide-react";
import { VENUES, type Venue } from "../../data/venues";
import { useReveal } from "../../hooks/useReveal";
import { CoverImage } from "../ui/CoverImage";
import { SectionLabel } from "../ui/SectionLabel";

function VenueCard({ venue }: { venue: Venue }) {
  return (
    <article className="glass lift reveal group relative h-[400px] overflow-hidden rounded-panel p-0 shadow-[0_12px_40px_rgba(16,23,34,0.14)] sm:h-[420px]">
      <CoverImage
        src={venue.image}
        alt={`${venue.name}, ${venue.location}`}
        className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
      />

      {/* Keeps the top chip legible over bright skies */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/20 to-transparent"
      />

      <span className="glass-chip absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-clay-bright">
        <MapPin aria-hidden="true" className="h-3 w-3" />
        {venue.location}
      </span>

      <div className="glass-photo absolute inset-x-3 bottom-3 rounded-card px-6 py-5">
        <h3 className="mb-2 font-serif text-[24px] leading-tight text-balance text-paper">
          {venue.name}
        </h3>
        <p className="mb-4 text-[13px] leading-relaxed text-pretty text-ink">{venue.description}</p>
        <div className="flex items-baseline justify-between border-t border-line-soft pt-3.5">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-dim">
            <Users aria-hidden="true" className="h-3 w-3" />
            Capacity
          </span>
          <strong className="font-sans text-[17px] font-bold tracking-tight text-azure">
            {venue.capacity}
          </strong>
        </div>
      </div>
    </article>
  );
}

export function Venues() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="venues" className="relative z-[1] py-28">
      <div ref={ref} className="mx-auto max-w-[1180px] px-7">
        <div className="mb-10 max-w-[760px]">
          <SectionLabel className="reveal mb-5">Nationwide Coverage</SectionLabel>
          <h2 className="reveal mb-5 text-section font-medium text-balance font-serif text-paper">
            Venues on the manifest.
          </h2>
          <p className="reveal text-[15px] text-pretty text-ink">
            Our transport and rigging crews are calibrated to these routes — or bring the full Eventive
            build to your own private estate, homestead, or courtyard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VENUES.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </div>
    </section>
  );
}
