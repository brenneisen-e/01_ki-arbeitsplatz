/**
 * Rating-Skalen fuer die Kreditanalyse
 *
 * Enthaelt die drei gaengigen Ratingsysteme im deutschen Bankwesen:
 *   1. IFD-Masterskala (Initiative Finanzstandort Deutschland) - 6 Klassen
 *   2. Sparkassen-Skala (DSGV-Standard-Rating) - 18 Klassen + 3 Ausfallklassen
 *   3. VR-Rating-Skala (Genossenschaftsbanken) - 16 Klassen + Ausfallklassen
 *
 * PD = Probability of Default (Ausfallwahrscheinlichkeit) in Prozent
 *
 * Die Ampelfarben stammen aus der gedämpften Cockpit-Palette (src/index.css,
 * Grün bis Rot). Sie stehen als Hexwert hier, weil die Rating-Ansicht ihnen
 * einen Alphawert anhängt (farbe + '18').
 */

// =============================================================================
// IFD-Masterskala (6 Klassen)
// =============================================================================

export const ifdMasterskala = [
  { klasse: "I",   bezeichnung: "AAA bis AA-", pd_von: 0,     pd_bis: 0.04,  farbe: "#2f8f5b" },
  { klasse: "II",  bezeichnung: "A+ bis A-",   pd_von: 0.04,  pd_bis: 0.11,  farbe: "#2f8f5b" },
  { klasse: "III", bezeichnung: "BBB+ bis BBB-", pd_von: 0.11, pd_bis: 0.39, farbe: "#76903c" },
  { klasse: "IV",  bezeichnung: "BB+ bis BB-",   pd_von: 0.39, pd_bis: 1.40, farbe: "#b7791f" },
  { klasse: "V",   bezeichnung: "B+ bis B-",     pd_von: 1.40, pd_bis: 6.00, farbe: "#ad5e2a" },
  { klasse: "VI",  bezeichnung: "CCC bis C",     pd_von: 6.00, pd_bis: 100,  farbe: "#c23b3b" }
];

// =============================================================================
// Sparkassen-Skala (18 Klassen + 3 Ausfallklassen)
// =============================================================================

export const sparkassenSkala = [
  { klasse: "1",   pd: 0.01,  bezeichnung: "Hervorragend",      farbe: "#2f8f5b" },
  { klasse: "1a",  pd: 0.02,  bezeichnung: "Hervorragend",      farbe: "#2f8f5b" },
  { klasse: "1b",  pd: 0.03,  bezeichnung: "Sehr gut",          farbe: "#2f8f5b" },
  { klasse: "1c",  pd: 0.04,  bezeichnung: "Sehr gut",          farbe: "#2f8f5b" },
  { klasse: "2",   pd: 0.05,  bezeichnung: "Gut",               farbe: "#3a9a67" },
  { klasse: "3",   pd: 0.07,  bezeichnung: "Gut",               farbe: "#3a9a67" },
  { klasse: "4",   pd: 0.12,  bezeichnung: "Gut / Befriedigend", farbe: "#76903c" },
  { klasse: "5",   pd: 0.20,  bezeichnung: "Befriedigend",      farbe: "#76903c" },
  { klasse: "6",   pd: 0.35,  bezeichnung: "Befriedigend",      farbe: "#8ea652" },
  { klasse: "7",   pd: 0.55,  bezeichnung: "Noch befriedigend", farbe: "#c48c2b" },
  { klasse: "8",   pd: 0.85,  bezeichnung: "Ausreichend",       farbe: "#b7791f" },
  { klasse: "9",   pd: 1.35,  bezeichnung: "Ausreichend",       farbe: "#b7791f" },
  { klasse: "10",  pd: 2.00,  bezeichnung: "Mangelhaft",        farbe: "#ad5e2a" },
  { klasse: "11",  pd: 3.00,  bezeichnung: "Mangelhaft",        farbe: "#ad5e2a" },
  { klasse: "12",  pd: 5.00,  bezeichnung: "Mangelhaft",        farbe: "#c94b4b" },
  { klasse: "13",  pd: 8.00,  bezeichnung: "Ungenuegend",       farbe: "#c23b3b" },
  { klasse: "14",  pd: 11.00, bezeichnung: "Ungenuegend",       farbe: "#c23b3b" },
  { klasse: "15",  pd: 15.00, bezeichnung: "Ungenuegend",       farbe: "#c23b3b" },
  // Ausfallklassen
  { klasse: "16",  pd: 100,   bezeichnung: "Ausfall (drohend)",       farbe: "#9d2f2f", ausfall: true },
  { klasse: "17",  pd: 100,   bezeichnung: "Ausfall (eingetreten)",   farbe: "#7d2727", ausfall: true },
  { klasse: "18",  pd: 100,   bezeichnung: "Ausfall (abzuwickeln)",   farbe: "#622020", ausfall: true }
];

// =============================================================================
// VR-Rating-Skala (16 Klassen + Ausfallklassen)
// =============================================================================

export const vrSkala = [
  { klasse: "0a",  pd: 0.01,  bezeichnung: "Erstklassig",            farbe: "#2f8f5b" },
  { klasse: "0b",  pd: 0.02,  bezeichnung: "Erstklassig",            farbe: "#2f8f5b" },
  { klasse: "0c",  pd: 0.03,  bezeichnung: "Erstklassig",            farbe: "#2f8f5b" },
  { klasse: "0d",  pd: 0.05,  bezeichnung: "Sehr gut",               farbe: "#3a9a67" },
  { klasse: "0e",  pd: 0.07,  bezeichnung: "Sehr gut",               farbe: "#3a9a67" },
  { klasse: "1a",  pd: 0.10,  bezeichnung: "Gut",                    farbe: "#76903c" },
  { klasse: "1b",  pd: 0.15,  bezeichnung: "Gut",                    farbe: "#76903c" },
  { klasse: "1c",  pd: 0.23,  bezeichnung: "Gut / Befriedigend",     farbe: "#76903c" },
  { klasse: "1d",  pd: 0.35,  bezeichnung: "Befriedigend",           farbe: "#8ea652" },
  { klasse: "1e",  pd: 0.55,  bezeichnung: "Befriedigend",           farbe: "#c48c2b" },
  { klasse: "2a",  pd: 0.85,  bezeichnung: "Noch befriedigend",      farbe: "#b7791f" },
  { klasse: "2b",  pd: 1.35,  bezeichnung: "Ausreichend",            farbe: "#b7791f" },
  { klasse: "2c",  pd: 2.50,  bezeichnung: "Mangelhaft",             farbe: "#ad5e2a" },
  { klasse: "2d",  pd: 5.00,  bezeichnung: "Mangelhaft",             farbe: "#c94b4b" },
  { klasse: "2e",  pd: 10.00, bezeichnung: "Ungenuegend",            farbe: "#c23b3b" },
  { klasse: "3",   pd: 20.00, bezeichnung: "Ungenuegend (kritisch)", farbe: "#c23b3b" },
  // Ausfallklassen
  { klasse: "IV",  pd: 100,   bezeichnung: "Ausfall",                farbe: "#9d2f2f", ausfall: true }
];

// =============================================================================
// Score-zu-Rating Umrechnung
// =============================================================================

/**
 * Rechnet einen numerischen Score (0-100) in eine Sparkassen-Ratingklasse um.
 * Score 100 = bestes Rating, Score 0 = schlechtestes Rating.
 *
 * @param {number} score - Numerischer Score zwischen 0 und 100
 * @returns {{ klasse: string, bezeichnung: string, pd: number, farbe: string }}
 */
export const scoreToRating = (score) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Mapping: Score-Bereiche zu Sparkassen-Klassen (absteigend)
  const scoreMap = [
    { minScore: 97, klasse: "1"  },
    { minScore: 94, klasse: "1a" },
    { minScore: 91, klasse: "1b" },
    { minScore: 88, klasse: "1c" },
    { minScore: 84, klasse: "2"  },
    { minScore: 80, klasse: "3"  },
    { minScore: 75, klasse: "4"  },
    { minScore: 70, klasse: "5"  },
    { minScore: 65, klasse: "6"  },
    { minScore: 59, klasse: "7"  },
    { minScore: 53, klasse: "8"  },
    { minScore: 46, klasse: "9"  },
    { minScore: 39, klasse: "10" },
    { minScore: 32, klasse: "11" },
    { minScore: 25, klasse: "12" },
    { minScore: 18, klasse: "13" },
    { minScore: 11, klasse: "14" },
    { minScore: 5,  klasse: "15" },
    { minScore: 3,  klasse: "16" },
    { minScore: 1,  klasse: "17" },
    { minScore: 0,  klasse: "18" }
  ];

  const match = scoreMap.find((entry) => clampedScore >= entry.minScore);
  const klasse = match ? match.klasse : "18";

  return sparkassenSkala.find((s) => s.klasse === klasse) || sparkassenSkala[sparkassenSkala.length - 1];
};

// =============================================================================
// Rating-zu-PD Umrechnung
// =============================================================================

/**
 * Gibt die Ausfallwahrscheinlichkeit (PD) fuer eine gegebene Ratingklasse zurueck.
 * Unterstuetzt alle drei Skalen.
 *
 * @param {string} ratingKlasse - Die Ratingklasse (z.B. "1a", "0b", "III")
 * @param {"sparkassen"|"vr"|"ifd"} [skala="sparkassen"] - Welche Skala verwendet werden soll
 * @returns {number|null} Ausfallwahrscheinlichkeit in Prozent oder null bei ungueltiger Klasse
 */
export const ratingToPD = (ratingKlasse, skala = "sparkassen") => {
  let scale;
  switch (skala) {
    case "sparkassen":
      scale = sparkassenSkala;
      break;
    case "vr":
      scale = vrSkala;
      break;
    case "ifd": {
      const found = ifdMasterskala.find((entry) => entry.klasse === ratingKlasse);
      if (!found) return null;
      // Rueckgabe des Mittelwerts des PD-Intervalls
      return found.pd_bis < 100
        ? parseFloat(((found.pd_von + found.pd_bis) / 2).toFixed(4))
        : found.pd_von;
    }
    default:
      return null;
  }

  const found = scale.find((entry) => entry.klasse === ratingKlasse);
  return found ? found.pd : null;
};

// =============================================================================
// Sparkassen-Klasse -> IFD-Masterskala Zuordnung
// =============================================================================

/**
 * Ordnet eine Sparkassen-Ratingklasse der entsprechenden IFD-Masterklasse zu.
 *
 * @param {string} sparkassenKlasse - Die Sparkassen-Klasse (z.B. "5", "10")
 * @returns {{ klasse: string, bezeichnung: string } | null}
 */
export const sparkasseToIFD = (sparkassenKlasse) => {
  const entry = sparkassenSkala.find((s) => s.klasse === sparkassenKlasse);
  if (!entry) return null;

  const ifd = ifdMasterskala.find(
    (m) => entry.pd >= m.pd_von && entry.pd < m.pd_bis
  );

  return ifd || ifdMasterskala[ifdMasterskala.length - 1];
};

// =============================================================================
// VR-Klasse -> IFD-Masterskala Zuordnung
// =============================================================================

/**
 * Ordnet eine VR-Ratingklasse der entsprechenden IFD-Masterklasse zu.
 *
 * @param {string} vrKlasse - Die VR-Klasse (z.B. "1a", "2c")
 * @returns {{ klasse: string, bezeichnung: string } | null}
 */
export const vrToIFD = (vrKlasse) => {
  const entry = vrSkala.find((s) => s.klasse === vrKlasse);
  if (!entry) return null;

  const ifd = ifdMasterskala.find(
    (m) => entry.pd >= m.pd_von && entry.pd < m.pd_bis
  );

  return ifd || ifdMasterskala[ifdMasterskala.length - 1];
};

// =============================================================================
// Farbe fuer PD-Wert
// =============================================================================

/**
 * Gibt eine Ampelfarbe fuer einen gegebenen PD-Wert zurueck.
 *
 * @param {number} pd - Ausfallwahrscheinlichkeit in Prozent
 * @returns {string} Hex-Farbwert
 */
export const pdToColor = (pd) => {
  if (pd <= 0.04) return "#2f8f5b";
  if (pd <= 0.11) return "#2f8f5b";
  if (pd <= 0.39) return "#76903c";
  if (pd <= 1.40) return "#b7791f";
  if (pd <= 6.00) return "#ad5e2a";
  return "#c23b3b";
};
