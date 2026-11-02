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

const eurDe = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const datumDe = (d) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Dynamikprovision nach derselben Regel wie die Demo-Analysen: je Erhöhung
 * Mehrbeitrag × 12 × Restlaufzeit × AP-Satz, der Mehrbeitrag auf den zum
 * Erhöhungstermin geltenden Beitrag. Gerechnet werden die Erhöhungen bis zum
 * Ende des reklamierten Zeitraums. Ohne Laufzeit, AP-Satz oder Dynamik im
 * Bestand gibt es keine Rechnung (null).
 */
function dynamikRechnung(vorgang, vertrag) {
  const zahl = (text, re) => Number(String(text || '').match(re)?.[1]?.replace(',', '.'));
  const laufzeit = zahl(vertrag?.beitragssumme, /Laufzeit\s*(\d+)\s*J/);
  const ap = zahl(vertrag?.apSatz, /([\d,]+)\s*\u2030/);
  const dyn = zahl(vertrag?.dynamik, /([\d,]+)\s*%/);
  const beginn = new Date(vorgang.vertragsbeginn);
  const [bisJ, bisM] = String(vorgang.zeitraumBis || '').split('-').map(Number);
  if (!laufzeit || !ap || !dyn || Number.isNaN(beginn.getTime()) || !bisJ || !bisM) return null;
  const bis = new Date(bisJ, bisM, 0);
  const schritte = [];
  let beitrag = Number(vorgang.monatsbeitrag) || 0;
  for (let jahr = 1; jahr < laufzeit; jahr++) {
    const termin = new Date(beginn.getFullYear() + jahr, beginn.getMonth(), beginn.getDate());
    if (termin > bis) break;
    const mehr = Math.round(beitrag * dyn) / 100;
    const rest = laufzeit - jahr;
    const soll = Math.round(mehr * 12 * rest * ap / 10) / 100;
    schritte.push({ termin, basis: beitrag, mehr, rest, soll });
    beitrag = Math.round((beitrag + mehr) * 100) / 100;
  }
  return schritte.length ? { schritte, ap, dyn, laufzeit } : null;
}

// Synthetisiert eine plausible KI-Analyse für neu eingereichte Vorgänge, für
// die keine vorgefertigte Demo-Analyse existiert. So bekommt der Sachbearbeiter
// im Backoffice auch für seine Demo-Einreichung eine vollständige Ansicht.
function buildSynthAnalyse(vorgang) {
  if (!vorgang) return null;
  const erwartet = Number(vorgang.erwartet) || 0;
  const erhalten = Number(vorgang.erhalten) || 0;
  const diff = erhalten - erwartet;
  const eingangsdatumDe = vorgang.eingangsdatum
    ? new Date(vorgang.eingangsdatum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  const istDynamikMuster =
    vorgang.typ === 'Fehlende Dynamikprovision' && /^LV-/i.test(vorgang.vsNummer || '');
  // Für Dynamik-Fälle mit Vertragsdaten rechnet die Vorprüfung selbst nach,
  // statt den gemeldeten Betrag zu übernehmen (nur, wenn nichts gebucht wurde).
  const rechnung = istDynamikMuster && erhalten === 0 ? dynamikRechnung(vorgang, DEMO_VERTRAGSDATEN[vorgang.vsNummer]) : null;

  const positionen = rechnung
    ? rechnung.schritte.map(r => ({ position: `Dynamikprovision ${datumDe(r.termin)}`, soll: r.soll, ist: 0, differenz: -r.soll }))
    : [{ position: vorgang.typ || 'Reklamierte Position', soll: erwartet, ist: erhalten, differenz: diff }];
  const gesamtSoll = rechnung ? Math.round(positionen.reduce((s, p) => s + p.soll, 0) * 100) / 100 : erwartet;
  const gesamtDiff = Math.round((erhalten - gesamtSoll) * 100) / 100;
  const rechenweg = rechnung
    ? `**SOLL je Dynamikerhöhung** (Mehrbeitrag × 12 × Restlaufzeit × ${eurDe(rechnung.ap).replace(',00', '')} ‰):\n` +
      rechnung.schritte.map(r => `- ${datumDe(r.termin)}: ${eurDe(rechnung.dyn).replace(',00', '')} % von ${eurDe(r.basis)} EUR = ${eurDe(r.mehr)} EUR mtl. × 12 × ${r.rest} Jahre, davon ${eurDe(rechnung.ap).replace(',00', '')} ‰ = **${eurDe(r.soll)} EUR**`).join('\n') + '\n\n'
    : '';
  const abweichung = Math.round((gesamtSoll - erwartet) * 100) / 100;

  const bewertung = istDynamikMuster
    ? {
        ampel: 'orange',
        titel: 'AUFFÄLLIGKEIT — Systemischer Fehler vermutet',
        analyse: `Diese neu eingereichte Reklamation zeigt das **identische Fehlerbild** wie der Cluster RK-2026-0045, RK-2026-0050 und RK-2026-0051: Dynamikerhöhungen lösen auf Tarifen der T-FRV-Familie keine Abschlussprovision aus.\n\n**Betroffener Vertrag:** ${vorgang.vsNummer}, VN ${vorgang.vnName}, Monatsbeitrag ${eurDe(Number(vorgang.monatsbeitrag || 0))} EUR.\n\n${rechenweg}${rechnung ? (Math.abs(abweichung) < 0.005 ? 'Die Rechnung **entspricht der Meldung**.' : `Die Rechnung liegt **${eurDe(Math.abs(abweichung))} EUR ${abweichung > 0 ? 'über' : 'unter'} der Meldung**.`) + '\n\n' : ''}**Mustervergleich:** Damit liegt eine weitere unabhängige Reklamation mit exakt diesem Fehlerbild vor — ein starker Hinweis auf einen systematischen Fehler in der Dynamik-Provisionskopplung.`,
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
      gesamt_soll: gesamtSoll,
      gesamt_ist: erhalten,
      gesamt_differenz: rechnung ? gesamtDiff : diff,
      hinweis: rechnung ? 'Gerechnet je Erhöhung über die Restlaufzeit ab dem Erhöhungstermin und auf den jeweils geltenden Beitrag.' : undefined,
    },
    bewertung,
    antwort_entwurf: rechnung
      ? `Sehr geehrte/r ${vorgang.vermittler || 'Vermittler/in'},\n\nvielen Dank für Ihre Reklamation vom ${eingangsdatumDe} zu Vorgang ${vorgang.id} (VS-Nr. ${vorgang.vsNummer}, VN ${vorgang.vnName}).\n\nIhre Reklamation ist berechtigt: Jede Dynamikerhöhung hätte eine Abschlussprovision auf den Mehrbeitrag auslösen müssen. Wir buchen Ihnen ${eurDe(gesamtSoll)} EUR nach:\n\n${rechnung.schritte.map(r => `- Erhöhung ${datumDe(r.termin)}: ${eurDe(r.mehr)} EUR mtl. x 12 x ${r.rest} Jahre x ${eurDe(rechnung.ap).replace(',00', '')} ‰ = ${eurDe(r.soll)} EUR`).join('\n')}\n\nIhr Vorgang wurde mit weiteren inhaltlich identischen Reklamationen zusammengeführt; wir arbeiten an einer bestandsweiten Korrektur.\n\nDie Nachbuchung erfolgt mit der nächsten Abrechnung.\n\nMit freundlichen Grüßen\nLisa Neumann\nAbteilung Provisionsservice`
      : `Sehr geehrte/r ${vorgang.vermittler || 'Vermittler/in'},\n\nvielen Dank für Ihre Reklamation vom ${eingangsdatumDe} zu Vorgang ${vorgang.id} (VS-Nr. ${vorgang.vsNummer}, VN ${vorgang.vnName}).\n\nWir haben Ihren Vorgang aufgenommen und prüfen die Abrechnung. Sie erhalten eine Rückmeldung innerhalb der üblichen Bearbeitungsfrist von 5–10 Werktagen.\n\nMit freundlichen Grüßen\nLisa Neumann\nAbteilung Provisionsservice`,
  };
}
