/**
 * maskenMapping.js
 *
 * Mapping der aus externen Konsortialkredit-PDFs extrahierten Werte auf
 * die Erfassungsmasken im **SAP S/4HANA Banking for Complex Loans**
 * Finanzierungsarbeitsplatz. Bezeichnungen und Registerkarten folgen
 * exakt dem offiziellen SAP-Handbuch (Dokumentversion 1.0, 23.01.2026).
 *
 * Hierarchie:
 *   Finanzierung (oberstes Objekt)
 *     └─ Tranchen
 *         └─ Ziehungen
 *
 * Wichtige Hierarchie-Objekte als Ziel-Maske ("maskId"):
 *   - sap-finanzierung  Finanzierung (Kopfebene) mit Registerkarten
 *                       Übersicht, Konditionen, Ziehungsregeln, Partner,
 *                       Syndizierung, Covenants, Sperren, Regeln
 *   - sap-tranche       Tranche innerhalb der Finanzierung
 *   - sap-ziehung       Ziehung innerhalb einer Tranche
 *   - sap-partner       Geschäftspartner (SAP BP, Darlehensnehmer/
 *                       Konsortialführer)
 */

export const MASKEN_MAPPING = {
  // ============================================================
  // Geschäftspartner (Darlehensnehmer als SAP Business Partner)
  // ============================================================
  firma: {
    label: 'Firmenname Kreditnehmer',
    maskId: 'sap-partner', maskLabel: 'SAP Geschäftspartner',
    transaction: 'BP', section: 'Allgemeine Daten', field: 'Name 1', format: 'text',
  },
  rechtsform: {
    label: 'Rechtsform',
    maskId: 'sap-partner', maskLabel: 'SAP Geschäftspartner',
    transaction: 'BP', section: 'Allgemeine Daten', field: 'Rechtsform', format: 'text',
  },
  hrb: {
    label: 'Handelsregisternummer',
    maskId: 'sap-partner', maskLabel: 'SAP Geschäftspartner',
    transaction: 'BP', section: 'Identifikation', field: 'Handelsregisternummer', format: 'text',
  },
  adresse: {
    label: 'Sitz / Adresse',
    maskId: 'sap-partner', maskLabel: 'SAP Geschäftspartner',
    transaction: 'BP', section: 'Adresse', field: 'Straße / PLZ / Ort', format: 'text',
  },

  // ============================================================
  // Finanzierung (Kopfebene im Finanzierungsarbeitsplatz)
  // ============================================================
  kreditbetrag: {
    label: 'Nominalbetrag (Gesamt-Tranche)',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Übersicht',
    field: 'Gesamtbetrag', format: 'currency',
  },
  ursprungsbetrag: {
    label: 'Ursprungsbetrag',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Übersicht',
    field: 'Finanzierungsbetrag', format: 'currency',
  },
  auszahlung: {
    label: 'Auszahlungstermin / Valuta',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Übersicht',
    field: 'Beginn der Vertragslaufzeit', format: 'date',
  },
  laufzeitende: {
    label: 'Laufzeitende / Fälligkeit',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Übersicht',
    field: 'Ende der Vertragslaufzeit', format: 'date',
  },
  verwendung: {
    label: 'Verwendungszweck',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Übersicht',
    field: 'Name (Beschreibung)', format: 'text',
  },
  kreditart: {
    label: 'Kreditart / Produkttyp',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Übersicht',
    field: 'Produkt', format: 'text',
  },

  // ============================================================
  // Konsortialführer → Registerkarte Syndizierung
  // ============================================================
  konsortialfuehrer: {
    label: 'Konsortialführer / Gläubiger',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Syndizierung',
    field: 'Konsorten (Partnerrolle Konsortialführer)', format: 'text',
  },

  // ============================================================
  // Konditionen (Registerkarte Konditionen → Kopfdaten/Beträge)
  // ============================================================
  zinssatz: {
    label: 'Zinssatz / Marge',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz',
    section: 'Registerkarte Konditionen › Kopfdaten',
    field: 'Effektivzins', format: 'percent',
  },
  rate: {
    label: 'Tilgungsrate pro Monat',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz',
    section: 'Registerkarte Konditionen › Beträge',
    field: 'Konditionsbetrag (Tilgung)', format: 'currency',
  },
  laufzeit: {
    label: 'Laufzeit',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz',
    section: 'Registerkarte Konditionen › Termine',
    field: 'Fest ab / Fest bis', format: 'years',
  },
  tilgungsfrei: {
    label: 'Tilgungsfreie Zeit',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz',
    section: 'Registerkarte Konditionen › Termine',
    field: 'Gültig ab (Tilgungskondition)', format: 'years',
  },

  // ============================================================
  // Restschuld → Ziehungsebene / Finanzstrom
  // ============================================================
  restschuld: {
    label: 'Restschuld',
    maskId: 'sap-ziehung', maskLabel: 'Ziehung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Finanzströme',
    field: 'Offene Kreditlinie / Restkapital', format: 'currency',
  },

  // ============================================================
  // Sicherheiten (kein eigenes CML-Objekt in Complex Loans,
  // werden i.d.R. als Referenzen / Covenant-Sicherheiten hinterlegt)
  // ============================================================
  sicherheit_art: {
    label: 'Sicherheiten-Art',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Referenzen',
    field: 'Referenzart „Sicherheit"', format: 'text',
  },
  sicherheit_wert: {
    label: 'Nominalwert Sicherheit',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Referenzen',
    field: 'Referenzbetrag', format: 'currency',
  },
  sicherheit_bezeichnung: {
    label: 'Bezeichnung Sicherheit',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Referenzen',
    field: 'Bezeichnung', format: 'text',
  },

  // ============================================================
  // Financial Covenants → eigene Registerkarte
  // ============================================================
  covenant: {
    label: 'Financial Covenant / Auflage',
    maskId: 'sap-finanzierung', maskLabel: 'Finanzierung',
    transaction: 'Finanzierungsarbeitsplatz', section: 'Registerkarte Covenants',
    field: 'Vertragliche Verpflichtung', format: 'text',
  },
};

/** Gruppiert Keys nach maskId. */
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
