import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ContentDetailShell } from "@/components/content/content-detail-shell";
import { RouteLoading } from "@/components/content";
import { RichTextContent } from "@/components/content/rich-text-content";
import {
  getStrapiMediaAltText,
  getStrapiMediaBlurDataUrl,
  getStrapiMediaUrl,
} from "@/lib/strapi-media";
import { getTeacherBySlug } from "@/lib/strapi-teachers";
import { cn, getInitials } from "@/lib/utils";
import { join } from "@/lib/testids";

type TeacherDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Teacher = NonNullable<Awaited<ReturnType<typeof getTeacherBySlug>>>;

type DetailSectionProps = {
  title: string;
  testId?: string;
  children: ReactNode;
};

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

export default async function TeacherDetailPage({
  params,
}: TeacherDetailPageProps) {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);
  const t = await getTranslations('teachers');

  if (!teacher) {
    notFound();
  }

  return (
    <ContentDetailShell
      testId="page.teacher-detail"
      breadcrumbItems={[
        { label: t('hero.title'), href: "/egitmenler" },
        { label: teacher.fullName },
      ]}
      leadMedia={<TeacherProfilePhoto teacher={teacher} />}
      title={teacher.fullName}
      summary={teacher.headline ?? undefined}
      headerClassName="mt-6 sm:mt-8"
      titleClassName="text-xl sm:text-2xl lg:text-4xl"
      headerMeta={
        <div className="space-y-4">
          {teacher.expertiseAreas?.length && (
            <div
              className="flex flex-wrap gap-2"
              data-testid="page.teacher-detail.section.expertise-areas"
            >
              {teacher.expertiseAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center rounded-full border border-[#009ca6]/30 bg-[#009ca6]/10 px-3 py-1 text-sm font-medium text-[#009ca6]"
                >
                  {area}
                </span>
              ))}
            </div>
          )}
        </div>
      }
    >
      <Suspense fallback={<RouteLoading testId="loading.teacher-detail" />}>
        <div className="max-w-3xl space-y-5 sm:space-y-6">
          {teacher.bio ? (
            <DetailSection
              title="Hakkında"
              testId="page.teacher-detail.section.bio"
            >
              <RichTextContent content={teacher.bio} />
            </DetailSection>
          ) : (
            <BodyText className="md:text-lg">
              Bu eğitmen için detaylı profil içeriği yakında eklenecek.
            </BodyText>
          )}

          {teacher.targetTeams && (
            <DetailSection
              title="Hedef Kitle / Ekipler"
              testId="page.teacher-detail.section.target-teams"
            >
              <BodyText>{teacher.targetTeams}</BodyText>
            </DetailSection>
          )}

          {teacher.teachingApproach && (
            <DetailSection
              title="Eğitim Yaklaşımı"
              testId="page.teacher-detail.section.teaching-approach"
            >
              <BodyText>{teacher.teachingApproach}</BodyText>
            </DetailSection>
          )}

          {teacher.courses?.length && (
            <DetailSection title="Eğitimleri">
              <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                {teacher.courses.map((course) => (
                  <li key={course.documentId}>
                    <Link
                      href={`/egitimler/${course.slug}`}
                      data-testid={join(
                        "page",
                        "teacher-detail",
                        "course",
                        course.slug,
                      )}
                      className="text-primary hover:underline"
                    >
                      {course.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}
        </div>
      </Suspense>
    </ContentDetailShell>
  );
}

function DetailSection({ title, testId, children }: DetailSectionProps) {
  return (
    <section data-testid={testId} className="space-y-3 sm:space-y-4">
      <h2 className="text-lg font-semibold text-foreground sm:text-xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function BodyText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8",
        className,
      )}
    >
      {children}
    </p>
  );
}

function TeacherProfilePhoto({ teacher }: { teacher: Teacher }) {
  const photoUrl = getStrapiMediaUrl(teacher.profilePhoto, "small");
  const photoAlt =
    getStrapiMediaAltText(teacher.profilePhoto) ?? teacher.fullName;
  const photoBlurDataURL = getStrapiMediaBlurDataUrl(teacher.profilePhoto);

  return (
    <div
      data-testid="page.teacher-detail.photo"
      className="relative h-24 w-24 overflow-hidden rounded-full border border-white/8 bg-card/50 shadow-[0_24px_64px_rgba(0,0,0,0.26)] sm:h-[112px] sm:w-[112px] md:h-[162px] md:w-[162px]"
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={photoAlt}
          fill
          priority
          sizes="(min-width: 1024px) 224px, (min-width: 768px) 180px, 128px"
          className="object-cover"
          {...(photoBlurDataURL
            ? {
                placeholder: "blur" as const,
                blurDataURL: photoBlurDataURL,
              }
            : {})}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,oklch(0.72_0.11_196_/_0.22)_0%,transparent_58%),linear-gradient(135deg,oklch(0.22_0.015_244)_0%,oklch(0.15_0.014_244)_100%)]">
          <span className="text-6xl font-semibold tracking-tight text-white md:text-8xl">
            {getInitials(teacher.fullName)}
          </span>
        </div>
      )}
    </div>
  );
}
