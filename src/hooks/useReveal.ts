import { useEffect, useRef } from "react";

interface RevealOptions {
  /** Milliseconds added per sibling so a grid cascades instead of popping at once. */
  stagger?: number;
  /** Ceiling on the cascade so long lists never feel like they are lagging. */
  maxDelay?: number;
}

/**
 * Attaches an IntersectionObserver to every `.reveal` element within the
 * returned ref's subtree and adds `.in` the first time it scrolls into view.
 * Siblings sharing a parent are staggered via the `--reveal-delay` custom property.
 */
export function useReveal<T extends HTMLElement>({
  stagger = 70,
  maxDelay = 420,
}: RevealOptions = {}) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (targets.length === 0) return;

    // Index within the parent, so each row or grid restarts its own cascade.
    const seenPerParent = new Map<Element, number>();
    targets.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const index = seenPerParent.get(parent) ?? 0;
      seenPerParent.set(parent, index + 1);
      el.style.setProperty("--reveal-delay", `${Math.min(index * stagger, maxDelay)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [stagger, maxDelay]);

  return containerRef;
}
