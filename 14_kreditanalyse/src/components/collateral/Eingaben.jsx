/**
 * Eingaben -- Formularbausteine der Sicherheitenerfassung.
 *
 * Zahlen erscheinen im deutschen Format (Tausenderpunkt, Dezimalkomma) und
 * werden beim Tippen roh gezeigt. Datumsfelder zeigen unter dem Picker das
 * Datum als TT.MM.JJJJ, weil der Browser-Picker sonst in der Systemsprache
 * rendert. Von der KI befüllte Felder tragen das Abzeichen "KI-Quelle".
 */

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

const feldCls =
  'w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';

/** Rahmen und Grund: von der KI vorbefüllt = zarter violetter Rand */
const zustandCls = (ki) => (ki ? 'border-violet-200 bg-violet-50/40' : 'border-border bg-surface-card');

export function KiQuelleBadge({ onClick, titel = 'KI-Quelle anzeigen: aus welchem Dokument stammt dieser Wert?' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={titel}
      className="inline-flex items-center gap-1 shrink-0 rounded-md border border-violet-200 bg-violet-50 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 hover:bg-violet-100 hover:border-violet-300 transition-colors"
    >
      <Sparkles size={10} strokeWidth={2} />
      KI-Quelle
    </button>
  );
}

export function Feld({ label, htmlFor, quelle, onQuelle, children, className = '' }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex items-center gap-2 mb-1 min-h-[20px]">
        <label htmlFor={htmlFor} className="text-xs font-medium font-body text-text-secondary truncate">
          {label}
        </label>
        {quelle && <KiQuelleBadge onClick={onQuelle} />}
      </div>
      {children}
    </div>
  );
}

const fmtZahl = (wert, stellen, gruppieren = true) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen, useGrouping: gruppieren }).format(wert);

/** "1.234,5" -> 1234.5, leere Eingabe -> '' */
function parseEingabe(text) {
  const t = String(text).replace(/\s/g, '');
  if (t === '' || t === '-') return '';
  const normal = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/\.(?=\d{3}(\D|$))/g, '');
  const n = Number(normal);
  return Number.isFinite(n) ? n : '';
}

/**
 * Zahlenfeld im deutschen Format. `value` ist eine Zahl oder ''.
 * einheit: Anzeige rechts im Feld (€, m², %, Jahre …)
 * ohneTausender: für Jahreszahlen (2009 statt 2.009)
 */
export function ZahlFeld({ id, value, onChange, stellen = 0, einheit, placeholder = '', ki = false, ohneTausender = false }) {
  const [text, setText] = useState(null);
  const leer = value === '' || value == null || Number.isNaN(Number(value));
  const anzeige = text ?? (leer ? '' : fmtZahl(Number(value), stellen, !ohneTausender));
  const rechts = einheit ? (einheit.length > 6 ? 'pr-24' : einheit.length > 2 ? 'pr-14' : 'pr-9') : '';
  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={anzeige}
        placeholder={placeholder}
        onFocus={() => setText(leer ? '' : String(value).replace('.', ','))}
        onBlur={() => setText(null)}
        onChange={(e) => {
          const t = e.target.value.replace(/[^\d,.-]/g, '');
          setText(t);
          onChange(parseEingabe(t));
        }}
        className={`${feldCls} ${zustandCls(ki)} font-mono ${rechts}`}
      />
      {einheit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted pointer-events-none">
          {einheit}
        </span>
      )}
    </div>
  );
}

export function EuroFeld(props) {
  return <ZahlFeld einheit="€" placeholder="0" {...props} />;
}

export function TextFeld({ id, value, onChange, placeholder, ki = false }) {
  return (
    <input
      id={id}
      type="text"
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${feldCls} ${zustandCls(ki)} font-body`}
    />
  );
}

const datumDe = (iso) => {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** Datumsfeld mit deutscher Anzeige darunter (Picker rendert in der Browsersprache). */
export function DatumFeld({ id, value, onChange, ki = false, hinweis, hinweisTon = 'text-text-muted' }) {
  return (
    <div>
      <input
        id={id}
        type="date"
        lang="de-DE"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${feldCls} ${zustandCls(ki)} font-body`}
      />
      <p className="mt-1 text-[11px] font-mono text-text-muted min-h-[16px]">
        {datumDe(value)}
        {hinweis && <span className={`font-body font-medium ${hinweisTon}`}>{value ? ' · ' : ''}{hinweis}</span>}
      </p>
    </div>
  );
}

/**
 * Auswahlfeld. Ein Wert, der nicht in den Optionen steht (z. B. aus
 * Altdaten), wird als eigene Option angezeigt, statt still verloren zu gehen.
 * optionen: [{ value, label }] oder Strings; gruppen: [{ label, optionen }]
 */
export function AuswahlFeld({ id, value, onChange, optionen = [], gruppen, leerText, ki = false }) {
  const norm = (o) => (typeof o === 'object' ? o : { value: o, label: o });
  const alle = gruppen ? gruppen.flatMap((g) => g.optionen.map(norm)) : optionen.map(norm);
  const fehlt = value !== '' && value != null && !alle.some((o) => String(o.value) === String(value));
  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={`${feldCls} ${zustandCls(ki)} font-body`}
    >
      {leerText != null && <option value="">{leerText}</option>}
      {fehlt && <option value={value}>{value}</option>}
      {gruppen
        ? gruppen.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.optionen.map(norm).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          ))
        : alle.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
    </select>
  );
}
