import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/design/globals.css'
import { App } from '@/app/App'
import { applyStoredTheme } from '@/lib/useTheme'

applyStoredTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
