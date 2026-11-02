/**
 * Anzeigeformate der Objektdaten (deutsch: 1.234,5 · 5,6 % · TT.MM.JJJJ).
 */

import { formatCurrency, formatNumber } from '../../utils/formatters';
import { OBJEKT_FELDER } from '../../data/objektunterlagen';

export function formatiereWert(format, wert) {
  if (wert === '' || wert == null || (typeof wert === 'number' && Number.isNaN(wert))) return '–';
  switch (format) {
    case 'euro':
      return formatCurrency(Number(wert));
    case 'flaeche':
      return `${formatNumber(Number(wert))} m²`;
    case 'prozent':
      return `${formatNumber(Number(wert), 1)} %`;
    case 'kennwert':
      return `${formatNumber(Number(wert), 1)} kWh/(m²·a)`;
    case 'jahre':
      return `${formatNumber(Number(wert), 1)} Jahre`;
    case 'anzahl':
      return formatNumber(Number(wert));
    case 'rang':
      return `${wert}. Rang`;
    case 'datum': {
      const d = new Date(`${String(wert).slice(0, 10)}T00:00:00`);
      return Number.isNaN(d.getTime())
        ? String(wert)
        : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    default:
      return String(wert);
  }
}

export const formatiereFeld = (key, wert) => formatiereWert(OBJEKT_FELDER[key]?.format, wert);
