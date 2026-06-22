import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { getInitials } from "@/lib/utils";
import { join, normalizeKey } from "@/lib/testids";

type TeacherCardProps = {
  teacher: {
    slug: string;
    fullName: string;
    headline?: string | null;
    expertiseAreas?: string[] | null;
    targetTeams?: string | null;
  };
  media: {
    photoUrl?: string | null;
    photoAlt?: string | null;
    photoBlurDataURL?: string | null;
  };
};

export function TeacherCard({
  teacher,
  media,
}: TeacherCardProps) {
  const display = teacher.expertiseAreas?.slice(0, 3) ?? [];
  const displayTargetTeams = teacher.targetTeams?.trim();

  return (
    <Link
      href={`/egitmenler/${teacher.slug}`}
      data-testid={join("egitmenler", "card", teacher.slug)}
      className="group/card-link panel-surface block h-full cursor-pointer overflow-hidden rounded-sm transition-all hover:-translate-y-0.5 hover:border-[#009ca6] hover:shadow-sm"
    >
      <div className="flex h-full flex-col">
        {/* Photo Section */}
        <div
          className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-t-sm bg-card/50"
          data-testid={join("egitmenler", "card", teacher.slug, "photo")}
        >
          {media.photoUrl ? (
            <Image
              src={media.photoUrl}
              alt={media.photoAlt ?? teacher.fullName}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover object-[center_20%]"
              {...(media.photoBlurDataURL ? { placeholder: "blur" as const, blurDataURL: media.photoBlurDataURL } : {})}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,oklch(0.72_0.11_196_/_0.22)_0%,transparent_58%),linear-gradient(135deg,oklch(0.22_0.015_244)_0%,oklch(0.15_0.014_244)_100%)]">
              <span className="text-5xl font-semibold tracking-tight text-white/90">
                {getInitials(teacher.fullName)}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-1 flex-col px-5 pb-5 pt-4 text-left sm:px-6 sm:pb-6">
          {/* Name & Headline */}
          <div className="space-y-2">
            <h3
              className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover/card-link:text-[#009ca6] sm:text-xl"
              data-testid={join("egitmenler", "card", teacher.slug, "name")}
            >
              {teacher.fullName}
            </h3>
            {teacher.headline && (
              <p
                className="text-sm leading-5 text-foreground/62"
                data-testid={join("egitmenler", "card", teacher.slug, "headline")}
              >
                {teacher.headline}
              </p>
            )}
          </div>

          {/* Footer: Target Teams & Expertise Tags */}
          <div className="mt-auto flex flex-col gap-4 pt-4">
            {displayTargetTeams && (
              <p
                className="text-xs leading-5 text-foreground/50"
                data-testid={join("egitmenler", "card", teacher.slug, "targetTeams")}
              >
                {displayTargetTeams}
              </p>
            )}
            {display.length > 0 && (
              <div className="flex flex-wrap justify-start gap-1.5">
                {display.map((area) => (
                  <span
                    key={area}
                    data-testid={join("egitmenler", "card", teacher.slug, "expertise", normalizeKey(area))}
                    className="inline-flex items-center rounded-full border border-[#009ca6]/30 bg-[#009ca6]/10 px-2.5 py-0.5 text-xs font-medium text-[#009ca6]"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
