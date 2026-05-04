/**
 * Sends a revalidation request to the Next.js frontend when
 * Strapi content changes.
 *
 * Called from lifecycle hooks (afterCreate, afterUpdate, afterDelete).
 */

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:3000";
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET ?? "";

const TAG_MAP: Record<string, string> = {
  "api::course.course": "strapi-courses",
  "api::event.event": "strapi-events",
  "api::blog-post.blog-post": "strapi-blog-posts",
  "api::blog-author.blog-author": "strapi-blog-posts",
  "api::teacher.teacher": "strapi-teachers",
};

async function revalidateTag(uid: string) {
  const tag = TAG_MAP[uid];
  if (!tag) {
    return;
  }

  try {
    const response = await fetch(`${FRONTEND_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": REVALIDATION_SECRET,
      },
      body: JSON.stringify({ tag }),
    });

    if (!response.ok) {
      strapi.log.warn(`Revalidation failed for tag=${tag}: HTTP ${response.status}`);
    }
  } catch (error) {
    strapi.log.warn(`Revalidation request failed for tag=${tag}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default revalidateTag;
