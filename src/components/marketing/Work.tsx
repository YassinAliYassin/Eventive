import { useMemo, useState } from "react";
import { Expand } from "lucide-react";
import { WORK, WORK_CATEGORIES, type WorkCategory } from "../../data/work";
import { useReveal } from "../../hooks/useReveal";
import { CoverImage } from "../ui/CoverImage";
import { Lightbox } from "../ui/Lightbox";
import { SectionLabel } from "../ui/SectionLabel";
import { cn } from "../../lib/cn";

type Filter = WorkCategory | "All";

const FILTERS: Filter[] = ["All", ...WORK_CATEGORIES];

export function Work() {
  const [filter, setFilter] = useState<Filter>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useReveal<HTMLDivElement>();

  const visible = useMemo(
    () => (filter === "All" ? WORK : WORK.filter((item) => item.category === filter)),
    [filter]
  );

  const slides = visible.map((item) => ({
    id: item.id,
    image: item.image,
    title: item.title,
    caption: item.scope,
    meta: `${item.venue} · ${item.guests}`,
  }));

  return (
    <section id="work" className="relative z-[1] py-28">
      <div ref={ref} className="mx-auto max-w-[1180px] px-7">
        <div className="mb-10 max-w-[760px]">
          <SectionLabel className="reveal mb-5">Selected Builds</SectionLabel>
          <h2 className="reveal mb-5 text-section font-medium text-balance font-serif text-paper">
            The work, not the brochure.
          </h2>
          <p className="reveal text-[15px] text-pretty text-ink">
            Structures raised, rigs flown, and crews deployed across the country. Filter by the kind of
            gathering you are planning to see how the same inventory gets configured.
          </p>
        </div>

        <div className="reveal mb-8 flex flex-wrap gap-2.5">
          {FILTERS.map((option) => {
            const isActive = filter === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isActive}
                onClick={() => {
                  setFilter(option);
                  setOpenIndex(null);
                }}
                className={cn(
                  "cursor-pointer rounded-full px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.06em] transition-all duration-300",
                  isActive
                    ? "bg-clay text-white shadow-[0_10px_24px_-10px_rgba(178,84,58,0.9)]"
                    : "glass text-ink hover:-translate-y-0.5 hover:text-clay-bright"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`View ${item.title} at ${item.venue}`}
              className="group lift reveal relative aspect-[4/3] cursor-pointer overflow-hidden rounded-panel bg-canvas-deep text-left shadow-[0_12px_40px_rgba(16,23,34,0.14)]"
            >
              <CoverImage
                src={item.image}
                alt={`${item.title} — ${item.venue}`}
                className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
              />

              {/* Scrim carries the white caption type at AA over any photograph */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-paper/92 via-paper/45 to-paper/5"
              />

              <span className="glass-chip absolute left-4 top-4 rounded-full px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-clay-bright">
                {item.category}
              </span>

              <span className="glass-chip absolute right-4 top-4 rounded-full p-2 text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand aria-hidden="true" className="h-3.5 w-3.5" />
              </span>

              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-serif text-[22px] leading-tight text-balance text-white">
                  {item.title}
                </h3>
                <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-white/80">
                  {item.venue} · {item.guests}
                </div>
                {/* Held at zero height until hover so the card stays quiet at rest */}
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
                  <p className="overflow-hidden text-[12.5px] leading-relaxed text-white/85">
                    <span className="block pt-3">{item.scope}</span>
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {openIndex !== null && (
        <Lightbox
          slides={slides}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </section>
  );
}
