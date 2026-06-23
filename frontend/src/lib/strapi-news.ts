import { cache } from "react";
import type { StrapiNewsPost, StrapiListResponse } from "./strapi-types";
import { fetchStrapi } from "./strapi-client";

const NEWS_TAG = "strapi-news-posts";

const LIST_FIELDS =
  "/api/news-posts?pagination[pageSize]=100&sort[0]=publishedDate:desc" +
  "&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publishedDate&fields[4]=source" +
  "&populate[coverImage][fields][0]=url&populate[coverImage][fields][1]=alternativeText" +
  "&populate[coverImage][fields][2]=width&populate[coverImage][fields][3]=height" +
  "&populate[coverImage][fields][4]=mime&populate[coverImage][fields][5]=formats";

export async function getNewsPosts() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiNewsPost>>(
      LIST_FIELDS,
      { next: { tags: [NEWS_TAG] } }
    );
    return response.data;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'news',
      function: 'getNewsPosts',
      message: `Error fetching news posts: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}

export async function getNewsPostSlugs() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiNewsPost>>(
      "/api/news-posts?pagination[pageSize]=100&sort[0]=title:asc&fields[0]=slug",
      { next: { tags: [NEWS_TAG] } }
    );
    return response.data.map((post) => post.slug);
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'news',
      function: 'getNewsPostSlugs',
      message: `Error fetching news post slugs: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}

export const getNewsPostBySlug = cache(async (slug: string, isDraft = false) => {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiNewsPost>>(
      `/api/news-posts?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1` +
      "&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=content&fields[4]=publishedDate&fields[5]=source" +
      "&populate[seo][fields][0]=metaTitle&populate[seo][fields][1]=metaDescription" +
      "&populate[seo][fields][2]=canonicalPath&populate[seo][fields][3]=noIndex" +
      "&populate[seo][fields][4]=ogImageAlt&populate[seo][fields][5]=ogTitle" +
      "&populate[seo][fields][6]=ogDescription" +
      "&populate[seo][populate][ogImage][fields][0]=url&populate[seo][populate][ogImage][fields][1]=alternativeText" +
      "&populate[seo][populate][ogImage][fields][2]=width&populate[seo][populate][ogImage][fields][3]=height" +
      "&populate[seo][populate][ogImage][fields][4]=mime&populate[seo][populate][ogImage][fields][5]=formats" +
      "&populate[coverImage][fields][0]=url&populate[coverImage][fields][1]=alternativeText" +
      "&populate[coverImage][fields][2]=width&populate[coverImage][fields][3]=height" +
      "&populate[coverImage][fields][4]=mime&populate[coverImage][fields][5]=formats",
      isDraft ? { isDraft: true } : { next: { tags: [NEWS_TAG] } }
    );
    return response.data[0] ?? null;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'news',
      function: 'getNewsPostBySlug',
      message: `Error fetching news post by slug: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return null;
  }
});
