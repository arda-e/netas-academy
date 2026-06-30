import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const TURNSTILE_SECRET_KEY = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
const ROUTE = "contact-submissions";
const FALLBACK_MESSAGE = "Mesaj istegi islenemedi.";
const HUMAN_CHECK_REQUIRED_MESSAGE = "turnstileToken is required";
const HUMAN_CHECK_FAILED_MESSAGE = "turnstile verification failed";

type ContactSubmissionBody = Record<string, unknown> & {
  turnstileToken?: unknown;
};

type TurnstileVerificationResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

function shouldVerifyTurnstile() {
  return process.env.NODE_ENV === "production";
}

async function verifyTurnstileToken(token: unknown, request: Request) {
  if (!shouldVerifyTurnstile()) {
    return { ok: true };
  }

  if (!TURNSTILE_SECRET_KEY) {
    console.error(JSON.stringify({
      route: ROUTE,
      errorCategory: "configuration",
      message: "CLOUDFLARE_TURNSTILE_SECRET_KEY is not configured",
    }));
    return { ok: false, status: 503, message: FALLBACK_MESSAGE };
  }

  if (typeof token !== "string" || token.trim().length === 0) {
    return { ok: false, status: 400, message: HUMAN_CHECK_REQUIRED_MESSAGE };
  }

  const formData = new FormData();
  formData.set("secret", TURNSTILE_SECRET_KEY);
  formData.set("response", token);

  const remoteIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (remoteIp) {
    formData.set("remoteip", remoteIp);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as TurnstileVerificationResponse | null;

  if (!response.ok || !result?.success) {
    console.error(JSON.stringify({
      route: ROUTE,
      status: response.status,
      errorCategory: "human-check",
      message: HUMAN_CHECK_FAILED_MESSAGE,
      errorCodes: result?.["error-codes"] ?? [],
    }));
    return { ok: false, status: 400, message: HUMAN_CHECK_FAILED_MESSAGE };
  }

  return { ok: true };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactSubmissionBody;
    const verification = await verifyTurnstileToken(body.turnstileToken, request);

    if (!verification.ok) {
      return NextResponse.json(
        { error: { message: verification.message } },
        { status: verification.status }
      );
    }

    const strapiBody = { ...body };
    delete strapiBody.turnstileToken;

    const strapiRes = await fetch(`${STRAPI_URL}/api/contact-submissions/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strapiBody),
      cache: "no-store",
    });

    if (!strapiRes.ok) {
      console.error(JSON.stringify({
        route: ROUTE,
        status: strapiRes.status,
        errorCategory: strapiRes.status >= 500 ? "http-5xx" : "http-4xx",
        message: `Strapi ${strapiRes.status} ${strapiRes.statusText}`,
      }));
      const payload = await strapiRes.json().catch(() => ({
        error: { message: FALLBACK_MESSAGE },
      }));
      return NextResponse.json(payload, { status: strapiRes.status });
    }

    return NextResponse.json(await strapiRes.json());
  } catch (error) {
    console.error(JSON.stringify({
      route: ROUTE,
      errorCategory: "network",
      message: error instanceof Error ? error.message : "Servis şu anda kullanılamıyor",
    }));
    return NextResponse.json(
      { error: { message: FALLBACK_MESSAGE } },
      { status: 502 }
    );
  }
}
