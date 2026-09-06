import { getRedis } from "../_lib/redis.js";
import { validateCardData } from "../_lib/validate.js";
import { verifyEditToken } from "../_lib/slug.js";

// Classic Vercel Node.js Function signature — see api/cards.js for why.
// The bracket filename convention means Vercel supplies the dynamic
// segment as req.query.slug.
export default async function handler(req, res) {
  const slug = req.query?.slug;
  if (!slug || typeof slug !== "string") {
    res.status(400).json({ error: "Missing slug" });
    return;
  }

  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    res.status(500).json({ error: err.message });
    return;
  }

  if (req.method === "GET") {
    const card = await redis.get(`card:${slug}`);
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30, stale-while-revalidate=300");
    res.status(200).json({ slug: card.slug, createdAt: card.createdAt, updatedAt: card.updatedAt, data: card.data });
    return;
  }

  if (req.method === "PATCH") {
    const body = req.body || {};
    const card = await redis.get(`card:${slug}`);
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    if (!verifyEditToken(body.editToken, card.editTokenHash)) {
      res.status(401).json({ error: "Invalid edit link" });
      return;
    }

    const result = validateCardData(body.data);
    if (!result.ok) {
      res.status(result.status || 400).json({ error: result.error });
      return;
    }

    const updatedAt = new Date().toISOString();
    await redis.set(`card:${slug}`, { ...card, data: result.data, updatedAt });

    const proto = req.headers["x-forwarded-proto"] || "https";
    const origin = `${proto}://${req.headers.host}`;
    res.status(200).json({ slug, updatedAt, viewUrl: `${origin}/c/${slug}` });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
