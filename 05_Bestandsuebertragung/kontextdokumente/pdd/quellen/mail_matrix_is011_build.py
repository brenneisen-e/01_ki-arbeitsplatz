# -*- coding: utf-8 -*-
from email.message import EmailMessage
from email.utils import formatdate
import html

P='/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT=P+'/Mail_Entwurf_Bewertungsmatrix_IS011_210926'
ANH=P+'/20260921_Kundenpruefung_IS011_Bewertungsmatrix.pptx'
ROT='#C41230'

absaetze=[
 'Hallo zusammen,',
 'anbei mein Vorschlag, wie die Prüfung des Kunden im Prüf-Bot künftig aussehen könnte. Er baut auf Tanjas Idee auf, die Identität über eine Partnersuche in IS011 festzustellen, statt einzelne Stammdatenfelder in IS100 zeichengenau zu vergleichen. Ich habe die Logik zu Ende gedacht und in eine Bewertungsmatrix gegossen. Das ist ausdrücklich ein Vorschlag von mir und noch nichts Abgestimmtes; ich bitte euch, ihn zu bestätigen oder zu korrigieren.',
 ('Worum es geht', True),
 'Heute vergleicht der Bot fünf Felder einzeln: Nachname, Vorname, Geburtsdatum, Straße und Postleitzahl. Jede Abweichung erzeugt eine eigene Prüfnotiz, und über die Fehlerliste wird daraus am Ende eine Business Exception. Ein Umzug oder ein Rufname reicht also, um einen Vorgang auszusteuern, obwohl erkennbar derselbe Kunde gemeint ist.',
 'Der Vorschlag dreht das um. Der Bot sucht den Partner in IS011 mit Vorname, Nachname, Geburtsdatum, Postleitzahl und den ersten zwei Buchstaben der Straße. Er übernimmt alle Treffer mit dem Status „VN“, lässt sich zu jeder Kundennummer die Versicherungsnummern geben und prüft, ob die Nummer des Vorgangs darunter ist. Genau das ist der Identitätsnachweis: Der Vertrag gehört zu diesem Kunden. Mehrfachtreffer sind damit unkritisch.',
 'Die Stammdaten braucht es danach nur noch als Gegenprobe gegen den Fall „richtige Versicherungsnummer, falsche Person“. Und diese Gegenprobe bewertet die Matrix in der Kombination statt Feld für Feld.',
 ('Die Matrix in einem Satz', True),
 ['Nachname und Geburtsdatum stimmen: Kunde bestätigt, egal wie Adresse und Vorname aussehen.',
  'Nachname stimmt, Geburtsdatum fehlt, dafür Postleitzahl und Straße: Kunde bestätigt. Das ist der Fall der juristischen Person.',
  'Ein tragendes Merkmal weicht ab, das andere stützt den Treffer: Prüfnotiz, etwa bei Heirat oder Tippfehler im Datum.',
  'Nachname und Geburtsdatum widersprechen beide: Abbruch, dann ist vermutlich eine andere Person gemeint.'],
 'Die vollständige Matrix mit allen neun Kombinationen steht auf Folie 4. Auf Folie 5 habe ich zusätzlich den Abgleich des Vollmachtgebers aufgenommen: Der Name auf der Maklervollmacht sollte zum gefundenen Partner passen, sonst hat nicht der Versicherungsnehmer die Vollmacht erteilt. Als eigener Prüfschritt steht das bisher nicht in der PDD.',
 ('Was ich von euch bräuchte', True),
 ['Reicht der Treffer über die Versicherungsnummer als Identitätsnachweis, oder wollen wir die Stammdaten als Gegenprobe in jedem Fall behalten?',
  'Sind Nachname und Geburtsdatum aus eurer Sicht die tragenden Merkmale, oder soll die Adresse stärker zählen?',
  'Wo soll die Grenze zwischen Prüfnotiz und Abbruch verlaufen? Ich habe sie bewusst großzügig gezogen, weil die Versicherungsnummer bereits an der Kundennummer hängt. Strenger hieße: Jede Zeile mit Prüfnotiz wird zum Abbruch.',
  'Wie streng prüfen wir den Namen des Vollmachtgebers, und was gilt, wenn die Vollmacht auf eine Firma lautet und der Versicherungsnehmer eine natürliche Person ist?'],
 'Technisch offen bleiben die Pflichtfelder und die Toleranz der Suche in IS011, ob sich die Straße wirklich als Teilstring mit zwei Buchstaben suchen lässt, und welche Schnittstelle je Kundennummer die Versicherungsnummern liefert. Das würde ich mit dem Partnerteam klären, sobald der fachliche Teil steht.',
 'Wenn ihr den Ansatz teilt, arbeite ich die Matrix in die PDD Gesundheit/KV ein und übernehme sie direkt in die PDD Komposit/Leben. Damit entfallen dort die drei Abschnitte zur Namens-, Geburtsdatums- und Adressprüfung samt Scout-Service-Aufruf und den Normalisierungsregeln für die Straße.',
 'Viele Grüße\nEike',
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
m['Subject']='Vorpruefung BUE | Kundenpruefung ueber IS011: Bewertungsmatrix als Vorschlag – Bitte um Bestaetigung'
m['Date']=formatdate(localtime=True); m['X-Unsent']='1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(ANH,'rb') as f:
    m.add_attachment(f.read(), maintype='application',
        subtype='vnd.openxmlformats-officedocument.presentationml.presentation',
        filename='20260921_Kundenpruefung_IS011_Bewertungsmatrix.pptx')
open(OUT+'.eml','wb').write(bytes(m))
open(OUT+'.txt','w',encoding='utf-8').write('An: '+m['To']+'\nCc: '+m['Cc']+'\nBetreff: '+m['Subject']+'\nAnhang: 20260921_Kundenpruefung_IS011_Bewertungsmatrix.pptx\n\n'+txt())
print('ok')
