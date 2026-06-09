import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContentPageShell, RouteLoading } from "@/components/content";
import { RichTextContent } from "@/components/content/rich-text-content";
import { JsonLd } from "@/components/seo/json-ld";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { buildLocalePath, buildMetadata } from "@/lib/seo-utils";
import { getSiteSettings } from "@/lib/strapi-site-settings";
import { getCourseBySlug, getCourseSlugs } from "@/lib/strapi-courses";
import { normalizeCourseLevel, getCourseLevelLabel } from "@/lib/content-taxonomy";
import { join } from "@/lib/testids";
import { formatEventDateTime } from "@/lib/date-formatting";

function parseOutcomeBullets(value?: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCourseLevel(
  course: NonNullable<Awaited<ReturnType<typeof getCourseBySlug>>>,
  t_taxonomy: (key: string) => string
) {
  if (!course.level) {
    return undefined;
  }

  const level = normalizeCourseLevel(course.level);
  return level ? getCourseLevelLabel(level, t_taxonomy) : undefined;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getCourseSlugs();
  return ["tr", "en"].flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

type CourseDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const [t, course, siteSettings] = await Promise.all([
    getTranslations({ locale, namespace: "courses" }),
    getCourseBySlug(slug),
    getSiteSettings(),
  ]);

  if (!course) {
    return {
      title: t("meta.not_found"),
    };
  }

  return buildMetadata({
    seo: course.seo,
    defaults: siteSettings,
    fallbackTitle: course.title,
    fallbackDescription: course.summary,
    pagePath: buildLocalePath(locale, `/egitimler/${slug}`),
    locale,
  });
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("courses");
  const tt = await getTranslations("taxonomy");
  const [course, siteSettings] = await Promise.all([
    getCourseBySlug(slug),
    getSiteSettings(),
  ]);

  if (!course) {
    notFound();
  }

  const outcomeBullets = parseOutcomeBullets(course.outcomeBullets);
  const levelLabel = getCourseLevel(course, tt);
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.summary ?? course.description ?? undefined,
    provider: {
      "@type": "Organization",
      name: siteSettings?.siteName ?? "Netas Academy",
    },
  };

  return (
    <ContentPageShell
      testId="page.course-detail"
      breadcrumbItems={[
        { label: t("detail.breadcrumb"), href: "/egitimler" },
        { label: course.title },
      ]}
      title={course.title}
      description={
        <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-3xl space-y-5">
            {course.summary ? (
              <p className="max-w-2xl text-[15px] leading-7 text-white/88 sm:text-lg sm:leading-8">
                {course.summary}
              </p>
            ) : (
              <p className="max-w-2xl text-[15px] leading-7 text-white/88 sm:text-lg sm:leading-8">
                {t("detail.no_summary")}
              </p>
            )}
            <div className="space-y-3 text-sm text-white/90 sm:text-base">
              <div className="flex flex-wrap items-center gap-3">
                {levelLabel && (
                  <span className="inline-flex items-center rounded-full border border-white/18 bg-white/12 px-3 py-1 text-xs font-semibold text-white">
                    {levelLabel}
                  </span>
                )}
                {course.targetAudience && <span>{course.targetAudience}</span>}
              </div>
              {course.teacher && (
                <p className="mt-3 sm:mt-4">
                  <span className="font-medium text-white/92">{t("detail.teacher_label")}:</span>{" "}
                  <Link
                    className="font-medium text-white underline decoration-white/28 decoration-2 underline-offset-4 transition-colors hover:text-white/96"
                    href={`/egitmenler/${course.teacher.slug}`}
                    data-testid={join("page", "course-detail", "teacher-link", course.teacher.slug)}
                  >
                    {course.teacher.fullName}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      }
      descriptionClassName="max-w-3xl"
      descriptionTrailing={
        <Link
          href={buildIntentLeadUrl("corporate_training_request", { topic: course.title })}
          data-testid="page.course-detail.cta.corporate-request"
          className="inline-flex items-center gap-3 rounded-full border border-white/16 bg-white/10 px-4 py-2.5 text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-colors hover:bg-white/14 hover:text-white/86"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white/62">
            <span className="text-sm leading-none">→</span>
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-white">
              {t("detail.corporate_cta_label")}
            </span>
            <span className="text-[11px] uppercase tracking-[0.22em] text-white/55">
              {t("detail.corporate_cta_sub")}
            </span>
          </span>
        </Link>
      }
    >
      <JsonLd data={courseJsonLd} />
      <Suspense fallback={<RouteLoading testId="loading.course-detail" />}>
        <div className="space-y-6 sm:space-y-8">
          <section data-testid="page.course-detail.section.description">
            <h2 className="text-lg font-semibold text-foreground">{t("detail.section.description")}</h2>
            {course.description ? (
              <div className="mt-2">
                <RichTextContent
                  content={course.description}
                  className="max-w-none text-foreground/80 prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80"
                />
              </div>
            ) : (
              <p className="mt-2 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
                {t("detail.section.description_empty")}
              </p>
            )}
          </section>

          {course.businessValue ? (
            <section data-testid="page.course-detail.section.business-value">
              <h2 className="text-lg font-semibold text-foreground">{t("detail.section.business_value")}</h2>
              <p className="mt-2 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
                {course.businessValue}
              </p>
            </section>
          ) : (
            <p className="text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
              {t("detail.section.business_value_empty")}
            </p>
          )}

          {outcomeBullets.length > 0 && (
            <section data-testid="page.course-detail.section.outcomes">
              <h2 className="text-lg font-semibold text-foreground">{t("detail.section.outcomes")}</h2>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
                {outcomeBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </section>
          )}

          {course.scopeSummary && (
            <section data-testid="page.course-detail.section.scope">
              <h2 className="text-lg font-semibold text-foreground">{t("detail.section.scope")}</h2>
              <p className="mt-2 text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
                {course.scopeSummary}
              </p>
            </section>
          )}

          {course.events && course.events.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground">{t("detail.section.related_events")}</h2>
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
                    {event.startsAt && (
                      <span className="ml-2 text-sm text-foreground/50">
                        {formatEventDateTime(event.startsAt)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </Suspense>
    </ContentPageShell>
  );
}
