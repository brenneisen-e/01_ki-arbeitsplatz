# -*- coding: utf-8 -*-
"""Befüllt den ERGO-Prozessfragebogen (FRQ-2026) für den BÜ-Prüf-Bot.
Gegründet auf dem erarbeiteten Prozess; quantitative/Owner-Felder werden klar als
'<vom Fachbereich/Auftraggeber zu ergänzen>' markiert (keine erfundenen Zahlen)."""
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.table import WD_ALIGN_VERTICAL
DARK=RGBColor(0x1A,0x1A,0x1A); BLUE=RGBColor(0x1f,0x49,0x7d)
d=Document('FRQ-2026_original.docx')

def put(cell, text, color=DARK, bold=False, size=10):
    cell.vertical_alignment=WD_ALIGN_VERTICAL.TOP
    cell.text=""
    first=True
    for line in text.split('\n'):
        p=cell.paragraphs[0] if first else cell.add_paragraph(); first=False
        pf=p.paragraph_format
        pf.space_after=Pt(0); pf.left_indent=Pt(0); pf.first_line_indent=Pt(0)
        r=p.add_run(line); r.font.size=Pt(size); r.font.color.rgb=color; r.font.bold=bold; r.font.name='Calibri'

def ans(table, ridx, text, col=-1):
    put(table.rows[ridx].cells[col], text, color=BLUE)

# ---- Prozessname-Platzhalter ----
for p in d.paragraphs:
    if '<Prozessname>' in p.text:
        for r in p.runs:
            if '<Prozessname>' in r.text:
                r.text=r.text.replace('<Prozessname>','Bestandsübertragung Makler – Prüf-Bot')
        if '<Prozessname>' in p.text:  # falls über Runs verteilt
            p.text='Bestandsübertragung Makler – Prüf-Bot'

# ---- 2.1 Kurze Prozessbeschreibung (Beispiel ersetzen) ----
desc=[
 'Der Prüf-Bot „Bestandsübertragung Makler" prüft Bestandsübertragungs-Anfragen (BÜ) von Maklern automatisiert.',
 'Der Bot holt sich die bereits strukturierten Vorgangsdaten vom Übergabepunkt (SharePoint-Liste bzw. ERGO Datapool) ab '
 'und prüft jeden Vorgang einzeln gegen die relevanten Hostsysteme (Prüfschritte 6–16). Am Ende erstellt er ein digitales '
 'Prüfdeckblatt mit dem Ergebnis aller Prüfungen je Vertrag.',
 'Über eine Kriterien-Matrix (hart/weich/optional) wird entschieden: automatische Absage mit Begründung (hart), manuelle '
 'Prüfung durch einen Mitarbeiter (weich) oder Einstellen in den Postkorb. Im Postkorb stellt der Bot das Prüfdeckblatt '
 'ein und bereitet eine Roboter-Notiz (Entwurf) vor, die der Mitarbeiter nur noch bestätigt.',
]
# Beispiel-Absätze 57..59 ersetzen (Bsp. Roberta Radl)
paras=d.paragraphs
ex_idx=[i for i,p in enumerate(paras) if p.text.strip().startswith('Bsp. „Roberta')]
if ex_idx:
    base=ex_idx[0]
    for k,txt in enumerate(desc):
        if base+k < len(paras):
            p=paras[base+k]
            for r in list(p.runs): r.text=''
            if p.runs: p.runs[0].text=txt
            else: p.add_run(txt)
            for r in p.runs: r.font.color.rgb=BLUE; r.font.bold=False

T=d.tables
# ---- Tabelle 0: IT-Systeme (nur Prüfung – Übergabepunkt, Hostsysteme, Postkorb) ----
put(T[0].rows[0].cells[0],
 'Übergabepunkt (Input der Prüfung): SharePoint-Liste bzw. ERGO Datapool (Eingangskanal noch offen) – hier holt sich '
 'der Prüf-Bot die bereits strukturierten Vorgangsdaten ab.\n'
 'Hostsysteme (Prüfung, Schritte 6–16): Scout · IS100 · OB726 · OB510 · OB735 · OB729 · KV050 · VA210 · VA250 · PDB · '
 'SV001 · DiOrg/SAP; Vermittlerregister VVR (Schritt 9, manuell, keine API).\n'
 'Postkorb (Output): Postkorb – Einstellen des digitalen Prüfdeckblatts und der Roboter-Notiz (Entwurf).', color=BLUE)

# ---- Tabelle 1: Prozessumfeld ----
ans(T[1],0,'Ja. Die Bestandsübertragung wird heute manuell im Sales Back-Office bearbeitet; für Standardfälle bestehen '
           'bereits Robotics (72h-Bot, BÜ-Bot, BeMaS).')
ans(T[1],1,'Ja – Projekt „Makler meets KI" (Phase 2). Dieser FRQ betrifft den Prüf-Teil: die maschinelle Prüfung der '
           'Makler-Bestandsübertragung in Blue Prism (fachliche Begleitung durch Deloitte).')
ans(T[1],2,'Ja, mehrere Einheiten – Aufteilung siehe „Heute" und „Perspektivisch".')
ans(T[1],3,'HR Sales über mehrere Dienststellen: HS (HSB4 K, Dirk Amend), KBI (KBIGD, Holger Klindworth) und ODPB '
           '(ODPB3D, Marcus Koch), ggf. MSUE. Segmente: Komposit, Leben, KV/Gesundheit; Vertriebswege Makler-Makler '
           'und Makler-AO.')
ans(T[1],4,'Ja, segmentübergreifend (Komposit, Leben, KV/Gesundheit); weitere Einheiten mit gleichartigem Prozess möglich.')
ans(T[1],5,'Mehrstufig innerhalb der Prüfung: Datenabholung vom Übergabepunkt – Einzelprüfung je Vorgang gegen die '
           'Hostsysteme (Schritte 6–16) – digitales Prüfdeckblatt – Kriterien-Matrix – Einstellen in den Postkorb mit '
           'Roboter-Notiz (Entwurf). Vorgelagert separat: KI-Strukturierung; nachgelagert (bestehende Automatisierung): '
           'Ausführung der BÜ.')
ans(T[1],6,'Innerhalb der Prüfung selbst keine nennenswerten Wartezeiten. Nachgelagert (Ausführung, nicht Teil dieses '
           'Bots) gilt bei AO-Bestand eine 72-Stunden-Vorabinformation an den Außendienst.')
ans(T[1],7,'Ja, an mehreren Human-in-the-Loop-Punkten: manuelle VVR-Prüfung (Schritt 9), Bewertung geflaggter Fälle '
           '(weiche Kriterien), Freigabe der Roboter-Notiz.')
ans(T[1],8,'Hoch: 18 definierte Prüfschritte, ca. 22 Hostsysteme/Datenquellen, mehrere Sonderfälle sowie eine noch '
           'fachlich zu definierende Kriterien-Matrix (hart/weich/optional).')

# ---- Tabelle 2: Betroffene/verantwortliche Einheiten (3 Spalten) ----
ans(T[2],1,'HR Sales über mehrere Dienststellen: HS (HSB4 K), KBI (KBIGD), ODPB (ODPB3D) – Makler-Makler und Makler-AO',col=1)
ans(T[2],1,'Dirk Amend (HS / HSB4 K), Holger Klindworth (KBI), Marcus Koch (ODPB)',col=2)
ans(T[2],2,'HR Sales – Finanzierung über HS (separat, nicht über das ESP3-Budget)',col=1)
ans(T[2],2,'Klemens Steiner (Auftraggeber)',col=2)
ans(T[2],3,'HR Sales',col=1)
ans(T[2],3,'TBD – wird noch benannt',col=2)
ans(T[2],4,'Robotics Competence Center (Betrieb) gemeinsam mit dem Fach (HS / KBI / ODPB)',col=1)
ans(T[2],4,'Tanja Juraschek / Fabian Stoll (RCC)',col=2)

# ---- Tabelle 3: Strategische Einbettung ----
ans(T[3],0,'Ja, Teil von ESP3. Die Finanzierung läuft jedoch separat über HS (nicht über das ESP3-Budget). '
           'Fachliche Klammer: Projekt „Makler meets KI" (Phase 2).')
ans(T[3],1,'KI-Strukturierung (Celonis, KI-Deckblatt, Prüfschritte 1–5) wird parallel aufgebaut – Abhängigkeit. '
           'Übergabepunkt SharePoint-Liste vs. ERGO Datapool noch offen. BÜ-Reporting (MIS-O / SAS Viya) läuft '
           'getrennt/eigenständig. Robotics-Machbarkeit von Cockpit und Roboter-Notiz-Entwurf durch das RCC zu klären.')

# ---- Tabelle 4: Nutzen / Arbeitszeitersparnis (Mengengerüst durch Fach) ----
ans(T[4],0,'Ca. 3.000–5.000 BÜ-Vorgänge pro Woche (Stichprobe Phase 1: ~5.034 Maileingänge/Woche im '
           'Makler-Auftragspostfach, davon ~700 fachfremd und ~300 Reminder).')
ans(T[4],1,'Ø Fallbearbeitungszeit aus dem heutigen IST-Prozess (Bewertungsgrundlage des ZAV-Interessenausgleichs).')
ans(T[4],2,'Ist-Kapazität gemäß ZAV-Interessenausgleich (Grundlage des Einsparpotenzials, siehe unten).')
ans(T[4],3,'Ja: gleichartiger BÜ-Prozess über HS, KBI und ODPB sowie die Segmente Komposit, Leben und KV/Gesundheit '
           '(Makler-Makler und Makler-AO). Hinweis: Top-5-Makler = 65 % der BÜ-Anfragen.')
ans(T[4],5,'Hoher Anteil: regelbasierte Prüfung über den abgenommenen Prüfkatalog ermöglicht Dunkelverarbeitung; '
           'Sonderfälle / Business Exceptions bleiben Human-in-the-Loop.')
ans(T[4],6,'Arbeitszeitersparnis je Vorgang entsprechend dem Automatisierungsgrad; in Summe 6,0 MAK (siehe unten).')
ans(T[4],7,'6,0 MAK Einsparpotenzial (gemäß ZAV-Interessenausgleich).')

# ---- Tabelle 5: Sekundäreffekte (zutreffende markieren) ----
def mark(ridx, bewertung):
    ans(T[5],ridx,'X',col=1); ans(T[5],ridx,bewertung,col=2)
mark(8, 'Einheitliche, regelbasierte Prüfung aller Vorgänge')
mark(9, 'Vollständige Prüfmatrix je Vertrag, weniger Übertragungsfehler')
mark(10,'Strukturierung über KI-Deckblatt, einheitliches digitales Prüfdeckblatt')
mark(14,'Schnellere, transparente Bearbeitung der Makler-BÜ; stärkt die Maklerbindung')
mark(15,'E2E-Verarbeitung der per Mail eingehenden BÜ-Anträge')
mark(17,'Nachvollziehbare, dokumentierte Prüfung (Prüfdeckblatt, Archivierung)')

# ---- Tabelle 6: Betriebsparameter ----
ans(T[6],0,'Keine besonderen Zeiten. Geplanter Batch-Lauf zu den normalen Arbeitszeiten.')
ans(T[6],1,'Werktags (Mo–Fr), zu den normalen Arbeitszeiten.')
ans(T[6],2,'Nein.')
ans(T[6],3,'Keine feste Tagesfrist. Zielbild: Go-Live des Blue-Prism-Prüf-Bots bis Jahresende 2026 (ambitioniert). (Die 72-Stunden-Frist betrifft die nachgelagerte Ausführung.)')
ans(T[6],4,'Keine Sperrzeiten.')
ans(T[6],5,'Keine besonderen Peak-Zeiten bekannt.')

# ---- Tabelle 7: SLAs ----
ans(T[7],0,'Heute gilt als Steuerungsgröße ein maximaler Rückstand von 5.400 Vorgängen. Mit der Dunkelverarbeitung wird der Rückstand deutlich schneller abgebaut.')
ans(T[7],1,'Zielgröße: Rückstand unter dem heutigen Maximum von 5.400 Vorgängen halten bzw. durch Dunkelverarbeitung deutlich reduzieren.')

d.save('1. FRQ-2026_BUE-Pruefbot.docx')
print('FRQ befüllt -> 1. FRQ-2026_BUE-Pruefbot.docx')
