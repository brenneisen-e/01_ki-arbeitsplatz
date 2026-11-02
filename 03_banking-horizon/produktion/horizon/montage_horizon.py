#!/usr/bin/env python3
"""Die beiden Banking-Horizon-Filme zusammensetzen.

Sechs Takes je Fassung, jeder zehn Sekunden — und weil jeder Take auf genau
dem Bild endet, auf dem der naechste anfaengt, wird hart geschnitten. Ein
Ueberblendung waere hier falsch: sie wuerde die Fuge sichtbar machen, die
sonst keine ist. Am Ende eine Endtafel, darunter die Tonspur aus
stimme_horizon.py.

    SCRATCH=… python3 montage_horizon.py        # beide
    SCRATCH=… python3 montage_horizon.py a
"""
import json
import os
import re
import subprocess
import sys

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
TON = f"{HIER}/ton"
ZIEL = f"{HIER}/filme"
os.makedirs(ZIEL, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
TAKES = f"{S}/horizon_takes"
BAU = f"{S}/horizon_bau"
os.makedirs(BAU, exist_ok=True)

FPS = 25
# Abspieltempo je Fassung. 0,9: das Bild laeuft auf 90 %, jedes Einzelbild
# bleibt genau einmal (Bildrate 22,5 statt 25, kein doppeltes Bild), die
# Stimme bleibt bei 1,0 und wird Zeile fuer Zeile auf den langsameren
# Schnitt neu verdrahtet (stimme_horizon.neu_verdrahten). Untertitel und
# Klangbett ziehen mit.
TEMPO = {"v": 0.9}


def tempo(fassung):
    return TEMPO.get(fassung, 1.0)


def bildrate(fassung):
    return FPS * tempo(fassung)
# Aufloesung je Fassung. Veo liefert die Szenen der Fassung V nativ in
# 3840x2160 — die wird nicht auf 1080p heruntergerechnet, sonst waere die
# 4K-Aufnahme umsonst gewesen.
MASS = {"v": (3840, 2160)}


def mass(fassung):
    return MASS.get(fassung, (1920, 1080))
# Eine Blende, wo sie noetig ist — sonst harter Schnitt.
#
# Der Take a2-a3 landet nicht auf seinem Zielbild: Kling schafft in zehn
# Sekunden die Vorwaertsfahrt UND die Drehung nach rechts nicht ganz, und
# bleibt ein Stueck davor stehen. Zweimal nachgedreht, zweimal dasselbe.
# Der Sprung ist keine andere Szene, sondern ein Massstabssprung im selben
# Bild — und genau das liest sich als Fehler, nicht als Schnitt. Eine halbe
# Sekunde Blende macht daraus einen Uebergang. Alle anderen Fugen bleiben
# hart, weil sie es nicht noetig haben (siehe abnahme_horizon.py).
# Index 5 ist in beiden Kurzfassungen der gewollte Szenenwechsel vom
# Vorstandsraum zurueck in die Halle — dort fehlt ein Zwischenbild.
# Fassung N blendet an JEDER Fuge. Die sechs Szenen sind sechs verschiedene
# Raeume, und fuenf Sekunden reichen Kling nicht, um von einem in den
# anderen zu fahren — drei Takes kamen nicht an ihrem Zielbild an. Das ist
# aber gar nicht noetig: zwischen verschiedenen Raeumen schneidet man. Eine
# halbe Sekunde Ueberblendung macht daraus einen Uebergang, der zu einem
# ruhigen Film besser passt als ein harter Schnitt, und sie kostet zusammen
# nur knapp drei Sekunden.
BLENDEN = {"a": {2: 0.5}, "k": {2: 0.4, 5: 0.6},
           "n": {1: 0.5, 2: 0.5, 3: 0.5, 4: 0.5, 5: 0.7},
           # Fassung V blendet ueberall: zehn verschiedene Orte, zwischen
           # denen es nichts zu fahren gibt. Kurze Blenden — der Auftraggeber
           # will schnelle Wechsel, und eine lange Blende frisst genau die
           # Sekunden, die den Film langsam wirken lassen.
           "v": {i: 0.25 for i in range(1, 10)}}   # Fassung -> {Index des Takes danach: Sekunden}
SCHNITT = 1.0 / FPS            # ein Bild: technisch eine Blende, sichtbar ein Schnitt
REIHE = {
    "a": ["a1-a2", "a2-a3", "a3-a4", "a4-a4c", "a4c-a5", "a5-a6", "a6-a7", "a7-a8"],
    "b": ["b1-b2", "b2-b3", "b3-b4", "b4-b5", "b5-b6", "b6-b7"],
    # Kurzfassung: fuenf 5-s-Takes auf die Hypothesen, dann der 10-s-Rueckzug.
    # Zwischen a4c-a5 und a6-a7 fehlt das Bild a6 — dort ist ein echter
    # Schnitt, den eine kurze Blende auffaengt (BLENDEN).
    # Kurzfassung ueber Veo (veo_horizon.py): 8 s Einstieg, vier Hypothesen
    # a 4 s, 8 s Rueckzug = 32 s Bild. Zwischen a4c-a5 und a6-a7 fehlt das
    # Bild a6 — dort ist ein echter Schnitt, den eine Blende auffaengt.
    # Die neue Fassung: neuer Bildsatz, Wege wieder ueber Kling.
    "n": ["a1-a2_10", "a2-a3_5", "a3-a4_5", "a4-a4c_5", "a4c-a5_5", "a6-a7_10"],
    # Fassung V: zehn eigenstaendige Szenen, keine Fahrt zwischen Raeumen.
    # Die Laengen stehen nicht im Namen, sondern in DAUERN — die Takes
    # heissen wie ihre Szene. Die vier k-Szenen tragen den Vorlauf des
    # endgueltigen Sprechtexts ("Kunden/Arbeit/Wettbewerb/Fuehrung
    # veraendert sich"); ohne sie liefen vier verschiedene Aussagen ueber
    # dasselbe Bild.
    # Fassung V, Stand 11.09.: die acht mittleren Einstellungen sind die
    # Hypothesen-Standbilder aus dem Banking-Horizon-Modell selbst. Sie
    # behaupten genau das, was der Sprecher sagt — Kapitel 2_2 heisst
    # woertlich "Vom Berater zum KI-augmentierten Sparringspartner". Anfang
    # und Ende bleiben gedrehte Szenen: die alte Filiale und der Mann am
    # Fenster tragen keinen Bildschirmtext und vertragen deshalb Veo.
    "v": ["s1", "h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "s7"],
    "k": ["a1-a2_v8", "a2-a3_v4", "a3-a4_v4", "a4-a4c_v4", "a4c-a5_v6", "a6-a7_v8"],
}


# Die Szenen der Fassung V tragen ihre Laenge nicht im Namen.
# Die Laengen sind nicht mehr die der Takes, sondern die, die der Film
# braucht: normieren() schneidet jeden Take auf seinen Wert hier zurueck.
#
# Der Auftraggeber hat den ersten Schnitt als zu langsam beanstandet — zu
# viele Pausen, zu traege Wechsel. Der Grund stand in dieser Tabelle: eine
# Zeile wie "Kunden veraendern sich" dauert 1,3 Sekunden und stand auf einer
# Szene von vier. Der Rest war Stille. Die vier Behauptungen bekommen jetzt
# 2,6 Sekunden — eine kurze Einstellung ist ganz normale Filmsprache, und
# der Block schnappt dadurch.
#
# Zwei Szenen bleiben lang, weil auf ihnen mehr als eine Zeile liegt: s1
# traegt den dreizeiligen Befund, k4 die vierte Behauptung UND die
# Scharnierfrage "Was heisst das fuer die Bank im Jahr 2030?" — die Frage
# traegt den Film und darf nicht ueber den Schnitt rutschen.
# Nach der Umstellung auf eleven_v3 sind die Zeilen etwas laenger: die
# Regie kostet Zeit, weil eine betonte Zeile nicht so schnell laeuft wie
# eine heruntergelesene. Die Einstellungen wachsen entsprechend mit.
DAUERN = {"s1": 8.0, "h1": 3.6, "h2": 3.0, "h3": 3.4, "h4": 8.0,
          "h5": 4.4, "h6": 3.2, "h7": 4.6, "h8": 4.0, "s7": 3.6, "s6": 3.6,
          # die abgeloesten gedrehten Szenen, falls sie gebraucht werden
          "k1": 2.6, "k2": 2.6, "k3": 2.6, "k4": 5.0,
          "s2": 4.0, "s3": 3.4, "s4": 4.0, "s5": 3.4}


# Welche Einstellung traegt welche Zeile. Aus dieser Zuordnung und den
# Satzgrenzen der Aufnahme faellt der Schnittplan ab — siehe zeitplan().
TRAEGT = {"s1": (0, 1, 2), "h1": (3,), "h2": (4,), "h3": (5,), "h4": (6, 7),
          "h5": (8,), "h6": (9,), "h7": (10,), "h8": (11,), "s7": (12,)}

# Handverschiebung einzelner Schnitte, in Sekunden.
#
# Die Regel "schneide in der Pause zwischen zwei Saetzen" ist fast immer
# richtig, aber sie kennt den Inhalt nicht. "Nicht nur die Technologie." ist
# die Bruecke vom Befund in den Wandel — der Satz gehoert zur Haelfte schon
# aufs neue Bild. Weil danach kaum eine Pause steht (0,16 s), landete der
# Schnitt fast am Satzende, und der Auftraggeber hat es gehoert: eine halbe
# Sekunde zu spaet. Also faellt der erste Schnitt mitten in den Satz.
VERSATZ = {"v": {0: -1.0}}     # Schnitt auf h1 eine Sekunde frueher als die Pausenmitte

# Zugabe je Einstellung, in Sekunden Filmzeit: die Einstellung bleibt nach
# ihrer letzten Zeile so viel laenger stehen, alles danach rueckt nach
# hinten — auch die Sprechzeilen (neu verdrahtet, Stimme bleibt 1,0).
# V: die vier Antworten auf "Was heisst das fuer die Bank im Jahr 2030?"
# (Beratung, Marktfolge, Security, Vorstand) je eine Sekunde laenger.
ZUGABE = {"v": {"h5": 1.0, "h6": 1.0, "h7": 1.0, "h8": 1.0}}


def satzgrenzen(fassung):
    """Wann jeder Satz der Aufnahme beginnt und endet — oder None."""
    marken = f"{TON}/{fassung}_ganz.json"
    if not os.path.exists(marken):
        return None
    import stimme_horizon as st
    lage = json.load(open(marken))
    anfang, ende = (lage["character_start_times_seconds"],
                    lage["character_end_times_seconds"])
    zeiten, stelle = [], 0
    for _s, t in st.V_TEXT:
        von = stelle + (t.index("]") + 2 if t.startswith("[") else 0)
        zeiten.append((st.VORLAUF + anfang[von],
                       st.VORLAUF + ende[stelle + len(t) - 1]))
        stelle += len(t) + 2
    # Filmzeit: bei Tempo < 1 rueckt der EINSATZ jeder Zeile auf t / tempo,
    # ihre Laenge bleibt (die Stimme wird nicht gedehnt).
    tp = tempo(fassung)
    zeiten = [(v / tp, v / tp + (b - v)) for v, b in zeiten]
    # Zugaben: jede Zeile rueckt um die Summe der Zugaben aller
    # Einstellungen VOR ihrer eigenen nach hinten.
    zugabe = ZUGABE.get(fassung, {})
    if zugabe:
        szene_von = {k: n for n in REIHE[fassung] for k in TRAEGT.get(n, ())}
        summe, bis_hier = 0.0, {}
        for n in REIHE[fassung]:
            bis_hier[n] = summe
            summe += zugabe.get(n, 0.0)
        zeiten = [(v + bis_hier[szene_von[k]], b + bis_hier[szene_von[k]])
                  for k, (v, b) in enumerate(zeiten)]
    return zeiten


def zeitplan(fassung):
    """Die Einstellungslaengen aus der Aufnahme ableiten.

    Bisher gab eine Tabelle die Laengen vor, und der Sprechtext musste sich
    hineinfuegen — bei jeder neuen Aufnahme von Hand nachgerechnet, dreimal
    hintereinander. Seit das Skript in einem Zug gesprochen wird, geht es
    andersherum und besser: die Aufnahme bestimmt, wo geschnitten wird.

    Der Schnitt liegt jeweils in der Pause zwischen der letzten Zeile einer
    Einstellung und der ersten der naechsten. Die Blende ist so gelegt, dass
    ihre MITTE auf diesen Punkt faellt; deshalb die halbe Blendenlaenge als
    Zugabe. Ist eine Einstellung laenger, als ihr Take hergibt, wird der
    Schnitt nach vorn geschoben, bis es passt — Veo liefert nur 4, 6 oder 8
    Sekunden, und einen Take kann man nicht strecken.
    """
    zeiten = satzgrenzen(fassung)
    if not zeiten:
        return None
    import stimme_horizon as st
    reihe = REIHE[fassung]
    d = BLENDEN.get(fassung, {}).get(1, SCHNITT)
    # Schnittpunkte: Mitte der Pause zwischen zwei Einstellungen.
    schnitte = []
    for i in range(len(reihe) - 1):
        letzte = TRAEGT[reihe[i]][-1]
        erste = TRAEGT[reihe[i + 1]][0]
        # Die Zugabe einer Einstellung gehoert ganz ihr: die Pausenmitte
        # wuerde sie sonst mit der naechsten Einstellung teilen.
        schnitte.append((zeiten[letzte][1] + zeiten[erste][0]) / 2.0
                        + VERSATZ.get(fassung, {}).get(i, 0.0)
                        + ZUGABE.get(fassung, {}).get(reihe[i], 0.0) / 2.0)
    schluss = zeiten[-1][1] + st.NACHLAUF

    laengen, vorher = {}, 0.0
    for i, name in enumerate(reihe):
        ziel = (schnitte[i] + d / 2.0) if i < len(schnitte) else schluss
        laenge = ziel - vorher + (d if i else 0.0)
        vorhanden = takelaenge(name) / tempo(fassung)     # in Filmzeit
        if vorhanden and laenge > vorhanden + 0.001:
            # Der Take gibt nicht mehr her: frueher schneiden.
            laenge = vorhanden
            ziel = vorher + laenge - (d if i else 0.0)
        laengen[name] = round(laenge, 3)
        vorher = ziel
    return laengen


# Wo ein Take erst spaeter beginnt. h1: Veo hat die Lupe mit dem Uhrenbild
# aus dem Standbild nur im ersten Bild uebernommen und binnen 0,7 s
# aufgeloest — ein sichtbares Verschwinden. Ab 0,8 s ist der Take sauber:
# der Mann schaut auf seine (kleine, echte) Uhr, die Familie fruehstueckt.
ANFANG = {"h1": 0.8}


def takelaenge(name):
    """Wie lang der vorhandene Take ist — 0, wenn es keinen gibt."""
    # veo_fest zuerst: dort liegen die Takes, in denen der Bildschirmtext
    # aus dem Standbild zurueckgeholt wurde (bildschirm_fest.py). Fehlt dort
    # einer, gilt der Take, wie Veo ihn geliefert hat.
    for ordner in (f"{S}/veo_fest", f"{S}/veo_szenen", f"{S}/veo_takes", TAKES):
        q = f"{ordner}/{name}.mp4"
        if os.path.exists(q):
            meldung = subprocess.run([FFMPEG, "-i", q], capture_output=True,
                                     text=True).stderr
            m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", meldung)
            if m:
                st_, mi, sk = m.groups()
                return (int(st_) * 3600 + int(mi) * 60 + float(sk)
                        - ANFANG.get(name, 0.0))
    return 0.0


def dauer(name):
    """Laenge eines Takes in Sekunden — aus DAUERN, sonst aus dem Namen."""
    if name in DAUERN:
        return DAUERN[name]
    m = re.search(r"_v?(\d+)$", name)
    return float(m.group(1)) if m else 10.0
TAFEL_TEXT = "Banking Horizon 2030"
# Wie lange die Tafel nach der Blende steht. In der Kurzfassung klingt
# die Schlussfrage auf ihr aus, deshalb eine Sekunde laenger.
TAFEL_HALT = {"a": 4.0, "b": 4.0, "k": 5.0, "n": 5.0, "v": 2.5}
GRUND = (10, 31, 26)          # tiefes Gruen, der Grundton der Reihe
TEAL = (58, 148, 130)


# ── Untertitel ──────────────────────────────────────────────────────────────
# Der Auftraggeber will das Gesprochene im Bild sehen, "in schoener Schrift,
# nicht zu gross und modern". Die Zeiten dafuer sind schon da: aus dem einen
# Take kennt die Zeichen-Zeitleiste jeden Satzanfang auf die Hundertstel.
#
# Gesetzt wird in der Hausschrift Uniform, weiss, ohne Kontur, mit einem
# weichen Schatten - auf den dunklen Dashboards traegt Weiss von selbst, auf
# der hellen Kuechenszene braucht es den Schatten. Die Groesse ist bewusst
# zurueckhaltend: 52 von 2160 Punkten Hoehe, also gut die Haelfte dessen, was
# im Fernsehen ueblich waere. Untertitel sollen mitlaufen, nicht auftrumpfen.
UNTERTITEL = {"v"}
UT_GROESSE = 52.0 / 2160.0     # Anteil der Bildhoehe
UT_RAND = 132.0 / 2160.0       # Abstand zur Unterkante
UT_BREITE = 0.62               # Anteil der Bildbreite, ab dem umbrochen wird


def ut_schleier(b_px, h_px):
    """Ein weicher Verlauf unter den Untertiteln.

    Weiss auf dunklem Dashboard traegt von selbst; auf der hellen Kueche und
    in der Filiale nicht, und ein Schatten rettet das nicht. Eine Kontur um
    die Buchstaben waere die naheliegende Loesung und sieht nach Karaoke
    aus. Stattdessen ein Verlauf von durchsichtig nach dunkel ueber das
    untere Viertel — man sieht ihn nicht, man liest nur besser. Er steht nur,
    solange ein Satz steht.
    """
    pfad = f"{BAU}/schleier_{b_px}x{h_px}.png"
    if not os.path.exists(pfad):
        hoehe = int(0.30 * h_px)
        streifen = Image.new("RGBA", (1, hoehe))
        for y in range(hoehe):
            anteil = (y / (hoehe - 1)) ** 1.6
            streifen.putpixel((0, y), (6, 10, 9, int(165 * anteil)))
        streifen.resize((b_px, hoehe), Image.BILINEAR).save(pfad)
    return pfad


def ut_zeit(t):
    """Sekunden in das Zeitformat von ASS."""
    st, rest = divmod(max(0.0, t), 3600)
    mi, sk = divmod(rest, 60)
    return f"{int(st)}:{int(mi):02d}:{sk:05.2f}"


def schriftname(ttf):
    """Wie die Schrift INTERN heisst — danach sucht libass, nicht nach der Datei.

    Die Hausschrift liegt als uniform-medium.woff2 im Repo, meldet sich aber
    als "Uniform 3". Wer "Uniform" in die ASS-Datei schreibt, bekommt
    kommentarlos eine Ersatzschrift und merkt es erst im fertigen Film.
    """
    try:
        from fontTools.ttLib import TTFont
        f = TTFont(ttf)
        for r in f["name"].names:
            if r.nameID == 1:
                return r.toUnicode()
    except Exception:      # noqa: BLE001
        pass
    return "DejaVu Sans"


def untertitel(fassung, zeiten, b_px, h_px):
    """Eine ASS-Datei aus den Satzgrenzen der Aufnahme."""
    import textwrap
    ziel = f"{BAU}/ut_{fassung}_{b_px}.ass"
    import stimme_horizon as st
    # Die Audio-Tags steuern die Stimme und gehoeren nicht ins Bild.
    texte = [re.sub(r"^\[[^\]]+\]\s*", "", t) for _s, t in st.V_TEXT]
    name = schriftname(f"{BAU}/uniform-medium.ttf")
    schrift_px = int(round(UT_GROESSE * h_px))
    rand = int(round(UT_RAND * h_px))
    # Grob: eine Zeile fasst etwa so viele Zeichen, wie die erlaubte Breite
    # durch die halbe Schrifthoehe ergibt.
    spalte = max(24, int(UT_BREITE * b_px / (schrift_px * 0.48)))
    kopf = (
        "[Script Info]\nScriptType: v4.00+\nWrapStyle: 0\n"
        f"PlayResX: {b_px}\nPlayResY: {h_px}\nScaledBorderAndShadow: yes\n\n"
        "[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, "
        "OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, "
        "Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, "
        "MarginV, Encoding\n"
        f"Style: Haus,{name},{schrift_px},&H00F2F6F4,&H00F2F6F4,&HA0000000,&HB4000000,"
        f"0,0,0,0,100,100,1.2,0,1,0,3,2,60,60,{rand},1\n\n"
        "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, "
        "MarginV, Effect, Text\n")
    # Nachlauf, damit der Satz nicht mit dem letzten Laut verschwindet — aber
    # nie ueber den Anfang des naechsten hinaus, sonst stehen zwei Zeilen
    # uebereinander.
    zeilen = []
    for i, ((von, bis), text) in enumerate(zip(zeiten, texte)):
        aus = bis + 0.35
        if i + 1 < len(zeiten):
            aus = min(aus, zeiten[i + 1][0] - 0.08)
        aus = max(aus, von + 0.4)
        gebrochen = "\\N".join(textwrap.wrap(text, spalte)) or text
        zeilen.append(f"Dialogue: 0,{ut_zeit(von)},{ut_zeit(aus)},Haus,,0,0,0,,"
                      f"{{\\fad(180,220)}}{gebrochen}")
    open(ziel, "w").write(kopf + "\n".join(zeilen) + "\n")
    return ziel


def lauf(*args):
    subprocess.run([FFMPEG, "-v", "error", "-y", *args], check=True)


def schrift(groesse):
    """Die Hausschrift fuer die Endtafel.

    Im Repo liegt sie als woff2 (fuers Web); PIL kann damit nichts anfangen.
    Sie wird deshalb einmal nach $SCRATCH umgewandelt — nicht ins Repo, dort
    liegt sie ja schon. Fehlt das Werkzeug dafuer, faellt die Tafel auf eine
    Schrift zurueck, die ueberall vorhanden ist.
    """
    ttf = f"{BAU}/uniform-medium.ttf"
    if not os.path.exists(ttf):
        haus = os.path.abspath(f"{HIER}/../../public/fonts/uniform-medium.woff2")
        try:
            from fontTools.ttLib import TTFont
            f = TTFont(haus)
            f.flavor = None
            f.save(ttf)
        except Exception as e:      # noqa: BLE001
            print("Hausschrift nicht verfuegbar:", str(e)[:120], flush=True)
    for p in (ttf, "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, groesse)
    return ImageFont.load_default()


def tafel(pfad, b_px=1920, h_px=1080):
    k = b_px / 1920.0
    b = Image.new("RGB", (b_px, h_px), GRUND)
    d = ImageDraw.Draw(b)
    f = schrift(int(78 * k))
    kasten = d.textbbox((0, 0), TAFEL_TEXT, font=f)
    x = (b_px - (kasten[2] - kasten[0])) // 2 - kasten[0]
    y = (h_px - (kasten[3] - kasten[1])) // 2 - kasten[1]
    d.text((x, y), TAFEL_TEXT, font=f, fill=(240, 246, 243))
    # Feiner Strich darueber, damit der Titel steht und nicht schwebt.
    d.rectangle((b_px // 2 - int(90 * k), y - int(54 * k),
                 b_px // 2 + int(90 * k), y - int(52 * k)), fill=TEAL)
    b.save(pfad)


# Die Hypothesen-Standbilder aus dem Banking-Horizon-Modell.
#
# Sie sind Vorher/Nachher-Bilder: links 2026, rechts 2030, getrennt von einer
# festen Naht. Eine Veo-Probe hat gezeigt, dass das Modell die Naht zwar
# stehen laesst und beide Haelften sauber belebt — aber jeden Text neu
# zeichnet. Aus "Szenario vergleichen" wurde "Szenarin vergleichen", aus
# "Beratungsprotokoll" Buchstabenbrei. Genau davon leben diese Bilder: die
# lesbare Oberflaeche IST ihr Argument. Also keine Videogenerierung, sondern
# eine gerechnete Fahrt.
#
# Die Fahrt ist nicht beliebig: sie beginnt auf dem ganzen Bild und zieht
# langsam nach rechts in die 2030-Haelfte. Die Kamera faehrt also von heute
# nach 2030 — das Argument des Bildes als Bewegung.
HYPOTHESEN = f"{HIER}/hypothesen"
ZOOM_ENDE = 1.10          # wie nah es am Ende herangeht
RECHTS = 0.50             # wie weit nach rechts (0.5 = Mitte, 1.0 = Rand)
# Die Fahrt zog urspruenglich kraeftig nach rechts: damals waren die
# Hypothesen-Bilder noch Vorher/Nachher-Splits, und die Kamera fuhr von 2026
# nach 2030. Seit die Bilder ganz aus der 2030-Haelfte bestehen, gibt es
# nichts mehr, wohin man fahren muesste — es bleibt ein ruhiges, mittiges
# Heranfahren.


def standbild(name, laenge, b_px, h_px, fps=FPS):
    """Aus einem Standbild eine Fahrt rechnen — ohne Videomodell."""
    quelle = f"{HYPOTHESEN}/{name}.png"
    ziel = f"{BAU}/h{b_px}_{name}_{laenge:g}{f'_f{fps:g}' if fps != FPS else ''}.mp4"
    if os.path.exists(ziel):
        return ziel
    bilder = max(2, int(round(laenge * fps)))
    # Doppelt so gross vorskalieren: zoompan rechnet x und y ganzzahlig, und
    # auf der groesseren Flaeche liegt ein Pixel unter der Sichtbarkeit —
    # sonst zittert die Fahrt.
    gross = b_px * 2
    schritt = (ZOOM_ENDE - 1.0) / (bilder - 1)
    x = f"(iw-iw/zoom)*(0.5+{RECHTS - 0.5:.3f}*on/{bilder - 1})"
    lauf("-loop", "1", "-i", quelle, "-t", f"{laenge:.3f}",
         "-vf", f"scale={gross}:-1:flags=lanczos,"
                f"zoompan=z='min(zoom+{schritt:.6f},{ZOOM_ENDE})':"
                f"x='{x}':y='ih/2-(ih/zoom/2)':d={bilder}:s={b_px}x{h_px}:fps={fps:g},"
                f"format=yuv420p",
         "-frames:v", str(bilder),
         "-c:v", "libx264", "-preset", "slow", "-crf", "16", ziel)
    return ziel


def normieren(name, b_px=1920, h_px=1080, tp=1.0):
    """Jeden Take auf dasselbe Format bringen — sonst stolpert der Schnitt."""
    # Drei Ordner, je nach Anbieter und Fassung. Der erste, der die Datei
    # hat, gewinnt — so liegen Kling- und Veo-Material nebeneinander, ohne
    # sich zu ueberschreiben.
    # Vorrang hat ein gedrehter Take. Nur wenn es keinen gibt, wird aus dem
    # Standbild eine Fahrt gerechnet — so laesst sich zwischen beiden
    # Fassungen umschalten, indem man den Take loescht oder wegnimmt.
    # (Erst andersherum gebaut, und die Montage nahm die Standbilder,
    # obwohl die Takes schon dalagen.)
    if (os.path.exists(f"{HYPOTHESEN}/{name}.png")
            and not os.path.exists(f"{S}/veo_szenen/{name}.mp4")):
        return standbild(name, dauer(name), b_px, h_px, fps=FPS * tp)
    # veo_fest zuerst: dort liegen die Takes, in denen der Bildschirmtext
    # aus dem Standbild zurueckgeholt wurde (bildschirm_fest.py). Fehlt dort
    # einer, gilt der Take, wie Veo ihn geliefert hat.
    for ordner in (f"{S}/veo_fest", f"{S}/veo_szenen", f"{S}/veo_takes", TAKES):
        quelle = f"{ordner}/{name}.mp4"
        if os.path.exists(quelle):
            break
    if not os.path.exists(quelle):
        raise SystemExit(f"Take fehlt: {quelle}")
    # Auf die geplante Laenge zurueckschneiden. Die Takes kommen in 4, 6
    # oder 8 Sekunden — mehr gibt Veo nicht her —, der Film braucht aber
    # auch 2,6 oder 3,4. Geschnitten wird vorn: der Anfang eines Takes ist
    # der lebendigste Teil, das Ende laeuft aus.
    laenge = dauer(name)
    anfang = ANFANG.get(name, 0.0)
    ziel = (f"{BAU}/n{b_px}_{name}_{laenge:g}{f'_ab{anfang:g}' if anfang else ''}"
            f"{f'_t{tp:g}' if tp != 1.0 else ''}.mp4")
    if not os.path.exists(ziel):
        # Tempo < 1: Zeitstempel strecken und die Bildrate im selben Mass
        # senken — so bleibt jedes Einzelbild genau einmal, nichts wird
        # verdoppelt, nichts ruckelt.
        zeit = f"setpts=PTS/{tp:g}," if tp != 1.0 else ""
        lauf("-ss", f"{anfang:.3f}", "-i", quelle, "-t", f"{laenge:.3f}",
             "-vf", f"{zeit}scale={b_px}:{h_px}:force_original_aspect_ratio=increase,"
                    f"crop={b_px}:{h_px},fps={FPS * tp:g},format=yuv420p",
             "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "16", ziel)
    return ziel


def bauen(fassung):
    b_px, h_px = mass(fassung)
    plan = zeitplan(fassung)
    if plan:
        DAUERN.update(plan)
        print("  Schnittplan aus der Aufnahme:", flush=True)
        t = 0.0
        for i, n in enumerate(REIHE[fassung]):
            if i:
                t -= BLENDEN.get(fassung, {}).get(i, SCHNITT)
            print(f"    {n:<3} {t:6.2f} – {t + DAUERN[n]:6.2f}", flush=True)
            t += DAUERN[n]
    tp = tempo(fassung)
    teile = [normieren(n, b_px, h_px, tp) for n in REIHE[fassung]]
    blenden = BLENDEN.get(fassung, {})

    # Die Takes aneinanderhaengen. Jede Fuge ist eine Blende — die harten
    # Schnitte bekommen ein einziges Bild, das sieht niemand als Blende.
    namen = REIHE[fassung]
    ketten, marke, gesamt = [], "[0:v]", dauer(namen[0])
    for i in range(1, len(teile)):
        d = blenden.get(i, SCHNITT)
        raus = f"[k{i}]"
        ketten.append(f"{marke}[{i}:v]xfade=transition=fade:duration={d}:"
                      f"offset={gesamt - d:.3f}{raus}")
        gesamt += dauer(namen[i]) - d
        marke = raus

    eingang = []          # zusaetzliche Eingaenge hinter Takes, Tafel und Ton
    karte_png = f"{BAU}/tafel{b_px}.png"
    if not os.path.exists(karte_png):
        tafel(karte_png, b_px, h_px)
    fps = bildrate(fassung)
    karte = f"{BAU}/tafel7_{b_px}{f'_f{fps:g}' if fps != FPS else ''}.mp4"
    if not os.path.exists(karte):
        lauf("-loop", "1", "-i", karte_png, "-t", "7",
             "-vf", f"fps={fps:g},format=yuv420p", "-c:v", "libx264",
             "-preset", "slow", "-crf", "18", karte)

    zeiten = satzgrenzen(fassung) if fassung in UNTERTITEL else None
    spur = f"{TON}/horizon_{fassung}{f'_t{tp:g}' if tp != 1.0 else ''}.wav"
    if tp != 1.0 or ZUGABE.get(fassung):
        # Die neu verdrahtete Spur aus der vorhandenen Aufnahme rechnen —
        # jedes Mal, denn sie haengt am Schnittplan (Tempo, Zugaben);
        # keine neue Aufnahme, die Stimme bleibt dieselbe.
        import stimme_horizon as st
        spur = st.spur(fassung, tp, einsaetze=[v for v, _b in zeiten])
    elif not os.path.exists(spur):
        raise SystemExit(f"Tonspur fehlt: {spur} — erst stimme_horizon.py laufen lassen")

    # Eine Sekunde Blende in die Endtafel, danach vier Sekunden Tafel.
    halt = TAFEL_HALT.get(fassung, 4.0)
    ende = gesamt + halt
    ketten.append(f"{marke}fade=t=in:st=0:d=1.2[vf]")
    ketten.append(f"[vf][{len(teile)}:v]xfade=transition=fade:duration=1:"
                  f"offset={gesamt - 1.0:.3f}[vx]")
    ketten.append(f"[vx]fade=t=out:st={ende - 0.9:.3f}:d=0.9[vy]")
    if zeiten:
        schrift(40)      # legt die Hausschrift als TTF in BAU ab
        datei = untertitel(fassung, zeiten, b_px, h_px)
        # In der Filterkette sind Doppelpunkt und Backslash Trennzeichen.
        pfad = datei.replace("\\", "/").replace(":", "\\:")
        wann = "+".join(f"between(t,{v:.2f},{b + 0.45:.2f})" for v, b in zeiten)
        eingang.append(ut_schleier(b_px, h_px))
        schleier_nr = len(teile) + 2
        ketten.append(f"[{schleier_nr}:v]format=rgba[sch]")
        ketten.append(f"[vy][sch]overlay=x=0:y=H-h:enable='{wann}'[vs]")
        ketten.append(f"[vs]subtitles='{pfad}':fontsdir='{BAU}'[v]")
    else:
        ketten.append("[vy]null[v]")
    ketten.append(f"[{len(teile) + 1}:a]afade=t=in:st=0:d=0.6,"
                  f"afade=t=out:st={ende - 1.0:.3f}:d=1.0[a]")

    ziel = f"{ZIEL}/banking_horizon_{fassung}.mp4"
    dateien = teile + [karte, spur] + eingang
    befehl = []
    for t in dateien:
        befehl += ["-i", t]
    lauf(*befehl, "-filter_complex", ";".join(ketten),
         "-map", "[v]", "-map", "[a]", "-t", f"{ende:.3f}",
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", ziel)
    print(f"fertig: {ziel}  {ende:.2f} s  {os.path.getsize(ziel) // 1024} KB", flush=True)
    return ziel


if __name__ == "__main__":
    for f in (sys.argv[1:] or ["v"]):
        bauen(f)
    print("MONTAGE HORIZON FERTIG", flush=True)
