import { useEffect, useState } from "react";
import BuilderApp from "./BuilderApp";
import PublicCardView from "./PublicCardView";

// Deliberately no react-router dependency here — the app only ever has 3
// real routes, and that library churns its API surface across major
// versions (react-router-dom was removed entirely as of v8). A ~30-line
// hand-rolled router avoids that risk entirely.

function parseRoute(pathname, search) {
  if (pathname === "/" || pathname === "") {
    return { view: "create" };
  }
  const editMatch = pathname.match(/^\/edit\/([^/]+)\/?$/);
  if (editMatch) {
    const params = new URLSearchParams(search);
    return { view: "edit", slug: decodeURIComponent(editMatch[1]), editToken: params.get("t") || "" };
  }
  const viewMatch = pathname.match(/^\/c\/([^/]+)\/?$/);
  if (viewMatch) {
    return { view: "public", slug: decodeURIComponent(viewMatch[1]) };
  }
  return { view: "not-found" };
}

export default function Router() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname, window.location.search));

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute(window.location.pathname, window.location.search));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // `key={slug}` forces a clean remount (fresh state) whenever the route
  // points at a different card, rather than reusing the same component
  // instance with stale local state.
  if (route.view === "create") return <BuilderApp key="create" mode="create" />;
  if (route.view === "edit") return <BuilderApp key={route.slug} mode="edit" slug={route.slug} editToken={route.editToken} />;
  if (route.view === "public") return <PublicCardView key={route.slug} slug={route.slug} />;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#6b7280",
        textAlign: "center",
        padding: 24,
      }}
    >
      <p>Page not found. <a href="/">Go to the builder</a>.</p>
    </div>
  );
}
