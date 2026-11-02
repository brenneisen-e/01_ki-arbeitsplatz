#!/usr/bin/env python3
"""Die Hypothesen-Standbilder ohne Naht zusammensetzen.

hypothesen_breit.py klebt die Originalhaelfte Pixel fuer Pixel in die
Erweiterung von gpt-image zurueck — mit einem 26 Pixel schmalen Saum an
beiden Raendern. Das war ein Irrtum mit Folgen: `images.edit` zeichnet die
Mitte NEU, und zwar nicht bloss unscharf, sondern um 20 bis 120 Pixel
verschoben und leicht verkleinert (gemessen mit der Kreuzkorrelation aus
bildschirm_fest.py: h2 Massstab 0,97, Ecken um bis zu 59 Pixel versetzt;
h5 bis zu 123 Pixel). An den Naehten bei x = 480 und x = 1440 (in 1920er
Koordinaten) stand deshalb alles doppelt, was die Naht kreuzt: der Becher
und die Zettel in h2, Haende und Aermel in h3, der Ruecken der Frau in h5,
ein Gesicht in h8. Veo hat das treu nachgedreht, und im Film sah man
Geisterbilder, die keine Nachbearbeitung erzeugt hatte.

Deshalb jetzt umgekehrt: die Neuzeichnung ist das Grundbild — sie ist in
sich stimmig, ohne Naht. Aus dem Original kommt NUR, was gpt-image nicht
kann: der Bildschirmtext. Jeder Bildschirm (jedes Schild) wird in der
Neuzeichnung gesucht, seine Lage als Homographie bestimmt, und der
Original-Ausschnitt wird perspektivisch genau dorthin gelegt. Die Kante
liegt dann auf dem Bildschirmrand, wo beide Bilder dasselbe zeigen.

Die neuen Lagen der Bildschirme (fuer BEREICHE in bildschirm_fest.py)
schreibt das Skript nach hypothesen/lagen.json und auf die Konsole.

    SCRATCH=… python3 hypothesen_fest.py           # h2 bis h8
    SCRATCH=… python3 hypothesen_fest.py h2 h5
"""
import json
import os
import shutil
import sys

import numpy as np
from PIL import Image, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
sys.argv, argv = sys.argv[:1], sys.argv          # bildschirm_fest liest argv nicht beim Import
import bildschirm_fest as bf                     # noqa: E402
from hypothesen_breit import SZENEN, MODELL_BILDER  # noqa: E402

ZIEL = f"{HIER}/hypothesen"
ROH = f"{ZIEL}/roh"
ALT = f"{ZIEL}/alt"
os.makedirs(ALT, exist_ok=True)

# Bildschirme und Schilder in den Koordinaten der ALTEN Standbilder (1920 x
# 1080), so wie sie in bildschirm_fest.py standen. Sie werden in die
# Originalhaelfte zurueckgerechnet und dort ausgeschnitten.
KAESTEN_ALT = {
 "h2": [(540, 360, 1085, 810)],
 "h3": [(630, 505, 800, 665), (895, 380, 1075, 545), (1100, 500, 1280, 665),
        (610, 735, 790, 910), (1155, 735, 1340, 910), (880, 870, 1065, 1055)],
 "h4": [(520, 60, 1330, 640)],
 "h5": [(300, 20, 1420, 700)],
 "h6": [(300, 120, 1560, 800)],
 "h7": [(500, 0, 1230, 840)],
 "h8": [(300, 60, 1480, 620)],
}
SUCHE = 140          # Suchspiel um die erwartete Lage, in 1536er Pixeln


def alt_nach_haelfte(k):
    """1920er Koordinaten des alten Standbilds -> Originalhaelfte (768 x 1024)."""
    x0, y0, x1, y1 = k
    return (int(round(x0 / 1.25)) - 384, int(round(y0 / 1.25)) + 80,
            int(round(x1 / 1.25)) - 384, int(round(y1 / 1.25)) + 80)


def roh_nach_neu(x, y):
    """1536er Koordinaten der Neuzeichnung -> neues Standbild (1920 x 1080)."""
    return x * 1.25, (y - 80) * 1.25


def einsetzen(name):
    kapitel, _ = SZENEN[name]
    quelle = Image.open(f"{MODELL_BILDER}/{kapitel}.png").convert("RGB")
    rechts = quelle.crop((768, 0, 1536, 1024))
    roh = Image.open(f"{ROH}/{name}_breit.png").convert("RGB")
    roh_g = bf.grau(np.asarray(roh, dtype=np.float32))
    aus = np.asarray(roh, dtype=np.float32).copy()
    lagen = []
    for k in KAESTEN_ALT[name]:
        hx0, hy0, hx1, hy1 = alt_nach_haelfte(k)
        hx0, hy0 = max(0, hx0), max(0, hy0)
        hx1, hy1 = min(768, hx1), min(1024, hy1)
        vorlage = rechts.crop((hx0, hy0, hx1, hy1))
        vg = bf.grau(np.asarray(vorlage, dtype=np.float32))
        # Erwartete Lage in der Neuzeichnung: Originalhaelfte sitzt bei +384.
        fx0, fy0 = max(0, hx0 + 384 - SUCHE), max(0, hy0 - SUCHE)
        fx1, fy1 = min(1536, hx1 + 384 + SUCHE), min(1024, hy1 + SUCHE)
        fen = roh_g[fy0:fy1, fx0:fx1]
        m, dx, dy, g = bf.suchen(fen, vorlage, np.arange(0.80, 1.061, 0.005))
        klotz = int(min(120, min(vorlage.size) / 3))
        hom, gh = bf.nachmessen(fen, vg, m, dx, dy, klotz=klotz, spiel=24)
        if hom is None:
            # Kein perspektivischer Fit: Massstab und Verschiebung reichen.
            hom = np.array([[m, 0, dx], [0, m, dy], [0, 0, 1.0]])
            gh = g
        V = np.array([[1, 0, fx0], [0, 1, fy0], [0, 0, 1]], dtype=np.float64)
        ganz = V @ hom
        koeff = bf.pil_koeffizienten(ganz)
        mit = np.asarray(vorlage.transform((1536, 1024), Image.PERSPECTIVE, koeff,
                                           Image.BICUBIC), dtype=np.float32)
        rand = 10
        if name == "h3":
            # Schilder: nur die hellen Striche (Rand, Symbol, Schrift). Die
            # halb durchsichtige Fuellung zeigt den Pullover dahinter, und
            # der steht in der Neuzeichnung woanders.
            x = np.asarray(vorlage, dtype=np.int16)
            lum = bf.grau(x.astype(np.float32))
            # Helle Striche sind weiss oder gruen — nie warm. Der beige Pullover
            # im Rechteck des KYC-Schilds ist auch hell; kam er mit, stand er als
            # heller Fleck still im Bild, waehrend die Frau sich bewegte.
            warm = (x[..., 0] - x[..., 2]) > 18
            strich = (((lum > 95) & ~warm) | ((x[..., 1] > x[..., 0] + 22)
                                              & (x[..., 1] > x[..., 2] + 18) & (x[..., 1] > 80)))
            teil = Image.fromarray((strich * 255).astype(np.uint8)) \
                        .filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
        else:
            teil = Image.new("L", vorlage.size, 0)
            teil.paste(Image.new("L", (vorlage.size[0] - 2 * rand, vorlage.size[1] - 2 * rand),
                                 255), (rand, rand))
            teil = teil.filter(ImageFilter.GaussianBlur(rand / 2))
        maske = np.asarray(teil.transform((1536, 1024), Image.PERSPECTIVE, koeff,
                                          Image.BILINEAR), dtype=np.float32) / 255.0
        # Im Kasten stehen auch Menschen (die Frau vor dem Schirm in h4, die
        # Koepfe in h8), und die stehen in der Neuzeichnung um Dutzende Pixel
        # woanders. Wo sich Original und Neuzeichnung im Grossen
        # unterscheiden (Koerper), bleibt die Neuzeichnung; wo sie sich nur
        # im Feinen unterscheiden (Buchstaben), kommt das Original. Genau die
        # Pruefung, die im Take Menschen von Text trennt.
        frei = bf.verdeckung(aus, aus * (1 - maske[..., None]) + mit * maske[..., None])
        maske = (maske * frei)[..., None]
        aus = aus * (1 - maske) + mit * maske
        # Neue Lage: die vier Ecken der Vorlage durch die Abbildung.
        ecken = []
        for (x, y) in [(0, 0), (vorlage.size[0], 0), (0, vorlage.size[1]), vorlage.size]:
            p = ganz @ np.array([x, y, 1.0])
            ecken.append(roh_nach_neu(p[0] / p[2], p[1] / p[2]))
        xs, ys = [e[0] for e in ecken], [e[1] for e in ecken]
        lage = [int(min(xs)), int(min(ys)), int(max(xs)) + 1, int(max(ys)) + 1]
        lagen.append(lage)
        print(f"  {name}: Kasten {k} -> Guete {g:.2f}/{gh:.2f}  Massstab {m:.3f}  "
              f"neue Lage {lage}", flush=True)

    ziel = f"{ZIEL}/{name}.png"
    if os.path.exists(ziel) and not os.path.exists(f"{ALT}/{name}.png"):
        shutil.copy(ziel, f"{ALT}/{name}.png")
    Image.fromarray(aus.clip(0, 255).astype(np.uint8)).crop((0, 80, 1536, 944)) \
         .resize((1920, 1080), Image.LANCZOS).save(ziel)
    print("fertig:", name, flush=True)
    return lagen


if __name__ == "__main__":
    namen = argv[1:] or [n for n in KAESTEN_ALT]
    pfad = f"{ZIEL}/lagen.json"
    alle = json.load(open(pfad)) if os.path.exists(pfad) else {}
    for n in namen:
        alle[n] = einsetzen(n)
    json.dump(alle, open(pfad, "w"), indent=1)
    print("HYPOTHESEN FEST FERTIG", flush=True)
