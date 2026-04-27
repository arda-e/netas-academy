import { loadSplCheckConfig, resolveSplCheckConfig } from "./config";
import { buildSplCheckRequestXml } from "./xml";
import { runSapSoapSplCheck } from "./sap-soap-adapter";
import type { SplCheckRequest, SplCheckResult } from "./types";

type RunSplCheckDependencies = {
  config?: ReturnType<typeof loadSplCheckConfig>;
  fetchImpl?: typeof fetch;
};

export async function runSplCheck(
  request: SplCheckRequest,
  dependencies: RunSplCheckDependencies = {},
): Promise<SplCheckResult> {
  const config = dependencies.config ?? null;

  if (!config) {
    const resolvedConfig = resolveSplCheckConfig();

    if (resolvedConfig.configured === false) {
      return {
        provider: "sap_soap",
        decision: "manual_review",
        statusCode: null,
        rawResponse: null,
        errorReason: resolvedConfig.errorReason,
      };
    }

    return runSplCheck(request, {
      ...dependencies,
      config: resolvedConfig.config,
    });
  }

  const requestXml = buildSplCheckRequestXml(request);

  return runSapSoapSplCheck({
    endpoint: config.endpoint,
    requestXml,
    timeoutMs: config.timeoutMs,
    soapAction: config.soapAction,
    fetchImpl: dependencies.fetchImpl,
  });
}
