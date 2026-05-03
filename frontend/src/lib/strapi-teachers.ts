import type { StrapiTeacher, StrapiListResponse } from "./strapi-types";
import { fetchStrapi } from "./strapi-client";

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
