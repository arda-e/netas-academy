import { parseConfigSnapshot, type ConfigSnapshot } from './env.schema';
import { toAllowedSource } from './env-utils';

type UploadConfig = {
  provider: string;
  providerOptions?: {
    baseUrl?: string;
    rootPath?: string;
    s3Options?: {
      credentials: {
        accessKeyId: string;
        secretAccessKey: string;
      };
      endpoint: string;
      region: string;
      forcePathStyle: boolean;
      params: {
        ACL: string;
        signedUrlExpires: number;
        Bucket: string;
      };
    };
  };
  actionOptions: Record<string, unknown>;
};

type EmailConfig = {
  provider: string;
  providerOptions: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  settings: {
    defaultFrom: string;
    defaultReplyTo: string;
  };
};

type PreviewConfig = {
  clientUrl: string;
  previewSecret: string | null;
};

type RevalidationConfig = {
  frontendUrl: string;
  revalidationSecret: string;
};

type AdminSecrets = {
  adminJwtSecret: string;
  apiTokenSalt: string;
  transferTokenSalt: string;
  encryptionKey: string;
};

type AdminFlags = {
  nps: boolean;
  promoteEE: boolean;
};

const localUploadConfig: UploadConfig = {
  provider: 'local',
  actionOptions: {
    upload: {},
    uploadStream: {},
    delete: {},
  },
};

export class BackendConfigManager {
  private static instance: BackendConfigManager | null = null;

  private constructor(private readonly snapshot: ConfigSnapshot) {}

  static process() {
    if (!BackendConfigManager.instance) {
      BackendConfigManager.instance = new BackendConfigManager(parseConfigSnapshot());
    }

    return BackendConfigManager.instance;
  }

  getAdminSecrets(): AdminSecrets {
    return {
      adminJwtSecret: this.snapshot.ADMIN_JWT_SECRET,
      apiTokenSalt: this.snapshot.API_TOKEN_SALT,
      transferTokenSalt: this.snapshot.TRANSFER_TOKEN_SALT,
      encryptionKey: this.snapshot.ENCRYPTION_KEY,
    };
  }

  getAdminFlags(): AdminFlags {
    return {
      nps: this.snapshot.FLAG_NPS,
      promoteEE: this.snapshot.FLAG_PROMOTE_EE,
    };
  }

  getAllowedMediaSources(): string[] {
    return [
      "'self'",
      'data:',
      'blob:',
      toAllowedSource(this.snapshot.B2_PUBLIC_URL),
      toAllowedSource(this.getB2Endpoint()),
    ].filter((value): value is string => Boolean(value));
  }

  getUploadConfig(): UploadConfig {
    if (this.snapshot.UPLOAD_PROVIDER === 'aws-s3') {
      return {
        provider: 'aws-s3',
        providerOptions: {
          ...(this.snapshot.B2_PUBLIC_URL ? { baseUrl: this.snapshot.B2_PUBLIC_URL } : {}),
          rootPath: this.snapshot.B2_ROOT_PATH,
          s3Options: {
            credentials: {
              accessKeyId: this.snapshot.B2_APPLICATION_KEY_ID,
              secretAccessKey: this.snapshot.B2_APPLICATION_KEY,
            },
            endpoint: this.getB2Endpoint(),
            region: this.snapshot.B2_REGION,
            forcePathStyle: this.snapshot.B2_FORCE_PATH_STYLE,
            params: {
              ACL: this.snapshot.B2_ACL,
              signedUrlExpires: this.snapshot.B2_SIGNED_URL_EXPIRES,
              Bucket: this.snapshot.B2_BUCKET,
            },
          },
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      };
    }

    return localUploadConfig;
  }

  getEmailConfig(): EmailConfig {
    return {
      provider: this.snapshot.EMAIL_PROVIDER,
      providerOptions: {
        host: this.snapshot.EMAIL_SMTP_HOST,
        port: this.snapshot.EMAIL_SMTP_PORT,
        secure: this.snapshot.EMAIL_SMTP_SECURE,
        auth: {
          user: this.snapshot.EMAIL_SMTP_USER,
          pass: this.snapshot.EMAIL_SMTP_PASS,
        },
      },
      settings: {
        defaultFrom: this.snapshot.EMAIL_DEFAULT_FROM,
        defaultReplyTo: this.snapshot.EMAIL_DEFAULT_REPLY_TO,
      },
    };
  }

  getPreviewConfig(): PreviewConfig {
    return {
      clientUrl: this.snapshot.CLIENT_URL,
      previewSecret: this.snapshot.PREVIEW_SECRET || null,
    };
  }

  getRevalidationConfig(): RevalidationConfig {
    return {
      frontendUrl: this.snapshot.FRONTEND_URL,
      revalidationSecret: this.snapshot.REVALIDATION_SECRET,
    };
  }

  private getB2Endpoint(): string {
    return this.snapshot.B2_ENDPOINT || `https://s3.${this.snapshot.B2_REGION}.backblazeb2.com`;
  }
}

