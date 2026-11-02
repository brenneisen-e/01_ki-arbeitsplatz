# -*- coding: utf-8 -*-
"""Alle Pruefungen in einem Zug (aus diesem Ordner):  python3 pruefen.py [arbeitsordner]

1. Build (pruefbot_build.py: VBA-Pruefung, cp1252, Option Explicit, xlsm schreiben, zuordnung.json)
2. vergleich.py Original gegen Neubau (muss 0 FEHLER melden)
3. LibreOffice: alle Module laden, Versionsfunktionen, TestmailFehlend fuer MAIL-001/-003/-010,
   TestmailErzeugen fuer MAIL-001 (mit Beispieladressen, nur in der geladenen Kopie) und fuer MAIL-003 (trotzdem),
   EmlSelbsttest (Sonderzeichen in Namen, Betreff, Text und Dateinamen), Pfadwahl AusgabeZiel mit lokalen und
   https-Pfaden (synchronisierte Bibliothek ueber eine Test-Zuordnung statt der Registry) und der SharePoint-Zweig
   von TestmailErzeugen bis zum Excel-Textexport: LibreOffice speichert bei FileFormat 20 keine Textdatei, die Probe
   muss das erkennen, auf SharePoint wird dann nichts abgelegt und die Mail bleibt lokal
4. eml_pruefen.py fuer die erzeugten Mails (MIME, Excel-Textexport, Anhaenge byte-gleich, qpdf-Syntax, eine Seite;
   beim Selbsttest die dekodierten Namen, Betreff und Dateinamen)
   Dazu modTmEml.KopfWorte (RFC 2047, wortweise) fuer Anzeigenamen und Betreffe mit Sonderzeichen: mit Python
   dekodiert gleich der Eingabe, ohne Anfuehrungszeichen/Komma/Tabulator, kodierte Woerter hoechstens 75 Zeichen und
   im Anzeigenamen nie aneinanderstossend; modTmEml.EinZeilig fuer eine mehrzeilige Excel-Fehlermeldung
5. Rendern der Blaetter als PNG (rendern.py)
LibreOffice laeuft mit eigenem Profil und eigenem Port; parallel laufende Instanzen bleiben unberuehrt. HOME zeigt
fuer den LibreOffice-Lauf in den Arbeitsordner (dort liegt dann „Dokumente“\\Pruefbot_Testmails des SharePoint-Zweigs).
"""
import email
import email.policy
import email.utils
import json
import os
import re
import shutil
import subprocess
import sys
from email.header import decode_header, make_header

HIER = os.path.dirname(os.path.abspath(__file__))
XLSM = os.path.join(os.path.dirname(HIER), 'Pruefbot_Testing.xlsm')
SP = 'https://ergo.sharepoint.com/sites/BUE/Shared Documents'
KODIERT = re.compile(r'=\?[^?\s]+\?[BbQq]\?[^?\s]*\?=')
# (Text, Anzeigename?, aneinanderstossende kodierte Woerter unvermeidbar?)
KOPF_FAELLE = [
    ('Akkurat UV Kuhnapfel, Henrik', True, False),
    ('Mustermann Versicherungsmakler GmbH & Co. KG', True, False),
    ('Allfinanz-Versicherungsvermittlungsgesellschaft, Nord', True, False),
    ('Allfinanz-Versicherungsvermittlungsgesellschaft, Mustermann GmbH & Co. KG', True, False),
    ('Müller, Jürgen Łukasz', True, False),
    ('Dr. Müller (Leitung) <x@y>', True, False),
    ('Makler Krüger', True, False),
    ('[AGENTURNAME]', True, False),
    ('Erika Intern | ERGO', True, False),
    ('Klaus Unbekannt', True, False),
    ("O'Brien & Söhne", True, False),
    ('Name; mit Semikolon', True, False),
    ('Grüße \U00020BB7 Ende', True, False),
    ('Kuhnapfel,  Henrik', True, False),
    ('Untermakler Klein e.K.', True, False),
    ('\u00c4' * 30, True, True),
    ('Test BÜ TF-GL-01 | KV | VNR 317063119', False, False),
    ('WG: Test BÜ TF-BH-01 | Komposit | VNR [IMSI-VNR]', False, False),
    ('Selbsttest "BÜ", Größe; a=b =?x?= € Ende', False, False),
    ('Test  BÜ  doppelt', False, False),
    ('a?=b c', False, False),
    ('Zeile\tmit Tab', False, False),
]
EXCEL_FEHLER = ("Microsoft Excel kann nicht auf die Datei 'https://x/Pruefbot_Testmails/MAIL-001.eml' zugreifen. "
                "Dafür kann es mehrere Gründe geben:\n\n\u2022 Der Datei- oder Pfadname ist nicht vorhanden.\n"
                "\u2022 Die Datei wird von einem anderen Programm verwendet.\r\n")
EXCEL_FEHLER_EINZEILIG = ("Microsoft Excel kann nicht auf die Datei 'https://x/Pruefbot_Testmails/MAIL-001.eml' "
                          "zugreifen. Dafür kann es mehrere Gründe geben: Der Datei- oder Pfadname ist nicht vorhanden. "
                          "Die Datei wird von einem anderen Programm verwendet.")


def kopf_befunde(text, phrase, angrenzend_ok, kodiert):
    """Befunde zu einem Ergebnis von modTmEml.KopfWorte (leer = in Ordnung)"""
    b = []
    if any(c in kodiert for c in '",\t\r\n') or kodiert != kodiert.strip(' '):
        b.append('nicht exportsicher')
    if any(len(w) > 75 for w in KODIERT.findall(kodiert)):
        b.append('kodiertes Wort ueber 75 Zeichen')
    if not angrenzend_ok and re.search(r'\?=[ ]+=\?', kodiert):
        b.append('kodierte Woerter stossen aneinander')
    soll = text.strip(' ')
    if phrase:
        h = 'From: %s <a@example.org>\r\n\r\n' % kodiert
        gelesen = [email.message_from_string(h, policy=email.policy.default)['From'].addresses[0].display_name]
        n = email.message_from_string(h, policy=email.policy.compat32)['From']
        gelesen.append(str(make_header(decode_header(email.utils.parseaddr(n)[0]))))
        if angrenzend_ok:
            gelesen = gelesen[1:]
        soll_n = ' '.join(soll.split(' '))
        for g in gelesen:
            if ' '.join(g.split()) != ' '.join(soll_n.split()):
                b.append('gelesen %r' % g)
    else:
        h = 'Subject: %s\r\n\r\n' % kodiert
        g = str(email.message_from_string(h, policy=email.policy.default)['Subject'])
        if g != soll:
            b.append('gelesen %r' % g)
    return b


def lauf(args, pruefe=True, env=None):
    print('\n$ ' + ' '.join(args))
    r = subprocess.run(args, cwd=HIER, capture_output=True, text=True, env=env)
    print(r.stdout[-6000:])
    if r.returncode != 0:
        print(r.stderr[-3000:])
        if pruefe:
            raise SystemExit('abgebrochen: %s (Rueckgabe %d)' % (args[1], r.returncode))
    return r


def leeren(ordner):
    if os.path.isdir(ordner):
        shutil.rmtree(ordner)
    os.makedirs(ordner)


def pfadfaelle(arbeit):
    """(Argumente fuer AusgabeZiel, erwartete Rueckgabe) - vor und nach SyncTestSetzen."""
    home = os.path.join(arbeit, 'home')
    dok = os.path.join(home, 'Pruefbot_Testmails')
    lokal = os.path.join(arbeit, 'pfad', 'lokal')
    mount = os.path.join(arbeit, 'pfad', 'sync', 'BUE - Dokumente')
    for d in (lokal, os.path.join(mount, '02_Testkonzept'), os.path.join(mount, '00_Übergreifend', 'Testmails'), home):
        os.makedirs(d, exist_ok=True)
    for d in (lokal, os.path.join(mount, '02_Testkonzept')):
        open(os.path.join(d, 'Pruefbot_Testing.xlsm'), 'wb').close()
    n = 'Pruefbot_Testing.xlsm'
    ohne_sync = [
        (('', '', lokal, n), 'LOKAL|Datei|%s/Pruefbot_Testmails|%s/Pruefbot_Testmails' % (lokal, lokal)),
        (('', 'C:\\Daten\\Testmails\\', SP + '/02_Testkonzept', n),
         'LOKAL|Einstellung|C:\\Daten\\Testmails|C:\\Daten\\Testmails'),
        (('/tmp/vorgabe/', 'C:\\Daten', lokal, n), 'LOKAL|Vorgabe|/tmp/vorgabe|/tmp/vorgabe'),
        (('', '', SP + '/02_Testkonzept', n),
         'SHAREPOINT|Datei|%s/02_Testkonzept/Pruefbot_Testmails|%s' % (SP, dok)),
        (('', '', 'https://ergo.sharepoint.com/sites/BUE/Shared%20Documents/02_Testkonzept/', n),
         'SHAREPOINT|Datei|%s/02_Testkonzept/Pruefbot_Testmails|%s' % (SP, dok)),
        (('', 'https://ergo.sharepoint.com/sites/BUE/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FBUE%2F'
              'Shared%20Documents%2F01%5FFachkonzept&viewid=4711', lokal, n),
         'SHAREPOINT|Einstellung|%s/01_Fachkonzept|%s' % (SP, dok)),
        (('', 'https://ergo.sharepoint.com/:f:/r/sites/BUE/Shared%20Documents/00_%C3%9Cbergreifend?csf=1&web=1&e=Ab',
          lokal, n), 'SHAREPOINT|Einstellung|%s/00_Übergreifend|%s' % (SP, dok)),
        (('', '', '', ''), 'DOKUMENTE|Datei|%s|%s' % (dok, dok)),
    ]
    mit_sync = [
        (('', '', SP + '/02_Testkonzept', n),
         'SYNC|Datei|%s/02_Testkonzept/Pruefbot_Testmails|%s/02_Testkonzept/Pruefbot_Testmails' % (mount, mount)),
        (('', '', 'https://ergo.sharepoint.com/sites/BUE/Shared%20Documents/02_Testkonzept', n),
         'SYNC|Datei|%s/02_Testkonzept/Pruefbot_Testmails|%s/02_Testkonzept/Pruefbot_Testmails' % (mount, mount)),
        (('', '', SP + '/02_Testkonzept', 'Andere_Datei.xlsm'),
         'SHAREPOINT|Datei|%s/02_Testkonzept/Pruefbot_Testmails|%s' % (SP, dok)),
        (('', 'https://ergo.sharepoint.com/sites/BUE/Shared%20Documents/00_%C3%9Cbergreifend/Testmails', lokal, n),
         'SYNC|Einstellung|%s/00_Übergreifend/Testmails|%s/00_Übergreifend/Testmails' % (mount, mount)),
        (('', SP + '/01_Fachkonzept', lokal, n), 'SHAREPOINT|Einstellung|%s/01_Fachkonzept|%s' % (SP, dok)),
        (('', '', 'https://ergo.sharepoint.com/sites/Andere/Shared Documents/x', n),
         'SHAREPOINT|Datei|https://ergo.sharepoint.com/sites/Andere/Shared Documents/x/Pruefbot_Testmails|%s' % dok),
        (('', '', lokal, n), 'LOKAL|Datei|%s/Pruefbot_Testmails|%s/Pruefbot_Testmails' % (lokal, lokal)),
    ]
    return ohne_sync, mit_sync, mount, dok


def main():
    arbeit = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else '/tmp/pruefbot_pruefung'
    mails = os.path.join(arbeit, 'testmails')
    selbst = os.path.join(arbeit, 'selbsttest')
    for d in (mails, selbst, os.path.join(arbeit, 'pfad'), os.path.join(arbeit, 'home')):
        leeren(d)
    lauf([sys.executable, 'pruefbot_build.py'])
    lauf([sys.executable, 'vergleich.py', 'quelle/Pruefbot_Testing.xlsx', XLSM, '--zuordnung', 'zuordnung.json', '--max', '3'])
    ohne_sync, mit_sync, mount, dok = pfadfaelle(arbeit)
    g = 'Testmail-Generator'
    rufe = ['modTestmail.GeneratorVersion', 'modNav.NavVersion',
            'modTestmail.TestmailFehlend|MAIL-001', 'modTestmail.TestmailFehlend|MAIL-003',
            'modTestmail.TestmailFehlend|MAIL-010',
            'modTestmail.TestmailErzeugen|MAIL-001|%s|falsch' % mails, 'modTestmail.GeneratorAblage',
            'modTestmail.TestmailErzeugen|MAIL-003|%s|wahr' % mails,
            'modTestmail.GeneratorLetzterFehler',
            'modTestmail.EmlSelbsttest|%s|falsch' % selbst, 'modTestmail.GeneratorLetzterFehler',
            'modTestmail.EmlSelbsttest|%s|wahr' % selbst, 'modTestmail.GeneratorLetzterFehler',
            'modTestmail.TestmailErzeugen|MAIL-001|%s/Testmails|falsch' % SP, 'modTestmail.GeneratorAblage']
    pfad_start = len(rufe)
    rufe += ['modTmEml.AusgabeZiel|' + '|'.join(a) for a, _ in ohne_sync]
    rufe += ['modTmEml.SyncTestSetzen|https://ergo.sharepoint.com/sites/BUE/Shared%%20Documents/|%s' % mount]
    rufe += ['modTmEml.AusgabeZiel|' + '|'.join(a) for a, _ in mit_sync]
    rufe += ['modTmEml.SyncTestSetzen||']
    kopf_start = len(rufe)
    rufe += [['modTmEml.KopfWorte', t, p] for t, p, _ in KOPF_FAELLE]
    rufe += [['modTmEml.EinZeilig', EXCEL_FEHLER]]
    ergebnis = os.path.join(arbeit, 'lo_ergebnis.json')
    args = [sys.executable, 'lo_pruefen.py', XLSM,
            '--setze', g + '!E13=pruefbot-start@ergo.example', '--setze', g + '!E15=makler-test@example.org',
            '--setze', g + '!E16=pool-test@example.org', '--setze', g + '!E21=Düsseldorf', '--json', ergebnis]
    for r in rufe:
        args += ['--ruf-json', json.dumps(r, ensure_ascii=False)] if isinstance(r, list) else ['--ruf', r]
    r = lauf(args, env=dict(os.environ, HOME=os.path.join(arbeit, 'home')))
    if 'FEHLER' in r.stdout:
        raise SystemExit('LibreOffice-Aufruf meldet FEHLER')
    erg = json.load(open(ergebnis, encoding='utf-8'))
    if len(erg) != len(rufe) or not all(e['ok'] for e in erg):
        raise SystemExit('LibreOffice: nicht alle Aufrufe ausgefuehrt')
    w = [e['ergebnis'] for e in erg]
    befunde = []
    # MAIL-001 lokal: Ablage LOKAL/Vorgabe, nichts auf SharePoint
    if w[6] != 'LOKAL|Vorgabe|%s||' % mails:
        befunde.append('GeneratorAblage nach MAIL-001 lokal: %r' % w[6])
    # Selbsttest ohne Excel: Pfad; mit Excel in LibreOffice: Probe muss abweichen, Ziel darf nicht entstehen
    if w[9] != os.path.join(selbst, 'SELBSTTEST_Pruefbot.eml') or w[10]:
        befunde.append('EmlSelbsttest: %r / %r' % (w[9], w[10]))
    if w[11] or 'nicht zeichengenau' not in w[12] or os.path.exists(os.path.join(selbst, 'SELBSTTEST_Excel.eml')):
        befunde.append('EmlSelbsttest mit Excel-Export (LibreOffice): Probe hat nicht angeschlagen: %r / %r' % (w[11], w[12]))
    if os.path.exists(os.path.join(selbst, 'Pruefbot_Excelprobe.txt')):
        befunde.append('Probe-Datei nicht geloescht')
    # SharePoint-Zweig ueber die Vorgabe: Arbeitskopie in Dokumente\Pruefbot_Testmails, SharePoint abgelehnt (Probe)
    sp_eml = os.path.join(dok, os.path.basename(w[5]))
    teile = w[14].split('|')
    if w[13] != sp_eml or teile[:4] != ['SHAREPOINT', 'Vorgabe', SP + '/Testmails', ''] or 'nicht zeichengenau' not in teile[4]:
        befunde.append('SharePoint-Zweig: %r / %r' % (w[13], w[14]))
    print('\nSharePoint-Zweig (LibreOffice): Arbeitskopie %s\n  Hinweis: %s' % (w[13], teile[4] if len(teile) > 4 else ''))
    # Pfadwahl
    faelle = ohne_sync + [None] + mit_sync
    print('\nPfadwahl AusgabeZiel(Vorgabe, Einstellung, Dateiordner, Dateiname):')
    for i, fall in enumerate(faelle):
        if fall is None:
            print('  -- mit Test-Zuordnung %s -> %s' % (SP, mount))
            continue
        ist = w[pfad_start + i]
        ok = ist == fall[1]
        print('  %s %s\n      -> %s' % ('ok    ' if ok else 'FALSCH', ' | '.join(repr(a) for a in fall[0]), ist))
        if not ok:
            befunde.append('AusgabeZiel%r: erwartet %r, erhalten %r' % (fall[0], fall[1], ist))
    # Kopfzeilen (RFC 2047, wortweise) und einzeilige Fehlermeldung
    print('\nKopfWorte (RFC 2047):')
    for i, (t, p, ang) in enumerate(KOPF_FAELLE):
        ist = w[kopf_start + i]
        b = kopf_befunde(t, p, ang, ist)
        print('  %s %-8s %r\n      -> %s' % ('ok    ' if not b else 'FALSCH', 'Name' if p else 'Betreff', t, ist))
        befunde += ['KopfWorte(%r): %s' % (t, x) for x in b]
    if w[kopf_start + len(KOPF_FAELLE)] != EXCEL_FEHLER_EINZEILIG:
        befunde.append('EinZeilig: %r' % w[kopf_start + len(KOPF_FAELLE)])
    if befunde:
        print('\n'.join('BEFUND: ' + b for b in befunde))
        raise SystemExit('Pruefung der Ablage fehlgeschlagen')
    emls = sorted(f for f in os.listdir(mails) if f.endswith('.eml'))
    if len(emls) != 2:
        raise SystemExit('erwartet 2 Testmails, gefunden: %s' % emls)
    for e in emls:
        lauf([sys.executable, 'eml_pruefen.py', os.path.join(mails, e), os.path.join(arbeit, 'pdf_bilder')])
    lauf([sys.executable, 'eml_pruefen.py', sp_eml])
    lauf([sys.executable, 'eml_pruefen.py', os.path.join(selbst, 'SELBSTTEST_Pruefbot.eml'),
          '--erwarte', 'From-Name=Müller, Jürgen Łukasz', '--erwarte', 'From-Adresse=juergen.mueller@example.org',
          '--erwarte', 'To-Name=Allfinanz-Versicherungsvermittlungsgesellschaft, Mustermann GmbH & Co. KG',
          '--erwarte', 'To-Adresse=allfinanz@example.org', '--lange-kopfzeilen',
          '--erwarte', 'Subject=Selbsttest "BÜ", Größe; a=b =?x?= € Ende',
          '--erwarte', 'Anhang=Vollmacht Müller, Größe.pdf', '--erwarte', 'Anhang=SELBSTTEST_Anlage.pdf',
          '--erwarte', 'Text=Zeile 1 mit "Anführungszeichen", Komma und Tab\tEnde',
          '--erwarte', 'Text=Zeile 2: Grüße – Łőź'])
    lauf([sys.executable, 'rendern.py', XLSM, os.path.join(arbeit, 'blaetter'), '70'])
    print('\nAlle Pruefungen bestanden. Ergebnisse in', arbeit)


if __name__ == '__main__':
    main()
