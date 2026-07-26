import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CoverImage } from "./CoverImage";

export interface LightboxSlide {
  id: string;
  image: string;
  title: string;
  caption: string;
  meta: string;
}

interface LightboxProps {
  slides: LightboxSlide[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

/**
 * Modal image viewer. Traps Tab within the dialog, closes on Escape or backdrop
 * click, restores focus to the trigger on close, and freezes the page behind it.
 */
export function Lightbox({ slides, index, onClose, onNavigate }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const slide = slides[index];

  const goTo = useCallback(
    (delta: number) => onNavigate((index + delta + slides.length) % slides.length),
    [index, slides.length, onNavigate]
  );

  // Focus starts on the close button, and returns to whatever opened the dialog.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  // The page behind a modal should not scroll with it.
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
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(-1);
        return;
      }
      if (e.key !== "Tab") return;

      // Keep Tab inside the dialog while it is open.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
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
  }, [goTo, onClose]);

  if (!slide) return null;

  /*
   * Portalled to <body> on purpose. Every section on this page sets `relative
   * z-[1]`, which creates a stacking context — rendered in place, no z-index
   * here could lift the dialog above the fixed header.
   */
  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-paper/70 p-4 backdrop-blur-md sm:p-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${slide.title} — image ${index + 1} of ${slides.length}`}
        className="glass-strong relative flex max-h-full w-full max-w-[980px] flex-col overflow-hidden rounded-hero"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="glass-chip absolute right-4 top-4 z-10 cursor-pointer rounded-full p-2.5 text-paper transition-colors hover:text-azure"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>

        {/* Fixed ratio: an image that fails to load must not collapse the dialog */}
        <div className="relative aspect-[16/9] max-h-[62vh] w-full">
          <CoverImage src={slide.image} alt={slide.title} />

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(-1)}
                aria-label="Previous image"
                className="glass-chip absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-2.5 text-paper transition-colors hover:text-azure"
              >
                <ChevronLeft aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goTo(1)}
                aria-label="Next image"
                className="glass-chip absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-2.5 text-paper transition-colors hover:text-azure"
              >
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 px-8 py-6">
          <div>
            <h3 className="font-serif text-[24px] text-paper">{slide.title}</h3>
            <p className="mt-1 text-[13px] text-ink">{slide.caption}</p>
          </div>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-clay-bright">
            {slide.meta}
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}
