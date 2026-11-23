// Die Skripte des Notizfensters: je Modus des Arbeitsplatzes eines, als
// Markdown in docs/ (Aufbau und Anker siehe parse.js und stellen.js). Die
// Vermögensverwaltung hat kein Skript; dort bleibt das zuletzt gezeigte stehen.
import versicherung from '../../docs/speakernotes-versicherung.md?raw';
import banking from '../../docs/speakernotes-banking.md?raw';

// `titel` steht in der Skriptwahl im Kopf: kurz, damit die Kopfzeile in einem
// schmalen Fenster einzeilig bleibt.
export const SKRIPTE = [
  { id: 'versicherung', modus: 'versicherung', titel: 'Versicherung', markdown: versicherung },
  { id: 'banking', modus: 'banking', titel: 'Banking', markdown: banking },
];

export function skriptFuerModus(modus) {
  return SKRIPTE.find((s) => s.modus === modus) ?? null;
}

/** Skript aus `?skript=` in der Adresse (null, wenn keines genannt ist). */
export function skriptAusAdresse() {
  const id = new URLSearchParams(window.location.search).get('skript');
  return SKRIPTE.find((s) => s.id === id) ?? null;
}

/** Skript beim Start: die Adresse, sonst der Modus des Arbeitsplatzes, sonst das erste. */
export function skriptStart(stand) {
  return skriptAusAdresse() ?? skriptFuerModus(stand?.modus) ?? SKRIPTE[0];
}
