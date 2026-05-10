"use client";

import { useRef } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Calculate the scroll amount based on viewport width or a minimum threshold
  const SCROLL_AMOUNT = Math.max(
    scrollAreaRef.current?.clientWidth * 0.8 ?? 0,
    320
  );

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollAreaRef.current) return;

    const delta = direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    scrollAreaRef.current.scroll({
      left: scrollAreaRef.current.scrollLeft + delta,
      behavior: "smooth",
    });
  };

  if (items.length === 0) {
    return (
      <div className="panel-surface rounded-sm px-6 py-10 text-center text-foreground/68">
        {emptyMessage}
      </div>
    );
  }

  return (
    <section className={cn("space-y-5", className)}>
      {/* Navigation Buttons */}
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Onceki egitimler"
          data-testid={prevButtonTestId}
          onClick={() => handleScroll("left")}
        >
          <CaretLeft className="size-4" weight="bold" />
        </Button>

        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Sonraki egitimler"
          data-testid={nextButtonTestId}
          onClick={() => handleScroll("right")}
        >
          <CaretRight className="size-4" weight="bold" />
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div
        ref={scrollAreaRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {items.map((course) => {
          const topicSlug = normalizeTopicArea(course.topicArea ?? null);
          const levelSlug = normalizeCourseLevel(course.level ?? null);

          return (
            <Link
              key={course.documentId}
              href={`/egitimler/${course.slug}`}
              className="group/card-link flex min-w-[260px] snap-start cursor-pointer flex-col rounded-sm p-5 transition-all hover:-translate-y-0.5 hover:border-[#009ca6] hover:shadow-sm sm:min-w-[300px]"
              data-testid={cardTestIdPrefix ? `${cardTestIdPrefix}.${course.slug}` : undefined}
            >
              {/* Badges Row */}
              <div className="flex flex-wrap gap-1.5">
                {topicSlug && (
                  <Badge variant="secondary" className="text-[11px]">
                    {getTopicAreaLabel(topicSlug)}
                  </Badge>
                )}
                {levelSlug && (
                  <Badge variant="outline" className="text-[11px]">
                    {getCourseLevelLabel(levelSlug)}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <p className="mt-3 line-clamp-2 text-base font-semibold tracking-tight text-foreground transition-colors group-hover/card-link:text-[#009ca6]">
                {course.title}
              </p>

              {/* Summary */}
              {course.summary && (
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-foreground/62">
                  {course.summary}
                </p>
              )}

              {/* Footer Action */}
              <p className="mt-auto pt-3 text-xs font-medium text-foreground/50 transition-colors group-hover/card-link:text-[#009ca6]">
                Egitimi incele
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
