# -*- coding: utf-8 -*-
"""Ablauftest des Umbau-Makros in LibreOffice gegen die Outlook-Attrappe.

Baut die Testvariante (bau_regeln.py --test), laedt sie je Szenario frisch in LibreOffice (eigener Port und eigenes
Profil) und ruft die echten Makros auf (modUmbau.RegelnLesenLauf, VorschauLauf, AusfuehrenLauf). Die Attrappe
(quellen/vba_test) bildet Stores, Ordner, Rules/Rule, Bedingungen, Aktionen und Empfaenger nach, ist mit den 43
Regeln des Exports befuellt und zaehlt jeden schreibenden Zugriff. Geprueft werden Blattinhalte (Vorschau,
Ergebnis, Live, Sicherung, Protokoll, Status), Rueckfragen und der gespeicherte Stand der Attrappe.

Erwartete Werte (Namen, Anzahlen, Soll-Reihenfolge) kommen aus dem Export bzw. dem Blatt Anlegen, nicht aus dem Test.

Aufruf: python3 test_umbau.py <regel-export.xlsx> <arbeitsordner> [szenario ...]
Ende mit Exitcode 1, wenn eine Pruefung fehlschlaegt.
"""
import os
import re
import subprocess
import sys
import time

import openpyxl
import uno
from com.sun.star.beans import PropertyValue

HIER = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get('LO_PORT', '2483'))
PROFIL = os.environ.get('LO_PROFIL', 'file:///tmp/lo_regeln_umbau_test')
BES, MAK = 'Bestandsuebertragungen@ergo.de', 'Maklerauftraege@ergo.de'
AA_NEU = '\\\\Bestandsuebertragungen@ergo.de\\Archiv\\Automatische Antworten'

ERGEBNISSE = []
EXPORT = {}


def pruefe(bedingung, text, detail=''):
    ERGEBNISSE.append((bool(bedingung), text))
    print('  [%s] %s%s' % ('OK' if bedingung else 'FEHLER', text, ('  ->  ' + detail) if (detail and not bedingung) else ''))
    return bedingung


def pv(n, v):
    p = PropertyValue()
    p.Name = n
    p.Value = v
    return p


# LibreOffice gibt beim Schliessen einer Mappe mit VBA-Projekt nicht allen Speicher frei (je Laden etwa 160 MB); nach
# etwa 70 Ladevorgaengen beendet der Speicherwaechter soffice.bin. Darum nach so vielen Ladevorgaengen neu starten.
LADUNGEN_JE_START = 20


class Sitzung:
    def __init__(self, pfad):
        self.pfad = pfad
        self.ladungen = 0
        self.starten()

    def starten(self):
        self.proc = subprocess.Popen(['soffice', '--headless', '--norestore', '--nologo', '-env:UserInstallation=' + PROFIL,
                                      '--accept=socket,host=localhost,port=%d;urp;' % PORT],
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        self.ctx = None
        for _ in range(90):
            try:
                local = uno.getComponentContext()
                res = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
                self.ctx = res.resolve('uno:socket,host=localhost,port=%d;urp;StarOffice.ComponentContext' % PORT)
                break
            except Exception:
                time.sleep(1)
        if self.ctx is None:
            self.proc.kill()
            raise SystemExit('LibreOffice antwortet nicht')
        self.desktop = self.ctx.ServiceManager.createInstanceWithContext('com.sun.star.frame.Desktop', self.ctx)
        self.doc = None

    def laden(self):
        if self.doc is not None:
            self.doc.close(True)
            self.doc = None
        self.ladungen += 1
        if self.ladungen > LADUNGEN_JE_START:
            self.ende()
            self.ladungen = 1
            self.starten()
        self.doc = self.desktop.loadComponentFromURL(uno.systemPathToFileUrl(self.pfad), '_blank', 0,
                                                     (pv('Hidden', True), pv('MacroExecutionMode', 4)))
        libs = self.doc.BasicLibraries
        for lib in libs.ElementNames:
            libs.loadLibrary(lib)
        self.sp = self.doc.getScriptProvider()
        self.layout_lesen()

    def layout_lesen(self):
        t = self.ruf('modAttrappe.AtLayout')
        if not t:
            raise RuntimeError('AtLayout leer – VBA-Projekt kompiliert in LibreOffice nicht')
        self.L = dict(x.split('=', 1) for x in t.split(';'))
        self.L.update(dict(x.split('=', 1) for x in self.ruf('modAttrappe.AtLayoutOrdner').split(';')))

    def ruf(self, name, *args):
        s = self.sp.getScript('vnd.sun.star.script:RegelnUmbau.%s?language=Basic&location=document' % name)
        return s.invoke(tuple(args), (), ())[0]

    def zelle(self, blatt, adresse):
        return self.doc.Sheets.getByName(blatt).getCellRangeByName(adresse).getString()

    def setze(self, blatt, adresse, wert):
        self.doc.Sheets.getByName(blatt).getCellRangeByName(adresse).setString(wert)

    def spalte(self, name):
        return chr(64 + int(self.L['SP_' + name]))

    def planzeile(self, nr):
        return int(self.L['PLAN_ERSTE']) + nr - 1

    def plan(self, spalte):
        erste = int(self.L['PLAN_ERSTE'])
        out = {}
        for r in range(erste, int(self.L['PLAN_LETZTE']) + 1):
            nr = self.zelle('Umsetzung', '%s%d' % (self.spalte('NR'), r))
            if nr:
                out[int(float(nr))] = self.zelle('Umsetzung', '%s%d' % (self.spalte(spalte), r))
        return out

    def ausfuehren_setzen(self, nr, wert):
        self.setze('Umsetzung', '%s%d' % (self.spalte('AUSF'), self.planzeile(nr)), wert)

    def nur(self, zeilen):
        for nr in range(1, len(EXPORT['plan']) + 1):
            self.ausfuehren_setzen(nr, 'Ja' if nr in zeilen else 'Nein')

    def planzeile_setzen(self, nr, **werte):
        r = self.planzeile(nr)
        self.setze('Umsetzung', '%s%d' % (self.spalte('NR'), r), str(nr))
        self.setze('Umsetzung', '%s%d' % (self.spalte('AUSF'), r), werte.pop('ausf', 'Ja'))
        for k, v in werte.items():
            self.setze('Umsetzung', '%s%d' % (self.spalte(k.upper()), r), v)

    def ospalte(self, name):
        return chr(64 + int(self.L['OSP_' + name]))

    def oplanzeile(self, nr):
        return int(self.L['O_PLAN_ERSTE']) + nr - 1

    def oplan(self, spalte):
        out = {}
        for r in range(int(self.L['O_PLAN_ERSTE']), int(self.L['O_PLAN_LETZTE']) + 1):
            nr = self.zelle('Ordner', '%s%d' % (self.ospalte('NR'), r))
            if nr:
                out[int(float(nr))] = self.zelle('Ordner', '%s%d' % (self.ospalte(spalte), r))
        return out

    def oplanzeile_setzen(self, nr, **werte):
        r = self.oplanzeile(nr)
        self.setze('Ordner', '%s%d' % (self.ospalte('NR'), r), str(nr))
        self.setze('Ordner', '%s%d' % (self.ospalte('AUSF'), r), werte.pop('ausf', 'Ja'))
        for k, v in werte.items():
            self.setze('Ordner', '%s%d' % (self.ospalte(k.upper()), r), v)

    def ostatus(self):
        return self.zelle('Ordner', self.L['O_STATUS'])

    def ordner(self, adresse):
        return [z for z in self.ruf('modAttrappe.AtOrdnerListe', adresse).split('\n') if z]

    def zeilen(self, blatt, erste, spalten):
        out = []
        sh = self.doc.Sheets.getByName(blatt)
        r = erste
        while sh.getCellRangeByName('A%d' % r).getString() != '':
            out.append([sh.getCellByPosition(c, r - 1).getString() for c in range(spalten)])
            r += 1
        return out

    def zustand(self, adresse):
        return [z.split('\t') for z in self.ruf('modAttrappe.AtZustand', adresse).split('\n') if z]

    def regel(self, adresse, name):
        return {r[2]: r for r in self.zustand(adresse)}.get(name)

    def zaehler(self):
        return dict(x.split('=') for x in self.ruf('modAttrappe.AtZaehler').split(';'))

    def fragen(self):
        out = []
        for b in self.ruf('modAttrappe.AtDialoge').split('----'):
            b = b.strip()
            if b.startswith('FRAGE'):
                kopf, _, text = b.partition('\n')
                out.append((kopf, text.strip()))
        return out

    def status(self):
        return self.zelle('Umsetzung', self.L['ZELLE_PFSTATUS'])

    def ende(self):
        try:
            if self.doc is not None:
                self.doc.close(True)
            self.desktop.terminate()
        except Exception:
            pass
        try:
            self.proc.wait(timeout=30)
        except Exception:
            self.proc.kill()


def export_lesen(pfad, test):
    """Erwartete Werte aus dem Export und aus dem Blatt Anlegen der gebauten Mappe."""
    wb = openpyxl.load_workbook(pfad)
    ue = wb['Übersicht']
    kopf = [c.value for c in ue[7]]
    sp = {k: i for i, k in enumerate(kopf)}
    regeln = []
    for row in ue.iter_rows(min_row=8, values_only=True):
        if row[0] is None:
            continue
        regeln.append(dict(pf=row[sp['Postfach']], nr=row[sp['Reihenfolge']], name=row[sp['Regelname']],
                           aktiv=row[sp['Aktiv']], lesbar=row[sp.get('Bedingung lesbar', 0)] if 'Bedingung lesbar' in sp else None))
    elemente = {}
    for row in wb['Elemente'].iter_rows(min_row=2, values_only=True):
        elemente.setdefault((row[0], row[2]), []).append((row[4], row[5], row[6]))
    EXPORT['regeln'] = regeln
    EXPORT['elemente'] = elemente
    EXPORT['keine'] = {pf: [r for r in regeln if r['pf'] == pf and str(r['lesbar'] or '').startswith('keine')] for pf in (BES, MAK)}
    EXPORT['n'] = {pf: len([r for r in regeln if r['pf'] == pf]) for pf in (BES, MAK)}
    # Soll-Reihenfolge und Plan aus der gebauten Mappe
    tw = openpyxl.load_workbook(test)
    ws = tw['Anlegen']
    soll, an = [], False
    for r in range(1, ws.max_row + 1):
        a, b, c = ws.cell(r, 1).value, ws.cell(r, 2).value, ws.cell(r, 3).value
        if a == 'Pos.':
            an = True
            continue
        if an:
            if not isinstance(a, int):
                break
            soll.append((c, b))
    EXPORT['soll'] = soll
    um = tw['Umsetzung']
    kz = [r for r in range(1, um.max_row + 1) if um.cell(r, 2).value == 'Nr' and um.cell(r, 4).value == 'Aktion'][0]
    plan = []
    for r in range(kz + 1, kz + 40):
        if um.cell(r, 4).value:
            plan.append(dict(nr=um.cell(r, 2).value, ausf=um.cell(r, 3).value, aktion=um.cell(r, 4).value,
                             regel=um.cell(r, 5).value, neu=um.cell(r, 6).value, ver=um.cell(r, 9).value,
                             kop=um.cell(r, 10).value, quelle=um.cell(r, 11).value))
    EXPORT['plan'] = plan
    ow = tw['Ordner']
    kz = [r for r in range(1, ow.max_row + 1) if ow.cell(r, 2).value == 'Nr' and ow.cell(r, 5).value == 'Aktion'][0]
    oplan = []
    for r in range(kz + 1, kz + 80):
        if ow.cell(r, 5).value:
            oplan.append(dict(nr=ow.cell(r, 2).value, ausf=ow.cell(r, 3).value, pf=ow.cell(r, 4).value,
                              aktion=ow.cell(r, 5).value, heute=ow.cell(r, 6).value or '', neu=ow.cell(r, 7).value or ''))
    EXPORT['oplan'] = oplan
    # Regelziele laut Export: (Postfach, Regel, Art, Pfad mit %2F)
    ziele = []
    for (pf, name), liste in elemente.items():
        for art, bez, d in liste:
            if art == 'Aktion' and bez in ('In Ordner verschieben', 'In Ordner kopieren') and d:
                ziele.append((pf, name, bez, d))
    EXPORT['ziele'] = ziele


def namen_ohne(pf):
    """Erwarteter Text der Regeln ohne sichtbare Bedingung (wie NamenOhneBed)."""
    return '; '.join('„%s“%s' % (r['name'], '' if r['aktiv'] == 'Ja' else ' (aus)') for r in EXPORT['keine'][pf][:4])


def elemente(pf, name, art, bez):
    return [d for a, b, d in EXPORT['elemente'].get((pf, name), []) if a == art and b == bez]


ERG_OK = 'erledigt (geprüft)'
ERG_OHNE = 'erledigt (geprüft, ohne sichtbare Bedingung)'
OHNE_HINWEIS = ' · Regel ohne sichtbare Bedingung'
EKWAD = 'E - KWAD – Gruppenpostfach'


def ohne_namen(pf=BES):
    return [r['name'] for r in EXPORT['keine'][pf]]


def erg_ok(nr):
    """Erwartetes Ergebnis einer fehlerfrei ausgefuehrten Planzeile: Schritte an Regeln ohne sichtbare Bedingung
    melden das eigens (Befund 5)."""
    regel = [p['regel'] for p in EXPORT['plan'] if p['nr'] == nr][0]
    return ERG_OHNE if regel in ohne_namen() else ERG_OK


def alle_ok(erg, zeilen):
    return all(erg[n] == erg_ok(n) for n in zeilen)


def liste_namen(det):
    return list(dict.fromkeys(x.strip() for x in (det or '').split(';') if x.strip()))


def woerter(det):
    return re.findall(r'"([^"]*)"', det or '')


def anzeige(werte, hoechstens=3):
    """Wie WAnzeigen im Makro: „a“, „b“, „c“ und n weitere."""
    s = ', '.join('„%s“' % w for w in werte[:hoechstens])
    return s + (' und %d weitere' % (len(werte) - hoechstens) if len(werte) > hoechstens else '')


def soll_mit_platz(name, platz):
    """Reihenfolge des Bestands laut Export, Regel name auf Platz platz (herausnehmen und einfuegen)."""
    regeln = sorted([r for r in EXPORT['regeln'] if r['pf'] == BES], key=lambda r: r['nr'])
    r = [x for x in regeln if x['name'] == name][0]
    regeln.remove(r)
    regeln.insert(platz - 1, r)
    return regeln


def abfang_text(regeln, name, neu=()):
    """Erwarteter Text wie modModell.AbfangNamen fuer eine Regel name in der Reihenfolge regeln."""
    i = [x['name'] for x in regeln].index(name)
    danach = [x['name'] for x in regeln[i + 1:] if x['aktiv'] == 'Ja']
    erste = ('neue Regel „%s“' if danach[0] in neu else '„%s“') % danach[0]
    if len(danach) == 1:
        return '„%s“ vor 1 aktiven Regel (%s)' % (name, erste)
    return '„%s“ vor %d aktiven Regeln (zuerst %s)' % (name, len(danach), erste)


def kurz(s, n=150):
    s = s.replace('\n', ' | ')
    return s if len(s) <= n else s[:n] + ' …'


def zeige_plan(s, spalte):
    for nr, st in sorted(s.plan(spalte).items()):
        print('     %2d  %s' % (nr, kurz(st, 170)))


def zeilen_nr(aktion=None, ausf=None):
    return [p['nr'] for p in EXPORT['plan'] if (aktion is None or p['aktion'] == aktion) and (ausf is None or p['ausf'] == ausf)]


def plan_nr(aktion, regel):
    return [p['nr'] for p in EXPORT['plan'] if p['aktion'] == aktion and p['regel'] == regel][0]


# ------------------------------------------------------------------ Szenarien
def sz_lesen(s):
    print('\n== 1  Regeln aus Outlook lesen (nur lesen, Blatt Live) – Stand wie im Export')
    s.laden()
    print('   ', s.ruf('modAttrappe.AtStart', 'export'))
    vorher_b, vorher_m = s.zustand(BES), s.zustand(MAK)
    msg = s.ruf('modUmbau.RegelnLesenLauf')
    print('    Meldung:', kurz(msg, 220))
    z = s.zaehler()
    pruefe(z['schreib'] == '0' and z['save'] == '0', 'Lesen schreibt nichts nach Outlook', str(z))
    live = s.zeilen('Live', int(s.L['LIVE_ERSTE']), 14)
    pruefe(len(live) == EXPORT['n'][BES] + EXPORT['n'][MAK], 'Live: alle %d Regeln' % (EXPORT['n'][BES] + EXPORT['n'][MAK]),
           str(len(live)))
    nl = [r for r in live if r[12] == 'Nein']
    pruefe(not nl, 'Keine Regel nicht lesbar (neuer Export: alle Bedingungen lesbar)', str([r[2] for r in nl]))
    for pf in (BES, MAK):
        ohne = [r[2] for r in live if r[0] == pf and r[13].startswith('keine sichtbare Bedingung')]
        pruefe(ohne == [r['name'] for r in EXPORT['keine'][pf]],
               '%s: Regeln ohne sichtbare Bedingung wie im Export (%d)' % (pf.split('@')[0], len(ohne)), str(ohne))
    m1 = [r for r in live if r[0] == MAK and r[1] == '1'][0]
    pruefe('Formular / Nachrichtenklasse' in m1[5] and 'IPM.Note.Rules.OofTemplate.Microsoft' in m1[5] and m1[11] == '23',
           'Formular-Bedingung (Typ 23) gelesen', str(m1[5:12]))
    pruefe(all(r[10] == '31' for r in live), 'Bedingungseinträge je Regel 31 (wie Outlook laut Diagnose)')
    pruefe(s.zustand(BES) == vorher_b and s.zustand(MAK) == vorher_m, 'Gespeicherter Stand unverändert')
    erwartet = ('Speichern möglich mit Bestätigung – alle %d Regeln lesbar, %d ohne sichtbare Bedingung: %s (vor dem '
                'Ausführen bestätigen)' % (EXPORT['n'][BES], len(EXPORT['keine'][BES]), namen_ohne(BES)))
    pruefe(s.status() == erwartet, 'Stand Zielpostfach: voller Text', '\n      ist:  %s\n      soll: %s' % (s.status(), erwartet))
    prot = s.zeilen('Protokoll', int(s.L['PROT_ERSTE']), 7)
    pruefe(any(p[4] == 'LESEN' for p in prot), 'Protokoll: Leseversuch eingetragen')
    pruefe(s.ruf('modPlan.PlanVersion') == 'Plan 3.0', 'PlanVersion „Plan 3.0“', s.ruf('modPlan.PlanVersion'))


def sz_vorschau(s):
    print('\n== 2  Vorschau im Ist-Zustand (erster Lauf wie im Export)')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    vorher = (s.zustand(BES), s.zustand(MAK), s.ruf('modAttrappe.AtOrdnerListe', BES))
    msg = s.ruf('modUmbau.VorschauLauf')
    print('    Meldung:', kurz(msg, 300))
    zeige_plan(s, 'VORSCHAU')
    st = s.plan('VORSCHAU')
    z = s.zaehler()
    pruefe(z['schreib'] == '0', 'Vorschau schreibt nichts (0 Schreibzugriffe, auch keine Ordner)', str(z))
    pruefe((s.zustand(BES), s.zustand(MAK), s.ruf('modAttrappe.AtOrdnerListe', BES)) == vorher,
           'Gespeicherter Stand und Ordner unverändert')
    ja = zeilen_nr(ausf='Ja')
    pruefe(all(st[n].startswith('bereit') for n in ja), 'Zeilen %s bereit' % ja, str({n: st[n][:60] for n in ja}))
    pruefe(all(st[n] == 'nicht ausgewählt' for n in zeilen_nr(ausf='Nein')), 'Erinnerungszeilen nicht ausgewählt')
    pruefe('Ordner wird angelegt: Archiv\\Automatische Antworten' in st[1], 'Zeile 1: neuer Ordner Archiv\\Automatische Antworten')
    n_kop = [p['nr'] for p in EXPORT['plan'] if p['aktion'] == 'KOPIEREN' and p['ausf'] == 'Ja']
    pruefe(all('wird neu angelegt' in st[n] for n in n_kop), 'KOPIEREN (Zeilen %s): Regel wird neu angelegt' % n_kop)
    pruefe(all('Ordner wird angelegt' not in st[n] for n in n_kop), 'Gleicher neuer Ordner nur einmal gemeldet')
    nw = zeilen_nr('BEDINGUNG_WORT_ERGAENZEN')[0]
    pruefe(st[nw] == 'bereit · Betreff enthält + „Eskalation“', 'Wörter ergänzen: nur „Eskalation“', st[nw])
    nu = zeilen_nr('UMLEITEN_STATT_WEITERLEITEN')[0]
    pruefe(st[nu] == 'bereit · umleiten an KWAD - Gruppenpostfach (Weiterleiten aus)', 'Umleiten: volle Empfängerliste', st[nu])
    kbi = liste_namen(elemente(MAK, 'KV Solo', 'Ausnahme', 'Absender ist')[0])
    na = plan_nr('AUSNAHMEN_UEBERNEHMEN', 'KV Solo')
    pruefe(st[na] == 'bereit · Ausnahmen + Absender ist + %s; Betreff enthält + „Unzustellbar“' % anzeige(kbi),
           'Ausnahmen KV Solo: erste drei der %d Absender mit Namen, Rest „und n weitere“ (Befund 8)' % len(kbi), st[na])
    ne = plan_nr('AUSNAHMEN_UEBERNEHMEN', EKWAD)
    erw = ('bereit · Ausnahmen + Absender ist + %s; Betreff enthält + %s' % (
        anzeige(liste_namen(elemente(MAK, EKWAD, 'Ausnahme', 'Absender ist')[0])),
        anzeige(woerter(elemente(MAK, EKWAD, 'Ausnahme', 'Betreff enthält')[0]))) + OHNE_HINWEIS)
    pruefe(st[ne] == erw, 'Ausnahmen E - KWAD: „Absender ist + „Microsoft Outlook““, Zeile nennt „Regel ohne sichtbare '
           'Bedingung“ (Befunde 8 und 1)', '\n      ist:  %s\n      soll: %s' % (st[ne], erw))
    pruefe(all(OHNE_HINWEIS not in st[n] for n in ja if n != ne), 'Übrige Zeilen ohne diesen Hinweis')
    erwartet = ('Speichern möglich mit Bestätigung – alle %d Regeln lesbar, %d ohne sichtbare Bedingung: %s (vor dem '
                'Ausführen bestätigen)' % (EXPORT['n'][BES], len(EXPORT['keine'][BES]), namen_ohne(BES)))
    pruefe(s.status() == erwartet, 'Stand Zielpostfach nach der Vorschau: voller Text, Namen wie in Outlook', s.status())
    pruefe(re.match(r'\d\d\.\d\d\.\d{4} \d\d:\d\d$', s.zelle('Umsetzung', s.L['ZELLE_VORSCHAU_ZEIT'])) and
           len(s.zelle('Umsetzung', s.L['ZELLE_PRUEFWERT'])) == 8, 'Zeitpunkt (dd.mm.yyyy hh:nn) und Prüfwert gesetzt')
    pruefe('Ohne sichtbare Bedingung' in msg and EXPORT['keine'][BES][0]['name'] in msg, 'Meldung listet Regeln ohne Bedingung')


def sz_ohne_vorschau(s):
    print('\n== 3  Ausführen ohne Vorschau')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg))
    pruefe(msg.startswith('Bitte zuerst') and s.zaehler()['schreib'] == '0', 'Ohne Vorschau keine Ausführung')


def regel_pruefen_nach_lauf(s):
    """Inhalt der geaenderten Regeln nach einem vollstaendigen Lauf."""
    zb = {r[2]: r for r in s.zustand(BES)}
    zm = {r[2]: r for r in s.zustand(MAK)}
    pruefe(zb['Automatische Antworten aussortieren'][5].startswith('MOVE=' + AA_NEU),
           'Zeile 1/2: umbenannt, Ziel Archiv\\Automatische Antworten', zb.get('Automatische Antworten aussortieren', ['?'] * 7)[5])
    n1 = zb['Automatische Antworten 1zu1 aussortieren']
    pruefe(n1[4] == zm['Automatische Antworten 1zu1 aussortieren'][4] and n1[4].startswith('1=noreply@1zu1.ag|13='),
           'Neue Regel 1zu1: Bedingungen gleich der Quelle (Absender + Mailtext)', '%s / %s' % (n1[4], zm['Automatische Antworten 1zu1 aussortieren'][4]))
    pruefe(n1[5] == 'MOVE=' + AA_NEU + '|HALT', 'Neue Regel 1zu1: verschieben nach Archiv\\Automatische Antworten + Stopp', n1[5])
    esk = zb['Eskalations-GPF in den Prio-Ordner']
    pruefe(esk[4] == zm['Eskalations-GPF in den Prio-Ordner'][4] and 'MOVE=\\\\Bestandsuebertragungen@ergo.de\\Prio' in esk[5]
           and 'COPY=\\\\Bestandsuebertragungen@ergo.de\\Archiv\\Archiv: Dopplung der Neuzugänge' in esk[5] and 'HALT' in esk[5],
           'Neue Regel Eskalation: Bedingung wie Quelle, Verschieben, Kopieren, Stopp')
    vorh = [w.strip('"') for w in re.findall(r'"[^"]*"', elemente(BES, 'Beschwerden/Prio in den Prio-Ordner', 'Bedingung', 'Betreff enthält')[0])]
    pruefe(zb['Beschwerden/Prio in den Prio-Ordner'][4] == '2=' + '; '.join(vorh + ['Eskalation']),
           'Beschwerden/Prio: Wörter in alter Reihenfolge + „Eskalation“', zb['Beschwerden/Prio in den Prio-Ordner'][4])
    kv = zb['KV Solo']
    pruefe('REDIR=KWAD - Gruppenpostfach' in kv[5] and 'FWD' not in kv[5], 'KV Solo: Umleiten an, Weiterleiten aus', kv[5])
    pruefe(kv[6] == zm['KV Solo'][6], 'KV Solo: Ausnahmen gleich Makler (alle Absender und Betreff)',
           '\n      ist:  %s\n      soll: %s' % (kurz(kv[6], 200), kurz(zm['KV Solo'][6], 200)))
    ek = zb['E - KWAD – Gruppenpostfach']
    pruefe(ek[6] == zm['E - KWAD – Gruppenpostfach'][6] and ek[4] == '', 'E - KWAD: Ausnahmen gleich Makler, weiter ohne Bedingung',
           '%s / %s' % (ek[6], zm['E - KWAD – Gruppenpostfach'][6]))


def sz_voll(s):
    print('\n== 4  Vollständiger erster Lauf (Plan v2 mit Export-Stand), dann zweiter Lauf')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    makler_vorher = s.zustand(MAK)
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 400))
    zeige_plan(s, 'ERGEBNIS')
    erg = s.plan('ERGEBNIS')
    z = s.zaehler()
    print('    Zähler:', z)
    ja = zeilen_nr(ausf='Ja')
    pruefe(alle_ok(erg, ja), 'Zeilen %s erledigt (geprüft), Zeile %d „ohne sichtbare Bedingung“'
           % (ja, plan_nr('AUSNAHMEN_UEBERNEHMEN', EKWAD)), str(erg))
    pruefe(z['save'] == '1' and z['create'] == '2' and z['ordneradd'] == '1', 'Ein Save, zwei neue Regeln, ein Ordner', str(z))
    ist = [r[2] for r in s.zustand(BES)]
    soll = [n for n, a in EXPORT['soll'] if a != 'kopieren, falls benötigt']
    pruefe(ist == soll, 'Reihenfolge = Soll-Reihenfolge aus Blatt Anlegen (ohne Erinnerungsregeln)',
           '\n      ist:  %s\n      soll: %s' % (ist, soll))
    regel_pruefen_nach_lauf(s)
    pruefe(s.zustand(MAK) == makler_vorher, 'Quellpostfach unverändert')
    pruefe(AA_NEU in s.ruf('modAttrappe.AtOrdnerListe', BES), 'Ordner Archiv\\Automatische Antworten angelegt')
    sich = s.zeilen('Sicherung', int(s.L['SICH_ERSTE']), 12)
    pruefe(len(sich) == EXPORT['n'][BES] and re.match(r'\d\d\.\d\d\.\d{4} \d\d:\d\d$', sich[0][0]),
           'Sicherung: %d Regeln mit Zeitstempel (%s)' % (len(sich), sich[0][0] if sich else ''))
    fr = s.fragen()
    pruefe(len(fr) == 3, 'Drei Rückfragen (Export, ohne Bedingung, Änderungen)', str([f[0] for f in fr]))
    pruefe('Regeln exportieren' in fr[0][1] and 'schließen' in fr[0][1], 'Rückfrage 1: Export und Dialog schließen')
    pruefe('ohne sichtbare Bedingung' in fr[1][1] and namen_ohne(BES) in fr[1][1], 'Rückfrage 2: Regeln ohne Bedingung mit Namen')
    t = fr[2][1]
    zeilen = [x for x in t.split('\n') if x.startswith('• ')]
    print('    Rückfrage 3 (%d Zeichen):\n      %s' % (len(t), t.replace('\n', '\n      ')))
    pruefe(len(t) < 1024 and t.endswith('Jetzt ausführen?') and 'Taskleiste' in t, 'Rückfrage 3 passt in eine MsgBox, Hinweis Taskleiste')
    pruefe(zeilen and all(': ' in x for x in zeilen) and ('weitere' in t or len(zeilen) == len(ja)),
           'Rückfrage 3: je Zeile, was sich ändert (Rest: „… und n weitere“)')
    pruefe(zeilen[0] != zeilen[1] and 'Archiv\\Automatische Antworten' in zeilen[0] and 'neuer Name' in zeilen[1],
           'Rückfrage 3: Zeilen 1 und 2 unterscheidbar (Ziel / neuer Name)')
    ne = plan_nr('AUSNAHMEN_UEBERNEHMEN', EKWAD)
    z_ne = [x for x in zeilen if x.split()[1] == str(ne)]
    pruefe((z_ne and z_ne[0].endswith(OHNE_HINWEIS)) or
           ', davon 1 an einer Regel ohne sichtbare Bedingung' in t,
           'Rückfrage 3: Zeile %d (Sammelregel) gekennzeichnet bzw. in „… und n weitere“ mitgezählt' % ne)
    pruefe('Unberührte Regeln: %d von %d unverändert' % (EXPORT['n'][BES] - 5, EXPORT['n'][BES] - 5) in msg,
           'Nachprüfung: alle unberührten Regeln unverändert')
    # zweiter Lauf
    msg = s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    print('    Zweite Vorschau:', kurz(msg, 120))
    pruefe(all(st[n].startswith('schon erledigt') for n in ja), 'Zweiter Lauf: alles schon erledigt', str(st))
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    pruefe(msg.startswith('Nichts zu tun') and s.zaehler()['save'] == '1', 'Zweites Ausführen: nichts zu tun, kein Save', msg)


def sz_erinnerungen(s, ordnung):
    print('\n== 5  Mit Erinnerungsregeln (neue Ordner, neue Regeln) – Reihenfolge-Art der Attrappe: %s' % ordnung)
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modAttrappe.AtSchalter', 'ordnung', ordnung)
    for nr in zeilen_nr(ausf='Nein'):
        s.ausfuehren_setzen(nr, 'Ja')
    s.ruf('modUmbau.VorschauLauf')
    zeige_plan(s, 'VORSCHAU')
    st = s.plan('VORSCHAU')
    alle = [p['nr'] for p in EXPORT['plan']]
    pruefe(all(st[n].startswith('bereit') for n in alle), 'Alle %d Zeilen bereit' % len(alle))
    pruefe(s.zaehler()['schreib'] == '0', 'Vorschau schreibt nichts')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 300))
    erg = s.plan('ERGEBNIS')
    z = s.zaehler()
    print('    Zähler:', z)
    pruefe(alle_ok(erg, alle), 'Alle Zeilen erledigt (geprüft)', str(erg))
    pruefe(z['save'] == '1' and z['create'] == '5' and z['ordneradd'] == '4', 'Ein Save, fünf neue Regeln, vier Ordner', str(z))
    ist = [r[2] for r in s.zustand(BES)]
    soll = [n for n, a in EXPORT['soll']]
    pruefe(ist == soll, 'Reihenfolge = vollständige Soll-Reihenfolge aus Blatt Anlegen',
           '\n      ist:  %s\n      soll: %s' % (ist, soll))
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(all(st[n].startswith('schon erledigt') for n in alle), 'Zweiter Lauf: alles schon erledigt', str(st))


def sz_sperre(s):
    print('\n== 6  Sperre: nicht lesbare Regeln im Zielpostfach (Typ 0, Zugriffsfehler, unbekannte Aktion)')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'faelle')
    print('   ', s.ruf('modAttrappe.AtAktUnbekannt', BES, 'Papierakten (keine eAkte)'))
    s.ruf('modUmbau.RegelnLesenLauf')
    live = s.zeilen('Live', int(s.L['LIVE_ERSTE']), 14)
    nl = {r[2]: r[13] for r in live if r[0] == BES and r[12] == 'Nein'}
    for k, v in nl.items():
        print('     nicht lesbar: %s | %s' % (k, kurz(v, 100)))
    pruefe(len(nl) == 3, 'Drei Regeln nicht lesbar', str(list(nl)))
    pruefe('unbekannt' in nl.get('Service Team Vermittlerverwaltung - Makler u Koop - Gruppenpostfach', ''), 'Bedingungstyp 0 erkannt')
    pruefe('Zugriffsfehler' in nl.get('PVB, Bot 1 (PVBHH-EXTERN)', ''), 'Zugriffsfehler erkannt')
    pruefe('Aktion unbekannten Typs (0)' in nl.get('Papierakten (keine eAkte)', ''), 'Aktive Aktion vom Typ 0 sperrt (Befund 7)')
    m1 = [r for r in live if r[0] == MAK and r[1] == '1'][0]
    pruefe('Abwesenheitsnotiz' in m1[5] and m1[12] == 'Ja', 'Abwesenheitsnotiz (Typ 19) im Index-Durchlauf gefunden, lesbar')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    ja = zeilen_nr(ausf='Ja')
    pruefe(all(st[n].startswith('blockiert: Speichern gesperrt') for n in ja), 'Sperre: alle ausgewählten Zeilen blockiert',
           str({n: st[n][:50] for n in ja}))
    pruefe(s.status().startswith('Speichern gesperrt – 3 von %d Regeln nicht lesbar: „Service Team' % EXPORT['n'][BES]),
           'Stand: gesperrt mit Namen', s.status())
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    pruefe('blockierte Zeile' in msg and s.zaehler()['schreib'] == '0', 'Ausführen verweigert, nichts geschrieben')
    # Freigabe
    s.setze('Umsetzung', s.L['ZELLE_TROTZ'], 'Ja')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(all(st[n].startswith('bereit') for n in ja), 'Mit „Ja“: Zeilen bereit')
    pruefe(s.status().startswith('Speichern freigegeben trotz 3 von'), 'Stand: freigegeben', s.status())
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 600))
    erg = s.plan('ERGEBNIS')
    pruefe(alle_ok(erg, ja), 'Zeilen erledigt (geprüft)', str(erg))
    fr = s.fragen()
    pruefe('davon 3 nicht lesbar' in fr[-1][1], 'Rückfrage nennt die nicht lesbaren Regeln (Befund 12)', kurz(fr[-1][1], 400))
    pruefe('bei 3 Regel(n) war die Bedingung nicht prüfbar' in msg and 'in den sichtbaren Merkmalen unverändert' in msg
           and 'Testmail' in msg, 'Abschlussmeldung: nicht prüfbare Regeln genannt (Befund 12)')


def sz_sperre_namen(s):
    print('\n== 7  Nicht lesbare Regel wird umbenannt: Stand nennt alten Namen, Ergebnis „Bedingung nicht prüfbar“')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    print('   ', s.ruf('modAttrappe.AtBedFehler', BES, 'Kopie von Automatische Antworten aussortieren'))
    s.setze('Umsetzung', s.L['ZELLE_TROTZ'], 'Ja')
    s.ruf('modUmbau.VorschauLauf')
    pruefe('„Kopie von Automatische Antworten aussortieren“' in s.status() and
           '„Automatische Antworten aussortieren“' not in s.status(), 'Stand nach der Vorschau nennt den Namen wie in Outlook (Befund 14)',
           s.status())
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    s.ruf('modUmbau.AusfuehrenLauf')
    erg = s.plan('ERGEBNIS')
    pruefe(erg[1] == erg[2] == 'erledigt (geprüft, Bedingung nicht prüfbar)', 'Zeilen 1 und 2: „Bedingung nicht prüfbar“', str(erg))


def sz_kopieren_blockiert(s):
    print('\n== 8  Kopieren blockiert: Abwesenheitsnotiz, keine Bedingung, Regel ohne Bedingung im Ziel')
    n1 = plan_nr('KOPIEREN', 'Automatische Antworten 1zu1 aussortieren')
    n2 = plan_nr('KOPIEREN', 'Eskalations-GPF in den Prio-Ordner')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modAttrappe.AtBedSetzen', MAK, 'Automatische Antworten 1zu1 aussortieren', 19, '')
    s.ruf('modAttrappe.AtBedAlleAus', MAK, 'Eskalations-GPF in den Prio-Ordner')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    print('    %d  %s\n    %d  %s' % (n1, kurz(st[n1], 250), n2, kurz(st[n2], 250)))
    pruefe(st[n1].startswith('blockiert: nicht kopierbar: Abwesenheitsnotiz') and 'Diese Regel bitte einmal in Outlook kopieren' in st[n1]
           and 'Posteingang [maklerauftraege@ergo.de]' in st[n1], 'Abwesenheitsnotiz: nicht kopierbar, Anleitung zum Kopieren in Outlook')
    pruefe(st[n2].startswith('blockiert: Quellregel hat keine lesbare Bedingung') and 'Kopieren' in st[n2],
           'Quelle ohne Bedingung: nie ohne Bedingung anlegen')
    pruefe('entsteht erst durch Zeile %d (dort blockiert)' % n1 in st[n1 + 1], 'Folgezeile verweist auf blockierte Zeile', st[n1 + 1])
    pruefe(s.zaehler()['schreib'] == '0', 'Vorschau schreibt nichts')
    # Outlook-Kopie (mit allen Bedingungen) vorhanden -> Fall b
    print('   ', s.ruf('modAttrappe.AtKopieVonOutlook', 'Automatische Antworten 1zu1 aussortieren'))
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(st[n1].startswith('bereit · Kopie aus Outlook („Kopie von Automatische Antworten 1zu1 aussortieren“) wird umbenannt'),
           'Kopie aus Outlook wird umbenannt (Bedingungen gleich der Quelle)', st[n1])
    s.setze('Umsetzung', '%s%d' % (s.spalte('VER'), s.planzeile(n1)), '')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(st[n1].startswith('blockiert: Verschieben-Ziel liegt außerhalb des Zielpostfachs'),
           'Ziel im fremden Postfach bleibt nicht stehen', st[n1])
    # Regel mit dem neuen Namen vorhanden, aber ohne Bedingung -> blockiert (Fall a)
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modAttrappe.AtRegelDazu', BES, 'Eskalations-GPF in den Prio-Ordner', '\\\\Bestandsuebertragungen@ergo.de\\Prio')
    s.ruf('modAttrappe.AtBedAlleAus', BES, 'Eskalations-GPF in den Prio-Ordner')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(st[n2].startswith('blockiert: Regel „Eskalations-GPF in den Prio-Ordner“ hat keine sichtbare Bedingung'),
           'Vorhandene Regel ohne Bedingung meldet nicht „schon erledigt“', st[n2])


def sz_verlust(s, antworten):
    print('\n== 9  Outlook verliert beim Speichern die Bedingung der neuen Regel (Antworten %s)' % antworten)
    n2 = plan_nr('KOPIEREN', 'Eskalations-GPF in den Prio-Ordner')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modAttrappe.AtSchalter', 'verlust', 'Eskalations-GPF in den Prio-Ordner')
    s.nur([n2, n2 + 1])
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', antworten)
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 600))
    erg = s.plan('ERGEBNIS')
    print('    Ergebnis:', erg[n2][:150], '|', erg[n2 + 1][:150])
    pruefe(erg[n2].startswith('gespeichert, Prüfung weicht ab') and 'keine sichtbare Bedingung' in erg[n2],
           'Neue Regel ohne Bedingung nach dem Speichern: Abweichung erkannt (Befund 1)')
    pruefe(erg[n2 + 1].startswith('gespeichert, Prüfung weicht ab') and 'Bedingungen' in erg[n2 + 1],
           'Auch die Positionszeile meldet die Abweichung der Regel')
    fr = s.fragen()
    pruefe(fr and 'Abweichung nach dem Speichern' in fr[-1][0] and '(Vorgabe Ja)' in fr[-1][0],
           'Angebot, die Regel sofort zu deaktivieren (Bedingung weicht ab: Vorgabe Ja)', fr[-1][0] if fr else '')
    esk = s.regel(BES, 'Eskalations-GPF in den Prio-Ordner')
    if antworten.endswith('J'):
        pruefe(esk[3] == 'Nein' and 'Deaktiviert und gespeichert' in msg and s.zaehler()['save'] == '2',
               'Angebot angenommen: Regel deaktiviert und gespeichert', str(esk[:4]))
    else:
        pruefe(esk[3] == 'Ja' and 'Nicht deaktiviert – bitte sofort in Outlook prüfen' in msg, 'Angebot abgelehnt: deutlicher Hinweis')


def sz_addverlust(s):
    print('\n== 10  Empfänger geht beim Kopieren still verloren: Fehler vor dem Speichern')
    n2 = plan_nr('KOPIEREN', 'Eskalations-GPF in den Prio-Ordner')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modAttrappe.AtSchalter', 'addverlust', 'eskalation-strategische-partner-bestandsuebertragu-gruppenpostfach@attrappe.invalid')
    vorher = s.zustand(BES)
    s.nur([n2, n2 + 1])
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 300))
    erg = s.plan('ERGEBNIS')
    pruefe(erg[n2].startswith('nicht ausgeführt: Fehler: Empfänger nicht vollständig übernommen'), 'Fehler erkannt', erg[n2])
    pruefe(s.zaehler()['save'] == '0' and s.zustand(BES) == vorher, 'Kein Save, Stand unverändert')


def sz_umleiten_alt(s):
    print('\n== 11  Umleiten statt Weiterleiten: ausgeschaltete Umleitung hat noch einen alten Empfänger')
    nu = zeilen_nr('UMLEITEN_STATT_WEITERLEITEN')[0]
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    print('   ', s.ruf('modAttrappe.AtRedirAlt', BES, 'KV Solo', 'Alt Empfaenger Extern', 'alt.extern@attrappe.invalid'))
    s.nur([nu])
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    print('    %d  %s' % (nu, st[nu]))
    pruefe(st[nu].startswith('blockiert: „Umleiten an“ (ausgeschaltet) enthält schon andere Empfänger (alt.extern@attrappe.invalid)'),
           'Alte Empfänger würden nicht still mit eingeschaltet (Befund 2)')


def sz_layout(s):
    print('\n== 12  Blatt umgebaut / Ziel = Quelle')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    sh = s.doc.Sheets.getByName('Umsetzung')
    sh.Rows.removeByIndex(3, 1)                       # Leerzeile ueber den Schritten loeschen
    s.layout_lesen()
    print('    nach dem Löschen: Ziel in %s, Plan ab Zeile %s' % (s.L['ZELLE_ZIEL'], s.L['PLAN_ERSTE']))
    msg = s.ruf('modUmbau.VorschauLauf')
    pruefe(msg.startswith('Vorschau für Bestandsuebertragungen@ergo.de') and s.plan('VORSCHAU')[1].startswith('bereit'),
           'Zeile gelöscht: Namen wandern mit, Vorschau liest die richtigen Zellen (Befund 3)', kurz(msg, 200))
    sh.Columns.removeByIndex(int(s.L['SP_NEU']) - 1, 1)  # Spalte "Neuer Name / Position / Wert" loeschen
    vorher = s.zelle('Umsetzung', s.L['ZELLE_PFSTATUS'])
    msg = s.ruf('modUmbau.VorschauLauf')
    print('    Spalte gelöscht:', kurz(msg, 250))
    pruefe(msg.startswith('Vorschau nicht möglich: Das Blatt Umsetzung wurde umgebaut') and 'Spalte' in msg,
           'Spalte gelöscht: Vorschau verweigert')
    pruefe(s.zaehler()['getrules'] == '2', 'Dabei nichts aus Outlook gelesen')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.setze('Umsetzung', s.L['ZELLE_ZIEL'], MAK)
    s.setze('Umsetzung', s.L['ZELLE_QUELLE'], BES)
    msg = s.ruf('modUmbau.VorschauLauf')
    pruefe('Quellpostfach dieser Mappe' in msg, 'Ziel und Quelle vertauscht: abgelehnt', msg)
    s.setze('Umsetzung', s.L['ZELLE_ZIEL'], 'bestandsuebertragungen@ergo.de')
    s.setze('Umsetzung', s.L['ZELLE_QUELLE'], 'BESTANDSUEBERTRAGUNGEN@ERGO.DE')
    msg = s.ruf('modUmbau.VorschauLauf')
    pruefe('sind gleich' in msg, 'Ziel = Quelle (andere Schreibweise): abgelehnt', msg)
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    zz = s.L['ZELLE_ZIEL']
    s.setze('Umsetzung', 'B' + zz[1:], 'Quellpostfach (nur gelesen)')
    msg = s.ruf('modUmbau.VorschauLauf')
    pruefe(msg.startswith('Vorschau nicht möglich: Das Blatt Umsetzung wurde umgebaut') and 'erwartet' in msg,
           'Beschriftung passt nicht: abgelehnt', kurz(msg, 200))


def sz_position(s):
    print('\n== 13  Position: Regelnamen mit „|“, Ausweich-Bezüge mit „||“')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    test_name = [r['name'] for r in EXPORT['regeln'] if r['pf'] == BES and '|' in r['name']][0]
    # Lockvogel „TEST“ (Teil vor dem „|“) auf Platz 1 - hinter der Sammelregel stuende er vor ihr als aktive Regel
    # und sperrte das Speichern (Befund 1)
    print('   ', s.ruf('modAttrappe.AtRegelDazu', BES, test_name.split('|')[0].strip(), '\\\\Bestandsuebertragungen@ergo.de\\Prio'))
    print('   ', s.ruf('modAttrappe.AtPlatz', BES, test_name.split('|')[0].strip(), 1))
    s.nur([])
    n = len(EXPORT['plan']) + 1
    # Die Sammelregel hinter die ausgeschaltete TEST-Regel: bleibt letzte aktive Regel
    s.planzeile_setzen(n, aktion='POSITION', regel=EKWAD, neu='nach: ' + test_name)
    s.planzeile_setzen(n + 1, aktion='POSITION', regel='PVB, Bot 1 (PVBHH-EXTERN)',
                       neu='vor: Gibt es nicht || Mails von BÜ-Bot, Robert (ODPB2D-EXTERN)')
    s.planzeile_setzen(n + 2, aktion='POSITION', regel='CCPI mit Anlagen "hell"', neu='nach: Gibt es nicht || ')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    for k in (n, n + 1, n + 2):
        print('    %d  %s' % (k, st[k]))
    pruefe(st[n] == 'bereit · direkt nach „%s“%s' % (test_name, OHNE_HINWEIS), 'Ganzer Name mit „|“ trifft die richtige Regel (Befund 4)', st[n])
    pruefe(st[n + 1] == 'bereit · direkt vor „Mails von BÜ-Bot, Robert (ODPB2D-EXTERN)“ (Ausweich-Bezug, „Gibt es nicht“ fehlt)',
           'Ausweich-Bezug mit „||“ wird genannt', st[n + 1])
    pruefe(st[n + 2].startswith('blockiert: leerer Bezug'), 'Leerer Ausweich-Bezug blockiert', st[n + 2])
    s.nur([])
    s.planzeile_setzen(n, ausf='Ja', aktion='POSITION', regel=EKWAD, neu='nach: ' + test_name)
    s.planzeile_setzen(n + 1, ausf='Nein', aktion='POSITION', regel='x', neu='')
    s.planzeile_setzen(n + 2, ausf='Nein', aktion='POSITION', regel='x', neu='')
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    s.ruf('modUmbau.AusfuehrenLauf')
    ist = [r[2] for r in s.zustand(BES)]
    pruefe(ist.index(EKWAD) == ist.index(test_name) + 1, '%s steht direkt hinter %s' % (EKWAD, test_name), str(ist[-5:]))


def sz_benannt(s):
    print('\n== 14  Bedingung nur über die benannte Eigenschaft sichtbar (OnLocalMachine, SenderInAddressList)')
    nj = plan_nr('KOPIEREN', [p['regel'] for p in EXPORT['plan'] if p['ausf'] == 'Nein'][0])
    regel = [p['regel'] for p in EXPORT['plan'] if p['nr'] == nj][0]
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    print('   ', s.ruf('modAttrappe.AtBedVerstecken', MAK, regel, 27))
    print('   ', s.ruf('modAttrappe.AtBedVerstecken', MAK, 'KV@Qualitypool in einen Unterordner', 25))
    s.ruf('modUmbau.RegelnLesenLauf')
    live = {r[2]: r for r in s.zeilen('Live', int(s.L['LIVE_ERSTE']), 14) if r[0] == MAK}
    pruefe('27' in live[regel][11].split(', ') and 'nur auf diesem Computer' in live[regel][5],
           'Typ 27 (OnLocalMachine) über die benannte Eigenschaft erkannt (Befund 5)', str(live[regel][5:12]))
    pruefe('25' in live['KV@Qualitypool in einen Unterordner'][11].split(', '), 'Typ 25 (SenderInAddressList) erkannt')
    s.nur([nj])
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(st[nj].startswith('blockiert: nicht kopierbar: nur auf diesem Computer'), 'Kopie wird nicht breiter als die Quelle', st[nj])


def sz_nurlet(s):
    print('\n== 15  Objektmodell nimmt .Folder nur als Wert an (Let): Ausweichweg über CallByName')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modAttrappe.AtSchalter', 'nurlet', '1')
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    erg = s.plan('ERGEBNIS')
    z = s.zaehler()
    print('    Zähler:', z)
    pruefe(alle_ok(erg, zeilen_nr(ausf='Ja')), 'Alle Zeilen erledigt (geprüft)', kurz(msg, 300))
    pruefe(int(z['let']) >= 4, 'Ordner per Let zugewiesen (%s Zuweisungen, Befund 9)' % z['let'])


def sz_pfad(s):
    print('\n== 16  Ungültige Pfade (\\\\ ohne Postfach): blockiert statt Laufzeitfehler')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.nur([])
    n = len(EXPORT['plan']) + 1
    s.planzeile_setzen(n, aktion='ORDNER_ANLEGEN', ver='\\\\')
    s.planzeile_setzen(n + 1, aktion='ZIELORDNER', regel='KV Solo', ver='\\\\\\')
    s.planzeile_setzen(n + 2, aktion='ORDNER_ANLEGEN', ver='\\\\Bestandsuebertragungen@ergo.de\\\\Leer')
    msg = s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    for k in (n, n + 1, n + 2):
        print('    %d  %s' % (k, st[k]))
    pruefe(st[n].startswith('blockiert: Pfad ohne Postfachnamen') and st[n + 1].startswith('blockiert: Pfad ohne Postfachnamen'),
           'Pfad „\\\\“: blockiert (Befund 11)', kurz(msg, 100))
    pruefe(st[n + 2].startswith('blockiert: Pfad mit leerem Ordnernamen'), 'Leerer Ordnername: blockiert')


def sz_ohne_outlook(s):
    print('\n== 17  Outlook nicht erreichbar: Live bleibt, Vorschau ohne Zeitstempel')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modUmbau.RegelnLesenLauf')
    n_vorher = len(s.zeilen('Live', int(s.L['LIVE_ERSTE']), 14))
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'ohneoutlook', '1')
    msg = s.ruf('modUmbau.RegelnLesenLauf')
    a2 = s.zelle('Live', s.L['ZELLE_LIVE_ZEIT'])
    pruefe(msg.startswith('Outlook ist nicht erreichbar') and a2.startswith('Lesen nicht möglich am') and
           len(s.zeilen('Live', int(s.L['LIVE_ERSTE']), 14)) == n_vorher, 'Lesen ohne Outlook: Liste bleibt, Vermerk (Befund 16)', a2)
    prot = s.zeilen('Protokoll', int(s.L['PROT_ERSTE']), 7)
    pruefe(any(p[4] == 'LESEN' and 'nicht möglich' in p[6] for p in prot), 'Fehlgeschlagener Leseversuch protokolliert')
    msg = s.ruf('modUmbau.VorschauLauf')
    pruefe(msg.startswith('Vorschau nicht möglich: Outlook ist nicht erreichbar') and
           s.zelle('Umsetzung', s.L['ZELLE_VORSCHAU_ZEIT']) == '' and s.zelle('Umsetzung', s.L['ZELLE_PRUEFWERT']) == '',
           'Vorschau ohne Outlook: kein Zeitstempel, kein Prüfwert')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    pruefe(msg.startswith('Bitte zuerst'), 'Ausführen danach verweigert')


def sz_fehler(s):
    print('\n== 18  Fehler in einem Schritt: nichts speichern, keine Ordner anlegen')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    vorher = (s.zustand(BES), s.ruf('modAttrappe.AtOrdnerListe', BES))
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'namefehler', 'Kopie von Automatische Antworten aussortieren')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 300))
    erg = s.plan('ERGEBNIS')
    z = s.zaehler()
    pruefe(erg[2].startswith('nicht ausgeführt: Fehler') and erg[3].startswith('nicht ausgeführt: abgebrochen wegen Fehler in Zeile 2'),
           'Zeile 2 Fehler, übrige nicht ausgeführt', str(erg)[:200])
    pruefe(all(erg[n] == 'nicht ausgewählt' for n in zeilen_nr(ausf='Nein')), 'Nicht ausgewählte Zeilen bleiben so markiert')
    pruefe(z['save'] == '0' and z['ordneradd'] == '0', 'Kein Save, kein Ordner angelegt', str(z))
    pruefe((s.zustand(BES), s.ruf('modAttrappe.AtOrdnerListe', BES)) == vorher, 'Gespeicherter Stand und Ordner unverändert')
    pruefe('In Outlook wurde nichts gespeichert' in msg and 'Es wurden keine Ordner angelegt' in msg, 'Meldung sagt es')


def sz_savefehler(s):
    print('\n== 19  Save wirft Fehler (Ordner war schon angelegt)')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    vorher = s.zustand(BES)
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'savefehler', '1')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 400))
    erg = s.plan('ERGEBNIS')
    pruefe(all(erg[n].startswith('nicht ausgeführt: Speichern fehlgeschlagen') for n in zeilen_nr(ausf='Ja')),
           'Zeilen: nicht ausgeführt (Speichern fehlgeschlagen)', str(erg)[:200])
    pruefe(s.zustand(BES) == vorher, 'Gespeicherter Stand der Regeln unverändert')
    pruefe('bleiben bestehen' in msg and 'Automatische Antworten' in msg and s.zaehler()['ordneradd'] == '1',
           'Meldung nennt den schon angelegten Ordner (nicht rückgängig zu machen)')
    pruefe('Regelkonflikt' in msg and 'Regeln und Benachrichtigungen' in msg, 'Meldung nennt den möglichen Konfliktdialog (Befund 6)')


def sz_geaendert(s):
    print('\n== 20  Plan geändert / Outlook geändert / Rückfragen verneint / Empfänger nicht auflösbar')
    nu = zeilen_nr('UMLEITEN_STATT_WEITERLEITEN')[0]
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modUmbau.VorschauLauf')
    s.ausfuehren_setzen(nu, 'Nein')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    pruefe(msg.startswith('Plan oder Einstellungen wurden nach der Vorschau'), 'Geänderter Plan: neue Vorschau verlangt')
    s.ausfuehren_setzen(nu, 'Ja')
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'gesperrt', 'KWAD - Gruppenpostfach')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    pruefe(msg.startswith('Der Stand in Outlook hat sich seit der Vorschau geändert') and 'Zeile %d' % nu in msg,
           'Geänderter Stand in Outlook erkannt', kurz(msg, 200))
    s.ruf('modAttrappe.AtSchalter', 'gesperrt', '')
    for antworten, erwartet in (('N', 'Abgebrochen – nichts geändert. Bitte zuerst'), ('JN', 'Abgebrochen – nichts geändert. Regeln ohne'),
                                ('JJN', 'Abgebrochen – nichts geändert.')):
        s.ruf('modUmbau.VorschauLauf')
        s.ruf('modAttrappe.AtSchalter', 'antworten', antworten)
        msg = s.ruf('modUmbau.AusfuehrenLauf')
        pruefe(msg.startswith(erwartet) and s.zaehler()['save'] == '0' and s.zaehler()['schreib'] == '0',
               'Rückfrage %d verneint: nichts geändert' % len(antworten), msg)
    pruefe(len(s.zeilen('Sicherung', int(s.L['SICH_ERSTE']), 12)) == 0, 'Keine Sicherung ohne Ausführung')
    s.ruf('modAttrappe.AtSchalter', 'gesperrt', 'KWAD - Gruppenpostfach')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(st[nu].startswith('blockiert: Empfänger nicht auflösbar'), 'Nicht auflösbarer Empfänger blockiert Umleiten', st[nu])
    s.ruf('modAttrappe.AtSchalter', 'gesperrt', 'Microsoft Outlook')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    na = plan_nr('AUSNAHMEN_UEBERNEHMEN', 'E - KWAD – Gruppenpostfach')
    pruefe(st[na].startswith('blockiert: Empfänger nicht auflösbar: Microsoft Outlook (EX /o=Attrappe/…/cn=microsoft-outlook, '
                             'Adresstyp 0, SMTP microsoft-outlook@attrappe.invalid)'),
           'Nicht auflösbarer Ausnahme-Absender blockiert, Meldung mit Name, Typ und Adresse', st[na])


def sz_weitere(s):
    print('\n== 21  Weitere Aktionen: ORDNER_ANLEGEN, DEAKTIVIEREN, Platz n, Wörter, Ausnahmen, unbekannt')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.nur([])
    n = len(EXPORT['plan']) + 1
    s.planzeile_setzen(n, aktion='ORDNER_ANLEGEN', ver='\\\\Bestandsuebertragungen@ergo.de\\Archiv\\Testordner\\Unterordner')
    s.planzeile_setzen(n + 1, aktion='DEAKTIVIEREN', regel='Papierakten (keine eAkte)')
    inaktiv = [r['name'] for r in EXPORT['regeln'] if r['pf'] == BES and r['aktiv'] == 'Nein'][0]
    s.planzeile_setzen(n + 2, aktion='DEAKTIVIEREN', regel=inaktiv)
    s.planzeile_setzen(n + 3, aktion='POSITION', regel='KV Solo', neu='Platz 1')
    s.planzeile_setzen(n + 4, aktion='BEDINGUNG_WORT_ERGAENZEN', regel='Papierakten (keine eAkte)',
                       neu='Betreff enthält: „Achtung Papierakte“, "Neu"')
    s.planzeile_setzen(n + 5, aktion='BEDINGUNG_WORT_ERGAENZEN', regel='KV Solo', neu='Mailtext enthält: "x"')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    for k in range(n, n + 6):
        print('    %d  %s' % (k, st[k]))
    pruefe(st[n].startswith('bereit · Ordner wird angelegt: Archiv\\Testordner'), 'Ordner (zwei Ebenen) wird angelegt')
    pruefe(st[n + 1] == 'bereit · deaktivieren' and st[n + 2] == 'schon erledigt', 'Deaktivieren: bereit bzw. schon erledigt')
    pruefe(st[n + 3].startswith('bereit · auf Platz 1'), 'Position Platz 1')
    pruefe(st[n + 4] == 'bereit · Betreff enthält + „Neu“',
           'Wörter: vorhandenes Wort nicht doppelt, neues Wort ergänzt', st[n + 4])
    pruefe(st[n + 5].startswith('blockiert: Bedingung „Mailtext enthält“ ist in der Regel nicht aktiv'),
           'Wörter nur in aktiver Bedingung', st[n + 5])
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 300))
    erg = s.plan('ERGEBNIS')
    pruefe(s.zaehler()['save'] == '0', 'Blockierte Zeile: gar nichts ausgeführt', str(erg)[:200])
    s.ausfuehren_setzen(n + 5, 'Nein')
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    erg = s.plan('ERGEBNIS')
    z = s.zaehler()
    pruefe(erg[n] == erg[n + 1] == erg[n + 3] == erg[n + 4] == 'erledigt (geprüft)' and erg[n + 2] == 'schon erledigt',
           'Ergebnis je Zeile', str({k: erg[k][:40] for k in range(n, n + 5)}))
    pruefe(z['ordneradd'] == '2', 'Zwei Ordner angelegt (Testordner und Unterordner)', str(z))
    zb = s.zustand(BES)
    pruefe(zb[0][2] == 'KV Solo', 'KV Solo steht auf Platz 1')
    pa = s.regel(BES, 'Papierakten (keine eAkte)')
    pruefe(pa[3] == 'Nein' and pa[4].endswith('; Achtung Papierakte; Neu'), 'Regel deaktiviert, Wort hinten angehängt', str(pa[3:5]))
    # Ausnahmen: ausgeschaltete Ausnahme mit anderen Einträgen, Quelle ohne Ausnahmen, unbekannte Aktion
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modAttrappe.AtAusSetzen', BES, 'KV Solo', 2, 'Alt|Unzustellbar', False)
    s.nur([plan_nr('AUSNAHMEN_UEBERNEHMEN', 'KV Solo')])
    s.planzeile_setzen(n, aktion='AUSNAHMEN_UEBERNEHMEN', regel='Papierakten (keine eAkte)', quelle='Papierakten (keine eAkte)')
    s.planzeile_setzen(n + 1, aktion='LOESCHEN', regel='KV Solo')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    na = plan_nr('AUSNAHMEN_UEBERNEHMEN', 'KV Solo')
    for k in (na, n, n + 1):
        print('    %d  %s' % (k, st[k]))
    pruefe(st[na].startswith('blockiert: Ausnahme „Betreff enthält“ ist ausgeschaltet, enthält aber andere Einträge („Alt“)'),
           'Ausgeschaltete Ausnahme mit fremden Einträgen blockiert', st[na])
    pruefe(st[n].startswith('blockiert: Quellregel „Papierakten (keine eAkte)“ hat keine Ausnahmen'), 'Quelle ohne Ausnahmen blockiert')
    pruefe(st[n + 1].startswith('blockiert: Aktion „LOESCHEN“ unbekannt'), 'Unbekannte Aktion (z. B. Löschen) blockiert')


def sz_kopie_outlook(s):
    print('\n== 22  Kopie aus Outlook vorhanden (Fall b): umbenennen statt neu anlegen')
    n1 = plan_nr('KOPIEREN', 'Automatische Antworten 1zu1 aussortieren')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    print('   ', s.ruf('modAttrappe.AtKopieVonOutlook', 'Automatische Antworten 1zu1 aussortieren'))
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe('Kopie aus Outlook' in st[n1], 'Kopie aus Outlook wird umbenannt', st[n1])
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    s.ruf('modUmbau.AusfuehrenLauf')
    erg = s.plan('ERGEBNIS')
    z = s.zaehler()
    pruefe(alle_ok(erg, zeilen_nr(ausf='Ja')) and z['create'] == '1',
           'Alle Zeilen erledigt, nur eine neue Regel (Eskalation)', str(z))
    ist = [r[2] for r in s.zustand(BES)]
    soll = [n for n, a in EXPORT['soll'] if a != 'kopieren, falls benötigt']
    pruefe(ist == soll, 'Reihenfolge = Soll-Reihenfolge', '\n      ist:  %s\n      soll: %s' % (ist, soll))


def sperr_abfang():
    return 'blockiert: Speichern gesperrt – 1 Regel ohne sichtbare Bedingung vor aktiven Regeln (siehe Stand Zielpostfach)'


def sz_abfang(s):
    print('\n== 23  Befund 1: Regel ohne sichtbare Bedingung vor aktiven Regeln sperrt (Stand nach dem Plan)')
    ja = zeilen_nr(ausf='Ja')
    n = len(EXPORT['plan']) + 1
    # a) In Outlook steht die Sammelregel mitten in der Liste
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    print('   ', s.ruf('modAttrappe.AtPlatz', BES, EKWAD, 10))
    reihe = soll_mit_platz(EKWAD, 10)
    erw = abfang_text(reihe, EKWAD)
    msg = s.ruf('modUmbau.RegelnLesenLauf')
    pruefe('2 ohne sichtbare Bedingung, davon vor aktiven Regeln: %s – unplausibel, Speichern gesperrt' % erw in msg
           and 'neue Regel' not in msg, 'Lesen: Meldung nennt die Regel mit dem Namen wie in Outlook', kurz(msg, 400))
    live = {r[2]: r for r in s.zeilen('Live', int(s.L['LIVE_ERSTE']), 14) if r[0] == BES}
    pruefe(live[EKWAD][1] == '10' and live[EKWAD][13].startswith('keine sichtbare Bedingung, verschiebt bzw. stoppt und '
           'steht vor') and 'sperrt das Speichern' in live[EKWAD][13], 'Live: Diagnose nennt die Lage', live[EKWAD][13])
    pruefe(s.status().startswith('Speichern gesperrt – 1 Regel ohne sichtbare Bedingung vor aktiven Regeln: ' + erw),
           'Lesen: Stand gesperrt mit Begründung', '\n      ist:  %s\n      soll: …%s' % (s.status(), erw))
    msg = s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    print('    Meldung:', kurz(msg, 400))
    pruefe(all(st[k] == sperr_abfang() for k in ja), 'Vorschau: alle ausgewählten Zeilen „Speichern gesperrt“',
           str({k: st[k][:60] for k in ja}))
    pruefe(erw in msg and 'Speichern gesperrt' in msg, 'Meldung der Vorschau nennt die Regel und die Sperre')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    pruefe('blockierte Zeile' in msg and s.zaehler()['schreib'] == '0', 'Ausführen verweigert, nichts geschrieben')
    # Lesen mit „Trotz …“ = Ja: Meldung sagt „freigegeben“ statt „Speichern gesperrt“ (Punkt 4)
    s.setze('Umsetzung', s.L['ZELLE_TROTZ'], 'Ja')
    msg = s.ruf('modUmbau.RegelnLesenLauf')
    print('    Lesen mit „Ja“:', kurz(msg, 300))
    pruefe('davon vor aktiven Regeln: %s – unplausibel, freigegeben (Einstellung „Ja“)' % erw in msg
           and 'Speichern gesperrt' not in msg and s.status().startswith('Speichern freigegeben trotz'),
           'Lesen mit „Ja“: Meldung „freigegeben (Einstellung „Ja“)“, nicht „Speichern gesperrt“', kurz(msg, 400))
    s.setze('Umsetzung', s.L['ZELLE_TROTZ'], 'Nein')
    # b) Der Plan setzt die Sammelregel ans Ende: keine Sperre (Stand nach dem Plan zählt), Zeile mit Hinweis
    s.planzeile_setzen(n, aktion='POSITION', regel=EKWAD, neu='nach: KV Solo')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    print('    %d  %s' % (n, st[n]))
    pruefe(all(st[k].startswith('bereit') for k in ja) and st[n] == 'bereit · direkt nach „KV Solo“' + OHNE_HINWEIS,
           'Plan behebt die Lage: Zeilen bereit, Positionszeile mit „Regel ohne sichtbare Bedingung“', st[n])
    pruefe(s.status().startswith('Speichern möglich mit Bestätigung') and s.status().endswith(
           ' · in Outlook steht noch %s – nach dem Plan nicht mehr' % erw), 'Stand: mit Bestätigung, Hinweis auf den '
           'Stand in Outlook', s.status())
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    s.ruf('modUmbau.AusfuehrenLauf')
    erg = s.plan('ERGEBNIS')
    ist = [r[2] for r in s.zustand(BES)]
    pruefe(alle_ok(erg, ja) and erg[n] == ERG_OHNE and ist == [x for x, a in EXPORT['soll'] if a != 'kopieren, falls benötigt'],
           'Ausgeführt: Sammelregel wieder hinter KV Solo, Reihenfolge = Soll', str(erg[n]))
    # c) Eine neue Regel landet hinter der Sammelregel (KOPIEREN ohne Position): Outlook-Stand unauffällig, nach dem Plan
    #    stünde die Sammelregel vor einer aktiven Regel -> gesperrt
    nj = zeilen_nr('KOPIEREN', 'Nein')[0]
    neu_name = [p['regel'] for p in EXPORT['plan'] if p['nr'] == nj][0]
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.nur([nj])
    s.setze('Umsetzung', '%s%d' % (s.spalte('NEU'), s.planzeile(nj)), '')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    reihe = sorted([r for r in EXPORT['regeln'] if r['pf'] == BES], key=lambda r: r['nr']) + \
        [dict(name=neu_name, aktiv='Ja')]
    erw = abfang_text(reihe, EKWAD, neu=(neu_name,))
    print('    %d  %s\n    Stand: %s' % (nj, st[nj], kurz(s.status(), 300)))
    pruefe(st[nj] == sperr_abfang(), 'Neue Regel ans Ende: Zeile gesperrt', st[nj])
    pruefe(s.status().startswith('Speichern gesperrt – 1 Regel ohne sichtbare Bedingung vor aktiven Regeln: ' + erw),
           'Stand nennt die neue Regel hinter der Sammelregel', s.status())
    # d) Freigabe mit „Trotz …“ = Ja: wird ausgeführt, Rückfrage und Abschlussmeldung nennen die Lage
    s.setze('Umsetzung', s.L['ZELLE_TROTZ'], 'Ja')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(st[nj].startswith('bereit') and s.status().startswith('Speichern freigegeben trotz 1 Regel ohne sichtbare '
           'Bedingung vor aktiven Regeln (Einstellung „Ja“): ' + erw), 'Freigabe mit „Ja“', s.status())
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    fr = s.fragen()
    pruefe('Freigegeben trotz Regel ohne sichtbare Bedingung vor aktiven Regeln' in fr[-1][1] and
           s.zaehler()['save'] == '1' and [r[2] for r in s.zustand(BES)][-1] == neu_name,
           'Rückfrage nennt die Freigabe; gespeichert, neue Regel am Ende', kurz(fr[-1][1], 300))
    pruefe(len(fr) == 3, 'Lage seit der Vorschau unverändert: keine zusätzliche Rückfrage vor dem Speichern',
           str([f[0] for f in fr]))
    pruefe('Achtung, ohne sichtbare Bedingung vor aktiven Regeln' in msg, 'Abschlussmeldung nennt die Lage', kurz(msg, 300))
    # e) Plan schiebt die Sammelregel nach vorn bzw. eine aktive Regel dahinter -> gesperrt
    for regel, pos, text in ((EKWAD, 'Platz 1', 'Sammelregel auf Platz 1'),
                             ('KV Solo', 'nach: ' + EKWAD, 'aktive Regel hinter die Sammelregel')):
        s.laden()
        s.ruf('modAttrappe.AtStart', 'export')
        s.nur([])
        s.planzeile_setzen(n, aktion='POSITION', regel=regel, neu=pos)
        s.ruf('modUmbau.VorschauLauf')
        st = s.plan('VORSCHAU')
        pruefe(st[n] == sperr_abfang() and s.status().startswith('Speichern gesperrt – 1 Regel ohne sichtbare Bedingung'),
               'Plan: %s – gesperrt' % text, st[n])
    # f) Ausgeschaltete Regel ohne Bedingung mitten in der Liste, Sammelregel letzte aktive: nur mit Bestätigung
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    test_name = [r['name'] for r in EXPORT['keine'][BES] if r['aktiv'] != 'Ja'][0]
    print('   ', s.ruf('modAttrappe.AtPlatz', BES, test_name, 5))
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(all(st[k].startswith('bereit') for k in ja) and s.status().startswith('Speichern möglich mit Bestätigung'),
           'Ausgeschaltete Regel ohne Bedingung in der Mitte: nur mit Bestätigung', s.status())


def sz_ohne_bed(s):
    print('\n== 24  Befunde 1/5: Schritte an Regeln ohne sichtbare Bedingung – Hinweis in der Vorschau, eigenes Ergebnis')
    n = len(EXPORT['plan']) + 1
    ne = plan_nr('AUSNAHMEN_UEBERNEHMEN', EKWAD)
    nu = zeilen_nr('UMLEITEN_STATT_WEITERLEITEN')[0]
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.nur([ne, nu])
    s.planzeile_setzen(n, aktion='ZIELORDNER', regel=EKWAD, ver='\\\\Bestandsuebertragungen@ergo.de\\Archiv\\KWAD Sammelregel')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    for k in (ne, nu, n):
        print('    %d  %s' % (k, kurz(st[k], 200)))
    pruefe(st[ne].endswith(OHNE_HINWEIS) and st[n].endswith(OHNE_HINWEIS) and OHNE_HINWEIS not in st[nu],
           'Vorschau: Zeilen an der Sammelregel mit „Regel ohne sichtbare Bedingung“, andere nicht')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    s.ruf('modUmbau.AusfuehrenLauf')
    # Rückfrage 3: Zeilen an der Sammelregel tragen den Hinweis auch in der Liste der Änderungen (Punkt 5)
    fr = s.fragen()
    zeilen = {int(x.split()[1]): x for x in fr[2][1].split('\n') if x.startswith('• ')} if len(fr) > 2 else {}
    print('    Rückfrage 3:\n      ' + '\n      '.join(zeilen.values()))
    pruefe(set(zeilen) == {ne, nu, n} and zeilen[ne].endswith(OHNE_HINWEIS) and zeilen[n].endswith(OHNE_HINWEIS)
           and OHNE_HINWEIS not in zeilen[nu], 'Rückfrage 3: Zeilen, die eine Regel ohne sichtbare Bedingung ändern, '
           'sind gekennzeichnet, die übrige nicht', str(zeilen))
    erg = s.plan('ERGEBNIS')
    print('    Ergebnis:', {k: erg[k] for k in (ne, nu, n)})
    pruefe(erg[ne] == erg[n] == ERG_OHNE and erg[nu] == ERG_OK,
           'Ergebnis „erledigt (geprüft, ohne sichtbare Bedingung)“ nur an der Sammelregel', str(erg))
    pruefe('MOVE=\\\\Bestandsuebertragungen@ergo.de\\Archiv\\KWAD Sammelregel' in s.regel(BES, EKWAD)[5],
           'Ziel der Sammelregel umgestellt')


def sz_werte_roh(s):
    print('\n== 25  Befund 2: vorhandene Werte (Leerzeichen am Rand) bleiben unverändert, neue Werte wie in der Quelle')
    nw = zeilen_nr('BEDINGUNG_WORT_ERGAENZEN')[0]
    ne = plan_nr('AUSNAHMEN_UEBERNEHMEN', EKWAD)
    n1 = plan_nr('KOPIEREN', 'Automatische Antworten 1zu1 aussortieren')
    prio = 'Beschwerden/Prio in den Prio-Ordner'
    q1 = 'Automatische Antworten 1zu1 aussortieren'
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modAttrappe.AtBedSetzen', BES, prio, 2, ' Beschwerde |Prio  ')
    s.ruf('modAttrappe.AtAusSetzen', BES, EKWAD, 2, ' Unzustellbar ', True)
    s.ruf('modAttrappe.AtAusSetzen', MAK, EKWAD, 2, 'unzustellbar| Papierakte ', True)
    text13 = woerter(elemente(MAK, q1, 'Bedingung', 'Mailtext enthält')[0])
    s.ruf('modAttrappe.AtBedSetzen', MAK, q1, 13, '|'.join(' %s ' % w for w in text13))
    # Neues Wort im Plan mit Leerzeichen in den Anführungszeichen: wird getrimmt geschrieben (Punkt 3)
    s.setze('Umsetzung', '%s%d' % (s.spalte('NEU'), s.planzeile(nw)), 'Betreff enthält: "  Eskalation ", "PRIO"')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    for k in (nw, ne, n1):
        print('    %d  %s' % (k, kurz(st[k], 200)))
    pruefe(st[nw] == 'bereit · Betreff enthält + „Eskalation“', '„PRIO“ zählt als vorhanden („Prio  “), nur „Eskalation“ '
           'neu – getrimmt angezeigt', st[nw])
    pruefe(st[ne].startswith('bereit · Ausnahmen + Absender ist + „Microsoft Outlook“; Betreff enthält + „Papierakte“'),
           'Ausnahmen: nur „Papierakte“ fehlt („Unzustellbar“ mit Leerzeichen ist vorhanden)', st[ne])
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    erg = s.plan('ERGEBNIS')
    pruefe(alle_ok(erg, zeilen_nr(ausf='Ja')), 'Alle Zeilen erledigt', kurz(msg, 300))
    zb, zm = {r[2]: r for r in s.zustand(BES)}, {r[2]: r for r in s.zustand(MAK)}
    pruefe(zb[prio][4] == '2= Beschwerde ; Prio  ; Eskalation', 'Wörter: vorhandene unverändert (roh), neues Wort aus '
           'dem Plan getrimmt angehängt („  Eskalation “ -> „Eskalation“)', repr(zb[prio][4]))
    pruefe('|2= Unzustellbar ;  Papierakte ' in zb[EKWAD][6] or zb[EKWAD][6].startswith('2= Unzustellbar ;  Papierakte '),
           'Ausnahmen: vorhandene unverändert, neuer Wert wie in der Quelle (mit Leerzeichen)', repr(zb[EKWAD][6]))
    pruefe(zb[q1][4] == zm[q1][4] and '13= ' in zm[q1][4], 'Kopie: Mailtext-Wörter wie in der Quelle (ungetrimmt)',
           '%r / %r' % (zb[q1][4], zm[q1][4]))


def sz_lesefehler(s):
    print('\n== 26  Befund 3: Lesefehler bei Aktiv, Nur lokal, Regeltyp, Reihenfolge -> nicht lesbar')
    faelle = [('Umleitung - Technische Fehler', 'Enabled', 'Aktiv-Status nicht lesbar'),
              ('Mails von BÜ-Bot, Robert (ODPB2D-EXTERN)', 'IsLocalRule', '„Nur lokal“ nicht lesbar'),
              ('eBIS-Kennzeichnung konnte nicht umgesetzt werden', 'RuleType', 'Regeltyp nicht lesbar'),
              ('CCPI mit Anlagen "hell"', 'ExecutionOrder', 'Reihenfolge nicht lesbar')]
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    for regel, eig, _ in faelle:
        print('   ', s.ruf('modAttrappe.AtLeseFehler', BES, regel, eig))
    s.ruf('modUmbau.RegelnLesenLauf')
    live = {r[2]: r for r in s.zeilen('Live', int(s.L['LIVE_ERSTE']), 14) if r[0] == BES}
    for regel, eig, text in faelle:
        pruefe(live[regel][12] == 'Nein' and text in live[regel][13], '%s: nicht lesbar (%s)' % (eig, text), str(live[regel][12:]))
    pruefe(s.status().startswith('Speichern gesperrt – 4 von %d Regeln nicht lesbar' % EXPORT['n'][BES]) and
           'vor aktiven Regeln' not in s.status(), 'Stand: gesperrt, 4 Regeln nicht lesbar (Regel mit unbekanntem Platz '
           'zählt nicht als „hinter der Sammelregel“)', s.status())
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    ja = zeilen_nr(ausf='Ja')
    pruefe(all(st[k].startswith('blockiert: Speichern gesperrt – 4 Regel(n) im Zielpostfach nicht lesbar') for k in ja),
           'Vorschau: Zeilen gesperrt', str({k: st[k][:60] for k in ja}))
    pruefe(s.zaehler()['schreib'] == '0', 'Nichts geschrieben')


def sz_kopie_quelle(s):
    print('\n== 27  Befund 4: Outlook-Kopie (Fall b), Quelle nicht lesbar -> Hinweis statt stillem Verzicht')
    n1 = plan_nr('KOPIEREN', 'Automatische Antworten 1zu1 aussortieren')
    n2 = plan_nr('KOPIEREN', 'Eskalations-GPF in den Prio-Ordner')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    print('   ', s.ruf('modAttrappe.AtKopieVonOutlook', 'Automatische Antworten 1zu1 aussortieren'))
    print('   ', s.ruf('modAttrappe.AtBedFehler', MAK, 'Automatische Antworten 1zu1 aussortieren'))
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    print('    %d  %s' % (n1, st[n1]))
    pruefe(st[n1].startswith('bereit · Kopie aus Outlook („Kopie von Automatische Antworten 1zu1 aussortieren“) wird umbenannt')
           and '· Hinweis: Quellregel nicht lesbar (' in st[n1] and st[n1].endswith('Bedingungen nicht mit der Quellregel verglichen'),
           'Quellregel nicht lesbar: Hinweis in der Vorschauzeile', st[n1])
    s.setze('Umsetzung', s.L['ZELLE_QUELLE'], 'gibtsnicht@ergo.de')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    print('    %d  %s' % (n1, st[n1]))
    pruefe('· Hinweis: Quellpostfach nicht lesbar (Postfach gibtsnicht@ergo.de nicht im Outlook-Profil gefunden' in st[n1]
           and st[n1].endswith('– nicht mit der Quellregel verglichen'), 'Quellpostfach fehlt: Hinweis', st[n1])
    pruefe(st[n2].startswith('blockiert: Quellpostfach nicht lesbar'), 'Neu anlegen ohne Quellpostfach bleibt blockiert', st[n2])
    pruefe(s.zaehler()['schreib'] == '0', 'Nichts geschrieben')


def sz_ziel_alias(s):
    print('\n== 28  Befund 7: Zielpostfach unter anderem Anzeigenamen ist das Quellpostfach der Mappe -> abgelehnt')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modAttrappe.AtSchalter', 'anzeigename', 'Maklerauftraege (Gruppenpostfach)')
    s.setze('Umsetzung', s.L['ZELLE_ZIEL'], 'Maklerauftraege (Gruppenpostfach)')
    s.setze('Umsetzung', s.L['ZELLE_QUELLE'], BES)
    msg = s.ruf('modUmbau.VorschauLauf')
    print('    Meldung:', kurz(msg, 250))
    pruefe(msg.startswith('Vorschau nicht möglich: Als Zielpostfach steht Maklerauftraege (Gruppenpostfach) – das ist '
                          'Maklerauftraege@ergo.de, das Quellpostfach dieser Mappe'), 'Aufgelöster Name erkannt', msg)
    pruefe(s.zelle('Umsetzung', s.L['ZELLE_PRUEFWERT']) == '' and s.ruf('modUmbau.AusfuehrenLauf').startswith('Bitte zuerst')
           and s.zaehler()['schreib'] == '0', 'Kein Prüfwert, Ausführen verweigert, nichts geschrieben')


def sz_ausnahmen_abw(s, antworten):
    print('\n== 29  Befund 6: nach dem Speichern weichen nur Ausnahmen ab (Sammelregel) – Vorgabe Nein (Antworten %s)' % antworten)
    ne = plan_nr('AUSNAHMEN_UEBERNEHMEN', EKWAD)
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modAttrappe.AtSchalter', 'ausverlust', EKWAD)
    s.nur([ne])
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', antworten)
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 500))
    erg = s.plan('ERGEBNIS')
    fr = s.fragen()
    print('    Frage:', fr[-1][0] if fr else '-', '|', kurz(fr[-1][1], 500) if fr else '')
    pruefe(erg[ne].startswith('gespeichert, Prüfung weicht ab') and 'Ausnahmen' in erg[ne], 'Abweichung der Ausnahmen erkannt', erg[ne])
    pruefe(fr and 'Abweichung nur bei Ausnahmen' in fr[-1][0] and '(Vorgabe Nein)' in fr[-1][0], 'Eigene Rückfrage, Vorgabe Nein',
           fr[-1][0] if fr else '')
    t = fr[-1][1] if fr else ''
    pruefe('gilt der alte Zustand weiter' in t and 'frühere Ausnahmen alle da' in t and 'Sammelregel' in t and
           'aller übrigen Mails würde stoppen' in t and 'nicht empfohlen' in t, 'Text: alter Zustand gilt, Sammelregel würde stoppen')
    ek = s.regel(BES, EKWAD)
    if antworten.endswith('J'):
        pruefe(ek[3] == 'Nein' and 'Deaktiviert und gespeichert' in msg and s.zaehler()['save'] == '2',
               'Trotzdem deaktiviert (ausdrücklich Ja)', str(ek[:4]))
    else:
        pruefe(ek[3] == 'Ja' and 'Nicht deaktiviert (nur Ausnahmen weichen ab)' in msg and s.zaehler()['save'] == '1',
               'Nicht deaktiviert: Sammelregel leitet weiter um', str(ek[:4]))


def sz_meldung(s):
    print('\n== 30  Befund 8: Abschlussmeldung passt in eine MsgBox, voller Text im Protokoll')
    lang = '\n'.join('Zeile %d: %s' % (i, 'x' * 60) for i in range(40))
    t = s.ruf('modUmbau.MeldungKurz', lang, '\n\nJetzt deaktivieren?')
    pruefe(len(t) <= 1000 and t.endswith('\n\nJetzt deaktivieren?') and '(gekürzt – vollständig im Blatt Protokoll)' in t,
           'MeldungKurz: höchstens 1000 Zeichen, Frage bleibt stehen (%d Zeichen)' % len(t))
    pruefe(s.ruf('modUmbau.MeldungKurz', 'kurz', '') == 'kurz', 'Kurzer Text bleibt unverändert')
    # langer Abschluss: nicht lesbare Regeln (freigegeben), alle Zeilen mit Erinnerungen, neue Regel verliert die Bedingung
    s.laden()
    s.ruf('modAttrappe.AtStart', 'faelle')
    s.ruf('modAttrappe.AtSchalter', 'verlust', 'Eskalations-GPF in den Prio-Ordner')
    s.setze('Umsetzung', s.L['ZELLE_TROTZ'], 'Ja')
    s.nur([p['nr'] for p in EXPORT['plan']])
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJN')
    s.ruf('modUmbau.Ausfuehren')
    hinweise = [b for b in s.ruf('modAttrappe.AtDialoge').split('----') if b.strip().startswith('HINWEIS [Ausführen]')]
    text = hinweise[-1].strip().partition('\n')[2] if hinweise else ''
    prot = [p for p in s.zeilen('Protokoll', int(s.L['PROT_ERSTE']), 7) if p[4] == 'ERGEBNIS']
    voll = prot[-1][6] if prot else ''
    print('    MsgBox: %d Zeichen, Protokoll: %d Zeichen' % (len(text), len(voll)))
    print('      ' + kurz(text, 1200).replace(' | ', '\n      '))
    pruefe(len(voll) > 1000 and 'Nicht deaktiviert' in voll, 'Voller Text (über 1000 Zeichen) im Protokoll', str(len(voll)))
    pruefe(0 < len(text) <= 1000 and text.endswith('(gekürzt – vollständig im Blatt Protokoll)') and
           text.startswith('Gespeichert in'), 'MsgBox gekürzt mit Hinweis auf das Protokoll', str(len(text)))
    pruefe('Nicht deaktiviert – bitte sofort in Outlook prüfen' in text.split('\n')[2] and
           'Achtung, ohne sichtbare Bedingung vor aktiven Regeln' in text,
           'Wichtiges steht vorn und bleibt in der MsgBox sichtbar (Deaktivierung, Regel vor aktiven Regeln)')


def sz_rueckfrage_lang(s):
    print('\n== 31  Punkt 5: Rückfrage 3 mit langen Hinweisen – über MeldungKurz begrenzt, „Jetzt ausführen?“ bleibt')
    lang = ['Weiterleitung aller Rückläufer der Vermittlerverwaltung Nummer %d an das Gruppenpostfach mit Kennzeichnung '
            'für die Nachbearbeitung im Team Bestandsübertragung' % i for i in (1, 2, 3)]
    ja = zeilen_nr(ausf='Ja')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    for nm in lang:
        s.ruf('modAttrappe.AtRegelDazu', BES, nm, '\\\\Bestandsuebertragungen@ergo.de\\Prio')
        s.ruf('modAttrappe.AtLeseFehler', BES, nm, 'RuleType')
    print('   ', s.ruf('modAttrappe.AtPlatz', BES, EKWAD, 5))
    s.setze('Umsetzung', s.L['ZELLE_TROTZ'], 'Ja')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(all(st[k].startswith('bereit') for k in ja) and s.status().startswith('Speichern freigegeben trotz 3 von'),
           'Freigegeben (3 nicht lesbar, Sammelregel vor aktiven Regeln): Zeilen bereit', s.status()[:200])
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJN')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    fr = s.fragen()
    t = fr[2][1] if len(fr) > 2 else ''
    print('    Rückfrage 3 (%d Zeichen):\n      %s' % (len(t), t.replace('\n', '\n      ')))
    pruefe(0 < len(t) <= 1000 and t.endswith('\n\nJetzt ausführen?'),
           'Rückfrage 3: höchstens 1000 Zeichen, „Jetzt ausführen?“ bleibt am Ende sichtbar', str(len(t)))
    pruefe(t.startswith('%d Änderungen in' % len(ja)) and sum(1 for x in t.split('\n') if x.startswith('• ')) >= 2 and
           'weitere (Spalte Vorschau)' in t and 'davon 3 nicht lesbar' in t and
           'Freigegeben trotz Regel ohne sichtbare Bedingung vor aktiven Regeln' in t and lang[2] not in t,
           'Kopf, erste Zeilen der Liste und beide Warnungen sichtbar (lange Namenslisten gekürzt)')
    prot = [p for p in s.zeilen('Protokoll', int(s.L['PROT_ERSTE']), 7) if p[4] == 'RÜCKFRAGE']
    voll = prot[-1][6] if prot else ''
    pruefe(len(voll) > 1000 and 'Taskleiste' in voll and 'Freigegeben trotz Regel ohne sichtbare Bedingung' in voll
           and all(n in voll for n in lang) and all(('• %d ' % k) in voll for k in ja) and voll.endswith('Jetzt ausführen?'),
           'Voller Text der Rückfrage (alle %d Zeilen, alle Namen) im Protokoll' % len(ja), kurz(voll, 300))
    pruefe(msg.startswith('Abgebrochen – nichts geändert') and s.zaehler()['save'] == '0', 'Verneint: nichts geändert')


def sz_neu_ausverlust(s, antworten):
    print('\n== 32  Punkt 1: neu angelegte Regel verliert beim Speichern ihre Ausnahmen – wie Bedingungs-Abweichung, '
          'Vorgabe Ja (Antworten %s)' % antworten)
    esk = 'Eskalations-GPF in den Prio-Ordner'
    n2 = plan_nr('KOPIEREN', esk)
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    print('   ', s.ruf('modAttrappe.AtAusSetzen', MAK, esk, 2, 'Abwesenheitsnotiz|Out of Office', True))
    s.ruf('modAttrappe.AtSchalter', 'ausverlust', esk)
    s.nur([n2, n2 + 1])
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(st[n2].startswith('bereit · wird neu angelegt'), 'Quellregel mit Ausnahme: Regel wird neu angelegt (Fall c)', st[n2])
    s.ruf('modAttrappe.AtSchalter', 'antworten', antworten)
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 500))
    erg = s.plan('ERGEBNIS')
    nach = s.fragen()[3:]
    for f in nach:
        print('    Frage:', f[0], '|', kurz(f[1], 400))
    pruefe(erg[n2].startswith('gespeichert, Prüfung weicht ab') and 'Ausnahmen' in erg[n2],
           'Abweichung der Ausnahmen an der neuen Regel erkannt', erg[n2])
    pruefe(len(nach) == 1 and 'Abweichung nach dem Speichern' in nach[0][0] and '(Vorgabe Ja)' in nach[0][0],
           'Eine Rückfrage wie bei abweichender Bedingung, Vorgabe Ja (nicht „nur Ausnahmen“ mit Vorgabe Nein)',
           str([f[0] for f in nach]))
    t = nach[0][1] if nach else ''
    pruefe('„%s“ (neu angelegte Regel greift breiter als die Vorlage: Ausnahmen weichen ab)' % esk in t and
           'frühere Ausnahmen' not in t + msg and 'gilt der alte Zustand' not in t + msg,
           'Eigener Text „neu angelegte Regel greift breiter als die Vorlage“, nicht „frühere Ausnahmen alle da“',
           kurz(t, 400))
    r = s.regel(BES, esk)
    if antworten.endswith('J'):
        pruefe(r[3] == 'Nein' and 'Deaktiviert und gespeichert' in msg and s.zaehler()['save'] == '2',
               'Angebot angenommen: neue Regel deaktiviert und gespeichert', str(r[:4]))
    else:
        pruefe(r[3] == 'Ja' and 'Nicht deaktiviert – bitte sofort in Outlook prüfen' in msg and s.zaehler()['save'] == '1',
               'Angebot abgelehnt: deutlicher Hinweis, Regel bleibt aktiv', kurz(msg, 300))


def sz_lage_neu(s):
    print('\n== 33  Punkt 2: Lage ändert sich zwischen Vorschau und Speichern (in Outlook während der Rückfragen)')
    ja = zeilen_nr(ausf='Ja')
    platz = '3|platz|%s|10' % EKWAD
    abfang = '1 Regel ohne sichtbare Bedingung vor aktiven Regeln'
    # a) „Trotz …“ = Nein: die zweite Sperrprüfung sperrt, Stand Zielpostfach wird neu gesetzt
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modUmbau.VorschauLauf')
    vorher = s.status()
    s.ruf('modAttrappe.AtSchalter', 'beifrage', platz)
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    erg = s.plan('ERGEBNIS')
    z = s.zaehler()
    print('    Ausführen:', kurz(msg, 300))
    print('    Stand:', kurz(s.status(), 300))
    pruefe(vorher.startswith('Speichern möglich mit Bestätigung') and 'AENDERUNG' in s.ruf('modAttrappe.AtDialoge')
           and len(s.fragen()) == 3, 'Vorschau unauffällig; während Rückfrage 3 Sammelregel in Outlook auf Platz 10; '
           'keine weitere Rückfrage', vorher)
    pruefe(msg.startswith('Nicht ausgeführt: Speichern gesperrt (Lage seit der Vorschau geändert) – %s: „%s“ vor '
                          % (abfang, EKWAD)) and z['save'] == '0' and z['ordneradd'] == '0',
           'Zweite Sperrprüfung sperrt: kein Speichern, kein Ordner', kurz(msg, 300))
    pruefe(all(erg[k].startswith('nicht ausgeführt: Speichern gesperrt (Lage seit der Vorschau geändert)') for k in ja),
           'Alle Zeilen „nicht ausgeführt: Speichern gesperrt …“', str({k: erg[k][:60] for k in ja}))
    pruefe(s.status().startswith('Speichern gesperrt – %s: „%s“ vor ' % (abfang, EKWAD)),
           'Stand Zielpostfach neu gesetzt (gesperrt, mit Begründung)', s.status())
    prot = s.zeilen('Protokoll', int(s.L['PROT_ERSTE']), 7)
    pruefe(any(p[4] == 'STAND' and 'seit der Vorschau geändert' in p[6] for p in prot), 'Protokoll vermerkt den neuen Stand')
    # b) „Trotz …“ = Ja: eigene Rückfrage mit der neuen Lage (Vorgabe Nein); verneint -> nichts gespeichert
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.setze('Umsetzung', s.L['ZELLE_TROTZ'], 'Ja')
    s.ruf('modUmbau.VorschauLauf')
    vorher = s.status()
    s.ruf('modAttrappe.AtSchalter', 'beifrage', platz)
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJN')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    fr = s.fragen()
    z = s.zaehler()
    t = fr[3][1] if len(fr) > 3 else ''
    print('    Rückfrage 4 (%s, %d Zeichen):\n      %s' % (fr[3][0] if len(fr) > 3 else '-', len(t), t.replace('\n', '\n      ')))
    pruefe(len(fr) == 4 and 'Lage seit der Vorschau geändert' in fr[3][0] and '(Vorgabe Nein)' in fr[3][0],
           'Eigene Rückfrage vor dem Speichern, Vorgabe Nein', str([f[0] for f in fr]))
    pruefe(('• %s: „%s“ vor ' % (abfang, EKWAD)) in t and 'In der Vorschau: nichts davon' in t and len(t) <= 1000 and
           t.endswith('Trotzdem jetzt speichern? (sonst „Vorschau“ erneut starten)'),
           'Rückfrage nennt die neue Lage und die der Vorschau, Frage am Ende')
    pruefe(msg.startswith('Nicht ausgeführt: Abgebrochen vor dem Speichern – die Lage hat sich seit der Vorschau geändert')
           and z['save'] == '0' and z['ordneradd'] == '0', 'Verneint: nichts gespeichert, kein Ordner', kurz(msg, 300))
    pruefe(vorher.startswith('Speichern möglich mit Bestätigung') and s.status().startswith(
           'Speichern freigegeben trotz %s (Einstellung „Ja“): „%s“ vor ' % (abfang, EKWAD)),
           'Stand Zielpostfach neu gesetzt (freigegeben, neue Lage)', s.status())
    # c) dasselbe, Rückfrage bejaht -> gespeichert, Abschlussmeldung nennt die Lage
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.setze('Umsetzung', s.L['ZELLE_TROTZ'], 'Ja')
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'beifrage', platz)
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    fr = s.fragen()
    erg = s.plan('ERGEBNIS')
    prot = s.zeilen('Protokoll', int(s.L['PROT_ERSTE']), 7)
    pruefe(len(fr) == 4 and s.zaehler()['save'] == '1' and alle_ok(erg, ja) and
           'Achtung, ohne sichtbare Bedingung vor aktiven Regeln' in msg and
           any(p[4] == 'RÜCKFRAGE' and 'Speichern bestätigt' in p[6] for p in prot),
           'Bejaht: gespeichert, Zeilen erledigt, Abschlussmeldung nennt die Lage, Protokoll die Bestätigung', kurz(msg, 300))
    # d) Regel wird nach der Vorschau nicht lesbar („Trotz …“ = Nein): kein Schritt mehr in Outlook, gesperrt
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'beifrage', '3|bedfehler|PVB, Bot 1 (PVBHH-EXTERN)|')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    z = s.zaehler()
    print('    Ausführen:', kurz(msg, 300))
    pruefe(msg.startswith('Nicht ausgeführt: Speichern gesperrt (Lage seit der Vorschau geändert) – 1 Regel nicht lesbar: '
                          '„PVB, Bot 1 (PVBHH-EXTERN)“') and z['save'] == '0' and z['schreib'] == '0',
           'Nicht lesbar geworden: gesperrt, kein Schritt in Outlook ausgeführt (0 Schreibzugriffe)', str(z))
    pruefe(s.status().startswith('Speichern gesperrt – 1 von %d Regeln nicht lesbar: „PVB, Bot 1 (PVBHH-EXTERN)“'
                                 % EXPORT['n'][BES]), 'Stand Zielpostfach neu gesetzt (nicht lesbar)', s.status())


# ------------------------------------------------------------------ Empfaenger-Kaskade (Plan 2.2)
# Befund aus echtem Outlook (Vorschau beim Nutzer): von 36 Absendern der KV-Solo-Ausnahme waren 10 „nicht auflösbar“
# (acht VL-Verteiler, „KBI VH Muenchen - Gruppenpostfach“, „Microsoft Outlook“) - EmpfaengerAdresse fiel ohne
# ExchangeUser/-DistributionList auf den Anzeigenamen zurueck. Die Attrappe bildet diese Eintraege nach: „pa“ = SMTP
# nur ueber PropertyAccessor (PR_SMTP_ADDRESS), Name nicht aufloesbar; „dn“ = nur Exchange-DN, nur per DN aufloesbar;
# „tot“ = ueber nichts aufloesbar.
VL_PA = ['VL KBIDMA - Alle Mitarbeiter', 'VL KBIAB - Alle Mitarbeiter', 'VL KBIBHH - Alle Mitarbeiter',
         'VL KBICD - Alle Mitarbeiter', 'VL KBIEM - Alle Mitarbeiter', 'VL KBIFM - Alle Mitarbeiter',
         'VL FMDD - Alle Mitarbeiter', 'VL FMEB - Alle Mitarbeiter']
DN_NUR = 'KBI VH Muenchen - Gruppenpostfach'
MSO = 'Microsoft Outlook'
ESK_ABS = 'Eskalation Strategische Partner Bestandsuebertragu - Gruppenpostfach'
UEBER = ' · übersprungen (nicht auflösbar, Spalte L): „Microsoft Outlook“'


def arten(s, tot):
    for n in VL_PA:
        s.ruf('modAttrappe.AtVzArt', n, 'pa')
    print('   ', s.ruf('modAttrappe.AtVzArt', DN_NUR, 'dn'))
    if tot:
        print('   ', s.ruf('modAttrappe.AtVzArt', MSO, 'tot'))


def ausnahme_namen(regel, typ='1'):
    """Namen einer Ausnahme im gespeicherten Stand (Feld Ausnahmen: „1=a; b|2=x“)."""
    for teil in (regel[6] or '').split('|'):
        if teil.startswith(typ + '='):
            return [x.strip() for x in teil[len(typ) + 1:].split(';') if x.strip()]
    return []


def protokoll(s):
    return s.zeilen('Protokoll', int(s.L['PROT_ERSTE']), 7)


def sz_aufloesen(s):
    print('\n== 38  Empfänger-Kaskade: PR_SMTP_ADDRESS (dynamische Verteiler) und Exchange-DN statt Anzeigename')
    na = plan_nr('AUSNAHMEN_UEBERNEHMEN', 'KV Solo')
    nu = zeilen_nr('UMLEITEN_STATT_WEITERLEITEN')[0]
    n6 = plan_nr('KOPIEREN', 'Eskalations-GPF in den Prio-Ordner')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    arten(s, tot=False)
    print('   ', s.ruf('modAttrappe.AtVzArt', 'KWAD - Gruppenpostfach', 'dn'))
    print('   ', s.ruf('modAttrappe.AtVzArt', ESK_ABS, 'pa'))
    makler_vorher = s.zustand(MAK)
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    zeige_plan(s, 'VORSCHAU')
    pruefe(s.zaehler()['schreib'] == '0', 'Vorschau schreibt nichts (CreateRecipient ist flüchtig)', str(s.zaehler()))
    kbi = liste_namen(elemente(MAK, 'KV Solo', 'Ausnahme', 'Absender ist')[0])
    erw = 'bereit · Ausnahmen + Absender ist + %s; Betreff enthält + „Unzustellbar“' % anzeige(kbi)
    pruefe(st[na] == erw, 'KV Solo: alle %d Absender auflösbar (8 VL über PR_SMTP_ADDRESS, %s über Exchange-DN)'
           % (len(kbi), DN_NUR), '\n      ist:  %s\n      soll: %s' % (kurz(st[na], 300), erw))
    pruefe(st[nu] == 'bereit · umleiten an KWAD - Gruppenpostfach (Weiterleiten aus)',
           'Umleiten: Empfänger nur mit Exchange-DN auflösbar', st[nu])
    pruefe(st[n6].startswith('bereit · wird neu angelegt'), 'KOPIEREN: Absender nur mit PR_SMTP_ADDRESS auflösbar', st[n6])
    ja = zeilen_nr(ausf='Ja')
    pruefe(all(st[n].startswith('bereit') for n in ja), 'Alle ausgewählten Zeilen bereit', str({n: st[n][:60] for n in ja}))
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 300))
    erg = s.plan('ERGEBNIS')
    pruefe(alle_ok(erg, ja), 'Alle Zeilen erledigt (geprüft) – Nachprüfung meldet nichts fälschlich als fehlend',
           str({n: erg[n][:90] for n in ja if erg[n] != erg_ok(n)}))
    kv, kvm = s.regel(BES, 'KV Solo'), s.regel(MAK, 'KV Solo')
    pruefe(kv[6] == kvm[6], 'KV Solo: Ausnahmen gleich Makler (alle 36 Absender, Betreff)',
           '\n      ist:  %s\n      soll: %s' % (kurz(kv[6], 200), kurz(kvm[6], 200)))
    pruefe('REDIR=KWAD - Gruppenpostfach' in kv[5] and 'FWD' not in kv[5], 'KV Solo: Umleiten an KWAD (per DN eingetragen)', kv[5])
    esk, eskm = s.regel(BES, 'Eskalations-GPF in den Prio-Ordner'), s.regel(MAK, 'Eskalations-GPF in den Prio-Ordner')
    pruefe(esk[4] == eskm[4], 'Neue Regel Eskalation: Absender gleich der Quelle', '%s / %s' % (esk[4], eskm[4]))
    prot = protokoll(s)
    dn_zeile = [p[6] for p in prot if p[6].startswith('Empfänger „/o=Attrappe/') and
                ('(Exchange-DN) eingetragen für ' + DN_NUR) in p[6]]
    pruefe(dn_zeile and '(EX /o=Attrappe/…/cn=kbi-vh-muenchen-gruppenpostfach, Adresstyp 0, keine SMTP-Adresse)' in dn_zeile[0],
           'Protokoll: %s über den Exchange-DN eingetragen (mit Typ/Adresse)' % DN_NUR, str(dn_zeile)[:300])
    pruefe(s.zustand(MAK) == makler_vorher, 'Quellpostfach unverändert')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(all(st[n].startswith('schon erledigt') for n in ja), 'Zweiter Lauf: alles schon erledigt (gleiche Schlüssel für '
           'Quelle und Ziel)', str({n: st[n][:80] for n in ja if not st[n].startswith('schon erledigt')}))


def sz_ziel_dn(s):
    print('\n== 39  Im Ziel schon vorhandener Absender, der nur als Exchange-DN lesbar ist: nicht doppelt eintragen')
    na = plan_nr('AUSNAHMEN_UEBERNEHMEN', 'KV Solo')
    vorh = 'KBI Sach Berlin - Gruppenpostfach'
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    print('   ', s.ruf('modAttrappe.AtAusEmpfDn', BES, 'KV Solo', 1, vorh))
    s.nur([na])
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    kbi = liste_namen(elemente(MAK, 'KV Solo', 'Ausnahme', 'Absender ist')[0])
    erw = 'bereit · Ausnahmen + Absender ist + %s; Betreff enthält + „Unzustellbar“' % anzeige([n for n in kbi if n != vorh])
    pruefe(st[na] == erw, 'Vorschau: %d neue Absender – der vorhandene (nur DN lesbar) zählt als vorhanden' % (len(kbi) - 1),
           '\n      ist:  %s\n      soll: %s' % (kurz(st[na], 300), erw))
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 200))
    erg = s.plan('ERGEBNIS')
    pruefe(erg[na] == ERG_OK, 'Ergebnis erledigt (geprüft)', erg[na])
    namen = ausnahme_namen(s.regel(BES, 'KV Solo'))
    pruefe(namen.count(vorh) == 1 and sorted(namen) == sorted(kbi), 'Ausnahme: jeder Absender genau einmal, %s nicht doppelt'
           % vorh, 'Anzahl %d, %s %d-mal' % (len(namen), vorh, namen.count(vorh)))
    s.ruf('modUmbau.VorschauLauf')
    pruefe(s.plan('VORSCHAU')[na] == 'schon erledigt', 'Zweiter Lauf: schon erledigt', s.plan('VORSCHAU')[na])


def sz_ueberspringen(s):
    print('\n== 40  Nicht auflösbarer Absender („Microsoft Outlook“): blockiert mit Typ/Adresse; Spalte L überspringt ihn')
    na = plan_nr('AUSNAHMEN_UEBERNEHMEN', 'KV Solo')
    ne = plan_nr('AUSNAHMEN_UEBERNEHMEN', EKWAD)
    nu = zeilen_nr('UMLEITEN_STATT_WEITERLEITEN')[0]
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    arten(s, tot=True)
    vorher = s.zustand(BES)
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    print('    %d  %s\n    %d  %s' % (na, kurz(st[na], 300), ne, kurz(st[ne], 300)))
    blk = ('blockiert: Empfänger nicht auflösbar: Microsoft Outlook (EX /o=Attrappe/…/cn=microsoft-outlook, Adresstyp 40, '
           'keine SMTP-Adresse) – einzelne Absender lassen sich über Spalte L überspringen')
    pruefe(st[na].startswith(blk), 'KV Solo: nur „Microsoft Outlook“ nicht auflösbar, Meldung mit Typ und gekürzter Adresse',
           '\n      ist:  %s\n      soll: %s…' % (st[na], blk))
    pruefe(not any(n in st[na] for n in VL_PA + [DN_NUR]), 'VL-Verteiler und %s nicht mehr als nicht auflösbar gemeldet' % DN_NUR)
    pruefe(st[ne].startswith(blk), 'E - KWAD: „Microsoft Outlook“ blockiert ebenso', st[ne])
    pruefe(s.zaehler()['schreib'] == '0', 'Vorschau schreibt nichts')
    # Spalte L nur bei AUSNAHMEN_UEBERNEHMEN
    zelle = lambda n: '%s%d' % (s.spalte('UEBERSPR'), s.planzeile(n))
    s.setze('Umsetzung', zelle(nu), MSO)
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(st[nu].startswith('blockiert: Spalte L (nicht auflösbare Absender überspringen) gilt nur für AUSNAHMEN_UEBERNEHMEN'),
           'Spalte L bei UMLEITEN: blockiert', st[nu])
    s.setze('Umsetzung', zelle(nu), '')
    # Spalte L: „Microsoft Outlook“ (Zeile 10 mit einem Eintrag, der nichts trifft; Zeile 11 klein geschrieben)
    s.setze('Umsetzung', zelle(na), 'Microsoft Outlook; Gibtsnicht Absender')
    s.setze('Umsetzung', zelle(ne), 'microsoft outlook')
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    kbi = liste_namen(elemente(MAK, 'KV Solo', 'Ausnahme', 'Absender ist')[0])
    ohne_mso = [n for n in kbi if n != MSO]
    hinweis = ' · Hinweis: Spalte L nennt „Gibtsnicht Absender“ – kein nicht auflösbarer neuer Absender, nichts übersprungen'
    erw = 'bereit · Ausnahmen + Absender ist + %s; Betreff enthält + „Unzustellbar“%s%s' % (anzeige(ohne_mso), UEBER, hinweis)
    pruefe(st[na] == erw, 'KV Solo mit Spalte L: bereit, „Microsoft Outlook“ übersprungen, Hinweis auf nicht treffenden Eintrag',
           '\n      ist:  %s\n      soll: %s' % (st[na], erw))
    worte = woerter(elemente(MAK, EKWAD, 'Ausnahme', 'Betreff enthält')[0])
    erw = 'bereit · Ausnahmen + Betreff enthält + %s%s%s' % (anzeige(worte), UEBER, OHNE_HINWEIS)
    pruefe(st[ne] == erw, 'E - KWAD mit Spalte L: nur Betreff-Ausnahmen, „Absender ist“ bleibt aus',
           '\n      ist:  %s\n      soll: %s' % (st[ne], erw))
    # Rueckfrage „Absender überspringen“ verneint: nichts geaendert
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJN')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    fr = s.fragen()
    pruefe(msg.startswith('Abgebrochen – nichts geändert. Übersprungene Absender nicht bestätigt.')
           and s.zaehler()['save'] == '0' and s.zaehler()['schreib'] == '0' and s.zustand(BES) == vorher,
           'Rückfrage „Absender überspringen“ verneint: nichts geändert', msg)
    pruefe(fr and fr[-1][0].startswith('FRAGE [Absender überspringen] (Vorgabe Nein)')
           and '• %d „KV Solo“: „Microsoft Outlook“' % na in fr[-1][1] and '• %d „%s“: „Microsoft Outlook“' % (ne, EKWAD) in fr[-1][1]
           and fr[-1][1].endswith('So übernehmen (ohne diese Absender)?'),
           'Eigene Rückfrage mit Vorgabe Nein, je Zeile die übersprungenen Absender', kurz(fr[-1][0] + ' ' + fr[-1][1], 400) if fr else '')
    # bestaetigt: ausfuehren
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 300))
    erg = s.plan('ERGEBNIS')
    zeige_plan(s, 'ERGEBNIS')
    ja = zeilen_nr(ausf='Ja')
    nach = ' · übersprungen (nicht auflösbar): „Microsoft Outlook“'
    pruefe(erg[na] == ERG_OK + nach and erg[ne] == ERG_OHNE + nach, 'Ergebnis nennt den übersprungenen Absender',
           '%s | %s' % (erg[na], erg[ne]))
    pruefe(all(erg[n] == erg_ok(n) for n in ja if n not in (na, ne)), 'Übrige Zeilen erledigt (geprüft)')
    namen = ausnahme_namen(s.regel(BES, 'KV Solo'))
    pruefe(sorted(namen) == sorted(ohne_mso) and ausnahme_namen(s.regel(BES, 'KV Solo'), '2') == ['Unzustellbar'],
           'KV Solo: 35 Absender (ohne „Microsoft Outlook“) und Betreff übernommen', '%d: %s' % (len(namen), kurz(str(namen), 200)))
    ek = s.regel(BES, EKWAD)
    pruefe(not ausnahme_namen(ek) and ausnahme_namen(ek, '2') == worte and not ek[6].startswith('1'),
           'E - KWAD: nur Betreff-Ausnahmen, keine (leere) Absender-Ausnahme', ek[6])
    prot = protokoll(s)
    pruefe(any(p[6].startswith('Nicht übernommen (nicht auflösbar, Spalte L): „Microsoft Outlook“') and p[3] == str(na) for p in prot)
           and any(p[6].startswith('Nicht übernommen (nicht auflösbar, Spalte L): „Microsoft Outlook“ – Ausnahme ohne '
                                   'übernehmbare Absender bleibt aus') and p[3] == str(ne) for p in prot),
           'Protokoll: je Zeile „Nicht übernommen …“', str([p[3] + ' ' + p[6][:80] for p in prot if 'Nicht übernommen' in p[6]]))
    pruefe(any(p[4] == 'RÜCKFRAGE' and 'NICHT in die Ausnahmen übernommen' in p[6] and '„Microsoft Outlook“' in p[6]
               for p in prot), 'Protokoll: Rückfrage „überspringen“ mit dem Absender')
    fr = s.fragen()
    pruefe([f[0].split(']')[0] for f in fr[-4:]] == ['FRAGE [Sicherung vorhanden?', 'FRAGE [Regeln ohne Bedingung',
                                                       'FRAGE [Absender überspringen', 'FRAGE [Regeln ändern'],
           'Vier Rückfragen: Export, ohne Bedingung, überspringen, Änderungen', str([f[0] for f in fr[-4:]]))
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe(st[na] == 'schon erledigt' + UEBER + hinweis and st[ne] == 'schon erledigt' + UEBER,
           'Zweiter Lauf: schon erledigt, übersprungener Absender genannt', '%s | %s' % (st[na], st[ne]))
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    pruefe(msg.startswith('Nichts zu tun'), 'Zweites Ausführen: nichts zu tun', msg)


# ------------------------------------------------------------------ Befund Plan 2.2: neue Regel, Zielordner fehlt (Plan 2.3)
OL_UNGUELTIG = 'Mindestens eine Regel kann aufgrund von ungültigen Aktionen oder Bedingungen nicht gespeichert werden.'
AA_1ZU1 = 'Automatische Antworten 1zu1 aussortieren'


def sz_einschalten(s):
    print('\n== 41  Befund Plan 2.2, Zeile 3: neue Regel verschiebt in einen Ordner, der erst angelegt wird – Outlook '
          'prüft beim Einschalten (Rule.Enabled) und bei Rules.Save')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    pruefe(AA_NEU not in s.ruf('modAttrappe.AtOrdnerListe', BES), 'Vorher: Ordner Archiv\\Automatische Antworten fehlt')
    vorher = s.zustand(BES)
    n1, n3 = plan_nr('ZIELORDNER', 'Kopie von Automatische Antworten aussortieren'), plan_nr('KOPIEREN', AA_1ZU1)
    # Zeilen 1-4: Ziel, Umbenennen, neue Regel, deren Position (ohne Position stuende die neue Regel hinter einer Regel
    # ohne sichtbare Bedingung - Sperre)
    wahl = [n1, plan_nr('UMBENENNEN', 'Kopie von Automatische Antworten aussortieren'), n3, plan_nr('POSITION', AA_1ZU1)]
    s.nur(wahl)
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    pruefe('Ordner wird angelegt: Archiv\\Automatische Antworten' in st[n1] and st[n3].startswith('bereit · wird neu angelegt'),
           'Vorschau: Zeile %d legt den Ordner an, Zeile %d legt die Regel neu an' % (n1, n3), '%s | %s' % (st[n1], st[n3]))
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 300))
    erg = s.plan('ERGEBNIS')
    z = s.zaehler()
    pruefe(erg[n3] == ERG_OK and OL_UNGUELTIG not in erg[n3],
           'Zeile %d erledigt (vor Plan 2.3: „Fehler: %s“)' % (n3, OL_UNGUELTIG), erg[n3])
    pruefe(alle_ok(erg, wahl), 'Zeilen %s erledigt (Zeile %d: bestehende Regel bekommt den neuen Ordner)' % (wahl, n1), str(erg))
    pruefe(z['save'] == '1' and z['create'] == '1' and z['ordneradd'] == '1', 'Ein Save, eine neue Regel, ein Ordner', str(z))
    neu = s.regel(BES, AA_1ZU1)
    pruefe(neu is not None and neu[3] == 'Ja' and neu[5] == 'MOVE=' + AA_NEU + '|HALT',
           'Gespeichert: neue Regel aktiv (wie die Quelle), verschiebt nach Archiv\\Automatische Antworten + Stopp', str(neu))
    alt = s.regel(BES, 'Automatische Antworten aussortieren')
    pruefe(alt is not None and alt[5].startswith('MOVE=' + AA_NEU),
           'Gespeichert: bestehende Regel verschiebt nach dem neuen Ordner', str(alt))
    pruefe('Geprüft: 4 erledigt, 0 mit Abweichung' in msg and 'Abweichungen' not in msg,
           'Nachprüfung erwartet den Endzustand (aktiv, Ordner gesetzt): keine Abweichung', kurz(msg, 300))
    prot = [p for p in protokoll(s) if p[3] == str(n3)]
    reihe = [p[6] for p in prot]
    i_aus = [i for i, t in enumerate(reihe) if t.startswith('Regel bleibt ausgeschaltet, bis der Zielordner')]
    i_akt = [i for i, t in enumerate(reihe) if t.startswith('Zielordner zugewiesen und Aktion eingeschaltet: ' + AA_NEU)]
    i_ein = [i for i, t in enumerate(reihe) if t == 'Regel „%s“ eingeschaltet (wie die Quelle)' % AA_1ZU1]
    pruefe(i_aus and i_akt and i_ein and i_aus[0] < i_akt[0] < i_ein[0],
           'Protokoll Zeile %d: erst aus, dann Ordner zugewiesen und Aktion an, dann Regel an' % n3, str(reihe))
    log = s.ruf('modAttrappe.AtSchreibLog').split('\n')
    i_add = [i for i, t in enumerate(log) if t.startswith('Folders.Add')]
    i_on = [i for i, t in enumerate(log) if t == 'Rule.Enabled %s = Ja' % AA_1ZU1]
    i_save = [i for i, t in enumerate(log) if t == 'Rules.Save']
    pruefe(len(i_on) == 1 and i_add and i_save and i_add[-1] < i_on[0] < i_save[0],
           'Outlook-Zugriffe: Rule.Enabled = Ja genau einmal, nach Folders.Add und vor Rules.Save',
           str([t for t in log if t.startswith(('Folders.Add', 'Rule.Enabled', 'Rules.Save', 'Action(1)'))]))

    # Outlook lehnt das spaete Einschalten ab: Fehler gehoert zu Zeile 3, nichts gespeichert
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.nur(wahl)
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'einschaltfehler', AA_1ZU1)
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    print('    Ausführen (Einschalten scheitert):', kurz(msg, 300))
    erg = s.plan('ERGEBNIS')
    z = s.zaehler()
    soll3 = 'nicht ausgeführt: Fehler beim Einschalten der Regel „%s“ nach dem Zuweisen des Zielordners: %s' % (AA_1ZU1, OL_UNGUELTIG)
    pruefe(erg[n3] == soll3, 'Spätes Einschalten scheitert: Fehler steht bei Zeile %d mit Outlooks Meldung' % n3,
           '\n      ist:  %s\n      soll: %s' % (erg[n3], soll3))
    pruefe(all(erg[n] == 'nicht ausgeführt: abgebrochen wegen Fehler in Zeile %d, nichts gespeichert' % n3
               for n in wahl if n != n3), 'Übrige Zeilen: abgebrochen wegen Fehler in Zeile %d' % n3, str(erg))
    pruefe(z['save'] == '0' and s.zustand(BES) == vorher, 'Kein Save, gespeicherter Stand unverändert', str(z))
    pruefe('In Outlook wurde nichts gespeichert' in msg and 'bleiben bestehen' in msg and 'Automatische Antworten' in msg,
           'Meldung: nichts gespeichert, schon angelegter Ordner genannt', kurz(msg, 300))
    pruefe(any(p[3] == str(n3) and p[4] == 'KOPIEREN' and p[6].startswith('ABBRUCH: Fehler beim Einschalten')
               for p in protokoll(s)), 'Protokoll: ABBRUCH mit Zeile %d' % n3)

    # Zuweisen des vorgemerkten Ordners scheitert: Fehler gehoert zur vormerkenden Zeile (hier Zeile 1)
    s.laden()
    s.ruf('modAttrappe.AtStart', 'export')
    s.nur(wahl)
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'zuweisfehler', '1')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    msg = s.ruf('modUmbau.AusfuehrenLauf')
    erg = s.plan('ERGEBNIS')
    pruefe(erg[n1].startswith('nicht ausgeführt: Fehler beim Zuweisen des Zielordners ' + AA_NEU) and
           erg[n3] == 'nicht ausgeführt: abgebrochen wegen Fehler in Zeile %d, nichts gespeichert' % n1 and
           s.zaehler()['save'] == '0', 'Zuweisen scheitert: Fehler bei Zeile %d (vorgemerkt), Zeile %d abgebrochen, kein Save'
           % (n1, n3), '%s | %s' % (erg[n1], erg[n3]))


# ------------------------------------------------------------------ Ordner-Umstellung (Plan 3.0, Blatt Ordner)
def oroot(pf):
    return '\\\\' + pf


def ovoll(pf, rel):
    """Voller Pfad wie Outlooks FolderPath (\\\\postfach\\a\\b, „/“ im Namen als %2F)."""
    return oroot(pf) + '\\' + rel.replace('/', '%2F') if rel else oroot(pf)


def oschritte(zeilen=None):
    """Umzuege laut Plan (alter voller Pfad, neuer voller Pfad) in Planreihenfolge; zeilen: nur diese Nummern."""
    out = []
    for p in EXPORT['oplan']:
        if p['aktion'] != 'ORDNER_ANLEGEN' and (zeilen is None or p['nr'] in zeilen):
            out.append((ovoll(p['pf'], p['heute']), ovoll(p['pf'], p['neu'])))
    return out


def oabbilden(pfad, schritte):
    for alt, neu in schritte:
        if pfad.lower() == alt.lower():
            pfad = neu
        elif pfad.lower().startswith(alt.lower() + '\\'):
            pfad = neu + pfad[len(alt):]
    return pfad


def obaum_soll(vorher, pf, schritte, angelegt):
    """Ordnerliste eines Postfachs nach den Schritten (Praefix ersetzen) plus angelegte Ordner."""
    return sorted(set([oabbilden(x, schritte) for x in vorher] + [ovoll(pf, a) for a in angelegt]), key=str.lower)


def ozustand_soll(zustand, schritte):
    """Gespeicherter Regelstand mit umgezogenen Zielen (MOVE=/COPY= in Spalte Aktionen)."""
    out = []
    for r in zustand:
        teile = []
        for t in r[5].split('|'):
            if t.startswith(('MOVE=', 'COPY=')):
                t = t[:5] + oabbilden(t[5:], schritte)
            teile.append(t)
        out.append(r[:5] + ['|'.join(teile)] + r[6:])
    return out


def ozielwechsel(zustand, schritte):
    """Anzahl der Verschieben-/Kopieren-Ziele, die sich durch die Schritte aendern."""
    n = 0
    for r in zustand:
        for t in r[5].split('|'):
            if t.startswith(('MOVE=', 'COPY=')) and len(t) > 5 and oabbilden(t[5:], schritte) != t[5:]:
                n += 1
    return n


def onr(pf, aktion, heute='', neu=''):
    return [p['nr'] for p in EXPORT['oplan'] if p['pf'] == pf and p['aktion'] == aktion and
            (not heute or p['heute'] == heute) and (not neu or p['neu'] == neu)][0]


def osich(s):
    return s.zeilen('Ordner-Sicherung', int(s.L['OSICH_ERSTE']), 11)


def omoves(zeilen=None):
    return len([p for p in EXPORT['oplan'] if p['aktion'] == 'ORDNER_VERSCHIEBEN' and (zeilen is None or p['nr'] in zeilen)])


def orenames(zeilen=None):
    return len([p for p in EXPORT['oplan'] if p['aktion'] != 'ORDNER_ANLEGEN' and (zeilen is None or p['nr'] in zeilen)
                and p['heute'].split('\\')[-1] != p['neu'].split('\\')[-1]])


def regeln_umsetzen(s):
    """Regelplan v2 (Zeilen 1–11) wie beim Nutzer ausfuehren (Stand vor der Ordner-Umstellung)."""
    s.ruf('modUmbau.VorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJ')
    s.ruf('modUmbau.AusfuehrenLauf')
    return s.plan('ERGEBNIS')


def sz_ordner_vorschau(s):
    print('\n== 42  Ordner: Vorschau beider Postfächer (schreibt nichts), betroffene Regeln je Zeile')
    s.laden()
    print('   ', s.ruf('modAttrappe.AtStart', 'ordner'))
    vorher = (s.ordner(BES), s.ordner(MAK), s.zustand(BES), s.zustand(MAK))
    msg = s.ruf('modOrdner.OrdnerVorschauLauf')
    print('    Meldung:', kurz(msg, 400))
    st, rg = s.oplan('VORSCHAU'), s.oplan('REGELN')
    for nr in sorted(st):
        print('     %2d  %s' % (nr, kurz(st[nr], 150)))
    z = s.zaehler()
    pruefe(z['schreib'] == '0' and z['move'] == '0' and z['umbenennen'] == '0' and z['ordneradd'] == '0',
           'Vorschau schreibt nichts (keine Ordner, kein MoveTo, kein Umbenennen)', str(z))
    pruefe((s.ordner(BES), s.ordner(MAK), s.zustand(BES), s.zustand(MAK)) == vorher, 'Ordner und Regeln unverändert')
    alle = [p['nr'] for p in EXPORT['oplan']]
    pruefe(len(alle) == 47 and all(st[n].startswith('bereit') for n in alle), 'Alle 47 Zeilen bereit (beide Postfächer)',
           str({n: st[n][:70] for n in alle if not st[n].startswith('bereit')}))
    nd = onr(BES, 'ORDNER_VERSCHIEBEN', 'Archiv\\Archiv: Dopplung der Neuzugänge')
    regeln_d = [n for pf, n, b, d in EXPORT['ziele'] if pf == BES and d.endswith('\\Archiv\\Archiv: Dopplung der Neuzugänge')]
    pruefe(st[nd].endswith('· %d Regeln zeigen danach dorthin' % len(regeln_d)) and len(regeln_d) == 6 and
           all('„%s“' % n in rg[nd] for n in regeln_d) and
           rg[nd].count('danach Archiv\\04) Neuzugänge\\Dopplung der Neuzugänge') == 6,
           'Zeile %d (Dopplung der Neuzugänge): die 6 Regeln laut Export mit neuem Pfad' % nd, '%s | %s' % (st[nd], rg[nd]))
    na = onr(MAK, 'ORDNER_VERSCHIEBEN', 'Archiv\\Auotmatische Antworten')
    pruefe('Bestandsuebertragungen: „Kopie von Automatische Antworten aussortieren“ verschiebt – danach \\\\Maklerauftraege@ergo.de'
           '\\Archiv\\01) Automatische Antworten\\Automatische Antworten' in rg[na] and
           'Maklerauftraege: „Automatische Antworten aussortieren“ verschiebt – danach Archiv\\01) Automatische Antworten\\'
           'Automatische Antworten' in rg[na] and ', neuer Name „Automatische Antworten“' in st[na],
           'Zeile %d: Regel aus dem anderen Postfach (EntryID) mit vollem Pfad, Tippfehler korrigiert' % na, rg[na])
    nn = onr(MAK, 'ORDNER_VERSCHIEBEN', 'Archiv\\Archiv zu den Neuzugängen im Postfach')
    unter = [(n, d) for pf, n, b, d in EXPORT['ziele'] if '\\Archiv zu den Neuzugängen im Postfach\\' in d]
    prot = [p for p in protokoll(s) if p[3] == str(nn) and p[6].startswith('Regel: ')]
    pruefe(st[nn].endswith('· %d Regeln zeigen danach dorthin' % len(unter)) and len(unter) > 6 and
           rg[nn].endswith('… und %d weitere (Protokoll)' % (len(unter) - 6)) and len(prot) == len(unter) and
           'mit 6 Unterordnern' in st[nn],
           'Zeile %d: Regeln mit Ziel in Unterordnern (%d), Rest im Protokoll, Unterordner gezählt' % (nn, len(unter)),
           '%s | %d' % (st[nn], len(prot)))
    nw = onr(BES, 'ORDNER_VERSCHIEBEN', 'Archiv\\Archiv: Weiterleitung an KWAD')
    pruefe('mit 2 Unterordnern' in st[nw], 'Zeile %d: zwei Unterordner ziehen mit' % nw, st[nw])
    pruefe(st[1] == 'bereit · wird angelegt in „Archiv“' and all(rg[n] == '' for n in alle if EXPORT['oplan'][n - 1]['aktion'] == 'ORDNER_ANLEGEN'),
           'Anlegen: Zeile nennt den Ort, keine Regeln', st[1])
    ou = onr(BES, 'ORDNER_UMBENENNEN', 'Rückläufer EPL und FL Verträge\\Nass-Kluske')
    pruefe(st[ou] == 'bereit · umbenennen in „06) Nass-Kluske“ · mit 1 Unterordner', 'Umbenennen: Unterordner bleibt', st[ou])
    pruefe(s.ostatus().startswith('Vorschau ') and 'Hinweis, ausgeschaltete Regel ohne Zielordner: Maklerauftraege: '
           '„Umleitung - Technische Fehler“' in s.ostatus() and 'Achtung' not in s.ostatus(),
           'Stand: Vorschau; ausgeschaltete Makler-Regel ohne Ordner nur als Hinweis', s.ostatus())
    pruefe(len(s.zelle('Ordner', s.L['O_PRUEFWERT'])) == 8 and 'In Outlook wurde nichts geändert' in msg,
           'Prüfwert gesetzt, Meldung: nichts geändert')
    msg = s.ruf('modOrdner.OrdnerRegelnPruefenLauf')
    print('    Regeln prüfen:', kurz(msg, 300))
    pruefe(msg.startswith('Regeln geprüft') and '; 0 unter den neuen Pfaden des Plans' in msg and s.zaehler()['schreib'] == '0',
           'Regeln prüfen (vor der Umstellung): nur gelesen, Ziele noch unter den alten Pfaden', msg)


def sz_ordner_voll(s):
    print('\n== 43  Ordner: Vollauf beide Postfächer nach dem Regelplan, Regeln zeigen auf neue Pfade, zweiter Lauf')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'ordner')
    erg = regeln_umsetzen(s)
    ja = zeilen_nr(ausf='Ja')
    pruefe(alle_ok(erg, ja), 'Vorher: Regelplan Zeilen 1–11 erledigt (Stand wie beim Nutzer)', str(erg))
    vb, vm, zb, zm, z0 = s.ordner(BES), s.ordner(MAK), s.zustand(BES), s.zustand(MAK), s.zaehler()
    s.ruf('modOrdner.OrdnerVorschauLauf')
    st = s.oplan('VORSCHAU')
    alle = [p['nr'] for p in EXPORT['oplan']]
    pruefe(all(st[n].startswith('bereit') for n in alle), 'Vorschau: alle Zeilen bereit', str({n: st[n][:60] for n in alle if not st[n].startswith('bereit')}))
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
    msg = s.ruf('modOrdner.OrdnerAusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 500))
    erg = s.oplan('ERGEBNIS')
    for nr in sorted(erg)[:8]:
        print('     %2d  %s' % (nr, kurz(erg[nr], 150)))
    z = s.zaehler()
    print('    Zähler:', z)
    pruefe(all(erg[n].startswith('erledigt (geprüft)') and 'Achtung' not in erg[n] for n in alle),
           'Alle 47 Zeilen erledigt (geprüft)', str({n: erg[n][:80] for n in alle if not erg[n].startswith('erledigt')}))
    pruefe(int(z['move']) == omoves() == 24 and int(z['umbenennen']) == orenames() and
           int(z['ordneradd']) - int(z0['ordneradd']) == 12 and z['save'] == z0['save'] and z['create'] == z0['create'],
           'Outlook: %d MoveTo, %d Umbenennungen, 12 Ordner angelegt, kein Rules.Save, keine neue Regel' % (omoves(), orenames()), str(z))
    schritte = oschritte()
    anl = {pf: [p['neu'] for p in EXPORT['oplan'] if p['pf'] == pf and p['aktion'] == 'ORDNER_ANLEGEN'] for pf in (BES, MAK)}
    for pf, v in ((BES, vb), (MAK, vm)):
        ist, soll = sorted(s.ordner(pf), key=str.lower), obaum_soll(v, pf, schritte, anl[pf])
        pruefe(ist == soll, '%s: Ordnerbaum wie geplant (nichts gelöscht, %d Ordner)' % (pf.split('@')[0], len(ist)),
               '\n      fehlt: %s\n      zuviel: %s' % (sorted(set(soll) - set(ist))[:5], sorted(set(ist) - set(soll))[:5]))
    nz = ozielwechsel(zb, schritte) + ozielwechsel(zm, schritte)
    pruefe(s.zustand(BES) == ozustand_soll(zb, schritte) and s.zustand(MAK) == ozustand_soll(zm, schritte),
           'Regeln beider Postfächer: sonst unverändert, %d Ziele zeigen auf den neuen Pfad (EntryID)' % nz)
    aa = s.regel(BES, 'Automatische Antworten aussortieren')
    pruefe(aa[5].startswith('MOVE=' + ovoll(BES, 'Archiv\\01) Automatische Antworten\\Automatische Antworten')),
           'Bestand „Automatische Antworten aussortieren“ zeigt auf …\\01) Automatische Antworten\\Automatische Antworten', aa[5])
    esk = s.regel(MAK, 'Eskalations-GPF in den Prio-Ordner')
    pruefe('COPY=' + ovoll(MAK, 'Archiv\\04) Neuzugänge\\Neuzugänge im Postfach\\Beschwerden / Prio (Archiv)') in esk[5],
           'Makler: Ziel in einem Unterordner zeigt auf den neuen Pfad', esk[5])
    pruefe(msg.startswith('Ausgeführt: 47 Zeile(n), davon 47 geprüft erledigt.') and
           ('%d zeigen wie erwartet auf den neuen Pfad' % nz) in msg and 'Achtung' not in msg,
           'Meldung: alle geprüft, %d Regelziele wie erwartet' % nz, kurz(msg, 400))
    pruefe(s.ostatus().startswith('Regeln geprüft'), 'Stand: Regeln geprüft', s.ostatus())
    sich = osich(s)
    arten = {}
    for r in sich:
        arten[r[3]] = arten.get(r[3], 0) + 1
    print('    Ordner-Sicherung:', arten)
    nziele = sum(1 for r in zb + zm for t in r[5].split('|') if t.split('=')[0] in ('MOVE', 'COPY'))
    pruefe(arten.get('Ordner') == len(vb) + len(vm) and arten.get('angelegt') == 12 and arten.get('verschoben') == 24 and
           arten.get('umbenannt') == orenames() and
           arten.get('Regel verschieben', 0) + arten.get('Regel kopieren', 0) == nziele,
           'Ordner-Sicherung: Ordnerliste beider Postfächer, %d Regelziele, jeder Schritt' % nziele, str(arten))
    folge = [int(r[2]) for r in sich if r[2]]
    pruefe(folge == list(range(1, len(folge) + 1)) and all(r[10] == 'ausgeführt' for r in sich if r[2]),
           'Schritte fortlaufend nummeriert (Folge), Stand „ausgeführt“')
    fr = [f for f in s.fragen() if 'Ordner umstellen' in f[0]]
    pruefe(len(fr) == 1 and '(Vorgabe Nein)' in fr[0][0] and len(fr[0][1]) < 1024 and fr[0][1].endswith('Jetzt ausführen?')
           and 'Gelöscht wird nichts' in fr[0][1], 'Eine Rückfrage (Vorgabe Nein), passt in eine MsgBox')
    # zweiter Lauf
    s.ruf('modOrdner.OrdnerVorschauLauf')
    st = s.oplan('VORSCHAU')
    pruefe(all(st[n] == 'schon erledigt' for n in alle), 'Zweiter Lauf: alles schon erledigt (idempotent)',
           str({n: st[n][:60] for n in alle if st[n] != 'schon erledigt'}))
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
    msg = s.ruf('modOrdner.OrdnerAusfuehrenLauf')
    pruefe(msg.startswith('Nichts zu tun') and s.zaehler()['move'] == z['move'], 'Zweites Ausführen: nichts zu tun', msg)
    # Regelplan (Blatt Umsetzung) kennt die Umzuege
    s.ruf('modUmbau.VorschauLauf')
    st = s.plan('VORSCHAU')
    print('    Regelplan danach: 1 %s | 6 %s' % (kurz(st[1], 160), kurz(st[6], 160)))
    pruefe(all(st[n].startswith('schon erledigt') for n in ja), 'Regelplan danach: Zeilen 1–11 schon erledigt (alte Pfade '
           'gelten als die neuen)', str({n: st[n][:80] for n in ja if not st[n].startswith('schon erledigt')}))
    pruefe(st[1].endswith('· Ordner laut Blatt Ordner umgezogen: Archiv\\Automatische Antworten jetzt Archiv\\01) '
                          'Automatische Antworten\\Automatische Antworten') and 'umgezogen' in st[6],
           'Regelplan: Zeilen 1 und 6 nennen den Umzug', st[1])
    msg = s.ruf('modOrdner.OrdnerRegelnPruefenLauf')
    print('    Regeln prüfen:', kurz(msg, 300))
    pruefe(msg.startswith('Regeln geprüft') and ' 0 noch unter den alten.' in msg, 'Regeln prüfen: alle Ziele vorhanden, '
           'keines mehr unter den alten Pfaden', msg)


def sz_ordner_name(s):
    print('\n== 44  Ordner: abweichender Name blockiert (ähnliche Namen genannt), Postfach falsch')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'ordner')
    b = oroot(BES) + '\\'
    print('   ', s.ruf('modAttrappe.AtOrdnerNameIntern', b + 'Archiv\\Archiv: BeMaS-Kennzeichen konnte nicht gesetzt werden',
                       'Archiv: BeMaS Kennzeichen konnte nicht gesetzt werden'))
    print('   ', s.ruf('modAttrappe.AtOrdnerUmhaengen', b + 'Rückläufer EPL und FL Verträge', b + 'Archiv'))
    msg = s.ruf('modOrdner.OrdnerVorschauLauf')
    st = s.oplan('VORSCHAU')
    nk = onr(BES, 'ORDNER_VERSCHIEBEN', 'Archiv\\Archiv: BeMaS-Kennzeichen konnte nicht gesetzt werden')
    na = onr(BES, 'ORDNER_UMBENENNEN', 'Rückläufer EPL und FL Verträge\\Abbas')
    print('    %d  %s\n    %d  %s' % (nk, st[nk], na, st[na]))
    pruefe(st[nk] == 'blockiert: Ordner nicht gefunden: Archiv\\Archiv: BeMaS-Kennzeichen konnte nicht gesetzt werden · '
                     'ähnlicher Name in „Archiv“: „Archiv: BeMaS Kennzeichen konnte nicht gesetzt werden“ – bitte die Zeile '
                     'prüfen (das Makro rät nicht)', 'Abweichender Name: blockiert, ähnlicher Name genannt, nicht geraten', st[nk])
    pruefe(st[na].startswith('blockiert: Ordner nicht gefunden: Rückläufer EPL und FL Verträge\\Abbas') and
           'gleichnamiger Ordner an anderer Stelle: Archiv\\Rückläufer EPL und FL Verträge' in st[na],
           'Elternordner woanders: gleichnamiger Ordner mit Pfad genannt', st[na])
    pruefe(all(st[n].startswith('bereit') for n in st if n not in (nk,) and not st[n].startswith('blockiert: Ordner nicht '
           'gefunden: Rückläufer')), 'Übrige Zeilen bereit')
    msg = s.ruf('modOrdner.OrdnerAusfuehrenLauf')
    pruefe('blockierte Zeile' in msg and s.zaehler()['schreib'] == '0', 'Ausführen verweigert, nichts geschrieben', msg)
    # falsches Postfach in einer ausgewaehlten Zeile: Vorschau nicht moeglich; auf Nein: Zeile bleibt aussen vor
    s.oplanzeile_setzen(nk, pf='gibtsnicht@ergo.de')
    msg = s.ruf('modOrdner.OrdnerVorschauLauf')
    pruefe(msg.startswith('Vorschau nicht möglich: Zeile %d: Postfach gibtsnicht@ergo.de nicht im Outlook-Profil' % nk),
           'Unbekanntes Postfach (ausgewählte Zeile): Vorschau nicht möglich', msg)
    s.oplanzeile_setzen(nk, ausf='Nein')
    s.ruf('modOrdner.OrdnerVorschauLauf')
    st = s.oplan('VORSCHAU')
    pruefe(st[nk] == 'nicht ausgewählt' and st[nk + 1].startswith('bereit'), 'Auf Nein: Zeile nicht ausgewählt, Rest läuft',
           st[nk])


def sz_ordner_konflikt(s):
    print('\n== 45  Ordner: Namenskonflikt, Zwischenschritt, gleicher Elternordner, Standardordner, fremdes Postfach')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'ordner')
    b = oroot(BES) + '\\'
    s.ruf('modAttrappe.AtOrdnerDazu', b + 'Archiv\\04) Neuzugänge\\Dopplung der Neuzugänge')
    s.ruf('modAttrappe.AtOrdnerDazu', b + 'Archiv\\03) BeMaS - eBIS\\Archiv: BeMaS an KWAD')
    n = len(EXPORT['oplan'])
    s.oplanzeile_setzen(n + 1, pf=BES, aktion='ORDNER_VERSCHIEBEN', heute='UBR\\Witt', neu='UBR\\Witt (alt)')
    s.oplanzeile_setzen(n + 2, pf=BES, aktion='ORDNER_VERSCHIEBEN', heute='Posteingang', neu='Archiv\\Posteingang')
    s.oplanzeile_setzen(n + 3, pf=BES, aktion='ORDNER_VERSCHIEBEN', heute='\\\\Maklerauftraege@ergo.de\\Archiv\\KV Qualitypool',
                        neu='Archiv\\KV Qualitypool')
    s.oplanzeile_setzen(n + 4, pf=BES, aktion='ORDNER_UMBENENNEN', heute='UBR', neu='Archiv\\UBR')
    s.ruf('modOrdner.OrdnerVorschauLauf')
    st = s.oplan('VORSCHAU')
    nd = onr(BES, 'ORDNER_VERSCHIEBEN', 'Archiv\\Archiv: Dopplung der Neuzugänge')
    nb = onr(BES, 'ORDNER_VERSCHIEBEN', 'Archiv\\Archiv: BeMaS an KWAD')
    for k in (nd, nb, n + 1, n + 2, n + 3, n + 4):
        print('    %2d  %s' % (k, kurz(st[k], 200)))
    pruefe(st[onr(BES, 'ORDNER_ANLEGEN', neu='Archiv\\04) Neuzugänge')] == 'schon erledigt', 'Gruppenordner da: schon erledigt')
    pruefe(st[nd].startswith('blockiert: Namenskonflikt – Archiv\\04) Neuzugänge\\Dopplung der Neuzugänge gibt es schon'),
           'Quelle und Ziel da: Namenskonflikt (nichts wird zusammengeführt)', st[nd])
    pruefe(st[nb].startswith('blockiert: Zwischenschritt nicht möglich – in „Archiv\\03) BeMaS - eBIS“ gibt es schon einen '
                             'Ordner „Archiv: BeMaS an KWAD“'), 'Alter Name im Zielordner vergeben: Zwischenschritt blockiert', st[nb])
    pruefe(st[n + 1].startswith('blockiert: Elternordner bleibt gleich') and
           st[n + 2].startswith('blockiert: „Posteingang“ ist ein Standardordner') and
           st[n + 3].startswith('blockiert: Pfad liegt im Postfach Maklerauftraege@ergo.de, die Zeile nennt '
                                'Bestandsuebertragungen@ergo.de') and
           st[n + 4].startswith('blockiert: Pfad neu liegt in einem anderen Ordner'),
           'Falsche Aktion, Standardordner, anderes Postfach: blockiert', str([st[k][:60] for k in range(n + 1, n + 5)]))
    msg = s.ruf('modOrdner.OrdnerAusfuehrenLauf')
    pruefe('blockierte Zeile' in msg and s.zaehler()['schreib'] == '0', 'Ausführen verweigert, nichts geschrieben', msg)


def sz_ordner_fehler(s):
    print('\n== 46  Ordner: Fehler mitten im Lauf (Verschieben bzw. Umbenennen scheitert), Ordner zurück')
    for schalter, ordner, aktion in (('verschiebefehler', 'Archiv: BeMaS an KWAD', 'Verschieben'),
                                     ('umbenennfehler', 'No Reply Mails etc.', 'Umbenennen')):
        s.laden()
        s.ruf('modAttrappe.AtStart', 'ordner')
        vb, vm, zb, zm = s.ordner(BES), s.ordner(MAK), s.zustand(BES), s.zustand(MAK)
        s.ruf('modOrdner.OrdnerVorschauLauf')
        s.ruf('modAttrappe.AtSchalter', schalter, ordner)
        s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
        msg = s.ruf('modOrdner.OrdnerAusfuehrenLauf')
        print('    Ausführen (%s scheitert):' % aktion, kurz(msg, 500))
        erg = s.oplan('ERGEBNIS')
        nf = [p['nr'] for p in EXPORT['oplan'] if p['pf'] == BES and p['heute'].endswith('\\' + ordner)][0]
        print('    %d  %s' % (nf, erg[nf]))
        alle = [p['nr'] for p in EXPORT['oplan']]
        if aktion == 'Verschieben':
            pruefe(erg[nf] == 'nicht ausgeführt: Fehler (Verschieben): Ordner kann nicht verschoben werden (Attrappe)',
                   'Zeile %d: Fehler beim Verschieben genau gemeldet' % nf, erg[nf])
        else:
            pruefe(erg[nf] == 'nicht ausgeführt: Fehler (Umbenennen): Ordner kann nicht umbenannt werden (Attrappe) – '
                              'verschoben ist der Ordner schon (jetzt Archiv\\01) Automatische Antworten\\No Reply Mails etc.)',
                   'Zeile %d: Umbenennen scheitert, Meldung sagt, dass schon verschoben ist' % nf, erg[nf])
        pruefe(all(erg[n].startswith('erledigt (geprüft)') for n in alle if n < nf) and
               all(erg[n] == 'nicht ausgeführt: abgebrochen wegen Fehler in Zeile %d' % nf for n in alle if n > nf),
               'Davor erledigt (geprüft), danach „abgebrochen wegen Fehler in Zeile %d“ (sofort Stopp)' % nf,
               str([erg[n][:60] for n in (nf - 1, nf + 1)]))
        fertig = [p['nr'] for p in EXPORT['oplan'] if p['nr'] < nf]
        pruefe(msg.startswith('Abgebrochen in Zeile %d' % nf) and 'Schon ausgeführt (bleibt so; „Ordner zurück“' in msg and
               'Bestandsuebertragungen: Archiv\\Automatische Antworten jetzt Bestandsuebertragungen: Archiv\\01) '
               'Automatische Antworten\\Automatische Antworten' in msg and 'Regeln geprüft' in msg,
               'Meldung: was schon umgezogen ist, Regeln trotzdem geprüft', kurz(msg, 300))
        pruefe(s.ordner(MAK) == vm and s.zustand(MAK) == zm, 'Maklerauftraege (spätere Zeilen) unverändert')
        schritte = oschritte(fertig)
        teil = (ordner == 'No Reply Mails etc.')
        if teil:
            schritte = schritte + [(ovoll(BES, 'Archiv\\No Reply Mails etc.'),
                                    ovoll(BES, 'Archiv\\01) Automatische Antworten\\No Reply Mails etc.'))]
        pruefe(s.zustand(BES) == ozustand_soll(zb, schritte), 'Regeln zeigen auf die schon umgezogenen Ordner')
        j = [r for r in osich(s) if r[3] in ('verschoben', 'umbenannt')]
        pruefe(len(j) == omoves(fertig) + orenames(fertig) + (1 if teil else 0),
               'Ordner-Sicherung: jeder gelungene Schritt (%d)%s' % (len(j), ', auch das Verschieben ohne Umbenennen' if teil else ''))
        # Ordner zurueck
        s.ruf('modAttrappe.AtSchalter', schalter, '')
        s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
        msg = s.ruf('modOrdner.OrdnerZurueckLauf')
        print('    Ordner zurück:', kurz(msg, 400))
        anl = [p['neu'] for p in EXPORT['oplan'] if p['pf'] == BES and p['aktion'] == 'ORDNER_ANLEGEN']
        pruefe(msg.startswith('Zurückgenommen: %d Schritte.' % len(j)) and 'Angelegte Ordner bleiben stehen' in msg and
               '(ohne Unterordner)' in msg and 'Regeln geprüft' in msg and 'Achtung' not in msg,
               'Ordner zurück: alle %d Schritte, angelegte Ordner bleiben (leer), Regeln geprüft' % len(j), kurz(msg, 300))
        pruefe(sorted(s.ordner(BES), key=str.lower) == obaum_soll(vb, BES, [], anl) and s.zustand(BES) == zb,
               'Danach: Ordner wie vorher (plus leere Gruppenordner), Regeln zeigen wieder auf die alten Pfade')
        sich = osich(s)
        pruefe(all(r[10].startswith('zurückgenommen') for r in sich if r[3] in ('verschoben', 'umbenannt')) and
               all(r[10].startswith('bleibt stehen') for r in sich if r[3] == 'angelegt'),
               'Ordner-Sicherung: Stand „zurückgenommen“ bzw. „bleibt stehen“')
        msg = s.ruf('modOrdner.OrdnerZurueckLauf')
        pruefe(msg.startswith('Nichts zurückzunehmen'), 'Zweites „Ordner zurück“: nichts zurückzunehmen', msg)
        if not teil:
            s.ruf('modOrdner.OrdnerVorschauLauf')
            st = s.oplan('VORSCHAU')
            pruefe(all(st[n] == ('schon erledigt' if EXPORT['oplan'][n - 1]['aktion'] == 'ORDNER_ANLEGEN' and
                                 EXPORT['oplan'][n - 1]['pf'] == BES else st[n]) for n in alle) and
                   all(st[n].startswith('bereit') for n in alle if not (EXPORT['oplan'][n - 1]['aktion'] == 'ORDNER_ANLEGEN'
                                                                      and EXPORT['oplan'][n - 1]['pf'] == BES)),
                   'Neue Vorschau: Gruppenordner schon erledigt, alles andere wieder bereit')


def sz_ordner_zurueck(s):
    print('\n== 47  Ordner zurück nach vollem Lauf: Rückfrage verneint, Ordner inzwischen verändert, dann zurück')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'ordner')
    vb, vm, zb, zm = s.ordner(BES), s.ordner(MAK), s.zustand(BES), s.zustand(MAK)
    s.ruf('modOrdner.OrdnerVorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
    s.ruf('modOrdner.OrdnerAusfuehrenLauf')
    z = s.zaehler()
    msg = s.ruf('modOrdner.OrdnerZurueckLauf')
    fr = s.fragen()
    pruefe(msg == 'Abgebrochen – nichts geändert.' and s.zaehler()['move'] == z['move'] and '[Ordner zurück] (Vorgabe Nein)'
           in fr[-1][0] and fr[-1][1].endswith('Jetzt zurücknehmen?'), 'Rückfrage (Vorgabe Nein) verneint: nichts geändert')
    u = ovoll(BES, 'Archiv\\06) Technische Fehler\\Umleitung - Technischer Fehler')
    s.ruf('modAttrappe.AtOrdnerNameIntern', u, 'Umleitung - Technischer Fehler (alt)')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
    msg = s.ruf('modOrdner.OrdnerZurueckLauf')
    print('    Ordner verändert:', kurz(msg, 300))
    pruefe(msg.startswith('Ordner zurück nicht möglich – nichts geändert. Schritt aus Zeile %d'
                          % onr(BES, 'ORDNER_VERSCHIEBEN', 'Umleitung - Technischer Fehler')) and
           s.zaehler()['move'] == z['move'] and s.zaehler()['umbenennen'] == z['umbenennen'],
           'Ordner seit dem Umzug verändert: vorab erkannt, nichts geändert', msg)
    s.ruf('modAttrappe.AtOrdnerNameIntern', u.replace('Umleitung - Technischer Fehler', 'Umleitung - Technischer Fehler (alt)'),
          'Umleitung - Technischer Fehler')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
    msg = s.ruf('modOrdner.OrdnerZurueckLauf')
    print('    Ordner zurück:', kurz(msg, 400))
    anl = {pf: [p['neu'] for p in EXPORT['oplan'] if p['pf'] == pf and p['aktion'] == 'ORDNER_ANLEGEN'] for pf in (BES, MAK)}
    n = omoves() + orenames()
    pruefe(msg.startswith('Zurückgenommen: %d Schritte.' % n) and 'Regeln geprüft' in msg and 'Achtung' not in msg,
           'Ordner zurück: alle %d Schritte, Regeln geprüft' % n, kurz(msg, 300))
    pruefe(sorted(s.ordner(BES), key=str.lower) == obaum_soll(vb, BES, [], anl[BES]) and
           sorted(s.ordner(MAK), key=str.lower) == obaum_soll(vm, MAK, [], anl[MAK]),
           'Ordnerbäume wie vorher (plus 12 leere Gruppenordner, nichts gelöscht)')
    pruefe(s.zustand(BES) == zb and s.zustand(MAK) == zm, 'Regeln beider Postfächer wie vorher (alte Pfade)')
    z2 = s.zaehler()
    pruefe(int(z2['move']) - int(z['move']) == omoves() and int(z2['umbenennen']) - int(z['umbenennen']) == orenames()
           and z2['save'] == z['save'], 'Zurück: genau so viele MoveTo/Umbenennungen wie hin, kein Rules.Save', str(z2))


def sz_ordner_eid(s):
    print('\n== 48  Ordner: Verschieben vergibt eine neue EntryID, Regeln verlieren den Ordner – Stopp, Nachprüfung meldet es')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'ordner')
    vb, zb = s.ordner(BES), s.zustand(BES)
    nd = onr(BES, 'ORDNER_VERSCHIEBEN', 'Archiv\\Archiv: Dopplung der Neuzugänge')
    anl = [p['nr'] for p in EXPORT['oplan'] if p['pf'] == BES and p['aktion'] == 'ORDNER_ANLEGEN']
    for p in EXPORT['oplan']:
        if p['nr'] not in anl + [nd, nd + 1]:
            s.oplanzeile_setzen(p['nr'], ausf='Nein')
    s.ruf('modAttrappe.AtSchalter', 'eidwechsel', '1')
    s.ruf('modOrdner.OrdnerVorschauLauf')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
    msg = s.ruf('modOrdner.OrdnerAusfuehrenLauf')
    print('    Ausführen:', kurz(msg, 600))
    erg = s.oplan('ERGEBNIS')
    regeln_d = [n for pf, n, b, d in EXPORT['ziele'] if pf == BES and d.endswith('\\Archiv\\Archiv: Dopplung der Neuzugänge')]
    pruefe(msg.startswith('Abgebrochen in Zeile %d: Fehler (Prüfen nach dem Verschieben): der Ordner hat beim Verschieben '
                          'eine neue EntryID bekommen' % nd) and ('Achtung, Regeln weichen ab (%d):' % len(regeln_d)) in msg
           and 'zeigt auf keinen vorhandenen Ordner mehr' in msg,
           'Neue EntryID: sofort Stopp nach dem ersten Umzug, die %d Regeln ohne Ordner deutlich gemeldet' % len(regeln_d),
           kurz(msg, 300))
    pruefe(s.ostatus().startswith('Abgebrochen in Zeile %d' % nd) and 'Achtung, Regeln weichen ab' in s.ostatus(),
           'Stand: Abbruch und Achtung', s.ostatus()[:150])
    pruefe(erg[nd].startswith('nicht ausgeführt: Fehler (Prüfen nach dem Verschieben)') and '· Achtung: Regel „' in erg[nd]
           and erg[nd + 1] == 'nicht ausgeführt: abgebrochen wegen Fehler in Zeile %d' % nd,
           'Ergebnis: Zeile %d mit Hinweis auf die Regeln, Folgezeile abgebrochen' % nd, erg[nd])
    prot = [p for p in protokoll(s) if p[4] == 'REGELPRÜFUNG' and p[6].startswith('Abweichung')]
    pruefe(len(prot) == len(regeln_d), 'Protokoll: je Abweichung eine Zeile (%d)' % len(prot))
    msg = s.ruf('modOrdner.OrdnerRegelnPruefenLauf')
    pruefe(msg.startswith('Achtung, %d Regelziel(e) ohne vorhandenen Ordner' % len(regeln_d)),
           'Regeln prüfen meldet die Regeln ohne Ordner', kurz(msg, 200))
    s.ruf('modAttrappe.AtSchalter', 'eidwechsel', '')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
    msg = s.ruf('modOrdner.OrdnerZurueckLauf')
    print('    Ordner zurück:', kurz(msg, 300))
    pruefe(msg.startswith('Zurückgenommen: 1 Schritt.') and
           sorted(s.ordner(BES), key=str.lower) == obaum_soll(vb, BES, [], [p['neu'] for p in EXPORT['oplan'] if p['nr'] in anl]),
           'Ordner zurück erkennt den Ordner an der nachgetragenen EntryID und stellt ihn zurück', kurz(msg, 200))


def sz_ordner_ablauf(s):
    print('\n== 49  Ordner: Blatt umgebaut, Ausführen ohne Vorschau, Plan bzw. Outlook nach der Vorschau geändert')
    s.laden()
    s.ruf('modAttrappe.AtStart', 'ordner')
    msg = s.ruf('modOrdner.OrdnerAusfuehrenLauf')
    pruefe(msg.startswith('Bitte zuerst „Vorschau“'), 'Ohne Vorschau: kein Ausführen', msg)
    s.ruf('modOrdner.OrdnerVorschauLauf')
    s.oplanzeile_setzen(7, ausf='Nein')
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
    msg = s.ruf('modOrdner.OrdnerAusfuehrenLauf')
    pruefe(msg.startswith('Der Plan wurde nach der Vorschau geändert'), 'Plan nach der Vorschau geändert: abgelehnt', msg)
    s.oplanzeile_setzen(7, ausf='Ja')
    s.ruf('modOrdner.OrdnerVorschauLauf')
    s.ruf('modAttrappe.AtOrdnerDazu', ovoll(BES, 'Archiv\\01) Automatische Antworten'))
    s.ruf('modAttrappe.AtSchalter', 'antworten', 'J')
    msg = s.ruf('modOrdner.OrdnerAusfuehrenLauf')
    pruefe(msg.startswith('Der Stand in Outlook hat sich seit der Vorschau geändert (Zeile 1: jetzt „schon erledigt“)')
           and s.zaehler()['schreib'] == '0', 'Outlook nach der Vorschau geändert: abgelehnt, nichts geschrieben', msg)
    sh = s.doc.Sheets.getByName('Ordner')
    sh.Columns.removeByIndex(int(s.L['OSP_HEUTE']) - 1, 1)
    msg = s.ruf('modOrdner.OrdnerVorschauLauf')
    pruefe(msg.startswith('Vorschau nicht möglich: Das Blatt Ordner wurde umgebaut') and s.zaehler()['schreib'] == '0',
           'Spalte gelöscht: Vorschau verweigert', kurz(msg, 200))


SZENARIEN = [('lesen', sz_lesen), ('vorschau', sz_vorschau), ('ohne_vorschau', sz_ohne_vorschau), ('voll', sz_voll),
             ('erinnerungen_einfuegen', lambda s: sz_erinnerungen(s, 'einfuegen')),
             ('erinnerungen_tauschen', lambda s: sz_erinnerungen(s, 'tauschen')),
             ('sperre', sz_sperre), ('sperre_namen', sz_sperre_namen), ('kopieren_blockiert', sz_kopieren_blockiert),
             ('verlust_ja', lambda s: sz_verlust(s, 'JJJJ')), ('verlust_nein', lambda s: sz_verlust(s, 'JJJN')),
             ('addverlust', sz_addverlust), ('umleiten_alt', sz_umleiten_alt), ('layout', sz_layout),
             ('position', sz_position), ('benannt', sz_benannt), ('nurlet', sz_nurlet), ('pfad', sz_pfad),
             ('ohne_outlook', sz_ohne_outlook), ('fehler', sz_fehler), ('savefehler', sz_savefehler),
             ('geaendert', sz_geaendert), ('weitere', sz_weitere), ('kopie_outlook', sz_kopie_outlook),
             ('abfang', sz_abfang), ('ohne_bed', sz_ohne_bed), ('werte_roh', sz_werte_roh), ('lesefehler', sz_lesefehler),
             ('kopie_quelle', sz_kopie_quelle), ('ziel_alias', sz_ziel_alias),
             ('ausnahmen_abw_nein', lambda s: sz_ausnahmen_abw(s, 'JJJN')),
             ('ausnahmen_abw_ja', lambda s: sz_ausnahmen_abw(s, 'JJJJ')), ('meldung', sz_meldung),
             ('rueckfrage_lang', sz_rueckfrage_lang),
             ('neu_ausverlust_ja', lambda s: sz_neu_ausverlust(s, 'JJJJ')),
             ('neu_ausverlust_nein', lambda s: sz_neu_ausverlust(s, 'JJJN')), ('lage_neu', sz_lage_neu),
             ('aufloesen', sz_aufloesen), ('ziel_dn', sz_ziel_dn), ('ueberspringen', sz_ueberspringen),
             ('einschalten', sz_einschalten), ('ordner_vorschau', sz_ordner_vorschau), ('ordner_voll', sz_ordner_voll),
             ('ordner_name', sz_ordner_name), ('ordner_konflikt', sz_ordner_konflikt), ('ordner_fehler', sz_ordner_fehler),
             ('ordner_zurueck', sz_ordner_zurueck), ('ordner_eid', sz_ordner_eid), ('ordner_ablauf', sz_ordner_ablauf)]


def main():
    export, arbeit = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
    wahl = sys.argv[3:]
    os.makedirs(arbeit, exist_ok=True)
    test = os.path.join(arbeit, 'Regeln_Umbau_Test.xlsm')
    subprocess.run([sys.executable, '-I', os.path.join(HIER, 'bau_regeln.py'), export, test, '--test'], check=True)
    export_lesen(export, test)
    print('Soll-Reihenfolge aus Blatt Anlegen: %d Regeln; Plan: %d Zeilen' % (len(EXPORT['soll']), len(EXPORT['plan'])))
    s = Sitzung(test)
    try:
        for name, sz in SZENARIEN:
            if wahl and name not in wahl:
                continue
            try:
                sz(s)
            except Exception as e:
                pruefe(False, 'Szenario %s abgebrochen: %s' % (name, str(e)[:500]))
    finally:
        s.ende()
    n_ok = sum(1 for ok, _ in ERGEBNISSE if ok)
    print('\nErgebnis: %d von %d Prüfungen bestanden' % (n_ok, len(ERGEBNISSE)))
    for ok, t in ERGEBNISSE:
        if not ok:
            print('  FEHLER:', t)
    sys.exit(0 if n_ok == len(ERGEBNISSE) else 1)


if __name__ == '__main__':
    main()
