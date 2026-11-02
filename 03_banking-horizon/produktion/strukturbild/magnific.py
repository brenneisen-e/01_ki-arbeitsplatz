#!/usr/bin/env python3
"""
Strukturbild mit Magnific (ueber die Freepik-API) hochskalieren.

Warum Magnific und nicht Real-ESRGAN: Real-ESRGAN interpoliert sauber, erfindet
aber keine Struktur — Gesichter, Stoffe und Haare bleiben so weich, wie sie im
1536er Original sind. Magnific ist ein kreativer Upscaler: er zeichnet beim
Vergroessern Poren, Faserung, Haarstraehnen und Materialkanten neu. Genau daher
kommt der Fotorealismus des alten Strukturbilds (siehe produktion/BRIEFING.md).

Ablauf der Bildherstellung:
  1. neues_strukturbild.py   erzeugt das Masterbild (1536x1024)
  2. magnific.py             skaliert auf 6144x4096 (dieses Skript)
  3. gesichter_scharf.py     repariert die Gesichter, falls noch noetig

Endpunkt: POST https://api.freepik.com/v1/ai/image-upscaler
Kopfzeile: x-freepik-api-key. Der Aufruf ist asynchron: er liefert eine task_id,
das Ergebnis wird per GET .../image-upscaler/<task_id> abgeholt.

Regler (jeweils 0..10, Magnific-Semantik):
  creativity   wie stark neue Details erfunden werden. Hoch = eigenwillig.
  resemblance  wie streng am Original geblieben wird. Hoch = treu.
  hdr          Mikrokontrast/Detailschaerfe.
  fractality   wie kleinteilig die erfundene Struktur wird.
  engine       magnific_sparkle (Allrounder), magnific_sharpy (harte Kanten),
               magnific_illusio (weich).

Aus dem Vergleich der Faelle: magnific_sparkle ist fuer dieses Bild die
richtige Wahl. magnific_sharpy zeichnet zwar noch knackiger, schreibt dabei
aber die Raumschilder um ("BRANCH" wird zu "8RANCH", "COMPLIANCE & RISK" zu
"COMPLIANCE 8-RISK") und tauscht Materialien aus (Holztheke wird Marmor).
Wer Beton und Stein sauber statt verwittert haben will, dreht fractality und
creativity herunter und resemblance hoch.

Der Schluessel steht in $SCRATCH/.magnific_env (MAGNIFIC_API_KEY=...), niemals
im Repository.

Aufruf:
  python3 produktion/strukturbild/magnific.py <quelle.png> [<ziel.png>]
  python3 produktion/strukturbild/magnific.py q.png z.png --engine magnific_sharpy
  python3 produktion/strukturbild/magnific.py q.png z.png --task <id>   # nur abholen
"""
import argparse
import base64
import io
import json
import os
import time
import urllib.error
import urllib.request

from PIL import Image

S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                   "27db0dfd-7ffe-5925-98a2-721e8026403b/scratchpad")
URL = "https://api.freepik.com/v1/ai/image-upscaler"


def lade_key():
    k = os.environ.get("MAGNIFIC_API_KEY")
    if k:
        return k
    p = os.path.join(S, ".magnific_env")
    if os.path.exists(p):
        for zeile in open(p):
            if zeile.startswith("MAGNIFIC_API_KEY="):
                return zeile.split("=", 1)[1].strip()
    raise SystemExit("MAGNIFIC_API_KEY fehlt (Umgebung oder $SCRATCH/.magnific_env)")


def anfrage(url, key, daten=None):
    req = urllib.request.Request(
        url, data=json.dumps(daten).encode() if daten else None,
        headers={"x-freepik-api-key": key, "Content-Type": "application/json"})
    try:
        return json.loads(urllib.request.urlopen(req, timeout=300).read())
    except urllib.error.HTTPError as e:
        raise SystemExit(f"HTTP {e.code}: {e.read()[:1500].decode()}")


def starten(key, bild, a):
    with open(bild, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    koerper = {"image": b64, "scale_factor": a.faktor, "optimized_for": a.motiv,
              "creativity": a.creativity, "hdr": a.hdr, "resemblance": a.resemblance,
              "fractality": a.fractality, "engine": a.engine}
    if a.prompt:
        koerper["prompt"] = a.prompt
    return anfrage(URL, key, koerper)["data"]["task_id"]


def abholen(key, task_id, takt=15, geduld=3600):
    ende = time.time() + geduld
    while time.time() < ende:
        d = anfrage(f"{URL}/{task_id}", key)["data"]
        status = d.get("status")
        print(f"\r  {status}", end="", flush=True)
        if status == "COMPLETED":
            print()
            return d["generated"][0]
        if status == "FAILED":
            raise SystemExit(f"\nMagnific meldet FAILED: {d}")
        time.sleep(takt)
    raise SystemExit("\nZeitueberschreitung beim Warten auf Magnific")


def herunterladen(url, versuche=5):
    """Ergebnis holen. Die 50-MB-PNGs reissen ueber den Proxy gern ab, deshalb
    mit Wiederholung — der Link bleibt nach COMPLETED eine Weile gueltig."""
    for v in range(versuche):
        try:
            return urllib.request.urlopen(url, timeout=900).read()
        except Exception as e:
            print(f"  Download-Wiederholung {v + 1}: {str(e)[:110]}", flush=True)
            time.sleep(5 * (v + 1))
    raise SystemExit("Ergebnis laesst sich nicht herunterladen")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("quelle")
    ap.add_argument("ziel", nargs="?")
    ap.add_argument("--faktor", default="4x", choices=["2x", "4x", "8x", "16x"])
    ap.add_argument("--motiv", default="films_n_photography")
    ap.add_argument("--engine", default="magnific_sparkle",
                    choices=["automatic", "magnific_illusio", "magnific_sharpy",
                             "magnific_sparkle"])
    ap.add_argument("--creativity", type=int, default=2)
    ap.add_argument("--hdr", type=int, default=3)
    ap.add_argument("--resemblance", type=int, default=7)
    ap.add_argument("--fractality", type=int, default=2)
    ap.add_argument("--prompt", default="")
    ap.add_argument("--task", help="fertigen Auftrag nur abholen, nichts neu berechnen")
    a = ap.parse_args()
    ziel = a.ziel or a.quelle.rsplit(".", 1)[0] + "_magnific.png"

    key = lade_key()
    print(f"{a.quelle} → Magnific ({a.engine}, {a.faktor}, creativity={a.creativity}, "
          f"resemblance={a.resemblance})", flush=True)
    t = time.time()
    task = a.task or starten(key, a.quelle, a)
    print("  task", task, flush=True)
    url = abholen(key, task)
    bild = Image.open(io.BytesIO(herunterladen(url))).convert("RGB")
    bild.save(ziel)
    print(f"fertig in {time.time() - t:.0f}s: {ziel}  {bild.size}")


if __name__ == "__main__":
    main()
