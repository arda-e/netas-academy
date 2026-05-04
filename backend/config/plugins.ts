import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  const uploadProvider = env('UPLOAD_PROVIDER', 'local');
  const s3Bucket = env('AWS_BUCKET');
  const s3AccessKeyId = env('AWS_ACCESS_KEY_ID');
  const s3SecretAccessKey = env('AWS_ACCESS_SECRET', env('AWS_SECRET_ACCESS_KEY'));
  const s3Region = env('AWS_REGION');

  const upload =
    uploadProvider === 'aws-s3' && s3Bucket && s3AccessKeyId && s3SecretAccessKey && s3Region
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
        provider: env('EMAIL_PROVIDER', 'sendmail'),
        providerOptions: {},
        settings: {
          defaultFrom: env('EMAIL_DEFAULT_FROM', 'Netas Academy <no-reply@netas-academy.local>'),
          defaultReplyTo: env('EMAIL_DEFAULT_REPLY_TO', 'support@netas-academy.local'),
          testAddress: env('EMAIL_TEST_ADDRESS', 'test@netas-academy.local'),
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
  };
};

export default config;
