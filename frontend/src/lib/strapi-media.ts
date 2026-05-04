import type { StrapiMedia } from "./strapi-types";

export type StrapiMediaFormatSize = "thumbnail" | "small" | "medium" | "large";

const FORMAT_SIZE_ORDER: StrapiMediaFormatSize[] = [
  "large",
  "medium",
  "small",
  "thumbnail",
];

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

export function getStrapiMediaFormat(
  media: StrapiMedia | null | undefined,
  size: StrapiMediaFormatSize,
): { url: string; width?: number; height?: number } | null {
  if (!media) {
    return null;
  }

  const sizeIndex = FORMAT_SIZE_ORDER.indexOf(size);
  const fallbackOrder =
    sizeIndex >= 0
      ? [
          ...FORMAT_SIZE_ORDER.slice(sizeIndex),
          ...FORMAT_SIZE_ORDER.slice(0, sizeIndex).reverse(),
        ]
      : FORMAT_SIZE_ORDER;

  for (const formatSize of fallbackOrder) {
    const format = media.formats?.[formatSize];
    if (format?.url) {
      return {
        url: format.url,
        width: format.width ?? undefined,
        height: format.height ?? undefined,
      };
    }
  }

  const rawUrl = media.url ?? null;
  if (rawUrl) {
    return {
      url: rawUrl,
      width: media.width ?? undefined,
      height: media.height ?? undefined,
    };
  }

  return null;
}

export function getStrapiMediaUrl(
  media?: StrapiMedia | null,
  size?: StrapiMediaFormatSize,
) {
  if (!media) {
    return null;
  }

  if (size) {
    const formatUrl = getStrapiMediaFormat(media, size);
    if (formatUrl) {
      return toStrapiAssetUrl(formatUrl.url);
    }
  }

  const candidates = [
    getNestedString(media, ["formats", "large", "url"]),
    getNestedString(media, ["formats", "medium", "url"]),
    getNestedString(media, ["formats", "small", "url"]),
    getNestedString(media, ["formats", "thumbnail", "url"]),
    media.url,
    getNestedString(media, ["data", "attributes", "url"]),
    getNestedString(media, ["data", "url"]),
    getNestedString(media, ["attributes", "url"]),
  ];

  return toStrapiAssetUrl(
    candidates.find((value) => typeof value === "string" && value.length > 0) ??
      null,
  );
}

export function getStrapiMediaBlurDataUrl(media?: StrapiMedia | null) {
  const thumbnail = getStrapiMediaFormat(media, "thumbnail");

  return thumbnail?.url ? toStrapiAssetUrl(thumbnail.url) : null;
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
