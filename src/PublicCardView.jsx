import { useEffect, useState } from "react";
import "./App.css";
import { THEMES } from "./cardModel";
import CardPreview from "./CardPreview";

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

function CardSkeleton() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f3f5" }}>
      <div className="card-skeleton">
        <img className="card-skeleton__logo" src="/logo-icon.png" alt="TapKonek" />
        <div className="card-skeleton__bar card-skeleton__bar--name" />
        <div className="card-skeleton__bar card-skeleton__bar--title" />
        <div className="card-skeleton__rows">
          <div className="card-skeleton__bar" />
          <div className="card-skeleton__bar" />
          <div className="card-skeleton__bar" />
        </div>
        <div className="card-skeleton__cta" />
      </div>
    </div>
  );
}

// A card that's already cached/fast can resolve in well under 100ms, which
// makes the branded skeleton (see CardSkeleton below) flash by too quickly
// to register as an intentional moment rather than a glitch. Floors the
// skeleton's display time at this long, never *adds* delay beyond what a
// slower load already takes on its own.
const MIN_SKELETON_MS = 500;

export default function PublicCardView({ slug }) {
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    let cancelled = false;
    let timeoutId;
    const startedAt = Date.now();

    // Delays applying `next` just enough to make up the difference to
    // MIN_SKELETON_MS — a no-op once a load has already taken that long.
    const finish = (next) => {
      const wait = Math.max(0, MIN_SKELETON_MS - (Date.now() - startedAt));
      timeoutId = setTimeout(() => {
        if (!cancelled) setState(next);
      }, wait);
    };

    // Note: this effect relies on the router remounting PublicCardView with
    // a fresh `key={slug}` whenever the slug changes (see router.jsx), so
    // `state` always starts back at "loading" for a new slug without this
    // effect needing to reset it itself.
    fetch(`/api/cards/${slug}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) { finish({ status: "not-found" }); return; }
        if (!res.ok) { finish({ status: "error" }); return; }
        const json = await res.json();
        finish({ status: "ready", data: json.data });
      })
      .catch(() => { if (!cancelled) finish({ status: "error" }); });

    return () => { cancelled = true; clearTimeout(timeoutId); };
  }, [slug]);

  useEffect(() => {
    if (state.status === "ready" && state.data?.name) {
      document.title = `${state.data.name} — Contact`;
    }
  }, [state]);

  if (state.status === "loading") return <CardSkeleton />;
  if (state.status === "not-found") return <CenteredPage>This card doesn't exist. Check the link and try again.</CenteredPage>;
  if (state.status === "error") return <CenteredPage>Couldn't load this card. Check your connection and try again.</CenteredPage>;

  const theme = THEMES[state.data.theme] || THEMES.minimal;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg }}>
      <CardPreview data={state.data} theme={state.data.theme} live />
    </div>
  );
}
