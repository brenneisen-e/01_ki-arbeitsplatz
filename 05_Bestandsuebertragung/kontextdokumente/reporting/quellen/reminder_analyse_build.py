# -*- coding: utf-8 -*-
"""Baut die Reminder-Analyse als durchformelte, professionell formatierte Arbeitsmappe."""
import collections, datetime, re
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.comments import Comment
from openpyxl.chart import LineChart, BarChart, Reference
from openpyxl.utils import get_column_letter as L
from openpyxl.worksheet.table import Table, TableStyleInfo

import os, sys
MODE = sys.argv[1] if len(sys.argv) > 1 else 'werte'
SRC = 'jdc.xlsx'; OUT = sys.argv[2] if len(sys.argv) > 2 else 'Reminder-Analyse_JDC_13.07.-07.09.2026.xlsx'
ROT, ROT_HELL, PASTELL, GRAU, GRAU_HELL, BLAU = '8B1A2B', 'C41230', 'FEF2F2', 'D9D9D9', 'F7F7F7', '0000FF'
FONT = 'Aptos'
def f(size=10, bold=False, color='000000', italic=False): return Font(name=FONT, size=size, bold=bold, color=color, italic=italic)
FILL_KOPF = PatternFill('solid', fgColor=ROT); FILL_SEK = PatternFill('solid', fgColor=PASTELL); FILL_ZEBRA = PatternFill('solid', fgColor=GRAU_HELL)
FILL_SUM = PatternFill('solid', fgColor='EFE3E5')
DUENN = Side(style='thin', color=GRAU); RAHMEN = Border(left=DUENN, right=DUENN, top=DUENN, bottom=DUENN)
LINKS = Alignment(horizontal='left', vertical='center', wrap_text=False); RECHTS = Alignment(horizontal='right', vertical='center')
MITTE = Alignment(horizontal='center', vertical='center', wrap_text=True)
NUM, PCT, DAT, ZEIT = '#,##0', '0.0%', 'DD.MM.YYYY', 'HH:MM'
KANAL_B, KANAL_M = 'bestandsuebertragungen@ergo.de', 'maklerauftraege@ergo.de'

def dat(s):
    if isinstance(s, datetime.date): return s
    if isinstance(s, str) and re.match(r'\d\d\.\d\d\.\d{4}$', s): return datetime.datetime.strptime(s, '%d.%m.%Y').date()
    return s

src = openpyxl.load_workbook(SRC, data_only=True)
m_src = src['Mails']; hdr = [c.value for c in m_src[1]]; ix = {h: i for i, h in enumerate(hdr)}
rows = [list(r) for r in m_src.iter_rows(min_row=2, values_only=True) if r[0] is not None]
N = len(rows) + 1                       # letzte Datenzeile im Blatt Mails
kw_src = [r for r in src['KW-Verlauf'].iter_rows(min_row=2, values_only=True) if r[0] and r[0] != 'Summe']
vert_src = [r for r in src['Reminder je Vertrag'].iter_rows(min_row=2, values_only=True) if r[0] is not None]
meta = {r[0]: r[1] for r in src['Uebersicht'].iter_rows(min_row=1, max_row=9, values_only=True) if r[0]}

wb = openpyxl.Workbook()
# ------------------------------------------------------------------ Blatt Mails (Einzelliste)
wm = wb.active; wm.title = 'Mails'
wm.append(hdr)
for r in rows:
    r[ix['Datum']] = dat(r[ix['Datum']]); r[ix['Erstvorgang Datum']] = dat(r[ix['Erstvorgang Datum']])
    for j, v in enumerate(r):
        if isinstance(v, str): r[j] = v.replace('​', '').strip() or None
    wm.append(r)
for c in wm[1]:
    c.font = f(10, True, 'FFFFFF'); c.fill = FILL_KOPF; c.alignment = MITTE; c.border = RAHMEN
wm.row_dimensions[1].height = 32
for row in wm.iter_rows(min_row=2, max_row=N):
    for c in row: c.font = f(10)
col_D, col_Z, col_AA = ix['Datum'] + 1, ix['Uhrzeit'] + 1, ix['Erstvorgang Datum'] + 1
for row in wm.iter_rows(min_row=2, max_row=N, min_col=col_D, max_col=col_D):
    row[0].number_format = DAT
for row in wm.iter_rows(min_row=2, max_row=N, min_col=col_Z, max_col=col_Z):
    row[0].number_format = ZEIT
for row in wm.iter_rows(min_row=2, max_row=N, min_col=col_AA, max_col=col_AA):
    row[0].number_format = DAT
breiten = {'Nr': 7, 'Datum': 11, 'Uhrzeit': 8, 'Wochentag': 10, 'KW': 11, 'Postfach': 26, 'Ordner': 34, 'Eingangskanal': 28,
           'Absender Name': 30, 'Absender E-Mail': 34, 'Absender Domain': 22, 'Empfänger (An)': 40, 'Betreff': 70,
           'Vorgangsart': 30, 'Erinnerung': 11, 'Erinnerung BÜ': 13, 'Von JDC': 9, 'Kunde': 28, 'Vertragsnummer': 18,
           'Sparte': 11, 'Sparte-Detail': 24, 'Rangstufe': 26, 'Agentur-Nr': 12, 'Vermittler-Nr': 13, 'Anhänge': 9,
           'Erstvorgang im Scan': 14, 'Erstvorgang Datum': 13, 'Tage seit Erstvorgang': 12, 'Erinnerung Nr. je Vertrag': 12, 'JDC erkannt über': 22}
for h, w in breiten.items(): wm.column_dimensions[L(ix[h] + 1)].width = w
wm.freeze_panes = 'C2'; wm.auto_filter.ref = f'A1:{L(len(hdr))}{N}'
wm.sheet_view.zoomScale = 90

def rng(h): col = L(ix[h] + 1); return f"Mails!${col}$2:${col}${N}"
R_KW, R_KAN, R_ERI, R_JDC, R_ART, R_SP, R_VNR, R_ABS, R_KUN, R_DAT, R_ERST = (rng(h) for h in
    ('KW', 'Eingangskanal', 'Erinnerung', 'Von JDC', 'Vorgangsart', 'Sparte', 'Vertragsnummer', 'Absender E-Mail', 'Kunde', 'Datum', 'Erstvorgang im Scan'))

# ------------------------------------------------------------------ Hilfsfunktionen Layout
def kopfzeile(ws, r, werte, start=1, hoehe=30):
    for j, v in enumerate(werte):
        c = ws.cell(row=r, column=start + j, value=v)
        c.font = f(10, True, 'FFFFFF'); c.fill = FILL_KOPF; c.alignment = MITTE; c.border = RAHMEN
    ws.row_dimensions[r].height = hoehe
def titel(ws, r, text, size=16):
    c = ws.cell(row=r, column=1, value=text); c.font = f(size, True, ROT); ws.row_dimensions[r].height = size * 1.8
def sektion(ws, r, text, bis):
    for j in range(1, bis + 1):
        c = ws.cell(row=r, column=j); c.fill = FILL_SEK
    c = ws.cell(row=r, column=1, value=text); c.font = f(11, True, ROT); ws.row_dimensions[r].height = 22
def zelle(ws, r, cidx, v, fmt=None, bold=False, color='000000', align=None, fill=None):
    c = ws.cell(row=r, column=cidx, value=v); c.font = f(10, bold, color); c.border = RAHMEN
    if fmt: c.number_format = fmt
    c.alignment = align or (RECHTS if (fmt or (isinstance(v, str) and v.startswith('='))) else LINKS)
    if fill: c.fill = fill
    return c
def zebra(ws, r, bis, an):
    if an:
        for j in range(1, bis + 1): ws.cell(row=r, column=j).fill = FILL_ZEBRA

# ------------------------------------------------------------------ Blatt KW-Verlauf
wk = wb.create_sheet('KW-Verlauf', 0)
titel(wk, 1, 'Reminder-Analyse – Wochenverlauf je Eingangskanal')
wk['A2'] = ('Blau hinterlegte Werte sind Eingaben aus der Postfachzählung (alle Mails der Woche). Alle übrigen Zahlen '
            'sind Formeln auf Basis der Einzelliste im Blatt „Mails“ (nur Erinnerungen und BÜ-Erstvorgänge erfasst).')
wk['A2'].font = f(9, italic=True, color='595959'); wk.merge_cells('A2:L2'); wk['A2'].alignment = Alignment(wrap_text=True, vertical='top'); wk.row_dimensions[2].height = 28
KOPF_KW = ['KW', 'Zeitraum (Mo–So)', 'Mails\nBestandsübertr.', 'Erinnerungen\nBestandsübertr.', 'JDC-Erinnerungen\nBestandsübertr.',
           'Mails\nMaklerauftr.', 'Erinnerungen\nMaklerauftr.', 'JDC-Erinnerungen\nMaklerauftr.', 'Mails\ngesamt', 'Erinnerungen\ngesamt', 'JDC-Erinnerungen\ngesamt', 'Quote JDC an\nallen Mails']
kopfzeile(wk, 4, KOPF_KW, hoehe=44)
r0 = 5
for i, kw in enumerate(kw_src):
    r = r0 + i
    zelle(wk, r, 1, kw[0], bold=True); zelle(wk, r, 2, kw[1])
    c = zelle(wk, r, 3, kw[2], NUM, color=BLAU); c.fill = PatternFill('solid', fgColor='FFF9E6')
    zelle(wk, r, 4, f'=COUNTIFS({R_KW},$A{r},{R_KAN},"{KANAL_B}",{R_ERI},"ja")', NUM)
    zelle(wk, r, 5, f'=COUNTIFS({R_KW},$A{r},{R_KAN},"{KANAL_B}",{R_ERI},"ja",{R_JDC},"ja")', NUM)
    c = zelle(wk, r, 6, kw[5], NUM, color=BLAU); c.fill = PatternFill('solid', fgColor='FFF9E6')
    zelle(wk, r, 7, f'=COUNTIFS({R_KW},$A{r},{R_KAN},"{KANAL_M}",{R_ERI},"ja")', NUM)
    zelle(wk, r, 8, f'=COUNTIFS({R_KW},$A{r},{R_KAN},"{KANAL_M}",{R_ERI},"ja",{R_JDC},"ja")', NUM)
    zelle(wk, r, 9, f'=C{r}+F{r}', NUM); zelle(wk, r, 10, f'=D{r}+G{r}', NUM); zelle(wk, r, 11, f'=E{r}+H{r}', NUM)
    zelle(wk, r, 12, f'=IFERROR(K{r}/I{r},0)', PCT)
    zebra(wk, r, 12, i % 2 == 1)
rs = r0 + len(kw_src)
zelle(wk, rs, 1, 'Summe', bold=True, fill=FILL_SUM); zelle(wk, rs, 2, '', fill=FILL_SUM)
for j in range(3, 12): zelle(wk, rs, j, f'=SUM({L(j)}{r0}:{L(j)}{rs-1})', NUM, bold=True, fill=FILL_SUM)
zelle(wk, rs, 12, f'=IFERROR(K{rs}/I{rs},0)', PCT, bold=True, fill=FILL_SUM)
wk['C4'].comment = Comment('Eingabe: Gesamtzahl aller Mails der Woche im Postfach laut Postfachzählung vom 07.09.2026. '
                           'Nicht aus der Einzelliste ableitbar, da dort nur Erinnerungen und BÜ-Erstvorgänge enthalten sind.', 'Eike Brenneisen')
wk['F4'].comment = Comment('Eingabe: Gesamtzahl aller Mails der Woche im Postfach laut Postfachzählung vom 07.09.2026.', 'Eike Brenneisen')
wk[f'A{rs+1}'] = 'KW37 umfasst nur den 07.09.2026 (Stand der Auswertung). Bestandsübertr. = bestandsuebertragungen@ergo.de, Maklerauftr. = maklerauftraege@ergo.de.'; wk[f'A{rs+1}'].font = f(9, italic=True, color='595959')
for col, w in zip('ABCDEFGHIJKL', (12, 24, 15, 15, 17, 14, 14, 17, 12, 13, 17, 13)): wk.column_dimensions[col].width = w
wk.freeze_panes = 'C5'; wk.sheet_view.showGridLines = False
# Diagramm
ch = LineChart(); ch.title = 'Erinnerungen je Kalenderwoche'; ch.style = 2; ch.height = 8.5; ch.width = 22
ch.y_axis.title = 'Anzahl'; ch.x_axis.title = None; ch.y_axis.number_format = '#,##0'; ch.legend.position = 'b'
data = Reference(wk, min_col=10, min_row=4, max_col=11, max_row=rs - 1); cats = Reference(wk, min_col=1, min_row=r0, max_row=rs - 1)
ch.add_data(data, titles_from_data=True); ch.set_categories(cats)
ch.series[0].graphicalProperties.line.solidFill = '7F7F7F'; ch.series[0].graphicalProperties.line.width = 22000
ch.series[1].graphicalProperties.line.solidFill = ROT; ch.series[1].graphicalProperties.line.width = 30000
ch.series[0].smooth = False; ch.series[1].smooth = False
wk.add_chart(ch, f'A{rs+3}')

# ------------------------------------------------------------------ Blatt Reminder je Vertrag
wv = wb.create_sheet('Reminder je Vertrag', 1)
titel(wv, 1, 'Erinnerungen je Vertrag')
wv['A2'] = (('Die Zählung je Vertrag ist eine Formel über die Einzelliste (Blatt „Mails“). Zeilen ohne Vertragsnummer sind je Vorgang zusammengefasst und als Werte aus der Auswertung vom 07.09.2026 übernommen. '
             if MODE == 'formeln' else 'Die Zählung je Vertrag stammt aus der Auswertung der Einzelliste (Blatt „Mails“) vom 07.09.2026; Zeilen ohne Vertragsnummer sind je Absender zusammengefasst. ')
            + 'Erste/letzte Erinnerung, Erstvorgang, Rangstufe und Absender stammen aus derselben Auswertung. Tage bis zur letzten Erinnerung sind eine Formel.')
wv['A2'].font = f(9, italic=True, color='595959'); wv.merge_cells('A2:N2'); wv['A2'].alignment = Alignment(wrap_text=True, vertical='top'); wv.row_dimensions[2].height = 28
KOPF_V = ['Nr', 'Vertragsnummer', 'Kunde', 'Sparte', 'Eingangskanal', 'Erinnerungen gesamt', 'davon JDC', 'Erste Erinnerung', 'Letzte Erinnerung',
          'Erstvorgang im Scan', 'Erstvorgang Datum', 'Tage Erstvorgang bis letzte Erinnerung', 'Rangstufe', 'Absender (letzte)']
kopfzeile(wv, 4, KOPF_V, hoehe=44)
v0 = 5
for i, v in enumerate(vert_src):
    r = v0 + i
    vnr, kunde, sparte, kanal, erst_scan, erst_dat, rang, absender = v[1], v[2], v[3], v[4], v[9], dat(v[10]), v[12], v[13]
    kunde = (kunde or '').replace('​', '').strip() or None; rang = (rang or '').replace('​', '').strip() or None
    if vnr == '(ohne VNR)':
        krit = f'{R_VNR},"",{R_ABS},$N{r},{R_KAN},$E{r},{R_ERI},"ja"'
    else:
        krit = f'{R_VNR},$B{r},{R_KAN},$E{r},{R_ERI},"ja"'
    zelle(wv, r, 1, i + 1, NUM); zelle(wv, r, 2, vnr); zelle(wv, r, 3, kunde); zelle(wv, r, 4, sparte); zelle(wv, r, 5, kanal)
    if MODE == 'formeln' and vnr != '(ohne VNR)':
        zelle(wv, r, 6, f'=COUNTIFS({krit})', NUM); zelle(wv, r, 7, f'=COUNTIFS({krit},{R_JDC},"ja")', NUM)
    else:
        zelle(wv, r, 6, v[5], NUM); zelle(wv, r, 7, v[6], NUM)
    zelle(wv, r, 8, dat(v[7]), DAT); zelle(wv, r, 9, dat(v[8]), DAT)
    zelle(wv, r, 10, erst_scan); zelle(wv, r, 11, erst_dat, DAT if erst_dat else None)
    zelle(wv, r, 12, f'=IF(AND(ISNUMBER(K{r}),ISNUMBER(I{r})),I{r}-K{r},"")', NUM)
    zelle(wv, r, 13, rang); zelle(wv, r, 14, absender)
    zebra(wv, r, 14, i % 2 == 1)
vN = v0 + len(vert_src) - 1
for col, w in zip('ABCDEFGHIJKLMN', (6, 18, 30, 11, 28, 12, 10, 13, 13, 12, 13, 14, 26, 36)): wv.column_dimensions[col].width = w
wv.freeze_panes = 'C5'; wv.auto_filter.ref = f'A4:N{vN}'; wv.sheet_view.showGridLines = False
V_KAN, V_ANZ, V_ERST = f"'Reminder je Vertrag'!$E$5:$E${vN}", f"'Reminder je Vertrag'!$F$5:$F${vN}", f"'Reminder je Vertrag'!$J$5:$J${vN}"

# ------------------------------------------------------------------ Blatt Übersicht
wu = wb.create_sheet('Übersicht', 0)
titel(wu, 1, 'Reminder-Analyse – Erinnerungen je Eingangskanal', 18)
wu['A2'] = 'Makler BÜ meets KI | Auswertung der Erinnerungen (Reminder) von JDC und weiteren Absendern'; wu['A2'].font = f(11, color='595959')
r = 4
for k, v in (('Zeitraum', meta.get('Zeitraum:')), ('Postfach 1', meta.get('Ordner 1:')), ('Postfach 2', meta.get('Ordner 2:')),
             ('Eingangskanäle', meta.get('Eingangskanäle:')), ('Reminder-Absender (JDC)', meta.get('Reminder-Absender (JDC):')),
             ('Reminder-Stichwörter', meta.get('Reminder-Stichwörter:')), ('Erstellt am', meta.get('Erstellt am:')), ('Erstellt von', 'Eike Brenneisen (Deloitte) für HSB4K')):
    wu.cell(row=r, column=1, value=k).font = f(10, True); c = wu.cell(row=r, column=2, value=v); c.font = f(10); wu.merge_cells(start_row=r, start_column=2, end_row=r, end_column=8); r += 1
r += 1
sektion(wu, r, 'Kernzahlen', 8); r += 1
KZ = [
 ('Mails gesamt im Zeitraum', f"='KW-Verlauf'!I{rs}", NUM, 'Summe der Postfachzählung (Blatt KW-Verlauf, blaue Eingaben)'),
 ('Erinnerungen gesamt', f'=COUNTIFS({R_ERI},"ja")', NUM, 'Einzelliste, Spalte Erinnerung = ja'),
 ('davon von JDC / Jung DMS', f'=COUNTIFS({R_ERI},"ja",{R_JDC},"ja")', NUM, 'Einzelliste, Von JDC = ja'),
 ('davon von sonstigen Absendern', f'=B{r+1}-B{r+2}', NUM, ''),
 ('Anteil JDC-Erinnerungen an allen Mails', f'=IFERROR(B{r+2}/B{r},0)', PCT, ''),
 ('Anteil JDC-Erinnerungen an allen Erinnerungen', f'=IFERROR(B{r+2}/B{r+1},0)', PCT, ''),
 ('BÜ-Erstvorgänge (Betreff „Bestandsübertragung“)', f'=COUNTIFS({R_ART},"Bestandsübertragung (Erstvorgang)")', NUM, 'Einzelliste, Vorgangsart'),
 ('Verträge mit Erinnerung', f"=COUNTA('Reminder je Vertrag'!$B$5:$B${vN})", NUM, 'Blatt Reminder je Vertrag'),
 ('davon mit mehr als einer Erinnerung', f'=COUNTIF({V_ANZ},">1")', NUM, ''),
 ('davon ohne Erstvorgang im Scan', f'=COUNTIF({V_ERST},"nein")', NUM, 'VNR im Zeitraum nicht als Nicht-Erinnerung gefunden'),
 ('Ø Erinnerungen je Vertrag', f'=IFERROR(B{r+1}/B{r+7},0)', '0.00', ''),
]
kz0 = r
for i, (k, form, fmt, quelle) in enumerate(KZ):
    zelle(wu, r, 1, k, bold=(i in (0, 1, 2))); zelle(wu, r, 2, form, fmt, bold=(i in (0, 1, 2)))
    c = wu.cell(row=r, column=3, value=quelle); c.font = f(9, italic=True, color='595959')
    zebra(wu, r, 2, i % 2 == 1); r += 1
r += 1
sektion(wu, r, 'Je Eingangskanal', 11); r += 1
kopfzeile(wu, r, ['Eingangskanal', 'Mails gesamt', 'Erinnerungen gesamt', 'davon JDC', 'davon sonstige', 'Quote JDC an Mails', 'Quote Erinnerungen an Mails',
                  'BÜ-Erstvorgänge', 'Verträge mit Erinnerung', 'Ø Erinnerungen je Vertrag', 'Erinnerungen ohne Erstvorgang im Scan'], hoehe=44); r += 1
ek0 = r
for i, (kanal, spalte) in enumerate(((KANAL_B, 'C'), (KANAL_M, 'F'))):
    zelle(wu, r, 1, kanal, bold=True); zelle(wu, r, 2, f"='KW-Verlauf'!{spalte}{rs}", NUM)
    zelle(wu, r, 3, f'=COUNTIFS({R_KAN},$A{r},{R_ERI},"ja")', NUM); zelle(wu, r, 4, f'=COUNTIFS({R_KAN},$A{r},{R_ERI},"ja",{R_JDC},"ja")', NUM)
    zelle(wu, r, 5, f'=C{r}-D{r}', NUM); zelle(wu, r, 6, f'=IFERROR(D{r}/B{r},0)', PCT); zelle(wu, r, 7, f'=IFERROR(C{r}/B{r},0)', PCT)
    zelle(wu, r, 8, f'=COUNTIFS({R_KAN},$A{r},{R_ART},"Bestandsübertragung (Erstvorgang)")', NUM)
    zelle(wu, r, 9, f'=COUNTIF({V_KAN},$A{r})', NUM); zelle(wu, r, 10, f'=IFERROR(C{r}/I{r},0)', '0.00')
    zelle(wu, r, 11, f'=COUNTIFS({V_KAN},$A{r},{V_ERST},"nein")', NUM)
    zebra(wu, r, 11, i % 2 == 1); r += 1
zelle(wu, r, 1, 'Summe', bold=True, fill=FILL_SUM)
for j in (2, 3, 4, 5, 8, 9, 11): zelle(wu, r, j, f'=SUM({L(j)}{ek0}:{L(j)}{r-1})', NUM, bold=True, fill=FILL_SUM)
zelle(wu, r, 6, f'=IFERROR(D{r}/B{r},0)', PCT, bold=True, fill=FILL_SUM); zelle(wu, r, 7, f'=IFERROR(C{r}/B{r},0)', PCT, bold=True, fill=FILL_SUM)
zelle(wu, r, 10, f'=IFERROR(C{r}/I{r},0)', '0.00', bold=True, fill=FILL_SUM); r += 2
sektion(wu, r, 'JDC-Erinnerungen je Sparte und Eingangskanal', 5); r += 1
kopfzeile(wu, r, ['Sparte', KANAL_B, KANAL_M, 'Gesamt', 'Anteil']); r += 1
sp0 = r
for i, sp in enumerate(('Kranken', 'Komposit', 'Leben', 'Unbekannt', 'ohne VNR')):
    krit_sp = '""' if sp == 'ohne VNR' else f'$A{r}'
    zelle(wu, r, 1, sp, bold=True)
    zelle(wu, r, 2, f'=COUNTIFS({R_KAN},"{KANAL_B}",{R_ERI},"ja",{R_JDC},"ja",{R_SP},{krit_sp})', NUM)
    zelle(wu, r, 3, f'=COUNTIFS({R_KAN},"{KANAL_M}",{R_ERI},"ja",{R_JDC},"ja",{R_SP},{krit_sp})', NUM)
    zelle(wu, r, 4, f'=B{r}+C{r}', NUM); zelle(wu, r, 5, f'=IFERROR(D{r}/$D${sp0+5},0)', PCT)
    zebra(wu, r, 5, i % 2 == 1); r += 1
zelle(wu, r, 1, 'Summe', bold=True, fill=FILL_SUM)
for j in (2, 3, 4): zelle(wu, r, j, f'=SUM({L(j)}{sp0}:{L(j)}{r-1})', NUM, bold=True, fill=FILL_SUM)
zelle(wu, r, 5, f'=IFERROR(D{r}/D{r},0)', PCT, bold=True, fill=FILL_SUM); r += 2
sektion(wu, r, 'Vorgangsarten je Eingangskanal (nach Betreff; nur Erinnerungen und BÜ-Erstvorgänge erfasst)', 4); r += 1
kopfzeile(wu, r, ['Vorgangsart', KANAL_B, KANAL_M, 'Gesamt']); r += 1
va0 = r
for i, art in enumerate(('Bestandsübertragung (Erstvorgang)', 'Erinnerung BÜ', 'Sonstige Erinnerung / Mahnung')):
    zelle(wu, r, 1, art, bold=True)
    zelle(wu, r, 2, f'=COUNTIFS({R_KAN},"{KANAL_B}",{R_ART},$A{r})', NUM); zelle(wu, r, 3, f'=COUNTIFS({R_KAN},"{KANAL_M}",{R_ART},$A{r})', NUM)
    zelle(wu, r, 4, f'=B{r}+C{r}', NUM); zebra(wu, r, 4, i % 2 == 1); r += 1
zelle(wu, r, 1, 'Summe', bold=True, fill=FILL_SUM)
for j in (2, 3, 4): zelle(wu, r, j, f'=SUM({L(j)}{va0}:{L(j)}{r-1})', NUM, bold=True, fill=FILL_SUM)
r += 2
# Top-Absender (Reihenfolge in Python ermittelt, Zaehlung per Formel)
abs_cnt = collections.Counter(r_[ix['Absender E-Mail']] for r_ in rows if r_[ix['Erinnerung']] == 'ja')
sektion(wu, r, 'Absender von Erinnerungen (Top 15)', 5); r += 1
kopfzeile(wu, r, ['Absender', KANAL_B, KANAL_M, 'Gesamt', 'JDC?']); r += 1
for i, (a, _) in enumerate(abs_cnt.most_common(15)):
    zelle(wu, r, 1, a, bold=False)
    zelle(wu, r, 2, f'=COUNTIFS({R_ABS},$A{r},{R_KAN},"{KANAL_B}",{R_ERI},"ja")', NUM); zelle(wu, r, 3, f'=COUNTIFS({R_ABS},$A{r},{R_KAN},"{KANAL_M}",{R_ERI},"ja")', NUM)
    zelle(wu, r, 4, f'=B{r}+C{r}', NUM); zelle(wu, r, 5, f'=IF(OR(ISNUMBER(SEARCH("jungdms",$A{r})),ISNUMBER(SEARCH("jung-dms",$A{r})),ISNUMBER(SEARCH("jdc",$A{r}))),"ja","nein")', align=Alignment(horizontal='center'))
    zebra(wu, r, 5, i % 2 == 1); r += 1
r += 1
kun_cnt = collections.Counter((r_[ix['Kunde']] or '').replace('​', '').strip() for r_ in rows if r_[ix['Erinnerung']] == 'ja')
kun_vnr = collections.defaultdict(set)
for r_ in rows:
    if r_[ix['Erinnerung']] == 'ja': kun_vnr[(r_[ix['Kunde']] or '').replace('​', '').strip()].add(r_[ix['Vertragsnummer']])
sektion(wu, r, 'Kunden mit den meisten Erinnerungen (Top 15)', 3); r += 1
kopfzeile(wu, r, ['Kunde', 'Erinnerungen', 'Anzahl Verträge']); r += 1
for i, (k, _) in enumerate(kun_cnt.most_common(15)):
    if k == '':
        zelle(wu, r, 1, '(ohne Kunde)'); zelle(wu, r, 2, f'=COUNTIFS({R_KUN},"",{R_ERI},"ja")', NUM)
    else:
        zelle(wu, r, 1, k); zelle(wu, r, 2, f'=COUNTIFS({R_KUN},$A{r},{R_ERI},"ja")', NUM)
    c = zelle(wu, r, 3, len(kun_vnr[k]), NUM); zebra(wu, r, 3, i % 2 == 1); r += 1
wu.cell(row=r - 15, column=3).comment = Comment('Anzahl unterschiedlicher Vertragsnummern je Kunde, aus der Einzelliste ermittelt (Stand 07.09.2026).', 'Eike Brenneisen')
r += 1
wu.cell(row=r, column=1, value='Hinweis: „Erstvorgang im Scan“ prüft nur die beiden Archivordner im gewählten Zeitraum. Ein „nein“ bedeutet, dass zur Vertragsnummer '
        'keine Nicht-Erinnerungs-Mail gefunden wurde; der Erstvorgang kann älter sein oder in einem anderen Ordner liegen.').font = f(9, italic=True, color='595959')
wu.merge_cells(start_row=r, start_column=1, end_row=r, end_column=11); wu.cell(row=r, column=1).alignment = Alignment(wrap_text=True, vertical='top'); wu.row_dimensions[r].height = 28
for col, w in zip('ABCDEFGHIJK', (44, 30, 30, 13, 13, 13, 14, 13, 13, 13, 16)): wu.column_dimensions[col].width = w
wu.sheet_view.showGridLines = False; wu.sheet_view.zoomScale = 90
wu.cell(row=kz0 + 0, column=1).comment = Comment('Kernzahlen und Tabellen sind Formeln über die Blätter „Mails“, „KW-Verlauf“ und „Reminder je Vertrag“.', 'Eike Brenneisen')

# Druckeinrichtung: Querformat, auf Seitenbreite
for ws in (wu, wk, wv):
    ws.page_setup.orientation = 'landscape'; ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0; ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_options.horizontalCentered = True; ws.page_margins.left = ws.page_margins.right = 0.4
    ws.oddFooter.center.text = 'Reminder-Analyse JDC | Stand 07.09.2026 | Seite &P von &N'; ws.oddFooter.center.size = 8
wv.print_title_rows = '4:4'; wm.print_title_rows = '1:1'
wm.page_setup.orientation = 'landscape'; wm.page_setup.fitToWidth = 1; wm.page_setup.fitToHeight = 0; wm.sheet_properties.pageSetUpPr.fitToPage = True
# Schriftart in allen Zellen ohne explizite Schrift
for ws in wb.worksheets:
    for row in ws.iter_rows():
        for c in row:
            if c.value is not None and c.font.name != FONT:
                c.font = Font(name=FONT, size=c.font.size or 10, bold=c.font.bold, italic=c.font.italic, color=c.font.color)
    ws.sheet_properties.tabColor = ROT
wb.active = 0
wb.save(OUT); print('gespeichert', OUT, 'Mails', N - 1, 'Vertraege', len(vert_src))
