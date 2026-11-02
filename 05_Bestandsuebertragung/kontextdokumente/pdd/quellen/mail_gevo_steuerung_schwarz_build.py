# -*- coding: utf-8 -*-
"""Antwort an S. Schwarz zur GeVo-Steuerung: bei 1 und 2 keine Unterlagen an KWAD."""
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/Mail_Entwurf_Antwort_Schwarz_GeVo_Steuerung_220926'
ROT = '#C41230'

absaetze = [
 'Hallo Stefan,',
 'danke für die vier Fälle. Meine Antwort dazu:',
 ('1 und 2: keine Unterlagen an KWAD', True),
 'In beiden Fällen eröffnet Celonis den Postkorbvorgang über EMWS — und zwar mitsamt Unterlagen: die E-Mail mit '
 'allen Anhängen, dem neuen KI-Deckblatt und dem Datenpool. Gehen dieselben Unterlagen zusätzlich an kwad@ergo.de, '
 'eröffnet das Eingangsmanagement einen zweiten Vorgang zum selben Sachverhalt — bei Gesundheit eine zweite '
 'Postkorberöffnung, bei Komposit und Leben einen Folgeschriftwechsel. Deshalb bei 1 und 2 keine Mail an KWAD.',
 ('3: Datenpool bitte schreiben', True),
 'Hier entsteht ein BÜ-GeVo, nur zeitversetzt: erst nach der Abarbeitung in der Sparte wird er weitergeleitet. '
 'Damit wir nach dieser Weiterleitung den Prüf-Bot auch für diese Fälle einsetzen können, sollte Celonis den '
 'Datenpool bestücken — der Bot liest seine Vorgangsdaten ausschließlich von dort. Die Unterlagen gehen hier wie '
 'bisher an KWAD, weil das Eingangsmanagement eröffnet.',
 'Zwei Punkte dazu an dich: Wie schreibt ihr den Datensatz an einen Vorgang, den das Eingangsmanagement eröffnet? '
 'Und der BÜ-Teil braucht BUE_KLASSIFIKATION = „BÜ-Vorgang“. Steht dort die Klassifikation des Sparten-Anliegens, '
 'steuert der Bot den Vorgang in der Vorprüfung sofort mit der BE „Kein BÜ-Vorgang“ aus.',
 ('4: kein Datenpool', True),
 'Kein BÜ-GeVo, direktes Routing in die Sparte. Der Prüf-Bot sieht den Vorgang nicht.',
 ('Noch zu 2', True),
 'Laut Folie eröffnet Celonis bei 2 zusätzlich den GeVo „Anforderung von Unterlagen“. In der PDD setzt der Prüf-Bot '
 'die Anforderung über das Kennzeichen in der Telefonnotiz (aus BUE_ANF_UNTERLAGEN und BUE_ART_UNTERLAGEN). Wir '
 'sollten einen der beiden Wege festlegen, sonst wird doppelt angefordert.',
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
            o.append(f'<p style="{st};font-weight:bold;color:{ROT}">{html.escape(a[0])}</p>')
        else:
            o.append(f'<p style="{st}">{html.escape(a).replace(chr(10), "<br>")}</p>')
    return ''.join(o) + '</div>'


m = EmailMessage()
m['From'] = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'
m['To'] = 'Schwarz, Stefan (DSTPB) <Stefan.Schwarz@ergo.de>'
m['Cc'] = 'ebrenneisen@deloitte.de'
m['Subject'] = 'AW: GeVo-Steuerung Makler BUE meets KI | 1 und 2: keine Unterlagen an KWAD'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(OUT + '.eml', 'wb') as f:
    f.write(bytes(m))
open(OUT + '.txt', 'w', encoding='utf-8').write(
    'An: ' + m['To'] + '\nCc: ' + m['Cc'] + '\nBetreff: ' + m['Subject'] + '\n\n' + txt())
print('geschrieben:', OUT + '.eml')
