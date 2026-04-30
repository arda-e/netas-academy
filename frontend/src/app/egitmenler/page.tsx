import { ContentPageShell, ContentGrid } from "@/components/content";
import { TeacherCard } from "@/components/teacher-card";
import { getStrapiMediaUrl, getStrapiMediaAltText, getTeachers } from "@/lib/strapi";
import { join } from "@/lib/testids";

export const dynamic = "force-dynamic";

export default async function EgitmenlerPage() {
  const teachers = await getTeachers();

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
            photoUrl={getStrapiMediaUrl(teacher.profilePhoto)}
            photoAlt={getStrapiMediaAltText(teacher.profilePhoto) ?? undefined}
          />
        ))}
      </ContentGrid>
    </ContentPageShell>
  );
}
