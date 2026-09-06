import { THEMES, SOCIALS } from "../../src/cardModel.js";

const MAX = { name: 100, title: 200, company: 200, bio: 500, phone: 200, email: 200, website: 200, social: 100 };
const SOCIAL_KEYS = new Set(SOCIALS.map((s) => s.key));
const THEME_KEYS = new Set(Object.keys(THEMES));
const MAX_BYTES = 250 * 1024;

function clamp(v, max) {
  return typeof v === "string" ? v.slice(0, max) : "";
}

export function validateCardData(input) {
  if (!input || typeof input !== "object") return { ok: false, error: "Missing card data" };

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name || name.length > MAX.name) {
    return { ok: false, error: "Name is required (max 100 characters)" };
  }

  const socials = {};
  if (input.socials && typeof input.socials === "object") {
    for (const [key, value] of Object.entries(input.socials)) {
      if (SOCIAL_KEYS.has(key) && typeof value === "string" && value.trim()) {
        socials[key] = value.trim().slice(0, MAX.social);
      }
    }
  }

  const data = {
    name,
    title: clamp(input.title, MAX.title),
    company: clamp(input.company, MAX.company),
    bio: clamp(input.bio, MAX.bio),
    phone: clamp(input.phone, MAX.phone),
    email: clamp(input.email, MAX.email),
    website: clamp(input.website, MAX.website),
    photo: typeof input.photo === "string" ? input.photo : null,
    logo: typeof input.logo === "string" ? input.logo : null,
    socials,
    theme: THEME_KEYS.has(input.theme) ? input.theme : "minimal",
  };

  const size = Buffer.byteLength(JSON.stringify(data), "utf8");
  if (size > MAX_BYTES) {
    return { ok: false, error: "Card data is too large (over 250KB) — try a smaller photo or logo", status: 413 };
  }

  return { ok: true, data };
}
