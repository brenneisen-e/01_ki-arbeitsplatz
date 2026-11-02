// Zugang zum Notizfenster: ein Kennwort, bevor die Speakernotes erscheinen.
// Das Kennwort steht nicht im Klartext im Bündel, nur sein SHA-256; geprüft
// wird über crypto.subtle (braucht https oder localhost). Der Hash der
// richtigen Eingabe bleibt in localStorage, damit das Fenster im selben
// Browser nicht bei jedem Öffnen wieder fragt. Neues Kennwort eintragen:
//   printf '%s' 'neues Kennwort' | sha256sum
// Kein Schutz der Daten (das Markdown liegt im Bündel), nur eine Schwelle,
// damit Zuschauer über den Galerie-Zugang nicht versehentlich mitlesen.
export const ZUGANG_KEY = 'bh-notizen-zugang'
const ZUGANG_HASH = '13ce54915d78cc23e2010f4715ff741baa89d3b248da570e8fef5cd6e66fc719'

export function zugangGespeichert(): boolean {
  try { return localStorage.getItem(ZUGANG_KEY) === ZUGANG_HASH } catch { return false }
}

export function zugangMoeglich(): boolean {
  return typeof crypto !== 'undefined' && !!crypto.subtle
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** Prüft die Eingabe; bei Erfolg bleibt der Zugang im Browser gemerkt. */
export async function pruefeZugang(eingabe: string): Promise<boolean> {
  const hash = await sha256Hex(eingabe.trim())
  if (hash !== ZUGANG_HASH) return false
  try { localStorage.setItem(ZUGANG_KEY, hash) } catch { /* ohne Speicher weiter */ }
  return true
}
