import { useReveal } from "../../hooks/useReveal";
import { Button } from "../ui/Button";
import { SectionLabel } from "../ui/SectionLabel";

const STATS = [
  { value: "5", label: "Cities Serviced Nationwide" },
  { value: "1,500", label: "Guests, Largest Single Deployment" },
  { value: "100%", label: "Owned Inventory, No Sub-Hires" },
];

const CAPABILITIES = [
  ["Coverage", "Harare, Bulawayo, Vic Falls, Nyanga, Selous"],
  ["Inventory", "Marquees, line-array audio, generators, staging"],
  ["Staffing", "Silver-service crews, mixologists, marshals"],
  ["Power", "Silent diesel backup, 10–45kVA fleets"],
];

export function Hero() {
  const ref = useReveal<HTMLDivElement>({ stagger: 90 });

  return (
    <section
      id="home"
      className="relative z-[1] flex min-h-[100svh] items-center pb-[100px] pt-[150px]"
    >
      <div ref={ref} className="mx-auto w-full max-w-[1180px] px-7">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionLabel className="reveal mb-6">
              Harare Logistics Hub · Est. Zimbabwe
            </SectionLabel>
            <h1 className="reveal mb-7 text-display font-medium text-balance font-serif text-paper">
              The full-service
              <br />
              <em className="italic text-azure">events logistics</em>
              <br />
              house of Zimbabwe.
            </h1>
            <p className="reveal mb-10 max-w-[480px] text-base text-pretty text-ink">
              From presidential-tier corporate summits to heritage Roora celebrations, Eventive owns and
              operates its entire inventory — marquees, sound, power, and staff — so nothing is ever left
              to a sub-hire.
            </p>
            <div className="reveal mb-14 flex flex-wrap gap-4">
              <Button href="#contact" withArrow>
                Request a Quote
              </Button>
              <Button href="#services" variant="glass">
                View Capabilities
              </Button>
            </div>
          </div>

          <div className="reveal relative">
            <div className="glass relative overflow-hidden rounded-hero p-10">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=60&w=900')",
                }}
              />
              {/* Warms the lower half of the card so the list sits on a gradient, not flat glass */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-clay-soft/40 to-transparent" />

              <div className="relative z-[1]">
                <div className="float-slow relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border-[1.5px] border-azure">
                  <div className="absolute inset-1.5 rounded-full border border-azure opacity-40" />
                  <span className="text-center font-serif text-[15px] italic leading-[1.15] text-azure">
                    EST.
                    <br />
                    HARARE
                  </span>
                </div>
                <h2 className="mb-1.5 text-center font-serif text-[26px] text-paper">Eventive</h2>
                <div className="mb-7 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-clay-bright">
                  Zimbabwe · Nationwide Logistics
                </div>
                <ul className="flex flex-col gap-4">
                  {CAPABILITIES.map(([label, value], idx) => (
                    <li
                      key={label}
                      className={`flex gap-3 pt-4 text-[13px] text-ink ${
                        idx > 0 ? "border-t border-line-soft" : ""
                      }`}
                    >
                      <strong className="inline-block min-w-[92px] font-semibold text-paper">
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

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="glass lift reveal rounded-card px-7 py-6">
              <div className="font-sans text-[34px] font-bold leading-none tracking-tight text-paper">
                {stat.value}
              </div>
              <div className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-dim">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
