import { z } from 'zod';
import { boolFromEnv, intFromEnv, urlOrEmpty } from './env-utils';

export const configSchema = z
  .object({
    ADMIN_JWT_SECRET: z.string().min(1, 'ADMIN_JWT_SECRET is required'),
    API_TOKEN_SALT: z.string().min(1, 'API_TOKEN_SALT is required'),
    TRANSFER_TOKEN_SALT: z.string().min(1, 'TRANSFER_TOKEN_SALT is required'),
    ENCRYPTION_KEY: z.string().min(1, 'ENCRYPTION_KEY is required'),
    CLIENT_URL: z.string().url().default('http://localhost:3000'),
    PREVIEW_SECRET: z.string().default(''),
    FRONTEND_URL: z.string().url().default('http://127.0.0.1:3000'),
    REVALIDATION_SECRET: z.string().default(''),
    UPLOAD_PROVIDER: z.enum(['local', 'aws-s3']).default('local'),
    B2_REGION: z.string().min(1).default('us-west-004'),
    B2_ENDPOINT: urlOrEmpty().default(''),
    B2_PUBLIC_URL: urlOrEmpty().default(''),
    B2_BUCKET: z.string().default(''),
    B2_APPLICATION_KEY_ID: z.string().default(''),
    B2_APPLICATION_KEY: z.string().default(''),
    B2_ROOT_PATH: z.string().min(1).default('uploads'),
    B2_ACL: z.string().min(1).default('public-read'),
    B2_FORCE_PATH_STYLE: boolFromEnv(true),
    B2_SIGNED_URL_EXPIRES: intFromEnv(15 * 60),
    EMAIL_PROVIDER: z.string().min(1).default('nodemailer'),
    EMAIL_SMTP_HOST: z.string().min(1).default('smtp-relay.brevo.com'),
    EMAIL_SMTP_PORT: intFromEnv(587),
    EMAIL_SMTP_SECURE: boolFromEnv(false),
    EMAIL_SMTP_USER: z.string().min(1),
    EMAIL_SMTP_PASS: z.string().min(1),
    EMAIL_DEFAULT_FROM: z.string().min(1).default('Netas Academy <no-reply@netas-academy.local>'),
    EMAIL_DEFAULT_REPLY_TO: z.string().min(1).default('support@netas-academy.local'),
    FLAG_NPS: boolFromEnv(true),
    FLAG_PROMOTE_EE: boolFromEnv(true),
  })
  .superRefine((value, ctx) => {
    if (value.UPLOAD_PROVIDER === 'aws-s3') {
      const requiredB2Fields = [
        ['B2_BUCKET', value.B2_BUCKET],
        ['B2_APPLICATION_KEY_ID', value.B2_APPLICATION_KEY_ID],
        ['B2_APPLICATION_KEY', value.B2_APPLICATION_KEY],
      ] as const;

      for (const [field, currentValue] of requiredB2Fields) {
        if (!currentValue) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required when UPLOAD_PROVIDER=aws-s3`,
          });
        }
      }
    }
  });

export type ConfigSnapshot = z.infer<typeof configSchema>;

export function parseConfigSnapshot(env: NodeJS.ProcessEnv = process.env): ConfigSnapshot {
  return configSchema.parse(env);
}

