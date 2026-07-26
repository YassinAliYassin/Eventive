import { useReveal } from "../../hooks/useReveal";

const STATS = [
  { value: "5", label: "Cities Serviced Nationwide" },
  { value: "1,500", label: "Guests, Largest Single Deployment" },
  { value: "100%", label: "Owned Inventory, No Sub-Hires" },
];

export function Hero() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="home" className="relative z-[1] min-h-screen flex items-center pt-[160px] pb-[100px]">
      <div ref={ref} className="max-w-[1180px] mx-auto px-7 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <div>
            <div className="mb-6 font-mono text-[11px] tracking-[0.18em] uppercase text-brass-bright inline-flex items-center gap-2.5">
              <span className="w-[18px] h-px bg-brass-bright inline-block" />
              Harare Logistics Hub · Est. Zimbabwe
            </div>
            <h1 className="font-serif font-medium text-paper leading-[1.04] mb-7 text-[40px] md:text-[56px] lg:text-[68px]">
              The full-service
              <br />
              <em className="italic text-azure">events logistics</em>
              <br />
              house of Zimbabwe.
            </h1>
            <p className="text-base text-ink max-w-[480px] mb-10">
              From presidential-tier corporate summits to heritage Roora celebrations, Eventive owns and
              operates its entire inventory — marquees, sound, power, and staff — so nothing is ever left
              to a sub-hire.
            </p>
            <div className="flex gap-4 flex-wrap mb-14">
              <a
                href="#contact"
                className="font-mono text-xs tracking-[0.08em] uppercase bg-azure text-white px-8 py-4 rounded-full hover:bg-azure-bright hover:-translate-y-px transition-all shadow-md shadow-azure/20"
              >
                Request a Quote
              </a>
              <a
                href="#services"
                className="glass font-mono text-xs tracking-[0.08em] uppercase px-8 py-4 rounded-full text-paper-dim hover:text-azure transition-colors"
              >
                View Capabilities
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="glass relative rounded-[32px] p-10 overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.12] bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=60&w=900')",
                }}
              />
              <div className="relative z-[1]">
                <div className="w-28 h-28 rounded-full border-[1.5px] border-azure flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-1.5 border border-azure rounded-full opacity-40" />
                  <span className="font-serif italic text-azure text-[15px] text-center leading-[1.15]">
                    EST.
                    <br />
                    HARARE
                  </span>
                </div>
                <h3 className="text-center font-serif text-[26px] text-paper mb-1.5">Eventive</h3>
                <div className="text-center font-mono text-[10px] tracking-[0.14em] uppercase text-brass-bright mb-7">
                  Zimbabwe · Nationwide Logistics
                </div>
                <ul className="flex flex-col gap-4">
                  {[
                    ["Coverage", "Harare, Bulawayo, Vic Falls, Nyanga, Selous"],
                    ["Inventory", "Marquees, line-array audio, generators, staging"],
                    ["Staffing", "Silver-service crews, mixologists, marshals"],
                    ["Power", "Silent diesel backup, 10–45kVA fleets"],
                  ].map(([label, value], idx) => (
                    <li
                      key={label}
                      className={`flex gap-3 text-[13px] text-ink pt-4 ${
                        idx > 0 ? "border-t border-line-soft" : ""
                      }`}
                    >
                      <strong className="text-paper font-semibold min-w-[92px] inline-block">
                        {label}
                      </strong>
                      {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-16">
          {STATS.map((stat) => (
            <div key={stat.label} className="glass rounded-3xl px-7 py-6">
              <div className="font-sans font-bold text-paper text-[34px] tracking-tight leading-none">
                {stat.value}
              </div>
              <div className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink-dim mt-2.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
