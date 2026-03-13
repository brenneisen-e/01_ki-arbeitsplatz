// Zentrales Mapping: Kunden-ID → Foto-Pfad
// Fotos liegen in public/images/

const KUNDEN_FOTOS = {
  // Versicherung
  'KD00001': './images/AdobeStock_624564221.jpeg',
  'KD00002': './images/AdobeStock_252262042.jpeg',
  'KD00003': './images/AdobeStock_361342769.jpeg',
  'KD00005': './images/AdobeStock_612932760.jpeg',
  'KD00008': './images/AdobeStock_1091012713.jpeg',
  // Banking
  'BK00001': './images/AdobeStock_624564221.jpeg',
  'BK00003': './images/AdobeStock_361342769.jpeg',
  'BK00005': './images/AdobeStock_252262042.jpeg',
  'WM00001': './images/AdobeStock_612932760.jpeg',
  'WM00003': './images/AdobeStock_1091012713.jpeg',
  // Stiftungen: Logo statt Foto
  'VV00003': './images/stiftung-weber-logo.svg',
  // VV Mandanten
  'VV00001': './images/AdobeStock_1367815601.jpeg',
  'VV00002': './images/AdobeStock_910604663.jpeg',
  'VV00004': './images/AdobeStock_329502726.jpeg',
  'VV00005': './images/AdobeStock_1387839378.jpeg',
};

export function getKundeFoto(id) {
  return KUNDEN_FOTOS[id] || null;
}
