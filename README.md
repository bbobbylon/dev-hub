# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 1 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Find the primary design file under `project/` and read it top to bottom.** The chat transcripts will tell you which file the user was last iterating on. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `Coding Learning App Redesign` project files (HTML prototypes, assets, components)

## Project documentation (added after the port)

The bundle above is the original design handoff. The built app and its docs live alongside it:

- `app/` — the React 19 + Vite app, with its own `app/README.md` (architecture narrative, verification suites)
- `docs/SRS.md` — requirements: what the app does, for whom, and how success is measured
- `docs/ARCHITECTURE.md` — file-by-file map of the app, data models, design patterns, security
- `docs/UI-DESIGN.md` — the "Organic" design system, component library, layouts, accessibility
- `DEPLOYMENT.md` — how it got onto GitHub Pages (https://bbobbylon.github.io/dev-hub/) and how to redeploy or roll back
