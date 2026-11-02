#!/usr/bin/env python3
"""Einzelne Takes der achten Fassung nachdrehen — Kling ueber fal.ai.

Wie die v07-Wege (`kling_wege.py`): fal.ai reicht ein ENDBILD durch
(`tail_image_url`), und darauf beruht die ganze Montage — jeder Take laeuft
von einem Standbild zum naechsten. Die native Kling-API kann das bei diesem
Modell nicht ("Image tail is not supported"), deshalb hier derselbe Weg wie
in v07.

WOFUER: Nicht die ganze Strecke neu drehen, sondern gezielt die Takes, an
denen im Review etwas beanstandet wurde. Jeder neu gedrehte Take zieht nach
sich, dass sein Weg neu montiert und abgenommen wird (siehe CLAUDE.md,
Produktionsreihenfolge).

Schluessel: $SCRATCH/.fal_env mit einer Zeile `FAL_KEY=...`.
Er wird NIE im Repo abgelegt.

    SCRATCH=… python3 kling_v08.py checkin
    SCRATCH=… python3 montage_v08.py home-s0
    FASSUNG=v08 python3 abnahme.py home-s0
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import chroma  # noqa: E402

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
ZIEL = f"{S}/kling_v08"
os.makedirs(ZIEL, exist_ok=True)

MODELL = os.environ.get("KLING_MODELL", "fal-ai/kling-video/v2.5-turbo/pro/image-to-video")


def schluessel():
    pfad = f"{S}/.fal_env"
    if not os.path.exists(pfad):
        raise SystemExit(f"{pfad} fehlt (Zeile: FAL_KEY=...)")
    return open(pfad).read().strip().split("=", 1)[1]


def quelle(name):
    """Quelle einer Station — IMMER die Fassung mit SCHWARZEM Schirm.

    Kling bekommt nie Gruen zu sehen. Die Chroma-Fassung (chroma.pfad) ist
    allein fuer das Stanzen der Standbilder da; in den Takes bleiben die
    Schirme schwarz, denn im Video ist ohnehin kein Bildschirminhalt zu
    sehen — der kommt erst mit dem Standbild. Der erste Anlauf hatte hier
    versehentlich die gruene Fassung durchgereicht, und genau daher kamen
    die gruenen Schatten in den fertigen Wegen.
    """
    for basis in (f"{HIER}/quellen_v08", f"{HIER}/quellen_v07", f"{HIER}/quellen"):
        p = f"{basis}/{name}.png"
        if os.path.exists(p):
            return p
    raise SystemExit(f"Quelle fehlt: {name}")


def daten_uri(pfad):
    return "data:image/png;base64," + base64.b64encode(open(pfad, "rb").read()).decode()


# ── Prompt-Bausteine ─────────────────────────────────────────────────────────
# Uebernommen aus kling_wege.py, damit die neuen Takes zu den alten passen.
KAMERA = (
    " THE CAMERA STAYS BEHIND HER AT ALL TIMES: it follows her from behind at a constant "
    "distance, never swings around her, never shows her face while she walks."
)
REGELN = (
    " There is exactly one of her — the woman with the dark chin-length bob and black blazer, "
    "unchanged throughout. Observational documentary style, continuous single shot, "
    "realistic motion."
)

# Die Negativliste der v07 plus das, was im Review an DIESEM Take auffiel:
# eine Statistin mit falschen Koerperproportionen und ein entstelltes Gesicht
# an der Rezeption.
NEGATIV = (
    "second copy of the main woman, duplicate person, person crossing the foreground, "
    "person blocking the camera, morphing, warping, jump cut, dissolve, scene change, "
    "objects appearing out of nowhere, objects vanishing, furniture moving by itself, "
    "distorted face, deformed face, melted face, disfigured face, blurred face, "
    "wrong body proportions, oversized head, shrunken body, dwarfed person, child body, "
    "extra limbs, missing limbs, text overlay, subtitles, watermark, "
    "flickering, inconsistent lighting, slow motion, hesitating, pausing, standing still, stalling, frozen mid-walk, chair rotating, stool turning, stool spinning, duplicated stool, extra chair, furniture drifting, wall texture changing, background morphing, picture frame moving, room dimensions changing, extra person appearing, new people in background, person changing identity, walking backwards, reversed motion, phone vanishing, object disappearing, door opening by itself, camera drifting, camera panning, green glow, green light, green reflection, green screen, green tint"
)

# Was im Hintergrund passieren SOLL — im Review war genau das der Fehler:
# Kling hat die beiden Statisten animiert und dabei entstellt. Deshalb stehen
# sie jetzt ausdruecklich still und bleiben so, wie das Standbild sie zeigt.
HINTERGRUND = (
    " The two people far away behind the curved oak reception desk remain EXACTLY as they appear "
    "in the first frame: same size, same adult body proportions, same posture, faces natural and "
    "undistorted. They barely move. Do not re-animate, re-pose or re-render them. The security "
    "barrier keeps every pedestal and every closed glass leaf exactly where it is."
)

# Die Holo-Agenten im Teamraum sind Teil des Raums, nicht ein Effekt, der
# einsetzt: sie stehen von der ersten bis zur letzten Sekunde still hinter
# ihren Menschen.
HOLO = (
    " In the meeting room, translucent holographic figures in muted teal-green SIT AT THE TABLE "
    "in the chairs between the people — one beside each person, seated exactly like the humans, "
    "clearly digital, never solid people. They are part of the room from the first frame to the "
    "last: they do not appear, fade in, stand up, walk, gesture or change. Do not turn them into "
    "real people, and do not cut any of them off."
)

# Was im Take NICHT passieren darf. Im ersten Versuch des Wohnungswegs
# drehten sich die Hocker von allein, ein zweiter tauchte auf, und die Wand
# hinter dem Sofa veraenderte ihre Textur. Kling animiert sonst alles, was es
# fuer beweglich haelt — der Raum muss also ausdruecklich stillstehen.
STILLSTAND = (
    " EVERYTHING IN THE ROOM EXCEPT HER STAYS FROZEN, exactly as in the first frame. There is "
    "exactly ONE bar stool at the island and it does not turn, roll, move or multiply — no "
    "second stool appears at any point. The sofa, coffee table, rug, floor lamp, fig tree, "
    "console table, coat hook and the framed picture stay in place and keep their exact shape. "
    "The walls keep the same colour, the same texture and the same objects on them; no surface "
    "shifts, warps or is re-rendered. The only things that move in the whole shot are Mara "
    "herself and the door leaf while she opens it."
)

# (Name, Dauer "5"/"10", Startquelle, Zielquelle, Prompt)
JOBS = {
    # Weg 1: Wohnung (07:00) -> Schranke (07:45). Das Uebergangsbild an der
    # Glastuer ist gestrichen, dieser eine Take traegt den ganzen Weg. Er
    # enthaelt bewusst eine Ellipse — der Gang durchs Treppenhaus wird nicht
    # gezeigt, sondern uebersprungen; Anfang und Ende sind die beiden
    # abgenommenen Standbilder.
    # Weg 1, erster Teil: Wohnung (07:00) -> offene Wohnungstuer. Ohne dieses
    # Zwischenbild ging Mara im Take nicht durch die Tuer, sondern durch die
    # Wand — der Raum wechselte einfach quer ueber sie hinweg.
    "wohnung_flur": (
        "10", "wohnung_rein", "flur_tuer",
        "Camera locked off in the flat: first and last frame are taken from EXACTLY the same "
        "position, so the camera must not pan, tilt, zoom or drift at any point. "
        "SHE MOVES AT A NORMAL, NATURAL PACE THROUGHOUT AND NEVER STOPS. There is no pause, no "
        "hesitation, no standing still and no slow motion anywhere in the shot — one continuous, "
        "unhurried sequence of movements that flows from one into the next. "
        "SHE KEEPS THE PHONE IN HER HAND FROM THE FIRST FRAME TO THE LAST. She never puts it "
        "down, never pockets it and it never disappears, fades out or is replaced by anything "
        "else: it is simply in her hand the whole time, held down at her side once she stands "
        "up. Nothing is left behind on the island except the cup. "
        "0-2 s she is sitting on the bar stool and lowers the phone to her lap, still holding it. "
        "2-3.5 s she stands up from the stool and turns towards the right-hand wall. "
        "3.5-6 s she walks across the room and picks up her keys from the console with her OTHER "
        "hand WITHOUT stopping, in one movement as she passes. "
        "6-7.5 s she walks the last steps to the closed oak door and, in the same movement, her "
        "free hand closes around the handle. UNTIL HER HAND IS ON THE HANDLE THE DOOR IS "
        "COMPLETELY SHUT — the leaf does not move, shift, rattle or open by so much as a "
        "millimetre. "
        "7.5-8.5 s she presses the handle down and PULLS THE LEAF OPEN TOWARDS HERSELF into the "
        "room, so that it comes to rest flat against the wall beside the door. "
        "8.5-10 s she steps into the open doorway, puts one foot down on the corridor floor "
        "beyond the threshold and walks on. She walks THROUGH the doorway, never through a wall."
        + STILLSTAND + REGELN),

    # Weg 1, zweiter Teil: von der Tuer zur Schranke. Hier sitzt die Ellipse —
    # Treppenhaus und Strasse werden uebersprungen, nicht gezeigt.
    "flur_schranke": (
        "5", "flur_tuer", "schranke",
        "She walks on down the apartment corridor away from the camera. The journey to the bank "
        "is skipped: the corridor gives way to the arrival hall of the bank, and she walks away "
        "from the camera towards the security gates, coming to a stop centred in the middle lane "
        "in front of the closed glass leaves, looking down at the phone in her hand. "
        "The barrier line, the reception desk and the people behind it stay exactly as they are "
        "in the last frame — nothing is added, moved or re-rendered there."
        + KAMERA + REGELN),

    # Weg 2, erster Teil: durch die Schranke. Der Check-in laeuft ueber die
    # Smartwatch — die Geste muss als solche lesbar sein. Und im ersten
    # Anlauf tauchten im Hintergrund fremde Personen auf; die Halle ist jetzt
    # auf genau drei Menschen festgenagelt.
    "checkin": (
        "5", "schranke", "halle_innen",
        "CAMERA LOCKED OFF. The first and the last frame are taken from EXACTLY the same camera "
        "position — the camera must not pan, tilt, zoom, track or drift by a single pixel at any "
        "point. Everything in the picture stays exactly where it is; only Mara moves. "
        "THE BARRIER DOES NOT MOVE. Every stone pedestal keeps its exact position, size and "
        "shape, the glass balustrades on the left and on the right stay put, and every lane "
        "except hers keeps its closed glass leaves. Nothing about the barrier slides, shifts, "
        "grows or is re-rendered. "
        "THE HALL CONTAINS EXACTLY THREE PEOPLE AND NO ONE ELSE: Mara, and the two receptionists "
        "far away behind the curved oak desk. Those two stay exactly as in the first frame — "
        "same faces, same clothes, same posture, barely moving, never re-rendered. Nobody "
        "enters, nobody leaves, nobody crosses the frame, nobody new appears anywhere. "
        "SHE ONLY EVER MOVES FORWARD, away from the camera, at a steady walking pace. She never "
        "steps backwards, never reverses, never pauses and never repeats a movement. "
        "THE CHECK-IN GOES VIA HER SMARTWATCH, and it must read clearly as an action: she is "
        "standing in the middle lane looking at the phone in her hand, she lowers the phone to "
        "her side, then RAISES HER OTHER ARM and holds the SMART WATCH ON HER WRIST flat "
        "against the small dark reader on the pedestal beside her for a moment — a clear, "
        "deliberate wrist-to-reader gesture. The reader acknowledges, and THE TWO GLASS LEAVES "
        "OF HER OWN MIDDLE LANE — and only those two — SLIDE APART SIDEWAYS into the pedestals. "
        "These gates have NO arms and nothing swings. She walks straight through the open lane "
        "and on into the hall, turning to her right towards the wide open oak doorway in the "
        "right-hand wall. The phone stays in her hand at her side the whole time."
        + REGELN),

    # Weg 2, zweiter Teil: von hinter der Schranke ins Buero. Sie geht nach
    # rechts durch die offene Tuer, den Flur entlang und setzt sich.
    "halle_buero": (
        "10", "halle_innen", "buero",
        "She is just past the security gates and walks on to her right, through the WIDE OPEN OAK "
        "DOORWAY in the right-hand wall of the hall, along the corridor behind it and into her "
        "office, where she sits down on the chair that already stands at her oak desk and puts "
        "her hand on the keyboard. She walks THROUGH the doorway, never through a wall. "
        "The hall does not change while she is still in it: the security barrier keeps every "
        "pedestal and every closed glass leaf exactly as in the first frame, only the lane she "
        "came through stays open. The two people behind the reception desk barely move and are "
        "never re-rendered. In the office, the large monitor on the desk keeps its flat, evenly "
        "lit screen from the moment it is in frame until the last frame — no content, no "
        "reflections, no glare appears on it."
        + KAMERA + REGELN),

    # 08:00 -> 08:05: kein Ortswechsel — sie arbeitet einfach. Feste Kamera,
    # fester Schirm; den Inhalt blendet die Montage in das bekannte Rechteck.
    "arbeit": (
        "5", "buero", "buero",
        "CAMERA LOCKED OFF — not a pixel of drift; first and last frame are identical framings. "
        "She simply works at her desk for a moment: she moves the mouse with her right hand, "
        "glances across the screen, then reaches for the stoneware mug on the right of the desk, "
        "takes an unhurried sip of coffee, puts the mug back in the same spot and returns her "
        "hand to the keyboard. Small, calm, natural movements — she never stands up, never "
        "turns around, her face is never visible. "
        "THE MONITOR DOES NOT CHANGE AT ALL: it stays a flat, even, matte black surface in its "
        "silver bezel from the first frame to the last — no content, no glow, no reflection "
        "appears on it. Nothing else in the room moves." + REGELN),

    # 08:05 -> 08:10: die Kamera faehrt zurueck. Sie bleibt sitzen, der Raum
    # oeffnet sich um sie herum.
    "weit": (
        "5", "buero", "s2b_rein",
        "SHE STAYS EXACTLY WHERE SHE IS, sitting at her desk with her hand on the keyboard; she "
        "does not stand up, turn or walk. THE CAMERA PULLS BACK smoothly and steadily in a "
        "straight line, away from the desk towards the far end of the operations floor, so that "
        "she and her desk become smaller and the whole floor comes into view around them. No pan, "
        "no tilt, no swing — a pure backward dolly. The room itself does not change: the desks, "
        "the people, the plants and the glazing stay exactly where they are, nobody appears or "
        "vanishes. Her monitor keeps its flat matte black screen throughout." + REGELN),

    # 08:10 -> 08:15: die Kamera kommt an den Platz zurueck, waehrend die
    # Kollegin zu ihr herueberkommt. Mara steht nicht auf — der Ablauf war
    # vorher unsinnig (aufstehen, drei Meter, neuer Tisch).
    "s2b_s3": (
        "10", "s2b_rein", "g_s3",
        "SHE STAYS SEATED AT HER DESK THE WHOLE TIME — she does not stand up. THE CAMERA MOVES "
        "FORWARD smoothly, back across the floor towards her desk, reversing the earlier "
        "pull-back, until it reaches the same close framing as at the start of the morning. "
        "While the camera approaches, A COLLEAGUE — a Black woman in her early thirties with "
        "short natural hair, in a rust-coloured blouse and dark trousers — walks over from the "
        "background, comes to a stop beside Mara's desk at the right, and leans slightly towards "
        "the screen with one hand resting on the desk. Both of them look at the screen. The "
        "monitor stays flat matte black throughout; nobody overlaps it." + REGELN),

    # 08:15 -> 09:00: ins Teammeeting. Der Raum hat die SITZENDEN Holo-Agenten.
    "s3s4": (
        "10", "g_s3", "besprechung",
        "She gets up from her desk, the colleague beside the desk straightens up and stays "
        "behind, and Mara walks along the corridor into the meeting room, coming to a stop just "
        "inside the door at the left of the picture, looking towards the seated colleagues, who "
        "all turn to look at her." + HOLO + KAMERA + REGELN),

    # 09:00 -> 10:30: in den Privacy-Raum. Sie setzt sich und nimmt das
    # Telefon ans Ohr — der Ausnahmefall braucht ein Gespraech.
    "s4s5": (
        "10", "besprechung", "kabine",
        "She leaves the meeting room and walks to a quiet acoustic privacy booth, sits down at "
        "the desk inside it, takes out her phone and RAISES IT TO HER EAR, beginning a call — "
        "elbow on the worktop, head slightly tilted towards the phone. The monitor in the booth "
        "stays flat matte black from the moment it is in frame." + HOLO + KAMERA + REGELN),

    # 10:30 -> 11:15: Gespraech beenden, zum Kollegen an den geteilten Platz.
    "s5s6": (
        "5", "kabine", "g_s6",
        "She LOWERS THE PHONE FROM HER EAR, ending the call, slips it into her hand at her side, "
        "leaves the booth and sits down at a shared desk where a colleague in a grey shirt is "
        "already sitting; she takes the seat beside him and puts her hand on the keyboard. The "
        "colleague stays where he is and is never re-rendered. The monitor stays flat matte "
        "black throughout." + KAMERA + REGELN),

    # 11:15 -> 14:00: in die Lounge-Ecke, aufs Telefon.
    "s6s7": (
        "10", "g_s6", "g_s7",
        "She gets up from the shared desk, walks across the floor to a quiet lounge corner by "
        "the window, sits down in the armchair, leans back, crosses one leg and looks down at "
        "the phone in her hand. The colleague she was sitting with stays at his desk."
        + KAMERA + REGELN),

    # 14:00 -> 15:30: aus dem Sessel zurueck an ihren Platz.
    "s7s8": (
        "10", "g_s7", "g_s8",
        "She gets up from the armchair, the phone in her hand, and walks back to her own desk in "
        "the late afternoon light, sitting down and resting one hand on the desk beside the "
        "keyboard. The monitor stays flat matte black throughout." + KAMERA + REGELN),

    "s8s9": (
        "5", "g_s8", "g_s9",
        "She gets up and walks into the review room next door, sitting down at the long oak table "
        "and leaning back with one arm over the back of her chair. The monitor stays flat matte "
        "black throughout." + KAMERA + REGELN),

    # 16:00 -> 17:00: der Tag endet auf dem Dachgarten.
    "s9s10": (
        "10", "g_s9", "s10_169",
        "She gets up from the review table, walks out of the room and up onto the roof garden, "
        "coming to a stop at the glass balustrade and looking out over the city in the low "
        "evening sun. The terrace, the planting and the furniture stay exactly as they are."
        + KAMERA + REGELN),
}

def req(url, daten=None):
    kopf = {"Authorization": "Key " + schluessel(), "content-type": "application/json"}
    leib = json.dumps(daten).encode() if daten is not None else None
    r = urllib.request.Request(url, data=leib, headers=kopf)
    try:
        with urllib.request.urlopen(r, timeout=120) as antwort:
            return antwort.status, json.load(antwort)
    except urllib.error.HTTPError as e:
        return e.code, {"fehler": e.read().decode(errors="replace")[:400]}


def drehen(name):
    dauer, start, ende, prompt = JOBS[name]
    ziel = f"{ZIEL}/{name}.mp4"
    if os.path.exists(ziel):
        print(name, "liegt schon da — erst loeschen, um neu zu drehen", flush=True)
        return ziel
    print(f"{name}: {start} -> {ende}, {dauer} s", flush=True)
    s_uri, e_uri = daten_uri(quelle(start)), daten_uri(quelle(ende))
    koerper = {
        "prompt": prompt, "negative_prompt": NEGATIV, "duration": dauer,
        "cfg_scale": 0.8,
        "image_url": s_uri, "start_image_url": s_uri,
        "tail_image_url": e_uri, "end_image_url": e_uri,
    }
    code, antwort = req(f"https://queue.fal.run/{MODELL}", koerper)
    if code != 200:
        raise SystemExit(f"fal.ai {code}: {json.dumps(antwort)[:300]}")
    status_url, response_url = antwort["status_url"], antwort["response_url"]
    print("  eingereicht", antwort["request_id"], flush=True)
    for _ in range(180):
        time.sleep(10)
        _, st = req(status_url)
        zustand = st.get("status")
        if zustand == "COMPLETED":
            _, erg = req(response_url)
            urllib.request.urlretrieve(erg["video"]["url"], ziel)
            print("  fertig:", ziel, os.path.getsize(ziel) // 1024, "KB", flush=True)
            return ziel
        if zustand in ("FAILED", "ERROR"):
            raise SystemExit("  fehlgeschlagen: " + json.dumps(st)[:300])
    raise SystemExit("  Zeitueberschreitung")


if __name__ == "__main__":
    namen = sys.argv[1:] or list(JOBS)
    for n in namen:
        if n not in JOBS:
            raise SystemExit(f"unbekannter Take: {n} (bekannt: {', '.join(JOBS)})")
        drehen(n)
    print("KLING V08 FERTIG", flush=True)
    print("Danach: SCRATCH=… python3 montage_v08.py home-s0 && "
          "FASSUNG=v08 python3 abnahme.py home-s0", flush=True)
