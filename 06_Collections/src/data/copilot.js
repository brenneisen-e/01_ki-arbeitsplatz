// Fall-Copilot: ausführliches Dossier und Kommunikationsentwürfe je Akte.
//
// Beides wird deterministisch aus den Feldern der Akte erzeugt — Lage,
// Verlauf, Risiken, Chancen und Gesprächspunkte lesen sich wie eine
// KI-Zusammenfassung, bleiben aber reproduzierbar. Entwürfe sind bewusst
// Plaintext: Korrespondenz wird ohne Markdown versendet.

import { letzteZahlung, stage } from './customerDetails.js';
import { buildEmpfehlung } from './kiAnalyse.js';
import { euro } from '../utils/format.js';

const SEGMENT_LAGE = {
  eskalation: 'Die Zahlungsfähigkeit ist vorhanden, die Bereitschaft nicht — der Fall braucht Verbindlichkeit statt weiterer Erinnerungen.',
  restrukturierung: 'Der Kunde will zahlen, kann es in der aktuellen Ratenhöhe aber nicht — eine tragfähige Vereinbarung sichert den Rückfluss.',
  prioritaet: 'Bereitschaft und Fähigkeit sind hoch — der Fall lässt sich mit einem Kontakt zum Abschluss bringen.',
  abwicklung: 'Weder Bereitschaft noch Fähigkeit tragen eine Fortführung — jede weitere Bearbeitungsstunde mindert das Ergebnis.',
  stabil: 'Der Fall bedient planmäßig und braucht nur Beobachtung.',
  abgeschlossen: 'Die Forderung ist ausgeglichen; offen ist nur noch die Archivierung.',
};

export function buildDossier(customer) {
  const zahlung = letzteZahlung(customer);
  const rueckgaben = (customer.transaktionen || []).filter(t => t.status === 'rueckgabe');
  const empfehlung = buildEmpfehlung(customer);
  const stufe = stage(customer);
  const gewerbe = customer.type === 'Gewerbe';
  const anrede = customer.ansprechpartner || customer.name;

  const lage = [
    `${customer.name} führt ${customer.krediteAnzahl > 1 ? `${customer.krediteAnzahl} Engagements` : 'ein Engagement'} mit ${euro(customer.gesamtforderung)} Gesamtforderung bei ${customer.dpd} Tagen Verzug (Stage ${stufe}). ${SEGMENT_LAGE[customer.segment] || ''}`,
    customer.kernproblem,
  ].filter(Boolean);

  const verlauf = [];
  if (customer.mahnstufe > 0) {
    verlauf.push(`Mahnstrecke bis Stufe ${customer.mahnstufe} durchlaufen, zuletzt am 01.12.2025.`);
  }
  if (zahlung) {
    verlauf.push(`Letzter Zahlungseingang: ${euro(zahlung.betrag)} am ${zahlung.datum} (${zahlung.typ}).`);
  }
  if (rueckgaben.length) {
    verlauf.push(`${rueckgaben.length} Lastschriftrückgaben in der Historie, zuletzt am ${rueckgaben[0].datum}.`);
  }
  if (!verlauf.length) verlauf.push('Keine Auffälligkeiten in der jüngeren Historie.');

  const risiken = [];
  if ((customer.einkommenMonatlich ?? 0) < (customer.ausgabenMonatlich ?? 0)) {
    risiken.push(`Strukturell negativer Cashflow: Ausgaben übersteigen die Einnahmen um ${euro((customer.ausgabenMonatlich || 0) - (customer.einkommenMonatlich || 0))} pro Monat.`);
  }
  if (rueckgaben.length >= 2) risiken.push('Wiederholte Rückgaben deuten auf bewusste Zahlungsvermeidung — weitere Einzüge erzeugen nur Gebühren.');
  if (customer.dpd > 90) risiken.push('Stage 3: Jede Verzögerung senkt die realistische Recovery-Quote weiter.');
  if (customer.openFinance?.externeKonten?.some(k => k.saldo < 0)) {
    risiken.push('Externe Verbindlichkeiten sichtbar (Open Finance) — die Gesamtbelastung liegt über dem eigenen Buch.');
  }
  if (!risiken.length) risiken.push('Kein erhöhtes Risiko über den Verzug hinaus erkennbar.');

  const chancen = [];
  if (customer.willingness >= 70) chancen.push('Hohe Zahlungsbereitschaft — eine direkte Ansprache wird angenommen.');
  if (zahlung) chancen.push('Der jüngste Eingang zeigt: Der Kontakt zum Konto besteht, Momentum nutzen.');
  if (customer.segment === 'restrukturierung') chancen.push('Aus der Haushaltsrechnung lässt sich eine tragfähige Rate ableiten.');
  if (customer.ability >= 60 && customer.willingness < 50) chancen.push('Fähigkeit vorhanden: Ein Vergleich mit kurzer Frist kann den Fall vor dem Inkasso lösen.');
  if (!chancen.length) chancen.push('Fokus auf Verwertung und sauberen Abschluss.');

  const gespraechspunkte = [
    `Bezug nehmen auf ${zahlung ? `die Zahlung vom ${zahlung.datum}` : 'die letzte Mahnung'} — Gesprächseinstieg ohne Konfrontation.`,
    customer.segment === 'restrukturierung'
      ? 'Ratenplan konkret anbieten: Höhe, Laufzeit, Startdatum — nicht offen verhandeln.'
      : customer.segment === 'eskalation'
        ? 'Frist klar benennen (15.12.) und die Konsequenz der Inkasso-Übergabe aussprechen.'
        : 'Zahlungstermin bestätigen lassen und schriftlich fixieren.',
    `Ansprechpartner: ${anrede}${customer.telefon ? `, ${customer.telefon}` : ''} — ${gewerbe ? 'geschäftlich vormittags am besten erreichbar' : 'nach 17 Uhr am besten erreichbar'}.`,
    `Ziel des Gesprächs: ${empfehlung.schritte[0]}`,
  ];

  return { lage, verlauf, risiken, chancen, gespraechspunkte, empfehlung };
}

/** Kurzlage für den Schnellblick: die ersten zwei Sätze des Dossiers. */
export function buildKurzlage(customer) {
  return buildDossier(customer).lage[0];
}

export function buildEntwuerfe(customer) {
  const anrede = customer.type === 'Gewerbe'
    ? `Sehr geehrte Damen und Herren${customer.ansprechpartner ? `,\nsehr geehrte${/in$/.test(customer.ansprechpartner) ? '' : 'r'} ${customer.ansprechpartner.startsWith('Frau') ? '' : 'Herr '}${customer.ansprechpartner}` : ''},`
    : `Sehr geehrte${customer.name.includes('Frau') ? '' : 'r'} ${customer.ansprechpartner || customer.name},`;
  const offen = euro(customer.gesamtforderung);
  const rate = customer.monatsrate ? euro(customer.monatsrate) : euro(Math.max(100, Math.round((customer.gesamtforderung || 2400) / 24 / 10) * 10));

  const entwuerfe = [];

  if (customer.dpd > 0) {
    entwuerfe.push({
      id: 'erinnerung',
      titel: 'Zahlungserinnerung',
      kanal: 'Brief / E-Mail',
      text: `${anrede}\n\nzu Ihrem Engagement bei der Braunschweiger Sparkasse ist derzeit ein Betrag von ${offen} offen (${customer.dpd} Tage im Verzug).\n\nBitte gleichen Sie den Betrag bis zum 22.12.2025 aus oder melden Sie sich bei uns, wenn Sie eine Ratenzahlung besprechen möchten. Unter ${customer.telefon || '+49 531 123456'} erreichen Sie Ihre Ansprechpartnerin direkt.\n\nMit freundlichen Grüßen\nIhre Braunschweiger Sparkasse\nForderungsmanagement`,
    });
  }

  entwuerfe.push({
    id: 'ratenplan',
    titel: 'Ratenplan-Angebot',
    kanal: 'Brief',
    text: `${anrede}\n\nwir möchten mit Ihnen eine tragfähige Lösung für den offenen Betrag von ${offen} finden.\n\nUnser Vorschlag: eine monatliche Rate von ${rate}, erstmals zum 01.01.2026, bei Aussetzung weiterer Mahngebühren. Die Vereinbarung kommt zustande, sobald die erste Rate eingegangen ist.\n\nWenn Sie einen anderen Betrag für tragfähig halten, rufen Sie uns an — wir passen den Plan gemeinsam an.\n\nMit freundlichen Grüßen\nIhre Braunschweiger Sparkasse\nForderungsmanagement`,
  });

  entwuerfe.push({
    id: 'gespraech',
    titel: 'Terminvorschlag',
    kanal: 'E-Mail',
    text: `${anrede}\n\nwir würden die weitere Rückführung gern persönlich mit Ihnen besprechen und schlagen Donnerstag, den 18.12.2025 um 10:00 Uhr vor — telefonisch oder in Ihrer Filiale.\n\nSollte der Termin nicht passen, nennen Sie uns gern zwei Alternativen. Eine kurze Antwort auf diese E-Mail genügt.\n\nMit freundlichen Grüßen\nIhre Braunschweiger Sparkasse\nForderungsmanagement`,
  });

  return entwuerfe;
}
