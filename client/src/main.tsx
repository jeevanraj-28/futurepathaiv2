import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

try {
  if (localStorage.getItem('futurepath_lang') === 'hi') document.documentElement.lang = 'hi'
} catch {
  /* storage unavailable: stay in English */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
