# -*- coding: utf-8 -*-
"""Formatiert die Schritt-fuer-Schritt-Beschreibung der PDD wie Code.

- WENN / DANN / SONST / Ende WENN werden eingerueckt, verschachtelte Bloecke tiefer.
- Systemnamen fett, Datenpoolfelder dunkelblau, im Lauf erzeugte Variablen dunkelgruen.
"""
import re
from docx.shared import Pt, RGBColor
from docx.oxml.ns import qn

BLAU = RGBColor(0x12, 0x3E, 0x73)     # Felder aus dem Datenpool
GRUEN = RGBColor(0x14, 0x57, 0x2C)    # im Lauf erzeugte Variablen
ROT = RGBColor(0x8C, 0x0F, 0x1E)      # Ergebnis der Pruefung: BE-Klassifikation
ROTE_VARIABLEN = {'BE-Klassifikation'}
ORANGE = RGBColor(0xB4, 0x5F, 0x06)   # Pruefnotiz: gesammelte Abweichung, Verarbeitung laeuft weiter
PRUEFNOTIZ = re.compile(r'^(Merke Prüfnotiz|Record check note)\s+(„[^“]*“)\s+(in <Fehlerliste>.*)$')
SYSTEME = ['OB726', 'OB729', 'GH040', 'VA230', 'EOS', 'IS011', 'IS100', 'EWMS',
           'EMWS', 'KWAD', 'VDB', 'Celonis', 'VAF121', 'VAF017', 'Scout-Service', 'ErgoNotiz',
           'Datenpool', '72-Stunden-BOT', 'BÜ-BOT', 'ODPB']


def ist(zeile, *woerter):
    """Zeile beginnt mit einem der Steuerwoerter (deutsch oder englisch)."""
    return any(zeile == w or zeile.startswith(w + ' ') for w in woerter)
SYSRE = re.compile(r'\b(' + '|'.join(SYSTEME) + r')\b')
VARRE = re.compile(r'<\s*([A-Za-z0-9_\-]+)\s*>')
BARE = re.compile(r'\b(BUE_[A-Z0-9_]+)\b')
EINZUG = Pt(18)


def _teile(text):
    """Zerlegt eine Zeile in (Text, Art) mit Art in None|'dp'|'var'|'be'|'sys'|'pn'|'br'.

    Eine Pruefnotiz („Merke Prüfnotiz „…“ in <Fehlerliste>“) wird dreizeilig gesetzt:
    Ankuendigung, die Notiz eingerueckt in eigener Zeile, dann das Ziel. 'br' ist ein
    Zeilenumbruch im Absatz, 'pn' der orange gesetzte Notiztext.
    """
    m = PRUEFNOTIZ.match(text)
    if m:
        notiz = [(w, 'pn' if a is None else a) for w, a in _teile(m.group(2))]
        return ([(m.group(1), 'pn'), ('\n', 'br'), ('\t', None)] + notiz +
                [('\n', 'br')] + _teile(m.group(3)))
    stuecke = []
    pos = 0
    marken = []
    for m in VARRE.finditer(text):
        name = m.group(1)
        art = 'dp' if name.startswith('BUE_') else ('be' if name in ROTE_VARIABLEN else 'var')
        marken.append((m.start(), m.end(), art, '<' + name + '>'))
    for m in BARE.finditer(text):
        if not any(a <= m.start() < b for a, b, _, _ in marken):
            marken.append((m.start(), m.end(), 'dp', m.group(1)))
    for m in SYSRE.finditer(text):
        if not any(a <= m.start() < b for a, b, _, _ in marken):
            marken.append((m.start(), m.end(), 'sys', m.group(1)))
    marken.sort()
    for a, b, art, wort in marken:
        if a > pos:
            stuecke.append((text[pos:a], None))
        stuecke.append((wort, art))
        pos = b
    if pos < len(text):
        stuecke.append((text[pos:], None))
    return stuecke or [(text, None)]


def hat_bild(absatz):
    x = absatz._element.xml
    return '<w:drawing>' in x or '<w:pict>' in x or 'v:imagedata' in x


VERWEIS = ('Weiter zu', 'Weiter mit', 'Continue with', 'Continue at', 'Go to', 'Proceed')


def _absatzform(absatz, tiefe, luft, luft_danach, punkt=False):
    pf = absatz.paragraph_format
    pf.left_indent = EINZUG * tiefe if tiefe else None
    pf.space_after = Pt(luft_danach) if luft_danach else Pt(0)
    pf.space_before = Pt(10) if luft else Pt(0)
    if punkt:                                  # Aufzaehlung mit Punkt und Einzug
        pf.left_indent = EINZUG
        pf.first_line_indent = -Pt(10)


def _verweis(absatz, zeile, tiefe, luft, luft_danach):
    """Haelt den Querverweis als Sprungmarke und setzt ihn fett und unterstrichen.

    Der Linktext liegt in einem ``w:hyperlink`` und damit ausserhalb von
    ``absatz.runs``; er darf nicht durch einen neuen Lauf ersetzt werden, sonst
    steht die Zeile doppelt im Dokument.
    """
    links = absatz._element.findall(qn('w:hyperlink'))
    if not links:
        return False
    if not zeile.startswith(VERWEIS):   # fremder Link: Absatz unveraendert lassen
        _absatzform(absatz, tiefe, luft, luft_danach)
        return True
    for r in list(absatz.runs):                # doppelt geschriebenen Text entfernen
        r._element.getparent().remove(r._element)
    for ueberzaehlig in links[1:]:
        ueberzaehlig.getparent().remove(ueberzaehlig)
    laeufe = links[0].findall(qn('w:r'))
    for ueberzaehlig in laeufe[1:]:
        links[0].remove(ueberzaehlig)
    if laeufe:
        for t in laeufe[0].findall(qn('w:t')):
            laeufe[0].remove(t)
        t = laeufe[0].makeelement(qn('w:t'), {})
        t.text = zeile
        t.set(qn('xml:space'), 'preserve')
        laeufe[0].append(t)
        from docx.text.run import Run
        lauf = Run(laeufe[0], absatz)
        lauf.bold = True
        lauf.underline = True
    _absatzform(absatz, tiefe, luft, luft_danach)
    return True


STIL_SCHLUESSEL = 'Intense Quote'          # Vorlagenstil "WENN DANN": tuerkis, fett, Arial 12
STIL_EINZUG = Pt(5.65)                     # linker Einzug des Stils (113 Twips)


def _schluesselform(absatz, tiefe):
    """Laesst WENN/DANN/SONST/Ende WENN im Stil der Vorlage: tuerkis und fett.

    Farbe, Fettung, Schrift und Abstand kommen aus dem Absatzstil; gesetzt wird
    nur die Einrueckung fuer die Verschachtelung.
    """
    absatz.style = STIL_SCHLUESSEL
    pf = absatz.paragraph_format
    pf.left_indent = (EINZUG * tiefe + STIL_EINZUG) if tiefe else None
    pf.first_line_indent = None
    pf.space_before = None
    pf.space_after = None


def schreibe(absatz, zeile, tiefe, basis=None, kursiv=False, luft=False, punkt=False, luft_danach=False,
             schluessel=False):
    """Schreibt eine Zeile formatiert in einen vorhandenen, geleerten Absatz."""
    if _verweis(absatz, zeile, tiefe, luft, luft_danach):
        return
    for r in list(absatz.runs):
        r._element.getparent().remove(r._element)
    if schluessel:
        _schluesselform(absatz, tiefe)
        basis = None                           # Schrift kommt aus dem Stil
    else:
        if absatz.style.name == STIL_SCHLUESSEL:
            absatz.style = 'Normal'            # frueheres Schluesselwort, jetzt Text
        _absatzform(absatz, tiefe, luft, luft_danach, punkt)
    if punkt:
        zeile = '\u2022\t' + zeile
    verweis = zeile.startswith(VERWEIS)        # Sprung ins naechste Kapitel
    for wort, art in _teile(zeile):
        if art == 'br':
            absatz.add_run().add_break()
            continue
        r = absatz.add_run(wort)
        r.italic = kursiv
        if verweis:
            r.bold = True
            r.underline = True
        if basis is not None:
            r.font.name = basis.name
            r.font.size = basis.size
        if art == 'dp':
            r.font.color.rgb = BLAU
            r.bold = True
        elif art == 'var':
            r.font.color.rgb = GRUEN
            r.bold = True
        elif art == 'be':
            r.font.color.rgb = ROT
            r.bold = True
        elif art == 'pn':
            r.font.color.rgb = ORANGE
            r.bold = True
        elif art == 'sys':
            r.bold = True


TRENNER = '________'
GRAU = RGBColor(0xA6, 0xA6, 0xA6)


def ist_trenner(text):
    return bool(re.fullmatch(r'_{4,}', (text or '').strip()))


def trenner_einfuegen(absatz):
    """Setzt vor den Absatz eine kurze graue Linie als optischen Trenner zwischen zwei Pruefungen."""
    from docx.text.paragraph import Paragraph
    from docx.oxml import OxmlElement
    vorher = absatz._element.getprevious()
    if vorher is not None and vorher.tag == qn('w:p') and ist_trenner(''.join(t.text or '' for t in vorher.iter(qn('w:t')))):
        return None                        # schon vorhanden (Zelle wurde erneut formatiert)
    el = OxmlElement('w:p')
    absatz._element.addprevious(el)
    p = Paragraph(el, absatz._parent)
    p.style = 'Normal'
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.left_indent = None
    r = p.add_run(TRENNER)
    r.font.color.rgb = GRAU
    r.font.size = Pt(8)
    r.bold = False
    return p


LISTENENDE = ('WENN', 'DANN', 'SONST', 'Ende ', 'Hinweis:', 'Format:', 'Weiter ',
              'Schleife', 'IF', 'THEN', 'ELSE', 'END ', 'Note:', 'Continue ', 'Go to', 'Proceed', 'LOOP')


def formatiere_zelle(zelle, start=0):
    """Rueckt WENN- und Schleifenbloecke ein, faerbt Variablen und Systeme.

    ``start`` ist die Einrueckung, die aus einer vorangegangenen Zelle
    weiterlaeuft: Eine Schleife wird in einer Zeile geoeffnet und erst mehrere
    Screenshot-Zeilen spaeter geschlossen. Zurueckgegeben wird die Einrueckung
    fuer die naechste Zelle; nicht geschlossene WENN-Bloecke laufen bewusst
    nicht weiter.
    """
    tiefe = start
    schleife = start
    basis = None
    vorher_ende = False
    vorher_punkt = False
    vorher_hinweis = False
    liste = False
    hatte_pruefung = False     # eine Pruefung auf oberster Ebene ist abgeschlossen
    trenner_vor = []           # Absaetze, vor die ein optischer Trenner kommt
    for absatz in zelle.paragraphs:
        if hat_bild(absatz) or ist_trenner(absatz.text):   # Screenshots und Trenner bleiben unangetastet
            continue
        if absatz.runs and basis is None and absatz.style.name != STIL_SCHLUESSEL:
            basis = absatz.runs[0].font
        zeile = absatz.text.strip()
        if not zeile:
            for r in list(absatz.runs):
                r._element.getparent().remove(r._element)
            absatz.paragraph_format.left_indent = None
            liste = False
            continue
        kursiv = zeile.startswith(('Hinweis:', 'Format:', 'Note:'))
        punkt = zeile.startswith('\u2022 ')
        if punkt:
            zeile = zeile[2:]
        kopf = (not kursiv and not punkt and zeile.endswith(':')
                and not zeile.startswith(LISTENENDE))
        war_liste = liste
        if liste and (punkt or kursiv or kopf or zeile.startswith(LISTENENDE)):
            liste = False        # eine neue Ankuendigung beendet die alte Liste
        luft = False
        schluss = False
        schluessel = True                      # Steuerwort im Stil "WENN DANN"
        if ist(zeile, 'Ende WENN', 'END IF'):
            tiefe = max(schleife, tiefe - 1)
            ein = tiefe
            vorher_ende = True
            schluss = 10 if tiefe == schleife else 6   # abgeschlossene Pruefung trennen
            if tiefe == schleife:
                hatte_pruefung = True
        elif zeile in ('DANN', 'SONST', 'THEN', 'ELSE') or ist(zeile, 'SONST WENN', 'ELSE IF', 'DANN', 'THEN'):
            ein = max(0, tiefe - 1)
            luft = zeile.startswith('SONST')  # Abstand vor dem Gegenzweig
        elif ist(zeile, 'WENN', 'IF'):
            ein = tiefe
            luft = (tiefe == schleife)
            if tiefe == schleife and hatte_pruefung:
                trenner_vor.append(absatz)     # naechste Pruefung optisch absetzen
            tiefe += 1
            vorher_ende = False
        elif ist(zeile, 'Ende Schleife', 'END LOOP'):
            schleife = max(0, schleife - 1)
            tiefe = max(schleife, tiefe - 1)
            ein = tiefe
            vorher_ende = True
            schluss = 10 if tiefe == 0 else 6
        elif (zeile.startswith('Schleife') and not zeile.startswith('Schleife beenden')) or zeile.startswith('LOOP'):
            ein = tiefe
            luft = (tiefe == schleife)
            tiefe += 1
            schleife += 1
            vorher_ende = False
        elif kursiv or punkt:
            schluessel = False
            ein = 0
            luft = kursiv or (punkt and not vorher_punkt)
            vorher_ende = False
        else:
            schluessel = False
            ein = tiefe + (1 if liste else 0)
            luft = (tiefe == schleife and not liste
                    and (vorher_ende or vorher_punkt or vorher_hinweis
                         or (kopf and war_liste)))
            vorher_ende = False
        schreibe(absatz, zeile, ein, basis, kursiv, luft, punkt, schluss, schluessel)
        if kopf:
            liste = True          # Eingabeblock gehoert unter seine Ankuendigung
        vorher_punkt = punkt
        vorher_hinweis = kursiv
    for absatz in trenner_vor:
        trenner_einfuegen(absatz)
    return schleife


def formatiere_tabellen(dok, tabellen):
    for i in tabellen:
        formatiere_tabelle(dok.tables[i])


def formatiere_tabelle(tabelle):
    """Formatiert alle Zellen und traegt Schleifen ueber Zeilengrenzen weiter."""
    stand = {}
    for reihe in tabelle.rows:
        for nr, zelle in enumerate(reihe.cells):
            stand[nr] = formatiere_zelle(zelle, stand.get(nr, 0))


def verlinke_innen(absatz, ziele):
    """Setzt Querverweise innerhalb eines Absatzes als interne Links.

    ``ziele`` ist eine Liste (Muster, Textmarke); die erste Gruppe des Musters
    (sonst der ganze Treffer) wird zum Linktext, fett und unterstrichen, im
    Zeichenstil Hyperlink. Laufformat (kursiv, Farbe) bleibt erhalten.
    """
    import copy
    from docx.oxml import OxmlElement
    while True:
        treffer = None
        for r in absatz.runs:
            text = r.text
            if not text:
                continue
            for muster, marke in ziele:
                m = muster.search(text)
                if m and (treffer is None or m.start() < treffer[1].start()):
                    treffer = (r, m, marke)
            if treffer:
                break
        if not treffer:
            return
        r, m, marke = treffer
        a, b = m.span(1) if m.groups() else m.span()
        text = r.text
        vor, link, nach = text[:a], text[a:b], text[b:]
        rPr = r._element.find(qn('w:rPr'))
        h = OxmlElement('w:hyperlink')
        h.set(qn('w:anchor'), marke)
        h.set(qn('w:history'), '1')
        lr = OxmlElement('w:r')
        lrPr = copy.deepcopy(rPr) if rPr is not None else OxmlElement('w:rPr')
        for alt in lrPr.findall(qn('w:rStyle')):
            lrPr.remove(alt)
        rs = OxmlElement('w:rStyle'); rs.set(qn('w:val'), 'Hyperlink'); lrPr.insert(0, rs)
        for tag in ('w:b', 'w:u'):
            for alt in lrPr.findall(qn(tag)):
                lrPr.remove(alt)
        for alt in lrPr.findall(qn('w:color')):
            lrPr.remove(alt)
        farbe = OxmlElement('w:color'); farbe.set(qn('w:val'), 'auto'); lrPr.append(farbe)
        b_ = OxmlElement('w:b'); lrPr.append(b_)
        u_ = OxmlElement('w:u'); u_.set(qn('w:val'), 'single'); lrPr.append(u_)
        lr.append(lrPr)
        t = OxmlElement('w:t'); t.text = link; t.set(qn('xml:space'), 'preserve'); lr.append(t)
        h.append(lr)
        r._element.addnext(h)
        if nach:
            nr = copy.deepcopy(r._element)
            for x in list(nr):
                if x.tag != qn('w:rPr'):
                    nr.remove(x)
            t2 = OxmlElement('w:t'); t2.text = nach; t2.set(qn('xml:space'), 'preserve'); nr.append(t2)
            h.addnext(nr)
        if vor:
            r.text = vor
        else:
            r._element.getparent().remove(r._element)
