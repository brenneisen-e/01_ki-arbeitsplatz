import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './notizen.css';
import Notizen from './Notizen';
import Zugang from './Zugang';

// Zweite Seite des Vertriebsarbeitsplatzes (speakernotes.html): das
// Notizfenster mit den Speakernotes, hinter der Kennwortkarte.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Zugang>
      <Notizen />
    </Zugang>
  </StrictMode>,
);
