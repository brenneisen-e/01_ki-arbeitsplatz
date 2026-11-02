#!/usr/bin/env python3
"""Die Schluesselbilder der beiden Banking-Horizon-Filme.

Zwei Fassungen aus einer Vorlage:

  A  Deutsche Bankenlandschaft, Vorstandsperspektive. Deloitte-konform,
     ernsthaft, 70 % Spannung / 30 % Hoffnung. Der Film beginnt in einer
     vertrauten Bankenwelt und endet in einem Haus, das sich nicht mehr um
     Prozesse, sondern um Entscheidungen ordnet.
  B  International, Trailer-Charakter. Beginnt ueber dem Bankenviertel im
     Morgengrauen, beschleunigt, und haelt am Ende an einem einzigen
     Entscheidungspunkt an.

Jede Fassung ist eine KETTE: Bild n entsteht mit Bild n-1 als Anker. Nur so
bleibt das Haus ueber den ganzen Film dasselbe Haus — genau das verlangt die
Vorlage ("The building remains recognizable"). Beide Ketten laufen
gleichzeitig, sonst dauert der Durchgang doppelt so lange.

Aus derselben Kette entstehen spaeter die Wege: Kling faehrt jeweils von
Bild n nach Bild n+1 (kling_horizon.py). Wer hier ein Bild aendert, muss den
Weg davor UND den Weg danach neu drehen (siehe CLAUDE.md).

    SCRATCH=… python3 bilder_horizon.py          # alle
    SCRATCH=… python3 bilder_horizon.py a3 b1    # einzelne
"""
import base64
import io
import os
import sys
import threading

from openai import OpenAI
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
BILDER = f"{HIER}/bilder"
os.makedirs(BILDER, exist_ok=True)

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

# ── Bildsprache ──────────────────────────────────────────────────────────────
# Was in JEDEM Bild gilt. Der Block steht am Ende des Prompts, damit die
# Szenenbeschreibung vorne die Fuehrung behaelt.
SAUBER = (
    "Absolutely no text, no lettering, no numbers, no logos, no brand names, no signage, "
    "no watermarks, no user interface labels anywhere in the image. Screens and displays show "
    "only abstract light, colour fields and soft graphical texture, never readable content. "
    "No robots, no androids, no humanoid machines, no cyberpunk, no science-fiction cliches, "
    "no floating holograms of people. Hands, faces and bodies are anatomically correct; "
    "exactly the number of people described, no duplicated or deformed figures. "
)

STIL_A = (
    "Premium consulting film. Photorealistic, shot on a cinema camera with anamorphic lenses, "
    "wide 16:9 frame, shallow depth of field, soft volumetric daylight mixed with warm practical "
    "light. Modern European banking architecture: stone, oak, brushed metal, deep glass. "
    "Colour palette strictly dark green, navy and teal with warm neutral skin tones. "
    "Human-centered, trustworthy, restrained. High-end editorial cinematography, elegant and "
    "still. Executive audience, strategic transformation atmosphere. " + SAUBER
)

STIL_B = (
    "High-impact cinematic teaser. Photorealistic, large-format cinema camera, wide 16:9 frame, "
    "dramatic contrast, deep blacks, atmospheric haze, lens flare used sparingly. "
    "Colour palette strictly dark green, navy and black with cold teal accents. "
    "Enormous sense of scale and ambition. Sophisticated future-banking aesthetics, "
    "premium editorial film quality, immersive and thought-provoking. " + SAUBER
)

# ── Fassung A: deutsche Bankenlandschaft, Vorstandsperspektive ───────────────
# Der Bogen der Vorlage: vertraut -> erste stille Veraenderungen -> Kunden-
# kontakt loest sich auf -> Betrieb wird autonom -> Steuerung wird
# Echtzeit-Entscheidung -> dasselbe Haus, andere Ordnung -> Ruecknahme der
# Kamera, Zukunft als offene Landschaft.
A = [
 ("a1", None,
  "Interior of the customer hall of a modern European bank headquarters at half past eight in "
  "the morning: a calm, generous foyer of pale stone and oak with a wide open staircase leading "
  "up to a glass-walled boardroom on the floor above. Left in the foreground a reception desk "
  "with one receptionist standing behind it. Beyond it two separate advisory bays, each a proper "
  "desk with an advisor and a client sitting across from each other and a single monitor turned "
  "towards the client. On the right a small waiting area with two seated people, one reading a "
  "leaflet. This is a customer hall, NOT an office: no rows of workstations, no back-office team, "
  "no one working at computers in the foyer. Everything looks established, structured and "
  "familiar: paper on the desks, coffee cups, people talking to each other. Wide symmetrical "
  "eye-level shot from the middle of the hall looking forward. "),
 ("a2", "a1",
  "The SAME customer hall of the SAME bank headquarters, same architecture, same staircase, "
  "same camera position, moved slightly forward. Something has quietly shifted: the reception "
  "desk is unstaffed, one of the two advisory bays is empty with its chair pushed in, the paper "
  "is gone from the desks, and the monitors carry only a faint cool teal light instead of "
  "content. The people who remain are turned towards each other in conversation rather than "
  "towards a screen. Same time of day, same light. "),
 ("a3", "a2",
  "The SAME building, one zone further on: the customer advisory area. The service counter of "
  "stone and oak is still there, but nobody stands behind it. Instead a client and an advisor "
  "sit TOGETHER at eye level at a small round table by the window, leaning in over a single "
  "difficult decision, talking as equals — no screen between them, no paper on the table. A "
  "large dark display beside them carries only a slow field of teal light, no readable content. "
  "Warm daylight, quiet, unhurried, deliberately human. Medium wide shot. "),
 ("a4", "a3",
  "The SAME building, but now a LONG open-plan operations floor seen straight down its length in "
  "deep one-point perspective, the far end vanishing in shadow. Rows and rows of identical empty "
  "desks stand in the room, chairs pushed in, nobody at them, the lamps switched off. Only THREE "
  "people are in the entire floor, sitting together at the very near end of one desk row in a "
  "pool of warm light, talking with each other, no screens in front of them. Along both side "
  "walls run continuous panels of dark glass carrying slow abstract fields of green and teal "
  "light. Cool, quiet, enormous, slightly melancholic. Low wide angle from floor height. "),
 ("a4c", "a4",
  "The SAME building, a long glass corridor leading from the operations floor towards the "
  "boardroom level, seen in deep one-point perspective. The rules of the house have become part "
  "of the architecture: fine, calm, continuous lines of teal light run INSIDE the dark glass of "
  "the walls and the floor, unhurried, like a nervous system of the building itself. One person "
  "walks ahead along the corridor without looking at any screen — nothing is checked, nothing "
  "is signed. No text, no icons, no panels. Cool, quiet, precise. Low wide angle. "),
 ("a5", "a4",
  "The SAME building, the glass-walled boardroom seen from the beginning, now entered. Five "
  "executives stand rather than sit, gathered around a large low table of dark stone. The walls "
  "are continuous dark glass carrying slow, abstract movements of teal and navy light — a live "
  "environment rather than a presentation. No slides, no charts, no text. The atmosphere is "
  "serious and concentrated, the light low and warm on the faces. "),
 ("a6", "a5",
  "The SAME bank headquarters seen as a whole from the middle of the atrium again, the same "
  "staircase and stone recognisable, but the interior is now organised completely differently: "
  "the long process desks are gone, and in their place are a few small circular gathering points "
  "where two or three people stand together in conversation, each under a broad panel of quiet "
  "green light. Far fewer people, much more space, deep calm. The building is unmistakably the "
  "same building. Wide symmetrical shot, early evening light through the glass roof. "),
 ("a7", "a6",
  "The SAME headquarters seen from far outside at blue hour, the camera pulled far back. The "
  "lit building stands in a European financial district; around and above it the sky opens into a "
  "vast dark green and navy horizon in which faint, ghostly outlines of several other possible "
  "versions of the same building are barely suggested, overlapping and translucent, extending "
  "into the distance. Quiet, open, unresolved. Extreme wide establishing shot. "),
 ("a8", "a7",
  "The SAME headquarters, now small at the bottom of the frame: the camera has pulled far back "
  "and high at blue hour. Above the city the dark green and navy sky has become a field of many "
  "faint translucent outlines of other possible versions of the same building and of other "
  "possible cities, overlapping, extending to the horizon — none of them solid, all of them "
  "possible. The lit real building is the only certain thing in the picture. Extreme wide, "
  "quiet, unresolved. "),
]

# ── Fassung B: international, Trailer ────────────────────────────────────────
B = [
 ("b1", None,
  "Aerial view of a major international financial district at dawn, seen from high above and "
  "slightly ahead. Glass towers in cold blue light, the first sun on the upper floors, thin mist "
  "between the buildings, early traffic as faint threads of light in the streets far below. "
  "Everything is orderly, established and enormous. Wide cinematic establishing shot. "),
 ("b2", "b1",
  "The SAME financial district from the SAME height and angle, moments later. The city has begun "
  "to accelerate: the threads of light in the streets have drawn into long continuous streaks, "
  "and faint cool teal lines of light now run between the towers themselves, connecting them "
  "above street level. The mist is thinning. Same buildings, same skyline, unmistakably the same "
  "city — only the movement has changed. Long-exposure feeling, dynamic. "),
 ("b3", "b2",
  "Descending into the SAME city, now close between the towers. The teal light has spread into "
  "every surface: the glass facades carry slow abstract currents of green and navy light running "
  "through them like weather. At street level a single person walks alone through a wide plaza, "
  "speaking quietly into the open air, no phone in the hand, no screen anywhere — the whole "
  "environment answers around them in soft light. Dramatic low wide angle. "),
 ("b4", "b3",
  "Inside one of the towers, a vast dark operations hall on a single floor, seen in a wide "
  "sweeping shot. The hall runs on its own: long banks of dark glass carrying fast, abstract "
  "cascades of teal and green light, the movement clearly continuous and self-directed. Only two "
  "people are present, very small in the frame, standing together far down the hall and looking "
  "up at it. Enormous scale, deep blacks, cold light. "),
 ("b5", "b4",
  "The SAME hall at the peak of the acceleration. Several different versions of the same space "
  "now overlap in the frame as translucent layers — the same architecture repeated and slightly "
  "shifted, appearing and dissolving through one another, each lit differently in green, navy and "
  "teal. The two people are still there in the middle, sharp and solid, surrounded by the "
  "overlapping possibilities. Motion, layering, controlled chaos, no blur into abstraction. "),
 ("b6", "b5",
  "Everything has come to rest. The overlapping layers have resolved back into ONE clear space: "
  "a striking, quiet future banking environment, dark and architectural, where hundreds of fine "
  "lines of teal light converge from every direction across the floor and ceiling into a single "
  "point at the centre — a low, plain, brightly lit table with nobody at it yet. The two people "
  "stand at the edge of the frame, looking towards it. Absolute stillness. Symmetrical wide shot. "),
 ("b7", "b6",
  "The camera has pulled far back and up, out of the building and above the city at night. Across "
  "the whole dark horizon, a vast constellation of faint points of teal and green light stretches "
  "into the distance, each connected by fine threads, suggesting countless possible futures of "
  "the same financial system. The city below is small. The sky is enormous, dark green and navy. "
  "Extreme wide final shot, quiet and open. "),
]

STIL = {"a": STIL_A, "b": STIL_B}
JOBS = {n: ("a", a, p) for n, a, p in A}
JOBS.update({n: ("b", a, p) for n, a, p in B})


def bild_ein(pfad, name):
    p = io.BytesIO(open(pfad, "rb").read())
    p.name = name
    return p


def zuschnitt(roh):
    """3:2 auf 16:9 — mittig, wie in der ganzen Produktion ueblich."""
    return roh.crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS)


def erzeugen(name, versuche=3):
    fassung, anker, szene = JOBS[name]
    ziel = f"{BILDER}/{name}.png"
    if os.path.exists(ziel):
        print(name, "liegt schon da", flush=True)
        return ziel
    prompt = szene + STIL[fassung]
    for versuch in range(1, versuche + 1):
        try:
            if anker:
                vor = f"{BILDER}/{anker}.png"
                if not os.path.exists(vor):
                    raise SystemExit(f"{name}: Anker {anker} fehlt — Kette der Reihe nach laufen")
                r = client.images.edit(model="gpt-image-2",
                                       image=[bild_ein(vor, "vorher.png")],
                                       prompt=prompt, size="1536x1024", quality="high")
            else:
                r = client.images.generate(model="gpt-image-2", prompt=prompt,
                                           size="1536x1024", quality="high")
            b = Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
            zuschnitt(b).save(ziel)
            print("fertig:", name, flush=True)
            return ziel
        except Exception as e:      # noqa: BLE001 — ein Fehlschlag darf die Kette nicht kippen
            print(f"{name}: Versuch {versuch} fehlgeschlagen: {str(e)[:200]}", flush=True)
    raise SystemExit(f"{name}: nach {versuche} Versuchen kein Bild")


def kette(namen):
    for n in namen:
        erzeugen(n)


if __name__ == "__main__":
    wunsch = sys.argv[1:]
    if wunsch:
        for n in wunsch:
            if n not in JOBS:
                raise SystemExit(f"unbekannt: {n} (bekannt: {', '.join(JOBS)})")
        kette(wunsch)
    else:
        faeden = [threading.Thread(target=kette, args=([n for n, _, _ in liste],))
                  for liste in (A, B)]
        for f in faeden:
            f.start()
        for f in faeden:
            f.join()
    print("BILDER HORIZON FERTIG", flush=True)
