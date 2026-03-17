// ─── VV_PERFORMANCE ── Per-mandant performance data ──────────────────────

export const VV_PERFORMANCE = {
  // ── W1: Tim Keller – Konservativ (Vorbild: Flossbach v. Storch Multiple Opps) ──
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

  // ── W5: Maxim Meydarn – Aggressiv / Tech (Vorbild: ARK Innovation + Nasdaq-100) ──
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
