import { useState } from "react";
import { Check, ClipboardCheck, GlassWater, Plus, Settings2, Users, X } from "lucide-react";
import {
  FRESH_PEOPLE_COVERAGE,
  FRESH_PEOPLE_FACTS,
  FRESH_PEOPLE_GROUPS,
  FRESH_PEOPLE_URL,
  type FreshPeopleGroup,
} from "../../data/freshPeople";
import { useReveal } from "../../hooks/useReveal";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { SectionLabel } from "../ui/SectionLabel";

const GROUP_ICONS = {
  staffing: Users,
  equipment: GlassWater,
  logistics: Settings2,
  management: ClipboardCheck,
} as const;

const iconFor = (id: string) => GROUP_ICONS[id as keyof typeof GROUP_ICONS] ?? Users;

/**
 * The full breakdown for one service, opened from its card. This deliberately
 * stays on the Eventive site rather than linking out to fresh-people.co.za —
 * throwing a visitor onto a different domain mid-browse loses them.
 */
function ServiceDialog({ group, onClose }: { group: FreshPeopleGroup; onClose: () => void }) {
  const Icon = iconFor(group.id);

  return (
    <Modal label={`${group.title} — what it covers`} onClose={onClose} className="max-w-[860px]">
      <div className="flex items-start justify-between gap-6 border-b border-line-soft px-8 py-7">
        <div className="flex items-start gap-4">
          <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-azure-soft text-azure">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-[28px] leading-tight text-paper">{group.title}</h3>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-clay-bright">
              {group.subtitle}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="glass-chip shrink-0 cursor-pointer rounded-full p-2.5 text-paper transition-colors hover:text-azure"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-y-auto px-8 py-7">
        <p className="mb-8 max-w-[62ch] text-[15px] leading-relaxed text-pretty text-paper-dim">
          {group.hero}
        </p>

        <div className="flex flex-col gap-7">
          {group.detail.map((entry) => (
            <div key={entry.title} className="border-t border-line-soft pt-6">
              <h4 className="mb-1.5 font-sans text-[15px] font-semibold text-paper">
                {entry.title}
              </h4>
              <p className="mb-3.5 max-w-[62ch] text-[13.5px] text-pretty text-ink">{entry.desc}</p>
              <ul className="flex flex-wrap gap-x-2.5 gap-y-2">
                {entry.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="inline-flex items-center gap-1.5 rounded-full bg-clay-soft/60 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-clay-bright"
                  >
                    <Check aria-hidden="true" className="h-3 w-3" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-card bg-azure-soft/40 p-6">
          <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.12em] text-azure">
            Why this works
          </h4>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {group.whyChoose.map((reason) => (
              <li key={reason} className="relative pl-4 text-[13px] text-pretty text-paper-dim">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[0.55em] h-1 w-1 rounded-full bg-azure"
                />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-soft px-8 py-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-dim">
          Delivered in South Africa as Fresh People
        </span>
        <Button href="#contact" size="sm" onClick={onClose} withArrow>
          Request a Quote
        </Button>
      </div>
    </Modal>
  );
}

export function FreshPeople() {
  const ref = useReveal<HTMLDivElement>();
  const [openId, setOpenId] = useState<string | null>(null);
  const openGroup = FRESH_PEOPLE_GROUPS.find((g) => g.id === openId) ?? null;

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
            <strong className="font-semibold text-azure">Fresh People</strong>, supplying the people,
            hospitality support, equipment, setup crews, and coordination that run polished events
            across Johannesburg and Gauteng. An event that crosses the border does not change hands.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FRESH_PEOPLE_GROUPS.map((group) => {
            const Icon = iconFor(group.id);
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => setOpenId(group.id)}
                aria-label={`${group.title} — see what it covers`}
                className="glass lift reveal group/card flex cursor-pointer flex-col rounded-panel p-7 text-left"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-azure-soft text-azure">
                    <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-dim transition-colors group-hover/card:border-azure group-hover/card:text-azure">
                    <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                </div>
                <h3 className="mb-2.5 font-serif text-[22px] text-balance text-paper">
                  {group.title}
                </h3>
                <p className="mb-6 text-[13px] text-pretty text-ink">{group.blurb}</p>

                <ul className="flex flex-col gap-3 border-t border-line-soft pt-6">
                  {group.detail.map((entry) => (
                    <li
                      key={entry.title}
                      className="relative pl-4 text-[12.5px] text-pretty text-ink"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-[0.55em] h-1 w-1 rounded-full bg-clay"
                      />
                      {entry.title}
                    </li>
                  ))}
                </ul>

                <span className="mt-6 font-mono text-[9.5px] uppercase tracking-[0.1em] text-azure">
                  See what it covers
                </span>
              </button>
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

      {openGroup && <ServiceDialog group={openGroup} onClose={() => setOpenId(null)} />}
    </section>
  );
}
