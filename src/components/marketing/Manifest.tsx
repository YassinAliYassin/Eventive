import { useRef, useState, type KeyboardEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { MANIFESTS } from "../../data/manifests";
import { useReveal } from "../../hooks/useReveal";
import { SectionLabel } from "../ui/SectionLabel";
import { cn } from "../../lib/cn";

export function Manifest() {
  const [activeKey, setActiveKey] = useState(MANIFESTS[0].key);
  const active = MANIFESTS.find((m) => m.key === activeKey) ?? MANIFESTS[0];
  const ref = useReveal<HTMLDivElement>();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move between tabs, which is what a tablist is expected to do.
  const handleTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (delta === 0) return;
    e.preventDefault();
    const next = (index + delta + MANIFESTS.length) % MANIFESTS.length;
    setActiveKey(MANIFESTS[next].key);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="manifest" className="relative z-[1] py-28">
      <div ref={ref} className="mx-auto max-w-[1180px] px-7">
        <div className="mb-10 max-w-[760px]">
          <SectionLabel className="reveal mb-5">Sample Run-of-Show</SectionLabel>
          <h2 className="reveal mb-5 text-section font-medium text-balance font-serif text-paper">
            A logistics manifest, not a guess.
          </h2>
          <p className="reveal text-[15px] text-pretty text-ink">
            Every Eventive deployment runs on a timed manifest — from marquee assembly two days out, to
            the last dance. Below is a real run-of-show from three of our most requested formats.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Run-of-show formats"
          className="reveal mb-8 flex flex-wrap gap-2.5"
        >
          {MANIFESTS.map((manifest, index) => {
            const isActive = activeKey === manifest.key;
            return (
              <button
                key={manifest.key}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`manifest-tab-${manifest.key}`}
                aria-selected={isActive}
                aria-controls={`manifest-panel-${manifest.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveKey(manifest.key)}
                onKeyDown={(e) => handleTabKeyDown(e, index)}
                className={cn(
                  "cursor-pointer rounded-full px-6 py-3 font-mono text-[11px] uppercase tracking-[0.06em] transition-all duration-300",
                  isActive
                    ? "bg-azure text-white shadow-[0_10px_24px_-10px_rgba(47,93,143,0.9)]"
                    : "glass text-ink hover:-translate-y-0.5 hover:text-azure"
                )}
              >
                {manifest.tabLabel}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`manifest-panel-${active.key}`}
          aria-labelledby={`manifest-tab-${active.key}`}
          tabIndex={0}
          className="glass reveal overflow-hidden rounded-panel"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-soft px-8 py-6 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-dim">
            <span className="text-paper-dim">{active.title}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-azure-soft px-3 py-1.5 tracking-[0.14em] text-azure">
              <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
              Confirmed
            </span>
          </div>

          <ol className="list-none">
            {active.rows.map((row, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === active.rows.length - 1;
              return (
                <li
                  key={row.title}
                  className={cn(
                    "grid grid-cols-1 gap-2.5 px-8 py-6 sm:grid-cols-[104px_20px_1fr] sm:gap-5",
                    !isLast && "border-b border-line-soft"
                  )}
                >
                  <div className="pt-0.5 font-mono text-[13px] text-azure">{row.time}</div>

                  {/* Timeline rail: a hairline through the section with a node per stop */}
                  <div aria-hidden="true" className="relative hidden sm:block">
                    <span
                      className={cn(
                        "absolute left-1/2 w-px -translate-x-1/2 bg-line-soft",
                        isFirst && isLast && "hidden",
                        isFirst && !isLast && "top-2.5 bottom-[-1.5rem]",
                        isLast && !isFirst && "top-[-1.5rem] h-[calc(1.5rem+0.625rem)]",
                        !isFirst && !isLast && "top-[-1.5rem] bottom-[-1.5rem]"
                      )}
                    />
                    <span className="absolute left-1/2 top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full border-[1.5px] border-azure bg-white" />
                  </div>

                  <div>
                    <h3 className="mb-1.5 font-sans text-base font-semibold text-paper">{row.title}</h3>
                    <p className="text-[13px] text-pretty text-ink">{row.description}</p>
                    <span className="mt-2.5 inline-block rounded-full bg-clay-soft px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-clay-bright">
                      {row.category}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
