import { getRedis } from "./_lib/redis.js";
import { validateCardData } from "./_lib/validate.js";
import { createCardWithUniqueSlug, generateEditToken, hashEditToken, SlugExhaustedError } from "./_lib/slug.js";

// Classic Vercel Node.js Function signature — (req, res), not the newer
// Fetch-API (request) => Response style. Confirmed via a live deployment:
// the Fetch-style handler was invoked but its returned Response was
// silently discarded, leaving every request hanging until
// FUNCTION_INVOCATION_TIMEOUT. This (req, res) form is the older,
// long-stable convention and is what's actually being used here.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (process.env.BUILDER_ACCESS_CODE) {
    const provided = req.headers["x-builder-access-code"];
    if (provided !== process.env.BUILDER_ACCESS_CODE) {
      res.status(403).json({ error: "Access code required" });
      return;
    }
  }

  const body = req.body || {};
  const result = validateCardData(body.data);
  if (!result.ok) {
    res.status(result.status || 400).json({ error: result.error });
    return;
  }

  let redis;
  try {
    redis = getRedis();
  } catch (err) {
    res.status(500).json({ error: err.message });
    return;
  }

  const now = new Date().toISOString();
  const editToken = generateEditToken();
  const editTokenHash = hashEditToken(editToken);
  const slugPrefix = typeof body.slugPrefix === "string" ? body.slugPrefix : undefined;

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

    const proto = req.headers["x-forwarded-proto"] || "https";
    const origin = `${proto}://${req.headers.host}`;
    res.status(201).json({
      slug,
      editToken,
      viewUrl: `${origin}/c/${slug}`,
      editUrl: `${origin}/edit/${slug}?t=${editToken}`,
    });
  } catch (err) {
    if (err instanceof SlugExhaustedError) {
      res.status(409).json({ error: "Could not generate a unique link — try a different custom link" });
      return;
    }
    res.status(500).json({ error: "Something went wrong publishing this card" });
  }
}
