#!/usr/bin/env python3
"""Erst-Sichtbarkeits-Pruefung auf den ROH-Takes (vor der Montage).

Die Fehlerklasse aus Defekt 19: ein Raum ist sichtbar, seine Bildschirm-
flaeche aber noch nicht — sie poppt spaeter herein. Auf dem Roh-Take ist
das messbar, solange die Flaeche noch Chroma ist: der Flaechenverlauf
(strenge Chroma-Pixel je Frame) muss STETIG wachsen oder schrumpfen
(Anfahrt, Schwenk, Verlassen). Ein SCHRITT — von praktisch null auf gross
innerhalb weniger Frames, mitten im Take — ist ein Aufpoppen; der
umgekehrte Schritt ein Verschwinden. Der Blockdetektor in dicht.py sieht
das waehrend Kamerafahrten nicht, weil er auf den Bewegungs-Median
normiert; dieser Test misst die Flaeche selbst und ist fahrtunabhaengig.

Ausgabe je Take: OK oder SPRUNG/VERLUST mit Frame-Nummer. Jeder Befund
wird am Kontaktbogen gesichtet, bevor irgendetwas montiert wird.
"""
import os
import sys

import imageio_ffmpeg
import numpy as np

S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                              "4a027885-72f4-58d1-b5d9-f5090d47fbf4/scratchpad")
VEO = f"{S}/kling_v07"

# Schwellen bei halber Aufloesung (960x540): "gross" ~ ein Zwoelftel-Monitor.
KLEIN, GROSS, FENSTER = 200, 3000, 4


def kurve(pfad):
    leser = imageio_ffmpeg.read_frames(pfad)
    meta = leser.__next__()
    w, h = meta["size"]
    werte = []
    for f in leser:
        a = np.frombuffer(f, dtype=np.uint8).reshape(h, w, 3)[::2, ::2]
        r = a[..., 0].astype(np.int16)
        g = a[..., 1].astype(np.int16)
        b = a[..., 2].astype(np.int16)
        werte.append(int(((r < 40) & (g > 50) & (g - r > 45) & (g - b > 25)).sum()))
    return werte


def pruefe(name):
    k = kurve(f"{VEO}/{name}.mp4")
    n = len(k)
    befunde = []
    for i in range(FENSTER, n):
        vorher = max(k[max(0, i - FENSTER):i])
        if k[i] > GROSS and vorher < KLEIN and i > 6:
            befunde.append(f"SPRUNG bei Frame {i} ({vorher} -> {k[i]} px)")
        if k[i] < KLEIN and min(k[max(0, i - FENSTER):i]) > GROSS and i < n - 6:
            befunde.append(f"VERLUST bei Frame {i}")
    erster = next((i for i, v in enumerate(k) if v > KLEIN), None)
    lage = f"gruen ab F{erster}, max {max(k)} px" if erster is not None else "kein Chroma"
    urteil = "; ".join(befunde) if befunde else "OK"
    print(f"{name:12s} {lage:28s} {urteil}", flush=True)
    return not befunde


if __name__ == "__main__":
    nur = sys.argv[1:]
    takes = nur or sorted(t[:-4] for t in os.listdir(VEO) if t.endswith(".mp4"))
    schlecht = [t for t in takes if not pruefe(t)]
    print("ERSTSICHT:", "BEFUNDE: " + ", ".join(schlecht) if schlecht else "ALLE OK", flush=True)
