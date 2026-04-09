import { HeroOverlay } from "@/components/hero-overlay";
import { VisualStorySection } from "@/components/content";
import { homeVisualSection } from "@/lib/page-visual-sections";

export default function Home() {
  return (
    <>
      <HeroOverlay
        title="Kurumsal egitim, etkinlik ve icerik portalinizi tek yerde yonetin."
        description="Next.js arayuzu ile akademi deneyimini sunun, Strapi tarafinda ise ogretmenleri, etkinlikleri, blog yazilarini ve basvurulari yonetin."
        primaryCta={{ href: "/egitimler", label: "Egitimleri Incele" }}
        secondaryCta={{ href: "/iletisim", label: "Iletisime Gec" }}
      />
      <main className="page-shell">
        <div className="mx-auto w-full max-w-7xl px-6 pb-18 md:px-10 lg:px-12">
          <VisualStorySection {...homeVisualSection} />
        </div>
      </main>
    </>
  );
}
