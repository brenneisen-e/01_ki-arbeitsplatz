# -*- coding: utf-8 -*-
"""Baut die Master-Datei BUE_Reporting_Master.xlsm (Cockpit, Verlauf, KW, Fakten, Filter, Anwesenheit,
Konfiguration, Ladeprotokoll, Snapshots) samt VBA-Projekt und befuellt sie mit den vorhandenen Rohdaten.

Aufruf (aus diesem Ordner):  python3 bue_reporting_build.py
Voraussetzung: Rohdaten in ../Rohdaten (je Datei ein oder mehrere Blaetter mit Rueckstandsabzug),
Anwesenheitsliste in ../Anwesenheit. Beide Ordner legt vorbereiten() aus den Upload-Dateien an, wenn sie fehlen.
"""
import datetime as dt
import os
import re
import math
import shutil
import sys
import zipfile

import xlsxwriter
from xlsxwriter.utility import xl_rowcol_to_cell, xl_col_to_name

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import verarbeitung as v  # noqa: E402
import ovba  # noqa: E402

BASIS = os.path.dirname(HIER)
ROH = os.path.join(BASIS, 'Rohdaten')
ANW = os.path.join(BASIS, 'Anwesenheit')
OUT = os.path.join(BASIS, 'BUE_Reporting_Master.xlsm')            # leere Master-Datei (Daten kommen per Makro)
OUT_DEMO = os.path.join(BASIS, 'BUE_Reporting_Demo_befuellt.xlsm')  # dieselbe Datei, mit den Rohdaten aus dem Ordner vorbefuellt
OUT_MAKLER = os.path.join(BASIS, 'BUE_Reporting_Master_Makler.xlsm')  # leere Master-Datei fuer den Bereich Makler (ODPB, ODPP, KBI …)
BEREICH = 'HS'                     # HS (HSB4 K) oder MAKLER: Titel, Postkoerbe, SLA, Rohdatenblatt, Chips Sparte | Einheit (Konfiguration!F7)
GEVO_STANDARD = ['39 Telefonnotiz', '40 sonstige Korrespondenz', '67 Anfrage z. Vertragsumf.', '108 Bestandsübertragung', '131 Ablaufkündigung',
                 '401 Maklervertrag', '413 Kopien von Unterlagen', '469 Bestandsübertragung', '472 sonstiger Schriftwechsel', '703 Rechte Dritter',
                 '803 Eigentümer/Halter/Nutzung', '2015 Maklervollmacht', '6065 Anfrage Betreuung']   # Chips der leeren Master-Datei
UPLOADS = '/root/.claude/uploads/f661452e-e109-5f2a-a280-eeeab59cad16'
JAHR_ANWESENHEIT = 2026
VERSION, VERSION_DATUM = '12.93', '26.10.2026'       # erscheint im Kopf des Cockpits

# ------------------------------------------------------------------ Gestaltung
FONT = 'Liberation Sans'
ROT, ROTD, ROTL = '#BF1528', '#8E0F1E', '#FBE9EB'
TEAL, TEALD, TEAL2, TEALL, TEALT = '#0F94A7', '#0B6F7D', '#47BCC5', '#CCEBED', '#EEF6F7'
INDIGO = '#3B4F8A'
SW, GRAUD, GRAU, GRAUM, GRAUL, GRAUXL, WEISS = '#1A1A1A', '#4A4A4A', '#6B6B6B', '#9AA3AD', '#D0D5DA', '#F3F4F6', '#FFFFFF'
GRUEN = '#1E7F4F'
GRUENH, GELBH, GELBD = '#DDF3E4', '#FBEFC7', '#8A5A00'     # Badges: weniger (hellgruen), mehr (hellgelb), Schrift gelb
ORANGE = '#E07000'                                           # Hinweis „Beladung läuft“ oben rechts im Cockpit
LEGENDE_EINGABE = 'Weiße Felder mit Rahmen = Eingaben · graue Felder = berechnet'   # einzeilige Legende in jedem Eingabeblatt
TAB_EINGABE, TAB_BERICHT, TAB_HILFE = TEAL, INDIGO, GRAUM                  # Registerfarben: Eingaben, Berichte, Hilfs-/Datenblaetter
FARBE_SPARTE = {'KV': ROT, 'Komposit': TEAL, 'Leben': INDIGO, 'Sonstige': GRAUM}
FARBE_ALTER = ['#CCEBED', '#7FCBD4', '#0F94A7', SW]      # über 90 Tage schwarz (12.84): faellt auf, auch als schmales Segment
FARBE_SPARTE_HELL = {'KV': '#E8919B', 'Komposit': '#7FCBD4', 'Leben': '#9AA6CC', 'Sonstige': '#C9CED4'}   # Abgaenge: hellerer Ton derselben Sparte

MAX_FAKTEN = 300000
GAP_PPT_STAPEL = 55                                   # PPT-Rueckstand: Komposit-Werte ("20,4") passen noch in die Saeule
MAX_UMB = 100000                                      # Blatt Umbuchungen: Zeilen 2..MAX_UMB (Namen U_*)
UMBUCHUNGEN = []                                      # Demo: Umbuchungen aus verarbeitung.verarbeiten (kenn['umbuchungen'])
PK_VON, PK_BIS = 5, 44          # Filter!B5:B44: Themenpostkoerbe (40 Plaetze)
POSTKOERBE_AKTIV = ['KO 23724', 'MV 23724']     # Standard der Sachbearbeitung (HSB4K KO, MV); GR und AZ seit 12.84 aus
MAX_VERLAUF = 1000
LP_MAX = 5000                                         # Zeilen des Ladeprotokolls, die die Kennzeichen „Stand geladen“ lesen
SPALTEN_OPAG = set(range(3, 13)) | {23, 24, 25, 29, 30, 31, 35}          # Verlauf-Spalten je Quelle (0-basiert)
SPALTEN_VERBUND = set(range(13, 23)) | {26, 27, 28, 32, 33, 34, 36}
SLA_VERBUND = 5500                                    # Vorgaben-Linie im Rückstand Verbund (Konfiguration!F3)
BW_ZEILEN = ['Gesamt', 'Komposit', 'Leben', 'KV']       # Kachel Eingänge und Abgänge: eine Diagrammzeile je Eintrag


# ------------------------------------------------------------------ Rohdaten vorbereiten
def vorbereiten():
    """Zerlegt die Sammeldatei in Tagesdateien je Quelle (so wie sie kuenftig einzeln kommen) und legt die Anwesenheit ab."""
    import openpyxl
    os.makedirs(ROH, exist_ok=True)
    os.makedirs(ANW, exist_ok=True)
    quelle = os.path.join(UPLOADS, '6ed28fbb-20260924_R_ckst_nde_HSB4K_OPAG_Verbund.xlsx')
    if os.path.exists(quelle) and not [f for f in os.listdir(ROH) if f.endswith('.xlsx')]:
        wb = openpyxl.load_workbook(quelle, read_only=True, data_only=True)
        for ws in wb.worksheets:
            zeilen = [list(r) for r in ws.iter_rows(values_only=True)]
            erg = v.blatt_lesen(zeilen)
            if not erg:
                continue
            stichtag, q, _ = erg
            neu = openpyxl.Workbook()
            wsn = neu.active
            wsn.title = q
            for z in zeilen:
                wsn.append(z)
            name = '%s_Rueckstand_%s_HSB4K.xlsx' % (stichtag.strftime('%Y%m%d'), q)
            neu.save(os.path.join(ROH, name))
            print('Rohdatei angelegt:', name)
        wb.close()
    anw = os.path.join(UPLOADS, '703923bc-HSB_4_K_incl._RD_Kollegen_Anwensenheit_bis_Oktober_2026.xlsx')
    ziel = os.path.join(ANW, 'HSB4K_Anwesenheit_bis_Oktober_2026.xlsx')
    if os.path.exists(anw) and not os.path.exists(ziel):
        shutil.copy(anw, ziel)
        print('Anwesenheitsliste abgelegt:', os.path.basename(ziel))


# ------------------------------------------------------------------ Vorbefuellung
def vorbefuellen():
    UMBUCHUNGEN.clear()
    staende = []
    for f in sorted(os.listdir(ROH)):
        if f.lower().endswith(('.xlsx', '.xlsm')) and not f.startswith('~$'):
            staende += v.blaetter_aus_datei(os.path.join(ROH, f))
    staende.sort(key=lambda s: (s[2], s[3]))
    snap = {'OPAG': None, 'Verbund': None}
    snap_datum = {'OPAG': None, 'Verbund': None}
    fakten, protokoll, stichtage = [], [], []
    for pfad, blatt, stichtag, quelle, saetze in staende:
        f, neu, k = v.verarbeiten(stichtag, quelle, saetze, snap[quelle])
        erster = snap[quelle] is None
        snap[quelle], snap_datum[quelle] = neu, stichtag
        fakten += f
        if not erster:
            UMBUCHUNGEN.extend(k['umbuchungen'])
        if stichtag not in stichtage:
            stichtage.append(stichtag)
        protokoll.append((dt.datetime.now(), os.path.basename(pfad), blatt, quelle, stichtag, k['zeilen'], k['rueckstand'],
                          0 if erster else k['eingang'], 0 if erster else k['abgang'],
                          'erster Stand dieser Quelle – Eingänge und Abgänge ab dem nächsten Stichtag' if erster else ''))
    stichtage.sort()
    anwesenheit = []
    for f in sorted(os.listdir(ANW)):
        if f.lower().endswith('.xlsx') and not f.startswith('~$'):
            anwesenheit = v.anwesenheit_lesen(os.path.join(ANW, f), JAHR_ANWESENHEIT)
            anw_datei = f
    return fakten, snap, snap_datum, protokoll, stichtage, anwesenheit, (anw_datei if anwesenheit else '')


# ------------------------------------------------------------------ Hilfen
class Stil:
    def __init__(self, wb):
        self.wb = wb
        b = {'font_name': FONT, 'font_size': 10, 'font_color': SW, 'valign': 'vcenter'}
        f = lambda **k: wb.add_format({**b, **k})  # noqa: E731
        self.basis = f()
        self.titel = f(font_size=20, bold=True, font_color=SW)
        self.titel_rot = f(font_size=20, bold=True, font_color=ROT)
        self.untertitel = f(font_size=9, font_color=GRAU)
        self.abschnitt = f(font_size=11, bold=True, font_color=SW)
        self.abschnitt_klein = f(font_size=8, bold=True, font_color=GRAU)
        self.hinweis = f(font_size=8, font_color=GRAU, italic=True, text_wrap=True, valign='top')
        self.kopf = f(bold=True, font_color=WEISS, bg_color=GRAUD, border=0, text_wrap=True, valign='vcenter')
        self.kopf_rot = f(bold=True, font_color=WEISS, bg_color=ROT, text_wrap=True)
        self.kopf_hell = f(bold=True, font_color=GRAUD, bg_color=GRAUXL, bottom=1, bottom_color=GRAUL, text_wrap=True)
        self.zelle = f(font_size=9)
        self.zelle_zahl = f(font_size=9, num_format='#,##0')
        self.zelle_dez = f(font_size=9, num_format='#,##0.0')
        self.zelle_dat = f(font_size=9, num_format='dd.mm.yyyy')
        self.zelle_datzeit = f(font_size=9, num_format='dd.mm.yyyy hh:mm')
        self.zelle_bool = f(font_size=9, align='center')
        self.zelle_ganz = f(font_size=9, num_format='0')                    # Jahre, KW-Schluessel, GeVo-Nummern: ohne Tausenderpunkt
        # Tabellenkoepfe einheitlich: dunkles Band (neutral GRAUD, OPAG ROTD, Verbund TEALD) fuer Gruppen und einfache Tabellen,
        # darunter Spaltenkoepfe im hellen Ton derselben Farbe mit Linie in der dunklen Farbe
        self.band = f(bold=True, font_color=WEISS, bg_color=GRAUD)        # Abschnittsband ueber einer Zeile (ohne Umbruch)
        self.band_opag = f(bold=True, font_color=WEISS, bg_color=ROTD)
        self.band_verbund = f(bold=True, font_color=WEISS, bg_color=TEALD)
        self.kopf_opag = f(bold=True, font_color=WEISS, bg_color=ROTD, text_wrap=True)
        self.kopf_verbund = f(bold=True, font_color=WEISS, bg_color=TEALD, text_wrap=True)
        self.spalte = f(font_size=9, bold=True, font_color=GRAUD, bg_color=GRAUXL, text_wrap=True, bottom=1, bottom_color=GRAUD)
        self.spalte_opag = f(font_size=9, bold=True, font_color=ROTD, bg_color=ROTL, text_wrap=True, bottom=1, bottom_color=ROTD)
        self.spalte_verbund = f(font_size=9, bold=True, font_color=TEALD, bg_color=TEALT, text_wrap=True, bottom=1, bottom_color=TEALD)
        self.legende = f(font_size=9, italic=True, font_color=GRAU)
        self.spalte_ganz = f(font_size=9, bold=True, font_color=GRAUD, bg_color=GRAUXL, num_format='0', align='center', bottom=1, bottom_color=GRAUD)
        self.spalte_dat = f(font_size=8, font_color=GRAU, bg_color=GRAUXL, num_format='dd.mm.yyyy', align='center')
        self.label = f(font_size=9, font_color=SW, bottom=1, bottom_color=GRAUXL)
        # Eingabefelder wie moderne Formularfelder: weiss, feiner heller Rahmen (GRAUL), Schrift dunkles Petrol, Einzug.
        # Einzelfelder mit Rahmen rundum; Eingabetabellen mit vielen Zeilen nur mit waagerechter Haarlinie (ruhiges Kartenbild).
        e = dict(font_size=10, font_color=TEALD, bg_color=WEISS, border=1, border_color=GRAUL, indent=1)
        self.eingabe = f(**e)
        self.eingabe_zahl = f(**e, num_format='#,##0', align='left')
        self.eingabe_datum = f(**e, num_format='dd.mm.yyyy', align='left')
        self.eingabe_ganz = f(**e, num_format='0', align='left')
        self.eingabe_wahl = f(**{**e, 'indent': 0}, align='center', bold=True)      # ja/nein, WAHR/FALSCH
        self.eingabe_klein = f(**{**e, 'font_size': 9, 'indent': 0}, align='center', bold=True, num_format='0.0')   # Planungsmatrix
        z = dict(font_size=10, font_color=TEALD, bg_color=WEISS, bottom=1, bottom_color=GRAUL, indent=1)
        self.zeile = f(**z)                                                          # Eingabetabellen: Zeile mit Haarlinie
        self.zeile_ganz = f(**z, num_format='0', align='left')
        self.zeile_dez = f(**{**z, 'indent': 0}, num_format='0.0', align='center')
        self.zeile_dat = f(**{**z, 'indent': 0}, num_format='dd.mm.yyyy', align='center')
        self.zeile_wahl = f(**{**z, 'indent': 0}, align='center', bold=True)
        # berechnete Zellen: grau gefuellt, graue Schrift, ohne Rahmen – sofort als „nicht eintippen“ erkennbar
        g = dict(font_size=10, font_color=GRAU, bg_color=GRAUXL, indent=1)
        self.berechnet = f(**g)
        gz = dict(font_size=10, font_color=GRAU, bg_color=GRAUXL, align='right')     # Zahlen und Daten rechtsbuendig
        self.berechnet_zahl = f(**gz, num_format='#,##0')
        self.berechnet_dez = f(**gz, num_format='0.0')
        self.berechnet_dat = f(**gz, num_format='dd.mm.yyyy')
        self.berechnet_datzeit = f(**gz, num_format='dd.mm.yyyy hh:mm')
        self.berechnet_ganz = f(**gz, num_format='0')
        self.berechnet_wahl = f(**{**g, 'indent': 0}, align='center')
        self.pflicht = wb.add_format({'bg_color': ROTL, 'font_color': ROTD})         # bedingtes Format: Pflichtfeld fehlt
        self.kpi_label = f(font_size=8, bold=True, font_color=GRAU, bg_color=GRAUXL, valign='bottom', indent=1, shrink=True)   # passt sich der Kachel an
        self.kpi_wert = f(font_size=24, bold=True, font_color=SW, bg_color=GRAUXL, num_format='#,##0', valign='vcenter', align='left', indent=1)
        self.kpi_wert_dez = f(font_size=24, bold=True, font_color=SW, bg_color=GRAUXL, num_format='#,##0.0', valign='vcenter', align='left', indent=1)
        self.kpi_wert_dat = f(font_size=19, bold=True, font_color=SW, bg_color=GRAUXL, valign='vcenter', align='left', indent=1)
        self.kpi_sub = f(font_size=8, font_color=GRAU, bg_color=GRAUXL, valign='top', num_format='+#,##0;-#,##0;±0')
        self.kpi_sub_text = f(font_size=8, font_color=GRAU, bg_color=GRAUXL, valign='vcenter', indent=1, shrink=True)
        # Produktivitaetskachel, Polsterzeile: zwei Zeilen (KV/Komp./L., darunter OPAG) mit festem Umbruch (CHAR(10)), 7,5 pt;
        # die Texte sind so kurz gehalten, dass Excel nicht zusaetzlich umbricht (Schrumpfen geht mit Umbruch nicht): jede Fassung
        # hat mit ganzzahligen GDI-Glyphenbreiten mindestens 12 % Reserve in 140 px (100 %, 10 px) und 126 px (90 %, 9 px)
        self.kpi_sub_2z = f(font_size=7.5, font_color=GRAU, bg_color=GRAUXL, valign='vcenter', indent=1, text_wrap=True)
        self.kpi_fill = f(bg_color=GRAUXL)
        self.chart_titel = f(font_size=11, bold=True, font_color=SW)
        self.chart_sub = f(font_size=8, font_color=GRAU)
        self.filter_kopf = f(font_size=8, bold=True, font_color=GRAU, top=1, top_color=GRAUL)
        self.datum_gross = f(font_size=11, bold=True, font_color=SW, num_format='dd.mm.yyyy', align='right')
        self.rechts_grau = f(font_size=9, font_color=GRAU, align='right')
        self.dropdown = f(font_size=9, bold=True, font_color=TEALD, bg_color=TEALT, border=1, border_color=TEALL)


SEGMENT_LABEL = lambda fmt='#,##0;#,##0;': {'value': True, 'position': 'center', 'num_format': fmt, 'font': {'name': FONT, 'size': 8, 'color': WEISS, 'bold': True}}  # noqa: E731


def thinkcell(ch):
    """Gestapelte Diagramme wie in think-cell: Werte in den Segmenten, Summe ueber dem Stapel, keine Wertachse, keine Gitterlinien."""
    ch.set_y_axis({'visible': False, 'major_gridlines': {'visible': False}})


def chart_stil(ch, y_format='#,##0', legende='top', hoehe=270, breite=560, x_date=False, x_font=8):
    ch.set_chartarea({'border': {'none': True}, 'fill': {'color': WEISS}})
    ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True}})
    ch.set_title({'none': True})
    if legende:
        ch.set_legend({'position': legende, 'font': {'name': FONT, 'size': 8, 'color': GRAUD}})
    else:
        ch.set_legend({'none': True})
    x = {'num_font': {'name': FONT, 'size': x_font, 'color': GRAU}, 'line': {'color': GRAUL, 'width': 0.75},
         'major_gridlines': {'visible': False}, 'major_tick_mark': 'none', 'minor_tick_mark': 'none'}
    if x_date:
        x.update({'date_axis': True, 'num_format': 'dd.mm.'})
    ch.set_x_axis(x)
    ch.set_y_axis({'num_font': {'name': FONT, 'size': 8, 'color': GRAU}, 'num_format': y_format, 'line': {'none': True},
                   'major_gridlines': {'visible': True, 'line': {'color': GRAUXL, 'width': 0.75}}, 'major_tick_mark': 'none'})
    ch.set_size({'width': breite, 'height': hoehe})
    ch.show_blanks_as('gap')


# ------------------------------------------------------------------ Bau
def bauen(vba_bin, leer=False):
    vorbereiten()
    fakten, snap, snap_datum, protokoll, stichtage, anwesenheit, anw_datei = vorbefuellen()
    if leer:                                   # leere Master-Datei: keine Fakten, kein Verlauf, keine Snapshots, keine Anwesenheit
        fakten, protokoll, stichtage, anwesenheit, anw_datei = [], [], [], [], ''
        UMBUCHUNGEN.clear()
        snap = {'OPAG': None, 'Verbund': None}
    GEOMETRIE.clear()
    BW_DATEIEN.clear()
    BW_TEXTE.clear()
    print('Fakten:', len(fakten), 'Stichtage:', stichtage, 'Anwesenheit:', len(anwesenheit))

    # Listen fuer die Filter aus den Daten
    import collections
    pk_z = collections.Counter()
    typ_z = collections.Counter()
    for z in fakten:
        if z[1] == 'Verbund':
            pk_z[z[4]] += z[8]
            typ_z[z[6]] += z[8]
    postkoerbe = [p for p, _ in pk_z.most_common()]
    for p in (['KO 23724', 'MV 23724', 'BE 23724', 'WR 23724', 'BÜ 23724', '72 23724', 'GR 23724', '00 23724', v.OHNE_POSTKORB] if BEREICH == 'HS' else []):
        if p not in postkoerbe:
            postkoerbe.append(p)
    postkoerbe = postkoerbe[:PK_BIS - PK_VON + 1]
    gevo_typen = sorted([t for t, _ in typ_z.most_common(13)], key=lambda t: (v.gevo_typ(t)[1], t)) or list(GEVO_STANDARD)

    wb = xlsxwriter.Workbook(OUT, {'use_future_functions': True})
    wb.formats[0].set_font_name(FONT)
    wb.formats[0].set_font_size(10)
    wb.set_vba_name('ThisWorkbook')
    wb.add_vba_project(vba_bin)
    st = Stil(wb)

    ws_c = wb.add_worksheet('Cockpit')
    ws_ppt = wb.add_worksheet('PPT')
    ws_an = wb.add_worksheet('Anleitung')
    ws_p = wb.add_worksheet('Kalender')
    ws_p.set_vba_name('Kalender')         # Codename fuer das Blattmodul (Sprung zu heute)
    ws_m = wb.add_worksheet('Mitarbeiter')
    ws_v = wb.add_worksheet('Verlauf')
    ws_k = wb.add_worksheet('KW')
    ws_ww = wb.add_worksheet('Wochenwerte')
    ws_rb = wb.add_worksheet('Rohdatenblatt')
    ws_rb.set_vba_name('Rohdatenblatt')   # Codename fuer das Blattmodul (Sprung zur aktuellen Woche)
    ws_f = wb.add_worksheet('Fakten')
    ws_fi = wb.add_worksheet('Filter')
    ws_ko = wb.add_worksheet('Konfiguration')
    ws_l = wb.add_worksheet('Ladeprotokoll')
    ws_di = wb.add_worksheet('Dateiinhalt')
    ws_d = wb.add_worksheet('Diagrammdaten')
    ws_w = wb.add_worksheet('Wirksam')
    ws_so = wb.add_worksheet('Snapshot_OPAG')
    ws_sv = wb.add_worksheet('Snapshot_Verbund')
    ws_u = wb.add_worksheet('Umbuchungen')
    for w in (ws_c, ws_ppt, ws_an, ws_p, ws_m, ws_v, ws_k, ws_ww, ws_f, ws_fi, ws_ko, ws_l, ws_di, ws_d, ws_w, ws_so, ws_sv, ws_u):
        w.hide_gridlines(2)
        w.set_default_row(15)
    ws_rb.hide_gridlines(2)                    # Rohdatenblatt: Zeilen 1:1 wie das Original, nur ohne Gitternetz
    if BEREICH == 'MAKLER':
        ws_rb.hide()                           # Wochenreport des HS-Dashboards: im Bereich Makler nicht gebraucht
    # Registerfarben: Cockpit/PPT rot (Ausgabe), Eingabeblaetter petrol, Berichte indigo, Hilfs- und Datenblaetter grau
    for w in (ws_p, ws_m, ws_ko):
        w.set_tab_color(TAB_EINGABE)
    for w in (ws_ww, ws_rb):
        w.set_tab_color(TAB_BERICHT)
    for w in (ws_v, ws_k, ws_f, ws_fi, ws_l, ws_di, ws_d, ws_w, ws_so, ws_sv, ws_u):
        w.set_tab_color(TAB_HILFE)
    ws_so.hide()
    ws_sv.hide()
    ws_w.hide()
    CHART_ZAEHLER[0] = 0

    # ---------------------------------------------------------- Namen fuer die Faktenspalten
    def name(n, ref):
        wb.define_name(n, ref)
    spalten_f = {'F_Stichtag': 'A', 'F_Quelle': 'B', 'F_Sparte': 'C', 'F_Postkorb': 'E', 'F_GevoTyp': 'G', 'F_GevoNr': 'H',
                 'F_Rueckstand': 'I', 'F_Eingang': 'J', 'F_Abgang': 'K', 'F_A0': 'L', 'F_A1': 'M', 'F_A2': 'N', 'F_A3': 'O', 'F_Aktiv': 'P',
                 'F_Std': 'Q', 'F_Einheit': 'R', 'F_Gruppe': 'S', 'F_AlterMax': 'T', 'F_AlterSumme': 'V'}
    for n, c in spalten_f.items():
        name(n, '=Fakten!$%s$2:$%s$%d' % (c, c, MAX_FAKTEN))
    # Umbuchungen (eigenes Blatt, beruehrt Fakten und Rueckstand nicht): Faelle, die in beiden Staenden vorkommen, aber den
    # Themenpostkorb oder GeVo gewechselt haben – je Paar (vorher, heute) eine Zeile mit Anzahl und Filterkennzeichen
    for n, c in {'U_Stichtag': 'A', 'U_Quelle': 'B', 'U_Sparte': 'C', 'U_Anzahl': 'J', 'U_VorAktiv': 'K', 'U_HeuteAktiv': 'L',
                 'U_VorStd': 'M', 'U_HeuteStd': 'N', 'U_VorPK': 'O', 'U_HeutePK': 'P'}.items():
        name(n, '=Umbuchungen!$%s$2:$%s$%d' % (c, c, MAX_UMB))
    # Filterlisten als Namen (Themenpostkoerbe Filter!B5:B44, GeVo-Typen Filter!G5:G17)
    name('PK_Liste', '=Filter!$B$%d:$B$%d' % (PK_VON, PK_BIS))
    name('PK_Aktiv', '=Filter!$C$%d:$C$%d' % (PK_VON, PK_BIS))
    name('GV_Liste', '=Filter!$G$5:$G$17')
    name('GV_Aktiv', '=Filter!$H$5:$H$17')
    name('SP_Liste', '=Filter!$S$5:$S$8')
    name('SP_Aktiv', '=Filter!$T$5:$T$8')
    name('EH_Liste', '=Filter!$X$5:$X$10')            # Einheiten-Chips (Bereich Makler, 12.86); Namen setzt modLaden.EinheitChipsSetzen
    name('EH_Aktiv', '=Filter!$Y$5:$Y$10')

    def block(nm, erste, letzte):
        # Teilbereich eines F_*-Namens (nur die Fakten-Zeilen eines Stichtags): INDEX:INDEX ist nicht fluechtig
        return 'INDEX(%s,%s):INDEX(%s,%s)' % (nm, erste, nm, letzte)

    # ---------------------------------------------------------- Konfiguration
    # Feste Adressen fuer die Makros: B3 Rohdaten, B4 Anwesenheit, B5 Jahr, B7 lokaler Ordner, B8 Hover, B9 Karte,
    # A11:B40 Verwaltungssystemschluessel -> Sparte, D11:D20 BUE-Schluessel, SLA in F3/F4; Standard-Auswahl: H11:H50 Themenpostkoerbe
    # (Spiegel von Filter!B5:B44) mit I11:I50 ja/nein, K11:K24 GeVo-Typen (Spiegel von Filter!G5:G18) mit L11:L24 ja/nein.
    ws_ko.hide_gridlines(2)
    ws_ko.set_column('A:A', 34)
    ws_ko.set_column('B:B', 30)
    ws_ko.set_column('C:C', 3)
    ws_ko.set_column('D:D', 34)
    ws_ko.set_column('E:E', 3)
    ws_ko.set_column('F:F', 30)
    notiz = {'author': 'BÜ-Reporting', 'x_scale': 2.4, 'y_scale': 1.5, 'font_name': FONT, 'font_size': 9}
    f_lab = wb.add_format({'font_name': FONT, 'font_size': 10, 'font_color': SW, 'valign': 'vcenter', 'bottom': 1, 'bottom_color': GRAUXL})
    f_ein, f_ein_z, f_leg = st.eingabe, st.eingabe_zahl, st.legende
    f_hin = wb.add_format({'font_name': FONT, 'font_size': 9, 'font_color': GRAUD, 'valign': 'top', 'text_wrap': True})
    ws_ko.set_row(0, 30)
    ws_ko.write('A1', 'Konfiguration', st.titel)
    ws_ko.write('D1', LEGENDE_EINGABE + ' · Hinweise als Notiz an den Beschriftungen (rotes Dreieck)', f_leg)
    ws_ko.merge_range('A2:B2', 'Einstellungen', st.kopf)
    ws_ko.merge_range('D2:F2', 'Vorgaben (SLA)', st.kopf)
    ws_ko.set_row(1, 22)
    einstellungen = [
        (2, 'Rohdaten-Ordner', 'Rohdaten', 'Ordner mit den MIS-O-Abzügen – relativ zur Master-Datei oder als absoluter Pfad. Neue Abzüge einfach dort speichern; '
                                           'das Tool benennt sie beim Laden um und legt sie in JJJJ\\MM_Monat ab.'),
        (3, 'Ordner der Anwesenheitsliste', 'Anwesenheit', 'Ordner der Anwesenheitsliste für „Anwesenheit laden“ (MAK-Liste je KW oder Telefonie- und Abwesenheitsplan mit Blatt „Verwaltung“); die neueste Datei darin wird gelesen. Den Plan übernimmt jedes „Neue Daten laden“ neu.'),
        (4, 'Jahr der Anwesenheitsliste', JAHR_ANWESENHEIT, 'Jahr, zu dem die Wochenspalten der MAK-Liste („33 KW“ …) gehören.'),
        (5, 'Celonis-Upload (Process Mining)', r'H:\Process-Mining-Sync\Upload', 'Jede Rohdatei, aus der ein Stand geladen wird, wird automatisch hierher kopiert – auch beim ersten Laden aus der fertigen Ablage '
                                           '(einheitlicher Name, z. B. 20260930_BUe_OPAG.xlsx; ein ersetzter Stand überschreibt die alte Kopie). Leer = aus.'),
        (6, 'Lokaler Ordner (nur bei Bedarf)', '', 'Liegt die Master-Datei auf SharePoint, braucht es hier nichts: ohne OneDrive liest das Tool die Ordner Rohdaten und '
                                                     'Anwesenheit direkt über SharePoint (Power Query, Anmeldung mit dem Office-Konto beim ersten Laden). Nur für einen lokalen '
                                                     'oder synchronisierten Ordner der Master-Datei hier den Pfad eintragen. Rohdaten und Anwesenheit (B3/B4) dürfen auch '
                                                     'Adressen eines SharePoint-Ordners aus der Adresszeile des Browsers sein.'),
        (7, 'Hover-Effekt der Chips', 'JA', 'NEIN, falls Excel beim Überfahren der Chips instabil wird – der Klick funktioniert weiter.'),
        (8, 'Meldungen als Karte im Blatt', 'JA', 'NEIN = klassisches Windows-Fenster, falls Excel beim Anzeigen der Karte instabil wird.'),
    ]
    for r, lab, wert, hinweis in einstellungen:
        ws_ko.write(r, 0, lab, f_lab)
        if isinstance(wert, int):
            ws_ko.write_number(r, 1, wert, st.eingabe_ganz)
        else:
            ws_ko.write(r, 1, wert, f_ein)
        ws_ko.write_comment(r, 0, hinweis, notiz)
        ws_ko.set_row(r, 19)
    for zelle in ('B8', 'B9'):
        ws_ko.data_validation(zelle, {'validate': 'list', 'source': ['JA', 'NEIN']})
    ws_ko.write('D3', 'Rückstand Verbund (Vorgänge)', f_lab)
    ws_ko.write_number('F3', SLA_VERBUND, f_ein_z)
    ws_ko.write_comment('D3', 'Gestrichelte SLA-Linie im Diagramm „Rückstand Verbund“. 0 = keine Linie.', notiz)
    ws_ko.write('D4', 'Rückstand OPAG (Arbeitsgüter)', f_lab)
    ws_ko.write_blank('F4', None, f_ein_z)
    ws_ko.write_comment('D4', 'Noch kein fester Wert: Solange leer, zeigt das Diagramm einen Vorschlag = SLA Verbund × Ø-Verhältnis OPAG/Verbund der letzten 14 Tage.', notiz)
    ws_ko.write('D8', 'Celonis ab Stichtag', f_lab)
    ws_ko.write_blank('F8', None, st.eingabe_datum)
    ws_ko.data_validation('F8', {'validate': 'date', 'criteria': '>', 'value': dt.date(2020, 1, 1),
                                 'error_message': 'Bitte ein Datum eingeben (TT.MM.JJJJ) oder leer lassen.'})
    ws_ko.write_comment('D8', 'Stände vor diesem Stichtag gehen nicht an Celonis – für eine neue Master-Datei oder einen Neuaufbau, wenn die alten '
                              'Abzüge schon übermittelt sind. Leer = jede Datei, die laut Celonis-Protokoll noch nicht übergeben ist. '
                              'Das Protokoll liegt in %LOCALAPPDATA%\\BUE_Reporting\\Celonis_Upload_Log.txt, neben einer lokalen Master-Datei und im '
                              'ausgeblendeten Blatt Celonis_Log.', notiz)
    ws_ko.write('D7', 'Bereich', f_lab)
    ws_ko.write('F7', BEREICH, f_ein)
    ws_ko.data_validation('F7', {'validate': 'list', 'source': ['HS', 'MAKLER']})
    ws_ko.write_comment('D7', 'HS: Abzüge von HSB4 K, ein Stand je Quelle und Tag. MAKLER: mehrere Einheiten (ODPB, ODPP, KBI …) liefern je Tag eigene Abzüge; '
                              'jede Einheit wird für Eingänge und Abgänge getrennt verglichen, angezeigt wird die Summe (Einheit: Gesamt). '
                              'Neue Themenpostkörbe zählen bei MAKLER ohne Rückfrage zum Standard.', notiz)
    ws_ko.merge_range('D5:F5', '', f_leg)
    ws_ko.write_formula('D5', '=IF(N(F4)>0,"fester Wert gesetzt",IF(Filter!$O$38="","leer = Vorschlag aus Ø 14 Tage (noch keine Daten)",'
                              '"leer = Vorschlag "&FIXED(Filter!$O$38,0)&" (SLA Verbund × Ø "&FIXED(Filter!$O$37,2)&")"))', f_leg)
    # Tabellen ab Zeile 10 (Kopf) – leere Zeilen sind ebenfalls Eingabefelder
    ws_ko.set_row(9, 32)
    ws_ko.write('A10', 'Verwaltungssystemschlüssel', st.kopf)
    ws_ko.write('B10', 'Sparte (Komposit, Leben, KV)', st.kopf)
    ws_ko.write('D10', 'BÜ-Schlüssel (GeVo-Nummer)', st.kopf)
    ws_ko.write_comment('A10', 'Zeilen 11–40 werden beim Laden gelesen. Unbekannte Schlüssel laufen unter „Sonstige“.', notiz)
    ws_ko.write_comment('D10', 'Grundlage: Fachkonzept BÜ-Reporting, bestätigt: Komposit/Leben 469 und 108, KV 2015 und 6065. Zeilen 11–20 werden gelesen.', notiz)
    vss = list(v.SPARTE_STANDARD.items())
    bue = [108, 469, 2015, 6065]
    for i in range(30):
        r = 10 + i
        ws_ko.set_row(r, 18)
        ws_ko.write(r, 0, vss[i][0] if i < len(vss) else '', st.zeile)          # Eingabetabellen: Zeilen mit Haarlinie
        ws_ko.write(r, 1, vss[i][1] if i < len(vss) else '', st.zeile)
        if i < 10:
            if i < len(bue):
                ws_ko.write_number(r, 3, bue[i], st.zeile_ganz)
            else:
                ws_ko.write_blank(r, 3, None, st.zeile)
    ws_ko.data_validation('B11:B40', {'validate': 'list', 'source': ['Komposit', 'Leben', 'KV'], 'ignore_blank': True,
                                      'input_title': 'Sparte', 'input_message': 'Komposit, Leben oder KV. Unbekannte Schlüssel laufen unter „Sonstige“.'})
    # Pflichtfelder: Schluessel ohne Sparte bzw. Sparte ohne Schluessel zart rot
    ws_ko.conditional_format('A11:A40', {'type': 'formula', 'criteria': '=AND($A11="",$B11<>"")', 'format': st.pflicht})
    ws_ko.conditional_format('B11:B40', {'type': 'formula', 'criteria': '=AND($A11<>"",$B11="")', 'format': st.pflicht})
    # Standard-Auswahl (H:L): welche Themenpostkoerbe und GeVo-Typen zum Standard gehoeren. Namen gespiegelt aus Filter (dort
    # registriert der Lader neue Postkoerbe), daneben ja/nein. Gilt fuer den Report (Rohdatenblatt, Wochenwerte STD_*) und fuer
    # „Auf Standard zurücksetzen“ im Cockpit; im Cockpit auch per Karte „Standard festlegen“ einstellbar.
    ws_ko.set_column('G:G', 3)
    ws_ko.set_column('H:H', 26)
    ws_ko.set_column('I:I', 12)
    ws_ko.set_column('J:J', 3)
    ws_ko.set_column('K:K', 30)
    ws_ko.set_column('L:L', 12)
    ws_ko.merge_range('H2:L2', 'Standard-Auswahl', st.kopf)
    f_std_txt = wb.add_format({'font_name': FONT, 'font_size': 9, 'font_color': GRAUD, 'text_wrap': True, 'valign': 'top'})
    ws_ko.merge_range('H3:L8', 'Was gehört zum Standard? Je Themenpostkorb und GeVo-Typ „ja“ oder „nein“ wählen. Der Standard gilt für den '
                      'Wochenreport (Blatt Rohdatenblatt) und für „Auf Standard zurücksetzen“ im Cockpit – die Chips im Cockpit ändern ihn nicht. '
                      'Bequemer: im Cockpit „Standard festlegen“. Neue Themenpostkörbe aus den Abzügen erscheinen unten automatisch (zunächst „nein“).', f_std_txt)
    ws_ko.write('H10', 'Themenpostkorb', st.kopf)
    ws_ko.write('I10', 'im Standard', st.kopf)
    ws_ko.write('K10', 'GeVo-Typ', st.kopf)
    ws_ko.write('L10', 'im Standard', st.kopf)
    f_std_name = st.berechnet                         # Namen gespiegelt aus Filter (berechnet)
    f_std_ein = st.eingabe_wahl                       # ja/nein: weisses Feld mit Rahmen, bedingte Formate zeigen den Zustand
    f_std_ja = wb.add_format({'font_color': WEISS, 'bg_color': TEALD, 'border': 1, 'border_color': TEALD})
    f_std_nein = wb.add_format({'font_color': GRAUM, 'bg_color': GRAUXL})
    for i in range(PK_BIS - PK_VON + 1):
        r = 10 + i
        ws_ko.write_formula(r, 7, '=IF(Filter!$B$%d="","",Filter!$B$%d)' % (PK_VON + i, PK_VON + i), f_std_name)
        if i < len(postkoerbe):
            ws_ko.write_string(r, 8, 'ja' if postkoerbe[i] in POSTKOERBE_AKTIV else 'nein', f_std_ein)
        else:
            ws_ko.write_blank(r, 8, None, f_std_ein)
    for i in range(14):
        r = 10 + i
        ws_ko.write_formula(r, 10, '=IF(Filter!$G$%d="","",Filter!$G$%d)' % (5 + i, 5 + i), f_std_name)
        ws_ko.write_string(r, 11, 'ja', f_std_ein)
    for rng in ('I11:I50', 'L11:L24'):
        ws_ko.data_validation(rng, {'validate': 'list', 'source': ['ja', 'nein'], 'ignore_blank': True,
                                    'input_title': 'Standard', 'input_message': 'ja = gehört zum Standard, nein = nicht'})
        ws_ko.conditional_format(rng, {'type': 'cell', 'criteria': '==', 'value': '"ja"', 'format': f_std_ja})
        ws_ko.conditional_format(rng, {'type': 'cell', 'criteria': '==', 'value': '"nein"', 'format': f_std_nein})
    # Feiertage (N:O): Grundlage fuer „FT“ im Kalender (vom Makro beim Oeffnen des Kalenders eingetragen); editierbar
    ws_ko.set_column('M:M', 3)
    ws_ko.set_column('N:N', 12)
    ws_ko.set_column('O:O', 26)
    ws_ko.merge_range('N2:O2', 'Feiertage (Kalender)', st.kopf)
    ws_ko.merge_range('N3:O8', 'Gesetzliche Feiertage bundesweit und NRW. Im Kalender stehen sie automatisch als „FT“ und zählen nicht als Arbeitstag '
                      '(auch nicht für die Produktivität). '
                      'Weitere freie Tage (z. B. Heiligabend, Silvester) einfach unten ergänzen.', f_std_txt)
    ws_ko.write('N10', 'Datum', st.kopf)
    ws_ko.write('O10', 'Feiertag', st.kopf)
    for i in range(50):
        r = 10 + i
        if i < len(FEIERTAGE):
            d, n = FEIERTAGE[i]
            ws_ko.write_datetime(r, 13, dt.datetime(d.year, d.month, d.day), st.zeile_dat)
            ws_ko.write_string(r, 14, n, st.zeile)
        else:
            ws_ko.write_blank(r, 13, None, st.zeile_dat)
            ws_ko.write_blank(r, 14, None, st.zeile)
    ws_ko.data_validation('N11:N60', {'validate': 'date', 'criteria': '>=', 'value': dt.date(2020, 1, 1), 'ignore_blank': True,
                                      'input_title': 'Feiertag', 'input_message': 'Datum TT.MM.JJJJ; im Kalender erscheint an diesem Tag „FT“.'})
    if BEREICH == 'MAKLER':                       # Zuordnung OE_NR -> Einheit (OE-Ebene 4), gelesen von modLaden.EinheitAusOE
        ws_ko.set_column('P:P', 3)
        ws_ko.set_column('Q:Q', 16)
        ws_ko.set_column('R:R', 16)
        ws_ko.merge_range('Q2:R2', 'Einheiten (OE_NR)', st.kopf)
        ws_ko.merge_range('Q3:R8', 'Welche Einheit gehört zu einer OE? Zählt der längste passende Anfang von OE_NR (ODPB1 D, ODPB2HH, ODPBHH → ODPB). '
                          'Ohne passenden Eintrag gelten die Buchstaben am Anfang ohne „HH“. Gilt ab dem nächsten Laden. Zeilen der HS-Einheit '
                          '(OE HSB4 K → HSB) ignoriert das Makler-Reporting.', f_std_txt)
        ws_ko.write('Q10', 'OE_NR beginnt mit', st.kopf)
        ws_ko.write('R10', 'Einheit', st.kopf)
        for i in range(30):
            vorgabe = [('ODPB', 'ODPB'), ('ODPP', 'ODPP'), ('MSUE', 'MSUE'), ('KBI', 'KBI')]
            ws_ko.write(10 + i, 16, vorgabe[i][0] if i < len(vorgabe) else '', st.zeile)
            ws_ko.write(10 + i, 17, vorgabe[i][1] if i < len(vorgabe) else '', st.zeile)
    # Hinweise unter den Tabellen (eigene Zeilen, keine Umbrueche in Tabellenzeilen)
    ws_ko.merge_range('A42:F42', 'Begriffe', st.kopf)
    begriffe = [('Altersklassen des Rückstands', '0–7, 8–30, 31–90 und über 90 Tage seit Eingang, jeweils zum Bezugstag.'),
                ('Eingänge', 'Schlüssel, die heute in der Auswahl sind und es vorher nicht waren: neu im Abzug oder aus einem anderen Postkorb/GeVo gewechselt. '
                             'Schlüssel Verbund: VSS, Ordnungsbegriff, VORG_VERBU_LNR; OPAG zusätzlich OPS_AUFTR_ID, OPS_ARBGUT_LNR.'),
                ('Abgänge', 'Schlüssel, die vorher in der Auswahl waren und es heute nicht mehr sind: abgearbeitet, weitergeleitet, an den 72-Stunden-BOT '
                            'übergeben oder in einen Postkorb/GeVo außerhalb der Auswahl gewechselt.')]
    for k, (b, t) in enumerate(begriffe):
        r = 42 + k
        ws_ko.write(r, 0, b, f_lab)
        ws_ko.merge_range(r, 1, r, 5, t, f_hin)
        ws_ko.set_row(r, 30)
    ws_ko.freeze_panes(2, 0)
    ws_ko.set_landscape()
    ws_ko.fit_to_pages(1, 0)
    name('SparteZuordnung', '=Konfiguration!$A$11:$B$40')
    name('BUESchluessel', '=Konfiguration!$D$11:$D$20')
    # Standard-Auswahl: je Themenpostkorb bzw. GeVo-Typ ja/nein (zeilengleich mit PK_Liste bzw. GV_Liste)
    name('PK_Std', '=Konfiguration!$I$11:$I$50')
    name('GV_Std', '=Konfiguration!$L$11:$L$23')
    name('GV_Std_Rest', '=Konfiguration!$L$24')
    name('FT_Datum', '=Konfiguration!$N$11:$N$60')
    name('FT_Name', '=Konfiguration!$O$11:$O$60')

    # ---------------------------------------------------------- Fakten
    kopf_f = ['Stichtag', 'Quelle', 'Sparte', 'VSS', 'Themenpostkorb', 'GEVO_SL', 'GeVo-Typ', 'GeVo-Nr', 'Rückstand', 'Eingang', 'Abgang',
              'Alter 0–7', 'Alter 8–30', 'Alter 31–90', 'Alter >90', 'Aktiv', 'Standard', 'Einheit', 'Strang', 'Alter max (Tage)',
              'Ältester Vorgang (VSS|Ordnungsbegriff|LNR)', 'Alter Summe (Tage)']
    for c, t in enumerate(kopf_f):
        ws_f.write(0, c, t, st.kopf)
    ws_f.set_row(0, 24)
    ws_f.set_column('A:A', 11, st.zelle_dat)
    ws_f.set_column('B:D', 9, st.zelle)
    ws_f.set_column('E:E', 15, st.zelle)
    ws_f.set_column('F:G', 30, st.zelle)
    ws_f.set_column('H:H', 9, st.zelle_ganz)          # GeVo-Nummer ohne Tausenderpunkt
    ws_f.set_column('I:O', 10, st.zelle_zahl)
    ws_f.set_column('P:Q', 9, st.zelle_ganz)          # Kennzeichen 1/0
    ws_f.set_column('R:R', 10, st.zelle)              # Einheit der Zeile aus OE_NR (Bereich MAKLER), sonst leer
    ws_f.set_column('S:S', 18, st.zelle)              # Strang fuer den Vergleich (seit 12.88 die Einheit, Zeilen anderer OEs: Haupteinheit des Blatts)
    ws_f.set_column('T:T', 10, st.zelle_ganz)         # hoechstes Rueckstandsalter der Zeile (KPI „Ältester Vorgang“)
    ws_f.set_column('U:U', 30, st.zelle)              # Schluessel des aeltesten Datensatzes (Knopf „Details“ an der Kachel)
    ws_f.set_column('V:V', 11, st.zelle_ganz)         # Summe der Rueckstandsalter der Zeile (KPI „Ø Alter Vorgang“ = V / Rueckstand)
    ws_f.freeze_panes(1, 0)

    def fakten_formeln(r):
        # eine Formel je Zeile: 1 = Zeile zaehlt (Postkorb im Filter und GeVo-Typ im Filter); unbekannte Postkoerbe zaehlen
        z = r + 1
        # Einheit (Filter!L16, Bereich MAKLER): Gesamt oder leer = alle Einheiten; dazu die Einheiten-Chips (EH_Aktiv, 12.86) –
        # Einheit nicht in der Chip-Liste (HS, leere Einheit, mehr als sechs Einheiten) zaehlt immer
        ws_f.write_formula(r, 15, '=IF(AND(IFERROR(INDEX(SP_Aktiv,MATCH(C%d,SP_Liste,0)),TRUE),IFERROR(INDEX(PK_Aktiv,MATCH(E%d,PK_Liste,0)),TRUE),'
                                  'IF(Filter!$L$5="Alle GeVo",TRUE,IF(Filter!$L$5="Nur BÜ-Schlüssel",ISNUMBER(MATCH(H%d,BUESchluessel,0)),'
                                  'IFERROR(INDEX(GV_Aktiv,MATCH(G%d,GV_Liste,0)),Filter!$H$18))),'
                                  'OR(Filter!$L$16="",Filter!$L$16="Gesamt",$R%d=Filter!$L$16),IFERROR(INDEX(EH_Aktiv,MATCH($R%d,EH_Liste,0)),TRUE)),1,0)'
                           % (z, z, z, z, z, z), st.zelle_ganz)
        # Q: 1 = Zeile gehoert zum Standard (Themenpostkorb und GeVo-Typ laut Konfiguration „ja“) – Grundlage des Reports, unabhaengig von den Chips
        ws_f.write_formula(r, 16, '=IF(AND(IFERROR(INDEX(PK_Std,MATCH(E%d,PK_Liste,0))="ja",FALSE),'
                                  'IFERROR(INDEX(GV_Std,MATCH(G%d,GV_Liste,0))="ja",GV_Std_Rest="ja")),1,0)' % (z, z), st.zelle_ganz)
    # ---------------------------------------------------------- Umbuchungen
    kopf_u = ['Stichtag', 'Quelle', 'Sparte', 'Postkorb vorher', 'GeVo-Typ vorher', 'GeVo-Nr vorher', 'Postkorb heute', 'GeVo-Typ heute',
              'GeVo-Nr heute', 'Anzahl', 'Vorher aktiv', 'Heute aktiv', 'Vorher Standard', 'Heute Standard', 'Vorher Postkorb aktiv',
              'Heute Postkorb aktiv', 'Einheit heute', 'Strang', 'Einheit vorher']
    for c, t in enumerate(kopf_u):
        ws_u.write(0, c, t, st.kopf)
    ws_u.set_row(0, 24)
    ws_u.set_column('A:A', 11, st.zelle_dat)
    ws_u.set_column('B:C', 9, st.zelle)
    ws_u.set_column('D:D', 15, st.zelle)
    ws_u.set_column('E:E', 28, st.zelle)
    ws_u.set_column('F:F', 9, st.zelle_ganz)
    ws_u.set_column('G:G', 15, st.zelle)
    ws_u.set_column('H:H', 28, st.zelle)
    ws_u.set_column('I:I', 9, st.zelle_ganz)
    ws_u.set_column('J:J', 9, st.zelle_zahl)
    ws_u.set_column('K:P', 10, st.zelle_ganz)
    ws_u.set_column('Q:S', 14, st.zelle)
    ws_u.freeze_panes(1, 0)

    def umb_formeln(r):
        z = r + 1
        aktiv = ('=IF($J{0}="","",IF(AND(IFERROR(INDEX(SP_Aktiv,MATCH($C{0},SP_Liste,0)),TRUE),IFERROR(INDEX(PK_Aktiv,MATCH({pk}{0},PK_Liste,0)),TRUE),'
                 'IF(Filter!$L$5="Alle GeVo",TRUE,IF(Filter!$L$5="Nur BÜ-Schlüssel",ISNUMBER(MATCH({nr}{0},BUESchluessel,0)),'
                 'IFERROR(INDEX(GV_Aktiv,MATCH({typ}{0},GV_Liste,0)),Filter!$H$18))),OR(Filter!$L$16="",Filter!$L$16="Gesamt",${ein}{0}=Filter!$L$16),'
                 'IFERROR(INDEX(EH_Aktiv,MATCH(${ein}{0},EH_Liste,0)),TRUE)),1,0))')
        std = ('=IF($J{0}="","",IF(AND(IFERROR(INDEX(PK_Std,MATCH({pk}{0},PK_Liste,0))="ja",FALSE),'
               'IFERROR(INDEX(GV_Std,MATCH({typ}{0},GV_Liste,0))="ja",GV_Std_Rest="ja")),1,0))')
        pkf = '=IF($J{0}="","",IFERROR(IF(INDEX(PK_Aktiv,MATCH({pk}{0},PK_Liste,0))=TRUE,1,0),0))'
        for c, (vorlage, (pk, typ, nr)) in enumerate(((aktiv, 'DEF'), (aktiv, 'GHI'), (std, 'DEF'), (std, 'GHI'), (pkf, 'DEF'), (pkf, 'GHI'))):
            ws_u.write_formula(r, 10 + c, vorlage.format(z, pk=pk, typ=typ, nr=nr, ein='S' if pk == 'D' else 'Q'), st.zelle_ganz)   # Einheit vorher/heute
    for i, u in enumerate(UMBUCHUNGEN):
        r = i + 1
        ws_u.write_datetime(r, 0, dt.datetime(u[0].year, u[0].month, u[0].day), st.zelle_dat)
        for c in range(1, 9):
            ws_u.write(r, c, u[c], st.zelle_ganz if c in (5, 8) else st.zelle)
        ws_u.write_number(r, 9, u[9], st.zelle_zahl)
        umb_formeln(r)
    if not UMBUCHUNGEN:
        umb_formeln(1)

    for i, z in enumerate(fakten):
        r = i + 1
        ws_f.write_datetime(r, 0, dt.datetime(z[0].year, z[0].month, z[0].day), st.zelle_dat)
        for c in range(1, 8):
            ws_f.write(r, c, z[c], st.zelle if c < 7 else st.zelle_ganz)
        for c in range(8, 15):
            ws_f.write_number(r, c, z[c], st.zelle_zahl)
        if len(z) > 15:
            ws_f.write_number(r, 19, z[15], st.zelle_ganz)
        if len(z) > 16:
            ws_f.write_number(r, 21, z[16], st.zelle_ganz)
        fakten_formeln(r)
    if not fakten:
        fakten_formeln(1)
    ws_f.autofilter(0, 0, max(1, len(fakten)), 16)

    # ---------------------------------------------------------- Filter
    ws_fi.set_column('A:A', 2)
    ws_fi.set_column('B:B', 20)
    ws_fi.set_column('C:C', 8)
    ws_fi.set_column('D:E', 13)
    ws_fi.set_column('F:F', 2)
    ws_fi.set_column('G:G', 30)
    ws_fi.set_column('H:I', 9)
    ws_fi.set_column('J:J', 13)
    ws_fi.set_column('K:K', 2)
    ws_fi.set_column('L:L', 26)
    ws_fi.set_column('M:M', 2)
    ws_fi.set_column('N:N', 46)
    ws_fi.set_column('O:R', 13)
    ws_fi.set_column('S:S', 12)
    ws_fi.set_column('T:T', 8)
    ws_fi.set_row(3, 30)
    ws_fi.hide_gridlines(2)
    ws_fi.set_landscape()
    ws_fi.fit_to_pages(1, 0)
    ws_fi.write('B1', 'Filter und Hilfsgrößen', st.titel)
    ws_fi.write('B2', 'Hilfsblatt: Die Chips im Cockpit schreiben WAHR/FALSCH in die Spalten C (Themenpostkörbe), H (GeVo-Typen) und T (Sparten); die Spalten lassen sich auch direkt bearbeiten. Rechts die berechneten Hilfsgrößen (nicht bearbeiten).', st.untertitel)
    ws_fi.write('B3', LEGENDE_EINGABE, st.legende)
    ws_fi.freeze_panes(4, 0)
    ws_fi.write('S4', 'Sparte', st.kopf)
    ws_fi.write('T4', 'Aktiv', st.kopf)
    ws_fi.write('V4', 'Sätze in Fakten', st.kopf)
    for i, sp in enumerate(['Komposit', 'Leben', 'KV', 'Sonstige']):
        ws_fi.write(4 + i, 18, sp, st.zelle)
        ws_fi.write_boolean(4 + i, 19, True, st.eingabe_wahl)
        # V: Sparte kommt in den geladenen Daten vor (sonst kein Chip im Cockpit, z. B. ohne KV)
        ws_fi.write_formula(4 + i, 21, '=COUNTIF(Fakten!$C$2:$C$%d,S%d)' % (MAX_FAKTEN, 5 + i), st.berechnet_zahl)
    for c, (t, fk) in enumerate([('Themenpostkorb', st.kopf), ('Aktiv', st.kopf), ('Rückstand Verbund', st.kopf_verbund), ('Rückstand OPAG', st.kopf_opag)]):
        ws_fi.write(3, 1 + c, t, fk)
    ws_fi.write('U4', 'Sätze in Fakten', st.kopf)
    ws_fi.set_column('U:V', 12)
    bl = lambda nm: block(nm, '$O$22', '$O$23')     # Fakten-Zeilen des letzten Stichtags  # noqa: E731
    for i in range(PK_BIS - PK_VON + 1):
        r = PK_VON - 1 + i
        if i < len(postkoerbe):
            ws_fi.write(r, 1, postkoerbe[i], st.zelle)
            ws_fi.write_boolean(r, 2, postkoerbe[i] in POSTKOERBE_AKTIV, st.eingabe_wahl)
        else:
            ws_fi.write_blank(r, 2, None, st.eingabe_wahl)         # freie Plaetze: der Lader traegt neue Postkoerbe hier ein
        ws_fi.write_formula(r, 3, '=IF(B%d="","",SUMIFS(%s,%s,$O$32,%s,"Verbund",%s,B%d))' % (r + 1, bl('F_Rueckstand'), bl('F_Stichtag'), bl('F_Quelle'), bl('F_Postkorb'), r + 1), st.berechnet_zahl)
        ws_fi.write_formula(r, 4, '=IF(B%d="","",SUMIFS(%s,%s,$O$31,%s,"OPAG",%s,B%d))' % (r + 1, bl('F_Rueckstand'), bl('F_Stichtag'), bl('F_Quelle'), bl('F_Postkorb'), r + 1), st.berechnet_zahl)
        # U: Postkorb kommt in den geladenen Daten vor (nur dann ein Chip im Cockpit; HS-Postkoerbe fehlen so bei ODPB-Daten)
        ws_fi.write_formula(r, 20, '=IF(B%d="",0,COUNTIF(Fakten!$E$2:$E$%d,B%d))' % (r + 1, MAX_FAKTEN, r + 1), st.berechnet_zahl)
    for c, (t, fk) in enumerate([('GeVo-Typ', st.kopf), ('Kästchen', st.kopf), ('wirksam', st.kopf), ('Rückstand Verbund', st.kopf_verbund)]):
        ws_fi.write(3, 6 + c, t, fk)
    for i in range(13):
        r = 4 + i
        if i < len(gevo_typen):
            ws_fi.write(r, 6, gevo_typen[i], st.zelle)
        ws_fi.write_boolean(r, 7, True, st.eingabe_wahl)
        ws_fi.write_formula(r, 8, '=IF($L$5="Alle GeVo",TRUE,IF($L$5="Nur BÜ-Schlüssel",ISNUMBER(MATCH(IFERROR(VALUE(LEFT(G%d,FIND(" ",G%d&" ")-1)),-1),BUESchluessel,0)),H%d))' % (r + 1, r + 1, r + 1), st.berechnet_wahl)
        ws_fi.write_formula(r, 9, '=IF(G%d="","",SUMIFS(%s,%s,$O$32,%s,"Verbund",%s,G%d))' % (r + 1, bl('F_Rueckstand'), bl('F_Stichtag'), bl('F_Quelle'), bl('F_GevoTyp'), r + 1), st.berechnet_zahl)
    ws_fi.write('G18', 'Alle übrigen GeVo-Typen', st.zelle)
    ws_fi.write_boolean('H18', True, st.eingabe_wahl)
    ws_fi.write_formula('I18', '=IF($L$5="Alle GeVo",TRUE,IF($L$5="Nur BÜ-Schlüssel",FALSE,H18))', st.berechnet_wahl)
    ws_fi.write_formula('J18', '=SUMIFS(%s,%s,$O$32,%s,"Verbund")-SUM(J5:J17)' % (bl('F_Rueckstand'), bl('F_Stichtag'), bl('F_Quelle')), st.berechnet_zahl)
    ws_fi.write('L4', 'GeVo-Modus', st.kopf)
    ws_fi.write('L5', 'Alle GeVo', st.eingabe)
    ws_fi.data_validation('L5', {'validate': 'list', 'source': ['Alle GeVo', 'Nur BÜ-Schlüssel', 'Manuelle Auswahl']})
    ws_fi.write_comment('L4', 'Alle GeVo: kein GeVo-Filter. Nur BÜ-Schlüssel: GeVo-Nummern aus Konfiguration. Manuelle Auswahl: Kästchen im Cockpit.', {'author': 'BÜ-Reporting', 'x_scale': 2.2, 'y_scale': 1.4, 'font_name': FONT, 'font_size': 9})
    # Hilfsgroessen
    ws_fi.write('L8', 'Ansicht', st.kopf)
    ws_fi.write('L9', 'Woche', st.eingabe)                # Standard Wochensicht; Workbook_Open stellt sie beim Öffnen wieder ein
    ws_fi.data_validation('L9', {'validate': 'list', 'source': ['Tag', 'KW', 'Woche']})
    ws_fi.write_comment('L8', 'Tag = letzte 7 Stichtage bis zum Bezugstag. KW = Knopf „Aktuelle KW“: Montag bis Sonntag der Kalenderwoche des Bezugstags '
                              '(Tage ohne Stand und nach dem Bezugstag bleiben leer). Woche = letzte 7 Kalenderwochen (Rückstand je KW = Stand vom Sonntag '
                              'der KW, der Montag gehört zur neuen KW; fehlt der Sonntag, der letzte Stand der KW, in einer abgeschlossenen KW mit * am Datum; '
                              'laufende KW = neuester Stand. Bewegungen als Wochensumme, unter der KW das Datum des verwendeten Stands der Quelle, z. B. „11.10. (So.)“).',
                        {'author': 'BÜ-Reporting', 'x_scale': 2.6, 'y_scale': 1.9, 'font_name': FONT, 'font_size': 9})
    ws_fi.write('L12', 'Quelle Eingänge/Abgänge', st.kopf)
    ws_fi.write('L13', 'Verbund', st.eingabe)
    ws_fi.data_validation('L13', {'validate': 'list', 'source': ['Verbund', 'OPAG']})
    ws_fi.write_comment('L12', 'Bookmark-Chips der Kachel „Eingänge und Abgänge“ im Cockpit: Verbund (Vorgänge) oder OPAG (Arbeitsgüter).', {'author': 'BÜ-Reporting', 'x_scale': 2.2, 'y_scale': 1.4, 'font_name': FONT, 'font_size': 9})
    ws_fi.write('L15', 'Einheit (Bereich Makler)', st.kopf)
    ws_fi.write('L16', 'Gesamt', st.eingabe)
    ws_fi.write_comment('L15', 'Gesamt = alle Einheiten zusammen (Standard). Eine Einheit (z. B. ODPB D) filtert Fakten und Umbuchungen über deren Spalte Einheit; '
                               'bleibt auf Gesamt (der Knopf im Cockpit entfällt ab 12.70; die Chips „Sparte | Einheit“ zeigen die Einheiten nebeneinander).', {'author': 'BÜ-Reporting', 'x_scale': 2.2, 'y_scale': 1.4, 'font_name': FONT, 'font_size': 9})
    ws_fi.write('L18', 'Sicht Rückstand', st.kopf)
    ws_fi.write('L19', 'Sparte', st.eingabe)
    ws_fi.data_validation('L19', {'validate': 'list', 'source': ['Sparte', 'Einheit']})
    ws_fi.write_comment('L18', 'Stapel der Rückstandsdiagramme (Cockpit und Folie): Sparte (Komposit, Leben, KV, Sonstige) oder Einheit (Namen in L22:L25, '
                               'vom Makro nach dem Laden gesetzt). Chips „Sparte | Einheit“ in der Kopfleiste „Rückstand OPAG“ (Bereich Makler).',
                        {'author': 'BÜ-Reporting', 'x_scale': 2.2, 'y_scale': 1.4, 'font_name': FONT, 'font_size': 9})
    ws_fi.write('L27', 'Beladung läuft (Name, seit)', st.kopf)
    ws_fi.write_blank('L28', None, st.zelle)
    ws_fi.write_blank('L29', None, wb.add_format({'font_name': FONT, 'font_size': 9, 'num_format': 'dd.mm.yyyy hh:mm'}))
    ws_fi.write_comment('L27', 'Setzt das Makro beim Start von „Neue Daten laden“ (Name, Beginn) und leert es am Ende; die Datei wird dafür jeweils '
                               'gespeichert. Das Cockpit zeigt dann oben rechts eine orange Box, und wer zugleich „Neue Daten laden“ klickt, wird '
                               'gebeten zu warten. Nach 3 Stunden ohne Ende gilt die Beladung als abgebrochen.', {'author': 'BÜ-Reporting', 'x_scale': 2.2, 'y_scale': 1.6, 'font_name': FONT, 'font_size': 9})
    # X/Y: Einheiten-Chips im Cockpit (Bereich Makler, 12.86): Name (modLaden.EinheitChipsSetzen nach dem Laden), im Filter WAHR/FALSCH
    ws_fi.write('X4', 'Einheit (Chips)', st.kopf)
    ws_fi.write('Y4', 'Aktiv', st.kopf)
    ws_fi.set_column('X:X', 16)
    ws_fi.set_column('Y:Y', 8)
    for i in range(6):
        ws_fi.write_blank(4 + i, 23, None, st.zelle)
        ws_fi.write_boolean(4 + i, 24, True, st.eingabe_wahl)
    ws_fi.write('L21', 'Einheiten (Sicht)', st.kopf)
    for i in range(4):
        ws_fi.write_blank(21 + i, 11, None, st.zelle)
    ws_fi.write('Q1', 0, st.rechts_grau)
    ws_fi.write('R1', 'Chip unter dem Mauszeiger (Cockpit, Hover)', st.legende)
    ws_fi.write('N4', 'Hilfsgrößen', st.kopf)
    ws_fi.write('O4', 'Wert', st.kopf)
    ws_fi.write('N5', 'Letzter Stichtag', st.zelle)
    ws_fi.write_formula('O5', '=O40', st.berechnet_dat)                  # letzter Stichtag = Bezugstag (Cockpit!L12, leer = neuester)
    ws_fi.write('N6', 'Vorheriger Stichtag', st.zelle)
    ws_fi.write_formula('O6', '=IF(O40="","",IF(COUNTIFS(Verlauf!$A$6:$A$%d,"<"&O40)=0,"",MAXIFS(Verlauf!$A$6:$A$%d,Verlauf!$A$6:$A$%d,"<"&O40)))' % (MAX_VERLAUF, MAX_VERLAUF, MAX_VERLAUF), st.berechnet_dat)
    # Bezugstag: Eingabe im Cockpit (L12, Auswahlliste der Stichtage, Knoepfe zurueck/vor/neuester); leer = neuester Stand. Liegt die
    # Eingabe zwischen zwei Stichtagen, gilt der letzte Stichtag davor.
    ws_fi.write('N40', 'Bezugstag (wirksam)', st.zelle)
    ws_fi.write_formula('O40', '=IF(COUNT(Verlauf!$A$6:$A$%d)=0,"",IF(N(Cockpit!$L$12)=0,MAX(Verlauf!$A$6:$A$%d),IF(COUNTIFS(Verlauf!$A$6:$A$%d,"<="&Cockpit!$L$12)=0,'
                               'MIN(Verlauf!$A$6:$A$%d),MAXIFS(Verlauf!$A$6:$A$%d,Verlauf!$A$6:$A$%d,"<="&Cockpit!$L$12))))' % ((MAX_VERLAUF,) * 6), st.berechnet_dat)
    ws_fi.write('N42', 'Tagesablauf zuletzt abgeschlossen (VBA)', st.zelle)
    ws_fi.write_blank('O42', None, st.berechnet_datzeit)
    # Zeile in KW fuer die Produktivitaets-Kachel: KW des letzten Stands; hat diese KW noch keinen Wert (z. B. noch keine Abgaenge),
    # gilt die letzte KW davor mit Produktivitaet (die Kachel nennt die KW)
    def kw_mit_wert(stand, prod):
        basis = 'IFERROR(MATCH(INDEX(Verlauf!$B$6:$B$%d,%s)*100+INDEX(Verlauf!$C$6:$C$%d,%s),KW!$W$6:$W$400,0),0)' % (MAX_VERLAUF, stand, MAX_VERLAUF, stand)
        ber = 'KW!$%s$6:INDEX(KW!$%s$6:$%s$400,%s)' % (prod, prod, prod, basis)
        return '=IF(%s=0,0,IF(%s=0,0,IFERROR(LOOKUP(2,1/ISNUMBER(%s),ROW(%s)-5),%s)))' % (stand, basis, ber, ber, basis)
    ws_fi.write('N43', 'Zeile in KW: letzte KW mit Produktivität (Verbund)', st.zelle)
    ws_fi.write_formula('O43', kw_mit_wert('O29', 'Q'), st.berechnet_zahl)
    ws_fi.write('N44', 'Zeile in KW: letzte KW mit Produktivität (OPAG)', st.zelle)
    ws_fi.write_formula('O44', kw_mit_wert('O27', 'T'), st.berechnet_zahl)
    ws_fi.write('N46', 'Kacheln auf der PPT-Folie (1 = ja, Reihenfolge wie Blatt PPT)', st.zelle)
    # Ältester Vorgang: hoechstes Rueckstandsalter am letzten Stichtag je Quelle (nach aktivem Filter), Datum = Stichtag minus Alter
    for zr, (q, kz, tag) in enumerate((('Verbund', '$O$29', '$O$32'), ('OPAG', '$O$27', '$O$31'))):
        ws_fi.write(46 + zr, 13, 'Ältester Vorgang %s: Alter (Tage)' % q, st.zelle)
        ws_fi.write_formula(46 + zr, 14, '=IF(%s=0,"",MAXIFS(%s,%s,%s,%s,"%s",%s,1))' % (kz, bl('F_AlterMax'), bl('F_Stichtag'), tag, bl('F_Quelle'), q, bl('F_Aktiv')), st.berechnet_zahl)
        # Ø Alter (12.84): Summe der Rueckstandsalter / Rueckstand am selben Stichtag, gleicher Filter – Q47 Verbund, Q48 OPAG
        ws_fi.write(46 + zr, 15, 'Ø Alter %s (Tage)' % q, st.zelle)
        ws_fi.write_formula(46 + zr, 16, '=IF(%s=0,"",IFERROR(1/(1/SUMIFS(%s,%s,%s,%s,"%s",%s,1))/SUMIFS(%s,%s,%s,%s,"%s",%s,1),""))'
                            % (kz, bl('F_AlterSumme'), bl('F_Stichtag'), tag, bl('F_Quelle'), q, bl('F_Aktiv'),
                               bl('F_Rueckstand'), bl('F_Stichtag'), tag, bl('F_Quelle'), q, bl('F_Aktiv')), st.berechnet_zahl)
    ws_fi.write_string('O46', '111111', st.berechnet)
    ws_fi.write('N45', 'Früherer Bezugstag aktiv (1/0)', st.zelle)
    ws_fi.write_formula('O45', '=IF(OR(O40="",COUNT(Verlauf!$A$6:$A$%d)=0),0,IF(O40<MAX(Verlauf!$A$6:$A$%d),1,0))' % (MAX_VERLAUF, MAX_VERLAUF), st.berechnet_zahl)
    ws_fi.write('N41', 'Zeile Bezugstag im Verlauf', st.zelle)
    ws_fi.write_formula('O41', '=IFERROR(MATCH(O40,Verlauf!$A$6:$A$%d,0),0)' % MAX_VERLAUF, st.berechnet_zahl)
    ws_fi.write('N7', 'Zeile letzter Stichtag', st.zelle)
    ws_fi.write_formula('O7', '=IFERROR(MATCH(O5,Verlauf!$A$6:$A$%d,0),0)' % MAX_VERLAUF, st.berechnet_zahl)
    ws_fi.write('N8', 'Zeile vorheriger Stichtag', st.zelle)
    ws_fi.write_formula('O8', '=IFERROR(MATCH(O6,Verlauf!$A$6:$A$%d,0),0)' % MAX_VERLAUF, st.berechnet_zahl)
    ws_fi.write('N9', 'Jahr (ISO) letzter Stichtag', st.zelle)
    ws_fi.write_formula('O9', '=IF(O7=0,"",INDEX(Verlauf!$B$6:$B$%d,O7))' % MAX_VERLAUF, st.berechnet_ganz)
    ws_fi.write('N10', 'KW letzter Stichtag', st.zelle)
    ws_fi.write_formula('O10', '=IF(O7=0,"",INDEX(Verlauf!$C$6:$C$%d,O7))' % MAX_VERLAUF, st.berechnet_zahl)
    ws_fi.write('N11', 'Zeile in KW', st.zelle)
    ws_fi.write_formula('O11', '=IFERROR(MATCH(O9*100+O10,KW!$W$6:$W$400,0),0)', st.berechnet_zahl)
    # Je Quelle der letzte und vorherige Stichtag MIT Stand (Verlauf!AN/AO) – die Quellen koennen verschiedene letzte Tage haben
    for zr, (text, kz, k) in enumerate((('Zeile letzter OPAG-Stand', 'AN', 1), ('Zeile vorheriger OPAG-Stand', 'AN', 2),
                                        ('Zeile letzter Verbund-Stand', 'AO', 1), ('Zeile vorheriger Verbund-Stand', 'AO', 2))):
        ws_fi.write(26 + zr, 13, text, st.zelle)
        ws_fi.write_formula(26 + zr, 14, '=IFERROR(AGGREGATE(14,6,(ROW(Verlauf!$A$6:$A$%d)-5)/((Verlauf!$%s$6:$%s$%d=1)*(Verlauf!$A$6:$A$%d<=$O$40)),%d),0)'
                            % (MAX_VERLAUF, kz, kz, MAX_VERLAUF, MAX_VERLAUF, k), st.berechnet_zahl)
    for zr, (text, z) in enumerate((('Letzter OPAG-Stand', 'O27'), ('Letzter Verbund-Stand', 'O29'))):
        ws_fi.write(30 + zr, 13, text, st.zelle)
        ws_fi.write_formula(30 + zr, 14, '=IF(%s=0,"",INDEX(Verlauf!$A$6:$A$%d,%s))' % (z, MAX_VERLAUF, z), st.berechnet_dat)
    # Ø-Verhaeltnis OPAG-Arbeitsgueter je Verbund-Vorgang ueber die letzten 14 Tage (bis zum letzten Stichtag), nur Tage mit
    # Stand beider Quellen; Summe OPAG / Summe Verbund. Daraus der SLA-Vorschlag OPAG = SLA Verbund x Ø gesamt (auf 100 gerundet).
    for zr, (text, o_col, v_col) in enumerate((('Ø Verhältnis 14 Tage Komposit', 'D', 'N'), ('Ø Verhältnis 14 Tage Leben', 'E', 'O'),
                                               ('Ø Verhältnis 14 Tage KV', 'F', 'P'), ('Ø Verhältnis 14 Tage gesamt', 'H', 'R'))):
        krit = 'Verlauf!$A$6:$A$%d,">="&($O$5-13),Verlauf!$A$6:$A$%d,"<="&$O$5,Verlauf!$AN$6:$AN$%d,1,Verlauf!$AO$6:$AO$%d,1' % ((MAX_VERLAUF,) * 4)
        ws_fi.write(33 + zr, 13, text, st.zelle)
        ws_fi.write_formula(33 + zr, 14, '=IFERROR(SUMIFS(Verlauf!$%s$6:$%s$%d,%s)/SUMIFS(Verlauf!$%s$6:$%s$%d,%s),"")'
                            % (o_col, o_col, MAX_VERLAUF, krit, v_col, v_col, MAX_VERLAUF, krit), st.berechnet_dez)
    ws_fi.write('N38', 'SLA-Vorschlag OPAG (SLA Verbund × Ø gesamt)', st.zelle)
    ws_fi.write_formula('O38', '=IF(OR(O37="",N(Konfiguration!$F$3)=0),"",ROUND(Konfiguration!$F$3*O37,-2))', st.berechnet_zahl)
    ws_fi.write('N39', 'SLA OPAG im Diagramm', st.zelle)
    ws_fi.write_formula('O39', '=IF(N(Konfiguration!$F$4)>0,Konfiguration!$F$4,O38)', st.berechnet_zahl)
    ws_fi.write('N19', 'Δ Rückstand OPAG ggü. vorherigem OPAG-Stand', st.zelle)
    ws_fi.write_formula('O19', '=IF(OR(O27=0,O28=0),"",INDEX(Verlauf!$H$6:$H$%d,O27)-INDEX(Verlauf!$H$6:$H$%d,O28))' % (MAX_VERLAUF, MAX_VERLAUF), st.berechnet_zahl)
    ws_fi.write('N20', 'Δ Rückstand Verbund ggü. vorherigem Verbund-Stand', st.zelle)
    ws_fi.write_formula('O20', '=IF(OR(O29=0,O30=0),"",INDEX(Verlauf!$R$6:$R$%d,O29)-INDEX(Verlauf!$R$6:$R$%d,O30))' % (MAX_VERLAUF, MAX_VERLAUF), st.berechnet_zahl)
    ws_fi.write('N14', 'Altersstruktur (Bezugstag, Filter aktiv)', st.kopf)
    for c, t in enumerate(['0–7 Tage', '8–30 Tage', '31–90 Tage', 'über 90 Tage']):
        ws_fi.write(13, 14 + c, t, st.spalte)
    for i, q in enumerate(['OPAG', 'Verbund']):
        ws_fi.write(14 + i, 13, q, st.zelle)
        for c, nm in enumerate(['F_A0', 'F_A1', 'F_A2', 'F_A3']):
            ws_fi.write_formula(14 + i, 14 + c, '=SUMIFS(%s,%s,%s,%s,"%s",%s,1)' % (bl(nm), bl('F_Stichtag'), '$O$31' if q == 'OPAG' else '$O$32', bl('F_Quelle'), q, bl('F_Aktiv')), st.berechnet_zahl)
    # Fakten-Zeilenblock des letzten Stichtags (aus Verlauf!AL:AM), Planungshorizont, Heute-Schluessel (TODAY nur hier)
    # Fakten-Block ueber die letzten Staende beider Quellen (Fakten sind nach Stichtag geordnet; SUMIFS filtern das Datum)
    ws_fi.write('N22', 'Erste Fakten-Zeile letzte Stände', st.zelle)
    ws_fi.write_formula('O22', '=IF(AND(O27=0,O29=0),1,MIN(IF(O27=0,10^9,INDEX(Verlauf!$AL$6:$AL$%d,O27)),IF(O29=0,10^9,INDEX(Verlauf!$AL$6:$AL$%d,O29))))'
                        % (MAX_VERLAUF, MAX_VERLAUF), st.berechnet_zahl)
    ws_fi.write('N23', 'Letzte Fakten-Zeile letzte Stände', st.zelle)
    ws_fi.write_formula('O23', '=IF(AND(O27=0,O29=0),1,MAX(IF(O27=0,0,INDEX(Verlauf!$AM$6:$AM$%d,O27)),IF(O29=0,0,INDEX(Verlauf!$AM$6:$AM$%d,O29))))'
                        % (MAX_VERLAUF, MAX_VERLAUF), st.berechnet_zahl)
    ws_fi.write('N21', 'Warnung Planungshorizont', st.zelle)
    ws_fi.write_formula('O21', '=IF(O9="","",IF(O9*100+O10>MAX(KW!$W$6:$W$400),"Der Planungshorizont der Kalenderwochen ist überschritten – Blatt KW, Kalender und Wirksam müssen im Build erweitert werden (kw_liste).",""))', st.berechnet)
    ws_fi.write('N24', 'Heute: ISO-Schlüssel Jahr*100+KW', st.zelle)
    ws_fi.write_formula('O24', '=YEAR(TODAY()-WEEKDAY(TODAY(),2)+4)*100+ISOWEEKNUM(TODAY())', st.berechnet_ganz)
    ws_fi.write('N25', 'Vergangen: Montag vor', st.zelle)
    ws_fi.write_formula('O25', '=TODAY()-6', st.berechnet_dat)

    # ---------------------------------------------------------- Verlauf
    ws_v.set_column('A:A', 12)
    ws_v.set_column('B:C', 7)
    ws_v.set_column('D:AK', 11)
    ws_v.write('A1', 'Verlauf je Stichtag', st.titel)
    ws_v.write('A2', 'Alle Werte nach dem aktiven Filter (Themenpostkörbe, GeVo). Zeilen werden beim Laden ergänzt; Formeln der letzten Zeile werden kopiert.', st.untertitel)
    ws_v.merge_range('A4:C4', '', st.kopf)
    ws_v.merge_range('D4:M4', 'OPAG (Arbeitsgüter)', st.kopf_opag)
    ws_v.merge_range('N4:W4', 'Verbund (Vorgänge)', st.kopf_verbund)
    ws_v.merge_range('AL4:AZ4', 'Hilfsspalten: Fakten-Block, Kennzeichen, Tagesproduktivität und MAK am Tag', st.kopf)
    verbund_hilfe, opag_hilfe = {40, 42, 43, 44, 45}, {39, 41, 46, 47, 48}      # AO/AQ/AR:AT Verbund, AN/AP/AU:AW OPAG

    def spalte_v(c):                     # Spaltenkopf im Ton der Quelle
        if c in SPALTEN_OPAG or c in opag_hilfe:
            return st.spalte_opag
        if c in SPALTEN_VERBUND or c in verbund_hilfe:
            return st.spalte_verbund
        return st.spalte
    kopf_v = ['Stichtag', 'Jahr (ISO)', 'KW'] + ['Rückstand Komposit', 'Rückstand Leben', 'Rückstand KV', 'Rückstand Sonstige', 'Rückstand gesamt',
                                                 'Eingänge', 'Abgänge', 'Abgänge Komposit', 'Abgänge Leben', 'Abgänge KV'] * 2
    kopf_v += ['OPAG Eingänge Komposit', 'OPAG Eingänge Leben', 'OPAG Eingänge KV', 'Verbund Eingänge Komposit', 'Verbund Eingänge Leben', 'Verbund Eingänge KV',
               'OPAG Abgänge Komposit (−)', 'OPAG Abgänge Leben (−)', 'OPAG Abgänge KV (−)', 'Verbund Abgänge Komposit (−)', 'Verbund Abgänge Leben (−)', 'Verbund Abgänge KV (−)',
               'OPAG Netto', 'Verbund Netto']
    ws_v.merge_range('X4:AK4', 'Hilfsspalten für die Diagramme „Eingänge und Abgänge nach Sparte“', st.kopf)
    for c, t in enumerate(kopf_v):
        ws_v.write(4, c, t, spalte_v(c))
    ws_v.write(4, 37, 'erste Fakten-Zeile (Position)', spalte_v(37))
    ws_v.write(4, 39, 'OPAG-Stand geladen (1/0)', spalte_v(39))
    ws_v.write(4, 40, 'Verbund-Stand geladen (1/0)', spalte_v(40))
    ws_v.write(4, 41, 'OPAG-Arbeitstag (1/0)', spalte_v(41))
    ws_v.write(4, 42, 'Verbund-Arbeitstag (1/0)', spalte_v(42))
    for c, t in enumerate(['Prod. Tag Verbund KV', 'Prod. Tag Verbund Komposit/Leben', 'Prod. Tag Verbund gesamt',
                           'Prod. Tag OPAG KV', 'Prod. Tag OPAG Komposit/Leben', 'Prod. Tag OPAG gesamt',
                           'MAK am Tag Gesundheit (KV)', 'MAK am Tag Komposit/Leben', 'MAK am Tag gesamt']):
        ws_v.write(4, 43 + c, t, spalte_v(43 + c))
    ws_v.write(4, 38, 'letzte Fakten-Zeile (Position)', spalte_v(38))
    for c in range(8):                             # BA..BH: Rueckstand je Einheit (Sicht Einheit), Einheit 4 = Rest
        ws_v.write(4, 52 + c, '%s Einheit %d' % ('OPAG' if c < 4 else 'Verbund', c % 4 + 1), spalte_v(39 if c < 4 else 40))
    ws_v.write(4, 60, 'Ø Alter OPAG (Tage)', spalte_v(39))         # BI/BJ: Ø Rueckstandsalter am Stichtag (12.84)
    ws_v.write(4, 61, 'Ø Alter Verbund (Tage)', spalte_v(40))
    ws_v.set_column('AL:AM', 10)
    ws_v.set_column('AN:BJ', 13)
    ws_v.set_row(4, 48)
    ws_v.freeze_panes(5, 1)

    bloecke = {}                                   # Verlauf-Zeile (0-basiert) -> (erste, letzte) Position der Fakten-Zeilen des Stichtags
    for i, d in enumerate(stichtage):
        idx = [k for k, z in enumerate(fakten) if z[0] == d]
        if idx:
            bloecke[5 + i] = (idx[0] + 1, idx[-1] + 1)   # Position 1 = Fakten-Zeile 2

    kw_liste = [(2026, k) for k in range(30, 54)] + [(j, k) for j in (2027, 2028, 2029, 2030) for k in range(1, 53)]   # Planungshorizont bis 2030
    def verlauf_zeile(r):
        x = r + 1
        # AN/AO: 1, wenn fuer diesen Stichtag ein OPAG- bzw. Verbund-Stand geladen ist (Ladeprotokoll mit Rueckstand > 0).
        # Ohne Stand bleiben die Spalten dieser Quelle leer statt 0 – sonst zeigen Diagramme und Kennzahlen einen Rueckstand
        # von 0 an Tagen, an denen nur die andere Quelle einen Abzug hat.
        for c, q in ((39, 'OPAG'), (40, 'Verbund')):
            ws_v.write_formula(r, c, '=IF(COUNTIFS(Ladeprotokoll!$D$5:$D$%d,"%s",Ladeprotokoll!$E$5:$E$%d,$A%d,Ladeprotokoll!$G$5:$G$%d,">0")>0,1,0)'
                               % (LP_MAX, q, LP_MAX, x, LP_MAX), st.zelle_zahl)

        # AP/AQ: 1 = Arbeitstag dieser Quelle: Stand geladen, nicht der erste Stand der Quelle, Montag bis Freitag, kein Feiertag
        # (FT_Datum, Konfiguration N) und Abgaenge > 0 (J OPAG, T Verbund). Wochenenden, Feiertage und Tage ohne Abgaenge zaehlen
        # weder fuer die Tages- noch fuer die Wochenproduktivitaet (Ø MAK nur ueber die gearbeiteten Tage; ihre Abgaenge bleiben im
        # Zaehler der KW wie beim Samstag). Bis 12.78 zaehlte ein Feiertag mit Abgaengen als Arbeitstag mit MAK 0 (Kalender „FT“)
        # und drueckte den Ø MAK der KW.
        for c, kz, ab in ((41, 'AN', 'J'), (42, 'AO', 'T')):
            ws_v.write_formula(r, c, '=IF(AND(%s%d=1,COUNTIFS($A$6:$A$%d,"<"&$A%d,$%s$6:$%s$%d,1)>0,WEEKDAY($A%d,2)<=5,COUNTIF(FT_Datum,$A%d)=0,N(%s%d)>0),1,0)'
                               % (kz, x, MAX_VERLAUF, x, kz, kz, MAX_VERLAUF, x, x, ab, x), st.zelle_zahl)
        # AX/AY/AZ: MAK am Tag = Summe der BUe-MAK aller Mitarbeitenden an diesem Tag laut Kalender (Arbeitszeitmodell aus
        # Mitarbeiter, Abwesenheiten im Kalender), getrennt Gesundheit (KV) und Komposit/Leben, nach Sparten-Chips wie KW!L:M.
        # Summenzeilen unter dem Kalender: KAL_SUMME (Gesundheit), +1 (Komposit); Datumszeile Wirksam!5
        tage = kalender_tage(kw_liste)
        k_ende = xl_col_to_name(PL_SPALTE0 + len(tage) - 1)
        for c, (zs, bed) in enumerate(((KAL_SUMME, 'Filter!$T$7=TRUE'), (KAL_SUMME + 1, 'OR(Filter!$T$5=TRUE,Filter!$T$6=TRUE)'))):
            ws_v.write_formula(r, 49 + c, '=IF(%s,IFERROR(INDEX(Kalender!$%s$%d:$%s$%d,MATCH($A%d,Wirksam!$%s$5:$%s$5,0)),0),0)'
                               % (bed, xl_col_to_name(PL_SPALTE0), zs, k_ende, zs, x, xl_col_to_name(PL_SPALTE0), k_ende), st.zelle_dez)
        ws_v.write_formula(r, 51, '=AX%d+AY%d' % (x, x), st.zelle_dez)
        # AR..AW: Tagesproduktivitaet (Tagessicht) = Abgaenge des Tages je MAK dieses Tages – Verbund KV, Komposit/Leben, Gesamt;
        # OPAG KV, Komposit/Leben, Gesamt. Ohne Bewegungen, ohne MAK oder an Feiertagen (#NV) bleibt der Tag im Diagramm leer.
        for c, (tag, zaehler, mk) in enumerate((('AQ', 'W%d', 'AX'), ('AQ', '(U%d+V%d)', 'AY'), ('AQ', 'T%d', 'AZ'),
                                                 ('AP', 'M%d', 'AX'), ('AP', '(K%d+L%d)', 'AY'), ('AP', 'J%d', 'AZ'))):
            ws_v.write_formula(r, 43 + c, '=IF(AND(%s%d=1,%s%d>0),%s/%s%d,NA())' % (tag, x, mk, x, zaehler.replace('%d', str(x)), mk, x), st.zelle_dez)

        def wq(rr, c, f, fmt):
            kz = 'AN' if c in SPALTEN_OPAG else 'AO' if c in SPALTEN_VERBUND else None
            ws_v.write_formula(rr, c, '=IF($%s%d=0,"",%s)' % (kz, x, f[1:]) if kz else f, fmt)
        ws_v.write_formula(r, 1, '=YEAR(A%d-WEEKDAY(A%d,2)+4)' % (x, x), st.zelle_ganz)
        ws_v.write_formula(r, 2, '=ISOWEEKNUM(A%d)' % x, st.zelle_zahl)
        # AL/AM: erste und letzte Fakten-Zeile (Position im F_*-Bereich) dieses Stichtags – haengen nur von den Fakten ab,
        # rechnen also nach dem Laden, nicht bei Filterklicks. Die SUMIFS lesen dann nur diesen Block (Faktor Stichtage).
        # AL/AM als Werte (VBA VerlaufErgaenzen fuehrt sie beim Laden; keine Array-Formel ueber 300.000 Zeilen)
        pos = bloecke.get(r, (1, 1))
        ws_v.write_number(r, 37, pos[0], st.zelle_zahl)
        ws_v.write_number(r, 38, pos[1], st.zelle_zahl)
        bk = lambda nm: block(nm, '$AL%d' % x, '$AM%d' % x)  # noqa: E731

        def umb(q, sp, ein):
            # Umbuchungen in die Filterauswahl hinein (Eingang) bzw. aus ihr hinaus (Abgang), Blatt Umbuchungen
            spk = ',U_Sparte,"%s"' % sp if sp else ''
            return '+SUMIFS(U_Anzahl,U_Stichtag,$A%d,U_Quelle,"%s"%s,U_HeuteAktiv,%d,U_VorAktiv,%d)' % (x, q, spk, 1 if ein else 0, 0 if ein else 1)
        for b, q in ((3, 'OPAG'), (13, 'Verbund')):
            for i, sp in enumerate(['Komposit', 'Leben', 'KV', 'Sonstige']):
                wq(r, b + i, '=SUMIFS(%s,%s,$A%d,%s,"%s",%s,"%s",%s,1)' % (bk('F_Rueckstand'), bk('F_Stichtag'), x, bk('F_Quelle'), q, bk('F_Sparte'), sp, bk('F_Aktiv')), st.zelle_zahl)
            wq(r, b + 4, '=SUM(%s%d:%s%d)' % (xl_col_to_name(b), x, xl_col_to_name(b + 3), x), st.zelle_zahl)
            wq(r, b + 5, '=SUMIFS(%s,%s,$A%d,%s,"%s",%s,1)' % (bk('F_Eingang'), bk('F_Stichtag'), x, bk('F_Quelle'), q, bk('F_Aktiv')) + umb(q, None, True), st.zelle_zahl)
            wq(r, b + 6, '=SUMIFS(%s,%s,$A%d,%s,"%s",%s,1)' % (bk('F_Abgang'), bk('F_Stichtag'), x, bk('F_Quelle'), q, bk('F_Aktiv')) + umb(q, None, False), st.zelle_zahl)
            for i, sp in enumerate(['Komposit', 'Leben', 'KV']):
                wq(r, b + 7 + i, '=SUMIFS(%s,%s,$A%d,%s,"%s",%s,"%s",%s,1)' % (bk('F_Abgang'), bk('F_Stichtag'), x, bk('F_Quelle'), q, bk('F_Sparte'), sp, bk('F_Aktiv'))
                   + umb(q, sp, False), st.zelle_zahl)
        for b, q in ((23, 'OPAG'), (26, 'Verbund')):          # X..Z, AA..AC: Eingaenge je Sparte
            for i, sp in enumerate(['Komposit', 'Leben', 'KV']):
                wq(r, b + i, '=SUMIFS(%s,%s,$A%d,%s,"%s",%s,"%s",%s,1)' % (bk('F_Eingang'), bk('F_Stichtag'), x, bk('F_Quelle'), q, bk('F_Sparte'), sp, bk('F_Aktiv'))
                   + umb(q, sp, True), st.zelle_zahl)
        for b, quelle_b in ((29, 10), (32, 20)):              # AD..AF, AG..AI: Abgaenge negativ
            for i in range(3):
                wq(r, b + i, '=-%s%d' % (xl_col_to_name(quelle_b + i), x), st.zelle_zahl)
        # BA..BH: Rueckstand je Einheit (Namen Filter!L22:L24), Einheit 4 = Gesamt minus Einheiten 1–3 (vierte Einheit oder „Übrige“)
        for c0, q, kz, ges in ((52, 'OPAG', 'AN', 'H'), (56, 'Verbund', 'AO', 'R')):
            for k in range(3):
                ws_v.write_formula(r, c0 + k, '=IF($%s%d=0,"",IF(Filter!$L$%d="",0,SUMIFS(%s,%s,$A%d,%s,"%s",%s,Filter!$L$%d,%s,1)))'
                                   % (kz, x, 22 + k, bk('F_Rueckstand'), bk('F_Stichtag'), x, bk('F_Quelle'), q, bk('F_Einheit'), 22 + k, bk('F_Aktiv')), st.zelle_zahl)
            ws_v.write_formula(r, c0 + 3, '=IF($%s%d=0,"",N(%s%d)-N(%s%d)-N(%s%d)-N(%s%d))' % (kz, x, ges, x, xl_col_to_name(c0), x, xl_col_to_name(c0 + 1), x, xl_col_to_name(c0 + 2), x), st.zelle_zahl)
        # BI/BJ: Ø Rueckstandsalter = Summe der Alter (Fakten!V) / Rueckstand gesamt (H bzw. R), gleicher Filter; Summe 0 = Stand
        # vor 12.84 ohne Alterssumme -> leer statt 0
        for c0, q, kz, ges in ((60, 'OPAG', 'AN', 'H'), (61, 'Verbund', 'AO', 'R')):
            ws_v.write_formula(r, c0, '=IF(OR($%s%d=0,N(%s%d)=0),"",IFERROR(1/(1/SUMIFS(%s,%s,$A%d,%s,"%s",%s,1))/%s%d,""))'
                               % (kz, x, ges, x, bk('F_AlterSumme'), bk('F_Stichtag'), x, bk('F_Quelle'), q, bk('F_Aktiv'), ges, x), st.zelle_dez)
        wq(r, 35, '=I%d-J%d' % (x, x), st.zelle_zahl)       # AJ OPAG Netto
        wq(r, 36, '=S%d-T%d' % (x, x), st.zelle_zahl)       # AK Verbund Netto
    for i, d in enumerate(stichtage):
        ws_v.write_datetime(5 + i, 0, dt.datetime(d.year, d.month, d.day), st.zelle_dat)
        verlauf_zeile(5 + i)
    if not stichtage:
        verlauf_zeile(5)

    # ---------------------------------------------------------- KW
    ws_k.set_column('A:B', 7)
    ws_k.set_column('C:C', 10)
    ws_k.set_column('D:AN', 11)
    ws_k.write('A1', 'Kalenderwochen: Abgänge, Kapazität (MAK) und Produktivität', st.titel)
    ws_k.write('A2', 'Produktivität = Abgänge je MAK in der Kalenderwoche (Wochensicht), je Vorgang (Verbund) und je Arbeitsgut (OPAG): Abgänge der KW ÷ Ø MAK ihrer Arbeitstage (Mo–Fr ohne Feiertage, mit Abgängen; AU/AV). Die neueste KW wird hochgerechnet, solange der Stand ihres letzten Werktags fehlt (kommt am Folgetag, längstens bis zum Werktag danach): × Arbeitstage der KW ÷ Arbeitstage bis zum letzten Stand (BK:BO); die Tagessicht rechnet je Stichtag (Verlauf!AR:AW), die Kachel dort mit dem Ø der Tageswerte Mo–Fr ohne Feiertage (Filter!N50).', st.untertitel)
    ws_k.set_row(3, 28)
    ws_k.merge_range('A4:C4', '', st.kopf)
    ws_k.merge_range('D4:G4', 'Abgänge OPAG', st.kopf_opag)
    ws_k.merge_range('H4:K4', 'Abgänge Verbund', st.kopf_verbund)
    ws_k.merge_range('L4:N4', 'MAK (Anwesenheit)', st.kopf)
    ws_k.merge_range('O4:Q4', 'Produktivität je Vorgang (Verbund-Abgänge je MAK)', st.kopf_verbund)
    ws_k.merge_range('R4:T4', 'Produktivität je Arbeitsgut (OPAG-Abgänge je MAK)', st.kopf_opag)
    ws_k.merge_range('U4:W4', 'Hilfsspalten', st.kopf)
    ws_k.write_blank('AN4', None, st.kopf)
    kw_ton = {}                                   # Spaltenkopf (Zeile 5) im Ton des Bands darueber
    for von, bis, ton in ((3, 6, st.spalte_opag), (7, 10, st.spalte_verbund), (14, 16, st.spalte_verbund), (17, 19, st.spalte_opag),
                          (23, 26, st.spalte_opag), (27, 30, st.spalte_verbund), (31, 34, st.spalte_opag), (35, 38, st.spalte_verbund),
                          (48, 50, st.spalte_verbund), (51, 53, st.spalte_opag)):
        for c in range(von, bis + 1):
            kw_ton[c] = ton
    kopf_k = ['Jahr', 'KW', 'Bezeichnung', 'Komposit', 'Leben', 'KV', 'Gesamt', 'Komposit', 'Leben', 'KV', 'Gesamt',
              'Gesundheit (KV)', 'Komposit/Leben', 'Gesamt', 'KV', 'Komposit/Leben', 'Gesamt', 'KV', 'Komposit/Leben', 'Gesamt',
              'Stichtage', 'Chart', 'Schlüssel']
    for c, t in enumerate(kopf_k):
        ws_k.write(4, c, t, kw_ton.get(c, st.spalte))
    ws_k.set_row(4, 36)
    ws_k.set_column('AN:AN', 12)
    ws_k.freeze_panes(5, 3)
    for i, (j, k) in enumerate(kw_liste):
        r = 5 + i
        x = r + 1
        ws_k.write_number(r, 0, j, st.zelle_ganz)
        ws_k.write_number(r, 1, k, st.zelle_zahl)
        ws_k.write_formula(r, 2, '="KW "&B%d&"/"&RIGHT(A%d,2)' % (x, x), st.zelle)
        vb = 'Verlauf!$%s$6:$%s$%d'
        krit = 'Verlauf!$B$6:$B$%d,$A%d,Verlauf!$C$6:$C$%d,$B%d' % (MAX_VERLAUF, x, MAX_VERLAUF, x)
        for c, col in enumerate(['K', 'L', 'M', 'J']):
            ws_k.write_formula(r, 3 + c, '=SUMIFS(%s,%s)' % (vb % (col, col, MAX_VERLAUF), krit), st.zelle_zahl)
        for c, col in enumerate(['U', 'V', 'W', 'T']):
            ws_k.write_formula(r, 7 + c, '=SUMIFS(%s,%s)' % (vb % (col, col, MAX_VERLAUF), krit), st.zelle_zahl)
        # MAK je KW = Durchschnitt der Tages-MAK Montag bis Freitag laut Kalender (Summenzeilen KAL_SUMME/+1, KW-Schluessel in Wirksam!6)
        tage = kalender_tage(kw_liste)
        k0, k_ende = xl_col_to_name(PL_SPALTE0), xl_col_to_name(PL_SPALTE0 + len(tage) - 1)
        wk = 'SUMIFS(Kalender!$%s$%%d:$%s$%%d,Wirksam!$%s$6:$%s$6,$W%d)/5' % (k0, k_ende, k0, k_ende, x)
        ws_k.write_formula(r, 11, '=IF(Filter!$T$7=TRUE,' + wk % (KAL_SUMME, KAL_SUMME) + ',0)', st.zelle_dez)
        ws_k.write_formula(r, 12, '=IF(OR(Filter!$T$5=TRUE,Filter!$T$6=TRUE),' + wk % (KAL_SUMME + 1, KAL_SUMME + 1) + ',0)', st.zelle_dez)
        ws_k.write_formula(r, 13, '=L%d+M%d' % (x, x), st.zelle_dez)
        # Wochenproduktivitaet (Wochensicht): Abgaenge der KW je Ø MAK der Arbeitstage (AW..BB, Tages-MAK aus Verlauf!AX:AZ
        # mit Abwesenheiten) – eine angefangene KW zaehlt nur die MAK ihrer bisherigen Tage; ohne Bewegungstag bleibt die KW leer
        # Hochrechnung der laufenden KW (12.89): die neueste KW mit Stand der Quelle (AT/AS = Maximum der Spalte; der Stand eines
        # Tages kommt erst am Folgetag, der Freitag also in der naechsten KW), solange dieser Stand vor ihrem letzten Werktag (BM) liegt
        # und heute spaetestens der Werktag danach ist (eine Quelle, die nicht mehr geliefert wird, haelt keine alte KW hochgerechnet) -> Faktor = Arbeitstage der KW (BL, Mo–Fr ohne Feiertage) ÷ Arbeitstage bis zum letzten Stand (BN Verbund, BO OPAG);
        # abgeschlossene KW: Faktor 1
        ws_k.write_formula(r, 62, '=DATE(A%d,1,4)-WEEKDAY(DATE(A%d,1,4),2)+1+7*(B%d-1)' % (x, x, x), st.zelle_dat)
        ws_k.write_formula(r, 63, '=NETWORKDAYS(BK%d,BK%d+4,FT_Datum)' % (x, x), st.zelle_zahl)
        ws_k.write_formula(r, 64, '=WORKDAY(BK%d+5,-1,FT_Datum)' % x, st.zelle_dat)
        for c, (tage_sp, stand_sp) in ((65, ('AV', 'AT')), (66, ('AU', 'AS'))):
            ws_k.write_formula(r, c, '=IF(AND(N({t}{x})>0,N({s}{x})>0),IF(AND(N({s}{x})=MAX(${s}$6:${s}${e}),N({s}{x})<BM{x},WORKDAY(BM{x},1,FT_Datum)>=TODAY()),'
                               'MAX(1,BL{x}/MAX(1,NETWORKDAYS(BK{x},N({s}{x}),FT_Datum))),1),1)'
                               .format(x=x, t=tage_sp, s=stand_sp, e=5 + len(kw_liste)), st.zelle_dez)
        for c, (zaehler, ma) in enumerate((('J%d', 'AW'), ('(H%d+I%d)', 'AX'), ('K%d', 'AY'), ('F%d', 'AZ'), ('(D%d+E%d)', 'BA'), ('G%d', 'BB'))):
            z = zaehler.replace('%d', str(x))
            ws_k.write_formula(r, 14 + c, '=IF(N(%s%d)>0,%s/%s%d*%s%d,NA())' % (ma, x, z, ma, x, 'BN' if c < 3 else 'BO', x), st.zelle_dez)
        for c, (mak_col, tage, flag) in enumerate((('AX', 'AV', 'AQ'), ('AY', 'AV', 'AQ'), ('AZ', 'AV', 'AQ'), ('AX', 'AU', 'AP'), ('AY', 'AU', 'AP'), ('AZ', 'AU', 'AP'))):
            ws_k.write_formula(r, 48 + c, '=IF(%s%d>0,SUMIFS(Verlauf!$%s$6:$%s$%d,Verlauf!$B$6:$B$%d,$A%d,Verlauf!$C$6:$C$%d,$B%d,Verlauf!$%s$6:$%s$%d,1)/%s%d,"")'
                               % (tage, x, mak_col, mak_col, MAX_VERLAUF, MAX_VERLAUF, x, MAX_VERLAUF, x, flag, flag, MAX_VERLAUF, tage, x), st.zelle_dez)
        for c, sp in ((46, 'AP'), (47, 'AQ')):
            ws_k.write_formula(r, c, '=SUMIFS(Verlauf!$%s$6:$%s$%d,Verlauf!$B$6:$B$%d,$A%d,Verlauf!$C$6:$C$%d,$B%d)'
                               % (sp, sp, MAX_VERLAUF, MAX_VERLAUF, x, MAX_VERLAUF, x), st.zelle_zahl)
        ws_k.write_formula(r, 20, '=COUNTIFS(Verlauf!$B$6:$B$%d,$A%d,Verlauf!$C$6:$C$%d,$B%d)' % (MAX_VERLAUF, x, MAX_VERLAUF, x), st.zelle_zahl)
        ws_k.write_formula(r, 21, '=IF(OR(U%d>0,N%d>0),1,0)' % (x, x), st.zelle_zahl)
        ws_k.write_formula(r, 22, '=A%d*100+B%d' % (x, x), st.zelle_ganz)
    letzte_kw = 5 + len(kw_liste)
    ws_k.merge_range('X4:AA4', 'Eingänge OPAG', st.kopf_opag)
    ws_k.merge_range('AB4:AE4', 'Eingänge Verbund', st.kopf_verbund)
    ws_k.merge_range('AF4:AI4', 'Rückstand OPAG je KW (Sonntag, sonst letzter Stand)', st.kopf_opag)
    ws_k.merge_range('AJ4:AM4', 'Rückstand Verbund je KW (Sonntag, sonst letzter Stand)', st.kopf_verbund)
    for c, t in enumerate(['Komposit', 'Leben', 'KV', 'Gesamt'] * 4 + ['letzter Stichtag der KW']):
        ws_k.write(4, 23 + c, t, kw_ton.get(23 + c, st.spalte))
    for i, (j, k) in enumerate(kw_liste):
        r = 5 + i
        x = r + 1
        krit = 'Verlauf!$B$6:$B$%d,$A%d,Verlauf!$C$6:$C$%d,$B%d' % (MAX_VERLAUF, x, MAX_VERLAUF, x)
        for c, col in enumerate(['X', 'Y', 'Z', 'I', 'AA', 'AB', 'AC', 'S']):
            ws_k.write_formula(r, 23 + c, '=SUMIFS(Verlauf!$%s$6:$%s$%d,%s)' % (col, col, MAX_VERLAUF, krit), st.zelle_zahl)
        ws_k.write_formula(r, 39, '=IF(U%d>0,MAXIFS(Verlauf!$A$6:$A$%d,Verlauf!$B$6:$B$%d,$A%d,Verlauf!$C$6:$C$%d,$B%d),"")' % (x, MAX_VERLAUF, MAX_VERLAUF, x, MAX_VERLAUF, x), st.zelle_dat)
        for c, kz in ((44, 'AN'), (45, 'AO')):       # AS/AT: letzter Stichtag der KW mit OPAG- bzw. Verbund-Stand
            ws_k.write_formula(r, c, '=IF(U%d>0,IF(MAXIFS(Verlauf!$A$6:$A$%d,Verlauf!$B$6:$B$%d,$A%d,Verlauf!$C$6:$C$%d,$B%d,Verlauf!$%s$6:$%s$%d,1)=0,"",'
                               'MAXIFS(Verlauf!$A$6:$A$%d,Verlauf!$B$6:$B$%d,$A%d,Verlauf!$C$6:$C$%d,$B%d,Verlauf!$%s$6:$%s$%d,1)),"")'
                               % ((x, MAX_VERLAUF, MAX_VERLAUF, x, MAX_VERLAUF, x, kz, kz, MAX_VERLAUF) * 1 + (MAX_VERLAUF, MAX_VERLAUF, x, MAX_VERLAUF, x, kz, kz, MAX_VERLAUF)), st.zelle_dat)
        for c in range(8):                           # BC..BJ: Rueckstand je Einheit zum letzten Stichtag der KW (Verlauf BA..BH)
            tag = '$AS' if c < 4 else '$AT'
            col = xl_col_to_name(52 + c)
            ws_k.write_formula(r, 54 + c, '=IF(%s%d="","",INDEX(Verlauf!$%s$6:$%s$%d,MATCH(%s%d,Verlauf!$A$6:$A$%d,0)))' % (tag, x, col, col, MAX_VERLAUF, tag, x, MAX_VERLAUF), st.zelle_zahl)
        for c, col in enumerate(['D', 'E', 'F', 'H', 'N', 'O', 'P', 'R']):
            tag = '$AS' if c < 4 else '$AT'
            ws_k.write_formula(r, 31 + c, '=IF(%s%d="","",INDEX(Verlauf!$%s$6:$%s$%d,MATCH(%s%d,Verlauf!$A$6:$A$%d,0)))' % (tag, x, col, col, MAX_VERLAUF, tag, x, MAX_VERLAUF), st.zelle_zahl)
    for c, t in enumerate(['Ø MAK Verbund KV', 'Ø MAK Verbund Komp./Leben', 'Ø MAK Verbund gesamt', 'Ø MAK OPAG KV', 'Ø MAK OPAG Komp./Leben', 'Ø MAK OPAG gesamt']):
        ws_k.write(4, 48 + c, t, kw_ton[48 + c])
    ws_k.merge_range('AW4:BB4', 'Ø MAK der Arbeitstage (Wochenproduktivität)', st.kopf)
    ws_k.merge_range('BC4:BJ4', 'Rückstand je Einheit (Sicht Einheit, letzter Stichtag der KW)', st.kopf)
    for c in range(8):
        ws_k.write(4, 54 + c, '%s E%d' % ('OPAG' if c < 4 else 'Verbund', c % 4 + 1), st.spalte_opag if c < 4 else st.spalte_verbund)
    ws_k.set_column('BC:BJ', 10)
    ws_k.merge_range('BK4:BO4', 'Hochrechnung der neuesten KW (bis ihr Freitag geladen ist)', st.kopf)
    for c, t in enumerate(['Montag', 'Arbeitstage der KW', 'letzter Werktag', 'Faktor Verbund', 'Faktor OPAG']):
        ws_k.write(4, 62 + c, t, st.spalte)
    ws_k.set_column('BK:BO', 11)
    ws_k.set_column('AW:BB', 11)
    # Kopfzellen AS4:AV4 ueber beide Kopfzeilen (Zeile 5 ist dort leer); Text bleibt in Zeile 4
    ws_k.merge_range('AU4:AU5', 'Arbeitstage OPAG', st.spalte_opag)
    ws_k.merge_range('AV4:AV5', 'Arbeitstage Verbund', st.spalte_verbund)
    ws_k.merge_range('AS4:AS5', 'letzter Stichtag mit OPAG-Stand', st.spalte_opag)
    ws_k.merge_range('AT4:AT5', 'letzter Stichtag mit Verbund-Stand', st.spalte_verbund)
    ws_k.set_column('AS:AV', 11)
    ws_k.set_column('AP:AP', 26)
    ws_k.write('AP4', 'Diagrammbereich', st.kopf)
    ws_k.write('AP5', 'erste Zeile (Stichtage)', st.zelle)
    ws_k.write_formula('AQ5', '=IFERROR(AGGREGATE(15,6,(ROW($U$6:$U$%d)-5)/($U$6:$U$%d>0),1),1)' % (letzte_kw, letzte_kw), st.zelle_zahl)
    ws_k.write('AP6', 'letzte Zeile (Stichtage)', st.zelle)
    ws_k.write_formula('AQ6', '=IFERROR(AGGREGATE(14,6,(ROW($U$6:$U$%d)-5)/(($U$6:$U$%d>0)*($W$6:$W$%d<=N(Filter!$O$9)*100+N(Filter!$O$10))),1),1)'
                       % (letzte_kw, letzte_kw, letzte_kw), st.zelle_zahl)                          # bis zur KW des Bezugstags
    ws_k.write('AP7', 'erste Zeile (MAK oder Stichtage)', st.zelle)
    ws_k.write_formula('AQ7', '=IFERROR(AGGREGATE(15,6,(ROW($V$6:$V$%d)-5)/($V$6:$V$%d=1),1),1)' % (letzte_kw, letzte_kw), st.zelle_zahl)
    ws_k.write('AP8', 'letzte Zeile (MAK oder Stichtage)', st.zelle)
    ws_k.write_formula('AQ8', '=IFERROR(AGGREGATE(14,6,(ROW($V$6:$V$%d)-5)/($V$6:$V$%d=1),1),1)' % (letzte_kw, letzte_kw), st.zelle_zahl)

    ww_zeilen, ww_ende = wochenwerte_blatt(wb, ws_ww, st, kw_liste, block)
    rohdatenblatt(wb, ws_rb, st, ww_zeilen, ww_ende, kw_liste)

    # ---------------------------------------------------------- Anwesenheit
    # ---------------------------------------------------------- Anwesenheitstool: Mitarbeiter (Arbeitszeitmodell), Kalender, Wirksam
    anwesenheit_blaetter(wb, ws_m, ws_p, ws_w, st, kw_liste, anwesenheit, anw_datei)

    # ---------------------------------------------------------- Ladeprotokoll
    # Spaltenformate: auch die Zeilen, die das Makro spaeter anhaengt, erscheinen so im selben Look
    ws_l.set_column('A:A', 16, st.zelle_datzeit)
    ws_l.set_column('B:B', 40, st.zelle)
    ws_l.set_column('C:C', 16, st.zelle)
    ws_l.set_column('D:D', 11, st.zelle)
    ws_l.set_column('E:E', 11, st.zelle_dat)
    ws_l.set_column('F:I', 11, st.zelle_zahl)
    ws_l.set_column('J:J', 70, st.zelle)
    ws_l.set_column('K:K', 14, st.zelle)
    ws_l.set_row(3, 20)
    ws_l.freeze_panes(4, 0)
    # Quelle farbig wie im Cockpit (OPAG rot, Verbund petrol)
    ws_l.conditional_format('D5:D%d' % LP_MAX, {'type': 'cell', 'criteria': '==', 'value': '"OPAG"', 'format': wb.add_format({'font_color': ROTD, 'bold': True})})
    ws_l.conditional_format('D5:D%d' % LP_MAX, {'type': 'cell', 'criteria': '==', 'value': '"Verbund"', 'format': wb.add_format({'font_color': TEALD, 'bold': True})})
    ws_l.write('A1', 'Ladeprotokoll', st.titel)
    ws_l.write('A2', 'Jeder geladene Stand (Quelle und Stichtag, bei Makler je Einheit) steht hier genau einmal; erneutes Laden überspringt vorhandene Stände.', st.untertitel)
    for c, t in enumerate(['Zeitpunkt', 'Datei', 'Blatt', 'Quelle', 'Stichtag', 'Zeilen', 'Rückstand', 'Eingänge', 'Abgänge', 'Hinweis', 'Einheit']):
        ws_l.write(3, c, t, st.kopf)
    ws_l.write_comment('J4', 'Leer = normal geladen. „erster Stand …“: Eingänge und Abgänge gibt es ab dem nächsten Stichtag dieser Quelle. '
                             '„übersprungen …“: Stand älter als der zuletzt geladene – siehe Anleitung, Abschnitt 9.',
                       {'author': 'BÜ-Reporting', 'x_scale': 2.4, 'y_scale': 1.3, 'font_name': FONT, 'font_size': 9})
    for i, p in enumerate(protokoll):
        r = 4 + i
        ws_l.write_datetime(r, 0, p[0], st.zelle_datzeit)
        ws_l.write(r, 1, p[1], st.zelle)
        ws_l.write(r, 2, p[2], st.zelle)
        ws_l.write(r, 3, p[3], st.zelle)
        ws_l.write_datetime(r, 4, dt.datetime(p[4].year, p[4].month, p[4].day), st.zelle_dat)
        for c in range(5, 9):
            ws_l.write_number(r, c, p[c], st.zelle_zahl)
        ws_l.write(r, 9, p[9], st.zelle)

    # ---------------------------------------------------------- Dateiinhalt (12.88): je geprueftem Blatt und Einheit eine Zeile (VBA
    # modLaden.InhaltMerken); eine schon gepruefte Datei (gleicher Name und Groesse) wird beim Laden nicht erneut geoeffnet
    ws_di.set_column('A:A', 46, st.zelle)
    ws_di.set_column('B:B', 22, st.zelle)
    ws_di.set_column('C:C', 18, st.zelle)
    ws_di.set_column('D:D', 11, st.zelle)
    ws_di.set_column('E:E', 11, st.zelle_dat)
    ws_di.set_column('F:F', 12, st.zelle)
    ws_di.set_column('G:G', 10, st.zelle_zahl)
    ws_di.set_column('H:H', 22, st.zelle)
    ws_di.set_column('I:I', 16, st.zelle_datzeit)
    ws_di.set_column('J:J', 3, st.zelle)
    ws_di.set_row(3, 20)
    ws_di.freeze_panes(4, 0)
    ws_di.conditional_format('D5:D20000', {'type': 'cell', 'criteria': '==', 'value': '"OPAG"', 'format': wb.add_format({'font_color': ROTD, 'bold': True})})
    ws_di.conditional_format('D5:D20000', {'type': 'cell', 'criteria': '==', 'value': '"Verbund"', 'format': wb.add_format({'font_color': TEALD, 'bold': True})})
    ws_di.write('A1', 'Dateiinhalt', st.titel)
    ws_di.write('A2', 'Was in jeder geprüften Rohdatei steht: je Blatt Quelle, Stichtag und Einheiten mit Zeilenzahl. Eine schon geprüfte Datei '
                      'öffnet das Tool beim Laden nicht erneut, um ihren Inhalt zu erkennen.', st.untertitel)
    for c, t in enumerate(['Datei', 'Größe (Byte)', 'Blatt', 'Quelle', 'Stichtag', 'Einheit', 'Zeilen', 'Einheiten der Datei', 'Geprüft am']):
        ws_di.write(3, c, t, st.kopf)

    # ---------------------------------------------------------- Diagrammdaten: immer 7 Perioden (Tag, KW oder Woche); Tag/Woche: neueste rechts, KW: Montag links bis
    # Sonntag rechts (Tage nach dem Bezugstag bleiben rechts leer); leere Slots = #NV (werden nicht gezeichnet)
    ws_d.set_column('A:A', 16)
    ws_d.set_column('B:B', 7)
    ws_d.set_column('C:AD', 9)
    ws_d.set_column('AE:AE', 2)
    ws_d.set_column('AF:AF', 18)
    ws_d.write('A1', 'Diagrammdaten (Hilfsblatt, wird nicht bearbeitet)', st.titel)
    ws_d.write('A2', 'Immer 7 Perioden nach Ansicht (Filter!L9): Tag = letzte 7 Stichtage, Woche = letzte 7 KW, jeweils neueste rechts; KW = Montag (links) bis Sonntag der KW des Bezugstags, '
                     'Tage nach dem Bezugstag bleiben rechts leer. Leere Plätze stehen als #NV (unsichtbar), '
                     'damit Diagramme sie nicht zeichnen. Block A ab Zeile 3: Rückstand, Summen, Badges, SLA, Verhältnis (Achse je Quelle: BR OPAG, BS Verbund mit * = abgeschlossene KW ohne Sonntagsstand (BV/BW) für den Rückstand, BT/BU ohne * für Eingänge/Abgänge, A gemeinsam) · '
                     'Block C ab Zeile 36: Kachel Eingänge/Abgänge · Block D ab Zeile 49: Produktivität (Achse I OPAG, J Verbund; M:Z Tageswerte für den Ø der Kachel).', st.untertitel)
    ws_d.write('AF1', 'Perioden mit Daten', st.kopf)
    ws_d.set_row(2, 30)
    ws_d.set_row(48, 30)
    ws_d.write('AH3', 'OPAG-Stand', st.spalte_opag)
    ws_d.write('AI3', 'Verbund-Stand', st.spalte_verbund)
    ws_d.write('AK3', 'SLA Verbund', st.spalte_verbund)
    ws_d.write('AL3', 'SLA Text', st.spalte_verbund)
    ws_d.write_formula('AL4', '=IF(N(Konfiguration!$F$3)>0,"SLA "&FIXED(Konfiguration!$F$3,0),"")', st.zelle)
    for c, t in enumerate(['Verhältnis Komposit', 'Verhältnis Leben', 'Verhältnis KV', 'Verhältnis Gesamt']):
        ws_d.write(2, 38 + c, t, st.spalte)
    ws_d.write('AQ3', 'Ø 14 Tage gesamt', st.spalte)
    ws_d.write('AR3', 'Ø Text', st.spalte)
    ws_d.write('AS3', 'SLA OPAG', st.spalte_opag)
    ws_d.write('AT3', 'SLA OPAG Text', st.spalte_opag)
    ws_d.write_formula('AR4', '=IF(Filter!$O$37="","","Ø 14 Tage "&FIXED(Filter!$O$37,2))', st.zelle)
    # PPT: kurze Legende der SLA-Linie OPAG (ohne Herleitung) und Delta-Boxen unter den Bewegungssaeulen (Abbau gruen, Aufbau gelb)
    ws_d.write('AU3', 'SLA OPAG kurz', st.spalte_opag)
    ws_d.write_formula('AU4', '=IF(N(Konfiguration!$F$4)>0,"SLA "&FIXED(Konfiguration!$F$4,0),IF(Filter!$O$38="","","SLA-Vorschlag "&FIXED(Filter!$O$38,0)))', st.zelle)
    for c, t in enumerate(['PPT OPAG Δ Abbau', 'PPT OPAG Δ Aufbau', 'PPT OPAG Δ Text', 'PPT Verbund Δ Abbau', 'PPT Verbund Δ Aufbau', 'PPT Verbund Δ Text']):
        ws_d.write(2, 47 + c, t, st.spalte_opag if c < 3 else st.spalte_verbund)
    for x in range(4, 11):
        for c, (ein, ab, dl) in enumerate((('K', 'L', 'M'), ('N', 'O', 'P'))):
            # Lage der Box: eigene Zeile unter der laengsten Abgangssaeule, Abstand 75 % der Spannweite (Platz fuer das
            # Wertetikett des Abgangs), ueber den Datumsangaben – so verdeckt sie keine Saeule und kein Etikett;
            # nur an Tagen mit Bewegungen (erster Stand: Eingaenge und Abgaenge 0 -> keine Box)
            oben = '(AGGREGATE(5,6,$%s$4:$%s$10)-0.75*(AGGREGATE(4,6,$%s$4:$%s$10)-AGGREGATE(5,6,$%s$4:$%s$10)))' % (ab, ab, ein, ein, ab, ab)
            da = 'AND(ISNUMBER(%s%d),OR(N(%s%d)<>0,N(%s%d)<>0))' % (dl, x, ein, x, ab, x)
            ws_d.write_formula(x - 1, 47 + c * 3, '=IF(%s,IF(%s%d<=0,%s,NA()),NA())' % (da, dl, x, oben), st.zelle_zahl)
            ws_d.write_formula(x - 1, 48 + c * 3, '=IF(%s,IF(%s%d>0,%s,NA()),NA())' % (da, dl, x, oben), st.zelle_zahl)
            ws_d.write_formula(x - 1, 49 + c * 3, '=IF(ISNUMBER(%s%d),IF(%s%d>0,"+","")&FIXED(%s%d,0),"")' % (dl, x, dl, x, dl, x), st.zelle)
    # PPT-Kachel Kapazitaet: Produktivitaet je KW als Box-Zeilen unter den MAK-Saeulen (Verbund, darunter OPAG). Das Fenster folgt
    # dem MAK-Diagramm (7 KW bis zur KW des letzten Stichtags, wie modCockpit.DiagrammeAnpassen: k2 = 5 + KW!AQ6, k1 = max(6, k2 - 6));
    # Lage der Boxen = Bruchteil der hoechsten MAK-Saeule unter der Achse, Text = Abgaenge je MAK der KW
    for c, t in enumerate(['PPT KW-Zeile', 'PPT Prod. Verbund Lage', 'PPT Prod. Verbund Text', 'PPT Prod. OPAG Lage', 'PPT Prod. OPAG Text', 'PPT MAK gesamt']):
        ws_d.write(2, 54 + c, t, st.spalte_verbund if c in (1, 2) else st.spalte_opag if c in (3, 4) else st.spalte)
    for x in range(4, 11):
        ws_d.write_formula(x - 1, 54, '=MAX(6,5+N(KW!$AQ$6)-6)+%d' % (x - 4), st.zelle_ganz)
        ws_d.write_formula(x - 1, 59, '=N(INDEX(KW!$N:$N,$BC%d))' % x, st.zelle_dez)
        for k, (prod, anteil) in enumerate((('Q', 0.22), ('T', 0.5))):
            wert = 'INDEX(KW!$%s:$%s,$BC%d)' % (prod, prod, x)
            ws_d.write_formula(x - 1, 55 + k * 2, '=IF(ISNUMBER(%s),-%s*MAX(1,MAX($BH$4:$BH$10)),NA())' % (wert, anteil), st.zelle_dez)
            # Text BE/BG (mit Stern fuer die laufende KW) folgt nach dem Block „Produktivitaet je Ansicht“ (braucht dessen Filter-Zeilen)
    ws_d.write_formula('AT4', '=IF(N(Konfiguration!$F$4)>0,"SLA "&FIXED(Konfiguration!$F$4,0),IF(Filter!$O$38="","",'
                              '"SLA-Vorschlag "&FIXED(Filter!$O$38,0)&" ("&FIXED(Konfiguration!$F$3,0)&" × Ø "&FIXED(Filter!$O$37,2)&")"))', st.zelle)
    ws_d.write_formula('AR5', '=IF(Filter!$O$37="","","Ø 14 Tage: Komposit "&IF(Filter!$O$34="","–",FIXED(Filter!$O$34,2))&" · Leben "&IF(Filter!$O$35="","–",FIXED(Filter!$O$35,2))'
                              '&" · KV "&IF(Filter!$O$36="","–",FIXED(Filter!$O$36,2))&" · gesamt "&FIXED(Filter!$O$37,2)&" (Tage mit Stand beider Quellen)")', st.zelle)
    for x in range(4, 11):
        ws_d.write_formula(x - 1, 42, '=IF(Filter!$O$37="",NA(),Filter!$O$37)', st.zelle_dez)
        ws_d.write_formula(x - 1, 44, '=IF(N(Filter!$O$39)>0,Filter!$O$39,NA())', st.zelle_zahl)
        # SLA ueber alle 7 Plaetze (die Linie reicht so ueber die ganze Breite, auch ueber leere Plaetze)
        ws_d.write_formula(x - 1, 36, '=IF(N(Konfiguration!$F$3)>0,Konfiguration!$F$3,NA())', st.zelle_zahl)
        # Verhaeltnis OPAG-Arbeitsgueter je Verbund-Vorgang je Sparte und gesamt; #NV, wenn eine Quelle keinen Stand hat
        for c, (o, vb) in enumerate((('C', 'G'), ('D', 'H'), ('E', 'I'), ('F', 'J'))):
            ws_d.write_formula(x - 1, 38 + c, '=IFERROR(IF(%s%d>0,%s%d/%s%d,NA()),NA())' % (vb, x, o, x, vb, x), st.zelle_dez)
    # Ansicht „KW“ (Knopf „Aktuelle KW“): die 7 Tage Montag bis Sonntag der KW des Bezugstags (Filter!O40, standardmaessig der
    # neueste Stand); Tage ohne Stand und Tage nach dem Bezugstag bleiben leer, ihre Achsenbeschriftung steht trotzdem da
    kwm = 'Filter!$L$9="KW"'
    bz = 'N(Filter!$O$40)'
    montag = '(%s-WEEKDAY(%s,2)+1)' % (bz, bz)
    va_a = 'Verlauf!$A$6:$A$%d' % MAX_VERLAUF
    ws_d.write_formula('AF2', '=MIN(7,IF(Filter!$L$9="Woche",COUNTIFS(KW!$U$6:$U$%d,">0",KW!$W$6:$W$%d,"<="&(N(Filter!$O$9)*100+N(Filter!$O$10))),'
                              'IF(%s,COUNTIFS(%s,">="&%s,%s,"<="&%s),Filter!$O$41)))'
                       % (letzte_kw, letzte_kw, kwm, va_a, montag, va_a, bz), st.zelle_zahl)          # Perioden mit Daten bis zum Bezugstag
    G = '$AF$2'

    def tt_wt(d):
        # Datum als „TT.MM.“ und Wochentag (ohne TEXT(), dessen Formatcode sprachabhaengig ist)
        return ('RIGHT("0"&DAY(%s),2)&"."&RIGHT("0"&MONTH(%s),2)&"."' % (d, d),
                'CHOOSE(WEEKDAY(%s,2),"Mo","Di","Mi","Do","Fr","Sa","So")' % d)

    def achse(b, d, ft=False, stern=None):
        # Achsenbeschriftung aus Index b und Datum d: Wochensicht „KW 41“ und darunter das Datum des verwendeten Stands kurz mit
        # Wochentag und Punkt „11.10. (So.)“ (ohne Stand der Quelle in der KW nur „KW 41“); stern: Ausdruck, der in der Wochensicht
        # „*“ ans Datum haengt (Rueckstand: abgeschlossene KW ohne Sonntagsstand, „09.10. (Fr.)*“). Tagessicht und KW: Datum und
        # darunter der Wochentag ohne Punkt (auch an Tagen ohne Stand).
        # ft: in Tagessicht und KW Feiertage (FT_Datum) als „Do · FT“ kennzeichnen (Produktivitaet: die Kachel laesst sie im Ø aus);
        # die Wochensicht bleibt ohne Kennzeichen (dort zaehlen die Arbeitstage der KW wie bisher)
        t, w = tt_wt(d)
        w_tag = '%s&IF(COUNTIF(FT_Datum,N(%s))>0," · FT","")' % (w, d) if ft else w
        st_ = '&%s' % stern if stern else ''
        return ('=IF(%s,IF(%s="","","KW "&INDEX(KW!$B$6:$B$%d,%s)&IF(%s="","",CHAR(10)&%s&" ("&%s&".)"%s)),IF(%s="","",%s&CHAR(10)&%s))'
                % (woche, b, letzte_kw, b, d, t, w, st_, d, t, w_tag))
    for c, t in enumerate(['Periode', 'Index', 'OPAG Komposit', 'OPAG Leben', 'OPAG KV', 'OPAG Gesamt', 'Verbund Komposit', 'Verbund Leben', 'Verbund KV', 'Verbund Gesamt',
                           'OPAG Ein Σ', 'OPAG Abg Σ (neg.)', 'OPAG Delta', 'Verbund Ein Σ', 'Verbund Abg Σ (neg.)', 'Verbund Delta',
                           'OPAG Δ weniger', 'OPAG Δ mehr', 'OPAG Δ gleich', 'OPAG Achsenluft', 'OPAG Δ Text',
                           'Verbund Δ weniger', 'Verbund Δ mehr', 'Verbund Δ gleich', 'Verbund Achsenluft', 'Verbund Δ Text']):
        ton = st.spalte if c < 2 else st.spalte_opag if (2 <= c <= 5 or 10 <= c <= 12 or 16 <= c <= 20) else st.spalte_verbund
        ws_d.write(2, c, t, ton)
    woche = 'Filter!$L$9="Woche"'
    ws_d.write(2, 60, 'OPAG Reihe 4', st.spalte_opag)
    ws_d.write(2, 61, 'Verbund Reihe 4', st.spalte_verbund)
    # BK..BN Zeile 3: Reihennamen der Stapel nach Sicht (Sparte oder Einheit), Legende der Rueckstandsdiagramme (Bereich Makler)
    for k, sp in enumerate(['Komposit', 'Leben', 'KV', 'Sonstige']):
        name_e = 'IF(Filter!$L$%d="","Übrige",Filter!$L$%d)' % (22 + k, 22 + k) if k == 3 else 'IF(Filter!$L$%d="","–",Filter!$L$%d)' % (22 + k, 22 + k)
        ws_d.write_formula(2, 62 + k, '=IF(Filter!$L$19="Einheit",%s,"%s")' % (name_e, sp), st.spalte)
    # BO..BW: Datum und Achsenbeschriftung je Periode. Wochensicht: Rueckstand je KW = Stand vom Sonntag der KW (der Montag gehoert
    # zur neuen KW); Zuordnung nach eigenem Stichtag, also der letzte Stichtag der KW mit Stand der Quelle (KW!AS OPAG, KW!AT
    # Verbund) – genau der Tag, dessen Rueckstand die Saeule zeigt. Ist das kein Sonntag, fehlt der Sonntagsstand: in einer
    # abgeschlossenen KW (vor der KW von heute, Filter!O24) Stern am Datum (BV OPAG, BW Verbund = 1), in der laufenden KW nicht.
    # OPAG und Verbund koennen in einer KW verschiedene letzte Stichtage haben, deshalb hat jede Quelle ihre eigene Achse:
    # BR/BS mit Stern fuer die Rueckstandsdiagramme, BT/BU ohne Stern fuer Eingaenge/Abgaenge (Block C, PPT); die gemeinsame
    # Achse A (Verhaeltnis Verbund zu OPAG) nennt den spaeteren der beiden Tage ohne Stern. Tag und KW: Datum des Platzes.
    for c, t in enumerate(['Datum der Periode', 'Datum OPAG', 'Datum Verbund', 'Periode OPAG (Achse Rückstand)', 'Periode Verbund (Achse Rückstand)',
                           'Periode OPAG (Achse)', 'Periode Verbund (Achse)', 'OPAG ohne Sonntagsstand (*)', 'Verbund ohne Sonntagsstand (*)']):
        ws_d.write(2, 66 + c, t, st.spalte_opag if c in (1, 3, 5, 7) else st.spalte_verbund if c in (2, 4, 6, 8) else st.spalte)
    ws_d.set_column('BO:BQ', 11)
    ws_d.set_column('BR:BU', 16)
    ws_d.set_column('BV:BW', 11)
    for j in range(1, 8):                     # Block A: Zeilen 4..10, Slot 7 = neueste Periode (Ansicht KW: Slot 1 = Montag, Slot 7 = Sonntag)
        x = 3 + j
        tag_kw = '%s+%d' % (montag, j - 1)  # Ansicht KW: Datum des Platzes (Montag + j - 1)
        ws_d.write_formula(x - 1, 1, '=IF(%s,IF(OR(%s=0,%s>%s),"",IFERROR(MATCH(%s,%s,0),"")),'
                                     'IF(%d<=7-%s,"",IF(%s,AGGREGATE(14,6,(ROW(KW!$U$6:$U$%d)-5)/((KW!$U$6:$U$%d>0)*(KW!$W$6:$W$%d<=N(Filter!$O$9)*100+N(Filter!$O$10))),%d),Filter!$O$41-7+%d)))'
                           % (kwm, bz, tag_kw, bz, tag_kw, va_a, j, G, woche, letzte_kw, letzte_kw, letzte_kw, 8 - j, j), st.zelle_zahl)
        letzt = lambda col: 'N(INDEX(KW!$%s$6:$%s$%d,$B%d))' % (col, col, letzte_kw, x)  # noqa: E731
        ws_d.write_formula(x - 1, 66, '=IF(%s,IF(%s=0,"",%s),IF($B%d="","",IF(%s,IF(MAX(%s,%s)=0,"",MAX(%s,%s)),INDEX(%s,$B%d))))'
                           % (kwm, bz, tag_kw, x, woche, letzt('AS'), letzt('AT'), letzt('AS'), letzt('AT'), va_a, x), st.zelle_dat)
        for c, col in ((67, 'AS'), (68, 'AT')):
            ws_d.write_formula(x - 1, c, '=IF(%s,IF($B%d="","",IF(%s=0,"",%s)),$BO%d)' % (woche, x, letzt(col), letzt(col), x), st.zelle_dat)
        # BV/BW: 1 = Wochensicht, abgeschlossene KW (KW!W vor der KW von heute) und der letzte Stand der Quelle ist kein Sonntag
        for c, dat in ((73, 'BP'), (74, 'BQ')):
            ws_d.write_formula(x - 1, c, '=IF(%s,IF(N($%s%d)=0,0,IF(AND(WEEKDAY(N($%s%d),2)<7,N(INDEX(KW!$W$6:$W$%d,$B%d))<N(Filter!$O$24)),1,0)),0)'
                               % (woche, dat, x, dat, x, letzte_kw, x), st.zelle_zahl)
        ws_d.write_formula(x - 1, 69, achse('$B%d' % x, '$BP%d' % x, stern='IF($BV%d=1,"*","")' % x), st.zelle)
        ws_d.write_formula(x - 1, 70, achse('$B%d' % x, '$BQ%d' % x, stern='IF($BW%d=1,"*","")' % x), st.zelle)
        ws_d.write_formula(x - 1, 71, achse('$B%d' % x, '$BP%d' % x), st.zelle)
        ws_d.write_formula(x - 1, 72, achse('$B%d' % x, '$BQ%d' % x), st.zelle)
        ws_d.write_formula(x - 1, 0, '=IF(N($BQ%d)>N($BP%d),$BU%d,$BT%d)' % (x, x, x, x), st.zelle)
        # Achse: Tagessicht/KW Datum und darunter der Wochentag; Wochensicht „KW 41“ und darunter das Datum des Stands „11.10. (So.)“
        # AH/AI: 1, wenn die Periode einen OPAG- bzw. Verbund-Stand hat (Tag: Kennzeichen aus Verlauf, Woche: Rueckstand der KW
        # vorhanden); ohne Stand bleibt die Quelle in dieser Periode leer (#NV) statt 0
        for c, (kz, kw_ges) in enumerate((('AN', 'AI'), ('AO', 'AM'))):
            ws_d.write_formula(x - 1, 33 + c, '=IF($B%d="",0,IF(%s,IF(INDEX(KW!$%s$6:$%s$%d,$B%d)="",0,1),INDEX(Verlauf!$%s$6:$%s$%d,$B%d)))'
                               % (x, woche, kw_ges, kw_ges, letzte_kw, x, kz, kz, MAX_VERLAUF, x), st.zelle_zahl)
        sicht = 'Filter!$L$19="Einheit"'
        def wert(vcol, kcol):                     # Tag: Verlauf-Zeile, Woche: KW-Zeile
            return 'IF(%s,INDEX(KW!$%s$6:$%s$%d,$B%d),INDEX(Verlauf!$%s$6:$%s$%d,$B%d))' % (woche, kcol, kcol, letzte_kw, x, vcol, vcol, MAX_VERLAUF, x)
        for c, (vcol, kcol) in enumerate([('D', 'AF'), ('E', 'AG'), ('F', 'AH'), ('H', 'AI'), ('N', 'AJ'), ('O', 'AK'), ('P', 'AL'), ('R', 'AM')]):
            f = wert(vcol, kcol)
            if c % 4 < 3:                         # Stapel: Sparte oder (Sicht Einheit) Einheit 1–3 aus Verlauf BA.. / KW BC..
                e = 52 + (c // 4) * 4 + c % 4
                f = 'IF(%s,%s,%s)' % (sicht, wert(xl_col_to_name(e), xl_col_to_name(e + 2)), f)
            ws_d.write_formula(x - 1, 2 + c, '=IF(OR($B%d="",$%s%d=0),NA(),%s)' % (x, 'AH' if c < 4 else 'AI', x, f), st.zelle_zahl)
        # CA/CB: Ø Rueckstandsalter OPAG/Verbund (Verlauf!BI/BJ) fuer das Diagramm „Ø Alter im Verlauf“ (12.84). Wochensicht: Stand
        # der KW (BP/BQ, Sonntag oder letzter Stand), sonst die Verlauf-Zeile in B; ohne Stand #NV (Luecke statt 0)
        for c, (vcol, flag, dat) in enumerate((('BI', 'AH', 'BP'), ('BJ', 'AI', 'BQ'))):
            zeile_v = 'IF(%s,MATCH($%s%d,Verlauf!$A$6:$A$%d,0),$B%d)' % (woche, dat, x, MAX_VERLAUF, x)
            ws_d.write_formula(x - 1, 78 + c, '=IF(OR($B%d="",$%s%d=0),NA(),IFERROR(1*INDEX(Verlauf!$%s$6:$%s$%d,%s),NA()))'
                               % (x, flag, x, vcol, vcol, MAX_VERLAUF, zeile_v), st.zelle_dez)
        # BI/BJ: vierte Stapelreihe (Bereich Makler) – Sicht Sparte: Sonstige (Gesamt minus Ko/Le/KV), Sicht Einheit: Einheit 4 bzw. Übrige
        for c, (kz, sp4, ges, ko, le, kv, e4) in enumerate((('AH', 'G', 'AI', 'AF', 'AG', 'AH', 'BD'), ('AI', 'Q', 'AM', 'AJ', 'AK', 'AL', 'BH'))):
            e4kw = xl_col_to_name(54 + 3 + c * 4)
            sonst = 'IF(%s,INDEX(KW!$%s$6:$%s$%d,$B%d)-INDEX(KW!$%s$6:$%s$%d,$B%d)-INDEX(KW!$%s$6:$%s$%d,$B%d)-INDEX(KW!$%s$6:$%s$%d,$B%d),INDEX(Verlauf!$%s$6:$%s$%d,$B%d))' % (
                woche, ges, ges, letzte_kw, x, ko, ko, letzte_kw, x, le, le, letzte_kw, x, kv, kv, letzte_kw, x, sp4, sp4, MAX_VERLAUF, x)
            ws_d.write_formula(x - 1, 60 + c, '=IFERROR(IF(OR($B%d="",$%s%d=0),NA(),IF(%s,%s,%s)),NA())' % (x, kz, x, sicht, wert(e4, e4kw), sonst), st.zelle_zahl)
        # Summen je Periode fuer die PPT-Kacheln: Eingaenge, Abgaenge (negativ), Delta – (Verlauf Ein, Verlauf Abg, KW Ein, KW Abg)
        for c, (ve, va, ke, ka) in enumerate([('I', 'J', 'AA', 'G'), ('S', 'T', 'AE', 'K')]):
            e = 'N(IF(%s,INDEX(KW!$%s$6:$%s$%d,$B%d),INDEX(Verlauf!$%s$6:$%s$%d,$B%d)))' % (woche, ke, ke, letzte_kw, x, ve, ve, MAX_VERLAUF, x)
            a = 'N(IF(%s,INDEX(KW!$%s$6:$%s$%d,$B%d),INDEX(Verlauf!$%s$6:$%s$%d,$B%d)))' % (woche, ka, ka, letzte_kw, x, va, va, MAX_VERLAUF, x)
            leer = 'OR($B%d="",$%s%d=0)' % (x, 'AH' if c == 0 else 'AI', x)
            ws_d.write_formula(x - 1, 10 + c * 3, '=IF(%s,NA(),%s)' % (leer, e), st.zelle_zahl)
            ws_d.write_formula(x - 1, 11 + c * 3, '=IF(%s,NA(),-%s)' % (leer, a), st.zelle_zahl)
            ws_d.write_formula(x - 1, 12 + c * 3, '=IF(%s,NA(),%s-%s)' % (leer, e, a), st.zelle_zahl)
        # Badges ueber den Rueckstandssaeulen: Veraenderung zur vorherigen Periode (gruen = weniger, gelb = mehr, grau = gleich) als
        # unsichtbare Punktreihen in fester Hoehe ueber der Summe (Summe + 30 % der hoechsten Saeule, Abstand zur Summenzahl; das Etikett sitzt mittig auf dem
        # Punkt, Text aus der Zelle). "Achsenluft" (1,55 x Maximum) haelt die Automatik-Achse in Excel frei. Hinweis: LibreOffice
        # stapelt die Punktreihen eines kombinierten Stapeldiagramms und zeigt die Badges daher nicht an der richtigen Stelle.
        for c, ges in enumerate(['F', 'J']):
            b0 = 16 + c * 5
            mx = 'AGGREGATE(4,6,$%s$4:$%s$10)' % (ges, ges)
            d = '(%s%d-%s%d)' % (ges, x, ges, x - 1)
            gueltig = 'OR($B%d="",%d=1,ISNA(%s%d),ISNA(%s%d))' % (x, j, ges, x, ges, x - 1)
            for k, bed in enumerate(['%s<0' % d, '%s>0' % d, '%s=0' % d]):
                ws_d.write_formula(x - 1, b0 + k, '=IF(%s,NA(),IF(%s,%s%d+%s*0.30,NA()))' % (gueltig, bed, ges, x, mx), st.zelle_zahl)
            ws_d.write_formula(x - 1, b0 + 3, '=IF($B%d="",NA(),%s*1.55)' % (x, mx), st.zelle_zahl)
            ws_d.write_formula(x - 1, b0 + 4, '=IF(%s,"",IF(%s>0,"+"&FIXED(%s,0),IF(%s<0,"-"&FIXED(-%s,0),"±0")))' % (gueltig, d, d, d, d), st.zelle)
    # Herkunft der Eingaenge/Abgaenge je Sparte (fuer Block C)
    quellen = {'OPAG': [('X', 'K', 'X', 'D'), ('Y', 'L', 'Y', 'E'), ('Z', 'M', 'Z', 'F')],            # (Verlauf Ein, Verlauf Abg, KW Ein, KW Abg) je Ko/Le/KV
               'Verbund': [('AA', 'U', 'AB', 'H'), ('AB', 'V', 'AC', 'I'), ('AC', 'W', 'AD', 'J')]}
    # Block C: Zeilen 37..43 (7 Perioden wie Block A) fuer die Kachel „Eingänge und Abgänge“ mit Umschaltung Verbund/OPAG (Filter!L13).
    # Je Zeile Gesamt, Komposit, Leben, KV sechs Spalten: Eingänge, Abgänge (negativ), drei Delta-Punkte bei 0 (weniger, mehr, gleich –
    # je Vorzeichen eine Reihe, damit die Box grün bzw. gelb wird) und der Delta-Text. AA/AB: Skala der Sparten (gemeinsam) und
    # der Gesamtzeile als unsichtbare Punkte bei +M und -M, damit die automatische Achse symmetrisch ist und die Sparten vergleichbar bleiben.
    quelle_opag = 'Filter!$L$13="OPAG"'
    ws_d.write('A35', 'Block C: Eingänge und Abgänge je Zeile (Gesamt, Komposit, Leben, KV) für die Quelle aus Filter!L13 (Verbund oder OPAG); '
                      'Eingänge positiv, Abgänge negativ, Delta als Punkt bei 0 mit Text; AA/AB Skala (unsichtbar).', st.untertitel)
    kopf_c = ['Periode', 'Index']
    for z in BW_ZEILEN:
        kopf_c += ['%s Ein' % z, '%s Abg (neg.)' % z, '%s Δ weniger' % z, '%s Δ mehr' % z, '%s Δ gleich' % z, '%s Δ Text' % z]
    kopf_c += ['Skala Sparten', 'Skala Gesamt']
    for c, t in enumerate(kopf_c):
        ws_d.write(35, c, t, st.spalte)
    ws_d.set_row(35, 30)
    # (Verlauf Ein, Verlauf Abg, KW Ein, KW Abg) je Zeile und Quelle; Gesamt = alle Sparten im Filter
    herkunft = {'OPAG': [('I', 'J', 'AA', 'G')] + quellen['OPAG'], 'Verbund': [('S', 'T', 'AE', 'K')] + quellen['Verbund']}
    for j in range(1, 8):
        x = 36 + j
        pz = 3 + j
        ws_d.write_formula(x - 1, 1, '=$B$%d' % pz, st.zelle_zahl)
        ws_d.write_formula(x - 1, 0, '=IF(%s,$BT$%d,$BU$%d)' % (quelle_opag, pz, pz), st.zelle)      # Achse der gewaehlten Quelle (ohne Stern)
        for zi in range(len(BW_ZEILEN)):
            wert = {}
            for q in ('OPAG', 'Verbund'):
                ve, va, ke, ka = herkunft[q][zi]
                wert[q] = ['N(IF(%s,INDEX(KW!$%s$6:$%s$%d,$B%d),INDEX(Verlauf!$%s$6:$%s$%d,$B%d)))' % (woche, k_, k_, letzte_kw, x, v_, v_, MAX_VERLAUF, x)
                           for v_, k_ in ((ve, ke), (va, ka))]
            b = 2 + zi * 6
            ce, ca = xl_col_to_name(b), xl_col_to_name(b + 1)
            # leere Slots als "" statt #NV: Excel beschriftet #NV-Saeulen sonst mit "#NV"; "" zeichnet als 0, das Zahlenformat blendet 0 aus
            leer = 'OR($B%d="",IF(%s,$AH$%d,$AI$%d)=0)' % (x, quelle_opag, pz, pz)       # kein Stand der gewaehlten Quelle
            ws_d.write_formula(x - 1, b, '=IF(%s,"",IF(%s,%s,%s))' % (leer, quelle_opag, wert['OPAG'][0], wert['Verbund'][0]), st.zelle_zahl)
            ws_d.write_formula(x - 1, b + 1, '=IF(%s,"",-IF(%s,%s,%s))' % (leer, quelle_opag, wert['OPAG'][1], wert['Verbund'][1]), st.zelle_zahl)
            d = '(%s%d+%s%d)' % (ce, x, ca, x)
            for k, bed in enumerate(['%s<0' % d, '%s>0' % d, '%s=0' % d]):
                ws_d.write_formula(x - 1, b + 2 + k, '=IF(%s%d="",NA(),IF(%s,0,NA()))' % (ce, x, bed), st.zelle_zahl)
            ws_d.write_formula(x - 1, b + 5, '=IF(%s%d="","",IF(%s>0,"+"&FIXED(%s,0),IF(%s<0,"-"&FIXED(-%s,0),"±0")))' % (ce, x, d, d, d, d), st.zelle)
    m_sp = 'MAX(IFERROR(AGGREGATE(4,6,%s),0),IFERROR(-AGGREGATE(5,6,%s),0))'
    m_sp_ausdruck = 'MAX(%s)' % ','.join(m_sp % ('$%s$37:$%s$43' % (xl_col_to_name(2 + zi * 6), xl_col_to_name(2 + zi * 6)),
                                                 '$%s$37:$%s$43' % (xl_col_to_name(3 + zi * 6), xl_col_to_name(3 + zi * 6))) for zi in (1, 2, 3))
    m_ge_ausdruck = m_sp % ('$C$37:$C$43', '$D$37:$D$43')
    for c, m in ((26, m_sp_ausdruck), (27, m_ge_ausdruck)):
        ws_d.write_formula(36, c, '=IF(%s>0,%s*1.3,NA())' % (m, m), st.zelle_zahl)
        ws_d.write_formula(37, c, '=IF(%s>0,-%s*1.3,NA())' % (m, m), st.zelle_zahl)
        for r_ in range(38, 43):
            ws_d.write_formula(r_, c, '=NA()', st.zelle_zahl)
    # Block D: Zeilen 50..56 – Produktivitaet nach Ansicht: Tagessicht = 7 Stichtage ohne leere Wochenenden (Tagesabgaenge je MAK,
    # Verlauf!AR:AW), KW = Montag bis Sonntag der KW des Bezugstags (Plaetze wie Block A), Wochensicht = die 7 KW bis zur KW des
    # letzten Stichtags (Wochenabgaenge je MAK, KW!O:T). Achse je Quelle wie Block A: I OPAG, J Verbund (Datum K bzw. L).
    ws_d.write('A48', 'Block D: Produktivität für die beiden Diagramme – Tagessicht je Stichtag, Aktuelle KW Montag bis Sonntag, Wochensicht je KW (Achse I OPAG, J Verbund) · M:Z: Tageswerte Mo–Fr ohne Feiertage für den Ø der Kachel (nur Tag/KW) · AA:AB: MAK dieser Tage (Ø im PPT-Kopf)', st.untertitel)
    for c, t in enumerate(['Periode', 'Index', 'Verbund KV', 'Verbund Komposit/Leben', 'Verbund Gesamt', 'OPAG KV', 'OPAG Komposit/Leben', 'OPAG Gesamt',
                           'Periode OPAG (Achse)', 'Periode Verbund (Achse)', 'Datum OPAG', 'Datum Verbund']):
        ws_d.write(48, c, t, st.spalte if c < 2 else st.spalte_verbund if c in (2, 3, 4, 9, 11) else st.spalte_opag)
    for j in range(1, 8):
        x = 49 + j
        pz = 3 + j
        # Tagessicht: die letzten 7 Stichtage bis zum Bezugstag ohne Wochenenden, an denen laut Kalender niemand da war
        # (Samstag/Sonntag nur mit MAK am Tag > 0, Verlauf!AZ) – sonst stehen leere Wochenendplaetze im Diagramm
        va, az = 'Verlauf!$A$6:$A$%d' % MAX_VERLAUF, 'Verlauf!$AZ$6:$AZ$%d' % MAX_VERLAUF
        ws_d.write_formula(x - 1, 1, '=IF(%s,MAX(1,KW!$AQ$6-6)+%d,IF(%s,$B$%d,IFERROR(AGGREGATE(14,6,(ROW(%s)-5)/((%s<=Filter!$O$40)*(%s>0)*(((WEEKDAY(%s,2)<=5)+(%s>0))>0)),%d),"")))'
                           % (woche, j - 1, kwm, pz, va, va, va, va, az, 8 - j), st.zelle_zahl)
        # K/L: Datum je Quelle (Woche: letzter Stichtag der KW mit Stand der Quelle, KW: Datum des Platzes, Tag: Stichtag)
        for c, col in ((10, 'AS'), (11, 'AT')):
            kw_d = 'INDEX(KW!$%s$6:$%s$%d,$B%d)' % (col, col, letzte_kw, x)
            ws_d.write_formula(x - 1, c, '=IF(%s,IF(N(%s)=0,"",%s),IF(%s,$BO$%d,IF($B%d="","",INDEX(%s,$B%d))))' % (woche, kw_d, kw_d, kwm, pz, x, va, x), st.zelle_dat)
        ws_d.write_formula(x - 1, 8, achse('$B%d' % x, '$K%d' % x, ft=True), st.zelle)
        ws_d.write_formula(x - 1, 9, achse('$B%d' % x, '$L%d' % x, ft=True), st.zelle)
        ws_d.write_formula(x - 1, 0, '=IF(N($L%d)>N($K%d),$J%d,$I%d)' % (x, x, x, x), st.zelle)
        for c, (kcol, vcol) in enumerate((('O', 'AR'), ('P', 'AS'), ('Q', 'AT'), ('R', 'AU'), ('S', 'AV'), ('T', 'AW'))):
            ws_d.write_formula(x - 1, 2 + c, '=IF($B%d="",NA(),IF(%s,INDEX(KW!$%s$6:$%s$%d,$B%d),INDEX(Verlauf!$%s$6:$%s$%d,$B%d)))'
                               % (x, woche, kcol, kcol, letzte_kw, x, vcol, vcol, MAX_VERLAUF, x), st.zelle_dez)
    # Block D, Spalten M:Z – Tageswerte fuer die Produktivitaetskachel (nur Tagessicht und Aktuelle KW; in der Wochensicht leer):
    # ein Platz zaehlt, wenn sein Datum Montag bis Freitag ist und kein Feiertag (Name FT_Datum, Konfiguration N); gemittelt werden
    # nur Tage mit Wert – also genau die gezeigten Saeulen/Punkte ohne Wochenend- und Feiertagsplaetze. M/N Datum (Verbund/OPAG),
    # O:Q Verbund KV, Komp./Leben, Gesamt, R:T OPAG, U/V Datum mit Gesamtwert, W/X Wochentags-Bit (nur KW: Mo=1 … Fr=16),
    # Y/Z Platz-Bit (Vergleich, ob OPAG dieselben Tage hat)
    for c, t in enumerate(['Verbund: Tag zählt (Mo–Fr, kein Feiertag)', 'OPAG: Tag zählt (Mo–Fr, kein Feiertag)',
                           'Verbund KV (Kachel)', 'Verbund Komp./Leben (Kachel)', 'Verbund Gesamt (Kachel)',
                           'OPAG KV (Kachel)', 'OPAG Komp./Leben (Kachel)', 'OPAG Gesamt (Kachel)',
                           'Verbund: Datum mit Wert', 'OPAG: Datum mit Wert', 'Verbund: Wochentag-Bit (KW)', 'OPAG: Wochentag-Bit (KW)',
                           'Verbund: Platz-Bit', 'OPAG: Platz-Bit']):
        ws_d.write(48, 12 + c, t, st.spalte_verbund if c in (0, 2, 3, 4, 8, 10, 12) else st.spalte_opag)
    for j in range(1, 8):
        x = 49 + j
        for c, dat in ((12, 'L'), (13, 'K')):
            ws_d.write_formula(x - 1, c, '=IF(OR(Filter!$L$9="Woche",$B%d="",N($%s%d)=0),"",IF(AND(WEEKDAY(N($%s%d),2)<=5,COUNTIF(FT_Datum,N($%s%d))=0),N($%s%d),""))'
                               % (x, dat, x, dat, x, dat, x, dat, x), st.zelle_dat)
        for c, (kz, src) in enumerate((('M', 'C'), ('M', 'D'), ('M', 'E'), ('N', 'F'), ('N', 'G'), ('N', 'H'))):
            ws_d.write_formula(x - 1, 14 + c, '=IF(AND(N($%s%d)>0,ISNUMBER(%s%d)),%s%d,"")' % (kz, x, src, x, src, x), st.zelle_dez)
        for c, (ges, kz) in enumerate((('Q', 'M'), ('T', 'N'))):
            ws_d.write_formula(x - 1, 20 + c, '=IF(ISNUMBER(%s%d),$%s%d,"")' % (ges, x, kz, x), st.zelle_dat)
            ws_d.write_formula(x - 1, 22 + c, '=IF(AND(Filter!$L$9="KW",ISNUMBER(%s%d)),2^(WEEKDAY($%s%d,2)-1),0)' % (ges, x, kz, x), st.zelle_ganz)
            ws_d.write_formula(x - 1, 24 + c, '=IF(ISNUMBER(%s%d),%d,0)' % (ges, x, 2 ** (j - 1)), st.zelle_ganz)
    # AA/AB: MAK des Tages (Verlauf!AZ, nach Sparten-Chips) fuer die gezaehlten Tage – ihr Mittel (Filter t_mak) ist die MAK-Zahl im
    # PPT-Kopf neben dem Tages-Ø (Nenner der gezaehlten Tage statt der Kalender-MAK der KW)
    for c, t in enumerate(['Verbund: MAK des Tages (gezählt)', 'OPAG: MAK des Tages (gezählt)']):
        ws_d.write(48, 26 + c, t, st.spalte_verbund if c == 0 else st.spalte_opag)
    for j in range(1, 8):
        x = 49 + j
        for c, kz in enumerate(('U', 'V')):
            ws_d.write_formula(x - 1, 26 + c, '=IF(ISNUMBER(%s%d),INDEX(Verlauf!$AZ$6:$AZ$%d,$B%d),"")' % (kz, x, MAX_VERLAUF, x), st.zelle_dez)
    ws_d.set_column('M:AB', 11)

    # ---------------------------------------------------------- Produktivitaet je Ansicht: Kachel, Diagramm-Untertitel, PPT (Filter!N50:P…)
    # Wochensicht: Wert wie bisher = Abgaenge der KW ÷ Ø MAK der Arbeitstage (KW!Q bzw. KW!T in der KW aus Filter!O43/O44); dazu die
    # Basis: Arbeitstage der KW (KW!AV/AU, Stichtage Mo–Fr ohne Feiertage mit Abgaengen) und welche Wochentage (Bitmaske aus
    # Verlauf!AQ/AP). „bisher“, solange die KW laeuft: KW von heute (Filter!O24) und der letzte geladene Stand der Quelle in der KW
    # liegt vor ihrem letzten Werktag (Freitag, bei Feiertag der Tag davor) – egal ob dieser Stand Abgaenge hat. Die Wochensicht zeigt immer die ganze KW (wie die Wochendiagramme): liegen bei frueherem Bezugstag
    # Staende der KW danach, nennt die Basis das Datum, bis zu dem gerechnet ist („3 Arbeitstage bis 08.10.“).
    # Tagessicht / Aktuelle KW: Ø der Tageswerte aus Block D (Diagrammdaten!M:Z), nur Mo–Fr ohne Feiertage, nur Tage mit Wert.
    ws_fi.write('N50', 'Produktivität je Ansicht (Kachel, Untertitel, PPT)', st.kopf)
    ws_fi.write('O50', 'Verbund', st.kopf_verbund)
    ws_fi.write('P50', 'OPAG', st.kopf_opag)
    ws_fi.write_comment('N50', 'Wochensicht: Abgänge der KW ÷ Ø MAK der Arbeitstage (KW!Q bzw. KW!T), Basis = Arbeitstage der KW (Stichtage Mo–Fr ohne Feiertage mit '
                               'Abgängen); „bisher“, solange die KW von heute ist und der letzte geladene Stand der Quelle vor ihrem letzten Werktag liegt; immer die ganze KW (bei früherem Bezugstag „bis TT.MM.“). '
                               'Tagessicht und Aktuelle KW: Mittel der Tageswerte (Abgänge des Tages ÷ MAK an diesem Tag) über die gezeigten Tage Mo–Fr ohne '
                               'Feiertage (FT_Datum), nur Tage mit Wert (Tage ohne Abgänge zählen nicht) – Diagrammdaten!M:Z.',
                        {'author': 'BÜ-Reporting', 'x_scale': 2.6, 'y_scale': 2.0, 'font_name': FONT, 'font_size': 9})
    pz_zeilen = [   # (Schluessel, Beschriftung, Format, Formel je Quelle) – {c} = Spalte O (Verbund) bzw. P (OPAG), {schluessel} = Zeile
        ('w_zeile', 'Woche: Zeile in KW (O43/O44)', st.berechnet_zahl, '={zeile}'),
        ('w_kw', 'Woche: KW', st.berechnet_ganz, '=IF({c}{w_zeile}=0,"",INDEX(KW!$B$6:$B$400,{c}{w_zeile}))'),
        ('w_montag', 'Woche: Montag der KW', st.berechnet_dat,
         '=IF({c}{w_zeile}=0,"",DATE(INDEX(KW!$A$6:$A$400,{c}{w_zeile}),1,4)-WEEKDAY(DATE(INDEX(KW!$A$6:$A$400,{c}{w_zeile}),1,4),2)+1+7*(INDEX(KW!$B$6:$B$400,{c}{w_zeile})-1))'),
        ('w_tage', 'Woche: Arbeitstage (KW!AV/AU)', st.berechnet_zahl, '=IF({c}{w_zeile}=0,0,N(INDEX(KW!${at}$6:${at}$400,{c}{w_zeile})))'),
        ('w_muster', 'Woche: Wochentage (Bits Mo=1 … Fr=16)', st.berechnet_ganz,
         '=IF({c}{w_zeile}=0,0,' + '+'.join('(COUNTIFS(Verlauf!$A$6:$A$%d,{c}{w_montag}+%d,Verlauf!${flag}$6:${flag}$%d,1)>0)*%d' % (MAX_VERLAUF, k, MAX_VERLAUF, 2 ** k)
                                             for k in range(5)) + ')'),
        ('w_text', 'Woche: Wochentage (Text)', st.berechnet, '=' + WT_TEXT('{c}{w_muster}')),
        # letzter Werktag der KW als Datum (Freitag; ist er Feiertag, der Tag davor usw.)
        ('w_schluss', 'Woche: letzter Werktag der KW (Datum, ohne Feiertage)', st.berechnet_dat,
         '=IF({c}{w_zeile}=0,"",{c}{w_montag}+IF(COUNTIF(FT_Datum,{c}{w_montag}+4)=0,4,IF(COUNTIF(FT_Datum,{c}{w_montag}+3)=0,3,'
         'IF(COUNTIF(FT_Datum,{c}{w_montag}+2)=0,2,IF(COUNTIF(FT_Datum,{c}{w_montag}+1)=0,1,0)))))'),
        # „KW läuft“ (bisher): KW von heute und der letzte geladene Stand der Quelle in dieser KW (w_bis, KW!AT/AS – auch ein Stand
        # ohne Abgaenge oder am Samstag) liegt vor ihrem letzten Werktag. Bis zur Endpruefung hing es an den Tagen MIT Abgaengen
        # (Bitmaske w_muster): ein geladener Freitag ohne Abgaenge liess die KW weiter „laufen“ (Aktuelle KW sagte dagegen „5 Tage“).
        ('w_lauf', 'Woche: KW läuft noch (1/0)', st.berechnet_zahl,
         '=IF({c}{w_zeile}=0,0,IF(AND(INDEX(KW!$W$6:$W$400,{c}{w_zeile})>=$O$24,N({c}{w_bis})<{c}{w_schluss}),1,0))'),
        # letzter Stichtag der KW mit Stand der Quelle (KW!AT/AS); liegt er nach einem frueheren Bezugstag, enthaelt der Wochenwert
        # Staende nach dem Bezugstag (die Wochensicht rechnet immer die ganze KW) – die Basis nennt dann „bis TT.MM.“
        ('w_bis', 'Woche: letzter Stichtag der KW (KW!AT/AS)', st.berechnet_dat, '=IF({c}{w_zeile}=0,"",IF(N(INDEX(KW!${sb}$6:${sb}$400,{c}{w_zeile}))=0,"",INDEX(KW!${sb}$6:${sb}$400,{c}{w_zeile})))'),
        ('w_nach', 'Woche: KW reicht über den Bezugstag (1/0)', st.berechnet_zahl, '=IF(AND($O$45=1,N({c}{w_bis})>N($O$40)),1,0)'),
        ('w_wert', 'Woche: gesamt', st.berechnet_dez, '=IF({c}{w_zeile}=0,"",IFERROR(INDEX(KW!${pg}$6:${pg}$400,{c}{w_zeile}),""))'),
        ('w_kv', 'Woche: KV', st.berechnet_dez, '=IF({c}{w_zeile}=0,"",IFERROR(INDEX(KW!${pkv}$6:${pkv}$400,{c}{w_zeile}),""))'),
        ('w_kl', 'Woche: Komposit/Leben', st.berechnet_dez, '=IF({c}{w_zeile}=0,"",IFERROR(INDEX(KW!${pkl}$6:${pkl}$400,{c}{w_zeile}),""))'),
        # Basis ohne „bisher“ (steht in der Kachel in Zeile 1): „3 Arbeitstage (Mo, Mi–Do)“, bei frueherem Bezugstag „3 Arbeitstage bis 08.10.“
        ('w_tage_text', 'Woche: Arbeitstage (Text, ohne „bisher“)', st.berechnet,
         '=IF({c}{w_zeile}=0,"",IF({c}{w_tage}=0,"noch kein Arbeitstag",{c}{w_tage}&IF({c}{w_tage}=1," Arbeitstag"," Arbeitstage")'
         '&IF({c}{w_nach}=1," bis "&' + TT('{c}{w_bis}') + ',IF({c}{w_text}="",""," ("&{c}{w_text}&")"))))'),
        ('w_basis', 'Woche: Basis (Text)', st.berechnet,
         '=IF({c}{w_zeile}=0,"",IF({c}{w_hoch}=1,"hochgerechnet aus "&{c}{w_ist}&" von "&{c}{w_soll}&" Arbeitstagen",'
         'IF(AND({c}{w_lauf}=1,{c}{w_tage}>0),"bisher ","")&{c}{w_tage_text}))'),
        # kurz fuer den PPT-Kopf (ohne Wochentage): „bisher 3 Arbeitstage“, bei frueherem Bezugstag „3 Arbeitstage bis 08.10.“ (das
        # Datum sagt dort, bis wann gerechnet ist; mit „bisher“ davor passt die Zeile nicht in 269 pt)
        ('w_basis_kurz', 'Woche: Basis kurz (PPT)', st.berechnet,
         '=IF({c}{w_zeile}=0,"",IF({c}{w_hoch}=1,"hochger. "&{c}{w_ist}&"/"&{c}{w_soll}&" Tg.",'
         'IF(AND({c}{w_lauf}=1,{c}{w_tage}>0,{c}{w_nach}=0),"bisher ","")&IF({c}{w_tage}=0,"noch kein Arbeitstag",{c}{w_tage}'
         '&IF({c}{w_tage}=1," Arbeitstag"," Arbeitstage")&IF({c}{w_nach}=1," bis "&' + TT('{c}{w_bis}') + ',""))))'),
        ('t_n', 'Tag/KW: Tage mit Wert (Mo–Fr, kein Feiertag)', st.berechnet_zahl, '=COUNT(Diagrammdaten!${dg}$50:${dg}$56)'),
        ('t_wert', 'Tag/KW: Ø gesamt', st.berechnet_dez, '=IF({c}{t_n}=0,"",AVERAGE(Diagrammdaten!${dg}$50:${dg}$56))'),
        ('t_kv', 'Tag/KW: Ø KV', st.berechnet_dez, '=IF(COUNT(Diagrammdaten!${dkv}$50:${dkv}$56)=0,"",AVERAGE(Diagrammdaten!${dkv}$50:${dkv}$56))'),
        ('t_kl', 'Tag/KW: Ø Komposit/Leben', st.berechnet_dez, '=IF(COUNT(Diagrammdaten!${dkl}$50:${dkl}$56)=0,"",AVERAGE(Diagrammdaten!${dkl}$50:${dkl}$56))'),
        ('t_von', 'Tag/KW: erster gezählter Tag', st.berechnet_dat, '=IF({c}{t_n}=0,"",MIN(Diagrammdaten!${ddat}$50:${ddat}$56))'),
        ('t_bis', 'Tag/KW: letzter gezählter Tag', st.berechnet_dat, '=IF({c}{t_n}=0,"",MAX(Diagrammdaten!${ddat}$50:${ddat}$56))'),
        ('t_muster', 'KW: Wochentage (Bits)', st.berechnet_ganz, '=SUM(Diagrammdaten!${dwt}$50:${dwt}$56)'),
        ('t_plaetze', 'Tag/KW: Plätze (Bits)', st.berechnet_ganz, '=SUM(Diagrammdaten!${dsl}$50:${dsl}$56)'),
        # „bisher“ in Aktueller KW, je Quelle wie w_lauf: nach dem letzten Stand der Quelle bis zum Bezugstag ({ds}: Filter!O32 Verbund,
        # O31 OPAG; nur wenn er in der KW des Bezugstags liegt) folgt in dieser KW noch ein Werktag, der kein Feiertag ist (Stand Do und
        # Freitag Feiertag: abgeschlossen), und die KW laeuft oder ein frueherer Bezugstag ist gewaehlt. Bis zur Endpruefung galt der
        # Bezugstag fuer beide Quellen – fehlte Verbund der Freitag, hiess es in der Wochensicht „bisher“, in der Aktuellen KW nicht.
        ('t_lauf', 'KW: „bisher“ (1/0)', st.berechnet_zahl,
         '=IF(AND($L$9="KW",N($O$5)>0,N({ds})>=N($O$5)-WEEKDAY(N($O$5),2)+1),IF(AND((5-WEEKDAY(N({ds}),2))-COUNTIFS(FT_Datum,">"&N({ds}),FT_Datum,"<="&(N({ds})-WEEKDAY(N({ds}),2)+5))>0,'
         'OR(N($O$9)*100+N($O$10)>=$O$24,$O$45=1)),1,0),0)'),
        ('t_text', 'Tag/KW: Tage (Text)', st.berechnet,
         '=IF({c}{t_n}=0,"",IF($L$9="KW",' + WT_TEXT('{c}{t_muster}') + ',' + TT('{c}{t_von}') + '&IF({c}{t_bis}>{c}{t_von},"–"&' + TT('{c}{t_bis}') + ',"")))'),
        ('t_basis', 'Tag/KW: Basis (Text)', st.berechnet,
         '=IF({c}{t_n}=0,"",IF({c}{t_lauf}=1,"bisher ","")&{c}{t_n}&IF({c}{t_n}=1," Tag"," Tage")&" ("&{c}{t_text}&")")'),
        ('wert', 'Ansicht: Wert gesamt', st.berechnet_dez, '=IF($L$9="Woche",{c}{w_wert},{c}{t_wert})'),
        ('kv', 'Ansicht: KV', st.berechnet_dez, '=IF($L$9="Woche",{c}{w_kv},{c}{t_kv})'),
        ('kl', 'Ansicht: Komposit/Leben', st.berechnet_dez, '=IF($L$9="Woche",{c}{w_kl},{c}{t_kl})'),
        ('basis', 'Ansicht: Basis (Langtext)', st.berechnet,
         '=IF($L$9="Woche",IF({c}{w_zeile}=0,"","je MAK in KW "&{c}{w_kw}&" · "&{c}{w_basis}),'
         'IF({c}{t_n}=0,"","Ø je MAK und Arbeitstag · "&IF($L$9="KW","KW "&$O$10&", ","")&{c}{t_basis}))'),
        # Untertitel der Produktivitaetsdiagramme: Wochensicht mit Kennzeichnung der laufenden KW (letzte KW im Diagramm, KW!AQ6)
        ('u_lauf', 'Diagramm: laufende KW (Text)', st.berechnet,
         '=IF(OR($L$9<>"Woche",N(KW!$AQ$6)=0),"",IF(AND(KW!$AQ$6={c}{w_zeile},{c}{w_hoch}=1),'
         '" · KW "&{c}{w_kw}&" hochgerechnet aus "&{c}{w_ist}&" von "&{c}{w_soll}&" Arbeitstagen",IF(INDEX(KW!$W$6:$W$400,KW!$AQ$6)<$O$24,"",IF(N(INDEX(KW!${at}$6:${at}$400,KW!$AQ$6))=0,'
         '" · KW "&INDEX(KW!$B$6:$B$400,KW!$AQ$6)&" läuft: noch kein Arbeitstag",IF(AND(KW!$AQ$6={c}{w_zeile},{c}{w_lauf}=1),'
         '" · KW "&{c}{w_kw}&" läuft: "&IF({c}{w_hoch}=1,"hochgerechnet aus "&{c}{w_ist}&" von "&{c}{w_soll}&" Arbeitstagen",'
         '"bisher "&{c}{w_tage}&IF({c}{w_tage}=1," Arbeitstag"," Arbeitstage")),"")))))'),
        # Untertitel: Rechenweg und (Tag/KW) der Ø mit demselben Wortlaut wie die Kachel; die Nenner (KV ÷ MAK Gesundheit,
        # Komp./Leben ÷ MAK Komposit) stehen in der Legende der Diagramme
        ('untertitel', 'Diagramm: Untertitel', st.berechnet,
         '=IF($L$9="Woche","Abgänge der KW ÷ Ø MAK ihrer Arbeitstage (Mo–Fr ohne Feiertage, mit Abgängen)"&{c}{u_lauf},'
         '"Abgänge des Tages ÷ MAK des Tages · "&IF({c}{t_n}=0,"noch kein Arbeitstag mit Wert",'
         '"Ø je MAK und Arbeitstag (Mo–Fr ohne Feiertage): "&FIXED({c}{t_wert},1)&" · "&{c}{t_basis}))'),
    ]
    # nur Verbund (Kachel „Produktivität Verbund“ und PPT-Kopf): Zeilen der Kachel, OPAG mit eigener Basis, wenn seine KW/Tage abweichen
    pz_kachel = [
        ('gleich', 'Kachel: OPAG mit denselben Tagen (1/0)', st.berechnet_zahl,
         '=IF($L$9="Woche",IF(AND(P{w_zeile}=O{w_zeile},P{w_muster}=O{w_muster}),1,0),IF(P{t_plaetze}=O{t_plaetze},1,0))'),
        # OPAG-Basis (nur wenn sie von Verbund abweicht). Die Polsterzeile (Cockpit!AU9, 7,5 pt, fester Umbruch) muss in Excel mit
        # mindestens 12 % Reserve in 140 px (100 %) bzw. 126 px (90 %) passen – gerechnet mit ganzzahligen GDI-Glyphenbreiten (10 px
        # bzw. 9 px). Deshalb kurze Fassungen: andere KW „ KW 41 läuft“ bzw. „ KW 40, 4 Tg.“, gleiche KW „ (Mo–Do)“ bzw.
        # „ (bisher 4 Tg.)“, wenn nur OPAG noch laeuft; Aktuelle KW die Wochentage; Tagessicht die Zahl der Tage „ (4 Tage)“ (der
        # Zeitraum „(29.09.–06.10.)“ passte nicht mit Reserve, er steht im Untertitel des OPAG-Diagramms). Das einzige Wochentagsmuster
        # mit zwei Spannen („Mo–Di, Do–Fr“) steht ohne Leerzeichen nach dem Komma.
        ('opag_basis', 'Kachel: Basis OPAG (wenn abweichend)', st.berechnet,
         '=IF(OR(P{wert}="",O{gleich}=1),"",IF($L$9="Woche",IF(P{w_kw}<>O{w_kw},'
         '" KW "&P{w_kw}&IF(P{w_hoch}=1," hochger.",IF(P{w_lauf}=1," läuft",", "&P{w_tage}&IF(P{w_tage}=1," Tag"," Tg."))),'
         'IF(AND(P{w_lauf}=1,O{w_lauf}=0)," (bisher "&P{w_tage}&IF(P{w_tage}=1," Tag"," Tg.")&")"," ("&' + OPAG_WT('P{w_text}') + '&")")),'
         'IF($L$9="KW"," ("&' + OPAG_WT('P{t_text}') + '&")"," ("&P{t_n}&IF(P{t_n}=1," Tag"," Tage")&")")))'),
        ('z_wert', 'Kachel: Wert', st.berechnet_dez, '=IF(O{wert}="","–",O{wert})'),
        # Wochensicht (12.89): Zeile 1 die Vorwoche als Vergleich (gruen/gelb wie die Rueckstands-Badges), Zeile 2 KW und Basis
        ('z1', 'Kachel: Zeile 1', st.berechnet,
         '=IF($L$9="Woche",IF(O{w_zeile}=0,"je MAK und KW",IF(O{w_vor_wert}="",IF(O{w_hoch}=1,"je MAK und KW","je MAK in KW "&O{w_kw}&IF(AND(O{w_lauf}=1,O{w_tage}>0)," · bisher","")),'
         '"Vorwoche KW "&O{w_vor_kw}&": "&FIXED(O{w_vor_wert},1))),'
         'IF($L$9="KW","Ø je MAK/Arbeitstag"&IF(N($O$10)=0,""," · KW "&$O$10),"Ø je MAK und Arbeitstag"))'),
        ('z2', 'Kachel: Zeile 2', st.berechnet,
         '=IF($L$9="Woche",IF(O{w_zeile}=0,"",IF(O{w_hoch}=1,"KW "&O{w_kw}&" · hochger. "&O{w_ist}&" von "&O{w_soll}&" Tg.",'
         'IF(O{w_vor_wert}="",O{w_tage_text},"KW "&O{w_kw}&" · "&O{w_tage}&" Tg."&IF(O{w_nach}=1," bis "&' + TT('O{w_bis}') + ',IF(O{w_text}="",""," ("&O{w_text}&")"))))),'
         'IF(O{t_n}=0,IF(COUNT(Verlauf!$A$6:$A$%d)=0,"","keine Arbeitstage mit Wert"),O{t_basis}))' % MAX_VERLAUF),
        ('z3', 'Kachel: Zeile 3 (KV, Komp./Leben)', st.berechnet,
         '=IF(AND(O{wert}="",O{kv}="",O{kl}=""),"","KV "&' + ZAHL_KURZ('O{kv}') + '&" · Komp./L. "&' + ZAHL_KURZ('O{kl}') + ')'),
        ('z4', 'Kachel: Zeile 4 (OPAG)', st.berechnet, '=IF(P{wert}="",IF(O{z3}="","","OPAG –"),"OPAG "&' + ZAHL_KURZ('P{wert}') + '&O{opag_basis})'),
        ('z34', 'Kachel: Zeilen 3 und 4 (Polsterzeile)', st.berechnet, '=IF(O{z4}="",O{z3},IF(O{z3}="",O{z4},O{z3}&CHAR(10)&O{z4}))'),
        # PPT-Kopf der Kachel „Kapazität (MAK) und Produktivität je KW“ (eine Zeile, ≤ 269 pt, Ziel ≥ 12 % Reserve unter GDI-Rundung
        # bei 8 pt = 11 px): Basis kurz, ohne Wochentage. Steht eine MAK-Zahl neben „Vorg. je MAK“, ist sie deren Nenner („Ø MAK“):
        # Wochensicht der Ø MAK der gezaehlten Arbeitstage der KW (KW!AY, Filter w_mak) – „KW 52: Ø MAK 16,1 · 40,7 Vorg. je MAK,
        # 4 Arbeitstage“ (655 ÷ 16,1 = 40,7); Tagessicht und Aktuelle KW der Ø der Tages-MAK der gezaehlten Tage (Filter t_mak) –
        # Aktuelle KW „Ø MAK 14,9 · Ø 22,7 Vorg. je MAK/Arbeitstag, bisher 3 Tage“, Tagessicht „Ø MAK 14,9 · Ø 28,7 Vorg. je
        # MAK/Arbeitstag (4 Tage bis 08.10.)“. „Vorg.“ (die Box darunter heisst „Vorgänge je MAK“), MAK und Wert ab 100 ohne
        # Nachkommastelle, und in Aktueller KW ohne „KW 41: “ davor – die KW nennt dort die Fussnote (ppt_fuss: „Tagessicht KW 41 ·
        # Boxen: je MAK und KW“ bzw. „* KW 41 läuft: …“): mit „KW 41: Ø MAK 11,2 · Ø 18,2 Vorgänge je MAK/Arbeitstag, bisher
        # 3 Tage“ blieben nur 2 % Reserve.
        # Die Kalender-MAK (KW!N, Mo–Fr ÷ 5, Feiertag 0) bleiben in den Saeulen darunter und im Kopf, solange es noch keine
        # Produktivitaet gibt („KW 41: MAK 14,8“).
        ('ppt', 'PPT: Kopf der Kachel Kapazität/Produktivität', st.berechnet,
         '=IF($O$11=0,"–",IF($L$9="Woche",IF(O{wert}="","KW "&$O$10&": MAK "&FIXED(INDEX(KW!$N$6:$N$400,$O$11),1),'
         '"KW "&O{w_kw}&": Ø MAK "&' + ZAHL_KURZ('O{w_mak}') + '&" · "&' + ZAHL_KURZ('O{wert}') + '&" Vorg. je MAK, "&O{w_basis_kurz}),'
         'IF($L$9="KW",IF(O{wert}="","KW "&$O$10&": MAK "&FIXED(INDEX(KW!$N$6:$N$400,$O$11),1),'
         '"Ø MAK "&' + ZAHL_KURZ('O{t_mak}') + '&" · Ø "&' + ZAHL_KURZ('O{wert}') + '&" Vorg. je MAK/Arbeitstag, "&IF(O{t_lauf}=1,"bisher ","")&O{t_n}&IF(O{t_n}=1," Tag"," Tage")),'
         'IF(O{wert}="","MAK KW "&$O$10&": "&FIXED(INDEX(KW!$N$6:$N$400,$O$11),1),'
         '"Ø MAK "&' + ZAHL_KURZ('O{t_mak}') + '&" · Ø "&' + ZAHL_KURZ('O{wert}') + '&" Vorg. je MAK/Arbeitstag ("&O{t_n}&IF(O{t_n}=1," Tag"," Tage")&" bis "&' + TT('O{t_bis}') + '&")"))))'),
        # Fussnote der PPT-Kachel Kapazitaet/Produktivitaet (PPT!BA13; leer = Filterzeile BA12 wie die uebrigen Kacheln): die Boxen
        # unter den MAK-Saeulen sind immer Wochenwerte der ganzen KW – in Tag/KW sagt die Fussnote das. Die Box der Kachel-KW traegt
        # einen Stern („69,4*“, Filter stern), wenn die KW laeuft oder – bei frueherem Bezugstag – Staende nach dem Bezugstag enthaelt
        # (wie die Kachel, w_nach). Neuester Stand: „* KW 41 läuft: Verbund 3, OPAG 4 Arbeitstage“ (ohne „bisher“ je Quelle: hinter „Boxen: je MAK und KW · “
        # hatte die Fassung „Verbund bisher 3, OPAG bisher 4“ unter GDI-Rundung nur 1 % Reserve; „läuft“ sagt dasselbe).
        # Frueherer Bezugstag (Filter!O45 = 1): bis wann die Box rechnet, ohne „läuft“ – „* KW 41: Verbund 3, OPAG 4 Arbeitstage bis
        # 08.10.“, bei verschiedenen letzten Staenden nur die Daten „* KW 41: Verbund bis 07.10., OPAG bis 08.10.“ (mit den Zahlen
        # passt die Fussnote mit „Boxen: je MAK und KW · “ davor nicht in 269 pt). So widerspricht die Fussnote dem Kopf nicht
        # (Aktuelle KW „bisher 1 Tag“ bis zum Bezugstag, die Box dagegen die ganze KW).
        ('ppt_lauf', 'PPT: laufende KW in den Boxen (Text)', st.berechnet,
         '=IF($O$45=1,IF(AND(O{stern}=1,P{stern}=1),"* KW "&O{w_kw}&": "&IF(N(O{w_bis})=N(P{w_bis}),'
         'IF(O{w_tage}=P{w_tage},"","Verbund "&O{w_tage}&", OPAG ")&P{w_tage}&IF(P{w_tage}=1," Arbeitstag"," Arbeitstage")&" bis "&' + TT('P{w_bis}') + ','
         '"Verbund bis "&' + TT('O{w_bis}') + '&", OPAG bis "&' + TT('P{w_bis}') + '),'
         'IF(O{stern}=1,"* KW "&O{w_kw}&": Verbund "&O{w_tage}&IF(O{w_tage}=1," Arbeitstag"," Arbeitstage")&" bis "&' + TT('O{w_bis}') + ','
         'IF(P{stern}=1,"* KW "&P{w_kw}&": OPAG "&P{w_tage}&IF(P{w_tage}=1," Arbeitstag"," Arbeitstage")&" bis "&' + TT('P{w_bis}') + ',""))),'
         'IF(AND(OR(O{w_hoch}=1,P{w_hoch}=1),OR(ISNUMBER(O{w_wert}),ISNUMBER(P{w_wert}))),"* KW "&IF(O{w_hoch}=1,O{w_kw},P{w_kw})&" hochger. ("&'
         'IF(AND(O{w_hoch}=1,P{w_hoch}=1),IF(O{w_ist}=P{w_ist},O{w_ist},"Verbund "&O{w_ist}&", OPAG "&P{w_ist}),IF(O{w_hoch}=1,"Verbund "&O{w_ist},"OPAG "&P{w_ist}))'
         '&" von "&IF(O{w_hoch}=1,O{w_soll},P{w_soll})&" Tg.)",'
         'IF(AND(O{w_lauf}=1,ISNUMBER(O{w_wert}),P{w_lauf}=1,ISNUMBER(P{w_wert})),"* KW "&O{w_kw}&" läuft: "&IF(O{w_tage}=P{w_tage},'
         '"bisher "&O{w_tage}&IF(O{w_tage}=1," Arbeitstag"," Arbeitstage"),"Verbund "&O{w_tage}&", OPAG "&P{w_tage}&IF(P{w_tage}=1," Arbeitstag"," Arbeitstage")),'
         'IF(AND(O{w_lauf}=1,ISNUMBER(O{w_wert})),"* KW "&O{w_kw}&" läuft: Verbund bisher "&O{w_tage}&IF(O{w_tage}=1," Arbeitstag"," Arbeitstage"),'
         'IF(AND(P{w_lauf}=1,ISNUMBER(P{w_wert})),"* KW "&P{w_kw}&" läuft: OPAG bisher "&P{w_tage}&IF(P{w_tage}=1," Arbeitstag"," Arbeitstage"),"")))))'),
        ('ppt_fuss', 'PPT: Fußnote der Kachel Kapazität/Produktivität', st.berechnet,
         '=IF($L$9="Woche",O{ppt_lauf},IF(AND($L$9="KW",O{ppt_lauf}="",N($O$10)>0),"Tagessicht KW "&$O$10&" · ","")&"Boxen: je MAK und KW"&IF(O{ppt_lauf}="",""," · "&O{ppt_lauf}))'),
    ]
    # angehaengt (beide Quellen; die Zeilen oben behalten ihre Nummern): Nenner fuer den PPT-Kopf und Stern der PPT-Boxen
    pz_ende = [
        ('w_mak', 'Woche: Ø MAK der Arbeitstage (KW!AY/BB, Nenner)', st.berechnet_dez,
         '=IF({c}{w_zeile}=0,"",IFERROR(INDEX(KW!${wm}$6:${wm}$400,{c}{w_zeile})+0,""))'),
        ('t_mak', 'Tag/KW: Ø MAK der gezählten Tage (Diagrammdaten!AA/AB)', st.berechnet_dez,
         '=IF(COUNT(Diagrammdaten!${dmk}$50:${dmk}$56)=0,"",AVERAGE(Diagrammdaten!${dmk}$50:${dmk}$56))'),
        ('stern', 'PPT: Stern an der Box der Kachel-KW (1/0)', st.berechnet_zahl,
         '=IF(AND(ISNUMBER({c}{w_wert}),OR({c}{w_lauf}=1,{c}{w_nach}=1,{c}{w_hoch}=1)),1,0)'),
        # Hochrechnung (12.89, KW!BK:BO): Arbeitstage der KW, hochgerechnet ja/nein, Arbeitstage bis zum letzten Stand
        ('w_soll', 'Woche: Arbeitstage der KW (KW!BL)', st.berechnet_zahl, '=IF({c}{w_zeile}=0,0,N(INDEX(KW!$BL$6:$BL$400,{c}{w_zeile})))'),
        ('w_hoch', 'Woche: hochgerechnet (1/0)', st.berechnet_zahl,
         '=IF({c}{w_zeile}=0,0,IF(N(INDEX(KW!${fak}$6:${fak}$400,{c}{w_zeile}))>1,1,0))'),
        ('w_ist', 'Woche: Arbeitstage bis zum letzten Stand', st.berechnet_zahl,
         '=IF({c}{w_hoch}=1,NETWORKDAYS({c}{w_montag},N({c}{w_bis}),FT_Datum),{c}{w_tage})'),
        # Vorwoche (Vergleich in der Kachel): Wert der KW davor (Zeile darueber im Blatt KW)
        ('w_vor_kw', 'Woche: Vorwoche (KW)', st.berechnet_ganz, '=IF({c}{w_zeile}<=1,"",INDEX(KW!$B$6:$B$400,{c}{w_zeile}-1))'),
        ('w_vor_wert', 'Woche: Vorwoche gesamt', st.berechnet_dez, '=IF({c}{w_zeile}<=1,"",IFERROR(INDEX(KW!${pg}$6:${pg}$400,{c}{w_zeile}-1)+0,""))'),
        # Kachel: Vorwoche minus aktuell (positiv = gesunken -> gelb, negativ = gestiegen -> gruen; wie die Rueckstands-Badges)
        ('w_rueck', 'Kachel: Vorwoche minus aktuelle KW', st.berechnet_dez,
         '=IF(AND($L$9="Woche",ISNUMBER({c}{w_wert}),ISNUMBER({c}{w_vor_wert})),{c}{w_vor_wert}-{c}{w_wert},"")'),
    ]
    PZ = {}
    for i, (k, _t, _f, _fm) in enumerate(pz_zeilen + pz_kachel + pz_ende):
        PZ[k] = 51 + i
    quelle_cols = {'O': dict(zeile='$O$43', at='AV', flag='AQ', sb='AT', pg='Q', pkv='O', pkl='P', dg='Q', dkv='O', dkl='P', ddat='U', dwt='W', dsl='Y',
                             ds='$O$32', wm='AY', dmk='AA', fak='BN'),
                   'P': dict(zeile='$O$44', at='AU', flag='AP', sb='AS', pg='T', pkv='R', pkl='S', dg='T', dkv='R', dkl='S', ddat='V', dwt='X', dsl='Z',
                             ds='$O$31', wm='BB', dmk='AB', fak='BO')}
    for k, text, fmt, fm in pz_zeilen + pz_ende:
        ws_fi.write(PZ[k] - 1, 13, text, st.zelle)
        for c, sp in (('O', 14), ('P', 15)):
            ws_fi.write_formula(PZ[k] - 1, sp, fm.format(c=c, **quelle_cols[c], **PZ), fmt)
    for k, text, fmt, fm in pz_kachel:
        ws_fi.write(PZ[k] - 1, 13, text, st.zelle)
        ws_fi.write_formula(PZ[k] - 1, 14, fm.format(**PZ), fmt)
    global PROD_ZEILEN
    PROD_ZEILEN = dict(PZ)
    # PPT-Boxen (Diagrammdaten!BE/BG): Abgaenge je MAK der KW; die Kachel-KW mit Stern, wenn sie laeuft oder bei frueherem Bezugstag
    # Staende danach enthaelt (Filter stern), erklaert in der Fussnote der PPT-Kachel (Filter ppt_fuss -> PPT!BA13)
    for x in range(4, 11):
        for k, (prod, c) in enumerate((('Q', 'O'), ('T', 'P'))):
            wert = 'INDEX(KW!$%s:$%s,$BC%d)' % (prod, prod, x)
            ws_d.write_formula(x - 1, 56 + k * 2, '=IF(ISNUMBER(%s),FIXED(%s,1)&IF(AND($BC%d=Filter!$%s$%d+5,Filter!$%s$%d=1),"*",""),"")'
                               % (wert, wert, x, c, PZ['w_zeile'], c, PZ['stern']), st.zelle)
    # Summen fuer den Block rechts in der Kachel (Textfelder): Tagessicht und KW = alle 7 Perioden, Wochensicht = letzte KW (Slot 7)
    ws_d.write_formula('A44', '="Summen"', st.spalte)
    # Ueberschrift des Summenblocks (Textfeld): Woche „Σ KW 41“ (letzte KW), KW „Σ KW 41“ (Tage der KW bis zum Bezugstag), Tag „Σ letzte n Stichtage“
    ws_d.write_formula('C44', '=IF(%s,IF($B$10="","Σ","Σ KW "&INDEX(KW!$B$6:$B$%d,$B$10)),IF(%s,IF(Filter!$O$10="","Σ","Σ KW "&Filter!$O$10),"Σ letzte "&$AF$2&" Stichtage"))'
                       % (woche, letzte_kw, kwm), st.zelle)
    for zi, z in enumerate(BW_ZEILEN):
        x = 45 + zi
        ce, ca = xl_col_to_name(2 + zi * 6), xl_col_to_name(3 + zi * 6)
        sm = lambda col: 'IF(%s,IFERROR(N(%s43),0),AGGREGATE(9,6,%s37:%s43))' % (woche, col, col, col)  # noqa: E731
        ws_d.write(x - 1, 0, z, st.zelle)
        ws_d.write_formula(x - 1, 2, '=FIXED(%s,0)' % sm(ce), st.zelle)
        ws_d.write_formula(x - 1, 3, '=FIXED(-%s,0)' % sm(ca), st.zelle)
        d = '(%s+%s)' % (sm(ce), sm(ca))
        ws_d.write_formula(x - 1, 4, '=IF(%s<0,"-"&FIXED(-%s,0),"")' % (d, d), st.zelle)
        ws_d.write_formula(x - 1, 5, '=IF(%s>0,"+"&FIXED(%s,0),IF(%s=0,"±0",""))' % (d, d, d), st.zelle)
    # KPI-Kacheln im Cockpit je Ansicht (BY:BZ): Wochensicht = letzte KW (Slot 7) mit Veraenderung zur Vorwoche (Slot 6) und
    # Eingaengen/Abgaengen der KW; Aktuelle KW = Rueckstand des Stichtags, Eingaenge/Abgaenge Summe der KW bis zum Bezugstag;
    # Tagessicht = wie bisher (Stichtag gegen vorherigen Stand)
    ws_d.write('BY3', 'KPI-Kacheln je Ansicht', st.spalte)
    ws_d.write('CA3', 'Ø Alter OPAG', st.spalte)            # Werte CA4:CB10 im Block A (Diagramm „Ø Alter im Verlauf“)
    ws_d.write('CB3', 'Ø Alter Verbund', st.spalte)
    hilfe = [
        ('Ansicht (T/K/W)', '=IF(%s,"W",IF(%s,"K","T"))' % (woche, kwm)),
        ('KW der Kacheln', '=IF(%s,IF($B$10="","",INDEX(KW!$B$6:$B$%d,$B$10)),Filter!$O$10)' % (woche, letzte_kw)),
        ('Δ OPAG zur Vorwoche', '=IF(AND(ISNUMBER($F$10),ISNUMBER($F$9)),$F$10-$F$9,"")'),
        ('Δ Verbund zur Vorwoche', '=IF(AND(ISNUMBER($J$10),ISNUMBER($J$9)),$J$10-$J$9,"")'),
        ('Δ OPAG je Ansicht', '=IF($BZ$4="W",$BZ$6,Filter!$O$19)'),
        ('Δ Verbund je Ansicht', '=IF($BZ$4="W",$BZ$7,Filter!$O$20)'),
        ('KW davor', '=IF($B$9="","",INDEX(KW!$B$6:$B$%d,$B$9))' % letzte_kw),
        ('Eingänge Verbund (W/K)', '=IF($BZ$4="W",IFERROR(1*$N$10,0),AGGREGATE(9,6,$N$4:$N$10))'),
        ('Abgänge Verbund (W/K)', '=-IF($BZ$4="W",IFERROR(1*$O$10,0),AGGREGATE(9,6,$O$4:$O$10))'),
        ('Eingänge OPAG (W/K)', '=IF($BZ$4="W",IFERROR(1*$K$10,0),AGGREGATE(9,6,$K$4:$K$10))'),
        ('Abgänge OPAG (W/K)', '=-IF($BZ$4="W",IFERROR(1*$L$10,0),AGGREGATE(9,6,$L$4:$L$10))'),
    ]
    for i, (lab, f) in enumerate(hilfe):
        ws_d.write(3 + i, 76, lab, st.zelle)
        ws_d.write_formula(3 + i, 77, f, st.zelle)
    ws_d.freeze_panes(3, 0)

    # ---------------------------------------------------------- Snapshots
    for ws_s, q in ((ws_so, 'OPAG'), (ws_sv, 'Verbund')):
        # nur Spaltenformate und Kopfzeile (bis zu 30.000 Schluessel, keine Formate je Zelle)
        ws_s.set_column('A:A', 44, st.zelle)
        ws_s.set_column('B:C', 10, st.zelle)
        ws_s.set_column('D:D', 16, st.zelle)
        ws_s.set_column('E:E', 30, st.zelle)
        ws_s.set_column('F:F', 12, st.zelle)
        ws_s.set_column('G:G', 18, st.zelle)
        ws_s.set_column('H:H', 12, st.zelle_zahl)
        ws_s.set_row(0, 20)
        ws_s.freeze_panes(1, 0)
        kopf_s = st.kopf_opag if q == 'OPAG' else st.kopf_verbund
        for c, t in enumerate(['Schlüssel', 'Sparte', 'VSS', 'Themenpostkorb', 'GEVO_SL', 'Strang|Einheit']):
            ws_s.write(0, c, t, kopf_s)
        ws_s.set_column('J:J', 16, st.zelle)
        ws_s.set_column('K:K', 12, st.zelle_dat)
        ws_s.set_column('L:L', 10, st.zelle_zahl)
        for c, t in enumerate(['Strang', 'Stichtag', 'Schlüssel']):
            ws_s.write(0, 9 + c, t, kopf_s)
        ws_s.merge_range('G1:H1', 'Stand %s (nicht bearbeiten)' % q, kopf_s)
        ws_s.write('G2', 'Stichtag des Stands', st.zelle)
        ws_s.write('G3', 'Schlüssel', st.zelle)
        if snap[q]:
            ws_s.write_datetime('H2', dt.datetime(snap_datum[q].year, snap_datum[q].month, snap_datum[q].day), st.zelle_dat)
            ws_s.write_number('H3', len(snap[q]), st.zelle_zahl)
            for i, (key, m) in enumerate(snap[q].items()):
                ws_s.write_row(1 + i, 0, [key, m[0], m[1], m[2], m[3]])

    # ---------------------------------------------------------- Anleitung
    anleitung(wb, ws_an, st)

    # ---------------------------------------------------------- Cockpit
    kw_index = {(j, k): i for i, (j, k) in enumerate(kw_liste)}
    st_rows = sorted({kw_index.get((d.isocalendar()[0], d.isocalendar()[1])) for d in stichtage} - {None})
    bereiche = {'n_st': max(1, len(stichtage)),
                'kw1': 6 + (min(st_rows) if st_rows else 0), 'kw2': 6 + (max(st_rows) if st_rows else 0),
                'n_pk': max(1, len(postkoerbe))}
    werte = cockpit_werte(fakten, stichtage)
    cockpit(wb, ws_c, st, postkoerbe, gevo_typen, bereiche, werte)
    ppt_blatt(wb, ws_ppt, st, bereiche, werte)
    # #NV in den Hilfsblaettern (leere Diagrammplaetze, Tage ohne Bewegungen) unsichtbar und ohne gruenes Fehlerdreieck
    na_fmt = wb.add_format({'font_color': WEISS})
    for ws_, ber in ((ws_d, 'A3:BA60'), (ws_k, 'A6:BB%d' % letzte_kw), (ws_v, 'A6:AZ%d' % (MAX_VERLAUF + 5))):
        ws_.conditional_format(ber, {'type': 'formula', 'criteria': '=ISNA(%s)' % ber.split(':')[0], 'format': na_fmt})
        ws_.ignore_errors({'eval_error': ber})

    wb.close()
    return postkoerbe, gevo_typen



# ------------------------------------------------------------------ Anleitung (How-to)
ANLEITUNG = [
 ('H1', 'Anleitung: BÜ-Reporting HSB4 K'),
 ('P', 'Diese Arbeitsmappe ist die Master-Datei des tagesbasierten BÜ-Reportings. Sie liest die Rückstandsabzüge OPAG und Verbund aus einem Ordner, '
       'führt Rückstand, Eingänge, Abgänge und Produktivität fort und zeigt alles im Cockpit. Die Rohdaten selbst bleiben unverändert in ihrem Ordner.'),
 ('H2', '1. Ordner einrichten'),
 ('B', 'Master-Datei (diese Datei) in einen eigenen Ordner legen, zum Beispiel „BÜ-Reporting“.'),
 ('B', 'Daneben den Unterordner „Rohdaten“ anlegen. Dort landen die Rückstandsabzüge. Der Name ist in Konfiguration!B3 änderbar (relativ zur Master-Datei oder absolut).'),
 ('B', 'Master-Datei auf SharePoint (auch ohne OneDrive): Datei aus SharePoint mit „In Desktop-App öffnen“ öffnen. Das Tool listet die Ordner Rohdaten und Anwesenheit daneben '
       'über Power Query auf und öffnet die Dateien direkt über SharePoint. Beim ersten Laden fragt Excel einmal nach der Anmeldung: „Organisationskonto“ (oder „Microsoft-Konto“), '
       '„Anmelden“, „Verbinden“. Die Dateien bleiben dort unter ihrem Namen liegen (keine Monatsablage); schon geladene Dateien werden nicht erneut geöffnet. '
       '„Rohdaten löschen“ blendet sie im Tool aus und öffnet den Ordner im Browser zum endgültigen Löschen. Nur eine Person lädt zur Zeit.'),
 ('B', 'Daneben den Unterordner „Anwesenheit“ anlegen. Dort liegt die Anwesenheit (MAK-Liste je KW oder der Telefonie- und Abwesenheitsplan); die neueste Datei im Ordner wird gelesen (Konfiguration!B4).'),
 ('B', 'Beim ersten Öffnen die Makros aktivieren (gelbe Leiste „Inhalt aktivieren“). Ohne Makros funktionieren weder Laden noch Chips; die Filterzellen in „Filter“ und die Formeln bleiben nutzbar.'),
 ('B', 'Die Master-Datei kommt leer: Fakten, Verlauf, Ladeprotokoll und Anwesenheit sind unbefüllt, das Cockpit zeigt nur den Rahmen. Der erste Klick auf „Neue Daten laden“ füllt alles aus dem Ordner Rohdaten und lädt gleich die Anwesenheit mit. Einen Telefonie- und Abwesenheitsplan übernimmt danach jedes „Neue Daten laden“ neu (im Bereich Makler immer); eine MAK-Liste je KW aktualisiert „Anwesenheit laden“ (MAK und Produktivität bleiben ohne Anwesenheit leer). Neue Themenpostkörbe aus den Abzügen erscheinen in Filter!B mit WAHR.'),
 ('H2', '2. Täglicher Ablauf'),
 ('B', 'Abzug OPAG und Abzug Verbund aus MIS-O als Excel-Datei direkt in „Rohdaten“ speichern. Der Dateiname ist egal: Beim Laden benennt das Makro jede erkannte Datei einheitlich und legt sie im Monatsordner ab – Rohdaten\\2026\\09_September\\20260916_BUe_OPAG.xlsx bzw. …_BUe_Verbund.xlsx, Sammeldateien JJJJMMTT-JJJJMMTT_BUe_…; ein doppelter Name bekommt _2. Abgelegte Dateien, deren Stand schon geladen ist, öffnet das Makro nicht erneut – das Laden bleibt auch nach Monaten schnell.'),
 ('B', '„Neue Daten laden“ (Cockpit) führt durch den Tag: Schritt 1 fragt, ob die Abzüge im Ordner Rohdaten liegen, und lädt sie. Schritt 2 fragt, ob heute jemand fehlt; bei Ja öffnet sich der Kalender beim heutigen Tag, die Spalte von heute blinkt kurz auf, und man trägt U, K, A oder einen Anteil ein, „Fertig“ schließt ab. Kommt die Anwesenheit aus dem Telefonie- und Abwesenheitsplan, fragt Schritt 2 nicht, sondern zeigt, wer heute laut Plan fehlt. Schritt 3 bestätigt, dass alles erledigt ist, und bietet die PowerPoint-Folie an.'),
 ('B', 'Blatt „Rohdatenblatt“: Nachbau des Wochenreports mit denselben Zeilen wie das Original (1–157); die Wochenspalten (ab Spalte I je Woche Datum und Δ) beginnen erst mit dem Anwesenheitsplan des Tools, ältere Wochen fehlen. Die BÜ-Zeilen 67–90 (7VA–7OL) füllen sich von selbst: Offene = Rückstand zum letzten Stichtag der Kalenderwoche des Spaltendatums, Zugänge/Abgänge = Summe dieser KW (leer, solange die Quelle in der KW keinen Stand hat), Gesamt einschließlich Sonstige, immer mit der Standard-Auswahl. Das Blatt öffnet bei der aktuellen Woche. Der andere Report holt den Wert über Zeile und Datum: =INDEX([BUE_Reporting_Master.xlsm]Rohdatenblatt!$67:$67;VERGLEICH(Datum;[BUE_Reporting_Master.xlsm]Rohdatenblatt!$1:$1;0)). Unter dem Original stehen in Zeile 160 (7VS, Verbund) und 161 (7OS, OPAG) je Woche der Stand der Werte: der letzte Stichtag der KW mit Stand der Quelle, also genau der Tag, zu dem Zeile 67 bzw. 79 den Rückstand zeigt (leer wie dort, abzurufen ebenso über Zeile und Datum).'),
 ('B', 'Die Abschlussmeldung des Ladens nennt, wie viele Stände neu geladen und wie viele übersprungen wurden.'),
 ('B', 'Das Ladeprotokoll zeigt je Stand Datei, Blatt, Quelle, Stichtag, Zeilen, Rückstand, Eingänge und Abgänge. Hinweis leer, „erster Stand …“ oder die Angabe zum Verkettungskennzeichen: normal geladen. „übersprungen“, „ersetzt“, „neu gerechnet“, „doppelt im Ladeprotokoll“ oder „keine Datensätze“: zählt nicht als geladener Stand.'),
 ('B', 'Alte Dateien dürfen im Ordner bleiben: Ein Stand (Quelle und Stichtag) wird nur einmal geladen. Aufräumen ist nicht nötig, macht das Laden aber schneller.'),
 ('B', 'Rohdaten anderer Bereiche (Themenpostkörbe, die nicht auf 23724 enden, z. B. ODPB): neue Postkörbe zählen erst einmal alle zum Standard. Direkt nach dem Laden fragt eine Karte, welche davon nicht betrachtet werden sollen; „Alle behalten“ lässt sie im Standard. Später änderbar über „Standard festlegen …“.'),
 ('B', 'Celonis (Process Mining): Jede Rohdatei, aus der ein Stand geladen (oder ersetzt) wird, wird automatisch in den Ordner aus Konfiguration B6 kopiert (Standard H:\\Process-Mining-Sync\\Upload), mit dem einheitlichen Namen wie in der Ablage. Ein ersetzter Stand überschreibt die alte Kopie. Doppelt hochgeladen wird nichts: Celonis_Upload_Log.txt neben der Master-Datei merkt sich jede übergebene Datei (der Server leert den Ordner alle zwei Stunden). Ist der Ordner nicht erreichbar, läuft das Laden trotzdem durch und die Abschlussmeldung sagt es. B6 leer = keine Übergabe.'),
 ('B', 'Neuer Abzug für einen Tag, der schon geladen ist (z. B. weil der erste unvollständig war): einfach in den Ordner Rohdaten legen und laden. Eine Karte fragt dann „Neuen Abzug übernehmen“ oder „Alten Stand behalten“. Übernehmen ersetzt den Stand, rechnet Eingänge und Abgänge gegen den Stand davor neu und danach alle späteren Stände dieser Quelle. Die alte Datei heißt danach …_ersetzt, eine nicht übernommene neue …_verworfen; beide werden nicht mehr gelesen.'),
 ('H2', '3. Tagesdateien und Sammeldateien'),
 ('P', 'Beides funktioniert. Die Erkennung arbeitet je Blatt, nicht je Datei:'),
 ('B', 'Tagesdatei: eine Datei mit einem Blatt (ein Stichtag, eine Quelle) – der Normalfall.'),
 ('B', 'Sammeldatei: eine Datei mit mehreren Blättern, zum Beispiel „OPAG 22.09.“, „OPAG 23.09.“, „Verbund 22.09.“, „Verbund 23.09.“ – jedes Blatt wird einzeln erkannt und geladen.'),
 ('B', 'Erkennung des Stichtags: in den ersten 15 Zeilen eine Zelle mit „Rückstandsstichtag = Mittwoch, 23. September 2026“ (Wochentag beliebig, Monat ausgeschrieben).'),
 ('B', 'Erkennung der Quelle: die Kopfzeile enthält „Themenpostkorb“; steht dort auch „OPS_AUFTR_ID“, ist es OPAG, sonst Verbund.'),
 ('B', 'Pflichtspalten: Verwaltungssystemschlüssel, Ordnungsbegriff, VORG_VERBU_LNR, Themenpostkorb, Rückstandsalter_Tage, GEVO_SL; OPAG zusätzlich OPS_AUFTR_ID und OPS_ARBGUT_LNR. Reihenfolge egal, Summenzeile („Anzahl: 13.831“) wird übersprungen.'),
 ('B', 'Reihenfolge: Alle gefundenen Stände werden nach Stichtag sortiert und in dieser Reihenfolge verarbeitet. Ein Stand, der älter ist als der zuletzt geladene Stand seiner Quelle, wird übersprungen und im Protokoll vermerkt, weil Eingänge und Abgänge aus dem Vergleich mit dem jeweils letzten Stand entstehen.'),
 ('B', 'Lücken (Wochenende, fehlender Tag) sind erlaubt: Der Vergleich läuft immer gegen den letzten geladenen Stand, die Bewegungen werden dem neuen Stichtag zugerechnet.'),
 ('H2', '4. Anwesenheit: Arbeitszeitmodell und Kalender'),
 ('B', 'Erster Schritt: Die Anwesenheitsliste in „Anwesenheit“ ablegen und „Anwesenheit laden“ klicken (beim ersten „Neue Daten laden“ passiert das automatisch, einen Telefonie- und Abwesenheitsplan übernimmt danach jedes „Neue Daten laden“ neu – auch ohne neue Abzüge; Schritt 2 des Tagesablaufs zeigt dann, wer heute laut Plan fehlt, statt zu fragen). Zwei Formate: die MAK-Liste je KW (Kopfzeile mit „Mitarbeiter“, Spalten „Makler BÜ Gesundheit“ und „Makler BÜ Komposit“ für die Sparte, Wochenspalten „33 KW“, „34. KW“ …; Jahr in Konfiguration!B5) oder der Telefonie- und Abwesenheitsplan (Blatt „Verwaltung“, eine Zeile je Tag, eine Spalte je Person).'),
 ('B', 'Telefonie- und Abwesenheitsplan: Übernommen werden alle Personen eines Teamblocks („Team Nord“, „Team Mitte“, „Team Süd“ …) mit 1 in der Zeile „Mitarbeiter“; Personen außerhalb der Teams (z. B. Leitung) nicht. Es gibt keine Schätzung des BÜ-Anteils: Neue Personen zählen voll (BÜ-Kapazität 1,0); eine im Blatt „Mitarbeiter“ geänderte Kapazität und die Sparte bleiben beim erneuten Übernehmen. Aktive Personen, die nicht (mehr) im Plan stehen, nennt die Meldung – sie zählen weiter, bis dort ein Austritt steht. Je Arbeitstag heißt „x“ abwesend (Kalender „A“, ein vorhandenes U oder K bleibt), jeder andere Eintrag oder leer heißt anwesend: ein A ohne „x“ im Plan entfernt das Übernehmen, von Hand eingetragene U, K und Anteile bleiben stehen (auch rückwirkend). Feiertage (Spalte „Arbeitsfrei“) und Wochenenden bleiben unberührt. Sparte neuer Personen ist „Komposit“ – im Blatt „Mitarbeiter“ anpassen, ebenso Aktiv = FALSCH für Personen, die nicht zählen sollen.'),
 ('B', 'Der Import füllt das Blatt „Mitarbeiter“ (Name, Einheit, Sparte, BÜ-Kapazität = größter Wochenwert der Liste) und überträgt die Wochenwerte der Liste auf die Tage im Kalender: „Urlaub“ = U, andere Abwesenheit = A, eine abweichende Zahl = anwesender Anteil (Zahl ÷ BÜ-Kapazität); vorhandene Tageseinträge bleiben.'),
 ('B', 'Blatt „Mitarbeiter“: je Person BÜ-Kapazität (MAK je Woche in BÜ), Arbeitszeit (1,0 = Vollzeit, leer = 1,0) und die Arbeitszeit je Wochentag Mo–Fr (leer = gleichmäßig; z. B. 0,8 mit freiem Freitag: Mo–Do 1, Fr 0). Daraus die BÜ-MAK je Wochentag. Blatt „Kalender“ (Knopf „Kalender öffnen“): eine Spalte je Tag Mo–Sa bis Ende 2028; leer = da laut Modell, U Urlaub, K Krankheit, A abwesend, Zahl = anwesender Anteil (0,5 = halber Tag). Samstage zählen nur mit Eintrag (1 = kommt). Feste freie Tage laut Modell (kursives A) und Feiertage (FT, Liste in der Konfiguration) trägt das Tool selbst ein. Vergangene Wochen sind eingeklappt, heute ist rot. Unter dem Kalender die BÜ-MAK je Tag; die MAK je KW sind die Summe der Woche ÷ 5.'),
 ('B', 'Neue Mitarbeitende: im Blatt „Mitarbeiter“ die nächste freie Zeile ausfüllen (Name, Sparte, BÜ-Kapazität, optional Arbeitszeit und Eintritt). Die Person erscheint sofort im Kalender; Mitarbeiter und Kalender werden alphabetisch sortiert.'),
 ('B', 'Gesundheit wird der Sparte KV zugeordnet, Komposit dem Block Komposit/Leben. Eine Trennung Komposit gegen Leben gibt die Planung nicht her; die Produktivität wird deshalb für KV und für Komposit/Leben zusammen ausgewiesen. Alles rechnet über Formeln (Blatt Wirksam, ausgeblendet), Änderungen wirken sofort auf MAK und Produktivität.'),
 ('H2', '5. PowerPoint-Folie'),
 ('B', '„PowerPoint-Folie erzeugen“ (Cockpit) fragt zuerst, welche Kacheln auf die Folie sollen: Die sechs Kacheln stehen als Kästchen in der Anordnung des Blatts „PPT“, ein Klick schaltet eine Kachel an oder ab, die Auswahl wird gemerkt. Auf der Folie werden die gewählten Kacheln neu angeordnet: eine bis drei in einer Reihe, vier als zwei mal zwei, fünf oder sechs in zwei Reihen, jeweils auf die Fläche unter dem Titel skaliert.'),
 ('B', 'Das Makro kopiert die gewählten Kacheln des Blatts „PPT“ als Formen auf eine Folie der ERGO-Vorlage (Vorlage\\ERGO_Vorlage.pptx neben der Master-Datei; fehlt sie, entsteht eine leere Präsentation). Titel „HS | BÜ-Reporting Makler-Bestandsübertragung“, Untertitel mit Stichtag, oben rechts „Vertraulich“. Die Kachelköpfe tragen die Kennzahlen (Rückstand mit Delta, Eingänge/Abgänge, MAK und Produktivität, Anteil über 90 Tage); OPAG rot, Verbund petrol.'),
 ('B', 'Die Formen bleiben in PowerPoint bearbeitbar (Diagramme als Diagramme, Texte in Liberation Sans). Eine Kopie wird im Ordner „Praesentationen“ neben der Master-Datei gesichert, PowerPoint bleibt mit der Folie offen. Die Kacheln zeigen immer den aktuellen Filter und die aktuelle Ansicht (Tagessicht, Aktuelle KW oder Wochensicht); die Fußnote der Kacheln nennt beides.'),
 ('H2', '6. Filter im Cockpit'),
 ('B', 'Themenpostkörbe: Chips per Klick an- oder abwählen (gefüllt = im Filter, weiß = ausgeblendet; beim Überfahren mit der Maus leuchtet der Chip auf – Excel merkt sich dabei eine Änderung, daher die Speichern-Nachfrage beim Schließen). „Alle Postkörbe“ wählt alles, „Standard-Postkörbe“ die Postkörbe der Standard-Auswahl.'),
 ('B', 'Standard: Welche Themenpostkörbe und GeVo-Typen zum Standard gehören, legt „Standard festlegen …“ im Cockpit fest (Chips anklicken, speichern) – oder direkt in der Konfiguration, Spalten H bis L (ja/nein). Voreinstellung: Postkörbe KO, MV (ohne 72-Stunden-BOT, BÜ, GR und AZ; BE, WR, 00 fachlich zu klären), alle GeVo-Typen. „Auf Standard zurücksetzen“ stellt die Chips im Cockpit auf den Standard. Der Wochenreport im Blatt Rohdatenblatt rechnet immer mit dem Standard, unabhängig von den Chips. Neue Themenpostkörbe aus den Abzügen kommen mit „nein“ in die Liste.'),
 ('B', 'GeVo-Typen: Modus „Alle GeVo“ (kein Filter), „Nur BÜ-Schlüssel“ (GeVo-Nummern aus Konfiguration!D11:D20: 108, 469, 2015, 6065) oder „Manuelle Auswahl“ über die Chips der 13 häufigsten GeVo-Typen (aufsteigend nach GeVo-Nummer) plus „Alle übrigen“. Ein Klick auf einen GeVo-Chip wechselt automatisch in die manuelle Auswahl.'),
 ('B', 'Die Filter wirken auf alle Kennzahlen und Diagramme sofort. Neue Postkörbe aus späteren Abzügen erscheinen in Filter!B5:B44 mit WAHR und lassen sich dort umschalten (ohne Chip).'),
 ('B', '„Rückstand je Themenpostkorb“ unten rechts zeigt bewusst ohne Filter, was jedes Kästchen ein- oder ausschließt.'),
 ('B', 'Sparten: Die Chips Komposit, Leben, KV und Sonstige grenzen alle Kennzahlen und Diagramme auf die gewählten Sparten ein – so lässt sich in ein Einzelreporting je Sparte abtauchen. MAK und Produktivität folgen der Auswahl (KV rechnet gegen MAK Gesundheit, Komposit/Leben gegen MAK Komposit). „Alle Sparten“ hebt die Einschränkung auf.'),
 ('B', 'Veränderung zum vorherigen Stand: Die Kacheln Rückstand OPAG und Verbund zeigen das Delta gegenüber dem zuletzt geladenen Stand mit dessen Datum; über den Rückstandssäulen steht dasselbe je Periode als Badge (grün = weniger, gelb = mehr, grau = unverändert). Der Vergleich gilt immer gegenüber dem vorherigen geladenen Stand – ein Montagsstand nach einem Freitagsstand zeigt also die Veränderung über das Wochenende, und Eingänge/Abgänge sind die Bewegungen zwischen genau diesen beiden Ständen.'),
 ('B', 'Beladung läuft: Während jemand „Neue Daten laden“ ausführt, zeigt das Cockpit oben rechts eine orange Box mit Name und Beginn – die Werte sind dann nicht aktuell. Wer zugleich „Neue Daten laden“ klickt, wird gebeten zu warten. Das Tool speichert die Datei dafür beim Start und am Ende der Beladung. Steht die Box länger als 3 Stunden, gilt die Beladung als abgebrochen; dann einfach neu laden.'),
 ('B', 'Ältester Vorgang: Klick auf die Kachel oder auf „Vorgang öffnen ›“ zeigt je Quelle Ordnungsbegriff, GeVo, Themenpostkorb und Rohdatei; „In Rohdatei markieren“ öffnet die Rohdatei und markiert die Zeile gelb.'),
 ('B', 'Ø Alter: Durchschnittsalter des Rückstands am letzten Stichtag (Summe der Rückstandsalter geteilt durch den Rückstand, nach aktivem Filter), groß Verbund, darunter OPAG. Das Diagramm „Ø Alter der Vorgänge“ zeigt den Verlauf über die 7 Perioden der gewählten Ansicht (Wochensicht: Stand Sonntag der KW). Stände, die vor Version 12.84 geladen wurden, haben noch keine Alterssumme – nach „Zurücksetzen“ und neu Laden sind alle Stände gefüllt.'),
 ('B', 'Ansicht (oben in der Bezugstag-Leiste): Beim Öffnen steht sie auf „Wochensicht“. „Tagessicht“ zeigt die letzten 7 Stichtage bis zum Bezugstag. „Aktuelle KW“ (unter der Tagessicht) zeigt die Tage Montag bis Sonntag der Kalenderwoche des Bezugstags – solange der Bezugstag der neueste Stand ist, also die laufende Woche. Tage ohne Stand und Tage nach einem früheren Bezugstag bleiben leer, Datum und Wochentag stehen trotzdem an der Achse; ‹ zurück und vor › blättern tageweise; wer über den Montag hinaus zurückblättert, sieht die Vorwoche. Rechts stehen dann die Summen der KW („Σ KW 41“).'),
 ('B', '„Wochensicht“ zeigt die letzten 7 Kalenderwochen („Rückstand je KW OPAG“ bzw. „… Verbund“, Eingänge/Abgänge/Delta als Wochensumme). Der Rückstand einer KW ist der Stand vom Sonntag dieser KW; der Montag gehört zur neuen KW. Unter jeder KW steht das Datum des verwendeten Stands mit Wochentag, zum Beispiel „KW 41“ und darunter „11.10. (So.)“. Fehlt der Sonntagsstand, zählt der letzte Stand der KW mit seinem Datum; ist die KW abgeschlossen, steht ein Stern daran („09.10. (Fr.)*“) und der Untertitel erklärt ihn. Die laufende KW zeigt den neuesten Stand ohne Stern. OPAG und Verbund können in einer KW verschiedene Stände haben (Verbund kommt oft später); jedes Diagramm nennt deshalb das Datum seiner Quelle, das Verhältnis Verbund zu OPAG den späteren der beiden Tage. Eine KW ohne Stand der Quelle zeigt nur „KW 41“. Die Umschaltung wirkt auf Rückstand, Eingänge/Abgänge, Produktivität und Verhältnis; die MAK stehen immer je Kalenderwoche (Fenster von 7 KW bis zur KW des letzten Stichtags).'),
('B', 'Diagramme haben immer 7 Plätze. In der Tages- und der Wochensicht steht die neueste Periode rechts; solange weniger Stände vorliegen, bleiben die Plätze links frei – so ist die spätere Breite von Anfang an sichtbar. Bei „Aktuelle KW“ steht der Montag links und der Sonntag rechts; Tage nach dem Bezugstag bleiben rechts leer. Werte, die nicht in ihr Segment passen, stehen wie in think-cell mit Führungslinie links oder rechts neben der Säule (in Excel setzt das Makro sie nach jeder Änderung neu).'),
 ('B', 'Eingänge und Abgänge: eine Kachel mit einer Zeile je Sparte und darüber der Gesamtzeile. Eingänge stehen über der Achse (Wert darüber), Abgänge darunter (Wert darunter), das Delta (Eingänge minus Abgänge) steht in der Box auf der Achse – grün = Abbau, gelb = Aufbau. Die Sparten teilen eine Skala und sind damit direkt vergleichbar, die Gesamtzeile hat eine eigene. Rechts stehen die Summen: in der Tagessicht über die letzten 7 Stichtage, bei „Aktuelle KW“ über die Tage dieser KW, in der Wochensicht für die letzte Kalenderwoche. Die Bookmark-Chips „Verbund“ und „OPAG“ oben rechts in der Kachel schalten die Quelle um (Filter!L13); die Kopfleiste wird dabei petrol bzw. rot. Nach dem Laden zeigt die Kachel Verbund – liegt der letzte Verbund-Stand mehr als 2 Tage hinter dem letzten OPAG-Stand, zeigt sie OPAG.'),
 ('H2', '7. Kennzahlen'),
 ('B', 'Rückstand: Zeilen des Abzugs am Stichtag. OPAG zählt Arbeitsgüter (mehrere je Vorgang möglich), Verbund zählt Vorgänge. Sparte aus dem Verwaltungssystemschlüssel (Konfiguration!A11:B40).'),
 ('B', 'Eingänge und Abgänge beziehen sich immer auf die gewählte Auswahl (Chips im Cockpit, im Report die Standard-Auswahl). Schlüssel Verbund = Verwaltungssystemschlüssel + Ordnungsbegriff + VORG_VERBU_LNR; OPAG zusätzlich OPS_AUFTR_ID + OPS_ARBGUT_LNR.'),
 ('B', 'Eingänge: Schlüssel, die heute in der Auswahl sind und es im Vortagsstand nicht waren – neu im Abzug oder aus einem anderen Postkorb oder GeVo hereingewechselt.'),
 ('B', 'Abgänge: Schlüssel, die im Vortagsstand in der Auswahl waren und es heute nicht mehr sind – abgearbeitet, weitergeleitet an die Sparte, an den 72-Stunden-BOT übergeben oder in einen Postkorb oder GeVo außerhalb der Auswahl gewechselt. Verschwundene Schlüssel zählen nach Postkorb, GeVo und Sparte des Vortags; Wechsel stehen im Blatt Umbuchungen.'),
 ('B', 'Ein Wechsel innerhalb der Auswahl (zum Beispiel MV nach KO, beide gewählt) ist weder Eingang noch Abgang. So gilt für jede Auswahl: Rückstand heute = Rückstand Vortag + Eingänge − Abgänge.'),
 ('B', 'Altersstruktur: Rückstandsalter 0–7, 8–30, 31–90 und über 90 Tage am aktuellen Stichtag; über 90 Tage schwarz. Ist das Segment zu schmal für seine Zahl, steht sie rechts neben dem Balken als „> 90 Tage: 3“.'),
 ('B', 'Produktivität: Abgänge je MAK, ausgewiesen je Vorgang (Verbund) und je Arbeitsgut (OPAG), jeweils KV (gegen MAK Gesundheit), Komposit/Leben (gegen MAK Komposit) und Gesamt. Tagessicht: Abgänge des Stichtags ÷ MAK an diesem Tag. Wochensicht: Abgänge der KW ÷ Ø MAK der Arbeitstage in dieser KW – eine angefangene KW zählt also nur die Leute, die an ihren bisherigen Tagen da waren. Als Arbeitstag zählt ein Stichtag Montag bis Freitag, der kein Feiertag ist (Liste in der Konfiguration), mit Abgängen; Wochenenden, Feiertage, Tage ohne Abgänge und der erste Stand bleiben im Tagesdiagramm leer und zählen nicht für den Ø MAK der KW (ihre Abgänge gehören trotzdem zur KW). Die neueste KW wird hochgerechnet, solange ihr Stand vom letzten Werktag (meist Freitag, kommt am Montag) fehlt: Wert bisher × Arbeitstage der KW ÷ Arbeitstage bis zum letzten Stand (nach Montag × 5/1, nach Dienstag × 5/2 …; Feiertage zählen nicht). Kachel und Untertitel sagen dann „hochgerechnet (1 von 5 Tg.)“; die Kachel nennt darüber die Vorwoche als Vergleich (grün hinterlegt, wenn die KW höher liegt, gelb, wenn niedriger).'),
 ('B', 'Kachel „Produktivität Verbund“ folgt der Ansicht und nennt immer die Basis. Wochensicht seit 12.89: Zeile 1 die Vorwoche als Vergleich („Vorwoche KW 41: 228,9“, grün hinterlegt, wenn die KW höher liegt, gelb, wenn niedriger), Zeile 2 die KW und bei Hochrechnung „KW 42 · hochger. 1 von 5 Tg.“. Wochensicht: der Wert der KW des letzten Verbund-Stands – hat diese KW noch keinen Wert (z. B. Montag früh ohne Abgänge), der der letzten KW davor mit Wert; darunter „je MAK in KW 41 · bisher“ und „2 Arbeitstage (Mo–Di)“. „bisher“ steht, solange die KW die aktuelle ist und noch kein Stand von ihrem letzten Werktag (Freitag, ist er Feiertag, der Tag davor) oder später geladen ist – auch ein Stand ohne Abgänge beendet die KW; eine abgeschlossene KW heißt „5 Arbeitstage (Mo–Fr)“, bei Lücken stehen die tatsächlichen Tage da („4 Arbeitstage (Mo, Mi–Fr)“). Die Wochensicht rechnet immer die ganze KW (wie die Wochendiagramme): liegen bei einem früheren Bezugstag Stände dieser KW danach, steht statt der Wochentage „3 Arbeitstage bis 08.10.“. Tagessicht und Aktuelle KW: die durchschnittliche Tagesproduktivität je MAK im gezeigten Zeitraum = Mittel der Tageswerte (Abgänge des Tages ÷ MAK des Tages, die Gesamt-Punkte im Diagramm) über die Tage Montag bis Freitag ohne Feiertage, nur Tage mit Wert (ein Werktag ohne Abgänge zählt nicht mit, wie in der Wochensicht) – „Ø je MAK und Arbeitstag“ und „5 Tage (30.09.–07.10.)“ bzw. bei „Aktuelle KW“ „bisher 3 Tage (Mo–Mi)“. KV und Komp./Leben (in der Kachel „Komp./L.“) rechnen genauso. OPAG steht in der letzten Zeile; weichen seine KW oder Tage von Verbund ab, folgt eine kurze Basis: andere KW „KW 41 läuft“ bzw. „KW 40, 4 Tg.“, gleiche KW die Wochentage „(Mo–Do)“ bzw. „(bisher 4 Tg.)“, Tagessicht die Zahl der Tage „(4 Tage)“ (den Zeitraum nennt der Untertitel des OPAG-Diagramms), Aktuelle KW die Wochentage. In den beiden unteren Zeilen stehen Werte ab 100 ohne Nachkommastelle (Platz). Die Untertitel der Produktivitätsdiagramme nennen dasselbe (Wochensicht: laufende KW „bisher n Arbeitstage“), die Legende die Nenner; ein Feiertag steht in Tagessicht und Aktueller KW an der Achse als „Do · FT“ und hat keinen Punkt.'),
 ('B', 'PPT-Kachel „Kapazität (MAK) und Produktivität je KW“: Der Kopf nennt die Produktivität mit kurzer Basis und davor die MAK, durch die geteilt wird (Ø MAK) – Wochensicht „KW 41: Ø MAK 14,9 · 69,4 Vorg. je MAK, bisher 3 Arbeitstage“ (Ø MAK der gezählten Arbeitstage), Aktuelle KW „Ø MAK 14,9 · Ø 22,7 Vorg. je MAK/Arbeitstag, bisher 3 Tage“, Tagessicht „Ø MAK 14,9 · Ø 28,7 Vorg. je MAK/Arbeitstag (4 Tage bis 08.10.)“ (Ø der Tages-MAK der gezählten Tage). Die Säulen zeigen die MAK laut Kalender (Ø Mo–Fr, Feiertag = 0), die in Feiertags- und laufenden Wochen vom Ø MAK abweichen. Die Boxen unter den MAK-Säulen sind immer Abgänge je MAK und KW; eine laufende KW trägt dort einen Stern („69,4*“), den die Fußnote der Kachel erklärt („* KW 41 läuft: Verbund 3, OPAG 4 Arbeitstage“); bei früherem Bezugstag nennt sie, bis wann die Box rechnet („* KW 41: Verbund 3, OPAG 4 Arbeitstage bis 08.10.“). In Tagessicht und Aktueller KW sagt die Fußnote zusätzlich „Boxen: je MAK und KW“ (Aktuelle KW ohne laufende KW: „Tagessicht KW 41 · Boxen: …“), sonst die Filterzeile.'),
 ('B', 'MAK am Tag: Summe der BÜ-MAK aller Mitarbeitenden an diesem Tag laut Kalender – BÜ-MAK des Wochentags aus dem Arbeitszeitmodell mal anwesender Anteil (leer = 1, H = 0,5, U/K/F = 0), vor dem Eintritt und nach dem Austritt 0. Die Tagessicht der Produktivität rechnet damit, die Wochensicht mit dem Durchschnitt ihrer Arbeitstage (Mo–Fr ohne Feiertage, mit Abgängen).'),
 ('B', 'SLA: Im Rückstand Verbund steht die SLA als gestrichelte Linie (Konfiguration!F3, 5.500 Vorgänge). Für OPAG gibt es noch keinen Wert; solange Konfiguration!F4 leer ist, zeigt das Diagramm einen Vorschlag = SLA Verbund × Ø-Verhältnis OPAG/Verbund der letzten 14 Tage.'),
 ('B', 'Verhältnis Verbund zu OPAG: OPAG-Arbeitsgüter je Verbund-Vorgang im Rückstand, je Sparte und gesamt, nach Tages- oder Wochensicht; gestrichelt der Durchschnitt der letzten 14 Tage (nur Tage mit Stand beider Quellen).'),
 ('B', 'Wochenwerte: Nachschlagetabelle für andere Berichte – Kalenderwochen in Spalten (Schlüssel Jahr*100+KW in Zeile 4, Montag der KW in Zeile 6), Kennzahlen in Zeilen (Schlüssel in Spalte B): Rückstand OPAG und Verbund je Sparte zum letzten Stichtag der KW, Eingänge und Abgänge der KW. Gezählt werden die im Cockpit gewählten Themenpostkörbe; GeVo- und Sparten-Chips wirken hier nicht. Beispielformeln stehen oben im Blatt.'),
 ('B', 'Der erste Stand je Quelle liefert nur den Rückstand; Eingänge und Abgänge gibt es ab dem zweiten Stand.'),
 ('H2', '8. Blätter'),
 ('B', 'Cockpit: Kennzahlen, Filter, Diagramme. Verlauf: eine Zeile je Stichtag (gefiltert). KW: Abgänge, MAK und Produktivität je Kalenderwoche. Fakten: verdichtete Sätze je Stichtag, Quelle, Sparte, VSS, Postkorb und GeVo mit Filterkennzeichen. Diagrammdaten: Hilfstabelle mit immer 7 Perioden für Rückstand und für die Säulen Eingänge (über der Achse), Abgänge (unter der Achse) und Delta.'),
 ('B', 'PPT: die Kacheln für die PowerPoint-Folie. Kalender: Anwesenheit je Mitarbeiter und Tag. Mitarbeiter: Stammdaten. Filter: Zellen der Chips und Hilfsgrößen. Konfiguration: Pfade, Sparten, BÜ-Schlüssel, Vorauswahl. Ladeprotokoll: jeder geladene Stand. Wirksam (ausgeblendet): berechnete MAK je Mitarbeiter und KW.'),
 ('B', 'Snapshot_OPAG und Snapshot_Verbund (ausgeblendet): die Schlüssel des jeweils letzten Stands für den Vergleich am nächsten Tag. Nicht bearbeiten.'),
 ('H2', '9. Wenn etwas nicht klappt'),
 ('B', '„Rohdaten-Ordner nicht gefunden“: Ordner neben der Master-Datei anlegen oder Pfad in Konfiguration!B3 setzen.'),
 ('B', '„kein Rückstandsabzug erkannt“: Stichtag-Zeile oder Kopfzeile fehlt, oder das Blatt ist als Werte ohne die ersten Kopfzeilen gespeichert. Die Kopfzeilen des MIS-O-Abzugs müssen erhalten bleiben.'),
 ('B', '„übersprungen: Stichtag liegt vor dem zuletzt geladenen Stand“: ein älterer Abzug kam nach einem neueren. Ältere Stände können nachträglich nicht eingeordnet werden; wenn nötig „Zurücksetzen …“ im Cockpit klicken und neu laden – das Tool liest dann alle Rohdateien in der Reihenfolge der Stichtage.'),
 ('B', 'Eine Rohdatei ist noch in Excel geöffnet: schließen, dann erneut laden. Dateien, die mit „~$“ beginnen, werden ignoriert.'),
 ('B', 'Kennzahlen zeigen leer: Es ist noch kein Stand geladen, oder alle Kästchen sind abgewählt. „Zurücksetzen“ nimmt alle Filter zurück.'),
 ('B', 'Diagramme ohne Werte oder mit altem Bereich: „Aktualisieren“ klicken; die Makros setzen die Datenbereiche der Diagramme nach jedem Laden neu (immer 7 Perioden; leere Plätze bleiben frei) und legen Werte, die nicht in ihr Segment passen, mit Führungslinie neben die Säule.'),
 ('B', 'Während „Neue Daten laden“ und „Anwesenheit laden“ zeigt ein Overlay auf dem Blatt den Fortschritt (Datei, Stand, Prozent). Excel ist in der Zeit gesperrt; das Overlay verschwindet von selbst, auch bei einem Fehler.'),
 ('B', 'Excel stürzt beim Laden oder beim Überfahren der Chips ab: Die Datei Ladelog.txt neben der Master-Datei zeigt den letzten Schritt vor dem Absturz. Den Hover-Effekt der Chips in Konfiguration!B8 auf NEIN stellen (die Chips bleiben klickbar), dann erneut versuchen. Stürzt Excel erst bei der Abschlussmeldung ab, Konfiguration!B9 auf NEIN stellen: Meldungen kommen dann als klassisches Fenster.'),
 ('B', '„SharePoint-Ordner konnte nicht aufgelistet werden“: Die Anmeldung von Power Query fehlt oder wurde abgebrochen. Daten > Daten abrufen > Datenquelleneinstellungen, die SharePoint-Adresse wählen, „Berechtigungen löschen“ und erneut laden; im Anmeldefenster „Organisationskonto“ und „Anmelden“. Liegt der Rohdaten-Ordner nicht neben der Master-Datei, die Browser-Adresse des Ordners in Konfiguration!B3 eintragen.'),
 ('H2', '10. Grenzen'),
 ('B', 'Die Fakten-Tabelle fasst je Stichtag rund 500 bis 600 Zeilen je Quelle; Platz ist für etwa 300 Stichtage je Quelle (300.000 Zeilen). Danach die Datei kopieren und neu beginnen oder alte Stichtage aus Fakten und Verlauf löschen.'),
 ('B', 'Die Schlüssel des letzten Stands (rund 30.000 OPAG, 14.000 Verbund) bleiben in der Datei; sie ist deshalb einige Megabyte groß.'),
]


WERKZEUGE_ANLEITUNG = [
 ('H2', '10. Werkzeuge im Cockpit'),
 ('B', '„SLA anpassen …“: Karte mit zwei Feldern – SLA Verbund (Vorgänge, Konfiguration!F3) und SLA OPAG (Arbeitsgüter, Konfiguration!F4). In ein Feld klicken, '
       'Zahl eingeben, „Speichern“. 0 oder leer bei Verbund = keine Linie; OPAG leer = Vorschlag aus Verbund. Die Diagramme ziehen die Linie sofort nach.'),
 ('B', '„Rohdaten löschen …“: listet alle Excel-Dateien im Ordner Rohdaten und in der Monatsablage (neueste oben, zehn je Seite). Ein Klick wählt eine Datei aus, '
       '„geladen“ markiert Dateien, aus denen ein Stand im Tool ist. „Ausgewählte löschen …“ fragt nach: „Nur löschen“ entfernt die Dateien endgültig, die Stände '
       'bleiben im Tool; „Löschen und neu aufbauen“ leert das Tool danach und lädt es aus den übrigen Dateien neu (Anwesenheit bleibt).'),
 ('B', '„Zurücksetzen …“: leert das Tool – Fakten, Verlauf, Ladeprotokoll, Umbuchungen, Snapshots und die Liste der Themenpostkörbe; auf Wunsch auch Mitarbeiter und '
       'Kalender. Konfiguration, SLA und GeVo-Auswahl bleiben. Die Rohdateien bleiben im Ordner und werden beim nächsten „Neue Daten laden“ wieder gelesen – '
       'so lässt sich das Tool jederzeit aus den Rohdateien neu aufbauen.'),
]

MAKLER_ANLEITUNG = [
 ('B', '„Ältere Datei aktualisieren …“ (seit 12.93): Eine neue Version muss nicht neu geladen werden. Die bisherige Datei am gewohnten Ort öffnen („Bearbeitung aktivieren“), zusätzlich die neue Datei öffnen und dort unter WERKZEUGE „Ältere Datei aktualisieren …“ klicken. Die neue Version übernimmt alle Stände, Ladeprotokoll, Anwesenheit, Standard, SLA und Einstellungen und speichert sich unter dem Namen und am Ort der alten Datei; Verknüpfungen anderer Dateien bleiben gültig. Vorher wird die alte Datei gesichert (Protokolle\\Sicherung, auf SharePoint der Versionsverlauf). Niemand sonst darf die alte Datei geöffnet haben.'),
 ('H2', '11. Bereich Makler: Einheiten'),
 ('B', 'Konfiguration!F7 steht auf MAKLER. Die Abzüge enthalten die Einheiten der OE-Ebene 4 (z. B. ODPB D, ODPP D, MSUE D) – in einer Datei '
       'oder verteilt auf mehrere Dateien am selben Tag. Die Einheit jeder Zeile ergibt sich aus der Spalte OE_NR: ODPB1 D, ODPB2HH und ODPBHH '
       'gehören zu ODPB, MSUE2 M und MSUE2HH zu MSUE. Die Zuordnung steht in Konfiguration Q11:R40 (längster passender Anfang von OE_NR); '
       'ohne passenden Eintrag gelten die Buchstaben am Anfang ohne „HH“.'),
 ('B', 'Jede Einheit ist ein eigener Stand je Quelle und Tag – egal, wie MIS-O die Einheiten auf die Dateien verteilt und ob sich das von Tag zu '
       'Tag ändert (seit 12.88). Eingänge und Abgänge vergleicht das Tool je Einheit mit deren letztem Stand; wechselt ein Vorgang am selben '
       'Tag von einer Einheit in eine andere, ist das eine Umbuchung. Eine weitere Datei mit anderen Einheiten am selben Tag wird dazugeladen. '
       'Kommt der Bericht einer Einheit erst, nachdem schon spätere Tage dieser Einheit geladen sind, fügt das Tool ihn ein und rechnet die '
       'späteren Tage der Einheit aus ihren Dateien neu. Nur eine zweite Datei mit derselben Einheit für denselben Tag löst die Frage '
       '„Neuen Abzug übernehmen?“ aus. Zeilen von OEs, die nicht in Konfiguration!R11:R40 stehen, zählen zur größten Einheit des Blatts.'),
 ('B', 'HS-Abzüge gehören nicht ins Makler-Reporting (seit 12.91): Zeilen der HS-Einheit (OE HSB4 K → Einheit HSB) zählen nirgends mit – '
       'weder im Rückstand noch als Eingang. Liegt ein reiner HS-Abzug im Ordner Rohdaten, lädt das Tool ihn nicht, übergibt ihn nicht an '
       'Celonis und benennt ihn in „…_HS-ignoriert“ um (auf SharePoint ohne OneDrive: im Tool ausgeblendet); die Abschlussmeldung nennt ihn. '
       'Stehen aus der Zeit davor schon HS-Zeilen in den Daten, baut „Neue Daten laden“ das Tool einmal ohne sie neu auf (danach die '
       'Standard-Postkörbe prüfen).'),
 ('B', 'Blatt „Dateiinhalt“: je geprüfter Rohdatei und Blatt Quelle, Stichtag und Einheiten mit Zeilenzahl. Eine schon geprüfte Datei öffnet das '
       'Tool beim Laden nicht erneut, um ihren Inhalt zu erkennen.'),
 ('B', 'Mitarbeitende: Zusätzlich zum Anwesenheitsplan legt das Tool die BÜ-Bearbeiter der Vertriebsunterstützung MSUED an (Einheit MSUE, '
       'Komposit, Kapazität 1; ohne Kalendereintrag anwesend). Abwesenheit, Kapazität oder Austritt pflegt man im Blatt „Mitarbeiter“ bzw. „Kalender“.'),
 ('B', 'Angezeigt wird alles zusammen (Filter!L16 = „Gesamt“). Nebeneinander zeigen die Einheiten die Chips „Sparte | Einheit“ (nächster Absatz).'),
 ('B', 'Sicht der Rückstandsdiagramme: Die Chips „Sparte | Einheit“ in der Kopfleiste „Rückstand OPAG“ schalten beide Rückstandsdiagramme '
       '(Cockpit und Folie) zwischen dem Stapel nach Sparte (Komposit, Leben, KV, Sonstige) und nach Einheit (z. B. MSUE, ODPB, ODPP) um. '
       'Bis zu vier Einheiten stehen einzeln, ab der fünften als „Übrige“.'),
 ('B', 'Einheiten-Chips (links zwischen Sparten und Themenpostkörben): Wie die Sparten-Chips grenzen sie alle Kennzahlen, Kacheln und Diagramme auf die gewählten Einheiten ein (Rückstand, Eingänge, Abgänge, Ältester Vorgang, Ø Alter). MAK und Produktivität folgen ebenfalls, sofern die Einheit im Blatt Mitarbeiter genauso heißt wie in den Abzügen; Mitarbeitende mit anderem Einheitsnamen zählen immer. Die Chips zeigen die ersten sechs Einheiten der geladenen Daten; „Alle Einheiten“ und „Auf Standard zurücksetzen“ schalten alle wieder ein. Der Wochenreport (Rohdatenblatt) bleibt unabhängig von den Chips.'),
 ('B', 'Ladeprotokoll (eine Zeile je Einheit, Spalte K), Fakten (R Einheit, S Strang) und Umbuchungen (Q/S Einheit heute/vorher, R Strang) führen '
       'die Einheit mit. Abgelegte Dateien tragen die Einheiten der Datei im Namen, z. B. 20261007_BUe_Verbund_MSUE+ODPB+ODPP.xlsx.'),
 ('B', 'Themenpostkörbe der Abzüge zählen ohne Rückfrage zum Standard. Es gibt keine SLA-Vorgabe; „SLA anpassen …“ setzt bei Bedarf eine.'),
]


def anleitung_texte():
    """Anleitung je Bereich: HS wie bisher; MAKLER ohne Wochenreport (Rohdatenblatt) und ohne die HS-Postkoerbe, dafuer Abschnitt 11."""
    if BEREICH != 'MAKLER':
        return ANLEITUNG + WERKZEUGE_ANLEITUNG
    aus = []
    for art, text in ANLEITUNG:
        if text.startswith('Blatt „Rohdatenblatt“') or text.startswith('Rohdaten anderer Bereiche'):
            continue
        if art == 'H1':
            text = 'Anleitung: BÜ-Reporting Makler'
        text = text.replace('Titel „HS |', 'Titel „Makler |')
        text = text.replace('Voreinstellung: Postkörbe KO, MV (ohne 72-Stunden-BOT, BÜ, GR und AZ; BE, WR, 00 fachlich zu klären), alle GeVo-Typen.',
                            'Voreinstellung: alle Postkörbe aus den Abzügen, alle GeVo-Typen.')
        text = text.replace(' Der Wochenreport im Blatt Rohdatenblatt rechnet immer mit dem Standard, unabhängig von den Chips. Neue Themenpostkörbe aus den Abzügen kommen mit „nein“ in die Liste.',
                            ' Neue Themenpostkörbe aus den Abzügen kommen mit „ja“ in die Liste.')
        aus.append((art, text))
    return aus + WERKZEUGE_ANLEITUNG + MAKLER_ANLEITUNG


def anleitung(wb, ws, st):
    ws.set_column('A:A', 2)
    ws.set_column('B:B', 3)
    ws.set_column('C:C', 120)
    ws.set_tab_color(GRAUD)
    h1 = st.titel
    h2 = wb.add_format({'font_name': FONT, 'font_size': 12, 'bold': True, 'font_color': ROT, 'valign': 'bottom'})
    p = wb.add_format({'font_name': FONT, 'font_size': 10, 'font_color': SW, 'text_wrap': True, 'valign': 'top'})
    b = wb.add_format({'font_name': FONT, 'font_size': 10, 'font_color': SW, 'text_wrap': True, 'valign': 'top'})
    punkt = wb.add_format({'font_name': FONT, 'font_size': 10, 'font_color': ROT, 'bold': True, 'valign': 'top', 'align': 'center'})
    r = 1
    for art, text in anleitung_texte():
        if art == 'H1':
            ws.set_row(r, 32)
            ws.write(r, 1, text, h1)
            r += 1
            ws.write(r, 1, 'Ordnerstruktur: Master-Datei · Rohdaten\\ · Anwesenheit\\ · Vorlage\\ · Praesentationen\\ – Stand der Anleitung: ' + dt.date.today().strftime('%d.%m.%Y'), st.untertitel)
            r += 2
        elif art == 'H2':
            r += 1
            ws.set_row(r, 22)
            ws.write(r, 1, text, h2)
            r += 1
        elif art == 'P':
            zeilen = max(1, math.ceil(len(text) / 128))
            ws.set_row(r, 13.5 * zeilen + 3)
            ws.merge_range(r, 1, r, 2, text, p)
            r += 1
        else:
            zeilen = max(1, math.ceil(len(text) / 125))
            ws.set_row(r, 13.5 * zeilen + 3)
            ws.write(r, 1, '•', punkt)
            ws.write(r, 2, text, b)
            r += 1


# ------------------------------------------------------------------ Cockpit
CHART_B, CHART_B_VOLL, CHART_H = 630, 1290, 285      # Pixel: halbe Breite, volle Breite, Hoehe
SPALTE_PX = 26                                        # Breite der Rasterspalten im Diagrammbereich (3,0 Zeichen)
LABEL_FONT = {'name': FONT, 'size': 8, 'bold': True}
# Innere Zeichenflaeche der gestapelten Diagramme als Anteil der Diagrammflaeche – fest gesetzt, damit die
# Etikettengeometrie (schmale Segmente -> Wert neben der Saeule mit Fuehrungslinie) beim Bau berechenbar ist.
PLOT_STAPEL = {'x': 0.015, 'y': 0.10, 'width': 0.97, 'height': 0.76}
PLOT_ALTER = {'x': 0.13, 'y': 0.12, 'width': 0.74, 'height': 0.76}      # links Platz fuer „Verbund“, rechts fuer den Wert über 90 Tage
BW_DATEIEN = set()                                    # Diagrammdateien der Kachel Eingänge/Abgänge (Delta-Boxen werden abgerundet)
BW_B, BW_H = 1290, 120                                # Pixel je Diagrammzeile der Kachel (volle Breite; Zeichenflaeche 12–83 %, links Namen, rechts Summen)
BW_TEXTE = {}                                         # Diagrammdatei -> {Zellbezug: Text} fuer den Zwischenspeicher der Delta-Boxen (Vorschau ohne Neuberechnung)
GRAU_ABG = '#B9BFC6'                                  # Abgänge der Gesamtzeile
GEOMETRIE = []                                        # je Diagramm: Angaben fuer die Nachbearbeitung der Etiketten
PROD_ZEILEN = {}                                      # Filter-Zeilen der Produktivitaet je Ansicht (Kachel, Untertitel, PPT), gesetzt in bauen()


def achsen_ende(m, luft=1.10):
    """Obere Achsengrenze: Luft fuer die Summenzahl (und Badges) ueber dem Stapel, auf zwei geltende Stellen aufgerundet."""
    if m <= 0:
        return 0
    u = 10 ** (math.floor(math.log10(m)) - 1)
    return math.ceil(m * luft / u) * u


def DATUM_TEXT(d):
    # Datum als Text TT.MM.JJJJ (unabhaengig von der Sprache von Excel)
    return 'RIGHT("0"&DAY(%s),2)&"."&RIGHT("0"&MONTH(%s),2)&"."&YEAR(%s)' % (d, d, d)


def DAT(zeile):
    """Formelteil: Datum der Verlauf-Zeile (Position in Verlauf!A6:A…) als TT.MM. – ohne TEXT(), dessen Formatcode sprachabhaengig ist."""
    return 'RIGHT("0"&DAY(INDEX(Verlauf!$A$6:$A$%d,%s)),2)&"."&RIGHT("0"&MONTH(INDEX(Verlauf!$A$6:$A$%d,%s)),2)&"."' % (MAX_VERLAUF, zeile, MAX_VERLAUF, zeile)


def TT(d):
    """Formelteil: Datum d als „TT.MM.“ (ohne TEXT())."""
    return 'RIGHT("0"&DAY(%s),2)&"."&RIGHT("0"&MONTH(%s),2)&"."' % (d, d)


WT_NAMEN = ['Mo', 'Di', 'Mi', 'Do', 'Fr']


def wt_text(maske):
    """Wochentage Mo–Fr aus einer Bitmaske (Mo = 1, Di = 2, Mi = 4, Do = 8, Fr = 16) als Text: zusammenhaengende Tage als
    Spanne, Luecken mit Komma – 3 -> „Mo–Di“, 5 -> „Mo, Mi“, 29 -> „Mo, Mi–Fr“, 31 -> „Mo–Fr“."""
    tage = [i for i in range(5) if maske & (1 << i)]
    teile, i = [], 0
    while i < len(tage):
        j = i
        while j + 1 < len(tage) and tage[j + 1] == tage[j] + 1:
            j += 1
        teile.append(WT_NAMEN[tage[i]] if j == i else WT_NAMEN[tage[i]] + '–' + WT_NAMEN[tage[j]])
        i = j + 1
    return ', '.join(teile)


def WT_TEXT(ref):
    """Formelteil: Text der Wochentage zur Bitmaske in ref – alle 32 Muster als Text (kein TEXTJOIN noetig). Zwei Stufen CHOOSE mit je
    16 Werten: ein einzelnes CHOOSE mit 32 Werten nimmt LibreOffice nicht an (Err:508), Excel schon."""
    m = 'MIN(31,MAX(0,N(%s)))' % ref
    halb = lambda von: 'CHOOSE(MOD(%s,16)+1,%s)' % (m, ','.join('"%s"' % wt_text(k) for k in range(von, von + 16)))  # noqa: E731
    return 'CHOOSE(INT(%s/16)+1,%s,%s)' % (m, halb(0), halb(16))


def ZAHL_KURZ(ref):
    """Formelteil: Produktivitaet als kurzer Text fuer die Kachel – eine Nachkommastelle, ab 100 ohne (passt in 156 px), sonst „–“."""
    return 'IF(ISNUMBER(%s),FIXED(%s,IF(ABS(%s)>=100,0,1)),"–")' % (ref, ref, ref)


def OPAG_WT(ref):
    """Formelteil: Wochentage fuer die OPAG-Zeile der Kachel – das einzige Muster mit mehr als 10 Zeichen („Mo–Di, Do–Fr“) ohne
    Leerzeichen nach dem Komma, damit die Zeile mit 12 % Reserve in die Kachel passt."""
    return 'IF(LEN(%s)>10,SUBSTITUTE(%s,", ",","),%s)' % (ref, ref, ref)


def cockpit(wb, ws, st, postkoerbe, gevo_typen, ber, werte):
    ws.set_zoom(90)
    ws.set_vba_name('Cockpit')         # Codename fuer das Blattmodul (Worksheet_SelectionChange der Chips)
    ws.set_column('A:A', 1.5)
    ws.set_column('B:G', 5.4)          # Filterpanel (6 x 43 px)
    ws.set_column('H:H', 1.5)
    ws.set_column('I:BF', 3.0)         # Diagrammraster, 50 Spalten x 26 px
    ws.set_row(0, 8)
    ws.set_row(1, 30)
    ws.set_row(2, 16)
    ws.set_row(3, 12)
    ws.set_tab_color(ROT)
    # Kopf
    ws.write_rich_string('B2', st.titel_rot, 'BÜ', st.titel, '-Reporting Makler' if BEREICH == 'MAKLER' else '-Reporting HSB4 K', st.titel)
    # Beschreibung in Zeile 3, Quellen in Zeile 4 – beide enden vor dem Stand-Feld (W), sonst schneidet es sie ab
    ws.write('B3', 'Makler-Bestandsübertragung · Rückstand, Bewegungen und Produktivität', st.untertitel)
    ws.write('B4', 'Quellen: MIS-O EINZEL Rohdatenabzüge',
             wb.add_format({'font_name': FONT, 'font_size': 8, 'font_color': GRAUM, 'valign': 'top'}))
    f_version = wb.add_format({'font_name': FONT, 'font_size': 8.5, 'font_color': GRAUM, 'valign': 'bottom'})
    ws.merge_range('O2:U2', 'Version %s vom %s' % (VERSION, VERSION_DATUM), f_version)
    # Stand gross und farbig direkt neben der Version (petrol; gelb, wenn ein frueherer Bezugstag gewaehlt ist). TEXT() mit Datumsformat vermeiden (Formatcodes haengen an der Sprache von Excel).
    dat_o5 = 'RIGHT("0"&DAY(Filter!$O$5),2)&"."&RIGHT("0"&MONTH(Filter!$O$5),2)&"."&YEAR(Filter!$O$5)'
    f_stand = wb.add_format({'font_name': FONT, 'font_size': 16, 'bold': True, 'font_color': WEISS, 'bg_color': TEAL,
                             'align': 'center', 'valign': 'vcenter'})
    ws.merge_range('W2:AJ2', '', f_stand)
    ws.write_formula('W2', '=IF(N(Filter!$O$5)=0,"NOCH KEIN STAND",IF(Filter!$O$45=1,"BEZUGSTAG ","STAND ")&%s&" (KW "&ISOWEEKNUM(Filter!$O$5)&")")' % dat_o5, f_stand)
    ws.conditional_format('W2:AJ2', {'type': 'formula', 'criteria': '=Filter!$O$45=1',
                                     'format': wb.add_format({'bg_color': GELBH, 'font_color': GELBD, 'bold': True})})
    # (vorheriger Stichtag unter dem Stand entfaellt ab 12.84)
    # Orange Box „Beladung läuft“ (Filter!L28 Name, L29 Beginn; setzt modLaden.BeladungMarkieren und speichert die Datei, damit
    # Kollegen es sehen). Nach 3 Stunden ohne Ende: Hinweis auf einen Abbruch. Leer = unsichtbar (weiße Schrift, keine Füllung).
    f_bel = wb.add_format({'font_name': FONT, 'font_size': 8, 'bold': True, 'font_color': WEISS, 'text_wrap': True, 'align': 'center', 'valign': 'vcenter'})
    zeit = 'RIGHT("0"&HOUR(Filter!$L$29),2)&":"&RIGHT("0"&MINUTE(Filter!$L$29),2)'
    tag = 'RIGHT("0"&DAY(Filter!$L$29),2)&"."&RIGHT("0"&MONTH(Filter!$L$29),2)&"."'
    ws.merge_range('AM2:AV2', '', f_bel)
    ws.write_formula('AM2', '=IF(Filter!$L$28="","",IF(NOW()-Filter!$L$29>0.125,"BELADUNG NICHT BEENDET"&CHAR(10)&Filter!$L$28&" · seit "&%s&" "&%s&" · bitte neu laden",'
                            '"BELADUNG LÄUFT – Werte nicht aktuell"&CHAR(10)&Filter!$L$28&" · seit "&%s&" Uhr · bitte kurz warten"))' % (tag, zeit, zeit), f_bel)
    ws.conditional_format('AM2:AV2', {'type': 'formula', 'criteria': '=LEN($AM$2)>0', 'format': wb.add_format({'bg_color': ORANGE, 'font_color': WEISS, 'bold': True})})
    # Stand steht seit 12.83 gross neben der Version (W2:AJ3)

    # KPI-Kacheln (Zeilen 5–9): Label, Wert, zwei Unterzeilen, Polster; je Kachel 7 Rasterspalten (182 px), Abstand 1 Spalte
    # Ansicht der Kacheln (Diagrammdaten!BY:BZ): W = Wochensicht, K = Aktuelle KW, T = Tagessicht; KWN = KW der Kacheln
    W, K, KWN = 'Diagrammdaten!$BZ$4="W"', 'Diagrammdaten!$BZ$4="K"', 'Diagrammdaten!$BZ$5'

    def TTd(c):
        return 'RIGHT("0"&DAY(%s),2)&"."&RIGHT("0"&MONTH(%s),2)&"."' % (c, c)

    kacheln = [
        # je Quelle der letzte Stichtag MIT Stand (Filter!O27 OPAG, O29 Verbund; vorherige O28/O30) – die Quellen koennen
        # verschiedene letzte Tage haben, dann steht das Datum in der Unterzeile
        # Wochensicht (Diagrammdaten!BZ4 = "W"): Rueckstand der letzten KW wie die Saeule rechts, Veraenderung zur Vorwoche wie das
        # Badge darueber (Diagrammdaten!BY:BZ); sonst wie bisher Stichtag gegen vorherigen Stand
        ('RÜCKSTAND OPAG', '=IF(%s,IFERROR(1*Diagrammdaten!$F$10,""),IF(Filter!$O$27=0,"",INDEX(Verlauf!$H$6:$H$%d,Filter!$O$27)))' % (W, MAX_VERLAUF),
         '=IF(%s,IF(Diagrammdaten!$BZ$6="","–",IF(Diagrammdaten!$BZ$6>0,"+","")&FIXED(Diagrammdaten!$BZ$6,0)&" ggü. KW "&Diagrammdaten!$BZ$10),'
         'IF(Filter!$O$19="","–",IF(Filter!$O$19>0,"+","")&FIXED(Filter!$O$19,0)&" ggü. "&%s))' % (W, DAT('Filter!$O$28')),
         '=IF(%s,"Arbeitsgüter KW "&%s&IF(N(Diagrammdaten!$BP$10)=0,""," (Stand "&%s&")"),'
         'IF(Filter!$O$27=0,"Arbeitsgüter am Stichtag","Arbeitsgüter am "&%s))' % (W, KWN, TTd('Diagrammdaten!$BP$10'), DAT('Filter!$O$27')),
         'Diagrammdaten!$BZ$8'),
        ('RÜCKSTAND VERBUND', '=IF(%s,IFERROR(1*Diagrammdaten!$J$10,""),IF(Filter!$O$29=0,"",INDEX(Verlauf!$R$6:$R$%d,Filter!$O$29)))' % (W, MAX_VERLAUF),
         '=IF(%s,IF(Diagrammdaten!$BZ$7="","–",IF(Diagrammdaten!$BZ$7>0,"+","")&FIXED(Diagrammdaten!$BZ$7,0)&" ggü. KW "&Diagrammdaten!$BZ$10),'
         'IF(Filter!$O$20="","–",IF(Filter!$O$20>0,"+","")&FIXED(Filter!$O$20,0)&" ggü. "&%s))' % (W, DAT('Filter!$O$30')),
         '=IF(%s,"Vorgänge KW "&%s&IF(N(Diagrammdaten!$BQ$10)=0,""," (Stand "&%s&")"),'
         'IF(Filter!$O$29=0,"Vorgänge am Stichtag","Vorgänge am "&%s))' % (W, KWN, TTd('Diagrammdaten!$BQ$10'), DAT('Filter!$O$29')),
         'Diagrammdaten!$BZ$9'),
        # Ältester Vorgang: Stichtag minus hoechstes Rueckstandsalter (Filter!O47 Verbund, O48 OPAG), als Text TT.MM.JJJJ
        ('ÄLTESTER VORGANG', '=IF(N(Filter!$O$47)=0,"–",%s)' % DATUM_TEXT('(Filter!$O$32-Filter!$O$47)'),
         '=IF(N(Filter!$O$47)=0,"Verbund: kein Rückstand","Verbund: "&FIXED(Filter!$O$47,0)&" Tage alt")',
         '=IF(N(Filter!$O$48)=0,"OPAG: –","OPAG: "&%s&" ("&FIXED(Filter!$O$48,0)&" Tage)")' % DATUM_TEXT('(Filter!$O$31-Filter!$O$48)'), None),
        # Ø Alter (12.84): Summe der Rueckstandsalter / Rueckstand am letzten Stichtag je Quelle (Filter!Q47 Verbund, Q48 OPAG)
        ('Ø ALTER', '=IF(Filter!$Q$47="","–",Filter!$Q$47)',
         '=IF(Filter!$Q$47="","Verbund: –","Tage · Verbund")',
         '=IF(Filter!$Q$48="","OPAG: –","OPAG: "&FIXED(Filter!$Q$48,1)&" Tage")', None),
        # Eingaenge/Abgaenge: Wochensicht = Summe der letzten KW, Aktuelle KW = Summe der Tage der KW bis zum Bezugstag
        ('EINGÄNGE VERBUND', '=IF(Diagrammdaten!$BZ$4<>"T",Diagrammdaten!$BZ$11,IF(Filter!$O$29=0,"",INDEX(Verlauf!$S$6:$S$%d,Filter!$O$29)))' % MAX_VERLAUF,
         '=IF(Diagrammdaten!$BZ$4<>"T","OPAG: "&FIXED(Diagrammdaten!$BZ$13,0)&" Arbeitsgüter",'
         'IF(Filter!$O$27=0,"","OPAG: "&FIXED(INDEX(Verlauf!$I$6:$I$%d,Filter!$O$27),0)&" Arbeitsgüter"))' % MAX_VERLAUF,
         '=IF(%s,"neue Vorgänge in KW "&%s,IF(%s,"neue Vorgänge KW "&%s&" bisher",'
         'IF(Filter!$O$29=0,"neue Vorgänge am Stichtag","neue Vorgänge am "&%s)))' % (W, KWN, K, KWN, DAT('Filter!$O$29')), None),
        ('ABGÄNGE VERBUND', '=IF(Diagrammdaten!$BZ$4<>"T",Diagrammdaten!$BZ$12,IF(Filter!$O$29=0,"",INDEX(Verlauf!$T$6:$T$%d,Filter!$O$29)))' % MAX_VERLAUF,
         '=IF(Diagrammdaten!$BZ$4<>"T","OPAG: "&FIXED(Diagrammdaten!$BZ$14,0)&" Arbeitsgüter",'
         'IF(Filter!$O$27=0,"","OPAG: "&FIXED(INDEX(Verlauf!$J$6:$J$%d,Filter!$O$27),0)&" Arbeitsgüter"))' % MAX_VERLAUF,
         '=IF(%s,"erledigt/weitergel. KW "&%s,IF(%s,"erledigt/weitergel. KW "&%s&" bisher",'
         'IF(Filter!$O$29=0,"erledigt oder weitergeleitet","erledigt/weitergeleitet "&%s)))' % (W, KWN, K, KWN, DAT('Filter!$O$29')), None),
        # Produktivitaet je Ansicht (Filter!N50:P…, PROD_ZEILEN): Wochensicht = Abgaenge der KW je MAK (KW des letzten Verbund-Stands,
        # Filter!O43) mit Basis „je MAK in KW 41 · bisher“ / „2 Arbeitstage (Mo–Di)“; Tagessicht und Aktuelle KW = Ø der Tageswerte
        # Mo–Fr ohne Feiertage („Ø je MAK und Arbeitstag“ / „5 Tage (30.09.–07.10.)“). Darunter in der Polsterzeile zwei Zeilen:
        # KV und Komp./Leben (gleiche Rechenart), OPAG (eigene Basis, wenn seine KW oder Tage abweichen)
        ('PRODUKTIVITÄT VERBUND', '=Filter!$O$%d' % PROD_ZEILEN['z_wert'], '=Filter!$O$%d' % PROD_ZEILEN['z1'], '=Filter!$O$%d' % PROD_ZEILEN['z2'],
         'Filter!$O$%d' % PROD_ZEILEN['w_rueck'],
         '=Filter!$O$%d' % PROD_ZEILEN['z34']),
        ('MAK AKTUELLE KW', '=IF(Filter!$O$11=0,"",INDEX(KW!$N$6:$N$400,Filter!$O$11))',
         '=IF(Filter!$O$11=0,"","KV "&FIXED(INDEX(KW!$L$6:$L$400,Filter!$O$11),1)&" · Komp./L. "&FIXED(INDEX(KW!$M$6:$M$400,Filter!$O$11),1))',
         '=IF(Filter!$O$11=0,"laut Kalender (Ø Mo–Fr)",IF(N(INDEX(KW!$N$6:$N$400,Filter!$O$11))=0,IF(Mitarbeiter!$W$5="","keine Anwesenheit geladen",'
         '"0 MAK laut "&IF(Mitarbeiter!$W$7="Plan","Plan","Kalender")),IF(Mitarbeiter!$W$7="Plan","laut Plan (Ø Mo–Fr)","laut Kalender (Ø Mo–Fr)")))', None),
    ]
    ws.set_row(4, 16)
    ws.set_row(5, 36)
    ws.set_row(6, 14)
    ws.set_row(7, 14)
    # Polster der Kacheln, in „Ältester Vorgang“ der Chip „Vorgang öffnen“, in „Produktivität Verbund“ zwei Textzeilen (KV/Komp./L.
    # und OPAG, 7,5 pt): 24 pt statt 22 pt, damit zwei Zeilen auch in Excel (Zeilenabstand ~11 pt) ganz hineinpassen
    ws.set_row(8, 24)
    # acht Kacheln, Abstand 1 Spalte, zusammen genau das Raster I:BF (50 Spalten): Breite je Kachel in Rasterspalten (26 px).
    # „Ältester Vorgang“ bleibt bei Spalte 22 (Knoepfe BTN_Aeltester*), „Ø Alter“ ist schmal (nur Zahl), Ein-/Abgaenge und MAK 5
    breiten = [6, 6, 6, 4, 5, 5, 6, 5]
    assert len(breiten) == len(kacheln) and sum(breiten) + len(breiten) - 1 == 50
    c0 = 8
    for i, (label, f_wert, f_sub1, f_sub2, delta_ref, *f_sub3) in enumerate(kacheln):
        if i:
            c0 += breiten[i - 1] + 1
        c1 = c0 + breiten[i] - 1
        assert label != 'ÄLTESTER VORGANG' or c0 == 22
        fw = st.kpi_wert_dez if label in ('PRODUKTIVITÄT VERBUND', 'MAK AKTUELLE KW', 'Ø ALTER') else st.kpi_wert_dat if label == 'ÄLTESTER VORGANG' else st.kpi_wert
        ws.merge_range(4, c0, 4, c1, label + ('  ›' if label == 'ÄLTESTER VORGANG' else ''), st.kpi_label)   # › = Details per Klick
        ws.merge_range(5, c0, 5, c1, '', fw)
        ws.write_formula(5, c0, f_wert, fw)
        for zr, f_sub in ((6, f_sub1), (7, f_sub2)):
            ws.merge_range(zr, c0, zr, c1, '', st.kpi_sub_text)
            if f_sub.startswith('='):
                ws.write_formula(zr, c0, f_sub, st.kpi_sub_text)
            else:
                ws.write(zr, c0, f_sub, st.kpi_sub_text)
        if f_sub3:                                    # dritte/vierte Zeile in der Polsterzeile (fester Umbruch)
            ws.merge_range(8, c0, 8, c1, '', st.kpi_sub_2z)
            ws.write_formula(8, c0, f_sub3[0], st.kpi_sub_2z)
        else:
            ws.merge_range(8, c0, 8, c1, '', st.kpi_fill)
        if delta_ref:
            zelle = xl_rowcol_to_cell(6, c0)
            ws.conditional_format(zelle, {'type': 'formula', 'criteria': '=AND(%s<>"",%s>0)' % (delta_ref, delta_ref), 'format': wb.add_format({'font_color': GELBD, 'bold': True, 'bg_color': GELBH})})
            ws.conditional_format(zelle, {'type': 'formula', 'criteria': '=AND(%s<>"",%s<0)' % (delta_ref, delta_ref), 'format': wb.add_format({'font_color': GRUEN, 'bold': True, 'bg_color': GRUENH})})

    # ---------------- Bezugstag-Leiste (Zeile 12, zwischen Kennzahlen und Diagrammen): Eingabe L12 mit Auswahlliste der Stichtage,
    # Knoepfe zurueck/vor/neuester (Formen, unten mit den uebrigen Knoepfen angelegt), Hinweis rechts
    f_bz_lab = wb.add_format({'font_name': FONT, 'font_size': 7.5, 'bold': True, 'font_color': GRAU, 'valign': 'vcenter', 'align': 'right'})
    f_bz_ein = wb.add_format({'font_name': FONT, 'font_size': 10, 'bold': True, 'font_color': SW, 'bg_color': WEISS, 'valign': 'vcenter', 'align': 'center',
                              'num_format': 'ddd dd.mm.yyyy', 'border': 1, 'border_color': GRAUL})
    f_bz_txt = wb.add_format({'font_name': FONT, 'font_size': 8.5, 'font_color': GRAU, 'valign': 'vcenter', 'indent': 1})
    ws.merge_range(11, 7, 11, 10, 'BEZUGSTAG', f_bz_lab)
    ws.merge_range(11, 11, 11, 15, '', f_bz_ein)
    # L12 zeigt immer ein Datum: Formel = neuester Stichtag (waechst mit neuen Staenden), ein frueherer Stichtag steht als Wert
    # darin (Auswahlliste oder ‹ zurueck). Filter!O45 = 1, wenn ein frueherer Stichtag aktiv ist.
    ws.write_formula(11, 11, '=IF(COUNT(Verlauf!$A$6:$A$%d)=0,"",MAX(Verlauf!$A$6:$A$%d))' % (MAX_VERLAUF, MAX_VERLAUF), f_bz_ein)
    ws.data_validation(11, 11, 11, 15, {'validate': 'list', 'source': '=Verlauf!$A$6:$A$%d' % MAX_VERLAUF, 'ignore_blank': True,
                                        'input_title': 'Bezugstag', 'input_message': 'Stichtag wählen oder mit ‹ › blättern. „Neuester Stand“ springt zurück.',
                                        'error_type': 'warning', 'error_title': 'Kein Stichtag', 'error_message': 'Bitte einen geladenen Stichtag wählen.'})
    ws.merge_range(11, 41, 11, 57, '', f_bz_txt)
    ws.write_formula(11, 41, '=IF(Filter!$O$40="","Noch keine Stände geladen",IF(Filter!$O$45=0,"neuester Stand · mit ‹ zurück frühere Stichtage ansehen",'
                             '"früherer Stichtag · neuere Stände ausgeblendet"))', f_bz_txt)
    ws.conditional_format(11, 41, 11, 57, {'type': 'formula', 'criteria': '=Filter!$O$45=1', 'format': wb.add_format({'bg_color': GELBH, 'font_color': GELBD, 'bold': True})})
    ws.conditional_format(11, 11, 11, 15, {'type': 'formula', 'criteria': '=Filter!$O$45=1', 'format': wb.add_format({'bg_color': GELBH, 'border': 1, 'border_color': GELBD})})

    # ---------------- Filterpanel links (Spalten B–G): Buttons und Chips als Formen mit Makro
    B_VOLL, B_H = 246, 20
    knoepfe = []     # (row, col, text, makro, fuellung, breite, hoehe, name, schriftfarbe, fett, links, y_offset)
    chips = []       # (row, text, name, aktiv) – Zustand steht in Filter!C bzw. Filter!H/I
    reset_zellen = []  # (row, text, format): Zellen, die beim Ueberfahren den Hover zuruecksetzen
    ws.merge_range(4, 1, 4, 6, 'DATEN', st.filter_kopf)
    # „Neue Daten laden“ startet immer den gefuehrten Ablauf (Rohdaten -> Anwesenheit heute -> Folie)
    knoepfe.append((5, 1, 'Neue Daten laden', 'modTagesablauf.Start', ROT, B_VOLL, 26, 'BTN_Laden', WEISS, True, False, 5))
    knoepfe.append((6, 1, 'Anwesenheit laden', 'modLaden.AnwesenheitLaden', GRAUD, B_VOLL, B_H, 'BTN_Anwesenheit', WEISS, True, False, 4))
    ws.set_row(9, 22)
    ws.set_row(10, 4)
    ws.set_row(11, 22)
    ws.set_row(12, 8.25)           # 11 px (Zeilenhoehen in Punkt); der Chip „Aktuelle KW“ reicht von Zeile 12 bis in Zeile 14 (Excel-Zaehlung)
    # (Bereich Makler: der Knopf „Einheit: Gesamt“ in der Kopfzeile entfaellt ab 12.70 – die Chips „Sparte | Einheit“ ueber dem
    #  Rueckstand zeigen die Einheiten; Filter!L16 bleibt auf Gesamt, modWerkzeuge.EinheitKnopfBeschriften uebergeht den fehlenden Knopf)
    knoepfe.append((9, 1, 'Kalender öffnen', 'modCockpit.PlanungOeffnen', TEALD, B_VOLL, B_H, 'BTN_Planung', WEISS, True, False, 1))
    # Kachel „Ältester Vorgang“ (dritte Kachel, Spalten 22–27): Details mit Ordnungsbegriff, GeVo, Postkorb, Rohdatei markieren
    # ganze Kachel klickbar (durchsichtige Flaeche, Text: geschuetztes Leerzeichen); der Pfeil in der Kachelueberschrift zeigt es an
    knoepfe.append((4, 22, '\u00a0', 'modWerkzeuge.AeltesterZeigen', None, 154, 100, 'BTN_Aeltester', TEALD, True, False, 1))
    knoepfe.append((8, 22, 'Vorgang öffnen ›', 'modWerkzeuge.AeltesterZeigen', TEALL, 124, 17, 'BTN_AeltesterOeffnen', TEALD, True, False, 1))
    knoepfe.append((11, 1, 'PowerPoint-Folie erzeugen', 'modFolienauswahl.Zeigen', ROTD, B_VOLL, B_H, 'BTN_PPT', WEISS, True, False, 1))
    knoepfe.append((11, 16, '‹ zurück', 'modCockpit.BezugZurueck', WEISS, 70, 20, 'BZ_Zurueck', GRAUD, True, False, 1))
    knoepfe.append((11, 19, 'vor ›', 'modCockpit.BezugVor', WEISS, 70, 20, 'BZ_Vor', GRAUD, True, False, 1))
    knoepfe.append((11, 22, 'Neuester Stand', 'modCockpit.BezugNeuester', TEALD, 116, 20, 'BZ_Neu', WEISS, True, False, 1))
    # Ansicht rechts daneben (Formen ANS_Tag/ANS_KW/ANS_Woche, Farbe setzt modCockpit.FilterAnzeigen nach Filter!L9 = Tag/KW/Woche;
    # gebaut im Zustand der Voreinstellung Woche). „Aktuelle KW“ sitzt unter dem Tagessicht-Chip: Tagessicht Montag bis Sonntag der
    # KW des Bezugstags. Verankert in derselben Zeile wie der Tagessicht-Chip (Zeile 12: 22 pt = 29 px; Tagessicht y 1..21 px),
    # y_offset 25 = 4 px darunter; er endet 5 px in Zeile 14 (18 pt = 24 px), also 19 px ueber der Kopfleiste der Kacheln (Zeile 15)
    knoepfe.append((11, 28, 'Tagessicht · 7 Stichtage', 'modCockpit.AnsichtTag', WEISS, 160, 20, 'ANS_Tag', GRAU, False, True, 1))
    knoepfe.append((11, 35, 'Wochensicht · 7 KW', 'modCockpit.AnsichtWoche', TEAL, 136, 20, 'ANS_Woche', WEISS, True, True, 1))
    knoepfe.append((11, 28, 'Aktuelle KW · Mo–So', 'modCockpit.AnsichtKW', WEISS, 160, 20, 'ANS_KW', GRAU, False, True, 25))
    r = 13
    ws.merge_range(r, 1, r, 6, 'SPARTEN', st.filter_kopf)
    reset_zellen.append((r, 'SPARTEN', st.filter_kopf))
    ws.set_row(r, 18)
    sp_start = r + 1
    for i, sp in enumerate(['Komposit', 'Leben', 'KV', 'Sonstige']):
        ws.set_row(sp_start + i, 17)
        chips.append((sp_start + i, sp, 'SP_%d' % (i + 1), True))
    r = sp_start + 4
    ws.set_row(r, 6)
    knoepfe.append((r + 1, 1, 'Alle Sparten', 'modCockpit.FilterAlleSparten', GRAUM, B_VOLL, B_H, 'BTN_SPAlle', WEISS, True, False, 1))
    ws.set_row(r + 1, 18)
    ws.set_row(r + 2, 8)
    r = r + 3
    if BEREICH == 'MAKLER':                # Einheiten-Chips (12.86): Namen aus Filter!X5:X10, Zustand Filter!Y; wirken auf alle Kennzahlen
        ws.merge_range(r, 1, r, 6, 'EINHEITEN', st.filter_kopf)
        reset_zellen.append((r, 'EINHEITEN', st.filter_kopf))
        ws.set_row(r, 18)
        eh_start = r + 1
        for i in range(6):
            ws.set_row(eh_start + i, 17)
            chips.append((eh_start + i, '', 'EH_%d' % (i + 1), True))
            # „nur“ (12.86): zeigt ausschliesslich diese Einheit (alle anderen aus) – Form rechts im Chip, sichtbar nur mit Einheit
            knoepfe.append((eh_start + i, 6, 'nur', 'modCockpit.EinheitNur%d' % (i + 1), WEISS, 38, 15, 'BTN_EHNur%d' % (i + 1), TEALD, True, False, 1))
        r = eh_start + 6
        ws.set_row(r, 6)
        knoepfe.append((r + 1, 1, 'Alle Einheiten', 'modCockpit.FilterAlleEinheiten', GRAUM, B_VOLL, B_H, 'BTN_EHAlle', WEISS, True, False, 1))
        ws.set_row(r + 1, 18)
        ws.set_row(r + 2, 8)
        r = r + 3
    ws.merge_range(r, 1, r, 6, 'THEMENPOSTKÖRBE', st.filter_kopf)
    reset_zellen.append((r, 'THEMENPOSTKÖRBE', st.filter_kopf))
    ws.set_row(r, 18)
    pk_start = r + 1
    for i in range(10):                    # zehn Chips: Text aus Filter!B (nach jedem Laden nach Rueckstand sortiert), nur mit Daten
        ws.set_row(pk_start + i, 17)
        chips.append((pk_start + i, postkoerbe[i] if i < len(postkoerbe) else '', 'PK_%d' % (i + 1), i < len(postkoerbe) and postkoerbe[i] in POSTKOERBE_AKTIV))
    r = pk_start + 10
    ws.set_row(r, 6)
    knoepfe.append((r + 1, 1, 'Standard-Postkörbe', 'modCockpit.FilterAktiveBearbeitung', TEALD, B_VOLL, B_H, 'BTN_PKAktiv', WEISS, True, False, 1))
    knoepfe.append((r + 3, 1, 'Alle Postkörbe', 'modCockpit.FilterAllePostkoerbe', GRAUM, B_VOLL, B_H, 'BTN_PKAlle', WEISS, True, False, 1))
    ws.set_row(r + 1, 18)
    ws.set_row(r + 2, 6)
    ws.set_row(r + 3, 18)
    ws.set_row(r + 4, 8)
    r = r + 5
    ws.merge_range(r, 1, r, 6, 'GEVO-TYPEN', st.filter_kopf)
    reset_zellen.append((r, 'GEVO-TYPEN', st.filter_kopf))
    ws.set_row(r, 18)
    r += 1
    ws.merge_range(r, 1, r, 6, '', st.dropdown)
    ws.write_formula(r, 1, '=Filter!$L$5', st.dropdown)
    ws.set_row(r, 18)
    r += 1
    ws.merge_range(r, 1, r, 6, 'Modus: Alle GeVo · Nur BÜ-Schlüssel · Manuelle Auswahl (Chips)', st.hinweis)
    reset_zellen.append((r, 'Modus: Alle GeVo · Nur BÜ-Schlüssel · Manuelle Auswahl (Chips)', st.hinweis))
    ws.set_row(r, 22)
    gv_start = r + 1
    for i in range(13):
        ws.set_row(gv_start + i, 17)
        if i < len(gevo_typen):
            chips.append((gv_start + i, gevo_typen[i], 'GV_%d' % (i + 1), True))
    chips.append((gv_start + 13, 'Alle übrigen GeVo-Typen', 'GV_14', True))
    ws.set_row(gv_start + 13, 17)
    r = gv_start + 14
    ws.set_row(r, 6)
    knoepfe.append((r + 1, 1, 'Nur BÜ-Schlüssel', 'modCockpit.FilterNurBUE', TEALD, B_VOLL, B_H, 'BTN_GVBUE', WEISS, True, False, 1))
    knoepfe.append((r + 3, 1, 'Alle GeVo', 'modCockpit.FilterAlleGeVo', GRAUM, B_VOLL, B_H, 'BTN_GVAlle', WEISS, True, False, 1))
    ws.set_row(r + 1, 18)
    ws.set_row(r + 2, 6)
    ws.set_row(r + 3, 18)
    ws.set_row(r + 4, 8)
    r = r + 1                      # Ansicht Tag/KW/Woche sitzt jetzt oben in der Bezugstag-Leiste
    knoepfe.append((r + 4, 1, 'Aktualisieren', 'modCockpit.Aktualisieren', GRAUD, B_VOLL, B_H, 'BTN_Aktualisieren', WEISS, True, False, 1))
    knoepfe.append((r + 6, 1, 'Auf Standard zurücksetzen', 'modCockpit.StandardAnwenden', TEALD, B_VOLL, B_H, 'BTN_Zurueck', WEISS, True, False, 1))
    knoepfe.append((r + 8, 1, 'Standard festlegen …', 'modStandard.Zeigen', WEISS, B_VOLL, B_H, 'BTN_StdFest', TEALD, True, False, 1))
    knoepfe.append((r + 10, 1, 'Hilfe', 'modCockpit.Hilfe', GRAUM, B_VOLL, B_H, 'BTN_Hilfe', WEISS, True, False, 1))
    # Werkzeuge: SLA, Rohdateien loeschen, Tool leeren (Karten in modWerkzeuge)
    ws.merge_range(r + 12, 1, r + 12, 6, 'WERKZEUGE', st.filter_kopf)
    reset_zellen.append((r + 12, 'WERKZEUGE', st.filter_kopf))
    knoepfe.append((r + 13, 1, 'SLA anpassen …', 'modWerkzeuge.SlaZeigen', WEISS, B_VOLL, B_H, 'BTN_SLA', TEALD, True, False, 1))
    knoepfe.append((r + 15, 1, 'Rohdaten löschen …', 'modWerkzeuge.RohdatenZeigen', WEISS, B_VOLL, B_H, 'BTN_RohLoeschen', ROTD, True, False, 1))
    knoepfe.append((r + 17, 1, 'Zurücksetzen …', 'modWerkzeuge.ZuruecksetzenZeigen', WEISS, B_VOLL, B_H, 'BTN_Leeren', ROTD, True, False, 1))
    knoepfe.append((r + 19, 1, 'Ältere Datei aktualisieren …', 'modWerkzeuge.UpdateZeigen', WEISS, B_VOLL, B_H, 'BTN_Update', TEALD, True, False, 1))
    ws.set_row(r + 4, 18)
    ws.set_row(r + 5, 6)
    ws.set_row(r + 6, 18)
    ws.set_row(r + 7, 6)
    ws.set_row(r + 8, 18)
    ws.set_row(r + 9, 6)
    ws.set_row(r + 10, 18)
    ws.set_row(r + 11, 8)
    ws.set_row(r + 12, 18)
    for k in (13, 15, 17, 19):
        ws.set_row(r + k, 18)
        ws.set_row(r + k + 1, 6)
    r += 9
    # Hinweis (8 pt kursiv, Umbruch): B77:G85 – neun Zeilen ohne eigene Hoehe (9 x 15 pt = 135 pt; bis 12.79 B75:G80 = 90 pt, zu knapp
    # fuer Excel). Darunter liegen in B:G weder Zellen noch Formen (letzter Knopf BTN_Update in Zeile 75, seit 12.93), Zeilenhoehen bleiben gleich.
    ws.merge_range(r + 12, 1, r + 20, 6, 'Chips: gefüllt = im Filter, weiß = ausgeblendet. Klick schaltet um. Eingänge = neu in der Auswahl (neuer Schlüssel oder hereingewechselt), '
                                         'Abgänge = nicht mehr in der Auswahl (abgearbeitet, weitergeleitet oder hinausgewechselt). Produktivität = Abgänge je MAK (neueste KW hochger.), Basis in der Kachel (siehe Anleitung). '
                                         'Werte, die nicht in ihr Segment passen, stehen mit Führungslinie neben der Säule.', st.hinweis)
    # Chips: Zellen mit HYPERLINK auf die Hover-Funktion (Mauszeiger darueber setzt Filter!Q1 = Chip-Nummer, bedingte Formate
    # zeichnen Zustand und Hover); der Klick landet in Worksheet_SelectionChange des Blatts und schaltet den Filter um.
    # Spalte A traegt die Chip-Nummer (weiss, unsichtbar), Kopfzeilen und Hinweise setzen den Hover zurueck (ChipHover(0)).
    f_chip = wb.add_format({'font_name': FONT, 'font_size': 8.5, 'font_color': GRAU, 'bg_color': WEISS, 'valign': 'vcenter', 'indent': 1,
                            'border': 1, 'border_color': GRAUL})
    f_id = wb.add_format({'font_color': WEISS, 'font_size': 6})
    cf_aktiv = wb.add_format({'bg_color': TEAL, 'font_color': WEISS, 'bold': True, 'border': 1, 'border_color': TEAL})
    cf_leer = wb.add_format({'bg_color': WEISS, 'font_color': WEISS, 'border': 1, 'border_color': WEISS})
    cf_hover_aktiv = wb.add_format({'bg_color': TEALD, 'font_color': WEISS, 'bold': True, 'border': 1, 'border_color': TEALD})
    cf_hover_inaktiv = wb.add_format({'bg_color': TEALT, 'font_color': TEALD, 'bold': True, 'border': 1, 'border_color': TEAL})
    sp_formate = {}
    for (zr, text, nm, aktiv) in chips:
        art = nm.split('_')[0]
        nr = int(nm.split('_')[1]) + {'PK': 0, 'GV': 100, 'SP': 200, 'EH': 300}[art]
        zust = {'PK': 'Filter!$C$%d', 'GV': 'Filter!$I$%d', 'SP': 'Filter!$T$%d', 'EH': 'Filter!$Y$%d'}[art] % (4 + int(nm.split('_')[1]))
        if art == 'SP':                      # Sparten-Chips in der Farbe der Sparte (wie die Segmente der Diagramme)
            fs = FARBE_SPARTE[text]
            if fs not in sp_formate:
                sp_formate[fs] = (wb.add_format({'bg_color': fs, 'font_color': WEISS, 'bold': True, 'border': 1, 'border_color': fs}),
                                  wb.add_format({'bg_color': fs, 'font_color': WEISS, 'bold': True, 'border': 2, 'border_color': GRAUD}),
                                  wb.add_format({'bg_color': GRAUXL, 'font_color': fs, 'bold': True, 'border': 1, 'border_color': fs}))
            cf_a, cf_ha, cf_hi = sp_formate[fs]
        else:
            cf_a, cf_ha, cf_hi = cf_aktiv, cf_hover_aktiv, cf_hover_inaktiv
        ws.merge_range(zr, 1, zr, 6, '', f_chip)
        t = text.replace('"', '""')
        fz = 4 + int(nm.split('_')[1])                         # Zeile im Blatt Filter
        if art == 'PK':                                        # Name aus der (sortierten) Liste, nur wenn der Postkorb in den Daten vorkommt
            sichtbar = 'N(Filter!$U$%d)>0' % fz
            ws.write_formula(zr, 1, '=IF(%s,IFERROR(HYPERLINK(ChipHover(%d),Filter!$B$%d),Filter!$B$%d),"")' % (sichtbar, nr, fz, fz), f_chip, '')
        elif art == 'EH':                                      # Einheit aus der Liste (nach dem Laden gesetzt), leere Zeile unsichtbar
            sichtbar = 'Filter!$X$%d<>""' % fz
            ws.write_formula(zr, 1, '=IF(%s,IFERROR(HYPERLINK(ChipHover(%d),Filter!$X$%d),Filter!$X$%d),"")' % (sichtbar, nr, fz, fz), f_chip, '')
        elif art == 'SP':                                      # Sparte nur, wenn sie vorkommt (ohne Daten: alle)
            sichtbar = 'OR(N(Filter!$V$%d)>0,COUNT(Fakten!$A$2:$A$3)=0)' % fz
            ws.write_formula(zr, 1, '=IF(%s,IFERROR(HYPERLINK(ChipHover(%d),"%s"),"%s"),"")' % (sichtbar, nr, t, t), f_chip, text)
        else:
            sichtbar = None
            ws.write_formula(zr, 1, '=IFERROR(HYPERLINK(ChipHover(%d),"%s"),"%s")' % (nr, t, t), f_chip)     # ohne Makros bleibt der Text stehen
        ws.write_number(zr, 0, nr, f_id)
        zelle = xl_rowcol_to_cell(zr, 1)
        if sichtbar:                                           # ausgeblendeter Chip: weiss auf weiss, ohne Rahmen (vor allen anderen Formaten)
            ws.conditional_format(zelle, {'type': 'formula', 'criteria': '=NOT(%s)' % sichtbar, 'format': cf_leer, 'stop_if_true': True})
        ws.conditional_format(zelle, {'type': 'formula', 'criteria': '=AND(Filter!$Q$1=%d,%s=TRUE)' % (nr, zust), 'format': cf_ha, 'stop_if_true': True})
        ws.conditional_format(zelle, {'type': 'formula', 'criteria': '=AND(Filter!$Q$1=%d,NOT(%s=TRUE))' % (nr, zust), 'format': cf_hi, 'stop_if_true': True})
        ws.conditional_format(zelle, {'type': 'formula', 'criteria': '=%s=TRUE' % zust, 'format': cf_a})
    for (zr, text, fmt) in reset_zellen:
        t = text.replace('"', '""')
        ws.write_formula(zr, 1, '=IFERROR(HYPERLINK(ChipHover(0),"%s"),"%s")' % (t, t), fmt)

    # ---------------- Diagramme rechts (ab Spalte I = 8): Raster mit 2 Spalten (je 25 Rasterspalten) oder voller Breite
    def naechste_zeile(zeile):
        # erste Zeile, ab der ein Diagramm unter dem Diagramm in 'zeile' (Titel, Untertitel, Diagramm ab zeile+2) Platz hat
        unten = px_zeile(ws, zeile + 2) + 4 + CHART_H + 10
        r = zeile + 2
        while px_zeile(ws, r) < unten:
            r += 1
        return r

    kopf_fmt = {}
    def chart_platz(zeile, spalte, titel, sub, chart, farbe=FARBE_NEUTRAL, voll=False):
        # Kachel mit farbiger Kopfleiste ("Bookmark": OPAG rot, Verbund petrol, uebrige grau), Untertitel und hellem Rahmen
        ende = (57 if voll else spalte + 24)
        if farbe not in kopf_fmt:
            kopf_fmt[farbe] = (wb.add_format({'font_name': FONT, 'font_size': 11, 'bold': True, 'font_color': WEISS, 'bg_color': farbe, 'valign': 'vcenter', 'indent': 1}),
                               wb.add_format({'font_name': FONT, 'font_size': 8, 'font_color': GRAU, 'bg_color': GRAUXL, 'valign': 'vcenter', 'indent': 1}))
        f_kopf, f_sub = kopf_fmt[farbe]
        ws.merge_range(zeile, spalte, zeile, ende, '', f_kopf)
        if titel.startswith('='):
            ws.write_formula(zeile, spalte, titel, f_kopf)
        else:
            ws.write(zeile, spalte, titel, f_kopf)
        ws.merge_range(zeile + 1, spalte, zeile + 1, ende, '' if sub.startswith('=') else sub, f_sub)
        if sub.startswith('='):
            ws.write_formula(zeile + 1, spalte, sub, f_sub)
        letzte = naechste_zeile(zeile) - 2
        for rr in range(zeile + 2, letzte + 1):
            ws.merge_range(rr, spalte, rr, ende, '', st.kpi_fill)
        nummer = chart_einfuegen(ws, zeile + 2, spalte, chart, {'x_offset': 10, 'y_offset': 6, 'object_position': 3})
        for g in GEOMETRIE:
            if 'datei' not in g:
                g['datei'] = 'xl/charts/chart%d.xml' % nummer

    def da(col):                      # Block A Rueckstand: immer 7 Zeilen
        return '=Diagrammdaten!$%s$4:$%s$10' % (col, col)

    k2 = ber['kw2']                   # Fenster von 7 Kalenderwochen, endet mit der KW des letzten Stichtags
    k1 = max(6, k2 - 6)
    k2 = k1 + 6

    def kwb(col):
        return '=KW!$%s$%d:$%s$%d' % (col, k1, col, k2)

    summen_label = lambda fmt, pos: {'value': True, 'position': pos, 'num_format': fmt, 'font': {**LABEL_FONT, 'color': GRAUD}}  # noqa: E731

    def stapel(q):
        ch = wb.add_chart({'type': 'column', 'subtype': 'stacked'})
        cols = {'OPAG': ['C', 'D', 'E', 'F'], 'Verbund': ['G', 'H', 'I', 'J']}[q]
        makler = BEREICH == 'MAKLER'                 # Makler: Namen nach Sicht (Diagrammdaten!BK3:BN3) und vierte Reihe (BI/BJ)
        reihen = list(zip(['Komposit', 'Leben', 'KV'], cols)) + ([('Sonstige', 'BI' if q == 'OPAG' else 'BJ')] if makler else [])
        kat = da('BR' if q == 'OPAG' else 'BS')      # Achse der Quelle (Wochensicht: Datum des Stands der Quelle unter der KW, * ohne Sonntagsstand)
        for k, (sp, col) in enumerate(reihen):
            ch.add_series({'name': '=Diagrammdaten!$%s$3' % xl_col_to_name(62 + k) if makler else sp, 'categories': kat, 'values': da(col),
                           'fill': {'color': FARBE_SPARTE[sp]}, 'border': {'color': WEISS, 'width': 0.75}, 'gap': 100,
                           'data_labels': SEGMENT_LABEL()})
        ln = wb.add_chart({'type': 'line'})
        ln.add_series({'name': 'Gesamt', 'categories': kat, 'values': da(cols[3]), 'line': {'none': True}, 'marker': {'type': 'none'},
                       'data_labels': summen_label('#,##0;#,##0;', 'above')})
        # Badges: Veraenderung zur vorherigen Periode ueber der Summe (gruen = weniger, gelb = mehr, grau = gleich), Text aus der Zelle
        b0 = 16 + (0 if q == 'OPAG' else 5)
        text_col = xl_col_to_name(b0 + 4)
        for k, (nm, fuellung, schrift) in enumerate([('Delta weniger', GRUENH, GRUEN), ('Delta mehr', GELBH, GELBD), ('Delta gleich', GRAUXL, GRAUD)]):
            # unsichtbare Punktreihen; je Punkt eigene Schrift und Fuellung (Etikett mittig auf dem Punkt)
            badge_text = [{'value': '=Diagrammdaten!$%s$%d' % (text_col, 4 + t), 'font': {**LABEL_FONT, 'color': schrift},
                           'fill': {'color': fuellung}, 'border': {'none': True}} for t in range(7)]
            ln.add_series({'name': nm, 'categories': kat, 'values': da(xl_col_to_name(b0 + k)), 'line': {'none': True}, 'marker': {'type': 'none'},
                           'data_labels': {'value': True, 'position': 'center', 'custom': badge_text, 'font': {**LABEL_FONT, 'color': schrift},
                                           'fill': {'color': fuellung}, 'border': {'none': True}}})
        ln.add_series({'name': 'Achsenluft', 'categories': kat, 'values': da(xl_col_to_name(b0 + 3)), 'line': {'none': True}, 'marker': {'type': 'none'}})
        # SLA als gestrichelte Linie ohne Etikett im Diagramm; Wert und Herkunft stehen in der Legende oben
        # (Verbund: Konfiguration!F3; OPAG: F4 oder Vorschlag aus Ø 14 Tage)
        sla_wert, sla_text = ('AK', '$AL$4') if q == 'Verbund' else ('AS', '$AT$4')
        ln.add_series({'name': '=Diagrammdaten!%s' % sla_text, 'categories': kat, 'values': da(sla_wert), 'marker': {'type': 'none'},
                       'line': {'color': GRAUD, 'width': 1.5, 'dash_type': 'dash'}})
        ch.combine(ln)
        chart_stil(ch, breite=CHART_B, hoehe=CHART_H)
        thinkcell(ch)
        # Legende: Sparten und SLA-Linie; Gesamt (nur Summenetikett), Delta-Badges und Achsenluft ausgeblendet
        weg = [4, 5, 6, 7, 8] if makler else [3, 4, 5, 6, 7]
        ch.set_legend({'position': 'top', 'font': {'name': FONT, 'size': 8, 'color': GRAUD}, 'delete_series': weg})
        ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True}, 'layout': PLOT_STAPEL})
        w = werte['rueckstand'][q]                                    # 7 Slots x [Ko, Le, KV] oder None
        ymax = achsen_ende(max([sum(s) for s in w if s] or [0]), 1.55)
        if q == 'Verbund' and ymax > 0:
            ymax = max(ymax, achsen_ende(SLA_VERBUND, 1.15))           # SLA-Linie bleibt sichtbar, auch wenn der Rueckstand darunter liegt
        if ymax > 0:                                                  # feste Achse nur mit Daten (Excel-Makro stellt auf Automatik zurueck)
            ch.set_y_axis({'visible': False, 'major_gridlines': {'visible': False}, 'min': 0, 'max': ymax})
            texte = {}
            for t in range(1, 7):
                if w[t] and w[t - 1]:
                    texte['Diagrammdaten!$%s$%d' % (text_col, 4 + t)] = zahl_text(sum(w[t]) - sum(w[t - 1]), '+#,##0')
            GEOMETRIE.append({'kennung': 'Diagrammdaten!$%s$4:$%s$10' % (cols[0], cols[0]), 'art': 'saeulen', 'b': CHART_B, 'h': CHART_H,
                          'layout': PLOT_STAPEL, 'gap': 100, 'werte': w, 'ymin': 0, 'ymax': ymax, 'formate': ['#,##0'] * len(reihen), 'texte': texte})
        return ch

    def dc(col):                      # Block C Eingänge/Abgänge je Zeile: immer 7 Zeilen
        return '=Diagrammdaten!$%s$37:$%s$43' % (col, col)

    def bw_chart(zi, name, hoehe, unten):
        # Eine Zeile der Kachel „Eingänge und Abgänge“: Eingänge über der Achse (Wert darüber), Abgänge darunter (Wert darunter),
        # Delta als abgerundete Box mit weißer Kontur auf der Nulllinie (je Vorzeichen eine Punktreihe, Text aus der Zelle).
        b = 2 + zi * 6
        fe, fa = (GRAUD, GRAU_ABG) if name == 'Gesamt' else (FARBE_SPARTE[name], FARBE_SPARTE_HELL[name])
        ch = wb.add_chart({'type': 'column', 'name': 'BW_%s' % name})
        for art, col, farbe in (('Eingänge', b, fe), ('Abgänge', b + 1, fa)):
            ch.add_series({'name': art, 'categories': dc('A'), 'values': dc(xl_col_to_name(col)), 'fill': {'color': farbe}, 'border': {'none': True},
                           'gap': 70, 'overlap': 100,
                           'data_labels': {'value': True, 'position': 'outside_end', 'num_format': '#,##0;#,##0;',
                                           'font': {'name': FONT, 'size': 8, 'color': SW}}})
        ln = wb.add_chart({'type': 'line'})
        text_col = xl_col_to_name(b + 5)
        for k, (nm, fuellung, schrift) in enumerate([('Delta weniger', GRUENH, GRUEN), ('Delta mehr', GELBH, GELBD), ('Delta gleich', GRAUXL, GRAUD)]):
            box = {'fill': {'color': fuellung}, 'border': {'color': WEISS, 'width': 1.5}}
            custom = [{'value': '=Diagrammdaten!$%s$%d' % (text_col, 37 + t), 'font': {**LABEL_FONT, 'color': schrift}, **box} for t in range(7)]
            ln.add_series({'name': nm, 'categories': dc('A'), 'values': dc(xl_col_to_name(b + 2 + k)), 'line': {'none': True}, 'marker': {'type': 'none'},
                           'data_labels': {'value': True, 'position': 'center', 'custom': custom, 'font': {**LABEL_FONT, 'color': schrift}, **box}})
        ln.add_series({'name': 'Skala', 'categories': dc('A'), 'values': dc('AB' if name == 'Gesamt' else 'AA'), 'line': {'none': True}, 'marker': {'type': 'none'}})
        ch.combine(ln)
        chart_stil(ch, legende=None, breite=BW_B, hoehe=hoehe)
        ch.set_y_axis({'visible': False, 'major_gridlines': {'visible': False}})
        ch.set_x_axis({'num_font': {'name': FONT, 'size': 8, 'color': GRAU}, 'line': {'color': GRAUD, 'width': 0.75}, 'major_gridlines': {'visible': False},
                       'major_tick_mark': 'none', 'label_position': 'low' if unten else 'none'})
        ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True},
                         'layout': {'x': 0.12, 'y': 0.15 * BW_H / hoehe, 'width': 0.71, 'height': 0.70 * BW_H / hoehe}})
        return ch

    def bewegung_kachel(zeile):
        # Kachel „Eingänge und Abgänge“: eine Diagrammzeile je Eintrag in BW_ZEILEN (Gesamt mit eigener Skala, Sparten mit gemeinsamer Skala),
        # Quelle per Bookmark-Chip (Filter!L13). Die Zeilen des Blatts haben wegen des Filterpanels unterschiedliche Hoehen; Zeilennamen und
        # Summenblock stehen deshalb als Textfelder pixelgenau ueber den Diagrammen (Werte aus Diagrammdaten!C45:F48).
        f_kopf = wb.add_format({'font_name': FONT, 'font_size': 11, 'bold': True, 'font_color': WEISS, 'bg_color': FARBE_VERBUND, 'valign': 'vcenter', 'indent': 1})
        f_sub = wb.add_format({'font_name': FONT, 'font_size': 8, 'font_color': GRAU, 'bg_color': GRAUXL, 'valign': 'vcenter', 'indent': 1})
        ws.merge_range(zeile, 8, zeile, 57, '', f_kopf)
        ws.write_formula(zeile, 8, '="Eingänge und Abgänge "&Filter!$L$13&" nach Sparte"&IF(Filter!$L$9="Woche"," · letzte 7 Kalenderwochen",%s)' % tag_zeitraum, f_kopf)
        ws.conditional_format(zeile, 8, zeile, 57, {'type': 'formula', 'criteria': '=Filter!$L$13="OPAG"', 'format': wb.add_format({'bg_color': FARBE_OPAG})})
        if ws._size_row(zeile + 1) < 16:                 # Zeile des Filterpanels zu niedrig fuer die Unterzeile
            ws.set_row(zeile + 1, 12)
        ws.merge_range(zeile + 1, 8, zeile + 1, 57, 'Eingänge über der Achse (Wert darüber), Abgänge darunter (Wert darunter), Delta = Eingänge minus Abgänge (Box: grün = Abbau, gelb = Aufbau) '
                       '· Sparten mit gemeinsamer Skala, Gesamt mit eigener · nach aktivem Filter', f_sub)
        knoepfe.append((zeile, 51, 'Verbund', 'modCockpit.QuelleVerbund', WEISS, 72, 18, 'BWQ_Verbund', FARBE_VERBUND, True, False, 4))
        knoepfe.append((zeile, 54, 'OPAG', 'modCockpit.QuelleOPAG', FARBE_VERBUND, 72, 18, 'BWQ_OPAG', WEISS, False, False, 4))
        # Flaeche wie chart_platz: graue Kachel, Diagramme weiss in voller Breite
        oben = 6
        hoehen = [BW_H + 22] * len(BW_ZEILEN)            # je Zeile eine eigene Datumsachse
        unten_px = px_zeile(ws, zeile + 2) + oben + sum(hoehen) + 10
        letzte = zeile + 2
        while px_zeile(ws, letzte + 1) < unten_px:
            letzte += 1
        for rr in range(zeile + 2, letzte + 1):
            ws.merge_range(rr, 8, rr, 57, '', st.kpi_fill)

        def textfeld(x, y, b, h, text, schrift, ausr='left', fuellung=None, link=None):
            opt = {'x_offset': 10 + x, 'y_offset': oben + y, 'width': b, 'height': h, 'object_position': 3,
                   'fill': {'color': fuellung} if fuellung else {'none': True}, 'line': {'none': True},
                   'font': {'name': FONT, **schrift}, 'align': {'vertical': 'middle', 'horizontal': ausr},
                   'text_margins': {'left': 0, 'right': 0, 'top': 0, 'bottom': 0}}
            if link:
                opt['textlink'] = link
            ws.insert_textbox(zeile + 2, 8, text, opt)

        x_sig = int(CHART_B_VOLL * 0.855)
        y = 0
        for zi, name in enumerate(BW_ZEILEN):
            h = hoehen[zi]
            nummer = chart_einfuegen(ws, zeile + 2, 8, bw_chart(zi, name, h, True),
                                     {'x_offset': 10, 'y_offset': oben + y, 'object_position': 3})
            BW_DATEIEN.add('xl/charts/chart%d.xml' % nummer)
            slots = werte['bw'][zi]
            BW_TEXTE['xl/charts/chart%d.xml' % nummer] = {'Diagrammdaten!$%s$%d' % (xl_col_to_name(7 + zi * 6), 37 + t): zahl_text(v[0] - v[1], '+#,##0')
                                                          for t, v in enumerate(slots) if v}
            se, sa = sum(v[0] for v in slots if v), sum(v[1] for v in slots if v)
            vorschau = {'C': zahl_text(se, '#,##0'), 'D': zahl_text(sa, '#,##0'),
                        'E': zahl_text(se - sa, '+#,##0') if se < sa else '', 'F': zahl_text(se - sa, '+#,##0') if se >= sa else ''}
            farbe = GRAUD if name == 'Gesamt' else FARBE_SPARTE[name]
            textfeld(12, y + 20, 4, 74, '', {'size': 8}, fuellung=farbe)
            textfeld(24, y + 18, 120, 20, name, {'size': 10.5, 'bold': True, 'color': SW})
            textfeld(24, y + 46, 120, 16, 'Eingänge ▲', {'size': 8, 'color': GRAU})
            textfeld(24, y + 64, 120, 16, 'Abgänge ▼', {'size': 8, 'color': GRAU})
            if name == 'Gesamt':
                textfeld(24, y + 82, 120, 14, 'eigene Skala', {'size': 7.5, 'italic': True, 'color': GRAUM})
                # Zwischenspeicher fuer die Voreinstellung Wochensicht (Excel liest Diagrammdaten!C44)
                textfeld(x_sig, y + 2, 170, 16, 'Σ KW %d' % werte['kw_letzte'] if werte['kw_letzte'] else 'Σ', {'size': 9, 'bold': True, 'color': GRAUD},
                         link='=Diagrammdaten!$C$44')
            for k, (lab, col, schrift) in enumerate((('Eingänge', 'C', SW), ('Abgänge', 'D', SW))):
                textfeld(x_sig, y + 24 + k * 22, 70, 18, lab, {'size': 8.5, 'color': GRAU})
                textfeld(x_sig + 70, y + 24 + k * 22, 100, 18, vorschau[col], {'size': 9.5, 'bold': name == 'Gesamt', 'color': schrift}, 'right',
                         link='=Diagrammdaten!$%s$%d' % (col, 45 + zi))
            textfeld(x_sig, y + 68, 70, 18, 'Delta', {'size': 8.5, 'color': GRAU})
            for col, schrift in (('E', GRUEN), ('F', GELBD)):          # je Vorzeichen ein Feld, das jeweils andere ist leer
                textfeld(x_sig + 70, y + 68, 100, 18, vorschau[col], {'size': 9.5, 'bold': True, 'color': schrift}, 'right', link='=Diagrammdaten!$%s$%d' % (col, 45 + zi))
            y += h
        return letzte + 2

    kw_text = '" · KW"&IF(Filter!$O$10="",""," "&Filter!$O$10)&" (Mo–So)"'          # Ansicht KW: KW des Bezugstags
    zeitraum = 'IF(Filter!$L$9="Woche"," · letzte 7 Kalenderwochen (Stand Sonntag)",IF(Filter!$L$9="KW",%s," · letzte 7 Stichtage"))' % kw_text
    tag_zeitraum = 'IF(Filter!$L$9="KW",%s," · letzte 7 Stichtage")' % kw_text

    def rueck_titel(q):
        # Wochensicht „Rückstand je KW OPAG“; Tagessicht und Aktuelle KW wie bisher „Rückstand OPAG im Verlauf · …“
        return '=IF(Filter!$L$9="Woche","Rückstand je KW %s","Rückstand %s im Verlauf"&%s)' % (q, q, tag_zeitraum)

    def rueck_sub(q, einheit):
        # Wochensicht: Regel knapp, Fussnote zum Stern nur, wenn im Diagramm ein Stern steht (Diagrammdaten!BV OPAG, BW Verbund)
        stern = 'BV' if q == 'OPAG' else 'BW'
        regel = ('"Stand Sonntag der KW, laufende KW neuester Stand"&IF(SUM(Diagrammdaten!$%s$4:$%s$10)>0,'
                 '" · * ohne Sonntagsstand – letzter Stand der KW","")' % (stern, stern))
        # (Wochensicht kurz ohne „nach Sparte …, Summe über der Säule“ – die Legende zeigt die Stapel –, damit die Stern-Fussnote
        # auch im Bereich Makler in die Zeile passt)
        return ('=IF(Filter!$L$9="Woche","%s · nach aktivem Filter · "&%s,"%s %s, Summe über der Säule · nach aktivem Filter · "&%s)'
                % (einheit, regel, einheit, nach, reihenfolge))
    z1 = 14
    ws.set_row(z1, 20)
    nach = 'nach Sparte oder Einheit (Schalter oben)' if BEREICH == 'MAKLER' else 'nach Sparte'
    reihenfolge = 'IF(Filter!$L$9="KW","Montag links bis Sonntag rechts","neueste Periode rechts")'     # Ansicht KW: Plaetze Mo..So
    chart_platz(z1, 8, rueck_titel('OPAG'), rueck_sub('OPAG', 'Arbeitsgüter'), stapel('OPAG'), FARBE_OPAG)
    chart_platz(z1, 33, rueck_titel('Verbund'), rueck_sub('Verbund', 'Vorgänge'), stapel('Verbund'), FARBE_VERBUND)
    if BEREICH == 'MAKLER':                # Sicht der beiden Rueckstandsdiagramme: Sparte | Einheit (Filter!L19, modWerkzeuge.SichtFaerben)
        knoepfe.append((z1, 26, 'Sparte', 'modWerkzeuge.SichtSparte', WEISS, 72, 16, 'BWS_Sparte', FARBE_OPAG, True, False, 2))
        knoepfe.append((z1, 29, 'Einheit', 'modWerkzeuge.SichtEinheit', FARBE_OPAG, 72, 16, 'BWS_Einheit', WEISS, False, False, 2))
    # (Knopf „Zum letzten Verbund-Stand“ in der Kopfleiste entfaellt ab 12.77: in der Wochensicht steht unter jeder KW das Datum
    #  des Verbund-Stands, in der Tagessicht zeigen leere Plaetze, wo Verbund fehlt)
    z2 = naechste_zeile(z1)
    ws.set_row(z2, 20)
    z4 = bewegung_kachel(z2)
    ws.set_row(z4, 20)
    mak = wb.add_chart({'type': 'column', 'subtype': 'stacked', 'name': 'Chart 5'})
    # Komposit/Leben unten, Gesundheit (KV) darueber – dieselbe Reihenfolge wie in den Rueckstandsdiagrammen
    mak.add_series({'name': 'Komposit/Leben', 'categories': kwb('C'), 'values': kwb('M'), 'fill': {'color': TEAL}, 'border': {'color': WEISS, 'width': 0.75}, 'gap': 55,
                    'data_labels': SEGMENT_LABEL('0.0;0.0;')})
    mak.add_series({'name': 'Gesundheit (KV)', 'categories': kwb('C'), 'values': kwb('L'), 'fill': {'color': ROT}, 'border': {'color': WEISS, 'width': 0.75},
                    'data_labels': SEGMENT_LABEL('0.0;0.0;')})
    mak_ln = wb.add_chart({'type': 'line'})
    mak_ln.add_series({'name': 'Gesamt', 'categories': kwb('C'), 'values': kwb('N'), 'line': {'none': True}, 'marker': {'type': 'none'},
                       'data_labels': summen_label('0.0;0.0;', 'above')})
    mak.combine(mak_ln)
    # MAK steht seit 12.84 in voller Breite in der untersten Zeile (z7); in z4 neben der Altersstruktur das Ø Alter im Verlauf
    chart_stil(mak, y_format='0.0', breite=CHART_B_VOLL, hoehe=CHART_H)
    thinkcell(mak)

    alter = wb.add_chart({'type': 'bar', 'subtype': 'percent_stacked', 'name': 'Chart 6'})
    for i, t in enumerate(['0–7 Tage', '8–30 Tage', '31–90 Tage', 'über 90 Tage']):
        col = xl_col_to_name(14 + i)
        alter.add_series({'name': t, 'categories': '=Filter!$N$15:$N$16', 'values': '=Filter!$%s$15:$%s$16' % (col, col),
                          'fill': {'color': FARBE_ALTER[i]}, 'border': {'color': WEISS, 'width': 1}, 'gap': 60,
                          'data_labels': {'value': True, 'num_format': '#,##0;#,##0;', 'font': {'name': FONT, 'size': 8, 'color': SW if i < 2 else WEISS}}})
    chart_stil(alter, y_format='0%', breite=CHART_B, hoehe=CHART_H)
    alter.set_x_axis({'visible': False, 'major_gridlines': {'visible': False}})
    alter.set_y_axis({'num_font': {'name': FONT, 'size': 9, 'color': GRAUD, 'bold': True}, 'line': {'none': True},
                      'major_gridlines': {'visible': False}, 'major_tick_mark': 'none', 'reverse': True})
    alter.set_plotarea({'border': {'none': True}, 'fill': {'none': True}, 'layout': PLOT_ALTER})
    GEOMETRIE.append({'kennung': 'Filter!$O$15:$O$16', 'art': 'balken_prozent', 'b': CHART_B, 'h': CHART_H, 'layout': PLOT_ALTER, 'gap': 60,
                      'werte': werte['alter'], 'formate': ['#,##0'] * 4, 'dunkel': 2, 'ausblenden': True})
    chart_platz(z4, 8, 'Altersstruktur des Rückstands', '="Anteil je Altersklasse am aktuellen Stichtag · nach aktivem Filter · über 90 Tage: OPAG "&FIXED(Filter!$R$15,0)&" · Verbund "&FIXED(Filter!$R$16,0)', alter)

    # Ø Alter der Vorgaenge im Verlauf (12.84): Diagrammdaten!CA/CB = Verlauf!BI/BJ (Summe der Alter / Rueckstand), 7 Perioden je Ansicht
    al = wb.add_chart({'type': 'line', 'name': 'Chart AL'})
    for col, nm_r, farbe, lage in (('CB', 'Verbund (Vorgänge)', FARBE_VERBUND, 'above'), ('CA', 'OPAG (Arbeitsgüter)', FARBE_OPAG, 'below')):
        al.add_series({'name': nm_r, 'categories': da('A'), 'values': da(col), 'line': {'color': farbe, 'width': 2.25},
                       'marker': {'type': 'circle', 'size': 7, 'fill': {'color': farbe}, 'border': {'color': WEISS}},
                       'data_labels': {'value': True, 'position': lage, 'num_format': '0.0', 'font': {**LABEL_FONT, 'color': farbe}}})
    chart_stil(al, y_format='0', breite=CHART_B, hoehe=CHART_H)
    thinkcell(al)
    chart_platz(z4, 33, '="Ø Alter der Vorgänge"&%s' % zeitraum,
                'Ø Tage seit Eingang je offenem Vorgang (Verbund) bzw. Arbeitsgut (OPAG) · nach aktivem Filter · Wochensicht: Stand Sonntag der KW', al)

    z5 = naechste_zeile(z4)
    ws.set_row(z5, 20)

    def dp(col):                      # Block D Produktivitaet: immer 7 Zeilen (Tag oder KW nach Ansicht)
        return '=Diagrammdaten!$%s$50:$%s$56' % (col, col)

    def produktivitaet(cols, name, achse_col):
        ch = wb.add_chart({'type': 'column', 'name': name})
        # Nenner in der Legende (stand bis 12.77 im Untertitel, der jetzt je Ansicht die Basis nennt)
        ch.add_series({'name': 'KV (÷ MAK Gesundheit)', 'categories': dp(achse_col), 'values': dp(cols[0]), 'fill': {'color': ROT}, 'border': {'none': True}, 'gap': 80, 'overlap': -10,
                       'data_labels': {'value': True, 'position': 'inside_end', 'num_format': '0.0', 'font': {**LABEL_FONT, 'color': WEISS}}})
        ch.add_series({'name': 'Komposit/Leben (÷ MAK Komposit)', 'categories': dp(achse_col), 'values': dp(cols[1]), 'fill': {'color': TEAL}, 'border': {'none': True},
                       'data_labels': {'value': True, 'position': 'inside_end', 'num_format': '0.0', 'font': {**LABEL_FONT, 'color': WEISS}}})
        ln = wb.add_chart({'type': 'line'})
        ln.add_series({'name': 'Gesamt (÷ MAK gesamt)', 'categories': dp(achse_col), 'values': dp(cols[2]), 'line': {'color': SW, 'width': 2.25},
                       'marker': {'type': 'circle', 'size': 7, 'fill': {'color': SW}, 'border': {'color': WEISS}},
                       'data_labels': {'value': True, 'position': 'above', 'num_format': '0.0', 'font': {**LABEL_FONT, 'color': SW}}})
        ch.combine(ln)
        chart_stil(ch, y_format='0.0', breite=CHART_B, hoehe=CHART_H)
        thinkcell(ch)
        return ch
    je = 'IF(Filter!$L$9="Woche"," · Abgänge je MAK und KW · letzte 7 KW",IF(Filter!$L$9="KW"," · Abgänge je MAK und Tag"&%s," · Abgänge je MAK und Tag · letzte 7 Stichtage"))' % kw_text
    # Reihenfolge und Kopffarben wie beim Rueckstand oben: OPAG links (rot), Verbund rechts (petrol)
    # Untertitel je Ansicht aus Filter (PROD_ZEILEN['untertitel'], P = OPAG, O = Verbund): Wochensicht „Abgänge der KW ÷ Ø MAK ihrer
    # Arbeitstage“ und die laufende KW („KW 41 läuft: bisher 2 Arbeitstage“), Tagessicht/Aktuelle KW das Mittel der Gesamt-Punkte
    # Mo–Fr ohne Feiertage mit Basis (= Wert der Kachel bzw. der OPAG-Zeile der Kachel)
    chart_platz(z5, 8, '="Produktivität je Arbeitsgut (OPAG)"&%s' % je, '=Filter!$P$%d' % PROD_ZEILEN['untertitel'],
                produktivitaet(['F', 'G', 'H'], 'Chart 8', 'I'), FARBE_OPAG)
    chart_platz(z5, 33, '="Produktivität je Vorgang (Verbund)"&%s' % je, '=Filter!$O$%d' % PROD_ZEILEN['untertitel'],
                produktivitaet(['C', 'D', 'E'], 'Chart 7', 'J'), FARBE_VERBUND)
    z6 = naechste_zeile(z5)
    ws.set_row(z6, 20)
    pk = wb.add_chart({'type': 'bar', 'name': 'Chart 9'})
    pk_end = 4 + ber['n_pk']
    pk.add_series({'name': 'Verbund', 'categories': '=Filter!$B$5:$B$%d' % pk_end, 'values': '=Filter!$D$5:$D$%d' % pk_end, 'fill': {'color': TEALD}, 'border': {'none': True}, 'gap': 40,
                   'data_labels': {'value': True, 'num_format': '#,##0', 'font': {'name': FONT, 'size': 8, 'color': GRAUD}}})
    pk.add_series({'name': 'OPAG', 'categories': '=Filter!$B$5:$B$%d' % pk_end, 'values': '=Filter!$E$5:$E$%d' % pk_end, 'fill': {'color': TEALL}, 'border': {'none': True}})
    chart_stil(pk, breite=CHART_B, hoehe=CHART_H)
    pk.set_x_axis({'num_font': {'name': FONT, 'size': 8, 'color': GRAU}, 'num_format': '#,##0', 'line': {'none': True}, 'major_tick_mark': 'none',
                   'major_gridlines': {'visible': True, 'line': {'color': GRAUXL, 'width': 0.75}}})
    pk.set_y_axis({'num_font': {'name': FONT, 'size': 8, 'color': GRAUD}, 'line': {'none': True}, 'major_tick_mark': 'none', 'reverse': True,
                   'major_gridlines': {'visible': False}})
    chart_platz(z6, 8, 'Rückstand je Themenpostkorb', 'aktueller Stichtag, ohne Filter · zeigt, was die Chips links ein- oder ausschließen', pk)
    vh = wb.add_chart({'type': 'column', 'name': 'Chart VH'})
    for c, sp in enumerate(['Komposit', 'Leben', 'KV']):
        vh.add_series({'name': sp, 'categories': da('A'), 'values': da(xl_col_to_name(38 + c)), 'fill': {'color': FARBE_SPARTE[sp]}, 'border': {'none': True},
                       'gap': 80, 'overlap': -10,
                       'data_labels': {'value': True, 'position': 'inside_end', 'num_format': '0.0', 'font': {**LABEL_FONT, 'color': WEISS}}})
    vh_ln = wb.add_chart({'type': 'line'})
    vh_ln.add_series({'name': 'Gesamt', 'categories': da('A'), 'values': da('AP'), 'line': {'color': SW, 'width': 2.25},
                      'marker': {'type': 'circle', 'size': 7, 'fill': {'color': SW}, 'border': {'color': WEISS}},
                      'data_labels': {'value': True, 'position': 'above', 'num_format': '0.00', 'font': {**LABEL_FONT, 'color': SW}}})
    vh_ln.add_series({'name': '=Diagrammdaten!$AR$4', 'categories': da('A'), 'values': da('AQ'), 'marker': {'type': 'none'},
                      'line': {'color': GRAUD, 'width': 1.5, 'dash_type': 'dash'}})      # Wert steht in der Legende
    vh.combine(vh_ln)
    chart_stil(vh, y_format='0.0', breite=CHART_B, hoehe=CHART_H)
    thinkcell(vh)
    chart_platz(z6, 33, '="Verhältnis Verbund zu OPAG"&%s' % zeitraum,
                'OPAG-Arbeitsgüter je Verbund-Vorgang im Rückstand (z. B. 2,15 = 1 Vorgang : 2,15 Arbeitsgüter) · je Sparte als Säule, gesamt als Linie · nach aktivem Filter',
                vh)
    ws.write_formula(z6 + 1, 33, '=IF(Diagrammdaten!$AR$5="","OPAG-Arbeitsgüter je Verbund-Vorgang im Rückstand · je Sparte als Säule, gesamt als Linie, gestrichelt Ø 14 Tage",'
                                 '"Arbeitsgüter je Vorgang · "&Diagrammdaten!$AR$5)', kopf_fmt[FARBE_NEUTRAL][1])
    z7 = naechste_zeile(z6)
    ws.set_row(z7, 20)
    chart_platz(z7, 8, 'Kapazität je Kalenderwoche (MAK)', 'BÜ-MAK laut Kalender (Ø Mo–Fr) · Gesundheit und Komposit/Leben · letzte 7 KW bis zur KW des letzten Stichtags',
                mak, voll=True)
    ws.merge_range(z7 + 19, 8, z7 + 19, 57, '', st.hinweis)
    ws.write_formula(z7 + 19, 8, '=IF(Filter!$O$21<>"",Filter!$O$21,"Diagramme aktualisieren sich mit jeder Änderung der Filter. „Neue Daten laden“ ergänzt Stichtage; ein Stichtag wird je Quelle einmal geladen, ein neuer Abzug zum selben Tag ersetzt ihn auf Nachfrage. '
                                 'Leere Slots rechts oder links bleiben frei, bis Stichtage bzw. Kalenderwochen vorliegen.")', st.hinweis)

    # Schaltflaechen als Textfelder (Makro wird nach dem Schreiben in der Zeichnung eingetragen)
    for (zr, zc, text, makro, farbe, breite, hoehe, nm, schrift, fett, links, yoff) in knoepfe:
        if farbe is None:                  # durchsichtige Flaeche ueber einer Kachel, Hinweis oben rechts
            ws.insert_textbox(zr, zc, text, {'width': breite, 'height': hoehe, 'x_offset': 1, 'y_offset': yoff, 'object_position': 3,
                                             'fill': {'color': WEISS, 'transparency': 100}, 'line': {'none': True},   # ohne Fuellung nicht klickbar
                                             'font': {'name': FONT, 'size': 7.5, 'bold': fett, 'color': schrift},
                                             'align': {'vertical': 'top', 'horizontal': 'right'}})
            continue
        ws.insert_textbox(zr, zc, text, {'width': breite, 'height': hoehe, 'x_offset': 2 if zc == 1 else 4, 'y_offset': yoff, 'object_position': 3,
                                         'fill': {'color': farbe}, 'line': ({'color': GRAUL, 'width': 0.75} if farbe == WEISS else {'color': WEISS, 'width': 1} if nm.startswith(('BWQ_', 'BWS_')) else {'none': True}),
                                         'font': {'name': FONT, 'size': 8.5 if links else 9, 'bold': fett, 'color': schrift},
                                         'align': {'vertical': 'middle', 'horizontal': 'left' if links else 'center'}})
    ws.set_landscape()
    ws.set_paper(8)                 # A3
    ws.fit_to_pages(1, 1)
    ws.print_area(0, 0, z7 + 20, 58)
    ws.set_margins(0.3, 0.3, 0.3, 0.3)
    ws.activate()
    ws.set_first_sheet()
    global KNOEPFE_LISTEN, WS_COCKPIT
    KNOEPFE_LISTEN, WS_COCKPIT = [knoepfe, KNOEPFE_PLANUNG], ws


# ------------------------------------------------------------------ Werte fuer die Etikettengeometrie (gleiche Filter wie die Vorbelegung: aktive Postkoerbe, alle GeVo)
def cockpit_werte(fakten, stichtage):
    aktiv = [z for z in fakten if z[4] in POSTKOERBE_AKTIV]
    tage = sorted(stichtage)
    slots = [None] * (7 - min(7, len(tage))) + tage[-7:]
    sparten = ['Komposit', 'Leben', 'KV']

    def summe(tag, q, sp, feld):
        return sum(z[feld] for z in aktiv if z[0] == tag and z[1] == q and z[2] == sp)
    rueck, alter = {}, []
    # Kachel Eingaenge/Abgaenge (Voreinstellung Verbund, Tagessicht): je Zeile und Slot (Eingaenge, Abgaenge) oder None
    bw = [[(sum(z[9] for z in aktiv if z[0] == t and z[1] == 'Verbund' and (name == 'Gesamt' or z[2] == name)),
            sum(z[10] for z in aktiv if z[0] == t and z[1] == 'Verbund' and (name == 'Gesamt' or z[2] == name))) if t else None
           for t in slots] for name in BW_ZEILEN]
    for q in ('OPAG', 'Verbund'):
        rueck[q] = [[summe(t, q, sp, 8) for sp in sparten] if t else None for t in slots]
        if tage:
            alter.append([sum(z[11 + k] for z in aktiv if z[0] == tage[-1] and z[1] == q) for k in range(4)])
        else:
            alter.append([0, 0, 0, 0])
    return {'rueckstand': rueck, 'alter': alter, 'bw': bw, 'kw_letzte': tage[-1].isocalendar()[1] if tage else 0}


# ------------------------------------------------------------------ Etiketten schmaler Segmente neben die Saeule (think-cell-Art) – Zustand beim Bau; in Excel setzt modCockpit.EtikettenAuslagern nach
LABEL_H = 13.0            # Hoehe eines Etiketts in Pixel (8 pt fett)
LABEL_ABSTAND = 5.0       # Abstand Etikett - Saeule


def label_breite(text):
    return 4 + 5.6 * len(text)


def zahl_text(v, fmt):
    if fmt.endswith(','):                                   # Tausender-Skalierung ("#,##0.0,")
        return '{:.1f}'.format(abs(v) / 1000.0).replace('.', ',')
    s = '{:,.0f}'.format(abs(v)).replace(',', '.')
    if fmt.startswith('+'):
        return ('+' if v > 0 else '-' if v < 0 else '±') + s
    return s


def etiketten_saeulen(g):
    """Liefert je (Reihe, Punkt) den Versatz (dx, dy) als Anteil der Diagrammflaeche fuer Segmente, in die das Etikett nicht passt."""
    b, h, lo = g['b'], g['h'], g['layout']
    x0, y0, pw, ph = b * lo['x'], h * lo['y'], b * lo['width'], h * lo['height']
    werte = g['werte']
    n = len(werte)
    ymin, ymax = g['ymin'], g['ymax']
    if ymax <= ymin:
        return []
    px = lambda v: y0 + ph * (ymax - v) / (ymax - ymin)  # noqa: E731
    label_h, zeichen = g.get('label_h', LABEL_H), g.get('zeichen', 5.6)
    kat_b = pw / n
    col_b = kat_b / (1 + g['gap'] / 100.0)
    aus = []
    for i, zeile in enumerate(werte):
        if not zeile:
            continue
        xm = x0 + kat_b * (i + 0.5)
        oben, unten = 0.0, 0.0
        links = (i < n - 1) and not g.get('rechts')   # letzte Saeule: rechts beginnen, dort ist der Rand frei; 'rechts': immer rechts
        letzte = {'L': None, 'R': None}
        for s, v in enumerate(zeile):
            if v is None or v == 0:
                continue
            if v > 0:
                y_a, y_b = px(oben + v), px(oben)
                oben += v
            else:
                y_a, y_b = px(unten), px(unten + v)
                unten += v
            seg_h = y_b - y_a
            text = zahl_text(v, g['formate'][s])
            lw = 4 + zeichen * len(text)
            if seg_h >= label_h + 1 and col_b >= lw + 2:
                continue
            ym = (y_a + y_b) / 2
            seite = 'L' if links else 'R'
            links = not links and not g.get('rechts')
            abstand = g.get('abstand', LABEL_ABSTAND)
            if seite == 'L':
                xl = xm - col_b / 2 - abstand - lw / 2
            else:
                xl = xm + col_b / 2 + abstand + lw / 2
            letzte.setdefault(seite + '_liste', []).append([ym, s, xl, (y_a + y_b) / 2])
        # je Seite erst alle Etiketten sammeln, dann von oben nach unten ohne Ueberlappung stapeln (bisher nur gegen das
        # zuletzt gesetzte geprueft – mehrere kleine Segmente uebereinander lagen dann aufeinander)
        for seite in ('L', 'R'):
            liste = sorted(letzte.get(seite + '_liste', []))
            for k in range(1, len(liste)):
                if liste[k][0] < liste[k - 1][0] + label_h + 1:
                    liste[k][0] = liste[k - 1][0] + label_h + 1
            for ym, s, xl, ymitte in liste:
                aus.append((s, i, (xl - xm) / b, (ym - ymitte) / h))
    return aus


def etiketten_balken_prozent(g):
    """Prozent-gestapelte Balken (Altersstruktur): zu schmale Segmente bekommen ihr Etikett ueber den Balken."""
    b, h, lo = g['b'], g['h'], g['layout']
    x0, y0, pw, ph = b * lo['x'], h * lo['y'], b * lo['width'], h * lo['height']
    werte = g['werte']
    n = len(werte)
    kat_h = ph / n
    bal_h = kat_h / (1 + g['gap'] / 100.0)
    aus = []
    for i, zeile in enumerate(werte):          # Kategorie 0 steht oben (Achse umgekehrt)
        tot = float(sum(zeile)) or 1.0
        x = x0
        ym = y0 + kat_h * (i + 0.5)
        letzte = None
        for s, v in enumerate(zeile):
            w = pw * v / tot
            xm = x + w / 2
            x += w
            if v == 0:
                continue
            lw = label_breite(zahl_text(v, g['formate'][s]))
            if w >= lw + 2:
                continue
            if s == len(zeile) - 1:            # letztes Segment (über 90 Tage): Wert rechts neben dem Balkenende
                aus.append((s, i, (x0 + pw + 4 + lw / 2 - xm) / b, 0.0))
                continue
            xl = xm
            if letzte is not None and abs(xl - letzte) < lw + 2:
                xl = letzte + lw + 2
            letzte = xl
            aus.append((s, i, (xl - xm) / b, (-(bal_h / 2) - LABEL_H / 2 - 3) / h))
    return aus


def etiketten_eintragen(text, g):
    """Traegt fuer ein Diagramm-XML die versetzten Etiketten und die Fuehrungslinien ein."""
    versatz = etiketten_saeulen(g) if g['art'] == 'saeulen' else etiketten_balken_prozent(g)
    print('Etiketten neben der Säule:', g.get('datei'), [(s_, i_) for s_, i_, _dx, _dy in versatz])
    if not versatz:
        return text
    teile = re.split(r'(?=<c:ser>)', text)
    je_reihe = {}
    for s, i, dx, dy in versatz:
        je_reihe.setdefault(s, []).append((i, dx, dy))
    ext = ('<c:extLst><c:ext uri="{CE6537A1-D6FC-4f65-9D91-7224C49458BB}" xmlns:c15="http://schemas.microsoft.com/office/drawing/2012/chart">'
           '<c15:showLeaderLines val="1"/><c15:leaderLines><c:spPr><a:ln w="6350" cap="flat"><a:solidFill><a:srgbClr val="9AA3AD"/></a:solidFill></a:ln></c:spPr></c15:leaderLines>'
           '</c:ext></c:extLst>')
    reihe = 0
    for k, teil in enumerate(teile):
        if not teil.startswith('<c:ser>'):
            continue
        if reihe in je_reihe:
            m = re.search(r'<c:dLbls>(.*?)</c:dLbls>', teil, re.S)
            if m:
                inhalt = m.group(1)
                numfmt = re.search(r'<c:numFmt [^>]*/>', inhalt)
                txpr = re.search(r'<c:txPr>.*?</c:txPr>', inhalt, re.S)
                dunkel = g.get('dunkel', 0)
                lbls = ''
                letzte_reihe = g['art'] == 'balken_prozent' and reihe == len(g['formate']) - 1
                if g.get('ausblenden') and not letzte_reihe:   # kleine Diagramme: Etikett weglassen statt mit Linie daneben
                    lbls = ''.join('<c:dLbl><c:idx val="%d"/><c:delete val="1"/></c:dLbl>' % i for i, _dx, _dy in je_reihe[reihe])
                    neu = '<c:dLbls>' + lbls + inhalt + '</c:dLbls>'
                    teile[k] = teil[:m.start()] + neu + teil[m.end():]
                    reihe += 1
                    continue
                for i, dx, dy in je_reihe[reihe]:
                    tx = txpr.group(0) if txpr else ''
                    if reihe >= dunkel or g['art'] == 'saeulen':
                        tx = re.sub(r'<a:srgbClr val="[0-9A-Fa-f]{6}"/>', '<a:srgbClr val="4A4A4A"/>', tx)
                    grund = '<a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>' if g.get('hinterlegt') else '<a:noFill/>'
                    lbls += ('<c:dLbl><c:idx val="%d"/><c:layout><c:manualLayout><c:x val="%.5f"/><c:y val="%.5f"/></c:manualLayout></c:layout>%s<c:spPr>%s<a:ln><a:noFill/></a:ln></c:spPr>%s'
                             '<c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbl>'
                             % (i, dx, dy, numfmt.group(0) if numfmt else '', grund, tx))
                neu = '<c:dLbls>' + lbls + inhalt + ext + '</c:dLbls>'
                teil = teil[:m.start()] + neu + teil[m.end():]
                teile[k] = teil
        reihe += 1
    return ''.join(teile)


# ------------------------------------------------------------------ Anwesenheitstool: Mitarbeiter (Arbeitszeitmodell), Kalender (je Tag), Wirksam (berechnet, versteckt)
MA_ZEILEN = 60            # reservierte Mitarbeiterzeilen
MA_START = 5              # erste Datenzeile im Blatt Mitarbeiter (1-basiert)
PL_START = 7              # erste Mitarbeiterzeile in Kalender/Wirksam (1-basiert); Kopf: 4 Monat, 5 KW, 6 Tag (Wirksam: 5 Datum, 6 KW-Schluessel)
PL_SPALTE0 = 3            # erste Tagesspalte im Kalender (0-basiert: D)
KAL_BIS = dt.date(2028, 12, 31)                 # Kalender: Mo-Sa ab Montag der ersten KW bis Ende 2028 (Samstag zaehlt nur mit Eintrag)
KAL_SUMME = PL_START + 60 + 1                   # Excel-Zeile der Summenzeile „MAK Gesundheit (KV)“ unter dem Kalender (Komposit +1, gesamt +2)


def ostersonntag(j):
    a, b, c = j % 19, j // 100, j % 100
    d, e = b // 4, b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = c // 4, c % 4
    l_ = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l_) // 451
    monat = (h + l_ - 7 * m + 114) // 31
    tag = (h + l_ - 7 * m + 114) % 31 + 1
    return dt.date(j, monat, tag)


def feiertage_nrw(jahre):
    """Gesetzliche Feiertage bundesweit plus NRW (Fronleichnam, Allerheiligen) – Standort Duesseldorf."""
    liste = []
    for j in jahre:
        o = ostersonntag(j)
        liste += [(dt.date(j, 1, 1), 'Neujahr'), (o - dt.timedelta(days=2), 'Karfreitag'), (o + dt.timedelta(days=1), 'Ostermontag'),
                  (dt.date(j, 5, 1), 'Tag der Arbeit'), (o + dt.timedelta(days=39), 'Christi Himmelfahrt'), (o + dt.timedelta(days=50), 'Pfingstmontag'),
                  (o + dt.timedelta(days=60), 'Fronleichnam'), (dt.date(j, 10, 3), 'Tag der Deutschen Einheit'), (dt.date(j, 11, 1), 'Allerheiligen'),
                  (dt.date(j, 12, 25), '1. Weihnachtstag'), (dt.date(j, 12, 26), '2. Weihnachtstag')]
    return sorted(liste)


FEIERTAGE = feiertage_nrw((2026, 2027, 2028))


def kalender_tage(kw_liste):
    d = montag(*kw_liste[0]) if kw_liste else dt.date(2026, 7, 20)
    tage = []
    while d <= KAL_BIS:
        if d.weekday() < 6:
            tage.append(d)
        d += dt.timedelta(days=1)
    return tage
MONATE_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']


def montag(jahr, kw):
    d = dt.date(jahr, 1, 4)
    d = d - dt.timedelta(days=d.isoweekday() - 1)
    return d + dt.timedelta(weeks=kw - 1)


def wochenwerte_blatt(wb, ws, st, kw_liste, block):
    """Nachschlagetabelle fuer andere Berichte: je KW eine Spalte (Schluessel Jahr*100+KW in Zeile 4), je Kennzahl eine Zeile
    (Schluessel in Spalte B). Werte nach den im Cockpit gewaehlten Themenpostkoerben (PK_Aktiv); GeVo- und Sparten-Chips wirken
    nicht (die Sparten stehen als eigene Zeilen). Rueckstand zum letzten Stichtag der KW mit Stand der Quelle, Bewegungen als Summe der KW."""
    n = len(kw_liste)
    c_end = 2 + n - 1
    ende = xl_col_to_name(c_end)
    ws.set_column('A:A', 46)
    ws.set_column('B:B', 26)
    ws.set_column(2, c_end, 10.5)
    ws.write('A1', 'Wochenwerte zum Nachschlagen (XVERWEIS / INDEX-VERGLEICH)', st.titel)
    ws.write('A2', 'Kalenderwochen in Spalten (Zeile 4: Schlüssel Jahr*100+KW, z. B. 202639; Zeile 6: Montag der KW), Kennzahlen in Zeilen (Spalte B: Schlüssel) · Details als Notiz am Titel', st.untertitel)
    ws.write_comment('A1', 'Werte nach den im Cockpit gewählten Themenpostkörben (GeVo- und Sparten-Chips wirken hier nicht). Der Block „Standard für den Report“ '
                           'rechnet fest mit der Standard-Auswahl aus Konfiguration H:L (Themenpostkörbe und GeVo-Typen mit „ja“), unabhängig von den Chips. '
                           'Rückstand = letzter Stichtag der KW mit Stand der Quelle; Eingänge und Abgänge = Summe der Stichtage der KW.',
                     {'author': 'BÜ-Reporting', 'x_scale': 3, 'y_scale': 1.6, 'font_name': FONT, 'font_size': 9})
    f_bsp = wb.add_format({'font_name': 'Consolas', 'font_size': 8.5, 'font_color': GRAUD})
    ws.write('A3', 'Beispielformeln zum Nachschlagen stehen unter der Tabelle.', wb.add_format({'font_name': FONT, 'font_size': 9, 'italic': True, 'font_color': GRAU}))
    f_key = wb.add_format({'font_name': FONT, 'font_size': 9, 'bold': True, 'font_color': WEISS, 'bg_color': GRAUD, 'align': 'center', 'num_format': '0'})
    f_lab = wb.add_format({'font_name': FONT, 'font_size': 9, 'bold': True, 'font_color': GRAUD, 'bg_color': GRAUXL, 'align': 'center'})
    f_dat = wb.add_format({'font_name': FONT, 'font_size': 8, 'font_color': GRAU, 'num_format': 'dd.mm.yyyy', 'align': 'center'})
    f_abs = st.band
    f_txt = wb.add_format({'font_name': FONT, 'font_size': 9, 'font_color': SW, 'bottom': 1, 'bottom_color': GRAUXL})
    f_code = wb.add_format({'font_name': 'Consolas', 'font_size': 8, 'font_color': GRAU, 'bottom': 1, 'bottom_color': GRAUXL})
    f_zahl = wb.add_format({'font_name': FONT, 'font_size': 9, 'num_format': '#,##0', 'bottom': 1, 'bottom_color': GRAUXL})
    f_fett = wb.add_format({'font_name': FONT, 'font_size': 9, 'bold': True, 'num_format': '#,##0', 'bottom': 1, 'bottom_color': GRAUXL})
    f_mo = wb.add_format({'font_name': FONT, 'font_size': 9, 'bold': True, 'font_color': GRAUD, 'num_format': 'dd.mm.yyyy', 'align': 'center', 'bg_color': GRAUXL,
                          'bottom': 1, 'bottom_color': GRAUD})
    kopf = [(3, 'KW-Schlüssel (Jahr*100+KW)', 'KW_SCHLUESSEL', f_key), (4, 'Kalenderwoche', 'KW', f_lab), (5, 'Montag der KW (Berichtsdatum)', 'MONTAG', f_mo),
            (6, 'letzter Stichtag mit OPAG-Stand', 'STICHTAG_OPAG', f_dat), (7, 'letzter Stichtag mit Verbund-Stand', 'STICHTAG_VERBUND', f_dat)]
    for r, t, k, f in kopf:
        ws.write(r, 0, t, f_txt)
        ws.write(r, 1, k, f_code)
    zeilen = []                                   # (Zeile 0-basiert, Text, Schluessel, Art, Quelle, Sparte)
    r = 9
    for q, einheit in (('OPAG', 'Arbeitsgüter'), ('Verbund', 'Vorgänge')):
        ws.merge_range(r, 0, r, 1, 'Rückstand %s (%s) zum letzten Stichtag der KW' % (q, einheit), st.band_opag if q == 'OPAG' else st.band_verbund)
        r += 1
        for sp in ('Komposit', 'Leben', 'KV', 'Sonstige', None):
            zeilen.append((r, '%s Rückstand %s' % (q, sp or 'gesamt'), '%s_RUECK_%s' % (q.upper(), (sp or 'gesamt').upper()), 'rueck', q, sp))
            r += 1
        r += 1
    ws.merge_range(r, 0, r, 1, 'Bewegungen der KW (Summe der Stichtage der KW)', f_abs)
    r += 1
    for q in ('OPAG', 'Verbund'):
        for art, nm, kurz in (('Eingänge', 'F_Eingang', 'EIN'), ('Abgänge', 'F_Abgang', 'ABG')):
            zeilen.append((r, '%s %s' % (q, art), '%s_%s' % (q.upper(), kurz), nm, q, None))
            r += 1
    r += 1
    # je Sparte (Grundlage der Zeilen Zugaenge/Abgaenge im Rohdatenblatt)
    ws.merge_range(r, 0, r, 1, 'Bewegungen der KW je Sparte', f_abs)
    r += 1
    for q in ('OPAG', 'Verbund'):
        for art, nm, kurz in (('Eingänge', 'F_Eingang', 'EIN'), ('Abgänge', 'F_Abgang', 'ABG')):
            for sp in ('Komposit', 'Leben', 'KV', 'Sonstige'):
                zeilen.append((r, '%s %s %s' % (q, art, sp), '%s_%s_%s' % (q.upper(), kurz, sp.upper()), nm, q, sp))
                r += 1
    r += 1
    # Standard fuer den Wochenreport (Blatt Rohdatenblatt): Standard-Auswahl der Konfiguration (Themenpostkoerbe und GeVo-Typen
    # mit „ja“, Fakten!Q), alle Sparten – unabhaengig von den Chips im Cockpit. Schluessel mit Praefix STD_.
    ws.merge_range(r, 0, r, 1, 'Standard für den Report (Standard-Auswahl in Konfiguration, unabhängig von den Chips)', f_abs)
    r += 1
    for q in ('Verbund', 'OPAG'):
        for art, nm, kurz in (('Rückstand', 'rueck', 'RUECK'), ('Eingänge', 'F_Eingang', 'EIN'), ('Abgänge', 'F_Abgang', 'ABG')):
            for sp in (None, 'KV', 'Komposit', 'Leben'):
                schl = 'STD_%s_%s' % (q.upper(), kurz) + ('_%s' % sp.upper() if sp else ('_GESAMT' if kurz == 'RUECK' else ''))
                zeilen.append((r, 'Standard: %s %s %s' % (q, art, sp or 'gesamt'), schl, nm, q, sp))
                r += 1
    r += 1
    beispiele = [('Beispiele (deutsches Excel, Semikolon als Trenner):', None),
                 ('OPAG Rückstand gesamt in KW 39/26:', '=XVERWEIS(202639;Wochenwerte!$C$4:$%s$4;Wochenwerte!$C$15:$%s$15)' % (ende, ende)),
                 ('dasselbe über den Montag der KW:', '=XVERWEIS(DATUM(2026;9;21);Wochenwerte!$C$6:$%s$6;Wochenwerte!$C$15:$%s$15)' % (ende, ende)),
                 ('Kennzahl per Schlüssel (zweidimensional):', '=INDEX(Wochenwerte!$C$11:$%s$28;VERGLEICH("OPAG_RUECK_GESAMT";Wochenwerte!$B$11:$B$28;0);VERGLEICH(202639;Wochenwerte!$C$4:$%s$4;0))' % (ende, ende)),
                 ('ohne XVERWEIS (ältere Excel-Versionen):', '=WVERWEIS(202639;Wochenwerte!$C$4:$%s$28;12;FALSCH)   (12 = Zeile 15 minus Zeile 4 plus 1)' % ende)]
    for t, bsp in beispiele:
        ws.write(r, 0, t, wb.add_format({'font_name': FONT, 'font_size': 9, 'bold': bsp is None, 'font_color': GRAUD}))
        if bsp:
            ws.write_string(r, 1, bsp, f_bsp)
        r += 1
    hilfe = r + 2                                  # Hilfszeilen: Fakten-Positionen der Stichtage bzw. der KW
    ws.write(hilfe - 1, 0, 'Hilfszeilen (Fakten-Positionen) – nicht nachschlagen', st.hinweis)
    for k, t in enumerate(['erste Fakten-Zeile OPAG-Stichtag', 'letzte Fakten-Zeile OPAG-Stichtag', 'erste Fakten-Zeile Verbund-Stichtag',
                           'letzte Fakten-Zeile Verbund-Stichtag', 'erste Fakten-Zeile der KW', 'letzte Fakten-Zeile der KW']):
        ws.write(hilfe + k, 0, t, st.hinweis)
    for i in range(n):
        c = 2 + i
        col = xl_col_to_name(c)
        kr = 6 + i                                 # Zeile im Blatt KW (1-basiert)
        ws.write_formula(3, c, '=KW!$W$%d' % kr, f_key)
        ws.write_formula(4, c, '=KW!$C$%d' % kr, f_lab)
        ws.write_formula(5, c, '=DATE(KW!$A$%d,1,4)-WEEKDAY(DATE(KW!$A$%d,1,4),2)+1+(KW!$B$%d-1)*7' % (kr, kr, kr), f_mo)   # Montag der ISO-KW
        ws.write_formula(6, c, '=KW!$AS$%d' % kr, f_dat)
        ws.write_formula(7, c, '=KW!$AT$%d' % kr, f_dat)
        for k, (datum, spalte) in enumerate((('7', 'AL'), ('7', 'AM'), ('8', 'AL'), ('8', 'AM'))):
            ws.write_formula(hilfe + k, c, '=IF(%s$%s="","",INDEX(Verlauf!$%s$6:$%s$%d,MATCH(%s$%s,Verlauf!$A$6:$A$%d,0)))'
                             % (col, datum, spalte, spalte, MAX_VERLAUF, col, datum, MAX_VERLAUF), st.hinweis)
        krit = 'Verlauf!$B$6:$B$%d,KW!$A$%d,Verlauf!$C$6:$C$%d,KW!$B$%d' % (MAX_VERLAUF, kr, MAX_VERLAUF, kr)
        ws.write_formula(hilfe + 4, c, '=IF(KW!$U$%d=0,"",MINIFS(Verlauf!$AL$6:$AL$%d,%s))' % (kr, MAX_VERLAUF, krit), st.hinweis)
        ws.write_formula(hilfe + 5, c, '=IF(KW!$U$%d=0,"",MAXIFS(Verlauf!$AM$6:$AM$%d,%s))' % (kr, MAX_VERLAUF, krit), st.hinweis)
        for (zr, text, schl, art, q, sp) in zeilen:
            if art == 'rueck':
                d = '%s$%d' % (col, 7 if q == 'OPAG' else 8)
                h0 = '%s$%d' % (col, hilfe + (1 if q == 'OPAG' else 3))
                h1 = '%s$%d' % (col, hilfe + (2 if q == 'OPAG' else 4))
                bk = lambda nm: block(nm, h0, h1)  # noqa: E731
                sp_krit = ',%s,"%s"' % (bk('F_Sparte'), sp) if sp else ''
                if schl.startswith('STD_'):
                    f = '=IF(%s="","",SUMIFS(%s,%s,%s,%s,"%s"%s,%s,1))' % (d, bk('F_Rueckstand'), bk('F_Stichtag'), d, bk('F_Quelle'), q, sp_krit, bk('F_Std'))
                else:
                    f = '=IF(%s="","",SUMPRODUCT(SUMIFS(%s,%s,%s,%s,"%s"%s,%s,PK_Liste)*(PK_Aktiv=TRUE)))' % (
                        d, bk('F_Rueckstand'), bk('F_Stichtag'), d, bk('F_Quelle'), q, sp_krit, bk('F_Postkorb'))
            else:
                h0, h1 = '%s$%d' % (col, hilfe + 5), '%s$%d' % (col, hilfe + 6)
                stand = '%s$%d' % (col, 7 if q == 'OPAG' else 8)     # letzter Stichtag der Quelle in der KW (leer = kein Stand)
                sp_krit = ',%s,"%s"' % (block('F_Sparte', h0, h1), sp) if sp else ''
                # Umbuchungen der KW (Montag bis Sonntag) in die Auswahl hinein (Eingang) bzw. hinaus (Abgang)
                ein = art == 'F_Eingang'
                heute, vor = ('U_HeuteStd', 'U_VorStd') if schl.startswith('STD_') else ('U_HeutePK', 'U_VorPK')
                mo = '%s$6' % col
                umb = '+SUMIFS(U_Anzahl,U_Quelle,"%s"%s,U_Stichtag,">="&%s,U_Stichtag,"<="&(%s+6),%s,%d,%s,%d)' % (
                    q, ',U_Sparte,"%s"' % sp if sp else '', mo, mo, heute, 1 if ein else 0, vor, 0 if ein else 1)
                if schl.startswith('STD_'):
                    f = '=IF(OR(%s="",%s=""),"",SUMIFS(%s,%s,"%s"%s,%s,1)%s)' % (h0, stand, block(art, h0, h1), block('F_Quelle', h0, h1), q, sp_krit, block('F_Std', h0, h1), umb)
                else:
                    f = '=IF(OR(%s="",%s=""),"",SUMPRODUCT(SUMIFS(%s,%s,"%s"%s,%s,PK_Liste)*(PK_Aktiv=TRUE))%s)' % (
                        h0, stand, block(art, h0, h1), block('F_Quelle', h0, h1), q, sp_krit, block('F_Postkorb', h0, h1), umb)
            ws.write_formula(zr, c, f, f_fett if sp is None and (art == 'rueck' or schl.startswith('STD_')) else f_zahl)
    for (zr, text, schl, art, q, sp) in zeilen:
        ws.write(zr, 0, text, f_txt)
        ws.write(zr, 1, schl, f_code)
    ws.freeze_panes(6, 2)
    # Schluessel -> Zeile (1-basiert), auch die Kopfzeilen (STICHTAG_OPAG/STICHTAG_VERBUND fuer den Stand im Rohdatenblatt)
    return {**{k: r + 1 for r, t, k, f in kopf}, **{schl: zr + 1 for (zr, text, schl, art, q, sp) in zeilen}}, ende


# ------------------------------------------------------------------ Rohdatenblatt: Nachbau des Wochenreports (Zeilen und Spalten 1:1)
RB_ZUORDNUNG = {                      # Zeile im Wochenreport -> Schluessel im Blatt Wochenwerte
    67: 'VERBUND_RUECK_GESAMT', 68: 'VERBUND_RUECK_KV', 69: 'VERBUND_RUECK_KOMPOSIT', 70: 'VERBUND_RUECK_LEBEN',
    71: 'VERBUND_EIN', 72: 'VERBUND_EIN_KV', 73: 'VERBUND_EIN_KOMPOSIT', 74: 'VERBUND_EIN_LEBEN',
    75: 'VERBUND_ABG', 76: 'VERBUND_ABG_KV', 77: 'VERBUND_ABG_KOMPOSIT', 78: 'VERBUND_ABG_LEBEN',
    79: 'OPAG_RUECK_GESAMT', 80: 'OPAG_RUECK_KV', 81: 'OPAG_RUECK_KOMPOSIT', 82: 'OPAG_RUECK_LEBEN',
    83: 'OPAG_EIN', 84: 'OPAG_EIN_KV', 85: 'OPAG_EIN_KOMPOSIT', 86: 'OPAG_EIN_LEBEN',
    87: 'OPAG_ABG', 88: 'OPAG_ABG_KV', 89: 'OPAG_ABG_KOMPOSIT', 90: 'OPAG_ABG_LEBEN',
}
RB_BIS = dt.date(2028, 12, 31)        # Wochenspalten ueber das Ende des Originals hinaus fortschreiben (wie der Anwesenheitsplan)
# Stand der Werte unter dem 1:1-Bereich (feste Zeilen, Vertrag mit dem HR-Sales-Dashboard, das per Zeile und Datum nachschlaegt):
# Zeile -> (Code, Quelle, Schluessel im Blatt Wochenwerte, BUe-Zeile, deren Rueckstand zu diesem Stichtag gehoert)
RB_STAND = {160: ('7VS', 'Verbund', 'STICHTAG_VERBUND', 67), 161: ('7OS', 'OPAG', 'STICHTAG_OPAG', 79)}


def rohdatenblatt(wb, ws, st, ww, ww_ende, kw_liste):
    """Wochenreport "Rohdaten" ohne Makros und ohne Fremdwerte: gleiche Zeilen (1-157) wie das Original, Wochenspalten ab I (Datum und
    Δ) erst ab Beginn des Anwesenheitsplans; der andere Report sucht die Spalte ueber das Datum in Zeile 1. Befuellt werden nur die
    BUe-Zeilen 67-90 (7VA-7OL) aus dem Blatt Wochenwerte: Offene = Rueckstand zum letzten Stichtag der KW, Zugaenge/Abgaenge =
    Summe der KW; die KW ist die ISO-Woche des Spaltendatums. Gesamt enthaelt auch die Sparte Sonstige. Unter dem Original
    (RB_STAND, Zeilen 160/161): Stand der Werte = letzter Stichtag der KW mit Verbund- bzw. OPAG-Stand."""
    import json
    struktur = json.load(open(os.path.join(HIER, 'rohdatenblatt_struktur.json'), encoding='utf-8'))
    f = lambda **k: wb.add_format({'font_name': FONT, 'font_size': 9, 'valign': 'vcenter', **k})  # noqa: E731
    f_kopf = f(bold=True, font_color=WEISS, bg_color=GRAUD, text_wrap=True, border=1, border_color=GRAU)
    f_kopf_dat = f(bold=True, font_color=WEISS, bg_color=GRAUD, num_format='dd.mm.yyyy', align='center', border=1, border_color=GRAU)
    f_kopf_d = f(bold=True, font_color=GRAUL, bg_color=GRAUD, align='center', border=1, border_color=GRAU)
    f_hilfe = f(font_size=7, font_color=GRAUM, align='center')
    f_hilfe_t = f(font_size=7, font_color=GRAUM, italic=True)
    f_lab = f(font_color=GRAU, text_wrap=True, border=1, border_color=GRAUXL)
    # BUe-Zeilen ohne Zeilenumbruch (einzeilig, gleich hoch); Spalten A und D dafuer breiter als im Original
    f_lab_bue = f(font_color=SW, bg_color=TEALT, border=1, border_color=GRAUXL)
    f_lab_bue_f = f(font_color=SW, bg_color=TEALT, bold=True, border=1, border_color=GRAUXL)
    f_lab_opag = f(font_color=SW, bg_color=ROTL, border=1, border_color=GRAUXL)          # BUe-Zeilen OPAG (7OA-7OL) im roten Ton
    f_lab_opag_f = f(font_color=SW, bg_color=ROTL, bold=True, border=1, border_color=GRAUXL)
    f_thema = f(font_color=SW, bold=True, text_wrap=True, valign='top', border=1, border_color=GRAUXL)
    f_leer = f(border=1, border_color=GRAUXL)
    f_zahl = f(num_format='#,##0', border=1, border_color=GRAUXL)
    f_zahl_f = f(num_format='#,##0', bold=True, border=1, border_color=GRAUXL)
    f_delta = f(num_format='+#,##0;-#,##0;0', font_color=GRAU, font_size=8, border=1, border_color=GRAUXL)

    # Wochenspalten ab I: nur ab der ersten KW, fuer die das Tool Werte haben kann (Beginn des Anwesenheitsplans), mit den
    # Stichtagen des Originals (meist freitags), danach woechentlich weiter bis Ende 2028. Die ZEILEN sind 1:1 wie im Original,
    # die Spalten nicht – der andere Report sucht die Spalte ueber das Datum in Zeile 1.
    beginn = montag(*kw_liste[0]) if kw_liste else dt.date(2026, 1, 1)
    daten = [dt.date.fromisoformat(d) for _c, d in struktur['daten']]
    while daten[-1] + dt.timedelta(days=7) <= RB_BIS:
        daten.append(daten[-1] + dt.timedelta(days=7))
    daten = [d for d in daten if d >= beginn]
    mindest = {'A': 6, 'D': 22, 'F': 18}             # A „7VA“, D „Verbund | Gesundheit“, F Kopf „Ältester Vorgang …“ einzeilig lesbar
    for k, b in struktur['breiten'].items():
        ws.set_column('%s:%s' % (k, k), max(b, mindest.get(k, 0)))
    for i in range(len(daten)):
        ws.set_column(8 + 2 * i, 8 + 2 * i, 12.5)    # „dd.mm.yyyy“ fett ohne ########
        ws.set_column(9 + 2 * i, 9 + 2 * i, 7.5)
    ws.set_row(0, 48)
    ws.set_row(1, 11)

    # Kopf (Zeile 1) und Hilfszeile 2: Spalte der KW im Blatt Wochenwerte (0 = keine Werte fuer diese Woche)
    for c, k in enumerate('ABCDEFGH'):
        ws.write(0, c, struktur['zeilen']['1'].get(k, {'F': 'Ältester Vorgang der offenen Vorgänge', 'G': 'Erläuterung'}.get(k, '')), f_kopf)
    ws.write(1, 7, 'Spalte in Wochenwerte', f_hilfe_t)
    for i, d in enumerate(daten):
        c = 8 + 2 * i
        col = xl_col_to_name(c)
        ws.write_datetime(0, c, dt.datetime(d.year, d.month, d.day), f_kopf_dat)
        ws.write(0, c + 1, 'Δ', f_kopf_d)
        ws.write_formula(1, c, '=IFERROR(MATCH(YEAR(%s$1-WEEKDAY(%s$1,2)+4)*100+ISOWEEKNUM(%s$1),Wochenwerte!$C$4:$%s$4,0),0)'
                         % (col, col, col, ww_ende), f_hilfe)
    ws.write_comment('A1', 'Nachbau des Wochenreports „Rohdaten“: gleiche Zeilen wie das Original (1–157), Wochenspalten erst ab Beginn des Tools, ohne Makros. '
                           'Befüllt werden nur die BÜ-Zeilen 67–90 (7VA–7OL) aus dem Blatt Wochenwerte: Offene = Rückstand zum letzten Stichtag '
                           'der Kalenderwoche des Spaltendatums, Zugänge/Abgänge = Summe dieser KW, Gesamt einschließlich Sonstige. '
                           'Werte immer mit der Standard-Auswahl (Konfiguration H:L bzw. Cockpit „Standard festlegen“): Themenpostkörbe und GeVo-Typen mit „ja“, alle Sparten – die Chips im Cockpit wirken hier nicht. Δ = nächste Woche minus diese Woche. '
                           'Der andere Report holt den Wert über Zeile und Datum, z. B. =INDEX([BUE_Reporting_Master.xlsm]Rohdatenblatt!$67:$67;VERGLEICH(JU$1;[BUE_Reporting_Master.xlsm]Rohdatenblatt!$1:$1;0)). '
                           'Unter dem Original: Zeile 160 (7VS) bzw. 161 (7OS) = Stand der Werte, d. h. der Stichtag, zu dem Zeile 67 bzw. 79 den Rückstand zeigt (letzter Verbund- bzw. OPAG-Stand der KW).',
                     {'author': 'BÜ-Reporting', 'x_scale': 3, 'y_scale': 2.5, 'font_name': FONT, 'font_size': 9})

    # verbundene Zellen des Originals (Thema in Spalte B, eine in E)
    belegt = set()
    for m in struktur['merges']:
        a, b = m.split(':')
        r0, c0 = int(re.sub(r'[A-Z]', '', a)) - 1, ord(a[0]) - 65
        r1 = int(re.sub(r'[A-Z]', '', b)) - 1
        text = struktur['zeilen'].get(str(r0 + 1), {}).get(a[0], '')
        ws.merge_range(r0, c0, r1, c0, text, f_thema if a[0] == 'B' else f_lab)
        for r in range(r0, r1 + 1):
            belegt.add((r, c0))

    letzte = max(int(z) for z in struktur['zeilen'])
    for r in range(2, letzte):
        z = struktur['zeilen'].get(str(r + 1), {})
        bue = (r + 1) in RB_ZUORDNUNG
        gesamt = bue and 'Gesamt' in z.get('C', '')
        for c, k in enumerate('ABCDEFGH'):
            if (r, c) in belegt:
                continue
            if bue and (r + 1) >= 79:
                fmt = f_lab_opag_f if gesamt else f_lab_opag
            else:
                fmt = (f_lab_bue_f if gesamt else f_lab_bue) if bue else f_lab
            if k in z:
                ws.write_string(r, c, str(z[k]), fmt)          # Nummern wie "3" als Text (linksbuendig wie "1a")
            else:
                ws.write_blank(r, c, None, fmt)
        if not bue:
            continue
        wz = ww['STD_' + RB_ZUORDNUNG[r + 1]]
        x = r + 1
        for i in range(len(daten)):
            c = 8 + 2 * i
            col, nxt = xl_col_to_name(c), xl_col_to_name(c + 2)
            ws.write_formula(r, c, '=IF(%s$2=0,"",INDEX(Wochenwerte!$C$%d:$%s$%d,%s$2))' % (col, wz, ww_ende, wz, col), f_zahl_f if gesamt else f_zahl)
            if i < len(daten) - 1:
                ws.write_formula(r, c + 1, '=IF(OR(%s%d="",%s%d=""),"",%s%d-%s%d)' % (col, x, nxt, x, nxt, x, col, x), f_delta)
            else:
                ws.write_blank(r, c + 1, None, f_delta)
    # Stand der Werte (Zeilen 160/161): dieselbe Zelle im Blatt Wochenwerte (Kopfzeile STICHTAG_VERBUND/_OPAG = KW!AT/AS), die
    # dort das Kriterium F_Stichtag der Rueckstandszeilen ist, ueber dieselbe Hilfszeile 2 (ISO-KW des Spaltendatums) wie 67-90 –
    # damit genau der Stichtag, zu dem Zeile 67 bzw. 79 den Rueckstand zeigt; leer, solange die Quelle in der KW keinen Stand hat.
    f_stand = f(num_format='dd.mm.yyyy', align='center', border=1, border_color=GRAUXL)
    for x, (code, q, schl, bezug) in RB_STAND.items():
        assert x > letzte and str(x) not in struktur['zeilen'] and RB_ZUORDNUNG.get(bezug, '') == q.upper() + '_RUECK_GESAMT'
        r = x - 1
        fmt = f_lab_opag if q == 'OPAG' else f_lab_bue
        texte = {'A': code, 'B': 'Bestandsübertragung', 'C': 'BÜ %s: Stand der Werte (letzter Stichtag der KW)' % q}
        for c, k in enumerate('ABCDEFGH'):
            if k in texte:
                ws.write_string(r, c, texte[k], fmt)
            else:
                ws.write_blank(r, c, None, fmt)      # leer, damit der Text aus C in D weiterlaeuft
        wz = ww[schl]
        for i in range(len(daten)):
            c = 8 + 2 * i
            col = xl_col_to_name(c)
            ws.write_formula(r, c, '=IF(%s$2=0,"",INDEX(Wochenwerte!$C$%d:$%s$%d,%s$2))' % (col, wz, ww_ende, wz, col), f_stand)
            ws.write_blank(r, c + 1, None, f_leer)
    # Start bei der aktuellen Woche: erste sichtbare Spalte rechts der fixierten Spalten = Vorwoche (Stand beim Bau;
    # das Blattmodul Rohdatenblatt zieht das beim ersten Aufruf je Sitzung auf das heutige Datum nach)
    heute = dt.date.today()
    akt = next((i for i, d in enumerate(daten) if d >= heute - dt.timedelta(days=6)), len(daten) - 1)
    ws.freeze_panes(2, 8, 2, 8 + 2 * max(0, akt - 1))
    ws.set_zoom(85)
    # Excel-Warnungen (Formel weicht von Nachbarn ab, Zahl als Text) im Block ausblenden – gewollt so
    ws.ignore_errors({'formula_differs': 'I67:%s90 I%d:%s%d' % (xl_col_to_name(8 + 2 * len(daten)), min(RB_STAND), xl_col_to_name(8 + 2 * len(daten)), max(RB_STAND)),
                      'number_stored_as_text': 'A3:H%d' % letzte, 'formula_range': 'I2:%s2' % xl_col_to_name(8 + 2 * len(daten))})


def anwesenheit_blaetter(wb, ws_m, ws_p, ws_w, st, kw_liste, anwesenheit, anw_datei):
    tage = kalender_tage(kw_liste)
    n_t = len(tage)
    c_end = PL_SPALTE0 + n_t - 1                        # letzte Tagesspalte (0-basiert)
    f = lambda **k: wb.add_format({'font_name': FONT, 'font_size': 9, 'valign': 'vcenter', **k})  # noqa: E731
    f_kopf_monat = f(bold=True, font_color=GRAUD, bg_color=GRAUXL, left=1, left_color=GRAUL)
    f_kopf_kw = f(bold=True, font_color=WEISS, bg_color=GRAUD, align='left')
    f_kopf_tag = f(font_size=7.5, font_color=GRAUD, align='center', num_format='ddd dd.mm.', bg_color=GRAUXL, bottom=1, bottom_color=GRAUL)
    f_name = wb.add_format({'font_name': FONT, 'font_size': 9, 'valign': 'vcenter', 'bold': True, 'font_color': GRAUD, 'bg_color': GRAUXL, 'indent': 1})
    f_zelle = st.eingabe_klein                        # Kalender: Eingabefelder (bedingte Formate faerben U/K/F/H/Anteil)
    f_kap = f(align='center', num_format='0.00', font_color=GRAU, bg_color=GRAUXL)
    f_sparte = f(font_color=GRAU, bg_color=GRAUXL)
    f_summe = f(bold=True, align='center', num_format='0.0', top=1, top_color=GRAUL)
    f_summe_label = f(bold=True, top=1, top_color=GRAUL)
    f_eingabe, f_eingabe_dez, f_eingabe_dat, f_eingabe_bool = st.zeile, st.zeile_dez, st.zeile_dat, st.zeile_wahl   # Eingabetabelle
    f_ber_pz = f(num_format='0%', align='center', font_color=GRAU, bg_color=GRAUXL)
    f_ber_dez = f(num_format='0.00', align='center', font_color=GRAU, bg_color=GRAUXL)

    # ---------------- Mitarbeiter: A Name, B Einheit, C Sparte, D BUe-Kapazitaet (MAK/Woche), E Eintritt, F Austritt, G Aktiv,
    # H Bemerkung · Arbeitszeitmodell: I Arbeitszeit (leer = 1,0), J..N Arbeitszeit Mo..Fr (leer = wie Arbeitszeit) ·
    # berechnet: O BUe-Anteil der Arbeitszeit (D/I), P..T BUe-MAK Mo..Fr (O x Tagesarbeitszeit) – Grundlage des Kalenders
    ws_m.set_column('A:A', 22)
    ws_m.set_column('B:B', 12)
    ws_m.set_column('C:C', 12)
    ws_m.set_column('D:D', 14)
    ws_m.set_column('E:F', 12)
    ws_m.set_column('G:G', 11)
    ws_m.set_column('H:H', 26)
    ws_m.set_column('I:I', 12)
    ws_m.set_column('J:N', 7)
    ws_m.set_column('O:O', 11)
    ws_m.set_column('P:T', 7)
    ws_m.write('A1', 'Mitarbeiter und Arbeitszeitmodell', st.titel)
    ws_m.write('A2', 'Je Person: BÜ-Kapazität (MAK je Woche), Arbeitszeit und wie sie sich auf Mo–Fr verteilt (leer = gleichmäßig). Daraus rechnet der Kalender die BÜ-MAK je Tag.', st.untertitel)
    ws_m.set_row(0, 30)
    ws_m.write('A3', LEGENDE_EINGABE + ' · rot = Pflichtfeld fehlt oder Tage passen nicht zur Arbeitszeit', st.legende)
    kopf_m = ['Mitarbeiter', 'Einheit', 'Sparte', 'BÜ-Kapazität (MAK/Woche)', 'Eintritt', 'Austritt', 'Aktiv (leer = ja)', 'Bemerkung',
              'Arbeitszeit (1,0 = Vollzeit)', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'BÜ-Anteil der Arbeitszeit', 'BÜ Mo', 'BÜ Di', 'BÜ Mi', 'BÜ Do', 'BÜ Fr']
    for c, t in enumerate(kopf_m):
        ws_m.write(MA_START - 2, c, t, st.kopf if c < 14 else st.kopf_hell)
    ws_m.merge_range(MA_START - 3, 8, MA_START - 3, 13, 'Arbeitszeitmodell', st.band if hasattr(st, 'band') else st.kopf)
    ws_m.merge_range(MA_START - 3, 14, MA_START - 3, 19, 'BÜ-MAK je Wochentag (berechnet)', st.kopf_hell)
    ws_m.set_row(MA_START - 2, 32)
    stamm, wochen = v.mitarbeiter_aus_anwesenheit(anwesenheit)
    # alphabetisch (Umlaute wie der Grundbuchstabe); Kalender und Wirksam folgen zeilengleich
    umlaut = str.maketrans({'ä': 'a', 'ö': 'o', 'ü': 'u', 'ß': 'ss'})
    stamm = sorted(stamm, key=lambda z: str(z[0]).casefold().translate(umlaut))
    for i in range(MA_ZEILEN):
        r = MA_START - 1 + i
        x = r + 1
        ws_m.set_row(r, 18)
        if i < len(stamm):
            name, einheit, sparte, kap = stamm[i]
            ws_m.write(r, 0, name, f_eingabe)
            ws_m.write(r, 1, einheit, f_eingabe)
            ws_m.write(r, 2, sparte, f_eingabe)
            ws_m.write_number(r, 3, kap, f_eingabe_dez)
            ws_m.write_boolean(r, 6, True, f_eingabe_bool)
        else:
            for c in (0, 1, 2):
                ws_m.write_blank(r, c, None, f_eingabe)
            ws_m.write_blank(r, 3, None, f_eingabe_dez)
            ws_m.write_blank(r, 6, None, f_eingabe_bool)
        ws_m.write_blank(r, 4, None, f_eingabe_dat)
        ws_m.write_blank(r, 5, None, f_eingabe_dat)
        ws_m.write_blank(r, 7, None, f_eingabe)
        for c in range(8, 14):
            ws_m.write_blank(r, c, None, f_eingabe_dez)
        az = 'IF(N($I%d)=0,1,$I%d)' % (x, x)                       # Arbeitszeit, leer = Vollzeit
        ws_m.write_formula(r, 14, '=IF($A%d="","",IF(N($D%d)=0,0,$D%d/%s))' % (x, x, x, az), f_ber_pz)
        for k in range(5):
            tag = xl_col_to_name(9 + k)
            ws_m.write_formula(r, 15 + k, '=IF($A%d="","",$O%d*IF(%s%d="",%s,N(%s%d)))' % (x, x, tag, x, az, tag, x), f_ber_dez)
    m_bis = MA_START - 2 + MA_ZEILEN
    ws_m.data_validation(MA_START - 1, 2, m_bis, 2, {'validate': 'list', 'source': ['Gesundheit', 'Komposit'],
                                                    'input_title': 'Sparte (Pflicht)', 'input_message': 'Gesundheit = KV, Komposit = Komposit/Leben.'})
    ws_m.data_validation(MA_START - 1, 6, m_bis, 6, {'validate': 'list', 'source': ['WAHR', 'FALSCH'],
                                                    'input_title': 'Aktiv', 'input_message': 'Leer oder WAHR = zählt mit; FALSCH = zählt nicht mehr (z. B. ausgetreten).'})
    ws_m.data_validation(MA_START - 1, 4, m_bis, 5, {'validate': 'date', 'criteria': '>=', 'value': dt.date(2000, 1, 1),
                                                    'input_title': 'Eintritt / Austritt', 'input_message': 'Optional, TT.MM.JJJJ. Vor dem Eintritt und nach dem Austritt zählt die Person nicht.'})
    ws_m.data_validation(MA_START - 1, 3, m_bis, 3, {'validate': 'decimal', 'criteria': 'between', 'minimum': 0, 'maximum': 1.5,
                                                    'input_title': 'BÜ-Kapazität (Pflicht)', 'input_message': 'MAK je Woche, die die Person in BÜ arbeitet, z. B. 0,5 = halbe Stelle in BÜ.'})
    ws_m.data_validation(MA_START - 1, 8, m_bis, 8, {'validate': 'decimal', 'criteria': 'between', 'minimum': 0, 'maximum': 1,
                                                    'input_title': 'Arbeitszeit', 'input_message': 'Anteil einer Vollzeitstelle: 1,0 = Vollzeit, 0,8 = 80 %. Leer = 1,0.'})
    ws_m.data_validation(MA_START - 1, 9, m_bis, 13, {'validate': 'decimal', 'criteria': 'between', 'minimum': 0, 'maximum': 1,
                                                     'input_title': 'Arbeitszeit am Tag', 'input_message': 'Leer = wie Arbeitszeit (gleichmäßig). Beispiel 0,8 mit freiem Freitag: Mo–Do 1, Fr 0. Die fünf Tage ergeben im Schnitt die Arbeitszeit.'})
    # Pflichtfelder und Plausibilitaet: Sparte/Kapazitaet fehlt; Tage passen nicht zur Arbeitszeit; BUe-Kapazitaet groesser als Arbeitszeit
    ws_m.conditional_format(MA_START - 1, 2, m_bis, 3, {'type': 'formula', 'criteria': '=AND($A%d<>"",C%d="")' % (MA_START, MA_START), 'format': st.pflicht})
    az5 = 'IF(N($I%d)=0,1,$I%d)' % (MA_START, MA_START)
    ws_m.conditional_format(MA_START - 1, 8, m_bis, 13, {'type': 'formula',
                            'criteria': '=AND($A%d<>"",COUNT($J%d:$N%d)>0,ABS((COUNTBLANK($J%d:$N%d)*%s+SUM($J%d:$N%d))/5-%s)>0.001)'
                                        % (MA_START, MA_START, MA_START, MA_START, MA_START, az5, MA_START, MA_START, az5), 'format': st.pflicht})
    ws_m.conditional_format(MA_START - 1, 3, m_bis, 3, {'type': 'formula', 'criteria': '=AND($A%d<>"",N($D%d)>%s+0.001)' % (MA_START, MA_START, az5), 'format': st.pflicht})
    ws_m.write_comment(MA_START - 2, 8, 'Arbeitszeit = Anteil einer Vollzeitstelle (leer = 1,0). Mo–Fr = Arbeitszeit an diesem Tag; leer = wie Arbeitszeit. '
                                          'Beispiele 0,8: jeden Tag 0,8 (alles leer lassen) oder Mo–Do 1 und Fr 0. Die BÜ-Kapazität verteilt sich im selben Verhältnis auf die Tage.',
                       {'author': 'BÜ-Reporting', 'x_scale': 2.6, 'y_scale': 1.6, 'font_name': FONT, 'font_size': 9})
    ws_m.merge_range('V4:W4', 'Import der Anwesenheit', st.kopf)
    ws_m.write('V5', 'Letzte Datei', st.label)
    ws_m.write('W5', anw_datei, st.berechnet)
    ws_m.write('V6', 'Importiert am', st.label)
    if anw_datei:
        ws_m.write_datetime('W6', dt.datetime.now(), st.berechnet_datzeit)
    else:
        ws_m.write_blank('W6', None, st.berechnet_datzeit)
    # Format des letzten Imports (modLaden.wsM_Stand): "Plan" = Telefonie- und Abwesenheitsplan – „Neue Daten laden“ uebernimmt
    # ihn dann jedes Mal neu (modLaden.AnwesenheitAutomatisch); "MAK-Liste" = Liste je KW (einmaliger Import)
    ws_m.write('V7', 'Format', st.label)
    ws_m.write('W7', 'MAK-Liste' if anw_datei else '', st.berechnet)
    ws_m.set_column('U:U', 3)
    ws_m.set_column('V:V', 16)
    ws_m.set_column('W:W', 40)
    ws_m.freeze_panes(MA_START - 1, 1)

    # ---------------- Kalender (Eingabe je Tag) und Wirksam (berechnete BUe-MAK je Mitarbeiter und Tag)
    for ws in (ws_p, ws_w):
        ws.set_column('A:A', 20)
        ws.set_column('B:B', 10)
        ws.set_column('C:C', 7)
        ws.freeze_panes(PL_START - 1, PL_SPALTE0)
    ws_p.set_column(PL_SPALTE0, c_end, 7.6, f_zelle)     # „Mi 23.09.“ ohne ###
    ws_w.set_column(PL_SPALTE0, c_end, 7.6)
    # Zeilen ohne Eingaben (Kopf, Luecke vor den Summen, unterhalb) neutral – sonst schlaegt das Eingabeformat der Spalten durch
    f_neutral = wb.add_format({'font_name': FONT, 'font_size': 9, 'bg_color': WEISS})
    for zr in list(range(PL_START - 1 + MA_ZEILEN, KAL_SUMME - 1)) + list(range(KAL_SUMME + 2, KAL_SUMME + 40)):
        ws_p.set_row(zr, None, f_neutral)
    ws_p.write('A2', 'Kalender – Anwesenheit je Tag', st.titel)
    ws_p.write('A3', LEGENDE_EINGABE + ' · leer = da · U Urlaub · K Krankheit · A abwesend · Zahl = anwesender Anteil (0,5 = halber Tag; Samstag 1 = kommt) · kursives A = freier Tag laut Arbeitszeitmodell und FT = Feiertag trägt das Tool selbst ein · rot = heute',
               st.legende)
    ws_p.write_comment('A2', 'Eine Spalte je Arbeitstag (Mo–Fr). Das Arbeitszeitmodell kommt aus dem Blatt „Mitarbeiter“; hier nur Abweichungen eintragen. '
                             'Unter dem Kalender stehen die BÜ-MAK je Tag (Grundlage der Tagesproduktivität); die MAK je KW sind der Durchschnitt Mo–Fr. '
                             '„Zu heute“ springt zum heutigen Tag, der Tagesablauf fragt die Anwesenheit täglich ab.',
                       {'author': 'BÜ-Reporting', 'x_scale': 3, 'y_scale': 1.6, 'font_name': FONT, 'font_size': 9})
    ws_p.write('A4', 'Monat', f_kopf_monat)
    ws_p.write('A5', 'Kalenderwoche', f_kopf_kw)
    ws_p.write('A6', 'Tag', f_kopf_tag)
    ws_p.write('B4', '', f_kopf_monat)
    ws_p.write('B5', 'Sparte', f_kopf_kw)
    ws_p.write('B6', '', f_kopf_tag)
    ws_p.write('C4', '', f_kopf_monat)
    ws_p.write('C5', 'BÜ/Wo', f_kopf_kw)
    ws_p.write('C6', '', f_kopf_tag)
    ws_w.set_row(0, 30)
    ws_w.write('A1', 'Wirksame BÜ-MAK je Mitarbeiter und Tag', st.titel)
    ws_w.write('A2', 'Berechnet aus Mitarbeiter (Arbeitszeitmodell, Eintritt/Austritt) und Kalender; Grundlage der MAK am Tag und je KW. Nicht bearbeiten.', st.untertitel)
    ws_w.write('A5', 'Datum', st.spalte)
    ws_w.write('A6', 'Schlüssel Jahr*100+KW', st.spalte)
    for c in (1, 2):
        ws_w.write_blank(4, c, None, st.spalte)
        ws_w.write_blank(5, c, None, st.spalte)
    letzter_monat = None
    ft_name = {d: n for d, n in FEIERTAGE}
    for i, d in enumerate(tage):
        c = PL_SPALTE0 + i
        label = '%s %s' % (MONATE_DE[d.month - 1], d.year) if (d.year, d.month) != letzter_monat else ''
        if d in ft_name:
            label = (label + ' · ' if label else '') + ft_name[d]
        letzter_monat = (d.year, d.month)
        iso = d.isocalendar()
        ws_p.write(3, c, label, f_kopf_monat if label else f(bg_color=GRAUXL))
        ws_p.write(4, c, 'KW %d' % iso[1] if d.weekday() == 0 else '', f_kopf_kw)
        ws_p.write_datetime(5, c, dt.datetime(d.year, d.month, d.day), f_kopf_tag)
        ws_w.write_datetime(4, c, dt.datetime(d.year, d.month, d.day), st.spalte_dat)
        ws_w.write_number(5, c, iso[0] * 100 + iso[1], st.spalte_ganz)
    tag_index = {d: i for i, d in enumerate(tage)}
    for i in range(MA_ZEILEN):
        r = PL_START - 1 + i                            # 0-basiert
        mz = MA_START + i                               # Zeile im Blatt Mitarbeiter (1-basiert)
        ws_p.write_formula(r, 0, '=IF(Mitarbeiter!$A$%d="","",Mitarbeiter!$A$%d)' % (mz, mz), f_name)
        ws_p.write_formula(r, 1, '=IF(Mitarbeiter!$A$%d="","",Mitarbeiter!$C$%d)' % (mz, mz), f_sparte)
        ws_p.write_formula(r, 2, '=IF(Mitarbeiter!$A$%d="","",Mitarbeiter!$D$%d)' % (mz, mz), f_kap)
        ws_w.write_formula(r, 0, '=Kalender!A%d' % (r + 1), st.zelle)
        ws_w.write_formula(r, 1, '=Kalender!B%d' % (r + 1), st.zelle)
        ws_w.write_formula(r, 2, '=N(Mitarbeiter!$D$%d)' % mz, st.zelle_dez)
        # Wochenwerte der MAK-Liste (Demo) auf die Tage der KW: U/F je Tag, Zahl = anwesender Anteil (Zahl / BUe-Kapazitaet);
        # danach Feiertage als „FT“ (wie modCockpit.KalenderVorbelegen; „frei“ laut Modell gibt es in der Demo nicht)
        if i < len(stamm):
            for d_ft, _n in FEIERTAGE:
                ti = tag_index.get(d_ft)
                if ti is not None:
                    ws_p.write_string(r, PL_SPALTE0 + ti, 'FT', f_zelle)      # ein spaeterer Importeintrag (U/F) ueberschreibt
            name, kap = stamm[i][0], stamm[i][3]
            for (j, k), wert in wochen.get(name, {}).items():
                mo = montag(j, k)
                if isinstance(wert, float):
                    if kap and abs(wert - kap) < 1e-9:
                        continue
                    wert = round(max(0.0, min(1.0, wert / kap)), 2) if kap else 0.0
                for t in range(5):
                    ti = tag_index.get(mo + dt.timedelta(days=t))
                    if ti is None:
                        continue
                    if isinstance(wert, float):
                        ws_p.write_number(r, PL_SPALTE0 + ti, wert, f_zelle)
                    else:
                        ws_p.write(r, PL_SPALTE0 + ti, wert, f_zelle)
        # Wirksam je Tag: BUe-MAK des Wochentags (Mitarbeiter P..T) x anwesender Anteil laut Kalender; 0 ausserhalb von
        # Eintritt/Austritt oder wenn Aktiv = FALSCH
        for ti in range(n_t):
            c = PL_SPALTE0 + ti
            col = xl_col_to_name(c)
            k = 'Kalender!%s%d' % (col, r + 1)
            voll = 'N(Mitarbeiter!$O%d)' % mz                               # BUe-MAK eines vollen Arbeitstags
            anteil = 'IF(ISNUMBER(%s),MAX(0,MIN(1,%s)),0)' % (k, k)             # Zahl = anwesender Anteil; U, K, A, FT = 0
            ws_w.write_formula(r, c, '=IF($A%d="",0,IF(AND(ISLOGICAL(Mitarbeiter!$G%d),Mitarbeiter!$G%d=FALSE),0,'
                                     'IF(AND(Mitarbeiter!$E%d<>"",%s$5<Mitarbeiter!$E%d),0,IF(AND(Mitarbeiter!$F%d<>"",%s$5>Mitarbeiter!$F%d),0,'
                                     'IF(WEEKDAY(%s$5,2)=6,IF(%s="",0,%s*%s),'
                                     'N(INDEX(Mitarbeiter!$P%d:$T%d,WEEKDAY(%s$5,2)))*IF(%s="",1,%s))))))'
                               % (r + 1, mz, mz, mz, col, mz, mz, col, mz, col, k, voll, anteil, mz, mz, col, k, anteil))
        # Einheiten-Chips (12.86): 1 = Einheit der Person im Filter (oder nicht in der Chip-Liste, z. B. HS oder abweichender Name),
        # 0 = abgewaehlt – die Tagessummen unten zaehlen nur Personen mit 1 (MAK und Produktivitaet folgen den Einheiten-Chips)
        ws_w.write_formula(r, c_end + 2, '=IF(IFERROR(INDEX(EH_Aktiv,MATCH(Mitarbeiter!$B$%d,EH_Liste,0)),TRUE),1,0)' % mz, st.zelle_ganz)
    ws_w.write(PL_START - 2, c_end + 2, 'Einheit im Filter (1/0)', st.kopf)
    eh_sp = xl_col_to_name(c_end + 2)
    eh_krit = ',Wirksam!$%s$%d:$%s$%d,1' % (eh_sp, PL_START, eh_sp, PL_START + MA_ZEILEN - 1)
    # Summenzeilen unter dem Kalender (BUe-MAK je Tag) – KAL_SUMME ist die Excel-Zeile der ersten
    rs = KAL_SUMME - 1
    ws_p.write(rs, 0, 'MAK Gesundheit (KV)', f_summe_label)
    ws_p.write(rs + 1, 0, 'MAK Komposit/Leben', f_summe_label)
    ws_p.write(rs + 2, 0, 'MAK gesamt', f_summe_label)
    for ti in range(n_t):
        col = xl_col_to_name(PL_SPALTE0 + ti)
        wb_ = 'Wirksam!$%s$%d:$%s$%d' % (col, PL_START, col, PL_START + MA_ZEILEN - 1)
        ws_p.write_formula(rs, PL_SPALTE0 + ti, '=SUMIFS(%s,Wirksam!$B$%d:$B$%d,"Gesundheit"%s)' % (wb_, PL_START, PL_START + MA_ZEILEN - 1, eh_krit), f_summe)
        ws_p.write_formula(rs + 1, PL_SPALTE0 + ti, '=SUMIFS(%s,Wirksam!$B$%d:$B$%d,"Komposit"%s)' % (wb_, PL_START, PL_START + MA_ZEILEN - 1, eh_krit), f_summe)
        ws_p.write_formula(rs + 2, PL_SPALTE0 + ti, '=%s%d+%s%d' % (col, rs + 1, col, rs + 2), f_summe)
    # Eingabepruefung und bedingte Formate
    m0, m1 = PL_START - 1, PL_START - 2 + MA_ZEILEN
    erste = xl_col_to_name(PL_SPALTE0) + str(PL_START)
    ws_p.data_validation(m0, PL_SPALTE0, m1, c_end, {'validate': 'custom',
                         'value': '=OR(AND(ISNUMBER(%s),%s>=0,%s<=1),UPPER(%s)="U",UPPER(%s)="K",UPPER(%s)="A",UPPER(%s)="FT")' % ((erste,) * 7),
                         'input_title': 'Anwesenheit am Tag', 'input_message': 'leer = da laut Arbeitszeitmodell (Samstag: nicht da) · U Urlaub · K Krankheit · A abwesend · Zahl 0–1 = anwesender Anteil (0,5 = halber Tag, Samstag 1 = kommt) · FT = Feiertag (automatisch)',
                         'error_title': 'Ungültiger Eintrag', 'error_message': 'Erlaubt: leer, U, K, A, FT oder eine Zahl zwischen 0 und 1.'})
    cf = lambda **k: wb.add_format(k)  # noqa: E731
    bereich = (m0, PL_SPALTE0, m1, c_end)
    d6 = xl_col_to_name(PL_SPALTE0) + '$6'
    mz0 = MA_START
    ws_p.conditional_format(*bereich, {'type': 'formula', 'criteria': '=UPPER(%s)="U"' % erste, 'format': cf(bg_color='#E3E7F3', font_color=INDIGO, bold=True)})
    ws_p.conditional_format(*bereich, {'type': 'formula', 'criteria': '=UPPER(%s)="K"' % erste, 'format': cf(bg_color=ROTL, font_color=ROTD, bold=True)})
    ws_p.conditional_format(*bereich, {'type': 'formula', 'criteria': '=UPPER(%s)="A"' % erste, 'format': cf(bg_color=GRAUL, font_color=GRAUD, bold=True)})
    ws_p.conditional_format(*bereich, {'type': 'formula', 'criteria': '=AND(%s="",WEEKDAY(%s,2)=6)' % (erste, xl_col_to_name(PL_SPALTE0) + '$6'), 'format': cf(bg_color='#E6E9ED')})
    ws_p.conditional_format(*bereich, {'type': 'formula', 'criteria': '=UPPER(%s)="FT"' % erste, 'format': cf(bg_color='#EDE7F6', font_color=INDIGO, bold=True)})
    ws_p.conditional_format(*bereich, {'type': 'formula', 'criteria': '=AND(ISNUMBER(%s),%s<>"")' % (erste, erste), 'format': cf(bg_color=TEALT, font_color=TEALD, bold=True, num_format='0.0#')})
    ws_p.conditional_format(*bereich, {'type': 'formula', 'criteria': '=$A%d=""' % PL_START, 'format': cf(bg_color=WEISS, border=1, border_color=GRAUXL)})
    # frei laut Arbeitszeitmodell (Arbeitszeit am Wochentag = 0) bzw. ausserhalb Eintritt/Austritt: grau
    ws_p.conditional_format(*bereich, {'type': 'formula',
                            'criteria': '=AND(%s="",INDEX(Mitarbeiter!$J%d:$N%d,WEEKDAY(%s,2))<>"",INDEX(Mitarbeiter!$J%d:$N%d,WEEKDAY(%s,2))=0)'
                                        % (erste, mz0, mz0, d6, mz0, mz0, d6),
                            'format': cf(bg_color='#E6E9ED', pattern=1)})
    ws_p.conditional_format(*bereich, {'type': 'formula',
                            'criteria': '=OR(AND(Mitarbeiter!$E%d<>"",%s<Mitarbeiter!$E%d),AND(Mitarbeiter!$F%d<>"",%s>Mitarbeiter!$F%d))'
                                        % (mz0, d6, mz0, mz0, d6, mz0),
                            'format': cf(bg_color='#E6E9ED')})
    # heute rot, Montage mit Wochenlinie, vergangene Tage gedaempft
    ws_p.conditional_format(3, PL_SPALTE0, 5, c_end, {'type': 'formula', 'criteria': '=%s=TODAY()' % d6, 'format': cf(bg_color=ROT, font_color=WEISS, bold=True)})
    ws_p.conditional_format(5, PL_SPALTE0, 5, c_end, {'type': 'formula', 'criteria': '=WEEKDAY(%s,2)=6' % d6, 'format': cf(bg_color='#DADFE5', font_color=GRAU, italic=True)})
    ws_p.conditional_format(5, PL_SPALTE0, 5, c_end, {'type': 'formula', 'criteria': '=COUNTIF(FT_Datum,%s)>0' % d6, 'format': cf(bg_color='#EDE7F6', font_color=INDIGO, bold=True)})
    rand = {'top': 1, 'bottom': 1, 'top_color': GRAUL, 'bottom_color': GRAUL}    # uebrige Seiten wie das Eingabefeld (sonst fehlen sie)
    ws_p.conditional_format(*bereich, {'type': 'formula', 'criteria': '=%s=TODAY()' % d6, 'format': cf(left=2, right=2, left_color=ROT, right_color=ROT, **rand)})
    ws_p.conditional_format(PL_START - 1, PL_SPALTE0, m1, c_end, {'type': 'formula', 'criteria': '=WEEKDAY(%s,2)=1' % d6,
                                                                   'format': cf(left=1, left_color=GRAU, right=1, right_color=GRAUL, **rand)})
    ws_p.conditional_format(3, PL_SPALTE0, 5, c_end, {'type': 'formula', 'criteria': '=WEEKDAY(%s,2)=1' % d6, 'format': cf(left=1, left_color=GRAU)})
    ws_p.conditional_format(*bereich, {'type': 'formula', 'criteria': '=%s<TODAY()' % d6, 'format': cf(font_color=GRAUM, bg_color='#F7F7F7')})
    ws_p.set_row(3, 16)
    ws_p.set_row(4, 16)
    ws_p.set_row(5, 16)
    ws_p.set_row(0, 34, f_neutral)          # Schaltflaechen
    ws_p.set_row(1, 30, f_neutral)          # Titel
    ws_p.set_row(2, 18, f_neutral)          # Hinweis
    # Schaltflaechen oben links im Kalender (Makros werden in der Nachbearbeitung eingetragen)
    knoepfe = [(0, 0, 'Zu heute', 'modCockpit.ZurAktuellenKW', TEALD, 150, 24, 'BTN_PL_KW', WEISS, True, False, 5),
               (0, 3, 'MAK-Liste importieren', 'modLaden.AnwesenheitLaden', GRAUD, 170, 24, 'BTN_PL_Import', WEISS, True, False, 5),
               (0, 7, 'Zum Cockpit', 'modCockpit.CockpitOeffnen', GRAUM, 120, 24, 'BTN_PL_Cockpit', WEISS, True, False, 5)]
    for (zr, zc, text, makro, farbe, breite, hoehe, nm, schrift, fett, links, yoff) in knoepfe:
        ws_p.insert_textbox(zr, zc, text, {'width': breite, 'height': hoehe, 'x_offset': 4, 'y_offset': yoff, 'object_position': 3,
                                           'fill': {'color': farbe}, 'line': {'none': True},
                                           'font': {'name': FONT, 'size': 9, 'bold': fett, 'color': schrift}, 'align': {'vertical': 'middle', 'horizontal': 'center'}})
    # Vergangene Wochen eingeklappt (Gliederung, „+“ ueber der Spalte der aktuellen Woche klappt auf); Start bei heute.
    # Stand beim Bau – das Blattmodul Kalender klappt beim ersten Aufruf je Sitzung bis zum Montag der aktuellen Woche nach.
    heute = dt.date.today()
    montag_heute = heute - dt.timedelta(days=heute.weekday())
    ti = next((i for i, d in enumerate(tage) if d >= heute), n_t - 1)
    tm = next((i for i, d in enumerate(tage) if d >= montag_heute), 0)
    if tm > 0:
        ws_p.set_column(PL_SPALTE0, PL_SPALTE0 + tm - 1, 7.6, f_zelle, {'level': 1, 'hidden': True})
        ws_p.set_column(PL_SPALTE0 + tm, PL_SPALTE0 + tm, 7.6, f_zelle, {'collapsed': True})
    ws_p.outline_settings(True, False, True, False)        # Gliederungssymbole sichtbar, Summenspalte rechts der Gruppe
    ws_p.freeze_panes(PL_START - 1, PL_SPALTE0, PL_START - 1, PL_SPALTE0 + max(tm, ti - 2))
    global KNOEPFE_PLANUNG
    KNOEPFE_PLANUNG = knoepfe


# ------------------------------------------------------------------ PPT-Folie: Kacheln im Folienmass (Punkte), die das Makro modPPT.NachPowerPoint als Formen kopiert
FARBE_OPAG, FARBE_VERBUND, FARBE_NEUTRAL = ROTD, TEALD, GRAUD       # "Bookmark"-Farben der Kacheln
PT = 96.0 / 72.0                                                     # Punkt -> Pixel
PPT_BREITE, PPT_HOEHE = 878, 405                                     # Inhaltsflaeche unter dem Folientitel (Layout "Only Title", Punkte)
KACHEL_B, KACHEL_H, KACHEL_LUECKE = 283, 195, 14
KACHEL_KOPF = 30                                                     # zwei Zeilen: Titel, darunter die Kennzahl
PPT_CHART_B, PPT_CHART_H = 283, 165                                  # Diagramm fuellt die Kachel unter der Kopfleiste (Punkte); Fussnote liegt unten darueber
PLOT_PPT_STAPEL = {'x': 0.02, 'y': 0.15, 'width': 0.96, 'height': 0.64}
PLOT_PPT_RUECK = {'x': 0.01, 'y': 0.15, 'width': 0.91, 'height': 0.61}    # Rueckstand: rechts Rand fuer den Leben-Wert neben der letzten Saeule;
#   unten Platz fuer drei Zeilen Achse ueber der Fussnote (Wochensicht „KW 41“ / „09.10. (Fr.)*“, bricht Excel bei 7 pt um, wird es dreizeilig)
PLOT_PPT_BEWEG = {'x': 0.02, 'y': 0.15, 'width': 0.96, 'height': 0.58}
PLOT_PPT_ALTER = {'x': 0.16, 'y': 0.16, 'width': 0.69, 'height': 0.7}   # rechts Platz fuer den Wert über 90 Tage
CHART_ZAEHLER = [0]                                                  # laufende Nummer eingefuegter Diagramme (Chart 1, Chart 2, ...)


def chart_einfuegen(ws, zeile, spalte, chart, optionen):
    ws.insert_chart(zeile, spalte, chart, optionen)
    CHART_ZAEHLER[0] += 1
    return CHART_ZAEHLER[0]


def ppt_blatt(wb, ws, st, ber, werte):
    ws.set_zoom(85)
    ws.set_tab_color(ROT)
    ws.set_column('A:A', 2)
    ws.set_column('B:B', 2)
    ws.set_column('C:AZ', 3.0)
    ws.set_row(0, 18)
    ws.set_row(1, 14)
    ws.set_row(2, 8)
    ws.write('C1', 'PPT-Folie: Diese Kacheln kopiert „PowerPoint-Folie erzeugen“ (Cockpit) als Formen auf eine Folie der ERGO-Vorlage. Titel und Untertitel der Folie stehen in AZ1:AZ2, Werte in den Kachelköpfen sind mit Zellen verknüpft.', st.untertitel)
    # Folientitel und Untertitel (vom Makro in die Platzhalter geschrieben)
    ws.write('AZ1', 'Folientitel', st.abschnitt_klein)
    if BEREICH == 'MAKLER':                         # Einheit im Titel, wenn nicht Gesamt
        ws.write_formula('BA1', '="Makler | BÜ-Reporting Makler-Bestandsübertragung"&IF(OR(Filter!$L$16="",Filter!$L$16="Gesamt"),""," · "&Filter!$L$16)', st.zelle)
    else:
        ws.write_formula('BA1', '="HS | BÜ-Reporting Makler-Bestandsübertragung"', st.zelle)
    ws.write('AZ2', 'Untertitel', st.abschnitt_klein)
    datum = lambda z: 'RIGHT("0"&DAY(%s),2)&"."&RIGHT("0"&MONTH(%s),2)&"."&YEAR(%s)' % (z, z, z)  # noqa: E731
    ws.write_formula('BA2', '=IF(Filter!$O$5="","Noch keine Stände geladen","Stand "&%s&IF(Filter!$O$6="",""," · vorheriger Stand "&%s)&" · Quelle MIS-O")'
                     % (datum('Filter!$O$5'), datum('Filter!$O$6')), st.zelle)
    ws.set_column('AZ:AZ', 12)
    ws.set_column('BA:BA', 90)
    # Kachelwerte (mit Zellen verknuepfte Textfelder)
    ws.write('AZ4', 'Kachelwerte', st.abschnitt_klein)
    werte_formeln = [
        '=IF(Filter!$O$27=0,"–",FIXED(INDEX(Verlauf!$H$6:$H$%d,Filter!$O$27),0,FALSE)&IF(Filter!$O$19="",""," ("&IF(Filter!$O$19>0,"+","")&FIXED(Filter!$O$19,0,FALSE)&")"))' % MAX_VERLAUF,
        '=IF(Filter!$O$29=0,"–",FIXED(INDEX(Verlauf!$R$6:$R$%d,Filter!$O$29),0,FALSE)&IF(Filter!$O$20="",""," ("&IF(Filter!$O$20>0,"+","")&FIXED(Filter!$O$20,0,FALSE)&")"))' % MAX_VERLAUF,
        '=IF(Filter!$O$27=0,"–","+"&FIXED(INDEX(Verlauf!$I$6:$I$%d,Filter!$O$27),0,FALSE)&" / −"&FIXED(INDEX(Verlauf!$J$6:$J$%d,Filter!$O$27),0,FALSE))' % (MAX_VERLAUF, MAX_VERLAUF),
        '=IF(Filter!$O$29=0,"–","+"&FIXED(INDEX(Verlauf!$S$6:$S$%d,Filter!$O$29),0,FALSE)&" / −"&FIXED(INDEX(Verlauf!$T$6:$T$%d,Filter!$O$29),0,FALSE))' % (MAX_VERLAUF, MAX_VERLAUF),
        # Produktivitaet je Ansicht mit kurzer Basis und ihrem Nenner (Filter, PROD_ZEILEN['ppt']): „KW 41: Ø MAK 14,9 · 69,4 Vorg.
        # je MAK, bisher 3 Arbeitstage“ bzw. „Ø MAK 13,0 · Ø 5,1 Vorg. je MAK/Arbeitstag (5 Tage bis 07.10.)“
        '=Filter!$O$%d' % PROD_ZEILEN['ppt'],
        '=IF(Filter!$O$7=0,"–","über 90 Tage: OPAG "&FIXED(Filter!$R$15,0)&" · Verbund "&FIXED(Filter!$R$16,0))',
    ]
    for i, fm in enumerate(werte_formeln):
        ws.write_formula(4 + i, 52, fm, st.zelle)      # BA5..BA10
    # Fussnoten der Rueckstandskacheln (BA14 OPAG, BA15 Verbund): Filterzeile wie die uebrigen Kacheln; steht in der Wochensicht
    # ein Stern an einem Datum (abgeschlossene KW ohne Sonntagsstand, Diagrammdaten!BV/BW), statt dessen die Erklaerung (die
    # Filterzeile steht auf den Nachbarkacheln; beides zusammen passt bei 6,5 pt nicht in eine Zeile)
    for z, (q, sp) in ((14, ('OPAG', 'BV')), (15, ('Verbund', 'BW'))):
        ws.write('AZ%d' % z, 'Fußnote Rückstand %s' % q, st.abschnitt_klein)
        ws.write_formula('BA%d' % z, '=IF(SUM(Diagrammdaten!$%s$4:$%s$10)>0,"* ohne Sonntagsstand – letzter Stand der KW · Wochensicht · Filter wie übrige Kacheln",$BA$12)'
                         % (sp, sp), st.zelle)
    ws.write('AZ12', 'Filter', st.abschnitt_klein)
    # Bereich Makler: abgewaehlte Einheiten-Chips in der Filterzeile nennen (12.86)
    EH_FUSS = ('IF(COUNTIFS(EH_Liste,"<>",EH_Aktiv,FALSE)=0,""," · Einheiten: "&COUNTIFS(EH_Liste,"<>",EH_Aktiv,TRUE)&" von "&COUNTIF(EH_Liste,"?*"))&'
               if BEREICH == 'MAKLER' else '')
    ws.write_formula('BA12', '="Themenpostkörbe: "&IF(COUNTIF(PK_Aktiv,TRUE)=COUNTA(PK_Liste),"alle",COUNTIF(PK_Aktiv,TRUE)&" von "&COUNTA(PK_Liste))&" · Sparten: "&IF(COUNTIF(SP_Aktiv,TRUE)=COUNTA(SP_Liste),"alle",TRIM(IF(Filter!$T$5=TRUE,"Komposit ","")&IF(Filter!$T$6=TRUE,"Leben ","")&IF(Filter!$T$7=TRUE,"KV ","")&IF(Filter!$T$8=TRUE,"Sonstige","")))&%s" · GeVo: "&Filter!$L$5&" · "'
                     '&IF(Filter!$L$9="Woche","Wochensicht",IF(Filter!$L$9="KW","Tagessicht KW"&IF(Filter!$O$10="",""," "&Filter!$O$10)&" (Mo–So)","Tagessicht"))' % EH_FUSS, st.zelle)
    # Fussnote der Kachel Kapazitaet/Produktivitaet: in Tag/KW „Boxen: je MAK und KW“, bei laufender KW die Erklaerung des
    # Sterns an den Boxen („* KW 41 läuft: Verbund 3, OPAG 4 Arbeitstage“, bei frueherem Bezugstag „* KW 41: Verbund 3,
    # OPAG 4 Arbeitstage bis 08.10.“); sonst die Filterzeile wie die uebrigen Kacheln
    ws.write('AZ13', 'Fußnote Kapazität', st.abschnitt_klein)
    ws.write_formula('BA13', '=IF(Filter!$O$%d="",$BA$12,Filter!$O$%d)' % (PROD_ZEILEN['ppt_fuss'], PROD_ZEILEN['ppt_fuss']), st.zelle)

    x0, y0 = 4, 4                                                     # Ursprung der Formen (Pixel) in Zelle B4
    def px(pt):
        return int(round(pt * PT))

    def kachel(nr, titel, farbe, wert_zelle, chart, geom=None, fuss='=PPT!$BA$12'):
        chart.chart_name = 'Chart %d' % (10 + nr)          # Namen, unter denen modCockpit die PPT-Diagramme anspricht
        col, row = nr % 3, nr // 3
        kx = x0 + px(col * (KACHEL_B + KACHEL_LUECKE))
        ky = y0 + px(row * (KACHEL_H + KACHEL_LUECKE))
        # Kopfleiste ("Bookmark"): Titel oben, verknuepfte Kennzahl in der zweiten Zeile (beide linksbuendig, keine Ueberlappung
        # bei Schriftersatz in PowerPoint)
        ws.insert_textbox(3, 1, titel, {'x_offset': kx, 'y_offset': ky, 'width': px(KACHEL_B), 'height': px(KACHEL_KOPF), 'object_position': 3,
                                        'fill': {'color': farbe}, 'line': {'none': True},
                                        'font': {'name': FONT, 'size': 9, 'bold': True, 'color': WEISS}, 'align': {'vertical': 'top', 'horizontal': 'left'}})
        ws.insert_textbox(3, 1, '', {'x_offset': kx, 'y_offset': ky + px(14), 'width': px(KACHEL_B), 'height': px(KACHEL_KOPF - 14), 'object_position': 3,
                                     'textlink': wert_zelle, 'fill': {'none': True}, 'line': {'none': True},
                                     'font': {'name': FONT, 'size': 8, 'bold': False, 'color': WEISS}, 'align': {'vertical': 'top', 'horizontal': 'left'}})
        nummer = chart_einfuegen(ws, 3, 1, chart, {'x_offset': kx, 'y_offset': ky + px(KACHEL_KOPF), 'object_position': 3})
        if geom:
            geom['datei'] = 'xl/charts/chart%d.xml' % nummer
            GEOMETRIE.append(geom)
        # Fussnote
        ws.insert_textbox(3, 1, '', {'x_offset': kx, 'y_offset': ky + px(KACHEL_H - 13), 'width': px(KACHEL_B), 'height': px(13), 'object_position': 3,
                                     'textlink': fuss, 'fill': {'none': True}, 'line': {'none': True},
                                     'font': {'name': FONT, 'size': 6.5, 'italic': True, 'color': GRAU}, 'align': {'vertical': 'middle', 'horizontal': 'left'}})

    b, h = px(PPT_CHART_B), px(PPT_CHART_H)
    lab = lambda fmt, farbe=WEISS, size=7: {'value': True, 'position': 'center', 'num_format': fmt, 'font': {'name': FONT, 'size': size, 'color': farbe, 'bold': True}}  # noqa: E731
    lab_sum = lambda fmt, pos: {'value': True, 'position': pos, 'num_format': fmt, 'font': {'name': FONT, 'size': 7, 'color': GRAUD, 'bold': True}}  # noqa: E731

    def basis(ch, y_format='#,##0'):
        ch.set_chartarea({'border': {'none': True}, 'fill': {'color': GRAUXL}})
        ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True}})
        ch.set_title({'none': True})
        legende(ch, [])
        ch.set_x_axis({'num_font': {'name': FONT, 'size': 7, 'color': GRAU}, 'line': {'color': GRAUL, 'width': 0.75}, 'major_gridlines': {'visible': False},
                       'major_tick_mark': 'none', 'minor_tick_mark': 'none'})
        ch.set_y_axis({'visible': False, 'major_gridlines': {'visible': False}})
        ch.set_size({'width': b, 'height': h})

    def legende(ch, weg):
        # feste, einzeilige Legende oben (sonst ordnet PowerPoint sie je nach Textlaenge mal quer, mal gestapelt an);
        # weg = Reihen ohne Legendeneintrag (unsichtbare Hilfsreihen)
        ch.set_legend({'position': 'top', 'font': {'name': FONT, 'size': 7, 'color': GRAUD}, 'delete_series': weg,
                       'layout': {'x': 0.02, 'y': 0.015, 'width': 0.96, 'height': 0.085}})
        ch.show_blanks_as('gap')

    def stapel(q):
        ch = wb.add_chart({'type': 'column', 'subtype': 'stacked'})
        cols = {'OPAG': ['C', 'D', 'E', 'F'], 'Verbund': ['G', 'H', 'I', 'J']}[q]
        makler = BEREICH == 'MAKLER'                 # wie im Cockpit: Namen nach Sicht, vierte Reihe
        reihen = list(zip(['Komposit', 'Leben', 'KV'], cols)) + ([('Sonstige', 'BI' if q == 'OPAG' else 'BJ')] if makler else [])
        kat = '=Diagrammdaten!$BR$4:$BR$10' if q == 'OPAG' else '=Diagrammdaten!$BS$4:$BS$10'     # Achse der Quelle wie im Cockpit (mit Stern)
        for k, (sp, col) in enumerate(reihen):
            ch.add_series({'name': '=Diagrammdaten!$%s$3' % xl_col_to_name(62 + k) if makler else sp, 'categories': kat, 'values': '=Diagrammdaten!$%s$4:$%s$10' % (col, col),
                           'fill': {'color': FARBE_SPARTE[sp]}, 'border': {'color': WEISS, 'width': 0.5}, 'gap': GAP_PPT_STAPEL, 'data_labels': lab('#,##0.0,;#,##0.0,;')})
        ln = wb.add_chart({'type': 'line'})
        ln.add_series({'name': 'Gesamt', 'categories': kat, 'values': '=Diagrammdaten!$%s$4:$%s$10' % (cols[3], cols[3]),
                       'line': {'none': True}, 'marker': {'type': 'none'}, 'data_labels': lab_sum('#,##0.0,;#,##0.0,;', 'above')})
        sw, stx = ('AK', '$AL$4') if q == 'Verbund' else ('AS', '$AU$4')
        ln.add_series({'name': '=Diagrammdaten!%s' % stx, 'categories': kat, 'values': '=Diagrammdaten!$%s$4:$%s$10' % (sw, sw),
                       'marker': {'type': 'none'}, 'line': {'color': GRAUD, 'width': 1.25, 'dash_type': 'dash'}})   # Wert steht in der Legende
        ch.combine(ln)
        basis(ch)
        legende(ch, [len(reihen)])
        ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True}, 'layout': PLOT_PPT_RUECK})
        w = werte['rueckstand'][q]
        ymax = achsen_ende(max([sum(s) for s in w if s] or [0]))
        if q == 'Verbund' and ymax > 0:
            ymax = max(ymax, achsen_ende(SLA_VERBUND, 1.15))
        geom = None
        if ymax > 0:
            ch.set_y_axis({'visible': False, 'major_gridlines': {'visible': False}, 'min': 0, 'max': ymax})
            # wie modCockpit.EtikettenAuslagern (7 pt): passt ein Wert nicht ins Segment, steht er rechts dicht neben der Saeule auf weissem Grund
            geom = {'art': 'saeulen', 'b': b, 'h': h, 'layout': PLOT_PPT_RUECK, 'gap': GAP_PPT_STAPEL, 'werte': w, 'ymin': 0, 'ymax': ymax, 'formate': ['#,##0.0,'] * len(reihen), 'label_h': 11.5, 'zeichen': 5.0,
                    'rechts': True, 'abstand': 2 * PT, 'hinterlegt': True}
        return ch, geom

    def bewegung(q):
        # Summen je Periode: Eingaenge ueber der Achse, Abgaenge darunter, Delta als Punktlinie
        ch = wb.add_chart({'type': 'column'})
        cols = {'OPAG': ['K', 'L', 'M'], 'Verbund': ['N', 'O', 'P']}[q]
        kat = '=Diagrammdaten!$BT$4:$BT$10' if q == 'OPAG' else '=Diagrammdaten!$BU$4:$BU$10'     # Achse der Quelle (ohne Stern)
        ch.add_series({'name': 'Eingänge', 'categories': kat, 'values': '=Diagrammdaten!$%s$4:$%s$10' % (cols[0], cols[0]),
                       'fill': {'color': GRAUD}, 'border': {'none': True}, 'gap': 80, 'overlap': 100, 'data_labels': {**lab('#,##0;#,##0;', GRAUD), 'position': 'outside_end'}})
        ch.add_series({'name': 'Abgänge', 'categories': kat, 'values': '=Diagrammdaten!$%s$4:$%s$10' % (cols[1], cols[1]),
                       'fill': {'color': TEAL}, 'border': {'none': True}, 'data_labels': {**lab('#,##0;#,##0;', TEALD), 'position': 'outside_end'}})
        # Delta (Eingaenge minus Abgaenge) als Box in eigener Zeile unter den Abgaengen, ueber den Datumsangaben:
        # gruen = Abbau, gelb = Aufbau (Text aus Diagrammdaten)
        ln = wb.add_chart({'type': 'line'})
        b0 = 47 if q == 'OPAG' else 50
        text_col = xl_col_to_name(b0 + 2)
        for k, (nm, fuellung, schrift) in enumerate((('Δ Abbau', GRUENH, GRUEN), ('Δ Aufbau', GELBH, GELBD))):
            custom = [{'value': '=Diagrammdaten!$%s$%d' % (text_col, 4 + t), 'font': {'name': FONT, 'size': 7, 'bold': True, 'color': schrift},
                       'fill': {'color': fuellung}, 'border': {'none': True}} for t in range(7)]
            ln.add_series({'name': nm, 'categories': kat, 'values': '=Diagrammdaten!$%s$4:$%s$10' % (xl_col_to_name(b0 + k), xl_col_to_name(b0 + k)),
                           'line': {'none': True}, 'marker': {'type': 'none'},
                           'data_labels': {'value': True, 'position': 'center', 'custom': custom, 'font': {'name': FONT, 'size': 7, 'bold': True, 'color': schrift},
                                           'fill': {'color': fuellung}, 'border': {'none': True}}})
        ch.combine(ln)
        basis(ch)
        legende(ch, [2, 3])
        ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True}, 'layout': PLOT_PPT_BEWEG})
        ch.set_x_axis({'num_font': {'name': FONT, 'size': 7, 'color': GRAU}, 'line': {'color': GRAUL, 'width': 0.75}, 'major_gridlines': {'visible': False},
                       'major_tick_mark': 'none', 'label_position': 'low'})
        return ch

    def mak_chart():
        ch = wb.add_chart({'type': 'column', 'subtype': 'stacked'})
        k2 = ber['kw2']
        k1 = max(6, k2 - 6)
        k2 = k1 + 6
        kwb = lambda col: '=KW!$%s$%d:$%s$%d' % (col, k1, col, k2)  # noqa: E731
        ch.add_series({'name': 'MAK Komp./Leben', 'categories': kwb('C'), 'values': kwb('M'), 'fill': {'color': TEAL}, 'border': {'color': WEISS, 'width': 0.5}, 'gap': 70,
                       'data_labels': lab('0.0;0.0;')})
        ch.add_series({'name': 'MAK KV', 'categories': kwb('C'), 'values': kwb('L'), 'fill': {'color': ROT}, 'border': {'color': WEISS, 'width': 0.5},
                       'data_labels': lab('0.0;0.0;')})
        ln = wb.add_chart({'type': 'line'})
        ln.add_series({'name': 'MAK gesamt', 'categories': kwb('C'), 'values': kwb('N'), 'line': {'none': True}, 'marker': {'type': 'none'},
                       'data_labels': lab_sum('0.0;0.0;', 'above')})
        # Produktivitaet (Abgaenge je MAK) als Box-Zeilen unter den Saeulen: Verbund (Vorgaenge), darunter OPAG (Arbeitsgueter).
        # Lage und Text aus Diagrammdaten!BC:BH (Fenster wie das MAK-Diagramm); der Legendeneintrag zeigt die Box im selben Ton.
        for nm, lage, text, fuellung, schrift in (('Vorgänge je MAK', 'BD', 'BE', TEALL, TEALD), ('Arbeitsgüter je MAK', 'BF', 'BG', ROTL, ROTD)):
            custom = [{'value': '=Diagrammdaten!$%s$%d' % (text, 4 + t), 'font': {'name': FONT, 'size': 7, 'bold': True, 'color': schrift},
                       'fill': {'color': fuellung}, 'border': {'none': True}} for t in range(7)]
            ln.add_series({'name': nm, 'categories': kwb('C'), 'values': '=Diagrammdaten!$%s$4:$%s$10' % (lage, lage),
                           'line': {'none': True}, 'marker': {'type': 'square', 'size': 6, 'fill': {'color': fuellung}, 'border': {'color': schrift, 'width': 0.75}},
                           'data_labels': {'value': True, 'position': 'center', 'custom': custom, 'font': {'name': FONT, 'size': 7, 'bold': True, 'color': schrift},
                                           'fill': {'color': fuellung}, 'border': {'none': True}}})
        ch.combine(ln)
        basis(ch, '0.0')
        legende(ch, [2])
        ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True}, 'layout': PLOT_PPT_STAPEL})
        ch.set_x_axis({'num_font': {'name': FONT, 'size': 7, 'color': GRAU}, 'line': {'color': GRAUL, 'width': 0.75}, 'major_gridlines': {'visible': False},
                       'major_tick_mark': 'none', 'minor_tick_mark': 'none', 'label_position': 'low'})
        return ch

    def alter_chart():
        ch = wb.add_chart({'type': 'bar', 'subtype': 'percent_stacked'})
        for i, t in enumerate(['0–7 Tage', '8–30 Tage', '31–90 Tage', 'über 90 Tage']):
            col = xl_col_to_name(14 + i)
            ch.add_series({'name': t, 'categories': '=Filter!$N$15:$N$16', 'values': '=Filter!$%s$15:$%s$16' % (col, col),
                           'fill': {'color': FARBE_ALTER[i]}, 'border': {'color': WEISS, 'width': 1}, 'gap': 60,
                           'data_labels': {'value': True, 'num_format': '#,##0;#,##0;', 'font': {'name': FONT, 'size': 7, 'color': SW if i < 2 else WEISS}}})
        basis(ch)
        ch.set_x_axis({'visible': False, 'major_gridlines': {'visible': False}})
        ch.set_y_axis({'num_font': {'name': FONT, 'size': 8, 'color': GRAUD, 'bold': True}, 'line': {'none': True}, 'major_gridlines': {'visible': False},
                       'major_tick_mark': 'none', 'reverse': True})
        ch.set_plotarea({'border': {'none': True}, 'fill': {'none': True}, 'layout': PLOT_PPT_ALTER})
        return ch

    ch, g = stapel('OPAG')
    kachel(0, 'Rückstand OPAG (Arbeitsgüter, in Tsd.)', FARBE_OPAG, '=PPT!$BA$5', ch, g, fuss='=PPT!$BA$14')
    ch, g = stapel('Verbund')
    kachel(1, 'Rückstand Verbund (Vorgänge, in Tsd.)', FARBE_VERBUND, '=PPT!$BA$6', ch, g, fuss='=PPT!$BA$15')
    kachel(2, 'Kapazität (MAK) und Produktivität je KW', FARBE_NEUTRAL, '=PPT!$BA$9', mak_chart(), fuss='=PPT!$BA$13')
    kachel(3, 'Eingänge / Abgänge OPAG', FARBE_OPAG, '=PPT!$BA$7', bewegung('OPAG'))
    kachel(4, 'Eingänge / Abgänge Verbund', FARBE_VERBUND, '=PPT!$BA$8', bewegung('Verbund'))
    kachel(5, 'Altersstruktur des Rückstands', FARBE_NEUTRAL, '=PPT!$BA$10', alter_chart(),
           {'kennung': 'PPT-Alter', 'art': 'balken_prozent', 'b': b, 'h': h, 'layout': PLOT_PPT_ALTER, 'gap': 60,
            'werte': werte['alter'], 'formate': ['#,##0'] * 4, 'dunkel': 2, 'ausblenden': True})
    ws.set_landscape()
    ws.set_paper(9)
    ws.fit_to_pages(1, 1)
    ws.print_area(0, 0, 40, 50)


# ------------------------------------------------------------------ Nachbearbeitung des Pakets: Makros an Textfelder, Kontrollkaestchen in VML, VBA-Projekt
def px_spalte(ws, col):
    return sum(ws._size_col(c) for c in range(col))


def px_zeile(ws, row):
    return sum(ws._size_row(r) for r in range(row))


def nachbearbeiten(vba_bin):
    tmp = OUT + '.tmp'
    zin = zipfile.ZipFile(OUT)
    zout = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
    namen = zin.namelist()
    zeichnungen = [n for n in namen if re.match(r'xl/drawings/drawing\d+\.xml$', n)]
    for n in namen:
        daten = zin.read(n)
        if n in zeichnungen:
            text = daten.decode('utf-8')
            liste = next((kn for kn in KNOEPFE_LISTEN if all(('<a:t>%s</a:t>' % k[2]) in text for k in kn)), None)
            if liste:
                bloecke = re.split(r'(?=<xdr:twoCellAnchor)', text)
                belegt = set()
                for (_zr, _zc, knopf, makro, _f, _b, _h, nm, _s, _fett, _l, _y) in liste:
                    for i, bl in enumerate(bloecke):
                        if i in belegt or '<xdr:sp ' not in bl or ('<a:t>%s</a:t>' % knopf) not in bl:
                            continue
                        bl = bl.replace('<xdr:sp macro=""', '<xdr:sp macro="[0]!%s"' % makro, 1)
                        bl = re.sub(r'(<xdr:cNvPr id="\d+" name=")[^"]*(")', lambda m: m.group(1) + nm + m.group(2), bl, count=1)
                        bl = bl.replace('<a:prstGeom prst="rect">', '<a:prstGeom prst="roundRect">', 1)
                        # Knopftext nie umbrechen (Excel brach „Vorgang öffnen ›“ und „Wochensicht · 7 KW“ je nach Schrift um)
                        bl = re.sub(r'(<a:bodyPr[^>]*?)wrap="square"', r'\1wrap="none"', bl, count=1)
                        if nm == 'BTN_Aeltester':          # durchsichtig, aber klickbar (Fuellung mit Deckkraft 0)
                            bl = bl.replace('<a:srgbClr val="FFFFFF"/></a:solidFill>', '<a:srgbClr val="FFFFFF"><a:alpha val="0"/></a:srgbClr></a:solidFill>', 1)
                        bloecke[i] = bl
                        belegt.add(i)
                        break
                    else:
                        raise RuntimeError('Schaltflaeche nicht gefunden: ' + knopf)
                daten = ''.join(bloecke).encode('utf-8')
        if re.match(r'xl/charts/chart\d+\.xml$', n):
            text = daten.decode('utf-8')
            if n in BW_DATEIEN:                                        # Delta-Boxen: abgerundetes Rechteck (Datenbeschriftung mit Füllung)
                text = text.replace('<c:spPr><a:solidFill>', '<c:spPr><a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom><a:solidFill>')
                # Form waechst mit dem Text (ohne das kuerzt Excel eine Beschriftung mit Form auf die Groesse des Zwischenspeichers, "-…")
                text = text.replace('<c:txPr><a:bodyPr/>', '<c:txPr><a:bodyPr wrap="none" lIns="38100" tIns="19050" rIns="38100" bIns="19050" '
                                                            'anchor="ctr" anchorCtr="1"><a:spAutoFit/></a:bodyPr>')
                for ref, wert in BW_TEXTE.get(n, {}).items():
                    text = text.replace('<c:f>%s</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>0</c:v>' % ref,
                                        '<c:f>%s</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>%s</c:v>' % (ref, wert))
            for g in GEOMETRIE:
                if g.get('datei') == n:
                    text = etiketten_eintragen(text, g)
                    for ref, wert in g.get('texte', {}).items():      # Zwischenspeicher der verknuepften Beschriftungen (fuer Vorschau ohne Neuberechnung)
                        text = text.replace('<c:f>%s</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>0</c:v>' % ref,
                                            '<c:f>%s</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>%s</c:v>' % (ref, wert))
            daten = text.encode('utf-8')
        zout.writestr(zin.getinfo(n), daten)
    zin.close()
    zout.close()
    os.replace(tmp, OUT)


def vba_bin_schreiben():
    import vba_pruefung
    befunde = vba_pruefung.pruefe(os.path.join(HIER, 'vba'))
    if befunde:
        raise SystemExit('VBA-Pruefung fehlgeschlagen (Excel wuerde nicht kompilieren):\n' + '\n'.join(befunde))
    module = []
    for name, datei in [('modLaden', 'modLaden.bas'), ('modCockpit', 'modCockpit.bas'), ('modPPT', 'modPPT.bas'), ('modFortschritt', 'modFortschritt.bas'),
                         ('modTagesablauf', 'modTagesablauf.bas'), ('modFolienauswahl', 'modFolienauswahl.bas'), ('modStandard', 'modStandard.bas'),
                         ('modWerkzeuge', 'modWerkzeuge.bas'), ('modUpdate', 'modUpdate.bas')]:
        module.append((name, open(os.path.join(HIER, 'vba', datei), encoding='utf-8').read(), False))
    module.insert(0, ('ThisWorkbook', 'Option Explicit\r\n\r\nPrivate Sub Workbook_Open()\r\n    On Error Resume Next\r\n    \' Reste von Ladefenster (LADE_*) und Hinweis-Karte (HINW_) entfernen, falls eine Datei mit ihnen gespeichert wurde\r\n    modFortschritt.FortschrittSchliessen\r\n    modFortschritt.HinweisEntfernen\r\n    modCockpit.RechnenPruefen\r\n    modCockpit.WochensichtBeimOeffnen\r\n    modCockpit.FilterAnzeigen\r\n    modCockpit.DiagrammeAnpassen\r\n    modWerkzeuge.EinheitKnopfBeschriften\r\nEnd Sub\r\n', 'workbook'))
    module.insert(1, ('Cockpit', open(os.path.join(HIER, 'vba', 'Cockpit.cls'), encoding='utf-8').read(), 'sheet'))
    module.insert(2, ('Rohdatenblatt', open(os.path.join(HIER, 'vba', 'Rohdatenblatt.cls'), encoding='utf-8').read(), 'sheet'))
    module.insert(3, ('Kalender', open(os.path.join(HIER, 'vba', 'Kalender.cls'), encoding='utf-8').read(), 'sheet'))
    pfad = os.path.join(HIER, 'vbaProject.bin')
    open(pfad, 'wb').write(ovba.vba_projekt(module))
    return pfad


if __name__ == '__main__':
    vba = vba_bin_schreiben()
    ziel_master = OUT
    sla_hs, pk_hs = SLA_VERBUND, list(POSTKOERBE_AKTIV)
    for bereich, leer, ziel in (('HS', True, ziel_master), ('HS', False, OUT_DEMO), ('MAKLER', True, OUT_MAKLER)):
        OUT, BEREICH = ziel, bereich
        # Makler: keine SLA-Vorgabe (0 = keine Linie, im Cockpit „SLA anpassen …“), keine HS-Postkoerbe vorbelegt
        SLA_VERBUND, POSTKOERBE_AKTIV = (sla_hs, pk_hs) if bereich == 'HS' else (0, [])
        bauen(vba, leer=leer)
        nachbearbeiten(vba)
        print('geschrieben:', OUT)
