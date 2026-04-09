import { ContentPageShell, EventList } from "@/components/content";
import { getEvents } from "@/lib/strapi";

export const dynamic = "force-dynamic";

export default async function EtkinliklerPage() {
  const events = await getEvents();

  return (
    <ContentPageShell
      eyebrow="Netas Academy"
      title="Etkinlikler"
      description="Yaklasan bulusmalari, webinarlari ve ozel oturumlari takip edin; katilim icin gerekli detaylara tek ekrandan ulasin."
    >
      <EventList
        items={events.map((event) => ({
          id: event.documentId,
          slug: event.slug,
          title: event.title,
          summary: event.summary,
          courseTitle: event.course?.title ?? null,
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          location: event.location,
        }))}
      />
    </ContentPageShell>
  );
}
