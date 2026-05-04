// KI-gestützte KPI-Erläuterung mit Querlogik.
// Statt eines tatsächlichen LLM-Aufrufs verwenden wir hier deterministische
// Regeln, die typische Analyseaussagen aus dem Vorbild-Bericht (NordLB) abbilden.
// So passen die Aussagen immer zu den im UI angezeigten Daten.

import { SEGMENTS, KPI_GROUPS, KPI_VALUES, deviationPct, ampelColor } from './kpiData';

function findKpi(kpiId) {
  for (const group of KPI_GROUPS) {
    const k = group.kpis.find((x) => x.id === kpiId);
    if (k) return k;
  }
  return null;
}

function fmtAbs(value, unit) {
  if (value === null || value === undefined) return '–';
  if (unit === '%') {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
  }
  if (unit === 'MEUR') {
    return value.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' Mio. €';
  }
  return value.toLocaleString('de-DE');
}

function fmtPct(v) {
  return (v >= 0 ? '+' : '') + v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %';
}

// Liste aller Segment-/KPI-Kombinationen mit Abweichungs-Score
function rankAbweichungen() {
  const out = [];
  for (const group of KPI_GROUPS) {
    for (const k of group.kpis) {
      for (const s of SEGMENTS) {
        const cell = KPI_VALUES[k.id]?.[s.id];
        if (!cell) continue;
        const dev = deviationPct(cell.ist, cell.plan, k.invertTrend);
        const ampel = ampelColor(cell.ist, cell.plan, k.invertTrend);
        if (dev === null) continue;
        out.push({
          kpi: k, segment: s, cell,
          dev, ampel,
          score: Math.abs(dev) * (ampel === 'red' ? 2 : ampel === 'yellow' ? 1.2 : 0.5),
        });
      }
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

// Erzeugt das narrative Kommentar-Set wie im PDF: ~4–6 Bullet-Points,
// die Querverbindungen herstellen.
export function buildKommentar() {
  const ranked = rankAbweichungen();
  const bullets = [];

  // 1. Konzern-Neugeschäft + Top-negativ-Segment im Neugeschäft
  const ngKonzern = KPI_VALUES.neugeschaeft.konzern;
  const ngKonzernDev = deviationPct(ngKonzern.ist, ngKonzern.plan, false);
  // schwächstes Segment beim Neugeschäft (außer Konzern selbst)
  const ngSegments = SEGMENTS.filter((s) => s.id !== 'konzern')
    .map((s) => {
      const c = KPI_VALUES.neugeschaeft[s.id];
      return { s, c, dev: deviationPct(c.ist, c.plan, false) };
    })
    .sort((a, b) => a.dev - b.dev);
  const ngWorst = ngSegments[0];
  bullets.push({
    headline: 'Neugeschäft Konzern',
    severity: ampelColor(ngKonzern.ist, ngKonzern.plan, false),
    text:
      `Das Neugeschäft im Konzern liegt mit ${fmtAbs(ngKonzern.ist, 'MEUR')} unter dem Planwert von ` +
      `${fmtAbs(ngKonzern.plan, 'MEUR')}, was einer Abweichung von ${fmtPct(ngKonzernDev)} entspricht. ` +
      (ngWorst.dev < ngKonzernDev
        ? `Besonders stark weicht der Bereich ${ngWorst.s.label} mit nur ${fmtAbs(ngWorst.c.ist, 'MEUR')} ` +
          `Neugeschäft von seinem Zielwert von ${fmtAbs(ngWorst.c.plan, 'MEUR')} (${fmtPct(ngWorst.dev)}) ab.`
        : ''),
  });

  // 2. Margenanalyse: Neugeschäftsmarge Structured Finance vs. Immobilienkunden
  const ngmStructured = KPI_VALUES.neugeschaeftsmarge.structured;
  const ngmImmo = KPI_VALUES.neugeschaeftsmarge.immobilien;
  const ngmStrDev = deviationPct(ngmStructured.ist, ngmStructured.plan, false);
  const ngmImmoDev = deviationPct(ngmImmo.ist, ngmImmo.plan, false);
  bullets.push({
    headline: 'Neugeschäftsmarge im Querschnitt',
    severity: ampelColor(ngmStructured.ist, ngmStructured.plan, false),
    text:
      `Die Neugeschäftsmarge im Bereich Structured Finance beträgt ` +
      `${fmtAbs(ngmStructured.ist, '%')} und liegt unter dem Planwert von ${fmtAbs(ngmStructured.plan, '%')}. ` +
      `Dies stellt eine negative Abweichung von ${fmtPct(ngmStrDev)} dar, ` +
      `während Immobilienkunden mit ${fmtAbs(ngmImmo.ist, '%')} (Plan: ${fmtAbs(ngmImmo.plan, '%')}) ` +
      `${fmtPct(ngmImmoDev)} ähnlich abschneiden.`,
  });

  // 3. CIR-Auffälligkeit: Privatkunden / Markets
  const cirPrivat = KPI_VALUES.cir.privatkunden;
  const cirPrivatDev = deviationPct(cirPrivat.ist, cirPrivat.plan, true);
  bullets.push({
    headline: 'Cost/Income Ratio – Effizienz',
    severity: ampelColor(cirPrivat.ist, cirPrivat.plan, true),
    text:
      `Der Bereich Privatkunden zeigt eine stark auffällige Abweichung bei der Cost/Income Ratio mit einem ` +
      `Ist-Wert von ${fmtAbs(cirPrivat.ist, '%')}, gegenüber einem Planwert von ${fmtAbs(cirPrivat.plan, '%')} ` +
      `(${fmtPct(-cirPrivatDev)} ggü. Plan). Dies weist auf Effizienzprobleme im Segment hin und korrespondiert ` +
      `mit der unterdurchschnittlichen RWA-Produktivität sowie der gedrückten Aktivmarge.`,
  });

  // 4. RoRaC Treasury vs. Structured (Querlogik)
  const rrTreasury = KPI_VALUES.roRac.treasury;
  const rrStructured = KPI_VALUES.roRac.structured;
  bullets.push({
    headline: 'RoRaC – Risikogetragene Profitabilität',
    severity: ampelColor(rrTreasury.ist, rrTreasury.plan, false),
    text:
      `Die RoRaC-Werte sind im Bereich Treasury mit einem negativen Wert von ${fmtAbs(rrTreasury.ist, '%')} ` +
      `alarmierend und stark unter dem Planwert von ${fmtAbs(rrTreasury.plan, '%')}, was ein Extremrisiko signalisiert. ` +
      `Im Gegensatz dazu entspricht Structured Finance mit ${fmtAbs(rrStructured.ist, '%')} dem Plan und zeigt eine stabile Performance.`,
  });

  // 5. RWA-Anstieg vs. Plan (Konzern) – als Kapitalbindungs-Hinweis
  const rwaKonzern = KPI_VALUES.rwa.konzern;
  const rwaDev = deviationPct(rwaKonzern.ist, rwaKonzern.plan, true);
  bullets.push({
    headline: 'RWA & Kapitalbindung',
    severity: ampelColor(rwaKonzern.ist, rwaKonzern.plan, true),
    text:
      `Die RWA des Konzerns liegen bei ${fmtAbs(rwaKonzern.ist, 'MEUR')} und damit über dem Planwert von ` +
      `${fmtAbs(rwaKonzern.plan, 'MEUR')} (${fmtPct(-rwaDev)}). In Verbindung mit der unter Plan liegenden ` +
      `Neugeschäftsmarge (${fmtAbs(KPI_VALUES.neugeschaeftsmarge.konzern.ist, '%')}) drückt dies die ` +
      `RWA-Produktivität auf ${fmtAbs(KPI_VALUES.rwaProd.konzern.ist, '%')} (Plan: ` +
      `${fmtAbs(KPI_VALUES.rwaProd.konzern.plan, '%')}).`,
  });

  // 6. Top-Risiko aus Ranking, sofern noch nicht abgedeckt
  const riskTop = ranked.find((r) =>
    r.ampel === 'red' &&
    !['neugeschaeft', 'cir', 'roRac', 'rwa'].includes(r.kpi.id),
  );
  if (riskTop) {
    bullets.push({
      headline: 'Weitere Auffälligkeit',
      severity: 'red',
      text:
        `${riskTop.kpi.label} im Bereich ${riskTop.segment.label} liegt bei ${fmtAbs(riskTop.cell.ist, riskTop.kpi.unit)} ` +
        `(Plan: ${fmtAbs(riskTop.cell.plan, riskTop.kpi.unit)}) – Abweichung ${fmtPct(riskTop.dev)}. ` +
        `Dieser Wert sollte im nächsten Steuerungskreis priorisiert besprochen werden.`,
    });
  }

  return bullets;
}

// Erläuterung pro KPI/Segment (für KPI-Detail-Modal)
export function explainKpiSegment(kpiId, segmentId) {
  const kpi = findKpi(kpiId);
  const segment = SEGMENTS.find((s) => s.id === segmentId);
  const cell = KPI_VALUES[kpiId]?.[segmentId];
  if (!kpi || !segment || !cell) return null;

  const dev = deviationPct(cell.ist, cell.plan, kpi.invertTrend);
  const ampel = ampelColor(cell.ist, cell.plan, kpi.invertTrend);

  // Querbezüge: bei Margen → korrespondierendes Volumen, bei Volumen → Marge
  const crossRefs = [];
  if (kpiId === 'aktivmarge') {
    const v = KPI_VALUES.aktivvolumen?.[segmentId];
    if (v) crossRefs.push(`Korrespondierendes Aktivvolumen: ${fmtAbs(v.ist, 'MEUR')} (Plan: ${fmtAbs(v.plan, 'MEUR')}).`);
  } else if (kpiId === 'aktivvolumen') {
    const m = KPI_VALUES.aktivmarge?.[segmentId];
    if (m) crossRefs.push(`Korrespondierende Aktivmarge: ${fmtAbs(m.ist, '%')} (Plan: ${fmtAbs(m.plan, '%')}).`);
  } else if (kpiId === 'einlagenmarge') {
    const v = KPI_VALUES.einlagenvolumen?.[segmentId];
    if (v) crossRefs.push(`Korrespondierendes Einlagenvolumen: ${fmtAbs(v.ist, 'MEUR')} (Plan: ${fmtAbs(v.plan, 'MEUR')}).`);
  } else if (kpiId === 'einlagenvolumen') {
    const m = KPI_VALUES.einlagenmarge?.[segmentId];
    if (m) crossRefs.push(`Korrespondierende Einlagenmarge: ${fmtAbs(m.ist, '%')} (Plan: ${fmtAbs(m.plan, '%')}).`);
  } else if (kpiId === 'rwaProd') {
    const ng = KPI_VALUES.neugeschaeftsmarge?.[segmentId];
    const rwa = KPI_VALUES.rwa?.[segmentId];
    if (ng) crossRefs.push(`Neugeschäftsmarge: ${fmtAbs(ng.ist, '%')} (Plan: ${fmtAbs(ng.plan, '%')}).`);
    if (rwa) crossRefs.push(`RWA: ${fmtAbs(rwa.ist, 'MEUR')} (Plan: ${fmtAbs(rwa.plan, 'MEUR')}).`);
  } else if (kpiId === 'roRac') {
    const cir = KPI_VALUES.cir?.[segmentId];
    if (cir) crossRefs.push(`Cost/Income Ratio: ${fmtAbs(cir.ist, '%')} (Plan: ${fmtAbs(cir.plan, '%')}).`);
  } else if (kpiId === 'cir') {
    const rrc = KPI_VALUES.roRac?.[segmentId];
    if (rrc) crossRefs.push(`RoRaC: ${fmtAbs(rrc.ist, '%')} (Plan: ${fmtAbs(rrc.plan, '%')}).`);
  } else if (kpiId === 'neugeschaeft') {
    const m = KPI_VALUES.neugeschaeftsmarge?.[segmentId];
    if (m) crossRefs.push(`Neugeschäftsmarge: ${fmtAbs(m.ist, '%')} (Plan: ${fmtAbs(m.plan, '%')}).`);
  } else if (kpiId === 'neugeschaeftsmarge') {
    const v = KPI_VALUES.neugeschaeft?.[segmentId];
    if (v) crossRefs.push(`Korrespondierendes Neugeschäft: ${fmtAbs(v.ist, 'MEUR')} (Plan: ${fmtAbs(v.plan, 'MEUR')}).`);
  }

  // Headline-Text
  let headline;
  if (ampel === 'green') {
    headline = `${kpi.label} im Segment ${segment.label} liegt mit ${fmtAbs(cell.ist, kpi.unit)} im Plan (${fmtAbs(cell.plan, kpi.unit)}, ${fmtPct(dev)}).`;
  } else if (ampel === 'yellow') {
    headline = `${kpi.label} im Segment ${segment.label} liegt bei ${fmtAbs(cell.ist, kpi.unit)} und damit leicht unter dem Plan von ${fmtAbs(cell.plan, kpi.unit)} (${fmtPct(dev)}).`;
  } else {
    headline = `${kpi.label} im Segment ${segment.label} weist mit ${fmtAbs(cell.ist, kpi.unit)} eine kritische Abweichung (${fmtPct(dev)}) gegenüber dem Plan von ${fmtAbs(cell.plan, kpi.unit)} auf.`;
  }

  // Empfehlung in Abhängigkeit des Ampelstatus
  let recommendation;
  if (ampel === 'green') {
    recommendation = 'Performance stabil – aktuelle Steuerungslogik beibehalten und auf andere Segmente skalieren.';
  } else if (ampel === 'yellow') {
    recommendation = 'Kurzfristige Maßnahmen prüfen, um Plan zu erreichen – z. B. Pricing-Anpassung oder Vertriebsfokus.';
  } else {
    recommendation = 'Eskalation in den Steuerungskreis – Ursachenanalyse, Margen-/Volumen-Hebel und Kapitalbindung gemeinsam betrachten.';
  }

  return { headline, ampel, dev, crossRefs, recommendation };
}

// Bullets als reiner Text (für PPT-/Print-Export ohne JSX)
export function buildKommentarPlainText() {
  return buildKommentar().map((b) => `${b.headline}: ${b.text}`);
}
