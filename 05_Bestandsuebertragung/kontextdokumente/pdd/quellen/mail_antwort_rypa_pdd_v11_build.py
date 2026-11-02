# -*- coding: utf-8 -*-
"""Mail-Entwurf: Antwort auf die Rueckmeldung von K. Rypa (25.09.2026) zu den PDDs v10; Stand v11."""
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/Mail_Entwurf_Antwort_Rypa_PDD_v11_250926'
ROT = '#C41230'

EINLEITUNG = ('danke, Kamil, für die schnelle Rückmeldung und die Screenshots. Ich habe beides in die Dokumente übernommen und die beiden PDDs '
              'sauber neu gesetzt (v11, Links unten): gleiche Struktur wie bisher, Inhaltsverzeichnis und Bildgrößen neu, alle eingefügten '
              'Screenshots an ihrer Stelle mit Bildunterschrift. Zu den einzelnen Punkten – Erklärungen stehen normal, Fragen an euch sind '
              'als „Frage“ markiert:')
# je Punkt: ('info', Text) = Erklaerung / Stand, ('frage', Text) = Frage an den Verteiler
BLOECKE = [
 ('1. Vermittlertyp – eure Rückfrage', [
   ('info', 'Nein, nicht jeder Vermittler, der kein Makler ist, wird zur BE. Der MFA-Zweig ist in der Vorprüfung beschrieben: Beim Mehrfachagenten '
    'prüft der Bot, ob der BÜ-Wunsch vorliegt und der Betreuungswunsch auf den MFA ausgestellt ist; eine Vollmacht braucht er nicht. Danach '
    'läuft der MFA dieselbe Prüfstrecke wie der Makler (Kunde in IS011, Bestandsinhaber, Vermittler in OB726, Vertrag in VA230, Notiz).'),
   ('info', 'Der Vorschlag betraf nur den leeren Vermittlertyp: leer und „Fremdversicherungsunternehmen“ laufen wie Makler, also mit Prüfung der '
    'unterschriebenen Maklervollmacht. Es bleibt also alles in dieser Ausbaustufe, nichts wird verschoben.'),
   ('info', 'Neu gegenüber dem Stand, den ihr in der Hand hattet (abgestimmt am 24.09. mit Marcus Koch und Stefan Schwarz): „Courtagefortzahler“ und '
    '„Kontaktgeber“ (Tippgeber) erhalten keine Bestände. Der Bot setzt bei diesen Typen als erste Prüfung die BE „Keine Bestandsübertragung '
    'möglich: <Typ>“ und gibt den Vorgang mit Bearbeitungshinweis an die Sachbearbeitung, die die Ablehnung versendet. Das steht jetzt in beiden PDDs.'),
   ('info', 'Die Werteliste des Vermittlertyps ist damit: Makler, MFA, Courtagefortzahler, Kontaktgeber; leer und „Fremdversicherungsunternehmen“ '
    'laufen wie Makler.'),
 ]),
 ('2. KR-Flottenvertrag (Komposit / Leben)', [
   ('info', 'Übernommen: Der Bot liest in VA230 (VAF230 „Anzeige steuerrelevanter Daten“) das Feld „Sparte/Vers.Art“; die Versicherungsart „FK“ führt '
    'zur BE „KR Flottenvertrag“, „KR“ ist ein normaler KR-Vertrag. Jeder Vertrag unter einem Mantel wird ausgesteuert, nicht nur der Mantel '
    'selbst. Die KM001-Variante ist raus, dein Screenshot der Flotte steht im Kapitel IV.'),
 ]),
 ('3. Themenpostkörbe und AO-Erkennung', [
   ('info', 'Die vier Bezeichnungen sind in beiden PDDs eingetragen: „HSB4 K 72 - Erstinformation“ (alle Vorgänge ohne Befund), „HSB4 K MV Gesundheit '
    'Posteingang“ (KV mit Befund), „HSB4 K KO Komposit / Leben Posteingang“ (Komposit / Leben mit Befund, abgebender Bestandsinhaber AO) und '
    '„ODPP1 D - Ma/Ma Bestandsübertragungen“ (Komposit / Leben mit Befund, Makler- und Kooperationsvertrieb). Die Postkorb-Nummern stehen weiter auf TBD.'),
   ('frage', 'Reicht dem Bot für die Weiterleitung die Bezeichnung des Themenpostkorbs, oder wird die Nummer aus der Postkorbverwaltung gebraucht?'),
   ('info', 'AO-Erkennung über den Vertriebskanal in OB726 ist übernommen: Die Kanäle 2200, 2215, 2271, 2281, 2300, 2301, 2302 und 2400 gehören zum '
    'Makler- und Kooperationsvertrieb und führen nach ODPP1 D; alle übrigen Kanäle gelten als AO (z. B. 2050, 2100, 2111, 2130, 2151, 2800) '
    'und führen nach HSB4 K KO.'),
   ('frage', 'Kamil, gehört 2720 zum Maklervertrieb? Und sind die acht Makler/Koop-Kanäle aus deiner Mail die vollständige Liste aus deiner '
    'Excel-Beilage (2111 stand doppelt)? Passt die Regel „alles außer Makler/Koop ist AO“ so?'),
 ]),
 ('4. Screenshots – Stand', [
   ('info', 'KI-Deckblatt: eingefügt, steht jetzt in der Vorprüfung (Ausschlusskriterien aus dem KI-Deckblatt). Der Platzhalter auf S. 19 meint etwas '
    'anderes, nämlich den Datensatz im Datenpool (Felder BUE_*), den der Bot liest; dafür brauchen wir einen Screenshot aus dem Datenpool '
    'selbst. Der bleibt offen.'),
   ('info', 'IS011: die geschwärzten Match-Code-Screens sind in beiden Fassungen übernommen. OB726 zum abgebenden Bestandsinhaber bleibt, wie er ist. '
    'OB729 (Betreuungsvermerk mit E-Mail-Adresse) ist in beiden Fassungen drin.'),
   ('info', 'KV-Notizvorlage BOT2011: drin, ersetzt in der KV-Fassung die Maske 1515. Die Feldtabelle im Kapitel VI folgt weiterhin dem Aufbau der '
    'Maske 1515; ob der Bot die Vorlage BOT2011 bestückt oder eine Freitextnotiz erzeugt, ist noch offen (Punkt 5).'),
   ('info', 'Komposit / Leben: Die übrigen Hostmasken bleiben die KV-Screenshots, die Masken sind spartenunabhängig; nur VA230 zeigt jetzt einen '
    'KR-Vertrag. So passt es. Der Bearbeitungshinweis Komposit / Leben (Kapitel VII) bleibt als Platzhalter (Punkt 5).'),
 ]),
 ('5. Weiterhin offen – Fragen an den Verteiler', [
   ('frage', 'Notizvorlage KV: Bestückt der Bot die Vorlage BOT2011, oder erzeugt er eine Freitextnotiz mit demselben Aufbau?'),
   ('frage', 'Bearbeitungshinweis Komposit / Leben: Welche Anwendung und welche Vorlage werden dafür genutzt (bei KV ist es ErgoNotiz, Vorlage 2011)?'),
   ('frage', 'Involvierte Geschäftsbereiche: Wie lauten Gruppe, Abteilung und Standort der beteiligten Einheiten (Fachbereiche KV und Komposit / Leben '
    'sowie die bauende Einheit)?'),
   ('frage', 'Abnahmeumgebung: Welche Postkörbe werden dort genutzt, und ab wann steht die Umgebung mit dem PTU-Abzug für die Tests bereit?'),
 ]),
]
SCHLUSS = 'Die beiden PDDs in der Fassung v11:'
LINKS = [
 ('PDD Gesundheit (KV) v11', '[Link PDD_Vorpruefung_BUE_Gesundheit_KV_v11.docx]'),
 ('PDD Komposit / Leben v11', '[Link PDD_Vorpruefung_BUE_Komposit_Leben_v11.docx]'),
]
SCHLUSS2 = ('Die QS mit den KV-Kollegen Ende nächster Woche passt. Rückmeldungen gern wieder direkt in den Dokumenten oder in der Mail, '
            'dann arbeite ich sie wie diesmal Punkt für Punkt ein.')


def txt():
    o = ['Hallo zusammen,', '', EINLEITUNG, '']
    for kopf, punkte in BLOECKE:
        o.append(kopf)
        o += [('- FRAGE: ' if art == 'frage' else '- ') + p for art, p in punkte]
        o.append('')
    o += [SCHLUSS] + ['- ' + k + ': ' + v for k, v in LINKS] + ['', SCHLUSS2, '', 'Viele Grüße', 'Eike Brenneisen']
    return '\n'.join(o)


def htm():
    e = html.escape
    o = ['<div style="font-family:Arial,sans-serif;font-size:11pt;color:#1a1a1a;max-width:820px">',
         '<p>Hallo zusammen,</p><p>' + e(EINLEITUNG) + '</p>']
    for kopf, punkte in BLOECKE:
        o.append('<p style="margin:14px 0 4px;font-weight:bold;color:' + ROT + '">' + e(kopf) + '</p><ul style="margin:0 0 0 18px;padding:0">')
        for art, p in punkte:
            if art == 'frage':
                o.append('<li style="margin:0 0 6px"><span style="background:#fff3b0;padding:1px 3px"><b style="color:' + ROT + '">Frage:</b> ' + e(p) + '</span></li>')
            else:
                o.append('<li style="margin:0 0 5px;color:#333">' + e(p) + '</li>')
        o.append('</ul>')
    o.append('<p style="margin-top:14px">' + e(SCHLUSS) + '</p><ul style="margin:0 0 0 18px;padding:0">' +
             ''.join('<li style="margin:0 0 5px">' + e(k) + ': <span style="background:#fff3b0">' + e(v) + '</span></li>' for k, v in LINKS) +
             '</ul><p>' + e(SCHLUSS2) + '</p><p>Viele Grüße<br>Eike Brenneisen</p></div>')
    return ''.join(o)


m = EmailMessage()
m['From'] = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'
m['To'] = 'Kamil.Rypa@ergo.de'
m['Cc'] = ('Tanja.Juraschek@ergo.de, Nuria.Garcia-Fernandez@ergo.de, Marcus.Koch@ergo.de, Dirk.Amend@ergo.de, Anika.Wesche@ergo.de, '
           'Alexandra.Mai@ergo.de, Niels.Luetke@ergo.de, Inge.Lorusso@ergo.de, Faisal.Noorzy@ergo.de, Marco.Jeglorz.extern@ergo.de')
m['Subject'] = 'AW: Makler BUE meets KI | PDDs KV/Non-KV mit der Bitte um QS'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(OUT + '.eml', 'wb') as f:
    f.write(bytes(m))
open(OUT + '.txt', 'w', encoding='utf-8').write('An: ' + m['To'] + '\nCc: ' + m['Cc'] + '\nBetreff: ' + m['Subject'] + '\n\n' + txt())
print('geschrieben:', OUT + '.eml/.txt')
