#!/usr/bin/env python3
"""Netzfassung eines Horizon-Films: 1080p, garantiert unter 25 MiB.

Cloudflare Pages liefert keine Datei aus, die groesser als 25 MiB ist — und
es scheitert nicht die Datei, sondern der GANZE Deploy, ohne dass man es der
Seite ansieht. Genau daran hing der Film am 10.09. stundenlang unsichtbar
fest. Deshalb rechnet dieses Skript die Bitrate aus der Laufzeit zurueck,
statt eine Qualitaetsstufe zu raten, und prueft die Datei danach nach.

    python3 netzfassung.py v
"""
import os
import re
import subprocess
import sys

import imageio_ffmpeg

HIER = os.path.dirname(os.path.abspath(__file__))
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
GRENZE = 25 * 1024 * 1024
# Sicherheitsabstand: der Muxer legt Kopfdaten obendrauf, und eine
# Zweipass-Rechnung trifft die Zielbitrate nur ungefaehr.
ZIEL = int(GRENZE * 0.82)
TON_KBIT = 160
# Abspielgeschwindigkeit je Fassung. 0,9 heisst: der Film laeuft auf 90 %
# seines Tempos, aus 44,1 s werden 49,0 s. Das Bild wird NICHT mit
# doppelten Einzelbildern gestreckt, sondern jedes Bild bleibt genau einmal
# und die Bildrate sinkt von 25 auf 22,5 — ruckelfrei, wie 24er-Kino.
# Der Ton wird mit Rubber Band zeitgedehnt: Tonhoehe bleibt, die Stimme
# wird nicht tiefer. Die eingebrannten Untertitel dehnen sich mit.
# Das 4K-Original in filme/ bleibt in Normaltempo (dort prueft die Abnahme
# den Schnittplan); nur die Netzfassung laeuft langsamer.
# Seit dem 15.09. sitzt das Tempo in der MONTAGE (montage_horizon.TEMPO):
# dort bleibt die Stimme bei 1,0 und wird auf den langsameren Schnitt neu
# verdrahtet. Hier wuerde auch der Ton gedehnt — nur noch fuer den Fall,
# dass ein fertiger Film nachtraeglich verlangsamt werden soll.
TEMPO = {}
BILDRATE = 25


def laufzeit(datei):
    """Laufzeit in Sekunden. Ohne ffprobe — imageio liefert nur ffmpeg mit."""
    meldung = subprocess.run([FFMPEG, "-i", datei], capture_output=True,
                             text=True).stderr
    treffer = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", meldung)
    if not treffer:
        raise SystemExit(f"keine Laufzeit in {datei}")
    st, mi, sk = treffer.groups()
    return int(st) * 3600 + int(mi) * 60 + float(sk)


def bauen(fassung):
    quelle = f"{HIER}/filme/banking_horizon_{fassung}.mp4"
    ziel = (f"{HIER}/../../public/videos/horizon/"
            f"banking_horizon_{fassung}.mp4")
    tempo = TEMPO.get(fassung, 1.0)
    dauer = laufzeit(quelle) / tempo
    kbit = int(ZIEL * 8 / 1000 / dauer) - TON_KBIT
    print(f"{fassung}: {dauer:.2f} s (Tempo {tempo:g})  ->  {kbit} kbit/s Bild", flush=True)

    protokoll = f"{HIER}/ton/zweipass_{fassung}"
    bild = "scale=1920:-2:flags=lanczos"
    ton = []
    if tempo != 1.0:
        bild = f"setpts=PTS/{tempo},{bild}"
        ton = ["-filter:a", f"rubberband=tempo={tempo}"]
    # Keine Bildrate erzwingen: die Montage liefert bei Tempo 0,9 schon
    # 22,5 fps, und ein erzwungenes 25 wuerde jedes neunte Bild verdoppeln.
    rate = ["-r", f"{BILDRATE * tempo:g}"] if tempo != 1.0 else []
    gemein = ["-filter:v", bild] + rate + ["-c:v", "libx264",
              "-preset", "slow", "-b:v", f"{kbit}k", "-pix_fmt", "yuv420p"]
    for pass_nr in (1, 2):
        befehl = [FFMPEG, "-v", "error", "-y", "-i", quelle] + gemein + [
            "-pass", str(pass_nr), "-passlogfile", protokoll]
        befehl += (["-an", "-f", "mp4", os.devnull] if pass_nr == 1 else
                   ton + ["-c:a", "aac", "-b:a", f"{TON_KBIT}k", "-movflags",
                          "+faststart", ziel])
        subprocess.run(befehl, check=True)
    for rest in (f"{protokoll}-0.log", f"{protokoll}-0.log.mbtree"):
        if os.path.exists(rest):
            os.remove(rest)

    gross = os.path.getsize(ziel)
    print(f"  {ziel.split('/')[-1]}  {gross/1024/1024:.2f} MiB", flush=True)
    if gross > GRENZE:
        raise SystemExit(f"ZU GROSS: {gross} > {GRENZE} — Deploy wuerde scheitern")
    return ziel


if __name__ == "__main__":
    for f in (sys.argv[1:] or ["v"]):
        bauen(f)
    print("NETZFASSUNG FERTIG", flush=True)
