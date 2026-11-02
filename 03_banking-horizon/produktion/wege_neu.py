#!/usr/bin/env python3
"""v06-Neudreh: viele kurze Takes, aus denen die Uebergaenge geschnitten werden.

Architektur (Entscheidung 19.08., nach der Software-Recherche):
  * Kein Take laenger als noetig — 4 s fuer eine Kamerafahrt oder eine kleine
    Handlung, 6 s fuer Aufstehen+Gehen+Setzen, 8 s nur fuer die Wohnung
    (vier Beats) und den Kacheltraeger (Blendenzeit).
  * Jeder Raumwechsel ist eine KETTE aus zwei Takes mit einem ANKER in der
    Mitte: A endet auf einem Bild, das den Zielraum WEIT zeigt — mitsamt
    seiner Bildschirmflaeche in Chroma —, B faehrt von genau diesem Bild in
    die Endeinstellung. Ein Schirm kann so nicht mehr "aus dem Nichts"
    entstehen: jedes Teilstueck ist an einem Bild verankert, auf dem er
    schon existiert (Erst-Sichtbarkeits-Regel im Pruefplan).
  * Anker und gruene Stills baut anker.py; alle Quellen liegen versioniert
    in quellen/.

Betriebsregeln Veo (Recherche 08/2026):
  * Ohne Audio generieren — halbiert die Kosten.
  * Referenzbilder: NICHT nutzbar — Vertex lehnt referenceImages in
    Kombination mit Startbild ab ("Image and reference images cannot be
    both set", gemessen 19.08.). Die Identitaet traegt stattdessen jedes
    Start-, Anker- und Zielbild selbst: Mara steht konsistent darin.
  * Eine physische Aktion + eine Kamerabewegung pro Take; Subjekt und
    Aktion an den Prompt-Anfang; Zeitfenster fuer getaktete Interaktionen.
  * Gruenflaeche: matter, flacher Chroma-Baustein im Prompt UND die
    Flaechen-Substantive in der Negativliste.
"""
import base64
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.request

S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                              "4a027885-72f4-58d1-b5d9-f5090d47fbf4/scratchpad")
sys.path.insert(0, S)
from gcp_token import token  # noqa: E402

HIER = os.path.dirname(os.path.abspath(__file__))
Q = f"{HIER}/quellen"
MARA_REF = f"{Q}/mara_ref.png"
ZIEL = f"{S}/veo_v06"
PROJECT, MODEL = "dgcp-sandbox-ebrenneisen", "veo-3.1-generate-001"
REGIONEN = ["us-central1"]

NEGATIV = (
    "second person, extra person, duplicate of the woman, person crossing the foreground, "
    "person walking past the camera, crowd, different woman, changed hairstyle, long hair, "
    "door opening by itself, door ajar before contact, door swinging towards the camera, "
    "furniture moving by itself, chair rolling on its own, objects appearing out of nowhere, "
    "objects vanishing, gates appearing suddenly, interior changing style, morphing, warping, "
    "distorted faces, extra limbs, jump cut, text overlay, subtitles, watermark, camera shake, "
    "turnstile arm, barrier arm, boom barrier, rotating arm, swinging rod, "
    "texture on the green screen, reflections on the green screen, glare on the screen, "
    "content appearing on the screen, invented interface, flickering, inconsistent lighting"
)

RUECKEN = (
    " She is seen STRICTLY FROM BEHIND whenever she moves: her back towards the camera, she "
    "never turns her head or face towards the lens."
)
REGELN = (
    " She carries no bag. There is exactly one of her in the frame at all times — the woman with "
    "the dark chin-length bob, black blazer, white top and dark navy trousers, unchanged "
    "throughout. Observational documentary style, continuous single shot, realistic motion. "
    "Quiet room tone only."
)
GRUEN = (
    " EVERY SCREEN IN THE FRAME STAYS A COMPLETELY FLAT, UNIFORM, MATTE, SATURATED CHROMA-KEY "
    "GREEN RECTANGLE FROM THE FIRST FRAME TO THE LAST — a clean solid matte green screen "
    "surface: nothing is ever displayed on it, no reflection, no glare, no texture, no flicker."
)
FAHRT = (
    " MOVING CAMERA, LOCKED SCENE: the camera dollies smoothly and steadily forward from this "
    "wide framing to the exact final framing; she stays where she is, working calmly with small "
    "natural movements; no furniture moves, nothing appears or vanishes, the room stays "
    "identical."
)

# (Name, Dauer s, Startbild, Zielbild oder None, Prompt)
JOBS = [
    ("glas1", 8, f"{Q}/wohnung_rein.png", None,
     "LOCKED-OFF SHOT in the apartment, the camera fixed for the whole take. She is alone, "
     "sitting at the stone island, reading her phone — the phone screen faces her, its back to "
     "the camera. Four beats, in order: FIRST she finishes reading and lays the phone flat on "
     "the island beside the espresso cup. SECOND she stands up and walks towards the closed oak "
     "door in the far wall, seen from behind. THIRD she stops at the door, her hand closes "
     "around the black lever handle on the LEFT edge of the leaf, the lever tips down, and the "
     "leaf — hinged on its RIGHT edge — SWINGS AWAY FROM THE CAMERA, opening INTO THE HALLWAY "
     "BEYOND THE WALL; at no moment does the leaf swing towards the camera or into the kitchen. "
     "FOURTH she walks forward through the doorway and is gone; the room stands still for the "
     "last second. The door stays fully closed until beat three."
     + RUECKEN + REGELN),

    ("glas2", 4, f"{Q}/glastuer_169.png", f"{Q}/schranke.png",
     "Continuous single shot that begins exactly on this frame, her hand already on the vertical "
     "steel handle of the glass entrance door. THE DOOR IS ALREADY MOVING IN THE VERY FIRST "
     "FRAME: within the first second it swings open, sweeps past the camera and out of frame, "
     "revealing the arrival hall — and DIRECTLY AHEAD, ALREADY VISIBLE IN THE MOMENT OF THE "
     "REVEAL, the row of slim glass speed gates on their pale stone pedestals, exactly as the "
     "hall really is: oak reception counter to the left, planted island, glass facade with the "
     "Frankfurt skyline. She walks straight to the nearest gate, stops in front of it and raises "
     "her wrist with the smart watch towards its small dark reader. The receptionist and the "
     "seated colleagues stay where they are; nobody walks through the picture."
     + RUECKEN + REGELN),

    ("checkin", 4, f"{Q}/schranke.png", f"{Q}/halle_innen.png",
     "Continuous single shot that begins exactly on this frame: she stands at the speed gate, "
     "wrist raised to the small dark reader. IN THE FIRST SECOND THE CHECK-IN HAPPENS: the "
     "reader lights up briefly and THE TWO VERTICAL GLASS LEAVES OF HER GATE SLIDE APART SIDEWAYS, "
     "RETRACTING INTO THE PEDESTALS — these gates have NO arms and NO rotating parts, only the "
     "sliding glass leaves. She lowers her arm and walks through without pausing; behind her the "
     "leaves slide closed again. She continues a few metres into the hall towards the wide open "
     "door in the right-hand wall and comes to an easy stop, still seen from behind, the gates "
     "now behind her. The receptionist and the seated colleagues stay exactly where they are."
     + RUECKEN + REGELN),

    ("s0s1_a", 6, f"{Q}/halle_innen.png", f"{Q}/s2b_rein.png",
     "Continuous single shot: from her position behind the gates she walks away from the camera "
     "through the wide open door in the right-hand wall and along a short lit corridor into her "
     "office. THE OFFICE AND ITS DESK MONITOR ARE VISIBLE THROUGH THE DOORWAY FROM THE FIRST "
     "MOMENT THE DOORWAY IS IN FRAME — the monitor already stands on the curved oak desk, never "
     "appearing or growing. She sits down on the chair that already stands in its place; the "
     "shot ends exactly on this wide view of the office."
     + GRUEN + RUECKEN + REGELN),
    ("s0s1_b", 4, f"{Q}/s2b_rein.png", f"{Q}/buero_gruen.png", FAHRT + GRUEN + REGELN),

    ("s1s2", 4, f"{Q}/buero_gruen.png", f"{Q}/g_s2.png",
     "LOCKED-OFF SHOT: the camera stays exactly where it is. She works at her desk, seen from "
     "behind over her shoulder: she moves the mouse, glances at the tablet, reaches for the "
     "sage-green mug and sets it back. The room, the furniture and the camera stay unchanged."
     + GRUEN + REGELN),

    ("weit", 8, f"{Q}/s2b_rein.png", f"{Q}/s2b_rein.png",
     "LOCKED-OFF SHOT: the camera stays exactly where it is and she stays in her seat, seen from "
     "behind over her shoulder in this wide view of the office. The scene is alive in small "
     "ways: she works the mouse, reaches for the sage-green mug and drinks, sets it back in the "
     "same place, glances at the tablet on the desk. Daylight shifts gently. The room, the "
     "furniture and the camera stay unchanged, and the ENTIRE RIGHT HALF OF THE FRAME STAYS "
     "EXACTLY AS IT IS: open empty room, nothing appears in it."
     + GRUEN + REGELN),

    ("s3s4_a", 6, f"{Q}/g_s3.png", f"{Q}/a_bespr.png",
     "Continuous single shot: she stands up from her desk, walks out of the office and along "
     "the corridor towards the round meeting room. THE MEETING ROOM IS COMPLETE FROM THE FIRST "
     "MOMENT ANY PART OF IT IS VISIBLE: six colleagues already seated around the oval table, "
     "and THE VERY WIDE WALL DISPLAY ALREADY MOUNTED high on the far wall above their heads — "
     "never appearing, never growing. She comes to a stop at the near end of the table; the "
     "shot ends exactly on this wide view of the room."
     + GRUEN + RUECKEN + REGELN),
    ("s3s4_b", 4, f"{Q}/a_bespr.png", f"{Q}/besprechung_gruen.png",
     " MOVING CAMERA, LOCKED SCENE: the camera dollies smoothly forward from this wide framing "
     "to the exact final framing; she stands at the near end of the table listening, the six "
     "colleagues stay seated, nobody stands up, nothing appears or vanishes."
     + GRUEN + REGELN),

    ("s4s5_a", 6, f"{Q}/besprechung_gruen.png", f"{Q}/a_kabine.png",
     "Continuous single shot: she turns from the table, leaves the meeting room and walks "
     "across the open floor to the curved white acoustic focus pod. THE POD IS COMPLETE FROM "
     "THE FIRST MOMENT ANY PART OF IT IS VISIBLE: its small oak desk, its chair AND ITS LARGE "
     "BUILT-IN SCREEN are already there whenever the pod interior is in frame — the screen "
     "never appears, never grows. She sits down on the chair that already stands in place; the "
     "shot ends exactly on this wide view of the pod."
     + GRUEN + RUECKEN + REGELN),
    ("s4s5_ab", 4, f"{Q}/besprechung_gruen.png", None,
     "LOCKED-OFF SHOT, THE CAMERA NEVER MOVES AND THE SCENE NEVER CHANGES: she turns away from "
     "the oval table and walks towards the wide open doorway of the meeting room, seen from "
     "behind. THE MEETING ROOM STAYS THE MEETING ROOM for the whole take — the six colleagues "
     "stay seated exactly where they are, the wide wall display stays mounted where it is, no "
     "other place ever appears. The take ends while she is still walking."
     + GRUEN + RUECKEN + REGELN),
    ("s4s5_b", 4, f"{Q}/a_kabine.png", f"{Q}/kabine_gruen.png", FAHRT + GRUEN + REGELN),

    ("s5s6", 4, f"{Q}/kabine_gruen.png", f"{Q}/g_s6.png",
     "LOCKED-OFF SHOT: the camera stays exactly where it is. She sits in the acoustic pod at "
     "its small oak desk, seen from behind, and works calmly: mouse, a glance at the tablet, a "
     "sip from the mug set back in the same place. Room, furniture and camera stay unchanged."
     + GRUEN + REGELN),

    ("s6s7_a", 6, f"{Q}/g_s6.png", f"{Q}/a_werk.png",
     "ONE UNBROKEN CAMERA MOVE, ABSOLUTELY NO CUTS: the camera pulls back with her as she stands "
     "up and steps out of the acoustic pod, then follows her at a constant distance across the "
     "floor into the small focused workroom — the walk itself stays fully visible. THE WORKROOM IS COMPLETE FROM THE FIRST MOMENT "
     "ANY PART OF IT IS VISIBLE THROUGH ITS DOORWAY: the desk, the whiteboard and THE MONITOR "
     "ALREADY ON THE DESK — never appearing, never growing. She sits down on the chair that "
     "already stands in place; the shot ends exactly on this view from the doorway."
     + GRUEN + RUECKEN + REGELN),
    ("s6s7_auf", 4, f"{Q}/g_s6.png", None,
     "LOCKED-OFF SHOT, THE CAMERA NEVER MOVES AND THE SCENE NEVER CHANGES: inside the acoustic "
     "pod she pushes the chair back and stands up from the small oak desk, then turns towards "
     "the pod opening, seen from behind. THE POD STAYS THE POD for the whole take, its built-in "
     "screen stays exactly where it is, no other place ever appears. The take ends while she is "
     "still turning."
     + GRUEN + RUECKEN + REGELN),
    ("s6s7_b", 4, f"{Q}/a_werk.png", f"{Q}/g_s7.png", FAHRT + GRUEN + REGELN),

    ("s7s8_a", 6, f"{Q}/g_s7.png", f"{Q}/s2b_rein.png",
     "Continuous single shot: she stands up, leaves the workroom and walks back across the "
     "office floor to her own desk. THE WORKROOM MONITOR STAYS SOLID, OPAQUE AND FULLY GREEN "
     "ON ITS DESK the whole time it is in frame — it never fades, never turns translucent, "
     "never disappears; it simply leaves the frame as the camera moves. HER OFFICE IS COMPLETE FROM THE FIRST MOMENT ANY PART OF "
     "IT IS VISIBLE: THE VERY SAME wide curved oak desk as in the final image with THE MONITOR ALREADY ON IT — no other desk, no smaller desk, never appearing, "
     "never growing. She sits down on the chair that already stands in its place; the shot "
     "ends exactly on this wide view of the office."
     + GRUEN + RUECKEN + REGELN),
    ("s7s8_b", 4, f"{Q}/s2b_rein.png", f"{Q}/g_s8.png", FAHRT + GRUEN + REGELN),

    ("s8s9", 4, f"{Q}/g_s8.png", f"{Q}/g_s9.png",
     "LOCKED-OFF SHOT: the camera stays exactly where it is. She works at her desk, seen from "
     "behind over her shoulder: small natural movements, mouse, a glance at the tablet. The "
     "room, the furniture and the camera stay unchanged."
     + GRUEN + REGELN),

    ("s9s10_a", 4, f"{Q}/g_s9.png", None,
     "ONE UNBROKEN CAMERA MOVE, ABSOLUTELY NO CUTS AND NO DISSOLVES: she stands up from her "
     "desk and walks away from the camera towards the office door, seen from behind. THE OFFICE "
     "STAYS THE OFFICE FOR THE WHOLE TAKE — the monitor stays on the desk exactly where it is, "
     "the room never changes, no other place ever appears. The take simply ends while she is "
     "still walking."
     + GRUEN + RUECKEN + REGELN),
    ("s9s10_b", 4, f"{Q}/a_dach.png", f"{Q}/s10_169.png",
     " MOVING CAMERA, LOCKED SCENE: the camera dollies smoothly forward from this wide framing "
     "to the exact final framing; she stands on the roof deck looking out at the skyline, calm "
     "and still, her back or profile to the camera; nothing appears or vanishes."
     + REGELN),
]


def b64(p):
    with open(p, "rb") as fh:
        return base64.b64encode(fh.read()).decode()


def req(url, body):
    r = urllib.request.Request(url, data=json.dumps(body).encode(), method="POST")
    r.add_header("Authorization", f"Bearer {token()}")
    r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r, timeout=300) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        # Der Fehlergrund steht im Body — fuer den Referenzbild-Rueckfall.
        raise RuntimeError(f"HTTP {e.code}: {e.read().decode(errors='replace')[:400]}") from None


sperre = threading.Semaphore(3)
druck = threading.Lock()


def rendere(name, dauer, start, ende, prompt):
    ziel = f"{ZIEL}/{name}.mp4"
    if os.path.exists(ziel):
        with druck:
            print(name, "existiert, skip", flush=True)
        return
    instanz = {"prompt": prompt,
               "image": {"bytesBase64Encoded": b64(start), "mimeType": "image/png"}}
    if ende:
        instanz["lastFrame"] = {"bytesBase64Encoded": b64(ende), "mimeType": "image/png"}
    body = {"instances": [instanz],
            "parameters": {"aspectRatio": "16:9", "durationSeconds": dauer,
                           "resolution": "1080p", "sampleCount": 1, "generateAudio": False,
                           "seed": 20300819 + sum(ord(c) for c in name) + int(os.environ.get("SEED_PLUS", "0")),
                           "negativePrompt": NEGATIV}}
    with sperre:
        for versuch in range(12):
            region = REGIONEN[0]
            basis = (f"https://{region}-aiplatform.googleapis.com/v1/projects/{PROJECT}"
                     f"/locations/{region}/publishers/google/models/{MODEL}")
            try:
                op = req(f"{basis}:predictLongRunning", body)["name"]
                t0 = time.time()
                while True:
                    time.sleep(15)
                    st = req(f"{basis}:fetchPredictOperation", {"operationName": op})
                    if st.get("done"):
                        vids = st.get("response", {}).get("videos") or []
                        if not vids:
                            raise RuntimeError(json.dumps(st)[-300:])
                        raw = base64.b64decode(vids[0]["bytesBase64Encoded"])
                        with open(ziel, "wb") as fh:
                            fh.write(raw)
                        with druck:
                            print(f"{name} ok, {len(raw) // 1024} KB", flush=True)
                        return
                    if time.time() - t0 > 900:
                        raise RuntimeError("timeout")
            except Exception as e:
                fehler = str(e)
                # Lehnt die API referenceImages ab (etwa in Kombination mit
                # lastFrame), laufen die weiteren Versuche ohne Referenz.
                if "referenceImages" in instanz and (
                        "reference" in fehler.lower() or "INVALID_ARGUMENT" in fehler):
                    del instanz["referenceImages"]
                    with druck:
                        print(name, "ohne Referenzbild weiter:", fehler[:110], flush=True)
                    continue
                with druck:
                    print(name, "retry", versuch + 1, fehler[:140], flush=True)
                time.sleep(min(120, 15 * (versuch + 1)))
        with druck:
            print(name, "FEHLGESCHLAGEN", flush=True)


if __name__ == "__main__":
    os.makedirs(ZIEL, exist_ok=True)
    nur = set(sys.argv[1:])
    faeden = [threading.Thread(target=rendere, args=j) for j in JOBS if not nur or j[0] in nur]
    print(len(faeden), "Aufnahmen, drei gleichzeitig", flush=True)
    for f in faeden:
        f.start()
    for f in faeden:
        f.join()
    print("WEGE V06 FERTIG", flush=True)
