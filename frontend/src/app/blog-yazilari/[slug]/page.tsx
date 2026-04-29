import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogDetail, BlogList, VisualStorySection } from "@/components/content";
import { RichTextContent } from "@/components/content/rich-text-content";
import { blogDetailVisualSection } from "@/lib/page-visual-sections";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/strapi";

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
    <div className="space-y-2">
      {author?.displayName ? (
        <p>
          <span className="font-medium text-foreground/78">Yazar:</span>{" "}
          {author.displayName}
          {author.role ? ` — ${author.role}` : null}
        </p>
      ) : null}
      {post.publishedDate ? (
        <p>{formatBlogDate(post.publishedDate)}</p>
      ) : null}
      {author?.shortBio ? (
        <p className="pt-1 leading-relaxed text-foreground/58">
          {author.shortBio}
        </p>
      ) : null}
    </div>
  );

  return (
    <BlogDetail
      title={post.title}
      excerpt={post.excerpt}
      meta={metaContent}
      afterContent={<VisualStorySection {...blogDetailVisualSection} />}
      sourceNotes={post.sourceNotes ?? undefined}
    >
      <div className="max-w-3xl text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg">
        {post.content ? (
          <RichTextContent content={post.content} />
        ) : (
          "Bu yazı için içerik yakında eklenecek."
        )}
      </div>
      {relatedPosts.length > 0 ? (
        <div className="mt-10 border-t border-white/10 pt-8 sm:mt-12 sm:pt-10">
          <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            İlgili Yazılar
          </h2>
          <BlogList
            items={relatedPosts.map((rp) => ({
              id: rp.documentId,
              slug: rp.slug,
              title: rp.title,
              excerpt: rp.excerpt,
              publishedDate: rp.publishedDate,
              authorName: rp.author?.displayName ?? null,
            }))}
          />
        </div>
      ) : null}
    </BlogDetail>
  );
}
