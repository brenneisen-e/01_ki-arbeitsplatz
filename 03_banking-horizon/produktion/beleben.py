#!/usr/bin/env python3
"""v07: die Welt beleben — Menschen und Dichte in die Stills.

Die Leere war eine Nebenwirkung der Fehlerabwehr (Negativliste gegen
Duplikate und Fratzen). v07 dreht das um: DIVERSE, ruhige Statisten im
Hintergrund, dichteres Mobiliar — unter zwei harten Regeln:
  * GLASFLAECHEN UNANGETASTET: niemand und nichts beruehrt das Chroma
    (Verdecker-Regel, Defekt 22); die Monitorkaesten wandern nicht.
  * Vordergrund frei: Statisten sitzen oder stehen in der Tiefe, niemand
    kreuzt Maras Weg oder die Kamera.
Jedes Ergebnis wird in voller Aufloesung an den Gesichtern gesichtet
(Alien-Check) — Bewegungsunschaerfe-Fratzen waren Defekt 4.
"""
import os
import sys

from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import bilder_neu as bn  # noqa: E402

Q = f"{HIER}/quellen"
V7 = f"{HIER}/quellen_v07"
os.makedirs(V7, exist_ok=True)


def edit_ganz(quelle, ziel, prompt):
    """Ganzbild-Edit (Komposition darf atmen), 16:9 via Polster."""
    if os.path.exists(f"{V7}/{ziel}.png"):
        return print(f"{ziel} existiert", flush=True)
    b = Image.open(quelle).convert("RGB")
    neu = bn.edit([bn.polstern(b)], prompt)
    bn.entpolstern(neu).save(f"{V7}/{ziel}.png")
    print(f"{ziel} ok", flush=True)



def maskiert(quelle, ziel, zonen, prompt):
    """Chirurgischer Edit: NUR die Zonen (Anteile x0,y0,x1,y1) sind frei,
    alles andere bleibt pixelgenau — zurueckkomponiert ueber eine weiche
    Gesamtmaske. Fuer Statisten-Wechsel, ohne Architektur zu riskieren."""
    from PIL import ImageFilter
    b = Image.open(quelle).convert("RGB")
    gep = bn.polstern(b)
    maske = Image.new("L", gep.size, 255)
    d = ImageDraw.Draw(maske)
    for x0, y0, x1, y1 in zonen:
        d.rectangle((round(x0 * 1536), 80 + round(y0 * 864),
                     round(x1 * 1536), 80 + round(y1 * 864)), fill=0)
    rgba = gep.convert("RGBA")
    rgba.putalpha(maske)
    neu = bn.entpolstern(bn.edit([rgba], prompt))
    alpha = Image.new("L", b.size, 0)
    d2 = ImageDraw.Draw(alpha)
    for x0, y0, x1, y1 in zonen:
        d2.rectangle((round(x0 * 1920) + 6, round(y0 * 1080) + 6,
                      round(x1 * 1920) - 6, round(y1 * 1080) - 6), fill=255)
    alpha = alpha.filter(ImageFilter.GaussianBlur(6))
    Image.composite(neu.resize(b.size), b, alpha).save(f"{V7}/{ziel}.png")
    print(f"{ziel} ok (maskiert)", flush=True)


STATISTEN = (
    " All people are calm, diverse and distinct from each other — different ages, hair, "
    "clothing colors and builds, natural relaxed faces, no two people alike. Nobody crosses "
    "the foreground, nobody looks at the camera, nobody resembles the woman with the dark "
    "chin-length bob and black blazer."
)

if __name__ == "__main__":
    bn.client = bn.client or __import__("openai").OpenAI()

    # Eingangshalle: besetzter Empfang, unterschiedliche Menschen, Bewegung
    # in der Tiefe — Schranken und Sperrlinie bleiben exakt.
    edit_ganz(f"{Q}/halle_innen.png", "halle_innen",
              "Bring this bank arrival hall to life: a receptionist at the oak counter, two "
              "colleagues in conversation near the planted island, one person walking in the "
              "far background towards the elevators, one seated in the lounge area reading a "
              "tablet. KEEP EXACTLY AS THEY ARE: the row of glass speed gates with their "
              "pale stone pedestals and the barrier line, the architecture, the Frankfurt "
              "skyline, the light." + STATISTEN)

    # Buero-Totale: ein echtes Grossraum-Umfeld — Tiefe links und hinten,
    # zwei ferne Kollegen; die RECHTE Haelfte bleibt frei (Kachelflaeche),
    # Monitor und Mara unangetastet.
    edit_ganz(f"{Q}/s2b_rein.png", "s2b_rein",
              "Make this office feel like part of a real workplace: in the FAR BACKGROUND "
              "LEFT and BEHIND the woman, add two more desks with monitors switched off and "
              "two seated colleagues working quietly, plus subtle depth (shelf, plant, a "
              "distant glass meeting box). KEEP EXACTLY AS THEY ARE: the woman at her desk, "
              "her monitor with its flat matte chroma-key green screen — nothing may touch "
              "or overlap the green — and THE ENTIRE RIGHT HALF OF THE FRAME stays exactly "
              "as it is: open, empty floor." + STATISTEN)

    print("BELEBEN TEIL 1 FERTIG", flush=True)
