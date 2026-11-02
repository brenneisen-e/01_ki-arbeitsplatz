#!/usr/bin/env python3
"""Die Wege der beiden Banking-Horizon-Filme — Kling ueber fal.ai.

Wie in der Mara-Strecke: fal.ai reicht ein ENDBILD durch (`tail_image_url`),
jeder Take laeuft also von einem Schluesselbild zum naechsten. Sechs Takes je
Fassung, jeder zehn Sekunden — macht sechzig Sekunden Film, und das ist
genau die Laenge, die das Voice-over der Vorlage braucht.

Voraussetzung: die Bilder aus bilder_horizon.py liegen vor. Wird eines davon
nachtraeglich geaendert, muessen die beiden Takes, die es beruehren, neu
gedreht werden (CLAUDE.md, Produktionsreihenfolge).

Schluessel: $SCRATCH/.fal_env mit einer Zeile `FAL_KEY=...` — nie im Repo.

    SCRATCH=… python3 kling_horizon.py            # alle zwoelf
    SCRATCH=… python3 kling_horizon.py a1-a2      # einzeln
"""
import base64
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request

HIER = os.path.dirname(os.path.abspath(__file__))
BILDER = f"{HIER}/bilder"

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
ZIEL = f"{S}/horizon_takes"
os.makedirs(ZIEL, exist_ok=True)

MODELL = os.environ.get("KLING_MODELL", "fal-ai/kling-video/v2.5-turbo/pro/image-to-video")

# Was in KEINEM Take passieren darf. Der Bogen der Vorlage lebt davon, dass
# sich die Welt veraendert, ohne dass das Bild kippt: kein Schnitt, kein
# Morphen, keine Schrift, keine Roboter.
NEGATIV = (
    "text, lettering, numbers, subtitles, captions, logos, signage, watermark, "
    "glowing screens, screens as light source, visible user interfaces, dashboards, charts, "
    "light strips, glowing floor lines, holograms, wireframe overlays, data visualisations, "
    "robots, cyberpunk, neon, science fiction, futuristic architecture, glass towers, "
    "teal, cyan, turquoise, orange-and-teal grading, lens flare, bloom, heavy vignette, "
    "jump cut, scene change, hard cut, dissolve to another location, morphing architecture, "
    "warping walls, building changing shape, room dimensions changing, furniture drifting, "
    "distorted face, deformed face, melted face, disfigured face, extra limbs, missing limbs, "
    "extra fingers, fused fingers, malformed hands, wrong body proportions, duplicated person, "
    "person appearing out of nowhere, people looking at camera, stock-photo poses, "
    "camera shake, handheld wobble, whip pan, jerky motion, stuttering, flickering, "
    "3D render, CGI, plastic skin, retouched skin, HDR, oversaturation"
)

STIL = (
    " Photorealistic large-format architecture footage on Kodak Portra 400, one continuous "
    "shot, smooth motorised camera movement at a constant speed, verticals staying vertical, "
    "stable horizon, daylight only, consistent lighting from first to last frame. Limestone, "
    "concrete, oak, brass and charcoal steel. Visible film grain throughout."
)

JOBS = {
 # Feststehende Kamera. Die Halle veraendert sich, nicht der Blick: der
 # Schalter leert sich, die Beratung wandert in den Raum. Genau das ist die
 # Aussage — wer was tut, verschiebt sich, das Haus bleibt.
 "a1-a2": ("10", "a1", "a2",
   "The camera does not move at all: a locked-off tripod shot of the banking hall, identical "
   "framing from first to last frame. Within the still frame, people move at a natural walking "
   "pace: the member of staff behind the stone counter finishes, steps out from behind it and "
   "walks into the open hall to stand beside two customers; another person walks unhurried "
   "toward the stair at the back. The bars of sunlight on the terrazzo stay where they are. The "
   "architecture, the counter, the bench and the stair do not move or change in any way." + STIL),

 "a2-a3": ("5", "a2", "a3",
   "The camera glides slowly forward and turns very gently to the right, leaving the open hall "
   "and settling on the consultation alcove, where a client and an advisor sit facing each "
   "other across a small round table, already mid-conversation. They keep talking; the advisor "
   "gestures once with an open hand. Nobody stands up, nobody arrives, nobody leaves." + STIL),

 "a3-a4": ("5", "a3", "a4",
   "The camera lifts slightly and moves forward past the two seated people, out of the alcove "
   "and into a vast, immaculate, brightly daylit hall, settling on three people standing close "
   "together around one long low table near the centre of the great room. They stay in "
   "conversation: one points at the tabletop, the other two lean in and one nods. Nobody else "
   "is in the hall. Nobody arrives and nobody leaves." + STIL),

 "a4-a4c": ("5", "a4", "a4c",
   "The camera moves steadily forward past the three people at their table, across the wide "
   "terrazzo floor and out through the end of the hall into a long limestone gallery. One "
   "person crosses the near part of the gallery from right to left in profile, walking at an "
   "even pace past a row of tall closed oak doors without slowing or turning. No barrier, no "
   "counter and nobody posted anywhere." + STIL),

 "a4c-a5": ("5", "a4c", "a5",
   "The camera continues along the gallery, turns through one of the tall oak doors and settles "
   "close in front of a stone conference table in a small boardroom, where five people are "
   "already mid-decision. One speaks with a raised open hand, two turn toward her, one leans on "
   "the table edge and one begins to turn away toward the door. They keep moving naturally; "
   "hands stay clearly separated and correctly formed." + STIL),

 "a6-a7": ("10", "a6", "a7",
   "The camera draws back slowly and continuously through the empty banking hall at dusk, out "
   "through the two-storey glazed wall and across the wet paving of the empty square, coming to "
   "rest facing the lit facade of the building from close range and low down. Nobody is in the "
   "frame at any point. The movement slows and stops. Quiet, open, unresolved." + STIL),
}

# Laengenvarianten: derselbe Weg, dieselbe Bildfolge, andere Dauer. Kling
# kennt nur fuenf oder zehn Sekunden, und der Name traegt die Zahl mit
# (a2-a3_5), damit Montage und Abnahme sie daraus lesen koennen.
for _n in list(JOBS):
    _d, _s, _e, _p = JOBS[_n]
    for _l in ("5", "10"):
        JOBS[f"{_n}_{_l}"] = (_l, _s, _e, _p)


def schluessel():
    pfad = f"{S}/.fal_env"
    if not os.path.exists(pfad):
        raise SystemExit(f"{pfad} fehlt (Zeile: FAL_KEY=...)")
    return open(pfad).read().strip().split("=", 1)[1]


def daten_uri(pfad):
    return "data:image/png;base64," + base64.b64encode(open(pfad, "rb").read()).decode()


def req(url, daten=None):
    kopf = {"Authorization": "Key " + schluessel(), "content-type": "application/json"}
    leib = json.dumps(daten).encode() if daten is not None else None
    r = urllib.request.Request(url, data=leib, headers=kopf)
    try:
        with urllib.request.urlopen(r, timeout=180) as antwort:
            return antwort.status, json.load(antwort)
    except urllib.error.HTTPError as e:
        return e.code, {"fehler": e.read().decode(errors="replace")[:400]}


def drehen(name):
    dauer, start, ende, prompt = JOBS[name]
    ziel = f"{ZIEL}/{name}.mp4"
    if os.path.exists(ziel):
        print(name, "liegt schon da — erst loeschen, um neu zu drehen", flush=True)
        return ziel
    for b in (start, ende):
        if not os.path.exists(f"{BILDER}/{b}.png"):
            raise SystemExit(f"{name}: Bild {b} fehlt — erst bilder_horizon.py laufen lassen")
    print(f"{name}: {start} -> {ende}, {dauer} s", flush=True)
    s_uri, e_uri = daten_uri(f"{BILDER}/{start}.png"), daten_uri(f"{BILDER}/{ende}.png")
    koerper = {
        "prompt": prompt, "negative_prompt": NEGATIV, "duration": dauer,
        "cfg_scale": 0.8,
        "image_url": s_uri, "start_image_url": s_uri,
        "tail_image_url": e_uri, "end_image_url": e_uri,
    }
    code, antwort = req(f"https://queue.fal.run/{MODELL}", koerper)
    if code != 200:
        raise SystemExit(f"fal.ai {code}: {json.dumps(antwort)[:300]}")
    print("  eingereicht", antwort["request_id"], flush=True)
    status_url, response_url = antwort["status_url"], antwort["response_url"]
    for _ in range(180):
        time.sleep(10)
        _, st = req(status_url)
        zustand = st.get("status")
        if zustand == "COMPLETED":
            _, erg = req(response_url)
            urllib.request.urlretrieve(erg["video"]["url"], ziel)
            print("  fertig:", name, os.path.getsize(ziel) // 1024, "KB", flush=True)
            return ziel
        if zustand in ("FAILED", "ERROR"):
            raise SystemExit(f"  {name} fehlgeschlagen: " + json.dumps(st)[:300])
    raise SystemExit(f"  {name}: Zeitueberschreitung")


def reihe(namen):
    for n in namen:
        try:
            drehen(n)
        except SystemExit as e:     # ein misslungener Take darf die Reihe nicht stoppen
            print("FEHLER", n, e, flush=True)


if __name__ == "__main__":
    wunsch = sys.argv[1:] or list(JOBS)
    for n in wunsch:
        if n not in JOBS:
            raise SystemExit(f"unbekannter Take: {n} (bekannt: {', '.join(JOBS)})")
    # Beide Fassungen gleichzeitig, innerhalb einer Fassung der Reihe nach.
    a = [n for n in wunsch if n.startswith("a")]
    b = [n for n in wunsch if n.startswith("b")]
    faeden = [threading.Thread(target=reihe, args=(x,)) for x in (a, b) if x]
    for f in faeden:
        f.start()
    for f in faeden:
        f.join()
    print("KLING HORIZON FERTIG", flush=True)
