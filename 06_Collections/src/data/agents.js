// Angedeutete Agenten des Collections-Tools.
//
// Drei Agenten arbeiten je Akte im Hintergrund: der Zahlungswächter (erkennt
// Eingänge und Rückläufer), der Mahn-Agent (erstellt und versendet Mahnungen)
// und der Ratenplan-Monitor (überwacht Zusagen und Vereinbarungen). Ihre
// Aktivität wird deterministisch aus der Transaktionshistorie, der Mahnstufe
// und dem Status der Akte abgeleitet — Routineschritte gelten als autonom
// erledigt, heikle Schritte warten auf menschliche Freigabe.

import { CUSTOMER_DETAILS, getFullCustomerData } from './customerDetails.js';

export const AGENTEN = {
  zahlungswaechter: {
    id: 'zahlungswaechter',
    name: 'Zahlungswächter',
    beschreibung: 'Erkennt Zahlungseingänge und Lastschriftrückgaben, verbucht und bewertet neu.',
  },
  mahnagent: {
    id: 'mahnagent',
    name: 'Mahn-Agent',
    beschreibung: 'Erstellt Mahnschreiben nach Mahnstrecke und versendet sie fristgerecht.',
  },
  ratenplanmonitor: {
    id: 'ratenplanmonitor',
    name: 'Ratenplan-Monitor',
    beschreibung: 'Überwacht Zahlungszusagen und Ratenvereinbarungen, erkennt gebrochene Zusagen.',
  },
  dossieragent: {
    id: 'dossieragent',
    name: 'Dossier-Agent',
    beschreibung: 'Hält Fallzusammenfassung, Gesprächspunkte und Entwürfe aktuell.',
  },
};

const MAHN_DATEN = ['01.10.2025, 08:00', '01.11.2025, 08:00', '01.12.2025, 09:15'];

/**
 * Aktivitäts-Feed der Agenten für eine Akte, jüngste zuerst.
 * Eintrag: { id, agent, titel, detail, zeitpunkt, status: 'autonom'|'freigabe',
 *            sort } — 'freigabe' bedeutet: wartet auf menschliche Freigabe.
 */
export function buildAgentenFeed(customer) {
  const feed = [];
  const trans = customer.transaktionen || [];
  let sort = 100;

  // Zahlungswächter: jede Transaktion ist ein beobachtetes Ereignis.
  trans.forEach(t => {
    sort -= 1;
    if (t.betrag > 0) {
      feed.push({
        id: `zw-${t.datum}-${t.betrag}`,
        agent: 'zahlungswaechter',
        titel: `Zahlungseingang ${Math.abs(t.betrag).toLocaleString('de-DE')} EUR verbucht`,
        detail: `${t.beschreibung} — Saldo und Scoring automatisch aktualisiert.`,
        zeitpunkt: t.datum,
        status: 'autonom',
        sort,
      });
    } else if (t.status === 'rueckgabe') {
      feed.push({
        id: `zw-rg-${t.datum}`,
        agent: 'zahlungswaechter',
        titel: 'Lastschriftrückgabe erkannt',
        detail: `${t.beschreibung} über ${Math.abs(t.betrag).toLocaleString('de-DE')} EUR — Fall neu bewertet, Willingness-Score gesenkt.`,
        zeitpunkt: t.datum,
        status: 'autonom',
        sort,
      });
    }
  });

  // Zahlungswächter: nach der zweiten Rückgabe schlägt er die Sperre vor.
  const rueckgaben = trans.filter(t => t.status === 'rueckgabe').length;
  if (rueckgaben >= 2 && customer.status !== 'Bezahlt') {
    feed.push({
      id: 'zw-sperre',
      agent: 'zahlungswaechter',
      titel: 'Lastschriftsperre vorgeschlagen',
      detail: `${rueckgaben} Rückgaben in Folge — der Agent empfiehlt, weitere Einzüge zu stoppen, um Gebühren zu vermeiden.`,
      zeitpunkt: '12.12.2025, 07:40',
      status: 'freigabe',
      sort: 210,
    });
  }

  // Mahn-Agent: Mahnstrecke bis zur aktuellen Stufe, nächster Schritt als Freigabe.
  for (let stufe = 1; stufe <= Math.min(customer.mahnstufe || 0, 3); stufe++) {
    feed.push({
      id: `ma-${stufe}`,
      agent: 'mahnagent',
      titel: `${stufe}. Mahnung erstellt und versandt`,
      detail: stufe === 3
        ? 'Letzte außergerichtliche Aufforderung, Frist 15.12.2025 — Zustellung per Post bestätigt.'
        : 'Nach Mahnstrecke automatisch erstellt, Zustellung bestätigt.',
      zeitpunkt: MAHN_DATEN[stufe - 1],
      status: 'autonom',
      sort: 150 + stufe,
    });
  }
  if ((customer.mahnstufe || 0) >= 3 && customer.status !== 'Bezahlt') {
    feed.push({
      id: 'ma-inkasso',
      agent: 'mahnagent',
      titel: 'Inkasso-Übergabe vorbereitet',
      detail: 'Frist der 3. Mahnung läuft am 15.12.2025 ab. Unterlagen sind zusammengestellt — die Übergabe wartet auf Ihre Freigabe.',
      zeitpunkt: '14.12.2025, 06:30',
      status: 'freigabe',
      sort: 220,
    });
  }

  // Ratenplan-Monitor: Zusagen und Vereinbarungen.
  if (customer.status === 'Zusage' || /Zusage/i.test(customer.workflowStatus || '')) {
    feed.push({
      id: 'rm-zusage',
      agent: 'ratenplanmonitor',
      titel: 'Zahlungszusage wird überwacht',
      detail: 'Der Agent prüft den Eingang zum zugesagten Termin und meldet sich nur bei Ausbleiben.',
      zeitpunkt: '13.12.2025, 09:00',
      status: 'autonom',
      sort: 140,
    });
  }
  if (customer.segment === 'restrukturierung') {
    feed.push({
      id: 'rm-ratenplan',
      agent: 'ratenplanmonitor',
      titel: 'Ratenplan-Angebot vorbereitet',
      detail: 'Aus der Haushaltsrechnung wurde eine tragfähige Rate abgeleitet. Das Angebot wartet auf Ihre Freigabe.',
      zeitpunkt: '13.12.2025, 11:20',
      status: 'freigabe',
      sort: 205,
    });
  }

  // Dossier-Agent: hält die Akte aktuell — immer der jüngste autonome Eintrag.
  feed.push({
    id: 'da-dossier',
    agent: 'dossieragent',
    titel: 'Fall-Dossier aktualisiert',
    detail: 'Zusammenfassung, Risiken und Gesprächspunkte wurden auf den Stand 15.12.2025 gebracht.',
    zeitpunkt: '15.12.2025, 06:05',
    status: 'autonom',
    sort: 200,
  });

  return feed.sort((a, b) => b.sort - a.sort);
}

/** Alle ausstehenden Freigaben über die ausgebauten Akten hinweg. */
export function buildOffeneFreigaben() {
  const liste = [];
  Object.keys(CUSTOMER_DETAILS).forEach(id => {
    const c = getFullCustomerData(id);
    if (c.status === 'Bezahlt') return;
    buildAgentenFeed(c)
      .filter(e => e.status === 'freigabe')
      .forEach(e => liste.push({ ...e, kundeId: id, kunde: c.name }));
  });
  return liste;
}

/** Kennzahlen für die Agenten-Statuskarte im Cockpit. */
export function buildAgentenStatus(freigegeben = new Set()) {
  const freigaben = buildOffeneFreigaben().filter(f => !freigegeben.has(`${f.kundeId}:${f.id}`));
  let autonomHeute = 0;
  Object.keys(CUSTOMER_DETAILS).forEach(id => {
    const c = getFullCustomerData(id);
    autonomHeute += buildAgentenFeed(c).filter(e =>
      e.status === 'autonom' && /1[3-5]\.12\.2025/.test(e.zeitpunkt)).length;
  });
  return {
    agenten: Object.values(AGENTEN),
    autonomHeute,
    offeneFreigaben: freigaben,
  };
}
