import { Redis } from "@upstash/redis";

// "Vercel KV" (the product) is discontinued — Vercel now routes this through
// a Marketplace Redis integration (Upstash for Redis), which injects env
// vars that may follow either naming convention depending on how the
// integration was added. We check both. Instantiated lazily (per call, not
// at module load) so a missing env var surfaces as a clear error on the
// specific request that needed it, rather than crashing the function's
// cold start before we can even return a proper response.
let client = null;

export function getRedis() {
  if (client) return client;

  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Redis is not configured. Add the Upstash for Redis integration to this " +
      "Vercel project (Storage → Marketplace), then redeploy or `vercel env pull .env.local`."
    );
  }

  client = new Redis({ url, token });
  return client;
}
