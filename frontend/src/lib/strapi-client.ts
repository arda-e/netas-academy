import type { FetchStrapiOptions } from "./strapi-types";

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://127.0.0.1:1337';

async function fetchStrapi<T>(path: string, options?: FetchStrapiOptions) {
  const response = await fetch(`${STRAPI_URL}${path}`, {
    cache: options?.cache ?? 'no-store',
    next: options?.next,
  });

  if (!response.ok) {
    throw new Error(`Strapi request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export { fetchStrapi };
