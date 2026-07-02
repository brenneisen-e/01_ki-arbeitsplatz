import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Holodeck } from './holodeck/Holodeck'
import './index.css'

// Standalone-Einstieg: das Holodeck ist hier die gesamte App — kein Landing-
// Chatbot, kein Strukturbild. Ohne onExit wird der „Zurück zum Chat"-Button
// in der Topbar nicht gerendert.
const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Missing #root element in index.html')

createRoot(rootEl).render(
  <StrictMode>
    <Holodeck />
  </StrictMode>,
)
