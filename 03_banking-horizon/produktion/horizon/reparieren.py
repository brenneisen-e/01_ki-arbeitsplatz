#!/usr/bin/env python3
"""Einzelne Bildfehler in den Hypothesen-Szenen ausbessern.

Der Auftraggeber hat drei Stellen gefunden, an denen gpt-image-2 Koerper
unvollstaendig gelassen hat: dem Mann in h3 fehlt die ganze linke Seite samt
Arm, bei der Frau daneben setzt der greifende Arm ohne Schulter an, und der
Mann in h4 ist flach wie ein Pappaufsteller ohne sichtbaren Arm.

Ausbessern heisst hier NICHT neu erzeugen. Zwei Dinge muessen ueberleben:

  1. Alles ausserhalb der ausgebesserten Stelle. `images.edit` haelt sich
     nicht an die Maske (das hat schon die Verbreiterung gelehrt) und malt
     das ganze Bild neu — also wird die Maske hinterher von Hand
     durchgesetzt.
  2. Die gruen leuchtende Grafik. Sie traegt die Beschriftungen, und neu
     gezeichneter Text ist kaputter Text. Sie wird ueber ihre Farbe erkannt
     und ueberall zurueckgeholt, auch INNERHALB der ausgebesserten Stelle —
     der Arm des Mannes laeuft schliesslich hinter "Payments Gateway" her.

    SCRATCH=… python3 reparieren.py h3 h4
"""
import base64
import io
import os
import sys

import numpy as np
from openai import OpenAI
from PIL import Image, ImageDraw, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
MODELL_BILDER = os.path.abspath(f"{HIER}/../../public/images")
ZIEL = f"{HIER}/hypothesen"
ROH = f"{ZIEL}/roh"

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

# Die Stellen, im fertigen 1920x1080-Bild gemessen, und was dort fehlt.
STELLEN = {
 "h3": ([(440, 0, 830, 900), (1090, 0, 1570, 780)],
        "Two of the people are anatomically incomplete and must be made whole: the man on the "
        "left in the navy suit is missing his entire left side — give him a complete torso and "
        "BOTH arms, the near arm reaching down to the table with a correctly formed hand, the "
        "far arm visible along his side; and the woman on the right in the cream sweater has an "
        "arm that starts in mid-air — connect both of her arms properly to her shoulders, with "
        "correctly formed hands. Keep their faces, clothing, posture, skin tone and the light "
        "exactly as they are."),
 "h4": ([(310, 220, 590, 1080)],
        "The man on the left in the light blue sweater reads as a flat cut-out: give him a "
        "real three-dimensional body — a visible near arm hanging along his side with a "
        "correctly formed hand, shoulders with depth, folds in the knitted sweater, and the "
        "soft shadow a body casts on the wall behind it. Keep his face, his clothing, his "
        "posture and the light exactly as they are."),
}

# Schilder, die INNERHALB einer ausgebesserten Stelle liegen, im fertigen
# 1920x1080-Bild gemessen.
#
# Die Flutfuellung holt Rahmen und Fuellung meist zurueck, aber nicht immer:
# wo eine Verbindungslinie den Rahmen durchbricht, laeuft sie ins Schild
# hinein und laesst die Haelfte der Beschriftung draussen. Bei drei Schildern
# war genau das der Fall. Auf Formerkennung ist hier kein Verlass — diese
# Schilder stehen fest, also werden sie als feste Rechtecke zurueckgeholt.
SCHILDER = {
 "h3": [(628, 500, 808, 664),      # Digitales Onboarding
        (620, 738, 800, 908),      # Payments Gateway
        (1100, 504, 1280, 664)],   # KYC / ID-Verifizierung
 "h4": [],
}

RAHMEN = (
    " Photorealistic documentary photograph, identical in style, lighting, colour and grain to "
    "the rest of the image. Everyone keeps five separated fingers per hand. Change nothing "
    "else: no new people, no new objects, no text, no logos, and nothing about the glowing "
    "green graphics.")


def nach_1536(kasten):
    """Ein Kasten aus dem 1920x1080-Bild in die 1536x1024-Leinwand."""
    x0, y0, x1, y1 = kasten
    return (int(x0 * 0.8), int(y0 * 0.8 + 80), int(x1 * 0.8), int(y1 * 0.8 + 80))


def gute_leinwand(name, kapitel):
    """Die 1536x1024-Fassung mit unversehrter Mitte — wie hypothesen_breit sie baut."""
    import hypothesen_breit as hb
    quelle = Image.open(f"{MODELL_BILDER}/{kapitel}.png").convert("RGB")
    breit = Image.open(f"{ROH}/{name}_breit.png").convert("RGB")
    return hb.zusammensetzen(breit, quelle.crop((768, 0, 1536, 1024)))


def gruenmaske(bild, weiten=3, weich=1.4):
    """Wo die leuchtende Grafik steht — samt ihrer Beschriftung.

    Erster Versuch: nur die gruenen Pixel. Das hat die Schilder ruiniert.
    Der Rahmen eines Schildes ist gruen, seine Beschriftung aber WEISS und
    seine Fuellung dunkel — beides faellt durch einen Gruenfilter, und was
    zurueckkam, war ein leerer Rahmen um neu gemalten Buchstabensalat.
    "Digitales Onboarding" wurde zu einem Fragment, "KYC / ID-Verifizierung"
    zu "YC".

    Ein Schildrahmen ist aber ein geschlossener Ring. Also wird nach den
    gruenen Pixeln geflutet, was AUSSERHALB liegt; was dabei nicht erreicht
    wird, ist eingeschlossen — die Fuellung samt Text — und gehoert dazu.
    """
    x = np.asarray(bild, dtype=np.int16)
    r, g, b = x[..., 0], x[..., 1], x[..., 2]
    treffer = ((g > r + 22) & (g > b + 18) & (g > 80)).astype(np.uint8) * 255
    ring = Image.fromarray(treffer).filter(ImageFilter.MaxFilter(5))

    # Von allen vier Raendern her fluten: was schwarz bleibt, ist Fuellung.
    flut = ring.copy()
    zeichnen = ImageDraw.floodfill
    br, ho = flut.size
    for punkt in ((0, 0), (br - 1, 0), (0, ho - 1), (br - 1, ho - 1),
                  (br // 2, 0), (br // 2, ho - 1), (0, ho // 2), (br - 1, ho // 2)):
        if flut.getpixel(punkt) == 0:
            zeichnen(flut, punkt, 128)
    gefuellt = np.asarray(flut) == 0          # eingeschlossene Flaechen
    voll = np.maximum(np.asarray(ring), gefuellt.astype(np.uint8) * 255)
    return Image.fromarray(voll).filter(ImageFilter.MaxFilter(2 * weiten + 1)) \
                .filter(ImageFilter.GaussianBlur(weich))


def uebernahme(gut, neu, kaesten, sanft=9):
    """Wo das Original zurueckkommt — nicht per Kante, sondern per Aehnlichkeit.

    Der erste Versuch hat die Kaesten hart abgegrenzt und die Kante weich
    gezeichnet. Das ergab einen blassen Schleier laengs der Kante: dort
    treffen zwei Bilder aufeinander, die sich genau an dieser Stelle
    unterscheiden — im alten war kein Arm, im neuen ist einer —, und eine
    weiche Blende zwischen zwei verschiedenen Dingen zeigt beide halb.

    Eine weiche Blende funktioniert nur, wo beide Seiten dasselbe zeigen.
    Also entscheidet nicht mehr die Kante, sondern der Unterschied: wo sich
    das ausgebesserte Bild kaum vom Original unterscheidet (Hintergrund,
    Boden, Wand), kommt das Original zurueck; wo es sich deutlich
    unterscheidet, steht die Ausbesserung. Der Uebergang liegt damit immer
    dort, wo beide gleich aussehen, und ist unsichtbar.
    """
    a = np.asarray(gut, dtype=np.int16)
    b = np.asarray(neu, dtype=np.int16)
    unterschied = np.abs(a - b).max(axis=2).astype(np.float32)
    unterschied = np.asarray(
        Image.fromarray(unterschied.astype(np.uint8)).filter(
            ImageFilter.GaussianBlur(sanft)), dtype=np.float32)
    # 1.0 bei Gleichheit, 0.0 ab deutlichem Unterschied, dazwischen weich.
    anteil = np.clip((38.0 - unterschied) / 26.0, 0.0, 1.0)
    anteil = anteil * anteil * (3 - 2 * anteil)        # weiche Flanke

    maske = np.full(a.shape[:2], 255.0, dtype=np.float32)
    for k in kaesten:
        x0, y0, x1, y1 = nach_1536(k)
        maske[y0:y1, x0:x1] = anteil[y0:y1, x0:x1] * 255.0
    return Image.fromarray(maske.astype(np.uint8))


def ausbessern(name, kapitel):
    kaesten, was = STELLEN[name]
    gut = gute_leinwand(name, kapitel)

    # Maske fuer OpenAI: durchsichtig = hier darfst du malen.
    maske = Image.new("RGBA", gut.size, (0, 0, 0, 255))
    for k in kaesten:
        kk = nach_1536(k)
        maske.paste(Image.new("RGBA", (kk[2] - kk[0], kk[3] - kk[1]), (0, 0, 0, 0)), kk[:2])

    pa, pm = f"{S}/rep_{name}_bild.png", f"{S}/rep_{name}_maske.png"
    gut.save(pa)
    maske.save(pm)
    r = client.images.edit(model="gpt-image-2", image=open(pa, "rb"),
                           mask=open(pm, "rb"), prompt=was + RAHMEN, size="1536x1024")
    neu = Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
    neu.save(f"{ROH}/{name}_repariert_roh.png")

    # 1. Das Original zurueckholen, wo es sich vom Ergebnis kaum unterscheidet.
    ergebnis = neu.copy()
    ergebnis.paste(gut, (0, 0), uebernahme(gut, neu, kaesten))
    # 2. Die leuchtende Grafik ueberall zurueckholen — auch mitten in der
    #    ausgebesserten Stelle, sonst steht dort neu gemalter Text.
    ergebnis.paste(gut, (0, 0), gruenmaske(gut))
    # 3. Die Schilder, bei denen das nicht reicht, als feste Rechtecke.
    if SCHILDER.get(name):
        schild = Image.new("L", gut.size, 0)
        for k in SCHILDER[name]:
            kk = nach_1536(k)
            schild.paste(Image.new("L", (kk[2] - kk[0], kk[3] - kk[1]), 255), kk[:2])
        ergebnis.paste(gut, (0, 0), schild.filter(ImageFilter.GaussianBlur(4)))

    ergebnis.save(f"{ROH}/{name}_repariert.png")
    ergebnis.crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS) \
            .save(f"{ZIEL}/{name}.png")
    print("ausgebessert:", name, flush=True)


if __name__ == "__main__":
    import hypothesen_breit as hb
    for n in (sys.argv[1:] or list(STELLEN)):
        ausbessern(n, hb.SZENEN[n][0])
    print("REPARATUR FERTIG", flush=True)
