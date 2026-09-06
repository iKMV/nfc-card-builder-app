import { getRedis } from "../_lib/redis.js";
import { requireAdmin } from "../_lib/adminAuth.js";

// Classic (req, res) Vercel Function signature — see api/cards.js for why.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!requireAdmin(req, res)) return;

  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    res.status(500).json({ error: err.message });
    return;
  }

  // SCAN (not the simpler one-shot KEYS) per Upstash's own guidance —
  // non-blocking and the right habit even at today's small scale.
  const keys = [];
  let cursor = "0";
  do {
    const [nextCursor, batch] = await redis.scan(cursor, { match: "card:*", count: 100 });
    keys.push(...batch);
    cursor = nextCursor;
  } while (cursor !== "0");

  const cards = keys.length ? await redis.mget(...keys) : [];

  const list = cards
    .filter(Boolean)
    .map((card) => ({
      slug: card.slug,
      name: card.data?.name || "",
      title: card.data?.title || "",
      department: card.data?.department || "",
      company: card.data?.company || "",
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }))
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

  res.status(200).json({ cards: list });
}
