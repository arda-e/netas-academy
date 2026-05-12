import type { Core } from '@strapi/strapi';

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
    default:
      return null;
  }
}

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: (() => {
        return [env('CLIENT_URL', 'http://localhost:3000')];
      })(),
      handler: async (uid, { documentId, locale, status }) => {
        const clientUrl = env('CLIENT_URL', 'http://localhost:3000');
        const previewSecret = env('PREVIEW_SECRET');
        const previewStatus = status ?? 'draft';

        if (!previewSecret) {
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
          secret: previewSecret,
          status: previewStatus,
        });

        return new URL(`/api/preview?${urlSearchParams}`, clientUrl).toString();
      },
    },
  },
});

export default config;
