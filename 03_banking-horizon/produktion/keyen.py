#!/usr/bin/env python3
"""Oberflaeche in die gruene Flaeche stanzen — fuer Standbild und Video.

Das Szenenbild (und spaeter die Veo-Aufnahme) enthaelt an der Stelle des
Monitors eine glatte Chroma-Key-Flaeche. Hier wird sie Bild fuer Bild gesucht
und durch die gerenderte Oberflaeche ersetzt.

Warum pro Einzelbild und nicht einmal fuer den ganzen Clip: bei den Fahrten
bewegt sich der Monitor im Bild. Die Flaeche wird deshalb in jedem Bild neu
bestimmt; weil sie frontal steht, genuegt ihr umschliessendes Rechteck.
"""
import os
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

FF = imageio_ffmpeg.get_ffmpeg_exe()


def maske(a):
    """Boolesche Maske der Chroma-Key-Flaeche eines RGB-Arrays."""
    r, g, b = a[..., 0].astype(np.int16), a[..., 1].astype(np.int16), a[..., 2].astype(np.int16)
    return (g > 80) & (g - r > 35) & (g - b > 25)


def kasten(m, mindest=4000):
    """Umschliessendes Rechteck der groessten gruenen Flaeche."""
    lab, n = ndimage.label(m)
    if not n:
        return None
    groessen = ndimage.sum(m, lab, range(1, n + 1))
    k = int(np.argmax(groessen)) + 1
    if groessen[k - 1] < mindest:
        return None
    ys, xs = np.where(lab == k)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def einpassen(ui, bw, bh):
    """Oberflaeche auf die Flaeche bringen.

    Weicht das Seitenverhaeltnis nur wenig ab, wird leicht ungleichmaessig
    skaliert — das faellt nicht auf und kostet keinen Bildinhalt. Erst bei
    groesserem Unterschied wird beschnitten, sonst wuerde die Oberflaeche
    sichtbar verzerrt.
    """
    v_ziel, v_ui = bw / bh, ui.width / ui.height
    if abs(v_ziel - v_ui) / v_ui < 0.12:
        return ui.resize((bw, bh), Image.LANCZOS)
    s = max(bw / ui.width, bh / ui.height)
    gross = ui.resize((round(ui.width * s), round(ui.height * s)), Image.LANCZOS)
    lx, ly = (gross.width - bw) // 2, (gross.height - bh) // 2
    return gross.crop((lx, ly, lx + bw, ly + bh))


def stanzen(szene_rgb, ui, k, m):
    """Oberflaeche einsetzen — pixelweise dort, wo Gruen ist.

    Das Rechteck sagt nur, WOHIN die Oberflaeche abgebildet wird. Sichtbar wird
    sie allein da, wo die Aufnahme tatsaechlich gruen ist. Sonst wuerde alles
    ueberdeckt, was vor dem Schirm liegt — ihr Arm, ihre Hand, der Becher.
    """
    x0, y0, x1, y1 = k
    szene = Image.fromarray(szene_rgb).convert("RGB")

    schicht = szene.copy()
    schicht.paste(einpassen(ui, x1 - x0, y1 - y0), (x0, y0))

    # Nur Gruen INNERHALB des Bildschirms zaehlt — Pflanzen im Raum sind
    # ebenfalls gruen und duerfen nicht ersetzt werden.
    innen = np.zeros(m.shape, dtype=bool)
    innen[y0:y1, x0:x1] = True
    fl = m & innen
    # Ein Pixel schrumpfen: der Uebergang Bildschirm/Rahmen ist eine Mischfarbe
    # und wuerde sonst als gruener Saum stehen bleiben.
    kern = ndimage.binary_erosion(fl, iterations=1)
    alpha = Image.fromarray((kern * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    a = np.asarray(alpha)

    erg = np.asarray(Image.composite(schicht, szene, alpha), dtype=np.int16)

    # Gruenstich toeten. Nicht nur am Rand der Flaeche: die gruene Wand faerbt
    # in der Aufnahme auch die Kante ihres Arms ein, und der Saum steht dann
    # mitten im Bild. Deshalb wird im GANZEN Bildschirmrechteck ueberall dort,
    # wo nicht ersetzt wurde, der Gruenkanal auf das Maximum der beiden anderen
    # begrenzt — im Raum ausserhalb bleibt jedes Gruen unangetastet.
    # Nicht `innen & ~kern`: die weiche Alphakante liegt zur Haelfte INNERHALB
    # der Flaeche, und dort mischt sich die Oberflaeche mit noch gruenem
    # Hintergrund. Entscheidend ist deshalb nicht die Maske, sondern das Alpha —
    # ueberall, wo nicht voll ersetzt wurde, kann Gruen durchschlagen.
    ring = innen & (a < 255)
    if ring.any():
        # Uebliche Entgruenung: der Gruenkanal darf nicht ueber dem Mittel aus
        # Rot und Blau liegen. Das Maximum der beiden zu nehmen genuegt nicht —
        # dann bleibt an dunklen Kanten ein tuerkiser Saum stehen.
        g = erg[..., 1]
        deckel = (erg[..., 0] + erg[..., 2]) // 2
        g[ring] = np.minimum(g[ring], deckel[ring])
    return Image.fromarray(erg.astype(np.uint8))


def bilder(ordner):
    return sorted(os.path.join(ordner, f) for f in os.listdir(ordner) if f.endswith(".png"))


def standbild(szene_pfad, ui_pfad, ziel):
    a = np.asarray(Image.open(szene_pfad).convert("RGB"))
    m = maske(a)
    k = kasten(m)
    if not k:
        raise SystemExit("keine gruene Flaeche gefunden")
    stanzen(a, Image.open(ui_pfad).convert("RGB"), k, m).save(ziel)
    print("Standbild", ziel, "Flaeche", k)


def film(szene, ui_ordner, ziel, fps=24, dauer=None):
    """szene = Standbild ODER Video. ui_ordner = Einzelbilder der Oberflaeche."""
    uis = [Image.open(p).convert("RGB") for p in bilder(ui_ordner)]
    if not uis:
        raise SystemExit("keine Oberflaechenbilder")

    if szene.lower().endswith((".png", ".jpg", ".jpeg")):
        grund = [np.asarray(Image.open(szene).convert("RGB"))]
        n = int((dauer or len(uis) / fps) * fps)
    else:
        leser = imageio_ffmpeg.read_frames(szene)
        meta = leser.__next__()
        w, h = meta["size"]
        grund = [np.frombuffer(f, dtype=np.uint8).reshape(h, w, 3) for f in leser]
        n = len(grund)

    h, w = grund[0].shape[:2]
    roh = subprocess.Popen(
        [FF, "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}",
         "-r", str(fps), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "20",
         "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart", "-y", ziel],
        stdin=subprocess.PIPE)

    letzter = None
    for i in range(n):
        a = grund[min(i, len(grund) - 1)]
        m = maske(a)
        # Der Kasten kommt aus dem ersten Bild und bleibt stehen: verdeckt ihr
        # Arm eine Ecke, waere das umschliessende Rechteck sonst kleiner und die
        # Oberflaeche wuerde im Bild springen.
        k = kasten(m) or letzter
        if letzter and k:
            k = tuple(round(0.85 * alt + 0.15 * neu) for alt, neu in zip(letzter, k))
        letzter = k
        ui = uis[min(i, len(uis) - 1)]
        bild = stanzen(a, ui, k, m) if k else Image.fromarray(a)
        roh.stdin.write(np.asarray(bild, dtype=np.uint8).tobytes())
    roh.stdin.close()
    roh.wait()
    print("Film", ziel, n, "Bilder")


if __name__ == "__main__":
    if sys.argv[1] == "bild":
        standbild(*sys.argv[2:5])
    else:
        film(*sys.argv[2:5])
