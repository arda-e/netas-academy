import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  email: {
    config: {
      provider: env('EMAIL_PROVIDER', 'sendmail'),
      providerOptions: {},
      settings: {
        defaultFrom: env('EMAIL_DEFAULT_FROM', 'Netas Academy <no-reply@netas-academy.local>'),
        defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'support@netas-academy.local'),
        testAddress: env('EMAIL_TEST_ADDRESS', 'test@netas-academy.local'),
      },
    },
  },
});

export default config;
