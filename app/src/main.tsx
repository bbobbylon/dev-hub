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
