import { handleCallbackResult, handleWebhookEvent, retryCheckoutHandoff } from "../../../services/payment-orchestration/service";

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

    ctx.body = await handleCallbackResult(token);
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
