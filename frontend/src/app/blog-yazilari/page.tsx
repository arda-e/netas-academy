import { BlogList, ContentPageShell } from "@/components/content";
import { getBlogPosts } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export default async function BlogYazilariPage() {
  const posts = await getBlogPosts();

  return (
    <ContentPageShell
      eyebrow="Netas Academy"
      title="Blog Yazilari"
      description="Sektorel bakis acilari, uygulama notlari ve egitim odakli icgorulerle hazirlanan yazi arsivini kesfedin."
    >
      <BlogList
        items={posts.map((post) => ({
          id: post.documentId,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
        }))}
      />
    </ContentPageShell>
  );
}
