import { cache } from "react";
import type { StrapiBlogPost, StrapiListResponse } from "./strapi-types";
import { fetchStrapi } from "./strapi-client";

const BLOG_TAG = "strapi-blog-posts";

export async function getBlogPosts(search?: string) {
  try {
    let path =
      '/api/blog-posts?pagination[pageSize]=100&sort[0]=publishedDate:desc&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publishedDate&populate[seo][fields][0]=metaTitle&populate[seo][fields][1]=metaDescription&populate[seo][fields][2]=canonicalPath&populate[seo][fields][3]=noIndex&populate[seo][fields][4]=ogImageAlt&populate[seo][fields][5]=ogTitle&populate[seo][fields][6]=ogDescription&populate[seo][populate][ogImage][fields][0]=url&populate[seo][populate][ogImage][fields][1]=alternativeText&populate[seo][populate][ogImage][fields][2]=width&populate[seo][populate][ogImage][fields][3]=height&populate[seo][populate][ogImage][fields][4]=mime&populate[seo][populate][ogImage][fields][5]=formats&populate[author][fields][0]=displayName&populate[author][fields][1]=slug&populate[author][fields][2]=role&populate[coverImage][fields][0]=url&populate[coverImage][fields][1]=alternativeText&populate[coverImage][fields][2]=width&populate[coverImage][fields][3]=height&populate[coverImage][fields][4]=mime&populate[coverImage][fields][5]=formats';

    if (search && search.trim()) {
      const term = encodeURIComponent(search.trim());
      path += `&filters[$or][0][title][$containsi]=${term}&filters[$or][1][excerpt][$containsi]=${term}&filters[$or][2][content][$containsi]=${term}`;
    }

    const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(
      path,
      { next: { tags: [BLOG_TAG] } }
    );

    return response.data;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'blog',
      function: 'getBlogPosts',
      message: `Error fetching blog posts: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}

export async function getBlogPostSlugs() {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(
      '/api/blog-posts?pagination[pageSize]=100&sort[0]=title:asc&fields[0]=slug',
      { next: { tags: [BLOG_TAG] } }
    );

    return response.data.map((post) => post.slug);
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'blog',
      function: 'getBlogPostSlugs',
      message: `Error fetching blog post slugs: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}

export const getBlogPostBySlug = cache(async (slug: string, isDraft = false) => {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(
      `/api/blog-posts?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=content&fields[4]=publishedDate&populate[seo][fields][0]=metaTitle&populate[seo][fields][1]=metaDescription&populate[seo][fields][2]=canonicalPath&populate[seo][fields][3]=noIndex&populate[seo][fields][4]=ogImageAlt&populate[seo][fields][5]=ogTitle&populate[seo][fields][6]=ogDescription&populate[seo][populate][ogImage][fields][0]=url&populate[seo][populate][ogImage][fields][1]=alternativeText&populate[seo][populate][ogImage][fields][2]=width&populate[seo][populate][ogImage][fields][3]=height&populate[seo][populate][ogImage][fields][4]=mime&populate[seo][populate][ogImage][fields][5]=formats&populate[author][fields][0]=displayName&populate[author][fields][1]=slug&populate[author][fields][2]=role&populate[author][fields][3]=shortBio&populate[coverImage][fields][0]=url&populate[coverImage][fields][1]=alternativeText&populate[coverImage][fields][2]=width&populate[coverImage][fields][3]=height&populate[coverImage][fields][4]=mime&populate[coverImage][fields][5]=formats`,
      isDraft ? { isDraft: true } : { next: { tags: [BLOG_TAG] } }
    );

    return response.data[0] ?? null;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'blog',
      function: 'getBlogPostBySlug',
      message: `Error fetching blog post by slug: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return null;
  }
});

export async function getRelatedBlogPosts(excludeSlug: string, limit = 3) {
  try {
    const response = await fetchStrapi<StrapiListResponse<StrapiBlogPost>>(
      `/api/blog-posts?pagination[pageSize]=${limit}&sort[0]=publishedDate:desc` +
      `&filters[slug][$ne]=${encodeURIComponent(excludeSlug)}` +
      '&fields[0]=title&fields[1]=slug&fields[2]=excerpt&fields[3]=publishedDate' +
      '&populate[author][fields][0]=displayName&populate[author][fields][1]=slug&populate[author][fields][2]=role' +
      '&populate[coverImage][fields][0]=url&populate[coverImage][fields][1]=alternativeText' +
      '&populate[coverImage][fields][2]=width&populate[coverImage][fields][3]=height' +
      '&populate[coverImage][fields][4]=mime&populate[coverImage][fields][5]=formats',
      { next: { tags: [BLOG_TAG] } }
    );

    return response.data;
  } catch (error) {
    console.error(JSON.stringify({
      domain: 'blog',
      function: 'getRelatedBlogPosts',
      message: `Error fetching related blog posts: ${error instanceof Error ? error.message : String(error)}`,
    }));
    return [];
  }
}
