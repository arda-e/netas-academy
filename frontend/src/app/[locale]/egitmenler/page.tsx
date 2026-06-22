import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ContentPageShell, ContentGrid, TeacherListLoading, SearchField } from "@/components/content";
import { TeacherCard } from "@/components/teacher-card";
import { buildLocaleAlternates, buildLocalePath, buildMetadata } from "@/lib/seo-utils";
import { getSiteSettings } from "@/lib/strapi-site-settings";
import {
  getStrapiMediaAltText,
  getStrapiMediaBlurDataUrl,
  getStrapiMediaUrl,
} from "@/lib/strapi-media";
import { getTeachers } from "@/lib/strapi-teachers";
import { join } from "@/lib/testids";

type EgitmenlerPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: EgitmenlerPageProps): Promise<Metadata> {
  const { locale } = await params;
  const [t, siteSettings] = await Promise.all([
    getTranslations({ locale, namespace: "teachers" }),
    getSiteSettings(),
  ]);

  return buildMetadata({
    seo: null,
    defaults: siteSettings,
    fallbackTitle: t("hero.title"),
    fallbackDescription: `${t("hero.description_strong")} ${t("hero.description_rest")}`,
    pagePath: buildLocalePath(locale, "/egitmenler"),
    locale,
    localeAlternates: buildLocaleAlternates("/egitmenler"),
  });
}

async function TeacherResults({ search, emptyMessage }: { search: string; emptyMessage: string }) {
  const teachers = await getTeachers(search);

  return (
    <ContentGrid
      testId={join("page", "egitmenler", "grid")}
      itemsCount={teachers.length}
      emptyMessage={emptyMessage}
      columnsClassName="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {teachers.map((teacher) => (
        <TeacherCard
          key={teacher.documentId}
          slug={teacher.slug}
          fullName={teacher.fullName}
          headline={teacher.headline}
          expertiseAreas={teacher.expertiseAreas}
          targetTeams={teacher.targetTeams}
          photoUrl={getStrapiMediaUrl(teacher.profilePhoto, 'small')}
          photoAlt={getStrapiMediaAltText(teacher.profilePhoto) ?? undefined}
          photoBlurDataURL={getStrapiMediaBlurDataUrl(teacher.profilePhoto) ?? undefined}
        />
      ))}
    </ContentGrid>
  );
}

export default async function EgitmenlerPage({ searchParams }: EgitmenlerPageProps) {
  const params = await searchParams;
  const search = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  const t = await getTranslations('teachers');

  return (
    <ContentPageShell
      testId="page.egitmenler"
      title={t('hero.title')}
      descriptionClassName="max-w-3xl text-balance"
      description={
        <p>
          <strong className="text-white">{t('hero.description_strong')}</strong>{" "}
          {t('hero.description_rest')}
        </p>
      }
    >
      <div className="space-y-4 sm:space-y-8">
        <SearchField
          initialValue={search}
          expandedWidthClassName="lg:w-[560px]"
        />
        <Suspense fallback={<TeacherListLoading testId="loading.egitmenler" />}>
          <TeacherResults search={search} emptyMessage={t('list.empty')} />
        </Suspense>
      </div>
    </ContentPageShell>
  );
}
