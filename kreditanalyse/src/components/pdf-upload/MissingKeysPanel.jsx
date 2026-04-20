/**
 * MissingKeysPanel.jsx
 *
 * Zeigt an, welche aus Sicht der Masken erwarteten Felder der Parser in
 * dieser PDF NICHT finden konnte. Damit weiß der Analyst, welche Werte er
 * manuell nachtragen muss.
 */

import { AlertTriangle } from 'lucide-react';
import { MASKEN_MAPPING } from '../../data/maskenMapping';

export default function MissingKeysPanel({ missingKeys }) {
  if (!missingKeys || missingKeys.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-100 text-amber-700 shrink-0">
          <AlertTriangle size={16} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-headline font-semibold text-amber-900">
            Nicht automatisch erkannt
          </div>
          <p className="text-xs text-amber-800 font-body mt-1">
            Folgende Felder konnten aus der PDF nicht zweifelsfrei extrahiert werden und müssen
            in der jeweiligen Maske händisch erfasst werden:
          </p>
          <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {missingKeys.map((key) => {
              const m = MASKEN_MAPPING[key];
              if (!m) return null;
              return (
                <li
                  key={key}
                  className="flex items-baseline gap-2 text-xs font-body text-amber-900"
                >
                  <span className="w-1 h-1 rounded-full bg-amber-700 shrink-0" />
                  <span className="font-semibold">{m.label}</span>
                  <span className="text-amber-700/80 truncate">
                    &rsaquo; {m.maskLabel}
                    {m.section ? ` · ${m.section}` : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
