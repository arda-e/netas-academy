import Link from "next/link";
import { Filter } from "lucide-react";
import { SortAscending, SortDescending } from "@phosphor-icons/react/dist/ssr";

import { ContentPageShell, EventList } from "@/components/content";
import {
  getEvents,
  normalizeEventType,
  type StrapiEventSortOrder,
  type StrapiEventType,
} from "@/lib/strapi";

export const dynamic = "force-dynamic";

type EtkinliklerPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const eventTypeFilters: Array<{
  value: StrapiEventType;
  label: string;
}> = [
  { value: "etkinlik", label: "Etkinlik" },
  { value: "egitim", label: "Eğitim" },
  { value: "kurs", label: "Kurs" },
];

function resolveEventTypeFilter(
  value: string | string[] | undefined
): StrapiEventType | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return normalizeEventType(rawValue);
}

function resolveEventSortOrder(
  value: string | string[] | undefined
): StrapiEventSortOrder {
  const rawValue = Array.isArray(value) ? value[0] : value;

  return rawValue === "desc" ? "desc" : "asc";
}

function getEventTypeLabel(eventType: StrapiEventType) {
  switch (eventType) {
    case "egitim":
      return "Eğitim";
    case "kurs":
      return "Kurs";
    case "etkinlik":
    default:
      return "Etkinlik";
  }
}

function buildEventHref({
  type,
  sort,
}: {
  type?: StrapiEventType | null;
  sort?: StrapiEventSortOrder | null;
}) {
  const searchParams = new URLSearchParams();

  if (type) {
    searchParams.set("type", type);
  }

  if (sort) {
    searchParams.set("sort", sort);
  }

  const query = searchParams.toString();

  return query ? `/etkinlikler?${query}` : "/etkinlikler";
}

function getToggledSortOrder(sortOrder: StrapiEventSortOrder) {
  return sortOrder === "asc" ? "desc" : "asc";
}

function getSortLabel(sortOrder: StrapiEventSortOrder) {
  return sortOrder === "asc" ? "Önce yeni" : "Önce eski";
}

export default async function EtkinliklerPage({ searchParams }: EtkinliklerPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedType = resolveEventTypeFilter(resolvedSearchParams.type);
  const selectedSort = resolveEventSortOrder(resolvedSearchParams.sort);
  const events = await getEvents(selectedType, selectedSort);

  return (
    <ContentPageShell
      title="Etkinlikler"
      description={
        <>
          <p>
            <strong className="text-white">
              Yaklaşan buluşmaları, webinarları ve özel oturumları
            </strong>{" "}
            takip edin; <span className="hidden sm:inline"><br /></span>
            katılım için gerekli detaylara tek ekrandan ulaşın.
          </p>
        </>
      }
    >
      <div className="-mt-6 mb-6 flex flex-col gap-3 sm:-mt-8 sm:mb-8 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <Filter className="size-4 text-gray-800" aria-hidden="true" />
          {eventTypeFilters.map((filter) => {
            const active = selectedType === filter.value;

            return (
              <Link
                key={filter.value}
                aria-current={active ? "page" : undefined}
                href={buildEventHref({
                  type: active ? null : filter.value,
                  sort: selectedSort,
                })}
                className={[
                  "rounded-full border px-3 py-1.5 text-xs transition-colors sm:text-sm",
                  active
                    ? "border-[#009ca6] bg-[#009ca6] text-white shadow-sm"
                    : "border-border/70 bg-white/70 text-foreground/74 hover:bg-white hover:text-foreground",
                ].join(" ")}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
        <Link
          aria-label={
            selectedSort === "asc" ? "Sırala: önce yeni" : "Sırala: önce eski"
          }
          href={buildEventHref({
            type: selectedType,
            sort: getToggledSortOrder(selectedSort),
          })}
          className="inline-flex h-10 self-start items-center justify-center gap-2 rounded-full border border-border/70 bg-white px-4 text-gray-800 transition-colors hover:text-[#009ca6] md:self-auto"
        >
          {selectedSort === "asc" ? (
            <SortAscending className="size-4" aria-hidden="true" />
          ) : (
            <SortDescending className="size-4" aria-hidden="true" />
          )}
          <span className="text-sm font-medium">Sırala: {getSortLabel(selectedSort)}</span>
        </Link>
      </div>
      <EventList
        emptyMessage={
          selectedType
            ? `${getEventTypeLabel(selectedType)} türünde gösterilecek etkinlik bulunamadı.`
            : "Gösterilecek etkinlik verisi şu an kullanılabilir değil."
        }
        items={events.map((event) => ({
          id: event.documentId,
          slug: event.slug,
          title: event.title,
          summary: event.summary,
          eventType: normalizeEventType(event.eventType) ?? "etkinlik",
          startsAt: event.startsAt,
          endsAt: event.endsAt,
          location: event.location,
          topicArea: event.topicArea,
        }))}
      />
    </ContentPageShell>
  );
}
