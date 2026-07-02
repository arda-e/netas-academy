import { createHmac, randomUUID } from "node:crypto";

import type { PaymentCheckoutRequest, PaymentPresentation, ProviderPaymentResult } from "../types";
import type { IyzicoConfig } from "./config";

type IyzicoClientDependencies = {
  fetchImpl?: typeof fetch;
  now?: () => Date;
  randomId?: () => string;
};

type IyzicoResponse = {
  status?: string;
  errorCode?: string;
  errorMessage?: string;
  token?: string;
  checkoutFormContent?: string;
  paymentPageUrl?: string;
  paymentStatus?: string;
  paymentId?: string;
  conversationId?: string;
};

function toMajorAmount(amountMinor: number) {
  return (amountMinor / 100).toFixed(2);
}

function makeAuthorizationHeader(input: {
  apiKey: string;
  secretKey: string;
  randomString: string;
  uri: string;
  body: string;
}) {
  const signature = createHmac("sha256", input.secretKey)
    .update(input.randomString + input.uri + input.body, "utf8")
    .digest("hex");

  return `IYZWSv2 ${Buffer.from(`apiKey:${input.apiKey}&randomKey:${input.randomString}&signature:${signature}`).toString(
    "base64",
  )}`;
}

function buildHeaders(config: IyzicoConfig, uri: string, body: string, randomString: string) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-iyzi-rnd": randomString,
    Authorization: makeAuthorizationHeader({
      apiKey: config.apiKey,
      secretKey: config.secretKey,
      randomString,
      uri,
      body,
    }),
  };
}

function assertOkResponse(response: IyzicoResponse, operation: string) {
  if (response.status && response.status !== "success") {
    throw new Error(`${operation} failed: ${response.errorCode ?? "iyzico_error"}`);
  }
}

function sanitizeResponse(response: IyzicoResponse) {
  return {
    status: response.status,
    errorCode: response.errorCode,
    errorMessage: response.errorMessage,
    paymentStatus: response.paymentStatus,
    paymentId: response.paymentId,
    conversationId: response.conversationId,
  };
}

export class IyzicoCheckoutClient {
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => Date;
  private readonly randomId: () => string;

  constructor(
    private readonly config: IyzicoConfig,
    dependencies: IyzicoClientDependencies = {},
  ) {
    this.fetchImpl = dependencies.fetchImpl ?? fetch;
    this.now = dependencies.now ?? (() => new Date());
    this.randomId = dependencies.randomId ?? randomUUID;
  }

  async initializeCheckoutForm(request: PaymentCheckoutRequest): Promise<{
    token: string;
    presentation: PaymentPresentation;
    providerSafeSnapshot: Record<string, unknown>;
  }> {
    const uri = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
    const payload = {
      locale: "tr",
      conversationId: request.conversationId,
      price: toMajorAmount(request.amountMinor),
      paidPrice: toMajorAmount(request.amountMinor),
      currency: request.currency,
      basketId: request.basketId,
      paymentGroup: "PRODUCT",
      callbackUrl: request.callbackUrl || this.config.callbackUrl,
      buyer: {
        id: request.attemptReference,
        name: request.payer.firstName,
        surname: request.payer.lastName || "-",
        gsmNumber: request.payer.phone || undefined,
        email: request.payer.email,
        identityNumber: request.payer.identityNumber || "11111111110",
        registrationAddress: request.payer.registrationAddress || "N/A",
        ip: request.payer.ip || "127.0.0.1",
        city: request.payer.city || "Istanbul",
        country: request.payer.country || "Turkey",
        registrationDate: this.now().toISOString().slice(0, 19).replace("T", " "),
      },
      shippingAddress: {
        contactName: `${request.payer.firstName} ${request.payer.lastName || ""}`.trim(),
        city: request.payer.city || "Istanbul",
        country: request.payer.country || "Turkey",
        address: request.payer.registrationAddress || "N/A",
      },
      billingAddress: {
        contactName: `${request.payer.firstName} ${request.payer.lastName || ""}`.trim(),
        city: request.payer.city || "Istanbul",
        country: request.payer.country || "Turkey",
        address: request.payer.registrationAddress || "N/A",
      },
      basketItems: [
        {
          id: request.attemptReference,
          name: request.title,
          category1: "education",
          itemType: "VIRTUAL",
          price: toMajorAmount(request.amountMinor),
        },
      ],
    };
    const body = JSON.stringify(payload);
    const randomString = this.randomId();

    const response = await this.fetchImpl(`${this.config.baseUrl}${uri}`, {
      method: "POST",
      headers: buildHeaders(this.config, uri, body, randomString),
      body,
    });
    const data = (await response.json()) as IyzicoResponse;

    assertOkResponse(data, "CheckoutForm initialize");
    if (!data.token || !data.checkoutFormContent) {
      throw new Error("CheckoutForm initialize failed: missing checkout token or content");
    }

    return {
      token: data.token,
      presentation: {
        kind: "iyzico_checkout_form",
        token: data.token,
        checkoutFormContent: data.checkoutFormContent,
        providerPageUrl: data.paymentPageUrl ?? null,
      },
      providerSafeSnapshot: sanitizeResponse(data),
    };
  }

  async retrieveCheckoutFormResult(token: string): Promise<ProviderPaymentResult> {
    const uri = "/payment/iyzipos/checkoutform/auth/ecom/detail";
    const body = JSON.stringify({ locale: "tr", token });
    const randomString = this.randomId();
    const response = await this.fetchImpl(`${this.config.baseUrl}${uri}`, {
      method: "POST",
      headers: buildHeaders(this.config, uri, body, randomString),
      body,
    });
    const data = (await response.json()) as IyzicoResponse;

    assertOkResponse(data, "CheckoutForm retrieve");

    const providerStatus = data.paymentStatus === "SUCCESS" ? "paid" : data.paymentStatus === "FAILURE" ? "failed" : "pending";

    return {
      provider: "iyzico",
      providerToken: token,
      status: providerStatus,
      paymentId: data.paymentId ?? null,
      conversationId: data.conversationId ?? null,
      failureReason: providerStatus === "failed" ? data.errorMessage ?? "payment_failed" : null,
      rawSafePayload: sanitizeResponse(data),
    };
  }
}

export function createIyzicoCheckoutClient(config: IyzicoConfig, dependencies?: IyzicoClientDependencies) {
  return new IyzicoCheckoutClient(config, dependencies);
}
