# -*- coding: utf-8 -*-
"""Datenpool-Antrag V1.9: neues Feld BUE_VERTRAG_STATUS und VNR-Regel aus dem JF.

JF mit S. Schwarz / M. Koch (Oktober 2026):
1. BUE_VNR und BUE_VNR_2 enthalten alle Versicherungsnummern der Anfrage. Celonis eroeffnet
   weiter je VNR einen eigenen Vorgang mit eigenem Deckblatt; dort steht die eigene VNR an
   erster Stelle, danach folgen die uebrigen Nummern der Anfrage. BUE_VNR_2 wird nur befuellt,
   wenn die Nummern nicht mehr in die 50 Zeichen von BUE_VNR passen.
2. Neues Feld Vertragsstatus mit den Auspraegungen aktuell/historisch und gekuendigt/nicht
   geprueft. Der Pruef-Bot benoetigt das Feld nicht; es wird aufgenommen, damit Deckblatt und
   Datenpool inhaltlich gleich bleiben. Position im Deckblatt: Abschnitt Kunde & Vertrag,
   direkt nach Sparte.

Arbeitet auf der V1.8 (an B. Roth gesendet am 22.09.2026, inhaltlich gleich der Datei v1.7 im Repo) und schreibt die V1.9 (sowie die Datei ohne Versionsnummer).
"""
import openpyxl
from copy import copy
from collections import Counter

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd/'
QUELLE = P + 'Datenpoolfelder_Pruef-Bot_BUE_v1.8.xlsx'
ZIEL = P + 'Datenpoolfelder_Pruef-Bot_BUE_v1.9.xlsx'

NEU = 'BUE_VERTRAG_STATUS'
NACH = 'BUE_SPARTE'
assert len(NEU) <= 25

wb = openpyxl.load_workbook(QUELLE)

# --- Blatt Daten: Feld je Kombination nach BUE_SPARTE einfuegen -----------------
ws = wb['Daten']
zeilen = []
for r in range(2, ws.max_row + 1):
    werte = [ws.cell(row=r, column=c).value for c in range(1, 17)]
    if werte[3]:
        zeilen.append((werte, [copy(ws.cell(row=r, column=c)._style) for c in range(1, 17)]))
neu = []
for werte, stil in zeilen:
    neu.append((werte, stil))
    if werte[3] == NACH:
        w = list(werte)
        w[3], w[5] = NEU, 'CH'
        neu.append((w, stil))
for i, (werte, stil) in enumerate(neu):
    for c in range(1, 17):
        zelle = ws.cell(row=2 + i, column=c)
        zelle._style = copy(stil[c - 1])
        zelle.value = werte[c - 1]

# --- Blatt Feldliste ------------------------------------------------------------
fl = wb['Feldliste']
fl['A1'] = 'Datenfelder für den ERGO-Datenpool – Vorschlag zur Anlage (V1.9)'

VNR_TEXT = ('Normierte Versicherungsnummer: 2 Buchstaben Spartenkürzel + 9 Ziffern = 11 Zeichen; kürzere '
            'Zahlenfolgen werden links mit Nullen aufgefüllt, Sonderzeichen und alles danach (. ; -) entfallen. '
            'Enthält alle Versicherungsnummern, die zur Anfrage gehören, semikolongetrennt. Celonis eröffnet je '
            'VNR einen eigenen Postkorbvorgang mit eigenem Deckblatt; in jedem Vorgang steht die eigene VNR an '
            'erster Stelle, danach folgen die übrigen Nummern der Anfrage. Ist keine normierbare VNR ermittelbar: '
            '„Manuelle Prüfung VNR/Sparte“. Der Prüf-Bot arbeitet mit der VNR, mit der Celonis den Vorgang eröffnet '
            'hat; die weiteren Nummern dienen der manuellen Nachbearbeitung (Bearbeitungshinweis).')
VNR_BSP = ('Vorgang zu SV003456789: SV003456789; SV003456790; KV012345678 – Geändert in V1.9 – alle VNR der '
           'Anfrage, eigene VNR zuerst (JF Oktober 2026); Normierung nach Abstimmung Maklerservice/ODPB/Celonis '
           'vom 08.09.2026.')
VNR2_TEXT = ('Fortsetzung von BUE_VNR im selben Format und in derselben Reihenfolge, semikolongetrennt. Wird nur '
             'befüllt, wenn die Nummern der Anfrage nicht mehr in die 50 Zeichen von BUE_VNR passen (ab der fünften '
             'Nummer). Sonst leer. Kein Abgleich gegen die VNR des Postkorbvorgangs.')
VNR2_BSP = ('LF070902206; SV023456789 – Geändert in V1.9 – nur bei Überlauf von BUE_VNR (JF Oktober 2026); '
            'Ersatzfeld seit V1.4.')
VS_AUSP = ('aktuell | historisch | gekündigt | nicht geprüft. Status des Vertrags zur eigenen (ersten) VNR des '
           'Vorgangs: aktuell = Vertrag läuft; historisch = Vertrag beendet; gekündigt = Kündigung liegt vor; '
           'nicht geprüft = Status nicht ermittelt. Der Prüf-Bot wertet das Feld nicht aus (er prüft den '
           'Vertragsstatus selbst in VA230); es wird geführt, damit Deckblatt und Datenpool inhaltlich gleich sind.')
VS_BSP = 'aktuell – Neu in V1.9 – JF Oktober 2026; im Deckblatt im Abschnitt Kunde & Vertrag direkt nach Sparte.'

stil_zeile = None
for r in range(1, fl.max_row + 1):
    name = fl.cell(row=r, column=4).value
    if name == 'BUE_VNR':
        fl.cell(row=r, column=6, value=VNR_TEXT)
        fl.cell(row=r, column=7, value=VNR_BSP)
    elif name == 'BUE_VNR_2':
        fl.cell(row=r, column=6, value=VNR2_TEXT)
        fl.cell(row=r, column=7, value=VNR2_BSP)
    elif name == NACH:
        stil_zeile = r
assert stil_zeile

fl.insert_rows(stil_zeile + 1)
z = stil_zeile + 1
for c in range(1, 8):
    fl.cell(row=z, column=c)._style = copy(fl.cell(row=stil_zeile, column=c)._style)
for c, v in enumerate([None, 'Kunde & Vertrag', 'Vertragsstatus', NEU, 'Werteliste', VS_AUSP, VS_BSP], 1):
    fl.cell(row=z, column=c, value=v)

nr = 0
for r in range(1, fl.max_row + 1):
    if isinstance(fl.cell(row=r, column=1).value, int) or (r == z):
        nr += 1
        fl.cell(row=r, column=1, value=nr)
assert nr == 36, nr

# --- Blatt Hinweise -------------------------------------------------------------
hw = wb['Hinweise']
ENDE = 170
alt = [hw.cell(row=r, column=2).value or '' for r in range(9, ENDE)]
while alt and not alt[-1]:
    alt.pop()
alt[0] = 'Version 1.8, Stand 22.09.2026 (an B. Roth, Input Management 2) - Aenderungen gegenueber Version 1.6:'
assert alt[1] == '' and alt[2] == 'Aenderungen gegenueber Version 1.6:'
alt = alt[:1] + alt[3:]
alt = [z2.replace('35 Felder x 20 Kombinationen, 700 Zeilen', '35 Felder x 20 Kombinationen, 700 Zeilen (V1.8)')
       for z2 in alt]

kopf = [
    'Beantragung Pruef-Bot Bestandsuebertragung (Makler BUE meets KI) - Version 1.9, Stand 14.10.2026',
    '',
    'Aenderungen gegenueber Version 1.8 (JF mit S. Schwarz / M. Koch, Oktober 2026):',
    '  Neues Feld BUE_VERTRAG_STATUS (CH), Deckblatt-Abschnitt Kunde & Vertrag, direkt nach Sparte.',
    '  Auspraegungen: aktuell | historisch | gekuendigt | nicht geprueft; Status zur eigenen (ersten) VNR',
    '  des Vorgangs. Der Pruef-Bot benoetigt das Feld nicht (er prueft den Vertragsstatus selbst in VA230);',
    '  es wird aufgenommen, damit Deckblatt und Datenpool inhaltlich gleich bleiben.',
    '  BUE_VNR / BUE_VNR_2: enthalten alle Versicherungsnummern der Anfrage. Celonis eroeffnet weiter je VNR',
    '  einen eigenen Vorgang mit eigenem Deckblatt; dort steht die eigene VNR an erster Stelle, danach folgen',
    '  die uebrigen Nummern. Beispiel: Anfrage zu 123, dazu gehoeren 124 und 125 -> Vorgang 123: 123; 124; 125,',
    '  Vorgang 124: 124; 123; 125, Vorgang 125: 125; 123; 124. BUE_VNR_2 wird nur befuellt, wenn die Nummern',
    '  nicht mehr in die 50 Zeichen von BUE_VNR passen (ab der fuenften Nummer).',
    '  Umfang des Antrags: 36 Felder x 20 Kombinationen, 720 Zeilen. Schluessel unveraendert gegenueber V1.8.',
    '  Stand der Lieferung: Alle Felder der V1.8 sind in DV/FA verfuegbar (B. Roth, 22.09.2026, fuer Komposit).',
    '  Neu anzulegen ist nur BUE_VERTRAG_STATUS, je Kombination direkt nach BUE_SPARTE.',
    'OFFEN 10: Bezug von BUE_VERTRAG_STATUS bei mehreren VNR - Vorschlag: nur der Status der eigenen (ersten)',
    '         VNR des Vorgangs, da die 50 Zeichen fuer einen Status je VNR nicht ausreichen. Zu bestaetigen.',
    '',
]
neu_hw = kopf + alt
for r in range(9, ENDE):
    hw.cell(row=r, column=2).value = None
for i, txt in enumerate(neu_hw):
    if txt:
        hw.cell(row=9 + i, column=2, value=txt)

wb.save(ZIEL)
wb.save(P + 'Datenpoolfelder_Pruef-Bot_BUE.xlsx')

# --- Kontrolle --------------------------------------------------------------------
ws = openpyxl.load_workbook(ZIEL)['Daten']
c = Counter((ws.cell(row=r, column=1).value, ws.cell(row=r, column=2).value, ws.cell(row=r, column=3).value)
            for r in range(2, ws.max_row + 1) if ws.cell(row=r, column=4).value)
assert len(c) == 20 and set(c.values()) == {36}, c
for r in range(2, 40):
    if ws.cell(row=r, column=4).value == NEU:
        assert ws.cell(row=r - 1, column=4).value == NACH
print('Zeilen im Blatt Daten:', sum(c.values()), '| Kombinationen:', len(c))
