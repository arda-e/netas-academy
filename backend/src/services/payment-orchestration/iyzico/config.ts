export type IyzicoEnvironment = "sandbox" | "live";

export type IyzicoConfig = {
  environment: IyzicoEnvironment;
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  callbackUrl: string;
  webhookSecret: string;
};

const SANDBOX_BASE_URL = "https://sandbox-api.iyzipay.com";
const LIVE_BASE_URL = "https://api.iyzipay.com";

export class IyzicoConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IyzicoConfigurationError";
  }
}

function readRequiredEnv(env: NodeJS.ProcessEnv, key: string) {
  const value = env[key]?.trim();
  if (!value) {
    throw new IyzicoConfigurationError(`${key} is required for iyzico payment initialization`);
  }
  return value;
}

export function resolveIyzicoEnvironment(value = process.env.IYZICO_ENVIRONMENT): IyzicoEnvironment {
  return value === "live" ? "live" : "sandbox";
}

export function loadIyzicoConfig(env: NodeJS.ProcessEnv = process.env): IyzicoConfig {
  const environment = resolveIyzicoEnvironment(env.IYZICO_ENVIRONMENT);
  const defaultBaseUrl = environment === "live" ? LIVE_BASE_URL : SANDBOX_BASE_URL;

  return {
    environment,
    apiKey: readRequiredEnv(env, "IYZICO_API_KEY"),
    secretKey: readRequiredEnv(env, "IYZICO_SECRET_KEY"),
    baseUrl: env.IYZICO_BASE_URL?.trim() || defaultBaseUrl,
    callbackUrl: readRequiredEnv(env, "IYZICO_CALLBACK_URL"),
    webhookSecret: env.IYZICO_WEBHOOK_SECRET?.trim() || readRequiredEnv(env, "IYZICO_SECRET_KEY"),
  };
}
