import { BlogList, ContentPageShell } from "@/components/content";
import { getBlogPosts } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export default async function BlogYazilariPage() {
  const posts = await getBlogPosts();

  return (
    <ContentPageShell
      title="Blog Yazilari"
      description={
        <p>
          Sektorel bakis acilari, uygulama notlari ve egitim odakli
          icgorulerle hazirlanan yazi arsivini kesfedin.
        </p>
      }
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
