import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  return {
    upload: {
      config: {
        provider: 'local',
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
    email: {
      config: {
        provider: env('EMAIL_PROVIDER', 'nodemailer'),
        providerOptions: {
          host: env('EMAIL_SMTP_HOST', 'smtp-relay.brevo.com'),
          port: env.int('EMAIL_SMTP_PORT', 587),
          secure: env.bool('EMAIL_SMTP_SECURE', false),
          auth: {
            user: env('EMAIL_SMTP_USER'),
            pass: env('EMAIL_SMTP_PASS'),
          },
        },
        settings: {
          defaultFrom: env('EMAIL_DEFAULT_FROM', 'Netas Academy <no-reply@netas-academy.local>'),
          defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'support@netas-academy.local'),
        },
      },
    },
    'csv-exporter': {
      enabled: true,
      config: {},
    },
    'internal-notifications': {
      enabled: true,
      resolve: './src/plugins/internal-notifications',
      config: {},
    },
    'iletisim-merkezi': {
      enabled: true,
      resolve: './src/plugins/iletisim-merkezi',
      config: {},
    },
  };
};

export default config;
