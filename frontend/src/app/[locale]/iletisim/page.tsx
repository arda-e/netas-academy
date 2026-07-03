import type { Metadata } from "next";
import type { LeadType } from "@/lib/lead-intents";
import { resolveLeadTypeFromQuery } from "@/lib/lead-intents";
import { getTranslations } from "next-intl/server";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { IntentLeadForm } from "@/components/contact/intent-lead-form";
import { HeroGradientBackground } from "@/components/hero-gradient-background";
import { buildLocaleAlternates, buildLocalePath } from "@/lib/seo-utils";

export const dynamic = "force-dynamic";

type IletisimPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    intent?: string;
    topic?: string;
  }>;
};

export async function generateMetadata({
  params,
}: IletisimPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  const canonical = buildLocalePath(locale, "/iletisim");

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical,
      languages: buildLocaleAlternates("/iletisim"),
    },
    openGraph: {
      locale: locale === "en" ? "en_US" : "tr_TR",
      title: t("meta.title"),
      description: t("meta.description"),
      url: canonical,
    },
  };
}

export default async function IletisimPage({ searchParams }: IletisimPageProps) {
  const params = await searchParams;
  const resolvedIntent = resolveLeadTypeFromQuery(params.intent ?? null);
  const initialLeadType: LeadType | null = resolvedIntent ?? (params.topic ? "corporate_training_request" : null);
  const prefilledTopic = params.topic ?? undefined;
  const t = await getTranslations('contact');

  return (
    <main className="page-shell min-h-[calc(100vh-80px)]" data-testid="page.iletisim">
      <section className="relative isolate overflow-hidden bg-slate-950">
        <HeroGradientBackground variant="contact" testId="page.iletisim.hero-gradient" />

        <div className="relative mx-auto flex min-h-[400px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
          <div className="absolute left-6 right-6 top-12 md:left-10 md:right-10 lg:left-12 lg:right-12">
            <SiteBreadcrumbs items={[{ label: t('hero.breadcrumb') }]} />
          </div>
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/88">
              {t('hero.description')}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-10 md:py-18 lg:px-12">
        <div>
          <div data-testid="page.iletisim.form">
            <IntentLeadForm initialLeadType={initialLeadType} prefilledTopic={prefilledTopic} />
          </div>
        </div>
      </section>
    </main>
  );
}
