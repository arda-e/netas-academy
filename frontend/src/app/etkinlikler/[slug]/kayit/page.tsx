import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteBreadcrumbs } from "@/components/breadcrumbs";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { Button } from "@/components/ui/button";
import { isEventRegistrationOpen } from "@/lib/event-registration";
import { getEventBySlug } from "@/lib/strapi";

type EventRegistrationPageProps = {
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
  summary,
  startsAt,
  endsAt,
  location,
  registrationOpen,
  slug,
}: {
  title: string;
  summary?: string | null;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  registrationOpen: boolean;
  slug: string;
}) {
  return (
    <aside className="panel-surface rounded-sm p-6 md:p-8">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/72">
        Etkinlik Bilgileri
      </p>
      <div className="mt-5 space-y-4 text-base leading-7 text-foreground/78">
        <p className="font-bold text-lg text-gray-700">{title}</p>
        <p>{summary ?? "Bu etkinlik icin aciklama yakinda eklenecek."}</p>
        <div className="space-y-0.5">
          <p className="font-bold text-gray-700">{formatEventDate(startsAt)}</p>
          {endsAt ? <p className="font-bold text-gray-700">{formatEventDate(endsAt)}</p> : null}
        </div>
        {location ? <p>{location}</p> : null}
        <p className={registrationOpen ? "font-semibold text-emerald-400" : "font-semibold text-amber-300"}>
          {registrationOpen ? "Kayitlar acik" : "Kayitlar kapandi"}
        </p>
      </div>

      <Button asChild variant="outline" className="mt-6 rounded-sm">
        <Link href={`/etkinlikler/${slug}`}>Etkinlik Detayina Don</Link>
      </Button>
    </aside>
  );
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: EventRegistrationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Kayit Sayfasi Bulunamadi",
    };
  }

  return {
    title: `${event.title} | Kayit`,
    description: `${event.title} etkinligi icin kayit formu.`,
  };
}

export default async function EventRegistrationPage({
  params,
}: EventRegistrationPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const registrationOpen = isEventRegistrationOpen(event);

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <section className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="relative mx-auto flex min-h-[400px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
          <div className="absolute left-6 right-6 top-12 md:left-10 md:right-10 lg:left-12 lg:right-12">
            <SiteBreadcrumbs
              items={[
                { label: "Etkinlikler", href: "/etkinlikler" },
                { label: event.title, href: `/etkinlikler/${event.slug}` },
                { label: "Kayıt" },
              ]}
            />
          </div>
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.34em] text-white/88">
              Etkinlik Kaydi
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {event.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/78">
              {registrationOpen
                ? "Bu etkinlige katilim icin formu doldurun. Kaydiniz alindiginda size onay mesaji gosterilecektir."
                : "Bu etkinlik icin kayitlar kapandi. Kural, etkinlik baslangicindan 24 saat once otomatik olarak devreye girer."}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-10 md:py-18 lg:px-12">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(300px,0.42fr)]">
          <div className="panel-surface rounded-sm p-6 md:p-8 lg:p-10">
            {registrationOpen ? (
              <EventRegistrationForm
                eventDocumentId={event.documentId}
                eventTitle={event.title}
                eventType={event.eventType}
              />
            ) : (
              <div className="space-y-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/76">
                  Kayitlar Kapandi
                </p>
                <div className="space-y-4 text-base leading-7 text-foreground/78">
                  <p>
                    Bu etkinlik icin kayitlar kapandi. Kayitlar, etkinlik baslangicindan 24 saat once
                    otomatik olarak kapanir.
                  </p>
                  <p>
                    Guncel etkinlikleri incelemek veya etkinlik detayina geri donmek icin asagidaki
                    baglantiyi kullanabilirsiniz.
                  </p>
                </div>
                <Button asChild className="rounded-sm">
                  <Link href={`/etkinlikler/${event.slug}`}>Etkinlik Detayina Don</Link>
                </Button>
              </div>
            )}
          </div>

          <EventInformationPanel
            title={event.title}
            summary={event.summary}
            startsAt={event.startsAt}
            endsAt={event.endsAt}
            location={event.location}
            registrationOpen={registrationOpen}
            slug={event.slug}
          />
        </div>
      </section>
    </main>
  );
}
