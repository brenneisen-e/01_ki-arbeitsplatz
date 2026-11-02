import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initNotizenRelay } from './utils/notizenRelay.js'

// Mausrad-Relay für die Einbettung in Banking Horizon (Speakernotes scrollen)
initNotizenRelay()

// Auto-Reload bei veralteten Chunks nach Deployment
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

// Catch alle unhandled dynamic import Fehler (veraltete Chunks)
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('dynamically imported module') ||
      e.reason?.message?.includes('Failed to fetch') ||
      e.reason?.message?.includes('Loading chunk')) {
    e.preventDefault();
    window.location.reload();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
