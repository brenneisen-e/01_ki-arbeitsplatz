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
import { useApp } from '../../context/AppContext';
import { Sparkles, X, FileText, MapPin } from 'lucide-react';

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function fmtDateDE(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return String(iso);
  }
}

function fmtEUR(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('de-DE') + ',00 EUR';
}

function rechtsformLang(kurz) {
  const map = {
    'GmbH': 'Gesellschaft mit beschränkter Haftung',
    'AG': 'Aktiengesellschaft',
    'UG': 'Unternehmergesellschaft (haftungsbeschränkt)',
    'OHG': 'Offene Handelsgesellschaft',
    'KG': 'Kommanditgesellschaft',
    'GmbH & Co. KG': 'GmbH & Co. Kommanditgesellschaft',
    'eG': 'eingetragene Genossenschaft',
    'e.K.': 'eingetragener Kaufmann',
  };
  return map[kurz] || kurz || 'Gesellschaft';
}

// ---------------------------------------------------------------------------
// Dynamische Dokumente aus dem aktuell gewählten Vorgang
// ---------------------------------------------------------------------------

function buildDocuments(company) {
  if (!company) return {};

  const firma = company.firma || 'Muster GmbH';
  const rechtsform = company.rechtsform || 'GmbH';
  const hrb = company.hrb || 'HRB 00000';
  const amtsgericht = company.amtsgericht || 'Amtsgericht';
  const gruendung = company.gruendung || 2010;
  const adresse = company.adresse || {};
  const strasse = adresse.strasse || '';
  const plz = adresse.plz || '';
  const ort = adresse.ort || '';
  const fullAdresse = [strasse, `${plz} ${ort}`.trim()].filter(Boolean).join(', ') || '—';
  const branche = company.branche || '—';
  const stammkapital = company.stammkapital || 25000;
  const gf = company.gf?.[0];
  const gfName = gf?.name || 'Geschäftsführer';
  const gfGeb = gf?.geb ? fmtDateDE(gf.geb) : '';

  const today = new Date();
  const abruf = fmtDateDE(today.toISOString());

  const bil23 = company.bilanz?.[2023] || {};
  const umsatz = bil23.umsatz ?? company.umsatz ?? 0;
  const ebitda = bil23.ebitda ?? 0;
  const jahresueberschuss = bil23.jahresueberschuss ?? 0;
  const bilanzsumme = bil23.bilanzsumme ?? 0;
  const eigenkapital = bil23.eigenkapital ?? 0;
  const ekquote = bilanzsumme ? (eigenkapital / bilanzsumme * 100).toFixed(1).replace('.', ',') + ' %' : '—';
  const fremdkapital = bilanzsumme && eigenkapital ? bilanzsumme - eigenkapital : 0;

  return {
    handelsregister: {
      title: 'Handelsregisterauszug',
      subtitle: `${amtsgericht ? 'Amtsgericht ' + amtsgericht : 'Amtsgericht'} · ${hrb} · Abruf vom ${abruf}`,
      seiten: 3,
      pageLabel: 'Seite 1 von 3',
      rows: [
        { label: 'Nummer der Firma', value: hrb, field: 'hrb' },
        { label: 'Firma', value: firma, field: 'firma' },
        { label: 'Sitz', value: ort || '—', field: 'ort' },
        { label: 'Geschäftsanschrift', value: fullAdresse, field: 'adresse' },
        { label: 'Gegenstand des Unternehmens', value: branche, field: 'branche' },
        { label: 'Stammkapital', value: fmtEUR(stammkapital), field: 'stammkapital' },
        { label: 'Rechtsform', value: rechtsformLang(rechtsform), field: 'rechtsform' },
        { label: 'Tag der Eintragung', value: `${gruendung}`, field: 'gruendung' },
        { label: 'Geschäftsführer', value: gfName + (gfGeb ? `, geb. ${gfGeb}` : ''), field: 'gf' },
        { label: 'Vertretungsregelung', value: 'Die Gesellschaft wird durch einen Geschäftsführer vertreten.', field: 'vertretung' },
      ],
    },
    gesellschaftsvertrag: {
      title: 'Gesellschaftsvertrag',
      subtitle: `${firma} · Notariell beurkundet · §§ Auszug`,
      seiten: 12,
      pageLabel: 'Seite 2 von 12',
      rows: [
        { label: '§ 1 Firma und Sitz', value: `Die Firma der Gesellschaft lautet ${firma}. Sitz ist ${ort || '—'}.`, field: 'firma' },
        { label: '§ 2 Gegenstand', value: branche, field: 'branche' },
        { label: '§ 3 Stammkapital', value: `Das Stammkapital der Gesellschaft beträgt ${fmtEUR(stammkapital)}.`, field: 'stammkapital' },
        { label: '§ 4 Gesellschafter', value: `${gfName} hält einen Anteil laut Gesellschafterliste.`, field: 'gesellschafter' },
        { label: '§ 5 Geschäftsjahr', value: 'Das Geschäftsjahr ist das Kalenderjahr.', field: 'geschaeftsjahr' },
      ],
    },
    jahresabschluss: {
      title: 'Jahresabschluss 2023',
      subtitle: `${firma} · Testiert 28.03.2024`,
      seiten: 18,
      pageLabel: 'Seite 4 von 18 – Bilanz',
      rows: [
        { label: 'Umsatzerlöse', value: fmtEUR(umsatz), field: 'umsatz' },
        { label: 'EBITDA', value: fmtEUR(ebitda), field: 'ebitda' },
        { label: 'Jahresüberschuss', value: fmtEUR(jahresueberschuss), field: 'jahresuberschuss' },
        { label: 'Bilanzsumme', value: fmtEUR(bilanzsumme), field: 'bilanzsumme' },
        { label: 'Eigenkapital', value: fmtEUR(eigenkapital), field: 'eigenkapital' },
        { label: 'Eigenkapitalquote', value: ekquote, field: 'ekquote' },
        { label: 'Verbindlichkeiten', value: fmtEUR(fremdkapital), field: 'fremdkapital' },
      ],
    },
    bwa: {
      title: 'BWA aktuell',
      subtitle: `${firma} · Betriebswirtschaftliche Auswertung · Stand ${abruf}`,
      seiten: 4,
      pageLabel: 'Seite 1 von 4',
      rows: [
        { label: 'Gesamtleistung YTD', value: fmtEUR(umsatz * 0.25), field: 'umsatz' },
        { label: 'Materialaufwand', value: fmtEUR(-(umsatz * 0.08)), field: 'materialaufwand' },
        { label: 'Personalaufwand', value: fmtEUR(-(umsatz * 0.07)), field: 'personalaufwand' },
        { label: 'Vorläufiges Ergebnis', value: fmtEUR(umsatz * 0.05), field: 'ergebnis' },
      ],
    },
    transparenzregister: {
      title: 'Transparenzregisterauszug',
      subtitle: `Bundesanzeiger-Verlag · Abruf vom ${abruf}`,
      seiten: 2,
      pageLabel: 'Seite 1 von 2',
      rows: [
        { label: 'Rechtseinheit', value: `${firma} (${hrb})`, field: 'firma' },
        { label: 'Wirtschaftlich Berechtigter', value: gfName + (gfGeb ? `, geb. ${gfGeb}, ${ort || ''}` : ''), field: 'ubo' },
        { label: 'Art der Berechtigung', value: 'Kapitalanteile > 25 %', field: 'berechtigung' },
        { label: 'Umfang der Berechtigung', value: gf?.anteil ? `${gf.anteil} %` : '100 %', field: 'anteil' },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Render-Komponente
// ---------------------------------------------------------------------------

export default function KiSourceHint({ document = 'handelsregister', field, value, extractedAt, company: companyProp }) {
  const [open, setOpen] = useState(false);

  // Wenn kein Vorgang explizit übergeben wurde, den aktuell ausgewählten
  // Vorgang aus dem App-Context verwenden. Dadurch zeigt die KI-Quelle
  // immer die Daten des aktuell bearbeiteten Kunden — nicht mehr hardcodiert.
  const { getSelectedCompany } = useApp();
  const contextCompany = getSelectedCompany();
  const company = companyProp || contextCompany;

  // Fallback-Kompanie, damit die Komponente auch dann noch sinnvoll aussieht,
  // wenn noch kein Kunde ausgewählt wurde (z. B. bei leerem Formular)
  const fallback = { firma: value || 'Muster GmbH', rechtsform: 'GmbH', hrb: 'HRB 00000', amtsgericht: 'Musterstadt', gruendung: 2010, adresse: {}, branche: '—' };
  const docs = buildDocuments(company || fallback);
  const doc = docs[document] || docs.handelsregister;

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,26,23,0.45)] backdrop-blur-sm p-4"
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
                style={{ border: '1px solid var(--border-light)' }}
              >
                {/* Page background */}
                <rect x="0" y="0" width={PAGE_W} height={PAGE_H} fill="white" />

                {/* Header */}
                <text x={PADDING} y="50" fontSize="18" fontWeight="500" fill="var(--text-primary)" fontFamily="var(--font-sans)">
                  {doc.title}
                </text>
                <text x={PADDING} y="70" fontSize="10" fill="var(--text-secondary)" fontFamily="var(--font-sans)">
                  {doc.subtitle}
                </text>
                <line x1={PADDING} y1="85" x2={PAGE_W - PADDING} y2="85" stroke="var(--border-medium)" />

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
                            fill="var(--color-yellow-200)"
                            fillOpacity="0.65"
                            stroke="var(--color-yellow-500)"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                          />
                          <rect
                            x={PAGE_W - PADDING - 2}
                            y={y - 14}
                            width="4"
                            height="20"
                            fill="var(--color-yellow-500)"
                          />
                        </>
                      )}
                      <text x={PADDING} y={y} fontSize="10" fontWeight="500" fill="var(--text-secondary)" fontFamily="var(--font-sans)">
                        {row.label}
                      </text>
                      <text x={PADDING + LABEL_W} y={y} fontSize="11" fill={isMatch ? 'var(--color-yellow-900)' : 'var(--text-primary)'} fontFamily="var(--font-mono)" fontWeight={isMatch ? 500 : 400}>
                        {truncate(row.value, 56)}
                      </text>
                    </g>
                  );
                })}

                {/* Footer */}
                <line x1={PADDING} y1={PAGE_H - 40} x2={PAGE_W - PADDING} y2={PAGE_H - 40} stroke="var(--border-medium)" />
                <text x={PADDING} y={PAGE_H - 18} fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-sans)">
                  {doc.pageLabel}
                </text>
                <text x={PAGE_W - PADDING} y={PAGE_H - 18} fontSize="9" fill="var(--text-tertiary)" fontFamily="var(--font-sans)" textAnchor="end">
                  Digital signiert · Amtsgericht
                </text>
              </svg>
            </div>
          </div>

          {/* Sidebar: Extraktion-Details */}
          <div className="border-l border-border bg-surface px-5 py-6 overflow-y-auto scrollbar-thin">
            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                Extrahiertes Feld
              </p>
              <p className="text-sm font-semibold text-text-primary">
                {matchRow?.label || field || '—'}
              </p>
            </div>

            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-1">
                Wert laut Dokument
              </p>
              <p className="font-mono text-sm text-text-primary bg-white border border-border rounded-lg p-3 whitespace-pre-wrap break-words">
                {matchRow?.value || value || '—'}
              </p>
            </div>

            <div className="mb-5">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-text-muted mb-1">
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
