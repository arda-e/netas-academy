import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContentPageShell, NewsList } from "@/components/content";
import { buildLocaleAlternates, buildLocalePath, buildMetadata } from "@/lib/seo-utils";
import { getSiteSettings } from "@/lib/strapi-site-settings";

type HaberlerPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({
  params,
}: HaberlerPageProps): Promise<Metadata> {
  const { locale } = await params;
  const [t, siteSettings] = await Promise.all([
    getTranslations({ locale, namespace: "news" }),
    getSiteSettings(),
  ]);

  return buildMetadata({
    seo: null,
    defaults: siteSettings,
    fallbackTitle: t("meta.title"),
    fallbackDescription: t("meta.description"),
    pagePath: buildLocalePath(locale, "/haberler"),
    locale,
    localeAlternates: buildLocaleAlternates("/haberler"),
  });
}

// TODO: Replace hardcoded empty list with Strapi data fetch when a news/haberler content type is created in the backend.
// Example fetch pattern:
// import { getNews } from "@/lib/strapi";
// const news = await getNews();

export default async function HaberlerPage() {
  const t = await getTranslations('news');

  return (
    <ContentPageShell
      testId="page.haberler"
      title={t('hero.title')}
      description={
        <p>
          {t('hero.description')}
        </p>
      }
    >
      <NewsList items={[]} />
    </ContentPageShell>
  );
}
