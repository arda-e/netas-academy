import type { StrapiTeacher, StrapiListResponse } from "./strapi-types";
import { fetchStrapi } from "./strapi-client";

const TEACHERS_TAG = "strapi-teachers";

export async function getTeachers() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiTeacher>>(
      "/api/teachers?pagination[pageSize]=100&sort[0]=fullName:asc&fields[0]=fullName&fields[1]=slug&fields[2]=headline&fields[3]=expertiseAreas&fields[4]=targetTeams&fields[5]=teachingApproach&populate[profilePhoto][fields][0]=url&populate[profilePhoto][fields][1]=alternativeText&populate[profilePhoto][fields][2]=width&populate[profilePhoto][fields][3]=height&populate[profilePhoto][fields][4]=mime&populate[profilePhoto][fields][5]=formats",
      { next: { tags: [TEACHERS_TAG] } }
    );

    return response.data;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'teachers',
      function: 'getTeachers',
      message: `Error fetching teachers: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}

export async function getTeacherSlugs() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiTeacher>>(
      "/api/teachers?pagination[pageSize]=100&sort[0]=fullName:asc&fields[0]=slug",
      { next: { tags: [TEACHERS_TAG] } }
    );

    return response.data.map((teacher) => teacher.slug);
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'teachers',
      function: 'getTeacherSlugs',
      message: `Error fetching teacher slugs: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}

export async function getTeacherBySlug(slug: string) {
  try {
    const path = `/api/teachers?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&fields[0]=fullName&fields[1]=slug&fields[2]=headline&fields[3]=bio&fields[4]=email&fields[5]=expertiseAreas&fields[6]=targetTeams&fields[7]=teachingApproach&populate[profilePhoto][fields][0]=url&populate[profilePhoto][fields][1]=alternativeText&populate[profilePhoto][fields][2]=width&populate[profilePhoto][fields][3]=height&populate[profilePhoto][fields][4]=mime&populate[profilePhoto][fields][5]=formats&populate[courses][fields][0]=title&populate[courses][fields][1]=slug&sort[0]=fullName:asc`;

    const response = await fetchStrapi<StrapiListResponse<StrapiTeacher>>(path, {
      next: { tags: [TEACHERS_TAG] },
    });

    return response.data[0] ?? null;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'teachers',
      function: 'getTeacherBySlug',
      message: `Error fetching teacher by slug: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return null;
  }
}
