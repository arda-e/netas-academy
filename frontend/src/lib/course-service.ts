import type { StrapiCourse, StrapiListResponse } from "./strapi-types";
import { fetchStrapi } from "./strapi-client";
import type { CourseListSort, PaginationParamsDTO } from "./pagination-params-dto";

export const COURSES_TAG = "strapi-courses";
const DEFAULT_COURSE_LIST_PAGE_SIZE = 100;

export type CourseListQuery = PaginationParamsDTO;

function isPositiveInteger(value: number | undefined): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

function normalizeSort(value: CourseListSort | undefined): `title:${CourseListSort}` {
  return `title:${value ?? "asc"}`;
}

function buildCourseListPath(query: CourseListQuery = {}): string {
  const params = new URLSearchParams();
  const pageSize = query.pageSize ?? DEFAULT_COURSE_LIST_PAGE_SIZE;
  const sort = normalizeSort(query.sort);

  if (isPositiveInteger(query.page)) {
    params.set("pagination[page]", String(query.page));
  }

  params.set("pagination[pageSize]", String(isPositiveInteger(pageSize) ? pageSize : DEFAULT_COURSE_LIST_PAGE_SIZE));
  params.set("sort[0]", sort);
  params.set("fields[0]", "title");
  params.set("fields[1]", "slug");
  params.set("fields[2]", "summary");
  params.set("fields[3]", "topicArea");
  params.set("fields[4]", "level");
  params.set("fields[5]", "targetAudience");
  params.set("fields[6]", "businessValue");
  params.set("fields[7]", "scopeSummary");
  params.set("fields[8]", "description");
  params.set("fields[9]", "outcomeBullets");
  params.set("populate[seo][fields][0]", "metaTitle");
  params.set("populate[seo][fields][1]", "metaDescription");
  params.set("populate[seo][fields][2]", "canonicalPath");
  params.set("populate[seo][fields][3]", "noIndex");
  params.set("populate[seo][fields][4]", "ogImageAlt");
  params.set("populate[seo][fields][5]", "ogTitle");
  params.set("populate[seo][fields][6]", "ogDescription");
  params.set("populate[seo][populate][ogImage][fields][0]", "url");
  params.set("populate[seo][populate][ogImage][fields][1]", "alternativeText");
  params.set("populate[seo][populate][ogImage][fields][2]", "width");
  params.set("populate[seo][populate][ogImage][fields][3]", "height");
  params.set("populate[seo][populate][ogImage][fields][4]", "mime");
  params.set("populate[seo][populate][ogImage][fields][5]", "formats");
  params.set("populate[teacher][fields][0]", "fullName");
  params.set("populate[teacher][fields][1]", "slug");

  return `/api/courses?${params.toString()}`;
}

export async function getCourseList(query: CourseListQuery = {}) {
  const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
    buildCourseListPath(query),
    { next: { tags: [COURSES_TAG] } }
  );

  return response.data;
}
