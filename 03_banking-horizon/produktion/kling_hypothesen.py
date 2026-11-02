#!/usr/bin/env python3
"""Hypothesen-Bewegtbilder: die beiden Haelften eines Vergleichsbilds beleben.

Erprobung fuer den Kapitel-Reader (Banking Horizon 2030): jedes Hypothesen-
Vergleichsbild besteht aus einer Heute- und einer 2030-Szene nebeneinander.
Dieses Skript croppt beide Haelften EXAKT auf den im UI sichtbaren Ausschnitt
(ChapterReader.module.css: img-Breite 210 %, Container 8:9, vertikal mittig)
und schickt sie einzeln als 10-s-Image-to-Video-Takes an Kling (fal.ai,
Queue-API — dieselbe Ansteuerung wie kling_wege.py). Die fertigen Clips
landen in public/videos/hypothesen/ und werden ueber
src/data/hypothesenVideos.ts im Reader verdrahtet.

Der fal-Schluessel liegt NUR im Scratchpad (.fal_env), nie im Repo.
"""
import base64
import io
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request

from PIL import Image

S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                              "7d2bc9e9-424f-51bd-a812-db45c1ff45a1/scratchpad")
HIER = os.path.dirname(os.path.abspath(__file__))
BILDER = os.path.join(HIER, "..", "public", "images")
ZIEL = os.path.join(HIER, "..", "public", "videos", "hypothesen")
os.makedirs(ZIEL, exist_ok=True)

KEY = open(f"{S}/.fal_env").read().strip().split("=", 1)[1]
MODELL = os.environ.get("KLING_MODELL", "fal-ai/kling-video/v2.5-turbo/pro/image-to-video")

# Sichtbarer Ausschnitt je Haelfte (siehe .cmpImg im CSS): das Bild steht mit
# 210 % Breite im 8:9-Container, links- bzw. rechtsbuendig, vertikal zentriert.
# Der Mitteldivider (~4,8 % der Bildbreite) faellt dabei weg.
ANTEIL_BREITE = 1 / 2.1
SEITEN_VERHAELTNIS = 9 / 8  # Hoehe/Breite des Containers


def haelfte(bildname, seite):
    """Croppt die Heute- (links) oder 2030-Haelfte (rechts) UI-genau."""
    im = Image.open(os.path.join(BILDER, bildname)).convert("RGB")
    w, h = im.size
    bw = round(w * ANTEIL_BREITE)
    bh = min(h, round(bw * SEITEN_VERHAELTNIS))
    y0 = (h - bh) // 2
    x0 = 0 if seite == "links" else w - bw
    return im.crop((x0, y0, x0 + bw, y0 + bh))


def daten_uri(im):
    puffer = io.BytesIO()
    im.save(puffer, format="PNG")
    return "data:image/png;base64," + base64.b64encode(puffer.getvalue()).decode()


NEGATIV = (
    "camera movement, zoom, pan, dolly, morphing, warping, jump cut, dissolve, "
    "scene change, text changing, letters rearranging, new objects appearing, "
    "objects vanishing, extra people, duplicate person, distorted faces, "
    "deformed hands, extra fingers, text overlay, subtitles, watermark, flickering"
)

STIL = (
    " Locked-off camera, photorealistic, observational documentary style, "
    "continuous single shot, subtle realistic motion, constant warm interior light. "
    "Exactly these two people, unchanged throughout."
)

# (Dateiname, Quellbild, Haelfte, Prompt) — je Hypothesen-Haelfte ein 10-s-Take.
JOBS = [
    ("kapitel2_1_heute", "Kapitel 2_1.png", "links",
     "A bank advisor in a dark green blazer and a grey-haired customer in a beige "
     "sweater sit at a wooden table covered with printed product brochures. She "
     "slowly moves her pen along the printed sheet while explaining, the customer "
     "leans in slightly and nods, his eyes following the pen. Small natural "
     "gestures, both breathe calmly. Every brochure stays exactly where it lies, "
     "printed text and layout stay unchanged and legible." + STIL),
    ("kapitel2_1_2030", "Kapitel 2_1.png", "rechts",
     "A woman in a green cardigan and a smiling grey-haired man look at the large "
     "tablet he holds upright on the wooden table. She points at the white "
     "dashboard on the screen and moves her finger gently between the round "
     "icons, both smile and nod as they talk. The tablet stays perfectly still "
     "in his hands; the dashboard on the screen stays exactly as it is — same "
     "diagram, same text, nothing on the screen moves, changes or lights up."
     + STIL),
]


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


druck = threading.Lock()


def rendere(name, bild, seite, prompt):
    ziel = os.path.join(ZIEL, f"{name}.mp4")
    if os.path.exists(ziel):
        with druck:
            print(name, "existiert, skip", flush=True)
        return
    start = daten_uri(haelfte(bild, seite))
    body = {"prompt": prompt, "negative_prompt": NEGATIV, "duration": "10",
            "cfg_scale": 0.8, "image_url": start, "start_image_url": start}
    for versuch in range(4):
        code, antwort = req(f"https://queue.fal.run/{MODELL}", body)
        if code != 200:
            with druck:
                print(name, "Einreichung", code, json.dumps(antwort)[:200], flush=True)
            time.sleep(20 * (versuch + 1))
            continue
        status_url, response_url = antwort["status_url"], antwort["response_url"]
        with druck:
            print(name, "eingereicht", flush=True)
        for _ in range(150):
            time.sleep(10)
            _, st = req(status_url)
            if st.get("status") == "COMPLETED":
                _, erg = req(response_url)
                urllib.request.urlretrieve(erg["video"]["url"], ziel)
                with druck:
                    print(name, "ok,", os.path.getsize(ziel) // 1024, "KB", flush=True)
                return
            if st.get("status") in ("FAILED", "ERROR"):
                with druck:
                    print(name, "failed:", json.dumps(st)[:200], flush=True)
                break
        time.sleep(15)
    with druck:
        print(name, "FEHLGESCHLAGEN", flush=True)


if __name__ == "__main__":
    nur = set(sys.argv[1:])
    faeden = [threading.Thread(target=rendere, args=j) for j in JOBS if not nur or j[0] in nur]
    print(len(faeden), "Hypothesen-Takes,", MODELL, flush=True)
    for f in faeden:
        f.start()
    for f in faeden:
        f.join()
    print("KLING HYPOTHESEN FERTIG", flush=True)
