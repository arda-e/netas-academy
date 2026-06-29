import type { Metadata } from "next";
import { Suspense } from "react";
import { Filter } from "lucide-react";
import { SortAscending, SortDescending } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";

import { ContentPageShell, EventList, EventListLoading } from "@/components/content";
import { Link } from "@/i18n/navigation";
import { join } from "@/lib/testids";
import { cn } from "@/lib/utils";
import { getEvents, normalizeEventType } from "@/lib/strapi-events";
import { buildLocaleAlternates, buildLocalePath, buildMetadata } from "@/lib/seo-utils";
import { getSiteSettings } from "@/lib/strapi-site-settings";
import { EVENT_TYPES, getEventTypeLabel } from "@/lib/content-taxonomy";
import type { StrapiEventSortOrder, StrapiEventType } from "@/lib/strapi-types";

type EtkinliklerPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: EtkinliklerPageProps): Promise<Metadata> {
  const { locale } = await params;
  const [t, siteSettings] = await Promise.all([
    getTranslations({ locale, namespace: "events" }),
    getSiteSettings(),
  ]);

  return buildMetadata({
    seo: null,
    defaults: siteSettings,
    fallbackTitle: t("hero.title"),
    fallbackDescription: `${t("hero.description_strong")} ${t("hero.description_rest")}`,
    pagePath: buildLocalePath(locale, "/etkinlikler"),
    locale,
    localeAlternates: buildLocaleAlternates("/etkinlikler"),
  });
}

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

async function EventResults({
  selectedType,
  selectedSort,
}: {
  selectedType: StrapiEventType | null;
  selectedSort: StrapiEventSortOrder;
}) {
  const events = await getEvents(selectedType, selectedSort);
  const tx = await getTranslations("taxonomy");

  return (
    <EventList
      emptyMessage={
        selectedType
          ? `${getEventTypeLabel(tx, selectedType)} türünde gösterilecek etkinlik bulunamadı.`
          : undefined
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
  );
}

export default async function EtkinliklerPage({
  searchParams,
}: EtkinliklerPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedType = resolveEventTypeFilter(resolvedSearchParams.type);
  const selectedSort = resolveEventSortOrder(resolvedSearchParams.sort);

  const t = await getTranslations("events");

  const filterLabels: Record<StrapiEventType, string> = {
    etkinlik: t("filters.type.etkinlik"),
    egitim: t("filters.type.egitim"),
    kurs: t("filters.type.kurs"),
  };

  return (
    <ContentPageShell
      hero={{
        gradientVariant: "events",
        title: t("hero.title"),
        description: (
          <p>
            <strong className="text-white">
              {t("hero.description_strong")}
            </strong>{" "}
            {t("hero.description_rest")}
          </p>
        ),
      }}
      testId="page.etkinlikler"
    >
      <div className="mt-2 mb-6 flex flex-col gap-3 sm:mt-4 sm:mb-8 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <Filter className="size-4 text-gray-800" aria-hidden="true" />

          {EVENT_TYPES.map((filterValue) => {
            const active = selectedType === (filterValue as StrapiEventType);

            return (
              <Link
                key={filterValue}
                aria-current={active ? "page" : undefined}
                data-testid={join("page", "etkinlikler", "filter", "type", filterValue)}
                href={buildEventHref({
                  type: active ? null : (filterValue as StrapiEventType),
                  sort: selectedSort,
                })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors sm:text-sm",
                  active
                    ? "border-[#009ca6] bg-[#009ca6] text-white shadow-sm"
                    : "border-border/70 bg-white/70 text-foreground/74 hover:bg-white hover:text-foreground"
                )}
              >
                {filterLabels[filterValue as StrapiEventType]}
              </Link>
            );
          })}
        </div>

        <Link
          aria-label={
            selectedSort === "asc" ? t("sort.aria_label_asc") : t("sort.aria_label_desc")
          }
          data-testid="page.etkinlikler.sort.toggle"
          href={buildEventHref({
            type: selectedType,
            sort: getToggledSortOrder(selectedSort),
          })}
          className={cn(
            "inline-flex h-10 self-start items-center justify-center gap-2 rounded-full border",
            "border-border/70 bg-white px-4 text-gray-800 transition-colors",
            "hover:text-[#009ca6] md:self-auto"
          )}
        >
          {selectedSort === "asc" ? (
            <SortAscending className="size-4" aria-hidden="true" />
          ) : (
            <SortDescending className="size-4" aria-hidden="true" />
          )}

          <span className="text-sm font-medium">
            {t("sort.prefix")}{" "}
            {selectedSort === "asc" ? t("sort.label_asc") : t("sort.label_desc")}
          </span>
        </Link>
      </div>

      <Suspense fallback={<EventListLoading testId="loading.etkinlikler" />}>
        <EventResults selectedType={selectedType} selectedSort={selectedSort} />
      </Suspense>
    </ContentPageShell>
  );
}
