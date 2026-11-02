#!/usr/bin/env python3
"""Die 3x3-Kundenkacheln als gläserne Ebene über dem Raum (08:10).

Eine Freigabe, viele Menschen: nach ihrer Entscheidung schweben neun Kacheln im
Buero, in jeder ein Kunde in seiner Situation und die Nachricht, die er gerade
bekommt.

Warum gerechnet und nicht gemalt: Glas heisst, dass der Raum DURCH die Kachel
hindurch sichtbar bleibt — dafuer muss der Hintergrund an genau dieser Stelle
weichgezeichnet und aufgehellt werden. Ein Bildmodell kann das nur behaupten;
hier stimmt es pixelweise, und die Schrift bleibt gestochen scharf.

Die Kacheln erscheinen nacheinander — das ist die Aussage der Szene, nicht ein
fertiges Raster.
"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

S = "/tmp/claude-0/-home-user-kiarbeitsplatz/4a027885-72f4-58d1-b5d9-f5090d47fbf4/scratchpad"
KUNDEN = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kunden")

# (Ort, Nachricht, Betrag) — je Kachel eine andere Situation und ein anderer Fall.
FAELLE = [
    ("Kitchen table", "Recurring fee corrected", "2,450 EUR"),
    ("On the tram", "Duplicate charge refunded", "89 EUR"),
    ("Supermarket", "Direct debit retried for you", "—"),
    ("In the park", "Card retry resolved", "—"),
    ("Workshop", "Standing order restored", "340 EUR"),
    ("Cafe", "Fee reversal completed", "120 EUR"),
    ("Car park", "Address records merged", "—"),
    ("At home", "Overcharge refunded", "760 EUR"),
    ("City street", "Payment issue prevented", "—"),
]

# Das Raster liegt in der FREIEN rechten Bildhaelfte — neben ihr, nicht auf
# ihrem Monitor. Das ist der Punkt: sie sieht diese Kacheln nicht. Sie sind,
# wie die Kundensicht in v02, eine Ebene fuer den Betrachter — deshalb liegen
# sie sichtbar VOR dem Raum und tragen eine eigene Ueberschrift.
# Ende bei 74 % Bildhoehe — darunter liegt auf der Buehne das Markenband.
LINKS, OBEN = 0.505, 0.13
BREITE, HOEHE = 0.465, 0.61
LUECKE = 0.011
TITEL = "WHAT THE CUSTOMERS SEE"


def schrift(groesse, fett=False):
    pfad = ("/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf"
            % ("Bold" if fett else "Regular"))
    return ImageFont.truetype(pfad, groesse)


def kachelbild(foto, fall, breite, hoehe):
    """Eine Kachel: Foto oben, gläserne Nachricht unten darüber."""
    k = Image.new("RGBA", (breite, hoehe), (0, 0, 0, 0))
    # Foto formatfuellend
    s = max(breite / foto.width, hoehe / foto.height)
    gross = foto.resize((round(foto.width * s), round(foto.height * s)), Image.LANCZOS)
    lx, ly = (gross.width - breite) // 2, (gross.height - hoehe) // 2
    k.paste(gross.crop((lx, ly, lx + breite, ly + hoehe)), (0, 0))

    # Nachrichtenstreifen unten: dunkel, damit die Schrift traegt
    h = round(hoehe * 0.30)
    streifen = Image.new("RGBA", (breite, h), (10, 13, 17, 205))
    k.alpha_composite(streifen, (0, hoehe - h))

    d = ImageDraw.Draw(k)
    ort, text, betrag = fall
    y = hoehe - h + round(h * 0.16)
    d.text((round(breite * 0.07), y), ort.upper(), font=schrift(round(h * 0.15)),
           fill=(150, 162, 174, 255))
    d.text((round(breite * 0.07), y + round(h * 0.24)), text,
           font=schrift(round(h * 0.22), True), fill=(233, 237, 241, 255))
    if betrag != "—":
        d.text((round(breite * 0.07), y + round(h * 0.55)), betrag,
               font=schrift(round(h * 0.22), True), fill=(52, 160, 106, 255))
    return k


def glas(hintergrund, kasten, radius=22):
    """Den Bereich hinter einer Kachel weichzeichnen und leicht aufhellen."""
    x0, y0, x1, y1 = kasten
    aus = hintergrund.crop(kasten).filter(ImageFilter.GaussianBlur(14))
    aus = Image.blend(aus, Image.new("RGB", aus.size, (255, 255, 255)), 0.10)
    maske = Image.new("L", aus.size, 0)
    ImageDraw.Draw(maske).rounded_rectangle((0, 0, aus.width - 1, aus.height - 1),
                                            radius=radius, fill=255)
    hintergrund.paste(aus, (x0, y0), maske)
    # Feine helle Kante — das ist es, was Glas ausmacht
    d = ImageDraw.Draw(hintergrund, "RGBA")
    d.rounded_rectangle(kasten, radius=radius, outline=(255, 255, 255, 90), width=2)
    return maske


def rastermasse(B, H):
    x0, y0 = round(B * LINKS), round(H * OBEN)
    bw, bh = round(B * BREITE), round(H * HOEHE)
    lx, ly = round(B * LUECKE), round(H * LUECKE)
    kb = (bw - 2 * lx) // 3
    kh = (bh - 2 * ly) // 3
    for i in range(3):
        for j in range(3):
            yield i * 3 + j, (x0 + j * (kb + lx), y0 + i * (kh + ly),
                              x0 + j * (kb + lx) + kb, y0 + i * (kh + ly) + kh)


def ueberschrift(bild, alpha=1.0):
    """Macht kenntlich, dass die Kacheln eine Ebene fuer den Betrachter sind."""
    B, H = bild.size
    d = ImageDraw.Draw(bild, "RGBA")
    f = schrift(round(H * 0.026), True)
    x, y = round(B * LINKS), round(H * (OBEN - 0.075))
    d.text((x, y), TITEL, font=f, fill=(255, 255, 255, round(215 * alpha)))
    d.line((x, y + round(H * 0.045), round(B * (LINKS + BREITE)), y + round(H * 0.045)),
           fill=(255, 255, 255, round(70 * alpha)), width=2)


def legen(raum, sichtbar=9, teil=1.0):
    """Kacheln über den Raum legen. `sichtbar` steuert das Erscheinen."""
    bild = raum.convert("RGB").copy()
    if sichtbar > 0:
        ueberschrift(bild, min(1.0, sichtbar / 2))
    fotos = [Image.open(f"{KUNDEN}/k{n}.png").convert("RGB") for n in range(9)]
    for n, kasten in rastermasse(*bild.size):
        if n >= sichtbar:
            continue
        # Die zuletzt erschienene Kachel blendet weich auf.
        a = teil if n == sichtbar - 1 else 1.0
        if a <= 0.02:
            continue
        maske = glas(bild, kasten)
        kb, kh = kasten[2] - kasten[0], kasten[3] - kasten[1]
        inhalt = kachelbild(fotos[n], FAELLE[n], kb, kh)
        # Foto leicht durchscheinend, damit die Kachel Glas bleibt
        inhalt.putalpha(inhalt.getchannel("A").point(lambda v: round(v * 0.93 * a)))
        rund = Image.new("L", (kb, kh), 0)
        ImageDraw.Draw(rund).rounded_rectangle((0, 0, kb - 1, kh - 1), radius=22, fill=255)
        inhalt.putalpha(Image.composite(inhalt.getchannel("A"), Image.new("L", (kb, kh), 0), rund))
        bild.paste(inhalt, (kasten[0], kasten[1]), inhalt)
    return bild


if __name__ == "__main__":
    # Erst den Bildschirm keyen, dann die Kacheln legen: sonst blitzt das
    # Chroma-Gruen in den Fugen zwischen den Kacheln durch.
    import keyen
    import ausschnitt
    raum, _k = ausschnitt.zuschneiden(f"{S}/raeume_v03/buero_weit.png", anteil=0.02)
    raum.save(f"{S}/v03/buero_weit_169.png")
    a = np.asarray(raum)
    m = keyen.maske(a)
    ui = Image.open(f"{S}/ui/f_s2/0191.png").convert("RGB")
    raum = keyen.stanzen(a, ui, keyen.kasten(m), m)
    legen(raum).save(f"{S}/v03/still_s2b.png")
    Image.open(f"{S}/v03/still_s2b.png").resize((1400, 788)).save(
        f"{S}/tag/v03_kacheln.jpg", quality=93)
    print("Kachelszene fertig")
