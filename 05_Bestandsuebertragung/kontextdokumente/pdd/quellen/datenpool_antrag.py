# -*- coding: utf-8 -*-
"""Fuellt das ITERGO-Datenpool-Template mit den BUE_-Feldern.

Vorgaben aus der Mail von Bastian Roth (21.08.2026):
- auszufuellen sind VERW_SYS_SL, GEVO_NR oder DOK_TYP_NR, ICR_FLD_NAME, Feld_Format
- ICR_FLD_NAME: max. 25 Zeichen, keine Sonderzeichen, Umlaute, Satzzeichen, Leerzeichen
- Feld_Format: CH = Text, NU = Zahl, DA = Datum, JN = Boolean; Feldlaenge immer 50
- Gesundheit: VERW_SYS_SL = KV, Schluessel ueber DOK_TYP_NR
- Komposit/Leben: alle VERW_SYS_SL mit GeVo-Nr, Schluessel ueber GEVO_NR
- jedes Feld wird je VERW_SYS_SL- und GeVo/DOK_TYP_NR-Kombination separat angelegt
"""
import sys, openpyxl
from copy import copy

# (ICR_FLD_NAME, Feld_Format)
FELDER = [
    ('BUE_VERMITTLER_TYP', 'CH'), ('BUE_KUNDE_NACHNAME', 'CH'), ('BUE_KUNDE_VORNAME', 'CH'),
    ('BUE_KUNDE_GEBDAT', 'DA'), ('BUE_KUNDE_STRASSE', 'CH'), ('BUE_KUNDE_PLZ', 'CH'),
    ('BUE_KUNDE_ORT', 'CH'), ('BUE_VNR', 'CH'), ('BUE_VNR_2', 'CH'), ('BUE_SPARTE', 'CH'),
    ('BUE_MV_VN_NACHNAME', 'CH'), ('BUE_MV_VN_VORNAME', 'CH'), ('BUE_POOL', 'CH'),
    ('BUE_VERMITTLER_NAME', 'CH'), ('BUE_AGENTUR_NR', 'CH'), ('BUE_VERMITTLER_NR', 'CH'),
    ('BUE_MAKLER_EMAIL', 'CH'), ('BUE_MAKLER_STRASSE', 'CH'), ('BUE_MAKLER_PLZ', 'CH'),
    ('BUE_MAKLER_ORT', 'CH'), ('BUE_KLASSIFIKATION', 'CH'), ('BUE_WUNSCH_VORHANDEN', 'JN'), ('BUE_UMFANG', 'CH'),
    ('BUE_PRUEFUNG_UNTERLAGEN', 'CH'), ('BUE_REMINDER', 'JN'), ('BUE_MV_ENTHALTEN', 'CH'),
    ('BUE_MV_STATUS', 'CH'), ('BUE_MV_AUF_MAKLER', 'CH'), ('BUE_MV_VOLLUMFAENGLICH', 'CH'),
    ('BUE_MV_UNTERSCHRIFT_KUNDE', 'CH'), ('BUE_UV_ERTEILT', 'CH'),
    ('BUE_MV_UNTERSCHRIFTSDATUM', 'DA'), ('BUE_MV_EINGANGSDATUM', 'DA'),
    ('BUE_ANF_UNTERLAGEN', 'JN'), ('BUE_ART_UNTERLAGEN', 'CH'),
]

# (VERW_SYS_SL, GEVO_NR, DOK_TYP_NR, Hinweis)
# Schluessel (Stand 21.09.2026): voller Satz wie in V1.6, dazu die Verwaltungssystem-
# schluessel fuer Komposit.
#   Komposit / Leben : GeVo 108 "Bestandsuebertragung" und GeVo 469, je Verwaltungssystem
#                      ein eigener Block - LF fuer Leben, dazu alle Obersparten der
#                      Komposit-Welt: AS, DA, HA, IT, KR, SV, TR, UV (M. Koch, 22.09.2026)
#   KV / Gesundheit  : ID 02015 "Maklervollmacht" und ID 06065 "Betreuung / Anfrage Betreuung"
# GeVo 469 und ID 06065 (Betreuung / Anfrage Betreuung) sind Schluessel des BUE-Reportings
# (Fachkonzept v2, 29.06.2026) und bleiben auch im Datenpool-Antrag (Entscheidung 21.09.2026).
# Schluesselart laut Input Management: DOK_TYP_NR bei KV, GEVO_NR bei Komposit/Leben.
KOMPOSIT = ['AS', 'DA', 'HA', 'IT', 'KR', 'SV', 'TR', 'UV']

KOMBIS = ([('KV', None, '02015', 'Gesundheit: Dokumenttyp Maklervollmacht.'),
           ('KV', None, '06065', 'Gesundheit: Dokumenttyp Betreuung / Anfrage Betreuung.'),
           ('LF', 108, None, 'Leben: GeVo 108 Bestandsuebertragung.'),
           ('LF', 469, None, 'Leben: GeVo 469.')]
          + [(s, g, None, f'Komposit Obersparte {s}: GeVo {g}. Ergaenzt am 22.09.2026.')
             for s in KOMPOSIT for g in (108, 469)])


def build(template, out):
    wb = openpyxl.load_workbook(template)
    ws = wb['Daten']
    proto = [copy(ws.cell(row=2, column=c)._style) for c in range(1, 17)]
    gueltbis = ws.cell(row=2, column=9).value

    r = 2
    for verw, gevo, doktyp, hinweis in KOMBIS:
        for name, fmt in FELDER:
            assert len(name) <= 25 and name.replace('_', '').isalnum() and name.isupper()
            for c in range(1, 17):
                ws.cell(row=r, column=c)._style = proto[c - 1]
            ws.cell(row=r, column=1, value=verw)
            ws.cell(row=r, column=2, value=gevo)
            ws.cell(row=r, column=3, value=doktyp)
            ws.cell(row=r, column=4, value=name)
            ws.cell(row=r, column=6, value=fmt)
            ws.cell(row=r, column=9, value=gueltbis)
            r += 1

    hw = wb['Hinweise']
    row = 9
    for txt in [
        'Beantragung Pruef-Bot Bestandsuebertragung (Makler BUE meets KI) - Version 1.7, Stand 22.09.2026',
        '',
        'Aenderungen gegenueber Version 1.6:',
        '  Verwaltungssystemschluessel fuer Komposit ergaenzt (Rueckmeldung B. Roth, Input Management 2, 21.09.2026;',
        '  Praezisierung M. Koch, ODPBD, 22.09.2026 mit der Anlage Spartenpraefix.xlsx): Es sind alle Werte der Spalte',
        '  Obersparte moeglich, ausdruecklich auch HA, AS, TR, IT und DA. Der Antrag fuehrt deshalb alle Obersparten',
        '  der Komposit-Welt - AS, DA, HA, IT, KR, SV, TR, UV -, jeweils mit GeVo 108 und 469. Fuer Leben bleibt LF,',
        '  fuer Gesundheit KV. Der Platzhalterblock <VERW_SYS_SL Komposit ergaenzen> entfaellt; OFFEN 1 ist erledigt.',
        '  Schluessel unveraendert gegenueber V1.6: Komposit / Leben GeVo 108 (Bestandsuebertragung) und GeVo 469,',
        '  KV / Gesundheit Dokumenttyp 02015 (Maklervollmacht) und 06065 (Betreuung / Anfrage Betreuung).',
        '  Die am 17.09.2026 erwogene Reduzierung auf je einen Schluessel je Sparte ist damit zurueckgenommen.',
        '  Umfang des Antrags: 35 Felder x 20 Kombinationen, 700 Zeilen. Je Verwaltungssystemschluessel ein Block:',
        '  KV mit Dokumenttyp 02015 und 06065; LF, AS, DA, HA, IT, KR, SV, TR und UV mit GeVo 108 und 469.',
        '  Zum Stand der Lieferung: Die Felder fuer KV und LF stehen im Test (DV/FA) bereits zur Verfuegung.',
        '  BUE_UMFANG (Nachzug PDD-Stand 16.09.2026, Test M. Koch vom 15.09.2026): Vorgaenge mit Gesamt durchlaufen',
        '  alle Pruefschritte, werden danach aber immer als Business Exception Gesamte Kundenverbindung an den',
        '  Themenpostkorb ausgesteuert; nur Einzel mit durchweg positiver Pruefung geht an den 72-Stunden-BOT.',
        '  Das Notizfeld Betroffene VNR erhaelt nur noch angegebene VNR beachten.',
        '',
        'Aenderungen gegenueber Version 1.5 (PDD-Touchpoint 10.09.2026, Vorschlag an Fachbereich und Celonis):',
        '  BUE_UMFANG: Die Auspraegung Mehrere entfaellt; es bleiben Einzel und Gesamt. Nennt eine Makler-Mail',
        '  mehrere Versicherungsnummern, eroeffnet Celonis je Nummer einen eigenen Postkorbvorgang mit derselben',
        '  E-Mail und einer eigenen fuehrenden VNR. Grund: Ein Widerruf oder eine Kuendigung kann nur einen der',
        '  genannten Vertraege betreffen, jede VNR ist daher einzeln und vollstaendig zu pruefen.',
        '  BUE_VNR und BUE_VNR_2 werden nicht mehr gegen die VNR des Postkorbvorgangs abgeglichen; sie fuehren',
        '  nachrichtlich alle im Auftrag genannten Nummern fuer den Bearbeitungshinweis.',
        '  Umfang und Struktur des Antrags bleiben unveraendert: 35 Felder, 6 Kombinationen, 210 Zeilen.',
        '  Status: Bestaetigung durch den Fachbereich und Rueckmeldung zur Umsetzbarkeit bei Celonis stehen aus.',
        '',
        'Aenderungen gegenueber Version 1.4 (Mehrfachagenten, Abstimmung S. Schwarz / M. Koch, Fertig zur Umsetzung):',
        '  BUE_MV_ENTHALTEN, BUE_MV_STATUS, BUE_MV_VOLLUMFAENGLICH und BUE_UV_ERTEILT erhalten die zusaetzliche',
        '  Auspraegung N/A (bei BUE_VERMITTLER_TYP = MFA, keine Maklervollmacht erforderlich). BUE_MV_ENTHALTEN und',
        '  BUE_UV_ERTEILT wechseln dafuer von JN auf CH. BUE_MV_AUF_MAKLER, BUE_MV_UNTERSCHRIFT_KUNDE,',
        '  BUE_MV_UNTERSCHRIFTSDATUM und BUE_MV_EINGANGSDATUM bleiben unveraendert und gelten auch fuer MFA.',
        '  Das in der Abstimmung genannte Feld BUE_UV_FEHLT ist seit V1.1 nicht mehr Teil des Antrags.',
        '  BUE_UMFANG: Mehrere ist eine weiche BE (Pruefnotiz), Einzel und Gesamt gehen in die Notiz (Betroffene VNR).',
        '',
        'Aenderungen gegenueber Version 1.3 (Freigabe N. Garcia-Fernandez, Fertig zur Umsetzung, 09.09.2026):',
        '  Neues Ersatzfeld BUE_VNR_2 (Versicherungsnummer_2), damit bei mehreren Nummern keine VNR abgeschnitten wird.',
        '  Vermerk bei fehlender oder unvollstaendiger VNR lautet jetzt: Manuelle Pruefung VNR/Sparte (27 Zeichen).',
        '  Damit sind OFFEN 8 und OFFEN 9 erledigt.',
        '',
        'Aenderungen gegenueber Version 1.2: BUE_VNR und BUE_SPARTE mit Normierungsregeln aus der Abstimmung',
        '  Maklerservice / ODPB / Celonis vom 08.09.2026 (2 Buchstaben Spartenkuerzel + 9 Ziffern = 11 Zeichen,',
        '  mehrere Nummern semikolongetrennt, Ersatztext bei fehlender oder unvollstaendiger VNR).',
        '  BUE_UMFANG praezisiert nach Anforderung M. Jeglorz vom 08.09.2026.',
        '',
        'Aenderungen gegenueber Version 1.1: neues Feld BUE_UMFANG (Umfang der Bestandsuebertragung:',
        '  Gesamt = gesamte Kundenverbindung, Einzel = genau eine angegebene VNR, Mehrere = mehrere',
        '  einzelne VNR). Entspricht dem Merkmal Betroffene VNR der Telefonnotiz 1515. In Ausbaustufe 1',
        '  verarbeitet der Pruef-Bot Gesamt und Einzel, Mehrere wird als Business Exception ausgesteuert.',
        '',
        'Schluessel fuer den Datenpool (Stand 21.09.2026):',
        '  Komposit / Leben : GeVo 108 (Bestandsuebertragung, MIS-O) und GeVo 469; Verwaltungssystemschluessel',
        '                     LF (Leben) sowie AS, DA, HA, IT, KR, SV, TR und UV (Komposit, Obersparten).',
        '  KV / Gesundheit  : ID 02015 Maklervollmacht und ID 06065 Betreuung / Anfrage Betreuung.',
        '  Zur Herkunft: Abstimmung zum BUE-Reporting (Fachkonzept v2, 29.06.2026; S. Koeberer / D. Amend am',
        '  25.06.2026, Betrieb Gesundheit H. Andermann / M. Boettger am 27. und 29.06.2026). Der urspruenglich',
        '  genannte SV 496 war ein Zahlendreher fuer 469.',
        '',
        'Die Zeilen 5 bis 7 oben (LF 130, 158, 190) waren im gelieferten Template bereits enthalten',
        'und sind Beispiele des Templates, keine Vorgabe fuer diesen Antrag.',
        '',
        'Feldnamen nach Konvention BUE_..., max. 25 Zeichen, ohne Sonderzeichen, Umlaute und Leerzeichen.',
        'Feld_Format: CH = Text, NU = Zahl, DA = Datum, JN = Boolean. Feldlaenge einheitlich 50 Zeichen.',
        'Schluesselart: DOK_TYP_NR bei KV, GEVO_NR bei Komposit/Leben.',
        '',
        'ERLEDIGT 1 (22.09.2026, M. Koch): Fuer Komposit sind alle Obersparten moeglich - AS, DA, HA, IT, KR, SV,',
        '         TR und UV -, jeweils mit GeVo 108 und 469. Fuer Leben bleibt LF. Der Platzhalter entfaellt.',
        'ERLEDIGT 2 (21.09.2026): Fuer den Datenpool gelten GeVo 108 und 469 (Komposit/Leben) sowie Dokumenttyp',
        '         02015 und 06065 (KV) - wie in V1.6. ERLEDIGT 3: GeVo 469 bleibt im Antrag.',
        'OFFEN 4: Feldlaenge 50 Zeichen - bei BUE_ART_UNTERLAGEN (Freitext, Semikolon getrennt) und',
        '         BUE_VERMITTLER_NAME ist zu klaeren, ob 50 Zeichen ausreichen.',
        'OFFEN 5: Das Geburtsdatum wird im aktuellen Deckblatt-Template als Zeitstempel ausgegeben.',
        '         Fuer den Datenpool ist DA / TT.MM.JJJJ erforderlich.',
        'OFFEN 6: Auspraegungen von BUE_ART_UNTERLAGEN. Vorschlag: feste Werte entlang der Kennzeichen der',
        '         Notiz 1515 (Police/Vertragsspiegel/Vertragsauszug/Ersatzrechnung; Schadenaufstellung/',
        '         Schadenrenta; Sonstige Unterlagen) plus Freitext. Abstimmung mit ODPBD und MSU laeuft.',
        'OFFEN 7: BUE_UMFANG ist im KI-Deckblatt noch nicht enthalten; erforderlich sind die Prompt-Erweiterung',
        '         mit Celonis (typische Formulierungen fuer Einzel-BUE und gesamte Kundenverbindung) und die',
        '         Eroeffnung eines eigenen Vorgangs je genannter Versicherungsnummer (V1.6). Die Aussteuerung',
        '         von Gesamt als Business Exception (V1.7) ist Bot-Logik und braucht keine Datenpool-Aenderung.',
        'ERLEDIGT 8 (09.09.2026): Vermerk bei fehlender VNR lautet Manuelle Pruefung VNR/Sparte, 27 Zeichen.',
        'ERLEDIGT 9 (09.09.2026): Ersatzfeld BUE_VNR_2 nimmt weitere Nummern auf; der Pruef-Bot arbeitet mit der',
        '         VNR, mit der Celonis den Postkorbvorgang eroeffnet hat, und nutzt BUE_VNR / BUE_VNR_2 fuer den',
        '         Bearbeitungshinweis, wenn der Auftrag mehrere Versicherungsnummern nennt.',
        '',
        'Nicht im Datenpool beantragt, obwohl im Deckblatt vorhanden: Lfd-Nr, Status (Ampel) und',
        'Vorgangstyp (im Deckblatt gestrichen), die Badges Klassifikation und Maklervollmacht der',
        'Kopfzeile (Wiederholung von BUE_KLASSIFIKATION und BUE_MV_STATUS) sowie der Ergebnisblock',
        'Zusammenfassung und Hinweis (KI-Freitext ohne Laengenbegrenzung, vom Pruef-Bot nicht ausgewertet).',
    ]:
        if txt:
            hw.cell(row=row, column=2, value=txt)
        row += 1

    n = feldliste.erzeuge(wb, 'kideckblatt.xlsx')
    wb.save(out)
    return r - 2, n


import feldliste


if __name__ == '__main__':
    n, f = build('dp_template.xlsx', 'Datenpoolfelder_Pruef-Bot_BUE.xlsx')
    print(f'Blatt Daten: {n} Zeilen ({len(FELDER)} Felder x {len(KOMBIS)} Kombinationen)')
    print(f'Blatt Feldliste: {f} Felder')
