import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { Button } from "@/components/ui/button";
import { EventInformationPanel } from "@/components/events/event-information-panel";
import { Link } from "@/i18n/navigation";
import { buildLocaleAlternates, buildLocalePath } from "@/lib/seo-utils";
import { getEventBySlug, getEventRegistrationStatus } from "@/lib/strapi-events";

type EventRegistrationPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EventRegistrationPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, event] = await Promise.all([
    getTranslations({ locale, namespace: "event_reg" }),
    getEventBySlug(slug),
  ]);
  const canonical = buildLocalePath(locale, `/etkinlikler/${slug}/kayit`);

  if (!event) {
    return {
      title: t("meta.not_found"),
      robots: {
        index: false,
        follow: false,
      },
      alternates: {
        canonical,
        languages: buildLocaleAlternates(`/etkinlikler/${slug}/kayit`),
      },
      openGraph: {
        locale: locale === "en" ? "en_US" : "tr_TR",
        title: t("meta.not_found"),
        description: t("meta.not_found"),
        url: canonical,
      },
    };
  }

  return {
    title: `${event.title} | ${t("meta.title_suffix")}`,
    description: t("meta.description", { title: event.title }),
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical,
      languages: buildLocaleAlternates(`/etkinlikler/${slug}/kayit`),
    },
    openGraph: {
      locale: locale === "en" ? "en_US" : "tr_TR",
      title: `${event.title} | ${t("meta.title_suffix")}`,
      description: t("meta.description", { title: event.title }),
      url: canonical,
    },
  };
}

export default async function EventRegistrationPage({
  params,
}: EventRegistrationPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, event, eventInfoTranslations] = await Promise.all([
    getTranslations("event_reg"),
    getEventBySlug(slug),
    getTranslations("events"),
  ]);

  if (!event) {
    notFound();
  }

  const registrationStatus = await getEventRegistrationStatus(event.documentId);
  const registrationOpen = registrationStatus?.isOpen ?? false;

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]" data-testid="page.event-registration">
      <section className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="relative mx-auto flex min-h-[400px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
          <div className="absolute left-6 right-6 top-12 md:left-10 md:right-10 lg:left-12 lg:right-12">
            <SiteBreadcrumbs
              items={[
                { label: t("breadcrumbs.events"), href: "/etkinlikler" },
                { label: event.title, href: `/etkinlikler/${event.slug}` },
                { label: t("breadcrumbs.registration") },
              ]}
            />
          </div>
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.34em] text-white/88">
              {t("hero.eyebrow")}
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {event.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/78">
              {registrationOpen ? t("hero.open_body") : t("hero.closed_body")}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-10 md:py-18 lg:px-12">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(300px,0.42fr)]">
          <div className="panel-surface rounded-sm p-6 md:p-8 lg:p-10">
            {registrationOpen ? (
              <div data-testid="page.event-registration.form">
                <EventRegistrationForm
                  eventDocumentId={event.documentId}
                  eventTitle={event.title}
                  eventType={event.eventType}
                />
              </div>
            ) : (
              <div className="space-y-5" data-testid="page.event-registration.closed-state">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/76">
                  {t("closed.heading")}
                </p>
                <div className="space-y-4 text-base leading-7 text-foreground/78">
                  <p>{t("closed.body_1")}</p>
                  <p>{t("closed.body_2")}</p>
                </div>
                <Button asChild className="rounded-sm">
                  <Link href={`/etkinlikler/${event.slug}`}>{t("panel.back_to_detail")}</Link>
                </Button>
              </div>
            )}
          </div>

          <EventInformationPanel
            title={event.title}
            startsAt={event.startsAt}
            endsAt={event.endsAt}
            location={event.location}
            infoPanelHeading={t("panel.heading")}
            dateLabel={eventInfoTranslations("detail.date_label")}
            endDateLabel={eventInfoTranslations("detail.end_date_label")}
            locationLabel={eventInfoTranslations("detail.location_label")}
            formatLabel={eventInfoTranslations("detail.format_label")}
            priceLabel={eventInfoTranslations("detail.price_label")}
            scheduleLabel={eventInfoTranslations("detail.schedule_label")}
            registrationState={{
              label: t("status.label"),
              value: registrationOpen ? t("status.open") : t("status.closed"),
              tone: registrationOpen ? "success" : "warning",
            }}
            bodyContent={
              <div className="space-y-4 text-base leading-7 text-foreground/78">
                <p>{event.summary ?? t("panel.summary_fallback")}</p>
              </div>
            }
            action={
              <Button
                asChild
                variant="outline"
                className="mt-6 rounded-sm"
                data-testid="page.event-registration.back-to-detail"
              >
                <Link href={`/etkinlikler/${event.slug}`}>{t("panel.back_to_detail")}</Link>
              </Button>
            }
            format={event.format}
            formatDisplayName={
              event.format
                ? eventInfoTranslations(
                    `detail.format.${event.format}` as Parameters<typeof eventInfoTranslations>[0]
                  )
                : null
            }
            price={event.price}
            testId="page.event-registration.info-panel"
          />
        </div>
      </section>
    </main>
  );
}
