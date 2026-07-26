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
 *
 * Elements that mount later — a filtered grid, a form swapped for its success
 * panel — are picked up by a MutationObserver. Without it they would keep the
 * `.reveal` starting styles and stay invisible permanently.
 */
export function useReveal<T extends HTMLElement>({
  stagger = 70,
  maxDelay = 420,
}: RevealOptions = {}) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const observed = new WeakSet<Element>();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            intersectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    const register = () => {
      const targets = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));

      // Index within the parent, so each row or grid restarts its own cascade.
      const seenPerParent = new Map<Element, number>();
      targets.forEach((el) => {
        const parent = el.parentElement;
        if (parent) {
          const index = seenPerParent.get(parent) ?? 0;
          seenPerParent.set(parent, index + 1);
          el.style.setProperty("--reveal-delay", `${Math.min(index * stagger, maxDelay)}ms`);
        }

        if (observed.has(el) || el.classList.contains("in")) return;
        observed.add(el);
        intersectionObserver.observe(el);
      });
    };

    register();

    const mutationObserver = new MutationObserver(register);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [stagger, maxDelay]);

  return containerRef;
}
