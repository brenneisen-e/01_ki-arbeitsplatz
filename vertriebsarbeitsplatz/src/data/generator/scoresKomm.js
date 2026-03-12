// ============================================
// Scores, Transaktionen, Kommunikation
// ============================================
import { random, randomBetween, clamp } from './utils';

// ═══ Scores berechnen ═══
export function calculateScores(person) {
  const produktAnzahl = person.eigeneProdukte.length;

  // NPS
  const npsBase = produktAnzahl >= 5 ? 8 : produktAnzahl >= 3 ? 7 : produktAnzahl >= 2 ? 6 : 5;
  person.nps = clamp(npsBase + randomBetween(-2, 2), 1, 10);

  // Risikoscore (0-100, niedrig = gut)
  const verschuldung = person.fremdProdukte.some(f => f.typ === 'baufinanzierung') ? randomBetween(30, 60) : randomBetween(10, 30);
  const einkommensStab = person._berufObj.segment === 'beamtet' ? 5 : person._berufObj.segment === 'selbstaendig' ? randomBetween(25, 50) : randomBetween(10, 30);
  person.risikoscore = clamp(Math.round((verschuldung + einkommensStab) / 2), 5, 85);

  // Potenzial-Score (1-5)
  const potWert = person.potentiale.reduce((s, p) => s + (p.volumen || 0), 0);
  const potAnzahl = person.potentiale.length;
  person.potentialScore = clamp(Math.round((potAnzahl * 0.5 + potWert / 5000) * 10) / 10, 1.0, 5.0);

  // Abwanderungsrisiko
  person.abwanderungsrisiko = person.nps <= 5 ? 'hoch' : person.nps <= 7 ? 'mittel' : 'niedrig';
}

// ═══ Transaktionen generieren ═══
export function generateTransaktionen(person) {
  const txns = [];

  // Gehalt
  if (person.nettoeinkommen > 0) {
    txns.push({ kategorie: 'gehalt', betrag: person.nettoeinkommen, empfaenger: person.arbeitgeber?.name || 'Arbeitgeber' });
  }

  // Partner
  if (person.partner?.einkommen) {
    txns.push({ kategorie: 'gehalt_partner', betrag: person.partner.einkommen, empfaenger: 'Partner-Arbeitgeber' });
  }

  // Kindergeld
  if (person.kinder.length > 0) {
    txns.push({ kategorie: 'kindergeld', betrag: person.kinder.length * 250, empfaenger: 'Familienkasse' });
  }

  // Baufi-Rate
  const baufi = person.fremdProdukte.find(f => f.typ === 'baufinanzierung');
  if (baufi) {
    txns.push({ kategorie: 'baufi', betrag: -randomBetween(600, 1800), empfaenger: baufi.institut || 'Bank' });
  } else if (person.wohnsituation === 'Miete') {
    txns.push({ kategorie: 'miete', betrag: -randomBetween(500, 1500), empfaenger: 'Vermieter' });
  }

  // Versicherungen
  const eigenPraemie = person.eigeneProdukte.reduce((s, p) => s + (p.praemie || 0), 0);
  if (eigenPraemie > 0) {
    txns.push({ kategorie: 'versicherung_eigen', betrag: -Math.round(eigenPraemie / 12), empfaenger: person._modus === 'banking' ? 'R+V / VB' : 'ERGO' });
  }

  // Sparplan
  const depot = person.fremdProdukte.find(f => f.typ === 'depot');
  if (depot) {
    txns.push({ kategorie: 'sparplan', betrag: -randomBetween(100, 500), empfaenger: depot.institut || 'Depot' });
  }

  // Konsum
  const restBudget = (person.nettoeinkommen + (person.partner?.einkommen || 0)) * 0.3;
  txns.push({ kategorie: 'konsum', betrag: -Math.round(restBudget), empfaenger: 'Diverse' });

  // Mobilität
  if (person.eigeneProdukte.some(p => p.typ === 'kfz') || person.fremdProdukte.some(p => p.typ === 'kfz')) {
    txns.push({ kategorie: 'mobilitaet', betrag: -randomBetween(100, 300), empfaenger: 'Tanken, ADAC' });
  }

  // Haustiere (aus Kontoumsätzen erkannt)
  if (person.haustiere) {
    const tierTxn = person.haustiere.erkannteTransaktionen?.[0];
    if (tierTxn) {
      txns.push({ kategorie: 'haustier', betrag: -tierTxn.betrag, empfaenger: tierTxn.haendler, tierRelevant: true });
    }
  }

  // Abos
  txns.push({ kategorie: 'abos', betrag: -randomBetween(20, 80), empfaenger: random(['Netflix, Spotify', 'Spotify, DAZN', 'Netflix, Disney+', 'Amazon Prime, Spotify']) });

  return txns;
}

// ═══ Kommunikation generieren ═══
export function generateKommunikation(person) {
  const komm = [];
  const anzahl = randomBetween(2, 5);

  const typen = ['termin', 'email', 'chatbot', 'telefon'];
  const richtungen = ['eingehend', 'ausgehend'];

  const betreffPool = {
    versicherung: [
      'Jahresgespräch',
      'BU-Beratung',
      'Kfz-Verlängerung',
      'Schadensmeldung',
      'Angebot nachfassen',
      'Tarifwechsel besprechen',
      'Altersvorsorge-Beratung',
      'Hausrat-Upgrade',
      'Frage zur Rechnung',
      'Cross-Selling Kampagne',
    ],
    banking: [
      'Kontoeröffnung',
      'Kreditberatung',
      'Anlageberatung',
      'VR-FinanzPlan',
      'Baufinanzierung',
      'Depot-Review',
      'Kontogebühren',
      'FIDA-Consent',
      'Wero-Aktivierung',
      'Union Investment Sparplan',
    ],
    vermoegensverwaltung: [
      'Portfolio-Review',
      'Onboarding-Gespräch',
      'WpHG-Fragebogen',
      'Performance-Report',
      'Rebalancing besprechen',
      'Nachfolgeplanung',
      'NextGen-Beratung',
      'ESG-Upgrade',
      'Investmentvorschlag',
      'Quartalsmeeting',
    ],
  };

  const pool = betreffPool[person._modus] || betreffPool.versicherung;

  for (let i = 0; i < anzahl; i++) {
    const monat = String(randomBetween(1, 3)).padStart(2, '0');
    const tag = String(randomBetween(1, 28)).padStart(2, '0');
    const jahr = randomBetween(0, 100) > 30 ? '2026' : '2025';

    komm.push({
      datum: `${jahr}-${monat}-${tag}`,
      typ: random(typen),
      richtung: random(richtungen),
      betreff: random(pool),
      zusammenfassung: `${random(['Kunde', 'Mandant', 'Berater'])} ${random(['hat', 'wollte', 'fragte nach'])} ${random(['Information', 'Angebot', 'Termin', 'Rückruf', 'Beratung'])}. ${random(['Wiedervorlage angelegt.', 'Keine Reaktion.', 'Positiv, Follow-up geplant.', 'Erledigt.', 'Termin vereinbart.'])}`,
    });
  }

  return komm.sort((a, b) => b.datum.localeCompare(a.datum));
}

// ═══ Absicherungsstatus ableiten ═══
export function berechneAbsicherung(person) {
  const alleTypen = ['bu', 'kfz', 'haftpflicht', 'hausrat', 'rechtsschutz', 'unfall', 'pflege', 'rlv', 'wohngebaeude'];
  const vorhanden = [];
  const fehlend = [];

  alleTypen.forEach(typ => {
    const hatEigen = person.eigeneProdukte.some(p => p.typ === typ);
    const hatFremd = person.fremdProdukte.some(p => p.typ === typ);
    if (hatEigen || hatFremd) {
      vorhanden.push(typ);
    } else {
      fehlend.push(typ);
    }
  });

  return { vorhanden, fehlend };
}
