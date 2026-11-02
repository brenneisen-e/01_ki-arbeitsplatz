#!/usr/bin/env python3
"""Die Wege der Banking-Horizon-Kurzfassung — Google Veo ueber Vertex AI.

Dieselbe Idee wie bei Kling (kling_horizon.py): jeder Take laeuft von einem
Schluesselbild zum naechsten, Veo bekommt Start- UND Endbild (`image` und
`lastFrame`). Die Prompts sind dieselben wie bei Kling; nur Laenge und
Anbieter unterscheiden sich. Veo dreht 4, 6 oder 8 Sekunden — die
Kurzfassung nutzt genau das: 8 s Einstieg, vier Hypothesen a 4 s, 8 s
Rueckzug, macht 32 s Bild.

Die Takes heissen <weg>_v<sekunden> (a2-a3_v4), damit Montage und
Abnahme die Laenge aus dem Namen lesen und die Kling-Takes daneben liegen
bleiben.

Schluessel: $SCRATCH/.veo_sa.json — der Service-Account veo-video-gen des
Projekts dgcp-sandbox-ebrenneisen. Er liegt NIE im Repo.

    SCRATCH=… python3 veo_horizon.py             # alle sechs
    SCRATCH=… python3 veo_horizon.py a2-a3_v4    # einzeln
"""
import base64
import json
import os
import sys
import threading
import time

import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import kling_horizon  # noqa: E402  (Prompts und Bilder)

BILDER = f"{HIER}/bilder"
S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
ZIEL = f"{S}/veo_takes"
os.makedirs(ZIEL, exist_ok=True)

PROJEKT = "dgcp-sandbox-ebrenneisen"
ORT = "us-central1"
MODELL = os.environ.get("VEO_MODELL", "veo-3.1-generate-001")
BASIS = (f"https://{ORT}-aiplatform.googleapis.com/v1/projects/{PROJEKT}"
         f"/locations/{ORT}/publishers/google/models/{MODELL}")

# (Weg aus kling_horizon.JOBS, Sekunden)
JOBS = {
    "a1-a2_v8": ("a1-a2", 8),
    "a2-a3_v4": ("a2-a3", 4),
    "a3-a4_v4": ("a3-a4", 4),
    "a4-a4c_v4": ("a4-a4c", 4),
    # Sechs statt vier Sekunden: bei vier kam der Vorstandsraum erst in der
    # letzten Sekunde ins Bild, die Hypothese lief ueber den Flur.
    "a4c-a5_v6": ("a4c-a5", 6),
    "a6-a7_v8": ("a6-a7", 8),
}


def kopf():
    cred = service_account.Credentials.from_service_account_file(
        f"{S}/.veo_sa.json", scopes=["https://www.googleapis.com/auth/cloud-platform"])
    cred.refresh(Request())
    return {"Authorization": "Bearer " + cred.token, "Content-Type": "application/json"}


def bild(name):
    return {"bytesBase64Encoded": base64.b64encode(open(f"{BILDER}/{name}.png", "rb").read()).decode(),
            "mimeType": "image/png"}


def drehen(name):
    weg, sekunden = JOBS[name]
    ziel = f"{ZIEL}/{name}.mp4"
    if os.path.exists(ziel):
        print(name, "liegt schon da — erst loeschen, um neu zu drehen", flush=True)
        return ziel
    _, start, ende, prompt = kling_horizon.JOBS[weg]
    print(f"{name}: {start} -> {ende}, {sekunden} s, {MODELL}", flush=True)
    # Veo kennt keine Negativliste als eigenes Feld in jeder Fassung; das
    # Wichtigste steht deshalb im Prompt selbst, dazu negativePrompt, wo er
    # angenommen wird.
    koerper = {
        "instances": [{"prompt": prompt, "image": bild(start), "lastFrame": bild(ende)}],
        "parameters": {"aspectRatio": "16:9", "durationSeconds": sekunden, "sampleCount": 1,
                       "resolution": "1080p", "generateAudio": False,
                       "personGeneration": "allow_adult",
                       "negativePrompt": kling_horizon.NEGATIV},
    }
    h = kopf()
    r = requests.post(f"{BASIS}:predictLongRunning", headers=h, data=json.dumps(koerper), timeout=180)
    if r.status_code != 200:
        raise SystemExit(f"{name}: Veo {r.status_code}: {r.text[:300]}")
    op = r.json()["name"]
    print("  eingereicht", op.rsplit("/", 1)[-1], flush=True)
    for _ in range(90):
        time.sleep(10)
        r = requests.post(f"{BASIS}:fetchPredictOperation", headers=h,
                          data=json.dumps({"operationName": op}), timeout=120)
        d = r.json()
        if not d.get("done"):
            continue
        if "error" in d:
            raise SystemExit(f"  {name} fehlgeschlagen: {json.dumps(d['error'])[:300]}")
        videos = d.get("response", {}).get("videos") or []
        if not videos or "bytesBase64Encoded" not in videos[0]:
            raise SystemExit(f"  {name}: keine Videodaten in der Antwort: {json.dumps(d)[:300]}")
        open(ziel, "wb").write(base64.b64decode(videos[0]["bytesBase64Encoded"]))
        print("  fertig:", name, os.path.getsize(ziel) // 1024, "KB", flush=True)
        return ziel
    raise SystemExit(f"  {name}: Zeitueberschreitung")


def reihe(namen):
    for n in namen:
        try:
            drehen(n)
        except SystemExit as e:
            print("FEHLER", n, e, flush=True)


if __name__ == "__main__":
    wunsch = sys.argv[1:] or list(JOBS)
    for n in wunsch:
        if n not in JOBS:
            raise SystemExit(f"unbekannter Take: {n} (bekannt: {', '.join(JOBS)})")
    # Drei nebeneinander — mehr Parallelitaet bringt bei Veo nur Quotenfehler.
    gruppen = [wunsch[i::3] for i in range(3)]
    faeden = [threading.Thread(target=reihe, args=(g,)) for g in gruppen if g]
    for f in faeden:
        f.start()
    for f in faeden:
        f.join()
    print("VEO HORIZON FERTIG", flush=True)
