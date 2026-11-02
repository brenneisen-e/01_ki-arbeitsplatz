# -*- coding: utf-8 -*-
"""PDF: BÜ-Reporting – Logik, Datenfluss und vollständiger Makro-Quellcode (für den Celonis-Nachbau)."""
import os, re, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
                                Preformatted, KeepTogether)
from reportlab.platypus.tableofcontents import TableOfContents
from xml.sax.saxutils import escape

Q = sys.argv[1]                      # .../bue_reporting/quellen
AUS = sys.argv[2]
VERSION, STAND = '12.93', '26.10.2026'

F = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('DS', F + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DSB', F + 'DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DSI', F + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DM', F + 'DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('DMB', F + 'DejaVuSansMono-Bold.ttf'))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily('DS', normal='DS', bold='DSB', italic='DSI', boldItalic='DSB')

ROT = colors.HexColor('#C8102E')
PETROL = colors.HexColor('#0B6E7A')
GRAU = colors.HexColor('#5A5A5A')
HELL = colors.HexColor('#F2F2F2')
LINIE = colors.HexColor('#D0D0D0')

st = {
    'titel': ParagraphStyle('titel', fontName='DSB', fontSize=22, leading=27, textColor=ROT, spaceAfter=6),
    'untertitel': ParagraphStyle('ut', fontName='DS', fontSize=11.5, leading=15, textColor=GRAU),
    'h1': ParagraphStyle('h1', fontName='DSB', fontSize=15, leading=19, textColor=ROT, spaceBefore=4, spaceAfter=8),
    'h2': ParagraphStyle('h2', fontName='DSB', fontSize=11.5, leading=15, textColor=PETROL, spaceBefore=10, spaceAfter=4),
    'h3': ParagraphStyle('h3', fontName='DSB', fontSize=9.5, leading=12.5, textColor=colors.black, spaceBefore=7, spaceAfter=2),
    'p': ParagraphStyle('p', fontName='DS', fontSize=9, leading=12.6, spaceAfter=4, alignment=TA_LEFT),
    'b': ParagraphStyle('b', fontName='DS', fontSize=9, leading=12.6, leftIndent=12, bulletIndent=2, spaceAfter=2),
    'klein': ParagraphStyle('k', fontName='DS', fontSize=7.5, leading=10, textColor=GRAU),
    'zelle': ParagraphStyle('z', fontName='DS', fontSize=7.8, leading=10),
    'zellek': ParagraphStyle('zk', fontName='DSB', fontSize=7.8, leading=10, textColor=colors.white),
    'zellem': ParagraphStyle('zm', fontName='DM', fontSize=7.2, leading=9.5),
    'code': ParagraphStyle('code', fontName='DM', fontSize=6.3, leading=7.6),
    'toc1': ParagraphStyle('toc1', fontName='DSB', fontSize=9.5, leading=14, leftIndent=0),
    'toc2': ParagraphStyle('toc2', fontName='DS', fontSize=8.5, leading=12, leftIndent=14),
}


def P(t, s='p'):
    return Paragraph(t, st[s])


def B(t):
    return Paragraph(t, st['b'], bulletText='•')


def tabelle(kopf, zeilen, breiten, mono=()):
    daten = [[Paragraph(escape(k), st['zellek']) for k in kopf]]
    for z in zeilen:
        daten.append([Paragraph(c if isinstance(c, str) and c.startswith('<') else escape(str(c)),
                                st['zellem'] if i in mono else st['zelle']) for i, c in enumerate(z)])
    t = Table(daten, colWidths=[b * mm for b in breiten], repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PETROL),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, HELL]),
        ('LINEBELOW', (0, 0), (-1, -1), 0.3, LINIE),
        ('LEFTPADDING', (0, 0), (-1, -1), 4), ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5), ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    return t


class Doku(BaseDocTemplate):
    def __init__(self, pfad):
        super().__init__(pfad, pagesize=A4, leftMargin=18 * mm, rightMargin=16 * mm, topMargin=18 * mm, bottomMargin=16 * mm,
                         title='BÜ-Reporting HSB4 K – Logik, Datenfluss und Makros', author='Eike Brenneisen')
        fr = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id='f')
        self.addPageTemplates([PageTemplate(id='seite', frames=[fr], onPageEnd=self.rahmen)])
        self.kapitel = ''

    def beforeDocument(self):
        self.kapitel = ''

    def rahmen(self, c, doc):
        c.saveState()
        if doc.page > 1:
            c.setFont('DS', 7)
            c.setFillColor(GRAU)
            c.drawString(self.leftMargin, A4[1] - 11 * mm, 'BÜ-Reporting HSB4 K · Logik, Datenfluss und Makros · Version %s' % VERSION)
            c.drawRightString(A4[0] - self.rightMargin, A4[1] - 11 * mm, self.kapitel)
            c.setStrokeColor(LINIE)
            c.line(self.leftMargin, A4[1] - 12.5 * mm, A4[0] - self.rightMargin, A4[1] - 12.5 * mm)
            c.drawString(self.leftMargin, 9 * mm, 'Stand %s' % STAND)
            c.drawRightString(A4[0] - self.rightMargin, 9 * mm, 'Seite %d' % doc.page)
        c.restoreState()

    def afterFlowable(self, f):
        if isinstance(f, Paragraph) and f.style.name in ('h1', 'h2'):
            text = f.getPlainText()
            if f.style.name == 'h1':
                self.kapitel = text
            key = 'k%d' % id(f)
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=0 if f.style.name == 'h1' else 1, closed=f.style.name == 'h1')
            self.notify('TOCEntry', (0 if f.style.name == 'h1' else 1, text, self.page, key))


# ---------------------------------------------------------------- Prozeduren aus dem Quelltext
DEKL = re.compile(r'^\s*(Public |Private |Friend )?(Static )?(Sub|Function|Property Get|Property Let|Property Set)\s+([A-Za-z_][\w]*)', re.I)


def prozeduren(zeilen):
    out = []
    for i, z in enumerate(zeilen):
        m = DEKL.match(z)
        if not m or z.strip().lower().startswith(("'", 'end ', 'exit ')):
            continue
        sicht = (m.group(1) or 'Public ').strip()
        art = m.group(3)
        # Kommentarblock direkt darueber
        j, kom = i - 1, []
        while j >= 0 and zeilen[j].strip().startswith("'"):
            t = zeilen[j].strip().lstrip("'").strip().strip('-=').strip()
            if t:
                kom.insert(0, t)
            j -= 1
        out.append((m.group(4), art, sicht, i + 1, ' '.join(kom)))
    return out


def modulkopf(zeilen):
    """Kommentar im Kopf des Moduls (zwischen den ===-Linien bzw. die ersten Kommentarzeilen)."""
    kom = []
    for z in zeilen[:80]:
        s = z.strip()
        if s.lower().startswith('option '):
            continue
        if s.startswith("'"):
            t = s.lstrip("'").strip().strip('-=').strip()
            if t:
                kom.append(t)
        elif s:
            break
    return kom


MODULE = [
    ('modLaden', 'Laden der Rohdaten (OPAG, Verbund), Erkennung, Vergleich, Fakten, Ablage, Celonis-Übergabe, Anwesenheit, SharePoint/Power Query'),
    ('modCockpit', 'Knöpfe und Chips des Cockpits, Filter, Ansicht (Tag/Aktuelle KW/Woche), Diagrammbereiche'),
    ('modTagesablauf', 'Geführter Tagesablauf „Neue Daten laden“ (drei Karten)'),
    ('modWerkzeuge', 'Werkzeug-Karten: SLA anpassen, Rohdaten löschen, Zurücksetzen, Ältester Vorgang'),
    ('modStandard', 'Karte „Standard festlegen“ (Themenpostkörbe, GeVo-Typen)'),
    ('modPPT', 'PowerPoint-Folie aus dem Blatt „PPT“'),
    ('modFolienauswahl', 'Karte „Welche Kacheln auf die Folie?“'),
    ('modFortschritt', 'Fortschritts-Overlay und Hinweiskarten'),
    ('Cockpit', 'Blattmodul Cockpit (Ereignisse)'),
    ('Kalender', 'Blattmodul Kalender (Ereignisse)'),
    ('Rohdatenblatt', 'Blattmodul Rohdatenblatt (Sprung zur aktuellen Woche)'),
]


def lesen(name):
    for ext in ('.bas', '.cls'):
        p = os.path.join(Q, 'vba', name + ext)
        if os.path.exists(p):
            return name + ext, open(p, encoding='utf-8', errors='replace').read().replace('\r\n', '\n').split('\n')
    raise FileNotFoundError(name)


def code_block(zeilen, start=1):
    """Quelltext mit Zeilennummern, in Bloecken (Preformatted bricht nicht selbst um: lange Zeilen umbrechen)."""
    breite = 118
    teile, puffer = [], []
    for n, z in enumerate(zeilen, start):
        z = z.replace('\t', '    ')
        erste = True
        while True:
            stueck, z = z[:breite], z[breite:]
            puffer.append(('%5d  ' % n if erste else '       ') + stueck)
            erste = False
            if not z:
                break
            z = '   ' + z
        if len(puffer) >= 90:
            teile.append(Preformatted('\n'.join(puffer), st['code']))
            puffer = []
    if puffer:
        teile.append(Preformatted('\n'.join(puffer), st['code']))
    return teile


def bauen():
    doc = Doku(AUS)
    s = []
    # ---------------------------------------------------------------- Deckblatt
    s += [Spacer(1, 45 * mm), P('BÜ-Reporting HSB4 K', 'titel'),
          P('Logik, Datenfluss und vollständiger Makro-Quellcode', 'untertitel'), Spacer(1, 4 * mm),
          P('Master-Datei Version %s · Stand %s' % (VERSION, STAND), 'untertitel'), Spacer(1, 14 * mm),
          P('Zweck dieses Dokuments: Grundlage für den Nachbau des Cockpits in Celonis auf Basis der beiden Rohtabellen BUE OPAG und '
            'BUE Verbund. Teil A beschreibt fachliche Logik, Datenfluss und Sonderregeln, Teil B die Power-Query-Abfragen, Teil C '
            'enthält eine Übersicht aller Prozeduren und den vollständigen VBA-Quellcode der Master-Datei. Anhang D zeigt den Python-'
            'Spiegel der Ladelogik (gleiche Rechnung wie das VBA, kompakter lesbar).'),
          Spacer(1, 6 * mm),
          P('Alle Zahlenbeispiele stammen aus den Abzügen vom 22. und 23.09.2026 (oe_nr = HSB4 K).', 'klein'),
          PageBreak()]
    toc = TableOfContents()
    toc.levelStyles = [st['toc1'], st['toc2']]
    s += [P('Inhalt', 'titel'), toc, PageBreak()]

    # ---------------------------------------------------------------- A Logik
    s.append(P('A. Fachliche Logik und Datenfluss', 'h1'))
    s.append(P('A.1 Datenfluss im Überblick', 'h2'))
    schritte = [
        ('1', 'Abzug', 'Das Team speichert je Arbeitstag den Rückstandsabzug OPAG und den Rückstandsabzug Verbund aus MIS-O als Excel-Datei '
                       'in den Ordner „Rohdaten“ neben der Master-Datei (Dateiname beliebig).'),
        ('2', 'Erkennen', '„Neue Daten laden“ öffnet jede neue Datei, erkennt je Blatt Stichtag (Zeile „Rückstandsstichtag = …“ in den ersten '
                          '15 Zeilen) und Quelle (Kopfzeile mit „Themenpostkorb“; mit „OPS_AUFTR_ID“ = OPAG, sonst Verbund).'),
        ('3', 'Vergleichen', 'Die Schlüssel des Stands werden mit den Schlüsseln des zuletzt geladenen Stands derselben Quelle verglichen '
                             '(Blatt Snapshot_OPAG bzw. Snapshot_Verbund). Daraus entstehen Eingänge und Abgänge.'),
        ('4', 'Verdichten', 'Je Stichtag, Quelle, Sparte, Verwaltungssystemschlüssel, Themenpostkorb und GeVo entsteht eine Zeile im Blatt '
                            '„Fakten“ mit Rückstand, Altersklassen, Eingängen, Abgängen und dem höchsten Rückstandsalter.'),
        ('5', 'Rechnen', 'Cockpit, Verlauf, Wochenwerte, Rohdatenblatt und PPT rechnen über Formeln aus „Fakten“ (gefiltert nach den Chips '
                         'Themenpostkorb, GeVo, Sparte); die Makros setzen nur Filterzellen und Diagrammbereiche.'),
        ('6', 'Ablegen', 'Mit Dateipfad (lokal, Netzlaufwerk, OneDrive-Verknüpfung) benennt das Makro die Datei einheitlich und legt sie in '
                         'Rohdaten\\JJJJ\\MM_Monat ab (z. B. 20260923_BUe_OPAG.xlsx). Auf SharePoint ohne Pfad bleibt sie liegen.'),
        ('7', 'Celonis', 'Jede geladene Rohdatei wird zusätzlich unter dem einheitlichen Namen in den Ordner aus Konfiguration B6 kopiert '
                         '(Standard H:\\Process-Mining-Sync\\Upload); Celonis_Upload_Log.txt verhindert doppelte Übergaben.'),
        ('8', 'Anwesenheit', 'Für die Produktivität liest „Anwesenheit laden“ die neueste Datei im Ordner „Anwesenheit“ (MAK-Liste je KW oder '
                             'Telefonie- und Abwesenheitsplan) in die Blätter Mitarbeiter und Kalender.'),
    ]
    s.append(tabelle(['', 'Schritt', 'Was passiert'], schritte, [8, 24, 144]))

    s.append(P('A.2 Rohtabellen und Spalten', 'h2'))
    s.append(P('Beide Abzüge haben oben einige Kopfzeilen (Stichtag, Filter oe_nr, Altersgrenzen), dann die Spaltenköpfe, darunter eine Zeile '
               'je Datensatz und am Ende eine Summenzeile („Anzahl: 13.831“), die übersprungen wird. Spaltenreihenfolge egal.'))
    spalten = [
        ('Verwaltungssystemschlüssel', 'beide', 'Verwaltungssystem (KV, LV, SV, KR …). Bestimmt die Sparte (Tabelle A.5).'),
        ('Ordnungsbegriff', 'beide', 'Vertrags-/Ordnungsnummer im Verwaltungssystem.'),
        ('VORG_VERBU_LNR', 'beide', 'Laufende Nummer des Vorgangs im Vorgangsverbund. Mit VSS und Ordnungsbegriff der Vorgangsschlüssel.'),
        ('oe_nr / OE_NR', 'beide', 'Organisationseinheit (hier „HSB4 K“). Im HS-Reporting nur Filter des Abzugs; im Makler-Reporting '
                                   'bestimmt sie die Einheit der Zeile (OE-Ebene 4).'),
        ('Themenpostkorb', 'beide', 'Postkorb, in dem der Vorgang liegt (z. B. „KO  23724“); Leerzeichen werden zusammengefasst, leer = „(ohne Postkorb)“.'),
        ('Rückstandsalter_Tage', 'beide', 'Alter in Tagen am Stichtag (Abschnitt A.4).'),
        ('GEVO_SL', 'beide', 'Geschäftsvorfall „Nummer Text“ (z. B. „108 …“); die Nummer ist der GeVo-Typ für die Filter.'),
        ('OPS_AUFTR_ID', 'nur OPAG', 'Auftrags-ID im OPAG-System. Ein Vorgang kann mehrere Aufträge haben.'),
        ('OPS_ARBGUT_LNR', 'nur OPAG', 'Laufende Nummer des Arbeitsguts innerhalb des Auftrags (1, 2, 3 …). Eine OPAG-Zeile = ein Arbeitsgut.'),
        ('Anzahl', 'beide', 'Immer 1 je Zeile (wird nicht gebraucht).'),
    ]
    s.append(tabelle(['Spalte', 'Quelle', 'Bedeutung und Verwendung'], spalten, [40, 18, 118], mono=(0,)))
    s.append(P('Die Bedeutung von OPS_AUFTR_ID, OPS_ARBGUT_LNR und OE_NR ist aus Namen und Daten abgeleitet, wie das Reporting sie verwendet; '
               'eine fachliche Feldbeschreibung aus MIS-O liegt nicht vor.', 'klein'))

    s.append(P('A.3 Schlüssel, OPAG und Verbund', 'h2'))
    s.append(B('<b>Verbund</b> zählt <b>Vorgänge</b>: Schlüssel = Verwaltungssystemschlüssel + Ordnungsbegriff + VORG_VERBU_LNR. Im Abzug ist jeder Schlüssel eindeutig.'))
    s.append(B('<b>OPAG</b> zählt <b>Arbeitsgüter</b>: Schlüssel = derselbe Vorgangsschlüssel + OPS_AUFTR_ID + OPS_ARBGUT_LNR.'))
    s.append(B('Verknüpfung: Über den Vorgangsschlüssel (VSS + Ordnungsbegriff + VORG_VERBU_LNR) passen beide Tabellen zusammen. Am 23.09.2026: '
               '13.831 Verbund-Vorgänge, 29.525 OPAG-Arbeitsgüter zu 13.808 Vorgängen (Ø 2,14 Arbeitsgüter je Vorgang); 13.796 Vorgänge in '
               'beiden Tabellen, 12 nur in OPAG, 35 nur in Verbund.'))
    s.append(B('Das Reporting verknüpft die beiden Tabellen nicht zeilenweise, sondern rechnet jede Quelle für sich und stellt sie nebeneinander '
               '(Kennzahl „Verhältnis Verbund zu OPAG“ = OPAG-Arbeitsgüter je Verbund-Vorgang).'))

    s.append(P('A.4 Kennzahlen', 'h2'))
    kz = [
        ('Rückstand', 'Anzahl Zeilen des Abzugs am Stichtag in der gewählten Auswahl (OPAG Arbeitsgüter, Verbund Vorgänge).'),
        ('Eingänge', 'Schlüssel, die heute in der Auswahl sind und im zuletzt geladenen Stand derselben Quelle nicht in der Auswahl waren: neu '
                     'im Abzug oder aus einem anderen Postkorb/GeVo hereingewechselt. Zugeordnet nach den Merkmalen von heute.'),
        ('Abgänge', 'Schlüssel, die im vorigen Stand in der Auswahl waren und heute nicht mehr: erledigt, an die Sparte weitergeleitet, an den '
                    '72-Stunden-BOT übergeben oder in einen Postkorb/GeVo außerhalb der Auswahl gewechselt. Zugeordnet nach den Merkmalen des Vortags.'),
        ('Wechsel in der Auswahl', 'Weder Eingang noch Abgang (z. B. MV nach KO, beide gewählt). Dadurch gilt für jede Auswahl: Rückstand heute = '
                                   'Rückstand voriger Stand + Eingänge − Abgänge. Wechsel stehen im Blatt Umbuchungen.'),
        ('Erster Stand', 'Der erste Stand je Quelle liefert nur den Rückstand; Eingänge und Abgänge gibt es ab dem zweiten.'),
        ('Lücken', 'Wochenende oder fehlender Tag: Vergleich immer gegen den letzten geladenen Stand, die Bewegungen zählen zum neuen Stichtag.'),
        ('Rückstandsalter', 'Spalte Rückstandsalter_Tage unverändert aus dem Abzug. Altersklassen 0–7, 8–30, 31–90, über 90 Tage; „Ältester '
                            'Vorgang“ = Stichtag minus höchstes Alter in der Auswahl.'),
        ('Wochenwert', 'Rückstand einer KW = Stand vom Sonntag der KW (Montag gehört zur neuen KW); fehlt der Sonntag, der letzte Stand der KW '
                       '(mit Stern). Eingänge/Abgänge der KW = Summe der Bewegungen der Stände dieser KW.'),
        ('SLA', 'Verbund: 5.500 Vorgänge (Konfiguration F3). OPAG: Wert in F4, leer = Vorschlag SLA Verbund × Ø-Verhältnis OPAG/Verbund der letzten 14 Tage.'),
        ('Produktivität', 'Abgänge je MAK (nicht Teil des Celonis-Nachbaus); MAK aus Mitarbeiter/Kalender.'),
    ]
    s.append(tabelle(['Kennzahl', 'Definition'], kz, [34, 142]))
    s.append(P('Rückstandsalter in den Daten (22. → 23.09.2026)', 'h3'))
    s.append(B('Alle Schlüssel, die an beiden Tagen im Abzug stehen, haben am 23.09. genau einen Tag mehr: 13.327 von 13.327 (Verbund), '
               '28.605 von 28.605 (OPAG). Ein Zurücksetzen während der Bearbeitung kommt in diesem Vergleich nicht vor.'))
    s.append(B('Neue Schlüssel am 23.09.: Verbund 205 mit Alter 0, daneben viele mit Alter größer 0 (1, 2, 13, 16, 19 …); OPAG 446 mit Alter 0. '
               'Alter 0 heißt also „am Stichtag entstanden“; ein Eingang im Sinne des Reportings kann aber älter sein (z. B. in den Abzug '
               'hineingewechselt). Eingänge deshalb immer über den Schlüsselvergleich bestimmen, nicht über Alter = 0.'))
    s.append(P('Die Aussage stützt sich auf zwei aufeinanderfolgende Tage; über längere Zeiträume ist das Verhalten nicht geprüft.', 'klein'))

    s.append(P('A.5 Sparten, Filter und Standard-Auswahl', 'h2'))
    sp = [('KV', 'KV'), ('LV, LF, LG', 'Leben'), ('SV, KR, DA, HA, AS, UV, GV, TR, IT', 'Komposit'), ('alle übrigen', 'Sonstige')]
    s.append(tabelle(['Verwaltungssystemschlüssel', 'Sparte'], sp, [90, 86]))
    s.append(P('Zuordnung in Konfiguration A11:B40 (änderbar).', 'klein'))
    s.append(B('<b>Themenpostkörbe</b>: Standard = KO, MV (ohne 72-Stunden-BOT, BÜ, GR und AZ; BE, WR, 00 fachlich offen). Festgelegt in Konfiguration '
               'H:L bzw. Knopf „Standard festlegen“. Das Rohdatenblatt (Wochenreport für das HS-Dashboard) rechnet immer mit dem Standard.'))
    s.append(B('<b>GeVo</b>: „Alle GeVo“ (kein Filter), „Nur BÜ-Schlüssel“ (GeVo 108, 469 Komposit/Leben; 2015, 6065 KV; Konfiguration D11:D20) '
               'oder manuelle Auswahl der 13 häufigsten GeVo-Typen plus „Alle übrigen“.'))
    s.append(B('<b>Sparten-Chips</b>: Komposit, Leben, KV, Sonstige grenzen alle Kennzahlen ein.'))
    s.append(B('Eingänge und Abgänge hängen von der Auswahl ab (Wechsel über die Auswahlgrenze zählen). Für Celonis heißt das: Bewegungen je '
               'Auswahl aus den Schlüsseln beider Stände neu bestimmen, nicht aus Summen ableiten.'))

    s.append(P('A.6 Sonderregeln und versteckte Logik', 'h2'))
    for t in [
        'Reihenfolge: Stände werden nach Stichtag sortiert verarbeitet; ein Stand, der älter ist als der zuletzt geladene seiner Quelle, wird übersprungen.',
        'Ein Stand (Quelle + Stichtag) wird nur einmal geladen. Kommt ein neuer Abzug für einen schon geladenen Tag, fragt das Tool: übernehmen '
        'ersetzt den Stand und rechnet Eingänge/Abgänge dieses und aller späteren Stände neu (alte Datei …_ersetzt, verworfene …_verworfen).',
        'Sammeldateien: mehrere Blätter (z. B. „OPAG 22.09.“, „Verbund 22.09.“) werden je Blatt erkannt.',
        'Neue Themenpostkörbe anderer Bereiche (Postkorb nicht auf 23724 endend): Karte nach dem Laden fragt, welche nicht betrachtet werden.',
        'Ausgeblendete Blätter: Snapshot_OPAG / Snapshot_Verbund (Schlüssel des letzten Stands, Grundlage des Vergleichs), Wirksam (MAK je '
        'Person und KW), SP_Liste (Power-Query-Ergebnisse, im Tool ausgeblendete SharePoint-Dateien), Celonis_Log, Diagrammdaten (7 Perioden je Diagramm).',
        'Fakten: eine Zeile je Stichtag, Quelle, Sparte, VSS, Postkorb, GeVo mit Rückstand, Altersklassen, Eingängen, Abgängen, höchstem Alter '
        'und Schlüssel des ältesten Datensatzes. Cockpit, Verlauf und Wochenwerte rechnen über Formeln darauf.',
        'Rohdatenblatt: Zeilen 67–90 (7VA–7OL) = Rückstand zum letzten Stichtag der KW, Zu-/Abgänge der KW, immer Standard-Auswahl, „Gesamt“ '
        'einschließlich Sonstige; Zeile 160/161 = Datum des verwendeten Stands. Daraus liest das HR-Sales-Dashboard per Verknüpfung.',
        'Manuelle Schritte: Abzüge aus MIS-O ziehen und ablegen, Anwesenheit pflegen (Kalender), ggf. Standard und SLA festlegen.',
        'Bereich MAKLER (zweite Master-Datei): mehrere Einheiten je Tag, Vergleich je Einheitengruppe, Einheit aus OE_NR (Konfiguration Q11:R40). '
        'Zeilen der HS-Einheit (OE HSB4 K → HSB) zählen nicht; reine HS-Abzüge werden nicht geladen und heißen danach …_HS-ignoriert (12.91).',
        'Jeder Stand (Quelle, Stichtag, Einheit) wird nur einmal geladen. Als geladen gilt eine Zeile im Ladeprotokoll mit leerem Hinweis, '
        '„erster Stand …“ oder der Angabe zum Verkettungskennzeichen (StandGueltig, 12.92). Bis 12.91 las „Neue Daten laden“ mit '
        'OneDrive-Verknüpfung den letzten Stand jeder Quelle beim nächsten Laden noch einmal ein (Rückstand doppelt); das erste Laden '
        'mit 12.92 entfernt diese Doppel aus Fakten und Ladeprotokoll (DoppelteStaendeBereinigen).',
        'Neue Version ohne Neuladen (12.93, modUpdate): „Ältere Datei aktualisieren …“ übernimmt aus der zusätzlich geöffneten '
        'älteren Datei Fakten, Verlauf, Ladeprotokoll, Umbuchungen, Snapshots, Dateiinhalt, Mitarbeiter, Kalender, Konfiguration und '
        'Filter und speichert die neue Version unter Name und Ort der alten (Sicherung vorher in Protokolle\\Sicherung).',
    ]:
        s.append(B(escape(t)))

    s.append(P('A.7 Blätter der Master-Datei', 'h2'))
    bl = [('Cockpit', 'Kennzahlen, Chips, Diagramme'), ('PPT', 'Kacheln für die Folie'), ('Verlauf', 'eine Zeile je Stichtag (gefiltert)'),
          ('KW', 'Abgänge, MAK, Produktivität je KW'), ('Wochenwerte', 'Nachschlagetabelle je KW (Schlüssel Jahr*100+KW)'),
          ('Rohdatenblatt', 'Nachbau des Wochenreports (Zeilen 1–157), BÜ-Zeilen automatisch'), ('Fakten', 'verdichtete Sätze (siehe A.6)'),
          ('Umbuchungen', 'Wechsel von Postkorb/GeVo/Sparte zwischen zwei Ständen'), ('Ladeprotokoll', 'je Stand Datei, Blatt, Quelle, Stichtag, Zeilen, Bewegungen'),
          ('Filter', 'Zellen der Chips und Hilfsgrößen'), ('Konfiguration', 'Pfade, Sparten, BÜ-Schlüssel, Standard, SLA'),
          ('Mitarbeiter, Kalender', 'Anwesenheit und Arbeitszeitmodell'), ('Anleitung', 'Bedienung und Kennzahlen (Grundlage dieses Teils A)')]
    s.append(tabelle(['Blatt', 'Inhalt'], bl, [40, 136]))
    s.append(PageBreak())

    # ---------------------------------------------------------------- B Power Query
    s.append(P('B. Power Query', 'h1'))
    s.append(P('Power Query wird nur benutzt, wenn die Master-Datei aus SharePoint ohne Dateipfad geöffnet ist („In Desktop-App öffnen“). '
               'Mit Dateipfad (lokal, Netzlaufwerk, OneDrive-Verknüpfung) liest VBA die Ordner direkt; dann gibt es keine Abfragen. Die '
               'Abfragen werden zur Laufzeit von VBA erzeugt und in der Datei gespeichert (ThisWorkbook.Queries); ihr M-Code entsteht in '
               'den Funktionen unten (vollständig in Teil C, modLaden).'))
    pq = [
        ('SpFormel', 'Auflistung eines SharePoint-Ordners samt Ablage JJJJ\\MM_Monat: Spalten Rel (relativer Pfad), Geaendert, Groesse. Navigiert mit '
                     'SharePoint.Contents, ersatzweise SharePoint.Files.', 'aktiv'),
        ('SpTextFormel', 'Zeilen einer Textdatei im Ordner (Celonis_Upload_Log.txt, Ladelog) als Tabelle; prüft, dass der Ordner der Master-Datei '
                         'gemeint ist.', 'aktiv'),
        ('SpAblageFormel', 'Umbenennen/Verschieben über die SharePoint-Schnittstelle (_api, POST). Power Query sendet POST nur anonym; deshalb '
                           'seit 12.81 abgeschaltet.', 'nicht aktiv'),
        ('SpTabelle', 'Schreibt/aktualisiert die Abfrage, lädt sie in das Blatt SP_Liste und gibt die Werte an VBA zurück.', 'aktiv'),
    ]
    s.append(tabelle(['VBA-Funktion', 'Abfrage', 'Status'], pq, [30, 128, 18], mono=(0,)))
    s.append(P('Beispiel: erzeugter M-Code der Ordnerauflistung (SpFormel)', 'h3'))
    s.append(Preformatted(BEISPIEL_M, st['code']))
    s.append(PageBreak())

    # ---------------------------------------------------------------- C Makros
    s.append(P('C. VBA-Makros', 'h1'))
    s.append(P('Die Master-Datei enthält %d Module mit zusammen %d Zeilen. Einstieg für das Laden ist <font name="DM">modLaden.NeueDatenLaden</font> '
               '(Knopf „Neue Daten laden“ über <font name="DM">modTagesablauf.LadenStarten</font>). Alle Karten und Dialoge sind Formen auf dem '
               'Blatt (keine UserForms). Die Rechnung selbst steckt in modLaden; die übrigen Module steuern Oberfläche, Filter und Folie.'
               % (len(MODULE), GESAMT)))
    s.append(tabelle(['Modul', 'Zeilen', 'Aufgabe'], [(n, z, a) for n, z, a in MOD_INFO], [34, 14, 128], mono=(0,)))
    s.append(P('C.1 Prozeduren je Modul', 'h2'))
    for datei, zeilen, procs, kopf in MOD_DATEN:
        s.append(P(datei, 'h3'))
        if kopf:
            s.append(P(escape(' '.join(kopf))[:1600], 'klein'))
        rows = [(n, a.replace('Property ', 'Prop. '), v, str(z), escape(k[:330] + ('…' if len(k) > 330 else ''))) for n, a, v, z, k in procs]
        if rows:
            s.append(tabelle(['Name', 'Art', 'Sicht', 'Zeile', 'Beschreibung (Kommentar im Code)'], rows, [42, 15, 13, 12, 94], mono=(0,)))
        s.append(Spacer(1, 3 * mm))
    s.append(PageBreak())
    s.append(P('C.2 Quellcode', 'h2'))
    s.append(P('Vollständig und unverändert, mit Zeilennummern; lange Zeilen sind umbrochen (eingerückt fortgesetzt).', 'klein'))
    for datei, zeilen, procs, kopf in MOD_DATEN:
        s.append(PageBreak())
        s.append(P(datei, 'h2'))
        s += code_block(zeilen)

    # ---------------------------------------------------------------- D Python
    s.append(PageBreak())
    s.append(P('D. Anhang: Python-Spiegel der Ladelogik', 'h1'))
    s.append(P('verarbeitung.py rechnet dasselbe wie modLaden (Erkennung, Schlüssel, Rückstand, Eingänge, Abgänge, Altersklassen) und dient im '
               'Projekt als Prüfreferenz. Für den Celonis-Nachbau ist es die kompakteste Beschreibung der Rechnung.'))
    s += code_block(open(os.path.join(Q, 'verarbeitung.py'), encoding='utf-8').read().split('\n'))
    doc.multiBuild(s)


# ---------------------------------------------------------------- Daten vorbereiten
MOD_DATEN, MOD_INFO, GESAMT = [], [], 0
for name, aufgabe in MODULE:
    datei, zeilen = lesen(name)
    while zeilen and not zeilen[-1].strip():
        zeilen.pop()
    MOD_DATEN.append((datei, zeilen, prozeduren(zeilen), modulkopf(zeilen)))
    MOD_INFO.append((datei, str(len(zeilen)), aufgabe))
    GESAMT += len(zeilen)

BEISPIEL_M = r'''let
    Seite = "https://<host>/sites/<Seite>",
    Teile = {"<Bibliothek>", "<Ordner>", "Rohdaten"},
    Ordner = "https://<host>/sites/<seite>/<bibliothek>/<ordner>/rohdaten/",
    Groesse = (a) => try a[Size] otherwise null,
    IstOrdner = (x) => Value.Is(x, type table),
    Ebene = (t as table, rel as text, tiefe as number) as table =>
        let
            Dateien = Table.SelectRows(t, each not IstOrdner([Content])),
            Eigene = Table.FromColumns({List.Transform(Dateien[Name], each rel & _), Dateien[Date modified],
                                        List.Transform(Dateien[Attributes], Groesse)}, {"Rel", "Geaendert", "Groesse"}),
            Unter = Table.SelectRows(t, each IstOrdner([Content]) and (if tiefe = 2
                        then Text.Length([Name]) = 4 and Text.Length(Text.Select([Name], {"0".."9"})) = 4
                        else Text.Length([Name]) > 3 and Text.Length(Text.Select(Text.Start([Name], 2), {"0".."9"})) = 2
                             and Text.Middle([Name], 2, 1) = "_")),
            Tiefer = if tiefe <= 0 then {} else List.Transform(Table.ToRecords(Unter),
                        each @Ebene([Content], rel & [Name] & "\", tiefe - 1))
        in
            Table.Combine({Eigene} & Tiefer),
    Navigiert = try List.Accumulate(Teile, SharePoint.Contents(Seite, [ApiVersion = 15]),
                    (s, n) => s{[Name = n]}[Content]) otherwise null,
    Ersatz = () =>
        let
            Alle = SharePoint.Files(Seite, [ApiVersion = 15]),
            Treffer = Table.SelectRows(Alle, each Text.StartsWith(Text.Lower([Folder Path]), Ordner)),
            Rel = List.Transform(Table.ToRecords(Treffer),
                    each Text.Replace(Text.Middle([Folder Path], Text.Length(Ordner)), "/", "\") & [Name])
        in
            Table.FromColumns({Rel, Treffer[Date modified], List.Transform(Treffer[Attributes], Groesse)},
                              {"Rel", "Geaendert", "Groesse"}),
    Ergebnis = if Navigiert = null then Ersatz() else Ebene(Navigiert, "", 2)
in
    Ergebnis'''

bauen()
print('geschrieben', AUS)
