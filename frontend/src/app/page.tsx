import type { Metadata } from "next";
import {
  CourseListLoading,
  TeacherListLoading,
} from "@/components/content";
import { CourseCarousel } from "@/components/course-carousel";
import { TeacherCarousel } from "@/components/teacher-carousel";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomeTrustSection } from "@/components/home/HomeTrustSection";
import { HomeLearningModelSection } from "@/components/home/HomeLearningModelSection";
import { HomeProgramsSection } from "@/components/home/HomeProgramsSection";
import { HomeOutcomesSection } from "@/components/home/HomeOutcomesSection";
import { HomeContactCTASection } from "@/components/home/HomeContactCTASection";
import { getLatestCourses } from "@/lib/strapi-courses";
import { getStrapiMediaAltText, getStrapiMediaUrl } from "@/lib/strapi-media";
import { getTeachers } from "@/lib/strapi-teachers";
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
      <HomeHeroSection />

      <main className="page-shell" data-testid="page.home">
        <HomeTrustSection />
        <HomeLearningModelSection />
        <HomeProgramsSection />

        <section className="page-section pt-0 sm:pt-0 lg:pt-2">
          <div className="space-y-4 sm:space-y-5">
            <p className="page-eyebrow">Eğitmen Kadrosu</p>
            <h2 className="text-balance text-2xl font-normal tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Sahada öğreten, deneyimle yönlendiren eğitmenler
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

        <HomeOutcomesSection />

        <section className="page-section pt-0 sm:pt-0 lg:pt-2">
          <div className="space-y-4 sm:space-y-5">
            <p className="page-eyebrow">Öne Çıkan Eğitimler</p>
            <h2 className="text-balance text-2xl font-normal tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Programlarımızı keşfedin
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

        <HomeContactCTASection />
      </main>
    </>
  );
}
