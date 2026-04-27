import { HeroOverlay } from "@/components/hero-overlay";
import { VisualStorySection } from "@/components/content";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { homeVisualSection } from "@/lib/page-visual-sections";

export default function Home() {
  return (
    <>
      <HeroOverlay
        title={
          <>
            Kurumsal egitim, etkinlik ve
            <br className="hidden sm:block" />
            icerik portalinizi
            <br className="hidden sm:block" />
            <span className="text-[#ffb933]">tek yerde</span> yonetin.
          </>
        }
        description="Next.js arayuzu ile akademi deneyimini sunun, Strapi tarafinda ise ogretmenleri, etkinlikleri, blog yazilarini ve basvurulari yonetin."
        primaryCta={{ href: "/egitimler", label: "Egitimleri Incele" }}
        secondaryCta={{ href: buildIntentLeadUrl("corporate_training_request"), label: "Iletisime Gec" }}
      />
      <main className="page-shell">
        <div className="page-section pt-8 sm:pt-10 lg:pt-12">
          <VisualStorySection {...homeVisualSection} />
        </div>
      </main>
    </>
  );
}
