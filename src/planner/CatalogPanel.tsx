/** Furnishing catalogue: pick a piece, then click the plan to place it. */

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATALOG, CATEGORIES } from "./catalog";
import { formatLength } from "./geometry";
import type { Units } from "./types";

interface CatalogPanelProps {
  selectedId: string | null;
  onPick: (catalogId: string) => void;
  units: Units;
}

export function CatalogPanel({ selectedId, onPick, units }: CatalogPanelProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return CATALOG.filter((entry) => {
      const matchesCategory = category === "All" || entry.category === category;
      const matchesQuery =
        needle.length === 0 ||
        entry.name.toLowerCase().includes(needle) ||
        entry.category.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line-soft p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-dim" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search furnishings"
            className="w-full rounded-lg border border-line bg-white/70 py-1.5 pl-8 pr-2 text-xs text-paper outline-none transition focus:border-azure focus:ring-2 focus:ring-azure/20"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {["All", ...CATEGORIES].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition ${
                category === name
                  ? "border-azure bg-azure text-white"
                  : "border-line bg-white/50 text-ink-dim hover:border-azure/40"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {results.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onPick(entry.id)}
              className={`flex flex-col items-start gap-2 rounded-xl border p-2.5 text-left transition ${
                selectedId === entry.id
                  ? "border-azure bg-azure-soft"
                  : "border-line bg-white/50 hover:border-azure/40 hover:bg-white"
              }`}
            >
              <span
                className="h-8 w-full rounded-md border border-line-soft"
                style={{
                  backgroundColor: entry.color,
                  borderRadius:
                    entry.shape === "round-table" || entry.shape === "cylinder" ? "9999px" : undefined,
                }}
              />
              <span className="text-[11px] font-medium leading-tight text-paper-dim">
                {entry.name}
              </span>
              <span className="font-mono text-[9px] text-ink-dim">
                {formatLength(entry.width, units)} × {formatLength(entry.depth, units)}
              </span>
            </button>
          ))}
        </div>
        {results.length === 0 && (
          <p className="py-6 text-center text-xs text-ink-dim">Nothing matches “{query}”.</p>
        )}
      </div>
    </div>
  );
}
