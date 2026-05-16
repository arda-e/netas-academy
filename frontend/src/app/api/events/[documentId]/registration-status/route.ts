const STRAPI_URL = process.env.STRAPI_URL ?? "http://127.0.0.1:1337";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;

  try {
    const response = await fetch(
      `${STRAPI_URL}/api/events/${documentId}/registration-status`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return new Response(null, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch {
    return new Response(null, { status: 500 });
  }
}
