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
    const demoAnalyse = DEMO_KI_ANALYSEN[id];
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
