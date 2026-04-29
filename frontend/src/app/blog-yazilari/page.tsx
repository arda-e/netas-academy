import { ContentPageShell } from "@/components/content";
import { getBlogPosts } from "@/lib/strapi";
import { BlogSearch } from "./blog-search";

export const dynamic = "force-dynamic";

export default async function BlogYazilariPage() {
  const posts = await getBlogPosts();

  return (
    <ContentPageShell
      title="Blog Yazıları"
      description={
        <p>
          Sektörel bakış açıları, uygulama notları ve eğitim odaklı
          içgörülerle hazırlanan yazı arşivini keşfedin.
        </p>
      }
    >
      <BlogSearch
        posts={posts.map((post) => ({
          id: post.documentId,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          publishedDate: post.publishedDate,
          authorName: post.author?.displayName ?? null,
        }))}
      />
    </ContentPageShell>
  );
}
