import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves project sites from a /<repo>/ sub-path, so a production
// build needs every asset URL (and the router — see main.tsx's basename,
// which reads this back via import.meta.env.BASE_URL) prefixed with it. Local
// dev (`npm run dev`) stays at "/". BASE_PATH lets the deploy workflow
// override this (e.g. to "/" for a future custom domain) without a code change.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // `||`, not `??`: the workflow's env step sets BASE_PATH to an empty
  // string (not unset) whenever the repo variable isn't configured.
  base: command === 'build' ? (process.env.BASE_PATH || '/dev-hub/') : '/',
}))
