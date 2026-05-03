import type { StrapiMedia } from "./strapi-types";

function getNestedString(value: unknown, path: string[]) {
  let current: unknown = value;

  for (const key of path) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return null;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : null;
}

export function toStrapiAssetUrl(path: string | null | undefined) {
  if (!path) {
    return null;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const url = new URL(path);

      if (url.pathname.startsWith("/uploads/")) {
        return `${url.pathname}${url.search}`;
      }
    } catch {
      return path;
    }

    return path;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function getStrapiMediaUrl(media?: StrapiMedia | null) {
  if (!media) {
    return null;
  }

  const candidates = [
    media.url,
    getNestedString(media, ["data", "attributes", "url"]),
    getNestedString(media, ["data", "url"]),
    getNestedString(media, ["attributes", "url"]),
    getNestedString(media, ["formats", "large", "url"]),
    getNestedString(media, ["formats", "medium", "url"]),
    getNestedString(media, ["formats", "small", "url"]),
    getNestedString(media, ["formats", "thumbnail", "url"]),
  ];

  return toStrapiAssetUrl(candidates.find((value) => typeof value === "string" && value.length > 0) ?? null);
}

export function getStrapiMediaAltText(media?: StrapiMedia | null) {
  if (!media) {
    return null;
  }

  return (
    media.alternativeText ??
    getNestedString(media, ["data", "attributes", "alternativeText"]) ??
    getNestedString(media, ["data", "alternativeText"]) ??
    getNestedString(media, ["attributes", "alternativeText"]) ??
    null
  );
}
