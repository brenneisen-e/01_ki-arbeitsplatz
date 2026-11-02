#!/usr/bin/env python3
"""
Gesichter und Haende im hochskalierten Strukturbild reparieren.

Ablauf der Bildherstellung, letzter Schritt:
  1. neues_strukturbild.py   erzeugt das Masterbild (1536x1024)
  2. magnific.py             skaliert auf 6144x4096
  3. schilder.py             rueckt verschriebene Raumschilder zurecht
  4. gesichter_scharf.py     zieht die Gesichter nach (dieses Skript)

Magnific bringt beim Vergroessern schon sehr viel: Haarstraehnen, Hautstruktur,
Stofffaserung. Was auch ein kreativer Upscaler nicht leisten kann, ist Anatomie
— im 1536er Original ist ein Kopf rund 20 px gross, Finger sind ein bis zwei
Pixel. Magnific schaerft dort, was da ist, und macht aus einem Klumpen einen
scharfen Klumpen. Diesen Schritt braucht es deshalb weiterhin, aber er hat auf
der Magnific-Fassung deutlich weniger zu tun als auf der ESRGAN-Fassung.

Entscheidend ist die Betriebsart: **ohne Maske**. Mit Maske liest gpt-image den
Maskenbereich als "fuelle diese Flaeche" und zoomt die Personen formatfuellend
heran — aus drei kleinen Sitzenden werden drei grosse, auch wenn der Prompt die
Groesse ausdruecklich festschreibt. Ohne Maske, dafuer mit input_fidelity=high,
gibt das Bild selbst die Skala vor: Groesse, Sitzposition, Kleidung, Moebel und
Regale bleiben unveraendert, nur Gesichter, Haare und Haende werden sauber
gezeichnet. Deshalb laeuft dieser Schritt ueber gpt-image-1.5 — gpt-image-2
kennt input_fidelity nicht und erfindet die Szene dann neu.

Montiert wird aus der Kachel nur die Personengruppe (siehe alpha_fuer);
alles uebrige bleibt so, wie der Upscaler es gezeichnet hat.

Aufruf:
  export OPENAI_API_KEY=...
  python3 produktion/strukturbild/gesichter_scharf.py --overlay   # Kacheln pruefen
  python3 produktion/strukturbild/gesichter_scharf.py             # alle Kacheln
  python3 produktion/strukturbild/gesichter_scharf.py --nur og3_l_a
  QUELLE=... KACHELN=... python3 produktion/strukturbild/gesichter_scharf.py
"""
import argparse
import base64
import io
import os
import time

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from personen_retusche import lade_key, ZIEL
from personen_scharf import GRUPPEN
from schilder import SCHILDER

# Grundlage ist die Magnific-Fassung mit den zurechtgerueckten Raumschildern
# (magnific.py, dann schilder.py). Real-ESRGAN kommt hier nicht mehr zum Zug.
QUELLE = os.environ.get("QUELLE", os.path.join(ZIEL, "neu", "v4_mag.png"))
KACHELN = os.environ.get("KACHELN", os.path.join(ZIEL, "neu", "gesichter_mag"))

KACHEL = 1024
RAND = 50        # Polster um die Personengruppe herum
WEICH = 34       # weiche Kante der Montagemaske
WEICH_AUS = 22   # weiche Kante der ausgesparten Flaechen
MODELL = os.environ.get("IMAGE_MODEL", "gpt-image-1.5")

PROMPT = (
  "Repair the faces and hands in this crop of a wide architectural photograph. The people "
  "are small in the frame and must stay exactly that size, in exactly the same places, "
  "poses, clothing and colours — do not zoom in, do not enlarge them, do not move them, and "
  "do not change the furniture, shelves, screens, floor or walls. "
  "Only faces, hair and hands are redrawn properly: clear eyes, nose and mouth at this small "
  "scale, a soft natural hairline instead of a painted edge, believable skin and shading, "
  "five clearly separated fingers on every visible hand — no mitten-like lumps, no "
  "fused fingers — and proper shoes on visible feet. "
  "Everything else stays EXACTLY as it is, item for item: every chair and armchair keeps its "
  "seat, back and frame in the same place; every person keeps the same garments in the same "
  "colours down to the detail — a tie stays a tie, jeans stay jeans, a skirt stays a skirt, "
  "a handbag stays on the shoulder; nobody changes gender, age, hairstyle or shoe type. "
  "Nothing is added to anyone's hands and nothing is added to any table, wall or door. "
  "Keep the fine texture the photograph already has: fabric weave, wood grain, wall render, "
  "skin pores. Do not smooth or airbrush anything. "
  "Photorealistic architectural photography, same daylight, same colours, same grain. "
  "No close-up, no portrait framing, nobody added or removed, no text."
)


# Zusaetze je Kachel: was die Qualitaetspruefung dort beanstandet hat. Wird an
# den Prompt angehaengt, damit gezielt nachgebessert wird, ohne die anderen
# Kacheln anzufassen. Die Liste stammt aus der Abnahme der Magnific-Fassung;
# fast alle Funde sind Sitzfehler, die schon im Masterbild stecken: die Person
# sitzt neben statt auf ihrem Stuhl, oder ihr Unterkoerper fehlt ganz.
SITZEN = (" Very important in this crop: every seated person sits properly IN their chair — "
          "the seat is under them and the backrest directly behind their back, never empty "
          "beside or behind an unsupported body. Every seated person has a complete body: "
          "torso, lap, legs and shoes. Nobody ends at the chest or at the seat edge.")

ZUSATZ = {
    "og3_l_a": SITZEN + " The grey-haired man on the left must have thighs, legs and shoes "
                        "under the table, not end as a bust behind an empty chair.",
    "og3_l_b": SITZEN + " The man at the left edge needs a shoulder and a torso under his "
                        "head, not a head floating behind the next person.",
    "og3_l_c": SITZEN + " The woman in the light grey cardigan needs legs and feet below her "
                        "waist.",
    "og3_r_a": " Very important in this crop: the pointing hand of the standing woman must be "
               "a normal human hand with five proper fingers and a thumb, not two long spread "
               "prongs. She keeps her glasses and the dark pen in that hand. The whiteboard is "
               "untouched: its frame stays, every card and sticky note keeps its exact size and "
               "position, and no grey smudge or shadow appears on the white surface.",
    "og3_r_b": SITZEN + " The pinboard on the left is untouched: both orange sticky notes "
                        "stay, every card keeps its size and place.",
    "og2_l_a": SITZEN + " All three keep their backs to the camera and keep facing their "
                        "screens — nobody turns their head into profile. Their hands stay on "
                        "keyboard and desk and hold nothing at all: no sheet of paper, no "
                        "document, no device appears that was not already there.",
    "og2_l_b": SITZEN,
    "og2_r_a": " Very important in this crop: the gesturing hands of both standing men must be "
               "normal human hands with separated fingers and a visible thumb, not flat "
               "paddles. Each man has exactly TWO hands and every hand hangs on a visible arm "
               "— no extra hand floats in front of the wall screen. The wall screen keeps its "
               "existing headings and text exactly. No tie is added to anyone; the right man "
               "keeps his collar as it is. The wooden door stays a plain closed door.",
    "og2_r_b": SITZEN + " The person in the black blazer wears proper trousers or a skirt — no "
                        "bare thigh, knee or calf between jacket and shoe — and both legs with "
                        "both shoes are visible. The large green plant behind the seated man's "
                        "head stays exactly where it is.",
    "og1_l_a": SITZEN + " Every garment keeps its exact colour and pattern: the plain dark "
                        "blue tie stays plain dark blue, the grey-blue jacket stays grey-blue, "
                        "the mid-grey jacket stays mid-grey. Their hands stay flat on the "
                        "table and hold nothing — no pen appears. The open notebook stays an "
                        "open notebook with the small dark object lying on it.",
    "eg_l_a": " Very important in this crop: the man in the green pullover keeps his head "
              "turned exactly as it is and keeps his hair colour and length. The dark object "
              "on the counter next to the woman's hand stays what it is.",
    "eg_r_d": " Very important in this crop: the man keeps the dark bag strap running "
              "diagonally across his chest, and nothing new appears at his collar. Both "
              "walkers get hands with separated fingers.",
    "og1_l_b": SITZEN + " The bookshelf behind them is untouched: same shelves, same books, "
                        "same spines in the same order, same wood grain, nothing added to any "
                        "compartment and no milky haze over any part of it. The cup and the "
                        "open booklet on the table stay exactly as they are.",
    "og1_r_a": SITZEN + " Nobody gains glasses who is not already wearing them, and existing "
                        "glasses keep their exact frame.",
    "og1_r_b": SITZEN + " Every visible shoe belongs to a visible leg.",
    "og1_r_c": SITZEN + " Every visible shoe belongs to a visible leg. The standing man's "
                        "shirt keeps its plain even fabric — no blotchy white or blue patches "
                        "on his back or forearm.",
    "eg_l_b": " Very important in this crop: the adviser behind the counter keeps his collar "
              "as it is and his folded hands show separate fingers. The counter carries exactly "
              "the objects it already carries — no second monitor appears on it. Nobody's body "
              "gets wider, taller or shifts sideways; every silhouette stays put. The papers "
              "stay where they are, the wooden wall keeps its door joint and handle.",
    "eg_l_c": " Very important in this crop: the adviser behind the counter keeps his light "
              "tie. The counter carries exactly the objects it already carries — no second "
              "monitor appears on it. Nobody's body gets wider or shifts sideways; every "
              "silhouette stays put. The papers stay where they are.",
    "eg_r_a": SITZEN + " Under the table there are exactly the legs that are there now, each "
                       "matching its owner: the woman in the grey knitted pullover keeps her "
                       "blue jeans and her narrow ankle boots, and no large men's lace-up shoes "
                       "appear. The seated man stays exactly where and how big he is, his back "
                       "against the backrest, not on the front edge of the seat.",
    "eg_r_b": SITZEN + " The woman in the grey knitted pullover keeps her blue jeans, her "
                       "narrow ankle boots and her hairstyle; no large men's lace-up shoes "
                       "appear under the table. The green armchair keeps its exact shape and "
                       "position and never covers her legs. No tie is added to the man — he "
                       "keeps his open light blue shirt. The walking woman keeps her handbag.",
    "eg_r_c": SITZEN + " No tie is added to the seated man — he keeps his open light shirt — "
                       "and his torso stays exactly its current size and position. Only ONE "
                       "armchair stands behind him, not two overlapping ones.",
    "lift_a": " Very important in this crop: the man in the lift keeps his dark patterned tie "
              "and his apparent age — he is the same person, only drawn properly. The concrete "
              "ledge left of the glass shaft stays empty; no person is added there.",
}


# Gewollte Aenderungen an der Besetzung — im Unterschied zu ZUSATZ keine
# Fehlerkorrektur, sondern eine inhaltliche Entscheidung.
#
# Sie brauchen einen eigenen Prompt-Aufbau: als Nachsatz an den Reparaturprompt
# gehaengt werden sie ueberlesen, weil das vorangestellte "behalte jede Person
# Stueck fuer Stueck" gewinnt. Als Hauptauftrag an den Anfang gestellt werden
# sie ausgefuehrt.
#
# Das reicht allerdings nur fuer Kleidung. Wer eine Person selbst aendern will,
# kommt hier nicht weiter: in der 1024er Kachel ist ein Kopf rund 70 px gross,
# und so klein setzt das Modell eine Aenderung der Person nicht um — es gibt
# stattdessen dieselbe Person etwas unschaerfer zurueck. Dafuer gibt es
# person_aendern.py, das die Person gross heranholt.
BESETZUNG_RAHMEN = (
  "In this crop of a wide architectural photograph, change exactly ONE person and nothing "
  "else.{was} "
  "Everyone and everything else in the crop stays exactly as it is: same people, same faces, "
  "same clothing in the same colours, same poses, same furniture, same screens, same walls, "
  "same floor, same daylight and grain. Do not zoom in, do not reframe, do not enlarge or "
  "move anybody. While you are at it, draw all faces and hands properly at this small scale: "
  "clear eyes, nose and mouth, a soft natural hairline, five separated fingers on every "
  "visible hand. Photorealistic architectural photography. No close-up, no portrait framing, "
  "nobody added or removed, no text."
)

BESETZUNG = {
    "og1_r_a": " The man seated on the RIGHT, currently in a light checked shirt, instead wears "
               "a soft fine-knit crew-neck pullover in a muted colour. Same man, same face, "
               "same posture, same chair, same place. The man on the left keeps his dark suit.",
    "og1_r_c": " The man standing at the height-adjustable desk, currently in a light blue "
               "shirt, instead wears a soft fine-knit crew-neck pullover in a muted colour. "
               "Same man, same face, same posture, same place, same trousers and shoes."
}


# Zweiter Anlauf je Kachel. gpt-image wuerfelt: derselbe Prompt liefert einmal
# eine saubere Hand und einmal eine erfundene Krawatte. Fuer die Kacheln, die
# die Abnahme beanstandet hat, liegt deshalb ein zweiter Wurf vor, und die
# Abnahme hat je Stelle den besseren gewaehlt. Hier stehen die Kacheln, bei
# denen der ERSTE Wurf gewonnen hat; alle uebrigen kommen aus dem aktuellen
# Ordner.
#
# Beurteilt wird dabei nur, was auch montiert wird: die Personengruppe. Was
# eine Kachel am Rand anstellt, ist gleichgueltig — bei lift_a etwa setzen
# beide Wuerfe Personen neben den Aufzugsschacht, die ausserhalb der
# Montageflaeche liegen und nie im Bild landen.
# Dabei zeigte sich, dass ein Hinweis ein Objekt auch erschaffen kann, statt es
# zu bewahren: "the man keeps the dark bag strap across his chest" hat dem Mann
# eine ganze Umhaengetasche angehaengt, "the walking woman keeps her handbag"
# der Frau eine grosse braune Tasche, die es nie gab. Im Erdgeschoss gewinnt
# deshalb ueberwiegend der erste Wurf, der ohne solche Hinweise entstanden ist.
WAHL_WURF1 = {
    "og2_r_a",   # zweiter Wurf nimmt dem Mann das Smartphone aus der Hand
    "eg_l_a",    # zweiter Wurf setzt einen dunkelblauen Block neben ihre Hand
    "eg_l_c",    # zweiter Wurf macht den Mann mit Brille hoeher und breiter
    "eg_r_a",    # zweiter Wurf tauscht ihre Jeans gegen Rock und Stiefel
    "eg_r_b",    # zweiter Wurf haengt der Gehenden eine Handtasche an
    "eg_r_d",    # zweiter Wurf erfindet dem Mann eine Umhaengetasche
}
KACHELN_WURF1 = os.path.join(os.path.dirname(KACHELN), "gesichter_wurf1")

os.makedirs(KACHELN, exist_ok=True)


def fenster_fuer(box, breite=6144, hoehe=4096):
    """1024er Fenster um eine Personengruppe, nativ (keine Skalierung)."""
    cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
    x0 = max(0, min(cx - KACHEL // 2, breite - KACHEL))
    y0 = max(0, min(cy - KACHEL // 2, hoehe - KACHEL))
    return (x0, y0, x0 + KACHEL, y0 + KACHEL)


def edit(client, bild, prompt, versuche=4):
    for v in range(versuche):
        try:
            b = io.BytesIO()
            bild.save(b, format="PNG"); b.name = "b.png"; b.seek(0)
            kw = {"input_fidelity": "high"} if MODELL.startswith("gpt-image-1") else {}
            r = client.images.edit(model=MODELL, image=b, prompt=prompt,
                                   size="1024x1024", quality="high", **kw)
            return Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
        except Exception as e:
            print("  retry", v + 1, str(e)[:150], flush=True)
            time.sleep(10 * (v + 1))
    raise SystemExit("Bildmodell antwortet nicht")


def ausrichten(original, tile):
    """Kachel per ORB/RANSAC auf das Original entzerren (ganzes Bild als Referenz)."""
    import cv2
    a = np.asarray(original.convert("L"))
    b = np.asarray(tile.convert("L"))
    orb = cv2.ORB_create(8000)
    ka, da = orb.detectAndCompute(a, None)
    kb, db = orb.detectAndCompute(b, None)
    if da is None or db is None:
        return tile, 0.0
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    ms = sorted(bf.match(da, db), key=lambda x: x.distance)[:1000]
    if len(ms) < 30:
        return tile, 0.0
    pa = np.float32([ka[x.queryIdx].pt for x in ms])
    pb = np.float32([kb[x.trainIdx].pt for x in ms])
    M, inl = cv2.estimateAffinePartial2D(pb, pa, method=cv2.RANSAC, ransacReprojThreshold=3.0)
    if M is None:
        return tile, 0.0
    sc = float(np.hypot(M[0, 0], M[0, 1]))
    if not 0.98 <= sc <= 1.03:
        return tile, sc
    arr = np.asarray(tile.convert("RGB"))
    out = cv2.warpAffine(arr, M, (arr.shape[1], arr.shape[0]), flags=cv2.INTER_LANCZOS4,
                         borderMode=cv2.BORDER_REFLECT)
    return Image.fromarray(out), sc


# Flaechen, die von der Montage ausgenommen bleiben. Eine Kachel ist 1024 px
# gross und reicht damit weit ueber die Person hinaus bis an Rueckwand und
# Bruestung; gpt-image zeichnet sie komplett neu und richtet dort Schaden an, wo
# es nichts zu verbessern gab: Raumschilder werden weggewischt oder verblassen
# ("CORPORATE SERVICES / HR" wurde zu einem kaum lesbaren "E SER…"), auf leeren
# Flaechen erscheinen erfundene Personen. Beides betrifft Stellen ohne
# Gesichter und Haende, also bleiben sie einfach stehen.
AUSSPAREN = [box for box, _, _ in SCHILDER.values()] + [
    # Betonsims links neben dem Aufzugsschacht: dort stand niemand, die
    # Aufzugskachel hat einen lesenden Mann auf die Bruestung gestellt.
    (2360, 1230, 2880, 1900),
]


def alpha_fuer(fenster, name):
    """Montagemaske einer Kachel: nur die Personengruppe, nicht die ganze Kachel.

    Flaechig montiert richtet eine Kachel mehr Schaden an als Nutzen. Die
    Qualitaetspruefung hat es an der ESRGAN- wie an der Magnific-Fassung
    gemessen: die Kantenenergie faellt um 17 bis 27 Prozent, Wandputz,
    Stoffstruktur und Holzmaserung buegeln sich glatt — genau der
    Fotorealismus, den Magnific vorher erzeugt hat. Dazu erfindet gpt-image auf
    den leeren Flaechen, die es mitzeichnen muss, Dinge, die dort nichts zu
    suchen haben: ein Blatt Papier in einer Hand, ein Buecherstapel vor einer
    Tuer, eine lesende Person auf einer Bruestung.

    Gebraucht wird die Kachel aber nur fuer Gesichter und Haende. Also wird nur
    die Personengruppe montiert und alles uebrige bleibt, wie Magnific es
    gezeichnet hat. Die Naht liegt dabei im Umfeld der Person, nicht auf ihr:
    die Boxen in GRUPPEN fassen die Gruppe mit Abstand, RAND legt noch etwas
    drauf.
    """
    x0, y0, x1, y1 = GRUPPEN[name][0]
    m = Image.new("L", (KACHEL, KACHEL), 0)
    ImageDraw.Draw(m).rectangle((x0 - RAND - fenster[0], y0 - RAND - fenster[1],
                                 x1 + RAND - fenster[0], y1 + RAND - fenster[1]), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(WEICH))

    loch = Image.new("L", (KACHEL, KACHEL), 0)
    d = ImageDraw.Draw(loch)
    for a0, b0, a1, b1 in AUSSPAREN:
        if a1 < fenster[0] or a0 > fenster[2] or b1 < fenster[1] or b0 > fenster[3]:
            continue
        d.rectangle((a0 - fenster[0], b0 - fenster[1],
                     a1 - fenster[0], b1 - fenster[1]), fill=255)
    loch = loch.filter(ImageFilter.GaussianBlur(WEICH_AUS))
    return Image.fromarray((np.asarray(m, np.float32)
                            * (1 - np.asarray(loch, np.float32) / 255)).astype(np.uint8))


def overlay():
    im = Image.open(QUELLE).convert("RGB")
    d = ImageDraw.Draw(im)
    for name, (box, _) in GRUPPEN.items():
        f = fenster_fuer(box)
        d.rectangle(f, outline=(0, 160, 255), width=4)
        d.rectangle(box, outline=(255, 0, 0), width=5)
        d.text((f[0] + 10, f[1] + 10), name, fill=(0, 200, 255))
    p = os.path.join(ZIEL, "gesichter_overlay.jpg")
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
        p = os.path.join(KACHELN, name + ".png")
        if os.path.exists(p) and not a.neu:
            return name, "vorhanden"
        f = fenster_fuer(GRUPPEN[name][0])
        print(name, "→ Bildmodell", flush=True)
        if name in BESETZUNG:
            prompt = BESETZUNG_RAHMEN.format(was=BESETZUNG[name])
        else:
            prompt = PROMPT + ZUSATZ.get(name, "")
        edit(client, quelle.crop(f), prompt).save(p)
        return name, "neu"

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max(1, a.parallel)) as ex:
        for name, status in ex.map(bauen, namen):
            print(name, "kachel", status, flush=True)

    im = quelle.copy()
    for name in GRUPPEN:
        ordner = KACHELN_WURF1 if name in WAHL_WURF1 else KACHELN
        p = os.path.join(ordner, name + ".png")
        if not os.path.exists(p):
            continue
        f = fenster_fuer(GRUPPEN[name][0])
        tile, sc = ausrichten(quelle.crop(f), Image.open(p).convert("RGB"))
        if not 0.98 <= sc <= 1.03:
            print(name, f"WARNUNG: Skalierung {sc:.3f} — Kachel uebersprungen")
            continue
        im.paste(Image.composite(tile, im.crop(f), alpha_fuer(f, name)), f[:2])
        print(name, f"montiert (skalierung={sc:.3f})",
              "[erster Wurf]" if name in WAHL_WURF1 else "", flush=True)
    ziel = os.path.join(ZIEL, "neu",
                        os.path.basename(QUELLE).rsplit(".", 1)[0] + "_final.jpg")
    im.save(ziel, quality=95, subsampling=0)
    print("fertig:", ziel)


if __name__ == "__main__":
    main()
