// ============================================
// Personen-Generator
// ============================================
import { random, randomBetween, weightedRandom, shuffle } from './utils';

const VORNAMEN_M = ['Peter','Thomas','Michael','Klaus','Markus','Stefan','Andreas','Christian',
  'Daniel','Martin','Tobias','Florian','Jens','Matthias','Dirk','Ralf','Frank','Oliver',
  'Sebastian','Jan','Lukas','Tim','Maximilian','Felix','Alexander','Henrik','Lars','Sven'];
const VORNAMEN_W = ['Anna','Sandra','Lisa','Sarah','Maria','Julia','Laura','Katharina',
  'Sabine','Andrea','Nicole','Monika','Christina','Petra','Claudia','Stefanie','Jennifer',
  'Melanie','Birgit','Eva','Amira','Lena','Sophie','Franziska','Nadine','Anja','Simone'];
const NACHNAMEN = ['Schmidt','Mueller','Weber','Fischer','Wagner','Becker','Hoffmann',
  'Schulz','Koch','Richter','Klein','Wolf','Schroeder','Neumann','Braun','Zimmermann',
  'Krueger','Hartmann','Lange','Werner','Schmitt','Meier','Lehmann','Schmid','Schulze',
  'Maier','Koehler','Hermann','Koenig','Huber','Kaiser','Fuchs','Peters','Lang','Scholz',
  'Moeller','Weiss','Jung','Hahn','Vogel','Friedrich','Keller','Guenther','Berger',
  'Frank','Roth','Beck','Lorenz','Baumann','Franke','Albrecht','Ludwig','Winter','Sommer',
  'Krause','Jansen','Engel','Vogt','Schreiber','Boehm','Pfeiffer','Seidel'];

const BERUFE = [
  // Angestellte
  { beruf: 'IT-Projektleiter', brutto: [65000,90000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Software-Entwickler', brutto: [55000,85000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'UX-Designerin', brutto: [45000,65000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Controller', brutto: [50000,75000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Marketing-Managerin', brutto: [55000,80000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Vertriebsleiter', brutto: [70000,100000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Personalreferentin', brutto: [45000,65000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Ingenieur', brutto: [55000,85000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Lehrerin', brutto: [45000,65000], segment: 'beamtet', buRisiko: 'buero' },
  { beruf: 'Polizeibeamter', brutto: [42000,58000], segment: 'beamtet', buRisiko: 'koerperlich' },
  // Aerzte / Hochverdiener
  { beruf: 'Ärztin (angestellt)', brutto: [75000,130000], segment: 'angestellt', buRisiko: 'arzt' },
  { beruf: 'Zahnarzt (eigene Praxis)', brutto: [100000,200000], segment: 'selbstaendig', buRisiko: 'arzt' },
  { beruf: 'Rechtsanwältin', brutto: [70000,140000], segment: 'selbstaendig', buRisiko: 'buero' },
  { beruf: 'Unternehmensberater', brutto: [65000,120000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Pharma-Managerin', brutto: [80000,130000], segment: 'angestellt', buRisiko: 'buero' },
  // Handwerk / Gewerbe
  { beruf: 'Elektromeister (selbst.)', brutto: [50000,95000], segment: 'selbstaendig', buRisiko: 'handwerk' },
  { beruf: 'Friseurmeisterin (selbst.)', brutto: [30000,55000], segment: 'selbstaendig', buRisiko: 'handwerk' },
  { beruf: 'Gastronom', brutto: [35000,70000], segment: 'selbstaendig', buRisiko: 'handwerk' },
  { beruf: 'Dachdecker', brutto: [35000,50000], segment: 'angestellt', buRisiko: 'koerperlich' },
  { beruf: 'Schreinermeister', brutto: [40000,65000], segment: 'selbstaendig', buRisiko: 'handwerk' },
  // Freelancer / Digital
  { beruf: 'Freelance Grafikdesignerin', brutto: [30000,55000], segment: 'selbstaendig', buRisiko: 'buero' },
  { beruf: 'Freelance Entwickler', brutto: [60000,110000], segment: 'selbstaendig', buRisiko: 'buero' },
  // Niedrig/Mittel
  { beruf: 'Bürokauffrau', brutto: [28000,40000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Einzelhandelskaufmann', brutto: [25000,35000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Altenpflegerin', brutto: [30000,42000], segment: 'angestellt', buRisiko: 'koerperlich' },
  { beruf: 'Erzieher', brutto: [32000,45000], segment: 'angestellt', buRisiko: 'buero' },
  // Ruhestand
  { beruf: 'Rentner', brutto: [0,0], segment: 'rente', buRisiko: 'keine', renteNetto: [1800,3500] },
  { beruf: 'Rentnerin', brutto: [0,0], segment: 'rente', buRisiko: 'keine', renteNetto: [1500,3200] },
  { beruf: 'Pensionär', brutto: [0,0], segment: 'rente', buRisiko: 'keine', renteNetto: [2800,4500] },
];

const VV_BERUFE = [
  { beruf: 'Unternehmer (Maschinenbau)', einkommen: [200000,800000], typ: 'unternehmer' },
  { beruf: 'Unternehmerin (IT/SaaS)', einkommen: [150000,500000], typ: 'unternehmer' },
  { beruf: 'Geschäftsführerin (Mittelstand)', einkommen: [180000,400000], typ: 'unternehmer' },
  { beruf: 'Chefarzt Kardiologie', einkommen: [250000,500000], typ: 'arzt' },
  { beruf: 'Zahnärztin (3 Praxen)', einkommen: [200000,600000], typ: 'arzt' },
  { beruf: 'Rechtsanwalt (Partner)', einkommen: [200000,800000], typ: 'freiberuf' },
  { beruf: 'WP/StB (eigene Kanzlei)', einkommen: [150000,400000], typ: 'freiberuf' },
  { beruf: 'Ex-Vorstand (Ruhestand)', einkommen: [0,0], typ: 'ruhestand', renteNetto: [8000,15000] },
  { beruf: 'Erbin (Familienvermögen)', einkommen: [0,0], typ: 'erbe', renteNetto: [5000,20000] },
  { beruf: 'Tech-Gründer (Post-Exit)', einkommen: [0,100000], typ: 'exit' },
  { beruf: 'Architektin (eigenes Büro)', einkommen: [120000,250000], typ: 'freiberuf' },
  { beruf: 'Privatier', einkommen: [0,0], typ: 'privatier', renteNetto: [6000,25000] },
];

const ARBEITGEBER = [
  'Deutsche Telekom AG','SAP SE','Siemens AG','Bosch GmbH','Continental AG',
  'BASF SE','Bayer AG','Mercedes-Benz','BMW Group','Volkswagen AG',
  'Allianz SE','Deutsche Bank AG','Commerzbank AG','Fresenius SE','Henkel AG',
  'Merck KGaA','ThyssenKrupp AG','Infineon Technologies','Deutsche Post DHL',
  'E.ON SE','RWE AG','Daimler Truck','Adidas AG','Puma SE','Zalando SE',
  'Delivery Hero SE','HelloFresh SE','Rheinmetall AG','MTU Aero Engines',
  'Heidelberg Materials','Covestro AG','Vonovia SE','Symrise AG','Beiersdorf AG',
  'Bezirksregierung','Stadtverwaltung','Landratsamt','Universitätsklinikum',
  'Städtisches Krankenhaus','Caritasverband','Diakonie','AWO',
];

const ARBEITGEBER_SELBST = [
  'Eigene Praxis','Eigenes Büro','Eigene Werkstatt','Eigener Betrieb',
  'Eigene Kanzlei','Eigenes Restaurant','Eigener Salon','Eigene Agentur',
];

const idCounters = { versicherung: 100, banking: 100, vermoegensverwaltung: 100 };

function generateKundenId(modus) {
  const prefix = { versicherung: 'KD', banking: 'BK', vermoegensverwaltung: 'WM' };
  return `${prefix[modus]}${String(idCounters[modus]++).padStart(5, '0')}`;
}

function berechneNetto(brutto) {
  if (brutto <= 0) return 0;
  if (brutto <= 30000) return Math.round(brutto * 0.72 / 12);
  if (brutto <= 60000) return Math.round(brutto * 0.65 / 12);
  if (brutto <= 100000) return Math.round(brutto * 0.58 / 12);
  return Math.round(brutto * 0.54 / 12);
}

function pickBerufForAlter(alter) {
  const eligible = BERUFE.filter(b => {
    if (b.segment === 'rente') return alter >= 63;
    return alter < 67;
  });
  return random(eligible);
}

function generatePartner(alter) {
  const partnerAlter = alter + randomBetween(-5, 5);
  const geschlecht = random(['m', 'w']);
  const vorname = random(geschlecht === 'm' ? VORNAMEN_M : VORNAMEN_W);
  const partnerBeruf = random([
    'Lehrerin', 'Teilzeit Büro', 'Krankenschwester', 'Erzieherin',
    'Ingenieur', 'Kauffrau', 'Verwaltungsangestellte', 'Freiberuflich',
    'Teilzeit Einzelhandel', 'Physiotherapeutin', 'Selbständig',
  ]);
  const einkommen = randomBetween(800, 3500);
  return { name: vorname, beruf: partnerBeruf, einkommen, alter: partnerAlter };
}

function generateKinder(alter, anzahl) {
  const kinder = [];
  const kinderVornamen = shuffle([...VORNAMEN_M.slice(0, 10), ...VORNAMEN_W.slice(0, 10)]);
  for (let i = 0; i < anzahl; i++) {
    const maxKindAlter = Math.max(0, alter - 22);
    const kindAlter = randomBetween(0, Math.min(maxKindAlter, 30));
    kinder.push({ name: kinderVornamen[i] || 'Kind', alter: kindAlter });
  }
  return kinder.sort((a, b) => b.alter - a.alter);
}

const HUNDE_NAMEN = ['Bella','Max','Luna','Buddy','Charlie','Rocky','Mila','Sam','Bruno','Rex','Lola','Balu','Nala','Cooper','Lucky'];
const KATZEN_NAMEN = ['Mietze','Felix','Luna','Simba','Mimi','Lilly','Leo','Nala','Mia','Tiger','Muffin','Cleo','Moritz','Kitty'];

function generateHaustiere(wohnsituation, kinder) {
  // ~30% Wahrscheinlichkeit Haustier-Hinweis aus Kontoumsätzen
  const chance = wohnsituation === 'Eigentum' ? 45 : kinder?.length > 0 ? 35 : 20;
  if (randomBetween(1, 100) > chance) return null;

  const tierhandlung = random(['Fressnapf', 'Das Futterhaus', 'Zooplus.de', 'Zoo & Co', 'Kölle Zoo']);

  return {
    art: 'Vermutung: Haustier',
    quelle: 'kontoumsaetze',
    erkannteTransaktionen: [
      { haendler: tierhandlung, betrag: randomBetween(25, 95), haeufigkeit: 'monatlich' },
      ...(randomBetween(1, 100) > 50 ? [{ haendler: 'Tierarztpraxis', betrag: randomBetween(45, 180), haeufigkeit: 'quartal' }] : []),
    ],
  };
}

export function generatePerson(modus) {
  const geschlecht = random(['m', 'w']);
  const vorname = random(geschlecht === 'm' ? VORNAMEN_M : VORNAMEN_W);
  const nachname = random(NACHNAMEN);

  const alterRange = weightedRandom({
    'jung': 15,     // 22-29
    'aufbau': 25,    // 30-39
    'mitte': 25,     // 40-49
    'pre_ret': 20,   // 50-59
    'senior': 15,    // 60-70
  });
  const alter = {
    jung: randomBetween(22, 29),
    aufbau: randomBetween(30, 39),
    mitte: randomBetween(40, 49),
    pre_ret: randomBetween(50, 59),
    senior: randomBetween(60, 70),
  }[alterRange];

  const berufObj = pickBerufForAlter(alter);
  const brutto = berufObj.brutto[0] === 0 ? 0 : randomBetween(berufObj.brutto[0], berufObj.brutto[1]);
  const netto = berufObj.segment === 'rente'
    ? randomBetween(berufObj.renteNetto[0], berufObj.renteNetto[1])
    : berechneNetto(brutto);

  // Familie
  const familienstand =
    alter < 28 ? weightedRandom({ ledig: 70, verheiratet: 25, geschieden: 5 })
    : alter < 45 ? weightedRandom({ ledig: 20, verheiratet: 65, geschieden: 15 })
    : alter < 60 ? weightedRandom({ ledig: 10, verheiratet: 60, geschieden: 30 })
    : weightedRandom({ ledig: 5, verheiratet: 60, verwitwet: 10, geschieden: 25 });

  const partner = familienstand === 'verheiratet' ? generatePartner(alter) : null;

  const kinderAnzahl =
    alter < 28 ? (randomBetween(0, 100) > 85 ? 1 : 0)
    : alter < 40 ? Number(weightedRandom({ 0: 30, 1: 35, 2: 30, 3: 5 }))
    : alter < 55 ? Number(weightedRandom({ 0: 15, 1: 25, 2: 40, 3: 15, 4: 5 }))
    : Number(weightedRandom({ 0: 10, 1: 20, 2: 40, 3: 25, 4: 5 }));
  const kinder = generateKinder(alter, kinderAnzahl);

  // Wohnsituation
  const wohnsituation =
    alter < 30 ? weightedRandom({ Miete: 90, Eigentum: 10 })
    : alter < 45 ? weightedRandom({ Miete: 50, Eigentum: 50 })
    : weightedRandom({ Miete: 30, Eigentum: 70 });
  const wohnflaeche = wohnsituation === 'Eigentum'
    ? randomBetween(100, 180) : randomBetween(45, 110);

  // Lebenssituation
  const lebenssituation =
    alter < 30 ? 'aufbau'
    : alter < 50 ? (kinder.some(k => k.alter < 6) ? 'familiengruendung' : 'konsolidierung')
    : alter < 62 ? 'pre-retirement'
    : 'ruhestand';

  // Arbeitgeber
  let arbeitgeber = null;
  if (berufObj.segment === 'selbstaendig') {
    arbeitgeber = { name: random(ARBEITGEBER_SELBST), quelle: 'linkedin', bestaetigt: randomBetween(0, 100) > 60 };
  } else if (berufObj.segment !== 'rente') {
    arbeitgeber = { name: random(ARBEITGEBER), quelle: 'linkedin', bestaetigt: randomBetween(0, 100) > 50 };
  }

  // LinkedIn
  const linkedinKontakte =
    berufObj.segment === 'selbstaendig' ? randomBetween(100, 800)
    : berufObj.buRisiko === 'buero' ? randomBetween(200, 1200)
    : randomBetween(0, 150);
  const linkedin = linkedinKontakte > 50
    ? { kontakte: linkedinKontakte, aktivitaet: random(['niedrig', 'mittel', 'hoch']) }
    : null;

  return {
    name: `${vorname} ${nachname}`,
    id: generateKundenId(modus),
    alter,
    geschlecht,
    beruf: berufObj.beruf,
    arbeitgeber,
    bruttoeinkommen: brutto,
    nettoeinkommen: netto,
    familienstand,
    partner,
    kinder,
    wohnsituation,
    wohnflaeche,
    linkedin,
    lebenssituation,
    haustiere: generateHaustiere(wohnsituation, kinder),
    _berufObj: berufObj,
    _modus: modus,
  };
}

export function generateVVPerson() {
  const geschlecht = random(['m', 'w']);
  const vorname = random(geschlecht === 'm' ? VORNAMEN_M : VORNAMEN_W);
  const nachname = random(NACHNAMEN);
  const alter = randomBetween(38, 75);

  const berufObj = random(VV_BERUFE);
  const einkommen = berufObj.einkommen[0] === 0 && !berufObj.renteNetto
    ? 0
    : berufObj.einkommen[0] === 0
    ? 0
    : randomBetween(berufObj.einkommen[0], berufObj.einkommen[1]);
  const netto = berufObj.renteNetto
    ? randomBetween(berufObj.renteNetto[0], berufObj.renteNetto[1])
    : berechneNetto(einkommen);

  const gesamtvermoegen = randomBetween(500000, 35000000);
  const vvSegment = gesamtvermoegen > 5000000 ? 'FairValue' : 'SmartValue';

  const familienstand = alter < 45
    ? weightedRandom({ ledig: 15, verheiratet: 75, geschieden: 10 })
    : weightedRandom({ ledig: 5, verheiratet: 70, verwitwet: 10, geschieden: 15 });
  const partner = familienstand === 'verheiratet' ? generatePartner(alter) : null;

  // VV-Mandanten haben oft erwachsene Kinder
  const kinderAnzahl = Number(weightedRandom({ 0: 10, 1: 25, 2: 40, 3: 20, 4: 5 }));
  let kinder = [];
  if (alter > 50 && kinderAnzahl > 0) {
    for (let i = 0; i < kinderAnzahl; i++) {
      const kindAlter = randomBetween(22, 40);
      const name = random([...VORNAMEN_M.slice(0, 8), ...VORNAMEN_W.slice(0, 8)]);
      kinder.push({ name, alter: kindAlter, eigeneProdukte: randomBetween(0, 100) > 60 });
    }
  } else {
    kinder = generateKinder(alter, kinderAnzahl);
  }

  const wohnsituation = 'Eigentum';
  const wohnflaeche = randomBetween(150, 350);

  // Arbeitgeber
  let arbeitgeber = null;
  if (berufObj.typ === 'unternehmer') {
    arbeitgeber = { name: `${nachname} ${random(['GmbH','GmbH & Co. KG','AG','Holding'])}`, quelle: 'linkedin', bestaetigt: true };
  } else if (!['ruhestand', 'erbe', 'privatier', 'exit'].includes(berufObj.typ)) {
    arbeitgeber = { name: random(['Eigene Praxis', 'Eigene Kanzlei', 'Eigenes Büro', nachname + ' & Partner']), quelle: 'linkedin', bestaetigt: true };
  }

  const linkedin = {
    kontakte: randomBetween(300, 2000),
    aktivitaet: random(['niedrig', 'mittel', 'hoch']),
  };

  return {
    name: geschlecht === 'm' && alter > 55 ? `Dr. ${vorname} ${nachname}` : `${vorname} ${nachname}`,
    id: generateKundenId('vermoegensverwaltung'),
    alter,
    geschlecht,
    beruf: berufObj.beruf,
    arbeitgeber,
    bruttoeinkommen: einkommen,
    nettoeinkommen: netto,
    familienstand,
    partner,
    kinder,
    wohnsituation,
    wohnflaeche,
    linkedin,
    lebenssituation: alter >= 62 ? 'ruhestand' : alter >= 50 ? 'pre-retirement' : 'konsolidierung',
    haustiere: generateHaustiere(wohnsituation, kinder),
    _berufObj: { ...berufObj, segment: 'selbstaendig', buRisiko: 'buero' },
    _modus: 'vermoegensverwaltung',
    _gesamtvermoegen: gesamtvermoegen,
    _vvSegment: vvSegment,
    _vvTyp: berufObj.typ,
  };
}
