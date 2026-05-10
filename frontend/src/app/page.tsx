import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Netas Academy | Kurumsal Eğitim ve Hakkımızda",
  description:
    "Netaş Akademi'nin ana sayfası ve hakkımızda anlatısı tek bir akışta; kurumsal eğitim yaklaşımımızı, uygulamalı öğrenme modelimizi ve öne çıkan programlarımızı keşfedin.",
};

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

export default function Home() {
  return (
    <>
      <HeroOverlay
        variant="home"
        showBreadcrumb={false}
        title={
          <>
            Kurumsal dönüşümü
            <br className="hidden sm:block" />
            saha tecrübesiyle
            <br className="hidden sm:block" />
            hızlandırın.
          </>
        }
        description="Netaş Akademi, teknoloji birikimi ve saha deneyimini kurumsal öğrenmeye dönüştürerek ekiplerin değişime daha hızlı uyum sağlamasına yardımcı olur."
        primaryCta={{
          href: "/#hakkimizda",
          label: "Daha Fazla Keşfet",
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
              <p className="page-eyebrow">Hakkımızda</p>
              <div className="space-y-4">
                <h2 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  Kurumsal dönüşümü öğrenme deneyimine çeviren tek sayfalık
                  bir anlatı sunar.
                </h2>
                <p className="max-w-2xl page-body-text">
                  Netaş&apos;ın teknoloji ve sektör tecrübesiyle şekillenen
                  programlar, kurumların kendi ihtiyaçlarına göre yeniden
                  kurgulanır. Amacımız, ekiplerinize yalnızca bilgi vermek
                  değil, değişime daha hızlı uyum sağlayan bir çalışma kültürü
                  kazandırmaktır.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={buildIntentLeadUrl("corporate_training_request")}
                  data-measurement-id="home_about_corporate_cta"
                  data-testid="page.home.about.cta.corporate-training"
                  className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#0f4c81] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0c406b]"
                >
                  Kurumsal Eğitim Talep Et
                </Link>
                <Link
                  href="/egitimler"
                  data-measurement-id="home_about_catalog_cta"
                  data-testid="page.home.about.cta.catalog"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/18"
                >
                  Eğitim Kataloğunu İncele
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
                    Sahada Kanıtlanmış
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    Yılların sektör deneyimiyle oluşturulmuş, teoriden pratiğe
                    uzanan eğitim içerikleri.
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
                    Kuruma Özel
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    Her kurumun ihtiyacına göre şekillenen esnek program yapısı
                    ve özelleştirilebilir içerikler.
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
                    Dönüşüm Odaklı
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    Bireysel öğrenmenin ötesinde, takım dinamiklerini
                    güçlendiren ve iş birliğini artıran programlar.
                  </p>
                </article>

                <article className="rounded-sm border border-primary/18 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/58">
                    Netaş Güvencesi
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/78">
                    Kurumsal eğitim programları, teknoloji ve sektör
                    birikiminin sahada karşılık bulan bir öğrenme modeline
                    dönüşür.
                  </p>
                </article>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-sm border border-primary/18 bg-slate-950 p-6 text-white shadow-sm sm:p-8 lg:min-h-[260px]">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/58">
                  Uygulamalı Model
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Gerçek iş problemleri üzerinden ilerleyen öğrenme tasarımı
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/76 sm:text-base">
                  Vaka, senaryo ve etkileşimli çalışma biçimleriyle teori ve
                  pratiği aynı akışta buluşturuyoruz. Katılımcıların öğrendiklerini
                  kendi iş bağlamlarına taşımasını hedefliyoruz.
                </p>
              </article>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <article className="panel-surface rounded-sm p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/72">
                    Eğitim Etkisi
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    Program sonunda daha hızlı adaptasyon, daha güçlü takım
                    çalışması ve ölçülebilir öğrenme çıktıları hedeflenir.
                  </p>
                </article>

                <article className="rounded-sm border border-primary/16 bg-primary/10 p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                    Esnek Yapı
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/72">
                    Açık sınıf, kapalı devre, hibrit ve uzaktan formatlar aynı
                    kurumsal hedef için yeniden kurgulanabilir.
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
            <p className="page-eyebrow">Eğitmen Kadrosu</p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Saha deneyimi güçlü eğitmenlerimiz
            </h2>
            <p className="max-w-3xl page-body-text">
              Eğitmenlerimiz yalnızca anlatıcı değil, sahada dönüşüm projelerinde
              yer almış uzmanlardır. Katılımcılara örnekler, yöntemler ve
              uygulanabilir çerçeveler sunarak kuram ile pratik arasındaki köprüyü
              birlikte kurar.
            </p>
            <Suspense fallback={<TeacherListLoading testId="loading.home.teachers" />}>
              <InstructorCarouselSection />
            </Suspense>
          </div>
        </section>

        <section className="page-section pt-0 sm:pt-0 lg:pt-2">
          <div className="space-y-4 sm:space-y-5">
            <p className="page-eyebrow">Öne Çıkan Eğitimler</p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Programlarımızı tek bir akışta keşfedin
            </h2>
            <p className="max-w-3xl page-body-text">
              En güncel eğitim programlarımızı inceleyin. Her program, kurumların
              dönüşüm ihtiyaçlarına yanıt verecek şekilde yapılandırılır.
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
                <p className="page-eyebrow">İletişim</p>
                <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl">
                  Kurumsal eğitim ihtiyacınızı birlikte şekillendirelim
                </h2>
                <p className="max-w-3xl page-body-text">
                  Eğitim kapsamını, ekip yapınızı ve hedeflediğiniz çıktıları
                  paylaşın. İhtiyacınıza uygun bir kurumsal program kurgulayalım.
                </p>
              </div>

              <Link
                href={buildIntentLeadUrl("corporate_training_request")}
                data-measurement-id="home_contact_cta"
                data-testid="page.home.cta.contact"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#0f4c81] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0c406b]"
              >
                Kurumsal Eğitim Talebi
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
