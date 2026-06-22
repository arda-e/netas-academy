import { getTranslations } from "next-intl/server";

import { ContentCardShell } from "@/components/content/content-card-shell";
import { ContentGrid } from "@/components/content/content-grid";
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

export async function EventList({
  items,
  emptyMessage,
}: EventListProps) {
  const t = await getTranslations("events");
  const tx = await getTranslations("taxonomy");

  const effectiveEmptyMessage = emptyMessage ?? t("list.empty");

  return (
    <ContentGrid
      items={{
        count: items.length,
        emptyMessage: effectiveEmptyMessage,
      }}
      layout={{
        columnsClassName: responsiveLayoutClasses.eventListGrid,
      }}
      testId="etkinlikler.list"
    >
      {items.map((event) => (
        <ContentCardShell
          key={event.id}
          href={`/etkinlikler/${event.slug}`}
          content={{
            title: event.title,
            kicker: getEventTypeLabel(tx, event.eventType),
            summary: event.summary ?? t("card.summary_empty"),
            meta: (
              <div className="space-y-1.5 break-words">
                <p className="font-bold text-gray-700">{formatEventDateTime(event.startsAt)}</p>
                {event.endsAt ? (
                  <p className="font-bold text-gray-700">{formatEventDateTime(event.endsAt)}</p>
                ) : null}
                {event.location ? <p>{event.location}</p> : null}
              </div>
            ),
          }}
          shell={{
            testId: join("etkinlikler", "card", event.slug),
            className: "bg-white",
          }}
        />
      ))}
    </ContentGrid>
  );
}
