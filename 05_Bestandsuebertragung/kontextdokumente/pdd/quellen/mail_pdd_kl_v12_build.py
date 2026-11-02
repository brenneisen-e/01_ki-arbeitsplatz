# -*- coding: utf-8 -*-
"""Mail-Entwurf zur PDD Komposit/Leben v12 (02.10.2026) an N. Garcia-Fernandez (ODPBD): Aktualisierung mit Uebersetzung, Aenderungen,
Erklaerung der Fehlerliste und Frage zum Mahnverfahren im BUE-Bot – alles in einer Mail."""
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
ROT = '#C41230'
ABSENDER = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'

EINLEITUNG = ('danke für eure Kommentare zum PDD Komposit / Leben. Ich habe das PDD wieder aktualisiert (v12, Link unten): Eure Kommentare '
              'und Änderungen sind eingearbeitet, und die englische Übersetzung ist an alle Änderungen im deutschen Text nachgezogen. Was sich '
              'geändert hat, wie die Fehlerliste zu verstehen ist und eine Frage zum Mahnverfahren:')
BLOECKE = [
 ('1. Was ich geändert habe', [
   'Unterlagenprüfung (Vorprüfung): Die Prüfung hat nur noch eine Bedingung. Der Bot merkt eine Prüfnotiz, wenn '
   '<BUE_PRUEFUNG_UNTERLAGEN> einen Mangel nennt („BÜ-Wunsch fehlt“, „MV fehlt“, „MV unvollständig“ oder „VN-Unterschrift fehlt“). '
   'Sind die Unterlagen vollständig, gibt es keine Prüfnotiz und damit auch keine BE – so wie du es angemerkt hast, Nuria. Ist das Feld '
   'leer oder steht dort „Reminder - keine Vollst.-Prüfung“, hat die KI die Unterlagen nicht auf Vollständigkeit geprüft; auch das löst '
   'keine Prüfnotiz aus. Die beiden zusätzlichen Unterbedingungen sind damit entfallen, das Ergebnis bleibt gleich.',
   'Sonderliste TOP-Makler: Der Hinweis lautet jetzt, dass die Sonderliste laufend geprüft und bei Bedarf geändert oder ergänzt werden muss '
   '(bisher „gilt einmalig“). Eure Änderungen an der Liste (Jung, DMS & Cie. Pro und Qualitypool neu, INVERS gestrichen) sind übernommen.',
   'Notiz 1515: Die Felder „Komposit / Leben / KV (Freitext)“ und „Laufende Nr. aus Vorgangsdatenbank“ werden vom Bot nicht befüllt und '
   'bleiben leer. Die Variablentabelle ist entsprechend angepasst.',
   'Unterschrift VN: In der zurückgesandten Fassung lautete die Bedingung <BUE_MV_UNTERSCHRIFT_KUNDE> <> „nein“. Damit wäre die BE '
   '„Unterschrift VN fehlt“ gerade bei vorhandener Unterschrift gekommen. Ich habe sie wieder auf <> „ja“ gesetzt: Beim Makler führt jeder '
   'Wert außer „ja“ (also auch „nein“ und „nicht prüfbar“) zur BE.',
   'KR-Flottenvertrag: Der Hinweis zur Spartenweiche nennt jetzt beides. <BUE_SPARTE> = „KR“ löst die Prüfung im Kapitel IV aus; den '
   'Flottenvertrag erkennt der Bot dann in VA230 an „FK“ im Feld „Sparte/Vers.Art“.',
   'Eure übrigen Änderungen (Ansprechpartner, Postkorb-Nummern AA 23949 und KO 23724, Umgang mit Irrläufern im Bot-Postfach) sind '
   'übernommen. Die Postkorb-Nummern stehen jetzt auch im BE-Handling (Kapitel VII), die englischen Texte dazu sind nachgezogen.',
 ]),
 ('2. Wie die Fehlerliste zu verstehen ist', [
   'Der Bot kennt zwei Arten von Befunden. Eine harte Business Exception (BE) liegt vor, wenn der Vorgang so nicht übertragen werden oder '
   'die Prüfung nicht weitergehen kann, z. B. „Unterschrift VN fehlt“, „Kunde in IS011 nicht gefunden“ oder „KR Flottenvertrag“. Dann '
   'bricht der Bot sofort ab und geht in das BE-Handling (Kapitel VII).',
   'Eine Prüfnotiz ist eine Auffälligkeit, die sich jemand ansehen sollte, die aber kein sofortiger Abbruchgrund ist, z. B. „Unterlagen '
   'nicht vollständig: MV fehlt“, „Geburtsdatum abweichend“ oder „Vermittlertyp abweichend“. Der Bot schreibt sie in die Fehlerliste und '
   'prüft weiter.',
   'So laufen alle Prüfungen bis zum Ende durch, und am Ende stehen alle Auffälligkeiten eines Vorgangs auf einmal da – statt dass der '
   'Vorgang wegen der ersten Abweichung zurückkommt und nach der Korrektur an der nächsten hängen bleibt.',
   'Im Kapitel V „Test auf Fehlerliste“ schaut der Bot, ob die Fehlerliste leer ist. Ist sie leer, bestückt er die Notiz und übergibt den '
   'Vorgang an den 72-Stunden-BOT. Steht mindestens eine Prüfnotiz darin, setzt er die BE „Nachprüfung erforderlich“, und der Vorgang geht '
   'mit Bearbeitungshinweis in den Themenpostkorb.',
   'Der Bearbeitungshinweis hat drei Abschnitte: „BE:“ nennt den Grund, warum der Vorgang ausgesteuert wurde. Unter „Fehler:“ steht jede '
   'Prüfnotiz in einer eigenen Zeile, in der Reihenfolge, in der sie entstanden ist („Fehler: keine“, wenn die Liste leer ist). Unter '
   '„Hinweis:“ stehen alle im Auftrag genannten Versicherungsnummern.',
   'Auch bei einer harten BE stehen die bis dahin gemerkten Prüfnotizen unter „Fehler:“. Ihr seht also immer alle gefundenen Abweichungen '
   'auf einen Blick. Alle möglichen BE-Werte und Prüfnotizen stehen mit Kapitel und Auslöser in den beiden Wertelisten am Ende von Kapitel VII.',
 ]),
 ('3. Verträge im Mahnverfahren', [
   'Der Prüf-Bot prüft Verträge im Mahnverfahren wie alle anderen Verträge und steuert sie nicht aus. Frage: Ist im BÜ-Bot berücksichtigt, '
   'dass Verträge im Mahnverfahren erkannt werden?',
 ]),
]
BEISPIEL_VOR = 'Beispiel für einen Bearbeitungshinweis:'
BEISPIEL = ['BE: Nachprüfung erforderlich', 'Fehler:', 'Unterlagen nicht vollständig: MV fehlt', 'Vermittlertyp abweichend', 'Hinweis:',
            'Weitere VNR: (alle Versicherungsnummern aus dem Auftrag)']
SCHLUSS = 'Die aktualisierte Fassung:'
LINKS = [('PDD Komposit / Leben v12', '[Link PDD_Vorpruefung_BUE_Komposit_Leben_v12.docx]')]


def txt():
    o = ['Hallo Nuria, hallo zusammen,', '', EINLEITUNG, '']
    for kopf, punkte in BLOECKE:
        o.append(kopf)
        o += ['- ' + p for p in punkte]
        if kopf.startswith('2.'):
            o += ['', BEISPIEL_VOR] + ['   ' + z for z in BEISPIEL]
        o.append('')
    o += [SCHLUSS] + ['- ' + k + ': ' + v for k, v in LINKS] + ['', 'Viele Grüße', 'Eike Brenneisen']
    return '\n'.join(o)


def htm():
    e = html.escape
    o = ['<div style="font-family:Arial,sans-serif;font-size:11pt;color:#1a1a1a;max-width:820px">',
         '<p>Hallo Nuria, hallo zusammen,</p><p>' + e(EINLEITUNG) + '</p>']
    for kopf, punkte in BLOECKE:
        o.append('<p style="margin:14px 0 4px;font-weight:bold;color:' + ROT + '">' + e(kopf) + '</p><ul style="margin:0 0 0 18px;padding:0">')
        o += ['<li style="margin:0 0 5px;color:#333">' + e(p) + '</li>' for p in punkte]
        o.append('</ul>')
        if kopf.startswith('2.'):
            o.append('<p style="margin:8px 0 4px">' + e(BEISPIEL_VOR) + '</p><div style="margin:0 0 0 18px;padding:8px 12px;background:#f3f4f6;'
                     'border-radius:4px;font-family:Consolas,monospace;font-size:10pt;line-height:1.5">' + '<br>'.join(e(z) for z in BEISPIEL) + '</div>')
    o.append('<p style="margin-top:14px">' + e(SCHLUSS) + '</p><ul style="margin:0 0 0 18px;padding:0">' +
             ''.join('<li style="margin:0 0 5px">' + e(k) + ': <span style="background:#fff3b0">' + e(v) + '</span></li>' for k, v in LINKS) +
             '</ul><p>Viele Grüße<br>Eike Brenneisen</p></div>')
    return ''.join(o)


def schreiben(out, an, cc, betreff, text, html_text):
    m = EmailMessage()
    m['From'] = ABSENDER
    m['To'] = an
    if cc:
        m['Cc'] = cc
    m['Subject'] = betreff
    m['Date'] = formatdate(localtime=True)
    m['X-Unsent'] = '1'
    m.set_content(text, cte='base64')
    m.add_alternative(html_text, subtype='html', cte='base64')
    with open(out + '.eml', 'wb') as f:
        f.write(bytes(m))
    open(out + '.txt', 'w', encoding='utf-8').write('An: ' + an + ('\nCc: ' + cc if cc else '') + '\nBetreff: ' + betreff + '\n\n' + text)
    print('geschrieben:', out + '.eml/.txt')


schreiben(P + '/Mail_Entwurf_PDD_v12_Komposit_Leben_021026', 'Nuria.Garcia-Fernandez@ergo.de',
          'Kamil.Rypa@ergo.de, Dirk.Amend@ergo.de, Tanja.Juraschek@ergo.de, Marcus.Koch@ergo.de',
          'Makler BUE meets KI | PDD Komposit / Leben aktualisiert (v12)', txt(), htm())
