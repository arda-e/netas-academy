import type { ReactNode } from "react";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentDetailShell } from "@/components/content/content-detail-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";
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
  teacherName?: string | null;
  topicArea?: string | null;
  level?: string | null;
  targetAudience?: string | null;
  businessValue?: string | null;
};

type CourseListProps = {
  items: CourseListItem[];
  emptyMessage?: string;
};

type CourseDetailProps = {
  eyebrow?: string;
  title: string;
  summary?: string | null;
  meta?: ReactNode;
  outcomeBullets?: string | null;
  children: ReactNode;
  afterContent?: ReactNode;
};

export function CourseList({
  items,
  emptyMessage = "Gösterilecek eğitim verisi şu an kullanılabilir değil.",
}: CourseListProps) {
  return (
    <ContentGrid
      itemsCount={items.length}
      emptyMessage={emptyMessage}
      columnsClassName={responsiveLayoutClasses.courseListGrid}
    >
      {items.map((course) => {
        const topicAreaNormalized = course.topicArea
          ? normalizeTopicArea(course.topicArea)
          : null;
        const topicAreaLabel = topicAreaNormalized
          ? getTopicAreaLabel(topicAreaNormalized)
          : null;

        const levelNormalized = course.level
          ? normalizeCourseLevel(course.level)
          : null;
        const levelLabel = levelNormalized
          ? getCourseLevelLabel(levelNormalized)
          : null;

        const hasMeta =
          levelLabel || course.targetAudience || course.teacherName;

        return (
          <ContentCardShell
            key={course.id}
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
                  "Bu kurs için özet yakında eklenecek."}
              </p>
            }
            className="bg-white"
            meta={
              hasMeta ? (
                <div className="space-y-2 text-sm leading-6 text-foreground/62 sm:text-base">
                  {course.targetAudience ? (
                    <p>
                      <span className="font-medium text-foreground/78">Kimler için:</span>{" "}
                      {course.targetAudience}
                    </p>
                  ) : null}
                  {course.teacherName ? (
                    <p>
                      <span className="font-medium text-foreground/78">Eğitmen:</span>{" "}
                      {course.teacherName}
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

export function CourseDetail({
  eyebrow,
  title,
  summary,
  meta,
  children,
  afterContent,
}: CourseDetailProps) {
  return (
    <ContentDetailShell
      eyebrow={eyebrow}
      title={title}
      summary={summary ?? undefined}
      meta={meta}
      afterContent={afterContent}
    >
      {children}
    </ContentDetailShell>
  );
}
