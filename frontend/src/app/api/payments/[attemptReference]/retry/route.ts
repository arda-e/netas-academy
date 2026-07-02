import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const ROUTE = "payments.retry";
const FALLBACK_MESSAGE = "Odeme tekrar baslatilamadi.";

export async function POST(_request: Request, context: { params: Promise<{ attemptReference: string }> }) {
  const { attemptReference } = await context.params;

  try {
    const strapiRes = await fetch(`${STRAPI_URL}/api/payments/${encodeURIComponent(attemptReference)}/retry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const payload = await strapiRes.json().catch(() => ({
      error: { message: FALLBACK_MESSAGE },
    }));

    if (!strapiRes.ok) {
      console.error(
        JSON.stringify({
          route: ROUTE,
          status: strapiRes.status,
          errorCategory: strapiRes.status >= 500 ? "http-5xx" : "http-4xx",
          message: `Strapi ${strapiRes.status} ${strapiRes.statusText}`,
        }),
      );
      return NextResponse.json(payload, { status: strapiRes.status });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error(
      JSON.stringify({
        route: ROUTE,
        errorCategory: "network",
        message: error instanceof Error ? error.message : "Servis şu anda kullanılamıyor",
      }),
    );
    return NextResponse.json({ error: { message: FALLBACK_MESSAGE } }, { status: 502 });
  }
}
