import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

const VALID_TAGS = new Set([
  "strapi-courses",
  "strapi-events",
  "strapi-blog-posts",
  "strapi-teachers",
]);

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  const expectedSecret = process.env.REVALIDATION_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return Response.json({ message: "Invalid secret" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ message: "Body must be a JSON object" }, { status: 400 });
  }

  const tag = (body as Record<string, unknown>).tag;

  if (!tag || typeof tag !== "string") {
    return Response.json({ message: 'Missing "tag" field' }, { status: 400 });
  }

  if (!VALID_TAGS.has(tag)) {
    return Response.json({ message: `Unknown tag: ${tag}` }, { status: 400 });
  }

  revalidateTag(tag);

  return Response.json({ revalidated: true, tag });
}
