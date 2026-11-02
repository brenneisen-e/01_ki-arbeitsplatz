# -*- coding: utf-8 -*-
"""Baut HR_Sales_Dashboard.xlsm neu aus dem bisherigen Dashboard (quelle/2025_Dashboard_HS_OPAG.xlsm).

Aufruf (aus diesem Ordner):  python3 dashboard_build.py

Blaetter: Start (Startseite mit Assistent), Übersicht, Deckblatt (Titelfolie), PPT_2 (Serviceparameter, sieben Kacheln mit
BÜ Verbund und BÜ OPAG), PPT_3 (ext. Faktoren & HS-Ressourcen), Rohdaten (Wochenwerte 1:1 wie bisher, Formeln vereinheitlicht;
darunter die Monatsbloecke Mitarbeiter-Kapazitäten und Neuverpflichtung, bisher Rohdaten_2 und Rohdaten_3), Kommentare,
Zuständigkeiten (mit Reportingzyklus), Konfiguration, BUE_Serviceparameter, Dashboard_Daten, Feiertage, Wertstand.

Die PPT-Blaetter bilden die Folie der ERGO-Vorlage (Layout „3/4“, 960 x 540 pt) im Massstab 1:1 nach: Was dort an Kacheln
steht, setzt modPPT an dieselbe Stelle der Folie. Formen mit dem Praefix DEKO_ (Rahmen, grauer Bereich, Logo, Titel)
liefert die Vorlage selbst und werden nicht kopiert.
"""
import datetime as dt
import os
import re
import sys
import urllib.parse
import zipfile

import xlsxwriter
from xlsxwriter.utility import xl_col_to_name, xl_rowcol_to_cell

HIER = os.path.dirname(os.path.abspath(__file__))
BASIS = os.path.dirname(HIER)
sys.path.insert(0, HIER)
sys.path.insert(1, os.path.join(BASIS, '..', 'bue_reporting', 'quellen'))
import quelle_lesen  # noqa: E402
import ovba  # noqa: E402
import vba_pruefung  # noqa: E402

OUT = os.path.join(BASIS, 'HR_Sales_Dashboard.xlsm')
BILDER = os.path.join(HIER, 'bilder')
HEUTE = dt.date.today()

# ------------------------------------------------------------------ Gestaltung
FONT = 'Liberation Sans'       # Zellen
FONT_F = 'Liberation Sans'     # Formen und Diagramme (gehen in die PowerPoint)
ROT = '#BF1528'
MAGENTA = '#B31767'
GRUENT = '#009284'
PETROL = '#0F94A7'
TEALD = '#0B6F7D'
INDIGO = '#3B4F8A'
SW, GRAUD, GRAU, GRAUM, GRAUL, GRAUXL, WEISS = '#1A1A1A', '#4A4A4A', '#6B6B6B', '#9AA3AD', '#D0D5DA', '#F3F4F6', '#FFFFFF'
KACHEL_GRUND = '#F2F2F2'
PANEL = '#EBEBEA'
GELB_KOPF, GELB_ZELLE = '#FFE7A3', '#FFF6DA'
ZU, AB = '#BF1528', '#009284'                 # Zunahmen / Abnahmen (wie im bisherigen Dashboard)
SEV = ['#1A1A1A', '#808080', '#B31767']       # Sev 1+2, Sev 3, Sev 4 (wie im Dashboard vor dem Umbau)
# Sparten in den BÜ-Kacheln: dieselben Farben wie die Sev-Stufen der Defects (groesste Sparte unten in Magenta)
SPARTE = {'Komposit': SEV[2], 'Gesundheit': SEV[1], 'Leben': SEV[0]}
SPARTEN = (('C', 'Komposit'), ('B', 'Gesundheit'), ('D', 'Leben'))

PX = 4.0 / 3.0                                # Punkte -> Pixel (96 dpi)
OX, OY = 24, 72                               # Ursprung der Folie im PPT-Blatt (Pixel ab A1); darueber die Knopfleiste
FOLIE_B, FOLIE_H = 960, 540
INHALT_X, INHALT_B = 40, 630                  # Inhaltsflaeche links (Layout 3/4: grauer Bereich ab x = 688,5; 18 pt Abstand)
KACHEL_Y, KACHEL_H, LUECKE = 104, 186, 8
PANEL_X, PANEL_B, PANEL_Y = 700, 244, 98     # Kommentarbereich im grauen Feld

N_WOCHEN, N_MONATE = 27, 10                   # Dashboard_Daten: 27 Wochen (Folie zeigt 4..26 KW, eine Vorwoche fuer das Delta), 10 Monate
BUE_DATEI = r'H:\MaklerBUe\Reporting MISO\BUE_Reporting_Master.xlsm'     # verknuepfte BUE-Datei (Konfiguration C10)
KW_MIN, KW_MAX = 4, 26                        # Spanne fuer „KW je Diagramm“ (modKW)
N_PERSONEN, P_ERSTE = 30, 8                   # Zuständigkeiten: Personenspalten I..AL (= Konfiguration B28:B57)
ZU_VOLL = P_ERSTE + N_PERSONEN               # Spalte AM (ausgeblendet): Kennzahl mit Thema und Kategorie fuer den Assistenten
# Berichtstag (Konfiguration!C4): Die Wochenwerte einer KW gehoeren zu ihrem Freitag (Stichtag, Spalten in Rohdaten). Gemeldet
# wird die KW am naechsten Wochentag laut Konfiguration F4 am oder nach dem Freitag (Vorgabe Montag, Feiertag am Standort F5 ->
# naechster Werktag); KW mit Meldetag vor F7 (Umstellung) noch am Freitag selbst. Aktuell ist die erste KW, deren Meldetag nicht
# vorbei ist: am Freitag 09.10.2026 noch KW 41 (Meldung heute), ab Samstag KW 42 mit Berichtstag Montag 19.10.2026. Der Stichtag
# haengt am Freitag der KW, nicht am verschobenen Tag (Donnerstag-Feiertag -> Freitag meldet trotzdem die Vorwoche).
WOCHENTAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
BERICHTSTAG_WT = 'Montag'
UMSTELLUNG = quelle_lesen.UMSTELLUNG                       # ab hier heissen die Wochenspalten wie ihr Meldetag (Montag)


def _meldetag(freitag):
    """Meldetag der KW mit diesem Freitag (ohne Feiertage, nur fuer den Build; die Mappe rechnet mit Feiertagen)."""
    tag = freitag + dt.timedelta(days=(WOCHENTAGE.index(BERICHTSTAG_WT) - 4) % 7)
    return tag if tag >= UMSTELLUNG else freitag


_f0 = HEUTE - dt.timedelta(days=(HEUTE.weekday() - 4) % 7)
BERICHTSTAG = next(f for f in (_f0 - dt.timedelta(days=7), _f0, _f0 + dt.timedelta(days=7)) if _meldetag(f) >= HEUTE)   # Stichtag
BERICHTSTAG_AUTO = _meldetag(BERICHTSTAG)
STAND = BERICHTSTAG_AUTO.strftime('%d.%m.%Y')
TITEL, UNTERTITEL = 'Dashboard HR Sales', 'Kennzahlen zur Stabilisierungsphase'
FOLIEN = [('Deckblatt', 'Titelfolie', '', 'ja'),
          ('PPT_2', 'HR Sales | Dashboard Serviceparameter', 'DASHBOARDS', 'ja'),
          ('PPT_3', 'HR Sales | Dashboard ext. Faktoren & HS-Ressourcen', 'DASHBOARDS', 'ja')]
W0 = 3                                         # Dashboard_Daten: Wochen ab D (0-basiert), Monate ab M0
M0 = W0 + N_WOCHEN + 1
FOLIE_KW = 10                                  # Voreinstellung: 10 KW je Diagramm (modKW aendert das je Kachel)
# BÜ-Kacheln: je KW ein Platz auf der Achse (Dashboard_Daten ab Spalte S0, die Zahl der KW setzt modKW je Kachel).
# Feste Geometrie (Punkt): Werte werden auf die hoechste Saeule normiert (1,0), die Achsen haben feste Grenzen. So bestimmt nicht
# Excels Achsenautomatik, wo Saeulen, Beschriftungen und die Delta-Zeile landen – Excel, PowerPoint und Vorschau sehen gleich aus.
BEST_H, BEST_OBEN, BEST_UNTEN = 66.0, 11.0, 12.0                 # offene Vorgaenge: Diagrammhoehe, Luft fuer die Summe, KW
VORG_H, VORG_OBEN, VORG_UNTEN = 59.0, 14.0, 22.0                 # Zu-/Abnahmen: so hoch wie in den anderen Kacheln (Balken 23 pt)
BEW_OBEN, BEW_UNTEN = 14.0, 22.0                                  # Zu-/Abnahmen: oben Platz fuer zwei Zahlenzeilen, unten KW + Delta
ZAHL_PT, ZAHL_GR = 6.5, 5.5                                       # Zahlen ueber den Zu-/Abnahmen: Zeilenhoehe, Schriftgroesse
BALKEN_PT = 4.0                                                   # Breite eines Zu-/Abnahmen-Balkens, in allen Kacheln gleich
KASTEN_PT = 7.5                                                   # Hoehe eines Wertkastens (5 pt Schrift)
DELTA_Y, DELTA_H = 12.5, 11.0                                     # Streifen der Delta-Zeile: Abstand unter der Achse, Hoehe
S0 = M0 + N_MONATE + 1                         # Dashboard_Daten: Plaetze der BUE-Kacheln rechts neben den Monaten
PLAETZE_MAX = KW_MAX                           # ein Platz je KW
F0 = S0 + PLAETZE_MAX + 1                      # Dashboard_Daten: Zeitfenster der Kacheln (KW_MAX Spalten, endet mit der letzten KW mit Daten)
# Mitarbeiter-Kapazitaeten (PPT_3, Kachel 6): feste Monate statt der letzten n Monate – Vormonat und laufender Monat des
# Berichtstags, dazu Januar des Folgejahres und Januar des uebernaechsten Jahres (Planwerte aus Rohdaten_2)
N_MAK = 4
MAK0 = F0 + KW_MAX + 1                         # Dashboard_Daten: feste Monate der Kapazitaeten-Kachel
REG0 = MAK0 + N_MAK + 1                        # Dashboard_Daten: Verzeichnis der Kacheln und Diagramme (fuer modKW)
KONSTANT = {'SLA'}                             # Reihen ohne eigenen Datenstand (zaehlen nicht fuer die letzte KW mit Daten)
RD_LETZTE = 'LJ'                               # letzte Spalte der Rohdaten (Kommentar)

FORMEN = []                                    # (blatt, beschreibung) fuer die Nachbearbeitung
BERICHTET = {}                                 # Pflicht = berichtet: kern/menge (Rohdaten-Zeilen), gruppen (Rohdaten eingeklappt)


def P(pt):
    return int(round(pt * PX))


# ------------------------------------------------------------------ Formate
class Stil:
    def __init__(self, wb):
        self.wb = wb
        self._cache = {}
        f = wb.add_format
        self.titel = f({'font_name': FONT, 'font_size': 20, 'bold': True, 'font_color': ROT})
        self.untertitel = f({'font_name': FONT, 'font_size': 10.5, 'font_color': GRAU})
        self.abschnitt = f({'font_name': FONT, 'font_size': 8, 'bold': True, 'font_color': TEALD})
        self.kopf = f({'font_name': FONT, 'font_size': 9, 'bold': True, 'font_color': WEISS, 'bg_color': TEALD, 'valign': 'vcenter',
                       'text_wrap': True, 'border': 1, 'border_color': TEALD})
        self.kopf_z = f({'font_name': FONT, 'font_size': 9, 'bold': True, 'font_color': WEISS, 'bg_color': TEALD, 'valign': 'vcenter',
                         'align': 'center', 'border': 1, 'border_color': TEALD})
        self.text = f({'font_name': FONT, 'font_size': 9.5, 'valign': 'vcenter'})
        self.text_w = f({'font_name': FONT, 'font_size': 9.5, 'valign': 'top', 'text_wrap': True})
        self.hinweis = f({'font_name': FONT, 'font_size': 9, 'font_color': GRAU, 'italic': True})
        self.hinweis_w = f({'font_name': FONT, 'font_size': 9, 'font_color': GRAU, 'text_wrap': True, 'valign': 'top'})
        self.calc = f({'font_name': FONT, 'font_size': 9.5, 'bg_color': GRAUXL, 'border': 1, 'border_color': GRAUL, 'valign': 'vcenter'})
        self.calc_z = f({'font_name': FONT, 'font_size': 9.5, 'bg_color': GRAUXL, 'border': 1, 'border_color': GRAUL, 'num_format': '#,##0',
                         'align': 'right', 'valign': 'vcenter'})
        self.calc_d = f({'font_name': FONT, 'font_size': 9.5, 'bg_color': GRAUXL, 'border': 1, 'border_color': GRAUL, 'num_format': 'dd.mm.yyyy',
                         'align': 'center', 'valign': 'vcenter'})
        self.calc_dl = f({'font_name': FONT, 'font_size': 10.5, 'bold': True, 'bg_color': GRAUXL, 'border': 1, 'border_color': GRAUL,
                          'num_format': '[$-407]dddd, dd.mm.yyyy', 'align': 'left', 'valign': 'vcenter', 'indent': 1})
        self.ein = f({'font_name': FONT, 'font_size': 9.5, 'bg_color': WEISS, 'border': 1, 'border_color': GRAUL, 'valign': 'vcenter'})
        self.ein_w = f({'font_name': FONT, 'font_size': 9.5, 'bg_color': WEISS, 'border': 1, 'border_color': GRAUL, 'valign': 'top', 'text_wrap': True})
        self.ein_z = f({'font_name': FONT, 'font_size': 9.5, 'bg_color': WEISS, 'border': 1, 'border_color': GRAUL, 'num_format': '#,##0',
                        'valign': 'vcenter'})
        self.ein_d = f({'font_name': FONT, 'font_size': 9.5, 'bg_color': WEISS, 'border': 1, 'border_color': GRAUL, 'num_format': 'dd.mm.yyyy',
                        'align': 'center', 'valign': 'vcenter'})
        self.ein_m = f({'font_name': FONT, 'font_size': 9.5, 'bg_color': WEISS, 'border': 1, 'border_color': GRAUL, 'align': 'center',
                        'valign': 'vcenter'})
        self.datum = f({'font_name': FONT, 'font_size': 9.5, 'num_format': 'dd.mm.yyyy', 'align': 'center'})
        self.zahl = f({'font_name': FONT, 'font_size': 9.5, 'num_format': '#,##0'})
        self.zahl1 = f({'font_name': FONT, 'font_size': 9.5, 'num_format': '#,##0.0'})
        self.klein = f({'font_name': FONT, 'font_size': 8, 'font_color': GRAU})

    def x(self, **kw):
        """Format nach Merkmalen, zwischengespeichert (fuer die vielen Varianten im Rohdatenblatt)."""
        key = tuple(sorted(kw.items()))
        if key not in self._cache:
            d = {'font_name': FONT, 'font_size': 9}
            d.update(kw)
            self._cache[key] = self.wb.add_format(d)
        return self._cache[key]


# ------------------------------------------------------------------ Formen (Textfelder) und Diagramme im PPT-Blatt
def form(ws, x, y, b, h, text='', name='', fill=None, linie=None, schrift=None, ausrichtung=None, geom=None, makro=None,
         rand0=True, drehung=None, transparenz=None, textlink=None, cache=None, absaetze=None, umbruch=True):
    o = {'x_offset': OX + P(x), 'y_offset': OY + P(y), 'width': max(1, P(b)), 'height': max(1, P(h)), 'object_position': 3}
    o['fill'] = {'none': True} if fill is None else {'color': fill}
    if fill is not None and transparenz:
        o['fill']['transparency'] = transparenz              # schreibt xlsxwriter bei Textfeldern nicht -> T= in der Nachbearbeitung
    o['line'] = {'none': True} if linie is None else {'color': linie[0], 'width': linie[1]}
    s = {'name': FONT_F, 'size': 8, 'color': SW}
    if schrift:
        s.update(schrift)
    o['font'] = s
    o['align'] = ausrichtung or {'vertical': 'middle', 'horizontal': 'left'}
    if textlink:
        o['textlink'] = textlink
    spec = 'N=' + name
    if geom:
        spec += ';G=' + geom
    if makro:
        spec += ';M=' + makro
    if rand0:
        spec += ';I=0'
    if not umbruch:
        spec += ';U=0'
    if drehung:
        spec += ';R=%d' % drehung
    if fill is not None and transparenz:
        spec += ';T=%d' % transparenz
    if cache:
        spec += ';C=' + urllib.parse.quote(cache)
    if absaetze:
        spec += ';P=' + urllib.parse.quote(absaetze)
    o['description'] = spec
    ws.insert_textbox(0, 0, text, o)


def knopf(ws, x_px, y_px, b_px, h_px, text, makro, name, art=1, groesse=9.5, versteckt=False, rand0=False):
    """Knopf mit Makro; Position in Pixeln ab A1 (ausserhalb der Folie). rand0: Text ohne Innenrand (zweizeilige Beschriftung)."""
    farbe = {1: TEALD, 2: WEISS, 4: ROT}.get(art, WEISS)
    o = {'x_offset': x_px, 'y_offset': y_px, 'width': b_px, 'height': h_px, 'object_position': 3,
         'fill': {'color': farbe}, 'line': {'none': True} if art in (1, 4) else {'color': GRAUL, 'width': 1},
         'font': {'name': FONT, 'size': groesse, 'bold': True, 'color': WEISS if art in (1, 4) else SW},
         'align': {'vertical': 'middle', 'horizontal': 'center'},
         'description': 'N=BTN_%s;G=roundRect;M=%s%s%s' % (name, makro, ';H=1' if versteckt else '', ';I=0' if rand0 else '')}
    ws.insert_textbox(0, 0, text, o)


def chart_basis(wb, typ, subtyp=None, layout=None):
    ch = wb.add_chart({'type': typ, 'subtype': subtyp} if subtyp else {'type': typ})
    ch.set_title({'none': True})
    ch.set_legend({'none': True})
    ch.set_chartarea({'border': {'none': True}, 'fill': {'none': True}})
    pa = {'border': {'none': True}, 'fill': {'none': True}}
    if layout:
        pa['layout'] = layout
    ch.set_plotarea(pa)
    ch.show_na_as_empty_cell()
    ch.show_blanks_as('gap')
    return ch


def x_achse(ch, sichtbar=True, schmal=False, grundlinie=False):
    if sichtbar:
        o = {'num_font': {'name': FONT_F, 'size': 6.5, 'color': GRAU, 'rotation': 0}, 'line': {'color': '#BFBFBF', 'width': 0.75},
             'major_tick_mark': 'none', 'minor_tick_mark': 'none', 'label_position': 'low'}
        if schmal:
            o['interval_unit'] = 1
        ch.set_x_axis(o)
    elif grundlinie:
        ch.set_x_axis({'label_position': 'none', 'line': {'color': '#BFBFBF', 'width': 0.75}, 'major_tick_mark': 'none', 'minor_tick_mark': 'none'})
    else:
        ch.set_x_axis({'label_position': 'none', 'line': {'none': True}, 'major_tick_mark': 'none', 'minor_tick_mark': 'none'})


def y_achse(ch, minimum=None, maximum=None):
    o = {'visible': False, 'major_gridlines': {'visible': False}}
    if minimum is not None:
        o['min'] = minimum
    if maximum is not None:
        o['max'] = maximum
    ch.set_y_axis(o)


def chart_setzen(ws, ch, x, y, b, h, name):
    ch.set_size({'width': P(b), 'height': P(h)})
    ws.insert_chart(0, 0, ch, {'x_offset': OX + P(x), 'y_offset': OY + P(y), 'object_position': 3, 'description': 'N=' + name})


# ------------------------------------------------------------------ Dashboard_Daten
class Daten:
    """Zeilen je Kennzahl: Wochen (D..M, zehn Berichtstage bis zum Berichtstag) und Monate (O..X, bis zum Vormonat)."""
    BLATT = 'Dashboard_Daten'

    def __init__(self, ws, st, rd, L):
        self.ws, self.st = ws, st
        self.rd, self.L = rd, L
        self.zeile = 6                       # naechste freie Zeile (0-basiert: Excel-Zeile 7)
        self.z = {'_datum': 3}
        # Herkunft je Reihe: Zeilen in Rohdaten, aus denen die Reihe rechnet (fuer „Pflicht = berichtet“). blatt = das PPT-Blatt,
        # dessen Kacheln gerade gebaut werden; jede Reihe, die eine Kachel dort zeigt, zaehlt ihre Rohdaten-Zeilen in benutzt[blatt].
        self.quellen = {}
        self.blatt = None
        self.benutzt = {}
        ws.write(0, 0, 'Dashboard_Daten – Datenreihen der Kacheln (wird berechnet, nicht ändern)', st.titel)
        ws.write(1, 0, ('Wochen: %d Berichtstage bis zum Berichtstag (Konfiguration), die Diagramme zeigen davon die letzten %d bis %d KW '
                        '(Knopf „KW je Diagramm“). Monate: zehn Monate bis zum Vormonat des Berichtstags; Mitarbeiter-Kapazitäten: '
                        'Vormonat, laufender Monat und Januar der beiden Folgejahre (Plan). '
                        'Fehlende Werte erscheinen als #NV und bleiben im Diagramm leer.') % (N_WOCHEN, KW_MIN, KW_MAX), st.hinweis)
        ws.write(3, 0, 'Datum', st.kopf)
        ws.write(4, 0, 'Achse', st.kopf)
        ws.write(2, 0, 'Achse (Folie)', st.kopf)
        ws.write(5, 0, 'Schlüssel', st.kopf)
        ws.write(5, 1, 'Reihe', st.kopf)
        ws.write(5, 2, 'Quelle', st.kopf)
        for i in range(N_WOCHEN):
            c = W0 + i
            if i == N_WOCHEN - 1:
                ws.write_formula(3, c, '=Stichtag', st.calc_d)
            else:
                # vorige Wochenspalte in Rohdaten (Freitage bis KW 41, danach Montage – nicht einfach 7 Tage zurueck)
                ws.write_formula(3, c, '=_xlfn.MAXIFS(RD_Kopf,RD_Kopf,"<"&%s)' % xl_rowcol_to_cell(3, c + 1), st.calc_d)
            kw = 'ISOWEEKNUM(%s-MOD(WEEKDAY(%s,2)+2,7))' % ((xl_rowcol_to_cell(3, c),) * 2)     # KW = Woche des Freitags davor
            ws.write_formula(4, c, '="KW "&%s' % kw, st.calc)
            ws.write_formula(2, c, '=""&%s' % kw, st.calc)
            ws.write(5, c, 'Woche %d' % (i + 1), st.kopf_z)
        mon = '"Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"'
        for i in range(N_MONATE):
            c = M0 + i
            if i == N_MONATE - 1:
                ws.write_formula(3, c, '=DATE(YEAR(Berichtstag),MONTH(Berichtstag)-1,1)', st.calc_d)
            else:
                n = xl_rowcol_to_cell(3, c + 1)
                ws.write_formula(3, c, '=DATE(YEAR(%s),MONTH(%s)-1,1)' % (n, n), st.calc_d)
            ws.write_formula(4, c, '=CHOOSE(MONTH(%s),%s)&" "&RIGHT(YEAR(%s),2)' % (xl_rowcol_to_cell(3, c), mon, xl_rowcol_to_cell(3, c)), st.calc)
            ws.write(5, c, 'Monat %d' % (i + 1), st.kopf_z)
        ws.set_column(0, 0, 14)
        ws.set_column(1, 1, 34)
        ws.set_column(2, 2, 16)
        ws.set_column(W0, W0 + N_WOCHEN - 1, 10)
        ws.set_column(M0 - 1, M0 - 1, 2)
        ws.set_column(M0, M0 + N_MONATE - 1, 10)
        for j in range(PLAETZE_MAX):                         # Plaetze der BUE-Kacheln (je KW einer; je Kachel berechnet)
            ws.write(5, S0 + j, 'Platz %d' % (j + 1), self.st.kopf_z)
        ws.set_column(S0 - 1, S0 - 1, 2)
        ws.set_column(S0, S0 + PLAETZE_MAX - 1, 8)
        for j in range(KW_MAX):                              # Zeitfenster der Kacheln (je Kachel berechnet, rechtsbuendig an der letzten KW)
            ws.write(5, F0 + j, 'Fenster %d' % (j + 1), self.st.kopf_z)
        ws.set_column(F0 - 1, F0 - 1, 2)
        ws.set_column(F0, F0 + KW_MAX - 1, 8)
        # Kapazitaeten: Vormonat, laufender Monat, Januar Folgejahr, Januar uebernaechstes Jahr (Planmonate mit „(Plan)“ auf der Achse)
        for j, (kopf, datum, plan) in enumerate((('Vormonat', 'DATE(YEAR(Berichtstag),MONTH(Berichtstag)-1,1)', False),
                                                 ('Lfd. Monat', 'DATE(YEAR(Berichtstag),MONTH(Berichtstag),1)', False),
                                                 ('Plan Jan +1', 'DATE(YEAR(Berichtstag)+1,1,1)', True),
                                                 ('Plan Jan +2', 'DATE(YEAR(Berichtstag)+2,1,1)', True))):
            c = MAK0 + j
            z = xl_rowcol_to_cell(3, c)
            ws.write_formula(3, c, '=' + datum, st.calc_d)
            ws.write_formula(4, c, '=CHOOSE(MONTH(%s),%s)&" "&RIGHT(YEAR(%s),2)%s' % (z, mon, z, '&" (Plan)"' if plan else ''), st.calc)
            ws.write(5, c, kopf, st.kopf_z)
        ws.set_column(MAK0 - 1, MAK0 - 1, 2)
        ws.set_column(MAK0, MAK0 + N_MAK - 1, 11)
        self.fen = {}
        self.monat_neben = set()
        self.alt_neben = set()                       # nur gelesen, nie Pflicht (Altwerte vor dem BUE-Split: 7a, 7e, 7f)
        self.abgeleitet = set()                 # Reihen, die mit der letzten KW eines Fensters rechnen (zaehlen nicht als Daten)
        # KW auf den Folien (groesste Zahl ueber alle Kacheln; modKW setzt sie) – fuer die Fussnote
        ws.write(2, 1, FOLIE_KW, st.zahl)
        ws.write(2, 2, '← KW auf den Folien (max.)', st.klein)
        ws.freeze_panes(6, 3)

    def _kopf(self, key, text, quelle):
        r = self.zeile
        self.ws.write(r, 0, key, self.st.text)
        self.ws.write(r, 1, text, self.st.text)
        self.ws.write(r, 2, quelle, self.st.klein)
        self.z[key] = r
        self.zeile += 1
        return r

    def _herkunft(self, key, keys=(), codes=()):
        """Rohdaten-Zeilen der Reihe key: die der Reihen keys und die Zeilen der Codes."""
        q = set()
        for k in keys:
            q |= self.quellen.get(k, set())
        for c in codes:
            q.add(self.rd.code_zeilen()[c.lower()])
        self.quellen[key] = q

    def _merke(self, key=None, codes=()):
        """Eine Kachel des Blatts self.blatt zeigt die Reihe key (bzw. Werte der Codes): ihre Rohdaten-Zeilen gelten als berichtet."""
        if not self.blatt:
            return
        s = self.benutzt.setdefault(self.blatt, set())
        if key is not None:
            s |= self.quellen.get(key, set())
        for c in codes:
            s.add(self.rd.code_zeilen()[c.lower()])

    @staticmethod
    def _schluessel(vorlage):
        """Reihen, auf die eine Formelvorlage verweist: {key}, {=key}, {key@-1}, [key]."""
        return set(re.findall(r'\{=?([^}@]+)(?:@-1)?\}', vorlage)) | set(re.findall(r'\[([^\]]+)\]', vorlage))

    def woche(self, key, code, text=None, zaehlt=True):
        """zaehlt=False: gelesen, aber die Rohdaten-Zeile gilt nicht als berichtet (keine Pflicht; z. B. Altwerte vor dem Split)."""
        zr = self.rd.code_zeilen()[code.lower()]
        r = self._kopf(key, text or code, 'Rohdaten')
        # Quelle als Formel: die Zeilennummer stimmt auch, nachdem „KPI löschen“ Zeilen in Rohdaten entfernt hat
        self.ws.write_formula(r, 2, '="Rohdaten Z. "&ROW(Rohdaten!$A$%d)' % zr, self.st.klein, 'Rohdaten Z. %d' % zr)
        self._herkunft(key, codes=[code] if zaehlt else [])
        if not zaehlt:
            self.alt_neben.add(zr)
        zeile = 'Rohdaten!$A$%d:$%s$%d' % (zr, RD_LETZTE, zr)
        for i in range(N_WOCHEN):
            c = W0 + i
            idx = 'INDEX(%s,MATCH(%s$4,RD_Kopf,0))' % (zeile, xl_col_to_name(c))
            self.ws.write_formula(r, c, '=IFERROR(IF(ISNUMBER(%s),%s,NA()),NA())' % (idx, idx), self.st.zahl)
        return r

    @staticmethod
    def spalten(monate):
        """(erste Spalte, Anzahl) der Reihe: Wochen, Monate (True) oder feste Monate der Kapazitaeten-Kachel ('fest')."""
        if monate == 'fest':
            return MAK0, N_MAK
        return (M0, N_MONATE) if monate else (W0, N_WOCHEN)

    def monat(self, key, blatt, zeile_nr, text, fest=False, roh=False, zaehlt=True):
        """Monatswert aus einem Monatsblock in Rohdaten (blatt/zeile_nr: Lage im frueheren Blatt Rohdaten_2/_3, siehe
        MonatsLayout) ueber das Datum in der Kopfzeile des Blocks; fest: in den festen Monaten der Kapazitaeten-Kachel. Fehlt die
        Spalte oder der Wert (z. B. Planwert fuer einen Januar, der noch nicht eingetragen ist), steht #NV: Saeule leer. roh: der
        Zellinhalt wie er ist (auch Text, leer = ""). zaehlt: die Zeile gilt als berichtet, wenn eine Kachel die Reihe zeigt."""
        zr = self.L.zeile[(blatt, zeile_nr)]
        zeile, kopf = self.L.bereich(zr)
        r = self._kopf(key, text, 'Rohdaten')
        self.ws.write_formula(r, 2, '="Rohdaten Z. "&ROW(Rohdaten!$A$%d)' % zr, self.st.klein, 'Rohdaten Z. %d' % zr)
        self._herkunft(key)
        if zaehlt:
            self.quellen[key] = {zr}
        else:
            self.monat_neben.add(zr)                 # gelesen, aber abgeleitet (Quote rechnet sich aus Gesamt und fristgerecht)
        a, n = self.spalten('fest' if fest else True)
        for i in range(n):
            c = a + i
            idx = 'INDEX(%s,MATCH(%s$4,%s,0))' % (zeile, xl_col_to_name(c), kopf)
            if roh:
                self.ws.write_formula(r, c, '=IFERROR(IF(ISNUMBER(%s),%s,%s&""),NA())' % (idx, idx, idx), self.st.zahl1)
            else:
                self.ws.write_formula(r, c, '=IFERROR(IF(ISNUMBER(%s),%s,NA()),NA())' % (idx, idx), self.st.zahl)
        return r

    def formel(self, key, text, vorlage, monate=False, fmt=None, wie=()):
        """vorlage mit {key} fuer die Zelle einer anderen Reihe in derselben Spalte. wie: Codes der Rohdaten-Zeilen, die dieselbe
        Zahl zeigen (z. B. Summe ueber dem Defects-Stapel = 11a) – sie gelten mit der Reihe als berichtet."""
        r = self._kopf(key, text, 'berechnet')
        self._herkunft(key, keys=self._schluessel(vorlage), codes=wie)
        start, n = self.spalten(monate)
        for i in range(n):
            c = start + i
            f = re.sub(r'\{([^}]+)\}', lambda m: xl_rowcol_to_cell(self.z[m.group(1)], c), vorlage)
            self.ws.write_formula(r, c, '=' + f, fmt or self.st.zahl)
        return r

    def plaetze(self, pre):
        """Je BUE-Kachel: Zahl der KW (Zelle in Spalte D, modKW setzt sie) und je Platz die Woche (1..N_WOCHEN, 0 = frei)."""
        r = self._kopf('KW_' + pre, 'BÜ-Kachel %s: angezeigte KW' % pre, 'modKW')
        self.ws.write_number(r, W0, FOLIE_KW, self.st.zahl)
        n = '$%s$%d' % (xl_col_to_name(W0), r + 1)
        L = self.fenster(pre, 'BÜ-Kachel %s' % pre)        # letzte KW mit BÜ-Werten (Rueckstand, Eingaenge, Abgaenge)
        ro = self._kopf('_off' + pre, 'BÜ-Kachel %s: Woche des Platzes' % pre, 'berechnet')
        for j in range(PLAETZE_MAX):
            w = '(%s-%s+%d)' % (L, n, j + 1)
            self.ws.write_formula(ro, S0 + j, '=IF(AND(%d<%s,%s>=1),%s,0)' % (j, n, w, w), self.st.zahl)

    def slots(self, key, text, f, fmt=None):
        """Reihe fuer die BUE-Kacheln (Schluessel beginnt mit der Kachel, z. B. 7V), ein Wert je Platz ab Spalte S0.
        {key} = Zelle der Reihe key in der Woche des Platzes, {key@-1} = in der Vorwoche, {=key} = Zelle der Platz-Reihe key
        im selben Platz, [key] = Bereich der angezeigten Wochen der Reihe key (Zahl der KW aus KW_<Kachel>, endet mit der letzten
        KW mit BÜ-Werten)."""
        pre = key[:2]
        r = self._kopf(key, text, 'Folie, KW je Kachel')
        self._herkunft(key, keys=self._schluessel(f))
        leer = '""' if fmt is self.st.text else 'NA()'
        a, e = xl_col_to_name(W0), xl_col_to_name(W0 + N_WOCHEN - 1)
        n = '$%s$%d' % (a, self.z['KW_' + pre] + 1)
        zeile = lambda k: '$%s$%d:$%s$%d' % (a, self.z[k] + 1, e, self.z[k] + 1)  # noqa: E731
        for j in range(PLAETZE_MAX):
            c = S0 + j
            off = xl_rowcol_to_cell(self.z['_off' + pre], c, row_abs=True)
            g = re.sub(r'\{=([^}]+)\}', lambda m: xl_rowcol_to_cell(self.z[m.group(1)], c), f)                     # Platz-Reihe
            g = re.sub(r'\{([^}@]+)@-1\}', lambda m: 'IF(%s>1,INDEX(%s,%s-1),NA())' % (off, zeile(m.group(1)), off), g)  # Vorwoche
            g = re.sub(r'\{([^}]+)\}', lambda m: 'INDEX(%s,%s)' % (zeile(m.group(1)), off), g)
            L = self.fen[pre]['L']
            g = re.sub(r'\[([^\]]+)\]', lambda m: 'INDEX(%s,MAX(1,%s+1-%s)):INDEX(%s,%s)' % (zeile(m.group(1)), L, n, zeile(m.group(1)), L), g)
            self.ws.write_formula(r, c, '=IF(%s=0,%s,%s)' % (off, leer, g), fmt or self.st.zahl)
        return r

    def sref(self, key):
        self._merke(key)
        return "%s!$%s$%d:$%s$%d" % (self.BLATT, xl_col_to_name(S0), self.z[key] + 1, xl_col_to_name(S0 + FOLIE_KW - 1), self.z[key] + 1)

    def szellen(self, key):
        self._merke(key)
        return ['=%s!%s' % (self.BLATT, xl_rowcol_to_cell(self.z[key], S0 + j, row_abs=True, col_abs=True)) for j in range(FOLIE_KW)]

    def fenster(self, fid, text):
        """Zeitfenster einer Kachel: endet mit der letzten KW, in der eine ihrer Reihen einen Wert hat (L in Spalte D; ohne Daten
        der Berichtstag). Die Diagramme der Kachel zeigen die letzten n KW bis L (Spalten F0.., rechtsbuendig)."""
        if fid not in self.fen:
            r = self._kopf('_L' + fid, '%s: letzte KW mit Daten (Woche 1..%d)' % (text, N_WOCHEN), 'berechnet')
            h = self._kopf('_H' + fid, '%s: KW mit Daten (Hilfszeile)' % text, 'berechnet')
            self.fen[fid] = {'keys': [], 'L': '$%s$%d' % (xl_col_to_name(W0), r + 1), 'r': r, 'h': h, 'text': text}
        return self.fen[fid]['L']

    def fenster_daten(self, fid, key):
        """Reihe key zaehlt fuer die letzte KW mit Daten des Fensters fid. Reihen, die selbst mit der letzten KW rechnen
        (abgeleitet, z. B. die normierten Zu-/Abnahmen), zaehlen nicht – sonst Zirkelbezug, den Excel mit 0 quittiert."""
        if key not in KONSTANT and key not in self.abgeleitet and key not in self.fen[fid]['keys']:
            self.fen[fid]['keys'].append(key)

    def _fzeile(self, fid, key, text):
        name = 'F_%s|%s' % (fid, key)
        if name in self.z:
            return self.z[name]
        r = self._kopf(name, '%s: %s im Zeitfenster' % (self.fen[fid]['text'], 'KW' if key == '_kat' else key), 'Fenster')
        self._herkunft(name, keys=[key])
        a, e = xl_col_to_name(W0), xl_col_to_name(W0 + N_WOCHEN - 1)
        quelle = '$%s$3:$%s$3' % (a, e) if key == '_kat' else '$%s$%d:$%s$%d' % (a, self.z[key] + 1, e, self.z[key] + 1)
        leer = '""' if text else 'NA()'
        L = self.fen[fid]['L']
        for k in range(KW_MAX):
            idx = '(%s-%d)' % (L, KW_MAX - 1 - k)
            self.ws.write_formula(r, F0 + k, '=IF(%s<1,%s,INDEX(%s,%s))' % (idx, leer, quelle, idx), self.st.text if text else self.st.zahl)
        self.z[name] = r
        return r

    def stand_zelle(self, fid, codes):
        """Datum der Werte der letzten KW mit Daten (Blatt Wertstand, groesstes Datum der Codes; ohne Eintrag der Berichtstag der KW)
        und der Text „Stand: TT.MM.JJ“ fuer den Kachelkopf. Liefert die Zelle des Texts."""
        self._merke(codes=codes)
        if '_S' + fid in self.z:
            z = self.z['_S' + fid] + 1
            return '$%s$%d' % (xl_col_to_name(W0 + 1), z), '$%s$%d' % (xl_col_to_name(W0 + 2), z)
        r = self._kopf('_S' + fid, '%s: Stand der Werte (Datum, Text)' % self.fen[fid]['text'], 'Wertstand')
        self._herkunft('_S' + fid, codes=codes)
        L = self.fen[fid]['L']
        datum = 'INDEX($%s$4:$%s$4,%s)' % (xl_col_to_name(W0), xl_col_to_name(W0 + N_WOCHEN - 1), L)
        teile = []
        for code in codes:
            zr = self.rd.code_zeilen()[code.lower()]
            teile.append('IFERROR(N(INDEX(Wertstand!$A$%d:$%s$%d,MATCH(%s,RD_Kopf,0))),0)' % (zr, RD_LETZTE, zr, datum))
        self.ws.write_formula(r, W0, '=IF(MAX(%s)>0,MAX(%s),%s)' % (','.join(teile), ','.join(teile), datum), self.st.datum)
        d = '$%s$%d' % (xl_col_to_name(W0), r + 1)
        tag = 'TEXT(DAY(%s),"00")&"."&TEXT(MONTH(%s),"00")&"."&RIGHT(YEAR(%s),2)' % (d, d, d)
        self.ws.write_formula(r, W0 + 1, '="Stand: "&%s' % tag, self.st.text)                    # eine Zeile
        self.ws.write_formula(r, W0 + 2, '="Stand:"&CHAR(10)&%s' % tag, self.st.text)           # zweizeilig (schmale Kachel)
        return '$%s$%d' % (xl_col_to_name(W0 + 1), r + 1), '$%s$%d' % (xl_col_to_name(W0 + 2), r + 1)

    def fenster_abschliessen(self):
        """Hilfszeile und letzte KW je Fenster (erst jetzt, wenn alle Reihen der Kachel bekannt sind)."""
        for fid, f in self.fen.items():
            for i in range(N_WOCHEN):
                c = W0 + i
                teile = ['ISNUMBER(%s)' % xl_rowcol_to_cell(self.z[k], c) for k in f['keys']]
                self.ws.write_formula(f['h'], c, '=IF(OR(%s),%d,0)' % (','.join(teile), i + 1) if teile else '=0', self.st.zahl)
            h = '$%s$%d:$%s$%d' % (xl_col_to_name(W0), f['h'] + 1, xl_col_to_name(W0 + N_WOCHEN - 1), f['h'] + 1)
            self.ws.write_formula(f['r'], W0, '=IF(MAX(%s)=0,%d,MAX(%s))' % (h, N_WOCHEN, h), self.st.zahl)

    def ref(self, key, monate=False, letzte=None, f=None):
        self._merke(key)
        if f and not monate:
            r = self._fzeile(f, key, False) + 1
            self.fenster_daten(f, key)
            e = F0 + KW_MAX - 1
            return "%s!$%s$%d:$%s$%d" % (self.BLATT, xl_col_to_name(e - (letzte or FOLIE_KW) + 1), r, xl_col_to_name(e), r)
        r = self.z[key] + 1
        a, n = self.spalten(monate)
        e = a + n - 1
        if not monate:
            letzte = letzte or FOLIE_KW
        if letzte:
            a = e - letzte + 1
        return "%s!$%s$%d:$%s$%d" % (self.BLATT, xl_col_to_name(a), r, xl_col_to_name(e), r)

    def zellen(self, key, monate=False, letzte=None, f=None):
        """Einzelzellen (fuer benutzerdefinierte Datenbeschriftungen)."""
        self._merke(key)
        if f and not monate:
            r = self._fzeile(f, key, True)
            e = F0 + KW_MAX - 1
            return ['=%s!%s' % (self.BLATT, xl_rowcol_to_cell(r, c, row_abs=True, col_abs=True)) for c in range(e - (letzte or FOLIE_KW) + 1, e + 1)]
        r = self.z[key]
        a, n = self.spalten(monate)
        cs = list(range(a, a + n))
        if not monate:
            letzte = letzte or FOLIE_KW
        if letzte:
            cs = cs[-letzte:]
        return ['=%s!%s' % (self.BLATT, xl_rowcol_to_cell(r, c, row_abs=True, col_abs=True)) for c in cs]

    kurz = True                              # Folien: Achse nur mit der Wochennummer; Zeitraum steht in der Fussnote

    def kat(self, monate=False, letzte=None, f=None):
        if f and not monate:
            r = self._fzeile(f, '_kat', True) + 1
            e = F0 + KW_MAX - 1
            return "%s!$%s$%d:$%s$%d" % (self.BLATT, xl_col_to_name(e - (letzte or FOLIE_KW) + 1), r, xl_col_to_name(e), r)
        a, n = self.spalten(monate)
        e = a + n - 1
        if not monate:
            letzte = letzte or FOLIE_KW
        if letzte:
            a = e - letzte + 1
        zeile = 3 if (self.kurz and not monate) else 5
        return "%s!$%s$%d:$%s$%d" % (self.BLATT, xl_col_to_name(a), zeile, xl_col_to_name(e), zeile)


def _traeger(ich, anderer, vergleich, zeile, quelle):
    """Hoehe des unsichtbaren Traegerbalkens fuer die Zahl ueber einem Zu-/Abnahmen-Balken (Werte normiert): die eigene Balkenhoehe;
    ist der Nachbarbalken der KW fast gleich hoch (weniger als eine Zahlenzeile), steht die Zahl des hoeheren eine Zeile ueber der
    des niedrigeren – die Zahlen stehen mittig ueber dem eigenen Balken und ueberlappen sich nie."""
    a = 'IFERROR(%s,-9)' % anderer
    return 'IF(ISNUMBER(%s),IF(AND(%s%s%s,%s-%s<%.5f),%s+%.5f,%s),NA())' % (quelle, ich, vergleich, a, ich, a, zeile, anderer, zeile, ich)


def daten_reihen(d):
    """Alle Reihen der Kacheln."""
    for code in ['6a', '10b', '8a', '8b', '8c', '8e', '19', '20', '18c', '13a', '13b', '13c', '13d',
                 '11a', '11b', '11c', '11d', '11e', '11f', '11g', '11h', '11i', '11j', '11k', '11l', '3', '5', '9', '15']:
        d.woche(code, code)
    for q, pre in (('Verbund', '7V'), ('OPAG', '7O')):
        d.plaetze(pre)
        d.slots(pre + '_kat', 'BÜ %s: KW unter der Säule' % q, '""&ISOWEEKNUM({_datum}-MOD(WEEKDAY({_datum},2)+2,7))', fmt=d.st.text)
        d.woche(pre + 'A', pre + 'A', 'BÜ %s Rückstand' % q)
        for teil, code in zip(('Gesundheit', 'Komposit', 'Leben'), 'BCD'):
            d.woche(pre + code, pre + code, 'BÜ %s Rückstand %s' % (q, teil))
        for teil, (zu, ab) in zip(('Gesundheit', 'Komposit', 'Leben'), (('F', 'J'), ('G', 'K'), ('H', 'L'))):
            d.woche(pre + zu, pre + zu, 'BÜ %s Eingänge %s' % (q, teil))
            d.woche(pre + ab, pre + ab, 'BÜ %s Abgänge %s' % (q, teil))
        # Verbund: KW ohne Spartensplit (vor dem BUE-Reporting) aus dem bisherigen Reporting – Gesamt offene Vorgaenge 7a, Zugaenge
        # 7e, Abgaenge 7f (dort nur HSB 4 K Gesundheit, Kombo/LV „miso fehlt“)
        alt = {'_ein': '', '_ab': '', '_rs': ''}
        if q == 'Verbund':
            for code in ('7a', '7e', '7f'):
                d.woche('alt' + code, code, 'BÜ Verbund bisheriges Reporting %s' % code, zaehlt=False)
            alt = {'_ein': 'IF(ISNUMBER({alt7e}),{alt7e},NA())', '_ab': 'IF(ISNUMBER({alt7f}),{alt7f},NA())',
                   '_rs': 'IF(ISNUMBER({alt7a}),{alt7a},NA())'}
        for key, cs, titel in (('_ein', 'FGH', 'Eingänge Summe'), ('_ab', 'JKL', 'Abgänge Summe'), ('_rs', 'BCD', 'Rückstand Summe Sparten')):
            refs = ','.join('{%s%s}' % (pre, c) for c in cs)
            d.formel(pre + key, 'BÜ %s %s%s' % (q, titel, ' (ohne Split: bisheriges Reporting)' if alt[key] else ''),
                     'IF(COUNT(%s)=0,%s,SUM(%s))' % (refs, alt[key] or 'NA()', refs))
        if q == 'Verbund':
            d.formel(pre + '_og', 'BÜ Verbund Gesamt ohne Spartensplit (bisheriges Reporting)',
                     'IF(AND(COUNT({%sB},{%sC},{%sD})=0,ISNUMBER({alt7a})),{alt7a},NA())' % (pre, pre, pre))
        d.formel(pre + '_d', 'BÜ %s Saldo Eingänge minus Abgänge' % q, 'IF(AND(ISNUMBER({%s_ein}),ISNUMBER({%s_ab})),{%s_ein}-{%s_ab},NA())' % ((pre,) * 4))
        for key in ('_rs', '_ein', '_ab'):
            d.fenster_daten(pre, pre + key)
        # Folien-Diagramme (je KW ein Platz): alle Werte normiert auf die hoechste Saeule der gezeigten KW (1,0); Lagen in Punkt /
        # Punkt je Einheit
        sla = 'Konfiguration!$F$9' if q == 'Verbund' else 'Konfiguration!$F$11'
        pb = BEST_H - BEST_OBEN - BEST_UNTEN                                 # Punkt je Einheit (Hoehe der hoechsten Saeule)
        d.slots(pre + '_mb', 'BÜ %s offene Vorgänge: Bezug (höchste Säule oder SLA)' % q, 'MAX(1,_xlfn.AGGREGATE(4,6,[%s_rs]),N(%s))' % (pre, sla))
        mb = '{=%s_mb}' % pre
        hk = KASTEN_PT / pb                                                  # Hoehe eines Wertkastens (Einheiten)
        for code, teil in SPARTEN:
            d.slots(pre + '_s' + code, 'BÜ %s offene Vorgänge %s (Säule, normiert)' % (q, teil), 'IF(ISNUMBER({%s}),{%s}/%s,NA())' % (pre + code, pre + code, mb))
        if q == 'Verbund':
            d.slots(pre + '_sO', 'BÜ Verbund Gesamt ohne Spartensplit (Säule, normiert)', 'IF(ISNUMBER({7V_og}),{7V_og}/%s,NA())' % mb)
        for code, teil in SPARTEN:
            # Lage im Stapel von oben (0 = oben): groesste Sparte (Summe der gezeigten KW) unten, kleinste oben, wie
            # modPPT.SpartenStapeln -> Zahl der Sparten mit kleinerer Summe
            andere = [c for c in 'BCD' if c != code]
            summe = lambda c: '_xlfn.AGGREGATE(9,6,[%s])' % (pre + c)  # noqa: E731
            pos = '+'.join('(%s>%s)' % (summe(code), summe(o)) + ('+(%s=%s)' % (summe(code), summe(o)) if o > code else '') for o in andere)
            d.slots(pre + '_r' + code, 'BÜ %s %s: Lage im Stapel von oben' % (q, teil), pos)
            d.slots(pre + '_t' + code, 'BÜ %s offene Vorgänge %s (Wert, Tsd.)' % (q, teil), 'IF(ISNUMBER({%s}),FIXED({%s}/1000,1),"")' % (pre + code, pre + code),
                    fmt=d.st.text)
        for code, teil in SPARTEN:
            andere = [c for c in 'BCD' if c != code]
            darunter = '+'.join('IF({=%s_r%s}>{=%s_r%s},N({%s}),0)' % (pre, o, pre, code, pre + o) for o in andere)
            d.slots(pre + '_c' + code, 'BÜ %s %s: Mitte des Segments (normiert)' % (q, teil),
                    'IF(ISNUMBER({%s}),(%s+{%s}/2)/%s,NA())' % (pre + code, darunter, pre + code, mb))
        for code, teil in SPARTEN:
            # Wertkasten der Sparte im Balken: in der Mitte des Segments; reicht das Segment nicht, rutscht der Kasten unter den
            # Kasten der Sparte darueber (von oben nach unten gestapelt, oberster Kasten buendig mit der Saeule), nie unter die Achse
            andere = [c for c in 'BCD' if c != code]
            r = '{=%s_r%s}' % (pre, code)
            ueber = ','.join('IF({=%s_r%s}<%s,IFERROR({=%s_c%s},9)-(%s-{=%s_r%s})*%.5f,9)' % (pre, o, r, pre, o, r, pre, o, hk) for o in andere)
            lage = 'MAX(MIN({=%s_c%s},IFERROR({%s_rs}/%s,1)-%.5f-%s*%.5f,%s),%.5f+(2-%s)*%.5f)' % (pre, code, pre, mb, hk / 2, r, hk, ueber, hk / 2, r, hk)
            d.slots(pre + '_l' + code, 'BÜ %s %s: Lage des Wertkastens' % (q, teil), 'IF(ISNUMBER({%s}),%s,NA())' % (pre + code, lage))
        d.slots(pre + '_sum', 'BÜ %s offene Vorgänge Summe (Lage, normiert)' % q,
                'IF(ISNUMBER({%s_rs}),MAX({%s_rs}/%s,IFERROR(_xlfn.AGGREGATE(4,6,{=%s_lB},{=%s_lC},{=%s_lD}),0)+%.5f),NA())'
                % (pre, pre, mb, pre, pre, pre, hk / 2))
        d.slots(pre + '_sum_t', 'BÜ %s offene Vorgänge Summe (Tsd.)' % q, 'IF(ISNUMBER({%s_rs}),FIXED({%s_rs}/1000,1),"")' % (pre, pre), fmt=d.st.text)
        d.slots(pre + '_sla', 'BÜ %s SLA (Linie, normiert)' % q, 'IF(N(%s)>0,N(%s)/%s,NA())' % (sla, sla, mb))
        # Zu-/Abnahmen: nebeneinander, Zahl der aktuellen KW ueber dem Balken, unter der KW der Saldo (Nettoveraenderung)
        d.slots(pre + '_mv', 'BÜ %s Zu-/Abnahmen: Bezug (höchster Balken)' % q,
                'MAX(1,_xlfn.AGGREGATE(4,6,[%s_ein]),_xlfn.AGGREGATE(4,6,[%s_ab]))' % (pre, pre))
        mv = '{=%s_mv}' % pre
        for k_, n_, quelle in (('e', 'Zunahmen', pre + '_ein'), ('a', 'Abnahmen', pre + '_ab')):
            d.slots(pre + '_s' + k_, 'BÜ %s %s (Balken, normiert)' % (q, n_), 'IF(ISNUMBER({%s}),{%s}/%s,NA())' % (quelle, quelle, mv))
            # Zahl leicht nach aussen (geschuetzte Leerzeichen): Zunahmen links, Abnahmen rechts – so verdeckt der hoehere Nachbarbalken nichts
            text = ('FIXED({%s}/1000,1)&REPT(UNICHAR(160),3)' if k_ == 'e' else 'REPT(UNICHAR(160),3)&FIXED({%s}/1000,1)') % quelle
            d.slots(pre + '_t' + k_, 'BÜ %s %s (Wert, Tsd.)' % (q, n_), 'IF(ISNUMBER({%s}),%s,"")' % (quelle, text), fmt=d.st.text)
        pv = VORG_H - VORG_OBEN - VORG_UNTEN
        for k_, n_, quelle, (ich, anderer, vergleich) in (('e', 'Zunahmen', pre + '_ein', ('e', 'a', '>=')), ('a', 'Abnahmen', pre + '_ab', ('a', 'e', '>'))):
            d.slots(pre + '_c' + k_, 'BÜ %s %s (Träger der Zahl über dem Balken)' % (q, n_), _traeger('{=%s_s%s}' % (pre, ich), '{=%s_s%s}' % (pre, anderer),
                                                                                                   vergleich, ZAHL_PT / pv, '{%s}' % quelle))
        rp = 'ROUND({%s_d}/1000,1)' % pre
        for k_, bed in (('auf', '>0'), ('ab', '<0'), ('null', '=0')):
            d.slots(pre + '_p' + k_, 'BÜ %s Saldo (%s)' % (q, k_), 'IF(ISNUMBER({%s_d}),IF(%s%s,0.5,NA()),NA())' % (pre, rp, bed))
        d.slots(pre + '_pt', 'BÜ %s Saldo (Text, Tsd.)' % q,
                'IF(ISNUMBER({%s_d}),IF(%s>0,"+"&FIXED(%s,1),IF(%s<0,"−"&FIXED(-%s,1),"±0")),"")' % (pre, rp, rp, rp, rp), fmt=d.st.text)
    # Verhaeltnis Rueckstand OPAG / Verbund je Woche (fuer den SLA-Vorschlag OPAG in Konfiguration!F11)
    d.formel('7_quote', 'BÜ Verhältnis Rückstand OPAG / Verbund', 'IFERROR({7O_rs}/{7V_rs},NA())', fmt=d.st.zahl1)
    d.formel('6a_t', 'Schwebefälle in Tausend', 'IF(ISNUMBER({6a}),{6a}/1000,NA())', fmt=d.st.zahl1)
    d.formel('13a_t', 'Überwachte VNRs in Tausend', 'IF(ISNUMBER({13a}),{13a}/1000,NA())', fmt=d.st.zahl1)
    for code, titel in (('13b', 'Treffer VNRs'), ('13c', 'In Bearbeitung'), ('13d', 'Erledigt')):
        d.formel(code + '_1', 'Watchlist %s: Platz des Kastens' % titel, 'IF(ISNUMBER({%s}),1,NA())' % code)
        d.formel(code + '_t', 'Watchlist %s (Text im Kasten)' % titel, 'IF(ISNUMBER({%s}),FIXED({%s},0),"")' % (code, code), fmt=d.st.text)
    d.formel('11a_sum', 'Defect Fixing Summe Stapel', 'IF(COUNT({11b},{11c},{11d})=0,NA(),SUM({11b},{11c},{11d}))', wie=['11a'])
    d.formel('11a_t', 'Defect Fixing Beschriftung', 'IF(ISNUMBER({11a_sum}),FIXED({11a_sum},0),"")', fmt=d.st.text)
    d.formel('11a_pos', 'Defect Fixing Lage der Summe (etwas über dem Stapel)', 'IF(ISNUMBER({11a_sum}),{11a_sum}+0.08*MAX(1,_xlfn.AGGREGATE(4,6,%s)),NA())'
             % d.ref('11a_sum', letzte=N_WOCHEN).split('!')[1])
    d.formel('11g_sum', 'Defects op. Betrieb Summe Stapel', 'IF(COUNT({11h},{11i},{11j})=0,NA(),SUM({11h},{11i},{11j}))', wie=['11g'])
    d.formel('11g_t', 'Defects op. Betrieb Beschriftung', 'IF(ISNUMBER({11g_sum}),FIXED({11g_sum},0),"")', fmt=d.st.text)
    d.formel('11g_pos', 'Defects op. Betrieb Lage der Summe (etwas über dem Stapel)', 'IF(ISNUMBER({11g_sum}),{11g_sum}+0.08*MAX(1,_xlfn.AGGREGATE(4,6,%s)),NA())'
             % d.ref('11g_sum', letzte=N_WOCHEN).split('!')[1])
    d.formel('SLA', 'SLA Provisionsreklamation', 'SLA_PV')
    # Monatswerte
    d.monat('18D', 'Rohdaten_3', 3, 'Neuverpflichtungen gesamt')
    d.monat('18D_f', 'Rohdaten_3', 4, 'Neuverpflichtungen fristgerecht erledigt')
    # Erledigungsquote robust: eingetragene Quote auch als Text („96 %“, „0,96“, „96,4“; Werte ueber 1,5 gelten als Prozent),
    # sonst aus fristgerecht erledigt / Gesamt. Im Rohdatenblatt rechnet die Zeile 18E das schon selbst; als Text eingetippte
    # Zahlen (gruenes Dreieck) fielen bisher durch ISNUMBER und die Beschriftung blieb leer.
    d.monat('18E_w', 'Rohdaten_3', 5, 'Erledigungsquote (Zellinhalt)', roh=True, zaehlt=False)
    d.formel('18E_z', 'Erledigungsquote als Zahl', 'IFERROR(IF(ISNUMBER({18E_w}),{18E_w},IF({18E_w}="",NA(),_xlfn.NUMBERVALUE(TRIM(SUBSTITUTE({18E_w},"%","")),",","."))),NA())',
             monate=True, fmt=d.st.zahl1)
    d.formel('18E', 'Erledigungsquote', 'IF(ISNUMBER({18E_z}),IF({18E_z}>1.5,{18E_z}/100,{18E_z}),'
             'IF(AND(ISNUMBER({18D}),ISNUMBER({18D_f})),IF({18D}>0,{18D_f}/{18D},NA()),NA()))', monate=True, fmt=d.st.zahl1)
    d.formel('18E_t', 'Erledigungsquote Beschriftung', 'IF(ISNUMBER({18E}),FIXED({18E}*100,0)&" %","")',
             monate=True, fmt=d.st.text)
    # Kapazitaeten: feste Monate (Vormonat, laufender Monat, Januar der beiden Folgejahre), siehe MAK0
    d.monat('21b', 'Rohdaten_2', 4, 'MAK Soll', fest=True)
    d.monat('21c', 'Rohdaten_2', 5, 'MAK (V)Ist', fest=True)
    d.formel('21b_r', 'MAK Soll gerundet', 'IF(ISNUMBER({21b}),ROUND({21b},0),NA())', monate='fest')
    d.formel('21c_r', 'MAK (V)Ist gerundet', 'IF(ISNUMBER({21c}),ROUND({21c},0),NA())', monate='fest')


# ------------------------------------------------------------------ Kacheln
class Kachel:
    def __init__(self, ws, wb, d, nr, x, y, b, h, titel, farbe, zusatz='', stand=None, fenster=None):
        """stand: Codes der Rohdaten-Zeilen der Kachel; rechts im Kopf steht dann „Stand: TT.MM.JJ“ (Datum der Werte der letzten KW
        mit Daten, aus dem Blatt Wertstand; ohne eingetragenes Datum der Berichtstag dieser KW). Passt der Titel daneben nicht,
        wird seine Schrift kleiner."""
        self.ws, self.wb, self.d = ws, wb, d
        self.nr, self.x, self.y, self.b, self.h, self.farbe = nr, x, y, b, h, farbe
        self.titel = titel
        p = 'K%d_' % nr
        self.p = p
        self.f = fenster or '%s_%d' % (ws.name, nr)         # Zeitfenster der Kachel (letzte KW mit Daten); BÜ: das der Plaetze
        d.fenster(self.f, '%s %d %s' % (ws.name, nr, titel))
        form(ws, x, y, b, 20, '', p + 'Kopf', fill=farbe, geom='round2SameRect')
        text = titel + (('  ' + zusatz) if zusatz else '')
        kurz = STAND[:6] + STAND[-2:]

        def passend(frei, minimum):
            g = 8.5
            while g > minimum and textbreite(text, g, True) > frei:
                g -= 0.25
            return g
        if stand:
            zelle_1, zelle_2 = d.stand_zelle(self.f, stand)
            tb_stand = textbreite('Stand: 00.00.00', 7) + 4                 # „Stand: TT.MM.JJ“ in einer Zeile
            frei = b - 30 - tb_stand - 6
            groesse = passend(frei, 7)
            if textbreite(text, groesse, True) > frei:                       # zu eng: Stand zweizeilig, Titel notfalls kleiner
                tb_stand = textbreite('00.00.00', 6.5) + 4
                frei = b - 30 - tb_stand - 6
                groesse = passend(frei, 6)
                form(ws, x + b - 6 - tb_stand, y + 1, tb_stand, 18, '', p + 'Stand', schrift={'size': 6.5, 'color': WEISS},
                     ausrichtung={'vertical': 'middle', 'horizontal': 'right'}, textlink='=Dashboard_Daten!%s' % zelle_2, cache='Stand:\n' + kurz)
            else:
                form(ws, x + b - 6 - tb_stand, y, tb_stand, 20, '', p + 'Stand', schrift={'size': 7, 'color': WEISS}, umbruch=False,
                     ausrichtung={'vertical': 'middle', 'horizontal': 'right'}, textlink='=Dashboard_Daten!%s' % zelle_1, cache='Stand: ' + kurz)
        else:
            frei = b - 30
            groesse = passend(frei, 6.5)
        form(ws, x + 25, y, frei, 20, text, p + 'Titel', schrift={'size': groesse, 'bold': True, 'color': WEISS}, umbruch=False)
        form(ws, x + 6, y + 3.5, 13, 13, str(nr), p + 'Nr', fill=WEISS, geom='ellipse',
             schrift={'size': 7, 'bold': True, 'color': farbe}, ausrichtung={'vertical': 'middle', 'horizontal': 'center'})
        form(ws, x, y + 20, b, h - 20, '', p + 'Grund', fill=KACHEL_GRUND)
        self.legende_y = y + 24

    def legende(self, eintraege, y=None):
        """eintraege: (art, farbe, text[, zelle]); art 'linie' | 'strich' | 'box' | 'text' | 'umbruch' (neue Zeile). Bricht sonst um,
        wenn noetig. Mit zelle ist der Text mit dieser Zelle verknuepft (text = Vorbelegung und Breite)."""
        cx, cy = self.x + 6, (self.legende_y if y is None else y)
        for i, eintrag in enumerate(eintraege):
            art, farbe, text = eintrag[:3]
            zelle = eintrag[3] if len(eintrag) > 3 else None
            if art == 'umbruch':
                cx, cy = self.x + 6, cy + 9
                continue
            tb = textbreite(text, 6.5) + 6
            sb = 10 if art in ('linie', 'strich') else 5
            if cx + sb + 3 + tb > self.x + self.b - 4 and cx > self.x + 6:
                cx, cy = self.x + 6, cy + 9
            n = '%sLeg%d_%d' % (self.p, int(cy), i)
            schriftfarbe = GRAUD
            if art == 'farbtext':
                sb, schriftfarbe = -3, farbe
            elif art == 'text':
                sb = -3
            elif art == 'linie':
                form(self.ws, cx, cy + 3.25, sb, 1.75, '', n + 'S', fill=farbe)
            elif art == 'strich':
                for j in range(3):
                    form(self.ws, cx + j * 3.75, cy + 3.25, 2.75, 1.5, '', n + 'S%d' % j, fill=farbe)
            else:
                form(self.ws, cx, cy + 1.5, sb, 5, '', n + 'S', fill=farbe)
            if zelle:
                form(self.ws, cx + sb + 3, cy, tb, 8, '', n, schrift={'size': 6.5, 'color': schriftfarbe}, umbruch=False, textlink=zelle, cache=text)
            else:
                form(self.ws, cx + sb + 3, cy, tb, 8, text, n, schrift={'size': 6.5, 'color': schriftfarbe}, umbruch=False)
            cx += sb + 3 + tb + 7
        self.inhalt_y = cy + 11

    def flaeche(self, anteil_oben=None):
        """Platz fuer ein Diagramm (oder zwei uebereinander): Liste von (x, y, b, h)."""
        x, b = self.x + 2, self.b - 4
        y0 = self.inhalt_y
        rest = self.y + self.h - 2 - y0
        if anteil_oben is None:
            return [(x, y0, b, rest)]
        h1 = rest * anteil_oben
        return [(x, y0, b, h1), (x, y0 + h1, b, rest - h1)]


# ------------------------------------------------------------------ Verzeichnis fuer „Diagramm anpassen“ (modKW)
# je Kachel: Diagramme mit Art (W = Wochen, M = Monate, B = BUE-Plaetze) und die schaltbaren Werte (Beschriftungen je Reihe)
VERZEICHNIS = {}


def verzeichnen(k, diagramm, art, werte=(), zelle=''):
    """werte: (Anzeige, [(Reihe, Zeile der Beschriftungstexte oder 0)], Schalterzelle oder '')."""
    e = VERZEICHNIS.setdefault((k.ws.name, k.nr), {'titel': k.titel, 'diagramme': [], 'werte': [], 'zelle': ''})
    e['diagramme'].append((k.p + diagramm, art))
    if zelle:
        e['zelle'] = zelle
    for anzeige, reihen, schalter in werte:
        e['werte'].append((anzeige, [(k.p + diagramm, s, z) for s, z in reihen], schalter))


def verzeichnis_schreiben(d):
    ws, st = d.ws, d.st
    ws.write(5, REG0 - 1, '', st.kopf)
    # Masse fuer modKW (Spaltennummern ab 1): erste/letzte Spalte des Zeitfensters der Kacheln (Wochen-Diagramme), letzter Monat,
    # erster BUE-Platz, KW-Spanne, Monate
    for c, (txt, v) in enumerate((('Woche von', F0 + 1), ('Woche bis', F0 + KW_MAX), ('Monat bis', M0 + N_MONATE), ('Platz von', S0 + 1),
                                  ('KW min', KW_MIN), ('KW max', KW_MAX), ('Monate max', N_MONATE), ('Fest von', MAK0 + 1),
                                  ('Fest Anzahl', N_MAK))):
        ws.write(1, REG0 + c, txt, st.klein)
        ws.write_number(2, REG0 + c, v, st.zahl)
    for c, txt in enumerate(['Verzeichnis: Blatt', 'Kachel', 'Titel', 'Diagramme (Name:Art)', 'KW-Zelle (BÜ)', 'Werte (Anzeige|Diagramm>Reihe>Zeile,…|Schalter)']):
        ws.write(5, REG0 + c, txt, st.kopf)
    for i, ((blatt, nr), e) in enumerate(sorted(VERZEICHNIS.items())):
        z = 6 + i
        ws.write(z, REG0, blatt, st.text)
        ws.write_number(z, REG0 + 1, nr, st.zahl)
        ws.write(z, REG0 + 2, e['titel'], st.text)
        ws.write(z, REG0 + 3, ';'.join('%s:%s' % x for x in e['diagramme']), st.text)
        ws.write(z, REG0 + 4, e['zelle'], st.text)
        for j, (anzeige, reihen, schalter) in enumerate(e['werte']):
            ws.write(z, REG0 + 5 + j, '%s|%s|%s' % (anzeige, ','.join('%s>%s>%d' % x for x in reihen), schalter), st.text)
    ws.set_column(REG0, REG0 + 12, 14)


def layout_unten(h, oben=None):
    """Zeichenflaeche eines Diagramms, das an der Unterkante der Kachel endet: die Achse liegt immer ACHSE_UNTEN Punkt ueber
    der Diagrammunterkante (wie in den BUE-Kacheln), so stehen die KW-Nummern aller Kacheln einer Reihe auf einer Hoehe."""
    oben = max(9.0, 0.13 * h) if oben is None else oben
    return {'x': 0.02, 'y': oben / h, 'width': 0.96, 'height': max(0.2, (h - ACHSE_UNTEN - oben) / h)}


ACHSE_UNTEN = 22.0                     # wie BEST_UNTEN / VORG_UNTEN: Platz fuer KW-Nummern (und Delta-Zeile) unter der Achse
LAYOUT_OBEN = {'x': 0.02, 'y': 0.16, 'width': 0.96, 'height': 0.80}
LAYOUT_UNTEN = {'x': 0.02, 'y': 0.06, 'width': 0.96, 'height': 0.72}
LAYOUT_ALLEIN = {'x': 0.02, 'y': 0.13, 'width': 0.96, 'height': 0.67}


def linien_reihe(farbe, beschriftung=True, fmt='#,##0', strich=False, breite=2.25, marker=True):
    s = {'line': {'color': farbe, 'width': 1.0 if strich else breite}}
    if strich:
        s['line']['dash_type'] = 'dash'
        s['marker'] = {'type': 'none'}
    elif marker:
        s['marker'] = {'type': 'circle', 'size': 5, 'fill': {'color': WEISS}, 'border': {'color': farbe, 'width': 1.25}}
    else:
        s['marker'] = {'type': 'none'}
    if beschriftung:
        s['data_labels'] = {'value': True, 'position': 'above', 'num_format': fmt,
                            'font': {'name': FONT_F, 'size': 6.5, 'bold': True, 'color': farbe}}
    return s


def linien_chart(k, platz, reihen, kategorien_sichtbar=True, layout=None, minimum=0, name='Linie'):
    """reihen: (schluessel, beschriftung, optionen-dict aus linien_reihe)"""
    ch = chart_basis(k.wb, 'line', layout=layout or (layout_unten(platz[3]) if kategorien_sichtbar else LAYOUT_OBEN))
    werte = []
    for key, titel, o in reihen:
        s = {'name': titel, 'categories': k.d.kat(f=k.f), 'values': k.d.ref(key, f=k.f)}
        s.update(o)
        ch.add_series(s)
        if 'data_labels' in o:
            werte.append((titel, [(titel, 0)], ''))
    x_achse(ch, kategorien_sichtbar, True)
    y_achse(ch, minimum)
    chart_setzen(k.ws, ch, *platz, name=k.p + name)
    verzeichnen(k, name, 'W', werte)


PV_OBEN = 10.0                         # Provisionsreklamation AO/Makler: Luft (pt) ueber dem hoechsten Punkt fuer die Zahl
PV = {}                                # gemeinsame Werteachse der Kacheln 4/5 auf PPT_2 (Bezug, Massstab, Lage der Null)


def pv_linie(k, platz, roh, layout, kategorien_sichtbar, kw=None):
    """Provisionsreklamation AO (Kachel 4) und Makler (Kachel 5): Linie „Offene Vorgänge“ und SLA gestrichelt auf einer gemeinsamen
    Werteachse – gleiche Werte stehen in beiden Kacheln auf derselben Hoehe, die SLA-Linien also auf einer Linie. Technik wie in
    den BUE-Kacheln: Werte normiert auf einen gemeinsamen Bezug (PV_M = groesster gezeigter Wert beider Kacheln oder SLA), Achsen
    mit festen Grenzen, Zahlen als eigene Beschriftung aus Dashboard_Daten. Die erste Kachel (AO) legt den Massstab fest (Punkt je
    Einheit, Lage der Null in der Kachel); die zweite (Makler) hat ihre Grundlinie unten auf der Hoehe der Nachbarkacheln (Achse 0
    bis Oberkante, gleicher Massstab in Punkt je Einheit) und eine eigene Normierung PV_F (Faktor je Vorgang), mit der ihre SLA-Linie
    genau auf der Hoehe der SLA-Linie der AO-Kachel liegt: w = Wert x (1/PV_M + D/SLA), D = Abstand der beiden Grundlinien in
    Einheiten. Haette der hoechste Makler-Wert damit keinen Platz mehr, wird der Faktor gedeckelt (dann liegt die SLA tiefer).
    Lage relativ zur Kachel: „Kacheln ein-/ausblenden“ verschiebt nur senkrecht ganze Kacheln, die Hoehen bleiben.
    kw: Zeile mit der Zahl der gezeigten KW der Kachel (AO: die der Zu-/Abnahmen); ohne eigene Zeile legt die Funktion sie an."""
    d = k.d
    if 'PV_M' not in d.z:
        d._kopf('PV_M', 'Provisionsreklamation AO/Makler: gemeinsamer Bezug der Werteachse (höchster gezeigter Wert oder SLA)', 'berechnet')
        d.abgeleitet.add('SLA_pv')
        d.formel('SLA_pv', 'SLA Provisionsreklamation (Linie, normiert auf PV_M)', 'IF(N({SLA})>0,N({SLA})/%s,NA())' % pv_bezug_zelle(d))
    m = pv_bezug_zelle(d)
    # Geometrie relativ zur Kachel (Punkt): Zeichenflaeche (inner) oben/unten
    x, y, b, h = platz
    oben = y - k.y + layout['y'] * h
    unten = y - k.y + (layout['y'] + layout['height']) * h
    sla_reihe = 'SLA_pv'
    d.abgeleitet.update((roh + '_pv', roh + '_pvt'))
    if 'massstab' not in PV:
        p = unten - oben
        maximum = p / (p - PV_OBEN)                            # 1,0 = hoechster Wert, darueber Platz fuer seine Zahl
        PV['massstab'], PV['null'] = p / maximum, unten
        minimum = 0.0
        d.formel(roh + '_pv', '%s: Offene Vorgänge (Linie, normiert auf PV_M)' % k.titel, 'IF(ISNUMBER({%s}),{%s}/%s,NA())' % (roh, roh, m))
    else:
        s = PV['massstab']
        minimum, maximum = 0.0, (unten - oben) / s
        abstand = (unten - PV['null']) / s                     # Grundlinie dieser Kachel unter der AO-Grundlinie (Einheiten)
        faktor = 'PV_F_%d' % k.nr
        d._kopf(faktor, '%s: Faktor je Vorgang (SLA auf Höhe der AO-SLA, Grundlinie unten)' % k.titel, 'berechnet')
        fz = '$%s$%d' % (xl_col_to_name(W0), d.z[faktor] + 1)
        PV.setdefault('faktoren', []).append((faktor, roh, k.f, abstand, (unten - oben - PV_OBEN) / s))
        d.formel(roh + '_pv', '%s: Offene Vorgänge (Linie, Faktor PV_F)' % k.titel, 'IF(ISNUMBER({%s}),{%s}*%s,NA())' % (roh, roh, fz))
        sla_reihe = 'SLA_pv_%d' % k.nr
        d.abgeleitet.add(sla_reihe)
        d.formel(sla_reihe, '%s: SLA (Linie, Faktor PV_F)' % k.titel, 'IF(N({SLA})>0,N({SLA})*%s,NA())' % fz)
    d.formel(roh + '_pvt', '%s: Offene Vorgänge (Text)' % k.titel, 'IF(ISNUMBER({%s}),FIXED({%s},0),"")' % (roh, roh), fmt=d.st.text)
    d.fenster(k.f, k.titel)
    d.fenster_daten(k.f, roh)                                  # Datenstand: die Rohwerte, nicht die normierten Reihen
    zelle = ''
    if kw is None:
        kw = 'PV_%s_%d_kw' % (k.ws.name, k.nr)
        r = d._kopf(kw, '%s: angezeigte KW' % k.titel, 'modKW')
        d.ws.write_number(r, W0, FOLIE_KW, d.st.zahl)
        zelle = 'Dashboard_Daten!$%s$%d' % (xl_col_to_name(W0), r + 1)
    PV.setdefault('kacheln', []).append((roh, k.f, kw))
    PV.setdefault('achsen', []).append((k.nr, oben, unten, minimum, maximum))
    ch = chart_basis(k.wb, 'line', layout=layout)
    kat = d.kat(f=k.f)
    art = {'font': {'name': FONT_F, 'size': 6.5, 'bold': True, 'color': MAGENTA}, 'border': {'none': True}, 'fill': {'none': True}}
    s = {'name': 'Offene Vorgänge', 'categories': kat, 'values': d.ref(roh + '_pv', f=k.f)}
    s.update(linien_reihe(MAGENTA, False))
    s['data_labels'] = dict(art, value=True, position='above', custom=[dict(art, value=z) for z in d.zellen(roh + '_pvt', f=k.f)])
    ch.add_series(s)
    s = {'name': 'SLA', 'categories': kat, 'values': d.ref(sla_reihe, f=k.f)}
    s.update(linien_reihe(MAGENTA, False, strich=True))
    ch.add_series(s)
    x_achse(ch, kategorien_sichtbar, True, grundlinie=True)
    ch.set_y_axis({'visible': False, 'major_gridlines': {'visible': False}, 'min': round(minimum, 5), 'max': round(maximum, 5)})
    chart_setzen(k.ws, ch, *platz, name=k.p + 'Linie')
    verzeichnen(k, 'Linie', 'W', [('Offene Vorgänge', [('Offene Vorgänge', d.z['F_%s|%s' % (k.f, roh + '_pvt')] + 1)], '')], zelle=zelle)


def pv_bezug_zelle(d):
    return '$%s$%d' % (xl_col_to_name(W0), d.z['PV_M'] + 1)


def pv_bezug(d):
    """PV_M: groesster gezeigter Wert der Kacheln 4/5 (je Kachel die letzten n KW bis zu ihrer letzten KW mit Daten) oder SLA."""
    a_, e_ = xl_col_to_name(W0), xl_col_to_name(W0 + N_WOCHEN - 1)
    teile = ['1', 'N(SLA_PV)']
    for roh, f, kw in PV['kacheln']:
        zeile = '$%s$%d:$%s$%d' % (a_, d.z[roh] + 1, e_, d.z[roh] + 1)
        L, n = d.fen[f]['L'], '$%s$%d' % (a_, d.z[kw] + 1)
        teile.append('IFERROR(_xlfn.AGGREGATE(4,6,INDEX(%s,MAX(1,%s+1-%s)):INDEX(%s,%s)),0)' % (zeile, L, n, zeile, L))
    d.ws.write_formula(d.z['PV_M'], W0, '=MAX(%s)' % ','.join(teile), d.st.zahl)
    m = pv_bezug_zelle(d)
    for faktor, roh, f, abstand, platz in PV.get('faktoren', []):
        kw = next(kw for r_, f_, kw in PV['kacheln'] if r_ == roh and f_ == f)
        zeile = '$%s$%d:$%s$%d' % (a_, d.z[roh] + 1, e_, d.z[roh] + 1)
        L, n = d.fen[f]['L'], '$%s$%d' % (a_, d.z[kw] + 1)
        hoechst = 'IFERROR(_xlfn.AGGREGATE(4,6,INDEX(%s,MAX(1,%s+1-%s)):INDEX(%s,%s)),0)' % (zeile, L, n, zeile, L)
        d.ws.write_formula(d.z[faktor], W0, '=MIN(IF(N(SLA_PV)>0,1/%s+%.6f/N(SLA_PV),%.6f/%s),%.6f/MAX(1,%s))'
                           % (m, abstand, 1 + abstand, m, platz, hoechst), d.st.zahl)


DELTA_AB, DELTA_AUF, DELTA_NULL = '#1E7F4F', '#8A5A00', '#6B6B6B'      # Delta-Zeile: Abbau gruen, Aufbau gelbbraun, gleich grau


def _slot_reihe(werte, kat, name, **o):
    s = {'name': name, 'categories': kat, 'values': werte}
    s.update(o)
    return s


def _luecke(plot_b, overlap=-5, n=FOLIE_KW):
    """Abstand (gap in %) zwischen den KW, damit zwei Balken nebeneinander BALKEN_PT breit sind – bei jeder Kachelbreite gleich
    (wie in der Kachel Provisionsreklamation AO). overlap < 0: Abstand zwischen den beiden Balken einer KW."""
    return max(20, min(500, int(round((plot_b / n) / ((2 - overlap / 100.0) * BALKEN_PT) * 100 - 100))))


def _kasten(farbe, groesse=6):
    """Datenbeschriftung als Kasten in Reihenfarbe mit weisser Zahl (wie die Sev-Werte im bisherigen Dashboard). Font und Fuellung
    stehen auch an jeder einzelnen Beschriftung, sonst verlieren Beschriftungen mit eigenem Text in Excel den Kasten."""
    return {'font': {'name': FONT_F, 'size': groesse, 'bold': True, 'color': WEISS}, 'fill': {'color': farbe}, 'border': {'none': True}}


def _nur_letzte(zellen, art):
    """Eigene Beschriftungstexte; sichtbar nur an der letzten (aktuellen) KW, die anderen ausgeblendet (modKW blendet sie ein)."""
    return [dict(art, value=z) if i == len(zellen) - 1 else {'delete': True} for i, z in enumerate(zellen)]


def _kasten_reihe(k, li, lage, text, farbe, name):
    """Wertkasten auf einer unsichtbaren Punktreihe, in jeder KW; die Lage (normiert) rechnet Dashboard_Daten."""
    art = _kasten(farbe, ZAHL_GR)
    li.add_series(_slot_reihe(k.d.sref(lage), k.d.sref(lage[:2] + '_kat'), name, line={'none': True}, marker={'type': 'none'},
                              data_labels=dict(art, value=True, position='center', custom=[dict(art, value=z) for z in k.d.szellen(text)])))


def _delta_streifen(k, platz, layout, unten, reihen, kat, texte, name):
    """Delta-Zeile als eigener, durchsichtiger Diagrammstreifen direkt unter den KW-Zahlen (gleiche Zeichenflaeche waagerecht wie
    das Diagramm darueber, deshalb steht jede Zahl genau unter ihrer KW). So bleiben die KW-Zahlen aller Diagramme auf derselben
    Hoehe: jedes Diagramm endet mit der Achse ACHSE_UNTEN ueber seiner Unterkante, die KW-Zahlen stehen darunter.
    reihen: (Wertebereich, Farbe) je Vorzeichen (auf/ab/null; Wert 0,5 oder #NV), texte: Zellen der Beschriftungstexte."""
    x, y, b, h = platz
    ch = chart_basis(k.wb, 'line', layout={'x': layout['x'], 'y': 0.0, 'width': layout['width'], 'height': 1.0})
    for (werte, farbe), x_ in zip(reihen, ('auf', 'ab', 'null')):
        ch.add_series({'name': 'Delta ' + x_, 'categories': kat, 'values': werte, 'line': {'none': True}, 'marker': {'type': 'none'},
                       'data_labels': {'value': True, 'position': 'center', 'custom': [{'value': z} for z in texte],
                                       'font': {'name': FONT_F, 'size': 6, 'bold': True, 'color': farbe}}})
    ch.set_x_axis({'label_position': 'none', 'line': {'none': True}, 'major_tick_mark': 'none', 'minor_tick_mark': 'none',
                   'position_axis': 'between'})
    ch.set_y_axis({'visible': False, 'major_gridlines': {'visible': False}, 'min': 0, 'max': 1})
    chart_setzen(k.ws, ch, x, y + h - unten + DELTA_Y, b, DELTA_H, name=k.p + name)
    return name


def _achsen(ch, hoehe, oben, unten, layout):
    """Feste Geometrie: Zeichenflaeche endet mit der Achse unten Punkt ueber der Diagrammunterkante (wie bei allen anderen
    Diagrammen, layout_unten), die KW-Zahlen stehen darunter; Wertachse fest: 0 bis 1 ist die hoechste Saeule, darueber oben Punkt."""
    p = hoehe - oben - unten
    ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True},
                     'layout': {'x': layout['x'], 'y': 0.0, 'width': layout['width'], 'height': (hoehe - unten) / hoehe}})
    ch.set_x_axis({'num_font': {'name': FONT_F, 'size': 6.5, 'color': GRAU, 'rotation': 0}, 'line': {'color': '#BFBFBF', 'width': 0.75},
                   'major_tick_mark': 'none', 'minor_tick_mark': 'none', 'label_position': 'low', 'interval_unit': 1})
    ch.set_y_axis({'visible': False, 'major_gridlines': {'visible': False}, 'min': 0, 'max': 1 + oben / p})


LAYOUT_BUE = {'x': 0.035, 'y': 0.0, 'width': 0.945, 'height': 1.0}     # Zeichenflaeche = ganze Hoehe (keine Achsentexte ausserhalb)


OHNE_SPLIT, OHNE_SPLIT_FARBE = 'Gesamt (bisher, ohne Sparten)', '#D6A3BE'   # KW vor dem Spartensplit


def bestand_chart(k, platz, pre):
    """Offene Vorgaenge je Sparte gestapelt (Farben wie die Sev-Stufen), Summe in Tsd. ueber jeder Saeule, in jeder KW die Werte je
    Sparte klein als Kasten im Balken, SLA als gestrichelte Linie. Die Nettoveraenderung steht nur unter den Zu-/Abnahmen."""
    ch = chart_basis(k.wb, 'column', 'stacked', layout=LAYOUT_BUE)
    kat = k.d.sref(pre + '_kat')
    for i, (code, teil) in enumerate(SPARTEN):
        o = {'fill': {'color': SPARTE[teil]}, 'border': {'color': KACHEL_GRUND, 'width': 0.5}}
        if i == 0:
            o.update({'gap': 45, 'overlap': 100})
        ch.add_series(_slot_reihe(k.d.sref(pre + '_s' + code), kat, teil, **o))
    if pre + '_sO' in k.d.z:
        ch.add_series(_slot_reihe(k.d.sref(pre + '_sO'), kat, OHNE_SPLIT, fill={'color': OHNE_SPLIT_FARBE},
                                  border={'color': KACHEL_GRUND, 'width': 0.5}))
    li = chart_basis(k.wb, 'line')
    li.add_series(_slot_reihe(k.d.sref(pre + '_sla'), kat, 'SLA', line={'color': GRAUD, 'width': 1.0, 'dash_type': 'dash'}, marker={'type': 'none'}))
    li.add_series(_slot_reihe(k.d.sref(pre + '_sum'), kat, 'Summe', line={'none': True}, marker={'type': 'none'},
                              data_labels={'value': True, 'position': 'above', 'custom': [{'value': z} for z in k.d.szellen(pre + '_sum_t')],
                                           'font': {'name': FONT_F, 'size': 6.5, 'bold': True, 'color': SW}}))
    for code, teil in SPARTEN:
        _kasten_reihe(k, li, pre + '_l' + code, pre + '_t' + code, SPARTE[teil], 'Wert ' + teil)
    ch.combine(li)
    _achsen(ch, BEST_H, BEST_OBEN, BEST_UNTEN, LAYOUT_BUE)
    chart_setzen(k.ws, ch, *platz, name=k.p + 'Rueckstand')
    z = lambda key: k.d.z[key] + 1  # noqa: E731
    verzeichnen(k, 'Rueckstand', 'B', [
        ('Summe über der Säule', [('Summe', z(pre + '_sum_t'))], ''),
        ('Werte je Sparte im Balken', [('Wert ' + teil, z(pre + '_t' + code)) for code, teil in SPARTEN], '')],
        zelle='Dashboard_Daten!$%s$%d' % (xl_col_to_name(W0), z('KW_' + pre)))


def _zahlen_traeger(k, ch, kat, reihen, luecke, maximum):
    """Zahlen ueber den Zu-/Abnahmen: unsichtbare Traegerbalken auf der zweiten Achse (gleiche Lage wie die Balken), die Zahl steht
    ueber dem Traeger, also mittig ueber dem eigenen Balken. reihen: (werte, kategorien, titel, farbe, textzellen)."""
    tr = chart_basis(k.wb, 'column')
    for i, (werte, titel, farbe, texte) in enumerate(reihen):
        # ohne Rahmen und Fuellung ausdruecklich: ein leeres spPr zeichnet Excel am Desktop als Kasten mit Rahmen
        art = {'font': {'name': FONT_F, 'size': ZAHL_GR, 'bold': True, 'color': farbe}, 'border': {'none': True}, 'fill': {'none': True}}
        s = {'name': 'Wert ' + titel, 'categories': kat, 'values': werte, 'fill': {'none': True}, 'border': {'none': True}, 'y2_axis': True,
             'data_labels': dict(art, value=True, position='outside_end', custom=[dict(art, value=z) for z in texte])}
        if i == 0:
            s.update({'gap': luecke, 'overlap': -5})
        tr.add_series(s)
    tr.set_y2_axis({'visible': False, 'major_gridlines': {'visible': False}, 'min': 0, 'max': maximum})
    ch.combine(tr)


def vorgaenge_chart(k, platz, pre):
    """Zunahmen (rot) und Abnahmen (gruen) je KW direkt nebeneinander, so breit und hoch wie in den anderen Kacheln; die Zahl steht
    in jeder KW klein und mittig ueber dem eigenen Balken. Unter der KW der Saldo (Nettoveraenderung)."""
    ch = chart_basis(k.wb, 'column')
    kat = k.d.sref(pre + '_kat')
    luecke = _luecke(platz[2] * LAYOUT_BUE['width'])
    for i, (key, name, farbe) in enumerate((('e', 'Zunahmen', ZU), ('a', 'Abnahmen', AB))):
        s = _slot_reihe(k.d.sref(pre + '_s' + key), kat, name, fill={'color': farbe}, border={'none': True})
        if i == 0:
            s.update({'gap': luecke, 'overlap': -5})
        ch.add_series(s)
    _zahlen_traeger(k, ch, kat, [(k.d.sref(pre + '_c' + key), name, farbe, k.d.szellen(pre + '_t' + key))
                                 for key, name, farbe in (('e', 'Zunahmen', ZU), ('a', 'Abnahmen', AB))],
                    luecke, 1 + VORG_OBEN / (VORG_H - VORG_OBEN - VORG_UNTEN))
    _achsen(ch, VORG_H, VORG_OBEN, VORG_UNTEN, LAYOUT_BUE)
    chart_setzen(k.ws, ch, *platz, name=k.p + 'Vorgaenge')
    z = lambda key: k.d.z[key] + 1  # noqa: E731
    verzeichnen(k, 'Vorgaenge', 'B', [('Zunahmen/Abnahmen über dem Balken', [('Wert Zunahmen', z(pre + '_te')), ('Wert Abnahmen', z(pre + '_ta'))], '')])
    _delta_streifen(k, platz, LAYOUT_BUE, VORG_UNTEN, [(k.d.sref(pre + '_p' + x), f) for x, f in (('auf', DELTA_AUF), ('ab', DELTA_AB), ('null', DELTA_NULL))],
                    kat, k.d.szellen(pre + '_pt'), 'Saldo')
    verzeichnen(k, 'Saldo', 'B', [('Saldo unter der KW', [('Delta ' + x, z(pre + '_pt')) for x in ('auf', 'ab', 'null')], '')])


def bewegung_chart(k, platz, zu, ab, name='Bewegung'):
    """Zunahmen (rot) und Abnahmen (gruen) je KW nebeneinander, Zahl ueber dem Balken, unter der KW die Nettoveraenderung
    (Zunahmen minus Abnahmen, farbig wie in den BUE-Kacheln). Feste Geometrie wie dort: Werte normiert auf den hoechsten Balken der
    gezeigten KW (Zahl der KW steht in Dashboard_Daten, modKW setzt sie), Achse mit festen Grenzen. Die Reihen dafuer legt das
    Diagramm selbst an, weil die Lage der Delta-Zeile von seiner Hoehe abhaengt."""
    d = k.d
    h = platz[3]
    pre = 'BW_%s_%d_' % (k.ws.name, k.nr)
    kw = d._kopf(pre + 'kw', '%s: angezeigte KW' % k.titel, 'modKW')
    d.ws.write_number(kw, W0, FOLIE_KW, d.st.zahl)
    n = '$%s$%d' % (xl_col_to_name(W0), kw + 1)
    a_, e_ = xl_col_to_name(W0), xl_col_to_name(W0 + N_WOCHEN - 1)
    L = d.fenster(k.f, k.titel)
    d.fenster_daten(k.f, zu)                                    # Datenstand der Kachel: die Rohwerte, nicht die eigenen Reihen
    d.fenster_daten(k.f, ab)
    d.abgeleitet.update(pre + x for x in (zu + '_n', ab + '_n', zu + '_t', ab + '_t', zu + '_c', ab + '_c', 'dauf', 'dab', 'dnull', 'dt'))
    zeile = lambda key: '$%s$%d:$%s$%d' % (a_, d.z[key] + 1, e_, d.z[key] + 1)  # noqa: E731
    bereich = lambda key: 'INDEX(%s,MAX(1,%s+1-%s)):INDEX(%s,%s)' % (zeile(key), L, n, zeile(key), L)  # noqa: E731   gezeigte KW bis L
    m = 'MAX(1,_xlfn.AGGREGATE(4,6,%s),_xlfn.AGGREGATE(4,6,%s))' % (bereich(zu), bereich(ab))
    platz_kw = platz[2] * 0.96 / FOLIE_KW
    sp = 'REPT(UNICHAR(160),%d)' % (3 if platz_kw >= 17 else 2)      # Zahl leicht nach aussen: Zunahmen links, Abnahmen rechts
    for key, titel in ((zu, 'Zunahmen'), (ab, 'Abnahmen')):
        d.formel(pre + key + '_n', '%s: %s (Balken, normiert)' % (k.titel, titel), 'IF(ISNUMBER({%s}),{%s}/%s,NA())' % (key, key, m))
        text = ('FIXED({%s},0)&%s' if key == zu else '%s&FIXED({%s},0)') % ((key, sp) if key == zu else (sp, key))
        d.formel(pre + key + '_t', '%s: %s (Text)' % (k.titel, titel), 'IF(ISNUMBER({%s}),%s,"")' % (key, text), fmt=d.st.text)
    p = h - BEW_OBEN - BEW_UNTEN
    for key, ich, anderer, vergleich, titel in ((zu, zu, ab, '>=', 'Zunahmen'), (ab, ab, zu, '>', 'Abnahmen')):
        d.formel(pre + key + '_c', '%s: %s (Träger der Zahl über dem Balken)' % (k.titel, titel),
                 _traeger('{%s_n}' % (pre + ich), '{%s_n}' % (pre + anderer), vergleich, ZAHL_PT / p, '{%s}' % key))
    an = d._kopf(pre + 'an', '%s: Delta-Zeile an (1) / aus (0)' % k.titel, 'modKW')
    d.ws.write_number(an, W0, 1, d.st.zahl)
    schalter = '$%s$%d' % (a_, an + 1)
    dz = '({%s}-{%s})' % (zu, ab)
    hat = 'AND(%s=1,ISNUMBER({%s}),ISNUMBER({%s}))' % (schalter, zu, ab)
    for x, bed in (('auf', '>0'), ('ab', '<0'), ('null', '=0')):
        d.formel(pre + 'd' + x, '%s: Delta-Zeile (%s)' % (k.titel, x), 'IF(%s,IF(%s%s,0.5,NA()),NA())' % (hat, dz, bed))
    d.formel(pre + 'dt', '%s: Zunahmen minus Abnahmen (Text)' % k.titel,
             'IF(AND(ISNUMBER({%s}),ISNUMBER({%s})),IF(%s>0,"+"&FIXED(%s,0),IF(%s<0,"−"&FIXED(-%s,0),"±0")),"")' % (zu, ab, dz, dz, dz, dz),
             fmt=d.st.text)
    lay = {'x': 0.02, 'width': 0.96}                          # wie layout_unten (Liniendiagramm darueber)
    ch = chart_basis(k.wb, 'column')
    kat = d.kat(f=k.f)
    luecke = _luecke(platz[2] * lay['width'])
    for i, (key, titel, farbe) in enumerate(((zu, 'Zunahmen', ZU), (ab, 'Abnahmen', AB))):
        s = {'name': titel, 'categories': kat, 'values': d.ref(pre + key + '_n', f=k.f), 'fill': {'color': farbe}, 'border': {'none': True}}
        if i == 0:
            s.update({'gap': luecke, 'overlap': -5})
        ch.add_series(s)
    _zahlen_traeger(k, ch, kat, [(d.ref(pre + key + '_c', f=k.f), titel, farbe, d.zellen(pre + key + '_t', f=k.f))
                                 for key, titel, farbe in ((zu, 'Zunahmen', ZU), (ab, 'Abnahmen', AB))], luecke, 1 + BEW_OBEN / p)
    _achsen(ch, h, BEW_OBEN, BEW_UNTEN, lay)
    chart_setzen(k.ws, ch, *platz, name=k.p + name)
    fz = lambda key: d.z['F_%s|%s' % (k.f, key)] + 1  # noqa: E731     Zeile im Zeitfenster (modKW verknuepft die Texte neu)
    verzeichnen(k, name, 'W', [('Zunahmen', [('Wert Zunahmen', fz(pre + zu + '_t'))], ''), ('Abnahmen', [('Wert Abnahmen', fz(pre + ab + '_t'))], '')],
                zelle='Dashboard_Daten!%s' % n)
    _delta_streifen(k, platz, lay, BEW_UNTEN, [(d.ref(pre + 'd' + x, f=k.f), fb) for x, fb in (('auf', DELTA_AUF), ('ab', DELTA_AB), ('null', DELTA_NULL))],
                    kat, d.zellen(pre + 'dt', f=k.f), name + 'Delta')
    verzeichnen(k, name + 'Delta', 'W', [('Δ Zunahmen − Abnahmen unter der KW', [('Delta ' + x, fz(pre + 'dt')) for x in ('auf', 'ab', 'null')],
                                          'Dashboard_Daten!%s' % schalter)])


def kasten_tabelle(k, platz, reihen, name='Treffer'):
    """Watchlist wie im bisherigen Dashboard: je KW eine Säule zu 100 % gestapelt (von unten Treffer, In Bearbeitung, Erledigt),
    der Wert jeder Reihe als Kasten in Reihenfarbe mitten im eigenen Abschnitt. reihen von unten nach oben:
    (schluessel_wert, schluessel_text, titel, farbe)."""
    ch = chart_basis(k.wb, 'column', 'percent_stacked', layout=layout_unten(platz[3], 4.0))
    werte = []
    for i, (key, text, titel, farbe) in enumerate(reihen):
        art = _kasten(farbe, ZAHL_GR)
        s = {'name': titel, 'categories': k.d.kat(f=k.f), 'values': k.d.ref(key, f=k.f), 'fill': {'color': farbe}, 'border': {'none': True},
             'data_labels': dict(art, value=True, position='center', custom=[dict(art, value=z) for z in k.d.zellen(text, f=k.f)])}
        if i == 0:
            s.update({'gap': 45, 'overlap': 100})
        ch.add_series(s)
        werte.append((titel, [(titel, k.d.z['F_%s|%s' % (k.f, text)] + 1)], ''))
    x_achse(ch, True, True, grundlinie=True)
    y_achse(ch, 0, 1)
    chart_setzen(k.ws, ch, *platz, name=k.p + name)
    verzeichnen(k, name, 'W', werte)


def verpflichtung_chart(k, platz):
    """Neueinstellungen je Monat: Verpflichtungen als Saeulen (Anzahl unten in der Saeule), Erledigungsquote fristgerecht als
    Prozentwert ueber der Saeule. Die Quote haengt an einer unsichtbaren zweiten Saeule genau darueber (Ueberlappung 100 %) –
    nicht an einer Linie: im Kombidiagramm hat Excel die Beschriftungen von Saeule und Linie vertauscht."""
    ch = chart_basis(k.wb, 'column', layout=layout_unten(platz[3]))
    ch.add_series({'name': 'Verpflichtungen je Monat', 'categories': k.d.kat(True, 6), 'values': k.d.ref('18D', True, 6),
                   'fill': {'color': SEV[1]}, 'border': {'none': True}, 'gap': 70, 'overlap': 100,
                   'data_labels': {'value': True, 'position': 'inside_base', 'num_format': '#,##0;-#,##0;;',
                                   'font': {'name': FONT_F, 'size': 6, 'bold': True, 'color': WEISS}}})
    ch.add_series({'name': 'Erledigungsquote', 'categories': k.d.kat(True, 6), 'values': k.d.ref('18D', True, 6),
                   'fill': {'none': True}, 'border': {'none': True},
                   'data_labels': {'value': True, 'position': 'outside_end', 'custom': [{'value': z} for z in k.d.zellen('18E_t', True, 6)],
                                   'font': {'name': FONT_F, 'size': 6.5, 'bold': True, 'color': SW}}})
    x_achse(ch, True)
    y_achse(ch, 0)
    chart_setzen(k.ws, ch, *platz, name=k.p + 'Monate')
    verzeichnen(k, 'Monate', 'M', [('Verpflichtungen (Anzahl)', [('Verpflichtungen je Monat', 0)], ''),
                                    ('Erledigungsquote', [('Erledigungsquote', k.d.z['18E_t'] + 1)], '')])


def saeulen_chart(k, platz, reihen, monate=False, letzte=None, gestapelt=False, summe=None, beschriftung=False, fmt='#,##0', name='Saeulen',
                  layout=None, kategorien_sichtbar=True, sla=None, kasten=False):
    """reihen: (schluessel, titel, farbe); summe: (schluessel_werte, schluessel_text) fuer eine Summenbeschriftung ueber dem Stapel;
    sla: schluessel der Werte fuer eine gestrichelte SLA-Linie (Wert steht in der Legende der Kachel); beschriftung: True (alle Reihen)
    oder {schluessel: schluessel_text}. Reihen ohne Beschriftung bekommen sie trotzdem, nur ausgeblendet – „Diagramm anpassen“
    (modKW) blendet sie ein. kasten: Werte im Stapel als Kasten in Reihenfarbe mit weisser Zahl, auch die 0 (Sev-Stufen)."""
    ch = chart_basis(k.wb, 'column', 'stacked' if gestapelt else None, layout=layout or (layout_unten(platz[3]) if kategorien_sichtbar else LAYOUT_OBEN))
    n = letzte or (Daten.spalten(monate)[1] if monate else FOLIE_KW)
    f = None if monate else k.f                                      # Wochen: Zeitfenster der Kachel (bis zur letzten KW mit Daten)
    werte = []
    for i, (key, titel, farbe) in enumerate(reihen):
        s = {'name': titel, 'categories': k.d.kat(monate, letzte, f), 'values': k.d.ref(key, monate, letzte, f),
             'fill': {'color': farbe}, 'border': {'none': True}}
        if i == 0:
            s['gap'] = 45 if gestapelt else 70
            s['overlap'] = 100 if gestapelt else -5
        hell = farbe.upper() in ('#D9D9D9', '#E7E6E6', GRAUL.upper())
        if kasten:
            lab = dict(_kasten(farbe), value=True, position='center')
        else:
            lab = {'value': True, 'position': 'outside_end' if not gestapelt else 'center',
                   'font': {'name': FONT_F, 'size': 6, 'bold': True, 'color': ((SW if hell else WEISS) if gestapelt else farbe)}}
        zeile = 0
        if isinstance(beschriftung, dict) and key in beschriftung:
            lab['custom'] = [{'value': z} for z in k.d.zellen(beschriftung[key], monate, letzte, f)]
            zeile = k.d.z[('F_%s|%s' % (f, beschriftung[key])) if f else beschriftung[key]] + 1
        else:
            lab['num_format'] = fmt if kasten else fmt + ';-' + fmt + ';;'
            if not (beschriftung is True):
                lab['custom'] = [{'delete': True} for _ in range(n)]          # vorhanden, aber ausgeblendet
        s['data_labels'] = lab
        ch.add_series(s)
        werte.append((titel, [(titel, zeile)], ''))
    li = chart_basis(k.wb, 'line') if (summe or sla) else None
    if sla:
        li.add_series({'name': 'SLA', 'categories': k.d.kat(monate, letzte, f), 'values': k.d.ref(sla, monate, letzte, f),
                       'line': {'color': GRAUD, 'width': 1.0, 'dash_type': 'dash'}, 'marker': {'type': 'none'}})
    if summe:
        li.add_series({'name': 'Summe', 'categories': k.d.kat(monate, letzte, f), 'values': k.d.ref(summe[0], monate, letzte, f),
                       'line': {'none': True}, 'marker': {'type': 'none'},
                       'data_labels': {'value': True, 'position': 'above', 'custom': [{'value': z} for z in k.d.zellen(summe[1], monate, letzte, f)],
                                       'font': {'name': FONT_F, 'size': 6.5, 'bold': True, 'color': SW}}})
        werte.append(('Summe über dem Stapel', [('Summe', k.d.z[('F_%s|%s' % (f, summe[1])) if f else summe[1]] + 1)], ''))
    if li:
        ch.combine(li)
    x_achse(ch, kategorien_sichtbar, not monate or monate == 'fest', grundlinie=True)   # Saeulen stehen immer auf einer Linie
    y_achse(ch, 0)
    chart_setzen(k.ws, ch, *platz, name=k.p + name)
    verzeichnen(k, name, 'F' if monate == 'fest' else 'M' if monate else 'W', werte)


# ------------------------------------------------------------------ PPT-Blaetter
def folie_rahmen(ws, wb, st, blatt, kicker_zelle, titel_zelle, farbe):
    _, titel, kicker, _ = next(f for f in FOLIEN if f[0] == blatt)
    kicker_text = (kicker + '  ·  ' if kicker else '') + 'STAND ' + STAND
    ws.hide_gridlines(2)
    ws.set_column(0, 60, 9.14)          # 69 px (xlsxwriter: int(9,14 x 7 + 0,5) + 5)
    ws.set_default_row(15)
    form(ws, 0, 0, FOLIE_B, FOLIE_H, '', 'DEKO_Folie', fill=WEISS, linie=(GRAUL, 0.75))
    form(ws, 688, 0, 272, FOLIE_H, '', 'DEKO_Panel', fill=PANEL)           # Text bleibt innerhalb der Folie (modKommentar verkleinert die Schrift)
    form(ws, 608, 0, 162, 31, 'Vertraulich', 'DEKO_Vertraulich', fill=ROT, schrift={'size': 10, 'bold': True, 'color': WEISS},
         ausrichtung={'vertical': 'middle', 'horizontal': 'center'})
    lx, ly = bild_skala(os.path.join(BILDER, 'ergo_logo.png'), 96, 53)
    ws.insert_image(0, 0, os.path.join(BILDER, 'ergo_logo.png'),
                    {'x_offset': OX + P(823), 'y_offset': OY + P(38), 'x_scale': lx, 'y_scale': ly,
                     'object_position': 3, 'description': 'N=DEKO_Logo'})
    form(ws, 40, 16, 560, 14, '', 'DEKO_Kicker', schrift={'size': 9, 'color': SW}, textlink='=Konfiguration!%s' % kicker_zelle, cache=kicker_text)
    form(ws, 40, 37, 640, 40, '', 'DEKO_Titel', schrift={'size': 20, 'bold': True, 'color': ROT}, textlink='=Konfiguration!%s' % titel_zelle, cache=titel)
    vormonat = (BERICHTSTAG_AUTO.replace(day=1) - dt.timedelta(days=1))
    monate = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    fuss = ('Wochenwerte: je Kachel die letzten KW mit Daten, höchstens bis KW %d (Berichtstag %s)  ·  Monatswerte bis %s %d'
            '  ·  MAK bis %s %d und Plan Jan %02d/%02d') % (
        BERICHTSTAG.isocalendar()[1], STAND, monate[vormonat.month - 1], vormonat.year, monate[BERICHTSTAG_AUTO.month - 1], BERICHTSTAG_AUTO.year,
        (BERICHTSTAG_AUTO.year + 1) % 100, (BERICHTSTAG_AUTO.year + 2) % 100)
    form(ws, 40, 491, 573, 10, '', 'DEKO_Fussnote', schrift={'size': 7, 'color': GRAU}, textlink='=Konfiguration!$C$25', cache=fuss)
    # Knopfleiste ueber der Folie
    knopf(ws, OX, 16, 200, 36, 'Kommentare bearbeiten', 'modKommentar.Zeigen', 'Kommentare', art=1)
    knopf(ws, OX + 212, 16, 200, 36, 'PowerPoint erzeugen', 'modPPT.Zeigen', 'PPT', art=4)
    knopf(ws, OX + 424, 16, 150, 36, 'Zur Startseite', 'modStart.ZurStartseite', 'Start', art=2)
    knopf(ws, OX + 586, 16, 190, 36, 'Diagramm anpassen', 'modKW.Zeigen', 'Diagramm', art=2)
    knopf(ws, OX + 788, 16, 230, 36, 'Kacheln ein-/ausblenden', 'modKacheln.Zeigen', 'Kacheln', art=2)
    ws.write(1, 17, 'Ansicht wie auf der Folie (ERGO-Vorlage, Layout 3/4). Kommentare über den Knopf links pflegen – das Feld rechts ordnet sich selbst.',
             st.hinweis)


def bild_skala(datei, breite_pt, hoehe_pt):
    """x_scale/y_scale fuer insert_image, damit das Bild genau breite_pt x hoehe_pt gross wird: xlsxwriter rechnet mit der
    Aufloesung, die es selbst in der Datei findet (PNG 150 dpi -> kleiner; das JPEG liest es mit 96 dpi)."""
    import xlsxwriter.image
    im = xlsxwriter.image.Image(datei)
    return P(breite_pt) / (im.width * 96.0 / im.x_dpi), P(hoehe_pt) / (im.height * 96.0 / im.y_dpi)


TITEL_SCHNITT = (2768, 12943)          # Titelbild: oben/unten abgeschnitten (Tausendstel Prozent), wie im bisherigen Dashboard


def ppt_titel(ws, wb, st):
    """Deckblatt wie im bisherigen Dashboard (2025_Dashboard_HS, PPT_1): Bild ueber die ganze Folie, halbtransparente weisse
    Flaechen mit Titel, Untertitel und Stand in Magenta (Calibri), ERGO-Logo oben rechts, gedrehter Kreis „Vertraulich“."""
    ws.hide_gridlines(2)
    ws.set_column(0, 60, 9.14)
    form(ws, 0, 0, FOLIE_B, FOLIE_H, '', 'DEKO_Folie', fill=WEISS, linie=(GRAUL, 0.75))
    datei = os.path.join(BILDER, 'titelbild.jpeg')
    sx, sy = bild_skala(datei, FOLIE_B, FOLIE_H)
    ws.insert_image(0, 0, datei, {'x_offset': OX, 'y_offset': OY, 'x_scale': sx, 'y_scale': sy, 'object_position': 3,
                                  'description': 'N=TITEL_Bild'})
    calibri = {'name': 'Calibri', 'color': MAGENTA}
    oben = {'vertical': 'top', 'horizontal': 'left'}
    form(ws, 348.5, 116.5, 557.5, 173, '', 'TITEL_Flaeche', fill=WEISS, transparenz=56)
    form(ws, 348.5, 116.5, 557.5, 40, '', 'DEKO_Titel', schrift=dict(calibri, size=32, bold=True), ausrichtung=oben, umbruch=False,
         textlink='=Konfiguration!$C$15', cache=TITEL)
    form(ws, 348.5, 194.5, 557.5, 40, '', 'DEKO_Untertitel', schrift=dict(calibri, size=32, bold=True), ausrichtung=oben, umbruch=False,
         textlink='=Konfiguration!$C$16', cache=UNTERTITEL)
    form(ws, 349, 295.5, 422, 44, '', 'TITEL_Flaeche2', fill=WEISS, transparenz=56)
    form(ws, 349, 295.5, 422, 22, '', 'DEKO_Stand', schrift=dict(calibri, size=16), ausrichtung=oben, umbruch=False,
         textlink='=Konfiguration!$C$17', cache='Stand  ' + STAND)
    logo = os.path.join(BILDER, 'ergo_logo.png')
    lx, ly = bild_skala(logo, 122.25, 67.5)
    ws.insert_image(0, 0, logo, {'x_offset': OX + P(795.75), 'y_offset': OY + P(38.25), 'x_scale': lx, 'y_scale': ly,
                                 'object_position': 3, 'description': 'N=DEKO_Logo'})
    form(ws, 760.5, 289.25, 172.25, 160.75, 'Vertraulich', 'DEKO_Vertraulich', fill=MAGENTA, geom='ellipse', drehung=345,
         schrift={'name': 'Calibri', 'size': 22, 'bold': True, 'color': WEISS}, ausrichtung={'vertical': 'middle', 'horizontal': 'center'})
    knopf(ws, OX, 16, 200, 36, 'PowerPoint erzeugen', 'modPPT.Zeigen', 'PPT', art=4)
    knopf(ws, OX + 212, 16, 150, 36, 'Zur Startseite', 'modStart.ZurStartseite', 'Start', art=2)
    ws.write(1, 6, 'Titelfolie. Titel, Untertitel und Stand kommen aus der Konfiguration (C15:C17).', st.hinweis)


def ppt_serviceparameter(ws, wb, d):
    b3 = (INHALT_B - 2 * LUECKE) / 3.0
    b4 = (INHALT_B - 3 * LUECKE) / 4.0
    y1, y2 = KACHEL_Y, KACHEL_Y + KACHEL_H + LUECKE
    for nr, q, pre in ((1, 'Verbund', '7V'), (2, 'OPAG', '7O')):
        k = Kachel(ws, wb, d, nr, INHALT_X + (nr - 1) * (b3 + LUECKE), y1, b3, KACHEL_H, 'Bestandsübertragung ' + q, MAGENTA,
                   stand=[pre + c for c in 'ABCDEFGHIJKL'], fenster=pre)
        # oben offene Vorgaenge je Sparte (gestapelt, Summe ueber jeder Saeule, Spartenwerte der aktuellen KW im Balken, SLA),
        # unten Zu-/Abnahmen je KW (nebeneinander, Saldo unter der KW) – letzte FOLIE_KW Wochen
        x0, y0 = k.x, k.y
        form(ws, x0 + 6, y0 + 22, k.b - 12, 9, 'Offene Vorgänge (Tsd.)', k.p + 'UT1', schrift={'size': 7, 'bold': True, 'color': SW}, umbruch=False)
        # SLA rechts in der Zeile der Ueberschrift (Text aus Konfiguration G9/G11)
        vorbelegt = 'SLA 5,5' if q == 'Verbund' else 'SLA 12,3 (Faktor 2,24) TBC'
        tb = textbreite(vorbelegt, 6.5) + 8
        xs = x0 + k.b - 6 - tb
        for j in range(3):
            form(ws, xs - 13 + j * 3.75, y0 + 25.25, 2.75, 1.5, '', k.p + 'SLA_S%d' % j, fill=GRAUD)
        form(ws, xs, y0 + 22, tb, 8, '', k.p + 'SLA_T', schrift={'size': 6.5, 'color': GRAUD}, umbruch=False,
             textlink='=Konfiguration!$G$9' if q == 'Verbund' else '=Konfiguration!$G$11', cache=vorbelegt)
        k.legende([('box', SPARTE[teil], teil) for _, teil in SPARTEN] + ([('box', OHNE_SPLIT_FARBE, 'Gesamt bisher')] if q == 'Verbund' else []),
                  y=y0 + 31)
        bestand_chart(k, (x0 + 2, y0 + 40, k.b - 4, BEST_H), pre)
        yv = y0 + 40 + BEST_H + 1
        form(ws, x0 + 6, yv, k.b - 12, 9, 'Vorgänge je KW (Tsd.)', k.p + 'UT2', schrift={'size': 7, 'bold': True, 'color': SW}, umbruch=False)
        xh = x0 + 6 + textbreite('Vorgänge je KW (Tsd.)', 7, True) * 1.05 + 3
        form(ws, xh, yv + 0.5, textbreite('· Δ Saldo', 6.5) + 6, 8, '· Δ Saldo', k.p + 'UT2b', schrift={'size': 6.5, 'color': GRAU}, umbruch=False)
        k.legende([('box', ZU, 'Zunahmen in aktueller KW'), ('box', AB, 'Abnahmen in aktueller KW')], y=yv + 9)
        vorgaenge_chart(k, (x0 + 2, yv + 18, k.b - 4, VORG_H), pre)
    k = Kachel(ws, wb, d, 3, INHALT_X + 2 * (b3 + LUECKE), y1, b3, KACHEL_H, 'Neueinstellungen', MAGENTA, stand=['18c'])
    k.legende([('linie', MAGENTA, 'Eingang in HS'), ('box', SEV[1], 'Verpflichtungen je Monat'), ('text', None, 'Prozent über der Säule = Erledigungsquote fristgerecht')])
    oben, unten = k.flaeche(0.45)
    linien_chart(k, oben, [('18c', 'Eingang in HS', linien_reihe(MAGENTA))], kategorien_sichtbar=True, layout=LAYOUT_ALLEIN)
    verpflichtung_chart(k, unten)
    stand_unten = {4: ['8a', '8b', '8c'], 5: ['8e'], 6: ['19'], 7: ['20']}
    reihen_unten = [
        (4, 'Provisionsreklamation AO', [('linie', MAGENTA, 'Offene Vorgänge'), ('strich', MAGENTA, 'SLA HS (500)'), ('box', ZU, 'Zunahmen in aktueller KW'),
                                         ('box', AB, 'Abnahmen in aktueller KW')]),
        (5, 'Provisionsreklamation Makler', [('linie', MAGENTA, 'Offene Vorgänge HS'), ('strich', MAGENTA, 'SLA HS (500 Vorgänge)')]),
        (6, 'Buchauszug', [('linie', MAGENTA, 'Offene Vorgänge')]),
        (7, 'Ausgleichsanspruch', [('linie', MAGENTA, 'Offene Vorgänge')]),
    ]
    for i, (nr, titel, leg) in enumerate(reihen_unten):
        k = Kachel(ws, wb, d, nr, INHALT_X + i * (b4 + LUECKE), y2, b4, KACHEL_H, titel, MAGENTA, stand=stand_unten[nr])
        k.legende(leg)
        if nr == 4:
            # Linie und SLA auf derselben Werteachse wie Kachel 5 (pv_linie); Zahl der KW: die der Zu-/Abnahmen darunter
            oben, unten = k.flaeche(0.55)
            pv_linie(k, oben, '8a', LAYOUT_OBEN, False, kw='BW_%s_%d_kw' % (ws.name, nr))
            bewegung_chart(k, unten, '8b', '8c')
        elif nr == 5:
            platz = k.flaeche()[0]
            pv_linie(k, platz, '8e', layout_unten(platz[3]), True)
            pv_bezug(d)
        else:
            linien_chart(k, k.flaeche()[0], [('19' if nr == 6 else '20', 'Offene Vorgänge', linien_reihe(MAGENTA))])


def ppt_externe(ws, wb, d):
    b3 = (INHALT_B - 2 * LUECKE) / 3.0
    pos = lambda i: (INHALT_X + (i % 3) * (b3 + LUECKE), KACHEL_Y + (i // 3) * (KACHEL_H + LUECKE))  # noqa: E731
    x, y = pos(0)
    k = Kachel(ws, wb, d, 1, x, y, b3, KACHEL_H, 'Schwebefallbearbeitung', GRUENT, stand=['6a'])
    k.legende([('linie', MAGENTA, 'Offene Vorgänge (in Tausend)')])
    linien_chart(k, k.flaeche()[0], [('6a_t', 'Offene Vorgänge', linien_reihe(MAGENTA, fmt='#,##0.0'))])
    x, y = pos(1)
    k = Kachel(ws, wb, d, 2, x, y, b3, KACHEL_H, 'Watchlist', GRUENT, stand=['13a', '13b', '13c', '13d'])
    k.legende([('linie', MAGENTA, 'Überwachte VNRs (in Tausend)'), ('box', MAGENTA, 'Treffer VNRs'), ('box', SEV[1], 'In Bearbeitung'),
               ('box', SW, 'Erledigt')])
    oben, unten = k.flaeche(0.55)
    linien_chart(k, oben, [('13a_t', 'Überwachte VNRs', linien_reihe(MAGENTA, fmt='#,##0'))], kategorien_sichtbar=False)
    kasten_tabelle(k, unten, [('13b', '13b_t', 'Treffer VNRs', MAGENTA), ('13c', '13c_t', 'In Bearbeitung', SEV[1]),
                              ('13d', '13d_t', 'Erledigt', SW)])
    x, y = pos(2)
    k = Kachel(ws, wb, d, 3, x, y, b3, KACHEL_H, 'Technische Arbeitsanweisungen', GRUENT, stand=['10b'])
    k.legende([('linie', MAGENTA, 'Offene techn. Arbeitsanweisungen')])
    linien_chart(k, k.flaeche()[0], [('10b', 'Offene Arbeitsanweisungen', linien_reihe(MAGENTA))])
    for i, (nr, titel, codes, summe) in enumerate(((4, 'Defect Fixing (CPE)', ('11b', '11c', '11d', '11e', '11f'), '11a'),
                                                   (5, 'Defects im operativen Betrieb', ('11h', '11i', '11j', '11k', '11l'), '11g'))):
        x, y = pos(3 + i)
        k = Kachel(ws, wb, d, nr, x, y, b3, KACHEL_H, titel, GRUENT, stand=list(codes))
        k.legende([('box', SEV[0], 'Sev 1+2'), ('box', SEV[1], 'Sev 3'), ('box', SEV[2], 'Sev 4'), ('box', ZU, 'Zunahmen in aktueller KW'),
                   ('box', AB, 'Abnahmen in aktueller KW')])
        oben, unten = k.flaeche(0.58)
        saeulen_chart(k, oben, [(codes[2], 'Sev 4', SEV[2]), (codes[1], 'Sev 3', SEV[1]), (codes[0], 'Sev 1+2', SEV[0])], gestapelt=True,
                      summe=(summe + '_pos', summe + '_t'), beschriftung=True, name='Offen', kategorien_sichtbar=False, kasten=True)
        bewegung_chart(k, unten, codes[3], codes[4])
    x, y = pos(5)
    k = Kachel(ws, wb, d, 6, x, y, b3, KACHEL_H, 'Mitarbeiter-Kapazitäten', PETROL, '· gerundet')
    k.legende([('box', MAGENTA, 'SOLL MAK'), ('box', SW, '(V)IST MAK')])
    # vier feste Monate: Vormonat und laufender Monat des Berichtstags | Januar Folgejahr und uebernaechstes Jahr (Plan)
    platz = k.flaeche()[0]
    saeulen_chart(k, platz, [('21b_r', 'SOLL MAK', MAGENTA), ('21c_r', '(V)IST MAK', SW)], monate='fest', beschriftung=True, name='MAK')
    # duenne Trennlinie zwischen den aktuellen Monaten und den Planmonaten: genau in der Mitte der Zeichenflaeche (4 Kategorien,
    # Zeichenflaeche x 2 % .. 98 %), von der Hoehe der Saeulenwerte bis in die Monatszeile unter der Achse. modKacheln haelt
    # Formen mit „_Trenn“ beim Umordnen anteilig an derselben Stelle.
    px, py, pb, ph = platz
    lay = layout_unten(ph)
    form(ws, px + pb / 2.0 - 0.25, py + lay['y'] * ph, 0.5, ph - ACHSE_UNTEN - lay['y'] * ph + 10, '', k.p + 'Trenn', fill=GRAUM)


# ------------------------------------------------------------------ Kommentare (Vorschau im Panel; das Makro zeichnet exakt nach)
KACHELN = {
    'PPT_2': ['Bestandsübertragung Verbund', 'Bestandsübertragung OPAG', 'Neueinstellungen', 'Provisionsreklamation AO',
              'Provisionsreklamation Makler', 'Buchauszug', 'Ausgleichsanspruch'],
    'PPT_3': ['Schwebefallbearbeitung', 'Watchlist', 'Technische Arbeitsanweisungen', 'Defect Fixing (CPE)', 'Defects im operativen Betrieb',
              'Mitarbeiter-Kapazitäten'],
}
FARBE_BLATT = {'PPT_2': MAGENTA, 'PPT_3': GRUENT}
ZUORDNUNG = {   # alte Ueberschrift -> (Kachel, Anzeige-Nr)
    'PPT_2': {'Bestandsübertragung Makler': (1, '1/2'), 'Neueinstellungen': (3, '3'), 'Provisionsreklamation AO und Makler': (4, '4/5'),
              'Buchauszug': (6, '6'), 'Ausgleichsanspruch': (7, '7')},
    'PPT_3': {'Schwebefallbearbeitung': (1, '1'), 'Watchlist': (2, '2'), 'Techn. Arbeitsanweisung': (3, '3'), 'Defect Fixing (CPE)': (4, '4'),
              'Defects im operativen Betrieb': (5, '5')},
}


# Kommentare PPT_2 Stand KW 41 (Vorlage des Fachbereichs, 09.10.2026); gehen den Kommentaren der Quelldatei vor. Kachel 2 neu:
# Erklaerung der OPAG-Zaehlweise. Kachel 5 steht unter „4/5“.
KOMMENTARE_STAND = {
    ('PPT_2', 1): ('1', 'Bestandsübertragung Makler', '\n'.join([
        'Mit +0,1 T im Vergleich zur Vorwoche sind die offenen Makler BÜ Vorgänge leicht gestiegen. Die Gründe für die weiterhin hohe '
        'Anzahl von offnen Vorgängen sind im Wesentlichen folgende:',
        '- reduzierte Bearbeitungskapazitäten (insg. 4 MAK) durch parallele Projektarbeit (Makler meets KI, Buchauszug) und 3 AU-Fälle',
        '- erhöhter Eingang von Erinnerungsmails, die offenen Vorgänge in Summe erhöhen',
        '- technischer Fehler bei der Erfassung von KV Makler BÜ, führt zur Nachbuchung von 900 offen Positionen',
        '- weitere technische Effekte führen ebenfalls zu einer doppelten Zählung im Emaileingang',
        'Im Ergebnis führte dieser technische Fehler dazu, dass das ausgewiesene Bruttoarbeitsgut ~ 2000 Vorgänge höher liegt als der '
        'eigentliche Netto-Rückstand.',
        'Um die Rückstände weiter abzuarbeiten ist Samstagsarbeit und die parallele Realisierung der KI-gestützten Datenerfassung '
        '(Makler meets KI) geplant.'])),
    ('PPT_2', 2): ('2', 'Bestandsübertragung OPAG', '\n'.join([
        'Kachel 2 zeigt denselben Bestand wie Kachel 1, gezählt in der für Operations typischen Zählweise nach Arbeitsgütern statt '
        'nach Vorgängen. Die Werte liegen deshalb höher, beschreiben aber dieselbe Arbeitslage.',
        'Beide Sichten werden bis auf Weiteres parallel ausgewiesen; perspektivisch wird das BÜ-Reporting auf diese Zählweise umgestellt.',
        'Das SLA von 5.500 Vorgängen wird dafür über einen Umrechnungsfaktor angepasst: im Schnitt zuletzt 2,16, aktuell also rund '
        '11.900 Arbeitsgüter.'])),
    ('PPT_2', 3): ('3', 'Neueinstellungen', '\n'.join([
        'Dargestellt werden reine Neueinstellungen aber auch Wechsel Vorgänge, wie z. B. Azubiübernahmen oder VP wird Untervertreter.',
        'Die fristgerechte Umsetzung erfolgt, sofern alle notwendigen Unterlagen rechtzeitig und vollständig vorlagen. Für die '
        'abschließende Bearbeitung fehlt dann lediglich der vom VP unterzeichnete Vertrag.',
        'Für den Verpflichtungsmonat September 2026 gab es 161 Vorgänge, 94 % wurden fristgerecht umgesetzt. Die übrigen 6 % wurden '
        'seitens RD zurückgezogen oder konnten auf Grund fehlender Unterlagen nicht fristgerecht umgesetzt werden.'])),
    ('PPT_2', 4): ('4/5', 'Provisionsreklamation AO und Makler', 'Der angestrebte Service-Level wird nach wie vor deutlich erfüllt.'),
    ('PPT_2', 6): ('6', 'Buchauszug', '\n'.join([
        'Derzeit arbeitet das Team intensiv an der Finalisierung des Buchauszugs nach OLG Standard. Da für den Buchauszug keine '
        'Testumgebung zur Verfügung steht, erfolgen Weiterentwicklung und die Produktion der operativen Buchauszüge auf dem gleichen '
        'Produktionssystem.',
        'Aufgrund verspäteter Change-Anmeldungen zur Produktivsetzung der Spartenanbindungen und Fehlern in der Datenlieferung kommt '
        'es zu einer weiteren Verschiebung des Umsetzungstermines (von Ende 08/2026 auf 10/2026 statt Ende Mitte 07/2026) und zu '
        'Verzögerungen in der Bearbeitung der BAZ.'])),
    ('PPT_2', 7): ('7', 'Ausgleichsanspruch', 'Eine Task-Force kümmert sich um die weitere Abarbeitung der entstandenen Rückstände. Auch '
                   'hier steht keine Testumgebung zur Verfügung, Weiterentwicklung und die Produktion der operativen Erstellung der AA '
                   'erfolgt auf dem gleichen Produktionssystem.'),
}


def kommentare_aus_quelle(q):
    """-> {(blatt, kachel): (nr, ueberschrift, text)}; Unterpunkte mit "- " davor. KOMMENTARE_STAND geht vor."""
    out = {}
    for blatt, absaetze in q['Kommentare'].items():
        aktuell = None
        for fett, ebene, text in absaetze:
            if fett:
                ziel = ZUORDNUNG[blatt].get(text)
                aktuell = None
                if ziel:
                    aktuell = [ziel[0], ziel[1], text, []]
                    out[(blatt, ziel[0])] = aktuell
                continue
            if aktuell is not None:
                aktuell[3].append(('- ' if ebene >= 1 else '') + text)
    kom = {k: (v[1], v[2], '\n'.join(v[3])) for k, v in out.items()}
    kom.update(KOMMENTARE_STAND)
    kom.update(q.get('KommentareBlatt', {}))          # Blatt Kommentare der neuesten Arbeitsfassung (WIP12) geht vor
    return kom


def textzeilen(text, zeichen):
    n = 0
    for zeile in text.split('\n'):
        n += max(1, -(-len(zeile) // zeichen))
    return n


_SCHRIFT = {}


def textbreite(text, groesse, fett=False):
    from PIL import ImageFont
    key = (groesse, fett)
    if key not in _SCHRIFT:
        datei = '/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf' % ('Bold' if fett else 'Regular')
        _SCHRIFT[key] = ImageFont.truetype(datei, int(groesse * 10))
    return _SCHRIFT[key].getlength(text) / 10.0


def zeilen_umbrechen(text, breite_pt, groesse, fett=False):
    """Anzahl Zeilen, die Arial (metrisch gleich: Liberation Sans) fuer text auf breite_pt braucht."""
    from PIL import ImageFont
    key = (groesse, fett)
    if key not in _SCHRIFT:
        datei = '/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf' % ('Bold' if fett else 'Regular')
        _SCHRIFT[key] = ImageFont.truetype(datei, int(groesse * 10))
    f = _SCHRIFT[key]
    n, zeile = 1, ''
    for wort in text.split():
        probe = (zeile + ' ' + wort).strip()
        if f.getlength(probe) / 10.0 <= breite_pt * 0.95 or not zeile:     # Excel bricht etwas frueher um
            zeile = probe
        else:
            n += 1
            zeile = wort
    return n


PANEL_NR_B = 22                       # Nummern im Kommentarfeld: immer dieselbe Pille, ob „3“ oder „4/5“
PANEL_TEXT_X = 26                     # Ueberschriften und Text beginnen fuer alle Eintraege auf derselben Linie
PANEL_ABSTAND = 5
PANEL_SCHRIFT = 7


def kommentar_absaetze(text):
    out = []
    for z in text.split('\n'):
        z = z.strip()
        if not z:
            continue
        if z[0] in '-–':                    # Unterpunkt
            out.append((2, z[1:].strip()))
        elif z[0] in '•*':                  # Punkt mit Zeichen
            out.append((1, z[1:].strip()))
        else:
            out.append((1, z))
    return out


PANEL_UNTEN = 505                    # Unterkante fuer den Kommentartext (Folie 540, Fusszeile ab 530; Luft fuer PowerPoint)


def panel_hoehen(eintraege, groesse):
    tb = PANEL_B - PANEL_TEXT_X
    y, out = PANEL_Y + 22, []
    for nr, ueb, text in eintraege:
        absaetze = kommentar_absaetze(text)
        h = 0
        if absaetze:
            zeilen = sum(zeilen_umbrechen(t, tb - (8 if e == 1 else 18), groesse) for e, t in absaetze)
            h = zeilen * groesse * 1.2 + len(absaetze) * 1 + 2        # fester Zeilenabstand 1,2 x Schriftgroesse (wie modKommentar)
        out.append((y, h, absaetze))
        y += 13 + (h + (PANEL_ABSTAND if groesse >= 6 else 3) if absaetze else 4)
    return out, y


def panel_vorschau(ws, blatt, eintraege):
    """Kommentarfeld wie es das Makro zeichnet (gleiche Masse, echte Aufzaehlungen mit haengendem Einzug); passt es nicht,
    wird die Schrift in Schritten von 0,25 pt kleiner, bis 4,5 pt (wie modKommentar.PanelZeichnen)."""
    farbe = FARBE_BLATT[blatt]
    groesse = PANEL_SCHRIFT
    while True:
        lage, unten = panel_hoehen(eintraege, groesse)
        if unten <= PANEL_UNTEN or groesse <= 4.5:
            break
        groesse -= 0.25
    form(ws, PANEL_X + 40, PANEL_Y - 4, 160, 16, 'Kommentare', 'KOM_Titel', schrift={'size': 11, 'bold': True, 'color': SW},
         ausrichtung={'vertical': 'middle', 'horizontal': 'center'})
    form(ws, PANEL_X + 10, PANEL_Y + 14, PANEL_B - 20, 0.75, '', 'KOM_Linie', fill=ROT)
    tb = PANEL_B - PANEL_TEXT_X
    for i, ((nr, ueb, text), (y, h, absaetze)) in enumerate(zip(eintraege, lage)):
        form(ws, PANEL_X, y, PANEL_NR_B, 13, nr, 'KOM_%d_Nr' % i, fill=farbe, geom='pill',
             schrift={'size': 7, 'bold': True, 'color': WEISS}, ausrichtung={'vertical': 'middle', 'horizontal': 'center'})
        form(ws, PANEL_X + PANEL_TEXT_X, y, tb, 13, ueb, 'KOM_%d_Ueb' % i, schrift={'size': groesse + 1.5, 'bold': True, 'color': SW})
        if absaetze:
            spec = ('%.1f' % groesse) + '\x1e' + '\x1f'.join('%d|%s' % (e, t) for e, t in absaetze)
            form(ws, PANEL_X + PANEL_TEXT_X, y + 13, tb, h, '\n'.join(t for _, t in absaetze), 'KOM_%d_Text' % i,
                 schrift={'size': groesse, 'color': GRAUD}, ausrichtung={'vertical': 'top', 'horizontal': 'left'}, absaetze=spec)


# ------------------------------------------------------------------ Rohdaten
def zwischenwert(v):
    """Zwischengespeicherter Formelwert fuer xlsxwriter: Datum als Seriennummer, sonst unveraendert."""
    if isinstance(v, dt.datetime):
        return (v - dt.datetime(1899, 12, 30)).total_seconds() / 86400.0
    if isinstance(v, dt.date):
        return (v - dt.date(1899, 12, 30)).days
    return v


def xl_spalte_nr(buchstaben):
    n = 0
    for ch in buchstaben:
        n = n * 26 + ord(ch) - 64
    return n


def norm_formel(f, spalte):
    """Summen und Verknuepfungen innerhalb der eigenen Spalte auf ein Muster bringen (leer statt 0). Formeln, die bewusst auf
    andere Spalten zeigen (z. B. Abgänge = Bestand Vorwoche + Zugänge - Bestand), bleiben unverändert."""
    rumpf = f[1:]
    # Tippfehler wie SUM(JO96:JOM97): Spalte hinter dem Datenende, die mit der eigenen Spalte beginnt -> eigene Spalte
    rumpf = re.sub(r'\b%s([A-Z]+)(\d+)' % spalte,
                   lambda m: (spalte + m.group(2)) if xl_spalte_nr(spalte + m.group(1)) > 322 else m.group(0), rumpf)
    f = '=' + rumpf
    refs = re.findall(r'\$?([A-Z]{1,3})\$?(\d+)', rumpf)
    if not refs:
        return f                                           # getippte Rechnung (=201-52): bleibt
    if any(c != spalte for c, _ in refs):
        return f                                           # Bezug auf andere Spalten: 1:1 uebernehmen
    m = re.search(r'SUM\(([^)]*)\)', rumpf)
    if m:
        args = m.group(1)
        return '=IF(COUNT(%s)=0,"",SUM(%s))' % (args, args)
    if re.fullmatch(r'[\s$A-Z0-9+\-]+', rumpf):
        liste = ','.join(c + r for c, r in refs)
        return '=IF(COUNT(%s)=0,"",%s)' % (liste, rumpf)
    return f


def datenblatt(wb, ws, st, b, erste_wert=9, kopf_texte=None, datum_fmt='dd.mm.yy', breiten=None, gruppe_ab=None, externe=False):
    """Schreibt ein Rohdatenblatt (Zeilen und Spalten wie im Original), Formeln vereinheitlicht."""
    datum = set(b.datumsspalten())
    delta = {c for c in range(1, b.spalten + 1) if b.kopf.get(c) == 'Δ'}
    letzte_datum = max(datum)
    datenzeilen = set()
    for (r, c) in b.zellen:
        if r >= 3 and (c in datum or c <= 4):
            datenzeilen.add(r)
    merge_anker = {}
    for m in b.verbunden:
        a, e = m.split(':')
        ar = int(re.sub(r'[A-Z]+', '', a))
        er = int(re.sub(r'[A-Z]+', '', e))
        ac = ord(re.sub(r'\d+', '', a)) - 64
        for r in range(ar, er + 1):
            merge_anker[(r, ac)] = (ar, er)
    themenstart = {r for r in range(3, b.zeilen + 1) if b.zellen.get((r, 2)) or (b.zellen.get((r, 1)) and not merge_anker.get((r, 2)))}
    # Kopf
    ws.set_row(0, 30)
    ws.set_row(1, 12)
    for c in range(1, b.spalten + 1):
        v = b.kopf.get(c)
        if c in datum:
            ws.write_datetime(0, c - 1, v, st.x(bold=True, font_color=WEISS, bg_color=TEALD, num_format=datum_fmt, align='center', valign='vcenter',
                                                border=1, border_color=TEALD))
            ws.write_formula(1, c - 1, '=IF(COUNT(%s3:%s%d)>0,"Y","X")' % (xl_col_to_name(c - 1), xl_col_to_name(c - 1), b.zeilen),
                             st.x(font_size=7, font_color=GRAUM, align='center'))
        elif c in delta:
            ws.write(0, c - 1, 'Δ', st.x(bold=True, font_color=GRAU, bg_color=GRAUL, align='center', valign='vcenter'))
            ws.write(1, c - 1, '-', st.x(font_size=7, font_color=GRAUM, align='center'))
        elif v is not None:
            t = kopf_texte.get(c, v) if kopf_texte else v
            ws.write(0, c - 1, t, st.x(bold=True, font_color=WEISS, bg_color=TEALD, valign='vcenter', text_wrap=True, border=1, border_color=TEALD))
    # Zeilen
    for r in range(3, b.zeilen + 1):
        oben = r in themenstart
        rand = {'top': 2, 'top_color': GRAUM} if oben else {}
        summenzeile = any(isinstance(b.zellen.get((r, c)), str) and str(b.zellen.get((r, c))).startswith('=') and c in datum
                          for c in sorted(datum)[-30:])
        for c in range(1, min(erste_wert, b.spalten + 1)):
            if (r, c) in merge_anker and merge_anker[(r, c)][0] != r:
                continue
            v = b.zellen.get((r, c))
            if c == 1:
                fm = st.x(bold=True, font_color=SW, valign='top', align='left', **rand)
            elif c == 2:
                fm = st.x(bold=True, font_color=SW, valign='top', text_wrap=True, **rand)
            elif c in (3, 4):
                fm = st.x(font_color=SW, bold=summenzeile, valign='top', text_wrap=False, **rand)
            elif c == 5:
                fm = st.x(font_color=GRAUD, valign='top', **rand)
            else:
                fm = st.x(font_size=8, font_color=GRAU, valign='top', **rand)
            if (r, c) in merge_anker:
                ar, er = merge_anker[(r, c)]
                ws.merge_range(ar - 1, c - 1, er - 1, c - 1, v if v is not None else '', fm)
            elif v is not None:
                if isinstance(v, str) and v.startswith('='):
                    ws.write_formula(r - 1, c - 1, v, fm, zwischenwert(b.werte.get((r, c))))
                else:
                    ws.write(r - 1, c - 1, v, fm)
            elif rand:
                ws.write_blank(r - 1, c - 1, None, fm)
        for c in range(erste_wert, b.spalten + 1):
            v = b.zellen.get((r, c))
            spalte = xl_col_to_name(c - 1)
            if c in datum:
                if isinstance(v, str) and v.startswith('='):
                    if externe and '[' in v:
                        ws.write_formula(r - 1, c - 1, v, st.x(bg_color=GRAUXL, num_format='#,##0.00', border=1, border_color=GRAUL, **rand),
                                         zwischenwert(b.werte.get((r, c))) or 0)
                    else:
                        ws.write_formula(r - 1, c - 1, norm_formel(v, spalte),
                                         st.x(bold=True, bg_color=GRAUXL, num_format='#,##0', border=1, border_color=GRAUL, **rand))
                elif v is not None:
                    if isinstance(v, (int, float)):
                        ws.write_number(r - 1, c - 1, v, st.x(num_format='#,##0.##' if isinstance(v, float) and v % 1 else '#,##0', border=1,
                                                              border_color=GRAUL, bg_color=WEISS, **rand))
                    else:
                        ws.write(r - 1, c - 1, v, st.x(italic=True, font_color=GRAU, border=1, border_color=GRAUL, bg_color=WEISS, **rand))
                elif r in datenzeilen:
                    ws.write_blank(r - 1, c - 1, None, st.x(border=1, border_color=GRAUL, bg_color=WEISS, num_format='#,##0', **rand))
            elif c in delta:
                if r in datenzeilen and (c - 1) in datum and (c + 1) in datum:
                    a, n = xl_col_to_name(c - 2) + str(r), xl_col_to_name(c) + str(r)
                    ws.write_formula(r - 1, c - 1, '=IF(AND(ISNUMBER(%s),ISNUMBER(%s)),%s-%s,"")' % (n, a, n, a),
                                     st.x(font_size=7.5, font_color=GRAU, bg_color='#FAFAFA', num_format='[Red]+#,##0;[Color10]-#,##0;0', **rand))
                elif rand:
                    ws.write_blank(r - 1, c - 1, None, st.x(**rand))
            elif v is not None:
                ws.write(r - 1, c - 1, v, st.x(font_size=8, font_color=GRAUD, **rand))
            elif rand:
                ws.write_blank(r - 1, c - 1, None, st.x(**rand))
    for r in b.ausgeblendet:
        ws.set_row(r - 1, None, None, {'hidden': True})
    # Spalten
    for c in range(1, b.spalten + 1):
        if c in datum:
            ws.set_column(c - 1, c - 1, 8.5)
        elif c in delta:
            ws.set_column(c - 1, c - 1, 5)
    for c, w in (breiten or {}).items():
        ws.set_column(c - 1, c - 1, w)
    if gruppe_ab:
        alt = [c for c in range(erste_wert, b.spalten + 1) if (c in datum and b.kopf[c].date() < gruppe_ab) or
               (c in delta and (c - 1) in datum and b.kopf[c - 1].date() < gruppe_ab)]
        for c in alt:
            ws.set_column(c - 1, c - 1, 8.5 if c in datum else 5, None, {'level': 1, 'hidden': True})
        if alt:
            ws.set_column(max(alt), max(alt), 8.5 if (max(alt) + 1) in datum else 5, None, {'collapsed': True})
        ws.outline_settings(True, False, True, False)
    return datum, delta, letzte_datum


def wertstand(ws, st, b):
    """Blatt Wertstand (ausgeblendet): gleicher Aufbau wie Rohdaten; je Wertzelle das Datum, von dem die Zahl stammt. Der
    Assistent traegt es beim Eintragen ein (Vorgabe: heute), „BÜ-Datei verknüpfen“ holt es fuer die BÜ-Zeilen aus dem
    BÜ-Reporting. Die Kacheln zeigen daraus „Stand: TT.MM.JJ“."""
    ws.write(0, 0, '#', st.kopf)
    ws.write(0, 1, 'Stand der Werte (Datum der Zahl in Rohdaten, gleiche Zelle)', st.kopf)
    for c in range(8, xl_spalte_nr(RD_LETZTE)):
        ws.write_formula(0, c, '=IF(ISBLANK(Rohdaten!%s),"",Rohdaten!%s)' % ((xl_rowcol_to_cell(0, c),) * 2), st.kopf_dat if hasattr(st, 'kopf_dat') else st.calc_d)
    for r in range(2, b.zeilen):
        ws.write_formula(r, 0, '=IF(ISBLANK(Rohdaten!A%d),"",Rohdaten!A%d)' % (r + 1, r + 1), st.text)
        ws.write_formula(r, 1, '=IF(ISBLANK(Rohdaten!B%d),"",Rohdaten!B%d)' % (r + 1, r + 1), st.klein)
    ws.set_column(0, 0, 6)
    ws.set_column(1, 1, 30)
    ws.set_column(2, 7, 2)
    ws.set_column(8, xl_spalte_nr(RD_LETZTE) - 1, 10, st.calc_d)
    ws.freeze_panes(1, 2)
    ws.hide()


def berichts_spalte(b):
    """Wochenspalte der berichteten KW in Rohdaten (Datum vom Freitag der KW bis 6 Tage danach, wie der Name Stichtag)."""
    return max(c for c in b.datumsspalten() if b.kopf[c].date() <= BERICHTSTAG + dt.timedelta(days=6))


def ist_formel(v):
    """Formel mit Zellbezug (eine getippte Rechnung wie =150-56 zaehlt als Wert)."""
    return isinstance(v, str) and v.startswith('=') and bool(re.search(r'[A-Z]{1,3}\$?\d', v[1:]))


def ist_formelzeile(b, r, spalte):
    """Formelzeile = in der Spalte des Berichtstags steht eine Formel mit Zellbezug (nach formeln_fortschreiben). Unabhaengig vom
    Build-Datum: die Formeln stehen in allen kommenden Spalten."""
    return ist_formel(b.zellen.get((r, spalte)))


A1_BEZUG = re.compile(r"(?<![A-Za-z_\d.!'\]$])(\$?)([A-Z]{1,3})(\$?)(\d+)(?![A-Za-z_(\d])")


def formel_verschieben(f, k):
    """Formel (A1) um k Spalten verschieben wie Kopieren in Excel: relative Spaltenbezuege wandern mit, $-Spalten bleiben; Texte in
    Anfuehrungszeichen bleiben unberuehrt."""
    teile = re.split(r'("[^"]*")', f)
    for i in range(0, len(teile), 2):
        teile[i] = A1_BEZUG.sub(lambda m: m.group(0) if m.group(1) else
                                (xl_col_to_name(xl_spalte_nr(m.group(2)) - 1 + k) + m.group(3) + m.group(4)), teile[i])
    return ''.join(teile)


def formeln_fortschreiben(b):
    """Formelzeilen in die kommenden Datumsspalten fortschreiben, wie der Fachbereich es jede Woche tut (im bisherigen Dashboard
    standen z. B. 8a = EASY + Online, 8c = Abgänge und 11g/11k/11l nur bis zur letzten gefuellten KW). Ist der juengste Eintrag einer
    Zeile in der Basisdatei (ohne Nachtraege) eine Formel mit Zellbezug auf dieses Blatt, bekommt jede leere Datumsspalte hinter dem
    letzten Eintrag dieselbe Formel, relativ verschoben. Bezieht sie sich auch auf andere Spalten (Abgänge = Bestand Vorwoche +
    Zugänge - Bestand), bleibt sie leer, solange die Eingaben der eigenen Spalte leer sind (Summen macht norm_formel leer statt 0).
    Liefert {zeile: (quellspalte, anzahl)}; die Zellen stehen in b.fortgeschrieben."""
    datum = b.datumsspalten()
    b.fortgeschrieben = set()
    out = {}
    for r in range(3, b.zeilen + 1):
        basis = [c for c in datum if b.zellen.get((r, c)) is not None and (r, c) not in b.nachgetragen]
        if not basis:
            continue
        q = basis[-1]
        f = b.zellen[(r, q)]
        if not ist_formel(f) or '!' in f or '[' in f:
            continue
        ab = max(c for c in datum if b.zellen.get((r, c)) is not None)
        n = 0
        for c in datum:
            if c <= ab:
                continue
            g = formel_verschieben(f, c - q)
            spalte = xl_col_to_name(c - 1)
            refs = re.findall(r'\$?([A-Z]{1,3})\$?(\d+)', re.sub(r'"[^"]*"', '""', g[1:]))
            eigene = [s + z for s, z in refs if s == spalte]
            if eigene and re.fullmatch(r'[\s$A-Z0-9+\-]+', g[1:]):
                # reine Plus/Minus-Rechnung (8a = EASY + Online, Abgänge = Bestand Vorwoche + Zugänge - Bestand): leer, solange die
                # Eingaben der eigenen Spalte leer sind; N() je Bezug, damit eine noch leere Teilsumme ("") nicht #WERT! ergibt
                g = '=IF(COUNT(%s)=0,"",%s)' % (','.join(eigene), A1_BEZUG.sub(lambda m: 'N(%s)' % m.group(0), g[1:]))
            elif any(s != spalte for s, _ in refs) and eigene:
                g = '=IF(COUNT(%s)=0,"",%s)' % (','.join(eigene), g[1:])
            b.zellen[(r, c)] = g
            b.fortgeschrieben.add((r, c))
            n += 1
        if n:
            out[r] = (q, n)
    return out


BEZUG = re.compile(r"(?<![A-Za-z_!'\]\.])\$?([A-Z]{1,3})\$?(\d+)(?::\$?([A-Z]{1,3})\$?(\d+))?(?![A-Za-z_(\d])")


def spalten_bezuege(f, spalte):
    """Zeilen, auf die die Formel f (ohne =) in ihrer eigenen Spalte verweist: Einzelzellen und Bereiche, ohne Bezuege auf andere
    Blaetter und ohne Texte in Anfuehrungszeichen."""
    out = set()
    for m in BEZUG.finditer(re.sub(r'"[^"]*"', '""', f)):
        c1, r1, c2, r2 = m.group(1), int(m.group(2)), m.group(3), m.group(4)
        if c1 != spalte or (c2 and c2 != spalte):
            continue
        r2 = int(r2) if r2 else r1
        out |= set(range(min(r1, r2), max(r1, r2) + 1))
    return out


def berichtete_zeilen(b, d):
    """Pflicht = berichtet. kern: Rohdaten-Zeilen, die eine Kachel auf PPT_2 oder PPT_3 zeigt (aus den Reihen der Diagramme und dem
    Stand im Kachelkopf, Daten.benutzt). menge: dazu die Eingabezeilen von Formelzeilen – steht in der Spalte des Berichtstags eine
    Formel, gehoeren die Zeilen dazu, auf die sie in derselben Spalte verweist (rekursiv; z. B. 8a = EASY + Online)."""
    kern = set(d.benutzt.get('PPT_2', set())) | set(d.benutzt.get('PPT_3', set()))
    bs = berichts_spalte(b)
    menge, offen = set(kern), sorted(kern)
    while offen:
        r = offen.pop()
        if not ist_formelzeile(b, r, bs):
            continue
        for z in spalten_bezuege(b.zellen[(r, bs)][1:], xl_col_to_name(bs - 1)):
            if 3 <= z <= b.zeilen and z not in menge:
                menge.add(z)
                offen.append(z)
    return kern, menge


def pflicht_pruefen(b, kern, zust):
    """Jede berichtete Zeile muss am Berichtstag geliefert werden: Pflicht „ja“ oder „automatisch“, oder in der Spalte des
    Berichtstags eine Formel, deren Eingaben derselben Spalte (rekursiv) wieder so geliefert werden. Bricht sonst ab."""
    bs = berichts_spalte(b)
    pflicht = {z[0]: z[5] for z in zust}
    sp = xl_col_to_name(bs - 1)
    fehlt = {}

    def geliefert(r, weg=()):
        if pflicht.get(r) in ('ja', 'automatisch'):
            return True
        if not ist_formelzeile(b, r, bs) or r in weg:
            fehlt.setdefault(r, 'keine Formel am Berichtstag und Pflicht „%s“' % pflicht.get(r, 'fehlt'))
            return False
        ein = [z for z in spalten_bezuege(b.zellen[(r, bs)][1:], sp) if 3 <= z <= b.zeilen and z != r]
        ok = bool(ein) and all([geliefert(z, weg + (r,)) for z in ein])
        if not ein:
            fehlt.setdefault(r, 'Formel ohne Eingaben in derselben Spalte')
        return ok

    schlecht = [r for r in sorted(kern) if r <= b.zeilen and not geliefert(r)]
    monat = [r for r in sorted(kern) if r > b.zeilen and pflicht.get(r) not in ('ja', 'automatisch')]
    assert not monat, 'Berichtete Monatszeilen ohne Pflicht ja/automatisch: %s' % monat
    assert not schlecht, 'Berichtete Zeilen ohne Lieferung am Berichtstag (%s): %s' % (
        b.kopf[bs].strftime('%d.%m.%Y'), '; '.join('%d %s: %s' % (r, b.zellen.get((r, 1)) or '', fehlt.get(r, '')) for r in schlecht))
    print('Pflicht am Berichtstag %s: alle %d berichteten Zeilen werden geliefert (Pflicht ja/automatisch oder Formel aus solchen).'
          % (b.kopf[bs].strftime('%d.%m.%Y'), len(kern)))


RD_B_BREITE = 17                              # Spalte B (Thema) in Rohdaten, Zeichen
RD_B_PT = (int(RD_B_BREITE * 7 + 0.5) + 5) * 0.75


def zeilen_hart(text, breite_pt, groesse, fett=False):
    """Zeilen eines umbrochenen Zelltexts wie in Excel: zwischen Woertern, ein Wort laenger als die Spalte auch mitten im Wort;
    Zeilenumbrueche im Text zaehlen."""
    if not text.strip():
        return 1
    n = 0
    for absatz in text.split('\n'):
        zeile, k = '', 1
        for wort in absatz.split():
            probe = (zeile + ' ' + wort).strip()
            if textbreite(probe, groesse, fett) <= breite_pt:
                zeile = probe
                continue
            if zeile:
                k += 1
            zeile = ''
            for ch in wort:                          # Wort allein zu breit: Zeichen fuer Zeichen
                if textbreite(zeile + ch, groesse, fett) > breite_pt and zeile:
                    k += 1
                    zeile = ch
                else:
                    zeile += ch
        n += k
    return n


def themen_bloecke(b):
    """Themen in Rohdaten: Spalte B gilt bis zum naechsten Eintrag -> [(erste, letzte Zeile)]."""
    starts = [r for r in range(3, b.zeilen + 1) if b.zellen.get((r, 2))]
    if not starts or starts[0] != 3:
        starts.insert(0, 3)
    return [(a, (starts[i + 1] - 1) if i + 1 < len(starts) else b.zeilen) for i, a in enumerate(starts)]


def rohdaten_einklappen(ws, b, berichtet):
    """Je Thema Bloecke nicht berichteter Zeilen gruppieren und eingeklappt anlegen: die erste sichtbare Zeile des Blocks (Thema bzw.
    Code) bleibt stehen und traegt das Plus (Symbole oberhalb, wie die Spaltengliederung der alten KW: outline_settings in
    datenblatt), die uebrigen Zeilen sind ausgeblendet. Schon ausgeblendete Zeilen bleiben es. Liefert [(kopf, [zeilen])]."""
    versteckt = set(b.ausgeblendet)
    gruppen = []
    for a, e in themen_bloecke(b):
        lauf = []
        for r in list(range(a, e + 1)) + [None]:
            if r is not None and r not in berichtet:
                lauf.append(r)
                continue
            sichtbar = [x for x in lauf if x not in versteckt]
            if sichtbar and any(x > sichtbar[0] for x in lauf):
                kopf = sichtbar[0]
                detail = [x for x in lauf if x > kopf]
                # Kopfzeile mit langem Thema (Spalte B bricht um, lange Woerter auch mitten im Wort): so hoch wie der umbrochene
                # Name, damit er eingeklappt ganz lesbar bleibt
                n = zeilen_hart(str(b.zellen.get((kopf, 2)) or ''), RD_B_PT - 4, 10, True)
                hoch = 12.75 * n + 2 if n > 1 else None
                ws.set_row(kopf - 1, hoch, None, {'collapsed': True})
                for x in detail:
                    ws.set_row(x - 1, None, None, {'level': 1, 'hidden': True})
                gruppen.append((kopf, detail))
            lauf = []
    return gruppen


def rohdaten(wb, ws, st, b, berichtet=frozenset(), L=None):
    sp = berichts_spalte(b)
    ab = b.kopf[sp].date() - dt.timedelta(weeks=9)
    datum, delta, _ = datenblatt(wb, ws, st, b, 9, gruppe_ab=ab,
                                 breiten={1: 6, 2: RD_B_BREITE, 3: 24, 4: 20, 5: 16, 322: 60})
    for c in (6, 7, 8):                        # Ältester Vorgang, Erläuterung, PV: ausgeblendet (selten genutzt, Spalten bleiben 1:1)
        ws.set_column(c - 1, c - 1, 13, None, {'hidden': True})
    ws.freeze_panes(2, 8)
    letzte = xl_col_to_name(max(datum) - 1)
    ws.conditional_format('I1:%s1' % letzte, {'type': 'formula', 'criteria': '=AND(ISNUMBER(I$1),I$1=Stichtag)',
                                              'format': wb.add_format({'bg_color': '#F2B600', 'font_color': SW})})
    ws.conditional_format('I3:%s%d' % (letzte, b.zeilen), {'type': 'formula', 'criteria': '=AND(ISNUMBER(I$1),I$1=Stichtag)',
                                                           'format': wb.add_format({'bg_color': GELB_ZELLE})})
    ws.set_tab_color(TEALD)
    rohdaten.gruppen = rohdaten_einklappen(ws, b, berichtet)
    if L is not None:
        monatsbloecke(wb, ws, st, L)
    return berichts_spalte


# ------------------------------------------------------------------ Monatsbloecke in Rohdaten (bisher Rohdaten_2 und Rohdaten_3)
MONAT_ERSTER, MONAT_LETZTER = dt.datetime(2025, 8, 1), dt.datetime(2028, 1, 1)
MONATS_BLOECKE = (('Rohdaten_2', 'Mitarbeiter-Kapazitäten'), ('Rohdaten_3', 'Neuverpflichtung'))
MONAT_MARKE = 'Monat'                          # Spalte A der Kopfzeile eines Monatsblocks (modBasis.KopfZeile sucht danach)
ZYKLEN = ['wöchentlich', 'monatlich', 'quartalsweise']


class MonatsLayout:
    """Lage der Monatsbloecke unter den Wochenwerten: je Block (bisher ein eigenes Blatt) eine Kopfzeile mit den Monaten
    (Spalte A „Monat“, Spalte F – ausgeblendet – das fruehere Blatt fuer modAltWerte), eine Zeile Y/X, die Zeilen 3.. des
    frueheren Blatts und eine Leerzeile. Die Monate stehen in den Datumsspalten der Wochen (Delta dazwischen), rechtsbuendig an
    der letzten Woche: so liegen sie im sichtbaren Bereich neben den aktuellen KW; die aeltesten Monate stehen wie die alten KW in
    den eingeklappten Spalten."""

    def __init__(self, q, rd):
        self.monate = []
        m = MONAT_ERSTER
        while m <= MONAT_LETZTER:
            self.monate.append(m)
            m = dt.datetime(m.year + m.month // 12, m.month % 12 + 1, 1)
        letzte = max(rd.datumsspalten())
        n = len(self.monate)
        self.spalte = {mo: letzte - 2 * (n - 1 - i) for i, mo in enumerate(self.monate)}     # 1-basiert
        assert all(rd.kopf.get(c) not in (None, 'Δ') for c in self.spalte.values()), 'Monatsspalten muessen Datumsspalten sein'
        self.erste, self.letzte = min(self.spalte.values()), max(self.spalte.values())
        self.bloecke, self.zeile, self.kopf_von, self.zellen, self.quelle_von = [], {}, {}, {}, {}
        r = rd.zeilen + 2
        for quelle, titel in MONATS_BLOECKE:
            b = q[quelle]
            kopf = r
            r += 2
            zmap = {}
            for orig in range(3, b.zeilen + 1):
                zmap[orig] = r
                self.zeile[(quelle, orig)] = r
                self.kopf_von[r] = kopf
                self.quelle_von[r] = (quelle, orig)
                for c in range(1, 6):
                    v = b.zellen.get((orig, c))
                    if v is not None:
                        self.zellen[(r, c)] = v
                r += 1
            smap = {}
            for c in b.datumsspalten():
                ziel = self.spalte.get(b.kopf[c])
                if ziel:
                    smap[c] = ziel
                    if b.kopf.get(c + 1) == 'Δ':
                        smap[c + 1] = ziel + 1
            self.bloecke.append(dict(quelle=quelle, titel=titel, kopf=kopf, zeilen=zmap, spalten=smap, b=b))
            r += 1
        self.letzte_zeile = r - 2
        self.zeilen = sorted(self.kopf_von)

    def code_zeilen(self):
        """Code (klein) -> (Zeile, Kopfzeile)."""
        return {str(v).strip().lower(): (r, self.kopf_von[r]) for (r, c), v in self.zellen.items() if c == 1 and str(v).strip()}

    def bereich(self, r):
        """Zeile r und Kopfzeile ihres Blocks als Bezuege ueber die ganze Breite (wie RD_Kopf)."""
        k = self.kopf_von[r]
        return 'Rohdaten!$A$%d:$%s$%d' % (r, RD_LETZTE, r), 'Rohdaten!$A$%d:$%s$%d' % (k, RD_LETZTE, k)


def formel_umsetzen(f, smap, zmap):
    """Formel eines frueheren Monatsblatts an die neue Lage: Spalten ueber smap, Zeilen ueber zmap (Bezuege auf andere Blaetter
    und externe Dateien bleiben)."""
    teile = re.split(r'("[^"]*")', f)
    for i in range(0, len(teile), 2):
        teile[i] = A1_BEZUG.sub(lambda m: m.group(1) + xl_col_to_name(smap.get(xl_spalte_nr(m.group(2)), xl_spalte_nr(m.group(2))) - 1)
                                + m.group(3) + str(zmap.get(int(m.group(4)), int(m.group(4)))), teile[i])
    return ''.join(teile)


def monatsbloecke(wb, ws, st, L):
    """Monatsbloecke in Rohdaten schreiben (Lage siehe MonatsLayout). Erledigungsquote: Formel aus Gesamt und fristgerecht
    erledigt (leer, solange eine der beiden fehlt); eine eingetippte Quote bleibt stehen."""
    kopf_f = st.x(bold=True, font_color=WEISS, bg_color=TEALD, valign='vcenter', border=1, border_color=TEALD)
    kopf_d = st.x(bold=True, font_color=WEISS, bg_color=TEALD, num_format='mm.yyyy', align='center', valign='vcenter', border=1, border_color=TEALD)
    kopf_delta = st.x(bold=True, font_color=GRAU, bg_color=GRAUL, align='center', valign='vcenter')
    yx = st.x(font_size=7, font_color=GRAUM, align='center')
    for blk in L.bloecke:
        b, k0, zmap, smap = blk['b'], blk['kopf'] - 1, blk['zeilen'], blk['spalten']
        ws.set_row(k0, 30)
        ws.set_row(k0 + 1, 12)
        ws.write(k0, 0, MONAT_MARKE, kopf_f)
        ws.merge_range(k0, 1, k0, 4, 'MONATSWERTE · %s  (Spalten = Monate)' % blk['titel'], kopf_f)
        ws.write(k0, 5, blk['quelle'], st.x(font_size=7, font_color=GRAUM))        # Spalte F (ausgeblendet): frueheres Blatt
        von, bis = min(zmap.values()), max(zmap.values())
        for mo in L.monate:
            c = L.spalte[mo] - 1
            ws.write_datetime(k0, c, mo, kopf_d)
            ws.write_formula(k0 + 1, c, '=IF(COUNT(%s%d:%s%d)>0,"Y","X")' % (xl_col_to_name(c), von, xl_col_to_name(c), bis), yx)
            if mo != L.monate[-1]:
                ws.write(k0, c + 1, 'Δ', kopf_delta)
        # Beschriftung (Spalten A bis E) mit den verbundenen Zellen des frueheren Blatts
        verbund = {}
        for m in b.verbunden:
            a, e = m.split(':')
            ac, ar, er = xl_spalte_nr(re.sub(r'\d+', '', a)), int(re.sub(r'[A-Z]+', '', a)), int(re.sub(r'[A-Z]+', '', e))
            if ac <= 5:
                verbund[(ar, ac)] = er
        innen = {(r, c) for (ar, c), er in verbund.items() for r in range(ar + 1, er + 1)}
        quote = None
        for orig, r in zmap.items():
            oben = orig == 3
            rand = {'top': 2, 'top_color': GRAUM} if oben else {}
            for c in range(1, 6):
                if (orig, c) in innen:
                    continue
                v = b.zellen.get((orig, c))
                fm = st.x(bold=c in (1, 2), font_color=GRAUD if c == 5 else SW, valign='top', text_wrap=(c == 2), **rand)
                if (orig, c) in verbund:
                    ws.merge_range(r - 1, c - 1, zmap[verbund[(orig, c)]] - 1, c - 1, v if v is not None else '', fm)
                elif v is not None:
                    ws.write(r - 1, c - 1, v, fm)
                elif rand:
                    ws.write_blank(r - 1, c - 1, None, fm)
            ist_quote = blk['quelle'] == 'Rohdaten_3' and str(b.zellen.get((orig, 1)) or '').upper() == '18E'
            zahl = '0%' if ist_quote else '#,##0.##'
            for i, mo in enumerate(L.monate):
                c = L.spalte[mo]
                src = next((s for s, z in smap.items() if z == c), None)
                v = b.zellen.get((orig, src)) if src else None
                eingabe = st.x(num_format=zahl, border=1, border_color=GRAUL, bg_color=WEISS, **rand)
                if ist_quote and (v is None or (isinstance(v, str) and v.startswith('=') and '[' not in v)):
                    g, f = zmap[orig - 2], zmap[orig - 1]                       # Gesamt, fristgerecht erledigt
                    s_ = xl_col_to_name(c - 1)
                    ws.write_formula(r - 1, c - 1, '=IF(AND(ISNUMBER(%s%d),ISNUMBER(%s%d),N(%s%d)<>0),%s%d/%s%d,"")' % (s_, g, s_, f, s_, g, s_, f, s_, g),
                                     st.x(bold=True, bg_color=GRAUXL, num_format='0%', border=1, border_color=GRAUL, **rand))
                    quote = r
                elif isinstance(v, str) and v.startswith('='):
                    if '[' in v:
                        ws.write_formula(r - 1, c - 1, v, st.x(bg_color=GRAUXL, num_format='#,##0.00', border=1, border_color=GRAUL, **rand),
                                         zwischenwert(b.werte.get((orig, src))) or 0)
                    else:
                        ws.write_formula(r - 1, c - 1, formel_umsetzen(v, smap, zmap),
                                         st.x(bold=True, bg_color=GRAUXL, num_format=zahl, border=1, border_color=GRAUL, **rand),
                                         zwischenwert(b.werte.get((orig, src))))
                elif isinstance(v, (int, float)):
                    ws.write_number(r - 1, c - 1, v, eingabe)
                elif v is not None:
                    ws.write(r - 1, c - 1, v, st.x(italic=True, font_color=GRAU, border=1, border_color=GRAUL, bg_color=WEISS, **rand))
                else:
                    ws.write_blank(r - 1, c - 1, None, eingabe)
                if i + 1 < len(L.monate):                                         # Delta zum naechsten Monat
                    a_, n_ = xl_col_to_name(c - 1) + str(r), xl_col_to_name(c + 1) + str(r)
                    ws.write_formula(r - 1, c, '=IF(AND(ISNUMBER(%s),ISNUMBER(%s)),%s-%s,"")' % (n_, a_, n_, a_),
                                     st.x(font_size=7.5, font_color=GRAU, bg_color='#FAFAFA',
                                          num_format='[Red]+0%;[Color10]-0%;0%' if ist_quote else '[Red]+#,##0;[Color10]-#,##0;0', **rand))
        # Vormonat des Berichtstags hervorheben (Kopf und Werte)
        e1, e2 = xl_col_to_name(L.erste - 1), xl_col_to_name(L.letzte - 1)
        krit = '=AND(ISNUMBER(%s$%d),%s$%d=DATE(YEAR(Berichtstag),MONTH(Berichtstag)-1,1))' % (e1, k0 + 1, e1, k0 + 1)
        ws.conditional_format('%s%d:%s%d' % (e1, k0 + 1, e2, k0 + 1), {'type': 'formula', 'criteria': krit,
                                                                    'format': wb.add_format({'bg_color': '#F2B600', 'font_color': SW})})
        ws.conditional_format('%s%d:%s%d' % (e1, von, e2, bis), {'type': 'formula', 'criteria': krit,
                                                              'format': wb.add_format({'bg_color': GELB_ZELLE})})
    return L


# ------------------------------------------------------------------ Uebrige Blaetter
NAMEN_KURZ = {'Isa Kinnert': 'Kinnert', 'Olaf Göddertz': 'Göddertz'}                 # Anzeige im Cockpit und im Assistenten (Nachname)


def personen_aus(text):
    if not text:
        return []
    t = str(text).split('\n')[0]
    out = []
    for teil in re.split(r'/', t):
        p = teil.strip()
        if not p or ':' in p or '[' in p or p.upper() == 'TBD' or 'REPORT' in p.upper() or 'Gesamt' == p:
            continue
        out.append(NAMEN_KURZ.get(p, p))
    return out


def _sauber(x):
    return re.sub(r'\s+', ' ', str(x).replace('\n', ' ')).strip() if x else ''


ZU_ART = ZU_VOLL + 2                          # Spalte AO (ausgeblendet): Art der Zeile – T Themenband, K Kategorieband, W Wertzeile
ZU_C_BREITE = 52                              # Spalte C (Kennzahl) in Zuständigkeiten, Zeichen
ZU_C_PT = (int(ZU_C_BREITE * 7 + 0.5) + 5) * 0.75   # dieselbe Breite in Punkt (xlsxwriter: Zeichen -> Pixel)
OHNE_BESCHRIFTUNG = '(ohne Beschriftung)'


def zustaendigkeiten(ws, st, b, berichtet=frozenset(), L=None, zuordnung=None, personen_vorgabe=(), zyklus=None):
    """Zuordnungs-Cockpit: Kennzahlen nach Thema und Kategorie gegliedert (Baender, einklappbar), eine Spalte je Person.
    Spalte A = Zeile in Rohdaten als Formel =ROW(Rohdaten!$A$n) (leer in Bandzeilen; stimmt auch nach „KPI löschen“),
    AM (ausgeblendet) = Kennzahl mit Thema und Kategorie fuer den Assistenten, AN = Code, AO = Art der Zeile (T/K/W).
    Pflicht = auf PPT_2 oder PPT_3 berichtet (berichtet: Rohdaten-Zeilen inkl. Eingabezeilen von Summen): „ja“ fuer berichtete
    Zeilen mit Person und ohne Formel, „automatisch“ fuer die BUE-Zeilen 7VA–7OL, sonst „nein“. Nicht berichtete Zeilen mit Person
    zeigen im Status grau „nicht berichtet“; Themen ohne Pflichtwert (ja/automatisch) sind beim Oeffnen eingeklappt.
    Dazu die Monatsbloecke unter den Wochenwerten (L, MonatsLayout): MAK (bisher Rohdaten_2) „automatisch“ aus der Mig-Max-Liste,
    Neuverpflichtung (bisher Rohdaten_3) wie die Wochenzeilen. Spalte G = Reportingzyklus (wöchentlich, monatlich,
    quartalsweise), daraus der Status in Spalte H: wöchentlich = Wert in der Spalte des Berichtstags; monatlich bzw. quartalsweise
    = bei Monatszeilen der Wert des Vormonats bzw. des letzten Monats des Vorquartals, bei Wochenzeilen ein Wert in einer
    Spalte des laufenden Monats bzw. Quartals bis zum Berichtstag. zuordnung: Rohdaten-Zeile -> Personen (Punkte aus der
    Arbeitsfassung), sonst die Namen aus Spalte E."""
    zz = dict(b.zellen)
    reihen = list(range(3, b.zeilen + 1))
    if L is not None:
        zz.update(L.zellen)
        reihen += L.zeilen
    zuordnung = zuordnung or {}
    bs = berichts_spalte(b)
    zeilen = []                                      # (r, code, voll, verantw, personen, pflicht, thema, kat, abt, kat_code, berichtet)
    thema = kat = kat_code = None
    verbunden_e = {}                                 # verbundene Zellen in Spalte E: Name gilt fuer alle Zeilen
    anker_e = {}                                     # Zeile -> erste Zeile des Verbunds in E (Spalte D liest von dort)
    for m in b.verbunden:
        a, e = m.split(':')
        if a[0] == 'E':
            ar, er = int(a[1:]), int(e[1:])
            for r in range(ar, er + 1):
                verbunden_e[r] = b.zellen.get((ar, 5))
                anker_e[r] = ar
    for r in reihen:
        code = zz.get((r, 1))
        if zz.get((r, 2)):
            neu = _sauber(zz[(r, 2)])
            if neu != thema:
                kat = kat_code = None
            thema = neu
        if zz.get((r, 3)):                     # Kategorie gilt fuer die folgenden Zeilen ohne eigene (Unterstruktur)
            kat = _sauber(zz[(r, 3)])
            kat_code = str(code) if code else None
        abt = _sauber(zz.get((r, 4)))
        verantw = zz.get((r, 5)) or verbunden_e.get(r)
        if not verantw and not code:
            continue
        if verantw and str(verantw).startswith('[siehe'):
            continue
        # Pflicht = auf PPT_2 oder PPT_3 berichtet: „ja“ fuer berichtete Zeilen mit Person, ausser Summenzeilen (rechnen sich
        # selbst). Die BUE-Zeilen 7VA bis 7OL sind Pflicht, werden aber automatisch aus dem BUE-Reporting befuellt („BÜ-Datei
        # verknüpfen“): „automatisch“ – zaehlen bei der Person mit den Punkten (Startseite), der Assistent fuehrt sie als BUE-Eintrag.
        # Die alte BUE-Aufteilung 7a bis 7f wird nicht mehr berichtet: „nein“.
        monat = L is not None and r in L.kopf_von
        formelzeile = (str(code or '').upper() == '18E') if monat else ist_formelzeile(b, r, bs)   # 18E: Quote rechnet sich
        bue = str(code or '').upper()[:2] in ('7V', '7O') and len(str(code)) == 3
        mak = monat and L.quelle_von[r][0] == 'Rohdaten_2'      # MAK: Formeln auf die Mig-Max-Namensliste (externe Verknuepfung)
        ist_berichtet = r in berichtet
        pers_l = zuordnung[r] if r in zuordnung else personen_aus(verantw)
        pflicht = 'automatisch' if (bue or mak) else ('ja' if (ist_berichtet and pers_l and not formelzeile) else 'nein')
        # Zeile mit eigenem Code, aber ohne Kategorie und Abteilung (z. B. 16, 17, 18d): keine Kategorie der Zeile davor uebernehmen
        ohne = bool(code) and not zz.get((r, 3)) and not abt
        kat_z = '' if ohne else kat
        voll = ' · '.join(x for x in (thema, kat_z, abt, OHNE_BESCHRIFTUNG if ohne else '') if x)
        zeilen.append((r, code, voll, verantw, ' / '.join(pers_l), pflicht, thema or '', kat_z or '', abt,
                       kat_code if not zz.get((r, 3)) else (str(code) if code else None), ist_berichtet or bue or mak,
                       'monatlich' if monat else ((zyklus or {}).get(r) if (zyklus or {}).get(r) in ZYKLEN else 'wöchentlich')))
    personen = [p for p in personen_vorgabe if p]
    for z in zeilen:
        for p in z[4].split(' / '):
            if p and p not in personen:
                personen.append(p)
    personen = sorted(personen, key=lambda n: n.lower().replace('ä', 'a').replace('ö', 'o').replace('ü', 'u').replace('ß', 'ss'))[:N_PERSONEN]

    # Gliederung: Themenband, darin Kategorieband (nur bei mehreren Abteilungen derselben Kategorie), darunter die Werte
    aufbau = []                                      # ('thema', text) | ('kat', code, text) | ('wert', zeile, label, ebene)
    i = 0
    while i < len(zeilen):
        th = zeilen[i][6]
        j = i
        while j < len(zeilen) and zeilen[j][6] == th:
            j += 1
        block = zeilen[i:j]
        nr = next((re.match(r'\d+', str(z[1] or z[9] or '')).group(0) for z in block if re.match(r'\d+', str(z[1] or z[9] or ''))), '')
        # ohne einen Pflichtwert (ja/automatisch) im Thema: beim Oeffnen eingeklappt
        aufbau.append(('thema', (nr + '   ' if nr else '') + th, not any(z[5] in ('ja', 'automatisch') for z in block)))
        k = 0
        while k < len(block):
            kt = block[k][7]
            m = k
            while m < len(block) and block[m][7] == kt and block[m][8]:
                m += 1
            if m - k >= 2:
                kcode = (block[k][9] or '') if not block[k][1] else ''     # Code der Kategorie nur, wenn die Werte keinen eigenen haben
                aufbau.append(('kat', kcode, kt))
                for z in block[k:m]:
                    aufbau.append(('wert', z, z[8], 2))
                k = m
            else:
                z = block[k]
                aufbau.append(('wert', z, ' · '.join(x for x in (z[7], z[8]) if x) or (OHNE_BESCHRIFTUNG if z[1] else z[6]), 1))
                k += 1
        i = j

    ws.hide_gridlines(2)
    ws.write(0, 0, 'Zuständigkeiten · wer liefert welchen Wert?', st.titel)
    ws.write_formula(1, 0, '=IF(ZuordnungOffen=1,"Bearbeiten aktiv: Klick in ein Personenfeld setzt oder entfernt den Punkt, Klick auf ja/nein schaltet die Pflicht, Klick auf den Zyklus wechselt ihn.'
                           '  „Fertig · sperren“ schließt die Bearbeitung.","Gesperrt. Zum Ändern „Zuständigkeiten bearbeiten“ klicken.'
                           '  Die Gliederung (+/− links) klappt Themen auf und zu.")', st.hinweis)
    ws.write(2, 0, 'Pflicht = auf PPT_2 oder PPT_3 berichtet; BÜ und MAK automatisch. Zyklus bestimmt, wann ein Wert offen ist: wöchentlich = '
                   'Spalte des Berichtstags, monatlich = Vormonat (Monatswerte) bzw. ein Wert im laufenden Monat, quartalsweise = Vorquartal. '
                   'Nicht berichtete Werte zeigen grau „nicht berichtet“, Themen ohne Pflichtwert sind eingeklappt (+).', st.hinweis)
    kopf = ['Zeile', 'Code', 'Kennzahl', 'Laut Rohdaten (Spalte E)', 'Personen (aus den Punkten)', 'Pflicht', 'Zyklus', 'Berichtstag']
    for c, t in enumerate(kopf):
        ws.write(3, c, t, st.kopf)
    ws.set_row(3, 96)
    pk = st.x(bold=True, font_color=WEISS, bg_color=TEALD, rotation=90, align='center', valign='bottom', border=1, border_color=WEISS)
    for i in range(N_PERSONEN):
        ws.write_formula(3, P_ERSTE + i, '=IF(Konfiguration!$B$%d="","",Konfiguration!$B$%d)' % (28 + i, 28 + i), pk,
                         personen[i] if i < len(personen) else '')
    ws.write(3, ZU_VOLL, 'Kennzahl (voll, für den Assistenten)', st.kopf)
    ws.write(3, ZU_VOLL + 1, 'Code (Zeile oder Kategorie)', st.kopf)
    ws.write(3, ZU_ART, 'Art (T/K/W)', st.kopf)
    zelle = st.x(align='center', valign='vcenter', font_color=TEALD, font_size=11, bold=True, border=1, border_color=GRAUL)
    rand = {'border': 1, 'border_color': GRAUL, 'valign': 'vcenter'}
    f_zahl = st.x(font_color=GRAUM, font_size=8.5, align='center', **rand)
    f_code = st.x(font_color=GRAU, font_size=9, **rand)
    f_label = {1: st.x(indent=1, **rand), 2: st.x(indent=3, **rand)}
    f_label_w = {1: st.x(indent=1, text_wrap=True, **rand), 2: st.x(indent=3, text_wrap=True, **rand)}
    f_klein = st.x(font_size=8, font_color=GRAU, **rand)
    f_pers = st.x(font_size=9.5, **rand)
    f_pfl = st.x(align='center', bold=True, **rand)
    f_stat = st.x(**rand)
    f_zyk = st.x(align='center', font_size=9, font_color=GRAUD, **rand)
    TH_BG, KAT_BG = '#D7ECEE', '#EEF2F5'
    f_th = st.x(bold=True, font_size=10.5, font_color=TEALD, bg_color=TH_BG, valign='vcenter', top=1, top_color=TEALD)
    f_th_m = st.x(bg_color=TH_BG, top=1, top_color=TEALD)
    f_kat = st.x(bold=True, font_size=9.5, font_color=SW, bg_color=KAT_BG, valign='vcenter', indent=1, border=1, border_color=GRAUL)
    f_kat_code = st.x(bold=True, font_size=9, font_color=GRAU, bg_color=KAT_BG, valign='vcenter', border=1, border_color=GRAUL)
    f_kat_m = st.x(bg_color=KAT_BG, border=1, border_color=GRAUL)
    letzte_p = xl_col_to_name(P_ERSTE + N_PERSONEN - 1)
    erste_p = xl_col_to_name(P_ERSTE)
    zu = False                                       # Zeilen des aktuellen Themas ausgeblendet (Thema eingeklappt)
    for i, eintrag in enumerate(aufbau):
        z = 4 + i
        if eintrag[0] == 'thema':
            zu = eintrag[2]
            ws.set_row(z, 22, None, {'collapsed': True} if zu else None)
            ws.merge_range(z, 0, z, 7, eintrag[1], f_th)
            for c in range(8, P_ERSTE + N_PERSONEN):
                ws.write_blank(z, c, None, f_th_m)
            ws.write(z, ZU_ART, 'T')
            continue
        if eintrag[0] == 'kat':
            ws.set_row(z, 18, None, {'level': 1, 'hidden': zu})
            ws.write(z, ZU_ART, 'K')
            ws.write_blank(z, 0, None, f_kat_code)
            ws.write(z, 1, eintrag[1], f_kat_code)
            ws.merge_range(z, 2, z, 7, eintrag[2], f_kat)
            for c in range(P_ERSTE, P_ERSTE + N_PERSONEN):
                ws.write_blank(z, c, None, f_kat_m)
            continue
        _, (r, code, voll, verantw, pers, pfl, *_rest), label, ebene = eintrag
        # lange Beschriftung (z. B. 8d „… Ticket-System (ab 12.2023 – 06.2024)“): umbrechen, Zeile so hoch wie noetig
        n_zeilen = zeilen_umbrechen(label, ZU_C_PT - (9 if ebene == 1 else 27), 10)
        ws.set_row(z, 18 if n_zeilen == 1 else 13 * n_zeilen + 4, None, {'level': ebene, 'hidden': zu})
        ws.write_formula(z, 0, '=ROW(Rohdaten!$A$%d)' % r, f_zahl, r)
        ws.write(z, ZU_ART, 'W')
        ws.write_formula(z, 1, '=IF(Rohdaten!$A$%d="","",Rohdaten!$A$%d)' % (r, r), f_code, code or '')
        ws.write(z, 2, label, f_label[ebene] if n_zeilen == 1 else f_label_w[ebene])
        if anker_e.get(r, r) != r:                   # in Rohdaten verbunden (z. B. E103:E111): Name steht in der ersten Zeile
            e_ber = 'Rohdaten!$E$%d:$E$%d' % (anker_e[r], r)          # schrumpft mit, wenn „KPI löschen“ Zeilen entfernt
            ws.write_formula(z, 3, '=IFERROR(INDEX(%s,MATCH("*",%s,0)),"")' % (e_ber, e_ber), f_klein, verantw or '')
        else:
            ws.write_formula(z, 3, '=IF(Rohdaten!$E$%d="","",Rohdaten!$E$%d)' % (r, r), f_klein, verantw or '')
        ws.write_array_formula(z, 4, z, 4, '{=_xlfn.TEXTJOIN(" / ",TRUE,IF($%s%d:$%s%d="●",$%s$4:$%s$4,""))}'
                               % (erste_p, z + 1, letzte_p, z + 1, erste_p, letzte_p), f_pers, pers)
        ws.write(z, 5, pfl, f_pfl)
        zyk = _rest[5]
        ws.write(z, 6, zyk, f_zyk)
        # nicht berichtet (im Build je Zeile entschieden): Zeile mit Person, die keine Kachel auf PPT_2/PPT_3 zeigt
        sonst = '"nicht berichtet"' if (not _rest[4] and pers) else '""'
        G = '$G%d' % (z + 1)
        if zyk == 'monatlich':                       # Monatsblock: Wert des Vormonats bzw. des letzten Monats im Vorquartal
            zeile_m, kopf_m = L.bereich(r)
            ziel = ('IF(%s="quartalsweise",DATE(YEAR(Berichtstag),INT((MONTH(Berichtstag)-1)/3)*3,1),'
                    'DATE(YEAR(Berichtstag),MONTH(Berichtstag)-1,1))' % G)
            fehlt = 'ISNA(MATCH(%s,%s,0))' % (ziel, kopf_m)
            da = 'ISNUMBER(INDEX(%s,MATCH(%s,%s,0)))' % (zeile_m, ziel, kopf_m)
        else:                                        # Wochenwerte: Spalte des Berichtstags bzw. ein Wert im laufenden Monat/Quartal
            zeile_w = 'Rohdaten!$A$%d:$%s$%d' % (r, RD_LETZTE, r)
            ab = ('IF(%s="monatlich",DATE(YEAR(KWFreitag),MONTH(KWFreitag),1),IF(%s="quartalsweise",'
                  'DATE(YEAR(KWFreitag),INT((MONTH(KWFreitag)-1)/3)*3+1,1),Stichtag))' % (G, G))
            fehlt = 'ISNA(MATCH(Stichtag,RD_Kopf,0))'
            da = 'SUMPRODUCT((RD_Kopf>=%s)*(RD_Kopf<=Stichtag)*ISNUMBER(%s))>0' % (ab, zeile_w)
        ws.write_formula(z, 7, '=IF($F%d="automatisch",IF(%s,"automatisch",IF(%s,"erledigt","automatisch")),IF($F%d<>"ja",%s,'
                               'IF(%s,"keine Spalte",IF(%s,"erledigt","offen"))))' % (z + 1, fehlt, da, z + 1, sonst, fehlt, da), f_stat,
                         'nicht berichtet' if sonst != '""' and pfl != 'ja' else '')
        ws.write(z, ZU_VOLL, voll)
        ws.write(z, ZU_VOLL + 1, str(code or _rest[3] or ''))
        namen = pers.split(' / ') if pers else []
        for j in range(N_PERSONEN):
            gesetzt = j < len(personen) and personen[j] in namen
            ws.write(z, P_ERSTE + j, '●' if gesetzt else '', zelle)
    ende = 4 + len(aufbau)
    ws.conditional_format(4, 7, ende, 7, {'type': 'cell', 'criteria': '==', 'value': '"offen"',
                                          'format': ws_fmt(st, bg_color='#FBE9EB', font_color=ROT, bold=True)})
    ws.conditional_format(4, 7, ende, 7, {'type': 'cell', 'criteria': '==', 'value': '"erledigt"',
                                          'format': ws_fmt(st, bg_color='#DDF3E4', font_color='#1E7F4F', bold=True)})
    ws.conditional_format(4, 5, ende, 5, {'type': 'cell', 'criteria': '==', 'value': '"ja"',
                                          'format': ws_fmt(st, bg_color='#CCEBED', font_color=TEALD)})
    ws.conditional_format(4, 5, ende, 5, {'type': 'cell', 'criteria': '==', 'value': '"nein"', 'format': ws_fmt(st, font_color=GRAUM)})
    ws.conditional_format(4, 7, ende, 7, {'type': 'cell', 'criteria': '==', 'value': '"nicht berichtet"',
                                          'format': ws_fmt(st, font_color=GRAUM, italic=True)})
    for spalte in (5, 7):                            # BUE und MAK: Pflicht, aber automatisch (BUE-Reporting, Mig-Max-Liste)
        ws.conditional_format(4, spalte, ende, spalte, {'type': 'cell', 'criteria': '==', 'value': '"automatisch"',
                                                        'format': ws_fmt(st, font_color=TEALD, italic=True)})
    ws.conditional_format(4, P_ERSTE, ende, P_ERSTE + N_PERSONEN - 1, {'type': 'cell', 'criteria': '==', 'value': '"●"',
                                                                        'format': ws_fmt(st, bg_color='#CCEBED')})
    # Bearbeiten aktiv: freie Felder der Wertzeilen (Person vorhanden) gelb hinterlegt; Pflicht-Spalte ebenso
    ws.conditional_format(4, P_ERSTE, ende, P_ERSTE + N_PERSONEN - 1, {'type': 'formula', 'criteria': '=AND(ZuordnungOffen=1,$A5<>"",%s$4<>"")' % erste_p,
                                                                        'format': ws_fmt(st, bg_color='#FBEFC7')})
    ws.conditional_format(4, P_ERSTE, ende, P_ERSTE + N_PERSONEN - 1, {'type': 'formula', 'criteria': '=AND($A5<>"",%s$4="")' % erste_p,
                                                                        'format': ws_fmt(st, bg_color=GRAUXL)})
    ws.conditional_format(4, 5, ende, 6, {'type': 'formula', 'criteria': '=AND(ZuordnungOffen=1,$A5<>"")',
                                          'format': ws_fmt(st, border=2, border_color='#C99A00')})
    ws.set_column(0, 0, 6)
    ws.set_column(1, 1, 7)
    ws.set_column(2, 2, ZU_C_BREITE)
    ws.set_column(3, 3, 22)
    ws.set_column(4, 4, 24)
    ws.set_column(5, 5, 10.5)                        # „automatisch“ passt ganz
    ws.set_column(6, 6, 12.5)                        # „quartalsweise“ passt ganz
    ws.set_column(7, 7, 12)
    ws.set_column(P_ERSTE, P_ERSTE + N_PERSONEN - 1, 3.6)
    ws.set_column(ZU_VOLL, ZU_VOLL + 1, 40, None, {'hidden': True})
    ws.set_column(ZU_ART, ZU_ART, 6, None, {'hidden': True})
    ws.outline_settings(True, False, True, False)    # Plus/Minus am Themenband (oberhalb der Gruppe)
    ws.freeze_panes(4, 3)
    # Gesperrt: VBA schreibt mit UserInterfaceOnly (Workbook_Open, Blatt aktivieren); Gliederung bleibt bedienbar
    ws.protect('', {'select_locked_cells': True, 'select_unlocked_cells': True, 'format_columns': True, 'format_rows': True, 'objects': True})
    # KPI löschen neben „Zuständigkeiten bearbeiten“ (immer sichtbar; Karte mit Themen und KPIs, modKpiLoeschen)
    knopf(ws, 1010, 6, 130, 30, 'Zur Startseite', 'modStart.ZurStartseite', 'Start', art=2, groesse=9)
    knopf(ws, 1152, 6, 130, 30, 'KPI löschen', 'modKpiLoeschen.Zeigen', 'KpiLoeschen', art=2, groesse=9)
    knopf(ws, 1294, 6, 210, 30, 'Zuständigkeiten bearbeiten', 'modZuordnung.Bearbeiten', 'Bearbeiten', art=1, groesse=9)
    knopf(ws, 1294, 6, 210, 30, 'Fertig · sperren', 'modZuordnung.Sperren', 'Fertig', art=4, groesse=9, versteckt=True)
    knopf(ws, 1516, 6, 150, 30, 'Person hinzufügen', 'modZuordnung.PersonNeu', 'PersonNeu', art=2, groesse=9, versteckt=True)
    knopf(ws, 1678, 6, 150, 30, 'Person entfernen', 'modZuordnung.PersonEntfernen', 'PersonWeg', art=2, groesse=9, versteckt=True)
    ws.set_tab_color(PETROL)
    return zeilen, personen


def ws_fmt(st, **kw):
    return st.x(**kw)


def konfiguration(ws, st, personen, vorgabe=None):
    vorgabe = vorgabe or {}
    ws.write(0, 0, 'Konfiguration', st.titel)
    ws.write(1, 0, 'Weiße Felder mit Rahmen = Eingaben · graue Felder = berechnet', st.hinweis)
    ws.set_column(0, 0, 2)
    ws.set_column(1, 1, 38)
    ws.set_column(2, 2, 44)
    ws.set_column(3, 3, 3)
    ws.set_column(4, 4, 30)
    ws.set_column(5, 5, 26)
    ws.set_column(7, 8, 12)
    ws.write(2, 1, 'BERICHTSTAG', st.abschnitt)
    ws.write(3, 1, 'Berichtstag automatisch (Wochentag F4 nach dem Freitag der KW; Feiertag am Standort F5 → nächster Werktag)', st.text)
    wt = '{%s}' % ','.join('"%s"' % w for w in WOCHENTAGE)
    # Hilfszellen H4:I6 (Schrift grau): H4 Versatz Freitag -> Wochentag, H5 letzter Freitag bis heute, I4:I6 Meldetag der KW
    # mit Freitag H5-7, H5, H5+7 (vor der Umstellung F7 der Freitag selbst), H6 Stichtag = erste KW, deren Meldetag nicht vorbei ist
    ws.write(2, 7, 'Hilfswerte', st.hinweis)
    ws.write_formula(3, 7, '=MOD(IFERROR(MATCH($F$4,%s,0),1)-5,7)' % wt, st.hinweis)
    ws.write_formula(4, 7, '=TODAY()-MOD(WEEKDAY(TODAY(),2)-5,7)', st.calc_d)
    for i, versatz in enumerate(('-7', '', '+7')):
        f = '($H$5%s)' % versatz
        ws.write_formula(3 + i, 8, '=WORKDAY(%s+IF(%s+$H$4>=N($F$7),$H$4,0)-1,1,FeiertageBT)' % (f, f), st.calc_d)
    ws.write_formula(5, 7, '=IF($I$4>=TODAY(),$H$5-7,IF($I$5>=TODAY(),$H$5,$H$5+7))', st.calc_d)
    ws.write_formula(3, 2, '=IF($I$4>=TODAY(),$I$4,IF($I$5>=TODAY(),$I$5,$I$6))', st.calc_d)
    # H7: Stichtag bei Berichtstag von Hand (C5) = Freitag der juengsten KW, deren Meldetag (ohne Feiertagsverschiebung) am oder
    # vor C5 liegt: Montag 19.10. -> 16.10., Dienstag 30.03.2027 nach Ostermontag -> 26.03., Freitag 15.05. bei Donnerstag-
    # Himmelfahrt -> 08.05.; ein Freitag 16.10. von Hand (Wochentag Montag) meldet noch KW 41
    ws.write_formula(6, 7, '=IF(N($C$5)=0,"",$C$5-MOD(WEEKDAY($C$5,2)+2,7)-7*(($C$5-MOD(WEEKDAY($C$5,2)+2,7)'
                           '+IF($C$5-MOD(WEEKDAY($C$5,2)+2,7)+$H$4>=N($F$7),$H$4,0))>$C$5))', st.calc_d)
    ws.write(3, 4, 'Wochentag des Berichtstags', st.text)
    ws.write(3, 5, BERICHTSTAG_WT, st.ein_m)
    ws.data_validation(3, 5, 3, 5, {'validate': 'list', 'source': WOCHENTAGE})
    ws.write(4, 4, 'Feiertage nach Standort (Blatt Feiertage)', st.text)
    ws.write(4, 5, 'D', st.ein_m)
    ws.data_validation(4, 5, 4, 5, {'validate': 'list', 'source': ['K', 'D', 'M', 'HH', 'B', 'MA']})
    ws.write(5, 4, 'Spalte der gemeldeten KW in Rohdaten (ab KW 42 Montag)', st.text)
    ws.write_formula(5, 5, '=Stichtag', st.calc_d)
    ws.write(6, 4, 'Wochentag gilt ab (davor Meldung am Freitag)', st.text)
    ws.write_datetime(6, 5, dt.datetime.combine(UMSTELLUNG, dt.time()), st.ein_d)
    ws.write(4, 1, 'Berichtstag von Hand (leer = automatisch)', st.text)
    ws.write_blank(4, 2, None, st.ein_d)
    ws.write(5, 1, 'Berichtstag (verwendet)', st.text)
    ws.write_formula(5, 2, '=IF(C5<>"",C5,C4)', st.calc_dl)
    ws.write(7, 1, 'KACHELN', st.abschnitt)
    ws.write(8, 1, 'SLA Provisionsreklamation (Vorgänge)', st.text)
    ws.write_number(8, 2, vorgabe.get('C9') if isinstance(vorgabe.get('C9'), (int, float)) else 500, st.ein_z)
    ws.write(7, 4, 'SLA BÜ (RÜCKSTAND)', st.abschnitt)
    ws.write(8, 4, 'SLA Verbund (Vorgänge)', st.text)
    ws.write_number(8, 5, vorgabe.get('F9') if isinstance(vorgabe.get('F9'), (int, float)) else 5500, st.ein_z)
    ws.write(9, 4, 'SLA OPAG (Arbeitsgüter; leer = Vorschlag)', st.text)
    if isinstance(vorgabe.get('F10'), (int, float)):
        ws.write_number(9, 5, vorgabe['F10'], st.ein_z)
    else:
        ws.write_blank(9, 5, None, st.ein_z)
    ws.write(10, 4, 'SLA OPAG verwendet (Vorschlag = SLA Verbund × Faktor Ø OPAG/Verbund, TBC)', st.text)
    ws.write_blank(10, 5, None, st.calc_z)                # Formel nach den Datenreihen (braucht Dashboard_Daten)
    # Legendentexte der BUE-Kacheln (mit der Legende verknuepft; FIXED setzt den Tausenderpunkt der Excel-Sprache)
    tsd = lambda z: 'FIXED(%s,1)' % z  # noqa: E731     (in Tsd. wie die Saeulen)
    ws.write_formula(8, 6, '=IF(N(F9)>0,"SLA "&%s,"SLA: kein Wert")' % tsd('F9/1000'), st.calc)
    ws.write_blank(10, 6, None, st.calc)                  # Formel nach den Datenreihen (Faktor aus Dashboard_Daten)
    ws.write(9, 1, 'BÜ-Reporting-Datei (Knopf „BÜ-Reporting verknüpfen“)', st.text)
    ws.write(9, 2, vorgabe.get('C10') or BUE_DATEI, st.calc)   # Ablage laut Arbeitsfassung (WIP9: SharePoint BÜ - HS)
    ws.write(10, 1, 'ORDNER', st.abschnitt)
    ws.write(11, 1, 'Ordner dieser Datei (nur nötig bei OneDrive/SharePoint)', st.text)
    ws.write_blank(11, 2, None, st.ein)
    ws.write(12, 1, 'PowerPoint-Vorlage (leer = H:\\MaklerBUe\\Reporting MISO\\Vorlage\\ERGO_Vorlage.pptx; Knopf „Vorlage wählen …“ im PowerPoint-Fenster)', st.text)
    if vorgabe.get('C13'):
        ws.write(12, 2, vorgabe['C13'], st.ein)
    else:
        ws.write_blank(12, 2, None, st.ein)
    ws.write(13, 1, 'POWERPOINT · TITELFOLIE', st.abschnitt)
    ws.write(14, 1, 'Titel', st.text)
    ws.write(14, 2, TITEL, st.ein)
    ws.write(15, 1, 'Untertitel', st.text)
    ws.write(15, 2, UNTERTITEL, st.ein)
    ws.write(16, 1, 'Stand (berechnet)', st.text)
    ws.write_formula(16, 2, '="Stand  "&TEXT(DAY(Berichtstag),"00")&"."&TEXT(MONTH(Berichtstag),"00")&"."&YEAR(Berichtstag)', st.calc)
    ws.write(18, 1, 'POWERPOINT · DASHBOARD-FOLIEN', st.abschnitt)
    for c, t in enumerate(['Blatt', 'Überschrift (Titel der Folie)', '', 'Zeile über dem Titel', 'Im Export vorausgewählt']):
        if t:
            ws.write(19, 1 + c, t, st.kopf)
    for i, (blatt, titel, kicker, aus) in enumerate(FOLIEN):
        z = 20 + i
        ws.write(z, 1, blatt, st.calc)
        ws.write(z, 2, titel, st.ein if blatt != 'Deckblatt' else st.calc)
        ws.write(z, 4, kicker, st.ein)
        ws.write(z, 5, aus, st.ein_m)
        # Kicker mit Stand (fuer die Kopfzeile im Blatt und auf der Folie)
        ws.write_formula(z, 6, '=E%d&IF(E%d="","","  ·  ")&"STAND "&TEXT(DAY(Berichtstag),"00")&"."&TEXT(MONTH(Berichtstag),"00")&"."&YEAR(Berichtstag)'
                         % (z + 1, z + 1), st.klein)
    ws.data_validation(20, 5, 19 + len(FOLIEN), 5, {'validate': 'list', 'source': ['ja', 'nein']})
    ws.write(24, 1, 'Fußnote der Dashboard-Folien (berechnet)', st.text)   # Konfiguration!C25
    dat = lambda z: 'TEXT(DAY(%s),"00")&"."&TEXT(MONTH(%s),"00")&"."&YEAR(%s)' % (z, z, z)  # noqa: E731
    mon = '"Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"'
    letzter_monat = 'Dashboard_Daten!$%s$4' % xl_col_to_name(M0 + N_MONATE - 1)
    ws.write_formula(24, 2, '="Wochenwerte: je Kachel die letzten KW mit Daten, höchstens bis KW "&ISOWEEKNUM(KWFreitag)&" (Berichtstag "&%s'
                            '&")  ·  Monatswerte bis "&CHOOSE(MONTH(%s),%s)&" "&YEAR(%s)'
                            '&"  ·  MAK bis "&CHOOSE(MONTH(Berichtstag),%s)&" "&YEAR(Berichtstag)&" und Plan Jan "&RIGHT(YEAR(Berichtstag)+1,2)&"/"&RIGHT(YEAR(Berichtstag)+2,2)'
                     % (dat('Berichtstag'), letzter_monat, mon, letzter_monat, mon), st.calc)
    ws.write(25, 1, 'PERSONEN (Startassistent)', st.abschnitt)
    ws.write(26, 1, 'Wer im Assistenten zur Auswahl steht (alphabetisch). Hinzufügen und Entfernen im Blatt Zuständigkeiten; Umbenennen hier.', st.hinweis)
    for i in range(30):
        p = personen[i] if i < len(personen) else None
        if p:
            ws.write(27 + i, 1, p, st.ein)
        else:
            ws.write_blank(27 + i, 1, None, st.ein)
    ws.write(58, 1, 'Zuordnung in Bearbeitung (1 = ja; „Zuständigkeiten bearbeiten“ / „Fertig“)', st.text)
    ws.write_number(58, 2, 0, st.calc)
    # Knopf „Werte aus HS-Dashboard 2025“ (modAltWerte): gemerkte Datei C62, Ergebnis der letzten Uebernahme C63
    ws.write(60, 1, 'HS-DASHBOARD 2025 · WERTE HOLEN', st.abschnitt)
    ws.write(61, 1, 'HS-Dashboard 2025 (Werte holen)', st.text)
    if vorgabe.get('C62'):
        ws.write(61, 2, vorgabe['C62'], st.ein)
    else:
        ws.write_blank(61, 2, None, st.ein)
    ws.write(62, 1, 'Zuletzt übernommen (setzt das Makro)', st.text)
    ws.write_blank(62, 2, None, st.calc)
    ws.write(63, 1, 'Datei oder Browser-Adresse; leer = im Ordner dieser Datei „2025_Dashboard HS.xlsm“ suchen. Bestandsübertragung bleibt '
                    'unberührt (kommt automatisch aus dem BÜ-Reporting).', st.hinweis)
    ws.set_tab_color(PETROL)


def kommentare_blatt(ws, st, kom):
    ws.write(0, 0, 'Kommentare', st.titel)
    ws.write(1, 0, 'Je Kachel ein Kommentar für das graue Feld der Folie. Am einfachsten über „Kommentare bearbeiten“ im PPT-Blatt. '
                   'Jede Zeile wird ein Punkt („•“ davor ist erlaubt), Zeilen mit „–“ oder „-“ am Anfang werden Unterpunkte. Leerer Text = Kachel erscheint nicht im Kommentarfeld.', st.hinweis)
    for c, t in enumerate(['Blatt', 'Kachel', 'Nr. im Kommentarfeld', 'Überschrift', 'Text', 'Kachel (zur Orientierung)']):
        ws.write(3, c, t, st.kopf)
    ws.set_row(3, 28)
    z = 4
    for blatt, titel in KACHELN.items():
        for i, t in enumerate(titel):
            nr, ueb, text = kom.get((blatt, i + 1), (str(i + 1), t, ''))
            ws.write(z, 0, blatt, st.calc)
            ws.write_number(z, 1, i + 1, st.calc)
            ws.write_string(z, 2, nr, st.ein_m)
            ws.write(z, 3, ueb, st.ein)
            ws.write(z, 4, text, st.ein_w)
            ws.write(z, 5, t, st.calc)
            zeilen = max(1, textzeilen(text, 95))
            ws.set_row(z, min(300, 15 * zeilen + 4))
            z += 1
    ws.set_column(0, 0, 8)
    ws.set_column(1, 1, 7)
    ws.set_column(2, 2, 11)
    ws.set_column(3, 3, 34)
    ws.set_column(4, 4, 100)
    ws.set_column(5, 5, 30)
    ws.freeze_panes(4, 0)
    ws.set_tab_color(PETROL)
    return z


def uebersicht(ws, st, q, L):
    rd = q['Rohdaten']
    cz, cz2 = rd.code_zeilen(), L.code_zeilen()
    ws.hide_gridlines(2)
    ws.write(0, 1, 'HR Sales · Übersicht', st.titel)
    ws.write_formula(1, 1, '="Letzter und davor liegender Eintrag je Kennzahl · Berichtstag "&TEXT(DAY(Berichtstag),"00")&"."&TEXT(MONTH(Berichtstag),"00")&"."&YEAR(Berichtstag)',
                     st.untertitel)
    for c, t in enumerate(['Code', 'Kennzahl', 'Letzter Eintrag', 'Wert', 'Davor', 'Wert', 'Veränderung']):
        ws.write(3, 1 + c, t, st.kopf if c < 2 else st.kopf_z)
    ws.set_row(3, 22)
    z = 4
    for code, text in q['Uebersicht_codes']:
        if code.lower() in cz:
            r, k, letzte = cz[code.lower()], 1, xl_col_to_name(max(rd.datumsspalten()) - 1)
            erste = 'I'
        elif code.lower() in cz2:                    # Monatsblock: Kopfzeile des Blocks
            (r, k), erste, letzte = cz2[code.lower()], xl_col_to_name(L.erste - 1), xl_col_to_name(L.letzte - 1)
        else:
            continue
        zeile = 'Rohdaten!$%s$%d:$%s$%d' % (erste, r, letzte, r)
        kopf = 'Rohdaten!$%s$%d:$%s$%d' % (erste, k, letzte, k)
        zr = z + 1
        ws.write(z, 1, code, st.x(bold=True, font_color=SW, border=1, border_color=GRAUL))
        ws.write(z, 2, text, st.x(font_color=SW, border=1, border_color=GRAUL))
        ws.write_array_formula(z, 3, z, 3, '{=IFERROR(LOOKUP(2,1/(ISNUMBER(%s)*ISNUMBER(%s)),%s),"")}' % (zeile, kopf, kopf), st.calc_d)
        ws.write_formula(z, 4, '=IF(D%d="","",INDEX(%s,MATCH(D%d,%s,0)))' % (zr, zeile, zr, kopf), st.calc_z)
        ws.write_array_formula(z, 5, z, 5, '{=IF(D%d="","",IFERROR(LOOKUP(2,1/(ISNUMBER(%s)*ISNUMBER(%s)*(%s<D%d)),%s),""))}'
                               % (zr, zeile, kopf, kopf, zr, kopf), st.calc_d)
        ws.write_formula(z, 6, '=IF(F%d="","",INDEX(%s,MATCH(F%d,%s,0)))' % (zr, zeile, zr, kopf), st.calc_z)
        ws.write_formula(z, 7, '=IF(OR(E%d="",G%d=""),"",E%d-G%d)' % (zr, zr, zr, zr),
                         st.x(bg_color=GRAUXL, border=1, border_color=GRAUL, num_format='[Red]+#,##0;[Color10]-#,##0;0', align='right'))
        z += 1
    ws.conditional_format(4, 3, z - 1, 3, {'type': 'formula', 'criteria': '=AND(ISNUMBER($D5),$D5<VorStichtag)',
                                            'format': ws_fmt(st, font_color=GRAUM, italic=True)})
    ws.write(z + 1, 1, 'Grau und kursiv = letzter Eintrag älter als die Vorwoche der gemeldeten KW. Rot = gestiegen, grün = gesunken.', st.hinweis)
    ws.set_column(0, 0, 2)
    ws.set_column(1, 1, 7)
    ws.set_column(2, 2, 52)
    ws.set_column(3, 8, 14)
    ws.freeze_panes(4, 0)
    ws.set_tab_color('#3B4F8A')


def bue_serviceparameter(ws, st, rd):
    cz = rd.code_zeilen()
    ws.hide_gridlines(2)
    ws.write(0, 1, 'BÜ-Serviceparameter · Verbund und OPAG am Berichtstag', st.titel)
    ws.write_formula(1, 1, '="Werte aus Rohdaten (Zeilen 7VA bis 7OL) · KW "&ISOWEEKNUM(KWFreitag)&" (Stand "&TEXT(DAY(Stichtag),"00")&"."&TEXT(MONTH(Stichtag),"00")&".) · Berichtstag "&TEXT(DAY(Berichtstag),"00")&"."&TEXT(MONTH(Berichtstag),"00")&"."&YEAR(Berichtstag)',
                     st.untertitel)

    def wert(code, vorwoche=False):
        r = cz[code.lower()]
        tag = 'VorStichtag' if vorwoche else 'Stichtag'
        idx = 'INDEX(Rohdaten!$A$%d:$%s$%d,MATCH(%s,RD_Kopf,0))' % (r, RD_LETZTE, r, tag)
        return '=IFERROR(IF(ISNUMBER(%s),%s,"–"),"–")' % (idx, idx)
    for blk, (titel, pre) in enumerate((('VERBUND · Vorgänge', '7V'), ('OPAG · Arbeitsgüter', '7O'))):
        c0 = 1 + blk * 6
        ws.write(3, c0, titel, st.abschnitt)
        for i, t in enumerate(['Kennzahl', 'Gesamt', 'Gesundheit', 'Komposit', 'Leben']):
            ws.write(4, c0 + i, t, st.kopf if i == 0 else st.kopf_z)
        for j, (zeile, codes) in enumerate((('Rückstand', 'ABCD'), ('Eingänge', 'EFGH'), ('Abgänge', 'IJKL'))):
            ws.write(5 + j, c0, zeile, st.calc)
            for i, ch in enumerate(codes):
                ws.write_formula(5 + j, c0 + 1 + i, wert(pre + ch), st.calc_z)
        ws.write(9, c0, 'Veränderung Rückstand zur Vorwoche', st.calc)
        a = xl_rowcol_to_cell(5, c0 + 1)
        ws.write_formula(9, c0 + 1, '=IFERROR(%s-%s,"–")' % (a, wert(pre + 'A', True)[1:]),
                         st.x(bg_color=GRAUXL, border=1, border_color=GRAUL, num_format='[Red]+#,##0;[Color10]-#,##0;0', align='right'))
    ws.write(11, 1, 'Leere Felder („–“) füllen sich, sobald die Werte in Rohdaten stehen.', st.hinweis)
    ws.set_column(0, 0, 2)
    for c0 in (1, 7):
        ws.set_column(c0, c0, 34)
        ws.set_column(c0 + 1, c0 + 4, 12)
    ws.set_column(6, 6, 3)
    ws.set_tab_color(GRAUM)


def feiertage(ws, st, daten):
    for r, zeile in enumerate(daten):
        for c, v in enumerate(zeile):
            if v is None:
                continue
            if isinstance(v, dt.datetime):
                ws.write_datetime(r, c, v, st.datum)
            elif isinstance(v, str):
                ws.write(r, c, v.replace('\xa0', ' ').strip(), st.text if r > 1 else st.kopf)
            else:
                ws.write(r, c, v, st.text)
    # Hilfsspalte T (Name FeiertageBT): Feiertage am Standort laut Konfiguration F5, Block 2026 (E:J) und darunter 2027 (M:R);
    # 0 statt leer, damit WORKDAY rechnen kann. Das Datum kommt aus der Berechnungsspalte (D bzw. L): in M:R stehen die von Ostern
    # abhaengigen Tage 2027 eine Woche zu spaet, die Standortspalte zeigt nur an, ob der Tag dort gilt.
    ws.write(1, 19, 'Für den Berichtstag (Standort Konfiguration F5)', st.kopf)
    for i in range(2, 29):
        ws.write_formula(i, 19, '=IFERROR(IF(LEN(INDEX($E%d:$J%d,MATCH(Konfiguration!$F$5,$E$2:$J$2,0)))>0,$D%d*1,0),0)' % (i + 1, i + 1, i + 1), st.datum)
        ws.write_formula(i + 27, 19, '=IFERROR(IF(LEN(INDEX($M%d:$R%d,MATCH(Konfiguration!$F$5,$M$2:$R$2,0)))>0,$L%d*1,0),0)' % (i + 1, i + 1, i + 1), st.datum)
    ws.set_column(0, 0, 28)
    ws.set_column(1, 20, 11)
    ws.set_column(19, 19, 16)
    ws.set_tab_color(GRAUM)


def startseite(ws, st, personen, d):
    """Startseite im festen Raster: Zeile 0 = 12 px, Zeile 1 = 44 px (Titel), ab Zeile 2 je 22 px."""
    def y(r):
        return 12 + 44 + 22 * (r - 2)
    ws.hide_gridlines(2)
    ws.set_default_row(16.5)
    ws.set_row(0, 9)
    ws.set_row(1, 33)
    for c, w in ((0, 3), (1, 34), (2, 12), (3, 10), (4, 3), (5, 3), (6, 24), (7, 11), (8, 11), (9, 12)):
        ws.set_column(c, c, w)
    ws.write(1, 1, 'HR Sales Dashboard', st.x(font_size=24, bold=True, font_color=ROT, valign='vcenter'))
    ws.write_formula(2, 1, '=Konfiguration!C16', st.untertitel)
    ws.write(4, 1, 'BERICHTSTAG', st.abschnitt)
    ws.merge_range(5, 1, 5, 2, '', st.calc_dl)
    ws.write_formula(5, 1, '=Berichtstag', st.calc_dl)
    ws.write_formula(5, 3, '="KW "&ISOWEEKNUM(KWFreitag)', st.x(bold=True, font_color=TEALD, font_size=11, valign='vcenter', indent=1))
    ws.write_formula(6, 1, '=IF(Konfiguration!C5="","automatisch: nächster "&Konfiguration!F4,"von Hand gesetzt (Konfiguration C5)")&" · Werte der KW "&'
                           'ISOWEEKNUM(KWFreitag)&" (Stand "&TEXT(DAY(Stichtag),"00")&"."&TEXT(MONTH(Stichtag),"00")&".)"', st.hinweis)
    knopf(ws, 26, y(7) + 6, 36, 28, '◀', 'modStart.BerichtstagZurueck', 'Zurueck', art=2)
    knopf(ws, 68, y(7) + 6, 36, 28, '▶', 'modStart.BerichtstagVor', 'Vor', art=2)
    knopf(ws, 110, y(7) + 6, 110, 28, 'Automatisch', 'modStart.BerichtstagAuto', 'Auto', art=2, groesse=8.5)
    knopf(ws, 26, y(10), 332, 60, 'Start  ·  Werte eintragen', 'modStart.Start', 'Start', art=1, groesse=13)
    ws.write(13, 1, 'Wer bist du? Der Assistent führt dich zu deinen offenen Werten.', st.hinweis)
    knopf(ws, 26, y(15), 160, 32, 'Kommentare', 'modKommentar.ZeigenAuswahl', 'Kommentare', art=2)
    knopf(ws, 198, y(15), 160, 32, 'PowerPoint erzeugen', 'modPPT.Zeigen', 'PPT', art=4)
    knopf(ws, 26, y(17), 160, 32, 'Übersicht', 'modStart.ZurUebersicht', 'Uebersicht', art=2)
    knopf(ws, 198, y(17), 160, 32, 'Rohdaten', 'modStart.ZuRohdaten', 'Rohdaten', art=2)
    knopf(ws, 26, y(19), 160, 32, 'Zuordnung anpassen', 'modStart.ZurZuordnung', 'Zuordnung', art=2, groesse=9)
    knopf(ws, 198, y(19), 160, 32, 'BÜ-Datei verknüpfen', 'modVerknuepfung.Verknuepfen', 'BUE', art=2, groesse=9)
    # PowerPoint-Vorlage: Pfad wird in Konfiguration!C13 gespeichert und beim Export verwendet
    knopf(ws, 26, y(21), 160, 32, 'PPT-Vorlage verknüpfen', 'modPPT.VorlageVonStart', 'Vorlage', art=2, groesse=9)
    # Einmalig: Zahlen der uebrigen Kennzahlen (nicht BUE) aus dem bisherigen Dashboard holen (modAltWerte); Datei in Konfiguration!C62
    knopf(ws, 198, y(21), 160, 32, 'Werte aus\nHS-Dashboard 2025', 'modAltWerte.Zeigen', 'AltWerte', art=2, groesse=8.5, rand0=True)
    ws.write_formula(23, 1, '=IF(Konfiguration!C10="","Noch keine BÜ-Datei verknüpft.","BÜ-Datei: "&Konfiguration!C10)', st.hinweis)
    ws.write_formula(24, 1, '=IF(Konfiguration!C13="","PPT-Vorlage: Vorlage\\ERGO_Vorlage.pptx neben dieser Datei","PPT-Vorlage: "&Konfiguration!C13)', st.hinweis)
    # C63 = „N Werte übernommen am TT.MM.JJJJ hh:mm“ (kurz, damit der Text vor der Personentabelle in Spalte G endet); C62 allein
    # heißt nur „Datei gemerkt“ (Trockenlauf oder Abbrechen), nicht „übernommen“
    ws.write_formula(25, 1, '=IF(Konfiguration!C63<>"","HS-Dashboard 2025: "&Konfiguration!C63,IF(Konfiguration!C62="","HS-Dashboard 2025: '
                            'noch nichts übernommen.","HS-Dashboard 2025: noch nichts übernommen (Datei gemerkt)."))', st.hinweis)
    ws.write(27, 1, 'SO FUNKTIONIERT ES', st.abschnitt)
    for i, t in enumerate(['1  Start klicken und dich auswählen.',
                           '2  Der Assistent zeigt die Zelle und fragt im Fenster.',
                           '3  Wert eintippen und „Übernehmen“ klicken.',
                           '4  Kommentare pflegen, PowerPoint erzeugen.']):
        ws.write(28 + i, 1, t, st.text)
    # Status je Person
    # Hinweise ueber der Tabelle (darunter stuenden sie je nach Zahl der Personen weit weg, daneben fehlt der Platz)
    T0 = 9                                               # erste Tabellenzeile (0-basiert): Excel-Zeile 10, Kopf in Zeile 9
    ws.write(4, 6, 'STAND DER WERTE FÜR DEN BERICHTSTAG', st.abschnitt)
    ws.write(5, 6, 'Personen ohne Pflichtwerte erscheinen nicht („Zuordnung anpassen“).', st.hinweis)
    ws.write(6, 6, 'BÜ Verbund und OPAG: je ein Wert bei der BÜ-zuständigen Person.', st.hinweis)
    ws.write(7, 6, 'Mehrere Zuständige: je Person gezählt, in „Gesamt (Werte)“ einmal.', st.hinweis)
    for c, t in enumerate(['Person', 'Offen', 'Erledigt', 'Pflichtwerte']):
        ws.write(T0 - 1, 6 + c, t, st.kopf if c == 0 else st.kopf_z)
    pf = 'Zuständigkeiten!$F$5:$F$400'
    sz = 'Zuständigkeiten!$H$5:$H$400'
    zc = 'Zuständigkeiten!$B$5:$B$400'
    # BUE Verbund und OPAG: je ein Pflichtwert bei der Person mit den Punkten auf den BUE-Zeilen (Zuordnung, heute Amend). Erledigt,
    # sobald das BUE-Reporting die KW des Berichtstags liefert (automatisch, „BÜ-Datei verknüpfen“). Hilfszellen in Dashboard_Daten:
    # BUE_V_OK / BUE_O_OK (1 = KW des Berichtstags da) und BUE_V_TEXT / BUE_O_TEXT (Hinweis fuer den Assistenten)
    a, e = xl_col_to_name(W0), xl_col_to_name(W0 + N_WOCHEN - 1)
    d.bue = {}
    for pre, q in (('7V', 'BÜ Verbund'), ('7O', 'BÜ OPAG')):
        f = d.fen[pre]
        L = f['L']
        hilf = '$%s$%d:$%s$%d' % (a, f['h'] + 1, e, f['h'] + 1)
        kw = 'ISOWEEKNUM(INDEX($%s$4:$%s$4,%s)-MOD(WEEKDAY(INDEX($%s$4:$%s$4,%s),2)+2,7))' % (a, e, L, a, e, L)
        stand = d.stand_zelle(pre, [pre + c for c in 'ABCDEFGHIJKL'])[0]
        r = d._kopf('_BUE' + pre, '%s: KW des Berichtstags da (1/0) und Hinweis (Startseite, Assistent)' % q, 'Start')
        d.ws.write_formula(r, W0, '=IF(N(INDEX(%s,%d))>0,1,0)' % (hilf, N_WOCHEN), d.st.zahl)
        d.ws.write_formula(r, W0 + 1, '=IF(MAX(%s)=0,"noch keine Werte – „BÜ-Datei verknüpfen“",IF(%s=1,"da · KW "&%s&" · "&%s,'
                                      '"fehlt für KW "&ISOWEEKNUM(KWFreitag)&" · zuletzt KW "&%s&" · "&%s))'
                           % (hilf, xl_rowcol_to_cell(r, W0, True, True), kw, stand, kw, stand), d.st.text)
        d.bue[pre] = (xl_rowcol_to_cell(r, W0, True, True), xl_rowcol_to_cell(r, W0 + 1, True, True))
    # Nur Personen mit mindestens einem Pflichtwert, in der Reihenfolge der Konfiguration und ohne Luecken, darunter Gesamt.
    # Hilfsspalten U:AA (ausgeblendet), je Person der Konfiguration eine Zeile (7..36): U Name, V Offen, W Erledigt, X Pflichtwerte,
    # Y 1 = hat Pflichtwerte, Z laufende Nummer unter diesen; Z5 = ihre Zahl. Die Tabelle G10:J40 holt Zeile j ueber die Nummer
    # (INDEX/MATCH, keine dynamischen Arrays); AA = Art der Tabellenzeile (P Person, G Gesamt, leer) fuer die bedingten Formate.
    H_NAME, H_OFFEN, H_ERL, H_PFL, H_HAT, H_NR, H_ART = range(20, 27)
    hb = lambda c: '$%s$7:$%s$%d' % (xl_col_to_name(c), xl_col_to_name(c), 6 + N_PERSONEN)  # noqa: E731
    anzahl = '$%s$5' % xl_col_to_name(H_NR)
    ws.write(3, H_NAME, 'Hilfsspalten (Stand der Werte)', st.klein)
    ws.write(4, H_HAT, 'Anzahl', st.klein)
    ws.write_formula(4, H_NR, '=SUM(%s)' % hb(H_HAT), st.zahl)
    for c, t in ((H_NAME, 'Name'), (H_OFFEN, 'Offen'), (H_ERL, 'Erledigt'), (H_PFL, 'Pflicht'), (H_HAT, 'hat Pflicht'), (H_NR, 'Nr.'), (H_ART, 'Art')):
        ws.write(5, c, t, st.klein)
    for i in range(N_PERSONEN):
        z = 6 + i
        p = 'Konfiguration!$B$%d' % (28 + i)
        ws.write_formula(z, H_NAME, '=IF(%s="","",%s)' % (p, p))
        name = '$%s%d' % (xl_col_to_name(H_NAME), z + 1)
        spalte = 'Zuständigkeiten!$%s$5:$%s$400' % ((xl_col_to_name(P_ERSTE + i),) * 2)      # Punkte dieser Person
        zust = {pre: 'COUNTIFS(%s,"●",%s,"%s?")>0' % (spalte, zc, pre) for pre in ('7V', '7O')}      # Punkte auf BUE-Zeilen
        for c, krit, bue in ((H_OFFEN, ',%s,"offen"' % sz, '1-BUE_%s_OK'), (H_ERL, ',%s,"erledigt"' % sz, 'BUE_%s_OK'), (H_PFL, '', '1')):
            plus = ''.join('+IF(%s,%s,0)' % (zust[pre], bue % pre[1] if '%s' in bue else bue) for pre in ('7V', '7O'))
            ws.write_formula(z, c, '=IF(%s="","",COUNTIFS(%s,"●",%s,"ja"%s)%s)' % (name, spalte, pf, krit, plus))
        ws.write_formula(z, H_HAT, '=IF(AND(%s<>"",N(%s%d)>0),1,0)' % (name, xl_col_to_name(H_PFL), z + 1))
        ws.write_formula(z, H_NR, '=IF(%s%d=1,SUM($%s$7:%s%d),"")' % (xl_col_to_name(H_HAT), z + 1, xl_col_to_name(H_HAT), xl_col_to_name(H_HAT), z + 1))
    # Gesamt (Werte): jeder Pflichtwert einmal, gleich wie viele Personen ihn liefern. Nur Pflicht „ja“ zaehlen – die BUE-Zeilen
    # (Pflicht „automatisch“, Status „erledigt“, sobald das BUE-Reporting die KW liefert) stecken in den +2 von Verbund und OPAG
    gesamt = {7: 'COUNTIFS(%s,"ja",%s,"offen")+(1-BUE_V_OK)+(1-BUE_O_OK)' % (pf, sz),
              8: 'COUNTIFS(%s,"ja",%s,"erledigt")+BUE_V_OK+BUE_O_OK' % (pf, sz),
              9: 'COUNTIF(%s,"ja")+2' % pf}
    f_name = st.x(font_size=9.5, valign='vcenter')
    f_zahl = st.x(font_size=9.5, valign='vcenter', num_format='#,##0', align='right')
    for j in range(1, N_PERSONEN + 2):                   # Tabellenzeilen 10..40: Personen, dann Gesamt (Werte)
        z = T0 - 1 + j
        art = '$%s%d' % (xl_col_to_name(H_ART), z + 1)
        ws.write_formula(z, H_ART, '=IF(%d<=%s,"P",IF(%d=%s+1,"G",""))' % (j, anzahl, j, anzahl))
        such = 'MATCH(%d,%s,0)' % (j, hb(H_NR))
        ws.write_formula(z, 6, '=IF(%s="P",INDEX(%s,%s),IF(%s="G","Gesamt (Werte)",""))' % (art, hb(H_NAME), such, art), f_name)
        for c, h in ((7, H_OFFEN), (8, H_ERL), (9, H_PFL)):
            ws.write_formula(z, c, '=IF(%s="P",INDEX(%s,%s),IF(%s="G",%s,""))' % (art, hb(h), such, art, gesamt[c]), f_zahl)
    ende = T0 + N_PERSONEN
    e1 = T0 + 1                                          # Excel-Zeile der ersten Tabellenzeile (relative Bezuege der Formate)
    a = '$%s%d' % (xl_col_to_name(H_ART), e1)
    ws.conditional_format(T0, 7, ende, 7, {'type': 'formula', 'criteria': '=AND(%s="P",N($H%d)>0)' % (a, e1),
                                          'format': ws_fmt(st, font_color=ROT, bold=True, bg_color='#FBE9EB', border=1, border_color=GRAUL)})
    ws.conditional_format(T0, 6, ende, 9, {'type': 'formula', 'criteria': '=%s="P"' % a,
                                          'format': ws_fmt(st, bg_color=GRAUXL, border=1, border_color=GRAUL)})
    ws.conditional_format(T0, 7, ende, 7, {'type': 'formula', 'criteria': '=AND(%s="G",N($H%d)>0)' % (a, e1),
                                          'format': ws_fmt(st, font_color=ROT, bold=True, top=1, top_color=GRAUM)})
    ws.conditional_format(T0, 6, ende, 9, {'type': 'formula', 'criteria': '=%s="G"' % a, 'format': ws_fmt(st, bold=True, top=1, top_color=GRAUM)})
    ws.set_column(H_NAME, H_ART, 10, None, {'hidden': True})
    ws.set_tab_color(ROT)


# ------------------------------------------------------------------ Aufbau
def bauen(vba_bin):
    q = quelle_lesen.lesen()
    rd = q['Rohdaten']
    # Formelzeilen (Summen, Abgänge) in die kommenden KW fortschreiben: Pflicht liegt dann auf den Eingaben, die Kachel rechnet
    fortgeschrieben = formeln_fortschreiben(rd)
    FORMEN.clear()
    VERZEICHNIS.clear()
    PV.clear()
    wb = xlsxwriter.Workbook(OUT, {'use_future_functions': True})
    wb.formats[0].set_font_name(FONT)
    wb.formats[0].set_font_size(10)
    wb.set_vba_name('ThisWorkbook')
    wb.add_vba_project(vba_bin)
    st = Stil(wb)
    namen = ['Start', 'Übersicht', 'Deckblatt', 'PPT_2', 'PPT_3', 'Rohdaten', 'Kommentare', 'Zuständigkeiten',
             'Konfiguration', 'BUE_Serviceparameter', 'Dashboard_Daten', 'Feiertage', 'Wertstand']
    vba = {'Start': 'Start', 'Übersicht': 'Uebersicht', 'Rohdaten': 'Rohdaten', 'Zuständigkeiten': 'Zustaendigkeiten'}
    ws = {}
    for n in namen:
        ws[n] = wb.add_worksheet(n)
        ws[n].set_vba_name(vba.get(n, n))
    wb.define_name('Berichtstag', '=Konfiguration!$C$6')
    # Stichtag: automatisch der Freitag der gemeldeten KW (Konfiguration H6); Berichtstag von Hand -> KW mit Meldetag am oder vor C5 (H7)
    wb.define_name('KWFreitag', '=IF(N(Konfiguration!$C$5)>0,Konfiguration!$H$7,Konfiguration!$H$6)')
    # Stichtag = Wochenspalte der gemeldeten KW in Rohdaten: bis KW 41 der Freitag, danach der Montag (Meldetag) – die Spalte mit
    # Datum vom Freitag der KW bis 6 Tage danach; VorStichtag = die Wochenspalte davor
    wb.define_name('Stichtag', '=IFERROR(1/(1/_xlfn.MAXIFS(RD_Kopf,RD_Kopf,">="&KWFreitag,RD_Kopf,"<"&KWFreitag+7)),KWFreitag)')
    wb.define_name('VorStichtag', '=IFERROR(1/(1/_xlfn.MAXIFS(RD_Kopf,RD_Kopf,"<"&Stichtag)),Stichtag-7)')
    wb.define_name('FeiertageBT', '=Feiertage!$T$3:$T$58')
    wb.define_name('SLA_PV', '=Konfiguration!$C$9')
    wb.define_name('RD_Kopf', '=Rohdaten!$A$1:$%s$1' % RD_LETZTE)
    wb.define_name('Personen', '=Konfiguration!$B$28:$B$57')
    wb.define_name('ZuordnungOffen', '=Konfiguration!$C$59')

    # Erst Datenreihen und Kacheln: aus ihnen ergibt sich, welche Rohdaten-Zeilen auf PPT_2/PPT_3 berichtet werden (Pflicht,
    # Einklappen in Zustaendigkeiten und Rohdaten)
    L = MonatsLayout(q, rd)
    wb.define_name('RD_Monate', '=Rohdaten!$A$%d:$%s$%d' % (L.bloecke[0]['kopf'], RD_LETZTE, L.bloecke[0]['kopf']))
    d = Daten(ws['Dashboard_Daten'], st, rd, L)
    daten_reihen(d)
    kom = kommentare_aus_quelle(q)
    ppt_titel(ws['Deckblatt'], wb, st)
    for blatt, zeile, baue in (('PPT_2', 22, ppt_serviceparameter), ('PPT_3', 23, ppt_externe)):
        folie_rahmen(ws[blatt], wb, st, blatt, '$G$%d' % zeile, '$C$%d' % zeile, FARBE_BLATT[blatt])
        d.blatt = blatt                                   # Reihen der Kacheln dieses Blatts merken (Daten.benutzt)
        baue(ws[blatt], wb, d)
        d.blatt = None
        eintraege = []
        for i, t in enumerate(KACHELN[blatt]):
            nr, ueb, text = kom.get((blatt, i + 1), (str(i + 1), t, ''))
            if text.strip():
                eintraege.append((nr, ueb, text))
        panel_vorschau(ws[blatt], blatt, eintraege)
    kern, berichtet = berichtete_zeilen(rd, d)
    BERICHTET.clear()
    BERICHTET.update(kern=kern, menge=berichtet, fortgeschrieben=fortgeschrieben)
    zuordnung = dict(q.get('Zuordnung') or {})
    for schl, pers in (q.get('ZuordnungMonat') or {}).items():       # Punkte auf Zeilen der Monatsbloecke (WIP12)
        if schl in L.zeile:
            zuordnung[L.zeile[schl]] = pers
    zust, personen = zustaendigkeiten(ws['Zuständigkeiten'], st, rd, berichtet | {r for r in kern if r > rd.zeilen} | d.monat_neben, L,
                                      zuordnung, q.get('Personen', ()), q.get('Zyklus') or {})
    pflicht_pruefen(rd, kern, zust)
    konfiguration(ws['Konfiguration'], st, personen, q.get('Konfig', {}))
    rohdaten(wb, ws['Rohdaten'], st, rd, berichtet, L)
    BERICHTET['gruppen'] = rohdaten.gruppen
    BERICHTET['zust'] = zust
    BERICHTET['monat_neben'] = {blk['kopf'] for blk in L.bloecke} | d.monat_neben    # Kopfzeilen der Monatsbloecke, 18E
    BERICHTET['alt_neben'] = set(d.alt_neben)
    wertstand(ws['Wertstand'], st, rd)
    ws['Konfiguration'].write_formula(10, 5, '=IF(N(F10)>0,F10,IFERROR(ROUND(F9*_xlfn.AGGREGATE(1,6,%s),-2),""))' % d.ref('7_quote'), st.calc_z)
    # Legendentext SLA OPAG: fester Wert, sonst Vorschlag mit dem Faktor OPAG/Verbund und "TBC" (to be confirmed)
    ws['Konfiguration'].write_formula(10, 6, '=IF(N(F11)>0,IF(N(F10)>0,"SLA "&FIXED(F11/1000,1),"SLA "&FIXED(F11/1000,1)&" (Faktor "&'
                                      'FIXED(_xlfn.AGGREGATE(1,6,%s),2)&") TBC"),"SLA OPAG: noch kein Vorschlag")' % d.ref('7_quote'), st.calc)
    ws['Dashboard_Daten'].set_tab_color(GRAUM)
    kommentare_blatt(ws['Kommentare'], st, kom)
    uebersicht(ws['Übersicht'], st, q, L)
    bue_serviceparameter(ws['BUE_Serviceparameter'], st, rd)
    feiertage(ws['Feiertage'], st, q['Feiertage'])
    startseite(ws['Start'], st, personen, d)
    for pre, nm in (('7V', 'V'), ('7O', 'O')):
        wb.define_name('BUE_%s_OK' % nm, '=Dashboard_Daten!%s' % d.bue[pre][0])
        wb.define_name('BUE_%s_TEXT' % nm, '=Dashboard_Daten!%s' % d.bue[pre][1])
    d.fenster_abschliessen()
    verzeichnis_schreiben(d)
    for blatt in ('Deckblatt', 'PPT_2', 'PPT_3'):
        ws[blatt].set_tab_color(ROT)
        ws[blatt].set_zoom(90)
    ws['Start'].activate()
    wb.close()


# ------------------------------------------------------------------ Nachbearbeitung (Namen, Formen, Makros, externe Verknuepfung)
def folien_zeichnungen(zin):
    """Zeichnungsdateien der Folienblaetter Deckblatt, PPT_2 und PPT_3 (Blatt -> Beziehung -> Zeichnung)."""
    wbx = zin.read('xl/workbook.xml').decode('utf-8')
    rels = zin.read('xl/_rels/workbook.xml.rels').decode('utf-8')
    ziel = dict(re.findall(r'<Relationship Id="([^"]+)"[^>]*Target="([^"]+)"', rels))
    out = set()
    for name, rid in re.findall(r'<sheet name="([^"]+)" sheetId="\d+" r:id="([^"]+)"', wbx):
        if not re.match(r'(PPT_\d|Deckblatt)$', name):
            continue
        blatt = 'xl/' + ziel[rid].lstrip('/').replace('xl/', '')
        srel = blatt.replace('worksheets/', 'worksheets/_rels/') + '.rels'
        if srel in zin.namelist():
            for t in re.findall(r'Target="\.\./drawings/(drawing\d+\.xml)"', zin.read(srel).decode('utf-8')):
                out.add('xl/drawings/' + t)
    return out


SPALTE_PX = int(9.14 * 7 + 0.5) + 5          # Spaltenbreite der Folienblaetter in xlsxwriters Ankerrechnung


def absolut_verankern(t):
    """Formen und Diagramme der Folienblaetter fest in EMU verankern statt an Zellen: Excel rechnet Spaltenbreiten ueber die
    Standardschrift um – an Zellen verankert wird die Folie je nach Rechner breiter (Kacheln gestreckt, Diagramme flach). Die
    Folienblaetter haben einheitliche Spalten und Zeilen (20 px), daraus ergibt sich die Lage exakt. Die Spaltenbreite ist die, mit der
    xlsxwriter die Anker rechnet (Breite 9,14 -> 69 px); mit 64 px war die Folie im Blatt rund 7 % gestaucht, und Formen an einer
    Spaltengrenze sprangen (Legendenkasten ueber dem Text)."""
    def emu(spalte, versatz_s, zeile, versatz_z):
        return int(spalte) * SPALTE_PX * 9525 + int(versatz_s), int(zeile) * 20 * 9525 + int(versatz_z)

    def anker(m):
        bl = m.group(0)
        f = re.search(r'<xdr:from><xdr:col>(\d+)</xdr:col><xdr:colOff>(\d+)</xdr:colOff><xdr:row>(\d+)</xdr:row><xdr:rowOff>(\d+)</xdr:rowOff></xdr:from>', bl)
        z = re.search(r'<xdr:to><xdr:col>(\d+)</xdr:col><xdr:colOff>(\d+)</xdr:colOff><xdr:row>(\d+)</xdr:row><xdr:rowOff>(\d+)</xdr:rowOff></xdr:to>', bl)
        if not f or not z:
            return bl
        x1, y1 = emu(*f.groups())
        x2, y2 = emu(*z.groups())
        inhalt = bl[z.end():bl.rindex('</xdr:twoCellAnchor>')]
        # Groesse aus der Form selbst (a:xfrm), wenn vorhanden: endet eine Form genau auf einer Spaltengrenze, liefert der Zell-Anker
        # eine falsche Breite (so war ein Legendenkasten nur 1,5 pt breit). Diagramme haben dort 0 – dann gilt der Zell-Anker.
        g = re.search(r'<a:xfrm[^>]*>\s*<a:off x="\d+" y="\d+"\s*/>\s*<a:ext cx="(\d+)" cy="(\d+)"\s*/>', inhalt)
        if g and int(g.group(1)) > 0 and int(g.group(2)) > 0:
            x2, y2 = x1 + int(g.group(1)), y1 + int(g.group(2))
        return '<xdr:absoluteAnchor><xdr:pos x="%d" y="%d"/><xdr:ext cx="%d" cy="%d"/>%s</xdr:absoluteAnchor>' % (x1, y1, x2 - x1, y2 - y1, inhalt)
    return re.sub(r'<xdr:twoCellAnchor[^>]*>[\s\S]*?</xdr:twoCellAnchor>', anker, t)


def zirkel_pruefen(pfad, blatt='Dashboard_Daten'):
    """Zirkelbezuege in den Datenreihen finden (Zellebene, nur Bezuege innerhalb des Blatts). LibreOffice und ONLYOFFICE rechnen
    darueber hinweg, Excel zeigt 0 – so stand Provisionsreklamation AO bei 12.67 zuerst auf 0. Bricht den Build ab."""
    import openpyxl
    from openpyxl.utils import column_index_from_string as ci
    ws = openpyxl.load_workbook(pfad, read_only=True, keep_vba=False)[blatt]
    formeln = {}
    for zeile in ws.iter_rows():
        for c in zeile:
            if isinstance(c.value, str) and c.value.startswith('='):
                formeln[(c.row, c.column)] = c.value
    bez = re.compile(r"(?<![A-Za-z_!'\]])\$?([A-Z]{1,3})\$?(\d+)(?::\$?([A-Z]{1,3})\$?(\d+))?(?![A-Za-z_(!\d])")
    def nachbarn(zelle):
        f = re.sub(r'"[^"]*"', '', formeln[zelle])
        f = re.sub(r"(?:'[^']+'|[A-Za-z_][\w.]*)![$A-Z0-9:]+", '', f)          # Bezuege auf andere Blaetter
        for m in bez.finditer(f):
            c1, r1 = ci(m.group(1)), int(m.group(2))
            c2, r2 = (ci(m.group(3)), int(m.group(4))) if m.group(3) else (c1, r1)
            for r in range(min(r1, r2), max(r1, r2) + 1):
                for c in range(min(c1, c2), max(c1, c2) + 1):
                    if (r, c) in formeln:
                        yield (r, c)
    farbe, gefunden = {}, []
    for start in formeln:
        if start in farbe:
            continue
        stapel = [(start, nachbarn(start))]
        farbe[start] = 1
        while stapel and not gefunden:
            zelle, it = stapel[-1]
            for n in it:
                if farbe.get(n) == 1:
                    gefunden = [z for z, _ in stapel[[z for z, _ in stapel].index(n):]]
                    break
                if n not in farbe:
                    farbe[n] = 1
                    stapel.append((n, nachbarn(n)))
                    break
            else:
                farbe[zelle] = 2
                stapel.pop()
        if gefunden:
            from xlsxwriter.utility import xl_rowcol_to_cell
            raise SystemExit('Zirkelbezug in %s: %s' % (blatt, ' -> '.join(xl_rowcol_to_cell(r - 1, c - 1) for r, c in gefunden[:12])))
    print('Zirkelbezüge: keine (%d Formeln in %s)' % (len(formeln), blatt))


def berichtet_pruefen(pfad, menge, blaetter=('PPT_2', 'PPT_3')):
    """Unabhaengige Pruefung von „Pflicht = berichtet“ an der fertigen Datei: jede Reihe und jede verknuepfte Beschriftung der
    Diagramme und Formen auf PPT_2/PPT_3 wird ueber die Formeln (Dashboard_Daten, Konfiguration, Namen) bis zu den Zeilen in Rohdaten
    bzw. Wertstand (gleicher Aufbau) verfolgt; jede so erreichte Zeile muss in der berichteten Menge liegen. Bricht sonst ab."""
    import openpyxl
    from openpyxl.utils import column_index_from_string as ci
    z = zipfile.ZipFile(pfad)
    wbx = z.read('xl/workbook.xml').decode('utf-8')
    rels = dict(re.findall(r'<Relationship Id="([^"]+)"[^>]*Target="([^"]+)"', z.read('xl/_rels/workbook.xml.rels').decode('utf-8')))
    start = []                                            # (blatt, bezug) aus Diagrammreihen und Textverknuepfungen
    for name, rid in re.findall(r'<sheet name="([^"]+)" sheetId="\d+"(?: state="\w+")? r:id="([^"]+)"', wbx):
        if name not in blaetter:
            continue
        blatt = 'xl/' + rels[rid].lstrip('/').replace('xl/', '')
        srel = blatt.replace('worksheets/', 'worksheets/_rels/') + '.rels'
        for zg in re.findall(r'Target="\.\./drawings/(drawing\d+\.xml)"', z.read(srel).decode('utf-8')):
            zt = z.read('xl/drawings/' + zg).decode('utf-8')
            start += [(name, t) for t in re.findall(r'textlink="=?([^"]+)"', zt)]
            zrel = 'xl/drawings/_rels/%s.rels' % zg
            for ch in re.findall(r'Target="\.\./charts/(chart\d+\.xml)"', z.read(zrel).decode('utf-8')):
                start += [(name, f) for f in re.findall(r'<c:f>([^<]+)</c:f>', z.read('xl/charts/' + ch).decode('utf-8'))]
    wb = openpyxl.load_workbook(pfad, keep_vba=False)
    namen = {n.lower(): dn.attr_text for n, dn in wb.defined_names.items()}
    bez = re.compile(r"(?<![\w$.])(?:(?:'((?:[^']|'')+)'|([^\W\d][\w.]*))!)?\$?([A-Z]{1,3})\$?(\d+)(?::\$?([A-Z]{1,3})\$?(\d+))?(?![\w(!])")
    gefunden, besucht, offen = set(), set(), []

    def bezuege(text, blatt):
        t = re.sub(r'"[^"]*"', '""', text)
        for m in bez.finditer(t):
            b = (m.group(1) or m.group(2) or blatt).replace("''", "'")
            yield b, m.group(3), int(m.group(4)), m.group(5) or m.group(3), int(m.group(6) or m.group(4))
        for m in re.finditer(r'(?<![\w!$.\'])([A-Za-z_][\w.]*)(?![\w(!])', t):
            if m.group(1).lower() in namen:
                yield from bezuege(namen[m.group(1).lower()], blatt)

    for blatt, t in start:
        offen += list(bezuege(t, blatt))
    while offen:
        b, c1, r1, c2, r2 = offen.pop()
        if b in ('Rohdaten', 'Wertstand'):
            gefunden |= {r for r in range(min(r1, r2), max(r1, r2) + 1) if r >= 3}
            continue
        if b not in wb.sheetnames:
            continue
        ws = wb[b]
        for r in range(min(r1, r2), max(r1, r2) + 1):
            for c in range(min(ci(c1), ci(c2)), max(ci(c1), ci(c2)) + 1):
                if (b, r, c) in besucht:
                    continue
                besucht.add((b, r, c))
                v = ws.cell(r, c).value
                if isinstance(v, str) and v.startswith('='):
                    offen += list(bezuege(v[1:], b))
                elif v is not None and hasattr(v, 'text'):          # Matrixformel
                    offen += list(bezuege(str(v.text).lstrip('='), b))
    fehlt = sorted(gefunden - set(menge))
    assert not fehlt, 'Auf %s verwendete Rohdaten-Zeilen fehlen in der berichteten Menge: %s' % ('/'.join(blaetter), fehlt)
    print('Pflicht = berichtet: %d Rohdaten-Zeilen in Kacheln von %s verwendet, alle in der Menge (%d Zeilen).'
          % (len(gefunden), '/'.join(blaetter), len(menge)))
    return gefunden


def nachbearbeiten(q_extern):
    tmp = OUT + '.tmp'
    zin = zipfile.ZipFile(OUT)
    zout = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
    folien = folien_zeichnungen(zin)
    for n in zin.namelist():
        daten = zin.read(n)
        if re.match(r'xl/drawings/drawing\d+\.xml$', n):
            t = daten.decode('utf-8')

            def anker(m):
                bl = m.group(0)
                d = re.search(r'descr="([^"]*)"', bl)
                if not d or not d.group(1).startswith('N='):
                    return bl
                spec = dict(teil.split('=', 1) for teil in d.group(1).split(';'))
                bl = bl.replace(' descr="%s"' % d.group(1), '', 1)
                bl = re.sub(r'(<xdr:cNvPr id="\d+" name=")[^"]*(")', lambda x: x.group(1) + spec['N'] + x.group(2), bl, count=1)
                if spec['N'] == 'TITEL_Bild':            # Ausschnitt wie im bisherigen Deckblatt (oben und unten beschnitten)
                    bl = bl.replace('<a:stretch>', '<a:srcRect t="%d" b="%d"/><a:stretch>' % TITEL_SCHNITT, 1)
                if spec.get('H') == '1':                 # ausgeblendet (z. B. Knoepfe, die erst im Bearbeiten-Modus erscheinen)
                    bl = re.sub(r'(<xdr:cNvPr id="\d+" name="[^"]*")', r'\1 hidden="1"', bl, count=1)
                if spec.get('G') == 'pill':
                    bl = re.sub(r'<a:prstGeom prst="rect">\s*<a:avLst\s*/>', '<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 50000"/></a:avLst>', bl, count=1)
                    bl = bl.replace('<a:prstGeom prst="rect">', '<a:prstGeom prst="roundRect">', 1)
                elif 'G' in spec:
                    bl = bl.replace('<a:prstGeom prst="rect">', '<a:prstGeom prst="%s">' % spec['G'], 1)
                if 'M' in spec:
                    bl = bl.replace('<xdr:sp macro=""', '<xdr:sp macro="[0]!%s"' % spec['M'], 1)
                if spec.get('I') == '0':
                    bl = re.sub(r'<a:bodyPr([^>]*?)(/?)>', lambda x: '<a:bodyPr%s lIns="0" tIns="0" rIns="0" bIns="0"%s>'
                                % (re.sub(r' [lrtb]Ins="\d+"', '', x.group(1)), x.group(2)), bl, count=1)
                if spec.get('U') == '0':
                    bl = re.sub(r'<a:bodyPr([^>]*?) wrap="square"', r'<a:bodyPr\1 wrap="none"', bl, count=1)
                if 'R' in spec:
                    bl = bl.replace('<a:xfrm>', '<a:xfrm rot="%d">' % (int(spec['R']) * 60000), 1)
                if 'T' in spec:                          # Transparenz der Flaeche (Prozent) als Alpha der Fuellfarbe
                    bl = re.sub(r'(<xdr:spPr>[\s\S]*?<a:solidFill>\s*<a:srgbClr val="[0-9A-Fa-f]{6}")\s*/>',
                                lambda x: x.group(1) + '><a:alpha val="%d"/></a:srgbClr>' % ((100 - int(spec['T'])) * 1000), bl, count=1)
                if 'P' in spec:
                    groesse_t, rest = urllib.parse.unquote(spec['P']).split('\x1e', 1)
                    absaetze = rest.split('\x1f')
                    teile = []
                    for a in absaetze:
                        e, t = a.split('|', 1)
                        t = t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        marl, zeichen = (101600, '•') if e == '1' else (228600, '–')
                        teile.append('<a:p><a:pPr marL="%d" indent="-101600"><a:lnSpc><a:spcPts val="%d"/></a:lnSpc><a:spcAft><a:spcPts val="100"/></a:spcAft>'
                                     '<a:buFont typeface="%s"/><a:buChar char="%s"/></a:pPr><a:r><a:rPr lang="de-DE" sz="%d">'
                                     '<a:solidFill><a:srgbClr val="4A4A4A"/></a:solidFill><a:latin typeface="%s"/><a:cs typeface="%s"/>'
                                     '</a:rPr><a:t>%s</a:t></a:r></a:p>' % (marl, int(float(groesse_t) * 120), FONT_F, zeichen,
                                                                             int(float(groesse_t) * 100), FONT_F, FONT_F, t))
                    bl = re.sub(r'(<a:lstStyle/>)[\s\S]*?(</xdr:txBody>)', lambda x: x.group(1) + ''.join(teile) + x.group(2), bl, count=1)
                if 'C' in spec:
                    txt = urllib.parse.unquote(spec['C']).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    bl = bl.replace('<a:t></a:t></a:fld>', '<a:t>%s</a:t></a:fld>' % txt, 1)
                return bl
            muster = r'<xdr:(?:twoCellAnchor|oneCellAnchor|absoluteAnchor)[\s\S]*?</xdr:(?:twoCellAnchor|oneCellAnchor|absoluteAnchor)>'
            bloecke = [anker(m) for m in re.finditer(muster, t)]
            kopf = t[:re.search(muster, t).start()] if bloecke else t
            fuss = t[[m for m in re.finditer(muster, t)][-1].end():] if bloecke else ''

            def ebene(bl):                     # Hintergruende zuerst, damit sie Diagramme und Logo nicht verdecken
                n = re.search(r'<xdr:cNvPr id="\d+" name="([^"]*)"', bl)
                n = n.group(1) if n else ''
                if n == 'DEKO_Folie':
                    return 0
                if n == 'TITEL_Bild':
                    return 1
                if n in ('DEKO_Panel', 'TITEL_Flaeche', 'TITEL_Flaeche2') or n.endswith('_Grund') or n.endswith('_Kopf'):
                    return 2
                return 3
            if bloecke:
                bloecke.sort(key=ebene)
                t = kopf + ''.join(bloecke) + fuss
            if n in folien:
                t = absolut_verankern(t)
            daten = t.encode('utf-8')
        if re.match(r'xl/charts/chart\d+\.xml$', n):
            t = daten.decode('utf-8')
            if '<c:dLbls>' in t:
                # Datenbeschriftungen: Text waechst mit (ohne das kuerzt Excel eine Beschriftung mit Kasten oder eigenem Text auf die
                # Laenge des Zwischenspeichers, "-..."), kein Umbruch, schmaler Rand (Wertkaesten wie im bisherigen Dashboard)
                t = t.replace('<c:txPr><a:bodyPr/>', '<c:txPr><a:bodyPr wrap="none" lIns="18000" tIns="0" rIns="18000" bIns="0" '
                                                    'anchor="ctr" anchorCtr="1"><a:spAutoFit/></a:bodyPr>')
            daten = t.encode('utf-8')
        if n == 'xl/workbook.xml' and q_extern:
            t = daten.decode('utf-8')
            t = t.replace('</sheets>', '</sheets><externalReferences><externalReference r:id="rIdExt1"/></externalReferences>', 1)
            daten = t.encode('utf-8')
        if n == 'xl/_rels/workbook.xml.rels' and q_extern:
            t = daten.decode('utf-8')
            t = t.replace('</Relationships>', '<Relationship Id="rIdExt1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/'
                                              'externalLink" Target="externalLinks/externalLink1.xml"/></Relationships>')
            daten = t.encode('utf-8')
        if n == '[Content_Types].xml' and q_extern:
            t = daten.decode('utf-8')
            t = t.replace('</Types>', '<Override PartName="/xl/externalLinks/externalLink1.xml" ContentType="application/'
                                      'vnd.openxmlformats-officedocument.spreadsheetml.externalLink+xml"/></Types>')
            daten = t.encode('utf-8')
        zout.writestr(zin.getinfo(n), daten)
    for n, daten in (q_extern or {}).items():
        zout.writestr(n, daten)
    zin.close()
    zout.close()
    os.replace(tmp, OUT)


def vba_bin_schreiben():
    vba_dir = os.path.join(HIER, 'vba')
    befunde = vba_pruefung.pruefe(vba_dir)
    if befunde:
        raise SystemExit('VBA-Pruefung fehlgeschlagen (Excel wuerde nicht kompilieren):\n' + '\n'.join(befunde))
    module = [('ThisWorkbook', open(os.path.join(vba_dir, 'DieseArbeitsmappe.cls'), encoding='utf-8').read(), 'workbook')]
    for blatt in ('Start', 'Rohdaten'):
        module.append((blatt, open(os.path.join(vba_dir, blatt + '.cls'), encoding='utf-8').read(), 'sheet'))
    for n in ('Uebersicht', 'Deckblatt', 'PPT_2', 'PPT_3', 'Kommentare', 'Zustaendigkeiten', 'Konfiguration',
              'BUE_Serviceparameter', 'Dashboard_Daten', 'Feiertage'):
        datei = os.path.join(vba_dir, n + '.cls')
        module.append((n, open(datei, encoding='utf-8').read() if os.path.exists(datei) else 'Option Explicit\r\n', 'sheet'))
    for datei in sorted(os.listdir(vba_dir)):
        if datei.endswith('.bas'):
            module.append((datei[:-4], open(os.path.join(vba_dir, datei), encoding='utf-8').read(), False))
    pfad = os.path.join(HIER, 'vbaProject.bin')
    open(pfad, 'wb').write(ovba.vba_projekt(module, projektname='HRSalesDashboard'))
    return pfad


if __name__ == '__main__':
    vba = vba_bin_schreiben()
    bauen(vba)
    q = quelle_lesen.lesen()
    nachbearbeiten(q['ExternerLink'])
    zirkel_pruefen(OUT)
    rd_ = q['Rohdaten']
    benannt = lambda zeilen: ', '.join(str(rd_.zellen.get((r, 1)) or 'Z.%d' % r) for r in sorted(zeilen))  # noqa: E731
    print('Berichtet (Kacheln PPT_2/PPT_3):', benannt(BERICHTET['kern']))
    print('  erweitert um Eingabezeilen von Summen:', benannt(BERICHTET['menge'] - BERICHTET['kern']))
    print('Formeln fortgeschrieben (Zeile: Quellspalte, KW):', ', '.join('%d %s: %s, %d' % (r, rd_.zellen.get((r, 1)) or '', xl_col_to_name(c - 1), n)
                                                                       for r, (c, n) in sorted(BERICHTET['fortgeschrieben'].items())))
    print('Rohdaten eingeklappt (Kopfzeile: ausgeblendete Zeilen):', '; '.join('%d: %s' % (k, ','.join(map(str, d_))) for k, d_ in BERICHTET['gruppen']))
    berichtet_pruefen(OUT, BERICHTET['menge'] | BERICHTET['monat_neben'] | BERICHTET['alt_neben'])
    for nr_, o_, u_, mi_, ma_ in PV['achsen']:
        print('Provisionsreklamation Kachel %d: Zeichenfläche %.2f bis %.2f pt ab Kachelkopf, Werteachse %.4f bis %.4f (Null bei %.2f pt, %.2f pt je Bezug)'
              % (nr_, o_, u_, mi_, ma_, PV['null'], PV['massstab']))
    print('geschrieben:', OUT)
