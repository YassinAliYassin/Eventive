import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CoverImage } from "./CoverImage";
import { Modal } from "./Modal";

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
 * Image viewer. Modal handles the shell — portal, focus trap, Escape, scroll
 * lock — leaving this to deal with stepping between slides.
 */
export function Lightbox({ slides, index, onClose, onNavigate }: LightboxProps) {
  const slide = slides[index];

  const goTo = useCallback(
    (delta: number) => onNavigate((index + delta + slides.length) % slides.length),
    [index, slides.length, onNavigate]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(-1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goTo]);

  if (!slide) return null;

  return (
    <Modal
      label={`${slide.title} — image ${index + 1} of ${slides.length}`}
      onClose={onClose}
      className="max-w-[980px]"
    >
      <button
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
    </Modal>
  );
}
