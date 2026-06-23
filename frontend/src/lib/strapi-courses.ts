import { cache } from "react";
import type { StrapiCourse, StrapiListResponse } from "./strapi-types";
import { fetchStrapi } from "./strapi-client";
import { COURSES_TAG } from "./course-service";

export async function getCourseSlugs() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
      '/api/courses?pagination[pageSize]=100&sort[0]=title:asc&fields[0]=slug',
      { next: { tags: [COURSES_TAG] } }
    );

    return response.data.map((course) => course.slug);
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'courses',
      function: 'getCourseSlugs',
      message: `Error fetching course slugs: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}

export const getCourseBySlug = cache(async (slug: string, isDraft = false) => {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
      `/api/courses?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1` +
      '&fields[0]=title&fields[1]=slug&fields[2]=summary&fields[3]=description' +
      '&fields[4]=topicArea&fields[5]=level&fields[6]=targetAudience' +
      '&fields[7]=businessValue&fields[8]=scopeSummary&fields[9]=outcomeBullets' +
      '&populate[seo][fields][0]=metaTitle&populate[seo][fields][1]=metaDescription' +
      '&populate[seo][fields][2]=canonicalPath&populate[seo][fields][3]=noIndex' +
      '&populate[seo][fields][4]=ogImageAlt&populate[seo][fields][5]=ogTitle' +
      '&populate[seo][fields][6]=ogDescription&populate[seo][populate][ogImage][fields][0]=url' +
      '&populate[seo][populate][ogImage][fields][1]=alternativeText&populate[seo][populate][ogImage][fields][2]=width' +
      '&populate[seo][populate][ogImage][fields][3]=height&populate[seo][populate][ogImage][fields][4]=mime' +
      '&populate[seo][populate][ogImage][fields][5]=formats' +
      '&populate[teacher][fields][0]=fullName&populate[teacher][fields][1]=slug' +
      '&populate[events][fields][0]=title&populate[events][fields][1]=slug' +
      '&populate[events][fields][2]=summary&populate[events][fields][3]=startsAt' +
      '&populate[events][fields][4]=eventType&populate[events][fields][5]=topicArea' +
      '&populate[events][fields][6]=format&populate[events][fields][7]=price' +
      '&populate[events][sort][0]=startsAt:asc',
      isDraft ? { isDraft: true } : { next: { tags: [COURSES_TAG] } }
    );

    return response.data[0] ?? null;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'courses',
      function: 'getCourseBySlug',
      message: `Error fetching course by slug: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return null;
  }
});

export async function getLatestCourses(limit = 5) {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiCourse>>(
      `/api/courses?pagination[pageSize]=${limit}&sort[0]=createdAt:desc` +
      '&fields[0]=title&fields[1]=slug&fields[2]=summary' +
      '&fields[3]=topicArea&fields[4]=level',
      { next: { tags: [COURSES_TAG] } }
    );

    return response.data;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'courses',
      function: 'getLatestCourses',
      message: `Error fetching latest courses: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}
