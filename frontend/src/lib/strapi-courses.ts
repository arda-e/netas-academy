import type { StrapiCourse, StrapiListResponse } from "./strapi-types";
import { fetchStrapi } from "./strapi-client";

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
