import { getLang } from './langHelper';
function numLoc() { return getLang() === 'en' ? 'en-US' : 'de-DE'; }
function dateLoc() { return getLang() === 'en' ? 'en-GB' : 'de-DE'; }
function cur() { return getLang() === 'en' ? '$' : '\u20ac'; }

export function formatEur(val) {
  if (val == null) return '-';
  return Math.round(val).toLocaleString(numLoc()) + cur();
}

export function formatEurExact(val) {
  if (val == null) return '-';
  return val.toLocaleString(numLoc(), { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + cur();
}

export function formatPct(val) {
  if (val == null) return '-';
  return `${val.toLocaleString(numLoc(), { maximumFractionDigits: 1 })}%`;
}

export function formatNum(val) {
  if (val == null) return '-';
  return val.toLocaleString(numLoc());
}

export function formatDatum(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString(dateLoc(), { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDatumKurz(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString(dateLoc(), { day: '2-digit', month: '2-digit' });
}

export function berechneHaushaltsnetto(kunde) {
  const eigen = kunde.nettoeinkommen || 0;
  const partner = kunde.partner?.einkommen || 0;
  const kindergeld = (kunde.kinder?.length || 0) * 250;
  return eigen + partner + kindergeld;
}

export function berechneAusgaben(kunde) {
  if (!kunde.transaktionen) return 0;
  return kunde.transaktionen.filter(t => t.betrag < 0).reduce((s, t) => s + Math.abs(t.betrag), 0);
}

export function berechneFrei(kunde) {
  return berechneHaushaltsnetto(kunde) - berechneAusgaben(kunde);
}

export function berechneAbsicherungsquote(kunde) {
  const versicherung = kunde.transaktionen?.filter(t =>
    t.kategorie?.includes('versicherung')
  ).reduce((s, t) => s + Math.abs(t.betrag), 0) || 0;
  const netto = berechneHaushaltsnetto(kunde);
  if (netto === 0) return 0;
  return (versicherung / netto) * 100;
}

export function berechneSparquote(kunde) {
  const sparen = kunde.transaktionen?.filter(t =>
    t.kategorie?.includes('spar') || t.kategorie?.includes('sparen')
  ).reduce((s, t) => s + Math.abs(t.betrag), 0) || 0;
  const netto = berechneHaushaltsnetto(kunde);
  if (netto === 0) return 0;
  return (sparen / netto) * 100;
}

export function potentialSterne(score) {
  const full = Math.floor(score);
  const half = score - full >= 0.5;
  return { full, half, empty: 5 - full - (half ? 1 : 0) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Zentrale Summenberechnung für Anlage- und Kreditvolumen.
// Wird sowohl in der Stammdaten-Finanzübersicht-Card als auch im
// Finanzübersicht-Tab (OpenFinanceTab) verwendet, damit identische
// Quellen identische Werte ergeben. Open-Finance-Daten haben Vorrang vor
// Fremdprodukten, um Doppelzählungen (z. B. KfW-Kredit, der sowohl in
// finanzierungen als auch in fremdProdukte auftaucht) zu vermeiden.
// ─────────────────────────────────────────────────────────────────────────────
const EIGEN_ANLAGE_TYPES = new Set([
  'depot', 'depot_privat', 'depot_firma', 'depot2', 'fonds',
  'sparkonto', 'tagesgeld', 'festgeld', 'bausparvertrag', 'bausparer',
  'lv', 'lebensversicherung', 'riester', 'ruerup', 'bav',
]);
const FREMD_ANLAGE_TYPES = new Set([
  'depot', 'depot_privat', 'depot_firma', 'depot2', 'fonds',
  'sparkonto', 'tagesgeld', 'festgeld', 'bausparen', 'bausparvertrag',
]);
const KREDIT_TYPES = new Set([
  'kredit', 'privatkredit', 'konsumkredit', 'baufinanzierung',
  'kffw', 'kfw',
]);

export function berechneAnlagevolumen(kunde) {
  const of = kunde?.openFinance || {};
  const eigen = kunde?.eigeneProdukte || [];
  const fremd = kunde?.fremdProdukte || [];

  const eigenVol = eigen
    .filter(p => EIGEN_ANLAGE_TYPES.has(p.typ))
    .reduce((s, p) => s + (Number(p.volumen) || 0), 0);

  // Falls Open-Finance-Daten vorliegen, vertrauen wir ausschließlich diesen
  // (sie speisen auch die Finanzübersicht-Tabellen). Andernfalls Fallback auf
  // Fremdprodukte, damit nichts verschluckt wird.
  const hasOF = (of.geldmarkt?.length || 0) + (of.kapitalmarkt?.length || 0) > 0;
  let fremdVol = 0;
  if (hasOF) {
    const kapitalPositionen = (of.kapitalmarkt || []).flatMap(k => k.positionen || [k]);
    fremdVol += kapitalPositionen.reduce((s, k) => s + (Number(k.volumen) || 0), 0);
    fremdVol += (of.geldmarkt || []).reduce((s, g) => s + (Number(g.volumen) || 0), 0);
  } else {
    fremdVol += fremd
      .filter(p => FREMD_ANLAGE_TYPES.has(p.typ))
      .reduce((s, p) => s + (Number(p.volumen) || 0), 0);
  }
  return eigenVol + fremdVol;
}

export function berechneKreditvolumen(kunde) {
  const of = kunde?.openFinance || {};
  const fremd = kunde?.fremdProdukte || [];
  const hasOF = (of.finanzierungen?.length || 0) > 0;
  if (hasOF) {
    return (of.finanzierungen || []).reduce((s, f) => s + (Number(f.restschuld) || 0), 0);
  }
  return fremd
    .filter(p => KREDIT_TYPES.has(p.typ))
    .reduce((s, p) => s + (Number(p.volumen) || 0), 0);
}
