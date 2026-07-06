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

/**
 * Höhe (in Szenen-Einheiten), auf die das Modell normiert wird. Die feste
 * Kamera in ConsultantCanvas (y=0.15, z=4, fov 28°) zeigt bei z=0 einen
 * vertikalen Ausschnitt von ca. 2 Einheiten — 1.7 lässt oben/unten Luft.
 */
export const CONSULTANT_TARGET_HEIGHT = 1.7
