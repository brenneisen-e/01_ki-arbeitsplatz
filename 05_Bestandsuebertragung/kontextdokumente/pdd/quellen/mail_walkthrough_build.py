# -*- coding: utf-8 -*-
from email.message import EmailMessage
from email.utils import formatdate
import html

P='/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT=P+'/Mail_Entwurf_Walkthrough_Pruefprozess_210926'
ANH=P+'/Prozess_Pruef-Bot_BUE_8_Schritte.html'
ROT='#C41230'

absaetze=[
 'Hallo zusammen,',
 'danke für den Austausch heute Morgen. Mir ist dabei noch einmal aufgefallen, wie schwer sich unser Prozess im PDD-Format diskutieren lässt — die Prüfungen stehen dort über mehrere Kapitel verteilt, und der rote Faden geht beim Lesen leicht verloren. Das liegt nicht an uns, sondern am Format.',
 'Deshalb habe ich unseren aktuellen Diskussionsstand einmal als Walkthrough aufbereitet: den gesamten Prüfprozess am Stück, von der Vorgangseröffnung bis zur Übertragung. Damit würde ich morgen um 09:30 Uhr gerne gemeinsam mit euch durchgehen — besonders durch die heute abgestimmte IS011-Logik, die wir sowohl für den Partner beziehungsweise Versicherungsnehmer als auch für den aufnehmenden Makler nutzen würden.',
 ('Was ihr darin findet', True),
 ['Den Prüfprozess in acht Schritten mit allen Unterschritten.',
  'Je Unterschritt: welches Datenpoolfeld gelesen wird, was geprüft wird und was bei ja und bei nein passiert — Business Exception, Prüfnotiz oder weiter.',
  'Zu jedem Schritt die Fundstelle in der PDD mit dem dortigen Schrittnamen, damit wir jederzeit zwischen beidem wechseln können.',
  'Die IS011-Logik an beiden Stellen: für den Kunden in Schritt 3 mit der Bewertungsmatrix, neu auch für den aufnehmenden Makler in Schritt 5.',
  'Vertiefungen zu Makler, Pool und Untervollmacht sowie zur Notiz Feld für Feld, dazu alle Abbruchgründe und Prüfnotizen im Überblick.',
  'Am Ende die Zuordnung jedes Schritts zum PDD-Kapitel samt Änderungsbedarf und die offenen Punkte.'],
 ('Wie ich mir das morgen vorstelle', True),
 'Wir gehen Schritt für Schritt durch. An jedem Schritt gibt es zwei Knöpfe: „Bestätigt“ setzt einen grünen Haken, „Zu prüfen“ öffnet zwei Felder für die offene Frage und für den Namen dessen, der sie mitnimmt. So sehen wir am Ende der Runde unmittelbar, was steht und was noch offen ist — und ich kann den Stand anschließend als Datei mit euch teilen.',
 'Mein Ziel für morgen ist, einmal gesamthaft durch den Prozess zu kommen. Was danach offen bleibt, nehme ich auf und arbeite es in die PDD ein.',
 ('Vorab', True),
 'Wenn ihr Lust und Zeit habt, schaut gerne schon einmal hinein — die Datei öffnet sich einfach im Browser, es wird nichts installiert und nichts übertragen. Und wenn es nicht klappt, ist das überhaupt kein Problem: Ich führe morgen durch.',
 'Falls ihr vorab schon einen Gedanken dazu habt, würde mich vor allem zweierlei interessieren, weil es den größten Einfluss auf die PDD hat: ob harte Business Exceptions künftig ausschließlich aus dem KI-Deckblatt entstehen sollen und alles Weitere als Befund in die Fehlerliste läuft — und ob wir die Vermittlerprüfung über IS011 führen, mit der eingereichten Agentur- oder Personalnummer nur noch als Bestätigung des Treffers.',
 'Ich freue mich auf morgen.',
 'Beste Grüße\nEike',
]

def txt():
    o=[]
    for a in absaetze:
        if isinstance(a,tuple): o.append(a[0])
        elif isinstance(a,list): o+=['- '+b for b in a]
        else: o.append(a)
        o.append('')
    return '\n'.join(o).rstrip()+'\n'

def htm():
    st='font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:0 0 10px 0'
    o=['<div style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a">']
    for a in absaetze:
        if isinstance(a,tuple): o.append(f'<p style="{st};font-weight:bold;color:{ROT}">{html.escape(a[0])}</p>')
        elif isinstance(a,list): o.append('<ul style="margin:0 0 10px 18px;padding:0">'+''.join(f'<li style="{st};margin-bottom:4px">{html.escape(b)}</li>' for b in a)+'</ul>')
        else: o.append(f'<p style="{st}">{html.escape(a).replace(chr(10),"<br>")}</p>')
    return ''.join(o)+'</div>'

m=EmailMessage()
m['From']='Brenneisen, Eike <ebrenneisen@deloitte.de>'
m['To']='Tanja.Juraschek@ergo.de, Marco.Jeglorz.extern@ergo.de, Anika.Wesche@ergo.de, Marcus.Koch@ergo.de, Kamil.Rypa@ergo.de'
m['Cc']='Dirk.Amend@ergo.de, Eike.Brenneisen.extern@ergo.de'
m['Subject']='Vorpruefung BUE | Walkthrough durch den Pruefprozess – Termin morgen 09:30 Uhr'
m['Date']=formatdate(localtime=True); m['X-Unsent']='1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(ANH,'rb') as f:
    m.add_attachment(f.read(), maintype='text', subtype='html',
        filename='Prozess_Pruef-Bot_BUE_8_Schritte.html')
open(OUT+'.eml','wb').write(bytes(m))
open(OUT+'.txt','w',encoding='utf-8').write('An: '+m['To']+'\nCc: '+m['Cc']+'\nBetreff: '+m['Subject']+'\nAnhang: Prozess_Pruef-Bot_BUE_8_Schritte.html\n\n'+txt())
print('ok')
