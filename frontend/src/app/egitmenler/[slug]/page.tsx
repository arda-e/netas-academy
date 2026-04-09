import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContentDetailShell } from "@/components/content/content-detail-shell";
import { VisualStorySection } from "@/components/content";
import { getTeacherBySlug, getTeacherSlugs, toStrapiAssetUrl } from "@/lib/strapi";
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

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getTeacherSlugs();

  return slugs.map((slug) => ({ slug }));
}

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

  return (
    <ContentDetailShell
      eyebrow="Netas Academy"
      title={teacher.fullName}
      summary={teacher.headline ?? undefined}
      afterContent={<VisualStorySection {...teacherDetailVisualSection} />}
      meta={
        <div className="space-y-4">
          <Avatar className="size-24 ring-1 ring-border/70">
            <AvatarImage
              src={toStrapiAssetUrl(teacher.profilePhoto?.url) ?? undefined}
              alt={teacher.profilePhoto?.alternativeText ?? teacher.fullName}
            />
            <AvatarFallback className="bg-muted text-xl font-semibold text-foreground">
              {getInitials(teacher.fullName)}
            </AvatarFallback>
          </Avatar>
          {teacher.email ? (
            <p>
              E-posta:{" "}
              <a className="text-primary hover:underline" href={`mailto:${teacher.email}`}>
                {teacher.email}
              </a>
            </p>
          ) : null}
        </div>
      }
    >
      <div className="space-y-8">
        <p>
          {teacher.bio ?? "Bu egitmen icin detayli profil icerigi yakinda eklenecek."}
        </p>

        {teacher.courses && teacher.courses.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Egitimleri</h2>
            <ul className="space-y-2">
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
