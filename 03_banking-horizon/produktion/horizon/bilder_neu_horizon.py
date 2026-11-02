#!/usr/bin/env python3
"""Der neue Bildsatz von Banking Horizon — eine Grammatik, eine Emulsion.

Die erste Bildsprache war verworfen: Tuerkis-Orange als Render-Signatur,
Mittelperspektive in jedem Bild, leuchtende Bodenlinien und Drahtgitter-
Tuerme — also genau die Science-Fiction-Klischees, die die Vorlage
ausschliesst —, Stockfoto-Menschen in Werbeposen, und in jeder Szene ein
anderes Gebaeude. Vier Bildrichtungen sind gegeneinander angetreten, alle
mit demselben Motiv; die Jury hat entschieden:

  GRAMMATIK   Architektur-Editorial. Grossformat-Disziplin, korrigierte
              Vertikalen, Tageslicht, durchgezeichnete Tiefe. Das Haus ist
              der Hauptdarsteller, und nur so bleibt es ueber sechs Szenen
              dasselbe Haus.
  EMULSION    Analog. Portra-400-Korn ueber ALLE Bilder — das nimmt der
              Architektur den Render-Geruch, ohne ihr die Strenge zu nehmen.
  DISTANZ     Zwei, nicht mehr: WEIT (90 mm, f/11, Menschen unter einem
              Sechstel der Bildhoehe) fuer Halle, Betriebsraum, Galerie und
              Aussenbild; HALBTOTAL (150 mm, f/8, Figuren auf einem Drittel)
              fuer Beratung und Vorstand.

Ausdruecklich NICHT uebernommen wurde die Portraet-Richtung. Gesichter bei
f/2.2 sind das eine, was die Videofahrt zuverlaessig zerstoert — und es
waeren ausgerechnet die beiden wichtigsten Bilder gewesen. Naehe entsteht
hier ueber Bildausschnitt und Koerperhaltung, nicht ueber Schaerfentiefe;
der Hintergrund bleibt scharf, damit das Haus erkennbar bleibt.

HAUS steht wortgleich in jedem Prompt. Das ist die eigentliche Versicherung
dagegen, dass wieder sechs verschiedene Gebaeude entstehen.

    SCRATCH=… python3 bilder_neu_horizon.py          # alle
    SCRATCH=… python3 bilder_neu_horizon.py a4 a5    # einzelne
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
BILDER = f"{HIER}/bilder"
ROH = f"{HIER}/bilder/roh"
os.makedirs(BILDER, exist_ok=True)
os.makedirs(ROH, exist_ok=True)

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

# ── Das Haus. Wortgleich in jedem Prompt. ────────────────────────────────────
HAUS = (
    "Always the same building, a West German bank headquarters of the late 1960s, carefully "
    "modernised: shell limestone cladding in large slabs, board-formed coffered concrete "
    "ceiling, pale terrazzo floor with thin brass divider strips, full-height oak-panelled "
    "doors with brass lever handles, dark bronze steel-framed window mullions, patinated brass "
    "handrails. Same palette in every shot: limestone beige, concrete grey, oak brown, "
    "patinated brass, charcoal steel, cool grey-blue shadows. "
)

# ── Die Emulsion. Nimmt der Architektur den Render-Geruch. ──────────────────
def emulsion(weit=True):
    optik = ("90mm lens at f/11, tripod at 1.55 metre eye level"
             if weit else "150mm lens at f/8, tripod at 1.45 metre eye level")
    return (
        f"Shot on 4x5 Kodak Portra 400 sheet film, {optik}, verticals perfectly corrected, "
        "deep focus front to back. Visible fine film grain across the whole frame including "
        "the highlights, gentle corner falloff, faint halation where sunlight meets the window "
        "mullions, matte non-reflective surfaces, a trace of dust in the air. Flat "
        "negative-film contrast with soft rolled-off highlights and open shadows. Daylight "
        "only, interior fixtures switched off. No HDR, no digital sharpening, no polish, no "
        "CGI cleanliness; minor real-world imperfections in alignment and wear. "
    )

# ── Die Menschen. Zeitlos gekleidet, videosicher gerahmt. ───────────────────
MENSCHEN_WEIT = (
    "People are small in the frame, each under one sixth of the frame height, turned "
    "three-quarters or fully away from camera so that no facial features are individually "
    "resolved. Plain contemporary business clothing in wool grey, navy and camel; no hats, no "
    "newspapers, no period props, nothing that dates the image before 2015. Hands empty or "
    "holding plain paper. Nobody looks at the camera. "
)
MENSCHEN_NAH = (
    "Figures at about one third of the frame height, head never larger than one eighth of the "
    "frame height, three-quarters turned or in profile, background fully in focus, no bokeh, "
    "no shallow depth of field. Plain contemporary business clothing in wool grey, navy and "
    "camel; no hats, no period props, nothing that dates the image before 2015. Nobody looks "
    "at the camera. "
)
NICHTS = (
    "No text, no letters, no numbers, no logos, no signage, no watermarks. No glowing screens, "
    "no screens as light source, no visible user interfaces, no dashboards, no light strips, "
    "no glowing floor lines, no holograms, no wireframe overlays, no robots, no science "
    "fiction, no teal, no cyan, no turquoise, no orange-and-teal grading, no lens flare, no "
    "vignette, no bokeh balls, no stock-photo poses, no people facing the camera."
)


def szene(text, weit=True):
    return text + HAUS + (MENSCHEN_WEIT if weit else MENSCHEN_NAH) + emulsion(weit) + NICHTS


# ── Die acht Bilder ─────────────────────────────────────────────────────────
# a1 und a6 sind derselbe Blick zu zwei Tageszeiten — der Film kehrt am Ende
# dorthin zurueck, wo er angefangen hat, und der Vergleich traegt die ganze
# Erzaehlung ohne ein einziges Wort.
# ── Was welches Bild BEHAUPTET ──────────────────────────────────────────────
# Der Film hat neun gesprochene Zeilen, und jedes Bild muss die seine
# beweisen. Das ist die Probe, an der die erste Fassung gescheitert ist: ein
# dunkler, leerer Raum mit drei gestrandeten Menschen sagt "die Bank ist
# tot", nicht "die Marktfolge arbeitet autonom". Autonom heisst: es laeuft,
# hell und in Ordnung, nur ohne uns.
#
#   a1   "Seit Jahrzehnten basiert Banking auf Stabilitaet."
#        Eine Bank, die funktioniert. Menschen, Betrieb, Normalitaet.
#   a2   "Doch die Rollen verschieben sich."
#        Derselbe Raum, aber wer was tut, hat sich verschoben: der Schalter
#        ist unbesetzt, die Mitarbeiter stehen NEBEN den Kunden im Raum.
#   a3   "Der Berater wird zum Sparringspartner."
#        Zwei Gleiche im Streitgespraech ueber eine schwere Entscheidung.
#        Kein Formular, kein Verkauf, kein Geraet dazwischen.
#   a4   "Die Marktfolge arbeitet autonom."
#        Drei Anlaeufe, dreimal dieselbe falsche Grammatik: ABWESENHEIT.
#        Dunkel und leer las sich als Tod, hell und leer als Verlassenheit,
#        moebellos und tadellos als Bedeutungsleere. Menschenleere ist kein
#        neutrales Bild, sondern ein kodiertes Genre — Diel und Lewis haben
#        2022 im Journal of Environmental Psychology gezeigt, dass ein
#        vertrauter Raum ohne die erwartete menschliche Praesenz eine
#        Uncanny-Reaktion ausloest. Und es stimmt sachlich nicht: die
#        menschenleere Fabrik gibt es praktisch nicht. Philips Drachten
#        betreibt ueber 120 Roboter mit weniger als zehn Menschen — duenn
#        besetzt, nicht leer, und die wenigen Uebrigen sind wichtiger
#        geworden, nicht unwichtiger (Paradox der Automatisierung).
#        Also: der grosse Saal ist das Argument, und drei Menschen darin
#        sind sein warm belichtetes Zentrum. Das Verhaeltnis Raum zu
#        Menschen IST die Aussage.
#   a4c  "Compliance wird Teil des Systems."
#        Kein Kontrollpunkt, keine Schranke, niemand postiert. Der Mensch
#        geht durch, und nichts haelt ihn auf, weil laengst geprueft wurde.
#   a5   "Vorstaende entscheiden in Echtzeit."
#        Eine Entscheidung im Gang: einer spricht, die anderen reagieren,
#        einer geht schon los. Nicht fuenf Menschen, die schweigend auf eine
#        leere Tischplatte sehen.
#   a6   "Was entscheidet, wird angreifbar."
#        Das Haus offen und unbewacht in der Daemmerung, die Tuer nach
#        hinten weit auf. Derselbe Blick wie a1 — der Vergleich traegt alles.
#   a7   "Entscheidungen fuer eine Zukunft ohne Vorbild."
#        Das Haus von aussen, der Platz leer, der Himmel offen.

SZENEN = {
 "a1": szene(
  "The banking hall of the building at 8:20 in the morning: a double-height room with a low "
  "stone counter along the right, a plain oak bench, and an open stair with a brass handrail "
  "at the back. Low autumn sun enters through the tall window wall on the left and lays four "
  "sharp bright rectangles across the terrazzo. The sun reaches only the front third of the "
  "hall; the far half lies in flat, cool, unlit grey and the coffered ceiling reads dark. Four "
  "people: one member of staff walking toward the stair, two customers seated on the bench, "
  "one standing at the counter. One full-height oak door at the back stands slightly ajar onto "
  "an unlit space. The room is orderly and well kept, but larger than the number of people in "
  "it. Composed but not reassuring. "),

 # Pixelgleiche Kamera zu a1 — sonst sieht man in der ersten Fahrt einen
 # Kameraversatz, den es nicht geben darf.
 "a2": szene(
  "The SAME banking hall a little later the same morning. Identical camera position, identical "
  "90mm focal length and identical framing to the anchor image: the oak bench, the front edge "
  "of the stone counter, the stair nosing and the top of the oak door sit in exactly the same "
  "places in the frame. The stone counter is now unstaffed and completely clear — nobody works "
  "behind it any more. Instead two members of staff stand out in the open hall ALONGSIDE two "
  "customers, side by side rather than across a counter, talking; a fifth person walks toward "
  "the stair. The sun rectangles have moved a little. The room is just as busy as before, but "
  "the counter has stopped being the place where things happen. Nothing is broken and nothing "
  "is dramatic. Quiet, watchful, faintly unresolved. "),

 "a3": szene(
  "A consultation alcove off the banking hall. A client and a bank advisor sit facing each "
  "other across a small round oak table at exactly equal height, both leaning in over the "
  "table, mid-argument: the advisor is speaking with one open hand resting on the table edge, "
  "the client is listening and about to answer. They are two equals working on one difficult "
  "question. There is nothing on the table but two glasses of water — no papers, no folder, no "
  "brochure, no screen, no device of any kind between them, and nothing is being sold or signed. "
  "Behind them the limestone wall and a tall bronze-framed window. Daylight from the left. Two "
  "people only. Tight half-total framing: the figures occupy a full third of the frame height "
  "and no more than 1.2 metres of wall shows above their heads; the table edge sits on the lower "
  "third line; the wall behind fills the frame and no ceiling is visible. ", weit=False),

 # Zweimal las das Modell "vierzig Schreibtische" als Lesesaal. Mehr
 # Beschreibung half nicht — Naehe hilft: ein einzelner Arbeitsplatz gross im
 # Vordergrund, an dem Rollcontainer, Drehstuhl und Kabel zu sehen sind. Dann
 # liest sich der Rest der Reihe mit. Die schraege Perspektive bricht
 # ausserdem die Reihe der Zentralperspektiven in der Mitte des Films.
 "a4": szene(
  "The SAME long back-office hall of the building in the late morning, seen from a tripod at "
  "1.55 metres with the room running diagonally out of frame, no vanishing point on the centre "
  "axis. The hall is vast, immaculate and contemporary: no paper anywhere, no filing cabinets, "
  "no trolleys, no printers, no clutter, and only a handful of plain desks left standing far "
  "back along the walls. Near the centre of the great room stand THREE people, close together "
  "around one long low table, mid-conversation: one is pointing at something on the tabletop, "
  "the other two lean in. They are small within the frame and yet unmistakably its subject — "
  "the only warm daylight from the bronze windows falls across exactly them, while the rest of "
  "the hall recedes into cool neutral grey. Two slim matt dark monitors on their table are "
  "turned away from the camera, dim, switched off and unreadable. Nobody else is present in the "
  "entire hall. Three people are running a room built for forty, and they are concentrated, "
  "capable and busy — not stranded. Calm, serious, restrained. "),

 "a4c": szene(
  "A long limestone gallery in the SAME building, connecting the back-office floor to the "
  "boardroom level, seen in deep perspective from a tripod but with the vanishing point off "
  "centre. Along the right wall runs a row of eight identical oak doors that reach the full "
  "height of the wall, roughly 3.4 metres tall, their top edges meeting the underside of the "
  "concrete ceiling beam with no wall panel above them, brass lever handle at 1.05 metres, all "
  "closed. There is no reception desk, no barrier, no counter and nobody posted anywhere along "
  "the gallery. One person crosses the near third of the frame laterally from right to left in "
  "profile, not receding down the axis, without slowing at any door — nothing is checked, "
  "nothing is signed, nothing stops them. Cool even daylight from a clerestory above. Orderly, "
  "silent, slightly uneasy. "),

 # Die Figuren blieben klein, weil der Raum riesig beschrieben war. Also den
 # Raum verkleinern: die Wand steht dicht hinter ihnen.
 "a5": szene(
  "A small boardroom in the SAME building, no larger than six by seven metres, the limestone "
  "back wall only two metres behind the people so that it fills the frame. Five people stand "
  "close around a plain stone conference table, 3.2 by 1.1 metres, slab top 8 centimetres thick "
  "on two recessed legs, no chairs pulled out. A DECISION IS IN PROGRESS: the woman at the "
  "centre is speaking, mid-sentence, one hand lifted just off the table; the two men beside her "
  "are turned toward her, one nodding; a fourth leans forward with both palms on the table "
  "edge; the fifth has already half turned away toward the door, moving off to act on it. They "
  "look at each other, not at the table. Their hands are open and clearly separated, five to "
  "seven fingers never visible on any one hand. A single tall bronze-framed window at the left "
  "edge gives cool afternoon daylight. The camera is close: the five figures fill the middle "
  "half of the frame and stand a full third of the frame height, no more than one metre of wall "
  "above their heads, no ceiling visible. Urgent but controlled. ", weit=False),

 # a1 und a6 sind derselbe Blick zu zwei Tageszeiten — der Film kehrt dorthin
 # zurueck, wo er angefangen hat, und der Vergleich traegt die ganze
 # Erzaehlung ohne ein einziges Wort. Deshalb buergerliche Daemmerung und
 # nicht Nacht: bei Nacht sieht man den Raum nicht mehr, den man vergleichen
 # soll.
 "a6": szene(
  "The SAME banking hall as the first image, the SAME camera position and the SAME framing, but "
  "now at civil twilight, twenty minutes after sunset. Exposure held for the terrazzo and not "
  "for the window wall, so the room stays fully readable: open grey shadows, no crushed blacks, "
  "no blue cast, the limestone still legibly beige, the terrazzo matte and dry with no mirror "
  "reflections. The sun rectangles are gone. The stone counter, the oak bench and the stair "
  "with its brass handrail are exactly where they were. One single person crosses the hall "
  "toward the door, small and far away. The full-height oak door at the back now stands wide "
  "open onto an unlit space. Everything is intact, nothing has been damaged, and the room is "
  "simply empty. "),

 # Die Halle aus a1 muss von aussen ablesbar sein, sonst ist es ein anderes
 # Haus und die letzte Fahrt scheitert. Deshalb nah und tief statt weit und
 # hoch: der verglaste Hallenteil traegt das Bild.
 "a7": szene(
  "The SAME building seen from outside at dusk from close range across a narrow empty square, "
  "the camera low and near so that the ground floor fills the lower two thirds of the frame. "
  "The left two thirds of the frame is a two-storey-high glazed window wall set deep behind "
  "shell limestone piers, with the same dark bronze mullions as the interior — and through that "
  "glass the banking hall of the first image is clearly readable from outside: the same "
  "board-formed coffered ceiling, the same low stone counter along its right side, the same "
  "open stair with the brass handrail at the back, the same oak bench, all unlit. Only the top "
  "third of the frame shows two storeys of smaller bronze-framed windows above, warm light "
  "still burning behind a few of them. The square in front is completely empty with no people "
  "anywhere in the frame, the paving wet from earlier rain. Deep blue-grey dusk. Wide, still, "
  "unresolved. "),
}


def emulgieren(bild):
    """Aus dem Rendering eine Aufnahme machen.

    Die Bildsprache verlangt Portra-400-Korn, weichen Randabfall und
    Halation. Im Prompt steht das alles — angekommen ist es in keinem
    einzigen Bild: das Modell rendert sauber, und kein zusaetzliches
    Adjektiv aendert daran etwas. Also wird es hier gerechnet, wo es
    zuverlaessig funktioniert.

      Halation   Helle Flaechen bluehen minimal in ihre Umgebung, wie Licht,
                 das im Film durch die Traegerschicht streut. Das ist der
                 Unterschied zwischen einem Fenster und einem weissen Rechteck.
      Korn       Staerker in den Mitteltoenen als in Lichtern und Schatten —
                 so verhaelt sich Negativfilm. Gleichmaessiges Rauschen ueber
                 alles sieht nach Digitalfehler aus, nicht nach Film.
      Randabfall Ein Hauch. Eine sichtbare Vignette waere der naechste Effekt
                 statt des Endes der Effekte.
    """
    x = np.asarray(bild, dtype=np.float32) / 255.0
    h, w, _ = x.shape

    licht = np.clip((x.max(axis=2) - 0.82) / 0.18, 0, 1)
    weich = np.asarray(Image.fromarray((licht * 255).astype(np.uint8))
                       .filter(ImageFilter.GaussianBlur(14)), dtype=np.float32) / 255.0
    x = x + weich[..., None] * np.array([0.055, 0.040, 0.028], dtype=np.float32)

    rng = np.random.default_rng(11)
    hell = x.mean(axis=2)
    staerke = np.clip(1.0 - np.abs(hell - 0.45) / 0.55, 0.25, 1.0)
    korn = (rng.normal(0, 1, (h, w, 1)).astype(np.float32) * 0.9
            + rng.normal(0, 1, (h, w, 3)).astype(np.float32) * 0.35)
    x = x + korn * (staerke[..., None] * 0.0165)

    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx / w - 0.5) * 2) ** 2 + ((yy / h - 0.5) * 2) ** 2) / 1.4142
    x = x * (1.0 - 0.10 * r ** 2.2)[..., None]

    return Image.fromarray((np.clip(x, 0, 1) * 255).astype(np.uint8))


def bild_ein(pfad, name):
    p = io.BytesIO(open(pfad, "rb").read())
    p.name = name
    return p


def erzeugen(name, versuche=3):
    ziel = f"{BILDER}/{name}.png"
    if os.path.exists(ziel):
        print(name, "liegt schon da", flush=True)
        return
    prompt = SZENEN[name]
    # a1 traegt das Haus. Alle anderen bekommen es als Anker mitgegeben —
    # so laufen sie gleichzeitig und stehen trotzdem im selben Gebaeude.
    anker = f"{ROH}/a1.png" if name != "a1" else None
    for versuch in range(1, versuche + 1):
        try:
            if anker and os.path.exists(anker):
                r = client.images.edit(model="gpt-image-2",
                                       image=[bild_ein(anker, "haus.png")],
                                       prompt=prompt, size="1536x1024", quality="high")
            else:
                r = client.images.generate(model="gpt-image-2", prompt=prompt,
                                           size="1536x1024", quality="high")
            b = Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
            b = b.crop((0, 80, 1536, 944)).resize((1920, 1080), Image.LANCZOS)
            b.save(f"{ROH}/{name}.png")          # ungekoernt, dient als Anker
            emulgieren(b).save(ziel)
            print("fertig:", name, flush=True)
            return
        except Exception as e:      # noqa: BLE001 — ein Fehlschlag darf den Satz nicht kippen
            print(f"{name}: Versuch {versuch}: {str(e)[:160]}", flush=True)
    print(f"{name}: nach {versuche} Versuchen kein Bild", flush=True)


if __name__ == "__main__":
    namen = sys.argv[1:] or list(SZENEN)
    if "a1" in namen:                      # a1 zuerst, es ist der Anker
        erzeugen("a1")
        namen = [n for n in namen if n != "a1"]
    faeden = [threading.Thread(target=erzeugen, args=(n,)) for n in namen]
    for f in faeden:
        f.start()
    for f in faeden:
        f.join()
    print("BILDER NEU FERTIG", flush=True)
