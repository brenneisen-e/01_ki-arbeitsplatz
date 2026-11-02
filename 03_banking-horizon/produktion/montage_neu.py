#!/usr/bin/env python3
"""Neuschnitt der vier Uebergaenge, die der Umbau beruehrt.

  home-s0  — DREISCHNITT: Wohnung verlassen (glas1) -> Glastuer in die Halle
             (glas2) -> Check-in durch die Schranke (checkin). Der Check-in
             gehoert damit in den Weg zu Szene 2, und das 07:45-Standbild
             steht HINTER den Schranken.
  s0-s1    — von dort durch die Tuer ins Buero (halle-buero), Oberflaeche s1
             ans Clipende ausgerichtet eingekeyt.
  s2-s2b   — Traeger der Kundenkacheln, neu ohne Flackern: die Blende jeder
             Kachel haengt an EINER stetigen Zahl.
  s2b-s3   — Rueckweg, Kacheln blenden einzeln aus statt zu poppen.

Alle Quellen sind 16:9 — es gibt keine Balkenrechnung mehr; die Aufnahme wird
unbeschnitten verarbeitet. Das Keying arbeitet wie in der Abnahme dokumentiert:
Chroma heisst leerer Rotkanal (nicht Helligkeit), Fragmente hinter Koepfen
werden vereinigt, die Hauptspur wird je Segment geglaettet (Quantil-Huelle
gegen Verdeckung, Savitzky-Golay gegen Zappeln), Chroma ausserhalb der
Stanzflaeche wird dunkles Glas.
"""
import os
import subprocess
import sys

import imageio_ffmpeg
import numpy as np
from PIL import Image
from scipy import ndimage, signal

S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                              "4a027885-72f4-58d1-b5d9-f5090d47fbf4/scratchpad")
sys.path.insert(0, S)
import handyglas  # noqa: E402  (tafel)
import kacheln  # noqa: E402
import keyen  # noqa: E402

FF = imageio_ffmpeg.get_ffmpeg_exe()
HIER = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.normpath(f"{HIER}/../public/images/operations-v04")
OUT = os.path.normpath(f"{HIER}/../public/videos/operations-v04")
VEO = f"{S}/veo_neu5"
FPS = 24
KOPF, SCHWANZ, HALTEN = 0.45, 0.50, 0.10
ENC = ["-c:v", "libx264", "-preset", "slow", "-crf", "21", "-maxrate", "4500k",
       "-bufsize", "9000k", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart"]


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


# ── Chroma-Erkennung (siehe Pruefplan-Defektlog) ─────────────────────────────

def chroma_streng(a):
    """Chroma in jeder Helligkeit: leerer Rotkanal, nicht Helligkeitsschwelle."""
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


def vereinigen(kaesten):
    """Fragmente EINES Schirms (Koepfe davor) zu einem Kasten zusammenfassen."""
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
    """Quantil-Huelle gegen Verdeckung, Savitzky-Golay gegen Zappeln."""
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


def abdunkeln(arr, schutz=None):
    """Chroma ohne Oberflaeche wird dunkles Schirmglas."""
    m = chroma_streng(arr)
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
    """Geglaettete Hauptflaeche je Frame; nur Randsegmente tragen die Seite."""
    roh_kaesten = []
    for a in roh:
        fl = vereinigen(schirmflaechen(a))
        roh_kaesten.append(fl[0] if fl else None)
    n = len(roh)
    kaesten = [None] * n
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
        for a0, a1 in stuecke:
            am_rand = a0 == erster or a1 == letzter_idx
            if a1 - a0 < (4 if am_rand else 30):
                continue
            kaesten[a0:a1 + 1] = glaetten(roh_kaesten[a0:a1 + 1])
    return kaesten


def schreiben(ziel):
    return subprocess.Popen(
        [FF, "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1920x1080",
         "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "fast", "-crf", "16",
         "-pix_fmt", "yuv420p", "-an", "-y", ziel], stdin=subprocess.PIPE)


def bauen(ziel, aufnahme, von, nach, sonder=None):
    """Aufnahme keyen: abgehende Seite steht fertig, ankommende endet fertig."""
    roh = frames(f"{VEO}/{aufnahme}.mp4")
    n = len(roh)
    kaesten = hauptspur(roh)
    uiv = ui_frames(von) if von else None
    uin = ui_frames(nach) if nach else None
    wechsel, blende = int(n * 0.45), int(FPS * 0.6)

    p = schreiben(ziel)
    for i, a in enumerate(roh):
        bild = Image.fromarray(a)
        m = keyen.maske(a)
        k = kaesten[i]
        if k and (uiv or uin):
            schutz = np.zeros(m.shape, dtype=bool)
            schutz[max(0, k[1]):min(1080, k[3]), max(0, k[0]):min(1920, k[2])] = True
            a = abdunkeln(a, schutz)
            m = keyen.maske(a)
            t = min(1.0, max(0.0, (i - wechsel) / max(1, blende)))
            f_von = uiv[-1] if uiv else None
            f_nach = uin[max(0, len(uin) - 1 - (n - 1 - i))] if uin else None
            if f_von is None:
                ui = f_nach
            elif f_nach is None or t <= 0:
                ui = f_von
            elif t >= 1:
                ui = f_nach
            else:
                ui = Image.blend(f_von, f_nach.resize(f_von.size), t)
            bild = keyen.stanzen(a, ui, k, m)
        elif uiv or uin:
            bild = Image.fromarray(abdunkeln(a))
        if sonder:
            # Kachelblende an EINER stetigen Zahl: ganze Kacheln stehen voll,
            # die angebrochene traegt den Rest — kein Zyklus nach der
            # Vollzahl, kein hartes Verschwinden.
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
    """glas1 plus die Glastafel, solange sie liest; blendet aus beim Aufstehen."""
    ziel = f"{S}/roh5_glas1.mp4"
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


def dreischnitt():
    """home-s0: glas1 + glas2 + checkin, an den Naehten ueberblendet."""
    ziel = f"{S}/roh5_home-s0.mp4"
    if os.path.exists(ziel):
        return ziel
    teile = [glas1_mit_tafel()]
    # glas2 endet nach zwei Sekunden: Tuer auf, Halle oeffnet sich, sie geht
    # los. Alles danach hat Veo frei erfunden (sie lief ungeprueft durch die
    # Schrankenreihe); die Blende uebergibt an den Check-in-Take, BEVOR sie
    # die Linie erreicht.
    for kurz, schnitt in (("glas2", ["-t", "2.0"]), ("checkin", [])):
        t = f"{S}/roh5_{kurz}.mp4"
        if not os.path.exists(t):
            lauf([FF, "-v", "error", "-i", f"{VEO}/{kurz}.mp4", *schnitt,
                  "-vf", "scale=1920:1080:flags=lanczos,fps=24", "-vsync", "cfr",
                  "-c:v", "libx264", "-preset", "fast", "-crf", "16",
                  "-pix_fmt", "yuv420p", "-an", "-y", t])
        teile.append(t)
    d1 = imageio_ffmpeg.read_frames(teile[0]).__next__()["duration"]
    d2 = imageio_ffmpeg.read_frames(teile[1]).__next__()["duration"]
    b1 = round(d1 - 0.25, 3)
    b2 = round(d1 + d2 - 0.50, 3)
    lauf([FF, "-v", "error", "-i", teile[0], "-i", teile[1], "-i", teile[2],
          "-filter_complex",
          f"[0:v][1:v]xfade=transition=fade:duration=0.25:offset={b1}[a];"
          f"[a][2:v]xfade=transition=fade:duration=0.25:offset={b2}[v]",
          "-map", "[v]", "-r", "24", "-c:v", "libx264", "-preset", "fast", "-crf", "16",
          "-pix_fmt", "yuv420p", "-an", "-y", ziel])
    return ziel


if __name__ == "__main__":
    nur = set(sys.argv[1:])

    if not nur or "home-s0" in nur:
        mb = anschliessen("home-s0", dreischnitt(), "home", "s0")
        print(f"home-s0    {mb:4.1f} MB", flush=True)

    if not nur or "s0-s1" in nur:
        roh = f"{S}/roh5_s0-s1.mp4"
        if not os.path.exists(roh):
            bauen(roh, "halle-buero", None, "s1")
        print(f"s0-s1      {anschliessen('s0-s1', roh, 's0', 's1'):4.1f} MB", flush=True)

    if not nur or "s3-s4" in nur:
        roh = f"{S}/roh5_s3-s4.mp4"
        if not os.path.exists(roh):
            bauen(roh, "s3-s4", "s3", "s4")
        print(f"s3-s4      {anschliessen('s3-s4', roh, 's3', 's4'):4.1f} MB", flush=True)

    if not nur or "s4-s5" in nur:
        roh = f"{S}/roh5_s4-s5.mp4"
        if not os.path.exists(roh):
            bauen(roh, "s4-s5", "s4", "s5")
        print(f"s4-s5      {anschliessen('s4-s5', roh, 's4', 's5'):4.1f} MB", flush=True)

    if not nur or "s2-s2b" in nur:
        roh = f"{S}/roh5_s2-s2b.mp4"
        if not os.path.exists(roh):
            bauen(roh, "buero_weit-platz", "s2", "s2", sonder="rein")
        print(f"s2-s2b     {anschliessen('s2-s2b', roh, 's2', 's2b'):4.1f} MB", flush=True)

    if not nur or "s2b-s3" in nur:
        roh = f"{S}/roh5_s2b-s3.mp4"
        if not os.path.exists(roh):
            bauen(roh, "buero_weit-platz", "s2", "s3", sonder="raus")
        print(f"s2b-s3     {anschliessen('s2b-s3', roh, 's2b', 's3'):4.1f} MB", flush=True)

    print("MONTAGE NEU FERTIG", flush=True)
