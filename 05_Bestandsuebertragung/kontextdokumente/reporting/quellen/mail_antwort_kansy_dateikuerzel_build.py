# -*- coding: utf-8 -*-
"""Antwort an Daniel Kansy (Infomotion): Kürzel im Dateinamen der BÜ-Rohdateien (HS vs. Makler)."""
from email.message import EmailMessage
from email.utils import formatdate
import html

OUT = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/reporting/AW_Kansy_HS_Reporting_Dateikuerzel_151026'
ROT = '#C41230'

# (Text, Art): 'h' Zwischenüberschrift, 'b' Aufzählung, sonst Absatz
absaetze = [
    'Hallo Daniel,',
    'gern. Die Namen vergibt unser BÜ-Reporting (Master-Excel), wenn es die Rohabzüge aus MIS-O lädt und in der Ablage '
    'als JJJJMMTT_BUe_<Quelle> speichert. Es gibt zwei Bereiche mit je einer eigenen Master-Datei:',
    ('Ohne Kürzel, z. B. 20260930_BUe_OPAG.xlsx: Abzug für den Bereich HS.', 'b'),
    ('Mit Kürzel, z. B. 20260930_BUe_OPAG_MSUE+ODP+ODPB+ODPP.xlsx: Abzug für den Bereich Makler.', 'b'),
    ('Was die Kürzel bedeuten', 'h'),
    'Die Kürzel sind die Organisationseinheiten, deren Vorgänge in der Datei stehen. Das Tool liest sie je Zeile aus der '
    'OE-Nummer (Spalte OE_NR bzw. Kopfzeile oe_nr) und fasst Unter-OEs zur Einheit zusammen, z. B. ODPB1 D und ODPB2HH zu ODPB. '
    'Die Einheiten einer Datei werden mit „+“ verbunden an den Namen gehängt.',
    'MIS-O verteilt die Einheiten nicht jeden Tag gleich auf die Dateien. Deshalb wechseln die Kombinationen: Am 05.10. und '
    '06.10. stehen zum Beispiel keine Vorgänge der Einheit ODP in der Datei, also fehlt ODP im Namen.',
    ('Worin sich die Tabellen unterscheiden', 'h'),
    'Aufbau und Spalten sind gleich, es sind dieselben MIS-O-Abzüge (Filter OE und Rückstandsalter). Der Unterschied ist '
    'die OE-Auswahl: Die Datei ohne Kürzel enthält die Einheiten des Bereichs HS, die Datei mit Kürzel die Makler-Einheiten. '
    'Für den Nachbau heißt das: Die Datei ohne Kürzel gehört zum HS-Reporting, die Dateien mit Kürzel zum Makler-Reporting.',
    'Viele Grüße\nEike',
]


def ist(a, art):
    return isinstance(a, tuple) and a[1] == art


def txt():
    o = []
    for i, a in enumerate(absaetze):
        art = a[1] if isinstance(a, tuple) else 'p'
        t = a[0] if isinstance(a, tuple) else a
        o.append('- ' + t if art == 'b' else t)
        nxt = absaetze[i + 1] if i + 1 < len(absaetze) else None
        if art != 'b' or not ist(nxt, 'b'):
            o.append('')
    return '\n'.join(o).rstrip() + '\n'


def htm():
    st = 'margin:0 0 10px 0;font-family:Calibri,Arial,sans-serif;font-size:11pt'
    o, liste = ['<div style="font-family:Calibri,Arial,sans-serif;font-size:11pt">'], False
    for a in absaetze:
        if ist(a, 'b'):
            if not liste:
                o.append('<ul style="margin:0 0 10px 0">'); liste = True
            o.append(f'<li style="font-family:Calibri,Arial,sans-serif;font-size:11pt">{html.escape(a[0])}</li>')
            continue
        if liste:
            o.append('</ul>'); liste = False
        if ist(a, 'h'):
            o.append(f'<p style="{st};font-weight:bold;color:{ROT}">{html.escape(a[0])}</p>')
        else:
            o.append(f'<p style="{st}">{html.escape(a).replace(chr(10), "<br>")}</p>')
    if liste:
        o.append('</ul>')
    return '<html><body>' + ''.join(o) + '</div></body></html>'


m = EmailMessage()
m['From'] = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'
m['To'] = 'Daniel Kansy <Daniel.Kansy@infomotion.de>'
m['Cc'] = '"Jeglorz, Marco (HSB4K-EXTERN)", "Michael Kreft", "Schwarz, Stefan (DSTPB)"'
m['Subject'] = 'AW: HS Reporting - Besprechung offener Fragen aus Rohdaten Excel'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(OUT + '.eml', 'wb') as f:
    f.write(bytes(m))
print(txt())
print('geschrieben:', OUT + '.eml')
