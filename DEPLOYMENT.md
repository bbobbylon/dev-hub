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

## Rollback

Actions → "Deploy to GitHub Pages" → re-run from the previous commit, or
revert and push.
