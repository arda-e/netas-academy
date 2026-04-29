import Link from "next/link";
import Image from "next/image";


function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type TeacherCardProps = {
  slug: string;
  fullName: string;
  headline?: string | null;
  expertiseAreas?: string[] | null;
  targetTeams?: string | null;
  profilePhoto?: {
    url?: string | null;
    alternativeText?: string | null;
  } | null;
  photoUrl?: string | null;
  photoAlt?: string | null;
};

export function TeacherCard({
  slug,
  fullName,
  headline,
  expertiseAreas,
  targetTeams,
  photoUrl,
  photoAlt,
}: TeacherCardProps) {
  const display = expertiseAreas?.slice(0, 3) ?? [];
  const truncatedTeams =
    targetTeams && targetTeams.length > 100
      ? targetTeams.slice(0, 97) + "..."
      : targetTeams;

  return (
    <Link
      href={`/egitmenler/${slug}`}
      className="group/card-link panel-surface block h-full cursor-pointer rounded-sm p-5 transition-all hover:-translate-y-0.5 hover:border-[#009ca6] hover:shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4">
        <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-white/8 bg-card/50 shadow-[0_12px_40px_rgba(0,0,0,0.16)] sm:h-24 sm:w-24">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={photoAlt ?? fullName}
              fill
              sizes="(min-width: 640px) 96px, 80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,oklch(0.72_0.11_196_/_0.22)_0%,transparent_58%),linear-gradient(135deg,oklch(0.22_0.015_244)_0%,oklch(0.15_0.014_244)_100%)]">
              <span className="text-3xl font-semibold tracking-tight text-foreground/60 sm:text-4xl">
                {getInitials(fullName)}
              </span>
            </div>
          )}
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover/card-link:text-[#009ca6] sm:text-xl">
            {fullName}
          </h3>
          {headline ? (
            <p className="mt-1 text-sm leading-5 text-foreground/62">
              {headline}
            </p>
          ) : null}
        </div>

        {display.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-1.5">
            {display.map((area) => (
              <span
                key={area}
                className="inline-flex items-center rounded-full border border-[#009ca6]/30 bg-[#009ca6]/10 px-2.5 py-0.5 text-xs font-medium text-[#009ca6]"
              >
                {area}
              </span>
            ))}
          </div>
        ) : null}

        {truncatedTeams ? (
          <p className="text-center text-xs leading-5 text-foreground/52 sm:text-sm sm:leading-6">
            {truncatedTeams}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
