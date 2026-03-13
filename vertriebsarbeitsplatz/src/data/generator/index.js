// ============================================
// Haupt-Generator: Erzeugt alle Kunden beim App-Start
// ============================================
import { seedRandom } from './utils';
import { generatePerson, generateVVPerson } from './personGenerator';
import { assignEigeneProdukte, assignFremdProdukte, validateFremdProdukte } from './produktZuordnung';
import { evaluatePotentiale } from './potenzialEngine';
import { calculateScores, generateTransaktionen, generateKommunikation, berechneAbsicherung } from './scoresKomm';

// Showcase-Kunden (fix, aus bestehenden Dateien)
import { V1, V2, V3, V4 } from '../versicherung-v1-v4';
import { V5, V6, V7, V8 } from '../versicherung-v5-v8';
import { B1, B2, B3, B4, B5, B6 } from '../banking';
import { W1, W2, W3, W4, W5 } from '../vv';

const SHOWCASE = {
  versicherung: [V1, V2, V3, V4, V5, V6, V7, V8],
  banking: [B1, B2, B3, B4, B5, B6],
  vermoegensverwaltung: [W1, W2, W3, W4, W5],
};

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
export function generateAllKunden(modus, anzahl = 45, seed = 42) {
  seedRandom(seed + (modus === 'versicherung' ? 0 : modus === 'banking' ? 1000 : 2000));

  const showcase = SHOWCASE[modus] || [];
  const generated = [];
  const targetCount = anzahl - showcase.length;

  for (let i = 0; i < targetCount; i++) {
    const person = modus === 'vermoegensverwaltung'
      ? generateVVPerson()
      : generatePerson(modus);

    buildKunde(person, modus);
    generated.push(person);
  }

  // Enrich showcase data: ensure they have transaktionen, scores, etc.
  const enrichedShowcase = showcase.map(k => {
    const enriched = { ...k, _isShowcase: true };
    // Ensure required fields exist for generator functions
    if (!enriched._modus) enriched._modus = modus;
    if (!enriched.kinder) enriched.kinder = [];
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
    calculateScores(enriched);
    if (!enriched.absicherung) {
      enriched.absicherung = berechneAbsicherung(enriched);
    }
    if (!enriched.kommunikation) {
      enriched.kommunikation = generateKommunikation(enriched);
    }
    return enriched;
  });

  return [...enrichedShowcase, ...generated];
}

// ═══ Cache: Nur einmal pro Session generieren ═══
const cache = {};

export function getKunden(modus) {
  if (!cache[modus]) {
    const counts = { versicherung: 45, banking: 40, vermoegensverwaltung: 12 };
    cache[modus] = generateAllKunden(modus, counts[modus] || 30);
  }
  return cache[modus];
}

export function clearCache() {
  Object.keys(cache).forEach(k => delete cache[k]);
}
