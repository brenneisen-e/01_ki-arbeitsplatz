// Anker der v05-Sprechblasen: wohin jeder der drei Belege im Bild zeigt.
//
// Koordinaten als Anteile des 16:9-Bildes (x, y); `slot` ist die Ecke, in der
// die Blase haengt — die Linie laeuft von dort zum Ankerpunkt. Die Werte sind
// an den committeten Standbildern gesetzt (Monitor, Kacheln, Schranke ...).
export type AnkerSlot = 'lo' | 'ro' | 'lu' | 'ru'
export type Anker = { x: number; y: number; slot: AnkerSlot }

const SCHREIBTISCH: Anker[] = [
  { x: 0.44, y: 0.55, slot: 'lo' },
  { x: 0.63, y: 0.37, slot: 'ro' },
  { x: 0.14, y: 0.4, slot: 'lu' },
]

export const PUNKT_ANKER: Record<string, Anker[]> = {
  s0: [
    { x: 0.13, y: 0.52, slot: 'lo' },
    { x: 0.52, y: 0.4, slot: 'ro' },
    { x: 0.8, y: 0.45, slot: 'ru' },
  ],
  s1: SCHREIBTISCH,
  s2: SCHREIBTISCH,
  s2b: [
    { x: 0.3, y: 0.42, slot: 'lo' },
    { x: 0.74, y: 0.45, slot: 'ro' },
    { x: 0.12, y: 0.58, slot: 'lu' },
  ],
  s3: SCHREIBTISCH,
  s4: [
    { x: 0.54, y: 0.16, slot: 'lo' },
    { x: 0.62, y: 0.55, slot: 'ru' },
    { x: 0.16, y: 0.5, slot: 'lu' },
  ],
  s5: SCHREIBTISCH,
  s6: SCHREIBTISCH,
  s7: SCHREIBTISCH,
  s8: SCHREIBTISCH,
  s9: SCHREIBTISCH,
  s10: [
    { x: 0.6, y: 0.35, slot: 'lo' },
    { x: 0.2, y: 0.5, slot: 'lu' },
    { x: 0.5, y: 0.6, slot: 'ru' },
  ],
}

/** Blasenposition je Slot (linke obere Ecke, Anteile des Bildes). */
export const SLOTS: Record<AnkerSlot, { x: number; y: number }> = {
  // Oben bleibt ein Band frei: dort liegt im Vollbild die Hypothese.
  lo: { x: 0.03, y: 0.26 },
  ro: { x: 0.62, y: 0.26 },
  lu: { x: 0.03, y: 0.6 },
  ru: { x: 0.62, y: 0.6 },
}
