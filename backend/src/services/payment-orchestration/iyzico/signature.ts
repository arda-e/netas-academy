import { createHmac, timingSafeEqual } from "node:crypto";

export type IyzicoSignatureVerificationResult =
  | { valid: true; metadata: { algorithm: "hmac-sha256"; keyId?: string | null } }
  | { valid: false; reason: "missing_signature" | "invalid_signature"; metadata: { algorithm: "hmac-sha256"; keyId?: string | null } };

export function createIyzicoWebhookSignature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyIyzicoWebhookSignature(input: {
  payload: string;
  signature?: string | null;
  secret: string;
  keyId?: string | null;
}): IyzicoSignatureVerificationResult {
  const metadata = { algorithm: "hmac-sha256" as const, keyId: input.keyId ?? null };

  if (!input.signature?.trim()) {
    return { valid: false, reason: "missing_signature", metadata };
  }

  const expected = createIyzicoWebhookSignature(input.payload, input.secret);
  if (!safeEqual(expected, input.signature.trim())) {
    return { valid: false, reason: "invalid_signature", metadata };
  }

  return { valid: true, metadata };
}
