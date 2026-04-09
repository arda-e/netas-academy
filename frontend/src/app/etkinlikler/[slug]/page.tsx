import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventDetail, VisualStorySection } from "@/components/content";
import { Button } from "@/components/ui/button";
import { eventDetailVisualSection } from "@/lib/page-visual-sections";
import { getEventBySlug, getEventSlugs } from "@/lib/strapi";

type EventDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getEventSlugs();

  return slugs.map((slug) => ({ slug }));
}

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
      afterContent={<VisualStorySection {...eventDetailVisualSection} />}
    >
      <div className="space-y-8">
        <p>{event.details ?? "Bu etkinlik icin detayli icerik yakinda eklenecek."}</p>
        <Button asChild className="rounded-sm">
          <Link href={`/etkinlikler/${event.slug}/kayit`}>Etkinlige Kayit Ol</Link>
        </Button>
      </div>
    </EventDetail>
  );
}
