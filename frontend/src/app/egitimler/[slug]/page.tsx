import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentPageShell } from "@/components/content";
import { RichTextContent } from "@/components/content/rich-text-content";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { getCourseBySlug } from "@/lib/strapi";
import {
  normalizeTopicArea,
  getTopicAreaLabel,
  normalizeCourseLevel,
  getCourseLevelLabel,
} from "@/lib/content-taxonomy";
import { join } from "@/lib/testids";

function parseOutcomeBullets(value?: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

type CourseDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return {
      title: "Egitim Bulunamadi",
    };
  }

  return {
    title: course.title,
    description: course.summary ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const outcomeBullets = parseOutcomeBullets(course.outcomeBullets);
  const topicAreaLabel = course.topicArea
    ? (() => {
        const ta = normalizeTopicArea(course.topicArea);
        return ta ? getTopicAreaLabel(ta) : course.teacher?.fullName ?? undefined;
      })()
    : course.teacher?.fullName ?? undefined;
  const levelLabel = course.level
    ? (() => {
        const cl = normalizeCourseLevel(course.level);
        return cl ? getCourseLevelLabel(cl) : undefined;
      })()
    : undefined;

  return (
    <ContentPageShell
      testId="page.course-detail"
      breadcrumbItems={[
        { label: "Eğitim Kataloğu", href: "/egitimler" },
        { label: course.title },
      ]}
      eyebrow={topicAreaLabel}
      title={course.title}
      description={
        <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-3xl space-y-5">
            {course.summary ? (
              <p className="max-w-2xl text-[15px] leading-7 text-white/76 sm:text-lg sm:leading-8">
                {course.summary}
              </p>
            ) : (
              <p className="max-w-2xl text-[15px] leading-7 text-white/76 sm:text-lg sm:leading-8">
                Kurumunuza uygun, uygulama odaklı ve detaylı eğitim içeriği.
              </p>
            )}
            <div className="space-y-3 text-sm text-white/82 sm:text-base">
              <div className="flex flex-wrap items-center gap-3">
                {levelLabel ? (
                  <span className="inline-flex items-center rounded-full border border-white/18 bg-white/12 px-3 py-1 text-xs font-semibold text-white">
                    {levelLabel}
                  </span>
                ) : null}
                {course.targetAudience ? <span>{course.targetAudience}</span> : null}
              </div>
              {course.teacher ? (
                <p>
                  <span className="font-medium text-white/86">Eğitmen:</span>{" "}
                  <Link
                    className="font-medium text-white underline decoration-white/28 decoration-2 underline-offset-4 transition-colors hover:text-white/90"
                    href={`/egitmenler/${course.teacher.slug}`}
                    data-testid={join("page", "course-detail", "teacher-link", course.teacher.slug)}
                  >
                    {course.teacher.fullName}
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      }
      descriptionClassName="max-w-3xl"
      descriptionTrailing={
        <Link
          href={buildIntentLeadUrl("corporate_training_request", { topic: course.title })}
          data-testid="page.course-detail.cta.corporate-request"
          className="inline-flex items-center gap-3 rounded-full border border-white/16 bg-white/10 px-4 py-2.5 text-white/58 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-colors hover:bg-white/14 hover:text-white/72"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/48">
            <span className="text-sm leading-none">→</span>
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-white">
              Bu Eğitimi Kurumsal Olarak Talep Et
            </span>
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/38">
              Talep formuna git
            </span>
          </span>
        </Link>
      }
    >
      <div className="max-w-3xl space-y-6 sm:space-y-8">
        <section data-testid="page.course-detail.section.description">
          <h2 className="text-lg font-semibold text-foreground">Eğitim Açıklaması</h2>
          {course.description ? (
            <div className="mt-2">
              <RichTextContent
                content={course.description}
                className="max-w-none text-foreground/80 prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80"
              />
            </div>
          ) : (
            <p className="mt-2 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
              Bu eğitim için detaylı içerik yakında eklenecek.
            </p>
          )}
        </section>

        {course.businessValue ? (
          <section data-testid="page.course-detail.section.business-value">
            <h2 className="text-lg font-semibold text-foreground">Kurumsal Değer</h2>
            <p className="mt-2 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
              {course.businessValue}
            </p>
          </section>
        ) : (
          <p className="text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
            Bu eğitimin kurumsal değer bilgisi yakında eklenecek.
          </p>
        )}

        {outcomeBullets.length > 0 ? (
          <section data-testid="page.course-detail.section.outcomes">
            <h2 className="text-lg font-semibold text-foreground">Beklenen Çıktılar</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
              {outcomeBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {course.scopeSummary ? (
          <section data-testid="page.course-detail.section.scope">
            <h2 className="text-lg font-semibold text-foreground">Kapsam ve İçerik</h2>
            <p className="mt-2 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
              {course.scopeSummary}
            </p>
          </section>
        ) : null}

        {course.events && course.events.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-foreground">İlişkili Etkinlikler</h2>
            <ul className="mt-2 space-y-2">
              {course.events.map((event) => (
                <li key={event.documentId}>
                  <Link
                    className="text-primary hover:underline"
                    href={`/etkinlikler/${event.slug}`}
                    data-testid={join("page", "course-detail", "related-event", event.slug)}
                  >
                    {event.title}
                  </Link>
                  {event.startsAt ? (
                    <span className="ml-2 text-sm text-foreground/50">
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(event.startsAt))}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </ContentPageShell>
  );
}
