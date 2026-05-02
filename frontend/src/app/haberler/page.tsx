import { ContentPageShell, NewsList } from "@/components/content";

export const dynamic = "force-dynamic";

// TODO: Replace hardcoded empty list with Strapi data fetch when a news/haberler content type is created in the backend.
// Example fetch pattern:
// import { getNews } from "@/lib/strapi";
// const news = await getNews();

export default function HaberlerPage() {
  return (
    <ContentPageShell
      testId="page.haberler"
      title="Haberler"
      description={
        <p>
          Akademi gundemini, yeni duyurulari ve one cikan gelismeleri takip
          edebileceginiz kurumsal haber alani.
        </p>
      }
    >
      <NewsList items={[]} />
    </ContentPageShell>
  );
}
