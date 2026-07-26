import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { FAQS } from "../../data/faqs";
import { useReveal } from "../../hooks/useReveal";
import { Button } from "../ui/Button";
import { SectionLabel } from "../ui/SectionLabel";
import { cn } from "../../lib/cn";

/*
 * FAQPage structured data, built from the same source as the visible list so the
 * two cannot drift. Answers still awaiting confirmation are excluded — telling a
 * search engine a policy we have not verified is worse than telling it nothing.
 */
const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.filter((faq) => !faq.needsReview).map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});

export function Faq() {
  const ref = useReveal<HTMLDivElement>();
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(FAQS[0]?.id ?? null);

  return (
    <section id="faq" className="relative z-[1] py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <div ref={ref} className="mx-auto max-w-[1180px] px-7">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="reveal lg:sticky lg:top-[120px]">
            <SectionLabel className="mb-5">Before You Book</SectionLabel>
            <h2 className="mb-5 text-section font-medium text-balance font-serif text-paper">
              Questions we get asked.
            </h2>
            <p className="mb-8 text-[15px] text-pretty text-ink">
              If your question is not here, the fastest answer is a direct one — send us the date and the
              guest count and we will come back with specifics.
            </p>
            <Button href="#contact" variant="quiet" withArrow>
              Ask us directly
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq) => {
              const isOpen = openId === faq.id;
              const panelId = `${baseId}-${faq.id}`;
              return (
                <div key={faq.id} className="glass reveal overflow-hidden rounded-card">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      className="flex w-full cursor-pointer items-start justify-between gap-5 px-7 py-5 text-left transition-colors hover:text-azure"
                    >
                      <span className="flex-1 font-sans text-[15px] font-semibold text-balance text-paper">
                        {faq.question}
                      </span>
                      <span className="flex items-center gap-2">
                        {faq.needsReview && (
                          <span className="hidden rounded-full bg-clay-soft px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-clay-bright sm:inline">
                            Todo
                          </span>
                        )}
                        <Plus
                          aria-hidden="true"
                          className={cn(
                            "mt-0.5 h-4 w-4 shrink-0 text-azure transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                            isOpen && "rotate-45"
                          )}
                        />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-7 pb-6 text-[13.5px] leading-relaxed text-pretty text-ink">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
