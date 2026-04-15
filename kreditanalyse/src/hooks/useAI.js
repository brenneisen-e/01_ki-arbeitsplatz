import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';

// ---------------------------------------------------------------------------
// Demo responses (used when API is unavailable)
// ---------------------------------------------------------------------------
const demoResponses = {
  eigenkapitalquote: `Analyse der Eigenkapitalquote:

Die Eigenkapitalquote des Unternehmens liegt bei ca. 32,5 % und damit im soliden Mittelfeld für die Branche. Der Branchendurchschnitt liegt bei etwa 28 – 35 %.

Entwicklung EK-Quote 2021-2023:
[chart: 2021=30.2 2022=31.4 2023=32.5]

Kennzahlen im Branchenvergleich:

| Kennzahl | Unternehmen | Branchen-Ø | Status |
| --- | --- | --- | --- |
| Eigenkapitalquote | 32,5 % | 29,0 % | **über Ø** |
| Verschuldungsgrad | 210 % | 245 % | **besser** |
| Anlagendeckung II | 118 % | 105 % | **solide** |

Bewertung:
- Ausreichende Eigenkapitalausstattung für das beantragte Kreditvolumen
- Positiver Trend über die letzten 3 Jahre (+2,3 Prozentpunkte)
- Beachten Sie die geplante Investition und deren Auswirkung auf die EK-Quote

Empfehlung: Die Eigenkapitalquote stützt eine positive Kreditentscheidung. Bei Auszahlung des beantragten Kredits sollte die Quote nicht unter 25 % fallen.

Quellen:
- Jahresabschluss 2023 (Bilanz, Passivseite, Position "Eigenkapital" und "Bilanzsumme")
- Jahresabschlüsse 2021 und 2022 (für Trendberechnung)
- Branchenbenchmark-Datenbank der Bank (Branchencode laut Antrag)
- Interne Mindestquoten-Policy (Risikorichtlinie §4.2)`,

  risiken: `Risikoanalyse:

Basierend auf den vorliegenden Daten identifiziere ich folgende wesentliche Risiken:

Risikoverteilung (Gewichtung):
[chart: Hoch=35 Mittel=45 Gering=20]

Hohe Risiken:
- Kundenkonzentration: Top-3 > 45 % Umsatz
- Abhängigkeit von Zulieferern im Ausland (50 % Materialeinkauf)

Mittlere Risiken:
- Branchenkonjunktur mit Abschwächungstendenz
- Steigende Personalkosten (Personalaufwandsquote +1,8 %)
- Fällige Refinanzierung bestehender Verbindlichkeiten in 2025

Geringe Risiken:
- Standortrisiko gering (etablierter Industriestandort)
- Nachfolgeplanung vorhanden

Top-3 Kundenkonzentration:

| Kunde | Umsatzanteil | Laufzeit Verträge |
| --- | --- | --- |
| Kunde A | 22 % | bis 2027 |
| Kunde B | 14 % | bis 2026 |
| Kunde C | 9 % | bis 2025 |
| **Top-3 gesamt** | **45 %** | — |

Gesamteinschätzung: Risikoprofil **moderat** – vertretbar bei angemessener Besicherung und Vereinbarung passender Covenants.

Quellen:
- Kundenliste & Umsatzkonzentration aus BWA aktuell und Jahresabschluss 2023 (GuV-Details)
- Bestehende Verbindlichkeiten laut Antragsdaten
- Branchenreport Creditreform (Branchenkonjunktur)
- Personalaufwandsquote: eigene Berechnung aus Jahresabschluss 2023 / 2022
- Annahme: Nachfolgeplanung laut Managementgespräch vom 04.04.2026`,

  zusammenfassung: `Kreditanalyse – Zusammenfassung

1. Antragsteller & Vorhaben
Das Unternehmen beantragt einen Investitionskredit zur Erweiterung der Produktionskapazitäten. Die Geschäftsführung verfügt über langjährige Branchenerfahrung.

2. Wirtschaftliche Verhältnisse

Umsatzentwicklung 2021-2023 (TEUR):
[chart: 2021=4100 2022=4420 2023=4980]

Kernkennzahlen:

| Kennzahl | 2021 | 2022 | 2023 | Trend |
| --- | --- | --- | --- | --- |
| Umsatz (TEUR) | 4.100 | 4.420 | 4.980 | **+10,6 %** |
| EBITDA-Marge | 8,4 % | 9,1 % | 9,5 % | **steigend** |
| EK-Quote | 30,2 % | 31,4 % | 32,5 % | **steigend** |
| DSCR | 1,35 | 1,42 | 1,48 | **komfortabel** |

3. Rating-Ergebnis
Quantitatives Rating im Bereich **befriedigend bis gut** – entspricht einer Ausfallwahrscheinlichkeit im akzeptablen Rahmen für Neugeschäft.

4. Sicherheitenbewertung

Sicherheiten-Deckung:
[chart: Beleihungswert=85 Blanko=15]

Vorgeschlagene Sicherheiten decken den Kreditbetrag zu ca. 85 %. Blankoanteil im Rahmen der Kompetenzgrenzen.

5. Empfehlung
**Befürwortung** des Kreditantrags unter folgenden Auflagen:
- Jährliche Offenlegung gemäß §18 KWG
- Quartalsweise BWA-Einreichung
- Einhaltung Financial Covenants (EK-Quote ≥ 25 %, DSCR ≥ 1,2x)

Quellen:
- Antragsdaten (Kreditantrag, Verwendungszweck)
- Jahresabschlüsse 2021 – 2023
- Aktuelle BWA
- Rating-Engine (quantitatives & qualitatives Rating)
- Sicherheitenbewertung nach institutsinternen Beleihungswertrichtlinien
- Kompetenzmatrix der Bank, §18 KWG, MaRisk BTO 1.2`,

  default: `Vielen Dank für Ihre Frage. Basierend auf den vorliegenden Unterlagen und Kennzahlen kann ich Folgendes feststellen:

Die wirtschaftlichen Verhältnisse des Antragstellers sind insgesamt als **solide** einzustufen. Die wesentlichen Bilanzkennzahlen bewegen sich im branchenüblichen Rahmen.

Ampel-Status der Prüfbereiche:

| Prüfbereich | Status | Kommentar |
| --- | --- | --- |
| Kapitaldienstfähigkeit | **grün** | DSCR 1,48 – komfortabel |
| Sicherheitenbewertung | **grün** | Deckung ~ 85 % |
| Rating | **gelb** | Klasse 5 – befriedigend |
| Kundenkonzentration | **gelb** | Top-3 = 45 % |
| Regulatorik §18 KWG | **grün** | Vollständig eingereicht |

Wichtige Punkte:
- Kapitaldienstfähigkeit: auf Basis der aktuellen Ertragslage gegeben
- Sicherheiten: angemessene Risikoabsicherung
- Regulatorik: §18 KWG und MaRisk BTO 1.1 zu beachten

Für eine vertiefte Analyse empfehle ich, die einzelnen Bereiche (Bilanzanalyse, Rating, Sicherheiten) im Detail zu prüfen. Nutzen Sie dafür die entsprechenden Reiter in der Navigation.

Quellen:
- Antragsdaten und hochgeladene Dokumente des Antragstellers
- Kennzahlenberechnung basierend auf Jahresabschluss 2023
- Sicherheitenbewertung aus Modul Sicherheiten
- Regulatorische Referenzen: §18 KWG, MaRisk BTO 1.1`,

  kapitaldienst: `Kapitaldienstfähigkeits-Analyse:

Die Kapitaldienstfähigkeit ist im Basisszenario und unter Stressannahmen gegeben. Die Berechnung basiert auf einer Neukalkulation mit EBITDA und Zins-/Tilgungsbelastung inkl. des neuen Engagements.

DSCR-Entwicklung inkl. Neukredit:
[chart: 2023=1.48 Plan2024=1.35 Plan2025=1.38 Plan2026=1.42]

Szenarien:

| Szenario | EBITDA | Kapitaldienst | DSCR | Bewertung |
| --- | --- | --- | --- | --- |
| Basis | 473 TEUR | 340 TEUR | **1,39** | komfortabel |
| Stress (-10 % Umsatz, +5 % Kosten) | 395 TEUR | 340 TEUR | **1,16** | knapp ausreichend |
| Worst-Case (-20 % Umsatz) | 312 TEUR | 340 TEUR | **0,92** | Covenant-Verstoß |

Empfehlung: **Kapitaldienstfähigkeit grundsätzlich gegeben**. Für den Stress-Case ist die Einhaltung von Financial Covenants (DSCR ≥ 1,2x) vertraglich zu vereinbaren.

Quellen:
- Jahresabschluss 2023 (EBITDA-Ermittlung)
- Planungsrechnung 2024 – 2026 (GuV, Investitionsplan)
- Konditionen des geplanten Kredits (Zins, Tilgung, Laufzeit)
- Annahme: Stress-Szenario gem. MaRisk BTO 1.2.1 Tz. 5 (-10 % / +5 %)`,

  sicherheiten: `Sicherheitenbewertung:

Die angebotenen Sicherheiten decken das Kreditengagement in ausreichendem Umfang ab. Alle Bewertungen folgen den institutsinternen Beleihungswertrichtlinien.

Blanko- vs. gedeckter Anteil:
[chart: Beleihungswert=85 Blanko=15]

Detaillierte Bewertung:

| Sicherheit | Marktwert | Haircut | Beleihungswert | Vorlasten |
| --- | --- | --- | --- | --- |
| Grundschuld Betriebsgebäude | 3.200 TEUR | 20 % | 2.560 TEUR | 850 TEUR |
| Globalabtretung Forderungen | 680 TEUR | 40 % | 408 TEUR | 0 |
| Maschinensicherungsübereignung | 950 TEUR | 30 % | 665 TEUR | 0 |
| **Summe Beleihungswerte** | **4.830 TEUR** | — | **3.633 TEUR (netto 2.783 TEUR)** | 850 TEUR |

Deckungsgrad: **ca. 85 %** des Kreditbetrags. Der Blankoanteil von 15 % ist durch die Bonität des Kreditnehmers vertretbar und liegt innerhalb der Kompetenzgrenzen.

Quellen:
- Aktuelle Verkehrswertgutachten (Grundschuld, Maschinen)
- Debitorenliste aus BWA März 2026
- Interne Haircut-Tabelle (Sicherheitenrichtlinie §3)
- Grundbuchauszug vom 28.03.2026 (Vorlasten)`,

  rating: `Rating-Analyse:

Das interne Rating setzt sich aus quantitativer und qualitativer Komponente zusammen und ergibt eine **Klasse 5** (befriedigend).

Rating-Verteilung je Teilkomponente:
[chart: Quantitativ=6 Qualitativ=4 Eigentümer=4 Kontoführung=5]

Zusammensetzung:

| Komponente | Gewicht | Klasse | Einfluss |
| --- | --- | --- | --- |
| Quantitativ (Bilanzkennzahlen) | 50 % | 6 | **mittel** |
| Qualitativ (Management, Markt) | 30 % | 4 | **gut** |
| Eigentümer-Rating | 10 % | 4 | **gut** |
| Kontoführung | 10 % | 5 | **neutral** |
| **Gesamtrating** | 100 % | **5** | **befriedigend** |

PD-Einordnung: Klasse 5 entspricht ca. **0,85 % 1-Jahres-Ausfallwahrscheinlichkeit**. Das Rating liegt innerhalb der Neugeschäfts-Policy.

Quellen:
- Jahresabschluss 2023 (quantitative Kennzahlen)
- Managementgespräch vom 04.04.2026 (qualitative Komponente)
- Creditreform-Auskunft vom 10.04.2026 (Eigentümer-Rating)
- Kontoumsatzanalyse letzte 12 Monate (Kontoführung)
- Interne Rating-Engine (Scorecard Version 4.2)`,

  kyc: `KYC-Prüfung: Zusammenfassung

Die KYC-Prüfung ist weitgehend abgeschlossen. Alle Pflichtunterlagen gemäß GwG §10 liegen vor oder sind in Bearbeitung.

Fortschritt der Checkliste:
[chart: geprüft=4 eingereicht=2 offen=1]

Status der Dokumente:

| Dokument | Status | KI-Prüfung | Freigabe durch |
| --- | --- | --- | --- |
| Handelsregisterauszug | **geprüft** | ja | KM, vor 4 Tagen |
| Gesellschaftsvertrag | **geprüft** | ja | KM, vor 4 Tagen |
| Gesellschafterliste | **eingereicht** | ja | ausstehend |
| Transparenzregister | **geprüft** | ja | KM, vor 2 Tagen |
| Legitimation GF 1 | **geprüft** | ja | SB, vor 6 Tagen |
| Legitimation GF 2 | **offen** | — | — |
| Gewerbeanmeldung | **eingereicht** | ja | ausstehend |

PEP- & Sanktionslisten-Screening: **keine Treffer** (Abgleich EU / UN / OFAC / Dow Jones).

Empfehlung: Fehlende Legitimation GF 2 und finale Freigabe Gesellschafterliste + Gewerbeanmeldung einholen.

Quellen:
- Hochgeladene Dokumente im KYC-Modul
- Transparenzregister-Abfrage vom 12.04.2026
- PEP/Sanktionslisten-Screening durch Compliance-Team
- GwG §10 und §11 (Kundenbezogene Sorgfaltspflichten)`
};

function getDemoResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  if (msg.includes('eigenkapital') || msg.includes('ek-quote') || msg.includes('kapitalstruktur')) {
    return demoResponses.eigenkapitalquote;
  }
  if (msg.includes('risik') || msg.includes('gefahr') || msg.includes('schwäch')) {
    return demoResponses.risiken;
  }
  if (msg.includes('kapitaldienst') || msg.includes('dscr') || msg.includes('tilgung') || msg.includes('stress')) {
    return demoResponses.kapitaldienst;
  }
  if (msg.includes('sicherheit') || msg.includes('blanko') || msg.includes('besicher') || msg.includes('beleihung') || msg.includes('haircut')) {
    return demoResponses.sicherheiten;
  }
  if (msg.includes('rating') || msg.includes('bonität') || msg.includes('ausfallwahrsch') || msg.includes('pd')) {
    return demoResponses.rating;
  }
  if (msg.includes('kyc') || msg.includes('pep') || msg.includes('sanktion') || msg.includes('ubo') || msg.includes('legitimation')) {
    return demoResponses.kyc;
  }
  if (msg.includes('zusammenfassung') || msg.includes('fazit') || msg.includes('überblick') || msg.includes('gesamt') || msg.includes('empfehlung')) {
    return demoResponses.zusammenfassung;
  }
  return demoResponses.default;
}

export function useAI() {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const callAI = useCallback(async (systemPrompt, userMessage) => {
    setLoading(true);
    setError(null);
    setResult(null);
    dispatch({ type: 'SET_AI_LOADING', loading: true });

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text || 'Keine Antwort erhalten.';
      setResult(text);
      dispatch({ type: 'SET_AI_LOADING', loading: false });
      return text;
    } catch {
      // Fallback to demo responses when API is unavailable
      const delay = 1200 + Math.random() * 800;
      await new Promise(resolve => setTimeout(resolve, delay));
      const demoText = getDemoResponse(userMessage);
      setResult(demoText);
      dispatch({ type: 'SET_AI_LOADING', loading: false });
      return demoText;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const sendChatMessage = useCallback(async (systemPrompt, userMessage) => {
    dispatch({ type: 'ADD_AI_MESSAGE', message: { role: 'user', content: userMessage, timestamp: new Date() } });

    const response = await callAI(systemPrompt, userMessage);
    if (response) {
      dispatch({ type: 'ADD_AI_MESSAGE', message: { role: 'assistant', content: response, timestamp: new Date() } });
    }
    return response;
  }, [callAI, dispatch]);

  return { callAI, sendChatMessage, loading, result, error };
}
