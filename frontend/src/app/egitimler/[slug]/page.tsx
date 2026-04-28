import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseDetail } from "@/components/content";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { getCourseBySlug } from "@/lib/strapi";
import {
  normalizeTopicArea,
  getTopicAreaLabel,
  normalizeCourseLevel,
  getCourseLevelLabel,
} from "@/lib/content-taxonomy";

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

  return (
    <CourseDetail
      eyebrow={
        course.topicArea
          ? (() => {
              const ta = normalizeTopicArea(course.topicArea);
              return ta ? getTopicAreaLabel(ta) : (course.teacher?.fullName ?? undefined);
            })()
          : course.teacher?.fullName ?? undefined
      }
      title={course.title}
      summary={course.summary}
      meta={
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {course.level ? (() => {
            const cl = normalizeCourseLevel(course.level);
            return cl ? (
              <span className="rounded-full border border-primary/30 bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary">
                {getCourseLevelLabel(cl)}
              </span>
            ) : null;
          })() : null}
          {course.targetAudience ? (
            <span className="text-foreground/70">{course.targetAudience}</span>
          ) : null}
          {course.teacher ? (
            <Link className="text-primary hover:underline" href={`/egitmenler/${course.teacher.slug}`}>
              {course.teacher.fullName}
            </Link>
          ) : null}
        </div>
      }
    >
      <div className="max-w-3xl space-y-6 sm:space-y-8">
        {course.businessValue ? (
          <section>
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
          <section>
            <h2 className="text-lg font-semibold text-foreground">Beklenen Çıktılar</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
              {outcomeBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {course.scopeSummary ? (
          <section>
            <h2 className="text-lg font-semibold text-foreground">Kapsam ve İçerik</h2>
            <p className="mt-2 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
              {course.scopeSummary}
            </p>
          </section>
        ) : null}

        <section>
          <h2 className="text-lg font-semibold text-foreground">Eğitim Açıklaması</h2>
          <p className="mt-2 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg">
            {course.description ?? "Bu eğitim için detaylı içerik yakında eklenecek."}
          </p>
        </section>

        {course.events && course.events.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-foreground">İlişkili Etkinlikler</h2>
            <ul className="mt-2 space-y-2">
              {course.events.map((event) => (
                <li key={event.documentId}>
                  <Link className="text-primary hover:underline" href={`/etkinlikler/${event.slug}`}>
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

        <div className="pt-2">
          <Link
            href={buildIntentLeadUrl("corporate_training_request", { topic: course.title })}
            className="inline-flex items-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/18"
          >
            Bu Eğitimi Kurumsal Olarak Talep Et
          </Link>
        </div>
      </div>
    </CourseDetail>
  );
}
