import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${STRAPI_URL}/api/newsletter-subscriptions/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({
      error: {
        message: "Abonelik istegi islenemedi.",
      },
    }));

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: { message: "Abonelik istegi islenemedi." } },
      { status: 502 }
    );
  }
}
