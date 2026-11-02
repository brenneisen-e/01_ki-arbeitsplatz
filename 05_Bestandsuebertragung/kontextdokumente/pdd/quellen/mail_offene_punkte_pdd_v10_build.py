# -*- coding: utf-8 -*-
"""Mail-Entwurf: offene Punkte zur PDD v10 (KV und Komposit/Leben) fuer Fachbereich und Robotics."""
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/Mail_Entwurf_Offene_Punkte_PDD_v10_230926'
ROT = '#C41230'

EINLEITUNG = ('anbei die PDD v10 für Gesundheit (KV) und für Komposit / Leben, beide zweisprachig nach dem Template und mit allen '
              'Kommentaren der Reviewrunde eingearbeitet (Stand je Kommentar im beigefügten Protokoll). Damit Robotics bauen kann, '
              'brauche ich noch die folgenden Angaben und Bestätigungen:')
BLOECKE = [
 ('Postkörbe und Routing', [
   'Postkorb-Nr. des Themenpostkorbs „HSB4K 72“ (Übergabe aller Vorgänge ohne Befund an den 72-Stunden-BOT, beide Sparten).',
   'Postkorb-Nr. „HSB4K MV“ (KV, Vorgänge mit Befund) und „HSB4K KO“ (Komposit / Leben, Vorgänge mit Befund, wenn der abgebende Bestandsinhaber der AO angehört).',
   'Komposit / Leben, abgebender Bestandsinhaber nicht AO: welcher Themenpostkorb von ODPB (Name und Postkorb-Nr.)?',
   'Woran erkennt der Bot in OB726, dass der abgebende Bestandsinhaber der AO angehört (Ausprägung der Kopfzeile hinter der Vermittler-Nr.)?',
   'Nicht ermittelbarer Bestandsinhaber (Feld „Betreuung“ in VA230 leer, Agentur in OB726 unbekannt) oder BE vor Kapitel II: Vorschlag HSB4K KO – einverstanden?',
   'Makler auf Makler (K. Rypa): geht jeder Vorgang ohne Befund an den 72-Stunden-BOT oder direkt an HSB4K GR?',
 ]),
 ('Fachliche Bestätigungen', [
   'Prüfung auf Mantelvertrag bei KR (K. Rypa): Feld in VA230 und Ausprägung, an der der Bot einen Flottenvertrag mit führendem Mantel erkennt.',
   'Notizfeld „Komposit / Leben / KV“: welche Kürzel in BUE_SPARTE gehören zu Leben (z. B. LV, BU), welche zu Komposit?',
   'Vorlage der Telefonnotiz KV (BOT2011): wird die Vorlage bestückt oder eine Freitextnotiz mit gleichem Aufbau erzeugt? Für Komposit / Leben: Anwendung und Vorlage des Bearbeitungshinweises.',
   'Sonderliste TOP-Makler (8 Vermittler, Stand 23.09.2026, mit fester Adresse auch für Fonds Finanz): gilt einmalig – Bestätigung, dass keine laufende Pflege vorgesehen ist.',
 ]),
 ('Stammdaten', [
   'Involvierte Geschäftsbereiche (Gruppe, Abteilung, Standort) und Abnahmeumgebung – Robotics / D. Amend.',
 ]),
]
SCREENSHOTS_KOPF = ('Fassung', 'Kapitel / Schritt', 'Screenshot', 'Status')
SCREENSHOTS = [
 ('KV und Komposit/Leben', 'Start – Postkorbvorgang und Datenpool lesen', 'Datenpool, Datensatz zum Postkorbvorgang (Felder BUE_*)', 'fehlt – Platzhalter im Dokument'),
 ('KV und Komposit/Leben', 'III – E-Mail-Adresse des übernehmenden Vermittlers ermitteln', 'OB729 Vermittlerkommunikation, Feld E-Mail-Adresse', 'fehlt – Platzhalter im Dokument'),
 ('KV und Komposit/Leben', 'I – Kundennummer über die Versicherungsnummer (IS011/VAF017)', 'IS011/VAF017 mit Name, Anschrift, Geburtsdatum, Kundennummer', 'vorhanden – bitte bestätigen, dass es Testdaten sind, sonst schwärzen'),
 ('KV und Komposit/Leben', 'II – PNR des Bestandsinhabers lesen (OB726)', 'OB726 zum abgebenden Bestandsinhaber (Betreuung aus VA230)', 'vorhanden, zeigt aber den übernehmenden Makler – passenden Screenshot liefern'),
 ('KV', 'VI – Telefonnotiz bestücken', 'Notizvorlage BOT2011 (Krankenversicherung)', 'heute Maske 1515 als Ersatz – KV-Vorlage liefern'),
 ('Komposit/Leben', 'Start, I, II, III, IV – alle Hostmasken', 'Themenpostkorb, IS011, VA230 (heute Sparte Kranken), OB726, GH040', 'heute KV-Screenshots – durch Komposit/Leben-Masken ersetzen'),
 ('Komposit/Leben', 'IV – Vertrag, Prüfung auf Mantelvertrag bei KR', 'VA230, Feld für Mantelvertrag / Flotte', 'fehlt – Feld und Ausprägung noch festzulegen (K. Rypa)'),
 ('Komposit/Leben', 'VII – Abschluss mit Befund', 'Bearbeitungshinweis am Postkorbvorgang (Anwendung und Vorlage Komposit/Leben)', 'fehlt – Platzhalter im Dokument'),
]

SCHLUSS = 'Alles Weitere steht im Protokoll; Rückfragen gern direkt an mich.'


def txt():
    o = ['Hallo zusammen,', '', EINLEITUNG, '']
    for kopf, punkte in BLOECKE:
        o.append(kopf)
        o += ['- ' + p for p in punkte]
        o.append('')
    o.append('Offene Screenshots')
    o.append(' | '.join(SCREENSHOTS_KOPF))
    o += [' | '.join(z) for z in SCREENSHOTS]
    o.append('')
    o += [SCHLUSS, '', 'Viele Grüße', 'Eike Brenneisen']
    return '\n'.join(o)


def htm():
    e = html.escape
    o = ['<div style="font-family:Arial,sans-serif;font-size:11pt;color:#1a1a1a;max-width:820px">',
         '<p>Hallo zusammen,</p><p>' + e(EINLEITUNG) + '</p>']
    for kopf, punkte in BLOECKE:
        o.append('<p style="margin:14px 0 4px;font-weight:bold;color:' + ROT + '">' + e(kopf) + '</p><ul style="margin:0 0 0 18px;padding:0">')
        o += ['<li style="margin:0 0 5px">' + e(p) + '</li>' for p in punkte]
        o.append('</ul>')
    o.append('<p style="margin:14px 0 4px;font-weight:bold;color:' + ROT + '">Offene Screenshots</p>'
             '<table style="border-collapse:collapse;font-size:10pt;width:100%"><tr>' +
             ''.join('<th style="text-align:left;border-bottom:2px solid ' + ROT + ';padding:4px 6px">' + e(k) + '</th>' for k in SCREENSHOTS_KOPF) + '</tr>' +
             ''.join('<tr style="background:' + ('#f2f2f2' if i % 2 else '#fff') + '">' + ''.join('<td style="border-bottom:1px solid #ddd;padding:4px 6px;vertical-align:top">' + e(x) + '</td>' for x in z) + '</tr>' for i, z in enumerate(SCREENSHOTS)) +
             '</table>')
    o.append('<p style="margin-top:14px">' + e(SCHLUSS) + '</p><p>Viele Grüße<br>Eike Brenneisen</p></div>')
    return ''.join(o)


m = EmailMessage()
m['From'] = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'
m['To'] = 'Dirk.Amend@ergo.de, Christoph-Reber.Lucht@ergo.de, Kamil.Rypa@ergo.de'
m['Cc'] = 'Tanja.Juraschek@ergo.de, Marco.Jeglorz.extern@ergo.de, ebrenneisen@deloitte.de'
m['Subject'] = 'Makler BUE meets KI | PDD v10 Pruef-Bot (KV und Komposit/Leben): offene Punkte fuer Fachbereich und Robotics'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(OUT + '.eml', 'wb') as f:
    f.write(bytes(m))
open(OUT + '.txt', 'w', encoding='utf-8').write('An: ' + m['To'] + '\nCc: ' + m['Cc'] + '\nBetreff: ' + m['Subject'] + '\n\n' + txt())
print('geschrieben:', OUT + '.eml')
