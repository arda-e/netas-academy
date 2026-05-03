import type { StrapiEvent, StrapiEventType, StrapiEventSortOrder, StrapiListResponse, EventRegistrationStatus } from "./strapi-types";
import { fetchStrapi } from "./strapi-client";

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

    const response = await fetchStrapi<StrapiListResponse<StrapiEvent>>(
      `/api/events?pagination[pageSize]=100&sort[0]=${eventSort}&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=startsAt&fields[4]=eventType&fields[5]=endsAt&fields[6]=keepRegistrationsOpen&fields[7]=location&fields[8]=topicArea&fields[9]=details&populate[course][fields][0]=title&populate[course][fields][1]=slug&populate[course][fields][2]=topicArea`
    );

    if (!eventType) {
      return response.data;
    }

    return response.data.filter(
      (event) => normalizeEventType(event.eventType) === eventType
    );
  } catch {
    return [];
  }
}

export async function getEventSlugs() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiEvent>>(
      '/api/events?pagination[pageSize]=100&sort[0]=startsAt:asc&fields[0]=slug',
      { cache: 'force-cache' }
    );

    return response.data.map((event) => event.slug);
  } catch {
    return [];
  }
}

export async function getEventBySlug(slug: string) {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiEvent>>(
      `/api/events?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=startsAt&fields[4]=eventType&fields[5]=endsAt&fields[6]=keepRegistrationsOpen&fields[7]=location&fields[8]=details&fields[9]=topicArea&populate[course][fields][0]=title&populate[course][fields][1]=slug&populate[course][fields][2]=topicArea`,
      { cache: 'force-cache' }
    );

    return response.data[0] ?? null;
  } catch {
    return null;
  }
}

export async function getEventRegistrationStatus(
  documentId: string
): Promise<EventRegistrationStatus | null> {
  try {
    const data = await fetchStrapi<{ data: EventRegistrationStatus }>(
      `/api/events/${documentId}/registration-status`
    );
    return data?.data ?? null;
  } catch {
    return null;
  }
}
