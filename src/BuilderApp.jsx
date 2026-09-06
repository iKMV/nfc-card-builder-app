import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { THEMES, SOCIALS, DEFAULT, generateNfcVCard, generateVCard, generatePWAHTML, getShareUrl, slugifyName } from "./cardModel";
import CardPreview from "./CardPreview";

const ACCESS_CODE_KEY = "nfc_builder_access_code";

const TABS = [
  { id: "editor", icon: "✏️", label: "Editor" },
  { id: "preview", icon: "👁️", label: "Preview" },
  { id: "nfc", icon: "📡", label: "NFC" },
  { id: "qr", icon: "▦", label: "QR" },
];

const SECTIONS = [
  { id: "personal", label: "👤 Personal" },
  { id: "contact", label: "📞 Contact" },
  { id: "socials", label: "🔗 Socials" },
  { id: "appearance", label: "🎨 Theme" },
  { id: "export", label: "📤 Export" },
];

// Downscales an uploaded image via an offscreen canvas before it ever enters
// React state — keeps both the exported static file and the published-card
// payload small. Falls back to the raw file if anything goes wrong.
function resizeImageFile(file, maxDim = 480, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale) || 1;
        const h = Math.round(img.height * scale) || 1;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function FileUpload({ label, value, onChange }) {
  const ref = useRef();
  return (
    <div className="file-upload">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files[0];
          if (!f) return;
          resizeImageFile(f)
            .then(onChange)
            .catch(() => {
              const r = new FileReader();
              r.onload = (ev) => onChange(ev.target.result);
              r.readAsDataURL(f);
            });
        }}
        hidden
      />
      <button type="button" className={`btn btn-upload${value ? " has-value" : ""}`} onClick={() => ref.current.click()}>
        {value ? "Change" : "Upload"} {label}
      </button>
      {value && (
        <button type="button" className="btn-remove" onClick={() => onChange(null)}>
          Remove
        </button>
      )}
    </div>
  );
}

function QRSection({ data }) {
  const url = getShareUrl(data);
  return (
    <div className="qr-wrap">
      {url ? (
        <img
          className="qr-wrap__img"
          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=8`}
          alt="QR code linking to your card"
        />
      ) : (
        <div className="qr-wrap__empty">Add a website or email to generate a QR code</div>
      )}
      <div className="hint-text">Scan or write this URL to your NFC tag</div>
      <div className="mono-block" style={{ marginTop: 8, maxHeight: "none" }}>{url || "No link yet"}</div>
    </div>
  );
}

function NfcVCardSection({ data }) {
  const [copied, setCopied] = useState(false);
  const nfcVcard = useMemo(() => generateNfcVCard(data), [data]);
  const byteSize = new Blob([nfcVcard]).size;
  const fits215 = byteSize <= 504;
  const fits216 = byteSize <= 888;

  const copy = () => {
    navigator.clipboard.writeText(nfcVcard).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="stack">
      <div className="info-card">
        <div className="info-card__title">📡 NFC vCard Data (Offline)</div>
        <div className="info-card__desc">
          Write this directly to your NFC chip. No internet needed when someone taps — their phone reads the contact info from the chip itself.
        </div>
        <div className="mono-block">{nfcVcard}</div>
        <div className="pill-row">
          <span className="byte-count" style={{ color: fits216 ? "var(--success)" : "var(--danger)" }}>{byteSize} bytes</span>
          <span className={`pill ${fits215 ? "pill--ok" : "pill--muted"}`}>NTAG215 {fits215 ? "✅" : "❌"}</span>
          <span className={`pill ${fits216 ? "pill--ok" : "pill--bad"}`}>NTAG216 {fits216 ? "✅" : "❌"}</span>
        </div>
        <button type="button" className={`btn btn-primary${copied ? " is-success" : ""}`} style={{ marginTop: 12 }} onClick={copy}>
          {copied ? "✓ Copied!" : "Copy vCard Data"}
        </button>
      </div>

      <div className="info-card info-card--success">
        <div className="info-card__title">How to write to NFC (offline mode)</div>
        <ol className="steps">
          <li>Open <strong>NFC Tools</strong> on your phone</li>
          <li>Tap <strong>Write → Add a record</strong></li>
          <li>Choose <strong>Contact (vCard)</strong></li>
          <li>Fill in fields or use <strong>Custom → Text</strong> and paste the data above</li>
          <li>Tap <strong>Write</strong>, hold your NFC card to your phone</li>
          <li>Done! Card works without internet now</li>
        </ol>
      </div>

      {!fits215 && (
        <div className="info-card info-card--warning">
          <div className="info-card__desc">
            💡 <strong>Tip:</strong> Shorten your title or company name to fit on smaller NFC chips. The offline vCard only includes essential fields to save space.
          </div>
        </div>
      )}

      <div className="info-card info-card--info">
        <div className="info-card__title">🔄 Best of both worlds</div>
        <div className="info-card__desc">
          For the best experience, use <strong>both</strong> methods: write your hosted URL to the NFC tag for the full rich card (with PWA offline caching), and keep a vCard-only NFC sticker as a backup for places with no signal.
        </div>
      </div>
    </div>
  );
}

function CopyField({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="copy-field">
      <input className="copy-field__input" readOnly value={value} onFocus={(e) => e.target.select()} />
      <button
        type="button"
        className="btn btn-upload"
        onClick={() => {
          navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default function BuilderApp({ mode = "create", slug, editToken }) {
  const [data, setData] = useState(DEFAULT);
  const [loadState, setLoadState] = useState(mode === "edit" ? "loading" : "ready");
  const [published, setPublished] = useState(
    mode === "edit" && slug && editToken
      ? { slug, editToken, viewUrl: `${window.location.origin}/c/${slug}` }
      : null
  );
  const [justPublished, setJustPublished] = useState(false);
  const [slugPrefixInput, setSlugPrefixInput] = useState("");
  const [publishState, setPublishState] = useState({ status: "idle" });
  const [saveState, setSaveState] = useState({ status: "idle" });
  const [accessCodeInput, setAccessCodeInput] = useState("");

  const [tab, setTab] = useState("editor");
  const [rightTab, setRightTab] = useState("preview");
  const [section, setSection] = useState("personal");

  useEffect(() => {
    if (mode !== "edit" || !slug) return;
    let cancelled = false;
    // Relies on the router remounting BuilderApp with a fresh `key={slug}`
    // whenever slug changes (see router.jsx), so `loadState` already starts
    // at "loading" (see useState above) without this effect resetting it.
    fetch(`/api/cards/${slug}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) { setLoadState("not-found"); return; }
        if (!res.ok) { setLoadState("error"); return; }
        const json = await res.json();
        setData((p) => ({ ...p, ...json.data }));
        setLoadState("ready");
      })
      .catch(() => { if (!cancelled) setLoadState("error"); });
    return () => { cancelled = true; };
  }, [mode, slug]);

  const update = useCallback((k, v) => setData((p) => ({ ...p, [k]: v })), []);
  const updateSocial = useCallback((k, v) => setData((p) => ({ ...p, socials: { ...p.socials, [k]: v } })), []);
  const theme = THEMES[data.theme];

  const selectTab = (id) => {
    setTab(id);
    if (id !== "editor") setRightTab(id);
  };

  const downloadVCard = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([generateVCard(data)], { type: "text/vcard" }));
    a.download = `${data.name.replace(/\s+/g, "_")}.vcf`;
    a.click();
  };
  const downloadHTML = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([generatePWAHTML(data, data.theme)], { type: "text/html" }));
    a.download = `${data.name.replace(/\s+/g, "_")}_card.html`;
    a.click();
  };

  const publish = async () => {
    setPublishState({ status: "submitting" });
    try {
      const headers = { "Content-Type": "application/json" };
      const code = localStorage.getItem(ACCESS_CODE_KEY);
      if (code) headers["X-Builder-Access-Code"] = code;
      const res = await fetch("/api/cards", {
        method: "POST",
        headers,
        body: JSON.stringify({ data, slugPrefix: slugPrefixInput.trim() || undefined }),
      });
      if (res.status === 403) {
        setPublishState({ status: "needs-code" });
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPublishState({ status: "error", message: json.error || `Publish failed (${res.status})` });
        return;
      }
      setPublished({ slug: json.slug, editToken: json.editToken, viewUrl: json.viewUrl, editUrl: json.editUrl });
      setJustPublished(true);
      setPublishState({ status: "idle" });
      window.history.pushState(null, "", `/edit/${json.slug}?t=${json.editToken}`);
    } catch {
      setPublishState({ status: "error", message: "Network error — check your connection and try again." });
    }
  };

  const submitAccessCode = () => {
    localStorage.setItem(ACCESS_CODE_KEY, accessCodeInput.trim());
    setAccessCodeInput("");
    publish();
  };

  const save = async () => {
    if (!published) return;
    setSaveState({ status: "submitting" });
    try {
      const res = await fetch(`/api/cards/${published.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, editToken: published.editToken }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaveState({ status: "error", message: json.error || `Save failed (${res.status})` });
        return;
      }
      setPublished((p) => ({ ...p, viewUrl: json.viewUrl || p.viewUrl }));
      setSaveState({ status: "success" });
      setTimeout(() => setSaveState({ status: "idle" }), 2500);
    } catch {
      setSaveState({ status: "error", message: "Network error — check your connection and try again." });
    }
  };

  if (loadState === "loading") {
    return <CenteredMessage>Loading your card…</CenteredMessage>;
  }
  if (loadState === "not-found") {
    return <CenteredMessage>Card not found. Double-check the edit link you were given.</CenteredMessage>;
  }
  if (loadState === "error") {
    return <CenteredMessage>Couldn't load this card. Check your connection and try again.</CenteredMessage>;
  }

  return (
    <div className="app" style={{ "--accent": theme.accent, "--accent-text": theme.accentText }}>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <span className="app-header__logo">⚡</span>
            <div className="app-header__text">
              <h1 className="app-header__title">NFC Card Builder</h1>
              <p className="app-header__subtitle">Design your digital business card · Online + Offline</p>
            </div>
          </div>
          <span className="app-header__badge"><span className="dot" />Live preview</span>
        </div>
      </header>

      {published && (
        <div className="edit-banner">
          <div className="edit-banner__inner">
            <span className="edit-banner__label">Editing <strong>{data.name || "this"}</strong>'s card</span>
            <a className="edit-banner__link" href={published.viewUrl} target="_blank" rel="noopener">{published.viewUrl}</a>
            <button type="button" className="btn btn-upload edit-banner__save" onClick={save} disabled={saveState.status === "submitting"}>
              {saveState.status === "submitting" ? "Saving…" : saveState.status === "success" ? "✓ Saved" : "Save changes"}
            </button>
          </div>
          {saveState.status === "error" && <div className="edit-banner__error">{saveState.message}</div>}
        </div>
      )}

      <nav className="tabbar" aria-label="Sections">
        <div className="tabbar__inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tabbar__btn${tab === t.id ? " is-active" : ""}`}
              onClick={() => selectTab(t.id)}
            >
              <span className="tabbar__icon">{t.icon}</span>
              <span className="tabbar__label">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="main">
        <div className="layout">
          <section className={`panel panel--editor${tab === "editor" ? " is-active" : ""}`}>
            <div className="editor-card">
              <div className="section-tabs">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`section-tab${section === s.id ? " is-active" : ""}`}
                    onClick={() => setSection(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="editor-fields">
                {section === "personal" && (
                  <>
                    <div className="field">
                      <label>Full Name</label>
                      <input value={data.name} onChange={(e) => update("name", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Job Title</label>
                      <input value={data.title} onChange={(e) => update("title", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Company</label>
                      <input value={data.company} onChange={(e) => update("company", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Bio</label>
                      <textarea value={data.bio} onChange={(e) => update("bio", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Profile Photo</label>
                      <FileUpload label="Photo" value={data.photo} onChange={(v) => update("photo", v)} />
                    </div>
                    <div className="field">
                      <label>Company Logo</label>
                      <FileUpload label="Logo" value={data.logo} onChange={(v) => update("logo", v)} />
                    </div>
                  </>
                )}

                {section === "contact" && (
                  <>
                    <div className="field">
                      <label>Phone</label>
                      <input value={data.phone} onChange={(e) => update("phone", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Email</label>
                      <input value={data.email} onChange={(e) => update("email", e.target.value)} />
                    </div>
                    <div className="field">
                      <label>Website</label>
                      <input value={data.website} onChange={(e) => update("website", e.target.value)} />
                    </div>
                  </>
                )}

                {section === "socials" && SOCIALS.map((s) => (
                  <div className="field" key={s.key}>
                    <label>{s.icon} {s.label}</label>
                    <div className="input-group">
                      <span className="input-group__prefix">{s.prefix.replace("https://", "")}</span>
                      <input
                        value={data.socials[s.key] || ""}
                        onChange={(e) => updateSocial(s.key, e.target.value)}
                        placeholder="username"
                      />
                    </div>
                  </div>
                ))}

                {section === "appearance" && (
                  <div className="field">
                    <label>Choose a theme</label>
                    <div className="theme-grid">
                      {Object.entries(THEMES).map(([k, t]) => (
                        <button
                          key={k}
                          type="button"
                          className={`theme-swatch${data.theme === k ? " is-active" : ""}`}
                          style={{ borderColor: data.theme === k ? t.accent : undefined }}
                          onClick={() => update("theme", k)}
                        >
                          <div className="theme-swatch__preview" style={{ background: t.bg }}>
                            <div className="theme-swatch__chip" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                              <div className="theme-swatch__dot" style={{ background: t.accent }} />
                            </div>
                          </div>
                          <div className="theme-swatch__label">{t.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {section === "export" && (
                  <div className="stack">
                    <div className="info-card">
                      <div className="info-card__title">🌐 Publish Live Card</div>
                      {!published ? (
                        <>
                          <div className="info-card__desc">
                            One live link, hosted here — the same URL keeps working even after you update your info later. No repo, no separate deploy.
                          </div>
                          {publishState.status === "needs-code" ? (
                            <>
                              <div className="field" style={{ marginTop: 12 }}>
                                <label>Access code required to publish</label>
                                <input value={accessCodeInput} onChange={(e) => setAccessCodeInput(e.target.value)} placeholder="Ask your admin for this code" />
                              </div>
                              <button type="button" className="btn btn-primary" style={{ marginTop: 8 }} onClick={submitAccessCode}>
                                Unlock &amp; Publish
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="field" style={{ marginTop: 12 }}>
                                <label>Custom link (optional)</label>
                                <input
                                  value={slugPrefixInput}
                                  onChange={(e) => setSlugPrefixInput(e.target.value)}
                                  placeholder={slugifyName(data.name)}
                                />
                              </div>
                              <button
                                type="button"
                                className="btn btn-primary"
                                style={{ marginTop: 8 }}
                                onClick={publish}
                                disabled={publishState.status === "submitting"}
                              >
                                {publishState.status === "submitting" ? "Publishing…" : "Publish"}
                              </button>
                              {publishState.status === "error" && (
                                <div className="hint-text" style={{ color: "var(--danger)" }}>{publishState.message}</div>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="hint-text">Live URL — this is the link people will scan or tap:</div>
                          <CopyField value={published.viewUrl} />
                          {justPublished && published.editUrl && (
                            <div className="info-card info-card--warning" style={{ marginTop: 12 }}>
                              <div className="info-card__title">🔑 Save your edit link now</div>
                              <div className="info-card__desc">
                                This is the <strong>only</strong> way to update this card later — we don't store it and can't recover it if it's lost.
                              </div>
                              <CopyField value={published.editUrl} />
                            </div>
                          )}
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ marginTop: 12 }}
                            onClick={save}
                            disabled={saveState.status === "submitting"}
                          >
                            {saveState.status === "submitting" ? "Saving…" : saveState.status === "success" ? "✓ Saved" : "💾 Save changes"}
                          </button>
                          {saveState.status === "error" && (
                            <div className="hint-text" style={{ color: "var(--danger)" }}>{saveState.message}</div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="hint-text" style={{ textAlign: "center" }}>— or export as a static file instead —</div>
                    <div className="info-card">
                      <div className="info-card__title">📄 Download PWA Card</div>
                      <div className="info-card__desc">
                        Standalone page with <strong>Service Worker</strong>. Caches itself after first visit — works offline. Host free on GitHub Pages, Netlify, or Vercel.
                      </div>
                      <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={downloadHTML}>
                        Download HTML (PWA)
                      </button>
                    </div>
                    <div className="info-card">
                      <div className="info-card__title">👤 Download Full vCard</div>
                      <div className="info-card__desc">A .vcf with all your details including socials.</div>
                      <button type="button" className="btn btn-secondary" style={{ marginTop: 12 }} onClick={downloadVCard}>
                        Download .vcf
                      </button>
                    </div>
                    <div className="info-card info-card--warning">
                      <div className="info-card__title">⚡ NFC Setup</div>
                      <ol className="steps">
                        <li>Copy your live URL above (or host your downloaded HTML file yourself)</li>
                        <li>Open <strong>NFC Tools</strong> → Write → URL</li>
                        <li>Paste link, tap Write, hold card to phone</li>
                      </ol>
                      <div className="hint-text">💡 For fully offline cards, check the <strong>NFC tab</strong>.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className={`panel panel--right${tab !== "editor" ? " is-active" : ""}`}>
            {rightTab === "preview" && <CardPreview data={data} theme={data.theme} />}
            {rightTab === "nfc" && <NfcVCardSection data={data} />}
            {rightTab === "qr" && (
              <div className="info-card">
                <QRSection data={data} />
                <div className="hint-text" style={{ textAlign: "center" }}>
                  Update the website field with your live hosted URL so QR and NFC both point to your card.
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function CenteredMessage({ children }) {
  return (
    <div className="app" style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
      <p className="hint-text" style={{ fontSize: 15 }}>{children}</p>
    </div>
  );
}
