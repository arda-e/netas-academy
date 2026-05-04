import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const ROUTE = "registrations";
const FALLBACK_MESSAGE = "Kayit istegi islenemedi.";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const strapiRes = await fetch(`${STRAPI_URL}/api/registrations/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
