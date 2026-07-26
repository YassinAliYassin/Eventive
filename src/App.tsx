import { Header } from "./components/marketing/Header";
import { Hero } from "./components/marketing/Hero";
import { About } from "./components/marketing/About";
import { Services } from "./components/marketing/Services";
import { Manifest } from "./components/marketing/Manifest";
import { Work } from "./components/marketing/Work";
import { Venues } from "./components/marketing/Venues";
import { Testimonials } from "./components/marketing/Testimonials";
import { Faq } from "./components/marketing/Faq";
import { Contact } from "./components/marketing/Contact";
import { Footer } from "./components/marketing/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-canvas font-sans text-ink">
      {/* Off-screen until focused, so keyboard users can jump the nav */}
      <a
        href="#main"
        className="glass-strong sr-only rounded-full px-5 py-3 font-mono text-[11px] uppercase tracking-[0.1em] text-azure focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Services />
        <Work />
        <Manifest />
        <Venues />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
