#!/usr/bin/env python3
"""v07-Wege mit Kling (fal.ai): direkte Takes statt Anker-Ketten.

Der A/B-Vergleich (kling_probe) hat gezeigt: Kling blendet beim
Raumwechsel nicht und trifft das Zielbild auf 3-4 Graustufen — die
Ellipsen-Kruecken der v06 entfallen. Raumwechsel sind EIN 10-s-Take
Start-Still -> Ziel-Still, kleine Szenen 5 s. Einzige verbleibende
Ellipse: der Stockwerkswechsel aufs Dach (physisch kein Kameraweg).

Kling-Eigenheit aus dem Vergleich: die Rueckenansicht wird beim Gehen
nicht zuverlaessig gehalten — der Prompt bindet die Kamera deshalb
EXPLIZIT hinter sie. Statisten sind in v07 erwuenscht (belebte Stills);
die Negativliste verbietet nur noch Duplikate, Vordergrund-Kreuzer und
die Flaechen-/Morph-Defekte.

Quellen: quellen_v07/<name>.png (belebt) gewinnt vor quellen/<name>.png.
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
HIER = os.path.dirname(os.path.abspath(__file__))
ZIEL = f"{S}/kling_v07"
os.makedirs(ZIEL, exist_ok=True)

KEY = open(f"{S}/.fal_env").read().strip().split("=", 1)[1]
MODELL = os.environ.get("KLING_MODELL", "fal-ai/kling-video/v2.5-turbo/pro/image-to-video")


def quelle(name):
    for basis in (f"{HIER}/quellen_v07", f"{HIER}/quellen"):
        p = f"{basis}/{name}.png"
        if os.path.exists(p):
            return p
    raise SystemExit(f"Quelle fehlt: {name}")


NEGATIV = (
    "second copy of the main woman, duplicate person, person crossing the foreground, "
    "person blocking the camera, morphing, warping, jump cut, dissolve, scene change, "
    "objects appearing out of nowhere, objects vanishing, furniture moving by itself, "
    "distorted faces, extra limbs, text overlay, subtitles, watermark, "
    "texture on the green screen, reflections on the green screen, glare on the screen, "
    "content appearing on the screen, flickering, inconsistent lighting"
)

KAMERA = (
    " THE CAMERA STAYS BEHIND HER AT ALL TIMES: it follows her from behind at a constant "
    "distance, never swings around her, never shows her face while she walks."
)
REGELN = (
    " There is exactly one of her — the woman with the dark chin-length bob and black blazer, "
    "unchanged throughout. Background people stay calm and where they are, faces natural. "
    "Every screen stays a completely flat, uniform, matte, saturated chroma-key green "
    "rectangle wherever it is visible — no reflection, no texture, nothing displayed. "
    "Observational documentary style, continuous single shot, realistic motion."
)

# (Name, Dauer "5"/"10", Startquelle, Zielquelle oder None, Prompt)
JOBS = [
    ("glas1", "10", "wohnung_rein", None,
     "Locked-off camera in the apartment. She finishes reading her phone and lays it flat on "
     "the stone island beside the espresso cup, stands up, walks to the closed oak door in the "
     "far wall, presses its black lever handle on the LEFT edge, and the leaf — hinged on the "
     "RIGHT — swings AWAY from the camera into the hallway; she walks through and is gone. The "
     "door stays fully closed until her hand is on the handle." + REGELN),
    ("glas2", "5", "glastuer_169", "schranke",
     "Her hand is already on the vertical steel handle of the glass entrance door; the door "
     "swings open past the camera and reveals the arrival hall with its row of glass speed "
     "gates on pale stone pedestals. She walks straight to the nearest gate, stops, and raises "
     "her wrist with the smart watch to its small dark reader. The people in the hall stay "
     "where they are." + KAMERA + REGELN),
    ("checkin", "5", "schranke", "halle_innen",
     "The reader lights up and the TWO VERTICAL GLASS LEAVES of her gate SLIDE APART SIDEWAYS "
     "into the pedestals — these gates have NO arms. She walks through without pausing, the "
     "leaves close behind her, and she continues a few metres into the hall towards the wide "
     "open door in the right-hand wall, coming to an easy stop. The people in the hall stay "
     "where they are." + KAMERA + REGELN),
    ("s0s1", "10", "halle_innen", "buero_gruen",
     "She walks from her spot behind the gates through the wide open door in the right-hand "
     "wall, along the corridor into her office, and sits down on the chair that already stands "
     "at her curved oak desk. The office and its monitor are visible through the doorway from "
     "the first moment the doorway is in frame." + KAMERA + REGELN),
    ("s1s2", "5", "buero_gruen", "g_s2",
     "Locked-off camera. She works at her desk: mouse, a glance at the tablet, reaches for the "
     "sage-green mug and sets it back. Room, furniture and camera stay unchanged." + REGELN),
    ("weit", "10", "s2b_rein", "s2b_rein",
     "Locked-off camera, wide view of the office. She stays seated and works in small natural "
     "ways: mouse, a sip from the mug set back in the same place, a glance at the tablet. "
     "Daylight shifts gently. THE ENTIRE RIGHT HALF OF THE FRAME STAYS EXACTLY AS IT IS: open, "
     "empty floor — nothing appears in it." + REGELN),
    ("s3s4", "10", "g_s3", "besprechung_gruen",
     "She stands up from her desk and walks along the corridor into the round meeting room, "
     "where six colleagues already sit around the oval table, and stops at the near end of the "
     "table. The meeting room is complete from the first moment any part of it is visible — "
     "the very wide wall display already mounted above their heads, never appearing, never "
     "growing." + KAMERA + REGELN),
    ("s4s5", "10", "besprechung_gruen", "kabine_gruen",
     "She turns from the table, leaves the meeting room and walks across the open floor to the "
     "curved white acoustic focus pod, and sits down on the chair that already stands at its "
     "small oak desk. The pod is complete from the first moment any part of it is visible — "
     "its built-in screen already there, never appearing, never growing." + KAMERA + REGELN),
    ("s5s6", "5", "kabine_gruen", "g_s6",
     "Locked-off camera. She sits in the acoustic pod and works calmly: mouse, a glance at the "
     "tablet, a sip from the mug set back in the same place. Room, furniture and camera stay "
     "unchanged." + REGELN),
    ("s6s7", "10", "g_s6", "g_s7",
     "She stands up, steps out of the acoustic pod and walks across the floor into the small "
     "focused workroom with the whiteboard, and sits down at its desk. Every room she passes "
     "is complete from the first moment it is visible; the workroom monitor already stands on "
     "its desk." + KAMERA + REGELN),
    ("s7s8", "10", "g_s7", "g_s8",
     "She stands up, leaves the workroom and walks back across the office floor to her own "
     "curved oak desk, and sits down. The workroom monitor stays solid and opaque while in "
     "frame — it simply leaves the frame as the camera moves; her own monitor is visible from "
     "the first moment her desk is." + KAMERA + REGELN),
    ("s8s9", "5", "g_s8", "g_s9",
     "Locked-off camera. She works at her desk: small natural movements, mouse, a glance at "
     "the tablet. Room, furniture and camera stay unchanged." + REGELN),
    ("s9s10_a", "5", "g_s9", None,
     "She stands up from her desk and walks away from the camera towards the office door, "
     "seen from behind. THE OFFICE STAYS THE OFFICE for the whole take — the monitor stays on "
     "the desk exactly where it is, no other place ever appears; the take ends while she is "
     "still walking." + REGELN),
    ("s9s10_b", "5", "a_dach", "s10_169",
     "Moving camera, locked scene: the camera dollies smoothly forward from this wide framing "
     "to the final framing; she stands on the roof deck looking out at the evening skyline, "
     "calm and still; nothing appears or vanishes." + REGELN),
]


def daten_uri(pfad):
    return "data:image/png;base64," + base64.b64encode(open(pfad, "rb").read()).decode()


def req(url, body=None):
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body else None,
                               method="POST" if body else "GET")
    r.add_header("Authorization", f"Key {KEY}")
    r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r, timeout=300) as resp:
            return resp.status, json.load(resp)
    except urllib.error.HTTPError as e:
        return e.code, {"fehler": e.read().decode(errors="replace")[:400]}


druck = threading.Lock()
sperre = threading.Semaphore(4)


def rendere(name, dauer, start, ende, prompt):
    ziel = f"{ZIEL}/{name}.mp4"
    if os.path.exists(ziel):
        with druck:
            print(name, "existiert, skip", flush=True)
        return
    s, e = daten_uri(quelle(start)), daten_uri(quelle(ende)) if ende else None
    body = {"prompt": prompt, "negative_prompt": NEGATIV, "duration": dauer,
            "cfg_scale": 0.8, "image_url": s, "start_image_url": s}
    if e:
        body["tail_image_url"] = e
        body["end_image_url"] = e
    with sperre:
        for versuch in range(4):
            code, antwort = req(f"https://queue.fal.run/{MODELL}", body)
            if code != 200:
                with druck:
                    print(name, "Einreichung", code, json.dumps(antwort)[:160], flush=True)
                time.sleep(20 * (versuch + 1))
                continue
            status_url, response_url = antwort["status_url"], antwort["response_url"]
            for _ in range(150):
                time.sleep(10)
                _, st = req(status_url)
                if st.get("status") == "COMPLETED":
                    _, erg = req(response_url)
                    urllib.request.urlretrieve(erg["video"]["url"], ziel)
                    with druck:
                        print(name, "ok,", os.path.getsize(ziel) // 1024, "KB", flush=True)
                    return
                if st.get("status") in ("FAILED", "ERROR"):
                    with druck:
                        print(name, "failed:", json.dumps(st)[:160], flush=True)
                    break
            time.sleep(15)
        with druck:
            print(name, "FEHLGESCHLAGEN", flush=True)


if __name__ == "__main__":
    nur = set(sys.argv[1:])
    faeden = [threading.Thread(target=rendere, args=j) for j in JOBS if not nur or j[0] in nur]
    print(len(faeden), "Kling-Takes,", MODELL, flush=True)
    for f in faeden:
        f.start()
    for f in faeden:
        f.join()
    print("KLING WEGE FERTIG", flush=True)
