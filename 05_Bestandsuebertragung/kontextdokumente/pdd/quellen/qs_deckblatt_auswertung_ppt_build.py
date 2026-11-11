# -*- coding: utf-8 -*-
"""Auswertung der QS-Pruefmatrix KI-Deckblatt (Fachbereich) – Folien im ERGO-Master.

Aufruf aus pdd/quellen/:  python3 qs_deckblatt_auswertung_ppt_build.py <QS_Pruefmatrix.xlsx>
Die QS-Datei enthaelt Kundendaten und liegt deshalb nicht im Repository. Alle Zahlen der Folien
werden bei jedem Lauf aus der Datei gerechnet.
"""
import sys, re, datetime, collections
import openpyxl
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn

QS = sys.argv[1]
SRC = '20260916_Abstimmung_Budget_2027_Celonis_Vorlage.pptx'; OUT = '../20261111_QS_KI-Deckblatt_Auswertung.pptx'
STAND = '11. November 2026'
ROT = RGBColor(0xBF, 0x15, 0x28); ROTL = RGBColor(0xF6, 0xD9, 0xDC)
TEAL = RGBColor(0x0F, 0x94, 0xA7); TEALL = RGBColor(0xCC, 0xEB, 0xED); TEALT = RGBColor(0xE6, 0xF4, 0xF6); TEALD = RGBColor(0x0B, 0x6F, 0x7D)
GRAU = RGBColor(0x6B, 0x6B, 0x6B); GRAUL = RGBColor(0xF2, 0xF2, 0xF2); GRAUM = RGBColor(0x9A, 0x9A, 0x9A); GRAUD = RGBColor(0x4A, 0x4A, 0x4A)
SW = RGBColor(0x1A, 0x1A, 0x1A); WEISS = RGBColor(0xFF, 0xFF, 0xFF)
F = 'Arial'

# ================================================================== Auswertung
ws = openpyxl.load_workbook(QS, data_only=True).worksheets[0]
KOPF = {c: str(ws.cell(5, c).value or ws.cell(4, c).value).strip() for c in range(1, 45)}
KOPF.update({11: 'Kunde: Straße', 12: 'Kunde: PLZ', 13: 'Kunde: Ort', 23: 'Makler: Straße', 24: 'Makler: PLZ', 25: 'Makler: Ort',
             22: 'Makler-E-Mail', 7: 'Maklervollmacht (Kopfzeile)', 5: 'Typ (Makler | MFA)'})
ZEILEN = [r for r in ws.iter_rows(min_row=7, max_col=44, values_only=True)
          if any(v is not None for v in r) and str(r[1]).strip() != 'Beispiel']
PRUEF = [c for c in range(5, 42) if c != 27]          # E..AO; D und AA entfallen laut Matrix
GRUPPE = {}
for a, b, n in ((5, 7, 'Kopfzeile'), (8, 17, 'Kunde & Vertrag'), (18, 25, 'Makler'), (26, 30, 'Klassifikation & Vorgang'),
                (31, 39, 'Maklervollmacht & Unterschriften'), (40, 41, 'Ergebnis')):
    for c in range(a, b + 1): GRUPPE[c] = n
ARTEN = ['nicht ausgelesen', 'falscher Wert', 'ausgewichen', 'Rückfrage']


def zelle(r, c):
    v = r[c - 1]
    return str(v).strip() if v is not None and str(v).strip() else None


def felder(r): return [c for c in PRUEF if zelle(r, c)]


def art(t):
    s = t.lower().replace('"', '').replace('„', '').replace('“', '')
    if s == 'leer' or s.startswith('feld ist leer'): return 'nicht ausgelesen'
    m = re.match(r'\s*(falsch|falch|faslch|flasch|falslch|fehler)[^:]*:\s*(.*)', s, re.S)
    if not m: return 'Rückfrage'
    f = re.split(r'richtig|richitg|\n|;| / ', m.group(2))[0].strip(' ;,/')
    if f in ('leer', 'leeer', 'n/a', 'nicht ermittelbar', '-', ''): return 'nicht ausgelesen'
    if re.search(r'nicht.?pr[uü]e?fbar|manuelle|man\. pr|reminder', f): return 'ausgewichen'
    return 'falscher Wert'


def hat(r, c, rx):
    t = zelle(r, c)
    return bool(t and re.search(rx, t, re.I))


def datum(v):
    if isinstance(v, datetime.datetime): return v.date()
    m = re.match(r'(\d{1,2})\.(\d{1,2})\.+(\d{2,4})', str(v or '').strip())
    if m:
        y = int(m.group(3)); y += 2000 if y < 100 else 0
        return datetime.date(y, int(m.group(2)), int(m.group(1)))


def pz(a, b): return f'{round(100 * a / b):d} %'
def dez(x): return f'{x:.1f}'.replace('.', ',')

AB = [r for r in ZEILEN if str(r[2]) == 'Abweichung festgestellt']
OK = [r for r in ZEILEN if str(r[2]) == 'Keine Abweichung']
OFFEN = [r for r in ZEILEN if r not in AB and r not in OK]
FERTIG = AB + OK
N, NF = len(ZEILEN), len(FERTIG)
ist_mfa = lambda r: bool(re.search('MFA', str(r[41] or '')) or hat(r, 5, 'MFA'))
MFA_ALLE = sum(1 for r in ZEILEN if ist_mfa(r)); MFA_OFFEN = sum(1 for r in OFFEN if ist_mfa(r))

je_feld = collections.defaultdict(collections.Counter); je_art = collections.Counter(); je_gruppe = collections.Counter()
for r in ZEILEN:
    for c in felder(r):
        a = art(zelle(r, c)); je_feld[c][a] += 1; je_art[a] += 1; je_gruppe[GRUPPE[c]] += 1
ABW = sum(je_art.values())
AB_MIT = [r for r in AB if felder(r)]
SCHNITT = sum(len(felder(r)) for r in AB_MIT) / len(AB_MIT)
WENIG = sum(1 for r in AB_MIT if len(felder(r)) <= 2)

wochen = collections.defaultdict(lambda: [0, 0])
for r in FERTIG:
    d = datum(r[42])
    if not d: continue
    kw = d.isocalendar()[1]; kw = 42 if kw == 41 else kw
    wochen[kw][0] += r in OK; wochen[kw][1] += 1
def kw_von(r):
    d = datum(r[42])
    if not d: return None
    k = d.isocalendar()[1]
    return 42 if k == 41 else k

KLASSEN = ['ohne Abweichung', '1–2 Felder', '3–5 Felder', '6 und mehr']
schwere = collections.defaultdict(lambda: [0, 0, 0, 0]); summe_kw = collections.Counter(); feld_kw = collections.defaultdict(collections.Counter)
for r in FERTIG:
    k = kw_von(r)
    if k is None: continue
    n = 0 if r in OK else max(len(felder(r)), 1)
    schwere[k][0 if n == 0 else 1 if n <= 2 else 2 if n <= 5 else 3] += 1; summe_kw[k] += n
    if r in AB:
        for c in felder(r): feld_kw[c][k] += 1
KWNAME = {38: 'KW 38\n14.09.', 42: 'KW 41/42\n09.–14.10.', 43: 'KW 43\n21.–23.10.', 44: 'KW 44\n26.–28.10.', 45: 'KW 45\n02.–06.11.'}
OHNE_DATUM = sum(1 for r in FERTIG if not datum(r[42]))

MUSTER = {
    'agentur_leer': lambda r: [c for c in (20,) if hat(r, c, r'falsch:\s*"?(leer|n/a|nicht ermittelbar)')],
    'agentur_format': lambda r: [c for c in (20,) if hat(r, c, r'777-|V 85357|Ausgabeformat')],
    'mail_pool': lambda r: [c for c in (22,) if hat(r, c, r'richtig:\s*\S*(bestandsuebertragung|provider-bue|makleruebernahme|vertragsmanagement|service@dema)')],
    'mail': lambda r: [c for c in (22,) if zelle(r, c)],
    'dema': lambda r: [c for c in (18, 19, 22, 23, 24, 25) if hat(r, c, r'dema|3253|5383|Troisdorf')],
    'pool_zuviel': lambda r: [c for c in (18,) if hat(r, c, r'richtig:\s*leer')],
    'mv_streng': lambda r: [c for c in (7, 32, 33, 34, 35, 36) if hat(r, c, r'(nein|nicht.?pr|unvollst|fehlt|leer)[^\n;/]*[\n;/]+\s*richtig:?\s*"?(ja|ok|vollst)')],
    'vnr_manuell': lambda r: [c for c in (14,) if hat(r, c, r'falsch[^:]*:\s*(man|leer)')],
    'vnr_praefix': lambda r: [c for c in (14, 15) if hat(r, c, r'WG|RS|LV0')],
    'kundenadresse': lambda r: [c for c in (11, 12, 13) if zelle(r, c)],
    'reminder': lambda r: [c for c in (7, 29, 32) if hat(r, c, r'reminder')],
}
GEDECKT = set()
for zi, r in enumerate(ZEILEN):
    for k in ('agentur_leer', 'agentur_format', 'mail_pool', 'dema', 'pool_zuviel', 'mv_streng', 'vnr_manuell', 'vnr_praefix', 'kundenadresse'):
        GEDECKT |= {(zi, c) for c in MUSTER[k](r)}
MZ = {k: (sum(1 for r in ZEILEN if f(r)), sum(len(f(r)) for r in ZEILEN)) for k, f in MUSTER.items()}

STUFEN = [('Agentur- und\nVermittlernummer', {20, 21}), ('übrige\nMaklerdaten', {18, 19, 22, 23, 24, 25}),
          ('Maklervollmacht\nund Unterschriften', {7, 29, 31, 32, 33, 34, 35, 36, 37, 38}), ('Kunde und\nVertrag', set(range(8, 18)))]
treppe = [('Heute', len(OK))]; behoben = set()
for name, spalten in STUFEN:
    behoben |= spalten
    treppe.append((name, len(OK) + sum(1 for r in AB_MIT if not [c for c in felder(r) if c not in behoben])))
NUR_MAKLERNR = sum(1 for r in AB_MIT if not [c for c in felder(r) if c not in {20, 21}])

WIDERSPRUCH_OK = sum(1 for r in OK if felder(r)); WIDERSPRUCH_AB = len(AB) - len(AB_MIT)
ids = collections.Counter(str(r[0]) for r in ZEILEN); DOPPELT = sum(1 for v in ids.values() if v > 1)
PRUEFER = len({str(r[1]).strip() for r in FERTIG if r[1]})
print(f'{N} Deckblätter, {NF} abgeschlossen, {len(OK)} ohne Abweichung, {ABW} Feldabweichungen', dict(je_art), MZ, treppe)

# ================================================================== Folienbasis
prs = Presentation(SRC)
LAY = {l.name: l for l in prs.slide_layouts}
for sh in prs.slide_master.shapes:
    if sh.has_text_frame and 'Zwischenbericht' in sh.text_frame.text:
        sh.width = Inches(7.5)
        for para in sh.text_frame.paragraphs:
            for i, r in enumerate(para.runs):
                r.text = 'ERGO | Makler BÜ meets KI – QS KI-Deckblatt: Auswertung der Prüfmatrix - 11.11.2026' if i == 0 else ''
sldIdLst = prs.slides._sldIdLst
for sldId in list(sldIdLst)[1:]:
    prs.part.drop_rel(sldId.rId); sldIdLst.remove(sldId)
for sh in prs.slides[0].shapes:
    if not sh.has_text_frame: continue
    t = sh.text_frame.text.strip(); neu = None
    if t.startswith('Makler BÜ meets KI'): neu = 'Makler BÜ meets KI | Qualität der KI-Deckblätter'
    elif t == 'Budgetplanung 26/27': neu = 'Auswertung der QS-Prüfmatrix'
    elif t.startswith('17. September'): neu = STAND
    if neu:
        rs = sh.text_frame.paragraphs[0].runs; rs[0].text = neu
        for x in rs[1:]: x.text = ''


def rect(slide, x, y, w, h, fill, line=None, shape=MSO_SHAPE.RECTANGLE, lw=1.0):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None: s.fill.background()
    else: s.fill.solid(); s.fill.fore_color.rgb = fill
    if line is None: s.line.fill.background()
    else: s.line.color.rgb = line; s.line.width = Pt(lw)
    s.shadow.inherit = False; s.text_frame.text = ''
    return s


def text(slide, x, y, w, h, content, size=10, bold=False, color=SW, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, bullets=False, space_after=3, italic=False):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    paras = content if isinstance(content, list) else str(content).split('\n')
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(space_after)
        runs = para if isinstance(para, list) else [(para, bold)]
        if bullets:
            pPr = p._p.get_or_add_pPr(); pPr.set('marL', str(Inches(0.18))); pPr.set('indent', str(-Inches(0.18)))
            pPr.append(pPr.makeelement(qn('a:buChar'), {'char': '•'}))
        for t, b in runs:
            r = p.add_run(); r.text = t; r.font.size = Pt(size); r.font.bold = b; r.font.name = F; r.font.color.rgb = color; r.font.italic = italic
    return tb


def line(slide, x1, y1, x2, y2, color=GRAUM, width=0.75):
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = color; c.line.width = Pt(width)
    return c


def rand(c, pt, farbe):
    """Nur eine Linie unter der Zelle; die Linien stehen im Schema vor der Fuellung."""
    tcPr = c._tc.get_or_add_tcPr()
    neu = []
    for tag in ('a:lnL', 'a:lnR', 'a:lnT'):
        ln = tcPr.makeelement(qn(tag), {'w': '0'}); ln.append(ln.makeelement(qn('a:noFill'), {})); neu.append(ln)
    ln = tcPr.makeelement(qn('a:lnB'), {'w': str(int(pt * 12700)), 'cap': 'flat', 'cmpd': 'sng', 'algn': 'ctr'})
    sf = ln.makeelement(qn('a:solidFill'), {}); sf.append(sf.makeelement(qn('a:srgbClr'), {'val': farbe})); ln.append(sf); neu.append(ln)
    for k, el in enumerate(neu): tcPr.insert(k, el)


def table(slide, x, y, colw, rows, rowh=0.3, size=9):
    shp = slide.shapes.add_table(len(rows), len(colw), Inches(x), Inches(y), Inches(sum(colw)), Inches(rowh * len(rows)))
    tbl = shp.table; tbl.first_row = False; tbl.horz_banding = False
    for j, w in enumerate(colw): tbl.columns[j].width = Inches(w)
    for i, row in enumerate(rows):
        tbl.rows[i].height = Inches(min(rowh, 0.36) if i == 0 else rowh)
        for j, cell in enumerate(row):
            t, o = (cell if isinstance(cell, tuple) else (cell, {}))
            c = tbl.cell(i, j); c.margin_left = c.margin_right = Inches(0.07); c.margin_top = c.margin_bottom = Inches(0.04)
            c.vertical_anchor = MSO_ANCHOR.MIDDLE
            c.fill.solid(); c.fill.fore_color.rgb = WEISS; rand(c, 1.25 if i == 0 else 0.5, '1A1A1A' if i == 0 else 'C8C8C8')
            for k, teil in enumerate((t or ' ').split('\n')):
                p = c.text_frame.paragraphs[0] if k == 0 else c.text_frame.add_paragraph()
                p.alignment = o.get('align', PP_ALIGN.LEFT)
                r = p.add_run(); r.text = teil; r.font.size = Pt(size); r.font.name = F
                r.font.bold = o.get('bold', i == 0); r.font.color.rgb = o.get('color', SW)
            c.text_frame.word_wrap = True
    return shp


def neue_folie(titel, kicker, tsize=20):
    s = prs.slides.add_slide(LAY['Only Title'])
    for ph in s.placeholders:
        if ph.placeholder_format.idx == 0:
            ph.text_frame.text = titel
            for p in ph.text_frame.paragraphs:
                for r in p.runs: r.font.size = Pt(tsize)
        elif ph.placeholder_format.idx == 12:
            ph.text_frame.text = kicker
    return s


def abschnitt(slide, x, y, w, t):
    text(slide, x, y, w, 0.26, t, size=11, bold=True, color=SW)
    line(slide, x, y + 0.28, x + w, y + 0.28, SW, 0.75)


def quelle(slide, t):
    text(slide, 0.56, 6.72, 12.2, 0.2, t, size=7, color=GRAU, italic=True)


def kachel(slide, x, y, w, h, zahl, label, sub, farbe=TEALD):
    line(slide, x, y, x + w, y, SW, 0.75)
    text(slide, x, y + 0.12, w, 0.7, zahl, size=40, bold=True, color=farbe)
    text(slide, x, y + 0.9, w, 0.26, label, size=11, bold=True)
    text(slide, x, y + 1.18, w - 0.1, 0.5, sub, size=9, color=GRAUD)


def fazit(slide, t):
    rect(slide, 0.56, 6.04, 12.21, 0.5, GRAUL); rect(slide, 0.56, 6.04, 0.06, 0.5, ROT)
    text(slide, 0.8, 6.04, 11.8, 0.5, t, size=10.5, bold=True, anchor=MSO_ANCHOR.MIDDLE)


KICKER = 'QS KI-Deckblatt | Auswertung der Prüfmatrix des Fachbereichs'
QUELLE = f'Quelle: QS-Prüfmatrix Celonis KI-Deckblatt (Fachbereich), {N} geprüfte Deckblätter, Prüfungen vom 14.09. bis 06.11.2026; eigene Auswertung. Beispielzeile nicht gezählt.'
top = sorted(PRUEF, key=lambda c: -sum(je_feld[c].values()))
f1, f2 = top[0], top[1]

# ------------------------------------------------------------------ 2 Zusammenfassung
s = neue_folie(f'Nur {pz(len(OK), NF)} der geprüften KI-Deckblätter sind fehlerfrei – die Fehler häufen sich in wenigen Feldern', KICKER)
kw = 2.9; kx = [0.56 + i * (kw + 0.2) for i in range(4)]
kachel(s, kx[0], 1.55, kw, 1.7, str(N), 'geprüfte Deckblätter', f'{NF} abgeschlossen, {len(OFFEN)} offen (davon {MFA_OFFEN} MFA, spätere Ausbaustufe)')
kachel(s, kx[1], 1.55, kw, 1.7, pz(len(OK), NF), 'ohne Abweichung', f'{len(OK)} von {NF} abgeschlossenen Prüfungen; {len(AB)} mit Abweichung', ROT)
kachel(s, kx[2], 1.55, kw, 1.7, str(ABW), 'Feldabweichungen', f'im Schnitt {dez(SCHNITT)} je fehlerhaftem Deckblatt; {pz(WENIG, len(AB_MIT))} haben höchstens zwei')
kachel(s, kx[3], 1.55, kw, 1.7, pz(je_gruppe['Makler'], ABW), 'davon im Block Makler', f'{je_gruppe["Makler"]} Abweichungen in Pool, Vermittler, Nummern, E-Mail und Anschrift')
abschnitt(s, 0.56, 3.55, 12.2, 'Kernaussagen')
w0, w1 = wochen[min(wochen)], wochen[max(wochen)]
kern = [
    [('Die Qualität steigt, reicht aber noch nicht. ', True), (f'Der Anteil fehlerfreier Deckblätter ist von {pz(w0[0], w0[1])} (Prüfung Mitte September) auf {pz(w1[0], w1[1])} (erste Novemberwoche) gewachsen. Für den Einsatz in der Prüfung ist das zu wenig.', False)],
    [('Zwei Felder tragen ein Fünftel aller Abweichungen. ', True), (f'{KOPF[f1]} ({sum(je_feld[f1].values())}) und {KOPF[f2]} ({sum(je_feld[f2].values())}) führen mit Abstand; {MZ["agentur_leer"][0]}-mal wurde die Agentur-Nr. gar nicht ausgelesen.', False)],
    [('Das Deckblatt liest eher nichts als Falsches. ', True), (f'{pz(je_art["nicht ausgelesen"], ABW)} der Abweichungen sind leere Felder, {pz(je_art["falscher Wert"], ABW)} falsche Werte, {pz(je_art["ausgewichen"], ABW)} ein Ausweichen auf „nicht prüfbar“ oder „manuelle Prüfung“, obwohl die Angabe in den Unterlagen steht.', False)],
    [('Die Fehler folgen Mustern, nicht dem Zufall. ', True), (f'Allein die Regeln rund um DEMA erklären {MZ["dema"][1]} Abweichungen auf {MZ["dema"][0]} Deckblättern. Stimmten Agentur- und Vermittlernummer und die übrigen Maklerdaten, wären rechnerisch {pz(treppe[2][1], NF)} der Deckblätter fehlerfrei.', False)],
]
for i, k in enumerate(kern):
    y = 3.98 + i * 0.66
    o = rect(s, 0.56, y + 0.02, 0.36, 0.36, SW, None, MSO_SHAPE.OVAL)
    text(s, 0.56, y + 0.02, 0.36, 0.36, str(i + 1), size=11, bold=True, color=WEISS, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 1.12, y, 11.6, 0.56, [k], size=11, anchor=MSO_ANCHOR.TOP)
quelle(s, QUELLE)

# ------------------------------------------------------------------ 3 Prüfstand und Verlauf
s = neue_folie(f'Der Anteil fehlerfreier Deckblätter ist seit September gestiegen, liegt aber erst bei {pz(w1[0], w1[1])}', KICKER)
abschnitt(s, 0.56, 1.5, 4.3, 'Prüfstand')
bx, bw, by = 0.56, 4.3, 2.0
seg = [(len(AB), ROT, 'mit Abweichung'), (len(OK), TEALD, 'ohne Abweichung'), (len(OFFEN), GRAUM, 'Prüfung offen')]
x = bx
for n, farbe, _ in seg:
    w = bw * n / N
    rect(s, x, by, w - 0.02, 0.5, farbe)
    text(s, x, by, w - 0.02, 0.5, str(n), size=11, bold=True, color=WEISS, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    x += w
for i, (n, farbe, name) in enumerate(seg):
    rect(s, bx, by + 0.7 + i * 0.3, 0.14, 0.14, farbe)
    text(s, bx + 0.22, by + 0.66 + i * 0.3, 4.0, 0.26, f'{name}: {n} ({pz(n, N)})', size=9.5, color=GRAUD)
text(s, 0.56, 3.7, 4.3, 2.2, [
    f'{N} Deckblätter in der Matrix, geprüft von {PRUEFER} Personen aus dem Fachbereich.',
    f'{len(OFFEN)} Prüfungen sind offen, {MFA_OFFEN} davon, weil MFA erst in einer späteren Ausbaustufe betrachtet wird. Insgesamt betreffen {MFA_ALLE} Deckblätter MFA.',
    f'Die Quoten rechnen auf den {NF} abgeschlossenen Prüfungen.',
    'Die Wochen folgen dem Prüfdatum. Wann ein Deckblatt erzeugt wurde und mit welchem Stand der Regeln, steht nicht in der Matrix.',
], size=9.5, bullets=True, space_after=5, color=GRAUD)
abschnitt(s, 5.4, 1.5, 7.37, 'Deckblätter je Prüfwoche nach Zahl der abweichenden Felder (Anteil in %)')
SFARBE = [TEALD, RGBColor(0xF3, 0xC5, 0xCA), RGBColor(0xDD, 0x6B, 0x78), ROT]; STEXT = [WEISS, SW, WEISS, WEISS]
lx = 5.4
for k, name in enumerate(KLASSEN):
    rect(s, lx, 1.93, 0.14, 0.14, SFARBE[k]); text(s, lx + 0.2, 1.88, 1.6, 0.24, name, size=8.5, color=GRAUD); lx += 1.7
kws = sorted(wochen); cx0, ctop, cbot = 6.75, 2.3, 4.7; ch = cbot - ctop; cw = 6.0 / len(kws); bw_ = cw * 0.62
vorher = None
for i, k in enumerate(kws):
    v = schwere[k]; n = sum(v); x = cx0 + i * cw + (cw - bw_) / 2; y = cbot
    for j in range(4):
        h = ch * v[j] / n
        if h <= 0: continue
        y -= h
        rect(s, x, y, bw_, max(h - 0.02, 0.01), SFARBE[j])
        if h >= 0.2: text(s, x, y, bw_, h - 0.02, f'{round(100 * v[j] / n)}', size=11 if j == 0 else 9, bold=j == 0, color=STEXT[j], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        if j == 0:
            if vorher: line(s, vorher[0], vorher[1], x, y, TEALD, 1)
            vorher = (x + bw_, y)
    if schwere[k][0] == 0: vorher = (x + bw_, cbot)
    text(s, x - 0.3, cbot + 0.06, bw_ + 0.6, 0.36, KWNAME.get(k, f'KW {k}'), size=8.5, color=GRAUD, align=PP_ALIGN.CENTER, space_after=0)
line(s, cx0, cbot, cx0 + 6.0, cbot, GRAUM, 0.75)
for z, (name, wert) in enumerate([('Geprüfte Deckblätter', lambda k: str(sum(schwere[k]))), ('Ø abweichende Felder', lambda k: dez(summe_kw[k] / sum(schwere[k])))]):
    y = cbot + 0.52 + z * 0.27
    line(s, 5.4, y, 12.77, y, RGBColor(0xC8, 0xC8, 0xC8), 0.5)
    text(s, 5.4, y + 0.03, 1.4, 0.22, name, size=8, color=GRAUD, anchor=MSO_ANCHOR.MIDDLE)
    for i, k in enumerate(kws):
        text(s, cx0 + i * cw, y + 0.03, cw, 0.22, wert(k), size=9, bold=z == 1, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
k0, k1 = kws[0], kws[-1]
fazit(s, f'Die Richtung stimmt, das Niveau nicht: Je Deckblatt sind es noch {dez(summe_kw[k1] / sum(schwere[k1]))} statt {dez(summe_kw[k0] / sum(schwere[k0]))} abweichende Felder, aber {pz(w1[1] - w1[0], w1[1])} tragen weiter mindestens eine Abweichung.')
quelle(s, QUELLE + f' {OHNE_DATUM} abgeschlossene Prüfungen ohne Prüfdatum fehlen im Verlauf.')

# ------------------------------------------------------------------ 4 Abweichungen je Feld
s = neue_folie(f'{KOPF[f1]} und {KOPF[f2]} führen – {pz(je_gruppe["Makler"], ABW)} aller Abweichungen liegen im Block Makler', KICKER)
NTOP = 14
abschnitt(s, 0.56, 1.5, 6.0, f'Abweichungen je Feld nach Art – die {NTOP} häufigsten von {ABW}')
FARBE = {'nicht ausgelesen': TEALD, 'falscher Wert': ROT, 'ausgewichen': GRAUM, 'Rückfrage': RGBColor(0xD0, 0xD0, 0xD0)}
lx = 0.56
for a in ARTEN:
    rect(s, lx, 1.93, 0.14, 0.14, FARBE[a]); text(s, lx + 0.2, 1.88, 1.5, 0.24, [[(a + ' ', False), (pz(je_art[a], ABW), True)]], size=8.5, color=GRAUD); lx += 1.52
bx0, by0, rh = 2.7, 2.52, 0.245; mx = sum(je_feld[top[0]].values()); bmax = 3.3
hx0, hw = 7.1, 1.134; kws = sorted(wochen); nkw = {k: sum(schwere[k]) for k in kws}
abschnitt(s, 6.9, 1.5, 5.87, 'Anteil der Deckblätter mit Abweichung im Feld je Prüfwoche (in %)')
def waerme(q):
    t = min(q / 0.45, 1.0)
    return RGBColor(*[round(a + (b - a) * t) for a, b in zip((0xF7, 0xF2, 0xF2), (0xBF, 0x15, 0x28))])
text(s, 6.9, 1.88, 0.9, 0.24, 'Skala', size=8.5, color=GRAUD)
for j, q in enumerate((0, 0.1, 0.2, 0.3, 0.45)):
    rect(s, 7.4 + j * 0.62, 1.93, 0.14, 0.14, waerme(q)); text(s, 7.6 + j * 0.62, 1.88, 0.45, 0.24, ('≥ ' if j == 4 else '') + f'{round(q * 100)}', size=8.5, color=GRAUD)
for i, k in enumerate(kws):
    text(s, hx0 + i * hw, by0 - 0.36, hw - 0.03, 0.34, KWNAME.get(k, f'KW {k}').split('\n')[0] + f'\nn = {nkw[k]}', size=7.5, color=GRAUD, align=PP_ALIGN.CENTER, space_after=0)
for i, c in enumerate(top[:NTOP]):
    y = by0 + i * rh; tot = sum(je_feld[c].values())
    text(s, 0.56, y, 2.05, rh - 0.03, KOPF[c], size=9, align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE, bold=GRUPPE[c] == 'Makler')
    x = bx0
    for a in ARTEN:
        n = je_feld[c][a]
        if not n: continue
        w = bmax * n / mx
        rect(s, x, y + 0.03, max(w - 0.02, 0.02), rh - 0.09, FARBE[a]); x += w
    text(s, x + 0.06, y, 0.5, rh - 0.03, str(tot), size=9, bold=True, anchor=MSO_ANCHOR.MIDDLE)
    for j, k in enumerate(kws):
        q = feld_kw[c][k] / nkw[k]
        z = rect(s, hx0 + j * hw, y + 0.01, hw - 0.03, rh - 0.03, waerme(q))
        text(s, hx0 + j * hw, y + 0.01, hw - 0.03, rh - 0.03, f'{round(q * 100)}' if feld_kw[c][k] else '–', size=8.5, bold=q >= 0.3, color=WEISS if q >= 0.24 else (SW if feld_kw[c][k] else GRAUM), align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
line(s, bx0, by0, bx0, by0 + NTOP * rh, GRAUM, 0.75)
text(s, 0.56, by0 - 0.3, 2.05, 0.22, 'fett: Block Makler', size=7.5, color=GRAU, italic=True, align=PP_ALIGN.RIGHT)
fazit(s, f'Der Block Makler ist der größte Hebel: Dort liegt fast jede zweite Abweichung, und in {pz(sum(je_feld[c]["nicht ausgelesen"] for c in range(18, 26)), je_gruppe["Makler"])} der Fälle fehlt die Angabe ganz.')
quelle(s, QUELLE + ' Gezählt ist jede ausgefüllte Prüfzelle; die Spalten „entfällt“ bleiben außen vor. Rechts: abgeschlossene Prüfungen mit Prüfdatum.')

# ------------------------------------------------------------------ 5 Fehlermuster
s = neue_folie(f'Sieben wiederkehrende Muster erklären {pz(len(GEDECKT), ABW)} der Abweichungen', KICKER)
d = lambda k: f'{MZ[k][0]}'
rows = [['Muster', 'Was die Prüfer festgestellt haben', ('Deckblätter', {'align': PP_ALIGN.RIGHT}), 'Ansatzpunkt für den Deep Dive'],
    ['Agentur-Nr. fehlt', 'Feld leer, obwohl die Nummer im Anschreiben oder in der Vollmacht steht; Schreibweisen mit Bindestrich (60004-1966) oder mit Vermittlernummer davor (V 85357 A 777-0503) werden nicht oder nicht bereinigt übernommen.', (f'{MZ["agentur_leer"][0]} leer\n{MZ["agentur_format"][0]} Format', {'align': PP_ALIGN.RIGHT}), 'Ausleseregel für die gängigen Schreibweisen; Ausgabeformat (mit oder ohne „A“) fachlich festlegen.'],
    ['Falsche Makler-E-Mail', 'Ausgegeben wird die Adresse des Absenders oder des einzelnen Vermittlers; erwartet ist das BÜ-Postfach des Pools (blau direkt, Fonds Finanz, Jung DMS, DEMA).', (d('mail_pool') + f'\n(von {MZ["mail"][0]})', {'align': PP_ALIGN.RIGHT}), 'Regel festlegen: Welche Adresse gilt, wenn ein Pool einreicht? Liste der BÜ-Postfächer je Pool.'],
    ['DEMA', 'DEMA wird als Pool gesetzt (erwartet: leer), die E-Mail ist die No-Reply-Adresse, Postfach 3253 und Troisdorf fehlen.', (f'{MZ["dema"][0]}\n({MZ["dema"][1]} Felder)', {'align': PP_ALIGN.RIGHT}), 'Eine Sonderregel für DEMA behebt Pool, E-Mail und Anschrift zugleich.'],
    ['Pool zu Unrecht gesetzt', 'Im Feld Pool steht der Vermittler, ein Makler ohne Poolfunktion oder die ERGO selbst.', (d('pool_zuviel'), {'align': PP_ALIGN.RIGHT}), 'Pool nur aus der konsolidierten Poolliste füllen, sonst leer lassen.'],
    ['Maklervollmacht zu streng bewertet', '„nein“, „nicht prüfbar“ oder „MV unvollständig“, obwohl Vollmacht, Unterschrift und Umfang in Ordnung sind; das Unterschriftsdatum bleibt oft leer.', (f'{MZ["mv_streng"][0]}\n({MZ["mv_streng"][1]} Felder)', {'align': PP_ALIGN.RIGHT}), 'Bewertungsregeln für vollumfänglich, Unterschrift und Untervollmacht an Beispielen schärfen.'],
    ['Versicherungsnummer', '„Manuelle Prüfung“ oder leer, obwohl die Nummer in den Unterlagen steht; Präfix und Sparte falsch abgeleitet (WG oder RS statt SV).', (f'{MZ["vnr_manuell"][0]} manuell\n{MZ["vnr_praefix"][0]} Präfix', {'align': PP_ALIGN.RIGHT}), 'Nummern ohne Präfix, 13-stellige Direktnummern und mehrere Nummern je Vorgang abdecken.'],
    ['Kundenanschrift fehlt', 'Straße, PLZ und Ort des Kunden bleiben leer, obwohl sie in der Vollmacht stehen.', (f'{MZ["kundenadresse"][0]}\n({MZ["kundenadresse"][1]} Felder)', {'align': PP_ALIGN.RIGHT}), 'Anschrift aus der Vollmacht lesen, wenn das Anschreiben keine nennt.'],
]
table(s, 0.56, 1.45, [1.75, 5.25, 1.15, 4.05], rows, rowh=0.55, size=8.5)
fazit(s, 'Die Muster sind regelhaft und damit gezielt behebbar; vier der sieben betreffen die Maklerdaten.')
quelle(s, QUELLE + f' Muster überschneiden sich (DEMA zählt auch bei Pool und E-Mail). Weitere: Reminder ohne Vollständigkeitsprüfung auf {MZ["reminder"][0]} Deckblättern.')

# ------------------------------------------------------------------ 6 Wirkung
s = neue_folie(f'Stimmen die Maklerdaten, wären rechnerisch {pz(treppe[2][1], NF)} der Deckblätter fehlerfrei statt {pz(len(OK), NF)}', KICKER)
abschnitt(s, 0.56, 1.5, 8.0, 'Anteil fehlerfreier Deckblätter, wenn die Abweichungen eines Blocks nacheinander behoben wären (in %)')
saeulen = [('Heute', 0, treppe[0][1], 'summe')]
for (name, n), (_, v) in zip(treppe[1:], treppe[:-1]): saeulen.append((name, v, n, 'stufe'))
saeulen.append(('Rechnerisch\nerreichbar', 0, treppe[-1][1], 'summe')); saeulen.append(('Typ, Klassifikation,\nVorgang, Sonstiges', treppe[-1][1], NF, 'rest'))
cx0, cy0, ch = 0.75, 4.9, 2.7; cw = 7.8 / len(saeulen); bw_ = cw * 0.62
line(s, cx0, cy0, cx0 + 7.8, cy0, GRAUM, 0.75)
for i, (name, von, bis, typ) in enumerate(saeulen):
    x = cx0 + i * cw + (cw - bw_) / 2; y1, y0 = cy0 - ch * bis / NF, cy0 - ch * von / NF
    rect(s, x, y1, bw_, y0 - y1, {'summe': SW, 'stufe': TEALD, 'rest': RGBColor(0xD0, 0xD0, 0xD0)}[typ])
    if i < len(saeulen) - 1: line(s, x + bw_, y1, x + cw, y1, GRAUM, 0.75)
    if typ == 'summe':
        text(s, x - 0.3, y1 - 0.34, bw_ + 0.6, 0.3, pz(bis, NF), size=15, bold=True, align=PP_ALIGN.CENTER)
    else:
        text(s, x - 0.3, y1 - 0.3, bw_ + 0.6, 0.26, ('+' if typ == 'stufe' else '') + f'{round(100 * bis / NF) - round(100 * von / NF)} Pp.', size=11, bold=True, color=TEALD if typ == 'stufe' else GRAU, align=PP_ALIGN.CENTER)
    text(s, x - 0.4, cy0 + 0.07, bw_ + 0.8, 0.6, name, size=8.5, color=SW if typ == 'summe' else GRAUD, bold=typ == 'summe', align=PP_ALIGN.CENTER, space_after=0)
    text(s, x - 0.4, cy0 + 0.68, bw_ + 0.8, 0.2, f'{bis} von {NF}' if typ == 'summe' else f'{"+" if typ == "stufe" else ""}{bis - von} Deckblätter', size=8, color=GRAU, align=PP_ALIGN.CENTER)
abschnitt(s, 9.0, 1.5, 3.77, 'Lesehilfe')
text(s, 9.0, 1.95, 3.77, 4.5, [
    [(f'{NUR_MAKLERNR} Deckblätter ', True), ('scheitern heute allein an Agentur- oder Vermittlernummer.', False)],
    [('Die Makler-Felder sind der größte Hebel: ', True), (f'Mit ihnen stiege die Quote von {pz(len(OK), NF)} auf {pz(treppe[2][1], NF)}.', False)],
    [('Maklervollmacht sowie Kunde und Vertrag ', True), (f'heben die Quote danach auf {pz(treppe[4][1], NF)}.', False)],
    [('Der Rest ', True), (f'({NF - treppe[4][1]} Deckblätter) hängt an Typ, Klassifikation und Vorgangssteuerung oder an Anmerkungen ohne Feldbezug.', False)],
    [('Rechnerische Sicht: ', True), ('Sie setzt voraus, dass die Prüfer alle Abweichungen eines Deckblatts eingetragen haben, und sagt nichts über den Aufwand der Behebung.', False)],
], size=9.5, bullets=True, space_after=6, color=GRAUD)
fazit(s, 'Die Rechnung spricht für die Reihenfolge: zuerst Agentur- und Vermittlernummer, dann die übrigen Maklerdaten, danach die Maklervollmacht.')
quelle(s, QUELLE + f' Basis: {NF} abgeschlossene Prüfungen.')

# ------------------------------------------------------------------ 7 N/A und Presets
# Presets laut „BÜ Klassifikation“ (Celonis, Mail S. Schwarz vom 11.11.2026): N/A = Feld wird nicht abgefragt.
SONDER = re.compile(r'MFA|K[üu]ndigung|Widerruf|Stornohaftung|Outbound|ERGO-M|@ergo|Reminder|Erinnerung|Mahnung|St[öo]rung|kein Postkorb', re.I)
na_zellen = na_sonder = leer_zellen = sonder_zeilen = sonder_zellen = 0; na_zeilen = set()
for zi, r in enumerate(ZEILEN):
    hinweis = bool(SONDER.search(' '.join(str(r[k] or '') for k in (39, 40, 41))) or hat(r, 5, 'MFA'))
    fs = felder(r)
    if hinweis and fs: sonder_zeilen += 1; sonder_zellen += len(fs)
    for c in fs:
        t = zelle(r, c).lower()
        if re.search(r'falsch:\s*"?(n/a|nicht ermittelbar)', t): na_zellen += 1; na_sonder += hinweis; na_zeilen.add(zi)
        elif re.search(r'falsch:\s*"?le+r', t) or t == 'leer': leer_zellen += 1
print('N/A', na_zellen, len(na_zeilen), na_sonder, 'leer', leer_zellen, 'Sonderfall', sonder_zeilen, sonder_zellen)

s = neue_folie(f'„N/A“ ist in zwei Presets gewollt – das erklärt höchstens {pz(sonder_zellen, ABW)} der Abweichungen', KICKER)
abschnitt(s, 0.56, 1.5, 7.3, 'Welche Blöcke des Deckblatts Celonis je Preset abfragt')
BLOECKE = ['Kopfzeile', 'Kunde &\nVertrag', 'Makler', 'Klassifikation\n& Vorgang', 'MV & Unter-\nschriften', 'Ergebnis']
V, T, K = 'voll', 'teil', 'kein'
PRESETS = [
    ('1', 'BÜ-Makler, BÜ-leer, BÜ-Fremdversicherer; Sonderthemen mit BÜ-Wunsch (VN- und Weg-Wechsel, Kündigung Vertrag, Kündigungsfrist, Sonstige Fachthemen, Nicht Standard)', [(V, ''), (V, ''), (V, ''), (V, ''), (V, ''), (V, '')]),
    ('2', 'BÜ-MFA, BÜ-Courtagefortzahler, BÜ-Kontaktgeber', [(T, 'ohne MV-Status'), (V, ''), (V, ''), (V, ''), (T, 'ohne drei MV-Felder'), (V, '')]),
    ('3', 'Kündigung Maklervollmacht; dieselben Sonderthemen ohne BÜ-Wunsch; Kein Makler-Vorgang', [(T, 'ohne MV-Status'), (T, 'ohne Name laut MV'), (T, 'nur Absender-adresse'), (T, 'nur Vorgangstyp'), (K, 'kein Feld'), (V, '')]),
]
mx0, kw_ = 3.75, 0.685; my0, mh = 2.45, 0.9
text(s, 0.56, 1.95, 0.6, 0.4, 'Preset', size=8.5, bold=True, anchor=MSO_ANCHOR.BOTTOM)
text(s, 1.2, 1.95, 2.4, 0.4, 'Klassifikation', size=8.5, bold=True, anchor=MSO_ANCHOR.BOTTOM)
for j, b in enumerate(BLOECKE):
    text(s, mx0 + j * kw_, 1.95, kw_, 0.4, b, size=7.5, bold=True, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.BOTTOM, space_after=0)
line(s, 0.56, my0 - 0.05, 7.86, my0 - 0.05, SW, 1.25)
for i, (nr, klass, zellen) in enumerate(PRESETS):
    y = my0 + i * mh
    text(s, 0.56, y, 0.6, mh - 0.1, nr, size=20, bold=True, color=TEALD, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 1.2, y, 2.4, mh - 0.1, klass, size=8, color=GRAUD, anchor=MSO_ANCHOR.MIDDLE)
    for j, (zustand, notiz) in enumerate(zellen):
        cx = mx0 + j * kw_ + kw_ / 2
        rect(s, cx - 0.13, y + 0.1, 0.26, 0.26, {V: TEALD, T: TEALL, K: WEISS}[zustand], TEALD, MSO_SHAPE.OVAL, lw=1.25)
        if notiz: text(s, cx - kw_ / 2 + 0.02, y + 0.4, kw_ - 0.04, 0.45, notiz, size=6.5, color=GRAUD, align=PP_ALIGN.CENTER, space_after=0)
    line(s, 0.56, y + mh - 0.05, 7.86, y + mh - 0.05, RGBColor(0xC8, 0xC8, 0xC8), 0.5)
lx = 0.56
for zustand, name in ((V, 'alle Felder abgefragt'), (T, 'teilweise „N/A“'), (K, 'durchgehend „N/A“ (keine Abfrage)')):
    rect(s, lx, 5.2, 0.16, 0.16, {V: TEALD, T: TEALL, K: WEISS}[zustand], TEALD, MSO_SHAPE.OVAL, lw=1); text(s, lx + 0.24, 5.16, 2.3, 0.24, name, size=8.5, color=GRAUD); lx += 2.0
text(s, 0.56, 5.5, 7.3, 0.5, 'Die Prüfmatrix führt weder Klassifikation noch Preset je Deckblatt; die Zuordnung rechts stützt sich deshalb auf die Anmerkungen der Prüfer.', size=8.5, color=GRAUD)
abschnitt(s, 8.3, 1.5, 4.47, 'Was das für die Auswertung heißt')
for i, (zahl, farbe, t) in enumerate([
    (pz(na_zellen, ABW), TEALD, [[(f'{na_zellen} Abweichungen auf {len(na_zeilen)} Deckblättern ', True), (f'bemängeln ausdrücklich „N/A“ oder „nicht ermittelbar“. {na_sonder} davon stehen auf Deckblättern mit Hinweis auf MFA oder einen Sonderfall.', False)]]),
    (pz(sonder_zellen, ABW), TEALD, [[(f'{sonder_zellen} Abweichungen auf {sonder_zeilen} Deckblättern ', True), ('tragen einen solchen Hinweis (MFA, Kündigung oder Widerruf der Vollmacht, Reminder, ERGO-Absender). Das ist die Obergrenze dessen, was die Presets erklären können.', False)]]),
    (pz(leer_zellen, ABW), ROT, [[(f'{leer_zellen} Abweichungen lauten „leer“, ', True), (f'darunter {MZ["agentur_leer"][0]}-mal die Agentur-Nr. Die Presets erklären sie nur, wenn das Deckblatt „N/A“ als leeres Feld ausgibt.', False)]]),
]):
    y = 1.95 + i * 1.2
    text(s, 8.3, y, 0.95, 0.4, zahl, size=22, bold=True, color=farbe)
    text(s, 9.45, y, 3.32, 1.0, t, size=9.5, color=GRAUD)
fazit(s, 'Für eine saubere Trennung braucht es je laufender Nummer Klassifikation und Preset aus den Celonis-Rohdaten.')
quelle(s, QUELLE + ' Presets: „BÜ Klassifikation“ aus Celonis, Stand 11.11.2026.')

# ------------------------------------------------------------------ 8 Einordnung
s = neue_folie('Für den Deep Dive: Was die Matrix nicht beantwortet und was zu klären ist', KICKER)
abschnitt(s, 0.56, 1.5, 5.9, 'Grenzen der Datengrundlage')
text(s, 0.56, 1.95, 5.9, 4.6, [
    [('Stichprobe, keine Vollerhebung. ', True), (f'{N} Deckblätter, ausgewählt und geprüft vom Fachbereich; die Auswahl ist nicht dokumentiert.', False)],
    [('Kein Stand des Regelwerks je Deckblatt. ', True), ('Der Verlauf folgt dem Prüfdatum; ob ein Fehler inzwischen behoben ist, lässt sich aus der Matrix nicht ablesen.', False)],
    [('Freitext statt fester Ausprägungen. ', True), ('„falsch: … / richtig: …“ ist uneinheitlich geschrieben; die Fehlerart ist deshalb über Textregeln zugeordnet.', False)],
    [('Status und Einträge passen nicht immer. ', True), (f'{WIDERSPRUCH_OK} Deckblätter stehen auf „Keine Abweichung“ und tragen dennoch Einträge, {WIDERSPRUCH_AB} auf „Abweichung festgestellt“ ohne Feldeintrag; {DOPPELT} Kennungen kommen doppelt vor.', False)],
    [('MFA ist ausgeklammert. ', True), (f'{MFA_ALLE} Deckblätter betreffen MFA, {MFA_OFFEN} davon sind deshalb offen.', False)],
    [('Kein Preset je Deckblatt. ', True), ('Ohne Klassifikation lässt sich „gewollt nicht abgefragt“ nicht von „nicht ausgelesen“ trennen.', False)],
], size=10.5, bullets=True, space_after=10, color=GRAUD)
abschnitt(s, 6.87, 1.5, 5.9, 'Offene Fragen')
text(s, 6.87, 1.95, 5.9, 4.6, [
    [('Welche Felder braucht die Prüfung zwingend? ', True), ('Daran entscheidet sich, ab welcher Quote das Deckblatt einsetzbar ist und welche Muster zuerst behoben werden.', False)],
    [('Welches Format gilt für Agentur- und Vermittlernummer? ', True), ('Mit oder ohne „A“ und „P“, mit oder ohne führende Nullen.', False)],
    [('Wann gilt ein Einreicher als Pool, und welche Adresse wird ausgegeben? ', True), ('DEMA, blau direkt, Fonds Finanz und Jung DMS decken den Großteil der Fälle.', False)],
    [('Wie streng ist die Maklervollmacht zu bewerten? ', True), ('Vollumfänglich, Untervollmacht und Unterschrift brauchen Regeln mit Beispielen.', False)],
    [('Wie erscheint „N/A“ auf dem Deckblatt? ', True), ('Als Text „N/A“ oder als leeres Feld? Davon hängt ab, wie die Prüfer „leer“ bewerten sollen.', False)],
    [('Abgleich mit den Celonis-Rohdaten. ', True), ('Die Einwertung je Action-Flow-Vorgang zeigt, ob sich die Muster über alle Vorgänge bestätigen und welche Fehler nach den Regeländerungen noch auftreten.', False)],
], size=10.5, bullets=True, space_after=10, color=GRAUD)
fazit(s, 'Die Matrix zeigt, wo die Deckblätter falsch sind; welche Felder die Prüfung zwingend braucht, entscheidet über die Reihenfolge.')
quelle(s, QUELLE)

prs.save(OUT); print('ok', OUT)
