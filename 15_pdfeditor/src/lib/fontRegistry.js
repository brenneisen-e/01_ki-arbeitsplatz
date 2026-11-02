// Sammelt alle Schrift-Dictionaries eines Dokuments (Seitenressourcen und
// Form-XObjects) und ordnet sie den Schriftnamen zu, die pdf.js bei der
// Textextraktion liefert.
import { PDFName, PDFDict, PDFRef, PDFStream } from 'pdf-lib';
import { dictGet, lookup, nameStr, stripSubsetTag } from './pdfObjects.js';

export function collectFonts(pdfDoc) {
  const ctx = pdfDoc.context;
  const entries = [];
  const byTag = new Map();

  const visitResources = (resObj, pageIndex, visited) => {
    const res = lookup(ctx, resObj);
    if (!(res instanceof PDFDict)) return;
    const fonts = dictGet(ctx, res, 'Font');
    if (fonts instanceof PDFDict) {
      for (const [key, val] of fonts.entries()) {
        const ref = val instanceof PDFRef ? val : null;
        const dict = lookup(ctx, val);
        if (!(dict instanceof PDFDict)) continue;
        const tag = ref ? ref.toString() : `inline:${pageIndex}:${key.decodeText()}`;
        let e = byTag.get(tag);
        if (!e) {
          const descriptor = dictGet(ctx, dict, 'FontDescriptor');
          const baseFont = nameStr(dictGet(ctx, dict, 'BaseFont')) || '';
          const descName = nameStr(dictGet(ctx, descriptor, 'FontName')) || '';
          e = {
            id: 'f' + entries.length,
            ref,
            dict,
            baseFont,
            baseFontPlain: stripSubsetTag(baseFont),
            fontName: descName,
            subtype: nameStr(dictGet(ctx, dict, 'Subtype')) || '',
            pages: new Set(),
          };
          byTag.set(tag, e);
          entries.push(e);
        }
        e.pages.add(pageIndex);
      }
    }
    const xobjs = dictGet(ctx, res, 'XObject');
    if (xobjs instanceof PDFDict) {
      for (const [, v] of xobjs.entries()) {
        const tag = v instanceof PDFRef ? v.toString() : null;
        if (tag) { if (visited.has(tag)) continue; visited.add(tag); }
        const x = lookup(ctx, v);
        if (x instanceof PDFStream && nameStr(dictGet(ctx, x.dict, 'Subtype')) === 'Form') {
          visitResources(x.dict.get(PDFName.of('Resources')), pageIndex, visited);
        }
      }
    }
  };

  pdfDoc.getPages().forEach((page, i) => {
    let res;
    try { res = page.node.getInheritableAttribute(PDFName.of('Resources')); } catch { res = page.node.get(PDFName.of('Resources')); }
    visitResources(res, i, new Set());
  });
  return entries;
}

/**
 * Findet den Registry-Eintrag zu einem pdf.js-Font (name = BaseFont bzw.
 * FontName inkl. Subset-Tag). Exakte Treffer vor Treffern ohne Subset-Tag,
 * Schriften derselben Seite bevorzugt.
 */
export function matchFont(entries, pdfjsName, pageIndex) {
  if (!pdfjsName) return null;
  const plain = stripSubsetTag(pdfjsName);
  const score = (e) => {
    let s = 0;
    if (e.baseFont === pdfjsName || e.fontName === pdfjsName) s += 4;
    else if (e.baseFontPlain === plain || stripSubsetTag(e.fontName) === plain) s += 2;
    else return 0;
    if (e.pages.has(pageIndex)) s += 1;
    if (e.ref) s += 0.5;
    return s;
  };
  let best = null, bestScore = 0;
  for (const e of entries) {
    const s = score(e);
    if (s > bestScore) { best = e; bestScore = s; }
  }
  return best;
}
