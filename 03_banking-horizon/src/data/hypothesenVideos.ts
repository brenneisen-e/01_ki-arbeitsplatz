// Bewegtbild-Erprobung im Kapitel-Reader: zu einem Hypothesen-Vergleichsbild
// koennen belebte 10-s-Clips der beiden Bildhaelften hinterlegt sein (Kling
// ueber fal.ai, erzeugt mit produktion/kling_hypothesen.py — die Clips sind
// UI-genau auf den sichtbaren Ausschnitt der jeweiligen Haelfte gecroppt).
// Nur Bilder mit Eintrag bekommen im Reader klickbare Haelften; der Schalter
// „Videos aktivieren" oben rechts blendet die Klickflaechen ein.

export type HypothesenVideos = {
  /** Clip der linken Bildhaelfte (Heute / Status Quo). */
  statusQuo?: string
  /** Clip der rechten Bildhaelfte (2030). */
  in2030?: string
}

const clip = (name: string) => `${import.meta.env.BASE_URL}videos/hypothesen/${name}`

/** Schluessel ist der Basis-Bildpfad aus chapters.ts (image.src). */
export const HYPO_VIDEOS: Record<string, HypothesenVideos> = {
  './images/Kapitel 2_1.png': {
    statusQuo: clip('kapitel2_1_heute.mp4'),
    in2030: clip('kapitel2_1_2030.mp4'),
  },
}
