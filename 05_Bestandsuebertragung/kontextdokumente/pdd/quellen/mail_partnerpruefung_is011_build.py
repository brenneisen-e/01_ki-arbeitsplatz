# -*- coding: utf-8 -*-
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/Mail_Entwurf_Partnerpruefung_IS011_170926'
ROT = '#C41230'

absaetze = [
 'Hallo zusammen,',
 'Tanja und ich haben gerade kurz telefoniert. Sie hat einen Vorschlag für die Prüfung des Versicherungsnehmers eingebracht, den ich hier festhalte, damit ihr ihn bis zu unserem Termin am Montag einmal mitdenken könnt.',
 ('Ausgangslage im PDD', True),
 'Im Schritt I „VN – Stammdaten + VNR“ gleicht der Prüf-Bot heute die Stammdaten des Versicherungsnehmers Feld für Feld gegen IS100 ab: Nachname und Vorname über den Scout-Service, dazu Geburtsdatum, Straße und PLZ direkt aus der Maske. Jede Abweichung wird als eigene Prüfnotiz in der Fehlerliste vermerkt (Vorname, Geburtsdatum, Straße, PLZ abweichend). Für die Straße ist der Vergleich zweistufig beschrieben, mit einer Normalisierung der Schreibweisen (Str./Straße, Leerzeichen, Hausnummer). Das ist fachlich richtig, aber sehr starr: Ein Zeichen Unterschied in der Straße reicht für eine Prüfnotiz, obwohl es eindeutig derselbe Kunde ist.',
 ('Vorschlag von Tanja: Partnersuche über IS011', True),
 'Statt die einzelnen Felder zeichengenau zu vergleichen, sucht der Bot den Kunden im Partnersystem IS011 mit den Angaben aus dem Auftrag: Name des Kunden, Geburtsdatum und die ersten drei bis vier Zeichen der Straße. Liefert die Suche genau einen Partner, vergleicht der Bot dessen Kundennummer mit der Kundennummer des Versicherungsnehmers am Vertrag (VA230 bzw. Kundenverbindung in IS100). Stimmen die Kundennummern überein, ist die Identität des Versicherungsnehmers bestätigt. Findet die Suche keinen oder mehrere Partner, oder weicht die Kundennummer ab, geht der Vorgang mit einer entsprechenden Prüfnotiz in die Fehlerliste.',
 ['Der Bot prüft damit, was fachlich gemeint ist: Ist der im Auftrag genannte Kunde der Versicherungsnehmer des Vertrags? Schreibweisen der Straße oder ein Kürzel im Vornamen führen nicht mehr automatisch zu einer Prüfnotiz.',
  'Die Suche nutzt die Toleranz, die IS011 ohnehin bietet (Teilstring auf die Straße, Suche über Name und Geburtsdatum).',
  'Der Scout-Service zur Trennung von Nach- und Vorname und die Normalisierungsregeln für die Straße würden entfallen. Der Bot hätte einen Systemaufruf weniger.'],
 ('Wo das im PDD wirken würde', True),
 ['Schritt I „VN – Stammdaten + VNR“: Die drei Teilschritte Namensprüfung, Geburtsdatum und Adressprüfung (jeweils Anwendung IS100) würden durch einen Schritt „Partnersuche und Abgleich der Kundennummer (Anwendung IS011)“ ersetzt. Die VNR-Prüfung und der Vertragsstatus in VA230 bleiben unverändert.',
  'Prüfnotizen: Statt „Vorname abweichend“, „Geb.-Datum abweichend“, „Straße abweichend“ und „PLZ abweichend“ gäbe es eine Prüfnotiz je Ergebnis der Suche, etwa „VN in IS011 nicht gefunden“, „VN in IS011 nicht eindeutig“ und „Kundennummer abweichend“. Die Bezeichnungen lege ich als Vorschlag an, die endgültigen Texte müssten wir gemeinsam festlegen.',
  'Variablentabelle: Die Variablen IS100-Nachname, IS100-Vorname, IS100-Gebdat, IS100-Strasse und IS100-PLZ entfallen; neu kämen IS011-KNR (Kundennummer des gefundenen Partners) und die Kundennummer des Versicherungsnehmers am Vertrag hinzu.',
  'Systemtabelle und Design: IS011 als weitere lesende Anwendung, Scout-Service und IS100-Stammdatenabgleich entfallen. Wiederanlauf bleibt unkritisch, da der Schritt lesend ist.',
  'Datenpool und Deckblatt: Keine Änderung. BUE_KUNDE_NACHNAME, BUE_KUNDE_VORNAME, BUE_KUNDE_GEBDAT und BUE_KUNDE_STRASSE werden weiterhin gebraucht, nur anders genutzt (als Suchkriterien statt als Vergleichswerte).',
  'Ablaufdiagramm und Walkthrough würde ich entsprechend nachziehen.'],
 ('Was wir am Montag klären sollten', True),
 ['Suchlogik in IS011: Welche Felder sind Pflicht, wie verhält sich die Suche bei Namensvarianten und Umlauten, und lässt sich die Straße wirklich als Teilstring mit drei bis vier Zeichen suchen?',
  'Kundennummer am Vertrag: Aus welcher Maske (VA230 oder IS100) liest der Bot die Kundennummer des Versicherungsnehmers, gegen die verglichen wird?',
  'Juristische Personen und Vorgänge ohne Geburtsdatum: Reichen Name und Straße für eine eindeutige Suche, oder bleibt hier der bisherige Abgleich?',
  'Mehrfachtreffer: Prüfnotiz und manuelle Bearbeitung, oder zusätzliche Eingrenzung über PLZ?',
  'Gilt der Ansatz für KV und Komposit/Leben gleichermaßen?'],
 ('Vorgehen bis zum 22.09.', True),
 'Wir haben gerade im Jour fixe besprochen, dass wir am Montag in der Runde die KV-PDD möglichst abschließen wollen. Ab dem 22.09. schreiben und finalisieren wir dann die PDD Komposit/Leben, die Marco heute im SharePoint angelegt hat. Der Vorschlag zur Partnerprüfung sollte deshalb am Montag entschieden werden, damit er in beide PDD gleich einfließt und wir die KV-PDD nicht nachträglich noch einmal aufmachen müssen.',
 'Ich habe im PDD noch nichts geändert. Wenn ihr den Ansatz teilt, arbeite ich ihn nach dem Termin ein und stelle die geänderten Stellen wieder mit Kommentarprotokoll bereit. Es wäre gut, wenn ihr bis Montag einmal draufschauen könntet, vor allem Tanja und Marco für die Bot-Seite und Anika und Marcus für die fachliche Sicht.',
 'Viele Grüße\nEike',
]

def txt():
    o=[]
    for a in absaetze:
        if isinstance(a, tuple): o.append(a[0])
        elif isinstance(a, list): o += ['- ' + b for b in a]
        else: o.append(a)
        o.append('')
    return '\n'.join(o).rstrip() + '\n'

def htm():
    st='font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:0 0 10px 0'
    o=['<div style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a">']
    for a in absaetze:
        if isinstance(a, tuple): o.append(f'<p style="{st};font-weight:bold;color:{ROT}">{html.escape(a[0])}</p>')
        elif isinstance(a, list): o.append('<ul style="margin:0 0 10px 18px;padding:0">' + ''.join(f'<li style="{st};margin-bottom:4px">{html.escape(b)}</li>' for b in a) + '</ul>')
        else: o.append(f'<p style="{st}">{html.escape(a).replace(chr(10), "<br>")}</p>')
    return ''.join(o)+'</div>'

m=EmailMessage()
m['From']='Brenneisen, Eike <ebrenneisen@deloitte.de>'
m['To']='Tanja.Juraschek@ergo.de, Marco.Jeglorz.extern@ergo.de, Anika.Wesche@ergo.de, Marcus.Koch@ergo.de, Kamil.Rypa@ergo.de, Dirk.Amend@ergo.de'
m['Cc']='Eike.Brenneisen.extern@ergo.de'
m['Subject']='AW: robotics@PV - Vorpruefung BUE | Vorschlag Partnerpruefung ueber IS011 statt Feldvergleich in IS100'
m['Date']=formatdate(localtime=True); m['X-Unsent']='1'
m.set_content(txt(), cte='base64'); m.add_alternative(htm(), subtype='html', cte='base64')
open(OUT+'.eml','wb').write(bytes(m))
open(OUT+'.txt','w',encoding='utf-8').write('An: '+m['To']+'\nCc: '+m['Cc']+'\nBetreff: '+m['Subject']+'\n\n'+txt())
print('ok')
