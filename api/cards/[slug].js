import { getRedis } from "../_lib/redis.js";
import { validateCardData } from "../_lib/validate.js";
import { verifyEditToken } from "../_lib/slug.js";

// Slug is parsed straight from the request URL rather than relying on any
// assumed bracket-route param injection — sidesteps uncertainty about
// exactly how (or whether) that's exposed for a plain, non-Next.js function.
function extractSlug(request) {
  const { pathname } = new URL(request.url);
  const match = pathname.match(/\/api\/cards\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function handler(request) {
  const slug = extractSlug(request);
  if (!slug) {
    return Response.json({ error: "Missing slug" }, { status: 400 });
  }

  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }

  if (request.method === "GET") {
    const card = await redis.get(`card:${slug}`);
    if (!card) return Response.json({ error: "Card not found" }, { status: 404 });
    return Response.json(
      { slug: card.slug, createdAt: card.createdAt, updatedAt: card.updatedAt, data: card.data },
      { status: 200, headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=300" } }
    );
  }

  if (request.method === "PATCH") {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const card = await redis.get(`card:${slug}`);
    if (!card) return Response.json({ error: "Card not found" }, { status: 404 });

    if (!verifyEditToken(body?.editToken, card.editTokenHash)) {
      return Response.json({ error: "Invalid edit link" }, { status: 401 });
    }

    const result = validateCardData(body?.data);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status || 400 });
    }

    const updatedAt = new Date().toISOString();
    await redis.set(`card:${slug}`, { ...card, data: result.data, updatedAt });

    const origin = new URL(request.url).origin;
    return Response.json({ slug, updatedAt, viewUrl: `${origin}/c/${slug}` }, { status: 200 });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405 });
}
