import type { Metadata } from "next";
import { Suspense } from "react";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContentPageShell, RouteLoading } from "@/components/content";
import { RelatedPostsSection } from "@/components/content/blog-related-posts";
import { RichTextContent } from "@/components/content/rich-text-content";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from "@/lib/strapi-blog";
import type { StrapiBlogPost } from "@/lib/strapi-types";
import { buildLocalePath, buildMetadata } from "@/lib/seo-utils";
import { getSiteSettings } from "@/lib/strapi-site-settings";
import { formatLongDate as formatBlogDate } from "@/lib/date-formatting";

type BlogDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const EMPTY_BLOG_CONTENT = "Bu yazı için içerik yakında eklenecek.";

type BlogMetaProps = {
  author?: StrapiBlogPost["author"];
  publishedDate?: string | null;
};

function BlogMetaContent({ author, publishedDate }: BlogMetaProps) {
  const hasAuthorLine = Boolean(author?.displayName);
  const safePublishedDate = publishedDate ?? "";
  const hasPublishedDate = Boolean(safePublishedDate);
  const hasBio = Boolean(author?.shortBio);

  if (!hasAuthorLine && !hasPublishedDate && !hasBio) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-6 text-foreground/62 sm:text-base">
      {hasAuthorLine && (
        <p>
          <span className="font-medium text-foreground">Yazar:</span>{" "}
          {author?.displayName}
          {author?.role ? ` — ${author.role}` : null}
        </p>
      )}
      {hasPublishedDate && <p>{formatBlogDate(safePublishedDate)}</p>}
      {hasBio && (
        <p className="basis-full leading-relaxed text-foreground/58">{author?.shortBio}</p>
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, post, siteSettings] = await Promise.all([
    getTranslations({ locale, namespace: "blog" }),
    getBlogPostBySlug(slug),
    getSiteSettings(),
  ]);

  if (!post) {
    return {
      title: t("meta.not_found"),
    };
  }

  return buildMetadata({
    seo: post.seo,
    defaults: siteSettings,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt,
    pagePath: buildLocalePath(locale, `/blog-yazilari/${slug}`),
    locale,
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();
  const post = await getBlogPostBySlug(slug, isDraft);

  if (!post) {
    notFound();
  }

  const t = await getTranslations('blog');

  const relatedPosts = await getRelatedBlogPosts(slug, 3);

  const breadcrumbItems = [{ label: t('hero.title'), href: "/blog-yazilari" }];

  const blogBody = post.content ? (
    <RichTextContent content={post.content} />
  ) : (
    EMPTY_BLOG_CONTENT
  );
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    datePublished: post.publishedDate ?? undefined,
    ...(post.author?.displayName
      ? {
          author: {
            "@type": "Person",
            name: post.author.displayName,
          },
        }
      : {}),
  };

  return (
    <>
      <JsonLd data={blogJsonLd} />
      <Suspense fallback={<RouteLoading testId="loading.blog-detail" />}>
        <ContentPageShell
          testId="page.blog-detail"
          hero={{
            gradientVariant: "blog",
            breadcrumbItems,
            title: post.title,
          }}
        >
          <div className="mb-8 max-w-3xl space-y-4 sm:mb-10 sm:space-y-5">
            {post.excerpt && (
              <p
                className="text-[17px] leading-8 text-foreground/76 sm:text-xl sm:leading-9"
                data-testid="page.blog-detail.excerpt"
              >
                {post.excerpt}
              </p>
            )}
            <div data-testid="page.blog-detail.meta">
              <BlogMetaContent author={post.author} publishedDate={post.publishedDate} />
            </div>
          </div>
          <div
            className="max-w-3xl text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg"
            data-testid="page.blog-detail.body"
          >
            {blogBody}
          </div>
          <RelatedPostsSection relatedPosts={relatedPosts} />
        </ContentPageShell>
      </Suspense>
    </>
  );
}
