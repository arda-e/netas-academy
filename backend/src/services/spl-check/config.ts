export type SplCheckConfig = {
  endpoint: string;
  timeoutMs: number;
  soapAction?: string | null;
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

