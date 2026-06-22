import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";
import { join } from "@/lib/testids";
import {
  normalizeTopicArea,
  getTopicAreaLabel,
  normalizeCourseLevel,
  getCourseLevelLabel,
} from "@/lib/content-taxonomy";

type CourseListItem = {
  id: number | string;
  slug: string;
  title: string;
  summary?: string | null;
  teacher?: { fullName?: string | null } | null;
  topicArea?: string | null;
  level?: string | null;
  targetAudience?: string | null;
  businessValue?: string | null;
};

type CourseListProps = {
  items: CourseListItem[];
  emptyMessage?: string;
  t_taxonomy?: (key: string) => string;
  t_courses?: (key: string) => string;
};

export function CourseList({
  items,
  emptyMessage = "Gösterilecek eğitim verisi şu an kullanılabilir değil.",
  t_taxonomy,
  t_courses,
}: CourseListProps) {
  return (
    <ContentGrid
      itemsCount={items.length}
      emptyMessage={emptyMessage}
      columnsClassName={responsiveLayoutClasses.courseListGrid}
      testId="egitimler.catalog"
    >
      {items.map((course) => {
        const topicAreaNormalized = course.topicArea
          ? normalizeTopicArea(course.topicArea)
          : null;
        const topicAreaLabel =
          topicAreaNormalized && t_taxonomy
            ? getTopicAreaLabel(topicAreaNormalized, t_taxonomy)
            : null;

        const levelNormalized = course.level
          ? normalizeCourseLevel(course.level)
          : null;
        const levelLabel =
          levelNormalized && t_taxonomy
            ? getCourseLevelLabel(levelNormalized, t_taxonomy)
            : null;

        const hasMeta =
          levelLabel || course.targetAudience || course.teacher?.fullName;

        const noSummaryFallback = t_courses
          ? t_courses("card.no_summary")
          : "Bu kurs için özet yakında eklenecek.";

        const audienceLabel = t_courses
          ? t_courses("card.audience_label")
          : "Kimler için:";

        const teacherLabel = t_courses
          ? t_courses("card.teacher_label")
          : "Eğitmen:";

        return (
          <ContentCardShell
            key={course.id}
            testId={join("egitimler", "card", course.slug)}
            href={`/egitimler/${course.slug}`}
            title={course.title}
            kicker={topicAreaLabel ?? undefined}
            headerAddon={
              levelLabel ? (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {levelLabel}
                </span>
              ) : undefined
            }
            summary={
              <p className="text-sm leading-6 text-foreground/74 sm:text-base sm:leading-7">
                {course.businessValue ??
                  course.summary ??
                  noSummaryFallback}
              </p>
            }
            className="bg-white"
            meta={
              hasMeta ? (
                <div className="space-y-2 text-sm leading-6 text-foreground/62 sm:text-base">
                  {course.targetAudience ? (
                    <p>
                      <span className="font-medium text-foreground/78">{audienceLabel}</span>{" "}
                      {course.targetAudience}
                    </p>
                  ) : null}
                  {course.teacher?.fullName ? (
                    <p>
                      <span className="font-medium text-foreground/78">{teacherLabel}</span>{" "}
                      {course.teacher.fullName}
                    </p>
                  ) : null}
                </div>
              ) : undefined
            }
          />
        );
      })}
    </ContentGrid>
  );
}
