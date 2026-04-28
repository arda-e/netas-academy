import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${STRAPI_URL}/api/analytics-events/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({
    error: {
      message: "Etkinlik istegi islenemedi.",
    },
  }));

  return NextResponse.json(payload, { status: response.status });
}
