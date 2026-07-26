import { useState } from "react";
import { cn } from "../../lib/cn";

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Applied to the fallback too, so a dead photo still animates like the real one. */
  fallbackClassName?: string;
}

/**
 * Photograph that fades in when it loads and leaves a branded gradient behind if
 * the host is unreachable. Several images on this site are hotlinked from venue
 * and stock domains, so a missing file must degrade rather than blank the card.
 */
export function CoverImage({ src, alt, className, fallbackClassName }: CoverImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-azure/25 via-canvas-deep to-clay/20",
          fallbackClassName
        )}
      />
      {status !== "failed" && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("failed")}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            status === "loaded" ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </>
  );
}
