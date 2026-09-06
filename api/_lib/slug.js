import crypto from "node:crypto";

function kebab(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export class SlugExhaustedError extends Error {}

// Atomically claims a unique `card:<slug>` key by writing the final blob
// with SETNX — retries with a fresh random suffix on collision. `makeBlob`
// receives the winning slug so the stored blob can embed it. A random
// 6-hex-char suffix is always appended (even to a custom prefix) so common
// names can't be trivially enumerated — the slug isn't meant to be secret,
// just not a one-guess lookup.
export async function createCardWithUniqueSlug(redis, { name, customPrefix, makeBlob }) {
  const base = kebab(customPrefix) || kebab(name) || "card";
  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = crypto.randomBytes(3).toString("hex");
    const candidate = `${base}-${suffix}`;
    const blob = makeBlob(candidate);
    const created = await redis.set(`card:${candidate}`, blob, { nx: true });
    if (created) return { slug: candidate, blob };
  }
  throw new SlugExhaustedError("Could not generate a unique slug after 5 attempts");
}

export function generateEditToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashEditToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Constant-time comparison against the stored hash. Comparing two
// fixed-length (32-byte) SHA-256 digests means the "buffers must be the
// same length" requirement of timingSafeEqual can never actually fail here,
// unlike comparing the raw, attacker-controlled-length token directly.
export function verifyEditToken(token, storedHash) {
  if (!token || typeof token !== "string" || !storedHash) return false;
  const provided = crypto.createHash("sha256").update(token).digest();
  const stored = Buffer.from(storedHash, "hex");
  if (provided.length !== stored.length) return false;
  return crypto.timingSafeEqual(provided, stored);
}
