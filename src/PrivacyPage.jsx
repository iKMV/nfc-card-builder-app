import "./App.css";

// This app's router (see router.jsx) doesn't intercept link clicks — every
// navigation is a real, full-page one — so a plain href="/" here would
// always land on the blank builder home, even for someone who reached this
// page from a specific published card's footer. Going back through actual
// browser history instead returns to wherever they really came from.
//
// document.referrer (not history.length) is what decides whether to do
// that: a fresh tab can already report history.length > 1 (the initial
// blank entry counts), which sent the no-prior-visit case to about:blank
// instead of falling back to "/" — caught by testing this against a real
// browser, not just reasoning about it. Checking that the referrer is
// same-origin is the direct, unambiguous signal for "did I actually get
// here via a link from this app". href stays as the "/" fallback for a
// direct visit (no referrer, or one from outside the app) and for modified
// clicks (new tab/window), which should bypass this and use the plain link.
function goBack(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  try {
    if (document.referrer && new URL(document.referrer).origin === window.location.origin) {
      e.preventDefault();
      window.history.back();
    }
  } catch {
    // Malformed referrer — fall through to the plain href="/" navigation.
  }
}

export default function PrivacyPage() {
  return (
    <div className="app" style={{ "--accent": "#2563eb", "--accent-text": "#ffffff" }}>
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__brand">
            <img className="app-header__logo" src="/logo-icon.png" alt="TapKonek" />
            <div className="app-header__text">
              <h1 className="app-header__title">TapKonek</h1>
              <p className="app-header__subtitle">Connect with a Tap · Privacy Policy</p>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 60px" }}>
          <a href="/" onClick={goBack} className="hint-text" style={{ display: "inline-block", marginBottom: 20 }}>← Back to TapKonek</a>

          <div className="stack">
            <div className="info-card">
              <div className="info-card__title">Privacy Policy</div>
              <div className="info-card__desc">Last updated: September 2026</div>
              <div className="info-card__desc" style={{ marginTop: 12 }}>
                TapKonek turns a single NFC card into a living digital business card.
                Tap the card, open a profile, save the contact — and whenever your
                details change, the same card keeps working. This page explains what
                information TapKonek stores and how it's used.
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__title">What we store</div>
              <div className="info-card__desc">
                When you publish or save a card, we store exactly what you type into
                the builder: your name, job title, company, bio, phone number, email,
                website, any photo/logo you upload, your social media handles, and
                your chosen theme. This is saved in our database (Upstash Redis) under
                the public link you get when you publish.
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__title">Published cards are public by design</div>
              <div className="info-card__desc">
                Anyone with your card's link — whether they scanned a QR code, tapped
                an NFC tag, or you sent it directly — can view the information on it.
                That's the entire point of publishing a card: it's meant to be shared.
                Only put information on a published card that you're comfortable
                sharing publicly.
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__title">No accounts, no passwords</div>
              <div className="info-card__desc">
                TapKonek doesn't require you to create an account or log in. Instead,
                publishing a card gives you a private "edit link" containing a secret
                token — that link is the only way to update your card later. We store
                only a one-way cryptographic hash of that token, never the token
                itself, so we can verify it without being able to reconstruct it — not
                even the person administering this TapKonek instance can recover a
                lost link. If you lose yours, they can issue you a brand-new one
                instead, which immediately replaces (and invalidates) the old one.
              </div>
            </div>

            <div className="info-card info-card--success">
              <div className="info-card__title">What we don't do</div>
              <div className="info-card__desc">
                We don't run analytics or ad-tracking scripts on published cards. We
                don't sell or share your card data with third parties for marketing.
                We don't use cookies to track you across other sites.
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__title">Third-party services we rely on</div>
              <div className="info-card__desc">
                <strong>QR codes</strong> are generated by a third-party service
                (api.qrserver.com), which receives the URL your card points to in
                order to generate the image — not your name, photo, or contact
                details directly. <strong>Fonts</strong> are loaded from Google Fonts,
                which may log requests per Google's own policies, same as any site
                using that service. <strong>Hosting</strong> is provided by Vercel and
                Upstash, who process data on our behalf to run the service.
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__title">Local-only features</div>
              <div className="info-card__desc">
                Downloading a card as a standalone HTML file or a .vcf contact file
                happens entirely on your device — nothing is sent to our servers for
                those. If the person running this TapKonek instance has enabled an
                optional access code for publishing, and you enter one, it's stored
                only in your own browser (localStorage), not on our servers.
              </div>
            </div>

            <div className="info-card info-card--warning">
              <div className="info-card__title">Removing a card</div>
              <div className="info-card__desc">
                There's currently no self-service delete button in the app. If you'd
                like a published card taken down, contact the person or organization
                that manages this TapKonek deployment.
              </div>
            </div>

            <div className="info-card">
              <div className="info-card__title">Changes to this policy</div>
              <div className="info-card__desc">
                We may update this page as TapKonek changes. Check back here if
                you're ever unsure what's current.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
