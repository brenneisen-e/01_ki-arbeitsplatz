// Dashboard-Zusammenfassung als Textdokument.
//
// Das Legacy-Tool (js/banken-export.js) trug eine 850 Zeilen lange, fest
// verdrahtete Beschreibung der damaligen Oberflaeche mit sich — inklusive
// Emojis und Bereichen, die es hier nicht mehr gibt. Der Export wird deshalb
// aus den tatsaechlichen Daten der App erzeugt: was im Dokument steht, steht
// auch im UI.

import { INSTITUT, PORTFOLIO_KPIS, DPD_BUCKETS, SEGMENTE, MATRIX_SUMME, EHEMALIGE, NEUE_FAELLE, ZAHLUNGSEINGAENGE } from '../data/portfolio.js';
import { CUSTOMERS, SEGMENT_LABELS, STATUS_LABELS } from '../data/customers.js';
import { buildNbaQueue } from '../data/nextBestActions.js';
import { NPL_KPIS, NPL_PRODUKTE, NPL_MASSNAHMEN, STAGE2_KPIS, STAGE2_MIGRATION, RISIKOTREIBER } from '../data/npl.js';
import { euro, zahl, datum, uhrzeit } from './format.js';

const BREITE = 78;

function linie(zeichen = '=') {
  return zeichen.repeat(BREITE);
}

function block(titel) {
  return ['', linie(), `  ${titel.toUpperCase()}`, linie(), ''].join('\n');
}

function tabelle(kopf, zeilen) {
  const breiten = kopf.map((k, i) =>
    Math.max(String(k).length, ...zeilen.map(z => String(z[i] ?? '').length)));
  const zeile = werte => werte
    .map((w, i) => String(w ?? '').padEnd(breiten[i]))
    .join('  ')
    .trimEnd();
  return [
    zeile(kopf),
    breiten.map(b => '-'.repeat(b)).join('  '),
    ...zeilen.map(zeile),
  ].join('\n');
}

export function buildDashboardSummary(now = new Date()) {
  const t = [];

  t.push(linie('#'));
  t.push('  COLLECTIONS MANAGEMENT - DASHBOARD-ZUSAMMENFASSUNG');
  t.push(`  ${INSTITUT.name} | ${INSTITUT.bereich}`);
  t.push(linie('#'));
  t.push('');
  t.push(`Erstellt am ${datum(now)} um ${uhrzeit(now)} Uhr`);
  t.push('Demo-Umgebung - alle Angaben sind synthetische Daten.');

  // --- Portfolio ---
  t.push(block('1. Portfolio-Kennzahlen'));
  const queue = buildNbaQueue();
  const ueberfaellig = queue.filter(q => q.ueberfaellig).length;
  t.push(tabelle(
    ['Kennzahl', 'Wert', 'Veränderung'],
    PORTFOLIO_KPIS.map(k => k.id === 'aufgaben'
      ? ['Offene Aktionen', zahl(queue.length), `${zahl(ueberfaellig)} überfällig`]
      : [k.label, k.value, k.change?.text ?? '']),
  ));

  t.push('');
  t.push('Verteilung der Verzugstage:');
  t.push(tabelle(
    ['Bucket (Tage)', 'Anteil', 'Fälle'],
    DPD_BUCKETS.map(b => [b.label, `${b.anteil} %`, zahl(b.faelle)]),
  ));

  // --- Segmentierung ---
  t.push(block('2. Segmentierung (Willingness / Ability)'));
  t.push('Die KI-gestützte Analyse ordnet jeden Fall nach Zahlungsbereitschaft');
  t.push('(Willingness) und Zahlungsfähigkeit (Ability) einem von vier Segmenten zu.');
  t.push('');
  t.push(tabelle(
    ['Segment', 'Fälle', 'Volumen', 'Ø pro Fall', 'Bearbeitungsstrategie'],
    SEGMENTE.map(s => [s.title, s.countLabel, s.volumen, s.schnitt, s.strategie]),
  ));
  t.push('');
  t.push(`Gesamt: ${MATRIX_SUMME.faelle} | ${MATRIX_SUMME.volumen} Forderungen | ${MATRIX_SUMME.schnitt} pro Fall`);
  t.push(`Abgeschlossen diesen Monat: ${zahl(EHEMALIGE.count)} Fälle | ${EHEMALIGE.volumen} | Recovery ${EHEMALIGE.recovery}`);

  t.push('');
  t.push(`Neue Fälle seit dem letzten Login: ${zahl(NEUE_FAELLE.count)}`);
  NEUE_FAELLE.items.forEach(i => t.push(`  - ${i.name}: ${i.betrag} (${i.typ}, ${i.zeit})`));
  t.push('');
  t.push(`Zahlungseingänge: ${zahl(ZAHLUNGSEINGAENGE.count)}`);
  ZAHLUNGSEINGAENGE.items.forEach(i => t.push(`  - ${i.name}: ${i.betrag} (${i.typ}, ${i.zeit})`));

  // --- Kundenliste ---
  t.push(block('3. Kundenliste'));
  t.push(tabelle(
    ['Kundennummer', 'Kunde', 'Produkt', 'Forderung', 'DPD', 'Segment', 'W/A', 'Mahnst.', 'Status', 'Bearbeiter'],
    CUSTOMERS.map(c => [
      c.id, c.name, c.produkt, euro(c.forderung), zahl(c.dpd),
      SEGMENT_LABELS[c.segment]?.label ?? c.segment,
      `${c.willingness}/${c.ability}`,
      c.mahnstufe,
      STATUS_LABELS[c.status]?.label ?? c.status,
      c.bearbeiter,
    ]),
  ));

  // --- NPL ---
  t.push(block('4. NPL Dashboard (Stage 3)'));
  t.push('Notleidende Kredite mit einer Ausfallwahrscheinlichkeit über 90 Prozent.');
  t.push('');
  t.push(tabelle(
    ['Kennzahl', 'Wert', 'Veränderung'],
    NPL_KPIS.map(k => [k.label, k.value, k.change]),
  ));
  t.push('');
  t.push('Verteilung nach Produkttyp:');
  t.push(tabelle(
    ['Produkt', 'Volumen (Mio EUR)', 'Anteil'],
    NPL_PRODUKTE.map(p => [p.produkt, zahl(p.volumen, 1), `${p.anteil} %`]),
  ));
  t.push('');
  t.push('Empfohlene Maßnahmen:');
  t.push(tabelle(
    ['Maßnahme', 'Fälle', 'Kriterium'],
    NPL_MASSNAHMEN.map(m => [m.titel, zahl(m.count), m.text]),
  ));

  // --- Stage 2 ---
  t.push(block('5. Stage 2 Monitoring (IFRS 9)'));
  t.push(tabelle(
    ['Kennzahl', 'Wert'],
    STAGE2_KPIS.map(k => [k.label, k.value]),
  ));
  t.push('');
  t.push('Stage-Migration der letzten 30 Tage:');
  t.push(`  Zugang aus Stage 1:   +${zahl(STAGE2_MIGRATION.ausStage1)} Fälle`);
  t.push(`  Bestand Stage 2:       ${zahl(STAGE2_MIGRATION.bestand)} Fälle`);
  t.push(`  Abgang nach Stage 3:  -${zahl(STAGE2_MIGRATION.nachStage3)} Fälle`);
  t.push(`  Netto-Zugang:          ${STAGE2_MIGRATION.netto}`);
  t.push('');
  t.push('Top-Risikotreiber:');
  t.push(tabelle(
    ['Treiber', 'Volumen'],
    RISIKOTREIBER.map(r => [r.name, r.wert]),
  ));

  // --- Aktionen ---
  t.push(block('6. Naechste beste Aktionen (Cockpit)'));
  t.push(tabelle(
    ['Prio', 'Aktion', 'Kunde', 'Faelligkeit', 'Konfidenz', 'Erwartete Recovery'],
    queue.map(q => [
      zahl(q.score), q.titel, q.kundeId, q.faellig,
      `${q.konfidenz} %`, q.effekt != null ? euro(q.effekt) : '-',
    ]),
  ));

  // --- Hinweise ---
  t.push(block('7. Hinweise'));
  t.push('Die Segmentierung, die Scorewerte und die Handlungsempfehlungen dieses');
  t.push('Dashboards sind eine Entscheidungshilfe. Sie ersetzen nicht die fachliche');
  t.push('Einzelfallprüfung durch die zuständige Sachbearbeitung.');
  t.push('');
  t.push(`IT-Support:        ${INSTITUT.supportMail}`);
  t.push(`Fachliche Fragen:  ${INSTITUT.fachMail}`);
  t.push('');
  t.push(linie('#'));
  t.push(`  ${INSTITUT.name} - Collections Management`);
  t.push(linie('#'));

  return t.join('\n');
}

export function downloadDashboardSummary(now = new Date()) {
  const text = buildDashboardSummary(now);
  const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  downloadBlob(text, `collections-dashboard-zusammenfassung-${iso}.txt`, 'text/plain;charset=utf-8');
}

export function downloadBlob(inhalt, dateiname, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([inhalt], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// CSV-Export fuer Chat-Ergebnisse und Kundenlisten (Legacy: exportChatToExcel).
export function downloadCsv(rows, dateiname) {
  if (!rows.length) return;
  const spalten = Object.keys(rows[0]);
  const escape = v => {
    const s = String(v ?? '');
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [
    spalten.join(';'),
    ...rows.map(r => spalten.map(s => escape(r[s])).join(';')),
  ].join('\r\n');
  // BOM, damit Excel die Umlaute korrekt liest.
  downloadBlob('﻿' + csv, dateiname, 'text/csv;charset=utf-8');
}
