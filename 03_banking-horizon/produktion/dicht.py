#!/usr/bin/env python3
"""Dichte Sichtung: fast alle Frames als Boegen + Sprungdetektor.

Zwoelf Kacheln je Clip waren zu duenn — ein Durchquerer, ein falscher
Tueranschlag oder ein aufpoppender Schirm lebt oft nur zehn bis zwanzig
Frames und faellt durchs Raster. Hier: jeder 3. Frame als Kachel (64 je
8-Sekunden-Clip, zwei Blaetter), dazu ein Detektor, der abrupte OERTLICHE
Aenderungen zwischen Nachbarframes meldet — aufpoppende Objekte erzeugen
genau das, gleichmaessige Kamerafahrten nicht.
"""
import os
import sys

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

S = os.path.dirname(os.path.abspath(__file__))


def frames(pfad):
    leser = imageio_ffmpeg.read_frames(pfad)
    meta = leser.__next__()
    w, h = meta["size"]
    return [np.frombuffer(f, dtype=np.uint8).reshape(h, w, 3) for f in leser]


def boegen(fr, name, schritt=3, spalten=8, zeilen=4, breite=300):
    hoehe = round(breite * fr[0].shape[0] / fr[0].shape[1])
    je_blatt = spalten * zeilen
    idx = list(range(0, len(fr), schritt))
    ziele = []
    for b, start in enumerate(range(0, len(idx), je_blatt)):
        teil = idx[start:start + je_blatt]
        blatt = Image.new("RGB", (spalten * breite, zeilen * hoehe), (12, 13, 15))
        d = ImageDraw.Draw(blatt)
        for n, i in enumerate(teil):
            k = Image.fromarray(fr[i]).resize((breite, hoehe))
            x, y = (n % spalten) * breite, (n // spalten) * hoehe
            blatt.paste(k, (x, y))
            d.text((x + 5, y + 3), str(i), fill=(255, 240, 90))
        ziel = f"{S}/tag/dicht_{name}_{b}.jpg"
        blatt.save(ziel, quality=86)
        ziele.append(ziel)
    return ziele


def spruenge(fr, empfind=6.0):
    """Frames, in denen sich ein Bildbereich abrupt aendert.

    Mass: Differenz benachbarter Frames, blockweise (24er-Raster) summiert.
    Gemeldet wird, wo der staerkste Block ein Vielfaches des Medians aller
    Nachbarpaare ist — also eine oertliche Explosion, keine globale Bewegung.
    """
    klein = [np.asarray(Image.fromarray(a).resize((160, 96)), dtype=np.int16) for a in fr]
    werte = []
    for i in range(1, len(klein)):
        d = np.abs(klein[i] - klein[i - 1]).sum(axis=2)
        bloecke = d.reshape(6, 16, 10, 16).sum(axis=(1, 3))
        werte.append(float(bloecke.max()))
    med = np.median(werte) + 1
    treffer = [(i + 1, round(v / med, 1)) for i, v in enumerate(werte) if v / med > empfind]
    # Nachbartreffer zusammenfassen: ein Ereignis, nicht zehn Zeilen.
    gruppen = []
    for i, f in treffer:
        if gruppen and i - gruppen[-1][1] <= 4:
            gruppen[-1][1] = i
            gruppen[-1][2] = max(gruppen[-1][2], f)
        else:
            gruppen.append([i, i, f])
    return gruppen


if __name__ == "__main__":
    fassung = os.environ.get("FASSUNG", "v04")
    vid = f"/home/user/kiarbeitsplatz/03_banking-horizon/public/videos/operations-{fassung}"
    clips = sys.argv[1:] or sorted(os.path.splitext(f)[0] for f in os.listdir(vid) if f.endswith(".mp4"))
    for c in clips:
        fr = frames(f"{vid}/{c}.mp4")
        b = boegen(fr, c)
        g = spruenge(fr)
        meldung = "; ".join(f"F{a}-{e} (x{f})" for a, e, f in g) if g else "keine"
        print(f"{c:10s} {len(fr):4d} Frames, {len(b)} Blaetter, Spruenge: {meldung}", flush=True)
