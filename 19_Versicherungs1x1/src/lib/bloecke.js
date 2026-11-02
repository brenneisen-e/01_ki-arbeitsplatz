// ===========================================================================
// bloecke.js — Blöcke einer Lerneinheit über die drei Tiefen hinweg.
//
// Tiefen heißen überall gleich: Basis · Vertiefung · Experte. Block-Kennungen
// sind `b0`, `b1`, … in der Reihenfolge level1 → level2 → level3 (so steht es
// in Deeplinks: #/kapitel/:k/:e/b12). Wer Blöcke rendert, setzt id={eintrag.id}.
// ===========================================================================

/** Die drei Tiefen in fester Reihenfolge — Wert, Anzeigename, Datenfeld. */
export const TIEFEN = [
  { wert: 'basis', label: 'Basis', stufe: 1, feld: 'level1', farbe: 'var(--tiefe-basis)' },
  { wert: 'vertiefung', label: 'Vertiefung', stufe: 2, feld: 'level2', farbe: 'var(--tiefe-vertiefung)' },
  { wert: 'experte', label: 'Experte', stufe: 3, feld: 'level3', farbe: 'var(--tiefe-experte)' },
];

/** Stufe (1|2|3) → Tiefenwert ('basis' | 'vertiefung' | 'experte'). */
export function tiefeFuerStufe(stufe) {
  return (TIEFEN.find((t) => t.stufe === stufe) || TIEFEN[0]).wert;
}

/** Tiefenwert → Stufe (1|2|3); unbekannt → 1. */
export function stufeFuerTiefe(tiefe) {
  return (TIEFEN.find((t) => t.wert === tiefe) || TIEFEN[0]).stufe;
}

/** Anzeigename einer Tiefe. */
export function tiefeLabel(tiefe) {
  return (TIEFEN.find((t) => t.wert === tiefe) || TIEFEN[0]).label;
}

/**
 * Nächste Tiefe im Kreis (für das Kürzel „t“). Ist eine Lerneinheit
 * mitgegeben, werden Tiefen übersprungen, die dort keinen Inhalt haben —
 * sonst wirkt die Taste zweimal nichts, weil die gespeicherte Tiefe zwar
 * weiterwandert, die Seite aber auf die höchste vorhandene zurückfällt
 * (Segmentschalter zeigt sie deshalb deaktiviert).
 * @param {string} tiefe
 * @param {object} [einheit]
 */
export function naechsteTiefe(tiefe, einheit) {
  const i = TIEFEN.findIndex((t) => t.wert === tiefe);
  for (let schritt = 1; schritt <= TIEFEN.length; schritt += 1) {
    const kandidat = TIEFEN[(i + schritt) % TIEFEN.length];
    if (!einheit || kandidat.stufe === 1 || hatTiefe(einheit, kandidat.wert)) return kandidat.wert;
  }
  return TIEFEN[0].wert;
}

/**
 * Alle Blöcke einer Einheit als Liste `{ block, tiefe: 1|2|3, id: 'b0'… }`,
 * Reihenfolge level1 → level2 → level3, Kennungen fortlaufend.
 * @param {object} einheit
 * @returns {Array<{ block: object, tiefe: 1|2|3, id: string, index: number }>}
 */
export function alleBloecke(einheit) {
  const liste = [];
  if (!einheit) return liste;
  let n = 0;
  for (const t of TIEFEN) {
    for (const block of einheit[t.feld] || []) {
      if (!block || typeof block !== 'object') continue;
      liste.push({ block, tiefe: t.stufe, id: `b${n}`, index: n });
      n += 1;
    }
  }
  return liste;
}

/** Blöcke bis einschließlich der gewählten Tiefe. */
export function sichtbareBloecke(einheit, tiefe = 'basis') {
  const stufe = stufeFuerTiefe(tiefe);
  return alleBloecke(einheit).filter((e) => e.tiefe <= stufe);
}

/** Enthält die Einheit Inhalt auf dieser Tiefe (level2 bzw. level3 nicht leer)? */
export function hatTiefe(einheit, tiefe) {
  const t = TIEFEN.find((x) => x.wert === tiefe);
  if (!t || !einheit) return false;
  return (einheit[t.feld] || []).length > 0;
}

/** Tiefe, die ein Block per Kennung braucht (für Deeplinks); unbekannt → null. */
export function tiefeFuerBlock(einheit, blockId) {
  const eintrag = alleBloecke(einheit).find((e) => e.id === blockId);
  return eintrag ? tiefeFuerStufe(eintrag.tiefe) : null;
}

const TYP_NAMEN = {
  paragraph: 'Absatz', table: 'Tabelle', comparisonTable: 'Vergleich', callout: 'Hinweis',
  chartLine: 'Diagramm', chartBar: 'Diagramm', chartDonut: 'Diagramm', timeline: 'Zeitleiste',
  infoKachelGrid: 'Überblick', heatmapGrid: 'Heatmap', regulatoryPyramid: 'Regulatorische Ebenen',
  valueChain: 'Wertschöpfungskette', combinedRatioCalc: 'Combined-Ratio-Rechner',
  provisionCalc: 'Provisionsrechner', trendRadar: 'Trend-Radar', networkGraph: 'Netzwerk',
  decisionTree: 'Entscheidungsbaum', sankey: 'Flussdiagramm',
  // Grafiken des Sektortrainings
  archetypenKarte: 'Archetypen', stufenTabelle: 'Rechenschema',
  morphologischerKasten: 'Einordnung', formelAufbau: 'Formel',
  simulationGrosseZahlen: 'Simulation', risikokette: 'Risikokette',
  prozessKette: 'Wertschöpfungskette',
};

/**
 * Titel eines Blocks für Inhaltsverzeichnis und Suche: `title`, sonst
 * `caption`, sonst ein Typname („Tabelle“). Nie leer.
 * @param {object} block
 */
export function blockTitel(block) {
  if (!block) return '';
  const t = block.title || block.caption;
  if (typeof t === 'string' && t.trim()) return t.trim();
  return TYP_NAMEN[block.type] || 'Abschnitt';
}

/** Hat der Block einen eigenen (redaktionellen) Titel? */
export function hatEigenenTitel(block) {
  return Boolean(block && typeof (block.title || block.caption) === 'string' && (block.title || block.caption).trim());
}
