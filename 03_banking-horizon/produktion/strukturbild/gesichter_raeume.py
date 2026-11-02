#!/usr/bin/env python3
"""
Gesichter in den acht Raum-Detailbildern nachziehen.

Die Raumbilder unter public/images/rooms/ sind eine eigene Bildstrecke: je
Kapitel eine naeher herangeholte Ansicht desselben Raums, 1920x1080. Die
Einstiegsbuehne legt sie beim Hineinzoomen ueber den Kamera-Zoom des
Strukturbilds.

Sie brauchen dieselbe Behandlung wie das Strukturbild, aus demselben Grund:
ein Kopf misst hier rund 80 px, und so klein hat der Bildgenerator, der sie
erzeugt hat, keine Gesichter gezeichnet, sondern glatte Flaechen. Aufgefallen
ist es erst, als die Einstiegsbuehne von 0,55 auf 0,94 Deckkraft ging — davor
lagen die Gesichter unter dem Schleier und der Doppelbelichtung.

Mechanik und Prompt kommen aus gesichter_gross.py; hier stehen nur die
Kopfboxen je Bild. Vergroesserung rund fuenffach.

Aufruf:
  export OPENAI_API_KEY=...
  python3 produktion/strukturbild/gesichter_raeume.py --overlay   # Boxen pruefen
  python3 produktion/strukturbild/gesichter_raeume.py
  python3 produktion/strukturbild/gesichter_raeume.py --nur vorstand projekt
"""
import argparse
import os

from PIL import Image, ImageDraw

from personen_retusche import lade_key, ZIEL
from gesichter_gross import KANTE, PROMPT, ausrichten, edit, fenster_fuer, maske_fuer

HIER = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HIER, "..", ".."))
QUELLE = os.path.join(APP, "public", "images", "rooms")
ZIEL_NEU = os.path.join(ZIEL, "raeume")
KACHELN = os.path.join(ZIEL_NEU, "kacheln")

BREITE, HOEHE = 1920, 1080

# Bild → {name: ((x0, y0, x1, y1) des Kopfes, wer das ist)}
RAEUME = {
    "vorstand": {
        "v1": ((400, 590, 490, 680), "grauhaariger Mann mit Brille, dunkelblaues Sakko, Profil nach rechts, ganz links"),
        "v2": ((655, 590, 729, 676), "Mann mit dunklem Lockenhaar, navyblauer Anzug, Profil nach rechts"),
        "v3": ((848, 611, 955, 688), "Frau mit langem braunem Lockenhaar, bordeauxfarbenes Tweed-Sakko, Profil nach rechts"),
        "v4": ((1143, 613, 1198, 690), "Mann mit grauem Haar und Bart, dunkler Anzug mit Krawatte, Bildmitte"),
        "v5": ((1488, 600, 1581, 688), "Frau mit dunklem Afro-Lockenhaar, bordeauxfarbene Bluse, Profil nach links"),
        "v6": ((1664, 591, 1741, 682), "Mann mit dunklem Lockenhaar und Kinnbart, dunkelblauer Anzug, ganz rechts"),
    },
    "projekt": {
        "p1": ((172, 531, 268, 603), "Frau mit langem dunklem Haar, hellgruener Pullover, von hinten am Whiteboard"),
        "p2": ((510, 482, 580, 564), "grauhaariger Mann mit Brille und Bart, dunkelgruener Pullover, Profil nach links"),
        "p3": ((923, 588, 1023, 665), "Frau mit dunklem Lockenhaar, dunkelgruenes Oberteil, Profil nach rechts"),
        "p4": ((1216, 582, 1297, 676), "Mann mit Lockenhaar und Vollbart, lachsfarbener Pullover, Profil nach links"),
    },
    "compliance": {
        "c1": ((441, 605, 519, 682), "grauhaariger Mann mit Bart, rostbrauner Pullover, Profil nach rechts, ganz links"),
        "c2": ((787, 590, 863, 660), "Mann mit dunklem Lockenhaar, Jeansjacke, von hinten"),
        "c3": ((1108, 610, 1206, 705), "Person mit voluminoesem dunkelbraunem Lockenhaar, bordeauxfarbenes Oberteil, von hinten"),
        "c4": ((1439, 616, 1507, 673), "Mann mit kurzem grau meliertem Haar, grauer Pullover, von hinten"),
        "c5": ((1717, 610, 1797, 690), "Mann mit Lockenhaar und Bart, gemustertes Hemd, Profil nach links, ganz rechts"),
    },
    "it": {
        "i1": ((94, 547, 168, 622), "Frau mit dunklem schulterlangem Haar, olivgruenes T-Shirt, stehend ganz links"),
        "i2": ((588, 485, 664, 566), "grauhaariger Mann mit Bart, brauner Tweed-Sakko, Profil nach links, stehend"),
        "i3": ((932, 608, 1013, 693), "Mann mit Lockenhaar und Vollbart, blaugrauer Kapuzenpullover, Profil nach rechts"),
        "i4": ((1348, 619, 1450, 695), "Person mit langem hellbraunem Lockenhaar, olivfarbenes Sakko, Profil nach links"),
    },
    # In den folgenden vier Bildern sitzt im oberen Streifen jeweils noch eine
    # Reihe Personen, deren Koepfe der Bildrand abschneidet. Sie bleiben aussen
    # vor: was man von ihnen sieht, sind Ruempfe und Beine, keine Gesichter.
    "corporate": {
        "c1": ((331, 532, 439, 608), "Mann mit langem grauem Haar und weissem Bart, hellbraunes Sakko, Profil nach rechts"),
        "c2": ((574, 530, 656, 612), "Mann mit schwarzem Haar, Brille und Vollbart, hellgelbes Hemd, Profil nach links"),
        "c3": ((1407, 542, 1479, 609), "Frau mit dunklem Haar im Dutt, altrosa Strickjacke, Profil nach rechts"),
        "c4": ((1676, 544, 1746, 623), "Mann mit Lockenhaar und grauem Bart, petrolfarbenes Poloshirt, Profil nach links"),
    },
    "marktfolge": {
        "m1": ((158, 552, 244, 637), "Mann mit grauem Lockenhaar und Bart, dunkelviolettes Shirt, Profil nach rechts"),
        "m2": ((516, 531, 618, 637), "Mann mit hellbraunem Lockenkopf und Bart, hellgruenes Poloshirt, Profil nach links"),
        "m3": ((897, 541, 987, 613), "Mann mit schwarzem Haar und Bart, rostrotes Strickshirt, Kopf zurueckgelehnt"),
        "m4": ((1234, 532, 1306, 602), "Mann mit grau meliertem Haar, blaues Hemd, Blick nach rechts oben"),
        "m5": ((1451, 495, 1545, 566), "stehende Frau mit Brille und zurueckgebundenem Haar, weinrote Strickjacke"),
    },
    "kunde": {
        "k1": ((176, 614, 297, 700), "Frau mit dunklem Haar und tiefem Zopf, beiger Mantel, geht vorne links vorbei"),
        "k2": ((440, 477, 499, 543), "Mann mit grauem Haar, beiges Sakko, vor dem linken Beratungstresen"),
        "k3": ((577, 443, 639, 520), "Mann mit grauem Haar, Brille und Vollbart, graue Weste, hinter dem linken Tresen"),
        "k4": ((946, 483, 1014, 551), "Mann mit langem Lockenhaar, Brille und Bart, hinter dem rechten Tresen"),
        "k5": ((1152, 465, 1227, 527), "Frau mit langem dunklem Haar, camelfarbener Mantel, vor dem rechten Tresen"),
        "k6": ((1721, 436, 1775, 498), "Mann mit dunklem Lockenhaar und Rucksack, von hinten am Geldautomaten"),
    },
    "vertrieb": {
        "v1": ((327, 532, 394, 607), "Frau mit langem dunklem Haar, cremefarbene Strickjacke, Profil nach rechts"),
        "v2": ((615, 531, 685, 607), "Mann mit dunklem Haar, olivgruener Pullover, Profil nach links"),
        "v3": ((703, 540, 801, 610), "Person mit langem dunklem Lockenhaar, cremefarbener Pullover, von hinten"),
        "v4": ((1186, 551, 1268, 638), "gehender Mann mit dunklem Haar und Bart, blaues Poloshirt, rechts im Bild"),
    },
}


def bildpfad(name):
    return os.path.join(QUELLE, name + ".png")


def zielpfad(name):
    return os.path.join(ZIEL_NEU, name + ".png")


def overlay():
    os.makedirs(ZIEL_NEU, exist_ok=True)
    for bild, koepfe in RAEUME.items():
        im = Image.open(bildpfad(bild)).convert("RGB")
        d = ImageDraw.Draw(im)
        for name, (box, _) in koepfe.items():
            d.rectangle(fenster_fuer(box, BREITE, HOEHE), outline=(0, 160, 255), width=2)
            d.rectangle(box, outline=(255, 0, 0), width=3)
            d.text((box[0], box[1] - 18), name, fill=(255, 220, 0))
        p = os.path.join(ZIEL, f"raeume_overlay_{bild}.jpg")
        im.save(p, quality=88)
        print("overlay:", p, f"— {len(koepfe)} Koepfe")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--overlay", action="store_true")
    ap.add_argument("--nur", nargs="*")
    ap.add_argument("--neu", action="store_true")
    ap.add_argument("--parallel", type=int, default=5)
    a = ap.parse_args()
    if a.overlay:
        return overlay()
    os.makedirs(KACHELN, exist_ok=True)
    os.makedirs(ZIEL_NEU, exist_ok=True)
    lade_key()
    from openai import OpenAI
    client = OpenAI()
    bilder = [b for b in RAEUME if not a.nur or b in a.nur]

    auftraege = [(b, n) for b in bilder for n in RAEUME[b]]
    quellen = {b: Image.open(bildpfad(b)).convert("RGB") for b in bilder}

    def bauen(auftrag):
        bild, name = auftrag
        p = os.path.join(KACHELN, f"{bild}_{name}.png")
        if os.path.exists(p) and not a.neu:
            return auftrag, "vorhanden"
        f = fenster_fuer(RAEUME[bild][name][0], BREITE, HOEHE)
        gross = quellen[bild].crop(f).resize((KANTE, KANTE), Image.LANCZOS)
        print(f"{bild}/{name} → Bildmodell ({KANTE / (f[2] - f[0]):.1f}-fach)", flush=True)
        edit(client, gross, PROMPT).save(p)
        return auftrag, "neu"

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max(1, a.parallel)) as ex:
        for (bild, name), status in ex.map(bauen, auftraege):
            print(f"{bild}/{name} kachel {status}", flush=True)

    for bild in bilder:
        quelle = quellen[bild]
        im = quelle.copy()
        gesetzt = 0
        for name, (box, _) in RAEUME[bild].items():
            p = os.path.join(KACHELN, f"{bild}_{name}.png")
            if not os.path.exists(p):
                continue
            f = fenster_fuer(box, BREITE, HOEHE)
            k = f[2] - f[0]
            klein = Image.open(p).convert("RGB").resize((k, k), Image.LANCZOS)
            tile, sc = ausrichten(quelle.crop(f), klein)
            if not 0.70 <= sc <= 1.30:
                print(f"{bild}/{name} WARNUNG: Skalierung {sc:.3f} — uebersprungen")
                continue
            im.paste(Image.composite(tile, im.crop(f), maske_fuer(box, f)), f[:2])
            gesetzt += 1
        im.save(zielpfad(bild))
        print(f"{bild}: {gesetzt} von {len(RAEUME[bild])} Koepfen → {zielpfad(bild)}")


if __name__ == "__main__":
    main()
