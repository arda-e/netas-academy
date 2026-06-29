import { BlogListLoading, ContentPageShell } from "@/components/content";

export default function BlogYazilariLoading() {
  return (
    <ContentPageShell
      hero={{
        gradientVariant: "blog",
        title: "Blog",
        description: (
          <p>
            Sektörel bakış açıları, uygulama notları ve eğitim odaklı
            içgörülerle hazırlanan yazı arşivini keşfedin.
          </p>
        ),
      }}
      testId="page.blog"
    >
      <div className="space-y-4 sm:space-y-8">
        <div data-testid="loading.blog">
          <BlogListLoading />
        </div>
      </div>
    </ContentPageShell>
  );
}
