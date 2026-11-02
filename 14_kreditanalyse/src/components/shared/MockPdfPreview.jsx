/**
 * MockPdfPreview — zeigt ein Mock-PDF eines Dokuments (Handelsregisterauszug,
 * Ausweiskopie, Gesellschaftsvertrag, …) in einem Modal an.
 *
 * Nutzung:
 *   <MockPdfPreviewButton documentId="handelsregister" label="Ansehen" />
 *   <MockPdfPreviewModal documentId="handelsregister" onClose={...} />
 */

import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FileText, Download, Printer, Eye } from 'lucide-react';
import { getBilanzsumme } from '../../utils/financialCalculations';

// ---------------------------------------------------------------------------
// Hilfsfunktionen, um die Dokumente je nach aktuellem Vorgang dynamisch
// zu füllen. Sonst würde bei jedem Vorgang die gleiche Rhein-Immobilien-Seite
// gezeigt werden.
// ---------------------------------------------------------------------------

function fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return String(iso); }
}
function fmtEUR(n) {
  if (n == null) return '—';
  return Math.round(Number(n)).toLocaleString('de-DE') + ',00 EUR';
}
function rechtsformLang(k) {
  const m = { 'GmbH': 'Gesellschaft mit beschränkter Haftung', 'AG': 'Aktiengesellschaft', 'UG': 'Unternehmergesellschaft (haftungsbeschränkt)', 'KG': 'Kommanditgesellschaft', 'OHG': 'Offene Handelsgesellschaft', 'GmbH & Co. KG': 'GmbH & Co. KG', 'eG': 'eingetragene Genossenschaft', 'e.K.': 'eingetragener Kaufmann' };
  return m[k] || k || 'Gesellschaft';
}

function buildCompanyDocs(company) {
  const c = company || {};
  const firma = c.firma || 'Muster GmbH';
  const rechtsform = c.rechtsform || 'GmbH';
  const hrb = c.hrb || 'HRB 00000';
  const amtsgericht = c.amtsgericht || 'Musterstadt';
  const gruendung = c.gruendung || 2010;
  const adresse = c.adresse || {};
  const ort = adresse.ort || '—';
  const fullAdresse = [adresse.strasse, `${adresse.plz || ''} ${ort}`.trim()].filter(Boolean).join(', ');
  const branche = c.branche || '—';
  const stammkapital = c.stammkapital || 25000;
  const gf = c.gf?.[0] || {};
  const gfName = gf.name || 'Geschäftsführer';
  const gfGeb = gf.geb ? fmtDate(gf.geb) : '';
  const mitarbeiter = c.mitarbeiter || '—';
  const ustId = c.ust_id || c.ustid || '—';

  const today = new Date();
  const abruf = fmtDate(today.toISOString());

  const bil23 = c.bilanz?.[2023] || {};
  const umsatz = bil23.umsatz ?? c.umsatz ?? 0;
  const bilanzsumme = bil23.bilanzsumme ?? (bil23.eigenkapital != null ? getBilanzsumme(bil23) : 0);
  const bil22 = c.bilanz?.[2022] || {};
  const guvZeilen = (b) => [
    ['Umsatzerlöse', b.umsatz],
    ['Sonstige betriebliche Erträge', b.sonstige_ertraege],
    ['Materialaufwand', b.materialaufwand != null ? -b.materialaufwand : null],
    ['Personalaufwand', b.personalaufwand != null ? -b.personalaufwand : null],
    ['Abschreibungen', b.abschreibungen != null ? -b.abschreibungen : null],
    ['Sonstige betriebliche Aufwendungen', b.sonstige_aufwendungen != null ? -b.sonstige_aufwendungen : null],
    ['Zinsen und ähnliche Aufwendungen', b.zinsaufwand != null ? -b.zinsaufwand : null],
    ['Steuern vom Einkommen und Ertrag', b.steuern != null ? -b.steuern : null],
    ['Jahresüberschuss', b.jahresueberschuss],
  ];
  const eigenkapital = bil23.eigenkapital ?? 0;
  const ekquote = bilanzsumme ? (eigenkapital / bilanzsumme * 100).toFixed(1).replace('.', ',') + ' %' : '—';
  const fremdkapital = bilanzsumme && eigenkapital ? bilanzsumme - eigenkapital : 0;

  return {

// ---------------------------------------------------------------------------
// Mock-Dokumente: Jede Definition beschreibt einen Seiteninhalt als
// strukturierte Liste von Blöcken. Wird als SVG-Seite gerendert.
// ---------------------------------------------------------------------------

    handelsregister: {
      title: 'Handelsregisterauszug',
      subtitle: `${amtsgericht ? 'Amtsgericht ' + amtsgericht : 'Amtsgericht'} · ${hrb}`,
      meta: `Abruf: ${abruf} · Digital signiert`,
      pageLabel: 'Seite 1 von 3',
      blocks: [
        { type: 'heading', text: 'A Aktuelle Eintragungen' },
        { type: 'field', label: 'Nummer der Firma', value: hrb },
        { type: 'field', label: 'Firma', value: firma },
        { type: 'field', label: 'Sitz', value: ort },
        { type: 'field', label: 'Geschäftsanschrift', value: fullAdresse || '—' },
        { type: 'field', label: 'Gegenstand des Unternehmens', value: branche },
        { type: 'field', label: 'Stammkapital', value: fmtEUR(stammkapital) },
        { type: 'field', label: 'Rechtsform', value: rechtsformLang(rechtsform) },
        { type: 'field', label: 'Tag der Eintragung', value: `${gruendung}` },
        { type: 'heading', text: 'B Geschäftsführer / Vertretungsbefugnis' },
        { type: 'field', label: 'Geschäftsführer', value: gfName + (gfGeb ? `, geb. ${gfGeb}` : '') + (ort ? `, wohnhaft ${ort}` : '') },
        { type: 'field', label: 'Vertretungsregelung', value: 'Die Gesellschaft wird durch einen Geschäftsführer vertreten.' },
      ],
    },

    gesellschaftsvertrag: {
      title: 'Gesellschaftsvertrag',
      subtitle: `${firma} · Notariell beurkundet`,
      meta: `Notar Dr. Schmitt, ${ort || 'Musterstadt'}`,
      pageLabel: 'Seite 2 von 12',
      blocks: [
        { type: 'paragraph', label: '§ 1 Firma und Sitz', value: `(1) Die Firma der Gesellschaft lautet: ${firma}.\n(2) Sitz der Gesellschaft ist ${ort || '—'}.` },
        { type: 'paragraph', label: '§ 2 Gegenstand des Unternehmens', value: `Gegenstand des Unternehmens ist ${branche.toLowerCase()} sowie alle damit in Zusammenhang stehenden Geschäfte.` },
        { type: 'paragraph', label: '§ 3 Stammkapital', value: `(1) Das Stammkapital der Gesellschaft beträgt ${fmtEUR(stammkapital)}.\n(2) Hiervon übernimmt Herr/Frau ${gfName} einen Anteil laut Gesellschafterliste.` },
        { type: 'paragraph', label: '§ 4 Geschäftsführung', value: 'Die Gesellschaft hat einen oder mehrere Geschäftsführer. Ist nur ein Geschäftsführer bestellt, vertritt er die Gesellschaft allein.' },
        { type: 'paragraph', label: '§ 5 Geschäftsjahr', value: 'Das Geschäftsjahr ist das Kalenderjahr.' },
      ],
    },

    gesellschafterliste: {
      title: 'Gesellschafterliste gem. § 40 GmbHG',
      subtitle: `${firma} · ${hrb}`,
      meta: `Stand: ${abruf} · unterschrieben durch Geschäftsführer`,
      pageLabel: 'Seite 1 von 1',
      blocks: [
        { type: 'heading', text: 'Gesellschafter' },
        { type: 'table', headers: ['Nr.', 'Name', 'Geburtsdatum', 'Nennbetrag', 'Anteil'], rows: [
          ['1', gfName, gfGeb || '—', fmtEUR(stammkapital), (gf.anteil || 100) + ',00 %'],
        ]},
        { type: 'paragraph', label: 'Anmerkung', value: `Die Summe aller Nennbeträge entspricht dem im Handelsregister eingetragenen Stammkapital von ${fmtEUR(stammkapital)}.` },
        { type: 'field', label: 'Datum / Unterschrift GF', value: `${abruf} / ${gfName}` },
      ],
    },

    transparenzregister: {
      title: 'Transparenzregisterauszug',
      subtitle: `Bundesanzeiger-Verlag · Abruf ${abruf}`,
      meta: 'Auszug gem. § 23 GwG',
      pageLabel: 'Seite 1 von 2',
      blocks: [
        { type: 'heading', text: 'Rechtseinheit' },
        { type: 'field', label: 'Firma', value: firma },
        { type: 'field', label: 'Registernummer', value: `${hrb}, Amtsgericht ${amtsgericht}` },
        { type: 'heading', text: 'Wirtschaftlich Berechtigter' },
        { type: 'field', label: 'Name', value: gfName },
        { type: 'field', label: 'Geburtsdatum', value: gfGeb || '—' },
        { type: 'field', label: 'Wohnort', value: `${ort || '—'}, Deutschland` },
        { type: 'field', label: 'Staatsangehörigkeit', value: 'deutsch' },
        { type: 'field', label: 'Art der Berechtigung', value: 'Kapitalanteile > 25 %' },
        { type: 'field', label: 'Umfang der Berechtigung', value: (gf.anteil || 100) + ',00 %' },
      ],
    },

    ausweis: {
      title: 'Personalausweis – Bundesrepublik Deutschland',
      subtitle: `Legitimationsprüfung · ${firma}`,
      meta: `Eingereicht · KI-OCR verifiziert`,
      pageLabel: 'Seite 1 von 1',
      blocks: [
        { type: 'heading', text: 'Ausweisdaten' },
        { type: 'field', label: 'Name', value: (gfName.split(' ').pop() || gfName) },
        { type: 'field', label: 'Vornamen', value: gfName.split(' ').slice(0, -1).join(' ') || gfName },
        { type: 'field', label: 'Geburtsdatum', value: gfGeb || '—' },
        { type: 'field', label: 'Geburtsort', value: ort || '—' },
        { type: 'field', label: 'Staatsangehörigkeit', value: 'DEUTSCH' },
        { type: 'field', label: 'Ausweisnummer', value: 'T22000129' },
        { type: 'field', label: 'Ausstellende Behörde', value: `Stadt ${ort || 'Musterstadt'}` },
        { type: 'field', label: 'Gültig bis', value: '14.08.2030' },
        { type: 'paragraph', label: 'Hinweis', value: 'Ausweiskopie eingescannt und mit Handelsregister / Transparenzregister automatisch abgeglichen. Legitimation bestätigt (Human-in-the-Loop).' },
      ],
    },

    gewerbe: {
      title: 'Gewerbeanmeldung',
      subtitle: `Stadt ${ort || 'Musterstadt'} · Ordnungsamt`,
      meta: `Aktenzeichen ${gruendung}/${String(hrb).replace(/[^0-9]/g, '').slice(-6) || '004521'} · Vorgang`,
      pageLabel: 'Seite 1 von 1',
      blocks: [
        { type: 'heading', text: 'Angaben zum Gewerbetreibenden' },
        { type: 'field', label: 'Firma', value: firma },
        { type: 'field', label: 'Rechtsform', value: `${rechtsform}, ${hrb} ${amtsgericht}` },
        { type: 'field', label: 'Geschäftsanschrift', value: fullAdresse || '—' },
        { type: 'heading', text: 'Angaben zum Gewerbe' },
        { type: 'field', label: 'Tätigkeit', value: branche },
        { type: 'field', label: 'Beginn der Tätigkeit', value: `${gruendung}` },
        { type: 'field', label: 'Anzahl Beschäftigte', value: `ca. ${mitarbeiter}` },
        { type: 'field', label: 'Umsatzsteuer-ID', value: ustId },
        { type: 'paragraph', label: 'Bescheid', value: `Die Anmeldung des oben genannten Gewerbes ist beim Ordnungsamt der Stadt ${ort || 'Musterstadt'} ordnungsgemäß eingegangen und bestätigt.` },
      ],
    },

    jahresabschluss: {
      title: 'Bilanz 2023',
      subtitle: `${firma} · testiert 28.03.2024`,
      meta: 'Uneingeschränkter Bestätigungsvermerk',
      pageLabel: 'Seite 4 von 18 – Bilanz',
      blocks: [
        { type: 'heading', text: 'Bilanz zum 31.12.2023 (Auszug)' },
        { type: 'table', headers: ['Position', '31.12.2023', '31.12.2022'], rows: [
          ['AKTIVA', '', ''],
          ['  Anlagevermögen', fmtEUR((bilanzsumme * 0.7) || 0), fmtEUR((bilanzsumme * 0.7 * 0.94) || 0)],
          ['  Umlaufvermögen', fmtEUR((bilanzsumme * 0.28) || 0), fmtEUR((bilanzsumme * 0.28 * 0.94) || 0)],
          ['  Rechnungsabgrenzung', fmtEUR((bilanzsumme * 0.02) || 0), fmtEUR((bilanzsumme * 0.02 * 0.94) || 0)],
          ['Bilanzsumme', fmtEUR(bilanzsumme || 0), fmtEUR((bilanzsumme * 0.94) || 0)],
          ['PASSIVA', '', ''],
          ['  Eigenkapital', fmtEUR(eigenkapital || 0), fmtEUR((eigenkapital * 0.92) || 0)],
          ['  Rückstellungen', fmtEUR((bilanzsumme * 0.015) || 0), fmtEUR((bilanzsumme * 0.014) || 0)],
          ['  Verbindlichkeiten', fmtEUR(fremdkapital || 0), fmtEUR((fremdkapital * 0.95) || 0)],
          ['Bilanzsumme', fmtEUR(bilanzsumme || 0), fmtEUR((bilanzsumme * 0.94) || 0)],
        ]},
        { type: 'field', label: 'Eigenkapitalquote', value: ekquote },
        { type: 'field', label: 'Umsatzerlöse', value: fmtEUR(umsatz) },
      ],
    },

    guv: {
      title: 'Gewinn- und Verlustrechnung 2023',
      subtitle: `${firma} · Teil des Jahresabschlusses`,
      meta: 'Gesamtkostenverfahren nach § 275 Abs. 2 HGB',
      pageLabel: 'Seite 6 von 18 – GuV',
      blocks: [
        { type: 'heading', text: 'GuV 01.01. bis 31.12.2023' },
        { type: 'table', headers: ['Position', '2023', '2022'], rows: guvZeilen(bil23).map(([label, wert], i) => [
          label,
          wert != null ? fmtEUR(wert) : '—',
          guvZeilen(bil22)[i][1] != null ? fmtEUR(guvZeilen(bil22)[i][1]) : '—',
        ]) },
        { type: 'field', label: 'Umsatzrendite', value: bil23.umsatz ? `${((bil23.jahresueberschuss || 0) / bil23.umsatz * 100).toFixed(1).replace('.', ',')} %` : '—' },
      ],
    },

    bwa: {
      title: 'Betriebswirtschaftliche Auswertung (BWA)',
      subtitle: `${firma} · Stand ${abruf}`,
      meta: 'Datev-Auswertung · Kurzauswertung',
      pageLabel: 'Seite 1 von 4',
      blocks: [
        { type: 'heading', text: 'Gewinn- und Verlustrechnung YTD' },
        { type: 'table', headers: ['Position', 'YTD', 'Vorjahr YTD', 'Abw. %'], rows: [
          ['Gesamtleistung', fmtEUR(umsatz * 0.25), fmtEUR(umsatz * 0.235), '+6,4 %'],
          ['Materialaufwand', fmtEUR(-(umsatz * 0.083)), fmtEUR(-(umsatz * 0.077)), '+7,0 %'],
          ['Personalaufwand', fmtEUR(-(umsatz * 0.077)), fmtEUR(-(umsatz * 0.072)), '+6,9 %'],
          ['Sonstige Aufwendungen', fmtEUR(-(umsatz * 0.036)), fmtEUR(-(umsatz * 0.033)), '+7,9 %'],
          ['Vorläufiges Ergebnis', fmtEUR(umsatz * 0.054), fmtEUR(umsatz * 0.052), '+3,8 %'],
        ]},
        { type: 'paragraph', label: 'Kommentar', value: 'Die Ertragslage ist stabil. Steigende Material- und Personalkosten werden durch Preisanpassungen ausgeglichen.' },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Public: Button, der das Modal öffnet
// ---------------------------------------------------------------------------

export function MockPdfPreviewButton({ documentId, label = 'Dokument ansehen', className = '', company: companyProp }) {
  const [open, setOpen] = useState(false);
  const { getSelectedCompany } = useApp();
  const company = companyProp || getSelectedCompany();
  const docs = buildCompanyDocs(company);
  if (!docs[documentId]) return null;
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
      {open && <MockPdfPreviewModal documentId={documentId} company={company} onClose={() => setOpen(false)} />}
    </>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

export function MockPdfPreviewModal({ documentId, company: companyProp, onClose }) {
  const { getSelectedCompany } = useApp();
  const company = companyProp || getSelectedCompany();
  const docs = buildCompanyDocs(company);
  const doc = docs[documentId];
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(28,26,23,0.45)] backdrop-blur-sm p-4"
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
              style={{ border: '1px solid var(--border-light)' }}
            >
              <rect x="0" y="0" width={PAGE_W} height={PAGE_H} fill="white" />

              {/* Title block */}
              <text x={PAD} y="50" fontSize="18" fontWeight="500" fill="var(--text-primary)" fontFamily="var(--font-sans)">
                {doc.title}
              </text>
              <text x={PAD} y="70" fontSize="10" fill="var(--text-secondary)" fontFamily="var(--font-sans)">
                {doc.subtitle}
              </text>
              <text x={PAD} y="84" fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-sans)">
                {doc.meta}
              </text>
              <line x1={PAD} y1="95" x2={PAGE_W - PAD} y2="95" stroke="var(--border-medium)" />

              {/* Blocks */}
              {rendered.map((b, i) => {
                if (b.type === 'heading') {
                  return (
                    <g key={i}>
                      <text x={PAD} y={b.y} fontSize="12" fontWeight="500" fill="var(--mode-primary)" fontFamily="var(--font-sans)">
                        {b.text}
                      </text>
                      <line x1={PAD} y1={b.y + 6} x2={PAD + 40} y2={b.y + 6} stroke="var(--mode-primary)" strokeWidth="2" />
                    </g>
                  );
                }
                if (b.type === 'field') {
                  return (
                    <g key={i}>
                      <text x={PAD} y={b.y} fontSize="10" fontWeight="500" fill="var(--text-secondary)" fontFamily="var(--font-sans)">
                        {b.label}
                      </text>
                      <text x={PAD} y={b.y + 16} fontSize="11" fill="var(--text-primary)" fontFamily="var(--font-mono)">
                        {truncate(b.value, 68)}
                      </text>
                    </g>
                  );
                }
                if (b.type === 'paragraph') {
                  const wrapped = wrap(b.value, 75);
                  return (
                    <g key={i}>
                      <text x={PAD} y={b.y} fontSize="11" fontWeight="500" fill="var(--mode-primary)" fontFamily="var(--font-sans)">
                        {b.label}
                      </text>
                      {wrapped.map((line, li) => (
                        <text key={li} x={PAD} y={b.y + 18 + li * 14} fontSize="10" fill="var(--text-primary)" fontFamily="var(--font-sans)">
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
                      <rect x={PAD} y={b.y - 12} width={PAGE_W - PAD * 2} height="20" fill="var(--mode-primary)" rx="2" />
                      {b.headers.map((h, hi) => (
                        <text
                          key={hi}
                          x={PAD + hi * colWidth + 6}
                          y={b.y + 2}
                          fontSize="9"
                          fill="white"
                          fontWeight="500"
                          fontFamily="var(--font-sans)"
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
                              <rect x={PAD} y={ry - 10} width={PAGE_W - PAD * 2} height="16" fill="var(--bg-primary)" />
                            )}
                            {row.map((cell, ci) => (
                              <text
                                key={ci}
                                x={PAD + ci * colWidth + 6}
                                y={ry + 2}
                                fontSize="9"
                                fill={cell.startsWith('  ') ? 'var(--text-secondary)' : 'var(--text-primary)'}
                                fontFamily={ci === 0 ? 'var(--font-sans)' : 'var(--font-mono)'}
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
              <line x1={PAD} y1={PAGE_H - 40} x2={PAGE_W - PAD} y2={PAGE_H - 40} stroke="var(--border-medium)" />
              <text x={PAD} y={PAGE_H - 18} fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-sans)">
                {doc.pageLabel}
              </text>
              <text x={PAGE_W - PAD} y={PAGE_H - 18} fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-sans)" textAnchor="end">
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
