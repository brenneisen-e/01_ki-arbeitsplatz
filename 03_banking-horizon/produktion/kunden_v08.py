#!/usr/bin/env python3
"""Die neun Kundenfotos fuer die Kacheln um 08:10 neu erzeugen.

Aus der Abnahme: die alten neun waren in Alter und Geschlecht gemischt, in
der Herkunft aber fast durchweg gleich. Neun Kunden einer europaeischen
Grossbank sehen anders aus.

Jedes Bild zeigt einen Menschen in seiner Situation, der auf sein Telefon
schaut — genau in dem Moment, in dem die Nachricht ankommt. Reportagefoto,
kein Studio, kein Blick in die Kamera.

    SCRATCH=… python3 kunden_v08.py
"""
import base64
import io
import os
import sys
import time

from openai import OpenAI
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

ZIEL = f"{HIER}/kunden"
BREITE, HOEHE = 992, 650   # Seitenverhaeltnis der Kachel

STIL = (
    " Candid documentary photograph, natural available light, shallow depth of field, muted "
    "warm colours, photorealistic. She or he looks DOWN AT THE PHONE, never into the camera. "
    "No text, no numbers, no watermark, no logo, and the phone screen is not readable. "
    "Anatomically correct hands, one person in focus."
)

# Ort -> wer dort steht. Neun Menschen, die sich in Alter, Herkunft und
# Lebenslage unterscheiden — so sieht die Kundschaft einer Grossbank aus.
LEUTE = [
    ("k0", "A Black woman in her thirties with short natural hair, in a soft grey jumper, "
           "standing at her kitchen table in the morning with a bowl of cereal and a cup of "
           "coffee, looking at her phone."),
    ("k1", "A young South Asian man in his early twenties with a light beard, in a dark jacket "
           "with a rucksack, sitting by the window of a tram in daylight, looking at his phone."),
    ("k2", "A white woman in her seventies with short silver hair, in a green quilted coat, "
           "standing in a supermarket aisle with a basket over her arm, looking at her phone."),
    ("k3", "A Middle Eastern woman in her forties wearing a headscarf and a warm coat, sitting "
           "on a park bench in autumn beside a golden retriever, looking at her phone."),
    ("k4", "A Latino man in his fifties with grey stubble, in a leather apron in his own small "
           "carpentry workshop, tools on the wall behind him, looking at his phone."),
    ("k5", "An East Asian woman in her thirties in a camel coat, sitting at a small round table "
           "outside a city cafe with an espresso, looking at her phone."),
    ("k6", "A white man in his sixties with grey hair, in a blue hoodie, standing at the open "
           "boot of his car in a supermarket car park with paper bags of shopping, looking at "
           "his phone."),
    ("k7", "A Black man in his forties with a short beard, in a knitted jumper, sitting on a "
           "sofa at home in warm evening lamplight, looking at his phone."),
    ("k8", "A young woman of mixed heritage in her twenties with curly hair, in a denim jacket, "
           "sitting in a wheelchair on a city street in daylight, looking at her phone."),
]


def erzeugen(prompt, versuche=4):
    for v in range(versuche):
        try:
            r = client.images.generate(model="gpt-image-2", prompt=prompt + STIL,
                                       size="1536x1024", quality="high")
            b = Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
            # Auf das Verhaeltnis der Kachel beschneiden, mittig.
            hoehe = round(1536 * HOEHE / BREITE)
            oben = (1024 - hoehe) // 2
            return b.crop((0, oben, 1536, oben + hoehe)).resize((BREITE, HOEHE), Image.LANCZOS)
        except Exception as e:
            print("  Versuch", v + 1, str(e)[:140], flush=True)
            time.sleep(10 * (v + 1))
    raise SystemExit("Bildmodell antwortet nicht")


if __name__ == "__main__":
    nur = set(sys.argv[1:])
    os.makedirs(ZIEL, exist_ok=True)
    for name, prompt in LEUTE:
        if nur and name not in nur:
            continue
        erzeugen(prompt).save(f"{ZIEL}/{name}.png")
        print(name, prompt[:60] + "…", flush=True)
    print("KUNDEN V08 FERTIG", flush=True)
