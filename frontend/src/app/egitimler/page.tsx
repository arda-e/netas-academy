import Link from "next/link";
import { Download, Filter } from "lucide-react";
import { ContentPageShell } from "@/components/content";
import { CourseCatalogList, SearchField } from "@/components/courses/course-catalog-list";
import { getCourses } from "@/lib/strapi";
import {
  TOPIC_AREAS,
  resolveTopicFilter,
  buildTopicFilterHrefWithSearch,
  getTopicAreaLabel,
} from "@/lib/content-taxonomy";

export const dynamic = "force-dynamic";

type EgitimlerPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EgitimlerPage({ searchParams }: EgitimlerPageProps) {
  const params = await searchParams;
  const activeTopic = resolveTopicFilter(params.topic);
  const search = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  const courses = await getCourses();

  return (
    <ContentPageShell
      title="Eğitimler"
      description={
        <>
          <p>
            <strong className="text-white">
              Uzman eğitmenlerin hazırladığı programları
            </strong>{" "}
            inceleyin, kurumunuza en uygun öğrenme yolunu seçin.
          </p>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-white/88 sm:gap-2 sm:text-sm">
            <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
              Kurumsal programlar
            </span>
            <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
              Canlı oturumlar
            </span>
            <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
              Uygulamalı öğrenme
            </span>
          </div>
        </>
      }
      descriptionTrailing={
        <div
          aria-disabled="true"
          className="pointer-events-none inline-flex items-center gap-3 rounded-full border border-white/16 bg-white/10 px-4 py-2.5 text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/48">
            <Download className="size-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold">Katalog PDF indir</span>
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/38">
              Yakında aktif
            </span>
          </span>
        </div>
      }
    >
      <div className="space-y-10 sm:space-y-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <SearchField initialValue={search} />

          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <Filter className="size-4 text-[#009ca6]" aria-hidden="true" />
            {TOPIC_AREAS.map((area) => {
              const isActive = activeTopic === area;
              const href = buildTopicFilterHrefWithSearch(
                isActive ? "all" : area,
                search
              );

              return (
                <Link
                  key={area}
                  aria-current={isActive ? "page" : undefined}
                  href={href}
                  className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                    isActive
                      ? "border-[#009ca6] bg-[#009ca6] text-white shadow-sm"
                      : "border-border/70 bg-white/70 text-foreground/74 hover:border-[#009ca6] hover:bg-white/70 hover:text-[#009ca6]"
                  }`}
                >
                  {getTopicAreaLabel(area)}
                </Link>
              );
            })}
          </div>
        </div>

        <CourseCatalogList
          activeTopic={activeTopic === "all" ? null : activeTopic}
          search={search}
          items={courses.map((course) => ({
            id: course.documentId,
            slug: course.slug,
            title: course.title,
            summary: course.summary,
            description: course.description,
            topicArea: course.topicArea,
            level: course.level,
            targetAudience: course.targetAudience,
            businessValue: course.businessValue,
            scopeSummary: course.scopeSummary,
            outcomeBullets: course.outcomeBullets,
            teacherName: course.teacher?.fullName ?? null,
          }))}
        />
      </div>
    </ContentPageShell>
  );
}
