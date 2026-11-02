# -*- coding: utf-8 -*-
"""Befuellt die SmartArt-Grafik (Process List) im PDD mit dem SIPOC des Pruef-Bots."""
import re, shutil, zipfile, os

RUN = ('<a:r><a:rPr lang="de-DE"><a:solidFill><a:sysClr val="windowText" lastClr="000000"/>'
       '</a:solidFill></a:rPr><a:t>{}</a:t></a:r>')


def esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def node_text(lines):
    ps = ''.join('<a:p>' + RUN.format(esc(l)) + '</a:p>' for l in lines)
    return '<dgm:t><a:bodyPr/><a:lstStyle/>' + ps + '</dgm:t>'


def sipoc(variant):
    bot = 'BOT2011' if variant == 'KV' else 'BOT1515'
    sparte = 'Gesundheit' if variant == 'KV' else 'Komposit / Leben'
    return {
        # Ueberschriften der fuenf Spalten
        '0AF79E25': ['Supplier'],
        '520B8853': ['Input'],
        'D14FA591': ['Process'],
        '7AC41BDD': ['Output'],
        '40A3E5C9': ['Customer'],
        # Supplier
        '5D534242': ['Übernehmender Makler,', 'MFA oder Maklerpool', 'Eingangsmanagement'],
        # Input
        'C7D928ED': ['Postkorbvorgang im EWMS', 'Vorgangsdaten im Datenpool', '(Felder BUE_*)'],
        # Process (sechs Schritte)
        '99D00206': ['1. Vorgangsdaten aus dem', 'Datenpool lesen'],
        'ED8F05A8': ['2. VNR-Prüfung (VA230)'],
        '19B68B11': ['3. VN-Stammdaten prüfen', '(IS100)'],
        '206AD725': ['4. Übernehmenden Vermittler', 'prüfen (OB726, GH040, EOS)'],
        '09764712': ['5. BE überprüfen und', 'priorisieren'],
        'CE9017B5': ['6. Notiz bestücken und', 'weiterleiten'],
        # Output
        '00F0F4FA': ['Bestückte Notiz', 'Ablehnungsinformation', 'Ausgesteuerter Vorgang'],
        # Customer
        '6B23CCC5': ['BÜ-Bot ' + bot, '72-Stunden-BOT', 'Sachbearbeitung ' + sparte],
    }


def fill(docx_path, variant):
    mapping = sipoc(variant)
    tmp = docx_path + '.tmp'
    with zipfile.ZipFile(docx_path) as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == 'word/diagrams/data1.xml':
                x = data.decode('utf-8')
                for mid, lines in mapping.items():
                    pat = re.compile(r'(<dgm:pt modelId="\{' + mid + r'[^"]*"[^>]*>.*?)<dgm:t>.*?</dgm:t>', re.S)
                    x, n = pat.subn(lambda m: m.group(1) + node_text(lines), x, count=1)
                    if not n:
                        print('  Knoten nicht gefunden:', mid)
                data = x.encode('utf-8')
            elif item.filename == 'word/diagrams/drawing1.xml':
                # zwischengespeicherte Darstellung entfernen, Word rendert neu
                x = data.decode('utf-8')
                for old in ('VN/ VP', 'Postkorbnotiz /', 'inbox notice', 'Notiz auslesen', 'read notice',
                            'Behandlungsende-Datum ermitteln', 'determine treatment date', 'Brief schreiben',
                            'write letter', 'Übersichtsblatt befüllen', 'fill out form',
                            'Wiedervorlage terminieren', 'Vorgang ablegen', 'mark item as done',
                            'Brief', 'letter'):
                    x = x.replace('<a:t>%s</a:t>' % old, '<a:t></a:t>')
                data = x.encode('utf-8')
            zout.writestr(item, data)
    shutil.move(tmp, docx_path)
    return docx_path


if __name__ == '__main__':
    import sys
    fill(sys.argv[1], sys.argv[2])
    print('SIPOC in SmartArt eingearbeitet:', sys.argv[1])
