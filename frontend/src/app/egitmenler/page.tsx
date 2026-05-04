import { Suspense } from "react";
import { ContentPageShell, ContentGrid, TeacherListLoading } from "@/components/content";
import { TeacherCard } from "@/components/teacher-card";
import {
  getStrapiMediaAltText,
  getStrapiMediaBlurDataUrl,
  getStrapiMediaUrl,
} from "@/lib/strapi-media";
import { getTeachers } from "@/lib/strapi-teachers";
import { join } from "@/lib/testids";

async function TeacherResults() {
  const teachers = await getTeachers();

  return (
    <ContentGrid
      testId={join("page", "egitmenler", "grid")}
      itemsCount={teachers.length}
      emptyMessage="Henüz eğitmen profili eklenmemiş."
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
  return (
    <ContentPageShell
      testId="page.egitmenler"
      title="Eğitmenlerimiz"
      descriptionClassName="max-w-3xl text-balance"
      description={
        <p>
          <strong className="text-white">Alanında uzman eğitmen kadromuzla</strong>{" "}
          tanışın. Her biri saha deneyimini sınıfa taşıyan, sektörün önde gelen
          profesyonellerinden oluşan ekibimizle öğrenme yolculuğunuza yön verin.
        </p>
      }
    >
      <Suspense fallback={<TeacherListLoading testId="loading.egitmenler" />}>
        <TeacherResults />
      </Suspense>
    </ContentPageShell>
  );
}
