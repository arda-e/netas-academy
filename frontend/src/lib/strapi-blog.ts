import type { StrapiBlogPost, StrapiListResponse } from "./strapi-types";
import { fetchStrapi } from "./strapi-client";

export async function getBlogPosts(search?: string) {
  try {
    let path =
      '/api/blog-posts?pagination[pageSize]=100&sort[0]=publishedDate:desc&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publishedDate&populate[author][fields][0]=displayName&populate[author][fields][1]=slug&populate[author][fields][2]=role&populate[coverImage][fields][0]=url&populate[coverImage][fields][1]=alternativeText';

    if (search && search.trim()) {
      const term = encodeURIComponent(search.trim());
      path += `&filters[$or][0][title][$containsi]=${term}&filters[$or][1][excerpt][$containsi]=${term}&filters[$or][2][content][$containsi]=${term}`;
    }

    const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(path);

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
      { cache: 'no-store' }
    );

    return response.data[0] ?? null;
  } catch {
    return null;
  }
}
