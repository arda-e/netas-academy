import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const s3Bucket = env('AWS_BUCKET');
  const s3AccessKeyId = env('AWS_ACCESS_KEY_ID');
  const s3SecretAccessKey = env('AWS_ACCESS_SECRET', env('AWS_SECRET_ACCESS_KEY'));
  const s3Region = env('AWS_REGION');

  const upload =
    s3Bucket && s3AccessKeyId && s3SecretAccessKey && s3Region
      ? {
          upload: {
            config: {
              provider: 'aws-s3',
              providerOptions: {
                baseUrl: env('MEDIA_PUBLIC_URL'),
                rootPath: env('MEDIA_ROOT_PATH', 'uploads'),
                s3Options: {
                  credentials: {
                    accessKeyId: s3AccessKeyId,
                    secretAccessKey: s3SecretAccessKey,
                  },
                  region: s3Region,
                  params: {
                    ACL: env('AWS_ACL', 'public-read'),
                    Bucket: s3Bucket,
                    CacheControl: env('AWS_CACHE_CONTROL', 'public, max-age=31536000, immutable'),
                    signedUrlExpires: env.int('AWS_SIGNED_URL_EXPIRES', 15 * 60),
                  },
                },
              },
              actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
              },
            },
          },
        }
      : {};

  return {
    ...upload,
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
