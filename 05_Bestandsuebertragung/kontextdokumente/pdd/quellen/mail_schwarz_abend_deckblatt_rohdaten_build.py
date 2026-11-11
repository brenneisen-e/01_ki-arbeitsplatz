# -*- coding: utf-8 -*-
"""Mail an S. Schwarz (Cc D. Abend): Celonis-Rohdaten und QS-Datei fuer den Deep Dive Deckblatt-Qualitaet."""
from email.message import EmailMessage
from email.utils import formatdate
import html
import os

P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = P + '/Mail_Entwurf_Schwarz_Abend_Deckblatt_Rohdaten_111126'

absaetze = [
 'Hallo Stefan, hallo Dirk,',
 'Stefan, kurz zur Einordnung aus dem heutigen Führungskräfte-Austausch (Dirk, du warst vermutlich dabei): '
 'Die Führungskräfte werden langsam unruhig. '
 'Wir haben mittlerweile 14.000 BÜ Rückstand, und der Anspruch an die Qualität der Deckblätter ist '
 'entsprechend hoch. Aktuell können die Deckblätter noch nicht für die Prüfung verwendet werden, weil sie '
 'noch Fehler enthalten. Dazu soll es nächste Woche einen Deep Dive geben.',
 'Dafür zwei Bitten:',
 ('Stefan: Rohdaten aus Celonis', True),
 'Ich habe verstanden, dass es in Celonis zu jedem Action-Flow-Vorgang einen Datenbankeintrag gibt, auch mit '
 'der Einwertung, was richtig und was falsch ist. Kannst du mir diese Rohdaten schicken, gern als Excel? '
 'Dann bereite ich das einmal auf.',
 ('Dirk: aktuelle QS-Datei', True),
 'Schickst du mir bitte die aktuelle QS-Datei aus dem Fachbereich? Ich konsolidiere sie dann mit den '
 'Rohdaten aus Celonis.',
 'Danke euch.',
 'Beste Grüße\nEike',
]


def txt():
    o = []
    for a in absaetze:
        o.append(a[0] if isinstance(a, tuple) else a)
        o.append('')
    return '\n'.join(o).rstrip() + '\n'


def htm():
    st = 'font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:0 0 10px 0'
    o = ['<div style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a">']
    for a in absaetze:
        if isinstance(a, tuple):
            o.append(f'<p style="{st};font-weight:bold">{html.escape(a[0])}</p>')
        else:
            o.append(f'<p style="{st}">{html.escape(a).replace(chr(10), "<br>")}</p>')
    return ''.join(o) + '</div>'


m = EmailMessage()
m['From'] = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'
m['To'] = 'Schwarz, Stefan (DSTPB) <Stefan.Schwarz@ergo.de>'
m['Cc'] = 'Abend, Dirk <Dirk.Abend@ergo.de>'
m['Subject'] = 'BÜ | Deckblatt-Qualität: Rohdaten aus Celonis und QS-Datei für den Deep Dive'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(OUT + '.eml', 'wb') as f:
    f.write(bytes(m))
open(OUT + '.txt', 'w', encoding='utf-8').write(
    'An: ' + m['To'] + '\nCc: ' + m['Cc'] + '\nBetreff: ' + m['Subject'] + '\n\n' + txt())
print('geschrieben:', OUT + '.eml')
