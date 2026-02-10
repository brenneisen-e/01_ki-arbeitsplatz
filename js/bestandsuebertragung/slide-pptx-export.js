/**
 * PPTX Export for Bestandsübertragung Slides (T-11, T-12)
 * Dynamically loads PptxGenJS and generates 16:9 widescreen PowerPoint files.
 * Slide size: 33.867 cm × 19.05 cm (standard widescreen)
 */

/* ================================================
   LIBRARY LOADER
   ================================================ */
let pptxLoadPromise = null;

function ensurePptxGenJS() {
    if (typeof PptxGenJS !== 'undefined') return Promise.resolve();
    if (pptxLoadPromise) return pptxLoadPromise;
    pptxLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('PptxGenJS konnte nicht geladen werden.'));
        document.head.appendChild(script);
    });
    return pptxLoadPromise;
}

/* ================================================
   CONSTANTS
   ================================================ */
const SW = 13.333;          // slide width in inches (33.867 cm)
const SH = 7.5;             // slide height in inches (19.05 cm)
const PX = 0.5;             // horizontal padding
const BW = SW - 2 * PX;     // body width = 12.333"
const BY = 1.5;             // body y-start
const FY = 7.05;            // footer y

// Deloitte color palette (hex without #)
const C = {
    green: '86BC25', dkGreen: '046A38', teal: '0D8390', blue: '00A3E0',
    dkGray: '53565A', mdGray: '97999B', red: 'C8102E', orange: 'ED8B00',
    black: '000000', white: 'FFFFFF', ltGray: 'E5E7EB', bgGray: 'F3F4F6',
    text: '333333'
};
const FONT = 'Aptos';

/* ================================================
   SHARED SLIDE ELEMENTS
   ================================================ */
function addTitle(slide, textRuns) {
    slide.addText(textRuns, {
        x: PX, y: 0.3, w: BW, h: 0.5,
        fontFace: FONT, fontSize: 26, color: C.black, valign: 'top'
    });
}

function addSubtitle(slide, text) {
    slide.addText(text, {
        x: PX, y: 0.82, w: BW, h: 0.5,
        fontFace: FONT, fontSize: 13, color: C.dkGray, valign: 'top', wrap: true
    });
}

function addDivider(slide) {
    slide.addShape('line', {
        x: PX, y: 1.4, w: BW, h: 0,
        line: { color: C.green, width: 2 }
    });
}

function addFooter(slide) {
    slide.addShape('line', {
        x: PX, y: FY, w: BW, h: 0,
        line: { color: C.ltGray, width: 1 }
    });
    slide.addText('Deloitte 2026', {
        x: PX, y: FY + 0.02, w: BW / 2, h: 0.3,
        fontFace: FONT, fontSize: 10, color: C.mdGray, valign: 'middle'
    });
    slide.addText('Vertriebskapazitätssteigerung @ Ergo', {
        x: SW / 2, y: FY + 0.02, w: BW / 2, h: 0.3,
        fontFace: FONT, fontSize: 10, color: C.mdGray, valign: 'middle', align: 'right'
    });
}

function addSectionLabel(slide, text, x, y, color) {
    slide.addText(text, {
        x: x, y: y, w: 4, h: 0.3,
        fontFace: FONT, fontSize: 12, bold: true, color: color || C.dkGray,
        letterSpacing: 1
    });
    slide.addShape('line', {
        x: x, y: y + 0.28, w: 1.5, h: 0,
        line: { color: color || C.green, width: 2 }
    });
}

/* ================================================
   T-11: AUSGANGSLAGE & ZIELBILD
   ================================================ */
function buildSlide11(pres) {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    addTitle(slide, [
        { text: 'Bestandsübertragung', options: { bold: true, fontFace: FONT } },
        { text: ' | Ausgangslage & Zielbild', options: { fontFace: FONT } }
    ]);
    addSubtitle(slide,
        'Sechsstellige Anzahl jährlicher Bestandsübertragungen über Gruppenpostfächer \u2013 heute überwiegend manuell geprüft. ' +
        'Pragmatischer Aufbau einer KI-Interimslösung für unstrukturierte E-Mails bei gleichzeitiger Entwicklung eines strukturierten Formulars und einer API als Zielbild.'
    );
    addDivider(slide);

    // ---- LEFT COLUMN: Ausgangslage (IST) ----
    const LX = PX;
    const LW = 5.7;
    addSectionLabel(slide, 'AUSGANGSLAGE (IST)', LX, BY, C.dkGray);

    const ausgangsBullets = [
        {
            head: 'Sechsstellige Anzahl an BÜ-Vorgängen p.a.',
            body: 'Die ERGO bearbeitet jährlich eine sechsstellige Anzahl an Bestandsübertragungen, die überwiegend als unstrukturierte E-Mails über Gruppenpostfächer eingehen'
        },
        {
            head: 'Überwiegend manuelle Bearbeitung',
            body: 'Jeder Vorgang durchläuft 3\u20134 manuelle Prüfschritte inkl. Vollständigkeitsprüfung, Maklervollmacht und Vertragsnummernabgleich'
        },
        {
            head: 'ERGO GPT nur eingeschränkt nutzbar',
            body: 'Die bestehende KI-Lösung verarbeitet ausschließlich einfache Text-E-Mails ohne Anhänge und deckt nur einen Bruchteil der Vorgänge ab'
        },
        {
            head: 'Unstrukturierte Eingangsdaten',
            body: 'Freitext-E-Mails, heterogene Anhänge (PDF, Word, Excel) und fehlende Standardisierung erschweren die automatisierte Verarbeitung'
        }
    ];

    let bulletY = BY + 0.38;
    const lBulletH = 0.68;
    ausgangsBullets.forEach(b => {
        slide.addShape('ellipse', {
            x: LX, y: bulletY + 0.05, w: 0.12, h: 0.12,
            fill: { color: C.dkGray }
        });
        slide.addText([
            { text: b.head, options: { bold: true, fontSize: 12, color: C.black, fontFace: FONT } },
            { text: ' \u2013 ' + b.body, options: { fontSize: 11, color: C.dkGray, fontFace: FONT } }
        ], {
            x: LX + 0.2, y: bulletY, w: LW - 0.2, h: lBulletH,
            fontFace: FONT, valign: 'top', wrap: true, lineSpacingMultiple: 1.0
        });
        bulletY += lBulletH + 0.02;
    });

    // ---- RIGHT COLUMN: Zielbild ----
    const RX = PX + LW + 0.35;
    const RW = SW - RX - PX;
    addSectionLabel(slide, 'ZIELBILD', RX, BY, C.dkGreen);

    const zielbildBullets = [
        {
            head: 'Interimslösung: KI-Agent für unstrukturierte E-Mails',
            body: 'Pragmatischer Einsatz eines KI-Agenten zur Verarbeitung aller eingehenden E-Mails inkl. Anhänge (Word, Excel, PDF, Vollmachten)'
        },
        {
            head: 'Zielbild: Strukturiertes Formular & API',
            body: 'Großmakler liefern BÜ-Daten künftig über ein standardisiertes Online-Formular oder eine API \u2013 unstrukturierte Eingangsdaten werden eliminiert'
        },
        {
            head: 'Hoher Automatisierungsgrad',
            body: 'Standardvorgänge vollautomatisch klassifiziert, extrahiert und an Robotics übergeben. Manuelle Prüfung nur für Sonderfälle'
        },
        {
            head: 'Bewertung der Lösungsoptionen',
            body: 'KI-Agent auf ERGO-Plattform (A) vs. Deloitte External API (B) vs. Formular/API als Zielbild'
        },
        {
            head: 'Durchlaufzeit von Tagen auf Minuten',
            body: 'KI-Erkennung von Vollmachten, automatisches Splitting von Multi-Verträgen und JSON-Ausgabe für Robotics'
        }
    ];

    let rBulletY = BY + 0.38;
    const rBulletH = 0.55;
    zielbildBullets.forEach(b => {
        slide.addShape('ellipse', {
            x: RX, y: rBulletY + 0.05, w: 0.12, h: 0.12,
            fill: { color: C.green }
        });
        slide.addText([
            { text: b.head, options: { bold: true, fontSize: 12, color: C.black, fontFace: FONT } },
            { text: ' \u2013 ' + b.body, options: { fontSize: 11, color: C.dkGray, fontFace: FONT } }
        ], {
            x: RX + 0.2, y: rBulletY, w: RW - 0.2, h: rBulletH,
            fontFace: FONT, valign: 'top', wrap: true, lineSpacingMultiple: 1.0
        });
        rBulletY += rBulletH + 0.02;
    });

    // ---- PROCESS DIAGRAM (full width, bottom) ----
    const procY = 4.55;
    const procH = 2.35;

    // Background box
    slide.addShape('roundRect', {
        x: PX, y: procY, w: BW, h: procH,
        rectRadius: 0.08,
        fill: { color: 'F8F9FA' },
        line: { color: C.ltGray, width: 0.5 }
    });

    // -- IST row --
    const istY = procY + 0.15;
    const rowH = 0.9;
    // IST label
    slide.addShape('roundRect', {
        x: PX + 0.15, y: istY + 0.2, w: 0.55, h: 0.45,
        rectRadius: 0.05, fill: { color: C.dkGray }
    });
    slide.addText('IST', {
        x: PX + 0.15, y: istY + 0.2, w: 0.55, h: 0.45,
        fontFace: FONT, fontSize: 11, bold: true, color: C.white,
        align: 'center', valign: 'middle'
    });

    const istNodes = [
        { label: 'E-Mails via\nGruppenpostfächer', color: C.blue, bg: 'F0F9FF', w: 1.6 },
        { label: 'Postkorbsystem', color: C.teal, bg: 'F0FDFA', w: 1.3 },
        { label: 'Manuelle\nPrüfung', color: C.orange, bg: 'FFFBF0', w: 1.2, pain: '3\u20134 Schritte' },
        { label: 'ERGO GPT', color: C.red, bg: 'FEF2F2', w: 1.1, pain: 'Begrenzt' },
        { label: 'Robotics / RPA', color: C.dkGreen, bg: 'F0FDF4', w: 1.3 }
    ];

    let nodeX = PX + 0.85;
    const nodeH = 0.75;
    istNodes.forEach((n, i) => {
        slide.addShape('roundRect', {
            x: nodeX, y: istY + 0.05, w: n.w, h: nodeH,
            rectRadius: 0.06,
            fill: { color: n.bg },
            line: { color: n.color, width: 1.5 }
        });
        const textRuns = [{ text: n.label, options: { fontSize: 10, color: C.text, fontFace: FONT } }];
        if (n.pain) {
            textRuns.push({ text: '\n' + n.pain, options: { fontSize: 9, color: C.red, fontFace: FONT, bold: true } });
        }
        slide.addText(textRuns, {
            x: nodeX, y: istY + 0.05, w: n.w, h: nodeH,
            fontFace: FONT, align: 'center', valign: 'middle', wrap: true, lineSpacingMultiple: 0.9
        });
        if (i < istNodes.length - 1) {
            slide.addText('\u2192', {
                x: nodeX + n.w, y: istY + 0.2, w: 0.35, h: 0.4,
                fontFace: FONT, fontSize: 14, color: C.mdGray, align: 'center', valign: 'middle'
            });
        }
        nodeX += n.w + 0.35;
    });

    // -- SOLL row --
    const sollY = procY + 1.2;
    // SOLL label
    slide.addShape('roundRect', {
        x: PX + 0.15, y: sollY + 0.25, w: 0.55, h: 0.45,
        rectRadius: 0.05, fill: { color: C.green }
    });
    slide.addText('SOLL', {
        x: PX + 0.15, y: sollY + 0.25, w: 0.55, h: 0.45,
        fontFace: FONT, fontSize: 11, bold: true, color: C.white,
        align: 'center', valign: 'middle'
    });

    // SOLL inputs (stacked)
    const sollInputX = PX + 0.85;
    const sollInputW = 1.7;
    // Email input
    slide.addShape('roundRect', {
        x: sollInputX, y: sollY, w: sollInputW, h: 0.45,
        rectRadius: 0.06,
        fill: { color: 'F0F9FF' }, line: { color: C.blue, width: 1.5 }
    });
    slide.addText('E-Mails via Gruppenpostfächer', {
        x: sollInputX, y: sollY, w: sollInputW, h: 0.45,
        fontFace: FONT, fontSize: 10, color: C.text, align: 'center', valign: 'middle'
    });
    // Formular input (NEW)
    slide.addShape('roundRect', {
        x: sollInputX, y: sollY + 0.52, w: sollInputW, h: 0.45,
        rectRadius: 0.06,
        fill: { color: 'F0FDF4' }, line: { color: C.dkGreen, width: 2 }
    });
    slide.addText('Strukturiertes Formular / API', {
        x: sollInputX, y: sollY + 0.52, w: sollInputW, h: 0.45,
        fontFace: FONT, fontSize: 10, color: C.text, align: 'center', valign: 'middle'
    });
    // NEU badge
    slide.addShape('roundRect', {
        x: sollInputX + sollInputW - 0.5, y: sollY + 0.45, w: 0.45, h: 0.2,
        rectRadius: 0.03, fill: { color: C.green }
    });
    slide.addText('NEU', {
        x: sollInputX + sollInputW - 0.5, y: sollY + 0.45, w: 0.45, h: 0.2,
        fontFace: FONT, fontSize: 8, bold: true, color: C.white, align: 'center', valign: 'middle'
    });

    // Arrow from inputs
    const sollArrow1X = sollInputX + sollInputW;
    slide.addText('\u2192', {
        x: sollArrow1X, y: sollY + 0.3, w: 0.35, h: 0.4,
        fontFace: FONT, fontSize: 14, color: C.mdGray, align: 'center', valign: 'middle'
    });

    // KI-Agent node
    const kiX = sollArrow1X + 0.35;
    const kiW = 1.5;
    slide.addShape('roundRect', {
        x: kiX, y: sollY + 0.12, w: kiW, h: 0.75,
        rectRadius: 0.06,
        fill: { color: 'F4FAE8' }, line: { color: C.green, width: 2 }
    });
    slide.addText('KI-Agent\n(Interim)', {
        x: kiX, y: sollY + 0.12, w: kiW, h: 0.75,
        fontFace: FONT, fontSize: 11, color: C.text, align: 'center', valign: 'middle',
        bold: true, wrap: true, lineSpacingMultiple: 0.9
    });

    // Arrow
    slide.addText('\u2192', {
        x: kiX + kiW, y: sollY + 0.3, w: 0.35, h: 0.4,
        fontFace: FONT, fontSize: 14, color: C.mdGray, align: 'center', valign: 'middle'
    });

    // Auto classification node
    const autoX = kiX + kiW + 0.35;
    const autoW = 1.9;
    slide.addShape('roundRect', {
        x: autoX, y: sollY + 0.12, w: autoW, h: 0.75,
        rectRadius: 0.06,
        fill: { color: 'F0FDFA' }, line: { color: C.teal, width: 1.5 }
    });
    slide.addText('Auto. Klassifikation\n& Extraktion', {
        x: autoX, y: sollY + 0.12, w: autoW, h: 0.75,
        fontFace: FONT, fontSize: 10, color: C.text, align: 'center', valign: 'middle', wrap: true
    });

    // Arrow
    slide.addText('\u2192', {
        x: autoX + autoW, y: sollY + 0.3, w: 0.35, h: 0.4,
        fontFace: FONT, fontSize: 14, color: C.mdGray, align: 'center', valign: 'middle'
    });

    // Robotics node
    const robX = autoX + autoW + 0.35;
    const robW = 1.3;
    slide.addShape('roundRect', {
        x: robX, y: sollY + 0.12, w: robW, h: 0.75,
        rectRadius: 0.06,
        fill: { color: 'F0FDF4' }, line: { color: C.dkGreen, width: 1.5 }
    });
    slide.addText('Robotics / RPA', {
        x: robX, y: sollY + 0.12, w: robW, h: 0.75,
        fontFace: FONT, fontSize: 10, color: C.text, align: 'center', valign: 'middle'
    });

    addFooter(slide);
    return slide;
}

/* ================================================
   T-12: PROJEKTPLAN & RESSOURCEN
   ================================================ */
function buildSlide12(pres) {
    const slide = pres.addSlide();
    slide.background = { color: C.white };

    addTitle(slide, [
        { text: 'Bestandsübertragung', options: { bold: true, fontFace: FONT } },
        { text: ' | Projektplan & Ressourcen', options: { fontFace: FONT } }
    ]);
    addSubtitle(slide,
        'Drei Phasen von der Initialisierung über die Implementierung bis zum Pilotbetrieb \u2013 ' +
        'mit dediziertem Deloitte-Team für Fachkonzeption, Steuerung und IT-Begleitung.'
    );
    addDivider(slide);

    // ---- GANTT CHART ----
    const ganttY = BY;
    const labelW = 2.8;
    const trackX = PX + labelW;
    const trackW = BW - labelW;
    const weekW = trackW / 20;

    // Week headers
    slide.addText('Woche', {
        x: PX, y: ganttY, w: labelW, h: 0.25,
        fontFace: FONT, fontSize: 10, color: C.mdGray, valign: 'middle', bold: true
    });
    for (let w = 1; w <= 20; w++) {
        slide.addText(w === 1 ? 'Wo. 1' : String(w), {
            x: trackX + (w - 1) * weekW, y: ganttY, w: weekW, h: 0.25,
            fontFace: FONT, fontSize: w === 1 ? 8 : 9, color: C.mdGray,
            align: 'center', valign: 'middle', bold: true
        });
    }
    slide.addShape('line', {
        x: PX, y: ganttY + 0.27, w: BW, h: 0,
        line: { color: C.ltGray, width: 1 }
    });

    // Phase rows
    const phases = [
        { name: 'Initialisierung &\nFachkonzept', badge: '1', color: C.green, start: 0, end: 8, label: 'W1\u2013W8' },
        { name: 'Implementierung', badge: '2', color: C.dkGreen, start: 6, end: 16, label: 'W7\u2013W16' },
        { name: 'Test, Pilot &\nRollout', badge: '3', color: C.teal, start: 14, end: 20, label: 'W15\u2013W20' }
    ];
    const rowH = 0.38;
    const rowGap = 0.04;
    let rowY = ganttY + 0.32;

    phases.forEach(phase => {
        // Badge
        slide.addShape('ellipse', {
            x: PX, y: rowY + 0.02, w: 0.32, h: 0.32,
            fill: { color: phase.color }
        });
        slide.addText(phase.badge, {
            x: PX, y: rowY + 0.02, w: 0.32, h: 0.32,
            fontFace: FONT, fontSize: 12, bold: true, color: C.white,
            align: 'center', valign: 'middle'
        });
        // Label
        slide.addText(phase.name, {
            x: PX + 0.4, y: rowY, w: labelW - 0.5, h: rowH,
            fontFace: FONT, fontSize: 11, color: C.text, valign: 'middle',
            wrap: true, lineSpacingMultiple: 0.85
        });
        // Track background
        slide.addShape('roundRect', {
            x: trackX, y: rowY + 0.03, w: trackW, h: rowH - 0.06,
            rectRadius: 0.03, fill: { color: 'FAFAFA' }
        });
        // Phase bar
        const barX = trackX + phase.start * weekW;
        const barW = (phase.end - phase.start) * weekW;
        slide.addShape('roundRect', {
            x: barX, y: rowY + 0.04, w: barW, h: rowH - 0.08,
            rectRadius: 0.05, fill: { color: phase.color }
        });
        slide.addText(phase.label, {
            x: barX, y: rowY + 0.04, w: barW, h: rowH - 0.08,
            fontFace: FONT, fontSize: 10, bold: true, color: C.white,
            align: 'center', valign: 'middle'
        });
        rowY += rowH + rowGap;
    });

    // Milestones
    const msY = rowY + 0.02;
    slide.addShape('line', {
        x: trackX, y: msY, w: trackW, h: 0,
        line: { color: C.ltGray, width: 1, dashType: 'dash' }
    });
    const milestones = [
        { week: 8, label: 'Fachkonzept' },
        { week: 11, label: 'PoC' },
        { week: 16, label: 'Feature Compl.' },
        { week: 19.5, label: 'Go-Live' }
    ];
    milestones.forEach(ms => {
        const msX = trackX + (ms.week - 0.5) * weekW;
        slide.addText('\u25C6', {
            x: msX - 0.1, y: msY - 0.06, w: 0.2, h: 0.2,
            fontFace: FONT, fontSize: 12, color: C.dkGreen,
            align: 'center', valign: 'middle'
        });
        slide.addText(ms.label, {
            x: msX - 0.5, y: msY + 0.1, w: 1.0, h: 0.2,
            fontFace: FONT, fontSize: 9, color: C.dkGray, bold: true,
            align: 'center', valign: 'top'
        });
    });

    // ---- PHASE DETAIL CARDS ----
    const cardY = msY + 0.38;
    const cardW = (BW - 0.4) / 3;
    const cardH = 1.4;

    const phaseDetails = [
        {
            title: 'Initialisierung & Fachkonzept', period: 'W1\u2013W8', color: C.green,
            items: [
                'Projekt-Setup, Stakeholder-Alignment',
                'IST-Prozessanalyse & Volumenerhebung',
                'Anforderungserhebung & SOLL-Design',
                'Architekturentscheidung (KI-Agent A/B, Formular/API)',
                'Fachkonzept & Business Case'
            ]
        },
        {
            title: 'Implementierung', period: 'W7\u2013W16', color: C.dkGreen,
            items: [
                'PoC KI-Agent (E-Mail + Anhänge)',
                'Produktiventwicklung & Integration',
                'Anbindung Postkorbsystem & Robotics',
                'Formular-/API-Konzept für Großmakler',
                'Sicherheits- & Datenschutzkonzept'
            ]
        },
        {
            title: 'Test, Pilot & Rollout', period: 'W15\u2013W20', color: C.teal,
            items: [
                'Integrationstests & UAT',
                'Feintuning Erkennungsqualität',
                'Pilotbetrieb mit echtem Volumen',
                'Schulung & Übergabe an ERGO',
                'Hyper-Care & Dokumentation'
            ]
        }
    ];

    phaseDetails.forEach((pd, i) => {
        const cx = PX + i * (cardW + 0.2);
        // Card bg
        slide.addShape('roundRect', {
            x: cx, y: cardY, w: cardW, h: cardH,
            rectRadius: 0.06,
            fill: { color: C.white },
            line: { color: C.ltGray, width: 0.5 }
        });
        // Top accent
        slide.addShape('rect', {
            x: cx, y: cardY, w: cardW, h: 0.05,
            fill: { color: pd.color }
        });
        // Header
        slide.addText([
            { text: pd.title, options: { bold: true, fontSize: 11, color: C.black, fontFace: FONT } },
            { text: '  ' + pd.period, options: { fontSize: 10, color: C.mdGray, fontFace: FONT } }
        ], {
            x: cx + 0.1, y: cardY + 0.1, w: cardW - 0.2, h: 0.25,
            fontFace: FONT, valign: 'middle'
        });
        // Items
        let itemY = cardY + 0.38;
        pd.items.forEach(item => {
            slide.addText('\u2022  ' + item, {
                x: cx + 0.12, y: itemY, w: cardW - 0.24, h: 0.19,
                fontFace: FONT, fontSize: 10, color: C.dkGray, valign: 'top', wrap: true
            });
            itemY += 0.2;
        });
    });

    // ---- STAFFING SECTION ----
    const staffSectionY = cardY + cardH + 0.15;
    slide.addText('DELOITTE-TEAM & STAFFING', {
        x: PX, y: staffSectionY, w: BW, h: 0.22,
        fontFace: FONT, fontSize: 11, bold: true, color: C.dkGray, letterSpacing: 1
    });

    // Staffing table
    const stY = staffSectionY + 0.25;
    const staffTableW = 8.2;

    const headerOpts = { bold: true, color: C.white, fill: { color: C.dkGreen }, fontFace: FONT, fontSize: 11, align: 'center', valign: 'middle' };
    const headerLeftOpts = { ...headerOpts, align: 'left' };

    const staffRows = [
        [
            { text: 'Rolle', options: headerLeftOpts },
            { text: 'Level', options: headerLeftOpts },
            { text: 'Phase 1\n(W1\u20138)', options: headerOpts },
            { text: 'Phase 2\n(W7\u201316)', options: headerOpts },
            { text: 'Phase 3\n(W15\u201320)', options: headerOpts }
        ],
        [
            { text: 'Projektleitung & Steuerung', options: { bold: true, align: 'left' } },
            { text: 'Manager', options: { align: 'left' } },
            { text: '\u2713', options: { align: 'center' } },
            { text: '\u2713', options: { align: 'center' } },
            { text: '\u2713', options: { align: 'center' } }
        ],
        [
            { text: 'Fachkonzeption & Prozess', options: { bold: true, align: 'left' } },
            { text: 'Senior Consultant', options: { align: 'left' } },
            { text: '\u2713', options: { align: 'center' } },
            { text: '\u2013', options: { align: 'center', color: C.mdGray } },
            { text: '\u2013', options: { align: 'center', color: C.mdGray } }
        ],
        [
            { text: 'KI / Data Engineer', options: { bold: true, align: 'left' } },
            { text: 'Consultant', options: { align: 'left' } },
            { text: '\u2713', options: { align: 'center' } },
            { text: '\u2713', options: { align: 'center' } },
            { text: '\u2713', options: { align: 'center' } }
        ],
        [
            { text: 'Junior Support', options: { bold: true, align: 'left' } },
            { text: 'Analyst', options: { align: 'left' } },
            { text: 'anteilig', options: { align: 'center', color: C.mdGray, italic: true } },
            { text: 'anteilig', options: { align: 'center', color: C.mdGray, italic: true } },
            { text: 'anteilig', options: { align: 'center', color: C.mdGray, italic: true } }
        ]
    ];

    slide.addTable(staffRows, {
        x: PX, y: stY, w: staffTableW,
        colW: [2.4, 1.4, 1.5, 1.5, 1.4],
        border: { type: 'solid', pt: 0.5, color: C.ltGray },
        fontFace: FONT, fontSize: 11, color: C.text,
        rowH: [0.35, 0.26, 0.26, 0.26, 0.26],
        autoPage: false, valign: 'middle'
    });

    // KPI cards
    const kpiX = PX + staffTableW + 0.25;
    const kpiW = BW - staffTableW - 0.25;
    const kpiData = [
        { phase: 'PHASE 1', val: '3 Pers.', detail: '1M + 1SC + 1C\n+ Junior Support', pt: '~140 PT', color: C.green },
        { phase: 'PHASE 2', val: '2 Pers.', detail: '1M + 1 KI/Data Eng.\n+ Junior Support', pt: '~125 PT', color: C.green, isPeak: true },
        { phase: 'PHASE 3', val: '2\u20131 Pers.', detail: 'Ramp-down\n+ 1 Hyper-Care', pt: '~45 PT', color: C.teal },
        { phase: 'GESAMT', val: '~310 PT', detail: '20 Wochen Laufzeit', pt: '', color: C.dkGreen, isTotal: true }
    ];

    let kpiY = stY;
    const kpiH = 0.35;
    kpiData.forEach(kpi => {
        const borderColor = kpi.isTotal ? C.dkGreen : kpi.isPeak ? C.green : C.ltGray;
        const bgColor = kpi.isTotal ? 'F0FDF4' : kpi.isPeak ? 'F4FAE8' : C.white;
        slide.addShape('roundRect', {
            x: kpiX, y: kpiY, w: kpiW, h: kpiH,
            rectRadius: 0.05,
            fill: { color: bgColor },
            line: { color: borderColor, width: kpi.isTotal || kpi.isPeak ? 1.5 : 0.5 }
        });
        // Phase label + value on one line
        const valColor = kpi.isTotal ? C.dkGreen : kpi.isPeak ? C.green : C.black;
        slide.addText([
            { text: kpi.phase + '  ', options: { fontSize: 8, bold: true, color: C.mdGray, fontFace: FONT } },
            { text: kpi.val, options: { fontSize: 13, bold: true, color: valColor, fontFace: FONT } },
            { text: kpi.pt ? '  ' + kpi.pt : '', options: { fontSize: 10, bold: true, color: C.dkGreen, fontFace: FONT } }
        ], {
            x: kpiX + 0.08, y: kpiY, w: kpiW - 0.16, h: kpiH,
            fontFace: FONT, valign: 'middle'
        });
        kpiY += kpiH + 0.03;
    });

    addFooter(slide);
    return slide;
}

/* ================================================
   EXPORT ENTRY POINT
   ================================================ */
export async function exportBUSlides(which) {
    const btn = document.querySelector('.slide-export-btn-active');
    try {
        if (btn) {
            btn.textContent = 'Wird exportiert...';
            btn.disabled = true;
        }
        await ensurePptxGenJS();

        const pres = new PptxGenJS();
        pres.defineLayout({ name: 'WIDESCREEN_16_9', width: SW, height: SH });
        pres.layout = 'WIDESCREEN_16_9';
        pres.author = 'Deloitte';
        pres.company = 'Deloitte';
        pres.subject = 'Bestandsübertragung';

        if (which === 'T-11' || which === 'both') buildSlide11(pres);
        if (which === 'T-12' || which === 'both') buildSlide12(pres);

        const filename = which === 'both'
            ? 'BÜ_Ausgangslage_Projektplan.pptx'
            : which === 'T-11'
                ? 'BÜ_Ausgangslage_Zielbild.pptx'
                : 'BÜ_Projektplan_Ressourcen.pptx';

        await pres.writeFile({ fileName: filename });
    } catch (err) {
        console.error('PPTX Export error:', err);
        alert('Fehler beim PPTX-Export: ' + err.message);
    } finally {
        if (btn) {
            btn.textContent = '\u2B07 PPTX';
            btn.disabled = false;
            btn.classList.remove('slide-export-btn-active');
        }
    }
}

// Expose to window for onclick handlers
window.exportBUSlides = exportBUSlides;
