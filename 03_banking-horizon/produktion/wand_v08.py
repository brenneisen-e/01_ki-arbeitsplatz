#!/usr/bin/env python3
"""Wandanzeige des Teamraums (09:00) vollstaendig ins Bild holen.

Aus dem Review: „warum ist in dem team meeting der bildschirm immer
abgeschnitten". Grund war die Geometrie der Quelle: die Chroma-Flaeche der
Wandanzeige lief bei y=4 aus dem Bild heraus. Die Anzeige hatte also gar
keine Oberkante — egal wie der Ausschnitt gelegt wurde, sie sass immer bündig
am oberen Rand und las sich als angeschnitten.

Hier wird der Wandstreifen neu aufgebaut, und zwar rechnerisch statt ueber
ein Bildmodell: die Menschen, die Holo-Agenten, der Tisch und der ganze
Vordergrund bleiben Pixel fuer Pixel stehen. Nur oberhalb der Koepfe wird
gemalt — Wandflaeche aus den benachbarten Wandspalten fortgeschrieben, darauf
eine Anzeige mit sichtbarem Rahmen, Schlagschatten und klarem Abstand zur
Bildkante.

Nebenbei werden die wenigen Pixel entsaettigt, die die Holo-Silhouette am
rechten Bildrand faelschlich als Chroma durchgehen liessen.

    python3 wand_v08.py
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import keyen  # noqa: E402

BILD = f"{HIER}/quellen_v08/besprechung_gruen.png"

CHROMA = (8, 168, 63)
RAHMEN = (24, 26, 28)

# Der neu gemalte Bereich: oberhalb der Koepfe, zwischen den beiden sauberen
# Wandspalten. Alles ausserhalb bleibt unberuehrt.
FELD = (548, 0, 1516, 314)
# Referenzspalten, aus denen die Wandfarbe je Zeile kommt.
LINKS, RECHTS = (488, 544), (1524, 1592)

# Neue Anzeige: Innenflaeche im Verhaeltnis der gerenderten Oberflaeche
# (3,125:1), mit Rahmen und 28 px Luft zur Bildkante.
INNEN_H = 258
INNEN_B = round(INNEN_H * 3.125)
MITTE_X = 1031
INNEN = (MITTE_X - INNEN_B // 2, 38, MITTE_X - INNEN_B // 2 + INNEN_B, 38 + INNEN_H)
RAND = 9


def wandfarben(a, y0, y1):
    """Je Bildzeile die Wandfarbe links und rechts, vertikal geglaettet."""
    l = np.median(a[y0:y1, LINKS[0]:LINKS[1]].astype(np.float32), axis=1)
    r = np.median(a[y0:y1, RECHTS[0]:RECHTS[1]].astype(np.float32), axis=1)
    for s in (l, r):
        for k in range(3):
            s[:, k] = ndimage.gaussian_filter1d(s[:, k], 9.0, mode="nearest")
    return l, r


def wand(a):
    """Den Wandstreifen aus den Nachbarspalten fortschreiben."""
    x0, y0, x1, y1 = FELD
    l, r = wandfarben(a, y0, y1)
    t = np.linspace(0.0, 1.0, x1 - x0, dtype=np.float32)[None, :, None]
    flaeche = l[:, None, :] * (1 - t) + r[:, None, :] * t
    # Etwas Korn, sonst steht dort eine unnatuerlich glatte Flaeche.
    korn = np.random.default_rng(8).normal(0.0, 2.1, flaeche.shape[:2])[..., None]
    return np.clip(flaeche + korn, 0, 255).astype(np.uint8)


def anzeige(bild):
    """Rahmen, Schatten und Chroma-Flaeche auf die Wand setzen."""
    ix0, iy0, ix1, iy1 = INNEN
    aussen = (ix0 - RAND, iy0 - RAND, ix1 + RAND, iy1 + RAND)

    schatten = Image.new("L", bild.size, 0)
    ImageDraw.Draw(schatten).rounded_rectangle(
        (aussen[0] - 3, aussen[1] + 5, aussen[2] + 3, aussen[3] + 11), 20, fill=150)
    schatten = schatten.filter(ImageFilter.GaussianBlur(13))
    bild = Image.composite(Image.new("RGB", bild.size, (58, 50, 44)), bild, schatten)

    z = ImageDraw.Draw(bild)
    z.rounded_rectangle(aussen, 12, fill=RAHMEN)
    # Feiner heller Grat auf der Oberkante — sonst wirkt der Rahmen aufgeklebt.
    z.line((aussen[0] + 12, aussen[1] + 1, aussen[2] - 12, aussen[1] + 1),
           fill=(96, 98, 100), width=2)
    z.rectangle(INNEN, fill=CHROMA)
    return bild


def holo_saum(a):
    """Die paar Pixel der Holo-Silhouette entsaettigen, die als Chroma zaehlen."""
    m = keyen.maske(a)
    m[:FELD[3] + 40, :] = False          # die Anzeige selbst bleibt, wie sie ist
    if not m.any():
        return a, 0
    a = a.copy()
    grau = a[m].astype(np.float32)
    grau[:, 1] = grau[:, [0, 2]].mean(axis=1) + 12
    a[m] = np.clip(grau, 0, 255).astype(np.uint8)
    return a, int(m.sum())


if __name__ == "__main__":
    a = np.asarray(Image.open(BILD).convert("RGB")).copy()
    alt = keyen.kasten(keyen.maske(a))
    print("vorher :", alt, flush=True)

    x0, y0, x1, y1 = FELD
    a[y0:y1, x0:x1] = wand(a)
    a, saum = holo_saum(a)
    fertig = anzeige(Image.fromarray(a))
    fertig.save(BILD)

    m = keyen.maske(np.asarray(Image.open(BILD).convert("RGB")))
    lab, n = ndimage.label(m)
    gross = [int((lab == i).sum()) for i in range(1, n + 1)]
    print("nachher:", keyen.kasten(m), "| Flaechen:", sorted(gross, reverse=True)[:4],
          "| Holo-Saum entsaettigt:", saum, "px", flush=True)
    print("Luft ueber der Anzeige:", INNEN[1] - RAND, "px", flush=True)
