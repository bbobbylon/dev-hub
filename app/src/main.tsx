/**
 * Vite's entry point (wired via `index.html`'s `<script type="module" src="/src/main.tsx">`).
 * Mounts `App` into `#root`, imports the two global stylesheets once for the
 * whole app (design tokens, then app-layer rules that read them), and
 * establishes the router basename all `<Link>`/`<Route>` paths resolve under.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/organic.css'
import './styles/app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BASE_URL mirrors vite.config.ts's `base` (e.g. "/dev-hub/" on GitHub
        Pages), so routes resolve under the sub-path instead of at the root. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
