// Pure, framework-free card data/logic — shared between the client bundle
// and the server-side API validation (api/_lib/validate.js imports SOCIALS
// and THEMES from here for its whitelist checks).

// The canonical TapKonek app URL — needed here (rather than a relative link)
// because generatePWAHTML() produces a fully portable, standalone HTML file
// that people host wherever they like (GitHub Pages, Netlify, their own
// domain, ...); a relative "/privacy" link would 404 on any of those. If
// this app ever moves to a custom domain, update it here.
export const APP_URL = "https://tap-konek-app.vercel.app";

export const THEMES = {
  minimal: {
    name: "Minimal",
    bg: "#ffffff",
    card: "#f8f9fa",
    text: "#1a1a2e",
    sub: "#6b7280",
    accent: "#2563eb",
    accentText: "#ffffff",
    border: "#e5e7eb",
    font: "'Inter', system-ui, sans-serif",
  },
  midnight: {
    name: "Midnight",
    bg: "#0f172a",
    card: "#1e293b",
    text: "#f1f5f9",
    sub: "#94a3b8",
    accent: "#818cf8",
    accentText: "#0f172a",
    border: "#334155",
    font: "'Inter', system-ui, sans-serif",
  },
  ocean: {
    name: "Ocean",
    bg: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 50%, #06b6d4 100%)",
    card: "rgba(255,255,255,0.12)",
    text: "#f0fdfa",
    sub: "#a5f3fc",
    accent: "#22d3ee",
    accentText: "#0c4a6e",
    border: "rgba(255,255,255,0.15)",
    font: "'Inter', system-ui, sans-serif",
  },
  ember: {
    name: "Ember",
    bg: "linear-gradient(135deg, #1c1917 0%, #44403c 100%)",
    card: "rgba(255,255,255,0.08)",
    text: "#fafaf9",
    sub: "#d6d3d1",
    accent: "#f97316",
    accentText: "#1c1917",
    border: "rgba(255,255,255,0.1)",
    font: "'Georgia', serif",
  },
  forest: {
    name: "Forest",
    bg: "linear-gradient(160deg, #052e16 0%, #14532d 100%)",
    card: "rgba(255,255,255,0.08)",
    text: "#f0fdf4",
    sub: "#bbf7d0",
    accent: "#4ade80",
    accentText: "#052e16",
    border: "rgba(255,255,255,0.12)",
    font: "'Inter', system-ui, sans-serif",
  },
  slate: {
    name: "Slate",
    bg: "#f1f5f9",
    card: "#ffffff",
    text: "#0f172a",
    sub: "#64748b",
    accent: "#475569",
    accentText: "#ffffff",
    border: "#e2e8f0",
    font: "'Inter', system-ui, sans-serif",
  },
  royal: {
    name: "Royal",
    bg: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 60%, #6d28d9 100%)",
    card: "rgba(255,255,255,0.08)",
    text: "#f5f3ff",
    sub: "#c4b5fd",
    accent: "#fbbf24",
    accentText: "#1e1b4b",
    border: "rgba(255,255,255,0.14)",
    font: "'Inter', system-ui, sans-serif",
  },
  rose: {
    name: "Rose",
    bg: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)",
    card: "rgba(255,255,255,0.65)",
    text: "#881337",
    sub: "#be123c",
    accent: "#e11d48",
    accentText: "#ffffff",
    border: "rgba(190,18,60,0.16)",
    font: "'Inter', system-ui, sans-serif",
  },
  noir: {
    name: "Noir",
    bg: "#0a0a0a",
    card: "rgba(255,255,255,0.05)",
    text: "#f5f5f4",
    sub: "#a8a29e",
    accent: "#d4af37",
    accentText: "#0a0a0a",
    border: "rgba(212,175,55,0.25)",
    font: "'Georgia', serif",
  },
  arctic: {
    name: "Arctic",
    bg: "linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
    card: "rgba(255,255,255,0.72)",
    text: "#0c4a6e",
    sub: "#0369a1",
    accent: "#0284c7",
    accentText: "#ffffff",
    border: "rgba(2,132,199,0.16)",
    font: "'Inter', system-ui, sans-serif",
  },
};

// Small vector icons for the builder's own chrome (tab bar, section chips,
// info-card headings, contact-row glyphs on the card face itself) — hand-
// built rather than pulling in the actual Font Awesome library, for the same
// reason SOCIAL_ICON_SVG below is hand-built: full control over size/color
// via currentColor, zero added dependency/bundle weight, and one consistent
// stroke-based visual style shared by every icon in the app (matches
// SAVE_ICON_SVG's existing look). Plain markup strings, not JSX — used both
// by React (dangerouslySetInnerHTML) and generatePWAHTML's string template.
export const UI_ICON_SVG = {
  pencil: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  wifi: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.8a11 11 0 0 1 15 0"/><path d="M7.8 16.3a6.5 6.5 0 0 1 8.4 0"/><circle cx="12" cy="19.5" r="1.15" fill="currentColor" stroke="none"/></svg>`,
  qrcode: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><path d="M14 14h3v3h-3zM19 14.5h1.6M14 19h1.6M19 19h2v2h-2z" fill="currentColor" stroke="none"/></svg>`,
  user: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-4.6 5-6.4 8-6.4s6.6 1.8 8 6.4"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.6 3.5 9.3 4l1.2 4-2 1.6a12.5 12.5 0 0 0 6 6l1.5-2 4 1.3v2.7c0 1.2-1 2.1-2.2 2C10.6 18.7 5.3 13.4 4.6 6.2c-.1-1.2.8-2.2 2-2.7Z"/></svg>`,
  envelope: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9Z"/></svg>`,
  link: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 15l6-6"/><path d="M11 6.3 12.4 5a4 4 0 0 1 5.6 5.7L16.5 12"/><path d="M13 17.7 11.6 19a4 4 0 0 1-5.6-5.7L7.5 12"/></svg>`,
  palette: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.9-.9 1.9-1.9 0-.5-.2-.9-.5-1.3-.3-.3-.5-.7-.5-1.2 0-1 .9-1.9 1.9-1.9H16a4 4 0 0 0 4-4A8 8 0 0 0 12 3Z"/><circle cx="7.3" cy="10.8" r="1.15" fill="currentColor" stroke="none"/><circle cx="10.5" cy="7.2" r="1.15" fill="currentColor" stroke="none"/><circle cx="15" cy="7.8" r="1.15" fill="currentColor" stroke="none"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4"/><path d="M7.5 8.5 12 4l4.5 4.5"/><path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="11" width="15" height="9.5" rx="2"/><path d="M8 11V7.3a4 4 0 0 1 8 0V11"/></svg>`,
  doc: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 2h7l4 4v16h-11Z"/><path d="M13.5 2v4h4"/><path d="M9 13.2h6M9 17h6"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 10a7.5 7.5 0 0 1 13-4.6M19.5 3.8v5h-5"/><path d="M19.5 14a7.5 7.5 0 0 1-13 4.6M4.5 20.2v-5h5"/></svg>`,
  key: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.3"/><path d="M10.7 12.3 19.5 3.5"/><path d="M16.7 6.3l2.6 2.6"/><path d="M13.8 9.2l2.3 2.3"/></svg>`,
  lightbulb: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 18h5M10.3 21.5h3.4"/><path d="M12 2a6.8 6.8 0 0 0-3.9 12.4c.6.5.9 1.2.9 2.1h6c0-.9.3-1.6.9-2.1A6.8 6.8 0 0 0 12 2Z"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M7.7 12.5 10.5 15.3 16.3 9"/></svg>`,
  xCircle: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 9.5 17 19 7"/></svg>`,
};

// Small vector icons for the card's social badges — used identically by the
// React CardPreview (via dangerouslySetInnerHTML, since this is fully
// static, hardcoded markup we control) and the static-HTML export
// (generatePWAHTML), so the two never visually drift apart. Plain markup
// strings (kebab-case attributes) rather than JSX since this module has no
// JSX dependency.
export const SOCIAL_ICON_SVG = {
  linkedin: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><text x="12" y="17" text-anchor="middle" font-size="13" font-weight="800" font-family="Arial, sans-serif">in</text></svg>`,
  instagram: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5L19 19M19 5L5 19"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><text x="12" y="17" text-anchor="middle" font-size="15" font-weight="800" font-family="Georgia, serif" font-style="italic">f</text></svg>`,
  github: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><text x="12" y="16" text-anchor="middle" font-size="10" font-weight="800" font-family="ui-monospace, monospace">&lt;/&gt;</text></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><ellipse cx="9" cy="17" rx="3.2" ry="2.4" transform="rotate(-15 9 17)"/><rect x="10.8" y="4" width="1.8" height="13.5"/><path d="M12.6 4c.3 2.6 2.2 4.6 4.8 5v2.2c-1.9-.2-3.6-1-4.8-2.3V4Z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="2" y="5" width="20" height="14" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 8.5L16 12L10 15.5Z"/></svg>`,
};

// The small download-style icon on the "Save Contact" button.
export const SAVE_ICON_SVG = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v10m0 0l-4-4m4 4l4-4M5 18h14"/></svg>`;

export const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", prefix: "https://linkedin.com/in/" },
  { key: "instagram", label: "Instagram", prefix: "https://instagram.com/" },
  { key: "twitter", label: "X / Twitter", prefix: "https://x.com/" },
  { key: "facebook", label: "Facebook", prefix: "https://facebook.com/" },
  { key: "github", label: "GitHub", prefix: "https://github.com/" },
  { key: "tiktok", label: "TikTok", prefix: "https://tiktok.com/@" },
  { key: "youtube", label: "YouTube", prefix: "https://youtube.com/@" },
];

// An empty card shape — used as the merge base when loading an existing
// published card for editing, so a field that predates a later schema
// change (e.g. "department" didn't always exist) comes back blank rather
// than leaking DEFAULT's example-persona placeholder text.
export const BLANK = {
  name: "",
  title: "",
  department: "",
  company: "",
  bio: "",
  phone: "",
  email: "",
  website: "",
  photo: null,
  logo: null,
  socials: {},
  theme: "minimal",
};

export const DEFAULT = {
  name: "Alex Rivera",
  title: "Product Designer",
  department: "Design Team",
  company: "Studio Nova",
  bio: "Crafting digital experiences that feel effortless.",
  phone: "+1 (555) 123-4567",
  email: "alex@studionova.co",
  website: "studionova.co",
  photo: null,
  logo: null,
  socials: { linkedin: "alexrivera", instagram: "alex.designs" },
  theme: "minimal",
};

// vCard's ORG property is natively structured as "Organization;Department"
// (semicolon-separated) — real contacts apps (Apple/Google Contacts, etc.)
// parse that into distinct fields, so the department rides along on ORG
// rather than being mashed into TITLE.
function orgField(d) {
  if (!d.company && !d.department) return "";
  return `ORG:${d.company || ""}${d.department ? ";" + d.department : ""}`;
}

export function generateVCard(d) {
  return [
    "BEGIN:VCARD", "VERSION:3.0", `FN:${d.name}`,
    d.title ? `TITLE:${d.title}` : "", orgField(d),
    d.phone ? `TEL;TYPE=CELL:${d.phone}` : "", d.email ? `EMAIL:${d.email}` : "",
    d.website ? `URL:${d.website.startsWith("http") ? d.website : "https://" + d.website}` : "",
    d.bio ? `NOTE:${d.bio}` : "",
    ...SOCIALS.filter((s) => d.socials[s.key]).map((s) => `X-SOCIALPROFILE;TYPE=${s.label}:${s.prefix}${d.socials[s.key]}`),
    "END:VCARD",
  ].filter(Boolean).join("\r\n");
}

export function generateNfcVCard(d) {
  return [
    "BEGIN:VCARD", "VERSION:3.0", `FN:${d.name}`,
    d.title ? `TITLE:${d.title}` : "", orgField(d),
    d.phone ? `TEL:${d.phone}` : "", d.email ? `EMAIL:${d.email}` : "",
    d.website ? `URL:${d.website.startsWith("http") ? d.website : "https://" + d.website}` : "",
    "END:VCARD",
  ].filter(Boolean).join("\r\n");
}

// The card's job-title line as shown on the card face — "Title" alone,
// "Department" alone, or "Title - Department" when both are set.
export function formatTitleLine(d) {
  return [d.title, d.department].filter(Boolean).join(" - ");
}

// The URL a QR code / NFC tag should point to: the hosted card's live URL
// (the "Website" field is where that gets entered — see the Export tab hint),
// falling back to a mailto link if no website has been set yet.
export function getShareUrl(data) {
  if (data.website) return data.website.startsWith("http") ? data.website : `https://${data.website}`;
  if (data.email) return `mailto:${data.email}`;
  return "";
}

// A URL-safe, lowercase, hyphenated preview of a slug from a person's name.
// This is a client-side PREVIEW only — the server always appends its own
// random suffix and is the final authority on the real slug (see api/_lib/slug.js).
export function slugifyName(name) {
  return (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "card";
}

export function generatePWAHTML(data, theme) {
  const t = THEMES[theme];
  const isGrad = t.bg.includes("gradient");
  const socialLinks = SOCIALS.filter((s) => data.socials[s.key])
    .map((s) => `<a href="${s.prefix}${data.socials[s.key]}" target="_blank" rel="noopener" class="si" onclick="event.stopPropagation()">${SOCIAL_ICON_SVG[s.key]}</a>`).join("\n      ");
  const vcB64 = btoa(unescape(encodeURIComponent(generateVCard(data))));
  const siteUrl = data.website ? (data.website.startsWith("http") ? data.website : `https://${data.website}`) : "";
  const shareUrl = getShareUrl(data);
  const titleLine = formatTitleLine(data);
  const qrBack = shareUrl
    ? `<img class="qi" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}&bgcolor=ffffff&color=000000&margin=8" alt="QR code linking to this card">
       <div class="qu">${shareUrl}</div>`
    : `<div class="qe">Add a website or email to generate a QR code</div>`;
  const footerHtml = `<div class="ft">
        <div class="bd"><img src="${APP_URL}/logo-icon.png" alt="">TapKonek — Connect with a Tap.</div>
        <a class="pv" href="${APP_URL}/privacy" target="_blank" rel="noopener" onclick="event.stopPropagation()">Privacy</a>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="${isGrad ? "#0c4a6e" : t.bg}">
<title>${data.name} — Contact</title>
<link rel="manifest" href="data:application/json;base64,${btoa(unescape(encodeURIComponent(JSON.stringify({
    name: data.name + " — Contact", short_name: data.name.split(" ")[0],
    start_url: ".", display: "standalone",
    background_color: isGrad ? "#0c4a6e" : t.bg, theme_color: t.accent,
    icons: [{ src: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="' + t.accent + '" width="100" height="100" rx="20"/><text x="50" y="62" text-anchor="middle" fill="' + t.accentText + '" font-size="48" font-family="sans-serif" font-weight="bold">' + (data.name[0] || "?") + "</text></svg>"), sizes: "192x192", type: "image/svg+xml" }]
  }))))}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;font-family:${t.font};color:${t.text};background:${t.bg}}
.c{width:100%;max-width:400px;margin:24px;perspective:1600px;transition:transform .25s ease,box-shadow .25s ease;animation:card-reveal .6s cubic-bezier(.16,1,.3,1)}
@media (hover:hover){.c:hover{transform:translateY(-5px)}}
@keyframes card-reveal{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
.cf{position:relative;width:100%;cursor:pointer;transform-style:preserve-3d;transition:transform .6s cubic-bezier(.45,.05,.15,1)}
.cf:focus-visible{outline:2px solid ${t.accent};outline-offset:6px;border-radius:20px}
.cf.flip{transform:rotateY(180deg)}
.cd,.cq{padding:40px 28px;background:${t.card};border:1px solid ${t.border};border-radius:20px;text-align:center;backface-visibility:hidden;-webkit-backface-visibility:hidden;${isGrad ? "backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);" : "box-shadow:0 8px 30px rgba(0,0,0,.08);"}}
.cq{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;transform:rotateY(180deg)}
.fh{margin-top:14px;font-size:12px;color:${t.sub};text-align:center}
.ttl{font-size:15px;font-weight:700;color:${t.text}}
.qi{width:170px;height:170px;border-radius:14px;background:#fff;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,.15)}
.qe{max-width:220px;font-size:13px;line-height:1.5;color:${t.sub}}
.qu{max-width:260px;font-size:12px;font-family:ui-monospace,Consolas,monospace;word-break:break-all;color:${t.sub}}
.ph{display:block;width:100px;height:100px;margin:0 auto 16px;border-radius:50%;object-fit:cover;border:3px solid ${t.accent}}
.lo{display:block;height:32px;margin:0 auto 12px;object-fit:contain}
h1{font-size:24px;font-weight:700;margin-bottom:4px;letter-spacing:-.01em}
.ti{color:${t.sub};font-size:15px;margin-bottom:2px}
.co{color:${t.accent};font-size:14px;font-weight:600;margin-bottom:12px}
.bi{color:${t.sub};font-size:14px;line-height:1.5;margin-bottom:24px}
.r{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid ${t.border};font-size:14px}
.r span{display:inline-flex;align-items:center;justify-content:center;width:28px;flex-shrink:0;color:${t.sub}}
.r a{color:${t.text};text-decoration:none;word-break:break-all}
.sc{display:flex;gap:10px;justify-content:center;margin-top:24px;flex-wrap:wrap}
.si{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:${t.accent};color:${t.accentText};text-decoration:none;font-weight:700;font-size:13px;transition:transform .15s,box-shadow .15s}
.si:active{transform:scale(.92)}
.sv{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:28px;padding:14px;background:${t.accent};color:${t.accentText};border:none;border-radius:12px;font-size:16px;font-weight:600;cursor:pointer;text-decoration:none;text-align:center;transition:transform .15s, box-shadow .15s;box-shadow:0 4px 14px ${isGrad ? "rgba(0,0,0,.2)" : t.accent + "40"}}
.sv:active{transform:scale(.97)}
@media (hover:hover){
  .si:hover{transform:translateY(-2px);box-shadow:0 6px 14px rgba(0,0,0,.18)}
  .sv:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.28)}
  .r a:hover{text-decoration:underline}
  .pv:hover{opacity:1}
}
.ft{display:flex;flex-direction:column;align-items:center;gap:4px;margin-top:18px;padding-top:14px;border-top:1px solid rgba(127,127,127,.15);font-size:11px}
.bd{display:flex;align-items:center;gap:6px;font-weight:600;color:${t.sub}}
.bd img{height:14px;width:auto;object-fit:contain}
.pv{font-size:10.5px;text-decoration:underline;opacity:.85;color:${t.sub}}
.ob{position:fixed;bottom:12px;right:12px;display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;background:${t.accent};color:${t.accentText};opacity:0;transition:opacity .3s;pointer-events:none}
.ob svg{width:13px;height:13px}
.ob.sh{opacity:1}
</style>
</head>
<body>
<div class="c">
  <div class="cf" id="cf" role="button" tabindex="0" aria-pressed="false" aria-label="Flip card to show QR code">
    <div class="cd">
      ${data.logo ? `<img class="lo" src="${data.logo}" alt="">` : ""}
      ${data.photo ? `<img class="ph" src="${data.photo}" alt="${data.name}">` : ""}
      <h1>${data.name}</h1>
      ${titleLine ? `<p class="ti">${titleLine}</p>` : ""}
      ${data.company ? `<p class="co">${data.company}</p>` : ""}
      ${data.bio ? `<p class="bi">${data.bio}</p>` : ""}
      <div style="text-align:left">
        ${data.phone ? `<div class="r"><span>${UI_ICON_SVG.phone}</span><a href="tel:${data.phone}" onclick="event.stopPropagation()">${data.phone}</a></div>` : ""}
        ${data.email ? `<div class="r"><span>${UI_ICON_SVG.envelope}</span><a href="mailto:${data.email}" onclick="event.stopPropagation()">${data.email}</a></div>` : ""}
        ${data.website ? `<div class="r"><span>${UI_ICON_SVG.globe}</span><a href="${siteUrl}" target="_blank" onclick="event.stopPropagation()">${data.website}</a></div>` : ""}
      </div>
      ${socialLinks ? `<div class="sc">${socialLinks}</div>` : ""}
      <a class="sv" href="data:text/vcard;base64,${vcB64}" download="${data.name.replace(/\s+/g, "_")}.vcf" onclick="event.stopPropagation()">${SAVE_ICON_SVG}Save Contact</a>
      ${footerHtml}
    </div>
    <div class="cq">
      <div class="ttl">Scan to view this card</div>
      ${qrBack}
      ${footerHtml}
    </div>
  </div>
</div>
<div class="ob" id="ob">${UI_ICON_SVG.bolt}Available offline</div>
<script>
(function(){
  var cf = document.getElementById('cf');
  if(!cf) return;
  function toggleFlip(e){
    if(e && e.type==='keydown' && e.key!=='Enter' && e.key!==' ') return;
    if(e) e.preventDefault();
    var flipped = cf.classList.toggle('flip');
    cf.setAttribute('aria-pressed', flipped);
    cf.setAttribute('aria-label', flipped ? 'Flip card to show details' : 'Flip card to show QR code');
  }
  cf.addEventListener('click', toggleFlip);
  cf.addEventListener('keydown', toggleFlip);
})();
if('serviceWorker' in navigator){
  const S=\`
    const C='nfc-card-v1';
    self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html'])));self.skipWaiting()});
    self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
    self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{const cl=resp.clone();caches.open(C).then(c=>c.put(e.request,cl));return resp}).catch(()=>caches.match('./'))))});
  \`;
  navigator.serviceWorker.register(URL.createObjectURL(new Blob([S],{type:'application/javascript'})),{scope:'./'})
    .then(()=>{const b=document.getElementById('ob');if(b){b.classList.add('sh');setTimeout(()=>b.classList.remove('sh'),3000)}})
    .catch(()=>{});
}
</script>
</body>
</html>`;
}
