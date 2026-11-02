# -*- coding: utf-8 -*-
"""Setzt die Ergebnisse der PDD-Sichtung mit Robotics (U. Gerhards, 03.09.2026) um
und zieht die Entscheidung zur Untervollmacht (K. Rypa, 02.09.2026) nach."""
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
V_PLAIN  = finde('Weiter')                       # schlichter Absatz
V_KEY    = finde('WENN')                         # Formatvorlage WENN DANN
V_BE     = finde('Aussteuerung und Verarbeitung beenden')   # Zeichenformat Business Exception
V_HINW   = finde('Offener Punkt: Das automatische Auslesen der Versicherungsscheinnummern soll technisch und fachlich verbessert werden.')
V_LISTE  = finde('„Historischer Vertrag / Storno“ ergibt direkte Ablehnungsinformation')
V_KONT   = finde('Ablehnungsgründe auswerten und priorisieren')

STIL_KEY = V_KEY.find(W + 'pPr').find(W + 'pStyle').get(W + 'val')          # IntensivesZitat
STIL_LISTE = V_LISTE.find(W + 'pPr').find(W + 'pStyle').get(W + 'val')      # Listenabsatz
STIL_KONT = V_KONT.find(W + 'pPr').find(W + 'pStyle').get(W + 'val')        # fachlicherKontext
RS_BE = 'BusinessException'
RS_HINW = 'Hervorhebung'

def plain(text):          return clean_clone(V_PLAIN, text)
def key(text):            return clean_clone(V_KEY, text, pstyle=STIL_KEY)
def be(text):             return clean_clone(V_BE, text, rstyle=RS_BE)
def hinweis(text):        return clean_clone(V_HINW, text, rstyle=RS_HINW)
def liste(text):          return clean_clone(V_LISTE, text, pstyle=STIL_LISTE)

def nach(p, *neue):
    """Fuegt Absaetze hinter p ein und gibt den letzten zurueck."""
    for n in neue:
        p.addnext(n); p = n
    return p

ANK_BE = bookmark_von('BE überprüfen und priorisieren')
ANK_VN = bookmark_von('I. VN – Stammdaten + VNR')
ANK_NOTIZ = bookmark_von('Notizbestückung von Prüf-Bot auf BÜ-Bot')
ANK_WEITER = bookmark_von('Weiterleitung an den BÜ-Bot')
ANK_PNR = bookmark_von('Vermittler-Nr. (PNR) des übernehmenden Maklers (Anwendung OB726)')

def link_be():
    return verlinke(plain('Weiter zum Kapitel „BE-Handling“'), ANK_BE)

# ============================================================ 1. Legende
legende = next(p for p in alle() if ptext(p).startswith('Notation nach der Vorgabe des Templates'))
settext(legende,
 'Notation nach der Vorgabe des Templates. Drei Schreibweisen sind zu unterscheiden: <BUE_…> bezeichnet ein '
 'Eingangsfeld aus dem Datenpool, <…> einen vom Bot gelesenen oder gesetzten Wert, „…“ ohne Zusatz ein Feld auf '
 'der Hostmaske oder einen festen Wert. Variablen, die aus einer Hostanwendung gelesen werden, tragen die Anwendung '
 'im Namen. Damit ist in jedem Vergleich erkennbar, welche Quelle gegen welche geprüft wird: <IS100-Nachname> <> '
 '<BUE_KUNDE_NACHNAME> vergleicht den in IS100 gelesenen Nachnamen mit dem Feld aus dem Datenpool. Schlüsselwörter '
 'WENN / DANN / SONST / Weiter / Ende WENN stehen in der Formatvorlage „WENN DANN“, Initialisierung über „Lese … und '
 'speichere als <…>“, Zuweisung über „=“, Vergleich über „<>“. Business Exceptions werden über zwei Variablen '
 'gemeldet: <BE> klassifiziert die BE als „hart“ oder „weich“, <BE-Flag> trägt bei einer harten BE den Grund. Eine '
 'harte BE beendet die Prüfung sofort und verzweigt in das zentrale BE-Handling; sie kann in der Vorprüfung und in '
 'jedem späteren Schritt auftreten. Eine weiche BE wird mit „Merke Prüfnotiz …“ in <Prüfnotizen> gesammelt, die '
 'Verarbeitung läuft weiter. Wie mit beiden Arten umgegangen wird, steht nur im Kapitel „BE-Handling“ und wird in '
 'den einzelnen Schritten nicht wiederholt.')
protokoll.append('Legende: <BE> hart/weich, <BE-Flag>, <Prüfnotizen>, zentrales BE-Handling')

# ============================================================ 2. Start
p = finde('<Vorgang-Lfd-Nr> ist der Ordnungsbegriff dieses Prozesses.')
nach(p, hinweis('Offener Punkt: Der Prüf-Bot liest aus einem eigenen Themenpostkorb, in dem Celonis die Vorgänge '
                'eröffnet. Dieser Themenpostkorb ist zu beantragen (bisher über D. Amend); Name und Zuständigkeit sind '
                'nachzutragen. Robotics entwickelt und testet ausschließlich auf der Abnahmeumgebung: Datenpool, '
                'Themenpostkorb, Testfälle und ein Bot-User mit allen Rechten müssen dort bereitstehen. Ob ein '
                'gemeinsamer Themenpostkorb für beide Prüf-Bots (KV und Komposit/Leben) oder je Bot ein eigener '
                'eingerichtet wird, ist zu entscheiden.'),
        hinweis('Offener Punkt: Zuschnitt und Anzahl der zusätzlichen Datenpool-Felder zur Prüfung und Anforderung '
                'der Unterlagen (Anforderung D. Amend) werden bis Ende der Woche mit Celonis festgelegt. Diese Felder '
                'sind auch für die Bestückung der 72-Stunden-Notiz zu verwenden.'))
p_flag = finde('<BE-Flag> = leer')
p_dat = p_flag.getprevious(); assert ptext(p_dat) == '<Eingangsdatum-BUE> = <BUE_MV_EINGANGSDATUM>', ptext(p_dat)
p_fmt = p_flag.getnext(); assert ptext(p_fmt) == 'Format: tt.mm.jjjj.', ptext(p_fmt)
settext(p_dat, 'Lese <BUE_MV_EINGANGSDATUM> aus und speichere als <Eingangsdatum-BUE> (Format tt.mm.jjjj). Ist das Feld '
               'leer, wird das Eröffnungsdatum des Postkorbvorgangs verwendet.')
loesche(p_fmt, anker_ziel=p_dat)
settext(p_flag, '<BE> = leer')
p_flag.addprevious(plain('Die Variablen für das BE-Handling werden zu Beginn jedes Vorgangs zurückgesetzt:'))
nach(p_flag, plain('<BE-Klassifikation> = leer'), plain('<Prüfnotizen> = leer'))
protokoll.append('Start: Themenpostkorb/Abnahmeumgebung als offener Punkt, <BE> und <Prüfnotizen> initialisiert')

# ============================================================ 3. Harte BE: Vorpruefung + VNR
def hart_machen(flag_para):
    """Vor <BE-Flag> = ... eine Zeile <BE> = „hart“, danach Sprung ins BE-Handling."""
    flag_para.addprevious(be('<BE> = „hart“'))
    folge = flag_para.getnext()
    assert ptext(folge) == 'Aussteuerung und Verarbeitung beenden', ptext(folge)
    if hat_anker(folge):
        settext(folge, 'Weiter zum Kapitel „BE-Handling“')
        # Zeichenformat BE entfernen, Link setzen
        r = [r for r in folge.findall(W + 'r') if r.find(W + 't') is not None][0]
        if r.find(W + 'rPr') is not None: r.remove(r.find(W + 'rPr'))
        verlinke(folge, ANK_BE)
    else:
        neu = link_be(); folge.getparent().replace(folge, neu)

for txt in ('<BE-Flag> = „Kein BÜ-Vorgang“', '<BE-Flag> = „BÜ-Wunsch nicht vorhanden“',
            '<BE-Flag> = „Erinnerung / Reminder“', '<BE-Flag> = „Unterlagen nicht vollständig“',
            '<BE-Flag> = „VNR nicht korrekt / nicht vorhanden“'):
    hart_machen(finde(txt))

# Sprung in die Stammdatenpruefung verlinken (Kommentar 61)
verlinke(finde('Weiter zu „I. VN – Stammdaten + VNR“'), ANK_VN)

# Erlaeuterungszeile der Vorpruefung (Kommentar 62 „was meint das?“)
p = finde('Prüfnotiz: entspricht dem jeweils gesetzten <BE-Flag>.')
settext(p, 'Alle vier Ausschlusskriterien sind harte BE: <BE> = „hart“, <BE-Flag> trägt den Grund, und der Vorgang '
           'geht ohne weitere Prüfung in das BE-Handling.')

# VNR: Pruefnotiz-Zeile (Anker Kommentar 67) uebernimmt die Erlaeuterung, Doppelung entfaellt
p = finde('Prüfnotiz: VNR nicht korrekt / nicht vorhanden.')
erl = p.getnext()
assert ptext(erl).startswith('Das Feld „Vertragsbeginn“'), ptext(erl)
settext(p, ptext(erl)); loesche(erl)
# Hinweis auf BUE_VNR (Kommentar 65)
settext(finde('Lese <BUE_VNR> aus.'),
        '<BUE_VNR> liegt aus dem Datenpool vor (Schritt „Eröffnung Postkorbvorgang und Daten im Datenpool“).')
# Sparte (Kommentare 68/69)
settext(finde('<VA230-Sparte> und <VA230-Status> werden für die Weiterleitung an den zuständigen BÜ-Bot benötigt.'),
        '<VA230-Sparte> und <VA230-Status> werden nachrichtlich mitgeführt. Die Sparte entscheidet nicht im Bot: '
        'Die Notizvorlage ist durch den Postkorb festgelegt (KV: BOT2011, Komposit/Leben: BOT1515), <BUE_SPARTE> '
        'dient dem Abgleich.')
protokoll.append('Harte BE in Vorprüfung und VNR-Prüfung: <BE> = „hart“, Sprung ins BE-Handling')

# ============================================================ 4. Weiche BE: Merke -> <BE> = weich + Merke Pruefnotiz
WEICH = [
 ('Merke „Nachname abweichend“', 'Nachname abweichend', ''),
 ('Merke „Vorname abweichend“ (Datenpool <BUE_KUNDE_VORNAME> gegen <IS100-Vorname>)', 'Vorname abweichend',
  ' (Datenpool <BUE_KUNDE_VORNAME> gegen <IS100-Vorname>)'),
 ('Merke „Geb.-Datum abweichend“ (Datenpool <BUE_KUNDE_GEBDAT> gegen <IS100-Gebdat>)', 'Geb.-Datum abweichend',
  ' (Datenpool <BUE_KUNDE_GEBDAT> gegen <IS100-Gebdat>)'),
 ('Merke „Straße abweichend“ (Datenpool <BUE_KUNDE_STRASSE> gegen <IS100-Strasse>)', 'Straße abweichend',
  ' (Datenpool <BUE_KUNDE_STRASSE> gegen <IS100-Strasse>)'),
 ('Merke „PLZ abweichend“ (Datenpool <BUE_KUNDE_PLZ> gegen <IS100-PLZ>)', 'PLZ abweichend',
  ' (Datenpool <BUE_KUNDE_PLZ> gegen <IS100-PLZ>)'),
 ('Merke „Name übernehmender Makler abweichend“', 'Name übernehmender Makler abweichend', ''),
 ('Merke „Vermittlernummer / PNR abweichend“', 'Vermittlernummer / PNR abweichend', ''),   # OB726-PNR leer
 ('Merke „Absender ist eine interne ERGO-Adresse“', 'Absender ist eine interne ERGO-Adresse', ''),
 ('Merke „Stammagentur nicht ermittelbar“', 'Stammagentur nicht ermittelbar', ''),
 ('Merke „Anbindung Bestandsinhaber nicht aktiv“', 'Anbindung Bestandsinhaber nicht aktiv', ''),
]
n_weich = 0
for alt, notiz, suffix in WEICH:
    treffer = [p for p in alle() if ptext(p) == alt]
    for p in treffer:
        settext(p, '<BE> = „weich“')
        nach(p, plain(f'Merke Prüfnotiz „{notiz}“'))
        n_weich += 1
# doppelte Pruefnotiz-Zeilen unter den Bloecken entfernen
for txt in ('Prüfnotiz: Nachname abweichend.', 'Prüfnotiz: Vorname abweichend.', 'Prüfnotiz: Geb.-Datum abweichend.',
            'Prüfnotiz: Straße abweichend.', 'Prüfnotiz: PLZ abweichend.',
            'Prüfnotiz: Name übernehmender Makler abweichend.', 'Prüfnotiz: Vermittlernummer / PNR abweichend.'):
    for p in [p for p in alle() if ptext(p) == txt]:
        loesche(p)
protokoll.append(f'Weiche BE: {n_weich} Merke-Zeilen in <BE> = „weich“ + Merke Prüfnotiz umgestellt, Doppelzeilen entfernt')

# ============================================================ 5. Harte BE mitten im Prozess
def hart_aus_merke(alt, flag, notizzeile=None):
    """Merke-Zeile wird zu <BE> = „hart“ / <BE-Flag> = … / Sprung ins BE-Handling."""
    for p in [p for p in alle() if ptext(p) == alt]:
        settext(p, '<BE> = „hart“')
        r = [r for r in p.findall(W + 'r') if r.find(W + 't') is not None][0]
        if r.find(W + 'rPr') is None:
            rpr = etree.Element(W + 'rPr'); rs = etree.SubElement(rpr, W + 'rStyle'); rs.set(W + 'val', RS_BE)
            r.insert(0, rpr)
        weiter = p.getnext()
        assert ptext(weiter) == 'Weiter', ptext(weiter)
        nach(p, plain(f'<BE-Flag> = „{flag}“'))
        if hat_anker(weiter):
            settext(weiter, 'Weiter zum Kapitel „BE-Handling“'); verlinke(weiter, ANK_BE)
        else:
            weiter.getparent().replace(weiter, link_be())
    if notizzeile:
        for p in [p for p in alle() if ptext(p) == notizzeile]:
            loesche(p)

hart_aus_merke('Merke „Agenturnummer abweichend“', 'Agenturnummer nicht vorhanden', 'Prüfnotiz: Agenturnummer abweichend.')
hart_aus_merke('Merke „Keine Zusammenarbeit“', 'Keine Zusammenarbeit')
# Vermittler zu <BUE_VERMITTLER_NR> nicht vorhanden -> hart (die zweite Merke-PNR-Zeile, nach dem Umbau die verbliebene)
p_vnr = finde('Vermittler zu <BUE_VERMITTLER_NR> nicht vorhanden')
p_dann = p_vnr.getnext(); assert ptext(p_dann) == 'DANN'
p_merke = p_dann.getnext()
assert ptext(p_merke) == '<BE> = „weich“', ptext(p_merke)
p_notiz = p_merke.getnext(); assert ptext(p_notiz).startswith('Merke Prüfnotiz „Vermittlernummer'), ptext(p_notiz)
p_weiter = p_notiz.getnext(); assert ptext(p_weiter) == 'Weiter'
settext(p_merke, '<BE> = „hart“')
r = [r for r in p_merke.findall(W + 'r') if r.find(W + 't') is not None][0]
rpr = etree.Element(W + 'rPr'); rs = etree.SubElement(rpr, W + 'rStyle'); rs.set(W + 'val', RS_BE); r.insert(0, rpr)
settext(p_notiz, '<BE-Flag> = „Vermittlernummer / PNR nicht vorhanden“')
p_weiter.getparent().replace(p_weiter, link_be())
protokoll.append('Harte BE mitten im Prozess: Agentur nicht vorhanden, Vermittler nicht vorhanden, Keine Zusammenarbeit')

# ============================================================ 6. Vertriebskanal nur noch nachrichtlich
p = finde('<Vorgangstyp-BUE> = „Makler zu Makler“')
ende = p.getnext(); assert ptext(ende) == 'Ende WENN'
nach(ende, hinweis('In der ersten Ausbaustufe steuert <Vorgangstyp-BUE> keine Weiterleitung mehr: Alle Vorgänge '
                   'ohne BE gehen an den 72-Stunden-BOT. Der Vorgangstyp wird für das Reporting mitgeführt.'),
     link_be())
p = next(p for p in alle() if ptext(p).startswith('Offener Punkt: Die Kriterien zur Ermittlung des Vertriebskanals'))
settext(p, ptext(p) + ' Der Vorgangstyp ist über die Vertriebskanäle (AO, Makler, unbesetzte Agentur) zu bestimmen; '
                      'die Ableitung für die AO ist von HSB4K zu liefern (Hinweis I. Lorusso, 03.09.2026).')

# ============================================================ 7. Zentrales BE-Handling
settext(finde('BE überprüfen und priorisieren'), 'BE-Handling')
settext(finde('Ablehnungsgründe auswerten und priorisieren'), 'Umgang mit Business Exceptions (zentral)')
start = next(p for p in alle() if ptext(p).startswith('An dieser Stelle sind alle Prüfungen durchlaufen.'))
offen_su = next(p for p in alle() if ptext(p).startswith('Offener Punkt: Umgang mit Rahmenverträgen (SU)'))
text_su = ptext(offen_su).split(' Es ist zu definieren')[0]
# Das Kapitel liegt in einer Tabelle mit drei Zeilen. Zeile 1 (Zelle von start) wird
# neu befuellt, die Zeilen 2 und 3 mit der alten Bewertungslogik entfallen komplett.
p = start.getnext()
while p is not None:
    n = p.getnext()
    if p.tag == W + 'p': loesche(p)
    p = n
def zeile_von(p):
    while p is not None and p.tag != W + 'tr': p = p.getparent()
    return p
for marker in ('es wurde mehr als ein Grund gemerkt',
               'Es wurde genau ein Grund gemerkt. Setze <BE-Flag> auf diesen Grund und bestimme die Reaktion:'):
    tr = zeile_von(finde(marker))
    assert not any(hat_anker(q) for q in tr.iter(W + 'p')), 'Kommentaranker in zu loeschender Zeile'
    tr.getparent().remove(tr)
settext(start,
 'Alle Prüfschritte melden Business Exceptions über zwei Variablen: <BE> klassifiziert die BE als „hart“ oder '
 '„weich“, <BE-Flag> trägt bei einer harten BE den Grund. Harte BE verzweigen sofort hierher; weiche BE laufen '
 'weiter durch alle Prüfungen und sammeln ihre Prüfnotizen in <Prüfnotizen>. Der Umgang damit ist nur hier '
 'beschrieben und wird in den einzelnen Schritten nicht wiederholt.')
p = nach(start,
 hinweis('Erste Ausbaustufe: Harte und weiche BE gehen an denselben Themenpostkorb „MV“ (HSB4K) zur manuellen '
         'Bearbeitung; sie unterscheiden sich nur im Inhalt der Bearbeitungsnotiz (Kriterium für Ablehnung bzw. '
         'Liste der nachzuprüfenden Punkte). Im Zielpostkorb muss erkennbar sein, dass der Vorgang vom Prüf-Bot '
         'bearbeitet wurde; dort liegen nur Vorgänge mit BE, Vorgänge ohne BE laufen in der Dunkelverarbeitung. Der '
         'Ablehnungs-BOT (BOT2013) und die Reaktionen je Ablehnungsgrund sind für eine spätere Ausbaustufe vorgesehen.'),
 key('WENN'),
 plain('<BE> = „hart“'),
 key('DANN'),
 plain('Bearbeitungsnotiz = „Kriterium für Ablehnung: “ + <BE-Flag>'),
 plain('Bereits gesammelte <Prüfnotizen> zusätzlich anhängen, jede Prüfnotiz in einer eigenen Zeile'),
 plain('Bearbeitungsnotiz am Postkorbvorgang hinterlegen'),
 plain('<BE> und <BE-Flag> in das Reporting übernehmen'),
 plain('Vorgang an den Themenpostkorb „MV“ (HSB4K) weiterleiten'),
 be('Verarbeitung dieses Vorgangs beenden, weiter mit dem nächsten Vorgang'),
 key('SONST WENN'),
 plain('<Prüfnotizen> <> leer'),
 key('DANN'),
 plain('Bearbeitungsnotiz = „Nachprüfung erforderlich, abweichende Prüfungen: “ + <Prüfnotizen>, jede Prüfnotiz '
       'in einer eigenen Zeile'),
 plain('Bearbeitungsnotiz am Postkorbvorgang hinterlegen'),
 plain('<BE> und <Prüfnotizen> in das Reporting übernehmen'),
 plain('Vorgang an den Themenpostkorb „MV“ (HSB4K) weiterleiten'),
 be('Verarbeitung dieses Vorgangs beenden, weiter mit dem nächsten Vorgang'),
 key('SONST'),
 verlinke(plain('Weiter zum Kapitel „Weiterleitung an den BÜ-Bot“'), ANK_WEITER),
 key('Ende WENN'),
 hinweis('Mögliche Werte von <BE-Flag> (harte BE):'),
 liste('Kein BÜ-Vorgang'), liste('BÜ-Wunsch nicht vorhanden'), liste('Erinnerung / Reminder'),
 liste('Unterlagen nicht vollständig'), liste('VNR nicht korrekt / nicht vorhanden'),
 liste('Agenturnummer nicht vorhanden'), liste('Vermittlernummer / PNR nicht vorhanden'),
 liste('Keine Zusammenarbeit'),
 hinweis('Mögliche Prüfnotizen (weiche BE):'),
 liste('Nachname abweichend'), liste('Vorname abweichend'), liste('Geb.-Datum abweichend'),
 liste('Straße abweichend'), liste('PLZ abweichend'), liste('Name übernehmender Makler abweichend'),
 liste('Absender ist eine interne ERGO-Adresse'),
 liste('Stammagentur nicht ermittelbar'), liste('Anbindung Bestandsinhaber nicht aktiv'),
 hinweis('Offener Punkt: Der Name des Themenpostkorbs für die BE-Weiterleitung ist zu bestätigen (Arbeitstitel „HSB4K MV“).'),
 hinweis('Offener Punkt: Der Wortlaut der Bearbeitungsnotiz („Kriterium für Ablehnung“, „Nachprüfung erforderlich“) '
         'ist vom Fachbereich HSB4K festzulegen. Er muss für die Sachbearbeitung verständlich sein; „hartes Kriterium“ '
         'genügt nicht (Hinweis U. Gerhards, 03.09.2026).'),
 hinweis('Offener Punkt: Die Notizform für die Bearbeitungsnotiz im BE-Fall (Bearbeitungshinweis oder '
         'neue Vorlage, ausreichende Feldgröße für mehrere Prüfnotizen) ist mit Herrn Tegge zu klären; den Inhalt '
         'legt der Fachbereich vorab fest.'),
 hinweis('Offener Punkt: Die Einstufung hart/weich ist je Prüfschritt fachlich zu bestätigen. Hart sind derzeit die '
         'Vorprüfung, die VNR-Prüfung, nicht auffindbare Agentur- bzw. Vermittlernummer und „Keine Zusammenarbeit“; '
         'alle übrigen Prüfungen sind weich. Die im Termin als hart benannten Kriterien „Maklervollmacht nicht '
         'vorhanden“ und „VN passt nicht zur Maklervollmacht“ sind bislang kein eigener Prüfschritt (die '
         'Maklervollmacht wird nur über <BUE_PRUEFUNG_UNTERLAGEN> geprüft); ob ein Abgleich VN gegen Maklervollmacht '
         'ergänzt wird, ist mit HSB4K zu klären.'),
 hinweis(text_su),
 hinweis('Ausbaustufe 2: Harte BE mit Ablehnungsgrund an den Ablehnungs-BOT (BOT2013). „VN passt nicht zu '
         'Maklervollmacht“, „Historischer Vertrag / Storno“, „Keine Zusammenarbeit“ und „Maklervollmacht nicht '
         'vorhanden“ ergeben eine direkte Ablehnungsinformation an den übernehmenden Vermittler, „Übertragung bereits '
         'erfolgt“ eine Information an den übernehmenden Makler, „Courtagefortzahler“ eine Weiterleitung zur manuellen '
         'Bearbeitung.'))
protokoll.append('BE-Handling zentral: hart und weich, Ausbaustufe 1 beide an Themenpostkorb MV, Wertelisten')

# ============================================================ 8. Weiterleitung: immer 72-Stunden-BOT
p_w = finde('<Vorgangstyp-BUE> = „Makler zu Makler“', nr=1)     # die WENN-Bedingung im Kapitel Weiterleitung
wenn = p_w.getprevious(); assert ptext(wenn) == 'WENN'
block = []
p = wenn
while ptext(p) != 'Ende WENN':
    block.append(p); p = p.getnext()
block.append(p)                       # Ende WENN
sprung = p.getnext(); assert ptext(sprung).startswith('Weiter zum fachlichen Kontext „Notizbestückung'), ptext(sprung)
erl = sprung.getnext(); assert ptext(erl).startswith('Die Notiz wird in beiden Fällen'), ptext(erl)
# Absatz mit Kommentaranker (83) bleibt und traegt den neuen Text
traeger = next((q for q in block if hat_anker(q)), None)
neu_text = ('Es wurde keine BE festgestellt. Der Vorgang wird nach der Notizbestückung immer an den 72-Stunden-BOT '
            'übergeben, unabhängig von <Vorgangstyp-BUE>. Der 72-Stunden-BOT prüft selbst, ob der abgebende '
            'Bestandsinhaber der AO zugeordnet ist; andernfalls gibt er keine 72-Stunden-Information aus und der '
            'Vorgang läuft regulär weiter.')
if traeger is not None:
    settext(traeger, neu_text)
    ppr = traeger.find(W + 'pPr')
    if ppr is not None and ppr.find(W + 'pStyle') is not None: ppr.remove(ppr.find(W + 'pStyle'))
    for q in block:
        if q is not traeger: loesche(q, anker_ziel=traeger)
else:
    wenn.addprevious(plain(neu_text))
    for q in block: loesche(q)
verlinke(sprung, ANK_NOTIZ)
settext(erl, 'Offener Punkt: Diese Annahme ist vorab mit manuell aufgegebenen Notizen zu verproben (HSB4K), bevor '
             'der Bot darauf aufsetzt.')
_p = finde('Es wurde kein Grund gemerkt. Der Vorgang wird an <Zielbot> übergeben.')
loesche(_p, anker_ziel=_p.getnext())
settext(finde('Offener Punkt: Für Vorgänge mit <Zielbot> = „72-Stunden-BOT“ ist zu bestätigen, ob dieselbe Notizvorlage verwendet wird.'),
        'Für den Positivweg wird die Notizvorlage „BÜ auf Makler Robotics“ (BOT2011) unverändert genutzt; nach derzeitigem Stand ist keine Anpassung erforderlich.')
settext(finde('Vorgang mit der bestückten Notiz an <Zielbot> weiterleiten.'),
        'Vorgang mit der bestückten Notiz an den 72-Stunden-BOT weiterleiten.')
protokoll.append('Weiterleitung: Positivfall immer an den 72-Stunden-BOT, <Zielbot> entfällt')

# ============================================================ 9. Untervollmacht: nur noch BUE_UV_ERTEILT
p = finde('<BUE_UV_FEHLT> = „ja“')
settext(p, '<BUE_POOL> <> leer')
nach(p, plain('UND <BUE_UV_ERTEILT> = „nein“'))
sw = next(p for p in alle() if ptext(p) == 'SONST WENN' and ptext(p.getnext()) == '<BUE_UV_ERTEILT> = „ja“')
ppr = sw.find(W + 'pPr')
if ppr is None:
    ppr = etree.Element(W + 'pPr'); sw.insert(0, ppr)
if ppr.find(W + 'pStyle') is None:
    ps = etree.SubElement(ppr, W + 'pStyle'); ps.set(W + 'val', STIL_KEY)
p = finde('Feld „Bearbeitung nach“ = „mit BÜ“')
ende = p.getnext(); assert ptext(ende) == 'Ende WENN'
nach(ende, hinweis('Offener Punkt: Seit der Entscheidung vom 02.09.2026 gibt es nur noch <BUE_UV_ERTEILT> (ja/nein); '
                   '<BUE_UV_FEHLT> entfällt. „UV fehlt“ wird hier aus „Pool beteiligt“ und <BUE_UV_ERTEILT> = „nein“ '
                   'abgeleitet. Fachlich zu bestätigen.'))
protokoll.append('Untervollmacht: <BUE_UV_FEHLT> entfernt, Ableitung über <BUE_POOL> und <BUE_UV_ERTEILT>')

# ============================================================ 10. Variablentabelle
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

for name in ('Zielbot', 'BUE_UV_FEHLT'):
    z = zeile(name); z.getparent().remove(z)
setze_zeile(zeile('BUE_UV_ERTEILT'), [None,
    'Untervollmacht erteilt: liegt vor, Unterbevollmächtigter namentlich benannt, Übertragung erkennbar an ihn',
    'Datenpool, Feld „Untervollmacht erteilt“', 'Pflichtfeld',
    'Feld_Format JN. Ausprägungen: ja, nein (Entscheidung Maklerservice vom 02.09.2026, ersetzt die frühere '
    'Aufteilung in „erteilt“ und „fehlt“). Steuert die Ausprägung „Bearbeitung nach“ in der Notiz.'])
bl = zeile('BE-Liste')
setze_zeile(bl, ['Prüfnotizen', 'Liste aller gemerkten Prüfnotizen (weiche BE) des Vorgangs',
    'Abgeleitet, jede Prüfung mit „Merke Prüfnotiz …“', 'Pflichtfeld',
    'Bei Start leer. Jede weiche BE hängt ihre Prüfnotiz an. Wird im BE-Handling in die Bearbeitungsnotiz '
    'übernommen, jede Prüfnotiz in einer eigenen Zeile. Werteliste siehe Kapitel „BE-Handling“.'])
bl.addprevious(neue_zeile(bl, ['BE', 'Klassifizierung der Business Exception',
    'Abgeleitet, in jedem Prüfschritt gesetzt', 'Pflichtfeld',
    'Bei Start leer. Ausprägungen: hart (sofortiger Ausstieg in das BE-Handling), weich (Verarbeitung läuft '
    'weiter, Prüfnotiz wird gesammelt). Steuert das zentrale BE-Handling.']))
bl.addprevious(neue_zeile(bl, ['BE-Flag', 'Grund einer harten Business Exception',
    'Abgeleitet, Vorprüfung und harte Prüfschritte', 'Pflichtfeld bei <BE> = „hart“',
    'Bei Start leer. Wird in die Bearbeitungsnotiz übernommen. Werteliste siehe Kapitel „BE-Handling“.']))
setze_zeile(zeile('Reaktion'), [None, None, 'Ausbaustufe 2, Kapitel „BE-Handling“', 'optional',
    'In der ersten Ausbaustufe nicht genutzt: alle BE gehen an den Themenpostkorb MV. Vorgesehen für die '
    'Anbindung des Ablehnungs-BOT (BOT2013).'])
setze_zeile(zeile('Vorgangstyp-BUE'), [None, None, None, None,
    'Ausprägungen: Makler zu Makler, AO zu Makler. In der ersten Ausbaustufe nur für das Reporting; die '
    'Weiterleitung geht immer an den 72-Stunden-BOT.'])
setze_zeile(zeile('IS100-Nachname'), [None, None, None, None, 'Abgleich gegen BUE_KUNDE_NACHNAME, weiches Kriterium.'])
protokoll.append('Variablentabelle: BE, BE-Flag, Prüfnotizen neu; Zielbot und BUE_UV_FEHLT entfernt; UV_ERTEILT, Reaktion, Vorgangstyp angepasst')

# Reste der alten Begriffe in Bemerkungen und im Reporting-Tag
for t in doc.iter(W + 't'):
    if not t.text: continue
    if 'wird „Keine Zusammenarbeit“ in die BE-Liste eingetragen' in t.text:
        t.text = t.text.replace('wird „Keine Zusammenarbeit“ in die BE-Liste eingetragen',
                                'wird <BE> = „hart“ mit <BE-Flag> „Keine Zusammenarbeit“ gesetzt')
    if 'Bei „inaktiv“ Eintrag „Keine Zusammenarbeit“ in die BE-Liste.' in t.text:
        t.text = t.text.replace('Bei „inaktiv“ Eintrag „Keine Zusammenarbeit“ in die BE-Liste.',
                                'Bei „inaktiv“ harte BE mit <BE-Flag> „Keine Zusammenarbeit“.')
    if t.text.strip() == 'Tag „Zielbot“: BOT2011 oder 72-Stunden-BOT':
        t.text = 'Tag „Zielbot“: 72-Stunden-BOT (erste Ausbaustufe: alle Vorgänge ohne BE)'
protokoll.append('Restbegriffe BE-Liste/Zielbot in Bemerkungen und Reporting-Tag bereinigt')

# ============================================================ 12. Nacharbeiten aus der Agentenpruefung und Rueckmeldung E. Brenneisen
def ersetze_ueberall(alt, neu):
    """Textersatz in allen Absaetzen; erst je Textlauf, sonst Absatzweise."""
    n = 0
    for t in doc.iter(W + 't'):
        if t.text and alt in t.text:
            t.text = t.text.replace(alt, neu); n += 1
    for p in alle():
        if alt in ptext(p):
            settext(p, ptext(p).replace(alt, neu)); n += 1
    return n

# C1: Variante A (Agenturnummer) endet ohne Sprung und liefe in Variante B (dort harte BE „PNR nicht vorhanden“)
ANK_STAMM = bookmark_von('Agentur-Nr. (A,…) des Bestandsinhabers ermitteln')
p = next(p for p in alle() if ptext(p).startswith('Offener Punkt: Für fünf TOP-Makler'))
nach(p, verlinke(plain('Weiter zum fachlichen Kontext „Agentur-Nr. (A,…) des Bestandsinhabers ermitteln“'), ANK_STAMM))

# C2: Variante B – INAKTIV ist wie in Variante A eine harte BE, nicht Teil der weichen Namenspruefung
p_oder = finde('ODER <OB726-Name> enthält „INAKTIV“')
q = p_oder
while ptext(q) != 'Ende WENN': q = q.getnext()
loesche(p_oder, anker_ziel=p_oder.getprevious())
nach(q, key('WENN'), plain('<OB726-Name> enthält „INAKTIV“'), key('DANN'), be('<BE> = „hart“'),
     plain('<BE-Flag> = „Keine Zusammenarbeit“'), link_be(), key('SONST'), plain('Weiter'), key('Ende WENN'))

# C9: Variante A – leere PNR ist hart (GH040 kann sonst nicht geoeffnet werden)
p_c = finde('<OB726-PNR> = leer')
p_d = p_c.getnext(); assert ptext(p_d) == 'DANN'
p_b = p_d.getnext(); assert ptext(p_b) == '<BE> = „weich“', ptext(p_b)
p_n = p_b.getnext(); assert ptext(p_n) == 'Merke Prüfnotiz „Vermittlernummer / PNR abweichend“', ptext(p_n)
p_w = p_n.getnext(); assert ptext(p_w) == 'Weiter'
settext(p_b, '<BE> = „hart“')
r = [r for r in p_b.findall(W + 'r') if r.find(W + 't') is not None][0]
if r.find(W + 'rPr') is None:
    rpr = etree.Element(W + 'rPr'); rs = etree.SubElement(rpr, W + 'rStyle'); rs.set(W + 'val', RS_BE); r.insert(0, rpr)
settext(p_n, '<BE-Flag> = „Vermittlernummer / PNR nicht vorhanden“')
if hat_anker(p_w):
    settext(p_w, 'Weiter zum Kapitel „BE-Handling“'); verlinke(p_w, ANK_BE)
else:
    p_w.getparent().replace(p_w, link_be())
assert not [p for p in alle() if 'PNR abweichend' in ptext(p)], 'PNR abweichend noch vorhanden'

# B5: Vorpruefung – zwei der vier Kriterien am 03.09. bestaetigt
settext(finde('Vorprüfung – Ausschlusskriterien (Vorschlag, nicht abgestimmt)'), 'Vorprüfung – Ausschlusskriterien')
settext(finde('Vorschlag, im Prozessblatt nicht enthalten. Es bleibt fachlich zu bestätigen, ob der Prüf-Bot diese vorgelagerten Ausschlusskriterien prüft.'),
        'Die Ausschlusskriterien „Kein BÜ-Vorgang“ und „BÜ-Wunsch nicht vorhanden“ sind mit HSB4K und Robotics am '
        '03.09.2026 als harte BE bestätigt. „Erinnerung / Reminder“ und „Unterlagen nicht vollständig“ sind fachlich '
        'noch zu bestätigen.')

# C20 / 1.1: Begriff Aussteuerung -> BE
n_aus = 0
n_aus += ersetze_ueberall('der Vorgang wird deshalb sofort ausgesteuert und nicht nur gemerkt',
                          'der Vorgang endet deshalb mit einer harten BE und wird nicht nur gemerkt')
n_aus += ersetze_ueberall('Bei „ja“ wird der Vorgang nicht ausgesteuert;', 'Bei „ja“ entsteht keine BE;')
n_aus += ersetze_ueberall('wird der Vorgang nicht ausgesteuert. Die fehlenden', 'entsteht keine BE. Die fehlenden')
# C7: Sparte steuert keine Weiterleitung mehr
n_aus += ersetze_ueberall('Für die Weiterleitung ist Sparte-Vertrag aus VA230 maßgeblich.',
                          'Wird nachrichtlich mitgeführt; die Sparte ist durch den Postkorb des KV-Prüf-Bots vorgegeben.')
n_aus += ersetze_ueberall('Steuert die Trennung der Sparte und damit die Weiterleitung an BOT2011 oder BOT1515.',
                          'Wird nachrichtlich mitgeführt; die Notizvorlage (KV: BOT2011) ist durch den Postkorb des KV-Prüf-Bots vorgegeben.')
protokoll.append(f'Nacharbeiten: Sprung nach Variante A, INAKTIV in Variante B hart, PNR leer hart, Vorprüfung bestätigt, {n_aus} Begriffsstellen')

# Rueckmeldung E. Brenneisen 03.09.: <BE> = „Hart“/„Weich“, Grund in <BE-Klassifikation> (statt <BE-Flag>)
BE_HART, BE_WEICH = 'Hart', 'Weich'
setze_zeile(zeile('BE-Flag'), ['BE-Klassifikation', 'Grund der Business Exception (Klartext)', None, None,
    'Bei Start leer. Wird bei einer harten BE gesetzt und in die Bearbeitungsnotiz übernommen; bei weichen BE steht '
    'der Grund als Prüfnotiz in <Prüfnotizen>. Werteliste siehe Kapitel „BE-Handling“.'])
n1 = ersetze_ueberall('<BE-Flag>', '<BE-Klassifikation>')
n2 = ersetze_ueberall('„hart“', '„' + BE_HART + '“') + ersetze_ueberall('„weich“', '„' + BE_WEICH + '“')
rest = [ptext(p)[:60] for p in alle() if 'BE-Flag' in ptext(p)]
assert not rest, rest
# Inhaltsverzeichnis: Eintraege der umbenannten Kapitel nachziehen
n_toc = ersetze_ueberall('BE überprüfen und priorisieren', 'BE-Handling')
n_toc += ersetze_ueberall('Ablehnungsgründe auswerten und priorisieren', 'Umgang mit Business Exceptions (zentral)')
n_toc += ersetze_ueberall('Vorprüfung – Ausschlusskriterien (Vorschlag, nicht abgestimmt)', 'Vorprüfung – Ausschlusskriterien')
protokoll.append(f'Inhaltsverzeichnis: {n_toc} Einträge nachgezogen')
protokoll.append(f'Variablen umbenannt: <BE-Flag> -> <BE-Klassifikation> ({n1} Stellen), Werte {BE_HART}/{BE_WEICH} ({n2} Stellen)')


# ============================================================ 13. Bereinigung: Freitext, Hinweise und offene Punkte in Prozessbeschreibung (aktuelle Annahmen)
def neutral(p, text):
    """Absatz auf schlichten Prozesstext setzen (Anker bleiben, Hervorhebung entfaellt)."""
    settext(p, text)
    for r in p.findall(W + 'r'):
        rpr = r.find(W + 'rPr')
        if rpr is not None:
            for rs in rpr.findall(W + 'rStyle'):
                if rs.get(W + 'val') in (RS_HINW, 'Hyperlink'):
                    rpr.remove(rs)
    return p

def entferne(p):
    ziel = p.getprevious()
    while ziel is not None and ziel.tag != W + 'p': ziel = ziel.getprevious()
    if ziel is None:
        ziel = p.getnext()
        while ziel.tag != W + 'p': ziel = ziel.getnext()
    loesche(p, anker_ziel=ziel)

def start(prefix):
    return next(p for p in alle() if ptext(p).startswith(prefix))

UMFORMULIEREN = [
 # Front / Tabelle
 ('Bearbeitung ausschließlich der ausgesteuerten Vorgänge (Business Exceptions) im Themenpostkorb',
  'Bearbeitung der Vorgänge mit Business Exception im Themenpostkorb „HSB4K MV“ auf Basis der Bearbeitungsnotiz des Prüf-Bots.'),
 ('Offener Punkt: Es ist zu bestätigen, wie eine erneute Zuweisung desselben Postkorbvorgangs',
  'Ein bereits bearbeiteter Postkorbvorgang (gleiche <Vorgang-Lfd-Nr>) wird nicht erneut verarbeitet.'),
 ('Feld_Format JN. Ausprägungen: ja, nein (Entscheidung Maklerservice vom 02.09.2026',
  'Feld_Format JN. Ausprägungen: ja, nein. Steuert die Ausprägung „Bearbeitung nach“ in der Notiz.'),
 ('Ausprägungen: Makler zu Makler, AO zu Makler. In der ersten Ausbaustufe',
  'Ausprägungen: Makler zu Makler, AO zu Makler. Wird für das Reporting mitgeführt; die Weiterleitung erfolgt unabhängig davon an den 72-Stunden-BOT.'),
 ('Bei Start leer. Ausprägungen: hart (sofortiger Ausstieg',
  'Bei Start leer. Ausprägungen: Hart (sofortiger Ausstieg in das BE-Handling), Weich (Verarbeitung läuft weiter, Prüfnotiz wird gesammelt). Steuert das zentrale BE-Handling.'),
 # Start
 ('Offener Punkt: Der Prüf-Bot liest aus einem eigenen Themenpostkorb',
  'Der Prüf-Bot arbeitet den Themenpostkorb des Prüf-Bots Gesundheit ab. Celonis eröffnet dort je Eingang einen Postkorbvorgang und legt den zugehörigen Datensatz im Datenpool an.'),
 # Vorpruefung
 ('Die Ausschlusskriterien „Kein BÜ-Vorgang“ und „BÜ-Wunsch nicht vorhanden“ sind mit HSB4K',
  'Vor den fachlichen Prüfungen wird anhand der Datenpool-Felder festgestellt, ob ein zu prüfender BÜ-Vorgang vorliegt. Jedes der vier Ausschlusskriterien ist eine harte BE.'),
 ('Alle vier Ausschlusskriterien sind harte BE:',
  'Bei jedem Ausschlusskriterium geht der Vorgang ohne weitere Prüfung in das BE-Handling.'),
 # VNR
 ('Das Feld „Vertragsbeginn“ ist bei jedem vorhandenen Vertrag gefüllt',
  'Ein gefülltes Feld „Vertragsbeginn“ weist nach, dass der Vertrag existiert. Fehlt der Vertrag zur Versicherungsscheinnummer, endet der Vorgang mit einer harten BE.'),
 ('<VA230-Sparte> und <VA230-Status> werden nachrichtlich mitgeführt. Die Sparte entscheidet nicht im Bot',
  '<VA230-Sparte> und <VA230-Status> werden nachrichtlich mitgeführt; die Notizvorlage BOT2011 ist durch den Postkorb Gesundheit festgelegt.'),
 # Name
 ('Offener Punkt: Juristische Personen sind noch zu betrachten.',
  'Ist <BUE_KUNDE_VORNAME> bzw. <BUE_KUNDE_GEBDAT> leer (juristische Person als Versicherungsnehmer), wird die jeweilige Prüfung übersprungen.'),
 # Makler
 ('Offener Punkt: Für fünf TOP-Makler soll die E-Mailadresse fest vorgegeben werden',
  'Für definierte TOP-Makler wird die E-Mail-Adresse anhand der PNR aus einer fest hinterlegten Liste übernommen.'),
 ('Offener Punkt: Nach welchen Kriterien wird die Stammagentur ermittelt?',
  'Die Stammagentur ist die im Bestandssystem zum Vertrag hinterlegte Agentur des Bestandsinhabers (<VA230-AGT-Inhaber>).'),
 ('Offener Punkt: Die Kriterien zur Ermittlung des Vertriebskanals',
  'Der Vertriebskanal wird nach der Ableitungsregel des 72-Stunden-BOT aus dem Nummernkreis der Agenturnummer <VA230-AGT-Inhaber> bestimmt: AO, Makler oder unbesetzte Agentur.'),
 ('In der ersten Ausbaustufe steuert <Vorgangstyp-BUE> keine Weiterleitung mehr',
  'Der Vorgangstyp wird für das Reporting mitgeführt; die Weiterleitung erfolgt unabhängig davon.'),
 # BE-Handling
 ('Erste Ausbaustufe: Harte und weiche BE gehen an denselben Themenpostkorb',
  'Harte und weiche BE werden an den Themenpostkorb „HSB4K MV“ zur manuellen Bearbeitung weitergeleitet. Sie unterscheiden sich im Inhalt der Bearbeitungsnotiz: Bei einer harten BE nennt die Notiz das Kriterium für die Ablehnung, bei einer weichen BE die nachzuprüfenden Punkte. Vorgänge ohne BE werden dunkel verarbeitet und laufen nicht in diesen Postkorb.'),
 ('Offener Punkt: Umgang mit Rahmenverträgen (SU)',
  'Rahmenverträge (SU) und Verträge im Mahnverfahren werden wie alle anderen Verträge geprüft; eine Sonderbehandlung erfolgt nicht.'),
 # Weiterleitung / Notiz
 ('Für den Positivweg wird die Notizvorlage „BÜ auf Makler Robotics“ (BOT2011) unverändert genutzt',
  'Die Notizvorlage „BÜ auf Makler Robotics“ (BOT2011) wird unverändert genutzt.'),
]
LOESCHEN = [
 'Technisch zu bestätigen.',
 'Offener Punkt: Zuschnitt und Anzahl der zusätzlichen Datenpool-Felder',
 'Offener Punkt: Das automatische Auslesen der Versicherungsscheinnummern',
 'Dieser Schritt ist aus den Kommentaren des Prozessblatts entnommen',
 'Offener Punkt: Der Name des Themenpostkorbs für die BE-Weiterleitung',
 'Offener Punkt: Der Wortlaut der Bearbeitungsnotiz',
 'Offener Punkt: Die Notizform für die Bearbeitungsnotiz',
 'Offener Punkt: Die Einstufung hart/weich ist je Prüfschritt',
 'Ausbaustufe 2: Harte BE mit Ablehnungsgrund an den Ablehnungs-BOT',
 'Offener Punkt: Diese Annahme ist vorab mit manuell aufgegebenen Notizen',
 'Fachliche Prüfung der Notizbestückung ist erforderlich.',
 'Offener Punkt: Seit der Entscheidung vom 02.09.2026',
 'Die Anbindungsprüfung ist vor allem für den Bestandsinhaber relevant.',
]
for prefix, text in UMFORMULIEREN:
    neutral(start(prefix), text)
for prefix in LOESCHEN:
    entferne(start(prefix))
z = zeile('Reaktion'); z.getparent().remove(z)
n_pk = ersetze_ueberall('Vorgang an den Themenpostkorb „MV“ (HSB4K) weiterleiten', 'Vorgang an den Themenpostkorb „HSB4K MV“ weiterleiten')
n_pk += ersetze_ueberall('Bearbeitungsnotiz am Postkorbvorgang hinterlegen', 'Bearbeitungsnotiz als Bearbeitungshinweis am Postkorbvorgang hinterlegen')
n_pk += ersetze_ueberall('alle BE gehen an den Themenpostkorb MV', 'alle BE gehen an den Themenpostkorb „HSB4K MV“')
import re
rest = [ptext(p)[:90] for p in alle() if re.search(r'Offener Punkt|zu bestätigen|Ausbaustufe|\d\d\.\d\d\.2026|zu klären|Vorschlag|Annahme', ptext(p))]
protokoll.append(f'Bereinigung: {len(UMFORMULIEREN)} Absätze umformuliert, {len(LOESCHEN)} gelöscht, Zeile Reaktion entfernt, {n_pk} Bezeichnungen vereinheitlicht; Reste: {rest}')


# ============================================================ 14. Aufzaehlungszeichen fuer Listenabsaetze ohne Nummerierung
n_bul = 0
for p in alle():
    ppr = p.find(W + 'pPr')
    if ppr is None: continue
    ps = ppr.find(W + 'pStyle')
    if ps is None or ps.get(W + 'val') != STIL_LISTE or ppr.find(W + 'numPr') is not None or not ptext(p).strip():
        continue
    numpr = etree.Element(W + 'numPr')
    il = etree.SubElement(numpr, W + 'ilvl'); il.set(W + 'val', '0')
    ni = etree.SubElement(numpr, W + 'numId'); ni.set(W + 'val', '4')
    ppr.insert(1 if ppr.find(W + 'pStyle') is not None else 0, numpr)
    n_bul += 1
protokoll.append(f'Aufzählungszeichen an {n_bul} Listenabsätzen ergänzt')

# ============================================================ 15. Einheitlicher Begriff: Bearbeitungshinweis (Freitextfeld am Postkorbvorgang)
n_bh = 0
for a, b in [
 ('Bearbeitungsnotiz = „Kriterium für Ablehnung: “ + <BE-Klassifikation>',
  'Feld „Bearbeitungshinweis“ = „Kriterium für Ablehnung: “ + <BE-Klassifikation>'),
 ('Bearbeitungsnotiz = „Nachprüfung erforderlich, abweichende Prüfungen: “ + <Prüfnotizen>',
  'Feld „Bearbeitungshinweis“ = „Nachprüfung erforderlich, abweichende Prüfungen: “ + <Prüfnotizen>'),
 ('Bearbeitungsnotiz als Bearbeitungshinweis am Postkorbvorgang hinterlegen', 'Bearbeitungshinweis am Postkorbvorgang speichern'),
 ('auf Basis der Bearbeitungsnotiz des Prüf-Bots', 'auf Basis des Bearbeitungshinweises des Prüf-Bots'),
 ('in die Bearbeitungsnotiz übernommen', 'in den Bearbeitungshinweis übernommen'),
 ('Sie unterscheiden sich im Inhalt der Bearbeitungsnotiz: Bei einer harten BE nennt die Notiz das Kriterium',
  'Sie unterscheiden sich im Inhalt des Bearbeitungshinweises: Bei einer harten BE nennt er das Kriterium'),
]:
    n_bh += ersetze_ueberall(a, b)
rest = [ptext(p)[:80] for p in alle() if 'Bearbeitungsnotiz' in ptext(p)]
assert not rest, rest
protokoll.append(f'Begriff Bearbeitungshinweis vereinheitlicht ({n_bh} Stellen)')

# ============================================================ 16. Erlaeuterungen als „Hinweis:“ in Hervorhebung (kursiv), wie die Format-Zeilen
import re as _re
_KEY = _re.compile(r'^(WENN|DANN|SONST|SONST WENN|Ende WENN|Weiter|Lese |Merke |Feld „|UND |ODER |<|Vorgang |Bearbeitungshinweis am|'
                   r'Notiz |Bereits gesammelte|Verarbeitung |Mögliche |Postkorbvorgang öffnen|Datenpool mit|OB726 mit|GH040 mit|'
                   r'VA230 mit|IS100 mit|EOS mit|Entferne |Kennzeichen |Zerlege |Agentur zu|Vermittler zu|Screenshot|'
                   r'Die Variablen für das BE-Handling|Format:|Hinweis:)')
_ps = alle()
_i = next(j for j, p in enumerate(_ps) if ptext(p).startswith('Notation nach der Vorgabe'))
n_hw = 0
for p in _ps[_i + 1:]:
    t = ptext(p).strip()
    ppr = p.find(W + 'pPr'); ps_ = ppr.find(W + 'pStyle') if ppr is not None else None
    st = ps_.get(W + 'val') if ps_ is not None else ''
    if not t or st in (STIL_KEY, STIL_LISTE, STIL_KONT, 'berschrift2', 'LinkeSpalteTabelle') or _KEY.match(t):
        continue
    settext(p, 'Hinweis: ' + t)
    r = [r for r in p.findall(W + 'r') if r.find(W + 't') is not None][0]
    rpr = r.find(W + 'rPr')
    if rpr is None:
        rpr = etree.Element(W + 'rPr'); r.insert(0, rpr)
    for rs in rpr.findall(W + 'rStyle'): rpr.remove(rs)
    rs = etree.Element(W + 'rStyle'); rs.set(W + 'val', RS_HINW); rpr.insert(0, rs)
    n_hw += 1
protokoll.append(f'{n_hw} Erläuterungen als „Hinweis:“ in Hervorhebung gesetzt')

teile['word/document.xml'] = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)

# ============================================================ 11. Kommentare als erledigt markieren
kom = etree.fromstring(teile['word/comments.xml'])
ERLEDIGT = {'60', '61', '62', '65', '68', '71'}
paraids = {}
for c in kom.findall(W + 'comment'):
    if c.get(W + 'id') in ERLEDIGT:
        paraids[list(c.iter(W + 'p'))[-1].get(W14 + 'paraId')] = c.get(W + 'id')
ext = etree.fromstring(teile['word/commentsExtended.xml'])
n = 0
for ce in ext.iter(W15 + 'commentEx'):
    if ce.get(W15 + 'paraId') in paraids:
        ce.set(W15 + 'done', '1'); n += 1
teile['word/commentsExtended.xml'] = etree.tostring(ext, xml_declaration=True, encoding='UTF-8', standalone=True)
protokoll.append(f'{n} Kommentare als erledigt markiert: {sorted(ERLEDIGT)}')

zout = zipfile.ZipFile('PDD_neu.docx', 'w', zipfile.ZIP_DEFLATED)
for name in zin.namelist():
    zout.writestr(zin.getinfo(name), teile[name])
zout.close()
print('\n'.join(protokoll))
