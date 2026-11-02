#!/usr/bin/env python3
"""
Personen im neu erzeugten Strukturbild scharf zeichnen.

Ausgangslage: neues_strukturbild.py liefert 1536x1024, das Masterbild braucht
6144x4096. Nach dem Hochskalieren sind die Personen weich — im alten Bild waren
sie schaerfer, weil es mit einem kreativen Upscaler (Magnific) vergroessert
wurde, der beim Vergroessern Struktur erfindet.

Dieses Skript holt denselben Effekt gezielt fuer die Personen: jede Gruppe wird
als 1024er-Kachel an gpt-image gegeben und dort in nativer Aufloesung neu
gezeichnet — mit Haaransatz, Hautstruktur, Stofftextur.

Zwei Lehren aus der Retusche des alten Bilds stecken in den Parametern:

* **Gruppen statt Einzelpersonen.** Liegt die Blendkante zwischen zwei dicht
  beieinander stehenden Personen, mischen sich alte und neue Fassung. Personen,
  die sich beruehren oder ueberlappen, kommen deshalb in eine gemeinsame Box.
* **Breiter Rand, schmale Blendzone.** RAND 40 / WEICH 6: ueberblendet wird rund
  40 px neben der Gruppe, wo Kachel und Original ohnehin gleich sind.

Aufruf:
  export OPENAI_API_KEY=...
  python3 produktion/strukturbild/personen_scharf.py --overlay   # Boxen pruefen
  python3 produktion/strukturbild/personen_scharf.py             # alle Gruppen
  python3 produktion/strukturbild/personen_scharf.py --nur og3_l_a
"""
import argparse
import base64
import io
import os
import time

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from personen_retusche import lade_key, ZIEL

QUELLE = os.path.join(ZIEL, "neu", "variante_4_gross.png")
KACHELN = os.path.join(ZIEL, "neu", "scharf_tiles")
os.makedirs(KACHELN, exist_ok=True)

KACHEL = 1024
RAND = 40
WEICH = 6
MODELL = os.environ.get("IMAGE_MODEL", "gpt-image-1.5")

# Gruppen: name -> ((x0, y0, x1, y1), was dort zu sehen ist)
GRUPPEN = {
    "og3_l_a": ((960, 500, 1370, 990),
                "two board members seated side by side at the conference table, the left one "
                "grey-haired in a dark suit seen in profile, the right one in a dark suit and tie"),
    "og3_l_b": ((1480, 550, 1740, 990),
                "a board member seen from behind, seated in a black office chair at the "
                "conference table"),
    "og3_l_c": ((1870, 520, 2370, 990),
                "three board members seated at the far side of the conference table, one in "
                "profile facing left, one grey-haired, one with lighter hair"),
    "og3_r_a": ((3810, 400, 4330, 1000),
                "a woman with long dark hair and a man with grey hair and a beard, both "
                "standing in front of a whiteboard covered in sticky notes, talking"),
    "og3_r_b": ((4580, 500, 5100, 1000),
                "a man and a blonde woman seated opposite each other at a wooden desk with "
                "open laptops"),
    "og2_l_a": ((930, 1400, 1620, 1720),
                "three risk controllers seen from behind, seated in black office chairs at a "
                "long monitor desk"),
    "og2_l_b": ((1720, 1400, 2370, 1720),
                "two risk controllers seen from behind, seated in black office chairs at a "
                "long monitor desk"),
    "og2_r_a": ((3550, 1260, 3930, 1840),
                "two men standing in conversation in front of a large wall display, one in a "
                "green sweater, one in a light grey sweater"),
    "og2_r_b": ((4520, 1420, 5220, 1740),
                "a man and a woman seated at desks with monitors, working"),
    "og1_l_a": ((1010, 2230, 1420, 2620),
                "a man in a dark suit and a woman in a dark jacket seated in green armchairs "
                "at a small round table, talking"),
    "og1_l_b": ((1960, 2230, 2370, 2620),
                "a woman with long hair and a man in a suit seated in green armchairs at a "
                "small round table, talking"),
    "og1_r_a": ((3710, 2140, 4240, 2530),
                "two colleagues seated in black office chairs at a long desk with monitors"),
    "og1_r_b": ((4320, 2160, 4920, 2530),
                "two colleagues seated in black office chairs at a long desk with monitors, "
                "one of them a woman with dark hair"),
    "og1_r_c": ((5070, 2080, 5250, 2600),
                "a man standing at a height-adjustable standing desk, working at a monitor"),
    "eg_l_a": ((300, 3180, 610, 3780),
               "a man in a dark green sweater and light trousers walking across the plaza, "
               "seen from behind"),
    "eg_l_b": ((820, 2960, 1010, 3470),
               "a woman with curly hair in a camel coat standing at the branch counter, seen "
               "from behind"),
    "eg_l_c": ((1110, 2920, 1720, 3470),
               "a customer in a dark green jacket at the counter, a bank adviser in a suit "
               "behind the counter, and a second customer in a dark jacket"),
    "eg_r_a": ((4030, 3020, 4400, 3500),
               "a bank adviser in a dark suit seated in a green armchair, talking"),
    "eg_r_b": ((4680, 3020, 4980, 3500),
               "a woman in a light knitted sweater and a man in a dark suit seated in "
               "armchairs at a round table"),
    "eg_r_c": ((5180, 3180, 5350, 3740),
               "a woman in a light coat walking past, seen in profile"),
    # Der Passant ganz rechts aussen lag zunaechst neben allen Fenstern und wurde
    # deshalb nie mitgezogen — er faellt am fertigen Bild sofort auf, weil er als
    # einziger Mensch im Vordergrund unscharf bleibt.
    "eg_r_d": ((5850, 3170, 6130, 3830),
               "a man in a dark blue suit walking across the plaza towards the right, "
               "seen from behind"),
    "lift_a": ((2960, 1400, 3140, 1920),
               "a man standing upright inside the glass elevator car, facing the camera"),
}

# Wichtig: ohne ausdrueckliche Skalen-Verankerung liest gpt-image die Maske als
# "fuelle diese Flaeche mit Personen" und zoomt sie formatfuellend heran — aus drei
# kleinen Sitzenden werden drei grosse. Deshalb steht die Groesse doppelt drin:
# als Anteil der Bildhoehe und als Verbot, naeher heranzugehen.
PROMPT = (
  "This is a WIDE architectural photograph of a whole floor of a building, seen from a "
  "distance. The people in it are SMALL — each person covers only a small part of the "
  "frame, roughly a third of the image height, exactly as they already appear. "
  "Inside the transparent area, redraw the same people at full photographic detail: {was}. "
  "They must keep exactly the same size, position, pose, clothing and colour — do NOT zoom "
  "in, do NOT enlarge them, do NOT crop closer, do NOT turn this into a close-up portrait. "
  "Each head stays as small as it is now. Do not add or remove anyone, and leave the "
  "furniture, floor and wall behind them where they are. "
  "Only add the detail a real photograph would have at this distance: a soft natural "
  "hairline instead of a painted edge, believable skin and shading, fabric folds, correct "
  "anatomy, separated fingers on visible hands, proper shoes on visible feet, soft contact "
  "shadows. Photorealistic architectural photography, matching the surrounding daylight. "
  "Keep the exact same camera, framing and crop. No waxy skin, no wig-like hair, no "
  "illustration look, no text."
)


def fenster_fuer(box, breite=6144, hoehe=4096):
    cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
    kante = max(KACHEL, (box[2] - box[0]) + 2 * RAND + 240,
                (box[3] - box[1]) + 2 * RAND + 240)
    x0 = max(0, min(cx - kante // 2, breite - kante))
    y0 = max(0, min(cy - kante // 2, hoehe - kante))
    return (x0, y0, x0 + kante, y0 + kante)


def maske_fuer(box, fenster):
    kante = fenster[2] - fenster[0]
    m = Image.new("L", (kante, kante), 255)
    ImageDraw.Draw(m).rounded_rectangle(
        (box[0] - fenster[0] - RAND, box[1] - fenster[1] - RAND,
         box[2] - fenster[0] + RAND, box[3] - fenster[1] + RAND), radius=24, fill=0)
    rgba = Image.new("RGBA", (kante, kante), (0, 0, 0, 255))
    rgba.putalpha(m)
    return rgba, m


def edit(client, bild, maske, prompt, versuche=4):
    for v in range(versuche):
        try:
            pb, pm = io.BytesIO(), io.BytesIO()
            bild.save(pb, format="PNG"); pb.name = "b.png"; pb.seek(0)
            maske.save(pm, format="PNG"); pm.name = "m.png"; pm.seek(0)
            kw = {"input_fidelity": "high"} if MODELL.startswith("gpt-image-1") else {}
            r = client.images.edit(model=MODELL, image=pb, mask=pm, prompt=prompt,
                                   size="1024x1024", quality="high", **kw)
            return Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
        except Exception as e:
            print("  retry", v + 1, str(e)[:150], flush=True)
            time.sleep(10 * (v + 1))
    raise SystemExit("Bildmodell antwortet nicht")


def ausrichten(original, tile, maske):
    """Kachel per ORB/RANSAC auf das Original entzerren."""
    import cv2
    a = np.asarray(original.convert("L"))
    b = np.asarray(tile.convert("L"))
    m = np.asarray(maske)
    orb = cv2.ORB_create(6000)
    ka, da = orb.detectAndCompute(a, m)
    kb, db = orb.detectAndCompute(b, m)
    if da is None or db is None:
        return tile, 0.0
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    ms = sorted(bf.match(da, db), key=lambda x: x.distance)[:800]
    if len(ms) < 20:
        return tile, 0.0
    pa = np.float32([ka[x.queryIdx].pt for x in ms])
    pb = np.float32([kb[x.trainIdx].pt for x in ms])
    M, inl = cv2.estimateAffinePartial2D(pb, pa, method=cv2.RANSAC, ransacReprojThreshold=3.0)
    if M is None:
        return tile, 0.0
    sc = float(np.hypot(M[0, 0], M[0, 1]))
    if not 0.97 <= sc <= 1.06:
        return tile, sc
    arr = np.asarray(tile.convert("RGB"))
    out = cv2.warpAffine(arr, M, (arr.shape[1], arr.shape[0]), flags=cv2.INTER_LANCZOS4,
                         borderMode=cv2.BORDER_REFLECT)
    return Image.fromarray(out), sc


def overlay():
    im = Image.open(QUELLE).convert("RGB")
    d = ImageDraw.Draw(im)
    for name, (box, _) in GRUPPEN.items():
        d.rectangle(box, outline=(255, 0, 0), width=6)
        d.text((box[0] + 8, box[1] - 34), name, fill=(255, 220, 0))
    p = os.path.join(ZIEL, "scharf_overlay.jpg")
    im.resize((3072, 2048)).save(p, quality=88)
    print("overlay:", p)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--overlay", action="store_true")
    ap.add_argument("--nur", nargs="*")
    ap.add_argument("--neu", action="store_true")
    ap.add_argument("--parallel", type=int, default=5)
    a = ap.parse_args()
    if a.overlay:
        return overlay()
    lade_key()
    from openai import OpenAI
    client = OpenAI()
    quelle = Image.open(QUELLE).convert("RGB")
    namen = [n for n in GRUPPEN if not a.nur or n in a.nur]

    def bauen(name):
        box, was = GRUPPEN[name]
        p = os.path.join(KACHELN, name + ".png")
        if os.path.exists(p) and not a.neu:
            return name, "vorhanden"
        f = fenster_fuer(box)
        kante = f[2] - f[0]
        aus = quelle.crop(f)
        maske, _ = maske_fuer(box, f)
        if kante != KACHEL:
            aus = aus.resize((KACHEL, KACHEL), Image.LANCZOS)
            maske = maske.resize((KACHEL, KACHEL), Image.NEAREST)
        print(name, "→ Bildmodell", flush=True)
        neu = edit(client, aus, maske, PROMPT.format(was=was))
        if kante != KACHEL:
            neu = neu.resize((kante, kante), Image.LANCZOS)
        neu.save(p)
        return name, "neu"

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max(1, a.parallel)) as ex:
        for name, status in ex.map(bauen, namen):
            print(name, "kachel", status, flush=True)

    im = quelle.copy()
    for name in GRUPPEN:
        p = os.path.join(KACHELN, name + ".png")
        if not os.path.exists(p):
            continue
        box, _ = GRUPPEN[name]
        f = fenster_fuer(box)
        _, m = maske_fuer(box, f)
        tile, sc = ausrichten(quelle.crop(f), Image.open(p).convert("RGB"), m)
        alpha = Image.eval(m, lambda v: 255 - v).filter(ImageFilter.GaussianBlur(WEICH))
        im.paste(Image.composite(tile, im.crop(f), alpha), f[:2])
        print(name, f"montiert (skalierung={sc:.3f})", flush=True)
    ziel = os.path.join(ZIEL, "neu", "variante_4_scharf.jpg")
    im.save(ziel, quality=95, subsampling=0)
    print("fertig:", ziel)


if __name__ == "__main__":
    main()
