# -*- coding: utf-8 -*-
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/Mail_Entwurf_Termin_Budget_2027_Celonis_170926'
ANHANG = P + '/20260917_Abstimmung_Budget_2027_Celonis.pptx'
ROT = '#C41230'

absaetze = [
 'Hallo zusammen,',
 'anbei eine vorbereitende Unterlage für unseren Termin heute um 15:30 Uhr. Sie soll die Diskussion strukturieren und die Entscheidungspunkte vorab transparent machen; es ist ausdrücklich ein Vorschlag, kein abgestimmter Beschluss.',
 ('Worum es geht', True),
 ['Das Angebot von Infomotion für die Celonis-Ausbaustufe 2 liegt mit 47.412 EUR (32 PT, zehn Wochen) deutlich über der Planung vom Juni. Grund sind die höhere Komplexität und die erweiterten fachlichen Anforderungen aus den Tests seit August (Mehrfachagenten, Anpassung der VNR-Logik, Anforderung weiterer Unterlagen, KI-Deckblatt und EMWS-Anbindung, Lasttest).',
  'Die IT-Aufwände 2026 steigen damit von 66.900 EUR auf 113.592 EUR. Dem stehen 75.000 EUR im MBS-Budget 2026 gegenüber, es fehlen also 38.592 EUR.',
  'Vorschlag zur Diskussion: Ausbaustufe 2 wird wie geplant 2026 umgesetzt, 8.820 EUR laufen noch über das MBS-Budget 2026, der Restanteil von 38.592 EUR wird als Kosten 2027 abgerechnet. Nach dem zugesagten HS-Beitrag von 25.000 EUR bleiben davon 13.592 EUR ungedeckt; hinzu kommt 2027 die Bot-Wartung von 10.000 EUR (MTB), sodass für 2027 insgesamt 23.592 EUR zu klären sind (AI-Lizenz 2027 noch offen).',
  'Die EMWS-Anbindung ziehen wir vor, damit der Prüf-Bot wie geplant ab Anfang Oktober aufgebaut werden kann.'],
 ('Was wir im Termin klären sollten', True),
 ['Freigabe der Umsetzung 2026 mit Abrechnung des Restanteils in 2027 (Rechnungsstellung Infomotion wäre entsprechend zu vereinbaren).',
  'Bestätigung des HS-Beitrags von 25.000 EUR als Kosten 2027 statt 2026.',
  'Weg zur Finanzierung der ungedeckten 13.592 EUR der Ausbaustufe 2 sowie der Bot-Wartung von 10.000 EUR in 2027 (MBS 2027 oder Fachbereich).'],
 'Die Folien enthalten neben der Budgetentwicklung als Wasserfall auch eine Aufschlüsselung je Position, die Leistungspakete der Ausbaustufe 2 sowie im Backup das neue Agentenkonzept. Wenn ihr vorab Anmerkungen oder Korrekturen zu den Zahlen habt, gerne kurz melden, dann passe ich die Unterlage noch vor dem Termin an.',
 'Bis nachher,\nEike',
]

def txt():
    o = []
    for a in absaetze:
        if isinstance(a, tuple): o.append(a[0])
        elif isinstance(a, list): o += ['- ' + b for b in a]
        else: o.append(a)
        o.append('')
    return '\n'.join(o).rstrip() + '\n'

def htm():
    st = 'font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:0 0 10px 0'
    o = [f'<div style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a">']
    for a in absaetze:
        if isinstance(a, tuple): o.append(f'<p style="{st};font-weight:bold;color:{ROT}">{html.escape(a[0])}</p>')
        elif isinstance(a, list): o.append('<ul style="margin:0 0 10px 18px;padding:0">' + ''.join(f'<li style="{st};margin-bottom:4px">{html.escape(b)}</li>' for b in a) + '</ul>')
        else: o.append(f'<p style="{st}">{html.escape(a).replace(chr(10), "<br>")}</p>')
    return ''.join(o) + '</div>'

m = EmailMessage()
m['From'] = 'Brenneisen, Eike <ebrenneisen@deloitte.de>'
m['To'] = 'Martin.Richarz@ergo.de, Klemens.Steiner@ergo.de, Pierre.Boulanger@ergo.de, Claudia.Burnik@ergo.de, Victor.Benjamin.Reinhard.T@ergo.de'
m['Subject'] = 'Abstimmung Budget 2027 Celonis | Unterlage fuer unseren Termin heute 15:30 Uhr'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(ANHANG, 'rb') as f:
    m.add_attachment(f.read(), maintype='application', subtype='vnd.openxmlformats-officedocument.presentationml.presentation', filename='20260917_Abstimmung_Budget_2027_Celonis.pptx')
open(OUT + '.eml', 'wb').write(bytes(m))
open(OUT + '.txt', 'w', encoding='utf-8').write('An: ' + m['To'] + '\nBetreff: ' + m['Subject'] + '\nAnhang: 20260917_Abstimmung_Budget_2027_Celonis.pptx\n\n' + txt())
print('ok')
