/**
 * CollateralView -- Sicherheitenbewertung (Collateral Valuation)
 *
 * Three tabs:
 *   1. Sicherheiten erfassen      -- Dynamic form list for collateral items
 *   2. Bewertung & Haircuts       -- Automatic calculation table + haircut reference
 *   3. Blankoanteil & LTV         -- Coverage analysis, bar chart, rating limits
 */

import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Shield,
  Plus,
  Trash2,
  ClipboardList,
  Calculator,
  PieChart,
  Info,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StepCompleteBar from '../shared/StepCompleteBar';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { haircutRates, sicherheitenArten } from '../../data/haircutRates';
import {
  calculateQuantitativeRating,
  calculateAccountRating,
  calculateOwnerRating,
  calculateOverallRating,
  scoreToRatingClass,
} from '../../utils/ratingEngine';
import { calculateAllRatios } from '../../utils/financialCalculations';

// =============================================================================
// Constants
// =============================================================================

const TABS = [
  { key: 'erfassen', label: 'Sicherheiten erfassen', icon: ClipboardList },
  { key: 'bewertung', label: 'Bewertung & Haircuts', icon: Calculator },
  { key: 'blanko', label: 'Blankoanteil & LTV', icon: PieChart },
];

const BEWERTUNGSVERFAHREN = ['Gutachten', 'Kaufvertrag', 'Buchwert', 'Versicherungswert'];

const RANG_OPTIONS = [
  { value: 1, label: '1.' },
  { value: 2, label: '2.' },
  { value: 3, label: '3.' },
];

/** Rating-dependent maximum Blankoanteil limits */
const RATING_LIMITS = [
  { range: '1-3', label: 'bis 100%', max: 1.0 },
  { range: '4-6', label: 'max. 30-50%', max: 0.5 },
  { range: '7-9', label: 'max. 10-20%', max: 0.2 },
  { range: '≥10', label: 'Vollbesicherung', max: 0.0 },
];

// =============================================================================
// Helpers
// =============================================================================

/**
 * Normalize umlauts for matching company data (UTF-8 umlauts) against
 * haircutRates keys (ASCII ae/oe/ue).
 * e.g. "Sicherungsuebereignung" <-> "Sicherungsuebereignung"
 */
const normalizeUmlauts = (str) =>
  str
    .replace(/ae/g, 'ä')
    .replace(/oe/g, 'ö')
    .replace(/ue/g, 'ü')
    .replace(/Ae/g, 'Ä')
    .replace(/Oe/g, 'Ö')
    .replace(/Ue/g, 'Ü');

/**
 * Look up haircut rate for a given collateral type.
 * Handles both umlaut and ASCII-encoded keys.
 */
const findHaircutRate = (art) => {
  if (!art) return null;
  // Direct match first
  if (haircutRates[art]) return haircutRates[art];
  // Try normalizing the key (convert ASCII ae/oe/ue to umlauts) and compare
  const normalizedArt = normalizeUmlauts(art);
  for (const [key, value] of Object.entries(haircutRates)) {
    const normalizedKey = normalizeUmlauts(key);
    if (normalizedKey === normalizedArt || normalizedKey === art || key === normalizedArt) {
      return value;
    }
  }
  return null;
};

/**
 * Build a display-friendly label for a haircutRates key.
 * Converts ASCII umlauts back to real umlauts for display.
 */
const displayArt = (art) => normalizeUmlauts(art);

/**
 * Create a blank collateral item for the form.
 */
const createBlankItem = () => ({
  id: Date.now() + Math.random(),
  art: sicherheitenArten[0],
  bezeichnung: '',
  wert: 0,
  datum: '',
  bewertung: 'Gutachten',
  vorlasten: 0,
  rang: 1,
});

/**
 * Map a company sicherheiten item into the form structure.
 */
const mapCompanyItem = (s, index) => ({
  id: `existing-${index}-${Date.now()}`,
  art: findHaircutRateKey(s.art) || sicherheitenArten[0],
  bezeichnung: s.bezeichnung || '',
  wert: s.wert || 0,
  datum: s.datum || '',
  bewertung: s.bewertung || 'Gutachten',
  vorlasten: s.vorlasten || 0,
  rang: s.rang || 1,
});

/**
 * Find the haircutRates key that best matches a company's art string.
 */
const findHaircutRateKey = (art) => {
  if (!art) return null;
  if (haircutRates[art]) return art;
  const normalizedArt = normalizeUmlauts(art);
  for (const key of sicherheitenArten) {
    const normalizedKey = normalizeUmlauts(key);
    if (normalizedKey === normalizedArt || normalizedKey === art || key === normalizedArt) {
      return key;
    }
  }
  // Partial matching fallback (e.g., "Buergschaft (privat)" for "Buergschaft (natuerliche Person)")
  const artLower = art.toLowerCase();
  for (const key of sicherheitenArten) {
    const keyLower = key.toLowerCase();
    const normalizedKeyLower = normalizeUmlauts(key).toLowerCase();
    const normalizedArtLower = normalizeUmlauts(art).toLowerCase();
    if (
      keyLower.includes(artLower.split('(')[0].trim()) ||
      normalizedKeyLower.includes(normalizedArtLower.split('(')[0].trim())
    ) {
      return key;
    }
  }
  return null;
};

/**
 * Derive estimated rating class number from company data for limit highlighting.
 */
const estimateRatingClass = (company) => {
  if (!company) return null;
  const bilanz = company.bilanz || {};
  const latest = bilanz[2023] || bilanz[2022] || {};
  if (!latest.umsatz) return null;
  try {
    const ratios = calculateAllRatios(latest);
    const branche = company.branche || 'Maschinenbau';
    const quantResult = calculateQuantitativeRating(ratios, branche);
    const accountScore = company.konto ? calculateAccountRating(company.konto) : 3;
    const schufaAvg =
      company.schufa
        ? Object.values(company.schufa).reduce((a, b) => a + b, 0) /
          Object.values(company.schufa).length
        : 95;
    const ownerScore = calculateOwnerRating(schufaAvg, company.creditreform_index || 300);
    const overall = calculateOverallRating({
      quantitativeScore: quantResult.score,
      qualitativeScore: 3,
      accountScore,
      ownerAdjustment: (ownerScore - 3) * 0.1,
    });
    const rc = scoreToRatingClass(overall);
    return parseInt(rc.klasse) || parseInt(rc.klasse.replace(/[a-c]/, ''));
  } catch {
    return null;
  }
};

// =============================================================================
// Sub-components
// =============================================================================

/** Section heading inside a tab */
function SectionHeading({ children }) {
  return (
    <h3 className="text-base font-semibold font-headline text-text-primary mt-8 mb-3 first:mt-0">
      {children}
    </h3>
  );
}

// =============================================================================
// Tab 1: Sicherheiten erfassen
// =============================================================================

function ErfassenTab({ items, setItems }) {
  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    setItems((prev) => [...prev, createBlankItem()]);
  };

  return (
    <div className="space-y-4">
      <SectionHeading>Sicherheiten erfassen</SectionHeading>
      <p className="text-sm text-text-secondary font-body -mt-1 mb-4">
        Erfasse alle relevanten Sicherheiten fuer den Kreditantrag. Die Bewertung erfolgt
        automatisch im naechsten Tab.
      </p>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-text-muted">
          <Shield size={40} strokeWidth={1.5} className="mb-3 opacity-50" />
          <p className="text-sm font-body">Noch keine Sicherheiten erfasst.</p>
        </div>
      )}

      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative bg-surface border border-border rounded-xl p-5 space-y-4"
        >
          {/* Card header with number and delete */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-text-muted uppercase tracking-wide">
              Sicherheit {idx + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
              title="Sicherheit entfernen"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Row 1: Art + Bezeichnung */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium font-body text-text-secondary mb-1">
                Sicherheitenart
              </label>
              <select
                value={item.art}
                onChange={(e) => updateItem(item.id, 'art', e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              >
                {sicherheitenArten.map((art) => (
                  <option key={art} value={art}>
                    {displayArt(art)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium font-body text-text-secondary mb-1">
                Bezeichnung / Beschreibung
              </label>
              <input
                type="text"
                value={item.bezeichnung}
                onChange={(e) => updateItem(item.id, 'bezeichnung', e.target.value)}
                placeholder="z.B. Betriebsgelaende Hauptstr. 12"
                className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Wert + Datum + Verfahren */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium font-body text-text-secondary mb-1">
                Marktwert / Zeitwert / Nennwert
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={item.wert || ''}
                  onChange={(e) => updateItem(item.id, 'wert', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full rounded-lg border border-border bg-surface-card pl-3 pr-8 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted">
                  &euro;
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium font-body text-text-secondary mb-1">
                Bewertungsdatum
              </label>
              <input
                type="date"
                value={item.datum}
                onChange={(e) => updateItem(item.id, 'datum', e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium font-body text-text-secondary mb-1">
                Bewertungsverfahren
              </label>
              <select
                value={item.bewertung}
                onChange={(e) => updateItem(item.id, 'bewertung', e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              >
                {BEWERTUNGSVERFAHREN.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Vorlasten + Rang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium font-body text-text-secondary mb-1">
                Vorlasten
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={item.vorlasten || ''}
                  onChange={(e) =>
                    updateItem(item.id, 'vorlasten', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="w-full rounded-lg border border-border bg-surface-card pl-3 pr-8 py-2 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-muted">
                  &euro;
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium font-body text-text-secondary mb-1">
                Rang
              </label>
              <select
                value={item.rang}
                onChange={(e) => updateItem(item.id, 'rang', parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              >
                {RANG_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      {/* Add button */}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-border text-sm font-medium font-body text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors w-full justify-center"
      >
        <Plus size={18} strokeWidth={1.5} />
        Sicherheit hinzufuegen
      </button>
    </div>
  );
}

// =============================================================================
// Tab 2: Bewertung & Haircuts
// =============================================================================

function BewertungTab({ items, haircuts, setHaircuts }) {
  /** Computed rows with all derived values */
  const rows = useMemo(() => {
    return items.map((item) => {
      const rate = findHaircutRate(item.art);
      const haircut = haircuts[item.id] != null ? haircuts[item.id] : (rate?.standard ?? 0.5);
      const zeitwert = item.wert || 0;
      const beleihungswert = zeitwert * (1 - haircut);
      const vorlasten = item.vorlasten || 0;
      const anrechenbar = Math.max(0, beleihungswert - vorlasten);

      return {
        ...item,
        haircut,
        zeitwert,
        beleihungswert,
        vorlasten,
        anrechenbar,
        rate,
      };
    });
  }, [items, haircuts]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        zeitwert: acc.zeitwert + r.zeitwert,
        beleihungswert: acc.beleihungswert + r.beleihungswert,
        vorlasten: acc.vorlasten + r.vorlasten,
        anrechenbar: acc.anrechenbar + r.anrechenbar,
      }),
      { zeitwert: 0, beleihungswert: 0, vorlasten: 0, anrechenbar: 0 }
    );
  }, [rows]);

  const handleHaircutChange = (id, value) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setHaircuts((prev) => ({ ...prev, [id]: Math.max(0, Math.min(1, num / 100)) }));
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading>Bewertung & Haircuts</SectionHeading>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-muted">
          <Calculator size={40} strokeWidth={1.5} className="mb-3 opacity-50" />
          <p className="text-sm font-body">
            Keine Sicherheiten vorhanden. Bitte erfasse Sicherheiten im ersten Tab.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">
                  Sicherheit
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Zeitwert</th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">Haircut</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  Beleihungswert
                </th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Vorlasten</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">
                  Anrechenbarer Wert
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-text-primary text-sm">
                      {displayArt(row.art)}
                    </div>
                    {row.bezeichnung && (
                      <div className="text-xs text-text-muted mt-0.5">{row.bezeichnung}</div>
                    )}
                    {row.datum && (
                      <div className="text-xs text-text-muted mt-0.5">
                        Bewertung: {formatDate(row.datum)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">
                    {formatCurrency(row.zeitwert)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={Math.round(row.haircut * 100)}
                        onChange={(e) => handleHaircutChange(row.id, e.target.value)}
                        className="w-16 rounded border border-border bg-surface-card px-2 py-1 text-xs font-mono text-center text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                      />
                      <span className="text-xs font-mono text-text-muted">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">
                    {formatCurrency(row.beleihungswert)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-muted">
                    {row.vorlasten > 0 ? (
                      <span className="text-danger">{formatCurrency(row.vorlasten)}</span>
                    ) : (
                      formatCurrency(0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-text-primary">
                    {formatCurrency(row.anrechenbar)}
                  </td>
                </tr>
              ))}
              {/* SUMME row */}
              <tr className="bg-surface border-t-2 border-primary/30">
                <td className="px-4 py-3 font-bold text-text-primary">SUMME</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">
                  {formatCurrency(totals.zeitwert)}
                </td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right font-mono font-bold text-text-primary">
                  {formatCurrency(totals.beleihungswert)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-text-muted">
                  {formatCurrency(totals.vorlasten)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                  {formatCurrency(totals.anrechenbar)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Haircut reference table */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} strokeWidth={1.5} className="text-text-muted" />
          <h4 className="text-sm font-semibold font-headline text-text-secondary">
            Haircut-Referenztabelle
          </h4>
        </div>
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-xs font-body">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-3 py-2 font-medium text-text-secondary">
                  Sicherheitenart
                </th>
                <th className="text-center px-3 py-2 font-medium text-text-secondary">
                  Haircut-Spanne
                </th>
                <th className="text-center px-3 py-2 font-medium text-text-secondary">Standard</th>
                <th className="text-left px-3 py-2 font-medium text-text-secondary">Info</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(haircutRates).map(([art, rate]) => (
                <tr key={art} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-text-primary">{displayArt(art)}</td>
                  <td className="px-3 py-2 text-center font-mono text-text-secondary">
                    {formatPercent(rate.haircut_min)} &ndash; {formatPercent(rate.haircut_max)}
                  </td>
                  <td className="px-3 py-2 text-center font-mono font-medium text-text-primary">
                    {formatPercent(rate.standard)}
                  </td>
                  <td className="px-3 py-2 text-text-muted">{rate.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Tab 3: Blankoanteil & LTV
// =============================================================================

function BlankoTab({ items, haircuts, kreditBetrag, company }) {
  /** Compute totals from items + haircuts */
  const calculations = useMemo(() => {
    let gesamtAnrechenbar = 0;
    let hauptsicherheitBeleihungswert = 0;
    let hauptsicherheitWert = 0;

    items.forEach((item) => {
      const rate = findHaircutRate(item.art);
      const haircut = haircuts[item.id] != null ? haircuts[item.id] : (rate?.standard ?? 0.5);
      const zeitwert = item.wert || 0;
      const beleihungswert = zeitwert * (1 - haircut);
      const vorlasten = item.vorlasten || 0;
      const anrechenbar = Math.max(0, beleihungswert - vorlasten);
      gesamtAnrechenbar += anrechenbar;

      // Track the largest collateral as "Hauptsicherheit"
      if (zeitwert > hauptsicherheitWert) {
        hauptsicherheitWert = zeitwert;
        hauptsicherheitBeleihungswert = beleihungswert;
      }
    });

    const blankoanteil = Math.max(0, kreditBetrag - gesamtAnrechenbar);
    const blankoQuote = kreditBetrag > 0 ? blankoanteil / kreditBetrag : 0;
    const besichertQuote = kreditBetrag > 0 ? Math.min(1, gesamtAnrechenbar / kreditBetrag) : 0;
    const ltv =
      hauptsicherheitBeleihungswert > 0
        ? kreditBetrag / hauptsicherheitBeleihungswert
        : null;

    return {
      gesamtAnrechenbar,
      blankoanteil,
      blankoQuote,
      besichertQuote,
      ltv,
      hauptsicherheitBeleihungswert,
    };
  }, [items, haircuts, kreditBetrag]);

  const ratingClassNum = useMemo(() => estimateRatingClass(company), [company]);

  /** Determine which limit row is active based on estimated rating */
  const activeLimitIndex = useMemo(() => {
    if (ratingClassNum == null) return -1;
    if (ratingClassNum <= 3) return 0;
    if (ratingClassNum <= 6) return 1;
    if (ratingClassNum <= 9) return 2;
    return 3;
  }, [ratingClassNum]);

  /** Check if blanko quote exceeds limit */
  const limitExceeded = useMemo(() => {
    if (activeLimitIndex < 0) return false;
    const limit = RATING_LIMITS[activeLimitIndex];
    return calculations.blankoQuote > limit.max;
  }, [activeLimitIndex, calculations.blankoQuote]);

  // LTV color
  const ltvColor =
    calculations.ltv == null
      ? 'text-text-muted'
      : calculations.ltv <= 0.6
        ? 'text-green-600'
        : calculations.ltv <= 0.8
          ? 'text-amber-600'
          : calculations.ltv <= 1.0
            ? 'text-accent-warm'
            : 'text-danger';

  const ltvLabel =
    calculations.ltv == null
      ? 'Nicht berechenbar'
      : calculations.ltv <= 0.6
        ? 'Konservativ'
        : calculations.ltv <= 0.8
          ? 'Angemessen'
          : calculations.ltv <= 1.0
            ? 'Grenzwertig'
            : 'Ueberfinanziert';

  return (
    <div className="space-y-6">
      <SectionHeading>Blankoanteil & LTV-Analyse</SectionHeading>

      {/* Main calculation card */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          {/* Kreditbetrag */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-body text-text-secondary">
              Kreditbetrag (beantragt):
            </span>
            <span className="text-sm font-mono font-medium text-text-primary">
              {formatCurrency(kreditBetrag)}
            </span>
          </div>
          {/* Anrechenbare Sicherheiten */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-body text-text-secondary">
              Anrechenbare Sicherheiten:
            </span>
            <span className="text-sm font-mono font-medium text-accent">
              {formatCurrency(calculations.gesamtAnrechenbar)}
            </span>
          </div>
          {/* Divider */}
          <div className="border-t border-border my-2" />
          {/* Blankoanteil */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold font-body text-text-primary">BLANKOANTEIL:</span>
            <span
              className={`text-sm font-mono font-bold ${
                calculations.blankoanteil > 0 ? 'text-danger' : 'text-accent'
              }`}
            >
              {formatCurrency(calculations.blankoanteil)}{' '}
              <span className="text-xs">({formatPercent(calculations.blankoQuote)})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stacked bar chart (CSS only) */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h4 className="text-sm font-semibold font-headline text-text-secondary mb-4">
          Besicherungsstruktur
        </h4>
        <div className="space-y-3">
          {/* Bar */}
          <div className="relative h-10 rounded-lg overflow-hidden bg-gray-100 border border-border">
            {/* Green = besichert */}
            <div
              className="absolute inset-y-0 left-0 bg-green-500 transition-all duration-500"
              style={{ width: `${Math.min(100, calculations.besichertQuote * 100)}%` }}
            />
            {/* Red = blanko */}
            {calculations.blankoQuote > 0 && (
              <div
                className="absolute inset-y-0 right-0 bg-red-500 transition-all duration-500"
                style={{ width: `${Math.min(100, calculations.blankoQuote * 100)}%` }}
              />
            )}
            {/* Label overlay */}
            <div className="absolute inset-0 flex items-center justify-between px-3">
              {calculations.besichertQuote > 0.15 && (
                <span className="text-xs font-mono font-bold text-white drop-shadow">
                  {formatPercent(calculations.besichertQuote)} besichert
                </span>
              )}
              {calculations.blankoQuote > 0.15 && (
                <span className="text-xs font-mono font-bold text-white drop-shadow ml-auto">
                  {formatPercent(calculations.blankoQuote)} blanko
                </span>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs font-body text-text-secondary">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
              <span>
                Besichert: {formatCurrency(Math.min(kreditBetrag, calculations.gesamtAnrechenbar))}
              </span>
            </div>
            {calculations.blankoanteil > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
                <span>Blanko: {formatCurrency(calculations.blankoanteil)}</span>
              </div>
            )}
            {calculations.gesamtAnrechenbar > kreditBetrag && (
              <div className="flex items-center gap-2">
                <CheckCircle size={14} strokeWidth={1.5} className="text-green-600" />
                <span className="text-green-700 font-medium">
                  Ueberbesichert um{' '}
                  {formatCurrency(calculations.gesamtAnrechenbar - kreditBetrag)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LTV Calculation */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h4 className="text-sm font-semibold font-headline text-text-secondary mb-4">
          Loan-to-Value (LTV)
        </h4>
        <div className="flex items-start gap-6">
          <div className="space-y-2 flex-1">
            <div className="text-xs text-text-muted font-body">
              LTV = Kreditbetrag / Beleihungswert Hauptsicherheit
            </div>
            <div className="flex items-baseline gap-3 mt-2">
              <span className={`text-3xl font-mono font-bold ${ltvColor}`}>
                {calculations.ltv != null ? formatPercent(calculations.ltv) : '--'}
              </span>
              <span
                className={`text-sm font-body font-medium ${ltvColor}`}
              >
                {ltvLabel}
              </span>
            </div>
            <div className="text-xs text-text-muted font-body mt-1">
              Kreditbetrag: {formatCurrency(kreditBetrag)} / Beleihungswert Hauptsicherheit:{' '}
              {formatCurrency(calculations.hauptsicherheitBeleihungswert)}
            </div>
          </div>
          {/* LTV gauge */}
          <div className="hidden md:flex flex-col items-center gap-1">
            <div className="relative w-28 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  calculations.ltv == null
                    ? 'bg-gray-300'
                    : calculations.ltv <= 0.6
                      ? 'bg-green-500'
                      : calculations.ltv <= 0.8
                        ? 'bg-amber-500'
                        : calculations.ltv <= 1.0
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(100, (calculations.ltv || 0) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between w-28 text-[10px] font-mono text-text-muted">
              <span>0%</span>
              <span>60%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rating-dependent limits */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} strokeWidth={1.5} className="text-accent-warm" />
          <h4 className="text-sm font-semibold font-headline text-text-secondary">
            Ratingabhaengige Blankoanteil-Grenzen
          </h4>
        </div>

        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left px-4 py-2.5 font-medium text-text-secondary">Rating</th>
                <th className="text-left px-4 py-2.5 font-medium text-text-secondary">
                  Max. Blankoanteil
                </th>
                <th className="text-left px-4 py-2.5 font-medium text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {RATING_LIMITS.map((limit, idx) => {
                const isActive = idx === activeLimitIndex;
                return (
                  <tr
                    key={limit.range}
                    className={`border-b border-border last:border-b-0 transition-colors ${
                      isActive
                        ? limitExceeded
                          ? 'bg-red-50 border-l-4 border-l-danger'
                          : 'bg-green-50 border-l-4 border-l-green-500'
                        : ''
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <span
                        className={`font-mono font-medium ${
                          isActive ? 'text-text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {limit.range}
                      </span>
                      {isActive && ratingClassNum != null && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          aktuell ~{ratingClassNum}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-text-primary">{limit.label}</td>
                    <td className="px-4 py-2.5">
                      {isActive &&
                        (limitExceeded ? (
                          <span className="inline-flex items-center gap-1 text-xs text-danger font-medium">
                            <AlertTriangle size={12} strokeWidth={1.5} />
                            Ueberschritten ({formatPercent(calculations.blankoQuote)})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle size={12} strokeWidth={1.5} />
                            Eingehalten ({formatPercent(calculations.blankoQuote)})
                          </span>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {ratingClassNum == null && (
          <p className="text-xs text-text-muted font-body mt-3 flex items-center gap-1.5">
            <Info size={12} strokeWidth={1.5} />
            Ratingklasse konnte nicht automatisch ermittelt werden. Die Hervorhebung entfaellt.
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function CollateralView() {
  const { state, navigate, getSelectedCompany } = useApp();
  const company = getSelectedCompany();

  const [activeTab, setActiveTab] = useState('erfassen');

  // ---------------------------------------------------------------------------
  // Collateral items state -- pre-populated from company data
  // ---------------------------------------------------------------------------
  const [items, setItems] = useState(() => {
    if (!company?.sicherheiten?.length) return [];
    return company.sicherheiten.map(mapCompanyItem);
  });

  // Custom haircut overrides per item id
  const [haircuts, setHaircuts] = useState({});

  // ---------------------------------------------------------------------------
  // No company selected fallback
  // ---------------------------------------------------------------------------
  if (!state.selectedCompanyId || !company) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 space-y-6">
        <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
          <Shield size={28} strokeWidth={1.5} className="text-text-muted" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold font-headline text-text-primary">
            Kein Kreditantrag ausgewaehlt
          </h2>
          <p className="text-sm font-body text-text-secondary max-w-md">
            Bitte waehle einen Kreditantrag im Dashboard aus, um die Sicherheitenbewertung
            durchzufuehren.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium font-body hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Zurueck zum Dashboard
        </button>
      </div>
    );
  }

  const kreditBetrag = company.kredit?.betrag || 0;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield size={20} strokeWidth={1.5} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-headline text-text-primary">
            Sicherheitenbewertung
          </h1>
          <p className="text-sm font-body text-text-secondary">
            {company.firma} &middot; {company.id}
          </p>
        </div>
      </div>

      {/* ================================================================== */}
      {/* Tab Navigation                                                      */}
      {/* ================================================================== */}
      <div className="flex flex-wrap gap-2 bg-surface-card border border-border rounded-xl p-1.5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-body transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary'
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ================================================================== */}
      {/* Tab Content                                                         */}
      {/* ================================================================== */}
      <div className="bg-surface-card border border-border rounded-xl p-6">
        {activeTab === 'erfassen' && <ErfassenTab items={items} setItems={setItems} />}
        {activeTab === 'bewertung' && (
          <BewertungTab items={items} haircuts={haircuts} setHaircuts={setHaircuts} />
        )}
        {activeTab === 'blanko' && (
          <BlankoTab
            items={items}
            haircuts={haircuts}
            kreditBetrag={kreditBetrag}
            company={company}
          />
        )}
      </div>

      <StepCompleteBar currentStep="collateral" />
    </div>
  );
}
