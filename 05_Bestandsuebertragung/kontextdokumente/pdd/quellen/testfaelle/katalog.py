# -*- coding: utf-8 -*-
"""Testfallkatalog Pruef-Bot Vorpruefung BUE (Grundlage PDD v11, 25.09.2026) – Fassung 2 mit minimalem Testdatensatz.
Eine Datenquelle fuer Excel (testfaelle_xlsx_build.py) und PowerPoint (testfaelle_ppt_build.py).
Leitidee: Der Pruef-Bot greift nur lesend auf den Host zu. Ein vorbereiteter Vertrag (VNR) mit einer vorbereiteten Agentur traegt deshalb
beliebig viele Testfaelle; die Faelle unterscheiden sich ueber Mail und Maklervollmacht (Celonis liest sie unterschiedlich aus) oder ueber
den Datensatz (Weg B). Nur was im Host stehen muss, braucht eine eigene VNR oder Agentur."""

STAND = '28.09.2026'
GRUNDLAGE = 'PDD Vorprüfung BÜ v11 (Gesundheit/KV und Komposit/Leben, 25.09.2026)'

PK_72 = '„HSB4 K 72 - Erstinformation“'
PK_MV = '„HSB4 K MV Gesundheit Posteingang“'
PK_KO = '„HSB4 K KO Komposit / Leben Posteingang“'
PK_ODPP = '„ODPP1 D - Ma/Ma Bestandsübertragungen“'
PK_START = '„MV 23724 BÜ Prüf BOT“'

BE_LISTE = ['Keine Bestandsübertragung möglich: Courtagefortzahler', 'Keine Bestandsübertragung möglich: Kontaktgeber',
            'Agenturnummer nicht vorhanden', 'BÜ-Wunsch nicht vorhanden', 'Betreuungswunsch nicht auf MFA ausgestellt', 'Unterschrift VN fehlt',
            'Vertrag zur VNR nicht gefunden', 'Kunde in IS011 nicht gefunden', 'Kunde ist nicht Versicherungsnehmer', 'Vertrag gehört nicht zum Kunden',
            'Agenturnummer in OB726 unbekannt', 'Keine Zusammenarbeit', 'Vertrag nicht aktuell', 'KR Flottenvertrag', 'Nachprüfung erforderlich']
NOTIZ_LISTE = ['Unterlagen nicht vollständig', 'Geburtsdatum abweichend', 'Bestandsinhaber nicht ermittelbar', 'Anbindung Bestandsinhaber nicht aktiv',
               'Vermittlertyp abweichend', 'E-Mail-Adresse des Vermittlers fehlt', 'Absender ist eine interne ERGO-Adresse']
MERKMALE = ['Notiz BOT2011 (KV)', 'Notiz 1515 (Komposit/Leben)', 'Bearbeitung nach: Mit BÜ-Wunsch', 'Bearbeitung nach: Untervollmacht fehlt',
            'Folgearbeit für Komposit gesetzt', 'Umfang Gesamt', 'E-Mail aus Sonderliste TOP-Makler', 'E-Mail aus OB729', 'E-Mail = Absender',
            'PNR aufgefüllt auf 7 Stellen', 'Weitere VNR nachrichtlich in der Notiz', 'Routing HSB4 K 72',
            'Routing HSB4 K MV', 'Routing HSB4 K KO', 'Routing ODPP1 D', 'Vermittlertyp MFA',
            'Juristische Person ohne Geburtsdatum', 'Mehrfachtreffer in IS011', 'Zweite Matchcodesuche ohne Geburtsdatum', 'Kein Datensatz im Datenpool',
            'Keine Doppelverarbeitung', 'System Exception bei unerwarteter Maske']

GRUPPEN = [
 ('GL', 'Glattfälle (Gegenprobe ohne Befund)', 'je zwei für KV und Non-KV: Notiz BOT2011 bzw. 1515, Pool, Mehrfachagent, Folgearbeit'),
 ('VP', 'Vorprüfung – KI-Deckblatt', 'je Ausschlusskriterium ein Fall, vor jedem Hostzugriff'),
 ('KU', 'I. Kunde (VN) – IS011', 'je harte BE ein Fall, dazu Mehrfachtreffer'),
 ('VM', 'III. Übernehmender Vermittler', 'Agentur unbekannt, keine Zusammenarbeit (zwei Auslöser)'),
 ('VT', 'IV. Vertrag', 'Vertrag nicht aktuell, KR-Flottenvertrag'),
 ('BH', 'V. Fehlerliste – Sammeltests', 'alle sieben Prüfnotizen in zwei Vorgängen, BE „Nachprüfung erforderlich“'),
 ('TE', 'Technik und Betrieb', 'Startkriterium, Doppelverarbeitung, System Exception'),
]

# ------------------------------------------------------------------ Testdaten: Vertraege (VNR) und Kunden
# (ID, Pflicht, Sparte, Kunde, Bezeichnung, Anforderungen im Host (Liste), Bereitstellung)
VERTRAEGE = [
 ('V-01', True, 'KV', 'K-01', 'KV aktiv, Bestandsinhaber AO',
  ['Krankenversicherung, VA230-Status „aktuell“',
   'VN (K-01): natürliche Person mit Geburtsdatum und vollständiger Anschrift, genau ein Partnereintrag in IS011',
   'Bestandsinhaber (VA230 „Betreuung“): AO-Vertreter, OB726-Vertriebskanal AO (z. B. 2111), GH040 aktiv'],
  'PTU-Abzug über die OE-Nr. des Bestandsinhabers; V-02 (gleicher Kunde) mitnehmen. Anonymisierte Namen, Anschrift und Geburtsdatum in IS011 ablesen.'),
 ('V-02', True, 'KL', 'K-01', 'Komposit nicht aktuell',
  ['Komposit-Vertrag desselben Kunden K-01', 'VA230-Status ungleich „aktuell“ (z. B. storniert oder ruhend)', 'Bestandsinhaber AO'],
  'im selben PTU-Abzug wie V-01'),
 ('V-03', True, 'KL', 'K-02', 'Komposit aktiv, Bestandsinhaber Makler',
  ['Komposit-Vertrag eines anderen Kunden K-02 ohne Bezug zu V-01', 'K-02: natürliche Person mit Geburtsdatum, ein Partnereintrag', 'Status „aktuell“',
   'Bestandsinhaber: Makler bzw. Kooperationspartner, OB726-Vertriebskanal aus 2200, 2215, 2271, 2281, 2300, 2301, 2302, 2400 (z. B. 2301 EMV-Agentur)',
   'Bestandsinhaber in GH040 aktiv'],
  'PTU-Abzug über die OE-Nr. des Makler-Bestandsinhabers'),
 ('V-04', True, 'KL', 'K-03', 'KR normal, Firmenkunde',
  ['KR-Vertrag einer Firma K-03: juristische Person, kein Geburtsdatum, ein Partnereintrag', 'VA230/VAF230 „Sparte/Vers.Art“ = „KFZ / KR / …“',
   'Status „aktuell“', 'Bestandsinhaber AO, GH040 aktiv'],
  'PTU-Abzug; mit K. Rypa auswählen'),
 ('V-05', True, 'KL', 'K-03', 'KR-Flottenvertrag (FK)',
  ['Flottenvertrag, möglichst derselben Firma K-03', '„Sparte/Vers.Art“ = „KFZ / FK / …“', 'Status „aktuell“', 'Bestandsinhaber AO'],
  'PTU-Abzug; Flotte mit K. Rypa auswählen'),
 ('V-06', True, 'KV', 'K-04', 'Direktbestand ohne Bestandsinhaber',
  ['Vertrag (KV bevorzugt), Status „aktuell“', 'Feld „Betreuung“ in VA230 leer', 'Kunde: natürliche Person mit Geburtsdatum'],
  'mit dem Fachbereich suchen; gibt es keinen, Vertrag in IMSI anpassen lassen (Robotics / Testdatenmanagement)'),
 ('V-07', True, 'KV', 'K-05', 'Bestandsinhaber ausgeschieden',
  ['KV-Vertrag, Status „aktuell“', 'Bestandsinhaber existiert in OB726', 'GH040 „Status der Beschäftigung“ ungleich „aktiv“ (verwaister Bestand)',
   'Kunde mit Geburtsdatum'],
  'PTU-Abzug; verwaiste Bestände sind in der Produktion häufig'),
 ('V-08', True, 'KV', 'K-06', 'KV, versicherte Person ist nicht der VN',
  ['KV-Vertrag, Status „aktuell“', 'VN und versicherte Person sind verschiedene Personen (häufig: Kind über ein Elternteil versichert)',
   'die versicherte Person hat einen eigenen Partnereintrag in IS011'],
  'PTU-Abzug; solche Verträge sind in KV häufig'),
 ('V-09', False, 'KV', 'K-07', 'Kunde mit häufigem Namen',
  ['KV-Vertrag, Status „aktuell“', 'Matchcodesuche mit den Daten des VN liefert eine Trefferliste über mehr als eine Seite',
   'VN steht erst auf der Folgeseite (PF2)'], 'mit Robotics suchen'),
]
# ------------------------------------------------------------------ Testdaten: uebernehmende Vermittler (Agenturen) mit EMMA-Eintrag
# (ID, Pflicht, Bezeichnung, Anforderungen im Host (Liste), EMMA-Abzug der Abnahme)
AGENTUREN = [
 ('A-01', True, 'Makler, Standard',
  ['OB726: Agentur-Nr. vorhanden, Kopfzeile Klassifizierung „Makler …“', 'OB726 „Name 1“ ohne „INAKTIV“, PNR 7-stellig', 'GH040 „aktiv“',
   'OB729 mit externer E-Mail-Adresse (nicht @ergo)', 'nicht in der Sonderliste TOP-Makler'], 'Typ „Makler“, PNR wie OB726'),
 ('A-02', True, 'Makler ohne E-Mail in OB729',
  ['wie A-01', 'in OB729 keine E-Mail-Adresse hinterlegt', 'möglichst alte PNR mit weniger als 7 Stellen (für TF-GL-04)'], 'Typ „Makler“'),
 ('A-03', True, 'TOP-Makler aus der Sonderliste',
  ['Agentur-Nr. aus der Sonderliste TOP-Makler (Stand 23.09.2026), z. B. 008982800 VEMA oder 008903235 Jung, DMS & Cie', 'in OB726 vorhanden', 'GH040 aktiv'],
  'Typ „Makler“'),
 ('A-04', True, 'Mehrfachagent',
  ['OB726 Kopfzeile Klassifizierung „Mehrfachagent“', 'GH040 aktiv', 'OB729 mit externer Adresse'], 'Typ „MFA“'),
 ('A-05', True, 'Courtagefortzahler bzw. Kontaktgeber (EMMA-Typ wird umgestellt)',
  ['beliebige Agentur-Nr. aus der Testumgebung',
   'Hoststand gleichgültig: Der Bot endet in der Vorprüfung ohne Hostzugriff',
   'eigene Nummer, damit A-01 für parallele Tests „Makler“ bleibt (nacheinander genügt A-01)'],
  'TF-VP-01: Typ „Courtagefortzahler“; vor TF-VP-02 auf „Kontaktgeber“ umstellen, danach zurücksetzen (mit Celonis abstimmen)'),
 ('A-06', True, 'Makler mit „INAKTIV“ im Namen', ['OB726 „Name 1“ enthält „INAKTIV“'], 'Typ „Makler“'),
 ('A-07', False, 'Makler, in GH040 nicht aktiv', ['OB726 ohne „INAKTIV“ im Namen', 'GH040 „Status der Beschäftigung“ ungleich „aktiv“'], 'Typ „Makler“'),
]
ABSENDER = [
 ('P-01', 'Makler-Testpostfach', 'externe Adresse, von der die Maklermails kommen (Firmenname und Signatur des gewählten Maklers A-xx)'),
 ('P-02', 'Pool-Testpostfach', 'externe Adresse eines Pools für die Poolfälle'),
 ('P-03', 'internes ERGO-Postfach', '@ergo-Adresse, über die eine Maklermail weitergeleitet wird'),
 ('P-04', 'unbekannter Absender', 'Adresse, zu der Celonis im EMMA-Abzug keinen Vermittler findet'),
]

# ------------------------------------------------------------------ Mail-Vorlagen (vollstaendig ausformuliert)
MV_STANDARD = [
 'Vor- und Nachname des Versicherungsnehmers exakt wie in IS011 (IMSI-Stand nach PTU-Abzug)',
 'Anschrift (Straße, PLZ, Ort) und Geburtsdatum des VN wie in IS011',
 'Versicherungsnummer(n) des Vertrags oder „alle Verträge“',
 'Vollmachtnehmer: Firmenname des übernehmenden Maklers wie OB726 „Name 1“',
 'Umfang: Betreuung und Verwaltung, vollumfänglich',
 'Ort und Datum der Unterschrift',
 'handschriftliche Unterschrift des Versicherungsnehmers',
]
BW_MFA = ['Betreuungswunsch des Kunden, ausgestellt auf den Mehrfachagenten (Name wie OB726 „Name 1“)', 'Name, Anschrift, Geburtsdatum des VN wie in IS011',
          'Versicherungsnummer', 'Datum und Unterschrift des Kunden']
TEXT_MFA = ('Sehr geehrte Damen und Herren, unser Kunde <Vorname Nachname>, <Anschrift>, geb. <tt.mm.jjjj>, wünscht die Betreuung seines Vertrags <VNR> durch uns. '
            'Wir bitten um Übertragung des Vertrags in unseren Bestand (Agenturnummer <Agentur-Nr.>). Den Betreuungswunsch des Kunden finden Sie im Anhang.')
TEXT_MAKLER = ('Sehr geehrte Damen und Herren, anbei erhalten Sie die Maklervollmacht unseres Kunden <Vorname Nachname>, <Straße>, <PLZ Ort>, geb. <tt.mm.jjjj>. '
               'Wir bitten um Übertragung des Vertrags <VNR> in unseren Bestand. Unsere Agenturnummer bei Ihnen lautet <Agentur-Nr.>. Mit freundlichen Grüßen <Makler, Signatur wie EMMA>')
# (ID, Zweck, Absender, Betreff, Mailtext, Anhaenge, Anforderungen an Vollmacht / Betreuungswunsch, Hebel)
MAILS = [
 ('M-01', 'Standardmail Makler mit Maklervollmacht', 'P-01 (Makler-Testpostfach) mit Signatur des gewählten Maklers', 'Bestandsübertragung <VNR> – <Nachname VN>',
  TEXT_MAKLER, 'Maklervollmacht als PDF (eine Datei, gut lesbar)', MV_STANDARD, 'Standard'),
 ('M-02', 'Standardmail Mehrfachagent mit Betreuungswunsch', 'P-01 mit Signatur des Mehrfachagenten', 'Betreuungswunsch <VNR> – <Nachname VN>',
  TEXT_MFA, 'Betreuungswunsch des Kunden als PDF; keine Maklervollmacht', BW_MFA, 'Standard MFA'),
 ('M-03', 'Pool mit Untervollmacht, Anforderung von Unterlagen', 'P-02 (Pool-Testpostfach)', 'Bestandsübertragung <VNR> – <Nachname VN> – Untermakler <Name>',
  TEXT_MAKLER.replace('Wir bitten um Übertragung des Vertrags <VNR> in unseren Bestand. Unsere Agenturnummer bei Ihnen lautet <Agentur-Nr.>.',
                      'Wir bitten um Übertragung sämtlicher Verträge unseres Kunden, namentlich <VNR>, in den Bestand unseres Untermaklers <Name Untermakler>, '
                      'Agenturnummer <Agentur-Nr.>. Die Untervollmacht liegt bei.')
             .replace(' Mit freundlichen Grüßen', ' Bitte senden Sie uns die aktuelle Police, eine Schadenaufstellung der letzten fünf Jahre und die letzte Beitragsrechnung. '
                      'Mit freundlichen Grüßen'),
  'Maklervollmacht auf den Pool und Untervollmacht als PDF',
  MV_STANDARD[:3] + ['Vollmachtnehmer: der Pool', 'Untervollmacht liegt bei und nennt den Untermakler namentlich'] + MV_STANDARD[4:],
  'Pool mit Untervollmacht, alle Verträge, Unterlagen anfordern'),
 ('M-04', 'Pool ohne Untervollmacht', 'P-02 (Pool-Testpostfach)', 'Bestandsübertragung <VNR> – <Nachname VN> – Untermakler <Name>',
  TEXT_MAKLER.replace('in unseren Bestand. Unsere Agenturnummer bei Ihnen lautet <Agentur-Nr.>.',
                      'in den Bestand unseres Untermaklers <Name Untermakler>, Agenturnummer <Agentur-Nr.>.'),
  'nur Maklervollmacht auf den Pool', MV_STANDARD[:3] + ['Vollmachtnehmer: der Pool', 'keine Untervollmacht beigefügt'] + MV_STANDARD[4:], 'Pool, Untervollmacht weglassen'),
 ('M-05', 'Maklervollmacht ohne Unterschrift des VN', 'P-01', 'Bestandsübertragung <VNR> – <Nachname VN>', TEXT_MAKLER, 'Maklervollmacht als PDF',
  MV_STANDARD[:-1] + ['Unterschriftsfeld des Versicherungsnehmers leer lassen (sonst vollständig)'], 'Unterschrift weglassen'),
 ('M-06', 'Mehrfachagent ohne ausformulierten BÜ-Wunsch', 'P-01 mit Signatur des Mehrfachagenten', 'Unterlagen <Nachname VN>',
  'Sehr geehrte Damen und Herren, anbei die Unterlagen zu unserem gemeinsamen Kunden <Vorname Nachname>. Mit freundlichen Grüßen <MFA>',
  'Betreuungswunsch des Kunden als PDF', BW_MFA, 'Auftrag im Text weglassen: der Mailtext enthält keine Bitte um Übertragung'),
 ('M-07', 'Mehrfachagent, Betreuungswunsch auf anderen Vermittler', 'P-01 mit Signatur des Mehrfachagenten', 'Betreuungswunsch <VNR> – <Nachname VN>',
  TEXT_MFA, 'Betreuungswunsch des Kunden als PDF',
  ['Betreuungswunsch des Kunden, ausgestellt auf einen anderen Vermittler als den absendenden Mehrfachagenten'] + BW_MFA[1:],
  'Betreuungswunsch auf einen anderen Vermittler ausgestellt'),
 ('M-08', 'BÜ-Anfrage eines Courtagefortzahlers oder Kontaktgebers', 'P-01 mit Signatur des Vermittlers A-05', 'Bestandsübertragung <VNR> – <Nachname VN>',
  TEXT_MAKLER, 'Maklervollmacht als PDF (Inhalt wird nicht geprüft)', ['Vollmacht darf beiliegen; sie wird für diese Typen nicht geprüft'], 'Absender ist CFZ bzw. KTG'),
 ('M-09', 'Falsches Geburtsdatum des VN', 'P-01', 'Bestandsübertragung <VNR> – <Nachname VN>',
  TEXT_MAKLER.replace('geb. <tt.mm.jjjj>', 'geb. <falsches Datum: Tag und Monat vertauscht>'), 'Maklervollmacht als PDF',
  [MV_STANDARD[0], 'Anschrift wie in IS011, Geburtsdatum abweichend (dasselbe falsche Datum wie im Mailtext)'] + MV_STANDARD[2:], 'Geburtsdatum verfälschen'),
 ('M-10', 'Auftrag nennt eine andere Person als den VN', 'P-01', 'Bestandsübertragung <VNR> – <Nachname der genannten Person>',
  TEXT_MAKLER.replace('<Vorname Nachname>, <Straße>, <PLZ Ort>, geb. <tt.mm.jjjj>', '<Vorname Nachname der anderen Person>, <deren Anschrift>, geb. <deren Geburtsdatum>'),
  'Maklervollmacht als PDF', ['Name, Anschrift, Geburtsdatum der anderen Person exakt wie in IS011', 'VNR des Testvertrags (nicht ihr eigener)',
                               'Unterschrift der anderen Person'] + MV_STANDARD[3:6], 'andere Person statt VN nennen'),
 ('M-11', 'Auftrag nennt eine unbekannte Person', 'P-01', 'Bestandsübertragung <VNR> – <fiktiver Nachname>',
  TEXT_MAKLER.replace('<Vorname Nachname>, <Straße>, <PLZ Ort>, geb. <tt.mm.jjjj>', '<fiktiver Vorname Nachname>, <gültige Straße und PLZ>, geb. <beliebiges Datum>'),
  'Maklervollmacht als PDF', ['fiktiver Name, der in IS011 nicht vorkommt; gültige PLZ', 'sonst wie Standard, unterschrieben'], 'fiktive Person nennen'),
 ('M-12', 'Standardmail von unbekanntem Absender', 'P-04 (unbekannter Absender), Signatur ohne Agenturnummer', 'Bestandsübertragung <VNR> – <Nachname VN>',
  TEXT_MAKLER.replace(' Unsere Agenturnummer bei Ihnen lautet <Agentur-Nr.>.', ''), 'Maklervollmacht als PDF',
  MV_STANDARD[:3] + ['Vollmachtnehmer: ein Makler, der im EMMA-Abzug nicht vorkommt'] + MV_STANDARD[4:], 'Absender ohne EMMA-Treffer'),
 ('M-13', 'Sammelmail Fehlerliste: intern weitergeleitet, Vollmacht ohne VNR, falsches Geburtsdatum', 'P-03 (internes ERGO-Postfach), leitet eine Maklermail von A-02 weiter',
  'WG: Bestandsübertragung <VNR> – <Nachname VN>',
  'Weiterleitung ohne eigenen Text. Die weitergeleitete Maklermail entspricht M-01 (Signatur und Agenturnummer von A-02), nennt aber ein falsches Geburtsdatum '
  '(Tag und Monat vertauscht).', 'Maklervollmacht als PDF',
  [MV_STANDARD[0], 'Anschrift wie in IS011, Geburtsdatum abweichend (dasselbe falsche Datum wie im Mailtext)',
   'weder Versicherungsnummer noch „alle Verträge“ auf der Vollmacht (Pflichtangabe fehlt)'] + MV_STANDARD[3:],
  'drei Mängel zugleich: intern weiterleiten, Pflichtangabe weglassen, Geburtsdatum verfälschen'),
]
MAIL = {m[0]: m for m in MAILS}

# ------------------------------------------------------------------ KI-Deckblatt: Felder, die der Pruef-Bot liest
FELDER = [
 ('Vermittler', 'BUE_VERMITTLER_TYP'), ('Vermittler', 'BUE_AGENTUR_NR'), ('Vermittler', 'BUE_VERMITTLER_NR'), ('Vermittler', 'BUE_MAKLER_EMAIL'),
 ('Vermittler', 'BUE_POOL'), ('Vermittler', 'BUE_UV_ERTEILT'),
 ('Vollmacht / Wunsch', 'BUE_WUNSCH_VORHANDEN'), ('Vollmacht / Wunsch', 'BUE_MV_AUF_MAKLER'), ('Vollmacht / Wunsch', 'BUE_MV_UNTERSCHRIFT_KUNDE'),
 ('Vollmacht / Wunsch', 'BUE_PRUEFUNG_UNTERLAGEN'), ('Vollmacht / Wunsch', 'BUE_MV_EINGANGSDATUM'),
 ('Kunde', 'BUE_KUNDE_NACHNAME'), ('Kunde', 'BUE_KUNDE_VORNAME'), ('Kunde', 'BUE_KUNDE_STRASSE'), ('Kunde', 'BUE_KUNDE_PLZ'), ('Kunde', 'BUE_KUNDE_GEBDAT'),
 ('Vertrag', 'BUE_VNR'), ('Vertrag', 'BUE_VNR_2'), ('Vertrag', 'BUE_UMFANG'), ('Vertrag', 'BUE_SPARTE'), ('Vertrag', 'BUE_ART_UNTERLAGEN'),
]
KL_FELDER = ('BUE_SPARTE', 'BUE_ART_UNTERLAGEN')


def dp_basis(art, vnr, ag, sparte):
    kunde = 'VN von %s' % vnr
    d = {'BUE_VERMITTLER_TYP': '„Makler“', 'BUE_AGENTUR_NR': 'Agentur-Nr. von %s (nur Ziffern)' % ag, 'BUE_VERMITTLER_NR': 'PNR von %s' % ag,
         'BUE_MAKLER_EMAIL': 'Absenderadresse der Mail', 'BUE_POOL': 'leer', 'BUE_UV_ERTEILT': '„nein“ oder N/A (ohne Pool ohne Wirkung)',
         'BUE_WUNSCH_VORHANDEN': '„ja“', 'BUE_MV_AUF_MAKLER': '„ja“', 'BUE_MV_UNTERSCHRIFT_KUNDE': '„ja“', 'BUE_PRUEFUNG_UNTERLAGEN': '„Vollständig“',
         'BUE_MV_EINGANGSDATUM': 'Eingangsdatum der Mail (tt.mm.jjjj)',
         'BUE_KUNDE_NACHNAME': 'Nachname %s wie IS011' % kunde, 'BUE_KUNDE_VORNAME': 'Vorname %s' % kunde, 'BUE_KUNDE_STRASSE': 'Straße %s' % kunde,
         'BUE_KUNDE_PLZ': 'PLZ %s' % kunde, 'BUE_KUNDE_GEBDAT': 'Geburtsdatum %s' % kunde,
         'BUE_VNR': 'VNR von %s' % vnr, 'BUE_VNR_2': 'leer', 'BUE_UMFANG': '„Einzel“', 'BUE_SPARTE': 'Spartenkürzel von %s' % vnr, 'BUE_ART_UNTERLAGEN': 'leer'}
    if art == 'MFA':
        d.update({'BUE_VERMITTLER_TYP': '„MFA“', 'BUE_UV_ERTEILT': 'N/A', 'BUE_MV_AUF_MAKLER': '„ja“ (Betreuungswunsch auf den MFA)',
                  'BUE_MV_UNTERSCHRIFT_KUNDE': 'nicht geprüft (beliebig)', 'BUE_PRUEFUNG_UNTERLAGEN': 'leer'})
    if art in ('Courtagefortzahler', 'Kontaktgeber'):
        d = {k: 'N/A (nicht geprüft)' for k in d}
        d.update({'BUE_VERMITTLER_TYP': '„%s“' % art, 'BUE_AGENTUR_NR': 'Agentur-Nr. von %s (nur Ziffern)' % ag, 'BUE_VNR': 'VNR von %s' % vnr})
    if sparte == 'KV':
        for f in KL_FELDER:
            d[f] = 'wird für KV nicht gelesen'
    return d


def kunde(text, gebdat=None):
    return {'BUE_KUNDE_NACHNAME': 'Nachname ' + text, 'BUE_KUNDE_VORNAME': 'Vorname ' + text, 'BUE_KUNDE_STRASSE': 'Straße ' + text,
            'BUE_KUNDE_PLZ': 'PLZ ' + text, 'BUE_KUNDE_GEBDAT': gebdat or ('Geburtsdatum ' + text)}


FIRMA = {'BUE_KUNDE_NACHNAME': 'Firmenname K-03 wie IS011', 'BUE_KUNDE_VORNAME': 'leer', 'BUE_KUNDE_STRASSE': 'Straße K-03',
         'BUE_KUNDE_PLZ': 'PLZ K-03', 'BUE_KUNDE_GEBDAT': 'leer'}

# ------------------------------------------------------------------ Akzeptanz-Bausteine
def notiz_ak(sparte, bearb='Mit BÜ-Wunsch', email='in OB729 hinterlegte Adresse des Vermittlers', pnr='PNR aus OB726 bzw. Datenpool, 7-stellig ohne „P,“',
             freitext=None, folgearbeit='kein Kennzeichen gesetzt', vnr='<Vorgang-VNR>', eingang='Eingangsdatum laut KI-Deckblatt (tt.mm.jjjj)', extra=()):
    kv = sparte == 'KV'
    ak = ['Status „Completed“ im Report; keine BE, kein Bearbeitungshinweis, <Fehlerliste> leer',
          'Telefonnotiz angelegt und gespeichert: ' + ('Vorlage BOT2011 „BÜ auf Makler Robotics“' if kv else 'Vorlage 1515 „Bestandsübertragung Robotics PB“'),
          'Notiz „Eingangsdatum“ = ' + eingang,
          'Notiz „Maklername“ = OB726 „Name 1“ des übernehmenden Vermittlers; „Agenturnummer“ = Agentur-Nr. nur Ziffern',
          'Notiz „Personalnummer“ = ' + pnr,
          'Notiz „E-Mail aufnehmender Makler“ = ' + email,
          'Notiz „Bearbeitung nach“ = „' + bearb + '“; „Betroffene VNR“ = „angegebene VNR beachten“',
          'Notiz „VNR“ = ' + vnr,
          'Notiz Freitext Sparte = „' + (freitext or ('KV' if kv else 'Komposit')) + '“; „Laufende Nr. aus Vorgangsdatenbank“ = Vorgang-Lfd-Nr']
    if not kv:
        ak.append('Notiz „Folgearbeit für Komposit“: ' + folgearbeit)
    ak += list(extra)
    ak.append('Vorgang weitergeleitet an ' + PK_72 + '; kein neuer Vorgang eröffnet')
    return ak


def be_ak(klass, postkorb, fehler='„Fehler: keine“', vor_host=False, extra=()):
    ak = ['Bearbeitungshinweis am Postkorbvorgang gespeichert, Zeile exakt „BE: ' + klass + '“',
          'Abschnitt Fehler: ' + fehler,
          'Abschnitt „Hinweis:“ mit „Weitere VNR: “ und allen VNR aus dem Auftrag',
          'Vorgang weitergeleitet an ' + postkorb,
          'Keine Telefonnotiz angelegt; Status „Referred“ im Report mit BE-Klassifikation und Prüfnotizen']
    if vor_host:
        ak.append('Ausstieg vor jedem Hostzugriff: Bot-Protokoll ohne Aufruf von IS011, VA230, OB726, OB729, GH040')
    return ak + list(extra)


KAPITEL = [('VP', 'Vorprüfung (KI-Deckblatt)'), ('I', 'I. Kunde (IS011)'), ('II', 'II. Abgebender Bestandsinhaber'), ('III', 'III. Vermittler (OB726, GH040)'),
           ('EM', 'III. E-Mail-Adresse'), ('IV', 'IV. Vertrag (VA230)'), ('V', 'V. Test auf Fehlerliste'), ('AB', 'Abschluss')]
STANDARD_OK = {'VP': 'kein Ausschlusskriterium', 'I': 'VN über die VNR gefunden, Matchcodesuche trifft den VN', 'II': 'Bestandsinhaber ermittelt, GH040 aktiv',
               'III': 'Agentur in OB726, Name ohne „INAKTIV“, Typ passt, GH040 aktiv', 'EM': 'Adresse aus OB729', 'IV': 'Status „aktuell“'}
VERTRAG = {v[0]: v for v in VERTRAEGE}
AGENTUR = {a[0]: a for a in AGENTUREN}


# ------------------------------------------------------------------ Testfaelle
def tf(**k):
    k.setdefault('agentur', 'A-01'); k.setdefault('mail', 'M-01'); k.setdefault('art', 'Makler'); k.setdefault('dp', {})
    k.setdefault('be', None); k.setdefault('pn', []); k.setdefault('bes', {}); k.setdefault('notiz', {}); k.setdefault('ak_extra', [])
    k.setdefault('weg_b', ''); k.setdefault('hinweis', ''); k.setdefault('deckt', [])
    vnrs = k['vnr'].split('+')
    if 'sparte' not in k:
        sp = {VERTRAG[v][2] for v in vnrs if v in VERTRAG}
        k['sparte'] = 'KV und KL' if len(sp) > 1 else (sp.pop() if sp else 'KV')
    basis = dp_basis(k['art'], vnrs[0], k['agentur'], 'KL' if 'KL' in k['sparte'] else 'KV')
    k['dp_soll'] = [(g, f, k['dp'].get(f, basis[f]), f in k['dp']) for g, f in FELDER]
    befund = k['be'] or k['pn']
    if 'ziel' not in k:
        if not befund:
            k['ziel'] = PK_72
        elif k['sparte'] == 'KV':
            k['ziel'] = PK_MV
        elif k['be'] and k['be'][0] in ('VP', 'I'):
            k['ziel'] = PK_KO
        elif vnrs[0] == 'V-03':
            k['ziel'] = PK_ODPP
        else:
            k['ziel'] = PK_KO
    # erwarteter Ablauf je Kapitel
    if 'ablauf' not in k:
        ab, ende = [], False
        pn = dict(k['pn']) if k['pn'] else {}
        for key, name in KAPITEL:
            if key == 'V':
                if ende: ab.append((name, 'nicht durchlaufen', 'aus'))
                elif k['pn']: ab.append((name, 'Fehlerliste gefüllt → BE „Nachprüfung erforderlich“', 'be'))
                else: ab.append((name, 'Fehlerliste leer → Abschluss ohne Befund', 'ok'))
                continue
            if key == 'AB':
                if befund:
                    ab.append(('VII. Abschluss mit Befund', 'Bearbeitungshinweis „BE:“, „Fehler:“, „Hinweis:“; Weiterleitung an ' + k['ziel'], 'be'))
                else:
                    ab.append(('VI. Abschluss ohne Befund', 'Telefonnotiz ' + ('BOT2011' if k['sparte'] == 'KV' else '1515') + ' bestückt; Weiterleitung an ' + PK_72, 'ok'))
                continue
            if ende:
                ab.append((name, 'nicht durchlaufen', 'aus')); continue
            if k['be'] and k['be'][0] == key:
                vor = [k['bes'][key]] if key in k['bes'] else []
                ab.append((name, '; '.join(vor + ['harte BE „%s“ → Kapitel VII' % k['be'][1]]), 'be')); ende = True; continue
            if key in pn:
                vor = [k['bes'][key]] if key in k['bes'] else []
                ab.append((name, '; '.join(vor + ['Prüfnotiz „%s“, Prüfung läuft weiter' % pn[key]]), 'pn')); continue
            ab.append((name, k['bes'].get(key, STANDARD_OK[key]), 'ok'))
        k['ablauf'] = ab
    # Akzeptanzkriterien
    if 'akzeptanz' not in k:
        if not befund:
            k['akzeptanz'] = notiz_ak('KV' if k['sparte'] == 'KV' else 'KL', extra=k['ak_extra'], **k['notiz'])
        else:
            klass = k['be'][1] if k['be'] else 'Nachprüfung erforderlich'
            fehler = ('„Fehler:“, darunter ' + ', '.join('Zeile %d „%s“' % (i + 1, t) for i, (_, t) in enumerate(k['pn']))) if k['pn'] else '„Fehler: keine“'
            k['akzeptanz'] = be_ak(klass, k['ziel'], fehler, vor_host=bool(k['be'] and k['be'][0] == 'VP'), extra=k['ak_extra'])
    if 'ergebnis' not in k:
        if k['be']:
            k['ergebnis'] = 'BE „%s“' % k['be'][1] + (' (mit Prüfnotiz)' if k['pn'] else '') + ' → ' + k['ziel'].strip('„“')
        elif k['pn']:
            k['ergebnis'] = 'Prüfnotiz ' + ', '.join('„%s“' % t for _, t in k['pn']) + ' → BE „Nachprüfung erforderlich“ → ' + k['ziel'].strip('„“')
        else:
            k['ergebnis'] = 'Notiz ' + ('BOT2011' if k['sparte'] == 'KV' else '1515') + ' bestückt → ' + PK_72.strip('„“')
    return k


def vn(v):
    return 'des VN von %s' % v

TESTFAELLE = [
 # ============================================================ GL
 tf(id='TF-GL-01', gruppe='GL', titel='Glattfall KV: Makler', prio='Muss', weg='A', vnr='V-01', kapitel='alle, VI',
    ziel_text='Standardweg KV ohne Befund: Notiz BOT2011 mit allen Pflichtfeldern, E-Mail aus OB729, PNR 7-stellig, Übergabe an den 72-Stunden-BOT.',
    deckt=['Notiz BOT2011 (KV)', 'Bearbeitung nach: Mit BÜ-Wunsch', 'E-Mail aus OB729', 'Routing HSB4 K 72']),
 tf(id='TF-GL-02', gruppe='GL', titel='Glattfall KV: Mehrfachagent mit Betreuungswunsch', prio='Muss', weg='A', vnr='V-01', agentur='A-04', mail='M-02', art='MFA',
    kapitel='Vorprüfung, III, VI', ziel_text='MFA-Zweig: keine Maklervollmacht, BÜ-Wunsch und Betreuungswunsch auf den MFA genügen.',
    bes={'VP': 'MFA-Zweig: BÜ-Wunsch „ja“, Betreuungswunsch auf MFA „ja“', 'III': 'OB726 „Mehrfachagent“ passt zum Typ MFA'},
    ak_extra=['Keine Prüfnotiz „Vermittlertyp abweichend“'], deckt=['Vermittlertyp MFA', 'Bearbeitung nach: Mit BÜ-Wunsch']),
 tf(id='TF-GL-03', gruppe='GL', titel='Glattfall Non-KV: Firmenkunde KR, Pool mit Untervollmacht, TOP-Makler, Unterlagenanforderung', prio='Muss', weg='A',
    vnr='V-04', agentur='A-03', mail='M-03', kapitel='Vorprüfung, I, III, IV, VI',
    ziel_text='Komposit ohne Befund: Notiz 1515 mit gesetzter Folgearbeit; Pool mit Untervollmacht ergibt „Mit BÜ-Wunsch“; TOP-Makler, also Adresse aus der Sonderliste; '
              'Firma ohne Geburtsdatum; normaler KR-Vertrag löst keine Flotten-BE aus; Umfang „Gesamt“ und weitere VNR nur nachrichtlich.',
    dp=dict(FIRMA, BUE_POOL='Poolname', BUE_UV_ERTEILT='„ja“', BUE_AGENTUR_NR='Agentur-Nr. von A-03 (Untermakler)',
            BUE_VERMITTLER_NR='PNR von A-03', BUE_MAKLER_EMAIL='Adresse des Pools (P-02)', BUE_UMFANG='„Gesamt“', BUE_VNR='VNR von V-04;VNR von V-05',
            BUE_ART_UNTERLAGEN='„Police/Vertragsspiegel/Vertragsauszug/Ersatzrechnung; Schadenaufstellung/Schadenrenta; Sonstige Unterlagen“'),
    bes={'I': 'Matchcodesuche ohne Geburtsdatum, kein Geburtsdatumsabgleich', 'EM': 'Adresse aus der Sonderliste, OB729 nicht aufgerufen',
         'IV': '„Sparte/Vers.Art“ = „KR“ → keine Flotten-BE'},
    notiz={'email': 'Adresse aus der Sonderliste TOP-Makler (Stand 23.09.2026), nicht die Pool-Adresse',
           'folgearbeit': 'alle drei Kennzeichen gesetzt (Police …, Schadenaufstellung …, Sonstige Unterlagen), Notiz erst danach gespeichert',
           'vnr': 'V-04, dahinter nachrichtlich V-05 mit „;“ getrennt'},
    ak_extra=['Notiz „Maklername“ und „Agenturnummer“ = Untermakler A-03, nicht der Pool', 'Notiz Freitext enthält „Auftrag: gesamte Kundenverbindung“',
              'Keine Prüfnotiz „Geburtsdatum abweichend“, keine BE „KR Flottenvertrag“, kein Aufruf von OB729'],
    hinweis='Getestet wird nur der Vorgang zu V-04. Über die Testmail (Weg A) eröffnet Celonis zu V-05 einen eigenen Vorgang – der gehört zu TF-VT-02.',
    deckt=['Notiz 1515 (Komposit/Leben)', 'Bearbeitung nach: Mit BÜ-Wunsch', 'E-Mail aus Sonderliste TOP-Makler', 'Folgearbeit für Komposit gesetzt', 'Umfang Gesamt',
           'Weitere VNR nachrichtlich in der Notiz', 'Juristische Person ohne Geburtsdatum', 'Routing HSB4 K 72']),
 tf(id='TF-GL-04', gruppe='GL', titel='Glattfall Non-KV: Pool ohne Untervollmacht, Makler als Bestandsinhaber, alte PNR', prio='Muss', weg='A', vnr='V-03', agentur='A-02', mail='M-04',
    kapitel='II, III, VI',
    ziel_text='Pool ohne Untervollmacht ergibt „Untervollmacht fehlt“ und bleibt ein Glattfall; ein Makler als Bestandsinhaber führt ohne Befund trotzdem nach HSB4 K 72; '
              'die alte PNR wird auf 7 Stellen aufgefüllt; ohne OB729-Adresse gilt der Absender.',
    dp={'BUE_POOL': 'Poolname', 'BUE_UV_ERTEILT': '„nein“', 'BUE_AGENTUR_NR': 'Agentur-Nr. von A-02 (Untermakler)',
        'BUE_VERMITTLER_NR': 'alte PNR von A-02 (weniger als 7 Stellen)', 'BUE_MAKLER_EMAIL': 'Adresse des Pools (P-02)'},
    bes={'II': 'Bestandsinhaber Makler, Vertriebskanal z. B. 2301 gelesen (wirkt nur bei Befund)', 'III': 'PNR auf 7 Stellen aufgefüllt, GH040 mit dieser PNR aktiv',
         'EM': 'OB729 ohne Adresse → Absender (Pool)'},
    notiz={'bearb': 'Untervollmacht fehlt', 'pnr': 'alte PNR links mit Nullen auf 7 Stellen aufgefüllt (z. B. 123456 → 0123456)',
           'email': 'Absenderadresse der Mail (Pool, P-02)'},
    ak_extra=['Kein Routing nach ' + PK_ODPP + ' (ohne Befund entscheidet der Vertriebskanal nicht)'],
    hinweis='Hat A-02 keine alte PNR, entfällt nur das Akzeptanzkriterium zur Auffüllung auf 7 Stellen.',
    deckt=['Bearbeitung nach: Untervollmacht fehlt', 'PNR aufgefüllt auf 7 Stellen', 'E-Mail = Absender', 'Notiz 1515 (Komposit/Leben)', 'Routing HSB4 K 72']),
 # ============================================================ VP
 tf(id='TF-VP-01', gruppe='VP', titel='Courtagefortzahler', prio='Muss', weg='A oder B', vnr='V-01', agentur='A-05', mail='M-08', art='Courtagefortzahler', kapitel='Vorprüfung',
    ziel_text='Ein Courtagefortzahler erhält keine Bestände: harte BE als erste Prüfung, der Typ wird mitgeführt.',
    be=('VP', 'Keine Bestandsübertragung möglich: Courtagefortzahler'),
    hinweis='A-05 steht im EMMA-Abzug als „Courtagefortzahler“. Nach diesem Lauf den Typ für TF-VP-02 auf „Kontaktgeber“ umstellen – eine zweite Agentur ist nicht nötig.', weg_b='Standardmail mit A-01; im Datensatz BUE_VERMITTLER_TYP = „Courtagefortzahler“ setzen.',
    deckt=['Keine Bestandsübertragung möglich: Courtagefortzahler', 'Routing HSB4 K MV']),
 tf(id='TF-VP-02', gruppe='VP', titel='Kontaktgeber (Tippgeber)', prio='Muss', weg='A oder B', vnr='V-01', agentur='A-05', mail='M-08', art='Kontaktgeber', kapitel='Vorprüfung',
    ziel_text='Ein Kontaktgeber erhält keine Bestände: harte BE als erste Prüfung, der Typ wird mitgeführt.',
    be=('VP', 'Keine Bestandsübertragung möglich: Kontaktgeber'),
    hinweis='Dieselbe Agentur A-05 wie in TF-VP-01; vor diesem Lauf den EMMA-Typ auf „Kontaktgeber“ umstellen und nach dem Test zurücksetzen.', weg_b='Standardmail mit A-01; im Datensatz BUE_VERMITTLER_TYP = „Kontaktgeber“ setzen.',
    deckt=['Keine Bestandsübertragung möglich: Kontaktgeber']),
 tf(id='TF-VP-03', gruppe='VP', titel='Agenturnummer fehlt', prio='Muss', weg='A oder B', vnr='V-01', agentur='keine', mail='M-12', kapitel='Vorprüfung',
    ziel_text='Ohne Agenturnummer ist der Vorgang nicht bearbeitbar: harte BE vor jedem Hostzugriff.',
    dp={'BUE_AGENTUR_NR': 'leer', 'BUE_VERMITTLER_NR': 'leer', 'BUE_VERMITTLER_TYP': 'leer'}, be=('VP', 'Agenturnummer nicht vorhanden'),
    weg_b='Standardmail mit A-01; im Datensatz BUE_AGENTUR_NR leeren.', deckt=['Agenturnummer nicht vorhanden']),
 tf(id='TF-VP-04', gruppe='VP', titel='Mehrfachagent ohne BÜ-Wunsch', prio='Muss', weg='A', vnr='V-01', agentur='A-04', mail='M-06', art='MFA', kapitel='Vorprüfung',
    ziel_text='Beim Mehrfachagenten ist der ausformulierte BÜ-Wunsch Pflicht.', dp={'BUE_WUNSCH_VORHANDEN': '„nein“'}, be=('VP', 'BÜ-Wunsch nicht vorhanden'),
    deckt=['BÜ-Wunsch nicht vorhanden']),
 tf(id='TF-VP-05', gruppe='VP', titel='Mehrfachagent, Betreuungswunsch auf anderen Vermittler', prio='Muss', weg='A', vnr='V-01', agentur='A-04', mail='M-07', art='MFA',
    kapitel='Vorprüfung', ziel_text='Beim Mehrfachagenten muss der Betreuungswunsch auf ihn lauten.', dp={'BUE_MV_AUF_MAKLER': '„nein“'},
    be=('VP', 'Betreuungswunsch nicht auf MFA ausgestellt'), deckt=['Betreuungswunsch nicht auf MFA ausgestellt']),
 tf(id='TF-VP-06', gruppe='VP', titel='Makler: Unterschrift des VN fehlt (Komposit, Routing ohne Vertriebskanal)', prio='Muss', weg='A', vnr='V-03', mail='M-05',
    kapitel='Vorprüfung, VII (Routing)',
    ziel_text='Beim Makler ist die Unterschrift des VN auf der Maklervollmacht das harte Kriterium. Zugleich: Endet die Prüfung vor Kapitel II, ist der Vertriebskanal '
              'unbekannt – der Komposit-Vorgang geht nach HSB4 K KO, obwohl der Bestandsinhaber ein Makler ist.',
    dp={'BUE_MV_UNTERSCHRIFT_KUNDE': '„nein“', 'BUE_PRUEFUNG_UNTERLAGEN': '„VN-Unterschrift fehlt“'}, be=('VP', 'Unterschrift VN fehlt'),
    ak_extra=['Kein Routing nach ' + PK_ODPP + ' (Kapitel II nicht erreicht)'], deckt=['Unterschrift VN fehlt', 'Routing HSB4 K KO']),
 # ============================================================ KU
 tf(id='TF-KU-01', gruppe='KU', titel='Vertrag zur VNR nicht gefunden', prio='Muss', weg='B', vnr='V-01', kapitel='I',
    ziel_text='Zeigt IS011 zur Vorgang-VNR keine Stammdaten, entsteht eine harte BE. Weg A ist nicht möglich, weil Celonis nur echte VNR eröffnet.',
    dp={'BUE_VNR': 'formal gültige, in IMSI nicht vorhandene KV-Nummer'}, be=('I', 'Vertrag zur VNR nicht gefunden'),
    weg_b='Standardmail zu V-01 mit A-01; im Datensatz und am Postkorbvorgang die VNR durch eine formal gültige, in IMSI nicht vorhandene Nummer ersetzen.',
    bes={'I': 'IS011 zeigt keine VAF017 bzw. leeres Feld „KD“'}, deckt=['Vertrag zur VNR nicht gefunden']),
 tf(id='TF-KU-02', gruppe='KU', titel='Kunde in IS011 nicht gefunden', prio='Muss', weg='A', vnr='V-01', mail='M-11', kapitel='I',
    ziel_text='Leere Trefferliste auch nach der Wiederholung ohne Geburtsdatum führt zur harten BE.', dp=kunde('der fiktiven Person'), be=('I', 'Kunde in IS011 nicht gefunden'),
    bes={'I': 'erste Suche mit Geburtsdatum leer, zweite ohne Geburtsdatum leer'}, ak_extra=['Bot-Protokoll: zwei Matchcodesuchen, die zweite ohne Geburtsdatum'],
    deckt=['Kunde in IS011 nicht gefunden', 'Zweite Matchcodesuche ohne Geburtsdatum']),
 tf(id='TF-KU-03', gruppe='KU', titel='Kunde ist nicht VN – genannte Person ist nur versicherte Person', prio='Muss', weg='A', vnr='V-08', mail='M-10', kapitel='I (Scout-Service)',
    ziel_text='Der Auftrag nennt statt des VN die versicherte Person des Vertrags: harte BE „Kunde ist nicht VN“ (die Person hängt am Vertrag, aber nicht als VN).',
    dp=kunde('der versicherten Person aus V-08'), be=('I', 'Kunde ist nicht Versicherungsnehmer'),
    bes={'I': 'genau ein Treffer, Kundennummer ungleich VN; V-08 steht in der Scout-Übersicht dieser Person'},
    ak_extra=['Bot-Protokoll: Scout-Service mit der Kundennummer der genannten Person aufgerufen'], deckt=['Kunde ist nicht Versicherungsnehmer']),
 tf(id='TF-KU-04', gruppe='KU', titel='Vertrag gehört nicht zum Kunden', prio='Muss', weg='A', vnr='V-01', mail='M-10', kapitel='I (Scout-Service)',
    ziel_text='Die im Auftrag genannte Person hat keinerlei Bezug zum Vertrag: harte BE.', dp=kunde('des VN von V-03 (Kunde K-02)'),
    be=('I', 'Vertrag gehört nicht zum Kunden'), bes={'I': 'genau ein Treffer (K-02), Kundennummer ungleich VN; V-01 fehlt in der Scout-Übersicht von K-02'},
    hinweis='Nutzt den VN von V-03 als „fremde Person“ zur VNR von V-01; kein eigener Vertrag nötig.', deckt=['Vertrag gehört nicht zum Kunden']),
 tf(id='TF-KU-05', gruppe='KU', titel='Mehrfachtreffer und Trefferliste über mehrere Seiten', prio='Soll', weg='A', vnr='V-09', kapitel='I',
    ziel_text='Mehrfachtreffer sind unkritisch, solange die Kundennummer des VN darunter ist; der Bot blättert mit PF2, solange eine Folgeseite angeboten wird.',
    bes={'I': 'Trefferliste mit mehreren Einträgen, VN auf der Folgeseite nach PF2 gefunden'},
    ak_extra=['Bot-Protokoll: PF2 mindestens einmal ausgeführt'], deckt=['Mehrfachtreffer in IS011']),
 # ============================================================ VM
 tf(id='TF-VM-01', gruppe='VM', titel='Agenturnummer in OB726 unbekannt', prio='Muss', weg='B', vnr='V-01', kapitel='III',
    ziel_text='Kennt OB726 die Agenturnummer aus dem Auftrag nicht („IS0042I“), entsteht eine harte BE.',
    dp={'BUE_AGENTUR_NR': 'fiktive Agentur-Nr. (9 Ziffern, in IMSI nicht vorhanden)'}, be=('III', 'Agenturnummer in OB726 unbekannt'),
    weg_b='Standardmail mit A-01; im Datensatz BUE_AGENTUR_NR auf eine fiktive Nummer setzen. Weg A nur, wenn der EMMA-Abzug eine Agentur ohne IMSI-Gegenstück enthält.',
    bes={'III': 'OB726 meldet „IS0042I“; GH040 und OB729 werden nicht aufgerufen'}, deckt=['Agenturnummer in OB726 unbekannt']),
 tf(id='TF-VM-02', gruppe='VM', titel='Keine Zusammenarbeit („INAKTIV“) nach gemerkter Prüfnotiz, Routing ODPP1 D', prio='Muss', weg='A', vnr='V-03', agentur='A-06', mail='M-09',
    kapitel='I, III, VII (Routing)',
    ziel_text='„INAKTIV“ im OB726-Namen ist eine harte BE. Zugleich: Die vorher gemerkte Prüfnotiz steht trotzdem unter „Fehler:“, und bei Komposit mit Makler als '
              'Bestandsinhaber geht der Befund nach ODPP1 D.',
    dp={'BUE_KUNDE_GEBDAT': 'falsches Datum (Tag und Monat vertauscht)'}, pn=[('I', 'Geburtsdatum abweichend')], be=('III', 'Keine Zusammenarbeit'),
    bes={'I': 'erste Suche leer, zweite ohne Geburtsdatum trifft den VN', 'II': 'Bestandsinhaber Makler, Vertriebskanal z. B. 2301 gelesen',
         'III': '„Name 1“ enthält „INAKTIV“; GH040 wird nicht mehr aufgerufen'},
    ak_extra=['Bot-Protokoll: Vertriebskanal des Bestandsinhabers aus OB726 gelesen'],
    deckt=['Keine Zusammenarbeit', 'Routing ODPP1 D', 'Geburtsdatum abweichend']),
 tf(id='TF-VM-03', gruppe='VM', titel='Keine Zusammenarbeit – GH040 nicht aktiv', prio='Soll', weg='A', vnr='V-01', agentur='A-07', kapitel='III',
    ziel_text='Ist der Status der Beschäftigung in GH040 nicht „aktiv“, entsteht dieselbe harte BE (zweiter Auslöser).', be=('III', 'Keine Zusammenarbeit'),
    bes={'III': 'Name ohne „INAKTIV“, GH040 nicht aktiv'}, deckt=['Keine Zusammenarbeit']),
 # ============================================================ VT
 tf(id='TF-VT-01', gruppe='VT', titel='Vertrag nicht aktuell (Komposit, Routing nach Vertriebskanal AO)', prio='Muss', weg='A', vnr='V-02', kapitel='IV, VII (Routing)',
    ziel_text='Ein Vertrag mit VA230-Status ungleich „aktuell“ führt zur harten BE; der Status wird wörtlich mitgeführt. Bestandsinhaber AO → HSB4 K KO.',
    be=('IV', 'Vertrag nicht aktuell: <Status aus VA230, wörtlich>'), bes={'II': 'Bestandsinhaber AO, Vertriebskanal z. B. 2111 gelesen'},
    deckt=['Vertrag nicht aktuell', 'Routing HSB4 K KO']),
 tf(id='TF-VT-02', gruppe='VT', titel='KR-Flottenvertrag (Non-KV)', prio='Muss', weg='A', vnr='V-05', kapitel='IV',
    ziel_text='„Sparte/Vers.Art“ = „FK“ in VA230/VAF230 kennzeichnet einen Flottenvertrag und führt zur harten BE.',
    dp=dict(FIRMA, BUE_SPARTE='„KR“'), be=('IV', 'KR Flottenvertrag'),
    bes={'I': 'Matchcodesuche ohne Geburtsdatum', 'IV': '„Sparte/Vers.Art“ = „KFZ / FK / …“ → FK'}, deckt=['KR Flottenvertrag']),
 # ============================================================ BH
 tf(id='TF-BH-01', gruppe='BH', titel='Sammeltest Fehlerliste A: vier Prüfnotizen in einem Vorgang (echte Mail)', prio='Muss', weg='A', vnr='V-07', agentur='A-02', mail='M-13',
    kapitel='Vorprüfung, I, II, III, V, VII',
    ziel_text='Eine Mail mit vier Mängeln zugleich: Der Bot merkt jede Prüfnotiz, prüft trotzdem alle Kapitel zu Ende und gibt die Fehlerliste vollständig und in der Reihenfolge des Entstehens aus.',
    dp=dict({'BUE_PRUEFUNG_UNTERLAGEN': '„MV unvollständig“', 'BUE_MAKLER_EMAIL': 'interne Adresse (@ergo, P-03)'}, BUE_KUNDE_GEBDAT='falsches Datum (Tag und Monat vertauscht)'),
    pn=[('VP', 'Unterlagen nicht vollständig: MV unvollständig'), ('I', 'Geburtsdatum abweichend'), ('II', 'Anbindung Bestandsinhaber nicht aktiv'),
        ('EM', 'Absender ist eine interne ERGO-Adresse')],
    bes={'I': 'erste Suche mit Geburtsdatum leer, zweite ohne Geburtsdatum trifft den VN', 'II': 'Bestandsinhaber in OB726 vorhanden, GH040 nicht aktiv',
         'EM': 'OB729 ohne Adresse → Absender, Absender ist @ergo'},
    ak_extra=['Fehlerliste enthält genau diese vier Zeilen, keine weitere', 'Bot-Protokoll: Kapitel I bis IV vollständig durchlaufen, zweite Matchcodesuche ohne Geburtsdatum'],
    hinweis='Ersetzt vier Einzelfälle: Die Prüfnotizen schließen sich nicht aus. Vertrag V-07 liefert den inaktiven Bestandsinhaber, Agentur A-02 die fehlende OB729-Adresse, '
            'die Mail M-13 die übrigen drei Mängel.',
    deckt=['Unterlagen nicht vollständig', 'Geburtsdatum abweichend', 'Anbindung Bestandsinhaber nicht aktiv', 'Absender ist eine interne ERGO-Adresse',
           'Zweite Matchcodesuche ohne Geburtsdatum', 'Nachprüfung erforderlich', 'Routing HSB4 K MV']),
 tf(id='TF-BH-02', gruppe='BH', titel='Sammeltest Fehlerliste B: die drei übrigen Prüfnotizen (Datensatz)', prio='Muss', weg='B', vnr='V-06', agentur='A-02', mail='M-02', art='MFA',
    kapitel='Vorprüfung, II, III, V, VII',
    ziel_text='Die drei Prüfnotizen, die Sammeltest A nicht tragen kann, weil sie sich mit dessen Ausprägungen ausschließen: Betreuung leer statt Bestandsinhaber inaktiv, '
              'E-Mail fehlt statt Absender intern, dazu der abweichende Vermittlertyp.',
    dp={'BUE_VERMITTLER_TYP': '„MFA“ (OB726 nennt „Makler“)', 'BUE_MAKLER_EMAIL': 'leer'},
    pn=[('II', 'Bestandsinhaber nicht ermittelbar'), ('III', 'Vermittlertyp abweichend'), ('EM', 'E-Mail-Adresse des Vermittlers fehlt')],
    weg_b='Mail M-02 von A-02 zu V-06 einsteuern; im Datensatz BUE_VERMITTLER_TYP = „MFA“ setzen und BUE_MAKLER_EMAIL leeren (BÜ-Wunsch und Betreuungswunsch „ja“). '
          'Celonis liefert aus einer echten Mail weder einen leeren Absender noch einen falschen Typ.',
    bes={'VP': 'MFA-Zweig: BÜ-Wunsch „ja“, Betreuungswunsch auf MFA „ja“', 'II': 'Feld „Betreuung“ in VA230 leer', 'III': 'OB726 „Makler“ passt nicht zu „MFA“',
         'EM': 'OB729 ohne Adresse, Absender leer'},
    ak_extra=['Fehlerliste enthält genau diese drei Zeilen, keine weitere', 'Bot-Protokoll: Kapitel III und IV trotz Prüfnotiz in Kapitel II durchlaufen'],
    hinweis='Ersetzt drei Einzelfälle. Zusammen mit Sammeltest A ist jede der sieben Prüfnotizen der PDD nachgewiesen.',
    deckt=['Bestandsinhaber nicht ermittelbar', 'Vermittlertyp abweichend', 'E-Mail-Adresse des Vermittlers fehlt', 'Nachprüfung erforderlich']),
 # ============================================================ TE
 tf(id='TF-TE-01', gruppe='TE', titel='Kein Datensatz im Datenpool', prio='Muss', weg='B', vnr='V-01', mail='—', kapitel='Details zum Startereignis',
    ziel_text='Ein Postkorbvorgang ohne Datensatz im Datenpool wird nicht geprüft, sondern mit Hinweis weitergeleitet.',
    weg_b='Postkorbvorgang zu V-01 im Startpostkorb ' + PK_START + ' ohne Datenpool-Datensatz eröffnen (z. B. manuell).',
    ablauf=[('Start', 'kein Datensatz zur Vorgang-Lfd-Nr gefunden', 'be'), ('Weiterleitung', 'Hinweis „Kein Datensatz im Datenpool zu <Vorgang-Lfd-Nr>“, Postkorb laut PDD noch TBD', 'be')],
    akzeptanz=['Hinweis „Kein Datensatz im Datenpool zu <Vorgang-Lfd-Nr>“ am Vorgang', 'Weiterleitung an den in der PDD benannten Postkorb (noch TBD)',
               'Keine Hostzugriffe, keine Notiz'], ergebnis='Weiterleitung mit Hinweis, Postkorb TBD', deckt=['Kein Datensatz im Datenpool']),
 tf(id='TF-TE-02', gruppe='TE', titel='Keine Doppelverarbeitung', prio='Muss', weg='B', vnr='V-01', kapitel='Details zum Startereignis',
    ziel_text='Ein Vorgang mit bereits verarbeiteter Vorgang-Lfd-Nr wird nicht erneut verarbeitet.',
    weg_b='Vorgang aus TF-GL-02 nach der Verarbeitung erneut in den Startpostkorb legen oder den Bot ein zweites Mal auf denselben Bestand laufen lassen.',
    ablauf=[('Start', 'Vorgang-Lfd-Nr bereits verarbeitet → übersprungen', 'aus')],
    akzeptanz=['Keine zweite Telefonnotiz und kein zweiter Bearbeitungshinweis zur selben Vorgang-Lfd-Nr', 'Kein zweiter Reporteintrag „Completed“'],
    ergebnis='kein zweiter Lauf', deckt=['Keine Doppelverarbeitung']),
 tf(id='TF-TE-03', gruppe='TE', titel='Unerwartete Maske in IS011 (System Exception)', prio='Kann', weg='B', vnr='V-01', kapitel='I',
    ziel_text='Liefert IS011 weder Trefferliste noch Stammdaten, bricht der Bot mit System Exception ab; der Vorgang bleibt im Themenpostkorb.',
    weg_b='Robotics provoziert eine Fehlermaske in IS011 (z. B. Sperre oder Berechtigungsfehler).',
    ablauf=[('Vorprüfung', 'ohne Befund', 'ok'), ('I. Kunde (IS011)', 'Fehlermaske → System Exception, Abbruch', 'be')],
    akzeptanz=['Vorgang liegt unbearbeitet im Startpostkorb ' + PK_START, 'Keine Notiz, kein Bearbeitungshinweis', 'System Exception im Botprotokoll mit Maskenname'],
    ergebnis='System Exception, Vorgang unbearbeitet im Startpostkorb', deckt=['System Exception bei unerwarteter Maske']),
]

# ------------------------------------------------------------------ Herleitung: was die PDD verlangt und wie es gebuendelt ist
GLATT_MERKMALE = ['Notiz BOT2011 (KV)', 'Notiz 1515 (Komposit/Leben)', 'Bearbeitung nach: Mit BÜ-Wunsch',
                  'Bearbeitung nach: Untervollmacht fehlt', 'Folgearbeit für Komposit gesetzt', 'Umfang Gesamt', 'Weitere VNR nachrichtlich in der Notiz',
                  'E-Mail aus Sonderliste TOP-Makler', 'E-Mail aus OB729', 'E-Mail = Absender', 'PNR aufgefüllt auf 7 Stellen',
                  'Vermittlertyp MFA', 'Juristische Person ohne Geburtsdatum']
ROUTING = ['Routing HSB4 K 72', 'Routing HSB4 K MV', 'Routing HSB4 K KO', 'Routing ODPP1 D']
TECHNIK = ['Kein Datensatz im Datenpool', 'Keine Doppelverarbeitung', 'System Exception bei unerwarteter Maske']
SUCHE = ['Mehrfachtreffer in IS011', 'Zweite Matchcodesuche ohne Geburtsdatum']
HERLEITUNG = [
 ('Harte Business Exceptions (Vorprüfung bis Kapitel IV)', BE_LISTE[:-1],
  'Jede harte BE beendet den Vorgang – je BE ein eigener Vorgang auf einer VNR. Dazu der zweite Auslöser von „Keine Zusammenarbeit“ (GH040) als Soll.'),
 ('Prüfnotizen der Fehlerliste (→ BE „Nachprüfung erforderlich“)', NOTIZ_LISTE + ['Nachprüfung erforderlich'],
  'Der Bot prüft nach einer Prüfnotiz weiter und sammelt – viele Ausprägungen passen in einen Vorgang. Zwei Sammeltests, weil sich je zwei Ausprägungen ausschließen.'),
 ('Glattfall als Gegenprobe: Notiz ohne Befund', GLATT_MERKMALE,
  'Je zwei Fälle für KV (Makler, Mehrfachagent) und Non-KV (Pool mit und ohne Untervollmacht) – sie zeigen, dass ohne Befund keine BE entsteht und die Notiz stimmt; '
  'die Notizvarianten laufen darin mit.'),
 ('Zielpostkörbe (Routing)', ROUTING, 'Keine eigenen Fälle: Jeder Zielpostkorb wird von einem Fall erreicht, den es ohnehin gibt.'),
 ('Kundensuche in IS011', SUCHE, 'Zweite Suche ohne Geburtsdatum läuft in den Fällen mit falschem Geburtsdatum mit; Mehrfachtreffer und Folgeseite brauchen einen passenden Kunden (Soll).'),
 ('Startereignis und Betrieb', TECHNIK, 'Nicht über eine Mail herstellbar: je ein Fall über Weg B.'),
]


def herleitung():
    out = []
    for name, items, prinzip in HERLEITUNG:
        tfs = [t['id'] for t in TESTFAELLE if set(t['deckt']) & set(items)]
        out.append(dict(name=name, anzahl=len([x for x in items if x != 'Nachprüfung erforderlich']), testfaelle=tfs, prinzip=prinzip, items=items))
    return out


# ------------------------------------------------------------------ Was der Bot bis zum Ausstieg wirklich braucht
def erreicht(t):
    """Kapitel, die der Bot in diesem Testfall durchlaeuft (Status ungleich 'nicht durchlaufen')."""
    namen = {name: key for key, name in KAPITEL}
    r = {namen[n] for n, _, st in t['ablauf'] if n in namen and st != 'aus'}
    if not r:  # eigener Ablauf ohne Kapitelnamen
        r = {'VP', 'I', 'II', 'III', 'EM', 'IV'} if t['gruppe'] != 'TE' else set()
    return r


def relevanz(t):
    r = erreicht(t)
    return {'vertrag': bool(r & {'I', 'II', 'IV'}), 'agentur_host': bool(r & {'III', 'EM'})}


# ------------------------------------------------------------------ Durchfuehrung je Testfall
def schritte(t):
    m = MAIL.get(t['mail'].split(' ')[0])
    ag = t['agentur']
    vor = ['Testdaten bereit: %s%s; konkrete Werte im Blatt „Testdaten“ eingetragen.' % (
        ', '.join('Vertrag ' + v for v in t['vnr'].split('+')), '' if ag == 'keine' else ', Agentur %s mit EMMA-Eintrag' % ag)]
    a_weg = []
    if m:
        a_weg = ['Testmail %s erstellen: Absender %s; Betreff „%s“; Anhang: %s. Platzhalter mit den Werten aus Schritt 1 füllen.' % (m[0], m[2], m[3], m[5]),
                 'Mail an das Abnahme-Postfach senden; Celonis liefert den Datensatz und EMWS den Postkorbvorgang je VNR.',
                 'Datensatz im Datenpool gegen die Soll-Werte prüfen – Vorbedingung, kein Testgegenstand. Weicht er ab, nach Weg B korrigieren.']
    b_weg = ['Weg B: Postkorbvorgang zur VNR mit Datensatz bereitstellen (Standardvorgang, Übergabe an EMWS angehalten); im Datensatz setzen: ' +
             ('; '.join('%s = %s' % (f, w) for _, f, w, h in t['dp_soll'] if h) or 'keine Änderung') + '. Danach EMWS-Übergabe starten.'] if 'B' in t['weg'] else []
    if t['weg_b']:
        b_weg = ['Weg B: ' + t['weg_b']]
    nach = ['Postkorbvorgang im Startpostkorb ' + PK_START + ' prüfen und Vorgang-Lfd-Nr notieren.', 'Prüf-Bot-Lauf abwarten bzw. durch Robotics starten lassen.',
            'Ergebnis gegen die Akzeptanzkriterien prüfen; Screenshots von Notiz bzw. Bearbeitungshinweis und Zielpostkorb ablegen; Status eintragen.']
    if t['weg'].startswith('B'):
        return vor + b_weg + nach
    return vor + a_weg + b_weg + nach


# ------------------------------------------------------------------ Testdatenbedarf
def bedarf():
    pflicht_v = [v for v in VERTRAEGE if v[1]]; pflicht_a = [a for a in AGENTUREN if a[1]]
    kunden_p = sorted({v[3] for v in pflicht_v})
    nutz_v = {v[0]: [t['id'] for t in TESTFAELLE if v[0] in t['vnr'].split('+')] for v in VERTRAEGE}
    nutz_a = {a[0]: [t['id'] for t in TESTFAELLE if t['agentur'] == a[0]] for a in AGENTUREN}
    nur_mail = [t['id'] for t in TESTFAELLE if t['vnr'] == 'V-01' and t['agentur'] in ('A-01', 'keine')]
    weg_b = [t['id'] for t in TESTFAELLE if t['weg'].startswith('B')]
    muss = [t for t in TESTFAELLE if t['prio'] == 'Muss']
    muss_ok = all(all(VERTRAG[v][1] for v in t['vnr'].split('+')) and (t['agentur'] in ('keine',) or AGENTUR[t['agentur']][1] or 'B' in t['weg']) for t in muss)
    return dict(pflicht_v=pflicht_v, pflicht_a=pflicht_a, kunden_p=kunden_p, nutz_v=nutz_v, nutz_a=nutz_a, nur_mail=nur_mail, weg_b=weg_b, muss_ok=muss_ok)


# ------------------------------------------------------------------ Abnahmekriterien (Vorschlag)
ABNAHME = [
 ('Testfälle', 'Alle Muss-Testfälle bestanden; Soll-Testfälle zu mindestens 90 % bestanden, offene Soll-Testfälle mit Workaround und Termin; Kann-Testfälle informativ.'),
 ('Abdeckung', 'Jede BE-Klassifikation und jede Prüfnotiz der PDD ist mindestens einmal erfolgreich nachgewiesen (Blatt „Abdeckung“).'),
 ('Keine Durchrutscher', 'Kein Vorgang, für den die PDD eine BE oder Prüfnotiz vorsieht, geht ohne Befund an den 72-Stunden-BOT (Fehlerklasse 1).'),
 ('Texte', 'BE-Klassifikationen und Prüfnotizen stehen wörtlich wie in den Wertelisten der PDD im Bearbeitungshinweis; Aufbau „BE:“, „Fehler:“, „Hinweis:“ eingehalten.'),
 ('Routing', 'Jeder Vorgang landet im richtigen Themenpostkorb: ohne Befund HSB4 K 72; mit Befund KV HSB4 K MV, Komposit/Leben nach Vertriebskanal HSB4 K KO oder ODPP1 D.'),
 ('Notiz', 'In jedem Glattfall sind alle Pflichtfelder der Notiz korrekt bestückt (Vorlage BOT2011 bzw. 1515), „Betroffene VNR“ immer „angegebene VNR beachten“.'),
 ('Nur lesend', 'Keine schreibenden Hostzugriffe außer Telefonnotiz, Bearbeitungshinweis und Weiterleitung; keine Änderung an Partner-, Vertrags- oder Vermittlerdaten.'),
 ('Vollständigkeit', 'Kein Vorgang bleibt unbearbeitet, außer bei System Exceptions mit Protokolleintrag; keine Doppelverarbeitung derselben Vorgang-Lfd-Nr.'),
 ('Reporting', 'Jeder Vorgang erscheint im Report mit Status „Completed“ oder „Referred“ und den Tags BE-Klassifikation und Prüfnotizen.'),
 ('Nachweis', 'Je Testfall sind Tester, Datum, Vorgang-Lfd-Nr, Ist-Ergebnis und ein Screenshot von Notiz bzw. Bearbeitungshinweis und Zielpostkorb dokumentiert.'),
]
FEHLERKLASSEN = [
 ('1 – kritisch', 'Falsches Prüfergebnis (Durchrutscher ohne Befund, falsche harte BE), Datenänderung im Host, Absturz ohne Protokoll', 'blockiert die Abnahme'),
 ('2 – hoch', 'Falsches Routing, Notiz unvollständig oder mit falschem Wert, Prüfnotiz fehlt', 'blockiert, außer Workaround ist vereinbart'),
 ('3 – mittel', 'Textabweichung im Bearbeitungshinweis, Formatabweichung (Datum, PNR), fehlender Report-Tag', 'Abnahme mit Nachbesserungstermin'),
 ('4 – gering', 'Kosmetik im Protokoll, Laufzeit', 'kein Einfluss auf die Abnahme'),
]
DURCHFUEHRUNG = [
 ('Testlauf 1 – Datensatz direkt (Weg B)', 'Alle Testfälle je VNR mit gesetztem Datensatz; schnell, jeder Fall gezielt herstellbar.'),
 ('Testlauf 2 – Datensatz über Testmail (Weg A)', 'Die Testfälle mit Weg A über Testmails an das Abnahme-Postfach. Celonis liefert nur den Datensatz – geprüft wird weiter der '
  'Prüf-Bot; die Celonis-Extraktion ist nicht Gegenstand dieses Katalogs.'),
 ('Regression', 'Nach jeder Botänderung alle Muss-Testfälle erneut (Weg B).'),
]
ANNAHMEN = [
 'Der Prüf-Bot schreibt nur Notiz, Bearbeitungshinweis und Weiterleitung – dieselbe VNR ist für beliebig viele Testfälle nutzbar.',
 '72-Stunden-BOT und BÜ-BOT verarbeiten die Testvorgänge in der Abnahme nicht (oder erst nach Testende); sonst ändert sich der Bestandsinhaber der Test-VNR.',
 'Für dieselbe VNR lassen sich mehrere Postkorbvorgänge nacheinander eröffnen (keine Dublettensperre auf die VNR) – mit Robotics und Celonis zu bestätigen.',
 'Nur Weg A: Celonis findet den Makler im EMMA-Abzug über Signatur, Vollmachtnehmer bzw. Agenturnummer im Text; die Testmails tragen diese Angaben passend zur gewählten Agentur.',
 'Der EMMA-Typ der Testagentur A-05 lässt sich in der Abnahme zwischen zwei Läufen umstellen (Courtagefortzahler, dann Kontaktgeber); liest Celonis einen festen Abzug, '
 'wird er nach der Umstellung neu gezogen. Geht das nicht, laufen TF-VP-01 und TF-VP-02 über Weg B.',
]


def pruefe_abdeckung():
    gedeckt = {d for t in TESTFAELLE for d in t['deckt']}
    fehlt = [x for x in BE_LISTE + NOTIZ_LISTE + MERKMALE if x not in gedeckt]
    unbekannt = sorted({d for d in gedeckt if d not in BE_LISTE + NOTIZ_LISTE + MERKMALE})
    return fehlt, unbekannt


def verwendet_in(bid):
    if bid.startswith('V-'):
        return [t['id'] for t in TESTFAELLE if bid in t['vnr'].split('+')]
    if bid.startswith('A-'):
        return [t['id'] for t in TESTFAELLE if t['agentur'] == bid]
    if bid.startswith('M-'):
        return [t['id'] for t in TESTFAELLE if bid in t['mail'].replace('+', ' ').split()]
    if bid.startswith('P-'):
        return [t['id'] for t in TESTFAELLE if any(m in MAIL and MAIL[m][2].startswith(bid) for m in t['mail'].replace('+', ' ').split())]
    return []


if __name__ == '__main__':
    f, u = pruefe_abdeckung()
    ids = [t['id'] for t in TESTFAELLE]; assert len(ids) == len(set(ids))
    b = bedarf()
    print('Testfälle:', len(TESTFAELLE), '| Muss', sum(t['prio'] == 'Muss' for t in TESTFAELLE), 'Soll', sum(t['prio'] == 'Soll' for t in TESTFAELLE),
          'Kann', sum(t['prio'] == 'Kann' for t in TESTFAELLE), '| fehlt:', f, '| unbekannt:', u)
    print('Pflicht-VNR', len(b['pflicht_v']), 'bei Kunden', b['kunden_p'], '| Pflicht-Agenturen', len(b['pflicht_a']), '| Muss nur mit Pflichtdaten:', b['muss_ok'])
    print('nur Mail/Vollmacht auf V-01 + A-01:', len(b['nur_mail']), '| Weg B:', len(b['weg_b']))
    for k, v in b['nutz_v'].items(): print(k, len(v), v)
    for k, v in b['nutz_a'].items(): print(k, len(v), v)
    for t in TESTFAELLE:
        if t['prio'] == 'Muss':
            for v in t['vnr'].split('+'):
                if not VERTRAG[v][1]: print('Muss mit optionaler VNR:', t['id'], v)
            if t['agentur'] in AGENTUR and not AGENTUR[t['agentur']][1] and 'B' not in t['weg']: print('Muss mit optionaler Agentur:', t['id'])
