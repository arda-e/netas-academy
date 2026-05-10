import { Suspense } from "react";
import { ContentPageShell, BlogList, BlogListLoading, SearchField } from "@/components/content";
import { getBlogPosts } from "@/lib/strapi-blog";
import {
  getStrapiMediaAltText,
  getStrapiMediaBlurDataUrl,
  getStrapiMediaUrl,
} from "@/lib/strapi-media";

type BlogYazilariPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function BlogResults({ search }: { search: string }) {
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
      emptyMessage="Aramanızla eşleşen blog yazısı bulunamadı."
      testId="page.blog"
    />
  );
}

export default async function BlogYazilariPage({ searchParams }: BlogYazilariPageProps) {
  const params = await searchParams;
  const search = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";

  return (
    <ContentPageShell
      title="Blog"
      description={
        <p>
          Sektörel bakış açıları, uygulama notları ve eğitim odaklı
          içgörülerle hazırlanan yazı arşivini keşfedin.
        </p>
      }
      testId="page.blog"
    >
      <div className="space-y-4 sm:space-y-8">
        <SearchField
          initialValue={search}
          searchOnly
          expandedWidthClassName="lg:w-[560px]"
        />
        <Suspense fallback={<BlogListLoading testId="loading.blog" />}>
          <BlogResults search={search} />
        </Suspense>
      </div>
    </ContentPageShell>
  );
}
