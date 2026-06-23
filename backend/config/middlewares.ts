import type { Core } from '@strapi/strapi';
import { BackendConfigManager } from '../src/config/env';

const config = (): Core.Config.Middlewares => {
  const allowedMediaSources = BackendConfigManager.process().getAllowedMediaSources();

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'img-src': allowedMediaSources,
            'media-src': allowedMediaSources,
          },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'global::rate-limiter',
    'strapi::public',
  ];
};

export default config;
