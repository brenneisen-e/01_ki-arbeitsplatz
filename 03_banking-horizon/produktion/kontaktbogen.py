#!/usr/bin/env python3
"""Kontaktbogen: 12 Frames eines Clips als ein Blatt (grobe Erst-Sichtung).

Fuer die eigentliche Abnahme gilt die DICHTE Sichtung (dicht.py, jeder
3. Frame) — dieser Bogen dient nur dem schnellen Ueberblick.
"""
import os
import sys

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw


def bogen(pfad, ziel, spalten=4, zeilen=3, breite=478):
    leser = imageio_ffmpeg.read_frames(pfad)
    meta = leser.__next__()
    w, h = meta["size"]
    fr = [np.frombuffer(f, dtype=np.uint8).reshape(h, w, 3) for f in leser]
    n = len(fr)
    hoehe = round(breite * h / w)
    blatt = Image.new("RGB", (spalten * breite, zeilen * hoehe + 24), (14, 15, 17))
    d = ImageDraw.Draw(blatt)
    for i in range(spalten * zeilen):
        idx = round(i * (n - 1) / (spalten * zeilen - 1))
        b = Image.fromarray(fr[idx]).resize((breite, hoehe))
        x, y = (i % spalten) * breite, (i // spalten) * hoehe
        blatt.paste(b, (x, y))
        d.text((x + 8, y + 6), f"{idx}/{n - 1}", fill=(255, 255, 255))
    d.text((8, zeilen * hoehe + 4), os.path.basename(pfad), fill=(180, 190, 200))
    blatt.save(ziel, quality=88)
    return n


if __name__ == "__main__":
    print(bogen(sys.argv[1], sys.argv[2]), "Frames")
