// =============================================================================
// Demo PDF Generator — erzeugt für die ControlHub-Demo Eingangsdokumente
// (Arbeitsanweisung, Richtlinie, Prozessbeschreibung) im PDF-Format,
// die anschließend wieder hochgeladen werden können.
// =============================================================================

import { jsPDF } from 'jspdf';

function addHeader(doc, title, subtitle) {
  doc.setFillColor(15, 77, 42);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('CONTROLHUB', 14, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Demo-Dokument', 196, 12, { align: 'right' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(title, 14, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(subtitle, 14, 37);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(14, 41, 196, 41);
}

function addFooter(doc, page, total, docId) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Dokument-ID: ${docId} · Seite ${page} / ${total}`, 14, 287);
  doc.text('ControlHub Demo · vertraulich · synthetische Daten', 196, 287, { align: 'right' });
}

function addBlock(doc, y, heading, lines) {
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(heading, 14, y);
  y += 5;
  doc.setDrawColor(134, 188, 37);
  doc.setLineWidth(0.6);
  doc.line(14, y, 32, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  for (const line of lines) {
    if (Array.isArray(line)) {
      doc.setFont('helvetica', 'bold');
      doc.text(line[0] + ':', 14, y);
      doc.setFont('helvetica', 'normal');
      const t = doc.splitTextToSize(line[1], 165);
      doc.text(t, 50, y);
      y += t.length * 5 + 1;
    } else {
      const t = doc.splitTextToSize(line, 180);
      doc.text(t, 14, y);
      y += t.length * 5;
    }
  }
  return y + 4;
}

function addActivities(doc, y, aktivitaeten) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Prozessschritte (Soll-Ablauf)', 14, y);
  y += 5;
  doc.setDrawColor(134, 188, 37);
  doc.setLineWidth(0.6);
  doc.line(14, y, 60, y);
  y += 5;

  aktivitaeten.forEach((a, idx) => {
    if (y > 260) {
      doc.addPage();
      y = 22;
    }
    doc.setFillColor(15, 77, 42);
    doc.circle(18, y + 1, 3.2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(String(idx + 1), 18, y + 2.2, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(a.name, 25, y + 2);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(a.beschreibung, 165);
    doc.text(lines, 25, y + 2);
    y += lines.length * 4.5 + 5;
  });
  return y;
}

// ===== Generators ======

function dateDe() {
  return new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function buildDocId(prefix) {
  return `${prefix}-${Math.floor(Math.random() * 90000) + 10000}`;
}

export function generateArbeitsanweisungPdf(prozess) {
  const doc = new jsPDF();
  const docId = buildDocId('AA');
  addHeader(doc, `Arbeitsanweisung: ${prozess.name}`, `Version 3.2 · gültig ab ${dateDe()} · Fachbereich ${prozess.kategorie}`);

  let y = 50;
  y = addBlock(doc, y, '1. Zweck & Geltungsbereich', [
    `Diese Arbeitsanweisung regelt den End-to-End-Prozess "${prozess.name}" gemäß MaRisk und den internen Regelwerken.`,
    'Sie ist für alle Mitarbeitenden der 1st Line of Defense im genannten Fachbereich verbindlich.',
  ]);

  y = addBlock(doc, y, '2. Verantwortlichkeiten', [
    ['1st LoD', 'Fachbereich (Sachbearbeitung, Teamleitung) — operative Durchführung und Kontrollausübung.'],
    ['2nd LoD', 'Risikocontrolling, Compliance, Operational Risk Management — Überwachung und Methodik.'],
    ['3rd LoD', 'Interne Revision — unabhängige Prüfung der Wirksamkeit.'],
  ]);

  y = addBlock(doc, y, '3. Regulatorischer Rahmen', [
    '• MaRisk AT 4.3 — Interne Kontrollverfahren',
    '• MaRisk BTO 1.2 — Kredit- bzw. Handelsgeschäft',
    '• DORA — Anforderungen an die IKT-Sicherheit',
    '• EU AI Act — Anforderungen an KI-Modelle',
    '• GwG §§ 4 ff. — Sorgfaltspflichten',
  ]);

  if (y > 220) { doc.addPage(); y = 22; }
  y = addActivities(doc, y, prozess.aktivitaeten);

  // Page 2+: Risikohinweise
  if (y > 240) { doc.addPage(); y = 22; }
  y = addBlock(doc, y, '4. Bekannte Risikofelder', [
    'Die nachfolgenden Risikofelder sind im Rahmen der jährlichen Risiko- und Kontrollinventarisierung systematisch zu erheben:',
    '• Prozessrisiken (Erfassung, Plausibilisierung, Freigabe)',
    '• Compliance-Risiken (MaRisk, GwG, DSGVO)',
    '• IT- & Systemrisiken (Verfügbarkeit, Integrität, Vertraulichkeit)',
    '• Finanzkriminalität (CEO-Fraud, Identitätsbetrug, Phishing)',
    '• Modell- & Datenrisiken (Rating-Modelle, Stammdaten)',
  ]);

  y = addBlock(doc, y, '5. Eskalationspfade', [
    'Auffälligkeiten sind innerhalb von 24 Stunden an den Vorgesetzten und den Operational-Risk-Officer zu melden.',
    'Bei Verdacht auf Geldwäsche oder Betrug erfolgt eine unmittelbare Meldung an den Geldwäschebeauftragten und ggf. an die FIU.',
  ]);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    addFooter(doc, i, pages, docId);
  }

  doc.save(`Arbeitsanweisung_${prozess.id}_${docId}.pdf`);
}

export function generateRichtliniePdf(prozess) {
  const doc = new jsPDF();
  const docId = buildDocId('RL');
  addHeader(doc, `Richtlinie ${prozess.name}`, `Version 4.0 · Stand ${dateDe()} · Verantwortlich: Vorstand`);

  let y = 50;
  y = addBlock(doc, y, '§ 1 Zielsetzung', [
    `Diese Richtlinie definiert die übergeordneten Grundsätze für den Prozess "${prozess.name}" und die zugehörigen Schlüsselkontrollen.`,
  ]);

  y = addBlock(doc, y, '§ 2 Anwendungsbereich', [
    'Die Richtlinie gilt institutsweit für alle Geschäftseinheiten und Tochtergesellschaften.',
    'Auslagerungen sind durch entsprechende Service-Level-Agreements und Auslagerungsverträge abzusichern.',
  ]);

  y = addBlock(doc, y, '§ 3 Risiko-Appetit', [
    ['Operationelles Risiko', 'Max. erwarteter Schaden p.a.: 2,5 Mio. EUR (Konzern-Risikoappetit).'],
    ['Compliance-Risiko', 'Zero-Tolerance bei vorsätzlichen Verstößen; quartalsweise Reporting.'],
    ['Reputationsrisiko', 'Frühzeitige Eskalation an die Konzern-Kommunikation.'],
  ]);

  y = addBlock(doc, y, '§ 4 Grundsätze der Kontrollausgestaltung', [
    '• Funktionstrennung zwischen Markt und Marktfolge bei wesentlichen Entscheidungen.',
    '• Vier-Augen-Prinzip ab definierten Schwellenwerten.',
    '• Automatisierte Kontrollen werden manuellen Kontrollen vorgezogen, sofern die Risikolage dies zulässt.',
    '• Dokumentation der Kontrollausführung im GRC-Tool ist verbindlich.',
  ]);

  if (y > 200) { doc.addPage(); y = 22; }
  y = addActivities(doc, y, prozess.aktivitaeten);

  if (y > 240) { doc.addPage(); y = 22; }
  y = addBlock(doc, y, '§ 5 Berichtswesen', [
    'Quartalsweise erfolgt ein Operational-Risk-Report an den Vorstand und den Aufsichtsrat.',
    'Wesentliche Vorfälle sind ad hoc zu eskalieren.',
  ]);

  y = addBlock(doc, y, '§ 6 Inkrafttreten', [
    `Diese Richtlinie tritt mit Beschluss des Vorstands am ${dateDe()} in Kraft und wird mindestens jährlich überprüft.`,
  ]);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    addFooter(doc, i, pages, docId);
  }

  doc.save(`Richtlinie_${prozess.id}_${docId}.pdf`);
}

export function generateProzessbeschreibungPdf(prozess) {
  const doc = new jsPDF();
  const docId = buildDocId('PB');
  addHeader(doc, `Prozessbeschreibung: ${prozess.name}`, `Version 2.1 · Letzte Aktualisierung ${dateDe()}`);

  let y = 50;
  y = addBlock(doc, y, 'Prozess-Steckbrief', [
    ['Prozess-ID', prozess.id.toUpperCase()],
    ['Kategorie', prozess.kategorie],
    ['Prozessziel', prozess.beschreibung],
    ['Prozessverantwortlich', 'Fachbereichsleitung'],
    ['Zyklus', 'Operativer Tagesprozess'],
    ['Wesentlichkeit', 'Wesentlich gem. AT 4.3.4 MaRisk'],
  ]);

  y = addBlock(doc, y, 'Schnittstellen', [
    '• Vorgelagert: Kundenservice, Vertrieb, Front-Office',
    '• Nachgelagert: Buchhaltung, Meldewesen, Reporting',
    '• Daten: Kernsystem, GRC-Tool, Data Warehouse',
  ]);

  if (y > 200) { doc.addPage(); y = 22; }
  y = addActivities(doc, y, prozess.aktivitaeten);

  if (y > 240) { doc.addPage(); y = 22; }
  y = addBlock(doc, y, 'Bestehende Schlüsselkontrollen (Auszug)', [
    '• Vier-Augen-Prinzip bei freigaberelevanten Tätigkeiten',
    '• Automatisierte Validierungen und Sanktionsfilter',
    '• Tagesabschluss-Abstimmungen und Reconciliations',
    '• Stichprobenprüfungen durch die 2nd LoD',
  ]);

  y = addBlock(doc, y, 'Bekannte Schwächen / Findings (Vorperiode)', [
    'Finding F-2025-014: Unzureichende Dokumentation bei Auszahlungen ab 1 Mio. EUR.',
    'Finding F-2025-021: SLA-Verletzung bei Dienstleister Custodian (Settlement-Instruktion T+0).',
    'Finding F-2025-029: Veraltete Limit-Stammdaten bei drei Konzernkundenverbünden.',
  ]);

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    addFooter(doc, i, pages, docId);
  }

  doc.save(`Prozessbeschreibung_${prozess.id}_${docId}.pdf`);
}
