# -*- coding: utf-8 -*-
"""Antwort an Marcus Koch (cc Stefan Schwarz, Dirk Amend): VNR1/2 und Vertragsstatus – Priorität 2, Datenpool-Excel und Mail an EM."""
from email.message import EmailMessage
from email.utils import formatdate
import html

OUT = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd/AW_Makler_BUE_meets_Celonis_VNR_Prio_141026.eml'

absaetze = [
    'Hallo zusammen,',
    'danke dir, Marcus, für deine Einordnung.',
    'Bei der Priorisierung würde ich das Thema VNR/VNR_2 nicht als Priorität 1 einschätzen, sondern eher Priorität 2 empfehlen '
    '(reduziert Bearbeitungsfehler, ist aber nicht zwingend für die Bearbeitung erforderlich). Nach der Fertigstellung der '
    'EMWS-Strecke sollte jetzt aus meiner Sicht erst einmal die Qualität der Daten im Vordergrund stehen. VNR und VNR_2 mit allen '
    'Vertragsnummern der Anfrage wären ja nur für die manuelle Nachbearbeitung wichtig.',
    ('Zu den offenen Punkten', 'h'),
    ('Punkt 3: Explizit besprochen ist das mit dem EM nicht. Besprochen ist nur der Umgang, wenn Celonis das Deckblatt lediglich '
     'weitergibt und den Vorgang nicht automatisch eröffnet. Aus meiner Sicht ist das aber auch kein Problem: Wir eröffnen ja für '
     'alle beteiligten VNR einen Vorgang, der dann automatisch durchgeht. Muss ein Vorgang manuell klassifiziert werden, ist es '
     'weiterhin nur die eine VNR, und dann gäbe es auch keine Duplikate. Ich bereite zudem eine Mail an das EM-Team vor.', 'b'),
    ('Punkt 5: Ich bereite die Datenpool-Excel mit dem neuen Feld Vertragsstatus und seiner Position auf dem Deckblatt vor.', 'b'),
    'Viele Grüße\nEike',
]


def txt():
    aus = []
    for a in absaetze:
        if isinstance(a, tuple):
            aus.append(('- ' if a[1] == 'b' else '') + a[0])
        else:
            aus.append(a)
    t, vor = '', None
    for a, roh in zip(aus, absaetze):
        art = roh[1] if isinstance(roh, tuple) else 'p'
        if t:
            t += '\n' if (art == 'b' and vor == 'b') else '\n\n'
        t += a
        vor = art
    return t + '\n'


def htm():
    teile, liste = [], []
    for a in absaetze:
        if isinstance(a, tuple) and a[1] == 'b':
            liste.append('<li>%s</li>' % html.escape(a[0]))
            continue
        if liste:
            teile.append('<ul>%s</ul>' % ''.join(liste)); liste = []
        if isinstance(a, tuple) and a[1] == 'h':
            teile.append('<p><b style="color:#C41230">%s</b></p>' % html.escape(a[0]))
        else:
            teile.append('<p>%s</p>' % html.escape(a).replace('\n', '<br>'))
    if liste:
        teile.append('<ul>%s</ul>' % ''.join(liste))
    return ('<html><body style="font-family:Calibri,Arial,sans-serif;font-size:11pt">%s</body></html>' % ''.join(teile))


m = EmailMessage()
m['X-Unsent'] = '1'
m['To'] = 'Marcus.Koch@ergo.de'
m['Cc'] = 'Stefan.Schwarz@ergo.de; Dirk.Amend@ergo.de'
m['Subject'] = 'AW: Makler BÜ meets Celonis - VNR1/2 und Vertragsstatus'
m['Date'] = formatdate(localtime=True)
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
open(OUT, 'wb').write(bytes(m))
print(txt())
print('geschrieben', OUT)
