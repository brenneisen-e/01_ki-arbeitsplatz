// ============================================================
// Deterministischer Pseudo-Zufall.
// Alle Demodaten werden mit festem Seed erzeugt, damit die App
// bei jedem Laden exakt dieselben Zahlen zeigt.
// (Math.random ist in Demodaten ausdruecklich verboten.)
// ============================================================

/** mulberry32 - schnell, deterministisch, 32 Bit */
export function rng(seed) {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stabiler String-Hash -> 32 Bit Seed */
export function seedAus(str) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Zufallszahl in [min, max] */
export function zwischen(next, min, max) {
  return min + next() * (max - min)
}

/** Ganzzahl in [min, max] */
export function ganzZwischen(next, min, max) {
  return Math.round(zwischen(next, min, max))
}

/** Element aus Liste */
export function ausListe(next, liste) {
  return liste[Math.floor(next() * liste.length) % liste.length]
}

/** Normalverteilt (Box-Muller), auf [-3, 3] begrenzt */
export function normal(next, mittel = 0, sigma = 1) {
  const u = Math.max(next(), 1e-9)
  const v = next()
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return mittel + sigma * Math.max(-3, Math.min(3, z))
}

/** Rundet kaufmaennisch auf n Stellen */
export function runde(v, stellen = 0) {
  const f = Math.pow(10, stellen)
  return Math.round((v + Number.EPSILON) * f) / f
}
