import { Header } from "../components/marketing/Header";
import { Hero } from "../components/marketing/Hero";
import { About } from "../components/marketing/About";
import { Services } from "../components/marketing/Services";
import { Manifest } from "../components/marketing/Manifest";
import { Venues } from "../components/marketing/Venues";
import { Contact } from "../components/marketing/Contact";
import { Footer } from "../components/marketing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Services />
        <Manifest />
        <Venues />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
