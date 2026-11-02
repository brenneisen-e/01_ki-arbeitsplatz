# -*- coding: utf-8 -*-
"""Baut die Outlook-Regeln-Auswertung (Regeln.xlsx) modern neu auf.

Alle Werte der Vorlage bleiben unveraendert (Zuordnung in ZUORDNUNG / zelle_ziel),
nur Darstellung, Schrift (Aptos) und Farben aendern sich. Neu: Blatt
"Auf einen Blick" mit Kennzahlen (Formeln mit vorberechnetem Wert), Legende,
Gliederung in der Regel-Logik.

Aufruf: python3 -I bau_regeln.py <eingabe.xlsx> <ausgabe.xlsx|ausgabe.xlsm> [--test]

Mit Ziel .xlsm entsteht die Makro-Mappe (Regeln_Umbau.xlsm): zusaetzlich das Blatt "Umsetzung" (Plan, Vorschau,
Ausfuehren) als zweites Blatt, "Ordner" (Ordner-Umstellung) als drittes sowie "Live", "Sicherung", "Ordner-Sicherung" und
"Protokoll"; VBA aus quellen/vba (siehe umbau.py).
--test baut die Testvariante: Outlook-Zugang und Dialoge durch die Attrappe aus quellen/vba_test ersetzt,
Regeln des Exports als Attrappe eingebaut (nur zum Testen, nicht weitergeben).
"""
import math
import re
import sys
import zipfile
import shutil
import os

import openpyxl
import xlsxwriter
from PIL import ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
MAKRO = OUT.lower().endswith('.xlsm')
TEST = '--test' in sys.argv[3:]
if TEST and not MAKRO:
    raise SystemExit('--test nur mit Ziel .xlsm')

# ---------------------------------------------------------------- Palette
INK = '#1F2933'      # Kopfzeilen, Titel
TEXT = '#1F2933'
MUTED = '#5F6B7A'
FAINT = '#9AA3AD'
LINE = '#E3E7EC'     # Zeilentrenner
LINE2 = '#C5CDD6'    # Gruppentrenner
TILE = '#F3F5F8'
REGELBG = '#EEF1F5'
WEISS = '#FFFFFF'
ROT, ROTD, ROTL = '#BF1528', '#8E0F1E', '#FBE9EB'
TEAL, TEALD, TEALL, TEALT = '#0F94A7', '#0B6F7D', '#CCEBED', '#E6F4F5'
INDIGO, INDIGOL = '#3B4F8A', '#E3E7F3'
GRUEN, GRUENL = '#1E7F4F', '#DDF3E4'
GELBD, GELBL = '#8A5A00', '#FBEFC7'
ORANGED, ORANGEL = '#9A4A00', '#FDE8D4'
GRAUD, GRAUL = '#4A5360', '#E9ECF0'

FONT = 'Aptos'
FONT_TITEL = 'Aptos Display'
GROESSE = 10

# Farben je Block / Art / Kategorie (Hintergrund, Schrift)
BLOCK = {
    'WENN': (INDIGOL, INDIGO), 'UND': (INDIGOL, INDIGO),
    'DANN': (TEALL, TEALD), 'UND DANN': (TEALT, TEALD),
    'AUSSER WENN': (GELBL, GELBD),
}
ART = {'Bedingung': (INDIGOL, INDIGO), 'Aktion': (TEALL, TEALD), 'Ausnahme': (GELBL, GELBD)}
BLOCK['ODER'] = (GELBL, GELBD)
KATEGORIE = {
    'Datenabfluss prüfen': (ROTL, ROTD),
    'Nur-lokale Regel': (GELBL, GELBD),
    'Sehr breit': (ORANGEL, ORANGED),
    'Keine Bedingung sichtbar': (ORANGEL, ORANGED),
    'Bedingung nicht lesbar': (ROTL, ROTD),
    'Mehrfachziel': (INDIGOL, INDIGO),
    'Inaktiv': (GRAUL, GRAUD),
}
KATEGORIE_TEXT = {
    'Datenabfluss prüfen': 'Regel leitet Mails weiter oder um – Empfänger und Ziel-Domäne prüfen.',
    'Nur-lokale Regel': 'Läuft nur, wenn genau dieses Outlook geöffnet ist – für ein Gruppenpostfach serverseitige Regel bevorzugen.',
    'Sehr breit': 'Im Export keine Bedingung – entweder greift die Regel bei allen Mails, oder Outlook kann die Bedingung nicht lesen (siehe Hinweis oben).',
    'Keine Bedingung sichtbar': 'Outlook zeigt keine Bedingung – Sammelregel für alle Mails oder in Outlook im Web angelegt.',
    'Bedingung nicht lesbar': 'Outlook liefert die Bedingung nicht (vollständig) – in Outlook im Web prüfen, Einzelheiten im Blatt Diagnose.',
    'Mehrfachziel': 'Regel schreibt in mehrere Ordner, z. B. Arbeitsordner und Archiv.',
    'Inaktiv': 'Regel ist deaktiviert und greift derzeit nicht.',
}

# ---------------------------------------------------------------- Textmass
# Breiten werden mit Liberation Sans gemessen und 8 % aufgeschlagen: Aptos laeuft
# etwas breiter als Arial, so wird eher eine Zeile zu viel als zu wenig reserviert.
_fonts = {}


def _font(pt, fett=False):
    key = (pt, fett)
    if key not in _fonts:
        name = 'LiberationSans-Bold.ttf' if fett else 'LiberationSans-Regular.ttf'
        _fonts[key] = ImageFont.truetype('/usr/share/fonts/truetype/liberation/' + name, size=round(pt * 96 / 72))
    return _fonts[key]


def textbreite(text, pt=GROESSE, fett=False):
    return _font(pt, fett).getlength(text) * 1.03


def spalte_px(breite):
    return int(breite * 7 + 0.5) + 5


def zeilen(text, breite, pt=GROESSE, fett=False):
    """Zeilen, die Excel fuer umbrochenen Text in einer Spalte dieser Breite braucht."""
    if text is None or text == '':
        return 1
    verfuegbar = spalte_px(breite) - 8
    n = 0
    for absatz in str(text).split('\n'):
        woerter = re.split(r'(\s+)', absatz)
        zeile = ''
        n += 1
        for w in woerter:
            probe = zeile + w
            if textbreite(probe.rstrip(), pt, fett) <= verfuegbar or not zeile.strip():
                # Einzelnes Wort laenger als die Spalte: Excel bricht hart um
                while textbreite(probe.strip(), pt, fett) > verfuegbar and len(probe.strip()) > 1:
                    # so viele Zeichen wie passen abschneiden
                    s = probe.strip()
                    k = len(s)
                    while k > 1 and textbreite(s[:k], pt, fett) > verfuegbar:
                        k -= 1
                    n += 1
                    probe = s[k:]
                zeile = probe
            else:
                n += 1
                zeile = w.lstrip()
    return max(n, 1)


def zeilenhoehe(n, pt=GROESSE, polster=7):
    return round(n * pt * 1.36 + polster, 1)


# ---------------------------------------------------------------- Quelle lesen
quelle = openpyxl.load_workbook(SRC)
Q = {}
for ws in quelle:
    Q[ws.title] = {}
    for row in ws.iter_rows():
        for c in row:
            if c.value is not None:
                Q[ws.title][(c.row, c.column)] = c.value


def wert(blatt, r, c):
    return Q[blatt].get((r, c))


def max_zeile(blatt):
    return max(r for r, _ in Q[blatt])


# Zuordnung Quelle -> Ziel (Zeile, Spalte 1-basiert). Standard: gleiche Zelle.
VERSCHOBEN = {('Übersicht', r, 2): ('Übersicht', r, 3) for r in range(2, 6)}

# ---------------------------------------------------------------- Arbeitsmappe
wb = xlsxwriter.Workbook(OUT, {'default_format_properties': {'font_name': FONT, 'font_size': GROESSE}})
wb.set_calc_mode('auto')

_fmt_cache = {}


def F(**kw):
    """Format mit Aptos-Grundlage, zwischengespeichert."""
    basis = {'font_name': FONT, 'font_size': GROESSE, 'font_color': TEXT, 'valign': 'vcenter'}
    basis.update(kw)
    key = tuple(sorted(basis.items()))
    if key not in _fmt_cache:
        _fmt_cache[key] = wb.add_format(basis)
    return _fmt_cache[key]


def CF(**kw):
    return wb.add_format(kw)


def titel(ws, text, r=0, c=0):
    ws.write(r, c, text, F(font_name=FONT_TITEL, font_size=20, bold=True, valign='bottom'))
    ws.set_row(r, 36)


def notiz_fmt():
    return F(font_color=MUTED, font_size=9.5)


def kopf_fmt(align='left'):
    return F(bold=True, font_color=WEISS, bg_color=INK, text_wrap=True, align=align, indent=1 if align == 'left' else 0,
             border=1, border_color=INK)


def zelle_fmt(align='left', wrap=False, **kw):
    d = dict(text_wrap=wrap, align=align, bottom=1, bottom_color=LINE)
    if align == 'left':
        d['indent'] = 1
    d.update(kw)
    return F(**d)


def druck(ws, kopfzeilen=None, quer=True):
    if quer:
        ws.set_landscape()
    ws.set_paper(9)
    ws.fit_to_pages(1, 0)
    ws.set_margins(left=0.4, right=0.4, top=0.5, bottom=0.6)
    ws.set_footer('&L&"Aptos,Regular"&8Outlook-Regeln – &A&R&"Aptos,Regular"&8Seite &P von &N')
    if kopfzeilen is not None:
        ws.repeat_rows(*kopfzeilen)


# Kennzahlen aus den Daten (fuer die vorberechneten Formelwerte)
# Spalten der Uebersicht ueber die Kopfzeile finden: altes Format 13 Spalten (A-M), neues Format (Werkzeug v1.3) 14
# Spalten mit "Bedingung lesbar" in I.
UE = 'Übersicht'
UE_KOPF = min(r for (r, c), v in Q[UE].items() if c == 1 and v == 'Nr')
UE_SPALTEN = {}
for (r, c), v in Q[UE].items():
    if r == UE_KOPF:
        UE_SPALTEN[str(v)] = c
UE_NSP = max(UE_SPALTEN.values())
UE_FELD = {'Nr': 'nr', 'Postfach': 'postfach', 'Reihenfolge': 'reihe', 'Regelname': 'name', 'Aktiv': 'aktiv',
           'Regeltyp': 'typ', 'Gültigkeit': 'gueltig', 'Bedingungen': 'bed', 'Bedingung lesbar': 'lesbar',
           'Ausnahmen': 'aus', 'Aktionen': 'akt', 'Stopp danach': 'stopp', 'Zielordner': 'ziel'}
UE_SP = {}                                   # Feld -> Spalte (1-basiert)
for kopf, c in UE_SPALTEN.items():
    if kopf in UE_FELD:
        UE_SP[UE_FELD[kopf]] = c
    elif kopf.startswith('Logik'):
        UE_SP['logik'] = c
for feld in ('nr', 'postfach', 'reihe', 'name', 'aktiv', 'typ', 'gueltig', 'bed', 'aus', 'akt', 'stopp', 'ziel', 'logik'):
    assert feld in UE_SP, 'Spalte fehlt in der Uebersicht: %s' % feld
NEUES_FORMAT = 'lesbar' in UE_SP
UE_BUCHST = {f: xlsxwriter.utility.xl_col_to_name(c - 1) for f, c in UE_SP.items()}
UE_ERSTE = UE_KOPF + 1
ue_rows = range(UE_ERSTE, max_zeile(UE) + 1)
regeln = [{f: wert(UE, r, c) for f, c in UE_SP.items()} for r in ue_rows]
for g in regeln:
    g.setdefault('lesbar', None)


def lesbar_status(g):
    """'ja' (Bedingung gelesen), 'keine' (Outlook zeigt keine Bedingung), 'nein'/'teilweise' (nicht lesbar),
    'unbekannt' (altes Exportformat ohne Spalte "Bedingung lesbar" und ohne Bedingung im Export)."""
    if not NEUES_FORMAT:
        return 'ja' if g['bed'] else 'unbekannt'
    v = str(g['lesbar'] or '').strip().lower()
    if v == 'ja':
        return 'ja'
    if v.startswith('keine'):
        return 'keine'
    if v.startswith('teil'):
        return 'teilweise'
    return 'nein'


for g in regeln:
    g['status'] = lesbar_status(g)
N_UNBEKANNT = sum(1 for g in regeln if g['status'] in ('unbekannt', 'nein', 'teilweise'))
N_KEINE = sum(1 for g in regeln if g['status'] == 'keine')
ph_rows = range(5, max_zeile('Prüfhinweise') + 1)
hinweise = [(wert('Prüfhinweise', r, 1), wert('Prüfhinweise', r, 2)) for r in ph_rows]
zo_rows = [r for r in range(5, max_zeile('Zielordner') + 1) if wert('Zielordner', r, 1) != 'Summe']
postfaecher = []
for g in regeln:
    if g['postfach'] not in postfaecher:
        postfaecher.append(g['postfach'])

UE_LETZTE = max(ue_rows)
PH_LETZTE = max(ph_rows)
ZO_LETZTE = max(zo_rows)
rg = lambda feld: "'Übersicht'!$%s$%d:$%s$%d" % (UE_BUCHST[feld], UE_ERSTE, UE_BUCHST[feld], UE_LETZTE)
ph = lambda col: "'Prüfhinweise'!$%s$5:$%s$%d" % (col, col, PH_LETZTE)

# ================================================================ Vergleich berechnen
EL = 'Elemente'
BES = [p for p in postfaecher if p.lower().startswith('bestand')][0]
MAK = [p for p in postfaecher if p.lower().startswith('makler')][0]
KURZ = {BES: 'Bestand', MAK: 'Makler'}

REGEL = {}
for g in regeln:
    REGEL[(g['postfach'], g['reihe'])] = dict(g, bed=[], aus=[], akt=[], bed_n=g['bed'], aus_n=g['aus'], akt_n=g['akt'])
EL_KOPF = [wert(EL, 1, k) for k in range(1, 8)]
assert EL_KOPF == ['Postfach', 'Reihenfolge', 'Regelname', 'Aktiv', 'Art', 'Bezeichnung', 'Details'], EL_KOPF
# Pseudo-Eintraege des neuen Exports ("keine Bedingung sichtbar", "Bedingung nicht lesbar") zaehlen in der Uebersicht
# nicht als Bedingung; sie werden nur als Kennzeichen gemerkt.
PSEUDO_BED = ('keine bedingung sichtbar', 'bedingung nicht lesbar', 'weitere bedingung nicht lesbar')
for rr in range(2, max_zeile(EL) + 1):
    pf, n, name, aktiv, art, bez, det = (wert(EL, rr, k) for k in range(1, 8))
    rg_ = REGEL[(pf, n)]
    assert rg_['name'] == name, (pf, n, name)
    if art in ('Bedingung', 'Ausnahme') and str(bez).strip().lower() in PSEUDO_BED:
        rg_.setdefault('pseudo', []).append((art, bez))
        continue
    rg_[{'Bedingung': 'bed', 'Ausnahme': 'aus', 'Aktion': 'akt'}[art]].append((bez, det))
for g in REGEL.values():
    assert (len(g['bed']), len(g['aus'])) == (g['bed_n'], g['aus_n']), g['name']


def woerter(details):
    """Woerter aus einem Detailtext wie '"a", "b"' (Betreff enthaelt ...)."""
    return re.findall(r'"([^"]*)"', details or '')


def bed_det(g, bez, art='bed'):
    """Detailtext der ersten Bedingung/Ausnahme mit dieser Bezeichnung ('' wenn keine)."""
    return next((d or '' for b, d in g[art] if b == bez), '')


def pfad_teile(p):
    m = re.match(r'^\\\\([^\\]+)\\(.*)$', p or '')
    return (m.group(1), m.group(2)) if m else (None, p)


def ordner(g):
    """[(Aktion, Postfach, relativer Pfad)] fuer Verschieben/Kopieren."""
    return [(b, *pfad_teile(d)) for b, d in g['akt'] if b in ('In Ordner verschieben', 'In Ordner kopieren')]


def empfaenger(g):
    return [(b, d) for b, d in g['akt'] if b in ('Umleiten an', 'Weiterleiten an')]


def aktionsarten(g):
    return [b for b, _ in g['akt']]


def bed_text(lst, leer='keine im Export'):
    if not lst:
        return leer
    return '; '.join('%s %s' % (b, d) if d else b for b, d in lst)


def leer_text(g):
    """Text fuer eine Regel ohne Bedingung im Export."""
    return {'keine': 'keine sichtbar', 'nein': 'nicht lesbar', 'teilweise': 'nicht vollständig lesbar'}.get(
        g['status'], 'keine im Export')


def norm_name(n):
    n = re.sub(r'^kopie von\s+', '', str(n).strip().lower())
    return re.sub(r'\s+', ' ', n)


def q(t):
    return '„%s“' % t


bes_regeln = sorted([g for g in REGEL.values() if g['postfach'] == BES], key=lambda g: g['reihe'])
mak_regeln = sorted([g for g in REGEL.values() if g['postfach'] == MAK], key=lambda g: g['reihe'])
idx_m = {}
for g in mak_regeln:
    assert norm_name(g['name']) not in idx_m
    idx_m[norm_name(g['name'])] = g
paare, nur_b, gepaart_m = [], [], set()
for g in bes_regeln:
    m = idx_m.get(norm_name(g['name']))
    if m:
        paare.append((g, m))
        gepaart_m.add(m['reihe'])
    else:
        nur_b.append(g)
nur_m = [g for g in mak_regeln if g['reihe'] not in gepaart_m]


def vergleiche(b, m):
    """Liefert Status, Merkmale (Aktiv, Bedingung, Aktion, Ordner) und Text 'Was ist anders?'."""
    zeilen_ = []
    if b['name'] != m['name']:
        zeilen_.append('Name: Bestand %s · Makler %s' % (q(b['name']), q(m['name'])))
    mk = {}
    mk['Aktiv'] = 'gleich' if b['aktiv'] == m['aktiv'] else 'anders'
    if b['aktiv'] != m['aktiv']:
        zeilen_.append('Aktiv: Bestand %s · Makler %s' % (b['aktiv'], m['aktiv']))
    if b['gueltig'] != m['gueltig']:
        mk['Aktiv'] = 'anders'
        zeilen_.append('Gültigkeit: Bestand %s · Makler %s' % (b['gueltig'], m['gueltig']))
    # "nicht im Export" nur, wenn der Export die Bedingung nicht kennt (altes Format ohne Bedingung bzw. neues Format
    # mit "Bedingung lesbar" = Nein/teilweise); "keine sichtbar" ist eine gelesene, leere Bedingung.
    unbek = lambda g: g['status'] in ('unbekannt', 'nein', 'teilweise')
    if (unbek(b) or unbek(m)) and not b['bed'] and not m['bed'] and not b['aus'] and not m['aus']:
        mk['Bedingung'] = 'nicht im Export'
    elif b['bed'] == m['bed'] and b['aus'] == m['aus'] and not unbek(b) and not unbek(m):
        mk['Bedingung'] = 'gleich'
    elif b['bed'] == m['bed'] and b['aus'] == m['aus']:
        mk['Bedingung'] = 'nicht im Export'
    else:
        mk['Bedingung'] = 'anders'
    if b['bed'] != m['bed']:
        zeilen_.append('Bedingung: Bestand %s · Makler %s' % (bed_text(b['bed'], leer_text(b)), bed_text(m['bed'], leer_text(m))))
    if b['aus'] != m['aus']:
        zeilen_.append('Ausnahme: Bestand %s · Makler %s' % (bed_text(b['aus'], 'keine'), bed_text(m['aus'], 'keine')))
    mk['Aktion'] = 'gleich'
    if aktionsarten(b) != aktionsarten(m):
        mk['Aktion'] = 'anders'
        zeilen_.append('Aktionen: Bestand %s · Makler %s' % (' + '.join(aktionsarten(b)), ' + '.join(aktionsarten(m))))
    if [d for _, d in empfaenger(b)] != [d for _, d in empfaenger(m)]:
        mk['Aktion'] = 'anders'
        zeilen_.append('Empfänger: Bestand %s · Makler %s' % (', '.join(d for _, d in empfaenger(b)) or 'keiner',
                                                              ', '.join(d for _, d in empfaenger(m)) or 'keiner'))
    ob, om = ordner(b), ordner(m)
    rel_b, rel_m = [r_ for _, _, r_ in ob], [r_ for _, _, r_ in om]
    fremd = [(KURZ[g['postfach']], pf_) for g, oo in ((b, ob), (m, om)) for _, pf_, _ in oo
             if pf_ and pf_ != g['postfach']]
    mk['Ordner'] = 'gleich' if rel_b == rel_m and not fremd else 'anders'
    if rel_b != rel_m:
        zeilen_.append('Ordner: Bestand %s · Makler %s' % (
            ', '.join(q(x) if x else '(kein Ordner angegeben)' for x in rel_b) or 'keiner',
            ', '.join(q(x) if x else '(kein Ordner angegeben)' for x in rel_m) or 'keiner'))
    for wer, pf_ in fremd:
        zeilen_.append('Achtung: Zielordner von %s liegt im Postfach %s' % (wer, pf_))
    if mk['Aktiv'] == 'anders' or mk['Bedingung'] == 'anders' or mk['Aktion'] == 'anders':
        status = 'Logik anders'
    elif mk['Ordner'] == 'anders':
        status = 'Nur Ordner anders'
    else:
        status = 'Gleich'
    return status, mk, zeilen_


def verwandt(g, andere):
    """Regeln im anderen Postfach mit gemeinsamer Bedingung oder aehnlichem Namen."""
    import difflib
    treffer = []
    for o in andere:
        gemeinsam = [x for x in g['bed'] if x in o['bed']]
        if gemeinsam:
            treffer.append('%s #%d %s (gleiche Bedingung: %s)' % (KURZ[o['postfach']], o['reihe'], q(o['name']),
                                                                  bed_text(gemeinsam)))
            continue
        a, b_ = norm_name(g['name']), norm_name(o['name'])
        a2, b2 = re.sub(r'\s*\(.*?\)\s*', ' ', a).strip(), re.sub(r'\s*\(.*?\)\s*', ' ', b_).strip()
        if difflib.SequenceMatcher(None, a2, b2).ratio() >= 0.8:
            treffer.append('%s #%d %s (ähnlicher Name)' % (KURZ[o['postfach']], o['reihe'], q(o['name'])))
    return treffer


VERGLEICH = []      # dict(status, name, b, m, mk, text)
for b, m in paare:
    status, mk, zt = vergleiche(b, m)
    VERGLEICH.append(dict(status=status, name=m['name'] if b['name'] != m['name'] else b['name'], b=b, m=m, mk=mk,
                          text='\n'.join(zt) if zt else 'Kein Unterschied im Export.'))
for g in nur_b:
    zt = ['Gibt es nur in Bestandsuebertragungen.'] + ['Verwandt: ' + t for t in verwandt(g, mak_regeln)]
    VERGLEICH.append(dict(status='Nur Bestand', name=g['name'], b=g, m=None, mk={}, text='\n'.join(zt)))
for g in nur_m:
    zt = ['Gibt es nur in Maklerauftraege.'] + ['Verwandt: ' + t for t in verwandt(g, bes_regeln)]
    VERGLEICH.append(dict(status='Nur Makler', name=g['name'], b=None, m=g, mk={}, text='\n'.join(zt)))
STATUS_REIHE = ['Logik anders', 'Nur Ordner anders', 'Nur Bestand', 'Nur Makler', 'Gleich']
STATUS_FARBE = {
    'Logik anders': (ROTL, ROTD), 'Nur Ordner anders': (INDIGOL, INDIGO), 'Nur Bestand': (TEALL, TEALD),
    'Nur Makler': ('#ECE6F5', '#5B3E96'), 'Gleich': (GRUENL, GRUEN),
}
STATUS_TEXT = {
    'Logik anders': 'In beiden Postfächern, aber Bedingung, Aktion oder Aktiv-Status unterscheiden sich.',
    'Nur Ordner anders': 'Gleiche Logik, nur die Zielordner heißen anders.',
    'Nur Bestand': 'Regel gibt es nur in Bestandsuebertragungen.',
    'Nur Makler': 'Regel gibt es nur in Maklerauftraege.',
    'Gleich': 'Im Export identisch (Ordner ohne Postfachnamen verglichen).',
}
VERGLEICH.sort(key=lambda v: (STATUS_REIHE.index(v['status']),
                              (v['m'] or v['b'])['reihe'] if v['status'] != 'Nur Bestand' else v['b']['reihe']))
N_OHNE_BED = sum(1 for g in regeln if not g['bed'])


def namen_liste(liste, n=3):
    namen = [q(g['name']) for g in liste]
    return '; '.join(namen[:n]) + (' und %d weitere' % (len(namen) - n) if len(namen) > n else '')


# Hinweis zu Regeln ohne (lesbare) Bedingung - je nach Exportformat
if not NEUES_FORMAT:
    HINWEIS_BEDINGUNGEN = ('Hinweis: Bei %d von %d Regeln enthält der Export keine Bedingung – auch bei den Regeln für '
                           'automatische Antworten. Für die Umsetzung ist das egal: Mit „Kopieren…“ nimmt Outlook die '
                           'Bedingungen vollständig mit.' % (N_OHNE_BED, len(regeln)))
    if MAKRO:
        HINWEIS_BEDINGUNGEN += (' Für das Makro heißt das: Speichern bleibt gesperrt, bis die Regeln als .rwz exportiert '
                                'sind (Blatt Umsetzung › Einstellungen); Regeln ohne lesbare Bedingung werden einmal in '
                                'Outlook kopiert.')
    HINWEIS_VERGLEICH = ('Achtung: Bei %d von %d Regeln enthält der Export keine Bedingung – auch bei den Regeln für '
                         'automatische Antworten. Dort steht in der Spalte „Bedingung“ „nicht im Export“: ob sich die '
                         'Bedingungen unterscheiden, zeigt nur Outlook. Beim Übernehmen mit „Kopieren…“ kommen sie '
                         'vollständig mit.' % (N_OHNE_BED, len(regeln)))
else:
    _keine = [g for g in regeln if g['status'] == 'keine']
    _unles = [g for g in regeln if g['status'] in ('nein', 'teilweise')]
    HINWEIS_BEDINGUNGEN = 'Hinweis: Der Export enthält die Bedingungen aller Regeln%s.' % (
        '' if not _unles else ' außer %d (nicht lesbar: %s – Blatt Diagnose)' % (len(_unles), namen_liste(_unles)))
    if _keine:
        HINWEIS_BEDINGUNGEN += (' Bei %d von %d Regeln zeigt Outlook keine Bedingung (Spalte „Bedingung lesbar“ = „keine '
                                'sichtbar“), z. B. %s: Sammelregel für alle übrigen Mails oder in Outlook im Web '
                                'angelegt.' % (len(_keine), len(regeln), namen_liste(_keine, 2)))
        if MAKRO:
            HINWEIS_BEDINGUNGEN += (' Das Makro speichert ein Postfach mit solchen Regeln nur nach ausdrücklicher '
                                    'Bestätigung (Blatt Umsetzung).')
    HINWEIS_VERGLEICH = ('Bedingungen laut Export lesbar%s. „keine sichtbar“: Outlook zeigt für die Regel keine Bedingung '
                         '(%d Regeln) – Sammelregel oder in Outlook im Web angelegt. „nicht im Export“ nur, wenn die '
                         'Bedingung laut Spalte „Bedingung lesbar“ nicht gelesen werden konnte.' % (
                             '' if not _unles else ' – außer bei %d Regeln (Blatt Diagnose)' % len(_unles), len(_keine)))

# ================================================================ Anlegen (Bestandsuebertragungen)


def R(pf, n):
    return REGEL[(pf, n)]


def finde(pf, name):
    t = [g for g in REGEL.values() if g['postfach'] == pf and g['name'] == name]
    assert len(t) == 1, (pf, name)
    return t[0]


def b_pfad(rel):
    return '\\\\%s\\%s' % (BES, rel)


def akt_text(g, ersatz=None):
    """Aktionen einer Regel als Zeilen; ersatz: {Aktion: neuer Detailtext}."""
    out = []
    for b, d in g['akt']:
        if ersatz and b in ersatz:
            d = ersatz[b]
        out.append('%s %s' % (b, d) if d else b)
    return '\n'.join('+ ' + x if i else x for i, x in enumerate(out))


def empf_kurz(d, n=3):
    """Lange Empfaengerliste ('a; b; c; ...') kurz: erste n Eintraege und Anzahl."""
    teile = [x.strip() for x in (d or '').split(';') if x.strip()]
    if len(teile) <= n + 1:
        return d or ''
    return '%s … (%d Einträge)' % ('; '.join(teile[:n]), len(teile))


def bed_zeilen(lst, kurz=False):
    out = []
    for b, d in lst:
        if kurz and b in ('Absender ist', 'Gesendet an'):
            d = empf_kurz(d)
        out.append('%s %s' % (b, d) if d else b)
    return '\n'.join(out)


def vorbild(g):
    return 'Makler #%d %s' % (g['reihe'], q(g['name']))


def ordner_von(g, aktion='In Ordner verschieben'):
    return next((d for b, d in g['akt'] if b == aktion), None)


B_AA = finde(BES, 'Kopie von Automatische Antworten aussortieren')
B_AA2 = finde(BES, 'Automatische Antworten aussortieren (2)')
M_AA = finde(MAK, 'Automatische Antworten aussortieren')
M_AA2 = finde(MAK, 'Automatische Antworten 1zu1 aussortieren')
M_ESK = finde(MAK, 'Eskalations-GPF in den Prio-Ordner')
B_PRIO = finde(BES, 'Beschwerden/Prio in den Prio-Ordner')
M_PRIO = finde(MAK, 'Beschwerden/Prio in den Prio-Ordner')
B_KVS = finde(BES, 'KV Solo')
M_KVS = finde(MAK, 'KV Solo')
B_EKWAD = finde(BES, 'E - KWAD – Gruppenpostfach')
M_EKWAD = finde(MAK, 'E - KWAD – Gruppenpostfach')
B_FL = finde(BES, 'Umleitung FL Verträge an VSLV3D')
B_CCPI = finde(BES, 'CCPI mit Anlagen "hell"')
M_CCPI = [g for g in mak_regeln if any(x in g['bed'] for x in B_CCPI['bed'] if x[0] == 'Absender ist')][0]
M_ERINN = [g for g in mak_regeln if g['name'].startswith('Erinnerungen')]
M_KVQP = finde(MAK, 'KV@Qualitypool in einen Unterordner')
M_VERW = [g for g in nur_m if any('Vermittlerverwaltung' in (d or '') for b, d in g['akt'] if b == 'Umleiten an')
          and g is not M_CCPI]
B_SERVICE = finde(BES, 'Service Team Vermittlerverwaltung - Makler u Koop - Gruppenpostfach')
B_PVB = finde(BES, 'PVB, Bot 1 (PVBHH-EXTERN)')
B_BOT = finde(BES, 'Mails von BÜ-Bot, Robert (ODPB2D-EXTERN)')
M_BOT = finde(MAK, 'Mails von BÜ-Bot, Robert (ODPB2D-EXTERN)')
M_TECH = finde(MAK, 'Umleitung - Technische Fehler')

# Zielordner fuer automatische Antworten in Bestand: neuer Ordner (Entscheidung des Fachbereichs), richtig geschrieben.
# Der Makler-Ordner heisst mit Tippfehler "Auotmatische Antworten" - wird nicht uebernommen.
AA_ORDNER_REL = 'Archiv\\Automatische Antworten'
aa_ziel = b_pfad(AA_ORDNER_REL)
aa_alt = ordner_von(B_AA)
aa_makler_rel = pfad_teile(ordner_von(M_AA))[1]
prio_ordner = {b: d for b, d in B_PRIO['akt'] if b in ('In Ordner verschieben', 'In Ordner kopieren')}
prio_fehlend = [w for w in woerter(bed_det(M_PRIO, 'Betreff enthält'))
                if w.lower() not in {x.lower() for x in woerter(bed_det(B_PRIO, 'Betreff enthält'))}]
KOPIE = 'kommt beim Kopieren mit (wie Makler #%d) – nicht abtippen'
KOPIERT = 'aus Makler kopieren'

# Soll-Reihenfolge Bestand: (Regelname, Aenderung, bisher #)
SOLL = []
SOLL.append(('Automatische Antworten aussortieren', 'angepasst', B_AA['reihe']))
SOLL.append((M_AA2['name'], KOPIERT, None))
SOLL.append((B_AA2['name'], 'verschoben', B_AA2['reihe']))
erledigt_b = {B_AA['reihe'], B_AA2['reihe']}
for g in bes_regeln:
    if g['reihe'] in erledigt_b:
        continue
    if g is B_PRIO:
        SOLL.append((M_ESK['name'], KOPIERT, None))
    if g is B_PRIO or g is B_KVS or g is B_EKWAD:
        SOLL.append((g['name'], 'angepasst', g['reihe']))
    else:
        SOLL.append((g['name'], 'deaktiviert, unverändert' if g['aktiv'] == 'Nein' else 'unverändert', g['reihe']))
    if g is B_FL:
        for e in M_ERINN:
            SOLL.append((e['name'], 'kopieren, falls benötigt', None))
SOLL_POS = {name: i + 1 for i, (name, _, _) in enumerate(SOLL)}

AUFGABEN = []   # dict(was, regel, pos, vorbild, wenn, ausser, dann, ordner, warum)
AUFGABEN.append(dict(
    was='Anpassen', regel='Automatische Antworten aussortieren\n(bisher #%d %s)' % (B_AA['reihe'], q(B_AA['name'])),
    pos=SOLL_POS['Automatische Antworten aussortieren'], vorbild=vorbild(M_AA),
    wenn=('bleibt – schon identisch mit Makler #%d:\n%s' % (M_AA['reihe'], bed_zeilen(B_AA['bed']))
          if B_AA['bed'] == M_AA['bed'] else 'Bestand: %s\nMakler: %s' % (bed_text(B_AA['bed']), bed_text(M_AA['bed']))),
    ausser=bed_zeilen(B_AA['aus']) or '–',
    dann=akt_text(B_AA, {'In Ordner verschieben': aa_ziel}),
    ordner=aa_ziel,
    warum='Das Ziel zeigt noch ins Postfach Maklerauftraege (%s) – beim Kopieren nicht umgestellt. Neues Ziel ist der '
          'Bestand-Ordner %s (wird angelegt, bewusst richtig geschrieben; der Makler-Ordner heißt „%s“). „Kopie von“ '
          'aus dem Namen streichen.' % (aa_alt, AA_ORDNER_REL, aa_makler_rel.split('\\')[-1])))
AUFGABEN.append(dict(
    was='Aus Makler kopieren', regel=M_AA2['name'], pos=SOLL_POS[M_AA2['name']], vorbild=vorbild(M_AA2),
    wenn=bed_zeilen(M_AA2['bed']) + '\n(kommt beim Kopieren mit)', ausser=bed_zeilen(M_AA2['aus']) or '–',
    dann=akt_text(M_AA2, {'In Ordner verschieben': aa_ziel}), ordner='– (wie oben)',
    warum='Fehlt in Bestand. Bei Makler steht sie direkt hinter %s; gleicher Zielordner wie dort.' % q(M_AA['name'])))
AUFGABEN.append(dict(
    was='Anpassen', regel='%s\n(bisher #%d)' % (B_AA2['name'], B_AA2['reihe']), pos=SOLL_POS[B_AA2['name']],
    vorbild='– (gibt es nur in Bestand)', wenn='unverändert:\n' + bed_zeilen(B_AA2['bed']),
    ausser=bed_zeilen(B_AA2['aus']) or '–', dann=akt_text(B_AA2), ordner='–',
    warum='Regel bleibt (eigene Bedingung, Ziel unverändert) – nur direkt hinter %s schieben. Bisher laufen #%d %s und '
          '#%d %s vorher, beide mit „Keine weiteren Regeln anwenden“.' % (
              q(M_AA2['name']), B_SERVICE['reihe'], q(B_SERVICE['name']), B_PVB['reihe'], q(B_PVB['name']))))
AUFGABEN.append(dict(
    was='Aus Makler kopieren', regel=M_ESK['name'], pos=SOLL_POS[M_ESK['name']], vorbild=vorbild(M_ESK),
    wenn=bed_zeilen(M_ESK['bed']) + '\n(kommt beim Kopieren mit)', ausser=bed_zeilen(M_ESK['aus']) or '–',
    dann=akt_text(M_ESK, prio_ordner), ordner='– (Ordner bestehen, Regel #%d %s nutzt sie)' % (B_PRIO['reihe'], q(B_PRIO['name'])),
    warum='Eskalationen aus diesem Gruppenpostfach landen bei Makler direkt im Prio-Ordner; bei Bestand fehlt die '
          'Regel. Zielordner wie bei Bestand #%d. Position direkt vor %s, wie bei Makler.' % (B_PRIO['reihe'], q(B_PRIO['name']))))
AUFGABEN.append(dict(
    was='Anpassen', regel='%s\n(bisher #%d)' % (B_PRIO['name'], B_PRIO['reihe']), pos=SOLL_POS[B_PRIO['name']],
    vorbild=vorbild(M_PRIO),
    wenn='Betreff enthält %s\n+ %s' % (bed_det(B_PRIO, 'Betreff enthält'), ', '.join('"%s"' % w for w in prio_fehlend)),
    ausser=bed_zeilen(B_PRIO['aus']) or '–', dann=akt_text(B_PRIO), ordner='–',
    warum='Makler #%d prüft im Betreff zusätzlich %s. Fehlende Wörter anhängen, vorhandene bleiben unverändert.' % (
        M_PRIO['reihe'], ', '.join(q(w) for w in prio_fehlend))))
AUFGABEN.append(dict(
    was='Anpassen', regel='%s\n(bisher #%d)' % (B_KVS['name'], B_KVS['reihe']), pos=SOLL_POS[B_KVS['name']],
    vorbild=vorbild(M_KVS), wenn='unverändert:\n' + bed_zeilen(B_KVS['bed']),
    ausser='neu wie Makler #%d:\n%s' % (M_KVS['reihe'], bed_zeilen(M_KVS['aus'], kurz=True)),
    dann=akt_text(B_KVS).replace('Weiterleiten an', 'Umleiten an'), ordner='–',
    warum='Bestand leitet weiter, Makler leitet um – wie Bestand #%d %s. Umleiten behält den ursprünglichen Absender. '
          'Dazu die Ausnahmen von Makler #%d übernehmen; Bestand hat bisher %s.' % (
              B_EKWAD['reihe'], q(B_EKWAD['name']), M_KVS['reihe'],
              'keine' if not B_KVS['aus'] else bed_text(B_KVS['aus']))))
AUFGABEN.append(dict(
    was='Anpassen', regel='%s\n(bisher #%d)' % (B_EKWAD['name'], B_EKWAD['reihe']), pos=SOLL_POS[B_EKWAD['name']],
    vorbild=vorbild(M_EKWAD),
    wenn='keine Bedingung – Sammelregel für alle übrigen Mails' if B_EKWAD['status'] == 'keine' else bed_zeilen(B_EKWAD['bed']),
    ausser='neu wie Makler #%d:\n%s' % (M_EKWAD['reihe'], bed_zeilen(M_EKWAD['aus'], kurz=True)),
    dann=akt_text(B_EKWAD), ordner='–',
    warum='Makler #%d nimmt Unzustellbar-Meldungen, Nachrichtenrückrufe und Papierakten aus; Bestand leitet bisher %s an '
          'KWAD um. Ausnahmen übernehmen, vorhandene bleiben.' % (
              M_EKWAD['reihe'], 'alle übrigen Mails' if not B_EKWAD['aus'] else 'fast alle Mails')))
for e in M_ERINN:
    rel = pfad_teile(ordner_von(e))[1]
    AUFGABEN.append(dict(
        was='Prüfen', regel=e['name'], pos=SOLL_POS[e['name']], vorbild=vorbild(e),
        wenn=bed_zeilen(e['bed']) + '\n(kommt beim Kopieren mit)', ausser=bed_zeilen(e['aus']) or '–',
        dann=akt_text(e, {'In Ordner verschieben': b_pfad(rel)}), ordner=b_pfad(rel),
        warum='Nur kopieren, wenn diese Erinnerungen auch im Postfach Bestandsuebertragungen eingehen (im Plan auf '
              'Ausführen = Nein).'))
AUFGABEN.append(dict(
    was='Klären', regel=M_KVQP['name'], pos='–', vorbild=vorbild(M_KVQP),
    wenn=bed_zeilen(M_KVQP['bed']), ausser=bed_zeilen(M_KVQP['aus']) or '–', dann=akt_text(M_KVQP), ordner='–',
    warum='Schiebt ALLE Mails dieses Absenders ins Archiv, nicht nur Erinnerungen. Nur übernehmen, wenn das für '
          'Bestand gewollt ist – deshalb nicht im Plan.'))
AUFGABEN.append(dict(
    was='Klären', regel='%s\n(bisher #%d)' % (B_CCPI['name'], B_CCPI['reihe']), pos=SOLL_POS[B_CCPI['name']],
    vorbild=vorbild(M_CCPI), wenn='Bestand: ' + bed_text(B_CCPI['bed']) + '\nMakler: ' + bed_text(M_CCPI['bed']),
    ausser='–', dann='Bestand: ' + akt_text(B_CCPI).replace('\n', ' ') + '\nMakler: ' + akt_text(M_CCPI).replace('\n', ' '),
    ordner='–',
    warum='Gleicher Absender, andere Behandlung: Bestand legt Mails mit Anhang im Ordner CCPI ab, Makler leitet alle '
          'Mails an die Vermittlerverwaltung um. Fachlich entscheiden, was für Bestand gelten soll.'))
for g in M_VERW:
    AUFGABEN.append(dict(
        was='Klären', regel=g['name'], pos='–', vorbild=vorbild(g),
        wenn=bed_zeilen(g['bed'], kurz=True), ausser=bed_zeilen(g['aus']) or '–', dann=akt_text(g), ordner='–',
        warum='Makler leitet diese Mails an die Vermittlerverwaltung um; bei Bestand gibt es kein Gegenstück. '
              'Fachlich klären, ob Bestand das braucht.'))
AUFGABEN.append(dict(
    was='Info', regel='%s\n(bisher #%d)' % (B_BOT['name'], B_BOT['reihe']), pos=SOLL_POS[B_BOT['name']],
    vorbild=vorbild(M_BOT), wenn='Bestand: ' + bed_text(B_BOT['bed']) + '\nMakler: ' + bed_text(M_BOT['bed']),
    ausser='–', dann=akt_text(B_BOT), ordner='–',
    warum='Bestand ist bewusst breiter: %d Absender, ohne Betreff-Filter. Kein Handlungsbedarf.' % (
        len([x for x in bed_det(B_BOT, 'Absender ist').split(';') if x.strip()]))))
WAS_FARBE = {'Aus Makler kopieren': (GRUENL, GRUEN), 'Anpassen': (INDIGOL, INDIGO), 'Prüfen': (GELBL, GELBD),
             'Klären': (ORANGEL, ORANGED), 'Info': (GRAUL, GRAUD)}
# Hinweise fuer Maklerauftraege (nicht Teil des Plans)
MAKLER_HINWEISE = []
if M_TECH['aktiv'] == 'Nein' or M_TECH['gueltig'] == 'Nur auf diesem Client' or not ordner_von(M_TECH):
    MAKLER_HINWEISE.append('Makler #%d %s ist %s, läuft %s und hat %s (Outlook zeigt „(Fehler)“).' % (
        M_TECH['reihe'], q(M_TECH['name']), 'deaktiviert' if M_TECH['aktiv'] == 'Nein' else 'aktiv',
        'nur auf einem Client' if M_TECH['gueltig'] == 'Nur auf diesem Client' else 'auf dem Server',
        'keinen Zielordner' if not ordner_von(M_TECH) else 'einen Zielordner'))
if norm_name(B_AA2['name']) not in idx_m:
    MAKLER_HINWEISE.append('Makler fehlt die Bestand-Regel %s (%s, außer %s).' % (
        q(B_AA2['name']), bed_text(B_AA2['bed']), bed_text(B_AA2['aus'], 'keine')))

# ================================================================ Auf einen Blick
st = wb.add_worksheet('Auf einen Blick')
WS_UMSETZUNG = wb.add_worksheet('Umsetzung') if MAKRO else None
WS_ORDNER = wb.add_worksheet('Ordner') if MAKRO else None
st.hide_gridlines(2)
st.set_tab_color(ROT)
st.set_column(0, 0, 2.5)
KACHEL_SP = [1, 3, 5, 7, 9, 11]          # B D F H J L
for c in KACHEL_SP:
    st.set_column(c, c, 23)
    st.set_column(c + 1, c + 1, 2.5)
st.set_row(0, 10)
st.write(1, 1, 'Outlook-Regeln – auf einen Blick', F(font_name=FONT_TITEL, font_size=22, bold=True, valign='bottom'))
st.set_row(1, 38)
untertitel = 'Export vom %s  ·  %s' % (wert(UE, 2, 2), wert(UE, 5, 2))
st.write_formula(2, 1, "=\"Export vom \"&'Übersicht'!$C$2&\"  ·  \"&'Übersicht'!$C$5", F(font_color=MUTED), untertitel)
st.set_row(2, 20)
st.set_row(3, 14)

n_regeln = len(regeln)
n_aktiv = sum(1 for g in regeln if g['aktiv'] == 'Ja')
n_inaktiv = sum(1 for g in regeln if g['aktiv'] == 'Nein')
n_lokal = sum(1 for g in regeln if g['gueltig'] == 'Nur auf diesem Client')
n_ziel = len(zo_rows)
n_hinweis = len(hinweise)
n_abfluss = sum(1 for k, _ in hinweise if k == 'Datenabfluss prüfen')
pf_kurz = {p: ('Bestand' if p.lower().startswith('bestand') else 'Makler' if p.lower().startswith('makler') else p.split('@')[0])
           for p in postfaecher}
cap1 = '  ·  '.join('%s %d' % (pf_kurz[p], sum(1 for g in regeln if g['postfach'] == p)) for p in postfaecher)
cap1_f = '&"  ·  "&'.join('"%s "&COUNTIF(%s,"%s")' % (pf_kurz[p], rg('postfach'), p) for p in postfaecher)

KACHELN = [
    ('Regeln gesamt', '=COUNTA(%s)' % rg('name'), n_regeln, INK, '=' + cap1_f, cap1),
    ('Aktiv', '=COUNTIF(%s,"Ja")' % rg('aktiv'), n_aktiv, GRUEN, '="von "&$B$6&" Regeln"', 'von %d Regeln' % n_regeln),
    ('Deaktiviert', '=COUNTIF(%s,"Nein")' % rg('aktiv'), n_inaktiv, GRAUD, None, 'greifen derzeit nicht'),
    ('Nur lokal', '=COUNTIF(%s,"Nur auf diesem Client")' % rg('gueltig'), n_lokal, GELBD, None, 'nur bei geöffnetem Outlook'),
    ('Zielordner', "=COUNTA('Zielordner'!$B$5:$B$%d)" % ZO_LETZTE, n_ziel, TEALD, None, 'per Verschieben oder Kopieren'),
    ('Prüfhinweise', '=COUNTA(%s)' % ph('A'), n_hinweis, ROT,
     '="davon "&COUNTIF(%s,"Datenabfluss prüfen")&" Datenabfluss"' % ph('A'), 'davon %d Datenabfluss' % n_abfluss),
]
st.set_row(4, 24)
st.set_row(5, 40)
st.set_row(6, 24)
for (label, formel, wertz, farbe, capf, capw), c in zip(KACHELN, KACHEL_SP):
    st.write(4, c, label.upper(), F(bg_color=TILE, font_color=MUTED, font_size=8.5, bold=True, indent=1, valign='bottom'))
    st.write_formula(5, c, formel, F(bg_color=TILE, font_color=farbe, font_size=26, bold=True, indent=1,
                                     font_name=FONT_TITEL, num_format='#,##0'), wertz)
    if capf:
        st.write_formula(6, c, capf, F(bg_color=TILE, font_color=MUTED, font_size=9, indent=1, valign='top'), capw)
    else:
        st.write(6, c, capw, F(bg_color=TILE, font_color=MUTED, font_size=9, indent=1, valign='top'))
st.set_row(7, 22)

# --- Vorab: Zeilenlage der Blaetter Vergleich und Anlegen (fuer die Zaehlformeln)
V_KOPF = 5                       # 0-basiert, Excel-Zeile 6
V_ZEILE = {}                     # id(eintrag) -> 0-basierte Zeile
V_BAND = {}                      # status -> 0-basierte Zeile des Gruppenbands
_z = V_KOPF + 1
for status in STATUS_REIHE:
    grp = [v for v in VERGLEICH if v['status'] == status]
    if not grp:
        continue
    V_BAND[status] = _z
    _z += 1
    for v in grp:
        V_ZEILE[id(v)] = _z
        _z += 1
V_ERSTE, V_LETZTE = V_KOPF + 2, _z          # Excel-Zeilen (1-basiert)
A_KOPF = 9                       # 0-basiert, Excel-Zeile 10
A_ERSTE, A_LETZTE = A_KOPF + 2, A_KOPF + 1 + len(AUFGABEN)
vg = lambda col: "'Vergleich'!$%s$%d:$%s$%d" % (col, V_ERSTE, col, V_LETZTE)
an = lambda col: "'Anlegen'!$%s$%d:$%s$%d" % (col, A_ERSTE, col, A_LETZTE)

r = 8


def abschnitt(r, text):
    st.write(r, 1, text, F(font_name=FONT_TITEL, font_size=13, bold=True, valign='bottom'))
    st.set_row(r, 26)
    return r + 1


def merge_kopf(r, c1, c2, text, align='left'):
    if c1 == c2:
        st.write(r, c1, text, kopf_fmt(align))
    else:
        st.merge_range(r, c1, r, c2, text, kopf_fmt(align))


def link(r, c1, c2, ziel, text, tipp):
    fmt = F(font_color=ROT, bold=True, underline=1, indent=1)
    if c2 > c1:
        st.merge_range(r, c1, r, c2, None, fmt)
    st.write_url(r, c1, "internal:'%s'!A1" % ziel, fmt, text, tipp)


# --- Abschnitt: Bestand vs. Makler
r = abschnitt(r, 'Bestandsuebertragungen im Vergleich zu Maklerauftraege')
merge_kopf(r, 1, 2, 'Vergleich')
merge_kopf(r, 3, 4, 'Regeln', 'center')
merge_kopf(r, 5, 12, 'Bedeutung')
st.set_row(r, 24)
r += 1
for status in STATUS_REIHE:
    bg, fg = STATUS_FARBE[status]
    st.merge_range(r, 1, r, 2, status, F(bg_color=bg, font_color=fg, bold=True, indent=1, border=2, border_color=WEISS))
    st.merge_range(r, 3, r, 4, None, zelle_fmt('center', num_format='#,##0'))
    st.write_formula(r, 3, '=COUNTIF(%s,$B%d)' % (vg('A'), r + 1), zelle_fmt('center', num_format='#,##0'),
                     sum(1 for v in VERGLEICH if v['status'] == status))
    st.merge_range(r, 5, r, 12, STATUS_TEXT[status], zelle_fmt(font_color=MUTED))
    st.set_row(r, 22)
    r += 1
st.merge_range(r, 1, r, 12, HINWEIS_BEDINGUNGEN, F(bg_color=GELBL, font_color=GELBD, font_size=9.5, indent=1, text_wrap=True))
st.set_row(r, max(30, zeilenhoehe(zeilen(HINWEIS_BEDINGUNGEN, 23 * 6 + 2.5 * 5 - 2, pt=9.5), pt=9.5, polster=10)))
r += 1
st.set_row(r, 8)
r += 1
# Umsetzung
merge_kopf(r, 1, 2, 'Umsetzung in Bestand')
merge_kopf(r, 3, 4, 'Aufgaben', 'center')
merge_kopf(r, 5, 12, 'Was heißt das?')
st.set_row(r, 24)
r += 1
WAS_TEXT = {'Aus Makler kopieren': 'Fehlt in Bestand – bei Makler markieren, „Kopieren…“ nach Bestand, dann Zielordner, Name und Position anpassen.',
            'Anpassen': 'Regel gibt es in Bestand schon – Ziel, Aktion oder Position ändern.',
            'Prüfen': 'Erst vergleichen oder klären, ob solche Mails in Bestand eingehen – dann kopieren oder löschen.',
            'Klären': 'Unterschiedliche Behandlung – fachlich entscheiden, bevor etwas angelegt wird.',
            'Info': 'Unterschied ist gewollt – kein Handlungsbedarf, nur zur Einordnung.'}
for was in WAS_FARBE:
    bg, fg = WAS_FARBE[was]
    st.merge_range(r, 1, r, 2, was, F(bg_color=bg, font_color=fg, bold=True, indent=1, border=2, border_color=WEISS))
    st.merge_range(r, 3, r, 4, None, zelle_fmt('center', num_format='#,##0'))
    st.write_formula(r, 3, '=COUNTIF(%s,$B%d)' % (an('B'), r + 1), zelle_fmt('center', num_format='#,##0'),
                     sum(1 for a in AUFGABEN if a['was'] == was))
    st.merge_range(r, 5, r, 12, WAS_TEXT[was], zelle_fmt(font_color=MUTED))
    st.set_row(r, 22)
    r += 1
link(r, 1, 4, 'Vergleich', 'Zum Vergleich', 'Blatt Vergleich öffnen')
link(r, 5, 8, 'Anlegen', 'Zur Liste „Anlegen“', 'Blatt Anlegen öffnen')
if MAKRO:
    link(r, 9, 12, 'Umsetzung', 'Automatisch umsetzen (Makro)', 'Blatt Umsetzung öffnen: Vorschau und Ausführen in Outlook')
st.set_row(r, 24)
r += 2

r = abschnitt(r, 'Je Postfach')
KOPF_PF = [('Postfach', 1, 4, 'left'), ('Regeln', 5, 6, 'center'), ('aktiv', 7, 8, 'center'),
           ('deaktiviert', 9, 10, 'center'), ('Prüfhinweise', 11, 12, 'center')]
for text, c1, c2, al in KOPF_PF:
    merge_kopf(r, c1, c2, text, al)
st.set_row(r, 24)
r += 1
erste_pf = r
for p in postfaecher:
    xr = r + 1  # Excel-Zeile
    st.merge_range(r, 1, r, 4, p, zelle_fmt(bold=True))
    werte = [
        ('=COUNTIF(%s,$B%d)' % (rg('postfach'), xr), sum(1 for g in regeln if g['postfach'] == p)),
        ('=COUNTIFS(%s,$B%d,%s,"Ja")' % (rg('postfach'), xr, rg('aktiv')), sum(1 for g in regeln if g['postfach'] == p and g['aktiv'] == 'Ja')),
        ('=COUNTIFS(%s,$B%d,%s,"Nein")' % (rg('postfach'), xr, rg('aktiv')), sum(1 for g in regeln if g['postfach'] == p and g['aktiv'] == 'Nein')),
        ('=COUNTIF(%s,$B%d)' % (ph('B'), xr), sum(1 for _, b in hinweise if b == p)),
    ]
    for (formel, w), (c1, c2) in zip(werte, [(5, 6), (7, 8), (9, 10), (11, 12)]):
        st.merge_range(r, c1, r, c2, None, zelle_fmt('center', num_format='#,##0'))
        st.write_formula(r, c1, formel, zelle_fmt('center', num_format='#,##0'), w)
    st.set_row(r, 22)
    r += 1
# Gesamt
st.merge_range(r, 1, r, 4, 'Gesamt', F(bold=True, indent=1, top=1, top_color=INK))
sum_werte = [n_regeln, n_aktiv, n_inaktiv, n_hinweis]
for w, (c1, c2) in zip(sum_werte, [(5, 6), (7, 8), (9, 10), (11, 12)]):
    col = xlsxwriter.utility.xl_col_to_name(c1)
    st.merge_range(r, c1, r, c2, None, F(bold=True, align='center', top=1, top_color=INK, num_format='#,##0'))
    st.write_formula(r, c1, '=SUM(%s%d:%s%d)' % (col, erste_pf + 1, col, r), F(bold=True, align='center', top=1,
                                                                                  top_color=INK, num_format='#,##0'), w)
st.set_row(r, 22)
r += 2

# --- Abschnitt: Pruefhinweise nach Kategorie
r = abschnitt(r, 'Prüfhinweise nach Kategorie')
merge_kopf(r, 1, 2, 'Kategorie')
merge_kopf(r, 3, 4, 'Anzahl', 'center')
merge_kopf(r, 5, 12, 'Was bedeutet das?')
st.set_row(r, 24)
r += 1
kategorien = [k for k in KATEGORIE if any(h == k for h, _ in hinweise)]
kategorien += sorted({h for h, _ in hinweise} - set(kategorien))
for k in kategorien:
    bg, fg = KATEGORIE.get(k, (GRAUL, GRAUD))
    st.merge_range(r, 1, r, 2, k, F(bg_color=bg, font_color=fg, bold=True, indent=1, border=2, border_color=WEISS))
    st.merge_range(r, 3, r, 4, None, zelle_fmt('center', num_format='#,##0'))
    st.write_formula(r, 3, '=COUNTIF(%s,$B%d)' % (ph('A'), r + 1), zelle_fmt('center', num_format='#,##0'),
                     sum(1 for h, _ in hinweise if h == k))
    st.merge_range(r, 5, r, 12, KATEGORIE_TEXT.get(k, ''), zelle_fmt(font_color=MUTED))
    st.set_row(r, 22)
    r += 1
r += 1

# --- Abschnitt: Blaetter
r = abschnitt(r, 'Was steht wo?')
merge_kopf(r, 1, 2, 'Blatt')
merge_kopf(r, 3, 12, 'Inhalt')
st.set_row(r, 24)
r += 1
BLAETTER = [
    ('Vergleich', 'Bestandsuebertragungen und Maklerauftraege nebeneinander – je Regel, was gleich und was anders ist.'),
    ('Anlegen', 'Was in Bestandsuebertragungen neu anzulegen oder anzupassen ist, mit Soll-Reihenfolge und Abhakspalte.'),
] + ([
    ('Umsetzung', 'Makro: Plan der Änderungen in Outlook – Vorschau (ändert nichts), Ausführen mit Sicherung, Sperre und Prüfung.'),
    ('Ordner', 'Makro: Ordner beider Postfächer in nummerierte Gruppen im Archiv umstellen – Vorschau, Ausführen, Regeln prüfen, Ordner zurück.'),
] if MAKRO else []) + [
    ('Übersicht', 'Alle Regeln je Postfach in Ausführungsreihenfolge – eine Zeile je Regel mit Kurzlogik und Zielordner. Grau = deaktiviert.'),
    ('Regel-Logik', 'Jede Regel aufgeklappt in WENN, DANN und AUSSER WENN. Über die Gliederung links (1 | 2 | 3) lassen sich Details einklappen.'),
    ('Elemente', 'Jede Bedingung, Ausnahme und Aktion als eigene Zeile – zum Filtern und Suchen.'),
    ('Zielordner', 'In welche Ordner die Regeln Mails verschieben oder kopieren, mit Anzahl der Regeln je Ordner.'),
    ('Prüfhinweise', 'Automatisch erkannte Auffälligkeiten – Grundlage für die fachliche Prüfung, Regel für Regel.'),
] + ([
    ('Diagnose', 'Je Regel, welche Bedingungen und Ausnahmen Outlook liefert (aktive und inaktive Typen) und ob sie lesbar sind.'),
] if 'Diagnose' in Q else []) + ([
    ('Live', 'Stand der Regeln direkt aus Outlook (Knopf „Regeln aus Outlook lesen“) – mit Diagnose, ob Bedingungen lesbar sind.'),
    ('Sicherung', 'Alle Regeln des Zielpostfachs vor jeder Ausführung, mit Zeitpunkt – wird nur ergänzt.'),
    ('Ordner-Sicherung', 'Ordnerliste und Regelziele beider Postfächer vor jeder Ordner-Umstellung und jeder Umzug – Grundlage für „Ordner zurück“.'),
    ('Protokoll', 'Jeder Lauf und jede Änderung in Outlook mit Zeitpunkt.'),
] if MAKRO else [])
link_fmt = F(font_color=ROT, bold=True, underline=1, indent=1, bottom=1, bottom_color=LINE)
for blatt, text in BLAETTER:
    st.merge_range(r, 1, r, 2, None, link_fmt)
    st.write_url(r, 1, "internal:'%s'!A1" % blatt, link_fmt, blatt, 'Zum Blatt %s' % blatt)
    st.merge_range(r, 3, r, 12, text, zelle_fmt(font_color=TEXT))
    st.set_row(r, 22)
    r += 1
r += 1

# --- Abschnitt: Farben
r = abschnitt(r, 'Farben und Markierungen')
LEGENDE = [
    ('WENN  ·  Bedingung', INDIGOL, INDIGO), ('DANN  ·  Aktion', TEALL, TEALD), ('AUSSER WENN  ·  Ausnahme', GELBL, GELBD),
    ('Ja  ·  aktiv', GRUENL, GRUEN), ('Nein  ·  deaktiviert', GRAUL, GRAUD), ('Nur auf diesem Client', GELBL, GELBD),
]
for (text, bg, fg), c in zip(LEGENDE, KACHEL_SP):
    st.write(r, c, text, F(bg_color=bg, font_color=fg, bold=True, align='center', font_size=9, border=2, border_color=WEISS))
st.set_row(r, 24)
druck(st)
st.fit_to_pages(1, 1)
st.print_area(0, 0, r, 12)

# ================================================================ Vergleich
ws = wb.add_worksheet('Vergleich')
ws.hide_gridlines(2)
ws.set_tab_color('#5B3E96')
BREITEN_V = [19, 40, 9, 9, 9, 14, 9, 9, 72, 58, 58]
for i, b in enumerate(BREITEN_V):
    ws.set_column(i, i, b)
titel(ws, 'Bestandsuebertragungen im Vergleich zu Maklerauftraege')
ws.write(1, 0, 'Regeln mit gleichem Namen stehen sich gegenüber („Kopie von“ wird dabei ignoriert). Ordnerpfade werden '
               'ohne Postfachnamen verglichen.', F(font_color=MUTED, font_size=9.5))
ws.set_row(1, 18)
ws.merge_range(2, 0, 2, 10, HINWEIS_VERGLEICH, F(bg_color=GELBL, font_color=GELBD, font_size=9.5, indent=1, text_wrap=True))
ws.set_row(2, 30)
ws.set_row(3, 8)
ws.write(4, 0, 'Spalten Aktiv bis Ordner:  grau = gleich,  rot = anders,  gelb = nicht im Export.  Grau und kursiv: '
               'Regel ist deaktiviert.', F(font_color=MUTED, font_size=9.5))
ws.set_row(4, 18)
KOPF_V = ['Status', 'Regel', 'Bestand #', 'Makler #', 'Aktiv', 'Bedingung', 'Aktion', 'Ordner', 'Was ist anders?',
          'Logik Bestandsuebertragungen', 'Logik Maklerauftraege']
AL_V = ['left', 'left', 'center', 'center', 'center', 'center', 'center', 'center', 'left', 'left', 'left']
for c, t in enumerate(KOPF_V):
    ws.write(V_KOPF, c, t, kopf_fmt(AL_V[c]))
ws.set_row(V_KOPF, 30)
MERKMAL_FMT = {
    'gleich': dict(font_color='#9AA3AD'), 'anders': dict(bg_color=ROTL, font_color=ROTD, bold=True),
    'nicht im Export': dict(bg_color=GELBL, font_color=GELBD, bold=True, font_size=8.5), '–': dict(font_color='#C5CDD6'),
}
for status in STATUS_REIHE:
    grp = [v for v in VERGLEICH if v['status'] == status]
    if not grp:
        continue
    z = V_BAND[status]
    band = F(bold=True, font_color=WEISS, bg_color=INK, indent=1, font_size=10.5)
    ws.merge_range(z, 0, z, 10, '%s  ·  %d %s  –  %s' % (status, len(grp), 'Regel' if len(grp) == 1 else 'Regeln',
                                                          STATUS_TEXT[status]), band)
    ws.set_row(z, 26)
    for v in grp:
        z = V_ZEILE[id(v)]
        bg, fg = STATUS_FARBE[status]
        ws.write(z, 0, status, F(bg_color=bg, font_color=fg, bold=True, indent=1, font_size=9, border=2,
                                 border_color=WEISS))
        ws.write(z, 1, v['name'], zelle_fmt(wrap=True, bold=True))
        for c, g in ((2, v['b']), (3, v['m'])):
            if g is None:
                ws.write(z, c, '–', zelle_fmt('center', font_color='#C5CDD6'))
            elif g['aktiv'] == 'Nein':
                ws.write(z, c, g['reihe'], zelle_fmt('center', font_color=FAINT, italic=True))
            else:
                ws.write(z, c, g['reihe'], zelle_fmt('center', bold=True))
        for c, key in ((4, 'Aktiv'), (5, 'Bedingung'), (6, 'Aktion'), (7, 'Ordner')):
            val = v['mk'].get(key, '–')
            fm = dict(MERKMAL_FMT[val])
            if 'bg_color' in fm:
                fm.update(border=2, border_color=WEISS)
            else:
                fm.update(bottom=1, bottom_color=LINE)
            ws.write(z, c, val, F(align='center', **fm))
        ws.write(z, 8, v['text'], zelle_fmt(wrap=True))
        for c, g in ((9, v['b']), (10, v['m'])):
            if g is None:
                ws.write(z, c, '–', zelle_fmt(font_color='#C5CDD6'))
            else:
                ws.write(z, c, g['logik'], zelle_fmt(wrap=True, font_color=FAINT if g['aktiv'] == 'Nein' else MUTED,
                                                    font_size=9, italic=g['aktiv'] == 'Nein'))
        n = max(zeilen(v['name'], BREITEN_V[1], fett=True), zeilen(v['text'], BREITEN_V[8]),
                zeilen(v['b']['logik'] if v['b'] else '', BREITEN_V[9], pt=9),
                zeilen(v['m']['logik'] if v['m'] else '', BREITEN_V[10], pt=9))
        ws.set_row(z, zeilenhoehe(n))
ws.freeze_panes(V_KOPF + 1, 0)
druck(ws, (V_KOPF, V_KOPF))

# ================================================================ Anlegen
ws = wb.add_worksheet('Anlegen')
ws.hide_gridlines(2)
ws.set_tab_color(GRUEN)
BREITEN_A = [5, 19, 34, 8, 30, 38, 20, 52, 32, 52, 12]
for i, b in enumerate(BREITEN_A):
    ws.set_column(i, i, b)
titel(ws, 'Was ist in Bestandsuebertragungen anzulegen?')
ws.write(1, 0, 'Vorschläge aus dem Vergleich mit Maklerauftraege (Export vom %s). Pfade sind schon auf %s umgestellt.'
         % (wert(UE, 2, 2), BES), F(font_color=MUTED, font_size=9.5))
ws.set_row(1, 18)
ws.merge_range(2, 0, 2, 10, 'Bedingungen nicht abtippen: Regeln bei Maklerauftraege mit „Kopieren…“ nach '
               'Bestandsuebertragungen kopieren – Bedingungen und Ausnahmen kommen vollständig mit (auch die, die der '
               'Export nicht zeigt). Danach nur Zielordner, Name und Position anpassen.',
               F(bg_color=GRUENL, font_color=GRUEN, font_size=9.5, indent=1, text_wrap=True, bold=True))
ws.set_row(2, 30)
ws.write(3, 0, 'So geht’s (Outlook: Datei › Regeln und Benachrichtigungen verwalten)', F(bold=True, font_size=10.5, valign='bottom'))
ws.set_row(3, 22)
SCHRITTE = [
    '1.  Oben „Änderungen in diesem Ordner anwenden: Posteingang [maklerauftraege@ergo.de]“ wählen, die Vorbild-Regel '
    'markieren, „Kopieren…“ klicken und als Ziel „Posteingang [bestandsuebertragungen@ergo.de]“ wählen.',
    '2.  Oben auf „Posteingang [bestandsuebertragungen@ergo.de]“ wechseln, die Kopie markieren, „Regel ändern“: Zielordner '
    'wie in Spalte DANN setzen (Ordner aus „Ordner vorher anlegen“ zuerst anlegen), „Kopie von“ aus dem Namen streichen.',
    '3.  Mit den Pfeilen auf die Soll-Position schieben – die Reihenfolge zählt, weil alle Regeln „Keine weiteren Regeln '
    'anwenden“ setzen (Soll-Reihenfolge unten).',
    '4.  In Spalte „Erledigt“ den Stand eintragen.',
]
for i, t in enumerate(SCHRITTE):
    ws.write(4 + i, 0, t, F(font_color=TEXT, font_size=9.5))
    ws.set_row(4 + i, 16)
ws.set_row(8, 10)
if MAKRO:
    ws.write_url(8, 0, "internal:'Umsetzung'!A1", F(font_color=ROT, bold=True, underline=1, font_size=9.5),
                 'Automatisch umsetzen: Blatt „Umsetzung“ (Makro) – die Vorschau zeigt jeden Schritt, bevor etwas geändert wird.',
                 'Blatt Umsetzung öffnen')
    ws.set_row(8, 22)
KOPF_A = ['Nr', 'Was', 'Regel in Bestandsuebertragungen', 'Soll-Pos.', 'Vorbild in Maklerauftraege', 'WENN (Bedingung)',
          'AUSSER WENN', 'DANN (Aktionen)', 'Ordner vorher anlegen', 'Warum', 'Erledigt']
AL_A = ['center', 'left', 'left', 'center', 'left', 'left', 'left', 'left', 'left', 'left', 'center']
for c, t in enumerate(KOPF_A):
    ws.write(A_KOPF, c, t, kopf_fmt(AL_A[c]))
ws.set_row(A_KOPF, 30)
for i, a in enumerate(AUFGABEN):
    z = A_KOPF + 1 + i
    bg, fg = WAS_FARBE[a['was']]
    ws.write(z, 0, i + 1, zelle_fmt('center', font_color=MUTED, valign='top'))
    ws.write(z, 1, a['was'], F(bg_color=bg, font_color=fg, bold=True, indent=1, font_size=9, border=2,
                               border_color=WEISS, valign='top'))
    texte = [(2, a['regel'], dict(bold=True)), (4, a['vorbild'], {}), (5, a['wenn'], {}), (6, a['ausser'], {}),
             (7, a['dann'], {}), (8, a['ordner'], {}), (9, a['warum'], dict(font_color=MUTED))]
    for c, t, ex in texte:
        if c == 5 and ('Kopieren mit' in str(t) or str(t).startswith('bleibt')):
            ex = dict(font_color=GRUEN, italic=True)
        ws.write(z, c, t, zelle_fmt(wrap=True, valign='top', **ex))
    ws.write(z, 3, a['pos'], zelle_fmt('center', bold=True, valign='top'))
    ws.write(z, 10, 'offen', zelle_fmt('center', valign='top', font_color=MUTED))
    n = max(zeilen(a['regel'], BREITEN_A[2], fett=True), zeilen(a['vorbild'], BREITEN_A[4]),
            zeilen(a['wenn'], BREITEN_A[5]), zeilen(a['ausser'], BREITEN_A[6]), zeilen(a['dann'], BREITEN_A[7]),
            zeilen(a['ordner'], BREITEN_A[8]), zeilen(a['warum'], BREITEN_A[9]))
    ws.set_row(z, zeilenhoehe(n, polster=10))
erl = 'K%d:K%d' % (A_ERSTE, A_LETZTE)
ws.data_validation(erl, {'validate': 'list', 'source': ['offen', 'erledigt', 'verworfen'],
                         'input_title': 'Stand', 'input_message': 'offen, erledigt oder verworfen'})
ws.conditional_format(erl, {'type': 'cell', 'criteria': '==', 'value': '"erledigt"',
                            'format': CF(bg_color=GRUENL, font_color=GRUEN, bold=True)})
ws.conditional_format(erl, {'type': 'cell', 'criteria': '==', 'value': '"verworfen"',
                            'format': CF(bg_color=GRAUL, font_color=GRAUD, italic=True)})
ws.conditional_format('A%d:J%d' % (A_ERSTE, A_LETZTE), {'type': 'formula', 'criteria': '=$K%d="erledigt"' % A_ERSTE,
                                                        'format': CF(font_color=FAINT)})

# Soll-Reihenfolge
z = A_LETZTE + 1
ws.set_row(z - 1, 14)
ws.write(z, 0, 'Soll-Reihenfolge in Bestandsuebertragungen nach der Umsetzung',
         F(font_name=FONT_TITEL, font_size=13, bold=True, valign='bottom'))
ws.set_row(z, 30)
z += 1
ws.write(z, 0, 'Pos.', kopf_fmt('center'))
ws.write(z, 1, 'Änderung', kopf_fmt())
ws.merge_range(z, 2, z, 4, 'Regel', kopf_fmt())
ws.write(z, 5, 'bisher #', kopf_fmt())
ws.set_row(z, 26)
SOLL_FARBE = {KOPIERT: (GRUENL, GRUEN), 'kopieren, falls benötigt': (GELBL, GELBD), 'angepasst': (INDIGOL, INDIGO),
              'prüfen, ggf. löschen': (GELBL, GELBD), 'deaktiviert, unverändert': (GRAUL, GRAUD),
              'verschoben': (INDIGOL, INDIGO)}
for i, (name, aend, bisher) in enumerate(SOLL):
    z += 1
    ws.write(z, 0, i + 1, zelle_fmt('center', bold=True))
    if aend in SOLL_FARBE:
        bg, fg = SOLL_FARBE[aend]
        ws.write(z, 1, aend, F(bg_color=bg, font_color=fg, bold=True, indent=1, font_size=8.5, border=2,
                               border_color=WEISS, text_wrap=True))
    else:
        ws.write(z, 1, aend, zelle_fmt(font_color='#9AA3AD', font_size=9))
    ws.merge_range(z, 2, z, 4, name, zelle_fmt(bold=aend != 'unverändert' and not aend.startswith('deaktiviert'),
                                               font_color=FAINT if aend.startswith('deaktiviert') else TEXT))
    ws.write(z, 5, bisher if bisher is not None else '–', zelle_fmt(font_color=MUTED))
    ws.set_row(z, 22 if len(aend) < 15 else 26)
z += 1
ws.write(z, 0, 'Werden die Erinnerungsregeln nicht gebraucht, rücken die folgenden Regeln entsprechend nach oben.',
         F(font_color=MUTED, font_size=9.5, italic=True))
if MAKLER_HINWEISE:
    z += 2
    ws.write(z, 0, 'Hinweise für Maklerauftraege (nicht Teil des Plans)', F(font_name=FONT_TITEL, font_size=13, bold=True,
                                                                          valign='bottom'))
    ws.set_row(z, 30)
    for t in MAKLER_HINWEISE:
        z += 1
        ws.write(z, 0, '–', zelle_fmt('center', font_color=MUTED))
        ws.merge_range(z, 1, z, 7, t, zelle_fmt(wrap=True))
        ws.set_row(z, zeilenhoehe(zeilen(t, sum(BREITEN_A[1:8]))))
ws.freeze_panes(A_KOPF + 1, 0)
druck(ws, (A_KOPF, A_KOPF))

# ================================================================ Übersicht
ws = wb.add_worksheet(UE)
ws.hide_gridlines(2)
ws.set_tab_color(INK)
# Spalten ueber die Kopfzeile (altes Format 13, neues 14 Spalten)
UE_BREITE = {'nr': 6, 'postfach': 30, 'reihe': 12, 'name': 42, 'aktiv': 8, 'typ': 11, 'gueltig': 21, 'bed': 12,
             'lesbar': 13, 'aus': 11, 'akt': 9, 'stopp': 9, 'ziel': 50, 'logik': 90}
UE_ALIGN = {'nr': 'center', 'reihe': 'center', 'aktiv': 'center', 'typ': 'center', 'bed': 'center', 'lesbar': 'center',
            'aus': 'center', 'akt': 'center', 'stopp': 'center'}
UE_FELD_AN = {c: f for f, c in UE_SP.items()}          # Spalte (1-basiert) -> Feld
BREITEN_UE = [UE_BREITE.get(UE_FELD_AN.get(c), 12) for c in range(1, UE_NSP + 1)]
KOPF_ALIGN_UE = [UE_ALIGN.get(UE_FELD_AN.get(c), 'left') for c in range(1, UE_NSP + 1)]
for i, b in enumerate(BREITEN_UE):
    ws.set_column(i, i, b)
titel(ws, wert(UE, 1, 1))
for rr in range(2, UE_KOPF - 1):
    ws.write(rr - 1, 0, wert(UE, rr, 1), F(font_color=MUTED, font_size=9.5))
    v = wert(UE, rr, 2)
    ws.write(rr - 1, 2, v, F(font_color=TEXT, bold=(rr == 4), align='left'))
    ws.set_row(rr - 1, 17)
ws.set_row(UE_KOPF - 2, 12)
for c in range(UE_NSP):
    ws.write(UE_KOPF - 1, c, wert(UE, UE_KOPF, c + 1), kopf_fmt(KOPF_ALIGN_UE[c]))
ws.set_row(UE_KOPF - 1, 30)
WRAP_UE = {UE_SP['name'] - 1, UE_SP['ziel'] - 1, UE_SP['logik'] - 1}
MUTED_UE = {UE_SP[f] - 1 for f in ('nr', 'postfach', 'reihe', 'typ', 'gueltig', 'stopp')}
vorher_pf = None
for rr in ue_rows:
    neue_gruppe = vorher_pf is not None and wert(UE, rr, UE_SP['postfach']) != vorher_pf
    vorher_pf = wert(UE, rr, UE_SP['postfach'])
    n = 1
    for c in range(UE_NSP):
        v = wert(UE, rr, c + 1)
        al = KOPF_ALIGN_UE[c]
        wrap = c in WRAP_UE
        extra = {}
        if neue_gruppe:
            extra.update(top=2, top_color=LINE2)
        if c in MUTED_UE:
            extra.setdefault('font_color', MUTED)
        if c == UE_SP['name'] - 1:
            extra['bold'] = True
        fmt = zelle_fmt(al, wrap, valign='vcenter', **extra)
        if v is None:
            ws.write_blank(rr - 1, c, None, fmt)
        else:
            ws.write(rr - 1, c, v, fmt)
        if wrap and v is not None:
            n = max(n, zeilen(v, BREITEN_UE[c], fett=(c == UE_SP['name'] - 1)))
    ws.set_row(rr - 1, zeilenhoehe(n))
LETZTE_SP_UE = xlsxwriter.utility.xl_col_to_name(UE_NSP - 1)
bereich = 'A%d:%s%d' % (UE_ERSTE, LETZTE_SP_UE, UE_LETZTE)
sp_ue = lambda f: '%s%d:%s%d' % (UE_BUCHST[f], UE_ERSTE, UE_BUCHST[f], UE_LETZTE)
# Pills und Hervorhebungen
ws.conditional_format(sp_ue('aktiv'), {'type': 'cell', 'criteria': '==', 'value': '"Ja"',
                                       'format': CF(font_color=GRUEN, bold=True)})
ws.conditional_format(sp_ue('aktiv'), {'type': 'cell', 'criteria': '==', 'value': '"Nein"',
                                       'format': CF(bg_color=GRAUL, font_color=GRAUD, bold=True)})
ws.conditional_format(sp_ue('gueltig'), {'type': 'cell', 'criteria': '==', 'value': '"Nur auf diesem Client"',
                                         'format': CF(bg_color=GELBL, font_color=GELBD, bold=True)})
for f in ('bed', 'aus', 'akt'):
    ws.conditional_format(sp_ue(f), {'type': 'cell', 'criteria': '==', 'value': 0, 'format': CF(font_color='#B7BEC7')})
if NEUES_FORMAT:
    ws.conditional_format(sp_ue('lesbar'), {'type': 'cell', 'criteria': '==', 'value': '"Ja"',
                                            'format': CF(font_color=GRUEN)})
    ws.conditional_format(sp_ue('lesbar'), {'type': 'text', 'criteria': 'begins with', 'value': 'keine',
                                            'format': CF(bg_color=ORANGEL, font_color=ORANGED, bold=True)})
    ws.conditional_format(sp_ue('lesbar'), {'type': 'text', 'criteria': 'begins with', 'value': 'Nein',
                                            'format': CF(bg_color=ROTL, font_color=ROTD, bold=True)})
    ws.conditional_format(sp_ue('lesbar'), {'type': 'text', 'criteria': 'begins with', 'value': 'teil',
                                            'format': CF(bg_color=ROTL, font_color=ROTD, bold=True)})
ws.conditional_format(bereich, {'type': 'formula', 'criteria': '=$%s%d="Nein"' % (UE_BUCHST['aktiv'], UE_ERSTE),
                                'format': CF(font_color=FAINT, italic=True)})
ws.freeze_panes(UE_KOPF, 0)
ws.autofilter('A%d:%s%d' % (UE_KOPF, LETZTE_SP_UE, UE_LETZTE))
druck(ws, (UE_KOPF - 1, UE_KOPF - 1))

# ================================================================ Regel-Logik
RL = 'Regel-Logik'
ws = wb.add_worksheet(RL)
ws.hide_gridlines(2)
ws.set_tab_color(INDIGO)
BREITEN_RL = [28, 6, 13, 48, 100]
for i, b in enumerate(BREITEN_RL):
    ws.set_column(i, i, b)
titel(ws, wert(RL, 1, 1))
ws.write(1, 0, wert(RL, 2, 1), F(font_color=MUTED, font_size=9.5, bold=True))
legende = wert(RL, 2, 2) or ''
ws.merge_range(1, 1, 1, 4, legende, F(font_color=MUTED, font_size=9.5, text_wrap=True, valign='top'))
ws.set_row(1, max(18, zeilenhoehe(zeilen(legende, sum(BREITEN_RL[1:5]) - 2, pt=9.5), pt=9.5, polster=4)))
ws.write(2, 0, 'Grau = deaktivierte Regel ([INAKTIV]).  Über die Gliederung links (1 | 2 | 3) lassen sich Postfächer und '
               'Regel-Details ein- und ausklappen.', F(font_color=MUTED, font_size=9.5))
ws.set_row(2, 18)
ws.set_row(3, 26)
KOPF_ALIGN_RL = ['left', 'center', 'center', 'left', 'left']
for c in range(5):
    ws.write(3, c, wert(RL, 4, c + 1), kopf_fmt(KOPF_ALIGN_RL[c]))
ws.outline_settings(True, False, False, False)

letzte_rl = max_zeile(RL)
inaktiv_block = False
im_postfach = False
for rr in range(5, letzte_rl + 1):
    a, b, c, d, e = (wert(RL, rr, k) for k in range(1, 6))
    z = rr - 1
    if a is not None and str(a).startswith('POSTFACH:'):
        im_postfach = True
        sec = F(bold=True, font_color=WEISS, bg_color=INK, font_size=11, indent=1)
        ws.write(z, 0, a, sec)
        for k in range(1, 5):
            ws.write_blank(z, k, None, sec)
        ws.set_row(z, 28)
        continue
    if c == 'REGEL':
        inaktiv_block = '[INAKTIV]' in str(d or '')
        bg = REGELBG
        ink = FAINT if inaktiv_block else TEXT
        rand = dict(top=1, top_color=LINE2)
        ws.write(z, 0, a, F(bg_color=bg, font_color=FAINT if inaktiv_block else MUTED, font_size=9, indent=1, **rand))
        ws.write(z, 1, b, F(bg_color=bg, font_color=ink, bold=True, align='center', **rand))
        ws.write(z, 2, c, F(bg_color=GRAUL if inaktiv_block else INK, font_color=GRAUD if inaktiv_block else WEISS,
                            bold=True, font_size=8.5, align='center', top=2, bottom=2, left=2, right=2,
                            top_color=bg, bottom_color=bg, left_color=bg, right_color=bg))
        ws.write(z, 3, d, F(bg_color=bg, font_color=ink, bold=True, text_wrap=True, indent=1, **rand))
        ws.write(z, 4, e, F(bg_color=bg, font_color=FAINT if inaktiv_block else MUTED, font_size=9, text_wrap=True,
                            indent=1, **rand))
        n = max(zeilen(d, BREITEN_RL[3], fett=True), zeilen(e, BREITEN_RL[4], pt=9))
        ws.set_row(z, zeilenhoehe(n, polster=9), None, {'level': 1})
        continue
    if c is None and d is None and e is None and a is None and b is None:
        ws.set_row(z, 7, None, {'level': 1} if im_postfach and rr < letzte_rl else {})
        continue
    # Detailzeile
    bgc, fgc = BLOCK.get(c, (GRAUL, GRAUD))
    if inaktiv_block:
        bgc, fgc = GRAUL, FAINT
    ink = FAINT if inaktiv_block else TEXT
    ws.write_blank(z, 0, None, F())
    ws.write_blank(z, 1, None, F())
    ws.write(z, 2, c, F(bg_color=bgc, font_color=fgc, bold=True, font_size=8.5, align='center',
                        top=2, bottom=2, left=2, right=2, top_color=WEISS, bottom_color=WEISS,
                        left_color=WEISS, right_color=WEISS))
    # Neues Exportformat: Bezeichnung "keine Bedingung sichtbar" / "... nicht lesbar" gelb hinterlegt (wie im Export)
    unlesbar = str(d or '').lower().startswith('keine bedingung sichtbar') or 'nicht lesbar' in str(d or '').lower()
    ws.write(z, 3, d, F(font_color=GELBD if unlesbar else ink, bg_color=GELBL if unlesbar else WEISS, bold=unlesbar,
                        text_wrap=True, indent=1, bottom=1, bottom_color=LINE))
    if e is None:
        ws.write_blank(z, 4, None, F(bottom=1, bottom_color=LINE))
    else:
        ws.write(z, 4, e, F(font_color=ink, text_wrap=True, indent=1, bottom=1, bottom_color=LINE))
    n = max(zeilen(d, BREITEN_RL[3]), zeilen(e, BREITEN_RL[4]))
    ws.set_row(z, zeilenhoehe(n), None, {'level': 2})
ws.freeze_panes(4, 0)
druck(ws, (3, 3))

# ================================================================ Elemente
EL = 'Elemente'
ws = wb.add_worksheet(EL)
ws.hide_gridlines(2)
ws.set_tab_color('#6B7685')
BREITEN_EL = [29, 9, 40, 8, 11, 34, 80]
for i, b in enumerate(BREITEN_EL):
    ws.set_column(i, i, b)
KOPF_ALIGN_EL = ['left', 'center', 'left', 'center', 'center', 'left', 'left']
for c in range(7):
    ws.write(0, c, wert(EL, 1, c + 1), kopf_fmt(KOPF_ALIGN_EL[c]))
ws.set_row(0, 30)
letzte_el = max_zeile(EL)
vorher = None
for rr in range(2, letzte_el + 1):
    schluessel = (wert(EL, rr, 1), wert(EL, rr, 2))
    neue_gruppe = vorher is not None and schluessel != vorher
    pf_wechsel = vorher is not None and schluessel[0] != vorher[0]
    vorher = schluessel
    n = 1
    for c in range(7):
        v = wert(EL, rr, c + 1)
        extra = {}
        if pf_wechsel:
            extra.update(top=2, top_color=LINE2)
        elif neue_gruppe:
            extra.update(top=1, top_color=LINE2)
        if c in (0, 1):
            extra['font_color'] = MUTED
        wrap = c in (2, 5, 6)
        fmt = zelle_fmt(KOPF_ALIGN_EL[c], wrap, **extra)
        if v is None:
            ws.write_blank(rr - 1, c, None, fmt)
        else:
            ws.write(rr - 1, c, v, fmt)
            if wrap:
                n = max(n, zeilen(v, BREITEN_EL[c]))
    ws.set_row(rr - 1, zeilenhoehe(n))
for art, (bg, fg) in ART.items():
    ws.conditional_format('E2:E%d' % letzte_el, {'type': 'cell', 'criteria': '==', 'value': '"%s"' % art,
                                                 'format': CF(bg_color=bg, font_color=fg, bold=True)})
ws.conditional_format('D2:D%d' % letzte_el, {'type': 'cell', 'criteria': '==', 'value': '"Ja"',
                                             'format': CF(font_color=GRUEN, bold=True)})
ws.conditional_format('D2:D%d' % letzte_el, {'type': 'cell', 'criteria': '==', 'value': '"Nein"',
                                             'format': CF(bg_color=GRAUL, font_color=GRAUD, bold=True)})
ws.conditional_format('A2:G%d' % letzte_el, {'type': 'formula', 'criteria': '=$D2="Nein"',
                                             'format': CF(font_color=FAINT, italic=True)})
ws.freeze_panes(1, 0)
ws.autofilter('A1:G%d' % letzte_el)
druck(ws, (0, 0))

# ================================================================ Zielordner
ZO = 'Zielordner'
ws = wb.add_worksheet(ZO)
ws.hide_gridlines(2)
ws.set_tab_color(TEAL)
BREITEN_ZO = [29, 72, 12, 11, 80]
for i, b in enumerate(BREITEN_ZO):
    ws.set_column(i, i, b)
titel(ws, wert(ZO, 1, 1))
ws.write(1, 0, wert(ZO, 2, 1), F(font_color=MUTED, font_size=9.5))
ws.write(2, 0, 'Balken = Anzahl Regeln je Ordner.  Gelb in „davon aktiv“: nicht alle Regeln dieses Ordners sind aktiv.',
         F(font_color=MUTED, font_size=9.5))
ws.set_row(1, 18)
ws.set_row(2, 18)
KOPF_ALIGN_ZO = ['left', 'left', 'center', 'center', 'left']
for c in range(5):
    ws.write(3, c, wert(ZO, 4, c + 1), kopf_fmt(KOPF_ALIGN_ZO[c]))
ws.set_row(3, 30)
vorher_pf = None
for rr in zo_rows:
    pf_wechsel = vorher_pf is not None and wert(ZO, rr, 1) != vorher_pf
    vorher_pf = wert(ZO, rr, 1)
    n = 1
    for c in range(5):
        v = wert(ZO, rr, c + 1)
        extra = {'top': 2, 'top_color': LINE2} if pf_wechsel else {}
        if c == 0:
            extra['font_color'] = MUTED
        wrap = c in (1, 4)
        fmt = zelle_fmt(KOPF_ALIGN_ZO[c], wrap, **extra)
        if v is None:
            ws.write_blank(rr - 1, c, None, fmt)
        else:
            ws.write(rr - 1, c, v, fmt)
            if wrap:
                n = max(n, zeilen(v, BREITEN_ZO[c]))
    ws.set_row(rr - 1, zeilenhoehe(n))
# Summenzeile (in der Vorlage fester Wert 54 -> jetzt Formel, gleicher Wert; zaehlt nur sichtbare Zeilen)
sum_zeile = [r for r in range(5, max_zeile(ZO) + 1) if wert(ZO, r, 1) == 'Summe'][0]
sz = sum_zeile - 1
sfmt = F(bold=True, top=2, top_color=INK, indent=1)
ws.write(sz, 0, 'Summe', sfmt)
ws.write_blank(sz, 1, None, sfmt)
ws.write_formula(sz, 2, '=SUBTOTAL(109,C5:C%d)' % ZO_LETZTE, F(bold=True, top=2, top_color=INK, align='center'),
                 wert(ZO, sum_zeile, 3))
ws.write_formula(sz, 3, '=SUBTOTAL(109,D5:D%d)' % ZO_LETZTE, F(bold=True, top=2, top_color=INK, align='center'),
                 sum(wert(ZO, r, 4) for r in zo_rows))
ws.write_blank(sz, 4, None, sfmt)
ws.set_row(sz, 24)
ws.conditional_format('C5:C%d' % ZO_LETZTE, {'type': 'data_bar', 'bar_color': '#7FCBD4', 'bar_solid': True,
                                            'bar_border_color': '#7FCBD4', 'min_type': 'num', 'min_value': 0,
                                            'bar_direction': 'left'})
ws.conditional_format('D5:D%d' % ZO_LETZTE, {'type': 'formula', 'criteria': '=$D5<$C5',
                                            'format': CF(bg_color=GELBL, font_color=GELBD, bold=True)})
ws.freeze_panes(4, 0)
ws.autofilter('A4:E%d' % ZO_LETZTE)
druck(ws, (3, 3))

# ================================================================ Prüfhinweise
PH = 'Prüfhinweise'
ws = wb.add_worksheet(PH)
ws.hide_gridlines(2)
ws.set_tab_color('#E07000')
BREITEN_PH = [22, 29, 42, 100]
for i, b in enumerate(BREITEN_PH):
    ws.set_column(i, i, b)
titel(ws, wert(PH, 1, 1))
ws.write(1, 0, wert(PH, 2, 1), F(font_color=MUTED, font_size=9.5))
ws.set_row(1, 18)
ws.set_row(2, 12)
KOPF_ALIGN_PH = ['left', 'left', 'left', 'left']
for c in range(4):
    ws.write(3, c, wert(PH, 4, c + 1), kopf_fmt(KOPF_ALIGN_PH[c]))
ws.set_row(3, 30)
vorher = None
for rr in ph_rows:
    schluessel = (wert(PH, rr, 2), wert(PH, rr, 3))
    pf_wechsel = vorher is not None and schluessel[0] != vorher[0]
    neue_gruppe = vorher is not None and schluessel != vorher
    vorher = schluessel
    n = 1
    for c in range(4):
        v = wert(PH, rr, c + 1)
        extra = {}
        if pf_wechsel:
            extra.update(top=2, top_color=LINE2)
        elif neue_gruppe:
            extra.update(top=1, top_color=LINE2)
        if c == 1:
            extra['font_color'] = MUTED
        if c == 0:
            extra['bold'] = True
        wrap = c in (2, 3)
        fmt = zelle_fmt('left', wrap, **extra)
        if v is None:
            ws.write_blank(rr - 1, c, None, fmt)
        else:
            ws.write(rr - 1, c, v, fmt)
            if wrap:
                n = max(n, zeilen(v, BREITEN_PH[c]))
    ws.set_row(rr - 1, zeilenhoehe(n))
for k, (bg, fg) in KATEGORIE.items():
    ws.conditional_format('A5:A%d' % PH_LETZTE, {'type': 'cell', 'criteria': '==', 'value': '"%s"' % k,
                                                 'format': CF(bg_color=bg, font_color=fg, bold=True)})
ws.freeze_panes(4, 0)
ws.autofilter('A4:D%d' % PH_LETZTE)
druck(ws, (3, 3))

# ================================================================ Diagnose (nur neues Exportformat, Werte 1:1)
DG = 'Diagnose'
if DG in Q:
    ws = wb.add_worksheet(DG)
    ws.hide_gridlines(2)
    ws.set_tab_color('#8A5A00')
    DG_KOPF = min(r for (r, c), v in Q[DG].items() if c == 1 and v == 'Postfach')
    DG_NSP = max(c for (r, c) in Q[DG])
    DG_BREITE = {'Postfach': 28, 'Reihenfolge': 10, 'Regelname': 40, 'Aktiv': 7, 'Nur lokal': 8, 'Zustand': 24,
                 'Fehlertext': 40}
    dg_kopf = [str(wert(DG, DG_KOPF, c) or '') for c in range(1, DG_NSP + 1)]
    BREITEN_DG = [DG_BREITE.get(k, 12 if 'Anzahl' in k else 34) for k in dg_kopf]
    for i, b in enumerate(BREITEN_DG):
        ws.set_column(i, i, b)
    titel(ws, wert(DG, 1, 1))
    for rr in range(2, DG_KOPF):
        v = wert(DG, rr, 1)
        if v is not None:
            ws.merge_range(rr - 1, 0, rr - 1, DG_NSP - 1, v, F(font_color=MUTED, font_size=9.5, text_wrap=True, valign='top'))
            ws.set_row(rr - 1, max(18, zeilenhoehe(zeilen(v, sum(BREITEN_DG) - 2, pt=9.5), pt=9.5, polster=4)))
        else:
            ws.set_row(rr - 1, 8)
    for c in range(DG_NSP):
        ws.write(DG_KOPF - 1, c, wert(DG, DG_KOPF, c + 1), kopf_fmt('center' if BREITEN_DG[c] <= 12 else 'left'))
    ws.set_row(DG_KOPF - 1, 30)
    DG_LETZTE = max(r for (r, c) in Q[DG])
    vorher_pf = None
    for rr in range(DG_KOPF + 1, DG_LETZTE + 1):
        pf_wechsel = vorher_pf is not None and wert(DG, rr, 1) != vorher_pf
        vorher_pf = wert(DG, rr, 1)
        n = 1
        for c in range(DG_NSP):
            v = wert(DG, rr, c + 1)
            extra = {'top': 2, 'top_color': LINE2} if pf_wechsel else {}
            if c in (0, 1):
                extra['font_color'] = MUTED
            wrap = BREITEN_DG[c] > 12
            fmt = zelle_fmt('center' if BREITEN_DG[c] <= 12 else 'left', wrap, font_size=9, valign='top', **extra)
            if v is None:
                ws.write_blank(rr - 1, c, None, fmt)
            else:
                ws.write(rr - 1, c, v, fmt)
                if wrap and dg_kopf[c] not in ('Bedingungen: inaktive Typen', 'Ausnahmen: inaktive Typen'):
                    n = max(n, zeilen(v, BREITEN_DG[c], pt=9))
        ws.set_row(rr - 1, zeilenhoehe(min(n, 6), pt=9))
    if 'Zustand' in dg_kopf:
        zsp = xlsxwriter.utility.xl_col_to_name(dg_kopf.index('Zustand'))
        zb = '%s%d:%s%d' % (zsp, DG_KOPF + 1, zsp, DG_LETZTE)
        for anfang, (bg, fg) in (('a', (GRUENL, GRUEN)), ('b', (ORANGEL, ORANGED)), ('c', (ROTL, ROTD))):
            ws.conditional_format(zb, {'type': 'text', 'criteria': 'begins with', 'value': anfang + ' ',
                                       'format': CF(bg_color=bg, font_color=fg, bold=True)})
        ws.conditional_format(zb, {'type': 'text', 'criteria': 'containing', 'value': 'teilweise',
                                   'format': CF(bg_color=ROTL, font_color=ROTD, bold=True)})
    ws.freeze_panes(DG_KOPF, 0)
    ws.autofilter(DG_KOPF - 1, 0, DG_LETZTE - 1, DG_NSP - 1)
    druck(ws, (DG_KOPF - 1, DG_KOPF - 1))

# ---------------------------------------------------------------- Makro-Mappe (Umsetzung, Ordner, Live, Sicherungen, Protokoll, VBA)
if MAKRO:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import umbau
    umbau.bauen(globals())

# ---------------------------------------------------------------- Eigenschaften
# MIP-Kennzeichnung: gleiche Eigenschaften setzen, danach custom.xml 1:1 aus der Vorlage uebernehmen
with zipfile.ZipFile(SRC) as z:
    custom_xml = z.read('docProps/custom.xml') if 'docProps/custom.xml' in z.namelist() else None
    core_xml = z.read('docProps/core.xml')
for name, val in re.findall(rb'name="([^"]+)"><vt:lpwstr>([^<]*)</vt:lpwstr>', custom_xml or b''):
    wb.set_custom_property(name.decode('utf-8'), val.decode('utf-8'))
wb.worksheets()[0].activate()
wb.close()

# ---------------------------------------------------------------- Nachbearbeitung im Paket
tmp = OUT + '.tmp'
with zipfile.ZipFile(OUT) as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == 'docProps/custom.xml' and custom_xml is not None:
            data = custom_xml
        elif item.filename == 'docProps/core.xml':
            data = core_xml
        elif MAKRO and re.match(r'xl/drawings/drawing\d+\.xml$', item.filename):
            data = umbau.formen_nachbearbeiten(data.decode('utf-8')).encode('utf-8')
        elif item.filename == 'xl/theme/theme1.xml':
            s = data.decode('utf-8')
            s = re.sub(r'(<a:majorFont><a:latin typeface=")[^"]*(")', r'\1Aptos Display\2', s)
            s = re.sub(r'(<a:minorFont><a:latin typeface=")[^"]*(")', r'\1Aptos\2', s)
            data = s.encode('utf-8')
        zout.writestr(item, data)
os.replace(tmp, OUT)
print('geschrieben:', OUT)
