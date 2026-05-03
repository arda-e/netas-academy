import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogDetail } from "@/components/content";
import { RelatedPostsSection } from "@/components/content/blog-related-posts";
import { RichTextContent } from "@/components/content/rich-text-content";
import {
  getBlogPostBySlug,
  getBlogPosts,
  getStrapiMediaUrl,
  getStrapiMediaAltText,
  type StrapiBlogPost,
} from "@/lib/strapi";
import { formatLongDate } from "@/lib/date-formatting";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

const EMPTY_BLOG_CONTENT = "Bu yazı için içerik yakında eklenecek.";

type BlogMetaProps = {
  author?: StrapiBlogPost["author"];
  publishedDate?: string | null;
};

function BlogMetaContent({ author, publishedDate }: BlogMetaProps) {
  const hasAuthorLine = Boolean(author?.displayName);
  const hasPublishedDate = Boolean(publishedDate);
  const hasBio = Boolean(author?.shortBio);

  if (!hasAuthorLine && !hasPublishedDate && !hasBio) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {hasAuthorLine ? (
        <p>
          <span className="font-medium text-white">Yazar:</span>{" "}
          {author?.displayName}
          {author?.role ? ` — ${author.role}` : null}
        </p>
      ) : null}
      {hasPublishedDate ? <p>{formatLongDate(publishedDate)}</p> : null}
      {hasBio ? (
        <p className="basis-full leading-relaxed text-white/64">{author?.shortBio}</p>
      ) : null}
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

  const breadcrumbItems = [
    { label: "Blog", href: "/blog-yazilari" },
    { label: post.title },
  ];

  const blogBody = post.content ? (
    <RichTextContent content={post.content} />
  ) : (
    EMPTY_BLOG_CONTENT
  );

  return (
    <div data-testid="page.blog-detail">
      <BlogDetail
        breadcrumbItems={breadcrumbItems}
        title={post.title}
        excerpt={post.excerpt}
        coverImageUrl={getStrapiMediaUrl(post.coverImage)}
        coverImageAlt={getStrapiMediaAltText(post.coverImage) ?? undefined}
        meta={
          <div data-testid="page.blog-detail.meta">
            <BlogMetaContent author={post.author} publishedDate={post.publishedDate} />
          </div>
        }
        sourceNotes={post.sourceNotes ?? undefined}
      >
        <div
          className="max-w-3xl text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg"
          data-testid="page.blog-detail.body"
        >
          {blogBody}
        </div>
        <RelatedPostsSection relatedPosts={relatedPosts} />
      </BlogDetail>
    </div>
  );
}
