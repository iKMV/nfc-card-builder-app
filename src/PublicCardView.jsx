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
        <div className="card-skeleton__avatar" />
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

export default function PublicCardView({ slug }) {
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    let cancelled = false;
    // Note: this effect relies on the router remounting PublicCardView with
    // a fresh `key={slug}` whenever the slug changes (see router.jsx), so
    // `state` always starts back at "loading" for a new slug without this
    // effect needing to reset it itself.
    fetch(`/api/cards/${slug}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) { setState({ status: "not-found" }); return; }
        if (!res.ok) { setState({ status: "error" }); return; }
        const json = await res.json();
        setState({ status: "ready", data: json.data });
      })
      .catch(() => { if (!cancelled) setState({ status: "error" }); });
    return () => { cancelled = true; };
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
