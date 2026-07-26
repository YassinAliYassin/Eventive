import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";

interface ModalProps {
  /** Accessible name for the dialog. */
  label: string;
  onClose: () => void;
  children: ReactNode;
  /** Classes for the panel itself; the backdrop is fixed. */
  className?: string;
}

/**
 * The shared shell behind every dialog on this site: portalled to <body>,
 * closes on Escape or a backdrop click, traps Tab inside itself, freezes the
 * page behind it, and hands focus back to whatever opened it.
 *
 * Portalled on purpose — every section sets `relative z-[1]`, which creates a
 * stacking context, so a dialog rendered in place can never rise above the
 * fixed header no matter what z-index it carries.
 */
export function Modal({ label, onClose, children, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus moves to the first control in the dialog, and returns on close.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (first ?? panelRef.current)?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-paper/70 p-4 backdrop-blur-md sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "glass-strong relative flex max-h-full w-full flex-col overflow-hidden rounded-hero focus:outline-none",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
