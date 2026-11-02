// Deutsche Formate und die Farben des VST-Cockpits (Oliv wie der Kopf,
// Gold für Prognose und Akzente, gedämpfte Kategoriefarben).

export const FARBE = {
  modus: '#46552b',
  modusHell: '#61753a',
  modusZart: '#eef1e6',
  gold: '#a8952f',
  goldZart: '#f6f1dc',
  plan: '#a3a69a',
  gut: '#2f8f5b',
  schlecht: '#c23b3b',
  warn: '#b7791f',
  achse: '#94a3b8',
};

/** Feste Kategoriefarben, damit eine Sparte in jedem Diagramm gleich aussieht. */
export const KATEGORIE_FARBE = {
  Leben: '#61753a',
  Kranken: '#4f7a8c',
  Schaden: '#a8952f',
  Kfz: '#8c6a4f',
  'Ausschließlichkeit': '#61753a',
  Makler: '#4f7a8c',
  Direktvertrieb: '#a8952f',
  Banken: '#8c6a4f',
};

export function euro(v) {
  return `${Math.round(v).toLocaleString('de-DE')} €`;
}

/** 3,2 Mio. € · 168 T€ · 940 € */
export function euroKompakt(v) {
  const a = Math.abs(v);
  if (a >= 1e6) return `${(v / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio. €`;
  if (a >= 1e4) return `${Math.round(v / 1e3).toLocaleString('de-DE')} T€`;
  return euro(v);
}

/**
 * Gemeinsame Einheit für eine Liste, nach dem größten Wert: 13,1 T€ · 9,2 T€
 * statt 13 T€ · 9.172 €. Unter 100 Einheiten mit einer Nachkommastelle.
 */
export function euroEinheitlich(max) {
  const a = Math.abs(max);
  const mit = (teiler, einheit) => {
    const stellen = a / teiler < 100 ? 1 : 0;
    return (v) => `${(v / teiler).toLocaleString('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen })} ${einheit}`;
  };
  if (a >= 1e6) return mit(1e6, 'Mio. €');
  if (a >= 1e4) return mit(1e3, 'T€');
  return euro;
}

export function prozent(v, stellen = 1) {
  return `${v.toLocaleString('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen })} %`;
}

export function zahl(v) {
  return Math.round(v).toLocaleString('de-DE');
}

export function uhrzeit(d, mitSekunden = true) {
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', ...(mitSekunden ? { second: '2-digit' } : {}) });
}

export function datum(d) {
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
