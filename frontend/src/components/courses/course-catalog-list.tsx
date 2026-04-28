"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
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

type SearchFieldProps = {
  initialValue?: string;
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

export function SearchField({ initialValue = "" }: SearchFieldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(Boolean(initialValue.trim()));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValue(initialValue);
    setOpen(Boolean(initialValue.trim()));
  }, [initialValue]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const updateSearchParam = (nextSearch: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextSearch.trim();

    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div
      className={`flex items-center overflow-hidden border border-border/70 bg-white/70 transition-all duration-200 ease-out ${
        open ? "w-full rounded-sm" : "w-10 rounded-full"
      } ${open ? "" : "cursor-pointer"} lg:flex-none lg:transition-[width] lg:duration-200 ${
        open ? "lg:w-[420px]" : "lg:w-10"
      }`}
    >
      <button
        type="button"
        aria-label="Eğitim ara"
        onClick={() => setOpen(true)}
        className={`inline-flex h-9 shrink-0 items-center justify-center text-gray-800 transition-all duration-200 hover:bg-[#009ca6]/10 hover:text-[#009ca6] ${
          open ? "pointer-events-none w-0 opacity-0" : "w-10 cursor-pointer opacity-100"
        }`}
      >
        <Search className="size-4" />
      </button>

      <div className={`relative flex-1 ${open ? "block" : "hidden"}`}>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-800" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            const nextSearch = e.target.value;
            setValue(nextSearch);
            updateSearchParam(nextSearch);
          }}
          onBlur={() => {
            if (!value.trim()) {
              setOpen(false);
            }
          }}
          placeholder="Eğitim ara..."
          className="h-9 w-full bg-transparent py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>
    </div>
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
