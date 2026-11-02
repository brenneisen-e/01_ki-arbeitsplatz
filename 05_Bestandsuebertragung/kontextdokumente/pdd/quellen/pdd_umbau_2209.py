# -*- coding: utf-8 -*-
"""Arbeitet die Entscheidungen des Walkthrough vom 22.09.2026 in die PDD ein.

Inhaltlich:
  - Vorpruefung: Reminder-Pruefung gestrichen, Unterschriftspruefung in den Makler-Zweig.
  - Kunde: Partnerpruefung ueber IS011 statt Einzelvergleiche in IS100; als einzige
    Stammdatenpruefung bleibt das Geburtsdatum. Abgleich des Vollmachtgebers entfaellt.
  - Vertrag: eigenes Kapitel; die Existenzpruefung und das Auslesen der Sparte entfallen.
  - Abgebender Bestandsinhaber vor dem uebernehmenden Makler.
  - Neues Kapitel "Anforderung von Unterlagen".
  - Notizbestueckung Feld fuer Feld, BE-Handling mit Routing je Sparte.

Formal: WENN-Bloecke eingerueckt, Systeme fett, Datenpoolfelder dunkelblau,
im Lauf erzeugte Variablen dunkelgruen (siehe pdd_formatierung.py).
"""
import copy, sys
from docx import Document
from docx.shared import Pt
from docx.text.paragraph import Paragraph
from docx.table import Table
from docx.oxml.ns import qn
import pdd_formatierung as fmt

QUELLE = sys.argv[1] if len(sys.argv) > 1 else 'pdd_ein.docx'
ZIEL = sys.argv[2] if len(sys.argv) > 2 else 'pdd_aus.docx'

d = Document(QUELLE)
body = d.element.body


# ---------------------------------------------------------------- Werkzeuge
def absaetze_und_tabellen():
    aus = []
    for kind in body.iterchildren():
        if kind.tag.endswith('}p'):
            aus.append(('p', Paragraph(kind, d), kind))
        elif kind.tag.endswith('}tbl'):
            aus.append(('t', Table(kind, d), kind))
    return aus


def finde_ueberschrift(text):
    for art, obj, el in absaetze_und_tabellen():
        if art == 'p' and obj.style.name.startswith(('Heading', 'Überschrift')) and obj.text.strip() == text:
            return obj, el
    raise KeyError(text)


def block(text):
    """Ueberschrift samt allem, was bis zur naechsten Ueberschrift gleicher oder hoeherer Ebene folgt."""
    alle = absaetze_und_tabellen()
    i = next(k for k, (a, o, e) in enumerate(alle)
             if a == 'p' and o.style.name.startswith(('Heading', 'Überschrift')) and o.text.strip() == text)
    stufe = alle[i][1].style.name
    aus = [alle[i][2]]
    for a, o, e in alle[i + 1:]:
        if a == 'p' and o.style.name.startswith(('Heading', 'Überschrift')) and o.style.name <= stufe:
            break
        aus.append(e)
    return aus


def finde_tabelle(teiltext):
    for tb in d.tables:
        if teiltext in tb._element.xml:
            return tb
    raise KeyError(teiltext)


def schritt_tabellen():
    """Alle Tabellen ab der Ueberschrift 'Schritt fuer Schritt-Beschreibung'."""
    alle = absaetze_und_tabellen()
    i = next(k for k, (a, o, e) in enumerate(alle)
             if a == 'p' and o.text.strip() == 'Schritt für Schritt-Beschreibung')
    return [o for a, o, e in alle[i:] if a == 't']


def setze_zelle(zelle, zeilen):
    """Ersetzt den Text einer Zelle; Absaetze mit Screenshots bleiben erhalten."""
    bilder = [p for p in zelle.paragraphs if fmt.hat_bild(p)]
    text_abs = [p for p in zelle.paragraphs if not fmt.hat_bild(p)]
    if not text_abs:                      # nur Bilder: Text dahinter anlegen
        muster = copy.deepcopy(zelle.paragraphs[-1]._element)
        zelle.paragraphs[-1]._element.addnext(muster)
        text_abs = [Paragraph(muster, zelle)]
        for r in list(text_abs[0].runs):
            r._element.getparent().remove(r._element)
    erste = text_abs[0]
    for p in text_abs[1:]:
        p._element.getparent().remove(p._element)
    for r in list(erste.runs):
        r._element.getparent().remove(r._element)
    erste.add_run(zeilen[0] if zeilen else '')
    for zeile in zeilen[1:]:
        neu = copy.deepcopy(erste._element)
        erste._element.addnext(neu)
        p = Paragraph(neu, zelle)
        for r in list(p.runs):
            r._element.getparent().remove(r._element)
        p.add_run(zeile)
        erste = p


def neue_tabelle(vorlage_index, zeilen_text, nach_element):
    """Kopiert eine vorhandene Schritt-Tabelle und fuellt ihre rechte Spalte."""
    vorlage = d.tables[vorlage_index]._element
    neu = copy.deepcopy(vorlage)
    nach_element.addnext(neu)
    tb = Table(neu, d)
    while len(tb.rows) > 1:
        tb._element.remove(tb.rows[-1]._element)
    setze_zelle(tb.rows[0].cells[0], [''])
    setze_zelle(tb.rows[0].cells[1], zeilen_text)
    return tb


def neue_ueberschrift(text, stil, nach_element):
    muster = next(o._element for a, o, e in absaetze_und_tabellen()
                  if a == 'p' and o.style.name == stil)
    neu = copy.deepcopy(muster)
    nach_element.addnext(neu)
    p = Paragraph(neu, d)
    for r in list(p.runs):
        r._element.getparent().remove(r._element)
    p.add_run(text)
    return p


# ------------------------------------------------- 1. Vorpruefung anpassen
VORPRUEFUNG = [
 'Hinweis: Vor den fachlichen Pruefungen wird anhand der Datenpool-Felder festgestellt, ob ein zu pruefender BUE-Vorgang vorliegt. Jedes Ausschlusskriterium ist eine BE. Geprueft wird ausschliesslich gegen das KI-Deckblatt, also ohne Hostzugriff.'.replace('ue','ü').replace('BÜE','BÜ'),
 'WENN',
 '<BUE_KLASSIFIKATION> <> „BÜ-Vorgang“',
 'DANN',
 '<BE-Klassifikation> = „Kein BÜ-Vorgang“',
 'Weiter zum Kapitel „BE-Handling“',
 'Ende WENN',
 'WENN',
 '<BUE_WUNSCH_VORHANDEN> = „nein“',
 'DANN',
 '<BE-Klassifikation> = „BÜ-Wunsch nicht vorhanden“',
 'Weiter zum Kapitel „BE-Handling“',
 'Ende WENN',
 'WENN',
 '<BUE_VERMITTLER_TYP> = „MFA“',
 'DANN',
 'WENN',
 '<BUE_MV_AUF_MAKLER> <> „ja“',
 'DANN',
 '<BE-Klassifikation> = „Betreuungswunsch nicht auf MFA ausgestellt“',
 'Weiter zum Kapitel „BE-Handling“',
 'Ende WENN',
 'SONST',
 'WENN',
 '<BUE_MV_UNTERSCHRIFT_KUNDE> <> „ja“',
 'DANN',
 '<BE-Klassifikation> = „Unterschrift VN fehlt“',
 'Weiter zum Kapitel „BE-Handling“',
 'Ende WENN',
 'WENN',
 '<BUE_PRUEFUNG_UNTERLAGEN> <> „Vollständig“',
 'UND <BUE_ANF_UNTERLAGEN> = „nein“',
 'DANN',
 'Merke Prüfnotiz „Unterlagen nicht vollständig“ in <Fehlerliste>',
 'Ende WENN',
 'Ende WENN',
 'Weiter zu „I. Kunde (VN) – Partnerprüfung“',
 'Hinweis: Die Unterschrift des Versicherungsnehmers steht auf der Maklervollmacht. Ein Mehrfachagent hat keine Maklervollmacht; für ihn zählt allein der auf ihn ausgestellte Betreuungswunsch.',
 'Hinweis: <BUE_PRUEFUNG_UNTERLAGEN> ist eine fachliche Ausprägung der Unterlagenprüfung, kein technischer Fehler. Ein anderer Wert als „Vollständig“ ist kein Ausschlusskriterium: Der Bot merkt die Prüfnotiz „Unterlagen nicht vollständig“ in <Fehlerliste>, die weiteren Prüfungen laufen weiter. Erst der Test auf Fehlerliste führt bei gefüllter <Fehlerliste> zur BE „Nachprüfung erforderlich“. Ist <BUE_ANF_UNTERLAGEN> = „ja“, entsteht weder Prüfnotiz noch BE; die Unterlagen werden über die Notiz angefordert (siehe Kapitel „V. Anforderung von Unterlagen“).',
 'Hinweis: Bei jedem Ausschlusskriterium geht der Vorgang ohne weitere Prüfung in das BE-Handling.',
 'Hinweis: Bei Mehrfachagenten (<BUE_VERMITTLER_TYP> = „MFA“) gibt es keine Maklervollmacht. Die Felder <BUE_MV_ENTHALTEN>, <BUE_MV_STATUS>, <BUE_MV_VOLLUMFAENGLICH> und <BUE_UV_ERTEILT> stehen dann auf N/A und werden nicht geprüft. Das Feld <BUE_PRUEFUNG_UNTERLAGEN> gilt nur im Makler-Zweig.',
]
VORPRUEFUNG[0] = ('Hinweis: Vor den fachlichen Prüfungen wird anhand der Datenpool-Felder festgestellt, ob ein zu '
                  'prüfender BÜ-Vorgang vorliegt. Jedes Ausschlusskriterium ist eine BE. Geprüft wird ausschließlich '
                  'gegen das KI-Deckblatt, also ohne Hostzugriff.')
setze_zelle(d.tables[16].rows[0].cells[1], VORPRUEFUNG)


# ------------------------------------------------- 2. Kunde: IS011-Kette
IS011_ZEILEN = [
 # je Tabellenzeile ein Block, damit die Screenshots beim richtigen Schritt bleiben
 ['Hinweis: Die Identität des Versicherungsnehmers wird über eine Partnersuche festgestellt und über die '
  'Versicherungsnummer des Vorgangs belegt.',
  'IS011 starten.'],
 ['Matchcodesuche mit den Angaben aus dem Auftrag ausführen:',
  'Zuname = <BUE_KUNDE_NACHNAME>',
  'Vorname = die ersten zwei Buchstaben von <BUE_KUNDE_VORNAME>',
  'PLZ = <BUE_KUNDE_PLZ>',
  'Straße = die ersten zwei Buchstaben von <BUE_KUNDE_STRASSE>',
  'Geburtsdatum = <BUE_KUNDE_GEBDAT>, aufgeteilt auf die drei Felder TT, MM, JJJJ',
  'Enter'],
 ['Lese den Maskennamen.',
  'WENN',
  'Maskenname <> „IS011/VAF121“',
  'DANN',
  '<BE-Klassifikation> = „Kunde in IS011 nicht gefunden“',
  'Weiter zum Kapitel „BE-Handling“',
  'Ende WENN',
  'Merke alle angezeigten Kundennummern mit der Rolle „VN“ als <IS011-KNR-Liste>.'],
 ['Schleife über <IS011-KNR-Liste>:',
  'Kundennummer aufrufen',
  'Enter'],
 ['Merke die angezeigte Kundennummer als <IS011-KD> und das Geburtsdatum des Partners als <IS011-Gebdat>.'],
 ['Rufe den Scout-Service und lese alle Versicherungsnummern zu <IS011-KD>.',
  'WENN',
  '<Vorgang-VNR> ist in dieser Liste enthalten',
  'DANN',
  'Merke <IS011-KD> als <IS011-KNR>',
  'Schleife beenden',
  'Ende WENN',
  'Ende Schleife',
  'WENN',
  '<IS011-KNR> = leer',
  'DANN',
  '<BE-Klassifikation> = „Keine Kundennummer führt die Vorgangs-VNR“',
  'Weiter zum Kapitel „BE-Handling“',
  'Ende WENN'],
 ['WENN',
  '<BUE_KUNDE_GEBDAT> <> leer',
  'UND <IS011-Gebdat> <> <BUE_KUNDE_GEBDAT>',
  'DANN',
  'Merke Prüfnotiz „Geburtsdatum abweichend“ in <Fehlerliste>',
  'Ende WENN',
  'Weiter zu „II. Abgebender Bestandsinhaber“',
  'Hinweis: Mehrfachtreffer sind unkritisch. Kunden treten im Partnersystem mehrfach auf, etwa mit alter und neuer '
  'Anschrift; deshalb werden alle Treffer mit der Rolle „VN“ weiterverfolgt, statt den Vorgang auszusteuern.',
  'Hinweis: Der Nachweis der Identität ist die Versicherungsnummer: Führt eine der gefundenen Kundennummern die '
  '<Vorgang-VNR>, gehört der Vertrag zu diesem Partner. Als einzige Gegenprobe bleibt das Geburtsdatum, und auch '
  'das nur, wenn der Auftrag eines nennt. Eine Plausibilitätsprüfung über Name, Vorname, Straße und PLZ findet '
  'nicht statt.',
  'Hinweis: Ist <BUE_KUNDE_GEBDAT> leer, liegt in der Regel eine juristische Person vor; die Prüfung entfällt dann.'],
]
t18 = d.tables[18]
for i, zeilen in enumerate(IS011_ZEILEN):
    if i < len(t18.rows):
        setze_zelle(t18.rows[i].cells[1], zeilen)
while len(t18.rows) > len(IS011_ZEILEN):
    t18._element.remove(t18.rows[-1]._element)

# IS100-Tabellen entfernen (Name, Geburtsdatum, Adresse); die Tabellen 22-24 des
# uebernehmenden Maklers (Agenturnummer-Einstieg, Klassifizierung) bleiben
for i in (21, 20, 19):
    d.tables[i]._element.getparent().remove(d.tables[i]._element)

# verwaiste Unterueberschriften der entfallenen Pruefungen entfernen
def loesche_absatz(text):
    for absatz in d.paragraphs:
        if absatz.text.strip() == text:
            folgend = absatz._element.getnext()
            if folgend is not None and folgend.tag.endswith('}p') and not ''.join(folgend.itertext()).strip():
                folgend.getparent().remove(folgend)
            absatz._element.getparent().remove(absatz._element)
            return
    raise KeyError(text)

for kontext in ('VNR-Prüfung (Anwendung VA230)', 'Namensprüfung (Anwendung IS100)',
                'Geburtsdatum (Anwendung IS100)', 'Adressprüfung (Anwendung IS100)'):
    loesche_absatz(kontext)

for absatz in d.paragraphs:                      # Unterueberschrift der Partnerpruefung
    if absatz.text.strip() == 'Prüfung Daten VN über Matchcodesuche':
        for r in list(absatz.runs)[1:]:
            r._element.getparent().remove(r._element)
        absatz.runs[0].text = 'Partnersuche und Abgleich über die Versicherungsnummer (Anwendung IS011)'
print('Vorpruefung und Kundenpruefung umgeschrieben')


# ------------------------------------------------- 3. Vertrag als eigenes Kapitel
VERTRAG = [
 'VA230 mit <Vorgang-VNR> öffnen.',
 'Lese das gelb markierte Feld „Status“ aus und speichere als <VA230-Status>.',
 'WENN',
 '<VA230-Status> <> „aktuell“',
 'DANN',
 '<BE-Klassifikation> = „<Klassifikation für nicht aktuelle Verträge – durch Fachbereich festzulegen>“',
 'Weiter zum Kapitel „BE-Handling“',
 'Ende WENN',
 'Weiter zu „V. Anforderung von Unterlagen“',
 'Hinweis: Die <Vorgang-VNR> stammt aus dem VDB-Abruf durch Celonis und ist damit eine echte Nummer; ob ein '
 'Vertrag existiert, wird nicht eigens geprüft. Der Postkorbvorgang startet je Sparte den passenden Prüf-Bot; '
 'damit steht die Sparte fest und mit ihr die Notizvariante.',
 'Hinweis: Rahmenverträge und Verträge im Mahnverfahren werden wie alle anderen Verträge geprüft. Offen ist die '
 'Behandlung von Flotten und Flottenverträgen mit führendem Mantel (Klärung durch K. Rypa).',
]
UNTERLAGEN = [
 'Hinweis: Dieses Kapitel steuert nicht die Prüfung, sondern die Folgearbeit. Es ist zu trennen von '
 '<BUE_PRUEFUNG_UNTERLAGEN>, das die eingereichten Unterlagen bewertet (siehe Kapitel „Vorprüfung – '
 'Ausschlusskriterien“).',
 'WENN',
 '<BUE_ANF_UNTERLAGEN> = „ja“',
 'DANN',
 'Lese <BUE_ART_UNTERLAGEN> und merke die anzufordernden Arten als <Anforderung-Arten>.',
 'Ende WENN',
 'Weiter zu „VI. Test auf Fehlerliste“',
 'Hinweis: <BUE_ART_UNTERLAGEN> ist Pflichtfeld, sobald <BUE_ANF_UNTERLAGEN> = „ja“ ist, und wird sonst nicht '
 'ausgewertet. Die Notizmaske gibt für Komposit und Leben drei feste Kennzeichen vor: „Police / Vertragsspiegel / '
 'Vertragsauszug / Ersatzrechnung usw.“, „Schadenaufstellung / Schadenrenta usw.“ und „Sonstige Unterlagen“. Die '
 'Ausprägungen des Datenpoolfelds sind darauf abzubilden; die Abstimmung läuft mit ODPBD und MSU.',
 'Hinweis: Geht der Vorgang wegen einer Business Exception oder wegen gefüllter <Fehlerliste> in die '
 'Nachbearbeitung, entsteht keine Notiz und damit auch keine Anforderung. Die Sachbearbeitung sieht im '
 'Bearbeitungshinweis, was offen ist, und fordert selbst an.',
]

h_vn, el_vn = finde_ueberschrift('I. VN – Stammdaten + VNR')
h_uebern, _ = finde_ueberschrift('II. Übernehmender Makler – Agenturnummer/Vermittler-Nr. (PNR)')
h_abgeb, _ = finde_ueberschrift('III Abgebender Vermittler')
h_test, _ = finde_ueberschrift('IV. Test auf Fehlerliste')

def benenne(p, text):
    for r in list(p.runs)[1:]:
        r._element.getparent().remove(r._element)
    if p.runs:
        p.runs[0].text = text
    else:
        p.add_run(text)

benenne(h_vn, 'I. Kunde (VN) – Partnerprüfung über IS011')
benenne(h_abgeb, 'II. Abgebender Bestandsinhaber')
benenne(h_uebern, 'III. Übernehmender Makler – Agenturnummer/Vermittler-Nr. (PNR)')
benenne(h_test, 'VI. Test auf Fehlerliste')

# Kapitelreihenfolge: Kunde, Abgebender, Uebernehmender, Vertrag, Unterlagen, Test
def haenge_hinter(bloecke, anker):
    for el in bloecke:
        anker.addnext(el)
        anker = el
    return anker

anker = block('I. Kunde (VN) – Partnerprüfung über IS011')[-1]
anker = haenge_hinter(block('II. Abgebender Bestandsinhaber'), anker)
anker = haenge_hinter(block('III. Übernehmender Makler – Agenturnummer/Vermittler-Nr. (PNR)'), anker)

# Kapitel IV. Vertrag: vorhandene VA230-Tabelle uebernehmen
h4 = neue_ueberschrift('IV. Vertrag', h_vn.style.name, anker)
t_vertrag = d.tables[17]
# Die dritte Zeile traegt den Screenshot "VA230, Feld Status"; sie bleibt, die uebrigen entfallen.
setze_zelle(t_vertrag.rows[2].cells[1], VERTRAG)
for r in (t_vertrag.rows[1], t_vertrag.rows[0]):
    t_vertrag._element.remove(r._element)
h4._element.addnext(t_vertrag._element)

# Kapitel V. Anforderung von Unterlagen
h5 = neue_ueberschrift('V. Anforderung von Unterlagen', h_vn.style.name, t_vertrag._element)
neue_tabelle(16, UNTERLAGEN, h5._element)
print('Kapitel umgestellt, Vertrag und Unterlagen ergaenzt')


# ------------------------------------------------- 4. Uebrige Kapitel benennen
benenne(finde_ueberschrift('Start')[0], 'Start – Vorgang aus dem Themenpostkorb übernehmen')
benenne(finde_ueberschrift('Vorprüfung – Ausschlusskriterien')[0],
        'Vorprüfung – Business Exceptions aus dem KI-Deckblatt')
benenne(finde_ueberschrift('Prozessende mit Status completed: Weiterleitung an den BÜ-Bot')[0],
        'VII. Abschluss ohne Befund – Notiz bestücken und an den BÜ-Bot übergeben')
benenne(finde_ueberschrift('Prozessende mit Status Exception: BE-Handling')[0],
        'VIII. Abschluss mit Befund – BE-Handling und Routing')


# ------------------------------------------------- 4a. Start: Felder als Liste, EMWS richtigstellen
FELDER = ['BUE_AGENTUR_NR', 'BUE_ANF_UNTERLAGEN', 'BUE_ART_UNTERLAGEN', 'BUE_KLASSIFIKATION',
          'BUE_KUNDE_GEBDAT', 'BUE_KUNDE_NACHNAME', 'BUE_KUNDE_ORT', 'BUE_KUNDE_PLZ',
          'BUE_KUNDE_STRASSE', 'BUE_KUNDE_VORNAME', 'BUE_MAKLER_EMAIL', 'BUE_MAKLER_ORT',
          'BUE_MAKLER_PLZ', 'BUE_MAKLER_STRASSE', 'BUE_MV_AUF_MAKLER', 'BUE_MV_EINGANGSDATUM',
          'BUE_MV_ENTHALTEN', 'BUE_MV_STATUS', 'BUE_MV_UNTERSCHRIFT_KUNDE',
          'BUE_MV_UNTERSCHRIFTSDATUM', 'BUE_MV_VN_NACHNAME', 'BUE_MV_VN_VORNAME',
          'BUE_MV_VOLLUMFAENGLICH', 'BUE_POOL', 'BUE_PRUEFUNG_UNTERLAGEN', 'BUE_SPARTE',
          'BUE_UMFANG', 'BUE_UV_ERTEILT', 'BUE_VERMITTLER_NAME', 'BUE_VERMITTLER_NR',
          'BUE_VERMITTLER_TYP', 'BUE_VNR', 'BUE_VNR_2', 'BUE_WUNSCH_VORHANDEN']

START_DATENPOOL = (
 ['Werte aus dem Datenpool: Wechsel vom Postkorbvorgang in den Datenpool, Datensatz zum Postkorbvorgang mit '
  '<Vorgang-Lfd-Nr> öffnen.',
  'Lese die folgenden Felder des Datenpools aus und speichere jedes unter dem gleichnamigen Variablennamen '
  '(vollständige Liste mit Format, Werteliste und Pflichtfeldkennzeichen im Kapitel „Tabelle der genutzten '
  'Variablen“, Herkunft „Datenpool“):']
 + ['\u2022 <%s>' % f for f in sorted(FELDER)]
 + ['Lese <BUE_MV_EINGANGSDATUM> aus und speichere als <Eingangsdatum-BUE> (Format tt.mm.jjjj). Ist das Feld leer, '
    'wird das Eröffnungsdatum des Postkorbvorgangs verwendet.',
    'Vom Roboter initialisiert: Die Variablen für das BE-Handling werden zu Beginn jedes Vorgangs zurückgesetzt:',
    '<BE> = leer',
    '<BE-Klassifikation> = leer',
    '<Fehlerliste> = leer'])

t_start = finde_tabelle('Werte aus dem Datenpool')
setze_zelle(t_start.rows[1].cells[1], START_DATENPOOL)

# EMWS ist die Schnittstelle, ueber die Celonis den Vorgang eroeffnet - nicht der Postkorb.
def ersetze_ueberall(paare):
    """Ersetzt Text in allen Laeufen, auch in denen eines Querverweises."""
    for t in d.element.body.iter(qn('w:t')):
        if not t.text:
            continue
        for alt_text, neu_text in paare:
            if alt_text in t.text:
                t.text = t.text.replace(alt_text, neu_text)


ersetze_ueberall([('EWMS-Postkorb', 'Themenpostkorb'), ('EMWS-Postkorb', 'Themenpostkorb'),
                  ('EWMS-Postkorbs', 'Themenpostkorbs'),
                  ('Werte aus dem Themenpostkorb:', 'Werte aus dem Postkorbvorgang:'),
                  # Querverweise auf die neuen Kapitelnamen
                  ('Weiter zum Kapitel „BE-Handling“', 'Weiter zum Kapitel „VIII. Abschluss mit Befund“'),
                  ('Weiter zum Kapitel „Test auf Fehlerliste“', 'Weiter zum Kapitel „VI. Test auf Fehlerliste“'),
                  ('Weiter zum Kapitel „Weiterleitung an den BÜ-Bot“',
                   'Weiter zum Kapitel „VII. Abschluss ohne Befund“'),
                  ('Weiter zu „I. Kunde (VN) – Partnerprüfung“', 'Weiter zu „I. Kunde (VN)“'),
                  ('Kapitel „Notizbestückung von Prüf-Bot auf BÜ-Bot“',
                   'Kapitel „VII. Abschluss ohne Befund“'),
                  ('Kapitel „BE-Handling“', 'Kapitel „VIII. Abschluss mit Befund“'),
                  ('im BE-Handling in den Bearbeitungshinweis',
                   'im Kapitel „VIII. Abschluss mit Befund“ in den Bearbeitungshinweis'),
                  ('Kapitel „Test auf Fehlerliste“', 'Kapitel „VI. Test auf Fehlerliste“'),
                  ('Kapitel „Vorprüfung – Ausschlusskriterien“',
                   'Kapitel „Vorprüfung – Business Exceptions aus dem KI-Deckblatt“'),
                  # fachlicher Stand statt Aenderungsvermerk
                  ('Einstieg für die Hostaufrufe VA230 und IS100; eine Normierung im Bot entfällt.',
                   'Einstieg für alle Hostaufrufe; eine Normierung im Bot ist nicht erforderlich.'),
                  ('der bisherigen Notizvorlage BOT2011', 'der Notizvorlage BOT2011'),
                  ('Der bisher in der Kaskade vorgesehene Wert', 'Der in der Kaskade vorgesehene Wert'),
                  ('ENDWENN', 'Ende WENN'),
                  ('Weiter zum fachlichen Kontext „Agentur-Nr. (A,…) des Bestandsinhabers ermitteln“',
                   'Weiter zu „IV. Vertrag“'),
                  ('(bisherige Vorlage BOT2011)', '(Vorlage BOT2011)'),
                  ('der Vertragsstatus wird in der VNR-Prüfung ausgewertet',
                   'der Vertragsstatus wird im Kapitel „IV. Vertrag“ ausgewertet'),
                  ('Bildschirminhalte aus IS100 und VA230', 'Bildschirminhalte aus IS011 und VA230'),
                  ('Die Prüfschritte in VA230, IS100 einschließlich Scout-Service,',
                   'Die Prüfschritte in VA230, IS011 einschließlich Scout-Service,'),
                  ('Feld_Format CH. Abgleich gegen IS100. Keine Ziffern, nur Buchstaben und Sonderzeichen',
                   'Feld_Format CH. Suchbegriff für die Matchcodesuche in IS011. Keine Ziffern, nur Buchstaben '
                   'und Sonderzeichen'),
                  ('Feld_Format CH. Der Datenpool liefert „Straße“ grundsätzlich als „Str.“; der Vergleich mit '
                   'IS100 erfolgt zweistufig (Originalwerte, danach normalisierte Straßenbezeichnung), siehe '
                   'Schritt „Adressprüfung“.',
                   'Feld_Format CH. Der Datenpool liefert „Straße“ grundsätzlich als „Str.“; in die Matchcodesuche '
                   'in IS011 gehen nur die ersten zwei Buchstaben ein.'),
                  ('Der Wert wird in der Notiz im Abschnitt „Betroffene VNR“ übernommen. Für „Gesamt“ ist die '
                   'weitere Verarbeitung noch nicht abschließend festgelegt: Kann die gesamte Kundenverbindung '
                   'nicht automatisiert verarbeitet werden, ist für die einzeln geprüfte <Vorgang-VNR> eine '
                   'gesonderte manuelle Bearbeitung oder eine Business Exception erforderlich; die Klassifikation '
                   'dafür ist noch festzulegen.',
                   'Die Notiz beauftragt unabhängig vom Wert immer eine Einzel-BÜ für die <Vorgang-VNR> '
                   '(Auswahl „Betroffene VNR“ = „angegebene VNR beachten“); „Gesamt“ geht nur nachrichtlich in '
                   'den Bearbeitungshinweis ein.'),
                  ('Betroffene VNR: angegebene VNR beachten <Vorgang-VNR> (bei <BUE_UMFANG> = „Gesamt“: gesamte '
                   'Kundenverbindung)', 'Betroffene VNR: angegebene VNR beachten <Vorgang-VNR>')])


# ------------------------------------------------- 4a. Kurzbeschreibung und Lesehilfe
GLIEDERUNG = [
 'Start – Vorgang aus dem Themenpostkorb übernehmen: Postkorbvorgang öffnen, <Vorgang-Lfd-Nr> und <Vorgang-VNR> '
 'lesen, die Felder BUE_* aus dem Datenpool übernehmen, die Variablen für das BE-Handling initialisieren.',
 'Vorprüfung – Business Exceptions aus dem KI-Deckblatt: Klassifikation, BÜ-Wunsch, beim Mehrfachagenten der auf '
 'ihn ausgestellte Betreuungswunsch, beim Makler die Unterschrift des Versicherungsnehmers auf der Maklervollmacht; '
 'unvollständige Unterlagen führen nicht zum Ausschluss, sondern zu einer Prüfnotiz in <Fehlerliste>. Geprüft wird '
 'ausschließlich gegen das KI-Deckblatt, ohne Hostzugriff; erst danach laufen die fachlichen Prüfungen an.',
 'I. Kunde (VN) – Partnerprüfung über IS011: Matchcodesuche nach dem Versicherungsnehmer, Kundennummern mit der '
 'Rolle „VN“, Nachweis der Identität über die Versicherungsnummer des Vorgangs (Scout-Service); Gegenprobe des '
 'Geburtsdatums, wenn der Auftrag eines nennt.',
 'II. Abgebender Bestandsinhaber: Agentur-Nr. aus VA230, PNR über OB726, Anbindungsstatus in GH040.',
 'III. Übernehmender Makler – Agenturnummer/Vermittler-Nr. (PNR): Einstieg in OB726 je nachdem, ob der Datenpool '
 'eine Agenturnummer oder eine Vermittler-Nr. liefert, Namensabgleich, Anbindungsprüfung in GH040, Stammagentur '
 'über EOS, E-Mail-Adresse des übernehmenden Vermittlers.',
 'IV. Vertrag: Vertragsstatus in VA230.',
 'V. Anforderung von Unterlagen: Übernahme der anzufordernden Unterlagenarten aus dem Datenpool für die Notiz.',
 'VI. Test auf Fehlerliste: Ist <Fehlerliste> gefüllt, wird die BE „Nachprüfung erforderlich“ gesetzt.',
 'VII. Abschluss ohne Befund: Telefonnotiz Feld für Feld bestücken und den Vorgang an den 72-Stunden-BOT übergeben. '
 'Eine Prüfung des Vertriebskanals des Bestandsinhabers findet im Prüf-Bot nicht statt; der 72-Stunden-BOT erkennt '
 'AO-Bestandsinhaber selbst, wahrt die Frist und leitet alle übrigen Vorgänge direkt an den BÜ-BOT weiter.',
 'VIII. Abschluss mit Befund – BE-Handling und Routing: Bearbeitungshinweis mit <BE-Klassifikation>, <Fehlerliste> '
 'und <Vorgang-VNR>; Routing bei Krankenversicherung an HSB4K MV, bei Komposit und Leben je nach abgebendem '
 'Bestandsinhaber an ODPB (Makler) oder HSB4K KO.',
]

alte = [p for p in d.paragraphs
        if p.text.startswith(('Vorprüfung – Ausschlusskriterien:', 'I. VN – Stammdaten', 'II. Übernehmender Makler –',
                              'BE-Handling:', 'Weiterleitung an den BÜ-Bot:'))]
assert len(alte) == 5, [p.text[:40] for p in alte]
anker = alte[0]._element
leer = anker.getprevious()                          # Leerabsatz als Trenner
for p in alte[1:]:
    vorher = p._element.getprevious()
    if vorher is not None and not ''.join(vorher.itertext()).strip():
        vorher.getparent().remove(vorher)
    p._element.getparent().remove(p._element)
letzter = anker
for i, text in enumerate(GLIEDERUNG):
    if i == 0:
        absatz = alte[0]
    else:
        trenner = copy.deepcopy(leer)
        letzter.addnext(trenner)
        neu = copy.deepcopy(anker)
        trenner.addnext(neu)
        absatz = Paragraph(neu, alte[0]._parent)
        letzter = neu
    fmt.schreibe(absatz, text, 0)
    if i == 0:
        letzter = absatz._element
trenner = copy.deepcopy(leer)                       # Abstand vor "SIPOC"
letzter.addnext(trenner)

NOTATION = [
 'Notation nach der Vorgabe des Templates. Drei Schreibweisen sind zu unterscheiden: <BUE_…> bezeichnet ein '
 'Eingangsfeld aus dem Datenpool, <…> einen vom Bot gelesenen oder gesetzten Wert, „…“ ohne Zusatz ein Feld auf der '
 'Hostmaske oder einen festen Wert. Variablen, die aus einer Hostanwendung gelesen werden, tragen die Anwendung im '
 'Namen. Damit ist in jedem Vergleich erkennbar, welche Quelle gegen welche geprüft wird: <IS011-Gebdat> <> '
 '<BUE_KUNDE_GEBDAT> vergleicht das in IS011 gelesene Geburtsdatum mit dem Feld aus dem Datenpool.',
 'Lesehilfe zur Farblogik: Systeme stehen fett (OB726), Felder aus dem Datenpool dunkelblau (<BUE_VNR>), im Lauf '
 'erzeugte Variablen dunkelgrün (<Vorgang-VNR>), die <BE-Klassifikation> dunkelrot. Die Steuerwörter WENN / DANN / '
 'SONST / Ende WENN stehen türkis in der Formatvorlage „WENN DANN“ und sind wie Programmcode eingerückt. '
 'Querverweise auf andere Kapitel stehen fett und unterstrichen, Hinweise kursiv.',
 'Initialisierung über „Lese … und speichere als <…>“, Zuweisung über „=“, Vergleich über „<>“.',
 'Eine Business Exception wird über <BE-Klassifikation> gemeldet; sie beendet die Prüfung sofort und verzweigt in '
 'das Kapitel „VIII. Abschluss mit Befund“. Sie kann in der Vorprüfung und in jedem späteren Schritt auftreten. '
 'Abweichungen aus den Einzelprüfungen werden mit „Merke Prüfnotiz … in <Fehlerliste>“ gesammelt, die Verarbeitung '
 'läuft weiter; am Ende der Prüfungen wird die Fehlerliste getestet. Wie mit einer BE umgegangen wird, steht nur im '
 'Kapitel „VIII. Abschluss mit Befund“ und wird in den einzelnen Schritten nicht wiederholt.',
]
notation = [p for p in d.paragraphs if p.text.startswith('Notation nach der Vorgabe des Templates.')]
assert len(notation) == 1
letzter = notation[0]
fmt.schreibe(letzter, NOTATION[0], 0, kursiv=True, luft_danach=6)
for text in NOTATION[1:]:                       # je Gedanke ein Absatz
    neu = copy.deepcopy(letzter._element)
    letzter._element.addnext(neu)
    letzter = Paragraph(neu, notation[0]._parent)
    fmt.schreibe(letzter, text, 0, kursiv=True, luft_danach=6)


# ------------------------------------------------- 4b. System- und Variablentabelle
def zeile_text(tabelle, index):
    return ' '.join(tabelle.rows[index].cells[0].text.split())


def loesche_zeilen(tabelle, namen):
    for reihe in list(tabelle.rows):
        wert = ' '.join(reihe.cells[0].text.split()).strip('<>')
        if wert in namen:
            tabelle._element.remove(reihe._element)


def ergaenze_zeile(tabelle, werte):
    vorlage = copy.deepcopy(tabelle.rows[-1]._element)
    tabelle.rows[-1]._element.addnext(vorlage)
    reihe = tabelle.rows[-1]
    for i, wert in enumerate(werte):
        if i < len(reihe.cells):
            setze_zelle(reihe.cells[i], [wert])
    return reihe


# Systemtabelle: IS100 und Scout-Service entfallen, IS011 kommt dazu, EMWS wird erklaert
t_sys = d.tables[1]
for reihe in list(t_sys.rows):
    name = reihe.cells[0].text.strip()
    if name.startswith('IS100') or name.startswith('Scout-Service'):
        t_sys._element.remove(reihe._element)
    elif name == 'Themenpostkorb':
        setze_zelle(reihe.cells[1],
            ['Eingangskanal des Prozesses. Der Prüf-Bot arbeitet den Themenpostkorb seiner Sparte ab: '
             'Postkorbvorgang öffnen, laufende Vorgangsnummer und Versicherungsnummer lesen, Notiz anlegen, '
             'Vorgang weiterleiten oder ablegen.'])
    elif name.startswith('VA230'):
        setze_zelle(reihe.cells[1],
            ['Auslesen des Vertragsstatus und der Agenturnummer des bisherigen Bestandsinhabers.'])
ergaenze_zeile(t_sys, ['IS011 – Partnersuche',
    'Matchcodesuche nach dem Versicherungsnehmer mit Nachname, den ersten zwei Buchstaben von Vorname und Straße, '
    'PLZ und Geburtsdatum. Liefert die Kundennummern mit der Rolle „VN“; über den Scout-Service werden dazu die '
    'Versicherungsnummern gelesen.'])
ergaenze_zeile(t_sys, ['EMWS',
    'Schnittstelle, über die Celonis den Postkorbvorgang eröffnet. Kein Postkorb und keine Anwendung, die der '
    'Prüf-Bot selbst bedient.'])

# Variablentabelle: entfallene Variablen streichen, neue ergaenzen
t_var = d.tables[14]
loesche_zeilen(t_var, {'IS100-Nachname', 'IS100-Vorname', 'IS100-Gebdat', 'IS100-Strasse', 'IS100-PLZ',
                       'VA230-Vertragsbeginn', 'VA230-Sparte', 'BUE_REMINDER'})
NEUE_VARIABLEN = [
 ('IS011-KNR-Liste', 'Kundennummern aus der Matchcodesuche mit der Rolle „VN“',
  'IS011, Schritt „Partner suchen“', 'optional',
  'Mehrfachtreffer sind der Regelfall; alle Treffer mit der Rolle „VN“ werden weiterverfolgt.'),
 ('IS011-KD', 'jeweils geprüfte Kundennummer aus der Schleife',
  'IS011, Schritt „Kundennummer aufrufen“', 'optional',
  'Nur innerhalb der Schleife gültig.'),
 ('IS011-KNR', 'bestätigte Kundennummer des Versicherungsnehmers',
  'IS011, Schritt „Vorgangs-VNR unter den Treffern suchen“', 'Pflichtfeld',
  'Bestätigt, sobald die Kundennummer die <Vorgang-VNR> führt. Bleibt sie leer, endet der Vorgang mit einer BE.'),
 ('IS011-Gebdat', 'Geburtsdatum des gefundenen Partners',
  'IS011, Anzeige zur Kundennummer', 'optional',
  'Gegenprobe zur Identität des Partners; der Vergleich entfällt, wenn <BUE_KUNDE_GEBDAT> leer ist.'),
 ('Anforderung-Arten', 'anzufordernde Unterlagenarten für die Notiz',
  'Abgeleitet aus <BUE_ART_UNTERLAGEN>', 'Pflichtfeld wenn <BUE_ANF_UNTERLAGEN> = ja',
  'Wird auf die drei Kennzeichen des Notizabschnitts „Folgearbeit für Komposit“ abgebildet.'),
]
for werte in NEUE_VARIABLEN:
    ergaenze_zeile(t_var, list(werte))


# ------------------------------------------------- 5. Notizbestueckung Feld fuer Feld
NOTIZ = [
 'Hinweis: Der Bot legt die Telefonnotiz an und füllt sie Feld für Feld. Für '
 'Komposit und Leben gilt die Vorlage 1515 „Bestandsübertragung Robotics PB“, für die Krankenversicherung die '
 'Vorlage BOT2011. Ob die Vorlage bestückt oder eine Freitextnotiz mit gleichem Aufbau erzeugt wird, ist noch zu '
 'bestätigen.',
 'Feld „Eingangsdatum“ (Pflicht) = <Eingangsdatum-BUE>',
 'WENN',
 '<BUE_MV_EINGANGSDATUM> = leer',
 'DANN',
 'Feld „Eingangsdatum“ = Eröffnungsdatum des Postkorbvorgangs',
 'Ende WENN',
 'Feld „Maklername“ (Pflicht) = <OB726-Name>',
 'Feld „Agenturnummer“ (Pflicht) = <BUE_AGENTUR_NR>',
 'WENN',
 '<BUE_AGENTUR_NR> = leer',
 'DANN',
 'Feld „Agenturnummer“ = <AGT-Uebernehmer>',
 'Ende WENN',
 'Feld „Personalnummer“ (Pflicht) = <OB726-PNR>',
 'Feld „E-Mail aufnehmender Makler“ = <Makler-Email>',
 'Auswahl „Bearbeitung nach“ (Pflicht):',
 'WENN',
 '<BUE_POOL> <> leer',
 'UND <BUE_UV_ERTEILT> = „nein“',
 'DANN',
 'Auswahl „Bearbeitung nach“ = „Untervollmacht fehlt“',
 'SONST',
 'Auswahl „Bearbeitung nach“ = „Mit BÜ-Wunsch“',
 'Ende WENN',
 'Auswahl „Betroffene VNR“ (Pflicht) = „angegebene VNR beachten“',
 'Feld „VNR“ = <Vorgang-VNR>; weitere zur Übertragung anstehende Nummern nachrichtlich ergänzen',
 'Hinweis: Die Notiz beauftragt immer eine Einzel-BÜ für die <Vorgang-VNR>, nie eine Gesamt-BÜ. Auch bei '
 '<BUE_UMFANG> = „Gesamt“ läuft jede Versicherungsnummer als eigener Vorgang mit eigener Notiz; die übrigen '
 'Nummern stehen nur nachrichtlich in der Notiz, damit die Folgebearbeitung den Zusammenhang erkennt.',
 'Kennzeichen „Folgearbeit für Komposit“:',
 'WENN',
 '<BUE_ANF_UNTERLAGEN> = „ja“',
 'DANN',
 'Setze die zutreffenden Kennzeichen aus <Anforderung-Arten>',
 'Ende WENN',
 'Feld „Laufende Nr. aus Vorgangsdatenbank“ = <Vorgang-Lfd-Nr>',
 'Telefonnotiz speichern.',
 'Hinweis: Die Maske lässt bei „Bearbeitung nach“ genau zwei Auswahlen zu. Der in der Kaskade vorgesehene Wert '
 '„BÜ mit UV“ hat in der Maske keine Entsprechung und ist zu klären.',
 'Hinweis: Für die dritte Auswahl „angegebene VNR nicht beachten“ nennt die PDD keinen Fall. Auch die Kennzeichen '
 '„Rahmenvertrag übertragbar“ und „Rahmenvertrag nicht übertragbar“ sowie „Dokumente für weitere VNR hochladen“ '
 'sind in der Maske vorhanden, aber fachlich nicht geregelt.',
]
setze_zelle(finde_tabelle('Telefonnotiz anlegen').rows[1].cells[1], NOTIZ)


# ------------------------------------------------- 6. BE-Handling mit Routing
BE = [
 'Hinweis: Jede Business Exception wird an dieser Stelle einheitlich behandelt. <BE-Klassifikation> trägt den '
 'Grund der BE; <Fehlerliste> enthält die in den Einzelprüfungen gesammelten Prüfnotizen. Das Routing ist für '
 'harte Business Exceptions und für „Nachprüfung erforderlich“ identisch; es unterscheidet sich nur im Inhalt des '
 'Bearbeitungshinweises.',
 '<BE> = „ja“ setzen',
 'Bearbeitungshinweis füllen mit <BE-Klassifikation>, <Fehlerliste> und <Vorgang-VNR>',
 'Bearbeitungshinweis am Postkorbvorgang speichern',
 'WENN',
 'Sparte = Krankenversicherung',
 'DANN',
 'Vorgang an den Themenpostkorb „HSB4K MV“ (Postkorb-Nr. TBD) weiterleiten',
 'SONST',
 'WENN',
 '<VA230-AGT-Inhaber> ist einem Makler zugeordnet',
 'DANN',
 'Vorgang in die Nachbearbeitung nach ODPB geben',
 'SONST',
 'Vorgang an den Themenpostkorb „HSB4K KO“ (Postkorb-Nr. TBD) weiterleiten',
 'Ende WENN',
 'Ende WENN',
 'Report: <BE-Klassifikation> und <Fehlerliste> in das Reporting übernehmen',
 'Verarbeitung dieses Vorgangs beenden, weiter mit dem nächsten Vorgang',
 'Hinweis: Bei Komposit und Leben entscheidet der abgebende Bestandsinhaber: ein Makler führt nach ODPB, alle '
 'übrigen Fälle einschließlich eines nicht ermittelbaren Bestandsinhabers führen nach HSB4K KO.',
 'Hinweis: Die Sparte wird nicht abgefragt. Der Postkorbvorgang startet je Sparte den passenden Prüf-Bot; welcher '
 'Zweig gilt, steht damit von Anfang an fest.',
 'Mögliche Werte von <BE-Klassifikation>:',
 'Kein BÜ-Vorgang',
 'BÜ-Wunsch nicht vorhanden',
 'Betreuungswunsch nicht auf MFA ausgestellt',
 'Unterschrift VN fehlt',
 'Kunde in IS011 nicht gefunden',
 'Keine Kundennummer führt die Vorgangs-VNR',
 '<Klassifikation für nicht aktuelle Verträge – durch Fachbereich festzulegen>',
 'Agenturnummer nicht vorhanden',
 'Vermittlernummer / PNR nicht vorhanden',
 'Keine Zusammenarbeit',
 'Nachprüfung erforderlich',
 'Mögliche Prüfnotizen in <Fehlerliste>:',
 'Unterlagen nicht vollständig',
 'Geburtsdatum abweichend',
 'Name übernehmender Makler abweichend',
 'Vermittlertyp abweichend',
 'Stammagentur nicht ermittelbar',
 'Anbindung Bestandsinhaber nicht aktiv',
 'Absender ist eine interne ERGO-Adresse',
]
setze_zelle(finde_tabelle('Jede Business Exception wird an dieser Stelle').rows[0].cells[1], BE)


# ------------------------------------------------- 7. Formatierung und Sichern
import os
if os.environ.get('OHNE_FORMAT') != '1':
    for tb in schritt_tabellen():
        fmt.formatiere_tabelle(tb)
d.save(ZIEL)
print('gespeichert:', ZIEL)
