// ===========================================================================
// routen.js — Hash-Routen lesen und schreiben (reine Funktionen, kein React).
//
//   #/                                   start
//   #/kapitel/:kapitelId                 kapitel (Store leitet auf erste Einheit um)
//   #/kapitel/:kapitelId/:einheitId      kapitel
//   #/kapitel/:kapitelId/:einheitId/:blockId   kapitel, scrollt zum Block (b12)
//   #/glossar[/:slug]                    glossar
//   #/wissenscheck[/:kapitelId]          wissenscheck
//
// Alte Routen bleiben gültig und werden per replace umgeschrieben:
//   #overview → #/ · #chapter/:k[/:s] → #/kapitel/… · #wissenscheck → #/wissenscheck
// Unbekannte Routen führen auf die Startseite.
// ===========================================================================

export const START = Object.freeze({ name: 'start', kapitelId: null, einheitId: null, blockId: null, slug: null });

function dekodiere(teil) {
  try { return decodeURIComponent(teil); } catch { return teil; }
}

function kodiere(teil) {
  return encodeURIComponent(String(teil));
}

/** Baut ein vollständiges Routenobjekt (alle Felder vorhanden, notfalls null). */
export function route(name, felder = {}) {
  return {
    name,
    kapitelId: felder.kapitelId ?? null,
    einheitId: felder.einheitId ?? null,
    blockId: felder.blockId ?? null,
    slug: felder.slug ?? null,
  };
}

/**
 * Route → Hash (mit führendem „#/“).
 * @param {{name:string, kapitelId?:string, einheitId?:string, blockId?:string, slug?:string}} r
 */
export function routeZuHash(r) {
  if (!r || !r.name || r.name === 'start') return '#/';
  if (r.name === 'kapitel') {
    let h = `#/kapitel/${kodiere(r.kapitelId)}`;
    if (r.einheitId) {
      h += `/${kodiere(r.einheitId)}`;
      if (r.blockId) h += `/${kodiere(r.blockId)}`;
    }
    return h;
  }
  if (r.name === 'glossar') return r.slug ? `#/glossar/${kodiere(r.slug)}` : '#/glossar';
  if (r.name === 'wissenscheck') return r.kapitelId ? `#/wissenscheck/${kodiere(r.kapitelId)}` : '#/wissenscheck';
  return '#/';
}

/**
 * Hash → Route. `ersetzen` ist der kanonische Hash, wenn der gelesene Hash
 * eine alte oder unbekannte Form hatte (dann per replace umschreiben), sonst null.
 * @param {string} hash z. B. window.location.hash
 * @returns {{ route: object, ersetzen: string|null }}
 */
export function hashZuRoute(hash) {
  const roh = String(hash || '').replace(/^#/, '').replace(/[?].*$/, '');
  if (roh === '' || roh === '/') return { route: route('start'), ersetzen: null };

  // Alte Routen ohne führenden Schrägstrich
  if (!roh.startsWith('/')) {
    const alt = roh.split('/').filter(Boolean).map(dekodiere);
    if (alt[0] === 'overview') return { route: route('start'), ersetzen: '#/' };
    if (alt[0] === 'chapter' && alt[1]) {
      const r = route('kapitel', { kapitelId: alt[1], einheitId: alt[2] || null });
      return { route: r, ersetzen: routeZuHash(r) };
    }
    if (alt[0] === 'wissenscheck') {
      const r = route('wissenscheck', { kapitelId: alt[1] || null });
      return { route: r, ersetzen: routeZuHash(r) };
    }
    if (alt[0] === 'glossar' || alt[0] === 'glossary') {
      const r = route('glossar', { slug: alt[1] || null });
      return { route: r, ersetzen: routeZuHash(r) };
    }
    return { route: route('start'), ersetzen: '#/' };
  }

  const teile = roh.slice(1).split('/').filter(Boolean).map(dekodiere);
  if (teile.length === 0) return { route: route('start'), ersetzen: null };
  const [kopf, a, b, c] = teile;
  if (kopf === 'kapitel' && a) {
    const r = route('kapitel', { kapitelId: a, einheitId: b || null, blockId: b && c ? c : null });
    const kanonisch = routeZuHash(r);
    return { route: r, ersetzen: kanonisch === `#${roh}` ? null : kanonisch };
  }
  if (kopf === 'glossar') {
    const r = route('glossar', { slug: a || null });
    return { route: r, ersetzen: routeZuHash(r) === `#${roh}` ? null : routeZuHash(r) };
  }
  if (kopf === 'wissenscheck') {
    const r = route('wissenscheck', { kapitelId: a || null });
    return { route: r, ersetzen: routeZuHash(r) === `#${roh}` ? null : routeZuHash(r) };
  }
  return { route: route('start'), ersetzen: '#/' };
}

/** Sind zwei Routen gleich (alle Felder)? */
export function routenGleich(a, b) {
  if (!a || !b) return a === b;
  return a.name === b.name && a.kapitelId === b.kapitelId && a.einheitId === b.einheitId
    && a.blockId === b.blockId && a.slug === b.slug;
}
