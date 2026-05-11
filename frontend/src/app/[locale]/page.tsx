import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { HomeContactCTASection } from "@/components/home/HomeContactCTASection";
import { HomeFeaturedCoursesSection } from "@/components/home/HomeFeaturedCoursesSection";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomeLearningModelSection } from "@/components/home/HomeLearningModelSection";
import { HomeProgramsSection } from "@/components/home/HomeProgramsSection";
import { HomeTrustSection } from "@/components/home/HomeTrustSection";

type HomePageParams = {
  locale: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<HomePageParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <>
      <HomeHeroSection
        slides={[
          {
            headline: t("hero.slide_1.headline"),
            subtitle: t("hero.slide_1.subtitle"),
          },
          {
            headline: t("hero.slide_2.headline"),
            subtitle: t("hero.slide_2.subtitle"),
          },
          {
            headline: t("hero.slide_3.headline"),
            subtitle: t("hero.slide_3.subtitle"),
          },
        ]}
        primaryCtaLabel={t("hero.cta_primary")}
        secondaryCtaLabel={t("hero.cta_secondary")}
        slideNavLabels={[
          t("hero.slide_nav", { index: 1 }),
          t("hero.slide_nav", { index: 2 }),
          t("hero.slide_nav", { index: 3 }),
        ]}
      />

      <main className="page-shell" data-testid="page.home">
        <HomeTrustSection
          heading={t("trust.heading")}
          pillars={[
            {
              heading: t("trust.pillar_1.title"),
              body: t("trust.pillar_1.body"),
            },
            {
              heading: t("trust.pillar_2.title"),
              body: t("trust.pillar_2.body"),
            },
            {
              heading: t("trust.pillar_3.title"),
              body: t("trust.pillar_3.body"),
            },
          ]}
        />
        <HomeLearningModelSection
          leftHeading={t("learning.left.heading")}
          leftBody={t("learning.left.body")}
          rightHeading={t("learning.right.heading")}
          rightBody={t("learning.right.body")}
        />
        <HomeFeaturedCoursesSection
          eyebrow={t("featured_courses.eyebrow")}
          heading={t("featured_courses.heading")}
          body={t("featured_courses.body")}
        />
        <HomeProgramsSection
          eyebrow={t("programs.eyebrow")}
          heading={t("programs.heading")}
          body1={t("programs.body_1")}
          body2={t("programs.body_2")}
          ctaLabel={t("programs.cta")}
        />
        <HomeContactCTASection
          heading={t("contact_cta.heading")}
          body={t("contact_cta.body")}
          buttonLabel={t("contact_cta.button")}
        />
      </main>
    </>
  );
}
