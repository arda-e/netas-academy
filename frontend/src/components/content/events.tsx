import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
import { ContentDetailShell } from "@/components/content/content-detail-shell";
import { responsiveLayoutClasses } from "@/components/content/responsive-layout";
import { join } from "@/lib/testids";
import { formatEventDateTime } from "@/lib/date-formatting";
import { getEventTypeLabel } from "@/lib/content-taxonomy";

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

export async function EventList({
  items,
  emptyMessage,
}: EventListProps) {
  const t = await getTranslations("events");
  const tx = await getTranslations("taxonomy");

  const effectiveEmptyMessage = emptyMessage ?? t("list.empty");

  return (
    <ContentGrid
      itemsCount={items.length}
      emptyMessage={effectiveEmptyMessage}
      columnsClassName={responsiveLayoutClasses.eventListGrid}
      testId="etkinlikler.list"
    >
      {items.map((event) => (
        <ContentCardShell
          key={event.id}
          testId={join("etkinlikler", "card", event.slug)}
          href={`/etkinlikler/${event.slug}`}
          title={event.title}
          kicker={getEventTypeLabel(tx, event.eventType)}
          summary={event.summary ?? t("card.summary_empty")}
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
