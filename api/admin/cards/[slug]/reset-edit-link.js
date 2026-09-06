import { getRedis } from "../../../_lib/redis.js";
import { requireAdmin } from "../../../_lib/adminAuth.js";
import { generateEditToken, hashEditToken } from "../../../_lib/slug.js";

// Classic (req, res) Vercel Function signature — see api/cards.js for why.
// Slug parsed from the request URL directly (see api/cards/[slug].js for
// the same reasoning) rather than relying on req.query for this deeper,
// two-bracket-segment-away path.
function extractSlug(req) {
  const match = req.url.match(/\/api\/admin\/cards\/([^/]+)\/reset-edit-link/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!requireAdmin(req, res)) return;

  const slug = extractSlug(req);
  if (!slug) {
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

  const card = await redis.get(`card:${slug}`);
  if (!card) {
    res.status(404).json({ error: "Card not found" });
    return;
  }

  const editToken = generateEditToken();
  const editTokenHash = hashEditToken(editToken);
  const updatedAt = new Date().toISOString();
  await redis.set(`card:${slug}`, { ...card, editTokenHash, updatedAt });

  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${req.headers.host}`;
  res.status(200).json({
    slug,
    editToken,
    editUrl: `${origin}/edit/${slug}?t=${editToken}`,
  });
}
