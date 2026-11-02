#!/usr/bin/env python3
"""Testbilder zu mehreren Bildrichtungen — eine Halle, vier Handschriften.

Die Bildsprache der ersten Fassung war verworfen. Statt zu raten, was
stattdessen passt, entwickeln mehrere Agenten je eine Richtung, und jede
bekommt DASSELBE Motiv: die Kundenhalle der Bank, Szene 1. Wer das
gewinnt, traegt den ganzen Film.

Die Prompts liegen als Textdateien in richtungen/<name>.txt, damit sie
nachlesbar sind und nicht im Code verschwinden.

    SCRATCH=… python3 probe_richtung.py            # alle, gleichzeitig
    SCRATCH=… python3 probe_richtung.py reportage  # einzeln
"""
import base64
import glob
import io
import os
import sys
import threading

from openai import OpenAI
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
QUELLE = f"{HIER}/richtungen"
ZIEL = f"{HIER}/richtungen/proben"
os.makedirs(ZIEL, exist_ok=True)

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()


def erzeugen(name, versuche=3):
    ziel = f"{ZIEL}/{name}.png"
    if os.path.exists(ziel):
        print(name, "liegt schon da", flush=True)
        return
    prompt = open(f"{QUELLE}/{name}.txt").read().strip()
    for versuch in range(1, versuche + 1):
        try:
            r = client.images.generate(model="gpt-image-2", prompt=prompt,
                                       size="1536x1024", quality="high")
            b = Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
            # 3:2 auf 16:9 — mittig, wie in der ganzen Produktion.
            b.crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS).save(ziel)
            print("fertig:", name, flush=True)
            return
        except Exception as e:      # noqa: BLE001 — eine Richtung darf die anderen nicht kippen
            print(f"{name}: Versuch {versuch}: {str(e)[:160]}", flush=True)
    print(f"{name}: nach {versuche} Versuchen kein Bild", flush=True)


if __name__ == "__main__":
    namen = sys.argv[1:] or [os.path.basename(p)[:-4]
                             for p in sorted(glob.glob(f"{QUELLE}/*.txt"))]
    faeden = [threading.Thread(target=erzeugen, args=(n,)) for n in namen]
    for f in faeden:
        f.start()
    for f in faeden:
        f.join()
    print("PROBEN FERTIG", flush=True)
