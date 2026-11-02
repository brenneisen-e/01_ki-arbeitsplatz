// Speichert die PDF-Bytes: ueber den nativen Speichern-Dialog (Chromium),
// ansonsten als Download.
// getBytes: () => Promise<Uint8Array>. Der Speichern-Dialog wird zuerst
// geoeffnet (noch innerhalb der Nutzeraktion), erst danach wird das PDF erzeugt.
export async function savePdf(getBytes, suggestedName) {
  if (typeof window.showSaveFilePicker === 'function' && window.self === window.top) {
    let handle = null;
    try {
      handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{ description: 'PDF-Dokument', accept: { 'application/pdf': ['.pdf'] } }],
      });
    } catch (e) {
      if (e && e.name === 'AbortError') return { method: 'abgebrochen' };
      handle = null; // Fallback auf Download
    }
    if (handle) {
      const bytes = await getBytes();
      const writable = await handle.createWritable();
      await writable.write(new Blob([bytes], { type: 'application/pdf' }));
      await writable.close();
      return { method: 'picker', name: handle.name || suggestedName };
    }
  }
  const bytes = await getBytes();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return { method: 'download', name: suggestedName };
}

export const DEFAULT_SUFFIX = '_bearbeitet';
const SUFFIX_KEY = 'pdfeditor.dateizusatz';

/** Entfernt Zeichen, die in Dateinamen nicht erlaubt sind. */
export function sanitizeSuffix(suffix) {
  return (suffix ?? '').replace(/[\\/:*?"<>|\n\r\t]/g, '').slice(0, 60);
}

export function loadSuffix() {
  try {
    const v = window.localStorage.getItem(SUFFIX_KEY);
    return v === null ? DEFAULT_SUFFIX : sanitizeSuffix(v);
  } catch { return DEFAULT_SUFFIX; }
}

export function storeSuffix(suffix) {
  try { window.localStorage.setItem(SUFFIX_KEY, sanitizeSuffix(suffix)); } catch { /* ignore */ }
}

export function suggestedFileName(originalName, suffix = DEFAULT_SUFFIX, prefix = '') {
  const base = (originalName || 'dokument.pdf').replace(/\.pdf$/i, '');
  return `${sanitizePrefix(prefix)}${base}${sanitizeSuffix(suffix)}.pdf`;
}

const PREFIX_KEY = 'pdfeditor.betragVoranstellen';

/** Entfernt Zeichen, die in Dateinamen nicht erlaubt sind (Praefix). */
export function sanitizePrefix(prefix) {
  return (prefix ?? '').replace(/[\\/:*?"<>|\n\r\t]/g, '').slice(0, 40);
}

/** Merkt, ob der erkannte Betrag dem Dateinamen vorangestellt wird. */
export function loadAmountPrefixOption() {
  try { return window.localStorage.getItem(PREFIX_KEY) !== 'nein'; } catch { return true; }
}

export function storeAmountPrefixOption(on) {
  try { window.localStorage.setItem(PREFIX_KEY, on ? 'ja' : 'nein'); } catch { /* ignore */ }
}
