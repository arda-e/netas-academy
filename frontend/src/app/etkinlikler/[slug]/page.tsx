import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
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
}: {
  title: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  slug: string;
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

      <Button asChild className="mt-6 w-full rounded-sm">
        <Link href={`/etkinlikler/${slug}/kayit`}>Etkinlige Kayit Ol</Link>
      </Button>
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
      title: "Etkinlik Bulunamadi",
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

  return (
    <main className="page-shell min-h-[calc(100vh-81px)]">
      <section className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(18,24,34,0.94)_0%,rgba(13,18,27,0.98)_100%)]">
        <div className="mx-auto flex min-h-[400px] w-full max-w-7xl items-end px-6 py-12 md:px-10 lg:px-12">
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

      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:px-10 md:py-18 lg:px-12">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(300px,0.42fr)]">
          <div className="panel-surface rounded-sm p-6 md:p-8 lg:p-10">
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-base leading-7 prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-a:text-primary prose-li:text-foreground/80 sm:leading-8">
              <p className="text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg">
                {event.details ?? "Bu etkinlik icin detayli icerik yakinda eklenecek."}
              </p>
            </div>
          </div>

          <EventInformationPanel
            title={event.title}
            startsAt={event.startsAt}
            endsAt={event.endsAt}
            location={event.location}
            slug={event.slug}
          />
        </div>
      </section>
    </main>
  );
}
