// PowerPoint-Export im Whitelabel-Layout (orientiert an klassischen
// Banken-Reporting-Decks). Bewusst neutral gehalten, ohne ERGO-spezifische
// Brandings. Nutzt pptxgenjs für die Slide-Generierung im Browser.

import PptxGenJS from 'pptxgenjs';
import {
  SEGMENTS, KPI_GROUPS, KPI_VALUES,
  deviationPct, ampelColor, REPORT_DATE,
} from '../data/kpiData';
import { buildKommentar } from '../data/aiAnalyse';

const AMPEL_HEX = {
  green:  '16A34A',
  yellow: 'F59E0B',
  red:    'DC2626',
  gray:   '94A3B8',
};

function hex(c) {
  return c.replace('#', '').toUpperCase();
}

function fmtCellValue(value, unit) {
  if (value === null || value === undefined) return '–';
  if (unit === '%') {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  }
  return value.toLocaleString('de-DE', { maximumFractionDigits: 0 });
}

export async function exportPpt(bank) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
  pptx.title = `Banken-KPI ${bank.name} – ${REPORT_DATE}`;
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
      // Header band
      { rect: { x: 0, y: 0, w: 13.33, h: 0.55, fill: { color: PRIMARY } } },
      // Side accent
      { rect: { x: 0, y: 0.55, w: 0.12, h: 6.95, fill: { color: PRIMARY_LIGHT } } },
      // Footer line
      { line: { x: 0.5, y: 7.15, w: 12.33, h: 0, line: { color: BORDER, width: 0.5 } } },
      // Title placeholder text in header
      {
        text: {
          text: bank.name + ' · KPI Dashboard · gem. XYZ-Meldung',
          options: {
            x: 0.5, y: 0.08, w: 9, h: 0.4,
            fontSize: 13, color: 'FFFFFF', fontFace: 'Calibri', bold: true,
            valign: 'middle',
          },
        },
      },
      {
        text: {
          text: 'Stand: ' + REPORT_DATE,
          options: {
            x: 9.5, y: 0.08, w: 3.33, h: 0.4,
            fontSize: 11, color: 'FFFFFF', fontFace: 'Calibri', align: 'right', valign: 'middle',
          },
        },
      },
      // Footer
      {
        text: {
          text: 'DUMMY DATEN · VERTRAULICH · Whitelabel-Demo',
          options: {
            x: 0.5, y: 7.18, w: 9, h: 0.25,
            fontSize: 9, color: TEXT_GRAY, fontFace: 'Calibri', italic: true, valign: 'middle',
          },
        },
      },
    ],
    slideNumber: { x: 12.7, y: 7.18, w: 0.5, h: 0.25, fontSize: 9, color: TEXT_GRAY, fontFace: 'Calibri', align: 'right' },
  });

  // ═══ SLIDE 1: Titel ═══════════════════════════════════════
  const s1 = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
  s1.addShape('rect', { x: 0.5, y: 1.2, w: 12.33, h: 5.4, fill: { color: BG_LIGHT }, line: { color: BORDER, width: 0.5 } });
  s1.addText('Monatlicher Bericht', {
    x: 1.0, y: 1.8, w: 11, h: 0.5,
    fontSize: 16, color: TEXT_GRAY, fontFace: 'Calibri', bold: true,
  });
  s1.addText('KPI Dashboard', {
    x: 1.0, y: 2.3, w: 11, h: 1.0,
    fontSize: 48, color: PRIMARY, fontFace: 'Calibri', bold: true,
  });
  s1.addText(bank.name, {
    x: 1.0, y: 3.4, w: 11, h: 0.7,
    fontSize: 28, color: TEXT_DARK, fontFace: 'Calibri',
  });
  s1.addText(`Stand: ${REPORT_DATE} · gem. XYZ-Meldung`, {
    x: 1.0, y: 4.2, w: 11, h: 0.4,
    fontSize: 14, color: TEXT_GRAY, fontFace: 'Calibri',
  });
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
    s1.addShape('rect', { x, y: 5.0, w: 2.6, h: 1.4, fill: { color: 'FFFFFF' }, line: { color: BORDER, width: 0.5 } });
    s1.addText(hk.label, { x: x + 0.15, y: 5.1, w: 2.4, h: 0.3, fontSize: 11, color: TEXT_GRAY, fontFace: 'Calibri', bold: true });
    const unit = (hk.id === 'roRac' || hk.id === 'cir') ? '%' : 'MEUR';
    s1.addText(fmtCellValue(cell.ist, unit) + (unit === 'MEUR' ? ' Mio €' : ''), {
      x: x + 0.15, y: 5.45, w: 2.4, h: 0.55,
      fontSize: 22, color: PRIMARY, fontFace: 'Calibri', bold: true,
    });
    s1.addText('Plan: ' + fmtCellValue(cell.plan, unit) + (unit === 'MEUR' ? ' Mio €' : ''), {
      x: x + 0.15, y: 6.0, w: 2.4, h: 0.3,
      fontSize: 10, color: TEXT_GRAY, fontFace: 'Calibri',
    });
  });

  // ═══ SLIDE 2: KPI-Matrix ══════════════════════════════════
  const s2 = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
  s2.addText('KPI-Matrix · Ist vs. Plan', {
    x: 0.5, y: 0.7, w: 12.33, h: 0.4,
    fontSize: 18, color: TEXT_DARK, fontFace: 'Calibri', bold: true,
  });

  // Tabelle bauen
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
      options: {
        bold: true, italic: true, color: TEXT_GRAY, fill: { color: BG_LIGHT },
        colspan: 2 + SEGMENTS.length,
      },
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
        const ampelHex = AMPEL_HEX[ampel];
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

  s2.addTable(rows, {
    x: 0.5, y: 1.2, w: 12.33,
    fontSize: 8.5, fontFace: 'Calibri',
    border: { type: 'solid', color: BORDER, pt: 0.5 },
    rowH: 0.28,
  });

  s2.addText('Legende: ≥ 100 % im Plan · 95–99 % unter Plan · < 95 % kritisch', {
    x: 0.5, y: 6.85, w: 12.33, h: 0.3,
    fontSize: 9, color: TEXT_GRAY, fontFace: 'Calibri', italic: true,
  });

  // ═══ SLIDE 3: KI-Kommentar ════════════════════════════════
  const s3 = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
  s3.addText('KI-Kommentar mit Querlogik', {
    x: 0.5, y: 0.7, w: 12.33, h: 0.4,
    fontSize: 18, color: TEXT_DARK, fontFace: 'Calibri', bold: true,
  });
  s3.addText('Automatische Analyse der Abweichungen, Cross-KPI-Bezüge und Handlungsempfehlungen', {
    x: 0.5, y: 1.1, w: 12.33, h: 0.35,
    fontSize: 11, color: TEXT_GRAY, fontFace: 'Calibri', italic: true,
  });

  const bullets = buildKommentar();
  let yCursor = 1.6;
  bullets.forEach((b) => {
    const sevColor = AMPEL_HEX[b.severity] || AMPEL_HEX.gray;
    const blockH = 0.85;
    s3.addShape('rect', {
      x: 0.5, y: yCursor, w: 12.33, h: blockH,
      fill: { color: 'FFFFFF' }, line: { color: BORDER, width: 0.5 },
    });
    // Severity bar
    s3.addShape('rect', {
      x: 0.5, y: yCursor, w: 0.12, h: blockH,
      fill: { color: sevColor }, line: { color: sevColor, width: 0 },
    });
    s3.addText(b.headline, {
      x: 0.8, y: yCursor + 0.05, w: 12, h: 0.3,
      fontSize: 12, color: TEXT_DARK, fontFace: 'Calibri', bold: true,
    });
    s3.addText(b.text, {
      x: 0.8, y: yCursor + 0.32, w: 12, h: 0.5,
      fontSize: 10.5, color: '334155', fontFace: 'Calibri',
    });
    yCursor += blockH + 0.1;
  });

  // ═══ SLIDE 4: Top-Auffälligkeiten ═════════════════════════
  const s4 = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
  s4.addText('Top-Auffälligkeiten – Heatmap nach Abweichung', {
    x: 0.5, y: 0.7, w: 12.33, h: 0.4,
    fontSize: 18, color: TEXT_DARK, fontFace: 'Calibri', bold: true,
  });

  const heat = [];
  KPI_GROUPS.forEach((group) => {
    group.kpis.forEach((k) => {
      SEGMENTS.forEach((seg) => {
        const cell = KPI_VALUES[k.id]?.[seg.id];
        if (!cell) return;
        const dev = deviationPct(cell.ist, cell.plan, k.invertTrend);
        const ampel = ampelColor(cell.ist, cell.plan, k.invertTrend);
        if (ampel === 'red') {
          heat.push({ kpi: k, seg, cell, dev });
        }
      });
    });
  });
  heat.sort((a, b) => Math.abs(b.dev) - Math.abs(a.dev));
  const top = heat.slice(0, 8);

  const heatHeader = [
    { text: 'Rang',     options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY }, align: 'center' } },
    { text: 'KPI',      options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY } } },
    { text: 'Segment',  options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY } } },
    { text: 'Ist',      options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY }, align: 'right' } },
    { text: 'Plan',     options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY }, align: 'right' } },
    { text: 'Abw.',     options: { bold: true, color: 'FFFFFF', fill: { color: PRIMARY }, align: 'right' } },
  ];
  const heatRows = [heatHeader];
  top.forEach((row, i) => {
    heatRows.push([
      { text: String(i + 1), options: { align: 'center', color: TEXT_GRAY, bold: true } },
      { text: row.kpi.label, options: { color: TEXT_DARK, bold: true } },
      { text: row.seg.label, options: { color: TEXT_DARK } },
      { text: fmtCellValue(row.cell.ist, row.kpi.unit), options: { align: 'right', color: TEXT_DARK, fontFace: 'Consolas' } },
      { text: fmtCellValue(row.cell.plan, row.kpi.unit), options: { align: 'right', color: TEXT_GRAY, fontFace: 'Consolas' } },
      {
        text: (row.dev >= 0 ? '+' : '') + row.dev.toFixed(2) + ' %',
        options: { align: 'right', color: AMPEL_HEX.red, bold: true, fontFace: 'Consolas' },
      },
    ]);
  });
  if (top.length === 0) {
    heatRows.push([{
      text: 'Keine kritischen Abweichungen identifiziert.',
      options: { color: TEXT_GRAY, italic: true, align: 'center', colspan: 6 },
    }]);
  }

  s4.addTable(heatRows, {
    x: 0.5, y: 1.3, w: 12.33,
    fontSize: 11, fontFace: 'Calibri',
    border: { type: 'solid', color: BORDER, pt: 0.5 },
    rowH: 0.4,
  });

  // ═══ SLIDE 5: Konzern-Charts (BarCompare) ═════════════════
  const s5 = pptx.addSlide({ masterName: 'BANKEN_KPI_MASTER' });
  s5.addText('Konzern · Ist vs. Plan', {
    x: 0.5, y: 0.7, w: 12.33, h: 0.4,
    fontSize: 18, color: TEXT_DARK, fontFace: 'Calibri', bold: true,
  });

  const chartCats = KPI_GROUPS.flatMap((g) => g.kpis).map((k) => k.label);
  const chartData = [
    {
      name: 'Ist',
      labels: chartCats,
      values: KPI_GROUPS.flatMap((g) => g.kpis).map((k) => {
        const cell = KPI_VALUES[k.id]?.konzern;
        return cell ? cell.ist : 0;
      }),
    },
    {
      name: 'Plan',
      labels: chartCats,
      values: KPI_GROUPS.flatMap((g) => g.kpis).map((k) => {
        const cell = KPI_VALUES[k.id]?.konzern;
        return cell ? cell.plan : 0;
      }),
    },
  ];
  s5.addChart(pptx.ChartType.bar, chartData, {
    x: 0.5, y: 1.2, w: 12.33, h: 5.6,
    chartColors: [PRIMARY, '94A3B8'],
    showLegend: true, legendPos: 'b',
    catAxisLabelFontSize: 10,
    valAxisLabelFontSize: 10,
    barDir: 'bar',
    barGapWidthPct: 50,
  });

  // ─── Datei speichern ─────────────────────────────────────
  const filename = `Banken-KPI_${bank.id}_${REPORT_DATE.replace(/\./g, '-')}.pptx`;
  await pptx.writeFile({ fileName: filename });
}
