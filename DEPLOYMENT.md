# Deployment — Dev Hub

## The decision

**GitHub Pages, $0/month, no card.** Pure client-rendered Vite + React app
(`app/`) — no backend, no database, so this is the simplest of the portfolio's
repos to bring live (contrast with Luv2Shop/`AngularECommerceAppv2`, which
also needs a Render API + external MySQL).

## Branch note

This repo's default branch on GitHub is **`master`**, not `main` — the deploy
workflow triggers on `master` to match. A local `main` branch also exists but
is a stale orphan (11 commits behind, left over from repo creation) and is
not what's deployed anywhere; don't push it expecting it to go live. The
branch actually being worked on locally (`implement-design-handoff` at the
time this was written) was identical to `origin/master` commit-for-commit, so
merging/rebasing wasn't needed — just push it to `master`.

## What changed for Pages (2026-09-05)

GitHub Pages serves a project site from `https://bbobbylon.github.io/dev-hub/`
— a sub-path, not the domain root — which two things needed to account for:

- `app/vite.config.ts` — `base: '/dev-hub/'` for a production build (`npm run
  dev` stays at `/`). Override via the `BASE_PATH` repo variable (e.g. `/` if
  a custom domain is ever added).
- `app/src/main.tsx` — `<BrowserRouter basename={import.meta.env.BASE_URL}>`
  so react-router's routes resolve under that sub-path instead of at the root.
- `app/package.json` — added `@types/node` (devDependency only) so `tsc -b`
  can type-check `vite.config.ts`'s `process.env.BASE_PATH` read.
- `.github/workflows/deploy-pages.yml` — builds `app/`, copies the built
  `index.html` to `404.html` (GitHub Pages' mechanism for a client-side-routed
  SPA fallback — deep links and typos load the app instead of GitHub's own
  404 page), and deploys.

## Go-live runbook

1. Push to `master` (see branch note above).
2. Confirm Pages is enabled: the workflow tries itself
   (`actions/configure-pages` with `enablement: true`); if refused, Settings →
   Pages → Source: **GitHub Actions**.
3. Smoke test at `https://bbobbylon.github.io/dev-hub/`: the gallery loads,
   a lesson page opens, a hard refresh on a lesson URL still works (confirms
   the 404.html fallback), and progress/streak persistence survives a reload
   (`localStorage`, per `app/src/lib/progress`).
4. Update WebsiteHub's `InMemoryProjectRepository` `dev-hub` entry: `url` →
   the live Pages URL, `status` → `LIVE`, then `npm run shots -- --only
   dev-hub` there.

## It went live (2026-09-06) — steps 1–3 done

**`https://bbobbylon.github.io/dev-hub/`** is up.

Step 2 played out exactly as the workflow's own comment warned: run #1
attempt 1 failed at `actions/configure-pages`, because the default
`GITHUB_TOKEN` can't enable Pages on a repo's first deploy. Setting
Settings → Pages → Source: **GitHub Actions** by hand fixed it, and the
re-run (attempt 2) went green — build and deploy both. Nothing in the
workflow needed changing; leave `enablement: true` alone, it's a no-op now
that Pages exists.

Step 3 passed against the live site:

- Gallery renders all 24 cards.
- A cold navigation to `/dev-hub/quiz-mode` (never served as a real file)
  loads the app — the `404.html` fallback works. Note it answers with HTTP
  **404** and the app's HTML body; that's how Pages serves the fallback, and
  it's not a fault.
- Ran the Git Basics checkpoint end to end; the Progress Dashboard then read
  **20 %** quiz accuracy from the 1/5 attempt, and it survived a full reload.
  (The test attempt was cleared from the browser afterwards.)
- No console errors on any page visited.

**Caveat for every future Pages project on this account:** they all share the
`bbobbylon.github.io` origin, so they all share one `localStorage`. That
browser already carries keys from other projects (`dlh_progress_v1`,
`ng-bookmarks-v1`, `angular-practice-progress-v1`, a bare `theme`…). Dev Hub
is safe because it namespaces its key as `dev-hub.progress.v1` — keep new
keys prefixed, and be wary of the unprefixed `theme` key colliding with
another project's.

Step 4 (WebsiteHub) is still open: the local `websitehub` checkout at
`B:\Documents\Coding\websitehub` is a `.git` directory with no working tree,
so the `InMemoryProjectRepository` entry hasn't been repointed yet.

## The optional backend (`server/`) is not deployed

`server/` (Spring Boot, `docs/ARCHITECTURE.md` §11) exists only to sync progress across devices for
signed-in learners. It's untouched by everything above — the GitHub Pages deploy is still the same
$0/month static build it always was, with no backend configured, and every feature except sign-in
keeps working exactly as before. `npm run build` doesn't fail or change behavior because of it.

Hosting it for real is a separate, not-yet-made decision — it would mean:

- Picking somewhere to actually run it (a free-tier host like Railway/Render/Fly.io, or a paid one)
  plus a real MySQL instance, which is the first place this stops being $0/month.
- Setting `VITE_API_BASE_URL` as a build-time variable in `.github/workflows/deploy-pages.yml`
  (Vite env vars are baked in at build time, not read at runtime) pointing at that host's URL.
- Confirming `SecurityConfig`'s CORS origin list already covers `https://bbobbylon.github.io` (it
  does, as of this pass) and that the host's own `JWT_SECRET`/DB credentials are set as real secrets,
  never committed.

Until that happens the live site simply has no account layer: `apiEnabled` is `false`, so `App.tsx`
never registers `/sign-in` or `/sign-up` (both fall through to the 404 page) and `TopNav` renders no
"Sign in" link. That's the fix for what shipped on 2026-09-11, where the link appeared on all ~27
pages and the form only revealed "Sign-in isn't available in this deployment" after you'd typed an
email and a password into it. Learners who want their progress on a second browser use the Progress
Dashboard's export/import instead, which needs no backend. See `BACKLOG.md`.

One coupling to remember when the backend *does* go up: setting `VITE_API_BASE_URL` in the workflow
changes the route table, so `app/scripts/routes.mjs` needs the same variable exported for a verify
run to expect those two routes. Build and verify with it set, or with it unset — never one of each.

## Rollback

Actions → "Deploy to GitHub Pages" → re-run from the previous commit, or
revert and push.
