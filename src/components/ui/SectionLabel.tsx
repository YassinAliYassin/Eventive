import { cn } from "../../lib/cn";

interface SectionLabelProps {
  children: React.ReactNode;
  /** Clay is the default eyebrow colour; azure is used when clay would clash with a nearby tag. */
  tone?: "clay" | "azure";
  className?: string;
}

/**
 * The rule-and-caps eyebrow that opens every section. Kept in one place so the
 * rule length, tracking, and accent colour stay identical across the page.
 */
export function SectionLabel({ children, tone = "clay", className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em]",
        tone === "clay" ? "text-clay-bright" : "text-azure",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-block h-px w-[18px]",
          tone === "clay" ? "bg-clay-bright" : "bg-azure"
        )}
      />
      {children}
    </div>
  );
}
