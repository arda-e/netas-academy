import { formatEventDateTime } from "@/lib/date-formatting";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { Link } from "@/i18n/navigation";
import { join } from "@/lib/testids";

type CourseEventSession = {
  documentId: string;
  slug: string;
  title: string;
  startsAt: string;
  format?: string | null;
  price?: number | null;
};

type CourseRelatedSessionsSectionProps = {
  events: CourseEventSession[];
  now: Date;
  copy: {
    heading: string;
    upcomingSessionRegisterCta: string;
    noUpcomingSessions: string;
    fallbackCtaLabel: string;
    upcomingSessionClosedLabel: string;
    pastSessionsLabel: string;
  };
  labels: {
    formats: {
      online: string;
      yuzYuze: string;
      hibrit: string;
    };
  };
};

function formatSessionType(
  format: string | null | undefined,
  formatLabels: CourseRelatedSessionsSectionProps["labels"]["formats"]
) {
  if (format === "online") return formatLabels.online;
  if (format === "yuz-yuze") return formatLabels.yuzYuze;
  if (format === "hibrit") return formatLabels.hibrit;
  return null;
}

export function CourseRelatedSessionsSection({
  events,
  now,
  copy,
  labels,
}: CourseRelatedSessionsSectionProps) {
  const {
    heading,
    upcomingSessionRegisterCta,
    noUpcomingSessions,
    fallbackCtaLabel,
    upcomingSessionClosedLabel,
    pastSessionsLabel,
  } = copy;
  const upcoming = events.filter((event) => new Date(event.startsAt) > now);
  const past = events.filter((event) => new Date(event.startsAt) <= now);

  return (
    <section data-testid="page.course-detail.section.upcoming-sessions">
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>

      {upcoming.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {upcoming.map((event) => {
            const sessionType = formatSessionType(event.format, labels.formats);

            return (
              <li
                key={event.documentId}
                className="rounded-sm border border-border/60 bg-card/40 px-5 py-4"
                data-testid={join("page", "course-detail", "upcoming-session", event.slug)}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{event.title}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/60">
                      <span>{formatEventDateTime(event.startsAt)}</span>
                      {sessionType && <span>{sessionType}</span>}
                      {event.price != null && (
                        <span className="font-medium text-foreground/80">
                          {`${new Intl.NumberFormat("tr-TR").format(event.price)} TL + KDV`}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/etkinlikler/${event.slug}/kayit`}
                    className="shrink-0 inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    data-testid={join("page", "course-detail", "upcoming-session-register", event.slug)}
                  >
                    {upcomingSessionRegisterCta}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-4 rounded-sm border border-border/40 bg-white px-5 py-6 text-sm text-foreground/60">
          <p>{noUpcomingSessions}</p>
          <Link
            href={buildIntentLeadUrl("general_contact")}
            className="mt-3 inline-block text-primary hover:underline"
          >
            {fallbackCtaLabel} →
          </Link>
        </div>
      )}

      {past.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-foreground/48 hover:text-foreground/68">
            {pastSessionsLabel} ({past.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {past.map((event) => (
              <li key={event.documentId} className="flex items-center gap-3">
                <span className="inline-block rounded-full bg-foreground/8 px-2 py-0.5 text-xs text-foreground/48">
                  {upcomingSessionClosedLabel}
                </span>
                <Link
                  className="text-sm text-foreground/60 hover:text-foreground/80"
                  href={`/etkinlikler/${event.slug}`}
                  data-testid={join("page", "course-detail", "past-session", event.slug)}
                >
                  {event.title} — {formatEventDateTime(event.startsAt)}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
