import type { Core } from '@strapi/strapi';
import { BackendConfigManager } from '../src/config/env';

const DEFAULT_LOCALE = 'tr';
declare const strapi: Core.Strapi;

function getPreviewPathname(
  uid: string,
  { locale, document }: { locale?: string; document: any }
): string | null {
  const slug = document?.slug;
  const localePrefix = `/${locale ?? DEFAULT_LOCALE}`;

  switch (uid) {
    case 'api::course.course':
      return slug ? `${localePrefix}/egitimler/${slug}` : null;
    case 'api::event.event':
      return slug ? `${localePrefix}/etkinlikler/${slug}` : null;
    case 'api::blog-post.blog-post':
      return slug ? `${localePrefix}/blog-yazilari/${slug}` : null;
    case 'api::teacher.teacher':
      return slug ? `${localePrefix}/egitmenler/${slug}` : null;
    case 'api::news-post.news-post':
      return slug ? `${localePrefix}/haberler/${slug}` : null;
    default:
      return null;
  }
}

const config = (): Core.Config.Admin => {
  const configManager = BackendConfigManager.process();
  const { adminJwtSecret, apiTokenSalt, transferTokenSalt, encryptionKey } = configManager.getAdminSecrets();
  const { nps, promoteEE } = configManager.getAdminFlags();
  const previewConfig = configManager.getPreviewConfig();

  return {
    auth: {
      secret: adminJwtSecret,
    },
    apiToken: {
      salt: apiTokenSalt,
    },
    transfer: {
      token: {
        salt: transferTokenSalt,
      },
    },
    secrets: {
      encryptionKey,
    },
    flags: {
      nps,
      promoteEE,
    },
    preview: {
      enabled: true,
      config: {
        allowedOrigins: [previewConfig.clientUrl],
        handler: async (uid, { documentId, locale, status }) => {
          const previewStatus = status ?? 'draft';

          if (!previewConfig.previewSecret) {
            return null;
          }

          const document = await strapi.documents(uid as any).findOne({
            documentId,
          });

          const pathname = getPreviewPathname(uid, { locale, document });

          if (!pathname) {
            return null;
          }

          const urlSearchParams = new URLSearchParams({
            url: pathname,
            secret: previewConfig.previewSecret,
            status: previewStatus,
          });

          return new URL(`/api/preview?${urlSearchParams}`, previewConfig.clientUrl).toString();
        },
      },
    },
  };
};

export default config;
