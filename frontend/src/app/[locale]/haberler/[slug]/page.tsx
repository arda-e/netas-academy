import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContentPageShell } from "@/components/content";
import { RichTextContent } from "@/components/content/rich-text-content";
import { JsonLd } from "@/components/seo/json-ld";
import { getNewsPostBySlug, getNewsPostSlugs } from "@/lib/strapi-news";
import { buildLocalePath, buildMetadata } from "@/lib/seo-utils";
import { getSiteSettings } from "@/lib/strapi-site-settings";
import { formatLongDate } from "@/lib/date-formatting";

type HaberDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getNewsPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: HaberDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, post, siteSettings] = await Promise.all([
    getTranslations({ locale, namespace: "news" }),
    getNewsPostBySlug(slug),
    getSiteSettings(),
  ]);

  if (!post) {
    return { title: t("meta.not_found") };
  }

  return buildMetadata({
    seo: post.seo,
    defaults: siteSettings,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt,
    pagePath: buildLocalePath(locale, `/haberler/${slug}`),
    locale,
  });
}

export default async function HaberDetailPage({ params }: HaberDetailPageProps) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();
  const post = await getNewsPostBySlug(slug, isDraft);

  if (!post) {
    notFound();
  }

  const t = await getTranslations('news');

  const breadcrumbItems = [{ label: t('hero.title'), href: "/haberler" }];

  const newsBody = post.content ? (
    <RichTextContent content={post.content} />
  ) : (
    "Bu haber için içerik yakında eklenecek."
  );

  const newsJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedDate ?? undefined,
    ...(post.source ? { publisher: { "@type": "Organization", name: post.source } } : {}),
  };

  return (
    <>
      <JsonLd data={newsJsonLd} />
      <ContentPageShell
        testId="page.haber-detail"
        hero={{
          gradientVariant: "news",
          breadcrumbItems,
          title: post.title,
        }}
      >
        <div className="mb-8 max-w-3xl space-y-4 sm:mb-10 sm:space-y-5">
          {post.excerpt && (
            <p
              className="text-[17px] leading-8 text-foreground/76 sm:text-xl sm:leading-9"
              data-testid="page.haber-detail.excerpt"
            >
              {post.excerpt}
            </p>
          )}
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-6 text-foreground/62 sm:text-base"
            data-testid="page.haber-detail.meta"
          >
            {post.source && (
              <p>
                <span className="font-medium text-foreground">Kaynak:</span>{" "}
                {post.source}
              </p>
            )}
            {post.publishedDate && (
              <p>{formatLongDate(post.publishedDate)}</p>
            )}
          </div>
        </div>
        <div
          className="max-w-3xl text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg"
          data-testid="page.haber-detail.body"
        >
          {newsBody}
        </div>
      </ContentPageShell>
    </>
  );
}
