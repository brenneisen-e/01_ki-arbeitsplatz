#!/usr/bin/env python3
"""Szenenbilder der achten Fassung neu erzeugen — Bild fuer Bild.

Was hier entsteht, ist NICHT das fertige Standbild, sondern die gruene
Quelle: der Raum mit Mara und einer leeren Chroma-Flaeche an der Stelle, an
der spaeter die gerenderte Oberflaeche sitzt. Erst `stills_v08.py` stanzt sie
hinein. So bleibt jeder Bildschirminhalt aenderbar, ohne den Raum anzufassen.

Warum ein eigenes Skript und nicht ein Aufruf pro Bild: die Chroma-Flaeche
muss Bedingungen erfuellen, damit die Montage sie findet und nichts
abgeschnitten wird. Ein Bildmodell trifft das nicht zuverlaessig, also wird
jedes Ergebnis geprueft und bei Bedarf neu angefordert:

  * eine einzige zusammenhaengende Flaeche, kein Konfetti,
  * gross genug, damit die Oberflaeche im Saal lesbar bleibt,
  * im richtigen Seitenverhaeltnis zur gerenderten Oberflaeche,
  * mit Luft zu allen vier Bildkanten — die Wandanzeige des Teamraums lief in
    der v07 oben aus dem Bild, genau das darf nicht wieder passieren.

Mara kommt aus quellen/mara_ref.png (Figurenblatt), damit sie ueber alle
Szenen dieselbe Person bleibt.

    SCRATCH=… python3 bilder_v08.py home
"""
import base64
import io
import os
import sys
import time

import numpy as np
from openai import OpenAI
from PIL import Image
from scipy import ndimage

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import chroma  # noqa: E402
import keyen  # noqa: E402

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

REFERENZ = f"{HIER}/quellen_v08/mara_ref.png"
CHROMA = (8, 168, 63)

# In jedem Prompt: dieselbe Person, dieselbe Kleidung, dieselbe Bildsprache.
MARA = (
    "The woman in the picture is the same person as in the reference sheet: mid-thirties, "
    "dark chin-length bob, black single-button blazer over a white top, navy trousers, black "
    "loafers. Same face, same hair, same clothes, exactly one of her. "
)
CHROMA_TEXT = (
    "The screen shows a perfectly flat, evenly lit pure chroma-key green surface (#08A83F) — "
    "no content, no icons, no text, no reflections, no glare, no gradient, no bezel glow. "
    "The green area is a clean rectangle, sharp-edged, fully in focus. "
)
STIL = (
    "Photorealistic corporate photography, natural daylight, muted warm palette, shallow but "
    "not extreme depth of field, 16:9 framing, no text overlay, no watermark, no logos. "
    "Anatomically correct hands and face, no extra limbs, no second copy of her, no lookalike, no other woman with the same haircut or the same black blazer."
)


class Szene:
    """Eine Szene und die Bedingungen, die ihr Bild erfuellen muss.

    `verhaeltnis=None` heisst: in dieser Szene gibt es keinen Bildschirm im
    Bild. Dann wird umgekehrt geprueft, dass KEINE grosse gruene Flaeche
    entstanden ist — sonst stanzt die Montage spaeter in eine Pflanze.
    """

    def __init__(self, name, datei, prompt, verhaeltnis=None, mindest_hoehe=0.0,
                 rand=0.035, toleranz=0.20, anker=(), rechteck=0.80,
                 schirm='chroma'):
        self.name, self.datei, self.prompt = name, datei, prompt
        # Zusaetzliche Referenzbilder: so bleiben zusammenhaengende Raeume
        # (Eingang, Schranke, Halle) untereinander gleich.
        self.anker = tuple(anker)
        self.verhaeltnis = verhaeltnis        # Breite/Hoehe der Oberflaeche
        self.mindest_hoehe = mindest_hoehe    # Anteil der Bildhoehe
        self.rand = rand                      # Luft zu jeder Bildkante
        self.toleranz = toleranz
        # Fuellgrad des umschliessenden Rechtecks. Nahe 1 heisst: der Schirm
        # steht frontal UND nichts verdeckt ihn — ein schraeg stehender oder
        # halb verdeckter Schirm fuellt seinen Kasten nie aus.
        self.rechteck = rechteck
        # 'chroma': das Modell malt die Flaeche gruen.
        # 'schwarz': das Modell malt einen AUSGESCHALTETEN Schirm in einem hellen
        #   Rahmen. Dann liegt im ganzen Raum kein gruenes Licht — kein Schimmer
        #   auf ihrem Gesicht, kein Saum an der Schulter, nichts, was Kling im
        #   Take weitermalen koennte. Das Chroma setzt danach dieses Skript, als
        #   flaches Rechteck mit harter Kante.
        self.schirm = schirm


# Die Bildsprache des Hauses — in jedem Raum dieselbe, damit die Strecke
# zusammenhaengt: heller Stein, geoelte Eiche, Glas, viel Tageslicht, ruhige
# Farben, wenige Menschen.
HAUS = (
    "The building is always the same modern European bank: pale stone floors and walls, oiled "
    "oak, floor-to-ceiling glazing, soft daylight, muted warm colours, potted plants, very few "
    "people and no clutter. "
)

# Der Bildschirm. Er wird AUSGESCHALTET erzeugt: laesst man das Bildmodell
# eine gruene Flaeche malen, legt es gruenes Licht in den ganzen Raum, und
# Kling malt das im Take weiter. Das Chroma setzt danach dieses Skript.
SCHIRM = (
    "THE SCREEN IS THE POINT OF THIS PICTURE, follow this exactly. The camera looks at it "
    "DEAD-ON, PERFECTLY SQUARE: the screen plane is exactly parallel to the picture plane, at "
    "ZERO DEGREES, not turned, not tilted, not seen at an angle. The screen is a PERFECT UPRIGHT "
    "RECTANGLE with vertical left and right edges, horizontal top and bottom edges, square "
    "corners, no perspective, no keystone. "
    "THE SCREEN IS SWITCHED OFF: a flat, even, MATTE BLACK surface — no content, no icons, no "
    "text, no logo, no reflection, no glare, no gradient, no glow, and NOTHING GREEN anywhere in "
    "the picture. Around it runs a THIN BRIGHT SILVER BEZEL, light metallic grey, clearly "
    "lighter than the screen and clearly lighter than her dark blazer, unbroken on all four "
    "sides. "
    "THE WHOLE SCREEN AND ITS BEZEL ARE COMPLETELY UNOBSTRUCTED — all four corners, all four "
    "edges. Nothing overlaps any part of it: not her head, her hair, her shoulder, her arm or "
    "her sleeve, not a mug, not a plant, not a cable, not the edge of the picture. A wide, "
    "clearly visible gap lies between her body and the nearest edge of the screen. "
)

PHYSIK = (
    "Everything in the picture must be physically consistent: nothing floats, every object rests "
    "on what carries it, edges meet, everyone casts a shadow. "
)

SZENEN = {
    # 07:00 — die Wohnung. Kein Bildschirm im Bild: das Telefon ist von hinten
    # zu sehen, was sie liest, kommt als glaeserne Tafel daneben (handyglas).
    # Deshalb bleibt das linke Viertel des Bildes ruhig — dort sitzt die Tafel.
    "home": Szene(
        name="home", datei="quellen_v08/wohnung_rein.png",
        prompt=(
            MARA +
            "07:00 in her own flat, a lived-in open-plan loft on an upper floor. Warm oak floor, "
            "low morning sun coming in flat from the left, long soft shadows, warm golden light "
            "on the walls. The picture is built in four zones from left to right. "
            "LEFT QUARTER: nothing but the floor-to-ceiling window front and the floor — a calm, "
            "uncluttered strip, no furniture and no plants, a soft grey city skyline behind the "
            "glass. "
            "CENTRE-LEFT: the living area, clearly lived in — a low linen sofa with cushions and "
            "a folded throw, a round coffee table with a book and a bowl, a woven rug, a floor "
            "lamp, a tall potted fig tree, one framed picture on the wall. "
            "CENTRE-RIGHT: the kitchen island in pale stone with a FLUSH BLACK CERAMIC INDUCTION "
            "HOB set into the worktop — a perfectly flat glass surface with a thin printed "
            "control strip and nothing standing on it. NO gas burners, NO cast-iron pan supports, "
            "NO grates, NO flames, NO knobs. Behind it handleless oak cabinets and an open shelf "
            "with a few plates and glasses. She SITS ON A BAR STOOL at this island, facing the "
            "camera, her body turned towards us. She holds a smartphone in both hands at chest "
            "height and looks DOWN at it — we see only the BACK of the phone, the screen is "
            "turned away from the camera and not visible at all. A small stoneware coffee cup "
            "stands on the island beside her. Her expression is calm and unhurried. "
            "RIGHT EDGE, CLOSE TO HER AND CLOSE TO THE CAMERA: the FLAT'S ENTRANCE DOOR in the "
            "right-hand wall, only three or four steps from her stool. It is a NORMAL, WIDE "
            "INTERIOR DOOR — about one metre wide and two metres tall, distinctly broad, NOT a "
            "tall narrow slot: a flush light-oak leaf in a plain frame with a slim horizontal "
            "handle, standing closed. Beside it a narrow console table with a set of keys and a "
            "coat hook on the wall. The whole doorway, frame included, is fully inside the frame "
            "with the floor in front of it clear, so she could walk straight out of it. "
            "Wide shot, whole figure and stool visible, camera at her eye level. " + STIL)),

    # 07:05 — die offene Wohnungstuer. Zwischenbild, aus dem Weg heraus
    # entstanden: im ersten Versuch ging Mara nicht durch die Tuer, sondern
    # durch die Wand — Kling hatte keinen Halt fuer den Durchgang. Jetzt endet
    # Take 1 hier, und Take 2 faengt hier an. Der Raum ist derselbe wie um
    # 07:00, deshalb ist das Wohnungsbild als Anker mitgegeben.
    "flur": Szene(
        name="flur", datei="quellen_v08/flur_tuer.png",
        anker=("quellen_v08/wohnung_rein.png",),
        prompt=(
            "Same flat as in the reference photograph — identical room, identical furniture, "
            "identical materials, identical morning light, camera in the same place but a little "
            "closer to the door on the right. " + MARA +
            "Her ENTRANCE DOOR, the wide flush oak door in the right-hand wall, now STANDS OPEN: "
            "the leaf has swung away from the camera into the corridor and rests against the "
            "wall, its handle still on the leaf where it belongs. "
            "Mara is seen FROM BEHIND, standing IN THE OPEN DOORWAY, mid-step, one foot already "
            "on the corridor floor beyond the threshold, her hand leaving the door frame. Her "
            "face is not visible. Her whole figure fits inside the frame. "
            "THROUGH THE OPEN DOORWAY: a calm, well-lit apartment corridor with pale walls, a "
            "grey stone floor, a run of recessed ceiling lights, and two brushed-steel lift "
            "doors at its end. The corridor is clearly a different space from the flat — cooler "
            "light, different floor. "
            "Behind her the flat stays exactly as in the reference: kitchen island with the "
            "flush induction hob on the right, sofa, coffee table, rug, floor lamp, fig tree, "
            "framed picture, the console table with the keys — but the KEYS ARE GONE from the "
            "console, she has taken them. The bar stool stands empty, the phone is not in sight. "
            "Everything in the picture must be physically consistent: nothing floats, the door "
            "leaf and its handle belong together, the threshold lines up with both floors. "
            + STIL)),

    # 07:45 — die Schranke. Aus dem Review: die Uebergangsszene an der
    # Glastuer faellt weg. Kling geht in einem Take von der Wohnung hierher;
    # gespart wird damit ein Bild, an dem zuletzt zwei Fehler hingen (ein frei
    # haengender Tuergriff und eine unterbrochene Schrankenreihe).
    #
    # Das ist jetzt die Station 07:45: sie steht vor der Schranke und schaut
    # auf ihr Telefon — die Termine des Tages. Wie um 07:00 ist nur die
    # RUECKSEITE des Telefons zu sehen, die Seite kommt als Tafel daneben.
    # Deshalb bleibt auch hier das linke Bildviertel ruhig.
    "schranke": Szene(
        name="schranke", datei="quellen_v08/schranke.png",
        prompt=(
            MARA +
            "07:45, the arrival hall of a modern bank building, seen from BEHIND HER. The "
            "camera stands about five metres behind her at chest height and looks STRAIGHT "
            "AHEAD at the gates; we see her whole figure from the back, her face is not "
            "visible. "
            "THE BARRIER LINE — follow this exactly, it is the point of the picture. The "
            "security line runs UNBROKEN ACROSS THE WHOLE WIDTH OF THE HALL, from the left wall "
            "to the right wall, and there is NO WAY AROUND IT: nowhere in the picture can "
            "anyone step past it. It consists of four identical pale stone gate pedestals in "
            "ONE STRAIGHT LINE, all the same size, height and shape, evenly spaced, their "
            "brushed-steel tops forming one continuous horizontal line, each with a small dark "
            "reader on its top. Between every two neighbouring pedestals stands a pair of clear "
            "glass leaves, CLOSED — every lane is closed, including the one she is standing in "
            "front of. Beyond the outermost pedestal on the LEFT and beyond the outermost "
            "pedestal on the RIGHT the line continues as a FIXED FLOOR-TO-WAIST GLASS "
            "BALUSTRADE in a slim steel rail, running all the way to the side wall on each "
            "side, sealing the hall completely. The lanes are all the same width. "
            "SHE STANDS IN THE MIDDLE LANE, centred in the open space between two pedestals, "
            "about a metre in front of the closed glass leaves of that lane. Her body is "
            "entirely clear of the pedestals — she does not overlap or touch them. She STANDS "
            "STILL and looks DOWN at the smartphone in her hand at chest height — we see only "
            "the BACK of the phone, its screen is turned away from the camera and not visible "
            "at all. "
            "BEYOND THE BARRIER: a curved oak reception desk, a tall glazed facade with a tree "
            "and a soft city skyline, pale stone floor, and in the right-hand wall a wide open "
            "oak doorway leading into a corridor. Two people far away behind the desk, small "
            "and motionless. Nobody else near her. Morning light with long soft shadows across "
            "the floor; she casts a shadow on the floor like everything else. "
            "Everything in the picture must be physically consistent: nothing floats, every "
            "handle belongs to a leaf, every panel meets its frame. "
            "The LEFT QUARTER of the frame stays calm — floor and glazing only, no furniture, "
            "no plants, no people there. " + STIL)),

    # 07:50 — hinter der Schranke. Zwischenbild: Ende des Check-in-Takes und
    # Anfang des Weges ins Buero. Damit die Halle nicht springt, ist das
    # Schrankenbild als Anker mitgegeben; die Kamera darf hier mitgehen, denn
    # der Take ist eine Verfolgung von hinten, keine feste Einstellung.
    "halle": Szene(
        name="halle", datei="quellen_v08/halle_innen.png",
        anker=("quellen_v08/schranke.png",),
        prompt=(
            "The SAME arrival hall as in the reference photograph — identical materials, "
            "identical curved oak reception desk, identical glazed facade with the tree and the "
            "city skyline, identical pale stone floor, identical morning light and shadows. "
            + MARA +
            "She is ALREADY WELL PAST THE SECURITY GATES: she stands SEVERAL METRES BEYOND them, "
            "deep inside the hall, much closer to the reception desk than to the barrier. The "
            "whole barrier line lies BEHIND HER, between her and the camera, and appears low "
            "down in the FOREGROUND of the picture — she is clearly on the far side of it, no "
            "part of her is between two pedestals. She is seen FROM BEHIND, her face is not "
            "visible, and she is TURNED TO HER RIGHT, walking towards the WIDE OPEN OAK DOORWAY "
            "in the right-hand wall — the way on into the corridor. That doorway is large, fully "
            "inside the frame, unobstructed, with clear floor in front of it, and the lit "
            "corridor behind it is visible. The phone is in her hand at her side, no longer held "
            "up. "
            "THE BARRIER IN THE FOREGROUND still runs unbroken from the left wall to the right "
            "wall: the same four pale stone pedestals in one straight line, the glass balustrade "
            "continuing to the side walls on both sides. Only the pair of glass leaves of the "
            "lane she came through stands open, retracted sideways into the two pedestals; every "
            "other lane is closed. "
            "Two people far away behind the reception desk, small and motionless. Nobody else "
            "near her. Everything in the picture must be physically consistent: nothing floats, "
            "every panel meets its frame, she casts a shadow like everything else. " + STIL)),

    # 08:00 — der Arbeitsplatz. Erste Station mit einem echten Bildschirm im
    # Bild: die gruene Flaeche wird spaeter mit der gerenderten Oberflaeche
    # gestanzt. Verhaeltnis 1,6 — genau das der Aufnahme (1600x1000).
    # Ueber-die-Schulter, damit der Schirm im Saal auf zehn Meter lesbar ist.
    "buero": Szene(
        name="buero", datei="quellen_v08/buero.png",
        verhaeltnis=1600 / 1000, mindest_hoehe=0.48, rechteck=0.97, schirm="schwarz",
        prompt=(
            MARA +
            "08:00, her own desk on the operations floor of the bank. "
            "SHE IS AT THE VERY LEFT EDGE of the picture, seen from behind over her shoulder — "
            "only her back and the side of her dark bob are visible, cut off by the left edge of "
            "the frame, never her face. Her hand rests on a low dark keyboard on the warm oak "
            "desk. A stoneware mug stands at the far right of the desk. "
            "THE MONITOR IS THE POINT OF THIS PICTURE, follow this exactly. ONE VERY LARGE "
            "widescreen monitor — a 40-inch panel — stands on a slim dark stand in the middle of "
            "the desk. The camera looks at it DEAD-ON, PERFECTLY SQUARE: the screen plane is "
            "exactly parallel to the picture plane, at ZERO DEGREES, not turned, not tilted, not "
            "seen at an angle. The screen is a PERFECT UPRIGHT RECTANGLE with vertical left and "
            "right edges, horizontal top and bottom edges, square corners, no perspective, no "
            "keystone. The screen alone fills MORE THAN HALF THE HEIGHT of the picture and about "
            "half its width. "
            "THE MONITOR IS SWITCHED OFF: the screen is a flat, even, MATTE BLACK surface — no "
            "content, no icons, no text, no logo, no reflection, no glare, no gradient, no glow, "
            "and NOTHING GREEN anywhere in the picture. Around this black screen runs a THIN "
            "BRIGHT SILVER BEZEL, light metallic grey, clearly lighter than the screen and "
            "clearly lighter than her dark blazer, unbroken on all four sides. "
            "THE WHOLE MONITOR IS COMPLETELY UNOBSTRUCTED — the black screen, the silver bezel, "
            "all four corners and all four edges. Nothing overlaps any part of it: not her head, "
            "her hair, her shoulder, her arm or her sleeve, not the mug, not a plant, not a "
            "cable, not the edge of the picture. A WIDE, CLEARLY VISIBLE GAP of lit desk and "
            "background lies between her body and the left edge of the monitor — at least the "
            "width of a hand. The monitor stands entirely free. "
            "BEHIND THE DESK the open operations floor recedes: pale plaster columns, a potted "
            "fig tree, floor-to-ceiling glazing with soft daylight, and on the RIGHT-HAND SIDE a "
            "WIDE OPEN OAK DOORWAY leading back to the corridor she came in through. Two "
            "colleagues far away at a bench desk, small, still and out of focus. Morning light. "
            "Everything in the picture must be physically consistent: nothing floats, the monitor "
            "stands on its stand on the desk, edges meet. " + STIL)),

    # ── 08:05 ────────────────────────────────────────────────────────────────
    # KEIN eigener Raum: 08:00 und 08:05 spielen am selben Platz, es wechselt
    # nur, was auf dem Bildschirm steht. Ein Raumwechsel zwischen zwei
    # Stationen, die fuenf Minuten auseinanderliegen, liest sich als Fehler.
    # Deshalb steht "s2" nicht in dieser Liste — stills_v08.py nimmt dafuer
    # dieselbe Quelle wie fuer 08:00.

    # ── 08:10, der Kachelraum ────────────────────────────────────────────────
    # Weite Einstellung: ueber das Bild kommen spaeter die neun Kundenkacheln,
    # und zwar als HTML-Ebene — Orte, Texte und Betraege bleiben damit
    # aenderbar, ohne das Bild anzufassen. Der Raum wird deshalb voellig LEER
    # erzeugt: keine Kacheln, keine Zahlen, keine Kaesten.
    #
    # Der Bildschirm steht hier weit weg und ist entsprechend klein. Die
    # Pruefung ist darauf eingestellt — mit den Werten der Nahaufnahmen hat sie
    # dreimal verworfen, obwohl das Bild richtig war.
    "s2b": Szene(
        name="s2b", datei="quellen_v08/s2b_rein.png",
        anker=("quellen_v08/buero.png",),
        # Auch hier muss der Schirm frontal stehen: in ihn wird dasselbe
        # Dashboard gestanzt wie um 08:00, nur kleiner. Steht er schraeg,
        # verzerrt die Oberflaeche. Gross ist er hier nicht — die Kamera steht
        # am anderen Ende des Raums —, deshalb sind Groesse und Toleranz
        # gelockert, die Rechtwinkligkeit aber nicht.
        verhaeltnis=1600 / 1000, mindest_hoehe=0.10, rechteck=0.95, schirm="schwarz",
        rand=0.02, toleranz=0.30,
        prompt=(
            "THE SAME ROOM AS IN THE REFERENCE PHOTOGRAPH, seen from further away. Everything "
            "keeps its identity: the same warm oak desk with the same slim-stand monitor, the "
            "same dark task chair, the same woman seen from behind sitting at it, the same pale "
            "stone floor and pale plaster walls, the same oak detailing, the same floor-to-"
            "ceiling glazing and the same daylight. Do not invent a different office. "
            + MARA + HAUS +
            "ONLY THE CAMERA HAS MOVED BACK: it now stands far away at the other end of the "
            "floor, so that she, her desk and her monitor sit SMALL IN THE LOWER LEFT THIRD of "
            "the picture and the whole operations floor is visible around them. "
            "THE FLOOR IS BUSY AND LIVED IN, not empty: further rows of the same oak bench desks "
            "with monitors, eight or ten colleagues working, standing, talking in twos; a glass "
            "meeting box with people inside; a coffee point with a counter and stools; tall "
            "plants, pendant lights, low oak shelving; the long run of glazing on the right with "
            "a soft city view behind it. The room feels like a working morning, calm but "
            "populated. "
            "HER MONITOR STANDS DEAD-ON TO THE CAMERA, PERFECTLY SQUARE: the screen plane is "
            "exactly parallel to the picture plane, at ZERO DEGREES, a perfect upright rectangle "
            "with vertical left and right edges and square corners, no perspective, no keystone — "
            "the dashboard is rendered into it afterwards and would be skewed otherwise. It is "
            "SWITCHED OFF: a flat, even, matte black screen with a thin bright silver bezel "
            "around it, nothing overlapping it. Every other screen in the room is switched off "
            "too; nothing green anywhere in the picture. "
            "THERE IS NO TEXT AND NO NUMBER ANYWHERE IN THE PICTURE: no floating panels, no "
            "cards, no tiles, no overlays, no charts, no signage, no labels, no writing on any "
            "surface. Nothing hovers in the air. " + PHYSIK + STIL)),

    # ── 08:15, die Behoerdenanfrage ──────────────────────────────────────────
    # Aus der Abnahme: aufstehen und sich drei Meter weiter an einen anderen
    # Tisch setzen ist kein sinnvoller Ablauf. Sie bleibt an IHREM Platz —
    # eine Kollegin kommt zu ihr, und beide schauen auf die Evidenz.
    "s3": Szene(
        name="s3", datei="quellen_v08/g_s3.png",
        anker=("quellen_v08/buero.png",),
        verhaeltnis=1600 / 1000, mindest_hoehe=0.44, rechteck=0.96, schirm="schwarz",
        prompt=(
            "THE SAME DESK AS IN THE REFERENCE PHOTOGRAPH — same office, same warm oak desk, "
            "same monitor on its slim stand, same camera position, same light a little later in "
            "the morning. " + MARA + HAUS +
            "She sits at her desk at the LEFT EDGE of the picture exactly as in the reference, "
            "seen from behind, one hand on the keyboard — never her face. "
            "NEW IN THIS PICTURE: A COLLEAGUE HAS COME OVER TO HER DESK — a Black woman in her "
            "early thirties with short natural hair, in a rust-coloured blouse and dark trousers. "
            "She STANDS beside the desk at the RIGHT EDGE of the picture, leaning slightly "
            "towards the screen with one hand resting on the desk, seen mostly from behind and "
            "from the side; her face is at most a quarter profile. Both of them are looking at "
            "the same screen. "
            "THE MONITOR STAYS EXACTLY AS IN THE REFERENCE: dead-on to the camera, perfectly "
            "square, switched off — a flat, even, matte black surface in its thin bright silver "
            "bezel, and NEITHER OF THEM OVERLAPS the screen or its bezel; the colleague stands "
            "clear of it. Nothing green anywhere in the picture. " + PHYSIK + STIL)),

    # ── 09:00, der Teamraum ─────────────────────────────────────────────────
    # Zwei Dinge aus dem Review haengen an diesem Bild: die Wandanzeige lief
    # in v07 oben aus dem Bild heraus und las sich als angeschnitten, und
    # hinter den Sitzenden sollen Holo-Agenten stehen — die Mixed Workforce
    # soll man sehen, nicht behauptet bekommen.
    "s4": Szene(
        name="s4", datei="quellen_v08/besprechung.png",
        # Das Verhaeltnis war mit 3,1:1 zu streng gesetzt — so breit haengt kaum
        # ein Display, und das Modell hat viermal 1,9 geliefert. Jetzt ist die
        # Vorgabe an die Wirklichkeit angepasst; die Wandanzeige wird danach in
        # genau dem gemessenen Verhaeltnis gerendert.
        # Die Luft zur Bildkante war mit 4,5 % zu hoch angesetzt: das Modell
        # haengt die Anzeige verlaesslich mit 2 bis 4 % Wand darueber auf, und
        # das reicht — angeschnitten war sie in v07 mit 0,4 %.
        verhaeltnis=2.0, mindest_hoehe=0.20, rechteck=0.96, schirm="schwarz",
        rand=0.022, toleranz=0.32,
        prompt=(
            MARA + HAUS +
            "09:00, the daily operating review in a meeting room. The camera stands at the door "
            "and looks across the room. MARA STANDS AT THE LEFT EDGE of the picture, seen from "
            "behind, having just come in — her face is not visible. "
            "THERE IS EXACTLY ONE MARA IN THIS PICTURE and she is the one standing at the door. "
            "NONE OF THE SEATED COLLEAGUES RESEMBLES HER: nobody at the table has a dark "
            "chin-length bob, and nobody at the table wears a black blazer. They are visibly "
            "different people — different ages, different hair colours and lengths, different "
            "clothes in grey, navy, beige and white. "
            "FIVE COLLEAGUES SIT at a round oak table in the middle ground, and THEY ARE ALL "
            "LOOKING AT MARA: their heads and upper bodies are turned towards her, towards the "
            "left of the picture, faces in three-quarter or profile view, attentive and relaxed. "
            "They are not looking at the wall display and not at the camera. One of them has "
            "just been speaking. "
            "BETWEEN THE PEOPLE, IN THE CHAIRS NEXT TO THEM, SIT THEIR AGENTS: translucent "
            "holographic figures made of light in muted teal-green, one beside each person, "
            "SEATED AT THE TABLE exactly like the humans, at the same height, upright in their "
            "chairs with their hands on the table. About 60 % opacity, soft edges, a faint "
            "vertical shimmer, clearly digital and never real people — no detailed faces, no "
            "clothing detail, no shadow on the floor. Human, agent, human, agent all the way "
            "around the table. "
            "EVERY HOLOGRAM IS COMPLETE AND FULLY VISIBLE from head to lap: none of them is cut "
            "off, hidden behind anything or overlapped by the wall display — they all sit well "
            "below it, with clear wall between their heads and the lower edge of the display. "
            "ON THE FAR WALL, above and beyond the table, hangs a WIDE WALL DISPLAY in landscape "
            "format, about twice as wide as it is high. IT HANGS ENTIRELY INSIDE THE PICTURE with "
            "a clear band of wall visible ABOVE it and below it — it is never cut off by the top "
            "edge of the frame. The camera looks at it dead-on, perfectly square: a perfect "
            "upright rectangle, no perspective, no keystone. "
            "THE DISPLAY IS SWITCHED OFF: a flat, even, MATTE BLACK surface, no content, no "
            "reflection, no glow, and nothing green in the picture except the holograms. Around "
            "it runs a thin bright silver bezel, unbroken on all four sides. Nobody and nothing "
            "overlaps the display or its bezel — the people and their agents are all seated well "
            "below it. "
            + PHYSIK + STIL)),

    # ── 10:30, die Kabine ────────────────────────────────────────────────────
    # Der Privacy-Raum der Strecke — eine TELEFONZELLE, wie sie in Bueros
    # steht: rundum geschlossen. Links und rechts ist Wand, kein Blick auf
    # die Flaeche; die Kamera steht mit in der Zelle. Aus der Abnahme: die
    # offene Kabine mit Buero links und rechts las sich nicht als Rueckzug.
    "s5": Szene(
        name="s5", datei="quellen_v08/kabine.png",
        # Toleranz eng: die erste Fassung lieferte 1,29:1, und beim Stanzen
        # wuerde die 1,6:1-Oberflaeche seitlich beschnitten — Inhalt verloren.
        verhaeltnis=1600 / 1000, mindest_hoehe=0.42, rechteck=0.96, schirm="schwarz",
        toleranz=0.12,
        prompt=(
            MARA + HAUS +
            "10:30, INSIDE a closed office phone booth — one of those fully enclosed acoustic "
            "cabins that stand on open floors. The camera is INSIDE the booth with her. The "
            "booth is small and completely closed: FELT-LINED WALLS IN WARM SAND COLOUR FILL THE "
            "ENTIRE LEFT EDGE AND THE ENTIRE RIGHT EDGE of the picture, floor to ceiling — no "
            "gap, no window, no glimpse of the office on either side. Behind the desk the back "
            "wall of the booth, also felt, with a narrow acoustic ridge pattern; only high up a "
            "small warm light strip. A small oak worktop spans wall to wall. "
            "She sits at the worktop AT THE FAR LEFT EDGE of the picture, seen from behind, "
            "occupying only the left quarter of the frame, and she is ON A PHONE CALL: she holds her SMARTPHONE TO HER EAR with her left hand, "
            "elbow on the worktop, head slightly tilted — never her face, only the back of her "
            "head and the phone at her ear. Her other hand rests on the desk. "
            "THE MONITOR STANDS IN THE RIGHT HALF OF THE PICTURE, well away from her: a large "
            "WIDESCREEN panel in LANDSCAPE format, clearly wider than it is high (sixteen by "
            "ten), on a slim stand on the worktop. A CLEAR STRIP OF FELT WALL is visible "
            "between her shoulder and the left edge of the monitor — she never overlaps it, "
            "and her raised arm with the phone stays entirely clear of it. " + SCHIRM +
            "The light is warm and SOFTLY BRIGHT — the light strip washes the felt walls in a "
            "light sand tone, clearly lighter than her black blazer. The switched-off screen in "
            "its bright silver bezel is the ONLY dark rectangle in the picture. A small private "
            "room, clearly separated from the world outside. " + PHYSIK + STIL)),

    # ── 11:15, die Freigabe der Logik ────────────────────────────────────────
    # Vorher stand sie allein vor einem Wandschirm — das liest sich seltsam,
    # als warte jemand auf eine Durchsage. Jetzt eine Arbeitssituation: zwei
    # Menschen an einem Platz, die auf dieselbe Sache schauen.
    "s6": Szene(
        name="s6", datei="quellen_v08/g_s6.png",
        verhaeltnis=1600 / 1000, mindest_hoehe=0.46, rechteck=0.97, schirm="schwarz",
        prompt=(
            MARA + HAUS +
            "11:15, a shared desk in a small review area. She SITS at the LEFT EDGE of the "
            "picture, seen from behind over her left shoulder, one hand on the keyboard — never "
            "her face. A COLLEAGUE, a man in his forties in a grey shirt without a tie, sits "
            "beside her at the FAR RIGHT EDGE of the picture, also seen from behind and slightly "
            "from the side, leaning in towards the screen; his face is turned away from the "
            "camera. The two of them are looking at the same thing. "
            "THE LARGE MONITOR STANDS BETWEEN THEM in the middle of the picture, with a clear "
            "gap on both sides — neither of them overlaps it. Daylight from the right. " +
            SCHIRM + PHYSIK + STIL)),

    # ── 14:00, die zweite Linie ──────────────────────────────────────────────
    # Aus der Abnahme: eine Nachmittagsszene gehoert aufs Telefon, nicht auf
    # einen Bildschirm. Der Recovery-Vorschlag ist der richtige Moment — sie
    # liest und urteilt, sie tippt nicht. Kein Schirm im Bild; die Handyseite
    # kommt wie um 07:00 als Ebene daneben, deshalb bleibt links Luft.
    "s7": Szene(
        name="s7", datei="quellen_v08/g_s7.png",
        prompt=(
            MARA + HAUS +
            "14:00, a quiet lounge corner of the operations floor, away from the desks: a single "
            "armchair in warm grey fabric by the tall window, a small round side table with an "
            "espresso cup, a floor lamp, a large plant. Flat early-afternoon light. "
            "She SITS IN THE ARMCHAIR in the RIGHT HALF of the picture, seen from behind and "
            "slightly from the side — only her back, her shoulder and the side of her dark bob, "
            "never her face. She is LEANING BACK, relaxed, one leg crossed, and she looks DOWN "
            "at the SMARTPHONE she holds in one hand — we see only the BACK of the phone, its "
            "screen is turned away from the camera and not visible at all. "
            "THERE IS NO MONITOR, NO LAPTOP AND NO OTHER SCREEN anywhere in the picture. "
            "The LEFT QUARTER of the frame stays calm and uncluttered — floor, glazing and soft "
            "daylight only, no furniture and no plants there. Two colleagues far away in the "
            "background, small and out of focus. " + PHYSIK + STIL)),

    # ── 15:30, die Behoerde im Gespraech ─────────────────────────────────────
    # Auch hier stand sie vorher allein vor einem freistehenden Schirm. Jetzt
    # sitzt sie an ihrem Platz — es ist eine Freigabe, keine Vorfuehrung.
    "s8": Szene(
        name="s8", datei="quellen_v08/g_s8.png",
        verhaeltnis=1600 / 1000, mindest_hoehe=0.48, rechteck=0.97, schirm="schwarz",
        prompt=(
            MARA + HAUS +
            "15:30, her desk in the late afternoon. She SITS at the RIGHT EDGE of the picture, "
            "seen from behind over her right shoulder, one hand resting on the desk beside the "
            "keyboard — never her face. The large monitor stands LEFT OF CENTRE on the oak desk. "
            "Behind the desk a tall narrow window with low, warm afternoon sun, long shadows "
            "across the floor, and further back two colleagues at a bench desk, small and out of "
            "focus. " + SCHIRM + PHYSIK + STIL)),

    # ── 16:00, die Belegschaft ───────────────────────────────────────────────
    "s9": Szene(
        name="s9", datei="quellen_v08/g_s9.png",
        verhaeltnis=1600 / 1000, mindest_hoehe=0.50, rechteck=0.97, schirm="schwarz",
        prompt=(
            MARA + HAUS +
            "16:00, a review room with a long oak table. A LARGE MONITOR stands on the table "
            "facing the camera, the whole screen and bezel inside the frame. She sits at the "
            "LEFT EDGE of the picture on the near side of the table, seen from behind, leaning "
            "back, one arm over the back of her chair — never her face, and she does not overlap "
            "the screen. Two empty chairs on the far side. Low late-afternoon sun through a "
            "window on the right, long shadows on the table. " + SCHIRM + PHYSIK + STIL)),

    # ── 17:00, der Dachgarten ────────────────────────────────────────────────
    # Kein Bildschirm: der Tag endet ohne Oberflaeche.
    "s10": Szene(
        name="s10", datei="quellen_v08/s10_169.png",
        prompt=(
            MARA + HAUS +
            "17:00, the roof garden on top of the bank building. Low evening sun, warm golden "
            "light, long shadows. A planted terrace with grasses, olive trees in large pots, a "
            "long timber bench and a low table, a glass balustrade at the edge, and beyond it the "
            "Frankfurt skyline in soft haze. She STANDS at the RIGHT of the picture at the "
            "balustrade, seen FROM BEHIND, hands at her sides, looking out over the city — her "
            "face is not visible. She is calm and unhurried. Nobody else on the terrace. The "
            "LEFT HALF of the picture stays open: terrace, planting and skyline, no furniture in "
            "the way. " + PHYSIK + STIL)),
}

def bild_ein(pfad, name):
    p = io.BytesIO(open(pfad, "rb").read())
    p.name = name
    return p


def erzeugen(prompt, anker=()):
    eingabe = [bild_ein(REFERENZ, "mara.png")]
    eingabe += [bild_ein(f"{HIER}/{a}", f"raum{i}.png") for i, a in enumerate(anker)]
    r = client.images.edit(model="gpt-image-2", image=eingabe, prompt=prompt,
                           size="1536x1024", quality="high")
    b = Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
    # 3:2 auf 16:9 beschneiden — mittig, wie in der ganzen Strecke ueblich.
    return b.crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS)


def flaeche(bild):
    """Groesste Chroma-Flaeche: Maske, Kasten, Fuellgrad."""
    a = np.asarray(bild)
    m = keyen.maske(a)
    lab, n = ndimage.label(m)
    if not n:
        return None
    k = int(np.argmax(ndimage.sum(m, lab, range(1, n + 1)))) + 1
    teil = lab == k
    ys, xs = np.nonzero(teil)
    kasten = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
    breite, hoehe = kasten[2] - kasten[0], kasten[3] - kasten[1]
    return teil, kasten, teil.sum() / max(1, breite * hoehe)


def schwarzflaeche(bild, verhaeltnis=None):
    """Der ausgeschaltete Bildschirm — die RECHTECKIGSTE dunkle Flaeche.

    Der helle Rahmen um den Schirm ist hier nicht Zierde, sondern Bedingung:
    er trennt die dunkle Schirmflaeche von allem anderen Dunklen im Bild.
    Liegt eine Ecke eines schwarzen Sakkos am Schirm an, verschmelzen beide zu
    einer Flaeche — und deren Kasten ist nicht mehr gefuellt. Der Fehler faellt
    damit von selbst auf.

    Gesucht wird deshalb NICHT die groesste dunkle Flaeche: in einem Raum mit
    fuenf dunkel gekleideten Menschen ist die groesste oft ein Mensch. Gesucht
    ist die, die ihren Kasten am besten ausfuellt und, wenn ein Verhaeltnis
    vorgegeben ist, am ehesten hinkommt.
    """
    a = np.asarray(bild, np.int16)
    dunkel = (a.sum(axis=2) < 175) & (a.max(axis=2) - a.min(axis=2) < 45)
    dunkel = ndimage.binary_opening(dunkel, np.ones((5, 5)))
    lab, n = ndimage.label(dunkel)
    if not n:
        return None
    mindest = 0.008 * a.shape[0] * a.shape[1]
    bester, beste_note = None, -1.0
    for i in range(1, n + 1):
        teil = lab == i
        flaeche = int(teil.sum())
        if flaeche < mindest:
            continue
        ys, xs = np.nonzero(teil)
        kasten = (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)
        kb, kh = kasten[2] - kasten[0], kasten[3] - kasten[1]
        fuellgrad = flaeche / max(1, kb * kh)
        note = fuellgrad
        if verhaeltnis:
            note -= min(1.0, abs(kb / max(1, kh) - verhaeltnis) / verhaeltnis)
        if note > beste_note:
            bester, beste_note = (teil, kasten, fuellgrad), note
    return bester


def chroma_setzen(bild, kasten):
    """Die schwarze Flaeche durch reines Chroma ersetzen.

    Kling braucht die gruene Flaeche, um den Schirm ueber die Fahrt zu
    verfolgen. Sie entsteht hier statt im Bildmodell: als flaches Rechteck mit
    harter Kante, ohne Reflexe, ohne Verlauf, ohne Schimmer im Raum.
    """
    a = np.asarray(bild).copy()
    x0, y0, x1, y1 = kasten
    a[y0 + 1:y1 - 1, x0 + 1:x1 - 1] = CHROMA
    return Image.fromarray(a)


def rahmen_frei(bild, kasten, grenze):
    """Steht etwas vor dem RAHMEN des Bildschirms?

    Die Chroma-Pruefung sieht nur die gruene Flaeche. In der Abnahme lag eine
    Ecke ihres Sakkos auf der unteren linken Rahmenkante — die gruene Flaeche
    war zu 99,9 % frei, das Bild trotzdem falsch.

    Der Rahmen ist eine dunkle, geschlossene Flaeche rund um das Chroma. Liegt
    etwas ebenso Dunkles daran an (ein schwarzes Sakko), verschmelzen beide zu
    EINER Flaeche, und deren Kasten reicht weit ueber den Bildschirm hinaus.
    Genau das wird hier gemessen: wie weit der dunkle Zusammenhang den
    Bildschirm ueberragt.
    """
    a = np.asarray(bild, np.int16)
    dunkel = a.sum(axis=2) < 190
    lab, n = ndimage.label(dunkel)
    x0, y0, x1, y1 = kasten
    # Ein Pixel ueber der Mitte der Oberkante liegt im Rahmen.
    marke = lab[max(0, y0 - 3), (x0 + x1) // 2]
    if not marke:
        return True, 0
    ys, xs = np.nonzero(lab == marke)
    ueberstand = max(x0 - xs.min(), y0 - ys.min(), xs.max() - x1, ys.max() - y1)
    return ueberstand <= grenze, int(ueberstand)


def pruefen(bild, sz):
    """Genuegt das Bild der Montage? Rueckgabe: (ok, Befund)."""
    b, h = bild.size
    if sz.schirm == 'schwarz':
        erg = schwarzflaeche(bild, sz.verhaeltnis)
        if erg is None:
            return False, "kein Bildschirm gefunden"
    else:
        erg = flaeche(bild)
        if sz.verhaeltnis is None:
            # Szene ohne Bildschirm: es darf keine grosse gruene Flaeche geben.
            if erg and (erg[1][3] - erg[1][1]) / h > 0.12:
                return False, f"unerwartete gruene Flaeche {erg[1]}"
            return True, "ohne Chroma, wie vorgesehen"
        if erg is None:
            return False, "keine gruene Flaeche"
    teil, k, fuellgrad = erg
    kb, kh = k[2] - k[0], k[3] - k[1]
    befunde = []
    if kh / h < sz.mindest_hoehe:
        befunde.append(f"zu klein ({kh / h:.0%} statt {sz.mindest_hoehe:.0%} der Bildhoehe)")
    v = kb / kh
    if abs(v - sz.verhaeltnis) / sz.verhaeltnis > sz.toleranz:
        befunde.append(f"Verhaeltnis {v:.2f} statt {sz.verhaeltnis:.2f}")
    luft = min(k[0], k[1], b - k[2], h - k[3]) / h
    if luft < sz.rand:
        befunde.append(f"nur {luft:.1%} Luft zur Bildkante")
    if fuellgrad < sz.rechteck:
        befunde.append(f"nicht frontal oder etwas liegt davor (Fuellgrad {fuellgrad:.0%} "
                       f"statt {sz.rechteck:.0%})")
    return not befunde, "; ".join(befunde) or f"Kasten {k}, Luft {luft:.1%}, Fuellgrad {fuellgrad:.1%}"


def saeubern(bild):
    """Chroma-Flaeche auf reines Gruen ziehen — Verlaeufe und Reflexe raus."""
    teil, k, _ = flaeche(bild)
    voll = ndimage.binary_fill_holes(teil)
    voll = ndimage.binary_erosion(voll, iterations=1)
    a = np.asarray(bild).copy()
    a[voll] = CHROMA
    return Image.fromarray(a), k


def lauf(name, versuche=4):
    sz = SZENEN[name]
    ziel = f"{HIER}/{sz.datei}"
    os.makedirs(os.path.dirname(ziel), exist_ok=True)
    bester, bester_befund = None, ""
    for v in range(versuche):
        try:
            bild = erzeugen(sz.prompt, sz.anker)
        except Exception as e:
            print(f"  Versuch {v + 1}: {str(e)[:160]}", flush=True)
            time.sleep(10 * (v + 1))
            continue
        ok, befund = pruefen(bild, sz)
        print(f"  Versuch {v + 1}: {'ok' if ok else 'verworfen'} — {befund}", flush=True)
        bild.save(f"{S}/bild_{name}_{v + 1}.png")
        if ok:
            if sz.schirm == 'schwarz':
                _, k, _ = schwarzflaeche(bild, sz.verhaeltnis)
                # Im Repo liegt der SCHWARZE Schirm. Die Chroma-Flaeche setzt
                # chroma.py zur Laufzeit aus diesem Rechteck — so kommt kein
                # gruenes Bild ins Repo und keins in die Abnahme.
                bild.save(ziel)
                chroma.merken(os.path.splitext(os.path.basename(ziel))[0], k)
                print("gespeichert:", ziel, "| Schirm", k, flush=True)
            elif sz.verhaeltnis is None:
                bild.save(ziel)
                print("gespeichert:", ziel, flush=True)
            else:
                fertig, k = saeubern(bild)
                fertig.save(ziel)
                print("gespeichert:", ziel, "| Chroma", k, flush=True)
            return ziel
        if bester is None:
            bester, bester_befund = bild, befund
    raise SystemExit(f"{name}: kein Versuch hat bestanden (zuletzt: {bester_befund})")


if __name__ == "__main__":
    # Eine Szene, die nicht besteht, darf die uebrigen nicht aufhalten — sonst
    # kostet ein einzelner Ausreisser den ganzen Lauf.
    offen = []
    for n in sys.argv[1:] or list(SZENEN):
        print(n, flush=True)
        try:
            lauf(n)
        except SystemExit as e:
            print(" ", e, flush=True)
            offen.append(n)
    if offen:
        print("NICHT BESTANDEN:", ", ".join(offen), flush=True)
