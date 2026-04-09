import type { ReactNode } from "react";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { ContentDetailShell } from "@/components/content/content-detail-shell";

type EventListItem = {
  id: number | string;
  slug: string;
  title: string;
  summary?: string | null;
  courseTitle?: string | null;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
};

type EventListProps = {
  items: EventListItem[];
  emptyMessage?: string;
};

type EventDetailProps = {
  eyebrow: string;
  title: string;
  summary?: string | null;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  children: ReactNode;
  afterContent?: ReactNode;
};

const formatEventDate = (value: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function EventList({
  items,
  emptyMessage = "Gosterilecek etkinlik verisi su an kullanilabilir degil.",
}: EventListProps) {
  return (
    <ContentGrid itemsCount={items.length} emptyMessage={emptyMessage} columnsClassName="grid gap-6 lg:grid-cols-2">
      {items.map((event) => (
        <ContentCardShell
          key={event.id}
          href={`/etkinlikler/${event.slug}`}
          title={event.title}
          kicker={event.courseTitle ?? "Kurs bilgisi yok"}
          summary={event.summary ?? "Bu etkinlik icin aciklama yakinda eklenecek."}
          meta={
            <>
              <p>{formatEventDate(event.startsAt)}</p>
              {event.endsAt ? <p>{formatEventDate(event.endsAt)}</p> : null}
              {event.location ? <p>{event.location}</p> : null}
            </>
          }
        />
      ))}
    </ContentGrid>
  );
}

export function EventDetail({
  eyebrow,
  title,
  summary,
  startsAt,
  endsAt,
  location,
  children,
  afterContent,
}: EventDetailProps) {
  return (
    <ContentDetailShell
      eyebrow={eyebrow}
      title={title}
      summary={summary ?? undefined}
      meta={
        <>
          <p>{formatEventDate(startsAt)}</p>
          {endsAt ? <p>{formatEventDate(endsAt)}</p> : null}
          {location ? <p>{location}</p> : null}
        </>
      }
      afterContent={afterContent}
    >
      {children}
    </ContentDetailShell>
  );
}
