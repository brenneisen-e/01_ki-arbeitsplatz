#!/usr/bin/env python3
"""
Personen-Retusche im Master-Strukturbild — VERWORFEN, siehe unten.

ERGEBNIS (2026-09-10): nach vier Durchgaengen zurueckgesetzt. Das Bild in
public/images/Strukturbild.jpg ist wieder der unretuschierte Ausgangsstand.
Das Skript bleibt als Dokumentation liegen.

Ziel war, die Personen realistischer zu machen (die Frisuren aelterer Personen
wirkten kuenstlich). Jeder Durchgang hat das Ziel erreicht und dabei etwas
anderes zerstoert:

1. gpt-image-2, RAND 36, WEICH 14: bessere Gesichter, aber der Konferenztisch
   zerfiel in fuenf versetzte Segmente, in Operations fehlten eine Hand, zwei
   Paar Fuesse und ein Stuhlfusskreuz. Von elf geprueften Fundstellen lagen neun
   in retuschierten Bereichen.
2. gpt-image-1.5 mit input_fidelity=high, RAND 20, WEICH 14: Moebelkanten blieben
   heil, dafuer halbtransparente Doppelbelichtungen ueberall — ein Kunde ohne
   Kopf, eine Passantin durchsichtig, eine koerperlose Hand auf dem Tisch, ein
   dreifacher Arm am Whiteboard.
3. RAND 40, WEICH 6: Doppelbelichtungen weg (die Blendkante lag nicht mehr auf
   der Person), dafuer sitzen die Personen neben ihren Stuehlen statt darin, und
   in der Filiale fehlte einem Berater der Kopf.

Der Grund ist strukturell: eine Person laesst sich nicht aus ihrer Umgebung
herausloesen. Die Maske enthaelt immer Stuhl, Tischkante und Wand, das Modell
zeichnet sie mit, und jede Abweichung wird an der Montagegrenze sichtbar. Bei
39 Personen summiert sich das schneller, als man es einzeln nachbessern kann.

Wer die Personen wirklich verbessern will, erzeugt das Strukturbild neu — der
Prompt dafuer liegt in bild-prompt-strukturbild-2030.md, und gpt-image-1.5 macht
Menschen deutlich besser als das Modell, mit dem das Bild urspruenglich entstand.
Dann ist alles aus einem Guss und es gibt keine Montagenaehte.

Uebertragbar geblieben sind drei Erkenntnisse zum Inpainting mit gpt-image:

1. Der Prompt darf keine Neurahmung nahelegen; ohne "same camera, framing and
   crop, do not zoom out" kommt die Kachel herausgezoomt und neu erfunden zurueck.
2. input_fidelity="high" (gpt-image-1.5, nicht gpt-image-2) haelt die Kachel bei
   Skalierung 1.00 statt 1.03 bis 1.13.
3. Der Maskenrand muss deutlich groesser sein als die weiche Blendzone, sonst
   ueberblendet man alte und neue Fassung mitten auf der Person.

Aufruf (falls doch noch einmal gebraucht):
  export OPENAI_API_KEY=...            # oder $SCRATCH/.openai_env
  python3 produktion/strukturbild/personen_retusche.py --overlay        # Boxen pruefen
  python3 produktion/strukturbild/personen_retusche.py                  # alle Personen
  python3 produktion/strukturbild/personen_retusche.py --nur og3_l_1
  python3 produktion/strukturbild/personen_retusche.py --pruefen        # Ausrichtung
  python3 produktion/strukturbild/personen_retusche.py --kontakt        # Kontaktbogen

Ergebnis: $SCRATCH/strukturbild/Strukturbild_retusche.jpg (+ Kacheln, Kontaktbogen).
"""
import argparse, base64, io, os, sys, time  # + numpy, opencv-python-headless
from PIL import Image, ImageDraw, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HIER, "..", ".."))
QUELLE = os.path.join(APP, "public", "images", "Strukturbild.jpg")
S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                   "27db0dfd-7ffe-5925-98a2-721e8026403b/scratchpad")
ZIEL = os.path.join(S, "strukturbild")
os.makedirs(os.path.join(ZIEL, "tiles"), exist_ok=True)

TILE = 1024      # Kantenlaenge des Ausschnitts, der ans Bildmodell geht (native Pixel)
# RAND und WEICH haengen zusammen und entscheiden ueber die Geisterbilder:
# Die weiche Blendkante liegt genau auf dem Maskenrand. Faellt sie auf die Person
# selbst, mischen sich alte und neue Fassung — dann scheint der alte Kopf durch den
# neuen, Arme verdoppeln sich, ganze Personen werden halbtransparent. Der Rand muss
# deshalb deutlich groesser sein als die Blendzone, damit ueberblendet wird, wo
# Kachel und Original ohnehin gleich sind: im Hintergrund neben der Person.
RAND = 40        # Maskenpolster um die Personen-Box
WEICH = 6        # weiche Kante beim Zurueckmontieren (Blendzone rund 12 px)

# Personen-Boxen (x0, y0, x1, y1) in Pixeln des 6144x4096-Bildes + Beschreibung.
# Keine Box darf ueber die Betonkante ihrer Etage hinausreichen (3. OG y 1215,
# 2. OG y 2078, 1. OG y 2860): sonst malt das Bildmodell Beine und Stuhlsaeulen
# ueber die Kante hinweg ins Nichts, wo im Bild gar kein Boden mehr ist.
# Die Beschreibung haelt Alter, Geschlecht, Haar, Kleidung und Pose fest, damit die
# neue Version zur Szene passt.
PERSONEN = {
  # 3. OG links — Boardroom
  "og3_l_1": ((764, 773, 1043, 1205), "man in his late 50s with grey hair and glasses, dark suit and white shirt, seated at the left end of a conference table, turned to the right in conversation"),
  "og3_l_2": ((1052, 792, 1312, 1210), "man in his 40s with short dark hair, dark blue suit, white open-collar shirt, seated at a conference table facing right"),
  "og3_l_3": ((1349, 792, 1581, 1145), "woman in her 40s with long curly auburn hair, dark red blazer, seated at a conference table, facing right"),
  "og3_l_4": ((1628, 798, 1906, 1145), "bald Black man in his 50s with a short grey beard, dark suit, white shirt and tie, seated at a conference table facing the camera"),
  "og3_l_5": ((2046, 801, 2287, 1205), "Black woman in her 30s with short natural curly hair, dark burgundy blouse, seated at a conference table facing left"),
  "og3_l_6": ((2296, 783, 2575, 1205), "man in his 40s with short dark hair, dark suit, light shirt, seated at the right end of a conference table facing left"),
  # 3. OG rechts — Produkte & Innovation
  "og3_r_1": ((3662, 718, 3866, 1205), "woman in her 30s with long dark hair, light green sweater and dark jeans, standing at a whiteboard covered in sticky notes, seen from behind at a three-quarter angle, one arm raised placing a note"),
  "og3_r_2": ((4061, 662, 4275, 1205), "man in his 50s with grey hair and a grey beard, dark green sweater over a checked shirt, dark jeans, standing, facing left towards the whiteboard, hands in pockets"),
  "og3_r_3": ((4535, 773, 4786, 1205), "woman in her 30s with curly shoulder-length dark hair, dark green top, seated at a desk with an open laptop, facing right"),
  "og3_r_4": ((4860, 773, 5129, 1205), "man in his 30s with short dark hair and a beard, rust-colored patterned shirt, seated at a desk facing left"),
  # 2. OG links — Compliance & Risk
  "og2_l_1": ((829, 1668, 1033, 2070), "man in his 50s with grey hair, brown cardigan, seated in a black office chair at a desk with monitors, seen from behind at a slight angle"),
  "og2_l_2": ((1210, 1668, 1488, 2070), "man in his 30s with short curly dark hair, denim shirt, seated in a black office chair at a desk with monitors, seen from behind"),
  "og2_l_3": ((1628, 1668, 1841, 2070), "woman in her 30s with long curly dark hair, dark red top, seated in a black office chair at a desk with monitors, seen from behind"),
  "og2_l_4": ((1999, 1668, 2213, 2070), "man in his 40s with short grey hair, grey sweater, seated in a black office chair at a desk with monitors, seen from behind"),
  "og2_l_5": ((2306, 1668, 2528, 2070), "man in his 30s with dark curly hair, light patterned shirt, seated in a black office chair at a desk with monitors, seen from behind"),
  # 2. OG rechts — Technology
  "og2_r_1": ((3579, 1575, 3755, 2070), "woman in her 30s with dark hair in a low ponytail, light sage green t-shirt and dark jeans, standing, facing right, gesturing while talking"),
  "og2_r_2": ((4145, 1519, 4377, 2070), "man in his 60s with grey hair and a grey beard, brown tweed blazer over a light shirt, dark jeans, standing, facing left, hands in pockets"),
  "og2_r_3": ((4507, 1659, 4823, 2070), "man in his 30s with dark hair and a full beard, dark blue hoodie, seated in a black office chair at a desk with a monitor, facing right"),
  "og2_r_4": ((4971, 1659, 5269, 2070), "woman in her 50s with long curly grey-brown hair, olive green blazer, seated in a black office chair at a desk facing left, hands on the desk"),
  # 1. OG links — Corporate Services / HR
  "og1_l_1": ((736, 2379, 941, 2843), "man in his 60s with long white hair and a white beard, tan jacket, seated in a green armchair at a small round table, facing right"),
  "og1_l_2": ((1015, 2388, 1229, 2843), "man in his 40s with short dark hair, glasses and a short beard, yellow patterned shirt, dark trousers, seated in a green armchair at a small table, facing left"),
  "og1_l_3": ((1971, 2388, 2176, 2852), "woman in her 30s with dark hair tied back, pink cardigan over a white top, dark trousers, seated in a green armchair at a small round table, facing right"),
  "og1_l_4": ((2296, 2379, 2529, 2843), "man in his 40s with short dark hair and a short beard, teal polo shirt, khaki trousers, seated in a green armchair, facing left"),
  # 1. OG rechts — Operations
  "og1_r_1": ((3616, 2416, 3839, 2824), "man in his 50s with grey hair and a short grey beard, dark purple sweater, seated in a black office chair at a desk with a monitor, facing right"),
  "og1_r_2": ((4043, 2388, 4275, 2852), "man in his 30s with a large curly dark hairstyle, light green polo shirt, seated in a black office chair at a desk facing left"),
  "og1_r_3": ((4526, 2416, 4730, 2806), "man in his 30s with dark hair and beard, orange-brown patterned shirt, seated in a black office chair at a desk, facing right"),
  "og1_r_4": ((4953, 2369, 5194, 2852), "man in his 50s with short grey hair, blue shirt, grey trousers, seated in a black office chair turned to the right, talking to a standing colleague"),
  "og1_r_5": ((5176, 2323, 5399, 2852), "woman in her 50s with shoulder-length grey-blonde hair and glasses, brown cardigan, dark trousers, standing and leaning slightly forward with hands on a desk, facing left"),
  # EG links — Filiale
  "eg_l_1": ((443, 3271, 857, 4014), "woman in her 40s with dark hair in a ponytail, beige wool coat, dark jeans, white sneakers, brown leather shoulder bag, walking to the left in profile on a plaza"),
  "eg_l_2": ((829, 3076, 987, 3587), "man in his 60s with grey hair and glasses, tan blazer, grey trousers, standing at a wooden bank counter seen from behind at an angle, talking to the teller"),
  "eg_l_3": ((1024, 3076, 1210, 3318), "man in his 40s with short dark hair, glasses and a beard, white shirt with a grey vest, standing behind a bank counter facing left"),
  "eg_l_4": ((1461, 3104, 1600, 3309), "woman in her 40s with dark hair tied back and glasses, grey-blue blouse, standing behind a bank counter facing right"),
  "eg_l_5": ((1702, 3086, 1851, 3606), "woman in her 30s with long dark hair, long camel coat, jeans, standing in front of a bank counter, seen from behind at an angle, facing left"),
  "eg_l_6": ((2352, 3067, 2519, 3615), "man in his 30s with short dark hair and a beard, blue patterned shirt, dark jeans, black backpack, standing at a green ATM, seen from behind at an angle"),
  # EG rechts — Beratung
  "eg_r_1": ((3857, 3160, 4061, 3624), "woman in her 40s with straight shoulder-length brown hair, beige cardigan, dark trousers, seated in a grey armchair at a round wooden table, facing right"),
  "eg_r_2": ((4191, 3110, 4359, 3624), "man in his 40s with short dark hair, olive green sweater over a shirt, seated at a round wooden table facing left, hands folded"),
  "eg_r_3": ((4340, 3179, 4526, 3634), "woman in her 30s with long curly dark hair, beige knit sweater, jeans, seated in a grey armchair, seen from behind at an angle"),
  "eg_r_4": ((4804, 3179, 5163, 3938), "man in his 40s with short dark hair and a short beard, blue polo shirt, light grey trousers, brown shoes, walking to the left in profile on a plaza"),
  # Aufzug
  "lift_1": ((2978, 1545, 3134, 2073), "woman in her 40s with shoulder-length dark hair, dark red cardigan over a black top, dark jeans and dark shoes, standing upright inside a glass elevator car facing the camera, her hands resting on the horizontal metal handrail that is fixed to the car wall behind her — the handrail passes behind her hands, never in front of them"),
}

# Der Prompt entscheidet ueber die halbe Qualitaet. Der erste Anlauf (gpt-image-2,
# ohne input_fidelity, ohne Rahmungsverbot) lieferte zwar bessere Gesichter, zerlegte
# aber die Umgebung: der Konferenztisch zerfiel in versetzte Segmente, Haende und
# Schuhe verschwanden, Stuhlfusskreuze loesten sich auf. Deshalb steht jetzt
# ausdruecklich drin, dass Ausschnitt UND Umgebung unangetastet bleiben und was an
# der Person vollstaendig sein muss.
PROMPT = (
  "Local photo retouch only. In the transparent area, replace the person with a fully "
  "photorealistic, natural-looking human being — {beschreibung}. Keep exactly the same "
  "pose, position, scale, clothing colours, age, gender and hair colour, and the same "
  "camera angle, perspective and daylight, so the person fits seamlessly into the "
  "surrounding architecture, furniture and shadows. "
  "Realistic hair with natural strands and hairline, realistic skin texture, correct "
  "anatomy and proportions, natural expression. Both hands complete with five clearly "
  "separated fingers wherever hands are visible; both feet in proper closed shoes "
  "wherever feet are visible — never bare feet, never a stump. "
  "Any furniture in the transparent area — table tops and their front edges, desks, "
  "chair seats, backrests, five-star pedestals with castors — must continue exactly in "
  "line with the same furniture visible outside the transparent area: same height, same "
  "thickness, same edge, no step, no seam, no offset. "
  "Keep the exact same framing and crop — do not zoom out, do not reframe, and do not "
  "change anything outside the transparent area. No waxy or doll-like look, no smoothing "
  "artefacts, no floating hair, no extra limbs, no text."
)


def lade_key():
    if os.environ.get("OPENAI_API_KEY"):
        return
    p = os.path.join(S, ".openai_env")
    if os.path.exists(p):
        os.environ["OPENAI_API_KEY"] = open(p).read().strip().split("=", 1)[1]
        return
    raise SystemExit("OPENAI_API_KEY fehlt (Umgebung oder $SCRATCH/.openai_env)")


def tile_fenster(box, W, H):
    """1024er-Fenster um die Box (falls die Box hoeher ist als TILE, wird sie skaliert)."""
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    groesse = max(TILE, (y1 - y0) + 2 * RAND + 40, (x1 - x0) + 2 * RAND + 40)
    tx0 = min(max(0, cx - groesse // 2), W - groesse)
    ty0 = min(max(0, cy - groesse // 2), H - groesse)
    return (tx0, ty0, tx0 + groesse, ty0 + groesse)


def maske_fuer(box, fenster, groesse):
    """RGBA-Maske: transparent = neu rechnen. Abgerundete Box mit Polster."""
    x0, y0, x1, y1 = box
    fx, fy = fenster[0], fenster[1]
    m = Image.new("L", (groesse, groesse), 255)
    ImageDraw.Draw(m).rounded_rectangle(
        (x0 - fx - RAND, y0 - fy - RAND, x1 - fx + RAND, y1 - fy + RAND), radius=60, fill=0)
    rgba = Image.new("RGBA", (groesse, groesse), (0, 0, 0, 255))
    rgba.putalpha(m)
    return rgba, m


def edit(client, bild, maske, prompt, versuche=4, groesse="1024x1024"):
    for v in range(versuche):
        try:
            pb, pm = io.BytesIO(), io.BytesIO()
            bild.save(pb, format="PNG"); pb.name = "bild.png"; pb.seek(0)
            maske.save(pm, format="PNG"); pm.name = "maske.png"; pm.seek(0)
            modell = os.environ.get("IMAGE_MODEL", "gpt-image-1.5")
            r = client.images.edit(model=modell, image=pb, mask=pm, prompt=prompt,
                                   size=groesse, quality="high", input_fidelity="high")
            return Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert("RGB")
        except Exception as e:
            print("  retry", v + 1, str(e)[:160], flush=True)
            time.sleep(10 * (v + 1))
    raise SystemExit("Bildmodell gibt nicht nach " + str(versuche) + " Versuchen")


def ausrichtung(k, tile):
    """Aehnlichkeitstransformation (Skalierung + Versatz), mit der die neue Kachel auf das
    Original passt. GPT-Image liefert die Kachel typischerweise um 3-13 % gezoomt zurueck;
    ohne Ausrichtung entstehen Geisterkanten am Maskenrand.

    ORB-Merkmale ausserhalb der Maske, RANSAC. Rueckgabe: (M 2x3 fuer cv2.warpAffine,
    Skalierung, Inlier-Anzahl) oder None, wenn nichts Belastbares gefunden wurde."""
    import cv2
    import numpy as np
    box = PERSONEN[k][0]
    quelle = Image.open(QUELLE).convert("L")
    f = tile_fenster(box, *quelle.size)
    g = f[2] - f[0]
    a = np.asarray(quelle.crop(f))
    b = np.asarray(tile.convert("L").resize((g, g)))
    _, m = maske_fuer(box, f, g)
    m = np.asarray(m)
    orb = cv2.ORB_create(4000)
    ka, da = orb.detectAndCompute(a, m)
    kb, db = orb.detectAndCompute(b, m)
    if da is None or db is None or len(ka) < 20 or len(kb) < 20:
        return None
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    ms = sorted(bf.match(da, db), key=lambda x: x.distance)[:600]
    if len(ms) < 20:
        return None
    pa = np.float32([ka[x.queryIdx].pt for x in ms])
    pb = np.float32([kb[x.trainIdx].pt for x in ms])
    M, inl = cv2.estimateAffinePartial2D(pb, pa, method=cv2.RANSAC, ransacReprojThreshold=3.0)
    if M is None:
        return None
    return M, float(np.hypot(M[0, 0], M[0, 1])), int(inl.sum())


def passt(erg):
    return erg is not None and erg[2] >= 120 and 0.97 <= erg[1] <= 1.06


def ausgerichtet(k, tile):
    """Kachel auf das Original entzerren; unveraendert, wenn keine Transformation gefunden."""
    import cv2
    import numpy as np
    erg = ausrichtung(k, tile)
    if not passt(erg):
        return tile, erg
    M = erg[0]
    if abs(erg[1] - 1) < 0.003 and abs(M[0, 2]) < 1 and abs(M[1, 2]) < 1:
        return tile, erg
    arr = np.asarray(tile.convert("RGB"))
    out = cv2.warpAffine(arr, M, (arr.shape[1], arr.shape[0]), flags=cv2.INTER_LANCZOS4,
                         borderMode=cv2.BORDER_REFLECT)
    return Image.fromarray(out), erg


def pruefen():
    for k in PERSONEN:
        tp = os.path.join(ZIEL, "tiles", k + ".png")
        if not os.path.exists(tp):
            print(k, "fehlt")
            continue
        erg = ausrichtung(k, Image.open(tp))
        if erg is None:
            print(f"{k:10s} keine Ausrichtung  <-- NEU")
        else:
            M, sc, n = erg
            print(f"{k:10s} skalierung={sc:.3f} dx={M[0, 2]:+.1f} dy={M[1, 2]:+.1f} inlier={n}", "" if passt(erg) else "  <-- NEU")


def overlay():
    im = Image.open(QUELLE).convert("RGB")
    d = ImageDraw.Draw(im)
    for k, (box, _) in PERSONEN.items():
        d.rectangle(box, outline=(255, 0, 0), width=6)
        d.text((box[0] + 8, box[1] + 8), k, fill=(255, 255, 0))
    p = os.path.join(ZIEL, "boxen_overlay.jpg")
    im.resize((3072, 2048)).save(p, quality=85)
    print("overlay:", p)


def kontaktbogen():
    orig = Image.open(QUELLE).convert("RGB")
    neu_p = os.path.join(ZIEL, "Strukturbild_retusche.jpg")
    neu = Image.open(neu_p).convert("RGB") if os.path.exists(neu_p) else orig
    keys = list(PERSONEN)
    kachel = 320
    spalten = 6
    zeilen = -(-len(keys) // spalten)
    bogen = Image.new("RGB", (spalten * kachel * 2 + (spalten - 1) * 20, zeilen * (kachel + 30)), (24, 24, 24))
    d = ImageDraw.Draw(bogen)
    for i, k in enumerate(keys):
        box = PERSONEN[k][0]
        x0, y0, x1, y1 = box
        cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
        h = max(x1 - x0, y1 - y0) + 80
        c = (cx - h // 2, cy - h // 2, cx + h // 2, cy + h // 2)
        a = orig.crop(c).resize((kachel, kachel))
        b = neu.crop(c).resize((kachel, kachel))
        px = (i % spalten) * (kachel * 2 + 20)
        py = (i // spalten) * (kachel + 30)
        bogen.paste(a, (px, py + 24)); bogen.paste(b, (px + kachel, py + 24))
        d.text((px + 4, py + 4), k + "  (vorher | nachher)", fill=(230, 230, 230))
    p = os.path.join(ZIEL, "kontaktbogen.jpg")
    bogen.save(p, quality=88)
    print("kontaktbogen:", p)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--overlay", action="store_true")
    ap.add_argument("--kontakt", action="store_true")
    ap.add_argument("--pruefen", action="store_true", help="Ausrichtung aller Tiles pruefen")
    ap.add_argument("--versuche", type=int, default=3, help="Neuversuche bei schlechter Ausrichtung")
    ap.add_argument("--nur", nargs="*")
    ap.add_argument("--neu", action="store_true", help="vorhandene Tiles ignorieren")
    ap.add_argument("--parallel", type=int, default=4, help="gleichzeitige Bildmodell-Aufrufe")
    a = ap.parse_args()
    if a.overlay:
        return overlay()
    if a.kontakt:
        return kontaktbogen()
    if a.pruefen:
        return pruefen()
    lade_key()
    from openai import OpenAI
    client = OpenAI()
    ziel_p = os.path.join(ZIEL, "Strukturbild_retusche.jpg")
    im = Image.open(QUELLE).convert("RGB")   # immer frisch vom Original montieren
    W, H = im.size
    keys = a.nur or list(PERSONEN)
    quelle = Image.open(QUELLE).convert("RGB")   # Tiles immer aus dem Original schneiden

    def tile_erzeugen(k):
        box, beschr = PERSONEN[k]
        tile_p = os.path.join(ZIEL, "tiles", k + ".png")
        if os.path.exists(tile_p) and not a.neu:
            return k, "vorhanden"
        fenster = tile_fenster(box, W, H)
        groesse = fenster[2] - fenster[0]
        ausschnitt = quelle.crop(fenster)
        maske, _ = maske_fuer(box, fenster, groesse)
        if groesse != TILE:
            ausschnitt = ausschnitt.resize((TILE, TILE), Image.LANCZOS)
            maske = maske.resize((TILE, TILE), Image.NEAREST)
        bester = None
        for versuch in range(max(1, a.versuche)):
            print(k, "→ Bildmodell", f"(Versuch {versuch + 1})", flush=True)
            neu = edit(client, ausschnitt, maske, PROMPT.format(beschreibung=beschr))
            if groesse != TILE:
                neu = neu.resize((groesse, groesse), Image.LANCZOS)
            erg = ausrichtung(k, neu)
            n = erg[2] if erg else 0
            print(f"{k} Ausrichtung: skalierung={erg[1]:.3f} inlier={n}" if erg else f"{k} keine Ausrichtung", flush=True)
            if bester is None or n > bester[0]:
                bester = (n, neu)
            if passt(erg):
                break
        neu = bester[1]
        neu.save(tile_p)   # roh speichern; entzerrt wird beim Einmontieren
        return k, f"neu (inlier={bester[0]})"

    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=max(1, a.parallel)) as ex:
        for k, status in ex.map(tile_erzeugen, keys):
            print(k, "tile", status, flush=True)

    # Montage immer mit allen vorhandenen Kacheln (auch wenn nur einzelne neu erzeugt wurden)
    for k in PERSONEN:
        box, beschr = PERSONEN[k]
        tile_p = os.path.join(ZIEL, "tiles", k + ".png")
        if not os.path.exists(tile_p):
            continue
        fenster = tile_fenster(box, W, H)
        groesse = fenster[2] - fenster[0]
        neu, erg = ausgerichtet(k, Image.open(tile_p).convert("RGB"))
        if not passt(erg):
            print(k, "WARNUNG: Kachel nicht ausrichtbar, wird roh montiert", flush=True)
        # Nur den maskierten Bereich zurueckmontieren, weiche Kante.
        _, m = maske_fuer(box, fenster, groesse)
        alpha = Image.eval(m, lambda v: 255 - v).filter(ImageFilter.GaussianBlur(WEICH))
        bereich = im.crop(fenster)
        im.paste(Image.composite(neu, bereich, alpha), fenster[:2])
        im.save(ziel_p, quality=95, subsampling=0)
    print("fertig:", ziel_p)
    kontaktbogen()


if __name__ == "__main__":
    main()
