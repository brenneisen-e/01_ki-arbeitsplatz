// ===========================================================================
// citeMap.js — Quellenverweise: Quellentext → URL und die Nummerierung je
// Lerneinheit.
//
// Quellen stehen in den Daten als <span class="v1x1-cite"> mit Nummer und
// Quellentext. Die Nummern der Daten sind je Kapitel vergeben und in zwei
// Kapiteln mehrdeutig; deshalb nummeriert die App JE EINHEIT neu, in der
// Reihenfolge des Auftretens (level1 → level2 → level3, wie alleBloecke),
// gleicher Quellentext = gleiche Nummer. Die Quellenmarken der Absätze und die
// Quellenliste am Seitenende (quellenDerEinheit) nutzen dieselbe Zählung.
//
// URLs: exakte Treffer zuerst, dann Herausgeber-Präfixe (an einer Wortgrenze).
// Ohne Treffer gibt es keinen Link mehr („Quelle ohne Link“) — keine
// Suchmaschine als Ersatz.
// ===========================================================================
import { alleBloecke } from '../lib/bloecke.js';

/** Ein Quellenverweis im HTML der Daten (Nummer optional). */
export const QUELLEN_MUSTER = /<span class="v1x1-cite">\s*(?:<span class="v1x1-cite-num">([^<]*)<\/span>)?\s*<span class="v1x1-cite-tooltip">([^<]*)<\/span>\s*<\/span>/g;

const GDV_JAHRBUCH = 'https://www.gdv.de/resource/blob/192950/70e31abd41fd96f5251fa62c3ad46b83/fakten-zur-versicherungswirtschaft-2025-download-data.pdf';
const BAFIN_JAHRESBERICHT = 'https://www.bafin.de/SharedDocs/Downloads/DE/Jahresbericht/dl_jb_2024.pdf';

/** Exakte Quellentexte → Dokument oder Herausgeberseite. */
const QUELLEN_EXAKT = {
  'GDV Statistisches Taschenbuch 2024/2025': 'https://www.gdv.de/resource/blob/152652/4a475238113e764d7dcfb9fd0f54dff1/statistiken-zur-deutschen-versicherungswirtschaft-taschenbuch-data.pdf',
  'GDV Jahrbuch 2024': GDV_JAHRBUCH,
  'GDV Jahrbuch 2024, S. 8': GDV_JAHRBUCH,
  'GDV Jahrbuch 2024, S. 12': GDV_JAHRBUCH,
  'GDV Jahrbuch 2024, Kapitel Beschäftigung': GDV_JAHRBUCH,
  'GDV Jahrbuch 2024 / DIHK Vermittlerregister': GDV_JAHRBUCH,
  'GDV Jahresmedienkonferenz 2025': 'https://www.gdv.de/gdv/events/gdv-jahresmedienkonferenz-vom-13-februar-2025-186314',
  'GDV Jahresmedienkonferenz Februar 2026': 'https://www.gdv.de/gdv/medien/medieninformationen/versicherungswirtschaft-waechst-2025-deutlich-gedaempfter-ausblick-auf-2026-196066',
  'GDV Naturgefahrenreport 2024': 'https://www.gdv.de/resource/blob/183526/d871a7bed27d5c99e20ab387ee393370/naturgefahrenreport-2024-download-data.pdf',
  'Munich Re NatCatSERVICE, Naturkatastrophen Bilanz 2024': 'https://www.munichre.com/en/company/media-relations/media-information-and-corporate-news/media-information/2025/natural-disaster-figures-2024.html',
  'BaFin Jahresbericht 2024, Kapitalanlagen der Versicherungswirtschaft': BAFIN_JAHRESBERICHT,
  'EIOPA Annual Report 2024': 'https://www.eiopa.europa.eu/document/download/3bc0b36b-d143-4315-b7d6-9d8dbb29e8c2_en',
  // --- die 32 bislang nicht getroffenen Quellentexte (Datenaudit B.4) ---
  'Versicherungsombudsmann Jahresbericht 2024': 'https://www.versicherungsombudsmann.de/',
  'Versicherungstech-Magazin / Cash-online': 'https://www.cash-online.de/versicherungen',
  'Handelsblatt / GDV Statistik': 'https://www.gdv.de/gdv/statistik',
  'Versicherungsmonitor / Versicherungsbote': 'https://versicherungsmonitor.de/',
  'Versicherungsmonitor / Handelsblatt': 'https://versicherungsmonitor.de/',
  'AM Best Global Reinsurance Report 2024': 'https://www.ambest.com/',
  'DSGV / Sparkassen-Finanzgruppe': 'https://www.dsgv.de/',
  'Geschäftsberichte Allianz, Talanx, Munich Re 2024': 'https://www.allianz.com/en/investor_relations/results-reports/annual-reports.html',
  'aba Statistikreihe 2023, Gesamtdeckungsmittel bAV': 'https://www.aba-online.de/infothek/statistik/deckungsmittel',
  'Insurance Europe / GDV-Vertriebswegestatistik 2024': 'https://www.insuranceeurope.eu/publications',
  'Nordlight Research / Allied Market Research': 'https://www.nordlight-research.com/',
  'Versicherungsaufsichtsgesetz (VAG) i.d.F. 2016': 'https://www.gesetze-im-internet.de/vag_2016/',
  'Versicherungsaufsichtsgesetz (VAG) i. d. F. 2016': 'https://www.gesetze-im-internet.de/vag_2016/',
  'Willis Towers Watson Vergütungsstudie 2017': 'https://www.wtwco.com/de-de',
  'Swiss Life Deutschland Geschäftsbericht 2023': 'https://www.swisslife.de/',
  'Solvency-II-RL 2009/138/EG Art. 101; VAG § 97': 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32009L0138',
  'VersVermV § 7 i.V.m. § 34d Abs. 9 GewO': 'https://www.gesetze-im-internet.de/versvermv_2018/',
  'VersVermV § 7 i. V. m. § 34d Abs. 9 GewO': 'https://www.gesetze-im-internet.de/versvermv_2018/',
  'msg/Lünendonk Insurance IT-Studie 2024': 'https://www.luenendonk.de/',
  'Münchener Verein Unternehmensbericht 2024': 'https://www.muenchener-verein.de/',
  'adesso Projektbericht SOKA-BAU Migration 2024': 'https://www.adesso.de/',
  'HUK-COBURG Geschäftsbericht 2024': 'https://www.huk.de/',
  'MSR Consulting Versicherungskanalstudie 2024': 'https://www.msr.de/',
  'Hannover Rück Geschäftsbericht 2024': 'https://www.hannover-re.com/',
  'Viridium Geschäftsbericht 2024': 'https://www.viridium-gruppe.com/',
  'Hepster Unternehmensangaben 2024': 'https://www.hepster.com/',
  'Bundesregierung Flutkatastrophe Ahrtal Bilanz 2022': 'https://www.bundesregierung.de/',
  'Bloomberg/wefox Series-C Finanzierungsrunde 09/2022': 'https://www.wefox.com/',
  'Ping An Annual Report 2024': 'https://www.pingan.com/',
  'ZhongAn Online P&C Insurance Annual Report 2024': 'https://www.zhongan.com/corporate/investor/',
  'Lobbyregister Bundestag, GDV e.V. Eintrag 2024': 'https://www.lobbyregister.bundestag.de/',
  'Lobbyregister Bundestag, GDV e. V. Eintrag 2024': 'https://www.lobbyregister.bundestag.de/',
  'Deutsche Rentenversicherung Rentenbestand 2024': 'https://statistik-rente.de/drv/',
  'Artemis Cat Bond & ILS Market Report Q4/2025': 'https://www.artemis.bm/catastrophe-bond-ils-market-reports/',
  // Kein Herausgeber ermittelbar → bewusst ohne Link
  'DACH Insurance M&A Monitor 2024': null,
};

/** Herausgeber-Präfixe (an einer Wortgrenze), Reihenfolge = Vorrang. */
const QUELLEN_PRAEFIX = [
  { praefix: 'GDV', url: 'https://www.gdv.de/gdv/statistik' },
  { praefix: 'BaFin', url: BAFIN_JAHRESBERICHT },
  { praefix: 'BMF', url: 'https://www.bundesfinanzministerium.de' },
  { praefix: 'BMAS', url: 'https://www.bmas.de' },
  { praefix: 'VAG', url: 'https://www.gesetze-im-internet.de/vag_2016/' },
  { praefix: 'Versicherungsaufsichtsgesetz', url: 'https://www.gesetze-im-internet.de/vag_2016/' },
  { praefix: 'VVG', url: 'https://www.gesetze-im-internet.de/vvg_2008/' },
  { praefix: 'VersVermV', url: 'https://www.gesetze-im-internet.de/versvermv_2018/' },
  { praefix: 'Solvency-II-RL', url: 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32009L0138' },
  { praefix: 'EIOPA', url: 'https://www.eiopa.europa.eu/publications' },
  { praefix: 'Munich Re', url: 'https://www.munichre.com/en/company/investors/reports-and-presentations/annual-report.html' },
  { praefix: 'Swiss Re', url: 'https://www.swissre.com/institute/research/sigma-research.html' },
  { praefix: 'Swiss Life', url: 'https://www.swisslife.de/' },
  { praefix: 'PKV', url: 'https://www.pkv.de/wissen/pkv-zahlenportal/' },
  { praefix: 'DIHK', url: 'https://www.dihk.de/de/serviceportal/fuer-gewerbetreibende-unternehmer/statistiken-und-bestandszahlen-zum-vermittlerregister-141724' },
  { praefix: 'Allianz', url: 'https://www.allianz.com/en/investor_relations/results-reports/annual-reports.html' },
  { praefix: 'Talanx', url: 'https://www.talanx.com/' },
  { praefix: 'Hannover Rück', url: 'https://www.hannover-re.com/' },
  { praefix: 'HUK-COBURG', url: 'https://www.huk.de/' },
  { praefix: 'Deloitte', url: 'https://www.deloitte.com/global/en/Industries/insurance.html' },
  { praefix: 'PwC', url: 'https://www.pwc.de/de/versicherungen.html' },
  { praefix: 'WTW', url: 'https://www.wtwco.com/de-de' },
  { praefix: 'Willis Towers Watson', url: 'https://www.wtwco.com/de-de' },
  { praefix: 'Assekurata', url: 'https://www.assekurata.de/studien/' },
  { praefix: 'Franke', url: 'https://www.franke-bornberg.de/fb-news/pressemitteilungen/bu-leistungspraxisstudie-2023' },
  { praefix: 'DAV', url: 'https://aktuar.de/de/newsroom/' },
  { praefix: 'AfW', url: 'https://afw-verband.de/presse/' },
  { praefix: 'BVK', url: 'https://www.bvk.de/themen/strukturanalyse/' },
  { praefix: 'Accenture', url: 'https://www.accenture.com/us-en/insights/insurance' },
  { praefix: 'Versicherungsombudsmann', url: 'https://www.versicherungsombudsmann.de/' },
  { praefix: 'Versicherungsmonitor', url: 'https://versicherungsmonitor.de/' },
  { praefix: 'Handelsblatt', url: 'https://www.handelsblatt.com/' },
  { praefix: 'AM Best', url: 'https://www.ambest.com/' },
  { praefix: 'DSGV', url: 'https://www.dsgv.de/' },
  { praefix: 'aba', url: 'https://www.aba-online.de/infothek/statistik' },
  { praefix: 'Insurance Europe', url: 'https://www.insuranceeurope.eu/publications' },
  { praefix: 'Lobbyregister', url: 'https://www.lobbyregister.bundestag.de/' },
  { praefix: 'Deutsche Rentenversicherung', url: 'https://statistik-rente.de/drv/' },
  { praefix: 'Artemis', url: 'https://www.artemis.bm/catastrophe-bond-ils-market-reports/' },
  { praefix: 'Bundesregierung', url: 'https://www.bundesregierung.de/' },
  { praefix: 'Viridium', url: 'https://www.viridium-gruppe.com/' },
  { praefix: 'Ping An', url: 'https://www.pingan.com/' },
  { praefix: 'ZhongAn', url: 'https://www.zhongan.com/corporate/investor/' },
];

function praefixPasst(text, praefix) {
  if (!text.startsWith(praefix)) return false;
  const danach = text.charAt(praefix.length);
  return danach === '' || !/[\p{L}\p{N}]/u.test(danach);
}

/**
 * URL zu einem Quellentext oder null („Quelle ohne Link“).
 * @param {string} text
 * @returns {string|null}
 */
export function getCiteUrl(text) {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return null;
  if (Object.prototype.hasOwnProperty.call(QUELLEN_EXAKT, t)) return QUELLEN_EXAKT[t];
  for (const { praefix, url } of QUELLEN_PRAEFIX) {
    if (praefixPasst(t, praefix)) return url;
  }
  return null;
}

function entkomme(s) {
  return String(s)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

/**
 * Alle Quellentexte in einem HTML-String, in Reihenfolge, mit Wiederholungen.
 * @param {string} html
 * @returns {string[]}
 */
export function quellenAusText(html) {
  if (typeof html !== 'string' || html.indexOf('v1x1-cite') < 0) return [];
  const liste = [];
  for (const m of html.matchAll(QUELLEN_MUSTER)) {
    const text = entkomme(m[2]);
    if (text) liste.push(text);
  }
  return liste;
}

const TECHNISCHE_FELDER = new Set(['type', 'chartKey', 'treeKey', 'icon', 'sourceUrl', 'link', 'id', 'status', 'variant', 'color']);

/** Alle Strings eines Blocks in Dokumentreihenfolge (Titel vor Inhalt, Zeilen der Reihe nach). */
function stringsInReihenfolge(wert, ergebnis = [], schluessel = '') {
  if (typeof wert === 'string') { ergebnis.push(wert); return ergebnis; }
  if (Array.isArray(wert)) { for (const w of wert) stringsInReihenfolge(w, ergebnis); return ergebnis; }
  if (wert && typeof wert === 'object') {
    for (const [k, w] of Object.entries(wert)) {
      if (TECHNISCHE_FELDER.has(k)) continue;
      stringsInReihenfolge(w, ergebnis, k);
    }
  }
  return ergebnis;
}

/**
 * Quellen einer Blockliste ({ block } oder Block), fortlaufend nummeriert.
 * @param {Array} bloecke
 * @returns {{ liste: Array<{ nummer: number, text: string, url: string|null }>, nummern: Map<string, number> }}
 */
export function quellenDerBloecke(bloecke) {
  const liste = [];
  const nummern = new Map();
  for (const eintrag of bloecke || []) {
    const block = eintrag && eintrag.block ? eintrag.block : eintrag;
    if (!block || typeof block !== 'object') continue;
    for (const s of stringsInReihenfolge(block)) {
      for (const text of quellenAusText(s)) {
        if (nummern.has(text)) continue;
        const nummer = nummern.size + 1;
        nummern.set(text, nummer);
        liste.push({ nummer, text, url: getCiteUrl(text) });
      }
    }
  }
  return { liste, nummern };
}

const cache = new WeakMap();

function quellenEinheit(einheit) {
  if (!einheit || typeof einheit !== 'object') return { liste: [], nummern: new Map() };
  if (cache.has(einheit)) return cache.get(einheit);
  const ergebnis = quellenDerBloecke(alleBloecke(einheit));
  cache.set(einheit, ergebnis);
  return ergebnis;
}

/**
 * Nummerierung der Quellen einer Lerneinheit: Quellentext → Nummer.
 * @param {object} einheit
 * @returns {Map<string, number>}
 */
export function quellenNummern(einheit) {
  return quellenEinheit(einheit).nummern;
}

/**
 * Quellenliste einer Lerneinheit für das Seitenende: eindeutig, in Reihenfolge
 * des Auftretens, mit derselben Nummer wie die Marken im Text.
 * @param {object} einheit
 * @returns {Array<{ nummer: number, text: string, url: string|null }>}
 */
export function quellenDerEinheit(einheit) {
  return quellenEinheit(einheit).liste;
}
