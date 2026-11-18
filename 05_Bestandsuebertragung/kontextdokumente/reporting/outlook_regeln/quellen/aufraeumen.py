# -*- coding: utf-8 -*-
"""Auftrag „Aufräumen“: Duplikate löschen, Regeln umbenennen, Reihenfolge herstellen.

Grundlage sind der Regel-Export (wie bisher) und eine Namensliste – eine Excel-Datei mit einem Blatt je Postfach
(Blattname beginnt mit „Bestand…“ bzw. „Makler…“), Spalten „Name heute“ und „Neuer Name …“; die Reihenfolge der
Zeilen ist die gewünschte Reihenfolge der Regeln. Die Namensliste steht nicht im Repository (Regelnamen des Postfachs).

bau_regeln.py ruft das Modul mit --plan <namensliste.xlsx> auf (--ziel makler baut die Mappe für Maklerauftraege).
Je Postfach entsteht ein Plan für das Blatt Umsetzung:

  1. LOESCHEN  <Name> | Duplikate      je Name, den mehrere inhaltsgleiche Regeln tragen (die erste bleibt)
  2. UMBENENNEN <Name heute> | <neu>   je Regel, deren Name sich ändert
  3. POSITION  <neuer Name> | nach: …  nur für die Regeln, die ihren Platz wechseln müssen

Zu 3: Die Regeln, die ihre Reihenfolge untereinander behalten (längste aufsteigende Teilfolge), bleiben stehen; jede
andere wird direkt hinter ihre Vorgängerin der Zielreihenfolge gesetzt, in Zielreihenfolge. So entstehen so wenige
Umstellungen wie möglich.

Das Modul rät nicht: Passt die Namensliste nicht zum Export (Regel fehlt, Regel unbekannt, neuer Name doppelt, gleicher
Name mit verschiedenem Inhalt), bricht der Bau mit einer Meldung ab.
"""
import bisect
import collections
import re
import warnings

import openpyxl


def namensliste_lesen(pfad):
    """{'bestand': [(Name heute, neuer Name), ...], 'makler': [...]} in der Reihenfolge der Zeilen."""
    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        wb = openpyxl.load_workbook(pfad, data_only=True)
    listen = {}
    for ws in wb.worksheets:
        schl = 'bestand' if ws.title.lower().startswith('bestand') else 'makler' if ws.title.lower().startswith('makler') else None
        if schl is None:
            continue
        kopf, sp_alt, sp_neu = None, None, None
        for r in range(1, min(ws.max_row, 30) + 1):
            werte = {str(ws.cell(r, c).value or '').strip(): c for c in range(1, ws.max_column + 1)}
            alt = [c for t, c in werte.items() if t == 'Name heute']
            neu = [c for t, c in werte.items() if t.startswith('Neuer Name')]
            if alt and neu:
                kopf, sp_alt, sp_neu = r, alt[0], neu[0]
                break
        if kopf is None:
            raise SystemExit('Namensliste: Blatt „%s“ ohne Spalten „Name heute“ und „Neuer Name …“' % ws.title)
        zeilen = []
        for r in range(kopf + 1, ws.max_row + 1):
            alt, neu = ws.cell(r, sp_alt).value, ws.cell(r, sp_neu).value
            if alt is None or str(alt).strip() == '':
                continue
            zeilen.append((str(alt), '' if neu is None else str(neu).strip()))
        if schl in listen:
            raise SystemExit('Namensliste: zwei Blätter für %s' % schl)
        listen[schl] = zeilen
    return listen


def inhalt(g):
    """Inhalt einer Regel laut Export ohne Name, Platz und Aktiv (für den Vergleich gleichnamiger Regeln)."""
    return (g.get('typ'), g.get('gueltig'), tuple(sorted(g['bed'])), tuple(sorted(g['aus'])), tuple(sorted(g['akt'])),
            g.get('stopp'))


def _bleiben(folge):
    """Stellen einer längsten streng aufsteigenden Teilfolge von folge (Zahlen): Diese Regeln bleiben stehen."""
    enden, zeiger, vor = [], [], [None] * len(folge)
    for i, x in enumerate(folge):
        k = bisect.bisect_left(enden, x)
        if k == len(enden):
            enden.append(x)
            zeiger.append(i)
        else:
            enden[k] = x
            zeiger[k] = i
        vor[i] = zeiger[k - 1] if k > 0 else None
    aus, i = set(), zeiger[-1] if zeiger else None
    while i is not None:
        aus.add(i)
        i = vor[i]
    return aus


def auftrag(postfach, regeln, namensliste):
    """Plan und Übersicht für ein Postfach. regeln: Regeln des Postfachs in Ausführungsreihenfolge (dicts aus
    bau_regeln.REGEL). Rückgabe: dict(zeilen=[...], plan=[...], n_heute, n_danach, n_duplikate, n_umbenannt, umstellungen)."""
    kurz = postfach.split('@')[0]
    schl = 'bestand' if postfach.lower().startswith('bestand') else 'makler'
    if schl not in namensliste:
        raise SystemExit('Namensliste: kein Blatt für %s' % kurz)
    liste = namensliste[schl]
    gruppen = collections.OrderedDict()
    for g in regeln:
        gruppen.setdefault(g['name'], []).append(g)
    fehler = []
    for name, gr in gruppen.items():
        if len({inhalt(g) for g in gr}) > 1:
            fehler.append('„%s“ gibt es %d-mal mit verschiedenem Inhalt (Plätze %s) – das geht nicht über „Duplikate“; '
                          'solche Regeln einzeln als „Name #n/m“ in den Plan nehmen'
                          % (name, len(gr), ', '.join(str(g['reihe']) for g in gr)))
    alt_namen = [a for a, _ in liste]
    for name in gruppen:
        if alt_namen.count(name) != 1:
            fehler.append('„%s“ steht %d-mal in der Namensliste (erwartet: einmal)' % (name, alt_namen.count(name)))
    for a in alt_namen:
        if a not in gruppen:
            fehler.append('„%s“ steht in der Namensliste, aber nicht im Export' % a)
    neu_namen = [n for _, n in liste]
    for a, n in liste:
        if n == '':
            fehler.append('„%s“: neuer Name fehlt' % a)
        elif [x.lower() for x in neu_namen].count(n.lower()) > 1:
            fehler.append('neuer Name „%s“ ist mehrfach vergeben' % n)
        elif n != a and any(n.lower() == x.lower() for x in gruppen if x != a):
            fehler.append('neuer Name „%s“ (für „%s“) heißt wie eine andere Regel von heute – dafür wäre ein '
                          'Zwischenname nötig' % (n, a))
    if fehler:
        raise SystemExit('Namensliste passt nicht zum Export (%s):\n  - %s' % (kurz, '\n  - '.join(fehler)))

    heute = list(gruppen)                                   # Reihenfolge heute ohne Duplikate
    platz_heute = {name: i + 1 for i, name in enumerate(heute)}
    neu = dict(liste)
    ziel = alt_namen                                        # Zielreihenfolge (Namen von heute)
    bleibt = _bleiben([platz_heute[n] for n in ziel])
    zeilen, umstellungen = [], []
    for i, name in enumerate(ziel):
        gr = gruppen[name]
        z = dict(name=name, neu=neu[name], regel=gr[0], duplikate=gr[1:], platz_neu=i + 1, platz_ohne=platz_heute[name],
                 bewegt=i not in bleibt, nach=ziel[i - 1] if i > 0 else None)
        zeilen.append(z)
        if z['bewegt']:
            umstellungen.append(z)

    plan = []
    for name in heute:
        gr = gruppen[name]
        if len(gr) > 1:
            plan.append(dict(aktion='LOESCHEN', regel=name, neu='Duplikate',
                             warum='%d-mal vorhanden (Plätze %s), laut Export inhaltsgleich. Die erste bleibt; das Makro '
                                   'löscht die übrigen nur, wenn es die Gleichheit beim Ausführen selbst bestätigt.'
                                   % (len(gr), ', '.join(str(g['reihe']) for g in gr))))
    for z in zeilen:
        if z['neu'] != z['name']:
            plan.append(dict(aktion='UMBENENNEN', regel=z['name'], neu=z['neu'], warum='Neuer Name laut Namensliste.'))
    for z in umstellungen:
        if z['nach'] is None:
            plan.append(dict(aktion='POSITION', regel=z['neu'], neu='Platz 1', warum='Steht künftig an erster Stelle.'))
        else:
            plan.append(dict(aktion='POSITION', regel=z['neu'], neu='nach: ' + neu[z['nach']],
                             warum='Reihenfolge laut Namensliste: bisher Platz %d von %d (ohne Duplikate), künftig Platz %d.'
                                   % (z['platz_ohne'], len(heute), z['platz_neu'])))
    for i, p in enumerate(plan):
        p['nr'] = i + 1
        p.setdefault('ausf', 'Ja')
        for k in ('ver', 'kop', 'quelle', 'ueberspr'):
            p.setdefault(k, '')
    return dict(postfach=postfach, zeilen=zeilen, plan=plan, n_heute=len(regeln), n_danach=len(heute),
                n_duplikate=len(regeln) - len(heute), n_umbenannt=sum(1 for z in zeilen if z['neu'] != z['name']),
                umstellungen=umstellungen)


def _kurz(t, n):
    t = re.sub(r'\s+', ' ', str(t or '')).strip()
    return t if len(t) <= n else t[:n - 1].rstrip() + '…'


def was_die_regel_macht(g):
    """Bedingungen, Ausnahmen und Aktionen einer Regel in drei kurzen Zeilen."""
    pf = g['postfach']
    bed = [(b, d) for b, d in g['bed']]
    teile = []
    if bed:
        teile.append('WENN ' + ' UND '.join('%s %s' % (b, _kurz(d, 90)) if d else b for b, d in bed))
    else:
        teile.append('BEI JEDER MAIL (keine Bedingung sichtbar)')
    if g['aus']:
        teile.append('AUSSER ' + ' ODER '.join('%s %s' % (b, _kurz(d, 70)) for b, d in g['aus']))
    akt = []
    for b, d in g['akt']:
        if b == 'Keine weiteren Regeln anwenden':
            continue
        d = str(d or '').replace('\\\\' + pf + '\\', '').replace('%2F', '/')
        akt.append('%s %s' % ({'In Ordner verschieben': 'verschieben nach', 'In Ordner kopieren': 'Kopie nach'}.get(
            b, b[:1].lower() + b[1:]), _kurz(d, 70)))
    teile.append('DANN ' + ' + '.join(akt) + (' · danach keine weiteren Regeln' if g.get('stopp') == 'Ja' else ''))
    return '\n'.join(teile)


def blatt(g, ws, auftraege):
    """Blatt „Aufräumen“: je Postfach die Regeln in der neuen Reihenfolge mit altem und neuem Namen."""
    F, kopf_fmt, zelle_fmt, zeilen, zeilenhoehe, druck = (g[k] for k in ('F', 'kopf_fmt', 'zelle_fmt', 'zeilen',
                                                                          'zeilenhoehe', 'druck'))
    MUTED, ROTD, GELBL, GELBD, GRAUD, FONT_TITEL = g['MUTED'], g['ROTD'], g['GELBL'], g['GELBD'], g['GRAUD'], g['FONT_TITEL']
    breiten = [8, 8, 44, 50, 7, 90, 56]
    ws.hide_gridlines(2)
    ws.set_tab_color(g['GRUEN'])
    for i, b in enumerate(breiten):
        ws.set_column(i, i, b)
    ws.write(0, 0, 'Aufräumen – neue Namen und Reihenfolge', F(font_name=FONT_TITEL, font_size=20, bold=True, valign='bottom'))
    ws.set_row(0, 34)
    ws.write(1, 0, 'Grundlage des Plans im Blatt Umsetzung: Duplikate löschen, Regeln umbenennen, Reihenfolge herstellen. '
                   'Stand wie im Export; an der Logik der Regeln ändert der Plan nichts.', F(font_color=MUTED))
    r = 3
    for a in auftraege:
        text = '%s  ·  heute %d Regeln' % (a['postfach'], a['n_heute'])
        if a['n_duplikate']:
            text += ', davon %d Duplikate' % a['n_duplikate']
        text += '  ·  danach %d  ·  %d umbenannt  ·  %d umgestellt' % (a['n_danach'], a['n_umbenannt'], len(a['umstellungen']))
        ws.write(r, 0, text, F(font_name=FONT_TITEL, font_size=13, bold=True, valign='bottom'))
        ws.set_row(r, 26)
        r += 1
        for c, k in enumerate(['Platz neu', 'Platz heute', 'Name heute', 'Neuer Name', 'Aktiv', 'Was die Regel macht',
                               'Hinweis']):
            ws.write(r, c, k, kopf_fmt('center' if c in (0, 1, 4) else 'left'))
        ws.set_row(r, 24)
        r += 1
        for z in a['zeilen']:
            rg = z['regel']
            hin = []
            if z['duplikate']:
                hin.append('%d-mal vorhanden (Plätze %s) – %d Duplikate werden gelöscht, die erste bleibt.'
                           % (len(z['duplikate']) + 1, ', '.join(str(x['reihe']) for x in [rg] + z['duplikate']),
                              len(z['duplikate'])))
            if z['bewegt']:
                hin.append('Wird umgestellt: bisher Platz %d (ohne Duplikate), künftig Platz %d.' % (z['platz_ohne'], z['platz_neu']))
            if rg['aktiv'] != 'Ja':
                hin.append('Ist ausgeschaltet (bleibt so).')
            was = was_die_regel_macht(rg)
            ws.write(r, 0, z['platz_neu'], zelle_fmt('center'))
            ws.write(r, 1, rg['reihe'], zelle_fmt('center', font_color=MUTED))
            ws.write_string(r, 2, z['name'], zelle_fmt(wrap=True, font_color=MUTED, valign='top'))
            ws.write_string(r, 3, z['neu'], zelle_fmt(wrap=True, bold=True, valign='top',
                                                      **({} if z['neu'] != z['name'] else {'font_color': MUTED})))
            ws.write(r, 4, rg['aktiv'], zelle_fmt('center', **({} if rg['aktiv'] == 'Ja' else {'font_color': GRAUD})))
            ws.write_string(r, 5, was, zelle_fmt(wrap=True, valign='top', font_size=9))
            ws.write_string(r, 6, ' '.join(hin), zelle_fmt(wrap=True, valign='top', font_size=9,
                                                           **({'bg_color': GELBL, 'font_color': GELBD} if z['duplikate'] else
                                                              {'font_color': ROTD})))
            n = max(sum(zeilen(x, breiten[5], pt=9) for x in was.split('\n')), zeilen(' '.join(hin), breiten[6], pt=9),
                    zeilen(z['name'], breiten[2]), zeilen(z['neu'], breiten[3], fett=True), 2)
            ws.set_row(r, zeilenhoehe(n, pt=9.5, polster=8))
            r += 1
        r += 1
    druck(ws)
    ws.print_area(0, 0, r, len(breiten) - 1)
