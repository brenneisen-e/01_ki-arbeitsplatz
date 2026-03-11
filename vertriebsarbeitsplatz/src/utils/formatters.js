export function formatEur(val) {
  if (val == null) return '-';
  if (Math.abs(val) >= 1000000) return `${(val / 1000000).toLocaleString('de-DE', { maximumFractionDigits: 1 })} M\u20ac`;
  if (Math.abs(val) >= 1000) return `${(val / 1000).toLocaleString('de-DE', { maximumFractionDigits: 0 })} k\u20ac`;
  return `${val.toLocaleString('de-DE')} \u20ac`;
}

export function formatEurExact(val) {
  if (val == null) return '-';
  return `${val.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} \u20ac`;
}

export function formatPct(val) {
  if (val == null) return '-';
  return `${val.toLocaleString('de-DE', { maximumFractionDigits: 1 })}%`;
}

export function formatNum(val) {
  if (val == null) return '-';
  return val.toLocaleString('de-DE');
}

export function formatDatum(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDatumKurz(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
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
