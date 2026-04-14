/**
 * MockPdfPreview — zeigt ein Mock-PDF eines Dokuments (Handelsregisterauszug,
 * Ausweiskopie, Gesellschaftsvertrag, …) in einem Modal an.
 *
 * Nutzung:
 *   <MockPdfPreviewButton documentId="handelsregister" label="Ansehen" />
 *   <MockPdfPreviewModal documentId="handelsregister" onClose={...} />
 */

import { useState } from 'react';
import { X, FileText, Download, Printer, Eye } from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock-Dokumente: Jede Definition beschreibt einen Seiteninhalt als
// strukturierte Liste von Blöcken. Wird als SVG-Seite gerendert.
// ---------------------------------------------------------------------------

const DOCS = {
  handelsregister: {
    title: 'Handelsregisterauszug',
    subtitle: 'Amtsgericht Düsseldorf · HRB 65890',
    meta: 'Abruf: 10.04.2026 · Digital signiert',
    pageLabel: 'Seite 1 von 3',
    blocks: [
      { type: 'heading', text: 'A Aktuelle Eintragungen' },
      { type: 'field', label: 'Nummer der Firma', value: 'HRB 65890' },
      { type: 'field', label: 'Firma', value: 'Rhein-Immobilien GmbH' },
      { type: 'field', label: 'Sitz', value: 'Düsseldorf' },
      { type: 'field', label: 'Geschäftsanschrift', value: 'Königsallee 92, 40212 Düsseldorf' },
      { type: 'field', label: 'Gegenstand des Unternehmens', value: 'Erwerb, Verwaltung, Bebauung und Verwertung von Grundstücken und grundstücksgleichen Rechten.' },
      { type: 'field', label: 'Stammkapital', value: '250.000,00 EUR' },
      { type: 'field', label: 'Rechtsform', value: 'Gesellschaft mit beschränkter Haftung' },
      { type: 'field', label: 'Tag der Eintragung', value: '15. März 2008' },
      { type: 'heading', text: 'B Geschäftsführer / Vertretungsbefugnis' },
      { type: 'field', label: 'Geschäftsführer', value: 'Clemens Vogel, geb. 12.03.1968, wohnhaft Düsseldorf' },
      { type: 'field', label: 'Vertretungsregelung', value: 'Die Gesellschaft wird durch einen Geschäftsführer vertreten.' },
    ],
  },

  gesellschaftsvertrag: {
    title: 'Gesellschaftsvertrag',
    subtitle: 'Notariell beurkundet · URNr. 512/2008',
    meta: 'Notar Dr. Schmitt, Düsseldorf',
    pageLabel: 'Seite 2 von 12',
    blocks: [
      { type: 'paragraph', label: '§ 1 Firma und Sitz', value: '(1) Die Firma der Gesellschaft lautet: Rhein-Immobilien GmbH.\n(2) Sitz der Gesellschaft ist Düsseldorf.' },
      { type: 'paragraph', label: '§ 2 Gegenstand des Unternehmens', value: 'Gegenstand des Unternehmens ist der Erwerb, die Verwaltung, die Bebauung und die Verwertung von Grundstücken und grundstücksgleichen Rechten sowie alle damit in Zusammenhang stehenden Geschäfte.' },
      { type: 'paragraph', label: '§ 3 Stammkapital', value: '(1) Das Stammkapital der Gesellschaft beträgt 250.000,00 EUR.\n(2) Hiervon übernimmt Herr Clemens Vogel einen Anteil im Nennwert von 250.000,00 EUR (= 100 %).' },
      { type: 'paragraph', label: '§ 4 Geschäftsführung', value: 'Die Gesellschaft hat einen oder mehrere Geschäftsführer. Ist nur ein Geschäftsführer bestellt, vertritt er die Gesellschaft allein.' },
      { type: 'paragraph', label: '§ 5 Geschäftsjahr', value: 'Das Geschäftsjahr ist das Kalenderjahr.' },
    ],
  },

  gesellschafterliste: {
    title: 'Gesellschafterliste gem. § 40 GmbHG',
    subtitle: 'Rhein-Immobilien GmbH · HRB 65890',
    meta: 'Stand: 01.04.2026 · unterschrieben durch Geschäftsführer',
    pageLabel: 'Seite 1 von 1',
    blocks: [
      { type: 'heading', text: 'Gesellschafter' },
      { type: 'table', headers: ['Nr.', 'Name', 'Geburtsdatum', 'Nennbetrag', 'Anteil'], rows: [
        ['1', 'Clemens Vogel', '12.03.1968', '250.000,00 EUR', '100,00 %'],
      ]},
      { type: 'paragraph', label: 'Anmerkung', value: 'Die Summe aller Nennbeträge entspricht dem im Handelsregister eingetragenen Stammkapital von 250.000,00 EUR.' },
      { type: 'field', label: 'Datum / Unterschrift GF', value: '01.04.2026 / C. Vogel' },
    ],
  },

  transparenzregister: {
    title: 'Transparenzregisterauszug',
    subtitle: 'Bundesanzeiger-Verlag · Abruf 12.04.2026',
    meta: 'Auszug gem. § 23 GwG',
    pageLabel: 'Seite 1 von 2',
    blocks: [
      { type: 'heading', text: 'Rechtseinheit' },
      { type: 'field', label: 'Firma', value: 'Rhein-Immobilien GmbH' },
      { type: 'field', label: 'Registernummer', value: 'HRB 65890, Amtsgericht Düsseldorf' },
      { type: 'heading', text: 'Wirtschaftlich Berechtigter' },
      { type: 'field', label: 'Name', value: 'Clemens Vogel' },
      { type: 'field', label: 'Geburtsdatum', value: '12.03.1968' },
      { type: 'field', label: 'Wohnort', value: 'Düsseldorf, Deutschland' },
      { type: 'field', label: 'Staatsangehörigkeit', value: 'deutsch' },
      { type: 'field', label: 'Art der Berechtigung', value: 'Kapitalanteile > 25 %' },
      { type: 'field', label: 'Umfang der Berechtigung', value: '100 %' },
    ],
  },

  ausweis: {
    title: 'Personalausweis – Bundesrepublik Deutschland',
    subtitle: 'Legitimationsprüfung GF 1 · Ausweiskopie',
    meta: 'Eingereicht: 08.04.2026 · KI-OCR verifiziert',
    pageLabel: 'Seite 1 von 1',
    blocks: [
      { type: 'heading', text: 'Ausweisdaten' },
      { type: 'field', label: 'Name', value: 'Vogel' },
      { type: 'field', label: 'Vornamen', value: 'Clemens' },
      { type: 'field', label: 'Geburtsdatum', value: '12.03.1968' },
      { type: 'field', label: 'Geburtsort', value: 'Düsseldorf' },
      { type: 'field', label: 'Staatsangehörigkeit', value: 'DEUTSCH' },
      { type: 'field', label: 'Ausweisnummer', value: 'T22000129' },
      { type: 'field', label: 'Ausstellende Behörde', value: 'Stadt Düsseldorf' },
      { type: 'field', label: 'Gültig bis', value: '14.08.2030' },
      { type: 'paragraph', label: 'Hinweis', value: 'Ausweiskopie in das System eingescannt und mit Handelsregister / Transparenzregister automatisch abgeglichen. Legitimation bestätigt durch SB, 08.04.2026.' },
    ],
  },

  gewerbe: {
    title: 'Gewerbeanmeldung',
    subtitle: 'Stadt Düsseldorf · Ordnungsamt',
    meta: 'Aktenzeichen 2008/004521 · Vorgang 15.03.2008',
    pageLabel: 'Seite 1 von 1',
    blocks: [
      { type: 'heading', text: 'Angaben zum Gewerbetreibenden' },
      { type: 'field', label: 'Firma', value: 'Rhein-Immobilien GmbH' },
      { type: 'field', label: 'Rechtsform', value: 'GmbH, HRB 65890 Düsseldorf' },
      { type: 'field', label: 'Geschäftsanschrift', value: 'Königsallee 92, 40212 Düsseldorf' },
      { type: 'heading', text: 'Angaben zum Gewerbe' },
      { type: 'field', label: 'Tätigkeit', value: 'Erwerb, Verwaltung, Bebauung und Verwertung von Immobilien' },
      { type: 'field', label: 'Beginn der Tätigkeit', value: '15.03.2008' },
      { type: 'field', label: 'Anzahl Beschäftigte', value: 'ca. 18' },
      { type: 'field', label: 'Umsatzsteuer-ID', value: 'DE 278 451 902' },
      { type: 'paragraph', label: 'Bescheid', value: 'Die Anmeldung des oben genannten Gewerbes ist beim Ordnungsamt der Stadt Düsseldorf ordnungsgemäß eingegangen und bestätigt.' },
    ],
  },

  jahresabschluss: {
    title: 'Jahresabschluss 2023',
    subtitle: 'Rhein-Immobilien GmbH · testiert 28.03.2024',
    meta: 'Uneingeschränkter Bestätigungsvermerk',
    pageLabel: 'Seite 4 von 18 – Bilanz',
    blocks: [
      { type: 'heading', text: 'Bilanz zum 31.12.2023 (Auszug)' },
      { type: 'table', headers: ['Position', '31.12.2023', '31.12.2022'], rows: [
        ['AKTIVA', '', ''],
        ['  Anlagevermögen', '6.280.000', '5.950.000'],
        ['  Umlaufvermögen', '2.520.000', '2.320.000'],
        ['  Rechnungsabgrenzung', '140.000', '130.000'],
        ['Bilanzsumme', '8.940.000', '8.400.000'],
        ['PASSIVA', '', ''],
        ['  Eigenkapital', '2.905.000', '2.650.000'],
        ['  Rückstellungen', '120.000', '110.000'],
        ['  Verbindlichkeiten', '5.915.000', '5.640.000'],
        ['Bilanzsumme', '8.940.000', '8.400.000'],
      ]},
      { type: 'field', label: 'Eigenkapitalquote', value: '32,5 %' },
      { type: 'field', label: 'Umsatzerlöse', value: '4.980.000 EUR' },
      { type: 'field', label: 'Jahresüberschuss', value: '285.000 EUR' },
    ],
  },

  bwa: {
    title: 'Betriebswirtschaftliche Auswertung (BWA)',
    subtitle: 'Rhein-Immobilien GmbH · Stand 31.03.2026',
    meta: 'Datev-Auswertung · Kurzauswertung',
    pageLabel: 'Seite 1 von 4',
    blocks: [
      { type: 'heading', text: 'Gewinn- und Verlustrechnung YTD' },
      { type: 'table', headers: ['Position', 'YTD 2026', 'Vorjahr YTD', 'Abw. %'], rows: [
        ['Gesamtleistung', '1.245.000', '1.170.000', '+6,4 %'],
        ['Materialaufwand', '-412.000', '-385.000', '+7,0 %'],
        ['Personalaufwand', '-385.000', '-360.000', '+6,9 %'],
        ['Sonstige Aufwendungen', '-178.000', '-165.000', '+7,9 %'],
        ['Vorläufiges Ergebnis', '+270.000', '+260.000', '+3,8 %'],
      ]},
      { type: 'paragraph', label: 'Kommentar', value: 'Die Ertragslage ist stabil. Steigende Material- und Personalkosten werden durch Preisanpassungen ausgeglichen.' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Public: Button, der das Modal öffnet
// ---------------------------------------------------------------------------

export function MockPdfPreviewButton({ documentId, label = 'Dokument ansehen', className = '' }) {
  const [open, setOpen] = useState(false);
  if (!DOCS[documentId]) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold font-body text-primary hover:text-primary-light transition-colors ${className}`}
      >
        <Eye size={13} strokeWidth={1.5} />
        {label}
      </button>
      {open && <MockPdfPreviewModal documentId={documentId} onClose={() => setOpen(false)} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

export function MockPdfPreviewModal({ documentId, onClose }) {
  const doc = DOCS[documentId];
  if (!doc) return null;

  const PAGE_W = 620;
  const PAGE_H = 870;
  const PAD = 40;

  // Compute vertical layout
  let cursor = 110;
  const rendered = doc.blocks.map((block, i) => {
    if (block.type === 'heading') {
      const y = cursor + 10;
      cursor += 36;
      return { ...block, y };
    }
    if (block.type === 'field') {
      const y = cursor;
      cursor += 36;
      return { ...block, y };
    }
    if (block.type === 'paragraph') {
      const y = cursor;
      const lines = Math.max(2, Math.ceil((block.value?.length || 0) / 75));
      cursor += 18 + lines * 14 + 12;
      return { ...block, y, lines };
    }
    if (block.type === 'table') {
      const y = cursor;
      cursor += 24 + block.rows.length * 18 + 12;
      return { ...block, y };
    }
    return { ...block, y: cursor };
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col"
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
                {doc.title}
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
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 bg-slate-100">
          <div className="mx-auto" style={{ width: PAGE_W, maxWidth: '100%' }}>
            <svg
              viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
              width="100%"
              className="rounded-lg shadow-lg bg-white"
              style={{ border: '1px solid #E2E8F0' }}
            >
              <rect x="0" y="0" width={PAGE_W} height={PAGE_H} fill="white" />

              {/* Title block */}
              <text x={PAD} y="50" fontSize="18" fontWeight="700" fill="#0F172A" fontFamily="DM Sans">
                {doc.title}
              </text>
              <text x={PAD} y="70" fontSize="10" fill="#64748B" fontFamily="IBM Plex Sans">
                {doc.subtitle}
              </text>
              <text x={PAD} y="84" fontSize="9" fill="#94A3B8" fontFamily="IBM Plex Sans">
                {doc.meta}
              </text>
              <line x1={PAD} y1="95" x2={PAGE_W - PAD} y2="95" stroke="#CBD5E1" />

              {/* Blocks */}
              {rendered.map((b, i) => {
                if (b.type === 'heading') {
                  return (
                    <g key={i}>
                      <text x={PAD} y={b.y} fontSize="12" fontWeight="700" fill="#1B2B4B" fontFamily="DM Sans">
                        {b.text}
                      </text>
                      <line x1={PAD} y1={b.y + 6} x2={PAD + 40} y2={b.y + 6} stroke="#1B2B4B" strokeWidth="2" />
                    </g>
                  );
                }
                if (b.type === 'field') {
                  return (
                    <g key={i}>
                      <text x={PAD} y={b.y} fontSize="10" fontWeight="600" fill="#64748B" fontFamily="IBM Plex Sans">
                        {b.label}
                      </text>
                      <text x={PAD} y={b.y + 16} fontSize="11" fill="#0F172A" fontFamily="IBM Plex Mono">
                        {truncate(b.value, 68)}
                      </text>
                    </g>
                  );
                }
                if (b.type === 'paragraph') {
                  const wrapped = wrap(b.value, 75);
                  return (
                    <g key={i}>
                      <text x={PAD} y={b.y} fontSize="11" fontWeight="700" fill="#1B2B4B" fontFamily="DM Sans">
                        {b.label}
                      </text>
                      {wrapped.map((line, li) => (
                        <text key={li} x={PAD} y={b.y + 18 + li * 14} fontSize="10" fill="#0F172A" fontFamily="IBM Plex Sans">
                          {line}
                        </text>
                      ))}
                    </g>
                  );
                }
                if (b.type === 'table') {
                  const colWidth = (PAGE_W - PAD * 2) / b.headers.length;
                  return (
                    <g key={i}>
                      {/* Header */}
                      <rect x={PAD} y={b.y - 12} width={PAGE_W - PAD * 2} height="20" fill="#1B2B4B" rx="2" />
                      {b.headers.map((h, hi) => (
                        <text
                          key={hi}
                          x={PAD + hi * colWidth + 6}
                          y={b.y + 2}
                          fontSize="9"
                          fill="white"
                          fontWeight="600"
                          fontFamily="DM Sans"
                        >
                          {h}
                        </text>
                      ))}
                      {/* Rows */}
                      {b.rows.map((row, ri) => {
                        const ry = b.y + 14 + ri * 18;
                        return (
                          <g key={ri}>
                            {ri % 2 === 0 && (
                              <rect x={PAD} y={ry - 10} width={PAGE_W - PAD * 2} height="16" fill="#F8FAFC" />
                            )}
                            {row.map((cell, ci) => (
                              <text
                                key={ci}
                                x={PAD + ci * colWidth + 6}
                                y={ry + 2}
                                fontSize="9"
                                fill={cell.startsWith('  ') ? '#475569' : '#0F172A'}
                                fontFamily={ci === 0 ? 'IBM Plex Sans' : 'IBM Plex Mono'}
                              >
                                {truncate(cell, Math.floor(colWidth / 5))}
                              </text>
                            ))}
                          </g>
                        );
                      })}
                    </g>
                  );
                }
                return null;
              })}

              {/* Footer */}
              <line x1={PAD} y1={PAGE_H - 40} x2={PAGE_W - PAD} y2={PAGE_H - 40} stroke="#CBD5E1" />
              <text x={PAD} y={PAGE_H - 18} fontSize="9" fill="#94A3B8" fontFamily="IBM Plex Sans">
                {doc.pageLabel}
              </text>
              <text x={PAGE_W - PAD} y={PAGE_H - 18} fontSize="9" fill="#94A3B8" fontFamily="IBM Plex Sans" textAnchor="end">
                Mock-Dokument · Demo-Daten
              </text>
            </svg>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-surface/50">
          <p className="text-[11px] text-text-muted">
            Dies ist eine Mock-Darstellung zu Demo-Zwecken. Reale Dokumente werden aus dem
            Dokumenten-Management-System geladen.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body text-text-secondary border border-border rounded-lg hover:bg-surface transition-colors"
              onClick={() => window.print()}
            >
              <Printer size={14} strokeWidth={1.5} />
              Drucken
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-body text-text-secondary border border-border rounded-lg hover:bg-surface transition-colors cursor-not-allowed opacity-60"
              title="In Demo deaktiviert"
            >
              <Download size={14} strokeWidth={1.5} />
              PDF herunterladen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Map KYC checklist IDs and doc types to mock document keys
export const CHECKLIST_ID_TO_DOC = {
  hrAuszug: 'handelsregister',
  gesellschaftsvertrag: 'gesellschaftsvertrag',
  gesellschafterliste: 'gesellschafterliste',
  transparenzregister: 'transparenzregister',
  legGF1: 'ausweis',
  legGF2: 'ausweis',
  gewerbe: 'gewerbe',
};

export const ANALYSIS_NAME_TO_DOC = {
  'Jahresabschluss 2023': 'jahresabschluss',
  'Jahresabschluss 2022': 'jahresabschluss',
  'Jahresabschluss 2021': 'jahresabschluss',
  'BWA aktuell': 'bwa',
};

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function wrap(s, width) {
  if (!s) return [];
  const out = [];
  for (const para of s.split('\n')) {
    const words = para.split(/\s+/);
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length > width) {
        out.push(line.trim());
        line = w;
      } else {
        line = line ? line + ' ' + w : w;
      }
    }
    if (line) out.push(line.trim());
  }
  return out;
}

export default MockPdfPreviewModal;
