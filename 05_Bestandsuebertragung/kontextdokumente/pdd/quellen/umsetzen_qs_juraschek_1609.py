# -*- coding: utf-8 -*-
"""QS-Review PDD Gesundheit/KV vom 16.09.2026 (T. Juraschek, M. Jeglorz) einarbeiten.

Aufruf: python3 umsetzen_qs_1609.py <PDD_mit_Kommentaren.docx> <Ausgabe.docx>

Grundsaetze: Alle Kommentare und Kommentaranker bleiben erhalten (settext ersetzt nur den
Text der Laeufe, loesche verschiebt Anker in den Vorgaenger-Absatz). Geaendert wird nur, was
durch die Kommentare vom 16.09.2026 bzw. die abgestimmten Anforderungen gedeckt ist. Fehlende
Angaben (GeVo-Nummer, BE-Klassifikation nicht aktueller Vertraege, OB726-Fehlermeldung,
Scout-Service-Aufruf) werden nicht erfunden, sondern als Platzhalter <...> gefuehrt bzw. in
der Offene-Punkte-Liste ausserhalb des Dokuments benannt."""
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
def start(prefix):
    tr = [p for p in alle() if ptext(p).startswith(prefix)]; assert len(tr) == 1, (prefix, len(tr)); return tr[0]
def hat_anker(p): return any(e.tag in ANKER for e in p.iter())
def anker_ids():
    return sorted((etree.QName(e).localname, e.get(W + 'id')) for e in doc.iter() if e.tag in ANKER)
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
def loesche(p):
    ziel = p.getprevious()
    while ziel is not None and ziel.tag != W + 'p': ziel = ziel.getprevious()
    if ziel is None:
        ziel = p.getnext()
        while ziel.tag != W + 'p': ziel = ziel.getnext()
    if hat_anker(p):
        for e in list(p):
            if e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd') or (e.tag == W + 'r' and e.find(W + 'commentReference') is not None):
                ziel.append(e)
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
def lauf_ersetzen(alt, neu, anzahl):
    """Ersetzt den Text einzelner Laeufe (fuer die Textfelder des Ablaufdiagramms, je Kopie einer)."""
    n = 0
    for r in doc.iter(W + 'r'):
        ts = r.findall(W + 't')
        if ts and ''.join(t.text or '' for t in ts) == alt:
            ts[0].text = neu; ts[0].set(XML + 'space', 'preserve')
            for t in ts[1:]: r.remove(t)
            n += 1
    assert n == anzahl, (alt, n); protokoll.append(f'Diagramm ({n}x): ' + neu[:80])

anker_vorher = anker_ids()

# Vorlagen fuer neue Absaetze (werden geklont, damit Formatvorlagen erhalten bleiben)
V_WENN = finde('WENN'); V_DANN = finde('DANN'); V_ENDE = finde('Ende WENN')
V_ZEILE = finde('<IS100-Nachname> = leer')                       # normale Bedingungszeile
V_ODER = finde('ODER <IS100-Nachname> <> <BUE_KUNDE_NACHNAME>')  # Folgezeile einer Bedingung
V_UND = finde('UND <BUE_ANF_UNTERLAGEN> = „nein“')
V_HINWEIS = start('Hinweis: Ist <BUE_KUNDE_VORNAME> bzw. <BUE_KUNDE_GEBDAT> leer')  # kursiver Hinweis
V_BE = finde('<BE-Klassifikation> = „VNR nicht korrekt / nicht vorhanden“')
V_WEITER_BE = finde('Weiter zum Kapitel „BE-Handling“', 0)
V_LISTE = finde('Nachname abweichend')

# ============================================================ Einleitung / Kurzbeschreibung
# Kommentare 64/88 (04.09.): Begriffe hart/weich entfernen – verbliebene Stellen in der Zielbeschreibung
settext(start('Der Prüf-Bot sammelt zunächst alle Prüfergebnisse ein'),
        'Der Prüf-Bot sammelt zunächst alle Prüfergebnisse ein, bewertet sie anschließend anhand der definierten '
        'Prüfkriterien (Business Exceptions und Prüfnotizen) und entscheidet erst danach über Ablehnung, Aussteuerung '
        'oder Weitergabe. Dadurch sinkt die Zahl der ausgesteuerten Geschäftsvorfälle gegenüber einer Prüfung mit '
        'sofortigem Abbruch beim ersten Fehler deutlich.')
settext(start('Vorgänge, die alle harten Kriterien erfüllen'),
        'Vorgänge ohne Business Exception werden mit einer vollständig bestückten Notiz (BOT2011) an den 72-Stunden-BOT '
        'übergeben, der die Weitergabe an den nachgelagerten BÜ-BOT steuert. Die Sachbearbeitung bearbeitet nur noch die '
        'fachlich begründeten Ausnahmen. Ablehnungen werden unmittelbar und ohne Liegezeit an den übernehmenden '
        'Vermittler kommuniziert.')
# Anforderung 4 (Unterlagen als Pruefnotiz) – Kurzbeschreibung konsistent halten
settext(start('Vorprüfung – Ausschlusskriterien: Klassifikation, BÜ-Wunsch, Reminder, Vollständigkeit der Unterlagen'),
        'Vorprüfung – Ausschlusskriterien: Klassifikation, BÜ-Wunsch, Reminder, Vorhandensein der Maklervollmacht und '
        'Übereinstimmung des Vollmachtgebers; unvollständige Unterlagen führen nicht zum Ausschluss, sondern zu einer '
        'Prüfnotiz in <Fehlerliste>. Erst wenn alle Kriterien erfüllt sind, laufen die fachlichen Prüfungen an. Dadurch '
        'entfallen die Hostzugriffe für Vorgänge, die ohnehin ausgesteuert werden.')
# Anforderungen 5/6 – Kurzbeschreibung Kapitel I
settext(start('I. VN – Stammdaten + VNR: VNR-Prüfung in VA230 sowie Namens-'),
        'I. VN – Stammdaten + VNR: VNR-Prüfung und Vertragsstatus in VA230, Namensprüfung über den Scout-Service '
        '(Nachname und Vorname getrennt) sowie Geburtsdatums- und Adressprüfung in IS100. Die Prüfungen laufen je '
        'Versicherungsscheinnummer des Vorgangs.')

# ============================================================ Verwendete Systeme
settext(start('Prüfung, ob der Vertrag zur VNR existiert. Auslesen von Vertragsstatus'),
        'Prüfung, ob der Vertrag zur VNR existiert. Auslesen von Vertragsstatus, Spartenkürzel und Agentur-Nr. (A…) des '
        'aktuellen Bestandsinhabers. Nicht aktuelle Verträge werden als Business Exception ausgesteuert.')
p_is100 = start('Auslesen und Abgleich der Stammdaten des Versicherungsnehmers: Nachname, Vorname')
settext(p_is100, 'Auslesen und Abgleich der Stammdaten des Versicherungsnehmers: Geburtsdatum, Straße, PLZ, Ort. Nachname '
                 'und Vorname werden über den Scout-Service getrennt bereitgestellt (siehe nächste Zeile).')
tr_is100 = p_is100.getparent().getparent(); assert tr_is100.tag == W + 'tr'
tr_scout = copy.deepcopy(tr_is100)
zellen = tr_scout.findall(W + 'tc'); assert len(zellen) == 2
for z, text in zip(zellen, ('Scout-Service (Namensauflösung zu IS100)',
                            'Aufruf durch den Bot in der Namensprüfung. Liefert zum Versicherungsnehmer des Vertrags Nachname '
                            'und Vorname getrennt; in IS100 stehen beide in einem gemeinsamen Namensfeld.')):
    ps = z.findall(W + 'p'); assert len(ps) == 1
    for e in list(ps[0]):
        if e.tag in ANKER or e.tag == W + 'proofErr': ps[0].remove(e)
    neue_para_id(ps[0]); settext(ps[0], text)
tr_is100.addnext(tr_scout); protokoll.append('Tabellenzeile Scout-Service eingefügt')
settext(start('Prüfung des Anbindungsstatus (aktiv / inaktiv) des übernehmenden Vermittlers'),
        'Prüfung des Anbindungsstatus des übernehmenden Vermittlers und des bisherigen Bestandsinhabers über die Zeile '
        '„Status der Beschäftigung“ (aktiv / inaktiv).')

# ============================================================ Design
settext(start('Die Prüfschritte in VA230, IS100, OB726, GH040 und EOS sind lesend.'),
        'Die Prüfschritte in VA230, IS100 einschließlich Scout-Service, OB726, GH040 und EOS sind lesend. Schreibende '
        'Schritte sind die Notizbestückung sowie die Weiterleitung bzw. Ablage am Prozessende; ein Wiederanlauf ist '
        'zulässig, solange diese noch nicht erfolgt sind.')

# ============================================================ Tabelle der genutzten Variablen
settext(start('Feld_Format CH. Der Datenpool liefert „Straße“ grundsätzlich als „Str.“'),
        'Feld_Format CH. Der Datenpool liefert „Straße“ grundsätzlich als „Str.“; der Vergleich mit IS100 erfolgt '
        'zweistufig (Originalwerte, danach normalisierte Straßenbezeichnung), siehe Schritt „Adressprüfung“.')
settext(start('Feld_Format CH. 7 bis 9 Ziffern nach der Bereinigung'),
        'Feld_Format CH. Wird von EMMA ohne das Präfix „A“ und ohne Kommata oder sonstige Trennzeichen geliefert (nur '
        'Ziffern). 7 bis 9 Ziffern nach der Bereinigung; achtstellige Werte sind die neuen Agenturen nach ZAV. Der Bot '
        'verwendet diesen bereinigten Zahlenwert für den Einstieg in OB726.')
settext(start('Feld_Format CH. Ausprägungen: Einzel (Übertragung der genannten Versicherungsnummer)'),
        'Feld_Format CH. Ausprägungen: Einzel (Übertragung der genannten Versicherungsnummer), Gesamt (Übertragung der '
        'gesamten Kundenverbindung). Nennt der Auftrag mehrere Versicherungsnummern, eröffnet Celonis je Nummer einen '
        'eigenen Vorgang; jeder trägt „Einzel“, bei zusätzlicher Nennung der gesamten Kundenverbindung „Gesamt“. Jeder '
        'Vorgang wird eigenständig mit seiner <Vorgang-VNR> geprüft. Der Wert wird in der Notiz im Abschnitt „Betroffene '
        'VNR“ übernommen. Für „Gesamt“ ist die weitere Verarbeitung noch nicht abschließend festgelegt: Kann die gesamte '
        'Kundenverbindung nicht automatisiert verarbeitet werden, ist für die einzeln geprüfte <Vorgang-VNR> eine '
        'gesonderte manuelle Bearbeitung oder eine Business Exception erforderlich; die Klassifikation dafür ist noch '
        'festzulegen.')
settext(start('Feld_Format CH. Ausprägungen: leer, „Reminder - keine Vollst.-Prüfung“'),
        'Feld_Format CH. Ausprägungen: leer, „Reminder - keine Vollst.-Prüfung“, „Vollständig“, „BÜ-Wunsch fehlt“, „MV '
        'fehlt“, „MV unvollständig“, „VN-Unterschrift fehlt“. Mehrere Mängel kommagetrennt. Das Feld fasst die Bewertung '
        'der Vollmachtsfelder zusammen und wird nur im Makler-Zweig geprüft; bei MFA ist es nicht belegt. Ein anderer '
        'Wert als „Vollständig“ führt nicht zu einer sofortigen Business Exception, sondern zur Prüfnotiz „Unterlagen '
        'nicht vollständig“ in <Fehlerliste>; die weiteren Prüfungen laufen weiter.')
settext(finde('Feld_Format JN. Ausprägungen: ja, nein. Bei „ja“ entsteht keine BE; die Unterlagen werden über die Notiz angefordert.'),
        'Feld_Format JN. Ausprägungen: ja, nein. Bei „ja“ entsteht weder eine BE noch eine Prüfnotiz; die Unterlagen '
        'werden über die Notiz angefordert.')
settext(finde('Nur der Status „aktuell“ führt zur Weiterverarbeitung; sonst „Storno“.'),
        'Nur der Status „aktuell“ führt zur Weiterverarbeitung; jeder andere Status führt zur Business Exception '
        '(Klassifikation noch festzulegen, siehe Schritt „VNR-Prüfung“).')
settext(start('Wird nachrichtlich mitgeführt; die Notizvorlage (KV: BOT2011)'),
        'Wird nachrichtlich mitgeführt und hat keine Auswirkung auf den Prozessablauf; die Notizvorlage (KV: BOT2011) '
        'ist durch den Postkorb des KV-Prüf-Bots vorgegeben.')
settext(finde('IS100, Schritt „IS100 aufrufen und Stammdaten auslesen“, gelb markiertes Feld Nr. 1'),
        'Scout-Service zu IS100 (liefert den Nachnamen getrennt), Schritt „Namensprüfung“')
settext(finde('IS100, gelb markiertes Feld Nr. 2'),
        'Scout-Service zu IS100 (liefert den Vornamen getrennt), Schritt „Namensprüfung“')
settext(finde('Abgleich gegen BUE_KUNDE_STRASSE; Abweichung als Prüfnotiz in <Fehlerliste>.'),
        'Abgleich gegen BUE_KUNDE_STRASSE in zwei Stufen (Originalwerte, danach normalisierte Straßenbezeichnung); '
        'Abweichung als Prüfnotiz in <Fehlerliste>.')
settext(finde('Pflichtfeld der Notiz (Feld Personalnummer bzw. KNR Makler).'),
        'Pflichtfeld der Notiz (Feld Personalnummer bzw. KNR Makler). Nur Ziffern ohne Präfix „P“ und ohne Trennzeichen; '
        'führende Nullen bleiben erhalten.')
settext(finde('GH040, Schritt „Anbindung des übernehmenden Vermittlers prüfen“'),
        'GH040, Zeile „Status der Beschäftigung“, Schritt „Anbindung des übernehmenden Vermittlers prüfen“')
settext(finde('GH040, Schritt „Anbindung des Bestandsinhabers prüfen“'),
        'GH040, Zeile „Status der Beschäftigung“, Schritt „Anbindung des Bestandsinhabers prüfen“')

# ============================================================ 1. Schritt: Start
settext(finde('Postkorbvorgang öffnen.'),
        'Postkorbvorgang im EWMS-Postkorb (Themenpostkorb Prüf-Bot Gesundheit) öffnen.')
settext(finde('Datenpool mit <Vorgang-Lfd-Nr> öffnen.'),
        'Wechsel vom EWMS-Postkorb in den Datenpool: Datensatz zum Postkorbvorgang mit <Vorgang-Lfd-Nr> öffnen.')
FELDER = ['BUE_VERMITTLER_TYP', 'BUE_KUNDE_NACHNAME', 'BUE_KUNDE_VORNAME', 'BUE_KUNDE_GEBDAT', 'BUE_KUNDE_STRASSE',
          'BUE_KUNDE_PLZ', 'BUE_KUNDE_ORT', 'BUE_VNR', 'BUE_VNR_2', 'BUE_SPARTE', 'BUE_MV_VN_NACHNAME',
          'BUE_MV_VN_VORNAME', 'BUE_POOL', 'BUE_VERMITTLER_NAME', 'BUE_AGENTUR_NR', 'BUE_VERMITTLER_NR',
          'BUE_MAKLER_EMAIL', 'BUE_MAKLER_STRASSE', 'BUE_MAKLER_PLZ', 'BUE_MAKLER_ORT', 'BUE_KLASSIFIKATION',
          'BUE_WUNSCH_VORHANDEN', 'BUE_UMFANG', 'BUE_PRUEFUNG_UNTERLAGEN', 'BUE_REMINDER', 'BUE_MV_ENTHALTEN',
          'BUE_MV_STATUS', 'BUE_MV_AUF_MAKLER', 'BUE_MV_VOLLUMFAENGLICH', 'BUE_MV_UNTERSCHRIFT_KUNDE', 'BUE_UV_ERTEILT',
          'BUE_MV_UNTERSCHRIFTSDATUM', 'BUE_MV_EINGANGSDATUM', 'BUE_ANF_UNTERLAGEN', 'BUE_ART_UNTERLAGEN']
assert len(FELDER) == 35
for f in FELDER: assert any(ptext(p) == f for p in alle()), f   # jedes Feld steht in der Variablentabelle
settext(finde('Lese alle in der Tabelle der genutzten Variablen aufgeführten Felder <BUE_…> aus und speichere sie unter dem dort genannten Namen.'),
        'Lese die folgenden 35 Felder des Datenpools aus und speichere jedes unter dem gleichnamigen Variablennamen '
        '(vollständige Liste mit Format und Pflichtfeldkennzeichen im Kapitel „Tabelle der genutzten Variablen“, '
        'Herkunft „Datenpool“):\n' + ', '.join('<%s>' % f for f in FELDER) + '.')
settext(start('Hinweis: Eine Spartenweiche innerhalb des Prozesses ist deshalb nicht erforderlich.'),
        'Hinweis: Eine Spartenweiche innerhalb des Prozesses ist deshalb nicht erforderlich. Die Sparte wird dennoch aus '
        'VA230 gelesen und nachrichtlich mitgeführt; der Vertragsstatus wird in der VNR-Prüfung ausgewertet, nicht '
        'aktuelle Verträge werden als Business Exception ausgesteuert.')

# ============================================================ 2. Schritt: Vorpruefung
# Kommentare 67/68: Pruefung <BUE_VNR> = „Manuelle Prüfung VNR/Sparte“ entfaellt (Anker wandern auf den Vorgaenger)
bed = finde('<BUE_VNR> = „Manuelle Prüfung VNR/Sparte“')
wenn = bed.getprevious(); assert ptext(wenn) == 'WENN'
block = [wenn, bed]
e = bed.getnext()
while ptext(e) != 'Ende WENN': block.append(e); e = e.getnext()
block.append(e)
assert [ptext(x) for x in block] == ['WENN', '<BUE_VNR> = „Manuelle Prüfung VNR/Sparte“', 'DANN',
                                     '<BE-Klassifikation> = „VNR nicht ermittelbar“', 'Weiter zum Kapitel „BE-Handling“', 'Ende WENN']
for x in reversed(block): loesche(x)
# Anforderung 4: unvollstaendige Unterlagen als Pruefnotiz statt sofortiger BE, nur im Makler-Zweig
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
        'Hinweis: Unvollständige Unterlagen (<BUE_PRUEFUNG_UNTERLAGEN> <> „Vollständig“) sind kein Ausschlusskriterium: '
        'Der Bot merkt die Prüfnotiz „Unterlagen nicht vollständig“ in <Fehlerliste>, die weiteren Host- und '
        'Einzelprüfungen laufen weiter. Erst der Test auf Fehlerliste nach allen Einzelprüfungen führt bei gefüllter '
        '<Fehlerliste> zur BE „Nachprüfung erforderlich“ und in das zentrale BE-Handling. Sind Unterlagen unvollständig, '
        'aber <BUE_ANF_UNTERLAGEN> = „ja“, entsteht weder eine Prüfnotiz noch eine BE; die fehlenden Unterlagen werden '
        'am Prozessende über die Notiz angefordert.')
# Anforderung 3: BUE_UMFANG
settext(start('Hinweis: <BUE_UMFANG> hat die Ausprägungen „Einzel“ und „Gesamt“'),
        'Hinweis: <BUE_UMFANG> hat die Ausprägungen „Einzel“ und „Gesamt“; beide werden vollständig verarbeitet und in '
        'der Notiz unter „Betroffene VNR“ übernommen. Nennt der Auftrag mehrere Versicherungsnummern, eröffnet Celonis '
        'je Nummer einen eigenen Postkorbvorgang mit derselben E-Mail und einer eigenen führenden VNR; jeder dieser '
        'Vorgänge durchläuft den Prüf-Bot eigenständig mit seiner eigenen <Vorgang-VNR>. Für „Gesamt“ ist die weitere '
        'Verarbeitung noch nicht abschließend festgelegt: Kann die gesamte Kundenverbindung nicht automatisiert '
        'verarbeitet werden, ist für die einzeln geprüfte <Vorgang-VNR> eine gesonderte manuelle Bearbeitung oder eine '
        'Business Exception erforderlich; die Klassifikation dafür ist noch festzulegen.')

# ============================================================ 3. Schritt: VA230 (Kommentare 82, 83)
lese_status = finde('Lese das gelb markierte Feld „Status“ aus und speichere als <VA230-Status>.')
nach(lese_status,
     klon(V_WENN), klon(V_ZEILE, '<VA230-Status> <> „aktuell“'), klon(V_DANN),
     klon(V_BE, '<BE-Klassifikation> = „<Klassifikation für nicht aktuelle Verträge – durch Fachbereich festzulegen>“'),
     klon(V_WEITER_BE), klon(V_ENDE))
settext(start('<VA230-Sparte> und <VA230-Status> werden nachrichtlich mitgeführt'),
        '<VA230-Sparte> wird nur nachrichtlich mitgeführt und hat keine Auswirkung auf den Prozessablauf: Die Sparte ist '
        'durch den Postkorb Gesundheit vorgegeben, die Notizvorlage BOT2011 damit festgelegt. <VA230-Status> steuert die '
        'Aussteuerung: Nur ein Vertrag mit Status „aktuell“ wird weiterverarbeitet; jeder andere Status (nicht aktueller '
        'bzw. historischer Vertrag) führt zur Business Exception (siehe oben).')

# ============================================================ 4. Schritt: IS100 / Scout-Service (Kommentare 85, 90)
oeffne_is100 = finde('IS100 mit <Vorgang-VNR> öffnen.')
lese_nn = oeffne_is100.getnext(); assert ptext(lese_nn) == 'Lese das gelb markierte Feld aus und speichere als <IS100-Nachname>.'
nach(oeffne_is100, klon(V_ZEILE, 'Scout-Service zu IS100 aufrufen: Er liefert den Namen des in IS100 angezeigten '
                                 'Versicherungsnehmers getrennt nach Nachname und Vorname.'))
settext(lese_nn, 'Nachname aus dem Ergebnis des Scout-Service übernehmen und speichere als <IS100-Nachname>.')
nach(lese_nn, klon(V_HINWEIS, 'Hinweis: Nachname und Vorname werden nicht direkt aus dem Namensfeld in IS100 gelesen '
                              '(dort stehen beide Werte in einem Feld, im Screenshot gelb markiert), sondern über den '
                              'Scout-Service getrennt bereitgestellt. Die weiteren Stammdaten (Geburtsdatum, Straße, PLZ) '
                              'werden weiterhin direkt in IS100 gelesen.'))
settext(finde('Lese das gelb markierte Feld aus und speichere als <IS100-Vorname>.'),
        'Vorname aus dem Ergebnis des Scout-Service übernehmen und speichere als <IS100-Vorname>.')

# ============================================================ 6. Schritt: Adresse (Kommentar 93)
bed_s = finde('<IS100-Strasse> <> <BUE_KUNDE_STRASSE>')
dann_s = bed_s.getnext(); assert ptext(dann_s) == 'DANN'
merke_s = dann_s.getnext(); assert ptext(merke_s) == 'Merke Prüfnotiz „Straße abweichend“ in <Fehlerliste>'
nach(dann_s, klon(V_ZEILE, 'Normalisiere <IS100-Strasse> und <BUE_KUNDE_STRASSE> (siehe unten) und vergleiche erneut:'),
     klon(V_WENN), klon(V_ZEILE, '<IS100-Strasse> <> <BUE_KUNDE_STRASSE> auch nach der Normalisierung'), klon(V_DANN))
nach(merke_s, klon(V_ENDE))
settext(finde('Format: „Straße / Str. / etc. (z. B. Weg)“.'),
        'Normalisierung vor dem zweiten Vergleich: Zuerst werden die Originalwerte verglichen. Nur bei Abweichung werden '
        'beide Werte vereinheitlicht und erneut verglichen: Die Straßenbezeichnungen „Straße“ und „Strasse“ werden – '
        'auch als Wortbestandteil, z. B. „Bahnhofstraße“ – durch „Str.“ ersetzt (der Datenpool liefert „Straße“ '
        'grundsätzlich als „Str.“); Leerzeichen am Anfang und am Ende sowie doppelte Leerzeichen werden entfernt. Alle '
        'übrigen Bestandteile bleiben unverändert, insbesondere die Hausnummer und andere Bezeichnungen wie „Weg“. Erst '
        'wenn die normalisierten Werte weiterhin abweichen, wird die Prüfnotiz „Straße abweichend“ gemerkt.')

# ============================================================ 7. Schritt: OB726 Agenturnummer (Kommentar 96)
bed_a = finde('Agentur zu <BUE_AGENTUR_NR> nicht vorhanden')
settext(bed_a, 'Agentur zu <BUE_AGENTUR_NR> nicht vorhanden: OB726 zeigt nach dem Einstieg keine Agenturdaten an bzw. '
               'gibt die Fehlermeldung „<Text der OB726-Fehlermeldung – durch Robotics zu ergänzen>“ aus')
nach(bed_a, klon(V_ODER, 'ODER der in OB726 angezeigte Ordnungsbegriff (im Screenshot gelb markiert, Format „A,…“) '
                         'enthält <BUE_AGENTUR_NR> nicht'))
settext(finde('Format: 7-9 stellige Zahlen.'),
        'Format: 7-9 stellige Zahlen. <BUE_AGENTUR_NR> wird von EMMA ohne das Präfix „A“ und ohne Kommata oder sonstige '
        'Trennzeichen geliefert; der Bot verwendet diesen bereinigten Zahlenwert für den Einstieg in OB726.')

# ============================================================ 8. Schritt: PNR (Kommentar 97) und GH040 (Kommentar 98)
settext(finde('Lese das gelb markierte Feld aus und speichere als <OB726-PNR>.'),
        'Lese das gelb markierte Feld aus. Übernimm nur den Zahlenanteil ohne das Präfix „P“ und ohne Komma oder '
        'sonstige Trennzeichen (führende Nullen bleiben erhalten) und speichere ihn als <OB726-PNR>.')
for i in (0, 1):
    settext(finde('Format: < 7 stellige Zahlen (neue PNR = 7 stellig).', 0, anzahl=2 - i),
            'Format: nur Ziffern; bisherige PNR weniger als 7 Stellen, neue PNR 7-stellig. Führende Nullen bleiben erhalten.')
for i in (0, 1):
    settext(finde('GH040 mit <OB726-PNR> öffnen.', 0, anzahl=2 - i),
            'Wechsel von OB726 nach GH040: GH040 mit dem bereinigten <OB726-PNR> öffnen.')
    settext(finde('Lese das gelb markierte Feld aus und speichere als <GH040-Anbindung-Makler>.', 0, anzahl=2 - i),
            'Suche die Zeile „Status der Beschäftigung“ und lese den Wert dieser Zeile (gelb markiert) aus; speichere '
            'ihn als <GH040-Anbindung-Makler>.')
    settext(finde('Screenshot: GH040, Anbindungsstatus', 0, anzahl=2 - i), 'Screenshot: GH040, Zeile „Status der Beschäftigung“')
# 9. Schritt: Bestandsinhaber
settext(finde('GH040 mit <VA230-AGT-Inhaber> öffnen.'), 'Wechsel von VA230 nach GH040: GH040 mit <VA230-AGT-Inhaber> öffnen.')
settext(finde('Lese das gelb markierte Feld aus und speichere als <GH040-Anbindung-Inhaber>.'),
        'Suche die Zeile „Status der Beschäftigung“ und lese den Wert dieser Zeile (gelb markiert) aus; speichere ihn als '
        '<GH040-Anbindung-Inhaber>.')
settext(finde('Screenshot: GH040, Anbindungsstatus des Bestandsinhabers'),
        'Screenshot: GH040, Zeile „Status der Beschäftigung“ des Bestandsinhabers')

# ============================================================ BE-Handling: Wertelisten
loesche(finde('VNR nicht ermittelbar'))
loesche(finde('Unterlagen nicht vollständig'))
nach(finde('VNR nicht korrekt / nicht vorhanden'),
     klon(V_LISTE, '<Klassifikation für nicht aktuelle Verträge – durch Fachbereich festzulegen>'))
vor(finde('Nachname abweichend'), klon(V_LISTE, 'Unterlagen nicht vollständig'))

# ============================================================ Ablaufdiagramm (beide Kopien des Textfelds)
lauf_ersetzen('Kein BÜ-Vorgang · BÜ-Wunsch fehlt · Reminder · VNR nicht ermittelbar · Makler: Unterlagen unvollständig · MFA: Betreuungswunsch nicht auf MFA, Unterschrift VN fehlt',
              'Kein BÜ-Vorgang · BÜ-Wunsch fehlt · Reminder · Unterschrift VN fehlt · MFA: Betreuungswunsch nicht auf MFA · Makler: unvollständige Unterlagen nur als Prüfnotiz', 2)
lauf_ersetzen('VA230 · IS100 · OB726 · GH040 · EOS', 'VA230 · IS100 mit Scout-Service (Name) · OB726 · GH040 · EOS', 2)
lauf_ersetzen('VNR-Prüfung VA230 (harte BE) · Name, Geburtsdatum, Adresse IS100 (Prüfnotizen)',
              'VNR und Vertragsstatus VA230 (BE) · Name über Scout-Service, Geburtsdatum, Adresse IS100 (Prüfnotizen)', 2)
lauf_ersetzen('Agentur / PNR OB726 · Anbindung GH040 · Stammagentur EOS · Bestandsinhaber',
              'Agentur / PNR OB726 · Status der Beschäftigung GH040 · Stammagentur EOS · Bestandsinhaber', 2)
lauf_ersetzen('harte BE', 'BE', 4)
lauf_ersetzen('Harte BE: sofortiger Ausstieg in das BE-Handling. Weiche BE: Prüfnotiz in der Fehlerliste, die Prüfung läuft weiter; Test am Ende.',
              'BE: sofortiger Ausstieg in das BE-Handling. Prüfnotiz: Eintrag in der Fehlerliste, die Prüfung läuft weiter; Test am Ende.', 2)

# ============================================================ Pruefungen und Ausgabe
assert anker_ids() == anker_vorher, 'Kommentaranker verändert'
voll = '\n'.join(ptext(p) for p in alle())
for s in ('VNR nicht ermittelbar', 'harte BE', 'Weiche BE', 'weiche BE', 'harten Kriterien', 'weicher Prüfkriterien'):
    assert s not in voll, s
teile['word/document.xml'] = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
with zipfile.ZipFile(AUS, 'w', zipfile.ZIP_DEFLATED) as z:
    for n, b in teile.items(): z.writestr(n, b)
print('\n'.join(protokoll)); print('ok', AUS, '| Anker:', len(anker_vorher))
