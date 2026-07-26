import { MapPin, Users } from "lucide-react";
import { VENUES, type Venue } from "../../data/venues";
import { useReveal } from "../../hooks/useReveal";
import { SectionLabel } from "../ui/SectionLabel";

/*
 * Typographic by design — see the note in data/venues.ts. Without photography the
 * card has to carry itself, so the venue name is set large in the display serif
 * and a soft corner wash gives the glass something to catch.
 */
function VenueCard({ venue }: { venue: Venue }) {
  return (
    <article className="glass lift reveal relative flex h-full flex-col overflow-hidden rounded-panel p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-azure/12 to-clay/10 blur-2xl"
      />

      <div className="relative flex flex-1 flex-col">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-clay-soft px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-clay-bright">
          <MapPin aria-hidden="true" className="h-3 w-3" />
          {venue.location}
        </span>

        <h3 className="mt-5 font-serif text-[28px] leading-[1.15] text-balance text-paper">
          {venue.name}
        </h3>

        <span aria-hidden="true" className="mt-4 block h-px w-10 bg-clay/40" />

        <p className="mt-4 text-[13.5px] leading-relaxed text-pretty text-ink">
          {venue.description}
        </p>

        {/* mt-auto keeps the capacity rule on the same line across every card */}
        <div className="mt-auto flex items-baseline justify-between border-t border-line-soft pt-4">
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
            Our transport and rigging are planned around these routes — or bring the full Eventive
            build to your own private estate, homestead, or courtyard.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VENUES.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      </div>
    </section>
  );
}
