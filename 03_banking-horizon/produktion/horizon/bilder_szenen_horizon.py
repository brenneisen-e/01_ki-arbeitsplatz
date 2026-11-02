#!/usr/bin/env python3
"""Sechs eigenstaendige Szenen — eine je Hypothese, kein Hauslauf mehr.

Die Fassungen davor haben alles in EIN Gebaeude gezwungen, weil die Vorlage
"the building remains recognizable" verlangt. Das war ein Fehler: die vier
Hypothesen spielen an vier verschiedenen Orten einer Bank, und sie alle in
dieselbe Halle zu stellen hat jede einzelne geschwaecht. Jetzt hat jede
Szene ihren eigenen Ort, und zwischen ihnen wird ueberblendet.

Drei Regeln, die sich aus dem Auftrag ergeben:

  NAH GENUG     Man muss die Menschen erkennen. Halbnah statt Totale,
                Gesichter im Licht, Blickrichtung lesbar. Keine
                Architekturaufnahmen mit Statisten.
  ECHT          Fotografie, nicht Rendering: Hautstruktur, Poren, echte
                Raeume mit Gebrauchsspuren, verfuegbares Licht. Das Korn
                bleibt minimal — es soll nach 2030 aussehen, nicht nach
                Archivmaterial.
  BEWEIST       Jedes Bild belegt seinen Satz. Das ist die Probe, an der
                die Vorgaenger gescheitert sind (siehe BRIEFING).

    SCRATCH=… python3 bilder_szenen_horizon.py        # alle
    SCRATCH=… python3 bilder_szenen_horizon.py s3     # einzeln
"""
import base64
import io
import os
import sys
import threading

import numpy as np
from openai import OpenAI
from PIL import Image, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
BILDER = f"{HIER}/szenen"
ROH = f"{BILDER}/roh"
os.makedirs(BILDER, exist_ok=True)
os.makedirs(ROH, exist_ok=True)

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

# ── Wie es aussieht ─────────────────────────────────────────────────────────
# Kein Grossformat-Editorial mehr, sondern Reportage auf Augenhoehe: die
# Menschen tragen das Bild, der Raum steht dahinter.
STIL = (
    "Photorealistic documentary photograph, not an illustration and not a render. Shot on a "
    "full-frame digital cinema camera with a 50mm lens at f/2.8, natural available light only, "
    "4K detail. Faces are rendered sharply and naturally: visible skin texture, pores, fine "
    "lines, stray hairs, no retouching, no beauty smoothing, no plastic skin. Real contemporary "
    "Germany, present day to near future, ordinary well-made interiors with signs of daily use. "
    "Muted natural colour, neutral white balance, gentle contrast. Eye-level camera, the people "
    "occupy the middle of the frame at half-body scale so their expressions are clearly "
    "readable. "
)
MENSCHEN = (
    "People of mixed ages between 30 and 60 and mixed backgrounds, ordinary European faces with "
    "real character, plain contemporary business clothing, no uniforms, nobody glamorous, "
    "nobody smiling at the camera, nobody posing. Hands correctly formed with five separated "
    "fingers, in natural positions, doing something specific. "
)
NICHTS = (
    "No text, no lettering, no numbers, no logos, no signage, no watermarks anywhere. No "
    "glowing screens used as a light source, no readable user interfaces, no dashboards, no "
    "holograms, no light strips, no glowing floor lines, no robots, no science fiction, no "
    "cyberpunk, no teal-and-orange grading, no cyan, no lens flare, no heavy vignette, no HDR, "
    "no 3D render, no CGI, no stock-photo poses, no handshakes, no thumbs up."
)


def szene(text):
    return text + MENSCHEN + STIL + NICHTS


# ── Die zehn Szenen, je ein Satz ────────────────────────────────────────────
# Der Auftraggeber hat am 11.09. den endgueltigen Sprechtext geliefert. Er
# hat einen Vorlauf, den die sechs Szenen nicht hergaben: vier kurze
# Behauptungen ueber den Wandel, bevor die vier Hypothesen kommen. Jede
# dieser Behauptungen braucht ihr eigenes Bild — sonst laufen vier
# verschiedene Aussagen ueber dasselbe Bild, und das ist genau der Fehler,
# an dem die frueheren Fassungen gescheitert sind.
#
#   s1  "Seit Jahrzehnten basiert Banking auf Stabilitaet."
#       + "Doch etwas veraendert sich." + "Nicht nur die Technologie."
#   k1  "Kunden veraendern sich."
#   k2  "Arbeit veraendert sich."
#   k3  "Wettbewerb veraendert sich."
#   k4  "Fuehrung veraendert sich."
#       + "Was heisst das fuer die Bank im Jahr 2030?"
#   s2  "Der Berater wird zum strategischen Sparringspartner."
#   s3  "Die Marktfolge arbeitet autonom."
#   s4  "Security ist integraler Bestandteil des Systems."
#   s5  "Und Vorstaende steuern in Echtzeit."
#   s6  "Das ist Banking Horizon."
#
# Die vier k-Bilder arbeiten alle gegen s1: dort sitzt der Kunde am Tisch
# des Beraters, hier erledigt er es selbst; dort wird ein Formular
# durchgegangen, hier wird geurteilt; dort ist der Wettbewerb die Bank an
# der naechsten Ecke, hier sind es sechs Leute ohne Schalterhalle; dort
# entscheidet das Gremium, hier faellt die Entscheidung im Treppenhaus.
SZENEN = {
 "s1": szene(
  "Inside a traditional German bank branch on an ordinary weekday morning. At a plain wooden "
  "desk a female bank advisor in her fifties, grey-blonde hair, reading glasses pushed up, sits "
  "across from an older male customer in a zipped cardigan. A paper folder lies open between "
  "them and she is pointing at a line on the page with a pen while he follows with his eyes. "
  "Behind them the quiet branch: a counter, a few chairs, daylight through a street window. "
  "Everything is solid, familiar and slightly dated — this is how banking has looked for "
  "decades. Warm neutral light, calm, unremarkable, trustworthy. "),

 "k1": szene(
  "The doorway of a small bakery in a German town at mid-morning. The owner, a woman in her "
  "thirties in a flour-dusted apron, stands half in the doorway with a phone held low in one "
  "hand, having just finished something on it in a few seconds; her attention is already back "
  "on the shop behind her, where a customer waits at the counter. No bank in sight, no "
  "paperwork, no appointment, nobody advising her. She settled it herself, between two "
  "customers, and thinks nothing of it. Bright overcast daylight from the street. "),

 "k2": szene(
  "An ordinary German bank office in the early afternoon. A man in his mid thirties with short "
  "fair hair and a light beard has turned his chair away from his desk to face a colleague, a "
  "woman in her fifties with short grey hair and glasses who has pulled up a second chair "
  "beside him; they are arguing carefully about a single judgement call, he "
  "counting a point on two fingers, she listening with her arms folded and her head tilted. The "
  "monitor on the desk behind them is switched off and out of focus, and nobody is touching a "
  "keyboard. The work in this room is deciding, not processing. Daylight from a window to the "
  "right. "),

 "k3": szene(
  "A plain, unglamorous open office of a small financial technology company, midday. Three "
  "people in their late twenties and thirties in ordinary clothes — a T-shirt, a hoodie, a "
  "plain shirt — stand around the end of a cheap table in the middle of a real argument, one "
  "of them mid-sentence with both hands apart, another leaning on the table looking hard at "
  "him. Mismatched chairs, a bare wall, cardboard boxes stacked in the corner, one window. "
  "Nothing about the room says bank: no counter, no suits, no marble, no glass. This is the "
  "competition now. Flat daylight. "),

 "k4": szene(
  "A bank office stairwell in the late afternoon. A woman in her fifties in a dark blazer has "
  "stopped one step above a younger colleague, half turned back toward him, deciding something "
  "on the spot: she is speaking, her hand already moving to end the exchange, while he nods "
  "once, taking the decision away with him. Both are in motion, neither is seated, there is no "
  "table, no room, no agenda and nobody else present. Daylight falls through a tall stairwell "
  "window onto both faces. The decision took eleven seconds. "),

 "s2": szene(
  "A modern bank meeting room, late morning. A female advisor in her early forties and a female "
  "business customer in her fifties sit at a small round table at exactly the same height, "
  "turned toward each other, deep in a real disagreement about a difficult decision: the "
  "advisor is speaking with one open hand raised off the table, the customer listens with her "
  "chin resting on her hand, thinking. The table between them is completely bare — no papers, "
  "no folder, no laptop, no phone, no device of any kind. Daylight from a window to the left "
  "falls on both faces equally. Two equals working on one question. "),

 "s3": szene(
  "A contemporary bank operations room, mid-afternoon. Two specialists, a man in his thirties "
  "and a woman in her forties, stand side by side in the middle of a large, quiet, well-kept "
  "room, looking up and to the left at something out of frame. Their arms are relaxed at their "
  "sides — neither is typing, neither is touching anything. Behind them, out of focus, a long "
  "row of unoccupied workstations with dark switched-off monitors and empty chairs neatly "
  "pushed in. The room is built for thirty people and there are two. They look attentive and "
  "in control, not idle and not stranded. Cool even daylight. "),

 "s4": szene(
  "A glass-walled security and risk department in a modern German bank, afternoon. A woman in "
  "her late forties in a dark blazer walks along the corridor at an unbroken pace, passing an "
  "open doorway without turning her head; through the glass wall behind her an empty approval "
  "desk with an unoccupied chair is visible. Nothing is being checked, nobody is queuing, "
  "nobody is waiting for a signature, no papers are being handed over. Her expression is "
  "focused and untroubled. Daylight from the right. Orderly, quiet, faintly unsettling. "),

 "s5": szene(
  "A bank boardroom in the late afternoon, five executives between forty and sixty standing "
  "around the end of a long table, mid-decision. A woman in the centre is speaking, one hand "
  "lifted just off the table surface, her mouth open mid-sentence; two men beside her are "
  "turned toward her, one nodding, one frowning in concentration; a fourth leans forward with "
  "both palms on the table; the fifth has already half turned toward the door, moving to act on "
  "it. They look at each other, not at the table, and the table in front of them is bare. "
  "Low warm afternoon light from a window wall behind them. Urgent but controlled. "),

 # s7 loest s6 ab. Der einzelne Mann am Fenster war als offenes Ende
 # gedacht, wirkte aber gruebelnd — und der Film heisst Banking Horizon,
 # nicht Banking Zweifel. Jetzt steht ein Team am Fenster und sieht in den
 # Horizont: zuversichtlich, aber nicht jubelnd.
 "s7": szene(
  "Four colleagues of mixed ages between thirty and sixty stand together at a full-height "
  "window of a bank building in the last warm light of the evening, seen from inside at a "
  "slight angle so their faces are clearly readable in profile and three-quarter view. They "
  "are looking out across the city together, not at each other and not at the camera. One of "
  "them has just said something and is lifting a hand slightly toward the skyline; the woman "
  "beside him follows where he points; the other two stand relaxed, one with her arms loosely "
  "crossed. Their expressions are open, calm and quietly confident — a little pleased, not "
  "grinning, not celebrating. Outside, the city stretches to a wide horizon under a clear "
  "evening sky with the first lights coming on. Warm low sunlight falls across their faces "
  "from the window. Hopeful, grounded, forward-looking. "),

 "s6": szene(
  "A single man in his fifties stands alone at a full-height window of a bank building at dusk, "
  "seen from inside, in three-quarter profile, close enough that his face is clearly readable "
  "in the last daylight. He is not working: his hands are in his trouser pockets, he is looking "
  "out across the darkening city, thinking about something unresolved. The room behind him is "
  "in shadow and empty. Outside, the lights of the city are coming on under a wide deep "
  "blue-grey sky. Quiet, serious, open-ended. "),
}


def emulgieren(bild):
    """Sehr zurueckhaltende Kornschicht.

    Die frueheren Fassungen bekamen kraeftiges Portra-Korn, um dem Rendering
    den Plastikglanz zu nehmen. Hier waere das falsch: der Auftrag lautet
    extrem realistisch und gegenwaertig, und sichtbares Korn wuerde die
    Bilder in die Vergangenheit ziehen. Geblieben ist eine Spur Rauschen und
    ein Hauch Randabfall — gerade genug, dass die Flaechen nicht digital
    glattgebuegelt wirken.
    """
    x = np.asarray(bild, dtype=np.float32) / 255.0
    h, w, _ = x.shape
    licht = np.clip((x.max(axis=2) - 0.88) / 0.12, 0, 1)
    weich = np.asarray(Image.fromarray((licht * 255).astype(np.uint8))
                       .filter(ImageFilter.GaussianBlur(10)), dtype=np.float32) / 255.0
    x = x + weich[..., None] * np.array([0.022, 0.017, 0.012], dtype=np.float32)
    rng = np.random.default_rng(5)
    x = x + rng.normal(0, 1, (h, w, 3)).astype(np.float32) * 0.0045
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx / w - 0.5) * 2) ** 2 + ((yy / h - 0.5) * 2) ** 2) / 1.4142
    x = x * (1.0 - 0.045 * r ** 2.2)[..., None]
    return Image.fromarray((np.clip(x, 0, 1) * 255).astype(np.uint8))


def erzeugen(name, versuche=3):
    ziel = f"{BILDER}/{name}.png"
    if os.path.exists(ziel):
        print(name, "liegt schon da", flush=True)
        return
    for versuch in range(1, versuche + 1):
        try:
            r = client.images.generate(model="gpt-image-2", prompt=SZENEN[name],
                                       size="1536x1024", quality="high")
            b = Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
            b = b.crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS)
            b.save(f"{ROH}/{name}.png")
            emulgieren(b).save(ziel)
            print("fertig:", name, flush=True)
            return
        except Exception as e:      # noqa: BLE001
            print(f"{name}: Versuch {versuch}: {str(e)[:160]}", flush=True)
    print(f"{name}: nach {versuche} Versuchen kein Bild", flush=True)


if __name__ == "__main__":
    namen = sys.argv[1:] or list(SZENEN)
    faeden = [threading.Thread(target=erzeugen, args=(n,)) for n in namen]
    for f in faeden:
        f.start()
    for f in faeden:
        f.join()
    print("SZENEN FERTIG", flush=True)
