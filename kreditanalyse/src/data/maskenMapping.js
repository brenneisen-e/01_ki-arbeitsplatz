/**
 * maskenMapping.js
 *
 * Definiert, in welche Maske der KI-Kreditanalyse ein aus einem externen
 * Konsortialkredit-PDF extrahiertes Feld gehört. Das Ziel ist eine klare
 * Anleitung für den Kreditanalysten: "Wert X bitte in Maske Y, Feld Z".
 *
 * Jedes Feld hat:
 *   - key:        Eindeutiger Schlüssel (wird vom Parser gefüllt)
 *   - label:      Anzeigename für die UI
 *   - maskId:     View-Key aus MainLayout.jsx (z.B. 'application')
 *   - maskLabel:  Deutscher Name der Maske
 *   - section:    Optionaler Abschnitt innerhalb der Maske
 *   - field:      Konkretes Eingabefeld, das befüllt werden soll
 *   - format:     'currency' | 'percent' | 'date' | 'text' | 'years'
 */

export const MASKEN_MAPPING = {
  // --- Abschnitt A: Antragsteller ---
  firma: {
    label: 'Firmenname Kreditnehmer',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'A  Antragsteller', field: 'Firmenname', format: 'text',
  },
  rechtsform: {
    label: 'Rechtsform',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'A  Antragsteller', field: 'Rechtsform', format: 'text',
  },
  hrb: {
    label: 'Handelsregisternummer',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'A  Antragsteller', field: 'HRB', format: 'text',
  },
  adresse: {
    label: 'Sitz / Adresse',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'A  Antragsteller', field: 'Strasse / PLZ / Ort', format: 'text',
  },

  // --- Abschnitt C: Kreditwunsch ---
  kreditart: {
    label: 'Kreditart',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'C  Kreditwunsch', field: 'Kreditart', format: 'text',
  },
  kreditbetrag: {
    label: 'Nominalbetrag (Gesamt-Tranche)',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'C  Kreditwunsch', field: 'Kreditbetrag (EUR)', format: 'currency',
  },
  laufzeit: {
    label: 'Laufzeit',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'C  Kreditwunsch', field: 'Laufzeit (Monate)', format: 'years',
  },
  tilgungsfrei: {
    label: 'Tilgungsfreie Zeit',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'C  Kreditwunsch', field: 'Tilgungsfreie Zeit (Monate)', format: 'years',
  },
  auszahlung: {
    label: 'Gewünschter Auszahlungstermin',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'C  Kreditwunsch', field: 'Auszahlungstermin', format: 'date',
  },
  verwendung: {
    label: 'Verwendungszweck',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'C  Kreditwunsch', field: 'Verwendungszweck', format: 'text',
  },

  // --- Abschnitt D: bestehende Verbindlichkeiten (Konsortialkredit) ---
  konsortialfuehrer: {
    label: 'Konsortialführer / Gläubiger',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'D  Bestehende Verbindlichkeiten', field: 'Gläubiger (Konsortialführer)', format: 'text',
  },
  ursprungsbetrag: {
    label: 'Ursprungsbetrag Konsortialkredit',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'D  Bestehende Verbindlichkeiten', field: 'Ursprungsbetrag', format: 'currency',
  },
  restschuld: {
    label: 'Restschuld',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'D  Bestehende Verbindlichkeiten', field: 'Restschuld', format: 'currency',
  },
  zinssatz: {
    label: 'Zinssatz / Marge',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'D  Bestehende Verbindlichkeiten', field: 'Zinssatz', format: 'percent',
  },
  rate: {
    label: 'Rate / Tilgung pro Monat',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'D  Bestehende Verbindlichkeiten', field: 'Rate', format: 'currency',
  },
  laufzeitende: {
    label: 'Laufzeitende / Fälligkeit',
    maskId: 'application', maskLabel: 'Kreditantrag',
    section: 'D  Bestehende Verbindlichkeiten', field: 'Laufzeitende', format: 'date',
  },

  // --- Maske: Sicherheiten ---
  sicherheit_art: {
    label: 'Sicherheiten-Art',
    maskId: 'collateral', maskLabel: 'Sicherheiten',
    section: 'Sicherheiten erfassen', field: 'Art der Sicherheit', format: 'text',
  },
  sicherheit_wert: {
    label: 'Nominalwert Sicherheit',
    maskId: 'collateral', maskLabel: 'Sicherheiten',
    section: 'Sicherheiten erfassen', field: 'Nominalwert (EUR)', format: 'currency',
  },
  sicherheit_bezeichnung: {
    label: 'Bezeichnung Sicherheit',
    maskId: 'collateral', maskLabel: 'Sicherheiten',
    section: 'Sicherheiten erfassen', field: 'Bezeichnung', format: 'text',
  },

  // --- Maske: Kreditvertrag (Covenants, Kündigungsrechte) ---
  covenant: {
    label: 'Covenant / Auflage',
    maskId: 'contract', maskLabel: 'Kreditvertrag',
    section: 'Vertragsbedingungen', field: 'Covenants', format: 'text',
  },
};

/**
 * Gibt alle Keys gruppiert nach Ziel-Maske zurück.
 */
export function groupKeysByMask() {
  const groups = {};
  for (const [key, cfg] of Object.entries(MASKEN_MAPPING)) {
    if (!groups[cfg.maskId]) {
      groups[cfg.maskId] = { maskId: cfg.maskId, maskLabel: cfg.maskLabel, keys: [] };
    }
    groups[cfg.maskId].keys.push(key);
  }
  return groups;
}
