#!/usr/bin/env python3
"""Die neun Kundenkacheln als HTML-Ebene ueber den Raum legen (08:10).

Bis v08 hat kacheln.py sie ins Bild gemalt — jede Aenderung an Orten,
Nachrichten oder Betraegen war damit eine Aenderung am Code. Jetzt stehen sie
in ui/kacheln_v08.html, demselben Weg wie die Bildschirme: austauschbar, ohne
dass ein Bild neu entstehen muss.

Was NICHT ins HTML wandern kann, ist das Glas: der Raum hinter jeder Kachel
wird weichgezeichnet und leicht aufgehellt, und dafuer muss man den Raum
kennen. Eine durchsichtig aufgenommene HTML-Ebene kennt ihn nicht. Also
bleibt der Glaseffekt hier — Raster und Masse kommen aus kacheln.py, damit
beide Seiten dieselbe Geometrie benutzen.
"""
import os
import sys

from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import kacheln  # noqa: E402


def ebene(scratch, stand=None):
    """Ein Bild der gerenderten Kachelebene (RGBA).

    `stand` ist ein Fortschritt zwischen 0 und 1 — 1 (oder nichts) ist das
    fertige Raster, kleinere Werte zeigen, wie weit die Kacheln erschienen
    sind. Die Folge selbst kommt aus ui/kacheln_v08.html.
    """
    ordner = f"{scratch}/ui/v08/f_kacheln"
    dateien = sorted(f for f in os.listdir(ordner) if f.endswith(".png"))
    if not dateien:
        raise SystemExit(f"keine Bilder in {ordner} — erst ui/alle_rendern_v08.sh")
    i = len(dateien) - 1 if stand is None else round(max(0.0, min(1.0, stand)) * (len(dateien) - 1))
    return Image.open(os.path.join(ordner, dateien[i])).convert("RGBA")


def legen(raum, schicht):
    """Glas rechnen, Ebene darueber."""
    bild = raum.convert("RGB").copy()
    for _n, kasten in kacheln.rastermasse(*bild.size):
        kacheln.glas(bild, kasten)
    if schicht.size != bild.size:
        schicht = schicht.resize(bild.size, Image.LANCZOS)
    bild.paste(schicht, (0, 0), schicht)
    return bild
