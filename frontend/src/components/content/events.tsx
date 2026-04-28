import type { ReactNode } from "react";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { ContentDetailShell } from "@/components/content/content-detail-shell";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";

type EventListItem = {
  id: number | string;
  slug: string;
  title: string;
  summary?: string | null;
  eventType: string;
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

const formatEventType = (eventType: string) => {
  switch (eventType) {
    case "egitim":
      return "Eğitim";
    case "kurs":
      return "Kurs";
    case "etkinlik":
    default:
      return "Etkinlik";
  }
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
    <ContentGrid
      itemsCount={items.length}
      emptyMessage={emptyMessage}
      columnsClassName={responsiveLayoutClasses.eventListGrid}
    >
      {items.map((event) => (
        <ContentCardShell
          key={event.id}
          href={`/etkinlikler/${event.slug}`}
          title={event.title}
          kicker={formatEventType(event.eventType)}
          summary={event.summary ?? "Bu etkinlik icin aciklama yakinda eklenecek."}
          className="border-[3px] bg-white"
          meta={
            <div className="space-y-1.5 break-words">
              <p className="font-bold text-gray-700">{formatEventDate(event.startsAt)}</p>
              {event.endsAt ? (
                <p className="font-bold text-gray-700">{formatEventDate(event.endsAt)}</p>
              ) : null}
              {event.location ? <p>{event.location}</p> : null}
            </div>
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
        <div className={responsiveLayoutClasses.eventMeta}>
          <p className="font-bold text-gray-700">{formatEventDate(startsAt)}</p>
          {endsAt ? <p className="font-bold text-gray-700">{formatEventDate(endsAt)}</p> : null}
          {location ? <p>{location}</p> : null}
        </div>
      }
      afterContent={afterContent}
    >
      {children}
    </ContentDetailShell>
  );
}
