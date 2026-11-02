#!/usr/bin/env python3
"""Montage der siebten Fassung: Kling-Takes, direkt von Still zu Still.

Jeder Raumwechsel besteht aus zwei Takes (A: Handlung bis zum Anker,
B: Kamerafahrt vom Anker in die Endeinstellung), die am identischen
Ankerbild geschnitten werden. Innerhalb eines Uebergangs gibt es deshalb
zwei Bildschirm-Spuren: die ABGEHENDE Flaeche im ersten Segment (steht auf
ihrem Endzustand) und die ANKOMMENDE in allen spaeteren Segmenten (endet
exakt fertig). Das ist der Modus "raum". Der Modus "blende" ist der alte:
dieselbe Flaeche das ganze Stueck, die Oberflaeche wechselt in der Mitte
per Ueberblendung (Schreibtisch-Szenen, Kacheltraeger).

Keying wie gehabt und im Pruefplan dokumentiert: leerer Rotkanal,
Fragment-Vereinigung, Quantil-Huelle + Savitzky-Golay je Segment,
Chroma ausserhalb der Stanzflaeche wird dunkles Glas.
"""
import os
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
from PIL import Image
from scipy import ndimage, signal

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import handyglas  # noqa: E402
import kacheln  # noqa: E402
import keyen  # noqa: E402

S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                              "4a027885-72f4-58d1-b5d9-f5090d47fbf4/scratchpad")
FF = imageio_ffmpeg.get_ffmpeg_exe()
IMG = os.path.normpath(f"{HIER}/../public/images/operations-v07")
OUT = os.path.normpath(f"{HIER}/../public/videos/operations-v07")
VEO = f"{S}/kling_v07"
FPS = 24
# Mindestzahl Frames, in denen die Oberflaeche aufwachen darf (~1,5 s).
MINDEST_AUFWACHEN = 36
# Frames, in denen die fertige Oberflaeche vor der Schlussblende steht.
ENDPUFFER = 15
# Gruene Quelle des ZIELstandbilds je Uebergang. Aus ihr wird der Kasten
# gemessen, mit dem auch das Standbild gestanzt wurde — in der Ruhephase
# stanzt die Montage in EXAKT denselben Kasten, sonst zeigt die
# Schlussblende zwei leicht versetzte Oberflaechen (Doppelbild).
ZIELQUELLE = {
    "s0-s1": "buero_gruen", "s3-s4": "besprechung_gruen", "s4-s5": "kabine_gruen",
    "s6-s7": "g_s7", "s7-s8": "g_s8",
}
KOPF, SCHWANZ, HALTEN = 0.45, 0.50, 0.10
ENC = ["-c:v", "libx264", "-preset", "slow", "-crf", "21", "-maxrate", "4500k",
       "-bufsize", "9000k", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart"]
os.makedirs(OUT, exist_ok=True)


def lauf(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-800:])


def frames(pfad):
    leser = imageio_ffmpeg.read_frames(pfad)
    meta = leser.__next__()
    w, h = meta["size"]
    fr = [np.frombuffer(f, dtype=np.uint8).reshape(h, w, 3) for f in leser]
    if (w, h) != (1920, 1080):
        fr = [np.asarray(Image.fromarray(a).resize((1920, 1080), Image.LANCZOS)) for a in fr]
    return fr


def ui_frames(name):
    ordner = f"{S}/ui/f_{name}"
    return [Image.open(os.path.join(ordner, f)).convert("RGB")
            for f in sorted(os.listdir(ordner)) if f.endswith(".png")]


def chroma_streng(a):
    r, g, b = a[..., 0].astype(np.int16), a[..., 1].astype(np.int16), a[..., 2].astype(np.int16)
    return (r < 40) & (g > 50) & (g - r > 45) & (g - b > 25)


def schirmflaechen(arr, mindest=1500):
    m = chroma_streng(arr)
    lab, n = ndimage.label(m)
    if not n:
        return []
    flaechen = ndimage.sum(m, lab, range(1, n + 1))
    kaesten = ndimage.find_objects(lab)
    erg = []
    for i, fl in enumerate(flaechen):
        if fl < mindest:
            continue
        sy, sx = kaesten[i]
        erg.append((int(fl), (sx.start, sy.start, sx.stop, sy.stop)))
    erg.sort(reverse=True)
    return [k for _fl, k in erg]


def wachsen(arr, kasten):
    """Strengen Kasten auf ANGRENZENDES helles Chroma erweitern.

    Die strenge Regel findet zuverlaessig nur dunkles Chroma; ueberstrahlte
    Bereiche derselben Flaeche fallen durch (Wanddisplay: dunkle Haelfte
    erkannt, grelle Haelfte nicht). Deshalb: tolerante Maske bilden, aber nur
    jene Zusammenhangsgebiete uebernehmen, die den strengen Kasten wirklich
    beruehren — Pflanzen und anderes Gruen im Raum bleiben damit draussen.
    """
    if not kasten:
        return kasten
    weit = chroma_weit(arr)
    lab, n = ndimage.label(weit)
    if not n:
        return kasten
    x0, y0, x1, y1 = kasten
    innen = lab[max(0, y0):min(1080, y1), max(0, x0):min(1920, x1)]
    treffer = np.unique(innen[innen > 0])
    if not treffer.size:
        return kasten
    stuecke = ndimage.find_objects(lab)
    groessen = ndimage.sum(weit, lab, range(1, n + 1))
    for nr in treffer:
        sy, sx = stuecke[nr - 1]
        x0, y0 = min(x0, sx.start), min(y0, sy.start)
        x1, y1 = max(x1, sx.stop), max(y1, sy.stop)
    # Ein Kopf vor der Flaeche teilt sie in zwei Stuecke — das abgetrennte
    # beruehrt den Kasten nicht mehr. Deshalb nahe, ausreichend grosse
    # Stuecke anschliessen, bis nichts mehr dazukommt (Bruecke 40 px).
    offen = True
    while offen:
        offen = False
        for nr in range(1, n + 1):
            if groessen[nr - 1] < 300:
                continue
            sy, sx = stuecke[nr - 1]
            if sx.start > x1 + 40 or sx.stop < x0 - 40:
                continue
            if sy.start > y1 + 40 or sy.stop < y0 - 40:
                continue
            if sx.start >= x0 and sx.stop <= x1 and sy.start >= y0 and sy.stop <= y1:
                continue
            x0, y0 = min(x0, sx.start), min(y0, sy.start)
            x1, y1 = max(x1, sx.stop), max(y1, sy.stop)
            offen = True
    return (x0, y0, x1, y1)


def vereinigen(kaesten):
    offen = list(kaesten)
    erg = []
    while offen:
        x0, y0, x1, y1 = offen.pop(0)
        geaendert = True
        while geaendert:
            geaendert = False
            rest = []
            for k in offen:
                if k[0] < x1 + 60 and k[2] > x0 - 60 and k[1] < y1 + 60 and k[3] > y0 - 60:
                    x0, y0 = min(x0, k[0]), min(y0, k[1])
                    x1, y1 = max(x1, k[2]), max(y1, k[3])
                    geaendert = True
                else:
                    rest.append(k)
            offen = rest
        erg.append((x0, y0, x1, y1))
    erg.sort(key=lambda k: (k[2] - k[0]) * (k[3] - k[1]), reverse=True)
    return erg


def glaetten(kaesten, huelle=25, fenster=21, rand=9):
    gueltig = [k for k in kaesten if k]
    if not gueltig:
        return list(kaesten)
    voll, letzter = [], gueltig[0]
    for k in kaesten:
        letzter = k or letzter
        voll.append(letzter)
    a = np.array(voll, dtype=float)
    w = min(huelle, len(a))
    for sp, q in ((0, 10), (1, 10), (2, 90), (3, 90)):
        a[:, sp] = ndimage.percentile_filter(a[:, sp], q, size=w, mode="nearest")
    f = min(fenster, len(a) - (1 - len(a) % 2))
    if f >= 5:
        a = signal.savgol_filter(a, f, 2, axis=0, mode="interp")
    a[:, 0] -= rand
    a[:, 1] -= rand
    a[:, 2] += rand
    a[:, 3] += rand
    a[:, 0::2] = np.clip(a[:, 0::2], 0, 1920)
    a[:, 1::2] = np.clip(a[:, 1::2], 0, 1080)
    return [tuple(int(round(v)) for v in z) for z in a]


def chroma_weit(a):
    """Tolerant: erfasst auch HELLES, ausgewaschenes Chroma.

    Die strenge Regel (leerer Rotkanal) haelt UI-Gruen und Pflanzen draußen,
    verfehlt aber ueberstrahltes Studio-Gruen, wie es auf grossen Flaechen
    vorkommt (Wanddisplay im Teamraum: halb dunkel, halb grellgruen — der
    helle Teil blieb stehen). Innerhalb des bekannten Schirmkastens darf die
    Regel deshalb weit sein: dort gibt es nichts Gruenes ausser dem Chroma.
    """
    r, g, b = a[..., 0].astype(np.int16), a[..., 1].astype(np.int16), a[..., 2].astype(np.int16)
    return (g - r > 25) & (g - b > 18) & (g > 60)


def abdunkeln(arr, schutz=None, kasten=None):
    m = chroma_streng(arr)
    if kasten is not None:
        innen = np.zeros(m.shape, dtype=bool)
        innen[max(0, kasten[1]):min(1080, kasten[3]),
              max(0, kasten[0]):min(1920, kasten[2])] = True
        m = m | (chroma_weit(arr) & innen)
    if schutz is not None:
        m = m & ~schutz
    if not m.any():
        return arr
    m = ndimage.binary_dilation(m, iterations=2)
    a = arr.astype(np.int16)
    mittel = (a[..., 0] + a[..., 2]) // 2
    a[..., 1][m] = np.minimum(a[..., 1][m], mittel[m])
    for c in range(3):
        a[..., c][m] = (a[..., c][m] * 0.30).astype(np.int16) + 16
    return a.astype(np.uint8).copy()


def hauptspur(roh):
    """Geglaettete Hauptflaeche + Segmentnummer je Frame (fuer Modus 'raum')."""
    roh_kaesten = []
    for a in roh:
        fl = vereinigen(schirmflaechen(a))
        roh_kaesten.append(wachsen(a, fl[0]) if fl else None)
    n = len(roh)
    kaesten, seg = [None] * n, [None] * n
    stuecke, start, vorher = [], None, None
    for i, k in enumerate(roh_kaesten):
        if k is None:
            continue
        if start is None:
            start = i
        else:
            v = roh_kaesten[vorher]
            if abs((k[0] + k[2]) / 2 - (v[0] + v[2]) / 2) > 280 or \
               abs((k[1] + k[3]) / 2 - (v[1] + v[3]) / 2) > 220:
                stuecke.append((start, vorher))
                start = i
        vorher = i
    if start is not None:
        stuecke.append((start, vorher))
    if stuecke:
        erster, letzter_idx = stuecke[0][0], stuecke[-1][1]
        nr = 0
        for a0, a1 in stuecke:
            am_rand = a0 == erster or a1 == letzter_idx
            if a1 - a0 < (4 if am_rand else 30):
                continue
            kaesten[a0:a1 + 1] = glaetten(roh_kaesten[a0:a1 + 1])
            for j in range(a0, a1 + 1):
                seg[j] = nr
            nr += 1
    return kaesten, seg


def schreiben(ziel):
    return subprocess.Popen(
        [FF, "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1920x1080",
         "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "fast", "-crf", "16",
         "-pix_fmt", "yuv420p", "-an", "-y", ziel], stdin=subprocess.PIPE)


def kasten_gefuellt(kaesten):
    """Kastenspur ohne Luecken: fehlende Frames erben den naechsten Kasten.

    Wo die Verfolgung keinen Kasten hat (Kamera in Fahrt, Flaeche angeschnitten),
    darf die Abdunkelung trotzdem tolerant sein — sonst bleibt ein Streifen
    hellen Chromas stehen (Teamraum, Nutzerbefund 20.08.).
    """
    n = len(kaesten)
    erg = list(kaesten)
    letzter = None
    for i in range(n):
        if erg[i]:
            letzter = erg[i]
        elif letzter:
            erg[i] = letzter
    naechster = None
    for i in range(n - 1, -1, -1):
        if kaesten[i]:
            naechster = kaesten[i]
        elif naechster and not erg[i]:
            erg[i] = naechster
    return erg


def zielkasten(name):
    """Kasten des Zielstandbilds — dieselbe Messung wie beim Stanzen."""
    for basis in (f"{HIER}/quellen_v07", f"{HIER}/quellen"):
        pfad = f"{basis}/{name}.png"
        if os.path.exists(pfad):
            a = np.asarray(Image.open(pfad).convert("RGB"))
            return keyen.kasten(keyen.maske(a))
    return None


def ruhepunkte(kaesten, toleranz=7):
    """Erster und letzter Frame, in dem die Kamera STEHT.

    Zurueck kommt (bis_anfang, ab_ende): bis einschliesslich bis_anfang ist der
    Kasten praktisch identisch mit dem ersten gueltigen; ab ab_ende bleibt er
    bis zum Schluss stehen. Dazwischen faehrt die Kamera — und genau dort wird
    der Bildschirm dunkel gehalten, weil eine achsenparallel gestanzte
    Oberflaeche der Perspektive nicht folgen kann (Nutzerbefund 20.08.).
    """
    gueltig = [(i, k) for i, k in enumerate(kaesten) if k]
    if not gueltig:
        return -1, len(kaesten)
    still = lambda a, b: max(abs(a[j] - b[j]) for j in range(4)) <= toleranz
    bis_anfang, erster = -1, gueltig[0][1]
    for i, k in gueltig:
        if not still(k, erster):
            break
        bis_anfang = i
    ab_ende, letzter = gueltig[-1][0], gueltig[-1][1]
    for i, k in reversed(gueltig):
        if not still(k, letzter):
            break
        ab_ende = i
    return bis_anfang, ab_ende


def bauen(ziel, quelle, von, nach, sonder=None, modus="blende", grenze=None, zielname=None):
    """Aufnahme keyen.

    modus "blende": eine Flaeche, Oberflaechenwechsel per Ueberblendung mittig.
    modus "raum":   waehrend der Kamerafahrt bleibt der Bildschirm DUNKEL.
                    Solange die Kamera am Anfang noch steht, traegt er die
                    abgehende Oberflaeche; sobald sie am Ziel zur Ruhe kommt,
                    wacht die ankommende auf und ist am letzten Frame fertig.
    grenze (Anteil 0..1, nur "raum"): haelt die Kamera den ankommenden Schirm
    an derselben Bildposition wie den abgehenden, sieht die Segmentierung
    keinen Sprung (ein Track, s7-s8). Die Kette kennt ihren Uebergabezeitpunkt
    aber choreografisch — ab dieser Marke traegt der Track die ankommende
    Flaeche, unabhaengig von der Segmentnummer.
    """
    roh = frames(quelle)
    n = len(roh)
    kaesten, seg = hauptspur(roh)
    uiv = ui_frames(von) if von else None
    uin = ui_frames(nach) if nach else None
    wechsel, blende = int(n * 0.45), int(FPS * 0.6)
    # Fahrt-Fenster: davor/danach steht die Kamera.
    weit = kasten_gefuellt(kaesten)
    steht_bis, steht_ab = ruhepunkte(kaesten)
    fest = zielkasten(zielname) if zielname else None
    if modus == "raum":
        # Der Aufwach-Vorgang braucht Zeit; notfalls faengt er frueher an.
        steht_ab = min(steht_ab, n - 1 - MINDEST_AUFWACHEN)
        if grenze is not None:
            steht_bis = min(steht_bis, int(grenze * n))
        print(f"  {os.path.basename(ziel)}: Kamera steht bis F{steht_bis}, "
              f"wieder ab F{steht_ab} von {n}", flush=True)

    p = schreiben(ziel)
    for i, a in enumerate(roh):
        bild = Image.fromarray(a)
        m = keyen.maske(a)
        k = kaesten[i]
        if fest is not None and modus == "raum" and i >= steht_ab:
            k = fest
        if k and (uiv or uin):
            schutz = np.zeros(m.shape, dtype=bool)
            schutz[max(0, k[1]):min(1080, k[3]), max(0, k[0]):min(1920, k[2])] = True
            a = abdunkeln(a, schutz)
            m = keyen.maske(a)
            f_von = uiv[-1] if uiv else None
            f_nach = uin[max(0, len(uin) - 1 - (n - 1 - i))] if uin else None
            if modus == "raum":
                if i <= steht_bis and f_von is not None:
                    ui = f_von                      # Kamera steht noch: alte Flaeche
                elif i >= steht_ab and uin:
                    # Aufwachen: die Oberflaeche baut sich auf und STEHT
                    # fertig, BEVOR das Standbild einblendet — sonst mischt
                    # der Schwanz zwei verschiedene Aufbaustaende und man
                    # sieht ein Doppelbild (Nutzerbefund am Werkraum).
                    ziel_f = max(steht_ab + 1, n - 1 - ENDPUFFER)
                    lauf = min(1.0, (i - steht_ab) / max(1, ziel_f - steht_ab))
                    ui = uin[min(len(uin) - 1, round(lauf * (len(uin) - 1)))]
                else:
                    ui = None                       # Fahrt: Schirm bleibt dunkel
            else:
                t = min(1.0, max(0.0, (i - wechsel) / max(1, blende)))
                if f_von is None:
                    ui = f_nach
                elif f_nach is None or t <= 0:
                    ui = f_von
                elif t >= 1:
                    ui = f_nach
                else:
                    ui = Image.blend(f_von, f_nach.resize(f_von.size), t)
            # Ohne Oberflaeche wird die Flaeche NICHT geschuetzt, sondern
            # mit abgedunkelt — sonst bliebe der Schirm gruen statt dunkel.
            bild = (keyen.stanzen(a, ui, k, m) if ui is not None
                    else Image.fromarray(abdunkeln(roh[i], kasten=wachsen(roh[i], weit[i] or k))))
        elif uiv or uin:
            bild = Image.fromarray(abdunkeln(a, kasten=wachsen(a, weit[i])))
        if sonder:
            fort = i / max(1, n - 1)
            z = fort * 12 if sonder == "rein" else 9 - fort * 22
            z = max(0.0, min(9.0, z))
            sicht = int(np.ceil(z))
            teil = min(1.0, max(0.0, z - (sicht - 1)))
            if sicht > 0:
                bild = kacheln.legen(bild, sicht, teil)
        p.stdin.write(np.asarray(bild, dtype=np.uint8).tobytes())
    p.stdin.close()
    p.wait()
    return ziel


def norm(name, dauer=None, ab=None):
    """Take auf 1920x1080/24 normieren (Zwischenformat der Ketten);
    dauer schneidet das Ende ab, ab den Anfang (Ellipsen-Teile)."""
    kurz = name + (f"_{dauer}" if dauer else "") + (f"_ab{ab}" if ab else "")
    t = f"{S}/roh7_t_{kurz}.mp4"
    if not os.path.exists(t):
        schnitt = (["-ss", str(ab)] if ab else []) + (["-t", str(dauer)] if dauer else [])
        lauf([FF, "-v", "error", *schnitt, "-i", f"{VEO}/{name}.mp4",
              "-vf", "scale=1920:1080:flags=lanczos,fps=24", "-vsync", "cfr",
              "-c:v", "libx264", "-preset", "fast", "-crf", "16",
              "-pix_fmt", "yuv420p", "-an", "-y", t])
    return t


def kette(name, teile, fade=0.2):
    """Takes verketten. Teile sind Namen oder (Name, Dauer)-Paare; an einem
    gemeinsamen Ankerbild genuegt die kurze Blende, ein bewusster
    Ellipsen-Schnitt (Stockwerkswechsel) traegt sie ebenso."""
    ziel = f"{S}/roh7_{name}.mp4"
    if os.path.exists(ziel):
        return ziel
    pfade = [norm(*t) if isinstance(t, tuple) else norm(t) for t in teile]
    if len(pfade) == 1:
        return pfade[0]
    dauern = [imageio_ffmpeg.read_frames(p).__next__()["duration"] for p in pfade]
    ein = [FF, "-v", "error"]
    for p in pfade:
        ein += ["-i", p]
    filt, offset, vorig = "", 0.0, "[0:v]"
    for i in range(1, len(pfade)):
        offset = round(offset + dauern[i - 1] - fade, 3)
        aus = f"[k{i}]" if i < len(pfade) - 1 else "[v]"
        filt += f"{vorig}[{i}:v]xfade=transition=fade:duration={fade}:offset={offset}{aus};"
        vorig = aus
    lauf(ein + ["-filter_complex", filt.rstrip(";"), "-map", "[v]", "-r", "24",
                "-c:v", "libx264", "-preset", "fast", "-crf", "16",
                "-pix_fmt", "yuv420p", "-an", "-y", ziel])
    return ziel


def anschliessen(name, roh, von, nach):
    d = imageio_ffmpeg.read_frames(roh).__next__()["duration"]
    ein = round(d - SCHWANZ - HALTEN, 3)
    filt = (f"[0:v]settb=AVTB,setpts=PTS-STARTPTS[v0];"
            f"[1:v]scale=1920:1080,format=yuva420p,fade=t=out:st=0:d={KOPF}:alpha=1,"
            f"settb=AVTB,setpts=PTS-STARTPTS[kopf];"
            f"[2:v]scale=1920:1080,format=yuva420p,fade=t=in:st={ein}:d={SCHWANZ}:alpha=1,"
            f"settb=AVTB,setpts=PTS-STARTPTS[ende];"
            f"[v0][kopf]overlay=format=auto[a];"
            f"[a][ende]overlay=format=auto:shortest=1,format=yuv420p[v]")
    lauf([FF, "-v", "error", "-i", roh,
          "-loop", "1", "-t", f"{d}", "-i", f"{IMG}/{von}.jpg",
          "-loop", "1", "-t", f"{d}", "-i", f"{IMG}/{nach}.jpg",
          "-filter_complex", filt, "-map", "[v]", "-r", str(FPS), *ENC,
          "-y", f"{OUT}/{name}.mp4"])
    return os.path.getsize(f"{OUT}/{name}.mp4") / 1048576


def glas1_mit_tafel():
    ziel = f"{S}/roh7_glas1.mp4"
    if os.path.exists(ziel):
        return ziel
    roh = frames(f"{VEO}/glas1.mp4")
    n = len(roh)
    seite = Image.open(f"{S}/ui/f_handy/0191.png").convert("RGB")
    p = schreiben(ziel)
    for i, a in enumerate(roh):
        bild = Image.fromarray(a)
        teil = max(0.0, min(1.0, (0.30 - i / max(1, n - 1)) / 0.10))
        if teil > 0:
            bild = handyglas.tafel(bild, seite, teil)
        p.stdin.write(np.asarray(bild, dtype=np.uint8).tobytes())
    p.stdin.close()
    p.wait()
    return ziel


def heimweg():
    """home-s0: Wohnung (mit Tafel) + Glastuer + Check-in."""
    ziel = f"{S}/roh7_home-s0.mp4"
    if os.path.exists(ziel):
        return ziel
    teile = [glas1_mit_tafel(), norm("glas2"), norm("checkin")]
    dauern = [imageio_ffmpeg.read_frames(p).__next__()["duration"] for p in teile]
    b1 = round(dauern[0] - 0.25, 3)
    b2 = round(dauern[0] + dauern[1] - 0.50, 3)
    lauf([FF, "-v", "error", "-i", teile[0], "-i", teile[1], "-i", teile[2],
          "-filter_complex",
          f"[0:v][1:v]xfade=transition=fade:duration=0.25:offset={b1}[a];"
          f"[a][2:v]xfade=transition=fade:duration=0.25:offset={b2}[v]",
          "-map", "[v]", "-r", "24", "-c:v", "libx264", "-preset", "fast", "-crf", "16",
          "-pix_fmt", "yuv420p", "-an", "-y", ziel])
    return ziel


# (Ziel, Quelle(n), von-Oberflaeche, nach-Oberflaeche, sonder, modus)
# Kling blendet nicht — Raumwechsel sind EIN Take; einzige Ellipse: das Dach.
PLAN = [
    ("home-s0", "HEIMWEG",     None,  None,  None,   None),
    ("s0-s1",   ["s0s1"],      None,  "s1",  None,   "raum"),
    ("s1-s2",   ["s1s2"],      "s1",  "s2",  None,   "blende"),
    ("s2-s2b",  ["weit"],      "s2",  "s2",  "rein", "blende"),
    ("s2b-s3",  ["weit"],      "s2",  "s3",  "raus", "blende"),
    ("s3-s4",   ["s3s4"],      "s3",  "s4w", None,   "raum"),
    ("s4-s5",   ["s4s5"],      "s4w", "s5",  None,   "raum"),
    ("s5-s6",   ["s5s6"],      "s5",  "s6",  None,   "blende"),
    ("s6-s7",   ["s6s7"],      "s6",  "s7",  None,   "raum"),
    # Start- und Zielschirm liegen an derselben Bildposition (Ein-Track-
    # Fall wie in v06) — die Grenze sitzt nach der Sichtung des Takes.
    ("s7-s8",   ["s7s8"],      "s7",  "s8",  None,   ("raum", 0.25)),
    ("s8-s9",   ["s8s9"],      "s8",  "s9",  None,   "blende"),
    ("s9-s10",  [("s9s10_a", 3.5), "s9s10_b"], "s9", None, None, "raum"),
]


if __name__ == "__main__":
    nur = set(sys.argv[1:])
    for ziel, quelle, von, nach, sonder, modus in PLAN:
        if nur and ziel not in nur:
            continue
        a, b = ziel.split("-")
        if quelle == "HEIMWEG":
            mb = anschliessen(ziel, heimweg(), a, b)
        else:
            roh = kette(ziel, quelle)
            fertig = f"{S}/roh7_k_{ziel}.mp4"
            if not os.path.exists(fertig):
                if von or nach:
                    modus, grenze = modus if isinstance(modus, tuple) else (modus, None)
                    bauen(fertig, roh, von, nach, sonder=sonder, modus=modus,
                          grenze=grenze, zielname=ZIELQUELLE.get(ziel))
                else:
                    fertig = roh
            mb = anschliessen(ziel, fertig, a, b)
        print(f"{ziel:10s} {mb:4.1f} MB", flush=True)
    print("MONTAGE V07 FERTIG", flush=True)
