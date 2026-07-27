import { Suspense, lazy, useEffect, useState } from "react";
import { Header } from "./components/marketing/Header";
import { Hero } from "./components/marketing/Hero";
import { About } from "./components/marketing/About";
import { Services } from "./components/marketing/Services";
import { Manifest } from "./components/marketing/Manifest";
import { Venues } from "./components/marketing/Venues";
import { Studio } from "./components/marketing/Studio";
import { Contact } from "./components/marketing/Contact";
import { Footer } from "./components/marketing/Footer";

// three.js is heavy — it must never load for the marketing site.
const PropertyStudio = lazy(() =>
  import("./planner/PropertyStudio").then((module) => ({ default: module.PropertyStudio }))
);

const STUDIO_PATH = "/studio";

function useRoute(): string {
  const [path, setPath] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname
  );
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  return path;
}

export default function App() {
  const path = useRoute();

  if (path.startsWith(STUDIO_PATH)) {
    return (
      <Suspense fallback={<StudioLoading />}>
        <PropertyStudio />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Manifest />
        <Venues />
        <Studio />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function StudioLoading() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-canvas">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-line border-t-azure" />
        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
          Loading Property Studio
        </p>
      </div>
    </div>
  );
}
