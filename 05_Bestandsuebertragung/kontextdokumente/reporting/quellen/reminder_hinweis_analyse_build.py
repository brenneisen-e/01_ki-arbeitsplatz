# -*- coding: utf-8 -*-
"""Reminder- und Hinweis-Analyse als durchformelte, formatierte Arbeitsmappe (Aptos, ERGO-Farben)."""
import collections, datetime, re, sys
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.comments import Comment
from openpyxl.chart import LineChart, Reference
from openpyxl.utils import get_column_letter as L

SRC = 'hinweis.xlsx'; OUT = sys.argv[1] if len(sys.argv) > 1 else 'Reminder-und-Hinweis-Analyse_17.06.-09.09.2026.xlsx'
ROT, PASTELL, GRAU, GRAU_HELL, BLAU = '8B1A2B', 'FEF2F2', 'D9D9D9', 'F7F7F7', '0000FF'
FONT = 'Aptos'
def f(size=10, bold=False, color='000000', italic=False): return Font(name=FONT, size=size, bold=bold, color=color, italic=italic)
FILL_KOPF = PatternFill('solid', fgColor=ROT); FILL_SEK = PatternFill('solid', fgColor=PASTELL); FILL_ZEBRA = PatternFill('solid', fgColor=GRAU_HELL)
FILL_SUM = PatternFill('solid', fgColor='EFE3E5'); FILL_EIN = PatternFill('solid', fgColor='FFF9E6')
DUENN = Side(style='thin', color=GRAU); RAHMEN = Border(left=DUENN, right=DUENN, top=DUENN, bottom=DUENN)
LINKS = Alignment(horizontal='left', vertical='center'); RECHTS = Alignment(horizontal='right', vertical='center')
MITTE = Alignment(horizontal='center', vertical='center', wrap_text=True)
NUM, PCT, DAT, ZEIT, DEZ = '#,##0', '0.0%', 'DD.MM.YYYY', 'HH:MM', '0.00'
KB, KM = 'bestandsuebertragungen@ergo.de', 'maklerauftraege@ergo.de'
ZW = '​'
def dat(s):
    if isinstance(s, datetime.datetime): return s.date()
    if isinstance(s, str) and re.match(r'\d\d\.\d\d\.\d{4}$', s): return datetime.datetime.strptime(s, '%d.%m.%Y').date()
    return s
def sauber(v): return v.replace(ZW, '').strip() or None if isinstance(v, str) else v

src = openpyxl.load_workbook(SRC, data_only=True)
def lies(name):
    ws = src[name]; hdr = [c for c in next(ws.iter_rows(max_row=1, values_only=True))]
    rows = [list(r)[:len(hdr)] for r in ws.iter_rows(min_row=2, values_only=True) if r[0] is not None]
    return hdr, rows
M_HDR, M = lies('Mails'); H_HDR, H = lies('Hinweis-Mails'); V_HDR, V = lies('Reminder je Vertrag')
mix = {h: i for i, h in enumerate(M_HDR)}; hix = {h: i for i, h in enumerate(H_HDR)}; vix = {h: i for i, h in enumerate(V_HDR)}
kw_src = [r for r in src['KW-Verlauf'].iter_rows(min_row=2, values_only=True) if r[0] and r[0] != 'Summe']
meta = {r[0]: r[1] for r in src['Uebersicht'].iter_rows(min_row=1, max_row=8, values_only=True) if r[0]}
for r in src['Uebersicht'].iter_rows(values_only=True):
    if r[0] in ('Textmuster:', 'davon im Text geprueft / uebersprungen:', 'Erkannt an der Kategorie:'): meta[r[0]] = r[1]

wb = openpyxl.Workbook()
# ------------------------------------------------------------------ Layout-Helfer
def kopfzeile(ws, r, werte, hoehe=30, start=1):
    for j, v in enumerate(werte):
        c = ws.cell(row=r, column=start + j, value=v); c.font = f(10, True, 'FFFFFF'); c.fill = FILL_KOPF; c.alignment = MITTE; c.border = RAHMEN
    ws.row_dimensions[r].height = hoehe
def titel(ws, r, text, size=16):
    c = ws.cell(row=r, column=1, value=text); c.font = f(size, True, ROT); ws.row_dimensions[r].height = size * 1.8
def sektion(ws, r, text, bis):
    for j in range(1, bis + 1): ws.cell(row=r, column=j).fill = FILL_SEK
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
def datenblatt(ws, hdr, rows, breiten, datumsspalten=(), zeitspalten=(), freeze='C2'):
    ws.append(hdr)
    for r in rows:
        r = [sauber(v) for v in r]
        for h in datumsspalten: r[ws_ix[ws.title][h]] = dat(r[ws_ix[ws.title][h]])
        ws.append(r)
    N = len(rows) + 1
    for c in ws[1]: c.font = f(10, True, 'FFFFFF'); c.fill = FILL_KOPF; c.alignment = MITTE; c.border = RAHMEN
    ws.row_dimensions[1].height = 32
    for row in ws.iter_rows(min_row=2, max_row=N):
        for c in row: c.font = f(10)
    for h in datumsspalten:
        col = ws_ix[ws.title][h] + 1
        for row in ws.iter_rows(min_row=2, max_row=N, min_col=col, max_col=col): row[0].number_format = DAT
    for h in zeitspalten:
        col = ws_ix[ws.title][h] + 1
        for row in ws.iter_rows(min_row=2, max_row=N, min_col=col, max_col=col): row[0].number_format = ZEIT
    for h, w in breiten.items():
        if h in ws_ix[ws.title]: ws.column_dimensions[L(ws_ix[ws.title][h] + 1)].width = w
    ws.freeze_panes = freeze; ws.auto_filter.ref = f'A1:{L(len(hdr))}{N}'; ws.sheet_view.zoomScale = 90
    return N
ws_ix = {'Mails': mix, 'Hinweis-Mails': hix}

# ------------------------------------------------------------------ Datenblätter
wm = wb.active; wm.title = 'Mails'
B_M = {'Nr': 7, 'Datum': 11, 'Uhrzeit': 8, 'Wochentag': 10, 'KW': 11, 'Postfach': 26, 'Ordner': 34, 'Eingangskanal': 28, 'Absender Name': 30,
       'Absender E-Mail': 34, 'Absender Domain': 22, 'Empfänger (An)': 40, 'Betreff': 70, 'Vorgangsart': 30, 'Erinnerung': 11, 'Erinnerung BÜ': 13,
       'Von JDC': 9, 'Kunde': 28, 'Vertragsnummer': 18, 'Sparte': 11, 'Sparte-Detail': 24, 'Rangstufe': 26, 'Agentur-Nr': 12, 'Vermittler-Nr': 13,
       'Anhänge': 30, 'Erstvorgang im Scan': 14, 'Erstvorgang Datum': 13, 'Tage seit Erstvorgang': 12, 'Erinnerung Nr. je Vertrag': 12,
       'JDC erkannt über': 18, 'Anhang vorhanden': 12, 'An KWAD weitergeleitet': 14}
NM = datenblatt(wm, M_HDR, M, B_M, ('Datum', 'Erstvorgang Datum'), ('Uhrzeit',))
wh = wb.create_sheet('Hinweis-Mails')
NH = datenblatt(wh, H_HDR, H, {'Nr': 7, 'Datum': 11, 'Uhrzeit': 8, 'KW': 11, 'Wochentag': 10, 'Eingangskanal': 28, 'Postfach': 26, 'Ordner': 34,
                                'Absender Name': 30, 'Absender E-Mail': 34, 'Betreff': 60, 'LNR': 12, 'DokArt': 12}, ('Datum',), ('Uhrzeit',))
def rng(h): col = L(mix[h] + 1); return f"Mails!${col}$2:${col}${NM}"
def rngh(h): col = L(hix[h] + 1); return f"'Hinweis-Mails'!${col}$2:${col}${NH}"
R_KW, R_KAN, R_ERI, R_JDC, R_ART, R_SP, R_VNR, R_ABS, R_KUN, R_ANH, R_WL, R_ERST = (rng(h) for h in
    ('KW', 'Eingangskanal', 'Erinnerung', 'Von JDC', 'Vorgangsart', 'Sparte', 'Vertragsnummer', 'Absender E-Mail', 'Kunde', 'Anhang vorhanden', 'An KWAD weitergeleitet', 'Erstvorgang im Scan'))
RH_KW, RH_KAN = rngh('KW'), rngh('Eingangskanal')

# ------------------------------------------------------------------ Reminder je Vertrag (Werte, zwei Formeln)
wv = wb.create_sheet('Reminder je Vertrag', 0)
titel(wv, 1, 'Erinnerungen je Vertrag')
wv['A2'] = ('Zählung je Vertrag aus der Auswertung der Einzelliste (Blatt „Mails“) vom 09.09.2026; Zeilen ohne Vertragsnummer sind je Vorgang zusammengefasst. '
            '„Noch offen“ und „Tage Erstvorgang bis letzte Erinnerung“ sind Formeln.')
wv['A2'].font = f(9, italic=True, color='595959'); wv.merge_cells('A2:W2'); wv['A2'].alignment = Alignment(wrap_text=True, vertical='top'); wv.row_dimensions[2].height = 28
kopfzeile(wv, 4, V_HDR, hoehe=44)
v0 = 5
DATV = ('zuletzt weitergeleitet am', 'Erste Erinnerung', 'Letzte Erinnerung', 'Erstvorgang Datum')
for i, v in enumerate(V):
    r = v0 + i
    for j, h in enumerate(V_HDR):
        val = sauber(v[j])
        if h in DATV: val = dat(val)
        if h == 'noch offen': val = f'=F{r}-J{r}'
        elif h == 'Tage Erstvorgang bis letzte Erinnerung': val = f'=IF(AND(ISNUMBER(T{r}),ISNUMBER(R{r})),R{r}-T{r},"")'
        fmt = DAT if h in DATV else (NUM if isinstance(val, (int, float)) or (isinstance(val, str) and val.startswith('=')) else None)
        zelle(wv, r, j + 1, val, fmt)
    zebra(wv, r, len(V_HDR), i % 2 == 1)
vN = v0 + len(V) - 1
for j, w in enumerate((6, 18, 30, 11, 28, 12, 10, 11, 11, 13, 11, 10, 9, 14, 13, 13, 13, 13, 12, 13, 14, 26, 36)): wv.column_dimensions[L(j + 1)].width = w
wv.freeze_panes = 'C5'; wv.auto_filter.ref = f'A4:{L(len(V_HDR))}{vN}'; wv.sheet_view.showGridLines = False
def rv(h): col = L(vix[h] + 1); return f"'Reminder je Vertrag'!${col}${v0}:${col}${vN}"
V_KAN, V_ANZ, V_ERST, V_SP, V_DUP, V_UEB, V_VNR = (rv(h) for h in ('Eingangskanal', 'Erinnerungen gesamt', 'Erstvorgang im Scan', 'Sparte', 'Duplikat (mehrfach weitergeleitet)', 'überzählige Weiterleitungen', 'Vertragsnummer'))

# ------------------------------------------------------------------ KW-Verlauf
wk = wb.create_sheet('KW-Verlauf', 0)
titel(wk, 1, 'Reminder- und Hinweis-Analyse – Wochenverlauf je Eingangskanal')
wk['A2'] = ('Blau hinterlegte Werte sind Eingaben aus der Postfachzählung (alle Mails der Woche). Alle übrigen Zahlen sind Formeln über die Blätter '
            '„Mails“ (nur Erinnerungen und BÜ-Erstvorgänge erfasst) und „Hinweis-Mails“.')
wk['A2'].font = f(9, italic=True, color='595959'); wk.merge_cells('A2:AA2'); wk['A2'].alignment = Alignment(wrap_text=True, vertical='top'); wk.row_dimensions[2].height = 28
def kanalblock(kurz): return [f'Mails\n{kurz}', f'Erinnerungen\n{kurz}', f'mit Anhang\n{kurz}', f'ohne Anhang\n{kurz}', f'weitergeleitet\n{kurz}', f'noch offen\n{kurz}', f'JDC-Erinnerungen\n{kurz}', f'Hinweis-Mails\n{kurz}']
KOPF_KW = ['KW', 'Zeitraum (Mo–So)'] + kanalblock('Bestandsübertr.') + kanalblock('Maklerauftr.') + ['Mails\ngesamt', 'Erinnerungen\ngesamt', 'davon mit\nAnhang', 'davon ohne\nAnhang', 'davon\nweitergeleitet', 'davon\nnoch offen', 'JDC-Erinnerungen\ngesamt', 'Quote JDC an\nallen Mails', 'Hinweis-Mails\ngesamt']
kopfzeile(wk, 4, KOPF_KW, hoehe=44)
r0 = 5
for i, kw in enumerate(kw_src):
    r = r0 + i
    zelle(wk, r, 1, kw[0], bold=True); zelle(wk, r, 2, kw[1])
    for k, (kanal, eingabe) in enumerate(((KB, kw[2]), (KM, kw[10]))):
        b = 3 + 8 * k
        zelle(wk, r, b, eingabe, NUM, color=BLAU, fill=FILL_EIN)
        base = f'{R_KW},$A{r},{R_KAN},"{kanal}",{R_ERI},"ja"'
        zelle(wk, r, b + 1, f'=COUNTIFS({base})', NUM)
        zelle(wk, r, b + 2, f'=COUNTIFS({base},{R_ANH},"ja")', NUM)
        zelle(wk, r, b + 3, f'=COUNTIFS({base},{R_ANH},"nein")', NUM)
        zelle(wk, r, b + 4, f'=COUNTIFS({base},{R_WL},"ja")', NUM)
        zelle(wk, r, b + 5, f'={L(b+1)}{r}-{L(b+4)}{r}', NUM)
        zelle(wk, r, b + 6, f'=COUNTIFS({base},{R_JDC},"ja")', NUM)
        zelle(wk, r, b + 7, f'=COUNTIFS({RH_KW},$A{r},{RH_KAN},"{kanal}")', NUM)
    zelle(wk, r, 19, f'=C{r}+K{r}', NUM); zelle(wk, r, 20, f'=D{r}+L{r}', NUM); zelle(wk, r, 21, f'=E{r}+M{r}', NUM); zelle(wk, r, 22, f'=F{r}+N{r}', NUM)
    zelle(wk, r, 23, f'=G{r}+O{r}', NUM); zelle(wk, r, 24, f'=H{r}+P{r}', NUM); zelle(wk, r, 25, f'=I{r}+Q{r}', NUM)
    zelle(wk, r, 26, f'=IFERROR(Y{r}/S{r},0)', PCT); zelle(wk, r, 27, f'=J{r}+R{r}', NUM)
    zebra(wk, r, 27, i % 2 == 1)
rs = r0 + len(kw_src)
zelle(wk, rs, 1, 'Summe', bold=True, fill=FILL_SUM); zelle(wk, rs, 2, '', fill=FILL_SUM)
for j in list(range(3, 26)) + [27]: zelle(wk, rs, j, f'=SUM({L(j)}{r0}:{L(j)}{rs-1})', NUM, bold=True, fill=FILL_SUM)
zelle(wk, rs, 26, f'=IFERROR(Y{rs}/S{rs},0)', PCT, bold=True, fill=FILL_SUM)
wk['C4'].comment = Comment('Eingabe: Gesamtzahl aller Mails der Woche im Postfach laut Postfachzählung vom 09.09.2026. Nicht aus der Einzelliste ableitbar.', 'Eike Brenneisen')
wk['K4'].comment = Comment('Eingabe: Gesamtzahl aller Mails der Woche im Postfach laut Postfachzählung vom 09.09.2026.', 'Eike Brenneisen')
wk[f'A{rs+1}'] = 'KW25 beginnt am 17.06.2026, KW37 endet am 09.09.2026 (Stand der Auswertung). Bestandsübertr. = bestandsuebertragungen@ergo.de, Maklerauftr. = maklerauftraege@ergo.de.'
wk[f'A{rs+1}'].font = f(9, italic=True, color='595959')
for j, w in enumerate((12, 24) + (13, 13, 11, 11, 13, 11, 15, 13) * 2 + (11, 13, 11, 11, 13, 11, 15, 13, 13)): wk.column_dimensions[L(j + 1)].width = w
wk.freeze_panes = 'C5'; wk.sheet_view.showGridLines = False
ch = LineChart(); ch.title = 'Erinnerungen und Hinweis-Mails je Kalenderwoche'; ch.style = 2; ch.height = 8.5; ch.width = 24
ch.y_axis.title = 'Anzahl'; ch.y_axis.number_format = '#,##0'; ch.legend.position = 'b'
for col, farbe, breite in ((20, '7F7F7F', 22000), (25, ROT, 30000), (27, '3B5F8A', 22000)):
    ch.add_data(Reference(wk, min_col=col, min_row=4, max_row=rs - 1), titles_from_data=True)
    s = ch.series[-1]; s.graphicalProperties.line.solidFill = farbe; s.graphicalProperties.line.width = breite; s.smooth = False
ch.set_categories(Reference(wk, min_col=1, min_row=r0, max_row=rs - 1))
wk.add_chart(ch, f'A{rs+3}')

# ------------------------------------------------------------------ Sparten & Duplikate
wsp = wb.create_sheet('Sparten & Duplikate', 1)
titel(wsp, 1, 'Erinnerungen und Duplikate je Sparte')
wsp['A2'] = ('Duplikat = mehr als eine an KWAD weitergeleitete Mail zur selben Einheit; „überzählig“ zählt alles ab der zweiten Mail. Bei Kranken löst jede Mail '
             'einen eigenen Vorgang aus, dort ist die Vertragsnummer maßgeblich. Bei Komposit und Leben zählt ein Verbund als ein Rückstand. Alle Zahlen sind Formeln '
             'über die Blätter „Mails“ und „Reminder je Vertrag“.')
wsp['A2'].font = f(9, italic=True, color='595959'); wsp.merge_cells('A2:K2'); wsp['A2'].alignment = Alignment(wrap_text=True, vertical='top'); wsp.row_dimensions[2].height = 40
kopfzeile(wsp, 4, ['Sparte', 'Vorgänge (Vertragsnummern)', 'Erinnerungen gesamt', 'davon von JDC', 'mit Anhang', 'ohne Anhang', 'an KWAD weitergeleitet', 'noch offen',
                   'Vorgänge mit mehrfacher Weiterleitung', 'überzählige Weiterleitungen', 'Ø Erinnerungen je Vorgang'], hoehe=44)
s0 = 5
for i, sp in enumerate(('Komposit', 'Kranken', 'Leben', 'Unbekannt', 'ohne VNR')):
    r = s0 + i; krit = '""' if sp == 'ohne VNR' else f'$A{r}'
    zelle(wsp, r, 1, sp, bold=True)
    zelle(wsp, r, 2, f'=COUNTIFS({V_SP},{krit})', NUM)
    zelle(wsp, r, 3, f'=COUNTIFS({R_SP},{krit},{R_ERI},"ja")', NUM)
    zelle(wsp, r, 4, f'=COUNTIFS({R_SP},{krit},{R_ERI},"ja",{R_JDC},"ja")', NUM)
    zelle(wsp, r, 5, f'=COUNTIFS({R_SP},{krit},{R_ERI},"ja",{R_ANH},"ja")', NUM)
    zelle(wsp, r, 6, f'=COUNTIFS({R_SP},{krit},{R_ERI},"ja",{R_ANH},"nein")', NUM)
    zelle(wsp, r, 7, f'=COUNTIFS({R_SP},{krit},{R_ERI},"ja",{R_WL},"ja")', NUM)
    zelle(wsp, r, 8, f'=C{r}-G{r}', NUM)
    zelle(wsp, r, 9, f'=COUNTIFS({V_SP},{krit},{V_DUP},"ja")', NUM)
    zelle(wsp, r, 10, f'=SUMIFS({V_UEB},{V_SP},{krit})', NUM)
    zelle(wsp, r, 11, f'=IFERROR(C{r}/B{r},0)', DEZ)
    zebra(wsp, r, 11, i % 2 == 1)
rsum = s0 + 5
zelle(wsp, rsum, 1, 'Gesamt', bold=True, fill=FILL_SUM)
for j in range(2, 11): zelle(wsp, rsum, j, f'=SUM({L(j)}{s0}:{L(j)}{rsum-1})', NUM, bold=True, fill=FILL_SUM)
zelle(wsp, rsum, 11, f'=IFERROR(C{rsum}/B{rsum},0)', DEZ, bold=True, fill=FILL_SUM)
r = rsum + 2
sektion(wsp, r, 'Vorgänge mit mehrfacher Weiterleitung', 9); r += 1
kopfzeile(wsp, r, ['Sparte', 'Vertragsnummer', 'Kunde', 'Erinnerungen', 'an KWAD weitergeleitet', 'überzählig', 'Erste Erinnerung', 'Letzte Erinnerung', 'zuletzt weitergeleitet am']); r += 1
dups = [v for v in V if v[vix['Duplikat (mehrfach weitergeleitet)']] == 'ja']
if dups:
    for i, v in enumerate(dups):
        for j, h in enumerate(('Sparte', 'Vertragsnummer', 'Kunde', 'Erinnerungen gesamt', 'an KWAD weitergeleitet', 'überzählige Weiterleitungen', 'Erste Erinnerung', 'Letzte Erinnerung', 'zuletzt weitergeleitet am')):
            val = sauber(v[vix[h]]); val = dat(val) if h in DATV else val
            zelle(wsp, r, j + 1, val, DAT if h in DATV else (NUM if isinstance(val, (int, float)) else None))
        zebra(wsp, r, 9, i % 2 == 1); r += 1
else:
    c = wsp.cell(row=r, column=1, value='Im Zeitraum wurde keine Erinnerung an KWAD weitergeleitet (Spalte „An KWAD weitergeleitet“ durchgehend „nein“); es gibt daher keine Vorgänge mit mehrfacher Weiterleitung.')
    c.font = f(10, italic=True, color='595959'); wsp.merge_cells(start_row=r, start_column=1, end_row=r, end_column=9); r += 1
r += 1
sektion(wsp, r, 'Sparte im Fokus: Kranken', 9); r += 1
zelle(wsp, r, 1, 'Vorgänge (Vertragsnummern)'); zelle(wsp, r, 2, f'=B{s0+1}', NUM); r += 1
zelle(wsp, r, 1, 'Erinnerungen gesamt'); zelle(wsp, r, 2, f'=C{s0+1}', NUM); r += 1
zelle(wsp, r, 1, 'an KWAD weitergeleitete Mails'); zelle(wsp, r, 2, f'=G{s0+1}', NUM); r += 1
zelle(wsp, r, 1, 'Vorgänge mit mehrfacher Weiterleitung'); zelle(wsp, r, 2, f'=I{s0+1}', NUM); r += 1
zelle(wsp, r, 1, 'überzählige Mails (zusätzlich ausgelöste Vorgänge)'); zelle(wsp, r, 2, f'=J{s0+1}', NUM); r += 1
zelle(wsp, r, 1, 'Anteil an allen überzähligen Weiterleitungen'); zelle(wsp, r, 2, f'=IFERROR(J{s0+1}/J{rsum},0)', PCT); r += 1
wsp.cell(row=r, column=1, value='Hinweis: Bei Kranken löst jede Mail einen eigenen Vorgang aus; mehrfach weitergeleitete Erinnerungen erzeugen dort zusätzliche Rückstände. Erkannt an der Kategorie „An KWAD weitergeleitet“.').font = f(9, italic=True, color='595959')
wsp.merge_cells(start_row=r, start_column=1, end_row=r, end_column=9)
for j, w in enumerate((30, 16, 14, 13, 12, 12, 14, 12, 16, 14, 13)): wsp.column_dimensions[L(j + 1)].width = w
wsp.sheet_view.showGridLines = False

# ------------------------------------------------------------------ Übersicht
wu = wb.create_sheet('Übersicht', 0)
titel(wu, 1, 'Reminder- und Hinweis-Analyse – Erinnerungen je Eingangskanal', 18)
wu['A2'] = 'Makler BÜ meets KI | Erinnerungen (Reminder) von JDC und weiteren Absendern sowie Hinweis-Mails der Gruppenpostfächer'; wu['A2'].font = f(11, color='595959')
r = 4
for k, v in (('Zeitraum', meta.get('Zeitraum:')), ('Postfach 1', meta.get('Ordner 1:')), ('Postfach 2', meta.get('Ordner 2:')), ('Eingangskanäle', meta.get('Eingangskanäle:')),
             ('Reminder-Absender (JDC)', meta.get('Reminder-Absender (JDC):')), ('Reminder-Stichwörter', meta.get('Reminder-Stichwörter:')),
             ('Hinweis-Mails, Textmuster', meta.get('Textmuster:')), ('Hinweis-Mails, im Text geprüft / übersprungen', meta.get('davon im Text geprueft / uebersprungen:')),
             ('Weiterleitung erkannt an', meta.get('Erkannt an der Kategorie:')), ('Erstellt am', meta.get('Erstellt am:')), ('Erstellt von', 'Eike Brenneisen (Deloitte) für HSB4K')):
    wu.cell(row=r, column=1, value=k).font = f(10, True); c = wu.cell(row=r, column=2, value=v); c.font = f(10); wu.merge_cells(start_row=r, start_column=2, end_row=r, end_column=11); r += 1
wu.cell(row=r - 4, column=2).comment = Comment('Zählung des Auswertungswerkzeugs vom 09.09.2026: Mails, deren Text auf das Muster geprüft bzw. ohne Prüfung übersprungen wurde. Nicht in der Einzelliste enthalten.', 'Eike Brenneisen')
r += 1
sektion(wu, r, 'Kernzahlen', 11); r += 1
kz0 = r
KZ = [
 ('Mails gesamt im Zeitraum', f"='KW-Verlauf'!S{rs}", NUM, 'Summe der Postfachzählung (Blatt KW-Verlauf, blaue Eingaben)', True),
 ('Erinnerungen gesamt', f'=COUNTIFS({R_ERI},"ja")', NUM, 'Einzelliste, Spalte Erinnerung = ja', True),
 ('davon mit Anhang', f'=COUNTIFS({R_ERI},"ja",{R_ANH},"ja")', NUM, '', False),
 ('davon ohne Anhang', f'=COUNTIFS({R_ERI},"ja",{R_ANH},"nein")', NUM, '', False),
 ('davon von JDC / Jung DMS', f'=COUNTIFS({R_ERI},"ja",{R_JDC},"ja")', NUM, 'Einzelliste, Von JDC = ja', True),
 ('davon von sonstigen Absendern', f'=B{kz0+1}-B{kz0+4}', NUM, '', False),
 ('JDC-Erinnerungen mit Anhang', f'=COUNTIFS({R_ERI},"ja",{R_JDC},"ja",{R_ANH},"ja")', NUM, '', False),
 ('JDC-Erinnerungen ohne Anhang', f'=COUNTIFS({R_ERI},"ja",{R_JDC},"ja",{R_ANH},"nein")', NUM, '', False),
 ('Erinnerungen bereits an KWAD weitergeleitet', f'=COUNTIFS({R_ERI},"ja",{R_WL},"ja")', NUM, 'Einzelliste, An KWAD weitergeleitet = ja', False),
 ('Erinnerungen noch offen', f'=B{kz0+1}-B{kz0+8}', NUM, '', False),
 ('Anteil weitergeleitet', f'=IFERROR(B{kz0+8}/B{kz0+1},0)', PCT, '', False),
 ('Vorgänge mit mehrfacher Weiterleitung', f'=COUNTIF({V_DUP},"ja")', NUM, 'Blatt Reminder je Vertrag', False),
 ('davon überzählige Mails an KWAD', f'=SUM({V_UEB})', NUM, '', False),
 ('Anteil JDC-Erinnerungen an allen Mails', f'=IFERROR(B{kz0+4}/B{kz0},0)', PCT, '', False),
 ('Anteil JDC-Erinnerungen an allen Erinnerungen', f'=IFERROR(B{kz0+4}/B{kz0+1},0)', PCT, '', False),
 ('Hinweis-Mails (zweite Auswertung)', f"=COUNTA('Hinweis-Mails'!$A$2:$A${NH})", NUM, 'Blatt Hinweis-Mails', True),
 ('BÜ-Erstvorgänge (Betreff „Bestandsübertragung“)', f'=COUNTIFS({R_ART},"Bestandsübertragung (Erstvorgang)")', NUM, 'Einzelliste, Vorgangsart', False),
 ('Verträge mit Erinnerung', f'=COUNTA({V_VNR})', NUM, 'Blatt Reminder je Vertrag', False),
 ('davon mit mehr als einer Erinnerung', f'=COUNTIF({V_ANZ},">1")', NUM, '', False),
 ('davon ohne Erstvorgang im Scan', f'=COUNTIF({V_ERST},"nein")', NUM, 'VNR im Zeitraum nicht als Nicht-Erinnerung gefunden', False),
 ('Ø Erinnerungen je Vertrag', f'=IFERROR(B{kz0+1}/B{kz0+17},0)', DEZ, '', False),
]
for i, (k, form, fmt, quelle, fett) in enumerate(KZ):
    zelle(wu, r, 1, k, bold=fett); zelle(wu, r, 2, form, fmt, bold=fett)
    wu.cell(row=r, column=3, value=quelle).font = f(9, italic=True, color='595959'); zebra(wu, r, 2, i % 2 == 1); r += 1
r += 1
sektion(wu, r, 'Je Eingangskanal', 14); r += 1
kopfzeile(wu, r, ['Eingangskanal', 'Mails gesamt', 'Erinnerungen gesamt', 'davon JDC', 'davon sonstige', 'davon mit Anhang', 'davon weitergeleitet', 'Quote JDC an Mails',
                  'Quote Erinnerungen an Mails', 'BÜ-Erstvorgänge', 'Verträge mit Erinnerung', 'Ø Erinnerungen je Vertrag', 'Erinnerungen ohne Erstvorgang im Scan', 'Hinweis-Mails'], hoehe=44); r += 1
ek0 = r
for i, (kanal, spalte) in enumerate(((KB, 'C'), (KM, 'K'))):
    zelle(wu, r, 1, kanal, bold=True); zelle(wu, r, 2, f"='KW-Verlauf'!{spalte}{rs}", NUM)
    zelle(wu, r, 3, f'=COUNTIFS({R_KAN},$A{r},{R_ERI},"ja")', NUM); zelle(wu, r, 4, f'=COUNTIFS({R_KAN},$A{r},{R_ERI},"ja",{R_JDC},"ja")', NUM)
    zelle(wu, r, 5, f'=C{r}-D{r}', NUM); zelle(wu, r, 6, f'=COUNTIFS({R_KAN},$A{r},{R_ERI},"ja",{R_ANH},"ja")', NUM)
    zelle(wu, r, 7, f'=COUNTIFS({R_KAN},$A{r},{R_ERI},"ja",{R_WL},"ja")', NUM)
    zelle(wu, r, 8, f'=IFERROR(D{r}/B{r},0)', PCT); zelle(wu, r, 9, f'=IFERROR(C{r}/B{r},0)', PCT)
    zelle(wu, r, 10, f'=COUNTIFS({R_KAN},$A{r},{R_ART},"Bestandsübertragung (Erstvorgang)")', NUM)
    zelle(wu, r, 11, f'=COUNTIF({V_KAN},$A{r})', NUM); zelle(wu, r, 12, f'=IFERROR(C{r}/K{r},0)', DEZ)
    zelle(wu, r, 13, f'=COUNTIFS({V_KAN},$A{r},{V_ERST},"nein")', NUM); zelle(wu, r, 14, f'=COUNTIFS({RH_KAN},$A{r})', NUM)
    zebra(wu, r, 14, i % 2 == 1); r += 1
zelle(wu, r, 1, 'Summe', bold=True, fill=FILL_SUM)
for j in (2, 3, 4, 5, 6, 7, 10, 11, 13, 14): zelle(wu, r, j, f'=SUM({L(j)}{ek0}:{L(j)}{r-1})', NUM, bold=True, fill=FILL_SUM)
zelle(wu, r, 8, f'=IFERROR(D{r}/B{r},0)', PCT, bold=True, fill=FILL_SUM); zelle(wu, r, 9, f'=IFERROR(C{r}/B{r},0)', PCT, bold=True, fill=FILL_SUM)
zelle(wu, r, 12, f'=IFERROR(C{r}/K{r},0)', DEZ, bold=True, fill=FILL_SUM); r += 2
sektion(wu, r, 'JDC-Erinnerungen je Sparte und Eingangskanal', 5); r += 1
kopfzeile(wu, r, ['Sparte', KB, KM, 'Gesamt', 'Anteil']); r += 1
sp0 = r
for i, sp in enumerate(('Kranken', 'Komposit', 'Leben', 'Unbekannt', 'ohne VNR')):
    krit = '""' if sp == 'ohne VNR' else f'$A{r}'
    zelle(wu, r, 1, sp, bold=True)
    zelle(wu, r, 2, f'=COUNTIFS({R_KAN},"{KB}",{R_ERI},"ja",{R_JDC},"ja",{R_SP},{krit})', NUM)
    zelle(wu, r, 3, f'=COUNTIFS({R_KAN},"{KM}",{R_ERI},"ja",{R_JDC},"ja",{R_SP},{krit})', NUM)
    zelle(wu, r, 4, f'=B{r}+C{r}', NUM); zelle(wu, r, 5, f'=IFERROR(D{r}/$D${sp0+5},0)', PCT); zebra(wu, r, 5, i % 2 == 1); r += 1
zelle(wu, r, 1, 'Summe', bold=True, fill=FILL_SUM)
for j in (2, 3, 4): zelle(wu, r, j, f'=SUM({L(j)}{sp0}:{L(j)}{r-1})', NUM, bold=True, fill=FILL_SUM)
zelle(wu, r, 5, f'=IFERROR(D{r}/D{r},0)', PCT, bold=True, fill=FILL_SUM); r += 2
sektion(wu, r, 'Vorgangsarten je Eingangskanal (nach Betreff; nur Erinnerungen und BÜ-Erstvorgänge erfasst)', 4); r += 1
kopfzeile(wu, r, ['Vorgangsart', KB, KM, 'Gesamt']); r += 1
va0 = r
for i, art in enumerate(('Bestandsübertragung (Erstvorgang)', 'Erinnerung BÜ', 'Sonstige Erinnerung / Mahnung')):
    zelle(wu, r, 1, art, bold=True); zelle(wu, r, 2, f'=COUNTIFS({R_KAN},"{KB}",{R_ART},$A{r})', NUM); zelle(wu, r, 3, f'=COUNTIFS({R_KAN},"{KM}",{R_ART},$A{r})', NUM)
    zelle(wu, r, 4, f'=B{r}+C{r}', NUM); zebra(wu, r, 4, i % 2 == 1); r += 1
zelle(wu, r, 1, 'Summe', bold=True, fill=FILL_SUM)
for j in (2, 3, 4): zelle(wu, r, j, f'=SUM({L(j)}{va0}:{L(j)}{r-1})', NUM, bold=True, fill=FILL_SUM)
r += 2
abs_cnt = collections.Counter(x[mix['Absender E-Mail']] for x in M if x[mix['Erinnerung']] == 'ja')
sektion(wu, r, 'Absender von Erinnerungen (Top 15)', 5); r += 1
kopfzeile(wu, r, ['Absender', KB, KM, 'Gesamt', 'JDC?']); r += 1
for i, (a, _) in enumerate(abs_cnt.most_common(15)):
    zelle(wu, r, 1, a); zelle(wu, r, 2, f'=COUNTIFS({R_ABS},$A{r},{R_KAN},"{KB}",{R_ERI},"ja")', NUM); zelle(wu, r, 3, f'=COUNTIFS({R_ABS},$A{r},{R_KAN},"{KM}",{R_ERI},"ja")', NUM)
    zelle(wu, r, 4, f'=B{r}+C{r}', NUM)
    zelle(wu, r, 5, f'=IF(OR(ISNUMBER(SEARCH("jungdms",$A{r})),ISNUMBER(SEARCH("jung-dms",$A{r})),ISNUMBER(SEARCH("jdc",$A{r}))),"ja","nein")', align=Alignment(horizontal='center'))
    zebra(wu, r, 5, i % 2 == 1); r += 1
r += 1
kun_cnt = collections.Counter((sauber(x[mix['Kunde']]) or '') for x in M if x[mix['Erinnerung']] == 'ja')
kun_vnr = collections.defaultdict(set)
for x in M:
    if x[mix['Erinnerung']] == 'ja': kun_vnr[sauber(x[mix['Kunde']]) or ''].add(x[mix['Vertragsnummer']])
sektion(wu, r, 'Kunden mit den meisten Erinnerungen (Top 15)', 3); r += 1
kopfzeile(wu, r, ['Kunde', 'Erinnerungen', 'Anzahl Verträge']); r += 1
k0 = r
for i, (k, _) in enumerate(kun_cnt.most_common(15)):
    if k == '': zelle(wu, r, 1, '(ohne Kunde)'); zelle(wu, r, 2, f'=COUNTIFS({R_KUN},"",{R_ERI},"ja")', NUM)
    else: zelle(wu, r, 1, k); zelle(wu, r, 2, f'=COUNTIFS({R_KUN},$A{r},{R_ERI},"ja")', NUM)
    zelle(wu, r, 3, len(kun_vnr[k]), NUM); zebra(wu, r, 3, i % 2 == 1); r += 1
wu.cell(row=k0, column=3).comment = Comment('Anzahl unterschiedlicher Vertragsnummern je Kunde, aus der Einzelliste ermittelt (Stand 09.09.2026).', 'Eike Brenneisen')
r += 1
wu.cell(row=r, column=1, value='Hinweis: „Erstvorgang im Scan“ prüft nur die beiden Archivordner im gewählten Zeitraum. Ein „nein“ bedeutet, dass zur Vertragsnummer keine Nicht-Erinnerungs-Mail gefunden wurde; der Erstvorgang kann älter sein oder in einem anderen Ordner liegen.').font = f(9, italic=True, color='595959')
wu.merge_cells(start_row=r, start_column=1, end_row=r, end_column=14); wu.cell(row=r, column=1).alignment = Alignment(wrap_text=True, vertical='top'); wu.row_dimensions[r].height = 28
for j, w in enumerate((44, 30, 30, 13, 13, 13, 14, 13, 13, 13, 13, 13, 16, 13)): wu.column_dimensions[L(j + 1)].width = w
wu.sheet_view.showGridLines = False; wu.sheet_view.zoomScale = 90

# ------------------------------------------------------------------ Druck, Schrift, Reihenfolge
for ws in (wu, wk, wsp, wv):
    ws.page_setup.orientation = 'landscape'; ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0; ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.print_options.horizontalCentered = True; ws.page_margins.left = ws.page_margins.right = 0.4
    ws.oddFooter.center.text = 'Reminder- und Hinweis-Analyse | Stand 09.09.2026 | Seite &P von &N'; ws.oddFooter.center.size = 8
wv.print_title_rows = '4:4'
for ws in (wm, wh):
    ws.print_title_rows = '1:1'; ws.page_setup.orientation = 'landscape'; ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0; ws.sheet_properties.pageSetUpPr.fitToPage = True
for ws in wb.worksheets:
    for row in ws.iter_rows():
        for c in row:
            if c.value is not None and c.font.name != FONT:
                c.font = Font(name=FONT, size=c.font.size or 10, bold=c.font.bold, italic=c.font.italic, color=c.font.color)
    ws.sheet_properties.tabColor = ROT
wb._sheets = [wu, wk, wsp, wv, wh, wm]; wb.active = 0
wb.save(OUT); print('gespeichert', OUT, '| Mails', NM - 1, '| Hinweis', NH - 1, '| Vertraege', len(V))
