"use client";

import { useRef } from "react";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCourseLevelLabel,
  getTopicAreaLabel,
  normalizeCourseLevel,
  normalizeTopicArea,
} from "@/lib/content-taxonomy";
import { cn } from "@/lib/utils";

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
  getCardTestId?: (slug: string) => string;
  prevButtonTestId?: string;
  nextButtonTestId?: string;
};

export function CourseCarousel({
  items,
  className,
  emptyMessage = "Gosterilecek egitim bulunamadi.",
  getCardTestId,
  prevButtonTestId,
  nextButtonTestId,
}: CourseCarouselProps) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const scrollByPage = (direction: "left" | "right") => {
    const node = scrollAreaRef.current;

    if (!node) {
      return;
    }

    const amount = Math.max(node.clientWidth * 0.8, 320);
    node.scrollBy({
      left: direction === "left" ? -amount : amount,
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
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Onceki egitimler"
          data-testid={prevButtonTestId}
          onClick={() => scrollByPage("left")}
        >
          <CaretLeft className="size-4" weight="bold" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Sonraki egitimler"
          data-testid={nextButtonTestId}
          onClick={() => scrollByPage("right")}
        >
          <CaretRight className="size-4" weight="bold" />
        </Button>
      </div>

      <div
        ref={scrollAreaRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((course) => {
          const topicSlug = normalizeTopicArea(course.topicArea ?? null);
          const levelSlug = normalizeCourseLevel(course.level ?? null);

          return (
            <Link
              key={course.documentId}
              href={`/egitimler/${course.slug}`}
              className="panel-surface group/card-link flex min-w-[260px] snap-start cursor-pointer flex-col rounded-sm p-5 transition-all hover:-translate-y-0.5 hover:border-[#009ca6] hover:shadow-sm sm:min-w-[300px]"
              data-testid={getCardTestId?.(course.slug)}
            >
              <div className="flex flex-wrap gap-1.5">
                {topicSlug ? (
                  <Badge variant="secondary" className="text-[11px]">
                    {getTopicAreaLabel(topicSlug)}
                  </Badge>
                ) : null}
                {levelSlug ? (
                  <Badge variant="outline" className="text-[11px]">
                    {getCourseLevelLabel(levelSlug)}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-3 line-clamp-2 text-base font-semibold tracking-tight text-foreground transition-colors group-hover/card-link:text-[#009ca6]">
                {course.title}
              </p>
              {course.summary ? (
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-foreground/62">
                  {course.summary}
                </p>
              ) : null}
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
