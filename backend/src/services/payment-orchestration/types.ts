export type PaymentParentType = "registration" | "course_application";
export type PaymentProvider = "iyzico";
export type PaymentAttemptStatus = "created" | "checkout_created" | "pending" | "paid" | "failed" | "cancelled";

export type PaymentParentDescriptor = {
  parentType: PaymentParentType;
  parentEntityId: number;
  parentDocumentId?: string | null;
};

export type PaymentPayerSnapshot = {
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  identityNumber?: string | null;
  registrationAddress?: string | null;
  city?: string | null;
  country?: string | null;
  ip?: string | null;
};

export type PaymentCheckoutRequest = {
  attemptReference: string;
  conversationId: string;
  amountMinor: number;
  currency: string;
  basketId: string;
  title: string;
  callbackUrl: string;
  payer: PaymentPayerSnapshot;
};

export type PaymentPresentation =
  | {
      kind: "iyzico_checkout_form";
      token: string;
      checkoutFormContent: string;
      providerPageUrl?: string | null;
    };

export type PaymentHandoff = {
  attemptReference: string;
  status: "checkout_created" | "payment_unavailable";
  provider: PaymentProvider;
  presentation?: PaymentPresentation;
  error?: {
    code: string;
    message: string;
  };
};

export type ProviderPaymentResultStatus = "paid" | "failed" | "cancelled" | "pending";

export type ProviderPaymentResult = {
  provider: PaymentProvider;
  providerToken: string;
  status: ProviderPaymentResultStatus;
  paymentId?: string | null;
  conversationId?: string | null;
  failureReason?: string | null;
  rawSafePayload?: Record<string, unknown>;
};
