#!/usr/bin/env python3
"""Figurenblatt fuer Mara — 15 Ansichten auf drei Bogen.

Das alte Blatt (quellen/mara_ref.png) hatte drei stehende Ansichten. Fuer die
neue Bildstrecke ist das zu duenn: Mara sitzt in der Haelfte der Szenen und
laeuft in den Uebergaengen. Ohne Vorlage fuer diese Haltungen erfindet das
Bildmodell jedes Mal neu, wie sie im Sitzen aussieht — und dann wandert das
Gesicht von Szene zu Szene.

Drei Bogen zu je fuenf Ansichten, jeder in voller Aufloesung:

    mara_stehend.png   frontal, dreiviertel links, Profil, dreiviertel rechts, Ruecken
    mara_sitzend.png   am Schreibtisch, am Tisch, auf dem Hocker, zurueckgelehnt, zugewandt
    mara_gehend.png    auf die Kamera zu, schraeg, Profil im Schritt, schraeg von hinten, Ruecken

Anker ist das alte Blatt: dieselbe Person, dieselbe Kleidung. Die drei Bogen
werden anschliessend zu quellen_v08/mara_ref.png untereinandergesetzt und in
allen Szenen-Prompts als Referenz mitgegeben.

    SCRATCH=… python3 mara_blatt.py
"""
import base64
import io
import os
import sys
import time

from openai import OpenAI
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

ANKER = f"{HIER}/quellen/mara_ref.png"
ORDNER = f"{HIER}/quellen_v08"

PERSON = (
    "The woman is the exact same person as in the reference: mid-thirties, dark chin-length "
    "bob with a centre parting, calm neutral expression, black single-button blazer over a "
    "plain white top, navy tailored trousers, black loafers. Same face, same haircut, same "
    "clothes in every panel. "
)
BOGEN = (
    "Character reference sheet: FIVE full-body panels side by side in one row, equal width, "
    "evenly spaced, plain light grey studio background, flat even studio lighting, no shadows "
    "on the background, no text, no labels, no numbers, no watermark, no props other than "
    "those named. Photorealistic, sharp, full figure visible in every panel, feet not cropped. "
    "Anatomically correct hands, exactly five figures, all the same person. "
)

BOGENSATZ = {
    "mara_stehend": (
        BOGEN + PERSON +
        "She is STANDING in all five panels, arms relaxed at her sides. From left to right the "
        "camera goes around her: 1) straight front view, 2) three-quarter view turned 45 degrees "
        "to her left, 3) full side profile, 4) three-quarter view turned 45 degrees to her right, "
        "5) straight back view."),
    "mara_sitzend": (
        BOGEN + PERSON +
        "She is SEATED in all five panels, on a plain dark office chair or stool, full figure "
        "visible. From left to right: 1) seated upright facing the camera, hands resting on her "
        "thighs, 2) seated in three-quarter view, leaning slightly forward as if listening, "
        "3) seated in full side profile on a bar stool, back straight, 4) seated leaning back, "
        "one leg crossed over the other, three-quarter view, 5) seated seen from behind, head "
        "turned slightly to the side."),
    "mara_gehend": (
        BOGEN + PERSON +
        "She is WALKING in all five panels, mid-stride, natural gait, arms swinging naturally. "
        "From left to right: 1) walking straight towards the camera, 2) walking towards the "
        "camera in three-quarter view, 3) full side profile mid-stride, 4) walking away in "
        "three-quarter view from behind, 5) walking straight away from the camera, seen from "
        "behind."),
}


def anker():
    p = io.BytesIO(open(ANKER, "rb").read())
    p.name = "mara.png"
    return p


def bogen(name, prompt, versuche=3):
    ziel = f"{ORDNER}/{name}.png"
    for v in range(versuche):
        try:
            r = client.images.edit(model="gpt-image-2", image=[anker()], prompt=prompt,
                                   size="1536x1024", quality="high")
            Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB").save(ziel)
            print("  ", ziel, flush=True)
            return ziel
        except Exception as e:
            print(f"  Versuch {v + 1}: {str(e)[:160]}", flush=True)
            time.sleep(10 * (v + 1))
    raise SystemExit(f"{name}: Bildmodell antwortet nicht")


if __name__ == "__main__":
    os.makedirs(ORDNER, exist_ok=True)
    namen = sys.argv[1:] or list(BOGENSATZ)
    for n in namen:
        print(n, flush=True)
        bogen(n, BOGENSATZ[n])

    # Die drei Bogen untereinander — ein Blatt, das als Referenz mitgeht.
    teile = [Image.open(f"{ORDNER}/{n}.png").convert("RGB") for n in BOGENSATZ]
    blatt = Image.new("RGB", (1536, 1024 * len(teile)), (238, 238, 238))
    for i, t in enumerate(teile):
        blatt.paste(t.resize((1536, 1024), Image.LANCZOS), (0, 1024 * i))
    blatt.save(f"{ORDNER}/mara_ref.png")
    print("Figurenblatt:", f"{ORDNER}/mara_ref.png", blatt.size, flush=True)
