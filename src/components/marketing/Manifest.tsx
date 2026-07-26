import { useState } from "react";
import { MANIFESTS } from "../../data/manifests";
import { useReveal } from "../../hooks/useReveal";

export function Manifest() {
  const [activeKey, setActiveKey] = useState(MANIFESTS[0].key);
  const active = MANIFESTS.find((m) => m.key === activeKey) ?? MANIFESTS[0];
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="manifest" className="py-28">
      <div ref={ref} className="max-w-[1180px] mx-auto px-7">
        <div className="reveal max-w-[760px] mb-10">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-brass-bright inline-flex items-center gap-2.5 mb-5">
            <span className="w-[18px] h-px bg-brass-bright inline-block" />
            Sample Run-of-Show
          </div>
          <h2 className="font-serif font-medium text-paper text-[34px] md:text-[42px] mb-5">
            A logistics manifest, not a guess.
          </h2>
          <p className="text-[15px] text-ink">
            Every Eventive deployment runs on a timed manifest — from marquee assembly two days out, to
            the last dance. Below is a real run-of-show from three of our most requested formats.
          </p>
        </div>

        <div className="reveal flex gap-2.5 flex-wrap mb-8">
          {MANIFESTS.map((manifest) => (
            <button
              key={manifest.key}
              onClick={() => setActiveKey(manifest.key)}
              className={`font-mono text-[11px] tracking-[0.06em] uppercase px-6 py-3 rounded-full transition-all cursor-pointer ${
                activeKey === manifest.key
                  ? "bg-azure text-white shadow-md shadow-azure/20"
                  : "glass text-ink hover:text-azure"
              }`}
            >
              {manifest.tabLabel}
            </button>
          ))}
        </div>

        <div className="reveal glass rounded-[28px] overflow-hidden">
          <div className="flex justify-between items-center gap-4 flex-wrap px-8 py-6 border-b border-line-soft font-mono text-[11px] tracking-[0.08em] uppercase text-ink-dim">
            <span>{active.title}</span>
            <span className="text-azure bg-azure-soft px-3 py-1.5 rounded-full tracking-[0.14em]">
              Confirmed
            </span>
          </div>
          <div>
            {active.rows.map((row, idx) => (
              <div
                key={row.title}
                className={`grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2.5 sm:gap-7 px-8 py-6 ${
                  idx < active.rows.length - 1 ? "border-b border-line-soft" : ""
                }`}
              >
                <div className="font-mono text-[13px] text-azure pt-0.5">{row.time}</div>
                <div>
                  <h4 className="text-base text-paper mb-1.5 font-sans font-semibold">{row.title}</h4>
                  <p className="text-[13px] text-ink">{row.description}</p>
                  <span className="inline-block mt-2.5 font-mono text-[9.5px] tracking-[0.1em] uppercase text-ink-dim bg-white/60 px-3 py-1 rounded-full">
                    {row.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
