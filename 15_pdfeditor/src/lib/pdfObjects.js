// Kleine Helfer fuer den Zugriff auf pdf-lib-Objekte (indirekte Referenzen
// aufloesen, Zahlen/Namen lesen, Stream-Inhalte dekodieren).
import { PDFName, PDFDict, PDFNumber, PDFRef, PDFStream, PDFRawStream, decodePDFRawStream } from 'pdf-lib';

export function lookup(ctx, obj) {
  return obj instanceof PDFRef ? ctx.lookup(obj) : obj;
}

export function dictGet(ctx, dict, key) {
  if (!(dict instanceof PDFDict)) return undefined;
  return lookup(ctx, dict.get(PDFName.of(key)));
}

export function num(obj, def = 0) {
  return obj instanceof PDFNumber ? obj.asNumber() : def;
}

export function nameStr(obj) {
  return obj instanceof PDFName ? obj.decodeText() : undefined;
}

export function streamBytes(ctx, s) {
  s = lookup(ctx, s);
  if (!(s instanceof PDFStream)) return null;
  try {
    if (s instanceof PDFRawStream) return decodePDFRawStream(s).decode();
    if (typeof s.getContents === 'function') return s.getContents();
  } catch (e) {
    console.warn('Stream konnte nicht dekodiert werden', e);
  }
  return null;
}

export function streamText(ctx, s) {
  const bytes = streamBytes(ctx, s);
  return bytes ? new TextDecoder('latin1').decode(bytes) : null;
}

export function stripSubsetTag(name) {
  return (name || '').replace(/^[A-Z]{6}\+/, '');
}
