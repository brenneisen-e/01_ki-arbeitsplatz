// ============================================
// Potenzial-Engine: Regelbasierte Ableitung
// ============================================
import { random, randomBetween } from './utils';
import { pickKfzModell } from './produktKatalog';

const PRIO_ORDER = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };

function hatProdukt(p, typ) {
  return p.eigeneProdukte.some(ep => ep.typ === typ);
}

function hatFremd(p, typ) {
  return p.fremdProdukte.some(fp => fp.typ === typ);
}

// ═══ Versicherung ═══
const VERSICHERUNG_REGELN = [
  {
    id: 'bu_fehlt',
    check: (p) => !hatProdukt(p, 'bu') && p.alter < 60 && p._berufObj.buRisiko !== 'keine',
    titel: 'BU-Versicherung fehlt',
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'kritisch',
    volumen: (p) => Math.round(p.nettoeinkommen * 0.8 * 12 * 0.04),
    beschreibung: (p) => `Keine BU vorhanden. ${p.beruf} (${p._berufObj.buRisiko}). Empfehlung: ${Math.round(p.nettoeinkommen * 0.8)}€/mtl. Rente.`,
    produktEmpfehlung: (p) => p._berufObj.buRisiko === 'arzt' ? 'ERGO BU Ärzte-Tarif' : 'ERGO BU Comfort',
    empfohleneAktion: 'angebot_erstellen',
  },
  {
    id: 'haftpflicht_fehlt',
    check: (p) => !hatProdukt(p, 'haftpflicht'),
    titel: 'Haftpflichtversicherung fehlt',
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch',
    volumen: () => randomBetween(65, 95),
    beschreibung: () => 'Existenzbedrohende Lücke. Pflichtversicherung für jeden Haushalt.',
    produktEmpfehlung: 'ERGO Haftpflicht',
    empfohleneAktion: 'angebot_erstellen',
  },
  {
    id: 'rlv_bei_baufi',
    check: (p) => !hatProdukt(p, 'rlv') && p.fremdProdukte.some(f => f.typ === 'baufinanzierung'),
    titel: 'Risikolebensversicherung (Baufi-Absicherung)',
    typ: 'cross_sell', quellen: ['finanztransaktion', 'lebensereignis'], prioritaet: 'hoch',
    volumen: () => randomBetween(180, 540),
    beschreibung: (p) => {
      const baufi = p.fremdProdukte.find(f => f.typ === 'baufinanzierung');
      return `Baufinanzierung ${baufi?.volumen?.toLocaleString('de') || ''}€ ohne RLV-Absicherung.`;
    },
    produktEmpfehlung: 'ERGO Risikoleben',
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'baufi_zinsbindung',
    check: (p) => p.fremdProdukte.some(f => f._zinsbindungEnde && f._zinsbindungEnde <= 2027),
    titel: 'Baufi-Anschlussfinanzierung vorbereiten',
    typ: 'cross_sell', quellen: ['finanztransaktion', 'markt'], prioritaet: 'kritisch',
    volumen: () => 0,
    beschreibung: (p) => {
      const baufi = p.fremdProdukte.find(f => f._zinsbindungEnde);
      return `Zinsbindung endet ${baufi?._zinsbindungEnde}. Jetzt Forward-Darlehen prüfen.`;
    },
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'fondspolice_statt_depot',
    check: (p) => !hatProdukt(p, 'fondspolice') && p.fremdProdukte.some(f => f.typ === 'depot' && f.volumen > 10000),
    titel: 'Fondspolice statt Fremd-Depot',
    typ: 'cross_sell', quellen: ['finanztransaktion', 'bestand'], prioritaet: 'mittel',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'depot')?.volumen || 0,
    beschreibung: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot');
      return `${depot?.volumen?.toLocaleString('de') || ''}€ bei ${depot?.institut || ''} ohne Steuervorteil. ERGO-Fondspolice mit Halbeinkünfteverfahren.`;
    },
    produktEmpfehlung: 'ERGO Rente Balance',
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'pflege_ab_45',
    check: (p) => !hatProdukt(p, 'pflege') && p.alter >= 45,
    titel: 'Pflegezusatzversicherung',
    typ: 'whitespot', quellen: ['bestand', 'lebensereignis'],
    prioritaet: (p) => p.alter >= 55 ? 'hoch' : 'mittel',
    volumen: () => randomBetween(240, 720),
    beschreibung: () => 'Keine Pflegezusatzversicherung. Versorgungslücke bei Pflegefall.',
    produktEmpfehlung: 'ERGO Pflege Comfort',
    empfohleneAktion: 'angebot_erstellen',
  },
  {
    id: 'wohngebaeude_fehlt',
    check: (p) => !hatProdukt(p, 'wohngebaeude') && p.wohnsituation === 'Eigentum',
    titel: 'Wohngebäudeversicherung fehlt',
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch',
    volumen: () => randomBetween(300, 600),
    beschreibung: () => 'Eigenheim ohne Wohngebäudeversicherung. Existenzrisiko bei Brand/Sturm.',
    produktEmpfehlung: 'ERGO Wohngebäude Premium',
    empfohleneAktion: 'angebot_erstellen',
  },
  {
    id: 'ruerup_selbstaendig',
    check: (p) => !hatProdukt(p, 'ruerup') && p._berufObj.segment === 'selbstaendig' && p.alter < 60,
    titel: 'Rürup-Rente (steuerlich absetzbar)',
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch',
    volumen: () => randomBetween(2400, 7200),
    beschreibung: () => 'Selbständig ohne Altersvorsorge. Rürup steuerlich absetzbar bis 27.566€/J.',
    produktEmpfehlung: 'ERGO Rente Garantie Rürup',
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'kfz_fremd',
    check: (p) => !hatProdukt(p, 'kfz') && hatFremd(p, 'kfz'),
    titel: 'Kfz-Wechsel zu ERGO',
    typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'mittel',
    volumen: () => randomBetween(400, 900),
    beschreibung: (p) => {
      const kfz = p.fremdProdukte.find(f => f.typ === 'kfz');
      return `Kfz bei ${kfz?.institut || ''}. ERGO-Bündel-Rabatt prüfen.`;
    },
    produktEmpfehlung: 'ERGO Kfz Comfort',
    empfohleneAktion: 'tarifvergleich',
  },
  {
    id: 'hausrat_fehlt',
    check: (p) => !hatProdukt(p, 'hausrat'),
    titel: 'Hausratversicherung fehlt',
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel',
    volumen: () => randomBetween(80, 200),
    beschreibung: (p) => `Kein Hausrat. ${p.wohnflaeche}qm ${p.wohnsituation}.`,
    produktEmpfehlung: 'ERGO Hausrat Basis',
    empfohleneAktion: 'angebot_erstellen',
  },
  {
    id: 'rechtsschutz_fehlt',
    check: (p) => !hatProdukt(p, 'rechtsschutz') && p.alter > 30,
    titel: 'Rechtsschutzversicherung',
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'niedrig',
    volumen: () => randomBetween(200, 400),
    beschreibung: () => 'Kein Rechtsschutz vorhanden.',
    produktEmpfehlung: 'ERGO Rechtsschutz',
    empfohleneAktion: 'angebot_erstellen',
  },
  {
    id: 'bindungsgespraech',
    check: (p) => p.nps <= 5,
    titel: 'Bindungsgespräch (NPS Detractor)',
    typ: 'beratung', quellen: ['kommunikation'], prioritaet: 'kritisch',
    volumen: () => 0,
    beschreibung: (p) => `NPS ${p.nps}/10 = Detractor. Abwanderungsrisiko hoch. Proaktiv Termin vereinbaren.`,
    empfohleneAktion: 'termin_vereinbaren',
  },
];

// ═══ Banking ═══
const BANKING_REGELN = [
  {
    id: 'rv_bu_fehlt',
    check: (p) => !p.fremdProdukte.some(f => f.typ === 'bu') && !hatProdukt(p, 'rv_bu') && p.alter < 55,
    titel: 'R+V Berufsunfähigkeit',
    typ: 'cross_sell', quellen: ['bestand', 'wettbewerb'], prioritaet: 'hoch',
    volumen: () => randomBetween(800, 2400),
    beschreibung: () => 'Keine BU erkennbar. R+V BU über VR-Verbund anbieten.',
    produktEmpfehlung: 'R+V BU',
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'rv_kfz_statt_fremd',
    check: (p) => p.fremdProdukte.some(f => f.typ === 'kfz'),
    titel: (p) => `R+V Kfz statt ${p.fremdProdukte.find(f => f.typ === 'kfz')?.institut || 'Fremd'}`,
    typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'mittel',
    volumen: () => randomBetween(400, 900),
    beschreibung: (p) => {
      const kfz = p.fremdProdukte.find(f => f.typ === 'kfz');
      return `Kfz bei ${kfz?.institut} (${kfz?.volumen || 0}€/J.). R+V Bündel-Rabatt prüfen.`;
    },
    produktEmpfehlung: 'R+V Kfz-Versicherung',
    empfohleneAktion: 'tarifvergleich',
  },
  {
    id: 'depot_umschichtung',
    check: (p) => p.fremdProdukte.some(f => f.typ === 'depot' && f.volumen > 10000),
    titel: (p) => `Union Investment statt ${p.fremdProdukte.find(f => f.typ === 'depot')?.institut || 'Fremd'}`,
    typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'hoch',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'depot')?.volumen || 0,
    beschreibung: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot');
      return `${depot?.volumen?.toLocaleString('de') || ''}€ bei ${depot?.institut || ''}. Union Investment Sparplan anbieten.`;
    },
    produktEmpfehlung: 'Union Investment UniGlobal Vorsorge',
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'tagesgeld_konsolidierung',
    check: (p) => p.fremdProdukte.some(f => f.typ === 'tagesgeld' && f.volumen > 10000),
    titel: 'Tagesgeld-Konsolidierung',
    typ: 'anpassung', quellen: ['finanztransaktion'], prioritaet: 'mittel',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'tagesgeld')?.volumen || 0,
    beschreibung: (p) => {
      const tg = p.fremdProdukte.find(f => f.typ === 'tagesgeld');
      return `${tg?.volumen?.toLocaleString('de') || ''}€ bei ${tg?.institut || ''}. VR-Tagesgeld oder VR-FinanzPlan.`;
    },
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'bauspar_eigentum',
    check: (p) => p.wohnsituation === 'Miete' && p.alter < 40 && !hatProdukt(p, 'bauspar'),
    titel: 'Schwäbisch Hall Bauspar (Eigentumsplanung)',
    typ: 'whitespot', quellen: ['bestand', 'lebensereignis'], prioritaet: 'mittel',
    volumen: () => randomBetween(10000, 40000),
    beschreibung: () => 'Zur Miete, unter 40: Bauspar für Eigentumsplanung.',
    produktEmpfehlung: 'Schwäbisch Hall Fuchs Bauspar',
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'vr_finanzplan',
    check: (p) => !hatProdukt(p, 'vr_finanzplan') && p.eigeneProdukte.length >= 2,
    titel: 'VR-FinanzPlan erstellen',
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel',
    volumen: () => 0,
    beschreibung: () => 'Kein ganzheitlicher Finanzplan vorhanden. VR-FinanzPlan als Gesamtkonzept.',
    produktEmpfehlung: 'VR-FinanzPlan',
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'rv_haftpflicht',
    check: (p) => !p.fremdProdukte.some(f => f.typ === 'haftpflicht') && !hatProdukt(p, 'rv_haftpflicht'),
    titel: 'R+V Haftpflicht',
    typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'hoch',
    volumen: () => randomBetween(60, 110),
    beschreibung: () => 'Keine Haftpflicht erkennbar. R+V Haftpflicht über VR-Verbund.',
    produktEmpfehlung: 'R+V Haftpflicht',
    empfohleneAktion: 'angebot_erstellen',
  },
  {
    id: 'bindungsgespraech',
    check: (p) => p.nps <= 5,
    titel: 'Bindungsgespräch (NPS Detractor)',
    typ: 'beratung', quellen: ['kommunikation'], prioritaet: 'kritisch',
    volumen: () => 0,
    beschreibung: (p) => `NPS ${p.nps}/10. Proaktiv Termin vereinbaren.`,
    empfohleneAktion: 'termin_vereinbaren',
  },
];

// ═══ Vermögensverwaltung ═══
const VV_REGELN = [
  {
    id: 'fremdbank_konsolidierung',
    check: (p) => p.fremdProdukte.some(f => f.typ === 'depot_privat'),
    titel: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot_privat');
      return `Fremdbank-Konsolidierung ${depot?.institut || ''}`;
    },
    typ: 'whitespot', quellen: ['wettbewerb'], prioritaet: 'hoch',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'depot_privat')?.volumen || 0,
    beschreibung: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot_privat');
      return `${((depot?.volumen || 0) / 1000000).toFixed(1)}M€ bei ${depot?.institut || ''}. In HRK LUNIS Mandat konsolidieren.`;
    },
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'cash_konsolidierung',
    check: (p) => p.fremdProdukte.some(f => f.typ === 'tagesgeld' && f.volumen > 200000),
    titel: 'Cash-Konsolidierung (Opportunitätskosten!)',
    typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'kritisch',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'tagesgeld')?.volumen || 0,
    beschreibung: (p) => {
      const cash = p.fremdProdukte.find(f => f.typ === 'tagesgeld');
      return `${((cash?.volumen || 0) / 1000).toFixed(0)}k€ Cash bei ${cash?.institut || ''}. Opportunitätskosten ~${Math.round((cash?.volumen || 0) * 0.04 / 1000)}k€/J.`;
    },
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'nextgen_mandat',
    check: (p) => p.kinder.some(k => k.alter >= 25 && !k.eigeneProdukte),
    titel: (p) => {
      const kind = p.kinder.find(k => k.alter >= 25 && !k.eigeneProdukte);
      return `NextGen-Mandat ${kind?.name || ''}`;
    },
    typ: 'whitespot', quellen: ['lebensereignis', 'bestand'], prioritaet: 'hoch',
    volumen: () => randomBetween(200000, 500000),
    beschreibung: (p) => {
      const kind = p.kinder.find(k => k.alter >= 25 && !k.eigeneProdukte);
      return `${kind?.name || ''} (${kind?.alter || ''}) hat kein eigenes Mandat. SmartValue als Einstieg.`;
    },
    produktEmpfehlung: 'SmartValue Mandat',
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'mandatstyp_upgrade',
    check: (p) => p._vvSegment === 'SmartValue' && p._gesamtvermoegen > 4000000,
    titel: 'Mandats-Upgrade SmartValue auf FairValue',
    typ: 'anpassung', quellen: ['bestand'], prioritaet: 'mittel',
    volumen: () => 0,
    beschreibung: (p) => `Gesamtvermögen ${(p._gesamtvermoegen / 1000000).toFixed(1)}M€ rechtfertigt FairValue Individual.`,
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'nachfolgeplanung',
    check: (p) => p.alter >= 58 && p.fremdProdukte.some(f => f.typ === 'unternehmensbeteiligung'),
    titel: 'Nachfolgeplanung anstoßen',
    typ: 'cross_sell', quellen: ['lebensereignis', 'bestand'], prioritaet: 'hoch',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'unternehmensbeteiligung')?.volumen || 0,
    beschreibung: (p) => {
      const bet = p.fremdProdukte.find(f => f.typ === 'unternehmensbeteiligung');
      return `${p.alter} Jahre, ${bet?.details || ''}. Verkauf in 3-5 Jahren? Erlös in VV-Mandat.`;
    },
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'stiftungsgruendung',
    check: (p) => p.alter >= 55 && p._gesamtvermoegen > 10000000,
    titel: 'Stiftungsgründung empfehlen',
    typ: 'whitespot', quellen: ['lebensereignis', 'bestand'], prioritaet: 'mittel',
    volumen: () => randomBetween(500000, 2000000),
    beschreibung: () => 'Vermögens- und Alterssituation qualifiziert für Stiftungsgründung.',
    produktEmpfehlung: 'HRK LUNIS Stiftungsmanagement',
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'pe_allokation',
    check: (p) => p._gesamtvermoegen > 5000000 && !hatProdukt(p, 'vv_pe'),
    titel: 'Private Equity Beteiligung anbieten',
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel',
    volumen: (p) => Math.round(p._gesamtvermoegen * 0.05),
    beschreibung: () => 'Keine PE-Allokation im Portfolio. Diversifikation + Rendite-Uplift.',
    produktEmpfehlung: 'HRK LUNIS PE Fund V',
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'lv_ablauf',
    check: (p) => p.fremdProdukte.some(f => f.typ === 'rlv' && f.details?.includes('Ablauf')),
    titel: (p) => {
      const lv = p.fremdProdukte.find(f => f.typ === 'rlv' && f.details?.includes('Ablauf'));
      return `LV-Ablauf Wiederanlage (${lv?.institut || ''})`;
    },
    typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'hoch',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'rlv' && f.details?.includes('Ablauf'))?.volumen || 0,
    beschreibung: (p) => {
      const lv = p.fremdProdukte.find(f => f.typ === 'rlv' && f.details?.includes('Ablauf'));
      return `${lv?.institut || ''} LV ${lv?.details || ''}. Auszahlung in VV-Mandat integrieren.`;
    },
    empfohleneAktion: 'termin_vereinbaren',
  },
  {
    id: 'family_office',
    check: (p) => p._gesamtvermoegen > 15000000,
    titel: 'WERTIQ Family Office Anbindung',
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel',
    volumen: () => 0,
    beschreibung: (p) => `Gesamtvermögen ${(p._gesamtvermoegen / 1000000).toFixed(0)}M€ qualifiziert für Family Office Service.`,
    produktEmpfehlung: 'WERTIQ Family Office',
    empfohleneAktion: 'termin_vereinbaren',
  },
];

// ═══ Haupt-Evaluation ═══
export function evaluatePotentiale(person) {
  const regeln = person._modus === 'versicherung' ? VERSICHERUNG_REGELN
    : person._modus === 'banking' ? BANKING_REGELN
    : VV_REGELN;

  const statusOptions = ['identifiziert', 'angeschrieben', 'termin', 'abgeschlossen'];

  return regeln
    .filter(r => r.check(person))
    .map(r => ({
      titel: typeof r.titel === 'function' ? r.titel(person) : r.titel,
      typ: r.typ,
      quellen: r.quellen,
      prioritaet: typeof r.prioritaet === 'function' ? r.prioritaet(person) : r.prioritaet,
      volumen: typeof r.volumen === 'function' ? r.volumen(person) : (r.volumen || 0),
      volumenTyp: r.typ === 'cross_sell' && typeof r.volumen === 'function' && r.volumen(person) === 0
        ? 'vermittlung'
        : (typeof r.volumen === 'function' && r.volumen(person) > 5000 ? 'einmalig' : 'jaehrlich'),
      beschreibung: typeof r.beschreibung === 'function' ? r.beschreibung(person) : (r.beschreibung || ''),
      empfohleneAktion: r.empfohleneAktion || 'termin_vereinbaren',
      produktEmpfehlung: typeof r.produktEmpfehlung === 'function' ? r.produktEmpfehlung(person) : (r.produktEmpfehlung || ''),
      status: random(statusOptions),
    }))
    .sort((a, b) => (PRIO_ORDER[a.prioritaet] || 3) - (PRIO_ORDER[b.prioritaet] || 3));
}
