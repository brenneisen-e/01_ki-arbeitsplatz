# -*- coding: utf-8 -*-
"""Prueft eine erzeugte Testmail (EML) und ihre PDF-Anhaenge.

Aufruf:  python3 eml_pruefen.py <datei.eml> [bildordner] [--erwarte Feld=Wert ...] [--lange-kopfzeilen]

- EML: reines ASCII, CRLF, Kopfzeilen (X-Unsent, From, To, Subject, Date, MIME), Text (UTF-8) und Anhaenge werden mit
  dem Python-Paket email gelesen; Fehler des Parsers (defects) werden gemeldet. Anzeigenamen und Dateinamen werden
  dekodiert ausgegeben (RFC 2047 / RFC 2231).
- RFC 2047 im Mailkopf: kodierte Woerter hoechstens 75 Zeichen, Zeilen mit kodierten Woertern hoechstens 76 Zeichen
  (mit --lange-kopfzeilen nur Hinweis), in From/To keine aneinanderstossenden kodierten Woerter.
- Excel-Textexport (Ablage auf SharePoint ueber Excel, FileFormat 20): kein Anfuehrungszeichen, kein Tabulator, kein
  Komma, keine Zeile mit Leerzeichen am Rand oder ' am Anfang, alle Zeilen unter 998 Zeichen, erste und letzte Zeile
  nicht leer; dazu eine Simulation des Exports (eine Zeile je Zelle, Regeln siehe excel_textexport) - sie muss
  byte-gleich dieselbe Datei ergeben.
- PDF-Anhaenge: byte-gleich mit der daneben abgelegten PDF-Datei, oeffnen in PyMuPDF, Syntaxpruefung mit pikepdf
  (qpdf), Seitenzahl 1, Text lesbar (Umlaute). Mit bildordner wird je PDF ein PNG (110 dpi) abgelegt.
- --erwarte prueft dekodierte Werte: From-Name, From-Adresse, To-Name, To-Adresse, Subject, Anhang (je Anhang einmal,
  Reihenfolge egal), Text (muss im Text vorkommen).
Rueckgabewert 1 bei einem Befund.
"""
import email
import email.policy
import io
import os
import re
import sys

import pikepdf
import pymupdf

# Zeichen, bei denen Excel eine Zelle beim Textexport in "..." setzt (innere " werden verdoppelt). Belegt: Komma und
# Anfuehrungszeichen (Microsoft: "comma, quotation mark, or other character that could be misinterpreted when you
# reopen the file"; auch in Zellen mit Zellformat Text), Tabulator und Zeilenumbruch (Trennzeichen bzw. Datensatzende).
EXCEL_QUOTE = '",\t\r\n'


def excel_textexport(zellen):
    """Simulation von Workbook.SaveAs FileFormat:=20 (xlTextWindows) fuer eine Spalte A mit Zellformat Text ("@"),
    die Werte per Range.Value eingetragen:
    - ein fuehrendes ' ist das Praefixzeichen und gehoert nicht zum Wert (geht verloren)
    - Zelle mit Komma, Anfuehrungszeichen, Tabulator oder Zeilenumbruch -> "..." mit verdoppelten inneren "
      (vorsichtshalber auch fuehrende/abschliessende Leerzeichen; dafuer gibt es keinen sicheren Beleg)
    - =, +, -, @ am Anfang bleiben Text (Zellformat "@" wird vor dem Eintragen gesetzt)
    - jede Zeile endet mit CRLF, auch die letzte; der Export endet mit der letzten nicht leeren Zelle (genutzter
      Bereich), leere Zellen davor ergeben leere Zeilen; Zeichensatz Windows-1252
    """
    aus = []
    for z in zellen:
        if z.startswith("'"):
            z = z[1:]
        if any(c in z for c in EXCEL_QUOTE) or z != z.strip(' '):
            z = '"' + z.replace('"', '""') + '"'
        aus.append(z)
    while aus and aus[-1] == '':
        aus.pop()
    return ''.join(z + '\r\n' for z in aus).encode('cp1252')


def pruefe_excel(roh):
    """Befunde fuer die Ablage ueber den Excel-Textexport; leer = die Datei uebersteht ihn unveraendert."""
    befunde = []
    if b'"' in roh:
        befunde.append('Excel-Export: Anfuehrungszeichen in der EML')
    if b'\t' in roh:
        befunde.append('Excel-Export: Tabulator in der EML')
    if b',' in roh:
        befunde.append('Excel-Export: Komma in der EML (Excel setzt die Zeile in Anfuehrungszeichen)')
    if not roh.endswith(b'\r\n'):
        befunde.append('Excel-Export: letzte Zeile ohne CRLF')
        return befunde
    zeilen = roh[:-2].decode('ascii', 'replace').split('\r\n')
    lang = [i + 1 for i, z in enumerate(zeilen) if len(z) >= 998]
    if lang:
        befunde.append('Zeilen mit 998 Zeichen oder mehr: %s' % lang[:5])
    rand = [i + 1 for i, z in enumerate(zeilen) if z and (z[0] == ' ' or z[-1] == ' ')]
    if rand:
        befunde.append('Excel-Export: Zeilen mit Leerzeichen am Rand: %s' % rand[:5])
    apo = [i + 1 for i, z in enumerate(zeilen) if z.startswith("'")]
    if apo:
        befunde.append("Excel-Export: Zeilen mit ' am Anfang (Praefixzeichen): %s" % apo[:5])
    if not zeilen[0]:
        befunde.append('Excel-Export: erste Zeile leer')
    if not zeilen[-1]:
        befunde.append('Excel-Export: letzte Zeile leer (fiele aus dem genutzten Bereich)')
    if excel_textexport(zeilen) != roh:
        befunde.append('Excel-Export: Simulation ergibt nicht dieselbe Datei')
    print('Excel-Textexport:   %d Zeilen, laengste %d Zeichen, %s; Zeilen mit Semikolon: %d (Parametertrenner, kein '
          'belegter Ausloeser)' % (len(zeilen), max(len(z) for z in zeilen),
                                   'byte-gleich' if excel_textexport(zeilen) == roh else 'ABWEICHUNG',
                                   sum(1 for z in zeilen if ';' in z)))
    return befunde


KODIERT = re.compile(r'=\?[^?\s]+\?[BbQq]\?[^?\s]*\?=')


def pruefe_kodierte_worte(roh, lang_ok):
    """RFC 2047 im Mailkopf: jedes kodierte Wort hoechstens 75 Zeichen, jede Zeile mit kodiertem Wort hoechstens 76
    Zeichen (Abschnitt 2), in From/To keine aneinanderstossenden kodierten Woerter (das Leerzeichen dazwischen faellt
    nach RFC 2047 6.2 weg, Python liest es im Anzeigenamen mit). lang_ok: zu lange Zeilen nur als Hinweis (Selbsttest
    mit absichtlich langem Namen; der Generator faltet nicht, siehe README)."""
    befunde = []
    kopf = roh.split(b'\r\n\r\n', 1)[0].decode('ascii', 'replace').split('\r\n')
    lang = []
    for z in kopf:
        worte = KODIERT.findall(z)
        if not worte:
            continue
        for w in worte:
            if len(w) > 75:
                befunde.append('RFC 2047: kodiertes Wort mit %d Zeichen (hoechstens 75): %s' % (len(w), w[:40]))
        if len(z) > 76:
            lang.append('%s (%d Zeichen)' % (z.split(':', 1)[0], len(z)))
        if z.split(':', 1)[0].lower() in ('from', 'to', 'cc') and re.search(r'\?=[ ]+=\?', z):
            befunde.append('%s: zwei kodierte Woerter stossen aneinander (Leser lesen das Leerzeichen dazwischen '
                           'verschieden)' % z.split(':', 1)[0])
    if lang:
        text = 'RFC 2047: Kopfzeile mit kodiertem Wort laenger als 76 Zeichen: %s' % ', '.join(lang)
        if lang_ok:
            print('Hinweis: ' + text)
        else:
            befunde.append(text)
    print('Mailkopf:           laengste Zeile mit kodiertem Wort %d Zeichen' %
          max([len(z) for z in kopf if KODIERT.search(z)] or [0]))
    return befunde


def main():
    args = sys.argv[1:]
    erwartet = []
    rest = []
    lang_ok = False
    while args:
        a = args.pop(0)
        if a == '--erwarte':
            k, v = args.pop(0).split('=', 1)
            erwartet.append((k, v))
        elif a == '--lange-kopfzeilen':
            lang_ok = True
        else:
            rest.append(a)
    pfad = rest[0]
    bilder = rest[1] if len(rest) > 1 else None
    roh = open(pfad, 'rb').read()
    befunde = []
    if any(b > 127 for b in roh):
        befunde.append('EML enthaelt Bytes ausserhalb ASCII')
    if b'\n' in roh.replace(b'\r\n', b'') or b'\r' in roh.replace(b'\r\n', b''):
        befunde.append('EML hat Zeilenenden ohne CRLF')
    befunde += pruefe_excel(roh)
    befunde += pruefe_kodierte_worte(roh, lang_ok)
    msg =email.message_from_bytes(roh, policy=email.policy.default)
    for k in ('X-Unsent', 'From', 'To', 'Subject', 'Date', 'Message-ID', 'MIME-Version', 'X-Pruefbot-Auftrag'):
        print('%-19s %s' % (k + ':', msg.get(k)))
    if msg.get('X-Unsent') != '1':
        befunde.append('X-Unsent fehlt')
    if msg.get_content_type() != 'multipart/mixed' or not msg.get_boundary():
        befunde.append('kein multipart/mixed mit boundary')
    if msg.get('Date') is None or msg['Date'].datetime is None:
        befunde.append('Date nicht lesbar')
    werte = {'Subject': str(msg.get('Subject', ''))}
    for feld in ('From', 'To'):
        h = msg.get(feld)
        if h is not None and h.addresses:
            werte[feld + '-Name'] = h.addresses[0].display_name
            werte[feld + '-Adresse'] = h.addresses[0].addr_spec
            print('%-19s Anzeigename "%s", Adresse "%s"' % (feld + ' dekodiert:', werte[feld + '-Name'], werte[feld + '-Adresse']))
    for teil in msg.walk():
        for d in getattr(teil, 'defects', []):
            befunde.append('Parser: %s' % d)
    text = msg.get_body(preferencelist=('plain',)).get_content()
    print('-' * 70)
    print(text)
    print('-' * 70)
    ordner = os.path.dirname(os.path.abspath(pfad))
    anz = 0
    namen = []
    for anh in msg.iter_attachments():
        anz += 1
        name = anh.get_filename()
        namen.append(name)
        daten = anh.get_payload(decode=True)
        print('Anhang: %s (%s, %d Byte; Kopf: %s)' % (name, anh.get_content_type(), len(daten),
                                                     anh.get('Content-Disposition')))
        nebenan = os.path.join(ordner, name)
        if os.path.exists(nebenan):
            if open(nebenan, 'rb').read() != daten:
                befunde.append('%s: Anhang nicht byte-gleich mit der Datei daneben' % name)
        else:
            befunde.append('%s: PDF nicht neben der EML abgelegt' % name)
        if not daten.startswith(b'%PDF-1.4'):
            befunde.append('%s: kein PDF-Kopf' % name)
        try:
            pdf = pikepdf.open(nebenan if os.path.exists(nebenan) else io.BytesIO(daten))
            probleme = pdf.check_pdf_syntax() if hasattr(pdf, 'check_pdf_syntax') else pdf.check()
            if probleme:
                befunde.append('%s: qpdf meldet %s' % (name, probleme))
        except Exception as e:
            befunde.append('%s: pikepdf %s' % (name, e))
        doc = pymupdf.open(stream=daten, filetype='pdf')
        if doc.page_count != 1:
            befunde.append('%s: %d Seiten' % (name, doc.page_count))
        t = doc[0].get_text()
        print('   Text (Auszug): %s' % ' | '.join(z for z in t.split('\n')[:6]))
        if bilder:
            os.makedirs(bilder, exist_ok=True)
            doc[0].get_pixmap(dpi=110).save(os.path.join(bilder, os.path.splitext(name)[0] + '.png'))
    print('Anhaenge: %d' % anz)
    offen = list(namen)
    for k, v in erwartet:
        if k == 'Anhang':
            if v in offen:
                offen.remove(v)
            else:
                befunde.append('erwarteter Anhang fehlt: %r (gefunden: %r)' % (v, namen))
        elif k == 'Text':
            if v not in text:
                befunde.append('Text enthaelt nicht: %r' % v)
        elif werte.get(k) != v:
            befunde.append('%s: erwartet %r, gelesen %r' % (k, v, werte.get(k)))
    if erwartet:
        print('Erwartete Werte: %d geprueft' % len(erwartet))
    print('BEFUNDE:' if befunde else 'keine Befunde')
    for b in befunde:
        print('  - ' + b)
    sys.exit(1 if befunde else 0)


if __name__ == '__main__':
    main()
