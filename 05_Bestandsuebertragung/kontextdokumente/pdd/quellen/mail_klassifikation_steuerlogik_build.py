# -*- coding: utf-8 -*-
"""Aufstellung aller BUE_KLASSIFIKATION-Auspraegungen mit Vergaberegel und Steuerlogik (EMWS / KWAD)."""
from email.message import EmailMessage
from email.utils import formatdate
import html

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/Mail_Entwurf_Klassifikation_Steuerlogik_230926'
ROT = '#C41230'

WEGE = {
 'A': 'A – Celonis eröffnet über EMWS',
 'B': 'B – KWAD mit Folge-BÜ',
 'C': 'C – KWAD ohne Folge-BÜ',
}

# (Auspraegung, wann vergeben, BUE_WUNSCH_VORHANDEN, Weg, was folgt) - Zeilenumbruch trennt ja/nein
SPARTE = ('ja / nein', 'B / C', 'ja → Sparte zuerst, danach BÜ über den Prüf-Bot; nein → nur Sparte, keine BÜ')
KLASSEN = [
 ('BÜ-Vorgang',
  'Bestandsübertragung mit Maklervollmacht (Makler) oder Betreuungswunsch (MFA, über BUE_VERMITTLER_TYP); auch mit '
  'Anforderung von Unterlagen (BUE_ANF_UNTERLAGEN = ja)',
  'ja\nnein', 'A\nA',
  'Prüf-Bot, danach 72-Stunden-BOT / BÜ-Bot\n'
  'Makler – nicht relevant, die Maklervollmacht belegt den Auftrag, Prüfung wie bei ja; MFA – im Prüf-Bot die BE '
  '„BÜ-Wunsch nicht vorhanden“, weil der Betreuungswunsch der einzige Auftrag ist'),
 ('Kündigung Maklervollmacht (neu, zu bestätigen)',
  'Makler oder Kunde kündigt Vollmacht oder Mandat; fachlich eine BÜ in den Freibestand (M. Koch, 11.09.)',
  'ja', 'A',
  'Prüf-Bot mit MV-Feldern N/A; Übertragung in den Freibestand. KV über den Widerrufs-Bot (Notiz 2013), LV/SU bis '
  'auf Weiteres halbmanuell'),
 ('VN-Wechsel', 'Wechsel oder Änderung des Versicherungsnehmers', *SPARTE),
 ('WEG-Wechsel', 'Wechsel der Wohnungseigentümergemeinschaft (nur Wohngebäude); Behandlung wie VN-Wechsel', *SPARTE),
 ('Kündigung Versicherungsvertrag',
  'Kündigung eines Vertrags, auch unterjährig oder wegen Beitragsanpassung. Nicht: Kündigung der Maklervollmacht',
  *SPARTE),
 ('Verkürzung Kündigungsfrist', 'Bitte um Verkürzung der Kündigungsfrist auf einen Termin', *SPARTE),
 ('Sonstige Fachthemen',
  'Jedes andere erkennbare Sparten-Anliegen: Anfrage oder Rücksprache, Antrag oder Vertragsänderung (z. B. '
  'Adressänderung mit oder ohne Maklervollmacht), Schadenmeldung, Vertragstrennung, Beitragsfreistellung', *SPARTE),
 ('Nicht-Standard', 'Anliegen nicht erkennbar oder nicht zuordenbar; Eingangsmanagement klassifiziert selbst',
  *SPARTE),
 ('Kein-Makler-Vorgang', 'Absender ist kein Vermittler oder es fehlt jeder Vermittlerbezug',
  'nein', 'C', 'Nur Sparte — ohne Vermittler keine Folge-BÜ'),
]

WEGE_DETAIL = [
 ('A – Celonis eröffnet über EMWS (Fall 1 und 2 der GeVo-Steuerung)',
  ['Celonis: Postkorbvorgang je VNR über EMWS, mit E-Mail, allen Anhängen, KI-Deckblatt und Datenpool. Keine Mail '
   'an KWAD.',
   'Eingangsmanagement: nicht beteiligt.',
   'Danach: Prüf-Bot der Sparte. Sauber geprüft → 72-Stunden-BOT / BÜ-Bot. BE oder Prüfnotiz → KV an HSB4K MV; '
   'Komposit/Leben nach abgebendem Bestandsinhaber an ODPB (Makler) oder HSB4K KO.']),
 ('B – KWAD mit Folge-BÜ (Fall 3)',
  ['Celonis: Mail mit allen Anhängen, KI-Deckblatt und Hinweistext an kwad@ergo.de. Datenpool schreiben. Keine '
   'Eröffnung über EMWS.',
   'Eingangsmanagement: Verbunderöffnung in der Sparte — Sparten-GeVo nach Klassifikation plus BÜ-GeVo als '
   'Zusatzwunsch.',
   'Danach: Die Sparte bearbeitet ihren GeVo zuerst. Anschließend Weiterleitung des BÜ-GeVo in den Themenpostkorb; '
   'ab hier wie Weg A mit dem Prüf-Bot.',
   'Hinweistext in der KWAD-Mail, mit dem Fachthema aus BUE_KLASSIFIKATION im Klartext, zum Beispiel: „VN-Wechsel '
   'mit anschließender Bestandsübertragung. Bitte gemäß Zuständigkeit in der Sparte eröffnen, zusätzlich GeVo '
   'Bestandsübertragung als Zusatzwunsch; die Bestandsübertragung wird erst nach dem VN-Wechsel bearbeitet.“']),
 ('C – KWAD ohne Folge-BÜ (Fall 4)',
  ['Celonis: Mail mit allen Anhängen, KI-Deckblatt und Hinweistext an kwad@ergo.de. Kein Datenpool, keine Eröffnung '
   'über EMWS. Loggen für die Auswertung.',
   'Eingangsmanagement: Sparten-GeVo nach Zuständigkeit. Kein BÜ-GeVo.',
   'Danach: Bearbeitung in der Sparte. Der Prüf-Bot sieht den Vorgang nicht.',
   'Hinweistext in der KWAD-Mail, zum Beispiel: „Kündigung Versicherungsvertrag ohne Bestandsübertragung. Bitte '
   'gemäß Zuständigkeit in der Sparte eröffnen; kein GeVo Bestandsübertragung.“']),
]

absaetze = [
 'Hallo Stefan, hallo zusammen,',
 ('anbei mein Verständnis für die Aufstellung aller Ausprägungen von BUE_KLASSIFIKATION: wann sie zu vergeben sind '
  'und welche Steuerung daraus folgt. ', 'Bitte um Bestätigung oder Korrektur durch das Fachteam.'),
 ('Die Steuerung hängt an zwei Feldern', True),
 ['BUE_KLASSIFIKATION sagt, was das Anliegen ist.',
  'BUE_WUNSCH_VORHANDEN sagt, ob eine Bestandsübertragung folgt.'],
 'Daraus ergeben sich drei Wege:',
 ['A — Celonis eröffnet den Postkorbvorgang über EMWS.',
  'B — Die Mail geht an KWAD; die Sparte bearbeitet zuerst, die BÜ folgt.',
  'C — Die Mail geht an KWAD; es folgt keine BÜ.'],
 ('Alle Ausprägungen', True),
 ('KLASSEN',),
 'Gegenüber der Feldliste V1.7: Die fünf Sparten-Ausprägungen (VN-Wechsel bis Sonstige Fachthemen) kommen wie am '
 '11.09. vorgeschlagen dazu; Anfrage-Rücksprache, Antrag-Änderung und Schadenmeldung gehen in Sonstige Fachthemen '
 'auf, weil sie dieselbe Steuerung haben. Die Kündigung Maklervollmacht wird eigene Ausprägung — sie läuft zwar über '
 'Weg A, braucht im Bot aber eine andere Behandlung als der Standardfall (Freibestand, MV-Felder N/A).',
 ('Die drei Wege', True),
 ('WEGE',),
 ('Sonderfälle', True),
 'Reminder ist keine Klassifikation, sondern das Feld BUE_REMINDER; die Erinnerung folgt dem Weg ihres Anliegens '
 '(Entscheidung 22.09.: keine eigene Prüfung im Bot). Spam bleibt ohne Weiterleitung — die Erkennung ist mit Celonis '
 'noch festzulegen.',
 ('Folge für den Prüf-Bot', True),
 'Der Prüf-Bot prüft BUE_KLASSIFIKATION nicht mehr. Er wird nur durch Vorgänge getriggert, die Celonis in den '
 'Themenpostkorb stellt (Weg A) — und künftig durch BÜ-GeVos, die die Sparte nach ihrer Bearbeitung dorthin '
 'weiterleitet (Weg B). Beides sind per Definition Bestandsübertragungen; die BE „Kein BÜ-Vorgang“ entfällt. Die BE '
 '„BÜ-Wunsch nicht vorhanden“ bleibt nur im MFA-Zweig, beim Makler belegt die Maklervollmacht den Auftrag.',
 'Beste Grüße\nEike',
]


def txt():
    o = []
    for a in absaetze:
        if a == ('KLASSEN',):
            for k, wann, wunsch, weg, folge in KLASSEN:
                o += [f'- {k}', f'  Wann: {wann}']
                for w, g, f in zip(wunsch.split('\n'), weg.split('\n'), folge.split('\n')):
                    o.append(f'  BUE_WUNSCH_VORHANDEN = {w} → Weg {g}: {f.split(": ", 1)[-1]}')
        elif a == ('WEGE',):
            for titel, punkte in WEGE_DETAIL:
                o.append(titel)
                o += ['  - ' + p for p in punkte]
                o.append('')
            o.pop()
        elif isinstance(a, list):
            o += ['- ' + b for b in a]
        elif isinstance(a, tuple) and len(a) == 2 and isinstance(a[1], str):
            o.append(a[0] + a[1])
        elif isinstance(a, tuple):
            o.append(a[0])
        else:
            o.append(a)
        o.append('')
    return '\n'.join(o).rstrip() + '\n'


def klassen_tabelle():
    """Eine Zeile je Kombination aus Klassifikation und BUE_WUNSCH_VORHANDEN; Klassifikation und Vergaberegel
    umspannen die ja/nein-Zeilen."""
    basis = 'border:1px solid #c9d0d4;padding:4px 7px;vertical-align:top;font-size:9.5pt'
    th = basis + ';background:#e6e9eb;font-weight:bold'
    kopf = ['BUE_KLASSIFIKATION', 'Wann vergeben', 'BUE_WUNSCH_VORHANDEN', 'Weg', 'Was folgt']
    breiten = [150, 250, 90, 40, 290]                      # Pixel, zusammen 820
    o = ['<table width="820" style="border-collapse:collapse;margin:0 0 12px 0;width:820px">']
    o.append('<tr>' + ''.join(f'<th width="{b}" style="{th};width:{b}px">{html.escape(h)}</th>'
                              for h, b in zip(kopf, breiten)) + '</tr>')
    for nr, (k, wann, wunsch, weg, folge) in enumerate(KLASSEN):
        td = basis + (';background:#f4f5f6' if nr % 2 else ';background:#ffffff')   # Zebra je Auspraegung
        teile = list(zip(wunsch.split('\n'), weg.split('\n'), folge.split('\n')))
        span = f' rowspan="{len(teile)}"' if len(teile) > 1 else ''
        for i, (w, g, f) in enumerate(teile):
            zelle = ''
            if i == 0:
                zelle = f'<td style="{td}"{span}>{html.escape(k)}</td><td style="{td}"{span}>{html.escape(wann)}</td>'
            f = f.split(': ', 1)[-1] if len(teile) > 1 else f
            zelle += ''.join(f'<td style="{td}">{html.escape(c)}</td>' for c in (w, g, f))
            o.append('<tr>' + zelle + '</tr>')
    return ''.join(o) + '</table>'


def tabelle(kopf, zeilen, breiten):
    td = 'border:1px solid #c9d0d4;padding:5px 8px;vertical-align:top;font-size:10pt'
    th = td + ';background:#f2f4f5;font-weight:bold'
    o = ['<table style="border-collapse:collapse;margin:0 0 12px 0;width:100%">']
    o.append('<tr>' + ''.join(f'<th style="{th};width:{b}%">{html.escape(h)}</th>' for h, b in zip(kopf, breiten)) + '</tr>')
    for z in zeilen:
        o.append('<tr>' + ''.join(f'<td style="{td}">{html.escape(c).replace(chr(10), "<br>")}</td>' for c in z) + '</tr>')
    return ''.join(o) + '</table>'


def htm():
    st = 'font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:0 0 10px 0'
    o = ['<div style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a">']
    for a in absaetze:
        if a == ('KLASSEN',):
            o.append(klassen_tabelle())
        elif a == ('WEGE',):
            for titel, punkte in WEGE_DETAIL:
                o.append(f'<p style="{st};margin-bottom:4px"><b>{html.escape(titel)}</b></p>')
                o.append('<ul style="margin:0 0 10px 18px;padding:0">' +
                         ''.join(f'<li style="{st};margin-bottom:4px">{html.escape(p)}</li>' for p in punkte) + '</ul>')
        elif isinstance(a, list):
            o.append('<ul style="margin:0 0 10px 18px;padding:0">' +
                     ''.join(f'<li style="{st};margin-bottom:4px">{html.escape(b)}</li>' for b in a) + '</ul>')
        elif isinstance(a, tuple) and len(a) == 2 and isinstance(a[1], str):
            o.append(f'<p style="{st}">{html.escape(a[0])}<b>{html.escape(a[1])}</b></p>')
        elif isinstance(a, tuple):
            o.append(f'<p style="{st};font-weight:bold;color:{ROT}">{html.escape(a[0])}</p>')
        else:
            o.append(f'<p style="{st}">{html.escape(a).replace(chr(10), "<br>")}</p>')
    return ''.join(o) + '</div>'


m = EmailMessage()
m['From'] = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'
m['To'] = ('Stefan.Schwarz@ergo.de, Marcus.Koch@ergo.de, Anika.Wesche@ergo.de, Inge.Lorusso@ergo.de, '
           'Nuria.Garcia-Fernandez@ergo.de, Ute.Gerhards@ergo.de')
m['Cc'] = ('Dirk.Amend@ergo.de, Marco.Jeglorz.extern@ergo.de, Alexandra.Mai@ergo.de, Niels.Luetke@ergo.de, '
           'Kamil.Rypa@ergo.de, ebrenneisen@deloitte.de')
m['Subject'] = ('AW: Makler BUE meets KI | Ausbaustufe 2 | BUE_KLASSIFIKATION: alle Auspraegungen mit Steuerlogik '
                '(EMWS / KWAD mit und ohne Folge-BUE) zur Bestaetigung')
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
with open(OUT + '.eml', 'wb') as f:
    f.write(bytes(m))
open(OUT + '.txt', 'w', encoding='utf-8').write(
    'An: ' + m['To'] + '\nCc: ' + m['Cc'] + '\nBetreff: ' + m['Subject'] + '\n\n' + txt())
print('geschrieben:', OUT + '.eml')
