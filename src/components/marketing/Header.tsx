import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/Button";
import { useActiveSection } from "../../hooks/useActiveSection";
import { cn } from "../../lib/cn";

// "Contact" is deliberately absent — the Request a Quote button is that link,
// and repeating it would cost a nav slot the new sections need.
const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#manifest", label: "Logistics" },
  { href: "#venues", label: "Venues" },
  { href: "#faq", label: "FAQ" },
];

const SECTION_IDS = NAV_LINKS.map((link) => link.href.slice(1));

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeSection = useActiveSection(SECTION_IDS);

  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      // Reads are batched into one frame so the bar stays smooth while scrolling.
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setIsScrolled(window.scrollY > 20);
        setProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Escape closes the menu wherever focus happens to be.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMobileMenuOpen]);

  // Resizing past the md breakpoint reveals the desktop nav; drop the panel with it.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMobileMenuOpen(false);
    };
    desktop.addEventListener("change", handleChange);
    return () => desktop.removeEventListener("change", handleChange);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-4 transition-[padding] duration-300",
        isScrolled ? "pt-2" : "pt-4"
      )}
    >
      {/* Reading progress, pinned above the bar */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-0.5 origin-left bg-azure/80 transition-opacity duration-300"
        style={{ transform: `scaleX(${progress})`, opacity: isScrolled ? 1 : 0 }}
        aria-hidden="true"
      />

      <div
        className={cn(
          "mx-auto max-w-[1180px] rounded-hero transition-all duration-300",
          // The open menu overlays page content, so it needs the denser surface
          isScrolled || isMobileMenuOpen ? "glass-strong" : "glass"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between px-6 transition-[padding] duration-300",
            isScrolled ? "py-3" : "py-4"
          )}
        >
          <a
            href="#home"
            className="flex items-baseline gap-2 font-serif text-[22px] italic text-paper"
          >
            Eventive
            <small className="font-mono text-[10.5px] uppercase not-italic tracking-[0.18em] text-clay-bright">
              Zimbabwe
            </small>
          </a>

          <nav className="hidden md:block" aria-label="Primary">
            <ul className="flex list-none gap-8">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      data-active={isActive}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "nav-link relative font-mono text-[11px] uppercase tracking-[0.1em] transition-colors",
                        isActive ? "text-azure" : "text-ink hover:text-azure"
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Button href="#contact" size="sm" className="hidden md:inline-flex" withArrow>
            Request a Quote
          </Button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="cursor-pointer rounded-full p-1 text-paper transition-colors hover:text-azure md:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* grid-rows 0fr → 1fr animates the panel open without measuring its height */}
        <div
          id="mobile-menu"
          className={cn(
            // Near-opaque rather than glass: the panel covers page content, and
            // legibility here cannot depend on backdrop-filter being supported.
            "grid overflow-hidden rounded-b-hero bg-[rgba(252,251,249,0.98)] transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
            isMobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0">
            <div className="flex flex-col border-t border-line-soft px-3 pb-3 pt-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  tabIndex={isMobileMenuOpen ? undefined : -1}
                  className={cn(
                    "rounded-card px-3 py-3 font-mono text-xs uppercase tracking-[0.08em] transition-colors hover:bg-white/60 hover:text-azure",
                    activeSection === link.href.slice(1) ? "text-azure" : "text-ink"
                  )}
                >
                  {link.label}
                </a>
              ))}
              <Button
                href="#contact"
                size="sm"
                className="mt-2 py-3"
                onClick={() => setIsMobileMenuOpen(false)}
                tabIndex={isMobileMenuOpen ? undefined : -1}
              >
                Request a Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
