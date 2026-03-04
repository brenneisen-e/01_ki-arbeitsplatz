import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';

// ---------------------------------------------------------------------------
// Demo responses (used when API is unavailable)
// ---------------------------------------------------------------------------
const demoResponses = {
  eigenkapitalquote: `**Analyse der Eigenkapitalquote:**

Die Eigenkapitalquote des Unternehmens liegt bei ca. 32,5% und damit im soliden Mittelfeld für die Branche. Der Branchendurchschnitt liegt bei etwa 28-35%.

**Bewertung:**
- ✅ Ausreichende Eigenkapitalausstattung für das beantragte Kreditvolumen
- ✅ Positiver Trend über die letzten 3 Jahre (+2,3 Prozentpunkte)
- ⚠️ Beachten Sie die geplante Investition und deren Auswirkung auf die EK-Quote

**Empfehlung:** Die Eigenkapitalquote stützt eine positive Kreditentscheidung. Bei Auszahlung des beantragten Kredits sollte die Quote nicht unter 25% fallen.`,

  risiken: `**Risikoanalyse:**

Basierend auf den vorliegenden Daten identifiziere ich folgende wesentliche Risiken:

**Hohe Risiken:**
- 🔴 Konzentration auf wenige Großkunden (Top-3 > 45% Umsatz)
- 🔴 Abhängigkeit von Zulieferern im Ausland

**Mittlere Risiken:**
- 🟡 Branchenkonjunktur zeigt Abschwächungstendenz
- 🟡 Steigende Personalkosten (Personalaufwandsquote +1,8%)
- 🟡 Fällige Refinanzierung bestehender Verbindlichkeiten in 2025

**Geringe Risiken:**
- 🟢 Standortrisiko gering (etablierter Industriestandort)
- 🟢 Nachfolgeplanung vorhanden

**Gesamteinschätzung:** Risikoprofil moderat – vertretbar bei angemessener Besicherung.`,

  zusammenfassung: `**Kreditanalyse – Zusammenfassung**

**1. Antragsteller & Vorhaben**
Das Unternehmen beantragt einen Investitionskredit zur Erweiterung der Produktionskapazitäten. Die Geschäftsführung verfügt über langjährige Branchenerfahrung.

**2. Wirtschaftliche Verhältnisse**
- Umsatzentwicklung: Positiver Trend über 3 Jahre
- Ertragslage: EBITDA-Marge im Branchenvergleich zufriedenstellend
- Kapitalstruktur: Eigenkapitalquote ausreichend, Verschuldungsgrad vertretbar
- Liquidität: Liquidität 3. Grades > 120%, Kapitaldienstfähigkeit gegeben

**3. Rating-Ergebnis**
Quantitatives Rating im Bereich "befriedigend bis gut" – entspricht einer Ausfallwahrscheinlichkeit im akzeptablen Rahmen für Neugeschäft.

**4. Sicherheitenbewertung**
Vorgeschlagene Sicherheiten decken den Kreditbetrag zu ca. 75-85% ab. Blankoanteil im Rahmen der Kompetenzgrenzen.

**5. Empfehlung**
Befürwortung des Kreditantrags unter folgenden Auflagen:
- Jährliche Offenlegung gemäß §18 KWG
- Quartalsweise BWA-Einreichung
- Einhaltung Financial Covenants (EK-Quote ≥ 25%, DSCR ≥ 1,2x)`,

  default: `Vielen Dank für Ihre Frage. Basierend auf den vorliegenden Unterlagen und Kennzahlen kann ich Folgendes feststellen:

Die wirtschaftlichen Verhältnisse des Antragstellers sind insgesamt als **solide** einzustufen. Die wesentlichen Bilanzkennzahlen bewegen sich im branchenüblichen Rahmen.

**Wichtige Punkte:**
- Die Kapitaldienstfähigkeit ist auf Basis der aktuellen Ertragslage gegeben
- Die angebotenen Sicherheiten bieten eine angemessene Risikoabsicherung
- Regulatorische Anforderungen (§18 KWG, MaRisk BTO 1.1) sind zu beachten

Für eine vertiefte Analyse empfehle ich, die einzelnen Bereiche (Bilanzanalyse, Rating, Sicherheiten) im Detail zu prüfen. Nutzen Sie dafür die entsprechenden Reiter in der Navigation.

Kann ich Ihnen bei einem spezifischen Aspekt der Kreditanalyse weiterhelfen?`
};

function getDemoResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  if (msg.includes('eigenkapital') || msg.includes('ek-quote') || msg.includes('kapitalstruktur')) {
    return demoResponses.eigenkapitalquote;
  }
  if (msg.includes('risik') || msg.includes('gefahr') || msg.includes('schwäch')) {
    return demoResponses.risiken;
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
