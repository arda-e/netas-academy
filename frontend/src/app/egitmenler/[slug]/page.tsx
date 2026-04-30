import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentDetailShell } from "@/components/content/content-detail-shell";
import {
  getStrapiMediaAltText,
  getStrapiMediaUrl,
  getTeacherBySlug,
} from "@/lib/strapi";
import { getInitials } from "@/lib/utils";
import { join } from "@/lib/testids";

type TeacherDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TeacherDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  if (!teacher) {
    return {
      title: "Eğitmen Bulunamadı",
    };
  }

  return {
    title: `${teacher.fullName} | Eğitmen`,
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
      testId="page.teacher-detail"
      breadcrumbItems={[
        { label: "Eğitmenlerimiz", href: "/egitmenler" },
        { label: teacher.fullName },
      ]}
      leadMedia={
        <div
          data-testid="page.teacher-detail.photo"
          className="relative h-24 w-24 overflow-hidden rounded-full border border-white/8 bg-card/50 shadow-[0_24px_64px_rgba(0,0,0,0.26)] sm:h-[112px] sm:w-[112px] md:h-[162px] md:w-[162px]"
        >
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
    >
      <div className="max-w-3xl space-y-5 sm:space-y-6">
        {teacher.email ? (
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              E-posta
            </h2>
            <a
              className="break-all text-[15px] leading-7 text-primary hover:underline sm:text-base sm:leading-8"
              href={`mailto:${teacher.email}`}
              data-testid="page.teacher-detail.email"
            >
              {teacher.email}
            </a>
          </section>
        ) : null}

        {teacher.expertiseAreas && teacher.expertiseAreas.length > 0 ? (
          <section data-testid="page.teacher-detail.section.expertise-areas" className="space-y-3 sm:space-y-4">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Uzmanlık Alanları
            </h2>
            <div className="flex flex-wrap gap-2">
              {teacher.expertiseAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center rounded-full border border-[#009ca6]/30 bg-[#009ca6]/10 px-3 py-1 text-sm font-medium text-[#009ca6]"
                >
                  {area}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {teacher.targetTeams ? (
          <section data-testid="page.teacher-detail.section.target-teams" className="space-y-3 sm:space-y-4">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Hedef Kitle / Ekipler
            </h2>
            <p className="text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
              {teacher.targetTeams}
            </p>
          </section>
        ) : null}

        {teacher.teachingApproach ? (
          <section data-testid="page.teacher-detail.section.teaching-approach" className="space-y-3 sm:space-y-4">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Eğitim Yaklaşımı
            </h2>
            <p className="text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
              {teacher.teachingApproach}
            </p>
          </section>
        ) : null}

        {teacher.courses && teacher.courses.length > 0 ? (
          <section className="space-y-3 sm:space-y-4">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Eğitimleri</h2>
            <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              {teacher.courses.map((course) => (
                <li key={course.documentId}>
                  <Link
                    className="text-primary hover:underline"
                    href={`/egitimler/${course.slug}`}
                    data-testid={join("page", "teacher-detail", "course", course.slug)}
                  >
                    {course.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {teacher.bio ? (
          <section data-testid="page.teacher-detail.section.bio" className="space-y-3 sm:space-y-4">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Hakkında
            </h2>
            <p className="text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8">
              {teacher.bio}
            </p>
          </section>
        ) : (
          <p className="text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg">
            Bu eğitmen için detaylı profil içeriği yakında eklenecek.
          </p>
        )}
      </div>
    </ContentDetailShell>
  );
}
