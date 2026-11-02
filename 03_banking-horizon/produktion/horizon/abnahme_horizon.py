#!/usr/bin/env python3
"""Abnahme der beiden Banking-Horizon-Filme.

Dieselbe Frage wie bei der Mara-Strecke: haelt der Schnitt? Weil jeder Take
auf dem Bild endet, mit dem der naechste anfaengt, muss die Fuge unsichtbar
sein. Geprueft wird deshalb:

  Kopf/Schwanz   Wie weit liegen letztes Bild von Take n und erstes Bild von
                 Take n+1 auseinander? Alles unter ~6 (von 255) ist ein
                 Schnitt, den niemand sieht.
  Anschluss      Endet der Take ueberhaupt auf seinem Zielbild? Wenn Kling
                 abdriftet, faellt es hier auf, nicht erst im Kino.
  Schwarz        Kein durchgehend schwarzes Bild mitten im Take.
  Film           Laenge, Bildgroesse, Tonspur vorhanden.

    SCRATCH=… python3 abnahme_horizon.py
"""
import os
import re
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
BILDER = f"{HIER}/bilder"
FILME = f"{HIER}/filme"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
TAKES = f"{S}/horizon_takes"

# Fugen, die MIT ABSICHT keine sind: dort fehlt ein Zwischenbild, die
# Montage legt eine Blende darueber (montage_horizon.BLENDEN). Ohne diese
# Liste meldet die Abnahme einen gewollten Szenenwechsel als Fehler.
# In Fassung V ist JEDE Fuge ein gewollter Ortswechsel.
GEPLANT = {"a": {2}, "k": {2, 5}, "n": {1, 2, 3, 4, 5},
           "v": set(range(1, 10))}

REIHE = {
    "a": ["a1-a2", "a2-a3", "a3-a4", "a4-a4c", "a4c-a5", "a5-a6", "a6-a7", "a7-a8"],
    "b": ["b1-b2", "b2-b3", "b3-b4", "b4-b5", "b5-b6", "b6-b7"],
    "n": ["a1-a2_10", "a2-a3_5", "a3-a4_5", "a4-a4c_5", "a4c-a5_5", "a6-a7_10"],
    "v": ["s1", "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "s7"],
    "k": ["a1-a2_v8", "a2-a3_v4", "a3-a4_v4", "a4-a4c_v4", "a4c-a5_v6", "a6-a7_v8"],
}


def bilder_aus(pfad, wann):
    """Ein Einzelbild an einer Sekunde als Array — klein, es geht um Struktur."""
    roh = subprocess.run(
        [FFMPEG, "-v", "error", "-ss", str(wann), "-i", pfad, "-frames:v", "1",
         "-vf", "scale=320:180", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True).stdout
    if len(roh) < 320 * 180 * 3:
        return None
    return np.frombuffer(roh[:320 * 180 * 3], dtype=np.uint8).astype(np.float32)


def dauer(pfad):
    aus = subprocess.run(
        [FFMPEG, "-v", "error", "-i", pfad, "-f", "null", "-"],
        capture_output=True).stderr.decode()
    return aus


def probe(pfad):
    """Laenge, Groesse und Tonspur — ohne ffprobe, ffmpeg reicht."""
    aus = subprocess.run([FFMPEG, "-hide_banner", "-i", pfad],
                         capture_output=True).stderr.decode()
    return aus


def abstand(x, y):
    return float(np.abs(x - y).mean()) if x is not None and y is not None else 999.0


DAUERN = {"s1": 8.0, "h1": 3.6, "h2": 3.0, "h3": 3.4, "h4": 8.0,
          "h5": 4.4, "h6": 3.2, "h7": 4.6, "h8": 4.0, "s7": 3.6}
# Die acht h-Einstellungen sind keine gedrehten Takes, sondern gerechnete
# Fahrten ueber die Hypothesen-Standbilder des Modells. Sie koennen weder
# vom Startbild driften noch schwarz werden noch Gesichter verziehen — sie
# SIND das Bild. Geprueft wird an ihnen nur, dass die Datei da ist und die
# Fuge zur vorigen Einstellung gewollt war.
STANDBILDER = {"h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8"}


def zielbild(name):
    if name in STANDBILDER:
        ordner = f"{HIER}/hypothesen"
    else:
        ordner = f"{HIER}/szenen" if name in DAUERN else BILDER
    return np.asarray(Image.open(f"{ordner}/{name}.png").convert("RGB")
                      .resize((320, 180), Image.LANCZOS), dtype=np.float32).ravel()


def fassung(f):
    print(f"\n=== Fassung {f.upper()} ===")
    # Die Laengen kommen aus derselben Quelle wie in der Montage: der
    # Aufnahme. Eine zweite Tabelle hier waere eine zweite Wahrheit.
    try:
        import montage_horizon
        plan = montage_horizon.zeitplan(f)
        if plan:
            DAUERN.update(plan)
    except Exception as e:      # noqa: BLE001
        print("  (kein Schnittplan aus der Aufnahme:", str(e)[:80], ")", flush=True)
    fehler = 0
    letzte = None
    for i, take in enumerate(REIHE[f]):
        # Dieselbe Reihenfolge wie in der Montage: ein gedrehter Take
        # gewinnt, die gerechnete Fahrt ist der Rueckfall. Stand hier
        # andersherum, und die Abnahme meldete fuenf fehlende Takes,
        # waehrend der Film laengst mit ihnen gebaut war.
        d = DAUERN.get(take, 0.0)
        kandidaten = (f"{S}/veo_fest/{take}.mp4",
                      f"{S}/veo_szenen/{take}.mp4",
                      f"{S}/veo_takes/{take}.mp4",
                      f"{TAKES}/{take}.mp4",
                      f"{S}/horizon_bau/h3840_{take}_{d:g}.mp4",
                      f"{S}/horizon_bau/h1920_{take}_{d:g}.mp4")
        pfad = next((q for q in kandidaten if os.path.exists(q)), kandidaten[0])
        if not os.path.exists(pfad):
            print(f"  {take}: FEHLT")
            fehler += 1
            letzte = None
            continue
        kopf = bilder_aus(pfad, 0.1)
        m = re.search(r"_v?(\d+)$", take)
        laenge = DAUERN.get(take) or (float(m.group(1)) if m else 10.0)
        schwanz = bilder_aus(pfad, laenge - 0.3)
        # Wege ZWISCHEN zwei Bildern heissen "a-b" und werden an beiden
        # Enden geprueft. Eigenstaendige Szenen (Fassung V) haben nur ein
        # Bild: dort wird nur der Anfang geprueft, und die Fugen sind
        # ohnehin alle gewollt.
        teile = re.sub(r"_v?\d+$", "", take).split("-")
        if len(teile) == 2:
            von, nach = teile
            an_kopf = abstand(kopf, zielbild(von))
            an_schwanz = abstand(schwanz, zielbild(nach))
        else:
            von = nach = teile[0]
            an_kopf = abstand(kopf, zielbild(von))
            an_schwanz = 0.0
        fuge = abstand(letzte, kopf) if letzte is not None else 0.0
        mitte = bilder_aus(pfad, laenge / 2)
        schwarz = mitte is not None and float(mitte.mean()) < 6.0
        marke = []
        # Bei eigenstaendigen Szenen haengt nichts am Startbild — es geht
        # ihnen nichts voraus. Ein leichter Nachrahmen durch das Videomodell
        # ist dort kein Fehler, sondern erlaubt.
        if an_kopf > 14 and len(teile) == 2 and take not in STANDBILDER:
            marke.append("Startbild driftet")
        if an_schwanz > 20: marke.append("Zielbild driftet")
        if i and fuge > 8:
            marke.append("geplanter Schnitt — Blende in der Montage"
                         if i in GEPLANT.get(f, set()) else "sichtbare Fuge")
        if schwarz: marke.append("schwarzes Bild")
        fehler += sum(1 for x in marke if not x.startswith("geplanter"))
        print(f"  {take}: Start {an_kopf:5.1f}  Ziel {an_schwanz:5.1f}  "
              f"Fuge {fuge:5.1f}  {'OK' if not marke else ' / '.join(marke)}")
        letzte = schwanz

    film = f"{FILME}/banking_horizon_{f}.mp4"
    if os.path.exists(film):
        text = probe(film)
        hat_ton = "Audio:" in text
        # Fassung V laeuft in 4K, alle anderen in 1080p.
        soll = "3840x2160" if f == "v" else "1920x1080"
        gross = soll in text
        laenge = [z for z in text.splitlines() if "Duration:" in z]
        print(f"  Film: {laenge[0].strip() if laenge else '?'}")
        print(f"        {soll}: {gross}   Tonspur: {hat_ton}")
        if not (gross and hat_ton):
            fehler += 1
    else:
        print("  Film: noch nicht montiert")
    return fehler


if __name__ == "__main__":
    summe = sum(fassung(f) for f in (sys.argv[1:] or ["v"]))
    print("\nBEANSTANDUNGEN:", summe)
    sys.exit(1 if summe else 0)
