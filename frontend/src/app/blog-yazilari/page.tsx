import { ContentPageShell, BlogList, SearchField } from "@/components/content";
import { getBlogPosts, getStrapiMediaUrl, getStrapiMediaAltText } from "@/lib/strapi";

export const dynamic = "force-dynamic";

type BlogYazilariPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogYazilariPage({ searchParams }: BlogYazilariPageProps) {
  const params = await searchParams;
  const search = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  const posts = await getBlogPosts(search);

  const mappedPosts = posts.map((post) => ({
    id: post.documentId,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedDate: post.publishedDate,
    authorName: post.author?.displayName ?? null,
    coverImageUrl: getStrapiMediaUrl(post.coverImage),
    coverImageAlt: getStrapiMediaAltText(post.coverImage) ?? undefined,
  }));

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
        <SearchField initialValue={search} searchOnly />
        <BlogList
          items={mappedPosts}
          emptyMessage="Aramanızla eşleşen blog yazısı bulunamadı."
          testId="page.blog"
        />
      </div>
    </ContentPageShell>
  );
}
