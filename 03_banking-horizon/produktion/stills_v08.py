#!/usr/bin/env python3
"""Standbilder der achten Fassung — neue Oberflaechen in dieselben Raeume.

Die Raeume der v08 sind die der v07: das Review hat an den Bildern nichts
auszusetzen gehabt, sondern an dem, was auf den Bildschirmen steht. Deshalb
wird hier NICHT neu generiert, sondern nur neu gestanzt:

    gruene Quelle (der Raum mit leerer Chroma-Flaeche)
  + gerenderte Oberflaeche (ui/f_<station>/…, letztes Bild)
  = Standbild der Station

Die gruenen Quellen liegen versioniert in quellen_v07/ und quellen/. Welche zu
welcher Station gehoert, steht in QUELLEN — nachgeprueft, indem die v07-Stills
aus denselben Paaren rekonstruiert und verglichen wurden.

Zwei Sonderfaelle:
  * s4 ist die Wandanzeige des Teamraums (breites Format, eigene Aufnahme).
  * s2b ist der Kachelraum: derselbe Bildschirm wie s2, darueber die neun
    Kundenkacheln — dieselben neun Kunden, die um 08:05 auf der Liste stehen.

Aufruf (nach ui/alle_rendern_v08.sh):
    SCRATCH=… python3 stills_v08.py
"""
import os
import sys

import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import chroma  # noqa: E402
import handyglas  # noqa: E402
import kacheln_html  # noqa: E402
import keyen  # noqa: E402

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
ZIEL = os.path.normpath(f"{HIER}/../public/images/operations-v08")

# Station -> (gruene Quelle, Name der gerenderten Bildfolge)
# Station -> (Name der gruenen Quelle, Name der gerenderten Bildfolge).
# Die Quelle liegt im Repo mit SCHWARZEM Schirm; die Chroma-Flaeche entsteht
# beim Zugriff aus dem gemessenen Rechteck (chroma.py).
QUELLEN = {
    "s1": ("buero", "s1"),
    # 08:05 spielt am selben Platz wie 08:00 — nur der Bildschirm wechselt.
    "s2": ("buero", "s2"),
    "s3": ("g_s3", "s3"),
    "s4": ("besprechung", "s4w"),
    "s5": ("kabine", "s5"),
    "s6": ("g_s6", "s6"),
    "s8": ("g_s8", "s8"),
    "s9": ("g_s9", "s9"),
}

# 08:10 — die neun Kacheln. Ort, Nachricht und Betrag stimmen mit der Liste
# ueberein, die um 08:05 auf dem Bildschirm steht: dieselben neun Kunden,
# dieselben Betraege. In v07 standen dort noch 2.450 EUR fuer einen einzelnen
# Fall; das Review hat genau das beanstandet.
KACHEL_FAELLE = [
    ("Kitchen table", "Service fee corrected", "18 EUR"),
    ("On the tram", "Return fees waived", "25 EUR"),
    ("Supermarket", "Duplicate charge reversed", "12 EUR"),
    ("In the park", "Late fee covered", "22 EUR"),
    ("Workshop", "Overdraft interest reversed", "9 EUR"),
    ("Cafe", "Statement fee refunded", "4 EUR"),
    ("Car park", "Travel credit issued", "20 EUR"),
    ("At home", "Value date corrected", "2 EUR"),
    ("City street", "Charge reversed", "14 EUR"),
]


def letzte_ui(name):
    """Letztes Bild einer gerenderten Oberflaechenfolge — der Endzustand."""
    # Eigener v08-Ordner — dieselbe Regel wie bei den Takes: nichts, was
    # eine andere Fassung erzeugt hat, darf hier je gefunden werden.
    ordner = f"{S}/ui/v08/f_{name}"
    dateien = sorted(f for f in os.listdir(ordner) if f.endswith(".png"))
    if not dateien:
        raise SystemExit(f"keine Bilder in {ordner}")
    return Image.open(os.path.join(ordner, dateien[-1])).convert("RGB")


def stanzen(station, quelle, ui):
    a = np.asarray(chroma.bild(quelle))
    m = keyen.maske(a)
    k = keyen.kasten(m)
    if not k:
        raise SystemExit(f"{station}: keine gruene Flaeche in {quelle}")
    return keyen.stanzen(a, ui, k, m)


def sichern(bild, pfad, qualitaet=90):
    os.makedirs(os.path.dirname(pfad), exist_ok=True)
    bild.save(pfad, quality=qualitaet, optimize=True, progressive=True)


if __name__ == "__main__":
    nur = set(sys.argv[1:])
    os.makedirs(f"{ZIEL}/ui", exist_ok=True)

    for station, (quelle, folge) in QUELLEN.items():
        if nur and station not in nur:
            continue
        ui = letzte_ui(folge)
        # Die Oberflaeche selbst — die Buehne zeigt sie nach dem Szenenwechsel
        # unbeschnitten neben der Aussage.
        sichern(ui, f"{ZIEL}/ui/{station}.jpg", 92)
        sichern(stanzen(station, quelle, ui), f"{ZIEL}/{station}.jpg")
        print(f"{station:4s} {quelle}", flush=True)

    # 07:00 — die Wohnung. Kein Bildschirm, aber die glaeserne Tafel neben ihr:
    # Was sie liest, ist der Overnight Report — und der ist in v08 komplett neu
    # geschrieben. Deshalb muss auch dieses Standbild neu entstehen, sonst
    # stehen auf dem Telefon noch die Zahlen der v07.
    if not nur or "home" in nur:
        wohnung = chroma.bild("wohnung_rein")
        sichern(handyglas.tafel(wohnung, letzte_ui("handy"), 1.0), f"{ZIEL}/home.jpg")
        print("home quellen_v08/wohnung_rein.png + Overnight Report", flush=True)

    # 14:00 — die Lounge-Ecke. Kein Bildschirm: sie liest den Recovery-
    # Vorschlag auf dem Telefon, und die Seite liegt wie um 07:00 als Ebene
    # daneben (ui/entscheidung_v08.html — austauschbar ohne neues Bild).
    if not nur or "s7" in nur:
        lounge = Image.open(f"{HIER}/quellen_v08/g_s7.png").convert("RGB")
        sichern(handyglas.tafel(lounge, letzte_ui("entsch"), 1.0), f"{ZIEL}/s7.jpg")
        print("s7   g_s7 + Entscheidungsseite", flush=True)

    # 07:45 — die Schranke. Aus dem Review: sie schaut auf ihr Telefon und
    # sieht, was der Tag bringt. Bisher trug die Szene nur einen Satz, und sie
    # spielte hinter der Schranke; jetzt steht sie davor, in der Gasse.
    if not nur or "s0" in nur:
        halle = chroma.bild("schranke")
        sichern(handyglas.tafel(halle, letzte_ui("tag"), 1.0, titel="HER DAY"),
                f"{ZIEL}/s0.jpg")
        print("s0   quellen_v08/schranke.png + Tagesuebersicht", flush=True)

    # 08:10 — der Kachelraum. Die neun Kacheln kommen als HTML-Ebene darueber
    # (ui/kacheln_v08.html), damit Orte, Nachrichten und Betraege austauschbar
    # bleiben; das Glas dahinter wird gerechnet.
    if not nur or "s2b" in nur:
        # Erst den Bildschirm stanzen, dann die Kacheln legen: sonst blitzt
        # das Chroma in den Fugen zwischen den Kacheln durch.
        raum = stanzen("s2b", "s2b_rein", letzte_ui("s2"))
        sichern(kacheln_html.legen(raum, kacheln_html.ebene(S)), f"{ZIEL}/s2b.jpg")
        print("s2b  s2b_rein + 9 Kacheln (HTML)", flush=True)

    # 17:00 — der Dachgarten. Kein Bildschirm, keine Ebene: das Standbild IST
    # die Quelle. Ohne diesen Schritt blieb das alte s10.jpg der Vorfassung
    # liegen — das Video endete auf der neuen Terrasse, die App zeigte die alte.
    if not nur or "s10" in nur:
        dach = Image.open(f"{HIER}/quellen_v08/s10_169.png").convert("RGB")
        sichern(dach, f"{ZIEL}/s10.jpg")
        print("s10  quellen_v08/s10_169.png", flush=True)

    print("STILLS V08 FERTIG", flush=True)
