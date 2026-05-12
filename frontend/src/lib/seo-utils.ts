import type { Metadata } from "next";

import { getStrapiMediaFormat } from "./strapi-media";
import type { StrapiSeo, StrapiSiteSetting } from "./strapi-types";

type LocaleAlternates = Record<string, string>;

type BuildMetadataOptions = {
  seo?: StrapiSeo | null;
  defaults?: StrapiSiteSetting | null;
  fallbackTitle: string | null | undefined;
  fallbackDescription?: string | null | undefined;
  pagePath: string;
  locale: string;
  localeAlternates?: LocaleAlternates;
};

function normalizePath(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path === "") {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function buildLocalePath(locale: string, basePath: string) {
  const normalizedBasePath = normalizePath(basePath);

  if (locale === "en") {
    return normalizedBasePath === "/" ? "/en" : `/en${normalizedBasePath}`;
  }

  return normalizedBasePath;
}

export function buildLocaleAlternates(basePath: string): LocaleAlternates {
  const normalizedBasePath = normalizePath(basePath);

  return {
    tr: normalizedBasePath,
    en: normalizedBasePath === "/" ? "/en" : `/en${normalizedBasePath}`,
  };
}

export function buildMetadata({
  seo,
  defaults,
  fallbackTitle,
  fallbackDescription,
  pagePath,
  locale,
  localeAlternates,
}: BuildMetadataOptions): Metadata {
  const title =
    seo?.metaTitle ??
    fallbackTitle ??
    defaults?.defaultMetaTitle ??
    undefined;
  const description =
    seo?.metaDescription ??
    fallbackDescription ??
    defaults?.defaultMetaDescription ??
    undefined;
  const canonical = normalizePath(seo?.canonicalPath ?? pagePath);
  const ogFormat =
    getStrapiMediaFormat(seo?.ogImage, "large") ??
    getStrapiMediaFormat(defaults?.defaultOgImage, "large");
  const ogImageAlt =
    seo?.ogImageAlt ??
    defaults?.defaultOgImageAlt ??
    undefined;

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical,
      ...(localeAlternates ? { languages: localeAlternates } : {}),
    },
    openGraph: {
      locale: locale === "en" ? "en_US" : locale === "tr" ? "tr_TR" : locale,
      title: seo?.ogTitle ?? title,
      description: seo?.ogDescription ?? description,
      url: canonical,
      ...(defaults?.siteName ? { siteName: defaults.siteName } : {}),
      ...(ogFormat
        ? {
            images: [
              {
                url: ogFormat.url,
                ...(ogFormat.width ? { width: ogFormat.width } : {}),
                ...(ogFormat.height ? { height: ogFormat.height } : {}),
                ...(ogImageAlt ? { alt: ogImageAlt } : {}),
              },
            ],
          }
        : {}),
    },
  };

  if (seo?.noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}
