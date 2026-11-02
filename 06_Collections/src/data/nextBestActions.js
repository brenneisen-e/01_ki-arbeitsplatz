// Next-Best-Action-Queue des Cockpits.
//
// Die Warteschlange vereint die bisherigen Aufgaben mit den ausstehenden
// Agenten-Freigaben und reichert jede Aktion um Begründung, Konfidenz und
// erwarteten Recovery-Effekt aus der jeweiligen Akte an. Priorisiert wird
// deterministisch: Fälligkeit schlägt Volumen schlägt Segment — dieselben
// Daten ergeben immer dieselbe Reihenfolge.

import { AUFGABEN } from './tasks.js';
import { getFullCustomerData } from './customerDetails.js';
import { buildOffeneFreigaben } from './agents.js';
import { recoveryScore, buildEmpfehlung } from './kiAnalyse.js';

const SEGMENT_BONUS = { prioritaet: 12, eskalation: 8, restrukturierung: 8, abwicklung: 2 };

function typAusTitel(titel) {
  const t = titel.toLowerCase();
  if (/rückruf|anruf|telefon/.test(t)) return 'anruf';
  if (/mahnung/.test(t)) return 'mahnung';
  if (/raten|stundung|zahlungsplan/.test(t)) return 'ratenplan';
  if (/inkasso|eskalation|sperren/.test(t)) return 'eskalation';
  if (/prüf|bonität|bewerten|abschluss/.test(t)) return 'pruefung';
  return 'aufgabe';
}

function begruendung(customer, aufgabe) {
  if (!customer || customer.status === 'Unbekannt') {
    return `${aufgabe.faellig} — aus der Wiedervorlage übernommen.`;
  }
  const teile = [];
  if (customer.dpd > 0) teile.push(`${customer.dpd} Tage Verzug`);
  if (customer.gesamtforderung > 0) {
    teile.push(`${customer.gesamtforderung.toLocaleString('de-DE')} EUR offen`);
  }
  const rueckgaben = (customer.transaktionen || []).filter(t => t.status === 'rueckgabe').length;
  if (rueckgaben) teile.push(`${rueckgaben} Lastschriftrückgaben`);
  if (customer.willingness >= 70) teile.push('hohe Zahlungsbereitschaft — jetzt erreichbar');
  else if (customer.willingness <= 35) teile.push('geringe Bereitschaft trotz Fähigkeit');
  const empfehlung = buildEmpfehlung(customer);
  return `${teile.join(', ')}. KI-Strategie: ${empfehlung.massnahme}.`;
}

function konfidenz(customer, status) {
  if (!customer || customer.status === 'Unbekannt') return 70;
  const eindeutig = Math.abs(customer.willingness - 50) + Math.abs(customer.ability - 50);
  const basis = 62 + Math.round(eindeutig / 3);
  return Math.min(96, basis + (status === 'ueberfaellig' ? 6 : 0));
}

function effekt(customer) {
  if (!customer || !customer.gesamtforderung) return null;
  return Math.round(customer.gesamtforderung * (recoveryScore(customer) / 100) / 100) * 100;
}

/**
 * Baut die priorisierte Queue. `entfernt` enthält Schlüssel erledigter,
 * verschobener oder verworfener Aktionen, `freigegeben` bereits erteilte
 * Agenten-Freigaben.
 */
export function buildNbaQueue(entfernt = new Set(), freigegeben = new Set()) {
  const queue = [];

  AUFGABEN.forEach(a => {
    const customer = getFullCustomerData(a.kunde);
    const bekannt = customer.status !== 'Unbekannt';
    let score = a.status === 'ueberfaellig' ? 70 : a.status === 'heute' ? 50 : 30;
    if (bekannt) {
      score += Math.min(20, Math.round((customer.gesamtforderung || 0) / 25000));
      score += SEGMENT_BONUS[customer.segment] || 0;
    }
    queue.push({
      key: `aufgabe:${a.id}`,
      typ: typAusTitel(a.titel),
      titel: a.titel,
      kundeId: a.kunde,
      kunde: bekannt ? customer.name : a.titel.split(': ')[1] || a.kunde,
      akteVorhanden: bekannt,
      faellig: a.faellig,
      ueberfaellig: a.status === 'ueberfaellig',
      begruendung: begruendung(bekannt ? customer : null, a),
      konfidenz: konfidenz(bekannt ? customer : null, a.status),
      effekt: bekannt ? effekt(customer) : null,
      score,
    });
  });

  buildOffeneFreigaben().forEach(f => {
    const schluessel = `${f.kundeId}:${f.id}`;
    if (freigegeben.has(schluessel)) return;
    const customer = getFullCustomerData(f.kundeId);
    queue.push({
      key: `freigabe:${schluessel}`,
      typ: 'freigabe',
      titel: `${f.titel}: ${f.kunde}`,
      kundeId: f.kundeId,
      kunde: f.kunde,
      akteVorhanden: true,
      faellig: `Agent wartet seit ${f.zeitpunkt.split(',')[0]}`,
      ueberfaellig: false,
      begruendung: f.detail,
      konfidenz: konfidenz(customer, 'heute'),
      effekt: effekt(customer),
      freigabe: { kundeId: f.kundeId, aktionId: f.id, agent: f.agent },
      score: 60 + Math.min(20, Math.round((customer.gesamtforderung || 0) / 25000)),
    });
  });

  return queue
    .filter(q => !entfernt.has(q.key))
    .sort((a, b) => b.score - a.score);
}

export function prioStufe(score) {
  if (score >= 70) return { label: 'Hoch', color: '#b91c1c', bg: '#fef2f2' };
  if (score >= 48) return { label: 'Mittel', color: '#b45309', bg: '#fffbeb' };
  return { label: 'Normal', color: '#0369a1', bg: '#f0f9ff' };
}
