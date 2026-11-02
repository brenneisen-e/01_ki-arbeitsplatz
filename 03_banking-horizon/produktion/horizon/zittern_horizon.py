#!/usr/bin/env python3
"""Messen, ob der eingesetzte Bildschirmtext gegen den Take wackelt.

Der Auftraggeber sah es sofort, ich hatte es nie gemessen: der zurueck-
geholte Text sass nicht ruhig auf dem Bildschirm, er zitterte gegen den
Rahmen. Stichproben-Einzelbilder zeigen das nicht — Zittern ist eine
Eigenschaft ZWISCHEN Bildern. Also wird hier jedes Bild gegen sein
Vorgaengerbild gemessen, und zwar zweimal: einmal im fertigen Take (der
eingesetzte Text) und einmal im rohen Take an derselben Stelle (Veos
eigener, verdorbener Text — der bewegt sich exakt mit dem Bildschirm). Die
Differenz beider Bewegungen ist das Wackeln. Bei sauberer Arbeit ist sie
null; alles ueber 0,3 Pixel sieht man bei 1080p, ueber 0,5 Pixel deutlich.

Sub-Pixel: normierte Kreuzkorrelation, um das ganzzahlige Maximum eine
Parabel durch drei Punkte — Standardverfahren, Genauigkeit rund 0,05 px.

Dazu das Flimmern: wie stark aendert sich der Textausschnitt von Bild zu
Bild, nachdem seine Bewegung herausgerechnet ist. Aendert sich nichts,
steht der Text; aendert er sich staerker als der rohe Take an derselben
Stelle, wechselt die Maske oder die Abtastung von Bild zu Bild.

    SCRATCH=… python3 zittern_horizon.py h2 h4 h5     # Tabelle je Szene
    SCRATCH=… python3 zittern_horizon.py --alle        # alle festgehaltenen
"""
import json
import os
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
B, H, FPS = 1920, 1080, 25
sys.argv, argv = sys.argv[:1], sys.argv
import bildschirm_fest as bf                       # noqa: E402  BEREICHE, grau

KLOTZ = (160, 120)       # Messfeld
RAND = 6                 # Suchspiel je Richtung, Pixel
SCHWELLE_SICHTBAR = 0.3  # ab hier sieht man es
SCHWELLE_DEUTLICH = 0.5


def bilder(pfad):
    p = subprocess.Popen([FFMPEG, "-v", "error", "-i", pfad, "-vf",
                          f"scale={B}:{H},fps={FPS}", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    while True:
        roh = p.stdout.read(B * H * 3)
        if len(roh) < B * H * 3:
            break
        yield bf.grau(np.frombuffer(roh, dtype=np.uint8).astype(np.float32).reshape(H, B, 3))
    p.stdout.close()
    p.wait()


def nkk_karte(fenster, vorlage):
    """Normierte Kreuzkorrelation als Karte (FFT), fuer alle Lagen der
    Vorlage im Fenster."""
    fh, fb = fenster.shape
    vh, vb = vorlage.shape
    v = vorlage - vorlage.mean()
    maske = np.zeros_like(fenster)
    maske[:vh, :vb] = 1.0
    n = vh * vb
    Ff = np.fft.rfft2(fenster)
    Fv = np.conj(np.fft.rfft2(v, s=(fh, fb)))
    Fm = np.conj(np.fft.rfft2(maske))
    zaehler = np.fft.irfft2(Ff * Fv, s=(fh, fb))
    summe = np.fft.irfft2(Ff * Fm, s=(fh, fb))
    summe2 = np.fft.irfft2(np.fft.rfft2(fenster * fenster) * Fm, s=(fh, fb))
    streuung = np.sqrt(np.maximum(summe2 - summe * summe / n, 0.0))
    k = zaehler / (streuung * float(np.sqrt((v * v).sum())) + 1e-6)
    return k[:fh - vh + 1, :fb - vb + 1]


def verschiebung(vorher, nachher, x0, y0, klotz=KLOTZ):
    """Wohin ist der Ausschnitt (x0, y0, klotz) von vorher nach nachher
    gewandert? Sub-Pixel, plus Guete."""
    kb, kh = klotz
    vorlage = vorher[y0:y0 + kh, x0:x0 + kb]
    fenster = nachher[y0 - RAND:y0 + kh + RAND, x0 - RAND:x0 + kb + RAND]
    k = nkk_karte(fenster, vorlage)
    iy, ix = np.unravel_index(np.argmax(k), k.shape)
    dx, dy = ix - RAND, iy - RAND

    def parabel(a, b, c):
        nenner = a - 2 * b + c
        return 0.0 if abs(nenner) < 1e-9 else float(np.clip((a - c) / (2 * nenner), -1, 1))
    if 0 < ix < k.shape[1] - 1:
        dx += parabel(k[iy, ix - 1], k[iy, ix], k[iy, ix + 1])
    if 0 < iy < k.shape[0] - 1:
        dy += parabel(k[iy - 1, ix], k[iy, ix], k[iy + 1, ix])
    return dx, dy, float(k[iy, ix])


def messfelder(name):
    """Textreiche Felder im Bildschirm, abseits der Menschen-Bereiche."""
    stand = np.asarray(Image.open(f"{HIER}/hypothesen/{name}.png").convert("L")
                       .resize((B, H), Image.LANCZOS), dtype=np.float32)
    bereich = bf.BEREICHE[name]
    kaesten = bereich.get("kaesten") or bereich.get("karten") or []
    # Gemessen wird ueberall, wo eingesetzt wird — also nicht in den
    # Menschen-Rechtecken pauschal, sondern dort nicht, wo die Bewegungs-
    # maske (bewegt.png, Vorlagenkoordinaten) den Take stehen laesst.
    menschen = []
    bewegt_pfad = f"{S}/veo_fest/{name}_bewegt.png"
    bewegt = None
    if os.path.exists(bewegt_pfad) and kaesten:
        bewegt = np.asarray(Image.open(bewegt_pfad), dtype=np.float32)
    kb, kh = KLOTZ
    if any(x1 - x0 < kb + 24 or y1 - y0 < kh + 24 for (x0, y0, x1, y1) in kaesten):
        kb, kh = 96, 72                 # kleine Schilder (h3)
    kandidaten = []
    for (x0, y0, x1, y1) in kaesten:
        for y in range(y0 + 8, y1 - kh - 8, kh // 2):
            for x in range(x0 + 8, x1 - kb - 8, kb // 2):
                if x < RAND + 1 or y < RAND + 1 or x + kb + RAND >= B or y + kh + RAND >= H:
                    continue
                if bewegt is not None:
                    bx, by = x - kaesten[0][0], y - kaesten[0][1]
                    if bewegt[max(0, by):by + kh, max(0, bx):bx + kb].max() > 64:
                        continue
                f = stand[y:y + kh, x:x + kb]
                energie = float(np.abs(np.diff(f, axis=1)).mean() + np.abs(np.diff(f, axis=0)).mean())
                kandidaten.append((energie, x, y))
    kandidaten.sort(reverse=True)
    felder, belegt = [], []
    for energie, x, y in kandidaten:
        if any(abs(x - bx) < kb and abs(y - by) < kh for (bx, by) in belegt):
            continue
        felder.append((x, y))
        belegt.append((x, y))
        if len(felder) == 6:
            break
    return felder, (kb, kh)


def messen(name, still=False):
    roh_pfad = f"{S}/veo_szenen/{name}.mp4"
    fest_pfad = f"{S}/veo_fest/{name}.mp4"
    if not (os.path.exists(roh_pfad) and os.path.exists(fest_pfad)):
        print(f"{name}: fehlt (roh oder fest)", flush=True)
        return None
    felder, klotz = messfelder(name)
    if not felder:
        print(f"{name}: kein Messfeld", flush=True)
        return None
    kb, kh = klotz
    zeilen = []
    vor_r = vor_f = None
    for t, (r, f) in enumerate(zip(bilder(roh_pfad), bilder(fest_pfad))):
        if vor_r is not None:
            rel, flimmern, flimmern_roh = [], [], []
            for (x, y) in felder:
                dxr, dyr, gr = verschiebung(vor_r, r, x, y, klotz)
                dxf, dyf, gf = verschiebung(vor_f, f, x, y, klotz)
                rel.append(np.hypot(dxf - dxr, dyf - dyr))
                # Flimmern: Restunterschied nach ganzzahliger Nachfuehrung.
                sx, sy = int(round(dxf)), int(round(dyf))
                a = vor_f[y:y + kh, x:x + kb]
                b = f[y + sy:y + sy + kh, x + sx:x + sx + kb]
                flimmern.append(float(np.abs(a - b).mean()))
                sx, sy = int(round(dxr)), int(round(dyr))
                a = vor_r[y:y + kh, x:x + kb]
                b = r[y + sy:y + sy + kh, x + sx:x + sx + kb]
                flimmern_roh.append(float(np.abs(a - b).mean()))
            # Felder, durch die im rohen Take gerade eine Hand faehrt,
            # messen die Hand, nicht den Bildschirm: ihr Restunterschied
            # liegt weit ueber dem der anderen Felder. Sie zaehlen in diesem
            # Bild nicht mit (mindestens zwei Felder bleiben immer).
            fr = np.asarray(flimmern_roh)
            ruhig_felder = fr <= 3.0 * np.median(fr) + 1.0
            if ruhig_felder.sum() < 2:
                ruhig_felder = np.argsort(fr) < 2
            rel_ok = np.asarray(rel)[ruhig_felder]
            zeilen.append((t, float(np.median(rel_ok)), float(np.max(rel_ok)),
                           float(np.median(flimmern)), float(np.median(flimmern_roh))))
        vor_r, vor_f = r, f
    z = np.array(zeilen)
    if not len(z):
        return None
    rel = z[:, 1]
    bericht = {
        "bilder": int(len(z)) + 1,
        "felder": felder,
        "wackeln_rms_px": float(np.sqrt((rel ** 2).mean())),
        "wackeln_max_px": float(rel.max()),
        "bilder_ueber_0_3": int((rel > SCHWELLE_SICHTBAR).sum()),
        "bilder_ueber_0_5": int((rel > SCHWELLE_DEUTLICH).sum()),
        "flimmern_fest": float(np.median(z[:, 3])),
        "flimmern_roh": float(np.median(z[:, 4])),
    }
    urteil = ("RUHIG" if bericht["wackeln_max_px"] < SCHWELLE_SICHTBAR
              else "SICHTBAR" if bericht["wackeln_max_px"] < SCHWELLE_DEUTLICH
              else "WACKELT")
    print(f"{name}: {bericht['bilder']} Bilder, Wackeln RMS {bericht['wackeln_rms_px']:.2f} px, "
          f"max {bericht['wackeln_max_px']:.2f} px, ueber 0,3: {bericht['bilder_ueber_0_3']}, "
          f"ueber 0,5: {bericht['bilder_ueber_0_5']}  |  Flimmern fest {bericht['flimmern_fest']:.1f} "
          f"roh {bericht['flimmern_roh']:.1f}  ->  {urteil}", flush=True)
    if not still:
        schlimmste = z[np.argsort(-z[:, 1])[:6]]
        for t, m, mx, fl, flr in schlimmste:
            print(f"    Bild {int(t):3d} ({t / FPS:5.2f} s): Wackeln {m:.2f} px (max Feld {mx:.2f})",
                  flush=True)
    bericht["urteil"] = urteil
    return bericht


if __name__ == "__main__":
    namen = [a for a in argv[1:] if not a.startswith("--")]
    if "--alle" in argv or not namen:
        namen = [n for n in bf.BEREICHE if os.path.exists(f"{S}/veo_fest/{n}.mp4")]
    alle = {}
    for n in namen:
        b = messen(n)
        if b:
            alle[n] = b
    os.makedirs(f"{S}/zittern", exist_ok=True)
    json.dump(alle, open(f"{S}/zittern/bericht.json", "w"), indent=1)
    schlecht = [n for n, b in alle.items() if b["urteil"] != "RUHIG"]
    print("ZITTERN:", "alle ruhig" if not schlecht else "nicht ruhig: " + ", ".join(schlecht),
          flush=True)
