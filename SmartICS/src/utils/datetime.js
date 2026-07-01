// Deutsche Datums-/Zeitformatierung (DD.MM.YYYY, HH:MM, 24h)

export function formatDateTimeDe(ts) {
  const d = new Date(ts);
  const datum = d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const zeit = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  return `${datum}, ${zeit} Uhr`;
}

export function formatDateDe(ts) {
  return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateLongDe(ts) {
  return new Date(ts).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Relative deutsche Angabe („vor 3 Minuten", „vor 2 Stunden", sonst Datum)
export function formatRelativeDe(ts) {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'gerade eben';
  if (min < 60) return `vor ${min} Minute${min === 1 ? '' : 'n'}`;
  const std = Math.round(min / 60);
  if (std < 24) return `vor ${std} Stunde${std === 1 ? '' : 'n'}`;
  const tage = Math.round(std / 24);
  if (tage < 7) return `vor ${tage} Tag${tage === 1 ? '' : 'en'}`;
  return formatDateDe(ts);
}
