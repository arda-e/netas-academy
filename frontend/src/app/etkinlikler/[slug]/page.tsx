import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventDetail } from "@/components/content";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";
import { Button } from "@/components/ui/button";
import { getEventBySlug } from "@/lib/strapi";

type EventDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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
    <EventDetail
      eyebrow={event.course?.title ?? "Etkinlik"}
      title={event.title}
      summary={event.summary}
      startsAt={event.startsAt}
      endsAt={event.endsAt}
      location={event.location}
    >
      <div className="max-w-3xl space-y-5 sm:space-y-6">
        <p className="text-[15px] leading-7 text-foreground/80 sm:text-base sm:leading-8 md:text-lg">
          {event.details ?? "Bu etkinlik icin detayli icerik yakinda eklenecek."}
        </p>
        <Button asChild className={responsiveLayoutClasses.eventCta}>
          <Link href={`/etkinlikler/${event.slug}/kayit`}>Etkinlige Kayit Ol</Link>
        </Button>
      </div>
    </EventDetail>
  );
}
