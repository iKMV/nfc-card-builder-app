import { useEffect, useState } from "react";
import "./App.css";
import CopyField from "./CopyField";

const STORAGE_KEY = "tapkonek_admin_password";

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
  const [checking, setChecking] = useState(() => !!sessionStorage.getItem(STORAGE_KEY));
  const [cards, setCards] = useState([]);
  const [loadState, setLoadState] = useState(() => (sessionStorage.getItem(STORAGE_KEY) ? "loading" : "idle"));
  const [resettingSlug, setResettingSlug] = useState(null);
  const [resetResults, setResetResults] = useState({});
  const [resetError, setResetError] = useState("");

  // Callers are responsible for setting loadState to "loading" themselves
  // before calling this — the initial useState above already covers the
  // "checking a stored password on mount" case, so this function doesn't
  // need to (and doing it here as the first synchronous statement is what
  // was tripping the "don't setState synchronously inside an effect" lint
  // rule for the mount-time call path).
  const loadCards = async (pwd) => {
    try {
      const res = await fetch("/api/admin/cards", { headers: { "X-Admin-Password": pwd } });
      if (res.status === 401 || res.status === 503) {
        const json = await res.json().catch(() => ({}));
        setAuthed(false);
        setAuthError(json.error || "Access denied");
        sessionStorage.removeItem(STORAGE_KEY);
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
    // stored password to verify — nothing to do here if there wasn't one.
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    let cancelled = false;
    (async () => {
      await loadCards(stored);
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const submitPassword = (e) => {
    e.preventDefault();
    setAuthError("");
    setLoadState("loading");
    sessionStorage.setItem(STORAGE_KEY, password);
    loadCards(password);
  };

  const resetLink = async (slug) => {
    if (!window.confirm(`Reset the edit link for "${slug}"? The old link will stop working immediately.`)) {
      return;
    }
    setResetError("");
    setResettingSlug(slug);
    try {
      const pwd = sessionStorage.getItem(STORAGE_KEY);
      const res = await fetch(`/api/admin/cards/${slug}/reset-edit-link`, {
        method: "POST",
        headers: { "X-Admin-Password": pwd },
      });
      const json = await res.json().catch(() => ({}));
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
              <div className="info-card__title">🔒 Admin access</div>
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
