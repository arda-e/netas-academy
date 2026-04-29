import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/content/rich-text-content";
import { NewsletterSubscriptionForm } from "@/components/newsletter-subscription-form";
import { isEventRegistrationOpen } from "@/lib/event-registration";
import { buildIntentLeadUrl } from "@/lib/lead-intents";
import { getEventBySlug } from "@/lib/strapi";

type EventDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const formatEventDate = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

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
    <aside className="panel-surface rounded-sm p-6 md:p-8">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/72">
        Etkinlik Bilgileri
      </p>
      <div className="mt-5 space-y-4 text-base leading-7 text-foreground/78">
        <p className="font-bold text-lg text-gray-700">{title}</p>
        <div className="space-y-0.5">
          <p className="font-bold text-gray-700">{formatEventDate(startsAt)}</p>
          {endsAt ? <p className="font-bold text-gray-700">{formatEventDate(endsAt)}</p> : null}
        </div>
        {location ? <p>{location}</p> : null}
      </div>

      {registrationOpen ? (
        <>
          <Button asChild className="mt-6 w-full rounded-sm">
            <Link href={`/etkinlikler/${slug}/kayit`}>Etkinliğe Kayıt Ol</Link>
          </Button>
          <Button asChild variant="outline" className="mt-3 w-full rounded-sm">
            <Link href={buildIntentLeadUrl("general_contact")}>İletişime Geç</Link>
          </Button>
        </>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium text-foreground/72">
            Bu etkinliğin kayıtları şu an kapalı. Yeni etkinliklerden haberdar olmak için bültenimize abone olun.
          </p>
          <NewsletterSubscriptionForm source="event_closed_registration" />
        </div>
      )}
    </aside>
  );
}

export const dynamic = "force-dynamic";

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

  const registrationOpen = isEventRegistrationOpen(event);

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <section className="sticky top-[81px] border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="relative mx-auto flex min-h-[320px] w-full max-w-7xl items-end px-6 py-10 md:px-10 lg:px-12">
          <div className="absolute left-6 right-6 top-10 md:left-10 md:right-10 lg:left-12 lg:right-12">
            <SiteBreadcrumbs
              items={[
                { label: "Etkinlikler", href: "/etkinlikler" },
                { label: event.title },
              ]}
            />
          </div>
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.34em] text-white/88">
              {event.course?.title ?? "Etkinlik"}
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {event.title}
            </h1>
            {event.summary ? (
              <p className="max-w-2xl text-lg leading-8 text-white/78">{event.summary}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl bg-background px-4 py-14 md:px-10 md:py-18 lg:px-12">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(300px,0.42fr)]">
          <div className="panel-surface rounded-sm p-6 md:p-8 lg:p-10">
            {event.summary ? (
              <div className="mb-8 pb-8 border-b border-white/8">
                <p className="text-[15px] leading-7 text-foreground/72 sm:text-base sm:leading-8 md:text-lg">
                  {event.summary}
                </p>
              </div>
            ) : null}
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
    </main>
  );
}
