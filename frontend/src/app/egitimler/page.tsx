import { ContentPageShell, CourseList } from "@/components/content";
import { getCourses } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export default async function EgitimlerPage() {
  const courses = await getCourses();

  return (
    <ContentPageShell
      title="Egitimler"
        description={
          <>
            <p>
              <strong className="text-white">
                Uzman egitmenler tarafindan hazirlanan programlari
              </strong>{" "}
              inceleyin ve kurumunuz icin en uygun ogrenme yolculugunu planlayin.
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-white/88 sm:gap-2 sm:text-sm">
              <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
                Kurumsal programlar
              </span>
            <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
              Canli oturumlar
            </span>
            <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
              Uygulamali ogrenme
            </span>
          </div>
        </>
      }
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
