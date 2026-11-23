import { useState } from 'react';
import { Lock } from 'lucide-react';
import { pruefeZugang, zugangGespeichert, zugangMoeglich } from './zugang';

// Kennwortkarte vor den Notizen (siehe zugang.js). Solange sie steht, ist
// Notizen nicht gemountet: kein Herzschlag auf dem Kanal, der Arbeitsplatz
// leitet also auch kein Radeln um.
export default function Zugang({ children }) {
  const [offen, setOffen] = useState(zugangGespeichert);
  const [wert, setWert] = useState('');
  const [fehler, setFehler] = useState(false);
  const [prueft, setPrueft] = useState(false);
  if (offen) return children;
  const moeglich = zugangMoeglich();

  const absenden = async (e) => {
    e.preventDefault();
    if (!moeglich || prueft || !wert) return;
    setPrueft(true);
    const ok = await pruefeZugang(wert);
    setPrueft(false);
    if (ok) { setOffen(true); return; }
    setFehler(true);
    setWert('');
  };

  return (
    <div className="zugang">
      <form className="zugangKarte" onSubmit={absenden}>
        <div className="zugangIcon" aria-hidden="true"><Lock size={18} /></div>
        <h1>Speakernotes</h1>
        <p>
          {moeglich
            ? 'Die Notizen sind geschützt. Bitte das Kennwort eingeben.'
            : 'Die Prüfung braucht eine sichere Verbindung (https oder localhost).'}
        </p>
        <label className="zugangFeld">
          <span>Kennwort</span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={wert}
            disabled={!moeglich}
            aria-invalid={fehler || undefined}
            onChange={(e) => { setWert(e.target.value); setFehler(false); }}
          />
        </label>
        {fehler && <p className="zugangFehler" role="alert">Das Kennwort stimmt nicht.</p>}
        <button type="submit" className="knopf zugangKnopf" disabled={!moeglich || prueft || !wert}>Öffnen</button>
      </form>
    </div>
  );
}
