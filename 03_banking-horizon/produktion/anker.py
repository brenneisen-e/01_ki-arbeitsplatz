#!/usr/bin/env python3
"""Quellen und Anker fuer den v06-Neudreh (kurze Takes, verkettete Szenen).

Zwei Sorten Bilder entstehen hier:

1. GRUENE STANDBILDER — deterministisch: das committete Stationsbild, dessen
   Monitorglas programmatisch Chroma wird (dieselbe Technik wie buero_gruen).
   Sie sind Start- oder Zielbild der Veo-Takes; im Standbild der App bleibt
   das Original mit eingekeyter Oberflaeche.

2. ANKER — die Zwischenstationen der Ketten: derselbe Raum, ein paar Schritte
   zurueck. Das Zentrum ist das ECHTE Zielbild (pixelgenau zurueckkomponiert,
   das Chroma bleibt unangetastet), nur die Umgebung wird vom Bildmodell
   erfunden. Damit existiert jede Bildschirmflaeche ab dem ersten Frame, in
   dem ihr Raum sichtbar ist — ein Schirm kann nicht mehr "aus dem Nichts"
   entstehen, weil jedes Teilstueck an einem Bild verankert ist, auf dem er
   schon steht (Erst-Sichtbarkeits-Regel im Pruefplan).
"""
import os
import sys

from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import bilder_neu as bn  # noqa: E402

APP = os.path.normpath(f"{HIER}/../public/images/operations-v04")
Q = f"{HIER}/quellen"
CHROMA = (0, 177, 64)

# Monitorglas je Station, am Standbild verifiziert (kaesten_check.png).
GLAS = {
    "s2": (0.3031, 0.1731, 0.8583, 0.7676),
    "s3": (0.3031, 0.1731, 0.8583, 0.7676),
    "s6": (0.303, 0.175, 0.857, 0.765),
    "s7": (0.316, 0.18, 0.826, 0.768),
    "s8": (0.3031, 0.1731, 0.8583, 0.7676),
    "s9": (0.3031, 0.1731, 0.8583, 0.7676),
}


def gruenes_still(station):
    ziel = f"{Q}/g_{station}.png"
    if os.path.exists(ziel):
        return print(f"g_{station} existiert", flush=True)
    b = Image.open(f"{APP}/{station}.jpg").convert("RGB")
    x0, y0, x1, y1 = GLAS[station]
    ImageDraw.Draw(b).rectangle((round(x0 * 1920), round(y0 * 1080),
                                 round(x1 * 1920), round(y1 * 1080)), fill=CHROMA)
    b.save(ziel)
    print(f"g_{station} ok (programmatisch)", flush=True)


def s10_169():
    ziel = f"{Q}/s10_169.png"
    if os.path.exists(ziel):
        return print("s10_169 existiert", flush=True)
    Image.open(f"{APP}/s10.jpg").convert("RGB").save(ziel)
    print("s10_169 ok", flush=True)


def zoomout(quelle, ziel, umgebung):
    """Der Anker ist eine NEUE Ganzbild-Aufnahme desselben Raums, ein paar
    Schritte zurueck — kein Zurueckkleben von Pixeln: eine Collage traegt
    sichtbare Naehte (gesichtet in quellen_check.png), und exakt muss nur
    das ENDE der Kette sein, das ohnehin auf dem echten Still landet."""
    if os.path.exists(f"{Q}/{ziel}.png"):
        return print(f"{ziel} existiert", flush=True)
    b = Image.open(f"{Q}/{quelle}").convert("RGB")
    neu = bn.edit([bn.polstern(b)],
                  "Rebuild this exact scene as one natural photograph taken from a few steps "
                  "further back: the same room, the same single woman in the same position and "
                  "clothing, the same furniture and light. Newly visible around it: " + umgebung
                  + " EVERY SCREEN STAYS A COMPLETELY FLAT, UNIFORM, MATTE, SATURATED CHROMA-KEY "
                  "GREEN RECTANGLE — nothing displayed on it, no reflection, no gradient. "
                  "One seamless photorealistic image, consistent perspective and exposure, "
                  "no picture-in-picture, no frames, no text, no additional people.")
    bn.entpolstern(neu).save(f"{Q}/{ziel}.png")
    print(f"{ziel} ok", flush=True)


if __name__ == "__main__":
    for s in GLAS:
        gruenes_still(s)
    s10_169()
    bn.client = bn.client or __import__("openai").OpenAI()
    bn.s2b_rein()
    zoomout("besprechung_gruen.png", "a_bespr",
            "the wide open doorway of the round meeting room and the calm open office floor "
            "around it, oak frames, warm white walls, a hint of the corridor.")
    zoomout("kabine_gruen.png", "a_kabine",
            "the curved white acoustic focus pod standing on the open office floor, its round "
            "opening framing the center, calm workspace around it, wooden floor.")
    zoomout("g_s7.png", "a_werk",
            "the doorway and front wall of this small focused workroom, seen from the corridor, "
            "glass partition and warm wall.")
    zoomout("s10_169.png", "a_dach",
            "the glass exit of the stairwell onto the roof garden, planters and wooden deck "
            "framing the view.")
    print("ANKER FERTIG", flush=True)
