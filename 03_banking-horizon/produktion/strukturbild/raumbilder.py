#!/usr/bin/env python3
"""
Raum-Detailbilder aus dem Strukturbild schneiden.

Die Einstiegsbuehne legt beim Hineinzoomen in ein Kapitel ein Raumbild ueber
den Kamera-Zoom des Strukturbilds. Bisher waren das acht eigens erzeugte
Bilder — eine zweite Bildstrecke, die denselben Raum zeigen sollte, es aber nie
tat: andere Moeblierung, andere Menschen, keine Raumschilder. Solange die
Buehne mit 0,55 Deckkraft lief, verwischte die Doppelbelichtung den
Unterschied; seit sie deckt, springt er ins Auge — man zoomt in die Filiale und
landet in einem anderen Raum.

Deshalb kommen die Raumbilder jetzt aus dem Strukturbild selbst: je Raum ein
Ausschnitt im Format 16:9, auf den Raum zentriert. Das Format nimmt oben und
unten mehr mit als der Raum hoch ist — angeschnittene Nachbaretage, Vorplatz,
Sockel. Genau so waren die alten Bilder aufgebaut, und es traegt: der Raum
steht in seinem Haus, statt freigestellt zu schweben.

Die Aufloesung reicht, weil das Strukturbild 6144 px breit ist: ein Raum misst
darin rund 2450 px, das Zielbild 2560 — die Koepfe sind hinterher so gross wie
in den alten Raumbildern, nur dass sie einzeln nachgezogen sind.

Gespeichert wird als JPEG. Die alten Bilder lagen als PNG vor, was fuer
Fotografien Platz verschwendet: dasselbe Bild wiegt als PNG 7,2 MB und als
JPEG mit Qualitaet 92 noch 1,7 MB, ohne sichtbaren Unterschied. einstieg.ts
zeigt entsprechend auf .jpg.

Aufruf:
  python3 produktion/strukturbild/raumbilder.py           # in den Scratchpad
  python3 produktion/strukturbild/raumbilder.py --setzen  # nach public/images/rooms
"""
import argparse
import os

from PIL import Image

from personen_retusche import ZIEL

HIER = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HIER, "..", ".."))
QUELLE = os.path.join(APP, "public", "images", "Strukturbild.jpg")
ROOMS = os.path.join(APP, "public", "images", "rooms")
ZIEL_NEU = os.path.join(ZIEL, "raumbilder")

BREITE, HOEHE = 6144, 4096
ZIELBREITE = 2560

# Raumgrenzen im Strukturbild, wie in chapters.ts dokumentiert
LINKS = (302, 2780)
RECHTS = (3390, 5823)
ETAGEN = {"og3": (221, 1071), "og2": (1071, 1978), "og1": (1978, 2771), "eg": (2771, 3581)}

# Kapitel → (Etage, Seite). Die Zuordnung steht im Raum-Mapping von chapters.ts.
KAPITEL = {
    "vorstand":   ("og3", LINKS),    # Boardroom
    "projekt":    ("og3", RECHTS),   # Product & Innovation
    "compliance": ("og2", LINKS),    # Compliance & Risk
    "it":         ("og2", RECHTS),   # Technology
    "corporate":  ("og1", LINKS),    # Corporate Services / HR
    "marktfolge": ("og1", RECHTS),   # Operations
    "kunde":      ("eg", LINKS),     # Branch
    "vertrieb":   ("eg", RECHTS),    # Advisory
}


def ausschnitt(etage, seite):
    """16:9-Fenster um den Raum, in die Bildgrenzen geschoben statt beschnitten."""
    x0, x1 = seite
    y0, y1 = ETAGEN[etage]
    b = x1 - x0
    h = round(b * 9 / 16)
    cy = (y0 + y1) / 2
    oben = round(cy - h / 2)
    oben = max(0, min(oben, HOEHE - h))     # schieben, nicht beschneiden
    return (x0, oben, x1, oben + h)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--setzen", action="store_true",
                    help="Ergebnis nach public/images/rooms schreiben")
    a = ap.parse_args()
    os.makedirs(ZIEL_NEU, exist_ok=True)
    im = Image.open(QUELLE).convert("RGB")
    if im.size != (BREITE, HOEHE):
        raise SystemExit(f"Strukturbild hat {im.size}, erwartet {(BREITE, HOEHE)}")
    for name, (etage, seite) in KAPITEL.items():
        f = ausschnitt(etage, seite)
        hoch = round(ZIELBREITE * 9 / 16)
        bild = im.crop(f).resize((ZIELBREITE, hoch), Image.LANCZOS)
        p = os.path.join(ROOMS if a.setzen else ZIEL_NEU, name + ".jpg")
        bild.save(p, "JPEG", quality=92, subsampling=0, optimize=True)
        print(f"{name:11s} {f} → {bild.size}  {os.path.getsize(p) / 1e6:.1f} MB")
    print("gesetzt in", ROOMS if a.setzen else ZIEL_NEU)


if __name__ == "__main__":
    main()
