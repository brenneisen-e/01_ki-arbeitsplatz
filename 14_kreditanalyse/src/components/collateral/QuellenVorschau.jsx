/**
 * QuellenVorschau -- zeigt eine Objektunterlage und markiert gelb, wo die KI
 * einen Wert gefunden hat.
 *
 * PDF-Seiten werden mit pdf.js gerendert; die Markierung sitzt auf dem
 * Zeilenrahmen, den der Parser beim Lesen mitgeschrieben hat. Excel-, CSV-
 * und Word-Unterlagen erscheinen als Tabelle mit markierter Zeile.
 * Rechts stehen alle Werte, die aus dieser Unterlage stammen; ein Klick
 * springt zur jeweiligen Fundstelle.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, FileSpreadsheet, LoaderCircle, MapPin, Sparkles, X } from 'lucide-react';
import { openPdf } from '../../utils/pdfTextExtract';
import { OBJEKT_FELDER, UNTERLAGEN_LABEL } from '../../data/objektunterlagen';
import { formatiereFeld } from './objektFormat';

// Hochformat in Lesebreite, Querformat (z. B. Mieterliste) breiter
const breiteFuer = (seite) => (seite.breite > seite.hoehe ? 900 : 620);

function PdfSeiten({ bytes, seiten, markierungen, onFertig }) {
  const canvasRefs = useRef([]);
  const [status, setStatus] = useState('laedt');

  useEffect(() => {
    let abgebrochen = false;
    let pdf = null;
    (async () => {
      try {
        pdf = await openPdf(bytes);
        const anzahl = Math.min(pdf.numPages, seiten.length);
        for (let nr = 1; nr <= anzahl; nr += 1) {
          const page = await pdf.getPage(nr);
          const basis = page.getViewport({ scale: 1 });
          const ziel = basis.width > basis.height ? 900 : 620;
          const viewport = page.getViewport({ scale: (ziel / basis.width) * Math.min(2, window.devicePixelRatio || 1) });
          const canvas = canvasRefs.current[nr - 1];
          if (abgebrochen || !canvas) return;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        }
        if (!abgebrochen) {
          setStatus('fertig');
          onFertig?.();
        }
      } catch {
        if (!abgebrochen) setStatus('fehler');
      }
    })();
    return () => {
      abgebrochen = true;
      pdf?.destroy();
    };
    // onFertig ist bewusst nicht Teil der Abhängigkeiten: neu rendern nur bei neuer Datei
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bytes, seiten.length]);

  return (
    <div className="space-y-4">
      {status === 'laedt' && (
        <div className="flex items-center justify-center gap-2 text-xs text-text-muted py-2">
          <LoaderCircle size={14} className="animate-spin" /> Dokument wird dargestellt …
        </div>
      )}
      {status === 'fehler' && (
        <p className="text-xs text-danger text-center py-2">Die Seiten konnten nicht dargestellt werden.</p>
      )}
      {seiten.map((seite, i) => (
        <div
          key={seite.nr}
          className="relative bg-white rounded-md shadow-lg border border-border overflow-hidden mx-auto"
          style={{ width: '100%', maxWidth: breiteFuer(seite), aspectRatio: `${seite.breite} / ${seite.hoehe}` }}
        >
          <canvas ref={(el) => { canvasRefs.current[i] = el; }} className="absolute inset-0 w-full h-full" />
          {markierungen
            .filter((m) => m.seite === seite.nr && m.rahmen)
            .map((m, j) => (
              <div
                key={j}
                data-markierung
                className="absolute rounded-sm border-2 border-dashed border-yellow-500 bg-yellow-200/45 pointer-events-none"
                style={{
                  left: `${(m.rahmen.links / seite.breite) * 100}%`,
                  top: `${(m.rahmen.oben / seite.hoehe) * 100}%`,
                  width: `${((m.rahmen.rechts - m.rahmen.links) / seite.breite) * 100}%`,
                  height: `${((m.rahmen.unten - m.rahmen.oben) / seite.hoehe) * 100}%`,
                }}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

function TabellenSeiten({ seiten, markierungen }) {
  return (
    <div className="space-y-4">
      {seiten.map((seite) => {
        const spalten = Math.max(1, ...seite.zeilen.map((z) => (z.zellen.length ? Math.round(z.zellen[z.zellen.length - 1].x0 / 100) + 1 : 0)));
        return (
          <div key={seite.nr} className="bg-white rounded-md shadow-lg border border-border overflow-x-auto">
            <table className="w-full text-[11px] font-mono">
              <tbody>
                {seite.zeilen.map((z, i) => {
                  const markiert = markierungen.some((m) => m.seite === seite.nr && m.zeile === i);
                  const zellen = Array.from({ length: spalten }, (_, s) => z.zellen.find((c) => Math.round(c.x0 / 100) === s)?.text ?? '');
                  return (
                    <tr
                      key={i}
                      data-markierung={markiert ? '' : undefined}
                      className={`border-b border-border/60 last:border-b-0 ${markiert ? 'bg-yellow-100 outline-2 outline-dashed outline-yellow-500 -outline-offset-2' : ''}`}
                    >
                      {zellen.map((text, s) => (
                        <td key={s} className="px-2.5 py-1.5 whitespace-nowrap text-text-primary">{text}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

/**
 * @param {object}   unterlage  { name, format, typ, dok, bytes, ergebnis }
 * @param {string}   [feld]     Feld, dessen Fundstelle zuerst markiert wird
 * @param {object}   [quellen]  item.quellen -- welche Werte tatsächlich übernommen wurden
 * @param {object}   [werte]    aktuelle Werte der übernommenen Felder
 */
export default function QuellenVorschau({ unterlage, feld, quellen = {}, werte = {}, onClose }) {
  const [aktiv, setAktiv] = useState(feld || null);
  const scrollRef = useRef(null);
  const [gerendert, setGerendert] = useState(unterlage.format !== 'pdf');

  const funde = useMemo(() => {
    const felder = unterlage.ergebnis?.felder || {};
    return Object.entries(felder)
      .filter(([key]) => OBJEKT_FELDER[key])
      .map(([key, fund]) => ({
        key,
        ...fund,
        label: OBJEKT_FELDER[key].label,
        uebernommen: quellen[key]?.unterlageId === unterlage.id,
      }));
  }, [unterlage, quellen]);

  const aktuell = funde.find((f) => f.key === aktiv) || null;
  const seiten = unterlage.dok?.seiten || [];
  const markierungen = (aktuell?.stellen || []).map((s) => ({
    ...s,
    rahmen: seiten.find((seite) => seite.nr === s.seite)?.zeilen[s.zeile]?.rahmen,
  }));

  // Zur ersten Markierung scrollen (ohne scrollIntoView, das auch äußere Container bewegt)
  useEffect(() => {
    if (!gerendert || !scrollRef.current) return;
    const ziel = scrollRef.current.querySelector('[data-markierung]');
    if (!ziel) return;
    const box = scrollRef.current.getBoundingClientRect();
    const r = ziel.getBoundingClientRect();
    scrollRef.current.scrollTop += r.top - box.top - box.height / 3;
  }, [aktiv, gerendert]);

  useEffect(() => {
    const taste = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  }, [onClose]);

  const Icon = unterlage.format === 'pdf' ? FileText : FileSpreadsheet;
  const seitenzahl = seiten.length;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(28,26,23,0.45)] backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`KI-Quelle: ${unterlage.name}`}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold font-headline text-text-primary truncate">
                {aktuell ? 'KI-Quelle' : 'Unterlage'}: {UNTERLAGEN_LABEL[unterlage.typ] || 'Nicht zugeordnet'}
              </h3>
              <p className="text-xs text-text-muted truncate">{unterlage.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div ref={scrollRef} className="overflow-y-auto scrollbar-thin p-6 bg-slate-100 min-h-[320px]">
            {unterlage.format === 'pdf' && unterlage.bytes ? (
              <PdfSeiten bytes={unterlage.bytes} seiten={seiten} markierungen={markierungen} onFertig={() => setGerendert(true)} />
            ) : (
              <TabellenSeiten seiten={seiten} markierungen={markierungen} />
            )}
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-border bg-surface px-5 py-5 overflow-y-auto scrollbar-thin">
            {aktuell ? (
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-1">Extrahiertes Feld</p>
                  <p className="text-sm font-semibold text-text-primary">{aktuell.label}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-1">Wert laut Dokument</p>
                  <p className="font-mono text-xs text-text-primary bg-white border border-border rounded-lg p-3 whitespace-pre-wrap break-words">
                    {aktuell.roh}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-1">Übernommener Wert (KI)</p>
                  <p className="font-mono text-sm text-text-primary bg-white border border-violet-200 rounded-lg p-3">
                    {formatiereFeld(aktuell.key, aktuell.uebernommen && werte[aktuell.key] != null ? werte[aktuell.key] : aktuell.wert)}
                  </p>
                  {!aktuell.uebernommen && (
                    <p className="text-[11px] text-text-muted mt-1.5">
                      Nicht übernommen – für dieses Feld hat eine andere Unterlage Vorrang oder der Wert wurde von Hand gesetzt.
                    </p>
                  )}
                </div>
                {aktuell.hinweis && (
                  <p className="text-[11px] text-violet-800 bg-violet-50 border border-violet-200 rounded-lg p-2.5 leading-relaxed">
                    {aktuell.hinweis}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                  <MapPin size={11} strokeWidth={1.5} className="text-text-muted" />
                  <span>
                    {seitenzahl > 1 ? `Seite ${aktuell.stellen?.[0]?.seite ?? 1} von ${seitenzahl} · ` : ''}
                    {aktuell.stellen?.length > 1 ? `${aktuell.stellen.length} Zeilen markiert` : '1 Zeile markiert'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-secondary mb-5 leading-relaxed">
                Wähle einen Wert, um seine Fundstelle im Dokument zu markieren.
              </p>
            )}

            <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-2">
              Aus dieser Unterlage gelesen ({funde.length})
            </p>
            {funde.length === 0 ? (
              <p className="text-xs text-text-muted">Noch keine Werte – starte das KI-Auslesen.</p>
            ) : (
              <ul className="space-y-1">
                {funde.map((f) => (
                  <li key={f.key}>
                    <button
                      type="button"
                      onClick={() => setAktiv(f.key)}
                      className={`w-full flex items-baseline justify-between gap-3 text-left rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                        f.key === aktiv ? 'bg-yellow-100 text-text-primary' : 'hover:bg-white text-text-secondary'
                      }`}
                    >
                      <span className="truncate">{f.label}</span>
                      <span className={`font-mono shrink-0 ${f.uebernommen ? 'text-text-primary' : 'text-text-muted line-through decoration-text-muted/50'}`}>
                        {formatiereFeld(f.key, f.wert)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-violet-50 border border-violet-200">
              <Sparkles size={14} strokeWidth={1.5} className="text-violet-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-violet-800 leading-relaxed">
                Texterkennung mit Positionsangaben, Zuordnung über Feldbezeichnungen und Tabellenköpfe; Summen werden gegen die
                Einzelzeilen geprüft. Die Freigabe der Werte erfolgt durch den Bearbeiter.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-6 py-3 border-t border-border bg-surface/50">
          <p className="text-[11px] text-text-muted">
            Jeder vorbefüllte Wert ist bis zur Fundstelle im Dokument nachvollziehbar – bitte vor der Übernahme prüfen.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-body bg-primary text-white rounded-lg hover:bg-primary-light transition-colors shrink-0"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
