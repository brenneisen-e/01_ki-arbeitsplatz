/**
 * generateTemplatePdf.js
 *
 * Baut den Muster-Konsortialkreditvertrag mit jsPDF als mehrseitiges PDF
 * und löst direkt einen Download im Browser aus.
 *
 * Wichtig: Die Zeilenumbrüche im PDF werden vom Extraktor über `hasEOL`
 * wieder zurückgewonnen, damit die Parser-Regexe pro Feld terminieren.
 */

import { jsPDF } from 'jspdf';
import { TEMPLATE_META, TEMPLATE_SECTIONS } from '../data/konsortialTemplate';

const PAGE_MARGIN_X = 20;
const PAGE_MARGIN_TOP = 22;
const PAGE_MARGIN_BOTTOM = 18;
const LINE_HEIGHT_BODY = 5.2;
const LINE_HEIGHT_HEAD = 6.5;

/**
 * Schreibt einen Text-Block mit automatischem Seitenumbruch.
 * Rückgabe: neue Y-Position.
 */
function writeWrapped(doc, text, x, y, width, lineHeight) {
  const lines = doc.splitTextToSize(text, width);
  for (const line of lines) {
    if (y > doc.internal.pageSize.getHeight() - PAGE_MARGIN_BOTTOM) {
      doc.addPage();
      y = PAGE_MARGIN_TOP;
    }
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

export function generateKonsortialTemplatePdf() {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - PAGE_MARGIN_X * 2;

  let y = PAGE_MARGIN_TOP;

  // Titel
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  y = writeWrapped(doc, TEMPLATE_META.titel, PAGE_MARGIN_X, y, contentWidth, 8);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  y = writeWrapped(doc, TEMPLATE_META.untertitel, PAGE_MARGIN_X, y + 1, contentWidth, 5);

  // Hinweis-Kasten
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(90);
  y = writeWrapped(doc, TEMPLATE_META.hinweis, PAGE_MARGIN_X, y + 3, contentWidth, 4.5);
  doc.setTextColor(0);
  y += 6;

  // Paragraphen
  for (const section of TEMPLATE_SECTIONS) {
    if (y > doc.internal.pageSize.getHeight() - PAGE_MARGIN_BOTTOM - 20) {
      doc.addPage();
      y = PAGE_MARGIN_TOP;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    y = writeWrapped(doc, section.heading, PAGE_MARGIN_X, y, contentWidth, LINE_HEIGHT_HEAD);
    y += 1;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    for (const line of section.lines) {
      y = writeWrapped(doc, line, PAGE_MARGIN_X, y, contentWidth, LINE_HEIGHT_BODY);
    }
    y += 4;
  }

  // Footer auf jeder Seite
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(
      `${TEMPLATE_META.titel} – Seite ${p} von ${totalPages}`,
      PAGE_MARGIN_X,
      doc.internal.pageSize.getHeight() - 8,
    );
    doc.setTextColor(0);
  }

  doc.save(TEMPLATE_META.dateiname);
}
