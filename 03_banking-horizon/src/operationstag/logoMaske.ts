// ─────────────────────────────────────────────────────────────────────────────
// Bank-Bildmarke ausblenden.
//
// Die Bildschirme der Strecke tragen oben rechts die Bildmarke der Deutschen
// Bank — beim Rendern der Oberflaechen in die Standbilder gestanzt
// (produktion/ui, `.marke-db`), also Pixel im Bild, kein DOM. Damit die
// Strecke auch vor anderen Haeusern laeuft, legt die Buehne eine Maske in der
// Grundfarbe des jeweiligen Bildschirms genau ueber die Marke. Der Schalter
// sitzt unten rechts in der Uhrzeitleiste; Standard ist OHNE Marke.
//
// Lage je Station als Anteile des 1920×1080-Szenenbilds (x0, y0, x1, y1):
// automatisch vermessen (weisses, abgerundetes Quadrat mit blauem Zeichen und
// durchgehend dunkler Umgebung) und um einen Rand erweitert, damit auch die
// weichgezeichneten Kanten darunter liegen. An den Monitoren ist der Rand
// groesser (6 px): dort liegt das scharfe Bildschirm-Overlay per object-fit:
// contain um einige Pixel versetzt ueber der gestanzten Flaeche, und die
// Maske muss beide Lagen der Marke decken. Die Farbe ist die gemessene
// Umgebung der Marke. Stationen ohne Bildschirm (17:00) fehlen.
// Waehrend eines Wegs (Video) gibt es keine Maske: dort bewegt sich die
// Kamera, die Marke ist wenige Pixel gross, und ein mitfahrendes Feld fiele
// mehr auf als sie.
// ─────────────────────────────────────────────────────────────────────────────

export type LogoMaske = {
  /** Anteile des Szenenbilds: x0, y0, x1, y1. */
  box: [number, number, number, number]
  /** Grundfarbe des Bildschirms an dieser Stelle. */
  farbe: string
}

function px(
  x0: number, y0: number, x1: number, y1: number, farbe: string, rand = 3,
): LogoMaske {
  return {
    box: [(x0 - rand) / 1920, (y0 - rand) / 1080, (x1 + rand) / 1920, (y1 + rand) / 1080],
    farbe,
  }
}

export const LOGO_MASKEN_V08: Record<string, LogoMaske | undefined> = {
  // Handy-Szenen: die Seite steht als Tafel links neben Mara, Marke in der
  // Kopfzeile („Today · Monday").
  home: px(399, 239, 417, 257, '#111318'),
  s0: px(399, 239, 417, 257, '#111318'),
  // Monitore (Buero, Kabine, Arbeitsplaetze): Marke oben rechts im Schirm.
  s1: px(1468, 262, 1494, 288, '#101418', 6),
  s2: px(1468, 262, 1494, 288, '#101418', 6),
  // 08:10: der kleine Monitor am Platz (Rechteck aus
  // produktion/quellen_v08/schirme.json, `s2b_rein`, mal Lage der Marke im
  // Bildschirm-Template) — nur wenige Pixel gross.
  s2b: px(653, 531, 661, 538, '#101418', 2),
  s3: px(1337, 363, 1357, 385, '#101318', 6),
  // 09:00: Wandanzeige im Teamraum.
  s4: px(1370, 54, 1388, 72, '#111419', 4),
  s5: px(1628, 358, 1650, 379, '#101418', 6),
  s6: px(1320, 221, 1342, 244, '#111418', 6),
  s7: px(399, 239, 417, 257, '#111318'),
  s8: px(1119, 241, 1142, 265, '#101318', 6),
  s9: px(1376, 186, 1398, 210, '#111419', 6),
}

const SCHLUESSEL = 'bz2030:ops-bankmarke'

/** Ob die Bank-Bildmarke gezeigt wird — Standard: nein. */
export function bankLogoLesen(): boolean {
  try {
    return localStorage.getItem(SCHLUESSEL) === '1'
  } catch {
    return false
  }
}

export function bankLogoSchreiben(an: boolean): void {
  try {
    localStorage.setItem(SCHLUESSEL, an ? '1' : '0')
  } catch {
    /* ohne Speicher gilt die Wahl fuer die Sitzung */
  }
}
