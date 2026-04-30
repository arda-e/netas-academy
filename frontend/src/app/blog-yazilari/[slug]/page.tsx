import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogDetail } from "@/components/content";
import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";
import { RichTextContent } from "@/components/content/rich-text-content";
import { getBlogPostBySlug, getBlogPosts, getStrapiMediaUrl, getStrapiMediaAltText } from "@/lib/strapi";
import { join } from "@/lib/testids";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

const formatBlogDate = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

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

  const author = post.author;

  const metaContent = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {author?.displayName ? (
        <p>
          <span className="font-medium text-white">Yazar:</span>{" "}
          {author.displayName}
          {author.role ? ` — ${author.role}` : null}
        </p>
      ) : null}
      {post.publishedDate ? (
        <p>{formatBlogDate(post.publishedDate)}</p>
      ) : null}
      {author?.shortBio ? (
        <p className="basis-full leading-relaxed text-white/64">
          {author.shortBio}
        </p>
      ) : null}
    </div>
  );

  return (
    <div data-testid="page.blog-detail">
      <BlogDetail
        breadcrumbItems={[
          { label: "Blog", href: "/blog-yazilari" },
          { label: post.title },
        ]}
        title={post.title}
        excerpt={post.excerpt}
        coverImageUrl={getStrapiMediaUrl(post.coverImage)}
        coverImageAlt={getStrapiMediaAltText(post.coverImage) ?? undefined}
        meta={<div data-testid="page.blog-detail.meta">{metaContent}</div>}
        sourceNotes={post.sourceNotes ?? undefined}
      >
        <div className="max-w-3xl text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg" data-testid="page.blog-detail.body">
          {post.content ? (
            <RichTextContent content={post.content} />
          ) : (
            "Bu yazı için içerik yakında eklenecek."
          )}
        </div>
        {relatedPosts.length > 0 ? (
          <div className="mt-10 border-t border-white/10 pt-8 sm:mt-12 sm:pt-10" data-testid="page.blog-detail.related-posts">
            <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              İlgili Yazılar
            </h2>
            <ContentGrid
              itemsCount={relatedPosts.length}
              emptyMessage=""
              columnsClassName={responsiveLayoutClasses.blogListGrid}
              testId={join("page", "blog-detail", "related-posts")}
            >
              {relatedPosts.map((rp) => (
                <ContentCardShell
                  key={rp.documentId}
                  href={`/blog-yazilari/${rp.slug}`}
                  title={rp.title}
                  summary={rp.excerpt ?? "Bu yazı için özet yakında eklenecek."}
                  testId={join("page", "blog-detail", "related-posts", "card", rp.slug)}
                  className="bg-white"
                  imageUrl={getStrapiMediaUrl(rp.coverImage) ?? null}
                  imageAlt={getStrapiMediaAltText(rp.coverImage) ?? undefined}
                  meta={
                    rp.publishedDate || rp.author?.displayName ? (
                      <div className="space-y-1.5 text-sm leading-6 text-foreground/62">
                        {rp.publishedDate ? <p>{formatBlogDate(rp.publishedDate)}</p> : null}
                        {rp.author?.displayName ? <p>{rp.author.displayName}</p> : null}
                      </div>
                    ) : undefined
                  }
                />
              ))}
            </ContentGrid>
          </div>
        ) : null}
      </BlogDetail>
    </div>
  );
}
