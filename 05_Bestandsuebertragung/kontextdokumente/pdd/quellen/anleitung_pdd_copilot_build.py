# -*- coding: utf-8 -*-
"""Anleitung: PDD aus der Blanko-Vorlage mit Microsoft 365 Copilot erstellen (Word) und die Prompts als Textdatei."""
import os
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

AUS = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd/anleitung_copilot'
ROT = RGBColor(0xC4, 0x12, 0x30)
SW = RGBColor(0x1A, 0x1A, 0x1A)
GRAU = RGBColor(0x5F, 0x63, 0x68)
STAND = '14.10.2026'

# ------------------------------------------------------------------ Prompts
PROMPT_0 = """Rolle: erfahrene Prozessanalyse für Robotic Process Automation (RPA) bei einem Versicherer. Aufgabe: ein Process Definition Document (PDD) für das Robotics-Team erstellen. Das PDD muss so genau sein, dass die Entwicklung den Roboter ohne Rückfragen bauen kann: jede Maske, jedes Feld, jede Bedingung, jede Ausnahme.

GRUNDREGELN
1. Quellen: Ausschließlich die Inhalte der genannten Dateien verwenden (Transkript des Walkthroughs, Arbeitsanweisung, Feldliste, Notizen). Keine Masken, Felder, Werte, Postkörbe, Schlüssel, Zeiten, Mengen oder Regeln erfinden.
2. Lücken: Fehlt eine Angabe, an genau dieser Stelle [OFFEN: konkrete Frage an den Fachbereich] einsetzen. Annahmen nur mit Kennzeichnung [ANNAHME: ...].
3. Gliederung: Kapitel und Tabellen der Vorlage beibehalten, keine Überschrift der Vorlage ändern. Neue Unterkapitel nur im Kapitel „Schritt für Schritt-Beschreibung“ anlegen.
4. Sprache: Deutsch, sachlich, im Präsens. Arbeitsschritte für den Roboter als Anweisung („Öffne“, „Lese“, „Speichere“, „Prüfe“). Keine Füllwörter, keine Werbesprache, keine Emojis. Datum als TT.MM.JJJJ, Uhrzeit als HH:MM.
5. Ein Element: Die Verarbeitung für genau ein Element beschreiben (z. B. einen Postkorbvorgang). Die Schleife über alle Elemente baut Robotics; sie wird nicht beschrieben.

VARIABLEN
6. Jede Information, die der Roboter liest, berechnet, merkt oder weitergibt, ist eine Variable in spitzen Klammern: <Name>.
7. Felder aus dem Eingangskanal (Datenpool, Formular, Datei) tragen genau den Namen aus der Feldliste, z. B. <BUE_AGENTUR_NR>. Werte, die der Roboter aus einer Maske liest, heißen <SYSTEM-Feld>, z. B. <IS011-KNR-VN> oder <VA230-AGENTUR>. Steuer-Variablen erhalten sprechende Namen, z. B. <BE-Klassifikation>, <Fehlerliste>.
8. Jede Variable steht in der „Tabelle der genutzten Variablen“ mit Kurzbeschreibung, Herkunft (System, Maske und Feld bzw. Feld der Feldliste), Prüfungen (Pflichtfeld ja oder nein), Bemerkung (Format, Länge, führende Nullen, Trennzeichen, Mapping) und Verwendung (Kapitel).
9. Eine Variable wird erst verwendet, nachdem sie gesetzt wurde.

SCHRITT FÜR SCHRITT
10. Jedes System bzw. jeder größere fachliche Block ist ein eigenes Unterkapitel (Überschrift 2) mit sprechendem Titel. Reihenfolge: „Start – Element übernehmen“, „Vorprüfung“ (falls es Ausschlusskriterien gibt, die ohne Systemaufruf erkennbar sind), die Prüf- bzw. Bearbeitungsschritte als I., II., III. …, dann „Abschluss ohne Befund“ und „Abschluss mit Befund“.
11. Unter jeder Überschrift steht eine Tabelle mit drei Spalten: „Screenshot“ | „Beschreibung“ | „Description (EN)“. Eine Zeile ist eine Maske bzw. ein zusammenhängender Arbeitsschritt. Spalte 1 enthält den Platzhalter „Screenshot: <System/Maske>, <Feld oder Bereich>“ oder „kein Screenshot erforderlich“. Spalte 3 bleibt leer; die Übersetzung folgt in einem eigenen Schritt.
12. Masken absichern: Nach jeder Aktion, die eine Maske öffnet, liest der Roboter den Maskennamen und prüft, ob die erwartete Maske angezeigt wird. Eine unerwartete Maske ist eine System Exception (technischer Fehler), keine Business Exception.
13. Schreibweise für Bedingungen, jedes Schlüsselwort in einer eigenen Zeile:
WENN
<Bedingung>
DANN
<Aktion>
SONST
<Aktion>
Ende WENN
Vergleiche mit =, <>, <, > und „leer“. Verknüpfungen UND und ODER in Großbuchstaben. Feldnamen, Maskennamen, Texte und Werte stehen in „...“.
14. Mehr als zwei verschachtelte WENN oder mehr als drei Fälle: statt der Verschachtelung eine Zuordnungstabelle (Bedingungsspalten | „Was ist zu tun“).
15. Wiederholungen mit „Schleifenstart: ...“ und „Schleifenende“ kennzeichnen.
16. Sprünge: „Weiter mit Kapitel „...““ oder „Weiter mit „...“ (nächste Zeile)“. Nur zu Kapiteln und Zeilen springen, die es im Dokument gibt.
17. Fachliche Hintergründe (warum ein Schritt nötig ist) stehen in einer eigenen Zeile, die mit „Hinweis:“ beginnt.

AUSNAHMEN
18. Eine Business Exception (BE) ist ein fachlicher Grund, warum der Roboter das Element nicht automatisch abschließen darf. Schreibweise: <BE-Klassifikation> = „<Klartext des Grundes>“, danach „Weiter zum Kapitel „Abschluss mit Befund““.
19. Unterscheidet der Prozess zwischen harten und weichen Befunden: Harte Befunde beenden die Prüfung sofort (BE). Weiche Befunde schreibt der Roboter als Prüfnotiz in <Fehlerliste> und prüft weiter; erst ein eigener Schritt „Test auf Fehlerliste“ entscheidet am Ende.
20. Jeder Wert von <BE-Klassifikation> steht in der BE-Liste im Kapitel „Abschluss mit Befund“ (Tabelle: „Wert von <BE-Klassifikation>“ | „Gesetzt in“ | „Auslöser“), zusammen mit der Weiterleitung (Postkorb, Bearbeitungshinweis).
21. System Exceptions (Maske nicht erreichbar, Zeitüberschreitung, unerwartete Fehlermeldung) einmal allgemein beschreiben, nicht in jedem Schritt.

AUSGABE
22. Tabellen als Word-Tabellen ausgeben, Überschriften als Überschriften, nicht als fetten Fließtext.
23. Nach jedem Kapitel folgt eine kurze Liste „Offene Punkte“ mit allen [OFFEN: ...] und [ANNAHME: ...] dieses Kapitels.
24. Auf die Eingabe „weiter“ hin genau dort fortsetzen, wo die letzte Antwort aufgehört hat, ohne Wiederholung."""

PROMPT_1 = """Grundlage: /PDD_Regeln, alle Regeln darin gelten.
Quellen: /Transkript_Walkthrough, /Arbeitsanweisung, /Systemliste.
Aufgabe: in diesem Dokument (Blanko-PDD) die folgenden Kapitel füllen. Antworten auf die Fragen der Vorlage gehören in die Spalte „Antwort“, die Spalte „answer“ bleibt leer.
1. Einleitung: „Verwendete Systeme“ (je System eine Zeile mit kurzer Anmerkung, wofür der Roboter es nutzt) und „Involvierte Geschäftsbereiche“.
2. Prozessautomatisierung:
- „Ziel der Prozessautomatisierung“: Wie läuft es heute, was übernimmt der Roboter, was bleibt bei den Mitarbeitenden?
- „Kurze Prozessbeschreibung“: die späteren Unterkapitel der Schritt-für-Schritt-Beschreibung als Aufzählung mit je ein bis zwei Sätzen.
- „SIPOC“ als Tabelle.
- „Prozessdiagramm“: eine nummerierte Textbeschreibung des Ablaufs mit allen Verzweigungen als Vorlage für ein Diagramm.
3. Betriebsparameter (Datensicherheit, Ansprechpartner, Fallback-Szenario), Reporting, Eingangskanal und Design: alle Fragen der Vorlage beantworten."""

PROMPT_2 = """Grundlage: /PDD_Regeln.
Aufgabe: aus /Feldliste und /Transkript_Walkthrough die „Tabelle der genutzten Variablen“ erstellen, mit den Spalten der Vorlage und zusätzlich „Verwendung“.
Reihenfolge:
1. alle Felder des Eingangskanals mit genau den Namen aus der Feldliste
2. alle Werte, die der Roboter aus Masken liest (<SYSTEM-Feld>)
3. die Steuer-Variablen (z. B. <BE>, <BE-Klassifikation>, <Fehlerliste>, Zähler)
Innerhalb jeder Gruppe alphabetisch.
In „Bemerkung“ stehen Länge, führende Nullen, Trennzeichen und Datumsformat. Felder mit unklarer Herkunft mit [OFFEN: ...] kennzeichnen."""

PROMPT_3 = """Grundlage: /PDD_Regeln und die Tabelle der genutzten Variablen in diesem Dokument.
Aufgabe: nur das Unterkapitel „<NAME DES KAPITELS, z. B. II. Vertrag – Vertragsstatus in VA230>“ beschreiben.
Systeme und Masken: <z. B. VA230, OB726>.
Quelle: /Transkript_Walkthrough (Abschnitt ab <Minute oder Stichwort>), ergänzend /Arbeitsanweisung.
Ablauf laut Fachbereich (falls vorhanden): <Stichpunkte>.
Nur Variablen aus der Variablentabelle verwenden. Wird eine neue gebraucht, steht sie am Ende unter „Neue Variablen“ mit allen Spalten der Variablentabelle.
Die letzte Zeile sagt, wie es weitergeht (nächstes Kapitel oder Abschluss)."""

PROMPT_4 = """Grundlage: /PDD_Regeln und alle Kapitel dieses Dokuments.
Aufgabe:
a) Kapitel „Abschluss ohne Befund“: was der Roboter einträgt, ablegt oder weiterleitet. Werden Felder oder Notizen befüllt, als Tabelle: Feld | Pflicht | Eintrag | Quelle und Hinweis.
b) Kapitel „Abschluss mit Befund“: Weiterleitung (Postkorb), Aufbau des Bearbeitungshinweises (Regeln und Beispiel) und die BE-Liste aller Werte von <BE-Klassifikation>, die in den Kapiteln vorkommen, mit „Gesetzt in“ und „Auslöser“.
c) Gibt es eine <Fehlerliste>, eine Tabelle aller Prüfnotizen mit „Gemerkt in“ und „Auslöser“.
Am Ende alle Widersprüche zwischen den Kapiteln auflisten."""

PROMPT_5 = """Aufgabe: dieses Dokument gegen /PDD_Regeln prüfen, ohne das Dokument zu ändern.
Ausgabe als Tabelle: Befund | Fundstelle (Kapitel und Zeile) | Vorschlag.
Prüfpunkte:
- Variablen ohne Eintrag in der Variablentabelle und Einträge, die nie verwendet werden
- Variablen, die verwendet werden, bevor sie gesetzt sind
- WENN ohne „Ende WENN“ sowie fehlendes DANN oder SONST
- Sprünge auf Kapitel oder Zeilen, die es nicht gibt
- BE-Werte, die nicht in der BE-Liste stehen, und Einträge der BE-Liste, die nirgends gesetzt werden
- Maskenwechsel ohne Prüfung des Maskennamens
- unterschiedliche Schreibweisen derselben Sache (Variablen, Masken, Werte)
- Angaben, die nicht in den Quellen stehen (mögliche Erfindungen)
- alle [OFFEN: ...] und [ANNAHME: ...]"""

PROMPT_6 = """Aufgabe: im Unterkapitel „<NAME DES KAPITELS>“ jede Zeile der Spalte „Beschreibung“ ins Englische übersetzen und in die Spalte „Description (EN)“ derselben Zeile schreiben.
Regeln:
- Variablen in <...> sowie Masken-, Feld- und Systemnamen und Werte in „...“ bleiben unverändert auf Deutsch.
- Beim ersten Vorkommen eines deutschen Werts in „...“ folgt die englische Bedeutung in Klammern.
- WENN, DANN, SONST, Ende WENN werden zu IF, THEN, ELSE, END IF; UND und ODER werden zu AND und OR.
- Aufbau und Zeilenumbrüche bleiben 1:1 erhalten."""


PROMPTS = [
    ('Prompt 0 – Regeldatei „PDD_Regeln“ (einmal anlegen)', 'In eine eigene Word-Datei „PDD_Regeln“ kopieren und speichern. Alle anderen Prompts verweisen darauf.', PROMPT_0),
    ('Prompt 1 – Rahmenkapitel', 'In Word im Blanko-PDD in die Copilot-Seitenleiste.', PROMPT_1),
    ('Prompt 2 – Tabelle der genutzten Variablen', 'In Word im PDD; das Ergebnis unter „Tabelle der genutzten Variablen“ einfügen.', PROMPT_2),
    ('Prompt 3 – Schritt-für-Schritt-Beschreibung (je Unterkapitel wiederholen)', 'Die Angaben in <...> je Kapitel ersetzen. Ein Kapitel je Aufruf.', PROMPT_3),
    ('Prompt 4 – Abschluss, BE-Liste, Fehlerliste', 'Nachdem alle Prüfkapitel stehen.', PROMPT_4),
    ('Prompt 5 – Qualitätsprüfung', 'Vor jedem Review und nach größeren Änderungen.', PROMPT_5),
    ('Prompt 6 – Englische Spalte', 'Erst, wenn die deutsche Fassung abgestimmt ist; je Unterkapitel.', PROMPT_6),
]

# ------------------------------------------------------------------ Word-Helfer
doc = Document()
for s in doc.sections:
    s.left_margin = s.right_margin = Cm(2.2)
    s.top_margin = Cm(2.0)
    s.bottom_margin = Cm(2.0)
    fp = s.footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fr = fp.add_run('Copyright © Deloitte 2026')
    fr.font.name = 'Aptos'
    fr.font.size = Pt(8)
    fr.font.color.rgb = RGBColor(0x5F, 0x63, 0x68)
st = doc.styles['Normal']
st.font.name = 'Aptos'
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Aptos')
st.font.size = Pt(10.5)
st.paragraph_format.space_after = Pt(6)
st.paragraph_format.line_spacing = 1.15
for name, size, color in (('Title', 24, SW), ('Heading 1', 15, ROT), ('Heading 2', 12, SW), ('Heading 3', 11, SW)):
    h = doc.styles[name]
    h.font.name = 'Aptos'
    h.element.rPr.rFonts.set(qn('w:eastAsia'), 'Aptos')
    h.element.rPr.rFonts.set(qn('w:ascii'), 'Aptos')
    h.element.rPr.rFonts.set(qn('w:hAnsi'), 'Aptos')
    h.font.size = Pt(size)
    h.font.bold = True
    h.font.color.rgb = color
    h.paragraph_format.space_before = Pt(16 if name == 'Heading 1' else 10)
    h.paragraph_format.space_after = Pt(6)


def schattieren(zelle, farbe):
    tcPr = zelle._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), farbe)
    tcPr.append(shd)


def rahmen(tabelle, farbe='D0D5DA'):
    tblPr = tabelle._tbl.tblPr
    b = OxmlElement('w:tblBorders')
    for kante in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement('w:' + kante)
        e.set(qn('w:val'), 'single')
        e.set(qn('w:sz'), '4')
        e.set(qn('w:color'), farbe)
        b.append(e)
    tblPr.append(b)


def absatz(text, fett_anfang=None, farbe=None, groesse=None, kursiv=False):
    p = doc.add_paragraph()
    if fett_anfang:
        r = p.add_run(fett_anfang)
        r.bold = True
    r = p.add_run(text)
    r.italic = kursiv
    if farbe:
        r.font.color.rgb = farbe
    if groesse:
        r.font.size = Pt(groesse)
    return p


def punkt(text, fett_anfang=None, nummer=False):
    p = doc.add_paragraph(style='List Number' if nummer else 'List Bullet')
    if fett_anfang:
        p.add_run(fett_anfang).bold = True
    p.add_run(text)
    p.paragraph_format.space_after = Pt(3)
    return p


def kasten(text, hinweis_farbe='F3F4F6', schrift='Aptos', groesse=9):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    rahmen(t)
    z = t.rows[0].cells[0]
    schattieren(z, hinweis_farbe)
    z.paragraphs[0].text = ''
    zeilen = text.split('\n')
    for i, zeile in enumerate(zeilen):
        p = z.paragraphs[0] if i == 0 else z.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        r = p.add_run(zeile)
        r.font.name = schrift
        r.element.rPr.rFonts.set(qn('w:eastAsia'), schrift)
        r.font.size = Pt(groesse)
        if zeile.isupper() and len(zeile) > 3:
            r.bold = True
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def tabelle(kopf, zeilen, breiten):
    t = doc.add_table(rows=1, cols=len(kopf))
    rahmen(t)
    for i, k in enumerate(kopf):
        c = t.rows[0].cells[i]
        schattieren(c, '1A1A1A')
        c.paragraphs[0].text = ''
        r = c.paragraphs[0].add_run(k)
        r.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        r.font.size = Pt(9.5)
    for z in zeilen:
        cells = t.add_row().cells
        for i, w in enumerate(z):
            cells[i].paragraphs[0].text = ''
            r = cells[i].paragraphs[0].add_run(w)
            r.font.size = Pt(9.5)
            if i == 0:
                r.bold = True
    for zeile in t.rows:
        for i, b in enumerate(breiten):
            zeile.cells[i].width = Cm(b)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


# ------------------------------------------------------------------ Inhalt
doc.add_paragraph('PDD mit Copilot erstellen', style='Title')
absatz('Anleitung für ein Process Definition Document (PDD) für Robotics – von der Blanko-Vorlage bis zur Freigabe, '
       'mit fertigen Prompts für Microsoft 365 Copilot. Beispiele aus dem PDD „Vorprüfung Bestandsübertragung“.', farbe=GRAU, groesse=11)
absatz('Stand ' + STAND, farbe=GRAU, groesse=9)

doc.add_heading('1  Worum es geht', 1)
absatz('Ein PDD beschreibt einen Prozess so genau, dass Robotics ihn ohne Rückfragen automatisieren kann: jede Maske, jedes Feld, '
       'jede Bedingung und jede Ausnahme. Die Blanko-Vorlage gibt Gliederung und Tabellen vor. Copilot füllt sie aus den vorhandenen Prozessunterlagen – '
       'Kapitel für Kapitel und nach festen Regeln. Danach werden die Texte geprüft, die Screenshots ergänzt und das Ergebnis mit '
       'Fachbereich und Robotics abgestimmt.')
absatz('Der Kern ist eine Regeldatei („PDD_Regeln“, Prompt 0). Diese Datei legt einmal fest, wie Variablen heißen, wie Bedingungen und '
       'Ausnahmen geschrieben werden und dass Copilot nichts erfindet. Jeder weitere Prompt verweist auf diese Datei. So bleibt das '
       'Dokument über alle Kapitel einheitlich, auch wenn es in vielen Einzelschritten entsteht.')
tabelle(['Wer', 'Aufgabe'],
        [['Copilot', 'schreibt den Entwurf je Kapitel aus den Unterlagen und prüft das Dokument auf Lücken und Widersprüche'],
         ['Autorin oder Autor des PDD', 'sammelt die Unterlagen, steuert Copilot, setzt Screenshots und Querverweise, pflegt die Versionierung'],
         ['Fachbereich', 'liefert das Prozesswissen (Walkthrough), beantwortet die offenen Punkte und gibt fachlich frei'],
         ['Robotics', 'prüft die technische Umsetzbarkeit und gibt das PDD für die Entwicklung frei']],
        [4.0, 12.6])

doc.add_heading('2  Was gebraucht wird', 1)
punkt('die Blanko-PDD-Vorlage von Robotics (Word)', 'Vorlage: ')
punkt('Microsoft 365 Copilot in Word; die Dateien liegen in OneDrive oder SharePoint, damit Copilot sie lesen kann', 'Copilot: ')
punkt('Aufzeichnung bzw. Teams-Transkript eines Walkthroughs, in dem die Sachbearbeitung einen echten Vorgang am Bildschirm '
      'durchgeht und dabei laut erklärt, was sie prüft und warum. Das ist die wichtigste Quelle.', 'Walkthrough: ')
punkt('Arbeitsanweisung, Checklisten, Liste der Fehlerfälle oder Ausschlusskriterien', 'Prozessunterlagen: ')
punkt('alle Systeme und Masken, die bearbeitet werden (z. B. IS011, VA230, OB726)', 'Systemliste: ')
punkt('die Felder des Eingangskanals mit ihren genauen Namen (z. B. Datenpool-Feldliste)', 'Feldliste: ')
punkt('je Maske ein Bild, eindeutig benannt (z. B. „VA230_Vertragsstatus.png“), mit Testdaten', 'Screenshots: ')

doc.add_heading('3  Ablauf in acht Schritten', 1)
tabelle(['Schritt', 'Was', 'Prompt', 'Ergebnis'],
        [['1', 'Unterlagen in einen Ordner legen, Dateien sprechend benennen', '–', 'Quellordner'],
         ['2', 'Regeldatei „PDD_Regeln“ anlegen', '0', 'Regeln für alle Kapitel'],
         ['3', 'Blanko-PDD kopieren, Titel und Versionierung selbst ausfüllen', '–', 'Arbeitsdokument'],
         ['4', 'Rahmenkapitel erzeugen', '1', 'Einleitung bis Design'],
         ['5', 'Tabelle der genutzten Variablen', '2', 'Variablentabelle'],
         ['6', 'Schritt-für-Schritt-Beschreibung, ein Unterkapitel je Aufruf', '3', 'Prüf- und Bearbeitungskapitel'],
         ['7', 'Abschluss ohne und mit Befund, BE-Liste', '4', 'vollständiger Entwurf'],
         ['8', 'Prüfen, Screenshots und Querverweise, Englisch, Review', '5, 6', 'freigabefähiges PDD']],
        [1.6, 8.0, 1.8, 5.2])

doc.add_heading('4  Die Schritte im Einzelnen', 1)
doc.add_heading('Schritt 1 – Unterlagen sammeln', 2)
absatz('Alle Quellen kommen in einen Ordner neben das spätere PDD. Die Dateien heißen so wie in den Prompts '
       '(„Transkript_Walkthrough“, „Arbeitsanweisung“, „Feldliste“, „Systemliste“). In Copilot wird eine Datei mit „/“ und dem '
       'Dateinamen eingefügt.')
absatz('Tipp für den Walkthrough: Die Sachbearbeitung zeigt auch Sonderfälle („Was passiert, wenn ...?“). '
       'Genau diese Fälle werden später zu Bedingungen und Business Exceptions.', kursiv=True)
doc.add_heading('Schritt 2 – Regeldatei anlegen', 2)
absatz('Prompt 0 kommt in eine neue Word-Datei, gespeichert als „PDD_Regeln“ im selben Ordner. Copilot hat eine '
       'Grenze für die Länge einer einzelnen Eingabe; über den Verweis „/PDD_Regeln“ gelten die Regeln trotzdem in jedem Prompt. '
       'Nutzt der eigene Bereich andere Schreibweisen, werden die Regeln einmal dort angepasst, nicht in jedem Kapitel.')
doc.add_heading('Schritt 3 – Arbeitsdokument anlegen', 2)
absatz('Die Blanko-Vorlage wird kopiert und nach dem Prozess benannt, z. B. „PDD_Vorpruefung_BUE_v01“. Titel, '
       'Verteilung und die erste Zeile der Versionierung werden von Hand eingetragen. Die Anleitungskapitel der Vorlage (Beschreibungshilfen, '
       'Beispielbeschreibung) bleiben stehen, bis das Dokument fertig ist – Copilot liest sie mit.')
doc.add_heading('Schritt 4 – Rahmenkapitel', 2)
absatz('Im Arbeitsdokument in Word die Copilot-Seitenleiste öffnen und Prompt 1 eingeben. Die Antworten werden '
       'in die Kapitel der Vorlage übernommen. Das Prozessdiagramm liefert Copilot als nummerierte Beschreibung; das Bild wird '
       'danach gezeichnet (z. B. in Visio oder PowerPoint) und eingefügt.')
doc.add_heading('Schritt 5 – Variablen zuerst', 2)
absatz('Die Variablentabelle entsteht vor der Schritt-für-Schritt-Beschreibung (Prompt 2). Dann verwenden alle Kapitel dieselben '
       'Namen. Die Namen der Eingangsfelder werden mit der abgestimmten Feldliste abgeglichen – ein abweichender Name ist später ein Fehler '
       'im Roboter.')
doc.add_heading('Schritt 6 – Schritt für Schritt, ein Kapitel je Aufruf', 2)
absatz('Zuerst wird der Prozess grob gegliedert (die Aufzählung aus „Kurze Prozessbeschreibung“). Dann wird Prompt 3 je '
       'Unterkapitel einmal aufgerufen, mit ersetzten Angaben in <...>. Ein Kapitel je Aufruf ist wichtig: Copilot kürzt sonst ab oder '
       'bricht mitten in einer Tabelle ab. Bricht eine Antwort ab, genügt die Eingabe „weiter“.')
absatz('So sieht eine fertige Zeile aus (Beispiel aus dem PDD „Vorprüfung Bestandsübertragung“):', kursiv=True)
kasten('Screenshot: IS011/VAF017 „Anzeigen Stammdaten“, Feld KD\n'
       '---\n'
       'IS011 öffnen, im Feld „ORDN-BEGR“ die <Vorgang-VNR> eingeben und Enter.\n'
       'WENN\n'
       'Maskenname <> „IS011/VAF017“ ODER Feld „KD“ leer\n'
       'DANN\n'
       '<BE-Klassifikation> = „Vertrag zur VNR nicht gefunden“\n'
       'Weiter zum Kapitel „Abschluss mit Befund“\n'
       'Ende WENN\n'
       'Lese die Nummer hinter „KD“ ohne Punkt und Prüfziffer und speichere sie als <IS011-KNR-VN>.', groesse=8.5)
doc.add_heading('Schritt 7 – Abschluss und Ausnahmen', 2)
absatz('Wenn alle Prüfkapitel stehen, erzeugt Prompt 4 die beiden Abschlusskapitel und sammelt alle Business Exceptions in der '
       'BE-Liste. Widersprüche, die Copilot dabei meldet, werden mit dem Fachbereich geklärt.')
doc.add_heading('Schritt 8 – Prüfen, vervollständigen, abstimmen', 2)
punkt('Prompt 5 prüft das Dokument gegen die Regeln. Die Befundliste wird abgearbeitet, die Prüfung nach größeren Änderungen wiederholt.', 'Qualitätsprüfung: ')
punkt('Die Platzhalter „Screenshot: ...“ werden durch die Bilder ersetzt, die gelesenen Felder markiert (z. B. gelber Rahmen).', 'Screenshots: ')
punkt('Copilot schreibt Sprungziele als Kapitelnamen. Die echten Verweise entstehen über Einfügen › Querverweis; dann stimmen sie auch nach Umbenennungen.', 'Querverweise: ')
punkt('Überschriften und Bedingungen erhalten die Formatvorlagen der Vorlage (System, Fachlicher Kontext, WENN DANN).', 'Formatvorlagen: ')
punkt('Die offenen Punkte ([OFFEN: ...]) gehen gesammelt an den Fachbereich; die Suche in Word nach „[OFFEN“ findet alle. Vor der Freigabe darf keiner übrig sein.', 'Offene Punkte: ')
punkt('Erst wenn die deutsche Fassung abgestimmt ist, füllt Prompt 6 die Spalte „Description (EN)“ je Unterkapitel.', 'Englisch: ')
punkt('Jede Runde ist eine neue Version mit Eintrag in der Versionierung.', 'Versionen: ')

doc.add_heading('5  Die Prompts', 1)
absatz('Alle Prompts stehen zusätzlich in der Datei „PDD_Copilot_Prompts.txt“ zum Kopieren. Angaben in <...> werden vor dem Absenden ersetzt.')
for titel, wo, text in PROMPTS:
    doc.add_heading(titel, 2)
    absatz(wo, farbe=GRAU, groesse=9.5)
    kasten(text)

doc.add_heading('6  Tipps und Grenzen', 1)
punkt('Copilot schreibt plausibel, auch wenn eine Information fehlt. Deshalb verlangen die Regeln [OFFEN: ...] statt einer Annahme. '
      'Jede Bedingung wird trotzdem gegen den Walkthrough gelesen.', 'Nichts ungeprüft übernehmen: ')
punkt('Lange Antworten brechen ab oder werden zusammengefasst. Ein Unterkapitel je Aufruf, bei Abbruch „weiter“.', 'Kurze Abschnitte: ')
punkt('Ändert sich ein Name, zuerst in der Variablentabelle ändern, dann mit „Suchen und Ersetzen“ im ganzen Dokument; danach Prompt 5.', 'Namen konsistent halten: ')
punkt('Inhalte von Screenshots erkennt Copilot nicht zuverlässig. Masken- und Feldnamen gehören deshalb in den Walkthrough bzw. die Systemliste.', 'Bilder: ')
punkt('Nur die freigegebene Copilot-Umgebung des Unternehmens und Screenshots mit Testdaten verwenden.', 'Datenschutz: ')
punkt('Ein guter Entwurf entsteht in ein bis zwei Tagen; die Abstimmung mit Fachbereich und Robotics bleibt der größere Teil der Arbeit.', 'Aufwand realistisch planen: ')

os.makedirs(AUS, exist_ok=True)
doc.save(os.path.join(AUS, 'Anleitung_PDD_mit_Copilot.docx'))
with open(os.path.join(AUS, 'PDD_Copilot_Prompts.txt'), 'w', encoding='utf-8') as f:
    for titel, wo, text in PROMPTS:
        f.write('=' * 78 + '\n' + titel + '\n' + wo + '\n' + '=' * 78 + '\n' + text + '\n\n')
print('geschrieben', AUS)
