"use client";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { useTranslations } from "next-intl";
import { ContentGrid } from "@/components/content/content-grid";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";
import {
  getStrapiMediaAltText,
  getStrapiMediaBlurDataUrl,
  getStrapiMediaUrl,
} from "@/lib/strapi-media";
import type { StrapiBlogPost } from "@/lib/strapi-types";
import { join } from "@/lib/testids";
import { formatLongDate } from "@/lib/date-formatting";

type RelatedPostMetaProps = {
  publishedDate?: string | null;
  authorName?: string | null;
};

function RelatedPostMeta({ publishedDate, authorName }: RelatedPostMetaProps) {
  const hasMeta = Boolean(publishedDate || authorName);

  if (!hasMeta) {
    return null;
  }

  return (
    <div className="space-y-1.5 text-sm leading-6 text-foreground/62">
      {publishedDate ? <p>{formatLongDate(publishedDate)}</p> : null}
      {authorName ? <p>{authorName}</p> : null}
    </div>
  );
}

type RelatedPostsSectionProps = {
  relatedPosts: Array<
    Pick<
      StrapiBlogPost,
      "documentId" | "slug" | "title" | "excerpt" | "publishedDate" | "coverImage" | "author"
    >
  >;
};

export function RelatedPostsSection({ relatedPosts }: RelatedPostsSectionProps) {
  const t = useTranslations('blog');

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-10 border-t border-white/10 pt-8 sm:mt-12 sm:pt-10"
      data-testid="page.blog-detail.related-posts"
    >
      <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {t('blog.related_posts.heading')}
      </h2>
      <ContentGrid
        itemsCount={relatedPosts.length}
        emptyMessage=""
        columnsClassName={responsiveLayoutClasses.blogListGrid}
        testId={join("page", "blog-detail", "related-posts")}
      >
        {relatedPosts.map((relatedPost) => (
          <ContentCardShell
            key={relatedPost.documentId}
            href={`/blog-yazilari/${relatedPost.slug}`}
            title={relatedPost.title}
            summary={relatedPost.excerpt ?? t('blog.related_posts.summary_empty')}
            testId={join("page", "blog-detail", "related-posts", "card", relatedPost.slug)}
            className="bg-white"
            imageUrl={getStrapiMediaUrl(relatedPost.coverImage) ?? null}
            imageAlt={getStrapiMediaAltText(relatedPost.coverImage) ?? undefined}
            blurDataURL={getStrapiMediaBlurDataUrl(relatedPost.coverImage) ?? undefined}
            meta={
              <RelatedPostMeta
                publishedDate={relatedPost.publishedDate}
                authorName={relatedPost.author?.displayName}
              />
            }
          />
        ))}
      </ContentGrid>
    </div>
  );
}
