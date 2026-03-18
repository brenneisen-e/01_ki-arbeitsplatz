// ============================================
// Potenzial-Engine: Regelbasierte Ableitung
// ============================================
import { random, randomBetween } from './utils';
import { pickKfzModell } from './produktKatalog';

import { getLang, tx } from '../../utils/langHelper';

const PRIO_ORDER = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };

function hatProdukt(p, typ) {
  return p.eigeneProdukte.some(ep => ep.typ === typ);
}

function hatFremd(p, typ) {
  return p.fremdProdukte.some(fp => fp.typ === typ);
}

function fmtEur(v) {
  return v.toLocaleString(getLang() === 'en' ? 'en-US' : 'de-DE') + (getLang() === 'en' ? '$' : '€');
}

// ═══ Versicherung ═══
const VERSICHERUNG_REGELN = [
  {
    id: 'bu_fehlt',
    check: (p) => !hatProdukt(p, 'bu') && p.alter < 60 && p._berufObj.buRisiko !== 'keine',
    titel: (p) => tx('Erhöhung Abdeckung Berufsunfähigkeitsversicherung', 'Increase Disability Coverage'),
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'kritisch',
    volumen: (p) => Math.round(p.nettoeinkommen * 0.8 * 12 * 0.04),
    beschreibung: (p) => `Keine BU vorhanden. ${p.beruf} (${p._berufObj.buRisiko}). Empfehlung: ${Math.round(p.nettoeinkommen * 0.8)}€/mtl. Rente.`,
    produktEmpfehlung: (p) => p._berufObj.buRisiko === 'arzt' ? 'ERGO BU Ärzte-Tarif' : 'ERGO BU Comfort',
    empfohleneAktion: 'angebot_erstellen',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'PSD2-Gehaltsanalyse + Bestandsdaten' },
      { label: 'Beruf / Risikoklasse', value: `${p.beruf} (${p._berufObj.buRisiko})` },
      { label: 'Aktuelles Nettoeinkommen', value: `${fmtEur(p.nettoeinkommen)}/mtl.` },
      { label: 'Aktuelle BU-Absicherung', value: '0€/mtl. (keine BU vorhanden)' },
      { label: 'Empfohlene Absicherung', value: `${fmtEur(Math.round(p.nettoeinkommen * 0.8))}/mtl. (80% d. Nettoeinkommens)` },
      { label: 'Deckungslücke', value: `${fmtEur(Math.round(p.nettoeinkommen * 0.8))}/mtl.` },
    ],
    deckungsluecke: (p) => ({
      label: 'BU-Absicherung vs. Nettoeinkommen',
      gehalt: p.nettoeinkommen,
      aktuelleAbsicherung: 0,
      empfohleneAbsicherung: Math.round(p.nettoeinkommen * 0.8),
      einheit: '€/mtl.',
    }),
  },
  {
    id: 'haftpflicht_fehlt',
    check: (p) => !hatProdukt(p, 'haftpflicht'),
    titel: tx('Haftpflichtversicherung fehlt', 'Liability Insurance Missing'),
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch',
    volumen: () => randomBetween(65, 95),
    beschreibung: () => 'Existenzbedrohende Lücke. Pflichtversicherung für jeden Haushalt.',
    produktEmpfehlung: 'ERGO Haftpflicht',
    empfohleneAktion: 'angebot_erstellen',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'Bestandsanalyse' },
      { label: 'Erkannte Situation', value: 'Keine Privathaftpflicht im Bestand' },
      { label: 'Haushaltsgröße', value: p.partner ? `2 Erwachsene${p.kinder?.length ? `, ${p.kinder.length} Kind${p.kinder.length > 1 ? 'er' : ''}` : ''}` : `Single${p.kinder?.length ? ` mit ${p.kinder.length} Kind${p.kinder.length > 1 ? 'er' : ''}` : ''}` },
      { label: 'Empfehlung', value: p.partner ? 'ERGO Haftpflicht Familie, ab 65€/J.' : 'ERGO Haftpflicht Single, ab 45€/J.' },
    ],
  },
  {
    id: 'rlv_bei_baufi',
    check: (p) => !hatProdukt(p, 'rlv') && p.fremdProdukte.some(f => f.typ === 'baufinanzierung'),
    titel: tx('Risikolebensversicherung (Baufi-Absicherung)', 'Term Life Insurance (Mortgage Protection)'),
    typ: 'cross_sell', quellen: ['finanztransaktion', 'lebensereignis'], prioritaet: 'hoch',
    volumen: () => randomBetween(180, 540),
    beschreibung: (p) => {
      const baufi = p.fremdProdukte.find(f => f.typ === 'baufinanzierung');
      return `Baufinanzierung ${baufi?.volumen?.toLocaleString('de') || ''}€ ohne RLV-Absicherung.`;
    },
    produktEmpfehlung: 'ERGO Risikoleben',
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => {
      const baufi = p.fremdProdukte.find(f => f.typ === 'baufinanzierung');
      return [
        { label: 'Datenquelle', value: `Open Finance – Kreditdaten (${baufi?.institut || 'Bank'})` },
        { label: 'Baufinanzierung', value: `${fmtEur(baufi?.volumen || 0)} bei ${baufi?.institut || 'Fremdbank'}` },
        { label: 'Familiensituation', value: p.partner ? `Verheiratet${p.kinder?.length ? `, ${p.kinder.length} Kind${p.kinder.length > 1 ? 'er' : ''}` : ''}` : 'Alleinlebend' },
        { label: 'Absicherung vorhanden', value: 'Keine RLV im Bestand' },
        { label: 'Empfehlung', value: `RLV ${fmtEur(baufi?.volumen || 300000)} Versicherungssumme, 20 Jahre Laufzeit, ca. 25€/Monat` },
      ];
    },
  },
  {
    id: 'baufi_zinsbindung',
    check: (p) => p.fremdProdukte.some(f => f._zinsbindungEnde && f._zinsbindungEnde <= 2027),
    titel: tx('Baufi-Anschlussfinanzierung vorbereiten', 'Prepare Mortgage Refinancing'),
    typ: 'cross_sell', quellen: ['finanztransaktion', 'markt'], prioritaet: 'kritisch',
    volumen: () => 0,
    beschreibung: (p) => {
      const baufi = p.fremdProdukte.find(f => f._zinsbindungEnde);
      return `Zinsbindung endet ${baufi?._zinsbindungEnde}. Jetzt Forward-Darlehen prüfen.`;
    },
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => {
      const baufi = p.fremdProdukte.find(f => f._zinsbindungEnde);
      const aktZins = randomBetween(12, 22) / 10;
      const neuZins = randomBetween(28, 38) / 10;
      return [
        { label: 'Datenquelle', value: `Open Finance – Kreditdaten (${baufi?.institut || 'Bank'})` },
        { label: 'Restschuld (geschätzt)', value: fmtEur(baufi?.volumen || 200000) },
        { label: 'Zinsbindung endet', value: `${baufi?._zinsbindungEnde || '2027'}` },
        { label: 'Aktueller Zinssatz', value: `${aktZins.toFixed(2)}% (Abschluss ${(baufi?._zinsbindungEnde || 2027) - 10})` },
        { label: 'Markt-Zinsniveau aktuell', value: `${neuZins.toFixed(2)}% (Forward ab ${(neuZins - 0.3).toFixed(2)}%)` },
        { label: 'Empfehlung', value: 'Forward-Darlehen jetzt sichern, bevor Zinsbindung ausläuft' },
      ];
    },
    vergleich: (p) => {
      const baufi = p.fremdProdukte.find(f => f._zinsbindungEnde);
      const restschuld = baufi?.volumen || 200000;
      const aktZins = randomBetween(12, 22) / 10;
      const forwardZins = randomBetween(30, 36) / 10;
      const monatsrateAlt = Math.round(restschuld * (aktZins / 100) / 12);
      const monatsrateNeu = Math.round(restschuld * (forwardZins / 100) / 12);
      return {
        titel: `Vergleich: Aktuelle Konditionen vs. Forward-Darlehen`,
        spalten: ['Merkmal', `${baufi?.institut || 'Bank'} (aktuell)`, 'Forward-Darlehen'],
        zeilen: [
          { merkmal: 'Zinssatz', aktuell: `${aktZins.toFixed(2)}%`, angebot: `${forwardZins.toFixed(2)}%`, highlight: false },
          { merkmal: 'Restschuld', aktuell: fmtEur(restschuld), angebot: fmtEur(restschuld) },
          { merkmal: 'Zinskosten/Monat', aktuell: fmtEur(monatsrateAlt), angebot: fmtEur(monatsrateNeu) },
          { merkmal: 'Zinsbindung', aktuell: `bis ${baufi?._zinsbindungEnde || 2027}`, angebot: '10 Jahre', highlight: true },
          { merkmal: 'Planungssicherheit', aktuell: 'Nur bis Ablauf', angebot: 'Jetzt sichern', highlight: true },
        ],
      };
    },
  },
  {
    id: 'fondspolice_statt_depot',
    check: (p) => !hatProdukt(p, 'fondspolice') && p.fremdProdukte.some(f => f.typ === 'depot' && f.volumen > 10000),
    titel: tx('Fondspolice statt Fremd-Depot', 'Fund Policy Instead of External Depot'),
    typ: 'cross_sell', quellen: ['finanztransaktion', 'bestand'], prioritaet: 'mittel',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'depot')?.volumen || 0,
    beschreibung: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot');
      return `${depot?.volumen?.toLocaleString('de') || ''}€ bei ${depot?.institut || ''} ohne Steuervorteil. ERGO-Fondspolice mit Halbeinkünfteverfahren.`;
    },
    produktEmpfehlung: 'ERGO Rente Balance',
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot');
      const vol = depot?.volumen || 30000;
      const rendite = Math.round(vol * 0.07);
      const steuerDepot = Math.round(rendite * 0.26375);
      const steuerPolice = Math.round(rendite * 0.5 * 0.26375);
      return [
        { label: 'Datenquelle', value: `Open Finance – Depotwerte (${depot?.institut || 'Fremdbank'})` },
        { label: 'Depot-Volumen', value: `${fmtEur(vol)} bei ${depot?.institut || 'Fremdbank'}` },
        { label: 'Angenommene Rendite', value: `7% p.a. = ${fmtEur(rendite)}/J.` },
        { label: 'Steuer Depot (AbgSt.)', value: `${fmtEur(steuerDepot)}/J. (26,375% auf Gewinne)` },
        { label: 'Steuer Fondspolice', value: `${fmtEur(steuerPolice)}/J. (Halbeinkünfte nach 12J.)` },
        { label: 'Jährliche Ersparnis', value: `${fmtEur(steuerDepot - steuerPolice)}/J. durch Halbeinkünfteverfahren` },
      ];
    },
    vergleich: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot');
      const vol = depot?.volumen || 30000;
      const rendite = Math.round(vol * 0.07);
      return {
        titel: `Vergleich: Depot (${depot?.institut || 'Fremdbank'}) vs. ERGO Fondspolice`,
        spalten: ['Merkmal', `Depot (${depot?.institut || 'aktuell'})`, 'ERGO Rente Balance'],
        zeilen: [
          { merkmal: 'Depotvolumen', aktuell: fmtEur(vol), angebot: fmtEur(vol) },
          { merkmal: 'Besteuerung Gewinne', aktuell: '26,375% AbgSt.', angebot: 'Halbeinkünfte (12J.)', highlight: true },
          { merkmal: 'Steuer bei 7% Rendite', aktuell: fmtEur(Math.round(rendite * 0.26375)), angebot: fmtEur(Math.round(rendite * 0.5 * 0.26375)), highlight: true },
          { merkmal: 'Fondsauswahl', aktuell: 'Unbeschränkt', angebot: '100+ ETFs & Fonds' },
          { merkmal: 'Garantie', aktuell: 'Keine', angebot: 'Optional 60-90%', highlight: true },
          { merkmal: 'Flexibilität', aktuell: 'Jederzeit verfügbar', angebot: 'Ab 62 J. oder Kündigung' },
        ],
      };
    },
  },
  {
    id: 'pflege_ab_45',
    check: (p) => !hatProdukt(p, 'pflege') && p.alter >= 45,
    titel: tx('Pflegezusatzversicherung', 'Supplementary Care Insurance'),
    typ: 'whitespot', quellen: ['bestand', 'lebensereignis'],
    prioritaet: (p) => p.alter >= 55 ? 'hoch' : 'mittel',
    volumen: () => randomBetween(240, 720),
    beschreibung: () => 'Keine Pflegezusatzversicherung. Versorgungslücke bei Pflegefall.',
    produktEmpfehlung: 'ERGO Pflege Comfort',
    empfohleneAktion: 'angebot_erstellen',
    herleitung: (p) => {
      const kostenHeim = 4500;
      const gkvLeistung = 2005;
      const luecke = kostenHeim - gkvLeistung;
      return [
        { label: 'Datenquelle', value: 'Bestandsanalyse + demografische Daten' },
        { label: 'Alter', value: `${p.alter} Jahre` },
        { label: 'Pflegeheim-Kosten (Durchschnitt)', value: `${fmtEur(kostenHeim)}/mtl.` },
        { label: 'GKV-Leistung (Pflegegrad 3)', value: `${fmtEur(gkvLeistung)}/mtl.` },
        { label: 'Versorgungslücke', value: `${fmtEur(luecke)}/mtl. Eigenanteil` },
        { label: 'Empfehlung', value: `ERGO Pflege Comfort, ${fmtEur(luecke)} Pflegerente, ab ${p.alter < 50 ? '35' : p.alter < 55 ? '55' : '85'}€/mtl.` },
      ];
    },
    deckungsluecke: (p) => ({
      label: 'Pflegekosten-Absicherung',
      gehalt: 4500,
      gehaltLabel: 'Heim-Kosten',
      aktuelleAbsicherung: 2005,
      absicherungLabel: 'GKV-Leistung',
      empfohleneAbsicherung: 4500,
      einheit: '€/mtl.',
    }),
  },
  {
    id: 'wohngebaeude_fehlt',
    check: (p) => !hatProdukt(p, 'wohngebaeude') && p.wohnsituation === 'Eigentum',
    titel: tx('Wohngebäudeversicherung fehlt', 'Building Insurance Missing'),
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch',
    volumen: () => randomBetween(300, 600),
    beschreibung: () => 'Eigenheim ohne Wohngebäudeversicherung. Existenzrisiko bei Brand/Sturm.',
    produktEmpfehlung: 'ERGO Wohngebäude Premium',
    empfohleneAktion: 'angebot_erstellen',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'Bestandsanalyse + Immobiliendaten' },
      { label: 'Wohnsituation', value: `Eigentum, ${p.wohnflaeche || 120}qm` },
      { label: 'Gebäudeversicherung', value: 'Nicht vorhanden' },
      { label: 'Risiko', value: 'Existenzbedrohend bei Brand, Sturm, Leitungswasser' },
      { label: 'Empfehlung', value: `ERGO Wohngebäude Premium, ca. ${randomBetween(25, 50)}€/mtl.` },
    ],
  },
  {
    id: 'ruerup_selbstaendig',
    check: (p) => !hatProdukt(p, 'ruerup') && p._berufObj.segment === 'selbstaendig' && p.alter < 60,
    titel: tx('Rürup-Rente (steuerlich absetzbar)', 'Rürup Pension (Tax Deductible)'),
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'hoch',
    volumen: () => randomBetween(2400, 7200),
    beschreibung: () => 'Selbständig ohne Altersvorsorge. Rürup steuerlich absetzbar bis 27.566€/J.',
    produktEmpfehlung: 'ERGO Rente Garantie Rürup',
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => {
      const maxAbsetzbar = 27566;
      const empfBeitrag = Math.min(maxAbsetzbar, Math.round(p.bruttoeinkommen * 0.1));
      const steuerErsparnis = Math.round(empfBeitrag * 0.42);
      return [
        { label: 'Datenquelle', value: 'Bestandsdaten + Steueranalyse' },
        { label: 'Berufsstatus', value: `Selbständig (${p.beruf})` },
        { label: 'Keine gesetzl. Rentenversicherung', value: 'Keine Pflichtbeiträge → hohe Versorgungslücke' },
        { label: 'Max. steuerlich absetzbar', value: `${fmtEur(maxAbsetzbar)}/J. (2026)` },
        { label: 'Empfohlener Beitrag', value: `${fmtEur(empfBeitrag)}/J.` },
        { label: 'Steuerersparnis (geschätzt)', value: `${fmtEur(steuerErsparnis)}/J. bei 42% Grenzsteuersatz` },
      ];
    },
  },
  {
    id: 'kfz_fremd',
    check: (p) => !hatProdukt(p, 'kfz') && hatFremd(p, 'kfz'),
    titel: tx('Kfz-Wechsel zu ERGO', 'Car Insurance Switch to ERGO'),
    typ: 'cross_sell', quellen: ['wettbewerb'], prioritaet: 'mittel',
    volumen: () => randomBetween(400, 900),
    beschreibung: (p) => {
      const kfz = p.fremdProdukte.find(f => f.typ === 'kfz');
      return `Kfz bei ${kfz?.institut || ''}. ERGO-Bündel-Rabatt prüfen.`;
    },
    produktEmpfehlung: 'ERGO Kfz Comfort',
    empfohleneAktion: 'tarifvergleich',
    herleitung: (p) => {
      const kfz = p.fremdProdukte.find(f => f.typ === 'kfz');
      const fremdPraemie = kfz?.volumen || randomBetween(500, 900);
      const ergoPraemie = Math.round(fremdPraemie * 0.82);
      return [
        { label: 'Datenquelle', value: 'Wettbewerbsanalyse (Fremdvertrag erkannt)' },
        { label: 'Aktueller Versicherer', value: kfz?.institut || 'Fremdversicherer' },
        { label: 'Fahrzeug', value: kfz?.details || pickKfzModell(p) || 'Pkw' },
        { label: 'Aktuelle Jahresprämie', value: `${fmtEur(fremdPraemie)}/J.` },
        { label: 'ERGO-Angebot (geschätzt)', value: `${fmtEur(ergoPraemie)}/J. inkl. Bündelrabatt` },
        { label: 'Ersparnis', value: `${fmtEur(fremdPraemie - ergoPraemie)}/J. (${Math.round((1 - ergoPraemie / fremdPraemie) * 100)}%)` },
      ];
    },
    vergleich: (p) => {
      const kfz = p.fremdProdukte.find(f => f.typ === 'kfz');
      const fremdPraemie = kfz?.volumen || randomBetween(500, 900);
      const ergoPraemie = Math.round(fremdPraemie * 0.82);
      return {
        titel: `Vergleich: ${kfz?.institut || 'Fremdversicherer'} (aktuell) vs. ERGO Kfz`,
        spalten: ['Merkmal', `${kfz?.institut || 'Aktuell'}`, 'ERGO Kfz Comfort'],
        zeilen: [
          { merkmal: 'Jahresprämie', aktuell: fmtEur(fremdPraemie), angebot: fmtEur(ergoPraemie), highlight: true },
          { merkmal: 'Vollkasko SB', aktuell: '300€', angebot: '300€' },
          { merkmal: 'Teilkasko SB', aktuell: '150€', angebot: '150€' },
          { merkmal: 'GAP-Deckung', aktuell: 'Nein', angebot: 'Ja', highlight: true },
          { merkmal: 'Marderschäden', aktuell: 'Ja', angebot: 'Ja (inkl. Folgeschäden)', highlight: true },
          { merkmal: 'Auslandsschutz', aktuell: 'EU', angebot: 'Weltweit', highlight: true },
          { merkmal: 'Bündelrabatt', aktuell: '–', angebot: '15% bei 3+ Verträgen', highlight: true },
        ],
      };
    },
  },
  {
    id: 'hausrat_fehlt',
    check: (p) => !hatProdukt(p, 'hausrat'),
    titel: tx('Hausratversicherung fehlt', 'Household Insurance Missing'),
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel',
    volumen: () => randomBetween(80, 200),
    beschreibung: (p) => `Kein Hausrat. ${p.wohnflaeche}qm ${p.wohnsituation}.`,
    produktEmpfehlung: 'ERGO Hausrat Basis',
    empfohleneAktion: 'angebot_erstellen',
    herleitung: (p) => {
      const vsQm = 650;
      const vsSumme = (p.wohnflaeche || 80) * vsQm;
      return [
        { label: 'Datenquelle', value: 'Bestandsanalyse' },
        { label: 'Wohnfläche', value: `${p.wohnflaeche || 80}qm (${p.wohnsituation})` },
        { label: 'Empfohlene VS (650€/qm)', value: fmtEur(vsSumme) },
        { label: 'Empfehlung', value: `ERGO Hausrat Basis, ca. ${randomBetween(6, 15)}€/mtl.` },
      ];
    },
  },
  {
    id: 'rechtsschutz_fehlt',
    check: (p) => !hatProdukt(p, 'rechtsschutz') && p.alter > 30,
    titel: tx('Rechtsschutzversicherung', 'Legal Protection Insurance'),
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'niedrig',
    volumen: () => randomBetween(200, 400),
    beschreibung: () => 'Kein Rechtsschutz vorhanden.',
    produktEmpfehlung: 'ERGO Rechtsschutz',
    empfohleneAktion: 'angebot_erstellen',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'Bestandsanalyse' },
      { label: 'Erkannte Situation', value: 'Keine Rechtsschutzversicherung im Bestand' },
      { label: 'Empfehlung', value: p.wohnsituation === 'Eigentum' ? 'ERGO Rechtsschutz Premium (Privat + Verkehr + Wohnen)' : 'ERGO Rechtsschutz Privat + Verkehr' },
    ],
  },
  {
    id: 'bindungsgespraech',
    check: (p) => p.nps <= 5,
    titel: tx('Bindungsgespräch (NPS Detractor)', 'Retention Talk (NPS Detractor)'),
    typ: 'beratung', quellen: ['kommunikation'], prioritaet: 'kritisch',
    volumen: () => 0,
    beschreibung: (p) => `NPS ${p.nps}/10 = Detractor. Abwanderungsrisiko hoch. Proaktiv Termin vereinbaren.`,
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => {
      const vertraege = p.eigeneProdukte?.length || 0;
      const bestandswert = p.eigeneProdukte?.reduce((s, ep) => s + (ep.volumen || 0), 0) || 0;
      return [
        { label: 'Datenquelle', value: 'Kundenzufriedenheits-Analyse (NPS)' },
        { label: 'NPS-Score', value: `${p.nps}/10 (Detractor ≤ 6)` },
        { label: 'Abwanderungsrisiko', value: 'HOCH – Kunde ist unzufrieden' },
        { label: 'Bestandswert gefährdet', value: `${vertraege} Verträge, ${fmtEur(bestandswert)}/J.` },
        { label: 'Empfehlung', value: 'Sofort proaktives Bindungsgespräch führen' },
      ];
    },
  },
  {
    id: 'tierkranken',
    check: (p) => (p.haustiere || p.tiere) && ['Hund', 'Katze'].includes((p.haustiere || p.tiere)?.art || (p.haustiere || p.tiere)?.typ),
    titel: (p) => {
      const tier = p.haustiere || p.tiere;
      const art = tier?.art || tier?.typ || 'Haustier';
      return `Tierkrankenversicherung ${art}`;
    },
    typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'niedrig',
    volumen: () => randomBetween(200, 480),
    beschreibung: (p) => {
      const tier = p.haustiere || p.tiere;
      const art = tier?.art || tier?.typ || 'Haustier';
      const name = tier?.name;
      return `${art}${name ? ` "${name}"` : ''} aus Kontoumsätzen erkannt. Tierkrankenversicherung anbieten.`;
    },
    produktEmpfehlung: 'ERGO Tierkrankenversicherung',
    empfohleneAktion: 'angebot_erstellen',
    herleitung: (p) => {
      const tier = p.haustiere || p.tiere;
      const art = tier?.art || tier?.typ || 'Haustier';
      const name = tier?.name;
      const txns = tier?.erkannteTransaktionen || (tier?.umsaetze || []).map(u => ({ haendler: u.empfaenger, betrag: Math.abs(u.betrag) }));
      const rows = [
        { label: 'Datenquelle', value: 'PSD2/Open Finance Transaktionsanalyse' },
        { label: 'Erkanntes Haustier', value: `${art}${name ? ` "${name}"` : ''}${tier?.rasse ? ` (${tier.rasse})` : ''}` },
      ];
      txns.forEach(t => {
        rows.push({ label: `Erkannter Umsatz`, value: `${t.haendler}: ${fmtEur(t.betrag)}/mtl.` });
      });
      const avgTierarzt = art === 'Hund' ? 1200 : 800;
      rows.push({ label: 'Durchschn. Tierarztkosten', value: `${fmtEur(avgTierarzt)}/J. (${art})` });
      rows.push({ label: 'Empfehlung', value: `ERGO Tierkrankenversicherung ${art}, ab ${art === 'Hund' ? '25' : '18'}€/mtl.` });
      return rows;
    },
  },
];

// ═══ Banking ═══
const BANKING_REGELN = [
  {
    id: 'rv_bu_fehlt',
    check: (p) => !p.fremdProdukte.some(f => f.typ === 'bu') && !hatProdukt(p, 'rv_bu') && p.alter < 55,
    titel: tx('R+V Berufsunfähigkeit', 'R+V Disability Insurance'),
    typ: 'cross_sell', quellen: ['bestand', 'wettbewerb'], prioritaet: 'hoch',
    volumen: () => randomBetween(800, 2400),
    beschreibung: () => 'Keine BU erkennbar. R+V BU über VR-Verbund anbieten.',
    produktEmpfehlung: 'R+V BU',
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'Kontoanalyse + VR-Verbund Bestand' },
      { label: 'Beruf', value: p.beruf || 'Angestellt' },
      { label: 'Aktuelles Nettoeinkommen', value: `${fmtEur(p.nettoeinkommen)}/mtl.` },
      { label: 'Erkannte Situation', value: 'Keine BU-Versicherung im Bestand oder Fremdbestand erkennbar' },
      { label: 'Empfohlene BU-Rente', value: `${fmtEur(Math.round(p.nettoeinkommen * 0.75))}/mtl. (75% d. Nettoeinkommens)` },
    ],
    deckungsluecke: (p) => ({
      label: 'BU-Absicherung vs. Nettoeinkommen',
      gehalt: p.nettoeinkommen,
      aktuelleAbsicherung: 0,
      empfohleneAbsicherung: Math.round(p.nettoeinkommen * 0.75),
      einheit: '€/mtl.',
    }),
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
    herleitung: (p) => {
      const kfz = p.fremdProdukte.find(f => f.typ === 'kfz');
      const fremdPraemie = kfz?.volumen || randomBetween(500, 900);
      const rvPraemie = Math.round(fremdPraemie * 0.85);
      return [
        { label: 'Datenquelle', value: 'Wettbewerbsanalyse (Fremdvertrag erkannt)' },
        { label: 'Aktueller Versicherer', value: kfz?.institut || 'Fremdversicherer' },
        { label: 'Fahrzeug', value: kfz?.details || 'Pkw' },
        { label: 'Aktuelle Jahresprämie', value: `${fmtEur(fremdPraemie)}/J.` },
        { label: 'R+V-Angebot', value: `${fmtEur(rvPraemie)}/J. über VR-Verbund` },
        { label: 'Ersparnis', value: `${fmtEur(fremdPraemie - rvPraemie)}/J. (${Math.round((1 - rvPraemie / fremdPraemie) * 100)}%)` },
      ];
    },
    vergleich: (p) => {
      const kfz = p.fremdProdukte.find(f => f.typ === 'kfz');
      const fremdPraemie = kfz?.volumen || randomBetween(500, 900);
      const rvPraemie = Math.round(fremdPraemie * 0.85);
      return {
        titel: `Vergleich: ${kfz?.institut || 'Fremdversicherer'} vs. R+V Kfz`,
        spalten: ['Merkmal', `${kfz?.institut || 'Aktuell'}`, 'R+V Kfz'],
        zeilen: [
          { merkmal: 'Jahresprämie', aktuell: fmtEur(fremdPraemie), angebot: fmtEur(rvPraemie), highlight: true },
          { merkmal: 'Vollkasko SB', aktuell: '300€', angebot: '300€' },
          { merkmal: 'SF-Rabatt Übernahme', aktuell: 'Standard', angebot: 'Ja (1:1)', highlight: true },
          { merkmal: 'VR-Bündelrabatt', aktuell: '–', angebot: '10% auf alle R+V-Verträge', highlight: true },
          { merkmal: 'Werkstattbindung', aktuell: 'Nein', angebot: 'Optional (20% Rabatt)' },
        ],
      };
    },
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
    herleitung: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot');
      const vol = depot?.volumen || 30000;
      return [
        { label: 'Datenquelle', value: `Open Finance – Depotdaten (${depot?.institut || 'Fremdbank'})` },
        { label: 'Depot-Volumen', value: fmtEur(vol) },
        { label: 'Aktueller Anbieter', value: depot?.institut || 'Fremdbank' },
        { label: 'Empfehlung', value: `Union Investment UniGlobal Vorsorge (TER 0,98%)` },
      ];
    },
    vergleich: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot');
      const vol = depot?.volumen || 30000;
      return {
        titel: `Vergleich: ${depot?.institut || 'Fremdbank'} Depot vs. Union Investment`,
        spalten: ['Merkmal', `${depot?.institut || 'aktuell'}`, 'Union Investment'],
        zeilen: [
          { merkmal: 'Depotvolumen', aktuell: fmtEur(vol), angebot: fmtEur(vol) },
          { merkmal: 'Depotgebühr', aktuell: `${randomBetween(20, 40)}€/J.`, angebot: '0€ bei VR-Konto', highlight: true },
          { merkmal: 'Sparplan ab', aktuell: '50€/mtl.', angebot: '25€/mtl.', highlight: true },
          { merkmal: 'Beratung', aktuell: 'Online-only', angebot: 'Persönlich in Filiale', highlight: true },
          { merkmal: 'VL-fähig', aktuell: 'Teilweise', angebot: 'Ja', highlight: true },
        ],
      };
    },
  },
  {
    id: 'tagesgeld_konsolidierung',
    check: (p) => p.fremdProdukte.some(f => f.typ === 'tagesgeld' && f.volumen > 10000),
    titel: tx('Tagesgeld-Konsolidierung', 'Savings Account Consolidation'),
    typ: 'anpassung', quellen: ['finanztransaktion'], prioritaet: 'mittel',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'tagesgeld')?.volumen || 0,
    beschreibung: (p) => {
      const tg = p.fremdProdukte.find(f => f.typ === 'tagesgeld');
      return `${tg?.volumen?.toLocaleString('de') || ''}€ bei ${tg?.institut || ''}. VR-Tagesgeld oder VR-FinanzPlan.`;
    },
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => {
      const tg = p.fremdProdukte.find(f => f.typ === 'tagesgeld');
      const vol = tg?.volumen || 20000;
      const fremdZins = randomBetween(15, 25) / 10;
      const vrZins = randomBetween(20, 30) / 10;
      return [
        { label: 'Datenquelle', value: `Open Finance – Kontodaten (${tg?.institut || 'Fremdbank'})` },
        { label: 'Fremd-Tagesgeld', value: `${fmtEur(vol)} bei ${tg?.institut || 'Fremdbank'}` },
        { label: 'Geschätzter Zinssatz', value: `${fremdZins.toFixed(2)}% p.a.` },
        { label: 'VR-Tagesgeld aktuell', value: `${vrZins.toFixed(2)}% p.a.` },
        { label: 'Empfehlung', value: 'Konsolidierung in VR-Tagesgeld oder VR-FinanzPlan' },
      ];
    },
  },
  {
    id: 'bauspar_eigentum',
    check: (p) => p.wohnsituation === 'Miete' && p.alter < 40 && !hatProdukt(p, 'bauspar'),
    titel: tx('Schwäbisch Hall Bauspar (Eigentumsplanung)', 'Schwäbisch Hall Savings Plan (Property Planning)'),
    typ: 'whitespot', quellen: ['bestand', 'lebensereignis'], prioritaet: 'mittel',
    volumen: () => randomBetween(10000, 40000),
    beschreibung: () => 'Zur Miete, unter 40: Bauspar für Eigentumsplanung.',
    produktEmpfehlung: 'Schwäbisch Hall Fuchs Bauspar',
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'Kundendaten + Lebenssituation' },
      { label: 'Wohnsituation', value: `Miete (${p.alter} Jahre, unter 40)` },
      { label: 'Eigentumsquote Region', value: `${randomBetween(35, 55)}% → gute Kaufchancen` },
      { label: 'Empfehlung', value: `Schwäbisch Hall Fuchs, Bausparsumme ${fmtEur(randomBetween(30, 80) * 1000)}` },
      { label: 'Staatliche Förderung', value: 'Wohnungsbauprämie + Arbeitnehmersparzulage möglich' },
    ],
  },
  {
    id: 'vr_finanzplan',
    check: (p) => !hatProdukt(p, 'vr_finanzplan') && p.eigeneProdukte.length >= 2,
    titel: tx('VR-FinanzPlan erstellen', 'Create VR Financial Plan'),
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel',
    volumen: () => 0,
    beschreibung: () => 'Kein ganzheitlicher Finanzplan vorhanden. VR-FinanzPlan als Gesamtkonzept.',
    produktEmpfehlung: 'VR-FinanzPlan',
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'Bestandsanalyse (eigene Produkte)' },
      { label: 'Aktuelle Produkte', value: `${p.eigeneProdukte.length} Verträge im Bestand` },
      { label: 'Erkannte Situation', value: 'Kein ganzheitlicher Finanzplan vorhanden' },
      { label: 'Empfehlung', value: 'VR-FinanzPlan als übergreifendes Gesamtkonzept erstellen' },
    ],
  },
  {
    id: 'rv_haftpflicht',
    check: (p) => !p.fremdProdukte.some(f => f.typ === 'haftpflicht') && !hatProdukt(p, 'rv_haftpflicht'),
    titel: tx('R+V Haftpflicht', 'R+V Liability Insurance'),
    typ: 'cross_sell', quellen: ['bestand'], prioritaet: 'hoch',
    volumen: () => randomBetween(60, 110),
    beschreibung: () => 'Keine Haftpflicht erkennbar. R+V Haftpflicht über VR-Verbund.',
    produktEmpfehlung: 'R+V Haftpflicht',
    empfohleneAktion: 'angebot_erstellen',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'Bestandsanalyse + VR-Verbund Prüfung' },
      { label: 'Erkannte Situation', value: 'Keine Privathaftpflicht im Bestand erkennbar' },
      { label: 'Haushaltsgröße', value: p.partner ? 'Familie' : 'Single' },
      { label: 'Empfehlung', value: `R+V Haftpflicht ${p.partner ? 'Familie' : 'Single'}, ab ${p.partner ? '65' : '45'}€/J.` },
    ],
  },
  {
    id: 'bindungsgespraech',
    check: (p) => p.nps <= 5,
    titel: tx('Bindungsgespräch (NPS Detractor)', 'Retention Talk (NPS Detractor)'),
    typ: 'beratung', quellen: ['kommunikation'], prioritaet: 'kritisch',
    volumen: () => 0,
    beschreibung: (p) => `NPS ${p.nps}/10. Proaktiv Termin vereinbaren.`,
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'NPS-Befragung / Kundenzufriedenheit' },
      { label: 'NPS-Score', value: `${p.nps}/10 (Detractor)` },
      { label: 'Abwanderungsrisiko', value: 'HOCH' },
      { label: 'Empfehlung', value: 'Sofort proaktives Bindungsgespräch führen' },
    ],
  },
  {
    id: 'tierkranken_rv',
    check: (p) => (p.haustiere || p.tiere) && ['Hund', 'Katze'].includes((p.haustiere || p.tiere)?.art || (p.haustiere || p.tiere)?.typ),
    titel: (p) => {
      const tier = p.haustiere || p.tiere;
      const art = tier?.art || tier?.typ || 'Haustier';
      return `R+V Tierkrankenversicherung ${art}`;
    },
    typ: 'cross_sell', quellen: ['finanztransaktion'], prioritaet: 'niedrig',
    volumen: () => randomBetween(200, 480),
    beschreibung: (p) => {
      const tier = p.haustiere || p.tiere;
      const art = tier?.art || tier?.typ || 'Haustier';
      const name = tier?.name;
      return `${art}${name ? ` "${name}"` : ''} aus Kontoumsätzen erkannt. R+V Tierkrankenversicherung über VR-Verbund.`;
    },
    produktEmpfehlung: 'R+V Tierkrankenversicherung',
    empfohleneAktion: 'angebot_erstellen',
    herleitung: (p) => {
      const tier = p.haustiere || p.tiere;
      const art = tier?.art || tier?.typ || 'Haustier';
      const name = tier?.name;
      const txns = tier?.erkannteTransaktionen || (tier?.umsaetze || []).map(u => ({ haendler: u.empfaenger, betrag: Math.abs(u.betrag) }));
      const rows = [
        { label: 'Datenquelle', value: 'PSD2/Open Finance Transaktionsanalyse' },
        { label: 'Erkanntes Haustier', value: `${art}${name ? ` "${name}"` : ''}${tier?.rasse ? ` (${tier.rasse})` : ''}` },
      ];
      txns.forEach(t => {
        rows.push({ label: 'Erkannter Umsatz', value: `${t.haendler}: ${fmtEur(t.betrag)}/mtl.` });
      });
      const avgTierarzt = art === 'Hund' ? 1200 : 800;
      rows.push({ label: 'Durchschn. Tierarztkosten', value: `${fmtEur(avgTierarzt)}/J. (${art})` });
      rows.push({ label: 'Empfehlung', value: `R+V Tierkrankenversicherung ${art}, ab ${art === 'Hund' ? '25' : '18'}€/mtl.` });
      return rows;
    },
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
    herleitung: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot_privat');
      const vol = depot?.volumen || 500000;
      return [
        { label: 'Datenquelle', value: `Wettbewerbsanalyse (${depot?.institut || 'Fremdbank'})` },
        { label: 'Fremdbank-Depot', value: `${(vol / 1000000).toFixed(2)}M€ bei ${depot?.institut || 'Fremdbank'}` },
        { label: 'Geschätzte Fremd-Gebühr', value: `${(vol * 0.015 / 1000).toFixed(0)}k€/J. (1,5% All-in-Fee)` },
        { label: 'HRK LUNIS Fee', value: `${(vol * 0.009 / 1000).toFixed(0)}k€/J. (0,9% ab 1M€)` },
        { label: 'Konsolidierungsvorteil', value: `Bessere Konditionen ab Gesamtvolumen, Reporting aus einer Hand` },
      ];
    },
    vergleich: (p) => {
      const depot = p.fremdProdukte.find(f => f.typ === 'depot_privat');
      const vol = depot?.volumen || 500000;
      return {
        titel: `Vergleich: ${depot?.institut || 'Fremdbank'} vs. HRK LUNIS Mandat`,
        spalten: ['Merkmal', `${depot?.institut || 'Fremdbank'}`, 'HRK LUNIS'],
        zeilen: [
          { merkmal: 'All-in-Fee', aktuell: '1,5%', angebot: '0,9%', highlight: true },
          { merkmal: 'Kosten/Jahr', aktuell: fmtEur(Math.round(vol * 0.015)), angebot: fmtEur(Math.round(vol * 0.009)), highlight: true },
          { merkmal: 'Reporting', aktuell: 'Separat', angebot: 'Konsolidiert', highlight: true },
          { merkmal: 'Anlageausschuss', aktuell: 'Standard', angebot: 'Individuell' },
          { merkmal: 'ESG-Integration', aktuell: 'Teilweise', angebot: 'Vollständig', highlight: true },
        ],
      };
    },
  },
  {
    id: 'cash_konsolidierung',
    check: (p) => p.fremdProdukte.some(f => f.typ === 'tagesgeld' && f.volumen > 200000),
    titel: tx('Cash-Konsolidierung (Opportunitätskosten!)', 'Cash Consolidation (Opportunity Cost!)'),
    typ: 'whitespot', quellen: ['finanztransaktion'], prioritaet: 'kritisch',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'tagesgeld')?.volumen || 0,
    beschreibung: (p) => {
      const cash = p.fremdProdukte.find(f => f.typ === 'tagesgeld');
      return `${((cash?.volumen || 0) / 1000).toFixed(0)}k€ Cash bei ${cash?.institut || ''}. Opportunitätskosten ~${Math.round((cash?.volumen || 0) * 0.04 / 1000)}k€/J.`;
    },
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => {
      const cash = p.fremdProdukte.find(f => f.typ === 'tagesgeld');
      const vol = cash?.volumen || 500000;
      const oppKosten = Math.round(vol * 0.04);
      return [
        { label: 'Datenquelle', value: `Open Finance – Kontodaten (${cash?.institut || 'Bank'})` },
        { label: 'Cash-Position', value: `${fmtEur(vol)} auf Tagesgeld (${cash?.institut || 'Bank'})` },
        { label: 'Tagesgeld-Zinssatz', value: '~2,0% p.a. (geschätzt)' },
        { label: 'Erwartete VV-Rendite', value: '~6,0% p.a. (konservativ)' },
        { label: 'Opportunitätskosten', value: `${fmtEur(oppKosten)}/J. entgangene Rendite` },
        { label: 'Empfehlung', value: 'Schrittweise Anlage in diversifiziertes VV-Mandat' },
      ];
    },
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
    herleitung: (p) => {
      const kind = p.kinder.find(k => k.alter >= 25 && !k.eigeneProdukte);
      return [
        { label: 'Datenquelle', value: 'Familiendaten + Bestandsanalyse' },
        { label: 'Kind', value: `${kind?.name || 'N.N.'}, ${kind?.alter || ''} Jahre` },
        { label: 'Eigenes Mandat', value: 'Keines vorhanden' },
        { label: 'Eltern-Mandat', value: `Bestehendes Mandat bei HRK LUNIS` },
        { label: 'Empfehlung', value: 'SmartValue als Einstiegsmandat (ab 250k€)' },
      ];
    },
  },
  {
    id: 'mandatstyp_upgrade',
    check: (p) => p._vvSegment === 'SmartValue' && p._gesamtvermoegen > 4000000,
    titel: tx('Mandats-Upgrade SmartValue auf FairValue', 'Mandate Upgrade SmartValue to FairValue'),
    typ: 'anpassung', quellen: ['bestand'], prioritaet: 'mittel',
    volumen: () => 0,
    beschreibung: (p) => `Gesamtvermögen ${(p._gesamtvermoegen / 1000000).toFixed(1)}M€ rechtfertigt FairValue Individual.`,
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'Bestandsanalyse (AuM)' },
      { label: 'Aktuelles Mandat', value: 'SmartValue (standardisiert)' },
      { label: 'Gesamtvermögen', value: `${(p._gesamtvermoegen / 1000000).toFixed(1)}M€` },
      { label: 'FairValue ab', value: '3M€ (individuelles Mandat)' },
      { label: 'Vorteile FairValue', value: 'Individueller Anlageausschuss, direkter Portfoliomanager, ESG-Customizing' },
    ],
    vergleich: () => ({
      titel: tx('Vergleich: SmartValue vs. FairValue Individual', 'Comparison: SmartValue vs. FairValue Individual'),
      spalten: ['Merkmal', 'SmartValue', 'FairValue Individual'],
      zeilen: [
        { merkmal: 'Mindestanlage', aktuell: '250k€', angebot: '3M€' },
        { merkmal: 'All-in-Fee', aktuell: '1,2%', angebot: '0,85%', highlight: true },
        { merkmal: 'Portfolio', aktuell: 'Standardisiert', angebot: 'Individuell', highlight: true },
        { merkmal: 'Anlageausschuss', aktuell: 'Quartalsreport', angebot: 'Persönlicher Zugang', highlight: true },
        { merkmal: 'ESG-Customizing', aktuell: 'Standard', angebot: 'Individuell', highlight: true },
        { merkmal: 'Reporting', aktuell: 'Standard', angebot: 'Individuell + Performance-Attribution' },
      ],
    }),
  },
  {
    id: 'nachfolgeplanung',
    check: (p) => p.alter >= 58 && p.fremdProdukte.some(f => f.typ === 'unternehmensbeteiligung'),
    titel: tx('Nachfolgeplanung anstoßen', 'Initiate Succession Planning'),
    typ: 'cross_sell', quellen: ['lebensereignis', 'bestand'], prioritaet: 'hoch',
    volumen: (p) => p.fremdProdukte.find(f => f.typ === 'unternehmensbeteiligung')?.volumen || 0,
    beschreibung: (p) => {
      const bet = p.fremdProdukte.find(f => f.typ === 'unternehmensbeteiligung');
      return `${p.alter} Jahre, ${bet?.details || ''}. Verkauf in 3-5 Jahren? Erlös in VV-Mandat.`;
    },
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => {
      const bet = p.fremdProdukte.find(f => f.typ === 'unternehmensbeteiligung');
      return [
        { label: 'Datenquelle', value: 'Lebenssituation + Bestandsdaten' },
        { label: 'Alter', value: `${p.alter} Jahre` },
        { label: 'Unternehmensbeteiligung', value: bet?.details || 'Vorhanden' },
        { label: 'Geschätzter Wert', value: fmtEur(bet?.volumen || 0) },
        { label: 'Empfehlung', value: 'Nachfolgeplanung + Erlös-Wiederanlage in VV-Mandat strukturieren' },
      ];
    },
  },
  {
    id: 'stiftungsgruendung',
    check: (p) => p.alter >= 55 && p._gesamtvermoegen > 10000000,
    titel: tx('Stiftungsgründung empfehlen', 'Recommend Foundation Establishment'),
    typ: 'whitespot', quellen: ['lebensereignis', 'bestand'], prioritaet: 'mittel',
    volumen: () => randomBetween(500000, 2000000),
    beschreibung: () => 'Vermögens- und Alterssituation qualifiziert für Stiftungsgründung.',
    produktEmpfehlung: 'HRK LUNIS Stiftungsmanagement',
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'Bestandsdaten + Vermögensanalyse' },
      { label: 'Gesamtvermögen', value: `${(p._gesamtvermoegen / 1000000).toFixed(0)}M€` },
      { label: 'Alter', value: `${p.alter} Jahre` },
      { label: 'Steuerliche Vorteile', value: 'Zuwendungen bis 1M€ absetzbar (über 10 Jahre verteilbar)' },
      { label: 'Empfehlung', value: 'HRK LUNIS Stiftungsmanagement mit individuellem Stiftungszweck' },
    ],
  },
  {
    id: 'pe_allokation',
    check: (p) => p._gesamtvermoegen > 5000000 && !hatProdukt(p, 'vv_pe'),
    titel: tx('Private Equity Beteiligung anbieten', 'Offer Private Equity Participation'),
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel',
    volumen: (p) => Math.round(p._gesamtvermoegen * 0.05),
    beschreibung: () => 'Keine PE-Allokation im Portfolio. Diversifikation + Rendite-Uplift.',
    produktEmpfehlung: 'HRK LUNIS PE Fund V',
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => {
      const peAllokation = Math.round(p._gesamtvermoegen * 0.05);
      return [
        { label: 'Datenquelle', value: 'Portfolio-Analyse' },
        { label: 'Gesamtvermögen', value: `${(p._gesamtvermoegen / 1000000).toFixed(1)}M€` },
        { label: 'Aktuelle PE-Allokation', value: '0% (keine PE im Portfolio)' },
        { label: 'Empfohlene PE-Allokation', value: `5% = ${fmtEur(peAllokation)}` },
        { label: 'Erwartete IRR', value: '12-15% p.a. (historisch)' },
        { label: 'Empfehlung', value: 'HRK LUNIS PE Fund V, Mindestzeichnung 200k€' },
      ];
    },
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
    herleitung: (p) => {
      const lv = p.fremdProdukte.find(f => f.typ === 'rlv' && f.details?.includes('Ablauf'));
      return [
        { label: 'Datenquelle', value: `Open Finance – Versicherungsdaten (${lv?.institut || ''})` },
        { label: 'Versicherer', value: lv?.institut || 'Fremdversicherer' },
        { label: 'Details', value: lv?.details || 'Ablauf demnächst' },
        { label: 'Ablaufsumme', value: fmtEur(lv?.volumen || 0) },
        { label: 'Empfehlung', value: 'Auszahlung in bestehendes VV-Mandat integrieren (Aufstockung)' },
      ];
    },
  },
  {
    id: 'family_office',
    check: (p) => p._gesamtvermoegen > 15000000,
    titel: tx('WERTIQ Family Office Anbindung', 'WERTIQ Family Office Integration'),
    typ: 'whitespot', quellen: ['bestand'], prioritaet: 'mittel',
    volumen: () => 0,
    beschreibung: (p) => `Gesamtvermögen ${(p._gesamtvermoegen / 1000000).toFixed(0)}M€ qualifiziert für Family Office Service.`,
    produktEmpfehlung: 'WERTIQ Family Office',
    empfohleneAktion: 'termin_vereinbaren',
    herleitung: (p) => [
      { label: 'Datenquelle', value: 'Bestandsdaten + Vermögensanalyse' },
      { label: 'Gesamtvermögen', value: `${(p._gesamtvermoegen / 1000000).toFixed(0)}M€` },
      { label: 'Qualifikation', value: 'Family Office ab 15M€ Gesamtvermögen' },
      { label: 'Leistungen', value: 'Ganzheitliche Vermögenssteuerung, Steueroptimierung, Generationenplanung' },
      { label: 'Empfehlung', value: 'WERTIQ Family Office Anbindung prüfen' },
    ],
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
      herleitung: r.herleitung ? (typeof r.herleitung === 'function' ? r.herleitung(person) : r.herleitung) : null,
      vergleich: r.vergleich ? (typeof r.vergleich === 'function' ? r.vergleich(person) : r.vergleich) : null,
      deckungsluecke: r.deckungsluecke ? (typeof r.deckungsluecke === 'function' ? r.deckungsluecke(person) : r.deckungsluecke) : null,
    }))
    .sort((a, b) => (PRIO_ORDER[a.prioritaet] || 3) - (PRIO_ORDER[b.prioritaet] || 3));
}
