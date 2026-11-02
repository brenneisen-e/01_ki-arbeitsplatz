// PowerPoint-Export im Whitelabel-Layout (orientiert an klassischen
// Banken-Reporting-Decks). Nutzt pptxgenjs für die Slide-Generierung.
//
// Deck-Struktur:
//   1. Titel
//   2. Management Summary (Ampel-Status, Top-3 rot/grün, Key Takeaways)
//   3. KPI-Matrix (Ist/Plan über alle Segmente)
//   4. KPI-Cockpit – Line-Charts je KPI-Gruppe (Konzern-Sicht)
//   5. Deep Dive – eine Folie pro KPI (Chart + Werte + KI-Erläuterung)
//   6. KI-Kommentar (eine Folie pro Bullet, Externe / Interne Effekte)
//   7. Top-Auffälligkeiten (Heatmap-Tabelle nach Abweichung)

import PptxGenJS from 'pptxgenjs';
import {
  SEGMENTS, KPI_GROUPS, KPI_VALUES,
  deviationPct, ampelColor, getReportDate, buildHistory,
} from '../data/kpiData';
import { buildKommentarPlainText, explainKpiSegment } from '../data/aiAnalyse';

const AMPEL_HEX = {
  green:  '16A34A',
  yellow: 'F59E0B',
  red:    'DC2626',
  gray:   '94A3B8',
};

function hex(c) { return c.replace('#', '').toUpperCase(); }

function fmtCellValue(value, unit) {
  if (value === null || value === undefined) return '–';
  if (unit === '%') {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  }
  return value.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

function fmtIstPlan(cell, unit) {
  if (!cell) return '–';
  const suffix = unit === 'MEUR' ? ' Mio €' : '';
  return fmtCellValue(cell.ist, unit) + suffix;
}

function stripMarkup(s) {
  return String(s || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[(?:red|amber|yellow|green|blue|violet|rose|slate):(.+?)\]/g, '$1');
}

export async function exportPpt(bank) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
  pptx.title = `Banken-KPI ${bank.name} – ${getReportDate()}`;
  pptx.subject = 'Monatlicher KPI-Bericht (Whitelabel-Demo)';
  pptx.company = bank.name;

  const PRIMARY = hex(bank.primary);
  const PRIMARY_LIGHT = hex(bank.primaryLight);
  const TEXT_DARK = '0F172A';
  const TEXT_GRAY = '64748B';
  const BG_LIGHT = 'F8FAFC';
  const BORDER = 'E2E8F0';

  // ─── Master / Folienvorlage ──────────────────────────────
  pptx.defineSlideMaster({
    title: 'BANKEN_KPI_MASTER',
    background: { color: 'FFFFFF' },
    objects: [
      { rect: { x: 0, y: 0, w: 13.33, h: 0.55, fill: { color: PRIMARY } } },
      { rect: { x: 0, y: 0.55, w: 0.12, h: 6.95, fill: { color: PRIMARY_LIGHT } } },
      { line: { x: 0.5, y: 7.15, w: 12.33, h: 0, line: { color: BORDER, width: 0.5 } } },
      {
        text: {
          text: bank.name + ' · KPI Dashboard · gem. XYZ-Meldung',
          options: { x: 0.5, y: 0.08, w: 9, h: 0.4, fontSize: 13, color: 'FFFFFF', fontFace: 'Aptos', bold: true, valign: 'middle' },
        },
      },
      {
        text: {
          text: 'Stand: ' + getReportDate(),
          options: { x: 9.5, y: 0.08, w: 3.33, h: 0.4, fontSize: 11, color: 'FFFFFF', fontFace: 'Aptos', align: 'right', valign: 'middle' },
        },
      },
      {
        text: {
          text: 'Vertraulich · Demo-Daten · Whitelabel',
          options: { x: 0.5, y: 7.18, w: 9, h: 0.25, fontSize: 9, color: TEXT_GRAY, fontFace: 'Aptos', italic: true, valign: 'middle' },
        },
      },
    ],
    slideNumber: { x: 12.7, y: 7.18, w: 0.5, h: 0.25, fontSize: 9, color: TEXT_GRAY, fontFace: 'Aptos', align: 'right' },
  });

  // ═══ SLIDE 1: Titel ═══════════════════════════════════════
  const sTitle = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
  sTitle.addShape('rect', { x: 0.5, y: 1.2, w: 12.33, h: 5.4, fill: { color: BG_LIGHT }, line: { color: BORDER, width: 0.5 } });
  sTitle.addText('Monatlicher Bericht', { x: 1.0, y: 1.8, w: 11, h: 0.5, fontSize: 16, color: TEXT_GRAY, fontFace: 'Aptos', bold: true });
  sTitle.addText('KPI Dashboard', { x: 1.0, y: 2.3, w: 11, h: 1.0, fontSize: 48, color: PRIMARY, fontFace: 'Aptos', bold: true });
  sTitle.addText(bank.name, { x: 1.0, y: 3.4, w: 11, h: 0.7, fontSize: 28, color: TEXT_DARK, fontFace: 'Aptos' });
  sTitle.addText(`Stand: ${getReportDate()} · gem. XYZ-Meldung`, { x: 1.0, y: 4.2, w: 11, h: 0.4, fontSize: 14, color: TEXT_GRAY, fontFace: 'Aptos' });
  // 4 Kennzahlen-Tiles
  const heroKpis = [
    { id: 'neugeschaeft', label: 'Neugeschäft' },
    { id: 'aktivvolumen', label: 'Aktivvolumen' },
    { id: 'roRac',        label: 'RoRaC' },
    { id: 'cir',          label: 'Cost/Income' },
  ];
  heroKpis.forEach((hk, i) => {
    const cell = KPI_VALUES[hk.id]?.konzern;
    if (!cell) return;
    const x = 1.0 + i * 2.85;
    sTitle.addShape('rect', { x, y: 5.0, w: 2.6, h: 1.4, fill: { color: 'FFFFFF' }, line: { color: BORDER, width: 0.5 } });
    sTitle.addText(hk.label, { x: x + 0.15, y: 5.1, w: 2.4, h: 0.3, fontSize: 11, color: TEXT_GRAY, fontFace: 'Aptos', bold: true });
    const unit = (hk.id === 'roRac' || hk.id === 'cir') ? '%' : 'MEUR';
    sTitle.addText(fmtCellValue(cell.ist, unit) + (unit === 'MEUR' ? ' Mio €' : ''), { x: x + 0.15, y: 5.45, w: 2.4, h: 0.55, fontSize: 22, color: PRIMARY, fontFace: 'Aptos', bold: true });
    sTitle.addText('Plan: ' + fmtCellValue(cell.plan, unit) + (unit === 'MEUR' ? ' Mio €' : ''), { x: x + 0.15, y: 6.0, w: 2.4, h: 0.3, fontSize: 10, color: TEXT_GRAY, fontFace: 'Aptos' });
  });

  // ═══ SLIDE 2: Management Summary ══════════════════════════
  const sMgmt = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
  sMgmt.addText('Management Summary', { x: 0.5, y: 0.7, w: 12.33, h: 0.4, fontSize: 22, color: TEXT_DARK, fontFace: 'Aptos', bold: true });
  sMgmt.addText('Konzern-Ampelstatus, Top-Auffälligkeiten und Kernaussagen für den Steuerungskreis', {
    x: 0.5, y: 1.15, w: 12.33, h: 0.3, fontSize: 11, color: TEXT_GRAY, fontFace: 'Aptos', italic: true,
  });

  // Ampel-Zähler über Konzern + alle Segmente
  let cntGreen = 0, cntYellow = 0, cntRed = 0;
  KPI_GROUPS.forEach((group) => {
    group.kpis.forEach((k) => {
      SEGMENTS.forEach((seg) => {
        const cell = KPI_VALUES[k.id]?.[seg.id];
        if (!cell) return;
        const a = ampelColor(cell.ist, cell.plan, k.invertTrend);
        if (a === 'green') cntGreen++;
        else if (a === 'yellow') cntYellow++;
        else if (a === 'red') cntRed++;
      });
    });
  });
  const totalCount = cntGreen + cntYellow + cntRed;
  const ampelTiles = [
    { color: AMPEL_HEX.green,  label: 'im Plan',     count: cntGreen,  pct: cntGreen / totalCount },
    { color: AMPEL_HEX.yellow, label: 'unter Plan',  count: cntYellow, pct: cntYellow / totalCount },
    { color: AMPEL_HEX.red,    label: 'kritisch',    count: cntRed,    pct: cntRed / totalCount },
  ];
  ampelTiles.forEach((t, i) => {
    const tx = 0.5 + i * 4.15;
    sMgmt.addShape('rect', { x: tx, y: 1.65, w: 3.95, h: 1.1, fill: { color: 'FFFFFF' }, line: { color: BORDER, width: 0.5 } });
    sMgmt.addShape('rect', { x: tx, y: 1.65, w: 0.12, h: 1.1, fill: { color: t.color }, line: { color: t.color, width: 0 } });
    sMgmt.addText(String(t.count), { x: tx + 0.25, y: 1.7, w: 1.3, h: 0.7, fontSize: 32, color: t.color, fontFace: 'Aptos', bold: true });
    sMgmt.addText(t.label, { x: tx + 1.6, y: 1.78, w: 2.3, h: 0.3, fontSize: 12, color: TEXT_DARK, fontFace: 'Aptos', bold: true });
    sMgmt.addText(`${(t.pct * 100).toFixed(0)} % aller KPI-Zellen`, { x: tx + 1.6, y: 2.1, w: 2.3, h: 0.3, fontSize: 10, color: TEXT_GRAY, fontFace: 'Aptos' });
  });

  // Top-3 negativ + Top-3 positiv
  const allCells = [];
  KPI_GROUPS.forEach((group) => group.kpis.forEach((k) => {
    SEGMENTS.forEach((seg) => {
      const cell = KPI_VALUES[k.id]?.[seg.id];
      if (!cell) return;
      const dev = deviationPct(cell.ist, cell.plan, k.invertTrend);
      if (dev === null) return;
      allCells.push({ k, seg, cell, dev, ampel: ampelColor(cell.ist, cell.plan, k.invertTrend) });
    });
  }));
  const top3Red = allCells.filter((x) => x.ampel === 'red').sort((a, b) => Math.abs(b.dev) - Math.abs(a.dev)).slice(0, 3);
  const top3Green = allCells.filter((x) => x.ampel === 'green').sort((a, b) => b.dev - a.dev).slice(0, 3);

  // Linke Spalte: Top kritische
  sMgmt.addText('Top kritische Abweichungen', { x: 0.5, y: 3.0, w: 6.0, h: 0.3, fontSize: 12, color: AMPEL_HEX.red, fontFace: 'Aptos', bold: true });
  if (top3Red.length === 0) {
    sMgmt.addText('Keine kritischen Abweichungen.', { x: 0.5, y: 3.35, w: 6.0, h: 0.4, fontSize: 11, color: TEXT_GRAY, fontFace: 'Aptos', italic: true });
  } else {
    top3Red.forEach((row, i) => {
      const ry = 3.35 + i * 0.85;
      sMgmt.addShape('rect', { x: 0.5, y: ry, w: 6.0, h: 0.75, fill: { color: 'FEF2F2' }, line: { color: 'FECACA', width: 0.5 } });
      sMgmt.addText(`${row.k.label} – ${row.seg.label}`, { x: 0.65, y: ry + 0.06, w: 4.5, h: 0.3, fontSize: 11, color: TEXT_DARK, fontFace: 'Aptos', bold: true });
      sMgmt.addText(`Ist ${fmtCellValue(row.cell.ist, row.k.unit)} · Plan ${fmtCellValue(row.cell.plan, row.k.unit)}`, { x: 0.65, y: ry + 0.36, w: 4.5, h: 0.3, fontSize: 10, color: TEXT_GRAY, fontFace: 'Aptos' });
      sMgmt.addText((row.dev >= 0 ? '+' : '') + row.dev.toFixed(1) + ' %', { x: 4.9, y: ry + 0.18, w: 1.5, h: 0.4, fontSize: 16, color: AMPEL_HEX.red, fontFace: 'Aptos', bold: true, align: 'right' });
    });
  }

  // Rechte Spalte: Stabil im Plan
  sMgmt.addText('Stabil im Plan', { x: 6.85, y: 3.0, w: 6.0, h: 0.3, fontSize: 12, color: AMPEL_HEX.green, fontFace: 'Aptos', bold: true });
  if (top3Green.length === 0) {
    sMgmt.addText('Keine Segmente klar im Plan.', { x: 6.85, y: 3.35, w: 6.0, h: 0.4, fontSize: 11, color: TEXT_GRAY, fontFace: 'Aptos', italic: true });
  } else {
    top3Green.forEach((row, i) => {
      const ry = 3.35 + i * 0.85;
      sMgmt.addShape('rect', { x: 6.85, y: ry, w: 6.0, h: 0.75, fill: { color: 'F0FDF4' }, line: { color: 'BBF7D0', width: 0.5 } });
      sMgmt.addText(`${row.k.label} – ${row.seg.label}`, { x: 7.0, y: ry + 0.06, w: 4.5, h: 0.3, fontSize: 11, color: TEXT_DARK, fontFace: 'Aptos', bold: true });
      sMgmt.addText(`Ist ${fmtCellValue(row.cell.ist, row.k.unit)} · Plan ${fmtCellValue(row.cell.plan, row.k.unit)}`, { x: 7.0, y: ry + 0.36, w: 4.5, h: 0.3, fontSize: 10, color: TEXT_GRAY, fontFace: 'Aptos' });
      sMgmt.addText((row.dev >= 0 ? '+' : '') + row.dev.toFixed(1) + ' %', { x: 11.25, y: ry + 0.18, w: 1.5, h: 0.4, fontSize: 16, color: AMPEL_HEX.green, fontFace: 'Aptos', bold: true, align: 'right' });
    });
  }

  // Key Takeaways (Top-Bullets aus KI-Kommentar)
  const bullets = buildKommentarPlainText();
  const ktY = 5.95;
  sMgmt.addText('Kernaussagen', { x: 0.5, y: ktY, w: 12.33, h: 0.3, fontSize: 12, color: TEXT_DARK, fontFace: 'Aptos', bold: true });
  const takeaways = bullets.slice(0, 3).map((b) => '· ' + b.headline + ' – ' + b.text).join('\n');
  sMgmt.addText(takeaways, { x: 0.5, y: ktY + 0.3, w: 12.33, h: 0.85, fontSize: 10.5, color: '334155', fontFace: 'Aptos', paraSpaceAfter: 4 });

  // ═══ SLIDE 3: KPI-Matrix ══════════════════════════════════
  const sMatrix = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
  sMatrix.addText('KPI-Matrix · Ist vs. Plan', { x: 0.5, y: 0.7, w: 12.33, h: 0.4, fontSize: 18, color: TEXT_DARK, fontFace: 'Aptos', bold: true });

  const headerRow = [
    { text: 'Zielgröße', options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY } } },
    { text: 'Einheit',   options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY } } },
  ];
  SEGMENTS.forEach((s) => {
    headerRow.push({ text: s.label, options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY }, align: 'center' } });
  });

  const rows = [headerRow];
  KPI_GROUPS.forEach((group) => {
    rows.push([{
      text: group.label,
      options: { bold: true, italic: true, color: TEXT_GRAY, fill: { color: BG_LIGHT }, colspan: 2 + SEGMENTS.length },
    }]);
    group.kpis.forEach((k) => {
      const row = [
        { text: k.label, options: { bold: true, color: TEXT_DARK } },
        { text: k.unit, options: { color: TEXT_GRAY, align: 'center' } },
      ];
      SEGMENTS.forEach((seg) => {
        const cell = KPI_VALUES[k.id]?.[seg.id];
        if (!cell) {
          row.push({ text: '–', options: { color: TEXT_GRAY, align: 'right' } });
          return;
        }
        const ampel = ampelColor(cell.ist, cell.plan, k.invertTrend);
        row.push({
          text: fmtCellValue(cell.ist, k.unit) + ' / ' + fmtCellValue(cell.plan, k.unit),
          options: {
            color: TEXT_DARK,
            align: 'right',
            fill: { color: ampel === 'red' ? 'FEE2E2' : ampel === 'yellow' ? 'FEF3C7' : ampel === 'green' ? 'DCFCE7' : 'FFFFFF' },
          },
        });
      });
      rows.push(row);
    });
  });

  sMatrix.addTable(rows, { x: 0.5, y: 1.2, w: 12.33, fontSize: 8.5, fontFace: 'Aptos', border: { type: 'solid', color: BORDER, pt: 0.5 }, rowH: 0.28 });
  sMatrix.addText('Legende: ≥ 100 % im Plan · 95–99 % unter Plan · < 95 % kritisch', { x: 0.5, y: 6.85, w: 12.33, h: 0.3, fontSize: 9, color: TEXT_GRAY, fontFace: 'Aptos', italic: true });

  // ═══ SLIDES: KPI-Cockpit (Charts je Gruppe) ═══════════════
  // Eine Folie pro KPI-Gruppe mit allen KPIs der Gruppe als Line-Chart.
  KPI_GROUPS.forEach((group) => {
    const slide = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
    slide.addText(`KPI-Cockpit · ${group.label}`, { x: 0.5, y: 0.7, w: 12.33, h: 0.4, fontSize: 18, color: TEXT_DARK, fontFace: 'Aptos', bold: true });
    slide.addText('Konzern · 12-Monats-Verlauf · Ist vs. Plan', { x: 0.5, y: 1.1, w: 12.33, h: 0.3, fontSize: 11, color: TEXT_GRAY, fontFace: 'Aptos', italic: true });

    // 2x2 Grid (max 4 KPIs je Gruppe; bei >4 nur die ersten 4)
    const kpis = group.kpis.slice(0, 4);
    const cols = kpis.length === 1 ? 1 : 2;
    const rowsCount = Math.ceil(kpis.length / cols);
    const gap = 0.25;
    const gridW = 12.33;
    const gridX = 0.5;
    const gridY = 1.55;
    const gridH = 5.3;
    const cellW = (gridW - (cols - 1) * gap) / cols;
    const cellH = (gridH - (rowsCount - 1) * gap) / rowsCount;

    kpis.forEach((k, idx) => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const cx = gridX + c * (cellW + gap);
      const cy = gridY + r * (cellH + gap);
      const cell = KPI_VALUES[k.id]?.konzern;
      const history = buildHistory(k.id, 'konzern');
      const ampel = cell ? ampelColor(cell.ist, cell.plan, k.invertTrend) : 'gray';
      const ampelHex = AMPEL_HEX[ampel];

      // Card
      slide.addShape('rect', { x: cx, y: cy, w: cellW, h: cellH, fill: { color: 'FFFFFF' }, line: { color: BORDER, width: 0.5 } });
      slide.addShape('rect', { x: cx, y: cy, w: cellW, h: 0.08, fill: { color: ampelHex }, line: { color: ampelHex, width: 0 } });

      // Title
      slide.addText(k.label, { x: cx + 0.2, y: cy + 0.18, w: cellW - 0.4, h: 0.3, fontSize: 12, color: TEXT_DARK, fontFace: 'Aptos', bold: true });
      // Ist value
      const dev = cell ? deviationPct(cell.ist, cell.plan, k.invertTrend) : null;
      slide.addText(fmtCellValue(cell?.ist, k.unit) + (k.unit === 'MEUR' ? ' Mio €' : ''), { x: cx + 0.2, y: cy + 0.5, w: cellW * 0.6, h: 0.4, fontSize: 18, color: PRIMARY, fontFace: 'Aptos', bold: true });
      slide.addText(`Plan ${fmtCellValue(cell?.plan, k.unit)}${k.unit === 'MEUR' ? ' Mio €' : ''}`, { x: cx + 0.2, y: cy + 0.92, w: cellW * 0.6, h: 0.25, fontSize: 9, color: TEXT_GRAY, fontFace: 'Aptos' });
      if (dev !== null) {
        slide.addText((dev >= 0 ? '+' : '') + dev.toFixed(2) + ' %', { x: cx + cellW * 0.55, y: cy + 0.55, w: cellW * 0.42, h: 0.35, fontSize: 14, color: ampelHex, fontFace: 'Aptos', bold: true, align: 'right' });
        slide.addText('vs. Plan', { x: cx + cellW * 0.55, y: cy + 0.92, w: cellW * 0.42, h: 0.25, fontSize: 9, color: TEXT_GRAY, fontFace: 'Aptos', align: 'right' });
      }

      // Line chart
      const chartY = cy + 1.25;
      const chartH = cellH - 1.4;
      slide.addChart(pptx.ChartType.line, [
        { name: 'Ist',  labels: history.map((h) => h.month), values: history.map((h) => h.ist) },
        { name: 'Plan', labels: history.map((h) => h.month), values: history.map((h) => h.plan) },
      ], {
        x: cx + 0.15, y: chartY, w: cellW - 0.3, h: chartH,
        chartColors: [PRIMARY, '94A3B8'],
        showLegend: false,
        catAxisLabelFontSize: 8,
        valAxisLabelFontSize: 8,
        lineDataSymbol: 'none',
        lineSize: 2,
        lineSmooth: true,
      });
    });
  });

  // ═══ SLIDES: Deep Dive pro KPI ════════════════════════════
  const allKpis = KPI_GROUPS.flatMap((g) => g.kpis.map((k) => ({ ...k, group: g.label })));
  allKpis.forEach((k) => {
    const slide = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
    const cell = KPI_VALUES[k.id]?.konzern;
    if (!cell) return;
    const history = buildHistory(k.id, 'konzern');
    const ampel = ampelColor(cell.ist, cell.plan, k.invertTrend);
    const ampelHex = AMPEL_HEX[ampel];
    const dev = deviationPct(cell.ist, cell.plan, k.invertTrend);
    const ai = explainKpiSegment(k.id, 'konzern');

    slide.addText('Deep Dive', { x: 0.5, y: 0.7, w: 6, h: 0.3, fontSize: 12, color: TEXT_GRAY, fontFace: 'Aptos', bold: true });
    slide.addText(`${k.label} · Konzern`, { x: 0.5, y: 1.0, w: 12.33, h: 0.5, fontSize: 22, color: TEXT_DARK, fontFace: 'Aptos', bold: true });
    slide.addText(`${k.group} · gem. XYZ-Meldung`, { x: 0.5, y: 1.5, w: 12.33, h: 0.3, fontSize: 11, color: TEXT_GRAY, fontFace: 'Aptos', italic: true });

    // 3 Wert-Kacheln
    const tiles = [
      { label: 'Ist',         value: fmtCellValue(cell.ist, k.unit) + (k.unit === 'MEUR' ? ' Mio €' : ''),  color: PRIMARY },
      { label: 'Plan',        value: fmtCellValue(cell.plan, k.unit) + (k.unit === 'MEUR' ? ' Mio €' : ''), color: TEXT_DARK },
      { label: 'Abweichung',  value: (dev >= 0 ? '+' : '') + dev.toFixed(2) + ' %', color: ampelHex },
    ];
    tiles.forEach((t, i) => {
      const tx = 0.5 + i * 4.15;
      slide.addShape('rect', { x: tx, y: 1.95, w: 3.95, h: 0.95, fill: { color: BG_LIGHT }, line: { color: BORDER, width: 0.5 } });
      slide.addText(t.label, { x: tx + 0.2, y: 2.0, w: 3.55, h: 0.28, fontSize: 10, color: TEXT_GRAY, fontFace: 'Aptos', bold: true });
      slide.addText(t.value, { x: tx + 0.2, y: 2.28, w: 3.55, h: 0.55, fontSize: 22, color: t.color, fontFace: 'Aptos', bold: true });
    });

    // Chart links (12 Mo)
    slide.addText('12-Monats-Verlauf', { x: 0.5, y: 3.05, w: 7, h: 0.3, fontSize: 11, color: TEXT_GRAY, fontFace: 'Aptos', bold: true });
    slide.addChart(pptx.ChartType.line, [
      { name: 'Ist',  labels: history.map((h) => h.month), values: history.map((h) => h.ist) },
      { name: 'Plan', labels: history.map((h) => h.month), values: history.map((h) => h.plan) },
    ], {
      x: 0.5, y: 3.4, w: 6.5, h: 3.5,
      chartColors: [PRIMARY, '94A3B8'],
      showLegend: true, legendPos: 'b',
      catAxisLabelFontSize: 9,
      valAxisLabelFontSize: 9,
      lineDataSymbol: 'circle', lineDataSymbolSize: 4,
      lineSize: 2.25, lineSmooth: true,
    });

    // KI-Erläuterung rechts
    slide.addText('KI-Erläuterung · Externe / Interne Effekte', { x: 7.2, y: 3.05, w: 5.65, h: 0.3, fontSize: 11, color: TEXT_GRAY, fontFace: 'Aptos', bold: true });
    if (ai) {
      // Headline-Box (severity-getönt)
      const sevBg = ampel === 'red' ? 'FEF2F2' : ampel === 'yellow' ? 'FEFCE8' : 'F0FDF4';
      const sevBorder = ampel === 'red' ? 'FECACA' : ampel === 'yellow' ? 'FEF08A' : 'BBF7D0';
      slide.addShape('rect', { x: 7.2, y: 3.4, w: 5.65, h: 0.55, fill: { color: sevBg }, line: { color: sevBorder, width: 0.5 } });
      slide.addText(stripMarkup(ai.headline), { x: 7.3, y: 3.43, w: 5.45, h: 0.5, fontSize: 10, color: TEXT_DARK, fontFace: 'Aptos' });

      // Externe
      slide.addText('Externe Effekte', { x: 7.2, y: 4.05, w: 5.65, h: 0.25, fontSize: 9, color: TEXT_GRAY, fontFace: 'Aptos', bold: true });
      slide.addShape('rect', { x: 7.2, y: 4.3, w: 5.65, h: 1.25, fill: { color: BG_LIGHT }, line: { color: BORDER, width: 0.5 } });
      const extText = (ai.externalEffects || []).slice(0, 4).map((c) => '· ' + stripMarkup(c)).join('\n');
      slide.addText(extText || '–', { x: 7.3, y: 4.35, w: 5.45, h: 1.15, fontSize: 9, color: '334155', fontFace: 'Aptos', paraSpaceAfter: 2 });

      // Interne
      slide.addText('Interne Effekte', { x: 7.2, y: 5.65, w: 5.65, h: 0.25, fontSize: 9, color: PRIMARY, fontFace: 'Aptos', bold: true });
      slide.addShape('rect', { x: 7.2, y: 5.9, w: 5.65, h: 1.0, fill: { color: 'FFFFFF' }, line: { color: PRIMARY, width: 0.75 } });
      const intText = (ai.internalEffects || []).slice(0, 4).map((c) => '· ' + stripMarkup(c)).join('\n');
      slide.addText(intText || '–', { x: 7.3, y: 5.95, w: 5.45, h: 0.9, fontSize: 9, color: '334155', fontFace: 'Aptos', paraSpaceAfter: 2 });
    }
  });

  // ═══ SLIDES: KI-Kommentar (eine Folie pro Bullet) ═════════
  bullets.forEach((b, idx) => {
    const slide = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
    slide.addText('KI-Kommentar mit Querlogik', { x: 0.5, y: 0.7, w: 12.33, h: 0.4, fontSize: 18, color: TEXT_DARK, fontFace: 'Aptos', bold: true });
    slide.addText(`Bullet ${idx + 1} von ${bullets.length}`, { x: 0.5, y: 1.1, w: 12.33, h: 0.35, fontSize: 11, color: TEXT_GRAY, fontFace: 'Aptos', italic: true });

    const yStart = 1.55;
    const sevColor = AMPEL_HEX[b.severity] || AMPEL_HEX.gray;

    slide.addShape('rect', { x: 0.5, y: yStart, w: 0.12, h: 5.5, fill: { color: sevColor }, line: { color: sevColor, width: 0 } });
    slide.addText(b.headline, { x: 0.8, y: yStart, w: 12, h: 0.4, fontSize: 16, color: TEXT_DARK, fontFace: 'Aptos', bold: true });
    slide.addText(b.text, { x: 0.8, y: yStart + 0.45, w: 12, h: 0.6, fontSize: 11.5, color: '334155', fontFace: 'Aptos' });

    const colTop = yStart + 1.15;
    const colH = 3.4;
    const colW = 5.95;

    slide.addText('Externe Effekte', { x: 0.8, y: colTop, w: colW, h: 0.3, fontSize: 10, color: TEXT_GRAY, fontFace: 'Aptos', bold: true });
    slide.addShape('rect', { x: 0.8, y: colTop + 0.3, w: colW, h: colH, fill: { color: BG_LIGHT }, line: { color: BORDER, width: 0.5 } });
    slide.addText(b.externalEffects || '', { x: 0.95, y: colTop + 0.4, w: colW - 0.3, h: colH - 0.2, fontSize: 10.5, color: '334155', fontFace: 'Aptos', paraSpaceAfter: 4 });

    const rightX = 0.8 + colW + 0.2;
    slide.addText('Interne Effekte', { x: rightX, y: colTop, w: colW, h: 0.3, fontSize: 10, color: PRIMARY, fontFace: 'Aptos', bold: true });
    slide.addShape('rect', { x: rightX, y: colTop + 0.3, w: colW, h: colH, fill: { color: 'FFFFFF' }, line: { color: PRIMARY, width: 0.75 } });
    slide.addText(b.internalEffects || '', { x: rightX + 0.15, y: colTop + 0.4, w: colW - 0.3, h: colH - 0.2, fontSize: 10.5, color: '334155', fontFace: 'Aptos', paraSpaceAfter: 4 });

    const recoY = colTop + colH + 0.5;
    slide.addText('Handlungsempfehlung', { x: 0.8, y: recoY, w: 12, h: 0.3, fontSize: 10, color: TEXT_GRAY, fontFace: 'Aptos', bold: true });
    slide.addShape('rect', { x: 0.8, y: recoY + 0.3, w: 12, h: 0.5, fill: { color: BG_LIGHT }, line: { color: BORDER, width: 0.5 } });
    slide.addText(b.recommendation || '', { x: 0.95, y: recoY + 0.32, w: 11.7, h: 0.46, fontSize: 10.5, color: '334155', fontFace: 'Aptos' });
  });

  // ═══ SLIDE: Top-Auffälligkeiten ═══════════════════════════
  const sHeat = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
  sHeat.addText('Top-Auffälligkeiten – Heatmap nach Abweichung', { x: 0.5, y: 0.7, w: 12.33, h: 0.4, fontSize: 18, color: TEXT_DARK, fontFace: 'Aptos', bold: true });

  const heat = allCells.filter((x) => x.ampel === 'red').sort((a, b) => Math.abs(b.dev) - Math.abs(a.dev)).slice(0, 8);
  const heatHeader = [
    { text: 'Rang',     options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY }, align: 'center' } },
    { text: 'KPI',      options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY } } },
    { text: 'Segment',  options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY } } },
    { text: 'Ist',      options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY }, align: 'right' } },
    { text: 'Plan',     options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY }, align: 'right' } },
    { text: 'Abw.',     options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY }, align: 'right' } },
  ];
  const heatRows = [heatHeader];
  heat.forEach((row, i) => {
    heatRows.push([
      { text: String(i + 1), options: { align: 'center', color: TEXT_GRAY, bold: true } },
      { text: row.k.label, options: { color: TEXT_DARK, bold: true } },
      { text: row.seg.label, options: { color: TEXT_DARK } },
      { text: fmtCellValue(row.cell.ist, row.k.unit), options: { align: 'right', color: TEXT_DARK, fontFace: 'Consolas' } },
      { text: fmtCellValue(row.cell.plan, row.k.unit), options: { align: 'right', color: TEXT_GRAY, fontFace: 'Consolas' } },
      {
        text: (row.dev >= 0 ? '+' : '') + row.dev.toFixed(2) + ' %',
        options: { align: 'right', color: AMPEL_HEX.red, bold: true, fontFace: 'Consolas' },
      },
    ]);
  });
  if (heat.length === 0) {
    heatRows.push([{ text: 'Keine kritischen Abweichungen identifiziert.', options: { color: TEXT_GRAY, italic: true, align: 'center', colspan: 6 } }]);
  }
  sHeat.addTable(heatRows, { x: 0.5, y: 1.3, w: 12.33, fontSize: 11, fontFace: 'Aptos', border: { type: 'solid', color: BORDER, pt: 0.5 }, rowH: 0.4 });

  // ─── Datei speichern ─────────────────────────────────────
  const filename = `Banken-KPI_${bank.id}_${getReportDate().replace(/\./g, '-')}.pptx`;
  await pptx.writeFile({ fileName: filename });
}
