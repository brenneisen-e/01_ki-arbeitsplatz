import { useState, useCallback, useRef } from 'react';
import { DEMO_KI_ANALYSEN, DEMO_VERTRAGSDATEN } from '../data/demoData';
import { SYSTEM_PROMPT, buildUserPrompt } from '../utils/provisionLogic';

export default function useKiAnalyse() {
  const [analysen, setAnalysen] = useState({});
  const [loading, setLoading] = useState({});
  const requestedRef = useRef(new Set());

  const getAnalyse = useCallback((vorgangId) => {
    return analysen[vorgangId] || null;
  }, [analysen]);

  const isLoading = useCallback((vorgangId) => {
    return loading[vorgangId] || false;
  }, [loading]);

  const requestAnalyse = useCallback(async (vorgang) => {
    if (!vorgang) return;
    const { id } = vorgang;

    // Schon geladen oder in Bearbeitung?
    if (requestedRef.current.has(id)) return;
    requestedRef.current.add(id);

    setLoading(prev => ({ ...prev, [id]: true }));

    // Versuche Anthropic API
    const apiKey = getApiKey();
    if (apiKey) {
      try {
        const result = await callAnthropicApi(apiKey, vorgang);
        if (result) {
          setAnalysen(prev => ({ ...prev, [id]: result }));
          setLoading(prev => ({ ...prev, [id]: false }));
          return;
        }
      } catch (err) {
        console.warn('API-Call fehlgeschlagen, verwende Demo-Daten:', err.message);
      }
    }

    // Fallback: Demo-Daten mit simulierter Verzögerung
    await new Promise(resolve => setTimeout(resolve, 1200));
    const demoAnalyse = DEMO_KI_ANALYSEN[id] || buildSynthAnalyse(vorgang);
    if (demoAnalyse) {
      setAnalysen(prev => ({ ...prev, [id]: demoAnalyse }));
    }
    setLoading(prev => ({ ...prev, [id]: false }));
  }, []);

  return { getAnalyse, isLoading, requestAnalyse };
}

function getApiKey() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('anthropic_api_key') || null;
  }
  return null;
}

async function callAnthropicApi(apiKey, vorgang) {
  const vertragsdaten = DEMO_VERTRAGSDATEN[vorgang.vsNummer];
  const userPrompt = buildUserPrompt(vorgang, vertragsdaten);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) throw new Error(`API ${response.status}`);

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Keine Antwort erhalten');

  // JSON aus der Antwort extrahieren
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Kein JSON in Antwort');

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    provisionsberechnung: parsed.provisionsberechnung,
    bewertung: parsed.bewertung,
    antwort_entwurf: parsed.antwort_entwurf,
  };
}

// Synthetisiert eine plausible KI-Analyse für neu eingereichte Vorgänge, für
// die keine vorgefertigte Demo-Analyse existiert. So bekommt der Sachbearbeiter
// im Backoffice auch für seine Demo-Einreichung eine vollständige Ansicht.
function buildSynthAnalyse(vorgang) {
  if (!vorgang) return null;
  const erwartet = Number(vorgang.erwartet) || 0;
  const erhalten = Number(vorgang.erhalten) || 0;
  const diff = erhalten - erwartet;

  const positionen = [
    { position: vorgang.typ || 'Reklamierte Position', soll: erwartet, ist: erhalten, differenz: diff },
  ];

  const istDynamikMuster =
    vorgang.typ === 'Fehlende Dynamikprovision' && /^LV-/i.test(vorgang.vsNummer || '');

  const bewertung = istDynamikMuster
    ? {
        ampel: 'orange',
        titel: 'AUFFÄLLIGKEIT — Systemischer Fehler vermutet',
        analyse: `Diese neu eingereichte Reklamation zeigt das **identische Fehlerbild** wie die bereits im Bestand markierten Fälle (u.a. RK-2026-0041, RK-2026-0045): Dynamikerhöhungen lösen auf Tarifen der T-FRV-Familie keine Abschlussprovision aus.\n\n**Betroffener Vertrag:** ${vorgang.vsNummer}, VN ${vorgang.vnName}, Monatsbeitrag ${Number(vorgang.monatsbeitrag || 0).toFixed(2)} EUR.\n\n**Mustervergleich:** Damit liegen jetzt drei unabhängige Reklamationen mit exakt diesem Fehlerbild vor — ein starker Hinweis auf einen systematischen Fehler in der Dynamik-Provisionskopplung.`,
        handlungsempfehlung: '1. Vorgang an IT/Provisionssystem-Team eskalieren\n2. Bestandsanalyse: Alle aktiven T-FRV-Verträge mit Dynamik-Klausel prüfen\n3. Proaktive Nachbuchung für betroffene Vermittler anstoßen',
        auffaelligkeit: {
          erkannt: true,
          muster: 'Dynamikerhöhungen lösen keine AP aus — Tarif-Familie T-FRV',
          geschaetzte_betroffene: 'ca. 150–200 Verträge im Bestand',
        },
      }
    : {
        ampel: 'gelb',
        titel: 'Klärungsbedarf — Demo-Einreichung',
        analyse: `Die Reklamation wurde eingereicht und zur Prüfung vorgemerkt. Erwarteter Betrag: ${erwartet.toFixed(2)} EUR, erhalten: ${erhalten.toFixed(2)} EUR, Differenz: ${diff.toFixed(2)} EUR.\n\nFür diesen Vorgang liegt noch keine automatisierte KI-Vorprüfung vor — bitte manuell klären.`,
        handlungsempfehlung: 'Sachverhalt prüfen, Vertragsdaten abgleichen und Entscheidung dokumentieren.',
        auffaelligkeit: { erkannt: false, muster: '', geschaetzte_betroffene: '' },
      };

  return {
    provisionsberechnung: {
      positionen,
      gesamt_soll: erwartet,
      gesamt_ist: erhalten,
      gesamt_differenz: diff,
    },
    bewertung,
    antwort_entwurf: `Sehr geehrte/r ${vorgang.vermittler || 'Vermittler/in'},\n\nvielen Dank für Ihre Reklamation vom ${vorgang.eingangsdatum} zu Vorgang ${vorgang.id} (VS-Nr. ${vorgang.vsNummer}, VN ${vorgang.vnName}).\n\nWir haben Ihren Vorgang aufgenommen und prüfen die Abrechnung. Sie erhalten eine Rückmeldung innerhalb der üblichen Bearbeitungsfrist von 5–10 Werktagen.\n\nMit freundlichen Grüßen\n[Sachbearbeiter/in]\nAbteilung Provisionsservice`,
  };
}
