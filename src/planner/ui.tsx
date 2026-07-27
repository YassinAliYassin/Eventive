/** Small presentational primitives shared by the planner panels. */

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

/**
 * Button with a dropdown. Keeps the toolbar to a handful of controls, which is
 * what makes the studio usable on a phone as well as a desktop.
 */
export function Menu({
  label,
  icon,
  children,
  align = "right",
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
          open
            ? "border-azure/40 bg-azure-soft text-azure-bright"
            : "border-line bg-white/60 text-paper-dim hover:bg-white"
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>
      {open && (
        <div
          className={`absolute top-full z-40 mt-1 w-60 rounded-xl border border-line bg-panel-raised p-2 shadow-lg backdrop-blur ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  children,
  onClick,
  icon,
}: {
  children: ReactNode;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-paper-dim transition hover:bg-azure-soft hover:text-azure-bright"
    >
      {icon}
      {children}
    </button>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line-soft px-4 py-4 last:border-b-0">
      <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-clay">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs text-ink-dim">{label}</span>
      <span className="flex-shrink-0">{children}</span>
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      className={`rounded-lg border border-line bg-white/70 px-2.5 py-1.5 text-sm text-paper outline-none transition focus:border-azure focus:ring-2 focus:ring-azure/20 ${className}`}
    />
  );
}

export function NumberInput({
  value,
  onChange,
  step = 0.1,
  min,
  max,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <input
        type="number"
        value={Number.isFinite(value) ? Math.round(value * 1000) / 1000 : 0}
        step={step}
        min={min}
        max={max}
        onChange={(event) => {
          const parsed = Number.parseFloat(event.target.value);
          if (!Number.isNaN(parsed)) onChange(clamp(parsed, min, max));
        }}
        className="w-20 rounded-lg border border-line bg-white/70 px-2 py-1.5 text-right font-mono text-xs text-paper outline-none transition focus:border-azure focus:ring-2 focus:ring-azure/20"
      />
      {suffix && <span className="w-5 font-mono text-[10px] text-ink-dim">{suffix}</span>}
    </span>
  );
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 0.01,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number.parseFloat(event.target.value))}
      className="h-1.5 w-32 cursor-pointer appearance-none rounded-full bg-azure-soft accent-azure"
    />
  );
}

export function Select<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className="rounded-lg border border-line bg-white/70 px-2 py-1.5 text-xs text-paper outline-none transition focus:border-azure focus:ring-2 focus:ring-azure/20"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-2.5 py-1.5 text-xs transition ${
        checked
          ? "border-azure/40 bg-azure-soft text-azure-bright"
          : "border-line bg-white/50 text-ink-dim hover:border-line"
      }`}
    >
      <span>{label}</span>
      <span
        className={`relative h-4 w-7 rounded-full transition ${checked ? "bg-azure" : "bg-ink/25"}`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
            checked ? "left-3.5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function Button({
  children,
  onClick,
  variant = "ghost",
  disabled,
  title,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  const styles = {
    primary: "bg-azure text-white hover:bg-azure-bright border-transparent",
    ghost: "bg-white/60 text-paper-dim hover:bg-white border-line",
    danger: "bg-clay-soft text-clay-bright hover:bg-clay hover:text-white border-transparent",
  }[variant];
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function ColorRow({
  value,
  onChange,
  swatches,
}: {
  value: string;
  onChange: (value: string) => void;
  swatches: string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {swatches.map((swatch) => (
        <button
          key={swatch}
          type="button"
          onClick={() => onChange(swatch)}
          aria-label={swatch}
          className={`h-6 w-6 rounded-md border transition ${
            value.toLowerCase() === swatch.toLowerCase()
              ? "border-azure ring-2 ring-azure/30"
              : "border-line"
          }`}
          style={{ backgroundColor: swatch }}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-6 w-8 cursor-pointer rounded-md border border-line bg-transparent p-0"
      />
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line-soft bg-white/50 px-2.5 py-2">
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-dim">{label}</div>
      <div className="mt-0.5 font-mono text-sm text-paper">{value}</div>
    </div>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-ink-dim">{children}</p>;
}

function clamp(value: number, min?: number, max?: number): number {
  let result = value;
  if (min !== undefined) result = Math.max(min, result);
  if (max !== undefined) result = Math.min(max, result);
  return result;
}
