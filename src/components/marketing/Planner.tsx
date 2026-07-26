import { useId, useState, type FormEvent } from "react";
import { AlertCircle, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";
import { Button } from "../ui/Button";
import { SectionLabel } from "../ui/SectionLabel";
import { cn } from "../../lib/cn";

interface DraftRow {
  time: string;
  title: string;
  description: string;
  category: string;
}

interface Draft {
  summary: string;
  manifest: DraftRow[];
  inventory: string[];
  staffing: string[];
  considerations: string[];
}

type Status = "idle" | "drafting" | "drafted" | "error" | "unavailable";

const FIELD_CLASS =
  "w-full rounded-field border border-line bg-white/70 px-4 py-3 text-[13.5px] text-paper transition-all placeholder:text-ink-dim/70 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure/20";

const LABEL_CLASS = "mb-2 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-dim";

/** Narrows the API payload before it reaches the render, which is all untrusted. */
function isDraft(value: unknown): value is Draft {
  const d = value as Draft | null;
  return (
    !!d &&
    typeof d.summary === "string" &&
    Array.isArray(d.manifest) &&
    Array.isArray(d.inventory) &&
    Array.isArray(d.staffing) &&
    Array.isArray(d.considerations)
  );
}

export function Planner() {
  const ref = useReveal<HTMLDivElement>();
  const fieldId = useId();
  const [occasion, setOccasion] = useState("Corporate Summit");
  const [guests, setGuests] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("drafting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, guests, location, eventDate, brief }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await response.json().catch(() => null)
        : null;

      if (response.ok && isDraft(data?.draft)) {
        setDraft(data.draft);
        setStatus("drafted");
        return;
      }

      // A server without a key is a feature that is off, not a failure the
      // visitor caused — say so differently and point them at the real form.
      if (response.status === 503) {
        setStatus("unavailable");
        return;
      }

      setErrorMessage(data?.error ?? "The planner could not draft that just now.");
      setStatus("error");
    } catch {
      setStatus("error");
      setErrorMessage("The planner could not be reached. Please use the quote form below.");
    }
  };

  const isDrafting = status === "drafting";

  return (
    <section id="planner" className="relative z-[1] py-28">
      <div ref={ref} className="mx-auto max-w-[1180px] px-7">
        <div className="mb-10 max-w-[760px]">
          <SectionLabel className="reveal mb-5">Draft Planner</SectionLabel>
          <h2 className="reveal mb-5 text-section font-medium text-balance font-serif text-paper">
            Sketch your run-of-show in a minute.
          </h2>
          <p className="reveal text-[15px] text-pretty text-ink">
            Describe the day you have in mind and we will draft a manifest against our own inventory —
            the same structure our crews build to. It is a starting point for the conversation, not a
            quote.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form onSubmit={handleSubmit} className="glass-strong reveal rounded-hero p-8">
            <div className="mb-5">
              <label htmlFor={`${fieldId}-occasion`} className={LABEL_CLASS}>
                Occasion
              </label>
              <select
                id={`${fieldId}-occasion`}
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className={cn(FIELD_CLASS, "select-field cursor-pointer")}
              >
                <option>Corporate Summit</option>
                <option>Wedding</option>
                <option>Roora / Lobola</option>
                <option>Private Party</option>
                <option>Other</option>
              </select>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor={`${fieldId}-guests`} className={LABEL_CLASS}>
                  Guests
                </label>
                <input
                  id={`${fieldId}-guests`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  required
                  placeholder="400"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
              <div>
                <label htmlFor={`${fieldId}-date`} className={LABEL_CLASS}>
                  Date
                </label>
                <input
                  id={`${fieldId}-date`}
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={cn(FIELD_CLASS, "cursor-pointer")}
                />
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor={`${fieldId}-location`} className={LABEL_CLASS}>
                Location
              </label>
              <input
                id={`${fieldId}-location`}
                type="text"
                placeholder="Wild Geese Lodge, Harare"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={FIELD_CLASS}
              />
            </div>

            <div>
              <label htmlFor={`${fieldId}-brief`} className={LABEL_CLASS}>
                What are you picturing?
              </label>
              <textarea
                id={`${fieldId}-brief`}
                rows={4}
                placeholder="Outdoor ceremony at 3pm, dinner under a glass marquee, live band until midnight."
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className={cn(FIELD_CLASS, "min-h-[104px] resize-y")}
              />
            </div>

            <Button type="submit" className="mt-7 w-full" disabled={isDrafting}>
              {isDrafting ? (
                <>
                  <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                  Drafting
                </>
              ) : (
                <>
                  <Wand2 aria-hidden="true" className="h-3.5 w-3.5" />
                  Draft my manifest
                </>
              )}
            </Button>

            <p
              role="status"
              aria-live="polite"
              className={cn(
                "mt-4 flex items-start justify-center gap-2 text-center font-mono text-[10.5px] uppercase tracking-[0.08em]",
                status === "error" ? "text-clay-bright" : "text-ink-dim"
              )}
            >
              {status === "error" && (
                <>
                  <AlertCircle aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
                  {errorMessage}
                </>
              )}
              {status === "unavailable" &&
                "The draft planner is offline — the quote form below reaches us directly."}
              {status !== "error" && status !== "unavailable" && "AI draft · not a quote"}
            </p>
          </form>

          <div className="glass reveal min-h-[420px] rounded-hero p-8">
            {status === "drafted" && draft ? (
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line-soft pb-5">
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-clay-bright">
                    <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                    AI draft · not a quote or a booking
                  </span>
                  <Button href="#contact" size="sm" variant="quiet" withArrow>
                    Get a real quote
                  </Button>
                </div>

                <p className="mb-7 text-[14px] leading-relaxed text-pretty text-paper-dim">
                  {draft.summary}
                </p>

                <ol className="mb-7 list-none border-t border-line-soft">
                  {draft.manifest.map((row, idx) => (
                    <li
                      key={`${row.time}-${idx}`}
                      className="grid grid-cols-1 gap-1 border-b border-line-soft py-4 sm:grid-cols-[96px_1fr] sm:gap-5"
                    >
                      <div className="font-mono text-[12px] text-azure">{row.time}</div>
                      <div>
                        <h3 className="font-sans text-[14px] font-semibold text-paper">{row.title}</h3>
                        <p className="mt-1 text-[12.5px] text-pretty text-ink">{row.description}</p>
                        <span className="mt-2 inline-block rounded-full bg-clay-soft px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-clay-bright">
                          {row.category}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {[
                    ["Inventory", draft.inventory],
                    ["Staffing", draft.staffing],
                  ].map(([heading, items]) => (
                    <div key={heading as string}>
                      <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-dim">
                        {heading as string}
                      </h4>
                      <ul className="flex flex-col gap-2">
                        {(items as string[]).map((item) => (
                          <li key={item} className="relative pl-4 text-[12.5px] text-pretty text-ink">
                            <span
                              aria-hidden="true"
                              className="absolute left-0 top-[0.55em] h-1 w-1 rounded-full bg-azure"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {draft.considerations.length > 0 && (
                  <div className="mt-7 rounded-card bg-clay-soft/50 p-5">
                    <h4 className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-clay-bright">
                      Worth raising with us
                    </h4>
                    <ul className="flex flex-col gap-2">
                      {draft.considerations.map((item) => (
                        <li key={item} className="text-[12.5px] text-pretty text-paper-dim">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-[356px] flex-col items-center justify-center text-center">
                <span
                  className={cn(
                    "mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-azure-soft text-azure",
                    isDrafting && "animate-pulse"
                  )}
                >
                  {isDrafting ? (
                    <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin" />
                  ) : (
                    <Sparkles aria-hidden="true" className="h-6 w-6" />
                  )}
                </span>
                <h3 className="mb-2 font-serif text-[22px] text-paper">
                  {isDrafting ? "Working through the build…" : "Your draft appears here"}
                </h3>
                <p className="max-w-[320px] text-[13px] text-pretty text-ink">
                  {isDrafting
                    ? "Sequencing structures, technical tuning, and service against our inventory."
                    : "Every line is drafted against equipment Eventive actually owns — no sub-hires, no invented kit."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
