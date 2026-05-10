import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { RouteLoading } from "@/components/content";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/content/rich-text-content";
import { NewsletterSubscriptionForm } from "@/components/newsletter-subscription-form";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { getEventBySlug, getEventRegistrationStatus } from "@/lib/strapi-events";
import { formatEventDateTime } from "@/lib/date-formatting";

type EventDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function EventInformationPanel({
  title,
  startsAt,
  endsAt,
  location,
  slug,
  registrationOpen,
}: {
  title: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  slug: string;
  registrationOpen: boolean;
}) {
  return (
    <aside className="panel-surface rounded-sm p-6 md:p-8" data-testid="page.event-detail.info-panel">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/72">
        Etkinlik Bilgileri
      </p>
      <div className="mt-5 space-y-4 text-base leading-7 text-foreground/78">
        <p className="font-bold text-lg text-gray-700">{title}</p>
        <div className="space-y-0.5">
          <p className="font-bold text-gray-700">{formatEventDateTime(startsAt)}</p>
          {endsAt && <p className="font-bold text-gray-700">{formatEventDateTime(endsAt)}</p>}
        </div>
        {location && <p>{location}</p>}
      </div>

      {registrationOpen ? (
        <>
          <Button asChild className="mt-6 w-full rounded-sm" data-testid="page.event-detail.register-cta">
            <Link href={`/etkinlikler/${slug}/kayit`}>Etkinliğe Kayıt Ol</Link>
          </Button>
          <Button asChild variant="outline" className="mt-3 w-full rounded-sm" data-testid="page.event-detail.contact-cta">
            <Link href={buildIntentLeadUrl("general_contact")}>İletişime Geç</Link>
          </Button>
        </>
      ) : (
        <div className="mt-6 space-y-4" data-testid="page.event-detail.registration-closed.notice">
          <p className="text-sm font-medium text-foreground/72">
            Bu etkinliğin kayıtları şu an kapalı. Yeni etkinliklerden haberdar olmak için bültenimize abone olun.
          </p>
          <div data-testid="page.event-detail.registration-closed.newsletter">
            <NewsletterSubscriptionForm source="event_closed_registration" />
          </div>
        </div>
      )}
    </aside>
  );
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Etkinlik Bulunamadı",
    };
  }

  return {
    title: event.title,
    description: event.summary ?? undefined,
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const t = await getTranslations("events");
  const registrationStatus = await getEventRegistrationStatus(event.documentId);
  const registrationOpen = registrationStatus?.isOpen ?? false;

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
              <p className="max-w-2xl text-lg leading-8 text-white/78">{event.summary}</p>
            )}
          </div>
        </div>
      </section>

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
                content={event.details ?? "Bu etkinlik için detaylı içerik yakında eklenecek."}
              />
            </div>

            <EventInformationPanel
              title={event.title}
              startsAt={event.startsAt}
              endsAt={event.endsAt}
              location={event.location}
              slug={event.slug}
              registrationOpen={registrationOpen}
            />
          </div>
        </section>
      </Suspense>
    </main>
  );
}
