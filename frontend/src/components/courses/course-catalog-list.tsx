"use client";

import { useMemo } from "react";
import { CourseList } from "@/components/content";
import {
  getCourseLevelLabel,
  getTopicAreaLabel,
  normalizeCourseLevel,
  normalizeTopicArea,
  type TopicArea,
} from "@/lib/content-taxonomy";

export type CourseCatalogListItem = {
  id: number | string;
  slug: string;
  title: string;
  summary?: string | null;
  description?: string | null;
  topicArea?: string | null;
  level?: string | null;
  targetAudience?: string | null;
  businessValue?: string | null;
  scopeSummary?: string | null;
  outcomeBullets?: string | null;
  teacherName?: string | null;
};

export type CourseCatalogListProps = {
  items: CourseCatalogListItem[];
  emptyMessage?: string;
  activeTopic?: TopicArea | null;
  search?: string;
};

function normalizeSearchText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[çğıöşü]/g, (char) => {
      const replacements: Record<string, string> = {
        ç: "c",
        ğ: "g",
        ı: "i",
        ö: "o",
        ş: "s",
        ü: "u",
      };

      return replacements[char] ?? char;
    })
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function getCourseSearchText(course: CourseCatalogListItem) {
  const topicArea = normalizeTopicArea(course.topicArea ?? null);
  const level = normalizeCourseLevel(course.level ?? null);

  return normalizeSearchText(
    [
      course.title,
      course.slug,
      course.summary,
      course.description,
      course.businessValue,
      course.scopeSummary,
      course.outcomeBullets,
      course.targetAudience,
      course.teacherName,
      topicArea ? getTopicAreaLabel(topicArea) : course.topicArea,
      level ? getCourseLevelLabel(level) : course.level,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

export function CourseCatalogList({
  items,
  emptyMessage = "Bu kriterlere uygun eğitim bulunamadı.",
  activeTopic,
  search = "",
}: CourseCatalogListProps) {
  const filtered = useMemo(() => {
    const terms = normalizeSearchText(search).split(" ").filter(Boolean);

    let result = items;

    if (activeTopic != null) {
      result = result.filter(
        (c) => normalizeTopicArea(c.topicArea ?? null) === activeTopic
      );
    }

    if (terms.length > 0) {
      result = result.filter((c) => {
        const courseSearchText = getCourseSearchText(c);
        return terms.every((term) => courseSearchText.includes(term));
      });
    }

    return result;
  }, [items, search, activeTopic]);

  return (
    <div>
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <CourseList items={filtered} />
      )}
    </div>
  );
}
