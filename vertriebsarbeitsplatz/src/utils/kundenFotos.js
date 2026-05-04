// Zentrales Mapping: Kunden-ID → Foto-Pfad
// Fotos liegen in public/images/.
//
// WICHTIG: Damit niemals wieder ein männlicher Kunde versehentlich ein
// Frauenbild bekommt (oder umgekehrt), pflegen wir zusätzlich zwei Registries:
//
//   1. PHOTO_GENDER  – welches Geschlecht ist auf dem Foto abgebildet
//   2. KUNDEN_GENDER – welches Geschlecht hat der Kunde
//
// getKundeFoto() gibt nur dann ein Foto zurück, wenn beide Geschlechter
// übereinstimmen. Sonst fällt die Avatar-Komponente automatisch auf die
// Initialen zurück – besser ein generischer Avatar als ein falsches Foto.

const M = 'm';
const F = 'f';

// Geschlecht pro Foto (manuell verifiziert anhand der tatsächlichen Bilder)
const PHOTO_GENDER = {
  '/images/AdobeStock_624564221.jpeg':  M, // junger Mann, blaues Hemd
  '/images/AdobeStock_252262042.jpeg':  F, // Frau mit dunklen Locken
  '/images/AdobeStock_361342769.jpeg':  M, // Mann mit Brille + Karo-Hemd
  '/images/AdobeStock_477904088.jpeg':  F, // Frau, Locken, hellblauer Blazer
  '/images/AdobeStock_612932760.jpeg':  F, // ältere Dame mit Brille
  '/images/AdobeStock_612940075.jpeg':  F, // Frau, kurze Haare, blauer Blazer
  '/images/AdobeStock_910604663.jpeg':  F, // Frau, lange Haare, schwarzer Blazer
  '/images/AdobeStock_965208311.jpeg':  M, // Mann im Anzug, asiatischer Hintergrund
  '/images/AdobeStock_1091012713.jpeg': M, // junger Mann, dunkle Locken
  '/images/AdobeStock_1210213822.jpeg': M, // Mann mit Brille
  '/images/AdobeStock_1367815601.jpeg': M, // älterer Herr im Anzug
  '/images/AdobeStock_1387839378.jpeg': M, // Mann mit asiatischem Hintergrund
  '/images/AdobeStock_329502726.jpeg':  M, // Mann mit Brille, älter, dunkler Blazer
};

// Geschlecht pro Kunden-ID
const KUNDEN_GENDER = {
  // Versicherung
  KD00001: M, // Max Mustermann
  KD00002: F,
  KD00003: M,
  KD00005: F,
  KD00008: M,
  // Banking
  BK00001: M, // Klaus Fischer
  BK00002: F, // Sandra Müller
  BK00003: M, // Peter Hoffmann
  BK00004: M, // Markus Wagner
  BK00005: F, // Andrea Lang
  BK00006: M, // Stefan Braun
  BK00007: F, // Maria Schuster
  // WM
  WM00001: F,
  WM00003: M,
  // VV-Mandanten
  VV00001: M,
  VV00002: F,
  VV00004: M,
  VV00005: M,
};

// Kunden-ID → Foto-Pfad. Zuweisungen sind so gewählt, dass
// PHOTO_GENDER[file] === KUNDEN_GENDER[id] gilt.
const KUNDEN_FOTOS = {
  // Versicherung
  // KD00001 = Klaus Fischer (showcase). Same photo as banking BK00001 so the
  // showcase customer is visually identical across both modes.
  KD00001: '/images/AdobeStock_361342769.jpeg',
  KD00002: '/images/AdobeStock_252262042.jpeg',
  KD00003: '/images/AdobeStock_1210213822.jpeg',
  KD00005: '/images/AdobeStock_612932760.jpeg',
  KD00008: '/images/AdobeStock_1091012713.jpeg',
  // Banking
  BK00001: '/images/AdobeStock_361342769.jpeg',  // Klaus Fischer (M)
  BK00002: '/images/AdobeStock_477904088.jpeg',  // Sandra Müller (F)
  BK00003: '/images/AdobeStock_1210213822.jpeg', // Peter Hoffmann (M) – war versehentlich ein Frauenbild
  BK00004: '/images/AdobeStock_965208311.jpeg',  // Markus Wagner (M)
  BK00005: '/images/AdobeStock_252262042.jpeg',  // Andrea Lang (F)
  BK00006: '/images/AdobeStock_624564221.jpeg',  // Stefan Braun (M) – war versehentlich ein Frauenbild
  BK00007: '/images/AdobeStock_612940075.jpeg',  // Maria Schuster (F)
  // Stiftungen: Logo statt Foto
  VV00003: '/images/stiftung-weber-logo.svg',
  // VV Mandanten
  VV00001: '/images/AdobeStock_1367815601.jpeg',
  VV00002: '/images/AdobeStock_910604663.jpeg',
  VV00004: '/images/AdobeStock_329502726.jpeg',
  VV00005: '/images/AdobeStock_1387839378.jpeg',
  // WM
  WM00001: '/images/AdobeStock_612932760.jpeg',
  WM00003: '/images/AdobeStock_1091012713.jpeg',
};

// Dev-Assertion beim Import ausführen, damit ein Mismatch sofort auffällt.
if (typeof console !== 'undefined') {
  Object.entries(KUNDEN_FOTOS).forEach(([id, file]) => {
    const kundeG = KUNDEN_GENDER[id];
    const photoG = PHOTO_GENDER[file];
    // Logos (SVG) haben kein Geschlecht – dort ist Mismatch egal.
    if (!photoG) return;
    if (kundeG && kundeG !== photoG) {
      // eslint-disable-next-line no-console
      console.error(`[kundenFotos] Geschlechter-Mismatch für ${id}: Kunde=${kundeG}, Foto=${photoG} (${file})`);
    }
  });
}

export function getKundeFoto(id) {
  const file = KUNDEN_FOTOS[id];
  if (!file) return null;
  const kundeG = KUNDEN_GENDER[id];
  const photoG = PHOTO_GENDER[file];
  // Logos/SVGs dürfen durch – sie haben keinen photoG-Eintrag.
  if (photoG && kundeG && kundeG !== photoG) {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.warn(`[kundenFotos] Unterdrücke Foto für ${id} – Geschlechter-Mismatch`);
    }
    return null;
  }
  return file;
}

// Optional exportiert für Tests / andere Module.
export { KUNDEN_GENDER, PHOTO_GENDER };
