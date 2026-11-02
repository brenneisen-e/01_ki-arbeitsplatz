#!/usr/bin/env python3
"""Die Handyseite neben ihr im Bild.

Das Telefon in ihrer Hand ist im Bild daumengross — was sie liest, steht
deshalb daneben, eine Ebene fuer den Betrachter wie die Kundenkacheln um
08:10.

Zwei Aenderungen gegenueber v07, beide aus der Abnahme:

  * Die Ueberschrift („WHAT SHE READS") ist weg. Man sieht ohnehin, was es
    ist, und sie kostete Platz im Bild.
  * Dafuer ist die Flaeche als Geraet zu erkennen: sichtbarer Rand und
    Frontkamera. Vorher lag dort eine nackte Seite in der Luft.
"""
import os
import sys

from PIL import Image, ImageDraw

S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                              "4a027885-72f4-58d1-b5d9-f5090d47fbf4/scratchpad")
sys.path.insert(0, S)
import kacheln  # noqa: E402  (glas() und schrift())

# Die Tafel sitzt tiefer als in v07: in v08 liegt die Hypothese als Overlay
# oben auf dem Bild. Die Zahlen sind so gewaehlt, dass der obere Rand des
# Geraets auch nach dem Beschnitt der Buehne (cover) unter der Kopfzeile
# herauskommt.
LINKS, OBEN = 0.055, 0.20
HOEHE = 0.66


def _geraet(aus, kasten, H):
    """Rahmen und Frontkamera zeichnen — die Seite soll ein Telefon sein."""
    x0, y0, x1, y1 = kasten
    rand = round(H * 0.013)
    oben = round(H * 0.032)
    aussen = (x0 - rand, y0 - oben, x1 + rand, y1 + rand)
    radius = round(H * 0.040)
    d = ImageDraw.Draw(aus, "RGBA")
    d.rounded_rectangle(aussen, radius=radius, fill=(14, 17, 20, 240))
    # Heller Grat auf der Kante, sonst steht der Rahmen flach im Bild.
    d.rounded_rectangle(aussen, radius=radius, outline=(255, 255, 255, 96), width=2)
    # Frontkamera: kleine Linse mittig im oberen Rand.
    r = round(H * 0.0058)
    mx, my = (x0 + x1) // 2, y0 - oben // 2
    d.ellipse((mx - r, my - r, mx + r, my + r), fill=(6, 8, 10, 255),
              outline=(120, 130, 140, 190), width=1)
    d.ellipse((mx - r // 2, my - r // 2, mx, my), fill=(64, 84, 100, 210))


def tafel(bild, seite, teil=1.0, titel=None):
    """Die Handyseite ins Bild legen.

    `teil` blendet sie (0 = unsichtbar, 1 = ganz da) — im Video geht sie mit
    dem Telefon, im Standbild steht sie fertig. `titel` wird nicht mehr
    ausgewertet und bleibt nur, damit die Aufrufer unveraendert bleiben.
    """
    if teil <= 0:
        return bild
    B, H = bild.size
    hoehe = round(H * HOEHE)
    breite = round(hoehe * seite.width / seite.height)
    x0, y0 = round(B * LINKS), round(H * OBEN)
    kasten = (x0, y0, x0 + breite, y0 + hoehe)

    aus = bild.copy()
    _geraet(aus, kasten, H)
    inhalt = seite.convert("RGB").resize((breite, hoehe), Image.LANCZOS)
    ecken = Image.new("L", (breite, hoehe), 0)
    ImageDraw.Draw(ecken).rounded_rectangle((0, 0, breite - 1, hoehe - 1),
                                            radius=round(H * 0.022), fill=255)
    aus.paste(inhalt, (x0, y0), ecken)
    return aus if teil >= 1 else Image.blend(bild, aus, teil)
