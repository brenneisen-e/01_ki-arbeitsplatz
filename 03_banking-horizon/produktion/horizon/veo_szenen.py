#!/usr/bin/env python3
"""Die Wege der zehn Szenen — Google Veo 3.1 ueber Vertex AI.

Anders als in allen Fassungen davor faehrt hier NICHTS von einem Bild zum
naechsten. Die zehn Szenen sind zehn eigenstaendige Orte; jeder Take ist
eine kleine Bewegung INNERHALB seiner Szene, und zwischen den Szenen wird
ueberblendet. Das ist der Grund, warum die Qualitaet steigt: ein
Videomodell, das nur atmen muss statt zu reisen, verzerrt nichts — und
genau das Reisen hat die Gesichter und die Anschluesse gekostet.

Kein `lastFrame` also, nur ein Startbild je Take.

Schluessel: $SCRATCH/.veo_sa.json (Service-Account veo-video-gen,
Projekt dgcp-sandbox-ebrenneisen). Nie im Repo.

    SCRATCH=… python3 veo_szenen.py          # alle zehn
    SCRATCH=… python3 veo_szenen.py s3       # einzeln
"""
import base64
import json
import os
import subprocess
import sys
import threading
import time

import imageio_ffmpeg
import requests
from google.auth.transport.requests import Request
from google.oauth2 import service_account

HIER = os.path.dirname(os.path.abspath(__file__))
BILDER = f"{HIER}/szenen"
HYPOTHESEN = f"{HIER}/hypothesen"
S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
ZIEL = f"{S}/veo_szenen"
os.makedirs(ZIEL, exist_ok=True)

PROJEKT, ORT = "dgcp-sandbox-ebrenneisen", "us-central1"
MODELL = os.environ.get("VEO_MODELL", "veo-3.1-generate-001")
BASIS = (f"https://{ORT}-aiplatform.googleapis.com/v1/projects/{PROJEKT}"
         f"/locations/{ORT}/publishers/google/models/{MODELL}")

# Bewegung, nicht Reise. Jeder Take bleibt in seinem Raum.
# Nachtrag 11.09.: Die erste Runde der k-Takes hat einen Fehler offengelegt,
# der in den Anweisungen stand, nicht im Modell. Wo im Text ein Abgang
# vorkam ("turns to go back in", "starts down the stairs"), hat Veo ihn
# ausgefuehrt — und der Take endete auf einem Ruecken oder einem leeren
# Treppenhaus. Zweimal fielen ausserdem am Ende alle Blicke auf die
# Tischplatte, weil eine Geste "auslaufen" darf. Beides kostet genau das,
# worum es dem Auftraggeber geht: Menschen, die man erkennt. Seitdem steht
# die Regel im Stil, und in den Anweisungen kommt kein Abgang mehr vor.
STIL = (" Photorealistic live-action footage, one continuous shot, smooth and very slow camera "
        "movement, stable horizon, natural available light, consistent lighting from first to "
        "last frame. Faces stay sharp, natural and undistorted throughout; hands keep five "
        "separated fingers. Documentary realism. Everyone stays in frame for the whole shot and "
        "nobody walks away, leaves or turns their back to the camera. Faces remain visible and "
        "readable to the very last frame; nobody drops their gaze to the table or the floor. "
        "The shot ends with the scene still alive, not resolved.")

# Fuer die Hypothesen-Einstellungen: Kamera fest, Inhalt fest. Was sich hier
# bewegen darf, sind ausschliesslich die Menschen.
STIL_FEST = (" Photorealistic live-action footage, one continuous shot. The camera is locked "
             "off on a tripod: no pan, no tilt, no zoom, no push-in, no camera movement of any "
             "kind. Every screen, display and interface in the frame is frozen: identical "
             "words, numbers, icons and colours in the first and in the last frame. Only the "
             "people move, and only a little. Faces stay sharp and undistorted, hands keep "
             "five separated fingers, everyone stays in frame and nobody walks away.")

# Fuer die Hypothesen-Einstellungen ein EIGENER Negativ-Prompt. Der
# allgemeine verbietet "glowing screens, dashboards, holograms" — in den
# h-Szenen ist genau das der Bildinhalt; das Modell bekam also die
# Anweisung, das Bild zu bekaempfen, das es fortsetzen sollte. Und was hier
# tatsaechlich schiefging, steht jetzt drin: Veo hat in h2 den Becher und
# die Notizzettel als Doppelbild gemalt (Geisterbild schon im rohen Take,
# nicht in der Nachbearbeitung).
NEGATIV_FEST = ("ghosting, double exposure, afterimage, duplicated objects, transparent "
                "objects, smearing, motion blur, trailing, warping, morphing, "
                "distorted face, deformed face, melted face, extra fingers, fused fingers, "
                "malformed hands, extra limbs, duplicated person, person appearing out of "
                "nowhere, people looking at camera, changing text, garbled text, misspelled "
                "words, scrolling interface, animated chart, flickering screen, camera "
                "movement, zoom, pan, camera shake, jump cut, scene change, 3D render, CGI, "
                "plastic skin, oversaturation")

NEGATIV = ("text, lettering, numbers, subtitles, logos, signage, watermark, "
           "glowing screens, readable user interfaces, dashboards, holograms, light strips, "
           "robots, science fiction, cyberpunk, teal and orange grading, lens flare, "
           "distorted face, deformed face, melted face, warping features, extra fingers, "
           "fused fingers, malformed hands, extra limbs, duplicated person, "
           "person appearing out of nowhere, people looking at camera, stock-photo poses, "
           "changing text, garbled text, misspelled words, changing numbers, scrolling "
           "interface, animated chart, updating dashboard, flickering screen, "
           "camera shake, whip pan, jerky motion, stuttering, flickering, jump cut, "
           "scene change, morphing, 3D render, CGI, plastic skin, HDR, oversaturation")

JOBS = {
 "s1": (8, "The camera pushes in very slowly toward the two people at the desk. The advisor "
           "keeps explaining, moving her pen a little along the line on the page; the older "
           "customer nods slowly once and keeps following with his eyes. Behind them the branch "
           "carries on quietly. Nobody stands up, nobody arrives, nobody leaves."),
 "k1": (4, "The camera drifts very slowly in toward the woman in the doorway. She lowers the "
           "phone to her side, glances back over her shoulder into the shop, and turns her face "
           "forward again toward the street, already thinking about the next thing. She stays "
           "standing in the doorway the whole time. The customer at the counter stays where she "
           "is, waiting."),
 "k2": (4, "The camera drifts very slowly to the right. The man lets his counting hand fall to "
           "his knee and keeps speaking; the woman unfolds her arms and leans in slightly to "
           "answer him. They keep looking straight at each other for the whole shot. Neither of "
           "them glances at the switched-off monitor behind them."),
 "k3": (4, "The camera drifts very slowly to the left. The woman in the middle keeps speaking; "
           "the man on the left brings his hands together and listens; the man on the right "
           "leans in a little further. All three keep looking at each other for the whole shot "
           "and the argument is still going when the shot ends."),
 "k4": (8, "The camera pushes in very slowly. The woman finishes her sentence and lets her hand "
           "come to rest on the handrail; the younger colleague nods once, then looks back at "
           "her and waits, and she begins to say one more thing. Both of them stay on their "
           "steps facing each other for the whole shot. Nobody goes up or down the stairs, "
           "nobody else comes into the stairwell."),
# Die acht Hypothesen-Einstellungen: die 2030-Haelfte der Modellbilder,
# seitlich auf 16:9 erweitert (hypothesen_breit.py).
#
# Hier gilt das Gegenteil der uebrigen Regeln. Sonst soll sich etwas
# bewegen; hier soll fast nichts passieren. Eine erste Probe mit dem ganzen
# Vorher/Nachher-Bild hat gezeigt, dass Veo den Bildschirmtext neu zeichnet,
# wenn er klein im Bild steht — aus "Szenario vergleichen" wurde "Szenarin
# vergleichen". Fuellt der Bildschirm dagegen das Bild, haelt der Text: bei
# Kapitel 3_1 standen "Autonom verarbeitet", "98 % Dunkelverarbeitung" und
# "Sonderfall - manuell" ueber den ganzen Take unveraendert. Deshalb steht
# in jeder Anweisung ausdruecklich, dass sich auf dem Display NICHTS aendert.
#
# Laenge: Veo gibt nur 4, 6 oder 8 Sekunden her. Die Montage schneidet jeden
# Take auf seinen Wert in DAUERN zurueck (2,6 bis 5,0 s).
 "h1": (4, "The man at the breakfast table glances down at his smartwatch, then looks back up "
           "at his family and says something. Everything on the watch face stays EXACTLY as it "
           "is — the same words and numbers, nothing changes, nothing animates. The people at "
           "the table move only a little and nobody leaves."),
 # Eine Handlung je Take (Empfehlung aus den Veo-3.1-Leitfaeden: mehrere
 # Handlungen in einem Clip erzeugen Doppelbilder und Verzerrungen). Feste
 # Gegenstaende werden ausdruecklich als fest benannt.
 "h2": (4, "One single action: the man reads his screen, and his right hand on the trackpad "
           "moves slightly. Nothing else moves. The mug, the plant, the notepad and the sticky "
           "notes are solid objects standing perfectly still in exactly the same place from "
           "the first to the last frame. Everything on the screen stays EXACTLY as it is."),
 "h3": (4, "The people in front of the display keep talking to each other; one of them moves an "
           "open hand a little toward the display. Everything on the display stays EXACTLY as "
           "it is — the same words, the same icons, the same connecting lines. Nothing moves on "
           "it, nothing changes, nothing animates."),
 "h4": (8, "One single action: the woman in front of the display keeps speaking and slowly "
           "lowers her raised hand to her side. Her hands move slowly and stay solid and sharp. "
           "The two colleagues stand still and listen. Everything on the display stays EXACTLY "
           "as it is: the same words, the same nodes, the same lines."),
 "h5": (6, "The two people in front of the display keep talking to each other for the whole "
           "shot: she is speaking and moves one open hand slightly, he answers her and gestures "
           "back. They keep looking at each other, neither of them falls silent, neither folds "
           "their hands or drops their gaze, and the exchange is still going when the shot "
           "ends. Everything on the display stays EXACTLY as it is — the same words, the same "
           "numbers, the same curves. Nothing scrolls, nothing changes."),
 "h6": (4, "The man keeps looking at the large wall display and shifts his weight once, very "
           "slightly. He does not walk, does not turn around and does not leave the frame. "
           "Everything on the display stays EXACTLY as it is: the same words, the same numbers, "
           "the same icons in the same places. Only the man moves, and only a little."),
 "h7": (6, "The woman in front of the glass display keeps speaking and moves one hand slightly "
           "toward it. Everything on the display stays EXACTLY as it is — the same words in the "
           "same boxes, the same connecting lines. Nothing on it moves, changes or animates."),
 "h8": (6, "The people around the boardroom table keep talking; one of them nods, another "
           "leans forward slightly. Everything on the wall display stays EXACTLY as it is: the "
           "same gauges at the same positions, the same colours, the same numbers. Nothing on "
           "it moves or updates."),
 "s2": (6, "The camera drifts almost imperceptibly to the left. The advisor finishes her "
           "sentence and lowers her raised hand to the table; the customer shifts her weight, "
           "still resting her chin on her hand, and begins to answer. The bare table stays "
           "bare. Two people only."),
 "s3": (6, "The camera pushes in very slowly on the two specialists. They keep watching "
           "something out of frame to the left; the woman tilts her head slightly, the man "
           "shifts his stance. Neither types, neither touches anything. The empty workstations "
           "behind them stay perfectly still."),
 "s4": (6, "The camera tracks slowly sideways alongside the woman as she walks the corridor at "
           "an unbroken pace, passing the open doorway without turning her head. The empty "
           "approval desk behind the glass stays empty. Nobody stops her, nobody speaks to her."),
 "s5": (6, "The camera drifts very slowly to the right. The woman in the centre finishes her "
           "sentence and lowers her hand; the man beside her nods; the man opposite straightens "
           "up from the table; the person at the edge turns further toward the door and takes a "
           "step. They keep looking at each other. The table stays bare."),
 "s7": (6, "The camera pushes in very slowly on the group at the window. The man on the left "
           "finishes his sentence and lets his raised hand sink slowly; the woman beside him "
           "keeps following where he pointed and then looks a little further out; the other two "
           "shift their weight once. They keep looking out at the city the whole time, never at "
           "the camera, and nobody leaves the frame. Outside, a few more lights come on in the "
           "distance."),
 "s6": (8, "The camera pushes in very slowly on the man at the window. He breathes, shifts his "
           "weight once, and keeps looking out over the city; his expression does not change. "
           "Outside, a few more lights come on in the distance. The room behind him stays dark "
           "and empty. Nobody enters."),
}


# Takes, die laenger gedreht und danach zurueckgeschnitten werden.
#
# k2 loeste sich am Ende auf: die beiden Kollegen sahen zu Boden, das
# Gespraech starb aus. Die Regel "der Take endet mit noch lebender Szene"
# hat bei k1, k3 und k4 gewirkt, bei k2 zweimal nicht — das Modell laesst
# eine Geste gern austrudeln, und vier Sekunden sind kurz genug, dass der
# Schluss ins Gewicht faellt. Statt es ein drittes Mal zu versuchen, wird
# laenger gedreht und vorn abgeschnitten: was nach der Sekunde im Wert
# passiert, sieht niemand.
LAENGER = {"k2": 6}


def zuschneiden(datei, sekunden):
    """Den Take auf seine ersten Sekunden kuerzen, ohne neu zu kodieren."""
    tmp = datei + ".schnitt.mp4"
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-v", "error", "-y", "-i", datei,
                    "-t", str(sekunden), "-c", "copy", tmp], check=True)
    os.replace(tmp, datei)


def kopf():
    cred = service_account.Credentials.from_service_account_file(
        f"{S}/.veo_sa.json", scopes=["https://www.googleapis.com/auth/cloud-platform"])
    cred.refresh(Request())
    return {"Authorization": "Bearer " + cred.token, "Content-Type": "application/json"}


def drehen(name):
    sekunden, prompt = JOBS[name]
    dreh = LAENGER.get(name, sekunden)
    ziel = f"{ZIEL}/{name}.mp4"
    if os.path.exists(ziel):
        print(name, "liegt schon da — erst loeschen, um neu zu drehen", flush=True)
        return ziel
    quelle = (f"{HYPOTHESEN}/{name}.png" if name.startswith("h")
              else f"{BILDER}/{name}.png")
    if not os.path.exists(quelle):
        raise SystemExit(f"{name}: Bild fehlt — erst bilder_szenen_horizon.py laufen lassen")
    print(f"{name}: {dreh} s gedreht, {sekunden} s behalten, {MODELL}"
          if dreh != sekunden else f"{name}: {sekunden} s, {MODELL}", flush=True)
    bild = {"bytesBase64Encoded": base64.b64encode(open(quelle, "rb").read()).decode(),
            "mimeType": "image/png"}
    h = kopf()
    # Hoechste Aufloesung nehmen, die das Modell annimmt. Veo liefert nativ
    # 1080p; "4k" wird bei aelteren Modellen abgelehnt, dann faellt es
    # zurueck, statt den Take zu verlieren.
    for aufloesung in ("4k", "1080p"):
        fest = name.startswith("h")
        stil = STIL_FEST if fest else STIL
        # VEO_PROBEN=2: zwei Proben je Take, die sauberere gewinnt. Die
        # weiteren liegen als <name>_p2.mp4 daneben.
        proben = int(os.environ.get("VEO_PROBEN", "1"))
        koerper = {"instances": [{"prompt": prompt + stil, "image": bild}],
                   "parameters": {"aspectRatio": "16:9", "durationSeconds": dreh,
                                  "sampleCount": proben, "resolution": aufloesung,
                                  "generateAudio": False, "personGeneration": "allow_adult",
                                  "negativePrompt": NEGATIV_FEST if fest else NEGATIV}}
        r = requests.post(f"{BASIS}:predictLongRunning", headers=h,
                          data=json.dumps(koerper), timeout=180)
        if r.status_code == 200:
            print(f"  eingereicht in {aufloesung}", flush=True)
            break
        print(f"  {aufloesung} abgelehnt: {r.text[:120]}", flush=True)
    else:
        raise SystemExit(f"{name}: keine Aufloesung angenommen")

    op = r.json()["name"]
    for _ in range(90):
        time.sleep(10)
        a = requests.post(f"{BASIS}:fetchPredictOperation", headers=h,
                          data=json.dumps({"operationName": op}), timeout=120).json()
        if not a.get("done"):
            continue
        if "error" in a:
            raise SystemExit(f"  {name} fehlgeschlagen: {json.dumps(a['error'])[:300]}")
        videos = a.get("response", {}).get("videos") or []
        if not videos or "bytesBase64Encoded" not in videos[0]:
            raise SystemExit(f"  {name}: keine Videodaten: {json.dumps(a)[:300]}")
        for k, v in enumerate(videos):
            datei = ziel if k == 0 else f"{ZIEL}/{name}_p{k + 1}.mp4"
            open(datei, "wb").write(base64.b64decode(v["bytesBase64Encoded"]))
            if dreh != sekunden:
                zuschneiden(datei, sekunden)
            print("  fertig:", os.path.basename(datei), os.path.getsize(datei) // 1024,
                  "KB", flush=True)
        return ziel
    raise SystemExit(f"  {name}: Zeitueberschreitung")


def reihe(namen):
    for n in namen:
        try:
            drehen(n)
        except SystemExit as e:
            print("FEHLER", n, e, flush=True)


if __name__ == "__main__":
    wunsch = sys.argv[1:] or list(JOBS)
    for n in wunsch:
        if n not in JOBS:
            raise SystemExit(f"unbekannt: {n} (bekannt: {', '.join(JOBS)})")
    gruppen = [wunsch[i::3] for i in range(3)]
    faeden = [threading.Thread(target=reihe, args=(g,)) for g in gruppen if g]
    for f in faeden:
        f.start()
    for f in faeden:
        f.join()
    print("VEO SZENEN FERTIG", flush=True)
