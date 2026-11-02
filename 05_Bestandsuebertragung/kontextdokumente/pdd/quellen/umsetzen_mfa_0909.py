# -*- coding: utf-8 -*-
"""Mehrfachagenten (MFA): Vollmachtskriterien N/A, Betreuungswunsch und Unterschrift VN als harte Kriterien
(Abstimmung Schwarz / Koch, 09.09.2026). Vorher: VNR aus dem Postkorbvorgang, BUE_UMFANG, Ersatzfeld BUE_VNR_2 und Vermerk „Manuelle Prüfung VNR/Sparte“
(Abstimmung Maklerservice / ODPB / Celonis vom 08./09.09.2026) im PDD Gesundheit/KV."""
import copy, re, zipfile
from lxml import etree

W   = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
W14 = '{http://schemas.microsoft.com/office/word/2010/wordml}'
W15 = '{http://schemas.microsoft.com/office/word/2012/wordml}'
XML = '{http://www.w3.org/XML/1998/namespace}'

zin = zipfile.ZipFile('PDD_neu.docx')
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

# ============================================================ 1. Variablentabelle: MFA und N/A
setze_zeile(zeile('BUE_VERMITTLER_TYP'), [None, None, None, None,
    'Feld_Format CH. Ausprägungen: Makler, MFA (Mehrfachagent, erkannt über den EMMA-Abgleich der Agenturnummer). Steuert in '
    'der Vorprüfung, ob die Vollmachtskriterien (Makler) oder die Betreuungswunsch-Kriterien (MFA) gelten, sowie die '
    'Ausprägung „Bearbeitung nach“ in der Notiz.'])
setze_zeile(zeile('BUE_MV_ENTHALTEN'), [None, None, None, None, 'Feld_Format CH. Ausprägungen: ja, nein, N/A. N/A bei MFA, dort ist keine Maklervollmacht erforderlich.'])
setze_zeile(zeile('BUE_MV_STATUS'), [None, None, None, None, 'Feld_Format CH. Ausprägungen: OK, MV unvollständig, MV fehlt, kein Anhang, nicht prüfbar, N/A (bei MFA).'])
setze_zeile(zeile('BUE_MV_AUF_MAKLER'), [None, 'Ist die Vollmacht bzw. der Betreuungswunsch auf den übernehmenden Vermittler ausgestellt?', None, None,
    'Feld_Format CH. Ausprägungen: ja, nein, nicht prüfbar. Makler: Bewertung bereits in BUE_PRUEFUNG_UNTERLAGEN enthalten. MFA: '
    'hartes Kriterium, der Betreuungswunsch muss auf den MFA lauten.'])
setze_zeile(zeile('BUE_MV_VOLLUMFAENGLICH'), [None, None, None, None, 'Feld_Format CH. Ausprägungen: ja, teilweise, nein, nicht prüfbar, N/A (bei MFA). Wird mitgeführt; die Bewertung ist bereits in BUE_PRUEFUNG_UNTERLAGEN enthalten.'])
setze_zeile(zeile('BUE_MV_UNTERSCHRIFT_KUNDE'), [None, 'Hat der Versicherungsnehmer die Maklervollmacht bzw. den Betreuungswunsch unterschrieben?', None, None,
    'Feld_Format CH. Ausprägungen: ja, nein, nicht prüfbar. Makler: Bewertung bereits in BUE_PRUEFUNG_UNTERLAGEN enthalten. MFA: '
    'hartes Kriterium. Der Feldname nutzt die maximal zulässigen 25 Zeichen.'])
setze_zeile(zeile('BUE_UV_ERTEILT'), [None, None, None, None, 'Feld_Format CH. Ausprägungen: ja, nein, N/A. N/A bei MFA, die Untervollmacht wird dann nicht geprüft. Steuert die Ausprägung „Bearbeitung nach“ in der Notiz.'])
setze_zeile(zeile('BUE_MV_UNTERSCHRIFTSDATUM'), [None, 'Datum, an dem der Kunde die Maklervollmacht bzw. den Betreuungswunsch unterschrieben hat', None, None, None])
setze_zeile(zeile('BUE_PRUEFUNG_UNTERLAGEN'), [None, None, None, None,
    'Feld_Format CH. Ausprägungen: leer, „Reminder - keine Vollst.-Prüfung“, „Vollständig“, „BÜ-Wunsch fehlt“, „MV fehlt“, „MV unvollständig“, '
    '„VN-Unterschrift fehlt“. Mehrere Mängel kommagetrennt. Das Feld fasst die Bewertung der Vollmachtsfelder zusammen und wird nur '
    'im Makler-Zweig geprüft; bei MFA ist es nicht belegt.'])
protokoll.append('Variablentabelle: MFA-Bezug und N/A in den Vollmachtsfeldern')

# ============================================================ 2. Vorpruefung: Makler-Zweig (Unterlagen) und MFA-Zweig (Betreuungswunsch, Unterschrift)
p_cond = finde('<BUE_PRUEFUNG_UNTERLAGEN> <> „Vollständig“')
p_wenn = p_cond.getprevious(); assert ptext(p_wenn) == 'WENN'
p_link = finde('Weiter zu „I. VN – Stammdaten + VNR“')
p_sonst = p_link.getprevious()
while p_sonst.tag != W + 'p': p_sonst = p_sonst.getprevious()
assert ptext(p_sonst) == 'SONST', ptext(p_sonst)
p_end = p_link.getnext()
while p_end.tag != W + 'p': p_end = p_end.getnext()
assert ptext(p_end) == 'Ende WENN', ptext(p_end)
p_wenn.addprevious(key('WENN')); p_wenn.addprevious(plain('<BUE_VERMITTLER_TYP> = „MFA“')); p_wenn.addprevious(key('DANN'))
for cond, klass in (('<BUE_MV_AUF_MAKLER> <> „ja“', 'Betreuungswunsch nicht auf MFA ausgestellt'),
                    ('<BUE_MV_UNTERSCHRIFT_KUNDE> <> „ja“', 'Unterschrift VN fehlt')):
    for q in (key('WENN'), plain(cond), key('DANN'), plain(f'<BE-Klassifikation> = „{klass}“'), link('Weiter zum Kapitel „BE-Handling“', ANK_BE), key('Ende WENN')):
        p_wenn.addprevious(q)
p_wenn.addprevious(key('SONST'))
entferne(p_sonst)                    # inneres SONST entfaellt
p_end.addnext(p_link)                # Sprung hinter das (aeussere) Ende WENN
# inneres Ende WENN fuer den Unterlagen-Block, aeusseres bleibt p_end
p_link_be = p_link.getprevious()     # jetzt: Ende WENN (aeusser)
p_be_unterlagen = finde('<BE-Klassifikation> = „Unterlagen nicht vollständig“')
p_be_unterlagen.getnext().addnext(key('Ende WENN'))
p = start('Hinweis: Bei jedem Ausschlusskriterium geht der Vorgang ohne weitere Prüfung')
nach(p, hinweis('Hinweis: Bei Mehrfachagenten (<BUE_VERMITTLER_TYP> = „MFA“) gibt es keine Maklervollmacht. Die Felder <BUE_MV_ENTHALTEN>, '
                '<BUE_MV_STATUS>, <BUE_MV_VOLLUMFAENGLICH> und <BUE_UV_ERTEILT> stehen dann auf N/A und werden nicht geprüft. Geprüft wird '
                'stattdessen, dass der Betreuungswunsch auf den MFA ausgestellt und vom Versicherungsnehmer unterschrieben ist. Das Feld '
                '<BUE_PRUEFUNG_UNTERLAGEN> gilt nur im Makler-Zweig.'))
protokoll.append('Vorprüfung: Verzweigung Makler (Unterlagen) / MFA (Betreuungswunsch, Unterschrift VN)')

# ============================================================ 3. Makler: Vermittlertyp gegen OB726-Klassifizierung (weich)
p = finde('Format: Makler, Mehrfachagent, Courtagefortzahler.')
nach(p, key('WENN'), plain('<BUE_VERMITTLER_TYP> = „MFA“ UND <OB726-Klassifizierung> <> „Mehrfachagent“'),
     plain('ODER <BUE_VERMITTLER_TYP> = „Makler“ UND <OB726-Klassifizierung> = „Mehrfachagent“'), key('DANN'),
     plain('Merke Prüfnotiz „Vermittlertyp abweichend“ in <Fehlerliste>'), key('Ende WENN'))
protokoll.append('Makler: Abgleich Vermittlertyp gegen OB726-Klassifizierung als Prüfnotiz')

# ============================================================ 4. Notiz: Bearbeitung nach bei MFA
p_pool = finde('<BUE_POOL> <> leer')
p_wenn = p_pool.getprevious(); assert ptext(p_wenn) == 'WENN'
settext(p_wenn, 'SONST WENN')
p_wenn.addprevious(key('WENN')); p_wenn.addprevious(plain('<BUE_VERMITTLER_TYP> = „MFA“')); p_wenn.addprevious(key('DANN'))
p_wenn.addprevious(plain('Feld „Bearbeitung nach“ = „mit BÜ“'))
p = finde('Feld „Bearbeitung nach“ = „mit BÜ“', nr=1)
ende = p.getnext(); assert ptext(ende) == 'Ende WENN'
nach(ende, hinweis('Hinweis: Bei MFA entfällt die Untervollmacht (<BUE_UV_ERTEILT> = N/A); die Notiz erhält „mit BÜ“.'))
protokoll.append('Notizbestückung: Bearbeitung nach = mit BÜ bei MFA')

# ============================================================ 4b. BUE_UMFANG: Mehrere als Pruefnotiz, Gesamt/Einzel in die Notiz
p_be = finde('<BE-Klassifikation> = „Mehrere Versicherungsnummern“')
p_l = p_be.getnext()
while p_l.tag != W + 'p': p_l = p_l.getnext()
assert ptext(p_l).startswith('Weiter zum Kapitel „BE-Handling“'), ptext(p_l)
settext(p_be, 'Merke Prüfnotiz „Mehrere Versicherungsnummern“ in <Fehlerliste>')
entferne(p_l)
setze_zeile(zeile('BUE_UMFANG'), [None, None, None, None,
    'Feld_Format CH. Ausprägungen: Einzel (genau eine Versicherungsnummer), Gesamt (gesamte Kundenverbindung), Mehrere (mehrere '
    'einzelne Versicherungsnummern, auch wenn nur ein Teil normierbar war). Einzel und Gesamt werden in der Notiz im Abschnitt '
    '„Betroffene VNR“ übernommen; Gesamt steht unter dem Vorbehalt des Tests zur parallelen Bearbeitung mehrerer Vorgänge durch den '
    'BÜ-Bot. Mehrere ist eine weiche BE: Prüfnotiz, die Prüfung läuft weiter, am Ende Nachprüfung mit den weiteren Nummern im '
    'Bearbeitungshinweis.'])
p = start('Hinweis: Vorgänge mit <BUE_UMFANG> = „Gesamt“ werden wie Einzelvorgänge verarbeitet')
settext(p, 'Hinweis: <BUE_UMFANG> = „Einzel“ und „Gesamt“ werden vollständig verarbeitet und in der Notiz unter „Betroffene VNR“ übernommen; '
           'für „Gesamt“ steht der Test zur parallelen Bearbeitung mehrerer Vorgänge durch den BÜ-Bot aus. „Mehrere“ ist eine weiche BE: '
           'Der Bot prüft den Vorgang zu Ende, der Test auf die Fehlerliste führt dann zur Nachprüfung, und die weiteren Versicherungsnummern '
           'aus <BUE_VNR> und <BUE_VNR_2> stehen im Bearbeitungshinweis. Vorgänge ohne ermittelbare Versicherungsnummer erreichen den Prüf-Bot '
           'in der Regel nicht, weil das Eingangsmanagement sie manuell zuordnet; die Prüfung ist eine Absicherung.')
# Notiz: Betroffene VNR
p_n = finde('Feld „Laufende Nr. aus Vorgangsdatenbank“ = <Vorgang-Lfd-Nr>')
nach(p_n, key('WENN'), plain('<BUE_UMFANG> = „Gesamt“'), key('DANN'), plain('Feld „Betroffene VNR“ = „gesamte Kundenverbindung“'),
     key('SONST'), plain('Feld „Betroffene VNR“ = „angegebene VNR beachten“ mit <Vorgang-VNR>'), key('Ende WENN'))
protokoll.append('BUE_UMFANG: Mehrere als Prüfnotiz, Betroffene VNR in der Notiz')

# ============================================================ 5. Wertelisten
nach(finde('VNR nicht ermittelbar'), liste('Betreuungswunsch nicht auf MFA ausgestellt'), liste('Unterschrift VN fehlt'))
nach(finde('VNR im Datenpool abweichend'), liste('Vermittlertyp abweichend'), liste('Mehrere Versicherungsnummern'))
entferne(finde('Mehrere Versicherungsnummern'))   # aus der Liste der BE-Klassifikationen (erstes Vorkommen)
for p in [p for p in alle() if stil(p) == STIL_LISTE and ptext(p) in ('Betreuungswunsch nicht auf MFA ausgestellt', 'Unterschrift VN fehlt', 'Vermittlertyp abweichend', 'Mehrere Versicherungsnummern')]:
    ppr = p.find(W + 'pPr')
    if ppr.find(W + 'numPr') is None:
        numpr = etree.Element(W + 'numPr'); il = etree.SubElement(numpr, W + 'ilvl'); il.set(W + 'val', '0')
        ni = etree.SubElement(numpr, W + 'numId'); ni.set(W + 'val', '4'); ppr.insert(1, numpr)
protokoll.append('BE-Handling: Wertelisten um MFA-Kriterien ergänzt')

# ============================================================ 6. Ablaufdiagramm neu (Text um MFA ergaenzt)
import zeichnung
p_cap = start('Die Detaillierung der einzelnen Schritte erfolgt im Kapitel')
p_img = p_cap.getprevious()
while p_img is not None and p_img.find('.//' + W + 'drawing') is None: p_img = p_img.getprevious()
alt_dr = p_img.find('.//' + W + 'drawing'); alt_dr.getparent().replace(alt_dr, etree.fromstring(zeichnung.ablaufdiagramm()))

teile['word/document.xml'] = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
zout = zipfile.ZipFile('PDD_mfa.docx', 'w', zipfile.ZIP_DEFLATED)
for name in zin.namelist():
    zout.writestr(zin.getinfo(name), teile[name])
zout.close()
print('\n'.join(protokoll))
