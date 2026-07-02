import { randomUUID } from "node:crypto";

import { loadIyzicoConfig } from "./iyzico/config";
import { createIyzicoCheckoutClient } from "./iyzico/client";
import { verifyIyzicoWebhookSignature } from "./iyzico/signature";
import type { IyzicoSignatureVerificationResult } from "./iyzico/signature";
import { completeParentPayment } from "./parent-adapters";
import type {
  PaymentCheckoutRequest,
  PaymentHandoff,
  PaymentParentDescriptor,
  PaymentPayerSnapshot,
  ProviderPaymentResult,
} from "./types";

type PaymentOrchestrationDependencies = {
  strapiInstance?: any;
  checkoutClient?: ReturnType<typeof createIyzicoCheckoutClient>;
  loadConfig?: typeof loadIyzicoConfig;
  randomId?: () => string;
  now?: () => Date;
  completeParent?: typeof completeParentPayment;
};

type RejectedIyzicoSignature = Extract<IyzicoSignatureVerificationResult, { valid: false }>;

export type CreateCheckoutHandoffInput = {
  parent: PaymentParentDescriptor;
  amountMinor: number;
  currency?: string;
  payer: PaymentPayerSnapshot;
  title: string;
  idempotencyKey: string;
  retryOfAttemptReference?: string | null;
  callbackUrl?: string | null;
};

type AttemptRecord = {
  id: number;
  attemptReference: string;
  parentType: PaymentParentDescriptor["parentType"];
  parentEntityId: number;
  parentDocumentId?: string | null;
  status: string;
  providerToken?: string | null;
  providerConversationId?: string | null;
  frontendPresentationSnapshot?: any;
  providerSafeSnapshot?: any;
};

function makeAttemptReference(randomId: () => string = randomUUID) {
  return `pay_${randomId().replace(/-/g, "").slice(0, 24)}`;
}

function toAttemptParent(attempt: AttemptRecord): PaymentParentDescriptor {
  return {
    parentType: attempt.parentType,
    parentEntityId: attempt.parentEntityId,
    parentDocumentId: attempt.parentDocumentId ?? null,
  };
}

function getStrapi(dependencies: PaymentOrchestrationDependencies) {
  return dependencies.strapiInstance ?? strapi;
}

function toPaymentUnavailable(attemptReference: string, message = "Ödeme geçici olarak başlatılamadı. Lütfen tekrar deneyin."): PaymentHandoff {
  return {
    attemptReference,
    status: "payment_unavailable",
    provider: "iyzico",
    error: {
      code: "payment_unavailable",
      message,
    },
  };
}

function toRetrySafeSnapshot(input: CreateCheckoutHandoffInput) {
  return {
    title: input.title,
    payer: {
      firstName: input.payer.firstName,
      lastName: input.payer.lastName ?? null,
      email: input.payer.email,
      phone: input.payer.phone ?? null,
      registrationAddress: input.payer.registrationAddress ?? null,
      city: input.payer.city ?? null,
      country: input.payer.country ?? null,
    },
  };
}

export async function createCheckoutHandoff(
  input: CreateCheckoutHandoffInput,
  dependencies: PaymentOrchestrationDependencies = {},
): Promise<PaymentHandoff> {
  const strapiRef = getStrapi(dependencies);
  const now = dependencies.now ?? (() => new Date());
  const attemptReference = makeAttemptReference(dependencies.randomId);
  const currency = input.currency ?? "TRY";
  const attemptQuery = strapiRef.db.query("api::payment-attempt.payment-attempt");

  const attempt = await attemptQuery.create({
    data: {
      attemptReference,
      parentType: input.parent.parentType,
      parentEntityId: input.parent.parentEntityId,
      parentDocumentId: input.parent.parentDocumentId ?? null,
      idempotencyKey: input.idempotencyKey,
      provider: "iyzico",
      amountMinor: input.amountMinor,
      currency,
      status: "created",
      retryOfAttemptReference: input.retryOfAttemptReference ?? null,
      providerSafeSnapshot: toRetrySafeSnapshot(input),
    },
  });

  try {
    const config = dependencies.loadConfig?.() ?? loadIyzicoConfig();
    const checkoutClient = dependencies.checkoutClient ?? createIyzicoCheckoutClient(config);
    const checkoutRequest: PaymentCheckoutRequest = {
      attemptReference,
      conversationId: attemptReference,
      amountMinor: input.amountMinor,
      currency,
      basketId: `${input.parent.parentType}:${input.parent.parentEntityId}`,
      title: input.title,
      callbackUrl: input.callbackUrl ?? config.callbackUrl,
      payer: input.payer,
    };
    const initialized = await checkoutClient.initializeCheckoutForm(checkoutRequest);

    await attemptQuery.update({
      where: { id: attempt.id },
      data: {
        status: "checkout_created",
        providerToken: initialized.token,
        providerConversationId: attemptReference,
        frontendPresentationSnapshot: initialized.presentation,
        providerSafeSnapshot: {
          ...initialized.providerSafeSnapshot,
          ...toRetrySafeSnapshot(input),
        },
      },
    });

    return {
      attemptReference,
      status: "checkout_created",
      provider: "iyzico",
      presentation: initialized.presentation,
    };
  } catch (error) {
    await attemptQuery.update({
      where: { id: attempt.id },
      data: {
        status: "failed",
        completedAt: now().toISOString(),
        failureReason: error instanceof Error ? error.message : "payment_unavailable",
      },
    });
    strapiRef.log?.error?.("Payment checkout handoff creation failed", {
      attemptReference,
      parentType: input.parent.parentType,
      parentEntityId: input.parent.parentEntityId,
      error,
    });
    return toPaymentUnavailable(attemptReference);
  }
}

export async function retryCheckoutHandoff(
  attemptReference: string,
  dependencies: PaymentOrchestrationDependencies = {},
): Promise<PaymentHandoff> {
  const strapiRef = getStrapi(dependencies);
  const previousAttempt = await strapiRef.db.query("api::payment-attempt.payment-attempt").findOne({
    where: { attemptReference },
  });

  if (!previousAttempt) {
    throw new Error("payment_attempt_not_found");
  }
  if (previousAttempt.status === "paid") {
    throw new Error("payment_attempt_already_paid");
  }

  return createCheckoutHandoff(
    {
      parent: toAttemptParent(previousAttempt),
      amountMinor: previousAttempt.amountMinor,
      currency: previousAttempt.currency,
      payer: previousAttempt.providerSafeSnapshot?.payer ?? {
        firstName: "Netas",
        lastName: "Academy",
        email: "payments@netasacademy.com",
      },
      title: previousAttempt.providerSafeSnapshot?.title ?? "Netas Academy",
      idempotencyKey: `${previousAttempt.idempotencyKey}:retry:${Date.now()}`,
      retryOfAttemptReference: previousAttempt.attemptReference,
    },
    dependencies,
  );
}

async function recordProviderEvent(input: {
  eventIdentity: string;
  eventType: "callback" | "webhook";
  attemptReference?: string | null;
  providerToken?: string | null;
  status: "accepted" | "rejected";
  signatureValid: boolean;
  signatureMetadata?: Record<string, unknown>;
  providerSafePayload?: Record<string, unknown>;
  failureReason?: string | null;
}, dependencies: PaymentOrchestrationDependencies) {
  const strapiRef = getStrapi(dependencies);
  const eventQuery = strapiRef.db.query("api::payment-provider-event.payment-provider-event");
  const existing = await eventQuery.findOne?.({ where: { eventIdentity: input.eventIdentity } });

  if (existing) {
    return { ...existing, duplicate: true };
  }

  return eventQuery.create({
    data: {
      provider: "iyzico",
      eventIdentity: input.eventIdentity,
      eventType: input.eventType,
      attemptReference: input.attemptReference ?? null,
      providerToken: input.providerToken ?? null,
      status: input.status,
      signatureValid: input.signatureValid,
      signatureMetadata: input.signatureMetadata ?? null,
      providerSafePayload: input.providerSafePayload ?? null,
      processedAt: new Date().toISOString(),
      failureReason: input.failureReason ?? null,
    },
  });
}

export async function finalizeAttemptFromProviderResult(
  result: ProviderPaymentResult,
  eventType: "callback" | "webhook",
  eventIdentity: string,
  dependencies: PaymentOrchestrationDependencies = {},
) {
  const strapiRef = getStrapi(dependencies);
  const attemptQuery = strapiRef.db.query("api::payment-attempt.payment-attempt");
  const attempt = await attemptQuery.findOne({ where: { providerToken: result.providerToken } });

  if (!attempt) {
    throw new Error("payment_attempt_not_found");
  }

  const providerEvent = await recordProviderEvent(
    {
      eventIdentity,
      eventType,
      attemptReference: attempt.attemptReference,
      providerToken: result.providerToken,
      status: "accepted",
      signatureValid: eventType === "callback" ? true : true,
      providerSafePayload: result.rawSafePayload,
    },
    dependencies,
  );

  if (providerEvent.duplicate || attempt.status === "paid") {
    return { attemptReference: attempt.attemptReference, status: attempt.status, duplicate: true };
  }

  const nextStatus = result.status === "paid" ? "paid" : result.status === "cancelled" ? "cancelled" : "failed";
  await attemptQuery.update({
    where: { id: attempt.id },
    data: {
      status: nextStatus,
      completedAt: new Date().toISOString(),
      providerSafeSnapshot: {
        ...(attempt.providerSafeSnapshot ?? {}),
        result: result.rawSafePayload ?? null,
      },
      failureReason: result.failureReason ?? null,
    },
  });

  if (nextStatus === "paid") {
    await (dependencies.completeParent ?? completeParentPayment)(toAttemptParent(attempt), result, { strapiInstance: strapiRef });
  }

  return { attemptReference: attempt.attemptReference, status: nextStatus, duplicate: false };
}

export async function handleCallbackResult(
  token: string,
  dependencies: PaymentOrchestrationDependencies = {},
) {
  const config = dependencies.loadConfig?.() ?? loadIyzicoConfig();
  const checkoutClient = dependencies.checkoutClient ?? createIyzicoCheckoutClient(config);
  const result = await checkoutClient.retrieveCheckoutFormResult(token);

  return finalizeAttemptFromProviderResult(result, "callback", `iyzico:callback:${token}:${result.paymentId ?? result.status}`, dependencies);
}

export async function handleWebhookEvent(input: {
  rawPayload: string;
  signature?: string | null;
  keyId?: string | null;
}, dependencies: PaymentOrchestrationDependencies = {}) {
  const config = dependencies.loadConfig?.() ?? loadIyzicoConfig();
  const verification = verifyIyzicoWebhookSignature({
    payload: input.rawPayload,
    signature: input.signature,
    secret: config.webhookSecret,
    keyId: input.keyId,
  });
  const parsed = JSON.parse(input.rawPayload || "{}") as Record<string, any>;
  const token = parsed.token || parsed.iyziEventId || parsed.paymentConversationId;
  const eventIdentity = `iyzico:webhook:${parsed.iyziEventId ?? token ?? randomUUID()}`;

  if (!verification.valid) {
    const rejectedVerification = verification as RejectedIyzicoSignature;
    const failureReason = rejectedVerification.reason;
    await recordProviderEvent(
      {
        eventIdentity,
        eventType: "webhook",
        providerToken: token,
        status: "rejected",
        signatureValid: false,
        signatureMetadata: verification.metadata,
        providerSafePayload: { token, status: parsed.status },
        failureReason,
      },
      dependencies,
    );
    return { accepted: false, reason: failureReason };
  }

  if (!token) {
    await recordProviderEvent(
      {
        eventIdentity,
        eventType: "webhook",
        status: "rejected",
        signatureValid: true,
        signatureMetadata: verification.metadata,
        providerSafePayload: { status: parsed.status },
        failureReason: "missing_provider_token",
      },
      dependencies,
    );
    return { accepted: false, reason: "missing_provider_token" };
  }

  const checkoutClient = dependencies.checkoutClient ?? createIyzicoCheckoutClient(config);
  const result = await checkoutClient.retrieveCheckoutFormResult(token);
  const finalized = await finalizeAttemptFromProviderResult(result, "webhook", eventIdentity, dependencies);

  return { accepted: true, ...finalized };
}
