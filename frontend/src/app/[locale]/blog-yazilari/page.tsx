import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ContentPageShell, BlogList, BlogListLoading, SearchField } from "@/components/content";
import { getBlogPosts } from "@/lib/strapi-blog";
import { buildLocaleAlternates, buildLocalePath, buildMetadata } from "@/lib/seo-utils";
import { getSiteSettings } from "@/lib/strapi-site-settings";
import {
  getStrapiMediaAltText,
  getStrapiMediaBlurDataUrl,
  getStrapiMediaUrl,
} from "@/lib/strapi-media";

type BlogYazilariPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: BlogYazilariPageProps): Promise<Metadata> {
  const { locale } = await params;
  const [t, siteSettings] = await Promise.all([
    getTranslations({ locale, namespace: "blog" }),
    getSiteSettings(),
  ]);

  return buildMetadata({
    seo: null,
    defaults: siteSettings,
    fallbackTitle: t("hero.title"),
    fallbackDescription: t("hero.description"),
    pagePath: buildLocalePath(locale, "/blog-yazilari"),
    locale,
    localeAlternates: buildLocaleAlternates("/blog-yazilari"),
  });
}

async function BlogResults({ search, emptyMessage }: { search: string; emptyMessage: string }) {
  const posts = await getBlogPosts(search);

  const mappedPosts = posts.map((post) => ({
    id: post.documentId,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedDate: post.publishedDate,
    authorName: post.author?.displayName ?? null,
    coverImageUrl: getStrapiMediaUrl(post.coverImage, 'small'),
    coverImageAlt: getStrapiMediaAltText(post.coverImage) ?? undefined,
    coverImageBlurDataURL: getStrapiMediaBlurDataUrl(post.coverImage) ?? undefined,
  }));

  return (
    <BlogList
      items={mappedPosts}
      emptyMessage={emptyMessage}
      testId="page.blog"
    />
  );
}

export default async function BlogYazilariPage({ searchParams }: BlogYazilariPageProps) {
  const params = await searchParams;
  const search = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  const t = await getTranslations('blog');

  return (
    <ContentPageShell
      hero={{
        gradientVariant: "blog",
        title: t('hero.title'),
        description: <p>{t('hero.description')}</p>,
      }}
      testId="page.blog"
    >
      <div className="space-y-4 sm:space-y-8">
        <SearchField
          initialValue={search}
          expandedWidthClassName="lg:w-[560px]"
        />
        <Suspense fallback={<BlogListLoading testId="loading.blog" />}>
          <BlogResults search={search} emptyMessage={t('list.empty')} />
        </Suspense>
      </div>
    </ContentPageShell>
  );
}
