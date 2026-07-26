import { ArrowUp } from "lucide-react";

const FOOTER_LINKS = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#manifest", label: "Logistics" },
  { href: "#venues", label: "Venues" },
  { href: "#contact", label: "Contact" },
];

const COLUMN_HEADING =
  "mb-4 font-mono text-[10px] uppercase tracking-[0.14em] text-clay-bright";

export function Footer() {
  return (
    <footer className="relative z-[1] px-4 pb-6">
      <div className="glass mx-auto max-w-[1180px] rounded-hero px-9 py-10">
        <div className="grid grid-cols-1 gap-10 border-b border-line-soft pb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 font-serif text-2xl italic text-paper">Eventive</div>
            <p className="max-w-[220px] text-[12.5px] text-pretty text-ink">
              Full-service events logistics and mobile hospitality, run from our own owned inventory.
            </p>
          </div>

          <nav aria-label="Footer">
            <div className={COLUMN_HEADING}>Explore</div>
            <ul className="flex list-none flex-col gap-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-mono text-[10.5px] tracking-[0.05em] text-ink transition-colors hover:text-azure"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <div className={COLUMN_HEADING}>Zimbabwe</div>
            <div className="flex flex-col gap-2 break-words font-mono text-[10.5px] tracking-[0.05em] text-ink">
              <span>Harare, Zimbabwe</span>
              <a
                href="mailto:events@eventive.co.zw"
                className="w-fit transition-colors hover:text-azure"
              >
                events@eventive.co.zw
              </a>
              <a
                href="https://instagram.com/eventive.co.zw"
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit transition-colors hover:text-azure"
              >
                @eventive.co.zw
              </a>
              <span>Harare · Bulawayo · Vic Falls · Nyanga · Selous</span>
            </div>
          </div>

          <div>
            <div className={COLUMN_HEADING}>South Africa</div>
            <div className="flex flex-col gap-2">
              <span className="font-serif text-[17px] italic text-paper">We Are Fresh People</span>
              <a
                href="https://fresh-people.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit font-mono text-[10.5px] tracking-[0.05em] text-ink transition-colors hover:text-azure"
              >
                fresh-people.co.za
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-6 font-mono text-[10px] tracking-[0.05em] text-ink-dim sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Eventive. All rights reserved.</span>
          <a
            href="#home"
            className="inline-flex items-center gap-2 uppercase tracking-[0.12em] transition-colors hover:text-azure"
          >
            Back to top
            <ArrowUp aria-hidden="true" className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
