import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContentPageShell, NewsList } from "@/components/content";
import { getNewsPosts } from "@/lib/strapi-news";
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

export default async function HaberlerPage() {
  const [t, posts] = await Promise.all([
    getTranslations('news'),
    getNewsPosts(),
  ]);

  const items = posts.map((post) => ({
    id: post.documentId,
    title: post.title,
    summary: post.excerpt ?? "",
    tag: post.source ?? undefined,
    publishedAt: post.publishedDate ?? undefined,
    href: `/haberler/${post.slug}`,
  }));

  return (
    <ContentPageShell
      testId="page.haberler"
      hero={{
        title: t('hero.title'),
        description: <p>{t('hero.description')}</p>,
      }}
    >
      <NewsList items={items} emptyMessage={t('list.empty')} />
    </ContentPageShell>
  );
}
