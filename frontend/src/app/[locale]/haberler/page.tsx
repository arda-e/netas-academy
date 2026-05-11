import { getTranslations } from "next-intl/server";
import { ContentPageShell, NewsList } from "@/components/content";

export const dynamic = "force-dynamic";

// TODO: Replace hardcoded empty list with Strapi data fetch when a news/haberler content type is created in the backend.
// Example fetch pattern:
// import { getNews } from "@/lib/strapi";
// const news = await getNews();

export default async function HaberlerPage() {
  const t = await getTranslations('news');

  return (
    <ContentPageShell
      testId="page.haberler"
      title={t('hero.title')}
      description={
        <p>
          {t('hero.description')}
        </p>
      }
    >
      <NewsList items={[]} />
    </ContentPageShell>
  );
}
