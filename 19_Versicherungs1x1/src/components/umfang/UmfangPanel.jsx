// ===========================================================================
// UmfangPanel — die Umfangssteuerung: welche Kapitel zeigt die App?
//
// Ein Dialog des Fundaments, erreichbar nur über ⌘/Strg + Umschalt + U. Er
// steht in keinem Menü und in keiner Tastaturhilfe. Änderungen wirken sofort
// (der Store filtert die Daten zentral) und bleiben auf diesem Gerät.
// Die Kapitelliste kommt aus `datenVoll` — hier und nur hier ist der ganze
// Stoff zu sehen; alle Zahlen der Wirkungszeile kommen aus dem gefilterten
// `kennzahlen` und zeigen damit genau, was ein Gast zu sehen bekommt.
// ===========================================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Eye } from 'lucide-react';
import { useWissen } from '../../store/Wissen.jsx';
import Dialog from '../ui/Dialog.jsx';
import Knopf from '../ui/Knopf.jsx';
import Segment from '../ui/Segment.jsx';
import { kapitelUmfang } from '../../store/umfang.js';
import { beschreibeWirkung, kopiereText } from './umfangHilfe.js';
import { mehrzahl } from '../../lib/format.js';
import { nummer } from '../../lib/text.js';

const PROFILE = [
  { wert: 'alles', label: 'Alles zeigen' },
  { wert: 'erstes', label: 'Nur das erste Kapitel' },
  { wert: 'auswahl', label: 'Eigene Auswahl' },
];

const KOPIERT_MS = 2000;

export default function UmfangPanel() {
  const { umfang, datenVoll, kennzahlen } = useWissen();
  const alle = datenVoll && Array.isArray(datenVoll.chapters) ? datenVoll.chapters : [];
  const sichtbar = new Set(umfang.sichtbar);
  const [kopiert, setKopiert] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => { if (!umfang.panelOffen) setKopiert(false); }, [umfang.panelOffen]);

  const kopiere = useCallback(async () => {
    const ok = await kopiereText(umfang.demoLink());
    setKopiert(ok);
    window.clearTimeout(timer.current);
    if (ok) timer.current = window.setTimeout(() => setKopiert(false), KOPIERT_MS);
  }, [umfang]);

  if (!umfang.panelOffen) return null;

  const wirkung = beschreibeWirkung({
    sichtbar: umfang.sichtbar.length,
    alle: alle.length,
    einheiten: kennzahlen.einheiten,
    fragen: kennzahlen.fragen,
    lesezeit: kennzahlen.lesezeitMinuten,
  });

  return (
    <Dialog
      offen
      onSchliessen={umfang.schliessePanel}
      titel="Umfang"
      beschreibung="Welche Kapitel die App zeigt. Wirkt sofort und bleibt auf diesem Gerät gespeichert."
      breite={640}
      className="umfang-dialog"
      fuss={(
        <div className="umfang-fuss">
          <Knopf variante="still" symbol={kopiert ? Check : Copy} onClick={kopiere}>
            {kopiert ? 'Kopiert' : 'Link mit diesem Umfang kopieren'}
          </Knopf>
          <span className="umfang-fuss-rechts">
            <Knopf variante="still" onClick={umfang.alleEinschalten}>Alles zeigen</Knopf>
            <Knopf variante="primaer" onClick={umfang.schliessePanel}>Schließen</Knopf>
          </span>
        </div>
      )}
    >
      <Segment
        label="Umfang wählen"
        optionen={PROFILE}
        wert={umfang.profil}
        onWechsel={umfang.setzeProfil}
        className="umfang-profile"
      />

      {alle.length === 0 ? (
        <p className="nebentext umfang-leer">Die Inhalte werden noch geladen.</p>
      ) : (
        <ul className="umfang-liste">
          {alle.map((k, i) => {
            const z = kapitelUmfang(k);
            return (
              <li key={k.id}>
                <label className="umfang-zeile">
                  <input
                    type="checkbox"
                    checked={sichtbar.has(k.id)}
                    onChange={() => umfang.schalteKapitel(k.id)}
                  />
                  <span className="umfang-zeile-nummer tabular" aria-hidden="true">{nummer(i)}</span>
                  <span className="umfang-zeile-titel">{k.title}</span>
                  <span className="umfang-zeile-meta">
                    {mehrzahl(z.einheiten, 'Lerneinheit', 'Lerneinheiten')} · {mehrzahl(z.fragen, 'Frage', 'Fragen')}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <label className="umfang-schalter">
        <input
          type="checkbox"
          checked={umfang.fortschrittZeigen}
          onChange={(e) => umfang.setzeFortschrittZeigen(e.target.checked)}
        />
        <span>
          <span className="umfang-schalter-titel">Fortschritt anzeigen</span>
          <span className="umfang-schalter-text">
            Aus: Ringe und „Dein Stand“ beginnen bei 0 %. Der gespeicherte Stand bleibt erhalten.
          </span>
        </span>
      </label>

      <p className="umfang-wirkung" role="status">
        <Eye size={14} aria-hidden="true" />
        <span>{wirkung}</span>
      </p>
    </Dialog>
  );
}
