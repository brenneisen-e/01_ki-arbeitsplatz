// Exact-title → URL map (all 128 sources)
const CITE_EXACT_MAP = {
  'GDV Statistisches Taschenbuch 2024/2025': 'https://www.gdv.de/resource/blob/152652/4a475238113e764d7dcfb9fd0f54dff1/statistiken-zur-deutschen-versicherungswirtschaft-taschenbuch-data.pdf',
  'GDV Jahrbuch 2024': 'https://www.gdv.de/resource/blob/192950/70e31abd41fd96f5251fa62c3ad46b83/fakten-zur-versicherungswirtschaft-2025-download-data.pdf',
  'GDV Jahrbuch 2024, S. 8': 'https://www.gdv.de/resource/blob/192950/70e31abd41fd96f5251fa62c3ad46b83/fakten-zur-versicherungswirtschaft-2025-download-data.pdf',
  'GDV Jahrbuch 2024, S. 12': 'https://www.gdv.de/resource/blob/192950/70e31abd41fd96f5251fa62c3ad46b83/fakten-zur-versicherungswirtschaft-2025-download-data.pdf',
  'GDV Jahrbuch 2024, Kapitel Beschäftigung': 'https://www.gdv.de/resource/blob/192950/70e31abd41fd96f5251fa62c3ad46b83/fakten-zur-versicherungswirtschaft-2025-download-data.pdf',
  'GDV Jahrbuch 2024 / DIHK Vermittlerregister': 'https://www.gdv.de/resource/blob/192950/70e31abd41fd96f5251fa62c3ad46b83/fakten-zur-versicherungswirtschaft-2025-download-data.pdf',
  'GDV Jahresmedienkonferenz 2025': 'https://www.gdv.de/gdv/events/gdv-jahresmedienkonferenz-vom-13-februar-2025-186314',
  'GDV Jahresmedienkonferenz Februar 2026': 'https://www.gdv.de/gdv/medien/medieninformationen/versicherungswirtschaft-waechst-2025-deutlich-gedaempfter-ausblick-auf-2026-196066',
  'GDV Naturgefahrenreport 2024': 'https://www.gdv.de/resource/blob/183526/d871a7bed27d5c99e20ab387ee393370/naturgefahrenreport-2024-download-data.pdf',
  'Munich Re NatCatSERVICE, Naturkatastrophen Bilanz 2024': 'https://www.munichre.com/en/company/media-relations/media-information-and-corporate-news/media-information/2025/natural-disaster-figures-2024.html',
  'BaFin Jahresbericht 2024, Kapitalanlagen der Versicherungswirtschaft': 'https://www.bafin.de/SharedDocs/Downloads/DE/Jahresbericht/dl_jb_2024.pdf',
  'EIOPA Annual Report 2024': 'https://www.eiopa.europa.eu/document/download/3bc0b36b-d143-4315-b7d6-9d8dbb29e8c2_en',
};

const SOURCE_PREFIX_MAP = [
  { prefix: 'GDV',     url: 'https://www.gdv.de/gdv/statistik' },
  { prefix: 'BaFin',   url: 'https://www.bafin.de/SharedDocs/Downloads/DE/Jahresbericht/dl_jb_2024.pdf' },
  { prefix: 'BMF',     url: 'https://www.bundesfinanzministerium.de' },
  { prefix: 'BMAS',    url: 'https://www.bmas.de' },
  { prefix: 'VAG',     url: 'https://www.gesetze-im-internet.de/vag_2016/' },
  { prefix: 'VVG',     url: 'https://www.gesetze-im-internet.de/vvg_2008/' },
  { prefix: 'EIOPA',   url: 'https://www.eiopa.europa.eu/publications' },
  { prefix: 'Munich Re', url: 'https://www.munichre.com/en/company/investors/reports-and-presentations/annual-report.html' },
  { prefix: 'Swiss Re', url: 'https://www.swissre.com/institute/research/sigma-research.html' },
  { prefix: 'PKV',     url: 'https://www.pkv.de/wissen/pkv-zahlenportal/' },
  { prefix: 'DIHK',    url: 'https://www.dihk.de/de/serviceportal/fuer-gewerbetreibende-unternehmer/statistiken-und-bestandszahlen-zum-vermittlerregister-141724' },
  { prefix: 'Allianz', url: 'https://www.allianz.com/en/investor_relations/results-reports/annual-reports.html' },
  { prefix: 'Deloitte', url: 'https://www.deloitte.com/global/en/Industries/insurance.html' },
  { prefix: 'PwC',     url: 'https://www.pwc.de/de/versicherungen.html' },
  { prefix: 'WTW',     url: 'https://www.willistowerswatson.com/de-DE/Insights' },
  { prefix: 'Assekurata', url: 'https://www.assekurata.de/studien/' },
  { prefix: 'Franke',  url: 'https://www.franke-bornberg.de/fb-news/pressemitteilungen/bu-leistungspraxisstudie-2023' },
  { prefix: 'DAV',     url: 'https://aktuar.de/de/newsroom/' },
  { prefix: 'AfW',     url: 'https://afw-verband.de/presse/' },
  { prefix: 'BVK',     url: 'https://www.bvk.de/themen/strukturanalyse/' },
  { prefix: 'Accenture', url: 'https://www.accenture.com/us-en/insights/insurance' },
];

export function getCiteUrl(sourceText) {
  if (CITE_EXACT_MAP[sourceText]) return CITE_EXACT_MAP[sourceText];
  for (const { prefix, url } of SOURCE_PREFIX_MAP) {
    if (sourceText.startsWith(prefix)) return url;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(sourceText)}`;
}
