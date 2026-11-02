#!/usr/bin/env python3
"""Holo-Agenten hinter den Menschen im Teamraum (09:00).

Aus der Review-Datenbank, zweimal notiert: „Können wir Holo-AI Agenten hinter
den jeweiligen menschlichen Mitarbeitern darstellen, um die Mixed Workforce zu
zeigen und zu zeigen, dass jeder Mitarbeiter eigene Agents führt?"

Das ist die einzige Aenderung der achten Fassung, die nicht ueber einen
Bildschirmtausch geht — der Raum selbst muss neu entstehen. Geaendert wird
deshalb NUR der Streifen hinter den Sitzenden; Tisch, Wandanzeige und
Vordergrund bleiben Pixel fuer Pixel stehen, damit die Anschluesse an die
Takes halten.

Die gruene Wandflaeche wird vor dem Aufruf mit dem fertigen Bildschirm
gefuellt und danach zurueckgesetzt: ein Bildmodell malt auf reines Chroma
sonst Reflexe und Verlaeufe, und die Stanzmaske findet die Flaeche danach
nicht mehr sauber.

    SCRATCH=… python3 holo_v08.py
"""
import base64
import io
import os
import sys
import time

import numpy as np
from openai import OpenAI
from PIL import Image, ImageDraw, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import keyen  # noqa: E402

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

QUELLE = f"{HIER}/quellen/besprechung_gruen.png"
ZIEL = f"{HIER}/quellen_v08/besprechung_gruen.png"

# Der Streifen, in dem die Menschen am Tisch sitzen — nur er wird neu gemalt.
# Darueber die Wandanzeige, darunter Tisch und Vordergrund: beides bleibt.
STREIFEN = (0.0, 0.28, 1.0, 0.72)

PROMPT = (
    "Photorealistic edit of this bank meeting room, same camera, same lighting, same people, "
    "same furniture. Behind each seated person, add a softly glowing translucent holographic "
    "figure — a standing humanoid silhouette made of light, clearly not physical, in the same "
    "muted teal-green as the room's accent colour. Each hologram stands directly behind and "
    "slightly above its person, like a colleague looking over their shoulder, at about 60 % "
    "opacity with soft edges and a faint vertical scan shimmer. The holograms must read "
    "instantly as digital agents, never as real people: no detailed faces, no clothing detail, "
    "no shadows on the floor. Do not change the people, the table, the wall display, the "
    "windows or anything in the foreground. Keep the composition identical."
)


def polstern(b):
    voll = Image.new("RGB", (1536, 1024))
    voll.paste(b.resize((1536, 864), Image.LANCZOS), (0, 80))
    oben = voll.crop((0, 80, 1536, 160)).transpose(Image.FLIP_TOP_BOTTOM)
    unten = voll.crop((0, 864, 1536, 944)).transpose(Image.FLIP_TOP_BOTTOM)
    voll.paste(oben, (0, 0))
    voll.paste(unten, (0, 944))
    return voll


def entpolstern(bild):
    return bild.crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS)


def edit(bild, prompt, versuche=4):
    for v in range(versuche):
        try:
            p = io.BytesIO()
            bild.save(p, format="PNG")
            p.name = "raum.png"
            p.seek(0)
            r = client.images.edit(model="gpt-image-2", image=[p], prompt=prompt,
                                   size="1536x1024", quality="high")
            return Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
        except Exception as e:
            print("  Versuch", v + 1, str(e)[:140], flush=True)
            time.sleep(12 * (v + 1))
    raise SystemExit("Bildmodell antwortet nicht")


def streifen_zurueck(original, neu, anteil, rand=14):
    """Nur den Streifen aus dem neuen Bild uebernehmen, weiche Kante."""
    b, h = original.size
    x0, y0 = round(anteil[0] * b), round(anteil[1] * h)
    x1, y1 = round(anteil[2] * b), round(anteil[3] * h)
    alpha = Image.new("L", original.size, 0)
    ImageDraw.Draw(alpha).rectangle((x0, y0 + rand, x1, y1 - rand), fill=255)
    alpha = alpha.filter(ImageFilter.GaussianBlur(rand))
    return Image.composite(neu.resize(original.size), original, alpha)


if __name__ == "__main__":
    os.makedirs(os.path.dirname(ZIEL), exist_ok=True)
    quelle = Image.open(QUELLE).convert("RGB")

    # Chroma vor dem Aufruf mit einem ruhigen Grau fuellen und danach exakt
    # zuruecksetzen — sonst malt das Modell auf der gruenen Wand herum.
    arr = np.asarray(quelle)
    maske = keyen.maske(arr)
    ohne = np.array(arr, copy=True)
    ohne[maske] = (26, 30, 34)
    print("Chroma geschuetzt:", int(maske.sum()), "px", flush=True)

    neu = entpolstern(edit(polstern(Image.fromarray(ohne)), PROMPT))
    erg = streifen_zurueck(Image.fromarray(ohne), neu, STREIFEN)

    # Chroma zurueck an genau dieselbe Stelle.
    fertig = np.asarray(erg).copy()
    fertig[maske] = arr[maske]
    Image.fromarray(fertig).save(ZIEL)

    pruef = keyen.maske(np.asarray(Image.open(ZIEL).convert("RGB")))
    print("gespeichert:", ZIEL, "| Chroma danach:", int(pruef.sum()), "px", flush=True)
    print("HOLO V08 FERTIG — danach die Takes s3s4 und s4s5 neu drehen", flush=True)
