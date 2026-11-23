// Stellen des Arbeitsplatzes, zu denen die Notizen springen. Der Arbeitsplatz
// schreibt seinen Stand (kopplung.jsx), das Notizfenster leitet daraus die
// Stelle ab und springt zum gleichnamigen Anker `{#stelle}` im Skript. Ein
// Skript muss nicht jede Stelle führen: fehlt der Anker, bleibt es stehen.
//
// Stand: { modus, ansicht, reiter, assistent, topLead, anschreiben,
//          vorbereitung, praesSchritt, tagWeiter }
export const STELLEN = {
  landing: 'Landing Page',
  uebersicht: 'Übersicht',
  assistent: 'KI-Vertriebsassistent geöffnet (auf der Übersicht)',
  akte: 'Kundenakte, Reiter Stammdaten',
  finanzuebersicht: 'Kundenakte, Reiter Finanzübersicht',
  leads: 'Kundenakte, Reiter Leads',
  'top-lead': 'Top-Lead aufgeklappt',
  anschreiben: 'Fenster „Anschreiben formulieren“ offen',
  'naechster-tag': 'Demo-Uhr einen Tag weiter (Übersicht oder Stammdaten)',
  vorbereitung: 'KI-Gesprächsvorbereitung offen',
};

export function stelleAusStand(s) {
  if (!s) return null;
  // Fenster über der Seite gehen vor: sie verdecken, was darunter liegt.
  if (s.vorbereitung) return 'vorbereitung';
  if (s.anschreiben) return 'anschreiben';
  if (s.ansicht === 'landing') return 'landing';
  if (s.ansicht === 'overview' && s.reiter === 'uebersicht') {
    // Nach dem Weiterdrehen der Uhr landet der Arbeitsplatz auf der Übersicht
    // mit dem neuen Termin: das ist die spätere Stelle des Skripts, nicht der
    // Tagesstart. Dasselbe gilt für den letzten Schritt der Präsentation
    // (anstehende Termine mit dem Knopf zur Gesprächsvorbereitung).
    if (s.tagWeiter || s.praesSchritt === 'vorbereitung') return 'naechster-tag';
    return s.assistent ? 'assistent' : 'uebersicht';
  }
  if (s.ansicht === 'detail') {
    // Auf der Akte öffnet sich der Assistent von selbst, er zählt dort nicht.
    if (s.reiter === 'stammdaten') return s.tagWeiter ? 'naechster-tag' : 'akte';
    if (s.reiter === 'openfinance') return 'finanzuebersicht';
    if (s.reiter === 'impulse') return s.topLead ? 'top-lead' : 'leads';
  }
  return null;
}
