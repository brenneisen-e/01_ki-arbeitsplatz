#!/usr/bin/env python3
"""
Einzelne Bildfehler im Master-Strukturbild gezielt reparieren.

Arbeitsteilung mit den anderen beiden Skripten:
  personen_retusche.py  ersetzt ganze Personen (feste Personenliste)
  boden_beine.py        ergaenzt Boden und Beine als Streifen je Etage
  reparatur.py          flickt einzelne Fundstellen aus der Qualitaetspruefung

Jede Reparatur ist ein kleines Rechteck plus eine Anweisung, was dort stehen soll.
Kleine, kompakte Masken trifft gpt-image deutlich zuverlaessiger als breite
Streifen; die Kachel wird anschliessend per ORB/RANSAC auf das Original
ausgerichtet und nur der Maskenbereich mit weicher Kante zurueckmontiert.

Aufruf:
  export OPENAI_API_KEY=...                          # oder $SCRATCH/.openai_env
  python3 produktion/strukturbild/reparatur.py --overlay      # Boxen pruefen
  python3 produktion/strukturbild/reparatur.py               # alle offenen
  python3 produktion/strukturbild/reparatur.py --nur name1 name2
  python3 produktion/strukturbild/reparatur.py --neu --nur name1

Ergebnis: $SCRATCH/strukturbild/Strukturbild_repariert.jpg und je Reparatur ein
Vorher/Nachher-Bild. Erst nach Abnahme nach public/images/Strukturbild.jpg kopieren.
"""
import argparse
import os

from PIL import Image, ImageDraw, ImageFilter

from boden_beine import KACHEL, ausrichten, edit
from personen_retusche import lade_key, ZIEL

HIER = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HIER, "..", ".."))
QUELLE = os.path.join(APP, "public", "images", "Strukturbild.jpg")
KACHELN = os.path.join(ZIEL, "reparatur_tiles")
os.makedirs(KACHELN, exist_ok=True)

RAND = 16     # Polster um die Box
WEICH = 12    # weiche Kante beim Zurueckmontieren

RAHMEN = (
  "Local photo retouch of a photorealistic architectural cross-section of a modern bank "
  "building, seen straight on in daylight. In the transparent area: {was} "
  "Keep the exact same camera, framing and crop — do not zoom out, do not reframe, and do "
  "not change anything outside the transparent area. Photorealistic, matching daylight, "
  "colours, materials and grain, correct anatomy and proportions, soft natural shadows. "
  "No text, no watermark, no extra people, no floating objects."
)

# ── Fundstellen ──────────────────────────────────────────────────────────────
# name: ((x0, y0, x1, y1) im Bild 6144x4096, Anweisung fuer das Bildmodell)
REPARATUREN = {
    # Boardroom: die Personenretusche hat die durchgehende Tischplatte in versetzte
    # Segmente zerlegt — die Stufen liegen genau auf den alten Kachelgrenzen.
    "tisch_1": ((1220, 1032, 1430, 1098),
                "make the dark walnut conference table one single continuous slab with a "
                "perfectly straight horizontal front edge across the whole area — remove the "
                "step and the seam where two table sections meet at different heights. Keep "
                "the people, their hands, the table top surface and the chairs unchanged — only the "
                "front edge band of the table is redrawn."),
    "tisch_2": ((1510, 1032, 1720, 1098),
                "make the dark walnut conference table one single continuous slab with a "
                "perfectly straight horizontal front edge across the whole area — remove the "
                "step and the seam where two table sections meet at different heights. Keep "
                "the people, their hands, the table top surface and the chairs unchanged — only the "
                "front edge band of the table is redrawn."),
    "tisch_3": ((1920, 1032, 2130, 1098),
                "make the dark walnut conference table one single continuous slab with a "
                "perfectly straight horizontal front edge across the whole area — remove the "
                "step and the seam where two table sections meet at different heights. Keep "
                "the people, their hands, the table top surface and the chairs unchanged — only the "
                "front edge band of the table is redrawn."),
    "tisch_4": ((2180, 1032, 2400, 1098),
                "make the dark walnut conference table one single continuous slab with a "
                "perfectly straight horizontal front edge across the whole area — remove the "
                "step and the seam where two table sections meet at different heights. Keep "
                "the people, their hands, the table top surface and the chairs unchanged — only the "
                "front edge band of the table is redrawn."),
}


def fenster_fuer(box, breite=6144, hoehe=4096):
    cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
    kante = max(KACHEL, (box[2] - box[0]) + 400, (box[3] - box[1]) + 400)
    x0 = max(0, min(cx - kante // 2, breite - kante))
    y0 = max(0, min(cy - kante // 2, hoehe - kante))
    return (x0, y0, x0 + kante, y0 + kante)


def maske_fuer(box, fenster):
    kante = fenster[2] - fenster[0]
    m = Image.new("L", (kante, kante), 255)
    ImageDraw.Draw(m).rounded_rectangle(
        (box[0] - fenster[0] - RAND, box[1] - fenster[1] - RAND,
         box[2] - fenster[0] + RAND, box[3] - fenster[1] + RAND), radius=18, fill=0)
    rgba = Image.new("RGBA", (kante, kante), (0, 0, 0, 255))
    rgba.putalpha(m)
    return rgba, m


def overlay():
    im = Image.open(QUELLE).convert("RGB")
    d = ImageDraw.Draw(im)
    for name, (box, _) in REPARATUREN.items():
        d.rectangle(box, outline=(255, 0, 0), width=8)
        d.text((box[0] + 10, box[1] - 30), name, fill=(255, 220, 0))
    p = os.path.join(ZIEL, "reparatur_overlay.jpg")
    im.resize((3072, 2048)).save(p, quality=85)
    print("overlay:", p)


def vergleich(name, box, vorher, nachher):
    x0, y0, x1, y1 = box
    rand = max(120, (x1 - x0) // 3, (y1 - y0) // 3)
    c = (max(0, x0 - rand), max(0, y0 - rand),
         min(vorher.width, x1 + rand), min(vorher.height, y1 + rand))
    b = 700
    s = b / (c[2] - c[0])
    h = int((c[3] - c[1]) * s)
    out = Image.new("RGB", (2 * b + 8, h), (20, 20, 20))
    out.paste(vorher.crop(c).resize((b, h)), (0, 0))
    out.paste(nachher.crop(c).resize((b, h)), (b + 8, 0))
    out.save(os.path.join(ZIEL, f"reparatur_{name}.jpg"), quality=90)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--overlay", action="store_true")
    ap.add_argument("--nur", nargs="*")
    ap.add_argument("--neu", action="store_true", help="vorhandene Kacheln ignorieren")
    ap.add_argument("--parallel", type=int, default=4)
    a = ap.parse_args()
    if not REPARATUREN:
        return print("keine Reparaturen eingetragen")
    if a.overlay:
        return overlay()
    lade_key()
    from openai import OpenAI
    client = OpenAI()
    original = Image.open(QUELLE).convert("RGB")
    namen = [n for n in REPARATUREN if not a.nur or n in a.nur]

    def bauen(name):
        box, was = REPARATUREN[name]
        p = os.path.join(KACHELN, name + ".png")
        if os.path.exists(p) and not a.neu:
            return name, "vorhanden"
        f = fenster_fuer(box)
        ausschnitt = original.crop(f)
        maske, m = maske_fuer(box, f)
        if f[2] - f[0] != KACHEL:      # groessere Fundstellen herunterskalieren
            ausschnitt = ausschnitt.resize((KACHEL, KACHEL), Image.LANCZOS)
            maske = maske.resize((KACHEL, KACHEL), Image.NEAREST)
        print(name, "→ Bildmodell", flush=True)
        neu = edit(client, ausschnitt, maske, RAHMEN.format(was=was))
        if f[2] - f[0] != KACHEL:
            neu = neu.resize((f[2] - f[0], f[3] - f[1]), Image.LANCZOS)
        neu.save(p)
        return name, "neu"

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max(1, a.parallel)) as ex:
        for name, status in ex.map(bauen, namen):
            print(name, "kachel", status, flush=True)

    im = original.copy()
    for name in REPARATUREN:
        p = os.path.join(KACHELN, name + ".png")
        if not os.path.exists(p):
            continue
        box, _ = REPARATUREN[name]
        f = fenster_fuer(box)
        _, m = maske_fuer(box, f)
        tile, sc, abw = ausrichten(original.crop(f), Image.open(p).convert("RGB"), m)
        alpha = Image.eval(m, lambda v: 255 - v).filter(ImageFilter.GaussianBlur(WEICH))
        im.paste(Image.composite(tile, im.crop(f), alpha), f[:2])
        vergleich(name, box, original, im)
        print(name, f"montiert (skalierung={sc:.3f}, abweichung={abw:.1f})", flush=True)
    ziel = os.path.join(ZIEL, "Strukturbild_repariert.jpg")
    im.save(ziel, quality=95, subsampling=0)
    print("fertig:", ziel)


if __name__ == "__main__":
    main()
