// ============================================
// Seeded PRNG + Utility-Funktionen
// ============================================

let _seed = 42;

export function seedRandom(seed) {
  _seed = seed;
}

// Mulberry32 PRNG — deterministic, fast
function mulberry32() {
  _seed |= 0;
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function random(arr) {
  return arr[Math.floor(mulberry32() * arr.length)];
}

export function randomBetween(min, max) {
  return Math.floor(mulberry32() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return min + mulberry32() * (max - min);
}

export function weightedRandom(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = mulberry32() * total;
  for (const [key, weight] of entries) {
    r -= weight;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(mulberry32() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function pick(arr, n) {
  return shuffle(arr).slice(0, n);
}
