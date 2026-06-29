import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import solutionPartnerHeroImage from "@/assets/images/hero-cozum.webp";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { AccordionSection } from "@/components/uncode/AccordionSection";
import { IntroSection } from "@/components/uncode/IntroSection";
import { Link } from "@/i18n/navigation";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { join } from "@/lib/testids";
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/0" />
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
      {/* CTA */}
      <section className="page-section">
        <div data-testid="page.cozum-ortagi.content">
          <div className="space-y-4 sm:space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {t('cta.heading')}
            </h2>
            <p className="max-w-3xl text-[15px] leading-7 text-foreground/72 sm:text-lg sm:leading-8">
              {t('cta.body')}
            </p>
            <Link
              href={buildIntentLeadUrl("solution_partner_application")}
              className="inline-flex items-center justify-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/18"
              data-testid={join("page", "cozum-ortagi", "cta", "apply")}
            >
              {t('cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
