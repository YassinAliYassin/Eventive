import { ClipboardCheck, GlassWater, Users } from "lucide-react";
import {
  FRESH_PEOPLE_COVERAGE,
  FRESH_PEOPLE_FACTS,
  FRESH_PEOPLE_GROUPS,
  FRESH_PEOPLE_URL,
} from "../../data/freshPeople";
import { useReveal } from "../../hooks/useReveal";
import { Button } from "../ui/Button";
import { SectionLabel } from "../ui/SectionLabel";

const GROUP_ICONS = {
  talent: Users,
  support: GlassWater,
  management: ClipboardCheck,
} as const;

export function FreshPeople() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="fresh-people" className="relative z-[1] py-28">
      <div ref={ref} className="mx-auto max-w-[1180px] px-7">
        <div className="mb-10 max-w-[760px]">
          <SectionLabel className="reveal mb-5">The Same Business, In South Africa</SectionLabel>
          <h2 className="reveal mb-5 text-section font-medium text-balance font-serif text-paper">
            In South Africa, we are Fresh People.
          </h2>
          <p className="reveal text-[15px] text-pretty text-ink">
            One business, two countries. In Zimbabwe we trade as Eventive; in South Africa as{" "}
            <strong className="font-semibold text-azure">Fresh People</strong>, working out of
            Johannesburg across Gauteng — talent, event support, and management. An event that
            crosses the border does not change hands.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {FRESH_PEOPLE_GROUPS.map((group) => {
            const Icon = GROUP_ICONS[group.id as keyof typeof GROUP_ICONS] ?? Users;
            return (
              <div key={group.id} className="glass lift reveal flex flex-col rounded-panel p-8">
                <span className="mb-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-azure-soft text-azure">
                  <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                </span>
                <h3 className="mb-2.5 font-serif text-[24px] text-balance text-paper">
                  {group.title}
                </h3>
                <p className="mb-6 text-[13.5px] text-pretty text-ink">{group.blurb}</p>
                <ul className="flex flex-col gap-3 border-t border-line-soft pt-6">
                  {group.items.map((item) => (
                    <li key={item} className="relative pl-4 text-[12.5px] text-pretty text-ink">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-[0.55em] h-1 w-1 rounded-full bg-clay"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="glass-strong reveal mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-7 rounded-panel p-9">
          <div>
            <div className="font-serif text-[22px] italic text-paper">We Are Fresh People</div>
            <div className="mt-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-clay-bright">
              {FRESH_PEOPLE_COVERAGE}
            </div>
            <Button
              href={FRESH_PEOPLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="quiet"
              size="sm"
              className="mt-5"
              withArrow
            >
              Visit Fresh People
            </Button>
          </div>

          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {FRESH_PEOPLE_FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="sr-only">{fact.label}</dt>
                <dd className="font-sans text-[20px] font-bold tracking-tight text-paper">
                  {fact.value}
                </dd>
                <div
                  aria-hidden="true"
                  className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-ink-dim"
                >
                  {fact.label}
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
