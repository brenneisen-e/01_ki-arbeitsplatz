// Collections Assistent - Datenbasis und Abfragelogik.
// Portiert aus js/banken-chat.js. Statt HTML-Strings liefert processQuery
// strukturierte Bloecke, die die React-Komponente rendert.

export { WEITERE_FAELLE as CHAT_CUSTOMERS } from './customers.js';
import { WEITERE_FAELLE as CHAT_CUSTOMERS } from './customers.js';
import { getFullCustomerData } from './customerDetails.js';
import { buildDossier, buildEntwuerfe } from './copilot.js';
import { buildNbaQueue } from './nextBestActions.js';

export const CHAT_PAYMENTS = [
  { id: 'Z-2024-1234', kundeId: 'K-2024-0010', kunde: 'Fischer, Hans', betrag: 2500, datum: '15.12.2025', art: 'Teilzahlung' },
  { id: 'Z-2024-1235', kundeId: 'K-2024-0003', kunde: 'Weber KG', betrag: 8900, datum: '14.12.2025', art: 'Ratenzahlung' },
  { id: 'Z-2024-1236', kundeId: 'K-2024-0012', kunde: 'Neumann, Klaus', betrag: 15600, datum: '14.12.2025', art: 'Ratenzahlung' },
  { id: 'Z-2024-1237', kundeId: 'K-2024-0002', kunde: 'Schmidt, Peter', betrag: 3200, datum: '13.12.2025', art: 'Teilzahlung' },
  { id: 'Z-2024-1238', kundeId: 'K-2024-0011', kunde: 'Bäckerei Schulze', betrag: 5400, datum: '12.12.2025', art: 'Ratenzahlung' },
  { id: 'Z-2024-1239', kundeId: 'K-2024-0008', kunde: 'Lehmann, Sandra', betrag: 4800, datum: '11.12.2025', art: 'Teilzahlung' },
  { id: 'Z-2024-1240', kundeId: 'K-2024-0013', kunde: 'Gasthaus zum Löwen', betrag: 12100, datum: '10.12.2025', art: 'Ratenzahlung' },
];

export const CHAT_BEISPIELE = [
  'Kunden mit höchster Restforderung',
  'Kunden mit höchster Rückzahlungschance',
  'Kunden mit längster Verzugsdauer',
  'Neue Fälle dieser Woche',
  'Zahlungseingänge der letzten Woche',
  'Vereinbarungen in Bearbeitung',
];

const FOLGEFRAGEN = [
  'Portfolio-Übersicht',
  'Fälle mit mehr als 90 DPD',
  'Zeige alle Eskalation-Fälle',
];

const eur = n => '€' + n.toLocaleString('de-DE');

function kundenBlock(items, opts = {}) {
  return {
    art: 'kunden',
    items: items.map(c => ({
      id: c.id,
      name: c.name,
      zeilen: opts.zeile ? opts.zeile(c) : [eur(c.forderung), `${c.dpd} DPD`, c.status],
    })),
    nummeriert: opts.nummeriert !== false,
  };
}

export const KONTEXT_BEISPIELE = [
  'Fasse den Fall zusammen',
  'Warum diese Empfehlung?',
  'Formuliere eine Zahlungserinnerung',
  'Was ist die nächste beste Aktion?',
];

/**
 * Fallbezogene Fragen, wenn eine Akte geoeffnet ist. Liefert null, wenn die
 * Frage nicht fallbezogen ist — dann greifen die Portfolio-Abfragen.
 */
function processKontextQuery(message, ctx) {
  if (!ctx?.akteId) return null;
  const lower = message.toLowerCase();
  const customer = getFullCustomerData(ctx.akteId);
  const folgefragen = KONTEXT_BEISPIELE.filter(f => f.toLowerCase() !== lower);

  // Zusammenfassung / Lage
  if (/zusammenfass|fasse|kurzlage|dossier|worum geht|lage/.test(lower)) {
    const d = buildDossier(customer);
    return {
      titel: `Fall ${customer.name} — Kurzdossier`,
      bloecke: [
        ...d.lage.map(text => ({ art: 'text', text })),
        { art: 'liste', titel: 'Risiken', items: d.risiken.map(r => ({ label: r })) },
        { art: 'liste', titel: 'Gesprächspunkte', items: d.gespraechspunkte.map(g => ({ label: g })) },
      ],
      aktionen: [{ art: 'akte-oeffnen', label: 'Vollständiges Dossier in der Akte öffnen', id: ctx.akteId, sektion: 'ki-analyse' }],
      folgefragen,
    };
  }

  // Begruendung der Empfehlung / naechste Aktion
  if (/warum|begründ|empfehl|nächste|naechste|aktion|was (soll|tun)/.test(lower)) {
    const d = buildDossier(customer);
    const nba = buildNbaQueue().find(q => q.kundeId === ctx.akteId);
    return {
      titel: `Empfehlung für ${customer.name}: ${d.empfehlung.massnahme}`,
      bloecke: [
        { art: 'text', text: d.empfehlung.begruendung },
        nba && { art: 'text', text: `Nächste beste Aktion: ${nba.titel} (${nba.faellig}, Konfidenz ${nba.konfidenz} %).`, betont: true },
        { art: 'liste', titel: 'Die nächsten Schritte', items: d.empfehlung.schritte.map(x => ({ label: x })) },
        { art: 'kennzahlen', items: d.empfehlung.kennzahlen.map(k => ({ label: k.label, wert: k.wert })) },
      ].filter(Boolean),
      aktionen: [{ art: 'akte-oeffnen', label: 'In der Akte ansehen', id: ctx.akteId, sektion: 'ki-analyse' }],
      folgefragen,
    };
  }

  // Entwurf formulieren
  if (/entwurf|formulier|schreib|mahnung|erinnerung|ratenplan|termin/.test(lower)) {
    const entwuerfe = buildEntwuerfe(customer);
    const passend =
      /ratenplan|rate/.test(lower) ? entwuerfe.find(e => e.id === 'ratenplan')
        : /termin|gespräch/.test(lower) ? entwuerfe.find(e => e.id === 'gespraech')
          : entwuerfe.find(e => e.id === 'erinnerung') || entwuerfe[0];
    return {
      titel: `Entwurf für ${customer.name}: ${passend.titel}`,
      bloecke: [
        { art: 'entwurf', entwurf: passend },
        { art: 'text', text: 'Aus der Akte generiert — bitte vor Versand prüfen.' },
      ],
      aktionen: [{ art: 'akte-oeffnen', label: 'Alle Entwürfe in der Akte', id: ctx.akteId, sektion: 'ki-analyse' }],
      folgefragen,
    };
  }

  return null;
}

/**
 * Beantwortet eine Nutzerfrage. Rueckgabe:
 *   { titel, bloecke: [...], aktionen: [...], export: {...}, folgefragen: [...] }
 * Bloecke: { art: 'kunden' | 'text' | 'liste' | 'kennzahlen' | 'entwurf', ... }
 * ctx: { akteId, akteName } der aktuell geoeffneten Akte, falls vorhanden.
 */
export function processQuery(message, ctx = null) {
  const kontext = processKontextQuery(message, ctx);
  if (kontext) return kontext;

  const lower = message.toLowerCase();

  // Hoechste Restforderung
  if ((lower.includes('restforderung') || lower.includes('höchste') || lower.includes('größte') || lower.includes('top')) &&
      (lower.includes('forderung') || lower.includes('kunden') || lower.includes('ausstehend'))) {
    const countMatch = message.match(/(\d+)/);
    const count = countMatch ? parseInt(countMatch[1], 10) : 5;
    const sorted = [...CHAT_CUSTOMERS].sort((a, b) => b.forderung - a.forderung).slice(0, count);
    const total = sorted.reduce((s, c) => s + c.forderung, 0);
    return {
      titel: 'Kunden mit höchster Restforderung',
      icon: 'chart',
      bloecke: [kundenBlock(sorted), { art: 'text', text: `Summe: ${eur(total)}`, betont: true }],
      aktionen: [{ art: 'filter-kunden', label: `Diese ${count} Kunden in Liste anzeigen`, ids: sorted.map(c => c.id) }],
      exportName: 'Hoechste_Restforderung',
      exportItems: sorted,
      folgefragen: FOLGEFRAGEN,
    };
  }

  // Hoechste Rueckzahlungschance
  if (lower.includes('rückzahlung') || lower.includes('chance') || lower.includes('wahrscheinlich')) {
    const sorted = [...CHAT_CUSTOMERS]
      .filter(c => c.segment === 'prioritaet' || c.dpd < 30)
      .sort((a, b) => a.dpd - b.dpd)
      .slice(0, 5);
    return {
      titel: 'Kunden mit höchster Rückzahlungschance',
      icon: 'check',
      bloecke: [kundenBlock(sorted, {
        zeile: c => [eur(c.forderung), `${c.dpd} DPD`, `${Math.max(95 - c.dpd * 2, 45)} % Chance`],
      })],
      aktionen: [{ art: 'filter-kunden', label: 'Diese Kunden in Liste anzeigen', ids: sorted.map(c => c.id) }],
      exportName: 'Hoechste_Rueckzahlungschance',
      exportItems: sorted,
      folgefragen: FOLGEFRAGEN,
    };
  }

  // Laengste Verzugsdauer
  if (lower.includes('verzug') || lower.includes('längste') || lower.includes('älteste')) {
    const sorted = [...CHAT_CUSTOMERS].sort((a, b) => b.dpd - a.dpd).slice(0, 5);
    return {
      titel: 'Kunden mit längster Verzugsdauer',
      icon: 'clock',
      bloecke: [kundenBlock(sorted, {
        zeile: c => [`${c.dpd} Tage überfällig`, eur(c.forderung), c.status],
      })],
      aktionen: [{ art: 'filter-kunden', label: 'Diese Kunden in Liste anzeigen', ids: sorted.map(c => c.id) }],
      exportName: 'Laengste_Verzugsdauer',
      exportItems: sorted,
      folgefragen: FOLGEFRAGEN,
    };
  }

  // Neue Faelle
  if (lower.includes('neue') || lower.includes('neu') || lower.includes('diese woche') || lower.includes('dieser woche')) {
    const neu = [...CHAT_CUSTOMERS].filter(c => c.dpd <= 14 && c.dpd > 0).sort((a, b) => a.dpd - b.dpd);
    const total = neu.reduce((s, c) => s + c.forderung, 0);
    return {
      titel: `Neue Fälle dieser Woche: ${neu.length}`,
      icon: 'plus',
      bloecke: [
        kundenBlock(neu, { zeile: c => [eur(c.forderung), `seit ${c.dpd} Tagen`, c.status] }),
        { art: 'text', text: `Neue Forderungen gesamt: ${eur(total)}`, betont: true },
      ],
      aktionen: [{ art: 'filter-kunden', label: 'Neue Fälle in Liste anzeigen', ids: neu.map(c => c.id) }],
      exportName: 'Neue_Faelle',
      exportItems: neu,
      folgefragen: FOLGEFRAGEN,
    };
  }

  // Vereinbarungen
  if (lower.includes('vereinbarung') || lower.includes('aktive') || lower.includes('bearbeitung')) {
    const v = CHAT_CUSTOMERS.filter(c => c.status === 'Vereinbarung' || c.segment === 'restrukturierung');
    const total = v.reduce((s, c) => s + c.forderung, 0);
    return {
      titel: `Vereinbarungen in Bearbeitung: ${v.length}`,
      icon: 'refresh',
      bloecke: [
        kundenBlock(v),
        { art: 'text', text: `Forderungen in Vereinbarung: ${eur(total)}`, betont: true },
      ],
      aktionen: [
        { art: 'filter-kunden', label: 'Diese Kunden in Liste anzeigen', ids: v.map(c => c.id) },
        { art: 'segment', label: 'Restrukturierung-Segment anzeigen', segment: 'restructure' },
      ],
      exportName: 'Aktive_Vereinbarungen',
      exportItems: v,
      folgefragen: FOLGEFRAGEN,
    };
  }

  // Zahlungseingaenge
  if (lower.includes('zahlung') || lower.includes('eingang') || lower.includes('bezahlt') || lower.includes('ausgeglichen')) {
    const isWeek = lower.includes('woche') || lower.includes('letzte');
    const total = CHAT_PAYMENTS.reduce((s, p) => s + p.betrag, 0);
    return {
      titel: `Zahlungseingänge${isWeek ? ' der letzten Woche' : ''}`,
      icon: 'payment',
      bloecke: [
        {
          art: 'kunden',
          nummeriert: false,
          items: CHAT_PAYMENTS.map(p => ({
            id: p.kundeId, name: p.kunde, zeilen: [eur(p.betrag), p.datum, p.art],
          })),
        },
        { art: 'text', text: `Gesamt: ${eur(total)} (${CHAT_PAYMENTS.length} Zahlungen)`, betont: true },
      ],
      aktionen: [{ art: 'filter-kunden', label: 'Diese Kunden in Liste anzeigen', ids: CHAT_PAYMENTS.map(p => p.kundeId) }],
      exportName: 'Zahlungseingaenge',
      exportItems: CHAT_PAYMENTS.map(p => ({ id: p.kundeId, name: p.kunde, forderung: p.betrag, dpd: 0, segment: '-', status: p.art })),
      folgefragen: FOLGEFRAGEN,
    };
  }

  // Eskalation
  if (lower.includes('eskalation') || lower.includes('inkasso')) {
    const f = CHAT_CUSTOMERS.filter(c => c.segment === 'eskalation');
    return {
      titel: `Eskalation-Fälle (Inkasso): ${f.length}`,
      icon: 'alert',
      bloecke: [kundenBlock(f, { nummeriert: false })],
      aktionen: [
        { art: 'segment', label: 'Eskalation-Segment in Matrix anzeigen', segment: 'escalate' },
        { art: 'filter-kunden', label: 'In Liste anzeigen', ids: f.map(c => c.id) },
      ],
      exportName: 'Eskalation_Faelle',
      exportItems: f,
      folgefragen: FOLGEFRAGEN,
    };
  }

  // Restrukturierung
  if (lower.includes('restrukturierung') || lower.includes('stundung')) {
    const f = CHAT_CUSTOMERS.filter(c => c.segment === 'restrukturierung');
    return {
      titel: `Restrukturierung-Fälle: ${f.length}`,
      icon: 'refresh',
      bloecke: [kundenBlock(f, { nummeriert: false })],
      aktionen: [
        { art: 'segment', label: 'Restrukturierung-Segment in Matrix anzeigen', segment: 'restructure' },
        { art: 'filter-kunden', label: 'In Liste anzeigen', ids: f.map(c => c.id) },
      ],
      exportName: 'Restrukturierung_Faelle',
      exportItems: f,
      folgefragen: FOLGEFRAGEN,
    };
  }

  // DPD-Filter
  if (lower.includes('dpd') || (lower.includes('überfällig') && !lower.includes('längste'))) {
    const m = message.match(/(\d+)\s*(?:dpd|tage)/i);
    const minDpd = m ? parseInt(m[1], 10) : 90;
    const f = CHAT_CUSTOMERS.filter(c => c.dpd > minDpd).sort((a, b) => b.dpd - a.dpd);
    const bucket = minDpd >= 90 ? '90+' : (minDpd >= 30 ? '31-90' : '0-30');
    return {
      titel: `Fälle mit mehr als ${minDpd} DPD: ${f.length}`,
      icon: 'clock',
      bloecke: [kundenBlock(f, { nummeriert: false, zeile: c => [`${c.dpd} Tage überfällig`, eur(c.forderung), c.status] })],
      aktionen: [
        { art: 'dpd-bucket', label: 'DPD-Bucket im Dashboard anzeigen', bucket },
        { art: 'filter-kunden', label: `${f.length} Kunden in Liste anzeigen`, ids: f.map(c => c.id) },
      ],
      exportName: `DPD_ueber_${minDpd}`,
      exportItems: f,
      folgefragen: FOLGEFRAGEN,
    };
  }

  // Portfolio-Uebersicht
  if (lower.includes('übersicht') || lower.includes('portfolio') || lower.includes('gesamt')) {
    const total = CHAT_CUSTOMERS.reduce((s, c) => s + c.forderung, 0);
    const avgDpd = Math.round(CHAT_CUSTOMERS.reduce((s, c) => s + c.dpd, 0) / CHAT_CUSTOMERS.length);
    const zaehl = seg => CHAT_CUSTOMERS.filter(c => c.segment === seg).length;
    const zahlungen = CHAT_PAYMENTS.reduce((s, p) => s + p.betrag, 0);
    return {
      titel: 'Portfolio-Übersicht',
      icon: 'chart',
      bloecke: [
        {
          art: 'kennzahlen',
          items: [
            { label: 'Gesamtforderung', wert: eur(total) },
            { label: 'Aktive Fälle', wert: String(CHAT_CUSTOMERS.length) },
            { label: 'Ø DPD', wert: `${avgDpd} Tage` },
            { label: 'Letzte Zahlungen (7 Tage)', wert: eur(zahlungen) },
          ],
        },
        {
          art: 'liste',
          titel: 'Segmente',
          items: [
            { label: 'Eskalation', wert: `${zaehl('eskalation')} Fälle`, color: '#ef4444' },
            { label: 'Priorität', wert: `${zaehl('prioritaet')} Fälle`, color: '#22c55e' },
            { label: 'Restrukturierung', wert: `${zaehl('restrukturierung')} Fälle`, color: '#eab308' },
            { label: 'Abwicklung', wert: `${zaehl('abwicklung')} Fälle`, color: '#94a3b8' },
          ],
        },
      ],
      aktionen: [],
      exportName: 'Portfolio_Uebersicht',
      exportItems: CHAT_CUSTOMERS,
      folgefragen: FOLGEFRAGEN,
    };
  }

  // Kundensuche
  if (lower.includes('kunde') || lower.includes('suche') || lower.includes('finde')) {
    const m = message.match(/(?:kunde|suche|finde)\s+(.+)/i);
    if (m) {
      const term = m[1].trim().toLowerCase();
      const found = CHAT_CUSTOMERS.find(c =>
        c.name.toLowerCase().includes(term) || c.id.toLowerCase().includes(term));
      if (found) {
        return {
          titel: `Gefunden: ${found.name}`,
          icon: 'search',
          bloecke: [{
            art: 'kennzahlen',
            items: [
              { label: 'ID', wert: found.id },
              { label: 'Forderung', wert: eur(found.forderung) },
              { label: 'DPD', wert: `${found.dpd} Tage` },
              { label: 'Segment', wert: found.segment },
              { label: 'Status', wert: found.status },
            ],
          }],
          aktionen: [{ art: 'kunde-oeffnen', label: 'Kundendetail öffnen', id: found.id }],
          folgefragen: FOLGEFRAGEN,
        };
      }
      return {
        titel: `Kein Kunde mit „${m[1]}" gefunden`,
        icon: 'x',
        bloecke: [{ art: 'text', text: 'Durchsuchen Sie die Kundenliste im Dashboard nach weiteren Fällen.' }],
        aktionen: [],
        folgefragen: FOLGEFRAGEN,
      };
    }
  }

  // Fallback
  return {
    titel: 'Verfügbare Abfragen',
    icon: 'lightbulb',
    bloecke: [
      { art: 'text', text: `Ihre Anfrage: „${message}"` },
      {
        art: 'liste',
        titel: 'Beispiele',
        items: [
          { label: 'Kunden mit höchster Restforderung' },
          { label: 'Zahlungseingänge der letzten Woche' },
          { label: 'Zeige alle Eskalation-Fälle' },
          { label: 'Fälle mit mehr als 90 DPD' },
          { label: 'Portfolio-Übersicht' },
          { label: 'Suche Kunde Mueller' },
        ],
      },
    ],
    aktionen: [],
    folgefragen: FOLGEFRAGEN,
  };
}
