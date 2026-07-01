// =============================================================================
// Export der b-IKS-Analyse (Risiken + Schlüsselkontrollen) als CSV und PDF
// =============================================================================

import { jsPDF } from 'jspdf';
import {
  KONTROLL_ART, KONTROLL_TYP, KONTROLL_TURNUS, STUFE_MAP, STATUS_MAP, bewertePrioritaet,
} from '../data/biksAgent';

function lbl(list, id) { return list.find(x => x.id === id)?.label || id || ''; }
function stufe(id) { return STUFE_MAP[id]?.label || id || ''; }
function status(id) { return STATUS_MAP[id]?.label || id || ''; }

export function buildBiksRows(analyse) {
  if (!analyse) return [];
  const rows = [];
  for (const r of analyse.risiken) {
    const prio = bewertePrioritaet(r.schaden, r.eintritt).label;
    const kontrollen = r.schluesselkontrollen || [];
    if (kontrollen.length === 0) {
      rows.push({ r, k: null, prio });
    } else {
      for (const k of kontrollen) rows.push({ r, k, prio });
    }
  }
  return rows;
}

function csvEscape(v) {
  const s = String(v ?? '');
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportBiksCsv(analyse) {
  const rows = buildBiksRows(analyse);
  const headers = [
    'Prozess', 'Risiko-Nr', 'Risikoart', 'Risiko', 'Risikospezifikation',
    'Schaden', 'Eintrittswahrscheinlichkeit', 'Priorität', 'Risiko-Status',
    'Schlüsselkontrolle', 'Kontrollziel', 'Ansatz', 'Typ', 'Turnus',
    'Verantwortlich', 'Anwendung', 'Kontroll-Status',
  ];
  const lines = [headers.join(';')];
  for (const { r, k, prio } of rows) {
    lines.push([
      analyse.prozessName, r.nummer, r.risikoart, r.titel, r.risikospezifikation,
      stufe(r.schaden), stufe(r.eintritt), prio, status(r.status),
      k?.name || '', k?.ziel || '', lbl(KONTROLL_ART, k?.art), lbl(KONTROLL_TYP, k?.typ), lbl(KONTROLL_TURNUS, k?.turnus),
      k?.wer || '', k?.anwendung || '', k ? status(k.status) : '',
    ].map(csvEscape).join(';'));
  }
  const csv = '﻿' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `b-IKS_${analyse.prozessId}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function exportBiksPdf(analyse, institut) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const rows = buildBiksRows(analyse);

  // Kopf
  doc.setFillColor(15, 77, 42);
  doc.rect(0, 0, 297, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('b-IKS Agent – Risiken & Schlüsselkontrollen', 14, 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(institut?.institut || 'Demo', 283, 12, { align: 'right' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Prozess: ${analyse.prozessName}`, 14, 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Erstellt am ${new Date().toLocaleDateString('de-DE')} · ${analyse.risiken.length} wesentliche Risiken · ${rows.filter(x => x.k).length} Schlüsselkontrollen`, 14, 34);

  let y = 42;
  const colWidths = [10, 46, 62, 30, 66, 55];
  const headers = ['Nr.', 'Risikoart / Priorität', 'Risiko', 'Bewertung', 'Schlüsselkontrolle', 'Ansatz / Status'];

  function drawHeaderRow() {
    doc.setFillColor(15, 77, 42);
    doc.rect(14, y - 4, 269, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    let x = 14;
    headers.forEach((h, i) => { doc.text(h, x + 2, y); x += colWidths[i]; });
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    y += 5;
  }

  drawHeaderRow();

  for (const { r, k, prio } of rows) {
    let x = 14;
    const cells = [
      String(r.nummer),
      `${r.risikoart}\n(Prio ${prio})`,
      r.titel,
      `Schaden: ${stufe(r.schaden)}\nEW: ${stufe(r.eintritt)}`,
      k ? (k.name) : '—',
      k ? `${lbl(KONTROLL_ART, k.art)} · ${lbl(KONTROLL_TYP, k.typ)}\n${status(k.status)}` : status(r.status),
    ];
    const lines = cells.map((c, i) => doc.splitTextToSize(c, colWidths[i] - 4));
    const maxLines = Math.max(...lines.map(l => l.length));
    const rowH = maxLines * 4 + 2;
    if (y + rowH > 200) { doc.addPage(); y = 20; drawHeaderRow(); }
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    lines.forEach((ls, i) => { doc.text(ls, x + 2, y); x += colWidths[i]; });
    y += rowH;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y - 1, 283, y - 1);
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('b-IKS Agent · vertraulich · synthetische Daten', 14, 205);
    doc.text(`Seite ${i} / ${pages}`, 283, 205, { align: 'right' });
  }

  doc.save(`b-IKS_${analyse.prozessId}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function buildBiksSummary(analyse) {
  if (!analyse) return { risikoCount: 0, kontrollen: 0, statusCounts: {}, tierCount: { high: 0, mid: 0, low: 0 } };
  const statusCounts = {};
  const tierCount = { high: 0, mid: 0, low: 0 };
  let kontrollen = 0;
  for (const r of analyse.risiken) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    const t = bewertePrioritaet(r.schaden, r.eintritt).tier;
    tierCount[t] = (tierCount[t] || 0) + 1;
    kontrollen += (r.schluesselkontrollen || []).length;
  }
  return { risikoCount: analyse.risiken.length, kontrollen, statusCounts, tierCount };
}
