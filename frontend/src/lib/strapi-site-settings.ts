import { cache } from "react";
import { fetchStrapi } from "./strapi-client";
import type { StrapiSiteSetting } from "./strapi-types";

type StrapiSiteSettingResponse = {
  data: StrapiSiteSetting | null;
};

const SITE_SETTINGS_TAG = "site-settings";

export const getSiteSettings = cache(async () => {
  try {
    const response = await fetchStrapi<StrapiSiteSettingResponse>(
      "/api/site-setting?fields[0]=siteName&fields[1]=defaultMetaTitle&fields[2]=defaultMetaDescription&fields[3]=defaultOgImageAlt&populate[defaultOgImage][fields][0]=url&populate[defaultOgImage][fields][1]=alternativeText&populate[defaultOgImage][fields][2]=width&populate[defaultOgImage][fields][3]=height&populate[defaultOgImage][fields][4]=mime&populate[defaultOgImage][fields][5]=formats",
      {
        cache: "force-cache",
        next: { tags: [SITE_SETTINGS_TAG] },
      },
    );

    return response.data ?? null;
  } catch (error) {
    console.error(
      JSON.stringify({
        domain: "site-settings",
        function: "getSiteSettings",
        message: `Error fetching site settings: ${error instanceof Error ? error.message : String(error)}`,
      }),
    );
    return null;
  }
});
