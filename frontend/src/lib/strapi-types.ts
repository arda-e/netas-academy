export type StrapiListResponse<T> = {
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

export type FetchStrapiOptions = {
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  timeout?: number;
  retries?: number;
  headers?: HeadersInit;
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
  seo?: StrapiSeo | null;
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
  seo?: StrapiSeo | null;
  course?: {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    topicArea?: string | null;
  } | null;
};

export type StrapiMediaFormat = {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string | null;
};

export type StrapiMedia = {
  id: number;
  documentId: string;
  url?: string | null;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
  mime?: string | null;
  data?: unknown;
  attributes?: unknown;
  formats?: Record<string, StrapiMediaFormat> | null;
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
  seo?: StrapiSeo | null;
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
  seo?: StrapiSeo | null;
  courses?: Array<{
    id: number;
    documentId: string;
    title: string;
    slug: string;
  }>;
};

export type StrapiSeo = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalPath?: string | null;
  noIndex?: boolean | null;
  ogImage?: StrapiMedia | null;
  ogImageAlt?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
};

export type StrapiSiteSetting = {
  id: number;
  documentId: string;
  siteName: string;
  defaultMetaTitle?: string | null;
  defaultMetaDescription?: string | null;
  defaultOgImage?: StrapiMedia | null;
  defaultOgImageAlt?: string | null;
};

export type EventRegistrationStatus = {
  isOpen: boolean;
  startsAt: string;
  keepRegistrationsOpen: boolean;
};
