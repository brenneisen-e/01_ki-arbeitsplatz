# -*- coding: utf-8 -*-
"""Mail-Entwurf: PDD v10 (KV und Komposit/Leben) vervollstaendigt und abgeglichen; Bitte um Screenshots und das Flottenthema bei Komposit/Leben."""
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/Mail_Entwurf_PDD_v10_Screenshots_Flotte_230926'
ROT = '#C41230'

EINLEITUNG = ('wie besprochen habe ich die beiden PDDs für Gesundheit (KV) und für Komposit / Leben vervollständigt und gegeneinander '
              'abgeglichen: gleicher Aufbau, gleiche Schrittfolge, gleiche Variablen; die Unterschiede liegen nur in der Notiz, in der '
              'Anforderung von Unterlagen, im Routing am Ende und in der Prüfung auf Mantelvertrag bei KR. Beide Fassungen sind zweisprachig '
              'nach dem Template, alle Kommentare der Reviewrunde sind eingearbeitet. Der Start-Schritt '
              'liest nur noch die Datenpoolfelder, die der Bot tatsächlich braucht; die Variablentabelle führt nur diese Felder. Bei Komposit / Leben '
              'steuert allein BUE_ART_UNTERLAGEN die Kennzeichen „Folgearbeit für Komposit“ in der Notiz (leer = keine Anforderung); '
              'BUE_ANF_UNTERLAGEN wird nicht mehr gelesen.')
ENTSCHEIDUNG = ('Ein Vorschlag von mir zur Reviewfassung, bitte kurz bestätigen (Kommentar 75, T. Juraschek): Die Prüfung auf leeren '
                'Vermittlertyp (BUE_VERMITTLER_TYP) habe ich komplett herausgenommen, weil wir sie meines Erachtens nicht mehr brauchen. Der Wert '
                'steuert nur die Weiche Makler/MFA. Ist er leer, läuft der Vorgang durch den Makler-Zweig, und dort muss eine vom Kunden '
                'unterschriebene Maklervollmacht vorliegen. Fehlt sie, entsteht ohnehin die BE „Unterschrift VN fehlt“; liegt sie vor, machen wir '
                'erst einmal weiter. Den tatsächlichen Typ liest der Bot in Kapitel III aus OB726; nennt OB726 einen Mehrfachagenten, greift die '
                'Prüfnotiz „Vermittlertyp abweichend“, und der Sachbearbeiter prüft den Betreuungswunsch in der Nachprüfung. Damit steht in der '
                'Vorprüfung als Erstes das harte Ausschlusskriterium Agenturnummer, nicht eine weiche Datenlücke. Wenn ihr das anders seht, '
                'nehme ich die Prüfnotiz wieder auf.')
BITTE = 'Vier Dinge brauche ich jetzt noch von euch, damit der Bau beginnen kann:'
BLOECKE = [
 ('1. Screenshots an den richtigen Stellen nachtragen', [
   'Die Tabelle unten nennt je Fassung den Schritt, die Maske, die Seite in der v10 und den Stand. An jeder Stelle steht im Dokument ein '
   'Platzhalter „Screenshot: … – durch Fachbereich/Robotics zu ergänzen“ mit fertiger Bildunterschrift.',
   'Wer kann die Screenshots aus der Abnahmeumgebung ziehen und in die Dokumente einfügen?',
 ]),
 ('2. Komposit / Leben: Flottenthema eintragen (K. Rypa)', [
   'Kapitel „IV. Vertrag“ prüft bei BUE_SPARTE = „KR“ auf Mantelvertrag (VA230-Mantel = „ja“ führt zur BE „KR Flottenvertrag“). Offen ist, '
   'woran der Bot den Mantel erkennt: Feld in VA230 (oder Folgemaske), Ausprägung und ein Screenshot einer Flotte mit führendem Mantel.',
   'Bitte auch bestätigen, ob jeder Vertrag unter einem Mantel als BE endet oder ob nur der Mantel selbst betroffen ist (Einzelfahrzeuge '
   'unter einem Mantel würden dann normal weiterlaufen).',
 ]),
 ('3. Routing am Ende: genaue Themenpostkorb-Bezeichnungen', [
   'Der Bot muss jeden Vorgang am Ende in einen Themenpostkorb weiterleiten. Dafür brauche ich die exakte Bezeichnung und die Postkorb-Nr. – so, wie '
   'sie in der Postkorbverwaltung steht – für: (a) den 72-Stunden-BOT („HSB4K 72“; alle Vorgänge ohne Befund, beide Sparten), '
   '(b) ODPB (Komposit / Leben mit Befund, wenn der abgebende Bestandsinhaber nicht der AO angehört – hier kenne ich den Postkorb noch gar nicht), '
   '(c) „HSB4K MV“ (KV mit Befund) und „HSB4K KO“ (Komposit / Leben mit Befund, abgebender Bestandsinhaber AO).',
   'Dazu die Frage, woran der Bot in OB726 erkennt, dass der abgebende Bestandsinhaber der AO angehört (Ausprägung der Kopfzeile hinter der Vermittler-Nr.).',
 ]),
 ('4. QS der beiden PDDs, vor allem Komposit / Leben', [
   'Bitte lest beide Fassungen noch einmal fachlich gegen. Die KV-Fassung hat die Reviewrunde durchlaufen und enthält alle Kommentare; '
   'die Fassung Komposit / Leben ist daraus abgeleitet und noch von niemandem fachlich geprüft.',
   'Für Komposit / Leben bitte besonders die Stellen prüfen, die von KV abweichen: Notizmaske 1515 mit den Kennzeichen „Folgearbeit für Komposit“ '
   '(Kapitel VI), Anforderung von Unterlagen über BUE_ART_UNTERLAGEN, Prüfung auf Mantelvertrag bei KR (Kapitel IV), Routing am Ende nach AO oder ODPB '
   '(Kapitel VII), Zuordnung der Spartenkürzel zu Komposit und Leben im Notizfeld sowie der Start über GeVo 108.',
   'Rückmeldungen gern als Kommentare direkt im Dokument, dann kann ich sie wie beim letzten Mal je Kommentar abarbeiten.',
 ]),
 ('Weiterhin offen aus der letzten Mail', [
   'Makler auf Makler ist geklärt: Auch diese Vorgänge gehen ohne Befund an den 72-Stunden-BOT. Der erkennt, dass der abgebende Bestandsinhaber ein '
   'Makler ist, und leitet ohne Wartefrist direkt an den BÜ-BOT weiter; eine eigene Weiche im Prüf-Bot entfällt. So steht es jetzt in beiden PDDs.',
   'Notizvorlage bei KV: Die Telefonnotiz für die Krankenversicherung ist in der PDD nach der Vorlage BOT2011 beschrieben. Bestückt der Bot diese '
   'Vorlage, oder erzeugt er eine Freitextnotiz mit demselben Aufbau? Dazu passt der fehlende Screenshot der KV-Notizmaske (Tabelle unten).',
   'Involvierte Geschäftsbereiche: Für das Kapitel „Involvierte Geschäftsbereiche“ fehlen noch Gruppe, Abteilung und Standort der beteiligten '
   'Einheiten (Fachbereiche KV und Komposit / Leben sowie die bauende Einheit).',
   'Abnahmeumgebung: Für den Startpostkorb und die Zielpostkörbe in der Abnahmeumgebung stehen in beiden PDDs noch „TBD (Abnahmeumgebung)“. '
   'Welche Postkörbe werden dort genutzt, und ab wann steht die Umgebung mit dem PTU-Abzug für die Tests bereit?',
 ]),
]
SCREENSHOTS_KOPF = ('Fassung', 'Kapitel / Schritt', 'Seite (v10)', 'Screenshot', 'Stand')
SCREENSHOTS = [
 ('KV und Komposit/Leben', 'Start – Postkorbvorgang und Datenpool lesen', 'KV 20 / KoLe 19', 'Datenpool, Datensatz zum Postkorbvorgang (Felder BUE_*)', 'fehlt – Platzhalter im Dokument'),
 ('KV und Komposit/Leben', 'I – Kundennummer über die Versicherungsnummer (IS011/VAF017)', 'KV 24 / KoLe 23', 'IS011/VAF017 mit Name, Anschrift, Geburtsdatum, Kundennummer', 'vorhanden – bitte bestätigen, dass es Testdaten sind, sonst schwärzen'),
 ('KV und Komposit/Leben', 'II – PNR des Bestandsinhabers lesen (OB726)', 'KV 27 / KoLe 26', 'OB726 zum abgebenden Bestandsinhaber (Betreuung aus VA230)', 'vorhanden, zeigt aber den übernehmenden Makler – passenden Screenshot liefern'),
 ('KV und Komposit/Leben', 'III – E-Mail-Adresse des übernehmenden Vermittlers ermitteln', 'KV 30 / KoLe 29', 'OB729 Vermittlerkommunikation, Feld E-Mail-Adresse', 'fehlt – Platzhalter im Dokument'),
 ('KV', 'VI – Telefonnotiz bestücken', 'KV 32', 'Notizvorlage BOT2011 (Krankenversicherung)', 'heute Maske 1515 als Ersatz – KV-Vorlage liefern'),
 ('Komposit/Leben', 'Start, I, II, III, IV – alle Hostmasken', 'KoLe 19–30', 'Themenpostkorb, IS011, VA230 (heute Sparte Kranken), OB726, GH040', 'heute KV-Screenshots – durch Komposit/Leben-Masken ersetzen'),
 ('Komposit/Leben', 'IV – Vertrag, Prüfung auf Mantelvertrag bei KR', 'KoLe 30', 'VA230 (oder Folgemaske), Feld und Ausprägung für Mantel / Flotte', 'fehlt – Feld noch festzulegen (K. Rypa), siehe Punkt 2'),
 ('Komposit/Leben', 'VII – Abschluss mit Befund', 'KoLe 34', 'Bearbeitungshinweis am Postkorbvorgang (Anwendung und Vorlage Komposit/Leben)', 'fehlt – Platzhalter im Dokument'),
]
SEITEN_HINWEIS = 'Seitenzahlen nach dem Inhaltsverzeichnis der v10 (KV = Gesundheit, KoLe = Komposit / Leben).'

LINKS = [
 ('PDD Gesundheit (KV) v10', '[Link PDD_Vorpruefung_BUE_Gesundheit_KV_v10.docx]'),
 ('PDD Komposit / Leben v10', '[Link PDD_Vorpruefung_BUE_Komposit_Leben_v10.docx]'),
]
SCHLUSS = 'Die beiden PDDs liegen hier:'
SCHLUSS2 = 'Sobald Screenshots, Flottenthema und Postkörbe drin sind, ist die Fassung für den Bau freigabefähig.'


def txt():
    o = ['Hallo zusammen,', '', EINLEITUNG, '', ENTSCHEIDUNG, '', BITTE, '']
    for kopf, punkte in BLOECKE:
        o.append(kopf)
        o += ['- ' + p for p in punkte]
        o.append('')
    o.append('Offene Screenshots')
    o.append(' | '.join(SCREENSHOTS_KOPF))
    o += [' | '.join(z) for z in SCREENSHOTS]
    o += [SEITEN_HINWEIS, '']
    o += [SCHLUSS] + ['- ' + k + ': ' + v for k, v in LINKS] + ['', SCHLUSS2, '', 'Viele Grüße', 'Eike Brenneisen']
    return '\n'.join(o)


def htm():
    e = html.escape
    o = ['<div style="font-family:Arial,sans-serif;font-size:11pt;color:#1a1a1a;max-width:820px">',
         '<p>Hallo zusammen,</p><p>' + e(EINLEITUNG) + '</p><p>' + e(ENTSCHEIDUNG) + '</p><p>' + e(BITTE) + '</p>']
    for kopf, punkte in BLOECKE:
        o.append('<p style="margin:14px 0 4px;font-weight:bold;color:' + ROT + '">' + e(kopf) + '</p><ul style="margin:0 0 0 18px;padding:0">')
        o += ['<li style="margin:0 0 5px">' + e(p) + '</li>' for p in punkte]
        o.append('</ul>')
    o.append('<p style="margin:14px 0 4px;font-weight:bold;color:' + ROT + '">Offene Screenshots</p>'
             '<table style="border-collapse:collapse;font-size:10pt;width:100%"><tr>' +
             ''.join('<th style="text-align:left;border-bottom:2px solid ' + ROT + ';padding:4px 6px">' + e(k) + '</th>' for k in SCREENSHOTS_KOPF) + '</tr>' +
             ''.join('<tr style="background:' + ('#f2f2f2' if i % 2 else '#fff') + '">' + ''.join('<td style="border-bottom:1px solid #ddd;padding:4px 6px;vertical-align:top">' + e(x) + '</td>' for x in z) + '</tr>' for i, z in enumerate(SCREENSHOTS)) +
             '</table><p style="font-size:9pt;color:#555;margin:4px 0 0">' + e(SEITEN_HINWEIS) + '</p>')
    o.append('<p style="margin-top:14px">' + e(SCHLUSS) + '</p><ul style="margin:0 0 0 18px;padding:0">' +
             ''.join('<li style="margin:0 0 5px">' + e(k) + ': <span style="background:#fff3b0">' + e(v) + '</span></li>' for k, v in LINKS) +
             '</ul><p>' + e(SCHLUSS2) + '</p><p>Viele Grüße<br>Eike Brenneisen</p></div>')
    return ''.join(o)


m = EmailMessage()
m['From'] = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'
m['To'] = 'Dirk.Amend@ergo.de, Christoph-Reber.Lucht@ergo.de, Kamil.Rypa@ergo.de, Tanja.Juraschek@ergo.de'
m['Cc'] = 'Marco.Jeglorz.extern@ergo.de, ebrenneisen@deloitte.de'
m['Subject'] = 'Makler BUE meets KI | PDD v10 Pruef-Bot (KV und Komposit/Leben) vervollstaendigt: Screenshots und Flottenthema'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(OUT + '.eml', 'wb') as f:
    f.write(bytes(m))
open(OUT + '.txt', 'w', encoding='utf-8').write('An: ' + m['To'] + '\nCc: ' + m['Cc'] + '\nBetreff: ' + m['Subject'] + '\n\n' + txt())
print('geschrieben:', OUT + '.eml')
