// Lage des Bildschirms im 1920x1080-Szenenbild der ACHTEN Fassung, als
// Anteile (x0, y0, x1, y1). Quelle: produktion/quellen_v08/schirme.json —
// die dort beim Stanzen gemessenen Rechtecke, geteilt durch 1920 bzw. 1080.
// Welche Station welchen Raum nutzt, steht in produktion/stills_v08.py
// (QUELLEN): 08:00 und 08:05 sitzen am selben Platz, daher derselbe Kasten.
//
// `null` heisst: keine Nahfahrt. Bewusst ausgenommen sind der Teamraum
// (09:00, die Wandanzeige ist ohnehin gross und die Menschen gehoeren ins
// Bild), die Telefonszenen (07:00, 07:45, 14:00 — dort steht die Seite als
// Tafel neben ihr) und die Kundenkacheln um 08:10, die ueber dem ganzen Bild
// liegen.
export const SCHIRM_KAESTEN_V08: Record<string, [number, number, number, number] | null> = {
  home: null,
  s0: null,
  s1: [0.3089, 0.2231, 0.7906, 0.7648],
  s2: [0.3089, 0.2231, 0.7906, 0.7648],
  s2b: null,
  s3: [0.3495, 0.3204, 0.7167, 0.7611],
  s4: null,
  s5: [0.4552, 0.3157, 0.8703, 0.7519],
  s6: [0.2870, 0.1870, 0.7104, 0.6704],
  s7: null,
  s8: [0.1859, 0.2046, 0.6057, 0.7093],
  s9: [0.3260, 0.1537, 0.7391, 0.6583],
  s10: null,
}

/**
 * Den Kasten vom Szenenbild auf die Buehne umrechnen. In v08 fuellt das Bild
 * die Buehne per object-fit (cover: oben/unten beschnitten, contain: mit
 * Rand), die Leinwand ist aber die Buehne selbst. Kamerafahrt und Overlay
 * rechnen in Anteilen der Leinwand — also muss der Kasten erst dorthin.
 */
export function kastenAufBuehne(
  kasten: [number, number, number, number],
  fit: 'cover' | 'contain',
  position: string,
  breite: number,
  hoehe: number,
): [number, number, number, number] {
  const s = fit === 'cover'
    ? Math.max(breite / 1920, hoehe / 1080)
    : Math.min(breite / 1920, hoehe / 1080)
  const w = 1920 * s
  const h = 1080 * s
  // object-position "center 37.5%": der zweite Wert verteilt den Ueberhang.
  const senkrecht = position.split(' ')[1]
  const p = !senkrecht || senkrecht === 'center' ? 0.5 : parseFloat(senkrecht) / 100
  const x = (breite - w) / 2
  const y = (hoehe - h) * p
  const ab = (k: number, o: number, m: number, g: number) => (o + k * m) / g
  return [
    ab(kasten[0], x, w, breite), ab(kasten[1], y, h, hoehe),
    ab(kasten[2], x, w, breite), ab(kasten[3], y, h, hoehe),
  ]
}
