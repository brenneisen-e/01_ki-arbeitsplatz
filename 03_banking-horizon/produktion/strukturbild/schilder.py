#!/usr/bin/env python3
"""
Verschriebene Raumschilder aus einer zweiten Magnific-Fassung uebernehmen.

Magnific liest die Schrift im 1536er Original
nicht, er malt sie neu — und verschreibt sich dabei fast immer irgendwo. Welche
Schilder es trifft, haengt an den Reglern, nicht am Bild: bei denselben Reglern
kommt derselbe Fehler wieder, bei anderen Reglern trifft es andere Schilder.
Zwei Laeufe mit unterschiedlichen Reglern haben deshalb fast nie dieselben
Fehler:

  Fassung "treu"     c1/f1/r9  richtig bis auf COMPLIANCE & RIGK und AOVISORY
  Fassung "sparkle"  c2/f2/r7  richtig bis auf BOARDROCM, IKNOVATION,
                               TECHNQLOGY, HK und ERANCH

Also ist "treu" die Grundlage und "sparkle" der Ersatzteilspender fuer die zwei
Stellen, an denen "treu" danebenliegt (Spalte SPENDER unten).

Die Schilder ein zweites Mal zu retten war frueher noetig, weil die
Personenkacheln flaechig montiert wurden und die Schrift dabei wegwischten. Das
erledigt inzwischen gesichter_scharf.py selbst: es montiert nur noch die
Personengruppe und spart die Schilderboxen aus dieser Tabelle aus.

Das Mischen geht pixelweise ohne Entzerrung: alle Fassungen stammen aus demselben
Original und liegen per ORB/RANSAC unter einem Pixel auseinander (Skalierung
1.0000, Versatz 0.2 px). Nur eine weiche Kante, damit der Helligkeitsunterschied
an der Naht nicht auffaellt.

Aufruf:
  python3 produktion/strukturbild/schilder.py --overlay   # Boxen pruefen
  python3 produktion/strukturbild/schilder.py --mischen  # nach magnific.py
"""
import argparse
import os

from PIL import Image, ImageDraw, ImageFilter

from personen_retusche import ZIEL

NEU = os.path.join(ZIEL, "neu")
GRUNDLAGE = os.path.join(NEU, "v4_mag_treu.png")
SPENDER = os.path.join(NEU, "v4_mag_sparkle.png")
GEMISCHT = os.path.join(NEU, "v4_mag.png")

WEICH = 14   # weiche Kante beim Einsetzen

# name: ((x0, y0, x1, y1), Text, aus welcher Fassung beim Mischen)
SCHILDER = {
    "og3_links":  ((1475,  209, 1995,  309), "BOARDROOM",               "grundlage"),
    "og3_rechts": ((4105,  259, 4875,  360), "PRODUCT & INNOVATION",    "grundlage"),
    "og2_links":  ((1425, 1134, 2100, 1234), "COMPLIANCE & RISK",       "spender"),
    "og2_rechts": ((4235, 1150, 4755, 1241), "TECHNOLOGY",              "grundlage"),
    "og1_links":  ((1285, 1995, 2125, 2096), "CORPORATE SERVICES / HR", "grundlage"),
    "og1_rechts": ((4235, 2005, 4725, 2106), "OPERATIONS",              "grundlage"),
    "eg_links":   ((1435, 2801, 1815, 2900), "BRANCH",                  "grundlage"),
    "eg_rechts":  ((4275, 2803, 4705, 2904), "ADVISORY",                "spender"),
}


def einsetzen(ziel, quelle, box, rand=40):
    """Box aus quelle in ziel uebernehmen, mit weicher Kante."""
    f = (box[0] - rand, box[1] - rand, box[2] + rand, box[3] + rand)
    maske = Image.new("L", (f[2] - f[0], f[3] - f[1]), 0)
    ImageDraw.Draw(maske).rectangle((rand, rand, f[2] - f[0] - rand, f[3] - f[1] - rand),
                                    fill=255)
    maske = maske.filter(ImageFilter.GaussianBlur(WEICH))
    ziel.paste(Image.composite(quelle.crop(f), ziel.crop(f), maske), f[:2])


def overlay():
    im = Image.open(GEMISCHT if os.path.exists(GEMISCHT) else GRUNDLAGE).convert("RGB")
    d = ImageDraw.Draw(im)
    for name, (box, text, _) in SCHILDER.items():
        d.rectangle(box, outline=(255, 0, 0), width=6)
        d.text((box[0], box[1] - 34), f"{name}: {text}", fill=(255, 220, 0))
    p = os.path.join(ZIEL, "schilder_overlay.jpg")
    im.resize((3072, 2048)).save(p, quality=88)
    print("overlay:", p)


def mischen():
    grund = Image.open(GRUNDLAGE).convert("RGB")
    spender = Image.open(SPENDER).convert("RGB")
    if grund.size != spender.size:
        raise SystemExit(f"Groessen passen nicht: {grund.size} vs {spender.size}")
    for name, (box, text, woher) in SCHILDER.items():
        if woher != "spender":
            continue
        einsetzen(grund, spender, box)
        print(f'{name}: "{text}" aus der Spenderfassung uebernommen')
    grund.save(GEMISCHT)
    print("fertig:", GEMISCHT)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--overlay", action="store_true")
    ap.add_argument("--mischen", action="store_true")
    a = ap.parse_args()
    if a.overlay:
        return overlay()
    if a.mischen:
        return mischen()
    raise SystemExit(__doc__)


if __name__ == "__main__":
    main()
