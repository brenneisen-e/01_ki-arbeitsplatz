#!/usr/bin/env python3
"""
Gesichter einzeln und gross nachziehen.

Letzter Schritt der Bildherstellung:
  1. neues_strukturbild.py   erzeugt das Masterbild (1536x1024)
  2. magnific.py             skaliert auf 6144x4096
  3. schilder.py --mischen   rueckt verschriebene Raumschilder zurecht
  4. gesichter_scharf.py     zieht Personengruppen nach (Haende, Haltung, Kleidung)
  5. gesichter_gross.py      zieht jedes Gesicht einzeln nach (dieses Skript)

Warum es Schritt 5 braucht: in der 1024er Kachel von Schritt 4 ist ein Kopf
rund 70 px gross. So klein zeichnet gpt-image kein Gesicht, es glaettet — die
Abnahme hat die Koepfe durchweg als "unmenschlich" beanstandet, wachsartige
Flaechen ohne Augenlid, ohne Iris, mit gemalter statt gewachsener Haarkante.
Holt man denselben Kopf vierfach heran, entstehen Poren, Lidfalte, Iris, Ohr
und einzelne Haarstraehnen. Dasselbe gilt fuer gewollte Aenderungen an einer
Person: bei 70 px setzt das Modell sie nicht um, gross schon.

Der Preis der Vergroesserung ist, dass das Modell den Kopf gern naeher
heranrueckt — gemessen bis zu 13 Prozent. Die Rueckgabe wird deshalb per
ORB/RANSAC auf das Original entzerrt, und genau das macht den Zoom
unschaedlich: die Transformation rechnet ihn zurueck. Die Schranke darunter
faengt nur noch den Fall ab, dass das Modell die Person umkomponiert hat und
die Schaetzung dadurch unbrauchbar wird. Montiert wird ausschliesslich der Kopf
mit weicher ovaler Kante, damit Schultern, Kleidung und Hintergrund unberuehrt
bleiben.

Aufruf:
  export OPENAI_API_KEY=...
  python3 produktion/strukturbild/gesichter_gross.py --overlay    # Boxen pruefen
  python3 produktion/strukturbild/gesichter_gross.py
  python3 produktion/strukturbild/gesichter_gross.py --nur og3_links_1
"""
import argparse
import base64
import io
import os
import time

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from personen_retusche import lade_key, ZIEL

NEU = os.path.join(ZIEL, "neu")
QUELLE = os.environ.get("QUELLE", os.path.join(NEU, "v4_mag_final.jpg"))
KACHELN = os.environ.get("KACHELN", os.path.join(NEU, "koepfe"))
FERTIG = os.path.join(NEU, "v4_mag_fertig.jpg")

KANTE = 1024     # Arbeitsgroesse beim Bildmodell
KONTEXT = 2.6    # Fenster = Kopfhoehe mal diesem Faktor, quadratisch
RAND = 14        # Polster um den Kopf beim Montieren
WEICH = 18       # weiche Kante der Montagemaske
MODELL = os.environ.get("IMAGE_MODEL", "gpt-image-1.5")

PROMPT = (
  "Redraw the face of this person as a real photograph of a real human being. Same person, "
  "same age, same hair colour and cut, same clothing, same head position, same angle, same "
  "lighting and background — but with real human skin: visible pores and fine texture, a soft "
  "natural hairline with individual strands, clear eyes with a real iris and eyelid, a natural "
  "mouth and jawline, a believable ear. Remove the waxy, airbrushed, plastic look entirely. "
  "Do not change the framing, do not zoom, do not move the head, do not alter the background, "
  "the clothing or anybody else in the picture. "
  "Photorealistic, shot on a full-frame camera in daylight. No text, no watermark."
)

# name: ((x0, y0, x1, y1) des Kopfes, wer das ist)
KOEPFE = {
    "og3_links_1": ((1046, 528, 1118, 616), "grauhaariger Mann im dunklen Anzug, Profil nach rechts, ganz links am Tisch"),
    "og3_links_2": ((1212, 534, 1284, 618), "Mann mit dunklem, grau meliertem Haar, Anzug und Krawatte, Profil nach rechts"),
    "og3_links_3": ((1584, 537, 1654, 609), "Mann im dunklen Anzug von hinten, kurzes dunkles Haar, Blick auf die Monitorwand"),
    "og3_links_4": ((1984, 546, 2076, 628), "Mann mit blonden Locken von hinten, dunkelblaues Sakko"),
    "og3_links_5": ((2217, 561, 2282, 626), "grauhaariger Mann mit Brille im dunklen Anzug, Profil nach links"),
    "og3_links_6": ((2334, 562, 2411, 632), "Frau mit dunkelbraunem Haar, hellgraues Jackett, Profil nach links"),
    "og3_rechts_1": ((3873, 455, 3944, 517), "Frau mit langem dunkelbraunem Haar und Brille, grauer Pullover, an der Pinnwand"),
    "og3_rechts_2": ((4156, 422, 4224, 501), "Mann mit dunklem Lockenhaar, dunkelblauer Pullover, an der Pinnwand"),
    "og3_rechts_3": ((4676, 561, 4741, 641), "Mann mit kurzem braunem Haar im hellblauen Hemd am Laptop"),
    "og3_rechts_4": ((4945, 546, 5031, 617), "Frau mit langem blondem Wellenhaar, dunkelblaues Oberteil"),
    "og2_links_1": ((1172, 1445, 1232, 1516), "Mann von hinten, dunkles Haar, hellgraues Hemd, ganz links am Monitorpult"),
    "og2_links_2": ((1405, 1447, 1467, 1518), "Mann von hinten, dunkelbraunes Haar, dunkler Anzug"),
    "og2_links_3": ((1572, 1436, 1654, 1518), "Frau von hinten, welliges hellbraunes Haar, hellblaue Bluse"),
    "og2_links_4": ((1955, 1436, 2012, 1505), "Mann von hinten, kurzes dunkles Haar, hellblaues Hemd"),
    "og2_links_5": ((2351, 1438, 2439, 1528), "Person von hinten, dunkles Lockenhaar, blaugraues Oberteil, Einzelplatz rechts"),
    # y0 dieser beiden vom Raumausschnitt abgeschnitten, auf die echte Haaroberkante zurueckgesetzt
    "og2_rechts_1": ((3616, 1275, 3688, 1371), "stehender Mann mit Bart, dunkelgruenes Poloshirt, Profil nach rechts"),
    "og2_rechts_2": ((3814, 1280, 3877, 1379), "stehender Mann mit Lockenhaar, hellblau gemustertes Hemd, Profil nach links"),
    "og2_rechts_3": ((4536, 1451, 4606, 1520), "Mann mit braunem Haar im dunkelblauen Anzug am Schreibtisch"),
    "og2_rechts_4": ((5160, 1458, 5231, 1514), "Frau mit langem hellbraunem Haar, dunkles Jackett, Profil nach links"),
    "og1_links_1": ((1076, 2260, 1149, 2331), "Mann im dunkelblauen Anzug, Dreitagebart, Profil nach rechts, linker Tisch"),
    "og1_links_2": ((1331, 2256, 1386, 2328), "Mann im grauen Sakko mit Kinnbart, Blick nach links, linker Tisch"),
    "og1_links_3": ((2056, 2271, 2130, 2345), "Frau mit langem dunkelbraunem Haar, hellgrauer Blazer, Profil nach rechts"),
    "og1_links_4": ((2325, 2251, 2398, 2336), "Mann im blauen Anzug, Bartschatten, Profil nach links, rechter Tisch"),
    "og1_rechts_1": ((3759, 2179, 3826, 2246), "Mann im dunkelblauen Anzug mit Brille, halb von hinten"),
    "og1_rechts_2": ((4082, 2185, 4151, 2256), "Mann im blaugrauen Pullover, von hinten, Kopf nach links gedreht"),
    "og1_rechts_3": ((4346, 2198, 4417, 2266), "Frau mit langem dunkelbraunem Wellenhaar, von hinten, Profil nach links"),
    "og1_rechts_4": ((4735, 2191, 4804, 2265), "Mann im blauen Jeanshemd mit Brille, von hinten, Profil nach links"),
    # Von der Raumansicht oben abgeschnitten, im Gesamtbild nachgemessen
    "og1_rechts_5": ((5105, 2055, 5190, 2140), "Mann im rostfarbenen Pullover am Stehtisch, Profil nach links"),
    "eg_links_1": ((876, 2991, 959, 3060), "Frau mit lockigem braunem Haar im Kamelmantel, von hinten am Tresen"),
    "eg_links_2": ((1190, 2969, 1260, 3044), "Mann im gruengrauen Sakko, von hinten am Tresen, Profil nach rechts"),
    "eg_links_3": ((1409, 2957, 1465, 3028), "Berater im dunkelblauen Anzug mit heller Krawatte, frontal hinter dem Tresen"),
    "eg_links_4": ((1570, 2975, 1632, 3041), "Mann im dunkelblauen Sakko mit Brille, von hinten am Tresen rechts"),
    "eg_links_5": ((431, 3215, 513, 3302), "Mann im dunkelgruenen Pullover mit Brille und Bart, auf dem Vorplatz"),
    "eg_links_6": ((145, 3289, 232, 3373), "Frau mit braunem Haar, taupefarbener Mantel, am linken Bildrand"),
    "eg_rechts_1": ((4081, 3051, 4159, 3133), "Mann im dunkelblauen Anzug im gruenen Sessel, Profil nach rechts"),
    "eg_rechts_2": ((4707, 3058, 4787, 3130), "Frau mit langem braunem Wellenhaar im grauen Strickpullover"),
    "eg_rechts_3": ((4874, 3035, 4960, 3128), "Mann mit Vollbart im dunkelblauen Anzug, sitzend, Profil nach links"),
    "eg_rechts_4": ((5264, 3209, 5340, 3287), "Frau im hellen Kamelmantel, auf dem Vorplatz, Profil nach rechts"),
    "eg_rechts_5": ((5973, 3143, 6063, 3230), "Mann im dunkelblauen Sakko, rechter Bildrand auf dem Vorplatz"),
}

# Gewollte Aenderungen an einer Person. Hier greifen sie, anders als in
# gesichter_scharf.py, weil der Kopf gross genug ist: dort misst er rund 70 px
# und das Modell gibt dieselbe Person zurueck, hier vier- bis fuenffach mehr.
BESETZUNG = {
    "eg_links_1": " Her hair keeps its colour and its curl, but it is a normal amount of hair: "
                  "it follows the shape of her skull instead of standing off as a wide halo "
                  "broader than her face is tall, and it ends at her shoulders. Her face is in "
                  "natural proportion to her head — a full cheek and a normal jaw, not narrow "
                  "and pointed. The leaves of the plant behind and above her stay exactly "
                  "where they are; nothing of the foliage is painted over.",
    "og2_links_5": " Pay particular attention to the hair: it keeps its length, colour and "
                   "curl, but it must read as real grown hair — separate strands and curls "
                   "with light passing between them, a natural nape and hairline — not one "
                   "moulded lump of curls sitting on the head like a wig.",
    "og3_links_4": " One thing about this person is different from the photograph: his hair. "
                   "Instead of the large voluminous mane of curls he has an ordinary "
                   "short-to-medium men's haircut — tidy, close to the head at the back and "
                   "sides, with a natural nape and a real hairline, only lightly wavy. Same "
                   "hair colour, same head shape and position, same suit, same posture. It "
                   "must look like hair that grew there, never like a wig.",
    "og3_links_2": " One thing about this person is different from the photograph: he is a "
                   "Black man — dark brown skin, short black hair, clean-shaven, warm natural "
                   "skin tones in this daylight, with the same real skin texture and detail "
                   "asked for above. He keeps everything else: same age, same head position "
                   "and angle, same dark suit, same tie, same collar, same lighting.",
}


def fenster_fuer(box, breite=6144, hoehe=4096):
    """Quadratisches Fenster um den Kopf, mit Kontext ringsum."""
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    kante = max(box[2] - box[0], box[3] - box[1]) * KONTEXT
    kante = min(kante, breite, hoehe)
    x0 = int(max(0, min(cx - kante / 2, breite - kante)))
    y0 = int(max(0, min(cy - kante / 2, hoehe - kante)))
    k = int(kante)
    return (x0, y0, x0 + k, y0 + k)


def edit(client, bild, prompt, versuche=4):
    for v in range(versuche):
        try:
            b = io.BytesIO()
            bild.save(b, format="PNG"); b.name = "b.png"; b.seek(0)
            kw = {"input_fidelity": "high"} if MODELL.startswith("gpt-image-1") else {}
            r = client.images.edit(model=MODELL, image=b, prompt=prompt,
                                   size=f"{KANTE}x{KANTE}", quality="high", **kw)
            return Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
        except Exception as e:
            print("  retry", v + 1, str(e)[:150], flush=True)
            time.sleep(10 * (v + 1))
    raise SystemExit("Bildmodell antwortet nicht")


def ausrichten(original, tile):
    """Rueckgabe per ORB/RANSAC auf das Original entzerren."""
    import cv2
    a = np.asarray(original.convert("L"))
    b = np.asarray(tile.convert("L"))
    orb = cv2.ORB_create(6000)
    ka, da = orb.detectAndCompute(a, None)
    kb, db = orb.detectAndCompute(b, None)
    if da is None or db is None:
        return tile, 0.0
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    ms = sorted(bf.match(da, db), key=lambda x: x.distance)[:800]
    if len(ms) < 25:
        return tile, 0.0
    pa = np.float32([ka[x.queryIdx].pt for x in ms])
    pb = np.float32([kb[x.trainIdx].pt for x in ms])
    M, _ = cv2.estimateAffinePartial2D(pb, pa, method=cv2.RANSAC, ransacReprojThreshold=3.0)
    if M is None:
        return tile, 0.0
    sc = float(np.hypot(M[0, 0], M[0, 1]))
    arr = np.asarray(tile.convert("RGB"))
    out = cv2.warpAffine(arr, M, (arr.shape[1], arr.shape[0]), flags=cv2.INTER_LANCZOS4,
                         borderMode=cv2.BORDER_REFLECT)
    return Image.fromarray(out), sc


def maske_fuer(box, fenster):
    """Nur der Kopf, mit weicher Kante — Schultern und Umgebung bleiben."""
    k = fenster[2] - fenster[0]
    m = Image.new("L", (k, k), 0)
    ImageDraw.Draw(m).ellipse((box[0] - RAND - fenster[0], box[1] - RAND - fenster[1],
                               box[2] + RAND - fenster[0], box[3] + RAND - fenster[1]), fill=255)
    return m.filter(ImageFilter.GaussianBlur(WEICH))


def overlay():
    im = Image.open(QUELLE).convert("RGB")
    d = ImageDraw.Draw(im)
    for name, (box, _) in KOEPFE.items():
        d.rectangle(fenster_fuer(box), outline=(0, 160, 255), width=3)
        d.rectangle(box, outline=(255, 0, 0), width=4)
        d.text((box[0], box[1] - 30), name, fill=(255, 220, 0))
    p = os.path.join(ZIEL, "koepfe_overlay.jpg")
    im.resize((3072, 2048)).save(p, quality=88)
    print("overlay:", p, f"— {len(KOEPFE)} Koepfe")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--overlay", action="store_true")
    ap.add_argument("--nur", nargs="*")
    ap.add_argument("--neu", action="store_true")
    ap.add_argument("--parallel", type=int, default=5)
    a = ap.parse_args()
    if not KOEPFE:
        raise SystemExit("KOEPFE ist leer — erst die Kopfboxen eintragen")
    if a.overlay:
        return overlay()
    os.makedirs(KACHELN, exist_ok=True)
    lade_key()
    from openai import OpenAI
    client = OpenAI()
    quelle = Image.open(QUELLE).convert("RGB")
    namen = [n for n in KOEPFE if not a.nur or n in a.nur]

    def bauen(name):
        p = os.path.join(KACHELN, name + ".png")
        if os.path.exists(p) and not a.neu:
            return name, "vorhanden"
        f = fenster_fuer(KOEPFE[name][0])
        gross = quelle.crop(f).resize((KANTE, KANTE), Image.LANCZOS)
        print(name, f"→ Bildmodell (Fenster {f[2] - f[0]} px, {KANTE / (f[2] - f[0]):.1f}-fach)",
              flush=True)
        edit(client, gross, PROMPT + BESETZUNG.get(name, "")).save(p)
        return name, "neu"

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max(1, a.parallel)) as ex:
        for name, status in ex.map(bauen, namen):
            print(name, "kachel", status, flush=True)

    im = quelle.copy()
    gesetzt = 0
    for name, (box, _) in KOEPFE.items():
        p = os.path.join(KACHELN, name + ".png")
        if not os.path.exists(p):
            continue
        f = fenster_fuer(box)
        k = f[2] - f[0]
        klein = Image.open(p).convert("RGB").resize((k, k), Image.LANCZOS)
        tile, sc = ausrichten(quelle.crop(f), klein)
        if not 0.80 <= sc <= 1.25:
            print(name, f"WARNUNG: Skalierung {sc:.3f} — uebersprungen")
            continue
        im.paste(Image.composite(tile, im.crop(f), maske_fuer(box, f)), f[:2])
        gesetzt += 1
        print(name, f"montiert (skalierung={sc:.3f})", flush=True)
    im.save(FERTIG, quality=95, subsampling=0)
    print(f"fertig: {FERTIG} — {gesetzt} von {len(KOEPFE)} Koepfen")


if __name__ == "__main__":
    main()
