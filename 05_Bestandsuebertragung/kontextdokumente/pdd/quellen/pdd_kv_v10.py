# -*- coding: utf-8 -*-
"""Baut die PDD Vorpruefung BUE v10 aus der Reviewfassung v9 (Gesundheit/KV).

Aufruf: python3 pdd_kv_v10.py <v9.docx> <ziel.docx> [KV|KL]

- Kommentare der Reviewrunde werden umgesetzt und entfernt (Protokoll: QS_Review_v9_Kommentarprotokoll.md).
- Vorpruefung ohne Pruefung auf BUE_KLASSIFIKATION (Trigger ist der Themenpostkorb).
- Kundenpruefung ueber IS011 nach der Logik des Fachbereichs (Kundennummer ueber die VNR, Matchcodesuche).
- E-Mail-Adresse des uebernehmenden Vermittlers: Sonderliste TOP-Makler, sonst OB726, bei @ergo der Datenpool.
- Notiz als Ausfuelltabelle ohne WENN/DANN; Komposit/Leben mit Notizmaske 1515 und Anforderung von Unterlagen.
- Ablaufdiagramm neu, Variablen- und Systemtabelle auf den Stand der Schrittkapitel.
"""
import copy, sys, os, re
from docx.oxml import OxmlElement
from docx import Document
from docx.shared import Pt, Cm
from docx.text.paragraph import Paragraph
from docx.table import Table
from docx.oxml.ns import qn
from docx.oxml import parse_xml
import pdd_formatierung as fmt
import zeichnung_v10

QUELLE = sys.argv[1]
ZIEL = sys.argv[2]
SPARTE = sys.argv[3] if len(sys.argv) > 3 else 'KV'
KL = SPARTE == 'KL'
HIER = os.path.dirname(os.path.abspath(__file__))
NOTIZBILD = os.path.join(HIER, 'Notizmaske_1515_Bestandsuebertragung_Robotics_PB.png')
SHOTS = os.path.join(HIER, 'screenshots_2509')          # Screenshots aus der Rueckmeldung K. Rypa (25.09.2026)
def shot(name):
    return os.path.join(SHOTS, name)

d = Document(QUELLE)
BODY = d.element.body

# ------------------------------------------------- Werkzeuge
def elemente():
    for k in BODY.iterchildren():
        if k.tag == qn('w:p'):
            yield 'p', Paragraph(k, d), k
        elif k.tag == qn('w:tbl'):
            yield 't', Table(k, d), k


def finde_absatz(text, stil=None, anfang=False):
    for art, obj, el in elemente():
        if art != 'p':
            continue
        t = obj.text.strip()
        if (t.startswith(text) if anfang else t == text) and (stil is None or obj.style.name == stil):
            return obj
    raise KeyError(text)


def finde_tabelle(teiltext):
    for tb in d.tables:
        if teiltext in tb._element.xml:
            return tb
    raise KeyError(teiltext)


def tabelle_nach(el):
    n = el.getnext()
    while n is not None and n.tag != qn('w:tbl'):
        n = n.getnext()
    return Table(n, d)


def leere_laeufe(absatz):
    for r in list(absatz.runs):
        r._element.getparent().remove(r._element)
    for h in absatz._element.findall(qn('w:hyperlink')):
        absatz._element.remove(h)


def setze_text(absatz, text):
    """Ersetzt den Text eines Absatzes; Stil und Absatzformat bleiben."""
    leere_laeufe(absatz)
    absatz.add_run(text)


def loesche(el):
    el.getparent().remove(el)


def setze_zelle(zelle, zeilen):
    """Ersetzt den Text einer Zelle; Absaetze mit Screenshots bleiben erhalten, alte Bildunterschriften darin nicht."""
    for p in zelle.paragraphs:
        if fmt.hat_bild(p):
            for r in list(p.runs):
                if '<w:drawing>' not in r._element.xml and '<w:pict>' not in r._element.xml:
                    r._element.getparent().remove(r._element)
    text_abs = [p for p in zelle.paragraphs if not fmt.hat_bild(p)]
    if not text_abs:
        muster = copy.deepcopy(zelle.paragraphs[-1]._element)
        zelle.paragraphs[-1]._element.addnext(muster)
        text_abs = [Paragraph(muster, zelle)]
        leere_laeufe(text_abs[0])
    erste = text_abs[0]
    for p in text_abs[1:]:
        loesche(p._element)
    leere_laeufe(erste)
    erste.style = 'Normal'
    erste.add_run(zeilen[0] if zeilen else '')
    for zeile in zeilen[1:]:
        neu = copy.deepcopy(erste._element)
        erste._element.addnext(neu)
        p = Paragraph(neu, zelle)
        leere_laeufe(p)
        p.add_run(zeile)
        erste = p


def breite(tabelle, anteile):
    """Setzt die Tabelle auf die volle Textbreite und verteilt die Spalten nach `anteile`."""
    sp = d.sections[-1]
    text_w = int((sp.page_width - sp.left_margin - sp.right_margin) / 635)
    summe = float(sum(anteile))
    spalten = [int(text_w * a / summe) for a in anteile]
    tblPr = tabelle._element.find(qn('w:tblPr'))
    for tag in ('w:tblW', 'w:tblLayout', 'w:tblInd'):
        for x in tblPr.findall(qn(tag)):
            tblPr.remove(x)
    w = OxmlElement('w:tblW'); w.set(qn('w:w'), str(sum(spalten))); w.set(qn('w:type'), 'dxa'); tblPr.append(w)
    lay = OxmlElement('w:tblLayout'); lay.set(qn('w:type'), 'fixed'); tblPr.append(lay)
    grid = tabelle._element.find(qn('w:tblGrid'))
    for x in list(grid):
        grid.remove(x)
    for b in spalten:
        gc = OxmlElement('w:gridCol'); gc.set(qn('w:w'), str(b)); grid.append(gc)
    for r in tabelle.rows:
        for tc, b in zip(r._element.findall(qn('w:tc')), spalten):
            tcPr = tc.find(qn('w:tcPr'))
            if tcPr is None:
                tcPr = OxmlElement('w:tcPr'); tc.insert(0, tcPr)
            for x in tcPr.findall(qn('w:tcW')):
                tcPr.remove(x)
            tw = OxmlElement('w:tcW'); tw.set(qn('w:w'), str(b)); tw.set(qn('w:type'), 'dxa'); tcPr.insert(0, tw)


def kopfzeile(tabelle, wiederholen=False):
    """Kopfzeile wie im Template: Stil Table Heading, graue Schattierung, optional auf jeder Seite wiederholt."""
    r = tabelle.rows[0]
    gesehen = set()
    for c in r.cells:
        if id(c._element) in gesehen:
            continue
        gesehen.add(id(c._element))
        tcPr = c._element.get_or_add_tcPr()
        for x in tcPr.findall(qn('w:shd')):
            tcPr.remove(x)
        shd = OxmlElement('w:shd'); shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), 'A6A6A6'); tcPr.append(shd)
        for p in c.paragraphs:
            p.style = 'Table Heading'
            for run in p.runs:
                run.font.color.rgb = None
                run.font.bold = None
    if wiederholen:
        trPr = r._tr.get_or_add_trPr()
        if trPr.find(qn('w:tblHeader')) is None:
            trPr.append(OxmlElement('w:tblHeader'))


def bildunterschrift(zelle, text):
    """Setzt in einer Screenshot-Zelle genau eine Unterschrift unter das letzte Bild."""
    bilder = [p for p in zelle.paragraphs if fmt.hat_bild(p)]
    for p in list(zelle.paragraphs):
        if fmt.hat_bild(p):
            for r in list(p.runs):
                if '<w:drawing>' not in r._element.xml and '<w:pict>' not in r._element.xml:
                    r._element.getparent().remove(r._element)
        else:
            loesche(p._element)
    vorlage = bilder[-1]._element if bilder else None
    neu = copy.deepcopy(vorlage) if vorlage is not None else OxmlElement('w:p')
    for x in list(neu):
        if x.tag != qn('w:pPr'):
            neu.remove(x)
    zelle._element.append(neu)
    p = Paragraph(neu, zelle); p.style = 'Normal'
    r = p.add_run(text); r.font.size = Pt(8); r.font.color.rgb = fmt.RGBColor(0x6B, 0x6B, 0x6B)


def zeilen_anpassen(tabelle, anzahl):
    """Bringt die Tabelle auf `anzahl` Zeilen (Kopie der letzten Zeile bzw. Streichen von hinten)."""
    while len(tabelle.rows) < anzahl:
        neu = copy.deepcopy(tabelle.rows[-1]._element)
        tabelle.rows[-1]._element.addnext(neu)
    while len(tabelle.rows) > anzahl:
        loesche(tabelle.rows[-1]._element)


def bild_in_zelle(zelle, pfad, breite_cm):
    p = zelle.paragraphs[0]
    p.add_run().add_picture(pfad, width=Cm(breite_cm))


def bild_entfernen(zelle, nummer):
    """Entfernt das nummer-te Bild (1-basiert) einer Zelle samt Absatz."""
    bilder = [p for p in zelle.paragraphs if fmt.hat_bild(p)]
    if len(bilder) >= nummer:
        loesche(bilder[nummer - 1]._element)


def bilder_setzen(zelle, pfade, breite_cm, unterschrift, behalten=False):
    """Setzt Screenshots in eine Zelle (je ein Absatz) und genau eine Unterschrift; vorhandene Bilder werden ersetzt, ausser behalten=True."""
    if not behalten:
        for p in list(zelle.paragraphs):
            if fmt.hat_bild(p):
                loesche(p._element)
    for pfad in pfade:
        neu = OxmlElement('w:p')
        zelle._element.append(neu)
        Paragraph(neu, zelle).add_run().add_picture(pfad, width=Cm(breite_cm))
    bildunterschrift(zelle, unterschrift)


def ersetze_ueberall(paare):
    for t in BODY.iter(qn('w:t')):
        if not t.text:
            continue
        for alt, neu in paare:
            if alt in t.text:
                t.text = t.text.replace(alt, neu)


def absatz_nach(el, text, stil):
    """Fuegt hinter `el` einen neuen Absatz mit Stil ein und gibt sein Element zurueck."""
    vorlage = None
    for art, obj, e2 in elemente():
        if art == 'p' and obj.style.name == stil:
            vorlage = e2
            break
    neu = copy.deepcopy(vorlage)
    ohne_marken(neu)
    el.addnext(neu)
    p = Paragraph(neu, d)
    leere_laeufe(p)
    p.add_run(text)
    return neu


def ohne_marken(el):
    """Entfernt Textmarken aus einer Kopie, damit Marken im Dokument eindeutig bleiben."""
    for tag in ('w:bookmarkStart', 'w:bookmarkEnd'):
        for b in list(el.iter(qn(tag))):
            b.getparent().remove(b)


def tabelle_nach_element(el, vorlage_tabelle, zeilen):
    """Kopiert eine Tabelle als Vorlage hinter `el` und fuellt sie zeilenweise (Liste von Zellentexten)."""
    neu = copy.deepcopy(vorlage_tabelle._element)
    el.addnext(neu)
    tb = Table(neu, d)
    zeilen_anpassen(tb, len(zeilen))
    for r, werte in zip(tb.rows, zeilen):
        gesehen = set()
        zellen = [c for c in r.cells if not (id(c._element) in gesehen or gesehen.add(id(c._element)))]
        for c, w in zip(zellen, werte):
            for p in c.paragraphs:
                for run in list(p.runs):
                    run._element.getparent().remove(run._element)
            setze_zelle(c, w if isinstance(w, list) else [w])
    return tb


# ------------------------------------------------- 0. Kommentare entfernen
for tag in ('w:commentRangeStart', 'w:commentRangeEnd'):
    for el in list(BODY.iter(qn(tag))):
        loesche(el)
for el in list(BODY.iter(qn('w:commentReference'))):
    loesche(el.getparent())
for rid, rel in list(d.part.rels.items()):
    if 'comments' in rel.reltype or 'people' in rel.reltype:
        d.part.drop_rel(rid)

# ------------------------------------------------- 1. Deckblatt und Versionierung
SPARTENTEXT = ('Krankenversicherung (KV) – Voll-, Zusatz- und Pflegeversicherung' if not KL
               else 'Komposit (SU, KFZ, Haftpflicht, Unfall, Rechtsschutz, Sach) und Leben/BU')
if KL:
    for art, obj, el in elemente():
        if art == 'p' and obj.style.name == 'Subtitle':
            setze_text(obj, 'Vorprüfung Bestandsübertragung (Prüf-Bot) – Komposit / Leben')
            break
setze_text(finde_absatz('Fachprozess:', anfang=True),
           'Fachprozess: Vorprüfung eingehender Bestandsübertragungen. Sparten im Bearbeitungsumfang: ' + SPARTENTEXT + '.')
t_vers = d.tables[0]
zeilen_anpassen(t_vers, 2)
for c, w in zip(t_vers.rows[1].cells, ['D. Amend (Process Owner)', '24.08.2026', 'PDD – Reviewversion zur Prozessvalidierung', '–']):
    setze_zelle(c, [w])

# ------------------------------------------------- 2. Systemtabelle
SYSTEME = [
 ('Themenpostkorb (Eröffnung über die EMWS-Schnittstelle)',
  'Eingangskanal des Prozesses. Celonis eröffnet je Versicherungsnummer einen Postkorbvorgang über die EMWS-Schnittstelle '
  '(E-Mail mit Anhängen, KI-Deckblatt, Datenpool). Der Roboter öffnet den Vorgang, liest das Eröffnungsdatum, legt die Notiz '
  'an und leitet den Vorgang weiter.'),
 ('Datenpool',
  'Einzige Datenquelle des Prüf-Bots für die Vorgangsdaten. Enthält die Felder BUE_* aus dem KI-Deckblatt. Wie die Felder '
  'befüllt werden, ist nicht Gegenstand dieses PDD.'),
 ('VA230 – Vertragsauskunft',
  'Auslesen des Vertragsstatus und der Agentur-Nr. (A…) des abgebenden Bestandsinhabers' +
  ('' if not KL else '; bei KR zusätzlich, ob ein Flottenvertrag vorliegt (VA230, Feld „Sparte/Vers.Art“ = „FK“)') + '.'),
 ('IS011 – Partnerauskunft',
  'Kundennummer des Versicherungsnehmers über die Versicherungsnummer (Maske VAF017), Matchcodesuche mit den Angaben aus dem '
  'Auftrag (Maske VAF121) und Geburtsdatum des Versicherungsnehmers.'),
 ('Scout-Service – Vertragsübersicht',
  'Liefert zu einer Kundennummer alle Versicherungsnummern. Wird nur benötigt, wenn die Matchcodesuche einen anderen Partner '
  'als den Versicherungsnehmer findet, um den Grund der Business Exception zu bestimmen.'),
 ('OB726 – Vermittlerauskunft',
  'Auslesen von Vermittler-Nr. (PNR), Name und Klassifizierung (Makler, Mehrfachagent, Courtagefortzahler) des übernehmenden '
  'Vermittlers sowie PNR' + (' und Klassifizierung' if KL else '') + ' des abgebenden Bestandsinhabers.'),
 ('OB729 – Vermittlerkommunikation',
  'Auslesen der zur Agenturnummer hinterlegten E-Mail-Adresse des übernehmenden Vermittlers (Kapitel „III. Übernehmender Makler“, '
  'Schritt „E-Mail-Adresse des übernehmenden Vermittlers ermitteln“); nur, wenn der Vermittler nicht in der Sonderliste TOP-Makler steht.'),
 ('GH040 – Anbindung Vermittler',
  'Prüfung des Anbindungsstatus des übernehmenden Vermittlers und des abgebenden Bestandsinhabers über die Zeile „Status der '
  'Beschäftigung“ (Wert hinter „=“: aktiv / inaktiv).'),
 ('Sonderliste TOP-Makler',
  'Fest hinterlegte Liste der Vermittler mit eigener E-Mail-Adresse für die Antwort auf BÜ-Anfragen (Agentur-Nr., Agentur-Name, '
  'E-Mail-Adresse; siehe Kapitel „III. Übernehmender Makler“). Die Liste gilt einmalig und wird nicht laufend gepflegt.'),
 ('Notizanwendung Robotics (' + ('Vorlage 1515 „Bestandsübertragung Robotics PB“' if KL else 'Vorlage BOT2011, Feldumfang wie Vorlage 1515') + ')',
  'Erstellung der Telefonnotiz für den nachgelagerten 72-Stunden-BOT und BÜ-BOT. Der Prüf-Bot bestückt die Notiz Feld für '
  'Feld (siehe Kapitel „VI. Abschluss ohne Befund“); die Weiterverarbeitung erfolgt asynchron.'),
 ('ErgoNotiz' + ('' if KL else ' (Vorlage 2011)'),
  'Bearbeitungshinweis am Postkorbvorgang bei Befund: Abschnitte „BE:“, „Fehler:“ und „Hinweis:“ (siehe Kapitel „VII. Abschluss '
  'mit Befund“). Schreibender Zugriff nur in diesem Schritt' + ('; Anwendung und Vorlage für Komposit / Leben durch den Fachbereich zu bestätigen.' if KL else '.')),
 ] + ([('ODPB',
  'Nachbearbeitung der Vorgänge mit Befund, wenn der abgebende Bestandsinhaber dem Makler- oder Kooperationsvertrieb angehört (Kapitel „VII. Abschluss mit Befund“). '
  'Themenpostkorb „ODPP1 D - Ma/Ma Bestandsübertragungen“ (Postkorb-Nr. TBD; Bezeichnung K. Rypa, 25.09.2026).')] if KL else []) + [
 ('72-Stunden-BOT',
  'Nachgelagerter Bot, an den der Prüf-Bot alle Vorgänge ohne Befund übergibt. Er erkennt selbst, ob der abgebende Bestandsinhaber '
  'der Ausschließlichkeitsorganisation (AO) zugeordnet ist, wahrt in diesem Fall die 72-Stunden-Frist und gibt alle übrigen '
  'Vorgänge ohne Wartezeit an den BÜ-BOT weiter (spartenübergreifend). Übergabe an den Themenpostkorb „HSB4 K 72 - Erstinformation“ (Postkorb-Nr. TBD).'),
 ('Outlook (Bot-Postfach)',
  'Standard-Postfach des Roboters für Betriebsinformationen und die Weiterleitung von Irrläufern. Der Prüf-Bot versendet keine '
  'Ablehnungen; Vorgänge mit Befund gehen mit Bearbeitungshinweis in die manuelle Bearbeitung.'),
]
t_sys = d.tables[1]
zeilen_anpassen(t_sys, len(SYSTEME) + 1)
for r, (a, b) in zip(t_sys.rows[1:], SYSTEME):
    setze_zelle(r.cells[0], [a])
    setze_zelle(r.cells[1], [b])

# ------------------------------------------------- 3. Involvierte Geschaeftsbereiche, Ziel, Kurzbeschreibung
BEREICH = 'Betrieb Komposit / Leben' if KL else 'Betrieb Gesundheit / Krankenversicherung'
for tb in (d.tables[2], d.tables[3]):
    for r in tb.rows[1:]:
        setze_zelle(r.cells[2], [BEREICH])
setze_zelle(d.tables[2].rows[1].cells[4],
    ['Sichtung des Postkorbvorgangs, Prüfung der eingereichten Unterlagen (Maklervollmacht, Untervollmacht), Abgleich des '
     'Versicherungsnehmers in IS011 und Prüfung des Vertrags in VA230.'])
setze_zelle(d.tables[2].rows[2].cells[4],
    ['Prüfung des abgebenden Bestandsinhabers und des übernehmenden Vermittlers in OB726 und GH040, Erstellung der Notiz für '
     'den 72-Stunden-BOT bzw. Übergabe an die manuelle Nachbearbeitung.'])
setze_zelle(d.tables[3].rows[1].cells[4],
    ['Die formale Vorprüfung (Ausschlusskriterien aus dem KI-Deckblatt, Versicherungsnehmer, abgebender Bestandsinhaber, '
     'übernehmender Vermittler, Vertragsstatus) wird durch den Prüf-Bot durchgeführt. Manuell bleiben nur die Vorgänge mit Befund.'])
setze_zelle(d.tables[3].rows[2].cells[4],
    ['Bearbeitung der Vorgänge mit Business Exception oder Prüfnotiz ' +
     ('im Themenpostkorb „HSB4 K KO Komposit / Leben Posteingang“ (abgebender Bestandsinhaber AO) bzw. „ODPP1 D - Ma/Ma Bestandsübertragungen“ (Makler- und Kooperationsvertrieb)' if KL else 'im Themenpostkorb „HSB4 K MV Gesundheit Posteingang“') +
     ' auf Basis des Bearbeitungshinweises des Prüf-Bots.'])

setze_text(finde_absatz('Vorgänge ohne Business Exception werden mit einer vollständig', anfang=True),
    'Vorgänge ohne Befund werden mit einer vollständig bestückten Notiz an den 72-Stunden-BOT übergeben, der die Weitergabe an den '
    'nachgelagerten BÜ-BOT steuert. Die Sachbearbeitung bearbeitet nur noch die Vorgänge mit Befund; sie erhält dazu den '
    'Bearbeitungshinweis des Prüf-Bots ohne Liegezeit.')
setze_text(finde_absatz('Der Prüf-Bot sammelt zunächst alle Prüfergebnisse', anfang=True),
    'Harte Ausschlusskriterien (Business Exceptions) beenden die Prüfung sofort. Abweichungen, die kein Ausschlusskriterium sind, '
    'werden als Prüfnotizen in der Fehlerliste gesammelt; erst nach allen Einzelprüfungen entscheidet der Test auf Fehlerliste, ob '
    'der Vorgang mit Notiz an den 72-Stunden-BOT übergeben oder mit Bearbeitungshinweis an die Sachbearbeitung gegeben wird. Der '
    'Prüf-Bot lehnt nicht ab und versendet nichts an Vermittler oder Kunden.')
ersetze_ueberall([('Versicherungsnehmers in IS100 gegen die Vorgangsdaten', 'Versicherungsnehmers in IS011 gegen die Vorgangsdaten'),
                  ('Kapitel „Welche Daten werden aus dem Eingangskanal verwendet“', 'Kapitel „Tabelle der genutzten Variablen“')])
setze_text(finde_absatz('Der Prüf-Bot bearbeitet je Lauf', anfang=True),
    'Der Prüf-Bot bearbeitet je Lauf einen BÜ-Vorgang aus dem Themenpostkorb. Zu jedem Vorgang liegen die Vorgangsdaten im '
    'Datenpool in den Feldern BUE_* vor. Wie der Datenpool befüllt wird, ist nicht Gegenstand dieses PDD.')

GLIEDERUNG = [
 'Start – Vorgang aus dem Themenpostkorb übernehmen: Postkorbvorgang öffnen, <Vorgang-Lfd-Nr> und <Vorgang-VNR> lesen, die '
 'Felder BUE_* aus dem Datenpool übernehmen, die Variablen für das BE-Handling initialisieren.',
 'Vorprüfung – Business Exceptions aus dem KI-Deckblatt: eine fehlende Agenturnummer (<BUE_AGENTUR_NR>) führt zur BE „Agenturnummer '
 'nicht vorhanden“, ein fehlender Vermittlertyp zu einer Prüfnotiz; beim Mehrfachagenten zählen der BÜ-Wunsch und der auf ihn ausgestellte '
 'Betreuungswunsch, beim Makler die Unterschrift des Versicherungsnehmers auf der Maklervollmacht; Mängel der Unterlagenprüfung '
 'führen nicht zum Ausschluss, sondern zu einer Prüfnotiz in <Fehlerliste>. Geprüft wird ausschließlich gegen das KI-Deckblatt, '
 'ohne Hostzugriff. Eine Prüfung der Klassifikation entfällt: Der Prüf-Bot wird nur durch Vorgänge ausgelöst, die als '
 'Bestandsübertragung in den Themenpostkorb gestellt wurden.',
 'I. Kunde (VN) – Partnerprüfung über IS011: Kundennummer des Versicherungsnehmers über die Versicherungsnummer, Matchcodesuche '
 'mit den Angaben aus dem Auftrag (Geburtsdatum als Suchfeld, bei leerer Trefferliste einmal ohne), Abgleich der Kundennummern; '
 'Geburtsdatum danach als Gegenprobe, wenn der Auftrag eines nennt.',
 'II. Abgebender Bestandsinhaber: Agentur-Nr. aus VA230, PNR über OB726, Anbindungsstatus in GH040.',
 'III. Übernehmender Makler – Agenturnummer und Vermittler-Nr. (PNR): Einstieg in OB726 über die Agenturnummer, PNR, Name und '
 'Klassifizierung, Anbindungsprüfung in GH040, E-Mail-Adresse über Sonderliste, OB726 und Datenpool.',
 'IV. Vertrag: Vertragsstatus in VA230' + ('; bei KR Prüfung auf Flottenvertrag (Feld „Sparte/Vers.Art“ = „FK“).' if KL else '.'),
 'V. Test auf Fehlerliste: Ist <Fehlerliste> gefüllt, wird die BE „Nachprüfung erforderlich“ gesetzt.',
 'VI. Abschluss ohne Befund: Telefonnotiz Feld für Feld bestücken' + (' einschließlich der Anforderung von Unterlagen' if KL else '') +
 ' und den Vorgang an den 72-Stunden-BOT übergeben (Themenpostkorb „HSB4 K 72 - Erstinformation“). Eine Prüfung des Vertriebskanals des Bestandsinhabers findet im Prüf-Bot '
 'nicht statt; der 72-Stunden-BOT erkennt AO-Bestandsinhaber selbst, wahrt die Frist und leitet alle übrigen Vorgänge direkt '
 'an den BÜ-BOT weiter.',
 'VII. Abschluss mit Befund – BE-Handling: Bearbeitungshinweis in drei Abschnitten – „BE:“ mit <BE-Klassifikation>, „Fehler:“ mit '
 'den Prüfnotizen aus <Fehlerliste>, „Hinweis:“ mit den weiteren Versicherungsnummern aus <BUE_VNR> und <BUE_VNR_2>; ' + ('Weiterleitung nach dem Vertriebskanal des abgebenden Bestandsinhabers an den Themenpostkorb „HSB4 K KO Komposit / Leben Posteingang“ (AO) oder „ODPP1 D - Ma/Ma Bestandsübertragungen“ (Makler- und Kooperationsvertrieb).' if KL
                                     else 'Weiterleitung an den Themenpostkorb „HSB4 K MV Gesundheit Posteingang“.'),
]
alte = [p for p in d.paragraphs
        if p.text.startswith(('Vorprüfung – Ausschlusskriterien:', 'I. VN – Stammdaten', 'II. Übernehmender Makler –',
                              'BE-Handling:', 'Weiterleitung an den BÜ-Bot:'))]
anker = alte[0]._element
leer = anker.getprevious()
for p in alte[1:]:
    v = p._element.getprevious()
    if v is not None and not ''.join(v.itertext()).strip():
        loesche(v)
    loesche(p._element)
letzter = anker
for i, text in enumerate(GLIEDERUNG):
    if i == 0:
        absatz = alte[0]
    else:
        tr = copy.deepcopy(leer)
        letzter.addnext(tr)
        neu = copy.deepcopy(anker)
        ohne_marken(neu)
        tr.addnext(neu)
        absatz = Paragraph(neu, alte[0]._parent)
        letzter = neu
    fmt.schreibe(absatz, text, 0)
    if i == 0:
        letzter = absatz._element
letzter.addnext(copy.deepcopy(leer))

# ------------------------------------------------- 4. Ablaufdiagramm ersetzen
for art, obj, el in elemente():
    if art == 'p' and 'wpg:wgp' in obj._element.xml:
        alt = [x for x in el.iter(qn('w:drawing'))][0]
        neu = parse_xml(zeichnung_v10.ablaufdiagramm('KL' if KL else 'KV'))
        alt.getparent().replace(alt, neu)
        ac = neu.getparent()
        MC = '{http://schemas.openxmlformats.org/markup-compatibility/2006}AlternateContent'
        while ac is not None and ac.tag != MC:
            ac = ac.getparent()
        if ac is not None:                      # nur die neue Zeichnung behalten, kein alter Fallback
            ac.getparent().replace(ac, neu)
        break

# ------------------------------------------------- 5. Betriebsparameter: Datensicherheit, Ansprechpartner, Fallback
t_ds = d.tables[4]
if KL:
    setze_zelle(t_ds.rows[1].cells[1], ['Nein. Im Komposit- und Lebensgeschäft liest der Roboter ausschließlich Vertrags-, Partner- und '
        'Vermittlerstammdaten. Gesundheitsdaten aus der Risikoprüfung werden nicht gelesen.'])
    setze_zelle(t_ds.rows[2].cells[1], ['Nein. Es werden keine Daten nach Art. 9 oder 10 DSGVO gelesen; bei Verträgen mit Bezug zur '
        'Risikoprüfung (Leben/BU) beschränkt sich der Zugriff auf Vertragsstatus, Versicherungsnehmer und Vermittler.'])
setze_zelle(t_ds.rows[3].cells[1], ['Die Vorgangsdaten im Datenpool sowie die Bildschirminhalte aus IS011 einschließlich Scout-Service, VA230, OB726, OB729 und GH040 '
    'enthalten Personendaten und sind als C3 (vertraulich) einzustufen. Die Reports des Roboters enthalten ausschließlich '
    'C2-Daten (Ordnungsbegriff, Status, Tags).'])
setze_zelle(t_ds.rows[4].cells[1], ['Die Verarbeitung erfolgt vollständig innerhalb der ITERGO-Infrastruktur; es findet keine Ablage '
    'außerhalb von Postkorb, Notiz und Datenpool statt. Die Screenshots in diesem PDD zeigen Testdaten der Abnahmeumgebung (durch den '
    'Fachbereich zu bestätigen; andernfalls sind Name, Anschrift, Geburtsdatum, Telefonnummer und Kundennummer zu schwärzen). '
    'Reports enthalten nur die Vorgang-Lfd-Nr, Status und Tags – keine Klarnamen, Geburtsdaten oder Anschriften. Der Prüf-Bot '
    'versendet keine fachlichen E-Mails an Vermittler oder Kunden; aus dem Bot-Postfach gehen nur Betriebsinformationen und '
    'weitergeleitete Irrläufer an interne Verteiler. Die E-Mail-Adresse des Vermittlers wird nur in die Notiz übernommen; interne '
    'Adressen (enthält „@ergo“) werden durch die Absenderadresse aus dem Datenpool ersetzt und andernfalls als Prüfnotiz gemeldet.'])
t_ap = d.tables[5]
setze_zelle(t_ap.rows[4].cells[1], ['Dirk Amend (HS), Christoph-Reber Lucht (ODPP)'])
if KL:
    for r in t_ap.rows[1:]:
        setze_zelle(r.cells[1], [' '.join(r.cells[1].text.split()).replace('Gesundheit (KV)', 'Komposit / Leben')])
        setze_zelle(r.cells[2], ['Betrieb Komposit / Leben'])
ersetze_ueberall([('bleiben die Vorgänge unverändert im EWMS-Postkorb liegen', 'bleiben die Vorgänge unverändert im Themenpostkorb liegen'),
                  ('erst am Prozessende weiterleitet oder ablegt', 'erst am Prozessende weiterleitet'),
                  ('in der Reihenfolge des Eingangsdatums nach', 'in der Reihenfolge des Eröffnungsdatums nach')])

# ------------------------------------------------- 6. Reporting: Inhalt der Reports
alt_tags = {
 'Tag „Ergebnis“: Notiz bestückt / Ablehnung versendet / Aussteuerung': 'Tag „Ergebnis“: Notiz bestückt / Befund',
 'Tag „Ablehnungsgrund“: der priorisierte harte Ablehnungsgrund (siehe Kapitel Auswertung und Priorisierung)':
     'Tag „BE-Klassifikation“: Grund der Business Exception (siehe Kapitel „VII. Abschluss mit Befund“)',
 'Tag „Vermerk“: Anzahl und Art der weichen Abweichungen (Vorname, Geburtsdatum, Straße, PLZ)':
     'Tag „Prüfnotizen“: alle Einträge der <Fehlerliste>',
}
for p in d.paragraphs:
    t = p.text.strip()
    if t in alt_tags:
        setze_text(p, alt_tags[t])

# ------------------------------------------------- 7. Eingangskanal
setze_text(finde_absatz('Der Prozess startet mit der Eröffnung', anfang=True),
    'Der Prozess startet mit der Eröffnung eines Postkorbvorgangs im Themenpostkorb des Prüf-Bots. Celonis eröffnet den Vorgang '
    'über die EMWS-Schnittstelle je Versicherungsnummer mit der E-Mail, allen Anhängen und dem KI-Deckblatt; zu diesem '
    'Zeitpunkt liegen die Vorgangsdaten vollständig im Datenpool vor. Wie der Datenpool befüllt wird, ist nicht Gegenstand '
    'dieses PDD.')
setze_text(finde_absatz('Informationen zum Themenpostkorb', anfang=True), 'Informationen zum Themenpostkorb')
setze_text(finde_absatz('Nein: Der Vorgang liegt in einem', anfang=True),
    'Der Vorgang liegt im Themenpostkorb des Prüf-Bots und wird von dort vom Roboter geholt. Celonis stellt je Versicherungsnummer '
    'einen Vorgang ein; künftig können auch Bestandsübertragungen aus der Sparte in diesen Postkorb weitergeleitet werden, wenn '
    'dort zuerst ein anderes Anliegen zu bearbeiten war.')
p_pk = finde_absatz('Vorgang-Lfd-Nr des Postkorbvorgangs', anfang=True)
letzter_pk = p_pk._element
for zeile in ['Versicherungsnummer des Postkorbvorgangs (<Vorgang-VNR>, durch Celonis normiert; Einstieg für alle Hostaufrufe)',
              'Eröffnungsdatum des Postkorbvorgangs (Bearbeitungsreihenfolge; Ersatzwert für <Eingangsdatum-BUE>)',
              ('GeVo 108' if KL else 'Dokumenttyp 2015')]:
    neu_pk = copy.deepcopy(letzter_pk)
    ohne_marken(neu_pk)
    letzter_pk.addnext(neu_pk)
    fmt.schreibe(Paragraph(neu_pk, d), zeile, 0)
    letzter_pk = neu_pk
fmt.schreibe(p_pk, 'Vorgang-Lfd-Nr des Postkorbvorgangs (<Vorgang-Lfd-Nr>, Ordnungsbegriff des Roboters)', 0)
t7 = d.tables[7]
PK = 'Themenpostkorb „MV 23724 BÜ Prüf BOT“, Postkorb-Nr. 23724'
GEVO = 'Dokumenttyp 2015' if not KL else 'GeVo 108 (Bestandsübertragung)'
setze_zelle(t7.rows[1].cells[1], ['Abnahmeumgebung: TBD (Robotics)'])
setze_zelle(t7.rows[1].cells[2], [PK + '; ' + GEVO])
t8 = d.tables[8]
zeilen_anpassen(t8, 2)
setze_zelle(t8.rows[1].cells[0], ['Postkorbvorgang mit Datensatz im Datenpool'])
setze_zelle(t8.rows[1].cells[1], ['Zum Vorgang existiert ein Datensatz im Datenpool zu <Vorgang-Lfd-Nr> (Felder BUE_…), und der Vorgang '
    'wurde vom Roboter noch nicht bearbeitet (gleiche <Vorgang-Lfd-Nr> wird nicht erneut verarbeitet). Bearbeitung in der '
    'Reihenfolge des Eröffnungsdatums.'])
setze_zelle(t8.rows[1].cells[2], ['TBD (Postkorb für Vorgänge ohne Datensatz im Datenpool – durch Fachbereich zu benennen)'])
setze_zelle(t8.rows[1].cells[3], ['„Kein Datensatz im Datenpool zu <Vorgang-Lfd-Nr>“'])
t9 = d.tables[9]
zeilen_anpassen(t9, 2)
setze_zelle(t9.rows[1].cells[0], ['Business Exception oder Prüfnotiz (Befund)'])
setze_zelle(t9.rows[1].cells[1], ['TBD (Abnahmeumgebung)'])
setze_zelle(t9.rows[1].cells[2], [('Abgebender Bestandsinhaber AO: Themenpostkorb „HSB4 K KO Komposit / Leben Posteingang“ – Postkorb-Nr. TBD; Makler- und Kooperationsvertrieb: Themenpostkorb „ODPP1 D - Ma/Ma Bestandsübertragungen“ – Postkorb-Nr. TBD.'
                                    if KL else 'Themenpostkorb „HSB4 K MV Gesundheit Posteingang“ – Postkorb-Nr. TBD.') +
                                   ' Bearbeitungshinweis in drei Abschnitten: „BE:“ <BE-Klassifikation>, „Fehler:“ alle Prüfnotizen aus <Fehlerliste>, '
                                   '„Hinweis:“ weitere Versicherungsnummern (siehe Kapitel „VII. Abschluss mit Befund“)'])

def faerbe_zelle(zelle):
    for p in zelle.paragraphs:
        if p.text.strip():
            fmt.schreibe(p, p.text, 0)


for _z in (t8.rows[1].cells[1], t8.rows[1].cells[3], t9.rows[1].cells[2]):
    faerbe_zelle(_z)
breite(t8, [16, 40, 24, 20])
breite(t9, [22, 30, 48])
breite(t7, [16, 30, 54])
breite(d.tables[6], [18, 52, 30])

# ------------------------------------------------- 8. Design
t10 = d.tables[10]
setze_zelle(t10.rows[1].cells[1], ['Ein Postkorbeingang.', 'Genauer: ein Bestandsübertragungs-Vorgang im Themenpostkorb des Prüf-Bots '
    'mit den zugehörigen Vorgangsdaten im Datenpool.'])
setze_zelle(t10.rows[4].cells[1], ['Ja, jedoch nur vollständig von vorne.', 'Der Prüf-Bot speichert keine Zwischenstände. Ein abgebrochener '
    'Vorgang wird beim Wiederanlauf komplett neu durchlaufen.', 'Die Prüfschritte in IS011 einschließlich Scout-Service, VA230, OB726 '
    'und GH040 sowie OB729 sind lesend. Schreibende Schritte sind die Telefonnotiz (Kapitel „VI. Abschluss ohne Befund“), der Bearbeitungshinweis '
    '(Kapitel „VII. Abschluss mit Befund“) und die jeweilige Weiterleitung am Prozessende; ein Wiederanlauf ist zulässig, solange diese '
    'noch nicht erfolgt sind.'])
t11 = d.tables[11]
setze_zelle(t11.rows[1].cells[1], ['Celonis eröffnet den Postkorbvorgang je Versicherungsnummer über die EMWS-Schnittstelle und '
    'befüllt den Datenpool; die E-Mail mit allen Anhängen und dem KI-Deckblatt hängt am Vorgang.'])
for _z in (t10.rows[1].cells[1], t10.rows[4].cells[1], t11.rows[1].cells[1]):
    faerbe_zelle(_z)
ersetze_ueberall([('Vorgangsdokumente unterliegen dem Löschkonzept des EWMS', 'Vorgangsdokumente unterliegen dem Löschkonzept des Postkorbs')])

for _p in d.paragraphs:
    if _p.text.strip() == 'Synchronität des Prozesses' and _p.style.name == 'Table Heading':
        _p.style = 'Heading 2'
# M9/M11/N4: Template-Reste und Tippfehler
ersetze_ueberall([('Business Exceptiones', 'Business Exceptions'), ('Quartärlich (Quaterly-Report)', 'Quartalsweise (Quarterly-Report)'),
                  ('nachträglich gerändert werden', 'nachträglich geändert werden'), ('Rahmenbedigungen', 'Rahmenbedingungen'),
                  ('„Schritt-für-Schritt-Dokumentation“', '„Schritt für Schritt-Beschreibung“'), ('Kapitel „Schritt-für-Schritt-Beschreibung“', 'Kapitel „Schritt für Schritt-Beschreibung“'),
                  ('Postkorb-Nr. und Nr. Produktion', 'Postkorb-Nr. und Name Produktion'), ('Postkorb, an den Weitergeleitet wird', 'Postkorb, an den weitergeleitet wird')])
for _tb in (d.tables[10],):
    for _r in _tb.rows[1:3]:
        for _p in _r.cells[0].paragraphs:
            if 'Nicht zutreffendes bitte Löschen' in _p.text:
                loesche(_p._element)
setze_zelle(d.tables[0].rows[1].cells[3], ['–'])
for _p in list(d.tables[9].rows[0].cells[2].paragraphs):
    if not _p.text.strip() and len(d.tables[9].rows[0].cells[2].paragraphs) > 1:
        loesche(_p._element)
# ------------------------------------------------- 9. Variablentabelle
VAR = [
 ('BUE_VERMITTLER_TYP', 'Typ des übernehmenden Vermittlers', 'Datenpool', 'optional',
  'Feld_Format CH. Werteliste aus dem EMMA-Abgleich der Agenturnummer: Makler, MFA (Mehrfachagent), Courtagefortzahler, Kontaktgeber; leer und '
  '„Fremdversicherungsunternehmen“ werden wie Makler behandelt (M. Koch / S. Schwarz, 24.09.2026). Courtagefortzahler und Kontaktgeber führen in der '
  'Vorprüfung zur BE „Keine Bestandsübertragung möglich“; sonst steuert das Feld, ob die Kriterien für Makler oder für Mehrfachagenten gelten. Im '
  'Makler-Zweig muss eine unterschriebene Maklervollmacht vorliegen. Der Abgleich mit der OB726-Klassifizierung folgt im Kapitel „III. Übernehmender Makler“.'),
 ('BUE_KUNDE_NACHNAME', 'Nachname des Versicherungsnehmers', 'Datenpool, Feld „Kunde_Nachname“', 'Pflichtfeld',
  'Feld_Format CH. Suchbegriff „Zuname“ der Matchcodesuche in IS011. Keine Ziffern, nur Buchstaben und Sonderzeichen.'),
 ('BUE_KUNDE_VORNAME', 'Vorname des Versicherungsnehmers', 'Datenpool, Feld „Kunde_Vorname“', 'Pflichtfeld',
  'Feld_Format CH. Die ersten zwei Buchstaben gehen als Suchbegriff „Vorname“ in die Matchcodesuche ein.'),
 ('BUE_KUNDE_GEBDAT', 'Geburtsdatum des Versicherungsnehmers', 'Datenpool, Feld „Geburtsdatum VN“', 'optional',
  'Feld_Format DA. Format tt.mm.jjjj. Suchbegriff der Matchcodesuche (drei Felder TT MM JJJJ); bleibt die Trefferliste leer, wird einmal '
  'ohne Geburtsdatum gesucht. Danach Gegenprobe gegen <IS011-Gebdat>, eine Abweichung ist eine Prüfnotiz. Ist das Feld leer (in der Regel '
  'juristische Person), entfällt beides.'),
 ('BUE_KUNDE_STRASSE', 'Straßenname und Hausnummer des Versicherungsnehmers', 'Datenpool, Feld „Kunde_Strasse“', 'optional',
  'Feld_Format CH. Der Datenpool liefert „Straße“ grundsätzlich als „Str.“; in die Matchcodesuche gehen nur die ersten zwei Buchstaben ein.'),
 ('BUE_KUNDE_PLZ', 'Postleitzahl des Versicherungsnehmers', 'Datenpool, Feld „Kunde_PLZ“', 'optional',
  'Feld_Format CH. 5 Ziffern. Suchbegriff „PLZ/Ort“ der Matchcodesuche.'),
 ('BUE_KUNDE_ORT', 'Wohnort des Versicherungsnehmers', 'Datenpool, Feld „Kunde_Ort“', 'optional',
  'Feld_Format CH. Wird vom Prüf-Bot nicht gelesen.'),
 ('BUE_VNR', 'Versicherungsnummer(n) des zu übertragenden Vertrags aus der KI-Auslesung', 'Datenpool, Feld „Versicherungsnummer“', 'Pflichtfeld',
  'Feld_Format CH. Durch Celonis normiert: zwei Buchstaben Spartenkürzel und neun Ziffern (11 Zeichen), mehrere Nummern semikolongetrennt; '
  'Ersatzwert „Manuelle Prüfung VNR/Sparte“. Wird nicht für die Hostaufrufe genutzt (dafür <Vorgang-VNR>) und nicht gegen diese '
  'abgeglichen, sondern führt nachrichtlich alle im Auftrag genannten Nummern für Notiz und Bearbeitungshinweis.'),
 ('BUE_VNR_2', 'Weitere Versicherungsnummern (Ersatzfeld, damit keine Nummer abgeschnitten wird)', 'Datenpool, Feld „Versicherungsnummer_2“', 'optional',
  'Feld_Format CH. Gleiches Format wie BUE_VNR. Nimmt die Versicherungsnummern auf, die in BUE_VNR nicht mehr in die Feldlänge passen.'),
 ('BUE_SPARTE', 'Spartenkürzel des Vertrags aus der normierten Versicherungsnummer', 'Datenpool, Feld „Sparte“', 'Pflichtfeld',
  'Feld_Format CH. Zwei Buchstaben je Versicherungsnummer, mehrere semikolongetrennt in der Reihenfolge von BUE_VNR; Ersatzwert '
  '„Manuelle Prüfung VNR/Sparte“. ' + ('Steuert im Kapitel „IV. Vertrag“ die Prüfung auf Flottenvertrag bei „KR“ und das Notizfeld '
                                       '„Komposit / Leben / KV“; bei mehreren Kürzeln gilt das an der Position der <Vorgang-VNR>.' if KL
                                       else 'Wird vom Prüf-Bot nicht gelesen; die Sparte ist durch Dokumenttyp 2015 und das Spartenkürzel der <Vorgang-VNR> vorgegeben.')),
 ('BUE_MV_VN_NACHNAME', 'Nachname des Vollmachtgebers laut Maklervollmacht', 'Datenpool, Feld „MV_VN_Nachname“', 'Pflichtfeld wenn MV enthalten',
  'Feld_Format CH. Wird vom Prüf-Bot nicht gelesen; ein Abgleich gegen den Versicherungsnehmer findet nicht statt.'),
 ('BUE_MV_VN_VORNAME', 'Vorname des Vollmachtgebers laut Maklervollmacht', 'Datenpool, Feld „MV_VN_Vorname“', 'optional',
  'Feld_Format CH. Wird vom Prüf-Bot nicht gelesen.'),
 ('BUE_POOL', 'Maklerpool bzw. Abwickler, über den eingereicht wird', 'Datenpool, Feld „Pool“', 'optional',
  'Feld_Format CH. Konsolidierter Poolname oder leer. Steuert zusammen mit BUE_UV_ERTEILT das Notizfeld „Bearbeitung nach“.'),
 ('BUE_VERMITTLER_NAME', 'Name des übernehmenden Maklerunternehmens bzw. der Person', 'Datenpool, Feld „Vermittler“', 'Pflichtfeld',
  'Feld_Format CH. Wird vom Prüf-Bot nicht gelesen; der Name in der Notiz stammt aus OB726 (<OB726-Name>).'),
 ('BUE_AGENTUR_NR', 'Agenturnummer des übernehmenden Vermittlers beim Versicherer', 'Datenpool, Feld „Agentur-Nr“', 'Pflichtfeld',
  'Feld_Format CH. Wird von EMMA ohne das Präfix „A“ und ohne Kommata oder sonstige Trennzeichen geliefert (nur Ziffern), 7 bis 9 '
  'Ziffern; achtstellige Werte sind die neuen Agenturen nach ZAV. Einstieg in OB726 und Feld „Agenturnummer“ der Notiz. Ist das Feld '
  'leer, wird in der Vorprüfung die BE „Agenturnummer nicht vorhanden“ gesetzt; kennt OB726 die Nummer nicht (Hinweistext IS0042I), '
  'die BE „Agenturnummer in OB726 unbekannt“.'),
 ('BUE_VERMITTLER_NR', 'Personal- bzw. Vermittlernummer (PNR) des übernehmenden Vermittlers', 'Datenpool, Feld „Personalnummer“', 'optional',
  'Feld_Format CH. Nur Ziffern; bisherige PNR mit weniger als 7 Stellen, neue PNR 7-stellig. Ist das Feld gefüllt, wird es links mit '
  'Nullen auf 7 Stellen aufgefüllt und als <OB726-PNR> übernommen; sonst wird die PNR in OB726 gelesen.'),
 ('BUE_MAKLER_EMAIL', 'Absenderadresse der Mail, mit der der Vorgang eingereicht wurde', 'Datenpool, Feld „Makler_E-Mail“', 'Pflichtfeld',
  'Feld_Format CH. Quelle für <Makler-Email>, wenn kein Eintrag in der Sonderliste TOP-Makler vorliegt und die in OB726 hinterlegte '
  'Adresse fehlt oder intern ist (enthält „@ergo“).'),
 ('BUE_MAKLER_STRASSE', 'Straßenname und Hausnummer des Maklers', 'Datenpool, Feld „Makler_Strasse“', 'optional',
  'Feld_Format CH. Wird vom Prüf-Bot nicht gelesen.'),
 ('BUE_MAKLER_PLZ', 'Postleitzahl des Maklers', 'Datenpool, Feld „Makler_PLZ“', 'optional', 'Feld_Format CH. Wird vom Prüf-Bot nicht gelesen.'),
 ('BUE_MAKLER_ORT', 'Ort des Maklers', 'Datenpool, Feld „Makler_Ort“', 'optional', 'Feld_Format CH. Wird vom Prüf-Bot nicht gelesen.'),
 ('BUE_KLASSIFIKATION', 'Fachliche Einordnung des Anliegens', 'Datenpool, Feld „Klassifikation“', 'Pflichtfeld',
  'Feld_Format CH. Werteliste: BÜ-Vorgang, Kündigung Maklervollmacht, VN-Wechsel, WEG-Wechsel, Kündigung Versicherungsvertrag, '
  'Verkürzung Kündigungsfrist, Sonstige Fachthemen, Nicht-Standard, Kein-Makler-Vorgang (Abstimmung mit Celonis und Fachbereich '
  'läuft). Wird vom Prüf-Bot nicht gelesen: Der Themenpostkorb enthält nur Bestandsübertragungen.'),
 ('BUE_WUNSCH_VORHANDEN', 'Enthält die Mail einen ausformulierten Auftrag zur Bestandsübertragung?', 'Datenpool, Feld „BÜ-Wunsch vorhanden“', 'Pflichtfeld',
  'Feld_Format JN. Werteliste: ja, nein. Beim Mehrfachagenten führt „nein“ zur BE „BÜ-Wunsch nicht vorhanden“; beim Makler belegt '
  'die Maklervollmacht den Auftrag, das Feld wird dort nicht geprüft.'),
 ('BUE_UMFANG', 'Umfang der Bestandsübertragung', 'Datenpool, Feld „Umfang“', 'Pflichtfeld',
  'Feld_Format CH. Werteliste: Einzel (Übertragung der genannten Versicherungsnummer), Gesamt (Übertragung der gesamten '
  'Kundenverbindung). Nennt der Auftrag mehrere Versicherungsnummern, eröffnet Celonis je Nummer einen eigenen Vorgang. Die Notiz '
  'beauftragt unabhängig vom Wert immer eine Einzel-BÜ für die <Vorgang-VNR> (Auswahl „Betroffene VNR“ = „angegebene VNR beachten“).'),
 ('BUE_PRUEFUNG_UNTERLAGEN', 'Abgeleitete Vollständigkeitsprüfung der eingereichten Unterlagen', 'Datenpool, Feld „Prüfung Unterlagen“', 'Pflichtfeld',
  'Feld_Format CH. Werteliste: leer, „Reminder - keine Vollst.-Prüfung“, „Vollständig“, „BÜ-Wunsch fehlt“, „MV fehlt“, „MV '
  'unvollständig“, „VN-Unterschrift fehlt“. Mehrere Mängel kommagetrennt. Fachliche Ausprägung der Unterlagenprüfung, nur im '
  'Makler-Zweig geprüft; bei MFA nicht belegt. Ein Mangel (jeder Wert außer „Vollständig“, leer und „Reminder - keine Vollst.-Prüfung“) '
  'führt zur Prüfnotiz „Unterlagen nicht vollständig: <Feldwert>“ in <Fehlerliste>.'),
 ('BUE_REMINDER', 'Handelt es sich um eine Erinnerung zu einem bereits eingereichten Vorgang?', 'Datenpool, Feld „Reminder/Wiedervorlage“', 'Pflichtfeld',
  'Feld_Format JN. Werteliste: ja, nein. Wird vom Prüf-Bot nicht gelesen; eine Erinnerung wird wie jeder andere '
  'Vorgang geprüft. Der zugehörige Wert „Reminder - keine Vollst.-Prüfung“ in BUE_PRUEFUNG_UNTERLAGEN löst keine Prüfnotiz aus.'),
 ('BUE_MV_ENTHALTEN', 'Liegt der Mail eine Maklervollmacht bei?', 'Datenpool, Feld „MV enthalten“', 'Pflichtfeld',
  'Feld_Format CH. Ausprägungen: ja, nein, N/A. N/A bei MFA, dort ist keine Maklervollmacht erforderlich. Bewertung in BUE_PRUEFUNG_UNTERLAGEN enthalten; wird vom Prüf-Bot nicht gelesen.'),
 ('BUE_MV_STATUS', 'Zusammenfassender Status der Maklervollmacht', 'Datenpool, Feld „MV-Status“', 'Pflichtfeld',
  'Feld_Format CH. Ausprägungen: OK, MV unvollständig, MV fehlt, kein Anhang, nicht prüfbar, N/A (bei MFA). Bewertung in BUE_PRUEFUNG_UNTERLAGEN enthalten; wird vom Prüf-Bot nicht gelesen.'),
 ('BUE_MV_AUF_MAKLER', 'Ist die Vollmacht bzw. der Betreuungswunsch auf den übernehmenden Vermittler ausgestellt?', 'Datenpool, Feld „MV auf Makler ausgestellt“', 'optional',
  'Feld_Format CH. Ausprägungen: ja, nein, nicht prüfbar. Makler: Bewertung bereits in BUE_PRUEFUNG_UNTERLAGEN enthalten. MFA: hartes '
  'Kriterium, der Betreuungswunsch muss auf den MFA lauten (BE „Betreuungswunsch nicht auf MFA ausgestellt“).'),
 ('BUE_MV_VOLLUMFAENGLICH', 'Deckt die Vollmacht den gesamten Bestand ab?', 'Datenpool, Feld „MV vollumfänglich“', 'optional',
  'Feld_Format CH. Ausprägungen: ja, teilweise, nein, nicht prüfbar, N/A (bei MFA). Wird vom Prüf-Bot nicht gelesen; die Bewertung ist bereits in BUE_PRUEFUNG_UNTERLAGEN enthalten.'),
 ('BUE_MV_UNTERSCHRIFT_KUNDE', 'Hat der Versicherungsnehmer die Maklervollmacht unterschrieben?', 'Datenpool, Feld „Unterschrift Kunde“', 'Pflichtfeld beim Makler',
  'Feld_Format CH. Ausprägungen: ja, nein, nicht prüfbar. Makler: hartes Kriterium, jeder andere Wert als „ja“ führt zur BE „Unterschrift '
  'VN fehlt“. MFA: nicht geprüft, der Mehrfachagent hat keine Maklervollmacht. Der Feldname nutzt die maximal zulässigen 25 Zeichen.'),
 ('BUE_UV_ERTEILT', 'Untervollmacht erteilt: liegt vor, Unterbevollmächtigter namentlich benannt, Übertragung erkennbar an ihn', 'Datenpool, Feld „Untervollmacht erteilt“', 'Pflichtfeld',
  'Feld_Format CH. Ausprägungen: ja, nein, N/A. N/A bei MFA. Steuert zusammen mit BUE_POOL das Notizfeld „Bearbeitung nach“ '
  '(„Untervollmacht fehlt“ bei Pool ohne erteilte Untervollmacht).'),
 ('BUE_MV_UNTERSCHRIFTSDATUM', 'Datum, an dem der Kunde die Maklervollmacht bzw. den Betreuungswunsch unterschrieben hat', 'Datenpool, Feld „MV_Unterschriftsdatum“', 'optional',
  'Feld_Format DA. Format tt.mm.jjjj. Wird vom Prüf-Bot nicht gelesen. Der Feldname nutzt die maximal zulässigen 25 Zeichen.'),
 ('BUE_MV_EINGANGSDATUM', 'Eingangsdatum der Maklervollmacht bzw. des Betreuungswunsches', 'Datenpool, Feld „MV_Eingangsdatum“', 'Pflichtfeld',
  'Feld_Format DA. Format tt.mm.jjjj. Ist das Feld leer, wird das Eröffnungsdatum des Postkorbvorgangs verwendet. Quelle für <Eingangsdatum-BUE>.'),
 ('BUE_ANF_UNTERLAGEN', 'Kennzeichen, ob der übernehmende Makler Unterlagen zum Vertrag anfordert (Police, Vertragsspiegel, Schadenaufstellung), die ERGO ihm liefert', 'Datenpool / KI-Auslesung', 'Pflichtfeld',
  'Feld_Format JN. Werteliste: ja, nein. Unabhängig von der Vollständigkeitsprüfung der eingereichten Unterlagen (BUE_PRUEFUNG_UNTERLAGEN). ' +
  'Wird vom Prüf-Bot nicht gelesen: Ob der Makler Unterlagen anfordert, ergibt sich aus BUE_ART_UNTERLAGEN (leer oder gefüllt).'),
 ('BUE_ART_UNTERLAGEN', 'Unterlagen, die der übernehmende Makler zum Vertrag anfordert und die ERGO ihm liefert (Police, Vertragsspiegel, Schadenaufstellung)', 'Datenpool / KI-Auslesung', 'optional',
  'Feld_Format CH. Leer, wenn der Makler nichts anfordert. Mehrere Angaben mit Semikolon getrennt. Ausprägungen nach den Kennzeichen der Notizmaske 1515 „Folgearbeit für '
  'Komposit“: „Police/Vertragsspiegel/Vertragsauszug/Ersatzrechnung“, „Schadenaufstellung/Schadenrenta“, „Sonstige Unterlagen“. ' +
  ('Steuert die Kennzeichen in der Notiz (Kapitel „VI. Abschluss ohne Befund“); es entsteht weder BE noch Prüfnotiz. Unabhängig von der '
   'Vollständigkeitsprüfung der eingereichten Unterlagen (BUE_PRUEFUNG_UNTERLAGEN).' if KL else 'Für die Krankenversicherung nicht gelesen.')),
 ('Vorgang-Lfd-Nr', 'Laufende Nummer des Postkorbvorgangs; Ordnungsbegriff des Roboters', 'Themenpostkorb, Kapitel „Start“', 'Pflichtfeld',
  'Ordnungsbegriff für Queue und Reporting. Wird in der Notiz im Feld „Laufende Nr. aus Vorgangsdatenbank“ übergeben.'),
 ('Vorgang-VNR', 'Versicherungsnummer, mit der Celonis den Postkorbvorgang eröffnet hat', 'Themenpostkorb, Kapitel „Start“', 'Pflichtfeld',
  'Bereits normiert (zwei Buchstaben Spartenkürzel und neun Ziffern). Einstieg für alle Hostaufrufe (IS011, VA230, Scout-Service); '
  'eine Normierung im Bot ist nicht erforderlich. Feld „VNR“ der Notiz.'),
 ('Eingangsdatum-BUE', 'Maßgebliches Eingangsdatum des Vorgangs', 'Abgeleitet: BUE_MV_EINGANGSDATUM, sonst Eröffnungsdatum des Postkorbvorgangs', 'Pflichtfeld',
  'Format tt.mm.jjjj. Feld „Eingangsdatum“ der Notiz.'),
 ('IS011-KNR-VN', 'Kundennummer des Versicherungsnehmers zum Vertrag', 'IS011, Maske VAF017, Aufruf mit <Vorgang-VNR> als Ordnungsbegriff', 'Pflichtfeld',
  'Nummer hinter „KD“ ohne Punkt und Prüfziffer (im Screenshot gelb markiert). Referenz für den Abgleich mit der Matchcodesuche. Zeigt '
  'IS011 zur <Vorgang-VNR> keine Stammdaten, wird die BE „Vertrag zur VNR nicht gefunden“ gesetzt.'),
 ('IS011-Gebdat', 'Geburtsdatum des Versicherungsnehmers laut IS011', 'IS011, Maske VAF017, Feld „Geb.-Dat“', 'optional',
  'Format tt.mm.jjjj. Gegenprobe gegen BUE_KUNDE_GEBDAT; Abweichung als Prüfnotiz „Geburtsdatum abweichend“ in <Fehlerliste>.'),
 ('Suche-ohne-Gebdat', 'Merker, ob die Matchcodesuche bereits ohne Geburtsdatum wiederholt wurde', 'Abgeleitet, Kapitel „I. Kunde (VN)“', 'optional',
  'Bei Start leer. Wird auf „ja“ gesetzt, wenn die Suche mit Geburtsdatum keinen Treffer liefert und ohne Geburtsdatum wiederholt wird; '
  'verhindert eine zweite Wiederholung.'),
 ('IS011-KNR', 'Kundennummer des Partners, den die Matchcodesuche gefunden hat', 'IS011, Maske VAF017 nach der Matchcodesuche (genau ein Treffer)', 'optional',
  'Nummer hinter „KD“ ohne Punkt und Prüfziffer. Nur gesetzt, wenn die Matchcodesuche direkt auf einen Partner führt.'),
 ('VA230-Status', 'Status des Vertrags', 'VA230, Kapitel „IV. Vertrag“', 'Pflichtfeld',
  'Nur der Status „aktuell“ führt zur Weiterverarbeitung; jeder andere Status führt zur BE „Vertrag nicht aktuell: <VA230-Status>“, die den '
  'gelesenen Status mitführt (z. B. storniert, beitragsfrei).'),
 ('VA230-AGT-Inhaber', 'Agentur-Nr. (A…) des abgebenden Bestandsinhabers', 'VA230, Feld hinter „Betreuung“, Kapitel „II. Abgebender Bestandsinhaber“', 'Pflichtfeld',
  'Einstieg in OB726 für die PNR des Bestandsinhabers. Ist das Feld leer, wird die Prüfnotiz „Bestandsinhaber nicht ermittelbar“ gemerkt.'),
 ('OB726-AGT-Inh-PNR', 'PNR des abgebenden Bestandsinhabers', 'OB726, Aufruf mit <VA230-AGT-Inhaber>', 'Pflichtfeld',
  'Nur Ziffern ohne Präfix „P,“; führende Nullen bleiben erhalten. Einstieg in GH040 für die Anbindungsprüfung des Bestandsinhabers. '
  'Kennt OB726 die Agentur nicht (IS0042I), wird die Prüfnotiz „Bestandsinhaber nicht ermittelbar“ gemerkt.'),
 ('OB726-PNR', 'Vermittler-Nr. (PNR) des übernehmenden Vermittlers', 'OB726, Kapitel „III. Übernehmender Makler“; bei gefülltem BUE_VERMITTLER_NR direkt aus dem Datenpool', 'Pflichtfeld',
  'Feld „Personalnummer“ der Notiz und Einstieg in GH040. Nur Ziffern ohne Präfix „P,“ und ohne Trennzeichen, 7-stellig; führende Nullen bleiben erhalten.'),
 ('OB726-Name', 'Name des übernehmenden Vermittlers aus dem Bestandssystem', 'OB726, Feld „Name 1“', 'Pflichtfeld',
  'Feld „Maklername“ der Notiz. Enthält der Name „INAKTIV“, wird die BE „Keine Zusammenarbeit“ gesetzt.'),
 ('OB726-Klassifizierung', 'Klassifizierung des übernehmenden Vermittlers', 'OB726, Kopfzeile hinter der Vermittler-Nr. (P,…)', 'Pflichtfeld',
  'Text hinter der Vermittler-Nr. in der OB726-Kopfzeile. Geprüft wird nur, ob der Text „Mehrfachagent“ enthält (Abgleich mit '
  'BUE_VERMITTLER_TYP); weitere Ausprägungen wie Makler oder Courtagefortzahler werden nicht bewertet.'),
 ('OB729-Email', 'In OB729 (Vermittlerkommunikation) zur Agenturnummer hinterlegte E-Mail-Adresse des übernehmenden Vermittlers', 'OB729, Aufruf mit <BUE_AGENTUR_NR>, Kapitel „III. Übernehmender Makler“', 'optional',
  'Wird nur gelesen, wenn der Vermittler nicht in der Sonderliste TOP-Makler steht. Zwischenwert für <Makler-Email>; interne Adressen '
  '(enthält „@ergo“) werden nicht übernommen.'),
 ('Makler-Email', 'E-Mail-Adresse des übernehmenden Vermittlers für die Notiz', 'Abgeleitet, Kapitel „III. Übernehmender Makler“, Schritt „E-Mail-Adresse des übernehmenden Vermittlers ermitteln“', 'Pflichtfeld',
  'Quelle in fester Reihenfolge: Sonderliste TOP-Makler, sonst <OB729-Email>, bei fehlender '
  'oder interner Adresse BUE_MAKLER_EMAIL. Feld „E-Mail aufnehmender Makler“ der Notiz.'),
 ('BE', 'Kennzeichen, ob eine Business Exception vorliegt', 'Abgeleitet, im BE-Handling gesetzt', 'Pflichtfeld',
  'Bei Start leer. Wird im Kapitel „VII. Abschluss mit Befund“ auf „ja“ gesetzt.'),
 ('BE-Klassifikation', 'Grund der Business Exception (Klartext)', 'Abgeleitet, Vorprüfung, Prüfschritte und Test auf Fehlerliste', 'Pflichtfeld bei einer BE',
  'Bei Start leer. Wird bei einer BE gesetzt und in den Bearbeitungshinweis übernommen (Zeile „BE:“). Werteliste siehe Kapitel „VII. Abschluss mit Befund“.'),
 ('Fehlerliste', 'Liste aller gemerkten Prüfnotizen des Vorgangs', 'Abgeleitet, jede Prüfung mit „Merke Prüfnotiz … in <Fehlerliste>“', 'Pflichtfeld',
  'Bei Start leer. Jede Abweichung in den Einzelprüfungen hängt ihre Prüfnotiz an. Wird im Kapitel „V. Test auf Fehlerliste“ geprüft '
  'und im Bearbeitungshinweis übernommen (Abschnitt „Fehler:“, jede Prüfnotiz in einer eigenen Zeile). Werteliste siehe Kapitel „VII. Abschluss mit Befund“.'),
]
if KL:
    VAR.insert(VAR.index(next(v for v in VAR if v[0] == 'VA230-AGT-Inhaber')),
        ('VA230-VersArt', 'Versicherungsart aus dem Feld „Sparte/Vers.Art“ in VA230 (mittlerer Wert, z. B. „KFZ / FK / J“ → „FK“)', 'VA230 (VAF230 „Anzeige steuerrelevanter Daten“), Kapitel „IV. Vertrag“ (nur bei <BUE_SPARTE> = „KR“)', 'optional',
         '„FK“ kennzeichnet einen KR-Flottenvertrag und führt zur BE „KR Flottenvertrag“; „KR“ ist ein normaler KR-Vertrag (K. Rypa, 25.09.2026).'))
    VAR.append(('OB726-AGT-Inh-Vertriebskanal', 'Vertriebskanal des abgebenden Bestandsinhabers (vierstellige Nummer)', 'OB726, Feld „Vertriebskanal“, Aufruf mit <VA230-AGT-Inhaber>', 'optional',
                'Steuert im Kapitel „VII. Abschluss mit Befund“ das Routing: Makler- und Kooperationsvertrieb (2200, 2215, 2271, 2281, 2300, 2301, 2302, 2400) geht nach ODPP1 D, '
                'alle übrigen Kanäle gehören zur AO (z. B. 2050, 2100, 2111, 2130, 2151, 2800) und gehen nach HSB4 K KO (K. Rypa, 25.09.2026). '
                'Leer, wenn die Prüfung vor Kapitel II endet oder der Bestandsinhaber nicht ermittelbar ist; dann HSB4 K KO (Vorschlag).'))
t_var = d.tables[14]

def tabellen_schritt():
    start = finde_absatz('Schritt für Schritt-Beschreibung')._element
    aus = []
    el = start
    while True:
        el = el.getnext()
        if el is None:
            break
        if el.tag == qn('w:tbl'):
            tb = Table(el, d)
            if len(tb.rows[0].cells) == 3 and (('<w:drawing>' in el.xml) or tb.rows[0].cells[0].text.strip().startswith(('Screenshot', 'kein Screenshot')) or tb.rows[0].cells[0].text.strip() == ''):
                aus.append(tb)
    return aus


# ------------------------------------------------- 10. Schrittkapitel
T = list(d.tables)                     # Referenzen festhalten, bevor neue Tabellen eingefuegt werden
KAP_BEFUND = 'VII. Abschluss mit Befund'
def weiter(k):
    return 'Weiter zum Kapitel „' + k + '“'
BE_WEITER = weiter(KAP_BEFUND)

# Notation
NOTATION = [
 'Notation nach der Vorgabe des Templates. Drei Schreibweisen sind zu unterscheiden: <BUE_…> bezeichnet ein Eingangsfeld aus dem '
 'Datenpool, <…> einen vom Bot gelesenen oder gesetzten Wert, „…“ ohne Zusatz ein Feld auf der Hostmaske oder einen festen Wert. '
 'Variablen, die aus einer Hostanwendung gelesen werden, tragen die Anwendung im Namen. Damit ist in jedem Vergleich erkennbar, welche '
 'Quelle gegen welche geprüft wird: <IS011-Gebdat> <> <BUE_KUNDE_GEBDAT> vergleicht das in IS011 gelesene Geburtsdatum mit dem Feld '
 'aus dem Datenpool.',
 'Lesehilfe zur Farblogik: Systeme stehen fett (OB726), Felder aus dem Datenpool dunkelblau (<BUE_VNR>), im Lauf erzeugte Variablen '
 'dunkelgrün (<Vorgang-VNR>), die <BE-Klassifikation> dunkelrot; Prüfnotizen stehen orange und in eigener Zeile. Die Steuerwörter WENN / DANN / SONST / SONST WENN / Ende WENN stehen '
 'türkis in der Formatvorlage „WENN DANN“ und sind wie Programmcode eingerückt; „SONST WENN“ hängt eine weitere Bedingung an denselben '
 'Block, ein „Ende WENN“ schließt die ganze Kette. Querverweise auf andere Kapitel und Schritte sind Links und stehen fett und '
 'unterstrichen, Hinweise kursiv.',
 'Initialisierung über „Lese … und speichere als <…>“, Zuweisung über „=“, Vergleich über „<>“.',
 'Eine Business Exception wird über <BE-Klassifikation> gemeldet; sie beendet die Prüfung sofort und verzweigt in das Kapitel „' + KAP_BEFUND +
 '“. Sie kann in der Vorprüfung und in jedem späteren Schritt auftreten. Abweichungen aus den Einzelprüfungen werden mit „Merke Prüfnotiz … in '
 '<Fehlerliste>“ gesammelt, die Verarbeitung läuft weiter; am Ende der Prüfungen wird die Fehlerliste getestet. Wie mit einer BE umgegangen '
 'wird, steht nur im Kapitel „' + KAP_BEFUND + '“ und wird in den einzelnen Schritten nicht wiederholt.',
]
for text, anfang in zip(NOTATION, ('Notation nach der Vorgabe', 'Lesehilfe zur Farblogik', 'Initialisierung über', 'Eine Business Exception wird über')):
    p = finde_absatz(anfang, anfang=True)
    fmt.schreibe(p, text, 0, kursiv=True, luft_danach=6)
if KL:
    p_be = finde_absatz('Eine Business Exception wird über', anfang=True)
    neu_kl = absatz_nach(p_be._element, 'Hinweis zu den Screenshots: Die Bildschirmfotos stammen aus der KV-Fassung (Postkorb, VA230 mit Sparte Kranken) und '
                         'sind für Komposit / Leben durch den Fachbereich zu ersetzen.', 'Normal')
    fmt.schreibe(Paragraph(neu_kl, d), Paragraph(neu_kl, d).text, 0, kursiv=True, luft_danach=6)

# Kapitelueberschriften
UEBERSCHRIFTEN = [
 ('Start', 'Start – Vorgang aus dem Themenpostkorb übernehmen'),
 ('Vorprüfung – Ausschlusskriterien', 'Vorprüfung – Business Exceptions aus dem KI-Deckblatt'),
 ('I. Kunde (VN) – Partnerprüfung über IS011', 'I. Kunde (VN) – Partnerprüfung über IS011'),
 ('II. Abgebender Bestandsinhaber', 'II. Abgebender Bestandsinhaber'),
 ('III. Übernehmender Makler – Agenturnummer/Vermittler-Nr. (PNR)', 'III. Übernehmender Makler – Agenturnummer und Vermittler-Nr. (PNR)'),
 ('IV. Prüfung Vertrag', 'IV. Vertrag – Vertragsstatus in VA230' + (' und Mantelvertrag bei KR' if KL else '')),
 ('V. Test auf Fehlerliste', 'V. Test auf Fehlerliste'),
 ('Prozessende mit Status completed: Weiterleitung an den BÜ-Bot', 'VI. Abschluss ohne Befund – Notiz bestücken und an den 72-Stunden-BOT übergeben'),
 ('Prozessende mit Status Exception: BE-Handling', KAP_BEFUND + ' – BE-Handling'),
]
for alt, neu in UEBERSCHRIFTEN:
    setze_text(finde_absatz(alt, 'Heading 2'), neu)
KONTEXTE = [
 ('Eröffnung Postkorbvorgang und Daten im Datenpool', 'Postkorbvorgang und Datenpool lesen'),
 ('Ausschlusskriterien aus dem Datenpool prüfen', 'Ausschlusskriterien aus dem KI-Deckblatt prüfen'),
 ('IS011 KNR zum VN ermitteln', 'Kundennummer des Versicherungsnehmers über die Versicherungsnummer ermitteln (IS011)'),
 ('IS011 Partner-Machtchcodesuche und Abgleich mit VNR-Rollen', 'Matchcodesuche mit den Angaben aus dem Auftrag und Abgleich der Kundennummern (IS011)'),
 ('VA230 Agentur-Nr. (A,…) des Bestandsinhabers ermitteln', 'Agentur-Nr. des abgebenden Bestandsinhabers ermitteln (VA230)'),
 ('OB726, GH040 Agenturinhaber PNR lesen und prüfen', 'PNR des Bestandsinhabers lesen und Anbindung prüfen (OB726, GH040)'),
 ('OB726 PNR und Makler Klassifizierung prüfen', 'Vermittler in OB726 aufrufen: PNR, Name und Klassifizierung'),
 ('GH040 Status PNR prüfen', 'Anbindung des übernehmenden Vermittlers prüfen (GH040)'),
 ('Vertragsstatus prüfen', 'Vertragsstatus prüfen (VA230)'),
 ('Test auf Fehlerliste', 'Fehlerliste auswerten'),
 ('Notizbestückung von Prüf-Bot auf BÜ-Bot', 'Telefonnotiz bestücken'),
 ('Prozessende', 'Vorgang übergeben und abschließen'),
 ('Umgang mit Business Exceptions (zentral)', 'Business Exception und Prüfnotizen zentral behandeln'),
]
for alt, neu in KONTEXTE:
    setze_text(finde_absatz(alt, 'fachlicher Kontext'), neu)

# --- Start (T15)
t15 = T[15]
setze_zelle(t15.rows[0].cells[0], ['Screenshot: Themenpostkorb, Vorgangsübersicht'])
setze_zelle(t15.rows[1].cells[0], ['Screenshot: Datenpool, Datensatz zum Postkorbvorgang – durch Fachbereich/Robotics zu ergänzen'])
setze_zelle(t15.rows[0].cells[1], [
 'Werte aus dem Postkorbvorgang: Postkorbvorgang im Startpostkorb (' + PK + ', siehe Kapitel „Details zum Startereignis“) öffnen. ' + GEVO + '.',
 'Lese die Vorgang-Lfd-Nr aus und speichere als <Vorgang-Lfd-Nr>.',
 '<Vorgang-Lfd-Nr> ist der Ordnungsbegriff dieses Prozesses.',
 'Lese die Versicherungsnummer des Postkorbvorgangs aus und speichere als <Vorgang-VNR>.',
 'Hinweis: <Vorgang-VNR> ist die Nummer, mit der Celonis den Vorgang eröffnet hat, bereits normiert auf zwei Buchstaben Spartenkürzel '
 'und neun Ziffern. Sie ist der Einstieg für alle Hostaufrufe und bleibt für den gesamten Vorgang die führende Nummer. <BUE_VNR> und '
 '<BUE_VNR_2> aus dem Datenpool werden nicht gegen sie geprüft; sie führen nachrichtlich alle im Auftrag genannten Nummern und gehen in '
 'Notiz und Bearbeitungshinweis ein.',
 'Hinweis: Celonis eröffnet je Versicherungsnummer einen eigenen Postkorbvorgang mit derselben E-Mail, allen Anhängen, dem KI-Deckblatt '
 'und dem zugehörigen Datensatz im Datenpool.'])
DATENPOOL = ['BUE_AGENTUR_NR', 'BUE_ANF_UNTERLAGEN', 'BUE_ART_UNTERLAGEN', 'BUE_KLASSIFIKATION', 'BUE_KUNDE_GEBDAT', 'BUE_KUNDE_NACHNAME',
             'BUE_KUNDE_ORT', 'BUE_KUNDE_PLZ', 'BUE_KUNDE_STRASSE', 'BUE_KUNDE_VORNAME', 'BUE_MAKLER_EMAIL', 'BUE_MAKLER_ORT', 'BUE_MAKLER_PLZ',
             'BUE_MAKLER_STRASSE', 'BUE_MV_AUF_MAKLER', 'BUE_MV_EINGANGSDATUM', 'BUE_MV_ENTHALTEN', 'BUE_MV_STATUS', 'BUE_MV_UNTERSCHRIFTSDATUM',
             'BUE_MV_UNTERSCHRIFT_KUNDE', 'BUE_MV_VN_NACHNAME', 'BUE_MV_VN_VORNAME', 'BUE_MV_VOLLUMFAENGLICH', 'BUE_POOL', 'BUE_PRUEFUNG_UNTERLAGEN',
             'BUE_REMINDER', 'BUE_SPARTE', 'BUE_UMFANG', 'BUE_UV_ERTEILT', 'BUE_VERMITTLER_NAME', 'BUE_VERMITTLER_NR', 'BUE_VERMITTLER_TYP',
             'BUE_VNR', 'BUE_VNR_2', 'BUE_WUNSCH_VORHANDEN']
GELESEN = ['BUE_AGENTUR_NR', 'BUE_KUNDE_GEBDAT', 'BUE_KUNDE_NACHNAME', 'BUE_KUNDE_PLZ', 'BUE_KUNDE_STRASSE', 'BUE_KUNDE_VORNAME', 'BUE_MAKLER_EMAIL',
           'BUE_MV_AUF_MAKLER', 'BUE_MV_EINGANGSDATUM', 'BUE_MV_UNTERSCHRIFT_KUNDE', 'BUE_POOL', 'BUE_PRUEFUNG_UNTERLAGEN', 'BUE_UMFANG', 'BUE_UV_ERTEILT',
           'BUE_VERMITTLER_NR', 'BUE_VERMITTLER_TYP', 'BUE_VNR', 'BUE_VNR_2', 'BUE_WUNSCH_VORHANDEN'] + (['BUE_ART_UNTERLAGEN', 'BUE_SPARTE'] if KL else [])
GELESEN.sort()
NICHT_GELESEN = [f for f in DATENPOOL if f not in GELESEN]
# Nicht gelesene Datenpoolfelder sind keine Variablen des Bots und stehen nicht in der Variablentabelle.
VAR[:] = [v for v in VAR if v[0] not in NICHT_GELESEN]
setze_zelle(t15.rows[1].cells[1], [
 'Werte aus dem Datenpool: Wechsel vom Postkorbvorgang in den Datenpool, Datensatz zum Postkorbvorgang mit <Vorgang-Lfd-Nr> öffnen.',
 'Lese die folgenden ' + str(len(GELESEN)) + ' Felder des Datenpools aus und speichere jedes unter dem gleichnamigen Variablennamen (Format, Werteliste und '
 'Pflichtfeldkennzeichen im Kapitel „Tabelle der genutzten Variablen“, Herkunft „Datenpool“):'] +
 ['• <' + f + '>' for f in GELESEN] + [
 'Lese <BUE_MV_EINGANGSDATUM> aus und speichere als <Eingangsdatum-BUE> (Format tt.mm.jjjj). Ist das Feld leer, wird das Eröffnungsdatum '
 'des Postkorbvorgangs verwendet.',
 'Vom Roboter initialisiert: Die Variablen für das BE-Handling werden zu Beginn jedes Vorgangs zurückgesetzt:',
 '<BE> = leer', '<BE-Klassifikation> = leer', '<Fehlerliste> = leer', '<Suche-ohne-Gebdat> = leer',
 'Weiter zum Kapitel „Vorprüfung“'])
setze_zelle(t15.rows[2].cells[1], [
 'Hinweis: Der Themenpostkorb „MV 23724 BÜ Prüf BOT“ nimmt Bestandsübertragungen aller Sparten auf. Die Sparte ist am Vorgang erkennbar '
 '(Dokumenttyp 2015 bei KV, GeVo 108 bei Komposit und Leben) und am Spartenkürzel der <Vorgang-VNR>. ' +
 ('Diese Fassung gilt für Komposit und Leben; die Notiz entspricht der Vorlage 1515.' if KL else
  'Diese Fassung gilt für die Krankenversicherung; die Notiz entspricht der KV-Variante.'),
 ('Hinweis: Eine weitergehende Spartenweiche innerhalb des Prozesses ist nicht erforderlich; <BUE_SPARTE> steuert nur bei „KR“ im Kapitel '
  '„IV. Vertrag“ die Prüfung auf Mantelvertrag.' if KL else
  'Hinweis: Eine weitergehende Spartenweiche innerhalb des Prozesses ist nicht erforderlich; die Sparte ist durch den Dokumenttyp vorgegeben.'),
 'Hinweis: Eine Prüfung der Klassifikation aus dem Datenpool findet nicht statt. Der Prüf-Bot wird nur durch Vorgänge ausgelöst, '
 'die als Bestandsübertragung in den Themenpostkorb gestellt wurden – heute durch Celonis, künftig auch durch Weiterleitung aus der '
 'Sparte, wenn dort zuerst ein anderes Anliegen zu bearbeiten war.'])

# --- Vorpruefung (T16)
VORPRUEFUNG = [
 'Hinweis: Vor den fachlichen Prüfungen wird anhand des KI-Deckblatts festgestellt, ob der Vorgang bearbeitbar ist. Jedes Ausschlusskriterium '
 'ist eine Business Exception. Geprüft wird ausschließlich gegen die Datenpoolfelder, also ohne Hostzugriff.',
 'WENN', '<BUE_VERMITTLER_TYP> = „Courtagefortzahler“ ODER <BUE_VERMITTLER_TYP> = „Kontaktgeber“', 'DANN',
 '<BE-Klassifikation> = „Keine Bestandsübertragung möglich: <BUE_VERMITTLER_TYP>“', BE_WEITER,
 'Ende WENN',
 'WENN', '<BUE_AGENTUR_NR> = leer', 'DANN',
 '<BE-Klassifikation> = „Agenturnummer nicht vorhanden“', BE_WEITER,
 'Ende WENN',
 'WENN', '<BUE_VERMITTLER_TYP> = „MFA“', 'DANN',
 'WENN', '<BUE_WUNSCH_VORHANDEN> = „nein“', 'DANN',
 '<BE-Klassifikation> = „BÜ-Wunsch nicht vorhanden“', BE_WEITER,
 'Ende WENN',
 'WENN', '<BUE_MV_AUF_MAKLER> <> „ja“', 'DANN',
 '<BE-Klassifikation> = „Betreuungswunsch nicht auf MFA ausgestellt“', BE_WEITER,
 'Ende WENN',
 'SONST',
 'WENN', '<BUE_MV_UNTERSCHRIFT_KUNDE> <> „ja“', 'DANN',
 '<BE-Klassifikation> = „Unterschrift VN fehlt“', BE_WEITER,
 'Ende WENN',
 'WENN', '<BUE_PRUEFUNG_UNTERLAGEN> <> „Vollständig“', 'UND <BUE_PRUEFUNG_UNTERLAGEN> <> leer',
 'UND <BUE_PRUEFUNG_UNTERLAGEN> <> „Reminder - keine Vollst.-Prüfung“', 'DANN',
 'Merke Prüfnotiz „Unterlagen nicht vollständig: <BUE_PRUEFUNG_UNTERLAGEN>“ in <Fehlerliste>',
 'Ende WENN',
 'Ende WENN',
 'Weiter zum Kapitel „I. Kunde (VN)“',
 'Hinweis: Beim Mehrfachagenten (<BUE_VERMITTLER_TYP> = „MFA“) gibt es keine Maklervollmacht; für ihn zählen der ausformulierte BÜ-Wunsch und '
 'der auf ihn ausgestellte Betreuungswunsch. <BUE_UV_ERTEILT> steht bei ihm auf N/A und wird nicht geprüft.',
 'Hinweis: Beim Makler belegt die Maklervollmacht den Auftrag; <BUE_WUNSCH_VORHANDEN> wird deshalb nur beim Mehrfachagenten geprüft. Die '
 'Unterschrift des Versicherungsnehmers steht auf der Maklervollmacht und ist beim Makler das harte Kriterium.',
 'Hinweis: <BUE_PRUEFUNG_UNTERLAGEN> ist eine fachliche Ausprägung der Unterlagenprüfung, kein technischer Fehler. Ein Mangel („BÜ-Wunsch '
 'fehlt“, „MV fehlt“, „MV unvollständig“, „VN-Unterschrift fehlt“) ist kein Ausschlusskriterium: Der Bot merkt die Prüfnotiz mit dem '
 'Feldwert in <Fehlerliste>, die weiteren Prüfungen laufen weiter. Ein leeres Feld und der Wert „Reminder - keine Vollst.-Prüfung“ '
 'bedeuten, dass keine Vollständigkeitsprüfung stattgefunden hat; sie lösen keine Prüfnotiz aus. Erst der Test auf Fehlerliste führt '
 'bei gefüllter <Fehlerliste> zur BE „Nachprüfung erforderlich“.' +
 (' Die Anforderung von Unterlagen durch den Makler (<BUE_ART_UNTERLAGEN>) ist davon unabhängig und wird im Kapitel „VI. Abschluss ohne Befund“ '
  'in der Notiz gekennzeichnet.' if KL else ''),
 'Hinweis: Courtagefortzahler und Kontaktgeber erhalten keine Bestände übertragen (M. Koch, 24.09.2026). Die BE führt den Typ mit, damit der '
 'Sachbearbeiter die Ablehnung versendet und die Ablehnungsnachricht später anhand des Typs automatisiert werden kann. Vollmacht, Unterschrift '
 'und Unterlagen werden für diese Typen nicht geprüft; die übrigen Felder des KI-Deckblatts stehen wie beim Mehrfachagenten auf N/A. Die Prüfung '
 'steht deshalb vor allen anderen Ausschlusskriterien.',
 'Hinweis: Ist <BUE_VERMITTLER_TYP> leer oder „Fremdversicherungsunternehmen“, läuft der Vorgang ohne eigene Prüfnotiz durch den Makler-Zweig: Dann muss eine vom '
 'Versicherungsnehmer unterschriebene Maklervollmacht vorliegen, sonst entsteht ohnehin die BE „Unterschrift VN fehlt“. Liegt sie vor, '
 'läuft die Prüfung normal weiter (Entscheidung E. Brenneisen, 23.09.2026).',
 'Hinweis: Die Agenturnummer ist der Einstieg in OB726 und Pflichtfeld der Notiz; ohne sie ist der Vorgang nicht bearbeitbar. Die Prüfung '
 'steht deshalb hier in der Vorprüfung und nicht erst im Kapitel „III. Übernehmender Makler“.',
 'Hinweis: Bei jedem Ausschlusskriterium geht der Vorgang ohne weitere Prüfung in das Kapitel „' + KAP_BEFUND + '“.',
]
setze_zelle(T[16].rows[0].cells[1], VORPRUEFUNG)

# --- I. Kunde: T17 (KNR ueber VNR) und T18 (Matchcode)
setze_zelle(T[17].rows[0].cells[1], [
 'IS011 öffnen, im Feld „ORDN-BEGR“ die <Vorgang-VNR> eingeben und Enter.',
 'Es öffnet sich die Maske IS011/VAF017 „Anzeigen Stammdaten“ mit dem Versicherungsnehmer des Vertrags.',
 'WENN', 'Maskenname <> „IS011/VAF017“ ODER Feld „KD“ leer (IS011 zeigt zur <Vorgang-VNR> keine Stammdaten)', 'DANN',
 '<BE-Klassifikation> = „Vertrag zur VNR nicht gefunden“', BE_WEITER,
 'Ende WENN',
 'Lese die Nummer hinter „KD“ ohne Punkt und Prüfziffer (im Screenshot gelb markiert) und speichere als <IS011-KNR-VN>.',
 'Lese das Feld „Geb.-Dat“ und speichere als <IS011-Gebdat>.',
 'Hinweis: Die Versicherungsnummer ist der Nachweis der Identität: Der Partner, den IS011 zur <Vorgang-VNR> anzeigt, ist der '
 'Versicherungsnehmer des Vertrags. Die Matchcodesuche im nächsten Schritt prüft, ob die im Auftrag genannte Person dieselbe ist.'])
t18 = T[18]
setze_zelle(t18.rows[0].cells[1], [
 'Die Matchcodesuche prüft mit den Angaben aus dem Auftrag, ob die genannte Person der Versicherungsnehmer des Vertrags ist. Maßstab ist '
 'die Kundennummer <IS011-KNR-VN> aus dem vorigen Schritt.',
 'IS011 starten (Maske IS011/VAF121 „Match-Code-Suche Bestand“).'])
setze_zelle(t18.rows[1].cells[1], [
 'Matchcodesuche mit den Angaben aus dem Auftrag ausführen:',
 'Zuname = <BUE_KUNDE_NACHNAME>',
 'PLZ/Ort = <BUE_KUNDE_PLZ>',
 'Vorname = die ersten zwei Buchstaben von <BUE_KUNDE_VORNAME>',
 'Straße = die ersten zwei Buchstaben von <BUE_KUNDE_STRASSE>',
 'Geb-Dat = <BUE_KUNDE_GEBDAT>, aufgeteilt auf die drei Felder TT MM JJJJ (nur wenn <BUE_KUNDE_GEBDAT> <> leer und <Suche-ohne-Gebdat> = leer)',
 'Enter',
 'Hinweis: Das Geburtsdatum ist zunächst Suchfeld. Bleibt die Trefferliste leer, wird die Suche einmal ohne Geburtsdatum wiederholt '
 '(nächste Zeile). So führt ein im Auftrag falsch angegebenes Geburtsdatum nicht zur BE „Kunde in IS011 nicht gefunden“, sondern nach der '
 'Suche zur Prüfnotiz „Geburtsdatum abweichend“ (Schritt „Geburtsdatum abgleichen“ unten).'])
setze_zelle(t18.rows[2].cells[1], [
 'Lese den Maskennamen.',
 'WENN', 'Maskenname = „IS011/VAF121“ (Trefferliste)', 'DANN',
 'WENN', 'Trefferliste leer', 'DANN',
 'WENN', '<BUE_KUNDE_GEBDAT> <> leer UND <Suche-ohne-Gebdat> = leer', 'DANN',
 '<Suche-ohne-Gebdat> = „ja“',
 'Matchcodesuche wiederholen mit denselben Angaben, aber ohne das Feld Geb-Dat, und Enter.',
 'Weiter mit „Lese den Maskennamen“ (Beginn dieser Zeile)',
 'SONST',
 '<BE-Klassifikation> = „Kunde in IS011 nicht gefunden“', BE_WEITER,
 'Ende WENN',
 'Ende WENN',
 'Prüfe, ob <IS011-KNR-VN> in der Spalte „KNR“ der Trefferliste enthalten ist; solange „PF2=Folgeseite“ angeboten wird, mit PF2 blättern und die Prüfung wiederholen.',
 'WENN', '<IS011-KNR-VN> in der Trefferliste enthalten', 'DANN',
 'Weiter mit „Geburtsdatum abgleichen“ (unten in diesem Schritt)',
 'SONST',
 '<BE-Klassifikation> = „Kunde ist nicht Versicherungsnehmer“', BE_WEITER,
 'Ende WENN',
 'Ende WENN',
 'Hinweis: Mehrfachtreffer sind unkritisch. Kunden treten im Partnersystem mehrfach auf, etwa mit alter und neuer Anschrift; es genügt, '
 'dass die Kundennummer des Versicherungsnehmers unter den Treffern ist.'])
setze_zelle(t18.rows[3].cells[1], [
 'WENN', 'Maskenname = „IS011/VAF017“ (genau ein Treffer, Anzeige Stammdaten)', 'DANN',
 'Lese die Nummer hinter „KD“ ohne Punkt und Prüfziffer und speichere als <IS011-KNR>.',
 'WENN', '<IS011-KNR> = <IS011-KNR-VN>', 'DANN',
 'Weiter mit „Geburtsdatum abgleichen“ (unten in diesem Schritt)',
 'SONST',
 'Weiter mit „Grund der Abweichung bestimmen“ (nächste Zeile)',
 'Ende WENN',
 'Ende WENN',
 'WENN', 'Maskenname weder „IS011/VAF121“ noch „IS011/VAF017“ (Fehlermeldung von IS011)', 'DANN',
 'Verarbeitung dieses Vorgangs als System Exception abbrechen; der Vorgang bleibt unbearbeitet im Themenpostkorb.',
 'Ende WENN'])
setze_zelle(t18.rows[4].cells[0], ['Screenshot: Scout-Service, Vertragsübersicht zur Kundennummer; IS011, Vertragszeile mit Rolle VN'])
setze_zelle(t18.rows[4].cells[1], [
 'Grund der Abweichung bestimmen (nur über den Sprung aus der vorigen Zeile erreicht): Rufe im Scout-Service die Vertragsübersicht zu '
 '<IS011-KNR> auf und lese alle Versicherungsnummern (Spalte „VNR“).',
 'WENN', '<Vorgang-VNR> in der Liste enthalten', 'DANN',
 '<BE-Klassifikation> = „Kunde ist nicht Versicherungsnehmer“',
 'SONST',
 '<BE-Klassifikation> = „Vertrag gehört nicht zum Kunden“',
 'Ende WENN',
 BE_WEITER,
 'Hinweis: Führt die Matchcodesuche auf einen anderen Partner als den Versicherungsnehmer, liegt in jedem Fall eine Business Exception vor. '
 'Der Scout-Service bestimmt nur ihren Grund: Steht der Vertrag in der Vertragsübersicht des gefundenen Partners, ist er am Vertrag in '
 'einer anderen Rolle beteiligt; sonst gehört der Vertrag nicht zu der im Auftrag genannten Person.'])
setze_zelle(t18.rows[5].cells[1], [
 'Geburtsdatum abgleichen:',
 'WENN', '<BUE_KUNDE_GEBDAT> <> leer', 'UND <IS011-Gebdat> <> <BUE_KUNDE_GEBDAT>', 'DANN',
 'Merke Prüfnotiz „Geburtsdatum abweichend“ in <Fehlerliste>',
 'Ende WENN',
 'Weiter zum Kapitel „II. Abgebender Bestandsinhaber“',
 'Hinweis: Der Nachweis der Identität ist die Versicherungsnummer. Als einzige Gegenprobe bleibt das Geburtsdatum, und auch das nur, wenn '
 'der Auftrag eines nennt. Eine Plausibilitätsprüfung über Name, Vorname, Straße und PLZ findet nicht statt.',
 'Hinweis: Ist <BUE_KUNDE_GEBDAT> leer, liegt in der Regel eine juristische Person vor; die Gegenprobe entfällt dann.'])

# --- II. Abgebender Bestandsinhaber: T19, T20
setze_zelle(T[19].rows[0].cells[1], [
 'VA230 mit <Vorgang-VNR> öffnen.',
 'Lese das gelb markierte Feld hinter „Betreuung“ aus und speichere als <VA230-AGT-Inhaber>.',
 'WENN', '<VA230-AGT-Inhaber> = leer', 'DANN',
 'Merke Prüfnotiz „Bestandsinhaber nicht ermittelbar“ in <Fehlerliste>',
 'Weiter zum Kapitel „III. Übernehmender Makler“',
 'Ende WENN',
 'Hinweis: Ein leeres Feld „Betreuung“ (etwa Direktbestand ohne Vermittler) ist kein Ausschlusskriterium; der Bestandsinhaber wird in der '
 'Nachprüfung manuell bestimmt.'])
t20 = T[20]
setze_zelle(t20.rows[0].cells[1], [
 'Öffne OB726 mit <VA230-AGT-Inhaber>.',
 'Lese den Hinweistext der Maske.',
 'WENN', 'Hinweistext enthält „IS0042I“ (Agentur nicht vorhanden)', 'DANN',
 'Merke Prüfnotiz „Bestandsinhaber nicht ermittelbar“ in <Fehlerliste>',
 'Weiter zum Kapitel „III. Übernehmender Makler“',
 'Ende WENN',
 'Lese den Wert hinter „P“ und speichere nur den Zahlenanteil ohne das Präfix „P,“ als <OB726-AGT-Inh-PNR>; führende Nullen bleiben erhalten.'] +
 (['Lese das Feld „Vertriebskanal“ aus und speichere die vierstellige Nummer als <OB726-AGT-Inh-Vertriebskanal> '
   '(steuert im Kapitel „VII. Abschluss mit Befund“ das Routing nach ODPP1 D oder HSB4 K KO).'] if KL else []))
setze_zelle(t20.rows[1].cells[1], [
 'GH040 mit <OB726-AGT-Inh-PNR> öffnen.',
 'Suche in der angezeigten Tabelle die Zeile „Status der Beschäftigung“ und lese den Wert hinter „=“ aus.',
 'WENN', 'Wert hinter „=“ in der Zeile „Status der Beschäftigung“ <> „aktiv“', 'DANN',
 'Merke Prüfnotiz „Anbindung Bestandsinhaber nicht aktiv“ in <Fehlerliste>',
 'Ende WENN',
 'Weiter zum Kapitel „III. Übernehmender Makler“',
 'Hinweis: Drei Rollen sind zu unterscheiden: der Versicherungsnehmer (Kapitel I), der abgebende Bestandsinhaber aus VA230 (dieses Kapitel) '
 'und der übernehmende Vermittler aus dem Datenpool (Kapitel III).'])

# --- III. Uebernehmender Makler: Weiche T21, OB726 T22, GH040 T23 + E-Mail
t21 = T[21]
WEICHE = [
 ['Agentur-Nr. vorhanden', 'PNR vorhanden', 'Was ist zu tun'],
 ['Ja', 'Ja', 'OB726 über <BUE_AGENTUR_NR> öffnen; <OB726-PNR> = <BUE_VERMITTLER_NR> (auf 7 Stellen aufgefüllt); Name und Klassifizierung prüfen; Anbindung in GH040 prüfen; E-Mail-Adresse ermitteln'],
 ['Ja', 'Nein', 'OB726 über <BUE_AGENTUR_NR> öffnen; PNR aus OB726 lesen; Name und Klassifizierung prüfen; Anbindung in GH040 prüfen; E-Mail-Adresse ermitteln'],
 ['Nein', 'Ja', 'Harte BE „Agenturnummer nicht vorhanden“ bereits in der Vorprüfung – der Einstieg erfolgt immer über die Agenturnummer'],
 ['Nein', 'Nein', 'Harte BE „Agenturnummer nicht vorhanden“ bereits in der Vorprüfung'],
]
for r, werte in zip(t21.rows, WEICHE):
    for c, w in zip(r.cells, werte):
        setze_zelle(c, [w])
t22 = T[22]
setze_zelle(t22.rows[0].cells[1], [
 'Öffne OB726 mit <BUE_AGENTUR_NR> (dass die Agenturnummer vorliegt, ist in der Vorprüfung sichergestellt).',
 'Lese den Hinweistext der Maske.',
 'WENN', 'Hinweistext enthält „IS0042I“ (Agentur nicht vorhanden)', 'DANN',
 '<BE-Klassifikation> = „Agenturnummer in OB726 unbekannt“', BE_WEITER,
 'Ende WENN',
 'WENN', '<BUE_VERMITTLER_NR> = leer', 'DANN',
 'Lese den Wert hinter „P“ und speichere nur den Zahlenanteil ohne das Präfix „P,“ als <OB726-PNR>; 7-stellig, führende Nullen bleiben erhalten.',
 'SONST',
 '<OB726-PNR> = <BUE_VERMITTLER_NR>, links mit Nullen auf 7 Stellen aufgefüllt',
 'Ende WENN',
 'Format: <BUE_AGENTUR_NR> 7 bis 9 Ziffern ohne Präfix „A“; <OB726-PNR> nur Ziffern, 7-stellig. Ob das Feld hinter „P“ sauber ohne Präfix '
 'auslesbar ist, ist durch Robotics zu prüfen.'])
setze_zelle(t22.rows[1].cells[1], [
 'Lese das gelb markierte Feld hinter „Name 1“ aus und speichere als <OB726-Name>.',
 'WENN', '<OB726-Name> enthält „INAKTIV“', 'DANN',
 '<BE-Klassifikation> = „Keine Zusammenarbeit“', BE_WEITER,
 'Ende WENN',
 'Format: Ziffern, Buchstaben und Sonderzeichen, bis zu 60 Zeichen. <OB726-Name> wird in das Feld „Maklername“ der Notiz übernommen.'])
setze_zelle(t22.rows[2].cells[1], [
 'Lese die OB726-Kopfzeile mit der Vermittler-Nr. („P,…“) aus. Die ganze Zeile ist ein Feld: Übernimm den Text hinter der Nummer (im '
 'Screenshot „Makler Industrie A“, Begriff „Makler“ gelb markiert) und speichere ihn als <OB726-Klassifizierung>.',
 'WENN', '<BUE_VERMITTLER_TYP> = „MFA“ UND <OB726-Klassifizierung> <> „Mehrfachagent“',
 'ODER <BUE_VERMITTLER_TYP> <> „MFA“ UND <OB726-Klassifizierung> = „Mehrfachagent“', 'DANN',
 'Merke Prüfnotiz „Vermittlertyp abweichend“ in <Fehlerliste>',
 'Ende WENN',
 'Hinweis: Ist <BUE_VERMITTLER_TYP> leer, wurde in der Vorprüfung der Makler-Zweig durchlaufen; nennt OB726 einen Mehrfachagenten, '
 'greift die zweite Bedingung und der Sachbearbeiter prüft den Betreuungswunsch in der Nachprüfung.'])
t23 = T[23]
setze_zelle(t23.rows[0].cells[1], [
 'Öffne GH040 mit <OB726-PNR>.',
 'Suche in der angezeigten Tabelle die Zeile „Status der Beschäftigung“ (Kennziffer, dahinter „=“ und der Wert, im Screenshot gelb '
 'markiert) und lese den Wert hinter „=“ aus. Der Wert wird nur für den folgenden Vergleich benötigt und nicht als Variable gespeichert.',
 'WENN', 'Wert hinter „=“ in der Zeile „Status der Beschäftigung“ <> „aktiv“', 'DANN',
 '<BE-Klassifikation> = „Keine Zusammenarbeit“', BE_WEITER,
 'Ende WENN',
 'Hinweis: Die Anbindungsprüfung steht am Ende der OB726-Schritte, damit OB726 nicht erneut aufgerufen werden muss; die E-Mail-Adresse '
 'kommt aus OB729 und wird im nächsten Schritt gelesen.'])
zeilen_anpassen(t23, 1)
# E-Mail-Adresse: eigener fachlicher Kontext mit Tabelle und Sonderliste
ctx = absatz_nach(t23._element, 'E-Mail-Adresse des übernehmenden Vermittlers ermitteln', 'fachlicher Kontext')
EMAIL = [
 'Die E-Mail-Adresse wird für das Notizfeld „E-Mail aufnehmender Makler“ benötigt. Es gilt in dieser Reihenfolge:',
 '1. TOP-Makler laut Sonderliste: die dort hinterlegte E-Mail-Adresse für die Antwort auf BÜ-Anfragen.',
 '2. Sonst die in OB729 (Vermittlerkommunikation) zur Agenturnummer hinterlegte Adresse (<OB729-Email>), außer sie ist eine interne ERGO-Adresse (enthält „@ergo“).',
 '3. Sonst die Absenderadresse der Eingangsmail (<BUE_MAKLER_EMAIL>).',
 'WENN', '<BUE_AGENTUR_NR> in der Spalte „Agentur-Nr.“ der Sonderliste TOP-Makler enthalten (Tabelle unten; Vergleich der Ziffernfolge ohne '
 'führende Nullen)', 'DANN',
 '<Makler-Email> = E-Mail-Adresse aus der Sonderliste',
 'SONST',
 'Öffne OB729 mit <BUE_AGENTUR_NR>, lese die hinterlegte E-Mail-Adresse und speichere als <OB729-Email> (leer, wenn keine Adresse hinterlegt ist).',
 'WENN', '<OB729-Email> = leer', 'ODER <OB729-Email> enthält „@ergo“', 'DANN',
 '<Makler-Email> = <BUE_MAKLER_EMAIL>',
 'SONST',
 '<Makler-Email> = <OB729-Email>',
 'Ende WENN',
 'Ende WENN',
 'WENN', '<Makler-Email> = leer', 'DANN',
 'Merke Prüfnotiz „E-Mail-Adresse des Vermittlers fehlt“ in <Fehlerliste>',
 'SONST WENN', '<Makler-Email> enthält „@ergo“', 'DANN',
 'Merke Prüfnotiz „Absender ist eine interne ERGO-Adresse“ in <Fehlerliste>',
 'Ende WENN',
 'Weiter zum Kapitel „IV. Vertrag“',
 'Hinweis: Die Sonderliste gilt einmalig (Stand 23.09.2026) und wird nicht laufend gepflegt.',
]
t_email = tabelle_nach_element(ctx, t23, [['', EMAIL]])
setze_zelle(t_email.rows[0].cells[0], ['Screenshot: OB729 Vermittlerkommunikation, Feld E-Mail-Adresse – durch Fachbereich/Robotics zu ergänzen'])
SONDERLISTE = [
 ['Agentur-Nr. (Vergleichswert)', 'Agentur-Name (Sonderliste TOP-Makler)', 'E-Mail-Adresse für Antwort auf BÜ-Anfrage'],
 ['600041966', '1 zu 1 Assekuranzservice AG', 'bestandsuebertragung@1zu1.ag'],
 ['600021389', 'Apella AG', 'bestandsuebertragung@apella.de'],
 ['600020036', 'blau direkt GmbH', 'provider-bue@blaudirekt.de'],
 ['600082061', 'DEMA Deutsche Versicherungsmakler AG', 'service@dema-makler.de'],
 ['600042497', 'Fonds Finanz Maklerservice GmbH', 'bestandsuebertragung@fondsfinanz.de'],
 ['600010016', 'INVERS Versicherungsvermittlungsgesellschaft mbH', 'bestandsuebertragung@invers-gruppe.de'],
 ['008903235', 'Jung, DMS & Cie Pool GmbH', 'bestandsuebertragung@jungdms.de'],
 ['008982800', 'VEMA Versicherungsmakler Genossenschaft e.G.', 'poolservice@vema-eg.de'],
]
t_liste = tabelle_nach_element(t_email._element, t21, SONDERLISTE)
breite(t_liste, [18, 42, 40])
breite(t21, [16, 14, 70])
for _r in t_liste.rows:
    for _c in _r.cells:
        for _p in _c.paragraphs:
            fmt.schreibe(_p, _p.text, 0)

# --- IV. Vertrag (T24)
VERTRAG = [
 'VA230 mit <Vorgang-VNR> öffnen.',
 'Lese das gelb markierte Feld „Status“ aus und speichere als <VA230-Status>.',
 'WENN', '<VA230-Status> <> „aktuell“', 'DANN',
 '<BE-Klassifikation> = „Vertrag nicht aktuell: <VA230-Status>“', BE_WEITER,
 'Ende WENN']
if KL:
    VERTRAG += [
     'WENN', '<BUE_SPARTE> = „KR“ (bei mehreren Kürzeln das Kürzel an der Position der <Vorgang-VNR> in <BUE_VNR>)', 'DANN',
     'Lese das Feld „Sparte/Vers.Art“ aus und speichere den mittleren Wert (Versicherungsart, z. B. „KFZ / FK / J“ → „FK“) als <VA230-VersArt>.',
     'WENN', '<VA230-VersArt> = „FK“', 'DANN',
     '<BE-Klassifikation> = „KR Flottenvertrag“', BE_WEITER,
     'Ende WENN',
     'Ende WENN']
VERTRAG += [
 'Weiter zum Kapitel „V. Test auf Fehlerliste“'] + ([
 'Hinweis: Einen KR-Flottenvertrag erkennt der Bot in VA230 (VAF230 „Anzeige steuerrelevanter Daten“) am Feld „Sparte/Vers.Art“: die '
 'Versicherungsart „FK“ steht für einen Flottenvertrag, „KR“ für einen normalen KR-Vertrag (K. Rypa, 25.09.2026, siehe Screenshot). Jeder Vertrag '
 'unter einem Mantel wird als BE ausgesteuert, nicht nur der Mantel selbst. Die Sparte kommt aus dem Datenpoolfeld <BUE_SPARTE>; nennt der Auftrag '
 'mehrere Nummern, gilt das Kürzel an der Position der <Vorgang-VNR>.'] if KL else []) + [
 'Hinweis: Die <Vorgang-VNR> stammt aus dem VDB-Abruf durch Celonis und ist damit eine echte Nummer; ob ein Vertrag existiert, wird nicht '
 'eigens geprüft. Die Sparte des Vorgangs steht mit Dokumenttyp bzw. GeVo und dem Spartenkürzel der <Vorgang-VNR> fest, und mit ihr die Notizvariante.',
 'Hinweis: Rahmenverträge und Verträge im Mahnverfahren werden wie alle anderen Verträge geprüft.' +
 ('' if KL else ' Flotten und Flottenverträge mit führendem Mantel betreffen nur Komposit (KR).')]
t24 = T[24]
setze_zelle(t24.rows[0].cells[0], ['Screenshot: VA230, Feld Status'])
setze_zelle(t24.rows[0].cells[1], VERTRAG)

# --- V. Test auf Fehlerliste (T25)
setze_zelle(T[25].rows[0].cells[1], [
 'Hinweis: Alle Einzelprüfungen sind durchlaufen. Abweichungen aus den Einzelprüfungen wurden als Prüfnotizen in <Fehlerliste> gesammelt.',
 'WENN', '<Fehlerliste> <> leer', 'DANN',
 '<BE-Klassifikation> = „Nachprüfung erforderlich“', BE_WEITER,
 'Ende WENN',
 'Weiter zum Kapitel „VI. Abschluss ohne Befund“'])

# --- VI. Abschluss ohne Befund: T26 (Notiz), T27 (Uebergabe)
t26 = T[26]
zeilen_anpassen(t26, 2)                 # Zeile 2 (Abschnitt Sonstiges der alten Maske) entfaellt
# Zeile 1 traegt den Screenshot der alten Maske: durch die Notizmaske 1515 ersetzen
z1 = t26.rows[1].cells[0]
for p in list(z1.paragraphs):
    loesche(p._element)
z1._element.append(copy.deepcopy(t26.rows[0].cells[0].paragraphs[0]._element))
leere_laeufe(z1.paragraphs[0])
bild_in_zelle(z1, NOTIZBILD, 5.6)
setze_zelle(z1, ['Screenshot: Notizmaske 1515 „Bestandsübertragung Robotics PB“' + ('' if KL else ' – für KV bleibt der Abschnitt „Folgearbeit für Komposit“ leer')])
setze_zelle(t26.rows[0].cells[1], [
 'Hinweis: Es wurde keine Business Exception festgestellt und die Fehlerliste ist leer. Der Bot legt die Telefonnotiz an und bestückt sie '
 'Feld für Feld nach der folgenden Tabelle; danach wird der Vorgang mit der Notiz an den 72-Stunden-BOT übergeben.',
 'Hinweis: Eine Prüfung des Vertriebskanals des abgebenden Bestandsinhabers erfolgt im Prüf-Bot nicht. Der 72-Stunden-BOT prüft selbst, ob '
 'der Bestandsinhaber der AO zugeordnet ist, gibt in diesem Fall die 72-Stunden-Information aus und leitet alle übrigen Vorgänge ohne '
 'Wartezeit an den BÜ-BOT weiter.'])
setze_zelle(t26.rows[1].cells[1], [
 'Telefonnotiz anlegen: ' + ('Vorlage 1515 „Bestandsübertragung Robotics PB“.' if KL else
                             'Vorlage BOT2011 (Krankenversicherung); der Feldumfang entspricht der Notizmaske 1515, der Abschnitt '
                             '„Folgearbeit für Komposit“ bleibt leer. Ob die Vorlage bestückt oder eine Freitextnotiz mit gleichem Aufbau erzeugt wird, '
                             'ist durch den Fachbereich zu bestätigen.'),
 'Alle Felder werden ohne weitere Prüfung aus den Variablen übernommen (Ausfüllhinweise in der Tabelle unten).' +
 (' Die Telefonnotiz wird erst nach dem Schritt „Anforderung von Unterlagen in der Notiz kennzeichnen“ gespeichert.' if KL else ' Anschließend Telefonnotiz speichern.'),
 'Hinweis: Die Notiz beauftragt immer eine Einzel-BÜ für die <Vorgang-VNR>, nie eine Gesamt-BÜ. Auch bei <BUE_UMFANG> = „Gesamt“ läuft jede '
 'Versicherungsnummer als eigener Vorgang mit eigener Notiz; die übrigen Nummern stehen nur nachrichtlich in der Notiz.'])
NOTIZ = [
 ['Feld der Notizmaske', 'Pflicht', 'Eintrag', 'Quelle und Hinweis'],
 ['Eingangsdatum', 'ja', '<Eingangsdatum-BUE>', '<BUE_MV_EINGANGSDATUM>, sonst Eröffnungsdatum des Postkorbvorgangs; Format tt.mm.jjjj'],
 ['Maklername', 'ja', '<OB726-Name>', 'Feld „Name 1“ aus OB726 (Kapitel III)'],
 ['Agenturnummer', 'ja', '<BUE_AGENTUR_NR>', 'bereinigte Agenturnummer aus dem Datenpool, nur Ziffern'],
 ['Personalnummer', 'ja', '<OB726-PNR>', '7-stellig ohne Präfix „P,“ (Kapitel III)'],
 ['E-Mail aufnehmender Makler', 'nein', '<Makler-Email>', 'Kapitel III, Schritt „E-Mail-Adresse des übernehmenden Vermittlers ermitteln“'],
 ['Bearbeitung nach', 'ja', '„Untervollmacht fehlt“ oder „Mit BÜ-Wunsch“', 'Auswahl nach der Tabelle „Bearbeitung nach“ unten'],
 ['Rahmenvertrag übertragbar / Rahmenvertrag nicht übertragbar', 'nein', 'nicht setzen', 'fachlich nicht geregelt; Rahmenverträge werden wie alle anderen Verträge behandelt'],
 ['Betroffene VNR', 'ja', '„angegebene VNR beachten“', 'immer Einzel-BÜ; „gesamte Kundenverbindung“ und „angegebene VNR nicht beachten“ werden nie gewählt'],
 ['VNR', 'ja', '<Vorgang-VNR>', 'dahinter nachrichtlich die weiteren Nummern aus <BUE_VNR> und <BUE_VNR_2>, mit „;“ getrennt'],
]
if KL:
    NOTIZ += [
     ['Folgearbeit für Komposit – Police/Vertragsspiegel/Vertragsauszug/Ersatzrechnung usw.', 'nein', 'setzen, wenn <BUE_ART_UNTERLAGEN> die Art enthält', 'nur bei gefülltem <BUE_ART_UNTERLAGEN> (siehe „Anforderung von Unterlagen“ unten)'],
     ['Folgearbeit für Komposit – Schadenaufstellung/Schadenrenta usw.', 'nein', 'setzen, wenn <BUE_ART_UNTERLAGEN> die Art enthält', 'wie oben'],
     ['Folgearbeit für Komposit – Sonstige Unterlagen', 'nein', 'setzen, wenn <BUE_ART_UNTERLAGEN> die Art enthält', 'wie oben'],
    ]
else:
    NOTIZ += [['Folgearbeit für Komposit (drei Kennzeichen)', 'nein', 'nicht setzen', 'entfällt für die Krankenversicherung – die Anforderung von Unterlagen ist ein Thema von Komposit und Leben']]
NOTIZ += [
 ['Sonstiges: Dokumente für weitere VNR hochladen / eröffnen', 'nein', 'nicht setzen', 'fachlich nicht geregelt'],
 ['Komposit / Leben / KV (Freitext)', 'nein', ('„Komposit“ oder „Leben“ nach <BUE_SPARTE>' if KL else '„KV“'),
  ('Zuordnung der Spartenkürzel zu Komposit und Leben durch den Fachbereich zu liefern; ' if KL else 'nachrichtlich; ') + 'bei <BUE_UMFANG> = „Gesamt“ zusätzlich „Auftrag: gesamte Kundenverbindung“'],
 ['Laufende Nr. aus Vorgangsdatenbank', 'ja', '<Vorgang-Lfd-Nr>', 'mehrere Nummern werden nur mit „,“ getrennt'],
]
t_notiz = tabelle_nach_element(t26._element, T[8], NOTIZ)
breite(t_notiz, [20, 8, 27, 45])
BEARB = [
 ['Wert „Bearbeitung nach“', 'Bedingung'],
 ['Untervollmacht fehlt', '<BUE_POOL> <> leer UND <BUE_UV_ERTEILT> = „nein“ – Einreichung über einen Pool ohne erteilte Untervollmacht'],
 ['Mit BÜ-Wunsch', 'alle übrigen Fälle, auch beim Mehrfachagenten (<BUE_UV_ERTEILT> = N/A)'],
]
t_bearb = tabelle_nach_element(t_notiz._element, T[1], BEARB)
breite(t_bearb, [28, 72])
letztes = t_bearb._element
if KL:
    ctx_u = absatz_nach(t_bearb._element, 'Anforderung von Unterlagen in der Notiz kennzeichnen', 'fachlicher Kontext')
    UNTERLAGEN = [
     'Hinweis: Dieser Schritt steuert nicht die Prüfung, sondern die Folgearbeit. <BUE_ART_UNTERLAGEN> nennt die Unterlagen, die der übernehmende '
     'Makler zum Vertrag anfordert und die ERGO ihm liefert, mit Semikolon getrennt; das Feld ist leer, wenn er nichts anfordert. Die Anforderung ist '
     'unabhängig von der Vollständigkeitsprüfung der eingereichten Unterlagen in der Vorprüfung.',
     'WENN', '<BUE_ART_UNTERLAGEN> <> leer', 'DANN',
     'Setze im Abschnitt „Folgearbeit für Komposit“ je in <BUE_ART_UNTERLAGEN> enthaltener Art das Kennzeichen: „Police/Vertragsspiegel/Vertragsauszug/Ersatzrechnung usw.“, '
     '„Schadenaufstellung/Schadenrenta usw.“, „Sonstige Unterlagen“.',
     'Ende WENN',
     'Telefonnotiz speichern.',
     'Hinweis: Die Bestätigung der Bestandsübertragung ist keine Unterlagenart; sie erfolgt mit dem automatischen Vertragsspiegel. Eine '
     'Unterlagenart, die keinem Kennzeichen zuzuordnen ist, wird als „Sonstige Unterlagen“ gesetzt.',
     'Hinweis: Ob Celonis zusätzlich einen eigenen GeVo „Anforderung von Unterlagen“ eröffnet, ist mit Celonis festzulegen, damit nicht doppelt '
     'angefordert wird. Die Bedeutung des Feldes (Anforderung durch den Makler) ist durch den Fachbereich zu bestätigen.',
    ]
    t_unt = tabelle_nach_element(ctx_u, T[25], [['', UNTERLAGEN]])
    letztes = t_unt._element
# T27: Uebergabe
t27 = T[27]
setze_zelle(t27.rows[0].cells[1], [
 'Den bestehenden Postkorbvorgang mit der Telefonnotiz an den 72-Stunden-BOT weiterleiten (Themenpostkorb „HSB4 K 72 - Erstinformation“, Postkorb-Nr. TBD).',
 'Verarbeitung beenden. Status „Completed“ wird nur gesetzt, wenn Telefonnotiz und Weiterleitung erfolgreich ausgeführt wurden.',
 'Hinweis: Es gilt Variante A (K. Rypa, 17.09.2026): Der bestehende Vorgang wird weitergeleitet, es wird kein neuer Vorgang eröffnet.',
 'Hinweis: Jeder Vorgang ohne Befund geht an den 72-Stunden-BOT, auch wenn der abgebende Bestandsinhaber selbst ein Makler ist (Makler auf '
 'Makler). Der 72-Stunden-BOT erkennt diesen Fall und leitet ihn ohne Wartefrist direkt an den BÜ-BOT weiter; der Prüf-Bot braucht dafür keine '
 'eigene Weiche (E. Brenneisen, 23.09.2026).'])

# --- VII. Abschluss mit Befund (T28)
ROUTING = (['WENN', '<OB726-AGT-Inh-Vertriebskanal> in (2200, 2215, 2271, 2281, 2300, 2301, 2302, 2400) – Makler- und Kooperationsvertrieb', 'DANN',
            'Vorgang an den Themenpostkorb „ODPP1 D - Ma/Ma Bestandsübertragungen“ (Postkorb-Nr. TBD) weiterleiten',
            'SONST',
            'Vorgang an den Themenpostkorb „HSB4 K KO Komposit / Leben Posteingang“ (Postkorb-Nr. TBD) weiterleiten',
            'Ende WENN'] if KL else
           ['Vorgang an den Themenpostkorb „HSB4 K MV Gesundheit Posteingang“ (Postkorb-Nr. TBD) weiterleiten'])
BE_LISTE = ['Keine Bestandsübertragung möglich: <BUE_VERMITTLER_TYP>', 'Agenturnummer nicht vorhanden', 'BÜ-Wunsch nicht vorhanden', 'Betreuungswunsch nicht auf MFA ausgestellt', 'Unterschrift VN fehlt',
            'Vertrag zur VNR nicht gefunden', 'Kunde in IS011 nicht gefunden', 'Kunde ist nicht Versicherungsnehmer', 'Vertrag gehört nicht zum Kunden',
            'Agenturnummer in OB726 unbekannt', 'Keine Zusammenarbeit',
            'Vertrag nicht aktuell: <VA230-Status>'] + (['KR Flottenvertrag'] if KL else []) + ['Nachprüfung erforderlich']
NOTIZ_LISTE = ['Unterlagen nicht vollständig: <BUE_PRUEFUNG_UNTERLAGEN>', 'Geburtsdatum abweichend',
               'Bestandsinhaber nicht ermittelbar', 'Anbindung Bestandsinhaber nicht aktiv', 'Vermittlertyp abweichend',
               'E-Mail-Adresse des Vermittlers fehlt', 'Absender ist eine interne ERGO-Adresse']
BE = [
 'Hinweis: Jede Business Exception wird an dieser Stelle einheitlich behandelt. <BE-Klassifikation> trägt den Grund der BE; <Fehlerliste> '
 'enthält die in den Einzelprüfungen gesammelten Prüfnotizen. Das Routing ist für harte Business Exceptions und für „Nachprüfung '
 'erforderlich“ identisch; es unterscheidet sich nur im Inhalt des Bearbeitungshinweises.',
 '<BE> = „ja“ setzen',
 'Bearbeitungshinweis in drei Abschnitten füllen – „BE:“, „Fehler:“, „Hinweis:“ – nach der Tabelle „Aufbau des Bearbeitungshinweises“ unten.',
 'Bearbeitungshinweis am Postkorbvorgang speichern' + (' (Notiz am Postkorbvorgang; Anwendung und Vorlage durch den Fachbereich zu bestätigen)' if KL
                                                    else ' (ErgoNotiz, Vorlage 2011, siehe Screenshot)'),
] + ROUTING + [
 'Report: <BE-Klassifikation> und <Fehlerliste> in das Reporting übernehmen (Status Referred)',
 'Verarbeitung dieses Vorgangs beenden, weiter mit dem nächsten Vorgang',
 'Hinweis: Nennt der Auftrag mehrere Versicherungsnummern, wird zu jeder Nummer ein eigener Vorgang geprüft. Die vollständige Liste steht im '
 'Abschnitt „Hinweis:“ des Bearbeitungshinweises („Weitere VNR“), damit die Sachbearbeitung den Zusammenhang der Vorgänge erkennt.',
 'Hinweis: Auch bei einer harten Business Exception werden die bis dahin gemerkten Prüfnotizen im Abschnitt „Fehler:“ ausgegeben; die '
 'Sachbearbeitung sieht so alle Abweichungen auf einen Blick.',
 ('Hinweis: Bei Komposit und Leben entscheidet der Vertriebskanal des abgebenden Bestandsinhabers aus OB726 (Kapitel II): die Kanäle des Makler- und '
  'Kooperationsvertriebs (2200, 2215, 2271, 2281, 2300, 2301, 2302, 2400; 2720 noch zu bestätigen) führen nach „ODPP1 D - Ma/Ma Bestandsübertragungen“, '
  'alle übrigen Kanäle gehören zur AO (z. B. 2050, 2100, 2111, 2130, 2151, 2800) und führen nach „HSB4 K KO Komposit / Leben Posteingang“ (K. Rypa, 25.09.2026). '
  'Ist der Bestandsinhaber nicht ermittelbar oder endet die Prüfung vor Kapitel II, geht der Vorgang nach HSB4 K KO (Vorschlag, durch den Fachbereich zu bestätigen).' if KL else
  'Hinweis: Vorgänge ohne Befund werden dunkel verarbeitet und laufen nicht in diesen Postkorb.'),
 'Hinweis: Alle Werte von <BE-Klassifikation> und alle Prüfnotizen stehen mit Kapitel und Auslöser in den Tabellen „Werteliste der '
 'BE-Klassifikation“ und „Werteliste der Prüfnotizen“ unten.']
t28 = T[28]
if KL:
    for _p in t28.rows[0].cells[0].paragraphs:
        for _r in list(_p.runs):
            if '<w:drawing>' in _r._element.xml:
                _r._element.getparent().remove(_r._element)
setze_zelle(t28.rows[0].cells[0], ['Screenshot: ' + ('Bearbeitungshinweis – durch Fachbereich zu ergänzen' if KL else 'ErgoNotiz, Vorlage 2011 für den Bearbeitungshinweis')])
setze_zelle(t28.rows[0].cells[1], BE)
ctx_be = absatz_nach(t28._element, 'Aufbau des Bearbeitungshinweises', 'fachlicher Kontext')
AUFBAU = [
 ['Abschnitt', 'Zeilen im Bearbeitungshinweis', 'Regel', 'Beispiel'],
 ['BE', '„BE: “ + <BE-Klassifikation>', 'immer genau eine Zeile; Werte siehe Tabelle „Werteliste der BE-Klassifikation“ unten', 'BE: Nachprüfung erforderlich'],
 ['Fehler', ['„Fehler:“', 'darunter je Prüfnotiz aus <Fehlerliste> eine eigene Zeile'],
  'Reihenfolge, in der die Prüfnotizen gemerkt wurden; ist <Fehlerliste> leer, lautet die Zeile „Fehler: keine“',
  ['Fehler:', 'Unterlagen nicht vollständig: MV fehlt', 'Vermittlertyp abweichend']],
 ['Hinweis', ['„Hinweis:“', 'darunter „Weitere VNR: “ + <BUE_VNR> + „; “ + <BUE_VNR_2>'],
  'alle im Auftrag genannten Versicherungsnummern, wie im Datenpool geliefert; <BUE_VNR_2> nur, wenn gefüllt. Der Abschnitt ist für weitere '
  'Hinweise vorgesehen, die später ergänzt werden können, ohne den Aufbau zu ändern.',
  ['Hinweis:', 'Weitere VNR: KV204071336; KV204071337']],
]
t_aufbau = tabelle_nach_element(ctx_be, T[8], AUFBAU)
breite(t_aufbau, [12, 30, 33, 25])
ctx_bel = absatz_nach(t_aufbau._element, 'Werteliste der BE-Klassifikation', 'fachlicher Kontext')
WERTE_BE = [
 ['Wert von <BE-Klassifikation>', 'Gesetzt in', 'Auslöser'],
 ['Keine Bestandsübertragung möglich: <BUE_VERMITTLER_TYP>', 'Kapitel „Vorprüfung“', '<BUE_VERMITTLER_TYP> = „Courtagefortzahler“ oder „Kontaktgeber“ – der Typ wird mitgeführt'],
 ['Agenturnummer nicht vorhanden', 'Kapitel „Vorprüfung“', '<BUE_AGENTUR_NR> = leer'],
 ['BÜ-Wunsch nicht vorhanden', 'Kapitel „Vorprüfung“', 'Mehrfachagent: <BUE_WUNSCH_VORHANDEN> = „nein“'],
 ['Betreuungswunsch nicht auf MFA ausgestellt', 'Kapitel „Vorprüfung“', 'Mehrfachagent: <BUE_MV_AUF_MAKLER> <> „ja“'],
 ['Unterschrift VN fehlt', 'Kapitel „Vorprüfung“', 'Makler: <BUE_MV_UNTERSCHRIFT_KUNDE> <> „ja“'],
 ['Vertrag zur VNR nicht gefunden', 'Kapitel „I. Kunde (VN)“', 'IS011 zeigt zur <Vorgang-VNR> keine Stammdaten'],
 ['Kunde in IS011 nicht gefunden', 'Kapitel „I. Kunde (VN)“', 'Trefferliste der Matchcodesuche leer, auch nach der Wiederholung ohne Geburtsdatum'],
 ['Kunde ist nicht Versicherungsnehmer', 'Kapitel „I. Kunde (VN)“', '<IS011-KNR-VN> nicht in der Trefferliste, oder der gefundene Partner ist am Vertrag in anderer Rolle beteiligt'],
 ['Vertrag gehört nicht zum Kunden', 'Kapitel „I. Kunde (VN)“', 'gefundener Partner ohne die <Vorgang-VNR> in seiner Vertragsübersicht (Scout-Service)'],
 ['Agenturnummer in OB726 unbekannt', 'Kapitel „III. Übernehmender Makler“', 'Hinweistext „IS0042I“ beim Aufruf mit <BUE_AGENTUR_NR>'],
 ['Keine Zusammenarbeit', 'Kapitel „III. Übernehmender Makler“', '<OB726-Name> enthält „INAKTIV“ oder Status der Beschäftigung in GH040 <> „aktiv“'],
 ['Vertrag nicht aktuell: <VA230-Status>', 'Kapitel „IV. Vertrag“', '<VA230-Status> <> „aktuell“'],
] + ([['KR Flottenvertrag', 'Kapitel „IV. Vertrag“', '<BUE_SPARTE> = „KR“ und <VA230-VersArt> = „FK“']] if KL else []) + [
 ['Nachprüfung erforderlich', 'Kapitel „V. Test auf Fehlerliste“', '<Fehlerliste> <> leer'],
]
t_werte_be = tabelle_nach_element(ctx_bel, t21, WERTE_BE)
breite(t_werte_be, [30, 22, 48])
ctx_pn = absatz_nach(t_werte_be._element, 'Werteliste der Prüfnotizen', 'fachlicher Kontext')
WERTE_PN = [
 ['Prüfnotiz in <Fehlerliste>', 'Gemerkt in', 'Auslöser'],
 ['Unterlagen nicht vollständig: <BUE_PRUEFUNG_UNTERLAGEN>', 'Kapitel „Vorprüfung“', 'Makler: Feldwert weder „Vollständig“ noch leer noch „Reminder - keine Vollst.-Prüfung“'],
 ['Geburtsdatum abweichend', 'Kapitel „I. Kunde (VN)“', '<IS011-Gebdat> <> <BUE_KUNDE_GEBDAT>'],
 ['Bestandsinhaber nicht ermittelbar', 'Kapitel „II. Abgebender Bestandsinhaber“', 'Feld „Betreuung“ in VA230 leer oder Hinweistext „IS0042I“ in OB726'],
 ['Anbindung Bestandsinhaber nicht aktiv', 'Kapitel „II. Abgebender Bestandsinhaber“', 'Status der Beschäftigung in GH040 <> „aktiv“'],
 ['Vermittlertyp abweichend', 'Kapitel „III. Übernehmender Makler“', '<BUE_VERMITTLER_TYP> passt nicht zu <OB726-Klassifizierung>'],
 ['E-Mail-Adresse des Vermittlers fehlt', 'Kapitel „III. Übernehmender Makler“', '<Makler-Email> = leer'],
 ['Absender ist eine interne ERGO-Adresse', 'Kapitel „III. Übernehmender Makler“', '<Makler-Email> enthält „@ergo“'],
]
t_werte_pn = tabelle_nach_element(ctx_pn, t21, WERTE_PN)
breite(t_werte_pn, [30, 22, 48])
for _t in (t_werte_be, t_werte_pn):
    for _r in _t.rows:
        for _c in _r.cells:
            for _p in _c.paragraphs:
                fmt.schreibe(_p, _p.text, 0)
for _t in (t21, t_liste, t_bearb, t_werte_be, t_werte_pn, t7, t8, t9, d.tables[6]):
    kopfzeile(_t)
for _t in (t_notiz, t_aufbau, t_var):
    kopfzeile(_t, wiederholen=True)
for _t in (t_email, t23):
    pass
# M5/M7: Bildunterschriften und leere Screenshot-Zellen
bildunterschrift(T[17].rows[0].cells[0], 'Screenshot: IS011/VAF017 „Anzeigen Stammdaten“, Feld KD und Geb.-Dat')
bildunterschrift(t18.rows[1].cells[0], 'Screenshot: IS011/VAF121 „Match-Code-Suche Bestand“, Suchfelder')
bildunterschrift(t18.rows[2].cells[0], 'Screenshot: IS011/VAF121, Trefferliste mit Spalte KNR')
bildunterschrift(t18.rows[3].cells[0], 'Screenshot: IS011/VAF017 bei genau einem Treffer, Feld KD')
bildunterschrift(t18.rows[4].cells[0], 'Screenshot: Scout-Service, Vertragsübersicht zur Kundennummer; IS011, Vertragszeile mit Rolle VN')
bildunterschrift(T[19].rows[0].cells[0], 'Screenshot: VA230, Feld Betreuung (Agentur-Nr. des Bestandsinhabers)')
bildunterschrift(t20.rows[0].cells[0], 'Screenshot: OB726 zum abgebenden Bestandsinhaber, PNR hinter „P“')
bildunterschrift(t20.rows[1].cells[0], 'Screenshot: GH040, Zeile Status der Beschäftigung')
bildunterschrift(t22.rows[0].cells[0], 'Screenshot: OB726, Einstieg über die Agenturnummer, PNR hinter „P“')
bildunterschrift(t22.rows[1].cells[0], 'Screenshot: OB726, Feld Name 1')
bildunterschrift(t22.rows[2].cells[0], 'Screenshot: OB726, Kopfzeile mit Vermittler-Nr. und Klassifizierung')
bildunterschrift(t23.rows[0].cells[0], 'Screenshot: GH040, Zeile Status der Beschäftigung des übernehmenden Vermittlers')
bildunterschrift(t15.rows[0].cells[0], 'Screenshot: Themenpostkorb, Vorgangsübersicht')
bildunterschrift(t24.rows[0].cells[0], 'Screenshot: VA230, Feld Status')
bildunterschrift(t26.rows[1].cells[0], 'Screenshot: Notizmaske 1515 „Bestandsübertragung Robotics PB“' + ('' if KL else ' – für KV bleibt der Abschnitt „Folgearbeit für Komposit“ leer'))
if not KL:
    bildunterschrift(t28.rows[0].cells[0], 'Screenshot: ErgoNotiz, Vorlage 2011 für den Bearbeitungshinweis')
# Screenshots aus der Rueckmeldung K. Rypa (25.09.2026): KI-Deckblatt, IS011 (vom Fachbereich geschwaerzt), OB729, KV-Notizvorlage, VA230 KR und Flotte
_sp = 'kl' if KL else 'kv'
bilder_setzen(T[16].rows[0].cells[0], [shot('ki_deckblatt.png')], 7.6, 'Screenshot: KI-Deckblatt (Celonis) mit den Feldern des Datenpools zum Postkorbvorgang')
bilder_setzen(t18.rows[1].cells[0], [shot('is011_vaf121_suche_%s.png' % _sp)], 12.3, 'Screenshot: IS011/VAF121 „Match-Code-Suche Bestand“, Suchfelder')
bilder_setzen(t18.rows[2].cells[0], [shot('is011_vaf121_treffer_%s.png' % _sp)], 12.3, 'Screenshot: IS011/VAF121, Trefferliste mit Spalte KNR')
bilder_setzen(t_email.rows[0].cells[0], [shot('ob729_email.png')], 12.3, 'Screenshot: OB729 (OBF722 „Anzeige AGT Betreuungsvermerk“), E-Mail-Adresse im Betreuungsvermerk')
if KL:
    bilder_setzen(T[19].rows[0].cells[0], [shot('va230_kr_betreuung.png')], 12.3, 'Screenshot: VA230 zu einem KR-Vertrag, Feld Betreuung (Agentur-Nr. des Bestandsinhabers)')
    bilder_setzen(t24.rows[0].cells[0], [shot('va230_kr_flotte.png')], 12.3,
                  'Screenshot: VA230, Feld Status (oben); VA230/VAF230 mit Feld „Sparte/Vers.Art“ = „KFZ / FK / J“, also KR-Flottenvertrag (unten)', behalten=True)
else:
    bilder_setzen(t26.rows[1].cells[0], [shot('notiz_bot2011_kv.png')], 8.0, 'Screenshot: Notizvorlage BOT2011 „BÜ auf Makler Robotics“ (Krankenversicherung)')
_leer_ok = 0
for _t in tabellen_schritt():
    for _r in _t.rows:
        _c = _r.cells[0]
        if not fmt.hat_bild(_c.paragraphs[0]) and not any(fmt.hat_bild(_p) for _p in _c.paragraphs) and not _c.text.strip():
            setze_zelle(_c, ['kein Screenshot erforderlich'])
            for _p in _c.paragraphs:
                for _run in _p.runs:
                    _run.font.size = Pt(8); _run.font.italic = True; _run.font.color.rgb = fmt.RGBColor(0x9A, 0x9A, 0x9A)
            _leer_ok += 1
OHNE_FORMAT = {id(t_aufbau._element)}          # feste Zeilen („Hinweis:“) sind hier Inhalt, keine Hinweise
for r in t_aufbau.rows:
    gesehen = set()
    for c in r.cells:
        if id(c._element) in gesehen:
            continue
        gesehen.add(id(c._element))
        for p in c.paragraphs:
            fmt.schreibe(p, p.text, 0)

# ------------------------------------------------- 11. Querverweise und Restbereinigung
ersetze_ueberall([
 ('Weiter mit 11. Schritt: Umgang mit Business Exceptions (zentral)', BE_WEITER),
 ('Weiter zum Kapitel „BE-Handling“', BE_WEITER),
 ('Weiter zum Kapitel „VIII. Abschluss mit Befund“', BE_WEITER),
 ('Kapitel „VIII. Abschluss mit Befund“', 'Kapitel „' + KAP_BEFUND + '“'),
 ('Kapitel „BE-Handling“', 'Kapitel „' + KAP_BEFUND + '“'),
 ('Kapitel „Test auf Fehlerliste“', 'Kapitel „V. Test auf Fehlerliste“'),
 ('EWMS-Postkorb', 'Themenpostkorb'), ('EMWS-Postkorb', 'Themenpostkorb'), ('im EWMS', 'im Themenpostkorb'),
 ('ENDEWENN', 'Ende WENN'), ('ENDWENN', 'Ende WENN'), ('desciption', 'description'),
])

# ------------------------------------------------- 11b. Variablentabelle: alphabetisch, mit Verwendung je Kapitel
KAPITEL_KURZ = [('Start –', 'Start'), ('Vorprüfung –', 'Vorprüfung'), ('I. ', 'I'), ('II. ', 'II'), ('III. ', 'III'),
                ('IV. ', 'IV'), ('V. ', 'V'), ('VI. ', 'VI'), ('VII. ', 'VII')]
REIHENFOLGE = [k for _, k in KAPITEL_KURZ]


def kapitel_nutzung(namen):
    """Liest je Variable, in welchen Schrittkapiteln sie vorkommt."""
    nutzung = {n: {} for n in namen}
    aktuell = None
    start = finde_absatz('Schritt für Schritt-Beschreibung')._element
    el = start
    while True:
        el = el.getnext()
        if el is None:
            break
        if el.tag == qn('w:p'):
            p = Paragraph(el, d)
            if p.style.name == 'Heading 2':
                t = p.text.strip()
                aktuell = next((k for a, k in KAPITEL_KURZ if t.startswith(a)), None)
        elif el.tag == qn('w:tbl') and aktuell:
            for r in Table(el, d).rows:
                gesehen = set()
                for c in r.cells:
                    if id(c._element) in gesehen:
                        continue
                    gesehen.add(id(c._element))
                    for p in c.paragraphs:
                        text = p.text
                        for n in namen:
                            if aktuell in nutzung[n]:
                                continue
                            if ('<' + n + '>') in text or (n.startswith('BUE_') and re.search(r'\b' + re.escape(n) + r'\b', text)):
                                nutzung[n][aktuell] = p        # erste Stelle im Kapitel, an der die Variable vorkommt
    return nutzung


def spalte_anfuegen(tabelle, kopftext, breite):
    """Haengt rechts eine Spalte an; die Breite wird der letzten Spalte abgezogen."""
    grid = tabelle._element.find(qn('w:tblGrid'))
    alt = grid[-1]
    alt_w = int(alt.get(qn('w:w')))
    alt.set(qn('w:w'), str(alt_w - breite))
    gc = copy.deepcopy(alt)
    gc.set(qn('w:w'), str(breite))
    grid.append(gc)
    for r in tabelle.rows:
        tcs = r._element.findall(qn('w:tc'))
        for tc, w in ((tcs[-1], alt_w - breite),):
            tcPr = tc.find(qn('w:tcPr'))
            tcW = tcPr.find(qn('w:tcW')) if tcPr is not None else None
            if tcW is not None:
                tcW.set(qn('w:w'), str(w)); tcW.set(qn('w:type'), 'dxa')
        neu = copy.deepcopy(tcs[-1])
        r._element.append(neu)
        tcPr = neu.find(qn('w:tcPr'))
        tcW = tcPr.find(qn('w:tcW')) if tcPr is not None else None
        if tcW is not None:
            tcW.set(qn('w:w'), str(breite)); tcW.set(qn('w:type'), 'dxa')
    setze_zelle(tabelle.rows[0].cells[-1], [kopftext])
    for p in tabelle.rows[0].cells[-1].paragraphs:
        p.style = 'Table Heading'


VAR.sort(key=lambda v: v[0].lower())
nutzung = kapitel_nutzung([v[0] for v in VAR])


def verwendung_kapitel(var):
    """Kapitel, in denen die Variable wirklich verwendet wird: „Start“ zaehlt nur, wenn die Variable dort gelesen wird
    und sonst nirgends vorkommt; nicht gelesene Datenpoolfelder haben keine Verwendung."""
    if var in NICHT_GELESEN:
        return []
    kaps = [k for k in REIHENFOLGE if k in nutzung[var] and k != 'Start']
    return kaps or (['Start'] if 'Start' in nutzung[var] else [])
spalte_anfuegen(t_var, 'Verwendung / used in', 1700)
breite(t_var, [16, 15, 17, 12, 32, 8])
zeilen_anpassen(t_var, len(VAR) + 1)
for r, werte in zip(t_var.rows[1:], VAR):
    kaps = verwendung_kapitel(werte[0])
    kap = ', '.join(kaps)
    for c, w in zip(r.cells, list(werte) + [kap or '–']):
        setze_zelle(c, [w])

# ------------------------------------------------- 11c. Echte Querverweise: Textmarken an den Kapiteln, Links in den Schritten
from docx.oxml import OxmlElement
_marke_nr = [900]


def lesezeichen(absatz, name):
    """Setzt eine Textmarke um den Inhalt des Absatzes."""
    _marke_nr[0] += 1
    p = absatz._element
    bs = OxmlElement('w:bookmarkStart'); bs.set(qn('w:id'), str(_marke_nr[0])); bs.set(qn('w:name'), name)
    be = OxmlElement('w:bookmarkEnd'); be.set(qn('w:id'), str(_marke_nr[0]))
    pPr = p.find(qn('w:pPr'))
    if pPr is not None:
        pPr.addnext(bs)
    else:
        p.insert(0, bs)
    p.append(be)


def verlinke(absatz, name):
    """Macht den ganzen Absatz zu einem internen Link auf die Textmarke `name`."""
    text = absatz.text
    leere_laeufe(absatz)
    h = OxmlElement('w:hyperlink'); h.set(qn('w:anchor'), name); h.set(qn('w:history'), '1')
    r = OxmlElement('w:r'); rPr = OxmlElement('w:rPr')
    rs = OxmlElement('w:rStyle'); rs.set(qn('w:val'), 'Hyperlink'); rPr.append(rs)
    farbe = OxmlElement('w:color'); farbe.set(qn('w:val'), 'auto'); rPr.append(farbe); r.append(rPr)
    t = OxmlElement('w:t'); t.text = text; t.set(qn('xml:space'), 'preserve'); r.append(t)
    h.append(r)
    absatz._element.append(h)


def marken_name(schluessel):
    return 'Kap_' + re.sub(r'[^A-Za-z0-9]', '', schluessel)[:30]


kapitel = {}                                        # Kurzname -> Textmarke (Schrittkapitel)
ueberschriften = {}                                 # Kurzname -> Textmarke (alle Ueberschriften)
kontexte = {}                                       # fachlicher Kontext -> Textmarke
toc_kapitel = []                                    # (Absatz, Ebene, Textmarke) fuer das Inhaltsverzeichnis
start = finde_absatz('Schritt für Schritt-Beschreibung')._element
im_schrittteil = False
tabellen_ab = []
for art, obj, el in list(elemente()):
    if el is start or (art == 'p' and obj.text.strip() == 'Schritt für Schritt-Beschreibung'):
        im_schrittteil = True
    if art == 'p':
        stil = obj.style.name
        if stil in ('Heading 1', 'Heading 2', 'Heading 3') and obj.text.strip():
            voll = ' '.join(obj.text.split())
            kurz = re.split(r' – | / | „', voll)[0].strip()
            name = marken_name(('H' if not im_schrittteil else '') + kurz)
            lesezeichen(obj, name)
            ueberschriften.setdefault(kurz, name)
            toc_kapitel.append((obj, int(stil[-1]), name, voll))
            if im_schrittteil and stil == 'Heading 2':
                kapitel[kurz] = name
        elif stil == 'fachlicher Kontext' and im_schrittteil and obj.text.strip():
            name = marken_name('K' + obj.text.strip())
            lesezeichen(obj, name)
            kontexte[obj.text.strip()] = name
    elif art == 't' and im_schrittteil:
        tabellen_ab.append(obj)
VERWEIS = re.compile(r'^Weiter (?:zum Kapitel|zu) „([^“]+)“$')
SCHRITT = re.compile(r'^Weiter mit „([^“]+)“')
lokal = {'Geburtsdatum abgleichen': 'Schritt_Gebdat', 'Grund der Abweichung bestimmen': 'Schritt_Abweichung', 'Lese den Maskennamen': 'Schritt_Maskenname'}
for tb in tabellen_ab:
    for r in tb.rows:
        gesehen = set()
        for c in r.cells:
            if id(c._element) in gesehen:
                continue
            gesehen.add(id(c._element))
            for p in c.paragraphs:
                t = p.text.strip()
                if t == 'Geburtsdatum abgleichen:':
                    lesezeichen(p, lokal['Geburtsdatum abgleichen'])
                if t.startswith('Grund der Abweichung bestimmen'):
                    lesezeichen(p, lokal['Grund der Abweichung bestimmen'])
                if t == 'Lese den Maskennamen.':
                    lesezeichen(p, lokal['Lese den Maskennamen'])
                m = VERWEIS.match(t)
                if m and m.group(1) in kapitel:
                    verlinke(p, kapitel[m.group(1)])
                    continue
                m = SCHRITT.match(t)
                if m and m.group(1) in lokal:
                    verlinke(p, lokal[m.group(1)])
fehlend = set()
for tb in tabellen_ab:
    for r in tb.rows:
        for c in r.cells:
            for p in c.paragraphs:
                m = VERWEIS.match(p.text.strip())
                if m and m.group(1) not in kapitel:
                    fehlend.add(m.group(1))
if fehlend:
    print('WARNUNG: Querverweise ohne Ziel:', fehlend)

_st = d.styles['fachlicher Kontext'].element.find(qn('w:pPr'))
if _st is not None:
    for _x in _st.findall(qn('w:outlineLvl')):
        _st.remove(_x)
for _p in d.paragraphs:
    if _p.style.name == 'fachlicher Kontext':
        _pPr = _p._element.find(qn('w:pPr'))
        if _pPr is not None:
            for _x in _pPr.findall(qn('w:numPr')) + _pPr.findall(qn('w:outlineLvl')):
                _pPr.remove(_x)
# M3: SIPOC auf Satzbreite
_sp = d.sections[-1]; _text_emu = _sp.page_width - _sp.left_margin - _sp.right_margin
for _dr in BODY.iter(qn('w:drawing')):
    if 'diagram' in _dr.xml and 'dgm' in _dr.xml or 'relationships/diagramData' in _dr.xml:
        for _ext in list(_dr.iter(qn('wp:extent'))) + list(_dr.iter(qn('a:ext'))):
            cx = int(_ext.get('cx')); cy = int(_ext.get('cy'))
            if cx > _text_emu:
                _ext.set('cx', str(_text_emu)); _ext.set('cy', str(int(cy * _text_emu / cx)))
# M4: Leerabsatzstapel vor Hauptueberschriften weg, Hauptkapitel auf neue Seite; Zeilenumbrueche in der Ueberschrift raus
for _p in list(d.paragraphs):
    if _p.style.name == 'Heading 1':
        for _br in list(_p._element.iter(qn('w:br'))):
            _br.getparent().remove(_br)
        _pPr = _p._element.get_or_add_pPr()
        if _pPr.find(qn('w:pageBreakBefore')) is None and _p.text.strip() not in ('Versionierung', 'Einleitung'):
            _pPr.insert(0, OxmlElement('w:pageBreakBefore'))
        _v = _p._element.getprevious()
        while _v is not None and _v.tag == qn('w:p') and not ''.join(_v.itertext()).strip() and '<w:drawing>' not in _v.xml and 'fldChar' not in _v.xml:
            _vv = _v.getprevious(); loesche(_v); _v = _vv
# M10: alle Tabellen auf Satzbreite skalieren
_text_w = int(_text_emu / 635)
for _t in d.tables:
    _grid = _t._element.find(qn('w:tblGrid'))
    _g = [int(c.get(qn('w:w'))) for c in _grid]
    if _g and sum(_g) != _text_w:
        _f = _text_w / float(sum(_g))
        _neu = [int(x * _f) for x in _g]
        for c, w in zip(_grid, _neu):
            c.set(qn('w:w'), str(w))
        _tblPr = _t._element.find(qn('w:tblPr')); _tw = _tblPr.find(qn('w:tblW'))
        if _tw is not None:
            _tw.set(qn('w:w'), str(sum(_neu))); _tw.set(qn('w:type'), 'dxa')
        for _r in _t.rows:
            for _tc in _r._element.findall(qn('w:tc')):
                _tcPr = _tc.find(qn('w:tcPr')); _tcW = _tcPr.find(qn('w:tcW')) if _tcPr is not None else None
                if _tcW is not None and _tcW.get(qn('w:type')) == 'dxa':
                    _tcW.set(qn('w:w'), str(int(int(_tcW.get(qn('w:w'))) * _f)))
        for _x in _tblPr.findall(qn('w:tblInd')):
            _tblPr.remove(_x)
# ------------------------------------------------- 12. Formatierung der Schrittkapitel
start = finde_absatz('Schritt für Schritt-Beschreibung')._element
el = start
while el is not None:
    el = el.getnext()
    if el is None:
        break
    if el.tag == qn('w:tbl') and id(el) not in OHNE_FORMAT:
        fmt.formatiere_tabelle(Table(el, d))

# Leere Screenshot-Zellen: Vermerk klein und grau (nach der Formatierung, die Laeufe neu setzt)
for _t in tabellen_schritt():
    for _r in _t.rows:
        _c = _r.cells[0]
        if _c.text.strip() == 'kein Screenshot erforderlich':
            for _p in _c.paragraphs:
                for _run in _p.runs:
                    _run.font.size = Pt(8); _run.font.italic = True; _run.font.color.rgb = fmt.RGBColor(0x9A, 0x9A, 0x9A)

# Querverweise im Fliesstext als Links (Kapitel „…“, (Kapitel III), Schritt „…“)
ROEMISCH = {k.split('.')[0]: v for k, v in kapitel.items() if '.' in k}
ZIELE = []
for kurz, name in list(kapitel.items()) + list(ueberschriften.items()):
    ZIELE.append((re.compile(r'Kapitel („' + re.escape(kurz) + r'“)'), name))
for kurz, name in kontexte.items():
    ZIELE.append((re.compile(r'Schritt („' + re.escape(kurz) + r'“)'), name))
    ZIELE.append((re.compile(r'Tabelle („' + re.escape(kurz) + r'“)'), name))
for roem, name in ROEMISCH.items():
    ZIELE.append((re.compile(r'(Kapitel ' + roem + r')(?![IVX.])'), name))
# Spalte „Verwendung“ der Variablentabelle: jedes Kapitelkuerzel springt an die erste Stelle, an der die Variable im Kapitel vorkommt
_var_marken = {}
for r, werte in zip(t_var.rows[1:], VAR):
    ziele_var = []
    kaps = verwendung_kapitel(werte[0])
    for kz in kaps:
        p_ziel = nutzung[werte[0]].get(kz)
        if p_ziel is None:
            continue
        marke = 'Var_' + re.sub(r'[^A-Za-z0-9]', '', werte[0] + '_' + kz)[:36]
        if marke not in _var_marken:
            lesezeichen(p_ziel, marke)
            _var_marken[marke] = True
        ziele_var.append((re.compile(r'(?<![\wäöü])(' + re.escape(kz) + r')(?![\wäöü])'), marke))
    for p in r.cells[-1].paragraphs:
        fmt.verlinke_innen(p, ziele_var)
toc_ende = None
for art, obj, el in list(elemente()):
    if art == 'p':
        if obj.style.name.startswith(('Heading', 'TOC', 'toc')) or 'TOC \\o' in ''.join(t.text or '' for t in el.iter(qn('w:instrText'))):
            continue
        fmt.verlinke_innen(obj, ZIELE)
    else:
        for r in obj.rows:
            gesehen = set()
            for c in r.cells:
                if id(c._element) in gesehen:
                    continue
                gesehen.add(id(c._element))
                for p in c.paragraphs:
                    fmt.verlinke_innen(p, ZIELE)

# Inhaltsverzeichnis aus den aktuellen Ueberschriften neu aufbauen (Feld bleibt, Word aktualisiert beim Oeffnen)
def seiten_schaetzen(gesamt=36, zeilen_je_seite=46):
    """Grobe Seitenzahl je Ueberschrift aus dem Textumfang; Word rechnet beim Oeffnen nach (dirty)."""
    zeilen = 0.0
    seiten = {}
    ergebnis = []
    for k in BODY.iterchildren():
        if k.tag == qn('w:p'):
            pPr = k.find(qn('w:pPr'))
            if pPr is not None and pPr.find(qn('w:pageBreakBefore')) is not None:
                zeilen = (int(zeilen / zeilen_je_seite) + 1) * zeilen_je_seite
            text = ''.join(k.itertext())
            zeilen += max(1, len(text) / 170.0) + (3 if '<w:drawing>' in k.xml else 0) * 4
            p = Paragraph(k, d)
            if p.style.name in ('Heading 1', 'Heading 2', 'Heading 3'):
                ergebnis.append((k, zeilen))
        elif k.tag == qn('w:tbl'):
            for r in k.findall(qn('w:tr')):
                laengste = max((len(''.join(tc.itertext())) for tc in r.findall(qn('w:tc'))), default=0)
                zeilen += max(1.2, laengste / 60.0) + (6 if '<w:drawing>' in r.xml else 0)
        elif k.tag == qn('w:sdt'):
            zeilen += 40
    faktor = gesamt / max(1.0, zeilen / zeilen_je_seite)
    for k, z in ergebnis:
        seiten[id(k)] = max(1, min(gesamt, int(z / zeilen_je_seite * faktor) + 1))
    return seiten


def toc_neu():
    behaelter = BODY
    for p in BODY.iter(qn('w:p')):
        if 'TOC \\o' in ''.join(t.text or '' for t in p.iter(qn('w:instrText'))):
            behaelter = p.getparent()
            break
    kinder = list(behaelter.iterchildren())
    beg = None
    tiefe = 0
    ende = None
    ende_lauf = None
    trenner = None
    for i, el in enumerate(kinder):
        if el.tag != qn('w:p'):
            continue
        if beg is None:
            if 'TOC \\o' in ''.join(t.text or '' for t in el.iter(qn('w:instrText'))):
                beg = i
                for it in el.iter(qn('w:instrText')):
                    if 'TOC \\o' in (it.text or ''):
                        it.text = ' TOC \\o "1-3" \\h \\z \\u '
                for fc in el.iter(qn('w:fldChar')):
                    if fc.get(qn('w:fldCharType')) == 'begin':
                        fc.set(qn('w:dirty'), 'true')
                        break
            else:
                continue
        for fc in el.iter(qn('w:fldChar')):
            typ = fc.get(qn('w:fldCharType'))
            if typ == 'begin':
                tiefe += 1
            elif typ == 'separate' and tiefe == 1 and trenner is None:
                trenner = fc
            elif typ == 'end':
                tiefe -= 1
                if tiefe == 0:
                    ende = i
                    ende_lauf = fc.getparent()
                    break
        if ende is not None:
            break
    if beg is None or ende is None:
        print('WARNUNG: kein Inhaltsverzeichnis gefunden')
        return
    vorlagen = {}
    for el in kinder[beg:ende + 1]:
        stil = Paragraph(el, d).style.name
        if stil.lower().startswith('toc') and el.find(qn('w:hyperlink')) is not None:
            vorlagen.setdefault(stil.lower(), copy.deepcopy(el))
    if not vorlagen:
        print('WARNUNG: keine Vorlage fuer Inhaltsverzeichnis-Eintraege')
        return
    # Anfang: alles nach dem Trenner entfernen
    anfang = kinder[beg]
    trenner_lauf = trenner.getparent()
    schluss_el = kinder[ende]
    nach = []
    gesehen = False
    for p in BODY.iter(qn('w:p')):
        if p is schluss_el:
            gesehen = True
            continue
        if gesehen:
            nach.append(p)
    nach_toc = set(id(p) for p in nach)
    for x in list(anfang)[anfang.index(trenner_lauf) + 1:]:
        anfang.remove(x)
    # Mitte entfernen
    for el in kinder[beg + 1:ende]:
        loesche(el)
    # Ende: nur pPr und den Endlauf behalten
    schluss = kinder[ende]
    if schluss is not anfang:
        for x in list(schluss):
            if x.tag != qn('w:pPr') and x is not ende_lauf:
                schluss.remove(x)
    else:
        return
    def eintrag(ebene, text, marke, seite):
        v = vorlagen.get('toc %d' % ebene)
        if v is None:
            v = vorlagen[sorted(vorlagen)[0]]
        neu = copy.deepcopy(v)
        for b in list(neu.iter(qn('w:bookmarkStart'))) + list(neu.iter(qn('w:bookmarkEnd'))):
            b.getparent().remove(b)
        for r in list(neu.findall(qn('w:r'))):       # Feldanfang der Vorlage (TOC-Anweisung) nicht in jeden Eintrag kopieren
            neu.remove(r)
        h = neu.find(qn('w:hyperlink'))
        h.set(qn('w:anchor'), marke)
        laeufe = h.findall(qn('w:r'))
        erster_text = None
        tab_gesehen = False
        im_feld = 0
        for r in laeufe:
            fc = r.find(qn('w:fldChar'))
            if fc is not None:
                t = fc.get(qn('w:fldCharType'))
                im_feld = {'begin': 1, 'separate': 2, 'end': 0}[t]
                continue
            it = r.find(qn('w:instrText'))
            if it is not None:
                it.text = re.sub(r'PAGEREF \S+', 'PAGEREF ' + marke, it.text)
                continue
            if r.find(qn('w:tab')) is not None or r.find(qn('w:ptab')) is not None:
                tab_gesehen = True
                continue
            if im_feld == 2:
                for t in r.findall(qn('w:t')):
                    t.text = str(seite)
                continue
            if not tab_gesehen:
                if erster_text is None:
                    erster_text = r
                    for t in r.findall(qn('w:t')):
                        r.remove(t)
                    t = OxmlElement('w:t'); t.text = text; t.set(qn('xml:space'), 'preserve'); r.append(t)
                else:
                    h.remove(r)
        return neu
    seiten = seiten_schaetzen()
    erster = None
    for obj, ebene, marke, text in toc_kapitel:
        e = eintrag(ebene, text, marke, seiten.get(id(obj._element), 1))
        schluss.addprevious(e)
        if erster is None:
            erster = e
    if erster is not None:                       # Feldbeginn in den ersten Eintrag ziehen, wie Word es schreibt
        laeufe = [x for x in anfang if x.tag != qn('w:pPr')]
        pPr = erster.find(qn('w:pPr'))
        pos = list(erster).index(pPr) + 1 if pPr is not None else 0
        for x in reversed(laeufe):
            erster.insert(pos, x)
        loesche(anfang)


# Doppelte Textmarken aus der Vorlage: nur die erste behalten
gesehen_marken = set()
for bs in list(BODY.iter(qn('w:bookmarkStart'))):
    name = bs.get(qn('w:name'))
    if name in gesehen_marken:
        bid = bs.get(qn('w:id'))
        for be in list(BODY.iter(qn('w:bookmarkEnd'))):
            if be.get(qn('w:id')) == bid:
                be.getparent().remove(be)
                break
        bs.getparent().remove(bs)
    else:
        gesehen_marken.add(name)

toc_neu()

# SIPOC (SmartArt) auf den v10-Stand bringen: Texte in Daten und Zeichnungs-Cache
SIPOC = [('Eingangsmanagement', 'Celonis (EMWS-Schnittstelle)'), ('Postkorbvorgang im EWMS', 'Postkorbvorgang im Themenpostkorb'),
         ('(Felder BUE_*)', '(KI-Deckblatt, Felder BUE_*)'), ('1. Vorgangsdaten aus dem', '1. Vorgangsdaten lesen und'),
         ('Datenpool lesen', 'Vorprüfung (KI-Deckblatt)'), ('2. VNR-Prüfung (VA230)', '2. Kunde (VN) prüfen (IS011)'),
         ('3. VN-Stammdaten prüfen', '3. Abgebenden Bestandsinhaber'), ('(IS100)', 'prüfen (VA230, OB726, GH040)'),
         ('prüfen (OB726, GH040, EOS)', 'prüfen (OB726, GH040, E-Mail)'), ('5. BE überprüfen und', '5. Vertragsstatus (VA230) und'),
         ('priorisieren', 'Test auf Fehlerliste'), ('weiterleiten', 'übergeben oder Befund melden'),
         ('Ablehnungsinformation', 'Bearbeitungshinweis bei Befund'), ('Ausgesteuerter Vorgang', 'Report (Status, Tags)'),
         ('BÜ-Bot BOT1515', 'BÜ-BOT'), ('Sachbearbeitung Komposit / Leben', 'Sachbearbeitung ODPP1 D / HSB4 K KO' if KL else 'Sachbearbeitung HSB4 K MV')]
for part in d.part.package.iter_parts():
    if str(part.partname).endswith(('diagrams/data1.xml', 'diagrams/drawing1.xml')):
        xml = part.blob.decode('utf-8')
        for alt, neu in SIPOC:
            xml = xml.replace('<a:t>' + alt + '</a:t>', '<a:t>' + neu + '</a:t>')
        part._blob = xml.encode('utf-8')

# Inhaltsverzeichnis beim Oeffnen aktualisieren (Kapitelnamen haben sich geaendert)
settings = d.settings.element
for _uf in settings.findall(qn('w:updateFields')):      # keine Aktualisierungsabfrage beim Oeffnen
    settings.remove(_uf)

d.save(ZIEL)
print('gespeichert:', ZIEL)
