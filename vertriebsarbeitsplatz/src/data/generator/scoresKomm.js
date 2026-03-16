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
  const tier = person.haustiere || person.tiere;
  if (tier) {
    const txnList = tier.erkannteTransaktionen || (tier.umsaetze || []).map(u => ({ haendler: u.empfaenger, betrag: Math.abs(u.betrag) }));
    const tierTxn = txnList[0];
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

  const typen = ['termin', 'email', 'chatbot', 'telefon', 'kontaktformular'];
  const richtungen = ['eingehend', 'ausgehend'];

  const betreffPool = {
    versicherung: [
      'Jahresgespr\u00e4ch', 'BU-Beratung', 'Kfz-Verl\u00e4ngerung', 'Schadensmeldung',
      'Angebot nachfassen', 'Tarifwechsel besprechen', 'Altersvorsorge-Beratung',
      'Hausrat-Upgrade', 'Frage zur Rechnung', 'Cross-Selling Kampagne',
    ],
    banking: [
      'Kontoer\u00f6ffnung', 'Kreditberatung', 'Anlageberatung', 'VR-FinanzPlan',
      'Baufinanzierung', 'Depot-Review', 'Kontogeb\u00fchren', 'FIDA-Consent',
      'Wero-Aktivierung', 'Union Investment Sparplan',
    ],
    vermoegensverwaltung: [
      'Portfolio-Review', 'Onboarding-Gespr\u00e4ch', 'WpHG-Fragebogen', 'Performance-Report',
      'Rebalancing besprechen', 'Nachfolgeplanung', 'NextGen-Beratung', 'ESG-Upgrade',
      'Investmentvorschlag', 'Quartalsmeeting',
    ],
  };

  const zusammenfassungPool = [
    'Kunde hat Informationen angefragt. Wiedervorlage angelegt.',
    'Angebot besprochen, Kunde zeigt Interesse. Termin vereinbart.',
    'Kampagne verschickt, keine Reaktion.',
    'R\u00fcckrufbitte erhalten, zeitnah zur\u00fcckrufen.',
    'Beratungsgespr\u00e4ch gef\u00fchrt, Follow-up geplant.',
    'Kunde fragte nach Details zum Produkt. Unterlagen gesendet.',
    'Proaktive Ansprache, Kunde offen f\u00fcr Termin.',
    'Kundenanliegen bearbeitet und abgeschlossen.',
  ];

  const emailBodyPool = [
    (name, betreff) => `Sehr geehrte/r ${name},\n\nvielen Dank f\u00fcr Ihr Interesse an unserem Angebot zum Thema "${betreff}".\n\nGerne m\u00f6chte ich Ihnen in einem pers\u00f6nlichen Gespr\u00e4ch die Details erl\u00e4utern und ein individuelles Angebot erstellen.\n\nK\u00f6nnen wir einen Termin vereinbaren?\n\nMit freundlichen Gr\u00fc\u00dfen\nIhr Berater`,
    (name, betreff) => `Hallo ${name},\n\nwie besprochen sende ich Ihnen die Informationen zum Thema "${betreff}".\n\nBitte schauen Sie sich die Unterlagen in Ruhe an. Bei Fragen stehe ich Ihnen jederzeit zur Verf\u00fcgung.\n\nViele Gr\u00fc\u00dfe\nIhr Berater`,
  ];

  const chatFragenPool = [
    { frage: 'Wie kann ich meine Daten \u00e4ndern?', antwort: 'Sie k\u00f6nnen Ihre pers\u00f6nlichen Daten direkt im Online-Banking unter "Einstellungen" \u00e4ndern oder sich an Ihre Filiale wenden.' },
    { frage: 'Wann ist mein Berater erreichbar?', antwort: 'Ihr pers\u00f6nlicher Berater ist Mo-Fr von 9-17 Uhr erreichbar. Soll ich einen R\u00fcckruf einrichten?' },
    { frage: 'Wie kann ich eine Schadensmeldung machen?', antwort: 'Eine Schadensmeldung k\u00f6nnen Sie online, per App oder telefonisch (0800-Hotline) aufgeben. Halten Sie bitte Ihre Vertragsnummer bereit.' },
  ];

  const pool = betreffPool[person._modus] || betreffPool.versicherung;

  for (let i = 0; i < anzahl; i++) {
    const monat = String(randomBetween(1, 3)).padStart(2, '0');
    const tag = String(randomBetween(1, 28)).padStart(2, '0');
    const jahr = randomBetween(0, 100) > 30 ? '2026' : '2025';
    const typ = random(typen);
    const betreff = random(pool);
    const richtung = typ === 'chatbot' || typ === 'kontaktformular' ? 'eingehend' : random(richtungen);

    const entry = {
      datum: `${jahr}-${monat}-${tag}`,
      typ,
      richtung,
      betreff,
      zusammenfassung: random(zusammenfassungPool),
    };

    // Add rich content for some entries
    if (typ === 'email' && richtung === 'ausgehend' && randomBetween(0, 100) > 40) {
      const nameTeile = person.name.split(' ');
      const anrede = nameTeile.length > 1 ? `Herr/Frau ${nameTeile[nameTeile.length - 1]}` : person.name;
      entry.emailBody = random(emailBodyPool)(anrede, betreff);
    }

    if (typ === 'chatbot' && randomBetween(0, 100) > 30) {
      const chatQ = random(chatFragenPool);
      entry.chatverlauf = [
        { rolle: 'kunde', text: chatQ.frage, zeit: `${randomBetween(8, 22)}:${String(randomBetween(0, 59)).padStart(2, '0')}` },
        { rolle: 'bot', text: chatQ.antwort, zeit: `${randomBetween(8, 22)}:${String(randomBetween(0, 59)).padStart(2, '0')}` },
      ];
      entry.kiZusammenfassung = `Kunde stellte Frage: "${chatQ.frage.substring(0, 40)}..." \u2013 Chatbot hat informiert und L\u00f6sung angeboten.`;
    }

    if (typ === 'kontaktformular') {
      entry.inhalt = `Kontaktformular-Anfrage: "${person.name} bat um R\u00fcckruf zum Thema ${betreff}. Erreichbar werktags 9-17 Uhr."`;
    }

    komm.push(entry);
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
