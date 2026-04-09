const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';

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
  teacher?: {
    id: number;
    documentId: string;
    fullName: string;
    slug: string;
  } | null;
};

export type StrapiEvent = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  summary?: string | null;
  details?: string | null;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  course?: {
    id: number;
    documentId: string;
    title: string;
    slug: string;
  } | null;
};

export type StrapiBlogPost = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
};

type StrapiMedia = {
  id: number;
  documentId: string;
  url?: string | null;
  alternativeText?: string | null;
};

export type StrapiTeacher = {
  id: number;
  documentId: string;
  fullName: string;
  slug: string;
  headline?: string | null;
  bio?: string | null;
  email?: string | null;
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

  return `${STRAPI_URL}${path}`;
}

export async function getCourses() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
      '/api/courses?pagination[pageSize]=100&sort[0]=title:asc&fields[0]=title&fields[1]=slug&fields[2]=summary&populate[teacher][fields][0]=fullName&populate[teacher][fields][1]=slug'
    );

    return response.data;
  } catch {
    return [];
  }
}

export async function getCourseSlugs() {
  const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
    '/api/courses?pagination[pageSize]=100&sort[0]=title:asc&fields[0]=slug',
    { cache: 'force-cache' }
  );

  return response.data.map((course) => course.slug);
}

export async function getCourseBySlug(slug: string) {
  const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
    `/api/courses?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=description&populate[teacher][fields][0]=fullName&populate[teacher][fields][1]=slug`,
    { cache: 'force-cache' }
  );

  return response.data[0] ?? null;
}

export async function getEvents() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiEvent>>(
      '/api/events?pagination[pageSize]=100&sort[0]=startsAt:asc&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=startsAt&fields[4]=endsAt&fields[5]=location&populate[course][fields][0]=title&populate[course][fields][1]=slug'
    );

    return response.data;
  } catch {
    return [];
  }
}

export async function getEventSlugs() {
  const response = await fetchStrapi<StrapiListResponse<StrapiEvent>>(
    '/api/events?pagination[pageSize]=100&sort[0]=startsAt:asc&fields[0]=slug',
    { cache: 'force-cache' }
  );

  return response.data.map((event) => event.slug);
}

export async function getEventBySlug(slug: string) {
  const response = await fetchStrapi<StrapiListResponse<StrapiEvent>>(
    `/api/events?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=startsAt&fields[4]=endsAt&fields[5]=location&fields[6]=details&populate[course][fields][0]=title&populate[course][fields][1]=slug`,
    { cache: 'force-cache' }
  );

  return response.data[0] ?? null;
}

export async function getBlogPosts() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(
      '/api/blog-posts?pagination[pageSize]=100&sort[0]=title:asc&fields[0]=title&fields[1]=slug&fields[2]=excerpt'
    );

    return response.data;
  } catch {
    return [];
  }
}

export async function getBlogPostSlugs() {
  const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(
    '/api/blog-posts?pagination[pageSize]=100&sort[0]=title:asc&fields[0]=slug',
    { cache: 'force-cache' }
  );

  return response.data.map((post) => post.slug);
}

export async function getBlogPostBySlug(slug: string) {
  const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(
    `/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=content`,
    { cache: 'force-cache' }
  );

  return response.data[0] ?? null;
}

export async function getTeachers() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiTeacher>>(
      "/api/teachers?pagination[pageSize]=100&sort[0]=fullName:asc&fields[0]=fullName&fields[1]=slug&fields[2]=headline&populate[profilePhoto][fields][0]=url&populate[profilePhoto][fields][1]=alternativeText",
      { cache: "force-cache" }
    );

    return response.data;
  } catch {
    return [];
  }
}

export async function getTeacherSlugs() {
  const response = await fetchStrapi<StrapiListResponse<StrapiTeacher>>(
    "/api/teachers?pagination[pageSize]=100&sort[0]=fullName:asc&fields[0]=slug",
    { cache: "force-cache" }
  );

  return response.data.map((teacher) => teacher.slug);
}

export async function getTeacherBySlug(slug: string) {
  const response = await fetchStrapi<StrapiListResponse<StrapiTeacher>>(
    `/api/teachers?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&fields[0]=fullName&fields[1]=slug&fields[2]=headline&fields[3]=bio&fields[4]=email&populate[profilePhoto][fields][0]=url&populate[profilePhoto][fields][1]=alternativeText&populate[courses][fields][0]=title&populate[courses][fields][1]=slug&sort[0]=fullName:asc`,
    { cache: "force-cache" }
  );

  return response.data[0] ?? null;
}
