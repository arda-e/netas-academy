import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { ContentPageShell, RouteLoading } from "@/components/content";
import { RelatedPostsSection } from "@/components/content/blog-related-posts";
import { RichTextContent } from "@/components/content/rich-text-content";
import {
  getBlogPostBySlug,
  getBlogPosts,
} from "@/lib/strapi-blog";
import {
  getStrapiMediaAltText,
  getStrapiMediaBlurDataUrl,
  getStrapiMediaUrl,
} from "@/lib/strapi-media";
import type { StrapiBlogPost } from "@/lib/strapi-types";
import { formatLongDate as formatBlogDate } from "@/lib/date-formatting";

type BlogDetailPageProps = {
  params: Promise<{
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
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Yazısı Bulunamadı",
    };
  }

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getBlogPosts();

  const relatedPosts = allPosts
    .filter((p) => p.documentId !== post.documentId)
    .slice(0, 3);

  const breadcrumbItems = [{ label: "Blog", href: "/blog-yazilari" }];

  const blogBody = post.content ? (
    <RichTextContent content={post.content} />
  ) : (
    EMPTY_BLOG_CONTENT
  );

  return (
    <Suspense fallback={<RouteLoading testId="loading.blog-detail" />}>
      <ContentPageShell
        testId="page.blog-detail"
        breadcrumbItems={breadcrumbItems}
        title={post.title}
        heroImageUrl={getStrapiMediaUrl(post.coverImage, "large")}
        heroImageAlt={getStrapiMediaAltText(post.coverImage) ?? post.title}
        heroImageBlurDataURL={getStrapiMediaBlurDataUrl(post.coverImage) ?? undefined}
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
        {post.sourceNotes && (
          <div
            className="mt-8 border-t border-white/10 pt-6 sm:mt-10 sm:pt-8"
            data-testid="page.blog-detail.source-notes"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/46">
              Dayanak / Kaynak
            </p>
            <div className="mt-3 text-sm leading-6 text-foreground/62 sm:text-base sm:leading-7">
              {post.sourceNotes}
            </div>
          </div>
        )}
        <RelatedPostsSection relatedPosts={relatedPosts} />
      </ContentPageShell>
    </Suspense>
  );
}
