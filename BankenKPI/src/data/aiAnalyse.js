// KI-gestützte KPI-Erläuterung mit Querlogik & Branchen-Realismus.
//
// Statt eines Live-LLM-Aufrufs verwenden wir hier deterministische
// Regeln, die typische Aussagen aus Bank-Reportings (Vorbild: NordLB
// Monatsbericht) abbilden. Die Causes greifen reale, aktuell wirkende
// Treiber auf:
//   • CRR III / Basel-IV-Output-Floor (in Kraft seit 01.01.2025)
//   • DORA (Operational Resilience seit Januar 2025)
//   • Verdi/AGV-Banken-Tarifabschluss 2024 (+11,5 % gestaffelt bis 2026)
//   • EZB-Zinssenkungszyklus 2024/25 und Hinterlegung in Margen
//   • Private-Credit-/Direct-Lending-Boom (Apollo, Ares, KKR)
//   • Commercial-Real-Estate-Distress (Büro-Stress)
//   • Inverse / abgeflachte Zinskurve, Fristentransformations-Druck
//   • US-Tarife (Trump 2.0) und gedämpfte deutsche Industriekonjunktur
//
// Die Texte unterstützen ein eigenes Inline-Markup:
//   **fett**          → bold
//   [red:Text]        → pastellrotes Highlight
//   [amber:Text]      → pastellgelbes Highlight
//   [green:Text]      → pastellgrünes Highlight
//   [blue:Text]       → pastellblaues Highlight
//   [violet:Text]     → pastellviolettes Highlight
//   [rose:Text]       → pastellrosa Highlight
//   [slate:Text]      → pastellgrau
// (siehe RichText.jsx)

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

// ─── Hauptkommentar (Konzern-Sicht) ───────────────────────────
export function buildKommentar() {
  const bullets = [];

  // 1. Neugeschäft Konzern + schwächstes Segment
  const ngKonzern = KPI_VALUES.neugeschaeft.konzern;
  const ngKonzernDev = deviationPct(ngKonzern.ist, ngKonzern.plan, false);
  const ngSegments = SEGMENTS.filter((s) => s.id !== 'konzern')
    .map((s) => {
      const c = KPI_VALUES.neugeschaeft[s.id];
      return { s, c, dev: deviationPct(c.ist, c.plan, false) };
    })
    .sort((a, b) => a.dev - b.dev);
  const ngWorst = ngSegments[0];

  bullets.push({
    headline: 'Neugeschäft Konzern – schwache Kreditnachfrage',
    severity: ampelColor(ngKonzern.ist, ngKonzern.plan, false),
    text:
      `Das Konzern-Neugeschäft liegt mit **${fmtAbs(ngKonzern.ist, 'MEUR')}** rund ` +
      `[red:${fmtPct(ngKonzernDev)}] unter Plan (${fmtAbs(ngKonzern.plan, 'MEUR')}). ` +
      `Besonders auffällig: Bereich **${ngWorst.s.label}** mit ${fmtAbs(ngWorst.c.ist, 'MEUR')} ` +
      `(Plan ${fmtAbs(ngWorst.c.plan, 'MEUR')}, [red:${fmtPct(ngWorst.dev)}]).`,
    causes: [
      'Gedämpfte **Investitionsneigung** im deutschen Mittelstand: BIP-Wachstum 2025 nur ' +
        '[amber:rund +0,3 %], Auftragseingänge im Maschinenbau weiter rückläufig.',
      '[blue:US-Zoll-Effekte] (Stahl/Aluminium/Auto unter Trump 2.0) verzögern Capex-Entscheidungen ' +
        'in Auto- und Zulieferindustrie – das **Kerngeschäftsfeld** der Firmenkundenfinanzierung.',
      '**Förderkredit-Pipeline:** KfW-261 (Wohngebäude-Förderung) und [green:KfW-298] (Klimaschutz Mittelstand) ' +
        'wurden zwar Q4/2025 nachgeschärft (Tilgungszuschuss bis 25 %), die Anträge laufen aber erst ' +
        '[slate:zeitversetzt H1/2026] in Auszahlung – Auszahlungslag drückt aktuelles Volumen.',
      'Hohe **Eigenkapitalquoten** im deutschen Mittelstand (Median ~32 %) führen zu ' +
        '[violet:Selbstfinanzierung] statt Bankfinanzierung; zusätzlich attraktive Termingeld-Konditionen ' +
        '(eigene Aktionen siehe Einlagen-Sektion) reduzieren den Kreditbedarf.',
      'Disintermediation durch [rose:Private-Credit-Fonds] (Apollo, Ares, KKR, Permira) bei Tickets ' +
        '> 100 Mio. € – konkret: **Cevo-Industries-LBO** (850 Mio. €) wurde Q4 an Apollo verloren, ' +
        'die boten 25 bp unter unserem Pricing-Floor.',
      'EZB-Leitzinssenkungen wirken erst **mit Verzögerung** auf Bauträger- und Projektfinanzierungen ' +
        'durch; viele Pipeline-Deals wurden 2024 [slate:auf Eis gelegt] und kommen erst H2/2026 zurück.',
    ],
    recommendation:
      '[green:Maßnahme:] **Pricing-Disziplin halten**, statt Volumen über Marge zu erkaufen. ' +
      'Vertriebsfokus auf [blue:Transformationsfinanzierung] (ESG-linked Loans, Energiewende, Reshoring) ' +
      'und Co-Lending-Strukturen mit Private-Credit-Partnern, um große Tickets nicht zu verlieren. ' +
      'KfW-Förderkredite als **Türöffner** für Cross-Sell auf eigene Mittel nutzen.',
  });

  // 2. Neugeschäftsmarge Structured Finance & Immobilien
  const ngmStructured = KPI_VALUES.neugeschaeftsmarge.structured;
  const ngmImmo = KPI_VALUES.neugeschaeftsmarge.immobilien;
  const ngmStrDev = deviationPct(ngmStructured.ist, ngmStructured.plan, false);
  const ngmImmoDev = deviationPct(ngmImmo.ist, ngmImmo.plan, false);
  bullets.push({
    headline: 'Neugeschäftsmarge – Wettbewerbsdruck im Spezialfinanzierungsgeschäft',
    severity: ampelColor(ngmStructured.ist, ngmStructured.plan, false),
    text:
      `Die Marge in **Structured Finance** liegt bei ${fmtAbs(ngmStructured.ist, '%')} und damit ` +
      `[red:${fmtPct(ngmStrDev)}] unter Plan. Bei **Immobilienkunden** zeigt sich mit ` +
      `${fmtAbs(ngmImmo.ist, '%')} ([amber:${fmtPct(ngmImmoDev)}]) ein ähnliches Bild.`,
    causes: [
      '**Race to the bottom** bei syndizierten Krediten zwischen Landesbanken (LBBW, BayernLB, Helaba, ' +
        'NordLB) – Margenkompression von [red:30–40 bp gegenüber 2023].',
      'Refinanzierungskosten am Kapitalmarkt sind durch [blue:Tightening der Senior-Spreads] gesunken, ' +
        '**FTP-Anpassungen** wurden aber teilweise vollständig an Vertrieb durchgereicht – Marge geht direkt ' +
        'in Pricing statt in Profitabilität.',
      'Im **Immobiliensegment** drückt der [rose:Office-Distress] (Leerstand 8–12 % in den Top-7-Städten) ' +
        'die Pricing-Macht: Konkrete Aktion **„Bauträger-Plus 2025/26"** (Forward-Darlehen mit ' +
        'flexibler Abruf-Frist 24 Mo) zog Volumen, aber zu Lasten von [amber:18 bp Marge].',
      '**Schuldscheindarlehen-Markt** boomt (Q4/2025: Volumen +35 % YoY) – Emittenten verhandeln aktiv ' +
        'gegen Konsortialkredit-Pricing, was die ganze Anlageklasse drückt.',
      'LBO-/Acquisition-Finance-Pipelines werden zunehmend von [violet:Direct-Lending-Mandaten] ' +
        'gewonnen – wir sind nur als Co-Lender mit dabei und akzeptieren deren Pricing.',
    ],
    recommendation:
      '[green:Maßnahme:] **Selektivität erhöhen** – Mindestmargen pro Risiko-Bucket disziplinarisch ' +
      'durchsetzen, schwache Deals ablehnen. [blue:Cross-Sell] (Zinssicherung, FX, ESG-Ratings) ' +
      'zur Margenkompensation hochfahren.',
  });

  // 3. CIR Privatkunden
  const cirPrivat = KPI_VALUES.cir.privatkunden;
  const cirPrivatDev = deviationPct(cirPrivat.ist, cirPrivat.plan, true);
  bullets.push({
    headline: 'Cost/Income Ratio Privatkunden – struktureller Effizienzdruck',
    severity: ampelColor(cirPrivat.ist, cirPrivat.plan, true),
    text:
      `Die **CIR im Privatkundengeschäft** liegt bei ${fmtAbs(cirPrivat.ist, '%')} und damit ` +
      `[red:7 Prozentpunkte über Plan] (${fmtAbs(cirPrivat.plan, '%')}). ` +
      `Im Sektorvergleich nicht ungewöhnlich – europäische Filialbanken bewegen sich [amber:zwischen 60 und 80 %], ` +
      `der EZB-Banken-Schnitt 2025 lag bei ~64 %. Aber: **klar über Steuerungsziel**.`,
    causes: [
      '[red:Tariferhöhungen] aus dem Verdi/AGV-Banken-Abschluss 2024 (**+11,5 % gestaffelt bis 2026**) ' +
        'belasten die Personalkosten voll – bei stagnierenden Provisionserträgen aktuell **kein direkter Hebel**.',
      '[blue:DORA-Umsetzung] (Operational-Resilience-Verordnung seit Januar 2025) bindet zweistellige ' +
        'IT-Budgets in **Härtungs- und Test-Pflichten**, ohne kurzfristig Erlöse zu generieren.',
      '**Filialnetz** ist in B-/C-Lagen weiterhin überproportioniert; Schließungen sind politisch und ' +
        'kundenseitig sensibel und wirken erst mit [slate:12–18 Monaten Verzögerung].',
      '[violet:Cloud-Migration] und Online-Banking-Modernisierung laufen parallel zu Bestandssystemen – ' +
        '**temporäre Doppelkosten** belasten 2025/26 die Run-Rate.',
      'Niedrige Kapitalmarkt-Volatilität dämpft das **Wertpapier-Provisionsgeschäft** – ein klassischer ' +
        '[rose:CIR-Hebel auf der Ertragsseite] wirkt aktuell nicht.',
    ],
    recommendation:
      '[green:Sofort:] Verdichtung Filialnetz in [amber:B-/C-Lagen], Verlagerung Standardberatung in Video-Beratung. ' +
      '[blue:Mittelfristig:] **Provisionsoffensive Wertpapier** – DAX und Euro-Stoxx 50 nahe Allzeithoch ' +
      'machen Beratungseinstiege leichter.',
  });

  // 3b. Einlagen Privatkunden – Produktwirkung Tagesgeld
  const einlPrivat = KPI_VALUES.einlagenvolumen.privatkunden;
  const einlPrivatDev = deviationPct(einlPrivat.ist, einlPrivat.plan, false);
  const einlMargePrivat = KPI_VALUES.einlagenmarge.privatkunden;
  bullets.push({
    headline: 'Privatkunden-Einlagen – Produktwirkung Tagesgeld-Aktion',
    severity: ampelColor(einlPrivat.ist, einlPrivat.plan, false),
    text:
      `**Einlagenvolumen Privatkunden** liegt bei ${fmtAbs(einlPrivat.ist, 'MEUR')} und damit ` +
      `[amber:${fmtPct(einlPrivatDev)}] unter Plan (${fmtAbs(einlPrivat.plan, 'MEUR')}). ` +
      `Die **Einlagenmarge** kompensiert mit ${fmtAbs(einlMargePrivat.ist, '%')} (Plan ` +
      `${fmtAbs(einlMargePrivat.plan, '%')}) den Volumen-Shortfall – das Bild ist also gemischt.`,
    causes: [
      '[green:Tagesgeld-Aktion „PlusZins 12":] **2,75 % p. a.** für Neugelder ab 5.000 € im Aktionszeitraum ' +
        'November–Dezember 2025 zog [violet:rund 1,2 Mrd. €] Frischgeld – allein in den letzten 4 Wochen ' +
        '+8 % Tagesgeld-Bestand. Sprung im Bestand klar produktgetrieben.',
      '**Wettbewerb durch [rose:Trade Republic] (3,25 % auf verzinstes Verrechnungskonto bis 50k €) ' +
        'und Scalable Capital (3,50 % Prime+)** zieht aktive Sparer-Cluster ab; Aktion war Reaktion, nicht Initiative.',
      '**Festgeld-Kampagne „Sicher 24"** (12 Mo: 2,90 %; 24 Mo: 3,00 %) lief seit 01.10.2025 – brachte ' +
        '[green:850 Mio. € Festgeld-Bindung], wirkt aber **nicht** auf Einlagenvolumen Privatkunden, da ' +
        'in eigener Bilanzposition geführt.',
      'Strukturelle Umschichtung: Bestandskunden allokieren stärker in [blue:Wertpapiere] – DAX-ATH und ' +
        'Sparplan-Boom (>2 Mio. aktive Pläne, +15 % YoY) ziehen Liquidität aus Tages-/Sichteinlagen.',
      '**Riester-Auszahlungsphase:** zunehmend Cohorten in Auszahlungsphase reduzieren Einlagenbestand ' +
        '(demografischer Effekt, im Plan unterzeichnet).',
      '[amber:Pass-Through-Quote] auf Einlagen ist 2025 marktweit auf ~45 % gestiegen (von ~25 % in 2023) – ' +
        'die Marge kompensiert dadurch das Volumen, aber **strukturelle Margenerosion ist absehbar**.',
    ],
    recommendation:
      '[green:Sofort:] **Folge-Aktion** „PlusZins Treue" für Aktions-Neukunden bei Verlängerung über 31.03.2026 ' +
      'hinaus – Halten der gewonnenen 1,2 Mrd. € hat höchste Priorität (Loss-Aversion). ' +
      '[blue:Mittelfristig:] Verschiebung von Tagesgeld in **Wertpapier-Sparplan** (höhere Provisionsmarge, ' +
      'niedrigere Funding-Belastung) – Cross-Sell-Kampagne in Q1/2026 auflegen.',
  });

  // 4. RoRaC Treasury
  const rrTreasury = KPI_VALUES.roRac.treasury;
  const rrStructured = KPI_VALUES.roRac.structured;
  bullets.push({
    headline: 'RoRaC Treasury – negative Profitabilität, Bondbuch-Altlast',
    severity: ampelColor(rrTreasury.ist, rrTreasury.plan, false),
    text:
      `Treasury weist mit **${fmtAbs(rrTreasury.ist, '%')}** RoRaC einen [red:negativen Wert] aus – ` +
      `klar unter Plan (${fmtAbs(rrTreasury.plan, '%')}). Im Kontrast steht **Structured Finance** ` +
      `mit [green:${fmtAbs(rrStructured.ist, '%')}] auf Planniveau.`,
    causes: [
      '**Bondbuch-Altlast** aus der Niedrigzinsphase: Bundesanleihen mit Kupons < 1 % wurden 2020–22 ' +
        'aufgebaut, in der Marktbewertung resultieren [red:realisierte Verluste] bei jeder Umschichtung.',
      '[blue:Inverse / flache Zinskurve] (10y–2y zeitweise unter 20 bp) drückt klassische ' +
        '**Fristentransformations-Erträge** seit 2023.',
      '[amber:TLTRO-III-Rückführung] hat günstige EZB-Funding-Konditionen abgelöst – Refinanzierung ' +
        'erfolgt jetzt zu Marktkonditionen mit **deutlich höherem Carry**.',
      'Hedge-Ineffizienzen bei Zinsswaps in volatilen Phasen 2024 führten zu [rose:Bewertungs- und ' +
        'Realisierungsverlusten] in der Steuerungsbilanz.',
      '**Liquiditätspuffer** (HQLA für LCR/NSFR) bindet Bilanz unprofitabel; Ertrag aus Anlage in ' +
        '[slate:kurzlaufenden Staatsanleihen] reicht nicht für die ihn finanzierende Eigenkapitalverzinsung.',
    ],
    recommendation:
      '[green:Maßnahme:] **Aktive Bondbuch-Bereinigung** – Tail-Risiken realisieren, neue Tranchen mit ' +
      'aktuellen Kupons aufbauen. [blue:Hedging-Strategie überprüfen] (DV01-Limits, Convexity-Hedges). ' +
      '**Funds-Transfer-Pricing** transparent machen, damit Vertriebseinheiten den Treasury-Beitrag korrekt sehen.',
  });

  // 5. RWA & Kapitalbindung
  const rwaKonzern = KPI_VALUES.rwa.konzern;
  const rwaDev = deviationPct(rwaKonzern.ist, rwaKonzern.plan, true);
  const rwaProd = KPI_VALUES.rwaProd.konzern;
  const ngmKonzern = KPI_VALUES.neugeschaeftsmarge.konzern;
  bullets.push({
    headline: 'RWA & Kapitalbindung – Basel-IV-Effekte schlagen durch',
    severity: ampelColor(rwaKonzern.ist, rwaKonzern.plan, true),
    text:
      `Die Konzern-RWA liegen bei **${fmtAbs(rwaKonzern.ist, 'MEUR')}** und damit ` +
      `[red:${fmtPct(-rwaDev)}] über Plan (${fmtAbs(rwaKonzern.plan, 'MEUR')}). ` +
      `Zusammen mit der gedrückten Marge (Konzern-Neugeschäftsmarge ${fmtAbs(ngmKonzern.ist, '%')}) ` +
      `fällt die **RWA-Produktivität** auf [amber:${fmtAbs(rwaProd.ist, '%')}] (Plan ${fmtAbs(rwaProd.plan, '%')}).`,
    causes: [
      '[red:CRR III / Basel IV] in Kraft seit **01.01.2025**: der **Output-Floor** (zunächst 50 %, schrittweise auf ' +
        '72,5 % bis 2030) hebt die RWAs interner Modelle deutlich an.',
      'Revidierter [blue:Standardansatz für Kreditrisiko] (SA-CR): höhere Risikogewichte für ' +
        '**unrated Corporates** und Spezialfinanzierungen.',
      'Rating-Migrationen in [rose:Commercial Real Estate] (Office-Stress, ECRE-Migrationsrate +180 bp ' +
        'gegenüber 2023) ziehen RWA hoch, ohne dass das Volumen wächst.',
      'Neuer Standardansatz für [violet:operationelles Risiko] (SMA) ersetzt AMA – führt bei großen ' +
        'Banken oft zu [amber:+10–15 %] Op-Risk-RWA.',
      '**Leverage-Ratio-Puffer** für G-SIBs/O-SIIs zusätzlich aufgebaut, um Aufsichts-Headroom zu sichern.',
    ],
    recommendation:
      '[green:Maßnahme:] **RWA-Effizienz** als KPI in der Vertriebssteuerung verankern (Marge je RWA). ' +
      '[blue:Synthetische Verbriefungen] (SRT) für homogene Portfolios prüfen, um Kapital freizusetzen. ' +
      '**Pricing-Modelle** an Output-Floor-Realität anpassen, statt mit IRB-Annahmen alter Welt zu rechnen.',
  });

  // 6. Top-Auffälligkeit aus Ranking
  const ranked = rankAbweichungen();
  const usedIds = new Set(['neugeschaeft', 'cir', 'roRac', 'rwa', 'neugeschaeftsmarge']);
  const riskTop = ranked.find((r) => r.ampel === 'red' && !usedIds.has(r.kpi.id));
  if (riskTop) {
    bullets.push({
      headline: `Aktivmarge ${riskTop.segment.label} – Spread-Kompression`,
      severity: 'red',
      text:
        `**${riskTop.kpi.label}** im Bereich **${riskTop.segment.label}** liegt bei ` +
        `${fmtAbs(riskTop.cell.ist, riskTop.kpi.unit)} (Plan ${fmtAbs(riskTop.cell.plan, riskTop.kpi.unit)}, ` +
        `[red:${fmtPct(riskTop.dev)}]).`,
      causes: [
        '[blue:FRTB] (Fundamental Review of the Trading Book, Inkrafttreten 2025/26) verteuert ' +
          'das **Eigenhandels-Buch** über höhere Marktrisiko-Kapitalanforderungen.',
        '[amber:Niedrige Vola] in Aktien (VIX zeitweise < 14) und Zinsen drückt **Kunden-Aktivität** ' +
          'in Derivaten – bei gleichbleibenden Fixkosten entsteht Margendruck.',
        'Spread-Kompression im [rose:Anleihen-Market-Making]: enge Bid/Ask-Spreads durch elektronischen ' +
          'Handel und HFT-Wettbewerb (Citadel Securities, Jump Trading).',
        '**Migration auf T+1** (US bereits live, EU 11.10.2027 geplant) erfordert Vorabinvestitionen ' +
          'in [violet:Settlement-Infrastruktur], die nicht direkt erlöswirksam sind.',
      ],
      recommendation:
        '[green:Maßnahme:] Re-Allocation Trading-Capital weg von [slate:Low-Margin-Flow-Geschäft] hin zu ' +
        '**strukturierten Lösungen** für Firmenkunden (FX-Hedging, Zinssicherung) – dort ist Pricing-Macht ' +
        'höher und der **RWA-Hebel** günstiger.',
    });
  }

  return bullets;
}

// ─── Erläuterung pro KPI/Segment (für Detailmodal) ────────────
export function explainKpiSegment(kpiId, segmentId) {
  const kpi = findKpi(kpiId);
  const segment = SEGMENTS.find((s) => s.id === segmentId);
  const cell = KPI_VALUES[kpiId]?.[segmentId];
  if (!kpi || !segment || !cell) return null;

  const dev = deviationPct(cell.ist, cell.plan, kpi.invertTrend);
  const ampel = ampelColor(cell.ist, cell.plan, kpi.invertTrend);

  // Querbezüge
  const crossRefs = [];
  if (kpiId === 'aktivmarge') {
    const v = KPI_VALUES.aktivvolumen?.[segmentId];
    if (v) crossRefs.push(`Korrespondierendes **Aktivvolumen**: ${fmtAbs(v.ist, 'MEUR')} (Plan ${fmtAbs(v.plan, 'MEUR')}).`);
  } else if (kpiId === 'aktivvolumen') {
    const m = KPI_VALUES.aktivmarge?.[segmentId];
    if (m) crossRefs.push(`Korrespondierende **Aktivmarge**: ${fmtAbs(m.ist, '%')} (Plan ${fmtAbs(m.plan, '%')}).`);
  } else if (kpiId === 'einlagenmarge') {
    const v = KPI_VALUES.einlagenvolumen?.[segmentId];
    if (v) crossRefs.push(`Korrespondierendes **Einlagenvolumen**: ${fmtAbs(v.ist, 'MEUR')} (Plan ${fmtAbs(v.plan, 'MEUR')}).`);
  } else if (kpiId === 'einlagenvolumen') {
    const m = KPI_VALUES.einlagenmarge?.[segmentId];
    if (m) crossRefs.push(`Korrespondierende **Einlagenmarge**: ${fmtAbs(m.ist, '%')} (Plan ${fmtAbs(m.plan, '%')}).`);
  } else if (kpiId === 'rwaProd') {
    const ng = KPI_VALUES.neugeschaeftsmarge?.[segmentId];
    const rwa = KPI_VALUES.rwa?.[segmentId];
    if (ng) crossRefs.push(`**Neugeschäftsmarge**: ${fmtAbs(ng.ist, '%')} (Plan ${fmtAbs(ng.plan, '%')}).`);
    if (rwa) crossRefs.push(`**RWA**: ${fmtAbs(rwa.ist, 'MEUR')} (Plan ${fmtAbs(rwa.plan, 'MEUR')}).`);
  } else if (kpiId === 'roRac') {
    const cir = KPI_VALUES.cir?.[segmentId];
    if (cir) crossRefs.push(`**Cost/Income Ratio**: ${fmtAbs(cir.ist, '%')} (Plan ${fmtAbs(cir.plan, '%')}).`);
  } else if (kpiId === 'cir') {
    const rrc = KPI_VALUES.roRac?.[segmentId];
    if (rrc) crossRefs.push(`**RoRaC**: ${fmtAbs(rrc.ist, '%')} (Plan ${fmtAbs(rrc.plan, '%')}).`);
  } else if (kpiId === 'neugeschaeft') {
    const m = KPI_VALUES.neugeschaeftsmarge?.[segmentId];
    if (m) crossRefs.push(`**Neugeschäftsmarge**: ${fmtAbs(m.ist, '%')} (Plan ${fmtAbs(m.plan, '%')}).`);
  } else if (kpiId === 'neugeschaeftsmarge') {
    const v = KPI_VALUES.neugeschaeft?.[segmentId];
    if (v) crossRefs.push(`Korrespondierendes **Neugeschäft**: ${fmtAbs(v.ist, 'MEUR')} (Plan ${fmtAbs(v.plan, 'MEUR')}).`);
  }

  // Branchen-Causes je KPI – mit konkretem Produkt-Know-how
  const causesByKpi = {
    neugeschaeft: [
      'Schwache **Investitionsneigung** im Mittelstand (BIP-Wachstum 2025 ~+0,3 %).',
      '[blue:US-Tarife] auf Stahl/Auto verzögern Capex-Entscheidungen in Industrie- und Zulieferkernen.',
      '**KfW-298 Klimaschutz Mittelstand** und **KfW-261 Wohngebäude** Q4/2025 nachgeschärft – ' +
        '[green:Antragsvolumen +28 % MoM], aber Auszahlungs-Lag von ~3 Monaten drückt aktuelles Ist.',
      '**Konsumentenkredit-Aktion „2,99 % Frühjahr"** (Reaktion auf Klarna/Smava-Wettbewerb) – ' +
        '[violet:hält Volumen], drückt aber die Marge.',
      'Disintermediation durch [rose:Private-Credit-Fonds] bei Tickets > 100 Mio. €.',
    ],
    neugeschaeftsmarge: [
      '**Wettbewerbsdruck** zwischen Landesbanken bei syndizierten Krediten ([red:30–40 bp Margenkompression]).',
      '**FTP-Pass-Through:** EZB-Zinssenkungen werden im Vertrieb [amber:vollständig] an Kunden weitergegeben.',
      'Konkrete Aktion **„Bauträger-Plus 2025/26"** (Forward 24 Mo) zog Volumen, kostete [violet:18 bp Marge].',
      '[rose:Schuldscheindarlehen-Markt] +35 % YoY – Druck auf das Konsortialkredit-Pricing.',
    ],
    aktivvolumen: [
      'Bestandsabbau in [rose:Commercial Real Estate] (Office-Stress, Refinanzierungsverzicht).',
      '**Sondertilgungen** durch Kunden bei niedrigeren Zinsen – v. a. in der **Baufinanzierung 10y fest**.',
      'Aktion **„Bau-Direkt 3,49 %"** (10 Jahre fest, statt 3,75 % Standard) brachte [green:300 Mio. € Sondergeschäft], ' +
        'reicht aber nicht für den Plan.',
      'Strenge [blue:Risikoselektion] (höhere Spread-Anforderungen) reduziert Conversion.',
    ],
    aktivmarge: [
      '**Refinanzierungskosten** stiegen schneller als Aktivpreise (Pass-Through-Lag).',
      'Aktion **„Bau-Direkt 3,49 %"** brachte Volumen, drückte aber [amber:die Bestandsmarge].',
      '[amber:Kompression] Bid/Ask-Spreads im Markets-Geschäft durch elektronischen Handel & HFT.',
      'Hoher Anteil [slate:variabel verzinster Altbestand] mit limitierter Repricing-Macht.',
    ],
    einlagenvolumen: [
      '[green:Tagesgeld-Aktion „PlusZins 12":] **2,75 % p. a.** für Neugelder ab 5.000 € (Aktionszeitraum ' +
        'Nov–Dez 2025) – [violet:+1,2 Mrd. €] Frischgeld, sichtbarer Sprung im Bestand.',
      '**Festgeld „Sicher 24"** (12 Mo: 2,90 % / 24 Mo: 3,00 %) seit 01.10.2025 – [green:850 Mio. € Bindung].',
      '**[rose:Trade Republic] 3,25 % und Scalable 3,50 %** ziehen aktive Sparer aus dem Tagesgeldbestand ab.',
      'Strukturelle Umschichtung in **Wertpapier-Sparpläne** (DAX-ATH, Sparplan-Boom +15 % YoY).',
      'Abfluss zu [blue:Lebensversicherung] / Riester bei wieder positiven Garantiezinsen.',
    ],
    einlagenmarge: [
      '**Pass-Through-Quote** auf Einlagen marktweit auf ~45 % gestiegen (von ~25 % in 2023).',
      'Tagesgeld-Aktionen wie [green:„PlusZins 12" mit 2,75 %] drücken **bewusst** die Marge auf Aktions-Tickets.',
      'EZB-Zinssenkungen treffen [amber:zeitversetzt] auf Re-Pricing der Kundenbestände.',
      'Negativzins-Phase 2020–22 wirkt mental nach – Kunden fordern aktiv höhere Konditionen.',
    ],
    rwa: [
      '[red:CRR III / Basel IV] seit 01.01.2025 mit **Output-Floor 50 %** (steigend bis 72,5 % bis 2030).',
      'Revidierter [blue:Standardansatz Kreditrisiko] (SA-CR) – höhere Gewichte für unrated Corporates.',
      'Rating-Migrationen in [rose:Commercial Real Estate] und Leveraged-Finance-Portfolios.',
      'Neuer **Standardansatz Op-Risk** (SMA): typisch [amber:+10–15 %] Op-Risk-RWA.',
      'Konkret: **internes Real-Estate-Portfolio** durch Output-Floor [violet:+12 pp] auf RWA-Gewicht.',
    ],
    rwaProd: [
      'RWA-Anstieg durch [red:Basel-IV-Implementierung] schneller als Margenanpassung.',
      'Vertrieb steuert noch nicht durchgängig auf [blue:Marge je RWA] – fehlende Transparenz im FTP.',
      '[violet:Synthetische Verbriefungen] (SRT) als Hebel werden noch unzureichend eingesetzt.',
    ],
    roRac: [
      'Verzinsung des **regulatorischen Kapitals** durch [red:Basel-IV-Effekt] erschwert.',
      'Bondbuch-Altlasten (niedrigverzinste Bundesanleihen, Kupon < 1 %) drücken den **Treasury-Beitrag**.',
      'Verkauf eines **1,2 Mrd. € Bundesanleihen-Pakets** (Kupon 0,5 %, fällig 2031) zur Bilanz-Bereinigung – ' +
        '[red:Realisierungsverlust ~35 Mio. €].',
      '[blue:Inverse Zinskurve] reduziert den Fristentransformations-Beitrag seit 2023.',
    ],
    cir: [
      '[red:Verdi/AGV-Banken-Tarif 2024]: **+11,5 %** gestaffelt bis 2026 – voll personalkostenwirksam.',
      '[blue:DORA] (Operational Resilience seit 01/2025) bindet zweistellige IT-Budgets.',
      '**Filialkosten** weiter überproportioniert – Schließungen wirken erst mit [slate:12–18 Monaten Verzögerung].',
      '[violet:Cloud-Migration] parallel zu Legacy-Systemen erzeugt temporäre Doppelkosten.',
      '**Sparplan-Boom** drückt durchschnittliche Order-Provision (Pauschal 1,75 €/Order statt Front-End-Provision).',
    ],
  };
  const causes = causesByKpi[kpi.id] || [];

  // Headline
  let headline;
  if (ampel === 'green') {
    headline = `**${kpi.label}** im Segment **${segment.label}** liegt mit ${fmtAbs(cell.ist, kpi.unit)} ` +
      `[green:im Plan] (${fmtAbs(cell.plan, kpi.unit)}, ${fmtPct(dev)}).`;
  } else if (ampel === 'yellow') {
    headline = `**${kpi.label}** im Segment **${segment.label}** liegt bei ${fmtAbs(cell.ist, kpi.unit)} und damit ` +
      `[amber:leicht unter Plan] (${fmtAbs(cell.plan, kpi.unit)}, ${fmtPct(dev)}).`;
  } else {
    headline = `**${kpi.label}** im Segment **${segment.label}** weist mit ${fmtAbs(cell.ist, kpi.unit)} eine ` +
      `[red:kritische Abweichung] (${fmtPct(dev)}) gegenüber Plan (${fmtAbs(cell.plan, kpi.unit)}) auf.`;
  }

  // Empfehlung
  let recommendation;
  if (ampel === 'green') {
    recommendation = '[green:Performance stabil] – aktuelle Steuerungslogik beibehalten und Best Practices ' +
      'auf vergleichbare Segmente skalieren.';
  } else if (ampel === 'yellow') {
    recommendation = 'Kurzfristige Maßnahmen prüfen: [amber:Pricing-Anpassung], **Vertriebsfokus** auf ' +
      'margenstarke Produkte, ggf. Kosten-Hebel auf Sachkostenseite.';
  } else {
    recommendation = '[red:Eskalation] in den Steuerungskreis. **Ursachenanalyse** mit Querschnitt aus ' +
      'Volumen × Marge × Kapitalbindung. Maßnahmenplan mit klaren Owners und [blue:Wirkungstermin H1/2026].';
  }

  return { headline, ampel, dev, crossRefs, causes, recommendation };
}

// ─── Plain-Text-Variante für PPT-Export ───────────────────────
function stripMarkup(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[(?:red|amber|yellow|green|blue|violet|rose|slate):(.+?)\]/g, '$1');
}

export function buildKommentarPlainText() {
  return buildKommentar().map((b) => {
    const text = stripMarkup(b.text);
    const causes = b.causes.map((c) => '· ' + stripMarkup(c)).join('\n');
    const reco = stripMarkup(b.recommendation);
    return {
      headline: b.headline,
      severity: b.severity,
      text,
      causes,
      recommendation: reco,
    };
  });
}
