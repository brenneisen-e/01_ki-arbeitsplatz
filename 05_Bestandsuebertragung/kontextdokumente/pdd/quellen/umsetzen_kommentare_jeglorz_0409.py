# -*- coding: utf-8 -*-
"""Setzt die Kommentare von M. Jeglorz (HSB4K-EXTERN, 04.09.2026) im PDD Gesundheit/KV um."""
import copy, re, zipfile
from lxml import etree

W   = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
W14 = '{http://schemas.microsoft.com/office/word/2010/wordml}'
W15 = '{http://schemas.microsoft.com/office/word/2012/wordml}'
XML = '{http://www.w3.org/XML/1998/namespace}'

zin = zipfile.ZipFile('PDD.docx')
teile = {n: zin.read(n) for n in zin.namelist()}
doc = etree.fromstring(teile['word/document.xml'])
protokoll = []

# ------------------------------------------------------------------ Helfer
def ptext(p): return ''.join(t.text or '' for t in p.iter(W + 't'))

def alle(): return list(doc.iter(W + 'p'))

def finde(text, nr=0, start=None):
    treffer = [p for p in alle() if ptext(p) == text]
    assert len(treffer) > nr, f'nicht gefunden: {text!r} (#{nr}, {len(treffer)} Treffer)'
    return treffer[nr]

def hat_anker(p):
    return any(e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd', W + 'commentReference')
               for e in p.iter())

def settext(p, text):
    """Setzt den Text, laesst Kommentaranker und Bookmarks unberuehrt."""
    runs = [r for r in p.findall(W + 'r') if r.find(W + 't') is not None]
    for r in runs[1:]:
        p.remove(r)
    if runs:
        r = runs[0]
    else:
        r = etree.SubElement(p, W + 'r')
        etree.SubElement(r, W + 't')
    for t in r.findall(W + 't')[1:]:
        r.remove(t)
    t = r.find(W + 't')
    t.text = text
    t.set(XML + 'space', 'preserve')
    # Rechtschreibmarker entfernen, sie beziehen sich auf den alten Text
    for e in p.findall(W + 'proofErr'):
        p.remove(e)
    return p

def clean_clone(vorlage, text, pstyle=None, rstyle=None):
    """Neuer Absatz nach dem Muster einer Vorlage, ohne deren Anker und Marker."""
    p = copy.deepcopy(vorlage)
    for e in list(p):
        if e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd', W + 'bookmarkStart',
                     W + 'bookmarkEnd', W + 'proofErr'):
            p.remove(e)
        elif e.tag == W + 'r' and (e.find(W + 'commentReference') is not None
                                   or e.find(W + 't') is None):
            p.remove(e)
        elif e.tag == W + 'hyperlink':
            p.remove(e)
    for a in list(p.attrib):
        if a.startswith(W14):
            del p.attrib[a]
    # Absatzformat
    ppr = p.find(W + 'pPr')
    if pstyle is not None:
        if ppr is None:
            ppr = etree.Element(W + 'pPr'); p.insert(0, ppr)
        ps = ppr.find(W + 'pStyle')
        if ps is None:
            ps = etree.SubElement(ppr, W + 'pStyle')
        ps.set(W + 'val', pstyle)
    elif ppr is not None and ppr.find(W + 'pStyle') is not None:
        ppr.remove(ppr.find(W + 'pStyle'))
        if len(ppr) == 0:
            p.remove(ppr)
    # Zeichenformat des ersten Textlaufs
    runs = [r for r in p.findall(W + 'r') if r.find(W + 't') is not None]
    if not runs:
        r = etree.SubElement(p, W + 'r'); etree.SubElement(r, W + 't'); runs = [r]
    r = runs[0]
    rpr = r.find(W + 'rPr')
    if rpr is not None:
        r.remove(rpr)
    if rstyle:
        rpr = etree.Element(W + 'rPr')
        rs = etree.SubElement(rpr, W + 'rStyle'); rs.set(W + 'val', rstyle)
        r.insert(0, rpr)
    settext(p, text)
    return p

def loesche(p, anker_ziel=None):
    """Entfernt einen Absatz. Kommentaranker wandern in anker_ziel, sonst Abbruch."""
    if hat_anker(p):
        assert anker_ziel is not None, 'Absatz traegt Kommentaranker: ' + ptext(p)[:60]
        for e in list(p):
            if e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd') or \
               (e.tag == W + 'r' and e.find(W + 'commentReference') is not None):
                anker_ziel.append(e)
    p.getparent().remove(p)

def verlinke(p, anker):
    """Wickelt den Textlauf des Absatzes in einen internen Hyperlink."""
    runs = [r for r in p.findall(W + 'r') if r.find(W + 't') is not None]
    assert len(runs) == 1, ptext(p)
    r = runs[0]
    rpr = r.find(W + 'rPr')
    if rpr is None:
        rpr = etree.Element(W + 'rPr'); r.insert(0, rpr)
    for rs in rpr.findall(W + 'rStyle'):
        rpr.remove(rs)
    rs = etree.Element(W + 'rStyle'); rs.set(W + 'val', 'Hyperlink'); rpr.insert(0, rs)
    h = etree.Element(W + 'hyperlink')
    h.set(W + 'anchor', anker); h.set(W + 'history', '1')
    r.addprevious(h); h.append(r)
    return p

def bookmark_von(ueberschrift):
    p = finde(ueberschrift)
    bm = [b.get(W + 'name') for b in p.iter(W + 'bookmarkStart') if b.get(W + 'name', '').startswith('_Toc')]
    assert bm, 'kein Bookmark an ' + ueberschrift
    return bm[0]


# Vorlagen (werden vor allen Aenderungen eingesammelt)
V_PLAIN = finde('Weiter')
V_KEY   = finde('WENN')
V_BE    = finde('Verarbeitung dieses Vorgangs beenden, weiter mit dem nächsten Vorgang')
V_HINW  = next(p for p in alle() if ptext(p).startswith('Hinweis: Rahmenverträge (SU)'))
V_LISTE = finde('Kein BÜ-Vorgang')
V_KONT  = finde('Prozessende')
V_KAP   = finde('BE-Handling')
STIL_KEY   = V_KEY.find(W + 'pPr').find(W + 'pStyle').get(W + 'val')
STIL_LISTE = V_LISTE.find(W + 'pPr').find(W + 'pStyle').get(W + 'val')
STIL_KONT  = V_KONT.find(W + 'pPr').find(W + 'pStyle').get(W + 'val')
STIL_KAP   = V_KAP.find(W + 'pPr').find(W + 'pStyle').get(W + 'val')
RS_BE, RS_HINW = 'BusinessException', 'Hervorhebung'

def plain(text):   return clean_clone(V_PLAIN, text)
def key(text):     return clean_clone(V_KEY, text, pstyle=STIL_KEY)
def be(text):      return clean_clone(V_BE, text, rstyle=RS_BE)
def hinweis(text): return clean_clone(V_HINW, text, rstyle=RS_HINW)
def liste(text):   return clean_clone(V_LISTE, text, pstyle=STIL_LISTE)
def nach(p, *neue):
    for n in neue:
        p.addnext(n); p = n
    return p
def start(prefix):
    return next(p for p in alle() if ptext(p).startswith(prefix))
def entferne(p):
    ziel = p.getprevious()
    while ziel is not None and ziel.tag != W + 'p': ziel = ziel.getprevious()
    if ziel is None:
        ziel = p.getnext()
        while ziel.tag != W + 'p': ziel = ziel.getnext()
    loesche(p, anker_ziel=ziel)
def ersetze_ueberall(alt, neu):
    n = 0
    for t in doc.iter(W + 't'):
        if t.text and alt in t.text:
            t.text = t.text.replace(alt, neu); n += 1
    for p in alle():
        if alt in ptext(p):
            settext(p, ptext(p).replace(alt, neu)); n += 1
    return n
def stil(p):
    ppr = p.find(W + 'pPr')
    ps = ppr.find(W + 'pStyle') if ppr is not None else None
    return ps.get(W + 'val') if ps is not None else ''
def markiere_be(p):
    r = [r for r in p.findall(W + 'r') if r.find(W + 't') is not None][0]
    rpr = r.find(W + 'rPr')
    if rpr is None:
        rpr = etree.Element(W + 'rPr'); r.insert(0, rpr)
    for rs in rpr.findall(W + 'rStyle'): rpr.remove(rs)
    rs = etree.Element(W + 'rStyle'); rs.set(W + 'val', RS_BE); rpr.insert(0, rs)

ANK_BE     = bookmark_von('BE-Handling')
ANK_WEITER = bookmark_von('Weiterleitung an den BÜ-Bot')
def link(text, anker): return verlinke(plain(text), anker)

# Schrittbereich: alles ab der Legende
LEGENDE = start('Notation nach der Vorgabe des Templates')
def im_schrittbereich():
    ps = alle(); i = ps.index(LEGENDE); return ps[i + 1:]

# ============================================================ 1. Kommentare 61 / 77: Klassifizierung Hart / Weich entfernen
n_hw = 0
for p in [p for p in im_schrittbereich() if ptext(p) in ('<BE> = „Hart“', '<BE> = „Weich“')]:
    entferne_ziel = p.getnext()            # Anker wandern auf die Folgezeile (<BE-Klassifikation> bzw. Merke Prüfnotiz)
    loesche(p, anker_ziel=entferne_ziel); n_hw += 1
protokoll.append(f'{n_hw} Zeilen <BE> = „Hart“/„Weich“ entfernt')

# ============================================================ 2. Kommentar 78: Merke Prüfnotiz ... in <Fehlerliste>; Variable umbenannt
n_m = 0
for p in [p for p in im_schrittbereich() if ptext(p).startswith('Merke Prüfnotiz „')]:
    settext(p, ptext(p) + ' in <Fehlerliste>'); n_m += 1
n_f = ersetze_ueberall('<Prüfnotizen>', '<Fehlerliste>')
protokoll.append(f'{n_m} Merke-Zeilen auf <Fehlerliste> erweitert, <Prüfnotizen> an {n_f} Stellen umbenannt')

# ============================================================ 3. Kommentare 62 / 79: SONST / Weiter komplett entfernen
n_w = 0
for p in [p for p in im_schrittbereich() if ptext(p) == 'Weiter']:
    entferne(p); n_w += 1
n_s = 0
for p in [p for p in im_schrittbereich() if ptext(p) == 'SONST' and stil(p) == STIL_KEY]:
    if ptext(p.getnext()) == 'Ende WENN':
        entferne(p); n_s += 1
protokoll.append(f'{n_w} Zeilen „Weiter“ und {n_s} leere SONST-Zweige entfernt')

# ============================================================ 4. Kommentar 87: neues Kapitel „Test auf Fehlerliste“ an der Stelle „Einfügen“
p_ein = finde('Einfügen')
tbl_vk = p_ein.getprevious()
while tbl_vk.tag != W + 'tbl': tbl_vk = tbl_vk.getprevious()
tbl72 = next(t for t in doc.iter(W + 'tbl') if ptext(t).startswith('Hinweis: Es wurde keine BE festgestellt'))
tbl_neu = copy.deepcopy(tbl72)
for e in list(tbl_neu.iter()):
    if e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd') or (e.tag == W + 'r' and e.find(W + 'commentReference') is not None):
        e.getparent().remove(e)
zellen = list(tbl_neu.iter(W + 'tc'))
mitte = zellen[1]
for q in list(mitte.findall(W + 'p')): mitte.remove(q)
for q in (hinweis('Hinweis: Alle Einzelprüfungen sind durchlaufen. Abweichungen aus den Einzelprüfungen wurden als '
                  'Prüfnotizen in <Fehlerliste> gesammelt.'),
          key('WENN'), plain('<Fehlerliste> <> leer'), key('DANN'),
          plain('<BE-Klassifikation> = „Nachprüfung erforderlich“'),
          link('Weiter zum Kapitel „BE-Handling“', ANK_BE),
          key('Ende WENN'),
          link('Weiter zum Kapitel „Weiterleitung an den BÜ-Bot“', ANK_WEITER)):
    mitte.append(q)
# Absatz „Einfügen“ (Anker Kommentar 87) wird zur Kapitelueberschrift
kap = p_ein
settext(kap, 'III. Test auf Fehlerliste')
ppr = kap.find(W + 'pPr')
if ppr is None:
    ppr = etree.Element(W + 'pPr'); kap.insert(0, ppr)
ps = ppr.find(W + 'pStyle')
if ps is None: ps = etree.SubElement(ppr, W + 'pStyle')
ps.set(W + 'val', STIL_KAP)
bm_id = str(max(int(b.get(W + 'id')) for b in doc.iter(W + 'bookmarkStart')) + 1)
bs = etree.Element(W + 'bookmarkStart'); bs.set(W + 'id', bm_id); bs.set(W + 'name', '_Toc_TestFehlerliste')
be_ = etree.Element(W + 'bookmarkEnd'); be_.set(W + 'id', bm_id)
kap.insert(1 if kap.find(W + 'pPr') is not None else 0, bs); kap.append(be_)
kont = clean_clone(V_KONT, 'Test auf Fehlerliste', pstyle=STIL_KONT)
leer = copy.deepcopy(kap.getnext()) if ptext(kap.getnext()) == '' and kap.getnext().tag == W + 'p' else plain('')
kap.addnext(kont); kont.addnext(tbl_neu); tbl_neu.addnext(plain(''))
# Vertriebskanal: Sprung fuehrt jetzt in das neue Kapitel
p_vk = next(p for p in tbl_vk.iter(W + 'p') if ptext(p) == 'Weiter zum Kapitel „BE-Handling“')
h_vk = p_vk.find(W + 'hyperlink'); assert h_vk is not None
h_vk.set(W + 'anchor', '_Toc_TestFehlerliste')
ts = list(h_vk.iter(W + 't')); ts[0].text = 'Weiter zum Kapitel „Test auf Fehlerliste“'
for t in ts[1:]: t.text = ''
assert ptext(p_vk) == 'Weiter zum Kapitel „Test auf Fehlerliste“', ptext(p_vk)
protokoll.append('Kapitel „III. Test auf Fehlerliste“ eingefügt, Sprung aus „Ermittlung Vertriebskanal“ umgestellt')

# ============================================================ 5. Kommentar 90: BE-Handling fuer alle BE identisch
h1 = start('Hinweis: Alle Prüfschritte melden Business Exceptions')
h2 = start('Hinweis: Harte und weiche BE werden an den Themenpostkorb')
settext(h1, 'Hinweis: Jede Business Exception wird an dieser Stelle einheitlich behandelt. <BE-Klassifikation> trägt den '
            'Grund der BE; <Fehlerliste> enthält die in den Einzelprüfungen gesammelten Prüfnotizen. Der Umgang mit BE ist '
            'nur hier beschrieben und wird in den einzelnen Schritten nicht wiederholt.')
settext(h2, 'Hinweis: Der Vorgang wird mit dem Bearbeitungshinweis an den Themenpostkorb „HSB4K MV“ zur manuellen '
            'Bearbeitung weitergeleitet. Vorgänge ohne BE werden dunkel verarbeitet und laufen nicht in diesen Postkorb.')
# alten WENN-Block bis „Ende WENN“ entfernen
p = h2.getnext(); assert ptext(p) == 'WENN'
while True:
    nxt = p.getnext(); t = ptext(p)
    entferne(p)
    if t == 'Ende WENN': break
    p = nxt
nach(h2, be('<BE> = „ja“'),
     plain('Feld „Bearbeitungshinweis“ = <BE-Klassifikation>'),
     key('WENN'), plain('<Fehlerliste> <> leer'), key('DANN'),
     plain('<Fehlerliste> an den Bearbeitungshinweis anhängen, jede Prüfnotiz in einer eigenen Zeile'),
     key('Ende WENN'),
     plain('Bearbeitungshinweis am Postkorbvorgang speichern'),
     plain('<BE>, <BE-Klassifikation> und <Fehlerliste> in das Reporting übernehmen'),
     plain('Vorgang an den Themenpostkorb „HSB4K MV“ weiterleiten'),
     be('Verarbeitung dieses Vorgangs beenden, weiter mit dem nächsten Vorgang'))
settext(finde('Mögliche Werte von <BE-Klassifikation> (harte BE):'), 'Mögliche Werte von <BE-Klassifikation>:')
nach(finde('Keine Zusammenarbeit'), liste('Nachprüfung erforderlich'))
settext(finde('Mögliche Prüfnotizen (weiche BE):'), 'Mögliche Prüfnotizen in <Fehlerliste>:')
protokoll.append('BE-Handling ohne Hart/Weich-Weiche neu aufgebaut')

# ============================================================ 6. Kommentar 92: Schritte 12 und 13 zusammenfuehren, BE-Handling hinter Schritt 13
k72 = finde('72-Stunden-BOT (für alle Sparten)')
t72 = k72.getnext(); assert t72.tag == W + 'tbl'
l72 = t72.getnext(); assert l72.tag == W + 'p' and ptext(l72) == ''
tr72 = t72.find(W + 'tr')
p_sprung = next(p for p in tr72.iter(W + 'p') if ptext(p).startswith('Weiter zum fachlichen Kontext „Notizbestückung'))
entferne(p_sprung)
knz = finde('Notizbestückung von Prüf-Bot auf BÜ-Bot')
tnz = knz.getnext(); assert tnz.tag == W + 'tbl'
tnz.insert(list(tnz).index(tnz.find(W + 'tr')), tr72)
for e in (t72, l72): e.getparent().remove(e)
k72.getparent().remove(k72)
# BE-Handling-Block (Kapitel, Kontext, Tabelle, Leerabsatz) hinter das Prozessende verschieben
kbe = finde('BE-Handling'); assert stil(kbe) == STIL_KAP
block = [kbe, kbe.getnext(), kbe.getnext().getnext(), kbe.getnext().getnext().getnext()]
assert block[2].tag == W + 'tbl' and ptext(block[3]) == ''
kpe = finde('Prozessende'); tpe = kpe.getnext(); lpe = tpe.getnext()
assert tpe.tag == W + 'tbl' and ptext(lpe) == ''
ziel = lpe
for e in block:
    ziel.addnext(e); ziel = e
protokoll.append('72-Stunden-BOT und Notizbestückung zusammengeführt, BE-Handling hinter Prozessende verschoben')

# ============================================================ 7. Folgeaenderungen der Klassifizierungs-Entfernung in Legende, Hinweisen und Variablentabelle
settext(LEGENDE, ptext(LEGENDE)
    .replace('Business Exceptions werden über zwei Variablen gemeldet: <BE> klassifiziert die BE als „Hart“ oder „Weich“, '
             '<BE-Klassifikation> trägt bei einer harten BE den Grund. Eine harte BE beendet die Prüfung sofort und '
             'verzweigt in das zentrale BE-Handling; sie kann in der Vorprüfung und in jedem späteren Schritt auftreten. '
             'Eine weiche BE wird mit „Merke Prüfnotiz …“ in <Fehlerliste> gesammelt, die Verarbeitung läuft weiter. '
             'Wie mit beiden Arten umgegangen wird',
             'Eine Business Exception wird über <BE-Klassifikation> (Grund) gemeldet; sie beendet die Prüfung sofort und '
             'verzweigt in das zentrale BE-Handling. Sie kann in der Vorprüfung und in jedem späteren Schritt auftreten. '
             'Abweichungen aus den Einzelprüfungen werden mit „Merke Prüfnotiz … in <Fehlerliste>“ gesammelt, die '
             'Verarbeitung läuft weiter; am Ende der Prüfungen wird die Fehlerliste getestet. Wie mit einer BE umgegangen wird'))
assert 'Hart' not in ptext(LEGENDE), ptext(LEGENDE)
n_t = 0
for a, b in [
 ('Jedes der vier Ausschlusskriterien ist eine harte BE.', 'Jedes der vier Ausschlusskriterien ist eine BE.'),
 ('endet der Vorgang mit einer harten BE.', 'endet der Vorgang mit einer BE.'),
 ('wird <BE> = „Hart“ mit <BE-Klassifikation> „Keine Zusammenarbeit“ gesetzt', 'wird <BE-Klassifikation> „Keine Zusammenarbeit“ gesetzt'),
 ('Bei „inaktiv“ harte BE mit <BE-Klassifikation>', 'Bei „inaktiv“ BE mit <BE-Klassifikation>'),
 ('Abgleich gegen BUE_KUNDE_NACHNAME, weiches Kriterium.', 'Abgleich gegen BUE_KUNDE_NACHNAME; Abweichung als Prüfnotiz in <Fehlerliste>.'),
 ('Abgleich gegen BUE_KUNDE_VORNAME, weiches Kriterium.', 'Abgleich gegen BUE_KUNDE_VORNAME; Abweichung als Prüfnotiz in <Fehlerliste>.'),
 ('Abgleich gegen BUE_KUNDE_GEBDAT, weiches Kriterium.', 'Abgleich gegen BUE_KUNDE_GEBDAT; Abweichung als Prüfnotiz in <Fehlerliste>.'),
 ('Abgleich gegen BUE_KUNDE_STRASSE, weiches Kriterium.', 'Abgleich gegen BUE_KUNDE_STRASSE; Abweichung als Prüfnotiz in <Fehlerliste>.'),
 ('Abgleich gegen BUE_KUNDE_PLZ, weiches Kriterium.', 'Abgleich gegen BUE_KUNDE_PLZ; Abweichung als Prüfnotiz in <Fehlerliste>.'),
 ('Bei Start leer. Ausprägungen: Hart (sofortiger Ausstieg in das BE-Handling), Weich (Verarbeitung läuft weiter, Prüfnotiz wird gesammelt). Steuert das zentrale BE-Handling.',
  'Bei Start leer. Wird im BE-Handling auf „ja“ gesetzt, sobald eine Business Exception vorliegt.'),
 ('Abgeleitet, Vorprüfung und harte Prüfschritte', 'Abgeleitet, Vorprüfung, Prüfschritte und Test auf Fehlerliste'),
 ('Pflichtfeld bei <BE> = „Hart“', 'Pflichtfeld bei einer BE'),
 ('Bei Start leer. Wird bei einer harten BE gesetzt und in den Bearbeitungshinweis übernommen; bei weichen BE steht der Grund als Prüfnotiz in <Fehlerliste>.',
  'Bei Start leer. Wird bei einer BE gesetzt und in den Bearbeitungshinweis übernommen.'),
 ('Liste aller gemerkten Prüfnotizen (weiche BE) des Vorgangs', 'Liste aller gemerkten Prüfnotizen des Vorgangs'),
 ('Abgeleitet, jede Prüfung mit „Merke Prüfnotiz …“', 'Abgeleitet, jede Prüfung mit „Merke Prüfnotiz … in <Fehlerliste>“'),
 ('Bei Start leer. Jede weiche BE hängt ihre Prüfnotiz an.', 'Bei Start leer. Jede Abweichung in den Einzelprüfungen hängt ihre Prüfnotiz an. Wird im Kapitel „Test auf Fehlerliste“ geprüft.'),
]:
    n_t += ersetze_ueberall(a, b)
# Variablenname in der Tabelle
vt = next(tb for tb in doc.iter(W + 'tbl') if 'Variablenname' in ptext(list(tb.iter(W + 'tc'))[0]))
for tr in vt.iter(W + 'tr'):
    c0 = list(tr.iter(W + 'p'))[0]
    if ptext(c0) == 'Prüfnotizen': settext(c0, 'Fehlerliste')
rest = [ptext(p)[:80] for p in alle() if re.search(r'„Hart“|„Weich“|harte BE|weiche BE|weiches Kriterium|hartes Kriterium', ptext(p))]
protokoll.append(f'{n_t} Folgeänderungen in Legende/Hinweisen/Variablentabelle; Reste: {rest}')

# ============================================================ 8. Kommentar 52: Auspraegungen BUE_ART_UNTERLAGEN
p52 = start('Feld_Format CH. Freitext, mehrere Angaben mit Semikolon getrennt.')
settext(p52, ptext(p52) + ' Hinweis zur Umsetzung des Kommentars: Für <BUE_ART_UNTERLAGEN> sind in den vorliegenden '
             'Unterlagen keine festen Ausprägungen definiert (Freitext aus der KI-Auslesung). Die zulässigen Ausprägungen '
             'sind vom Fachbereich festzulegen und hier nachzutragen.')
protokoll.append('Kommentar 52: Ausprägungen nicht ableitbar, Hinweis eingefügt')

teile['word/document.xml'] = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)

# ============================================================ 9. Kommentare von M. Jeglorz (HSB4K-EXTERN) als erledigt markieren; Felder beim Oeffnen aktualisieren
kom = etree.fromstring(teile['word/comments.xml'])
ERLEDIGT = {'52', '61', '62', '77', '78', '79', '87', '90', '92'}
paraids = {}
for c in kom.findall(W + 'comment'):
    if c.get(W + 'id') in ERLEDIGT:
        assert c.get(W + 'author') == 'Jeglorz, Marco (HSB4K-EXTERN)', c.get(W + 'author')
        paraids[list(c.iter(W + 'p'))[-1].get(W14 + 'paraId')] = c.get(W + 'id')
ext = etree.fromstring(teile['word/commentsExtended.xml'])
n = 0
for ce in ext.iter(W15 + 'commentEx'):
    if ce.get(W15 + 'paraId') in paraids:
        ce.set(W15 + 'done', '1'); n += 1
teile['word/commentsExtended.xml'] = etree.tostring(ext, xml_declaration=True, encoding='UTF-8', standalone=True)
sett = etree.fromstring(teile['word/settings.xml'])
if sett.find(W + 'updateFields') is None:
    uf = etree.Element(W + 'updateFields'); uf.set(W + 'val', 'true')
    folge = next((e for tag in ('hdrShapeDefaults', 'footnotePr', 'endnotePr', 'compat', 'docVars', 'rsids')
                  for e in [sett.find(W + tag)] if e is not None), None)
    if folge is not None: folge.addprevious(uf)
    else: sett.append(uf)
teile['word/settings.xml'] = etree.tostring(sett, xml_declaration=True, encoding='UTF-8', standalone=True)
protokoll.append(f'{n} Kommentare als erledigt markiert: {sorted(ERLEDIGT)}; Felder (Inhaltsverzeichnis) werden beim Öffnen aktualisiert')

zout = zipfile.ZipFile('PDD_neu.docx', 'w', zipfile.ZIP_DEFLATED)
for name in zin.namelist():
    zout.writestr(zin.getinfo(name), teile[name])
zout.close()
print('\n'.join(protokoll))
