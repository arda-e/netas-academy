import type { ReactNode } from "react";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { ContentDetailShell } from "@/components/content/content-detail-shell";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";
import { join } from "@/lib/testids";
import { formatEventDateTime } from "@/lib/date-formatting";

type EventListItem = {
  topicArea?: string | null;
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

export function EventList({
  items,
  emptyMessage = "Gosterilecek etkinlik verisi su an kullanilabilir degil.",
}: EventListProps) {
  return (
    <ContentGrid
      itemsCount={items.length}
      emptyMessage={emptyMessage}
      columnsClassName={responsiveLayoutClasses.eventListGrid}
      testId="etkinlikler.list"
    >
      {items.map((event) => (
        <ContentCardShell
          key={event.id}
          testId={join("etkinlikler", "card", event.slug)}
          href={`/etkinlikler/${event.slug}`}
          title={event.title}
          kicker={formatEventType(event.eventType)}
          summary={event.summary ?? "Bu etkinlik icin aciklama yakinda eklenecek."}
          className="bg-white"
          meta={
            <div className="space-y-1.5 break-words">
              <p className="font-bold text-gray-700">{formatEventDateTime(event.startsAt)}</p>
              {event.endsAt ? (
                <p className="font-bold text-gray-700">{formatEventDateTime(event.endsAt)}</p>
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
      testId="etkinlikler.detail"
      title={title}
      summary={summary ?? undefined}
      meta={
        <div className={responsiveLayoutClasses.eventMeta}>
          <p className="font-bold text-gray-700">{formatEventDateTime(startsAt)}</p>
          {endsAt ? <p className="font-bold text-gray-700">{formatEventDateTime(endsAt)}</p> : null}
          {location ? <p>{location}</p> : null}
        </div>
      }
      afterContent={afterContent}
    >
      {children}
    </ContentDetailShell>
  );
}
