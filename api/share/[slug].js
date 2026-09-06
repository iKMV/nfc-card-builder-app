import { getRedis } from "../_lib/redis.js";

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

// Serves the same built app every real visitor gets, but with per-card
// <title>/description/og:*/twitter:* meta tags injected into <head> first —
// so link-unfurling crawlers (which don't run JavaScript) see the actual
// person's name/title instead of a generic shell. Everyone gets this same
// augmented HTML (no User-Agent branching): the <script>/<link> tags are
// left untouched, so the real React app boots identically for humans too.
//
// Classic Vercel Node.js Function signature — see api/cards.js for why
// (this deployment invokes functions as (req, res), not the newer
// Fetch-API (request) => Response form).
export default async function handler(req, res) {
  const slug = req.query?.slug;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${req.headers.host}`;

  let cardData = null;
  if (typeof slug === "string" && slug) {
    try {
      const redis = getRedis();
      const card = await redis.get(`card:${slug}`);
      if (card) cardData = card.data;
    } catch {
      // Redis unreachable/unconfigured — fall through to generic meta tags
      // below rather than failing the whole page.
    }
  }

  let html;
  try {
    // Fetch the app's own already-built, already-deployed index.html rather
    // than reading a build artifact off disk — guarantees the hashed
    // <script>/<link> tags always match what's actually live, with no
    // build-order assumptions.
    const shellRes = await fetch(`${origin}/index.html`);
    html = await shellRes.text();
  } catch {
    res.status(502).send("Could not load page template");
    return;
  }

  const name = cardData?.name || "Digital Business Card";
  const descriptionParts = [cardData?.title, cardData?.company].filter(Boolean);
  const description = cardData
    ? (descriptionParts.length ? descriptionParts.join(" at ") : "View this digital business card.")
    : "Design a responsive digital business card and write it straight to an NFC tag — works online and offline.";
  const pageTitle = cardData ? `${name} — Contact` : "NFC Card Builder";
  const canonicalUrl = typeof slug === "string" && slug ? `${origin}/c/${encodeURIComponent(slug)}` : origin;
  const imageUrl = `${origin}/og-card.png`;

  html = html.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(pageTitle)}</title>`);
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${escapeHtml(description)}">`
  );
  const socialTags = `
    <meta property="og:type" content="profile">
    <meta property="og:title" content="${escapeHtml(name)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(name)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  </head>`;
  html = html.replace("</head>", socialTags);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Short edge cache: keeps repeated crawler hits cheap while staying
  // responsive to an edit made moments ago.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
  res.status(200).send(html);
}
