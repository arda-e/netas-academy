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
      eyebrow={course.teacher?.fullName ?? "Netas Academy"}
      title={course.title}
      summary={course.summary}
      afterContent={<VisualStorySection {...courseDetailVisualSection} />}
    >
      <div className="space-y-6">
        {course.teacher ? (
          <p>
            Egitmen Profili:{" "}
            <Link className="text-primary hover:underline" href={`/egitmenler/${course.teacher.slug}`}>
              {course.teacher.fullName}
            </Link>
          </p>
        ) : null}
        <p>{course.description ?? "Bu egitim icin detayli icerik yakinda eklenecek."}</p>
      </div>
    </CourseDetail>
  );
}
