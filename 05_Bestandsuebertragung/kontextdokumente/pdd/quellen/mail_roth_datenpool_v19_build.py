# -*- coding: utf-8 -*-
"""Kurze Antwort an Bastian Roth (Input Management 2) im Verlauf zur V1.8: Datenpool V1.9 mit BUE_VERTRAG_STATUS."""
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/AW_Roth_Datenpool_v1.9_141026.eml'
ANLAGE = P + '/Datenpoolfelder_Pruef-Bot_BUE_v1.9.xlsx'

absaetze = [
    'Hallo Herr Roth,',
    'anbei finden Sie die Fassung 1.9 mit der Bitte um Umsetzung. Neu ist nur das Feld BUE_VERTRAG_STATUS (CH), '
    'jeweils direkt nach BUE_SPARTE in allen 20 Kombinationen. Alle übrigen Felder und Schlüssel sind unverändert '
    'gegenüber der Fassung 1.8.',
    'Beste Grüße\nEike Brenneisen',
]


def txt():
    return '\n\n'.join(absaetze) + '\n'


def htm():
    st = 'margin:0 0 10px 0;font-family:Calibri,Arial,sans-serif;font-size:11pt'
    return ('<html><body>' + ''.join(f'<p style="{st}">{html.escape(a).replace(chr(10), "<br>")}</p>'
                                     for a in absaetze) + '</body></html>')


m = EmailMessage()
m['From'] = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'
m['To'] = '"Roth, Bastian (EYC1HH)" <Bastian.Roth@itergo.com>'
m['Subject'] = 'AW: Neue Themenpostkörbe für Prüf-Bot'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(ANLAGE, 'rb') as f:
    m.add_attachment(f.read(), maintype='application',
                     subtype='vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     filename='Datenpoolfelder_Pruef-Bot_BUE_v1.9.xlsx')
with open(OUT, 'wb') as f:
    f.write(bytes(m))
print(txt())
print('geschrieben:', OUT)
