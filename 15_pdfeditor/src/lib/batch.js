// Stapelverarbeitung: Die Aenderungen an einem Vorlagen-PDF werden auf weitere,
// gleich aufgebaute PDFs uebertragen. Felder werden ueber Seite, Position,
// Schriftgroesse, Schrift und Text wiedererkannt.
import { analyzeDocument, sampleBlockColors } from './analyze.js';
import { findInvoiceAmount, amountPrefix } from './amount.js';
import { nextBlockId } from './textBlocks.js';
import { pickStandardFont } from './session.js';

function stripTag(name) { return (name || '').replace(/^[A-Z]{6}\+/, ''); }

function fontLabelOf(session, block) {
  const e = block.fontEntryId ? session.getEntry(block.fontEntryId) : null;
  return e ? e.baseFontPlain : stripTag(block.pdfjsFont?.name);
}

/**
 * Sucht zu einem Vorlagen-Block den passenden Block im Zieldokument.
 * Rueckgabe: { block, score } oder null.
 */
export function matchBlock(templateBlock, templateLabel, candidates, targetSession) {
  let best = null;
  for (const c of candidates) {
    if (c.pageIndex !== templateBlock.pageIndex) continue;
    const em = Math.max(templateBlock.size, 1);
    const dPos = Math.hypot(c.x - templateBlock.x, c.y - templateBlock.y) / em;
    const dSize = Math.abs(c.size - templateBlock.size) / em;
    if (dPos > 6 || dSize > 0.3) continue;
    let score = dPos + 4 * dSize;
    if (fontLabelOf(targetSession, c) === templateLabel) score -= 0.5;
    if (c.text === templateBlock.text) score -= 1.5;
    else if (c.text.split('\n')[0] === templateBlock.text.split('\n')[0]) score -= 0.75;
    if (Math.abs(c.lines.length - templateBlock.lines.length) === 0) score -= 0.25;
    if (!best || score < best.score) best = { block: c, score };
  }
  return best;
}

/** Uebersetzt eine Schriftwahl der Vorlage in das Zieldokument. */
function mapFontChoice(choice, templateSession, targetSession) {
  if (!choice) return undefined;
  if (choice.type === 'standard') return choice;
  const entry = templateSession.getEntry(choice.id);
  if (!entry) return undefined;
  const target = targetSession.fontEntries.find(e => e.baseFontPlain === entry.baseFontPlain && targetSession.getEncoder(e.id));
  if (target) return { type: 'entry', id: target.id };
  const enc = templateSession.getEncoder(choice.id);
  return { type: 'standard', name: pickStandardFont(enc || {}) };
}

/**
 * Uebertraegt die Aenderungen der Vorlage auf ein analysiertes Zieldokument.
 * Liefert Bloecke und Aenderungen fuer session.render sowie eine Trefferliste.
 */
export function transferEdits(template, target) {
  const targetBlocks = new Map(target.blocks);
  const targetEdits = new Map();
  const matches = [];
  const used = new Set();
  const candidates = [...target.blocks.values()];

  for (const [id, edit] of template.edits) {
    const tb = template.blocks.get(id);
    if (!tb) continue;
    if (tb.added) {
      const newId = nextBlockId();
      const font = mapFontChoice(edit.font, template.session, target.session) || { type: 'standard', name: 'Helvetica' };
      const entry = font.type === 'entry' ? target.session.getEntry(font.id) : null;
      const block = {
        ...tb, id: newId, fontEntryId: entry ? entry.id : null,
        fontName: entry ? (target.fontNameByEntry.get(entry.id) || null) : null, sampled: true,
      };
      targetBlocks.set(newId, block);
      targetEdits.set(newId, { ...edit, font });
      matches.push({ editId: id, targetId: newId, status: 'added', templateText: edit.text ?? '', targetText: null });
      continue;
    }
    const label = fontLabelOf(template.session, tb);
    const m = matchBlock(tb, label, candidates.filter(c => !used.has(c.id)), target.session);
    if (!m) {
      matches.push({ editId: id, targetId: null, status: 'missing', templateText: tb.text, targetText: null });
      continue;
    }
    used.add(m.block.id);
    const e = { ...edit };
    if (edit.font !== undefined) {
      const mapped = mapFontChoice(edit.font, template.session, target.session);
      if (mapped) e.font = mapped; else delete e.font;
    }
    // Schriftgroesse relativ uebernehmen, falls die Zielschrift minimal abweicht
    if (edit.size !== undefined && tb.size) e.size = Math.round((edit.size / tb.size) * m.block.size * 10) / 10;
    targetEdits.set(m.block.id, e);
    matches.push({ editId: id, targetId: m.block.id, status: 'ok', templateText: tb.text, targetText: m.block.text, score: m.score });
  }
  return { blocks: targetBlocks, edits: targetEdits, matches };
}

/**
 * Verarbeitet eine Liste von Dateien. onProgress(index, total, name).
 * Liefert je Datei { name, outputName, bytes, matches, report, error }.
 */
export async function processBatch(files, template, onProgress, options = {}) {
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) onProgress(i, files.length, file.name);
    let target = null;
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      target = await analyzeDocument(bytes);
      const { blocks, edits, matches } = transferEdits(template, target);
      const editedBlocks = [...edits.keys()].map(id => blocks.get(id)).filter(Boolean);
      await sampleBlockColors(target.pdfjsDoc, target.session, editedBlocks);
      let { bytes: out, report } = await target.session.render(blocks, edits);
      if (options.attachment) out = await mergeWithAttachment(out, options.attachment, options.attachmentPosition);
      // Betrag je Datei erkennen, damit der Dateiname den Betrag dieses PDF traegt
      const praefix = options.amountPrefix ? amountPrefix(findInvoiceAmount(blocks)) : '';
      results.push({ name: file.name, outputName: outputNameFor(file.name, options.suffix, praefix), bytes: out, matches, report, pages: target.pages.length, error: null });
    } catch (e) {
      console.error('Stapelverarbeitung fehlgeschlagen fuer', file.name, e);
      results.push({ name: file.name, outputName: outputNameFor(file.name, options.suffix), bytes: null, matches: [], report: {}, pages: 0, error: e?.message || String(e) });
    } finally {
      if (target?.pdfjsDoc) { try { target.pdfjsDoc.destroy(); } catch { /* ignore */ } }
    }
  }
  if (onProgress) onProgress(files.length, files.length, null);
  return results;
}

export function outputNameFor(name, suffix = '_bearbeitet', prefix = '') {
  return (prefix ?? '') + (name || 'dokument.pdf').replace(/\.pdf$/i, '') + (suffix ?? '') + '.pdf';
}

/**
 * Haengt ein uebergreifendes PDF (z. B. AGB, Anschreiben) an ein Dokument an.
 * position: 'hinten' (Einzel-PDF + Anhang) oder 'vorne' (Anhang + Einzel-PDF).
 */
export async function mergeWithAttachment(bytes, attachmentBytes, position = 'hinten') {
  const { PDFDocument } = await import('pdf-lib');
  const main = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  const attachment = await PDFDocument.load(attachmentBytes, { ignoreEncryption: true, updateMetadata: false });
  const pages = await main.copyPages(attachment, attachment.getPageIndices());
  if (position === 'vorne') {
    pages.forEach((p, i) => main.insertPage(i, p));
  } else {
    pages.forEach(p => main.addPage(p));
  }
  return main.save({ updateFieldAppearances: false });
}

export async function pdfPageCount(bytes) {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  return doc.getPageCount();
}
