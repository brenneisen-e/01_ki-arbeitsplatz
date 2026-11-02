#!/usr/bin/env python3
"""Qualitaetsvergleich Veo vs. Kling — Kling ueber fal.ai (Queue-API).

Dieselben Eingaben wie der Veo-Take s4s5_a: Startbild besprechung_gruen,
Zielbild a_kabine, sinngemaess derselbe Prompt, 5 s (Kling-Raster) statt
6 s. Der fal-Schluessel liegt NUR im Scratchpad (.fal_env).
"""
import base64
import json
import os
import time
import urllib.error
import urllib.request

S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                              "4a027885-72f4-58d1-b5d9-f5090d47fbf4/scratchpad")
HIER = os.path.dirname(os.path.abspath(__file__))
Q = f"{HIER}/quellen"
ZIEL = f"{S}/kling"
os.makedirs(ZIEL, exist_ok=True)

KEY = open(f"{S}/.fal_env").read().strip().split("=", 1)[1]
import sys as _sys
MODELL = _sys.argv[1] if len(_sys.argv) > 1 else "fal-ai/kling-video/v2.5-turbo/pro/image-to-video"

PROMPT = (
    "Continuous single shot: the woman turns from the table, leaves the meeting room and walks "
    "across the open floor to the curved white acoustic focus pod. The pod is complete from the "
    "first moment any part of it is visible: its small oak desk, its chair and its large "
    "built-in screen are already there — the screen never appears, never grows. She sits down "
    "on the chair that already stands in place; the shot ends exactly on this wide view of the "
    "pod. Every screen stays a completely flat, uniform, matte, saturated chroma-key green "
    "rectangle from the first frame to the last. She is seen strictly from behind when moving. "
    "There is exactly one of her in the frame at all times, unchanged throughout. Observational "
    "documentary style, realistic motion."
)
NEGATIV = (
    "second person, duplicate of the woman, different woman, morphing, warping, jump cut, "
    "dissolve, scene change, objects appearing out of nowhere, objects vanishing, text overlay, "
    "watermark, texture on the green screen, reflections on the green screen, flickering"
)


def daten_uri(pfad):
    return "data:image/png;base64," + base64.b64encode(open(pfad, "rb").read()).decode()


def req(url, body=None):
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                               method="POST" if body else "GET")
    r.add_header("Authorization", f"Key {KEY}")
    r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r, timeout=300) as resp:
            return resp.status, json.load(resp)
    except urllib.error.HTTPError as e:
        return e.code, {"fehler": e.read().decode(errors="replace")[:400]}


if __name__ == "__main__":
    # v2.x nennt die Bilder image_url/tail_image_url, v3 start_/end_image_url —
    # falsche Namen verwirft fal STILL (der erste 3.0-Lauf lief deshalb ohne
    # Zielbild und erfand das Ende). Beide Formen mitsenden.
    start, ende = daten_uri(f"{Q}/besprechung_gruen.png"), daten_uri(f"{Q}/a_kabine.png")
    body = {
        "prompt": PROMPT,
        "negative_prompt": NEGATIV,
        "image_url": start, "start_image_url": start,
        "tail_image_url": ende, "end_image_url": ende,
        "duration": "5",
        "cfg_scale": 0.7,
    }
    code, antwort = req(f"https://queue.fal.run/{MODELL}", body)
    print("Einreichung:", code, json.dumps(antwort)[:300], flush=True)
    if code != 200:
        raise SystemExit("fal lehnt ab — Meldung oben.")
    status_url = antwort["status_url"]
    response_url = antwort["response_url"]
    for _ in range(120):
        time.sleep(10)
        code, st = req(status_url)
        print("Stand:", st.get("status"), flush=True)
        if st.get("status") == "COMPLETED":
            break
        if st.get("status") in ("FAILED", "ERROR"):
            raise SystemExit("fal meldet Fehler: " + json.dumps(st)[:400])
    code, erg = req(response_url)
    url = erg["video"]["url"]
    pfad = f"{ZIEL}/s4s5_a_" + MODELL.split("/")[2].replace(".","") + ".mp4"
    urllib.request.urlretrieve(url, pfad)
    print("KLING FERTIG:", pfad, os.path.getsize(pfad) // 1024, "KB", flush=True)
