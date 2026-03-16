// ─── VV Extended Mock Data ────────────────────────────────────────────────────
// Extended data for Vermoegensverwaltung mode: Performance, WpHG, Familie,
// Engagement, Leads and Revenue.

// ─── 1. VV_PERFORMANCE ── Per-mandant performance data ──────────────────────

export const VV_PERFORMANCE = {
  // ── W1: Dr. Heinrich von Trott – Konservativ (Vorbild: Flossbach v. Storch Multiple Opps) ──
  VV00001: {
    monthlyReturns: [
      // 2023 – Erholung nach 2022, defensiv profitiert von Anleihen-Rally H2
      { name: 'Jan 2023', portfolio: 2.1, benchmark: 1.8 },
      { name: 'Feb 2023', portfolio: -0.8, benchmark: -1.2 },
      { name: 'Mär 2023', portfolio: -1.4, benchmark: -1.9 },  // SVB-Krise
      { name: 'Apr 2023', portfolio: 0.6, benchmark: 0.3 },
      { name: 'Mai 2023', portfolio: 0.2, benchmark: -0.1 },
      { name: 'Jun 2023', portfolio: 1.3, benchmark: 1.0 },
      { name: 'Jul 2023', portfolio: 1.1, benchmark: 0.8 },
      { name: 'Aug 2023', portfolio: -1.0, benchmark: -1.4 },
      { name: 'Sep 2023', portfolio: -0.9, benchmark: -1.6 },   // Zins-Sorgen
      { name: 'Okt 2023', portfolio: -0.3, benchmark: -0.8 },
      { name: 'Nov 2023', portfolio: 2.8, benchmark: 2.3 },     // Jahresendrallye
      { name: 'Dez 2023', portfolio: 1.9, benchmark: 1.6 },
      // 2024 – Starkes Aktienjahr, AI-Rally, Konservativ partizipiert moderat
      { name: 'Jan 2024', portfolio: 0.7, benchmark: 0.4 },
      { name: 'Feb 2024', portfolio: 1.8, benchmark: 1.5 },
      { name: 'Mär 2024', portfolio: 1.2, benchmark: 0.9 },
      { name: 'Apr 2024', portfolio: -2.1, benchmark: -2.7 },   // Geopolitik-Korrektur
      { name: 'Mai 2024', portfolio: 1.4, benchmark: 1.0 },
      { name: 'Jun 2024', portfolio: 0.9, benchmark: 0.6 },
      { name: 'Jul 2024', portfolio: 1.6, benchmark: 1.2 },
      { name: 'Aug 2024', portfolio: -1.3, benchmark: -2.0 },   // Yen-Carry-Trade
      { name: 'Sep 2024', portfolio: 0.8, benchmark: 0.5 },
      { name: 'Okt 2024', portfolio: -0.5, benchmark: -0.9 },
      { name: 'Nov 2024', portfolio: 2.4, benchmark: 1.9 },     // US-Wahl-Rally
      { name: 'Dez 2024', portfolio: 0.6, benchmark: 0.3 },
      // 2025 – Volatiler Start, dann Erholung
      { name: 'Jan 2025', portfolio: 1.5, benchmark: 1.1 },
      { name: 'Feb 2025', portfolio: 0.3, benchmark: -0.2 },
      { name: 'Mär 2025', portfolio: -1.8, benchmark: -2.4 },   // Zoll-Ängste
      { name: 'Apr 2025', portfolio: -0.7, benchmark: -1.3 },
      { name: 'Mai 2025', portfolio: 1.9, benchmark: 1.4 },     // Erholung
      { name: 'Jun 2025', portfolio: 1.1, benchmark: 0.7 },
      { name: 'Jul 2025', portfolio: 0.8, benchmark: 0.5 },
      { name: 'Aug 2025', portfolio: -0.4, benchmark: -0.8 },
      { name: 'Sep 2025', portfolio: 0.6, benchmark: 0.2 },
      { name: 'Okt 2025', portfolio: 1.7, benchmark: 1.3 },
      { name: 'Nov 2025', portfolio: 1.2, benchmark: 0.8 },
      { name: 'Dez 2025', portfolio: 0.9, benchmark: 0.5 },
    ],
    einzahlungen: [
      { monat: 'Mär 2024', betrag: 5000000, label: 'Einzahlung 5,0 Mio EUR' },
      { monat: 'Sep 2025', betrag: 2000000, label: 'Einzahlung 2,0 Mio EUR' },
    ],
    allocation: { aktien: 45, anleihen: 30, alternative: 15, cash: 5, immobilien: 5 },
    targetAllocation: { aktien: 43, anleihen: 32, alternative: 15, cash: 5, immobilien: 5 },
    sectors: [
      { name: 'Technologie', value: 16 },
      { name: 'Healthcare', value: 14 },
      { name: 'Finanzen', value: 13 },
      { name: 'Industrie', value: 12 },
      { name: 'Konsum', value: 9 },
      { name: 'Energie', value: 8 },
      { name: 'Versorger', value: 7 },
      { name: 'Grundstoffe', value: 5 },
    ],
    regions: [
      { name: 'Europa', value: 42 },
      { name: 'Nordamerika', value: 30 },
      { name: 'Asien-Pazifik', value: 15 },
      { name: 'Schwellenlaender', value: 8 },
      { name: 'Sonstige', value: 5 },
    ],
    riskMetrics: { volatilitaet: 8.2, sharpe: 1.05, maxDrawdown: -5.1, var95: -2.3, trackingError: 1.8 },
    bonds: [
      { name: 'Investment Grade', value: 55 },
      { name: 'High Yield', value: 10 },
      { name: 'Staatsanleihen', value: 20 },
      { name: 'Pfandbriefe', value: 10 },
      { name: 'Emerging Markets', value: 5 },
    ],
    currencies: [
      { name: 'EUR', value: 62 },
      { name: 'USD', value: 22 },
      { name: 'CHF', value: 8 },
      { name: 'GBP', value: 5 },
      { name: 'Sonstige', value: 3 },
    ],
    ioComment: 'Das Portfolio entwickelt sich im Rahmen der Erwartungen. Die konservative Ausrichtung mit Schwerpunkt europäische Qualitätsaktien und Investment-Grade-Anleihen hat sich in der aktuellen Marktphase bewährt. Die Duration im Anleihensegment wurde taktisch auf 4,8 Jahre reduziert. Wir empfehlen eine moderate Erhöhung der Aktienquote bei Rücksetzern. Der ESG-Filter ist aktiv, ein Upgrade auf Art.9 wird geprüft.',
  },

  // ── W2: Familie Lindenberg – Wachstum (Vorbild: DWS Top Dividende + Growth-Tilt) ──
  VV00002: {
    monthlyReturns: [
      // 2023 – Tech-Rebound, Wachstumsstrategie profitiert stark
      { name: 'Jan 2023', portfolio: 3.4, benchmark: 1.8 },
      { name: 'Feb 2023', portfolio: -1.7, benchmark: -1.2 },
      { name: 'Mär 2023', portfolio: -2.8, benchmark: -1.9 },   // SVB → Tech-Dip
      { name: 'Apr 2023', portfolio: 1.2, benchmark: 0.3 },
      { name: 'Mai 2023', portfolio: 2.9, benchmark: -0.1 },    // AI-Hype Nvidia etc.
      { name: 'Jun 2023', portfolio: 3.1, benchmark: 1.0 },
      { name: 'Jul 2023', portfolio: 1.8, benchmark: 0.8 },
      { name: 'Aug 2023', portfolio: -2.4, benchmark: -1.4 },
      { name: 'Sep 2023', portfolio: -1.9, benchmark: -1.6 },
      { name: 'Okt 2023', portfolio: -1.5, benchmark: -0.8 },
      { name: 'Nov 2023', portfolio: 4.7, benchmark: 2.3 },     // Massive Jahresendrallye
      { name: 'Dez 2023', portfolio: 2.8, benchmark: 1.6 },
      // 2024 – AI-Superzyklus, Tech dominiert, Apr-Korrektur
      { name: 'Jan 2024', portfolio: 1.9, benchmark: 0.4 },
      { name: 'Feb 2024', portfolio: 3.5, benchmark: 1.5 },     // Nvidia Earnings
      { name: 'Mär 2024', portfolio: 1.4, benchmark: 0.9 },
      { name: 'Apr 2024', portfolio: -4.2, benchmark: -2.7 },   // Geopolitik-Schock
      { name: 'Mai 2024', portfolio: 2.6, benchmark: 1.0 },
      { name: 'Jun 2024', portfolio: 3.1, benchmark: 0.6 },
      { name: 'Jul 2024', portfolio: -1.8, benchmark: 1.2 },    // Rotation aus Tech
      { name: 'Aug 2024', portfolio: -3.6, benchmark: -2.0 },   // Yen-Carry-Trade Crash
      { name: 'Sep 2024', portfolio: 2.1, benchmark: 0.5 },
      { name: 'Okt 2024', portfolio: -0.4, benchmark: -0.7 },
      { name: 'Nov 2024', portfolio: 4.8, benchmark: 1.9 },     // Trump-Rally, Tech springt
      { name: 'Dez 2024', portfolio: 1.2, benchmark: 0.3 },
      // 2025 – Volatile Seitwärtsbewegung, Tech-Bewertung hoch
      { name: 'Jan 2025', portfolio: 2.1, benchmark: 1.1 },
      { name: 'Feb 2025', portfolio: 0.8, benchmark: -0.2 },
      { name: 'Mär 2025', portfolio: -3.4, benchmark: -2.4 },   // Zölle + Rezessionsangst
      { name: 'Apr 2025', portfolio: -1.9, benchmark: -1.3 },
      { name: 'Mai 2025', portfolio: 3.7, benchmark: 1.4 },     // V-Shape Recovery
      { name: 'Jun 2025', portfolio: 2.3, benchmark: 0.7 },
      { name: 'Jul 2025', portfolio: 1.5, benchmark: 0.5 },
      { name: 'Aug 2025', portfolio: -1.1, benchmark: -0.8 },
      { name: 'Sep 2025', portfolio: 0.4, benchmark: 0.2 },
      { name: 'Okt 2025', portfolio: 3.2, benchmark: 1.3 },     // Q3 Earnings Beat
      { name: 'Nov 2025', portfolio: 1.8, benchmark: 0.8 },
      { name: 'Dez 2025', portfolio: 1.4, benchmark: 0.5 },
    ],
    einzahlungen: [
      { monat: 'Jun 2024', betrag: 8000000, label: 'Einzahlung 8,0 Mio EUR (SaaS-Exit)' },
    ],
    allocation: { aktien: 57, anleihen: 18, alternative: 20, cash: 3, immobilien: 2 },
    targetAllocation: { aktien: 55, anleihen: 20, alternative: 20, cash: 3, immobilien: 2 },
    sectors: [
      { name: 'Technologie', value: 28 },
      { name: 'Healthcare', value: 12 },
      { name: 'Konsum', value: 15 },
      { name: 'Kommunikation', value: 11 },
      { name: 'Finanzen', value: 10 },
      { name: 'Industrie', value: 8 },
      { name: 'Sonstige', value: 16 },
    ],
    regions: [
      { name: 'Nordamerika', value: 45 },
      { name: 'Europa', value: 28 },
      { name: 'Asien-Pazifik', value: 18 },
      { name: 'Schwellenlaender', value: 6 },
      { name: 'Sonstige', value: 3 },
    ],
    riskMetrics: { volatilitaet: 12.5, sharpe: 1.35, maxDrawdown: -8.7, var95: -3.8, trackingError: 3.2 },
    bonds: [
      { name: 'Investment Grade', value: 40 },
      { name: 'High Yield', value: 25 },
      { name: 'Staatsanleihen', value: 15 },
      { name: 'Wandelanleihen', value: 12 },
      { name: 'Emerging Markets', value: 8 },
    ],
    currencies: [
      { name: 'EUR', value: 48 },
      { name: 'USD', value: 35 },
      { name: 'GBP', value: 7 },
      { name: 'CHF', value: 5 },
      { name: 'Sonstige', value: 5 },
    ],
    ioComment: 'Starke YTD-Performance dank Tech-Übergewichtung. Die Aktienquote liegt leicht über Soll (+2pp), was bei der aktuellen Marktdynamik bewusst beibehalten wird. Bei der geplanten Cash-Konsolidierung (5,5M bei Commerzbank) empfehlen wir ein Upgrade auf FairValue mit breiterer Diversifikation. PE-Allokation sollte im Zuge der Konsolidierung auf 10-15% erhöht werden.',
  },

  // ── W3: Stiftung Weber – Defensiv (Vorbild: Stiftungsfonds, 30% Aktien / 70% Anleihen) ──
  VV00003: {
    monthlyReturns: [
      // 2023 – Anleihen-Rally H2 hilft, geringe Aktienquote dämpft
      { name: 'Jan 2023', portfolio: 1.4, benchmark: 1.8 },
      { name: 'Feb 2023', portfolio: -0.6, benchmark: -1.2 },
      { name: 'Mär 2023', portfolio: -0.4, benchmark: -1.9 },
      { name: 'Apr 2023', portfolio: 0.5, benchmark: 0.3 },
      { name: 'Mai 2023', portfolio: 0.1, benchmark: -0.1 },
      { name: 'Jun 2023', portfolio: 0.7, benchmark: 1.0 },
      { name: 'Jul 2023', portfolio: 0.5, benchmark: 0.8 },
      { name: 'Aug 2023', portfolio: -0.3, benchmark: -1.4 },
      { name: 'Sep 2023', portfolio: -0.6, benchmark: -1.6 },
      { name: 'Okt 2023', portfolio: 0.2, benchmark: -0.8 },   // Anleihen halten
      { name: 'Nov 2023', portfolio: 1.8, benchmark: 2.3 },
      { name: 'Dez 2023', portfolio: 1.3, benchmark: 1.6 },
      // 2024 – Stabil, Kupons stützen, Aktienrallye nur teilweise mitgenommen
      { name: 'Jan 2024', portfolio: 0.4, benchmark: 0.4 },
      { name: 'Feb 2024', portfolio: 0.6, benchmark: 1.5 },
      { name: 'Mär 2024', portfolio: 0.5, benchmark: 0.9 },
      { name: 'Apr 2024', portfolio: -0.8, benchmark: -2.7 },   // Abgepuffert
      { name: 'Mai 2024', portfolio: 0.4, benchmark: 1.0 },
      { name: 'Jun 2024', portfolio: 0.6, benchmark: 0.6 },
      { name: 'Jul 2024', portfolio: 0.3, benchmark: 1.2 },
      { name: 'Aug 2024', portfolio: -0.2, benchmark: -2.0 },   // Stabil in Krise
      { name: 'Sep 2024', portfolio: 0.7, benchmark: 0.5 },
      { name: 'Okt 2024', portfolio: 0.1, benchmark: -0.7 },
      { name: 'Nov 2024', portfolio: 0.9, benchmark: 1.9 },
      { name: 'Dez 2024', portfolio: 0.4, benchmark: 0.3 },
      // 2025 – Stetiger Ertrag, kaum Drawdowns
      { name: 'Jan 2025', portfolio: 0.5, benchmark: 1.1 },
      { name: 'Feb 2025', portfolio: 0.4, benchmark: -0.2 },
      { name: 'Mär 2025', portfolio: -0.3, benchmark: -2.4 },   // Defensiv hält
      { name: 'Apr 2025', portfolio: 0.2, benchmark: -1.3 },
      { name: 'Mai 2025', portfolio: 0.8, benchmark: 1.4 },
      { name: 'Jun 2025', portfolio: 0.5, benchmark: 0.7 },
      { name: 'Jul 2025', portfolio: 0.4, benchmark: 0.5 },
      { name: 'Aug 2025', portfolio: 0.1, benchmark: -0.8 },
      { name: 'Sep 2025', portfolio: 0.3, benchmark: 0.2 },
      { name: 'Okt 2025', portfolio: 0.6, benchmark: 1.3 },
      { name: 'Nov 2025', portfolio: 0.5, benchmark: 0.8 },
      { name: 'Dez 2025', portfolio: 0.4, benchmark: 0.5 },
    ],
    einzahlungen: [
      { monat: 'Jan 2024', betrag: 500000, label: 'Einzahlung 0,5 Mio EUR' },
      { monat: 'Jul 2025', betrag: 300000, label: 'Einzahlung 0,3 Mio EUR' },
    ],
    allocation: { aktien: 30, anleihen: 50, alternative: 8, cash: 7, immobilien: 5 },
    targetAllocation: { aktien: 28, anleihen: 52, alternative: 8, cash: 7, immobilien: 5 },
    sectors: [
      { name: 'Versorger', value: 18 },
      { name: 'Healthcare', value: 15 },
      { name: 'Konsum', value: 14 },
      { name: 'Finanzen', value: 12 },
      { name: 'Industrie', value: 10 },
      { name: 'Technologie', value: 8 },
      { name: 'Grundstoffe', value: 6 },
      { name: 'Sonstige', value: 17 },
    ],
    regions: [
      { name: 'Europa', value: 55 },
      { name: 'Nordamerika', value: 22 },
      { name: 'Asien-Pazifik', value: 10 },
      { name: 'Schwellenlaender', value: 5 },
      { name: 'Sonstige', value: 8 },
    ],
    riskMetrics: { volatilitaet: 5.4, sharpe: 0.82, maxDrawdown: -3.2, var95: -1.5, trackingError: 0.9 },
    bonds: [
      { name: 'Staatsanleihen', value: 35 },
      { name: 'Investment Grade', value: 30 },
      { name: 'Pfandbriefe', value: 20 },
      { name: 'Nachhaltigkeitsanleihen', value: 10 },
      { name: 'High Yield', value: 5 },
    ],
    currencies: [
      { name: 'EUR', value: 72 },
      { name: 'USD', value: 15 },
      { name: 'CHF', value: 8 },
      { name: 'GBP', value: 3 },
      { name: 'Sonstige', value: 2 },
    ],
    ioComment: 'Das Stiftungsmandat zeigt stabile Entwicklung mit Fokus auf Kapitalerhalt und regelmäßige Ausschüttung. Die Anleihenquote wurde bei 50% gehalten, mit Schwerpunkt auf Staats- und Pfandbriefen. ESG-Upgrade auf Art.9 wird vom Stiftungsrat geprüft. Die Ausschüttungsrendite liegt bei plan-konformen 3,0% p.a. Eine Optimierung im Anleihensegment könnte die Ausschüttung um ca. 30.000 EUR p.a. steigern.',
  },

  // ── W4: Prof. Dr. Hartmann – Ausgewogen (Vorbild: Ethna-AKTIV / Carmignac Patrimoine) ──
  VV00004: {
    monthlyReturns: [
      // 2023 – Ausgewogene Strategie, Healthcare-Schwerpunkt hilft
      { name: 'Jan 2023', portfolio: 1.8, benchmark: 1.8 },
      { name: 'Feb 2023', portfolio: -0.5, benchmark: -1.2 },
      { name: 'Mär 2023', portfolio: -0.9, benchmark: -1.9 },
      { name: 'Apr 2023', portfolio: 0.7, benchmark: 0.3 },
      { name: 'Mai 2023', portfolio: 0.4, benchmark: -0.1 },
      { name: 'Jun 2023', portfolio: 1.6, benchmark: 1.0 },
      { name: 'Jul 2023', portfolio: 1.3, benchmark: 0.8 },
      { name: 'Aug 2023', portfolio: -1.4, benchmark: -1.4 },
      { name: 'Sep 2023', portfolio: -1.1, benchmark: -1.6 },
      { name: 'Okt 2023', portfolio: -0.2, benchmark: -0.8 },
      { name: 'Nov 2023', portfolio: 3.1, benchmark: 2.3 },
      { name: 'Dez 2023', portfolio: 2.1, benchmark: 1.6 },
      // 2024 – Solides Jahr, Healthcare & PE liefern Mehrwert
      { name: 'Jan 2024', portfolio: 0.9, benchmark: 0.4 },
      { name: 'Feb 2024', portfolio: 2.1, benchmark: 1.5 },
      { name: 'Mär 2024', portfolio: 1.0, benchmark: 0.9 },
      { name: 'Apr 2024', portfolio: -2.4, benchmark: -2.7 },   // Abgefedert durch Anleihen
      { name: 'Mai 2024', portfolio: 1.3, benchmark: 1.0 },
      { name: 'Jun 2024', portfolio: 1.4, benchmark: 0.6 },
      { name: 'Jul 2024', portfolio: 0.8, benchmark: 1.2 },
      { name: 'Aug 2024', portfolio: -1.5, benchmark: -2.0 },
      { name: 'Sep 2024', portfolio: 1.6, benchmark: 0.5 },     // Healthcare-Rally
      { name: 'Okt 2024', portfolio: 0.3, benchmark: -0.7 },
      { name: 'Nov 2024', portfolio: 2.5, benchmark: 1.9 },
      { name: 'Dez 2024', portfolio: 0.8, benchmark: 0.3 },
      // 2025 – Stabil mit Healthcare-Outperformance
      { name: 'Jan 2025', portfolio: 1.2, benchmark: 1.1 },
      { name: 'Feb 2025', portfolio: 0.7, benchmark: -0.2 },
      { name: 'Mär 2025', portfolio: -1.6, benchmark: -2.4 },
      { name: 'Apr 2025', portfolio: -0.3, benchmark: -1.3 },
      { name: 'Mai 2025', portfolio: 2.4, benchmark: 1.4 },     // Healthcare-Earnings
      { name: 'Jun 2025', portfolio: 1.3, benchmark: 0.7 },
      { name: 'Jul 2025', portfolio: 0.9, benchmark: 0.5 },
      { name: 'Aug 2025', portfolio: -0.6, benchmark: -0.8 },
      { name: 'Sep 2025', portfolio: 0.8, benchmark: 0.2 },
      { name: 'Okt 2025', portfolio: 1.9, benchmark: 1.3 },
      { name: 'Nov 2025', portfolio: 1.1, benchmark: 0.8 },
      { name: 'Dez 2025', portfolio: 0.7, benchmark: 0.5 },
    ],
    einzahlungen: [
      { monat: 'Feb 2024', betrag: 1500000, label: 'Einzahlung 1,5 Mio EUR' },
      { monat: 'Nov 2025', betrag: 800000, label: 'Einzahlung 0,8 Mio EUR (Praxiserlös)' },
    ],
    allocation: { aktien: 42, anleihen: 33, alternative: 12, cash: 5, immobilien: 8 },
    targetAllocation: { aktien: 40, anleihen: 35, alternative: 12, cash: 5, immobilien: 8 },
    sectors: [
      { name: 'Healthcare', value: 22 },
      { name: 'Technologie', value: 14 },
      { name: 'Finanzen', value: 12 },
      { name: 'Industrie', value: 10 },
      { name: 'Konsum', value: 9 },
      { name: 'Versorger', value: 7 },
      { name: 'Sonstige', value: 26 },
    ],
    regions: [
      { name: 'Europa', value: 48 },
      { name: 'Nordamerika', value: 28 },
      { name: 'Asien-Pazifik', value: 14 },
      { name: 'Schwellenlaender', value: 6 },
      { name: 'Sonstige', value: 4 },
    ],
    riskMetrics: { volatilitaet: 9.1, sharpe: 1.15, maxDrawdown: -6.4, var95: -2.8, trackingError: 2.1 },
    bonds: [
      { name: 'Investment Grade', value: 45 },
      { name: 'Staatsanleihen', value: 25 },
      { name: 'Pfandbriefe', value: 12 },
      { name: 'High Yield', value: 10 },
      { name: 'Emerging Markets', value: 8 },
    ],
    currencies: [
      { name: 'EUR', value: 58 },
      { name: 'USD', value: 25 },
      { name: 'CHF', value: 10 },
      { name: 'GBP', value: 4 },
      { name: 'Sonstige', value: 3 },
    ],
    ioComment: 'Portfolio leicht über Benchmark dank Healthcare-Übergewichtung, die die Fachexpertise des Mandanten reflektiert. Aktienquote +2pp über Soll – Rebalancing bei nächster Gelegenheit empfohlen. Die Immofonds-Allokation (8%) liefert stabile Erträge. PE Healthcare Fund II (Co-Investment) wird aktuell geprüft. ING-Tagesgeld (250k) sollte konsolidiert werden.',
  },

  // ── W5: Tim Keller – Aggressiv / Tech (Vorbild: ARK Innovation + Nasdaq-100) ──
  VV00005: {
    monthlyReturns: [
      // 2023 – Mega-Cap Tech Rebound, aber volatile Zwischenphasen
      { name: 'Jan 2023', portfolio: 5.2, benchmark: 1.8 },     // Tech-Rebound
      { name: 'Feb 2023', portfolio: -2.8, benchmark: -1.2 },
      { name: 'Mär 2023', portfolio: -4.1, benchmark: -1.9 },   // SVB = Tech-Panik
      { name: 'Apr 2023', portfolio: 1.5, benchmark: 0.3 },
      { name: 'Mai 2023', portfolio: 6.3, benchmark: -0.1 },    // Nvidia +25%, AI-Hype
      { name: 'Jun 2023', portfolio: 4.2, benchmark: 1.0 },
      { name: 'Jul 2023', portfolio: 2.4, benchmark: 0.8 },
      { name: 'Aug 2023', portfolio: -3.1, benchmark: -1.4 },
      { name: 'Sep 2023', portfolio: -2.6, benchmark: -1.6 },
      { name: 'Okt 2023', portfolio: -1.8, benchmark: -0.8 },
      { name: 'Nov 2023', portfolio: 7.4, benchmark: 2.3 },     // Jahresendrallye
      { name: 'Dez 2023', portfolio: 4.1, benchmark: 1.6 },
      // 2024 – AI-Superzyklus, extremer Apr-Aug Rücksetzer
      { name: 'Jan 2024', portfolio: 3.1, benchmark: 0.4 },
      { name: 'Feb 2024', portfolio: 5.8, benchmark: 1.5 },     // Nvidia-Mania
      { name: 'Mär 2024', portfolio: -2.3, benchmark: 0.9 },
      { name: 'Apr 2024', portfolio: -6.9, benchmark: -2.7 },   // Tech-Crash
      { name: 'Mai 2024', portfolio: 3.5, benchmark: 1.0 },
      { name: 'Jun 2024', portfolio: 4.8, benchmark: 0.6 },
      { name: 'Jul 2024', portfolio: -4.2, benchmark: 1.2 },    // Rotation raus aus Tech
      { name: 'Aug 2024', portfolio: -5.7, benchmark: -2.0 },   // Yen-Carry-Trade
      { name: 'Sep 2024', portfolio: 3.9, benchmark: 0.5 },
      { name: 'Okt 2024', portfolio: -0.8, benchmark: -0.7 },
      { name: 'Nov 2024', portfolio: 6.9, benchmark: 1.9 },     // Trump + AI Push
      { name: 'Dez 2024', portfolio: 1.7, benchmark: 0.3 },
      // 2025 – Hochvolatil, Impact-Themen laufen
      { name: 'Jan 2025', portfolio: 3.4, benchmark: 1.1 },
      { name: 'Feb 2025', portfolio: 1.5, benchmark: -0.2 },
      { name: 'Mär 2025', portfolio: -5.8, benchmark: -2.4 },   // Zölle treffen Tech
      { name: 'Apr 2025', portfolio: -3.2, benchmark: -1.3 },
      { name: 'Mai 2025', portfolio: 6.1, benchmark: 1.4 },     // V-Shape, AI-Earnings
      { name: 'Jun 2025', portfolio: 3.5, benchmark: 0.7 },
      { name: 'Jul 2025', portfolio: 2.1, benchmark: 0.5 },
      { name: 'Aug 2025', portfolio: -1.6, benchmark: -0.8 },
      { name: 'Sep 2025', portfolio: 0.9, benchmark: 0.2 },
      { name: 'Okt 2025', portfolio: 4.8, benchmark: 1.3 },     // Q3 Mega-Earnings
      { name: 'Nov 2025', portfolio: 2.7, benchmark: 0.8 },
      { name: 'Dez 2025', portfolio: 2.3, benchmark: 0.5 },
    ],
    einzahlungen: [
      { monat: 'Jan 2025', betrag: 500000, label: 'Einzahlung 0,5 Mio EUR (Seed-Exit)' },
    ],
    allocation: { aktien: 67, anleihen: 8, alternative: 20, cash: 5, immobilien: 0 },
    targetAllocation: { aktien: 65, anleihen: 10, alternative: 20, cash: 5, immobilien: 0 },
    sectors: [
      { name: 'Technologie', value: 38 },
      { name: 'Kommunikation', value: 12 },
      { name: 'Konsum', value: 10 },
      { name: 'Healthcare', value: 8 },
      { name: 'Finanzen', value: 7 },
      { name: 'Industrie', value: 5 },
    ],
    regions: [
      { name: 'Nordamerika', value: 50 },
      { name: 'Asien-Pazifik', value: 22 },
      { name: 'Europa', value: 18 },
      { name: 'Schwellenlaender', value: 7 },
      { name: 'Sonstige', value: 3 },
    ],
    riskMetrics: { volatilitaet: 15.8, sharpe: 1.42, maxDrawdown: -11.5, var95: -4.9, trackingError: 5.1 },
    bonds: [
      { name: 'High Yield', value: 35 },
      { name: 'Wandelanleihen', value: 30 },
      { name: 'Investment Grade', value: 20 },
      { name: 'Emerging Markets', value: 15 },
    ],
    currencies: [
      { name: 'USD', value: 45 },
      { name: 'EUR', value: 35 },
      { name: 'CHF', value: 5 },
      { name: 'GBP', value: 5 },
      { name: 'Sonstige', value: 10 },
    ],
    ioComment: 'Aggressives Wachstumsprofil mit starker Tech-Übergewichtung. Die YTD-Outperformance gegenüber Benchmark ist beeindruckend (+3,4pp), geht aber mit erhöhter Volatilität einher. Krypto-Exposure (120k extern) sollte im Gesamtkontext berücksichtigt werden. Bei erfolgreichem nächsten Exit empfehlen wir Upgrade auf FairValue mit breiterer Diversifikation.',
  },
};


// ─── 2. VV_WPHG ── WpHG Compliance data per Mandant ────────────────────────

export const VV_WPHG = {
  // ── W1: Dr. Heinrich von Trott ──
  VV00001: {
    fragebogen: {
      letztesUpdate: '2025-11-15',
      naechstesPruefung: '2026-05-15',
      status: 'aktuell',
      risikoklasse: 3,
      anlageziel: 'Kapitalerhalt mit moderatem Wachstum',
      anlagehorizont: '10+ Jahre',
      erfahrung: { aktien: 'hoch', anleihen: 'hoch', alternative: 'mittel', derivate: 'gering' },
    },
    geeignetheit: {
      status: 'konform',
      pruefungen: [
        { datum: '2026-03-01', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'Alle Positionen innerhalb der Risikoklasse. Aktienquote konform.' },
        { datum: '2025-12-15', typ: 'Jahresprüfung', ergebnis: 'bestanden', details: 'Gesamtportfolio entspricht Risikoprofil und Anlagezielen.' },
        { datum: '2025-09-20', typ: 'Ad-hoc Prüfung', ergebnis: 'bestanden', details: 'ESG-Filter-Anpassung geprüft und konform.' },
      ],
    },
    verlustschwelle: {
      schwelle: -10,
      aktuell: -3.2,
      status: 'ok',
      meldungen: [
        { datum: '2024-10-15', schwelle: -10, verlust: -6.8, gemeldet: false },
        { datum: '2022-09-30', schwelle: -10, verlust: -11.2, gemeldet: true },
      ],
    },
    kosten: {
      exAnte: {
        managementFee: 0.85,
        performanceFee: 'keine',
        custodyFee: 0.05,
        transaktionskosten: 0.12,
        gesamtTER: 1.02,
      },
      exPost: { jahr: 2025, gesamtkosten: 127500, renditeNachKosten: 7.5 },
    },
    dokumente: [
      { typ: 'WpHG-Fragebogen', datum: '2025-11-15', status: 'aktuell' },
      { typ: 'Geeignetheitsprüfung', datum: '2026-03-01', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermögensverwaltungsvertrag', datum: '2018-01-15', status: 'aktuell' },
    ],
  },

  // ── W2: Familie Lindenberg ──
  VV00002: {
    fragebogen: {
      letztesUpdate: '2025-08-20',
      naechstesPruefung: '2026-08-20',
      status: 'aktuell',
      risikoklasse: 4,
      anlageziel: 'Langfristiges Vermögenswachstum',
      anlagehorizont: '10+ Jahre',
      erfahrung: { aktien: 'hoch', anleihen: 'mittel', alternative: 'hoch', derivate: 'mittel' },
    },
    geeignetheit: {
      status: 'konform',
      pruefungen: [
        { datum: '2026-02-15', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'Tech-Übergewichtung innerhalb der Risikoklasse 4 toleriert.' },
        { datum: '2025-11-10', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'PE-Allokation geprüft und konform.' },
        { datum: '2025-08-20', typ: 'Jahresprüfung', ergebnis: 'bestanden', details: 'Neuer Fragebogen nach SaaS-Exit, Risikoklasse 4 bestätigt.' },
      ],
    },
    verlustschwelle: {
      schwelle: -15,
      aktuell: -5.1,
      status: 'ok',
      meldungen: [],
    },
    kosten: {
      exAnte: {
        managementFee: 1.05,
        performanceFee: 'keine',
        custodyFee: 0.05,
        transaktionskosten: 0.15,
        gesamtTER: 1.25,
      },
      exPost: { jahr: 2025, gesamtkosten: 26250, renditeNachKosten: 10.9 },
    },
    dokumente: [
      { typ: 'WpHG-Fragebogen', datum: '2025-08-20', status: 'aktuell' },
      { typ: 'Geeignetheitsprüfung', datum: '2026-02-15', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermögensverwaltungsvertrag', datum: '2024-06-01', status: 'aktuell' },
    ],
  },

  // ── W3: Stiftung Weber ──
  VV00003: {
    fragebogen: {
      letztesUpdate: '2025-10-01',
      naechstesPruefung: '2026-04-01',
      status: 'aktuell',
      risikoklasse: 2,
      anlageziel: 'Realer Kapitalerhalt mit laufender Ausschüttung',
      anlagehorizont: 'unbefristet',
      erfahrung: { aktien: 'mittel', anleihen: 'hoch', alternative: 'gering', derivate: 'gering' },
    },
    geeignetheit: {
      status: 'konform',
      pruefungen: [
        { datum: '2026-02-28', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'Kapitalerhalt und Ausschüttungsziel (3%) erfüllt.' },
        { datum: '2025-12-01', typ: 'Stiftungsrechtliche Prüfung', ergebnis: 'bestanden', details: 'Anlage konform mit Stiftungssatzung und Anlagerichtlinien.' },
        { datum: '2025-10-01', typ: 'Jahresprüfung', ergebnis: 'bestanden', details: 'Stiftungsrat hat Anlagerichtlinien bestätigt.' },
      ],
    },
    verlustschwelle: {
      schwelle: -8,
      aktuell: -1.5,
      status: 'ok',
      meldungen: [
        { datum: '2022-06-30', schwelle: -8, verlust: -8.5, gemeldet: true },
      ],
    },
    kosten: {
      exAnte: {
        managementFee: 0.75,
        performanceFee: 'keine',
        custodyFee: 0.04,
        transaktionskosten: 0.08,
        gesamtTER: 0.87,
      },
      exPost: { jahr: 2025, gesamtkosten: 72210, renditeNachKosten: 4.3 },
    },
    dokumente: [
      { typ: 'WpHG-Fragebogen', datum: '2025-10-01', status: 'aktuell' },
      { typ: 'Geeignetheitsprüfung', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Stiftungsanlagerichtlinien', datum: '2025-10-01', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermögensverwaltungsvertrag', datum: '2008-01-15', status: 'aktuell' },
    ],
  },

  // ── W4: Prof. Dr. Hartmann ──
  VV00004: {
    fragebogen: {
      letztesUpdate: '2025-09-10',
      naechstesPruefung: '2026-09-10',
      status: 'aktuell',
      risikoklasse: 3,
      anlageziel: 'Ausgewogenes Wachstum mit Healthcare-Schwerpunkt',
      anlagehorizont: '7-10 Jahre',
      erfahrung: { aktien: 'hoch', anleihen: 'mittel', alternative: 'mittel', derivate: 'gering' },
    },
    geeignetheit: {
      status: 'konform',
      pruefungen: [
        { datum: '2026-03-01', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'Healthcare-Schwerpunkt (22%) konform mit Anlageziel.' },
        { datum: '2025-12-10', typ: 'Quartalsprüfung', ergebnis: 'bestanden', details: 'PE Healthcare Allokation geprüft und konform.' },
        { datum: '2025-09-10', typ: 'Jahresprüfung', ergebnis: 'bestanden', details: 'Anlageziel und Risikoklasse bestätigt.' },
      ],
    },
    verlustschwelle: {
      schwelle: -10,
      aktuell: -4.8,
      status: 'ok',
      meldungen: [
        { datum: '2022-09-30', schwelle: -10, verlust: -12.1, gemeldet: true },
      ],
    },
    kosten: {
      exAnte: {
        managementFee: 0.85,
        performanceFee: '10% > Benchmark',
        custodyFee: 0.05,
        transaktionskosten: 0.10,
        gesamtTER: 1.00,
      },
      exPost: { jahr: 2025, gesamtkosten: 68000, renditeNachKosten: 8.1 },
    },
    dokumente: [
      { typ: 'WpHG-Fragebogen', datum: '2025-09-10', status: 'aktuell' },
      { typ: 'Geeignetheitsprüfung', datum: '2026-03-01', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermögensverwaltungsvertrag', datum: '2019-01-10', status: 'aktuell' },
    ],
  },

  // ── W5: Tim Keller – ABGELAUFEN (Demo) ──
  VV00005: {
    fragebogen: {
      letztesUpdate: '2024-12-15',
      naechstesPruefung: '2025-06-15',
      status: 'abgelaufen',
      risikoklasse: 5,
      anlageziel: 'Maximales Wachstum, Tech/Impact',
      anlagehorizont: '15+ Jahre',
      erfahrung: { aktien: 'hoch', anleihen: 'gering', alternative: 'hoch', derivate: 'mittel' },
    },
    geeignetheit: {
      status: 'warnung',
      pruefungen: [
        { datum: '2026-03-10', typ: 'Quartalsprüfung', ergebnis: 'warnung', details: 'WpHG-Fragebogen abgelaufen seit 15.06.2025. Erneuerung dringend erforderlich.' },
        { datum: '2025-12-01', typ: 'Quartalsprüfung', ergebnis: 'warnung', details: 'Fragebogen abgelaufen. Mandant wurde per E-Mail kontaktiert.' },
        { datum: '2025-06-15', typ: 'Jahresprüfung', ergebnis: 'fällig', details: 'Prüfung fällig, Mandant hat Termin nicht wahrgenommen.' },
      ],
    },
    verlustschwelle: {
      schwelle: -20,
      aktuell: -8.3,
      status: 'ok',
      meldungen: [],
    },
    kosten: {
      exAnte: {
        managementFee: 1.05,
        performanceFee: 'keine',
        custodyFee: 0.05,
        transaktionskosten: 0.18,
        gesamtTER: 1.28,
      },
      exPost: { jahr: 2025, gesamtkosten: 5760, renditeNachKosten: 10.2 },
    },
    dokumente: [
      { typ: 'WpHG-Fragebogen', datum: '2024-12-15', status: 'abgelaufen', faellig: '2025-06-15' },
      { typ: 'Geeignetheitsprüfung', datum: '2026-03-10', status: 'aktuell' },
      { typ: 'Ex-Ante Kosteninformation', datum: '2026-01-10', status: 'aktuell' },
      { typ: 'Ex-Post Kostenausweis', datum: '2026-02-28', status: 'aktuell' },
      { typ: 'Vermögensverwaltungsvertrag', datum: '2025-01-05', status: 'aktuell' },
    ],
  },
};


// ─── 3. VV_FAMILIE ── Family / Network data per Mandant ─────────────────────

export const VV_FAMILIE = {
  // ── W1: Dr. Heinrich von Trott ──
  VV00001: {
    mitglieder: [
      { name: 'Dr. Heinrich von Trott', rolle: 'mandant', alter: 62, beruf: 'Unternehmer Maschinenbau 3.Gen', mandant: true, aum: 12500000 },
      { name: 'Elisabeth von Trott', rolle: 'ehepartner', alter: 59, beruf: 'Stiftungsvorstand (ehrenamtlich)', vermoegen: 850000 },
      { name: 'Charlotte von Trott', rolle: 'kind', alter: 32, beruf: 'Anwaeltin, Partnerin Wirtschaftskanzlei (Frankfurt)', vermoegen: 800000 },
      { name: 'Friedrich von Trott', rolle: 'kind', alter: 28, beruf: 'Ingenieur, im Familienunternehmen taetig', vermoegen: 250000 },
    ],
    vermoegensUebersicht: {
      gesamt: 24170000,
      aufgliederung: [
        { typ: 'Eigenes Mandat', volumen: 12500000, anteil: 51.7 },
        { typ: 'Fremdbanken', volumen: 3200000, anteil: 13.2 },
        { typ: 'Immobilien', volumen: 3650000, anteil: 15.1 },
        { typ: 'Unternehmen', volumen: 4500000, anteil: 18.6 },
        { typ: 'Sonstiges', volumen: 320000, anteil: 1.4 },
      ],
    },
    generationenPlanung: {
      themen: [
        'Unternehmensnachfolge Maschinenbau GmbH – Friedrich als Nachfolger',
        'NextGen Charlotte – eigene Vermögensverwaltung aufbauen',
        'Familienstiftung Gruendung – Elisabeth als Initiatorin',
        'Steueroptimierte Vermögensübertragung an Kinder',
        'LV-Ablauf 2026 – Wiederanlage planen',
      ],
      zeitrahmen: '3-5 Jahre (Übergabe Unternehmen)',
      notizen: 'Heinrich plant Rückzug aus dem operativen Geschäft mit 65-67. Friedrich wird eingearbeitet, Charlotte hat kein Interesse am Unternehmen. Elisabeth möchte Familienstiftung für Bildungszwecke gründen (2M Stiftungskapital). Erbschaftssteuerliche Optimierung sollte frühzeitig geplant werden.',
    },
  },

  // ── W2: Familie Lindenberg ──
  VV00002: {
    mitglieder: [
      { name: 'Markus Lindenberg', rolle: 'mandant', alter: 51, beruf: 'SaaS-Unternehmer (Exit 2024, 8M netto)', mandant: true, aum: 2100000 },
      { name: 'Julia Lindenberg', rolle: 'ehepartner', alter: 48, beruf: 'CTO (eigenes Startup)', vermoegen: 450000 },
      { name: 'Noah Lindenberg', rolle: 'kind', alter: 18, beruf: 'Abiturient, Studienbeginn 2026' },
      { name: 'Ella Lindenberg', rolle: 'kind', alter: 15, beruf: 'Schülerin (Gymnasium)' },
    ],
    vermoegensUebersicht: {
      gesamt: 10430000,
      aufgliederung: [
        { typ: 'Eigenes Mandat', volumen: 2400000, anteil: 23.0 },
        { typ: 'Fremdbanken', volumen: 5700000, anteil: 54.7 },
        { typ: 'Immobilien', volumen: 1650000, anteil: 15.8 },
        { typ: 'Unternehmen', volumen: 400000, anteil: 3.8 },
        { typ: 'Sonstiges', volumen: 280000, anteil: 2.7 },
      ],
    },
    generationenPlanung: {
      themen: [
        'Cash-Konsolidierung 5,5M (höchste Priorität)',
        'NextGen Noah – Studiendepot 100k',
        'Julias Startup – Liquiditätsbedarf beobachten',
        'Angel-Portfolio professionalisieren',
        'Langfristige Familienstruktur planen',
      ],
      zeitrahmen: '1-2 Jahre (Cash-Konsolidierung kurzfristig)',
      notizen: 'Markus hat durch den SaaS-Exit 2024 erhebliche liquide Mittel erhalten, die noch größtenteils unstrukturiert bei der Commerzbank liegen. Julia arbeitet an einem eigenen Startup (Seed-Phase). Noah beginnt 2026 mit dem Studium. Ella hat noch 3 Jahre Schule. Priorität: Cash strukturiert investieren, bevor Inflation den Wert auffrisst.',
    },
  },

  // ── W3: Stiftung Weber ──
  VV00003: {
    mitglieder: [
      { name: 'Stiftung Weber', rolle: 'stiftung', alter: 0, beruf: 'Bildungsstiftung (gegründet 2008)', mandant: true, aum: 8300000 },
      { name: 'Dr. Martin Weber', rolle: 'mandant', alter: 74, beruf: 'Stifter, ehem. Unternehmer' },
      { name: 'Claudia Weber', rolle: 'ehepartner', alter: 71, beruf: 'Stiftungsvorstand' },
      { name: 'Dr. Thomas Fischer', rolle: 'kind', alter: 0, beruf: 'Geschäftsfuehrer Stiftung, Vorstandsmitglied' },
    ],
    vermoegensUebersicht: {
      gesamt: 8800000,
      aufgliederung: [
        { typ: 'Eigenes Mandat', volumen: 8300000, anteil: 94.3 },
        { typ: 'Fremdbanken', volumen: 500000, anteil: 5.7 },
        { typ: 'Immobilien', volumen: 0, anteil: 0 },
        { typ: 'Unternehmen', volumen: 0, anteil: 0 },
        { typ: 'Sonstiges', volumen: 0, anteil: 0 },
      ],
    },
    generationenPlanung: {
      themen: [
        'ESG Art.9 Upgrade des Stiftungsmandats',
        'Ausschüttungsoptimierung für Förderzwecke',
        'Sparkasse-Festgeld bei Fälligkeit konsolidieren',
        'Stiftungskapital langfristig erhalten (realer Kapitalerhalt)',
      ],
      zeitrahmen: 'Unbefristet (Stiftung auf Dauer angelegt)',
      notizen: 'Die Stiftung Weber fördert seit 2008 Bildungsprojekte in der Region. Jährliche Ausschüttung ca. 250.000 EUR für Förderzwecke. Der Stiftungsrat tagt halbjährlich. Dr. Weber (Stifter) zieht sich zunehmend zurück, Dr. Fischer übernimmt operativ. Ziel: realer Kapitalerhalt bei zuverlässiger Ausschüttung.',
    },
  },

  // ── W4: Prof. Dr. Hartmann ──
  VV00004: {
    mitglieder: [
      { name: 'Prof. Dr. Michael Hartmann', rolle: 'mandant', alter: 56, beruf: 'Chefarzt Kardiologie + Privatpraxis', mandant: true, aum: 6800000 },
      { name: 'Andrea Hartmann', rolle: 'ehepartner', alter: 53, beruf: 'Psychologin (eigene Praxis)', vermoegen: 380000 },
      { name: 'Jan Hartmann', rolle: 'kind', alter: 26, beruf: 'Assistenzarzt Innere Medizin', vermoegen: 50000 },
      { name: 'Sophie Hartmann', rolle: 'kind', alter: 23, beruf: 'Medizinstudentin (5. Semester)' },
    ],
    vermoegensUebersicht: {
      gesamt: 8330000,
      aufgliederung: [
        { typ: 'Eigenes Mandat', volumen: 7000000, anteil: 84.0 },
        { typ: 'Fremdbanken', volumen: 330000, anteil: 4.0 },
        { typ: 'Immobilien', volumen: 800000, anteil: 9.6 },
        { typ: 'Unternehmen', volumen: 0, anteil: 0 },
        { typ: 'Sonstiges', volumen: 200000, anteil: 2.4 },
      ],
    },
    generationenPlanung: {
      themen: [
        'Praxisnachfolge planen (Verkauf in 5-8 Jahren)',
        'NextGen Jan – eigene Vermögensverwaltung aufbauen',
        'Sophie – Studienfinanzierung und spätere Niederlassung',
        'PE Healthcare Fund II – Fachexpertise nutzen',
        'ING-Tagesgeld konsolidieren',
      ],
      zeitrahmen: '5-8 Jahre (Praxisverkauf)',
      notizen: 'Prof. Hartmann plant den Verkauf seiner Privatpraxis in 5-8 Jahren (dann 61-64). Sohn Jan (Assistenzarzt) könnte eventuell übernehmen, was aber noch offen ist. Sophie studiert Medizin und plant eigene kardiologische Praxis. Andrea führt eine eigene psychologische Praxis. Praxisverkaufserlöse (ca. 800k) sollen ins FairValue Mandat fließen.',
    },
  },

  // ── W5: Tim Keller ──
  VV00005: {
    mitglieder: [
      { name: 'Tim Keller', rolle: 'mandant', alter: 29, beruf: 'Tech-Gründer (Seed-Exit 500k)', mandant: true, aum: 450000 },
    ],
    vermoegensUebersicht: {
      gesamt: 658000,
      aufgliederung: [
        { typ: 'Eigenes Mandat', volumen: 450000, anteil: 68.4 },
        { typ: 'Fremdbanken', volumen: 8000, anteil: 1.2 },
        { typ: 'Immobilien', volumen: 0, anteil: 0 },
        { typ: 'Unternehmen', volumen: 80000, anteil: 12.2 },
        { typ: 'Sonstiges', volumen: 120000, anteil: 18.2 },
      ],
    },
    generationenPlanung: {
      themen: [
        'Nächster Exit vorbereiten – Upgrade auf FairValue',
        'Krypto-Bestand strukturieren und integrieren',
        'Angel-Portfolio professionell tracken',
        'Langfristigen Vermoegensaufbau starten',
      ],
      zeitrahmen: '2-3 Jahre (naechster Startup-Exit)',
      notizen: 'Tim ist als Tech-Gründer ein typischer NextGen-Mandant mit hohem Wachstumspotenzial. Aktuell kleines AuM (450k), aber bei erfolgreichem naechsten Exit (Series A Investment) könnte das Volumen auf 1,5-2M steigen. Krypto-Bestand (120k) und Angel-Investments (80k) sollten im Gesamtreporting integriert werden. WpHG-Fragebogen ist abgelaufen – Erneuerung dringend.',
    },
  },
};


// ─── 4. VV_ENGAGEMENT ── Digital engagement signals per Mandant ──────────────

export const VV_ENGAGEMENT = {
  // ── W1: Dr. Heinrich von Trott ──
  VV00001: {
    linkedin: {
      url: 'linkedin.com/in/heinrich-von-trott',
      profilUrl: 'linkedin.com/in/heinrich-von-trott',
      aktivitaet: 'niedrig',
      letzterPost: '2025-06-10',
      themen: ['Maschinenbau', 'Industrie 4.0', 'Familienunternehmen'],
      kontakte: 480,
      letzteAktivitaeten: [
        { typ: 'share', datum: '2025-06-10', inhalt: 'Artikel geteilt: "Nachfolge im Mittelstand – Herausforderungen 2025"' },
        { typ: 'like', datum: '2025-05-22', inhalt: 'IHK-Beitrag zu Industrie 4.0 Förderung geliked' },
        { typ: 'profil_update', datum: '2025-04-15', inhalt: 'Profilbild aktualisiert' },
      ],
      signale: ['Nachfolge-Thema aktiv', 'ESG-Roadmap 2030 erwähnt', 'Sohn Friedrich als neuer COO'],
    },
    website: {
      besuche: [
        { datum: '2026-02-20', seite: '/marktbericht', dauer: 180 },
        { datum: '2026-01-15', seite: '/quartalsbericht', dauer: 420 },
        { datum: '2025-12-10', seite: '/esg-report', dauer: 240 },
      ],
      letzterBesuch: '2026-02-20',
      besuche90Tage: 5,
      avgVerweildauer: '4:40 Min',
      topSeiten: [
        { seite: '/quartalsbericht', besuche: 3 },
        { seite: '/marktbericht', besuche: 2 },
        { seite: '/esg-report', besuche: 1 },
      ],
      signale: ['Regelmäßig Quartalsbericht gelesen', 'ESG-Report Interesse'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 65,
      letzteOeffnung: '2026-03-05',
      klicks: [
        { datum: '2026-03-05', betreff: 'Marktausblick Q1 2026', aktion: 'geöffnet' },
        { datum: '2026-02-10', betreff: 'Nachfolge-Spezial: Steueroptimierte Übergabe', aktion: 'geklickt' },
        { datum: '2026-01-08', betreff: 'ESG-Update: Art.9 Mandate im Vergleich', aktion: 'geklickt' },
      ],
      signale: ['Nachfolge-Themen geklickt', 'ESG-Interesse'],
    },
    events: {
      vergangene: [
        { name: 'Nachfolge-Roundtable', datum: '2026-02-20', typ: 'roundtable', status: 'teilgenommen' },
        { name: 'Jahresempfang 2025', datum: '2025-12-10', typ: 'dinner', status: 'teilgenommen' },
        { name: 'ESG-Webinar', datum: '2025-10-15', typ: 'webinar', status: 'nicht teilgenommen' },
      ],
      empfohlene: [
        { name: 'Familienstiftung Praxistag', datum: '2026-04-15', match: 'hoch', grund: 'Elisabeth plant Stiftungsgruendung', aktion: 'einladen' },
        { name: 'Nachfolge-Kongress Frankfurt', datum: '2026-05-20', match: 'hoch', grund: 'Unternehmensnachfolge in 3-5 Jahren', aktion: 'einladen' },
        { name: 'ESG Art.9 Workshop', datum: '2026-04-08', match: 'mittel', grund: 'Portfolio-Upgrade geplant', aktion: 'vorschlagen' },
      ],
    },
    presse: [
      { datum: '2026-01-20', quelle: 'Handelsblatt', titel: 'Maschinenbau-Mittelstand: Nachfolgeproblematik verschaerft sich', signal: 'Nachfolge-Thema – Action noetig' },
      { datum: '2025-11-05', quelle: 'FAZ', titel: 'Von Trott Maschinenbau gewinnt Innovationspreis', signal: 'Positiv – Sichtbarkeit' },
    ],
    digitalScore: 42,
  },

  // ── W2: Familie Lindenberg ──
  VV00002: {
    linkedin: {
      url: 'linkedin.com/in/markus-lindenberg',
      profilUrl: 'linkedin.com/in/markus-lindenberg',
      aktivitaet: 'hoch',
      letzterPost: '2026-03-08',
      themen: ['SaaS', 'Startup', 'Venture Capital', 'Tech-Exits', 'Entrepreneurship'],
      kontakte: 2850,
      letzteAktivitaeten: [
        { typ: 'post', datum: '2026-03-08', inhalt: 'Beitrag: "Was ich nach meinem SaaS-Exit über Vermögen gelernt habe"' },
        { typ: 'share', datum: '2026-02-28', inhalt: 'PE-Report 2026 geteilt mit Kommentar zu Healthcare-Investments' },
        { typ: 'like', datum: '2026-02-20', inhalt: 'Artikel "Angel Investing Lektionen" geliked' },
        { typ: 'post', datum: '2026-02-10', inhalt: 'Julia\'s Startup-Fortschritte: Series A Vorbereitung' },
      ],
      signale: ['Hohe Sichtbarkeit in VC-Community', 'PE/Healthcare Interesse', 'Exit-Vermoegen Thema aktiv'],
    },
    website: {
      besuche: [
        { datum: '2026-03-10', seite: '/pe-fund-basket', dauer: 360 },
        { datum: '2026-03-05', seite: '/marktbericht', dauer: 120 },
        { datum: '2026-02-28', seite: '/fairvalue-mandat', dauer: 480 },
        { datum: '2026-02-15', seite: '/pe-healthcare', dauer: 300 },
      ],
      letzterBesuch: '2026-03-10',
      besuche90Tage: 12,
      avgVerweildauer: '5:15 Min',
      topSeiten: [
        { seite: '/pe-fund-basket', besuche: 4 },
        { seite: '/fairvalue-mandat', besuche: 3 },
        { seite: '/pe-healthcare', besuche: 3 },
        { seite: '/marktbericht', besuche: 2 },
      ],
      signale: ['FairValue-Upgrade Interesse – Action noetig', 'PE-Seiten intensiv besucht'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 82,
      letzteOeffnung: '2026-03-10',
      klicks: [
        { datum: '2026-03-10', betreff: 'PE Healthcare Fund II – Jetzt zeichnen', aktion: 'geklickt' },
        { datum: '2026-02-25', betreff: 'FairValue vs. SmartValue: Ihr Upgrade-Pfad', aktion: 'geklickt' },
        { datum: '2026-02-10', betreff: 'Marktausblick Q1 2026', aktion: 'geöffnet' },
        { datum: '2026-01-15', betreff: 'Cash-Allokation: Warum jeder Monat zaehlt', aktion: 'geklickt' },
      ],
      signale: ['PE-Zeichnung geklickt – Top-Signal', 'Cash-Thema resoniert'],
    },
    events: {
      vergangene: [
        { name: 'Tech-Exits Roundtable', datum: '2026-01-22', typ: 'roundtable', status: 'teilgenommen' },
        { name: 'Jahresempfang 2025', datum: '2025-12-10', typ: 'dinner', status: 'teilgenommen' },
        { name: 'Angel Investing Webinar', datum: '2025-11-20', typ: 'webinar', status: 'teilgenommen' },
      ],
      empfohlene: [
        { name: 'PE Investor Day', datum: '2026-03-15', match: 'hoch', grund: 'PE-Allokation erhoehen geplant', aktion: 'einladen' },
        { name: 'FairValue Mandatsvorstellung', datum: '2026-04-10', match: 'hoch', grund: 'Upgrade bei Cash-Konsolidierung', aktion: 'einladen' },
        { name: 'NextGen Investing Webinar', datum: '2026-05-08', match: 'mittel', grund: 'Noah (18) beginnt Studium', aktion: 'vorschlagen' },
      ],
    },
    presse: [
      { datum: '2026-02-15', quelle: 'Gründerszene', titel: 'Keller Ventures: Neuer SaaS-Fund aufgelegt', signal: 'Liquiditaet – weitere Exits moeglich' },
      { datum: '2025-09-30', quelle: 'Finance Forward', titel: 'SaaS-Exit 2024: Wie Gründer ihr Vermoegen anlegen', signal: 'Positiv – Engagement Sichtbarkeit' },
    ],
    digitalScore: 78,
  },

  // ── W3: Stiftung Weber ──
  VV00003: {
    linkedin: {
      url: null,
      profilUrl: null,
      aktivitaet: 'niedrig',
      letzterPost: '2025-03-20',
      themen: ['Bildungsfoerderung', 'Stiftungswesen', 'Nachhaltigkeit'],
      kontakte: 120,
      letzteAktivitaeten: [
        { typ: 'share', datum: '2025-03-20', inhalt: 'Stiftung Weber Jahresbericht 2024 geteilt' },
      ],
      signale: ['Geringe digitale Praesenz', 'Stiftungs-Netzwerk offline aktiver'],
    },
    website: {
      besuche: [
        { datum: '2026-01-20', seite: '/esg-report', dauer: 300 },
        { datum: '2025-10-10', seite: '/stiftungsmandat', dauer: 240 },
      ],
      letzterBesuch: '2026-01-20',
      besuche90Tage: 2,
      avgVerweildauer: '4:30 Min',
      topSeiten: [
        { seite: '/esg-report', besuche: 2 },
        { seite: '/stiftungsmandat', besuche: 1 },
      ],
      signale: ['ESG-Report gelesen – Art.9 Interesse'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 45,
      letzteOeffnung: '2026-02-01',
      klicks: [
        { datum: '2026-02-01', betreff: 'ESG-Spezial: Art.9 für Stiftungen', aktion: 'geklickt' },
        { datum: '2025-12-15', betreff: 'Stiftungsmandat Jahresrückblick', aktion: 'geöffnet' },
      ],
      signale: ['ESG Art.9 Klick – Upgrade-Signal'],
    },
    events: {
      vergangene: [
        { name: 'Stiftungstag 2025', datum: '2025-11-15', typ: 'konferenz', status: 'teilgenommen' },
        { name: 'ESG-Webinar', datum: '2025-10-15', typ: 'webinar', status: 'teilgenommen' },
      ],
      empfohlene: [
        { name: 'Stiftungsrecht-Update 2026', datum: '2026-04-22', match: 'hoch', grund: 'Neue Stiftungsgesetzgebung relevant', aktion: 'einladen' },
        { name: 'ESG Art.9 Impact Workshop', datum: '2026-05-12', match: 'hoch', grund: 'Art.9 Upgrade geplant', aktion: 'einladen' },
      ],
    },
    presse: [
      { datum: '2025-12-05', quelle: 'Stiftung & Sponsoring', titel: 'Stiftung Weber: 15 Jahre Bildungsfoerderung in der Region', signal: 'Positiv – Sichtbarkeit' },
    ],
    digitalScore: 22,
  },

  // ── W4: Prof. Dr. Hartmann ──
  VV00004: {
    linkedin: {
      url: 'linkedin.com/in/prof-hartmann-kardiologie',
      profilUrl: 'linkedin.com/in/prof-hartmann-kardiologie',
      aktivitaet: 'mittel',
      letzterPost: '2026-01-28',
      themen: ['Kardiologie', 'Medizintechnik', 'Healthcare Innovation', 'Private Equity'],
      kontakte: 950,
      letzteAktivitaeten: [
        { typ: 'post', datum: '2026-01-28', inhalt: 'Kommentar zur neuen Herzinsuffizienz-Leitlinie' },
        { typ: 'share', datum: '2026-01-15', inhalt: 'Artikel geteilt: "PE in Healthcare – Chancen für Fachexperten"' },
        { typ: 'like', datum: '2025-12-20', inhalt: 'MedTech Innovation Report geliked' },
      ],
      signale: ['Healthcare PE Interesse – Engagement', 'Fachliche Sichtbarkeit hoch'],
    },
    website: {
      besuche: [
        { datum: '2026-03-05', seite: '/pe-healthcare-fund-ii', dauer: 540 },
        { datum: '2026-02-20', seite: '/marktbericht', dauer: 180 },
        { datum: '2026-01-28', seite: '/quartalsbericht', dauer: 360 },
      ],
      letzterBesuch: '2026-03-05',
      besuche90Tage: 7,
      avgVerweildauer: '6:00 Min',
      topSeiten: [
        { seite: '/pe-healthcare-fund-ii', besuche: 3 },
        { seite: '/quartalsbericht', besuche: 2 },
        { seite: '/marktbericht', besuche: 2 },
      ],
      signale: ['PE Healthcare Fund II intensiv angesehen – Top-Signal'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 72,
      letzteOeffnung: '2026-03-08',
      klicks: [
        { datum: '2026-03-08', betreff: 'PE Healthcare Fund II – Exklusive Zeichnung', aktion: 'geklickt' },
        { datum: '2026-02-12', betreff: 'Marktausblick Q1 2026', aktion: 'geöffnet' },
        { datum: '2026-01-20', betreff: 'Nachfolgeplanung für Praxisinhaber', aktion: 'geklickt' },
      ],
      signale: ['PE-Zeichnung geklickt', 'Praxisnachfolge Interesse'],
    },
    events: {
      vergangene: [
        { name: 'PE Healthcare Investor Call', datum: '2026-02-25', typ: 'webinar', status: 'teilgenommen' },
        { name: 'Jahresempfang 2025', datum: '2025-12-10', typ: 'dinner', status: 'teilgenommen' },
        { name: 'Medtech-Konferenz München', datum: '2025-10-08', typ: 'konferenz', status: 'teilgenommen' },
      ],
      empfohlene: [
        { name: 'PE Healthcare Fund II Zeichnung', datum: '2026-04-01', match: 'hoch', grund: 'Fachexpertise + Website-Aktivität', aktion: 'einladen' },
        { name: 'Praxisnachfolge Roundtable', datum: '2026-05-15', match: 'hoch', grund: 'Praxisverkauf in 5-8 Jahren', aktion: 'einladen' },
        { name: 'NextGen Mediziner Dinner', datum: '2026-06-10', match: 'mittel', grund: 'Jan (Assistenzarzt) als potenzieller Mandant', aktion: 'vorschlagen' },
      ],
    },
    presse: [
      { datum: '2026-02-10', quelle: 'Aerztezeitung', titel: 'Neue Leitlinie Herzinsuffizienz: Prof. Hartmann im Expertengremium', signal: 'Positiv – fachliche Sichtbarkeit' },
      { datum: '2025-11-20', quelle: 'Manager Magazin', titel: 'Healthcare PE: Warum Aerzte die besten Investoren sind', signal: 'PE-Engagement – Action noetig' },
    ],
    digitalScore: 58,
  },

  // ── W5: Tim Keller ──
  VV00005: {
    linkedin: {
      url: 'linkedin.com/in/timkeller-tech',
      profilUrl: 'linkedin.com/in/timkeller-tech',
      aktivitaet: 'sehr_hoch',
      letzterPost: '2026-03-12',
      themen: ['Deep Tech', 'AI/ML', 'Climate Tech', 'Web3', 'Impact Investing', 'Startup Ecosystem'],
      kontakte: 4200,
      letzteAktivitaeten: [
        { typ: 'post', datum: '2026-03-12', inhalt: 'Thread: "Warum ich mein Krypto-Portfolio jetzt professionell managen lasse"' },
        { typ: 'share', datum: '2026-03-08', inhalt: 'Climate Tech Award Ankuendigung geteilt' },
        { typ: 'post', datum: '2026-03-01', inhalt: 'Beitrag: "Series A Fundraising – was ich beim zweiten Mal anders mache"' },
        { typ: 'like', datum: '2026-02-25', inhalt: 'Impact Investing Report 2026 geliked' },
        { typ: 'share', datum: '2026-02-18', inhalt: 'AI/ML Whitepaper mit eigenem Kommentar geteilt' },
      ],
      signale: ['Super aktiv – Thought Leader', 'Krypto-Integration Thema offen', 'Series A bald – Liquiditaet erwartet'],
    },
    website: {
      besuche: [
        { datum: '2026-03-12', seite: '/impact-investing', dauer: 420 },
        { datum: '2026-03-10', seite: '/krypto-reporting', dauer: 300 },
        { datum: '2026-03-08', seite: '/marktbericht', dauer: 90 },
        { datum: '2026-03-05', seite: '/smartvalue-mandat', dauer: 240 },
        { datum: '2026-03-01', seite: '/pe-fund-basket', dauer: 360 },
        { datum: '2026-02-25', seite: '/blog/ai-investieren', dauer: 480 },
      ],
      letzterBesuch: '2026-03-12',
      besuche90Tage: 24,
      avgVerweildauer: '5:30 Min',
      topSeiten: [
        { seite: '/krypto-reporting', besuche: 6 },
        { seite: '/impact-investing', besuche: 5 },
        { seite: '/pe-fund-basket', besuche: 4 },
        { seite: '/smartvalue-mandat', besuche: 3 },
      ],
      signale: ['Krypto-Reporting Top-Interesse', 'Impact Investing aktiv recherchiert', 'SmartValue-Seite besucht – Aktualisierung noetig'],
    },
    newsletter: {
      abonniert: true,
      oeffnungsrate: 95,
      letzteOeffnung: '2026-03-12',
      klicks: [
        { datum: '2026-03-12', betreff: 'Krypto x VV: Integration jetzt moeglich', aktion: 'geklickt' },
        { datum: '2026-03-05', betreff: 'Impact Investing Spezial', aktion: 'geklickt' },
        { datum: '2026-02-20', betreff: 'AI & Investing: Was Algorithmen koennen', aktion: 'geklickt' },
        { datum: '2026-02-08', betreff: 'PE Fund Basket – neue Opportunitaet', aktion: 'geklickt' },
        { datum: '2026-01-25', betreff: 'Marktausblick Q1 2026', aktion: 'geklickt' },
      ],
      signale: ['Super-Engager – 95% Öffnungsrate', 'Alle relevanten Links geklickt'],
    },
    events: {
      vergangene: [
        { name: 'AI & Investing Webinar', datum: '2026-03-05', typ: 'webinar', status: 'teilgenommen' },
        { name: 'NextGen Networking Dinner', datum: '2026-02-18', typ: 'dinner', status: 'teilgenommen' },
        { name: 'Tech-Exits Roundtable', datum: '2026-01-22', typ: 'roundtable', status: 'teilgenommen' },
        { name: 'Impact Investing Konferenz', datum: '2025-11-10', typ: 'konferenz', status: 'teilgenommen' },
        { name: 'Crypto Tax Webinar', datum: '2025-10-05', typ: 'webinar', status: 'teilgenommen' },
      ],
      empfohlene: [
        { name: 'Krypto-Strukturierung Workshop', datum: '2026-04-05', match: 'hoch', grund: 'WpHG-Erneuerung + Krypto-Integration', aktion: 'einladen' },
        { name: 'NextGen Impact Dinner', datum: '2026-04-22', match: 'hoch', grund: 'Thought Leader im Impact-Bereich', aktion: 'einladen' },
        { name: 'Series A Exit-Planung', datum: '2026-05-10', match: 'hoch', grund: 'Nächster Exit erwartet – Mandatsupgrade', aktion: 'einladen' },
        { name: 'Climate Tech Investor Day', datum: '2026-06-15', match: 'mittel', grund: 'Climate Tech Award Gewinner', aktion: 'vorschlagen' },
      ],
    },
    presse: [
      { datum: '2026-03-01', quelle: 'TechCrunch (DE)', titel: 'Keller-Startup gewinnt Climate Tech Award', signal: 'Top-Sichtbarkeit – Engagement-Chance' },
      { datum: '2026-01-15', quelle: 'Gründerszene', titel: 'Gen-Z Gründer: Zwischen Exit-Millionen und Impact Investing', signal: 'Positiv – Sichtbarkeit' },
      { datum: '2025-09-20', quelle: 'Finance Forward', titel: 'Krypto und klassische Vermoegensverwaltung: Geht das zusammen?', signal: 'Krypto-Thema – Aktualisierung noetig' },
    ],
    digitalScore: 92,
  },
};


// ─── 5. VV_LEADS ── Berater-level leads pipeline ───────────────────────────
// Unterteilt in: Neue Mandate (Neukundengewinnung) und Bestandsmandate (Wallet-Vertiefung)

export const VV_LEADS = [
  // ═══════════════════════════════════════════════════════════════════
  // NEUE MANDATE (Neukundengewinnung)
  // ═══════════════════════════════════════════════════════════════════

  // 1. Empfehlung durch Bestandsmandanten
  {
    id: 'NM001',
    name: 'Dr. Katharina Bauer',
    kategorie: 'neumandat',
    quelle: 'empfehlung',
    quelleLabel: 'Empfehlung Bestandsmandant',
    stadium: 'termin',
    geschaetztesVolumen: '3.500.000 €',
    potentialAuM: 3500000,
    wahrscheinlichkeit: 70,
    naechsterSchritt: 'Erstgespräch am 20.03.2026 – Mandatsvorstellung FairValue',
    datum: '2026-03-05',
    referenzMandant: 'VV00004',
    beruf: 'Notarin, Immobilienverkäufe 2025',
    herkunft: 'Empfehlung Prof. Hartmann (VV00004) — Notarin mit 3,5M Nettoerlösen aus Immobilienverkäufen',
    kiDescription: 'KI-Analyse: Dr. Katharina Bauer hat kürzlich mehrere Immobilien in Frankfurt veräußert (Nettoerlös ca. 3,5M €). Die Erlöse liegen derzeit unverzinst auf Tagesgeldkonten verteilt — ein klassisches Post-Liquiditätsevent-Muster. Prof. Hartmann (VV00004) hat sie als Notarin aus dem Ärzte-/Juristennetzwerk Frankfurt empfohlen. Da kein bestehendes VV-Mandat existiert und das Vermögen unstrukturiert angelegt ist, besteht hoher Handlungsbedarf. Empfehlung: FairValue Mandat mit individueller Asset Allocation, Fokus auf inflationsgeschützten Realwerten und Diversifikation. Wahrscheinlichkeit eines Mandatsabschlusses wird auf 70% geschätzt — der persönliche Bezug über Prof. Hartmann ist ein starker Türöffner.',
    herleitung: [
      { label: 'Empfehlungsgeber', value: 'Prof. Dr. Hartmann (VV00004), Mandant seit 2019' },
      { label: 'Kontext', value: 'Gemeinsames Netzwerk Ärzte/Juristen Frankfurt' },
      { label: 'Geschätztes Vermögen', value: '3.500.000 € (Nettoerlöse Immobilienverkäufe 2025)' },
      { label: 'Aktueller Berater', value: 'Kein VV-Mandat, Geld auf Tagesgeldkonten verteilt' },
      { label: 'Empfohlenes Produkt', value: 'FairValue Mandat — individuelle Vermögensverwaltung' },
      { label: 'Nächster Schritt', value: 'Erstgespräch am 20.03.2026, Mandatsvorstellung FairValue' },
    ],
  },
  {
    id: 'NM002',
    name: 'Familie Schneider',
    kategorie: 'neumandat',
    quelle: 'empfehlung',
    quelleLabel: 'Empfehlung Bestandsmandant',
    stadium: 'kennenlernen',
    geschaetztesVolumen: '3.000.000 €',
    potentialAuM: 3000000,
    wahrscheinlichkeit: 50,
    naechsterSchritt: 'WpHG-Fragebogen am 12.03. – dann Mandatsvorschlag',
    datum: '2026-02-20',
    referenzMandant: 'VV00001',
    beruf: 'Logistik-Unternehmer',
    herkunft: 'Empfehlung Dr. von Trott (VV00001) — Logistik-Unternehmer, geschätzt 3M €',
    kiDescription: 'KI-Analyse: Familie Schneider plant den Verkauf ihres Logistikunternehmens mit geschätztem Erlös von ca. 3M €. Die Empfehlung kam direkt von Dr. Heinrich von Trott (VV00001, Top-Mandant mit 12,5M AuM), der die Familie aus dem IHK-Präsidium Rhein-Main kennt. Aktuell liegt das Vermögen bei der Commerzbank Wealth Management — ein Wechsel ist realistisch, da der persönliche Bezug über Dr. von Trott Vertrauen schafft. Der WpHG-Fragebogen ist der nächste formale Schritt. Empfehlung: FairValue Mandat mit Fokus auf Kapitalerhalt und moderatem Wachstum nach Unternehmensverkauf. Cross-Selling-Potenzial: Nachfolgeberatung und Steuerstrategie.',
    herleitung: [
      { label: 'Empfehlungsgeber', value: 'Dr. Heinrich von Trott (VV00001), Top-Mandant 12,5M AuM' },
      { label: 'Kontext', value: 'Unternehmer-Netzwerk Rhein-Main, gemeinsam im IHK-Präsidium' },
      { label: 'Geschätztes Vermögen', value: 'ca. 3.000.000 € (Unternehmensverkauf geplant)' },
      { label: 'Aktueller Berater', value: 'Commerzbank Wealth Management' },
      { label: 'Nächster Schritt', value: 'WpHG-Fragebogen am 12.03., dann Mandatsvorschlag' },
    ],
  },

  // 2. NextGen – Kinder von Mandanten
  {
    id: 'NM003',
    name: 'Charlotte von Trott',
    kategorie: 'neumandat',
    quelle: 'nextgen',
    quelleLabel: 'NextGen (Kind v. Mandant)',
    stadium: 'kennenlernen',
    geschaetztesVolumen: '800.000 €',
    potentialAuM: 800000,
    wahrscheinlichkeit: 60,
    naechsterSchritt: 'Erstgespräch vereinbaren — SmartValue Mandat vorstellen',
    datum: '2026-02-15',
    referenzMandant: 'VV00001',
    beruf: 'Anwältin, Partnerin Wirtschaftskanzlei',
    herkunft: 'Tochter von Dr. von Trott (VV00001) — Anwältin, 32 J., geschätztes Eigenvermögen 800k',
    kiDescription: 'KI-Analyse: Charlotte von Trott (32) ist Tochter des Top-Mandanten Dr. Heinrich von Trott (VV00001) und Partnerin in einer Wirtschaftskanzlei in Frankfurt. Ihr geschätztes Eigenvermögen von ca. 800k € stammt aus Ersparnissen und Bonuszahlungen — typisches Profil einer jungen High Earner ohne strukturierte Vermögensverwaltung. Der Vater hat die Empfehlung aktiv ausgesprochen, was die Abschlusswahrscheinlichkeit auf 60% hebt. NextGen-Strategie: SmartValue Mandat als Einstieg mit Perspektive auf FairValue bei wachsendem Vermögen. Langfristwert: Bindung der 3. Generation an HRK LUNIS, potenzieller Erbschaftsfluss aus dem 12,5M-Mandat des Vaters.',
    herleitung: [
      { label: 'Verwandtschaft', value: 'Tochter von Dr. Heinrich von Trott (VV00001)' },
      { label: 'Alter / Beruf', value: '32 Jahre, Anwältin / Partnerin bei Wirtschaftskanzlei Frankfurt' },
      { label: 'Geschätztes Eigenvermögen', value: 'ca. 800.000 € (Ersparnisse + Bonuszahlungen)' },
      { label: 'Türöffner', value: 'Vater Dr. von Trott hat Empfehlung ausgesprochen' },
      { label: 'Eigenes Mandat?', value: 'Nein — kein eigenes VV-Mandat vorhanden' },
      { label: 'Empfohlenes Produkt', value: 'SmartValue Mandat (ab 250k)' },
    ],
  },
  {
    id: 'NM004',
    name: 'Friedrich von Trott',
    kategorie: 'neumandat',
    quelle: 'nextgen',
    quelleLabel: 'NextGen (Kind v. Mandant)',
    stadium: 'lead',
    geschaetztesVolumen: '250.000 €',
    potentialAuM: 250000,
    wahrscheinlichkeit: 35,
    naechsterSchritt: 'Über Vater ansprechen bei nächstem Quartalstermin',
    datum: '2026-01-20',
    referenzMandant: 'VV00001',
    beruf: 'Ingenieur im Familienunternehmen',
    herkunft: 'Sohn von Dr. von Trott (VV00001) — Ingenieur, 28 J., potenzielle Firmennachfolge',
    kiDescription: 'KI-Analyse: Friedrich von Trott (28) ist der Sohn von Dr. Heinrich von Trott und arbeitet als Ingenieur im Familienunternehmen (Maschinenbau). Sein aktuelles Eigenvermögen ist mit ca. 250k € noch überschaubar, aber der strategische Wert ist enorm: Er ist der wahrscheinliche Nachfolger der Von Trott Maschinenbau GmbH (Firmenwert geschätzt 4,5M €). Bei einer Übernahme in 3–5 Jahren fließen erhebliche Vermögenswerte. Empfehlung: Jetzt mit SmartValue Mandat binden, perspektivisch FairValue nach Unternehmensübernahme. Ansprache indirekt über den Vater beim nächsten Quartalstermin — niedrige Hürde durch familiäre Vertrauensbasis.',
    herleitung: [
      { label: 'Verwandtschaft', value: 'Sohn von Dr. Heinrich von Trott (VV00001)' },
      { label: 'Alter / Beruf', value: '28 Jahre, Ingenieur im Familienunternehmen Maschinenbau' },
      { label: 'Geschätztes Eigenvermögen', value: 'ca. 250.000 € (Ersparnisse + Firmenanteile unklar)' },
      { label: 'Nachfolge-Kontext', value: 'Potenzielle Übernahme des Familienunternehmens in 3-5 Jahren' },
      { label: 'Nächster Schritt', value: 'Über Vater bei Quartalstermin ansprechen' },
    ],
  },
  {
    id: 'NM005',
    name: 'Jan Hartmann',
    kategorie: 'neumandat',
    quelle: 'nextgen',
    quelleLabel: 'NextGen (Kind v. Mandant)',
    stadium: 'lead',
    geschaetztesVolumen: '50.000 €',
    potentialAuM: 50000,
    wahrscheinlichkeit: 40,
    naechsterSchritt: 'Prof. Hartmann bei nächstem Termin auf Jan ansprechen',
    datum: '2026-02-25',
    referenzMandant: 'VV00004',
    beruf: 'Assistenzarzt Kardiologie',
    herkunft: 'Sohn von Prof. Hartmann (VV00004) — Assistenzarzt, 26 J., hohes Einkommenspotenzial',
    kiDescription: 'KI-Analyse: Jan Hartmann (26) ist Sohn von Prof. Dr. Hartmann (VV00004) und Assistenzarzt in der Kardiologie. Aktuell erst 50k € Vermögen, aber das Einkommenspotenzial ist außergewöhnlich hoch: Facharzttitel in 2–3 Jahren (dann 150k+ p.a.), danach absehbare Praxisgründung mit perspektivisch 1M+ AuM. Klassisches „Seed-Investment" in die NextGen-Strategie — frühzeitige Bindung eines zukünftigen UHNW-Mandanten. Empfehlung: SmartValue Junior als Einstieg, Ansparplan mit monatlicher Zuzahlung. Ansprache über den Vater bei dessen nächstem regulären Termin.',
    herleitung: [
      { label: 'Verwandtschaft', value: 'Sohn von Prof. Dr. Hartmann (VV00004)' },
      { label: 'Alter / Beruf', value: '26 Jahre, Assistenzarzt Kardiologie' },
      { label: 'Einkommenspotenzial', value: 'Hoch — Facharzttitel in 2-3 Jahren, dann 150k+ p.a.' },
      { label: 'Langfristwert', value: 'Praxisgründung absehbar → perspektivisch 1M+ AuM' },
      { label: 'Nächster Schritt', value: 'Über Vater bei nächstem Termin ansprechen' },
    ],
  },
  {
    id: 'NM006',
    name: 'Noah Lindenberg',
    kategorie: 'neumandat',
    quelle: 'nextgen',
    quelleLabel: 'NextGen (Kind v. Mandant)',
    stadium: 'identifiziert',
    geschaetztesVolumen: '100.000 €',
    potentialAuM: 100000,
    wahrscheinlichkeit: 55,
    naechsterSchritt: 'Bei Cash-Konsolidierungstermin Lindenberg Studiendepot ansprechen',
    datum: '2026-03-05',
    referenzMandant: 'VV00002',
    beruf: 'Studienanfänger (18 J.)',
    herkunft: 'Sohn von Fam. Lindenberg (VV00002) — Studienbeginn 2026, Eltern planen 100k Startkapital',
    kiDescription: 'KI-Analyse: Noah Lindenberg (18) beginnt 2026 sein Studium. Die Eltern (Fam. Lindenberg, VV00002) planen 100k € Startkapital aus ihren SaaS-Exit-Erlösen für ihn bereitzustellen. Strategischer Wert: Frühzeitige Bindung der NextGen an HRK LUNIS noch vor dem ersten eigenen Vermögensaufbau. Bei der Cash-Konsolidierung der Eltern (5,5M €) kann das Studiendepot als natürlicher Gesprächsanlass dienen. Empfehlung: SmartValue Junior Mandat mit langfristigem Anlagehorizont (10+ Jahre). Das Depot wächst mit dem Mandanten — aus dem Studenten von heute wird der potenzielle UHNW-Mandant von morgen.',
    herleitung: [
      { label: 'Verwandtschaft', value: 'Sohn von Familie Lindenberg (VV00002)' },
      { label: 'Alter', value: '18 Jahre — Studienbeginn 2026' },
      { label: 'Elterliche Ausstattung', value: 'Geplant: 100.000 € Startkapital aus Exit-Erlösen' },
      { label: 'Empfohlenes Produkt', value: 'SmartValue Junior Mandat — frühzeitige Kundenbindung NextGen' },
    ],
  },

  // 3. Presse / Marktbeobachtung – Liquidity Events
  {
    id: 'NM007',
    name: 'Dipl.-Ing. Stefan Müller',
    kategorie: 'neumandat',
    quelle: 'presse',
    quelleLabel: 'Presse / Liquidity Event',
    stadium: 'kennenlernen',
    geschaetztesVolumen: '6.000.000 €',
    potentialAuM: 6000000,
    wahrscheinlichkeit: 25,
    naechsterSchritt: 'Folgetermin nach Erst-Telefonat vereinbaren',
    datum: '2026-02-10',
    beruf: 'Ehem. GF Ingenieurbüro (verkauft)',
    herkunft: 'Handelsblatt: Verkauf Ingenieurbüro an schwedischen Konzern. Geschätzter Erlös 6M € netto.',
    kiDescription: 'KI-Analyse: Das Handelsblatt berichtete am 05.02.2026 über den Verkauf von Müller Engineering an den schwedischen Sandvik-Konzern. Der geschätzte Nettoerlös nach Steuern beträgt ca. 6M €. Dipl.-Ing. Müller sitzt im Einzugsgebiet Rhein-Main (Darmstadt). Ein Erst-Telefonat am 10.02. zeigte grundsätzliches Interesse am FairValue-Mandat. Risiko: Post-Exit-Mandate sind stark umkämpft — alle großen VV-Häuser werden parallel Kontakt aufnehmen. Zeitvorteil nutzen: Schnelles persönliches Erstgespräch in Frankfurt vereinbaren. Differenzierung über inhabergeführte Struktur und persönliche Betreuung.',
    herleitung: [
      { label: 'Quelle', value: 'Handelsblatt, 05.02.2026 — "Müller Engineering an Sandvik verkauft"' },
      { label: 'Geschätzter Erlös', value: '6.000.000 € netto nach Steuern' },
      { label: 'Region', value: 'Rhein-Main (Darmstadt) — im Einzugsgebiet' },
      { label: 'Erstkontakt', value: 'Telefonat am 10.02. — grundsätzliches Interesse an FairValue' },
      { label: 'Wettbewerb', value: 'Hoch — nach Exit suchen alle VV-Häuser gleichzeitig Kontakt' },
      { label: 'Nächster Schritt', value: 'Persönliches Erstgespräch in Frankfurt vereinbaren' },
    ],
  },
  {
    id: 'NM008',
    name: 'Dr. Martin Fuchs',
    kategorie: 'neumandat',
    quelle: 'presse',
    quelleLabel: 'Presse / Liquidity Event',
    stadium: 'lead',
    geschaetztesVolumen: '4.000.000–6.000.000 €',
    potentialAuM: 5000000,
    wahrscheinlichkeit: 15,
    naechsterSchritt: 'Recherche vertiefen, dann persönliche Kontaktaufnahme über IHK-Netzwerk',
    datum: '2026-03-08',
    beruf: 'Ehem. GF Fuchs Präzisionstechnik',
    herkunft: 'Handelsblatt: Dr. Martin Fuchs verkauft Fuchs Präzisionstechnik an schwedischen Konzern. Geschätzter Erlös 4–6M €.',
    kiDescription: 'KI-Analyse: Frischer Presse-Lead aus dem Handelsblatt (06.03.2026): Dr. Martin Fuchs hat Fuchs Präzisionstechnik an einen schwedischen Konzern verkauft. Der geschätzte Erlös liegt bei 4–6M € basierend auf EBITDA-Multiples der Branche. Die Firma sitzt in Frankfurt-Süd — direkt im Einzugsgebiet. Noch besteht kein Kontakt, aber über das IHK-Netzwerk Frankfurt könnte Dr. von Trott (VV00001) als Türöffner fungieren. Lead-Qualität: mittel — ohne persönlichen Bezug ist die Wahrscheinlichkeit bei 15%. Empfehlung: Recherche vertiefen, dann warme Kontaktaufnahme über IHK-Netzwerk statt Kaltakquise.',
    herleitung: [
      { label: 'Quelle', value: 'Handelsblatt, 06.03.2026 — "Fuchs Präzisionstechnik geht an Sandvik"' },
      { label: 'Geschätzter Erlös', value: '4.000.000–6.000.000 € (EBITDA-Multiple geschätzt)' },
      { label: 'Region', value: 'Frankfurt-Süd — im Einzugsgebiet' },
      { label: 'Netzwerk', value: 'IHK Frankfurt — ggf. über Dr. von Trott ansprechbar' },
      { label: 'Status', value: 'Noch kein Kontakt — Ansprache über Netzwerk geplant' },
    ],
  },

  // 4. Netzwerk-Events
  {
    id: 'NM009',
    name: 'Stiftung Merian',
    kategorie: 'neumandat',
    quelle: 'event',
    quelleLabel: 'Netzwerk-Event',
    stadium: 'kennenlernen',
    geschaetztesVolumen: '4.200.000 €',
    potentialAuM: 4200000,
    wahrscheinlichkeit: 35,
    naechsterSchritt: 'Informationspaket Stiftungsmandat zusenden',
    datum: '2025-11-15',
    beruf: 'Kulturstiftung',
    herkunft: 'Kontakt beim Stiftungstag 2025 — Kulturstiftung, aktuell bei DWS, Interesse an ESG-Stiftungsmandat',
    kiDescription: 'KI-Analyse: Die Stiftung Merian ist eine Kulturstiftung mit ca. 4,2M € AuM, aktuell bei DWS verwaltet. Kontakt entstand beim Stiftungstag 2025, wo HRK LUNIS als Sponsor auftrat. Die Stiftungsvorständin Dr. Elisabeth Merian äußerte Unzufriedenheit mit dem DWS-Reporting und Interesse an einem ESG-konformen Stiftungsmandat. Stiftungsmandate sind besonders wertvoll: lange Laufzeiten, regelmäßige Zuflüsse, und Multiplikatoreffekt im Stiftungsnetzwerk. Empfehlung: Spezialmandat Stiftung mit maßgeschneidertem ESG-Reporting und quartalsweiser Stiftungsrat-Präsentation. Differenzierung über persönliche Betreuung vs. DWS-Standardreporting.',
    herleitung: [
      { label: 'Event', value: 'Stiftungstag 2025, Frankfurt — HRK LUNIS als Sponsor' },
      { label: 'Kontaktperson', value: 'Dr. Elisabeth Merian, Stiftungsvorstand' },
      { label: 'AuM bei DWS', value: 'ca. 4.200.000 € (Angabe im Gespräch)' },
      { label: 'Interesse', value: 'ESG-konformes Stiftungsmandat, unzufrieden mit DWS-Reporting' },
      { label: 'Nächster Schritt', value: 'Informationspaket Spezialmandat Stiftung zusenden' },
    ],
  },
  {
    id: 'NM010',
    name: 'Prof. König',
    kategorie: 'neumandat',
    quelle: 'event',
    quelleLabel: 'Netzwerk-Event',
    stadium: 'termin',
    geschaetztesVolumen: '8.000.000 €',
    potentialAuM: 8000000,
    wahrscheinlichkeit: 45,
    naechsterSchritt: 'Erstgespräch am 18.03.2026 — FairValue Mandat vorstellen',
    datum: '2026-03-02',
    beruf: 'Kardiologe, Praxiskette',
    herkunft: 'Unternehmer-Dinner 02.03. — Kardiologe mit Praxiskette, geschätzt 8M €, Termin 18.03.',
    kiDescription: 'KI-Analyse: Prof. König ist Kardiologe und Betreiber einer Praxiskette mit geschätztem Gesamtvermögen von ca. 8M € (Praxis + Immobilien). Der Kontakt wurde beim HRK LUNIS Unternehmer-Dinner am 02.03.2026 über Prof. Hartmann (VV00004) hergestellt — starker persönlicher Bezug. Das Vermögen ist derzeit bei mehreren Banken verteilt ohne VV-Mandat — ein typisches Fragmentierungsmuster bei erfolgreichen Ärzten. Der Erstgesprächstermin am 18.03.2026 steht bereits. Hoher Lead-Wert: 8M € Potenzial bei 45% Wahrscheinlichkeit. Empfehlung: FairValue Mandat mit Konsolidierung aller Depots, ergänzt um PE Healthcare als fachspezifisches Investmentthema.',
    herleitung: [
      { label: 'Event', value: 'HRK LUNIS Unternehmer-Dinner, 02.03.2026' },
      { label: 'Kontakt', value: 'Über Prof. Hartmann (VV00004) vorgestellt' },
      { label: 'Geschätztes Vermögen', value: 'ca. 8.000.000 € (Praxiskette + Immobilien)' },
      { label: 'Aktuelle Situation', value: 'Vermögen bei mehreren Banken verteilt, kein VV-Mandat' },
      { label: 'Termin', value: '18.03.2026, 10:00 Uhr — Erstgespräch in Frankfurt' },
    ],
  },

  // 5. Professionelle Netzwerke / Multiplikatoren
  {
    id: 'NM011',
    name: 'Dr. Klaus Berger',
    kategorie: 'neumandat',
    quelle: 'multiplikator',
    quelleLabel: 'Multiplikator (Steuerberater)',
    stadium: 'lead',
    geschaetztesVolumen: '5.500.000 €',
    potentialAuM: 5500000,
    wahrscheinlichkeit: 30,
    naechsterSchritt: 'Kontaktaufnahme über StB Dr. Krause vorbereiten',
    datum: '2026-03-01',
    beruf: 'Unternehmer (Medizintechnik)',
    herkunft: 'Steuerberater Dr. Krause empfiehlt Mandant nach geplantem Firmenverkauf — geschätzt 5,5M €',
    kiDescription: 'KI-Analyse: Steuerberater Dr. Krause (Netzwerkpartner seit 2020) hat diesen Lead proaktiv gemeldet: Dr. Klaus Berger bereitet den Verkauf seiner Medizintechnik GmbH vor. M&A-Berater schätzen den Erlös auf 5,5M €, Closing voraussichtlich Q3/2026. Multiplikator-Leads über Steuerberater haben eine überdurchschnittliche Conversion-Rate, da der Mandant bereits Vertrauen in die Empfehlung seines Steuerberaters hat. Empfehlung: Dreier-Gespräch (Berater + StB + Mandant) als vertrauensbildende Maßnahme. Timing beachten: Erst nach Closing operativ werden, aber Beziehungsaufbau jetzt starten.',
    herleitung: [
      { label: 'Multiplikator', value: 'Steuerberater Dr. Krause (Netzwerkpartner seit 2020)' },
      { label: 'Kontext', value: 'Firmenverkauf Medizintechnik GmbH in Vorbereitung' },
      { label: 'Geschätzter Erlös', value: '5.500.000 € (Bewertung durch M&A-Berater)' },
      { label: 'Zeitrahmen', value: 'Closing voraussichtlich Q3/2026' },
      { label: 'Nächster Schritt', value: 'Kontaktaufnahme über Dr. Krause — Dreier-Gespräch' },
    ],
  },

  // 6. Digitale Signale
  {
    id: 'NM012',
    name: 'Dr. Schulte',
    kategorie: 'neumandat',
    quelle: 'digital',
    quelleLabel: 'Digitales Signal',
    stadium: 'lead',
    geschaetztesVolumen: 'unbekannt',
    potentialAuM: 0,
    wahrscheinlichkeit: 15,
    naechsterSchritt: 'Nach Event-Anmeldung persönlich kontaktieren',
    datum: '2026-03-10',
    beruf: 'unbekannt',
    herkunft: 'Website: 3× /dienstleistungen/stiftungsmanagement besucht + Anmeldung Stiftungsforum — Name: Dr. Schulte',
    kiDescription: 'KI-Analyse: Digitaler Lead mit schwachem Signal-Profil. Dr. Schulte hat die Stiftungsmanagement-Seite 3× besucht (Feb/März 2026), den Stiftungs-Newsletter mit überdurchschnittlicher Klickrate geöffnet und sich für das Stiftungsforum am 25.04. angemeldet. Das digitale Verhaltensmuster deutet auf aktive Informationssuche zum Thema Stiftungsverwaltung hin. Einschränkung: UHNW-Mandanten akquiriert man in der Regel nicht über die Website — die Wahrscheinlichkeit liegt bei nur 15%. Empfehlung: Beim Stiftungsforum persönlich ansprechen, Volumen und Hintergrund eruieren. Kein aktives Outbound vor dem Event.',
    herleitung: [
      { label: 'Digitale Signale', value: '3× Seitenbesuche /dienstleistungen/stiftungsmanagement (Feb/Mär 2026)' },
      { label: 'Newsletter', value: 'Geöffnet: Stiftungs-Spezial (Klickrate überdurchschnittlich)' },
      { label: 'Event-Anmeldung', value: 'Stiftungsforum 25.04.2026 — Name nach Anmeldung: Dr. Schulte' },
      { label: 'Einschätzung', value: 'Schwacher Lead — UHNW-Kunden kommen selten über Website' },
      { label: 'Nächster Schritt', value: 'Nach Event-Anmeldung persönlich kontaktieren' },
    ],
  },

  // 7. Gewonnene Mandate (Neukundengewinnung abgeschlossen)
  {
    id: 'NM013',
    name: 'Dr. Lisa Schreiber',
    kategorie: 'neumandat',
    quelle: 'event',
    quelleLabel: 'Netzwerk-Event',
    stadium: 'gewonnen',
    geschaetztesVolumen: '1.800.000 €',
    potentialAuM: 1800000,
    wahrscheinlichkeit: 100,
    naechsterSchritt: 'Onboarding abschließen — Mandat startet 01.04.2026',
    datum: '2026-03-10',
    beruf: 'Zahnärztin (Praxisverkauf)',
    herkunft: 'Jahresempfang 2025 — Zahnärztin mit Praxisverkauf. SmartValue Mandat (1,8M) unterschrieben.',
    kiDescription: 'KI-Analyse: Erfolgreich gewonnenes Mandat! Dr. Lisa Schreiber (Zahnärztin) hat nach ihrem Praxisverkauf 2025 (Nettoerlös 1,8M €) das SmartValue Mandat am 10.03.2026 unterschrieben. Der Kontakt entstand beim Jahresempfang 2025. Onboarding läuft, Mandatsstart am 01.04.2026. Dieser abgeschlossene Lead zeigt: Event-basierte Akquise bei Ärzten nach Praxisverkauf funktioniert hervorragend. Nächste Schritte: Onboarding finalisieren, Erstinvestition strukturieren. Mittelfristig: Cross-Selling (Altersvorsorge, Immobilien). Langfristig: Multiplikator-Potenzial im Ärzte-Netzwerk Frankfurt.',
    herleitung: [
      { label: 'Event', value: 'Jahresempfang HRK LUNIS, Dezember 2025' },
      { label: 'Hintergrund', value: 'Praxisverkauf 2025, Nettoerlös 1.800.000 €' },
      { label: 'Mandat', value: 'SmartValue Mandat — unterschrieben am 10.03.2026' },
      { label: 'Nächster Schritt', value: 'Onboarding abschließen, Start 01.04.2026' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // BESTANDSMANDATE (Wallet-Vertiefung / Bestandsimpulse)
  // ═══════════════════════════════════════════════════════════════════

  // 1. Vermutete erhöhte Liquidität
  {
    id: 'BM001',
    name: 'Lindenberg Cash-Konsolidierung 5,5M',
    kategorie: 'bestandsmandat',
    quelle: 'liquiditaet',
    quelleLabel: 'Erhöhte Liquidität',
    stadium: 'angebot',
    geschaetztesVolumen: '5.500.000 €',
    potentialAuM: 5500000,
    wahrscheinlichkeit: 80,
    naechsterSchritt: '3-Phasen-Investitionsplan finalisieren und unterschreiben',
    datum: '2026-03-05',
    referenzMandant: 'VV00002',
    beruf: 'Bestandsmandant',
    herkunft: 'Fam. Lindenberg: 5,5M € Cash seit 14 Monaten bei Commerzbank. Opportunitätskosten ca. 275k €/Jahr.',
    kiDescription: 'KI-Analyse: Dringender Handlungsbedarf! Familie Lindenberg (VV00002) hat seit 14 Monaten 5,5M € Cash auf einem Commerzbank-Girokonto liegen — Exit-Erlöse aus dem SaaS-Verkauf 2024. Die Opportunitätskosten sind erheblich: ca. 275k €/Jahr entgangene Rendite bei 5% Zielrendite plus ca. 137k €/Jahr realer Kaufkraftverlust durch Inflation. Der Mandant ist grundsätzlich einverstanden, die Unterschrift steht noch aus. Empfohlene Strategie: 3-Phasen-Investition (2M sofort, 2M Q3, 1,5M Q4) zur Risikominimierung durch zeitliche Diversifikation. Lead-Qualität: Sehr hoch (80%) — der Mandant ist überzeugt, es fehlt nur noch der formale Abschluss.',
    herleitung: [
      { label: 'Datenquelle', value: 'Consent-Abfrage Commerzbank' },
      { label: 'Cash-Bestand', value: '5.500.000 € auf Girokonto (Exit-Erlöse 2024)' },
      { label: 'Opportunitätskosten', value: 'ca. 275.000 €/Jahr bei 5% Zielrendite entgangen' },
      { label: 'Inflationsverlust', value: 'ca. 137.500 €/Jahr bei 2,5% Inflation' },
      { label: 'Empfohlene Strategie', value: '3-Phasen-Investition: 2M sofort, 2M Q3, 1,5M Q4' },
      { label: 'Status', value: 'Mandant grundsätzlich einverstanden, Unterschrift ausstehend' },
    ],
  },
  {
    id: 'BM002',
    name: 'Dr. von Trott LV-Ablauf 320k',
    kategorie: 'bestandsmandat',
    quelle: 'liquiditaet',
    quelleLabel: 'Erhöhte Liquidität',
    stadium: 'termin',
    geschaetztesVolumen: '320.000 €',
    potentialAuM: 320000,
    wahrscheinlichkeit: 85,
    naechsterSchritt: 'LV-Ablauf Q3/2026 vorbereiten — Wiederanlage ins FairValue Mandat',
    datum: '2026-02-15',
    referenzMandant: 'VV00001',
    beruf: 'Bestandsmandant',
    herkunft: 'Dr. von Trott: Alte Leipziger LV, Rückkaufswert 320k €, Ablauf Q3/2026. Wiederanlage ins Mandat.',
    kiDescription: 'KI-Analyse: Proaktiver Lead aus der Consent-Datenabfrage bei der Alten Leipziger. Dr. von Trotts Lebensversicherung (Vertrag vor 2005) läuft Q3/Q4 2026 ab mit einem Rückkaufswert von 320k €. Steuerlich optimal: Auszahlung nach 12 Jahren steuerfrei. Das Geld würde ohne Beratung unverzinst auf dem Konto landen. Empfehlung: Proaktives Gespräch VOR dem Ablauftermin planen — Wiederanlage direkt ins bestehende FairValue Mandat. Renditeargument: 5–7% Zielrendite vs. 0% auf dem Girokonto. Die Wahrscheinlichkeit liegt bei 85% — der Mandant vertraut HRK LUNIS bereits vollständig.',
    herleitung: [
      { label: 'Datenquelle', value: 'Consent-Abfrage Alte Leipziger' },
      { label: 'Versicherer', value: 'Alte Leipziger Lebensversicherung' },
      { label: 'Rückkaufswert', value: '320.000 € (Ablauf Q3/Q4 2026)' },
      { label: 'Steuerliche Behandlung', value: 'Vertrag vor 2005: steuerfrei bei Auszahlung nach 12 Jahren' },
      { label: 'Wiederanlage-Rendite', value: 'Zielrendite 5–7% p.a. vs. 0% bei Kontoguthaben' },
      { label: 'Nächster Schritt', value: 'Ablauftermin im Kalender, proaktives Gespräch planen' },
    ],
  },

  // 2. Fremdbank-Konsolidierung
  {
    id: 'BM003',
    name: 'Dr. von Trott UBS-Konsolidierung 3,2M',
    kategorie: 'bestandsmandat',
    quelle: 'fremdbank',
    quelleLabel: 'Fremdbank-Konsolidierung',
    stadium: 'kennenlernen',
    geschaetztesVolumen: '3.200.000 €',
    potentialAuM: 3200000,
    wahrscheinlichkeit: 65,
    naechsterSchritt: 'Vergleichsangebot UBS vs. FairValue erstellen',
    datum: '2026-03-01',
    referenzMandant: 'VV00001',
    beruf: 'Bestandsmandant',
    herkunft: 'Dr. von Trott: 2,8M UBS Depot + 400k DB Cash. Konsolidierung spart ca. 16.000 €/Jahr Kosten.',
    kiDescription: 'KI-Analyse: Konsolidierungspotenzial bei Dr. von Trott! Die Consent-Abfragen bei UBS und Deutsche Bank zeigen: 2,8M € im UBS-Depot (Gemischtes Mandat, Kostenquote 1,35%) plus 400k € Cash bei der Deutschen Bank. Durch Konsolidierung ins FairValue Mandat (All-in-Fee 0,85%) spart der Mandant ca. 16.000 €/Jahr bei 3,2M Volumen. Zusätzlich profitiert er von einheitlichem Reporting und ganzheitlicher Betreuung statt fragmentierter Vermögensübersicht. Das Gesamtmandat würde auf ca. 15,7M € steigen — ein signifikanter Revenuegewinn für HRK LUNIS. Empfehlung: Konkretes Vergleichsangebot UBS vs. FairValue erstellen.',
    herleitung: [
      { label: 'Datenquelle', value: 'Consent-Abfrage UBS + Deutsche Bank' },
      { label: 'UBS Depotvolumen', value: '2.800.000 € (Gemischtes Mandat)' },
      { label: 'DB Cash-Bestand', value: '400.000 € (Festgeld/Tagesgeld)' },
      { label: 'UBS Kostenquote', value: '1,35% p.a. (inkl. Transaktionskosten)' },
      { label: 'HRK LUNIS FairValue', value: '0,85% p.a. (All-in-Fee)' },
      { label: 'Jährliche Ersparnis', value: 'ca. 16.000 € bei 3,2M Volumen' },
    ],
  },
  {
    id: 'BM004',
    name: 'Stiftung Weber Sparkasse 500k',
    kategorie: 'bestandsmandat',
    quelle: 'fremdbank',
    quelleLabel: 'Fremdbank-Konsolidierung',
    stadium: 'identifiziert',
    geschaetztesVolumen: '500.000 €',
    potentialAuM: 500000,
    wahrscheinlichkeit: 65,
    naechsterSchritt: 'Fälligkeit 2027 vormerken, Konsolidierungsgespräch Q4/2026',
    datum: '2026-02-28',
    referenzMandant: 'VV00003',
    beruf: 'Bestandsmandant',
    herkunft: 'Stiftung Weber: 500k Festgeld bei Sparkasse (2% bis 2027). Bei Fälligkeit ins Spezialmandat überführen.',
    kiDescription: 'KI-Analyse: Die Stiftung Weber (VV00003) hat 500k € Festgeld bei der Sparkasse (2,0% bis 2027). Bei Fälligkeit besteht eine Konsolidierungschance ins Spezialmandat: Rendite 4–5% statt 2,0% = Mehrertrag von 10.000–15.000 €/Jahr. Für eine Bildungsstiftung sind diese zusätzlichen Erträge direkt förderungswirksam — ein starkes Argument. Der Zeitpunkt ist noch nicht akut (Fälligkeit 2027), aber die Vorbereitung sollte jetzt beginnen. Empfehlung: Fälligkeitstermin im Kalender markieren, ab Q4/2026 Konsolidierungsgespräch mit dem Stiftungsrat führen. Sicherheitsorientierung der Stiftung dabei berücksichtigen.',
    herleitung: [
      { label: 'Datenquelle', value: 'Consent-Abfrage Sparkasse' },
      { label: 'Festgeld-Volumen', value: '500.000 € (2,0% bis 2027)' },
      { label: 'Rendite Festgeld', value: '2,0% p.a. = 10.000 €/Jahr' },
      { label: 'Rendite im Spezialmandat', value: '4–5% p.a. = 20.000–25.000 €/Jahr' },
      { label: 'Mehrertrag p.a.', value: 'ca. 10.000–15.000 € bei gleicher Sicherheitsorientierung' },
      { label: 'Nächster Schritt', value: 'Fälligkeit 2027 vormerken — dann Konsolidierungsgespräch' },
    ],
  },
  {
    id: 'BM005',
    name: 'Prof. Hartmann ING Tagesgeld 250k',
    kategorie: 'bestandsmandat',
    quelle: 'fremdbank',
    quelleLabel: 'Fremdbank-Konsolidierung',
    stadium: 'identifiziert',
    geschaetztesVolumen: '250.000 €',
    potentialAuM: 250000,
    wahrscheinlichkeit: 70,
    naechsterSchritt: 'Bei nächstem PE-Termin Konsolidierung ansprechen',
    datum: '2026-02-25',
    referenzMandant: 'VV00004',
    beruf: 'Bestandsmandant',
    herkunft: 'Prof. Hartmann: 250k bei ING (2,0% Tagesgeld). Im FairValue Mandat deutlich höherer Ertrag möglich.',
    kiDescription: 'KI-Analyse: Prof. Hartmann (VV00004) hat 250k € bei ING auf Tagesgeld (2,0% variabel, tendenziell sinkend). Im FairValue Mandat wären 5–7% Zielrendite realistisch — ein Mehrertrag von 7.500–12.500 €/Jahr. Die ING-Zinsen werden bei den nächsten EZB-Senkungen weiter fallen, was das Umschichtungsargument verstärkt. Empfehlung: Beim nächsten regulären PE-Termin die Konsolidierung ansprechen — niedriger Aufwand, da Prof. Hartmann bereits Bestandsmandant ist. Kein separater Termin nötig, das Thema kann als Zusatzpunkt auf die Agenda.',
    herleitung: [
      { label: 'Datenquelle', value: 'Consent-Abfrage ING' },
      { label: 'Tagesgeld-Volumen', value: '250.000 € bei ING (2,0% p.a., variabel, sinkend)' },
      { label: 'Rendite Tagesgeld', value: '5.000 €/Jahr' },
      { label: 'Rendite im FairValue Mandat', value: '12.500–17.500 €/Jahr (5–7% Zielrendite)' },
      { label: 'Mehrertrag p.a.', value: 'ca. 7.500–12.500 € bei moderatem Risiko' },
    ],
  },

  // 3. Mandats-Upgrade
  {
    id: 'BM006',
    name: 'Lindenberg Upgrade SmartValue → FairValue',
    kategorie: 'bestandsmandat',
    quelle: 'upgrade',
    quelleLabel: 'Mandats-Upgrade',
    stadium: 'identifiziert',
    geschaetztesVolumen: '7.600.000 € (nach Kons.)',
    potentialAuM: 7600000,
    wahrscheinlichkeit: 75,
    naechsterSchritt: 'Bei Cash-Konsolidierung gleichzeitig Upgrade auf FairValue vorschlagen',
    datum: '2026-03-05',
    referenzMandant: 'VV00002',
    beruf: 'Bestandsmandant',
    herkunft: 'Fam. Lindenberg: Aktuell 2,1M SmartValue. Mit Cash (5,5M) wäre AuM 7,6M → FairValue-berechtigt. Kostenvorteil: 15.200 €/J.',
    kiDescription: 'KI-Analyse: Doppelte Chance bei Familie Lindenberg! Aktuell im SmartValue Mandat (2,1M AuM). Wenn die 5,5M Cash-Konsolidierung (BM001) durchgeführt wird, steigt das AuM auf 7,6M € — weit über der FairValue-Schwelle von 3M €. Ein Mandats-Upgrade spart dem Kunden 15.200 €/Jahr (1,05% SmartValue → 0,85% FairValue). Win-Win: Der Mandant profitiert von niedrigeren Kosten und individuellerem Service, HRK LUNIS erhöht das verwaltete Volumen erheblich. Empfehlung: Cash-Konsolidierung und Mandats-Upgrade gleichzeitig vorschlagen — als Gesamtpaket wirkt das Angebot überzeugender.',
    herleitung: [
      { label: 'Aktuelles Mandat', value: 'SmartValue (AuM 2,1M, seit 06/2024)' },
      { label: 'Ziel-AuM nach Konsolidierung', value: '7.600.000 € (2,1M + 5,5M Cash)' },
      { label: 'FairValue Schwelle', value: '3.000.000 € — nach Konsolidierung überqualifiziert' },
      { label: 'SmartValue Kosten', value: '1,05% p.a.' },
      { label: 'FairValue Kosten', value: '0,85% p.a. → Ersparnis 15.200 €/Jahr' },
      { label: 'Nächster Schritt', value: 'Upgrade zusammen mit Cash-Konsolidierung vorschlagen' },
    ],
  },
  {
    id: 'BM007',
    name: 'Tim Keller Upgrade bei nächstem Exit',
    kategorie: 'bestandsmandat',
    quelle: 'upgrade',
    quelleLabel: 'Mandats-Upgrade',
    stadium: 'identifiziert',
    geschaetztesVolumen: '500.000–1.500.000 €',
    potentialAuM: 1000000,
    wahrscheinlichkeit: 40,
    naechsterSchritt: 'Erwarteten Exit-Zeitrahmen im Gespräch klären',
    datum: '2026-03-02',
    referenzMandant: 'VV00005',
    beruf: 'Bestandsmandant',
    herkunft: 'Tim Keller: 450k SmartValue. Series A Startup — bei Exit FairValue Upgrade möglich (ab 3M).',
    kiDescription: 'KI-Analyse: Tim Keller (VV00005) ist aktuell im SmartValue Mandat mit 450k € AuM. Er hält ein Series-A-Startup-Investment mit erwartetem Exit in 2–3 Jahren. Bei erfolgreichem Exit könnten 500k–1,5M € hinzukommen — was das AuM potenziell über die 3M-FairValue-Schwelle hebt. Die Wahrscheinlichkeit ist moderat (40%), da Startup-Exits unsicher sind. Empfehlung: Kein aktives Drängen, aber im nächsten Gespräch den erwarteten Exit-Zeitrahmen klären. Bei positivem Verlauf kann das FairValue-Upgrade vorbereitet werden. Langfristig: Tim Keller ist 35 und hat ein wachsendes Techunternehmer-Profil — potenzieller UHNW-Mandant der Zukunft.',
    herleitung: [
      { label: 'Aktuelles Mandat', value: 'SmartValue (AuM 450.000 €, seit 01/2025)' },
      { label: 'Laufendes Startup', value: 'Series A Investment — erwarteter Exit in 2–3 Jahren' },
      { label: 'Geschätzter Exit-Erlös', value: '500.000–1.500.000 € (abhängig von Bewertung)' },
      { label: 'FairValue Schwelle', value: 'Ab 3M AuM — bei erfolgreichem Exit erreichbar' },
    ],
  },

  // 4. Life Events / Lebensveränderungen
  {
    id: 'BM008',
    name: 'Dr. von Trott Nachfolgeplanung',
    kategorie: 'bestandsmandat',
    quelle: 'lifeevent',
    quelleLabel: 'Lebensveränderung',
    stadium: 'termin',
    geschaetztesVolumen: '4.500.000 € (Firmenwert)',
    potentialAuM: 4500000,
    wahrscheinlichkeit: 60,
    naechsterSchritt: 'Nachfolgeberatung mit Steuer- und Rechtspartner koordinieren',
    datum: '2026-02-15',
    referenzMandant: 'VV00001',
    beruf: 'Bestandsmandant',
    herkunft: 'Dr. von Trott (62 J.): Nachfolge Maschinenbau GmbH in 3–5 Jahren. Firmenwert geschätzt 4,5M €. Erlös-Anlage planen.',
    kiDescription: 'KI-Analyse: Strategisch hochrelevanter Lead! Dr. von Trott (62 J.) plant die Nachfolge der Von Trott Maschinenbau GmbH & Co. KG (3. Generation) in den nächsten 3–5 Jahren. Der Firmenwert wird auf 4,5M € geschätzt (EBITDA-Multiple). Sohn Friedrich (28) arbeitet bereits im Unternehmen und ist voraussichtlicher Nachfolger. Bei einem Verkauf oder einer Übertragung fließen erhebliche Erlöse ins Privatvermögen. Steuerlich komplex: Betriebsvermögensfreibetrag und Verschonungsabschlag müssen geprüft werden. Empfehlung: Jetzt Nachfolgeberatung mit Steuer- und Rechtspartner koordinieren — HRK LUNIS als ganzheitlicher Berater positionieren. Cross-Selling: Auch Friedrich als eigenständigen Mandanten aufbauen (siehe NM004).',
    herleitung: [
      { label: 'Auslöser', value: 'Alter 62 + Sohn Friedrich (28) im Unternehmen — Nachfolge in 3–5 Jahren' },
      { label: 'Unternehmen', value: 'Von Trott Maschinenbau GmbH & Co. KG, 3. Generation' },
      { label: 'Geschätzte Firmenbewertung', value: '4.500.000 € (EBITDA-Multiple)' },
      { label: 'Steuerliche Aspekte', value: 'Betriebsvermögensfreibetrag, Verschonungsabschlag prüfen' },
      { label: 'Nächster Schritt', value: 'Nachfolgeberatung mit Steuer- und Rechtspartner koordinieren' },
    ],
  },
  {
    id: 'BM009',
    name: 'Prof. Hartmann Praxisnachfolge',
    kategorie: 'bestandsmandat',
    quelle: 'lifeevent',
    quelleLabel: 'Lebensveränderung',
    stadium: 'identifiziert',
    geschaetztesVolumen: '800.000 €',
    potentialAuM: 800000,
    wahrscheinlichkeit: 50,
    naechsterSchritt: 'Praxisbewertung und steueroptimierte Übergabe besprechen',
    datum: '2026-02-25',
    referenzMandant: 'VV00004',
    beruf: 'Bestandsmandant',
    herkunft: 'Prof. Hartmann (56 J.): Praxisverkauf in 5–8 Jahren geplant. Geschätzte Bewertung 800k. Erlös ins FairValue.',
    kiDescription: 'KI-Analyse: Prof. Hartmann (56 J.) plant den Ruhestand in 5–8 Jahren. Seine kardiologische Privatpraxis (etabliert seit 15+ Jahren) hat einen geschätzten Wert von 800k € (Substanz + Goodwill). Möglicher Nachfolger: Sohn Jan (Assistenzarzt, NM005) oder externer Käufer. Der Verkaufserlös würde das bestehende FairValue Mandat erhöhen. Langfristiger Beratungsansatz: Praxisbewertung, steueroptimierte Übergabe und Anlage des Erlöses planen. Verbindung zu NM005 (Jan Hartmann): Bei interner Nachfolge wird der Vermögenstransfer innerhalb der Familie relevant.',
    herleitung: [
      { label: 'Auslöser', value: 'Alter 56, Ruhestand in 5–8 Jahren geplant' },
      { label: 'Praxis', value: 'Kardiologische Privatpraxis, etabliert seit 15+ Jahren' },
      { label: 'Geschätzte Bewertung', value: '800.000 € (Substanzwert + Goodwill)' },
      { label: 'Möglicher Nachfolger', value: 'Sohn Jan (Assistenzarzt) oder externer Käufer' },
    ],
  },

  // 5. Stiftungsgründung
  {
    id: 'BM010',
    name: 'Dr. von Trott Familienstiftung',
    kategorie: 'bestandsmandat',
    quelle: 'stiftung',
    quelleLabel: 'Stiftungsgründung',
    stadium: 'identifiziert',
    geschaetztesVolumen: '2.000.000 €',
    potentialAuM: 2000000,
    wahrscheinlichkeit: 45,
    naechsterSchritt: 'Stiftungskonzept mit Elisabeth von Trott besprechen',
    datum: '2026-01-20',
    referenzMandant: 'VV00001',
    beruf: 'Bestandsmandant',
    herkunft: 'Elisabeth von Trott: Soziales Engagement seit 10+ Jahren. Familienstiftung als Nachfolgeinstrument prüfen, Kapital 2M €.',
    kiDescription: 'KI-Analyse: Elisabeth von Trott (Ehefrau von Dr. Heinrich von Trott) engagiert sich seit über 10 Jahren sozial und plant eine Familienstiftung. Das geplante Stiftungskapital beträgt 2M € aus dem Privatvermögen. Strategischer Wert für HRK LUNIS: Stiftungen binden Mandanten und Vermögen langfristig — ein nahezu unkündbares Mandat. Steuerlicher Vorteil: Sonderausgabenabzug bis 1M € im Gründungsjahr. Die Stiftung dient gleichzeitig als Nachfolgeinstrument für die Familie (Gesamtvermögen >20M). Empfehlung: Stiftungskonzept mit Elisabeth besprechen und als umfassendes Family-Governance-Instrument positionieren.',
    herleitung: [
      { label: 'Auslöser', value: 'Gesamtvermögen >20M, Alter >60 — Stiftung als Nachfolgeinstrument' },
      { label: 'Initiatorin', value: 'Elisabeth von Trott, Stiftungsvorstand (ehrenamtlich)' },
      { label: 'Geplantes Stiftungskapital', value: '2.000.000 € aus Privatvermögen' },
      { label: 'Steuerliche Vorteile', value: 'Sonderausgabenabzug bis 1M im Gründungsjahr' },
      { label: 'Langfristwert', value: 'Stiftung bindet Mandanten + Vermögen langfristig an HRK LUNIS' },
    ],
  },

  // 6. Event-Einladung als Türöffner
  {
    id: 'BM011',
    name: 'Lindenberg Unternehmer-Dinner Einladung',
    kategorie: 'bestandsmandat',
    quelle: 'event_einladung',
    quelleLabel: 'Event-Einladung (Aktivierung)',
    stadium: 'identifiziert',
    geschaetztesVolumen: '—',
    potentialAuM: 0,
    wahrscheinlichkeit: 0,
    naechsterSchritt: 'Einladung zum Unternehmer-Dinner am 25.03. versenden',
    datum: '2026-03-08',
    referenzMandant: 'VV00002',
    beruf: 'Bestandsmandant',
    herkunft: 'Fam. Lindenberg: Profil passt zum Unternehmer-Dinner am 25.03. Einladung als Anlass — 91 Tage kein Kontakt!',
    kiDescription: 'KI-Analyse: Achtung — 91 Tage kein Kontakt zu Familie Lindenberg! Bei Top-Mandanten ist eine Kontaktpause von >90 Tagen ein Warnsignal für die Kundenbindung. Das Unternehmer-Dinner am 25.03.2026 bietet den perfekten Gesprächsanlass: Fam. Lindenberg (SaaS-Exit-Unternehmer) passt optimal zur Zielgruppe. Wichtig: Die Einladung als echten Mehrwert positionieren, nicht als Verkaufsgespräch. Strategie: Einladung persönlich versenden, im Gespräch dann natürlich auf die Cash-Konsolidierung (BM001) und das Mandats-Upgrade (BM006) überleiten. Aktivierung dringend empfohlen.',
    herleitung: [
      { label: 'Event', value: 'Unternehmer-Dinner am 25.03.2026' },
      { label: 'Mandantenprofil', value: 'SaaS-Exit-Unternehmer — passt perfekt zur Zielgruppe' },
      { label: 'Letzter Kontakt', value: '91 Tage — Aktivierung dringend empfohlen' },
      { label: 'Strategie', value: 'Event-Einladung als Gesprächsanlass — nicht "verkaufen"' },
    ],
  },

  // 7. Performance-bedingte Anpassung
  {
    id: 'BM012',
    name: 'Stiftung Weber Performance-Gespräch',
    kategorie: 'bestandsmandat',
    quelle: 'performance',
    quelleLabel: 'Performance-Anpassung',
    stadium: 'termin',
    geschaetztesVolumen: '—',
    potentialAuM: 0,
    wahrscheinlichkeit: 0,
    naechsterSchritt: 'Proaktives Gespräch mit Stiftungsrat führen — Rebalancing vorschlagen',
    datum: '2026-03-10',
    referenzMandant: 'VV00003',
    beruf: 'Bestandsmandant',
    herkunft: 'Stiftung Weber: -8,2% Performance, nahe 10%-Verlustschwelle. Proaktives Gespräch dringend empfohlen.',
    kiDescription: 'KI-Analyse: DRINGEND — Performance-Warnung! Die Stiftung Weber hat -8,2% seit Höchststand verloren und nähert sich der 10%-Verlustschwelle. Bei Erreichen der -10%-Marke wird automatisch eine regulatorische Verlustschwellenmeldung ausgelöst — das sollte unbedingt proaktiv kommuniziert werden, BEVOR der Mandant es selbst bemerkt. Ursache: Anleihen-Segment unter Druck durch Zinsanstieg. Empfohlene Maßnahme: Sofort anrufen, Situation erklären, Rebalancing vorschlagen (Anleihen-Duration verkürzen). Proaktive Kommunikation stärkt das Vertrauen — reaktives Handeln nach einer Schwellenmeldung wirkt defensiv.',
    herleitung: [
      { label: 'Aktuelle Performance', value: '-8,2% seit Höchststand (Verlustschwelle: -10%)' },
      { label: 'Ursache', value: 'Anleihen-Segment unter Druck durch Zinsanstieg' },
      { label: 'Risiko', value: 'Bei Erreichen -10% → Verlustschwellenmeldung an Mandant' },
      { label: 'Empfehlung', value: 'Proaktiv anrufen BEVOR Mandant es selbst bemerkt' },
      { label: 'Maßnahme', value: 'Rebalancing vorschlagen: Anleihen-Duration verkürzen' },
    ],
  },

  // 8. Compliance-getriebene Kontaktanlässe
  {
    id: 'BM013',
    name: 'Tim Keller WpHG-Bogen überfällig',
    kategorie: 'bestandsmandat',
    quelle: 'compliance',
    quelleLabel: 'Compliance-Kontaktanlass',
    stadium: 'termin',
    geschaetztesVolumen: '—',
    potentialAuM: 0,
    wahrscheinlichkeit: 0,
    naechsterSchritt: 'WpHG-Fragebogen aktualisieren + gleichzeitig Krypto-Reporting besprechen',
    datum: '2026-03-12',
    referenzMandant: 'VV00005',
    beruf: 'Bestandsmandant',
    herkunft: 'Tim Keller: WpHG-Bogen 14 Tage überfällig. Compliance-Termin als Anlass für Krypto-Reporting-Gespräch nutzen.',
    kiDescription: 'KI-Analyse: Compliance-Pflicht als Vertriebschance nutzen! Tim Kellers WpHG-Fragebogen ist 14 Tage überfällig — regulatorisch zwingend erforderlich. Den Pflichttermin smart nutzen: Gleichzeitig Krypto-Reporting besprechen (Tim ist Techunternehmer mit Krypto-Affinität), Angel-Portfolio-Erweiterung und ESG-Impact-Investments thematisieren. Beim Ausfüllen des WpHG-Bogens Risikobereitschaft aktualisieren — ggf. neue Anlageklassen freigeben. Aus einer regulatorischen Pflicht wird so ein wertvolles Beratungsgespräch mit Cross-Selling-Potenzial.',
    herleitung: [
      { label: 'Compliance-Pflicht', value: 'WpHG-Fragebogen 14 Tage überfällig — regulatorisch notwendig' },
      { label: 'Cross-Selling', value: 'Termin nutzen für: Krypto-Reporting, Angel-Portfolio, ESG-Impact' },
      { label: 'Mandats-Upgrade', value: 'Risikobereitschaft prüfen — ggf. neue Anlageklassen freigeben' },
      { label: 'Nächster Schritt', value: 'Termin am 12.03. — WpHG + Beratungsgespräch kombinieren' },
    ],
  },

  // 9. PE-Erweiterung (Cross-Sell Bestand)
  {
    id: 'BM014',
    name: 'Hartmann PE Healthcare +300k',
    kategorie: 'bestandsmandat',
    quelle: 'upgrade',
    quelleLabel: 'Mandats-Erweiterung',
    stadium: 'angebot',
    geschaetztesVolumen: '300.000 €',
    potentialAuM: 300000,
    wahrscheinlichkeit: 75,
    naechsterSchritt: 'PE Healthcare Fund II Zeichnungsunterlagen vorbereiten',
    datum: '2026-02-25',
    referenzMandant: 'VV00004',
    beruf: 'Bestandsmandant',
    herkunft: 'Prof. Hartmann: PE Healthcare Allokation von 200k auf 500k erhöhen. Fachkenntnis Kardiologie = Informationsvorteil.',
    kiDescription: 'KI-Analyse: Prof. Hartmann (Chefarzt Kardiologie) hat aktuell nur 200k € in PE Healthcare — das sind 2,9% seines AuM, deutlich unter dem Zielkorridor von 7–10%. Als Kardiologe verfügt er über einzigartige Branchenkenntnis, die seine PE-Investments in Healthcare besonders informiert macht. Der PE Healthcare Fund II bietet eine ideale Gelegenheit, die Allokation auf 500k € (+300k) zu erhöhen. Erwartete IRR: 12–15% p.a. basierend auf historischen Healthcare-PE-Renditen. Empfehlung: Zeichnungsunterlagen vorbereiten und bei nächstem Termin die PE-Erweiterung vorschlagen. Die Wahrscheinlichkeit liegt bei 75% — der Mandant kennt und schätzt die Anlageklasse.',
    herleitung: [
      { label: 'Aktuelle PE-Allokation', value: '200.000 € (PE Healthcare Fund, seit 01/2022)' },
      { label: 'Anteil am AuM', value: '2,9% — deutlich unter Ziel 7–10%' },
      { label: 'Fachexpertise', value: 'Chefarzt Kardiologie — einzigartige Branchenkenntnis' },
      { label: 'Ziel-PE-Allokation', value: '500.000 € (+300k in PE Healthcare Fund II)' },
      { label: 'Erwartete Rendite', value: 'IRR 12–15% p.a. (Healthcare-PE historisch)' },
    ],
  },

  // 10. ESG-Upgrade
  {
    id: 'BM015',
    name: 'Stiftung Weber ESG Art.9 Upgrade',
    kategorie: 'bestandsmandat',
    quelle: 'upgrade',
    quelleLabel: 'Mandats-Erweiterung',
    stadium: 'kennenlernen',
    geschaetztesVolumen: '—',
    potentialAuM: 0,
    wahrscheinlichkeit: 0,
    naechsterSchritt: 'Art.9 Mandat Proposal für nächste Stiftungsrat-Sitzung erstellen',
    datum: '2026-02-28',
    referenzMandant: 'VV00003',
    beruf: 'Bestandsmandant',
    herkunft: 'Stiftung Weber: ESG-Score 72, Ziel >80. Art.8 auf Art.9 upgraden — unterstreicht Bildungsmission der Stiftung.',
    kiDescription: 'KI-Analyse: Die Stiftung Weber hat aktuell einen ESG-Score von 72 (Art.8 Spezialmandat), das Ziel liegt bei >80 (Art.9 Konformität). Ein Upgrade auf Art.9 würde die Bildungsmission der Stiftung unterstreichen und gleichzeitig regulatorische Vorteile bringen: erleichterte Fördermittel-Akquise und stärkere Positionierung bei der Spenderansprache. Kein direkter Revenue-Impact, aber hoher Bindungseffekt und Differenzierung gegenüber Wettbewerbern. Empfehlung: Art.9 Mandat-Proposal für die nächste Stiftungsrat-Sitzung vorbereiten — der Stiftungsrat entscheidet, nicht der einzelne Ansprechpartner.',
    herleitung: [
      { label: 'Aktueller ESG-Score', value: '72 von 100 (Art.8 Spezialmandat)' },
      { label: 'Ziel-ESG-Score', value: '>80 (Art.9 Konformität)' },
      { label: 'Stiftungszweck', value: 'Bildungsförderung — Art.9 unterstreicht Mission' },
      { label: 'Regulatorischer Vorteil', value: 'Art.9 erleichtert Fördermittel-Akquise + Spenderansprache' },
    ],
  },
];


// ─── 6. VV_REVENUE ── Berater-level revenue data ───────────────────────────

export const VV_REVENUE = {
  monthlyRevenue: [
    { name: 'Jan', managementFee: 22800, performanceFee: 0, sonstiges: 1200 },
    { name: 'Feb', managementFee: 23100, performanceFee: 0, sonstiges: 950 },
    { name: 'Mär', managementFee: 23400, performanceFee: 3200, sonstiges: 1100 },
    { name: 'Apr', managementFee: 23200, performanceFee: 0, sonstiges: 800 },
    { name: 'Mai', managementFee: 23500, performanceFee: 0, sonstiges: 1500 },
    { name: 'Jun', managementFee: 23800, performanceFee: 4100, sonstiges: 1050 },
    { name: 'Jul', managementFee: 24100, performanceFee: 0, sonstiges: 900 },
    { name: 'Aug', managementFee: 23600, performanceFee: 0, sonstiges: 1300 },
    { name: 'Sep', managementFee: 24200, performanceFee: 5500, sonstiges: 1100 },
    { name: 'Okt', managementFee: 24500, performanceFee: 0, sonstiges: 950 },
    { name: 'Nov', managementFee: 24800, performanceFee: 0, sonstiges: 1200 },
    { name: 'Dez', managementFee: 25200, performanceFee: 8200, sonstiges: 2800 },
  ],

  mandantenRevenue: [
    { name: 'Dr. von Trott', aum: 12500000, fee: 0.85, ertrag: 106250 },
    { name: 'Fam. Lindenberg', aum: 2100000, fee: 1.05, ertrag: 22050 },
    { name: 'Stiftung Weber', aum: 8300000, fee: 0.75, ertrag: 62250 },
    { name: 'Prof. Hartmann', aum: 6800000, fee: 0.85, ertrag: 57800 },
    { name: 'Tim Keller', aum: 450000, fee: 1.05, ertrag: 4725 },
  ],

  feeStruktur: [
    { typ: 'Management Fee', volumen: 232100, anteil: 83.8 },
    { typ: 'Performance Fee', volumen: 21000, anteil: 7.6 },
    { typ: 'Transaktionskosten', volumen: 12350, anteil: 4.5 },
    { typ: 'Sonstiges', volumen: 11400, anteil: 4.1 },
  ],

  forecast: {
    q1: 78700,
    q2: 85200,
    q3: 92500,
    q4: 105600,
  },
};
