import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventRegistrationForm } from "@/components/event-registration-form";
import { Button } from "@/components/ui/button";
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

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <section className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="mx-auto flex min-h-[400px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
          <div className="max-w-3xl space-y-5">
            <p className="text-sm font-medium uppercase tracking-[0.34em] text-white/88">
              Etkinlik Kaydi
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-6xl">
              {event.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/78">
              Bu etkinlige katilim icin formu doldurun. Kaydiniz alindiginda
              size onay mesaji gosterilecektir.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-18 md:px-10 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.46fr)]">
          <div className="panel-surface rounded-sm p-8 md:p-10">
            <EventRegistrationForm
              eventDocumentId={event.documentId}
              eventTitle={event.title}
            />
          </div>

          <aside className="panel-surface rounded-sm p-6">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-primary/72">
              Etkinlik Bilgileri
            </p>
            <div className="mt-5 space-y-4 text-base leading-7 text-foreground/78">
              <p>{formatEventDate(event.startsAt)}</p>
              {event.endsAt ? <p>{formatEventDate(event.endsAt)}</p> : null}
              {event.location ? <p>{event.location}</p> : null}
              {event.summary ? <p>{event.summary}</p> : null}
            </div>

            <Button asChild variant="outline" className="mt-6 rounded-sm">
              <Link href={`/etkinlikler/${event.slug}`}>Etkinlik Detayina Don</Link>
            </Button>
          </aside>
        </div>
      </section>
    </main>
  );
}
