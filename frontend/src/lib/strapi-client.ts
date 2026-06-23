import type { FetchStrapiOptions } from "./strapi-types";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://127.0.0.1:1337";
const DEFAULT_TIMEOUT_MS = 3000;
const DEFAULT_MAX_RETRIES = 0;
const MAX_RETRY_DELAY_MS = 16000;

function extractRoute(path: string): string {
  const base = path.split("?")[0];
  const segments = base.split("/").filter(Boolean);
  return segments[1] ?? "unknown";
}

type ErrorCategory = "network" | "http-4xx" | "http-5xx" | "parse";

function logError(route: string, endpoint: string, status: number | undefined, errorCategory: ErrorCategory, message: string) {
  console.error(JSON.stringify({
    route,
    endpoint,
    status,
    errorCategory,
    message,
  }));
}

function isRetryableError(error: unknown, status?: number): boolean {
  if (error instanceof TypeError) {
    return true;
  }

  if (typeof status === "number" && status >= 500) {
    return true;
  }

  return false;
}

function computeDelay(attempt: number): number {
  return Math.min(2 ** attempt * 1000, MAX_RETRY_DELAY_MS);
}

async function fetchStrapi<T>(path: string, options?: FetchStrapiOptions): Promise<T> {
  const maxRetries = options?.retries ?? DEFAULT_MAX_RETRIES;
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;
  const route = extractRoute(path);
  const endpoint = path.split("?")[0];
  const isDraftMode = options?.isDraft ?? false;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: RequestInit & { next?: NextFetchRequestConfig } = {
        signal: controller.signal,
      };

      if (options?.cache) {
        fetchOptions.cache = options.cache;
      } else if (!options?.next) {
        fetchOptions.cache = isDraftMode ? "no-store" : "force-cache";
      }

      if (options?.next) {
        fetchOptions.next = options.next;
      }

      const headers = new Headers(options?.headers);
      headers.set("strapi-encode-source-maps", isDraftMode ? "true" : "false");
      if (isDraftMode && process.env.STRAPI_PREVIEW_TOKEN) {
        headers.set("Authorization", `Bearer ${process.env.STRAPI_PREVIEW_TOKEN}`);
      }
      fetchOptions.headers = headers;

      if (isDraftMode) {
        const requestUrl = new URL(path, STRAPI_URL);
        requestUrl.searchParams.set("status", "draft");
        path = `${requestUrl.pathname}${requestUrl.search}`;
      }

      const response = await fetch(`${STRAPI_URL}${path}`, fetchOptions);

      if (timeoutId != null) clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMessage = `Strapi request failed: ${response.status} ${response.statusText}`;

        if (attempt < maxRetries && isRetryableError(null, response.status)) {
          const delay = computeDelay(attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        const category: ErrorCategory = response.status >= 500 ? "http-5xx" : "http-4xx";
        logError(route, endpoint, response.status, category, `HTTP ${response.status} ${response.statusText}`);
        throw new Error(errorMessage);
      }

      try {
        return (await response.json()) as T;
      } catch (parseError) {
        logError(
          route,
          endpoint,
          response.status,
          "parse",
          `JSON parse failed: ${parseError instanceof Error ? parseError.message : String(parseError)}`
        );
        throw parseError;
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === "AbortError") {
        logError(route, endpoint, undefined, "network", `Timeout after ${timeout}ms`);
        throw new Error(`Strapi request timed out after ${timeout}ms`);
      }

      if (attempt < maxRetries && isRetryableError(error)) {
        const delay = computeDelay(attempt + 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  logError(route, endpoint, undefined, "network", "Strapi request failed after all retries");
  throw new Error("Strapi request failed after all retries");
}

export { fetchStrapi };
