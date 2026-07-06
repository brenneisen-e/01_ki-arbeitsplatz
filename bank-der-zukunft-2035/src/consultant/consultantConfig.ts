// ─────────────────────────────────────────────────────────────────────────────
// Konfiguration für den 3D-Leitfragen-Consultant ("Karl-Klammer"-Assistent).
//
// Das gerigte, animierte GLB-Modell wird EINMALIG über die Meshy-API erzeugt
// (siehe scripts/meshy-generate.mjs) und liegt danach unter der URL unten in
// public/models/. Solange keine Datei existiert, fällt der Avatar automatisch
// auf eine 2D-SVG-Darstellung zurück — die App bleibt also jederzeit lauffähig.
// ─────────────────────────────────────────────────────────────────────────────

/** Öffentliche URL des geriggten Consultant-Modells (relativ zu public/). */
export const CONSULTANT_MODEL_URL = '/models/consultant.glb'

/**
 * Namen der im GLB erwarteten Animations-Clips. Meshy vergibt beim Auto-Rigging
 * / Animate-Schritt eigene Namen; falls diese abweichen, spielt der Consultant
 * hilfsweise den ersten verfügbaren Clip. Reihenfolge = Fallback-Priorität.
 */
export const CONSULTANT_CLIPS = {
  idle: ['idle', 'Idle', 'stand', 'Armature|idle', 'mixamo.com'],
  greeting: ['wave', 'Wave', 'greeting', 'hello', 'Armature|wave'],
  talking: ['talk', 'Talk', 'talking', 'speak', 'gesture', 'Armature|talk'],
} as const

/** Feinjustierung der Kamera-/Modell-Rahmung (Auto-Fit via drei <Bounds>). */
export const CONSULTANT_FIT_MARGIN = 1.15
