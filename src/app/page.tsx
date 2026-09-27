import { ContactSection } from "@/components/sections/ContactSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Marquee } from "@/components/sections/Marquee";
import { MobileCTA } from "@/components/sections/MobileCTA";
import { Navbar } from "@/components/sections/Navbar";
import { PakistanSection } from "@/components/sections/PakistanSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { RestaurantBenefits } from "@/components/sections/RestaurantBenefits";
import { SolutionSection } from "@/components/sections/SolutionSection";
import { TechnologySection } from "@/components/sections/TechnologySection";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <ExperienceSection />
        <TechnologySection />
        <RestaurantBenefits />
        <PakistanSection />
        <FAQ />
        <ContactSection />
      </main>
      <Footer />
      <MobileCTA />
    </>
  );
}
