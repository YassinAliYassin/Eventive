import { FormEvent, useState } from "react";
import { useReveal } from "../../hooks/useReveal";

const CONTACT_LINES = [
  { key: "Hub", value: "Harare, Zimbabwe" },
  { key: "Email", value: "events@eventive.co.zw", href: "mailto:events@eventive.co.zw" },
  { key: "Instagram", value: "@eventive.co.zw", href: "https://instagram.com/eventive.co.zw" },
  { key: "Coverage", value: "Harare · Bulawayo · Victoria Falls · Nyanga · Selous" },
];

const FIELD_CLASS =
  "w-full bg-white/70 border border-line rounded-2xl px-4 py-3 text-paper text-[13.5px] placeholder:text-ink-dim/70 focus:outline-none focus:border-azure focus:ring-2 focus:ring-azure/20 transition-all";

export function Contact() {
  const ref = useReveal<HTMLDivElement>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [occasion, setOccasion] = useState("Corporate Summit");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const body = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Occasion: ${occasion}`,
      `Event Date: ${eventDate}`,
      `Notes: ${notes}`,
    ].join("\n");
    const mailto = `mailto:events@eventive.co.zw?subject=${encodeURIComponent(
      `Quote Request — ${occasion}`
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <section id="contact" className="py-28">
      <div ref={ref} className="max-w-[1180px] mx-auto px-7">
        <div className="reveal grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brass-bright inline-flex items-center gap-2.5 mb-5">
              <span className="w-[18px] h-px bg-brass-bright inline-block" />
              Open a Manifest
            </div>
            <h2 className="font-serif font-medium text-paper text-[34px] md:text-[42px] mb-5">
              Let&apos;s plan your event.
            </h2>
            <p className="text-[15px] text-ink max-w-[440px] mb-8">
              Tell us the date, the guest count, and the occasion — our Harare team will respond with a
              detailed logistics quote within one business day.
            </p>
            <div className="glass rounded-[28px] p-8 flex flex-col gap-5">
              {CONTACT_LINES.map((line) => (
                <div
                  key={line.key}
                  className="flex flex-col sm:flex-row gap-1 sm:gap-4 sm:items-baseline text-sm"
                >
                  <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim sm:min-w-[90px] sm:shrink-0">
                    {line.key}
                  </span>
                  {line.href ? (
                    <a
                      href={line.href}
                      target={line.href.startsWith("http") ? "_blank" : undefined}
                      rel={line.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-azure hover:text-azure-bright transition-colors font-medium min-w-0 break-words"
                    >
                      {line.value}
                    </a>
                  ) : (
                    <span className="text-paper-dim min-w-0 break-words">{line.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-strong rounded-[32px] p-9">
            <div className="mb-5">
              <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Tinashe Moyo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={FIELD_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="+263 77 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={FIELD_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim mb-2">
                  Occasion
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className={`${FIELD_CLASS} cursor-pointer`}
                >
                  <option>Corporate Summit</option>
                  <option>Wedding</option>
                  <option>Roora / Lobola</option>
                  <option>Private Party</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className={`${FIELD_CLASS} cursor-pointer`}
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim mb-2">
                Notes
              </label>
              <textarea
                placeholder="Guest count, venue, and anything else we should know."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className={`${FIELD_CLASS} resize-y min-h-[100px]`}
              />
            </div>

            <div className="mt-7">
              <button
                type="submit"
                className="w-full font-mono text-xs tracking-[0.08em] uppercase bg-azure text-white py-4 rounded-full border-none cursor-pointer hover:bg-azure-bright transition-colors shadow-md shadow-azure/20"
              >
                Send Inquiry
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
