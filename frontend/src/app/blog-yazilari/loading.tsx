import { BlogListLoading, ContentPageShell } from "@/components/content";

export default function BlogYazilariLoading() {
  return (
    <ContentPageShell
      title="Blog"
      testId="page.blog"
    >
      <div className="space-y-4 sm:space-y-8">
        <p className="max-w-3xl page-body-text">
          Sektörel bakış açıları, uygulama notları ve eğitim odaklı
          içgörülerle hazırlanan yazı arşivini keşfedin.
        </p>
        <div data-testid="loading.blog">
          <BlogListLoading />
        </div>
      </div>
    </ContentPageShell>
  );
}
