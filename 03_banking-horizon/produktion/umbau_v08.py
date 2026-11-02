#!/usr/bin/env python3
"""Ein Standbild AUS einem anderen bauen, statt es neu zu erzeugen.

Zwei Befunde aus der Abnahme haben zu diesem Weg gefuehrt:

  * Das Zwischenbild der Wohnungstuer stand auf einer leicht anderen Kamera.
    Kling musste im Take zwischen zwei Kamerapositionen fahren — dabei drehten
    sich die Hocker und die Wand veraenderte sich.
  * Das Bild hinter der Schranke wurde frei erzeugt, nur mit dem
    Schrankenbild als Anker. Dabei ist ein anderes Tor aufgegangen und die
    mittlere Gasse breiter geworden.

Beides hat dieselbe Ursache: ein Bildmodell trifft eine Geometrie nicht
zweimal. Also wird sie gar nicht erst zweimal erzeugt. Das Folgebild entsteht
aus dem abgenommenen Vorgaengerbild; das Modell darf nur benannte Felder
anfassen, alles andere wird Pixel fuer Pixel zurueckgeschrieben — mit weicher
Kante und einem Tonwertabgleich, der ausserhalb der Felder gemessen wird.

    SCRATCH=… python3 umbau_v08.py tuer
    SCRATCH=… python3 umbau_v08.py halle
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
S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

RAND = 22

# name -> (Quelle, Ziel, Felder, Prompt)
JOBS = {
    # 07:05 — dieselbe Wohnung, Tuer offen, Mara in der Oeffnung.
    "tuer": (
        "quellen_v08/wohnung_rein.png", "quellen_v08/flur_tuer.png",
        [(860, 280, 1250, 1080), (1400, 60, 1920, 1010)],
        "Photorealistic edit of this apartment. Change ONLY two things and leave the entire rest "
        "of the picture untouched — same camera, same framing, same lighting, same furniture, "
        "same wall, same window, same floor. "
        "FIRST: the bar stool at the kitchen island is now EMPTY. The woman is no longer sitting "
        "on it. The stool keeps its exact position and orientation. The phone is gone from the "
        "island; the stoneware cup stays where it is. "
        "SECOND: the wide oak entrance door in the right-hand wall now STANDS OPEN — the leaf has "
        "swung away from the camera into the corridor and rests almost flat against the wall, its "
        "handle still attached to the leaf. Through the opening you see a calm, well-lit "
        "apartment corridor with pale walls, a grey stone floor and recessed ceiling lights. THE "
        "SAME WOMAN stands IN THE OPEN DOORWAY, seen FROM BEHIND, mid-step, one foot already on "
        "the corridor floor beyond the threshold; her face is not visible. She wears the same "
        "black blazer, white top, navy trousers and black loafers. SHE HOLDS HER SMARTPHONE IN "
        "HER FREE HAND, down at her side, clearly visible — she has taken it with her. The keys "
        "are gone from the console table. "
        "Do not move, rotate, duplicate or re-render anything else. Keep the composition "
        "identical."),

    # 07:50 — dieselbe Halle, dieselbe Sperrlinie, sie ist hindurch.
    # Das Feld ist genau die mittlere Gasse: es beruehrt keinen einzigen
    # Sockel, deshalb koennen die Tore weder wandern noch breiter werden.
    "halle": (
        "quellen_v08/schranke.png", "quellen_v08/halle_innen.png",
        [(690, 170, 1240, 1010)],
        "Photorealistic edit of this bank arrival hall. Change ONLY what is described and leave "
        "the entire rest of the picture untouched — same camera, same framing, same light, same "
        "shadows, same reception desk, same facade, same floor. "
        "The security barrier itself does not change in any way: every pedestal keeps its exact "
        "position, size and shape, every other lane keeps its closed glass leaves, the glass "
        "balustrades to the left and to the right stay exactly as they are. "
        "FIRST: the woman is no longer standing in front of the middle lane. "
        "SECOND: the pair of glass leaves of THAT MIDDLE LANE has slid open sideways and is now "
        "retracted into the two pedestals beside it, so the lane stands clear and one looks "
        "straight through it across the pale stone floor. "
        "THIRD: THE SAME WOMAN — same black blazer, white top, navy trousers, black loafers, dark "
        "chin-length bob — has just stepped through and is now only TWO OR THREE METRES BEYOND "
        "the barrier, seen THROUGH the open lane and FROM BEHIND; her face is not visible. She "
        "is still LARGE in the frame: her whole figure fills most of the height of the open "
        "lane, her head reaching about a quarter of the way down from the top of the picture, "
        "only a little smaller than she was before. She is WALKING TOWARDS THE RIGHT-HAND SIDE OF THE "
        "HALL, not straight away from the camera: her body is turned about 45 degrees to her "
        "right, we see her back and a little of her right shoulder, and she is mid-step with "
        "her leading foot pointing to the right. She is heading for the wide open oak doorway "
        "in the right-hand wall. The phone is in her hand at her side. She casts a soft shadow "
        "on the floor. "
        "Do not add anyone else, do not move the people behind the desk, do not change the "
        "barrier. Keep the composition identical."),
}


def polstern(b):
    voll = Image.new("RGB", (1536, 1024))
    voll.paste(b.resize((1536, 864), Image.LANCZOS), (0, 80))
    voll.paste(voll.crop((0, 80, 1536, 160)).transpose(Image.FLIP_TOP_BOTTOM), (0, 0))
    voll.paste(voll.crop((0, 864, 1536, 944)).transpose(Image.FLIP_TOP_BOTTOM), (0, 944))
    return voll


def entpolstern(b):
    return b.crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS)


def edit(bild, prompt, versuche=4):
    for v in range(versuche):
        try:
            p = io.BytesIO()
            bild.save(p, format="PNG")
            p.name = "szene.png"
            p.seek(0)
            r = client.images.edit(model="gpt-image-2", image=[p], prompt=prompt,
                                   size="1536x1024", quality="high")
            return Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
        except Exception as e:
            print("  Versuch", v + 1, str(e)[:150], flush=True)
            time.sleep(12 * (v + 1))
    raise SystemExit("Bildmodell antwortet nicht")


def angleichen(neu, alt, maske):
    """Tonwert des neuen Bildes an das alte ziehen — gemessen DRAUSSEN.

    Sonst sitzt an der weichen Kante ein Helligkeitssprung: das Modell gibt
    das Bild nie exakt im selben Ton zurueck.
    """
    n, a = np.asarray(neu, np.float32), np.asarray(alt, np.float32)
    aussen = ~maske
    for k in range(3):
        sn, sa = n[..., k][aussen], a[..., k][aussen]
        f = (sa.std() or 1) / (sn.std() or 1)
        n[..., k] = (n[..., k] - sn.mean()) * f + sa.mean()
    return Image.fromarray(np.clip(n, 0, 255).astype(np.uint8))


def lauf(name):
    quelle, ziel, felder, prompt = JOBS[name]
    alt = Image.open(f"{HIER}/{quelle}").convert("RGB")
    neu = entpolstern(edit(polstern(alt), prompt))

    harte = Image.new("L", alt.size, 0)
    z = ImageDraw.Draw(harte)
    for f in felder:
        z.rectangle(f, fill=255)
    maske = np.asarray(harte) > 127

    neu = angleichen(neu, alt, maske)
    Image.composite(neu, alt, harte.filter(ImageFilter.GaussianBlur(RAND))).save(f"{HIER}/{ziel}")

    a, b = np.asarray(Image.open(f"{HIER}/{ziel}"), np.int16), np.asarray(alt, np.int16)
    d = np.abs(a - b).mean(axis=2)
    print(f"{name}: {ziel} | ausserhalb der Felder Mittel {d[~maske].mean():.2f}, "
          f"max {d[~maske].max():.0f}", flush=True)


if __name__ == "__main__":
    for n in sys.argv[1:] or list(JOBS):
        lauf(n)
