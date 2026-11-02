# -*- coding: utf-8 -*-
"""Blatt "Feldliste": lesbare Fassung im Format der Abstimmungsliste.

Aufbau, Reihenfolge und Feldbezeichnungen folgen dem aktuellen KI-Deckblatt
(Maklerantrag-Zusammenfassung, Abschnitte Kopfzeile / Kunde & Vertrag / Makler /
Klassifikation & Vorgang / Maklervollmacht & Unterschriften / Ergebnis).
Auspraegungen und Beispiele stammen aus DatenfelderKIDeckblatt.xlsx.
Felder des Deckblatts, die nicht im Datenpool beantragt werden (gestrichene Felder,
Badges der Kopfzeile, Freitext des Ergebnisblocks), stehen ohne Nummer und grau.
"""
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# Deckblatt-Abschnitt, Deckblatt-Feld (Bezeichnung wie im aktuellen Deckblatt),
# Datenpool-Feldname bzw. None, Quelle im DatenfelderKIDeckblatt.xlsx, Bemerkung
KOPF = 'Kopfzeile'
KUND = 'Kunde & Vertrag'
MAKL = 'Makler'
KLAS = 'Klassifikation & Vorgang'
MVUS = 'Maklervollmacht & Unterschriften'
ERGB = 'Ergebnis'
UNTA = 'Unterlagenanforderung'

# Zusatz nur in der Abschnittszeile
BLOCKTEXT = {UNTA: 'Unterlagenanforderung – neu, noch nicht im Deckblatt enthalten'}

STRUKTUR = [
    (KOPF, 'Lfd-Nr',                    None, None,
     'Im Deckblatt gestrichen – technischer Schlüssel des Deckblatts, für den Datenpool nicht benötigt.'),
    (KOPF, 'Status (Ampel)',            None, None,
     'Im Deckblatt gestrichen – Anzeigelogik des Deckblatts, kein eigener Dateninhalt.'),
    (KOPF, 'Typ',                       'BUE_VERMITTLER_TYP', 'Typ', None),
    (KOPF, 'Klassifikation',            None, None,
     'Wiederholung als Badge – Inhalt kommt aus BUE_KLASSIFIKATION.'),
    (KOPF, 'Maklervollmacht',           None, None,
     'Wiederholung als Badge – Inhalt kommt aus BUE_MV_STATUS.'),

    (KUND, 'Nachname',                  'BUE_KUNDE_NACHNAME', 'Kunde_Nachname', None),
    (KUND, 'Vorname',                   'BUE_KUNDE_VORNAME', 'Kunde_Vorname', None),
    (KUND, 'Geburtsdatum',              'BUE_KUNDE_GEBDAT', 'Geburtsdatum VN',
     'Im aktuellen Deckblatt-Template wird ein Zeitstempel ausgegeben (Beispiel 869443200000). '
     'Für den Datenpool ist das Datum als TT.MM.JJJJ zu liefern.'),
    (KUND, 'Straße',                   'BUE_KUNDE_STRASSE', 'Kunde_Strasse', None),
    (KUND, 'PLZ',                       'BUE_KUNDE_PLZ', 'Kunde_PLZ', None),
    (KUND, 'Ort',                       'BUE_KUNDE_ORT', 'Kunde_Ort', None),
    (KUND, 'Versicherungsnummer',       'BUE_VNR', 'Versicherungsnummer',
     'Neu in V1.3 – Normierung nach Abstimmung Maklerservice/ODPB/Celonis vom 08.09.2026.'),
    (KUND, 'Versicherungsnummer 2',     'BUE_VNR_2', None,
     'Neu in V1.4 – Ersatzfeld nach Freigabe N. Garcia-Fernandez vom 09.09.2026, damit keine VNR abgeschnitten wird; ab V1.6 ohne Abgleich gegen die Vorgangs-VNR.'),
    (KUND, 'Sparte',                    'BUE_SPARTE', 'Sparte',
     'Neu in V1.3 – Ableitung und Ersatzregeln nach derselben Abstimmung.'),
    (KUND, 'Nachname MV',               'BUE_MV_VN_NACHNAME', 'MV_VN_Nachname', None),
    (KUND, 'Vorname MV',                'BUE_MV_VN_VORNAME', 'MV_VN_Vorname', None),

    (MAKL, 'Pool',                      'BUE_POOL', 'Pool', None),
    (MAKL, 'Vermittler',                'BUE_VERMITTLER_NAME', 'Vermittler', None),
    (MAKL, 'Agentur-Nr',                'BUE_AGENTUR_NR', 'Agentur-Nr', None),
    (MAKL, 'Vermittlernummer',          'BUE_VERMITTLER_NR', 'Personalnummer', None),
    (MAKL, 'E-Mail',                    'BUE_MAKLER_EMAIL', 'Makler_E-Mail', None),
    (MAKL, 'Straße',                   'BUE_MAKLER_STRASSE', 'Makler_Strasse', None),
    (MAKL, 'PLZ',                       'BUE_MAKLER_PLZ', 'Makler_PLZ', None),
    (MAKL, 'Ort',                       'BUE_MAKLER_ORT', 'Makler_Ort', None),

    (KLAS, 'Vorgangstyp',               None, None,
     'Im Deckblatt gestrichen – die Sparten- und Vorgangssteuerung erfolgt über den Postkorb.'),
    (KLAS, 'Klassifikation',            'BUE_KLASSIFIKATION', 'Klassifikation', None),
    (KLAS, 'BÜ-Wunsch vorhanden',      'BUE_WUNSCH_VORHANDEN', 'BÜ-Wunsch vorhanden', None),
    (KLAS, 'Umfang der BÜ',             'BUE_UMFANG', None,
     'Geändert in V1.6 – nur noch Einzel und Gesamt; entspricht dem Merkmal „Betroffene VNR“ der Telefonnotiz 1515; im Deckblatt noch nicht enthalten.'),
    (KLAS, 'Prüfung Unterlagen',       'BUE_PRUEFUNG_UNTERLAGEN', 'Prüfung Unterlagen', None),
    (KLAS, 'Reminder/Wiedervorlage',    'BUE_REMINDER', 'Reminder/Wiedervorlage', None),

    (MVUS, 'MV enthalten',              'BUE_MV_ENTHALTEN', 'MV enthalten', None),
    (MVUS, 'MV-Status',                 'BUE_MV_STATUS', 'MV-Status', None),
    (MVUS, 'MV auf Makler ausgestellt', 'BUE_MV_AUF_MAKLER', 'MV auf Makler ausgestellt', None),
    (MVUS, 'MV vollumfänglich',        'BUE_MV_VOLLUMFAENGLICH', 'MV vollumfänglich', None),
    (MVUS, 'Unterschrift Kunde',        'BUE_MV_UNTERSCHRIFT_KUNDE', 'Unterschrift Kunde', None),
    (MVUS, 'Untervollmacht erteilt',    'BUE_UV_ERTEILT', 'Untervollmacht erteilt', None),  # eigene Auspraegungen, siehe EIGEN
    (MVUS, 'Unterschriftsdatum',        'BUE_MV_UNTERSCHRIFTSDATUM', 'MV_Unterschriftsdatum', None),
    (MVUS, 'Eingangsdatum',             'BUE_MV_EINGANGSDATUM', 'MV_Eingangsdatum', None),

    (ERGB, 'Zusammenfassung',           None, None,
     'Freitext der KI, Länge nicht begrenzt – die Datenpool-Felder sind auf 50 Zeichen festgelegt. '
     'Der Prüf-Bot wertet den Text nicht aus; er bleibt im Deckblatt.'),
    (ERGB, 'Hinweis',                   None, None,
     'Freitext der KI, wie Zusammenfassung nicht im Datenpool. Die prüfrelevanten Inhalte '
     'stehen in den Einzelfeldern.'),

    (UNTA, 'Anforderung Unterlagen',    'BUE_ANF_UNTERLAGEN', None, None),
    (UNTA, 'Art der Unterlagen',        'BUE_ART_UNTERLAGEN', None, None),
]

# Auspraegungen fuer Felder ohne Zeile im DatenfelderKIDeckblatt.xlsx
EIGEN = {
    'BUE_UV_ERTEILT':     ('Werteliste', 'ja | nein | N/A. N/A bei Typ MFA (Untervollmacht entfällt). „ja“ nur, wenn alle drei Kriterien erfüllt sind: 1. es liegt eine Untervollmacht bzw. ein Unterbevollmächtigter vor, 2. der Unterbevollmächtigte ist namentlich benannt, 3. aus den Unterlagen ist erkennbar, dass die Bestandsübertragung an genau diesen Unterbevollmächtigten erfolgen soll. Sonst „nein“; welche Kriterien nicht erfüllt sind, steht im Feld „Hinweise“ des Deckblatts.', 'ja'),
    'BUE_VNR':            ('Text (50)', 'Normierte Versicherungsnummer: 2 Buchstaben Spartenkürzel + 9 Ziffern = 11 Zeichen; '
                                        'kürzere Zahlenfolgen werden links mit Nullen aufgefüllt, Sonderzeichen und alles danach '
                                        '(. ; -) entfallen. Mehrere Versicherungsnummern semikolongetrennt. Ist keine normierbare '
                                        'VNR ermittelbar: „Manuelle Prüfung VNR/Sparte“. Der Prüf-Bot arbeitet mit der VNR, '
                                        'mit der Celonis den Postkorbvorgang eröffnet hat; BUE_VNR wird nicht dagegen abgeglichen, '
                                        'sondern führt nachrichtlich alle im Auftrag genannten Nummern für den Bearbeitungshinweis.',
                           'SV003456789; KV012345678'),
    'BUE_VNR_2':          ('Text (50)', 'Weitere normierte Versicherungsnummern im Format von BUE_VNR, semikolongetrennt; '
                                        'wird befüllt, sobald BUE_VNR voll ist. Leer, wenn alle Nummern in BUE_VNR passen. '
                                        'Wie BUE_VNR ohne Abgleich gegen die VNR des Postkorbvorgangs.',
                           'LF070902206; SV023456789'),
    'BUE_SPARTE':         ('Text (50)', 'Spartenkürzel aus den ersten beiden Zeichen der normierten Versicherungsnummer, '
                                        'mehrere semikolongetrennt in gleicher Reihenfolge wie BUE_VNR. Zulässig: SV, DA, UP, RS, HP, '
                                        'HA, HR, AS, WG, SB, UV, ER, GU, HG, V, IT (Komposit), KV (Gesundheit), LF, LV, R, T, FL '
                                        '(Leben). Ohne Kürzel in der VNR wird es aus den Dokumenten im Kontext des Wortes „Sparte“ '
                                        'ergänzt, bei Absender kranken@fondsfinanz.de wird KV gesetzt. Sonst: „Manuelle Prüfung '
                                        'VNR/Sparte“.',
                           'SV; KV'),
    'BUE_UMFANG':         ('Werteliste', 'Einzel | Gesamt. Einzel = Übertragung der genannten Versicherungsnummer. '
                                         'Gesamt = Übertragung der gesamten Kundenverbindung, vorbehaltlich eines Tests zur '
                                         'parallelen Bearbeitung mehrerer Vorgänge durch den BÜ-Bot. Nennt der Auftrag mehrere '
                                         'Versicherungsnummern, eröffnet Celonis je Nummer einen eigenen Postkorbvorgang mit '
                                         'derselben E-Mail und einer eigenen führenden VNR; jeder dieser Vorgänge trägt „Einzel“, '
                                         'bei zusätzlicher Nennung der gesamten Kundenverbindung „Gesamt“. Der Wert wird in der '
                                         'Notiz unter „Betroffene VNR“ übernommen.',
                           'Einzel'),
    'BUE_MV_ENTHALTEN':   ('Werteliste', 'ja | nein | N/A. N/A bei Typ MFA (keine Maklervollmacht erforderlich).', 'ja'),
    'BUE_ANF_UNTERLAGEN': ('Werteliste', 'ja | nein', 'ja'),
    'BUE_ART_UNTERLAGEN': ('Text', 'Freitext, mehrere Angaben mit Semikolon getrennt. '
                                   'Feldlänge 50 Zeichen ist zu prüfen. Vorschlag V1.2: feste Ausprägungen entlang der '
                                   'Kennzeichen der Notiz 1515 (Police/Vertragsspiegel/Vertragsauszug/Ersatzrechnung; '
                                   'Schadenaufstellung/Schadenrenta; Sonstige Unterlagen) plus Freitext, in Abstimmung mit ODPBD/MSU.',
                           'Police; Schadenaufstellung'),
}

NA_ZUSATZ = {'BUE_MV_STATUS', 'BUE_MV_VOLLUMFAENGLICH'}
LAENGE = {'BUE_KUNDE_PLZ': 5, 'BUE_MAKLER_PLZ': 5, 'BUE_AGENTUR_NR': 9, 'BUE_VERMITTLER_NR': 6}

ROT    = Font(bold=True, size=14, color='C00000')
BLAU   = PatternFill('solid', fgColor='1F3864')
ORANGE = PatternFill('solid', fgColor='ED7D31')
BLOCK  = PatternFill('solid', fgColor='DAEEF3')
GRAU   = PatternFill('solid', fgColor='F2F2F2')
RAHMEN = Border(*[Side(style='thin', color='BFBFBF')] * 4)


def datentyp(name, auspraegung):
    if name in LAENGE:
        return 'Text (%d)' % LAENGE[name]
    a = auspraegung or ''
    if 'TT.MM.JJJJ' in a:
        return 'Datum'
    if '|' in a:
        return 'Werteliste'
    return 'Text'


def erzeuge(wb, deckblatt_datei):
    src = openpyxl.load_workbook(deckblatt_datei, data_only=True)['Datenfelder']
    quelle = {}
    for r in src.iter_rows(min_row=7, values_only=True):
        abschnitt, feld, ausp, beispiel = r[0], r[1], r[3], r[4]
        if feld and (abschnitt != 'Kopfzeile' or feld == 'Typ'):
            quelle.setdefault(feld, ((ausp or '').replace('\n', ' '), beispiel or ''))

    if 'Feldliste' in wb.sheetnames:
        del wb['Feldliste']
    ws = wb.create_sheet('Feldliste', 1)

    ws['A1'] = 'Datenfelder für den ERGO-Datenpool – Vorschlag zur Anlage (V1.6)'
    ws['A1'].font = ROT
    ws['A2'] = ('Aufbau, Reihenfolge und Feldbezeichnungen nach dem aktuellen KI-Deckblatt. '
                'Feldnamen-Konvention laut Input Management: Präfix BUE_, Großbuchstaben, '
                'keine Umlaute oder Leerzeichen, max. 25 Zeichen, Feldlänge 50. '
                'Grau hinterlegte Zeilen sind Deckblatt-Felder ohne eigenes Datenpool-Feld.')
    ws['A2'].font = Font(size=9, italic=True)

    kopf = ['Nr', 'Deckblatt-Abschnitt', 'Deckblatt-Feld', 'Datenpool-Feldname (Vorschlag)',
            'Datentyp', 'Ausprägungen / Format', 'Beispiel / Bemerkung']
    ws.append([])
    ws.append(kopf)
    kopfzeile = ws.max_row
    for i, c in enumerate(ws[kopfzeile], 1):
        c.font = Font(bold=True, color='FFFFFF', size=11)
        c.fill = ORANGE if i == 4 else BLAU
        c.alignment = Alignment(vertical='center', wrap_text=True)
    ws.row_dimensions[kopfzeile].height = 28

    nr, vorheriger = 0, None
    for abschnitt, feld, name, quellfeld, bemerkung in STRUKTUR:
        if abschnitt != vorheriger:
            ws.append(['', BLOCKTEXT.get(abschnitt, abschnitt)])
            for c in ws[ws.max_row]:
                c.fill = BLOCK
                c.font = Font(bold=True, size=10)
            vorheriger = abschnitt

        if name is None:
            ws.append(['', abschnitt, feld, '-', '-', bemerkung or '', ''])
            for c in ws[ws.max_row]:
                c.alignment = Alignment(vertical='top', wrap_text=True)
                c.border = RAHMEN
                c.fill = GRAU
                c.font = Font(size=10, italic=True, color='595959')
            continue

        if name in EIGEN:
            typ, ausp, beispiel = EIGEN[name]
            if name in LAENGE:
                typ = 'Text (%d)' % LAENGE[name]
        else:
            ausp, beispiel = quelle[quellfeld]
            if name in NA_ZUSATZ: ausp = ausp + ' | N/A (bei Typ MFA)'
            typ = datentyp(name, ausp)
        if bemerkung:
            beispiel = ('%s – %s' % (beispiel, bemerkung)).strip(' –')

        nr += 1
        ws.append([nr, abschnitt, feld, name, typ, ausp, beispiel])
        for i, c in enumerate(ws[ws.max_row], 1):
            c.alignment = Alignment(vertical='top', wrap_text=True)
            c.border = RAHMEN
            if i == 4:
                c.font = Font(bold=True, size=10)

    for spalte, breite in zip('ABCDEFG', (5, 24, 26, 30, 13, 50, 34)):
        ws.column_dimensions[spalte].width = breite
    ws.freeze_panes = 'A%d' % (kopfzeile + 1)
    return nr
