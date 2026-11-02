// KI-gestützte KPI-Erläuterung.
// Pro KPI wird zwischen
//   • externen Effekten (Branchen-, Markt-, Regulatorik-Treiber, die alle
//     Banken in ähnlicher Weise treffen) und
//   • internen Effekten (eigene Konzern-Aktionen, Pricing-Entscheidungen,
//     Pipeline-Entwicklungen, Bilanz-Bereinigungen)
// unterschieden.
//
// Texte unterstützen Inline-Markup `**fett**` (siehe RichText.jsx).
// Pastell-Highlights wurden auf Wunsch deaktiviert; nur fett bleibt als
// Hervorhebung sichtbar.

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

// ═══ Hauptkommentar (Konzern-Sicht) ═══════════════════════════
export function buildKommentar() {
  const bullets = [];

  // ── 1. Neugeschäft Konzern ────────────────────────────────
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
      `Das Konzern-Neugeschäft liegt mit **${fmtAbs(ngKonzern.ist, 'MEUR')}** rund ${fmtPct(ngKonzernDev)} unter Plan ` +
      `(${fmtAbs(ngKonzern.plan, 'MEUR')}). Besonders auffällig: Bereich **${ngWorst.s.label}** mit ` +
      `${fmtAbs(ngWorst.c.ist, 'MEUR')} (Plan ${fmtAbs(ngWorst.c.plan, 'MEUR')}, ${fmtPct(ngWorst.dev)}).`,
    externalEffects: [
      'Gedämpfte **Investitionsneigung** im deutschen Mittelstand: BIP-Wachstum 2025 nur rund +0,3 %, ' +
        'Auftragseingänge im Maschinenbau weiter rückläufig.',
      '**US-Zoll-Effekte** (Stahl/Aluminium/Auto unter Trump 2.0) verzögern Capex-Entscheidungen ' +
        'in Auto- und Zulieferindustrie – das Kerngeschäftsfeld der Firmenkundenfinanzierung.',
      'Hohe **Eigenkapitalquoten** im Mittelstand (Median ~32 %) führen zu Selbstfinanzierung statt Bankfinanzierung.',
      '**Disintermediation** durch Private-Credit-Fonds (Apollo, Ares, KKR, Permira) bei Tickets > 100 Mio. €.',
      'EZB-Leitzinssenkungen wirken erst **mit Verzögerung** auf Bauträger- und Projektfinanzierungen durch.',
    ],
    internalEffects: [
      '**Cevo-Industries-LBO** (850 Mio. €) wurde Q4 an Apollo verloren – Wettbewerber bot 25 bp unter ' +
        'unserem **Pricing-Floor**, eigene Margenuntergrenze nicht aufgeweicht.',
      '**Eigene Förderkredit-Pipeline:** KfW-261- und KfW-298-Anträge +28 % MoM, durch ~3 Monate ' +
        '**Auszahlungs-Lag** noch nicht volumenwirksam (Auszahlung erst H1/2026).',
      'Konzern-eigene **Risikoselektion** in Commercial Real Estate verschärft (Office-Stop seit Q3/2025) – ' +
        'reduziert Pipeline um geschätzt 1,5 Mrd. € im Zielsegment.',
      'Strategische Entscheidung gegen **Wachstum in Konsumentenkrediten** ohne Provisionspartner – ' +
        'Volumen wird bewusst nicht über Online-Marktplätze (Smava, Check24) gesucht.',
    ],
    recommendation:
      '**Pricing-Disziplin halten**, statt Volumen über Marge zu erkaufen. Vertriebsfokus auf ' +
      '**Transformationsfinanzierung** (ESG-linked Loans, Energiewende, Reshoring) und Co-Lending mit ' +
      'Private-Credit-Partnern, um große Tickets nicht zu verlieren. KfW-Förderkredite als **Türöffner** ' +
      'für Cross-Sell auf eigene Mittel nutzen.',
  });

  // ── 2. Neugeschäftsmarge SF / Immobilien ─────────────────
  const ngmStructured = KPI_VALUES.neugeschaeftsmarge.structured;
  const ngmImmo = KPI_VALUES.neugeschaeftsmarge.immobilien;
  const ngmStrDev = deviationPct(ngmStructured.ist, ngmStructured.plan, false);
  const ngmImmoDev = deviationPct(ngmImmo.ist, ngmImmo.plan, false);
  bullets.push({
    headline: 'Neugeschäftsmarge – Wettbewerbsdruck im Spezialfinanzierungsgeschäft',
    severity: ampelColor(ngmStructured.ist, ngmStructured.plan, false),
    text:
      `Marge in **Structured Finance** bei ${fmtAbs(ngmStructured.ist, '%')} (${fmtPct(ngmStrDev)} unter Plan). ` +
      `Bei **Immobilienkunden** ${fmtAbs(ngmImmo.ist, '%')} (${fmtPct(ngmImmoDev)}) – ähnliches Bild.`,
    externalEffects: [
      '**Race to the bottom** bei syndizierten Krediten unter den Landesbanken (LBBW, BayernLB, Helaba, ' +
        'NordLB) – Margenkompression von 30–40 bp gegenüber 2023.',
      '**Schuldscheindarlehen-Markt** boomt (Q4/2025: Volumen +35 % YoY) – Emittenten verhandeln aktiv ' +
        'gegen Konsortialkredit-Pricing, was die ganze Anlageklasse drückt.',
      'LBO-/Acquisition-Finance-Pipelines werden zunehmend von **Direct-Lending-Mandaten** gewonnen.',
      '**Office-Distress** (Leerstand 8–12 % in Top-7-Städten) drückt die Pricing-Macht im Immobilien-Segment ' +
        'sektorweit – alle Banken akzeptieren niedrigere Margen statt höheres Risiko.',
      '**Tightening der Senior-Spreads** am Kapitalmarkt – aller Refinanzierungsvorteil wird im ' +
        'Wettbewerb weitergegeben.',
    ],
    internalEffects: [
      '**Eigene FTP-Anpassung** Q3/2025: Refinanzierungsvorteil wurde **vollständig** an Vertriebseinheiten ' +
        'weitergegeben (statt 50/50-Split) – gewünschter Vertriebsimpuls, aber **direkt margenmindernd**.',
      'Eigene Aktion **„Bauträger-Plus 2025/26"** (Forward-Darlehen 24 Mo Abruffrist) zog 1,1 Mrd. € ' +
        'Volumen, kostete dafür **18 bp Marge** im Mittel.',
      '**Selbstgewählte Konzentration** auf Investment-Grade-Tickets im SF-Buch: niedrigere Default-Erwartung ' +
        'rechtfertigt RAROC-konform niedrigere Marge – aber Plan war ambitionierter gesetzt.',
      'Internes Pricing-Tool noch **nicht auf neue SA-CR-Risikogewichte umgestellt** – Underpricing in ' +
        'Sub-IG-Bereichen seit Januar 2025.',
    ],
    recommendation:
      '**Selektivität erhöhen** – Mindestmargen pro Risiko-Bucket disziplinarisch durchsetzen, schwache Deals ' +
      'ablehnen. **Cross-Sell** (Zinssicherung, FX, ESG-Ratings) zur Margenkompensation hochfahren.',
  });

  // ── 3. CIR Privatkunden ──────────────────────────────────
  const cirPrivat = KPI_VALUES.cir.privatkunden;
  const cirPrivatDev = deviationPct(cirPrivat.ist, cirPrivat.plan, true);
  bullets.push({
    headline: 'Cost/Income Ratio Privatkunden – struktureller Effizienzdruck',
    severity: ampelColor(cirPrivat.ist, cirPrivat.plan, true),
    text:
      `**CIR Privatkundengeschäft** bei ${fmtAbs(cirPrivat.ist, '%')} – rund **7 Prozentpunkte über Plan** ` +
      `(${fmtAbs(cirPrivat.plan, '%')}). Im Sektorvergleich nicht ungewöhnlich (europäische Filialbanken: ` +
      `60–80 %, EZB-Schnitt 2025 ~64 %), aber **klar über Steuerungsziel**.`,
    externalEffects: [
      '**Verdi/AGV-Banken-Tarifabschluss 2024**: +11,5 % gestaffelt bis 2026 – branchenweit personalkostenwirksam, ' +
        'kein direkter Hebel.',
      '**DORA-Umsetzung** (Operational-Resilience-Verordnung seit Januar 2025) bindet sektorweit ' +
        'zweistellige IT-Budgets in Härtungs- und Testpflichten.',
      'Niedrige **Kapitalmarkt-Volatilität** dämpft branchenweit das Wertpapier-Provisionsgeschäft – ' +
        'klassischer CIR-Hebel auf der Ertragsseite wirkt aktuell nicht.',
      '**Zunehmender Plattformwettbewerb** (N26, Trade Republic, Revolut) zwingt etablierte Banken zu ' +
        'parallelen App-Modernisierungen.',
    ],
    internalEffects: [
      '**Eigenes Filialnetz** weiterhin in B-/C-Lagen überproportioniert; Schließungsplan „Filiale 2027" ' +
        'wirkt erst mit 12–18 Monaten Verzögerung.',
      '**Cloud-Migration „Horizon"** läuft parallel zu Bestandskernsystem – temporäre Doppelkosten ' +
        '~85 Mio. € im laufenden Geschäftsjahr.',
      'Eigenes **Sparplan-Pricing** (Pauschal 1,75 €/Order) ist im Wettbewerb richtig gesetzt, drückt ' +
        'aber durchschnittliche **Order-Provision** spürbar.',
      'Internes **DORA-Programm** wurde bewusst über regulatorischen Mindestumfang hinaus aufgesetzt – ' +
        'strategische Investition, kostet kurzfristig +20 Mio. € gegenüber ursprünglicher Planung.',
    ],
    recommendation:
      '**Sofort:** Verdichtung Filialnetz in B-/C-Lagen, Verlagerung Standardberatung in Video-Beratung. ' +
      '**Mittelfristig:** Provisionsoffensive Wertpapier – DAX und Euro-Stoxx 50 nahe Allzeithoch ' +
      'machen Beratungseinstiege leichter.',
  });

  // ── 3b. Privatkunden-Einlagen / Tagesgeld ────────────────
  const einlPrivat = KPI_VALUES.einlagenvolumen.privatkunden;
  const einlPrivatDev = deviationPct(einlPrivat.ist, einlPrivat.plan, false);
  const einlMargePrivat = KPI_VALUES.einlagenmarge.privatkunden;
  bullets.push({
    headline: 'Privatkunden-Einlagen – Produktwirkung Tagesgeld-Aktion',
    severity: ampelColor(einlPrivat.ist, einlPrivat.plan, false),
    text:
      `**Einlagenvolumen Privatkunden** ${fmtAbs(einlPrivat.ist, 'MEUR')} – ${fmtPct(einlPrivatDev)} unter Plan ` +
      `(${fmtAbs(einlPrivat.plan, 'MEUR')}). **Einlagenmarge** kompensiert mit ${fmtAbs(einlMargePrivat.ist, '%')} ` +
      `(Plan ${fmtAbs(einlMargePrivat.plan, '%')}) den Volumen-Shortfall – das Bild ist gemischt.`,
    externalEffects: [
      '**Trade Republic** (3,25 % auf verzinstes Verrechnungskonto bis 50k €) und **Scalable Capital** ' +
        '(3,50 % Prime+) ziehen aktive Sparer-Cluster aus klassischen Tagesgeldern ab.',
      'Strukturelle **Umschichtung in Wertpapiere**: DAX-Allzeithoch und Sparplan-Boom ' +
        '(>2 Mio. aktive Pläne, +15 % YoY) ziehen Liquidität sektorweit aus Sicht-/Tagesgeldern.',
      '**Pass-Through-Quote** auf Einlagen marktweit auf ~45 % gestiegen (von ~25 % in 2023) – ' +
        'Margenerosion strukturell absehbar.',
      '**Demografischer Effekt**: Riester-Auszahlungsphase reduziert Bestände – Sektor-Phänomen ' +
        '(im Plan unterzeichnet).',
      'Wieder positive **Garantiezinsen** in Lebensversicherung lenken Vorsorge-Sparen aus Bank-Einlagen ab.',
    ],
    internalEffects: [
      'Eigene **Tagesgeld-Aktion „PlusZins 12"**: 2,75 % p. a. für Neugelder ab 5.000 € (Aktionszeitraum ' +
        'November–Dezember 2025) zog **+1,2 Mrd. € Frischgeld** – allein in den letzten 4 Wochen +8 % ' +
        'Tagesgeld-Bestand. **Sprung im Bestand klar produktgetrieben**.',
      'Eigene **Festgeld-Kampagne „Sicher 24"** (12 Mo: 2,90 % / 24 Mo: 3,00 %) seit 01.10.2025 – ' +
        '850 Mio. € Bindung, fließt aber in **separate Bilanzposition** (nicht in Einlagenvolumen Privatkunden).',
      '**Pricing-Disziplin** im Bestand bewusst gehalten (kein flächendeckendes Anziehen) – führt zu ' +
        'Volumen-Lag, hält dafür Marge stabil.',
      'Eigene **Wertpapier-Sparplan-Offensive Q3/2025** (Free-Trade-Aktion bis 31.03.2026) ' +
        'kannibalisiert teilweise Tagesgeld der **eigenen Bestandskunden** – gewolltes Cross-Sell, ' +
        'verschiebt Volumen aus dieser KPI heraus.',
    ],
    recommendation:
      '**Sofort:** Folge-Aktion „PlusZins Treue" für Aktions-Neukunden bei Verlängerung über 31.03.2026 hinaus – ' +
      'Halten der gewonnenen 1,2 Mrd. € hat höchste Priorität (Loss-Aversion). **Mittelfristig:** Verschiebung ' +
      'von Tagesgeld in Wertpapier-Sparplan (höhere Provisionsmarge, niedrigere Funding-Belastung).',
  });

  // ── 4. RoRaC Treasury ────────────────────────────────────
  const rrTreasury = KPI_VALUES.roRac.treasury;
  const rrStructured = KPI_VALUES.roRac.structured;
  bullets.push({
    headline: 'RoRaC Treasury – negative Profitabilität, Bondbuch-Altlast',
    severity: ampelColor(rrTreasury.ist, rrTreasury.plan, false),
    text:
      `Treasury weist mit **${fmtAbs(rrTreasury.ist, '%')}** RoRaC einen **negativen Wert** aus, klar unter Plan ` +
      `(${fmtAbs(rrTreasury.plan, '%')}). Im Kontrast: **Structured Finance** mit ${fmtAbs(rrStructured.ist, '%')} ` +
      `auf Planniveau.`,
    externalEffects: [
      '**Inverse / flache Zinskurve** (10y–2y zeitweise unter 20 bp) drückt die klassische ' +
        '**Fristentransformations-Marge** seit 2023 sektorweit.',
      '**TLTRO-III-Rückführung**: günstige EZB-Funding-Konditionen sind ausgelaufen – Refinanzierung ' +
        'erfolgt jetzt zu Marktkonditionen mit deutlich höherem Carry.',
      '**LCR/NSFR-Liquiditätspuffer** binden Bilanzkapazität – HQLA-Anlagen liefern keine ausreichende ' +
        'Eigenkapital-Verzinsung (sektorweites Strukturproblem).',
      '**Volatilität in Zinsmärkten 2024/25** führte sektorweit zu Hedge-Ineffizienzen.',
    ],
    internalEffects: [
      'Eigene **Bondbuch-Altlast**: Bundesanleihen mit Kupons < 1 % aus den Jahren 2020–22 binden ' +
        'Bilanz unprofitabel.',
      'Strategische Entscheidung Q4/2025: **Verkauf eines 1,2 Mrd. € Bundesanleihen-Pakets** ' +
        '(Kupon 0,5 %, fällig 2031) zur Bilanz-Bereinigung – führte zu **Realisierungsverlust ~35 Mio. €**.',
      'Eigene **Hedge-Ineffizienzen** auf Zinsswaps Q2–Q3/2024 (DV01-Limit zu eng, Convexity-Hedge fehlte) ' +
        'führten zu Bewertungsverlusten in der Steuerungsbilanz.',
      'Internes **FTP-Modell** weist Treasury bewusst Funding-Mismatch zu (Anreiz für Vertriebseinheiten, ' +
        'profitabel zu wachsen) – belastet Treasury-RoRaC strukturell.',
    ],
    recommendation:
      '**Aktive Bondbuch-Bereinigung** – Tail-Risiken realisieren, neue Tranchen mit aktuellen Kupons aufbauen. ' +
      '**Hedging-Strategie überprüfen** (DV01-Limits, Convexity-Hedges). **Funds-Transfer-Pricing** transparent ' +
      'machen, damit Vertriebseinheiten den Treasury-Beitrag korrekt sehen.',
  });

  // ── 5. RWA & Kapitalbindung ──────────────────────────────
  const rwaKonzern = KPI_VALUES.rwa.konzern;
  const rwaDev = deviationPct(rwaKonzern.ist, rwaKonzern.plan, true);
  const rwaProd = KPI_VALUES.rwaProd.konzern;
  const ngmKonzern = KPI_VALUES.neugeschaeftsmarge.konzern;
  bullets.push({
    headline: 'RWA & Kapitalbindung – Basel-IV-Effekte schlagen durch',
    severity: ampelColor(rwaKonzern.ist, rwaKonzern.plan, true),
    text:
      `Konzern-RWA bei **${fmtAbs(rwaKonzern.ist, 'MEUR')}** – ${fmtPct(-rwaDev)} über Plan ` +
      `(${fmtAbs(rwaKonzern.plan, 'MEUR')}). Zusammen mit der gedrückten Marge ` +
      `(Konzern-Neugeschäftsmarge ${fmtAbs(ngmKonzern.ist, '%')}) fällt die **RWA-Produktivität** auf ` +
      `${fmtAbs(rwaProd.ist, '%')} (Plan ${fmtAbs(rwaProd.plan, '%')}).`,
    externalEffects: [
      '**CRR III / Basel IV** in Kraft seit 01.01.2025: **Output-Floor** (zunächst 50 %, schrittweise auf ' +
        '72,5 % bis 2030) hebt RWAs interner Modelle sektorweit deutlich an.',
      'Revidierter **Standardansatz für Kreditrisiko** (SA-CR): höhere Risikogewichte für unrated Corporates ' +
        'und Spezialfinanzierungen – branchenweit wirksam.',
      'Neuer **Standardansatz für operationelles Risiko** (SMA) ersetzt AMA – führt bei großen Banken ' +
        'typisch zu +10–15 % Op-Risk-RWA.',
      '**Rating-Migrationen** in Commercial Real Estate (Office-Stress, ECRE-Migrationsrate +180 bp ggü. 2023) ' +
        'sind ein sektorweites Phänomen.',
    ],
    internalEffects: [
      'Eigenes **internes Real-Estate-Portfolio** durch Output-Floor mit **+12 pp** auf RWA-Gewicht ' +
        'belastet – dort sind interne Modelle besonders günstig kalibriert gewesen.',
      'Bewusster Aufbau **Leverage-Ratio-Puffer** für O-SII-Status: zusätzliche RWA-Kapazität von ' +
        '~1,5 Mrd. € geparkt, um Aufsichts-Headroom zu sichern.',
      'Eigene **IRB-Modell-Migration** in Firmenkundenportfolio noch nicht abgeschlossen – temporäre ' +
        'Anwendung des SA-Ansatzes auf Teilportfolios führt zu höherer RWA als final geplant.',
      'Konzern-eigenes **SRT-Programm** (Synthetische Verbriefungen) verzögert sich – ursprünglich ' +
        '800 Mio. € RWA-Entlastung in H2/2025 geplant, jetzt erst Q2/2026.',
    ],
    recommendation:
      '**RWA-Effizienz** als KPI in der Vertriebssteuerung verankern (Marge je RWA). ' +
      '**Synthetische Verbriefungen** (SRT) für homogene Portfolios prüfen, um Kapital freizusetzen. ' +
      '**Pricing-Modelle** an Output-Floor-Realität anpassen, statt mit IRB-Annahmen alter Welt zu rechnen.',
  });

  // ── 6. Top-Auffälligkeit ─────────────────────────────────
  const ranked = rankAbweichungen();
  const usedIds = new Set(['neugeschaeft', 'cir', 'roRac', 'rwa', 'neugeschaeftsmarge']);
  const riskTop = ranked.find((r) => r.ampel === 'red' && !usedIds.has(r.kpi.id));
  if (riskTop) {
    bullets.push({
      headline: `${riskTop.kpi.label} ${riskTop.segment.label} – Spread-Kompression`,
      severity: 'red',
      text:
        `**${riskTop.kpi.label}** im Bereich **${riskTop.segment.label}** liegt bei ` +
        `${fmtAbs(riskTop.cell.ist, riskTop.kpi.unit)} (Plan ${fmtAbs(riskTop.cell.plan, riskTop.kpi.unit)}, ` +
        `${fmtPct(riskTop.dev)}).`,
      externalEffects: [
        '**FRTB** (Fundamental Review of the Trading Book, Inkrafttreten 2025/26) verteuert das ' +
          'Eigenhandels-Buch über höhere Marktrisiko-Kapitalanforderungen.',
        '**Niedrige Volatilität** in Aktien (VIX zeitweise < 14) und Zinsen drückt Kunden-Aktivität ' +
          'in Derivaten – sektorweit wirksam.',
        '**Spread-Kompression im Anleihen-Market-Making**: enge Bid/Ask-Spreads durch elektronischen ' +
          'Handel und HFT-Wettbewerb (Citadel Securities, Jump Trading).',
        '**Migration auf T+1** (US bereits live, EU 11.10.2027 geplant) erfordert Vorabinvestitionen ' +
          'in Settlement-Infrastruktur, die nicht direkt erlöswirksam sind.',
      ],
      internalEffects: [
        'Eigenes **Markets-Buch** noch stark im Flow-Bereich gewichtet – strategischer Fokus auf ' +
          'strukturierte Lösungen kommt erst in 2026 voll zum Tragen.',
        'Eigene **Pricing-Engine** für Anleihen-MM ist noch nicht auf das neue FRTB-Risikomodell migriert – ' +
          'temporäre Konservativität verteuert eigene Quotes ggü. Wettbewerbern.',
        'Konzern-interner **Kapitalkosten-Schlüssel** auf Trading wurde Q1/2025 erhöht (von 12 % auf 14 %) – ' +
          'macht etablierte Strategien rechnerisch unprofitabler, ohne dass sich der Markt verändert hat.',
      ],
      recommendation:
        'Re-Allocation Trading-Capital weg von Low-Margin-Flow-Geschäft hin zu **strukturierten Lösungen** für ' +
        'Firmenkunden (FX-Hedging, Zinssicherung) – dort ist Pricing-Macht höher und der RWA-Hebel günstiger.',
    });
  }

  return bullets;
}

// ═══ Erläuterung pro KPI/Segment (Detailmodal) ════════════════
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

  // Externe vs. interne Effekte je KPI
  const effectsByKpi = {
    neugeschaeft: {
      external: [
        'Schwache **Investitionsneigung** im Mittelstand (BIP 2025 ~+0,3 %).',
        '**US-Tarife** auf Stahl/Auto verzögern Capex in Industrie- und Zulieferkernen.',
        'Hohe **Eigenkapitalquoten** im Mittelstand – Selbstfinanzierung statt Bankkredit.',
        '**Disintermediation** durch Private-Credit-Fonds bei Tickets > 100 Mio. €.',
      ],
      internal: [
        '**Eigene Förderkredit-Pipeline** (KfW-261/298) – +28 % Anträge MoM, aber Auszahlungs-Lag ' +
          '~3 Monate.',
        '**Cevo-Industries-LBO** (850 Mio. €) bewusst nicht zum Wettbewerber-Pricing mitgegangen ' +
          '(25 bp unter eigenem Floor).',
        'Konzern-interner **CRE-Office-Stop** seit Q3/2025 reduziert Pipeline um ~1,5 Mrd. €.',
        'Eigene **Konsumentenkredit-Aktion „2,99 % Frühjahr"** stützt Volumen, drückt aber Marge.',
      ],
    },
    neugeschaeftsmarge: {
      external: [
        '**Wettbewerbsdruck** zwischen Landesbanken bei syndizierten Krediten – 30–40 bp Margenkompression.',
        '**Schuldscheindarlehen-Markt** +35 % YoY drückt Konsortialkredit-Pricing branchenweit.',
        '**Direct-Lending-Fonds** setzen Pricing bei LBO-/Acquisition-Finance.',
      ],
      internal: [
        '**Eigene FTP-Anpassung** Q3/2025: Refinanzierungsvorteil voll an Vertrieb durchgereicht – ' +
          'gewollt, aber direkt margenmindernd.',
        'Eigene Aktion **„Bauträger-Plus 2025/26"** zog 1,1 Mrd. € Volumen, kostete 18 bp Marge.',
        'Internes **Pricing-Tool** noch nicht auf neue SA-CR-Risikogewichte umgestellt – Underpricing in Sub-IG.',
      ],
    },
    aktivvolumen: {
      external: [
        '**Office-Distress** und Refinanzierungsverzicht in Commercial Real Estate sektorweit.',
        '**Sondertilgungen** durch Kunden bei niedrigeren Zinsen – v. a. Baufinanzierung 10y fest.',
        'Strenge **Risikoselektion** bei höheren Spread-Anforderungen reduziert Conversion.',
      ],
      internal: [
        'Eigene Aktion **„Bau-Direkt 3,49 %"** (10 Jahre fest, 26 bp unter Standard) brachte ' +
          '300 Mio. € Sondergeschäft.',
        '**Eigene Risikoschiene Office** seit Q3/2025 abgestellt – 1,5 Mrd. € Pipeline-Verlust.',
        'Vorzeitige **Sondertilgungen** im eigenen Privatkundenportfolio +18 % YoY.',
      ],
    },
    aktivmarge: {
      external: [
        'Refinanzierungskosten am Markt stiegen schneller als Aktivpreise (**Pass-Through-Lag**).',
        '**Bid/Ask-Kompression** im Markets-Geschäft durch elektronischen Handel und HFT.',
        '**Hoher Anteil variabel verzinster** Altbestand mit limitierter Repricing-Macht.',
      ],
      internal: [
        'Aktion **„Bau-Direkt 3,49 %"** brachte Volumen, drückte aber die **Bestandsmarge**.',
        'Konzern-interner **FTP-Pass-Through** auf Aktivseite Q3/2025 erhöht (98 % statt 80 %).',
        '**Eigenes Treasury-Hedging** auf variabel verzinste Tranchen unvollständig (Hedge-Ratio 65 %).',
      ],
    },
    einlagenvolumen: {
      external: [
        '**Trade Republic 3,25 %** und Scalable 3,50 % ziehen aktive Sparer aus Tagesgeldbeständen ab.',
        'Strukturelle Umschichtung in **Wertpapier-Sparpläne** (DAX-ATH, +15 % YoY).',
        'Abfluss zu **Lebensversicherung / Riester** bei wieder positiven Garantiezinsen.',
        '**Pass-Through-Quote** marktweit auf ~45 % gestiegen (von ~25 % in 2023).',
      ],
      internal: [
        'Eigene **Tagesgeld-Aktion „PlusZins 12":** 2,75 % p. a. ab 5.000 € (Nov–Dez 2025) zog ' +
          '+1,2 Mrd. € Frischgeld – sichtbarer Sprung im Bestand.',
        'Eigene **Festgeld-Kampagne „Sicher 24"** (12 Mo: 2,90 % / 24 Mo: 3,00 %) seit 01.10.2025 – ' +
          '850 Mio. € Bindung in separater Bilanzposition.',
        '**Eigene Wertpapier-Sparplan-Offensive** (Free-Trade bis 31.03.2026) kannibalisiert Tagesgeld ' +
          'der eigenen Bestandskunden – gewolltes Cross-Sell.',
      ],
    },
    einlagenmarge: {
      external: [
        '**Pass-Through-Quote** auf Einlagen marktweit ~45 % (von ~25 % in 2023).',
        'EZB-Zinssenkungen treffen **zeitversetzt** auf Re-Pricing der Kundenbestände.',
        'Negativzins-Phase 2020–22 wirkt mental nach – Kunden fordern aktiv höhere Konditionen.',
      ],
      internal: [
        'Eigene Aktion **„PlusZins 12" 2,75 %** drückt **bewusst** die Marge auf Aktions-Tickets.',
        'Eigene **Pricing-Disziplin** im Bestand bewusst gehalten – kein flächendeckendes Anziehen.',
        'Konzern-internes **Tagesgeld-Pricing-Modell** Q4/2025 verfeinert (Cluster-basiert), wirkt erst 2026 voll.',
      ],
    },
    rwa: {
      external: [
        '**CRR III / Basel IV** seit 01.01.2025 mit Output-Floor 50 % (steigend bis 72,5 % bis 2030).',
        'Revidierter **Standardansatz Kreditrisiko** (SA-CR) – höhere Gewichte für unrated Corporates.',
        '**Rating-Migrationen** in CRE und Leveraged-Finance-Portfolios sektorweit.',
        'Neuer **Op-Risk-Standardansatz** (SMA): typisch +10–15 % Op-Risk-RWA.',
      ],
      internal: [
        'Eigenes **internes Real-Estate-Portfolio** durch Output-Floor +12 pp RWA-Gewicht.',
        'Bewusster Aufbau **Leverage-Ratio-Puffer** für O-SII-Status (~1,5 Mrd. € RWA geparkt).',
        'Eigene **IRB-Modell-Migration** in Firmenkundenportfolio nicht abgeschlossen – temporär SA.',
        'Eigenes **SRT-Programm** verzögert: 800 Mio. € RWA-Entlastung erst Q2/2026 statt H2/2025.',
      ],
    },
    rwaProd: {
      external: [
        'RWA-Anstieg durch **Basel-IV-Implementierung** branchenweit schneller als Margenanpassung.',
      ],
      internal: [
        'Vertrieb steuert noch nicht durchgängig auf **Marge je RWA** – fehlende Transparenz im FTP.',
        'Eigenes **SRT-Programm** noch nicht aktiv – RWA-Entlastung 800 Mio. € fehlt aktuell.',
        'Internes **Pricing-Tool** ist noch auf alter IRB-Welt – führt zu Mispricing in Output-Floor-Welt.',
      ],
    },
    roRac: {
      external: [
        'Verzinsung des **regulatorischen Kapitals** durch Basel-IV-Effekt erschwert.',
        '**Inverse Zinskurve** reduziert Fristentransformations-Beitrag seit 2023 sektorweit.',
        '**TLTRO-III-Rückführung** verteuert Funding marktweit.',
      ],
      internal: [
        'Eigene **Bondbuch-Altlasten** (niedrigverzinste Bundesanleihen, Kupon < 1 %) drücken Treasury-Beitrag.',
        '**Verkauf 1,2 Mrd. € Bundesanleihen-Paket** (Kupon 0,5 %, fällig 2031) – Realisierungsverlust ~35 Mio. €.',
        'Konzern-interner **Kapitalkosten-Schlüssel** Q1/2025 von 12 % auf 14 % erhöht – belastet alle Sparten.',
      ],
    },
    cir: {
      external: [
        '**Verdi/AGV-Banken-Tarif 2024:** +11,5 % gestaffelt bis 2026 – branchenweit personalkostenwirksam.',
        '**DORA** (Operational Resilience seit 01/2025) bindet sektorweit zweistellige IT-Budgets.',
        'Niedrige Vola dämpft branchenweit **Wertpapier-Provisionen**.',
      ],
      internal: [
        'Eigenes **Filialnetz** in B-/C-Lagen weiterhin überproportioniert; Schließungsplan „Filiale 2027" ' +
          'wirkt mit 12–18 Monaten Verzögerung.',
        '**Cloud-Migration „Horizon"** parallel zu Legacy-Kernbankensystem – temporäre Doppelkosten ~85 Mio. €.',
        'Eigenes **Sparplan-Pricing** (Pauschal 1,75 €/Order) drückt durchschnittliche Order-Provision.',
        '**Eigenes DORA-Programm** über regulatorischen Mindestumfang hinaus aufgesetzt – ' +
          'strategisch +20 Mio. € ggü. Plan.',
      ],
    },
  };
  const effects = effectsByKpi[kpi.id] || { external: [], internal: [] };

  // Headline
  let headline;
  if (ampel === 'green') {
    headline = `**${kpi.label}** im Segment **${segment.label}** liegt mit ${fmtAbs(cell.ist, kpi.unit)} ` +
      `**im Plan** (${fmtAbs(cell.plan, kpi.unit)}, ${fmtPct(dev)}).`;
  } else if (ampel === 'yellow') {
    headline = `**${kpi.label}** im Segment **${segment.label}** liegt bei ${fmtAbs(cell.ist, kpi.unit)} und damit ` +
      `**leicht unter Plan** (${fmtAbs(cell.plan, kpi.unit)}, ${fmtPct(dev)}).`;
  } else {
    headline = `**${kpi.label}** im Segment **${segment.label}** weist mit ${fmtAbs(cell.ist, kpi.unit)} eine ` +
      `**kritische Abweichung** (${fmtPct(dev)}) gegenüber Plan (${fmtAbs(cell.plan, kpi.unit)}) auf.`;
  }

  // Empfehlung
  let recommendation;
  if (ampel === 'green') {
    recommendation = '**Performance stabil** – aktuelle Steuerungslogik beibehalten und Best Practices auf ' +
      'vergleichbare Segmente skalieren.';
  } else if (ampel === 'yellow') {
    recommendation = 'Kurzfristige Maßnahmen prüfen: **Pricing-Anpassung**, Vertriebsfokus auf margenstarke ' +
      'Produkte, ggf. Kostenhebel auf Sachkostenseite.';
  } else {
    recommendation = '**Eskalation** in den Steuerungskreis. Ursachenanalyse mit Querschnitt aus ' +
      'Volumen × Marge × Kapitalbindung. Maßnahmenplan mit klaren Owners und **Wirkungstermin H1/2026**.';
  }

  return {
    headline,
    ampel,
    dev,
    crossRefs,
    externalEffects: effects.external,
    internalEffects: effects.internal,
    recommendation,
  };
}

// ─── Plain-Text-Variante für PPT-Export ───────────────────────
function stripMarkup(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[(?:red|amber|yellow|green|blue|violet|rose|slate):(.+?)\]/g, '$1');
}

export function buildKommentarPlainText() {
  return buildKommentar().map((b) => ({
    headline: b.headline,
    severity: b.severity,
    text: stripMarkup(b.text),
    externalEffects: (b.externalEffects || []).map((c) => '· ' + stripMarkup(c)).join('\n'),
    internalEffects: (b.internalEffects || []).map((c) => '· ' + stripMarkup(c)).join('\n'),
    recommendation: stripMarkup(b.recommendation),
  }));
}
