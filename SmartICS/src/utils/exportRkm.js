// =============================================================================
// Export der Risiko-Kontroll-Matrix in CSV und PDF
// =============================================================================

import { jsPDF } from 'jspdf';
import { RISIKO_KATEGORIEN, KONTROLL_ARTEN, KONTROLL_FREQUENZ } from '../data/risikoKatalog';

function getKategorie(id) { return RISIKO_KATEGORIEN.find(k => k.id === id); }
function getUnterart(katId, uaId) { return getKategorie(katId)?.unterarten.find(u => u.id === uaId); }
function getArtLabel(id) { return KONTROLL_ARTEN.find(a => a.id === id)?.name || id; }
function getFrequenzLabel(id) { return KONTROLL_FREQUENZ.find(f => f.id === id)?.name || id; }

export function buildRkmRows(session) {
  if (!session) return [];
  const rows = [];
  for (const a of session.aktivitaeten.filter(a => !a._remove && a.confirmed)) {
    const risiken = (session.risikoCandidates[a.id] || []).filter(r => r.selected);
    for (const r of risiken) {
      const k = getKategorie(r.kategorie);
      const u = getUnterart(r.kategorie, r.unterart);
      const kontrollen = (session.kontrollCandidates[r.id] || []).filter(c => c.selected);
      if (kontrollen.length === 0) {
        rows.push({
          prozess: session.name,
          aktivitaet: a.name,
          aktivitaetBeschreibung: a.beschreibung,
          risikoart: k?.name,
          risikoUnterart: u?.name,
          risikoBeschreibung: r.finalBeschreibung || r.beschreibung,
          eintrittsW: r.eintrittsW,
          schaden: r.schaden,
          tier: r.tier,
          kontrolle: '',
          kontrolleArt: '',
          kontrolleTyp: '',
          kontrolleFrequenz: '',
          kontrolleWer: '',
          kontrolleBeschreibung: 'KEINE KONTROLLE',
          isKey: false,
        });
      } else {
        for (const c of kontrollen) {
          rows.push({
            prozess: session.name,
            aktivitaet: a.name,
            aktivitaetBeschreibung: a.beschreibung,
            risikoart: k?.name,
            risikoUnterart: u?.name,
            risikoBeschreibung: r.finalBeschreibung || r.beschreibung,
            eintrittsW: r.eintrittsW,
            schaden: r.schaden,
            tier: r.tier,
            kontrolle: c.name,
            kontrolleArt: getArtLabel(c.art),
            kontrolleTyp: getArtLabel(c.typ),
            kontrolleFrequenz: getFrequenzLabel(c.frequenz),
            kontrolleWer: c.wer,
            kontrolleBeschreibung: c.beschreibung,
            isKey: c.isKey,
          });
        }
      }
    }
  }
  return rows;
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportRkmCsv(session) {
  const rows = buildRkmRows(session);
  const headers = [
    'Prozess', 'Aktivität', 'Aktivität-Beschreibung',
    'Risikoart', 'Risiko-Unterart', 'Risikobeschreibung',
    'Eintrittswahrscheinlichkeit', 'Finanzieller Schaden', 'Risiko-Tier',
    'Kontrolle', 'Art', 'Typ', 'Frequenz', 'Verantwortlich',
    'Kontrollbeschreibung', 'Schlüsselkontrolle',
  ];
  const lines = [headers.join(';')];
  for (const r of rows) {
    lines.push([
      r.prozess, r.aktivitaet, r.aktivitaetBeschreibung,
      r.risikoart, r.risikoUnterart, r.risikoBeschreibung,
      r.eintrittsW, r.schaden, r.tier,
      r.kontrolle, r.kontrolleArt, r.kontrolleTyp, r.kontrolleFrequenz, r.kontrolleWer,
      r.kontrolleBeschreibung, r.isKey ? 'Ja' : 'Nein',
    ].map(csvEscape).join(';'));
  }
  const csv = '﻿' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `RKM_${session.prozessId}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function exportRkmPdf(session, institut) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const rows = buildRkmRows(session);

  // Header
  doc.setFillColor(15, 77, 42);
  doc.rect(0, 0, 297, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Smart ICS – Risiko-Kontroll-Matrix', 14, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(institut?.institut || 'Demo', 283, 12, { align: 'right' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Prozess: ${session.name}`, 14, 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Erstellt am ${new Date().toLocaleDateString('de-DE')} · ${rows.length} Risiko-Kontroll-Zuordnungen`, 14, 34);

  let y = 42;
  const colWidths = [40, 40, 70, 35, 60, 30];
  const headers = ['Aktivität', 'Risikoart', 'Risikobeschreibung', 'Bewertung', 'Schlüsselkontrolle', 'Art / Frequenz'];

  function drawHeaderRow() {
    doc.setFillColor(15, 77, 42);
    doc.rect(14, y - 4, 269, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    let x = 14;
    headers.forEach((h, i) => {
      doc.text(h, x + 2, y);
      x += colWidths[i];
    });
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    y += 5;
  }

  drawHeaderRow();

  for (const r of rows) {
    if (y > 195) {
      doc.addPage();
      y = 20;
      drawHeaderRow();
    }
    const tierColor = r.tier === 'high' ? [220, 38, 38] : r.tier === 'mid' ? [217, 119, 6] : [5, 150, 105];
    let x = 14;
    const cells = [
      r.aktivitaet,
      r.risikoart,
      r.risikoBeschreibung,
      `${r.eintrittsW.split(' ')[0]} / ${r.schaden.split(' ')[0]}`,
      r.isKey ? `${r.kontrolle} ★` : (r.kontrolle || '—'),
      `${r.kontrolleArt}\n${r.kontrolleFrequenz}`,
    ];
    const lines = cells.map((c, i) => doc.splitTextToSize(c, colWidths[i] - 4));
    const maxLines = Math.max(...lines.map(l => l.length));
    const rowH = maxLines * 4 + 2;
    if (y + rowH > 200) {
      doc.addPage();
      y = 20;
      drawHeaderRow();
    }
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    lines.forEach((ls, i) => {
      doc.text(ls, x + 2, y);
      x += colWidths[i];
    });
    // Tier dot
    doc.setFillColor(...tierColor);
    doc.circle(283, y, 1.4, 'F');
    y += rowH;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y - 1, 283, y - 1);
  }

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Smart ICS · vertraulich · synthetische Daten`, 14, 205);
    doc.text(`Seite ${i} / ${pages}`, 283, 205, { align: 'right' });
  }

  doc.save(`RKM_${session.prozessId}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function buildExportSummary(session) {
  const rows = buildRkmRows(session);
  const risiken = new Set(rows.map(r => r.risikoBeschreibung));
  const keyControls = rows.filter(r => r.isKey).length;
  const ohneKontrolle = rows.filter(r => r.kontrolleBeschreibung === 'KEINE KONTROLLE').length;
  const tierCount = { high: 0, mid: 0, low: 0 };
  for (const r of rows) tierCount[r.tier] = (tierCount[r.tier] || 0) + 1;
  return {
    rowCount: rows.length,
    risikoCount: risiken.size,
    keyControls,
    ohneKontrolle,
    tierCount,
  };
}
