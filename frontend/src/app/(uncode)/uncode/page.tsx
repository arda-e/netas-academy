import { HeroSection } from "@/components/uncode/HeroSection";
import { IntroSection } from "@/components/uncode/IntroSection";
import { ServicesSection } from "@/components/uncode/ServicesSection";
import { MetricsSection } from "@/components/uncode/MetricsSection";
import { ESGSection } from "@/components/uncode/ESGSection";
import { ParallaxCTASection } from "@/components/uncode/ParallaxCTASection";
import { NewsSection } from "@/components/uncode/NewsSection";
import { Footer } from "@/components/uncode/Footer";

export default function UncodePage() {
  return (
    <>
      <HeroSection />
      <IntroSection />
      <ServicesSection />
      <MetricsSection />
      <ESGSection />
      <ParallaxCTASection />
      <NewsSection />
      <Footer />
    </>
  );
}
