#!/usr/bin/env python3
"""
Boden und Beine im Master-Strukturbild vereinheitlichen — VERWORFEN, siehe unten.

ERGEBNIS DES VERSUCHS (2026-09-10): nicht verwendbar, das Bild wurde auf den
Stand ohne Bodenergaenzung zurueckgesetzt. Das Skript bleibt als Dokumentation
liegen, damit der Weg nicht ein zweites Mal gegangen wird.

Ausgangslage: Im 1. OG und im Erdgeschoss sieht man den Fussboden und die Fuesse
der Personen, im 2. und 3. OG schneidet die Betonbruestung die Beine ab.

Warum es nicht funktioniert: Zwischen Sitzflaeche und Etagenkante liegen im 2. OG
nur rund 110, im 3. OG rund 170 Pixel. In diesen Streifen muessen Unterschenkel,
Schuhe, Stuhlfuesse, Boden UND die Betonstirn passen. Das Bildmodell loest das
nicht, sondern zeichnet einen milchigen Schleier ueber den ganzen Streifen, laesst
Fuesse weg, loest Hosenbeine nach unten auf und setzt koerperlose Beinpaare sowie
halbtransparente Stuhlkreuze in die Luecken. Eine Qualitaetspruefung ueber alle
vier betroffenen Raeume fand das durchgaengig in jedem Raum — das Bild war mit
Bodenergaenzung schlechter als ohne, wo die Personen zwar an der Bruestung enden,
aber sauber und scharf.

Wer den Boden wirklich braucht, muss das Strukturbild neu erzeugen, mit einer
Perspektive, die in allen vier Etagen auf den Boden blickt. Nachtraeglich
einsetzen laesst er sich nicht.

Immerhin drei uebertragbare Erkenntnisse zu gpt-image-Inpainting:

1. **Der Prompt darf keine Neurahmung nahelegen.** Formulierungen wie "zeige diese
   Etage so wie die darunter" liest gpt-image als Kompositionsauftrag und liefert
   die Kachel 40-90 % herausgezoomt und mit erfundenen Personen zurueck. Mit
   "same camera, framing and crop, do not zoom out" bleibt sie bei Faktor 1.00.
2. **Die Maske darf den Kachelrand nicht beruehren.** Sonst gilt dasselbe: das
   Modell erweitert das Bild, statt zu retuschieren. Mindestens 200 px
   Originalpixel ringsum, auch unterhalb der Maske.
3. **Treue laesst sich nicht ueber Pixelabweichung messen.** gpt-image zeichnet
   immer das ganze Bild neu, auch ausserhalb der Maske; selbst einwandfreie
   Kacheln weichen dort um 10 bis 30 Graustufen ab. Brauchbar ist allein die per
   ORB/RANSAC geschaetzte Skalierung.

Aufruf (falls doch noch einmal gebraucht):
  export OPENAI_API_KEY=...                       # oder $SCRATCH/.openai_env
  python3 produktion/strukturbild/boden_beine.py --overlay   # Zonen/Naehte pruefen
  python3 produktion/strukturbild/boden_beine.py             # alle Kacheln
  python3 produktion/strukturbild/boden_beine.py --nur og3_l_1
  python3 produktion/strukturbild/boden_beine.py --montage   # nur neu montieren
  python3 produktion/strukturbild/boden_beine.py --fuesse    # nur die Nachbesserungen

Ergebnis: $SCRATCH/strukturbild/Strukturbild_boden.jpg (+ Kacheln, Vergleiche).
"""
import argparse
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from personen_retusche import lade_key, ZIEL

HIER = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HIER, "..", ".."))
QUELLE = os.path.join(APP, "public", "images", "Strukturbild.jpg")
KACHELN = os.path.join(ZIEL, "boden_tiles")
os.makedirs(KACHELN, exist_ok=True)

KACHEL = 1024    # Kantenlaenge der Kachel in nativen Pixeln (quadratisch)
MINRAND = 200    # Mindestrand aus Originalpixeln links/rechts der Maske. Je breiter
                 # dieser Rand, desto zuverlaessiger bleibt gpt-image beim Inpainting:
                 # bei 130 px Rand kam die Kachel um 48 % herausgezoomt zurueck,
                 # bei 200 px blieb sie bei 1.14.
WEICH = 16       # weiche Kante der Maske beim Zurueckmontieren
NAHT = 30        # Ueberlappung/Blendbreite an der senkrechten Naht

# ── Zonen ────────────────────────────────────────────────────────────────────
# Je Raum: der Streifen, der neu gerechnet wird (y_von..y_bis), die Raumgrenzen
# in x (zwischen den Betonstuetzen) und die Naehte. Eine Naht liegt immer in
# einer Luecke zwischen zwei Personen, damit kein Bein zerschnitten wird.
#
# Gemessen am Bild (6144x4096):
#   3. OG  Moebel/Beine enden bei y~1212, Betonstirn 1215..1290, Untersicht bis 1400
#   2. OG  Moebel/Beine enden bei y~2075, Betonstirn 2078..2165, Untersicht bis 2210
#   1. OG  (Vorbild) Bodenstreifen 2790..2858, Betonstirn 2860..2930
#
# `stirn` = ((y_von, y_bis) im Original, y_oben am Ziel): die helle Betonstirn wird
# aus derselben Etage nach unten kopiert und liegt ausserhalb der Maske. Sie bleibt
# damit unveraendert erhalten UND gibt dem Bildmodell die Unterkante des Bodens
# sichtbar vor — sonst laesst es die Stirn einfach weg und der Boden laeuft in die
# Deckenuntersicht der Etage darunter.
ZONEN = {
    "og3_l": dict(
        y=(1120, 1285), x=(350, 2850), naehte=[600, 1047, 1330, 1604, 1976, 2291],
        stirn=((1215, 1290), 1285),
        was="the six executives seated at the long dark wooden conference table",
    ),
    "og3_r": dict(
        y=(1120, 1285), x=(3350, 5850), naehte=[3600, 3963, 4405, 4823, 5350],
        stirn=((1215, 1290), 1285),
        was="the two people standing at the whiteboard and the two people seated at the "
            "wooden desk",
    ),
    "og2_l": dict(
        y=(1970, 2135), x=(350, 2850), naehte=[700, 1121, 1558, 1920, 2260, 2600],
        stirn=((2078, 2128), 2135),
        was="the five risk controllers seated at the long monitor desk",
    ),
    "og2_r": dict(
        y=(1970, 2135), x=(3350, 5850), naehte=[3520, 3950, 4442, 4897, 5400],
        stirn=((2078, 2128), 2135),
        was="the two standing and two seated technology staff at the wooden desks",
    ),
}

# Der Prompt entscheidet, ob gpt-image retuschiert oder die Szene neu erfindet.
# Formulierungen wie "show this storey the way the one below does" laden zum
# Umkomponieren ein — dann kam die Kachel um 40-60 % herausgezoomt und mit
# zusaetzlichen Personen zurueck. Der ausdrueckliche Verzicht auf Neurahmung
# ("same camera, framing and crop, do not zoom out") haelt sie bei Faktor 1.00.
PROMPT = (
  "Local photo retouch only. In the transparent area, draw the missing lower legs, "
  "trousers and shoes of {was}, the five-star office chair pedestals with castors and the "
  "table legs, all resting on a light polished concrete floor that meets the pale "
  "concrete slab edge already visible just below the transparent area. "
  "Keep the exact same camera, framing and crop — do not zoom out, do not reframe, do not "
  "add or remove people or furniture, and do not change anything outside the transparent "
  "area. Photorealistic, matching daylight, colours and materials, realistic shoes and "
  "correct anatomy, soft contact shadows on the floor. Every person wears proper closed "
  "business shoes on both feet — never bare feet, never visible toes, never socks without "
  "shoes. No duplicated legs, no railing or parapet, no text, no watermark."
)

# Abschnitte ohne Personen: dort erfindet das Modell sonst Geisterstuehle und
# abgeschnittene Beine in die leere Flaeche.
LEER = {"og3_l_1", "og3_r_1", "og3_r_6", "og2_l_1", "og2_l_7", "og2_r_1", "og2_r_6"}

PROMPT_LEER = (
  "Local photo retouch only. In the transparent area, continue the empty light polished "
  "concrete floor of this room down to the pale concrete slab edge already visible just "
  "below the transparent area. Nobody stands or sits here: no people, no legs, no shoes, "
  "no chairs, no furniture of any kind — only the bare, clean floor with soft daylight and "
  "a faint reflection. "
  "Keep the exact same camera, framing and crop — do not zoom out, do not reframe, and do "
  "not change anything outside the transparent area. Photorealistic, matching daylight, "
  "colours and materials. No text, no watermark."
)

MODELL = os.environ.get("IMAGE_MODEL", "gpt-image-1.5")


def edit(client, bild, maske, prompt, versuche=4):
    """Inpainting mit hoher Eingabetreue (input_fidelity), damit die unmaskierten
    Pixel und der Bildausschnitt erhalten bleiben."""
    import base64
    import io
    import time
    for v in range(versuche):
        try:
            pb, pm = io.BytesIO(), io.BytesIO()
            bild.save(pb, format="PNG"); pb.name = "bild.png"; pb.seek(0)
            maske.save(pm, format="PNG"); pm.name = "maske.png"; pm.seek(0)
            r = client.images.edit(model=MODELL, image=pb, mask=pm, prompt=prompt,
                                   size="1024x1024", quality="high", input_fidelity="high")
            return Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
        except Exception as e:
            print("  retry", v + 1, str(e)[:160], flush=True)
            time.sleep(10 * (v + 1))
    raise SystemExit("Bildmodell gibt nicht nach " + str(versuche) + " Versuchen")


# ── Nachbesserungen ──────────────────────────────────────────────────────────
# Einzelne Stellen, die das Bildmodell im Streifen nicht sauber loest. Hier wird
# wie bei personen_retusche.py mit einer kleinen, kompakten Maske gearbeitet —
# damit trifft gpt-image zuverlaessiger als ueber einen breiten Streifen.
NACHBESSERN = {
    "fuesse_og3_l": ((1390, 1205, 1525, 1300),
                     "the bare feet of the woman seated at the conference table"),
    "fuesse_og2_l": ((1655, 2035, 1835, 2140),
                     "the bare feet of the person seated in the middle office chair"),
}

PROMPT_FUESSE = (
  "Local photo retouch only. In the transparent area, replace {was} with dark leather "
  "business shoes, one on each foot, standing flat on the concrete floor with a soft "
  "contact shadow. Keep the trousers, the chair, the floor and everything else exactly as "
  "it is, and keep the exact same camera, framing and crop. Photorealistic, matching "
  "daylight and materials. No bare skin below the trousers, no visible toes, no extra feet."
)


def nachbessern(client, im):
    """Kleine Korrekturen auf dem bereits montierten Bild."""
    for name, (box, was) in NACHBESSERN.items():
        p = os.path.join(KACHELN, name + ".png")
        cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
        f = (max(0, min(cx - KACHEL // 2, im.width - KACHEL)),
             max(0, min(cy - KACHEL // 2, im.height - KACHEL)))
        f = (f[0], f[1], f[0] + KACHEL, f[1] + KACHEL)
        ausschnitt = im.crop(f)
        m = Image.new("L", (KACHEL, KACHEL), 255)
        ImageDraw.Draw(m).rounded_rectangle(
            (box[0] - f[0] - 14, box[1] - f[1] - 14, box[2] - f[0] + 14, box[3] - f[1] + 14),
            radius=16, fill=0)
        rgba = Image.new("RGBA", (KACHEL, KACHEL), (0, 0, 0, 255))
        rgba.putalpha(m)
        if not os.path.exists(p):
            print(name, "→ Bildmodell", flush=True)
            edit(client, ausschnitt, rgba, PROMPT_FUESSE.format(was=was)).save(p)
        tile, sc, abw = ausrichten(ausschnitt, Image.open(p).convert("RGB"), m)
        alpha = Image.eval(m, lambda v: 255 - v).filter(ImageFilter.GaussianBlur(10))
        im.paste(Image.composite(tile, ausschnitt, alpha), f[:2])
        print(name, f"nachgebessert (skalierung={sc:.3f}, abweichung={abw:.1f})", flush=True)
    return im


def abschnitte(zone):
    """(name, maske_von, maske_bis, beitrag_von, beitrag_bis) je Kachel einer Zone.

    `maske_*` ist der neu gerechnete Bereich (mit Naht-Ueberlappung), `beitrag_*`
    der Teil, den diese Kachel spaeter tatsaechlich ins Bild liefert."""
    cfg = ZONEN[zone]
    x0, x1 = cfg["x"]
    grenzen = [x0] + list(cfg["naehte"]) + [x1]
    for i, (a, b) in enumerate(zip(grenzen, grenzen[1:])):
        mv = a - NAHT if a > x0 else a
        mb = b + NAHT if b < x1 else b
        yield f"{zone}_{i + 1}", mv, mb, a, b


def fenster_fuer(zone, mv, mb, bildbreite=6144):
    """Kachelfenster (x0, y0, x1, y1): quadratisch, um den Maskenabschnitt zentriert,
    sodass links und rechts mindestens MINRAND Originalpixel stehen bleiben."""
    y0, y1 = ZONEN[zone]["y"]
    if mb - mv > KACHEL - 2 * MINRAND:
        raise SystemExit(f"{zone}: Abschnitt {mv}..{mb} zu breit fuer eine Kachel")
    fx0 = int(round((mv + mb) / 2 - KACHEL / 2))
    fx0 = max(0, min(fx0, bildbreite - KACHEL))
    fy1 = y1 + MINRAND                 # auch unter dem Streifen echter Originalrand,
    return (fx0, fy1 - KACHEL, fx0 + KACHEL, fy1)   # sonst zoomt das Modell heraus


def stirn_streifen(zone, im):
    """Die Betonstirn dieser Etage nach unten kopiert, als Bild in Originalgroesse
    plus Alpha (weiche Oberkante). Gibt (Streifenbild, Alpha, y_oben) zurueck."""
    (qy0, qy1), zy0 = ZONEN[zone]["stirn"]
    x0, x1 = ZONEN[zone]["x"]
    streifen = im.crop((x0, qy0, x1, qy1))
    h = qy1 - qy0
    alpha = Image.new("L", (x1 - x0, h), 255)
    d = ImageDraw.Draw(alpha)
    for i in range(WEICH):                       # Oberkante weich einblenden
        d.line((0, i, x1 - x0, i), fill=int(255 * i / WEICH))
    return streifen, alpha, zy0


def vorbereiten(im, zone=None):
    """Bild mit eingesetzter Betonstirn — Grundlage fuer Inpainting UND Montage."""
    out = im.copy()
    for z in ([zone] if zone else ZONEN):
        streifen, alpha, zy0 = stirn_streifen(z, im)
        out.paste(streifen, (ZONEN[z]["x"][0], zy0), alpha)
    return out


def maske_fuer(zone, mv, mb, fenster):
    """RGBA-Maske (transparent = neu rechnen) und die Graustufen-Fassung."""
    y0, y1 = ZONEN[zone]["y"]
    fx0, fy0 = fenster[0], fenster[1]
    m = Image.new("L", (KACHEL, KACHEL), 255)
    ImageDraw.Draw(m).rounded_rectangle(
        (mv - fx0, y0 - fy0, mb - fx0, y1 - fy0), radius=18, fill=0)
    rgba = Image.new("RGBA", (KACHEL, KACHEL), (0, 0, 0, 255))
    rgba.putalpha(m)
    return rgba, m


def ring_fuer(maske, weite=140):
    """Der Streifen unmittelbar ueber der Maske — dort sitzt die Naht.

    Nur hier muss die Kachel das Original wirklich treffen. Seitlich und unterhalb
    zeichnet gpt-image regelmaessig mit (es fuehrt den neuen Boden ueber die Maske
    hinaus weiter und setzt die Betonstirn neu); das ist fuer das Ergebnis egal,
    weil montiert nur der Maskenbereich wird, wuerde die Messung aber unbrauchbar
    machen."""
    frei = np.asarray(maske) > 128
    belegt = ~frei
    zeilen = np.where(belegt.any(axis=1))[0]
    spalten = np.where(belegt.any(axis=0))[0]
    if not len(zeilen) or not len(spalten):
        return frei
    kasten = np.zeros_like(frei)
    kasten[max(0, zeilen.min() - weite):zeilen.min(),
           max(0, spalten.min() - 40):spalten.max() + 40] = True
    return frei & kasten


def treue(original, tile, maske):
    """Mittlere Abweichung (0..255) im Saum um die Maske. Misst direkt, ob die Kachel
    die unveraenderten Bildteile reproduziert — verlaesslicher als die Inlier-Zahl,
    die in strukturarmen Flaechen (leerer Boden, Wand) einbricht."""
    a = np.asarray(original.convert("L"), dtype=np.float32)
    b = np.asarray(tile.convert("L"), dtype=np.float32)
    r = ring_fuer(maske)
    if not r.any():
        return 0.0
    return float(np.abs(a[r] - b[r]).mean())


def ausrichten(original, tile, maske):
    """Kachel per ORB/RANSAC auf das Original entzerren (nur ausserhalb der Maske
    gematcht) und die bessere der beiden Fassungen zurueckgeben.
    Rueckgabe: (Kachel, Skalierung, mittlere Abweichung)."""
    import cv2
    a = np.asarray(original.convert("L"))
    b = np.asarray(tile.convert("L"))
    m = np.asarray(maske)
    roh = treue(original, tile, maske)
    orb = cv2.ORB_create(6000)
    ka, da = orb.detectAndCompute(a, m)
    kb, db = orb.detectAndCompute(b, m)
    if da is None or db is None or len(ka) < 12 or len(kb) < 12:
        return tile, 1.0, roh
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    ms = sorted(bf.match(da, db), key=lambda x: x.distance)[:800]
    if len(ms) < 12:
        return tile, 1.0, roh
    pa = np.float32([ka[x.queryIdx].pt for x in ms])
    pb = np.float32([kb[x.trainIdx].pt for x in ms])
    M, inl = cv2.estimateAffinePartial2D(pb, pa, method=cv2.RANSAC, ransacReprojThreshold=3.0)
    if M is None:
        return tile, 1.0, roh
    sc = float(np.hypot(M[0, 0], M[0, 1]))
    if not 0.9 <= sc <= 1.3:
        return tile, sc, roh
    arr = np.asarray(tile.convert("RGB"))
    out = Image.fromarray(cv2.warpAffine(arr, M, (arr.shape[1], arr.shape[0]),
                                         flags=cv2.INTER_LANCZOS4,
                                         borderMode=cv2.BORDER_REFLECT))
    gerade = treue(original, out, maske)
    if gerade <= roh:
        return out, sc, gerade
    return tile, 1.0, roh


def brauchbar(sc, abweichung):
    """Kachel gilt als echtes Inpainting statt neu erfundener Komposition.

    Massgeblich ist die Skalierung: erfindet gpt-image die Szene neu, kommt sie
    deutlich herausgezoomt zurueck (1.2 bis 1.9). Die Abweichung im Nahtstreifen
    ist nur ein Hinweis — gpt-image zeichnet das ganze Bild neu, auch ausserhalb
    der Maske, sodass selbst einwandfreie Kacheln dort um 10 bis 30 abweichen."""
    return 0.95 <= sc <= 1.18 and abweichung < 60


def alle():
    for zone in ZONEN:
        for name, mv, mb, bv, bb in abschnitte(zone):
            yield name, zone, mv, mb, bv, bb


def overlay():
    im = Image.open(QUELLE).convert("RGB")
    d = ImageDraw.Draw(im)
    for name, zone, mv, mb, bv, bb in alle():
        f = fenster_fuer(zone, mv, mb)
        y0, y1 = ZONEN[zone]["y"]
        d.rectangle(f, outline=(0, 160, 255), width=4)
        d.rectangle((mv, y0, mb, y1), outline=(255, 0, 0), width=6)
        d.line((bv, y0 - 120, bv, y1 + 120), fill=(255, 220, 0), width=6)
        d.text((f[0] + 12, f[1] + 12), name, fill=(0, 200, 255))
    p = os.path.join(ZIEL, "boden_overlay.jpg")
    im.resize((3072, 2048)).save(p, quality=85)
    print("overlay:", p)


def montieren():
    basis = vorbereiten(Image.open(QUELLE).convert("RGB"))
    im = basis.copy()   # Ausrichtung immer gegen die unveraenderte Basis messen,
                        # nicht gegen schon einmontierte Nachbarkacheln
    for name, zone, mv, mb, bv, bb in alle():
        p = os.path.join(KACHELN, name + ".png")
        if not os.path.exists(p):
            print(name, "fehlt")
            continue
        f = fenster_fuer(zone, mv, mb)
        _, m = maske_fuer(zone, mv, mb, f)
        tile, sc, abw = ausrichten(basis.crop(f), Image.open(p).convert("RGB"), m)
        if not brauchbar(sc, abw):
            print(name, f"WARNUNG: verdaechtige Kachel (skalierung={sc:.3f}, abweichung={abw:.1f})")
        alpha = Image.eval(m, lambda v: 255 - v).filter(ImageFilter.GaussianBlur(WEICH))
        beitrag = Image.new("L", (KACHEL, KACHEL), 0)
        ImageDraw.Draw(beitrag).rectangle((bv - f[0], 0, bb - f[0], KACHEL), fill=255)
        beitrag = beitrag.filter(ImageFilter.GaussianBlur(NAHT / 2))
        alpha = Image.fromarray(
            (np.asarray(alpha, dtype=float) * np.asarray(beitrag, dtype=float) / 255
             ).astype("uint8"))
        im.paste(Image.composite(tile, im.crop(f), alpha), f[:2])
        print(name, f"montiert (skalierung={sc:.3f}, abweichung={abw:.1f})")
    if all(os.path.exists(os.path.join(KACHELN, n + ".png")) for n in NACHBESSERN):
        im = nachbessern(None, im)
    ziel = os.path.join(ZIEL, "Strukturbild_boden.jpg")
    im.save(ziel, quality=95, subsampling=0)
    print("fertig:", ziel)
    vergleiche(im)
    return im


def vergleiche(im):
    """Vorher/Nachher-Streifen je Etage fuer die Abnahme."""
    orig = Image.open(QUELLE).convert("RGB")
    for zone, cfg in ZONEN.items():
        y0, y1 = cfg["y"]
        x0, x1 = cfg["x"]
        c = (x0, y0 - 220, x1, y1 + 90)
        b = 1800
        s = b / (x1 - x0)
        h = int((c[3] - c[1]) * s)
        out = Image.new("RGB", (b, 2 * h + 8), (20, 20, 20))
        out.paste(orig.crop(c).resize((b, h)), (0, 0))
        out.paste(im.crop(c).resize((b, h)), (0, h + 8))
        out.save(os.path.join(ZIEL, f"boden_vergleich_{zone}.jpg"), quality=88)
    print("vergleiche: boden_vergleich_*.jpg")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--overlay", action="store_true")
    ap.add_argument("--montage", action="store_true", help="nur neu montieren")
    ap.add_argument("--nur", nargs="*")
    ap.add_argument("--neu", action="store_true", help="vorhandene Kacheln ignorieren")
    ap.add_argument("--versuche", type=int, default=3)
    ap.add_argument("--parallel", type=int, default=4)
    ap.add_argument("--fuesse", action="store_true", help="nur die Nachbesserungen neu rechnen")
    a = ap.parse_args()
    if a.overlay:
        return overlay()
    if a.montage:
        return montieren()
    lade_key()
    from openai import OpenAI
    client = OpenAI()
    if a.fuesse:
        auftraege = []
    quelle = vorbereiten(Image.open(QUELLE).convert("RGB"))
    auftraege = [t for t in alle() if not a.nur or t[0] in a.nur]

    def bauen(auftrag):
        name, zone, mv, mb, bv, bb = auftrag
        p = os.path.join(KACHELN, name + ".png")
        if os.path.exists(p) and not a.neu:
            return name, "vorhanden"
        f = fenster_fuer(zone, mv, mb)
        ausschnitt = quelle.crop(f)
        maske, m = maske_fuer(zone, mv, mb, f)
        prompt = PROMPT_LEER if name in LEER else PROMPT.format(was=ZONEN[zone]["was"])
        bester = None
        for versuch in range(max(1, a.versuche)):
            print(name, f"→ Bildmodell (Versuch {versuch + 1})", flush=True)
            neu = edit(client, ausschnitt, maske, prompt)
            _, sc, abw = ausrichten(ausschnitt, neu, m)
            gut = brauchbar(sc, abw)
            print(f"{name} skalierung={sc:.3f} abweichung={abw:.1f}"
                  f"{'' if gut else '  <-- verworfen'}", flush=True)
            if bester is None or (gut, -abw) > (bester[0], -bester[1]):
                bester = (gut, abw, neu)
            if gut:
                break
        bester[2].save(p)
        return name, f"neu ({'ok' if bester[0] else 'unsicher'}, abweichung={bester[1]:.1f})"

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max(1, a.parallel)) as ex:
        for name, status in ex.map(bauen, auftraege):
            print(name, "kachel", status, flush=True)
    if a.fuesse:
        for n in NACHBESSERN:                    # Nachbesserungen setzen auf dem
            pf = os.path.join(KACHELN, n + ".png")   # fertig montierten Bild auf
            if os.path.exists(pf):
                os.remove(pf)
        nachbessern(client, montieren())
    montieren()


if __name__ == "__main__":
    main()
