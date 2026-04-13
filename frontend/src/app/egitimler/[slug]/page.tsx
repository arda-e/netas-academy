import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CourseDetail, VisualStorySection } from "@/components/content";
import { courseDetailVisualSection } from "@/lib/page-visual-sections";
import { getCourseBySlug } from "@/lib/strapi";

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

  return (
    <CourseDetail
      eyebrow={course.teacher?.fullName}
      title={course.title}
      summary={course.summary}
      afterContent={<VisualStorySection {...courseDetailVisualSection} />}
    >
      <div className="max-w-3xl space-y-5 sm:space-y-6">
        {course.teacher ? (
          <div className="flex flex-col gap-1 text-[15px] leading-7 text-foreground/80 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2 sm:text-base sm:leading-8">
            <span className="font-medium text-foreground">Egitmen Profili:</span>
            <Link className="text-primary hover:underline" href={`/egitmenler/${course.teacher.slug}`}>
              {course.teacher.fullName}
            </Link>
          </div>
        ) : null}
        <p className="text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg">
          {course.description ?? "Bu egitim icin detayli icerik yakinda eklenecek."}
        </p>
      </div>
    </CourseDetail>
  );
}
