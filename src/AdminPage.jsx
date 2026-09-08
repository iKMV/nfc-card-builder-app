import { useEffect, useState } from "react";
import "./App.css";
import CopyField from "./CopyField";
import { UI_ICON_SVG } from "./cardModel";

const STORAGE_KEY = "tapkonek_admin_session";

// The admin session is a short-lived token issued by POST /api/admin/login
// (see api/_lib/adminAuth.js) — the raw password is never stored here, only
// this token + when it expires. Expiry is enforced server-side regardless
// (any admin request with a lapsed token gets a 401 and bounces back to the
// login gate — see loadCards/resetLink below); checking expiresAt here too
// just avoids a doomed round-trip and reflects it faster in the UI.
function readSession() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (!parsed?.token || !parsed?.expiresAt) return null;
    if (Date.now() >= parsed.expiresAt) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY);
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(() => !!readSession());
  const [cards, setCards] = useState([]);
  const [loadState, setLoadState] = useState(() => (readSession() ? "loading" : "idle"));
  const [resettingSlug, setResettingSlug] = useState(null);
  const [resetResults, setResetResults] = useState({});
  const [resetError, setResetError] = useState("");

  // Callers are responsible for setting loadState to "loading" themselves
  // before calling this — the initial useState above already covers the
  // "checking a stored session on mount" case, so this function doesn't
  // need to (and doing it here as the first synchronous statement is what
  // was tripping the "don't setState synchronously inside an effect" lint
  // rule for the mount-time call path).
  const loadCards = async (token) => {
    try {
      const res = await fetch("/api/admin/cards", { headers: { "X-Admin-Token": token } });
      if (res.status === 401 || res.status === 503) {
        const json = await res.json().catch(() => ({}));
        setAuthed(false);
        setAuthError(json.error || "Access denied");
        clearSession();
        setLoadState("idle");
        return;
      }
      if (!res.ok) {
        setLoadState("error");
        return;
      }
      const json = await res.json();
      setCards(json.cards || []);
      setAuthed(true);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  };

  useEffect(() => {
    // `checking`'s initial value (above) already reflects whether there's a
    // stored, not-yet-expired session to verify — nothing to do here if
    // there wasn't one.
    const session = readSession();
    if (!session) return;
    let cancelled = false;
    (async () => {
      await loadCards(session.token);
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const submitPassword = async (e) => {
    e.preventDefault();
    setAuthError("");
    setLoadState("loading");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(json.error || "Access denied");
        setLoadState("idle");
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: json.token, expiresAt: json.expiresAt }));
      setPassword("");
      await loadCards(json.token);
    } catch {
      setAuthError("Network error — check your connection and try again.");
      setLoadState("idle");
    }
  };

  const resetLink = async (slug) => {
    if (!window.confirm(`Reset the edit link for "${slug}"? The old link will stop working immediately.`)) {
      return;
    }
    setResetError("");
    setResettingSlug(slug);
    try {
      const session = readSession();
      if (!session) {
        clearSession();
        setAuthed(false);
        setAuthError("Session expired — please log in again");
        return;
      }
      const res = await fetch(`/api/admin/cards/${slug}/reset-edit-link`, {
        method: "POST",
        headers: { "X-Admin-Token": session.token },
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 503) {
        clearSession();
        setAuthed(false);
        setAuthError(json.error || "Access denied");
        return;
      }
      if (!res.ok) {
        setResetError(json.error || `Reset failed (${res.status})`);
        return;
      }
      setResetResults((r) => ({ ...r, [slug]: json.editUrl }));
    } catch {
      setResetError("Network error — check your connection and try again.");
    } finally {
      setResettingSlug(null);
    }
  };

  if (checking) {
    return <CenteredPage>Checking admin access…</CenteredPage>;
  }

  if (!authed) {
    return (
      <div className="app" style={{ "--accent": "#2563eb", "--accent-text": "#ffffff" }}>
        <header className="app-header">
          <div className="app-header__inner">
            <div className="app-header__brand">
              <img className="app-header__logo" src="/logo-icon.png" alt="TapKonek" />
              <div className="app-header__text">
                <h1 className="app-header__title">TapKonek</h1>
                <p className="app-header__subtitle">Admin</p>
              </div>
            </div>
          </div>
        </header>
        <main className="main">
          <div style={{ maxWidth: 420, margin: "0 auto", padding: "40px 20px" }}>
            <form className="info-card" onSubmit={submitPassword}>
              <div className="info-card__title">
                <span className="ui-icon" dangerouslySetInnerHTML={{ __html: UI_ICON_SVG.lock }} /> Admin access
              </div>
              <div className="info-card__desc">
                Enter the admin password to view published cards and reset a lost edit link.
              </div>
              <div className="field" style={{ marginTop: 12 }}>
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>Unlock</button>
              {authError && <div className="hint-text" style={{ color: "var(--danger)" }}>{authError}</div>}
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app" style={{ "--accent": "#2563eb", "--accent-text": "#ffffff" }}>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <img className="app-header__logo" src="/logo-icon.png" alt="TapKonek" />
            <div className="app-header__text">
              <h1 className="app-header__title">TapKonek</h1>
              <p className="app-header__subtitle">Admin · {cards.length} published card{cards.length === 1 ? "" : "s"}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="main">
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 60px" }}>
          {loadState === "error" && (
            <div className="info-card info-card--warning">Couldn't load cards. Check your connection and try again.</div>
          )}
          {resetError && <div className="info-card info-card--warning" style={{ marginBottom: 14 }}>{resetError}</div>}

          <div className="stack">
            {cards.length === 0 && loadState === "ready" && (
              <div className="info-card">No cards have been published yet.</div>
            )}
            {cards.map((c) => (
              <div className="info-card" key={c.slug}>
                <div className="info-card__title">{c.name || "(untitled)"}</div>
                <div className="info-card__desc">
                  {[c.title, c.department].filter(Boolean).join(" - ")}
                  {c.company ? ` · ${c.company}` : ""}
                  {c.country ? ` · ${c.country}` : ""}
                </div>
                <div className="hint-text">
                  <code>{c.slug}</code> · created {formatDate(c.createdAt)} · updated {formatDate(c.updatedAt)}
                </div>
                <div className="pill-row">
                  <a className="btn btn-upload" href={`/c/${c.slug}`} target="_blank" rel="noopener">View card</a>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: "auto" }}
                    onClick={() => resetLink(c.slug)}
                    disabled={resettingSlug === c.slug}
                  >
                    {resettingSlug === c.slug ? "Resetting…" : "Reset edit link"}
                  </button>
                </div>
                {resetResults[c.slug] && (
                  <div className="info-card info-card--warning" style={{ marginTop: 12 }}>
                    <div className="info-card__title">New edit link — send this to the card owner</div>
                    <div className="info-card__desc">
                      The old edit link no longer works. This is the only time this new link is shown.
                    </div>
                    <CopyField value={resetResults[c.slug]} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function CenteredPage({ children }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#6b7280",
      }}
    >
      <p>{children}</p>
    </div>
  );
}
