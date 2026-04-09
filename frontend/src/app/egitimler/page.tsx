import { ContentPageShell, CourseList } from "@/components/content";
import { getCourses } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export default async function EgitimlerPage() {
  const courses = await getCourses();

  return (
    <ContentPageShell
      title="Egitimler"
      description="Uzman egitmenler tarafindan hazirlanan programlari inceleyin ve kurumunuz icin en uygun ogrenme yolculugunu planlayin."
    >
      <CourseList
        items={courses.map((course) => ({
          id: course.documentId,
          slug: course.slug,
          title: course.title,
          summary: course.summary,
          teacherName: course.teacher?.fullName ?? null,
        }))}
      />
    </ContentPageShell>
  );
}
