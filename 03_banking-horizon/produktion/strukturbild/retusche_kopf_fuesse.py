#!/usr/bin/env python3
"""
Zwei Retuschen im Master-Strukturbild (public/images/Strukturbild.jpg, 6144x4096)
per gpt-image-Inpainting, nach den Erkenntnissen aus boden_beine.py:

  1. Boardroom (3. OG links): der rechte der beiden von hinten gesehenen
     Maenner (vor dem Balkendiagramm, Kopf leicht nach rechts gedreht) hat
     einen zu grossen Kopf. Kopf und Nacken werden proportional neu gezeichnet.
     (Der Mann in der Mitte ist in Ordnung und bleibt unangetastet.)
  2. Corporate Services / HR (1. OG links): die Beine und Fuesse der Frau im
     hellen Blazer am rechten Tisch sind anatomisch falsch (verdrehte, doppelte
     Fuesse), und die Fuesse des Mannes rechts daneben loesen sich an der
     Bodenkante auf. Unterschenkel und Schuhe werden je neu gezeichnet.

Je Retusche: quadratische Kachel (1024 px nativ) mit mindestens 200 px
Originalrand um die Maske, Prompt ohne Neurahmung („same camera, framing and
crop, do not zoom out"), Ergebnis nur innerhalb der Maske mit weicher Kante
zurueckmontiert. Vorher/Nachher-Vergleiche landen im Scratchpad.

Aufruf:
  export OPENAI_API_KEY=...          # oder $SCRATCH/.openai_env
  python3 produktion/strukturbild/retusche_kopf_fuesse.py [--nur kopf|fuesse] [--modell gpt-image-2]
  python3 produktion/strukturbild/retusche_kopf_fuesse.py --uebernehmen   # schreibt Strukturbild.jpg
"""
import argparse
import base64
import io
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HIER, "..", ".."))
QUELLE = os.path.join(APP, "public", "images", "Strukturbild.jpg")
S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                   "96b6dbe4-91d7-553a-aaf7-b4649e50f741/scratchpad")
ZIEL = os.path.join(S, "retusche")
os.makedirs(ZIEL, exist_ok=True)

KACHEL = 1024
WEICH = 14

# Kachel (links, oben) und Maske (x0, y0, x1, y1) in Originalpixeln.
AUFGABEN = {
    # Grosse Masken (Wunsch des Auftraggebers): der ganze Stuhl mit dem Mann,
    # und unter dem Tisch die Beine beider Personen in einer Konstellation.
    "stuhl_mann": {
        "kachel": (1513, 188),
        "maske": (1890, 505, 2150, 930),
        "prompt": (
            "Same photograph, same camera, same framing and crop. Do not zoom out, do not change "
            "the composition, the table, the dashboard wall or any other person. Only inside the "
            "masked area: redraw the man seen from behind together with his office chair as one "
            "consistent figure: a man with a normally proportioned head (small relative to his "
            "shoulders), short brown hair, dark navy suit and white shirt collar, sitting upright "
            "in ONE black mesh office chair with a single backrest and armrests that matches the "
            "other chairs at the table, seen from behind, looking at the dashboard wall, his hands "
            "on the table in front of him. The wooden table edge, the floor and the dark green "
            "dashboard continue seamlessly. Photorealistic, matching light, colour and grain."
        ),
        "weich": 10,
    },
    "konstellation": {
        "kachel": (1558, 1938),
        "maske": (1962, 2500, 2345, 2672),
        "prompt": (
            "Same photograph, same camera, same framing and crop. Do not zoom out, do not change "
            "the composition, the table top, the seats of the armchairs or the upper bodies of the "
            "people. Only inside the masked area, everything below the round table: the seated "
            "woman in the light grey blazer on the left has two anatomically correct legs, knees "
            "together, in a dark skirt, wearing black low-heeled pumps that rest flat on the floor; "
            "the seated man in the dark navy suit on the right has two lower legs in navy trousers "
            "with two black leather dress shoes resting flat on the floor, toes towards the table; "
            "between them the slim wooden legs of the round table and the legs of the two green "
            "armchairs, all standing on the light oak wooden floor which ends at the concrete edge "
            "at the bottom. Consistent perspective, soft natural shadows, no blur, no transparency. "
            "Photorealistic, matching light, colour and grain."
        ),
        "weich": 12,
    },
    "kopf": {
        "kachel": (1533, 188),
        "maske": (1960, 520, 2130, 665),
        # Zurueckmontiert wird nur bis knapp ueber die Schulterlinie, mit
        # kurzer Blende: sonst zieht die weiche Kante die vom Modell neu
        # gezeichnete Stuhllehne mit hinein (doppelte Lehne).
        "montage": (1960, 520, 2130, 638),
        "weich": 8,
        "prompt": (
            "Same photograph, same camera, same framing and crop. Do not zoom out, do not change "
            "the composition, the furniture, the dashboard wall or any other person. Only inside "
            "the masked area: redraw the head and neck of the man seen from behind so that they are "
            "anatomically proportioned to his shoulders (a clearly smaller, normal-sized head on a "
            "normal neck), same short brown hair, same dark blue suit and white shirt collar, "
            "seen from behind with the head turned slightly to the right so only the cheek and "
            "ear are visible. Continue the dark green dashboard screen seamlessly behind him. "
            "Photorealistic, matching light, colour and grain."
        ),
    },
    "fuesse_mann": {
        "kachel": (1558, 1938),
        "maske": (2150, 2530, 2338, 2674),
        "prompt": (
            "Same photograph, same camera, same framing and crop. Do not zoom out, do not change "
            "the composition, the table, the chairs or any person outside the mask. Only inside the "
            "masked area: redraw the lower legs and feet of the seated man in the dark blue suit on "
            "the right, seen from the side. Two lower legs in dark navy trousers come down from the "
            "knees, and TWO black leather dress shoes are clearly and completely visible, side by "
            "side and slightly apart, heels near the green armchair, toes pointing left towards the "
            "table, both soles resting flat on the light oak wooden floor with soft natural shadows. "
            "No blur, no transparency, no cropping of the shoes. Keep the armchair, the table legs "
            "and the floor edge. Photorealistic, matching light, colour and grain."
        ),
    },
    "fuesse": {
        "kachel": (1558, 1938),
        "maske": (1982, 2540, 2152, 2668),
        "prompt": (
            "Same photograph, same camera, same framing and crop. Do not zoom out, do not change "
            "the composition, the table, the chairs or any person outside the mask. Only inside the "
            "masked area: redraw the lower legs and feet of the seated woman in the light grey blazer "
            "so they are anatomically correct: exactly two legs, knees together and slightly angled, "
            "natural calves and ankles, a pair of black low-heeled pumps resting flat on the light "
            "oak wooden floor under the round table, with soft natural shadows. Keep the existing "
            "chair legs and table legs. Photorealistic, matching light, colour and grain."
        ),
    },
}


def lade_key():
    if os.environ.get("OPENAI_API_KEY"):
        return
    p = os.path.join(S, ".openai_env")
    if os.path.exists(p):
        os.environ["OPENAI_API_KEY"] = open(p).read().strip().split("=", 1)[1]
        return
    raise SystemExit("OPENAI_API_KEY fehlt (Umgebung oder $SCRATCH/.openai_env)")


def png_bytes(im):
    b = io.BytesIO()
    im.save(b, format="PNG")
    b.seek(0)
    return b


def maske_png(box, kachel):
    """RGBA-Maske in Kachelgroesse: Alpha 0 = neu zeichnen."""
    x0, y0, x1, y1 = box
    kx, ky = kachel
    m = Image.new("L", (KACHEL, KACHEL), 255)
    ImageDraw.Draw(m).rectangle([x0 - kx, y0 - ky, x1 - kx, y1 - ky], fill=0)
    rgba = Image.new("RGBA", (KACHEL, KACHEL), (0, 0, 0, 255))
    rgba.putalpha(m)
    return rgba


def bearbeite(client, modell, tile, maske, prompt):
    from openai import BadRequestError
    args = dict(model=modell, image=("tile.png", png_bytes(tile), "image/png"),
                mask=("mask.png", png_bytes(maske), "image/png"), prompt=prompt,
                size=f"{KACHEL}x{KACHEL}", quality="high", n=1)
    try:
        r = client.images.edit(input_fidelity="high", **args)
    except BadRequestError as e:
        if "input_fidelity" not in str(e):
            raise
        r = client.images.edit(**args)
    return Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")


def treue(orig, neu, maske_l):
    """Mittlere Abweichung ausserhalb der Maske (Graustufen). Gross = Neurahmung."""
    a = np.asarray(orig.convert("L"), dtype=np.float32)
    b = np.asarray(neu.resize(orig.size).convert("L"), dtype=np.float32)
    m = np.asarray(maske_l, dtype=np.float32) / 255.0
    return float(np.abs(a - b)[m > 0.5].mean())


def montiere(basis, neu, kachel, box, weich=WEICH):
    kx, ky = kachel
    m = Image.new("L", (KACHEL, KACHEL), 0)
    x0, y0, x1, y1 = box
    ImageDraw.Draw(m).rectangle([x0 - kx, y0 - ky, x1 - kx, y1 - ky], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(weich))
    alt = basis.crop((kx, ky, kx + KACHEL, ky + KACHEL))
    komp = Image.composite(neu.resize(alt.size), alt, m)
    basis.paste(komp, (kx, ky))


def vergleich(orig, neu, kachel, box, name):
    kx, ky = kachel
    x0, y0, x1, y1 = box
    rand = 120
    f = (max(kx, x0 - rand), max(ky, y0 - rand), min(kx + KACHEL, x1 + rand), min(ky + KACHEL, y1 + rand))
    a = orig.crop(f)
    b = neu.crop(f)
    w, h = a.size
    sheet = Image.new("RGB", (w * 2 + 20, h), "white")
    sheet.paste(a, (0, 0))
    sheet.paste(b, (w + 20, 0))
    sheet.save(os.path.join(ZIEL, f"{name}_vergleich.jpg"), quality=90)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--nur", choices=list(AUFGABEN))
    ap.add_argument("--modell", default=os.environ.get("IMAGE_MODEL", "gpt-image-2"))
    ap.add_argument("--uebernehmen", action="store_true",
                    help="fertige Kacheln aus dem Scratchpad in Strukturbild.jpg montieren")
    ap.add_argument("--versuche", type=int, default=1)
    a = ap.parse_args()

    orig = Image.open(QUELLE).convert("RGB")
    if a.uebernehmen:
        basis = orig.copy()
        for name, t in AUFGABEN.items():
            p = os.path.join(ZIEL, f"{name}_gewaehlt.png")
            if not os.path.exists(p):
                print(f"[{name}] keine gewaehlte Kachel ({p}), uebersprungen")
                continue
            montiere(basis, Image.open(p).convert("RGB"), t["kachel"],
                     t.get("montage", t["maske"]), t.get("weich", WEICH))
            print(f"[{name}] montiert")
        basis.save(QUELLE, quality=94, subsampling=0, optimize=True)
        print("geschrieben:", QUELLE, basis.size)
        return

    lade_key()
    from openai import OpenAI
    client = OpenAI()
    for name, t in AUFGABEN.items():
        if a.nur and name != a.nur:
            continue
        kx, ky = t["kachel"]
        tile = orig.crop((kx, ky, kx + KACHEL, ky + KACHEL))
        maske = maske_png(t["maske"], t["kachel"])
        tile.save(os.path.join(ZIEL, f"{name}_tile.png"))
        maske.save(os.path.join(ZIEL, f"{name}_maske.png"))
        for v in range(1, a.versuche + 1):
            print(f"[{name}] Versuch {v} mit {a.modell} ...", flush=True)
            neu = bearbeite(client, a.modell, tile, maske, t["prompt"])
            abw = treue(tile, neu, maske.getchannel("A"))
            out = os.path.join(ZIEL, f"{name}_v{v}.png")
            neu.save(out)
            print(f"[{name}] Versuch {v}: {neu.size}, Abweichung ausserhalb der Maske {abw:.1f} -> {out}")
            probe = orig.copy()
            montiere(probe, neu, t["kachel"], t["maske"])
            vergleich(orig, probe, t["kachel"], t["maske"], f"{name}_v{v}")


if __name__ == "__main__":
    sys.exit(main())
