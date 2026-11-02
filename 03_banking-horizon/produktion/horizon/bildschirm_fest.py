#!/usr/bin/env python3
"""Den Bildschirmtext aus dem Standbild in den Take zurueckholen.

Veo zeichnet jeden Text neu, und zwar von Anfang an: schon im allerersten
Bild eines Takes steht "Pngrtnodies" statt "Projektupdate". Es gibt kein
sauberes Einzelbild im Take — das Standbild ist die einzige unversehrte
Quelle. Der Auftraggeber will Bewegtbild, also muss der Text dorthin
zurueck, statt die Szene zum Standbild zu machen.

Zwei Messungen tragen das Verfahren:

  * Das Standbild deckt sich mit dem ERSTEN Bild jedes Takes pixelgenau
    (Versatz 0/0, Guete 0,58 bis 0,78). Veo faengt exakt dort an.
  * Danach faehrt Veo langsam hinein — Massstab und Verschiebung, sonst
    nichts. Eine ebene, starre Flaeche laesst sich so nachfuehren.

Zwei Anlaeufe sind vorher gescheitert, und beide Lehren stecken jetzt im
Code:

  1. Die Fahrt ueber das GANZE Einzelbild geschaetzt. Dort bewegen sich
     Mensch, Hintergrund und Bildschirm verschieden; die Schaetzung landete
     dazwischen, und der Text stand doppelt.
  2. Die Vorlage in eine Nullflaeche gelegt und phasenkorreliert.
     Phasenkorrelation vergleicht zwei GLEICH GROSSE Bilder und gewichtet
     jeden Ort gleich — eine kleine Vorlage in einer grossen Flaeche zu
     suchen ist etwas anderes. Guete 0,11, die Vorlage landete irgendwo.

Richtig ist die normierte Kreuzkorrelation (`nkk`), dazu Nachfuehren von
Bild zu Bild statt Suchen bei null, und vor allem eine Guete-Schwelle: wo
die Uebereinstimmung nicht reicht, wird NICHTS eingesetzt. Genau die fehlte
vorher — deshalb klebte der alte Code auch bei einer Guete von 0,06 noch.

Menschen und Bildschirm — die eigentliche Schwierigkeit. Im Standbild
stehen Leute VOR dem Schirm, im Take bewegen sie sich; legt man das
Standbild darueber, sieht man sie doppelt (ein zweites Augenpaar, eine
zweite Brille). Was sich bewaehrt hat, in dieser Reihenfolge gefunden:

  * Streuung ueber die Zeit, in Vorlagenkoordinaten zurueckgerechnet
    (Bildschirm steht, Mensch bewegt sich). Dabei war die Rueckrechnung
    lange mit der falschen Abbildungsrichtung unterwegs — die Maske sperrte
    eine ganze Bildhaelfte und die Rollen-Tafel statt der Frau
    (pil_koeffizienten_vor).
  * Schwelle niedrig (5), dann nach Groesse sieben: der Koerper ist EIN
    grosser Fleck, Veos flimmernde Portraetkreise sind kleine Inseln.
  * Diese Maske gilt nur dort, wo im Standbild ein Mensch steht
    ("menschen", von Hand). Sonst bleibt Text fuer den ganzen Take
    verdorben, nur weil einmal jemand vorbeikam (h6).
  * Je Einzelbild: erst verwischen, dann vergleichen (verdeckung). Anders
    herum sperrt eine um zwei Pixel versetzt neu gemalte gruene
    Ueberschrift ihre eigene Reparatur.
  * Frei schwebende Schilder (h3) treiben einzeln; jedes fuer sich
    verfolgen und nur seine hellen Striche einsetzen (festhalten_einzeln).
  * h1 geht nicht: Veo loest die Lupe binnen 0,7 s auf. h7 geht nicht:
    Glaswand ohne feste Struktur. Beide bleiben Take wie geliefert.

Verfolgung seit 15.09.: ausrichten.py (Lucas-Kanade, sub-pixel, ohne
Glaettung) — die Suche ueber Kreuzkorrelation ist nur noch der Einstieg.
Abnahme: zittern_horizon.py muss jede Szene RUHIG melden.

    SCRATCH=… python3 bildschirm_fest.py h2
    SCRATCH=… python3 bildschirm_fest.py          # alle
    SCRATCH=… python3 zittern_horizon.py --alle   # Wackeln messen
"""
import os
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
from scipy import ndimage
from scipy.ndimage import gaussian_filter
from PIL import Image, ImageFilter

import ausrichten

HIER = os.path.dirname(os.path.abspath(__file__))
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
QUELLE = f"{S}/veo_szenen"
ZIEL = f"{S}/veo_fest"
os.makedirs(ZIEL, exist_ok=True)

B, H = 1920, 1080
FPS = 25

# Wo in jeder Szene Text steht, im Standbild gemessen. "gruen" heisst: die
# Grafik ist das leuchtende Gruen und wird ueber ihre Farbe gefunden statt
# ueber ein Rechteck — bei h3 und h7 schwebt sie frei im Raum.
BEREICHE = {
 # h1 NICHT: Veo hat die Lupe mit dem Uhrenbild nur im ersten Einzelbild
 # uebernommen und binnen 0,7 s aufgeloest; danach ist da nichts mehr, in
 # das sich Text zurueckholen liesse. Die Montage beginnt den Take bei 0,8 s
 # (ANFANG in montage_horizon.py), und der Film zeigt die echte, kleine Uhr.
 # h2, h3: im Standbild steht KEIN Mensch in der Einsatzflaeche (Laptop-
 # schirm, Schilder), also ist die Streuungsmaske dort nur schaedlich — sie
 # sperrte den Knopf "Weiterlernen" und "Payments Gateway" fuer den ganzen
 # Take, weil eine Hand irgendwann vorbeikam. Haende je Einzelbild faengt
 # die Farbpruefung (Haut ueber Gruen oder Weiss ist ein grosser Unterschied).
 # Lagen seit hypothesen_fest.py (Standbilder ohne Naht): hypothesen/lagen.json.
 # "modell": affin (Vorgabe) fuer frontale Wandschirme, hom fuer schraege.
 "h2": {"kaesten": [(604, 357, 1101, 767)], "ohne_streuung": True},   # Laptop
 # h3: sechs frei schwebende Schilder, jedes fuer sich verfolgt (festhalten_einzeln).
 "h3": {"karten": [(712, 513, 872, 666),    # Digitales Onboarding
                   (928, 411, 1097, 567),    # Data & Analytics Plattform
                   (1097, 509, 1266, 666),   # KYC / ID-Verifizierung
                   (695, 702, 864, 868),     # Payments Gateway
                   (1143, 702, 1315, 866),   # CRM-Plattform
                   (916, 812, 1088, 985)]},  # RegTech
 # "menschen": wo im STANDBILD Menschen stehen (1920 x 1080). Nur dort
 # gilt die Streuungsmaske; ueberall sonst prueft jedes Einzelbild fuer sich.
 "h4": {"kaesten": [(541, 62, 1327, 620)],                    # Wandschirm
        "menschen": [(300, 160, 660, 1080), (920, 300, 1380, 1080),
                     (1200, 240, 1600, 1080)]},
 "h5": {"kaesten": [(596, 65, 1409, 655)],                    # Szenarienwand
        "menschen": [(400, 220, 820, 1080), (940, 160, 1420, 1080)]},
 "h6": {"kaesten": [(502, 153, 1409, 791)],                   # Betriebs-Dashboard
        "menschen": [(350, 380, 740, 1080)]},
 # h7 NICHT: die Glaswand ist durchsichtig, und was man durch sie sieht,
 # aendert sich mit der Kamera. Der Vorlage fehlt die feste Struktur, an der
 # sich messen liesse — Guete 0,374, 122 von 150 Bildern ausgelassen. Ihre
 # Schilder sind ohnehin gross gesetzt und halten im Take.
 "h8": {"kaesten": [(451, 64, 1429, 628)],                    # Gremiums-Dashboard
        "menschen": [(340, 440, 1580, 1080)]},
}

MASSSTAEBE_ERST = np.arange(0.985, 1.181, 0.003)   # erster Anlauf: breit suchen
MASSSTAB_NAH = 0.004                               # danach: nur noch nachfuehren
SUCHRAND = 170
GUETE_MINDEST = 0.55        # darunter wird nichts eingesetzt


def grau(x):
    return 0.299 * x[..., 0] + 0.587 * x[..., 1] + 0.114 * x[..., 2]


def nkk(fenster, vorlage):
    """Normierte Kreuzkorrelation — wo in `fenster` die `vorlage` steckt.

    Das ist der Kern, und der erste Entwurf hatte ihn falsch: dort wurde die
    Vorlage in eine Nullflaeche gelegt und phasenkorreliert. Phasenkorrelation
    vergleicht zwei GLEICH GROSSE Bilder und weisst jedem Ort dieselbe
    Gewichtung zu; eine kleine Vorlage in einer grossen Flaeche zu suchen ist
    etwas anderes. Das Ergebnis war eine Guete von 0,11 und eine Vorlage, die
    irgendwo landete.

    Richtig ist die normierte Kreuzkorrelation: der Zaehler misst die
    Uebereinstimmung, der Nenner teilt durch die oertliche Streuung, damit
    helle Stellen nicht allein deshalb gewinnen, weil sie hell sind. Ueber
    die Fourier-Transformation kostet das fuenf Transformationen statt einer
    Schleife ueber alle Orte.
    """
    fh, fb = fenster.shape
    vh, vb = vorlage.shape
    if vh > fh or vb > fb:
        return None
    maske = np.zeros((fh, fb), dtype=np.float32)
    maske[:vh, :vb] = 1.0
    v = np.zeros((fh, fb), dtype=np.float32)
    v[:vh, :vb] = vorlage - vorlage.mean()
    n = float(vh * vb)

    Ff = np.fft.rfft2(fenster)
    Fv = np.conj(np.fft.rfft2(v))
    Fm = np.conj(np.fft.rfft2(maske))
    zaehler = np.fft.irfft2(Ff * Fv, s=(fh, fb))
    summe = np.fft.irfft2(Ff * Fm, s=(fh, fb))
    summe2 = np.fft.irfft2(np.fft.rfft2(fenster * fenster) * Fm, s=(fh, fb))
    streuung = np.sqrt(np.maximum(summe2 - summe * summe / n, 0.0))
    nenner = streuung * float(np.sqrt((v * v).sum()))
    k = zaehler / (nenner + 1e-6)
    # Nur Orte, an denen die Vorlage ganz im Fenster liegt.
    k[fh - vh + 1:, :] = -1
    k[:, fb - vb + 1:] = -1
    i = np.unravel_index(np.argmax(k), k.shape)
    return int(i[1]), int(i[0]), float(k[i])


def suchen(fenster, vorlage_bild, massstaebe):
    """Ueber mehrere Massstaebe suchen; der beste gewinnt."""
    beste = (1.0, 0, 0, -1.0)
    for m in massstaebe:
        vb = int(round(vorlage_bild.size[0] * m))
        vh = int(round(vorlage_bild.size[1] * m))
        if vb < 16 or vh < 16 or vb > fenster.shape[1] or vh > fenster.shape[0]:
            continue
        v = grau(np.asarray(vorlage_bild.resize((vb, vh), Image.BILINEAR),
                            dtype=np.float32))
        t = nkk(fenster, v)
        if t and t[2] > beste[3]:
            beste = (float(m), t[0], t[1], t[2])
    return beste


def bloecke(breite, hoehe, klotz, n=4):
    """Mittelpunkte eines Rasters von Messpunkten auf der Vorlage.

    Die Punkte muessen so liegen, dass der Messklotz um sie herum noch ganz
    in die Vorlage passt. Der erste Entwurf setzte sie stur auf 10, 50 und
    90 Prozent — bei einem Klotz von 150 Pixeln ragten damit acht von neun
    ueber den Rand und fielen weg. Uebrig blieb einer, und sechs sind
    Pflicht: alle hundert Bilder wurden ausgelassen.
    """
    h = klotz / 2.0
    if breite < klotz + 8 or hoehe < klotz + 8:
        return []
    xs = np.linspace(h, breite - h, n)
    ys = np.linspace(h, hoehe - h, n)
    return [(float(x), float(y)) for y in ys for x in xs]


def perspektive(paare):
    """Homographie aus Punktpaaren (Vorlage -> Einzelbild), kleinste Quadrate."""
    A, b = [], []
    for (x, y), (u, v) in paare:
        A.append([x, y, 1, 0, 0, 0, -x * u, -y * u]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -x * v, -y * v]); b.append(v)
    h, *_ = np.linalg.lstsq(np.asarray(A, dtype=np.float64),
                            np.asarray(b, dtype=np.float64), rcond=None)
    return np.append(h, 1.0).reshape(3, 3)


def nachmessen(fenster, vorlage_g, m, dx, dy, klotz=120, spiel=30):
    """Die Ebene punktweise nachmessen und eine Homographie anpassen.

    Massstab und Verschiebung reichen nicht: ein Bildschirm ist eine schraeg
    gesehene Ebene, und wenn die Kamera hineinfaehrt, aendert sich seine
    Projektion perspektivisch. Mit nur einem Massstab sitzt oben alles und
    unten laeuft es weg — im Bild sah man einzelne Zeilen scharf und
    daneben doppelt.

    Also wird die Vorlage an neun Punkten einzeln gesucht und aus den
    Treffern eine Homographie bestimmt. Punkte, die nicht ueberzeugen
    (jemand steht davor, zu wenig Struktur), fallen heraus; bleiben weniger
    als sechs, wird nichts eingesetzt.
    """
    vh, vb = vorlage_g.shape
    paare, guten = [], []
    for (px, py) in bloecke(vb, vh, klotz, n=5):
        x0, y0 = int(px - klotz / 2), int(py - klotz / 2)
        if x0 < 0 or y0 < 0 or x0 + klotz > vb or y0 + klotz > vh:
            continue
        klein = np.asarray(Image.fromarray(
            vorlage_g[y0:y0 + klotz, x0:x0 + klotz].astype(np.uint8)).resize(
            (int(klotz * m), int(klotz * m)), Image.BILINEAR), dtype=np.float32)
        # Wo dieser Klotz nach der groben Schaetzung liegen muesste.
        zx, zy = int(dx + x0 * m), int(dy + y0 * m)
        fx0, fy0 = max(0, zx - spiel), max(0, zy - spiel)
        fx1 = min(fenster.shape[1], zx + klein.shape[1] + spiel)
        fy1 = min(fenster.shape[0], zy + klein.shape[0] + spiel)
        ausschnitt = fenster[fy0:fy1, fx0:fx1]
        if ausschnitt.shape[0] <= klein.shape[0] or ausschnitt.shape[1] <= klein.shape[1]:
            continue
        t = nkk(ausschnitt, klein)
        if not t or t[2] < 0.45:
            continue
        paare.append(((px, py),
                      (fx0 + t[0] + klein.shape[1] / 2.0,
                       fy0 + t[1] + klein.shape[0] / 2.0)))
        guten.append(t[2])
    if len(paare) < 6:
        return None, 0.0
    return perspektive(paare), float(np.mean(guten))


def pil_koeffizienten(H):
    """PIL bildet Ziel -> Quelle ab, also wird die Homographie umgekehrt.

    Fuer das EINSETZEN (Ziel = Einzelbild, Quelle = Vorlage) ist das die
    Umkehrung von hom. Fuer das ZURUECKRECHNEN (Ziel = Vorlage, Quelle =
    Einzelbild) ist es hom selbst — dafuer pil_koeffizienten_vor. Beides mit
    der Umkehrung zu rechnen war der Fehler, der die Bewegungsmaske
    unbrauchbar machte: die linke Haelfte der Vorlage tastete vor dem Bild
    (Streuung exakt null), die rechte tastete den Bildrand ab, wo der Mann
    vorbeigeht (Streifen), und die Rollen-Tafel galt als "Mensch".
    """
    G = np.linalg.inv(H)
    G = G / G[2, 2]
    return (G[0, 0], G[0, 1], G[0, 2], G[1, 0], G[1, 1], G[1, 2], G[2, 0], G[2, 1])


def pil_koeffizienten_vor(H):
    """Vorwaerts: Ziel in Vorlagen-, Quelle in Bildkoordinaten."""
    G = H / H[2, 2]
    return (G[0, 0], G[0, 1], G[0, 2], G[1, 0], G[1, 1], G[1, 2], G[2, 0], G[2, 1])


def glaetten(reihen, fenster=21, grad=2):
    """Die Abbildung ueber die Zeit glaetten — lokal, nicht global.

    Die erste Fassung legte EINE Kurve dritten Grades durch den ganzen Take.
    Das nimmt das Zittern, aber an den Enden weicht eine globale Kurve am
    staerksten von den Messwerten ab — und am Ende des Takes standen
    einzelne Buchstaben um ein paar Pixel versetzt doppelt.

    Jetzt wird fuer jedes Bild eine Kurve zweiten Grades nur durch seine
    Nachbarn gelegt (Fenster von 21 Bildern, an den Raendern entsprechend
    kuerzer) und in der Mitte ausgewertet. Glatt bleibt es, weil sich die
    Fenster ueberlappen; die Enden folgen den Messwerten.
    """
    werte = np.asarray(reihen, dtype=np.float64)      # n x 8
    n, k = werte.shape
    halb = fenster // 2
    geglaettet = np.empty_like(werte)
    t = np.arange(n, dtype=np.float64)
    for i in range(n):
        a, b = max(0, i - halb), min(n, i + halb + 1)
        tt = t[a:b] - t[i]
        g = min(grad, b - a - 1)
        for j in range(k):
            y = werte[a:b, j]
            # Ausreisser einmal aussortieren, dann neu anpassen.
            c = np.polyfit(tt, y, g)
            rest = np.abs(y - np.polyval(c, tt))
            gut = rest <= 2.5 * (rest.std() + 1e-9)
            if gut.sum() > g + 1 and not gut.all():
                c = np.polyfit(tt[gut], y[gut], g)
            geglaettet[i, j] = np.polyval(c, 0.0)
    return geglaettet


def gruenmaske(bild):
    x = np.asarray(bild, dtype=np.int16)
    r, g, b = x[..., 0], x[..., 1], x[..., 2]
    treffer = ((g > r + 22) & (g > b + 18) & (g > 80)).astype(np.uint8) * 255
    return Image.fromarray(treffer).filter(ImageFilter.MaxFilter(9)) \
                .filter(ImageFilter.GaussianBlur(3))


def kasten_von(name, stand):
    kaesten = BEREICHE[name].get("kaesten")
    if kaesten:
        return (min(k[0] for k in kaesten), min(k[1] for k in kaesten),
                max(k[2] for k in kaesten), max(k[3] for k in kaesten))
    m = np.asarray(gruenmaske(stand)) > 40
    ys, xs = np.nonzero(m)
    return (max(0, int(xs.min()) - 30), max(0, int(ys.min()) - 30),
            min(B, int(xs.max()) + 30), min(H, int(ys.max()) + 30))


def verdeckung(f, mit):
    """Wo im Einzelbild f etwas VOR der eingesetzten Vorlage mit steht
    (Hand, Kopf, Schulter): dort 0, sonst 1 — weich."""
    # Verdeckung erkennen — und dabei NICHT den verdorbenen Text fuer
    # eine Verdeckung halten. Ein Mensch ist gross und zusammenhaengend,
    # ein Buchstabe klein; bei 40 Pixeln Verwischung ueberlebt nur der
    # Mensch.
    # Verdeckung je Einzelbild — fuer Menschen, die erst spaet in den
    # Bildschirm hineinkommen und deshalb in der Streuung ueber die Zeit
    # nicht auffallen. (Der Mann in h4 erreicht die Bildschirmkante erst
    # in der letzten Sekunde: 20 von 200 Bildern, zu wenig Streuung —
    # und oben rechts von seinem Kopf stand eine zweite Nase samt Brille.)
    #
    # Zwei Pruefungen, beide muessen frei geben:
    #   * Helligkeit, grob verwischt (40 px): faengt grosse Koerper, nicht
    #     den Buchstabensalat.
    #   * FARBE, fein verwischt (12 px): Text ist in Take und Standbild
    #     gleichermassen weiss auf dunkel, also ohne Farbunterschied —
    #     Haut, ein hellblauer Pullover, ein Anzug ueber dunkelgruenem
    #     Schirm sind ein grosser Farbunterschied. Das trifft auch einen
    #     Kopf, der nur kurz hineinragt.
    # ERST verwischen, DANN vergleichen — nicht umgekehrt. Wird erst
    # der Unterschied gebildet und dann verwischt, bleibt von einer
    # gruenen Ueberschrift, die Veo um zwei Pixel versetzt neu gemalt
    # hat, ein breiter Farbunterschied uebrig (alte und neue Lage), und
    # die Reparatur setzt genau dort aus: "Sk2ls", "Teama in Echtzeit",
    # "Projekttwam A" — waehrend der weisse Text daneben sauber stand.
    # Werden beide Bilder zuerst verwischt, verschmelzen alte und neue
    # Lage zum selben Fleck, und nur Grosses (Haut, Hemd, Anzug) bleibt
    # als Unterschied stehen.
    def weich(x, r):
        # PIL verwischt keine Gleitkommabilder; scipy tut es, mit
        # demselben Radius als Standardabweichung.
        return gaussian_filter(x.astype(np.float32), r, truncate=2.5)
    hell = np.abs(weich(grau(f), 40) - weich(grau(mit), 40))
    frei_hell = np.clip((46.0 - hell) / 22.0, 0.0, 1.0)

    def farbe(x):
        return np.stack([x[..., 0] - x[..., 1], x[..., 2] - x[..., 1]], axis=-1)
    ff, fm = farbe(f), farbe(mit)
    bunt = (np.abs(weich(ff[..., 0], 12) - weich(fm[..., 0], 12))
            + np.abs(weich(ff[..., 1], 12) - weich(fm[..., 1], 12)))
    frei_bunt = np.clip((26.0 - bunt) / 14.0, 0.0, 1.0)

    frei = frei_hell * frei_bunt
    frei = frei * frei * (3 - 2 * frei)
    return frei


def festhalten_einzeln(name):
    """Jede Karte fuer sich verfolgen — fuer frei schwebende Schilder.

    In h3 haengen die sechs Schilder nicht an einer Ebene: Veo laesst sie
    einzeln treiben, ein paar Pixel gegeneinander. EINE Homographie fuer
    alle traf dann keins genau, und die Schrift stand doppelt. Also wird
    jedes Schild allein gesucht (Massstab und Verschiebung, mehr braucht ein
    kleines, frontal gesehenes Schild nicht), die Bahn geglaettet und nur
    seine hellen Striche — Rand, Symbol, Schrift — eingesetzt. Die dunkle,
    halb durchsichtige Fuellung bleibt aus dem Take: durch sie sieht man
    Pullover und Anzug, und die bewegen sich.
    """
    quelle = f"{QUELLE}/{name}.mp4"
    stand = Image.open(f"{HIER}/hypothesen/{name}.png").convert("RGB") \
                 .resize((B, H), Image.LANCZOS)
    karten = BEREICHE[name]["karten"]
    RAND = 70
    vorlagen = []
    for r in karten:
        v = stand.crop(r)
        x = np.asarray(v, dtype=np.int16)
        lum = grau(x.astype(np.float32))
        # Helle Striche sind weiss oder gruen — nie warm. Der beige Pullover
        # im Rechteck des KYC-Schilds ist auch hell; kam er mit, stand er als
        # heller Fleck still im Bild, waehrend die Frau sich bewegte.
        warm = (x[..., 0] - x[..., 2]) > 18
        strich = (((lum > 95) & ~warm) | ((x[..., 1] > x[..., 0] + 22)
                                          & (x[..., 1] > x[..., 2] + 18) & (x[..., 1] > 80)))
        teil = Image.fromarray((strich * 255).astype(np.uint8)) \
                    .filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
        # Sub-Pixel-Verfolgung auf den Strichen des Schilds (mit etwas Rand),
        # nicht auf der Fuellung — durch die sieht man den Pullover.
        lk_maske = np.asarray(teil.filter(ImageFilter.MaxFilter(9)), dtype=np.float32) > 40
        lk = ausrichten.Vorlage(lum, maske=lk_maske, modell="aehnlich", sigma=1.5, schritt=1)
        vorlagen.append((r, v, teil, lk))

    # ERSTER DURCHGANG: jede Karte in jedem Bild suchen.
    ein = subprocess.Popen(
        [FFMPEG, "-v", "error", "-i", quelle, "-vf", f"scale={B}:{H},fps={FPS}",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    bahnen = [[] for _ in karten]
    gueten = [[] for _ in karten]
    letzte = [None] * len(karten)
    while True:
        roh = ein.stdout.read(B * H * 3)
        if len(roh) < B * H * 3:
            break
        g_bild = grau(np.frombuffer(roh, dtype=np.uint8).astype(np.float32).reshape(H, B, 3))
        for k, (r, v, _, lk) in enumerate(vorlagen):
            fx0, fy0 = max(0, r[0] - RAND), max(0, r[1] - RAND)
            fen = g_bild[fy0:min(H, r[3] + RAND), fx0:min(B, r[2] + RAND)]
            V = np.array([[1, 0, fx0], [0, 1, fy0], [0, 0, 1]], dtype=np.float64)
            g = 0.0
            if letzte[k] is None:
                m, dx, dy, g = suchen(fen, v, MASSSTAEBE_ERST)
                start = ausrichten.aehnlich(m, dx, dy) if g >= 0.45 else None
            else:
                start = np.linalg.inv(V) @ letzte[k]
            hk, gh = None, 0.0
            if start is not None:
                hk, gh, _ = ausrichten.verfeinern(lk, fen, start)
                if gh < 0.35 and letzte[k] is not None:
                    m, dx, dy, g = suchen(fen, v, MASSSTAEBE_ERST)
                    if g >= 0.45:
                        hk, gh, _ = ausrichten.verfeinern(lk, fen, ausrichten.aehnlich(m, dx, dy))
                if gh < 0.35:
                    hk = None
            gueten[k].append(gh if hk is not None else g)
            if hk is not None:
                letzte[k] = V @ hk          # Bildkoordinaten
                bahnen[k].append(letzte[k])
            else:
                bahnen[k].append(None)
    ein.stdout.close()
    ein.wait()
    n = len(bahnen[0])

    ruhig = []
    for k, bahn in enumerate(bahnen):
        fehlt = sum(b is None for b in bahn)
        if fehlt > 0.05 * n:
            print(f"  {name}: Karte {k} in {fehlt} von {n} Bildern nicht gefunden "
                  f"— bleibt aus dem Take", flush=True)
            ruhig.append(None)
            continue
        # Luecken mit dem Nachbarn fuellen, dann glaetten.
        voll = list(bahn)
        for i in range(n):
            if voll[i] is None:
                j = next((j for j in range(i + 1, n) if voll[j] is not None), None)
                voll[i] = voll[i - 1] if i and voll[i - 1] is not None else voll[j]
        ruhig.append(voll)          # ungeglaettet, siehe festhalten()
        print(f"  {name}: Karte {k} Guete {np.mean(gueten[k]):.3f} "
              f"(min {np.min(gueten[k]):.3f}), fehlt {fehlt}", flush=True)

    # ZWEITER DURCHGANG: einsetzen.
    ein = subprocess.Popen(
        [FFMPEG, "-v", "error", "-i", quelle, "-vf", f"scale={B}:{H},fps={FPS}",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    ziel = f"{ZIEL}/{name}.mp4"
    aus = subprocess.Popen(
        [FFMPEG, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{B}x{H}", "-r", str(FPS), "-i", "-", "-an",
         "-c:v", "libx264", "-preset", "slow", "-crf", "15",
         "-pix_fmt", "yuv420p", ziel], stdin=subprocess.PIPE)
    i = 0
    while True:
        roh = ein.stdout.read(B * H * 3)
        if len(roh) < B * H * 3:
            break
        f = np.frombuffer(roh, dtype=np.uint8).astype(np.float32).reshape(H, B, 3).copy()
        mit = f.copy()
        mitmaske = np.zeros((H, B), dtype=np.float32)
        for k, (r, v, teil, _) in enumerate(vorlagen):
            if ruhig[k] is None:
                continue
            koeff = pil_koeffizienten(ruhig[k][min(i, n - 1)])
            karte = np.asarray(v.transform((B, H), Image.PERSPECTIVE, koeff, Image.BICUBIC),
                               dtype=np.float32)
            mk = np.asarray(teil.transform((B, H), Image.PERSPECTIVE, koeff, Image.BILINEAR),
                            dtype=np.float32) / 255.0
            mit = mit * (1 - mk[..., None]) + karte * mk[..., None]
            mitmaske = np.maximum(mitmaske, mk)
        frei = verdeckung(f, mit)
        maske = (mitmaske * frei)[..., None]
        f = f * (1 - maske) + mit * maske
        aus.stdin.write(f.clip(0, 255).astype(np.uint8).tobytes())
        i += 1
    aus.stdin.close()
    ein.stdout.close()
    aus.wait()
    ein.wait()
    print(f"festgehalten: {name}  {n} Bilder  einzeln  "
          f"{os.path.getsize(ziel) // 1024} KB", flush=True)


def festhalten(name):
    quelle = f"{QUELLE}/{name}.mp4"
    if not os.path.exists(quelle) or name not in BEREICHE:
        print(f"{name}: uebersprungen", flush=True)
        return
    if BEREICHE[name].get("karten"):
        return festhalten_einzeln(name)
    stand = Image.open(f"{HIER}/hypothesen/{name}.png").convert("RGB") \
                 .resize((B, H), Image.LANCZOS)
    kasten = kasten_von(name, stand)
    vorlage = stand.crop(kasten)

    if BEREICHE[name].get("gruen"):
        teil = gruenmaske(stand).crop(kasten)
    else:
        rand = 16
        teil = Image.new("L", vorlage.size, 0)
        teil.paste(Image.new("L", (vorlage.size[0] - 2 * rand,
                                   vorlage.size[1] - 2 * rand), 255), (rand, rand))
    teil = teil.filter(ImageFilter.GaussianBlur(8))

    fenster = (max(0, kasten[0] - SUCHRAND), max(0, kasten[1] - SUCHRAND),
               min(B, kasten[2] + SUCHRAND), min(H, kasten[3] + SUCHRAND))

    vorlage_g = grau(np.asarray(vorlage, dtype=np.float32))
    # Sub-Pixel-Verfolgung (ausrichten.py): die Vorlage ist die Einsetz-
    # flaeche ohne die Menschen-Bereiche des Standbilds. Ausreisser
    # (Menschen im Take, Buchstabensalat) gewichtet die Ausrichtung selbst
    # herunter.
    lk_maske = np.asarray(teil, dtype=np.float32) > 128
    for (x0, y0, x1, y1) in BEREICHE[name].get("menschen", []):
        lk_maske[max(0, y0 - kasten[1]):max(0, y1 - kasten[1]),
                 max(0, x0 - kasten[0]):max(0, x1 - kasten[0])] = False
    modell = BEREICHE[name].get("modell", "affin")
    lk = ausrichten.Vorlage(vorlage_g, maske=lk_maske, modell=modell)
    LK_MINDEST = 0.35
    # ERSTER DURCHGANG: nur messen. (Hier standen beim Umbau auf zwei
    # Durchgaenge noch die Popen-Aufrufe des alten einen Durchgangs: es
    # liefen zwei Dekoder und zwei Kodierer gleichzeitig, beide auf dieselbe
    # Zieldatei. Ergebnis war eine 261 Byte grosse Datei.)
    ein = subprocess.Popen(
        [FFMPEG, "-v", "error", "-i", quelle, "-vf", f"scale={B}:{H},fps={FPS}",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    abbildungen, guete, letzter = [], [], None
    summe = np.zeros((vorlage.size[1], vorlage.size[0]), dtype=np.float64)
    stapel = []          # alle zurueckgerechneten, verwischten Graubilder (uint8)
    summe2 = np.zeros_like(summe)
    farbmax = np.zeros_like(summe, dtype=np.float32)
    vorlage_farbe = np.asarray(vorlage, dtype=np.float32)
    gezaehlt = 0
    while True:
        roh = ein.stdout.read(B * H * 3)
        if len(roh) < B * H * 3:
            break
        f_bild = np.frombuffer(roh, dtype=np.uint8).astype(np.float32).reshape(H, B, 3)
        g_bild = grau(f_bild)
        fen = g_bild[fenster[1]:fenster[3], fenster[0]:fenster[2]]
        # Startwert: die Lage des vorigen Bildes (die Kamera bewegt sich je
        # Bild weit unter einem Pixel), sonst die grobe Suche. Dann Sub-
        # Pixel-Verfeinerung; reicht deren Guete nicht, einmal neu
        # einsteigen ueber die grobe Suche.
        def grob():
            m, dx, dy, g = suchen(fen, vorlage, MASSSTAEBE_ERST)
            if g < GUETE_MINDEST:
                return None, g
            if modell != "hom":
                return ausrichten.aehnlich(m, dx, dy), g
            h0, _ = nachmessen(fen, vorlage_g, m, dx, dy)
            return (h0 if h0 is not None else ausrichten.aehnlich(m, dx, dy)), g
        g = 0.0
        if letzter is None:
            start, g = grob()
        else:
            start = letzter
        hom, gh = None, 0.0
        if start is not None:
            hom, gh, _ = ausrichten.verfeinern(lk, fen, start)
            if gh < LK_MINDEST and letzter is not None:
                start, g = grob()
                if start is not None:
                    hom, gh, _ = ausrichten.verfeinern(lk, fen, start)
            if gh < LK_MINDEST:
                hom = None
        if hom is not None:
            letzter = hom
        abbildungen.append(hom)
        guete.append(gh if hom is not None else g)

        # Wo bewegt sich ueber die Zeit etwas? Dazu wird das Einzelbild in
        # die Koordinaten der Vorlage zurueckgerechnet; danach steht der
        # Bildschirm still und nur die Menschen bewegen sich noch.
        if hom is not None:
            V = np.array([[1, 0, fenster[0]], [0, 1, fenster[1]], [0, 0, 1]],
                         dtype=np.float64)
            zurueck_f = np.asarray(
                Image.fromarray(f_bild.astype(np.uint8)).transform(
                    vorlage.size, Image.PERSPECTIVE, pil_koeffizienten_vor(V @ hom),
                    Image.BILINEAR), dtype=np.float32)
            if gezaehlt == 100:
                Image.fromarray(zurueck_f.astype(np.uint8)).save(
                    f"{ZIEL}/{name}_zurueck100.png")
            # Vor dem Aufsummieren verwischen: Veos verdorbene Buchstaben
            # flimmern von Bild zu Bild, und dichter Kleintext (die
            # Rollen-Tafel) ueberschritt damit die Streuungsschwelle und galt
            # als "bewegt" — dieselbe Falle wie beim Farbmaximum, in anderer
            # Gestalt. Ein Koerper bewegt sich im Grossen und ueberlebt die
            # Verwischung; Buchstabenflimmern nicht.
            zurueck = np.asarray(Image.fromarray(grau(zurueck_f).astype(np.uint8))
                                 .filter(ImageFilter.GaussianBlur(9)), dtype=np.float64)
            summe += zurueck
            summe2 += zurueck * zurueck
            stapel.append(zurueck.astype(np.uint8))
            # Groesster Farbunterschied je Pixel ueber den ganzen Take. Ein
            # einziger Frame, in dem hier Haut statt Schirm steht (oder Schirm
            # statt Haut), reicht — genau das fehlte der Streuung: der Mann in
            # h4 erreicht die Schirmkante erst in der letzten Sekunde.
            d = (np.abs((zurueck_f[..., 0] - zurueck_f[..., 1])
                        - (vorlage_farbe[..., 0] - vorlage_farbe[..., 1]))
                 + np.abs((zurueck_f[..., 2] - zurueck_f[..., 1])
                          - (vorlage_farbe[..., 2] - vorlage_farbe[..., 1])))
            np.maximum(farbmax, d, out=farbmax)
            gezaehlt += 1
    ein.stdout.close()
    ein.wait()

    n = len(abbildungen)
    ausgelassen = sum(1 for a in abbildungen if a is None)
    if n == 0 or ausgelassen > 0.05 * n:
        print(f"VERWORFEN: {name}  {ausgelassen} von {n} Bildern nicht messbar "
              f"(Guete {np.mean(guete) if guete else 0:.3f}) — der Take bleibt, "
              f"wie er ist", flush=True)
        return

    # Luecken ueberbruecken — und NICHT glaetten. Die Glaettung nahm dem
    # Text das echte Zittern des Takes und liess ihn gegen den Rahmen
    # wackeln (zittern_horizon.py: 0,4 bis 0,8 px im Mittel, Spitzen bis
    # 4 px). Die Sub-Pixel-Ausrichtung folgt dem Rahmen Bild fuer Bild.
    ecken = np.array([[0, 0], [vorlage.size[0], 0], [0, vorlage.size[1]],
                      [vorlage.size[0], vorlage.size[1]]], dtype=np.float64)

    def bahn_aus(abbildungen):
        gemessen = [i for i, a in enumerate(abbildungen) if a is not None]
        reihen = []
        for i in range(n):
            a = abbildungen[i]
            if a is None:
                j = min(gemessen, key=lambda k: abs(k - i))
                a = abbildungen[j]
            reihen.append((a / a[2, 2]).ravel()[:8])
        ruhig = np.asarray(reihen, dtype=np.float64)
        # Einzelne Ausreisser-Bilder fangen — kein Glaetten: nur wenn EIN
        # Bild von beiden Nachbarn abweicht, die Nachbarn aber zueinander
        # passen, wird es zwischen sie gelegt. Echte Bewegung bleibt.

        def lage(h8):
            hm = np.append(h8, 1.0).reshape(3, 3)
            p = hm @ np.c_[ecken, np.ones(4)].T
            return (p[:2] / p[2]).T
        lagen = np.array([lage(r) for r in ruhig])
        gefangen = 0
        for i in range(1, n - 1):
            mitte = (lagen[i - 1] + lagen[i + 1]) / 2
            if (np.abs(lagen[i] - mitte).max() > 0.25
                    and np.abs(lagen[i - 1] - lagen[i + 1]).max() < 0.8):
                hm = perspektive(list(zip(map(tuple, ecken), map(tuple, mitte))))
                ruhig[i] = (hm / hm[2, 2]).ravel()[:8]
                lagen[i] = mitte
                gefangen += 1
        np.save(f"{ZIEL}/{name}_bahn.npy", lagen)
        if gefangen:
            print(f"  {name}: {gefangen} Ausreisser-Bilder zwischen ihre Nachbarn gelegt",
                  flush=True)
        return ruhig
    ruhig = bahn_aus(abbildungen)

    # Menschen aus der Einsetzflaeche herausnehmen.
    #
    # Die Verdeckungspruefung ueber den Unterschied Take/Standbild ist die
    # falsche Stellschraube: bei 5 Pixeln Verwischung haelt sie den
    # verdorbenen Text fuer einen Menschen und unterdrueckt die Reparatur an
    # den Buchstaben; bei 40 haelt sie einen Menschen, der sich nur wenig
    # bewegt, nicht mehr fuer einen Menschen — dann wird das Standbild samt
    # Person in alter Haltung ueber die bewegte gelegt, und man sieht sie
    # doppelt. Beides ist passiert.
    #
    # Der verlaessliche Unterschied ist ein anderer: ein Bildschirm steht
    # still, ein Mensch bewegt sich. In die Koordinaten der Vorlage
    # zurueckgerechnet, ist der Bildschirm ueber den ganzen Take hinweg
    # unveraendert — auch mit verdorbenem Text, denn der ist in jedem Bild
    # gleich verdorben. Wo die Streuung ueber die Zeit gross ist, steht ein
    # Mensch.
    if gezaehlt > 4 and not BEREICHE[name].get("ohne_streuung"):
        streuung = np.sqrt(np.maximum(summe2 / gezaehlt
                                      - (summe / gezaehlt) ** 2, 0.0))
        # Zwei Zeichen fuer "hier ist ein Mensch, im Standbild oder im Take":
        # die Helligkeit streut ueber die Zeit (grosse Koerper), oder die
        # Farbe weicht irgendwann einmal deutlich ab (Haut, Kleidung — auch
        # wenn ein Kopf nur kurz hineinragt, auch wenn die Person im
        # Standbild steht und im Take weggeht). Beides wird aus der Vorlage
        # dauerhaft herausgenommen; was das Standbild dort zeigt, ist kein
        # Bildschirm.
        # NUR die Streuung. Der groesste Farbunterschied ueber die Zeit
        # (farbmax) war ein Fehlgriff: ueber 200 Bilder erreicht fast jede
        # Buchstabenkante irgendwann einmal den Schwellwert — Kompressions-
        # rauschen, kein Mensch. 89 % der Flaeche galten als Mensch, die
        # Maske wurde ueberall halb, und der Text stand doppelt: halb
        # Standbild, halb Take. Menschen, die nur kurz hineinragen, faengt
        # die Farbpruefung JE EINZELBILD im zweiten Durchgang (frei_bunt).
        # Zum Nachsehen ohne Neulauf: die rohe Streuung ablegen.
        np.save(f"{ZIEL}/{name}_streuung.npy", streuung.astype(np.float32))
        # Schwelle NIEDRIG (5) und dann nach Groesse sieben, statt Schwelle
        # hoch. Mit Schwelle 10 fiel der Kopf der Frau in h4 heraus: sie
        # bewegt ihn wenig, die Streuung liegt dort teils unter 10 — und im
        # Ergebnis lag ihr Gesicht aus dem Standbild halb ueber dem Gesicht
        # aus dem Take (bei 7,0 s ein zweites Augenpaar). Mit Schwelle 5 ist
        # der ganze Koerper samt Kopf ein zusammenhaengender Fleck; was
        # sonst noch ueber 5 liegt (Veos flimmernde Portraetkreise, Text bis
        # etwa 3), sind kleine Inseln — die fallen ueber die Mindestflaeche
        # heraus (ein halbes Prozent der Vorlage, in h4 rund 2 350 Pixel).
        grob = streuung > 5.0
        # Zweites Zeichen: wo das STANDBILD etwas zeigt, was der Take die
        # meiste Zeit nicht zeigt. Die Streuung uebersieht, was nur kurz da
        # ist — die Frau in h4 steht im Standbild links, geht in den ersten
        # Bildern nach rechts, und dort, wo ihr Haar war, zeigt der Take
        # 195 von 200 Bildern lang Schirm: Streuung 0,7. Ihr Haar aus dem
        # Standbild lag dann dauerhaft als dunkler Schatten neben ihrem
        # Kopf. Und die Pruefung je Einzelbild sieht dunkles Haar auf
        # dunklem Schirm nicht (Helligkeit und Farbe fast gleich). Also:
        # Median ueber die Zeit gegen das Standbild, grob verwischt, damit
        # Buchstabenflimmern verschwindet und nur Flaechen bleiben.
        median = np.empty_like(streuung)
        block = np.stack(stapel)
        for y0 in range(0, median.shape[0], 40):
            median[y0:y0 + 40] = np.median(block[:, y0:y0 + 40], axis=0)
        del block
        stand_g = gaussian_filter(vorlage_g, 9, truncate=2.5)
        abweichung = gaussian_filter(np.abs(stand_g - median), 6, truncate=2.5)
        np.save(f"{ZIEL}/{name}_abweichung.npy", abweichung.astype(np.float32))
        # Nur, wo das Standbild DUNKEL ist (Haar, dunkle Kleidung) — denn
        # auch verdorbener Text und Veos Portraetkreise weichen vom Median
        # ab (6 bis 10), aber die sind hell. Und "dunkel" heisst: kein
        # heller Pixel im Umkreis, damit Buchstaben samt Umfeld draussen
        # bleiben. Was dann noch uebrig ist, haengt am Streuungsfleck des
        # Koerpers und uebersteht die Mindestflaeche; einzelne dunkle
        # Flecken zwischen den Linien nicht.
        dunkel = np.asarray(Image.fromarray(vorlage_g.astype(np.uint8))
                            .filter(ImageFilter.MaxFilter(15)), dtype=np.float32) < 70
        grob |= (abweichung > 4.0) & dunkel
        marken, anzahl = ndimage.label(grob)
        if anzahl:
            flaechen = ndimage.sum(grob, marken, np.arange(1, anzahl + 1))
            gross = np.flatnonzero(flaechen >= 0.005 * grob.size) + 1
            grob = np.isin(marken, gross)
        # Und NUR dort, wo im Standbild ein Mensch steht ("menschen", von
        # Hand gesetzt). Der Zweck der Streuungsmaske ist allein, den
        # Menschen aus dem Standbild nicht ueber den bewegten zu legen. Wo
        # das Standbild reinen Bildschirm zeigt und nur im Take jemand
        # vorbeigeht, reicht die Pruefung je Einzelbild (verdeckung) — und
        # der Text ist wieder lesbar, sobald die Person weg ist, statt fuer
        # den ganzen Take verdorben zu bleiben (h6: "Verifikation",
        # "Sanktionen", "Verbuchung" waren das).
        menschen = BEREICHE[name].get("menschen")
        if menschen:
            wo = np.zeros_like(grob)
            for (x0, y0, x1, y1) in menschen:
                wo[max(0, y0 - kasten[1]):max(0, y1 - kasten[1]),
                   max(0, x0 - kasten[0]):max(0, x1 - kasten[0])] = True
            grob &= wo
        bewegt = Image.fromarray((grob * 255).astype(np.uint8))
        bewegt = bewegt.filter(ImageFilter.MaxFilter(13)) \
                       .filter(ImageFilter.GaussianBlur(6))
        teil = Image.fromarray(
            (np.asarray(teil, dtype=np.float32)
             * (1.0 - np.asarray(bewegt, dtype=np.float32) / 255.0)
             ).astype(np.uint8))
        bewegt.save(f"{ZIEL}/{name}_bewegt.png")
        anteil = float((np.asarray(bewegt) > 128).mean())
        print(f"  {name}: {anteil * 100:.0f} % der Flaeche bewegt sich "
              f"(Menschen) und bleibt aus dem Take", flush=True)

        # Noch einmal verfolgen, jetzt ohne die bewegten Flaechen. Im
        # ersten Durchgang kennt die Ausrichtung nur die von Hand gesetzten
        # Menschen-Rechtecke; Haende, die darueber hinaus ueber die Tafel
        # streichen (h5), gehen als Ausreisser in die Messung ein und
        # lassen die Lage um ein paar Zehntel wackeln. Mit der gemessenen
        # Bewegungsmaske ist die Vorlage sauber; Startwert je Bild ist die
        # Lage aus dem ersten Durchgang, also konvergiert es sofort.
        ruhig_maske = lk_maske & ~(np.asarray(bewegt, dtype=np.float32) > 64)
        if anteil > 0.02 and ruhig_maske.sum() > 0.25 * lk_maske.sum():
            lk2 = ausrichten.Vorlage(vorlage_g, maske=ruhig_maske, modell=modell)
            ein = subprocess.Popen(
                [FFMPEG, "-v", "error", "-i", quelle, "-vf", f"scale={B}:{H},fps={FPS}",
                 "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
            neu_abb, i = [], 0
            while True:
                roh = ein.stdout.read(B * H * 3)
                if len(roh) < B * H * 3:
                    break
                fen = grau(np.frombuffer(roh, dtype=np.uint8).astype(np.float32)
                           .reshape(H, B, 3))[fenster[1]:fenster[3], fenster[0]:fenster[2]]
                start = np.append(ruhig[min(i, n - 1)], 1.0).reshape(3, 3)
                hom2, gh2, _ = ausrichten.verfeinern(lk2, fen, start)
                neu_abb.append(hom2 if gh2 >= LK_MINDEST else start)
                i += 1
            ein.stdout.close()
            ein.wait()
            if len(neu_abb) == n:
                ruhig = bahn_aus(neu_abb)
                print(f"  {name}: zweiter Durchgang der Verfolgung ohne bewegte Flaechen",
                      flush=True)

    # ZWEITER DURCHGANG: einsetzen.
    ein = subprocess.Popen(
        [FFMPEG, "-v", "error", "-i", quelle, "-vf", f"scale={B}:{H},fps={FPS}",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    ziel = f"{ZIEL}/{name}.mp4"
    aus = subprocess.Popen(
        [FFMPEG, "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{B}x{H}", "-r", str(FPS), "-i", "-", "-an",
         "-c:v", "libx264", "-preset", "slow", "-crf", "15",
         "-pix_fmt", "yuv420p", ziel], stdin=subprocess.PIPE)
    i = 0
    while True:
        roh = ein.stdout.read(B * H * 3)
        if len(roh) < B * H * 3:
            break
        f = np.frombuffer(roh, dtype=np.uint8).astype(np.float32).reshape(H, B, 3).copy()
        hom = np.append(ruhig[min(i, n - 1)], 1.0).reshape(3, 3)
        V = np.array([[1, 0, fenster[0]], [0, 1, fenster[1]], [0, 0, 1]], dtype=np.float64)
        koeff = pil_koeffizienten(V @ hom)
        mit = np.asarray(vorlage.transform((B, H), Image.PERSPECTIVE, koeff,
                                           Image.BICUBIC), dtype=np.float32)
        mitmaske = np.asarray(teil.transform((B, H), Image.PERSPECTIVE, koeff,
                                             Image.BILINEAR), dtype=np.float32) / 255.0
        frei = verdeckung(f, mit)
        maske = (mitmaske * frei)[..., None]
        f = f * (1 - maske) + mit * maske
        aus.stdin.write(f.clip(0, 255).astype(np.uint8).tobytes())
        i += 1

    aus.stdin.close()
    ein.stdout.close()
    aus.wait()
    ein.wait()
    print(f"festgehalten: {name}  {n} Bilder  Guete {np.mean(guete):.3f} "
          f"(min {np.min(guete):.3f})  ausgelassen {ausgelassen}  geglaettet  "
          f"{os.path.getsize(ziel) // 1024} KB", flush=True)


if __name__ == "__main__":
    for n in (sys.argv[1:] or list(BEREICHE)):
        festhalten(n)
    print("BILDSCHIRM FEST FERTIG", flush=True)
