// KI-Tagesbriefing des Cockpits.
//
// Deterministisch aus den Demo-Daten erzeugt (Stand 15.12.2025): die Lage in
// zwei Absätzen plus die drei Dinge, die heute Aufmerksamkeit brauchen.

import { AUFGABEN } from './tasks.js';
import { ZAHLUNGSEINGAENGE, NEUE_FAELLE } from './portfolio.js';
import { buildNbaQueue } from './nextBestActions.js';

export function buildTagesbriefing(entfernt = new Set(), freigegeben = new Set()) {
  const queue = buildNbaQueue(entfernt, freigegeben);
  const ueberfaellig = queue.filter(q => q.ueberfaellig);
  const freigaben = queue.filter(q => q.typ === 'freigabe');
  const top = queue[0];

  const heuteFaellig = AUFGABEN.filter(a => a.status === 'heute').length;

  const absaetze = [
    `Im Portfolio liegen ${queue.length} offene Aktionen, davon ${ueberfaellig.length} überfällig`
      + (freigaben.length ? ` und ${freigaben.length} Agenten-Vorschläge, die auf Ihre Freigabe warten` : '')
      + `. Heute werden zusätzlich ${heuteFaellig} Wiedervorlagen fällig.`,
    `Positiv: ${ZAHLUNGSEINGAENGE.count} Zahlungseingänge seit gestern — darunter die vollständige Tilgung von Braun, Thomas (1.890 EUR) und die letzte Rate der Klein KG (3.400 EUR). `
      + `Gegenläufig sind ${NEUE_FAELLE.count} neue Fälle mit je 18 Tagen Verzug in den Bestand gelaufen; die drei größten stehen unten in der Warteschlange.`,
  ];

  const schwerpunkte = [
    top && {
      titel: top.titel,
      grund: top.ueberfaellig ? 'Höchste Priorität — überfällig' : 'Höchste Priorität in der Warteschlange',
      kundeId: top.akteVorhanden ? top.kundeId : null,
    },
    freigaben[0] && {
      titel: freigaben[0].titel,
      grund: 'Agent wartet auf Freigabe',
      kundeId: freigaben[0].kundeId,
    },
    {
      titel: 'Drei Zahlungszusagen laufen auf den 23.–28.12.',
      grund: 'Der Ratenplan-Monitor überwacht die Eingänge automatisch',
      kundeId: 'K-2024-8847',
    },
  ].filter(Boolean).slice(0, 3);

  return { absaetze, schwerpunkte };
}
