# -*- coding: utf-8 -*-
"""Baut Pruefbot_Testing.xlsm neu aus quelle/Pruefbot_Testing.xlsx (Prüfbot-Testing für Bestandsübertragungen).

Aufruf (aus diesem Ordner):  python3 pruefbot_build.py

Ablauf
  1. VBA-Quellen pruefen (cp1252, vba_pruefung) und vbaProject.bin bauen (ovba).
  2. Original roh aus dem XML lesen (xlsxroh) – nie ueber openpyxl speichern, sonst gehen x14-Datenueberpruefungen,
     Zwischenwerte und Array-Kennzeichen verloren.
  3. Arbeitsmappe mit xlsxwriter neu schreiben: gleiche Tabellen (Namen, Spalten, Werte, Formeln woertlich samt
     zwischengespeicherter Ergebnisse), Datenueberpruefungen, bedingte Formate (gleiche Regeln, neue Farben),
     Kommentare, Hyperlink. Dazu Kopfband je Blatt, Cockpit auf der Startseite und das Blatt „Testmail-Generator“.
  4. Nachbearbeitung im ZIP: Formen (Knoepfe mit Makro, abgerundet, absolut verankert, Textverknuepfung mit
     Zwischentext), Array-Kennzeichen der drei Spaltenformeln in tblTestfallTracking.
  5. zuordnung.json fuer vergleich.py schreiben (wohin jede Zelle ausserhalb von Tabellen gewandert ist und welche
     Zellen bewusst ersetzt wurden).

Jedes Blatt (ausser Start und Listen) wird um eine Spalte nach rechts (Randspalte A) und um dr Zeilen nach unten
verschoben; die Zeilen 1 bis 4 traegt das Kopfband. Tabellen behalten Namen und Spalten, nur die Lage aendert sich.
"""
import datetime as dt
import json
import os
import re
import sys
import urllib.parse
import zipfile

import xlsxwriter
import xlsxwriter.worksheet
from xlsxwriter.utility import xl_rowcol_to_cell, xl_col_to_name

HIER = os.path.dirname(os.path.abspath(__file__))
BASIS = os.path.dirname(HIER)
sys.path.insert(0, HIER)
import ovba  # noqa: E402
import vba_pruefung  # noqa: E402
import xlsxroh  # noqa: E402

QUELLE = os.path.join(HIER, 'quelle', 'Pruefbot_Testing.xlsx')
OUT = os.path.join(BASIS, 'Pruefbot_Testing.xlsm')
ZUORDNUNG = os.path.join(HIER, 'zuordnung.json')
HEUTE = dt.date.today()

# xlsxwriter macht sonst jede Formel mit XLOOKUP/UNIQUE zur dynamischen Arrayformel (cm="1"); im Original sind das nur
# die 72 Zellen der drei Spalten in tblTestfallTracking – die werden gezielt mit write_dynamic_array_formula geschrieben.
xlsxwriter.worksheet.re_dynamic_function = re.compile(r'(?!)')

# ------------------------------------------------------------------ Gestaltung
FONT = 'Liberation Sans'
BAND = '#1B2733'          # Kopfband (dunkles Schiefer)
BAND2 = '#2A3A49'         # Knopf im Kopfband (Zweitknopf)
KOPF = '#24323F'          # Tabellenkoepfe
TEXT = '#1F2933'
TEXT2 = '#4A5A6A'
GRAU = '#7B8794'
LINIE = '#E3E8ED'
LINIE2 = '#CBD3DB'
FLAECHE = '#F2F5F8'       # berechnete Zellen
FLAECHE2 = '#F7F9FB'
EINGABE = '#FFF7DD'       # Eingabezellen (hellgelb, wie im Original „gelbe Zellen“)
EINGABE_L = '#F3D98B'     # Legende Eingabe
TEAL = '#0F766E'
TEAL_D = '#0B5D57'
TEAL_H = '#5EEAD4'
TEAL_XL = '#E6F4F2'
SUB = '#AEBBC7'           # Untertitel im Kopfband
ROT = '#B42318'
WEISS = '#FFFFFF'
REGISTER = {'start': TEAL, 'operativ': '#31527A', 'werkzeug': '#31527A', 'herleitung': '#94A3B8', 'listen': '#CBD5E1'}

PILLEN = {   # Statusfarben (bedingte Formate): Hintergrund (None = Grundfarbe der Zelle bleibt), Schrift, fett
    'gruen': ('#E2F5EA', '#17663A', True),
    'rot': ('#FDE7E7', ROT, True),
    'grau': ('#EDF0F3', '#475467', True),
    'hell': ('#F6F7F9', '#98A2B3', False),
    'blau': ('#E3EEFB', '#1D4F91', True),
    'amber': ('#FFF1D6', '#8A5300', True),
    'leise': (None, '#98A2B3', False),      # nein / offen: zurueckhaltend, Farbe nur fuer erledigt, blockiert usw.
}
ORANGE = '#FED7AA'        # Generator: fuer diesen Auftrag noch noetig (Fuellung)
ORANGE_R = '#EA580C'      # Rand und Legende
ORANGE_T = '#9A3412'
STATUSWERTE = {'ja', 'nein', 'nicht erforderlich', 'offen', 'bereit', 'in durchführung', 'erledigt', 'blockiert'}

PX = 4.0 / 3.0
SHAPES = []              # (blatt, spec) – Formen fuer die Nachbearbeitung


def px_spalte(breite):
    """Spaltenbreite (Zeichen) -> Pixel wie in Excel (Standardschrift mit 7 px Ziffernbreite)."""
    return int(breite * 7 + 0.5) + 5 if breite >= 1 else int(breite * 12 + 0.5)


class Stil:
    """Format-Cache: Formate werden aus einem Schluessel aus Eigenschaften erzeugt."""

    def __init__(self, wb):
        self.wb = wb
        self.cache = {}

    def f(self, **kw):
        basis = {'font_name': FONT, 'font_size': 9.5, 'font_color': TEXT, 'valign': 'top'}
        basis.update(kw)
        if basis.get('indent') and 'align' not in basis:
            basis['align'] = 'left'         # Einzug wirkt in Excel und LibreOffice nur mit ausdrücklicher Ausrichtung
        schluessel = tuple(sorted(basis.items()))
        if schluessel not in self.cache:
            self.cache[schluessel] = self.wb.add_format(basis)
        return self.cache[schluessel]

    # Kopfband
    def band(self, **kw):
        d = {'bg_color': BAND, 'font_color': WEISS, 'valign': 'vcenter'}
        d.update(kw)
        return self.f(**d)

    def kopf(self, mittig=False):
        d = dict(bold=True, font_color=WEISS, bg_color=KOPF, valign='vcenter', text_wrap=True, font_size=9,
                 align='center' if mittig else 'left', bottom=2, bottom_color=TEAL, left=1, left_color='#3A4A58',
                 right=1, right_color='#3A4A58')
        if not mittig:
            d['indent'] = 1
        return self.f(**d)

    def zelle(self, art='neutral', wrap=True, zahl=None, mittig=False, fett=False, rechts=False):
        """Datenzelle mit Innenabstand: Text links mit Einzug 1, Zahlen (rechts=True) rechts mit Einzug 1."""
        d = dict(text_wrap=wrap, bottom=1, bottom_color=LINIE, left=1, left_color=LINIE, right=1, right_color=LINIE)
        if mittig:
            d.update(align='center')
        elif rechts:
            d.update(align='right', indent=1)
        else:
            d.update(align='left', indent=1)
        if art == 'eingabe':
            d.update(bg_color=EINGABE)
        elif art == 'berechnet':
            d.update(bg_color=FLAECHE, font_color=TEXT2)
        elif art == 'id':
            d.update(bold=True)
        if fett:
            d.update(bold=True)
        if zahl:
            d.update(num_format=zahl)
        return self.f(**d)

    def pille(self, art='eingabe'):
        """Statuszelle: zentriert, weisser Rand rundherum (wirkt mit der Farbe des bedingten Formats wie eine Pille).
        Nicht fett: fett und farbig werden nur Werte mit Bedeutung (erledigt, blockiert ...) ueber das bedingte Format."""
        bg = {'eingabe': EINGABE, 'berechnet': FLAECHE, 'neutral': WEISS}[art]
        return self.f(font_size=9, align='center', valign='vcenter', text_wrap=True, bg_color=bg,
                      top=2, top_color=WEISS, bottom=2, bottom_color=WEISS, left=5, left_color=WEISS, right=5, right_color=WEISS)


def cf_format(stil, art):
    bg, fg, fett = PILLEN[art]
    d = {'font_color': fg}
    if bg:
        d['bg_color'] = bg
    if fett:
        d['bold'] = True
    schluessel = ('cf', art)
    if schluessel not in stil.cache:
        stil.cache[schluessel] = stil.wb.add_format(d)
    return stil.cache[schluessel]


# ------------------------------------------------------------------ Formeln verschieben
_REF = re.compile(r"(?<![A-Za-z0-9_.\[\]!'])(\$?)([A-Z]{1,3})(\$?)(\d{1,7})(?![A-Za-z0-9_(\[])")


def formel_verschieben(formel, dr, dc):
    """Verschiebt alle A1-Bezuege (auch absolute) um dr Zeilen und dc Spalten – fuer bedingte Formate und die eine
    A1-Formel in tblBE, deren Bezuege auf demselben Blatt liegen, das als Ganzes verschoben wird. Zeichenketten und
    Tabellenbezuege bleiben unangetastet."""
    if not formel or (dr == 0 and dc == 0):
        return formel
    aus = []
    for fest, text in xlsxroh._teile(formel):
        if fest:
            aus.append(text)
            continue

        def rep(m):
            sc, col, sr, row = m.groups()
            return '%s%s%s%d' % (sc, xlsxroh.spalte_buchst(xlsxroh.spalte_nr(col) + dc), sr, int(row) + dr)
        aus.append(_REF.sub(rep, text))
    return ''.join(aus)


def sqref_verschieben(sqref, dr, dc):
    teile = []
    for teil in sqref.split():
        r1, c1, r2, c2 = xlsxroh.bereich_split(teil)
        a = xlsxroh.adr(r1 + dr, c1 + dc)
        b = xlsxroh.adr(r2 + dr, c2 + dc)
        teile.append(a if a == b else a + ':' + b)
    return ' '.join(teile)


# ------------------------------------------------------------------ Blattbeschreibungen
def zeilen_hoehe(n):
    """Kompakte Zeilenhöhe für genau n Textzeilen (9,5 pt): Excel setzt umbrochene Zeilen im Abstand von 15 px
    (11,25 pt) bei 100 % Zoom, dazu 2 px oben – so endet die Zeile zwischen zwei Textzeilen statt mitten in einer."""
    return (2 + 15 * n) * 0.75


# Zaehlerleisten der Arbeitsblaetter (Original „fachliche Testfälle 21 | operative … 24“): entfallen, weil dieselben
# Zahlen im Cockpit stehen (Kacheln und Prozessschritte) – jede Kennzahl nur an einer Stelle.
ZAEHLER_GRUND = ('Zählerleiste „%s | %s“ entfällt: dieselbe Zahl steht im Cockpit (Start & Übersicht: %s); '
                 'jede Kennzahl nur an einer Stelle')

# dr: Zeilenversatz des Inhalts, dc: Spaltenversatz (Randspalte A). titel/satz: ('zelle', 'A1') = Originaltext aus dieser
# Zelle (wandert ins Kopfband), ('text', '...') = neuer Text; die Originalzelle wird dann in zuordnung.json ignoriert.
BLAETTER = {
    'Start & Übersicht': dict(vba='Start', gruppe='start', kicker='COCKPIT'),
    'Stammdaten': dict(vba='Stammdaten', gruppe='operativ', kicker='SCHRITT A  ·  OPERATIV', dr=2,
                       titel=('zelle', 'A1'), satz=('zelle', 'A3'), freeze='band', hoehe=zeilen_hoehe(3), xfreeze=2, volltext=True),
    'To-do Vertragsmapping': dict(vba='Vertragsmapping', gruppe='operativ', kicker='SCHRITT B  ·  OPERATIV', dr=3,
                                  titel=('zelle', 'A1'), satz=('text', 'Konkrete Vertrag-Zuordnungen zwischen abgebendem '
                                  'Bestandsinhaber und aufnehmender Agentur; Stammdaten werden automatisch übernommen.'),
                                  ersetzt={'A2': 'Navigationstext „Zurück zu Start & Übersicht | …“: Rücksprung jetzt als '
                                           'Knopf „Zur Übersicht“ im Kopfband, Beschreibung unverändert als Untertitel'},
                                  freeze='tabelle', hoehe=zeilen_hoehe(4), volltext=True, xfreeze=2),
    'To-do Mailerstellung': dict(vba='Mailerstellung', gruppe='operativ', kicker='SCHRITT C  ·  OPERATIV', dr=2,
                                 titel=('zelle', 'A1'), satz=('text', 'Eine operative Auftragszeile je Ausführung; reale Daten '
                                 'werden ausschließlich aus Stammdaten übernommen.'),
                                 ersetzt={'A3': 'Navigationstext „Zurück zu Start & Übersicht | …“: Rücksprung jetzt als Knopf, '
                                          'Beschreibung unverändert als Untertitel',
                                          **{z: ZAEHLER_GRUND % ('fachliche Testfälle', 'operative Mail-/Datensatzaufträge',
                                                                 'Kachel „fachliche Testfälle“ und Schritt C „Gesamt“')
                                             for z in ('A4', 'B4', 'C4', 'D4')}},
                                 freeze='tabelle', hoehe=zeilen_hoehe(5), volltext=True, testmail=True, xfreeze=3),
    'Testfall-Tracking': dict(vba='Tracking', gruppe='operativ', kicker='SCHRITT D  ·  OPERATIV', dr=3,
                              titel=('zelle', 'A1'), satz=('text', 'Eine Zeile je operativer Ausführung; das fachliche Ergebnis '
                              'wird ausschließlich manuell gepflegt.'),
                              ersetzt={'A2': 'Navigationstext „Zurück zu Start & Übersicht | …“: Rücksprung jetzt als Knopf, '
                                       'Beschreibung unverändert als Untertitel',
                                       **{z: ZAEHLER_GRUND % ('fachliche Testfälle', 'operative Testausführungen',
                                                              'Kacheln „fachliche Testfälle“ und „Operative Testausführungen“')
                                          for z in ('A3', 'B3', 'C3', 'D3')}},
                              freeze='tabelle', hoehe=zeilen_hoehe(4), volltext=True, xfreeze=3),
    'BE Übersicht': dict(vba='BEUebersicht', gruppe='herleitung', kicker='HERLEITUNG  ·  FACHLICH', dr=6,
                         titel=('text', 'BE Übersicht | Business Exceptions und Prüfnotizen'),
                         satz=('text', 'Welche Business Exceptions und Prüfnotizen der Prüfbot kennt, wie viele Testfälle '
                               'sie abdecken und welche Nachweise je Prüfnotiz nötig sind.'),
                         freeze='tabelle', hoehe=zeilen_hoehe(4), volltext=True, breiten_extra={6: 30}),
    'Testfall-Matrix': dict(vba='Matrix', gruppe='herleitung', kicker='HERLEITUNG  ·  FACHLICH', dr=4,
                            titel=('zelle', 'A1'), satz=('text', 'Alle fachlichen Testfälle mit Vertrag, aufnehmender Agentur, '
                            'Mailvariante, Absenderpostfach und erwartetem Ergebnis.'),
                            freeze='tabelle', hoehe=zeilen_hoehe(6), volltext=True, xfreeze=2),
    'Agenturkonstellationen': dict(vba='Agenturkonst', gruppe='herleitung', kicker='HERLEITUNG  ·  FACHLICH', dr=2,
                                   titel=('zelle', 'A1'), satz=('zelle', 'A3'), freeze='band', hoehe=zeilen_hoehe(7), volltext=True),
    'Vertragskonstellationen': dict(vba='Vertragskonst', gruppe='herleitung', kicker='HERLEITUNG  ·  FACHLICH', dr=2,
                                    titel=('zelle', 'A1'), satz=('zelle', 'A3'), freeze='band', hoehe=zeilen_hoehe(7), volltext=True),
    'Mailanforderungen': dict(vba='Mailanforderungen', gruppe='herleitung', kicker='HERLEITUNG  ·  FACHLICH', dr=2,
                              titel=('zelle', 'A1'), satz=('zelle', 'A3'), freeze='tabelle', hoehe=zeilen_hoehe(7), volltext=True, xfreeze=2),
    'Listen & Parameter': dict(vba='Listen', gruppe='listen'),
}
GENERATOR = 'Testmail-Generator'
REIHENFOLGE = ['Start & Übersicht', 'Stammdaten', 'To-do Vertragsmapping', 'To-do Mailerstellung', GENERATOR,
               'Testfall-Tracking', 'BE Übersicht', 'Testfall-Matrix', 'Agenturkonstellationen', 'Vertragskonstellationen',
               'Mailanforderungen', 'Listen & Parameter']
VBA_NAMEN = {n: d['vba'] for n, d in BLAETTER.items()}
VBA_NAMEN[GENERATOR] = 'Generator'

# Rollen von Zellen ausserhalb von Tabellen (Originaladresse): Gestaltung im Neubau
ROLLEN = {
    'Stammdaten': {'A5': 'abschnitt', 'A16': 'abschnitt', 'A30': 'abschnitt'},
    'BE Übersicht': {'A20': 'abschnitt'},
    'Agenturkonstellationen': {'A5': 'kpi_zahl', 'C5': 'kpi_zahl', 'E5': 'kpi_zahl', 'G5': 'kpi_zahl',
                               'A6': 'kpi_text', 'C6': 'kpi_text', 'E6': 'kpi_text', 'G6': 'kpi_text',
                               'A8': 'abschnitt', 'A19': 'abschnitt', 'A20': 'fliesstext', 'A23': 'abschnitt'},
    'Vertragskonstellationen': {'A5': 'kpi_zahl', 'C5': 'kpi_zahl', 'E5': 'kpi_zahl', 'G5': 'kpi_zahl',
                                'A6': 'kpi_text', 'C6': 'kpi_text', 'E6': 'kpi_text', 'G6': 'kpi_text',
                                'A20': 'abschnitt', 'A21': 'fliesstext'},
    'Mailanforderungen': {'A21': 'fliesstext'},
}

# Eingabespalten je Tabelle (hellgelb). Alles andere ohne Formel ist neutral (Schluessel, fachliche Texte).
EINGABE_SPALTEN = {
    'tblAgenturen': ['Aufnehmender Agenturname', 'Aufnehmende Agenturnummer / OE', 'Aufnehmende Vermittlernummer / PNR',
                     'Aufnehmender Vermittlertyp', 'Aufnehmende Klassifikation', 'Aufnehmende Makler-E-Mail',
                     'IMSI / EMMA bestätigt', 'Status', 'Owner', 'Kommentar / Blocker'],
    'tblVertraege': ['Sparte', 'Produktiv-VNR', 'IMSI-VNR', 'Anonymisierter VN-/Firmenname', 'Vorname, sofern relevant',
                     'Geburtsdatum, sofern relevant', 'Produktart / Versicherungsart', 'IMSI-Hostzustand bestätigt', 'Status',
                     'Owner', 'Kommentar / Blocker', 'Abgeber-ID', 'Abgebender Agenturtyp', 'Abgeberstatus',
                     'Abgeberzuordnung bestätigt'],
    'tblAbgebendeAgenturen': ['Konkreter abgebender Agenturname', 'Abgebende Agenturnummer / OE',
                              'Abgebende Vermittlernummer / PNR', 'OB726-Klassifizierung', 'GH040-Status',
                              'Hostzustand bestätigt', 'Status', 'Owner', 'Kommentar / Blocker'],
    'tblVertragsmapping': ['Erfüllt', 'Geprüft', 'Owner', 'Kommentar / Blocker'],
    'tblMailAuftraege': ['Mail vorbereitet', 'Mail versendet', 'Owner'],
    'tblTestfallTracking': ['An Celonis übergeben', 'Test durchgeführt', 'Ergebnis wie erwartet', 'Vorgang-Lfd-Nr.',
                            'Nachweis / Ablageort', 'Owner', 'Status', 'Kommentar / Blocker', 'PN-01 nachgewiesen',
                            'PN-02 nachgewiesen', 'PN-03 nachgewiesen', 'PN-04 nachgewiesen', 'PN-05 nachgewiesen',
                            'PN-06 nachgewiesen', 'PN-07 nachgewiesen', 'vollständige Fehlerliste ausgegeben',
                            'BE „Nachprüfung erforderlich“ ausgegeben', 'Ist-Abgeberstatus', 'Abgeberzuordnung geprüft'],
}
ID_SPALTEN = {'Aufnehmende Agentur-ID', 'Datensatz-ID', 'Abgeber-ID', 'Mapping-ID', 'Mail-Auftrags-ID', 'Testfall-ID',
              'Vertrag-ID', 'Mail-ID / Zustand', 'Sortierung', 'Prüfnotiz-ID'}
ZAHL_SPALTEN = {'IMSI-VNR', 'Produktiv-VNR', 'Aufnehmende Agenturnummer / OE', 'Aufnehmende Vermittlernummer / PNR',
                'Abgebende Agenturnummer / OE', 'Abgebende Vermittlernummer / PNR', 'Anzahl', 'Vorgang-Lfd-Nr.'}

# Spaltenbreiten (Zeichen) nach Spaltenname; sonst aus dem Original (leicht gestrafft)
BREITE_NAME = {
    'Mail-Auftrags-ID': 12, 'Testfall-ID': 11, 'Datensatz-ID': 11, 'Mapping-ID': 11, 'Vertrag-ID': 10, 'Abgeber-ID': 10,
    'Aufnehmende Agentur-ID': 12, 'Mail-ID / Zustand': 10, 'Sortierung': 10, 'Prüfnotiz-ID': 11, 'Priorität': 10,
    'Sparte': 11, 'IMSI-VNR': 13, 'Produktiv-VNR': 13, 'Pflichtgrad': 11, 'Auftragsart': 13, 'Absenderpostfach': 24,
    'Owner': 14, 'Status': 15, 'Anzahl': 9, 'Weg': 9, 'Ausführung': 11,
    'Mail vorbereitet': 13, 'Mail versendet': 13, 'Erfüllt': 12, 'Geprüft': 12,
    'Betreff konkret': 34, 'Mailtext / konkrete Inhaltsvorgabe': 52, 'E-Mail-Checkliste': 46,
    'Deckblatt-Sollausprägungen': 40, 'Zu beachtende Besonderheit': 40, 'Erforderliche Anhänge': 26,
    'Maklervollmacht / Betreuungswunsch': 40, 'Kommentar / Blocker': 30, 'Testfallname': 28,
    'Konkreter Arbeitsauftrag': 42, 'Relevante Testfälle': 20, 'Mailtext-Vorgabe': 52, 'Betreff-Vorlage': 30,
}

STATUS_LISTEN = {"'Listen & Parameter'!$A$2:$A$6", "'Listen & Parameter'!$B$2:$B$4", "'Listen & Parameter'!$B$2:$B$5",
                 "'Listen & Parameter'!$I$2:$I$4"}


# ------------------------------------------------------------------ Kopfband und Formen
def form(ws_name, spec):
    SHAPES.append((ws_name, spec))


def knopf(ws, ws_name, x, y, b, h, text, makro=None, url=None, art='primaer', name='', tip=None, groesse=9.5):
    """Knopf als Form. art: primaer (teal), band (im Kopfband), hell (weiss mit Rand), text (ohne Flaeche)."""
    farben = {'primaer': (TEAL, None, WEISS), 'band': (BAND2, '#3E5163', WEISS), 'hell': (WEISS, LINIE2, TEXT),
              'warn': ('#FFF1D6', '#F2C46D', '#8A5300')}
    fill, linie, schrift = farben[art]
    o = {'x_offset': x, 'y_offset': y, 'width': b, 'height': h, 'object_position': 3,
         'fill': {'color': fill}, 'line': {'none': True} if not linie else {'color': linie, 'width': 0.75},
         'font': {'name': FONT, 'size': groesse, 'bold': True, 'color': schrift},
         'align': {'vertical': 'middle', 'horizontal': 'center'}}
    spec = 'N=BTN_%s;G=roundRect;X=%d;Y=%d;W=%d;H=%d' % (name, x, y, b, h)
    if makro:
        spec += ';M=' + makro
    if url:
        o['url'] = url
        if tip:
            o['tip'] = tip
    o['description'] = spec
    ws.insert_textbox(0, 0, text, o)


def flaeche(ws, x, y, b, h, text='', name='', fill=WEISS, linie=None, schrift=None, ausrichtung=None, textlink=None,
            cache=None, rund=True, innen0=False):
    o = {'x_offset': x, 'y_offset': y, 'width': b, 'height': h, 'object_position': 3,
         'fill': {'color': fill} if fill else {'none': True},
         'line': {'color': linie, 'width': 0.75} if linie else {'none': True}}
    s = {'name': FONT, 'size': 9, 'color': TEXT}
    if schrift:
        s.update(schrift)
    o['font'] = s
    o['align'] = ausrichtung or {'vertical': 'middle', 'horizontal': 'left'}
    if textlink:
        o['textlink'] = textlink
    spec = 'N=%s;X=%d;Y=%d;W=%d;H=%d' % (name, x, y, b, h)
    if rund:
        spec += ';G=roundRect'
    if cache is not None:
        spec += ';C=' + urllib.parse.quote(cache)
    if innen0:
        spec += ';I=0'
    o['description'] = spec
    ws.insert_textbox(0, 0, text, o)


BAND_H = [18, 28, 21, 10]       # Zeilen 1–4 des Kopfbands (pt)
_TITELSCHRIFT = None
# Knöpfe im Kopfband: auf allen Blättern ab derselben x-Position (rechts vom längsten Titel), feste Reihenfolge
# [Hauptaktion] [Volltext / Mail-Aufträge] [Zur Übersicht] und je Knopf dieselbe Breite
KNOPF_X0 = 560
KNOPF_B = {'Testmail erstellen': 150, 'Volltext ein/aus': 124, 'Mail-Aufträge': 124, 'Zur Übersicht': 112,
           'Testmail-Generator': 150}


def titel_breite_px(text):
    """Breite des Titels (17 pt fett) in Pixeln, gemessen mit Liberation Sans Bold (metrisch wie Arial)."""
    global _TITELSCHRIFT
    try:
        from PIL import ImageFont
        if _TITELSCHRIFT is None:
            _TITELSCHRIFT = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf', 23)
        return int(_TITELSCHRIFT.getlength(text))
    except Exception:
        return int(len(text) * 12.5)


_SCHRIFTEN = {}


def zeilen_noetig(text, breite_px, groesse=9.5, fett=False, einzug=True):
    """Anzahl Textzeilen, die ein umbrochener Text in einer Zelle der Breite breite_px braucht (Wortumbruch wie Excel,
    gemessen mit Liberation Sans, metrisch gleich Arial)."""
    try:
        from PIL import ImageFont
        k = (groesse, fett)
        if k not in _SCHRIFTEN:
            _SCHRIFTEN[k] = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf'
                                               % ('Bold' if fett else 'Regular'), round(groesse * 4 / 3))
        f = _SCHRIFTEN[k]
        laenge = f.getlength
    except Exception:
        laenge = lambda t: len(t) * groesse * 0.55 * 4 / 3
    nutz = breite_px - 6 - (9 if einzug else 0)
    n = 0
    for absatz in str(text).split('\n'):
        zeile = ''
        n += 1
        for wort in absatz.split(' '):
            kand = (zeile + ' ' + wort) if zeile else wort
            if laenge(kand) <= nutz or not zeile:
                zeile = kand
            else:
                n += 1
                zeile = wort
    return n


def kopfband(ws, st, name, kicker, titel, satz, knoepfe):
    """Kopfband: Zeile 1 Kennzeichnung (Schritt), Zeile 2 Titel, Zeile 3 ein Satz wozu das Blatt dient, Zeile 5 Akzentlinie.
    knoepfe: Liste (text, makro, url, art) – rechts im Band ab KNOPF_X0."""
    for i, h in enumerate(BAND_H):
        ws.set_row(i, h, st.band())
    ws.set_row(4, 3, st.f(bg_color=TEAL))
    ws.write_string(0, 1, kicker, st.band(font_color=TEAL_H, bold=True, font_size=8, valign='bottom'))
    ws.write_string(1, 1, titel, st.band(bold=True, font_size=17))
    ws.write_string(2, 1, satz, st.band(font_color=SUB, font_size=10))
    x = KNOPF_X0
    for text, makro, url, art in knoepfe:
        breite = KNOPF_B[text]
        knopf(ws, name, x, 14, breite, 30, text, makro=makro, url=url, art=art,
              name=re.sub(r'\W', '', text)[:20], tip=text)
        x += breite + 10


def legende(ws, st, zeile, spalte, mit_eingabe=True, volltext=False, zusatz='', generator=False):
    teile = []
    gr = st.f(font_size=8.5, font_color=GRAU, valign='vcenter')
    if mit_eingabe:
        teile += [st.f(font_size=11, font_color=EINGABE_L, valign='vcenter'), '■', gr, ' Eingabe     ',
                  st.f(font_size=11, font_color='#C9D2DB', valign='vcenter'), '■', gr, ' berechnet     ']
    if generator:
        teile += [st.f(font_size=11, font_color=ORANGE_R, valign='vcenter'), '■', gr, ' für diesen Auftrag noch nötig     ',
                  st.f(font_size=11, font_color='#E4E8EC', valign='vcenter'), '■', gr, ' für diesen Auftrag ohne Bedeutung']
    if volltext:
        teile += [gr, 'Doppelklick auf eine Zeile zeigt den vollständigen Text (Knopf „Volltext“: alle Zeilen).']
    if zusatz:
        teile += [gr, zusatz]
    texte = [t for t in teile if isinstance(t, str)]
    if len(texte) == 1:
        ws.write_string(zeile, spalte, texte[0], gr)
    elif teile:
        ws.write_rich_string(zeile, spalte, *teile, gr)


# ------------------------------------------------------------------ Lesen
A = xlsxroh.Arbeitsmappe(QUELLE)
ZU_ZELLEN, ZU_IGNORIEREN, ZU_BEGRUENDUNG = {}, [], {}


def wert_typ(z):
    """Original-Zelle -> (art, wert): art in s (Text), n (Zahl), b, leer."""
    if not z or z['wert'] is None:
        return 'leer', None
    w = z['wert']
    if isinstance(w, bool):
        return 'b', w
    if isinstance(w, (int, float)):
        return 'n', w
    return 's', w


def ist_datum(z):
    return bool(z) and xlsxroh_ist_datumsformat(A.xfs[z['s']]['numFmt'] if z['s'] < len(A.xfs) else None)


def xlsxroh_ist_datumsformat(code):
    if not code or code == 'General':
        return False
    c = re.sub(r'"[^"]*"|\[[^\]]*\]|\\.', '', code)
    return bool(re.search(r'[dy]', c, re.I))


def tabellen_zeilen(t):
    """Datenzeilen einer Originaltabelle als Liste von dicts Spaltenname -> Originalzelle."""
    b = A.blatt_nach_name[t['blatt']]
    zeilen = []
    for r in range(t['r1'] + t['headerRowCount'], t['r2'] - t['totalsRowCount'] + 1):
        zeilen.append({s['name']: b['zellen'].get(xlsxroh.adr(r, t['c1'] + i)) for i, s in enumerate(t['spalten'])})
    return zeilen


def tabellen_werte(name):
    t = A.tabellen[name]
    return [{k: (v['wert'] if v else None) for k, v in z.items()} for z in tabellen_zeilen(t)]


# ------------------------------------------------------------------ Zellen schreiben
def schreibe_zelle(ws, r, c, z, fmt, url=None):
    """Schreibt eine Originalzelle (Wert oder Formel samt Zwischenwert) an (r, c) – 0-basiert."""
    if z and z['formel']:
        f = '=' + z['formel']['text']
        w = z['wert']
        if w is None:
            w = ''
        if isinstance(w, bool):
            w = 'TRUE' if w else 'FALSE'
        if z['formel']['dynamisch']:
            ws.write_dynamic_array_formula(r, c, r, c, f, fmt, w)
        else:
            ws.write_formula(r, c, f, fmt, w)
        return
    art, w = wert_typ(z)
    if url:
        ws.write_url(r, c, url, fmt, string=str(w) if w is not None else url, tip=None)
    elif art == 'leer':
        ws.write_blank(r, c, None, fmt)
    elif art == 'n':
        ws.write_number(r, c, w, fmt)
    elif art == 'b':
        ws.write_boolean(r, c, w, fmt)
    else:
        ws.write_string(r, c, w, fmt)


def spalten_art(tname, sname, spalte, zellen):
    """neutral | id | eingabe | berechnet | status (Pillen) – fuer die Gestaltung der Datenzellen."""
    alle_formel = zellen and all(z and z['formel'] for z in zellen)
    if alle_formel or (spalte['berechnet'] and any(z and z['formel'] for z in zellen)):
        return 'berechnet'
    if sname in EINGABE_SPALTEN.get(tname, []):
        return 'eingabe'
    if sname in ID_SPALTEN:
        return 'id'
    return 'neutral'


def dv_spalten(bname, conf):
    """Neue Spaltennummern (0-basiert) mit Auswahlliste (Original und ergaenzt)."""
    b = A.blatt_nach_name[bname]
    sp = set()
    for dv in b['datenpruefungen']:
        for r, c in xlsxroh.sqref_zellen(dv['sqref']):
            sp.add(c + conf['dc'] - 1)
    for tname, sname, quelle, pille in LUECKEN_DV.get(bname, []):
        t = A.tabellen[tname]
        sp.add(t['c1'] + [s_['name'] for s_ in t['spalten']].index(sname) + conf['dc'] - 1)
    return sp


def statusartig(zellen):
    """Alle belegten Werte sind Statuswerte (ja, nein, offen, erledigt ...); leere Spalten zaehlen als statusartig."""
    for z in zellen:
        if z and z['wert'] not in (None, ''):
            if str(z['wert']).strip().lower() not in STATUSWERTE:
                return False
    return True


def originaltabellen_schreiben(ws, st, bname, conf, pillen_zellen):
    """Schreibt alle Originaltabellen eines Blatts an die verschobene Stelle. pillen_zellen: Menge (r, c) neu, 0-basiert,
    in denen Statusregeln greifen. Als Pille gestaltet werden davon nur Spalten mit Auswahlliste oder mit Statuswerten
    (ja/nein ...); berechnete Textspalten im selben Regelbereich (Abgebername, Agentur-ID ...) bleiben normale Zellen."""
    b = A.blatt_nach_name[bname]
    dr, dc = conf['dr'], conf['dc']
    links = {xlsxroh.zelle_split(h['ref']): h.get('ziel') for h in b['hyperlinks']}
    mit_liste = dv_spalten(bname, conf)
    for t in b['tabellen']:
        zeilen = tabellen_zeilen(t)
        r1, c1 = t['r1'] + dr - 1, t['c1'] + dc - 1          # 0-basiert
        r2, c2 = t['r2'] + dr - 1, t['c2'] + dc - 1
        spalten = []
        arten = []
        pillspalte = []
        for i, s in enumerate(t['spalten']):
            zellen = [z[s['name']] for z in zeilen]
            art = spalten_art(t['name'], s['name'], s, zellen)
            arten.append(art)
            pillspalte.append((c1 + i) in mit_liste or (art in ('berechnet', 'eingabe') and statusartig(zellen)))
            sp = {'header': s['name'], 'header_format': st.kopf()}
            # Spaltenformel: woertlich; die A1-Restformel in tblBE[Anzahl] (=SUM(F3:F18), alle anderen Zellen Werte)
            # wuerde verschoben falsch, sie entfaellt (vergleich.py: HINWEIS „Spaltenformel ist ein Rest“).
            if s['berechnet'] and not (t['name'] == 'tblBE' and s['name'] == 'Anzahl'):
                sp['formula'] = '=' + s['berechnet']
            spalten.append(sp)
        stil = (t['stil'] or {}).get('name')
        ws.add_table(r1, c1, r2, c2, {'name': t['name'], 'columns': spalten, 'style': None, 'autofilter': t['autofilter']})
        for k, zrow in enumerate(zeilen):
            r = r1 + 1 + k
            for i, s in enumerate(t['spalten']):
                c = c1 + i
                z = zrow[s['name']]
                art = arten[i]
                zahl = None
                if ist_datum(z) or 'Geburtsdatum' in s['name']:
                    zahl = 'dd.mm.yyyy'
                elif s['name'] in ZAHL_SPALTEN:
                    zahl = '0'
                elif z and not z['formel'] and z['s'] < len(A.xfs) and A.xfs[z['s']]['numFmt'] == '@':
                    zahl = '@'          # Textformat des Originals (z. B. tblBE[Sortierung] „00“ … „90“)
                if (r, c) in pillen_zellen and pillspalte[i]:
                    fmt = st.pille('berechnet' if art == 'berechnet' else ('eingabe' if art == 'eingabe' else 'neutral'))
                else:
                    fmt = st.zelle('eingabe' if art == 'eingabe' else art, zahl=zahl,
                                   mittig=s['name'] == 'Anzahl',
                                   rechts=s['name'] in ZAHL_SPALTEN and s['name'] != 'Anzahl')
                if z and z['formel'] and t['name'] == 'tblBE':
                    # Summenzeile des Originals (=SUM(..) in der ersten Datenzeile): als „Summe 21“ beschriftet
                    z = dict(z, formel=dict(z['formel'], text=formel_verschieben(z['formel']['text'], dr, dc)))
                    fmt = st.f(bold=True, font_size=10, font_color=TEAL_D, align='center', valign='vcenter', bottom=1,
                               bottom_color=LINIE, num_format='"Summe "0')
                    conf.setdefault('summenzeilen', []).append(r)
                orig = (t['r1'] + 1 + k, t['c1'] + i)
                schreibe_zelle(ws, r, c, z, fmt, url=links.get(orig))
        ws.set_row(r1, 36)
        for k in range(len(zeilen)):
            ws.set_row(r1 + 1 + k, 22 if (r1 + 1 + k) in conf.get('summenzeilen', []) else conf['hoehe'])
        conf.setdefault('tabellen_lage', {})[t['name']] = (r1, c1, r2, c2)
    return


def bereich_zellen(sqref):
    return set((r, c) for r, c in xlsxroh.sqref_zellen(sqref))


def dv_und_cf(ws, st, bname, conf):
    """Datenueberpruefungen (als normale Listen mit Bezug auf Listen & Parameter) und bedingte Formate (gleiche Regeln
    und Reihenfolge, neue Farben, davor Zusatzregeln fuer bereit/in Durchfuehrung/offen/nein)."""
    b = A.blatt_nach_name[bname]
    dr, dc = conf['dr'], conf['dc']
    for dv in b['datenpruefungen']:
        sq = sqref_verschieben(dv['sqref'], dr, dc)
        teile = sq.split()
        o = {'validate': 'list', 'source': '=' + dv['formel1'], 'ignore_blank': dv.get('allowBlank') == '1',
             'show_error': dv.get('showErrorMessage') == '1', 'show_input': dv.get('showInputMessage') == '1'}
        if len(teile) > 1:
            o['multi_range'] = sq
        ws.data_validation(teile[0], o)
    luecken_listen(ws, st, bname, conf)
    regeln = sorted(b['bed_formate'], key=lambda x: x['prioritaet'])
    # Zusatzregeln zuerst (hoehere Prioritaet): bereit blau, in Durchfuehrung amber, offen grau, nein grau
    gesehen = set()
    for cf in regeln:
        sq = sqref_verschieben(cf['sqref'], dr, dc)
        if sq in gesehen:
            continue
        gesehen.add(sq)
        zusatz_regeln(ws, st, sq)
    for cf in regeln:
        sq = sqref_verschieben(cf['sqref'], dr, dc)
        f = formel_verschieben(cf['formeln'][0], dr, dc)
        art = regel_art(cf['formeln'][0])
        o = {'type': 'formula', 'criteria': '=' + f, 'format': cf_format(st, art)}
        if cf.get('stopIfTrue') == '1':
            o['stop_if_true'] = True
        teile = sq.split()
        if len(teile) > 1:
            o['multi_range'] = sq
        ws.conditional_format(teile[0], o)
    # Auswahllisten mit Status (ja/nein …), die im Original keine Farbregel haben (z. B. „Hostzustand bestätigt“):
    # gleiche Pillenregeln wie die übrigen Statusspalten
    mit_regel = set()
    for cf in b['bed_formate']:
        mit_regel |= set(xlsxroh.sqref_zellen(cf['sqref']))
    for dv in b['datenpruefungen']:
        if dv.get('formel1') not in STATUS_LISTEN:
            continue
        for teil in dv['sqref'].split():
            if not set(xlsxroh.sqref_zellen(teil)) & mit_regel:
                zusatz_regeln(ws, st, sqref_verschieben(teil, dr, dc), auch_ja=True)
    zeilen_regeln(ws, st, bname, conf)


# Zeilen, deren Formel „BLOCKIERT“ meldet, rot kennzeichnen (Schlüssel als rote Pille, Formeltext rot); technische
# Datensätze (Weg B) gedämpft. (Tabelle, Prüfspalte, rote Pille, rote Schrift, gedämpft wenn Spalte = Wert)
ZEILEN_REGELN = {
    'To-do Vertragsmapping': ('tblVertragsmapping', 'Konkreter Arbeitsauftrag', ['Mapping-ID'], ['Konkreter Arbeitsauftrag'],
                              None),
    'To-do Mailerstellung': ('tblMailAuftraege', 'Betreff konkret', ['Mail-Auftrags-ID'],
                             ['Betreff konkret', 'Mailtext / konkrete Inhaltsvorgabe'], ('Auftragsart', 'technischer Datensatz')),
}


def zeilen_regeln(ws, st, bname, conf):
    if bname not in ZEILEN_REGELN:
        return
    tname, pruef, pillen, texte, gedaempft = ZEILEN_REGELN[bname]
    t = A.tabellen[tname]
    namen = [s_['name'] for s_ in t['spalten']]
    r1, c1, r2, c2 = conf['tabellen_lage'][tname]
    spalte = lambda n: c1 + namen.index(n)
    erste = r1 + 1
    pz = '$%s%d' % (xl_col_to_name(spalte(pruef)), erste + 1)
    bed = '=LEFT(%s,9)="BLOCKIERT"' % pz
    for n in pillen:
        c = spalte(n)
        ws.conditional_format(erste, c, r2, c, {'type': 'formula', 'criteria': bed, 'format': cf_format(st, 'rot')})
    rot_text = st.cache.get(('cf', 'rot_text')) or st.wb.add_format({'font_color': ROT})
    st.cache[('cf', 'rot_text')] = rot_text
    for n in texte:
        c = spalte(n)
        ws.conditional_format(erste, c, r2, c, {'type': 'formula', 'criteria': bed, 'format': rot_text})
    if gedaempft:
        gs, gw = gedaempft
        gz = '$%s%d' % (xl_col_to_name(spalte(gs)), erste + 1)
        ws.conditional_format(erste, c1, r2, c2, {'type': 'formula', 'criteria': '=%s="%s"' % (gz, gw),
                                                   'format': grau_schrift(st)})


def grau_schrift(st):
    if ('cf', 'grauschrift') not in st.cache:
        st.cache[('cf', 'grauschrift')] = st.wb.add_format({'font_color': '#98A2B3', 'bg_color': '#F7F8FA'})
    return st.cache[('cf', 'grauschrift')]


LUECKEN_DV = {   # Tabelle, Spalte, Liste in Listen & Parameter, Pillen ja/nein
    'Stammdaten': [('tblAbgebendeAgenturen', 'Status', "'Listen & Parameter'!$A$2:$A$6", True),
                   ('tblAbgebendeAgenturen', 'Owner', "'Listen & Parameter'!$E$2:$E$8", False)],
    'To-do Mailerstellung': [('tblMailAuftraege', 'Auftragsart', "'Listen & Parameter'!$F$2:$F$3", False)],
}


def luecken_listen(ws, st, bname, conf):
    """Ergaenzt Auswahllisten, die im Original fehlten (vergleich.py: HINWEIS „zusaetzlich“)."""
    for tname, sname, quelle, pille in LUECKEN_DV.get(bname, []):
        t = A.tabellen[tname]
        c = t['c1'] + [s_['name'] for s_ in t['spalten']].index(sname) + conf['dc'] - 1
        r1, r2 = t['r1'] + conf['dr'], t['r2'] + conf['dr'] - 1
        ws.data_validation(r1, c, r2, c, {'validate': 'list', 'source': '=' + quelle})
        if pille:
            zusatz_regeln(ws, st, '%s:%s' % (xl_rowcol_to_cell(r1, c), xl_rowcol_to_cell(r2, c)), auch_ja=True)


def regel_art(formel):
    f = formel.lower()
    if '"ja"' in f or '"erledigt"' in f:
        return 'gruen'
    if '"blockiert"' in f or '"nein"' in f:
        return 'rot'
    if 'nicht erforderlich' in f:
        return 'hell'
    if '"offen"' in f:
        return 'grau'
    return 'grau'


def zusatz_regeln(ws, st, sq, auch_ja=False):
    """Pillen-Regeln fuer Statuswerte, die das Original gemeinsam mit anderen faerbt (vor den Originalregeln)."""
    teile = sq.split()
    erste = teile[0].split(':')[0]
    # Formel bewusst als LOWER(..)= geschrieben: inhaltlich gleich, aber von den Originalregeln unterscheidbar
    # (vergleich.py ordnet Regeln ueber ihre Formel zu; die Originalreihenfolge bleibt so eindeutig pruefbar).
    for wert, art in (('bereit', 'blau'), ('in Durchführung', 'amber'), ('offen', 'leise'), ('nein', 'leise')):
        o = {'type': 'formula', 'criteria': '=LOWER(%s)="%s"' % (erste.replace('$', ''), wert.lower()),
             'format': cf_format(st, art)}
        if len(teile) > 1:
            o['multi_range'] = sq
        ws.conditional_format(teile[0], o)
    if auch_ja:
        for wert, art in (('ja', 'gruen'), ('erledigt', 'gruen'), ('blockiert', 'rot'), ('nicht erforderlich', 'hell'),
                          ('fehlt', 'amber'), ('gepflegt', 'gruen'), ('optional', 'hell'), ('vorbelegt', 'hell')):
            o = {'type': 'formula', 'criteria': '=LOWER(%s)="%s"' % (erste.replace('$', ''), wert.lower()),
                 'format': cf_format(st, art)}
            if len(teile) > 1:
                o['multi_range'] = sq
            ws.conditional_format(teile[0], o)


# ------------------------------------------------------------------ Standardblatt (verschobener Originalinhalt)
def pillen_bereiche(bname, conf):
    """Neue Zellen (0-basiert), die als Status-Pille gestaltet werden: Bereiche mit Status-/Ja-Nein-Listen oder Regeln."""
    b = A.blatt_nach_name[bname]
    dr, dc = conf['dr'], conf['dc']
    zellen = set()
    for dv in b['datenpruefungen']:
        if dv.get('formel1') in STATUS_LISTEN:
            for r, c in xlsxroh.sqref_zellen(dv['sqref']):
                zellen.add((r + dr - 1, c + dc - 1))
    for cf in b['bed_formate']:
        for r, c in xlsxroh.sqref_zellen(cf['sqref']):
            zellen.add((r + dr - 1, c + dc - 1))
    for tname, sname, quelle, pille in LUECKEN_DV.get(bname, []):
        if pille:
            t = A.tabellen[tname]
            c = t['c1'] + [s_['name'] for s_ in t['spalten']].index(sname)
            for r in range(t['r1'] + 1, t['r2'] + 1):
                zellen.add((r + dr - 1, c + dc - 1))
    return zellen


def spaltenbreiten(ws, st, bname, conf):
    b = A.blatt_nach_name[bname]
    dc = conf['dc']
    breiten = {}
    for s in b['spalten']:
        for c in range(s['von'], min(s['bis'], 60) + 1):
            breiten[c] = s['breite'] or 9
    # nach Spaltennamen der Tabellen; teilen sich Tabellen eine Spalte, gilt die groesste Breite
    neu = {}
    for t in b['tabellen']:
        for i, s in enumerate(t['spalten']):
            c = t['c1'] + i
            if s['name'] in BREITE_NAME:
                w = BREITE_NAME[s['name']]
            else:
                w = min(max(breiten.get(c, 16) * 0.85, 12), 40)
            w = max(w, kopfwort_breite(s['name']))
            neu[c] = max(neu.get(c, 0), w)
    breiten.update(neu)
    for c, w in conf.get('breiten_extra', {}).items():       # neue Spaltennummer (0-basiert) -> Breite
        breiten[c - conf['dc'] + 1] = w
    ws.set_column(0, 0, 2.3)
    for c, w in breiten.items():
        ws.set_column(c + dc - 1, c + dc - 1, w)
    conf['breiten'] = {c + dc - 1: w for c, w in breiten.items()}


def kopfwort_breite(text):
    """Mindestbreite, damit das laengste Wort einer Kopfzelle (fett, 9 pt) nicht mitten im Wort umbricht."""
    return max(len(w) for w in re.split(r'[ /]+', text) if w) * 1.08 + 2.2


def zelle_ausserhalb(ws, st, bname, conf, ref, z, rolle, mergen):
    r0, c0 = xlsxroh.zelle_split(ref)
    r, c = r0 + conf['dr'] - 1, c0 + conf['dc'] - 1
    fmts = {
        'abschnitt': st.f(bold=True, font_size=12, font_color=BAND, valign='bottom'),
        'zaehler_text': st.f(font_size=9, font_color=GRAU, valign='vcenter', align='right'),
        'zaehler_zahl': st.f(bold=True, font_size=13, font_color=TEAL, valign='vcenter', align='left', indent=1),
        # Kennzahlen stehen als Kacheln (Formen, gleicher Stil wie im Cockpit) über den Zellen; die Zellen tragen die
        # Werte unsichtbar weiter (Zahl per Textverknüpfung in der Kachel)
        'kpi_zahl': st.f(font_size=8, font_color=WEISS, valign='top'),
        'kpi_text': st.f(font_size=8, font_color=WEISS, valign='top'),
        'fliesstext': st.f(font_size=9.5, font_color=TEXT2, text_wrap=True, valign='vcenter', bg_color=FLAECHE2,
                           left=5, left_color='#C9D2DB', align='left', indent=1),
        'pn_kopf': st.kopf(),
        'text': st.f(text_wrap=False),
    }
    fmt = fmts.get(rolle, fmts['text'])
    if ref in mergen:
        rr1, cc1, rr2, cc2 = mergen[ref]
        art, w = wert_typ(z)
        if z and z['formel']:
            ws.merge_range(rr1, cc1, rr2, cc2, '', fmt)
            schreibe_zelle(ws, r, c, z, fmt)
        else:
            ws.merge_range(rr1, cc1, rr2, cc2, w if w is not None else '', fmt)
    else:
        schreibe_zelle(ws, r, c, z, fmt)
    ZU_ZELLEN['%s!%s' % (bname, ref)] = '%s!%s' % (bname, xl_rowcol_to_cell(r, c))


def kachel(ws, x, y, b, h, nr, zahl_ref, wert, text, praefix='KACHEL'):
    """Kennzahl-Kachel wie im Cockpit: weiße Fläche mit Rand, Teal-Akzent links, Zahl (Textverknüpfung) und Bezeichnung."""
    flaeche(ws, x, y, b, h, name='%s_%d' % (praefix, nr), fill=WEISS, linie=LINIE2)
    flaeche(ws, x, y, 5, h, name='%s_%d_Akzent' % (praefix, nr), fill=TEAL, rund=False)
    flaeche(ws, x + 18, y + 8, b - 26, 40, name='%s_%d_Zahl' % (praefix, nr), fill=None, textlink='=' + zahl_ref,
            cache=str(wert), schrift={'size': 22, 'bold': True, 'color': BAND},
            ausrichtung={'vertical': 'bottom', 'horizontal': 'left'}, rund=False, innen0=True)
    flaeche(ws, x + 18, y + 52, b - 26, h - 58, text, name='%s_%d_Text' % (praefix, nr), fill=None,
            schrift={'size': 9, 'color': TEXT2}, ausrichtung={'vertical': 'top', 'horizontal': 'left'}, rund=False,
            innen0=True)


def kpi_kacheln(ws, st, bname, conf, rollen):
    """Kennzahlen der Herleitungsblätter (Original A5/C5/E5/G5 mit Bezeichnung darunter) als gleich breite Kacheln."""
    zahlen = sorted([r for r, v in rollen.items() if v == 'kpi_zahl'], key=lambda r: xlsxroh.zelle_split(r)[1])
    if not zahlen:
        return
    b = A.blatt_nach_name[bname]
    r0 = xlsxroh.zelle_split(zahlen[0])[0] + conf['dr'] - 1          # neue Zeile der Zahlen (0-basiert)
    assert r0 == 6, (bname, r0)                                       # direkt unter der Legendenzeile
    ws.set_row(r0, 46)
    ws.set_row(r0 + 1, 40)
    y = int(sum(BAND_H) * PX + 3 * PX + 24 * PX + 6) + 1
    t = b['tabellen'][0]
    breite = sum(px_spalte(conf['breiten'].get(t['c1'] + conf['dc'] - 1 + i, 9)) for i in range(len(t['spalten'])))
    luecke = 14
    kb = int((breite - (len(zahlen) - 1) * luecke) / len(zahlen))
    for k, ref in enumerate(zahlen):
        r_, c_ = xlsxroh.zelle_split(ref)
        textref = xlsxroh.adr(r_ + 1, c_)
        z = b['zellen'][ref]
        neu = xl_rowcol_to_cell(r0, c_ + conf['dc'] - 1, row_abs=True, col_abs=True)
        kachel(ws, 21 + k * (kb + luecke), y, kb, int((46 + 40) * PX) - 8, k + 1, neu, z['wert'],
               str(b['zellen'][textref]['wert']), praefix='KPI')


def standardblatt(wb, ws, st, bname):
    conf = BLAETTER[bname]
    conf.setdefault('dc', 1)
    b = A.blatt_nach_name[bname]
    ws.hide_gridlines(2)
    ws.set_zoom(100)
    ws.set_tab_color(REGISTER[conf['gruppe']])
    spaltenbreiten(ws, st, bname, conf)
    # Kopfband
    def text_aus(quelle):
        if quelle[0] == 'zelle':
            z = b['zellen'][quelle[1]]
            ZU_ZELLEN['%s!%s' % (bname, quelle[1])] = None          # wird unten gesetzt
            return z['wert']
        return quelle[1]
    titel = text_aus(conf['titel'])
    satz = text_aus(conf['satz'])
    knoepfe = [('Zur Übersicht', None, "internal:'Start & Übersicht'!A1", 'band')]
    if conf.get('volltext'):
        knoepfe.insert(0, ('Volltext ein/aus', 'modNav.VolltextUmschalten', None, 'band'))
    if conf.get('testmail'):
        knoepfe.insert(0, ('Testmail erstellen', 'modTestmail.TestmailStarten', None, 'primaer'))
    kopfband(ws, st, bname, conf['kicker'], titel, satz, knoepfe)
    for quelle, zelle in ((conf['titel'], 'B2'), (conf['satz'], 'B3')):
        if quelle[0] == 'zelle':
            ZU_ZELLEN['%s!%s' % (bname, quelle[1])] = '%s!%s' % (bname, zelle)
    for ref, grund in conf.get('ersetzt', {}).items():
        ZU_IGNORIEREN.append('%s!%s' % (bname, ref))
        ZU_BEGRUENDUNG['%s!%s' % (bname, ref)] = grund
    # Leiste (Zeile 6): Legende
    ws.set_row(5, 24)
    pillen = pillen_bereiche(bname, conf)
    hat_eingabe = bname in ('Stammdaten', 'To-do Vertragsmapping', 'To-do Mailerstellung', 'Testfall-Tracking')
    rollen = ROLLEN.get(bname, {})
    legende(ws, st, 5, 1, mit_eingabe=hat_eingabe, volltext=conf.get('volltext', False))
    # Tabellen
    originaltabellen_schreiben(ws, st, bname, conf, pillen)
    # Zellen ausserhalb der Tabellen
    mergen = {}
    for m in b['verbunden']:
        r1, c1, r2, c2 = xlsxroh.bereich_split(m)
        if any(t['r1'] <= r1 <= t['r2'] and t['c1'] <= c1 <= t['c2'] for t in b['tabellen']):
            continue
        mergen[xlsxroh.adr(r1, c1)] = (r1 + conf['dr'] - 1, c1 + conf['dc'] - 1, r2 + conf['dr'] - 1, c2 + conf['dc'] - 1)
    absorbiert = set()
    for q in (conf['titel'], conf['satz']):
        if q[0] == 'zelle':
            absorbiert.add(q[1])
    absorbiert |= set(conf.get('ersetzt', {}).keys())
    if bname == 'BE Übersicht':
        absorbiert |= pn_katalog(ws, st, conf)
    for ref, z in sorted(b['zellen'].items(), key=lambda kv: xlsxroh.zelle_split(kv[0])):
        r0, c0 = xlsxroh.zelle_split(ref)
        if any(t['r1'] <= r0 <= t['r2'] and t['c1'] <= c0 <= t['c2'] for t in b['tabellen']):
            continue
        if ref in absorbiert:
            continue
        if (z['wert'] is None or z['wert'] == '') and not z['formel']:
            continue
        if r0 + conf['dr'] - 1 > 1000:          # Streuzeile 1048574 auf BE Übersicht
            continue
        zelle_ausserhalb(ws, st, bname, conf, ref, z, rollen.get(ref, 'text'), mergen)
    # Zeilenhoehen der Zeilen ausserhalb von Tabellen
    for zi in b['zeilen']:
        r = zi['r'] + conf['dr'] - 1
        if r <= 5 or zi['r'] > 1000:
            continue
        if any(t['r1'] <= zi['r'] <= t['r2'] for t in b['tabellen']):
            continue
        if bname == 'BE Übersicht' and 22 <= zi['r'] <= 29:
            continue
        if zi.get('ht'):
            ws.set_row(r, max(float(zi['ht']), 8))
    kpi_kacheln(ws, st, bname, conf, rollen)
    dv_und_cf(ws, st, bname, conf)
    # Kommentare (verkettete Kommentare des Originals als Notiz)
    for k in b['verkettete_kommentare']:
        if k.get('parentId'):
            continue
        r0, c0 = xlsxroh.zelle_split(k['ref'])
        ws.write_comment(r0 + conf['dr'] - 1, c0 + conf['dc'] - 1, (k['text'] or '').strip(),
                         {'author': 'Jeglorz, Marco', 'x_scale': 2.6, 'y_scale': 1.6, 'font_name': FONT, 'font_size': 9})
    if conf.get('volltext'):
        wb.define_name("'%s'!Kompakthoehe" % bname, '=%s' % conf['hoehe'])
    # Fixierung: nur Kopfband bzw. Tabellenkopf (Zeilen). Fixierte Schlüsselspalten (xfreeze) schnitten in Excel den Kopftext
    # (Untertitel, Legende) an der Fixierlinie ab – Excel zeichnet überlaufenden Text nicht in den rechten Bereich.
    if conf.get('freeze') == 'tabelle' and b['tabellen']:
        t = b['tabellen'][0]
        ws.freeze_panes(t['r1'] + conf['dr'], 0)
    else:
        ws.freeze_panes(5, 0)
    ws.set_landscape()
    ws.set_paper(9)
    ws.fit_to_pages(1, 0)
    ws.repeat_rows(0, 3)
    return conf


# ------------------------------------------------------------------ Listen & Parameter
LUECKEN = ['Datum fehlt', 'Vollmachtsumfang fehlt', 'Anschrift fehlt', 'keine']


def listenblatt(ws, st):
    conf = BLAETTER['Listen & Parameter']
    conf.update(dr=0, dc=0)
    b = A.blatt_nach_name['Listen & Parameter']
    ws.set_tab_color(REGISTER['listen'])
    ws.hide_gridlines(2)
    for s in b['spalten']:
        ws.set_column(s['von'] - 1, s['bis'] - 1, s['breite'])
    ws.set_column(9, 9, 3)
    ws.set_column(10, 10, 26)
    ws.set_row(0, 42)
    for ref, z in b['zellen'].items():
        r0, c0 = xlsxroh.zelle_split(ref)
        fmt = st.kopf() if r0 == 1 else st.zelle('neutral', wrap=False)
        schreibe_zelle(ws, r0 - 1, c0 - 1, z, fmt)
    # Ergaenzte Liste fuer den Testmail-Generator
    ws.write_string(0, 10, 'Unterlagenlücke PN-01 (Generator)', st.kopf())
    for i, w in enumerate(LUECKEN):
        ws.write_string(1 + i, 10, w, st.zelle('neutral', wrap=False))
    ws.hide()


# ------------------------------------------------------------------ Testmail-Generator
EINSTELLUNGEN = [
    # schluessel, Bereich, Bezeichnung, Vorbelegung, Pflicht, Erlaeuterung
    ('EmpfaengerAdresse', 'Empfänger', 'Empfänger: Adresse', 'CelonisBueMakler@ergo.de', True,
     'Postfach, in das bestandsuebertragung@ergo.de und maklerauftraege@ergo.de weiterleiten – von dort eröffnet der Prüfbot den Vorgang in der ABN. Der Postkorb steht nicht in der Mail.'),
    ('AbsenderAdresse', 'Absender', 'Absender-Postfach: Adresse', 'CelonisBUEStrukturierung@ergo.de', True,
     'Aus diesem einen Postfach kommen alle Testmails – keine eigenen Absender je Mailvariante. Die Signatur im Mailtext nennt die Agentur aus den Stammdaten.'),
    ('Ort', 'Dokumente', 'Ort der Unterschrift', '', False,
     'Ort auf den Dokumenten, wenn zur Person keine Anschrift mit Ort hinterlegt ist (leer = Feld bleibt leer).'),
    ('Datum', 'Dokumente', 'Datum der Unterschrift', '', False, 'Leer = Tag der Erstellung. Format TT.MM.JJJJ.'),
    ('Testvermerk', 'Dokumente', 'Testvermerk in der Fußzeile', 'ja', False,
     'ja = kleine Fußzeile „Testdokument Prüfbot | MAIL-xxx | TF-xx | erstellt …“ auf jedem PDF.'),
    ('Ordner', 'Ablage', 'Ausgabeordner', '', False,
     'Leer = Ordner „Pruefbot_Testmails“ neben dieser Datei, auch in einer synchronisierten SharePoint-Bibliothek. '
     'Nur über SharePoint (https) geöffnet: direkt in „Pruefbot_Testmails“ daneben auf SharePoint – den Ordner dort '
     'einmal anlegen; dort liegt nur die EML (Vollmacht-PDFs als Anhang darin), EML und PDFs zusätzlich als '
     'Arbeitskopie in Dokumente\\Pruefbot_Testmails. Eintrag: lokaler Pfad oder https-Adresse eines Ordners.'),
]
PFLICHT_ANZ = sum(1 for e in EINSTELLUNGEN if e[4])

# tblGeneratorEingaben: (Spaltenname, Breite, Art) – Art: key | formel | eingabe | datum | notiz
EINGABE_COLS = [
    ('Mail-Auftrags-ID', 14, 'key'),
    ('Testfall-ID', 11, 'formel'),
    ('Variante', 9, 'formel'),
    ('Benötigte Angaben', 40, 'formel'),
    ('Anschrift Versicherungsnehmer', 30, 'eingabe'),
    ('Vertretungsberechtigte Person (Firmenkunde)', 20, 'eingabe'),
    ('Person: Name / Firma', 18, 'eingabe'),
    ('Person: Vorname', 15, 'eingabe'),
    ('Person: Geburtsdatum', 13, 'datum'),
    ('IS011 ohne Treffer geprüft', 12, 'eingabe'),
    ('Abweichendes Geburtsdatum', 13, 'datum'),
    ('Abweichender Vermittler (Agentur-ID)', 13, 'eingabe'),
    ('Untermakler: Name / Firma', 20, 'eingabe'),
    ('Untermakler: Registernummer', 16, 'eingabe'),
    ('Untermakler: E-Mail', 22, 'eingabe'),
    ('Unterlagenanforderung / Folgearbeiten', 30, 'eingabe'),
    ('Unterlagenlücke für PN-01', 17, 'eingabe'),
    ('Registernummer Bevollmächtigter', 16, 'eingabe'),
    ('Anschrift Bevollmächtigter', 26, 'eingabe'),
    ('Notiz', 34, 'notiz'),
]
# fuer welche Varianten eine Eingabespalte gebraucht wird (sonst grau); None = alle Testmails (optional)
RELEVANZ = {
    'Anschrift Versicherungsnehmer': None, 'Vertretungsberechtigte Person (Firmenkunde)': None,
    'Person: Name / Firma': ('M-10', 'M-11'), 'Person: Vorname': ('M-10', 'M-11'),
    'Person: Geburtsdatum': ('M-10', 'M-11'), 'IS011 ohne Treffer geprüft': ('M-11',),
    'Abweichendes Geburtsdatum': ('M-09', 'M-13'), 'Abweichender Vermittler (Agentur-ID)': ('M-07',),
    'Untermakler: Name / Firma': ('M-03',), 'Untermakler: Registernummer': ('M-03',), 'Untermakler: E-Mail': ('M-03',),
    'Unterlagenanforderung / Folgearbeiten': ('M-03',), 'Unterlagenlücke für PN-01': ('M-13',),
    'Registernummer Bevollmächtigter': None, 'Anschrift Bevollmächtigter': None,
}
PFLICHT_EINGABE = {'Person: Name / Firma': ('M-10', 'M-11'), 'Person: Vorname': ('M-10', 'M-11'),
                   'Person: Geburtsdatum': ('M-10', 'M-11'), 'Abweichender Vermittler (Agentur-ID)': ('M-07',),
                   'Untermakler: Name / Firma': ('M-03',), 'Unterlagenanforderung / Folgearbeiten': ('M-03',),
                   'Unterlagenlücke für PN-01': ('M-13',)}
VORBELEGUNG = {   # Mail-Auftrags-ID -> {Spalte: Wert}
    'MAIL-008': {'Abweichender Vermittler (Agentur-ID)': 'A-01',
                 'Notiz': 'Vorschlag: A-01 (vorhandene, von der MFA A-04 verschiedene Agentur) – fachlich bestätigen.'},
    'MAIL-003': {'Notiz': 'Annahme: A-03 ist der Pool (Hauptbevollmächtigter); die Untervollmacht geht an den hier '
                          'eingetragenen Untermakler.'},
    'MAIL-011': {'Notiz': 'Fiktive Person vorher in IS011 ohne Treffer prüfen und „ja“ setzen.'},
    'MAIL-012': {'Notiz': 'Versicherte Person aus V08-01, die nicht Versicherungsnehmer ist.'},
    'MAIL-013': {'Notiz': 'Leer = Versicherungsnehmer aus V03-K01 (Stammdaten), sobald dort gepflegt.'},
    'MAIL-019': {'Notiz': 'Lücke fachlich bestätigen (Tanja / Robotics): sie soll PN-01 auslösen, aber keine harte BE.'},
}
PROTOKOLL_COLS = [('Zeitpunkt', 'datumzeit'), ('Mail-Auftrags-ID', 'text'), ('Variante', 'text'), ('Datei', 'text'),
                  ('Anhänge', 'text'), ('Fehlende Werte', 'zahl'), ('Trotz fehlender Werte erstellt', 'text'),
                  ('Erstellt von', 'text')]


def benoetigt_formel(zeile_ref):
    v = 'tblGeneratorEingaben[[#This Row],[Variante]]'
    t = 'tblGeneratorEingaben[[#This Row],[Testfall-ID]]'
    return ('=IF(%s="","",IF(%s="M-03","Untermakler und Unterlagenanforderung (Pflicht)",IF(%s="M-07",'
            '"Abweichender Vermittler (Pflicht)",IF(%s="M-09","IMSI-Geburtsdatum in den Stammdaten; bei Tag = Monat '
            'oder Tag > 12 ein abweichendes Geburtsdatum",IF(%s="M-10","Andere vorhandene Person: Name, Vorname, '
            'Geburtsdatum (Pflicht)"&IF(%s="TF-KU-04"," – leer: VN aus V03-K01",""),IF(%s="M-11","Fiktive Person: '
            'Name, Vorname, Geburtsdatum (Pflicht); IS011 prüfen",IF(%s="M-13","Unterlagenlücke für PN-01 (Pflicht); '
            'IMSI-Geburtsdatum in den Stammdaten",IF(%s="Weg B","keine Mail – technischer Datensatz",'
            '"keine Zusatzangaben nötig"))))))))' % (v, v, v, v, v, t, v, v, v))


def generatorblatt(wb, ws, st, auftraege, varianten):
    name = GENERATOR
    ws.hide_gridlines(2)
    ws.set_zoom(100)
    ws.set_tab_color(REGISTER['werkzeug'])
    ws.set_column(0, 0, 2.3)
    for i, (n, w, a) in enumerate(EINGABE_COLS):
        ws.set_column(1 + i, 1 + i, w)
    kopfband(ws, st, name, 'WERKZEUG  ·  SCHRITT C', 'Testmail-Generator',
             'Erzeugt aus den hinterlegten Daten eine Testmail (EML) mit ausgefüllter und unterschriebener Vollmacht als '
             'PDF-Anhang.',
             [('Testmail erstellen', 'modTestmail.TestmailStarten', None, 'primaer'),
              ('Mail-Aufträge', None, "internal:'To-do Mailerstellung'!A1", 'band'),
              ('Zur Übersicht', None, "internal:'Start & Übersicht'!A1", 'band')])
    ws.set_row(5, 24)
    legende(ws, st, 5, 1, mit_eingabe=True, generator=True)
    # So funktioniert es (Zeilen 8–9)
    ws.set_row(6, 10)
    ws.set_row(7, 18)
    ws.set_row(8, 34)
    schritte = [('1', 'Einstellungen pflegen', 'Empfänger und Absender sind vorbelegt (ein Postfach für alle Testmails).'),
                ('2', 'Ergänzende Testdaten', 'Je Mail-Auftrag nur die orange markierten Angaben ergänzen.'),
                ('3', 'Testmail erstellen', 'Auftrag wählen; fehlt etwas, zeigt die Karte wo – oder trotzdem erstellen.'),
                ('4', 'Öffnen und senden', 'EML in Outlook öffnen, Absender auf das Absender-Postfach stellen und senden.')]
    # vier etwa gleich breite Felder über die Spalten der Eingabetabelle
    bp = [px_spalte(w) for (n, w, a) in EINGABE_COLS]
    ziel = sum(bp[:16]) / 4.0
    spans, c, acc = [], 1, 0
    for k in range(4):
        c_start, acc = c, 0
        while c <= len(bp) and (acc + bp[c - 1] / 2.0 < ziel or c == c_start):
            acc += bp[c - 1]
            c += 1
        spans.append((c_start, c - 1))
    schritte = [t + sp for t, sp in zip(schritte, spans)]
    ws.set_row(8, 30)
    for nr, kopf_t, text, c1, c2 in schritte:
        f1 = st.f(bold=True, font_size=10, font_color=TEAL_D, bg_color=TEAL_XL, valign='bottom', left=5, left_color=TEAL,
                  indent=1, right=2, right_color=WEISS)
        f2 = st.f(font_size=9, font_color=TEXT2, bg_color=TEAL_XL, text_wrap=True, valign='top', left=5, left_color=TEAL,
                  indent=1, right=2, right_color=WEISS)
        if c2 > c1:
            ws.merge_range(7, c1, 7, c2, '%s   %s' % (nr, kopf_t), f1)
            ws.merge_range(8, c1, 8, c2, text, f2)
        else:
            ws.write_string(7, c1, '%s   %s' % (nr, kopf_t), f1)
            ws.write_string(8, c1, text, f2)
    # Einstellungen ab Zeile 11 (0-basiert 10)
    r0 = 10
    ws.set_row(r0, 22)
    ws.write_string(r0, 1, 'Einstellungen', st.f(bold=True, font_size=12, font_color=BAND, valign='bottom'))
    kopf = r0 + 1
    ws.set_row(kopf, 24)
    ws.merge_range(kopf, 1, kopf, 3, 'Einstellung', st.kopf())
    ws.write_string(kopf, 4, 'Wert', st.kopf())
    ws.merge_range(kopf, 5, kopf, 9, 'Erläuterung', st.kopf())
    ws.write_string(kopf, 10, 'Status', st.kopf(mittig=True))
    namen = {}
    for i, (sch, ber, bez, vor, pflicht, erl) in enumerate(EINSTELLUNGEN):
        r = kopf + 1 + i
        # zwei Zeilen Erläuterung passen in 34 pt; längere (Ausgabeordner) bekommen je Zeile 11,5 pt mehr
        nz = zeilen_noetig(erl, sum(px_spalte(EINGABE_COLS[k][1]) for k in range(4, 9)), groesse=8.5)
        ws.set_row(r, 34 if nz <= 2 else 11.5 * nz + 11)
        # Einstellung, Wert und Erläuterung vertikal mittig (zweizeilige Beschriftung neben einzeiligen Werten)
        rahmen = dict(text_wrap=True, bottom=1, bottom_color=LINIE, left=1, left_color=LINIE, right=1, right_color=LINIE,
                      indent=1, valign='vcenter')
        ws.merge_range(r, 1, r, 3, '', st.f(**rahmen))
        ws.write_rich_string(r, 1, st.f(font_size=8, font_color=GRAU), ber.upper() + '\n', st.f(bold=True), bez,
                             st.f(**rahmen))
        datum = sch == 'Datum'
        ws.write(r, 4, vor, st.f(bg_color=EINGABE, **rahmen, **({'num_format': 'dd.mm.yyyy'} if datum else {})))
        ws.merge_range(r, 5, r, 9, erl, st.f(font_size=8.5, font_color=TEXT2, text_wrap=True, bottom=1, bottom_color=LINIE,
                                             indent=1, valign='vcenter'))
        zelle = xl_rowcol_to_cell(r, 4)
        if pflicht:
            formel = '=IF(LEN(TRIM(%s))=0,"fehlt","gepflegt")' % zelle
            wert = 'gepflegt' if vor else 'fehlt'
        elif vor:
            formel = '=IF(LEN(TRIM(%s))=0,"optional",IF(%s="%s","vorbelegt","gepflegt"))' % (zelle, zelle, vor)
            wert = 'vorbelegt'
        else:
            formel = '=IF(LEN(TRIM(%s))=0,"optional","gepflegt")' % zelle
            wert = 'optional'
        ws.write_formula(r, 10, formel, st.pille('neutral'), wert)
        namen[sch] = "='%s'!$%s$%d" % (name, xl_col_to_name(4), r + 1)
        if sch == 'Testvermerk':
            ws.data_validation(r, 4, r, 4, {'validate': 'list', 'source': "='Listen & Parameter'!$B$2:$B$3"})
    for sch, ref in namen.items():
        wb.define_name('cfg_' + sch, ref)
    erste, letzte = kopf + 1, kopf + len(EINSTELLUNGEN)
    zusatz_regeln(ws, st, '%s:%s' % (xl_rowcol_to_cell(erste, 10), xl_rowcol_to_cell(letzte, 10)), auch_ja=True)
    status_bereich = "'%s'!$K$%d:$K$%d" % (name, erste + 1, letzte + 1)
    # Ergaenzende Testdaten je Mail-Auftrag
    r0 = letzte + 3
    ws.set_row(r0, 22)
    ws.write_string(r0, 1, 'Ergänzende Testdaten je Mail-Auftrag', st.f(bold=True, font_size=12, font_color=BAND, valign='bottom'))
    ws.write_string(r0 + 1, 1, 'Nur nötig für Abweichungen, die die Stammdaten nicht hergeben (andere oder fiktive Person, '
                                'Untermakler, Unterlagenlücke …). Datumsangaben als TT.MM.JJJJ.',
                    st.f(font_size=9, font_color=GRAU))
    kopf = r0 + 2
    n = len(auftraege)
    spalten = []
    for i, (cn, w, art) in enumerate(EINGABE_COLS):
        sp = {'header': cn, 'header_format': st.kopf()}
        if cn == 'Testfall-ID':
            sp['formula'] = ('=IFERROR(INDEX(tblMailAuftraege[Testfall-ID],MATCH(tblGeneratorEingaben[[#This Row],'
                             '[Mail-Auftrags-ID]],tblMailAuftraege[Mail-Auftrags-ID],0))&"","")')
        elif cn == 'Variante':
            sp['formula'] = ('=IFERROR(INDEX(tblMailAuftraege[Mail-ID / Zustand],MATCH(tblGeneratorEingaben[[#This Row],'
                             '[Mail-Auftrags-ID]],tblMailAuftraege[Mail-Auftrags-ID],0))&"","")')
        elif cn == 'Benötigte Angaben':
            sp['formula'] = benoetigt_formel(None)
        spalten.append(sp)
    ws.add_table(kopf, 1, kopf + n, len(EINGABE_COLS), {'name': 'tblGeneratorEingaben', 'columns': spalten, 'style': None})
    ws.set_row(kopf, 40)
    for k, a in enumerate(auftraege):
        r = kopf + 1 + k
        var = a['Mail-ID / Zustand'] or ''
        nz = max(zeilen_noetig(benoetigt_wert(var, a['Testfall-ID']), px_spalte(EINGABE_COLS[3][1])),
                 zeilen_noetig(VORBELEGUNG.get(a['Mail-Auftrags-ID'], {}).get('Notiz', ''), px_spalte(EINGABE_COLS[-1][1]),
                               groesse=8.5))
        ws.set_row(r, zeilen_hoehe(max(nz, 2)))
        for i, (cn, w, art) in enumerate(EINGABE_COLS):
            c = 1 + i
            if cn == 'Mail-Auftrags-ID':
                ws.write_string(r, c, a['Mail-Auftrags-ID'], st.zelle('id'))
            elif cn == 'Testfall-ID':
                ws.write_formula(r, c, spalten[i]['formula'], st.zelle('berechnet'), a['Testfall-ID'] or '')
            elif cn == 'Variante':
                ws.write_formula(r, c, spalten[i]['formula'], st.zelle('berechnet', mittig=True), var)
            elif cn == 'Benötigte Angaben':
                ws.write_formula(r, c, spalten[i]['formula'], st.zelle('berechnet'), benoetigt_wert(var, a['Testfall-ID']))
            else:
                v = VORBELEGUNG.get(a['Mail-Auftrags-ID'], {}).get(cn, '')
                fmt = st.zelle('neutral' if art == 'notiz' else 'eingabe', zahl='dd.mm.yyyy' if art == 'datum' else None)
                if art == 'notiz':
                    fmt = st.f(font_size=8.5, font_color=TEXT2, text_wrap=True, bottom=1, bottom_color=LINIE, indent=1)
                if v:
                    ws.write_string(r, c, v, fmt)
                else:
                    ws.write_blank(r, c, None, fmt)
    tab_r1, tab_r2 = kopf + 1, kopf + n
    # Relevanz: grau = ohne Bedeutung, orange = Pflicht und leer
    var_col = xl_col_to_name(1 + [c[0] for c in EINGABE_COLS].index('Variante'))
    tf_col = xl_col_to_name(1 + [c[0] for c in EINGABE_COLS].index('Testfall-ID'))
    vt = A.tabellen['tblVertraege']
    vt_r1, vt_c1, _, _ = BLAETTER['Stammdaten']['tabellen_lage']['tblVertraege']
    vt_zeile = [r_['Datensatz-ID'] for r_ in tabellen_werte('tblVertraege')].index('V03-K01')
    vt_spalte = [s_['name'] for s_ in vt['spalten']].index('Anonymisierter VN-/Firmenname')
    hilfs_name = "Stammdaten!%s" % xl_rowcol_to_cell(vt_r1 + 1 + vt_zeile, vt_c1 + vt_spalte, row_abs=True, col_abs=True)
    for i, (cn, w, art) in enumerate(EINGABE_COLS):
        if cn not in RELEVANZ:
            continue
        col = xl_col_to_name(1 + i)
        bereich = '%s%d:%s%d' % (col, tab_r1 + 1, col, tab_r2 + 1)
        erste = '%s%d' % (col, tab_r1 + 1)
        vz = '$%s%d' % (var_col, tab_r1 + 1)
        if cn in PFLICHT_EINGABE:
            bed = 'OR(%s)' % ','.join('%s="%s"' % (vz, v) for v in PFLICHT_EINGABE[cn])
            if cn.startswith('Person:'):
                # TF-KU-04: ohne Eingabe übernimmt der Generator den VN aus V03-K01 – nicht orange, sobald dort gepflegt
                bed = 'AND(%s,NOT(AND($%s%d="TF-KU-04",LEN(TRIM(%s))>0)))' % (bed, tf_col, tab_r1 + 1, hilfs_name)
            ws.conditional_format(bereich, {'type': 'formula', 'criteria': '=AND(%s,LEN(TRIM(%s))=0)' % (bed, erste),
                                            'format': noetig_format(st)})
        rel = RELEVANZ[cn]
        if rel is None:
            bed = 'OR(%s="",%s="Weg B")' % (vz, vz)
        else:
            bed = 'AND(%s)' % ','.join('%s<>"%s"' % (vz, v) for v in rel)
        ws.conditional_format(bereich, {'type': 'formula', 'criteria': '=' + bed, 'format': grau_aus(st)})
    # Auswahllisten
    idx = {c[0]: 1 + i for i, c in enumerate(EINGABE_COLS)}
    ws.data_validation(tab_r1, idx['IS011 ohne Treffer geprüft'], tab_r2, idx['IS011 ohne Treffer geprüft'],
                       {'validate': 'list', 'source': "='Listen & Parameter'!$B$2:$B$3"})
    ws.data_validation(tab_r1, idx['Unterlagenlücke für PN-01'], tab_r2, idx['Unterlagenlücke für PN-01'],
                       {'validate': 'list', 'source': "='Listen & Parameter'!$K$2:$K$%d" % (1 + len(LUECKEN))})
    ws.data_validation(tab_r1, idx['Abweichender Vermittler (Agentur-ID)'], tab_r2, idx['Abweichender Vermittler (Agentur-ID)'],
                       {'validate': 'list', 'source': '=INDIRECT("tblAgenturen[Aufnehmende Agentur-ID]")',
                        'show_error': False})
    # Protokoll
    r0 = tab_r2 + 3
    ws.set_row(r0, 22)
    ws.write_string(r0, 1, 'Protokoll der erzeugten Testmails', st.f(bold=True, font_size=12, font_color=BAND, valign='bottom'))
    ws.write_string(r0 + 1, 1, 'Jede erzeugte Testmail wird hier eingetragen (neueste unten). „Datei“ ist ein Link auf die EML.',
                    st.f(font_size=9, font_color=GRAU))
    kopf_p = r0 + 2
    spalten = [{'header': n_, 'header_format': st.kopf()} for n_, a_ in PROTOKOLL_COLS]
    ws.add_table(kopf_p, 1, kopf_p + 1, len(PROTOKOLL_COLS), {'name': 'tblTestmailProtokoll', 'columns': spalten, 'style': None})
    ws.set_row(kopf_p, 30)
    for i, (n_, a_) in enumerate(PROTOKOLL_COLS):
        fmt = st.zelle('neutral', zahl='dd.mm.yyyy hh:mm' if a_ == 'datumzeit' else None, wrap=False)
        ws.write_blank(kopf_p + 1, 1 + i, None, fmt)
    ws.freeze_panes(5, 0)
    ws.set_landscape()
    ws.set_paper(9)
    ws.fit_to_pages(1, 0)
    return {'status_bereich': status_bereich, 'eingaben_lage': (kopf, 1, kopf + n, len(EINGABE_COLS))}


def noetig_format(st):
    """Generator: Pflichtangabe für diesen Auftrag, noch leer – kräftiges Orange mit orangem Rand (deutlich anders als
    das Hellgelb der Eingabezellen)."""
    if ('cf', 'noetig') not in st.cache:
        st.cache[('cf', 'noetig')] = st.wb.add_format({'bg_color': ORANGE, 'font_color': ORANGE_T, 'bold': True,
                                                       'border': 1, 'border_color': ORANGE_R})
    return st.cache[('cf', 'noetig')]


def grau_aus(st):
    if ('cf', 'aus') not in st.cache:
        st.cache[('cf', 'aus')] = st.wb.add_format({'bg_color': '#EEF1F4', 'font_color': '#98A2B3'})
    return st.cache[('cf', 'aus')]


def benoetigt_wert(var, tf):
    return {'M-03': 'Untermakler und Unterlagenanforderung (Pflicht)', 'M-07': 'Abweichender Vermittler (Pflicht)',
            'M-09': 'IMSI-Geburtsdatum in den Stammdaten; bei Tag = Monat oder Tag > 12 ein abweichendes Geburtsdatum',
            'M-10': 'Andere vorhandene Person: Name, Vorname, Geburtsdatum (Pflicht)' + (' – leer: VN aus V03-K01'
                                                                                       if tf == 'TF-KU-04' else ''),
            'M-11': 'Fiktive Person: Name, Vorname, Geburtsdatum (Pflicht); IS011 prüfen',
            'M-13': 'Unterlagenlücke für PN-01 (Pflicht); IMSI-Geburtsdatum in den Stammdaten',
            'Weg B': 'keine Mail – technischer Datensatz', '': ''}.get(var, 'keine Zusatzangaben nötig')


# ------------------------------------------------------------------ Prüfnotizenkatalog (BE Übersicht) als Tabelle
def pn_katalog(ws, st, conf):
    """Der Katalog A22:H29 auf „BE Übersicht“ ist im Original ein loser Bereich; im Neubau eine Tabelle tblPruefnotizen
    (gleiche Zellen, Kopf = Originalkopfzeile). Die Startseite zaehlt die Prüfnotizen daraus."""
    b = A.blatt_nach_name['BE Übersicht']
    dr, dc = conf['dr'], conf['dc']
    kopf = [b['zellen'][xlsxroh.adr(22, c)]['wert'] for c in range(1, 9)]
    r1, c1 = 22 + dr - 1, 1 + dc - 1
    ws.add_table(r1, c1, 29 + dr - 1, 8 + dc - 1, {'name': 'tblPruefnotizen', 'style': None,
                                                     'columns': [{'header': k, 'header_format': st.kopf()} for k in kopf]})
    ws.set_row(r1, 30)
    for r in range(23, 30):
        n = max(zeilen_noetig((b['zellen'].get(xlsxroh.adr(r, c)) or {}).get('wert') or '',
                              px_spalte(conf['breiten'].get(c + dc - 1, 9))) for c in range(1, 9))
        ws.set_row(r + dr - 1, zeilen_hoehe(max(n, 2)))
        for c in range(1, 9):
            z = b['zellen'].get(xlsxroh.adr(r, c))
            schreibe_zelle(ws, r + dr - 1, c + dc - 1, z, st.zelle('id' if c == 1 else 'neutral'))
    for r in range(22, 30):
        for c in range(1, 9):
            ref = xlsxroh.adr(r, c)
            if ref in b['zellen'] and b['zellen'][ref]['wert'] not in (None, ''):
                ZU_ZELLEN['BE Übersicht!%s' % ref] = 'BE Übersicht!%s' % xl_rowcol_to_cell(r + dr - 1, c + dc - 1)
    return {xlsxroh.adr(r, c) for r in range(22, 30) for c in range(1, 9)}


# ------------------------------------------------------------------ Startseite (Cockpit)
START_BREITEN = [2.3, 30, 24, 10, 10, 10, 10, 19, 44, 34, 26, 30, 3, 12, 30]   # A..O (N, O ausgeblendet: Kachelwerte)
START_ZEILEN = {   # Originalzeile -> neue Zeile (0-basiert) fuer Prozessschritte und Voraussetzungen
}


def startseite(wb, ws, st, gen):
    name = 'Start & Übersicht'
    b = A.blatt_nach_name[name]
    Z = lambda ref: b['zellen'].get(ref)
    ws.hide_gridlines(2)
    ws.set_zoom(100)
    ws.set_tab_color(REGISTER['start'])
    for i, w in enumerate(START_BREITEN):
        ws.set_column(i, i, w)
    ws.set_column(13, 14, None, None, {'hidden': True})
    kopfband(ws, st, name, 'COCKPIT', Z('A1')['wert'],
             'Testvorbereitung für den BÜ-Prüfbot: Fortschritt je Prozessschritt, offene Voraussetzungen und der Weg zur '
             'Testmail auf einen Blick.',
             [('Testmail erstellen', 'modTestmail.TestmailStarten', None, 'primaer'),
              ('Testmail-Generator', None, "internal:'%s'!A1" % GENERATOR, 'band')])
    ZU_ZELLEN[name + '!A1'] = name + '!B2'
    # Kennzahlen
    ws.set_row(5, 22)
    ws.write_string(5, 1, 'KENNZAHLEN', st.f(bold=True, font_size=8.5, font_color=TEAL, valign='bottom'))
    for r, h in ((6, 8), (7, 38), (8, 24), (9, 8), (10, 16)):
        ws.set_row(r, h)
    hilfe = st.f(font_size=9, font_color=TEXT2)
    ws.write_string(5, 13, 'Kachelwerte', st.f(bold=True))
    ws.write_string(5, 14, 'Bezeichnung (für die Kacheln oben)', st.f(bold=True))
    matrix_n = A.tabellen['tblMatrix']['datenzeilen']
    be_n = sum(1 for r in tabellen_werte('tblBE') if r['Sortierung'] and '00' < r['Sortierung'] < '90')
    vk_n = A.tabellen['tblVertragskonstellationen']['datenzeilen']
    ma = [r['Mail-ID / Zustand'] for r in tabellen_werte('tblMailanforderungen')]
    m_n = '%d + %d' % (sum(1 for x in ma if x and x.startswith('M-')), sum(1 for x in ma if x == 'Weg B'))
    assert (matrix_n, be_n, m_n) == (21, 14, '13 + 1'), (matrix_n, be_n, m_n)
    kacheln = [
        ('=ROWS(tblMatrix[Testfall-ID])', matrix_n, 'fachliche Testfälle', None),
        # &"": auch eine später als Zahl eingetragene Sortierung (15) zählt als Text mit
        ('=SUMPRODUCT((tblBE[Sortierung]&"">"00")*(tblBE[Sortierung]&""<"90"))', be_n, 'Business Exceptions', None),
        ('=ROWS(tblPruefnotizen[Prüfnotiz-ID])', 7, 'Prüfnotizen', None),
        ('=ROWS(tblVertragskonstellationen[Vertrag-ID])', vk_n, 'Vertragsgrundkonstellationen', None),
        ('=COUNTIF(tblMailanforderungen[Mail-ID / Zustand],"M-*")&" + "&COUNTIF(tblMailanforderungen[Mail-ID / Zustand],'
         '"Weg B")', m_n, 'Mailvarianten / Zustände', None),
        ('B9', Z('B9')['wert'], 'A9', None),
    ]
    for ref, grund in (('A3', 'fachliche Testfälle'), ('C3', 'Business Exceptions'), ('E3', 'Prüfnotizen'),
                       ('A6', 'Vertragsgrundkonstellationen'), ('C6', 'Mailvarianten / Zustände')):
        ZU_IGNORIEREN.append(name + '!' + ref)
        ZU_BEGRUENDUNG[name + '!' + ref] = ('Kachel „%s“: Zahl und Bezeichnung getrennt (Zahl als Formel aus der Tabelle, '
                                            'Zwischenwert gleich dem Original), Anzeige als Kachel im Cockpit' % grund)
    x0, luecke = 21, 14
    gesamt = sum(px_spalte(w) for w in START_BREITEN[1:10])
    kb = int((gesamt - 5 * luecke) / 6)
    y_k = int(sum(BAND_H) * PX + 3 * PX + 22 * PX + 4)
    for k, (formel, wert, text, _) in enumerate(kacheln):
        r = 6 + k
        if formel == 'B9':
            schreibe_zelle(ws, r, 13, Z('B9'), hilfe)
            schreibe_zelle(ws, r, 14, Z('A9'), hilfe)
            ZU_ZELLEN[name + '!B9'] = '%s!%s' % (name, xl_rowcol_to_cell(r, 13))
            ZU_ZELLEN[name + '!A9'] = '%s!%s' % (name, xl_rowcol_to_cell(r, 14))
            text = Z('A9')['wert']
        else:
            ws.write_formula(r, 13, formel, hilfe, wert)
            ws.write_string(r, 14, text, hilfe)
        x = x0 + k * (kb + luecke)
        flaeche(ws, x, y_k, kb, 84, name='KACHEL_%d' % (k + 1), fill=WEISS, linie=LINIE2)
        flaeche(ws, x, y_k, 5, 84, name='KACHEL_%d_Akzent' % (k + 1), fill=TEAL, rund=False)
        flaeche(ws, x + 18, y_k + 8, kb - 26, 44, name='KACHEL_%d_Zahl' % (k + 1), fill=None, textlink='=$N$%d' % (r + 1),
                cache=str(wert), schrift={'size': 24, 'bold': True, 'color': BAND},
                ausrichtung={'vertical': 'bottom', 'horizontal': 'left'}, rund=False, innen0=True)
        flaeche(ws, x + 18, y_k + 54, kb - 26, 24, text, name='KACHEL_%d_Text' % (k + 1), fill=None,
                schrift={'size': 9, 'color': TEXT2}, ausrichtung={'vertical': 'top', 'horizontal': 'left'}, rund=False,
                innen0=True)
    # Infozeile: Ablauf als Stationen (Herleitung, A bis D) und Stand des Testmail-Generators. Der Block
    # „Agenturzustände“ (Original G3) entfällt: dieselben Zahlen stehen als Kennzahlen auf „Agenturkonstellationen“.
    # Knöpfe gibt es hier nicht mehr – „Testmail erstellen“ und „Testmail-Generator“ stehen im Kopfband.
    ZU_IGNORIEREN.append(name + '!G3')
    ZU_BEGRUENDUNG[name + '!G3'] = ('Block „Agenturzustände“ (7 aufnehmende Zustände, 1 Negativzustand, 2 abgebende Typen, '
                                    '1 Zustand ohne Bestandsinhaber) entfällt im Cockpit: dieselben Zahlen stehen als '
                                    'Kennzahlen auf „Agenturkonstellationen“; jede Kennzahl nur an einer Stelle')
    ws.set_row(11, 20)
    lab = st.f(bold=True, font_size=8.5, font_color=TEAL, valign='bottom')
    ws.write_string(11, 1, 'ABLAUF', lab)
    ws.write_string(11, 9, 'TESTMAIL-GENERATOR', lab)
    for r, h in ((12, 20), (13, 22), (14, 20), (15, 10)):
        ws.set_row(r, h)
    # Oberkante der Stationen = Oberkante Zeile 13 (wie der Generator-Kasten in J13), gerechnet in den ganzen Pixeln
    # je Zeile, mit denen xlsxwriter die Formen an Zellen verankert (sonst sitzen die Stationen einige Pixel tiefer)
    y_s = sum(int(h * PX) for h in BAND_H + [3, 22, 8, 38, 24, 8, 16, 20]) + 1
    h_s = int((20 + 22 + 20 + 10) * PX) - 2
    # Originaltext des Ablaufs (E6) bleibt in der ausgeblendeten Hilfsspalte; die Stationen zeigen seine Teile
    ablauf = Z('E6')['wert']
    ws.write_string(12, 13, 'Ablauf (Text)', hilfe)
    ws.write_string(12, 14, ablauf, hilfe)
    ZU_ZELLEN[name + '!E6'] = name + '!O13'
    teile = [t.strip() for t in ablauf.split('→')]
    assert len(teile) == 5, teile
    # Prozessschritte A–D stehen unten in den Zeilen 20–23 (Gesamt D, erledigt F, blockiert G)
    zr = [20, 21, 22, 23]
    erledigt = lambda i: 'N(F%d)>=N(D%d)' % (zr[i], zr[i])
    werte_alt = [(Z('C%d' % ra)['wert'], Z('E%d' % ra)['wert'], Z('F%d' % ra)['wert']) for ra in range(12, 16)]
    naechster = next((i for i, (g, e, bl) in enumerate(werte_alt) if (e or 0) < (g or 0)), None)
    x_end = x0 + sum(px_spalte(w) for w in START_BREITEN[1:9]) - 14
    pfeil = 18
    b_vor = 150
    b_st = int((x_end - x0 - b_vor - 4 * pfeil) / 4)
    for k in range(5):
        if k == 0:
            x, bw = x0, b_vor
        else:
            x, bw = x0 + b_vor + pfeil + (k - 1) * (b_st + pfeil), b_st
        akzent = '#C9D2DB' if k == 0 else TEAL
        flaeche(ws, x, y_s, bw, h_s, name='STATION_%d' % k, fill=FLAECHE2, linie=LINIE2)
        flaeche(ws, x, y_s, 5, h_s, name='STATION_%d_Akzent' % k, fill=akzent, rund=False)
        if k == 0:
            flaeche(ws, x + 16, y_s + 9, bw - 22, 14, 'VORAB', name='STATION_0_Kicker', fill=None,
                    schrift={'size': 7.5, 'bold': True, 'color': GRAU}, rund=False, innen0=True)
            unter = 'Herleitungsblätter (grau)'
            unter_link = None
        else:
            i = k - 1
            bed = ','.join([erledigt(j) for j in range(i)] + ['N(F%d)<N(D%d)' % (zr[i], zr[i])])
            kick = 'SCHRITT %s' % 'ABCD'[i]
            ws.write_formula(12 + k, 13, '=IF(AND(%s),"%s  ·  ALS NÄCHSTES","%s")' % (bed, kick, kick), hilfe,
                             '%s  ·  ALS NÄCHSTES' % kick if naechster == i else kick)
            g, e, bl = werte_alt[i]
            ws.write_formula(12 + k, 14, '=N(F%d)&" von "&N(D%d)&" erledigt  ·  "&N(G%d)&" blockiert"' % (zr[i], zr[i], zr[i]),
                             hilfe, '%d von %d erledigt  ·  %d blockiert' % (e or 0, g or 0, bl or 0))
            flaeche(ws, x + 16, y_s + 9, bw - 22, 14, '', name='STATION_%d_Kicker' % k, fill=None,
                    textlink='=$N$%d' % (13 + k), cache='%s  ·  ALS NÄCHSTES' % kick if naechster == i else kick,
                    schrift={'size': 7.5, 'bold': True, 'color': TEAL}, rund=False, innen0=True)
            unter = '%d von %d erledigt  ·  %d blockiert' % (e or 0, g or 0, bl or 0)
            unter_link = '=$O$%d' % (13 + k)
        flaeche(ws, x + 16, y_s + 26, bw - 22, 36, teile[k], name='STATION_%d_Titel' % k, fill=None,
                schrift={'size': 10, 'bold': True, 'color': BAND}, ausrichtung={'vertical': 'top', 'horizontal': 'left'},
                rund=False, innen0=True)
        flaeche(ws, x + 16, y_s + h_s - 22, bw - 22, 14, '' if unter_link else unter, name='STATION_%d_Stand' % k,
                fill=None, textlink=unter_link, cache=unter if unter_link else None,
                schrift={'size': 8, 'color': TEXT2}, rund=False, innen0=True)
        if k < 4:
            xp = x + bw
            flaeche(ws, xp, y_s + h_s // 2 - 10, pfeil, 20, '›', name='STATION_%d_Pfeil' % k, fill=None,
                    schrift={'size': 14, 'bold': True, 'color': '#94A3B8'},
                    ausrichtung={'vertical': 'middle', 'horizontal': 'center'}, rund=False, innen0=True)
    # Testmail-Generator: nur der Stand (Pflichtangaben, erzeugte Testmails)
    gp = st.f(font_size=10, bold=True, font_color=BAND, bg_color=FLAECHE2, valign='bottom', left=5, left_color=TEAL, indent=1,
              top=1, top_color=LINIE2, right=1, right_color=LINIE2)
    gp2 = st.f(font_size=9, font_color=TEXT2, bg_color=FLAECHE2, valign='top', left=5, left_color=TEAL, indent=1,
               right=1, right_color=LINIE2, bottom=1, bottom_color=LINIE2)
    ws.merge_range(12, 9, 13, 9, '', gp)
    ws.write_formula(12, 9, '=(%d-COUNTIF(%s,"fehlt"))&" von %d Pflichtangaben gepflegt"' % (PFLICHT_ANZ, gen['status_bereich'],
                                                                                         PFLICHT_ANZ), gp,
                     '0 von %d Pflichtangaben gepflegt' % PFLICHT_ANZ)
    ws.merge_range(14, 9, 15, 9, '', gp2)
    ws.write_formula(14, 9, '=COUNTA(tblTestmailProtokoll[Mail-Auftrags-ID])&" Testmails erzeugt (Protokoll)"', gp2,
                     '0 Testmails erzeugt (Protokoll)')
    # Operative Prozessschritte
    ws.set_row(16, 16)
    ws.set_row(17, 24)
    ws.write_string(17, 1, Z('A10')['wert'], st.f(bold=True, font_size=12, font_color=BAND, valign='bottom'))
    ZU_ZELLEN[name + '!A10'] = name + '!B18'
    spalten_alt = 'ABCDEFGH'
    spalten_neu = [1, 2, 3, 4, 5, 6, 8, 9]          # Fortschritt neu in H (7)
    ws.set_row(18, 30)
    for i, sa in enumerate(spalten_alt):
        z = Z(sa + '11')
        ws.write_string(18, spalten_neu[i], z['wert'], st.kopf(mittig=2 <= i <= 5))
        ZU_ZELLEN['%s!%s11' % (name, sa)] = '%s!%s' % (name, xl_rowcol_to_cell(18, spalten_neu[i]))
    ws.write_string(18, 7, 'Fortschritt (erledigt)', st.kopf())
    ziele = {'Stammdaten': 'Stammdaten', 'To-do Vertragsmapping': 'To-do Vertragsmapping',
             'To-do Mailerstellung': 'To-do Mailerstellung', 'Testfall-Tracking': 'Testfall-Tracking'}
    for k, ra in enumerate(range(12, 16)):
        r = 19 + k
        ws.set_row(r, 32)
        for i, sa in enumerate(spalten_alt):
            z = Z('%s%d' % (sa, ra))
            c = spalten_neu[i]
            if i == 0:
                fmt = st.zelle('id', wrap=True)
            elif i == 1:
                fmt = st.zelle('neutral')
            elif 2 <= i <= 5:
                fmt = st.f(font_size=11, bold=True, align='center', valign='vcenter', bottom=1, bottom_color=LINIE,
                           font_color={2: BAND, 3: '#475467', 4: '#17663A', 5: TEXT}[i])
            elif i == 6:
                fmt = st.zelle('neutral')
            else:
                fmt = st.f(bold=True, font_color=TEAL, valign='vcenter', bottom=1, bottom_color=LINIE)
            url = None
            if i == 7:
                ziel = Z('B%d' % ra)['wert']
                url = "internal:'%s'!A1" % ziele.get(ziel, ziel)
            if i == 0:
                fmt = st.f(bold=True, valign='vcenter', bottom=1, bottom_color=LINIE, text_wrap=True)
            if i == 1:
                fmt = st.f(valign='vcenter', bottom=1, bottom_color=LINIE, font_color=TEXT2)
            if i == 6:
                fmt = st.f(valign='vcenter', bottom=1, bottom_color=LINIE, font_color=TEXT2, text_wrap=True, font_size=9)
            schreibe_zelle(ws, r, c, z, fmt, url=url)
            ZU_ZELLEN['%s!%s%d' % (name, sa, ra)] = '%s!%s' % (name, xl_rowcol_to_cell(r, c))
        ges, erl = Z('C%d' % ra)['wert'], Z('E%d' % ra)['wert']
        ws.write_formula(r, 7, '=IF(N(%s)=0,0,N(%s)/N(%s))' % (xl_rowcol_to_cell(r, 3), xl_rowcol_to_cell(r, 5),
                                                               xl_rowcol_to_cell(r, 3)),
                         st.f(num_format='0%', valign='vcenter', bold=True, font_color=TEAL_D, bottom=1, bottom_color=LINIE,
                              indent=1), (erl / ges) if ges else 0)
    ws.conditional_format(19, 7, 22, 7, {'type': 'data_bar', 'bar_color': '#7FD3C7', 'bar_solid': True,
                                         'min_type': 'num', 'min_value': 0, 'max_type': 'num', 'max_value': 1,
                                         'bar_border_color': '#7FD3C7', 'bar_no_border': True})
    ws.conditional_format(19, 6, 22, 6, {'type': 'cell', 'criteria': '>', 'value': 0, 'format': cf_format(st, 'rot')})
    ws.set_row(23, 34)
    ws.merge_range(23, 1, 23, 9, Z('A17')['wert'], st.f(font_size=9, font_color=GRAU, italic=True, text_wrap=True,
                                                       valign='vcenter'))
    ZU_ZELLEN[name + '!A17'] = name + '!B24'
    # Offene technische Voraussetzungen
    ws.set_row(24, 14)
    ws.set_row(25, 24)
    ws.write_string(25, 1, Z('A18')['wert'], st.f(bold=True, font_size=12, font_color=BAND, valign='bottom'))
    ZU_ZELLEN[name + '!A18'] = name + '!B26'
    # Spaltenfolge wie im Original: Quelle, Arbeitspaket, Erhaltener Inhalt, Status, Owner, Zielbezug, Nachweis, Kommentar
    ziel_sp = {'A': 1, 'B': 2, 'C': 3, 'D': 7, 'E': 8, 'F': 9, 'G': 10, 'H': 11}
    breite_px = {c: px_spalte(START_BREITEN[c]) for c in range(1, 12)}
    breite_px[3] = sum(px_spalte(START_BREITEN[c]) for c in range(3, 7))
    for k, ra in enumerate(range(19, 28)):
        r = 26 + k
        n = max(zeilen_noetig((Z('%s%d' % (sa, ra)) or {}).get('wert') or '', breite_px[c], fett=(sa == 'B'))
                for sa, c in ziel_sp.items())
        ws.set_row(r, 26 if k == 0 else zeilen_hoehe(max(n, 2)))
        for sa, c in ziel_sp.items():
            z = Z('%s%d' % (sa, ra))
            if k == 0:
                fmt = st.kopf(mittig=(sa == 'D'))
            elif sa == 'D':
                fmt = st.pille('eingabe')
            elif sa in 'EH':
                fmt = st.zelle('eingabe')
            else:
                fmt = st.zelle('id' if sa == 'B' else 'neutral')
            if sa == 'C':
                ws.merge_range(r, 3, r, 6, '', fmt)
            schreibe_zelle(ws, r, c, z, fmt)
            if z and z['wert'] not in (None, ''):
                ZU_ZELLEN['%s!%s%d' % (name, sa, ra)] = '%s!%s' % (name, xl_rowcol_to_cell(r, c))
    sq = '%s:%s' % (xl_rowcol_to_cell(27, 7), xl_rowcol_to_cell(34, 7))
    zusatz_regeln(ws, st, sq, auch_ja=True)
    ws.data_validation(27, 7, 34, 7, {'validate': 'list', 'source': "='Listen & Parameter'!$A$2:$A$6"})
    ws.freeze_panes(5, 0)
    ws.set_landscape()
    ws.set_paper(9)
    ws.fit_to_pages(1, 0)
    ws.activate()


# ------------------------------------------------------------------ VBA
def vba_bin_schreiben():
    vba_dir = os.path.join(HIER, 'vba')
    befunde = vba_pruefung.pruefe(vba_dir)
    for datei in sorted(os.listdir(vba_dir)):
        if datei.endswith(('.bas', '.cls')):
            text = open(os.path.join(vba_dir, datei), encoding='utf-8').read()
            try:
                text.encode('cp1252')
            except UnicodeEncodeError as e:
                befunde.append('%s: Zeichen ausserhalb cp1252: %r' % (datei, text[e.start:e.end]))
            if 'Option Explicit' not in text:
                befunde.append('%s: Option Explicit fehlt' % datei)
    if befunde:
        raise SystemExit('VBA-Pruefung fehlgeschlagen:\n' + '\n'.join(befunde))
    module = [('ThisWorkbook', open(os.path.join(vba_dir, 'DieseArbeitsmappe.cls'), encoding='utf-8').read(), 'workbook')]
    for n in REIHENFOLGE:
        vn = VBA_NAMEN[n]
        datei = os.path.join(vba_dir, vn + '.cls')
        module.append((vn, open(datei, encoding='utf-8').read() if os.path.exists(datei) else 'Option Explicit\r\n', 'sheet'))
    for datei in sorted(os.listdir(vba_dir)):
        if datei.endswith('.bas'):
            module.append((datei[:-4], open(os.path.join(vba_dir, datei), encoding='utf-8').read(), False))
    pfad = os.path.join(HIER, 'vbaProject.bin')
    open(pfad, 'wb').write(ovba.vba_projekt(module, projektname='PruefbotTesting'))
    return pfad


# ------------------------------------------------------------------ Bauen
def knopf_x0():
    """x-Position der Kopfband-Knöpfe: rechts vom längsten Titel aller Blätter (mindestens 560 px)."""
    titel = ['Testmail-Generator', A.blatt_nach_name['Start & Übersicht']['zellen']['A1']['wert']]
    for n, d in BLAETTER.items():
        if 'titel' in d:
            q = d['titel']
            titel.append(A.blatt_nach_name[n]['zellen'][q[1]]['wert'] if q[0] == 'zelle' else q[1])
    return max([560] + [21 + titel_breite_px(str(t)) + 40 for t in titel])


def bauen(vba_bin):
    global KNOPF_X0
    KNOPF_X0 = knopf_x0()
    SHAPES.clear()
    wb = xlsxwriter.Workbook(OUT)
    wb.formats[0].set_font_name(FONT)
    wb.formats[0].set_font_size(10)
    wb.set_vba_name('ThisWorkbook')
    wb.add_vba_project(vba_bin)
    wb.set_properties({'title': 'Prüfbot-Testing', 'subject': 'Testvorbereitung Prüfbot Bestandsübertragung',
                       'comments': 'Neu aufgebaut aus Pruefbot_Testing.xlsx; Testmail-Generator (EML + Vollmacht-PDF).'})
    wb.set_calc_mode('auto')
    st = Stil(wb)
    ws = {}
    for n in REIHENFOLGE:
        ws[n] = wb.add_worksheet(n)
        ws[n].set_vba_name(VBA_NAMEN[n])
    listenblatt(ws['Listen & Parameter'], st)
    for n in REIHENFOLGE:
        if n in BLAETTER and n not in ('Start & Übersicht', 'Listen & Parameter'):
            standardblatt(wb, ws[n], st, n)
    auftraege = tabellen_werte('tblMailAuftraege')
    gen = generatorblatt(wb, ws[GENERATOR], st, auftraege, None)
    startseite(wb, ws['Start & Übersicht'], st, gen)
    wb.close()


# ------------------------------------------------------------------ Nachbearbeitung
LABEL_TEIL = 'docMetadata/LabelInfo.xml'
LABEL_REL = 'http://schemas.microsoft.com/office/2020/02/relationships/classificationlabels'
LABEL_TYP = 'application/vnd.ms-office.classificationlabels+xml'


def nachbearbeiten():
    tmp = OUT + '.tmp'
    zin = zipfile.ZipFile(OUT)
    zout = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
    # Vertraulichkeitskennzeichnung (MIP-Label) des Originals 1:1 übernehmen: Teil, Beziehung, Inhaltstyp
    zq = zipfile.ZipFile(QUELLE)
    label = zq.read(LABEL_TEIL) if LABEL_TEIL in zq.namelist() else None
    zq.close()
    for n in zin.namelist():
        daten = zin.read(n)
        if label and n == '[Content_Types].xml':
            t = daten.decode('utf-8')
            if LABEL_TEIL not in t:
                t = t.replace('</Types>', '<Override PartName="/%s" ContentType="%s"/></Types>' % (LABEL_TEIL, LABEL_TYP))
            daten = t.encode('utf-8')
        if label and n == '_rels/.rels':
            t = daten.decode('utf-8')
            if LABEL_REL not in t:
                t = t.replace('</Relationships>', '<Relationship Id="rIdLabel1" Type="%s" Target="%s"/></Relationships>'
                              % (LABEL_REL, LABEL_TEIL))
            daten = t.encode('utf-8')
        if re.match(r'xl/drawings/drawing\d+\.xml$', n):
            t = daten.decode('utf-8')
            t = re.sub(r'<xdr:(?:twoCellAnchor|oneCellAnchor|absoluteAnchor)[\s\S]*?</xdr:(?:twoCellAnchor|oneCellAnchor|absoluteAnchor)>',
                       anker_bearbeiten, t)
            daten = t.encode('utf-8')
        if re.match(r'xl/worksheets/sheet\d+\.xml$', n):
            # Formel mit leerem Textergebnis: Excel schreibt t="str" und <v/>; ohne t="str" rechnet LibreOffice die Zelle
            # beim Laden neu (XLOOKUP/LET kennt es nicht -> #NAME?). Zwischenwert bleibt der leere Text.
            t = daten.decode('utf-8')
            t = re.sub(r'(<c r="[A-Z]+[0-9]+"(?: s="[0-9]+")?(?: cm="1")?)(><f[^>]*>[^<]*</f><v></v></c>)', r'\1 t="str"\2', t)
            daten = t.encode('utf-8')
        if re.match(r'xl/tables/table\d+\.xml$', n):
            t = daten.decode('utf-8')
            if 'name="tblTestfallTracking"' in t:
                for sp in ('Vertragsmapping erfüllt', 'Mail / Datensatz vorbereitet', 'Mail versendet'):
                    t = re.sub(r'(<tableColumn [^>]*name="%s"[^>]*>\s*<calculatedColumnFormula)>' % re.escape(sp),
                               r'\1 array="1">', t)
            daten = t.encode('utf-8')
        zout.writestr(zin.getinfo(n), daten)
    if label:
        zout.writestr(LABEL_TEIL, label)
    zin.close()
    zout.close()
    os.replace(tmp, OUT)


def anker_bearbeiten(m):
    bl = m.group(0)
    d = re.search(r'descr="([^"]*)"', bl)
    if not d or not d.group(1).startswith('N='):
        return bl
    spec = dict(teil.split('=', 1) for teil in d.group(1).split(';'))
    bl = bl.replace(' descr="%s"' % d.group(1), '', 1)
    bl = re.sub(r'(<xdr:cNvPr id="\d+" name=")[^"]*(")', lambda x: x.group(1) + spec['N'] + x.group(2), bl, count=1)
    if spec.get('G') == 'roundRect':
        bl = re.sub(r'<a:prstGeom prst="rect">\s*<a:avLst\s*/>', '<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" '
                    'fmla="val %d"/></a:avLst>' % (30000 if spec['N'].startswith('BTN_') else 8000), bl, count=1)
        bl = bl.replace('<a:prstGeom prst="rect">', '<a:prstGeom prst="roundRect">', 1)
    if 'M' in spec:
        bl = bl.replace('<xdr:sp macro=""', '<xdr:sp macro="[0]!%s"' % spec['M'], 1)
    if spec.get('I') == '0':
        bl = re.sub(r'<a:bodyPr([^>]*?)(/?)>', lambda x: '<a:bodyPr%s lIns="0" tIns="0" rIns="0" bIns="0"%s>'
                    % (re.sub(r' [lrtb]Ins="\d+"', '', x.group(1)), x.group(2)), bl, count=1)
    if 'C' in spec:
        txt = urllib.parse.unquote(spec['C']).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        bl = re.sub(r'<a:t>\s*</a:t>(\s*</a:fld>)', lambda x: '<a:t>%s</a:t>%s' % (txt, x.group(1)), bl, count=1)
        bl = bl.replace('<a:t/></a:fld>', '<a:t>%s</a:t></a:fld>' % txt, 1)
    # absolut verankern nur auf Wunsch (A=1); sonst bleibt der Zellanker (editAs="absolute": verschiebt sich nicht mit)
    if spec.get('A') == '1':
        x, y, w, h = (int(spec[k]) for k in ('X', 'Y', 'W', 'H'))
        inhalt = bl[bl.index('</xdr:to>') + len('</xdr:to>'):bl.rindex('</xdr:twoCellAnchor>')]
        bl = '<xdr:absoluteAnchor><xdr:pos x="%d" y="%d"/><xdr:ext cx="%d" cy="%d"/>%s</xdr:absoluteAnchor>' % (
            x * 9525, y * 9525, w * 9525, h * 9525, inhalt)
    return bl


def zuordnung_schreiben():
    z = {'blaetter': {}, 'zellen': {k: v for k, v in ZU_ZELLEN.items() if v and k != v},
         'ignorieren': sorted(set(ZU_IGNORIEREN)), 'begruendung': ZU_BEGRUENDUNG}
    json.dump(z, open(ZUORDNUNG, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    vba = vba_bin_schreiben()
    bauen(vba)
    nachbearbeiten()
    zuordnung_schreiben()
    print('geschrieben:', OUT)
