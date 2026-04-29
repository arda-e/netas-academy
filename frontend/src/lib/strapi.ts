const STRAPI_URL = process.env.STRAPI_URL ?? 'http://127.0.0.1:1337';
const STRAPI_PUBLIC_URL = process.env.STRAPI_PUBLIC_URL ?? process.env.STRAPI_URL ?? 'http://localhost:1337';

type StrapiListResponse<T> = {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

type FetchStrapiOptions = {
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

export type StrapiCourse = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  /* ─── taxonomy fields ─── */
  topicArea?: string | null;
  level?: string | null;
  targetAudience?: string | null;
  /* ─── capability fields ─── */
  businessValue?: string | null;
  scopeSummary?: string | null;
  outcomeBullets?: string | null;
  teacher?: {
    id: number;
    documentId: string;
    fullName: string;
    slug: string;
  } | null;
  /* ─── related events ─── */
  events?: Array<{
    id: number;
    documentId: string;
    title: string;
    slug: string;
    summary?: string | null;
    startsAt: string;
    eventType: string;
    topicArea?: string | null;
  }> | null;
};

export type StrapiEventType = "etkinlik" | "egitim" | "kurs";
export type StrapiEventSortOrder = "asc" | "desc";

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

export type StrapiEvent = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary?: string | null;
  details?: string | null;
  startsAt: string;
  eventType: StrapiEventType;
  endsAt?: string | null;
  keepRegistrationsOpen?: boolean | null;
  location?: string | null;
  topicArea?: string | null;
  course?: {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    topicArea?: string | null;
  } | null;
};

type StrapiMedia = {
  id: number;
  documentId: string;
  url?: string | null;
  alternativeText?: string | null;
  data?: unknown;
  attributes?: unknown;
  formats?: Record<string, { url?: string | null }> | null;
};

export type StrapiBlogPost = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  author?: {
    id: number;
    documentId: string;
    displayName: string;
    slug: string;
    role?: string | null;
    shortBio?: string | null;
  } | null;
  publishedDate?: string | null;
  sourceNotes?: string | null;
  coverImage?: StrapiMedia | null;
};
export type StrapiTeacher = {
  id: number;
  documentId: string;
  fullName: string;
  slug: string;
  headline?: string | null;
  bio?: string | null;
  email?: string | null;
  expertiseAreas?: string[] | null;
  targetTeams?: string | null;
  teachingApproach?: string | null;
  profilePhoto?: StrapiMedia | null;
  courses?: Array<{
    id: number;
    documentId: string;
    title: string;
    slug: string;
  }>;
};
async function fetchStrapi<T>(path: string, options?: FetchStrapiOptions) {
  const response = await fetch(`${STRAPI_URL}${path}`, {
    cache: options?.cache ?? 'no-store',
    next: options?.next,
  });

  if (!response.ok) {
    throw new Error(`Strapi request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export function toStrapiAssetUrl(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${STRAPI_PUBLIC_URL}${path}`;
}

export function getStrapiMediaUrl(media?: StrapiMedia | null) {
  if (!media) {
    return null;
  }

  const candidates = [
    media.url,
    getNestedString(media, ["data", "attributes", "url"]),
    getNestedString(media, ["data", "url"]),
    getNestedString(media, ["attributes", "url"]),
    getNestedString(media, ["formats", "large", "url"]),
    getNestedString(media, ["formats", "medium", "url"]),
    getNestedString(media, ["formats", "small", "url"]),
    getNestedString(media, ["formats", "thumbnail", "url"]),
  ];

  return toStrapiAssetUrl(candidates.find((value) => typeof value === "string" && value.length > 0) ?? null);
}

export function getStrapiMediaAltText(media?: StrapiMedia | null) {
  if (!media) {
    return null;
  }

  return (
    media.alternativeText ??
    getNestedString(media, ["data", "attributes", "alternativeText"]) ??
    getNestedString(media, ["data", "alternativeText"]) ??
    getNestedString(media, ["attributes", "alternativeText"]) ??
    null
  );
}

function getNestedString(value: unknown, path: string[]) {
  let current: unknown = value;

  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return null;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : null;
}

export async function getCourses() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
      '/api/courses?pagination[pageSize]=100&sort[0]=title:asc' +
      '&fields[0]=title&fields[1]=slug&fields[2]=summary' +
      '&fields[3]=topicArea&fields[4]=level&fields[5]=targetAudience' +
      '&fields[6]=businessValue&fields[7]=scopeSummary' +
      '&fields[8]=description&fields[9]=outcomeBullets' +
      '&populate[teacher][fields][0]=fullName&populate[teacher][fields][1]=slug'
    );

    return response.data;
  } catch {
    return [];
  }
}

export async function getCourseSlugs() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
      '/api/courses?pagination[pageSize]=100&sort[0]=title:asc&fields[0]=slug',
      { cache: 'force-cache' }
    );

    return response.data.map((course) => course.slug);
  } catch {
    return [];
  }
}

export async function getCourseBySlug(slug: string) {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
      `/api/courses?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1` +
      '&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=description' +
      '&fields[4]=topicArea&fields[5]=level&fields[6]=targetAudience' +
      '&fields[7]=businessValue&fields[8]=scopeSummary&fields[9]=outcomeBullets' +
      '&populate[teacher][fields][0]=fullName&populate[teacher][fields][1]=slug' +
      '&populate[events][fields][0]=title&populate[events][fields][1]=slug' +
      '&populate[events][fields][2]=summary&populate[events][fields][3]=startsAt' +
      '&populate[events][fields][4]=eventType&populate[events][fields][5]=topicArea' +
      '&populate[events][sort][0]=startsAt:asc',
      { cache: 'force-cache' }
    );

    return response.data[0] ?? null;
  } catch {
    return null;
  }
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

export async function getBlogPosts() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(
      '/api/blog-posts?pagination[pageSize]=100&sort[0]=publishedDate:desc&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publishedDate&populate[author][fields][0]=displayName&populate[author][fields][1]=slug&populate[author][fields][2]=role&populate[coverImage][fields][0]=url&populate[coverImage][fields][1]=alternativeText'
    );

    return response.data;
  } catch {
    return [];
  }
}

export async function getBlogPostSlugs() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(
      '/api/blog-posts?pagination[pageSize]=100&sort[0]=title:asc&fields[0]=slug',
      { cache: 'force-cache' }
    );

    return response.data.map((post) => post.slug);
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(
      `/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=content&fields[4]=publishedDate&fields[5]=sourceNotes&populate[author][fields][0]=displayName&populate[author][fields][1]=slug&populate[author][fields][2]=role&populate[author][fields][3]=shortBio&populate[coverImage][fields][0]=url&populate[coverImage][fields][1]=alternativeText`,
      { cache: 'force-cache' }
    );

    return response.data[0] ?? null;
  } catch {
    return null;
  }
}

export async function getTeachers() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiTeacher>>(
      "/api/teachers?pagination[pageSize]=100&sort[0]=fullName:asc&fields[0]=fullName&fields[1]=slug&fields[2]=headline&fields[3]=expertiseAreas&fields[4]=targetTeams&fields[5]=teachingApproach&populate[profilePhoto][fields][0]=url&populate[profilePhoto][fields][1]=alternativeText",
      { cache: "no-store" }
    );

    return response.data;
  } catch {
    return [];
  }
}

export async function getTeacherSlugs() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiTeacher>>(
      "/api/teachers?pagination[pageSize]=100&sort[0]=fullName:asc&fields[0]=slug",
      { cache: "force-cache" }
    );

    return response.data.map((teacher) => teacher.slug);
  } catch {
    return [];
  }
}

export async function getTeacherBySlug(slug: string) {
  try {
    const path = `/api/teachers?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&fields[0]=fullName&fields[1]=slug&fields[2]=headline&fields[3]=bio&fields[4]=email&fields[5]=expertiseAreas&fields[6]=targetTeams&fields[7]=teachingApproach&populate[profilePhoto][fields][0]=url&populate[profilePhoto][fields][1]=alternativeText&populate[courses][fields][0]=title&populate[courses][fields][1]=slug&sort[0]=fullName:asc`;

    const response = await fetchStrapi<StrapiListResponse<StrapiTeacher>>(path, {
      cache: "force-cache",
    });

    return response.data[0] ?? null;
  } catch {
    return null;
  }
}

export async function getLatestCourses(limit = 5) {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
      `/api/courses?pagination[pageSize]=${limit}&sort[0]=createdAt:desc` +
      '&fields[0]=title&fields[1]=slug&fields[2]=summary' +
      '&fields[3]=topicArea&fields[4]=level'
    );

    return response.data;
  } catch {
    return [];
  }
}
