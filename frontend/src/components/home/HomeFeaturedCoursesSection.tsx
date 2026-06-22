import { Suspense } from "react";

import { CourseListLoading } from "@/components/content";
import { CourseCarousel, type CourseCarouselItem } from "@/components/course-carousel";
import { getLatestCourses } from "@/lib/strapi-courses";

type HomeFeaturedCoursesSectionProps = {
  eyebrow?: string;
  heading?: string;
  body?: string;
};

async function FeaturedCoursesCarousel() {
  const courses = await getLatestCourses(5);

  const items: CourseCarouselItem[] = courses.map((course) => ({
    documentId: course.documentId,
    slug: course.slug,
    title: course.title,
    summary: course.summary,
    topicArea: course.topicArea,
    level: course.level,
  }));

  return (
    <CourseCarousel
      items={items}
      carousel={{ cardTestIdPrefix: "home.featured-courses.card" }}
    />
  );
}

export function HomeFeaturedCoursesSection({
  eyebrow = "Öne Çıkan Eğitimler",
  heading = "Programlarımızı keşfedin",
  body = "En güncel eğitim programlarımızı inceleyin. Her program, kurumların dönüşüm ihtiyaçlarına yanıt verecek şekilde yapılandırılır.",
}: HomeFeaturedCoursesSectionProps = {}) {
  return (
    <section className="bg-background">
      <div className="page-container py-10 sm:py-12 lg:py-14">
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-normal leading-tight text-foreground md:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-foreground/60 md:text-base">
            {body}
          </p>
        </div>

        <div className="mt-5 sm:mt-5">
          <Suspense fallback={<CourseListLoading testId="loading.home.featured-courses" />}>
            <FeaturedCoursesCarousel />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
