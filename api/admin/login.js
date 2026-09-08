import { verifyAdminPassword, createAdminSessionToken } from "../_lib/adminAuth.js";

// Classic (req, res) Vercel Function signature — see api/cards.js for why.
//
// Exchanges the raw admin password for a short-lived session token (see
// api/_lib/adminAuth.js) — this is the only admin endpoint that ever sees
// the password itself; AdminPage.jsx stores the returned token instead and
// sends that on every subsequent admin request, so an admin session left
// open naturally expires instead of staying valid forever.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!process.env.ADMIN_PASSWORD) {
    res.status(503).json({ error: "Admin panel is not configured" });
    return;
  }

  const body = req.body || {};
  if (!verifyAdminPassword(body.password)) {
    res.status(401).json({ error: "Invalid admin password" });
    return;
  }

  const { token, expiresAt } = createAdminSessionToken();
  res.status(200).json({ token, expiresAt });
}
