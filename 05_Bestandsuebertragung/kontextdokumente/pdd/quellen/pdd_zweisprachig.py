# -*- coding: utf-8 -*-
"""Fuellt die englischen Stellen der PDD nach dem Rohformat des Templates.

Aufruf: python3 pdd_zweisprachig.py <de.docx> <ziel.docx> <ordner mit chunk_*_en.json>

Uebersetzt wird nur, was das Template vorsieht:
- dritte Spalte jeder Schritttabelle (Screenshot | Beschreibung | englische Uebersetzung), gleiche Struktur
  und Formatierung wie die deutsche Spalte (Steuerwoerter IF/THEN/ELSE/END IF, Farben, Einrueckung, Links);
- Spalte "answer" der Design-Tabellen (Frage | Antwort | answer);
- Ueberschriften der Schrittkapitel und der fachlichen Kontexte zweisprachig ("Deutsch / English");
- Hilfstabellen im Schrittteil (Weiche, Sonderliste, Notiz, Bearbeitung nach): englischer Text als zweiter Absatz in der Zelle;
- Notation und Lesehilfe vor den Schrittkapiteln: englische Absaetze im Anschluss.
Variablen, Feldnamen, Systeme und alles in „…“ bleiben unveraendert; Kapitelnamen in Querverweisen werden auf die
englischen Kapitelnamen gesetzt.
"""
import copy, glob, json, re, sys
from docx import Document
from docx.text.paragraph import Paragraph
from docx.text.run import Run
from docx.table import Table
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import pdd_formatierung as fmt

QUELLE, ZIEL, ORDNER = sys.argv[1], sys.argv[2], sys.argv[3]
d = Document(QUELLE)
BODY = d.element.body

MAP = {}
for f in sorted(glob.glob(ORDNER + '/chunk_*_en.json')):
    for e in json.load(open(f, encoding='utf-8')):
        MAP[e['de']] = e['en']
REGEL = {'WENN': 'IF', 'DANN': 'THEN', 'SONST': 'ELSE', 'SONST WENN': 'ELSE IF', 'Ende WENN': 'END IF',
         'Ende Schleife': 'END LOOP', 'ja': 'yes', 'nein': 'no', '–': '–'}
KAPITEL_EN = [
 ('Start – Vorgang aus dem Themenpostkorb übernehmen', 'Start – take over the case from the topic mailbox'),
 ('Vorprüfung – Business Exceptions aus dem KI-Deckblatt', 'Preliminary check – business exceptions from the AI cover sheet'),
 ('I. Kunde (VN) – Partnerprüfung über IS011', 'I. Customer (VN) – partner check via IS011'),
 ('II. Abgebender Bestandsinhaber', 'II. Transferring portfolio holder'),
 ('III. Übernehmender Makler – Agenturnummer und Vermittler-Nr. (PNR)', 'III. Acquiring broker – agency number and intermediary number (PNR)'),
 ('IV. Vertrag – Vertragsstatus in VA230 und Mantelvertrag bei KR', 'IV. Contract – contract status in VA230 and umbrella contract for KR'),
 ('IV. Vertrag – Vertragsstatus in VA230', 'IV. Contract – contract status in VA230'),
 ('V. Test auf Fehlerliste', 'V. Test for error list'),
 ('VI. Abschluss ohne Befund – Notiz bestücken und an den 72-Stunden-BOT übergeben', 'VI. Completion without findings – fill the note and hand over to the 72-Stunden-BOT'),
 ('VII. Abschluss mit Befund – BE-Handling', 'VII. Completion with findings – BE handling'),
]
VERWEIS_EN = [
 ('„Vorprüfung“', '„Preliminary check“'), ('„I. Kunde (VN)“', '„I. Customer (VN)“'),
 ('„II. Abgebender Bestandsinhaber“', '„II. Transferring portfolio holder“'), ('„III. Übernehmender Makler“', '„III. Acquiring broker“'),
 ('„IV. Vertrag“', '„IV. Contract“'), ('„V. Test auf Fehlerliste“', '„V. Test for error list“'),
 ('„VI. Abschluss ohne Befund“', '„VI. Completion without findings“'), ('„VII. Abschluss mit Befund“', '„VII. Completion with findings“'),
 ('„Geburtsdatum abgleichen“', '„Compare date of birth“'), ('„Tabelle der genutzten Variablen“', '„Table of variables used“'),
 ('„Details zum Startereignis“', '„Details of the start event“'), ('„Bearbeitung nach“ unten', '„Bearbeitung nach“ below'),
 ('„Grund der Abweichung bestimmen“', '„Determine the reason for the deviation“'),
 ('„Lese den Maskennamen“', '„Read the mask name“'),
 ('„Aufbau des Bearbeitungshinweises“', '„Structure of the processing note“'),
 ('„E-Mail-Adresse des übernehmenden Vermittlers ermitteln“', '„Determine the e-mail address of the acquiring intermediary“'),
]


def sammle_marken():
    """Textmarken der Ueberschriften und Kontexte aus dem Build: deutscher Kurzname -> Marke."""
    marken = {}
    for p in d.paragraphs:
        stil = p.style.name
        if stil not in ('Heading 1', 'Heading 2', 'Heading 3', 'fachlicher Kontext') or not p.text.strip():
            continue
        namen = [b.get(qn('w:name')) for b in p._element.findall(qn('w:bookmarkStart'))]
        namen = [n for n in namen if n and n.startswith('Kap_')]
        if not namen:
            continue
        voll = ' '.join(p.text.split())
        kurz = (re.split(r' – | / | „', voll)[0] if stil != 'fachlicher Kontext' else voll.split(' / ')[0]).strip()
        marken.setdefault(kurz, namen[0])
    return marken


MARKEN = sammle_marken()
EN_NAME = {}
for de_q, en_q in VERWEIS_EN:
    EN_NAME.setdefault(de_q.strip('„“'), set()).add(en_q.strip('„“'))
for de_t, en_t in KAPITEL_EN:
    EN_NAME.setdefault(de_t.split(' – ')[0], set()).add(en_t.split(' – ')[0])
ZIELE_EN = []
for kurz, marke in MARKEN.items():
    namen = {kurz} | EN_NAME.get(kurz, set())
    for f in glob.glob(ORDNER + '/chunk_*_en.json'):
        pass
    for n in namen:
        ZIELE_EN.append((re.compile(r'(?:chapter|step|tables?|Kapitel|Schritt|Tabellen?) („' + re.escape(n) + r'“)', re.I), marke))
    if re.match(r'^(I|II|III|IV|V|VI|VII)\.', kurz):
        ZIELE_EN.append((re.compile(r'(chapter ' + kurz.split('.')[0] + r')(?![IVX.])'), marke))
fehlend = []


def en(text):
    t = text.strip()
    if not t:
        return ''
    if t in REGEL:
        return REGEL[t]
    if re.fullmatch(r'[•\s]*<[A-Za-z0-9_\-]+>\s*', t) or re.fullmatch(r'(Start|Vorprüfung|I|II|III|IV|V|VI|VII)(, (Start|Vorprüfung|I|II|III|IV|V|VI|VII))*', t):
        return t
    if fmt.ist_trenner(t):
        return t
    e = MAP.get(t)
    if e is None:                      # Zeilen mit Umbruch (Pruefnotiz) sind einzeilig hinterlegt
        e = MAP.get(' '.join(t.split()))
    if e is None:
        fehlend.append(t)
        return t
    for a, b in VERWEIS_EN:
        e = e.replace(a, b)
    return e


for _kurz, _marke in list(MARKEN.items()):
    _e = MAP.get(_kurz)
    if _e:
        ZIELE_EN.append((re.compile(r'(?:chapter|step|table) („' + re.escape(_e) + r'“)', re.I), _marke))


def ohne_marken(el):
    for tag in ('w:bookmarkStart', 'w:bookmarkEnd'):
        for b in list(el.iter(qn(tag))):
            b.getparent().remove(b)


def leere(absatz):
    for r in list(absatz.runs):
        r._element.getparent().remove(r._element)


def uebersetze_absatz(p, text_en):
    """Ersetzt den Text eines Absatzes durch die Uebersetzung; Absatzformat, Stil, Link und Farblogik bleiben."""
    if fmt.ist_trenner(text_en):            # optischer Trenner zwischen zwei Pruefungen bleibt, wie er ist
        return
    links = p._element.findall(qn('w:hyperlink'))
    voll = ''.join(t.text or '' for t in p._element.iter(qn('w:t'))).strip()
    if links and ''.join(t.text or '' for t in links[0].iter(qn('w:t'))).strip() == voll:
        leere(p)
        laeufe = links[0].findall(qn('w:r'))
        for x in laeufe[1:]:
            links[0].remove(x)
        for t in laeufe[0].findall(qn('w:t')):
            laeufe[0].remove(t)
        t = OxmlElement('w:t'); t.text = text_en; t.set(qn('xml:space'), 'preserve'); laeufe[0].append(t)
        r = Run(laeufe[0], p); r.bold = True; r.underline = True
        return
    for h in links:                            # Links im Fliesstext werden auf dem englischen Text neu gesetzt
        p._element.remove(h)
    erste = p.runs[0] if p.runs else None
    kursiv = bool(erste is not None and erste.italic)
    unterstrichen = bool(erste is not None and erste.underline)
    punkt = text_en.startswith('•')
    leere(p)
    for wort, art in fmt._teile(text_en):
        if art == 'br':
            p.add_run().add_break()
            continue
        r = p.add_run(wort)
        r.italic = kursiv
        if unterstrichen:
            r.bold = True; r.underline = True
        if art == 'dp':
            r.font.color.rgb = fmt.BLAU; r.bold = True
        elif art == 'var':
            r.font.color.rgb = fmt.GRUEN; r.bold = True
        elif art == 'be':
            r.font.color.rgb = fmt.ROT; r.bold = True
        elif art == 'pn':
            r.font.color.rgb = fmt.ORANGE; r.bold = True
        elif art == 'sys':
            r.bold = True
    fmt.verlinke_innen(p, ZIELE_EN)


def kopiere_zelle_uebersetzt(quelle, ziel):
    """Kopiert alle Absaetze der Quellzelle in die Zielzelle und uebersetzt sie."""
    for p in list(ziel.paragraphs):
        p._element.getparent().remove(p._element)
    for p in quelle.paragraphs:
        neu = copy.deepcopy(p._element)
        for tag in ('w:bookmarkStart', 'w:bookmarkEnd'):
            for b in list(neu.iter(qn(tag))):
                b.getparent().remove(b)
        for z in list(neu.iter(qn('w:drawing'))):
            z.getparent().getparent().remove(z.getparent())
        ziel._element.append(neu)
        np = Paragraph(neu, ziel)
        if np.text.strip():
            uebersetze_absatz(np, en(np.text))
    if not ziel.paragraphs:
        ziel._element.append(copy.deepcopy(quelle.paragraphs[0]._element))


def haenge_en_an(zelle):
    """Haengt in einer Hilfstabelle die Uebersetzung als weiteren Absatz an."""
    absaetze = [p for p in zelle.paragraphs if p.text.strip()]
    if not absaetze:
        return
    for p in absaetze:
        t = p.text.strip()
        e = en(t)
        if e == t:
            continue
        neu = copy.deepcopy(p._element)
        ohne_marken(neu)
        p._element.addnext(neu)
        uebersetze_absatz(Paragraph(neu, zelle), e)


def finde_absatz(text):
    for k in BODY.iterchildren():
        if k.tag == qn('w:p'):
            p = Paragraph(k, d)
            if p.text.strip() == text:
                return p
    raise KeyError(text)


# 1. Schrittkapitel: Ueberschriften zweisprachig, dritte Spalte fuellen, Hilfstabellen ergaenzen
start = finde_absatz('Schritt für Schritt-Beschreibung')._element
el = start
schritt_tabellen = []
while True:
    el = el.getnext()
    if el is None:
        break
    if el.tag == qn('w:p'):
        p = Paragraph(el, d)
        if p.style.name in ('Heading 2', 'fachlicher Kontext'):
            t = p.text.strip()
            e = dict(KAPITEL_EN).get(t) or en(t)
            if e and e != t:
                # Textmarken behalten: nur Text des ersten Laufs ergaenzen
                laeufe = p.runs
                if laeufe:
                    laeufe[0].text = t + ' / ' + e
                    for r in laeufe[1:]:
                        r._element.getparent().remove(r._element)
    elif el.tag == qn('w:tbl'):
        schritt_tabellen.append(Table(el, d))
for tb in schritt_tabellen:
    spalten = len(tb.rows[0].cells)
    kopf = ' '.join(tb.rows[0].cells[0].text.split())
    erste = tb.rows[0].cells[0]
    ist_schritttabelle = spalten == 3 and (('<w:drawing>' in tb._element.xml) or kopf.startswith(('Screenshot', 'kein Screenshot')) or kopf == '')
    if ist_schritttabelle:
        for r in tb.rows:
            zellen = r.cells
            if len(zellen) < 3:
                continue
            kopiere_zelle_uebersetzt(zellen[1], zellen[2])
    else:
        koepfe = [' '.join(c.text.split()) for c in tb.rows[0].cells]
        for r in tb.rows:
            gesehen = set()
            for nr, c in enumerate(r.cells):
                if id(c._element) in gesehen:
                    continue
                gesehen.add(id(c._element))
                if r is not tb.rows[0] and nr < len(koepfe) and koepfe[nr].startswith('Beispiel'):
                    continue                      # Beispielzeilen sind Werte, die der Roboter schreibt
                haenge_en_an(c)

# 2. Design-Tabellen: Spalte "answer"
for tb in d.tables:
    k = [' '.join(c.text.split()) for c in tb.rows[0].cells]
    if len(k) == 3 and k[1] == 'Antwort' and k[2] == 'answer':
        for r in tb.rows[1:]:
            kopiere_zelle_uebersetzt(r.cells[1], r.cells[2])

# 3. Notation und Lesehilfe: englische Absaetze anschliessen
notation = [p for p in d.paragraphs if p.text.startswith(('Notation nach der Vorgabe', 'Lesehilfe zur Farblogik', 'Initialisierung über', 'Eine Business Exception wird über', 'Hinweis zu den Screenshots'))]
letzter = notation[-1]._element
for p in notation:
    neu = copy.deepcopy(p._element)
    ohne_marken(neu)
    letzter.addnext(neu)
    letzter = neu
    np = Paragraph(neu, d)
    uebersetze_absatz(np, en(np.text))

# Inhaltsverzeichnis: Eintraege der zweisprachigen Ueberschriften nachziehen
ueb = {}
for p in d.paragraphs:
    if p.style.name in ('Heading 1', 'Heading 2', 'Heading 3'):
        for b in p._element.findall(qn('w:bookmarkStart')):
            if (b.get(qn('w:name')) or '').startswith('Kap_'):
                ueb[b.get(qn('w:name'))] = ' '.join(p.text.split())
for e in d.element.body.iter(qn('w:sdt')):
    for h in e.iter(qn('w:hyperlink')):
        a = h.get(qn('w:anchor'))
        if a in ueb:
            ts = [t for r in h.findall(qn('w:r')) for t in r.findall(qn('w:t')) if r.find(qn('w:tab')) is None]
            if ts:
                ts[0].text = ueb[a]
d.save(ZIEL)
print('gespeichert:', ZIEL, '| fehlende Uebersetzungen:', len(set(fehlend)))
import os
json.dump(sorted(set(fehlend)), open(os.path.join(ORDNER, 'fehlend_' + os.path.basename(ZIEL) + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
for t in sorted(set(fehlend))[:20]:
    print('  ?', t[:100])
