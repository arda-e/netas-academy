"use client";

import { useTranslations } from "next-intl";

import { HorizontalScrollCarousel } from "@/components/carousel/horizontal-scroll-carousel";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import {
  getCourseLevelLabel,
  getTopicAreaLabel,
  normalizeCourseLevel,
  normalizeTopicArea,
} from "@/lib/content-taxonomy";

export type CourseCarouselItem = {
  documentId: string;
  slug: string;
  title: string;
  summary?: string | null;
  topicArea?: string | null;
  level?: string | null;
};

type CourseCarouselProps = {
  items: CourseCarouselItem[];
  className?: string;
  emptyMessage?: string;
  cardTestIdPrefix?: string;
  prevButtonTestId?: string;
  nextButtonTestId?: string;
};

export function CourseCarousel({
  items,
  className,
  emptyMessage = "Gosterilecek egitim bulunamadi.",
  cardTestIdPrefix,
  prevButtonTestId,
  nextButtonTestId,
}: CourseCarouselProps) {
  const t_taxonomy = useTranslations("taxonomy");
  const t_common = useTranslations("common");

  return (
    <HorizontalScrollCarousel
      itemsCount={items.length}
      emptyMessage={emptyMessage}
      className={className ? `space-y-3 ${className}` : "space-y-3"}
      scrollAreaClassName="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]"
      controlsClassName="justify-end gap-1.5"
      controlsPlacement="after"
      prevLabel={t_common("course_carousel.prev")}
      nextLabel={t_common("course_carousel.next")}
      prevButtonTestId={prevButtonTestId}
      nextButtonTestId={nextButtonTestId}
    >
      {items.map((course) => {
        const topicSlug = normalizeTopicArea(course.topicArea ?? null);
        const levelSlug = normalizeCourseLevel(course.level ?? null);

        return (
          <Link
            key={course.documentId}
            href={`/egitimler/${course.slug}`}
            className="group/card-link flex min-w-[260px] snap-start cursor-pointer flex-col rounded-sm p-5 mt-1 transition-all hover:-translate-y-0.5 hover:border-[#009ca6] hover:shadow-sm sm:min-w-[300px] border-2 border-gray-200"
            data-testid={
              cardTestIdPrefix ? `${cardTestIdPrefix}.${course.slug}` : undefined
            }
          >
            <div className="flex flex-wrap gap-1.5">
              {topicSlug && (
                <Badge variant="secondary" className="text-[11px]">
                  {getTopicAreaLabel(topicSlug, t_taxonomy)}
                </Badge>
              )}
              {levelSlug && (
                <Badge variant="outline" className="text-[11px]">
                  {getCourseLevelLabel(levelSlug, t_taxonomy)}
                </Badge>
              )}
            </div>

            <p className="mt-3 line-clamp-2 text-base font-semibold tracking-tight text-foreground transition-colors group-hover/card-link:text-[#009ca6]">
              {course.title}
            </p>

            {course.summary && (
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-foreground/62">
                {course.summary}
              </p>
            )}

            <p className="mt-auto pt-3 text-xs font-medium text-foreground/50 transition-colors group-hover/card-link:text-[#009ca6]">
              {t_common("course_carousel.examine")}
            </p>
          </Link>
        );
      })}
    </HorizontalScrollCarousel>
  );
}
