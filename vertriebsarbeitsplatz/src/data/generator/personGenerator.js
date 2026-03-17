// ============================================
// Personen-Generator
// ============================================
import { random, randomBetween, weightedRandom, shuffle } from './utils';

// --- i18n helpers ---
function getLang() { try { return localStorage.getItem('kia_language') || 'de'; } catch { return 'de'; } }
function tx(de, en) { return getLang() === 'en' ? en : de; }

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

// --- BERUFE (occupations) ---
const BERUFE_DE = [
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

const BERUFE_EN = [
  // Employed
  { beruf: 'IT Project Manager', brutto: [65000,90000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Software Developer', brutto: [55000,85000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'UX Designer', brutto: [45000,65000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Controller', brutto: [50000,75000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Marketing Manager', brutto: [55000,80000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Sales Director', brutto: [70000,100000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'HR Specialist', brutto: [45000,65000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Engineer', brutto: [55000,85000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Teacher', brutto: [45000,65000], segment: 'beamtet', buRisiko: 'buero' },
  { beruf: 'Police Officer', brutto: [42000,58000], segment: 'beamtet', buRisiko: 'koerperlich' },
  // Doctors / High earners
  { beruf: 'Physician (employed)', brutto: [75000,130000], segment: 'angestellt', buRisiko: 'arzt' },
  { beruf: 'Dentist (own practice)', brutto: [100000,200000], segment: 'selbstaendig', buRisiko: 'arzt' },
  { beruf: 'Attorney', brutto: [70000,140000], segment: 'selbstaendig', buRisiko: 'buero' },
  { beruf: 'Management Consultant', brutto: [65000,120000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Pharma Manager', brutto: [80000,130000], segment: 'angestellt', buRisiko: 'buero' },
  // Trades / Business
  { beruf: 'Master Electrician (self-empl.)', brutto: [50000,95000], segment: 'selbstaendig', buRisiko: 'handwerk' },
  { beruf: 'Master Hairdresser (self-empl.)', brutto: [30000,55000], segment: 'selbstaendig', buRisiko: 'handwerk' },
  { beruf: 'Restaurateur', brutto: [35000,70000], segment: 'selbstaendig', buRisiko: 'handwerk' },
  { beruf: 'Roofer', brutto: [35000,50000], segment: 'angestellt', buRisiko: 'koerperlich' },
  { beruf: 'Master Carpenter', brutto: [40000,65000], segment: 'selbstaendig', buRisiko: 'handwerk' },
  // Freelancer / Digital
  { beruf: 'Freelance Graphic Designer', brutto: [30000,55000], segment: 'selbstaendig', buRisiko: 'buero' },
  { beruf: 'Freelance Developer', brutto: [60000,110000], segment: 'selbstaendig', buRisiko: 'buero' },
  // Low/Medium
  { beruf: 'Office Clerk', brutto: [28000,40000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Retail Salesperson', brutto: [25000,35000], segment: 'angestellt', buRisiko: 'buero' },
  { beruf: 'Elderly Care Nurse', brutto: [30000,42000], segment: 'angestellt', buRisiko: 'koerperlich' },
  { beruf: 'Childcare Worker', brutto: [32000,45000], segment: 'angestellt', buRisiko: 'buero' },
  // Retirement
  { beruf: 'Retiree (m)', brutto: [0,0], segment: 'rente', buRisiko: 'keine', renteNetto: [1800,3500] },
  { beruf: 'Retiree (f)', brutto: [0,0], segment: 'rente', buRisiko: 'keine', renteNetto: [1500,3200] },
  { beruf: 'Pensioner', brutto: [0,0], segment: 'rente', buRisiko: 'keine', renteNetto: [2800,4500] },
];

function getBerufe() { return getLang() === 'en' ? BERUFE_EN : BERUFE_DE; }

// --- VV_BERUFE (wealth management occupations) ---
const VV_BERUFE_DE = [
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

const VV_BERUFE_EN = [
  { beruf: 'Entrepreneur (Mechanical Eng.)', einkommen: [200000,800000], typ: 'unternehmer' },
  { beruf: 'Entrepreneur (IT/SaaS)', einkommen: [150000,500000], typ: 'unternehmer' },
  { beruf: 'Managing Director (Mid-Market)', einkommen: [180000,400000], typ: 'unternehmer' },
  { beruf: 'Chief Physician Cardiology', einkommen: [250000,500000], typ: 'arzt' },
  { beruf: 'Dentist (3 Practices)', einkommen: [200000,600000], typ: 'arzt' },
  { beruf: 'Attorney (Partner)', einkommen: [200000,800000], typ: 'freiberuf' },
  { beruf: 'CPA/Tax Advisor (own firm)', einkommen: [150000,400000], typ: 'freiberuf' },
  { beruf: 'Former Executive (retired)', einkommen: [0,0], typ: 'ruhestand', renteNetto: [8000,15000] },
  { beruf: 'Heiress (family wealth)', einkommen: [0,0], typ: 'erbe', renteNetto: [5000,20000] },
  { beruf: 'Tech Founder (Post-Exit)', einkommen: [0,100000], typ: 'exit' },
  { beruf: 'Architect (own office)', einkommen: [120000,250000], typ: 'freiberuf' },
  { beruf: 'Private Investor', einkommen: [0,0], typ: 'privatier', renteNetto: [6000,25000] },
];

function getVVBerufe() { return getLang() === 'en' ? VV_BERUFE_EN : VV_BERUFE_DE; }

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

// --- Self-employed employer labels ---
const ARBEITGEBER_SELBST_DE = [
  'Eigene Praxis','Eigenes Büro','Eigene Werkstatt','Eigener Betrieb',
  'Eigene Kanzlei','Eigenes Restaurant','Eigener Salon','Eigene Agentur',
];

const ARBEITGEBER_SELBST_EN = [
  'Own Practice','Own Office','Own Workshop','Own Business',
  'Own Law Firm','Own Restaurant','Own Salon','Own Agency',
];

function getArbeitgeberSelbst() { return getLang() === 'en' ? ARBEITGEBER_SELBST_EN : ARBEITGEBER_SELBST_DE; }

// --- VV self-employed employer labels ---
const VV_ARBEITGEBER_SELBST_DE = ['Eigene Praxis', 'Eigene Kanzlei', 'Eigenes Büro'];
const VV_ARBEITGEBER_SELBST_EN = ['Own Practice', 'Own Law Firm', 'Own Office'];
function getVVArbeitgeberSelbst() { return getLang() === 'en' ? VV_ARBEITGEBER_SELBST_EN : VV_ARBEITGEBER_SELBST_DE; }

// --- Partner occupations ---
const PARTNER_BERUFE_DE = [
  'Lehrerin', 'Teilzeit Büro', 'Krankenschwester', 'Erzieherin',
  'Ingenieur', 'Kauffrau', 'Verwaltungsangestellte', 'Freiberuflich',
  'Teilzeit Einzelhandel', 'Physiotherapeutin', 'Selbständig',
];
const PARTNER_BERUFE_EN = [
  'Teacher', 'Part-time Office', 'Nurse', 'Childcare Worker',
  'Engineer', 'Clerk', 'Administrative Employee', 'Freelance',
  'Part-time Retail', 'Physiotherapist', 'Self-employed',
];
function getPartnerBerufe() { return getLang() === 'en' ? PARTNER_BERUFE_EN : PARTNER_BERUFE_DE; }

// --- Familienstand helpers ---
function getFamilienstandLabel(key) {
  const labels = {
    de: { ledig: 'ledig', verheiratet: 'verheiratet', geschieden: 'geschieden', verwitwet: 'verwitwet' },
    en: { ledig: 'single', verheiratet: 'married', geschieden: 'divorced', verwitwet: 'widowed' },
  };
  return (labels[getLang()] || labels.de)[key] || key;
}

// --- Wohnsituation helpers ---
function getWohnsituation(key) {
  const labels = {
    de: { Eigentum: 'Eigentum', Miete: 'Miete' },
    en: { Eigentum: 'Ownership', Miete: 'Rental' },
  };
  return (labels[getLang()] || labels.de)[key] || key;
}

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
  const berufe = getBerufe();
  const eligible = berufe.filter(b => {
    if (b.segment === 'rente') return alter >= 63;
    return alter < 67;
  });
  return random(eligible);
}

function generatePartner(alter) {
  const partnerAlter = alter + randomBetween(-5, 5);
  const geschlecht = random(['m', 'w']);
  const vorname = random(geschlecht === 'm' ? VORNAMEN_M : VORNAMEN_W);
  const partnerBeruf = random(getPartnerBerufe());
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
  // ~30% Wahrscheinlichkeit ein Haustier zu haben, höher bei Eigentum/Kindern
  // Compare against internal key, not translated label
  const isEigentum = wohnsituation === 'Eigentum' || wohnsituation === 'Ownership';
  const chance = isEigentum ? 45 : kinder?.length > 0 ? 35 : 20;
  if (randomBetween(1, 100) > chance) return null;

  const art = weightedRandom({ Hund: 45, Katze: 40, Hamster: 5, Kaninchen: 5, Fische: 3, Vogel: 2 });
  const name = art === 'Hund' ? random(HUNDE_NAMEN) : art === 'Katze' ? random(KATZEN_NAMEN) : null;
  const alter = randomBetween(1, 12);

  return {
    art: null,
    typ: null,
    name: null,
    rasse: null,
    vermutet: true,
    quelle: 'kontoumsaetze',
    erkannteTransaktionen: [
      { haendler: art === 'Fische' ? 'Zoo & Co' : 'Fressnapf', betrag: randomBetween(25, 65), haeufigkeit: 'monatlich' },
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
  const familienstandKey =
    alter < 28 ? weightedRandom({ ledig: 70, verheiratet: 25, geschieden: 5 })
    : alter < 45 ? weightedRandom({ ledig: 20, verheiratet: 65, geschieden: 15 })
    : alter < 60 ? weightedRandom({ ledig: 10, verheiratet: 60, geschieden: 30 })
    : weightedRandom({ ledig: 5, verheiratet: 60, verwitwet: 10, geschieden: 25 });
  const familienstand = getFamilienstandLabel(familienstandKey);

  const partner = familienstandKey === 'verheiratet' ? generatePartner(alter) : null;

  const kinderAnzahl =
    alter < 28 ? (randomBetween(0, 100) > 85 ? 1 : 0)
    : alter < 40 ? Number(weightedRandom({ 0: 30, 1: 35, 2: 30, 3: 5 }))
    : alter < 55 ? Number(weightedRandom({ 0: 15, 1: 25, 2: 40, 3: 15, 4: 5 }))
    : Number(weightedRandom({ 0: 10, 1: 20, 2: 40, 3: 25, 4: 5 }));
  const kinder = generateKinder(alter, kinderAnzahl);

  // Wohnsituation
  const wohnsituationKey =
    alter < 30 ? weightedRandom({ Miete: 90, Eigentum: 10 })
    : alter < 45 ? weightedRandom({ Miete: 50, Eigentum: 50 })
    : weightedRandom({ Miete: 30, Eigentum: 70 });
  const wohnsituation = getWohnsituation(wohnsituationKey);
  const wohnflaeche = wohnsituationKey === 'Eigentum'
    ? randomBetween(100, 180) : randomBetween(45, 110);
  const STRASSEN = ['Hauptstr.','Gartenstr.','Bahnhofstr.','Lindenallee','Bergstr.','Waldweg','Ringstr.','Schillerstr.','Goethestr.','Mozartstr.','Kirchstr.','Friedhofstr.','Schulstr.','Industriestr.','Am Markt','Wiesenstr.','Feldstr.','Rosenweg','Birkenweg','Eichenstr.'];
  const STAEDTE_MAP = { versicherung: ['Köln','Bonn','Leverkusen','Bergisch Gladbach','Troisdorf'], banking: ['Gießen','Wetzlar','Marburg','Friedberg','Bad Nauheim'], vermoegensverwaltung: ['Frankfurt am Main','Wiesbaden','Bad Homburg','Kronberg','Königstein'] };
  const staedte = STAEDTE_MAP[modus] || STAEDTE_MAP.versicherung;
  const adresse = `${random(STRASSEN)} ${randomBetween(1, 120)}, ${randomBetween(10000, 99999)} ${random(staedte)}`;

  // Lebenssituation
  const lebenssituation =
    alter < 30 ? 'aufbau'
    : alter < 50 ? (kinder.some(k => k.alter < 6) ? 'familiengruendung' : 'konsolidierung')
    : alter < 62 ? 'pre-retirement'
    : 'ruhestand';

  // Arbeitgeber
  let arbeitgeber = null;
  if (berufObj.segment === 'selbstaendig') {
    arbeitgeber = { name: random(getArbeitgeberSelbst()), quelle: 'linkedin', bestaetigt: randomBetween(0, 100) > 60 };
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
    adresse,
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

  const vvBerufe = getVVBerufe();
  const berufObj = random(vvBerufe);
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

  const familienstandKey = alter < 45
    ? weightedRandom({ ledig: 15, verheiratet: 75, geschieden: 10 })
    : weightedRandom({ ledig: 5, verheiratet: 70, verwitwet: 10, geschieden: 15 });
  const familienstand = getFamilienstandLabel(familienstandKey);
  const partner = familienstandKey === 'verheiratet' ? generatePartner(alter) : null;

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

  const wohnsituation = getWohnsituation('Eigentum');
  const wohnflaeche = randomBetween(150, 350);
  const VV_STRASSEN = ['Taunusanlage','Villenweg','Am Kirchberg','Bockenheimer Landstr.','Palmengarten-Str.','Grüneburgweg','Kennedyallee','Marbachweg','Forsthausstr.','Kronberger Str.'];
  const VV_STAEDTE = ['Frankfurt am Main','Wiesbaden','Bad Homburg','Kronberg im Taunus','Königstein im Taunus','Oberursel'];
  const adresse = `${random(VV_STRASSEN)} ${randomBetween(1, 60)}, ${randomBetween(60000, 65999)} ${random(VV_STAEDTE)}`;

  // Arbeitgeber
  let arbeitgeber = null;
  if (berufObj.typ === 'unternehmer') {
    arbeitgeber = { name: `${nachname} ${random(['GmbH','GmbH & Co. KG','AG','Holding'])}`, quelle: 'linkedin', bestaetigt: true };
  } else if (!['ruhestand', 'erbe', 'privatier', 'exit'].includes(berufObj.typ)) {
    const vvSelbst = getVVArbeitgeberSelbst();
    arbeitgeber = { name: random([...vvSelbst, nachname + ' & Partner']), quelle: 'linkedin', bestaetigt: true };
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
    adresse,
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
