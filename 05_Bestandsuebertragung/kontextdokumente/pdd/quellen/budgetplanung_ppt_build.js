const pptxgen = require('pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
pres.author = 'Eike Brenneisen';

const ROT = 'C41230', ROTD = '8E0C22', TEAL = '0E8A9A', TEALL = 'C9ECEF', TEALM = '5FBFCB', GRAU = '6B6B6B', GRAUL = 'EDEDED', SW = '1A1A1A', WEISS = 'FFFFFF', ROSA = 'E8C9DB', ORANGE = 'E8781A', LILA = 'B58AB0';
const F = 'Arial';
const eur = (n) => n.toLocaleString('de-DE') + ' EUR';
const k = (n) => n.toLocaleString('de-DE');

function kopf(slide, kicker, titel) {
  slide.background = { color: WEISS };
  slide.addText(kicker, { x: 0.6, y: 0.35, w: 9, h: 0.3, fontFace: F, fontSize: 11, color: GRAU, isTextBox: true, margin: 0, charSpacing: 1 });
  slide.addText(titel, { x: 0.6, y: 0.62, w: 10.6, h: 0.9, fontFace: F, fontSize: 24, bold: true, color: ROT, isTextBox: true, margin: 0, valign: 'top' });
  slide.addText('ERGO', { x: 11.2, y: 0.3, w: 1.6, h: 0.6, fontFace: F, fontSize: 30, bold: true, color: ROT, align: 'right', isTextBox: true, margin: 0 });
  slide.addText('A Munich Re company', { x: 10.4, y: 0.85, w: 2.4, h: 0.25, fontFace: F, fontSize: 9, color: SW, align: 'right', isTextBox: true, margin: 0 });
}
function fuss(slide, nr) {
  slide.addText('Makler BÜ meets KI · Budgetplanung 2026/2027 · Stand 17.09.2026 · Werte netto', { x: 0.6, y: 7.05, w: 9, h: 0.25, fontFace: F, fontSize: 8, color: GRAU, isTextBox: true, margin: 0 });
  slide.addText(String(nr), { x: 12.2, y: 7.05, w: 0.6, h: 0.25, fontFace: F, fontSize: 9, color: GRAU, align: 'right', isTextBox: true, margin: 0 });
}
function abschnitt(slide, x, y, w, text) {
  slide.addText(text, { x, y, w, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: SW, isTextBox: true, margin: 0 });
}

// ------------------------------------------------------------------ Slide 1: Kernbotschaft
{
  const s = pres.addSlide();
  kopf(s, 'BUDGETPLANUNG 2026/2027', 'Celonis-Ausbaustufe 2 übersteigt das IT-Budget 2026 – Empfehlung: Umsetzung und Finanzierung in 2027');
  // drei Kennzahlkacheln
  const kach = [
    { t: 'IT-Kosten 2026 heute', z: '113.592 EUR', u: 'gegenüber 66.900 EUR im Zwischenbericht vom 10.06.2026 (+46.692 EUR)', c: SW },
    { t: 'Davon Celonis-Ausbaustufe 2', z: '+47.412 EUR', u: 'Angebot Infomotion: Mehrfachagenten, VNR-Logik, Unterlagenanforderung, KI-Deckblatt, EMWS-Anbindung und Lasttest', c: ROT },
    { t: 'Verfügbares IT-Budget MBS 2026', z: '75.000 EUR', u: 'Deckt Ausbaustufe 1, Eingangsmanagement und Prüf-Bot; verbleibender Spielraum 8.820 EUR', c: TEAL },
  ];
  kach.forEach((q, i) => {
    const x = 0.6 + i * 4.1;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.75, w: 3.85, h: 1.75, fill: { color: GRAUL }, line: { color: GRAUL } });
    s.addText(q.t, { x: x + 0.25, y: 1.9, w: 3.4, h: 0.3, fontFace: F, fontSize: 11, color: GRAU, isTextBox: true, margin: 0 });
    s.addText(q.z, { x: x + 0.25, y: 2.2, w: 3.4, h: 0.6, fontFace: F, fontSize: 30, bold: true, color: q.c, isTextBox: true, margin: 0 });
    s.addText(q.u, { x: x + 0.25, y: 2.82, w: 3.4, h: 0.6, fontFace: F, fontSize: 10, color: SW, isTextBox: true, margin: 0, valign: 'top' });
  });
  // Vorschlag
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 3.8, w: 12.1, h: 1.55, fill: { color: ROT }, line: { color: ROT } });
  s.addText('Vorschlag', { x: 0.85, y: 3.9, w: 2, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: WEISS, isTextBox: true, margin: 0 });
  s.addText([
    { text: 'Ausbaustufe 2 wird 2026 fachlich vorbereitet und 2027 beauftragt und finanziert. ', options: { bold: true } },
    { text: 'Das MBS-Budget 2026 wird damit eingehalten. Der Restaufwand von 38.592 EUR und die Bot-Wartung von 10.000 EUR werden nach 2027 verlagert; der zugesagte HS-Beitrag von 25.000 EUR wird dort eingebracht. Für 2027 verbleibt ein Finanzierungsbedarf von 23.592 EUR. Die EMWS-Anbindung wird vorgezogen, damit der Prüf-Bot wie geplant ab Anfang Oktober aufgebaut werden kann.' },
  ], { x: 0.85, y: 4.2, w: 11.6, h: 1.05, fontFace: F, fontSize: 14, color: WEISS, isTextBox: true, margin: 0, valign: 'top' });
  // Entscheidungsbedarf
  abschnitt(s, 0.6, 5.6, 6, 'Entscheidungsbedarf');
  s.addText([
    { text: 'Freigabe der Verlagerung von Ausbaustufe 2 nach 2027 (Produktivsetzung für Mehrfachagenten und Sonderfälle erst 2027)', options: { bullet: true, breakLine: true } },
    { text: 'Bestätigung HS: Beitrag 25.000 EUR als Kosten 2027 statt 2026', options: { bullet: true, breakLine: true } },
    { text: 'Finanzierung des verbleibenden Bedarfs 2027 von 23.592 EUR (MBS 2027 oder Fachbereich) sowie Klärung der AI-Lizenz 2027', options: { bullet: true } },
  ], { x: 0.6, y: 6.0, w: 12.1, h: 1.0, fontFace: F, fontSize: 12, color: SW, isTextBox: true, margin: 0, paraSpaceAfter: 4, valign: 'top' });
  fuss(s, 1);
  s.addNotes('Kernbotschaft: Die Erhöhung von 66.900 auf 113.592 EUR entsteht fast vollständig durch die Celonis-Ausbaustufe 2 (44 PT). Ausbaustufe 1 wurde günstiger (-9.344 EUR), das Eingangsmanagement teurer (+8.624 EUR). Mit 75.000 EUR MBS-Budget sind Ausbaustufe 1, Eingangsmanagement und Prüf-Bot gedeckt.');
}

// ------------------------------------------------------------------ Slide 2: Budgetentwicklung (Wasserfall) + Aufschlüsselung
{
  const s = pres.addSlide();
  kopf(s, 'BUDGETPLANUNG 2026/2027', 'IT-Aufwände 2026 erhöhen sich um 46.692 EUR – 38.592 EUR übersteigen das MBS-Budget');
  abschnitt(s, 0.6, 1.65, 6, 'Budgetentwicklung 2026 (EUR)');
  // Wasserfall mit Formen
  const gx = 0.6, gy0 = 6.55, H = 3.9, MAX = 120000, bw = 0.78, gap = 0.22;
  const ys = (v) => gy0 - v / MAX * H;
  const bars = [
    { lab: 'Gesamtkosten\n10.06.2026', segs: [[0, 28100, LILA, '28.100'], [28100, 66900, TEALL, '38.800']], top: '66.900' },
    { lab: 'Ausbaustufe 1\nMinderaufwand', segs: [[57556, 66900, TEALM, '-9.344']], top: null, neg: true },
    { lab: 'Eingangsmgmt.\nMehraufwand', segs: [[57556, 66180, ORANGE, '+8.624']], top: null },
    { lab: 'Celonis\nAusbaustufe 2', segs: [[66180, 113592, TEAL, '+47.412']], top: null },
    { lab: 'Gesamtkosten\n17.09.2026', segs: [[0, 113592, GRAU, '']], top: '113.592' },
    { lab: 'IT-Budget\nMBS 2026', segs: [[0, 75000, SW, '']], top: '75.000' },
    { lab: 'Deckungslücke\n2026', segs: [[75000, 113592, ROT, '']], top: '38.592' },
  ];
  bars.forEach((b, i) => {
    const x = gx + i * (bw + gap);
    b.segs.forEach(([lo, hi, col, txt]) => {
      const y = ys(hi), h = ys(lo) - ys(hi);
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: bw, h, fill: { color: col }, line: { color: col } });
      if (txt) s.addText(txt, { x, y, w: bw, h, fontFace: F, fontSize: 10, bold: true, color: (col === TEALL || col === LILA || col === TEALM) ? SW : WEISS, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    });
    if (b.top) s.addText(b.top, { x: x - 0.1, y: ys(Math.max(...b.segs.map(q => q[1]))) - 0.32, w: bw + 0.2, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: SW, align: 'center', isTextBox: true, margin: 0 });
    s.addText(b.lab, { x: x - 0.12, y: gy0 + 0.05, w: bw + 0.24, h: 0.45, fontFace: F, fontSize: 8.5, color: SW, align: 'center', isTextBox: true, margin: 0, valign: 'top' });
  });
  // Verbindungslinien
  const conn = [[0, 66900, 1], [1, 57556, 2], [2, 66180, 3], [3, 113592, 4], [5, 75000, 6]];
  conn.forEach(([i, v, j]) => s.addShape(pres.shapes.LINE, { x: gx + i * (bw + gap) + bw, y: ys(v), w: gap, h: 0, line: { color: GRAU, width: 0.75, dashType: 'dash' } }));
  s.addShape(pres.shapes.LINE, { x: gx, y: gy0, w: 7 * bw + 6 * gap, h: 0, line: { color: SW, width: 1 } });
  // Hinweisfahne
  s.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 2.95, w: 1.95, h: 0.8, fill: { color: ROT }, line: { color: ROT } });
  s.addText('Empfehlung: 38.592 EUR nach 2027 verlagern', { x: 1.6, y: 2.95, w: 1.75, h: 0.8, fontFace: F, fontSize: 10, bold: true, color: WEISS, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
  // Legende
  const leg = [[LILA, 'Sonstiges (EM, Prüf-Bot)'], [TEALL, 'Celonis Ausbaustufe 1'], [TEAL, 'Celonis Ausbaustufe 2'], [ORANGE, 'Mehraufwand Eingangsmanagement'], [ROT, 'Nicht gedeckter Bedarf']];
  leg.forEach(([c, t], i) => {
    const x = 0.6 + (i % 3) * 2.45, y = 1.98 + Math.floor(i / 3) * 0.24;
    if (i >= 3) return; // nur drei in der ersten Zeile, Rest unten
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.03, w: 0.16, h: 0.16, fill: { color: c }, line: { color: c } });
    s.addText(t, { x: x + 0.22, y, w: 2.2, h: 0.22, fontFace: F, fontSize: 8.5, color: SW, isTextBox: true, margin: 0 });
  });
  [[ORANGE, 'Mehraufwand Eingangsmanagement'], [ROT, 'Deckungslücke 2026']].forEach(([c, t], i) => {
    const x = 0.6 + i * 2.45, y = 2.25;
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.03, w: 0.16, h: 0.16, fill: { color: c }, line: { color: c } });
    s.addText(t, { x: x + 0.22, y, w: 2.2, h: 0.22, fontFace: F, fontSize: 8.5, color: SW, isTextBox: true, margin: 0 });
  });

  // Tabelle rechts auf grauer Flaeche
  s.addShape(pres.shapes.RECTANGLE, { x: 7.6, y: 1.45, w: 5.73, h: 5.5, fill: { color: 'E9E9E9' }, line: { color: 'E9E9E9' } });
  abschnitt(s, 7.85, 1.65, 5, 'Aufschlüsselung (EUR netto)');
  const hdr = (t) => ({ text: t, options: { bold: true, color: WEISS, fill: { color: ROT }, fontSize: 9 } });
  const c = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 9, color: SW, fill: { color: 'DDEFF2' } }, o) });
  const l = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 9, color: SW, fill: { color: 'EADDE6' } }, o) });
  const sum = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 9, bold: true, color: WEISS, fill: { color: TEAL } }, o) });
  const suml = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 9, bold: true, color: SW, fill: { color: 'D6BFD0' } }, o) });
  const w = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 9, color: SW, fill: { color: WEISS } }, o) });
  const rows = [
    [hdr('Position'), hdr('10.06.'), hdr('16.09.'), hdr('Delta'), hdr('2027')],
    [c('Celonis Ausbaustufe 1 & Reporting (18 PT)'), c('23.800', { align: 'right' }), c('14.456', { align: 'right' }), c('-9.344', { align: 'right' }), c('–', { align: 'right' })],
    [c('AI-Lizenz'), c('15.000', { align: 'right' }), c('15.000', { align: 'right' }), c('–', { align: 'right' }), c('TBD', { align: 'right' })],
    [c('Celonis Ausbaustufe 2 (Angebot Infomotion)'), c('–', { align: 'right' }), c('47.412', { align: 'right' }), c('+47.412', { align: 'right', bold: true, color: ROT }), c('38.592', { align: 'right' })],
    [sum('Summe Celonis'), sum('38.800', { align: 'right' }), sum('76.868', { align: 'right' }), sum('+38.068', { align: 'right' }), sum('38.592', { align: 'right' })],
    [l('Eingangsmanagement (5 → 19 PT)'), l('3.100', { align: 'right' }), l('11.724', { align: 'right' }), l('+8.624', { align: 'right', bold: true, color: ROT }), l('–', { align: 'right' })],
    [l('Prüf-Bot Robotics (40 PT)'), l('25.000', { align: 'right' }), l('25.000', { align: 'right' }), l('–', { align: 'right' }), l('10.000 Wartung', { align: 'right' })],
    [suml('Summe Sonstiges'), suml('28.100', { align: 'right' }), suml('36.724', { align: 'right' }), suml('+8.624', { align: 'right' }), suml('10.000', { align: 'right' })],
    [sum('Summe IT-Aufwände', { color: WEISS, fill: { color: SW } }), sum('66.900', { align: 'right', color: WEISS, fill: { color: SW } }), sum('113.592', { align: 'right', color: WEISS, fill: { color: SW } }), sum('+46.692', { align: 'right', color: WEISS, fill: { color: SW } }), sum('48.592', { align: 'right', color: WEISS, fill: { color: SW } })],
    [w('IT-Budget MBS 2026'), w('', {}), w('75.000', { align: 'right', bold: true }), w('', {}), w('', {})],
    [w('Deckungslücke', { bold: true, color: ROT }), w('', {}), w('38.592', { align: 'right', bold: true, color: ROT }), w('', {}), w('', {})],
  ];
  s.addTable(rows, { x: 7.85, y: 2.1, w: 4.9, colW: [2.1, 0.65, 0.7, 0.7, 0.75], fontFace: F, border: { type: 'solid', color: 'FFFFFF', pt: 0.75 }, rowH: 0.3, margin: [2, 4, 2, 4] });
  s.addText('2027: Restaufwand Ausbaustufe 2 (47.412 abzüglich 8.820 Rest aus MBS 2026) und Bot-Wartung. Tagessätze: Infomotion 1.323 EUR, Eingangsmanagement 616 EUR, Robotics 616,20 EUR.', { x: 7.85, y: 5.6, w: 4.9, h: 0.7, fontFace: F, fontSize: 8.5, color: GRAU, isTextBox: true, margin: 0, valign: 'top' });
  fuss(s, 2);
}

// ------------------------------------------------------------------ Slide 3: Ausbaustufe 2
{
  const s = pres.addSlide();
  kopf(s, 'BUDGETPLANUNG 2026/2027', 'Ausbaustufe 2 vervollständigt die KI-Strukturierung: vier Leistungspakete, Test und Betrieb in zehn Wochen');
  abschnitt(s, 0.6, 1.65, 6, 'Was Ausbaustufe 2 leistet');
  const items = [
    ['Mehrfachagenten', 'Unterscheidung Makler und Mehrfachagent; Agentur- und Personalnummer im normierten Format; Kündigung Maklervertrag'],
    ['Anpassung VNR-Logik', 'Spartenzugehörigkeit, Aufsplittung der VNR-Ebenen, Output je VNR; BUE_UMFANG mit Einzel/Gesamt (optional VNR-Ermittlung, 4 PT)'],
    ['Anforderung weiterer Unterlagen', 'Zusätzliche Prüfung auf weitere Unterlagen; GeVo-abhängige Zuordnung und Bearbeitung aller eingehenden Mails'],
    ['Anpassung KI-Deckblatt und EMWS-Anbindung', 'Deckblatt für Punkte 1 bis 3 und Updates aus RPA; Datenpool V1.6; EMWS-Anbindung (2 PT ERGO-IT)'],
    ['Testing und Betrieb', 'E2E-Lasttest mit 2.500 Vorgängen je Woche, Betriebs- und Governance-Dokumentation, Fehler-Handling-Dashboards'],
  ];
  items.forEach(([h, t], i) => {
    const y = 2.1 + i * 0.86;
    s.addShape(pres.shapes.OVAL, { x: 0.6, y: y + 0.05, w: 0.42, h: 0.42, fill: { color: TEAL }, line: { color: TEAL } });
    s.addText(String(i + 1), { x: 0.6, y: y + 0.05, w: 0.42, h: 0.42, fontFace: F, fontSize: 13, bold: true, color: WEISS, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(h, { x: 1.2, y, w: 5.6, h: 0.3, fontFace: F, fontSize: 12.5, bold: true, color: SW, isTextBox: true, margin: 0 });
    s.addText(t, { x: 1.2, y: y + 0.29, w: 5.6, h: 0.5, fontFace: F, fontSize: 10.5, color: SW, isTextBox: true, margin: 0, valign: 'top' });
  });
  // rechts: Kosten
  abschnitt(s, 7.4, 1.65, 5, 'Warum die Kosten steigen');
  s.addText([
    { text: 'Ausbaustufe 1 (18 PT) war mit dem Basisumfang der Mailerkennung kalkuliert und liegt 9.344 EUR unter der Planung.', options: { bullet: true, breakLine: true } },
    { text: 'Die fachlichen Erweiterungen aus den Tests seit August (MFA, Unterlagen, mehrere VNR) und die EMWS-Schnittstelle bilden einen eigenen Auftrag: laut Angebot Infomotion 32 PT (zuzüglich 4 PT optional für die VNR-Ermittlung) bei zehn Wochen Umsetzungszeitraum.', options: { bullet: true, breakLine: true } },
    { text: 'Grundlage ist das neue Konzept mit Vorklassifizierung und spezialisierten Agenten je Geschäftsvorfall (siehe Backup). Ohne Ausbaustufe 2 bleibt die Automatisierung auf Makler-Standardfälle beschränkt.', options: { bullet: true, breakLine: true } },
    { text: 'Zeitplan: zehn Wochen Umsetzung. Die EMWS-Anbindung wird aus dem Paket vorgezogen und 2026 umgesetzt, damit der Prüf-Bot wie geplant ab Anfang Oktober aufgebaut werden kann.', options: { bullet: true, bold: true } },
  ], { x: 7.4, y: 2.1, w: 5.3, h: 2.0, fontFace: F, fontSize: 10, color: SW, isTextBox: true, margin: 0, paraSpaceAfter: 4, valign: 'top' });
  const hdr = (t) => ({ text: t, options: { bold: true, color: WEISS, fill: { color: TEAL }, fontSize: 10 } });
  const c = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 10, color: SW }, o) });
  const b = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 10, bold: true, color: SW, fill: { color: GRAUL } }, o) });
  const rows = [
    [hdr('Celonis-Budget'), hdr('Kosten')],
    [c('Ausbaustufe 1 & Reporting (Infomotion, 18 PT)'), c('14.456 EUR', { align: 'right' })],
    [c('AI-Lizenz 2026'), c('15.000 EUR', { align: 'right' })],
    [b('Summe Ausbaustufe 1'), b('29.456 EUR', { align: 'right' })],
    [c('Ausbaustufe 2 (Infomotion und ERGO-IT, 32 PT + 4 PT optional)'), c('47.412 EUR', { align: 'right' })],
    [c('AI-Lizenz 2027'), c('TBD', { align: 'right' })],
    [b('Gesamtkosten Celonis (Stufe 1 + 2)'), b('76.868 EUR', { align: 'right' })],
    [c('Verbleibendes MBS-Budget 2026 nach Ausbaustufe 1, Eingangsmanagement und Prüf-Bot'), c('8.820 EUR', { align: 'right' })],
    [b('Mehrbedarf Ausbaustufe 2', { color: ROT }), b('38.592 EUR', { align: 'right', color: ROT })],
  ];
  s.addTable(rows, { x: 7.4, y: 4.45, w: 5.3, colW: [3.9, 1.4], fontFace: F, border: { type: 'solid', color: 'D0D0D0', pt: 0.5 }, rowH: 0.27, margin: [2, 5, 2, 5] });
  fuss(s, 3);
}

// ------------------------------------------------------------------ Slide 4: Finanzierung 2027, Optionen, Entscheidung
{
  const s = pres.addSlide();
  kopf(s, 'BUDGETPLANUNG 2026/2027', 'Empfehlung: Finanzierung der Ausbaustufe 2 in 2027 – der HS-Beitrag deckt den überwiegenden Teil, 23.592 EUR sind zu klären');
  // Optionen
  const opt = (x, titel, badge, badgeCol, zeilen, hell) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.75, w: 4.05, h: 3.55, fill: { color: hell ? GRAUL : WEISS }, line: { color: hell ? GRAUL : TEAL, width: hell ? 0.75 : 1.5 } });
    s.addText(titel, { x: x + 0.25, y: 1.9, w: 3.6, h: 0.5, fontFace: F, fontSize: 13, bold: true, color: SW, isTextBox: true, margin: 0, valign: 'top' });
    s.addShape(pres.shapes.RECTANGLE, { x: x + 0.25, y: 2.5, w: 1.9, h: 0.28, fill: { color: badgeCol }, line: { color: badgeCol } });
    s.addText(badge, { x: x + 0.25, y: 2.5, w: 1.9, h: 0.28, fontFace: F, fontSize: 9, bold: true, color: WEISS, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(zeilen.map((z, i) => ({ text: z, options: { bullet: true, breakLine: i < zeilen.length - 1 } })), { x: x + 0.25, y: 2.9, w: 3.6, h: 2.35, fontFace: F, fontSize: 10, color: SW, isTextBox: true, margin: 0, paraSpaceAfter: 3, valign: 'top' });
  };
  opt(0.6, 'Option A: Ausbaustufe 2 vollständig in 2026', 'NICHT EMPFOHLEN', GRAU, [
    'Bedarf 2026: 113.592 EUR bei 75.000 EUR MBS-Budget',
    'Deckungslücke 2026 von 38.592 EUR; der HS-Beitrag von 25.000 EUR deckt sie nicht vollständig',
    'Beauftragung Infomotion und Staffing müssten kurzfristig erweitert werden',
    'Produktivsetzung ist releaseabhängig (frühestens November 2026)',
  ], true);
  opt(4.85, 'Option B: Ausbaustufe 2 nach 2027 verlagern', 'EMPFEHLUNG', ROT, [
    '2026 innerhalb des MBS-Budgets: Ausbaustufe 1, Eingangsmanagement und Prüf-Bot = 66.180 EUR; 8.820 EUR als Anzahlung auf Ausbaustufe 2',
    '2027: 38.592 EUR Ausbaustufe 2 und 10.000 EUR Bot-Wartung = 48.592 EUR',
    'HS-Beitrag 25.000 EUR wird 2027 eingebracht',
    'Verbleibender Bedarf 2027: 23.592 EUR (zuzüglich AI-Lizenz 2027, noch offen)',
    'EMWS-Anbindung wird vorgezogen: Aufbau des Prüf-Bots ab Anfang Oktober wie geplant',
  ], false);
  // Mini-Wasserfall 2027
  abschnitt(s, 9.3, 1.75, 3.5, 'Bedarf 2027 (EUR)');
  const gx = 9.4, gy0 = 4.95, H = 2.4, MAX = 52000, bw = 0.85, gap = 0.3;
  const ys = (v) => gy0 - v / MAX * H;
  const bars = [
    { lab: 'Bedarf\n2027', segs: [[0, 38592, TEAL, '38.592'], [38592, 48592, LILA, '10.000']], top: '48.592' },
    { lab: 'HS-Beitrag', segs: [[23592, 48592, SW, '25.000']], top: null },
    { lab: 'Verbleibender\nBedarf', segs: [[0, 23592, ROT, '']], top: '23.592' },
  ];
  bars.forEach((b, i) => {
    const x = gx + i * (bw + gap);
    b.segs.forEach(([lo, hi, col, txt]) => {
      const y = ys(hi), h = ys(lo) - ys(hi);
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: bw, h, fill: { color: col }, line: { color: col } });
      if (txt) s.addText(txt, { x, y, w: bw, h, fontFace: F, fontSize: 9.5, bold: true, color: col === LILA ? SW : WEISS, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    });
    if (b.top) s.addText(b.top, { x: x - 0.1, y: ys(Math.max(...b.segs.map(q => q[1]))) - 0.3, w: bw + 0.2, h: 0.28, fontFace: F, fontSize: 11, bold: true, color: SW, align: 'center', isTextBox: true, margin: 0 });
    s.addText(b.lab, { x: x - 0.1, y: gy0 + 0.05, w: bw + 0.2, h: 0.4, fontFace: F, fontSize: 8.5, color: SW, align: 'center', isTextBox: true, margin: 0, valign: 'top' });
  });
  s.addShape(pres.shapes.LINE, { x: gx + bw, y: ys(48592), w: gap, h: 0, line: { color: GRAU, width: 0.75, dashType: 'dash' } });
  s.addShape(pres.shapes.LINE, { x: gx + 2 * bw + gap, y: ys(23592), w: gap, h: 0, line: { color: GRAU, width: 0.75, dashType: 'dash' } });
  s.addShape(pres.shapes.LINE, { x: gx, y: gy0, w: 3 * bw + 2 * gap, h: 0, line: { color: SW, width: 1 } });
  // Nächste Schritte
  abschnitt(s, 0.6, 5.55, 6, 'Nächste Schritte');
  const steps = [['bis 19.09.', 'Entscheidung zur Verlagerung und zum HS-Beitrag 2027 (Runde Steiner, Richarz, Boulanger)'], ['bis 26.09.', 'EMWS-Anbindung mit Infomotion vorziehen; Angebot Ausbaustufe 2 mit Leistungsbeginn 2027 einholen'], ['bis KW 40', 'Verbleibenden Bedarf von 23.592 EUR und AI-Lizenz 2027 in der Budgetplanung 2027 anmelden'], ['laufend', 'Ausbaustufe 1, Datenpool und Prüf-Bot wie geplant 2026 fertigstellen']];
  steps.forEach(([w, t], i) => {
    const x = 0.6 + i * 3.05;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 5.95, w: 2.9, h: 0.95, fill: { color: TEALL }, line: { color: TEALL } });
    s.addText(w, { x: x + 0.15, y: 6.0, w: 2.6, h: 0.25, fontFace: F, fontSize: 10, bold: true, color: TEAL, isTextBox: true, margin: 0 });
    s.addText(t, { x: x + 0.15, y: 6.25, w: 2.6, h: 0.62, fontFace: F, fontSize: 9, color: SW, isTextBox: true, margin: 0, valign: 'top' });
  });
  fuss(s, 4);
  s.addNotes('Option B ist die Empfehlung: Das MBS-Budget 2026 wird eingehalten, der HS-Beitrag wird nach 2027 verlagert und deckt dort den Großteil der Ausbaustufe 2. Offen bleiben 23.592 EUR (zzgl. AI-Lizenz 2027).');
}

// ------------------------------------------------------------------ Slide 5: Backup neues Konzept
{
  const s = pres.addSlide();
  kopf(s, 'BACKUP', 'Hintergrund: Ausbaustufe 2 ersetzt den monolithischen Prompt durch eine Vorklassifizierung mit spezialisierten Agenten');
  abschnitt(s, 0.6, 1.65, 6, 'Bisheriges Konzept und Probleme');
  s.addText([
    { text: 'Ein großer Prompt mit der Annahme „alles ist Bestandsübertragung“; alle Prüfungen laufen für jeden Vorgang.', options: { bullet: true, breakLine: true } },
    { text: 'Nicht alle E-Mails werden verarbeitet; Fälle außerhalb des Konzepts (Mehrfachagenten, Reminder, Spam, Sonderfälle) sind nicht vorgesehen.', options: { bullet: true, breakLine: true } },
    { text: 'Ausfälle und Störungen lassen sich nicht gezielt behandeln; geringe Robustheit bei unerwarteten Eingaben.', options: { bullet: true, breakLine: true } },
    { text: 'Kernbefund: Der monolithische Ansatz skaliert weder fachlich (neue Vorgangstypen) noch operativ (Störungen, Sonderfälle).', options: { bullet: true, bold: true } },
  ], { x: 0.6, y: 2.1, w: 5.6, h: 2.6, fontFace: F, fontSize: 11.5, color: SW, isTextBox: true, margin: 0, paraSpaceAfter: 6, valign: 'top' });
  // Ablauf neu als Kette
  abschnitt(s, 6.9, 1.65, 6, 'Neues Konzept (Ausbaustufe 2)');
  const kette = [['Mail-Eingang', 'inkl. Anhänge', TEALL, SW], ['Vorklassifizierung', 'Agent 0: GeVo, Spam, Reminder', TEAL, WEISS], ['Agenten je GeVo', 'vorgangsspezifische Prompts und Prüfungen', TEAL, WEISS], ['KI-Deckblatt', 'einheitlich für alle Strecken', SW, WEISS]];
  kette.forEach(([h, t, col, tc], i) => {
    const x = 6.9 + i * 1.5;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.15, w: 1.3, h: 1.15, fill: { color: col }, line: { color: col } });
    s.addText(h, { x: x + 0.08, y: 2.2, w: 1.14, h: 0.45, fontFace: F, fontSize: 9.5, bold: true, color: tc, align: 'center', valign: 'middle', isTextBox: true, margin: 0 });
    s.addText(t, { x: x + 0.08, y: 2.65, w: 1.14, h: 0.6, fontFace: F, fontSize: 8, color: tc, align: 'center', valign: 'top', isTextBox: true, margin: 0 });
    if (i < 3) s.addText('›', { x: x + 1.3, y: 2.45, w: 0.2, h: 0.5, fontFace: F, fontSize: 22, bold: true, color: TEAL, align: 'center', isTextBox: true, margin: 0 });
  });
  s.addText([
    { text: 'Granulare Prompts: modulare, vorgangsabhängige Bausteine statt eines statischen Prompts.', options: { bullet: true, breakLine: true } },
    { text: 'Gesteuerte Prüfungen: je Vorgangstyp nur die notwendigen Prüfungen (Phrasen-, Templatechecks).', options: { bullet: true, breakLine: true } },
    { text: 'Sicherheitsarchitektur: operative Funktionsfähigkeit auch bei Ausfällen und Störungen; unerwartete Eingaben werden gezielt ausgesteuert.', options: { bullet: true, breakLine: true } },
    { text: 'Erweiterbarkeit: neue Geschäftsvorfälle als eigenständige Agenten mit eigener Qualitätssicherung.', options: { bullet: true } },
  ], { x: 6.9, y: 3.5, w: 5.8, h: 1.75, fontFace: F, fontSize: 10, color: SW, isTextBox: true, margin: 0, paraSpaceAfter: 3, valign: 'top' });
  // Gegenueberstellung
  const hdr = (t) => ({ text: t, options: { bold: true, color: WEISS, fill: { color: TEAL }, fontSize: 10 } });
  const c = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 10, color: SW }, o) });
  s.addTable([
    [hdr('Aspekt'), hdr('Bisher'), hdr('Neu')],
    [c('Klassifikation', { bold: true }), c('Annahme: alles ist Bestandsübertragung'), c('Vorklassifizierung des Anliegens (GeVo, Spam, Reminder)')],
    [c('Prüfungen', { bold: true }), c('Immer alle'), c('Je Vorgangstyp gesteuert')],
    [c('Störungsfälle', { bold: true }), c('Nicht gezielt behandelbar'), c('Operative Sicherheitsarchitektur')],
    [c('Ergebnis', { bold: true }), c('KI-Deckblatt'), c('Einheitliches KI-Deckblatt für alle Strecken')],
  ], { x: 0.6, y: 5.35, w: 12.1, colW: [2.0, 4.6, 5.5], fontFace: F, border: { type: 'solid', color: 'D0D0D0', pt: 0.5 }, rowH: 0.28, margin: [2, 5, 2, 5] });
  s.addText('Quelle: Infomotion, „MaklerBÜ meets Celonis – Ausbaustufe 2“ (Backup-Folien Ausgangslage, Neues Konzept, Gegenüberstellung).', { x: 0.6, y: 6.8, w: 12, h: 0.22, fontFace: F, fontSize: 8, color: GRAU, isTextBox: true, margin: 0 });
  fuss(s, 5);
}

pres.writeFile({ fileName: '/tmp/claude-0/-home-user-kiarbeitsplatz/f661452e-e109-5f2a-a280-eeeab59cad16/scratchpad/budgetppt/Budgetplanung_2026_2027_Celonis_Ausbaustufe_2.pptx' }).then(() => console.log('ok'));
