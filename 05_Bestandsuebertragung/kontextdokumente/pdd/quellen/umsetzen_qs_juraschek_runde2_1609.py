# -*- coding: utf-8 -*-
"""QS-Review PDD Gesundheit/KV, zweite Kommentarrunde vom 16.09.2026 (T. Juraschek, M. Jeglorz).

Aufruf: python3 umsetzen_qs2_1609.py <PDD_1609_1.docx> <Ausgabe.docx>

Alle Kommentare und Anker bleiben erhalten. Fehlende Angaben (Postkorb-Nummern, GeVo-Nummer,
BE-Klassifikation nicht aktueller Vertraege, OB726-Fehlermeldung, Scout-Service-Aufruf, EOS-Auswahlregel,
Prozessende Weiterleitung/Neueroeffnung) werden nicht erfunden, sondern sichtbar als TBD/Platzhalter gefuehrt."""
import sys, zipfile, copy, random
from lxml import etree

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
W14 = '{http://schemas.microsoft.com/office/word/2010/wordml}'
XML = '{http://www.w3.org/XML/1998/namespace}'
EIN, AUS = sys.argv[1], sys.argv[2]
zin = zipfile.ZipFile(EIN); teile = {n: zin.read(n) for n in zin.namelist()}
doc = etree.fromstring(teile['word/document.xml']); protokoll = []
ANKER = (W + 'commentRangeStart', W + 'commentRangeEnd', W + 'commentReference')


def ptext(p): return ''.join(t.text or '' for t in p.iter(W + 't'))
def alle(): return list(doc.iter(W + 'p'))
def finde(text, nr=0, anzahl=None):
    tr = [p for p in alle() if ptext(p) == text]
    if anzahl is not None: assert len(tr) == anzahl, (text, len(tr))
    assert len(tr) > nr, (text, len(tr)); return tr[nr]
def start(prefix, nr=0, anzahl=1):
    tr = [p for p in alle() if ptext(p).startswith(prefix)]; assert len(tr) == anzahl, (prefix, len(tr)); return tr[nr]
def hat_anker(p): return any(e.tag in ANKER for e in p.iter())
def anker_ids(): return sorted((etree.QName(e).localname, e.get(W + 'id')) for e in doc.iter() if e.tag in ANKER)
def settext(p, text):
    runs = [r for r in p.findall(W + 'r') if r.find(W + 't') is not None]
    for r in runs[1:]: p.remove(r)
    if runs: r = runs[0]
    else:
        r = etree.SubElement(p, W + 'r'); etree.SubElement(r, W + 't')
    for e in list(r):
        if e.tag in (W + 't', W + 'br'): r.remove(e)
    for i, teil in enumerate(text.split('\n')):
        if i: etree.SubElement(r, W + 'br')
        t = etree.SubElement(r, W + 't'); t.text = teil; t.set(XML + 'space', 'preserve')
    for e in p.findall(W + 'proofErr'): p.remove(e)
    protokoll.append('geändert: ' + text.replace('\n', ' ')[:90]); return p
def anker_verschieben(p, ziel):
    for e in list(p):
        if e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd') or (e.tag == W + 'r' and e.find(W + 'commentReference') is not None):
            ziel.append(e)
def loesche(p, ziel=None):
    if ziel is None:
        ziel = p.getprevious()
        while ziel is not None and ziel.tag != W + 'p': ziel = ziel.getprevious()
        if ziel is None:
            ziel = p.getnext()
            while ziel.tag != W + 'p': ziel = ziel.getnext()
    if hat_anker(p): anker_verschieben(p, ziel)
    protokoll.append('gelöscht: ' + ptext(p)[:90]); p.getparent().remove(p)
def neue_para_id(p):
    p.set(W14 + 'paraId', '%08X' % random.randint(0x10000000, 0x7FFFFFFF)); p.set(W14 + 'textId', '77777777')
def klon(vorlage, text=None):
    p = copy.deepcopy(vorlage)
    for e in list(p):
        if e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd', W + 'bookmarkStart', W + 'bookmarkEnd', W + 'proofErr'): p.remove(e)
        elif e.tag == W + 'r' and (e.find(W + 'commentReference') is not None or e.find(W + 't') is None): p.remove(e)
    if p.get(W14 + 'paraId'): neue_para_id(p)
    if text is not None: settext(p, text)
    else: protokoll.append('kopiert: ' + ptext(p)[:90])
    return p
def nach(p, *neue):
    for n in neue: p.addnext(n); p = n
    return p
def vor(p, *neue):
    for n in neue: p.addprevious(n)
def zeile_von(p):
    e = p
    while e.tag != W + 'tr': e = e.getparent()
    return e
def zellen(tr): return tr.findall(W + 'tc')
def zelle_setzen(tc, text):
    ps = tc.findall(W + 'p'); assert ps
    settext(ps[0], text)
    for x in ps[1:]:
        if not hat_anker(x): tc.remove(x)
def lauf_ersetzen(alt, neu, anzahl):
    n = 0
    for r in doc.iter(W + 'r'):
        ts = r.findall(W + 't')
        if ts and ''.join(t.text or '' for t in ts) == alt:
            ts[0].text = neu; ts[0].set(XML + 'space', 'preserve')
            for t in ts[1:]: r.remove(t)
            n += 1
    assert n == anzahl, (alt, n); protokoll.append(f'Diagramm ({n}x): ' + neu[:80])
def block_bis(p_start, ende_text='Ende WENN'):
    """Absatzblock von p_start bis zum naechsten Absatz mit ende_text (inklusive)."""
    b = [p_start]; e = p_start
    while ptext(e) != ende_text:
        e = e.getnext(); assert e is not None and e.tag == W + 'p'; b.append(e)
    return b
def verschiebe_nach(block, ziel):
    for p in block:
        p.getparent().remove(p); ziel.addnext(p); ziel = p
    protokoll.append('verschoben: ' + ptext(block[0])[:60] + ' … (' + str(len(block)) + ' Absätze)')

anker_vorher = anker_ids()

# Vorlagen
V_WENN = finde('WENN'); V_DANN = finde('DANN'); V_ENDE = finde('Ende WENN'); V_SONST = finde('SONST')
V_ZEILE = finde('<IS100-Nachname> = leer')
V_ODER = finde('ODER <IS100-Nachname> <> <BUE_KUNDE_NACHNAME>')
V_UND = finde('UND <BUE_ANF_UNTERLAGEN> = „nein“')
V_HINWEIS = start('Hinweis: Ist <BUE_KUNDE_VORNAME> bzw. <BUE_KUNDE_GEBDAT> leer')
V_BE = finde('<BE-Klassifikation> = „VNR nicht korrekt / nicht vorhanden“')
V_WEITER_BE = finde('Weiter zum Kapitel „BE-Handling“', 0)
V_LISTE = finde('Nachname abweichend')
V_SONSTWENN = finde('SONST WENN')

# ============================================================ Einleitung / Kurzbeschreibung (Kommentare 66/90: hart/weich)
settext(start('Der Prüf-Bot sammelt zunächst alle Prüfergebnisse ein'),
        'Der Prüf-Bot sammelt zunächst alle Prüfergebnisse ein, bewertet sie anschließend anhand der definierten '
        'Prüfkriterien (Business Exceptions und Prüfnotizen) und entscheidet erst danach über Ablehnung, Aussteuerung '
        'oder Weitergabe. Dadurch sinkt die Zahl der ausgesteuerten Geschäftsvorfälle gegenüber einer Prüfung mit '
        'sofortigem Abbruch beim ersten Fehler deutlich.')
settext(start('Vorgänge, die alle harten Kriterien erfüllen'),
        'Vorgänge ohne Business Exception werden mit einer vollständig bestückten Notiz an den 72-Stunden-BOT '
        'übergeben, der die Weitergabe an den nachgelagerten BÜ-BOT steuert. Die Sachbearbeitung bearbeitet nur noch die '
        'fachlich begründeten Ausnahmen. Ablehnungen werden unmittelbar und ohne Liegezeit an den übernehmenden '
        'Vermittler kommuniziert.')
settext(start('Vorprüfung – Ausschlusskriterien: Klassifikation, BÜ-Wunsch, Reminder, Vollständigkeit der Unterlagen'),
        'Vorprüfung – Ausschlusskriterien: Klassifikation, BÜ-Wunsch, Reminder, Vorhandensein der Maklervollmacht und '
        'Übereinstimmung des Vollmachtgebers; unvollständige Unterlagen führen nicht zum Ausschluss, sondern zu einer '
        'Prüfnotiz in <Fehlerliste>. Erst wenn alle Kriterien erfüllt sind, laufen die fachlichen Prüfungen an. Dadurch '
        'entfallen die Hostzugriffe für Vorgänge, die ohnehin ausgesteuert werden.')
settext(start('I. VN – Stammdaten + VNR: VNR-Prüfung in VA230 sowie Namens-'),
        'I. VN – Stammdaten + VNR: VNR-Prüfung und Vertragsstatus in VA230, Namensprüfung über den Scout-Service '
        '(Nachname und Vorname getrennt) sowie Geburtsdatums- und Adressprüfung in IS100. Die Prüfungen laufen je '
        'Versicherungsscheinnummer des Vorgangs.')
settext(start('Weiterleitung an den BÜ-Bot: Alle freigegebenen Vorgänge werden mit vollständig bestückter Notiz (BOT2011)'),
        'Weiterleitung an den BÜ-Bot: Alle freigegebenen Vorgänge werden mit vollständig bestückter Telefonnotiz an den '
        '72-Stunden-BOT übergeben. Eine Prüfung des Vertriebskanals des Bestandsinhabers findet im Prüf-Bot nicht statt; '
        'der 72-Stunden-BOT erkennt AO-Bestandsinhaber selbst, wahrt die Frist und leitet alle übrigen Vorgänge direkt an '
        'den BÜ-BOT weiter.')

# ============================================================ Verwendete Systeme
settext(start('Prüfung, ob der Vertrag zur VNR existiert. Auslesen von Vertragsstatus'),
        'Prüfung, ob der Vertrag zur VNR existiert. Auslesen von Vertragsstatus, Spartenkürzel und Agentur-Nr. (A…) des '
        'aktuellen Bestandsinhabers. Nicht aktuelle Verträge werden als Business Exception ausgesteuert.')
p_is100 = start('Auslesen und Abgleich der Stammdaten des Versicherungsnehmers: Nachname, Vorname')
settext(p_is100, 'Auslesen und Abgleich der Stammdaten des Versicherungsnehmers: Geburtsdatum, Straße, PLZ, Ort. Nachname '
                 'und Vorname werden über den Scout-Service getrennt bereitgestellt (siehe nächste Zeile).')
tr_is100 = zeile_von(p_is100); tr_scout = copy.deepcopy(tr_is100)
for z, text in zip(zellen(tr_scout), ('Scout-Service (Namensauflösung zu IS100)',
                                      'Aufruf durch den Bot in der Namensprüfung. Liefert zum Versicherungsnehmer des Vertrags Nachname '
                                      'und Vorname getrennt; in IS100 stehen beide in einem gemeinsamen Namensfeld.')):
    ps = z.findall(W + 'p'); assert len(ps) == 1
    for e in list(ps[0]):
        if e.tag in ANKER or e.tag == W + 'proofErr': ps[0].remove(e)
    neue_para_id(ps[0]); settext(ps[0], text)
tr_is100.addnext(tr_scout); protokoll.append('Tabellenzeile Scout-Service eingefügt')
settext(start('Prüfung des Anbindungsstatus (aktiv / inaktiv) des übernehmenden Vermittlers'),
        'Prüfung des Anbindungsstatus des übernehmenden Vermittlers und des bisherigen Bestandsinhabers über die Zeile '
        '„Status der Beschäftigung“ (Wert hinter „=“: aktiv / inaktiv).')
settext(start('Bestückung der Notizvorlage für den nachgelagerten BÜ-BOT.'),
        'Erstellung der Telefonnotiz für den nachgelagerten BÜ-BOT. Der Prüf-Bot erstellt die Notiz, die Weiterverarbeitung '
        'erfolgt asynchron. Ob die Notiz über die Vorlage BOT2011 oder als Freitext im Aufbau der Vorlage erstellt wird, '
        'ist durch den Fachbereich zu bestätigen (siehe Prozessende).')

# ============================================================ Design
settext(start('Die Prüfschritte in VA230, IS100, OB726, GH040 und EOS sind lesend.'),
        'Die Prüfschritte in VA230, IS100 einschließlich Scout-Service, OB726, GH040 und EOS sind lesend. Schreibende '
        'Schritte sind die Erstellung der Telefonnotiz sowie die Weiterleitung bzw. Ablage am Prozessende; ein Wiederanlauf '
        'ist zulässig, solange diese noch nicht erfolgt sind.')

# ============================================================ Details zum Startereignis (Kommentar 41)
loesche(finde('(bitte nicht Zutreffendes Löschen)'))
loesche(finde('Bitte ergänzen oder löschen und angeben, falls die Eigenschaften mit „oder“ verknüpft werden '))
settext(finde('Nein: Der Vorgang liegt in einem Gruppen/Themenpostkorb und wird von dort vom Roboter geholt. '),
        'Nein: Der Vorgang liegt in einem Gruppen/Themenpostkorb und wird von dort vom Roboter geholt. Startpostkorb ist '
        'der Themenpostkorb des Prüf-Bots Gesundheit, in dem Celonis je Eingang einen Postkorbvorgang eröffnet.')
tr_start = zeile_von(finde('Startpostkorb')); z = zellen(tr_start); assert len(z) == 3
zelle_setzen(z[1], 'Themenpostkorb Prüf-Bot Gesundheit – Postkorb-Nr. und Name Abnahmeumgebung: TBD')
zelle_setzen(z[2], 'Themenpostkorb Prüf-Bot Gesundheit – Postkorb-Nr. und Name Produktion: TBD (zu bestätigen)')
loesche(finde('(bitte anpassen / ergänzen)'))
tr_fsw = zeile_von(finde('Folgeschriftwechsel', 0)); z = zellen(tr_fsw); assert len(z) == 4
zelle_setzen(z[1], 'Vorlagenbeispiel, für den Prüf-Bot nicht bestätigt – zu klären')
zelle_setzen(z[2], 'TBD'); zelle_setzen(z[3], 'TBD')
tr_vb = zeile_von(finde('Verbundname')); z = zellen(tr_vb)
zelle_setzen(z[1], 'Vorlagenbeispiel, für den Prüf-Bot nicht bestätigt – zu klären (Verbund/GeVo-Nummer des von Celonis eröffneten Vorgangs: TBD)')
zelle_setzen(z[2], 'TBD'); zelle_setzen(z[3], 'TBD')
tr_wl = zeile_von(finde('Whitelist')); z = zellen(tr_wl)
zelle_setzen(z[1], 'Vorlagenbeispiel, für den Prüf-Bot nicht bestätigt – zu klären (Absender ist nicht der Roboter-Eingang; Celonis eröffnet den Vorgang)')
zelle_setzen(z[2], 'TBD'); zelle_setzen(z[3], 'TBD')
tr_pp = zeile_von(finde('……')); z = zellen(tr_pp)
zelle_setzen(z[0], 'Postkorbvorgang mit Datensatz im Datenpool')
zelle_setzen(z[1], 'Zum Vorgang existiert ein Datensatz im Datenpool zu <Vorgang-Lfd-Nr> (Felder BUE_…), und der Vorgang wurde vom '
                   'Roboter noch nicht bearbeitet (gleiche <Vorgang-Lfd-Nr> wird nicht erneut verarbeitet). Bearbeitung in der '
                   'Reihenfolge des Eröffnungsdatums.')
zelle_setzen(z[2], 'TBD (Postkorb für Vorgänge ohne Datensatz im Datenpool durch Fachbereich/Eingangsmanagement zu benennen)')
zelle_setzen(z[3], 'TBD')
settext(finde('Nein, wir benötigen keine Information darüber, ob und welche Vorgänge z.B. durch die Whitelisteprüfung abgelehnt wurden'),
        'TBD (Fachbereich): Vorgänge mit Business Exception werden im Report mit <BE-Klassifikation> und <Fehlerliste> '
        'geführt (Status Referred, siehe Kapitel „Reporting“). Ob Vorgänge, die die Startkriterien nicht erfüllen, '
        'zusätzlich im Report erscheinen sollen, ist noch festzulegen.')
tr_wlp = zeile_von(finde('Whitelistprüfung')); z = zellen(tr_wlp); assert len(z) == 3
zelle_setzen(z[1], 'Vorlagenbeispiel, für den Prüf-Bot nicht bestätigt – zu klären'); zelle_setzen(z[2], 'TBD')
tr_be = zeile_von(finde('Business Exceptions')); z = zellen(tr_be)
zelle_setzen(z[1], 'TBD (Abnahmeumgebung)')
zelle_setzen(z[2], 'Themenpostkorb „HSB4K MV“ – Postkorb-Nr. TBD. Bearbeitungshinweis: <BE-Klassifikation> und alle Prüfnotizen aus '
                   '<Fehlerliste> (siehe Kapitel „BE-Handling“)')
tr_fsw2 = zeile_von(finde('Folgeschriftwechsel', 1)); z = zellen(tr_fsw2); assert len(z) == 3
zelle_setzen(z[1], 'Vorlagenbeispiel, für den Prüf-Bot nicht bestätigt – zu klären'); zelle_setzen(z[2], 'TBD')
tr_ers = zeile_von(finde('„Ersatz“-Aussteuerungspostkorb falls die Scout-Zuständigkeitsermittlung genutzt wird.')); z = zellen(tr_ers)
zelle_setzen(z[1], 'Vorlagenbeispiel, für den Prüf-Bot nicht bestätigt – zu klären (Scout-Zuständigkeitsermittlung ist nicht vorgesehen)')
zelle_setzen(z[2], 'TBD')

# ============================================================ Tabelle der genutzten Variablen
settext(start('Feld_Format CH. Der Datenpool liefert „Straße“ grundsätzlich als „Str.“'),
        'Feld_Format CH. Der Datenpool liefert „Straße“ grundsätzlich als „Str.“; der Vergleich mit IS100 erfolgt '
        'zweistufig (Originalwerte, danach normalisierte Straßenbezeichnung), siehe Schritt „Adressprüfung“.')
settext(start('Feld_Format CH. 7 bis 9 Ziffern nach der Bereinigung'),
        'Feld_Format CH. Wird von EMMA ohne das Präfix „A“ und ohne Kommata oder sonstige Trennzeichen geliefert (nur '
        'Ziffern). 7 bis 9 Ziffern nach der Bereinigung; achtstellige Werte sind die neuen Agenturen nach ZAV. Der Bot '
        'verwendet diesen bereinigten Zahlenwert für den Einstieg in OB726 und für das Feld „Agenturnummer“ der Notiz.')
settext(start('Feld_Format CH. Ausprägungen: Makler, MFA (Mehrfachagent, erkannt über den EMMA-Abgleich der Agenturnummer).'),
        'Feld_Format CH. Vollständige Werteliste: Makler, MFA (Mehrfachagent, erkannt über den EMMA-Abgleich der '
        'Agenturnummer); weitere Werte sind nicht vorgesehen. Steuert in der Vorprüfung, ob die Vollmachtskriterien '
        '(Makler) oder die Betreuungswunsch-Kriterien (MFA) gelten, sowie die Ausprägung „Bearbeitung nach“ in der Notiz.')
settext(start('Feld_Format CH. Ausprägungen: Einzel (Übertragung der genannten Versicherungsnummer)'),
        'Feld_Format CH. Vollständige Werteliste: Einzel (Übertragung der genannten Versicherungsnummer), Gesamt '
        '(Übertragung der gesamten Kundenverbindung). Nennt der Auftrag mehrere Versicherungsnummern, eröffnet Celonis je '
        'Nummer einen eigenen Vorgang; jeder trägt „Einzel“, bei zusätzlicher Nennung der gesamten Kundenverbindung '
        '„Gesamt“. Jeder Vorgang wird eigenständig mit seiner <Vorgang-VNR> geprüft. Der Wert wird in der Notiz im '
        'Abschnitt „Betroffene VNR“ übernommen. Für „Gesamt“ ist die weitere Verarbeitung noch nicht abschließend '
        'festgelegt: Kann die gesamte Kundenverbindung nicht automatisiert verarbeitet werden, ist für die einzeln '
        'geprüfte <Vorgang-VNR> eine gesonderte manuelle Bearbeitung oder eine Business Exception erforderlich; die '
        'Klassifikation dafür ist noch festzulegen.')
settext(start('Feld_Format CH. Ausprägungen: leer, „Reminder - keine Vollst.-Prüfung“'),
        'Feld_Format CH. Vollständige Werteliste: leer, „Reminder - keine Vollst.-Prüfung“, „Vollständig“, „BÜ-Wunsch '
        'fehlt“, „MV fehlt“, „MV unvollständig“, „VN-Unterschrift fehlt“. Mehrere Mängel kommagetrennt. Das Feld ist eine '
        'fachliche Ausprägung der Unterlagenprüfung (kein technischer Fehler), fasst die Bewertung der Vollmachtsfelder '
        'zusammen und wird nur im Makler-Zweig geprüft; bei MFA ist es nicht belegt. Ein anderer Wert als „Vollständig“ '
        'führt nicht zu einer sofortigen Business Exception, sondern zur Prüfnotiz „Unterlagen nicht vollständig“ in '
        '<Fehlerliste>; die weiteren Prüfungen laufen weiter.')
settext(finde('Feld_Format JN. Ausprägungen: ja, nein. Bei „ja“ entsteht keine BE; die Unterlagen werden über die Notiz angefordert.'),
        'Feld_Format JN. Vollständige Werteliste: ja, nein. Bei „ja“ entsteht weder eine BE noch eine Prüfnotiz; die '
        'Unterlagen werden über die Notiz angefordert.')
settext(finde('Feld_Format CH. Ausprägungen: BÜ-Vorgang, Anfrage-Ruecksprache, Antrag-Aenderung, Schadenmeldung, Nicht-Standard, Kein-Makler-Vorgang. Nur „BÜ-Vorgang“ wird weiterverarbeitet.'),
        'Feld_Format CH. Vollständige Werteliste: BÜ-Vorgang, Anfrage-Ruecksprache, Antrag-Aenderung, Schadenmeldung, '
        'Nicht-Standard, Kein-Makler-Vorgang. Nur „BÜ-Vorgang“ wird weiterverarbeitet, jeder andere Wert führt zur BE '
        '„Kein BÜ-Vorgang“.')
settext(finde('Feld_Format JN. Ausprägungen ja, nein. Bei „nein“ Business Exception.'),
        'Feld_Format JN. Vollständige Werteliste: ja, nein. Bei „nein“ Business Exception.')
settext(finde('Feld_Format JN. Ausprägungen ja, nein. Bei „ja“ Business Exception.'),
        'Feld_Format JN. Vollständige Werteliste: ja, nein. Bei „ja“ Business Exception.')
settext(finde('Nur der Status „aktuell“ führt zur Weiterverarbeitung; sonst „Storno“.'),
        'Nur der Status „aktuell“ führt zur Weiterverarbeitung; jeder andere Status führt zur Business Exception '
        '(Klassifikation noch festzulegen, siehe Schritt „VNR-Prüfung“).')
settext(start('Wird nachrichtlich mitgeführt; die Notizvorlage (KV: BOT2011)'),
        'Wird nachrichtlich mitgeführt und hat keine Auswirkung auf den Prozessablauf; die Notiz für KV ist durch den '
        'Postkorb des KV-Prüf-Bots vorgegeben. Ob das Feld weiterhin gelesen werden muss, ist noch zu entscheiden.')
settext(finde('IS100, Schritt „IS100 aufrufen und Stammdaten auslesen“, gelb markiertes Feld Nr. 1'),
        'Scout-Service zu IS100 (liefert den Nachnamen getrennt), Schritt „Namensprüfung“')
settext(finde('IS100, gelb markiertes Feld Nr. 2'), 'Scout-Service zu IS100 (liefert den Vornamen getrennt), Schritt „Namensprüfung“')
settext(finde('Abgleich gegen BUE_KUNDE_STRASSE; Abweichung als Prüfnotiz in <Fehlerliste>.'),
        'Abgleich gegen BUE_KUNDE_STRASSE in zwei Stufen (Originalwerte, danach normalisierte Straßenbezeichnung); '
        'Abweichung als Prüfnotiz in <Fehlerliste>.')
settext(finde('OB726 bzw. EOS, Schritt „Stammagentur-Nr. ermitteln“'),
        'EOS, Schritt „Stammagentur-Nr. ermitteln“ (nur beim Einstieg über die PNR). Beim Einstieg über die Agenturnummer '
        'wird <BUE_AGENTUR_NR> direkt verwendet, eine erneute Speicherung entfällt.')
settext(finde('Pflichtfeld der Notiz (Feld Agenturnummer).'),
        'Feld „Agenturnummer“ der Notiz beim Einstieg über die PNR; beim Einstieg über die Agenturnummer steht dort <BUE_AGENTUR_NR>.')
settext(finde('Pflichtfeld der Notiz (Feld Personalnummer bzw. KNR Makler).'),
        'Feld „Personalnummer“ der Notiz und Einstieg in GH040 bzw. EOS. Nur Ziffern ohne Präfix „P“ und ohne Trennzeichen; '
        'führende Nullen bleiben erhalten.')
settext(finde('OB726, Schritt „Klassifizierung auslesen“'),
        'OB726, Kopfzeile hinter der Vermittler-Nr. (P,…), Schritt „Klassifizierung auslesen“')
settext(finde('Ausprägungen: Makler, Mehrfachagent, Courtagefortzahler.'),
        'Text hinter der Vermittler-Nr. in der OB726-Kopfzeile; geprüft wird auf die Begriffe Makler, Mehrfachagent, Courtagefortzahler.')
for tr_alt in (zeile_von(finde('GH040-Anbindung-Makler')), zeile_von(finde('GH040-Anbindung-Inhaber'))):
    assert not hat_anker(tr_alt); tr_alt.getparent().remove(tr_alt); protokoll.append('Tabellenzeile GH040-Anbindung entfernt')
settext(finde('Quelle in fester Reihenfolge: Sonderliste TOP-Makler, BUE_MAKLER_EMAIL, OB729.'),
        'Quelle in fester Reihenfolge: Sonderliste TOP-Makler (über die PNR), BUE_MAKLER_EMAIL, OB729. Wird im gemeinsamen '
        'Abschluss der OB726-Einstiege ermittelt und für die Prüfnotiz „Absender ist eine interne ERGO-Adresse“ verwendet.')
tr_knr = zeile_von(finde('KNR-Uebernehmer')); z = zellen(tr_knr); assert len(z) == 5
zelle_setzen(z[2], 'OB726 – Quelle nicht bestätigt (TBD)')
zelle_setzen(z[3], 'zu bestätigen (TBD)')
zelle_setzen(z[4], 'Feld „KNR Makler“ der bisherigen Notizvorlage BOT2011. Quelle in OB726 und Erfordernis für die KV-Telefonnotiz sind noch zu bestätigen.')

# ============================================================ 1. Schritt: Start
p_open = finde('Postkorbvorgang öffnen.')
settext(p_open, 'Werte aus dem EWMS-Postkorb: Postkorbvorgang im Startpostkorb (Themenpostkorb Prüf-Bot Gesundheit, '
                'Postkorb-Nr. TBD, siehe Kapitel „Details zum Startereignis“) öffnen. GeVo-Nummer des Postkorbvorgangs: TBD.')
settext(finde('Datenpool mit <Vorgang-Lfd-Nr> öffnen.'),
        'Werte aus dem Datenpool: Wechsel vom EWMS-Postkorb in den Datenpool, Datensatz zum Postkorbvorgang mit '
        '<Vorgang-Lfd-Nr> öffnen.')
FELDER = ['BUE_VERMITTLER_TYP', 'BUE_KUNDE_NACHNAME', 'BUE_KUNDE_VORNAME', 'BUE_KUNDE_GEBDAT', 'BUE_KUNDE_STRASSE',
          'BUE_KUNDE_PLZ', 'BUE_KUNDE_ORT', 'BUE_VNR', 'BUE_VNR_2', 'BUE_SPARTE', 'BUE_MV_VN_NACHNAME',
          'BUE_MV_VN_VORNAME', 'BUE_POOL', 'BUE_VERMITTLER_NAME', 'BUE_AGENTUR_NR', 'BUE_VERMITTLER_NR',
          'BUE_MAKLER_EMAIL', 'BUE_MAKLER_STRASSE', 'BUE_MAKLER_PLZ', 'BUE_MAKLER_ORT', 'BUE_KLASSIFIKATION',
          'BUE_WUNSCH_VORHANDEN', 'BUE_UMFANG', 'BUE_PRUEFUNG_UNTERLAGEN', 'BUE_REMINDER', 'BUE_MV_ENTHALTEN',
          'BUE_MV_STATUS', 'BUE_MV_AUF_MAKLER', 'BUE_MV_VOLLUMFAENGLICH', 'BUE_MV_UNTERSCHRIFT_KUNDE', 'BUE_UV_ERTEILT',
          'BUE_MV_UNTERSCHRIFTSDATUM', 'BUE_MV_EINGANGSDATUM', 'BUE_ANF_UNTERLAGEN', 'BUE_ART_UNTERLAGEN']
assert len(FELDER) == 35
for f in FELDER: assert any(ptext(p) == f for p in alle()), f
settext(finde('Lese alle in der Tabelle der genutzten Variablen aufgeführten Felder <BUE_…> aus und speichere sie unter dem dort genannten Namen.'),
        'Lese die folgenden 35 Felder des Datenpools aus und speichere jedes unter dem gleichnamigen Variablennamen '
        '(vollständige Liste mit Format, Werteliste und Pflichtfeldkennzeichen im Kapitel „Tabelle der genutzten '
        'Variablen“, Herkunft „Datenpool“):\n' + ', '.join('<%s>' % f for f in FELDER) + '.')
settext(finde('Die Variablen für das BE-Handling werden zu Beginn jedes Vorgangs zurückgesetzt:'),
        'Vom Roboter initialisiert: Die Variablen für das BE-Handling werden zu Beginn jedes Vorgangs zurückgesetzt:')
settext(start('Hinweis: Eine Spartenweiche innerhalb des Prozesses ist deshalb nicht erforderlich.'),
        'Hinweis: Eine Spartenweiche innerhalb des Prozesses ist deshalb nicht erforderlich. Die Sparte wird dennoch aus '
        'VA230 gelesen und nachrichtlich mitgeführt; der Vertragsstatus wird in der VNR-Prüfung ausgewertet, nicht '
        'aktuelle Verträge werden als Business Exception ausgesteuert.')
settext(start('Hinweis: Die Trennung nach Sparte erfolgt bereits vor dem Prüf-Bot'),
        'Hinweis: Die Trennung nach Sparte erfolgt bereits vor dem Prüf-Bot: KV-Vorgänge und Vorgänge aus Komposit und '
        'Leben liegen in getrennten Postkörben. Der Prüf-Bot bedient ausschließlich den Postkorb Gesundheit; die Notiz '
        'entspricht damit fest der KV-Variante (bisherige Vorlage BOT2011).')

# ============================================================ 2. Schritt: Vorpruefung
bed = finde('<BUE_VNR> = „Manuelle Prüfung VNR/Sparte“')
wenn = bed.getprevious(); assert ptext(wenn) == 'WENN'
block = [wenn] + block_bis(bed)
assert [ptext(x) for x in block] == ['WENN', '<BUE_VNR> = „Manuelle Prüfung VNR/Sparte“', 'DANN',
                                     '<BE-Klassifikation> = „VNR nicht ermittelbar“', 'Weiter zum Kapitel „BE-Handling“', 'Ende WENN']
for x in reversed(block): loesche(x)
bed_u = finde('<BUE_PRUEFUNG_UNTERLAGEN> <> „Vollständig“')
und_u = bed_u.getnext(); assert ptext(und_u) == 'UND <BUE_ANF_UNTERLAGEN> = „nein“'
dann_u = und_u.getnext(); assert ptext(dann_u) == 'DANN'
be_u = dann_u.getnext(); assert ptext(be_u) == '<BE-Klassifikation> = „Unterlagen nicht vollständig“'
weiter_u = be_u.getnext(); assert ptext(weiter_u) == 'Weiter zum Kapitel „BE-Handling“'
settext(bed_u, '<BUE_VERMITTLER_TYP> = „Makler“')
nach(bed_u, klon(V_UND, 'UND <BUE_PRUEFUNG_UNTERLAGEN> <> „Vollständig“'))
settext(be_u, 'Merke Prüfnotiz „Unterlagen nicht vollständig“ in <Fehlerliste>')
loesche(weiter_u)
settext(start('Hinweis: Sind Unterlagen unvollständig, aber <BUE_ANF_UNTERLAGEN> = „ja“'),
        'Hinweis: <BUE_PRUEFUNG_UNTERLAGEN> ist eine fachliche Ausprägung der Unterlagenprüfung, kein technischer Fehler. '
        'Unvollständige Unterlagen (<BUE_PRUEFUNG_UNTERLAGEN> <> „Vollständig“) sind kein Ausschlusskriterium: Der Bot '
        'merkt die Prüfnotiz „Unterlagen nicht vollständig“ in <Fehlerliste>, die weiteren Host- und Einzelprüfungen '
        'laufen weiter. Erst der Test auf Fehlerliste nach allen Einzelprüfungen führt bei gefüllter <Fehlerliste> zur BE '
        '„Nachprüfung erforderlich“ und in das zentrale BE-Handling. Sind Unterlagen unvollständig, aber '
        '<BUE_ANF_UNTERLAGEN> = „ja“, entsteht weder eine Prüfnotiz noch eine BE; die fehlenden Unterlagen werden am '
        'Prozessende über die Notiz angefordert.')
settext(start('Hinweis: <BUE_UMFANG> hat die Ausprägungen „Einzel“ und „Gesamt“'),
        'Hinweis: <BUE_UMFANG> hat die Ausprägungen „Einzel“ und „Gesamt“; beide werden vollständig verarbeitet und in '
        'der Notiz unter „Betroffene VNR“ übernommen. Eine Versicherungsnummer ergibt einen Vorgang; nennt der Auftrag '
        'mehrere Versicherungsnummern, eröffnet Celonis je Nummer einen eigenen Postkorbvorgang mit derselben E-Mail und '
        'einer eigenen führenden VNR, und jeder dieser Vorgänge durchläuft den Prüf-Bot eigenständig mit seiner eigenen '
        '<Vorgang-VNR>. Für „Gesamt“ ist die weitere Verarbeitung noch nicht abschließend festgelegt: Das Verhältnis der '
        'einzeln geprüften <Vorgang-VNR> zum Auftrag „gesamte Kundenverbindung“ ist noch zu klären; kann die gesamte '
        'Kundenverbindung nicht automatisiert verarbeitet werden, ist eine gesonderte manuelle Bearbeitung oder eine '
        'Business Exception erforderlich, deren Klassifikation noch festzulegen ist.')

# ============================================================ 3. Schritt: VA230
lese_status = finde('Lese das gelb markierte Feld „Status“ aus und speichere als <VA230-Status>.')
nach(lese_status,
     klon(V_WENN), klon(V_ZEILE, '<VA230-Status> <> „aktuell“'), klon(V_DANN),
     klon(V_BE, '<BE-Klassifikation> = „<Klassifikation für nicht aktuelle Verträge – durch Fachbereich festzulegen>“'),
     klon(V_WEITER_BE), klon(V_ENDE))
settext(start('<VA230-Sparte> und <VA230-Status> werden nachrichtlich mitgeführt'),
        '<VA230-Sparte> wird nur nachrichtlich mitgeführt und hat keine Auswirkung auf den Prozessablauf: Die Sparte ist '
        'durch den Postkorb Gesundheit vorgegeben, die KV-Notiz damit festgelegt; ob die Feldbezeichnung in allen '
        'KV-Sparten gleich lautet, ist zu bestätigen (TBD). <VA230-Status> steuert die Aussteuerung: Nur ein Vertrag mit '
        'Status „aktuell“ wird weiterverarbeitet; jeder andere Status (nicht aktueller bzw. historischer Vertrag) führt '
        'zur direkten Business Exception (siehe oben).')

# ============================================================ 4. Schritt: IS100 / Scout-Service
oeffne_is100 = finde('IS100 mit <Vorgang-VNR> öffnen.')
lese_nn = oeffne_is100.getnext(); assert ptext(lese_nn) == 'Lese das gelb markierte Feld aus und speichere als <IS100-Nachname>.'
nach(oeffne_is100, klon(V_ZEILE, 'Kundenverbindung zum Versicherungsnehmer des Vertrags aufrufen (Anzeige Kundenverbindung, '
                                 'siehe Screenshot).'),
     klon(V_ZEILE, 'Scout-Service zu IS100 aufrufen: Er liefert den Namen des angezeigten Versicherungsnehmers getrennt '
                   'nach Nachname und Vorname.'))
settext(lese_nn, 'Nachname aus dem Ergebnis des Scout-Service übernehmen und speichere als <IS100-Nachname>.')
nach(lese_nn, klon(V_HINWEIS, 'Hinweis: Nachname und Vorname werden nicht direkt aus dem Namensfeld in IS100 gelesen '
                              '(dort stehen beide Werte in einem Feld, im Screenshot gelb markiert), sondern über den '
                              'Scout-Service getrennt bereitgestellt. Die weiteren Stammdaten (Geburtsdatum, Straße, PLZ) '
                              'werden weiterhin direkt in IS100 gelesen.'))
settext(finde('Lese das gelb markierte Feld aus und speichere als <IS100-Vorname>.'),
        'Vorname aus dem Ergebnis des Scout-Service übernehmen und speichere als <IS100-Vorname>.')

# ============================================================ 6. Schritt: Adresse
bed_s = finde('<IS100-Strasse> <> <BUE_KUNDE_STRASSE>')
dann_s = bed_s.getnext(); assert ptext(dann_s) == 'DANN'
merke_s = dann_s.getnext(); assert ptext(merke_s) == 'Merke Prüfnotiz „Straße abweichend“ in <Fehlerliste>'
nach(dann_s, klon(V_ZEILE, 'Normalisiere <IS100-Strasse> und <BUE_KUNDE_STRASSE> (siehe unten) und vergleiche erneut:'),
     klon(V_WENN), klon(V_ZEILE, '<IS100-Strasse> <> <BUE_KUNDE_STRASSE> auch nach der Normalisierung'), klon(V_DANN))
nach(merke_s, klon(V_ENDE))
settext(finde('Format: „Straße / Str. / etc. (z. B. Weg)“.'),
        'Normalisierung vor dem zweiten Vergleich: Zuerst werden die Originalwerte verglichen. Nur bei Abweichung werden '
        'beide Werte vereinheitlicht und erneut verglichen. Normalisiert werden: die Straßenbezeichnungen „Straße“ und '
        '„Strasse“ – auch als Wortbestandteil, z. B. „Bahnhofstraße“ – durch „Str.“ (der Datenpool liefert „Straße“ '
        'grundsätzlich als „Str.“) sowie Leerzeichen am Anfang und am Ende und mehrfache Leerzeichen. Nicht normalisiert '
        'werden (TBD, durch Fachbereich zu bestätigen): Groß-/Kleinschreibung, Satzzeichen, das Format der Hausnummer und '
        'andere Bezeichnungen wie „Weg“. Erst wenn die normalisierten Werte weiterhin abweichen, wird die Prüfnotiz '
        '„Straße abweichend“ gemerkt.')

# ============================================================ 7. Schritt: OB726 Agenturnummer (Kommentare 98–108)
p_leer = finde('<BUE_AGENTUR_NR> = leer')
nach(p_leer.getnext().getnext().getnext(),  # nach 'Ende WENN'
     klon(V_HINWEIS, 'Hinweis: Liefert der Datenpool eine Agenturnummer, erfolgt der Einstieg in OB726 über die '
                     'Agenturnummer und die PNR wird aus OB726 gelesen. Liefert der Datenpool nur eine Vermittler-Nr., '
                     'erfolgt der Einstieg über die PNR und die Stammagentur wird über EOS ermittelt (fachlicher Kontext '
                     '„Vermittler-Nr. (PNR) des übernehmenden Maklers“). Beide Einstiege münden in den gemeinsamen '
                     'Abschluss „E-Mail-Adresse des übernehmenden Vermittlers ermitteln“.'))
p_ob = finde('OB726 mit <BUE_AGENTUR_NR> öffnen.')
settext(p_ob, 'OB726 mit dem bereinigten Zahlenwert aus <BUE_AGENTUR_NR> öffnen (Lieferung aus EMMA ohne Präfix „A“ und '
              'ohne Kommata oder sonstige Trennzeichen; weitere Bereinigungsregeln sind nicht abgestimmt).')
bed_a = finde('Agentur zu <BUE_AGENTUR_NR> nicht vorhanden')
settext(bed_a, 'Agentur zu <BUE_AGENTUR_NR> nicht vorhanden: OB726 zeigt nach dem Einstieg keine Agenturdaten an bzw. '
               'gibt die Fehlermeldung „<Text der OB726-Fehlermeldung – durch Robotics zu ergänzen>“ aus')
nach(bed_a, klon(V_ODER, 'ODER der in OB726 angezeigte Ordnungsbegriff (im Screenshot gelb markiert, Format „A,…“) '
                         'enthält <BUE_AGENTUR_NR> nicht'))
sonst_a = finde('<AGT-Uebernehmer> = <BUE_AGENTUR_NR>'); p_sonst = sonst_a.getprevious(); assert ptext(p_sonst) == 'SONST'
loesche(sonst_a, ziel=bed_a); loesche(p_sonst, ziel=bed_a)
settext(finde('Format: 7-9 stellige Zahlen.'),
        'Format: 7-9 stellige Zahlen. <BUE_AGENTUR_NR> wird ohne erneute Speicherung direkt für das Feld „Agenturnummer“ '
        'der Notiz verwendet.')
# INAKTIV-Pruefung vor den Namensvergleich (Kommentar 101): Tabellenzeile verschieben
tr_name_a = zeile_von(finde('Lese das gelb markierte Feld aus und speichere als <OB726-Name>.', 0))
tr_inaktiv_a = zeile_von(finde('<OB726-Name> enthält „INAKTIV“', 0))
assert tr_name_a.getnext() is tr_inaktiv_a
zellen(tr_inaktiv_a)[0].findall(W + 'p')  # Zelle bleibt leer
ps_in = zellen(tr_inaktiv_a)[1].findall(W + 'p')
vor(ps_in[0], klon(V_ZEILE, 'Lese das gelb markierte Feld aus und speichere als <OB726-Name>.'))
settext(finde('Lese das gelb markierte Feld aus und speichere als <OB726-Name>.', 0),
        'Lese das gelb markierte Feld aus und speichere als <OB726-Name>.')
# Namenszeile: Lesezeile entfernen (steht jetzt in der INAKTIV-Zeile) und Zeilen tauschen
p_lese_name_a = zellen(tr_name_a)[1].findall(W + 'p')[0]; assert ptext(p_lese_name_a).startswith('Lese das gelb markierte Feld aus und speichere als <OB726-Name>.')
loesche(p_lese_name_a)
tr_name_a.getparent().remove(tr_name_a); tr_inaktiv_a.addnext(tr_name_a); protokoll.append('Zeilen getauscht: INAKTIV vor Namensvergleich')
# Screenshot-Beschriftung mit Bild bleibt in der Namenszeile; INAKTIV-Zeile bekommt Beschriftung
zelle_setzen(zellen(tr_inaktiv_a)[0], 'Screenshot: OB726, Feld Name des Maklers (siehe nächste Zeile)')
# PNR-Zeile (Kommentar 102)
settext(finde('Lese das gelb markierte Feld aus und speichere als <OB726-PNR>.'),
        'Suche in der OB726-Kopfzeile das Feld mit der Vermittler-Nr. (im Screenshot gelb markiert, angezeigt als „P,216697“). '
        'Lese den angezeigten Wert aus, entferne das Präfix „P“ und das Komma bzw. sonstige Trennzeichen und speichere nur '
        'den Zahlenanteil als <OB726-PNR>; führende Nullen bleiben erhalten.')
for i in (0, 1):
    settext(finde('Format: < 7 stellige Zahlen (neue PNR = 7 stellig).', 0, anzahl=2 - i),
            'Format: nur Ziffern; bisherige PNR mit weniger als 7 Stellen, neue PNR 7-stellig. Führende Nullen bleiben erhalten.')
# GH040-Zeilen (Kommentare 103, 104, 113): Zeile parsen, keine Variable
for i in (0, 1):
    settext(finde('GH040 mit <OB726-PNR> öffnen.', 0, anzahl=2 - i),
            'Wechsel von OB726 nach GH040: GH040 mit dem bereinigten <OB726-PNR> öffnen.')
    settext(finde('Lese das gelb markierte Feld aus und speichere als <GH040-Anbindung-Makler>.', 0, anzahl=2 - i),
            'Suche in der angezeigten Tabelle die Zeile „Status der Beschäftigung“ (Kennziffer, dahinter „=“ und der Wert, '
            'im Screenshot gelb markiert) und lese den Wert hinter „=“ aus. Der Wert wird nur für den folgenden Vergleich '
            'benötigt und nicht als Variable gespeichert.')
    settext(finde('<GH040-Anbindung-Makler> <> „aktiv“', 0, anzahl=2 - i),
            'Wert hinter „=“ in der Zeile „Status der Beschäftigung“ <> „aktiv“')
settext(finde('Screenshot: GH040, Anbindungsstatus'), 'Screenshot: GH040, Zeile „Status der Beschäftigung“')
# GH040-Zeile in Variante A ans Ende des Schritts (Kommentar 103): nach der Klassifizierung
tr_gh_a = zeile_von(finde('Wechsel von OB726 nach GH040: GH040 mit dem bereinigten <OB726-PNR> öffnen.', 0))
tr_klass = zeile_von(finde('Format: Makler, Mehrfachagent, Courtagefortzahler.'))
assert tr_gh_a.getnext() is tr_klass
tr_gh_a.getparent().remove(tr_gh_a); tr_klass.addnext(tr_gh_a); protokoll.append('Zeile verschoben: GH040 nach Klassifizierung')
# Klassifizierung (Kommentar 105)
settext(finde('Lese das gelb markierte Feld aus und speichere als <OB726-Klassifizierung>.'),
        'Lese die OB726-Kopfzeile mit der Vermittler-Nr. („P,…“) aus. Die ganze Zeile ist ein Feld: Übernimm den Text '
        'hinter der Nummer (im Screenshot „Makler Industrie A“, Begriff „Makler“ gelb markiert) und speichere ihn als '
        '<OB726-Klassifizierung>.')
settext(finde('Format: Makler, Mehrfachagent, Courtagefortzahler.'),
        'Prüfe <OB726-Klassifizierung> auf die Begriffe Makler, Mehrfachagent, Courtagefortzahler.')
# E-Mail in Variante A: Verweis auf gemeinsamen Abschluss (Kommentar 108)
p_mail_a = finde('<Makler-Email> = <BUE_MAKLER_EMAIL>', 0)
rest = block_bis(p_mail_a.getnext()); assert [ptext(x) for x in rest][:2] == ['WENN', '<Makler-Email> endet auf „@ergo.de“']
hinw_top = rest[-1].getnext(); assert ptext(hinw_top).startswith('Hinweis: Für definierte TOP-Makler')
weiter_a = hinw_top.getnext(); assert ptext(weiter_a).startswith('Weiter zum fachlichen Kontext „Agentur-Nr.')
settext(p_mail_a, 'Weiter zum gemeinsamen Abschluss „E-Mail-Adresse des übernehmenden Vermittlers ermitteln“ am Ende des '
                  'fachlichen Kontexts „Vermittler-Nr. (PNR) des übernehmenden Maklers“.')
for x in rest + [hinw_top, weiter_a]: loesche(x)

# ============================================================ 8. Schritt: PNR-Einstieg und EOS (Kommentare 110, 111)
settext(finde('OB726 mit <BUE_VERMITTLER_NR> öffnen.'),
        'OB726 mit <BUE_VERMITTLER_NR> öffnen (Einstieg über die Vermittler-Nr.; der Wert liegt aus dem Datenpool nur '
        'als Ziffernfolge vor).')
settext(finde('<OB726-PNR> = <BUE_VERMITTLER_NR>'),
        '<OB726-PNR> = <BUE_VERMITTLER_NR> (bereinigte PNR: nur Ziffern, führende Nullen bleiben erhalten)')
p_eos = finde('EOS mit <OB726-PNR> öffnen.')
settext(p_eos, 'Wechsel von OB726 nach EOS: EOS mit <OB726-PNR> öffnen (Einstieg über die Vermittler-Nr.).')
p_eos_lese = p_eos.getnext(); assert ptext(p_eos_lese) == 'Lese die Stammagentur-Nr. (A,…) aus und speichere als <AGT-Uebernehmer>.'
settext(p_eos_lese, 'In der Übersicht zum Vermittler die dem übernehmenden Vermittler zugeordnete Stammagentur ermitteln '
                    '(<Auswahlregel bei mehreren Agenturzeilen – durch Fachbereich/Robotics festzulegen>). Lese die '
                    'Agentur-Nr. (A,…) dieser Stammagentur aus und speichere sie als <AGT-Uebernehmer>; sie wird für das '
                    'Feld „Agenturnummer“ der Notiz benötigt.')
p_hin_stamm = start('Hinweis: Die Stammagentur ist die im Bestandssystem zum Vertrag hinterlegte Agentur')
settext(p_hin_stamm, 'Hinweis: Drei Rollen sind zu unterscheiden: der übernehmende (künftige) Vermittler aus dem Datenpool, '
                     'dessen Stammagentur aus EOS (<AGT-Uebernehmer>) und der bisherige Bestandsinhaber aus VA230 '
                     '(<VA230-AGT-Inhaber>, fachlicher Kontext „Agentur-Nr. des Bestandsinhabers ermitteln“). Die '
                     'Stammagentur des übernehmenden Vermittlers ist nicht die zum Vertrag hinterlegte Agentur des '
                     'bisherigen Bestandsinhabers.')
# gemeinsamer Abschluss E-Mail (Kommentare 108/111)
p_mail_b = finde('<Makler-Email> = <BUE_MAKLER_EMAIL>')
settext(p_mail_b, 'Gemeinsamer Abschluss für beide Einstiege (Agenturnummer und PNR): E-Mail-Adresse des übernehmenden '
                  'Vermittlers ermitteln. Die Adresse wird in fester Reihenfolge aus drei Quellen bestimmt; sie wird für '
                  'die Prüfnotiz „Absender ist eine interne ERGO-Adresse“ benötigt.')
nach(p_mail_b,
     klon(V_WENN), klon(V_ZEILE, '<OB726-PNR> ist in der fest hinterlegten Sonderliste TOP-Makler enthalten'), klon(V_DANN),
     klon(V_ZEILE, '<Makler-Email> = E-Mail-Adresse aus der Sonderliste TOP-Makler'),
     klon(V_SONSTWENN), klon(V_ZEILE, '<BUE_MAKLER_EMAIL> <> leer'), klon(V_DANN),
     klon(V_ZEILE, '<Makler-Email> = <BUE_MAKLER_EMAIL>'),
     klon(V_SONST),
     klon(V_ZEILE, 'OB729 mit der Agenturnummer des übernehmenden Vermittlers (<BUE_AGENTUR_NR> bzw. <AGT-Uebernehmer>) '
                   'öffnen, die hinterlegte E-Mail-Adresse lesen und speichern als <Makler-Email> (Anwendung OB729 zu '
                   'bestätigen, siehe Kapitel „Verwendete Systeme“)'),
     klon(V_ENDE),
     klon(V_WENN), klon(V_ZEILE, '<Makler-Email> endet auf „@ergo.de“'), klon(V_DANN),
     klon(V_ZEILE, 'Merke Prüfnotiz „Absender ist eine interne ERGO-Adresse“ in <Fehlerliste>'), klon(V_ENDE),
     klon(V_HINWEIS, 'Hinweis: Bleibt <Makler-Email> nach allen drei Quellen leer, wird keine Prüfnotiz gemerkt. Ein Versand '
                     'an die Adresse erfolgt im Prüf-Bot nicht; die Adresse wird nur für die Prüfnotiz verwendet.'),
     klon(V_ZEILE, 'Weiter zum fachlichen Kontext „Agentur-Nr. (A,…) des Bestandsinhabers ermitteln“'))

# ============================================================ 9. Schritt: Bestandsinhaber (Kommentar 113)
settext(finde('GH040 mit <VA230-AGT-Inhaber> öffnen.'), 'Wechsel von VA230 nach GH040: GH040 mit <VA230-AGT-Inhaber> öffnen.')
settext(finde('Lese das gelb markierte Feld aus und speichere als <GH040-Anbindung-Inhaber>.'),
        'Suche in der angezeigten Tabelle die Zeile „Status der Beschäftigung“ (Kennziffer, dahinter „=“ und der Wert, im '
        'Screenshot gelb markiert) und lese den Wert hinter „=“ aus. Der Wert wird nur für den folgenden Vergleich '
        'benötigt und nicht als Variable gespeichert.')
settext(finde('<GH040-Anbindung-Inhaber> <> „aktiv“'), 'Wert hinter „=“ in der Zeile „Status der Beschäftigung“ <> „aktiv“')
settext(finde('Screenshot: GH040, Anbindungsstatus des Bestandsinhabers'),
        'Screenshot: GH040, Zeile „Status der Beschäftigung“ des Bestandsinhabers')

# ============================================================ Prozessende: Telefonnotiz (Kommentare 121–127)
settext(start('Hinweis: Es wurde keine BE festgestellt. Der Vorgang wird nach der Notizbestückung'),
        'Hinweis: Es wurde keine BE festgestellt. Der Vorgang wird nach dem Erstellen der Telefonnotiz an den '
        '72-Stunden-BOT übergeben (Weiterleitung oder Neueröffnung, siehe „Prozessende“). Eine Prüfung des '
        'Vertriebskanals des abgebenden Bestandsinhabers erfolgt im Prüf-Bot nicht: Der 72-Stunden-BOT prüft selbst, ob '
        'der Bestandsinhaber der AO zugeordnet ist, gibt in diesem Fall die 72-Stunden-Information aus und leitet alle '
        'übrigen Vorgänge ohne Wartezeit an den BÜ-BOT weiter.')
settext(finde('Screenshot: Maske „Neue Notiz anlegen: BÜ auf Makler Robotics“'),
        'Screenshot: Telefonnotiz (KV-Variante) – TBD, Screenshot durch Fachbereich/Robotics zu ergänzen')
settext(finde('Notiz der Vorlage „BÜ auf Makler Robotics“ (BOT2011) anlegen und bestücken:'),
        'Telefonnotiz anlegen (<TBD Fachbereich: Freitext-Telefonnotiz im Aufbau der bisherigen Vorlage „BÜ auf Makler '
        'Robotics“ (BOT2011), da Robotics keine Notizvorlagen nutzen kann; alternativ Bestückung der Vorlage>). Inhalt '
        'der Notiz, Zeile für Zeile:')
settext(finde('Feld „Agenturnummer“ = <AGT-Uebernehmer>'),
        'Feld „Agenturnummer“ = <BUE_AGENTUR_NR> (Einstieg über Agenturnummer) bzw. <AGT-Uebernehmer> (Einstieg über PNR, '
        'Stammagentur aus EOS)')
settext(finde('Feld „KNR Makler“ = <KNR-Uebernehmer>'),
        'Feld „KNR Makler“ = <KNR-Uebernehmer> (TBD: Quelle in OB726 und Erfordernis für die KV-Telefonnotiz durch '
        'Fachbereich zu bestätigen)')
settext(finde('Feld „Laufende Nr. aus Vorgangsdatenbank“ = <Vorgang-Lfd-Nr>'),
        'Feld „Laufende Nr. aus Vorgangsdatenbank“ = <Vorgang-Lfd-Nr> (Verweis auf den Postkorbvorgang, Ordnungsbegriff '
        'des Prüf-Bots)')
settext(finde('Hinweis: Die Notizvorlage „BÜ auf Makler Robotics“ (BOT2011) wird unverändert genutzt.'),
        'Hinweis: <TBD Fachbereich: Ob die Notiz über die Vorlage BOT2011 bestückt oder als Freitext-Telefonnotiz mit '
        'gleichem Aufbau erstellt wird, ist noch zu bestätigen.>')
p_bsp = finde('Gerne mal ein Beispiel einhängen, wie die Notiz am Ende aussieht mit Maximalausprägung: ')
settext(p_bsp, 'Beispiel: Telefonnotiz mit Maximalausprägung (Platzhalter in <…>, KV-Wortlaut zu bestätigen):')
nach(p_bsp,
     klon(p_bsp, 'BÜ auf Makler Robotics'),
     klon(p_bsp, 'Maklername/MFA-Name: <OB726-Name>'),
     klon(p_bsp, 'Agenturnummer: <BUE_AGENTUR_NR> bzw. <AGT-Uebernehmer>'),
     klon(p_bsp, 'KNR Makler: <KNR-Uebernehmer> (TBD)'),
     klon(p_bsp, 'Laufende Nr. aus Vorgangsdatenbank: <Vorgang-Lfd-Nr>'),
     klon(p_bsp, 'Betroffene VNR: angegebene VNR beachten <Vorgang-VNR> (bei <BUE_UMFANG> = „Gesamt“: gesamte Kundenverbindung)'),
     klon(p_bsp, 'Bearbeitung nach: UV fehlt'),
     klon(p_bsp, 'Anforderung von Unterlagen: ja'),
     klon(p_bsp, '<Unterlagenart 1 aus BUE_ART_UNTERLAGEN>'),
     klon(p_bsp, '<Unterlagenart 2 aus BUE_ART_UNTERLAGEN>'))
p_hin_mfa = finde('Hinweis: Bei MFA entfällt die Untervollmacht (<BUE_UV_ERTEILT> = N/A); die Notiz erhält „mit BÜ“.')
nach(p_hin_mfa, klon(V_HINWEIS, 'Ergebnis in der Notiz: Zeile „Bearbeitung nach: mit BÜ“ (MFA und Standardfall Makler ohne '
                                'Pool-Sonderfall), „Bearbeitung nach: UV fehlt“ (Makler mit Pool, <BUE_UV_ERTEILT> = „nein“) '
                                'bzw. „Bearbeitung nach: BÜ mit UV“ (Makler mit <BUE_UV_ERTEILT> = „ja“).'))
p_zerlege = finde('Zerlege <BUE_ART_UNTERLAGEN> am Semikolon und führe die einzelnen Unterlagenarten im Notiztext auf')
nach(p_zerlege.getnext(), klon(V_HINWEIS, 'Ergebnis in der Notiz: Zeile „Anforderung von Unterlagen: ja“ und darunter je '
                                          'Unterlagenart aus <BUE_ART_UNTERLAGEN> eine eigene Zeile (siehe Beispiel links). '
                                          'Bei <BUE_ANF_UNTERLAGEN> = „nein“ entfallen diese Zeilen.'))
settext(finde('Notiz speichern.'), 'Telefonnotiz speichern.')
settext(finde('Vorgang mit der bestückten Notiz an den 72-Stunden-BOT weiterleiten.'),
        'Prozessende (<TBD Fachbereich und Robotics: genau eine Variante gilt – Variante A: den bestehenden Vorgang mit '
        'der Telefonnotiz an den 72-Stunden-BOT weiterleiten; Variante B: den bestehenden Vorgang ablegen und einen neuen '
        'Vorgang mit der Telefonnotiz für den 72-Stunden-BOT eröffnen>).')
settext(finde('Vorgang im Postkorb ablegen mit Status vollständig bearbeitet.'),
        'Ursprünglichen Vorgang im Postkorb ablegen bzw. als vollständig bearbeitet kennzeichnen (Reihenfolge je nach '
        'bestätigter Variante).')
settext(finde('Verarbeitung beenden'),
        'Verarbeitung beenden. Status Completed wird nur gesetzt, wenn Telefonnotiz und Weiterleitung bzw. Neueröffnung '
        'und Ablage erfolgreich ausgeführt wurden.')

# ============================================================ BE-Handling (Kommentare 130–132)
settext(start('Hinweis: Der Vorgang wird mit dem Bearbeitungshinweis an den Themenpostkorb „HSB4K MV“'),
        'Hinweis: Der Vorgang wird mit dem Bearbeitungshinweis an den Themenpostkorb „HSB4K MV“ (Postkorb-Nr. TBD) zur '
        'manuellen Bearbeitung weitergeleitet. Vorgänge ohne BE werden dunkel verarbeitet und laufen nicht in diesen '
        'Postkorb. Status im Reporting: Referred.')
p_bh = finde('Bearbeitungshinweis füllen')
vor(p_bh, klon(p_bh, '<BE> = „ja“ setzen'))
settext(finde('Vorgang an den Themenpostkorb „HSB4K MV“ weiterleiten'),
        'Vorgang an den Themenpostkorb „HSB4K MV“ (Postkorb-Nr. TBD) weiterleiten')
loesche(finde('VNR nicht ermittelbar'))
loesche(finde('Unterlagen nicht vollständig'))
nach(finde('VNR nicht korrekt / nicht vorhanden'),
     klon(V_LISTE, '<Klassifikation für nicht aktuelle Verträge – durch Fachbereich festzulegen>'))
vor(finde('Nachname abweichend'), klon(V_LISTE, 'Unterlagen nicht vollständig'))

# ============================================================ Ablaufdiagramm (beide Kopien)
lauf_ersetzen('Kein BÜ-Vorgang · BÜ-Wunsch fehlt · Reminder · VNR nicht ermittelbar · Makler: Unterlagen unvollständig · MFA: Betreuungswunsch nicht auf MFA, Unterschrift VN fehlt',
              'Kein BÜ-Vorgang · BÜ-Wunsch fehlt · Reminder · Unterschrift VN fehlt · MFA: Betreuungswunsch nicht auf MFA · Makler: unvollständige Unterlagen nur als Prüfnotiz', 2)
lauf_ersetzen('VA230 · IS100 · OB726 · GH040 · EOS', 'VA230 · IS100 mit Scout-Service (Name) · OB726 · GH040 · EOS', 2)
lauf_ersetzen('VNR-Prüfung VA230 (harte BE) · Name, Geburtsdatum, Adresse IS100 (Prüfnotizen)',
              'VNR und Vertragsstatus VA230 (BE) · Name über Scout-Service, Geburtsdatum, Adresse IS100 (Prüfnotizen)', 2)
lauf_ersetzen('Agentur / PNR OB726 · Anbindung GH040 · Stammagentur EOS · Bestandsinhaber',
              'Agentur / PNR OB726 · Status der Beschäftigung GH040 · Stammagentur EOS · Bestandsinhaber', 2)
lauf_ersetzen('Notiz BOT2011 bestücken, Weiterleitung an den 72-Stunden-BOT',
              'Telefonnotiz erstellen, Übergabe an den 72-Stunden-BOT (Weiterleitung oder Neueröffnung: TBD)', 2)
lauf_ersetzen('harte BE', 'BE', 4)
lauf_ersetzen('Harte BE: sofortiger Ausstieg in das BE-Handling. Weiche BE: Prüfnotiz in der Fehlerliste, die Prüfung läuft weiter; Test am Ende.',
              'BE: sofortiger Ausstieg in das BE-Handling. Prüfnotiz: Eintrag in der Fehlerliste, die Prüfung läuft weiter; Test am Ende.', 2)

# ============================================================ Pruefungen und Ausgabe
assert anker_ids() == anker_vorher, 'Kommentaranker verändert'
voll = '\n'.join(ptext(p) for p in alle())
for s in ('VNR nicht ermittelbar', 'harte BE', 'Weiche BE', 'weiche BE', 'harten Kriterien', 'weicher Prüfkriterien',
          '<GH040-Anbindung-Makler>', '<GH040-Anbindung-Inhaber>'):
    assert s not in voll, s
teile['word/document.xml'] = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
with zipfile.ZipFile(AUS, 'w', zipfile.ZIP_DEFLATED) as z:
    for n, b in teile.items(): z.writestr(n, b)
print('\n'.join(protokoll)); print('ok', AUS, '| Anker:', len(anker_vorher))
