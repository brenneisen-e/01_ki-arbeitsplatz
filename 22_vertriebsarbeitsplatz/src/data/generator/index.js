// ============================================
// Haupt-Generator: Erzeugt Kunden lazy pro Modus
// Showcase-Daten werden per Dynamic Import geladen (Code-Splitting)
// ============================================
import { seedRandom } from './utils';
import { generatePerson, generateVVPerson } from './personGenerator';
import { assignEigeneProdukte, assignFremdProdukte, validateFremdProdukte, generateFbRating, fbRatingKlasse, FB_RATED_TYPES } from './produktZuordnung';
import { evaluatePotentiale } from './potenzialEngine';
import { calculateScores, generateTransaktionen, generateKommunikation, berechneAbsicherung } from './scoresKomm';

// Dynamic showcase loaders — nur der aktive Modus wird geladen
const showcaseLoaders = {
  versicherung: () => Promise.all([
    import('../versicherung-v1-v4'),
    import('../versicherung-v5-v8'),
  ]).then(([m1, m2]) => [m1.V1, m1.V2, m1.V3, m1.V4, m2.V5, m2.V6, m2.V7, m2.V8]),

  banking: () => Promise.all([
    import('../banking-b1-b3'),
    import('../banking-b4-b6'),
  ]).then(([m1, m2]) => [m1.B1, m1.B2, m1.B3, m2.B4, m2.B5, m2.B6]),

  vermoegensverwaltung: () => import('../vv').then(m => [m.W1, m.W2, m.W3, m.W4, m.W5]),
};

// ═══ Fahrzeuge aus KFZ-Produkten + Transaktionen ableiten ═══
function deriveFahrzeuge(person) {
  const fahrzeuge = [];
  const allProducts = [...(person.eigeneProdukte || []), ...(person.fremdProdukte || [])];
  // KFZ-Produkte erkennen: explizit `typ === 'kfz'`, `produktart` mit „KFZ"
  // (Showcase-Kunden) oder über das Detailfeld als Fallback.
  const kfzProducts = allProducts.filter(p =>
    p.typ === 'kfz' ||
    /kfz/i.test(p.produktart || '') ||
    /vollkasko|teilkasko|haftpflicht.*kfz/i.test(p.details || '')
  );

  for (const kfz of kfzProducts) {
    const details = kfz.details || '';
    // Parse vehicle model from details like "BMW 3er, Vollkasko, SF-15"
    const parts = details.split(',').map(s => s.trim());
    const modell = parts[0] || 'Unbekannt';
    let deckung = parts[1] || '';
    let sf = parts[2] || '';
    // Wenn das, was wir als „Deckung" interpretiert haben, eigentlich die
    // Schadenfreiheitsklasse ist (z. B. nur "SF-12"), nach `sf` umverschieben.
    if (deckung && /^SF[-\s]?\d+$/i.test(deckung)) {
      sf = sf || deckung;
      deckung = '';
    }
    // Wenn produktart die Deckung enthält (z.B. „KFZ-Vollkasko"), als Fallback nehmen
    if (!deckung && kfz.produktart) {
      const dm = kfz.produktart.match(/(Vollkasko|Teilkasko|Haftpflicht)/i);
      if (dm) deckung = dm[1];
    }
    if (!sf) {
      const sfMatch = details.match(/SF[-\s]?\d+/i);
      if (sfMatch) sf = sfMatch[0];
    }

    fahrzeuge.push({
      modell,
      deckung,
      sf,
      versicherer: kfz.versicherer || kfz.institut || (kfz.produkt?.split(' ')[0]) || 'Unbekannt',
      praemie: kfz.praemie || kfz.volumen || 0,
      quelle: kfz.institut ? 'psd2' : 'bestand',
      fbRating: kfz.fbRating || null,
      fbKlasse: kfz.fbKlasse || null,
    });
  }

  // Add mobility spending from transactions
  const mobilTx = (person.transaktionen || []).filter(t =>
    t.kategorie === 'mobilitaet' || t.empfaenger?.match(/ARAL|Shell|Total|Tankstelle|ADAC|Parkhaus|Leasing/i)
  );
  const monatlicheAusgaben = mobilTx.reduce((s, t) => s + Math.abs(t.betrag || 0), 0);

  return {
    liste: fahrzeuge,
    monatlicheAusgaben: monatlicheAusgaben > 0 ? monatlicheAusgaben : (fahrzeuge.length > 0 ? Math.round(150 + Math.random() * 250) : 0),
    quellen: fahrzeuge.length > 0 ? ['kfz-versicherung', 'kontoumsaetze'] : (monatlicheAusgaben > 0 ? ['kontoumsaetze'] : []),
  };
}

function buildKunde(person, modus) {
  // 1. Eigene Produkte
  person.eigeneProdukte = assignEigeneProdukte(person, modus);

  // 2. Fremdprodukte
  person.fremdProdukte = assignFremdProdukte(person, modus, person.eigeneProdukte);

  // 3. Validierung
  validateFremdProdukte(person, modus);

  // 4. Transaktionen
  person.transaktionen = generateTransaktionen(person);

  // 5. Scores (vor Potentiale, da NPS gebraucht wird)
  // Temporärer NPS für Potenzial-Engine
  const produktAnzahl = person.eigeneProdukte.length;
  const npsBase = produktAnzahl >= 5 ? 8 : produktAnzahl >= 3 ? 7 : produktAnzahl >= 2 ? 6 : 5;
  person.nps = Math.max(1, Math.min(10, npsBase + (Math.floor(Math.random() * 5) - 2)));

  // 6. Potentiale (automatisch aus Regeln!)
  person.potentiale = evaluatePotentiale(person);

  // 7. Endgültige Scores (mit Potentialen)
  calculateScores(person);

  // 8. Absicherung
  person.absicherung = berechneAbsicherung(person);

  // 9. Kommunikation
  person.kommunikation = generateKommunikation(person);

  // 10. Fahrzeuge/Mobilität (PSD2-abgeleitet)
  person.fahrzeuge = deriveFahrzeuge(person);

  // Cleanup interne Felder
  delete person._berufObj;
  delete person._modus;
  delete person.geschlecht;
  delete person.bruttoeinkommen;

  return person;
}

/**
 * Generiert alle Kunden für einen Modus.
 * Showcase-Kunden werden vorne eingefügt, danach generierte.
 */
function generateAllKunden(modus, showcase, anzahl = 45, seed = 42) {
  seedRandom(seed + (modus === 'versicherung' ? 0 : modus === 'banking' ? 1000 : 2000));

  const generated = [];
  const targetCount = anzahl - showcase.length;

  for (let i = 0; i < targetCount; i++) {
    const person = modus === 'vermoegensverwaltung'
      ? generateVVPerson()
      : generatePerson(modus);

    buildKunde(person, modus);

    // VV: derive mandatsTyp, aum, and portfolio from eigeneProdukte
    if (modus === 'vermoegensverwaltung') {
      const mandat = person.eigeneProdukte.find(p => p.sparte === 'vv' || p.sparte === 'FairValue' || p.sparte === 'SmartValue');
      if (mandat) {
        person.mandatsTyp = person._vvSegment || (mandat.praemie > 5000000 ? 'FairValue' : 'SmartValue');
        person.aum = mandat.praemie || 0;
      }
      // Generate portfolio performance data
      const ytd = +(2 + Math.random() * 8).toFixed(1);
      const bmYtd = +(ytd - 0.5 - Math.random() * 2).toFixed(1);
      person.portfolio = {
        allocation: { aktien: 45 + Math.floor(Math.random() * 20), anleihen: 20 + Math.floor(Math.random() * 15), alternative: 10 + Math.floor(Math.random() * 10), cash: 5 + Math.floor(Math.random() * 5) },
        performance: { ytd, '1j': +(ytd * 1.8 + Math.random() * 3).toFixed(1), '3j': +(4 + Math.random() * 5).toFixed(1) },
        benchmark: { ytd: bmYtd, '1j': +(bmYtd * 1.6 + Math.random() * 2).toFixed(1), '3j': +(3.5 + Math.random() * 3).toFixed(1) },
        esgScore: 55 + Math.floor(Math.random() * 35),
      };
    }

    generated.push(person);
  }

  // Enrich showcase data: ensure they have transaktionen, scores, etc.
  const enrichedShowcase = showcase.map(k => {
    const enriched = { ...k, _isShowcase: true };
    // Ensure required fields exist for generator functions
    if (!enriched._modus) enriched._modus = modus;
    if (!enriched.kinder) enriched.kinder = [];
    if (!enriched.fremdProdukte) enriched.fremdProdukte = [];
    if (!enriched.eigeneProdukte) enriched.eigeneProdukte = [];
    if (!enriched.transaktionen) {
      enriched.transaktionen = generateTransaktionen(enriched);
      // VV mandants: add management fee + income from portfolio as transactions
      if (modus === 'vermoegensverwaltung' && enriched.aum) {
        const mgmtFee = Math.round(enriched.aum * 0.01 / 12);
        enriched.transaktionen.push({ kategorie: 'versicherung_firma', betrag: -mgmtFee, empfaenger: 'VV Management Fee' });
        const dividenden = Math.round(enriched.aum * 0.02 / 12);
        enriched.transaktionen.push({ kategorie: 'einkommen', betrag: dividenden, empfaenger: 'Dividenden & Zinserträge' });
        // Add a savings/investment transaction
        const sparRate = Math.round((enriched.nettoeinkommen || 10000) * 0.2);
        enriched.transaktionen.push({ kategorie: 'sparen', betrag: -sparRate, empfaenger: 'Sparplan / Wiederanlage' });
      }
    }
    if (!enriched.nps) {
      const produktAnzahl = (enriched.eigeneProdukte || []).length;
      const npsBase = produktAnzahl >= 5 ? 8 : produktAnzahl >= 3 ? 7 : produktAnzahl >= 2 ? 6 : 5;
      enriched.nps = Math.max(1, Math.min(10, npsBase + (Math.floor(Math.random() * 5) - 2)));
    }
    if (!enriched.potentiale) {
      enriched.potentiale = evaluatePotentiale(enriched);
    }
    // Only calculate scores if not already present (needs _berufObj)
    if (!enriched._berufObj) {
      enriched._berufObj = { segment: 'selbstaendig', buRisiko: 'buero' };
    }
    if (!enriched.risikoscore) {
      calculateScores(enriched);
    }
    if (!enriched.absicherung) {
      enriched.absicherung = berechneAbsicherung(enriched);
    }
    if (!enriched.kommunikation) {
      enriched.kommunikation = generateKommunikation(enriched);
    }
    if (!enriched.fahrzeuge) {
      enriched.fahrzeuge = deriveFahrzeuge(enriched);
    }
    // Enrich insurance products with F&B ratings if missing
    [...(enriched.eigeneProdukte || []), ...(enriched.fremdProdukte || [])].forEach(p => {
      if (!p.fbRating && FB_RATED_TYPES.includes(p.typ)) {
        const isEigen = (enriched.eigeneProdukte || []).includes(p);
        p.fbRating = generateFbRating(isEigen);
        p.fbKlasse = fbRatingKlasse(p.fbRating);
      }
    });
    return enriched;
  });

  return [...enrichedShowcase, ...generated];
}

// ═══ Cache: Nur einmal pro Session generieren ═══
const cache = {};
const pendingLoads = {};
const COUNTS = { versicherung: 45, banking: 40, vermoegensverwaltung: 12 };

/**
 * Preload Kunden für einen Modus (async).
 * Lädt Showcase-Daten per Dynamic Import und generiert Kunden.
 * Wird beim Moduswechsel aufgerufen.
 */
export function preloadKunden(modus) {
  if (cache[modus]) return Promise.resolve(cache[modus]);
  if (pendingLoads[modus]) return pendingLoads[modus];

  pendingLoads[modus] = showcaseLoaders[modus]().then(showcase => {
    cache[modus] = generateAllKunden(modus, showcase, COUNTS[modus] || 30);
    delete pendingLoads[modus];
    return cache[modus];
  });

  return pendingLoads[modus];
}

/**
 * Synchroner Zugriff auf Kunden eines Modus.
 * Gibt gecachte Daten zurück oder wirft ein Promise für React Suspense.
 */
export function getKunden(modus) {
  if (cache[modus]) return cache[modus];
  // Throw promise for React Suspense
  throw preloadKunden(modus);
}

export function clearCache() {
  Object.keys(cache).forEach(k => delete cache[k]);
  Object.keys(pendingLoads).forEach(k => delete pendingLoads[k]);
}
