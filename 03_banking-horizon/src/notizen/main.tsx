import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './notizen.css'
import { Notizen } from './Notizen'
import { Zugang } from './Zugang'
import { skriptStart } from './skripte'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Zugang sprache={skriptStart().sprache}>
      <Notizen />
    </Zugang>
  </StrictMode>,
)
