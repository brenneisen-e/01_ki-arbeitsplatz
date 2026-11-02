# -*- coding: utf-8 -*-
"""Mail an das Eingangsmanagement: AIDA OCR anpassen – Mails mit KI-Deckblatt in die Sparte, nicht in die BÜ-Postkörbe."""
from email.message import EmailMessage
from email.utils import formatdate
import html
import sys

P = '/home/user/kiarbeitsplatz/05_Bestandsuebertragung/kontextdokumente/pdd'
OUT = P + '/Mail_Entwurf_EM_AIDA_OCR_Deckblatt_Sparte_290926'
ANLAGE = sys.argv[1] if len(sys.argv) > 1 else None
ANLAGE_NAME = 'ERGO_Makler_BUE_KI_Deckblatt_V1.6.docx'
ROT = '#C41230'

SPARTE_EM = ('ja\nnein', 'B\nC', 'Eröffnung in der Sparte; GeVo Bestandsübertragung nur als Zusatzwunsch, bearbeitet erst nach der Sparte\n'
             'nur Sparte, kein GeVo Bestandsübertragung')
# (Klassifikation, wann vergeben, BÜ-Wunsch vorhanden, Weg, Eingangsmanagement) – wie in der Aufstellung vom 23.09.2026
KLASSEN = [
 ('BÜ-Vorgang', 'Bestandsübertragung mit Maklervollmacht (Makler) oder Betreuungswunsch (Mehrfachagent); auch mit Anforderung von Unterlagen',
  'ja / nein', 'A', 'nicht beteiligt – Celonis eröffnet über EMWS, keine Mail an KWAD'),
 ('Kündigung Maklervollmacht', 'Makler oder Kunde kündigt Vollmacht oder Mandat; fachlich eine BÜ in den Freibestand',
  'ja', 'A', 'nicht beteiligt – Celonis eröffnet über EMWS, keine Mail an KWAD'),
 ('VN-Wechsel', 'Wechsel oder Änderung des Versicherungsnehmers', *SPARTE_EM),
 ('WEG-Wechsel', 'Wechsel der Wohnungseigentümergemeinschaft (nur Wohngebäude); Behandlung wie VN-Wechsel', *SPARTE_EM),
 ('Kündigung Versicherungsvertrag', 'Kündigung eines Vertrags, auch unterjährig oder wegen Beitragsanpassung; nicht: Kündigung der Maklervollmacht',
  *SPARTE_EM),
 ('Verkürzung Kündigungsfrist', 'Bitte um Verkürzung der Kündigungsfrist auf einen Termin', *SPARTE_EM),
 ('Sonstige Fachthemen', 'Jedes andere erkennbare Sparten-Anliegen: Anfrage oder Rücksprache, Antrag oder Vertragsänderung (z. B. Adressänderung mit '
  'oder ohne Maklervollmacht), Schadenmeldung, Vertragstrennung, Beitragsfreistellung', *SPARTE_EM),
 ('Nicht-Standard', 'Anliegen nicht erkennbar oder nicht zuordenbar; das Eingangsmanagement klassifiziert selbst', *SPARTE_EM),
 ('Kein-Makler-Vorgang', 'Absender ist kein Vermittler oder es fehlt jeder Vermittlerbezug', 'nein', 'C', 'nur Sparte, kein GeVo Bestandsübertragung'),
]

# (Text, Art): Art 'h' = Zwischenüberschrift, 'b' = Aufzählung, sonst Absatz
absaetze = [
 'Hallo zusammen,',
 'für den Pilot „Makler BÜ meets KI“ brauchen wir eine Anpassung der AIDA OCR im Eingangsmanagement.',
 ('Wie es künftig laufen wird', 'h'),
 'Celonis wird künftig die eingehenden Maklermails aus den Postfächern bestandsuebertragung@ergo.de und '
 'maklerauftraege@ergo.de übernehmen und jede Mail klassifizieren.',
 ('Bestandsübertragungen wird Celonis selbst über EMWS als Postkorbvorgang eröffnen – für Komposit/Leben mit GeVo 108 '
  '„Bestandsübertragung“, für KV mit Dokumenttyp 02015 „Maklervollmacht“. Diese Mails werden nicht mehr an kwad@ergo.de gehen.', 'b'),
 ('An KWAD wird Celonis nur die Vorgänge umleiten, die nicht als BÜ-Vorgang klassifiziert werden, zum Beispiel VN-Wechsel, '
  'WEG-Wechsel, Kündigung eines Versicherungsvertrags, Verkürzung der Kündigungsfrist, sonstige Fachthemen oder nicht '
  'zuordenbare Anliegen.', 'b'),
 'Folgt aus einem solchen Anliegen eine Bestandsübertragung, dann erst nach der Bearbeitung in der Sparte.',
 ('Woran Sie diese Mails erkennen werden', 'h'),
 ('An jeder dieser Mails wird das KI-Deckblatt „Makler BÜ – KI Deckblatt“ hängen; die aktuelle Vorlage (Version 1.6) liegt bei.', 'b'),
 ('Im Kopf des Deckblatts steht der Hinweis auf den Pilot „Makler BÜ meets KI“.', 'b'),
 ('Im Abschnitt „Klassifikation & Vorgang“ stehen das Fachthema (Feld „Klassifikation“) und ob eine Bestandsübertragung folgt (Feld „BÜ-Wunsch vorhanden“).', 'b'),
 ('Die Mail selbst trägt einen Hinweistext mit dem Fachthema im Klartext, zum Beispiel: „VN-Wechsel mit anschließender Bestandsübertragung. '
  'Bitte gemäß Zuständigkeit in der Sparte eröffnen, zusätzlich GeVo Bestandsübertragung als Zusatzwunsch; die Bestandsübertragung wird erst nach '
  'dem VN-Wechsel bearbeitet.“', 'b'),
 ('Ausprägungen des Feldes „Klassifikation“', 'h'),
 'Das Feld wird künftig folgende Ausprägungen erhalten (wie in der Aufstellung vom 23.09.). Über KWAD kommen nur die Wege B und C:',
 'Weg A – Celonis eröffnet den Postkorbvorgang über EMWS.\nWeg B – Die Mail geht an KWAD; die Sparte bearbeitet zuerst, die BÜ folgt.\n'
 'Weg C – Die Mail geht an KWAD; es folgt keine BÜ.',
 ('TABELLE', 't'),
 ('Unsere Bitte', 'h'),
 'Damit das ab dem Start greift, bitten wir Sie, die AIDA OCR so anzupassen:',
 ('Hängt das KI-Deckblatt an einer Mail, ist der Vorgang in keinem Fall als Bestandsübertragung einzustufen.', 'b'),
 ('Diese Vorgänge bitte nicht in die BÜ-Postkörbe HSB4 K bzw. ODPP1 D indizieren, sondern in die zuständige Sparte. Steht '
  '„BÜ-Wunsch vorhanden“ auf „ja“ (Weg B), den GeVo Bestandsübertragung nur als Zusatzwunsch in der Sparte mitgeben.', 'b'),
 ('Dafür die BÜ-Priorisierung bzw. die Indizierung nach HSB4 K für Mails mit KI-Deckblatt so zurückstufen, dass sie '
  'nicht mehr bei uns landen – auch dann, wenn eine Maklervollmacht anhängt.', 'b'),
 'Hintergrund: Diese Vorgänge müssen zuerst in der Sparte bearbeitet werden. Landen sie als Bestandsübertragung in '
 'HSB4 K oder ODPP1 D, laufen sie in die falsche Bearbeitung und müssen umgehängt werden.',
 'Bitte geben Sie mir kurz Rückmeldung, ob sich das so umsetzen lässt und ab wann die Anpassung greifen kann.',
 'Beste Grüße\nEike Brenneisen',
]


def txt():
    o = []
    for i, a in enumerate(absaetze):
        art = a[1] if isinstance(a, tuple) else 'p'
        t = a[0] if isinstance(a, tuple) else a
        if art == 't':
            for k, wann, wunsch, weg, em in KLASSEN:
                o += ['- ' + k, '  Wann: ' + wann]
                for w, g, e in zip(wunsch.split('\n'), weg.split('\n'), em.split('\n')):
                    o.append('  BÜ-Wunsch vorhanden = %s → Weg %s: %s' % (w, g, e))
            o.append('')
            continue
        o.append(t if art != 'b' else '- ' + t)
        nxt = absaetze[i + 1] if i + 1 < len(absaetze) else None
        if art == 'p' or (art == 'b' and not (isinstance(nxt, tuple) and nxt[1] == 'b')):
            o.append('')
    o.append('Anlage: ' + ANLAGE_NAME)
    return '\n'.join(o).rstrip() + '\n'


def tabelle():
    basis = 'border:1px solid #c9d0d4;padding:4px 7px;vertical-align:top;font-family:Calibri,Arial,sans-serif;font-size:9.5pt'
    th = basis + ';background:#e6e9eb;font-weight:bold;text-align:left'
    kopf = ['Klassifikation', 'Wann vergeben', 'BÜ-Wunsch vorhanden', 'Weg', 'Eingangsmanagement']
    breiten = [140, 280, 80, 40, 280]
    o = ['<table width="820" style="border-collapse:collapse;margin:0 0 12px 0;width:820px">']
    o.append('<tr>' + ''.join(f'<th width="{b}" style="{th};width:{b}px">{html.escape(h)}</th>' for h, b in zip(kopf, breiten)) + '</tr>')
    for k, wann, wunsch, weg, em in KLASSEN:
        grau = ';color:#7f7f7f' if weg == 'A' else ''
        teile = list(zip(wunsch.split('\n'), weg.split('\n'), em.split('\n')))
        for i, (w, g, e) in enumerate(teile):
            z = '<tr>'
            if i == 0:
                rs = f' rowspan="{len(teile)}"' if len(teile) > 1 else ''
                z += f'<td{rs} style="{basis};font-weight:bold{grau}">{html.escape(k)}</td><td{rs} style="{basis}{grau}">{html.escape(wann)}</td>'
            z += f'<td style="{basis}{grau}">{html.escape(w)}</td><td style="{basis}{grau}">{html.escape(g)}</td><td style="{basis}{grau}">{html.escape(e)}</td></tr>'
            o.append(z)
    o.append('</table>')
    return ''.join(o)


def htm():
    st = 'font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:0 0 10px 0'
    o = ['<div style="font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#1a1a1a">']
    liste = False
    for a in absaetze:
        if isinstance(a, tuple) and a[1] == 'b':
            if not liste:
                o.append('<ul style="margin:0 0 10px 0;padding-left:22px">'); liste = True
            o.append(f'<li style="font-family:Calibri,Arial,sans-serif;font-size:11pt;margin:0 0 4px 0">{html.escape(a[0])}</li>')
            continue
        if liste:
            o.append('</ul>'); liste = False
        if isinstance(a, tuple) and a[1] == 't':
            o.append(tabelle()); continue
        if isinstance(a, tuple):
            o.append(f'<p style="{st};font-weight:bold;color:{ROT}">{html.escape(a[0])}</p>')
        else:
            o.append(f'<p style="{st}">{html.escape(a).replace(chr(10), "<br>")}</p>')
    if liste:
        o.append('</ul>')
    o.append(f'<p style="{st};color:#595959">Anlage: {html.escape(ANLAGE_NAME)}</p>')
    return ''.join(o) + '</div>'


m = EmailMessage()
m['From'] = 'Brenneisen, Eike (HSB4K-EXTERN) <Eike.Brenneisen.extern@ergo.de>'
AN = ['Stöhnken, Dennis (EYCK)', 'von Wirtz, Markus', 'Gröning', 'Roth, Bastian (EYC1HH)', 'Holthusen, Jan Steffen (EYCHH)']
CC = ['Amend, Dirk (HSB4K)', 'Schwarz, Stefan (DSTPB)', 'Koch, Marcus (ODPBD)']
m['To'] = ', '.join('"%s"' % x for x in AN)
m['Cc'] = ', '.join('"%s"' % x for x in CC)
m['Subject'] = 'Makler BÜ meets KI | AIDA OCR: Mails mit KI-Deckblatt in die Sparte, nicht in die BÜ-Postkörbe'
m['Date'] = formatdate(localtime=True)
m['X-Unsent'] = '1'
m.set_content(txt(), cte='base64')
m.add_alternative(htm(), subtype='html', cte='base64')
if ANLAGE:
    with open(ANLAGE, 'rb') as f:
        m.add_attachment(f.read(), maintype='application', subtype='vnd.openxmlformats-officedocument.wordprocessingml.document',
                         filename=ANLAGE_NAME)
with open(OUT + '.eml', 'wb') as f:
    f.write(bytes(m))
open(OUT + '.txt', 'w', encoding='utf-8').write('An: ' + '; '.join(AN) + '\nCc: ' + '; '.join(CC) + '\nBetreff: ' + m['Subject'] + '\n\n' + txt())
print('geschrieben:', OUT + '.eml')
