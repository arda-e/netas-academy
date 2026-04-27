export type SplCheckConfig = {
  endpoint: string;
  timeoutMs: number;
  soapAction?: string | null;
};

export type SplCheckConfigResult =
  | {
      configured: true;
      config: SplCheckConfig;
    }
  | {
      configured: false;
      errorReason: string;
    };

export function loadSplCheckConfig(env: NodeJS.ProcessEnv = process.env): SplCheckConfig {
  const endpoint = env.SPL_CHECK_ENDPOINT ?? env.SAP_SOAP_ENDPOINT ?? "";

  if (!endpoint.trim()) {
    throw new Error("SPL check endpoint is not configured");
  }

  return {
    endpoint: endpoint.trim(),
    timeoutMs: Number(env.SPL_CHECK_TIMEOUT_MS ?? "15000"),
    soapAction: env.SPL_CHECK_SOAP_ACTION ?? null,
  };
}

export function resolveSplCheckConfig(env: NodeJS.ProcessEnv = process.env): SplCheckConfigResult {
  try {
    return {
      configured: true,
      config: loadSplCheckConfig(env),
    };
  } catch (error) {
    return {
      configured: false,
      errorReason: error instanceof Error ? error.message : "SPL check configuration failed",
    };
  }
}
