// ============================================
// Produkt-Katalog: Versicherung, Banking, VV
// ============================================
import { random, randomBetween } from './utils';

// ═══ i18n helpers ═══
import { getLang, tx } from '../../utils/langHelper';

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
  { id: 'bu', get name() { return tx('Berufsunfähigkeitsversicherung', 'Disability Insurance'); }, sparte: 'leben',
    praemieRange: [600, 3600], pflicht: true,
    relevanz: (p) => p.alter < 60 && p._berufObj.buRisiko !== 'keine' },
  { id: 'rlv', get name() { return tx('Risikolebensversicherung', 'Term Life Insurance'); }, sparte: 'leben',
    praemieRange: [180, 960],
    relevanz: (p) => p.kinder.length > 0 || p.wohnsituation === 'Eigentum' },
  { id: 'kapital_lv', get name() { return tx('Kapitallebensversicherung', 'Endowment Life Insurance'); }, sparte: 'leben',
    praemieRange: [1200, 4800],
    relevanz: (p) => p.alter > 35 },
  { id: 'fondspolice', get name() { return tx('Fondsgebundene Rentenversicherung', 'Unit-Linked Pension Insurance'); }, sparte: 'leben',
    praemieRange: [1200, 7200],
    relevanz: (p) => p.alter > 25 && p.alter < 55 },
  { id: 'ruerup', get name() { return tx('Rürup-Rente (Basisrente)', 'Rürup Pension (Basic Pension)'); }, sparte: 'leben',
    praemieRange: [1200, 7200],
    relevanz: (p) => p._berufObj.segment === 'selbstaendig' },
  { id: 'riester', get name() { return tx('Riester-Rente', 'Riester Pension'); }, sparte: 'leben',
    praemieRange: [600, 2100],
    relevanz: (p) => p._berufObj.segment === 'angestellt' && p.kinder.length > 0 },
  { id: 'sterbegeld', get name() { return tx('Sterbegeldversicherung', 'Funeral Expense Insurance'); }, sparte: 'leben',
    praemieRange: [180, 480],
    relevanz: (p) => p.alter > 55 },
  { id: 'ausbildung', get name() { return tx('Ausbildungsversicherung', 'Education Insurance'); }, sparte: 'leben',
    praemieRange: [300, 1200],
    relevanz: (p) => p.kinder.some(k => k.alter < 10) },
  // Kranken
  { id: 'pkv', get name() { return tx('Private Krankenversicherung', 'Private Health Insurance'); }, sparte: 'kranken',
    praemieRange: [3600, 9600],
    relevanz: (p) => p.bruttoeinkommen > 69300 || p._berufObj.segment === 'selbstaendig' || p._berufObj.segment === 'beamtet' },
  { id: 'zahnzusatz', get name() { return tx('Zahnzusatzversicherung', 'Dental Insurance'); }, sparte: 'kranken',
    praemieRange: [120, 480],
    relevanz: (p) => p.alter > 25 },
  { id: 'pflege', get name() { return tx('Pflegezusatzversicherung', 'Long-Term Care Insurance'); }, sparte: 'kranken',
    praemieRange: [240, 1440],
    relevanz: (p) => p.alter > 40 },
  { id: 'krankentagegeld', get name() { return tx('Krankentagegeldversicherung', 'Daily Sickness Allowance Insurance'); }, sparte: 'kranken',
    praemieRange: [360, 1200],
    relevanz: (p) => p._berufObj.segment === 'selbstaendig' },
  // Schaden/Unfall
  { id: 'haftpflicht', get name() { return tx('Privathaftpflichtversicherung', 'Personal Liability Insurance'); }, sparte: 'schaden',
    praemieRange: [50, 120], pflicht: true,
    relevanz: () => true },
  { id: 'hausrat', get name() { return tx('Hausratversicherung', 'Household Contents Insurance'); }, sparte: 'schaden',
    praemieRange: [80, 350],
    relevanz: () => true },
  { id: 'wohngebaeude', get name() { return tx('Wohngebäudeversicherung', 'Residential Building Insurance'); }, sparte: 'schaden',
    praemieRange: [250, 800],
    relevanz: (p) => p.wohnsituation === 'Eigentum' },
  { id: 'elementar', get name() { return tx('Elementarschadenversicherung', 'Natural Hazard Insurance'); }, sparte: 'schaden',
    praemieRange: [100, 400],
    relevanz: (p) => p.wohnsituation === 'Eigentum' },
  { id: 'rechtsschutz', get name() { return tx('Rechtsschutzversicherung', 'Legal Protection Insurance'); }, sparte: 'schaden',
    praemieRange: [150, 450],
    relevanz: (p) => p.alter > 25 },
  { id: 'unfall', get name() { return tx('Unfallversicherung', 'Accident Insurance'); }, sparte: 'schaden',
    praemieRange: [100, 400],
    relevanz: (p) => p.kinder.length > 0 || p._berufObj.buRisiko === 'koerperlich' },
  { id: 'tierhalter', get name() { return tx('Tierhalterhaftpflicht (Hund)', 'Pet Liability Insurance (Dog)'); }, sparte: 'schaden',
    praemieRange: [50, 120],
    relevanz: () => randomBetween(0, 100) > 75 },
  // KFZ
  { id: 'kfz', get name() { return tx('Kfz-Versicherung', 'Motor Vehicle Insurance'); }, sparte: 'kfz',
    praemieRange: [300, 1200],
    relevanz: (p) => p.alter >= 18 },
  // Gewerbe
  { id: 'gewerbe_hp', get name() { return tx('Gewerbe-Haftpflichtversicherung', 'Commercial Liability Insurance'); }, sparte: 'gewerbe',
    praemieRange: [300, 1200],
    relevanz: (p) => p._berufObj.segment === 'selbstaendig' },
  { id: 'inhaltsvers', get name() { return tx('Geschäftsinhaltsversicherung', 'Business Contents Insurance'); }, sparte: 'gewerbe',
    praemieRange: [200, 800],
    relevanz: (p) => p._berufObj.segment === 'selbstaendig' },
  { id: 'berufshp', get name() { return tx('Berufshaftpflicht', 'Professional Liability'); }, sparte: 'gewerbe',
    praemieRange: [150, 2400],
    relevanz: (p) => ['Freelance Grafikdesignerin','Freelance Entwickler','Rechtsanwältin','Unternehmensberater'].includes(p.beruf) },
  { id: 'cyber', get name() { return tx('Cyber-Versicherung', 'Cyber Insurance'); }, sparte: 'gewerbe',
    praemieRange: [200, 800],
    relevanz: (p) => p._berufObj.segment === 'selbstaendig' },
];

// ═══ BANKING-PRODUKTE ═══
export const BANKING_PRODUKTE = [
  { id: 'girokonto', get name() { return tx('VR-Girokonto', 'VR Checking Account'); }, kategorie: 'konto' },
  { id: 'sparkonto', get name() { return tx('VR-Sparkonto', 'VR Savings Account'); }, kategorie: 'sparen', saldoRange: [2000, 80000] },
  { id: 'tagesgeld', get name() { return tx('VR-Tagesgeld', 'VR Money Market Account'); }, kategorie: 'sparen', saldoRange: [5000, 100000] },
  { id: 'festgeld', get name() { return tx('VR-Festgeld', 'VR Fixed-Term Deposit'); }, kategorie: 'sparen', saldoRange: [10000, 200000] },
  { id: 'kreditkarte', get name() { return tx('VR-Kreditkarte', 'VR Credit Card'); }, kategorie: 'konto' },
  { id: 'depot', get name() { return tx('VR-MeinDepot', 'VR MyPortfolio'); }, kategorie: 'anlage', saldoRange: [5000, 200000] },
  { id: 'sparplan', get name() { return tx('Union Investment Sparplan', 'Union Investment Savings Plan'); }, kategorie: 'anlage', rateRange: [50, 1500] },
  { id: 'baufinanzierung', get name() { return tx('VR-Baufinanzierung', 'VR Mortgage'); }, kategorie: 'kredit', volumenRange: [100000, 500000] },
  { id: 'bauspar', get name() { return tx('Schwäbisch Hall Bauspar', 'Schwäbisch Hall Building Savings'); }, kategorie: 'sparen', saldoRange: [5000, 50000] },
  { id: 'ratenkredit', get name() { return tx('VR-Ratenkredit', 'VR Installment Loan'); }, kategorie: 'kredit', volumenRange: [5000, 50000] },
  { id: 'vr_finanzplan', get name() { return tx('VR-FinanzPlan', 'VR Financial Plan'); }, kategorie: 'beratung' },
  // Verbundpartner
  { id: 'rv_kfz', get name() { return tx('R+V Kfz-Versicherung', 'R+V Motor Vehicle Insurance'); }, kategorie: 'versicherung_verbund', praemieRange: [300, 1200] },
  { id: 'rv_bu', get name() { return tx('R+V Berufsunfähigkeit', 'R+V Disability Insurance'); }, kategorie: 'versicherung_verbund', praemieRange: [600, 3600] },
  { id: 'rv_rlv', get name() { return tx('R+V Risikoleben', 'R+V Term Life'); }, kategorie: 'versicherung_verbund', praemieRange: [120, 600] },
  { id: 'rv_haftpflicht', get name() { return tx('R+V Haftpflicht', 'R+V Liability'); }, kategorie: 'versicherung_verbund', praemieRange: [50, 120] },
  { id: 'rv_hausrat', get name() { return tx('R+V Hausrat', 'R+V Household Contents'); }, kategorie: 'versicherung_verbund', praemieRange: [80, 300] },
  { id: 'rv_wohngebaeude', get name() { return tx('R+V Wohngebäude', 'R+V Residential Building'); }, kategorie: 'versicherung_verbund', praemieRange: [250, 800] },
  { id: 'rv_pflege', get name() { return tx('R+V Pflegezusatz', 'R+V Long-Term Care'); }, kategorie: 'versicherung_verbund', praemieRange: [240, 960] },
  { id: 'union_sparplan', get name() { return tx('Union Investment Sparplan', 'Union Investment Savings Plan'); }, kategorie: 'anlage_verbund', rateRange: [50, 1500] },
  { id: 'union_depot', get name() { return tx('Union Investment Depot', 'Union Investment Portfolio'); }, kategorie: 'anlage_verbund', saldoRange: [5000, 200000] },
  { id: 'sh_bauspar', get name() { return tx('Schwäbisch Hall Bauspar', 'Schwäbisch Hall Building Savings'); }, kategorie: 'verbund', saldoRange: [5000, 60000] },
];

// ═══ VV-PRODUKTE ═══
export const VV_PRODUKTE = [
  { id: 'vv_smartvalue', get name() { return tx('SmartValue Mandat', 'SmartValue Mandate'); }, segment: 'SmartValue',
    aumRange: [250000, 3000000], feeRange: [0.6, 0.8],
    relevanz: (p) => p._vvSegment === 'SmartValue' },
  { id: 'vv_fairvalue', get name() { return tx('FairValue Individual Mandat', 'FairValue Individual Mandate'); }, segment: 'FairValue',
    aumRange: [3000000, 30000000], feeRange: [0.7, 1.0],
    relevanz: (p) => p._vvSegment === 'FairValue' },
  { id: 'vv_stiftung', get name() { return tx('Stiftungs-Spezialmandat', 'Foundation Special Mandate'); }, segment: 'Stiftung',
    aumRange: [2000000, 20000000], feeRange: [0.5, 0.7],
    relevanz: (p) => p._vvSegment === 'Stiftung' },
  { id: 'vv_pe', get name() { return tx('Private Equity Beteiligung', 'Private Equity Participation'); },
    volumenRange: [100000, 2000000],
    relevanz: (p) => p._gesamtvermoegen > 3000000 },
  { id: 'vv_immofonds', get name() { return tx('Offener Immobilienfonds', 'Open-End Real Estate Fund'); },
    volumenRange: [50000, 500000],
    relevanz: (p) => p._gesamtvermoegen > 1000000 },
  { id: 'vv_infrastruktur', get name() { return tx('Infrastruktur-Fonds', 'Infrastructure Fund'); },
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
