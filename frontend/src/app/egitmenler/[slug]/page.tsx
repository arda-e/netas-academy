import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentDetailShell } from "@/components/content/content-detail-shell";
import { VisualStorySection } from "@/components/content";
import {
  getStrapiMediaAltText,
  getStrapiMediaUrl,
  getTeacherBySlug,
} from "@/lib/strapi";
import { teacherDetailVisualSection } from "@/lib/page-visual-sections";

type TeacherDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TeacherDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) {
    return {
      title: "Egitmen Bulunamadi",
    };
  }

  return {
    title: `${teacher.fullName} | Egitmen`,
    description: teacher.headline ?? undefined,
  };
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) {
    notFound();
  }

  const photoUrl = getStrapiMediaUrl(teacher.profilePhoto);
  const photoAlt = getStrapiMediaAltText(teacher.profilePhoto) ?? teacher.fullName;

  return (
    <ContentDetailShell
      leadMedia={
        <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/8 bg-card/50 shadow-[0_24px_64px_rgba(0,0,0,0.26)] sm:h-[112px] sm:w-[112px] md:h-[162px] md:w-[162px]">
          <div className="relative h-full w-full">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={photoAlt}
                fill
                priority
                sizes="(min-width: 1024px) 224px, (min-width: 768px) 180px, 128px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,oklch(0.72_0.11_196_/_0.22)_0%,transparent_58%),linear-gradient(135deg,oklch(0.22_0.015_244)_0%,oklch(0.15_0.014_244)_100%)]">
                <span className="text-6xl font-semibold tracking-tight text-foreground/70 md:text-8xl">
                  {getInitials(teacher.fullName)}
                </span>
              </div>
            )}
          </div>
        </div>
      }
      title={teacher.fullName}
      summary={teacher.headline ?? undefined}
      afterContent={<VisualStorySection {...teacherDetailVisualSection} />}
      meta={
        teacher.email ? (
          <p className="max-w-full">
            E-posta:{" "}
            <a className="break-all text-primary hover:underline" href={`mailto:${teacher.email}`}>
              {teacher.email}
            </a>
          </p>
        ) : null
      }
    >
      <div className="max-w-3xl space-y-5 sm:space-y-6">
        <p className="text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg">
          {teacher.bio ?? "Bu egitmen icin detayli profil icerigi yakinda eklenecek."}
        </p>

        {teacher.courses && teacher.courses.length > 0 ? (
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Egitimleri</h2>
            <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              {teacher.courses.map((course) => (
                <li key={course.documentId}>
                  <Link className="text-primary hover:underline" href={`/egitimler/${course.slug}`}>
                    {course.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </ContentDetailShell>
  );
}
