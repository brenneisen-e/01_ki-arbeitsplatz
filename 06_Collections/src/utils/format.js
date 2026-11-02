// Deutsche Formatierung fuer alle im UI sichtbaren Zahlen und Daten.

export function euro(betrag, { nachkomma = 0 } = {}) {
  if (betrag === null || betrag === undefined || Number.isNaN(betrag)) return '–';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency', currency: 'EUR',
    minimumFractionDigits: nachkomma, maximumFractionDigits: nachkomma,
  }).format(betrag);
}

export function zahl(wert, nachkomma = 0) {
  if (wert === null || wert === undefined || Number.isNaN(wert)) return '–';
  return wert.toLocaleString('de-DE', {
    minimumFractionDigits: nachkomma, maximumFractionDigits: nachkomma,
  });
}

export function prozent(wert, nachkomma = 0) {
  return `${zahl(wert, nachkomma)} %`;
}

export function datum(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value ?? '–');
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function datumLang(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value ?? '–');
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function uhrzeit(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function datumZeit(value) {
  return `${datum(value)}, ${uhrzeit(value)}`;
}

// Initialen fuer Avatare: "Mueller GmbH" -> "MG", "Müller, Hans" -> "MH"
export function initialen(name) {
  return String(name || '')
    .replace(/,/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}
