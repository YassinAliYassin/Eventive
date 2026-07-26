import { Quote } from "lucide-react";
import { TESTIMONIALS } from "../../data/testimonials";
import { useReveal } from "../../hooks/useReveal";
import { SectionLabel } from "../ui/SectionLabel";

export function Testimonials() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="testimonials" className="relative z-[1] py-28">
      <div ref={ref} className="mx-auto max-w-[1180px] px-7">
        <div className="mb-10 max-w-[760px]">
          <SectionLabel className="reveal mb-5">In Their Words</SectionLabel>
          <h2 className="reveal mb-5 text-section font-medium text-balance font-serif text-paper">
            What clients say afterwards.
          </h2>
          <p className="reveal text-[15px] text-pretty text-ink">
            The measure of a build is not the setup photo — it is whether the day ran the way the
            manifest said it would.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.id}
              className="glass lift reveal flex flex-col rounded-panel p-8"
            >
              <Quote aria-hidden="true" className="mb-4 h-6 w-6 shrink-0 text-clay/50" />
              <blockquote className="flex-1 text-[14px] leading-relaxed text-pretty text-paper-dim">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-line-soft pt-4">
                <div className="font-sans text-[14px] font-semibold text-paper">
                  {testimonial.name}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-dim">
                  {testimonial.role}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
