# -*- coding: utf-8 -*-
"""Makro-Teil der Regeln-Mappe (Ziel .xlsm): Blatt "Umsetzung" mit Plan, Einstellungen und Knoepfen, Blatt "Ordner"
(Ordner-Umstellung beider Postfaecher, Plan 3.0), die Blaetter "Live", "Sicherung", "Ordner-Sicherung" und "Protokoll"
sowie das VBA-Projekt.

Wird von bau_regeln.py aufgerufen (umbau.bauen(globals())). Der Plan wird aus den Daten der Auswertung abgeleitet
(dieselben Regeln, Pfade, Woerter und Positionen wie im Blatt "Anlegen"), nicht von Hand getippt.

Zellen, die das Makro liest oder schreibt, haben Namen (UM_ZIEL, UM_PLAN, ...): wer im Blatt Zeilen einfuegt oder
loescht, verschiebt die Namen mit. Das Makro prueft zusaetzlich die Beschriftungen und die Kopfzeile des Plans.

VBA:
  quellen/vba/*.bas, *.cls     Produktivmodule (modUmbau, modPlan, modModell, modOlLesen, modOlSchreiben,
                               modOlZugang, modDialog, modOrdner)
  modLayout                    vom Build erzeugt: Blattnamen, Namen, Beschriftungen, Spalten des Blatts Umsetzung
  quellen/vba_test/            nur Testvariante (--test): modOlZugang/modDialog ersetzt, Outlook-Attrappe als
                               Klassenmodule, modAttrappeDaten aus dem Export erzeugt
Vor dem Bau: vba_pruefung (Excel-Kompilierfehler), cp1252, Option Explicit, nur lesend ausserhalb modOlSchreiben.
"""
import io
import os
import re
import tempfile

from xlsxwriter.utility import xl_rowcol_to_cell, xl_col_to_name

import ovba
import vba_pruefung

HIER = os.path.dirname(os.path.abspath(__file__))

AKTIONEN = ['ORDNER_ANLEGEN', 'ZIELORDNER', 'UMBENENNEN', 'UMLEITEN_STATT_WEITERLEITEN', 'POSITION', 'KOPIEREN',
            'BEDINGUNG_WORT_ERGAENZEN', 'AUSNAHMEN_UEBERNEHMEN', 'DEAKTIVIEREN']
AKTION_TEXT = [
    ('ORDNER_ANLEGEN', 'I', 'Legt den Ordner aus Spalte I (samt fehlender Elternordner) im Zielpostfach an – erst '
                            'unmittelbar vor dem Speichern.'),
    ('ZIELORDNER', 'E, I und/oder J', 'Setzt das Ziel von „In Ordner verschieben“ (I) bzw. „In Ordner kopieren“ (J). '
                                      'Die Aktion muss in der Regel schon aktiv sein; fehlende Ordner werden angelegt.'),
    ('UMBENENNEN', 'E (alt), F (neu)', 'Benennt die Regel um. Heißt sie schon so: schon erledigt. Spätere Zeilen finden '
                                       'die Regel unter beiden Namen.'),
    ('UMLEITEN_STATT_WEITERLEITEN', 'E', 'Schaltet „Weiterleiten an“ aus und „Umleiten an“ mit genau denselben Empfängern '
                                         'ein. Enthält „Umleiten an“ schon andere Empfänger (auch ausgeschaltet), ist '
                                         'die Zeile blockiert.'),
    ('POSITION', 'E, F', '„nach: Regel“, „vor: Regel“ oder „Platz n“. Ausweich-Bezüge mit „||“: „nach: A || B“ – A, '
                         'sonst B. Ein einzelnes „|“ gehört zum Regelnamen.'),
    ('KOPIEREN', 'E (neuer Name), F (Position), I, J, K', 'Übernimmt eine Regel aus dem Quellpostfach (K): gibt es sie '
                 'schon – angleichen; gibt es „Kopie von …“ aus Outlook – umbenennen; sonst neu anlegen, wenn alle '
                 'Bedingungen lesbar und anlegbar sind, sonst Anleitung zum Kopieren in Outlook. Nie ohne Bedingung; '
                 'die neue Regel wird vor dem Speichern gegen die Quelle geprüft.'),
    ('BEDINGUNG_WORT_ERGAENZEN', 'E, F', 'Ergänzt Wörter in einer aktiven Bedingung, z. B. F = Betreff enthält: '
                                         '"Eskalation". Vorhandene Wörter bleiben unverändert; schon vorhandene zählen '
                                         'als erledigt. Neue Wörter werden ohne Leerzeichen am Rand geschrieben.'),
    ('AUSNAHMEN_UEBERNEHMEN', 'E, K, L', 'Übernimmt die Ausnahmen der Quellregel (K): fehlende Einträge werden '
                                         'ergänzt, vorhandene Ausnahmen bleiben. Absender werden über SMTP-Adresse, '
                                         'Exchange-Adresse oder Namen aufgelöst; nicht auflösbar = blockiert (die '
                                         'Vorschau nennt Typ und Adresse). Nur wer in L namentlich steht, wird dann '
                                         'übersprungen – für ihn bleibt der alte Stand; Rückfrage vor dem Ausführen.'),
    ('DEAKTIVIEREN', 'E', 'Schaltet die Regel aus. Regeln löscht das Makro nie.'),
]

VBA_NAMEN = {'Auf einen Blick': 'shBlick', 'Umsetzung': 'shUmsetzung', 'Vergleich': 'shVergleich',
             'Anlegen': 'shAnlegen', 'Übersicht': 'shUebersicht', 'Regel-Logik': 'shLogik', 'Elemente': 'shElemente',
             'Zielordner': 'shZielordner', 'Prüfhinweise': 'shHinweise', 'Diagnose': 'shDiagnose', 'Live': 'shLive',
             'Sicherung': 'shSicherung', 'Protokoll': 'shProtokoll', 'Ordner': 'shOrdner',
             'Ordner-Sicherung': 'shOrdnerSich'}

# Spalten im Blatt Umsetzung (0-basiert) und Breiten: Vorschau und Ergebnis stehen direkt hinter der Regel, damit sie
# auch bei 125 % Bildschirmskalierung ohne Scrollen sichtbar sind.
SP = dict(NR=1, AUSF=2, AKTION=3, REGEL=4, NEU=5, VORSCHAU=6, ERGEBNIS=7, VER=8, KOP=9, QUELLE=10, UEBERSPR=11, WARUM=12)
KOPF = {'NR': 'Nr', 'AUSF': 'Ausführen', 'AKTION': 'Aktion', 'REGEL': 'Regel (im Zielpostfach)',
        'NEU': 'Neuer Name / Position / Wert', 'VORSCHAU': 'Vorschau', 'ERGEBNIS': 'Ergebnis',
        'VER': 'Ordner: Verschieben-Ziel', 'KOP': 'Ordner: Kopieren-Ziel', 'QUELLE': 'Quelle (Regel im Quellpostfach)',
        'UEBERSPR': 'Überspringen: nicht auflösbare Absender', 'WARUM': 'Warum'}
BREITEN = [2.5, 5, 9, 17, 31, 32, 40, 34, 34, 30, 30, 26, 46]
LEERZEILEN = 6
LABEL = {'ZIEL': 'Zielpostfach (wird geändert)', 'QUELLE': 'Quellpostfach (Regeln nur gelesen)',
         'TROTZ': 'Trotz nicht lesbarer Bedingungen speichern (Sicherung als .rwz vorhanden)'}

LIVE_KOPF = ['Postfach', 'Platz', 'Regel', 'Aktiv', 'Nur lokal', 'Bedingungen (sichtbar)', 'Ausnahmen (sichtbar)',
             'Aktionen', 'Verschieben nach', 'Kopieren nach', 'Bedingungs-einträge', 'Condition-Types (aktiv)',
             'Lesbar', 'Diagnose']
LIVE_BREITEN = [26, 6, 40, 7, 8, 44, 30, 56, 40, 40, 10, 12, 8, 44]
SICH_KOPF = ['Zeitpunkt', 'Postfach', 'Platz', 'Regel', 'Aktiv', 'Nur lokal', 'Bedingungen (sichtbar)',
             'Ausnahmen (sichtbar)', 'Aktionen', 'Verschieben nach', 'Kopieren nach', 'Lesbar']
SICH_BREITEN = [16, 26, 6, 40, 7, 8, 44, 30, 56, 40, 40, 8]
PROT_KOPF = ['Zeitpunkt', 'Lauf', 'Postfach', 'Zeile', 'Aktion', 'Regel', 'Meldung']
PROT_BREITEN = [16, 24, 30, 6, 30, 40, 100]

KNOPF_SHAPES = []

# ------------------------------------------------------------------ Blatt Ordner (Plan 3.0)
OAKTIONEN = ['ORDNER_ANLEGEN', 'ORDNER_VERSCHIEBEN', 'ORDNER_UMBENENNEN']
OSP = dict(NR=1, AUSF=2, PF=3, AKTION=4, HEUTE=5, NEU=6, VORSCHAU=7, ERGEBNIS=8, REGELN=9, WARUM=10)
OKOPF = {'NR': 'Nr', 'AUSF': 'Ausführen', 'PF': 'Postfach', 'AKTION': 'Aktion', 'HEUTE': 'Pfad heute',
         'NEU': 'Pfad neu', 'VORSCHAU': 'Vorschau', 'ERGEBNIS': 'Ergebnis',
         'REGELN': 'Regeln mit Ziel in diesem Ordner (Pfad danach)', 'WARUM': 'Warum'}
OBREITEN = [2.5, 5, 9, 30, 22, 36, 40, 40, 34, 46, 40]
OLEERZEILEN = 6
OAKTION_TEXT = [
    ('ORDNER_ANLEGEN', 'Pfad neu', 'Legt einen Ordner an. Der Elternordner muss da sein oder von einer Zeile weiter oben '
                                   'kommen. Gibt es den Ordner schon: schon erledigt.'),
    ('ORDNER_VERSCHIEBEN', 'Pfad heute, Pfad neu', 'Verschiebt den Ordner samt Unterordnern und Inhalt in einen anderen '
                       'Ordner desselben Postfachs (Outlook „Ordner verschieben“) und gibt ihm, falls „Pfad neu“ anders '
                       'endet, den neuen Namen. Quelle weg und Ziel da: schon erledigt. Quelle und Ziel da: blockiert '
                       '(Namenskonflikt, nichts wird zusammengeführt).'),
    ('ORDNER_UMBENENNEN', 'Pfad heute, Pfad neu', 'Benennt den Ordner um; er bleibt, wo er ist (gleicher Elternordner).'),
]
OSICH_KOPF = ['Zeitpunkt', 'Lauf', 'Folge', 'Art', 'Postfach', 'Planzeile', 'Pfad vorher', 'Pfad nachher', 'Regel',
              'EntryID', 'Stand']
OSICH_SCHL = ['ZEIT', 'LAUF', 'FOLGE', 'ART', 'PF', 'NR', 'VOR', 'NACH', 'REGEL', 'EID', 'STAND']
OSICH_BREITEN = [16, 24, 7, 16, 28, 9, 50, 50, 36, 30, 26]
GRUPPEN = ['01) Automatische Antworten', '02) Erinnerungen Pools', '03) BeMaS - eBIS', '04) Neuzugänge',
           '05) Weiterleitungen', '06) Technische Fehler']
# Bewusst nicht im Plan (Bot-Zugriff ueber den Pfad moeglich bzw. Posteingang)
ONICHT = {'Bestandsuebertragungen': ['Archiv\\Archiv: Vorabinfo (mit „Entwurf aus BOT Postf.“)', 'BÜ-Bot-Mails',
                                     'Posteingang und Unterordner', 'alle übrigen Ordner der obersten Ebene'],
          'Maklerauftraege': ['Archiv\\Archiv zu den weitergeleiteten Mails an KWAD (enthält XLS-Dateien – evtl. Bot)',
                              'Posteingang und Unterordner (KI-Vorblatt, Prio, Vorlagen)', 'Postausgang\\Livelink Retrieve',
                              'Rückläufer FL Verträge (ODPB3D) samt BÜ-Bot Mails', 'alle übrigen Ordner der obersten Ebene']}


def ordner_plan(g):
    """Plan 3.0 (vom Nutzer bestaetigt): Gruppenordner im Archiv beider Postfaecher, Umzuege, Umbenennungen.
    Ordnernamen genau wie in Outlook (Screenshots des Nutzers). Warum nennt die Regeln laut Export, die heute in den
    Ordner (oder einen Unterordner) verschieben bzw. kopieren."""
    BES, MAK, REGEL = g['BES'], g['MAK'], g['REGEL']

    def norm(p):
        return p.replace('%2F', '/').lower().rstrip('\\')

    def regeln_fuer(pf, rel):
        voll = norm('\\\\%s\\%s' % (pf, rel))
        treffer = []
        for r in sorted(REGEL.values(), key=lambda x: (x['postfach'] != pf, x['reihe'])):
            for b, d in r['akt']:
                if b in ('In Ordner verschieben', 'In Ordner kopieren') and d and (norm(d) == voll or norm(d).startswith(voll + '\\')):
                    treffer.append('„%s“%s' % (r['name'], '' if r['postfach'] == pf else ' (%s)' % r['postfach'].split('@')[0]))
                    break
        if not treffer:
            return ' Laut Export zeigt keine Regel dorthin.'
        if len(treffer) == 1:
            return ' Ziel der Regel %s – sie zeigt danach auf den neuen Pfad.' % treffer[0]
        return ' Ziel von %d Regeln (%s) – sie zeigen danach auf den neuen Pfad.' % (len(treffer), ', '.join(treffer))

    P = []

    def anlegen(pf):
        for gr in GRUPPEN:
            P.append(dict(pf=pf, aktion='ORDNER_ANLEGEN', heute='', neu='Archiv\\' + gr,
                          warum='Gruppenordner im Archiv; die Nummer hält die Reihenfolge in Outlook fest.'))

    def schieben(pf, heute, gruppe, name=None, grund='', zusatz=''):
        alt = heute.split('\\')[-1]
        name = name or alt
        w = 'Gruppe „%s“.' % GRUPPEN[gruppe - 1] + zusatz
        if heute.count('\\') == 0:
            w += ' Bisher auf der obersten Ebene.'
        if name != alt:
            w += ' ' + (grund or 'Name vereinheitlicht (bisher „%s“).' % alt)
        P.append(dict(pf=pf, aktion='ORDNER_VERSCHIEBEN', heute=heute, neu='Archiv\\%s\\%s' % (GRUPPEN[gruppe - 1], name),
                      warum=w + regeln_fuer(pf, heute)))

    def umbenennen(pf, eltern, alt, neu, grund):
        P.append(dict(pf=pf, aktion='ORDNER_UMBENENNEN', heute=eltern + '\\' + alt, neu=eltern + '\\' + neu,
                      warum=grund + regeln_fuer(pf, eltern + '\\' + alt)))

    # Bestandsuebertragungen
    anlegen(BES)
    schieben(BES, 'Archiv\\Automatische Antworten', 1)
    schieben(BES, 'Archiv\\No Reply Mails etc.', 1, 'No-Reply-Mails')
    schieben(BES, 'Archiv\\Erinnerung JungDMS', 2, 'Erinnerungen JungDMS', 'Name wie die übrigen Erinnerungen (bisher „Erinnerung JungDMS“).')
    schieben(BES, 'Archiv\\Erinnerungen Fonds Finanz', 2)
    schieben(BES, 'Archiv\\Erinnerungen Qualitypool', 2)
    schieben(BES, 'Archiv\\Archiv: BeMaS-Kennzeichen konnte nicht gesetzt werden', 3, 'BeMaS-Kennzeichen konnte nicht gesetzt werden',
             '„Archiv:“ entfällt – der Ordner liegt ja im Archiv.')
    schieben(BES, 'Archiv\\Archiv: BeMaS an KWAD', 3, 'BeMaS an KWAD', '„Archiv:“ entfällt – der Ordner liegt ja im Archiv.')
    schieben(BES, 'Archiv\\Archiv: Dopplung der Neuzugänge', 4, 'Dopplung der Neuzugänge', '„Archiv:“ entfällt – der Ordner liegt ja im Archiv.')
    schieben(BES, 'Archiv\\Archiv: Weitergeleiteten Mails zu FL an VSLV3', 5, 'Weitergeleitete Mails an VSLV3 (FL)',
             'Name vereinheitlicht (bisher „Archiv: Weitergeleiteten Mails zu FL an VSLV3“).')
    schieben(BES, 'Archiv\\Archiv: Weiterleitung an KWAD', 5, 'Weiterleitung an KWAD',
             '„Archiv:“ entfällt; die Unterordner (Meldung andere Vorgänge, Meldung DEMA Vorgänge) ziehen mit.')
    schieben(BES, 'BÜ-Archiv: Weitergeleiteten Mails an Celonis', 5, 'Weitergeleitete Mails an Celonis',
             'Name vereinheitlicht (bisher „BÜ-Archiv: Weitergeleiteten Mails an Celonis“).')
    schieben(BES, 'Umleitung - Technischer Fehler', 6)
    namen = ['Abbas', 'Gran', 'Haverkamp', 'Holz', 'Mathes', 'Nass-Kluske', 'Sprute', 'Strehl', 'Trappen', 'Witt']
    for i, n in enumerate(namen, 1):
        umbenennen(BES, 'Rückläufer EPL und FL Verträge', n, '%02d) %s' % (i, n),
                   'Nummeriert – Reihenfolge wie bisher.' + (' Die Unterordner bleiben.' if n == 'Nass-Kluske' else ''))
    umbenennen(BES, 'UBR', 'Witt', '01) Witt', 'Nummeriert wie die Rückläufer-Ordner.')
    # Maklerauftraege
    anlegen(MAK)
    schieben(MAK, 'Archiv\\Auotmatische Antworten', 1, 'Automatische Antworten', 'Tippfehler im Namen korrigiert (bisher „Auotmatische Antworten“).')
    schieben(MAK, 'Nachricht nicht zustellbar (Archiv)', 1, 'Nachricht nicht zustellbar', '„(Archiv)“ entfällt – der Ordner liegt jetzt im Archiv.')
    schieben(MAK, 'Archiv\\Erinnerung JungDMS', 2, 'Erinnerungen JungDMS', 'Name wie die übrigen Erinnerungen (bisher „Erinnerung JungDMS“).')
    schieben(MAK, 'Archiv\\Erinnerungen Fonds Finanz', 2)
    schieben(MAK, 'Archiv\\Erinnerungen Qualitypool', 2)
    schieben(MAK, 'Archiv\\KV Qualitypool', 2)
    schieben(MAK, 'Archiv\\BeMaS an KWAD', 3)
    schieben(MAK, 'Archiv\\EBIS / BeMAs', 3, zusatz=' Alle Unterordner ziehen mit.')
    schieben(MAK, 'Archiv\\Archiv zu den Neuzugängen im Postfach', 4, 'Neuzugänge im Postfach',
             'Name gekürzt (bisher „Archiv zu den Neuzugängen im Postfach“); die Unterordner ziehen mit.')
    schieben(MAK, 'Archiv\\Archiv zu den weitergeleiteten Mails an Celonis', 5, 'Weitergeleitete Mails an Celonis',
             'Name vereinheitlicht (bisher „Archiv zu den weitergeleiteten Mails an Celonis“).')
    schieben(MAK, 'Archiv\\Teil/Gesamt-BÜ nicht an KWAD sondern an Verwaltung', 5)
    schieben(MAK, 'Archiv\\Umleitung - Technische Fehler', 6)
    for i, p in enumerate(P):
        p['nr'] = i + 1
        p['ausf'] = 'Ja'
    return P


def ordner_blatt(g, ws, P):
    """Blatt Ordner: Schritte mit Knoepfen, Stand, Plan, Aktionen, Hinweise. Zellen mit Namen (UO_*)."""
    F, kopf_fmt, zelle_fmt, zeilen, zeilenhoehe, druck = (g[k] for k in ('F', 'kopf_fmt', 'zelle_fmt', 'zeilen',
                                                                          'zeilenhoehe', 'druck'))
    wb = g['wb']
    INK, MUTED, TILE, LINE = g['INK'], g['MUTED'], g['TILE'], g['LINE']
    ROT, ROTD, ROTL, TEALD, TEALL, GRUEN, GRUENL = g['ROT'], g['ROTD'], g['ROTL'], g['TEALD'], g['TEALL'], g['GRUEN'], g['GRUENL']
    GELBD, GELBL, GRAUD, GRAUL, FONT_TITEL = g['GELBD'], g['GELBL'], g['GRAUD'], g['GRAUL'], g['FONT_TITEL']
    ORANGED, ORANGEL, CF, BES, MAK = g['ORANGED'], g['ORANGEL'], g['CF'], g['BES'], g['MAK']
    L = {}
    blatt = "'%s'" % ws.name

    def name_setzen(name, r, c, r2=None, c2=None):
        ref = '%s!%s' % (blatt, xl_rowcol_to_cell(r, c, True, True))
        if r2 is not None:
            ref += ':' + xl_rowcol_to_cell(r2, c2, True, True)
        wb.define_name(name, '=' + ref)

    ws.hide_gridlines(2)
    ws.set_tab_color(g['TEAL'])
    for i, b in enumerate(OBREITEN):
        ws.set_column(i, i, b)
    ws.set_row(0, 8)
    ws.write(1, 1, 'Ordner umstellen', F(font_name=FONT_TITEL, font_size=20, bold=True, valign='bottom'))
    ws.set_row(1, 32)
    ws.write(2, 1, 'Das Makro ordnet die Archiv-Ordner beider Postfächer in nummerierte Gruppen – verschieben und '
                   'umbenennen, nie löschen. Regeln ändert es nicht; sie zeigen auf den Ordner selbst und folgen ihm.',
             F(font_color=MUTED))
    ws.set_row(2, 18)
    ws.set_row(3, 6)
    schritte = [
        ('1', 'Vorschau',
         'Liest die Ordner und alle Regeln beider Postfächer und spielt den Plan Zeile für Zeile durch: bereit, schon '
         'erledigt oder blockiert mit Grund (ein abweichender Name wird nie geraten – die Zeile nennt ähnliche Namen). '
         'Spalte J zeigt, welche Regeln heute in den Ordner verschieben oder kopieren und wohin sie danach zeigen. '
         'Schreibt nichts nach Outlook.',
         ('Vorschau', 'modOrdner.OrdnerVorschau', 'primaer', 'OVorschau')),
        ('2', 'Ausführen',
         'Nur nach einer Vorschau ohne Blocker und mit unverändertem Plan. Fragt nach, schreibt Ordnerliste und Regelziele '
         'beider Postfächer ins Blatt Ordner-Sicherung, legt an, verschiebt und benennt um – in Planreihenfolge, bei einem '
         'Fehler sofort Stopp mit Liste, was schon umgezogen ist. Danach prüft es alle Regeln beider Postfächer.',
         ('Ausführen …', 'modOrdner.OrdnerAusfuehren', 'ausfuehren', 'OAusfuehren')),
        ('3', 'Regeln prüfen',
         'Liest alle Regeln beider Postfächer: Zeigt jede Aktion „In Ordner verschieben/kopieren“ auf einen vorhandenen '
         'Ordner? Nur lesen – jederzeit möglich, auch Tage später.',
         ('Regeln prüfen', 'modOrdner.OrdnerRegelnPruefen', 'hell', 'ORegeln')),
        ('4', 'Ordner zurück',
         'Nimmt die im Blatt Ordner-Sicherung protokollierten Umzüge und Umbenennungen in umgekehrter Reihenfolge zurück '
         '(mit Rückfrage) und prüft danach die Regeln. Angelegte Gruppenordner bleiben stehen; die Meldung nennt sie.',
         ('Ordner zurück …', 'modOrdner.OrdnerZurueck', 'hell', 'OZurueck')),
    ]
    tile = dict(bg_color=TILE)
    txt_breite = sum(OBREITEN[4:9]) - 2
    for i, (nr, kopf, text, (btxt, makro, art, name)) in enumerate(schritte):
        r = 4 + i
        ws.write(r, 1, nr, F(font_name=FONT_TITEL, font_size=16, bold=True, font_color=ROT, align='center', **tile))
        ws.merge_range(r, 2, r, 3, None, F(**tile))
        ws.merge_range(r, 4, r, 8, None, F(font_color=INK, font_size=9.5, text_wrap=True, indent=1, **tile))
        ws.write_rich_string(r, 4, F(bold=True, font_size=10, font_color=INK, **tile), kopf + ' – ',
                             F(font_size=9.5, font_color=INK, **tile), text,
                             F(font_color=INK, font_size=9.5, text_wrap=True, indent=1, **tile))
        h = max(38, zeilenhoehe(zeilen(kopf + ' – ' + text, txt_breite, pt=9.5), pt=9.5, polster=8))
        ws.set_row(r, h)
        knopf(ws, r, 2, 6, int((h * 96 / 72 - 30) / 2), 186, 30, btxt, makro, art, g, name)
    ws.set_row(8, 8)
    lab = F(bold=True, font_size=9.5, text_wrap=True, indent=1, bottom=1, bottom_color=LINE)
    ws.merge_range(9, 1, 9, 3, 'Stand Ordner und Regeln', lab)
    ws.merge_range(9, 4, 9, 8, 'noch nicht gelesen – Knopf „Vorschau“ oder „Regeln prüfen“',
                   F(bold=True, indent=1, text_wrap=True, num_format='@', bg_color=GRAUL, font_color=GRAUD, valign='top'))
    ws.set_row(9, 46)
    name_setzen('UO_STATUS', 9, 4)
    for kriterium, (bg, fg) in (('Achtung', (ROTL, ROTD)), ('Vorschau nicht', (ROTL, ROTD)), ('Abgebrochen', (ROTL, ROTD)),
                                ('Prüfung nicht', (ROTL, ROTD)), ('Vorschau', (TEALL, TEALD)), ('Regeln geprüft', (GRUENL, GRUEN))):
        ws.conditional_format(9, 4, 9, 8, {'type': 'text', 'criteria': 'begins with', 'value': kriterium,
                                           'format': CF(bg_color=bg, font_color=fg, bold=True)})
    ws.merge_range(10, 1, 10, 3, 'Letzte Vorschau · Prüfwert des Plans', lab)
    ws.write_string(10, 4, '', F(indent=1, num_format='@', bottom=1, bottom_color=LINE))
    ws.write_string(10, 5, '', F(indent=1, num_format='@', font_color=MUTED, bottom=1, bottom_color=LINE))
    ws.write(10, 6, 'Letzte Ausführung', F(bold=True, font_size=9.5, align='right', indent=1, bottom=1, bottom_color=LINE))
    ws.write_string(10, 7, '', F(indent=1, num_format='@', bottom=1, bottom_color=LINE))
    ws.set_row(10, 22)
    name_setzen('UO_VORSCHAU_ZEIT', 10, 4)
    name_setzen('UO_PRUEFWERT', 10, 5)
    name_setzen('UO_AUSF_ZEIT', 10, 7)
    ws.set_row(11, 10)
    ws.write(12, 1, 'Plan', F(font_name=FONT_TITEL, font_size=13, bold=True, valign='bottom'))
    ws.write(12, 4, 'Von oben nach unten; jede Zeile sieht den Stand nach den Zeilen darüber. Pfade ohne Postfach '
                    '(„Archiv\\…“) gelten im Postfach der Zeile. Ändert sich der Plan nach der Vorschau, ist vor '
                    '„Ausführen“ eine neue Vorschau nötig.', F(font_color=MUTED, font_size=9.5, valign='bottom'))
    ws.set_row(12, 24)
    kz = 13
    for schl, c in OSP.items():
        ws.write(kz, c, OKOPF[schl], kopf_fmt('center' if schl in ('NR', 'AUSF') else 'left'))
    ws.set_row(kz, 30)
    erste = kz + 1
    letzte = erste + len(P) + OLEERZEILEN - 1
    for i in range(len(P) + OLEERZEILEN):
        r = erste + i
        p = P[i] if i < len(P) else None
        txt = lambda k: (p.get(k, '') if p else '')
        ws.write(r, OSP['NR'], p['nr'] if p else '', zelle_fmt('center', font_color=MUTED, valign='top'))
        ws.write_string(r, OSP['AUSF'], txt('ausf'), zelle_fmt('center', bold=True, valign='top', num_format='@'))
        ws.write_string(r, OSP['PF'], txt('pf'), zelle_fmt(wrap=True, valign='top', num_format='@', font_size=8.5))
        ws.write_string(r, OSP['AKTION'], txt('aktion'), zelle_fmt(wrap=True, bold=True, valign='top', font_size=8.5,
                                                                   num_format='@'))
        for k in ('HEUTE', 'NEU'):
            ws.write_string(r, OSP[k], txt(k.lower()), zelle_fmt(wrap=True, valign='top', num_format='@', font_size=9.5,
                                                                 bold=(k == 'NEU')))
        ws.write_string(r, OSP['WARUM'], txt('warum'), zelle_fmt(wrap=True, valign='top', font_color=MUTED, font_size=9))
        for k in ('VORSCHAU', 'ERGEBNIS', 'REGELN'):
            ws.write_string(r, OSP[k], '', zelle_fmt(wrap=True, valign='top', num_format='@', font_size=9))
        if p:
            n = max(zeilen(txt('heute'), OBREITEN[OSP['HEUTE']], pt=9.5), zeilen(txt('neu'), OBREITEN[OSP['NEU']], pt=9.5, fett=True),
                    zeilen(txt('warum'), OBREITEN[OSP['WARUM']], pt=9), zeilen(txt('aktion'), OBREITEN[OSP['AKTION']], pt=8.5, fett=True), 2)
            ws.set_row(r, zeilenhoehe(n, pt=9.5, polster=10))
        else:
            ws.set_row(r, 24)
    name_setzen('UO_PLANKOPF', kz, OSP['NR'], kz, OSP['WARUM'])
    name_setzen('UO_PLAN', erste, OSP['NR'], letzte, OSP['WARUM'])
    ws.data_validation(erste, OSP['AUSF'], letzte, OSP['AUSF'], {'validate': 'list', 'source': ['Ja', 'Nein']})
    ws.data_validation(erste, OSP['AKTION'], letzte, OSP['AKTION'], {'validate': 'list', 'source': OAKTIONEN,
                                                                     'error_message': 'Bitte eine Aktion aus der Liste.'})
    ws.data_validation(erste, OSP['PF'], letzte, OSP['PF'], {'validate': 'list', 'source': [BES, MAK],
                                                             'error_type': 'warning'})
    ws.conditional_format(erste, OSP['AUSF'], letzte, OSP['AUSF'], {'type': 'cell', 'criteria': '==', 'value': '"Ja"',
                                                                    'format': CF(bg_color=GRUENL, font_color=GRUEN)})
    ws.conditional_format(erste, OSP['AUSF'], letzte, OSP['AUSF'], {'type': 'cell', 'criteria': '==', 'value': '"Nein"',
                                                                    'format': CF(bg_color=GRAUL, font_color=GRAUD)})
    pills = [('blockiert', ROTL, ROTD), ('nicht ausgeführt', ROTL, ROTD), ('ausgeführt, Prüfung', ROTL, ROTD),
             ('erledigt (geprüft) · Achtung', ORANGEL, ORANGED), ('bereit', TEALL, TEALD),
             ('erledigt (geprüft)', GRUENL, GRUEN), ('zurückgenommen', GELBL, GELBD),
             ('schon erledigt', '#EEF6F0', GRUEN), ('nicht ausgewählt', GRAUL, GRAUD)]
    for wert, bg, fg in pills:
        ws.conditional_format(erste, OSP['VORSCHAU'], letzte, OSP['ERGEBNIS'],
                              {'type': 'text', 'criteria': 'begins with', 'value': wert,
                               'format': CF(bg_color=bg, font_color=fg, bold=True)})
    ausf = xl_col_to_name(OSP['AUSF'])
    for c1, c2 in ((OSP['NR'], OSP['NEU']), (OSP['REGELN'], OSP['WARUM'])):
        ws.conditional_format(erste, c1, letzte, c2, {'type': 'formula', 'criteria': '=$%s%d="Nein"' % (ausf, erste + 1),
                                                      'format': CF(font_color='#9AA3AD')})
    # Aktionen
    r = letzte + 2
    ws.write(r, 1, 'Aktionen', F(font_name=FONT_TITEL, font_size=13, bold=True, valign='bottom'))
    ws.set_row(r, 26)
    r += 1
    ws.merge_range(r, 1, r, 4, 'Aktion', kopf_fmt())
    ws.write(r, 5, 'Spalten', kopf_fmt())
    ws.merge_range(r, 6, r, OSP['WARUM'], 'Was das Makro tut', kopf_fmt())
    ws.set_row(r, 24)
    for akt, spalten, text in OAKTION_TEXT:
        r += 1
        ws.merge_range(r, 1, r, 4, akt, zelle_fmt(bold=True, font_size=8.5, wrap=True))
        ws.write(r, 5, spalten, zelle_fmt(font_color=MUTED, font_size=9, wrap=True))
        ws.merge_range(r, 6, r, OSP['WARUM'], text, zelle_fmt(wrap=True, font_size=9))
        ws.set_row(r, zeilenhoehe(zeilen(text, sum(OBREITEN[6:OSP['WARUM'] + 1]) - 2, pt=9), pt=9))
    r += 2
    nicht = '; '.join('%s: %s' % (k, ', '.join(v)) for k, v in ONICHT.items())
    hinweise = [
        ('Bewusst nicht im Plan', GELBL, GELBD,
         'Diese Ordner bleiben, wo sie sind – ein Bot greift womöglich über den Pfad zu: %s.' % nicht),
        ('Regeln', TILE, INK,
         'Outlook merkt sich in einer Regel den Zielordner selbst (EntryID), nicht seinen Pfad. Nach dem Verschieben '
         'zeigt die Regel deshalb ohne Speichern auf den neuen Pfad – das Makro speichert keine Regeln, in keinem der '
         'beiden Postfächer (Maklerauftraege: Regeln nur gelesen, Ordner werden hier umgestellt). Nach dem Ausführen '
         'liest es alle Regeln beider Postfächer neu: Jede Aktion „In Ordner verschieben/kopieren“ muss auf einen '
         'vorhandenen Ordner zeigen, die betroffenen auf den neuen Pfad; Abweichungen stehen im Stand, in der Meldung, in '
         'der Spalte Ergebnis und im Protokoll. Das Blatt Umsetzung kennt die Umzüge: Ein dort genannter alter Pfad gilt '
         'als der neue, sobald dieses Blatt den Ordner umgestellt hat.'),
        ('Ablauf', TILE, INK,
         'Blockiert eine ausgewählte Zeile, führt das Makro nichts aus. Gelöscht wird nie etwas. Vor dem ersten Schritt '
         'kommen Ordnerliste und Regelziele beider Postfächer ins Blatt Ordner-Sicherung, jeder ausgeführte Schritt '
         '(angelegt, verschoben, umbenannt) sofort danach. Ein Fehler stoppt den Lauf; die Meldung nennt, was schon '
         'umgezogen ist, und die Regeln werden trotzdem geprüft. „Ordner zurück“ macht die Umzüge und Umbenennungen '
         'rückwärts rückgängig; angelegte Gruppenordner bleiben stehen (leer).'),
    ]
    for kopf, bg, fg, text in hinweise:
        ws.merge_range(r, 1, r, 4, kopf, F(bold=True, font_size=9.5, bg_color=bg, font_color=fg, indent=1, valign='top'))
        ws.merge_range(r, 5, r, OSP['WARUM'], text, F(font_size=9.5, bg_color=bg, font_color=fg, text_wrap=True,
                                                      indent=1, valign='top'))
        ws.set_row(r, zeilenhoehe(zeilen(text, sum(OBREITEN[5:OSP['WARUM'] + 1]) - 2, pt=9.5), pt=9.5, polster=10))
        r += 1
    druck(ws, (kz, kz))
    ws.print_area(0, 0, r, OSP['WARUM'])
    L['O_PLAN_ERSTE'] = erste + 1
    return L


# ------------------------------------------------------------------ Plan
def plan_ableiten(g):
    """Plan v2 aus den Daten der Auswertung (gleiche Quellen wie das Blatt Anlegen)."""
    q, b_pfad, pfad_teile, bed_text, bed_det = g['q'], g['b_pfad'], g['pfad_teile'], g['bed_text'], g['bed_det']
    ordner_von, empf_kurz = g['ordner_von'], g['empf_kurz']
    B_AA, B_AA2, M_AA, M_AA2 = g['B_AA'], g['B_AA2'], g['M_AA'], g['M_AA2']
    M_ESK, B_PRIO, M_PRIO, B_KVS, M_KVS = g['M_ESK'], g['B_PRIO'], g['M_PRIO'], g['B_KVS'], g['M_KVS']
    B_FL, B_EKWAD, M_EKWAD, M_ERINN = g['B_FL'], g['B_EKWAD'], g['M_EKWAD'], g['M_ERINN']
    aa_ziel, prio, prio_fehlend = g['aa_ziel'], g['prio_ordner'], g['prio_fehlend']
    alt_pf, alt_rel = pfad_teile(ordner_von(B_AA))
    weiter_an = ', '.join(d for b, d in B_KVS['akt'] if b == 'Weiterleiten an')

    def aus_kurz(r):
        return '; '.join('%s %s' % (b, empf_kurz(d) if b in ('Absender ist', 'Gesendet an') else d) if d else b
                         for b, d in r['aus']) or 'keine'

    P = []
    P.append(dict(aktion='ZIELORDNER', regel=B_AA['name'], ver=aa_ziel,
                  warum='Ziel liegt im Postfach %s (%s) – beim Kopieren nicht umgestellt. Neuer Ordner %s wird angelegt '
                        '(richtig geschrieben; bei Makler heißt er „%s“).'
                        % (alt_pf.split('@')[0], alt_rel, g['AA_ORDNER_REL'], alt_rel.split('\\')[-1])))
    P.append(dict(aktion='UMBENENNEN', regel=B_AA['name'], neu=M_AA['name'],
                  warum='„Kopie von“ streichen – heißt dann wie Makler #%d. Bedingung ist schon identisch (%s).'
                        % (M_AA['reihe'], bed_text(B_AA['bed']))))
    P.append(dict(aktion='KOPIEREN', regel=M_AA2['name'], quelle=M_AA2['name'], ver=aa_ziel,
                  warum='Fehlt in Bestand. Makler #%d: %s. Zeigt Outlook die Bedingung nicht, meldet die Vorschau, wie '
                        'die Regel einmal in Outlook zu kopieren ist.' % (M_AA2['reihe'], bed_text(M_AA2['bed']))))
    P.append(dict(aktion='POSITION', regel=M_AA2['name'], neu='nach: ' + M_AA['name'],
                  warum='Wie bei Makler: #%d direkt hinter #%d.' % (M_AA2['reihe'], M_AA['reihe'])))
    P.append(dict(aktion='POSITION', regel=B_AA2['name'], neu='nach: %s || %s' % (M_AA2['name'], M_AA['name']),
                  warum='Regel bleibt (eigene Bedingung, Ziel unverändert) – nur direkt dahinter. Ausweich-Bezug: '
                        'fehlt %s (Zeilen 3/4 auf Nein), direkt hinter %s.' % (q(M_AA2['name']), q(M_AA['name']))))
    P.append(dict(aktion='KOPIEREN', regel=M_ESK['name'], quelle=M_ESK['name'], ver=prio['In Ordner verschieben'],
                  kop=prio['In Ordner kopieren'],
                  warum='Makler-Regel #%d (%s). Ziele wie Bestand #%d %s.'
                        % (M_ESK['reihe'], bed_text(M_ESK['bed']), B_PRIO['reihe'], q(B_PRIO['name']))))
    P.append(dict(aktion='POSITION', regel=M_ESK['name'], neu='vor: ' + B_PRIO['name'],
                  warum='Wie bei Makler: direkt vor %s.' % q(B_PRIO['name'])))
    P.append(dict(aktion='BEDINGUNG_WORT_ERGAENZEN', regel=B_PRIO['name'],
                  neu='Betreff enthält: ' + ', '.join('"%s"' % w for w in prio_fehlend),
                  warum='Makler #%d prüft im Betreff zusätzlich %s. Vorhandene Wörter (%s) bleiben.'
                        % (M_PRIO['reihe'], ', '.join(q(w) for w in prio_fehlend), bed_det(B_PRIO, 'Betreff enthält'))))
    P.append(dict(aktion='UMLEITEN_STATT_WEITERLEITEN', regel=B_KVS['name'],
                  warum='Bestand leitet an %s weiter, Makler leitet um – wie Bestand #%d %s. Umleiten behält den '
                        'ursprünglichen Absender.' % (weiter_an, B_EKWAD['reihe'], q(B_EKWAD['name']))))
    P.append(dict(aktion='AUSNAHMEN_UEBERNEHMEN', regel=B_KVS['name'], quelle=M_KVS['name'],
                  warum='Makler #%d schließt aus: %s. Bestand bisher: %s. Nur fehlende Einträge werden ergänzt.'
                        % (M_KVS['reihe'], aus_kurz(M_KVS), aus_kurz(B_KVS))))
    P.append(dict(aktion='AUSNAHMEN_UEBERNEHMEN', regel=B_EKWAD['name'], quelle=M_EKWAD['name'],
                  warum='Makler #%d schließt aus: %s. Bestand bisher: %s (Regel ohne Bedingung – leitet alle übrigen '
                        'Mails an KWAD um).' % (M_EKWAD['reihe'], aus_kurz(M_EKWAD), aus_kurz(B_EKWAD))))
    vorher = [B_FL['name']]
    for e in M_ERINN:
        rel = pfad_teile(ordner_von(e))[1]
        P.append(dict(ausf='Nein', aktion='KOPIEREN', regel=e['name'], quelle=e['name'], ver=b_pfad(rel),
                      neu='nach: ' + ' || '.join(reversed(vorher)),
                      warum='Nur nötig, wenn diese Erinnerungen auch in Bestand eingehen. Ordner wird bei Bedarf '
                            'angelegt; Position wie bei Makler (#%d).' % e['reihe']))
        vorher.append(e['name'])
    for i, p in enumerate(P):
        p['nr'] = i + 1
        p.setdefault('ausf', 'Ja')
        for k in ('neu', 'ver', 'kop', 'quelle', 'ueberspr'):
            p.setdefault(k, '')
    return P


# ------------------------------------------------------------------ Knoepfe (Formen mit Makro)
def knopf(ws, zeile, spalte, x, y, b, h, text, makro, art, g, name):
    farben = {'primaer': (g['TEAL'], None, g['WEISS']), 'ausfuehren': (g['ROT'], None, g['WEISS']),
              'hell': (g['WEISS'], g['LINE2'], g['INK'])}
    fill, linie, schrift = farben[art]
    o = {'x_offset': x, 'y_offset': y, 'width': b, 'height': h, 'object_position': 3,
         'fill': {'color': fill}, 'line': {'none': True} if not linie else {'color': linie, 'width': 1},
         'font': {'name': g['FONT'], 'size': 10, 'bold': True, 'color': schrift},
         'align': {'vertical': 'middle', 'horizontal': 'center'},
         'description': 'N=BTN_%s;M=%s' % (name, makro)}
    ws.insert_textbox(zeile, spalte, text, o)
    KNOPF_SHAPES.append((name, makro))


def formen_nachbearbeiten(xml):
    """Knopf-Formen: Name, abgerundete Ecken, Makro (OnAction) aus der Beschreibung."""
    def anker(m):
        bl = m.group(0)
        d = re.search(r'descr="(N=[^"]*)"', bl)
        if not d:
            return bl
        spec = dict(teil.split('=', 1) for teil in d.group(1).split(';'))
        bl = bl.replace(' descr="%s"' % d.group(1), '', 1)
        bl = re.sub(r'(<xdr:cNvPr id="\d+" name=")[^"]*(")', lambda x: x.group(1) + spec['N'] + x.group(2), bl, count=1)
        bl = re.sub(r'<a:prstGeom prst="rect">\s*<a:avLst\s*/>',
                    '<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 22000"/></a:avLst>', bl, count=1)
        bl = bl.replace('<a:prstGeom prst="rect">', '<a:prstGeom prst="roundRect">', 1)
        bl = bl.replace('<xdr:sp macro=""', '<xdr:sp macro="[0]!%s"' % spec['M'], 1)
        return bl
    return re.sub(r'<xdr:(?:twoCellAnchor|oneCellAnchor|absoluteAnchor)[\s\S]*?</xdr:(?:twoCellAnchor|oneCellAnchor|absoluteAnchor)>',
                  anker, xml)


# ------------------------------------------------------------------ Blatt Umsetzung
def umsetzung_blatt(g, ws, P):
    F, kopf_fmt, zelle_fmt, zeilen, zeilenhoehe, druck = (g[k] for k in ('F', 'kopf_fmt', 'zelle_fmt', 'zeilen',
                                                                          'zeilenhoehe', 'druck'))
    wb = g['wb']
    INK, MUTED, TILE, WEISS, LINE = g['INK'], g['MUTED'], g['TILE'], g['WEISS'], g['LINE']
    ROT, ROTD, ROTL, TEALD, TEALL, GRUEN, GRUENL = g['ROT'], g['ROTD'], g['ROTL'], g['TEALD'], g['TEALL'], g['GRUEN'], g['GRUENL']
    GELBD, GELBL, GRAUD, GRAUL, FONT_TITEL = g['GELBD'], g['GELBL'], g['GRAUD'], g['GRAUL'], g['FONT_TITEL']
    ORANGED, ORANGEL = g['ORANGED'], g['ORANGEL']
    BES, MAK, CF = g['BES'], g['MAK'], g['CF']
    L = {}
    blatt = "'%s'" % ws.name

    def name_setzen(name, r, c, r2=None, c2=None):
        ref = '%s!%s' % (blatt, xl_rowcol_to_cell(r, c, True, True))
        if r2 is not None:
            ref += ':' + xl_rowcol_to_cell(r2, c2, True, True)
        wb.define_name(name, '=' + ref)
        L['NAME_' + name] = name

    ws.hide_gridlines(2)
    ws.set_tab_color(ROT)
    for i, b in enumerate(BREITEN):
        ws.set_column(i, i, b)
    ws.set_row(0, 8)
    ws.write(1, 1, 'Regeln in Outlook umsetzen', F(font_name=FONT_TITEL, font_size=20, bold=True, valign='bottom'))
    ws.set_row(1, 32)
    ws.write(2, 1, 'Das Makro passt die Regeln des Zielpostfachs nach dem Plan unten an – nach Vorbild des '
                   'Quellpostfachs. Es löscht keine Regeln und speichert die Regeln des Quellpostfachs nie (Ordner stellt '
                   'das Blatt Ordner um).', F(font_color=MUTED))
    ws.set_row(2, 18)
    ws.set_row(3, 6)

    # --- Drei Schritte: Nummer, Knopf, Erklaerung - je eine Zeile
    schritte = [
        ('1', 'Sicherung exportieren',
         'In Outlook: Datei › Regeln und Benachrichtigungen verwalten › Optionen › Regeln exportieren – oben zuerst das '
         'Zielpostfach wählen; danach den Dialog schließen. Die .rwz-Datei ist der einzige vollständige Stand zum '
         'Zurückspielen. Der Knopf zeigt den aktuellen Stand im Blatt Live (nur lesen).',
         ('Regeln aus Outlook lesen', 'modUmbau.RegelnLesen', 'hell', 'Lesen')),
        ('2', 'Vorschau',
         'Liest beide Postfächer und spielt den Plan Zeile für Zeile durch: bereit, schon erledigt oder blockiert mit '
         'Grund. Schreibt nichts nach Outlook – auch keine Ordner.',
         ('Vorschau', 'modUmbau.Vorschau', 'primaer', 'Vorschau')),
        ('3', 'Ausführen',
         'Nur nach einer Vorschau ohne Blocker und mit unverändertem Plan. Fragt nach der Sicherung, schreibt alle Regeln '
         'ins Blatt Sicherung, ändert erst im Speicher, legt fehlende Ordner an, speichert und prüft danach jede Regel.',
         ('Ausführen …', 'modUmbau.Ausfuehren', 'ausfuehren', 'Ausfuehren')),
    ]
    tile = dict(bg_color=TILE)
    txt_breite = sum(BREITEN[4:8]) - 2
    for i, (nr, kopf, text, (btxt, makro, art, name)) in enumerate(schritte):
        r = 4 + i
        ws.write(r, 1, nr, F(font_name=FONT_TITEL, font_size=16, bold=True, font_color=ROT, align='center', **tile))
        ws.merge_range(r, 2, r, 3, None, F(**tile))
        ws.merge_range(r, 4, r, 7, None, F(font_color=INK, font_size=9.5, text_wrap=True, indent=1, **tile))
        ws.write_rich_string(r, 4, F(bold=True, font_size=10, font_color=INK, **tile), kopf + ' – ',
                             F(font_size=9.5, font_color=INK, **tile), text,
                             F(font_color=INK, font_size=9.5, text_wrap=True, indent=1, **tile))
        n = zeilen(kopf + ' – ' + text, txt_breite, pt=9.5)
        h = max(38, zeilenhoehe(n, pt=9.5, polster=8))
        ws.set_row(r, h)
        hpx = h * 96 / 72
        knopf(ws, r, 2, 6, int((hpx - 30) / 2), 186, 30, btxt, makro, art, g, name)
    ws.set_row(7, 8)

    # --- Einstellungen
    ws.write(8, 1, 'Einstellungen', F(font_name=FONT_TITEL, font_size=12, bold=True, valign='bottom'))
    ws.set_row(8, 22)
    einst = [
        ('ZIEL', BES, 'Postfach, dessen Regeln das Makro ändert. Muss im Outlook-Profil eingebunden sein (im '
                      'Regel-Dialog „Posteingang [%s]“).' % BES.lower()),
        ('QUELLE', MAK, 'Vorbild für KOPIEREN und AUSNAHMEN_UEBERNEHMEN. Seine Regeln werden nur gelesen und nie '
                        'gespeichert; seine Ordner ändert nur das Blatt Ordner.'),
        ('TROTZ', 'Nein', 'Standard Nein. Nur nötig, wenn Regeln im Zielpostfach nicht lesbar sind – Begründung unter '
                          'dem Plan.'),
    ]
    lab = F(bold=True, font_size=9.5, text_wrap=True, indent=1, bottom=1, bottom_color=LINE)
    for i, (schl, wert, hinweis) in enumerate(einst):
        r = 9 + i
        ws.merge_range(r, 1, r, 3, LABEL[schl], lab)
        eing = F(bg_color='#FFF8E1', bold=True, indent=1, num_format='@', border=1, border_color='#E8D9A8')
        ws.write_string(r, 4, wert, eing)
        ws.merge_range(r, 5, r, 7, hinweis, F(font_color=MUTED, font_size=9, text_wrap=True, indent=1,
                                              bottom=1, bottom_color=LINE))
        ws.set_row(r, 38 if schl == 'TROTZ' else 24)
        name_setzen('UM_' + schl, r, 4)
    ws.data_validation(11, 4, 11, 4, {'validate': 'list', 'source': ['Nein', 'Ja'], 'input_title': 'Sperre aufheben?',
                                      'input_message': 'Ja nur, wenn die Regeln in Outlook exportiert sind (.rwz).'})
    ws.conditional_format(11, 4, 11, 4, {'type': 'cell', 'criteria': '==', 'value': '"Ja"',
                                         'format': CF(bg_color=ROTL, font_color=ROTD, bold=True)})
    # Stand
    ws.merge_range(12, 1, 12, 3, 'Stand Zielpostfach', lab)
    ws.merge_range(12, 4, 12, 7, 'noch nicht gelesen – Knopf „Vorschau“ oder „Regeln aus Outlook lesen“',
                   F(bold=True, indent=1, text_wrap=True, num_format='@', bg_color=GRAUL, font_color=GRAUD, valign='top'))
    ws.set_row(12, 34)
    name_setzen('UM_STATUS', 12, 4)
    for kriterium, (bg, fg) in (('Speichern gesperrt', (ROTL, ROTD)), ('Vorschau nicht', (ROTL, ROTD)),
                                ('Lesen nicht', (ROTL, ROTD)), ('Speichern freigegeben', (GELBL, GELBD)),
                                ('Speichern möglich mit', (ORANGEL, ORANGED)), ('Speichern möglich', (GRUENL, GRUEN))):
        ws.conditional_format(12, 4, 12, 7, {'type': 'text', 'criteria': 'begins with', 'value': kriterium,
                                             'format': CF(bg_color=bg, font_color=fg, bold=True)})
    ws.merge_range(13, 1, 13, 3, 'Letzte Vorschau · Prüfwert des Plans', lab)
    ws.write_string(13, 4, '', F(indent=1, num_format='@', bottom=1, bottom_color=LINE))
    ws.write_string(13, 5, '', F(indent=1, num_format='@', font_color=MUTED, bottom=1, bottom_color=LINE))
    ws.write(13, 6, 'Letzte Ausführung', F(bold=True, font_size=9.5, align='right', indent=1, bottom=1, bottom_color=LINE))
    ws.write_string(13, 7, '', F(indent=1, num_format='@', bottom=1, bottom_color=LINE))
    ws.set_row(13, 22)
    name_setzen('UM_VORSCHAU_ZEIT', 13, 4)
    name_setzen('UM_PRUEFWERT', 13, 5)
    name_setzen('UM_AUSF_ZEIT', 13, 7)
    ws.set_row(14, 10)

    # --- Plan
    ws.write(15, 1, 'Plan', F(font_name=FONT_TITEL, font_size=13, bold=True, valign='bottom'))
    ws.write(15, 4, 'Von oben nach unten. Ausführen = Ja/Nein je Zeile; eigene Schritte in die leeren Zeilen. Ändert sich '
                    'der Plan nach der Vorschau, ist vor „Ausführen“ eine neue Vorschau nötig.',
             F(font_color=MUTED, font_size=9.5, valign='bottom'))
    ws.set_row(15, 24)
    kz = 16
    for schl, c in SP.items():
        ws.write(kz, c, KOPF[schl], kopf_fmt('center' if schl in ('NR', 'AUSF') else 'left'))
    ws.set_row(kz, 30)
    erste = kz + 1
    letzte = erste + len(P) + LEERZEILEN - 1
    for i in range(len(P) + LEERZEILEN):
        r = erste + i
        p = P[i] if i < len(P) else None
        txt = lambda k: (p.get(k, '') if p else '')
        ws.write(r, SP['NR'], p['nr'] if p else '', zelle_fmt('center', font_color=MUTED, valign='top'))
        ws.write_string(r, SP['AUSF'], txt('ausf'), zelle_fmt('center', bold=True, valign='top', num_format='@'))
        ws.write_string(r, SP['AKTION'], txt('aktion'), zelle_fmt(wrap=True, bold=True, valign='top', font_size=8.5,
                                                                  num_format='@'))
        for k in ('REGEL', 'NEU', 'VER', 'KOP', 'QUELLE', 'UEBERSPR'):
            ws.write_string(r, SP[k], txt(k.lower()), zelle_fmt(wrap=True, valign='top', num_format='@',
                                                                bold=(k == 'REGEL'), font_size=9.5))
        ws.write_string(r, SP['WARUM'], txt('warum'), zelle_fmt(wrap=True, valign='top', font_color=MUTED, font_size=9))
        for k in ('VORSCHAU', 'ERGEBNIS'):
            ws.write_string(r, SP[k], '', zelle_fmt(wrap=True, valign='top', num_format='@', font_size=9))
        if p:
            n = max(zeilen(txt('regel'), BREITEN[SP['REGEL']], pt=9.5, fett=True),
                    zeilen(txt('neu'), BREITEN[SP['NEU']], pt=9.5), zeilen(txt('ver'), BREITEN[SP['VER']], pt=9.5),
                    zeilen(txt('kop'), BREITEN[SP['KOP']], pt=9.5), zeilen(txt('quelle'), BREITEN[SP['QUELLE']], pt=9.5),
                    zeilen(txt('warum'), BREITEN[SP['WARUM']], pt=9),
                    zeilen(txt('aktion'), BREITEN[SP['AKTION']], pt=8.5, fett=True), 3)
            ws.set_row(r, zeilenhoehe(n, pt=9.5, polster=10))
        else:
            ws.set_row(r, 24)
    name_setzen('UM_PLANKOPF', kz, SP['NR'], kz, SP['WARUM'])
    name_setzen('UM_PLAN', erste, SP['NR'], letzte, SP['WARUM'])
    L['PLAN_ERSTE'] = erste + 1
    L['PLAN_LETZTE'] = letzte + 1
    ws.data_validation(erste, SP['AUSF'], letzte, SP['AUSF'], {'validate': 'list', 'source': ['Ja', 'Nein']})
    ws.data_validation(erste, SP['AKTION'], letzte, SP['AKTION'], {'validate': 'list', 'source': AKTIONEN,
                                                                   'error_message': 'Bitte eine Aktion aus der Liste.'})
    ws.conditional_format(erste, SP['AUSF'], letzte, SP['AUSF'], {'type': 'cell', 'criteria': '==', 'value': '"Ja"',
                                                                  'format': CF(bg_color=GRUENL, font_color=GRUEN)})
    ws.conditional_format(erste, SP['AUSF'], letzte, SP['AUSF'], {'type': 'cell', 'criteria': '==', 'value': '"Nein"',
                                                                  'format': CF(bg_color=GRAUL, font_color=GRAUD)})
    pills = [('blockiert', ROTL, ROTD), ('nicht ausgeführt', ROTL, ROTD), ('gespeichert, Prüfung', ROTL, ROTD),
             ('im Speicher', GELBL, GELBD), ('erledigt (geprüft, Bedingung', GELBL, GELBD),
             ('erledigt (geprüft, ohne', ORANGEL, ORANGED),
             ('bereit', TEALL, TEALD), ('erledigt (geprüft)', GRUENL, GRUEN),
             ('schon erledigt', '#EEF6F0', GRUEN), ('nicht ausgewählt', GRAUL, GRAUD)]
    for wert, bg, fg in pills:
        ws.conditional_format(erste, SP['VORSCHAU'], letzte, SP['ERGEBNIS'],
                              {'type': 'text', 'criteria': 'begins with', 'value': wert,
                               'format': CF(bg_color=bg, font_color=fg, bold=True)})
    ausf = xl_col_to_name(SP['AUSF'])
    for c1, c2 in ((SP['NR'], SP['NEU']), (SP['VER'], SP['WARUM'])):
        ws.conditional_format(erste, c1, letzte, c2, {'type': 'formula', 'criteria': '=$%s%d="Nein"' % (ausf, erste + 1),
                                                      'format': CF(font_color='#9AA3AD')})

    # --- Aktionen
    r = letzte + 2
    ws.write(r, 1, 'Aktionen', F(font_name=FONT_TITEL, font_size=13, bold=True, valign='bottom'))
    ws.set_row(r, 26)
    r += 1
    ws.merge_range(r, 1, r, 3, 'Aktion', kopf_fmt())
    ws.write(r, 4, 'Spalten', kopf_fmt())
    ws.merge_range(r, 5, r, SP['WARUM'], 'Was das Makro tut', kopf_fmt())
    ws.set_row(r, 24)
    for akt, spalten, text in AKTION_TEXT:
        r += 1
        ws.merge_range(r, 1, r, 3, akt, zelle_fmt(bold=True, font_size=8.5, wrap=True))
        ws.write(r, 4, spalten, zelle_fmt(font_color=MUTED, font_size=9, wrap=True))
        ws.merge_range(r, 5, r, SP['WARUM'], text, zelle_fmt(wrap=True, font_size=9))
        ws.set_row(r, max(zeilenhoehe(zeilen(text, sum(BREITEN[5:SP['WARUM'] + 1]) - 2, pt=9), pt=9),
                          zeilenhoehe(zeilen(akt, sum(BREITEN[1:4]) - 2, pt=8.5, fett=True), pt=8.5)))
    r += 2
    # --- Hinweise: Sperre, Regeln ohne Bedingung, Ablauf
    n_unles = sum(1 for x in g['bes_regeln'] if x['status'] in ('nein', 'teilweise', 'unbekannt'))
    keine = [x for x in g['bes_regeln'] if x['status'] == 'keine']
    hinweise = [
        ('Warum gesperrt?', GELBL, GELBD,
         'Outlook speichert beim Sichern immer alle Regeln eines Postfachs neu – auch die, die der Plan nicht berührt. '
         'Kann das Makro eine Bedingung, Ausnahme oder Aktion nicht lesen (Zugriffsfehler, unbekannter Typ, Werte nicht '
         'lesbar), könnte sie dabei verloren gehen; die Regel griffe dann womöglich bei jeder Mail. Dann speichert das '
         'Makro nur, wenn in den Einstellungen „Ja“ steht (erst nach dem Export als .rwz). Dasselbe gilt für eine Regel '
         'ohne sichtbare Bedingung vor aktiven Regeln (unten). Laut Export: %s.'
         % ('alle Bedingungen in %s lesbar' % BES if not n_unles else '%d Regel(n) in %s nicht lesbar' % (n_unles, BES))),
        ('Regeln ohne Bedingung', ORANGEL, ORANGED,
         'Eine Regel, für die Outlook gar keine Bedingung liefert, ist lesbar und greift bei allen Mails, die bis zu ihr '
         'kommen (Sammelregel), oder ihre Bedingung wurde in Outlook im Web angelegt. Ist sie ausgeschaltet oder die '
         'letzte aktive Regel, sperrt sie nicht: Die Vorschau listet sie (Zeilen, die sie ändern, mit „Regel ohne '
         'sichtbare Bedingung“), vor dem Ausführen fragt das Makro ausdrücklich nach. Verschiebt oder stoppt sie aber '
         'und steht vor anderen aktiven Regeln – geprüft wird der Stand nach dem Plan, auch eine neue Regel dahinter '
         'zählt –, würde sie alles Folgende abfangen. Das ist unplausibel; das Makro sperrt dann das Speichern (Freigabe '
         'wie oben nur mit „Ja“; besser per Plan ans Ende setzen oder deaktivieren). Laut Export in %s: %s.'
         % (BES, '; '.join('„%s“%s' % (x['name'], ' (aus)' if x['aktiv'] == 'Nein' else '') for x in keine)
            or 'keine')),
        ('Ablauf', TILE, INK,
         'Blockiert eine ausgewählte Zeile, führt das Makro gar nichts aus. Fehler beim Ausführen: nichts wird '
         'gespeichert (Ordner legt das Makro erst unmittelbar vor dem Speichern an). Ändert sich die Lage in Outlook '
         'zwischen Vorschau und Speichern (Regel nicht mehr lesbar, Regel ohne Bedingung vor aktiven Regeln), speichert '
         'es nicht und setzt den Stand neu – mit „Ja“ fragt es eigens nach. Nach dem Speichern liest das Makro '
         'alle Regeln neu und vergleicht jede mit dem erwarteten Stand (Name, Reihenfolge, Bedingungen, Ausnahmen, '
         'Aktionen); weicht eine neu angelegte Regel ab (auch nur bei den Ausnahmen), bietet es an, sie sofort zu '
         'deaktivieren.'),
    ]
    for kopf, bg, fg, text in hinweise:
        ws.merge_range(r, 1, r, 3, kopf, F(bold=True, font_size=9.5, bg_color=bg, font_color=fg, indent=1, valign='top'))
        ws.merge_range(r, 4, r, SP['WARUM'], text, F(font_size=9.5, bg_color=bg, font_color=fg, text_wrap=True,
                                                     indent=1, valign='top'))
        ws.set_row(r, zeilenhoehe(zeilen(text, sum(BREITEN[4:SP['WARUM'] + 1]) - 2, pt=9.5), pt=9.5, polster=10))
        r += 1
    druck(ws, (kz, kz))
    ws.print_area(0, 0, r, SP['WARUM'])
    return L


def tabellenblatt(g, ws, titel, satz, kopf, breiten, farbe, wb, zeit_name=None):
    F, kopf_fmt, druck = g['F'], g['kopf_fmt'], g['druck']
    ws.hide_gridlines(2)
    ws.set_tab_color(farbe)
    zelle = F(text_wrap=True, valign='top', num_format='@', font_size=9, bottom=1, bottom_color=g['LINE'], indent=1)
    for i, b in enumerate(breiten):
        ws.set_column(i, i, b, zelle)
    g['titel'](ws, titel)
    ws.write(1, 0, satz, F(font_color=g['MUTED'], font_size=9.5))
    ws.set_row(1, 18)
    ws.set_row(2, 8)
    for c, t in enumerate(kopf):
        ws.write(3, c, t, kopf_fmt('left'))
    ws.set_row(3, 30)
    ws.freeze_panes(4, 0)
    ws.autofilter(3, 0, 3 + 2000, len(kopf) - 1)
    druck(ws, (3, 3))
    if zeit_name:
        wb.define_name(zeit_name, "='%s'!$A$2" % ws.name)


# ------------------------------------------------------------------ VBA
def vba_text(s):
    return '"%s"' % s.replace('"', '""')


def layout_modul(L, g):
    z = ['Option Explicit',
         "' ============================================================================",
         "' modLayout - vom Build (umbau.py) erzeugt: Blattnamen, Namen, Beschriftungen und Spalten. Nicht von Hand",
         "' aendern. Zellen werden ueber Namen angesprochen (Zeilen einfuegen/loeschen verschiebt sie mit); das Makro",
         "' prueft vor jedem Lauf die Beschriftungen (LABEL_*) und die Kopfzeile des Plans (KOPF_*).",
         "' ============================================================================",
         'Public Const BLATT_UMSETZUNG As String = "Umsetzung"',
         'Public Const BLATT_LIVE As String = "Live"',
         'Public Const BLATT_SICHERUNG As String = "Sicherung"',
         'Public Const BLATT_PROTOKOLL As String = "Protokoll"',
         'Public Const QUELLE_STANDARD As String = %s' % vba_text(g['MAK'])]
    for k in ('UM_ZIEL', 'UM_QUELLE', 'UM_TROTZ', 'UM_STATUS', 'UM_VORSCHAU_ZEIT', 'UM_PRUEFWERT', 'UM_AUSF_ZEIT',
              'UM_PLANKOPF', 'UM_PLAN', 'UM_LIVE_ZEIT'):
        z.append('Public Const N_%s As String = "%s"' % (k[3:], k))
    for k, v in LABEL.items():
        z.append('Public Const LABEL_%s As String = %s' % (k, vba_text(v)))
    for k in ('LIVE_ERSTE', 'SICH_ERSTE', 'PROT_ERSTE'):
        z.append('Public Const %s As Long = %d' % (k, L[k]))
    for k, v in SP.items():
        z.append('Public Const SP_%s As Long = %d' % (k, v + 1))
    for k, v in KOPF.items():
        z.append('Public Const KOPF_%s As String = %s' % (k, vba_text(v)))
    # Blatt Ordner und Ordner-Sicherung
    z += ['Public Const BLATT_ORDNER As String = "Ordner"',
          'Public Const BLATT_ORDNER_SICH As String = "Ordner-Sicherung"',
          'Public Const OSICH_ERSTE As Long = %d' % L['OSICH_ERSTE']]
    for k in ('UO_STATUS', 'UO_VORSCHAU_ZEIT', 'UO_PRUEFWERT', 'UO_AUSF_ZEIT', 'UO_PLANKOPF', 'UO_PLAN'):
        z.append('Public Const N_O_%s As String = "%s"' % (k[3:], k))
    for k, v in OSP.items():
        z.append('Public Const OSP_%s As Long = %d' % (k, v + 1))
    for k, v in OKOPF.items():
        z.append('Public Const OKOPF_%s As String = %s' % (k, vba_text(v)))
    for i, k in enumerate(OSICH_SCHL):
        z.append('Public Const OS_%s As Long = %d' % (k, i + 1))
    return '\r\n'.join(z) + '\r\n'


BED_TYP = {'Absender ist': 1, 'Betreff enthält': 2, 'Gesendet an': 12, 'Mailtext enthält': 13,
           'Betreff oder Mailtext enthält': 14, 'Nachrichtenkopf enthält': 15, 'Empfängeradresse enthält': 16,
           'Absenderadresse enthält': 17, 'Hat Anhang': 20, 'Formular / Nachrichtenklasse': 23}
AKT_SCHL = {'In Ordner verschieben': 'MOVE', 'In Ordner kopieren': 'COPY', 'Umleiten an': 'REDIR',
            'Weiterleiten an': 'FWD', 'Keine weiteren Regeln anwenden': 'HALT'}


def _werte(bez, det):
    """Werte einer Bedingung fuer die Attrappe: Empfaenger mit '; ', Woerter mit '|'."""
    t = BED_TYP[bez]
    if t in (1, 12):
        return '; '.join(x.strip() for x in (det or '').split(';') if x.strip())
    if t in (2, 13, 14, 15, 16, 17, 23):
        w = re.findall(r'"([^"]*)"', det or '')
        return '|'.join(w if w else [x.strip() for x in (det or '').split(';') if x.strip()])
    return ''


def _vba_zuweisung(var, text, stueck=180):
    """VBA-Zeilen, die einen langen Text stueckweise in var schreiben (Excel erlaubt hoechstens 1023 Zeichen je Zeile)."""
    teile = [text[i:i + stueck] for i in range(0, len(text), stueck)] or ['']
    out = ['    %s = %s' % (var, vba_text(teile[0]))]
    for t in teile[1:]:
        out.append('    %s = %s & %s' % (var, var, vba_text(t)))
    return out


def attrappe_daten(g):
    """modAttrappeDaten (nur Testvariante): Ordner, Verzeichnis und alle Regeln des Exports als Aufrufe."""
    REGEL, BES, MAK = g['REGEL'], g['BES'], g['MAK']
    ordner, namen = [], []
    for pf in (BES, MAK):
        ordner += ['\\\\%s\\Posteingang' % pf, '\\\\%s\\Archiv' % pf]
    for r in REGEL.values():
        for b, d in r['akt']:
            if b in ('In Ordner verschieben', 'In Ordner kopieren') and d:
                ordner.append(d)
        for b, d in r['bed'] + r['aus'] + r['akt']:
            if b in ('Absender ist', 'Gesendet an', 'Umleiten an', 'Weiterleiten an') and d:
                namen += [x.strip() for x in d.split(';') if x.strip()]
    z = ['Option Explicit', "' Vom Build erzeugt aus dem Regel-Export (nur Testvariante). Nicht von Hand aendern.",
         'Public Const AT_BESTAND As String = %s' % vba_text(BES), 'Public Const AT_MAKLER As String = %s' % vba_text(MAK),
         '', 'Public Sub AtDatenLaden()', '    AtDatenOrdner', '    AtDatenVerzeichnis', '    AtDatenRegeln', 'End Sub', '',
         'Private Sub AtDatenOrdner()']
    for o in dict.fromkeys(ordner):
        z.append('    AtOrdner %s' % vba_text(o))
    z += ['End Sub', '', 'Private Sub AtDatenVerzeichnis()']
    for n in dict.fromkeys(namen):
        if '@' in n and ' ' not in n:
            smtp = n.lower()
        else:
            smtp = re.sub(r'[^a-z0-9]+', '-', n.lower().replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue')
                          .replace('ß', 'ss')).strip('-') + '@attrappe.invalid'
        z.append('    AtVz %s, %s, %s' % (vba_text(n), vba_text(smtp), 'True' if n.startswith('VL ') else 'False'))
    z += ['End Sub', '']
    # Regeln je Postfach in eigenen Prozeduren (kurze Prozeduren, lange Texte stueckweise)
    for pf, kurz in ((BES, 'Bestand'), (MAK, 'Makler')):
        z += ['Private Sub AtDatenRegeln%s()' % kurz, '    Dim s As String']
        for r in sorted([x for x in REGEL.values() if x['postfach'] == pf], key=lambda x: x['reihe']):
            z.append('    AtRegel %s, %d, %s, %s, %s' % (vba_text(r['postfach']), r['reihe'], vba_text(r['name']),
                                                         'True' if r['aktiv'] == 'Ja' else 'False',
                                                         'True' if r['gueltig'] == 'Nur auf diesem Client' else 'False'))
            for art, liste in (('B', r['bed']), ('A', r['aus'])):
                for b, d in liste:
                    z += _vba_zuweisung('s', _werte(b, d))
                    z.append('    AtBed "%s", %d, s' % (art, BED_TYP[b]))
            for b, d in r['akt']:
                z += _vba_zuweisung('s', d or '')
                z.append('    AtAkt "%s", s' % AKT_SCHL[b])
        z += ['End Sub', '']
    z += ['Private Sub AtDatenRegeln()', '    AtDatenRegelnBestand', '    AtDatenRegelnMakler', 'End Sub']
    return '\r\n'.join(z) + '\r\n'


SCHREIBEND = re.compile(r'\.(Save|Create|Remove|Delete|ResolveAll|MoveTo|CopyTo)\b|Folders\.Add\b|Recipients\.Add\b|\bCallByName\b|'
                        r'\.(Name|Enabled|ExecutionOrder|Folder|Text|Address|Importance|Categories|FormName)\s*=(?!=)|'
                        r'^\s*Set\s+\S+\.(Folder)\s*=')


def nur_lesend_pruefen(module):
    """Schreibende Outlook-Zugriffe duerfen nur in modOlSchreiben stehen (Vorschau/Lesen nutzen die anderen Module)."""
    befunde = []
    for name, (text, art) in module.items():
        if name == 'modOlSchreiben' or art == 'class' or name.startswith('modAttrappe'):
            continue
        for nr, zeile in enumerate(text.replace('\r\n', '\n').split('\n'), 1):
            code = re.sub(r'"[^"]*"', '""', zeile)
            code = re.sub(r"'.*$", '', code)
            if SCHREIBEND.search(code):
                befunde.append('%s:%d schreibender Outlook-Zugriff ausserhalb modOlSchreiben: %s' % (name, nr, zeile.strip()[:80]))
    return befunde


def vba_projekt(g, L, blattnamen):
    test = g['TEST']
    module = {}
    for d, arten in ((os.path.join(HIER, 'vba'), None), (os.path.join(HIER, 'vba_test'), 'test')):
        if arten == 'test' and not test:
            continue
        for f in sorted(os.listdir(d)):
            pfad = os.path.join(d, f)
            if f.endswith('.bas'):
                module[f[:-4]] = (open(pfad, encoding='utf-8').read(), False)
            elif f.endswith('.cls') and f != 'DieseArbeitsmappe.cls':
                module[f[:-4]] = (open(pfad, encoding='utf-8').read(), 'class')
    module['modLayout'] = (layout_modul(L, g), False)
    if test:
        module['modAttrappeDaten'] = (attrappe_daten(g), False)
    arbeitsmappe = open(os.path.join(HIER, 'vba', 'DieseArbeitsmappe.cls'), encoding='utf-8').read()
    # Pruefung: Excel-Kompilierfehler (vba_pruefung), cp1252, Option Explicit, Zeilenlaenge
    befunde = []
    with tempfile.TemporaryDirectory(dir=os.path.dirname(os.path.abspath(g['OUT']))) as tmp:
        for name, (text, art) in module.items():
            with open(os.path.join(tmp, name + ('.cls' if art == 'class' else '.bas')), 'w', encoding='utf-8') as fh:
                fh.write(text.replace('\r\n', '\n'))
        befunde += vba_pruefung.pruefe(tmp)
    befunde += nur_lesend_pruefen(module)
    for name, (text, art) in list(module.items()) + [('DieseArbeitsmappe', (arbeitsmappe, 'workbook'))]:
        try:
            text.encode('cp1252')
        except UnicodeEncodeError as e:
            befunde.append('%s: Zeichen ausserhalb cp1252: %r' % (name, text[e.start:e.end]))
        if 'Option Explicit' not in text:
            befunde.append('%s: Option Explicit fehlt' % name)
        for nr, zeile in enumerate(text.replace('\r\n', '\n').split('\n'), 1):
            if len(zeile) > 1000:
                befunde.append('%s:%d Zeile laenger als 1000 Zeichen (Excel: hoechstens 1023)' % (name, nr))
            code = re.sub(r"'.*$", '', re.sub(r'"[^"]*"', '""', zeile)).strip()
            m = re.match(r'(?i)(?:Else)?If\b.*?\bThen\s+(.+?)\s+Else\s+(.+)$', code)
            if m:
                for teil in m.groups():
                    if '=' not in teil and not re.match(r'(?i)(Exit|GoTo)\b', teil):
                        befunde.append('%s:%d Einzeilen-If mit Prozeduraufruf vor/nach Else (LibreOffice kompiliert das '
                                       'nicht): %s' % (name, nr, zeile.strip()[:80]))
    if befunde:
        raise SystemExit('VBA-Pruefung fehlgeschlagen:\n' + '\n'.join(befunde))
    liste = [('ThisWorkbook', arbeitsmappe, 'workbook')]
    liste += [(VBA_NAMEN[n], 'Option Explicit\r\n', 'sheet') for n in blattnamen]
    liste += [(n, t, a) for n, (t, a) in module.items() if a is False]
    liste += [(n, t, a) for n, (t, a) in module.items() if a == 'class']
    return ovba.vba_projekt(liste, projektname='RegelnUmbau'), sorted(module)


# ------------------------------------------------------------------ Einstieg
def bauen(g):
    wb = g['wb']
    P = plan_ableiten(g)
    g['PLAN'] = P
    L = umsetzung_blatt(g, g['WS_UMSETZUNG'], P)
    OP = ordner_plan(g)
    g['ORDNER_PLAN'] = OP
    L.update(ordner_blatt(g, g['WS_ORDNER'], OP))
    ws = wb.add_worksheet('Live')
    tabellenblatt(g, ws, 'Regeln live aus Outlook', 'Noch nicht gelesen – Knopf „Regeln aus Outlook lesen“ im Blatt '
                  'Umsetzung.', LIVE_KOPF, LIVE_BREITEN, g['TEAL'], wb, 'UM_LIVE_ZEIT')
    ws.conditional_format(4, 12, 4 + 2000, 12, {'type': 'cell', 'criteria': '==', 'value': '"Nein"',
                                                'format': g['CF'](bg_color=g['ROTL'], font_color=g['ROTD'], bold=True)})
    ws.conditional_format(4, 13, 4 + 2000, 13, {'type': 'text', 'criteria': 'begins with', 'value': 'keine sichtbare',
                                                'format': g['CF'](bg_color=g['ORANGEL'], font_color=g['ORANGED'])})
    ws.conditional_format(4, 3, 4 + 2000, 3, {'type': 'cell', 'criteria': '==', 'value': '"Nein"',
                                              'format': g['CF'](bg_color=g['GRAUL'], font_color=g['GRAUD'])})
    L['LIVE_ERSTE'] = 5
    ws = wb.add_worksheet('Sicherung')
    tabellenblatt(g, ws, 'Sicherung vor dem Ausführen',
                  'Wird vor jeder Ausführung ergänzt, nie überschrieben. Vollständig zurückspielen lässt sich der alte '
                  'Stand nur mit dem Outlook-Export (.rwz).', SICH_KOPF, SICH_BREITEN, g['GRAUD'], wb)
    L['SICH_ERSTE'] = 5
    ws = wb.add_worksheet('Ordner-Sicherung')
    tabellenblatt(g, ws, 'Ordner-Sicherung',
                  'Vor jeder Ordner-Umstellung (und vor „Ordner zurück“): alle Ordner und Regelziele beider Postfächer; '
                  'danach jeder ausgeführte Schritt (angelegt, verschoben, umbenannt). Wird nur ergänzt – „Ordner '
                  'zurück“ liest die Schritte mit Stand „ausgeführt“.', OSICH_KOPF, OSICH_BREITEN, g['GRAUD'], wb)
    ws.conditional_format(4, 3, 4 + 2000, 3, {'type': 'text', 'criteria': 'begins with', 'value': 'verschoben',
                                              'format': g['CF'](bg_color=g['TEALL'], font_color=g['TEALD'])})
    ws.conditional_format(4, 3, 4 + 2000, 3, {'type': 'text', 'criteria': 'begins with', 'value': 'umbenannt',
                                              'format': g['CF'](bg_color=g['TEALL'], font_color=g['TEALD'])})
    L['OSICH_ERSTE'] = 5
    ws = wb.add_worksheet('Protokoll')
    tabellenblatt(g, ws, 'Protokoll', 'Jeder Lauf (Lesen, Vorschau, Ausführen, Ordner) und jede Änderung in Outlook mit '
                                      'Zeitpunkt.',
                  PROT_KOPF, PROT_BREITEN, g['INK'], wb)
    L['PROT_ERSTE'] = 5
    blattnamen = [w.name for w in wb.worksheets()]
    for w in wb.worksheets():
        w.set_vba_name(VBA_NAMEN[w.name])
    wb.set_vba_name('ThisWorkbook')
    binaer, namen = vba_projekt(g, L, blattnamen)
    wb.add_vba_project(io.BytesIO(binaer), is_stream=True)
    g['UMBAU_LAYOUT'] = L
    g['UMBAU_MODULE'] = namen
    print('VBA-Module:', ', '.join(namen), '(Testvariante)' if g['TEST'] else '')
