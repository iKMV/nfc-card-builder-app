import crypto from "node:crypto";

const DEFAULT_SESSION_MINUTES = 60;

function sessionMinutes() {
  const raw = Number(process.env.ADMIN_SESSION_MINUTES);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_SESSION_MINUTES;
}

function sign(expiresAt) {
  return crypto.createHmac("sha256", process.env.ADMIN_PASSWORD).update(String(expiresAt)).digest("hex");
}

// Constant-time comparison of two equal-or-unequal-length strings. A plain
// !== risks a timing side-channel on secrets gating destructive admin
// actions — same reasoning as verifyEditToken in slug.js. Differing lengths
// return false immediately (never a match regardless) rather than padding,
// same trade-off already accepted there.
function timingSafeStringEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Verifies the raw admin password — used only by POST /api/admin/login,
// the one place that ever sees it directly. Every other admin endpoint
// verifies the short-lived session token below instead.
export function verifyAdminPassword(provided) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured || typeof provided !== "string") return false;
  return timingSafeStringEqual(provided, configured);
}

// Issues a short-lived, self-contained session token on successful login:
// "<expiresAt>.<hmac>", signed with ADMIN_PASSWORD as the HMAC key. No
// separate signing secret to configure and no server-side session storage
// needed — a token is verified purely from its own signature + expiry, so
// nothing needs cleaning up when it lapses.
export function createAdminSessionToken() {
  const expiresAt = Date.now() + sessionMinutes() * 60 * 1000;
  return { token: `${expiresAt}.${sign(expiresAt)}`, expiresAt };
}

function verifySessionToken(token) {
  if (typeof token !== "string" || !token.includes(".")) return false;
  const dot = token.indexOf(".");
  const expiresAtStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expiresAt = Number(expiresAtStr);
  if (!expiresAtStr || !sig || !Number.isFinite(expiresAt)) return false;
  if (Date.now() >= expiresAt) return false;
  return timingSafeStringEqual(sig, sign(expiresAt));
}

// Shared gate for the /api/admin/* data endpoints — validates the session
// token issued by POST /api/admin/login (see AdminPage.jsx), not the raw
// password. Deliberately fails CLOSED — unlike BUILDER_ACCESS_CODE (unset =
// open, since it only gates *new* publishes), an unset ADMIN_PASSWORD
// disables the admin API entirely, since this can reset ANY card's edit
// access, not just gate new ones.
//
// Returns true (and does nothing to res) when authorized. On failure it
// sends the response itself and returns false — callers just do
// `if (!requireAdmin(req, res)) return;`.
export function requireAdmin(req, res) {
  if (!process.env.ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin panel is not configured" });
    return false;
  }
  if (!verifySessionToken(req.headers["x-admin-token"])) {
    res.status(401).json({ error: "Session expired — please log in again" });
    return false;
  }
  return true;
}
