/* ─── Topic areas ─── */

export const TOPIC_AREAS = [
  "siber-guvenlik",
  "yazilim-gelistirme",
  "veri-bilimi",
  "bulut-altyapi",
  "is-surecleri",
  "yapay-zeka",
] as const;

export type TopicArea = (typeof TOPIC_AREAS)[number];

const topicAreaLabels: Record<TopicArea, string> = {
  "siber-guvenlik": "Siber Güvenlik",
  "yazilim-gelistirme": "Yazılım",
  "veri-bilimi": "Veri Analitiği",
  "bulut-altyapi": "Bulut",
  "is-surecleri": "Süreçler",
  "yapay-zeka": "Yapay Zeka",
};

export function getTopicAreaLabel(slug: TopicArea): string {
  return topicAreaLabels[slug];
}

export function normalizeTopicArea(
  value: string | null | undefined
): TopicArea | null {
  if (!value) return null;

  const normalized = value.trim().toLocaleLowerCase("tr-TR");

  if (TOPIC_AREAS.includes(normalized as TopicArea)) {
    return normalized as TopicArea;
  }

  return null;
}

/* ─── Course levels ─── */

export const COURSE_LEVELS = ["temel", "orta", "ileri"] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];

const courseLevelLabels: Record<CourseLevel, string> = {
  temel: "Temel",
  orta: "Orta",
  ileri: "İleri",
};

export function getCourseLevelLabel(level: CourseLevel): string {
  return courseLevelLabels[level];
}

export function normalizeCourseLevel(
  value: string | null | undefined
): CourseLevel | null {
  if (!value) return null;

  const normalized = value.trim().toLocaleLowerCase("tr-TR");

  if (COURSE_LEVELS.includes(normalized as CourseLevel)) {
    return normalized as CourseLevel;
  }

  return null;
}

/* ─── Topic filter helpers ─── */

export type TopicFilter = TopicArea | "all";

export function resolveTopicFilter(
  value: string | string[] | undefined
): TopicFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = normalizeTopicArea(raw);
  return normalized ?? "all";
}

export function buildTopicFilterHref(topic: TopicFilter): string {
  if (topic === "all") return "/egitimler";
  return `/egitimler?topic=${topic}`;
}

export function buildTopicFilterHrefWithSearch(
  topic: TopicFilter,
  search?: string | null
): string {
  const params = new URLSearchParams();

  if (topic !== "all") {
    params.set("topic", topic);
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    params.set("search", trimmedSearch);
  }

  const query = params.toString();
  return query ? `/egitimler?${query}` : "/egitimler";
}
