// Shared gate for the /api/admin/* endpoints. Deliberately fails CLOSED —
// unlike BUILDER_ACCESS_CODE (unset = open, since it only gates *new*
// publishes), an unset ADMIN_PASSWORD disables the admin API entirely,
// since this can reset ANY card's edit access, not just gate new ones.
//
// Returns true (and does nothing to res) when authorized. On failure it
// sends the response itself and returns false — callers just do
// `if (!requireAdmin(req, res)) return;`.
export function requireAdmin(req, res) {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    res.status(503).json({ error: "Admin panel is not configured" });
    return false;
  }
  const provided = req.headers["x-admin-password"];
  if (provided !== configured) {
    res.status(401).json({ error: "Invalid admin password" });
    return false;
  }
  return true;
}
