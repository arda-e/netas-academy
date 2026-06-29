import type { Metadata } from "next";
import type { LeadType } from "@/lib/lead-intents";
import { resolveLeadTypeFromQuery } from "@/lib/lead-intents";
import { getTranslations } from "next-intl/server";
import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { IntentLeadForm } from "@/components/contact/intent-lead-form";
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
  const initialLeadType: LeadType = resolvedIntent ?? "corporate_training_request";
  const prefilledTopic = params.topic ?? undefined;
  const t = await getTranslations('contact');

  return (
    <main className="page-shell min-h-[calc(100vh-80px)]" data-testid="page.iletisim">
      <section className="relative isolate overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0"
          style={{
            background:
              "url(\"data:image/svg+xml,%3Csvg\\ xmlns='http://www.w3.org/2000/svg'\\ width='256'\\ height='256'%3E%3Cfilter\\ id='noise'\\ color-interpolation-filters='sRGB'%3E%3CfeTurbulence\\ type='fractalNoise'\\ baseFrequency='0.65'\\ numOctaves='3'\\ seed='1'\\ stitchTiles='stitch'/%3E%3CfeColorMatrix\\ type='saturate'\\ values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR\\ type='linear'\\ slope='0.75'\\ intercept='0.125'/%3E%3CfeFuncG\\ type='linear'\\ slope='0.75'\\ intercept='0.125'/%3E%3CfeFuncB\\ type='linear'\\ slope='0.75'\\ intercept='0.125'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect\\ width='100%25'\\ height='100%25'\\ filter='url(%23noise)'\\ opacity='1'/%3E%3C/svg%3E\") 0 0 / 260px,radial-gradient(73.99% 70.00% at 14.10% 85.15%,rgb(100% 59.38% 45.22%) 0%,rgb(100% 59.38% 45.22%) 32%,transparent 100%),radial-gradient(77.06% 106.18% at 9.87% 8.00%,rgb(100% 59.38% 45.22%) 0%,rgb(100% 59.38% 45.22%) 35%,transparent 100%),radial-gradient(58.49% 72.45% at 112.24% 63.11%,rgb(100% 59.38% 45.22%) 0%,rgb(100% 59.38% 45.22%) 26%,transparent 100%),radial-gradient(76.91% 84.78% at 82.14% 7.26%,rgb(98.32% 30.98% 53.97%) 0%,rgb(98.32% 30.98% 53.97%) 35%,transparent 100%),linear-gradient(23.51deg,rgb(100% 59.38% 45.22%) 0%,61.8%,transparent 100%)",
            backgroundBlendMode: "soft-light,hard-light,hard-light,hard-light,hard-light,normal",
            filter: "saturate(125%) blur(32px)",
            transform: "scale(1.11)",
          }}
        />

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
        <div className="panel-surface rounded-sm p-6 md:p-8 lg:p-10">
          <div data-testid="page.iletisim.form">
            <IntentLeadForm initialLeadType={initialLeadType} prefilledTopic={prefilledTopic} />
          </div>
        </div>
      </section>
    </main>
  );
}
