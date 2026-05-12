import type { StrapiEvent, StrapiEventType, StrapiEventSortOrder, StrapiListResponse, EventRegistrationStatus } from "./strapi-types";
import { fetchStrapi } from "./strapi-client";

const EVENTS_TAG = "strapi-events";

export function normalizeEventType(
  value: string | null | undefined
): StrapiEventType | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLocaleLowerCase("tr-TR");

  if (normalizedValue === "etkinlik") {
    return "etkinlik";
  }

  if (normalizedValue === "egitim" || normalizedValue === "eğitim") {
    return "egitim";
  }

  if (normalizedValue === "kurs") {
    return "kurs";
  }

  return null;
}

export async function getEvents(
  eventType?: StrapiEventType | null,
  sortOrder: StrapiEventSortOrder = "asc"
) {
  try {
    const eventSort = sortOrder === "desc" ? "startsAt:desc" : "startsAt:asc";

    const appliedEventType = eventType ? normalizeEventType(eventType) : null;

    const eventTypeFilter = appliedEventType
      ? `&filters[eventType][$eq]=${encodeURIComponent(appliedEventType)}`
      : "";

    const response = await fetchStrapi<StrapiListResponse<StrapiEvent>>(
      `/api/events?pagination[pageSize]=100&sort[0]=${eventSort}&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=startsAt&fields[4]=eventType&fields[5]=endsAt&fields[6]=keepRegistrationsOpen&fields[7]=location&fields[8]=topicArea&populate[seo][fields][0]=metaTitle&populate[seo][fields][1]=metaDescription&populate[seo][fields][2]=canonicalPath&populate[seo][fields][3]=noIndex&populate[seo][fields][4]=ogImageAlt&populate[seo][fields][5]=ogTitle&populate[seo][fields][6]=ogDescription&populate[seo][populate][ogImage][fields][0]=url&populate[seo][populate][ogImage][fields][1]=alternativeText&populate[seo][populate][ogImage][fields][2]=width&populate[seo][populate][ogImage][fields][3]=height&populate[seo][populate][ogImage][fields][4]=mime&populate[seo][populate][ogImage][fields][5]=formats&populate[course][fields][0]=title&populate[course][fields][1]=slug&populate[course][fields][2]=topicArea${eventTypeFilter}`,
      { next: { tags: [EVENTS_TAG] } }
    );

    return response.data;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'events',
      function: 'getEvents',
      message: `Error fetching events: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}

export async function getEventSlugs() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiEvent>>(
      '/api/events?pagination[pageSize]=100&sort[0]=startsAt:asc&fields[0]=slug',
      { next: { tags: [EVENTS_TAG] } }
    );

    return response.data.map((event) => event.slug);
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'events',
      function: 'getEventSlugs',
      message: `Error fetching event slugs: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}

export async function getEventBySlug(slug: string) {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiEvent>>(
      `/api/events?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=startsAt&fields[4]=eventType&fields[5]=endsAt&fields[6]=keepRegistrationsOpen&fields[7]=location&fields[8]=details&fields[9]=topicArea&populate[seo][fields][0]=metaTitle&populate[seo][fields][1]=metaDescription&populate[seo][fields][2]=canonicalPath&populate[seo][fields][3]=noIndex&populate[seo][fields][4]=ogImageAlt&populate[seo][fields][5]=ogTitle&populate[seo][fields][6]=ogDescription&populate[seo][populate][ogImage][fields][0]=url&populate[seo][populate][ogImage][fields][1]=alternativeText&populate[seo][populate][ogImage][fields][2]=width&populate[seo][populate][ogImage][fields][3]=height&populate[seo][populate][ogImage][fields][4]=mime&populate[seo][populate][ogImage][fields][5]=formats&populate[course][fields][0]=title&populate[course][fields][1]=slug&populate[course][fields][2]=topicArea`,
      { next: { tags: [EVENTS_TAG] } }
    );

    return response.data[0] ?? null;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'events',
      function: 'getEventBySlug',
      message: `Error fetching event by slug: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return null;
  }
}

/**
 * Registration status depends on the current wall-clock time
 * (startsAt vs now()). Cannot be cached with force-cache.
 */
export async function getEventRegistrationStatus(
  documentId: string
): Promise<EventRegistrationStatus | null> {
  try {
    const data = await fetchStrapi<{ data: EventRegistrationStatus }>(
      `/api/events/${documentId}/registration-status`,
      { cache: "no-store" }
    );
    return data?.data ?? null;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'events',
      function: 'getEventRegistrationStatus',
      message: `Error fetching event registration status: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return null;
  }
}
