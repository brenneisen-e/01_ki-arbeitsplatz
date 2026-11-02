# -*- coding: utf-8 -*-
"""Mail an das Eingangsmanagement: Mehrere VNR in einer Anfrage – VNR/VNR_2 auf dem KI-Deckblatt und Umgang im EM."""
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/Mail_Entwurf_EM_Mehrere_VNR_Deckblatt_141026'
ROT = '#C41230'

# (Text, Art): Art 'h' = Zwischenüberschrift, 'b' = Aufzählung, sonst Absatz
absaetze = [
    'Hallo zusammen,',
    'für den Pilot „Makler BÜ meets KI“ möchten wir Sie kurz informieren, wie künftig mit Anfragen umgegangen wird, '
    'die mehrere Versicherungsnummern betreffen.',
    ('Was Celonis macht', 'h'),
    ('Celonis eröffnet je Versicherungsnummer einen eigenen Postkorbvorgang mit eigenem KI-Deckblatt.', 'b'),
    ('Die Felder „Versicherungsnummer“ (VNR) und „Versicherungsnummer 2“ (VNR_2) auf dem Deckblatt enthalten alle '
     'Versicherungsnummern, die zur Anfrage gehören. In jedem Vorgang steht die eigene VNR an erster Stelle, danach '
     'folgen die übrigen Nummern der Anfrage.', 'b'),
    ('VNR_2 wird nur befüllt, wenn die Nummern nicht mehr in die 50 Zeichen von VNR passen.', 'b'),
    'Beispiel: Ein Makler fragt zu 123 die gesamte Kundenverbindung an, zur Kundenverbindung gehören noch 124 und 125. '
    'Dann werden drei Vorgänge mit drei Deckblättern eröffnet:',
    ('Vorgang 123: VNR = 123; 124; 125', 'b'),
    ('Vorgang 124: VNR = 124; 123; 125', 'b'),
    ('Vorgang 125: VNR = 125; 123; 124', 'b'),
    'Diese Vorgänge laufen automatisch durch und berühren das Eingangsmanagement nicht.',
    ('Was das für das Eingangsmanagement bedeutet', 'h'),
    'Bei Ihnen kommen nur die Mails an, bei denen Celonis das Deckblatt lediglich weitergibt und den Vorgang nicht '
    'automatisch eröffnet. Muss ein solcher Vorgang manuell klassifiziert werden, gilt dafür weiterhin nur die eine '
    'VNR an erster Stelle des Deckblatts. Die weiteren Nummern in VNR und VNR_2 sind nur ein Hinweis für die '
    'Nachbearbeitung in der Sparte. Für sie ist kein eigener Vorgang anzulegen, sonst entstehen Duplikate.',
    'Neu auf dem Deckblatt ist außerdem das Feld „Vertragsstatus“ im Abschnitt „Kunde & Vertrag“, direkt nach „Sparte“. '
    'Es dient nur der Information.',
    'Bitte geben Sie mir kurz Rückmeldung, ob das zu Ihrem heutigen Vorgehen passt oder ob es bei Ihnen Fälle gibt, '
    'in denen Sie mehrere Versicherungsnummern anders behandeln.',
    'Beste Grüße\nEike Brenneisen',
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
AN = ['Stöhnken, Dennis (EYCK)', 'von Wirtz, Markus', 'Gröning', 'Roth, Bastian (EYC1HH)', 'Holthusen, Jan Steffen (EYCHH)']
CC = ['Amend, Dirk (HSB4K)', 'Schwarz, Stefan (DSTPB)', 'Koch, Marcus (ODPBD)']
m['To'] = ', '.join('"%s"' % x for x in AN)
m['Cc'] = ', '.join('"%s"' % x for x in CC)
m['Subject'] = 'Makler BÜ meets KI | Mehrere Versicherungsnummern: VNR/VNR_2 auf dem KI-Deckblatt'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(OUT + '.eml', 'wb') as f:
    f.write(bytes(m))
open(OUT + '.txt', 'w', encoding='utf-8').write(
    'An: ' + '; '.join(AN) + '\nCc: ' + '; '.join(CC) + '\nBetreff: ' + m['Subject'] + '\n\n' + txt())
print(txt())
print('geschrieben:', OUT + '.eml')
