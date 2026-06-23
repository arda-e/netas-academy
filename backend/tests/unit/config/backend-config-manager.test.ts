import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const VALID_ENV = {
  ADMIN_JWT_SECRET: 'admin-secret',
  API_TOKEN_SALT: 'api-token-salt',
  TRANSFER_TOKEN_SALT: 'transfer-token-salt',
  ENCRYPTION_KEY: 'encryption-key',
  CLIENT_URL: 'https://cms.example.com',
  PREVIEW_SECRET: 'preview-secret',
  FRONTEND_URL: 'https://frontend.example.com',
  REVALIDATION_SECRET: 'revalidation-secret',
  UPLOAD_PROVIDER: 'aws-s3',
  B2_REGION: 'us-west-004',
  B2_PUBLIC_URL: 'https://f000.backblazeb2.com/file/netas-academy',
  B2_BUCKET: 'netas-academy',
  B2_APPLICATION_KEY_ID: 'key-id',
  B2_APPLICATION_KEY: 'key-secret',
  B2_ROOT_PATH: 'uploads',
  B2_ACL: 'public-read',
  B2_FORCE_PATH_STYLE: 'false',
  B2_SIGNED_URL_EXPIRES: '900',
  EMAIL_PROVIDER: 'nodemailer',
  EMAIL_SMTP_HOST: 'smtp-relay.brevo.com',
  EMAIL_SMTP_PORT: '587',
  EMAIL_SMTP_SECURE: 'true',
  EMAIL_SMTP_USER: 'smtp-user',
  EMAIL_SMTP_PASS: 'smtp-pass',
  EMAIL_DEFAULT_FROM: 'Netas Academy <no-reply@netas-academy.local>',
  EMAIL_DEFAULT_REPLY_TO: 'support@netas-academy.local',
  FLAG_NPS: 'false',
  FLAG_PROMOTE_EE: 'true',
};

describe('BackendConfigManager', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function loadManager() {
    const { BackendConfigManager } = await import('../../../src/config/backend-config-manager');
    return BackendConfigManager.process();
  }

  it('parses env once and exposes derived config getters', async () => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      vi.stubEnv(key, value);
    }

    const manager = await loadManager();

    expect(manager).toBe(await loadManager());
    expect(manager.getAdminSecrets()).toEqual({
      adminJwtSecret: 'admin-secret',
      apiTokenSalt: 'api-token-salt',
      transferTokenSalt: 'transfer-token-salt',
      encryptionKey: 'encryption-key',
    });
    expect(manager.getAdminFlags()).toEqual({
      nps: false,
      promoteEE: true,
    });
    expect(manager.getPreviewConfig()).toEqual({
      clientUrl: 'https://cms.example.com',
      previewSecret: 'preview-secret',
    });
    expect(manager.getRevalidationConfig()).toEqual({
      frontendUrl: 'https://frontend.example.com',
      revalidationSecret: 'revalidation-secret',
    });
    expect(manager.getAllowedMediaSources()).toEqual([
      "'self'",
      'data:',
      'blob:',
      'https://f000.backblazeb2.com',
      'https://s3.us-west-004.backblazeb2.com',
    ]);
    expect(manager.getUploadConfig()).toEqual({
      provider: 'aws-s3',
      providerOptions: {
        baseUrl: 'https://f000.backblazeb2.com/file/netas-academy',
        rootPath: 'uploads',
        s3Options: {
          credentials: {
            accessKeyId: 'key-id',
            secretAccessKey: 'key-secret',
          },
          endpoint: 'https://s3.us-west-004.backblazeb2.com',
          region: 'us-west-004',
          forcePathStyle: false,
          params: {
            ACL: 'public-read',
            signedUrlExpires: 900,
            Bucket: 'netas-academy',
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    });
    expect(manager.getEmailConfig()).toEqual({
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: true,
        auth: {
          user: 'smtp-user',
          pass: 'smtp-pass',
        },
      },
      settings: {
        defaultFrom: 'Netas Academy <no-reply@netas-academy.local>',
        defaultReplyTo: 'support@netas-academy.local',
      },
    });
  });

  it('throws immediately when required secrets are missing', async () => {
    for (const [key, value] of Object.entries(VALID_ENV)) {
      vi.stubEnv(key, value);
    }
    vi.stubEnv('ADMIN_JWT_SECRET', '');

    await expect(loadManager()).rejects.toThrow(/ADMIN_JWT_SECRET/);
  });
});

