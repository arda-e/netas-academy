import type { Metadata } from "next";
import { Suspense } from "react";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { RouteLoading } from "@/components/content";
import { RichTextContent } from "@/components/content/rich-text-content";
import { EventInformationPanel } from "@/components/events/event-information-panel";
import { RegistrationStatusButton } from "@/components/events/registration-status-button";
import { JsonLd } from "@/components/seo/json-ld";
import { buildLocalePath, buildMetadata } from "@/lib/seo-utils";
import { getSiteSettings } from "@/lib/strapi-site-settings";
import { getEventBySlug } from "@/lib/strapi-events";

type EventDetailPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, event, siteSettings] = await Promise.all([
    getTranslations({ locale, namespace: "events" }),
    getEventBySlug(slug),
    getSiteSettings(),
  ]);

  if (!event) {
    return {
      title: t("meta.not_found"),
    };
  }

  return buildMetadata({
    seo: event.seo,
    defaults: siteSettings,
    fallbackTitle: event.title,
    fallbackDescription: event.summary,
    pagePath: buildLocalePath(locale, `/etkinlikler/${slug}`),
    locale,
  });
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();
  const [event, siteSettings] = await Promise.all([
    getEventBySlug(slug, isDraft),
    getSiteSettings(),
  ]);

  if (!event) {
    notFound();
  }

  const t = await getTranslations("events");
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary ?? event.details ?? undefined,
    startDate: event.startsAt,
    ...(event.endsAt ? { endDate: event.endsAt } : {}),
    ...(siteSettings?.siteName
      ? {
          organizer: {
            "@type": "Organization",
            name: siteSettings.siteName,
          },
        }
      : {}),
  };

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]" data-testid="page.event-detail">
      <section className="relative border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="relative mx-auto flex min-h-[360px] w-full max-w-7xl items-end px-6 py-10 sm:min-h-[400px] md:px-10 lg:px-12">
          <div className="absolute left-6 right-6 top-10 md:left-10 md:right-10 lg:left-12 lg:right-12">
            <SiteBreadcrumbs
              items={[
                { label: t("hero.title"), href: "/etkinlikler" },
                { label: event.title },
              ]}
            />
          </div>
          <div className="max-w-3xl space-y-5">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {event.title}
            </h1>
            {event.summary && (
              <p className="max-w-2xl text-lg leading-8 text-white/88">{event.summary}</p>
            )}
          </div>
        </div>
      </section>

      <JsonLd data={eventJsonLd} />
      <Suspense fallback={<RouteLoading testId="loading.event-detail" />}>
        <section className="relative z-10 mx-auto w-full max-w-7xl bg-background px-4 py-14 md:px-10 md:py-18 lg:px-12">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(300px,0.42fr)]">
            <div className="panel-surface rounded-sm p-6 md:p-8 lg:p-10">
              {event.summary && (
                <div className="mb-8 border-b border-white/8 pb-8">
                  <p className="page-body-text">{event.summary}</p>
                </div>
              )}
              <RichTextContent
                content={event.details ?? t("detail.content_empty")}
              />
            </div>

            <EventInformationPanel
              event={{
                title: event.title,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                location: event.location,
                format: event.format,
                price: event.price,
                dailySchedule: event.dailySchedule,
                formatDisplayName: event.format
                  ? t(`detail.format.${event.format}` as Parameters<typeof t>[0])
                  : null,
              }}
              copy={{
                infoPanelHeading:
                  event.eventType === "egitim"
                    ? t("detail.info_panel_heading_egitim")
                    : event.eventType === "kurs"
                      ? t("detail.info_panel_heading_kurs")
                      : t("detail.info_panel_heading"),
                dateLabel: t("detail.date_label"),
                endDateLabel: t("detail.end_date_label"),
                locationLabel: t("detail.location_label"),
                formatLabel: t("detail.format_label"),
                priceLabel: t("detail.price_label"),
                scheduleLabel: t("detail.schedule_label"),
              }}
              testId="page.event-detail.info-panel"
              action={
                <RegistrationStatusButton
                  documentId={event.documentId}
                  slug={event.slug}
                  registerCta={t("detail.register_cta")}
                  contactCta={t("detail.contact_cta")}
                  registrationClosedNotice={t("detail.registration_closed_notice")}
                />
              }
            />
          </div>
        </section>
      </Suspense>
    </main>
  );
}
