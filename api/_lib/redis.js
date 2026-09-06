import { Redis } from "@upstash/redis";

// "Vercel KV" (the product) is discontinued — Vercel now routes this through
// a Marketplace Redis integration (Upstash for Redis). Confirmed against a
// live deployment: Vercel's Storage integrations prefix every injected env
// var with the store's own display name (e.g. a store named "nfc_details"
// injects nfc_details_KV_REST_API_URL / nfc_details_KV_REST_API_TOKEN, not
// the plain names) — presumably so a project can hold more than one store.
// Rather than hardcode one store name, we search for a matching pair by
// suffix. Instantiated lazily (per call, not at module load) so a missing
// env var surfaces as a clear error on the specific request that needed it,
// rather than crashing the function's cold start before we can even return
// a proper response.
let client = null;

function findCredentials() {
  // Plain, unprefixed names (no store-name prefix, or a manually-set var).
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return { url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN };
  }
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN };
  }

  // Prefixed names — find any "<prefix>_KV_REST_API_URL" and pair it with
  // the matching "<prefix>_KV_REST_API_TOKEN" (or the UPSTASH_* variants).
  for (const [urlSuffix, tokenSuffix] of [
    ["_KV_REST_API_URL", "_KV_REST_API_TOKEN"],
    ["_UPSTASH_REDIS_REST_URL", "_UPSTASH_REDIS_REST_TOKEN"],
  ]) {
    const urlKey = Object.keys(process.env).find((k) => k.endsWith(urlSuffix));
    if (!urlKey) continue;
    const prefix = urlKey.slice(0, -urlSuffix.length);
    const tokenKey = `${prefix}${tokenSuffix}`;
    if (process.env[tokenKey]) {
      return { url: process.env[urlKey], token: process.env[tokenKey] };
    }
  }

  return null;
}

export function getRedis() {
  if (client) return client;

  const creds = findCredentials();
  if (!creds) {
    throw new Error(
      "Redis is not configured. Add the Upstash for Redis integration to this " +
      "Vercel project (Storage → Marketplace), then redeploy or `vercel env pull .env.local`."
    );
  }

  client = new Redis({ url: creds.url, token: creds.token });
  return client;
}
