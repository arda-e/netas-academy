import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogDetail, VisualStorySection } from "@/components/content";
import { blogDetailVisualSection } from "@/lib/page-visual-sections";
import { getBlogPostBySlug } from "@/lib/strapi";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog Yazisi Bulunamadi",
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

  return (
    <BlogDetail
      title={post.title}
      excerpt={post.excerpt}
      afterContent={<VisualStorySection {...blogDetailVisualSection} />}
    >
      {post.content ?? "Bu yazi icin icerik yakinda eklenecek."}
    </BlogDetail>
  );
}
