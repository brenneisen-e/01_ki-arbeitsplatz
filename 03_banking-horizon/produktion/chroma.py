#!/usr/bin/env python3
"""Chroma-Flaeche zur Laufzeit setzen — im Repo liegen nur schwarze Schirme.

Die Raeume werden mit einem AUSGESCHALTETEN, matt schwarzen Bildschirm
erzeugt. Das hat einen Grund: laesst man das Bildmodell eine gruene Flaeche
malen, legt es gruenes Licht in den ganzen Raum — einen Schimmer auf ihrem
Gesicht, einen Saum an der Schulter — und Kling malt das im Take weiter.

Die Montage braucht die gruene Flaeche trotzdem: sie ist es, an der der
Bildschirm ueber die ganze Fahrt verfolgt wird. Also entsteht sie hier, aus
dem gemessenen Rechteck des schwarzen Schirms: ein flaches Rechteck mit
harter Kante, ohne Reflex, ohne Verlauf, ohne Schimmer im Raum.

Damit liegt im Repo kein einziges Bild mit gruener Flaeche. Die abgeleiteten
Fassungen stehen im Arbeitsverzeichnis und entstehen bei Bedarf neu.
"""
import json
import os

import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
QUELLEN = f"{HIER}/quellen_v08"
SCHIRME = f"{QUELLEN}/schirme.json"
CHROMA = (8, 168, 63)


def kaesten():
    if not os.path.exists(SCHIRME):
        return {}
    return json.load(open(SCHIRME))


def merken(name, kasten):
    """Das gemessene Rechteck eines Schirms festhalten."""
    alle = kaesten()
    alle[name] = list(kasten)
    os.makedirs(QUELLEN, exist_ok=True)
    json.dump(dict(sorted(alle.items())), open(SCHIRME, "w"), indent=2)


def pfad(name, ziel=None):
    """Pfad einer Quelle, mit Chroma-Flaeche, falls die Szene einen Schirm hat.

    Szenen ohne Schirm (Wohnung, Halle, Dachgarten) geben ihre Datei
    unveraendert zurueck.
    """
    quelle = f"{QUELLEN}/{name}.png"
    kasten = kaesten().get(name)
    if not kasten:
        return quelle
    ziel = ziel or os.environ.get("SCRATCH")
    if not ziel:
        raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
    ordner = f"{ziel}/chroma_v08"
    os.makedirs(ordner, exist_ok=True)
    abgeleitet = f"{ordner}/{name}.png"
    if (os.path.exists(abgeleitet)
            and os.path.getmtime(abgeleitet) >= os.path.getmtime(quelle)
            and os.path.getmtime(abgeleitet) >= os.path.getmtime(SCHIRME)):
        return abgeleitet
    a = np.asarray(Image.open(quelle).convert("RGB")).copy()
    x0, y0, x1, y1 = kasten
    a[y0 + 1:y1 - 1, x0 + 1:x1 - 1] = CHROMA
    Image.fromarray(a).save(abgeleitet)
    return abgeleitet


def bild(name):
    return Image.open(pfad(name)).convert("RGB")
