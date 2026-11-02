# -*- coding: utf-8 -*-
"""VNR aus dem Postkorbvorgang, BUE_UMFANG, Ersatzfeld BUE_VNR_2 und Vermerk „Manuelle Prüfung VNR/Sparte“
(Abstimmung Maklerservice / ODPB / Celonis vom 08./09.09.2026) im PDD Gesundheit/KV."""
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
V_PLAIN = finde('Postkorbvorgang öffnen.')
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

# Tabellenhelfer
vt = next(tb for tb in doc.iter(W + 'tbl') if 'Variablenname' in ptext(list(tb.iter(W + 'tc'))[0]))
def zeile(name):
    return next(tr for tr in vt.iter(W + 'tr') if ptext(list(tr.iter(W + 'tc'))[0]) == name)
def setze_zeile(tr, werte):
    for zelle, wert in zip(tr.iter(W + 'tc'), werte):
        if wert is not None:
            settext(list(zelle.iter(W + 'p'))[0], wert)
def neue_zeile(vorlage_tr, werte):
    tr = copy.deepcopy(vorlage_tr)
    for zelle in tr.iter(W + 'tc'):
        ps = list(zelle.iter(W + 'p'))
        for q in ps[1:]: q.getparent().remove(q)
        for e in list(ps[0]):
            if e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd', W + 'proofErr'): ps[0].remove(e)
            elif e.tag == W + 'r' and e.find(W + 'commentReference') is not None: ps[0].remove(e)
    setze_zeile(tr, werte)
    return tr
MP = 'Manuelle Prüfung VNR/Sparte'

# ============================================================ 1. Variablentabelle
setze_zeile(zeile('BUE_VNR'), [None, 'Versicherungsnummer(n) des zu übertragenden Vertrags aus der KI-Auslesung', None, None,
    'Feld_Format CH. Durch Celonis normiert: zwei Buchstaben Spartenkürzel und neun Ziffern (11 Zeichen), mehrere Nummern '
    'semikolongetrennt; Ersatzwert „' + MP + '“. Wird nicht für die Hostaufrufe genutzt (dafür <Vorgang-VNR>), sondern für den '
    'Abgleich mit <Vorgang-VNR> und bei mehreren Nummern für den Bearbeitungshinweis.'])
z = zeile('BUE_VNR')
z.addnext(neue_zeile(z, ['BUE_VNR_2', 'Weitere Versicherungsnummern (Ersatzfeld, damit keine Nummer abgeschnitten wird)',
    'Datenpool, Feld „Versicherungsnummer_2“', 'optional',
    'Feld_Format CH. Gleiches Format wie BUE_VNR. Wird bei <BUE_UMFANG> = „Mehrere“ zusammen mit <BUE_VNR> in den '
    'Bearbeitungshinweis übernommen.']))
setze_zeile(zeile('BUE_SPARTE'), [None, 'Spartenkürzel des Vertrags aus der normierten Versicherungsnummer', None, None,
    'Feld_Format CH. Zwei Buchstaben je Versicherungsnummer, mehrere semikolongetrennt in der Reihenfolge von BUE_VNR; '
    'Ersatzwert „' + MP + '“. Wird nachrichtlich mitgeführt; die Sparte ist durch den Postkorb Gesundheit vorgegeben.'])
zw = zeile('BUE_WUNSCH_VORHANDEN')
zw.addnext(neue_zeile(zw, ['BUE_UMFANG', 'Umfang der Bestandsübertragung', 'Datenpool, Feld „Umfang“', 'Pflichtfeld',
    'Feld_Format CH. Ausprägungen: Einzel (genau eine Versicherungsnummer), Gesamt (gesamte Kundenverbindung), Mehrere '
    '(mehrere einzelne Versicherungsnummern, auch wenn nur ein Teil normierbar war). „Mehrere“ führt in der Vorprüfung zu '
    'einer BE. Gesamt wird wie Einzel verarbeitet; der Test zur parallelen Bearbeitung mehrerer Vorgänge durch den BÜ-Bot '
    'steht aus.']))
setze_zeile(zeile('VNR-normalisiert'), ['Vorgang-VNR', 'Versicherungsnummer, mit der Celonis den Postkorbvorgang eröffnet hat',
    'EWMS-Postkorb, Schritt „Eröffnung Postkorbvorgang und Daten im Datenpool“', 'Pflichtfeld',
    'Bereits normiert (zwei Buchstaben Spartenkürzel und neun Ziffern). Einstieg für die Hostaufrufe VA230 und IS100; eine '
    'Normierung im Bot entfällt.'])
protokoll.append('Variablentabelle: BUE_VNR, BUE_SPARTE angepasst; BUE_VNR_2, BUE_UMFANG neu; VNR-normalisiert -> Vorgang-VNR')

# ============================================================ 2. Start: VNR des Postkorbvorgangs lesen
p = finde('<Vorgang-Lfd-Nr> ist der Ordnungsbegriff dieses Prozesses.')
nach(p, plain('Lese die Versicherungsnummer des Postkorbvorgangs aus und speichere als <Vorgang-VNR>.'),
     hinweis('Hinweis: <Vorgang-VNR> ist die Nummer, mit der Celonis den Vorgang eröffnet hat, bereits normiert auf zwei '
             'Buchstaben Spartenkürzel und neun Ziffern. Sie ist der Einstieg für alle Hostaufrufe. <BUE_VNR> und '
             '<BUE_VNR_2> aus dem Datenpool dienen dem Abgleich und dem Bearbeitungshinweis.'))
protokoll.append('Start: <Vorgang-VNR> aus dem Postkorbvorgang')

# ============================================================ 3. Vorpruefung: Umfang und nicht ermittelbare VNR
p = finde('<BE-Klassifikation> = „Erinnerung / Reminder“')
ende = p.getnext().getnext(); assert ptext(ende) == 'Ende WENN', ptext(ende)
nach(ende,
     key('WENN'), plain('<BUE_UMFANG> = „Mehrere“'), key('DANN'),
     plain('<BE-Klassifikation> = „Mehrere Versicherungsnummern“'), link('Weiter zum Kapitel „BE-Handling“', ANK_BE), key('Ende WENN'),
     key('WENN'), plain('<BUE_VNR> = „' + MP + '“'), key('DANN'),
     plain('<BE-Klassifikation> = „VNR nicht ermittelbar“'), link('Weiter zum Kapitel „BE-Handling“', ANK_BE), key('Ende WENN'))
p = start('Hinweis: Vor den fachlichen Prüfungen wird anhand der Datenpool-Felder')
settext(p, ptext(p).replace('Jedes der vier Ausschlusskriterien ist eine BE.', 'Jedes Ausschlusskriterium ist eine BE.'))
p = start('Hinweis: Bei jedem Ausschlusskriterium geht der Vorgang ohne weitere Prüfung')
nach(p, hinweis('Hinweis: Vorgänge mit <BUE_UMFANG> = „Gesamt“ werden wie Einzelvorgänge verarbeitet; der Test zur parallelen '
                'Bearbeitung mehrerer Vorgänge durch den BÜ-Bot steht aus. Bei „Mehrere“ werden die weiteren '
                'Versicherungsnummern aus <BUE_VNR> und <BUE_VNR_2> im BE-Handling in den Bearbeitungshinweis übernommen. '
                'Vorgänge ohne ermittelbare Versicherungsnummer erreichen den Prüf-Bot in der Regel nicht, weil das '
                'Eingangsmanagement sie manuell zuordnet; die Prüfung ist eine Absicherung.'))
protokoll.append('Vorprüfung: BE bei BUE_UMFANG = Mehrere und bei nicht ermittelbarer VNR')

# ============================================================ 4. VNR-Pruefung: Einstieg mit <Vorgang-VNR>, kein Normieren im Bot
p1 = start('<BUE_VNR> liegt aus dem Datenpool vor')
p2 = start('Entferne führende Nullen')
neu = hinweis('Hinweis: Der Einstieg erfolgt mit <Vorgang-VNR>. Eine Normierung im Bot entfällt, weil Celonis die Nummer '
              'bereits normiert übergibt.')
p1.addprevious(neu)
loesche(p1, anker_ziel=neu); loesche(p2, anker_ziel=neu)
n_vnr = ersetze_ueberall('<VNR-normalisiert>', '<Vorgang-VNR>')
# Abgleich Datenpool gegen Vorgangs-VNR (weich)
p = start('Hinweis: Ein gefülltes Feld „Vertragsbeginn“')
nach(p, key('WENN'), plain('<Vorgang-VNR> nicht in <BUE_VNR> enthalten'), key('DANN'),
     plain('Merke Prüfnotiz „VNR im Datenpool abweichend“ in <Fehlerliste>'), key('Ende WENN'))
protokoll.append(f'VNR-Prüfung: Einstieg mit <Vorgang-VNR> ({n_vnr} Stellen), Normierung entfernt, Abgleich als Prüfnotiz')

# ============================================================ 5. BE-Handling: weitere VNR in den Bearbeitungshinweis, Wertelisten
p = start('<Fehlerliste> an den Bearbeitungshinweis anhängen')
ende = p.getnext(); assert ptext(ende) == 'Ende WENN'
nach(ende, key('WENN'), plain('<BUE_UMFANG> = „Mehrere“'), key('DANN'),
     plain('Weitere Versicherungsnummern aus <BUE_VNR> und <BUE_VNR_2> an den Bearbeitungshinweis anhängen'), key('Ende WENN'))
nach(finde('Nachprüfung erforderlich'), liste('Mehrere Versicherungsnummern'), liste('VNR nicht ermittelbar'))
nach(finde('Anbindung Bestandsinhaber nicht aktiv'), liste('VNR im Datenpool abweichend'))
for p in [p for p in alle() if stil(p) == STIL_LISTE and ptext(p) in ('Mehrere Versicherungsnummern', 'VNR nicht ermittelbar', 'VNR im Datenpool abweichend')]:
    ppr = p.find(W + 'pPr')
    if ppr.find(W + 'numPr') is None:
        numpr = etree.Element(W + 'numPr'); il = etree.SubElement(numpr, W + 'ilvl'); il.set(W + 'val', '0')
        ni = etree.SubElement(numpr, W + 'numId'); ni.set(W + 'val', '4'); ppr.insert(1, numpr)
protokoll.append('BE-Handling: weitere VNR bei Umfang Mehrere, Wertelisten ergänzt')

# ============================================================ 6. Ablaufdiagramm als editierbare Word-Zeichnung
import zeichnung
p_cap = start('Die Detaillierung der einzelnen Schritte erfolgt im Kapitel')
p_img = p_cap.getprevious()
while p_img is not None and p_img.find('.//' + W + 'drawing') is None: p_img = p_img.getprevious()
alt_dr = p_img.find('.//' + W + 'drawing')
neu_dr = etree.fromstring(zeichnung.ablaufdiagramm())
alt_dr.getparent().replace(alt_dr, neu_dr)
protokoll.append('Ablaufdiagramm: Bild durch editierbare Zeichnung (Formen und Verbinder) ersetzt')

rest = [ptext(p)[:80] for p in alle() if 'VNR-normalisiert' in ptext(p) or 'Versicherungsscheinnummer normalisieren' in ptext(p)]
assert not rest, rest
teile['word/document.xml'] = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
zout = zipfile.ZipFile('PDD_neu.docx', 'w', zipfile.ZIP_DEFLATED)
for name in zin.namelist():
    zout.writestr(zin.getinfo(name), teile[name])
zout.close()
print('\n'.join(protokoll))
