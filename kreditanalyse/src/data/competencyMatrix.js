/**
 * Kompetenzmatrix fuer Kreditentscheidungen
 *
 * Legt fest, welche Genehmigungsstufe (Kompetenzstufe) fuer eine
 * Kreditentscheidung erforderlich ist, abhaengig von:
 *   1. Kreditbetrag (Obligo)
 *   2. Rating-Klasse des Kreditnehmers
 *
 * Je hoeher der Betrag und je schlechter das Rating, desto hoehere
 * Genehmigungsstufen werden benoetigt.
 */

export const competencyMatrix = {
  "< 250.000 \u20AC": {
    "1-5":  "Sachbearbeiter",
    "6-9":  "Abteilungsleiter",
    "10+":  "Bereichsleiter"
  },
  "250.000\u2013750.000 \u20AC": {
    "1-5":  "Abteilungsleiter",
    "6-9":  "Bereichsleiter",
    "10+":  "Vorstand"
  },
  "750.000\u20132.500.000 \u20AC": {
    "1-5":  "Bereichsleiter",
    "6-9":  "Vorstand",
    "10+":  "Gesamtvorstand"
  },
  "> 2.500.000 \u20AC": {
    "1-5":  "Vorstand",
    "6-9":  "Gesamtvorstand",
    "10+":  "Gesamtvorstand + AR"
  }
};

/**
 * Hierarchie der Genehmigungsstufen (aufsteigend nach Kompetenz)
 */
export const approvalHierarchy = [
  "Sachbearbeiter",
  "Abteilungsleiter",
  "Bereichsleiter",
  "Vorstand",
  "Gesamtvorstand",
  "Gesamtvorstand + AR"
];

/**
 * Ermittelt den Rating-Bereich-Schluessel fuer eine numerische Rating-Klasse.
 *
 * @param {number} ratingKlasse - Numerische Rating-Klasse (1-18+)
 * @returns {string} - Rating-Bereich ("1-5", "6-9" oder "10+")
 */
const getRatingBereich = (ratingKlasse) => {
  const kl = typeof ratingKlasse === "string" ? parseInt(ratingKlasse, 10) : ratingKlasse;
  if (isNaN(kl)) return "10+";
  if (kl <= 5) return "1-5";
  if (kl <= 9) return "6-9";
  return "10+";
};

/**
 * Ermittelt den Betrags-Bereich-Schluessel fuer einen gegebenen Kreditbetrag.
 *
 * @param {number} betrag - Kreditbetrag in Euro
 * @returns {string} - Betrags-Bereich
 */
const getBetragsBereich = (betrag) => {
  if (betrag < 250000) return "< 250.000 \u20AC";
  if (betrag < 750000) return "250.000\u2013750.000 \u20AC";
  if (betrag < 2500000) return "750.000\u20132.500.000 \u20AC";
  return "> 2.500.000 \u20AC";
};

/**
 * Ermittelt die erforderliche Genehmigungsstufe (Approver).
 *
 * @param {number} betrag - Kreditbetrag in Euro
 * @param {number|string} ratingKlasse - Numerische Rating-Klasse (z.B. 5, "12")
 * @returns {{ approver: string, betragsBereich: string, ratingBereich: string, stufe: number }}
 */
export const getRequiredApprover = (betrag, ratingKlasse) => {
  const betragsBereich = getBetragsBereich(betrag);
  const ratingBereich = getRatingBereich(ratingKlasse);

  const approver = competencyMatrix[betragsBereich]?.[ratingBereich] || "Gesamtvorstand + AR";
  const stufe = approvalHierarchy.indexOf(approver);

  return {
    approver,
    betragsBereich,
    ratingBereich,
    stufe: stufe >= 0 ? stufe : approvalHierarchy.length - 1
  };
};

/**
 * Prueft, ob eine Person mit einer bestimmten Kompetenzstufe
 * die Genehmigung erteilen darf.
 *
 * @param {string} personStufe - Kompetenzstufe der genehmigenden Person
 * @param {number} betrag - Kreditbetrag in Euro
 * @param {number|string} ratingKlasse - Numerische Rating-Klasse
 * @returns {{ erlaubt: boolean, erforderlich: string, vorhanden: string }}
 */
export const pruefeKompetenz = (personStufe, betrag, ratingKlasse) => {
  const { approver } = getRequiredApprover(betrag, ratingKlasse);

  const erforderlichStufe = approvalHierarchy.indexOf(approver);
  const vorhandenStufe = approvalHierarchy.indexOf(personStufe);

  return {
    erlaubt: vorhandenStufe >= 0 && vorhandenStufe >= erforderlichStufe,
    erforderlich: approver,
    vorhanden: personStufe
  };
};

/**
 * Liefert eine vollstaendige Uebersicht der Kompetenzmatrix
 * als flaches Array (z.B. fuer Tabellen-Darstellung).
 *
 * @returns {Array<{ betragsBereich: string, ratingBereich: string, approver: string, stufe: number }>}
 */
export const getKompetenzUebersicht = () => {
  const uebersicht = [];

  for (const [betragsBereich, ratings] of Object.entries(competencyMatrix)) {
    for (const [ratingBereich, approver] of Object.entries(ratings)) {
      uebersicht.push({
        betragsBereich,
        ratingBereich,
        approver,
        stufe: approvalHierarchy.indexOf(approver)
      });
    }
  }

  return uebersicht;
};
