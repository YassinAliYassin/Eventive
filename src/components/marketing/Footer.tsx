import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="relative z-[1] px-4 pb-6">
      <div className="max-w-[1180px] mx-auto glass rounded-[32px] px-9 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-8 border-b border-line-soft">
          <div>
            <div className="font-serif italic text-2xl text-paper mb-3">Eventive</div>
            <p className="text-[12.5px] text-ink max-w-[220px]">
              Full-service events logistics and mobile hospitality, run from our own owned inventory.
            </p>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-brass-bright mb-4">
              Zimbabwe
            </div>
            <div className="flex flex-col gap-2 font-mono text-[10.5px] text-ink tracking-[0.05em] break-words">
              <span>Harare, Zimbabwe</span>
              <a
                href="mailto:events@eventive.co.zw"
                className="hover:text-azure transition-colors w-fit"
              >
                events@eventive.co.zw
              </a>
              <a
                href="https://instagram.com/eventive.co.zw"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-azure transition-colors w-fit"
              >
                @eventive.co.zw
              </a>
              <span>Harare · Bulawayo · Vic Falls · Nyanga · Selous</span>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-brass-bright mb-4">
              South Africa
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-serif italic text-[17px] text-paper">We Are Fresh People</span>
              <a
                href="https://fresh-people.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10.5px] text-ink tracking-[0.05em] hover:text-azure transition-colors w-fit"
              >
                fresh-people.co.za
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 font-mono text-[10px] text-ink-dim tracking-[0.05em] flex flex-col md:flex-row items-center md:items-baseline justify-between gap-2 text-center md:text-left">
          <span>&copy; {new Date().getFullYear()} Eventive. All rights reserved.</span>
          <Link to="/timesheet" className="hover:text-azure transition-colors">
            Staff Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}
