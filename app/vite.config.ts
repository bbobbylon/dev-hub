import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves project sites from a /<repo>/ sub-path, so a production
// build needs every asset URL (and the router — see main.tsx's basename,
// which reads this back via import.meta.env.BASE_URL) prefixed with it. Local
// dev (`npm run dev`) stays at "/". BASE_PATH lets the deploy workflow
// override this (e.g. to "/" for a future custom domain) without a code change.
//
// `vite preview` must use the same base as the build it's serving — its own
// `command` reads "serve", not "build", so checking `isPreview` too is what
// makes `npm run build && npm run preview` (the local verify workflow) work
// at all. Without it, preview serves the built dist at "/" while every asset
// URL baked into its index.html points at "/dev-hub/", 404ing everything.
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  // `||`, not `??`: the workflow's env step sets BASE_PATH to an empty
  // string (not unset) whenever the repo variable isn't configured.
  base: command === 'build' || isPreview ? (process.env.BASE_PATH || '/dev-hub/') : '/',
}))
