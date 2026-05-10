import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HeroOverlay } from "@/components/hero-overlay";
import {
  CourseListLoading,
  TeacherListLoading,
  VisualStorySection,
} from "@/components/content";
import { CourseCarousel } from "@/components/course-carousel";
import { TeacherCarousel } from "@/components/teacher-carousel";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { hakkimizdaVisualSection } from "@/lib/page-visual-sections";
import { getLatestCourses } from "@/lib/strapi-courses";
import { getStrapiMediaAltText, getStrapiMediaUrl } from "@/lib/strapi-media";
import { getTeachers } from "@/lib/strapi-teachers";
import { join, normalizeKey } from "@/lib/testids";
import Link from "next/link";
import { Suspense } from "react";

interface HomePageParams {
  locale: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<HomePageParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

async function InstructorCarouselSection() {
  const teachers = await getTeachers();

  return (
    <TeacherCarousel
      items={teachers.map((teacher) => ({
        id: teacher.documentId,
        slug: teacher.slug,
        name: teacher.fullName,
        imageUrl: getStrapiMediaUrl(teacher.profilePhoto),
        imageAlt: getStrapiMediaAltText(teacher.profilePhoto) ?? teacher.fullName,
      }))}
      cardTestIdPrefix="page.home.teacher-carousel.card"
      prevButtonTestId="page.home.teacher-carousel.prev"
      nextButtonTestId="page.home.teacher-carousel.next"
    />
  );
}

async function LatestCoursesSection() {
  const courses = await getLatestCourses(5);

  return (
    <CourseCarousel
      items={courses.map((course) => ({
        documentId: course.documentId,
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        topicArea: course.topicArea,
        level: course.level,
      }))}
      cardTestIdPrefix="page.home.course-carousel.card"
    />
  );
}

export default async function Home({
  params,
}: {
  params: Promise<HomePageParams>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <>
      <HeroOverlay
        variant="home"
        showBreadcrumb={false}
        title={t("hero.title")}
        description={t("hero.description")}
        primaryCta={{
          href: "/#hakkimizda",
          label: t("hero.cta_primary"),
        }}
        secondaryCta={undefined}
        primaryCtaMeasurementId="home-hero-primary"
        secondaryCtaMeasurementId="home-hero-secondary"
        primaryCtaTestId="page.home.hero.cta.corporate-training"
        secondaryCtaTestId="page.home.hero.cta.about"
      />

      <main className="page-shell" data-testid="page.home">
        <section id="hakkimizda" className="page-section scroll-mt-24 pt-6 sm:pt-8 lg:pt-12">
          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
            <div className="space-y-5">
              <p className="page-eyebrow">{t("about.eyebrow")}</p>
              <div className="space-y-4">
                <h2 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  {t("about.heading")}
                </h2>
                <p className="max-w-2xl page-body-text">
                  {t("about.body")}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={buildIntentLeadUrl("corporate_training_request")}
                  data-measurement-id="home_about_corporate_cta"
                  data-testid="page.home.about.cta.corporate-training"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#0f4c81] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0c406b]"
                >
                  {t("about.cta_corporate")}
                </Link>
                <Link
                  href="/egitimler"
                  data-measurement-id="home_about_catalog_cta"
                  data-testid="page.home.about.cta.catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/18"
                >
                  {t("about.cta_catalog")}
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <article
                  className="panel-surface rounded-sm p-5 sm:p-6"
                  data-testid={join(
                    "page",
                    "home",
                    "about",
                    "card",
                    normalizeKey("Sahada Kanıtlanmış"),
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/72">
                    {t("about.card_proven.title")}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    {t("about.card_proven.body")}
                  </p>
                </article>

                <article
                  className="panel-surface rounded-sm p-5 sm:p-6"
                  data-testid={join(
                    "page",
                    "home",
                    "about",
                    "card",
                    normalizeKey("Kuruma Özel"),
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/72">
                    {t("about.card_custom.title")}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    {t("about.card_custom.body")}
                  </p>
                </article>

                <article
                  className="panel-surface rounded-sm p-5 sm:p-6"
                  data-testid={join(
                    "page",
                    "home",
                    "about",
                    "card",
                    normalizeKey("Dönüşüm Odaklı"),
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/72">
                    {t("about.card_transform.title")}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    {t("about.card_transform.body")}
                  </p>
                </article>

                <article className="rounded-sm border border-primary/18 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/58">
                    {t("about.card_netas.title")}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/78">
                    {t("about.card_netas.body")}
                  </p>
                </article>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-sm border border-primary/18 bg-slate-950 p-6 text-white shadow-sm sm:p-8 lg:min-h-[260px]">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/58">
                  {t("about.card_applied.title")}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {t("about.card_applied.heading")}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/76 sm:text-base">
                  {t("about.card_applied.body")}
                </p>
              </article>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <article className="panel-surface rounded-sm p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/72">
                    {t("about.card_impact.title")}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    {t("about.card_impact.body")}
                  </p>
                </article>

                <article className="rounded-sm border border-primary/16 bg-primary/10 p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    {t("about.card_flexible.title")}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    {t("about.card_flexible.body")}
                  </p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section pt-0 sm:pt-0 lg:pt-2">
          <VisualStorySection
            {...hakkimizdaVisualSection}
            itemTestIdPrefix="page.home.visual-story.item"
          />
        </section>

        <section className="page-section pt-0 sm:pt-0 lg:pt-2">
          <div className="space-y-4 sm:space-y-5">
            <p className="page-eyebrow">{t("teachers.eyebrow")}</p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {t("teachers.heading")}
            </h2>
            <p className="max-w-3xl page-body-text">
              {t("teachers.body")}
            </p>
            <Suspense fallback={<TeacherListLoading testId="loading.home.teachers" />}>
              <InstructorCarouselSection />
            </Suspense>
          </div>
        </section>

        <section className="page-section pt-0 sm:pt-0 lg:pt-2">
          <div className="space-y-4 sm:space-y-5">
            <p className="page-eyebrow">{t("courses.eyebrow")}</p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              {t("courses.heading")}
            </h2>
            <p className="max-w-3xl page-body-text">
              {t("courses.body")}
            </p>
            <Suspense fallback={<CourseListLoading testId="loading.home.courses" />}>
              <LatestCoursesSection />
            </Suspense>
          </div>
        </section>

        <section className="page-section pt-0 pb-16 sm:pb-20 lg:pb-24">
          <div className="panel-surface rounded-sm p-6 sm:p-8 lg:p-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-3">
                <p className="page-eyebrow">{t("contact_cta.eyebrow")}</p>
                <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                  {t("contact_cta.heading")}
                </h2>
                <p className="max-w-3xl page-body-text">
                  {t("contact_cta.body")}
                </p>
              </div>

              <Link
                href={buildIntentLeadUrl("corporate_training_request")}
                data-measurement-id="home_contact_cta"
                data-testid="page.home.cta.contact"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#0f4c81] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0c406b]"
              >
                {t("contact_cta.button")}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
