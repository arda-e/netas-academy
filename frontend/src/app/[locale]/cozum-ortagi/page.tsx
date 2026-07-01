import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import solutionPartnerHeroImage from "@/assets/images/hero-cozum.webp";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { HomeContactCTASection } from "@/components/home/HomeContactCTASection";
import { AccordionSection } from "@/components/uncode/AccordionSection";
import { IntroSection } from "@/components/uncode/IntroSection";
import { buildLocaleAlternates, buildLocalePath, buildMetadata } from "@/lib/seo-utils";
import { getSiteSettings } from "@/lib/strapi-site-settings";

export const revalidate = 3600;

type CozumOrtagiPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: CozumOrtagiPageProps): Promise<Metadata> {
  const { locale } = await params;
  const [t, siteSettings] = await Promise.all([
    getTranslations({ locale, namespace: "solution_partner" }),
    getSiteSettings(),
  ]);

  return buildMetadata({
    seo: null,
    defaults: siteSettings,
    fallbackTitle: t("meta.title"),
    fallbackDescription: t("meta.description"),
    pagePath: buildLocalePath(locale, "/cozum-ortagi"),
    locale,
    localeAlternates: buildLocaleAlternates("/cozum-ortagi"),
  });
}

export default async function CozumOrtagiPage() {
  const t = await getTranslations('solution_partner');

  const collaborationAreas = [
    {
      title: t('accordion.training.title'),
      body: t('accordion.training.body'),
    },
    {
      title: t('accordion.consulting.title'),
      body: t('accordion.consulting.body'),
    },
    {
      title: t('accordion.workshop.title'),
      body: t('accordion.workshop.body'),
    },
    {
      title: t('accordion.expertise.title'),
      body: t('accordion.expertise.body'),
    },
  ];

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]" data-testid="page.cozum-ortagi">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-slate-950">
        <Image
          src={solutionPartnerHeroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover object-center"
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/42 to-slate-950/20" />
        <div className="page-container relative flex min-h-[280px] items-end py-8 sm:min-h-[340px] sm:py-12 lg:min-h-[400px]">
          <div className="absolute left-4 right-4 top-8 sm:left-6 sm:right-6 sm:top-12 lg:left-10 lg:right-10 xl:left-12 xl:right-12">
            <SiteBreadcrumbs items={[{ label: t('hero.breadcrumb') }]} />
          </div>

          <h1
            className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-6xl"
            data-testid="page.cozum-ortagi.title"
          >
            {t('hero.title')}
          </h1>
        </div>
      </section>
      <IntroSection
        title={t('intro.paragraph')}
        columns={[]}
        className="bg-gray-50"
        //contentClassName="py-8 sm:py-10 lg:py-12"
      />
      <AccordionSection
        heading={t('accordion.heading')}
        items={collaborationAreas.map((a) => ({ q: a.title, a: a.body }))}
        className="bg-background"
      />
      <HomeContactCTASection
        heading={t('cta.heading')}
        body={t('cta.body')}
        buttonLabel={t('cta.button')}
      />
    </main>
  );
}
