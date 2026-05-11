import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ContentPageShell, ContentGrid, TeacherListLoading } from "@/components/content";
import { TeacherCard } from "@/components/teacher-card";
import {
  getStrapiMediaAltText,
  getStrapiMediaBlurDataUrl,
  getStrapiMediaUrl,
} from "@/lib/strapi-media";
import { getTeachers } from "@/lib/strapi-teachers";
import { join } from "@/lib/testids";

async function TeacherResults({ emptyMessage }: { emptyMessage: string }) {
  const teachers = await getTeachers();

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

export default async function EgitmenlerPage() {
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
      <Suspense fallback={<TeacherListLoading testId="loading.egitmenler" />}>
        <TeacherResults emptyMessage={t('list.empty')} />
      </Suspense>
    </ContentPageShell>
  );
}
