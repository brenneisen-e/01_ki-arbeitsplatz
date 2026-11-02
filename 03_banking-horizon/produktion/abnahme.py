#!/usr/bin/env python3
"""Automatische Abnahme der Uebergaenge — die messbare Haelfte der DoD.

Je Clip: Anschluss erstes/letztes Bild gegen die Standbilder, Restchroma je
Frame (um 1 px erodiert, damit Antialiasing-Saeume der UI-Kurven nicht
anschlagen), Schwarzbildpruefung. Die Sichtung (Duplikate, Tuerlogik, Poppen)
ersetzt das nicht — dafuer gibt es die dichten Kontaktboegen (dicht.py).
"""
import os
import sys

import imageio_ffmpeg
import numpy as np
from PIL import Image
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__))
FASSUNG = os.environ.get("FASSUNG", "v04")

# Gesichtete, akzeptierte Gruenflaechen, die KEINE Keying-Reste sind. Die
# Schranken quittieren den Check-in mit gruenen Status-LEDs — echter Inhalt,
# spektral nicht von Chroma zu unterscheiden. Wert = zulaessige Pixel.
AUSNAHMEN = {"home-s0": 600}
APP = os.path.normpath(f"{HIER}/../public")
# v05 teilt sich die Standbilder mit v04; v06 hat einen eigenen Bildsatz.
BILDER = "v04" if FASSUNG == "v05" else FASSUNG
IMG, VID = f"{APP}/images/operations-{BILDER}", f"{APP}/videos/operations-{FASSUNG}"


def chroma(a):
    """Chroma heisst leerer Rotkanal — UI-Gruen (r=52) und Blattgruen tragen Rot."""
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    return (r < 30) & (g > 50) & (g - r > 45) & (g - b > 28)


def pruefe(name):
    von, nach = name.split("-")
    leser = imageio_ffmpeg.read_frames(f"{VID}/{name}.mp4")
    meta = leser.__next__()
    w, h = meta["size"]
    fr = [np.frombuffer(f, dtype=np.uint8).reshape(h, w, 3) for f in leser]

    def diff(a, pfad):
        b = np.asarray(Image.open(pfad).convert("RGB").resize((w, h)))
        return float(np.abs(a.astype(int) - b.astype(int)).mean())

    kopf = diff(fr[0], f"{IMG}/{von}.jpg")
    schwanz = diff(fr[-1], f"{IMG}/{nach}.jpg")
    gruen = max(int(ndimage.binary_erosion(chroma(a)).sum()) for a in fr)
    flach = sum(1 for a in fr[::8] if float(a.std()) < 6)
    urteile = []
    if kopf >= 5: urteile.append(f"KOPF {kopf:.1f}")
    if schwanz >= 5: urteile.append(f"SCHWANZ {schwanz:.1f}")
    if gruen >= AUSNAHMEN.get(name, 200): urteile.append(f"GRUEN {gruen}")
    if flach: urteile.append(f"FLACH {flach}")
    stand = "OK " if not urteile else "!! "
    print(f"{stand}{name:10s} Kopf {kopf:4.1f}  Schwanz {schwanz:4.1f}  "
          f"Restchroma {gruen:6d}  {' '.join(urteile)}", flush=True)
    return not urteile


if __name__ == "__main__":
    clips = sys.argv[1:] or sorted(
        os.path.splitext(f)[0] for f in os.listdir(VID) if f.endswith(".mp4"))
    heil = all([pruefe(c) for c in clips])
    print("ABNAHME", "BESTANDEN" if heil else "MIT BEFUNDEN", flush=True)
