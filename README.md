# TapKonek

*Connect with a Tap.*

TapKonek turns a single NFC card into a living digital business card. Tap
the card, open a profile, save the contact — and whenever your details
change, the same card keeps working. Cards can also be exported as a
standalone offline HTML file instead of published live, if you'd rather
self-host.

## Local development

```bash
npm install
npm run dev        # Vite only — the builder UI, no /api backend
```

Plain `npm run dev` is enough for everything except **Publish** and
**Save changes** in the Export tab, which call `/api/*` serverless
functions that plain Vite doesn't run. To exercise those locally:

```bash
npm run dev:full    # npx vercel dev — runs the app + /api together
```

## One-time setup for Publish/Save (per deployment)

1. Deploy once (`vercel` CLI, or connect the repo on vercel.com) so a
   Vercel project exists.
2. In the Vercel dashboard: **Storage → Marketplace → Upstash for Redis** →
   add it, linked to this project. This is what actually stores published
   cards — see `.env.example` for the env vars it injects.
3. `vercel env pull .env.local` to get those values locally (for
   `npm run dev:full`).
4. Optional: set `BUILDER_ACCESS_CODE` in the dashboard too, if you want to
   require a shared code before anyone can publish a *new* card (viewing
   and editing already-published cards is never gated by this).
5. Optional: set `ADMIN_PASSWORD` to enable `/admin` — a page listing every
   published card, with a "Reset edit link" button for anyone who lost
   theirs. It issues a *fresh* edit link and invalidates the old one (edit
   tokens are stored as a one-way hash, so the original is never
   recoverable — by admin or anyone else). Leaving this unset disables
   `/admin` entirely rather than leaving it open.

Without step 2, the app still works fully as a design tool and the
"Download HTML (PWA)" / "Download .vcf" static exports are unaffected —
only the "Publish Live Card" button will fail until Redis is connected.

## What's what

- `src/BuilderApp.jsx` — the editor UI (create *and* edit mode)
- `src/CardPreview.jsx` — the flip-card component, shared by the builder's
  own Preview tab and the public `/c/:slug` page
- `src/PublicCardView.jsx` — the live, hosted card page
- `src/AdminPage.jsx` — the `/admin` card directory + edit-link reset
- `src/cardModel.js` — themes, vCard generation, the static-HTML export
- `src/router.jsx` — a small hand-rolled router (`/`, `/edit/:slug`,
  `/c/:slug`, `/privacy`, `/admin`)
- `api/` — the Publish/Save/View serverless functions, plus `api/admin/`

---

<details>
<summary>Original Vite template notes</summary>

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

</details>
