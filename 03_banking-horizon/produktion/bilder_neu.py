#!/usr/bin/env python3
"""Bildquellen fuer den Neuschnitt — zurueckgewonnen aus den fertigen Stills.

Die 3:2-Quellbilder der Raeume liegen nur im fluechtigen Arbeitsverzeichnis
und ueberleben einen Container-Neustart nicht. Die fertigen Standbilder im
Repo dagegen schon — und aus ihnen laesst sich alles zurueckgewinnen, was der
Neuschnitt braucht:

  * buero_gruen   — s1.jpg, Monitorflaeche programmatisch mit Chroma gefuellt
                    (die Lage des Schirms steht versioniert in schirmKaesten).
  * wohnung_rein  — home.jpg ohne die eingebrannte Glastafel (Inpainting, nur
                    der Tafelbereich wird zurueckkomponiert).
  * s2b_rein      — s2b.jpg ohne Kundenkacheln, Monitor gruen (Inpainting).
  * glastuer_neu  — NEU: dieselbe Szene wie das alte Glastuer-Bild, aber mit
                    Mara. Das alte Bild zeigte eine andere Frau (langes Haar);
                    Veo hat treu die falsche Person animiert.
  * halle_innen   — NEU: die Halle von innen, hinter den Schranken — das neue
                    Standbild von 07:45, nachdem der Check-in in den Weg von
                    Szene 1 zu Szene 2 gewandert ist.

16:9-Stills werden fuer die Bildmodell-Aufrufe auf 1536x1024 gepolstert und
danach wieder beschnitten; wo nur ein Ausschnitt neu entsteht, wird allein
dieser Ausschnitt zurueckkomponiert — alles andere bleibt Pixel fuer Pixel.
"""
import base64
import io
import os
import re
import sys
import time

from openai import OpenAI
from PIL import Image, ImageDraw, ImageFilter

S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                              "4a027885-72f4-58d1-b5d9-f5090d47fbf4/scratchpad")
os.environ.setdefault("OPENAI_API_KEY",
                      open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
HIER = os.path.dirname(os.path.abspath(__file__))
APP = os.path.normpath(f"{HIER}/../public/images/operations-v04")
# Quellen versioniert neben dem Skript — Rollbacks loeschen das Scratchpad.
ZIEL = f"{HIER}/quellen"
os.makedirs(ZIEL, exist_ok=True)
CHROMA = (0, 177, 64)

client = None


def kasten_s1():
    """Monitorlage aus der versionierten schirmKaesten.ts lesen."""
    quelle = open(f"{HIER}/../src/operationstag/schirmKaesten.ts").read()
    m = re.search(r"s1: \[([0-9., ]+)\]", quelle)
    x0, y0, x1, y1 = (float(v) for v in m.group(1).split(","))
    return round(x0 * 1920), round(y0 * 1080), round(x1 * 1920), round(y1 * 1080)


def polstern(bild):
    """16:9 mittig in 1536x1024 legen (Rand gespiegelt statt schwarz)."""
    b = bild.resize((1536, 864), Image.LANCZOS)
    voll = Image.new("RGB", (1536, 1024))
    voll.paste(b, (0, 80))
    oben = b.crop((0, 0, 1536, 80)).transpose(Image.FLIP_TOP_BOTTOM)
    unten = b.crop((0, 784, 1536, 864)).transpose(Image.FLIP_TOP_BOTTOM)
    voll.paste(oben, (0, 0))
    voll.paste(unten, (0, 944))
    return voll


def entpolstern(bild):
    return bild.crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS)


def edit(bilder, prompt, versuche=5):
    for v in range(versuche):
        try:
            puffer = []
            for i, b in enumerate(bilder):
                p = io.BytesIO()
                b.save(p, format="PNG")
                p.name = f"b{i}.png"
                p.seek(0)
                puffer.append(p)
            r = client.images.edit(model="gpt-image-2", image=puffer, prompt=prompt,
                                   size="1536x1024", quality="high")
            return Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
        except Exception as e:
            print("  retry", v + 1, str(e)[:120], flush=True)
            time.sleep(12 * (v + 1))
    raise SystemExit("Bildmodell gibt nicht nach " + str(versuche) + " Versuchen")


def ausschnitt_zurueck(original, neu, kasten, rand=8):
    """Nur den Kasten aus dem neuen Bild uebernehmen, weiche Kante."""
    alpha = Image.new("L", original.size, 0)
    x0, y0, x1, y1 = kasten
    ImageDraw.Draw(alpha).rectangle((x0 + rand, y0 + rand, x1 - rand, y1 - rand), fill=255)
    alpha = alpha.filter(ImageFilter.GaussianBlur(rand))
    return Image.composite(neu.resize(original.size), original, alpha)


def buero_gruen():
    ziel = f"{ZIEL}/buero_gruen.png"
    if os.path.exists(ziel):
        return print("buero_gruen existiert", flush=True)
    b = Image.open(f"{APP}/s1.jpg").convert("RGB")
    ImageDraw.Draw(b).rectangle(kasten_s1(), fill=CHROMA)
    b.save(ziel)
    print("buero_gruen ok (programmatisch)", flush=True)


def wohnung_rein():
    ziel = f"{ZIEL}/wohnung_rein.png"
    if os.path.exists(ziel):
        return print("wohnung_rein existiert", flush=True)
    b = Image.open(f"{APP}/home.jpg").convert("RGB")
    # Die Tafel steht links; ihr Bereich (mit Titel darueber) wird freigegeben.
    tafel = (round(0.035 * 1920), round(0.03 * 1080), round(0.30 * 1920), round(0.93 * 1080))
    gep = polstern(b)
    maske = Image.new("L", gep.size, 255)
    t = (round(tafel[0] * 1536 / 1920), 80 + round(tafel[1] * 864 / 1080),
         round(tafel[2] * 1536 / 1920), 80 + round(tafel[3] * 864 / 1080))
    ImageDraw.Draw(maske).rectangle(t, fill=0)
    rgba = gep.convert("RGBA")
    rgba.putalpha(maske)
    neu = edit([rgba], "Remove the floating glass panel completely. Behind it there is only the "
                       "apartment: the continuation of the kitchen cabinetry, the window wall "
                       "with the morning city, the pale floor — matching the surrounding light "
                       "and perspective exactly. No panel, no frame, no text, nothing floating.")
    erg = ausschnitt_zurueck(b, entpolstern(neu), tafel)
    erg.save(ziel)
    print("wohnung_rein ok", flush=True)


def s2b_rein():
    ziel = f"{ZIEL}/s2b_rein.png"
    b = Image.open(f"{APP}/s2b.jpg").convert("RGB")
    feld = (round(0.50 * 1920), round(0.04 * 1080), round(0.99 * 1920), round(0.90 * 1080))
    roh = f"{ZIEL}/s2b_ohne_kacheln.png"
    if not os.path.exists(roh):
        gep = polstern(b)
        maske = Image.new("L", gep.size, 255)
        t = (round(feld[0] * 1536 / 1920), 80 + round(feld[1] * 864 / 1080),
             round(feld[2] * 1536 / 1920), 80 + round(feld[3] * 864 / 1080))
        ImageDraw.Draw(maske).rectangle(t, fill=0)
        rgba = gep.convert("RGBA")
        rgba.putalpha(maske)
        neu = edit([rgba], "Remove all the floating glass tiles and the white heading completely. "
                           "Behind them there is only the empty right part of the room: bare "
                           "floor, the calm wall and the glass partition, matching the "
                           "surrounding light and perspective exactly. Nothing floats in the "
                           "air, no tiles, no text.")
        entpolstern(neu).save(roh)
    # Nur das Kachelfeld kommt aus der Retusche; alles andere bleibt das
    # Original. Danach wird die MONITORGLASFLAECHE Chroma — am Standbild
    # vermessen (die Szene ist die nahe Einstellung, nicht die Totale).
    erg = ausschnitt_zurueck(b, Image.open(roh), feld)
    ImageDraw.Draw(erg).rectangle((round(0.217 * 1920), round(0.305 * 1080),
                                   round(0.506 * 1920), round(0.655 * 1080)), fill=CHROMA)
    erg.save(ziel)
    print("s2b_rein ok", flush=True)


def glastuer_neu():
    ziel = f"{ZIEL}/glastuer_neu.png"
    if os.path.exists(ziel):
        return print("glastuer_neu existiert", flush=True)
    ref = Image.open(f"{ZIEL}/mara_ref.png").convert("RGB")
    neu = edit([ref],
               "The woman from the reference image, seen STRICTLY FROM BEHIND, standing directly "
               "in front of a floor-to-ceiling glass entrance door with a slim vertical brushed "
               "steel handle. Her right hand rests on the handle. Keep her exact hair — dark "
               "chin-length bob — her black blazer, white top and dark navy trousers, zero "
               "alteration. Beyond the glass, bright blown-out daylight, hints of a modern lobby. "
               "Photorealistic documentary photograph, she fills the right half of the frame, the "
               "door fills the rest. No bag, no other people.")
    neu.save(ziel)
    print("glastuer_neu ok", flush=True)


def halle_innen():
    ziel = f"{ZIEL}/halle_innen.png"
    if os.path.exists(ziel):
        return print("halle_innen existiert", flush=True)
    basis = Image.open(f"{APP}/s0.jpg").convert("RGB")
    neu = edit([polstern(basis)],
               "THE SAME arrival hall as in this picture — same pale floor, same oak reception "
               "counter with the receptionist, same planted island, same glass facade with the "
               "Frankfurt skyline, same wide open door in the right-hand wall — but seen FROM A "
               "FEW METRES FURTHER INSIDE, past the access gates: the row of glass speed gates is "
               "now BEHIND the woman, at the left edge of the frame with its glass leaves closed. "
               "SHE has just come through and walks towards the open door on the right, seen "
               "strictly from behind — same dark chin-length bob, black blazer, dark trousers. "
               "Nobody else moves; the seated colleagues and the receptionist stay where they "
               "are. Morning daylight, photorealistic, no signage, no screens.")
    entpolstern(neu).save(ziel)
    print("halle_innen ok", flush=True)


# Neu positioniert: hoch an der Wand, ueber den Koepfen, im Breitformat der
# eigens dafuer gerenderten Wandfassung der Oberflaeche (1900x800).
S4_GLAS = (0.29, 0.06, 0.75, 0.405)
S5_GLAS = (0.303, 0.175, 0.857, 0.765)


def s4_wand_frei():
    """Die alte, zu tief sitzende Wandanzeige aus dem Teamraum entfernen.

    Das Inpainting stellt die Wand hinter den Koepfen wieder her und laesst
    die Personen davor unangetastet — die Verdeckung, die programmatisch
    muehsam waere, macht das Bildmodell nebenbei richtig.
    """
    ziel = f"{ZIEL}/s4_wand_frei.png"
    if os.path.exists(ziel):
        return print("s4_wand_frei existiert", flush=True)
    b = Image.open(f"{APP}/s4.jpg").convert("RGB")
    feld = (round((S4_GLAS[0] - 0.012) * 1920), round(max(0, S4_GLAS[1] - 0.02) * 1080),
            round((S4_GLAS[2] + 0.012) * 1920), round((S4_GLAS[3] + 0.02) * 1080))
    gep = polstern(b)
    maske = Image.new("L", gep.size, 255)
    t = (round(feld[0] * 1536 / 1920), 80 + round(feld[1] * 864 / 1080),
         round(feld[2] * 1536 / 1920), 80 + round(feld[3] * 864 / 1080))
    ImageDraw.Draw(maske).rectangle(t, fill=0)
    rgba = gep.convert("RGBA")
    rgba.putalpha(maske)
    neu = edit([rgba], "Remove the large dark screen from the wall completely. Behind it there "
                       "is only the plain pale wall of the meeting room, matching the "
                       "surrounding light and texture exactly. THE PEOPLE SITTING AT THE TABLE "
                       "IN FRONT OF IT STAY EXACTLY AS THEY ARE, fully intact — only the screen "
                       "behind them disappears. No screen, no frame, no shadow of it.")
    erg = ausschnitt_zurueck(b, entpolstern(neu), feld)
    erg.save(ziel)
    print("s4_wand_frei ok", flush=True)


def s4_neu():
    """Teamraum-Standbild neu: echter montierter Breitbildschirm, hoch an der
    Wand, mit Rahmen und Schatten — statt der buendigen Flaeche hinter den
    Koepfen, die wie ein aufgelegtes Overlay las."""
    from PIL import ImageFilter as IF
    S_ = os.environ.get("SCRATCH", S)
    b = Image.open(f"{ZIEL}/s4_wand_frei.png").convert("RGB")
    x0, y0, x1, y1 = (round(S4_GLAS[0] * 1920), round(S4_GLAS[1] * 1080),
                      round(S4_GLAS[2] * 1920), round(S4_GLAS[3] * 1080))
    r = 13
    schatten = Image.new("L", b.size, 0)
    ImageDraw.Draw(schatten).rounded_rectangle(
        (x0 - r - 3, y0 - r, x1 + r + 9, y1 + r + 13), radius=17, fill=100)
    schatten = schatten.filter(IF.GaussianBlur(11))
    dunkel = Image.new("RGB", b.size, (10, 11, 13))
    b = Image.composite(dunkel, b, schatten.point(lambda v: v // 3))
    ui = Image.open(f"{S_}/ui/f_s4w/0191.png").convert("RGB").resize((x1 - x0, y1 - y0),
                                                                     Image.LANCZOS)
    b.paste(ui, (x0, y0))
    d = ImageDraw.Draw(b)
    d.rounded_rectangle((x0 - r, y0 - r, x1 + r, y1 + r), radius=13,
                        outline=(22, 24, 27), width=r)
    d.rounded_rectangle((x0 - r, y0 - r, x1 + r, y1 + r), radius=13,
                        outline=(56, 60, 66), width=2)
    # Verdeckung: die Koepfe der hinteren Reihe liegen VOR dem Display —
    # sie kommen aus dem freigestellten Wandbild zurueck ueber die Kante.
    basis = Image.open(f"{ZIEL}/s4_wand_frei.png").convert("RGB")
    alpha = _personen_maske(basis, (x0 - r, y0 - r, x1 + r, y1 + r + 14))
    b = Image.composite(basis, b, alpha)
    b.save(f"{APP}/s4.jpg", quality=90, optimize=True, progressive=True)
    Image.open(f"{S_}/ui/f_s4w/0191.png").convert("RGB").save(
        f"{APP}/ui/s4.jpg", quality=92, optimize=True, progressive=True)
    print("s4 neu ok", flush=True)


def s4_display_gruen():
    """Das Bildmodell montiert den Breitbildschirm HINTER die Personen —
    Glas als Chroma. Die Verdeckung, an der jede Schwellenwert-Maske
    scheitert (Hautton nahe Wandfarbe), loest das Modell nebenbei richtig;
    die Oberflaeche kommt danach pixelweise ins sichtbare Gruen."""
    ziel = f"{ZIEL}/besprechung_gruen.png"
    b = Image.open(f"{ZIEL}/s4_wand_frei.png").convert("RGB")
    feld = (round((S4_GLAS[0] - 0.03) * 1920), 0,
            round((S4_GLAS[2] + 0.03) * 1920), round((S4_GLAS[3] + 0.06) * 1080))
    gep = polstern(b)
    maske = Image.new("L", gep.size, 255)
    t = (round(feld[0] * 1536 / 1920), 80 + round(feld[1] * 864 / 1080),
         round(feld[2] * 1536 / 1920), 80 + round(feld[3] * 864 / 1080))
    ImageDraw.Draw(maske).rectangle(t, fill=0)
    rgba = gep.convert("RGBA")
    rgba.putalpha(maske)
    neu = edit([rgba],
               "Mount ONE VERY LARGE, WIDE flat display HIGH on the far wall, centred over the "
               "table: cinema-proportioned (well over twice as wide as tall), slim dark bezel, "
               "slightly proud of the wall with a soft shadow. ITS LOWER EDGE SITS CLEARLY "
               "ABOVE THE HEADS OF EVERYONE SEATED — the green surface is COMPLETELY "
               "UNOBSTRUCTED, nothing and nobody overlaps it. ITS SCREEN IS FILLED EDGE TO "
               "EDGE WITH FLAT, UNIFORM, SATURATED CHROMA-KEY GREEN (#00B140) — no content, no "
               "reflection, no gradient. THE PEOPLE SEATED AT THE TABLE STAY EXACTLY AS THEY "
               "ARE. Same light, same perspective as the room.")
    erg = ausschnitt_zurueck(b, entpolstern(neu), feld, rand=10)
    erg.save(ziel)
    print("s4 gruen hinter Personen ok", flush=True)


def s4_still():
    """Standbild + Overlay-Bild aus der Gruenquelle: Oberflaeche pixelweise
    ins sichtbare Gruen, Koepfe bleiben davor."""
    import sys as _sys
    S_ = os.environ.get("SCRATCH", S)
    _sys.path.insert(0, S_)
    import numpy as np
    import keyen
    b = Image.open(f"{ZIEL}/besprechung_gruen.png").convert("RGB")
    a = np.asarray(b)
    m = keyen.maske(a)
    k = keyen.kasten(m)
    ui = Image.open(f"{S_}/ui/f_s4w/0191.png").convert("RGB")
    erg = keyen.stanzen(a, ui, k, m)
    erg.save(f"{APP}/s4.jpg", quality=90, optimize=True, progressive=True)
    ui.save(f"{APP}/ui/s4.jpg", quality=92, optimize=True, progressive=True)
    fr = [round(k[0] / 1920, 4), round(k[1] / 1080, 4), round(k[2] / 1920, 4), round(k[3] / 1080, 4)]
    print("s4 still ok, Glaskasten:", fr, flush=True)


def kabine_gruen():
    b = Image.open(f"{APP}/s5.jpg").convert("RGB")
    ImageDraw.Draw(b).rectangle((round(S5_GLAS[0] * 1920), round(S5_GLAS[1] * 1080),
                                 round(S5_GLAS[2] * 1920), round(S5_GLAS[3] * 1080)),
                                fill=CHROMA)
    b.save(f"{ZIEL}/kabine_gruen.png")
    print("kabine_gruen ok", flush=True)


def schranke_dicht():
    """Die Sperrlinie schliesst Wand zu Wand — DoD "bauliche Logik".

    In beiden Hallenbildern endete die Schrankenreihe mitten im Raum; rechts
    (bzw. links) konnte man einfach vorbeigehen. Ein Sicherheitssystem, das
    man umlaufen kann, ist keins. Die Linie wird um sie herum bis zu den
    Waenden verlaengert; sie selbst bleibt unangetastet.
    """
    for name, quelle, bereiche, prompt in [
        ("halle_innen", f"{ZIEL}/halle_innen.png",
         [(0.205, 0.40, 0.325, 0.68), (0.535, 0.40, 0.995, 0.68)],
         "Continue the security line: extend the row of glass speed gates with their pale stone "
         "pedestals and the waist-high glass balustrade from the existing gates ALL THE WAY TO "
         "THE RIGHT-HAND WALL, in the same perspective, materials and light, so the line closes "
         "completely and there is no way past except through a gate. Keep the reception counter, "
         "the door and the people beyond the line exactly as they are."),
        ("schranke", f"{ZIEL}/schranke_alt.jpg",
         [(0.0, 0.52, 0.085, 0.92)],
         "Continue the security line to the left: extend the waist-high glass balustrade of the "
         "speed-gate row from the leftmost pedestal to the left edge of the picture, same "
         "perspective, materials and light, so nobody could walk around the gates on this side."),
    ]:
        ziel = f"{ZIEL}/{name}.png"
        b = Image.open(quelle).convert("RGB")
        gep = polstern(b)
        maske = Image.new("L", gep.size, 255)
        for x0, y0, x1, y1 in bereiche:
            ImageDraw.Draw(maske).rectangle(
                (round(x0 * 1536), 80 + round(y0 * 864),
                 round(x1 * 1536), 80 + round(y1 * 864)), fill=0)
        rgba = gep.convert("RGBA")
        rgba.putalpha(maske)
        neu = entpolstern(edit([rgba], prompt))
        erg = b
        for k in bereiche:
            px = (round(k[0] * 1920), round(k[1] * 1080), round(k[2] * 1920), round(k[3] * 1080))
            erg = ausschnitt_zurueck(erg, neu, px)
        erg.save(ziel)
        print(name, "Sperrlinie dicht", flush=True)


if __name__ == "__main__":
    client = OpenAI()
    nur = set(sys.argv[1:])
    for name, fn in [("buero_gruen", buero_gruen), ("wohnung_rein", wohnung_rein),
                     ("s2b_rein", s2b_rein), ("glastuer_neu", glastuer_neu),
                     ("halle_innen", halle_innen), ("schranke_dicht", schranke_dicht),
                     ("s4_wand_frei", s4_wand_frei), ("s4_display_gruen", s4_display_gruen),
                     ("s4_still", s4_still), ("kabine_gruen", kabine_gruen)]:
        if nur and name not in nur:
            continue
        fn()
    print("BILDER NEU FERTIG", flush=True)
