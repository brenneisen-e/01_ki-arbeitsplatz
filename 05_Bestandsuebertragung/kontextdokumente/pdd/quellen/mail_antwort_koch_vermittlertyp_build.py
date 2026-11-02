# -*- coding: utf-8 -*-
"""Antwort-Entwurf an M. Koch / S. Schwarz: Pflichtfelder des KI-Deckblatts fuer Courtagefortzahler und Kontaktgeber."""
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/Mail_Antwort_Koch_Vermittlertyp_240926'
ROT = '#C41230'

ANREDE = 'Hallo Marcus, hallo Stefan,'
EINLEITUNG = ('gern. Wie heute Morgen abgestimmt, wird aus „Courtagefortzahler“ und „Kontaktgeber“ eine Business Exception. Damit ist die Liste kurz:')
STUFE1_KOPF = 'Mit BE (so abgestimmt): nur drei Felder müssen bestückt sein'
STUFE1 = ('Der Bot setzt beim Vermittlertyp „Courtagefortzahler“ oder „Kontaktgeber“ sofort die BE „Keine Bestandsübertragung möglich: <Typ>“ und gibt den '
          'Vorgang mit Bearbeitungshinweis an den Sachbearbeiter, der die Ablehnung versendet. Gebraucht werden dafür nur:')
STUFE1_PUNKTE = [
 'Vermittlertyp (BUE_VERMITTLER_TYP) – Auslöser der BE, Ausprägung ausgeschrieben',
 'VNR (BUE_VNR, bei mehreren Nummern BUE_VNR_2) – für den Bearbeitungshinweis',
 'Agentur-Nr (BUE_AGENTUR_NR) – Einstieg in OB726 für die Notiz',
]
STUFE1_SCHLUSS = 'Alle übrigen Felder dürfen wie beim MFA auf N/A stehen; Vollmacht, Unterschrift und Unterlagen werden nicht geprüft.'
STUFE2_KOPF = 'Nur zur Einordnung: sollten die Typen doch wie Makler und MFA geprüft werden'
STUFE2 = ('Dann bräuchte der Bot denselben Feldsatz wie für Makler bzw. MFA, weil er die komplette Prüfstrecke durchläuft (Kunde in IS011, '
          'Bestandsinhaber, Vermittler in OB726, Vertrag in VA230, Notiz):')
KOPF = ('Feldgruppe im KI-Deckblatt', 'Felder', 'Wofür')
FELDER = [
 ('Vermittler', 'BUE_VERMITTLER_TYP, BUE_AGENTUR_NR, BUE_MAKLER_EMAIL, optional BUE_VERMITTLER_NR', 'Weiche Makler/MFA, Einstieg OB726, E-Mail für die Notiz'),
 ('Vollmacht / Wunsch', 'Makler: BUE_MV_UNTERSCHRIFT_KUNDE, BUE_PRUEFUNG_UNTERLAGEN, BUE_MV_EINGANGSDATUM; MFA: BUE_WUNSCH_VORHANDEN, BUE_MV_AUF_MAKLER', 'Ausschlusskriterien der Vorprüfung, Eingangsdatum der Notiz'),
 ('Kunde', 'BUE_KUNDE_NACHNAME, BUE_KUNDE_VORNAME, BUE_KUNDE_PLZ, BUE_KUNDE_STRASSE, optional BUE_KUNDE_GEBDAT', 'Matchcodesuche und Partnerprüfung in IS011'),
 ('Vertrag', 'BUE_VNR, BUE_VNR_2, BUE_UMFANG', 'Vertragsprüfung in VA230, Notiz und Bearbeitungshinweis'),
 ('Pool', 'BUE_POOL, BUE_UV_ERTEILT', 'Feld „Bearbeitung nach“ in der Notiz'),
 ('Komposit / Leben zusätzlich', 'BUE_SPARTE, BUE_ART_UNTERLAGEN', 'Mantelvertragsprüfung bei KR, Kennzeichen „Folgearbeit“ in der Notiz'),
]
NACHSATZ = [
 'Zu den übrigen Punkten aus eurer Abstimmung: „leer“ und „Fremdversicherungsunternehmen“ behandelt der Bot wie „Makler“, also mit Prüfung der '
 'unterschriebenen Maklervollmacht. Die Schreibweise „Courtagefortzahler“ (ausgeschrieben) übernehme ich so in die PDD. Die BE ist in der aktuellen '
 'Fassung der PDD für KV und für Komposit / Leben bereits eingetragen.',
]

def txt():
    o = [ANREDE, '', EINLEITUNG, '', STUFE1_KOPF, STUFE1] + ['- ' + t for t in STUFE1_PUNKTE] + [STUFE1_SCHLUSS, '', STUFE2_KOPF, STUFE2, '']
    o.append(' | '.join(KOPF))
    o += [' | '.join(z) for z in FELDER]
    o.append('')
    o += NACHSATZ
    o += ['', 'Viele Grüße', 'Eike Brenneisen']
    return '\n'.join(o)

def htm():
    e = html.escape
    o = ['<div style="font-family:Arial,sans-serif;font-size:11pt;color:#1a1a1a;max-width:820px">',
         '<p>' + e(ANREDE) + '</p><p>' + e(EINLEITUNG) + '</p>',
         '<p style="margin:14px 0 4px;font-weight:bold;color:' + ROT + '">' + e(STUFE1_KOPF) + '</p><p style="margin:0">' + e(STUFE1) + '</p>'
         '<ul style="margin:4px 0 4px 18px;padding:0">' + ''.join('<li style="margin:0 0 3px">' + e(t) + '</li>' for t in STUFE1_PUNKTE) + '</ul>'
         '<p style="margin:0">' + e(STUFE1_SCHLUSS) + '</p>',
         '<p style="margin:14px 0 4px;font-weight:bold;color:' + ROT + '">' + e(STUFE2_KOPF) + '</p><p style="margin:0 0 8px">' + e(STUFE2) + '</p>',
         '<table style="border-collapse:collapse;font-size:10pt;width:100%"><tr>' +
         ''.join('<th style="text-align:left;border-bottom:2px solid ' + ROT + ';padding:4px 6px">' + e(k) + '</th>' for k in KOPF) + '</tr>' +
         ''.join('<tr style="background:' + ('#f2f2f2' if i % 2 else '#fff') + '">' + ''.join('<td style="border-bottom:1px solid #ddd;padding:4px 6px;vertical-align:top">' + e(x) + '</td>' for x in z) + '</tr>' for i, z in enumerate(FELDER)) +
         '</table>']
    o += ['<p style="margin-top:14px">' + e(t) + '</p>' for t in NACHSATZ]
    o.append('<p>Viele Grüße<br>Eike Brenneisen</p></div>')
    return ''.join(o)

m = EmailMessage()
m['From'] = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'
m['To'] = 'Marcus.Koch@ergo.de, Stefan.Schwarz@ergo.de'
m['Cc'] = 'Marco.Jeglorz.extern@ergo.de'
m['Subject'] = 'AW: Makler BUE meets KI - EMMA -Liste zwecks Format - Abweichende Auspraegungen in Spalte D'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(OUT + '.eml', 'wb') as f:
    f.write(bytes(m))
open(OUT + '.txt', 'w', encoding='utf-8').write('An: ' + m['To'] + '\nCc: ' + m['Cc'] + '\nBetreff: ' + m['Subject'] + '\n\n' + txt())
print('geschrieben:', OUT + '.eml')
