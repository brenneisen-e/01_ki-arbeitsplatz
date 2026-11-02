# -*- coding: utf-8 -*-
"""Setzt den Datenpool-Antrag V1.7 auf den vollen Schluesselsatz der V1.6 zurueck
und ergaenzt ihn um die Komposit-Verwaltungssystemschluessel.

Entscheidung 21.09.2026: GeVo 469 und Dokumenttyp 06065 bleiben im Antrag (wie V1.6),
zusaetzlich werden die Verwaltungssystemschluessel fuer Komposit gefuehrt.

Nachtrag 22.09.2026 (M. Koch, ODPBD, Anlage Spartenpraefix.xlsx): Es sind alle Werte
der Spalte Obersparte moeglich, ausdruecklich auch HA, AS, TR, IT und DA. Der Antrag
fuehrt deshalb alle Obersparten der Komposit-Welt, jeweils mit GeVo 108 und 469:
AS, DA, HA, IT, KR, SV, TR, UV. Damit 20 Kombinationen und 700 Zeilen.

Arbeitet auf der bereits gebauten Datei, weil das ITERGO-Template (dp_template.xlsx)
nicht im Repository liegt. Das Blatt Daten wird vollstaendig neu geschrieben.
"""
import openpyxl
from copy import copy

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd/'
QUELLE = P + 'Datenpoolfelder_Pruef-Bot_BUE_v1.7.xlsx'

# (VERW_SYS_SL, GEVO_NR, DOK_TYP_NR)
KOMPOSIT = ['AS', 'DA', 'HA', 'IT', 'KR', 'SV', 'TR', 'UV']

KOMBIS = ([('KV', None, '02015'), ('KV', None, '06065'),
           ('LF', 108, None),     ('LF', 469, None)]
          + [(s, g, None) for s in KOMPOSIT for g in (108, 469)])

wb = openpyxl.load_workbook(QUELLE)
ws = wb['Daten']

# Felder und Formate aus dem ersten Block uebernehmen
felder = []
for r in range(2, ws.max_row + 1):
    name = ws.cell(row=r, column=4).value
    if name in [f[0] for f in felder]:
        break
    felder.append((name, ws.cell(row=r, column=6).value))
assert len(felder) == 35, len(felder)

proto = [copy(ws.cell(row=2, column=c)._style) for c in range(1, 17)]
gueltbis = ws.cell(row=2, column=9).value
altzeilen = ws.max_row

r = 2
for verw, gevo, doktyp in KOMBIS:
    for name, fmt in felder:
        for c in range(1, 17):
            zelle = ws.cell(row=r, column=c)
            zelle._style = copy(proto[c - 1])
            zelle.value = None
        ws.cell(row=r, column=1, value=verw)
        ws.cell(row=r, column=2, value=gevo)
        ws.cell(row=r, column=3, value=doktyp)
        ws.cell(row=r, column=4, value=name)
        ws.cell(row=r, column=6, value=fmt)
        ws.cell(row=r, column=9, value=gueltbis)
        r += 1
for ueber in range(r, altzeilen + 1):          # ueberzaehlige Altzeilen leeren
    for c in range(1, 17):
        ws.cell(row=ueber, column=c).value = None

# --- Hinweise fortschreiben -------------------------------------------------
hw = wb['Hinweise']
ENDE = 160
alt = [hw.cell(row=r2, column=2).value or '' for r2 in range(9, ENDE)]
while alt and not alt[-1]:
    alt.pop()

# Der alte V1.7-Block beschrieb die Reduzierung auf je einen Schluessel; er wird ersetzt.
ende = alt.index('Aenderungen gegenueber Version 1.5 (PDD-Touchpoint 10.09.2026, Vorschlag an Fachbereich und Celonis):')

kopf = [
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
]
neu = kopf + alt[ende:]

ersatz = {
    'Schluessel fuer den Datenpool (ab V1.7, 17.09.2026):':
        'Schluessel fuer den Datenpool (Stand 22.09.2026):',
    'Schluessel fuer den Datenpool (Stand 21.09.2026):':
        'Schluessel fuer den Datenpool (Stand 22.09.2026):',
    '                     LF (Leben), KR (Kraftfahrt), UV (Unfall), SV (Sach).':
        '                     LF (Leben) sowie AS, DA, HA, IT, KR, SV, TR und UV (Komposit, Obersparten).',
    'ERLEDIGT 1 (21.09.2026): Fuer Komposit gelten KR (Kraftfahrt), UV (Unfall) und SV (Sach), jeweils mit':
        'ERLEDIGT 1 (22.09.2026, M. Koch): Fuer Komposit sind alle Obersparten moeglich - AS, DA, HA, IT, KR, SV,',
    '         GeVo 108 und 469. Fuer Leben bleibt LF. Der Platzhalterblock im Antrag entfaellt damit.':
        '         TR und UV -, jeweils mit GeVo 108 und 469. Fuer Leben bleibt LF. Der Platzhalter entfaellt.',
    '  Komposit / Leben : GeVo 108, Bezeichnung Bestandsuebertragung (MIS-O).':
        '  Komposit / Leben : GeVo 108 (Bestandsuebertragung, MIS-O) und GeVo 469; Verwaltungssystemschluessel',
    '  KV / Gesundheit  : ID 02015 Maklervollmacht.':
        '                     LF (Leben), KR (Kraftfahrt), UV (Unfall), SV (Sach).',
    '  Zur Herkunft: Die Abstimmung zum BUE-Reporting (Fachkonzept v2, 29.06.2026; S. Koeberer / D. Amend':
        '  KV / Gesundheit  : ID 02015 Maklervollmacht und ID 06065 Betreuung / Anfrage Betreuung.',
    '  am 25.06.2026, Betrieb Gesundheit H. Andermann / M. Boettger am 27. und 29.06.2026) nannte zusaetzlich':
        '  Zur Herkunft: Abstimmung zum BUE-Reporting (Fachkonzept v2, 29.06.2026; S. Koeberer / D. Amend am',
    '  GeVo 469 und ID 06065 Betreuung / Anfrage Betreuung. Diese gelten weiter fuer das Reporting, nicht fuer':
        '  25.06.2026, Betrieb Gesundheit H. Andermann / M. Boettger am 27. und 29.06.2026). Der urspruenglich',
    '  den Datenpool. Der urspruenglich genannte SV 496 war ein Zahlendreher fuer 469.':
        '  genannte SV 496 war ein Zahlendreher fuer 469.',
    'ERLEDIGT 2 (17.09.2026): Fuer den Datenpool gelten GeVo 108 (Komposit/Leben) und Dokumenttyp 02015 (KV).':
        'ERLEDIGT 2 (21.09.2026): Fuer den Datenpool gelten GeVo 108 und 469 (Komposit/Leben) sowie Dokumenttyp',
    'ERLEDIGT 3 (17.09.2026): Neben GeVo 108 werden keine weiteren GeVo aufgenommen; 469 entfaellt im Antrag.':
        '         02015 und 06065 (KV) - wie in V1.6. ERLEDIGT 3: GeVo 469 bleibt im Antrag.',
    '         GeVo 108. Fuer Leben bleibt LF. Der Platzhalterblock im Antrag entfaellt damit.':
        '         TR und UV -, jeweils mit GeVo 108 und 469. Fuer Leben bleibt LF. Der Platzhalter entfaellt.',
}
neu = [ersatz.get(z, z) for z in neu]

for r2 in range(9, ENDE):
    hw.cell(row=r2, column=2).value = None
for i, txt in enumerate(neu):
    if txt:
        hw.cell(row=9 + i, column=2, value=txt)

wb.save(QUELLE)
wb.save(P + 'Datenpoolfelder_Pruef-Bot_BUE.xlsx')

from collections import Counter
ws = openpyxl.load_workbook(QUELLE)['Daten']
c = Counter((ws.cell(row=r2, column=1).value, ws.cell(row=r2, column=2).value, ws.cell(row=r2, column=3).value)
            for r2 in range(2, ws.max_row + 1) if ws.cell(row=r2, column=4).value)
for k, v in c.items():
    print(k, v)
print('Zeilen im Blatt Daten:', sum(c.values()))
