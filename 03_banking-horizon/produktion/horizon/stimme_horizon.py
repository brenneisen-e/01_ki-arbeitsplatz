#!/usr/bin/env python3
"""Voice-over und Klangbett der beiden Banking-Horizon-Filme.

Die Vorlage gibt zu jeder Fassung einen Sprechertext vor — deutsch fuer die
Vorstandsfassung, englisch fuer den internationalen Trailer. Jede Zeile wird
EINZELN gesprochen und danach auf eine feste Sekunde gelegt. Das ist der
Grund fuer den Aufwand: so faellt "Kunden veraendern sich" auf die
Kundenszene und "Fuehrung veraendert sich" auf den Vorstandsraum, statt dass
ein durchgesprochener Block irgendwo im Film landet.

Unter der Stimme liegt ein sehr leises, selbst gerechnetes Klangbett — ein
tiefer, ruhiger Akkord. Fassung B bekommt zusaetzlich einen Puls, der
schneller wird und an der Stelle abbricht, an der im Bild alles anhaelt.
Das Bett steht rund 20 dB unter der Stimme; es traegt, es spielt nicht.

    SCRATCH=… python3 stimme_horizon.py       # beide Tonspuren
    SCRATCH=… python3 stimme_horizon.py a
"""
import base64
import json
import os
import subprocess
import sys
import urllib.request
import wave

import numpy as np
from openai import OpenAI

import imageio_ffmpeg

HIER = os.path.dirname(os.path.abspath(__file__))
TON = f"{HIER}/ton"
os.makedirs(TON, exist_ok=True)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
RATE = 48000

S = os.environ.get("SCRATCH")
if not S:
    raise SystemExit("SCRATCH muss auf das Arbeitsverzeichnis zeigen")
os.environ.setdefault(
    "OPENAI_API_KEY", open(f"{S}/.openai_env").read().strip().split("=", 1)[1])
client = OpenAI()

# Laenge je Fassung: 60 bzw. 80 s Film + 4 s Abspann.
LAENGE = {"a": 84.0, "b": 64.0, "k": 37.88, "n": 42.3, "v": 46.05}

# (Sekunde, Text) — die Sekunde ist der EINSATZ, nicht die Mitte.
# Fassung A traegt seit dem 10.09. die vier Hypothesen als Ueberschriften,
# je eine auf ihrer Szene: Berater (Beratungszone), Marktfolge (Betriebs-
# raum), Compliance (Glasflur), Vorstaende (Vorstandsraum). Hypothese 1 ist
# in der Vorlage gestrichen; bei 2 stand "Vereinfachen", daher ohne
# "strategischen".
A_TEXT = [
    (1.5,  "Seit Jahrzehnten basiert Banking auf Stabilität."),
    (5.8,  "Doch etwas verändert sich."),
    (8.9,  "Nicht nur die Technologie."),
    (11.8, "Kunden verändern sich."),
    (14.7, "Arbeit verändert sich."),
    (17.6, "Wettbewerb verändert sich."),
    (21.4, "Führung verändert sich."),
    (24.7, "Der Berater wird zum Sparringspartner."),
    (31.4, "Die Marktfolge arbeitet autonom."),
    (41.4, "Compliance wird Teil des Systems."),
    (51.4, "Vorstände steuern in Echtzeit."),
    (61.0, "Die eigentliche Herausforderung ist nicht KI."),
    (65.6, "Die eigentliche Herausforderung ist, Entscheidungen für eine Zukunft "
           "zu treffen, die noch nicht existiert."),
    (75.0, "Können wir sie uns überhaupt vorstellen?"),
]

# Kurzfassung K (35 s Bild + Tafel): Einstieg, die vier Hypothesen, Schluss.
# Gestrichen gegenueber A: "Nicht nur die Technologie." und die vier
# "... veraendert sich."-Zeilen — 30 Sekunden tragen nicht mehr Text.
# Fassung N, ueberarbeitet nach zwei Drehbuch-Agenten:
#   * "Doch etwas veraendert sich" ist raus. "Etwas" benennt nichts, und
#     ausgerechnet an der Wendung bekam der Hoerer keine Information. Jetzt
#     kuendigen die "Rollen" an, dass gleich vier Rollen kommen — die vier
#     Hypothesen fallen damit nicht mehr vom Himmel.
#   * "Die Herausforderung ist nicht KI" ist gestrichen: der Satz nimmt kurz
#     vor Schluss genau die Spannung zurueck, die der Film aufgebaut hat, und
#     ist als Nicht-X-sondern-Y-Konstruktion Beratersprech.
#   * "Entscheidungen" ist zurueck. Es ging nie um die Zukunft an sich,
#     sondern darum, HEUTE fuer sie zu entscheiden.
#   * "entscheiden" statt "steuern" bei den Vorstaenden — "steuern" klingt
#     nach Cockpit-Broschuere und bereitet den Schluss nicht vor.
#   * Neu: "Was entscheidet, wird angreifbar." Sicherheit fehlte bisher ganz,
#     obwohl der Auftraggeber sie an den Rand geschrieben hat. Der Satz liegt
#     auf dem leeren Haus, wo er am meisten weh tut.
# Fassung V traegt seit dem 11.09. den endgueltigen Sprechtext des
# Auftraggebers, Wort fuer Wort. Er ist laenger als alles davor: dreizehn
# Zeilen, 30,6 Sekunden reine Sprechzeit. Drei Bloecke:
#   1. der Befund   (Stabilitaet — doch etwas veraendert sich — nicht nur
#      die Technologie)
#   2. der Wandel   (Kunden / Arbeit / Wettbewerb / Fuehrung) und die
#      Scharnierfrage, was das fuer die Bank im Jahr 2030 heisst
#   3. die vier Hypothesen und der Titel
# Jede Zeile liegt auf ihrer eigenen Szene; nur "Nicht nur die Technologie"
# laeuft absichtlich ueber den Schnitt von s1 nach k1 — sie IST die Bruecke
# vom Befund in den Wandel. Die Scharnierfrage bleibt ganz auf k4, deshalb
# ist k4 acht statt vier Sekunden lang.
# Drittes Drehbuch, 11.09. Zwei Rueckmeldungen des Auftraggebers, beide
# treffend: der alte Einstieg war besser, und die vier Hypothesen sollen
# bleiben wie sie waren — nur das viermalige "X veraendert sich" war zu
# plump. Es sagte, DASS sich etwas aendert, aber nicht WAS. Jetzt benennt
# jede der vier Zeilen ihre Aenderung, und jede trifft ihr Bild: der
# Fruehstueckstisch mit der Smartwatch, die Ermessensentscheidung statt
# Sachbearbeitung, das Oekosystem aus RegTech und Payments, das Organigramm,
# das zum Netzwerk wird.
#
# Die Sekundenangaben stehen hier nur noch als Erinnerung an die Reihenfolge:
# gesprochen wird in EINEM Zug (siehe ELEVEN_GANZ), die tatsaechlichen Zeiten
# kommen aus der Zeichen-Zeitleiste von ElevenLabs.
V_TEXT = [
    (0.0, "Seit Jahrzehnten basiert Banking auf Stabilität."),
    (0.0, "Doch etwas verändert sich."),
    (0.0, "[serious] Nicht nur die Technologie."),
    (0.0, "Die Kundschaft entscheidet am Frühstückstisch."),
    (0.0, "Arbeit heißt entscheiden, nicht bearbeiten."),
    (0.0, "Der Wettbewerb kommt längst von außerhalb."),
    (0.0, "Und Führung ordnet nicht mehr — sie orchestriert."),
    (0.0, "[curious] Was heißt das für die Bank im Jahr 2030?"),
    (0.0, "Aus Beratung wird strategisches Sparring."),
    (0.0, "Die Marktfolge arbeitet autonom."),
    (0.0, "Security ist integraler Bestandteil des Systems."),
    (0.0, "Und der Vorstand steuert in Echtzeit."),
    (0.0, "[excited] Das ist Banking Horizon."),
]

N_TEXT = [
    (0.8,  "Seit Jahrzehnten basiert Banking auf Stabilität."),
    (5.6,  "Doch die Rollen verschieben sich."),
    (11.0, "Der Berater wird zum Sparringspartner."),
    (15.8, "Die Marktfolge arbeitet autonom."),
    (20.3, "Compliance wird Teil des Systems."),
    (24.9, "Vorstände entscheiden in Echtzeit."),
    (29.0, "Was entscheidet, wird angreifbar."),
    (33.4, "Entscheidungen für eine Zukunft ohne Vorbild."),
    (38.2, "Können wir sie uns überhaupt vorstellen?"),
]

K_TEXT = [
    (0.8,  "Seit Jahrzehnten basiert Banking auf Stabilität."),
    (5.6,  "Doch etwas verändert sich."),
    (9.3,  "Der Berater wird zum Sparringspartner."),
    (13.0, "Die Marktfolge arbeitet autonom."),
    (16.6, "Compliance wird Teil des Systems."),
    (21.8, "Vorstände steuern in Echtzeit."),
    # Die Vorlage hat hier drei Saetze, gesprochen neun Sekunden lang. In
    # der Kurzfassung sind es zwei kurze: die Aussage und die Frage. Die
    # Frage klingt auf der Endtafel aus.
    (25.2, "Die Herausforderung ist nicht KI."),
    (28.6, "Sondern eine Zukunft, die es noch nicht gibt."),
    (33.1, "Können wir sie uns überhaupt vorstellen?"),
]

B_TEXT = [
    (2.0,  "Something is changing."),
    (5.2,  "Not gradually."),
    (7.6,  "Exponentially."),
    (12.8, "Customers change."),
    (21.2, "Work changes."),
    (25.4, "Competition changes."),
    (31.4, "Leadership changes."),
    (40.8, "The challenge is not AI."),
    (44.8, "The challenge is making decisions for a future that does not yet exist."),
    (54.2, "Can we even imagine it?"),
]

# Ruhige, tiefe Stimmen. Kein Werbeton — die Vorlage will ernsthaft und
# vorstandstauglich, nicht Trailer-Sprecher aus dem Kino.
STIMME = {
    "a": ("onyx",
          "Speak German. Calm, low, measured and serious, like a board-level narrator. "
          "Unhurried pace, clear consonants, no advertising energy, no smiling tone. "
          "Leave weight on the final word of each sentence."),
    "v": ("onyx",
          "Speak German. Calm, low, measured and serious, like a board-level narrator. "
          "Unhurried, clear consonants, no advertising energy. Leave weight on the final "
          "word of each sentence."),
    "n": ("onyx",
          "Speak German. Calm, low, measured and serious, like a board-level narrator. "
          "Unhurried, clear consonants, no advertising energy. Leave weight on the final "
          "word of each sentence."),
    "k": ("onyx",
          "Speak German. Calm, low, measured and serious, like a board-level narrator. "
          "Slightly brisker than leisurely, clear consonants, no advertising energy. "
          "Leave weight on the final word of each sentence."),
    "b": ("ash",
          "Speak English. Low, controlled and cinematic, with quiet intensity building "
          "through the line. No shouting, no trailer-voice cliche, no smiling tone. "
          "Precise and deliberate."),
}


# ElevenLabs statt OpenAI, wo es eine gibt. Die OpenAI-Stimme spricht
# Deutsch mit hoerbar englischem Zungenschlag — "Stabilität" und "Vorstände"
# verraten sie sofort, und genau die Woerter tragen den Film. ElevenLabs
# spricht muttersprachlich; ab Starter-Tarif ist das auch lizenziert.
#
# Sieben deutsche Erzaehlstimmen wurden am selben Probesatz gemessen —
# Tonhoehe, Sprechtempo, Streuung der Tonhoehe. Die Messung sprach fuer
# Vitali (104 Hz, 5,3 s, 17 Hz Streuung); der Auftraggeber hat nach dem
# Hoeren Daniel Dark gewaehlt, und das Ohr entscheidet. Daniel ist mit
# 80 Hz die tiefste der sieben und mit 6,8 s fuer den Probesatz rund ein
# Viertel langsamer als Vitali — die Zeilen passen trotzdem in ihre
# Fenster, weil sie kurz sind; `spur()` warnt, sobald eine ueberlaeuft.
#
#     STIMMEN_QUELLE=openai python3 stimme_horizon.py v   # zurueck zu OpenAI
ELEVEN = {
    "v": ("5hobNnfFWAwxjwZSecAE", "Daniel Dark - Crime Narrator"),
}
# Ruhig und fest: hohe Stabilitaet, kein Stil-Aufschlag (der macht die Stimme
# dramatisch), etwas unter Normaltempo.
# Tempo 1.08 statt 0.92: der Auftraggeber hat den ersten Schnitt als zu
# langsam beanstandet. Schneller gesprochen sind es 25,6 s statt 30,6 s —
# fuenf Sekunden, ohne ein Wort zu streichen. Weiter hoch als 1.08 wuerde
# hetzen; Daniel Dark ist eine tiefe, ruhige Stimme, und die vertraegt
# Tempo, aber keine Eile.
ELEVEN_REGLER = {"stability": 0.0, "similarity_boost": 0.75,
                 "use_speaker_boost": True}
# eleven_v3 statt eleven_multilingual_v2. Der Auftraggeber hat den Vortrag
# als abgelesen beanstandet, und das war er auch: v2 kennt keine Regie. v3
# nimmt Audio-Tags in eckigen Klammern ([serious], [curious], [excited]) und
# liest Punktuation und Grossschreibung als Tempo. Der Stabilitaetsregler
# kennt in v3 nur drei Stufen — 0.0 Creative (ausdrucksstark), 0.5 Natural,
# 1.0 Robust (stabil, aber taub fuer Regie). Hier steht Creative: der Film
# soll mitreissen, nicht vorlesen.
#
# Die Tags werden nicht mitgesprochen; sie steuern nur die Faerbung.
ELEVEN_MODELL = "eleven_v3"


# Fassungen, die in EINEM Zug gesprochen werden.
#
# Der Auftraggeber hat gehoert, was ich uebersehen habe: "es ist irgendwie
# jedes Mal eine leicht andere Stimme". Stimmt — jede Zeile war ein eigener
# Aufruf, und bei Stability "Creative" wuerfelt das Modell die Faerbung bei
# jedem Aufruf neu. Dreizehn Aufrufe sind dreizehn leicht verschiedene
# Sprecher, und kein Schnitt kann das wieder zusammenfuegen.
#
# Jetzt wird das ganze Skript in einem Zug gesprochen. Damit die Bilder
# trotzdem auf ihren Saetzen sitzen, liefert die Schnittstelle
# `with-timestamps` die Zeitmarke JEDES ZEICHENS; daraus faellt ab, wann
# welcher Satz beginnt und endet. Die Aufnahme selbst bleibt unangetastet —
# ein Sprecher, ein Spannungsbogen, kein Stueckwerk.
ELEVEN_GANZ = {"v"}
VORLAUF = 0.3          # Stille vor dem ersten Wort
NACHLAUF = 1.2         # Luft nach dem letzten, bevor die Tafel steht


def eleven_schluessel():
    return open(f"{S}/.eleven_env").read().strip().split("=", 1)[1]


def sprechen_eleven(fassung, nummer, text):
    """Eine Zeile bei ElevenLabs sprechen lassen; liefert den Dateipfad."""
    roh = f"{TON}/{fassung}{nummer:02d}_el.mp3"
    if os.path.exists(roh):
        return roh
    stimme, _name = ELEVEN[fassung]
    koerper = json.dumps({"text": text, "model_id": ELEVEN_MODELL,
                          "voice_settings": ELEVEN_REGLER}).encode()
    bitte = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{stimme}"
        "?output_format=mp3_44100_128",
        data=koerper,
        headers={"xi-api-key": eleven_schluessel(),
                 "content-type": "application/json"})
    with urllib.request.urlopen(bitte, timeout=180) as antwort:
        daten = antwort.read()
    open(roh, "wb").write(daten)
    return roh


def ganz_sprechen(fassung, zeilen):
    """Das ganze Skript in einem Aufruf; liefert Pfad und Satzgrenzen."""
    mp3 = f"{TON}/{fassung}_ganz.mp3"
    marken = f"{TON}/{fassung}_ganz.json"
    text = "\n\n".join(t for _s, t in zeilen)
    if not (os.path.exists(mp3) and os.path.exists(marken)):
        stimme, _name = ELEVEN[fassung]
        koerper = json.dumps({"text": text, "model_id": ELEVEN_MODELL,
                              "voice_settings": ELEVEN_REGLER}).encode()
        bitte = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{stimme}/with-timestamps"
            "?output_format=mp3_44100_128",
            data=koerper,
            headers={"xi-api-key": eleven_schluessel(),
                     "content-type": "application/json"})
        with urllib.request.urlopen(bitte, timeout=300) as antwort:
            daten = json.loads(antwort.read())
        open(mp3, "wb").write(base64.b64decode(daten["audio_base64"]))
        json.dump(daten["alignment"], open(marken, "w"))
    lage = json.load(open(marken))
    anfang = lage["character_start_times_seconds"]
    ende = lage["character_end_times_seconds"]

    # Satzgrenzen aus der Zeichen-Zeitleiste. Der Audio-Tag am Zeilenanfang
    # wird nicht gesprochen, zaehlt aber als Zeichen — also beginnt der Satz
    # erst hinter der schliessenden Klammer.
    zeiten, stelle = [], 0
    for _s, t in zeilen:
        von = stelle + (t.index("]") + 2 if t.startswith("[") else 0)
        bis = stelle + len(t) - 1
        zeiten.append((anfang[von], ende[bis]))
        stelle += len(t) + 2      # die beiden Zeilenumbrueche dazwischen
    return mp3, zeiten


def sprechen(fassung, nummer, text):
    """Eine Zeile sprechen lassen und als 48-kHz-Mono zurueckgeben."""
    if fassung in ELEVEN and os.environ.get("STIMMEN_QUELLE") != "openai":
        roh = sprechen_eleven(fassung, nummer, text)
    else:
        roh = f"{TON}/{fassung}{nummer:02d}.wav"
        if not os.path.exists(roh):
            stimme, anweisung = STIMME[fassung]
            with client.audio.speech.with_streaming_response.create(
                    model="gpt-4o-mini-tts", voice=stimme, input=text,
                    instructions=anweisung, response_format="wav") as antwort:
                antwort.stream_to_file(roh)
    aus = subprocess.run(
        [FFMPEG, "-v", "error", "-i", roh, "-ar", str(RATE), "-ac", "1",
         "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return beschneiden(np.frombuffer(aus, dtype=np.int16).astype(np.float32) / 32768.0)


def beschneiden(x, schwelle=0.012, rest=0.08, luecke=0.4, leise=0.25):
    """Auf den Satz beschneiden — Anhaenge weg, Kunstpausen behalten.

    Zwei Dinge muessen hier gleichzeitig gelten, und die erste Fassung
    konnte nur eines davon.

    `eleven_v3` haengt hinter den Satz gern eine Pause und DANACH noch
    etwas — ein Atmen, ein angesetztes Wort. Bei "Kundschaft veraendert
    sich." lag Sprache von 0 bis 1,7 s, dann 0,8 s Stille, dann wieder
    Signal bis 3,44 s. Wer nur die letzte laute Stelle sucht, behaelt den
    Anhang.

    Aber eine Pause mitten im Satz ist keine Luecke, sondern Absicht: bei
    "Die Frage ist nur: Entscheiden Sie — oder wird entschieden?" steht nach
    dem Gedankenstrich die Haelfte der Aussage. Wer stur nach der ersten
    Luecke abschneidet, wirft sie weg — genau das ist passiert, 1,3 s statt
    4,0 s.

    Der Unterschied ist die Lautstaerke, nicht die Pause: der Anhang ist ein
    Sechzehntel so laut wie die Sprache davor. Also faellt ein Block nur
    dann weg, wenn nach der Luecke auch deutlich leiser weitergeht.
    """
    fenster = max(1, int(0.03 * RATE))
    pol = np.convolve((np.abs(x) > schwelle).astype(np.float32),
                      np.ones(fenster, dtype=np.float32), mode="same") > 0
    if not pol.any():
        return x
    wechsel = np.diff(pol.astype(np.int8))
    anfang = np.flatnonzero(wechsel == 1) + 1
    ende = np.flatnonzero(wechsel == -1) + 1
    if pol[0]:
        anfang = np.r_[0, anfang]
    if pol[-1]:
        ende = np.r_[ende, len(pol)]
    a, e = int(anfang[0]), int(ende[0])
    spitze = float(np.abs(x[a:e]).max())
    for i in range(1, len(anfang)):
        na, ne = int(anfang[i]), int(ende[i])
        if na - e > luecke * RATE and float(np.abs(x[na:ne]).max()) < leise * spitze:
            break
        e = ne
        spitze = max(spitze, float(np.abs(x[na:ne]).max()))
    return x[max(0, a - int(0.03 * RATE)):min(len(x), e + int(rest * RATE))]


def bett(fassung, n, laenge=None, dehnung=1.0):
    """Das Klangbett: tiefer Akkord, sehr leise, mit weichen Kanten.

    dehnung: Faktor, um den die festen Stuetzstellen der Huellkurve nach
    hinten ruecken — laeuft das Bild mit Tempo 0,9, liegt die
    Scharnierfrage nicht mehr bei 22 s, sondern bei 24,4 s.
    """
    t = np.arange(n) / RATE
    rng = np.random.default_rng(7)
    # Ein tiefes c-Moll-Feld. Jede Teiltonlinie leicht verstimmt und mit
    # eigener, langsamer Schwebung, damit nichts nach Sinuston klingt.
    klang = np.zeros(n, dtype=np.float32)
    for hz, laut, tempo in ((65.41, 1.00, 0.031), (98.00, 0.55, 0.043),
                            (130.81, 0.40, 0.027), (155.56, 0.26, 0.037),
                            (196.00, 0.16, 0.023)):
        for versatz in (-0.6, 0.0, 0.7):
            schwebe = 0.55 + 0.45 * np.sin(2 * np.pi * tempo * t + hz)
            klang += laut * schwebe * np.sin(2 * np.pi * (hz + versatz) * t
                                             + rng.uniform(0, 6.28))
    klang /= np.abs(klang).max() + 1e-9

    # Eine Prise gefiltertes Rauschen als Luft im Raum.
    luft = rng.normal(0, 1, n).astype(np.float32)
    kern = np.hanning(1200).astype(np.float32)
    luft = np.convolve(luft, kern / kern.sum(), mode="same")
    luft /= np.abs(luft).max() + 1e-9
    klang = 0.90 * klang + 0.10 * luft

    # Fassung B: ein Puls, der schneller wird und bei Sekunde 50 aufhoert —
    # genau dort haelt im Bild alles an.
    if fassung == "b":
        rate = np.clip(0.9 + 0.030 * t, 0.9, 2.3)
        phase = 2 * np.pi * np.cumsum(rate) / RATE
        puls = 0.5 + 0.5 * np.sin(phase - np.pi / 2)
        puls = puls ** 3
        aus = np.clip((50.0 - t) / 3.0, 0.0, 1.0)
        klang *= (1.0 - 0.45 * aus) + 0.45 * aus * puls

    # Huellkurve: leise anfangen, in der Mitte etwas tragen, am Ende weg.
    L = laenge or LAENGE[fassung]
    # Fassung B: Hoehepunkt vor dem Stillstand bei 46–52 s. Fassung A ist
    # laenger und traegt gleichmaessiger; ihr Hoehepunkt liegt unter dem
    # Satz von der Zukunft, die noch nicht existiert.
    # Fassung V hat eine eigene Kurve: ihr Hoehepunkt liegt nicht mehr in
    # der Mitte, sondern unter den vier Hypothesen (27 bis 47 s). Die
    # Scharnierfrage bei 22 s liegt in der Senke davor — dort soll das Bett
    # zuruecktreten, damit die Frage allein steht.
    stuetzen = ([0, 4, 40, 64, 72, L - 4.0, L], [0.0, 0.55, 0.72, 1.00, 0.62, 0.45, 0.0]) \
        if fassung == "a" else ([0, 3, 14, 19, 26, 38, L - 3.0, L], [0.0, 0.52, 0.66, 0.40, 0.86, 1.00, 0.45, 0.0]) \
        if fassung == "v" else ([0, 3, 12, 26, 32, L - 4.0, L], [0.0, 0.55, 0.72, 1.00, 0.62, 0.45, 0.0]) \
        if fassung in ("k", "n") else ([0, 4, 30, 46, 52, L - 4.0, L], [0.0, 0.55, 0.75, 1.00, 0.62, 0.45, 0.0])
    zeiten, werte = stuetzen
    zeiten = [z * dehnung if z < L - 5.0 else z for z in zeiten]
    huelle = np.interp(t, zeiten, werte)
    return (klang * huelle * 0.055).astype(np.float32)


def neu_verdrahten(roh, zeiten, tempo, einsaetze=None):
    """Die Zeilen der Aufnahme auf ein langsameres Bild setzen.

    Das Bild laeuft mit Tempo 0,9, die Stimme bleibt bei 1,0 — also wird
    nicht die Aufnahme gedehnt, sondern jede Zeile einzeln dorthin gesetzt,
    wo ihre Szene jetzt liegt: der Einsatz jeder Zeile rueckt auf
    (VORLAUF + Einsatz) / tempo, ihre Laenge bleibt. Die Pausen dazwischen
    werden laenger, die Stimme selbst wird nicht angeruehrt. Geschnitten
    wird in der Mitte der Pausen, damit Atmer bei ihrer Zeile bleiben.
    """
    n_roh = len(roh) / RATE
    grenzen = []
    for k, (von, bis) in enumerate(zeiten):
        ab = 0.0 if k == 0 else (zeiten[k - 1][1] + von) / 2
        zu = n_roh if k == len(zeiten) - 1 else (bis + zeiten[k + 1][0]) / 2
        grenzen.append((ab, zu))
    # Einsaetze in Filmzeit: von der Montage vorgegeben (Tempo und Zugaben
    # schon eingerechnet) oder schlicht (VORLAUF + Einsatz) / tempo.
    if einsaetze is None:
        einsaetze = [(VORLAUF + von) / tempo for von, _bis in zeiten]
    laenge = einsaetze[-1] + (grenzen[-1][1] - zeiten[-1][0]) + NACHLAUF
    n = int(laenge * RATE)
    stimme = np.zeros(n, dtype=np.float32)
    neu, ende_vorher = [], 0
    for (von, bis), (ab, zu), einsatz in zip(zeiten, grenzen, einsaetze):
        start = einsatz - (von - ab)
        i0 = int(round(start * RATE))
        assert i0 >= ende_vorher, "Zeilen ueberlappen — das darf bei tempo < 1 nicht sein"
        stueck = roh[int(round(ab * RATE)):int(round(zu * RATE))]
        stimme[i0:i0 + len(stueck)] = stueck
        ende_vorher = i0 + len(stueck)
        neu.append((einsatz, einsatz + (bis - von)))
    return stimme, neu


def spur(fassung, tempo=1.0, einsaetze=None):
    zeilen = {"a": A_TEXT, "b": B_TEXT, "k": K_TEXT, "n": N_TEXT, "v": V_TEXT}[fassung]
    if fassung in ELEVEN_GANZ and os.environ.get("STIMMEN_QUELLE") != "openai":
        mp3, zeiten = ganz_sprechen(fassung, zeilen)
        aus = subprocess.run(
            [FFMPEG, "-v", "error", "-i", mp3, "-ar", str(RATE), "-ac", "1",
             "-f", "s16le", "-"], capture_output=True, check=True).stdout
        roh = np.frombuffer(aus, dtype=np.int16).astype(np.float32) / 32768.0
        if tempo != 1.0 or einsaetze is not None:
            stimme, film = neu_verdrahten(roh, zeiten, tempo, einsaetze)
            n = len(stimme)
            print(f"  ein Zug, Zeilen auf Tempo {tempo:g} neu verdrahtet (Stimme bleibt 1,0):",
                  flush=True)
            for (von, bis), (_s, text) in zip(film, zeilen):
                print(f"  {von:5.2f} – {bis:5.2f}  {text[:58]}", flush=True)
        else:
            n = int((VORLAUF + len(roh) / RATE + NACHLAUF) * RATE)
            stimme = np.zeros(n, dtype=np.float32)
            stimme[int(VORLAUF * RATE):int(VORLAUF * RATE) + len(roh)] = roh
            print("  ein Zug, Satzgrenzen aus der Zeichen-Zeitleiste:", flush=True)
            for (von, bis), (_s, text) in zip(zeiten, zeilen):
                print(f"  {VORLAUF + von:5.2f} – {VORLAUF + bis:5.2f}  {text[:58]}", flush=True)
        print(f"  Tonspur {n / RATE:.2f} s", flush=True)
    else:
        n = int(LAENGE[fassung] * RATE)
        stimme = np.zeros(n, dtype=np.float32)
        for i, (sekunde, text) in enumerate(zeilen):
            stueck = sprechen(fassung, i, text)
            ab = int(sekunde * RATE)
            bis = min(n, ab + len(stueck))
            stimme[ab:bis] += stueck[:bis - ab]
            ende = sekunde + len(stueck) / RATE
            print(f"  {sekunde:5.1f} – {ende:5.1f}  {text[:60]}", flush=True)
            if i + 1 < len(zeilen) and ende > zeilen[i + 1][0]:
                print(f"  ACHTUNG: Zeile {i} laeuft in Zeile {i+1} hinein", flush=True)
    spitze = np.abs(stimme).max()
    if spitze > 0:
        stimme *= 0.72 / spitze
    misch = np.clip(stimme + bett(fassung, n, n / RATE, dehnung=1.0 / tempo), -1.0, 1.0)
    stereo = np.repeat(misch[:, None], 2, axis=1)
    ziel = f"{TON}/horizon_{fassung}{f'_t{tempo:g}' if tempo != 1.0 else ''}.wav"
    with wave.open(ziel, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())
    print("fertig:", ziel, os.path.getsize(ziel) // 1024, "KB", flush=True)
    return ziel


if __name__ == "__main__":
    for f in (sys.argv[1:] or ["v"]):
        print("Fassung", f.upper(), flush=True)
        spur(f)
    print("STIMME HORIZON FERTIG", flush=True)
