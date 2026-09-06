import { useEffect, useMemo, useState } from "react";
import { THEMES, SOCIALS, SOCIAL_ICON_SVG, SAVE_ICON_SVG, getShareUrl, generateVCard } from "./cardModel";

// Renders a phone/email/website row as a real link when `live`, or a plain
// div (today's decorative-mockup behavior) otherwise.
function ContactRow({ href, live, style, children }) {
  if (live && href) {
    const external = href.startsWith("http");
    return (
      <a
        className="card-preview__row"
        href={href}
        style={style}
        onClick={(e) => e.stopPropagation()}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener" : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <div className="card-preview__row" style={style}>
      {children}
    </div>
  );
}

export default function CardPreview({ data, theme, live = false }) {
  const [flipped, setFlipped] = useState(false);
  const t = THEMES[theme];
  const isGrad = t.bg.includes("gradient");
  const actSoc = SOCIALS.filter((s) => data.socials[s.key]);
  const shareUrl = getShareUrl(data);

  // Only build a real, downloadable vCard blob when this card is "live"
  // (the public hosted page) — the builder's own Preview tab stays a pure
  // mockup, matching its original behavior.
  const vcardUrl = useMemo(() => {
    if (!live) return null;
    return URL.createObjectURL(new Blob([generateVCard(data)], { type: "text/vcard" }));
  }, [live, data]);

  useEffect(() => () => { if (vcardUrl) URL.revokeObjectURL(vcardUrl); }, [vcardUrl]);

  const faceStyle = {
    background: t.card,
    border: `1px solid ${t.border}`,
    backdropFilter: isGrad ? "blur(20px)" : undefined,
    WebkitBackdropFilter: isGrad ? "blur(20px)" : undefined,
    boxShadow: isGrad ? "0 20px 45px rgba(0,0,0,.25)" : "0 8px 30px rgba(0,0,0,.08)",
  };

  const toggleFlip = () => setFlipped((f) => !f);
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip();
    }
  };

  return (
    <div className="card-preview" style={{ background: t.bg, fontFamily: t.font }}>
      <div className="card-preview__card">
        <div
          className={`card-preview__flipper${flipped ? " is-flipped" : ""}`}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label={flipped ? "Show card details" : "Show QR code"}
          onClick={toggleFlip}
          onKeyDown={onKeyDown}
        >
          <div className="card-preview__face card-preview__face--front" style={faceStyle}>
            {data.logo && <img className="card-preview__logo" src={data.logo} alt="" />}
            {data.photo && (
              <img className="card-preview__photo" src={data.photo} alt="" style={{ border: `3px solid ${t.accent}` }} />
            )}
            <div className="card-preview__name" style={{ color: t.text }}>{data.name || "Your Name"}</div>
            {data.title && <div className="card-preview__title" style={{ color: t.sub }}>{data.title}</div>}
            {data.company && <div className="card-preview__company" style={{ color: t.accent }}>{data.company}</div>}
            {data.bio && <div className="card-preview__bio" style={{ color: t.sub }}>{data.bio}</div>}

            <div className="card-preview__rows">
              {data.phone && (
                <ContactRow href={`tel:${data.phone}`} live={live} style={{ color: t.text, borderBottom: `1px solid ${t.border}` }}>
                  <span>📱</span>{data.phone}
                </ContactRow>
              )}
              {data.email && (
                <ContactRow href={`mailto:${data.email}`} live={live} style={{ color: t.text, borderBottom: `1px solid ${t.border}` }}>
                  <span>✉️</span>{data.email}
                </ContactRow>
              )}
              {data.website && (
                <ContactRow
                  href={data.website.startsWith("http") ? data.website : `https://${data.website}`}
                  live={live}
                  style={{ color: t.text, borderBottom: `1px solid ${t.border}` }}
                >
                  <span>🌐</span>{data.website}
                </ContactRow>
              )}
            </div>

            {actSoc.length > 0 && (
              <div className="card-preview__socials">
                {actSoc.map((s) =>
                  live ? (
                    <a
                      key={s.key}
                      className="card-preview__social"
                      href={`${s.prefix}${data.socials[s.key]}`}
                      target="_blank"
                      rel="noopener"
                      onClick={(e) => e.stopPropagation()}
                      style={{ background: t.accent, color: t.accentText }}
                      dangerouslySetInnerHTML={{ __html: SOCIAL_ICON_SVG[s.key] }}
                    />
                  ) : (
                    <div
                      key={s.key}
                      className="card-preview__social"
                      style={{ background: t.accent, color: t.accentText }}
                      dangerouslySetInnerHTML={{ __html: SOCIAL_ICON_SVG[s.key] }}
                    />
                  )
                )}
              </div>
            )}

            {live ? (
              <a
                className="card-preview__cta"
                href={vcardUrl}
                download={`${(data.name || "contact").replace(/\s+/g, "_")}.vcf`}
                onClick={(e) => e.stopPropagation()}
                style={{ background: t.accent, color: t.accentText }}
              >
                <span dangerouslySetInnerHTML={{ __html: SAVE_ICON_SVG }} />
                Save Contact
              </a>
            ) : (
              <div className="card-preview__cta" style={{ background: t.accent, color: t.accentText }}>
                <span dangerouslySetInnerHTML={{ __html: SAVE_ICON_SVG }} />
                Save Contact
              </div>
            )}
          </div>

          <div className="card-preview__face card-preview__face--back" style={faceStyle}>
            <div className="card-preview__qr-label" style={{ color: t.text }}>Scan to view this card</div>
            {shareUrl ? (
              <img
                className="qr-wrap__img"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}&bgcolor=ffffff&color=000000&margin=8`}
                alt="QR code linking to this card"
              />
            ) : (
              <div className="card-preview__qr-empty" style={{ color: t.sub }}>
                Add a website or email to generate a QR code
              </div>
            )}
            {shareUrl && <div className="card-preview__qr-url" style={{ color: t.sub }}>{shareUrl}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
