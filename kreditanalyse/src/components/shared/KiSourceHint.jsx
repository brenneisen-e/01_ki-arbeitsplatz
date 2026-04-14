/**
 * KiSourceHint — Klickbares Vorschau-Thumbnail neben einem Formularfeld,
 * das zeigt, aus welchem Dokument die KI den vorbelegten Wert extrahiert hat.
 *
 * Klick öffnet ein Modal mit einer Mock-PDF-Seite (SVG), auf der die
 * betreffende Stelle gelb hervorgehoben wird.
 *
 * Usage:
 *   <KiSourceHint
 *     document="handelsregister"
 *     field="Firmenname"
 *     value="Rhein-Immobilien GmbH"
 *   />
 */

import { useState } from 'react';
import { Sparkles, X, FileText, MapPin } from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock-Dokumente: SVG-Seiten mit Layout und Highlight-Bereichen pro Feld
// ---------------------------------------------------------------------------

const DOCUMENTS = {
  handelsregister: {
    title: 'Handelsregisterauszug',
    subtitle: 'Amtsgericht Düsseldorf · HRB 65890 · Abruf vom 10.04.2026',
    seiten: 3,
    pageLabel: 'Seite 1 von 3',
    rows: [
      { label: 'Nummer der Firma', value: 'HRB 65890', field: 'hrb' },
      { label: 'Firma', value: 'Rhein-Immobilien GmbH', field: 'firma' },
      { label: 'Sitz', value: 'Düsseldorf', field: 'ort' },
      { label: 'Geschäftsanschrift', value: 'Königsallee 92, 40212 Düsseldorf', field: 'adresse' },
      { label: 'Gegenstand des Unternehmens', value: 'Erwerb, Verwaltung, Bebauung und Verwertung von Grundstücken', field: 'branche' },
      { label: 'Stammkapital', value: '250.000,00 EUR', field: 'stammkapital' },
      { label: 'Rechtsform', value: 'Gesellschaft mit beschränkter Haftung', field: 'rechtsform' },
      { label: 'Tag der Eintragung', value: '15. März 2008', field: 'gruendung' },
      { label: 'Geschäftsführer', value: 'Clemens Vogel, geb. 12.03.1968', field: 'gf' },
      { label: 'Vertretungsregelung', value: 'Die Gesellschaft wird durch einen Geschäftsführer vertreten.', field: 'vertretung' },
    ],
  },
  gesellschaftsvertrag: {
    title: 'Gesellschaftsvertrag',
    subtitle: 'Notariell beurkundet · URNr. 512/2008 · §§ Auszug',
    seiten: 12,
    pageLabel: 'Seite 2 von 12',
    rows: [
      { label: '§ 1 Firma und Sitz', value: 'Die Firma der Gesellschaft lautet Rhein-Immobilien GmbH. Sitz ist Düsseldorf.', field: 'firma' },
      { label: '§ 2 Gegenstand', value: 'Erwerb, Verwaltung und Bebauung von Grundstücken und grundstücksgleichen Rechten.', field: 'branche' },
      { label: '§ 3 Stammkapital', value: 'Das Stammkapital der Gesellschaft beträgt 250.000,00 EUR.', field: 'stammkapital' },
      { label: '§ 4 Gesellschafter', value: 'Clemens Vogel hält einen Anteil von 100 % (Nennwert 250.000,00 EUR).', field: 'gesellschafter' },
      { label: '§ 5 Geschäftsjahr', value: 'Das Geschäftsjahr ist das Kalenderjahr.', field: 'geschaeftsjahr' },
    ],
  },
  jahresabschluss: {
    title: 'Jahresabschluss 2023',
    subtitle: 'Rhein-Immobilien GmbH · Testiert am 28.03.2024',
    seiten: 18,
    pageLabel: 'Seite 4 von 18 – Bilanz',
    rows: [
      { label: 'Umsatzerlöse', value: '4.980.000 EUR', field: 'umsatz' },
      { label: 'EBITDA', value: '473.000 EUR', field: 'ebitda' },
      { label: 'Jahresüberschuss', value: '285.000 EUR', field: 'jahresuberschuss' },
      { label: 'Bilanzsumme', value: '8.940.000 EUR', field: 'bilanzsumme' },
      { label: 'Eigenkapital', value: '2.905.000 EUR', field: 'eigenkapital' },
      { label: 'Eigenkapitalquote', value: '32,5 %', field: 'ekquote' },
      { label: 'Verbindlichkeiten', value: '5.915.000 EUR', field: 'fremdkapital' },
    ],
  },
  bwa: {
    title: 'BWA März 2026',
    subtitle: 'Betriebswirtschaftliche Auswertung · Stand 31.03.2026',
    seiten: 4,
    pageLabel: 'Seite 1 von 4',
    rows: [
      { label: 'Gesamtleistung YTD', value: '1.245.000 EUR', field: 'umsatz' },
      { label: 'Materialaufwand', value: '-412.000 EUR', field: 'materialaufwand' },
      { label: 'Personalaufwand', value: '-385.000 EUR', field: 'personalaufwand' },
      { label: 'Sonstige betriebl. Aufwendungen', value: '-178.000 EUR', field: 'sonstige' },
      { label: 'Vorläufiges Ergebnis', value: '+ 270.000 EUR', field: 'ergebnis' },
    ],
  },
  transparenzregister: {
    title: 'Transparenzregisterauszug',
    subtitle: 'Bundesanzeiger-Verlag · Abruf vom 12.04.2026',
    seiten: 2,
    pageLabel: 'Seite 1 von 2',
    rows: [
      { label: 'Rechtseinheit', value: 'Rhein-Immobilien GmbH (HRB 65890)', field: 'firma' },
      { label: 'Wirtschaftlich Berechtigter', value: 'Clemens Vogel, geb. 12.03.1968, Düsseldorf', field: 'ubo' },
      { label: 'Art der Berechtigung', value: 'Kapitalanteile > 25 %', field: 'berechtigung' },
      { label: 'Umfang der Berechtigung', value: '100 %', field: 'anteil' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Render-Komponente
// ---------------------------------------------------------------------------

export default function KiSourceHint({ document = 'handelsregister', field, value, extractedAt }) {
  const [open, setOpen] = useState(false);

  const doc = DOCUMENTS[document] || DOCUMENTS.handelsregister;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="KI-Quelle anzeigen (aus welchem Dokument stammt dieser Wert?)"
        className="inline-flex items-center gap-1 shrink-0 rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-colors"
      >
        <Sparkles size={10} strokeWidth={2} />
        KI-Quelle
      </button>

      {open && (
        <SourceModal
          doc={doc}
          field={field}
          value={value}
          extractedAt={extractedAt}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Modal mit SVG Dokument-Vorschau + Highlight
// ---------------------------------------------------------------------------

function SourceModal({ doc, field, value, extractedAt, onClose }) {
  // Zeile finden, die dem angefragten Feld entspricht
  const matchIdx = doc.rows.findIndex(r => r.field === field);
  const matchRow = matchIdx >= 0 ? doc.rows[matchIdx] : null;

  const PAGE_W = 600;
  const PAGE_H = 800;
  const PADDING = 36;
  const ROW_H = 48;
  const LABEL_W = 200;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center">
              <FileText size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-base font-semibold font-headline text-text-primary">
                KI-Quelle: {doc.title}
              </h3>
              <p className="text-xs text-text-muted">{doc.subtitle}</p>
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

        {/* Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_300px]">
          {/* Document preview */}
          <div className="overflow-y-auto scrollbar-thin p-6 bg-slate-100">
            <div className="mx-auto" style={{ width: PAGE_W, maxWidth: '100%' }}>
              <svg
                viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
                width="100%"
                className="rounded-lg shadow-lg bg-white"
                style={{ border: '1px solid #E2E8F0' }}
              >
                {/* Page background */}
                <rect x="0" y="0" width={PAGE_W} height={PAGE_H} fill="white" />

                {/* Header */}
                <text x={PADDING} y="50" fontSize="18" fontWeight="700" fill="#0F172A" fontFamily="DM Sans">
                  {doc.title}
                </text>
                <text x={PADDING} y="70" fontSize="10" fill="#64748B" fontFamily="IBM Plex Sans">
                  {doc.subtitle}
                </text>
                <line x1={PADDING} y1="85" x2={PAGE_W - PADDING} y2="85" stroke="#CBD5E1" />

                {/* Rows */}
                {doc.rows.map((row, i) => {
                  const y = 110 + i * ROW_H;
                  const isMatch = i === matchIdx;
                  return (
                    <g key={i}>
                      {isMatch && (
                        <>
                          <rect
                            x={PADDING - 6}
                            y={y - 18}
                            width={PAGE_W - PADDING * 2 + 12}
                            height={ROW_H - 6}
                            rx="4"
                            fill="#FEF08A"
                            fillOpacity="0.65"
                            stroke="#EAB308"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                          />
                          <rect
                            x={PAGE_W - PADDING - 2}
                            y={y - 14}
                            width="4"
                            height="20"
                            fill="#EAB308"
                          />
                        </>
                      )}
                      <text x={PADDING} y={y} fontSize="10" fontWeight="600" fill="#64748B" fontFamily="IBM Plex Sans">
                        {row.label}
                      </text>
                      <text x={PADDING + LABEL_W} y={y} fontSize="11" fill={isMatch ? '#713F12' : '#0F172A'} fontFamily="IBM Plex Mono" fontWeight={isMatch ? 600 : 400}>
                        {truncate(row.value, 56)}
                      </text>
                    </g>
                  );
                })}

                {/* Footer */}
                <line x1={PADDING} y1={PAGE_H - 40} x2={PAGE_W - PADDING} y2={PAGE_H - 40} stroke="#CBD5E1" />
                <text x={PADDING} y={PAGE_H - 18} fontSize="9" fill="#94A3B8" fontFamily="IBM Plex Sans">
                  {doc.pageLabel}
                </text>
                <text x={PAGE_W - PADDING} y={PAGE_H - 18} fontSize="9" fill="#94A3B8" fontFamily="IBM Plex Sans" textAnchor="end">
                  Digital signiert · Amtsgericht
                </text>
              </svg>
            </div>
          </div>

          {/* Sidebar: Extraktion-Details */}
          <div className="border-l border-border bg-surface px-5 py-6 overflow-y-auto scrollbar-thin">
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                Extrahiertes Feld
              </p>
              <p className="text-sm font-semibold text-text-primary">
                {matchRow?.label || field || '—'}
              </p>
            </div>

            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                Wert laut Dokument
              </p>
              <p className="font-mono text-sm text-text-primary bg-white border border-border rounded-lg p-3 whitespace-pre-wrap break-words">
                {matchRow?.value || value || '—'}
              </p>
            </div>

            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                Übernommener Wert (KI)
              </p>
              <p className="font-mono text-sm text-text-primary bg-white border border-violet-200 rounded-lg p-3">
                {value || '—'}
              </p>
            </div>

            <div className="mb-5 flex items-start gap-2 p-3 rounded-lg bg-violet-50 border border-violet-200">
              <Sparkles size={14} strokeWidth={1.5} className="text-violet-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-violet-800 mb-0.5">KI-Extraktion</p>
                <p className="text-[11px] text-violet-700 leading-relaxed">
                  OCR + LLM-basierte Entity-Extraktion. Das Modell identifiziert strukturierte Felder
                  (Firma, Rechtsform, HRB, Adresse …) und ordnet sie Formularfeldern zu.
                  Menschliche Freigabe durch den Firmenkundenberater ist erforderlich.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-[11px] text-text-secondary">
              <div className="flex items-center gap-2">
                <MapPin size={11} strokeWidth={1.5} className="text-text-muted" />
                <span>Dokument: {doc.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={11} strokeWidth={1.5} className="text-text-muted" />
                <span>{doc.pageLabel}</span>
              </div>
              {extractedAt && (
                <div className="flex items-center gap-2">
                  <Sparkles size={11} strokeWidth={1.5} className="text-text-muted" />
                  <span>Extrahiert am {extractedAt}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-surface/50">
          <p className="text-[11px] text-text-muted">
            Die KI zeigt transparent, aus welchem Dokument und welcher Stelle jeder Wert stammt — alle
            Vorbefüllungen sind durch den Bearbeiter zu prüfen.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-body bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
