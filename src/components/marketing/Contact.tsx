import { useId, useState, type FormEvent } from "react";
import { AlertCircle, AtSign, CheckCircle2, Instagram, Loader2, Map, MapPin } from "lucide-react";
import { useReveal } from "../../hooks/useReveal";
import { Button } from "../ui/Button";
import { SectionLabel } from "../ui/SectionLabel";
import { cn } from "../../lib/cn";

const CONTACT_LINES = [
  { key: "Hub", icon: MapPin, value: "Harare, Zimbabwe" },
  {
    key: "Email",
    icon: AtSign,
    value: "events@eventive.co.zw",
    href: "mailto:events@eventive.co.zw",
  },
  {
    key: "Instagram",
    icon: Instagram,
    value: "@eventive.co.zw",
    href: "https://instagram.com/eventive.co.zw",
  },
  {
    key: "Coverage",
    icon: Map,
    value: "Harare · Bulawayo · Victoria Falls · Nyanga · Selous",
  },
];

const FIELD_CLASS =
  "w-full rounded-field border border-line bg-white/70 px-4 py-3 text-[13.5px] text-paper transition-all placeholder:text-ink-dim/70 focus:border-azure focus:outline-none focus:ring-2 focus:ring-azure/20";

const LABEL_CLASS =
  "mb-2 block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-dim";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

export function Contact() {
  const ref = useReveal<HTMLDivElement>();
  const fieldId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [occasion, setOccasion] = useState("Corporate Summit");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const buildMailto = () => {
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Occasion: ${occasion}`,
      `Event Date: ${eventDate}`,
      "",
      `Notes: ${notes}`,
    ].join("\n");
    return `mailto:events@eventive.co.zw?subject=${encodeURIComponent(
      `Quote Request — ${occasion}`
    )}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const payload = { name, email, phone, occasion, eventDate, notes };

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // A 200 alone is not proof of delivery: static hosts commonly rewrite every
      // unmatched path to index.html, so only a JSON acknowledgement counts.
      if (response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        const body = contentType.includes("application/json")
          ? await response.json().catch(() => null)
          : null;

        if (body?.status === "received") {
          setStatus("sent");
          return;
        }
        setStatus("mailto");
        window.location.href = buildMailto();
        return;
      }

      const data = await response.json().catch(() => ({}) as { error?: string });

      // A rejected field is the visitor's to fix; anything else is our problem,
      // and handing them their mail client beats losing the inquiry.
      if (response.status === 400 || response.status === 429) {
        setErrorMessage(data.error ?? "Please check the form and try again.");
        setStatus("error");
        return;
      }

      setStatus("mailto");
      window.location.href = buildMailto();
    } catch {
      setStatus("mailto");
      window.location.href = buildMailto();
    }
  };

  const isSending = status === "sending";

  return (
    <section id="contact" className="relative z-[1] py-28">
      <div ref={ref} className="mx-auto max-w-[1180px] px-7">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2">
          <div className="reveal">
            <SectionLabel className="mb-5">Open a Manifest</SectionLabel>
            <h2 className="mb-5 text-section font-medium text-balance font-serif text-paper">
              Let&apos;s plan your event.
            </h2>
            <p className="mb-8 max-w-[440px] text-[15px] text-pretty text-ink">
              Tell us the date, the guest count, and the occasion — our Harare team will respond with a
              detailed logistics quote within one business day.
            </p>
            <div className="glass flex flex-col gap-5 rounded-panel p-8">
              {CONTACT_LINES.map((line) => {
                const Icon = line.icon;
                return (
                  <div
                    key={line.key}
                    className="flex flex-col gap-1 text-sm sm:flex-row sm:items-baseline sm:gap-4"
                  >
                    <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-dim sm:min-w-[104px] sm:shrink-0">
                      <Icon aria-hidden="true" className="h-3.5 w-3.5 text-clay" />
                      {line.key}
                    </span>
                    {line.href ? (
                      <a
                        href={line.href}
                        target={line.href.startsWith("http") ? "_blank" : undefined}
                        rel={line.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="min-w-0 break-words font-medium text-azure transition-colors hover:text-azure-bright"
                      >
                        {line.value}
                      </a>
                    ) : (
                      <span className="min-w-0 break-words text-paper-dim">{line.value}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {status === "sent" ? (
            <div className="glass-strong reveal flex min-h-[420px] flex-col items-center justify-center rounded-hero p-9 text-center">
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-azure-soft text-azure">
                <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
              </span>
              <h3 className="mb-3 font-serif text-[26px] text-paper">Inquiry received.</h3>
              <p className="max-w-[340px] text-[14px] text-pretty text-ink">
                Thank you, {name.split(" ")[0] || "there"}. Our Harare team will come back to you with a
                detailed logistics quote within one business day.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-7 cursor-pointer font-mono text-[10.5px] uppercase tracking-[0.1em] text-azure transition-colors hover:text-azure-bright"
              >
                Send another inquiry
              </button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="glass-strong reveal rounded-hero p-9">
            <div className="mb-5">
              <label htmlFor={`${fieldId}-name`} className={LABEL_CLASS}>
                Full Name
              </label>
              <input
                id={`${fieldId}-name`}
                type="text"
                required
                autoComplete="name"
                placeholder="Tinashe Moyo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={FIELD_CLASS}
              />
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor={`${fieldId}-email`} className={LABEL_CLASS}>
                  Email
                </label>
                <input
                  id={`${fieldId}-email`}
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
              <div>
                <label htmlFor={`${fieldId}-phone`} className={LABEL_CLASS}>
                  Phone
                </label>
                <input
                  id={`${fieldId}-phone`}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+263 77 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
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
              <div>
                <label htmlFor={`${fieldId}-date`} className={LABEL_CLASS}>
                  Event Date
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

            <div>
              <label htmlFor={`${fieldId}-notes`} className={LABEL_CLASS}>
                Notes
              </label>
              <textarea
                id={`${fieldId}-notes`}
                placeholder="Guest count, venue, and anything else we should know."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className={cn(FIELD_CLASS, "min-h-[100px] resize-y")}
              />
            </div>

            <Button type="submit" className="mt-7 w-full" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                  Sending
                </>
              ) : (
                "Send Inquiry"
              )}
            </Button>

            <p
              role="status"
              aria-live="polite"
              className={cn(
                "mt-4 flex items-center justify-center gap-2 text-center font-mono text-[10.5px] uppercase tracking-[0.08em]",
                status === "error" ? "text-clay-bright" : "text-ink-dim"
              )}
            >
              {status === "error" && (
                <>
                  <AlertCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  {errorMessage}
                </>
              )}
              {status === "mailto" && (
                <>
                  <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-azure" />
                  Opening your mail app — press send there and we&apos;ll reply within a day.
                </>
              )}
              {(status === "idle" || status === "sending") &&
                "Replies within one business day · Harare team"}
            </p>
          </form>
          )}
        </div>
      </div>
    </section>
  );
}
