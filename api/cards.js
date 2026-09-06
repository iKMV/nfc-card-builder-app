import { getRedis } from "./_lib/redis.js";
import { validateCardData } from "./_lib/validate.js";
import { createCardWithUniqueSlug, generateEditToken, hashEditToken, SlugExhaustedError } from "./_lib/slug.js";

// A single default handler branching on request.method (rather than named
// GET/POST exports) — the safer, long-established Vercel Functions
// convention for a plain (non-Next.js) project, using the standard Web
// Request/Response API.
export default async function handler(request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  if (process.env.BUILDER_ACCESS_CODE) {
    const provided = request.headers.get("x-builder-access-code");
    if (provided !== process.env.BUILDER_ACCESS_CODE) {
      return Response.json({ error: "Access code required" }, { status: 403 });
    }
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = validateCardData(body?.data);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status || 400 });
  }

  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }

  const now = new Date().toISOString();
  const editToken = generateEditToken();
  const editTokenHash = hashEditToken(editToken);
  const slugPrefix = typeof body?.slugPrefix === "string" ? body.slugPrefix : undefined;

  try {
    const { slug } = await createCardWithUniqueSlug(redis, {
      name: result.data.name,
      customPrefix: slugPrefix,
      makeBlob: (candidateSlug) => ({
        slug: candidateSlug,
        editTokenHash,
        createdAt: now,
        updatedAt: now,
        data: result.data,
      }),
    });

    const origin = new URL(request.url).origin;
    return Response.json(
      {
        slug,
        editToken,
        viewUrl: `${origin}/c/${slug}`,
        editUrl: `${origin}/edit/${slug}?t=${editToken}`,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof SlugExhaustedError) {
      return Response.json({ error: "Could not generate a unique link — try a different custom link" }, { status: 409 });
    }
    return Response.json({ error: "Something went wrong publishing this card" }, { status: 500 });
  }
}
