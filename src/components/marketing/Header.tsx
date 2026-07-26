import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#manifest", label: "Logistics" },
  { href: "#venues", label: "Venues" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <div
        className={`max-w-[1180px] mx-auto rounded-3xl transition-all duration-300 ${
          isScrolled ? "glass-strong" : "glass"
        }`}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <a href="#home" className="font-serif italic text-[22px] text-paper flex items-baseline gap-2">
            Eventive
            <small className="font-mono not-italic text-[10.5px] tracking-[0.18em] text-clay-bright uppercase">
              Zimbabwe
            </small>
          </a>

          <nav className="hidden md:block">
            <ul className="flex gap-8 list-none">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-mono text-[11px] tracking-[0.1em] uppercase text-ink hover:text-azure transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            href="#contact"
            className="hidden md:inline-block font-mono text-[11px] tracking-[0.08em] uppercase bg-azure text-white px-5 py-2.5 rounded-full hover:bg-azure-bright transition-colors shadow-sm"
          >
            Request a Quote
          </a>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-paper cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col border-t border-line-soft px-3 pb-3 pt-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-3 rounded-2xl font-mono text-xs tracking-[0.08em] uppercase text-ink hover:text-azure hover:bg-white/60 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 px-3 py-3 rounded-2xl font-mono text-xs tracking-[0.08em] uppercase bg-azure text-white text-center"
            >
              Request a Quote
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
