import { handleCallbackResult, handleWebhookEvent, retryCheckoutHandoff } from "../../../services/payment-orchestration/service";

const DEFAULT_FRONTEND_BASE_URL = "http://localhost:3000";
const DEFAULT_PAYMENT_RESULT_PATH = "/odeme-sonucu";

type CallbackResult = Awaited<ReturnType<typeof handleCallbackResult>>;

function normalizeBaseUrl(value?: string | null) {
  return (value?.trim() || DEFAULT_FRONTEND_BASE_URL).replace(/\/+$/, "");
}

export function buildPaymentResultRedirectUrl(result: CallbackResult, env: NodeJS.ProcessEnv = process.env) {
  const url = new URL(
    DEFAULT_PAYMENT_RESULT_PATH,
    normalizeBaseUrl(env.NEXT_PUBLIC_SITE_URL ?? env.CLIENT_URL ?? env.FRONTEND_URL),
  );

  url.searchParams.set("attemptReference", result.attemptReference);
  url.searchParams.set("status", result.status);

  if (result.duplicate) {
    url.searchParams.set("duplicate", "true");
  }

  return url.toString();
}

export default {
  async retry(ctx) {
    const attemptReference = ctx.params?.attemptReference;
    if (!attemptReference) {
      ctx.status = 400;
      ctx.body = { error: { message: "attemptReference is required" } };
      return;
    }

    ctx.body = await retryCheckoutHandoff(attemptReference);
  },

  async iyzicoCallback(ctx) {
    const token = ctx.request.body?.token ?? ctx.query?.token;
    if (!token) {
      ctx.status = 400;
      ctx.body = { error: { message: "token is required" } };
      return;
    }

    const result = await handleCallbackResult(token);
    const redirectUrl = buildPaymentResultRedirectUrl(result);

    ctx.status = 303;
    ctx.set?.("Location", redirectUrl);
    if (typeof ctx.redirect === "function") {
      ctx.redirect(redirectUrl);
      ctx.status = 303;
    }
    ctx.body = { ...result, redirectUrl };
  },

  async iyzicoWebhook(ctx) {
    const rawPayload =
      typeof ctx.request.rawBody === "string" ? ctx.request.rawBody : JSON.stringify(ctx.request.body ?? {});
    const signature =
      ctx.request.headers["x-iyzi-signature"] ??
      ctx.request.headers["x-iyzico-signature"] ??
      ctx.request.headers["iyzico-signature"];

    const result = await handleWebhookEvent({
      rawPayload,
      signature: Array.isArray(signature) ? signature[0] : signature,
      keyId: ctx.request.headers["x-iyzi-key-id"],
    });

    ctx.status = result.accepted ? 200 : 400;
    ctx.body = result;
  },
};
