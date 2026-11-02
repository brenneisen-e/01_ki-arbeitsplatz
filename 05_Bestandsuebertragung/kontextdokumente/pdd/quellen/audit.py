# -*- coding: utf-8 -*-
"""Audit: liefert das erzeugte PDD die Vorgaben des Templates?"""
import sys, re, collections
from docx import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

KEYS = {'WENN', 'DANN', 'SONST', 'Ende WENN', 'Schleifenstart', 'Schleifenende'}
ok = lambda m: print('  OK   ', m)
warn = lambda m: print('  PRUEF', m)
bad = lambda m: print('  FEHL ', m)


def items(d):
    out = []
    for ch in d.element.body.iterchildren():
        if ch.tag == qn('w:p'): out.append(('p', Paragraph(ch, d)))
        elif ch.tag == qn('w:tbl'): out.append(('t', Table(ch, d)))
    return out


def audit(path, tmpl):
    d, t = Document(path), Document(tmpl)
    it, itt = items(d), items(t)
    print('=' * 78); print(path); print('=' * 78)

    # A -- Kapitelstruktur
    print('\nA. Kapitelstruktur des Templates')
    h_t = [o.text.strip() for k, o in itt if k == 'p' and o.style and o.style.name in ('Heading 1', 'Heading 2', 'Heading 3')]
    h_d = [o.text.strip() for k, o in it if k == 'p' and o.style and o.style.name in ('Heading 1', 'Heading 2', 'Heading 3')]
    start = h_t.index('Schritt für Schritt-Beschreibung')
    missing = [x for x in h_t[:start + 1] if x not in h_d]
    (ok if not missing else bad)('Kapitel bis "Schritt für Schritt-Beschreibung" vollstaendig'
                                 + ('' if not missing else ': fehlt ' + str(missing)))
    ok(f'Ueberschriften gesamt: Template {len(h_t)} -> Dokument {len(h_d)}')

    # Ab welchem Index beginnt die Schritt-fuer-Schritt-Beschreibung
    s_i = [i for i, (k, o) in enumerate(it) if k == 'p' and o.text.strip().startswith('Schritt für Schritt')
           and o.style and o.style.name == 'Heading 1'][0]
    step = it[s_i:]

    # B -- Leere Pflichtzellen
    print('\nB. Befuellung der Template-Tabellen')
    leer = []
    for k, o in it[:s_i]:
        if k != 't': continue
        head = o.rows[0].cells[0].text.strip()
        for ri, r in enumerate(o.rows[1:], 1):
            cells = r.cells
            if len(cells) >= 2 and cells[0].text.strip() and not cells[1].text.strip():
                leer.append(f'{head!r} Zeile {ri}: {cells[0].text.strip()[:45]!r}')
    if leer:
        for x in leer[:12]: warn('Antwortspalte leer: ' + x)
    else:
        ok('keine leeren Antwortzellen in den Kopfkapiteln')

    # C -- Formatvorlagen laut Kapitel "Vorgegebene Formatierung"
    print('\nC. Vorgegebene Formatierung')
    sysh = [o for k, o in step if k == 'p' and o.style and o.style.name == 'Heading 2']
    ctx = [o for k, o in step if k == 'p' and o.style and o.style.name == 'fachlicher Kontext']
    ok(f'Formatvorlage "System" (Ueberschrift 2): {len(sysh)} Kapitel')
    ok(f'Formatvorlage "fachlicher Kontext": {len(ctx)} Abschnitte')

    kw = collections.Counter()
    wrongkw = []
    be = 0
    lp = 0
    for k, o in step:
        if k != 't': continue
        for r in o.rows:
            for c in r.cells:
                for p in c.paragraphs:
                    txt = p.text.strip()
                    st = p.style.name if p.style else '-'
                    if txt in KEYS:
                        kw[txt] += 1
                        if st != 'Intense Quote':
                            wrongkw.append((txt, st))
                    elif st == 'Intense Quote' and txt:
                        wrongkw.append((txt[:30], 'Intense Quote zu Unrecht'))
                    if st == 'List Paragraph' and txt: lp += 1
                    for run in p.runs:
                        if run.style and run.style.name == 'Business Exception': be += 1
    (ok if not wrongkw else bad)('WENN/DANN/SONST/Ende WENN durchgaengig in Formatvorlage "WENN DANN"'
                                 + ('' if not wrongkw else f' -- Abweichungen: {wrongkw[:5]}'))
    ok(f'Schluesselwoerter: ' + ', '.join(f'{a}={b}' for a, b in sorted(kw.items())))
    ok(f'BE-Markierungen (Zeichenformat "Business Exception"): {be}')
    ok(f'Zuordnungstabellen-Zeilen (Listenabsatz): {lp}')

    # WENN/DANN-Paarigkeit
    print('\nD. Logische Vollstaendigkeit der WENN-Bloecke')
    unbal = 0
    for k, o in step:
        if k != 't': continue
        for r in o.rows:
            for c in r.cells:
                seq = [p.text.strip() for p in c.paragraphs if p.text.strip() in KEYS]
                w = seq.count('WENN'); dn = seq.count('DANN'); e = seq.count('Ende WENN')
                if not (w == dn == e):
                    unbal += 1
    (ok if not unbal else bad)(f'WENN/DANN/Ende WENN paarig in allen Zellen'
                               + ('' if not unbal else f' -- {unbal} Zellen unpaarig'))
    ls = sum(1 for k, o in step if k == 't' for r in o.rows for c in r.cells
             for p in c.paragraphs if p.text.strip() == 'Schleifenstart')
    le = sum(1 for k, o in step if k == 't' for r in o.rows for c in r.cells
             for p in c.paragraphs if p.text.strip() == 'Schleifenende')
    (ok if ls == le else bad)(f'Schleifenstart {ls} / Schleifenende {le}')

    # E -- Ueberschriften ausserhalb von Tabellen
    print('\nE. Strukturvorgaben')
    inner = 0
    for k, o in it:
        if k != 't': continue
        for r in o.rows:
            for c in r.cells:
                for p in c.paragraphs:
                    if p.style and p.style.name in ('Heading 1', 'Heading 2', 'fachlicher Kontext'):
                        inner += 1
    (ok if not inner else bad)('Ueberschriften stehen ausserhalb von Tabellen'
                               + ('' if not inner else f' -- {inner} Verstoesse'))
    mult = 0
    for k, o in step:
        if k != 't': continue
        for r in o.rows:
            if len(r.cells[0].text.strip().split('Screenshot:')) > 2: mult += 1
    (ok if not mult else bad)('max. ein Screenshot je Zeile')

    # F -- Sprache
    print('\nF. Sprache')
    en = 0
    for k, o in step:
        if k != 't': continue
        for r in o.rows:
            if len(r.cells) > 2 and r.cells[2].text.strip(): en += 1
    (ok if not en else bad)('dritte Spalte (englische Uebersetzung) bleibt leer'
                            + ('' if not en else f' -- {en} befuellte Zellen'))

    # G -- Business Exceptions mit Text und Completed-Kennzeichnung
    print('\nG. Business Exceptions')
    betexte, ohne_text, completed = [], 0, 0
    for k, o in step:
        if k != 't': continue
        for r in o.rows:
            for c in r.cells:
                ps = [p for p in c.paragraphs]
                for idx, p in enumerate(ps):
                    tx = p.text.strip()
                    if tx.startswith('BE ') or tx.startswith('BE '):
                        betexte.append(tx)
                        if len(tx) < 6: ohne_text += 1
                        for nxt in ps[idx + 1:idx + 3]:
                            if 'Reporting als Completed' in nxt.text or 'im Reporting als Completed' in nxt.text:
                                completed += 1
    ok(f'{len(betexte)} Business Exceptions, alle mit Hinweistext' if not ohne_text
       else f'{ohne_text} BE ohne Hinweistext')
    ok(f'{completed} BE ausdruecklich als Completed gekennzeichnet')
    ok(f'{len(set(betexte))} unterschiedliche BE-Texte')

    # H -- Variablentabelle vs. Datenpool
    print('\nH. Variablentabelle')
    felder = [l.strip() for l in open('felder.txt', encoding='utf-8')] if False else None
    vt = None
    for k, o in it[:s_i]:
        if k == 't' and o.rows[0].cells[0].text.strip().startswith('Variablenname'):
            vt = o
    names = [r.cells[0].text.strip() for r in vt.rows[1:]]
    import openpyxl
    wb = openpyxl.load_workbook('felder.xlsx')
    GESTRICHEN = {'BUE_LFD_NR', 'BUE_STATUS', 'BUE_VORGANGSTYP'}
    pool = [str(c.value).strip() for c in wb.worksheets[0]['A']
            if c.value and str(c.value).startswith('BUE_') and str(c.value).strip() not in GESTRICHEN]
    drin = [f for f in GESTRICHEN if f in names]
    (ok if not drin else bad)('gestrichene Felder nicht verwendet'
                             + ('' if not drin else f' -- noch enthalten: {drin}'))
    import re as _re
    verstoss = [n for n in names if n.startswith('BUE_')
                and (len(n) > 25 or not _re.fullmatch(r'[A-Z0-9_]+', n))]
    (ok if not verstoss else bad)('Feldnamen ICR-konform (max. 25 Zeichen, A-Z 0-9 _)'
                                  + ('' if not verstoss else f' -- {verstoss}'))
    fehlt = [f for f in pool if f not in names]
    (ok if not fehlt else bad)(f'alle {len(pool)} Datenpoolfelder in der Variablentabelle'
                               + ('' if not fehlt else f' -- fehlt: {fehlt}'))
    ok(f'Variablen gesamt: {len(names)} (Datenpool {len(pool)} + abgeleitet {len(names)-len(pool)})')
    unref = []
    volltext = '\n'.join(p.text for k, o in step if k == 't' for r in o.rows for c in r.cells for p in c.paragraphs)
    bemerkung = {r.cells[0].text.strip(): r.cells[4].text for r in vt.rows[1:]}
    for n in names:
        if not n or n in volltext:
            continue
        if 'mitgeführt' in bemerkung.get(n, '') or 'Notizvorlage' in bemerkung.get(n, ''):
            continue          # laut Bemerkung nur mitgefuehrt bzw. reines Notizfeld
        unref.append(n)
    (ok if not unref else warn)('jede Variable wird in der Schrittbeschreibung verwendet'
                                + ('' if not unref else f' -- ohne Verwendung: {unref}'))

    # I -- Ordnungsbegriff
    print('\nI. Ordnungsbegriff und Reporting')
    allt = '\n'.join(o.text for k, o in it if k == 'p') + volltext
    for term in ('Vorgang-Lfd-Nr', 'Completed', 'Rejected', 'Referred'):
        (ok if term in allt else bad)(f'{term} im Dokument referenziert')
    return True


for f in sys.argv[1:]:
    audit(f, 'template.docx')
    print()
