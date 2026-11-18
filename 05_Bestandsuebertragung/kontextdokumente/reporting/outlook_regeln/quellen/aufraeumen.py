# -*- coding: utf-8 -*-
"""Auftrag „Aufräumen“: Duplikate löschen, Regeln umbenennen, Reihenfolge herstellen.

Grundlage sind der Regel-Export (wie bisher) und eine Namensliste – eine Excel-Datei mit einem Blatt je Postfach
(Blattname beginnt mit „Bestand…“ bzw. „Makler…“), Spalten „Name heute“ und „Neuer Name …“, wahlweise „Umstellung
gewollt“ und „Löschen“. Die Namensliste steht nicht im Repository (Regelnamen des Postfachs); bau_regeln.py --liste
schreibt sie aus dem Export (mit den Namen von heute oder denen einer älteren Liste), siehe liste_schreiben.

Löschen: „ja“ in der Spalte „Löschen“ nimmt die Regel ohne Ersatz aus dem Postfach (LOESCHEN … | ohne Ersatz). Der
Bau sagt dazu, was das bewirkt: nichts (Regel ausgeschaltet oder sie greift heute nie) oder eine Änderung (ihre Mails
laufen danach in die späteren Regeln).

Vereinfachen (optimierung): Der Bau sucht Suchwörter, die ein kürzeres Suchwort derselben Bedingung schon abdeckt,
sehr kurze Suchwörter, Regeln, die sich ohne Änderung zu einer zusammenlegen ließen, und ausgeschaltete Regeln. Das
sind Befunde für das Blatt „Optimierung“ der Namensliste – am Inhalt einer Regel ändert der Plan nichts.

Reihenfolge: Tragen alle neuen Namen vorn eine Nummer, bestimmt die Nummer den Platz – wer eine Nummer ändert, stellt
die Regel um. Ohne Nummern gilt die Reihenfolge der Zeilen (zielfolge).

Jeder Platztausch wird gegen die Logik der Regeln geprüft (umkehr): Er ist ohne Wirkung, wenn eine der beiden Regeln
ausgeschaltet ist, beide dasselbe tun oder keine Mail beide treffen kann. Lässt sich das nicht zeigen, bricht der Bau
ab – es sei denn, die Namensliste bestätigt die Umstellung („Umstellung gewollt“ = ja). Außerdem meldet das Modul
Regeln, die an ihrem neuen Platz nie greifen, weil eine frühere Regel jede ihrer Mails abfängt (verdeckt).

bau_regeln.py ruft das Modul mit --plan <namensliste.xlsx> auf (--ziel makler baut die Mappe für Maklerauftraege).
Je Postfach entsteht ein Plan für das Blatt Umsetzung:

  1. LOESCHEN  <Name> | Duplikate      je Name, den mehrere inhaltsgleiche Regeln tragen (die erste bleibt)
     LOESCHEN  <Name> | ohne Ersatz    je Regel mit „Löschen“ = ja
  2. UMBENENNEN <Name heute> | <neu>   je Regel, deren Name sich ändert
  3. POSITION  <neuer Name> | nach: …  nur für die Regeln, die ihren Platz wechseln müssen

Zu 3: Die Regeln, die ihre Reihenfolge untereinander behalten (längste aufsteigende Teilfolge), bleiben stehen; jede
andere wird direkt hinter ihre Vorgängerin der Zielreihenfolge gesetzt, in Zielreihenfolge. So entstehen so wenige
Umstellungen wie möglich.

Das Modul rät nicht: Passt die Namensliste nicht zum Export (Regel fehlt, Regel unbekannt, neuer Name doppelt, gleicher
Name mit verschiedenem Inhalt), bricht der Bau mit einer Meldung ab.
"""
import bisect
import collections
import re
import warnings

import openpyxl


class Namensliste(dict):
    """{'bestand': [(Name heute, neuer Name), ...], 'makler': [...]} in der Reihenfolge der Zeilen;
    gewollt: {'bestand': {Name heute, ...}, ...} – Regeln, deren Umstellung die Liste bestätigt;
    loeschen: ebenso – Regeln, die ohne Ersatz gelöscht werden sollen."""

    def __init__(self):
        super().__init__()
        self.gewollt = {}
        self.loeschen = {}


def namensliste_lesen(pfad):
    """Namensliste aus der Excel-Datei (ein Blatt je Postfach)."""
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        wb = openpyxl.load_workbook(pfad, data_only=True)
    listen = Namensliste()
    for ws in wb.worksheets:
        schl = 'bestand' if ws.title.lower().startswith('bestand') else 'makler' if ws.title.lower().startswith('makler') else None
        if schl is None:
            continue
        kopf, sp_alt, sp_neu, sp_gew, sp_loe = None, None, None, None, None
        for r in range(1, min(ws.max_row, 30) + 1):
            werte = {str(ws.cell(r, c).value or '').strip(): c for c in range(1, ws.max_column + 1)}
            alt = [c for t, c in werte.items() if t == 'Name heute']
            neu = [c for t, c in werte.items() if t.startswith('Neuer Name')]
            if alt and neu:
                kopf, sp_alt, sp_neu = r, alt[0], neu[0]
                sp_gew = ([c for t, c in werte.items() if t.startswith('Umstellung gewollt')] or [None])[0]
                sp_loe = ([c for t, c in werte.items() if t.startswith('Löschen')] or [None])[0]
                break
        if kopf is None:
            raise SystemExit('Namensliste: Blatt „%s“ ohne Spalten „Name heute“ und „Neuer Name …“' % ws.title)
        zeilen, gewollt, loeschen = [], set(), set()
        for r in range(kopf + 1, ws.max_row + 1):
            alt, neu = ws.cell(r, sp_alt).value, ws.cell(r, sp_neu).value
            if alt is None or str(alt).strip() == '':
                continue
            zeilen.append((str(alt), '' if neu is None else str(neu).strip()))
            if sp_gew and str(ws.cell(r, sp_gew).value or '').strip().lower() == 'ja':
                gewollt.add(str(alt))
            if sp_loe and str(ws.cell(r, sp_loe).value or '').strip().lower() == 'ja':
                loeschen.add(str(alt))
        if schl in listen:
            raise SystemExit('Namensliste: zwei Blätter für %s' % schl)
        listen[schl] = zeilen
        listen.gewollt[schl] = gewollt
        listen.loeschen[schl] = loeschen
    return listen


def inhalt(g):
    """Inhalt einer Regel laut Export ohne Name, Platz und Aktiv (für den Vergleich gleichnamiger Regeln)."""
    return (g.get('typ'), g.get('gueltig'), tuple(sorted(g['bed'])), tuple(sorted(g['aus'])), tuple(sorted(g['akt'])),
            g.get('stopp'))


def _bleiben(folge):
    """Stellen einer längsten streng aufsteigenden Teilfolge von folge (Zahlen): Diese Regeln bleiben stehen."""
    enden, zeiger, vor = [], [], [None] * len(folge)
    for i, x in enumerate(folge):
        k = bisect.bisect_left(enden, x)
        if k == len(enden):
            enden.append(x)
            zeiger.append(i)
        else:
            enden[k] = x
            zeiger[k] = i
        vor[i] = zeiger[k - 1] if k > 0 else None
    aus, i = set(), zeiger[-1] if zeiger else None
    while i is not None:
        aus.add(i)
        i = vor[i]
    return aus


# ================================================================ Reihenfolge: Nummern, Platztausch, verdeckte Regeln
_NUMMER = re.compile(r'^\s*(\d+)\b')
TEXT_ARTEN = ('Betreff enthält', 'Mailtext enthält', 'Betreff oder Mailtext enthält', 'Nachrichtenkopf enthält',
              'Absenderadresse enthält', 'Empfängeradresse enthält')
LISTEN_ARTEN = ('Absender ist', 'Gesendet an')
RAEUMT = ('In Ordner verschieben', 'Löschen (Gelöschte Elemente)', 'Endgültig löschen')
OHNE, PRAKTISCH, PRUEFEN = 'ohne Wirkung', 'praktisch ohne Wirkung', 'bitte prüfen'
AENDERT = 'ändert die Wirkung'


def zielfolge(liste, kurz=''):
    """Zielreihenfolge einer Namensliste [(Name heute, neuer Name), ...]: (Liste in Zielreihenfolge, nach Nummern?).

    Tragen alle neuen Namen vorn eine Nummer („41 Prio – …“), bestimmt die Nummer den Platz; bei gleicher Nummer
    entscheidet die Zeile. Trägt keiner eine, gilt die Reihenfolge der Zeilen. Gemischt bricht ab: Wohin die Regeln
    ohne Nummer gehören, wäre geraten."""
    nummern = [_NUMMER.match(n) for _, n in liste]
    if liste and all(nummern):
        folge = sorted(range(len(liste)), key=lambda i: (int(nummern[i].group(1)), i))
        return [liste[i] for i in folge], True
    if not any(nummern):
        return list(liste), False
    ohne = ['„%s“' % n for (_, n), m in zip(liste, nummern) if not m]
    raise SystemExit('Namensliste (%s): %d von %d neuen Namen tragen vorn keine Nummer (%s) – entweder alle mit Nummer '
                     '(dann bestimmt sie den Platz) oder keiner (dann gilt die Reihenfolge der Zeilen)'
                     % (kurz, len(ohne), len(liste), ', '.join(ohne[:5]) + (' …' if len(ohne) > 5 else '')))


def _norm(t):
    return re.sub(r'\s+', ' ', str(t or '')).strip().casefold()


def _werte(det):
    """Einzelwerte eines Detailtexts: '"a", "b"' (Textbedingung) bzw. 'X; Y' (Personen) – klein, ohne Mehrfach-Leerzeichen."""
    det = str(det or '')
    w = re.findall(r'"([^"]*)"', det)
    return [_norm(x) for x in w] if w else [_norm(x) for x in det.split(';') if x.strip()]


def _det(g, bez, art='bed'):
    """Alle Werte der Elemente einer Art (z. B. „Absender ist“) einer Regel."""
    return [w for b, d in g[art] if b == bez for w in _werte(d)]


def _folgt(spez, allg):
    """True, wenn aus dem Element spez das Element allg folgt: Jede Mail, die spez erfüllt, erfüllt auch allg.

    Textbedingungen („… enthält“, Werte mit ODER): Jeder Wert von spez enthält einen Wert von allg. Personenlisten
    („Absender ist“, „Gesendet an“): Die Liste von spez ist Teil der Liste von allg. Alles andere nur bei gleichem Wert."""
    (bs, ds), (ba, da) = spez, allg
    if bs != ba and not (bs in ('Betreff enthält', 'Mailtext enthält') and ba == 'Betreff oder Mailtext enthält'):
        return False
    ws, wa = _werte(ds), _werte(da)
    if ba in TEXT_ARTEN:
        return bool(ws) and bool(wa) and all(any(a in x for a in wa) for x in ws)
    if ba in LISTEN_ARTEN:
        return bool(ws) and set(ws) <= set(wa)
    return sorted(ws) == sorted(wa) and (bool(ws) or _norm(ds) == _norm(da))


def _gelesen(g):
    """True, wenn Outlook Bedingungen und Ausnahmen der Regel vollständig geliefert hat (nichts „nicht lesbar“)."""
    if any('nicht lesbar' in str(b).lower() for _, b in g.get('pseudo', [])):
        return False
    return not any('nicht lesbar' in (str(b) + ' ' + str(d)).lower() or str(b).startswith('Unbekannte')
                   for b, d in list(g['bed']) + list(g['aus']))


def wirkung(g):
    """Was die Regel tut: ihre Aktionen samt „keine weiteren Regeln“ – ohne Name, Platz und Bedingungen."""
    return tuple(sorted((str(b), _norm(d)) for b, d in g['akt'])), g.get('stopp')


def _getrennt(a, b):
    """Kann eine Mail beide Regeln treffen? (Stufe, Grund), wenn nicht bzw. praktisch nicht; None, wenn es offen ist."""
    if not (_gelesen(a) and _gelesen(b)):
        return None
    for x, y in ((a, b), (b, a)):
        for aus in x['aus']:
            for bed in y['bed']:
                if _folgt(bed, aus):
                    return OHNE, ('keine Mail trifft beide: „%s %s“ ist bei der einen Regel Bedingung, bei der anderen '
                                  'Ausnahme' % (bed[0], _kurz(bed[1], 60)))
    ia, ib = _det(a, 'Absender ist'), _det(b, 'Absender ist')
    ea, eb = _det(a, 'Absenderadresse enthält'), _det(b, 'Absenderadresse enthält')
    if ia and ib and not set(ia) & set(ib):
        if all('@' in x for x in ia + ib):
            return OHNE, 'keine Mail trifft beide: verschiedene Absenderadressen'
        return PRAKTISCH, ('verschiedene Absender – eine Mail träfe nur dann beide, wenn jemand in den Absenderlisten '
                           'beider Regeln stünde (Verteilerlisten)')
    for ist, ent in ((ia, eb), (ib, ea)):
        if ist and ent and all('@' in x for x in ist) and not any(e in x for x in ist for e in ent):
            return OHNE, 'keine Mail trifft beide: verschiedene Absenderadressen'
    if ea and eb and not any(x in y or y in x for x in ea for y in eb):
        return PRAKTISCH, ('eine Mail träfe nur dann beide, wenn die Absenderadresse „%s“ und „%s“ zugleich enthielte'
                           % (' / '.join(ea), ' / '.join(eb)))
    fa, fb = _det(a, 'Formular / Nachrichtenklasse'), _det(b, 'Formular / Nachrichtenklasse')
    if fa and fb and not any(x.startswith(y) or y.startswith(x) for x in fa for y in fb):
        return OHNE, 'keine Mail trifft beide: verschiedene Nachrichtenklassen'
    return None


def verdeckt(frueh, spaet):
    """True, wenn spaet nie greift, solange frueh davor steht: frueh ist eingeschaltet und beendet die Regelkette, und
    jede Mail, die spaet trifft, trifft auch frueh – jede Bedingung von frueh folgt aus einer von spaet, und keine
    Ausnahme von frueh kann bei einer Mail von spaet greifen (sie zöge eine Ausnahme von spaet nach sich).

    Gewertet wird frueh nur mit vollständig gelesenen Bedingungen; eine Regel ohne sichtbare Bedingung (Sammelregel)
    zählt hier nicht, dafür gibt es den eigenen Hinweis."""
    if frueh['aktiv'] != 'Ja' or frueh.get('stopp') != 'Ja' or frueh.get('typ') != spaet.get('typ'):
        return False
    if not frueh['bed'] or not _gelesen(frueh):
        return False
    if not all(any(_folgt(x, f) for x in spaet['bed']) for f in frueh['bed']):
        return False
    return all(any(_folgt(fa, sa) for sa in spaet['aus']) for fa in frueh['aus'])


def umkehr(a, b, name_a=None, name_b=None):
    """Urteil über einen Platztausch: a lief bisher vor b, künftig läuft b vor a. Rückgabe (Stufe, Grund).

    OHNE       – die Wirkung bleibt gleich (eine Regel ausgeschaltet, gleiche Aktionen, keine Mail trifft beide).
    PRAKTISCH  – nach den Bedingungen trifft keine Mail beide; ausgeschlossen ist es nur bei abwegigen Absendern nicht.
    PRUEFEN    – eine Mail kann beide treffen und wird dann anders behandelt als heute; das muss jemand wollen."""
    na, nb = name_a or a['name'], name_b or b['name']
    for g, n in ((a, na), (b, nb)):
        if g['aktiv'] != 'Ja':
            return OHNE, '„%s“ ist ausgeschaltet (wird sie eingeschaltet, zählt ihr neuer Platz)' % n
    if a.get('typ') != b.get('typ'):
        return OHNE, 'verschiedene Regeltypen (%s / %s)' % (a.get('typ'), b.get('typ'))
    if wirkung(a) == wirkung(b):
        return OHNE, 'beide Regeln tun dasselbe'
    if a.get('stopp') != 'Ja' and b.get('stopp') != 'Ja' and not (
            any(x in RAEUMT for x, _ in a['akt']) and any(x in RAEUMT for x, _ in b['akt'])):
        return OHNE, 'keine der beiden beendet die Regelkette oder nimmt der anderen die Mail weg'
    if verdeckt(a, b):
        return PRUEFEN, ('heute greift „%s“ nie, weil „%s“ jede ihrer Mails abfängt und die Regelkette beendet – künftig '
                         'greift „%s“ zuerst' % (nb, na, nb))
    g = _getrennt(a, b)
    if g:
        return g
    return PRUEFEN, 'trifft eine Mail beide Regeln, gewinnt heute „%s“, künftig „%s“' % (na, nb)


def loesch_urteil(regel, davor):
    """Was es bewirkt, eine Regel ohne Ersatz zu löschen. davor: [(Regel, Anzeigename)] der Regeln, die heute vor ihr
    laufen und bleiben. Rückgabe (Stufe, Grund): OHNE, wenn sie ausgeschaltet ist oder heute nie greift, sonst AENDERT."""
    if regel['aktiv'] != 'Ja':
        return OHNE, 'sie ist ausgeschaltet'
    for f, name in davor:
        if verdeckt(f, regel):
            return OHNE, 'sie greift heute nie – „%s“ fängt jede ihrer Mails ab und beendet die Regelkette' % name
    return AENDERT, 'sie ist eingeschaltet – ihre Mails laufen danach in die späteren Regeln'


def zusammenlegbar(a, b):
    """Ließen sich a und b zu einer Regel zusammenlegen, ohne dass sich etwas ändert? Rückgabe: die Art der einen
    Bedingung, deren Werte sich unterscheiden (z. B. „Absender ist“), '' bei gleichen Bedingungen, None wenn nicht.

    Voraussetzung: gleiche Wirkung, gleicher Regeltyp, beide ein- oder beide ausgeschaltet, vollständig gelesen, gleiche
    Ausnahmen, dieselben Arten von Bedingungen – und höchstens eine Text- oder Personenbedingung mit anderen Werten
    (eine Regel verknüpft die Werte einer Bedingung mit ODER, verschiedene Bedingungen mit UND)."""
    if a['aktiv'] != b['aktiv'] or a.get('typ') != b.get('typ') or wirkung(a) != wirkung(b):
        return None
    if not (_gelesen(a) and _gelesen(b)) or not a['bed'] or not b['bed']:
        return None

    def norm(elemente):
        return sorted((x, tuple(sorted(_werte(d))), '' if _werte(d) else _norm(d)) for x, d in elemente)
    if norm(a['aus']) != norm(b['aus']):
        return None
    ba, bb = {x[0]: x[1:] for x in norm(a['bed'])}, {x[0]: x[1:] for x in norm(b['bed'])}
    if set(ba) != set(bb) or len(ba) != len(a['bed']) or len(bb) != len(b['bed']):
        return None
    anders = [k for k in ba if ba[k] != bb[k]]
    if not anders:
        return ''
    if len(anders) == 1 and anders[0] in TEXT_ARTEN + LISTEN_ARTEN:
        return anders[0]
    return None


def suchwoerter(g):
    """Befunde zu den Suchwörtern einer Regel: [(Art, Bezeichnung, überflüssige Wörter mit ihrem Deckwort, kurze Wörter)].

    Überflüssig ist ein Wort, wenn ein anderes Wort derselben Bedingung darin steckt: Was das längere trifft, trifft
    das kürzere auch. Kurz (nur Bedingungen, höchstens drei Buchstaben oder Ziffern): Outlook sucht die Zeichenfolge,
    nicht das ganze Wort, und unterscheidet Groß- und Kleinschreibung nicht (Microsoft beschreibt das für den Betreff:
    KB Q257960, „age“ trifft auch „message“) – ein so kurzes Wort kann mehr treffen als gemeint."""
    aus = []
    for art, elemente in (('Bedingung', g['bed']), ('Ausnahme', g['aus'])):
        for bez, det in elemente:
            if bez not in TEXT_ARTEN:
                continue
            roh = re.findall(r'"([^"]*)"', str(det or ''))
            klein = [_norm(x) for x in roh]
            ueber = []
            for i, x in enumerate(klein):
                deck = [roh[j] for j, y in enumerate(klein) if j != i and y and y in x and (y != x or j < i)]
                if deck:
                    ueber.append((roh[i], min(deck, key=len)))
            weg = {u for u, _ in ueber}
            kurz = [x for x in roh if x not in weg and art == 'Bedingung' and 0 < len(x.strip()) <= 3 and x.strip().isalnum()]
            if ueber or kurz:
                aus.append((art, bez, ueber, kurz))
    return aus


def namensliste_aus_regeln(regeln_je_postfach, alt=None):
    """Namensliste aus dem Export: je Postfach jeder Regelname einmal, in der Reihenfolge von heute.

    regeln_je_postfach: {'bestand': [...], 'makler': [...]}. Mit alt (einer älteren Namensliste) werden deren neue
    Namen und Bestätigungen übernommen, wo der Name von heute passt; Regeln, die die alte Liste nicht kennt, behalten
    ihren Namen. Rückgabe (Namensliste, Hinweise)."""
    liste, hinweise = Namensliste(), []
    for schl, regeln in regeln_je_postfach.items():
        namen = list(collections.OrderedDict((g['name'], 1) for g in regeln))
        vorher = collections.OrderedDict(alt.get(schl, [])) if alt else {}
        liste[schl] = [(n, vorher.get(n) or n) for n in namen]
        liste.gewollt[schl] = {n for n in (alt.gewollt.get(schl, set()) if alt else set()) if n in namen}
        liste.loeschen[schl] = {n for n in (alt.loeschen.get(schl, set()) if alt else set()) if n in namen}
        for n in namen:
            if alt and n not in vorher:
                hinweise.append('%s: „%s“ steht nicht in der alten Liste – Name bleibt' % (schl, n))
        for n in vorher:
            if n not in namen:
                hinweise.append('%s: „%s“ aus der alten Liste gibt es im Export nicht mehr' % (schl, n))
    return liste, hinweise


def auftrag(postfach, regeln, namensliste, streng=True):
    """Plan und Übersicht für ein Postfach. regeln: Regeln des Postfachs in Ausführungsreihenfolge (dicts aus
    bau_regeln.REGEL). Rückgabe: dict(zeilen=[...], weg=[...], plan=[...], tausche=[...], n_heute, n_danach,
    n_duplikate, n_umbenannt, umstellungen, nach_nummer, offen, verdeckt). zeilen sind die Regeln, die bleiben, in der
    neuen Reihenfolge; weg die Regeln, die ohne Ersatz gelöscht werden.

    streng=True (Bau der Mappe): Ein Platztausch, der die Wirkung ändern kann und in der Namensliste nicht bestätigt
    ist, bricht ab. streng=False (Namensliste schreiben): Er wird nur gemeldet (offen)."""
    kurz = postfach.split('@')[0]
    schl = 'bestand' if postfach.lower().startswith('bestand') else 'makler'
    if schl not in namensliste:
        raise SystemExit('Namensliste: kein Blatt für %s' % kurz)
    liste = namensliste[schl]
    gewollt = getattr(namensliste, 'gewollt', {}).get(schl, set())
    loeschen = getattr(namensliste, 'loeschen', {}).get(schl, set())
    gruppen = collections.OrderedDict()
    for g in regeln:
        gruppen.setdefault(g['name'], []).append(g)
    fehler = []
    for name, gr in gruppen.items():
        if len({inhalt(g) for g in gr}) > 1:
            fehler.append('„%s“ gibt es %d-mal mit verschiedenem Inhalt (Plätze %s) – das geht nicht über „Duplikate“; '
                          'solche Regeln einzeln als „Name #n/m“ in den Plan nehmen'
                          % (name, len(gr), ', '.join(str(g['reihe']) for g in gr)))
    alt_namen = [a for a, _ in liste]
    for name in gruppen:
        if alt_namen.count(name) != 1:
            fehler.append('„%s“ steht %d-mal in der Namensliste (erwartet: einmal)' % (name, alt_namen.count(name)))
    for a in alt_namen:
        if a not in gruppen:
            fehler.append('„%s“ steht in der Namensliste, aber nicht im Export' % a)
    for a in loeschen:
        if len(gruppen.get(a, [])) > 1:
            fehler.append('„%s“ soll gelöscht werden, ist aber %d-mal vorhanden – über die Namensliste geht das nur für '
                          'eine einzelne Regel (erst die Duplikate löschen lassen, dann mit neuem Export die letzte)'
                          % (a, len(gruppen[a])))
    neu_namen = [n for a, n in liste if a not in loeschen]
    for a, n in liste:
        if a in loeschen:
            continue                                        # wird gelöscht: der neue Name spielt keine Rolle
        if n == '':
            fehler.append('„%s“: neuer Name fehlt' % a)
        elif [x.lower() for x in neu_namen].count(n.lower()) > 1:
            fehler.append('neuer Name „%s“ ist mehrfach vergeben' % n)
        elif n != a and any(n.lower() == x.lower() for x in gruppen if x != a):
            fehler.append('neuer Name „%s“ (für „%s“) heißt wie eine andere Regel von heute – dafür wäre ein '
                          'Zwischenname nötig' % (n, a))
    if fehler:
        raise SystemExit('Namensliste passt nicht zum Export (%s):\n  - %s' % (kurz, '\n  - '.join(fehler)))

    alle_namen = dict(liste)
    liste, nach_nummer = zielfolge([(a, n) for a, n in liste if a not in loeschen], kurz)
    heute = [n for n in gruppen if n not in loeschen]       # Reihenfolge heute ohne Duplikate und ohne die Regeln, die gehen
    platz_heute = {name: i + 1 for i, name in enumerate(heute)}
    platz_alle = {name: i for i, name in enumerate(gruppen)}
    neu = dict(liste)
    ziel = [a for a, _ in liste]                            # Zielreihenfolge (Namen von heute)
    bleibt = _bleiben([platz_heute[n] for n in ziel])
    zeilen, umstellungen = [], []
    for i, name in enumerate(ziel):
        gr = gruppen[name]
        z = dict(name=name, neu=neu[name], regel=gr[0], duplikate=gr[1:], platz_neu=i + 1, platz_ohne=platz_heute[name],
                 bewegt=i not in bleibt, nach=ziel[i - 1] if i > 0 else None, tausch=[], gewollt=name in gewollt,
                 verdeckt_von=None, hinter_sammel=None, weg=False)
        zeilen.append(z)
        if z['bewegt']:
            umstellungen.append(z)
    # Regeln, die ohne Ersatz gelöscht werden: was das bewirkt, hängt von den Regeln ab, die heute davor laufen
    weg = []
    for name in gruppen:
        if name in loeschen:
            davor = sorted((z for z in zeilen if platz_alle[z['name']] < platz_alle[name]), key=lambda z: platz_alle[z['name']])
            stufe, warum = loesch_urteil(gruppen[name][0], [(z['regel'], z['neu']) for z in davor])
            weg.append(dict(name=name, neu=alle_namen.get(name) or name, regel=gruppen[name][0], duplikate=[], platz_neu=None,
                            platz_ohne=None, bewegt=False, nach=None, tausch=[], gewollt=False, verdeckt_von=None,
                            hinter_sammel=None, weg=True, weg_stufe=stufe, weg_grund=warum))

    # Platztausch: Paare, deren Reihenfolge sich umkehrt (a lief bisher vor b, künftig b vor a) – jedes mit Urteil
    tausche = []
    for j, zb in enumerate(zeilen):
        for za in zeilen[j + 1:]:
            if za['platz_ohne'] < zb['platz_ohne']:
                stufe, grund = umkehr(za['regel'], zb['regel'], za['neu'], zb['neu'])
                t = dict(a=za, b=zb, stufe=stufe, grund=grund, bestaetigt=za['gewollt'] or zb['gewollt'])
                assert za['bewegt'] or zb['bewegt'], (za['name'], zb['name'])
                tausche.append(t)
                za['tausch'].append(t)
                zb['tausch'].append(t)
    offen = [t for t in tausche if t['stufe'] == PRUEFEN and not t['bestaetigt']]
    if offen and streng:
        raise SystemExit(
            'Reihenfolge (%s): %d Umstellung(en) – sie können die Wirkung ändern und sind in der Namensliste nicht bestätigt:\n  - %s\n'
            'Entweder bei einer der beiden Regeln in der Spalte „Umstellung gewollt“ ein „ja“ eintragen oder die beiden '
            'in ihrer Reihenfolge lassen.'
            % (kurz, len(offen), '\n  - '.join('„%s“ läuft künftig vor „%s“: %s' % (t['b']['neu'], t['a']['neu'], t['grund'])
                                               for t in offen)))

    # Am neuen Platz: Regeln, die nie greifen (verdeckt), und Regeln hinter einer eingeschalteten Sammelregel
    for j, z in enumerate(zeilen):
        if z['regel']['aktiv'] != 'Ja':
            continue
        for f in zeilen[:j]:
            if z['verdeckt_von'] is None and verdeckt(f['regel'], z['regel']):
                z['verdeckt_von'] = f
            rf = f['regel']
            if (z['hinter_sammel'] is None and rf['aktiv'] == 'Ja' and rf.get('stopp') == 'Ja' and not rf['bed']
                    and rf.get('typ') == z['regel'].get('typ')):
                z['hinter_sammel'] = f

    plan = []
    for name in heute:
        gr = gruppen[name]
        if len(gr) > 1:
            plan.append(dict(aktion='LOESCHEN', regel=name, neu='Duplikate',
                             warum='%d-mal vorhanden (Plätze %s), laut Export inhaltsgleich. Die erste bleibt; das Makro '
                                   'löscht die übrigen nur, wenn es die Gleichheit beim Ausführen selbst bestätigt.'
                                   % (len(gr), ', '.join(str(g['reihe']) for g in gr))))
    for z in weg:
        plan.append(dict(aktion='LOESCHEN', regel=z['name'], neu='ohne Ersatz',
                         warum='Soll laut Namensliste gelöscht werden (Platz %s). %s: %s.'
                               % (z['regel']['reihe'], z['weg_stufe'][:1].upper() + z['weg_stufe'][1:], z['weg_grund'])))
    for z in zeilen:
        if z['neu'] != z['name']:
            plan.append(dict(aktion='UMBENENNEN', regel=z['name'], neu=z['neu'], warum='Neuer Name laut Namensliste.'))
    grund = 'Nummer im Namen' if nach_nummer else 'Namensliste'
    ohne = 'ohne Duplikate und ohne die Regeln, die gelöscht werden' if weg else 'ohne Duplikate'
    for z in umstellungen:
        warum = ('Reihenfolge laut %s: bisher Platz %d von %d (%s), künftig Platz %d.'
                 % (grund, z['platz_ohne'], len(heute), ohne, z['platz_neu']))
        if z['tausch']:
            warum += ' ' + tausch_text(z)
        plan.append(dict(aktion='POSITION', regel=z['neu'], neu='Platz 1' if z['nach'] is None else 'nach: ' + neu[z['nach']],
                         warum=warum))
    for i, p in enumerate(plan):
        p['nr'] = i + 1
        p.setdefault('ausf', 'Ja')
        for k in ('ver', 'kop', 'quelle', 'ueberspr'):
            p.setdefault(k, '')
    return dict(postfach=postfach, zeilen=zeilen, weg=weg, plan=plan, n_heute=len(regeln), n_danach=len(heute),
                n_duplikate=len(regeln) - len(gruppen), n_umbenannt=sum(1 for z in zeilen if z['neu'] != z['name']),
                umstellungen=umstellungen, tausche=tausche, nach_nummer=nach_nummer, offen=offen,
                verdeckt=[z for z in zeilen if z['verdeckt_von'] is not None])


def ziel_namen(namensliste, schl):
    """[(Name heute, neuer Name)] der Regeln, die bleiben, in der Zielreihenfolge – so steht das Postfach danach da."""
    weg = getattr(namensliste, 'loeschen', {}).get(schl, set())
    return zielfolge([(a, n) for a, n in namensliste[schl] if a not in weg], schl)[0]


def optimierung(a):
    """Befunde zum Vereinfachen eines Postfachs (Auftrag a): [dict(art, regel, befund, vorschlag)].

    Suchwörter (überflüssig, sehr kurz), Regeln, die sich ohne Änderung zusammenlegen ließen, Regeln, die nie greifen,
    und ausgeschaltete Regeln. Es sind Befunde zum Entscheiden – der Plan ändert am Inhalt einer Regel nichts."""
    aus = []
    for z in a['zeilen']:
        for art, bez, ueber, kurz in suchwoerter(z['regel']):
            teile, wo = [], '„%s“%s' % (bez, ' (Ausnahme)' if art == 'Ausnahme' else '')
            if ueber:
                deck = collections.OrderedDict()
                for wort, d in ueber:
                    deck.setdefault(d, []).append(wort)
                for d, woerter in deck.items():
                    liste = ', '.join('„%s“' % w for w in woerter[:4]) + (' und %d weitere' % (len(woerter) - 4) if len(woerter) > 4 else '')
                    teile.append('%s %s überflüssig, weil „%s“ darin steckt und dieselben Mails trifft'
                                 % (liste, 'ist' if len(woerter) == 1 else 'sind', d))
            if kurz:
                teile.append('%s %s sehr kurz – Outlook sucht die Zeichenfolge, nicht das ganze Wort, und kann damit mehr '
                             'treffen als gemeint' % (', '.join('„%s“' % w for w in kurz), 'ist' if len(kurz) == 1 else 'sind'))
            if ueber and any(len(d.strip()) <= 3 for _, d in ueber):
                rat = ('Entscheiden: Ist das kurze Wort gewollt, können die längeren entfallen (ändert nichts). Ist es zu weit '
                       'gefasst, sollte das kurze entfallen (ändert die Wirkung) – dann werden die längeren wieder gebraucht.')
            elif ueber:
                rat = 'Die überflüssigen Wörter können entfallen (ändert nichts).'
            else:
                rat = 'Prüfen, ob das Wort nicht mehr trifft als gemeint.'
            aus.append(dict(art='Suchwörter', regel=z['neu'], befund='%s: %s.' % (wo, '; '.join(teile)), vorschlag=rat))
    bleiben = a['zeilen']
    for i, za in enumerate(bleiben):
        for zb in bleiben[i + 1:]:
            art = zusammenlegbar(za['regel'], zb['regel'])
            if art is None:
                continue
            stoert = [z['neu'] for z in bleiben[i + 1:bleiben.index(zb)]
                      if umkehr(z['regel'], zb['regel'], z['neu'], zb['neu'])[0] == PRUEFEN]
            befund = ('Gleiche Aktionen und Ausnahmen, %s.' % ('gleiche Bedingungen' if art == '' else
                                                               'verschieden ist nur „%s“' % art))
            if stoert:
                befund += ' Dazwischen steht „%s“, die dieselben Mails treffen kann.' % stoert[0]
            aus.append(dict(art='Zusammenlegen', regel='%s  +  %s' % (za['neu'], zb['neu']), befund=befund,
                            vorschlag=('Die zweite Regel ist überflüssig und kann gelöscht werden.' if art == '' else
                                       'Eine Regel mit den Werten beider täte dasselbe: Werte der zweiten in die erste aufnehmen, '
                                       'die zweite löschen.') + (' Vorher die Reihenfolge prüfen.' if stoert else '')))
    for z in a['verdeckt']:
        aus.append(dict(art='Greift nie', regel=z['neu'],
                        befund='Jede ihrer Mails trifft schon „%s“ (Platz %d), die die Regelkette beendet.'
                               % (z['verdeckt_von']['neu'], z['verdeckt_von']['platz_neu']),
                        vorschlag='Löschen (Spalte „Löschen“ = ja, ändert nichts) oder vor die andere Regel setzen (ändert die Wirkung).'))
    for z in a['zeilen']:
        if z['regel']['aktiv'] != 'Ja':
            aus.append(dict(art='Ausgeschaltet', regel=z['neu'], befund='Ist ausgeschaltet und wirkt nicht.',
                            vorschlag='Löschen, wenn sie nicht mehr gebraucht wird (Spalte „Löschen“ = ja) – oder als Reserve behalten.'))
    return aus


def tausch_text(z):
    """Die Platzwechsel einer Regel in einem Satz je Urteil: mit wem, in welche Richtung, mit welcher Wirkung."""
    teile = collections.OrderedDict()
    for t in z['tausch']:
        anderer = t['a'] if t['b'] is z else t['b']
        richtung = 'vor' if t['b'] is z else 'hinter'
        stufe = t['stufe'] + (' (in der Namensliste bestätigt)' if t['stufe'] == PRUEFEN and t['bestaetigt'] else '')
        teile.setdefault((richtung, stufe, t['grund']), []).append(anderer['neu'])
    saetze = []
    for (richtung, stufe, grund), namen in teile.items():
        if len(namen) == 1:
            wer = '„%s“' % namen[0]
        elif len(namen) <= 3:
            wer = '%d Regeln (%s)' % (len(namen), ', '.join('„%s“' % n for n in namen))
        else:
            wer = '%d Regeln („%s“, „%s“ und %d weitere)' % (len(namen), namen[0], namen[1], len(namen) - 2)
        saetze.append('Läuft künftig %s %s – %s: %s.' % (richtung, wer, stufe, grund))
    return ' '.join(saetze)


def pruef_text(a):
    """Ergebnis der Reihenfolge-Prüfung eines Postfachs in einer Zeile."""
    n = collections.Counter(t['stufe'] for t in a['tausche'])
    if not a['tausche']:
        t = 'Reihenfolge geprüft: kein Platztausch'
    else:
        t = 'Reihenfolge geprüft: %d %s – %s' % (len(a['tausche']), 'Platztausch' if len(a['tausche']) == 1 else 'Platztausche',
                                                  ', '.join('%d %s' % (n[k], k) for k in (OHNE, PRAKTISCH, PRUEFEN) if n[k]))
    if a['verdeckt']:
        t += '  ·  %s (siehe Hinweis)' % ('1 Regel greift nie' if len(a['verdeckt']) == 1 else
                                          '%d Regeln greifen nie' % len(a['verdeckt']))
    if a['weg']:
        n = collections.Counter(z['weg_stufe'] for z in a['weg'])
        t += '  ·  Löschen geprüft: %s' % ', '.join('%d %s' % (n[k], k) for k in (OHNE, AENDERT) if n[k])
    return t


def zahlen_text(a):
    """Kennzahlen eines Postfachs in Worten: Regeln heute, Duplikate, gelöscht, danach, umbenannt, umgestellt."""
    t = 'heute %d Regeln' % a['n_heute']
    if a['n_duplikate']:
        t += ', davon %d Duplikate' % a['n_duplikate']
    if a['weg']:
        t += '  ·  %s' % ('1 Regel wird gelöscht' if len(a['weg']) == 1 else '%d Regeln werden gelöscht' % len(a['weg']))
    return t + '  ·  danach %d  ·  %d umbenannt  ·  %d umgestellt' % (a['n_danach'], a['n_umbenannt'], len(a['umstellungen']))


def _kurz(t, n):
    t = re.sub(r'\s+', ' ', str(t or '')).strip()
    return t if len(t) <= n else t[:n - 1].rstrip() + '…'


def was_die_regel_macht(g):
    """Bedingungen, Ausnahmen und Aktionen einer Regel in drei kurzen Zeilen."""
    pf = g['postfach']
    bed = [(b, d) for b, d in g['bed']]
    teile = []
    if bed:
        teile.append('WENN ' + ' UND '.join('%s %s' % (b, _kurz(d, 90)) if d else b for b, d in bed))
    else:
        teile.append('BEI JEDER MAIL (keine Bedingung sichtbar)')
    if g['aus']:
        teile.append('AUSSER ' + ' ODER '.join('%s %s' % (b, _kurz(d, 70)) for b, d in g['aus']))
    akt = []
    for b, d in g['akt']:
        if b == 'Keine weiteren Regeln anwenden':
            continue
        d = str(d or '').replace('\\\\' + pf + '\\', '').replace('%2F', '/')
        akt.append('%s %s' % ({'In Ordner verschieben': 'verschieben nach', 'In Ordner kopieren': 'Kopie nach'}.get(
            b, b[:1].lower() + b[1:]), _kurz(d, 70)))
    teile.append('DANN ' + ' + '.join(akt) + (' · danach keine weiteren Regeln' if g.get('stopp') == 'Ja' else ''))
    return '\n'.join(teile)


def hinweise(z):
    """Hinweise zu einer Regel der Liste: Duplikate, Umstellung mit Urteil, greift nie, hinter Sammelregel, ausgeschaltet."""
    rg, hin = z['regel'], []
    if z.get('weg'):
        return ['Wird gelöscht (ohne Ersatz) – %s: %s.' % (z['weg_stufe'], z['weg_grund'])]
    if z['duplikate']:
        hin.append('%d-mal vorhanden (Plätze %s) – %d Duplikate werden gelöscht, die erste bleibt.'
                   % (len(z['duplikate']) + 1, ', '.join(str(x['reihe']) for x in [rg] + z['duplikate']),
                      len(z['duplikate'])))
    if z['bewegt']:
        hin.append('Wird umgestellt: bisher Platz %d (unter den Regeln, die bleiben), künftig Platz %d.'
                   % (z['platz_ohne'], z['platz_neu']) + (' ' + tausch_text(z) if z['tausch'] else ''))
    if z['verdeckt_von'] is not None:
        f = z['verdeckt_von']
        hin.append('Greift nie: Jede Mail, die diese Regel trifft, trifft schon „%s“ (Platz %d) – und die beendet die '
                   'Regelkette. ' % (f['neu'], f['platz_neu'])
                   + ('Beide tun dasselbe, die Regel ist überflüssig.' if wirkung(f['regel']) == wirkung(rg) else
                      'Soll sie greifen, muss sie davor stehen (die speziellere Regel zuerst). Das ändert die Wirkung und '
                      'braucht in der Namensliste „Umstellung gewollt“ = ja.'))
    if z['hinter_sammel'] is not None:
        hin.append('Steht hinter der eingeschalteten Sammelregel „%s“ (laut Outlook ohne Bedingung, beendet die '
                   'Regelkette): greift nur für Mails, die deren Ausnahmen erfüllen.' % z['hinter_sammel']['neu'])
    if rg['aktiv'] != 'Ja':
        hin.append('Ist ausgeschaltet (bleibt so).')
    return hin


def _achtung(z):
    """True, wenn die Regel einen Hinweis trägt, den jemand lesen muss (Wirkung kann sich ändern, Regel greift nie)."""
    if z.get('weg'):
        return z['weg_stufe'] == AENDERT
    return (z['verdeckt_von'] is not None or z['hinter_sammel'] is not None
            or (z['bewegt'] and any(t['stufe'] == PRUEFEN for t in z['tausch'])))


def blatt(g, ws, auftraege):
    """Blatt „Aufräumen“: je Postfach die Regeln in der neuen Reihenfolge mit altem und neuem Namen."""
    F, kopf_fmt, zelle_fmt, zeilen, zeilenhoehe, druck = (g[k] for k in ('F', 'kopf_fmt', 'zelle_fmt', 'zeilen',
                                                                          'zeilenhoehe', 'druck'))
    MUTED, ROTD, GELBL, GELBD, GRAUD, FONT_TITEL = g['MUTED'], g['ROTD'], g['GELBL'], g['GELBD'], g['GRAUD'], g['FONT_TITEL']
    breiten = [8, 8, 44, 50, 7, 90, 56]
    ws.hide_gridlines(2)
    ws.set_tab_color(g['GRUEN'])
    for i, b in enumerate(breiten):
        ws.set_column(i, i, b)
    ws.write(0, 0, 'Aufräumen – neue Namen und Reihenfolge', F(font_name=FONT_TITEL, font_size=20, bold=True, valign='bottom'))
    ws.set_row(0, 34)
    ws.write(1, 0, 'Grundlage des Plans im Blatt Umsetzung: Duplikate und einzelne Regeln löschen, Regeln umbenennen, '
                   'Reihenfolge herstellen. Stand wie im Export; an Bedingungen und Aktionen der Regeln, die bleiben, ändert '
                   'der Plan nichts. Jeder Platztausch und jedes Löschen ist gegen die Logik der Regeln geprüft (Spalte Hinweis).',
             F(font_color=MUTED))
    r = 3
    for a in auftraege:
        text = '%s  ·  %s' % (a['postfach'], zahlen_text(a))
        ws.write(r, 0, text, F(font_name=FONT_TITEL, font_size=13, bold=True, valign='bottom'))
        ws.set_row(r, 26)
        r += 1
        ws.write(r, 0, pruef_text(a) + ('  ·  Platz nach der Nummer im Namen' if a['nach_nummer'] else ''),
                 F(font_color=ROTD if a['verdeckt'] or any(t['stufe'] == PRUEFEN for t in a['tausche'])
                   or any(z['weg_stufe'] == AENDERT for z in a['weg']) else MUTED))
        r += 1
        for c, k in enumerate(['Platz neu', 'Platz heute', 'Name heute', 'Neuer Name', 'Aktiv', 'Was die Regel macht',
                               'Hinweis']):
            ws.write(r, c, k, kopf_fmt('center' if c in (0, 1, 4) else 'left'))
        ws.set_row(r, 24)
        r += 1
        for z in a['zeilen'] + a['weg']:
            rg = z['regel']
            hin = hinweise(z)
            was = was_die_regel_macht(rg)
            ws.write(r, 0, '–' if z['weg'] else z['platz_neu'], zelle_fmt('center'))
            ws.write(r, 1, rg['reihe'], zelle_fmt('center', font_color=MUTED))
            ws.write_string(r, 2, z['name'], zelle_fmt(wrap=True, font_color=MUTED, valign='top'))
            ws.write_string(r, 3, '(wird gelöscht)' if z['weg'] else z['neu'],
                            zelle_fmt(wrap=True, bold=not z['weg'], valign='top',
                                      **({} if z['neu'] != z['name'] and not z['weg'] else {'font_color': MUTED})))
            ws.write(r, 4, rg['aktiv'], zelle_fmt('center', **({} if rg['aktiv'] == 'Ja' else {'font_color': GRAUD})))
            ws.write_string(r, 5, was, zelle_fmt(wrap=True, valign='top', font_size=9))
            ws.write_string(r, 6, ' '.join(hin), zelle_fmt(wrap=True, valign='top', font_size=9,
                                                           **({'font_color': ROTD} if _achtung(z) else
                                                              {'bg_color': GELBL, 'font_color': GELBD} if z['duplikate'] else
                                                              {'font_color': MUTED})))
            n = max(sum(zeilen(x, breiten[5], pt=9) for x in was.split('\n')), zeilen(' '.join(hin), breiten[6], pt=9),
                    zeilen(z['name'], breiten[2]), 1 if z['weg'] else zeilen(z['neu'], breiten[3], fett=True), 2)
            ws.set_row(r, zeilenhoehe(n, pt=9.5, polster=8))
            r += 1
        r += 1
    druck(ws)
    ws.print_area(0, 0, r, len(breiten) - 1)


def liste_schreiben(wb, auftraege, stand=''):
    """Schreibt die Namensliste in die xlsxwriter-Mappe wb: ein Blatt je Postfach, Regeln in der neuen Reihenfolge.

    Die Spalte „Neuer Name“ ist zum Überschreiben gedacht, „Umstellung gewollt“ für das „ja“ zu einer Umstellung, die
    die Wirkung ändern kann, „Löschen“ für das „ja“ zu einer Regel, die ohne Ersatz gehen soll. Alle übrigen Spalten und
    das Blatt „Optimierung“ (Befunde zum Vereinfachen) sind Auskunft und werden beim Lesen nicht ausgewertet."""
    def fmt(**kw):
        return wb.add_format(dict(dict(valign='top', text_wrap=True, border=1, border_color='#E3E7EC'), **kw))
    f_titel = wb.add_format(dict(bold=True, font_size=16))
    f_text = wb.add_format(dict(font_color='#5F6B7A', text_wrap=True, valign='top'))
    f_kopf = fmt(bold=True, bg_color='#1F2933', font_color='#FFFFFF', border_color='#1F2933')
    f_z, f_m, f_grau = fmt(), fmt(align='center'), fmt(font_color='#5F6B7A')
    f_neu = fmt(bg_color='#FFF8DC', bold=True, border_color='#C9A227')
    f_gew = fmt(bg_color='#FFF8DC', align='center', border_color='#C9A227')
    f_aus = fmt(font_color='#8A5A00', align='center')
    f_hin, f_rot = fmt(font_color='#5F6B7A'), fmt(font_color='#8E0F1E')
    breiten = [7, 7, 44, 50, 11, 9, 7, 88, 62]
    for a in auftraege:
        ws = wb.add_worksheet(a['postfach'].split('@')[0][:31])
        ws.hide_gridlines(2)
        for c, b in enumerate(breiten):
            ws.set_column(c, c, b)
        ws.write(0, 0, a['postfach'].split('@')[0] + ' – Namen und Reihenfolge der Regeln', f_titel)
        text = ('Stand des Exports: %s · %s. Gelb ist zum Überschreiben: der neue Name – %s –, „ja“ bei einer Umstellung, die '
                'die Wirkung ändern kann, und „ja“ bei einer Regel, die gelöscht werden soll. %s.'
                % (stand, zahlen_text(a), 'die Nummer vorn bestimmt den Platz' if a['nach_nummer'] else
                   'ohne Nummern vorn gilt die Reihenfolge dieser Zeilen; tragen alle Namen eine Nummer, bestimmt sie den Platz',
                   pruef_text(a)))
        ws.merge_range(1, 0, 1, len(breiten) - 1, text, f_text)
        ws.set_row(1, 44)
        for c, k in enumerate(['Platz neu', 'Platz heute', 'Name heute', 'Neuer Name', 'Umstellung gewollt', 'Löschen',
                               'Aktiv', 'Was die Regel macht', 'Hinweis']):
            ws.write(3, c, k, f_kopf)
        r = 4
        for z in a['zeilen'] + a['weg']:
            rg, hin, was = z['regel'], ' '.join(hinweise(z)), was_die_regel_macht(z['regel'])
            ws.write(r, 0, '–' if z['weg'] else z['platz_neu'], f_m)
            ws.write(r, 1, rg['reihe'], f_m)
            ws.write_string(r, 2, z['name'], f_grau)
            ws.write_string(r, 3, z['neu'], f_neu)
            ws.write_string(r, 4, 'ja' if z['gewollt'] else '', f_gew)
            ws.write_string(r, 5, 'ja' if z['weg'] else '', f_gew)
            ws.write(r, 6, rg['aktiv'], f_m if rg['aktiv'] == 'Ja' else f_aus)
            ws.write_string(r, 7, was, f_z)
            ws.write_string(r, 8, hin, f_rot if _achtung(z) else f_hin)
            n = max(2, sum(1 + len(x) // 105 for x in was.split('\n')), 1 + len(hin) // 72,
                    1 + max(len(z['name']) // 50, len(z['neu']) // 52))
            ws.set_row(r, 13.5 * n + 4)
            r += 1
        ws.freeze_panes(4, 0)
        ws.autofilter(3, 0, r - 1, len(breiten) - 1)
        ws.set_landscape()
        ws.fit_to_pages(1, 0)
    # Befunde zum Vereinfachen: Auskunft, wird beim Lesen der Namensliste nicht ausgewertet
    ws = wb.add_worksheet('Optimierung')
    ws.hide_gridlines(2)
    for c, b in enumerate([24, 16, 62, 84, 78]):
        ws.set_column(c, c, b)
    ws.write(0, 0, 'Vereinfachen – was sich an den Regeln selbst verbessern ließe', f_titel)
    ws.merge_range(1, 0, 1, 4, 'Befunde aus der Logik der Regeln, die bleiben. Der Plan der Mappen ändert am Inhalt einer Regel '
                               'nichts – hier steht, was zu entscheiden wäre. Löschen lässt sich über die Spalte „Löschen“ in '
                               'den Blättern der Postfächer bestellen.', f_text)
    ws.set_row(1, 30)
    for c, k in enumerate(['Postfach', 'Art', 'Regel', 'Befund', 'Vorschlag']):
        ws.write(3, c, k, f_kopf)
    r = 4
    for a in auftraege:
        funde = optimierung(a)
        if not any(f['art'] == 'Zusammenlegen' for f in funde):
            funde.append(dict(art='Zusammenlegen', regel='–',
                              befund='Geprüft: Keine zwei Regeln lassen sich zu einer zusammenlegen, ohne dass sich etwas ändert '
                                     '(gleiche Aktionen und Ausnahmen, Unterschied nur in den Werten einer Bedingung).',
                              vorschlag='–'))
        for f in funde:
            ws.write_string(r, 0, a['postfach'].split('@')[0], f_grau)
            ws.write_string(r, 1, f['art'], f_z)
            ws.write_string(r, 2, f['regel'], f_z)
            ws.write_string(r, 3, f['befund'], f_z)
            ws.write_string(r, 4, f['vorschlag'], f_hin)
            ws.set_row(r, 13.5 * max(1, 1 + len(f['befund']) // 100, 1 + len(f['vorschlag']) // 92, 1 + len(f['regel']) // 72) + 4)
            r += 1
    ws.freeze_panes(4, 0)
    ws.autofilter(3, 0, max(r - 1, 4), 4)
    ws.set_landscape()
    ws.fit_to_pages(1, 0)
