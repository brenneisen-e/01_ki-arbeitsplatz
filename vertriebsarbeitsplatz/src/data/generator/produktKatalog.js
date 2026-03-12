// ============================================
// Produkt-Katalog: Versicherung, Banking, VV
// ============================================
import { random, randomBetween } from './utils';

// ═══ KFZ-Modelle nach Vermögensklasse ═══
export const KFZ_MODELLE = {
  retail: ['VW Golf','VW Tiguan','VW Polo','VW Passat','VW T-Roc',
    'Skoda Octavia','Skoda Fabia','Opel Corsa','Opel Astra',
    'Ford Focus','Ford Fiesta','Toyota Corolla','Hyundai i30',
    'Kia Ceed','Seat Leon','Fiat 500','Mini Cooper'],
  gehoben: ['BMW 3er','BMW X1','Audi A3','Audi A4','Audi Q3',
    'Mercedes A-Klasse','Mercedes C-Klasse','Mercedes GLA',
    'VW Tiguan R-Line','Tesla Model 3','Volvo XC40'],
  premium: ['BMW 5er','BMW X5','Mercedes E-Klasse','Mercedes GLE',
    'Audi A6','Audi Q7','Porsche Cayenne','Tesla Model S',
    'Range Rover Sport','Volvo XC90'],
  luxus: ['Porsche 911','Mercedes S-Klasse','BMW 7er','Audi A8',
    'Range Rover','Porsche Taycan','Mercedes AMG GT',
    'Bentley Continental','Maserati Levante'],
};

export function pickKfzModell(person) {
  if (person._gesamtvermoegen > 5000000) return random(KFZ_MODELLE.luxus);
  if (person.bruttoeinkommen > 100000) return random(KFZ_MODELLE.premium);
  if (person.bruttoeinkommen > 60000) return random(KFZ_MODELLE.gehoben);
  return random(KFZ_MODELLE.retail);
}

// ═══ VERSICHERUNGS-PRODUKTE ═══
export const VERSICHERUNGS_PRODUKTE = [
  // Leben
  { id: 'bu', name: 'Berufsunfähigkeitsversicherung', sparte: 'leben',
    praemieRange: [600, 3600], pflicht: true,
    relevanz: (p) => p.alter < 60 && p._berufObj.buRisiko !== 'keine' },
  { id: 'rlv', name: 'Risikolebensversicherung', sparte: 'leben',
    praemieRange: [180, 960],
    relevanz: (p) => p.kinder.length > 0 || p.wohnsituation === 'Eigentum' },
  { id: 'kapital_lv', name: 'Kapitallebensversicherung', sparte: 'leben',
    praemieRange: [1200, 4800],
    relevanz: (p) => p.alter > 35 },
  { id: 'fondspolice', name: 'Fondsgebundene Rentenversicherung', sparte: 'leben',
    praemieRange: [1200, 7200],
    relevanz: (p) => p.alter > 25 && p.alter < 55 },
  { id: 'ruerup', name: 'Rürup-Rente (Basisrente)', sparte: 'leben',
    praemieRange: [1200, 7200],
    relevanz: (p) => p._berufObj.segment === 'selbstaendig' },
  { id: 'riester', name: 'Riester-Rente', sparte: 'leben',
    praemieRange: [600, 2100],
    relevanz: (p) => p._berufObj.segment === 'angestellt' && p.kinder.length > 0 },
  { id: 'sterbegeld', name: 'Sterbegeldversicherung', sparte: 'leben',
    praemieRange: [180, 480],
    relevanz: (p) => p.alter > 55 },
  { id: 'ausbildung', name: 'Ausbildungsversicherung', sparte: 'leben',
    praemieRange: [300, 1200],
    relevanz: (p) => p.kinder.some(k => k.alter < 10) },
  // Kranken
  { id: 'pkv', name: 'Private Krankenversicherung', sparte: 'kranken',
    praemieRange: [3600, 9600],
    relevanz: (p) => p.bruttoeinkommen > 69300 || p._berufObj.segment === 'selbstaendig' || p._berufObj.segment === 'beamtet' },
  { id: 'zahnzusatz', name: 'Zahnzusatzversicherung', sparte: 'kranken',
    praemieRange: [120, 480],
    relevanz: (p) => p.alter > 25 },
  { id: 'pflege', name: 'Pflegezusatzversicherung', sparte: 'kranken',
    praemieRange: [240, 1440],
    relevanz: (p) => p.alter > 40 },
  { id: 'krankentagegeld', name: 'Krankentagegeldversicherung', sparte: 'kranken',
    praemieRange: [360, 1200],
    relevanz: (p) => p._berufObj.segment === 'selbstaendig' },
  // Schaden/Unfall
  { id: 'haftpflicht', name: 'Privathaftpflichtversicherung', sparte: 'schaden',
    praemieRange: [50, 120], pflicht: true,
    relevanz: () => true },
  { id: 'hausrat', name: 'Hausratversicherung', sparte: 'schaden',
    praemieRange: [80, 350],
    relevanz: () => true },
  { id: 'wohngebaeude', name: 'Wohngebäudeversicherung', sparte: 'schaden',
    praemieRange: [250, 800],
    relevanz: (p) => p.wohnsituation === 'Eigentum' },
  { id: 'elementar', name: 'Elementarschadenversicherung', sparte: 'schaden',
    praemieRange: [100, 400],
    relevanz: (p) => p.wohnsituation === 'Eigentum' },
  { id: 'rechtsschutz', name: 'Rechtsschutzversicherung', sparte: 'schaden',
    praemieRange: [150, 450],
    relevanz: (p) => p.alter > 25 },
  { id: 'unfall', name: 'Unfallversicherung', sparte: 'schaden',
    praemieRange: [100, 400],
    relevanz: (p) => p.kinder.length > 0 || p._berufObj.buRisiko === 'koerperlich' },
  { id: 'tierhalter', name: 'Tierhalterhaftpflicht (Hund)', sparte: 'schaden',
    praemieRange: [50, 120],
    relevanz: () => randomBetween(0, 100) > 75 },
  // KFZ
  { id: 'kfz', name: 'Kfz-Versicherung', sparte: 'kfz',
    praemieRange: [300, 1200],
    relevanz: (p) => p.alter >= 18 },
  // Gewerbe
  { id: 'gewerbe_hp', name: 'Gewerbe-Haftpflichtversicherung', sparte: 'gewerbe',
    praemieRange: [300, 1200],
    relevanz: (p) => p._berufObj.segment === 'selbstaendig' },
  { id: 'inhaltsvers', name: 'Geschäftsinhaltsversicherung', sparte: 'gewerbe',
    praemieRange: [200, 800],
    relevanz: (p) => p._berufObj.segment === 'selbstaendig' },
  { id: 'berufshp', name: 'Berufshaftpflicht', sparte: 'gewerbe',
    praemieRange: [150, 2400],
    relevanz: (p) => ['Freelance Grafikdesignerin','Freelance Entwickler','Rechtsanwältin','Unternehmensberater'].includes(p.beruf) },
  { id: 'cyber', name: 'Cyber-Versicherung', sparte: 'gewerbe',
    praemieRange: [200, 800],
    relevanz: (p) => p._berufObj.segment === 'selbstaendig' },
];

// ═══ BANKING-PRODUKTE ═══
export const BANKING_PRODUKTE = [
  { id: 'girokonto', name: 'VR-Girokonto', kategorie: 'konto' },
  { id: 'sparkonto', name: 'VR-Sparkonto', kategorie: 'sparen', saldoRange: [2000, 80000] },
  { id: 'tagesgeld', name: 'VR-Tagesgeld', kategorie: 'sparen', saldoRange: [5000, 100000] },
  { id: 'festgeld', name: 'VR-Festgeld', kategorie: 'sparen', saldoRange: [10000, 200000] },
  { id: 'kreditkarte', name: 'VR-Kreditkarte', kategorie: 'konto' },
  { id: 'depot', name: 'VR-MeinDepot', kategorie: 'anlage', saldoRange: [5000, 200000] },
  { id: 'sparplan', name: 'Union Investment Sparplan', kategorie: 'anlage', rateRange: [50, 1500] },
  { id: 'baufinanzierung', name: 'VR-Baufinanzierung', kategorie: 'kredit', volumenRange: [100000, 500000] },
  { id: 'bauspar', name: 'Schwäbisch Hall Bauspar', kategorie: 'sparen', saldoRange: [5000, 50000] },
  { id: 'ratenkredit', name: 'VR-Ratenkredit', kategorie: 'kredit', volumenRange: [5000, 50000] },
  { id: 'vr_finanzplan', name: 'VR-FinanzPlan', kategorie: 'beratung' },
  // Verbundpartner
  { id: 'rv_kfz', name: 'R+V Kfz-Versicherung', kategorie: 'versicherung_verbund', praemieRange: [300, 1200] },
  { id: 'rv_bu', name: 'R+V Berufsunfähigkeit', kategorie: 'versicherung_verbund', praemieRange: [600, 3600] },
  { id: 'rv_rlv', name: 'R+V Risikoleben', kategorie: 'versicherung_verbund', praemieRange: [120, 600] },
  { id: 'rv_haftpflicht', name: 'R+V Haftpflicht', kategorie: 'versicherung_verbund', praemieRange: [50, 120] },
  { id: 'rv_hausrat', name: 'R+V Hausrat', kategorie: 'versicherung_verbund', praemieRange: [80, 300] },
  { id: 'rv_wohngebaeude', name: 'R+V Wohngebäude', kategorie: 'versicherung_verbund', praemieRange: [250, 800] },
  { id: 'rv_pflege', name: 'R+V Pflegezusatz', kategorie: 'versicherung_verbund', praemieRange: [240, 960] },
  { id: 'union_sparplan', name: 'Union Investment Sparplan', kategorie: 'anlage_verbund', rateRange: [50, 1500] },
  { id: 'union_depot', name: 'Union Investment Depot', kategorie: 'anlage_verbund', saldoRange: [5000, 200000] },
  { id: 'sh_bauspar', name: 'Schwäbisch Hall Bauspar', kategorie: 'verbund', saldoRange: [5000, 60000] },
];

// ═══ VV-PRODUKTE ═══
export const VV_PRODUKTE = [
  { id: 'vv_smartvalue', name: 'SmartValue Mandat', segment: 'SmartValue',
    aumRange: [250000, 3000000], feeRange: [0.6, 0.8],
    relevanz: (p) => p._vvSegment === 'SmartValue' },
  { id: 'vv_fairvalue', name: 'FairValue Individual Mandat', segment: 'FairValue',
    aumRange: [3000000, 30000000], feeRange: [0.7, 1.0],
    relevanz: (p) => p._vvSegment === 'FairValue' },
  { id: 'vv_stiftung', name: 'Stiftungs-Spezialmandat', segment: 'Stiftung',
    aumRange: [2000000, 20000000], feeRange: [0.5, 0.7],
    relevanz: (p) => p._vvSegment === 'Stiftung' },
  { id: 'vv_pe', name: 'Private Equity Beteiligung',
    volumenRange: [100000, 2000000],
    relevanz: (p) => p._gesamtvermoegen > 3000000 },
  { id: 'vv_immofonds', name: 'Offener Immobilienfonds',
    volumenRange: [50000, 500000],
    relevanz: (p) => p._gesamtvermoegen > 1000000 },
  { id: 'vv_infrastruktur', name: 'Infrastruktur-Fonds',
    volumenRange: [200000, 1000000],
    relevanz: (p) => p._gesamtvermoegen > 5000000 },
];

// ═══ Fremd-Institute ═══
export const FREMD_PROFILE = {
  versicherung: {
    banken_digital: ['N26','DKB','ING','Trade Republic','Scalable Capital','comdirect'],
    banken_filiale: ['Sparkasse','Volksbank','Commerzbank','Deutsche Bank','Postbank','Targobank'],
    versicherer: ['Allianz','AXA','HDI','HUK-Coburg','Zurich','Generali',
      'Alte Leipziger','CosmosDirekt','DEVK','Debeka','Signal Iduna','R+V','Gothaer','ARAG','VHV','DKV'],
    pickBank: (p) => {
      if (p.alter < 35) return random(['N26','DKB','ING','Trade Republic']);
      if (p.alter < 50) return random(['ING','DKB','Sparkasse','Commerzbank','comdirect']);
      return random(['Sparkasse','Volksbank','Commerzbank','Deutsche Bank']);
    },
    pickDepot: (p) => {
      if (p.alter < 35) return random(['Trade Republic','Scalable Capital']);
      if (p.alter < 50) return random(['ING','comdirect','Trade Republic','Scalable Capital']);
      return random(['ING','comdirect','DKB']);
    },
    pickBaufi: () => random(['Sparkasse','ING','Commerzbank','Deutsche Bank','Volksbank']),
  },
  banking: {
    versicherer: ['Allianz','AXA','HDI','HUK-Coburg','Zurich','Generali',
      'Alte Leipziger','CosmosDirekt','DEVK','Debeka','Signal Iduna','Gothaer','ARAG'],
    depots: ['Trade Republic','Scalable Capital','comdirect','ING','Commerzbank','Deutsche Bank'],
    tagesgeld: ['ING','DKB','Commerzbank','Deutsche Bank','N26'],
    pickDepot: (p) => {
      if (p.alter < 35) return random(['Trade Republic','Scalable Capital']);
      if (p.alter < 50) return random(['Trade Republic','ING','comdirect','Scalable Capital']);
      return random(['ING','comdirect','Deutsche Bank']);
    },
  },
  vv: {
    privateBanking: ['UBS','Deutsche Bank Wealth Management','Berenberg',
      'Bethmann Bank','BNP Paribas Wealth','Julius Bär',
      'Metzler','Hauck Aufhäuser Lampe','Merck Finck'],
    geschaeftsbanken: ['Deutsche Bank','Commerzbank','UniCredit/HVB'],
    versicherer: ['Allianz','Zurich','AXA','Generali','HDI','Helvetia'],
  },
};
