#!/usr/bin/env python3
"""Die 2030-Haelfte der Modellbilder auf volle 16:9-Breite bringen.

Die Hypothesen-Bilder des Banking-Horizon-Modells sind Vorher/Nachher-
Splits: links 2026, rechts 2030, getrennt von einer festen Naht. Der Film
soll die 2030-Perspektive zeigen — aber diese Haelfte ist 768x1024, also
hochkant. Ein 16:9-Ausschnitt daraus verliert 58 Prozent der Hoehe; bei
Kapitel 3_1 faellt die ganze Zeile "Kreditprozess" heraus.

Also wird nicht beschnitten, sondern seitlich ERWEITERT. Die Haelfte bleibt
Pixel fuer Pixel stehen — samt jedem Wort auf ihren Bildschirmen —, und
gpt-image-2 malt links und rechts den Raum weiter. Die Maske gibt nur die
neuen Flaechen frei; durchsichtig heisst bei OpenAI "hier darfst du malen".

    SCRATCH=… python3 hypothesen_breit.py        # alle acht
    SCRATCH=… python3 hypothesen_breit.py h6     # einzeln
"""
import base64
import io
import os
import sys
import threading

from openai import OpenAI
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
MODELL_BILDER = os.path.abspath(f"{HIER}/../../public/images")
ZIEL = f"{HIER}/hypothesen"
ROH = f"{ZIEL}/roh"
os.makedirs(ROH, exist_ok=True)

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

# Welches Modellbild traegt welchen Satz, und in welchem Raum spielt seine
# 2030-Haelfte. Die Zuordnung ist nach dem Inhalt der Datei gewaehlt, nicht
# nach ihrem Titel — siehe ZUORDNUNG.md.
SZENEN = {
 "h1": ("Kapitel 1_1", "a bright family kitchen at breakfast time, ordinary home, daylight "
                       "through a window"),
 "h2": ("Kapitel 4_1", "a quiet modern bank office with plants and daylight from a window"),
 "h3": ("Kapitel 3_2", "a modern bank office in front of a very large wall display"),
 "h4": ("Kapitel 4_2", "a modern meeting area in front of a very large wall display"),
 "h5": ("Kapitel 2_2", "a modern advisory room in front of a very large wall display"),
 "h6": ("Kapitel 3_1", "a quiet modern bank operations room in front of a very large wall "
                       "display"),
 "h7": ("Kapitel 5_2", "a modern glass-walled bank office in front of a large glass display"),
 "h8": ("Kapitel 6_2", "an executive boardroom in front of a large wall display"),
}


def zusammensetzen(breit, rechts, saum=26):
    """Die Originalhaelfte wieder einsetzen — Pixel fuer Pixel.

    Das ist der Kern, und er hat mich einen Durchgang gekostet: OpenAIs
    `images.edit` haelt sich NICHT an die Maske. Der Bereich, der
    unangetastet bleiben sollte, kommt neu gezeichnet zurueck, und bei
    Bildschirmtext heisst neu gezeichnet kaputt — aus "Kreditprozess" wurde
    "Kreditprcoess", aus "Sonderfall - manuell" ein "Dorderfall - monoell".
    Auf dem Schirm faellt das erst auf, wenn man hineinzoomt.

    Also wird die Maske hinterher von Hand durchgesetzt: das Ergebnis
    liefert nur die neuen Raender, die Mitte kommt aus dem Original zurueck.
    Ein schmaler Saum blendet beide ineinander, damit an der Nahtstelle kein
    Helligkeitssprung steht.
    """
    aus = breit.convert("RGB").copy()
    mitte = rechts.convert("RGB")
    b, h = mitte.size
    alpha = Image.new("L", (b, h), 255)
    rampe = alpha.load()
    for x in range(saum):
        wert = int(255 * (x + 1) / (saum + 1))
        for y in range(h):
            rampe[x, y] = wert
            rampe[b - 1 - x, y] = wert
    aus.paste(mitte, (384, 0), alpha)
    return aus


def erweitern(name):
    kapitel, raum = SZENEN[name]
    ziel = f"{ZIEL}/{name}.png"
    quelle = Image.open(f"{MODELL_BILDER}/{kapitel}.png").convert("RGB")
    rechts = quelle.crop((768, 0, 1536, 1024))          # die 2030-Haelfte

    leinwand = Image.new("RGBA", (1536, 1024), (0, 0, 0, 0))
    leinwand.paste(rechts.convert("RGBA"), (384, 0))
    # Maske: durchsichtig = neu malen. Die Mitte bleibt undurchsichtig und
    # damit unangetastet.
    maske = Image.new("RGBA", (1536, 1024), (0, 0, 0, 0))
    maske.paste(Image.new("RGBA", (768, 1024), (0, 0, 0, 255)), (384, 0))
    pa, pm = f"{S}/breit_{name}_bild.png", f"{S}/breit_{name}_maske.png"
    leinwand.save(pa)
    maske.save(pm)

    prompt = (
        "Extend this photograph sideways to the left and to the right so it becomes one "
        f"continuous wide 16:9 photograph of the same place: {raum}. Same style, same light, "
        "same colours, same perspective. Do not change, redraw or move anything in the "
        "existing centre of the image — keep every word, number and icon on every screen "
        "exactly as it is. In the new areas add no people, no screens, no text, no logos and "
        "no captions: only more of the same room — walls, floor, ceiling, windows, quiet "
        "furnishings and plants, slightly out of focus toward the edges. Photorealistic "
        "documentary photograph, no illustration, no render.")
    for versuch in (1, 2, 3):
        try:
            r = client.images.edit(model="gpt-image-2", image=open(pa, "rb"),
                                   mask=open(pm, "rb"), prompt=prompt, size="1536x1024")
            b = Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
            b.save(f"{ROH}/{name}_breit.png")
            zusammensetzen(b, rechts).crop((0, 80, 1536, 944)) \
                .resize((1920, 1080), Image.LANCZOS).save(ziel)
            print("fertig:", name, kapitel, flush=True)
            return
        except Exception as e:      # noqa: BLE001
            print(f"{name}: Versuch {versuch}: {str(e)[:160]}", flush=True)
    print(f"{name}: nach drei Versuchen kein Bild", flush=True)


if __name__ == "__main__":
    namen = sys.argv[1:] or list(SZENEN)
    faeden = [threading.Thread(target=erweitern, args=(n,)) for n in namen]
    for f in faeden:
        f.start()
    for f in faeden:
        f.join()
    print("HYPOTHESEN BREIT FERTIG", flush=True)
