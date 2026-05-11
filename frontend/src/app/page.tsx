import type { Metadata } from "next";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomeFeaturedCoursesSection } from "@/components/home/HomeFeaturedCoursesSection";
import { HomeLearningModelSection } from "@/components/home/HomeLearningModelSection";
import { HomeTrustSection } from "@/components/home/HomeTrustSection";
import { HomeProgramsSection } from "@/components/home/HomeProgramsSection";
import { HomeContactCTASection } from "@/components/home/HomeContactCTASection";

export const metadata: Metadata = {
  title: "Netas Academy | Kurumsal Eğitim ve Hakkımızda",
  description:
    "Netaş Akademi'nin ana sayfası; kurumsal eğitim yaklaşımımızı, öne çıkan programlarımızı ve kurumlara özel çözümlerimizi keşfedin.",
};

export default function Home() {
  return (
    <>
      <HomeHeroSection />

      <main className="page-shell" data-testid="page.home">
        <HomeTrustSection />
        <HomeLearningModelSection />
        <HomeFeaturedCoursesSection />
        <HomeProgramsSection />

        <HomeContactCTASection />
      </main>
    </>
  );
}
