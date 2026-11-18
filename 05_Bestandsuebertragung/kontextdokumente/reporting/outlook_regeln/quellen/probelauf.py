# -*- coding: utf-8 -*-
"""Probelauf des Auftrags „Aufräumen“ mit dem echten Regelstand gegen die Outlook-Attrappe (LibreOffice).

Baut für beide Postfächer die Testvariante der Mappe aus Export und Namensliste (bau_regeln.py --test --plan …,
für Maklerauftraege mit --ziel makler), lädt sie in LibreOffice und ruft die echten Makros auf: Lesen, Vorschau,
Ausführen, zweite Vorschau. Die Attrappe ist mit den Regeln des Exports befüllt – der Lauf zeigt also, was der Plan
aus genau diesem Stand macht, bevor er im echten Outlook läuft.

Geprüft wird je Postfach: Vorschau ohne Blocker, alle Zeilen „erledigt (geprüft …)“, genau ein Save, so viele
entfernte Regeln wie Duplikate, danach genau die Regeln der Namensliste in ihrer Reihenfolge, jede mit dem Inhalt,
den sie vorher hatte, das andere Postfach unverändert, zweite Vorschau „schon erledigt“.

Aufruf: python3 probelauf.py <regel-export.xlsx> <namensliste.xlsx> <arbeitsordner>
Ende mit Exitcode 1, wenn eine Prüfung fehlschlägt.
"""
import os
import subprocess
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import aufraeumen                      # noqa: E402
import test_umbau as t                 # noqa: E402

BES, MAK = t.BES, t.MAK


def lauf(export, liste, arbeit, ziel, namen):
    andere = MAK if ziel == BES else BES
    kurz_ziel = ziel.split('@')[0]
    print('\n== Probelauf %s' % kurz_ziel)
    pfad = os.path.join(arbeit, 'Regeln_Aufraeumen_%s_Test.xlsm' % kurz_ziel)
    befehl = [sys.executable, '-I', os.path.join(HIER, 'bau_regeln.py'), export, pfad, '--test', '--plan', liste]
    if ziel == MAK:
        befehl += ['--ziel', 'makler']
    subprocess.run(befehl, check=True, stdout=subprocess.DEVNULL)
    s = t.Sitzung(pfad)
    try:
        s.laden()
        s.ruf('modAttrappe.AtStart', 'export')
        vor, vor_andere = s.zustand(ziel), s.zustand(andere)
        soll = [neu for _, neu in namen]
        alt_zu_neu = dict(namen)
        n_dopp = len(vor) - len(soll)
        print('    Stand: %d Regeln, Namensliste: %d Regeln, also %d Duplikate' % (len(vor), len(soll), n_dopp))
        msg = s.ruf('modUmbau.RegelnLesenLauf')
        t.pruefe(s.zaehler()['schreib'] == '0', 'Lesen schreibt nichts nach Outlook')
        live = [r for r in s.zeilen('Live', int(s.L['LIVE_ERSTE']), 14) if r[0] == ziel]
        mehrfach = [r for r in live if 'Name mehrfach vergeben' in r[13]]
        t.pruefe(len(live) == len(vor) and len(mehrfach) == sum(1 for r in vor if [x[2] for x in vor].count(r[2]) > 1),
                 'Live: %d Regeln, %d davon mit Hinweis „Name mehrfach vergeben“' % (len(live), len(mehrfach)))
        msg = s.ruf('modUmbau.VorschauLauf')
        print('    Vorschau:', t.kurz(msg, 200))
        st = s.plan('VORSCHAU')
        blockiert = {k: v for k, v in st.items() if v.startswith('blockiert') or v == ''}
        for k, v in sorted(st.items()):
            print('     %2d  %s' % (k, t.kurz(v, 150)))
        t.pruefe(not blockiert, 'Vorschau: keine Zeile blockiert', str(blockiert)[:600])
        t.pruefe(s.zaehler()['schreib'] == '0', 'Vorschau schreibt nichts nach Outlook')
        bereit = [k for k, v in st.items() if v.startswith('bereit')]
        s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJJJ')
        msg = s.ruf('modUmbau.AusfuehrenLauf')
        print('    Ausführen:', t.kurz(msg, 500))
        erg = s.plan('ERGEBNIS')
        nicht = {k: erg[k] for k in bereit if not erg[k].startswith('erledigt (geprüft')}
        t.pruefe(not nicht, 'Alle %d Zeilen erledigt (geprüft)' % len(bereit), str(nicht)[:600])
        z = s.zaehler()
        t.pruefe(z['save'] == '1' and z['remove'] == str(n_dopp) and z['create'] == '0' and z['ordneradd'] == '0',
                 'Ein Save, %d Regeln entfernt, nichts angelegt' % n_dopp, str(z))
        for kopf, text in s.fragen():
            print('    %s  (%d Zeichen)' % (kopf, len(text)))
        t.pruefe(all(len(text) <= 1024 for _, text in s.fragen()), 'Jede Rückfrage passt in eine MsgBox')
        nach = s.zustand(ziel)
        ist = [r[2] for r in nach]
        t.pruefe(ist == soll, 'Gespeichert: genau die %d Regeln der Namensliste in ihrer Reihenfolge' % len(soll),
                 '\n      ist:  %s\n      soll: %s' % (ist, soll))
        erste = {}
        for r in vor:
            erste.setdefault(r[2], r)
        anders = [a for a, n in namen if [r for r in nach if r[2] == n][:1] and [r for r in nach if r[2] == n][0][3:] != erste[a][3:]]
        t.pruefe(not anders, 'Jede Regel hat denselben Inhalt wie vorher (Aktiv, Bedingungen, Aktionen, Ausnahmen)', str(anders))
        t.pruefe('Abweichung' not in msg.replace('0 mit Abweichung', '') and 'Achtung' not in msg,
                 'Nachprüfung ohne Abweichung', t.kurz(msg, 400))
        t.pruefe(s.zustand(andere) == vor_andere, '%s unverändert' % andere.split('@')[0])
        sich = s.zeilen('Sicherung', int(s.L['SICH_ERSTE']), 12)
        t.pruefe(len(sich) == len(vor), 'Sicherung: alle %d Regeln von vorher' % len(vor), str(len(sich)))
        s.ruf('modUmbau.VorschauLauf')
        st2 = s.plan('VORSCHAU')
        offen = {k: v for k, v in st2.items() if not v.startswith('schon erledigt')}
        t.pruefe(not offen, 'Zweite Vorschau: alle Zeilen schon erledigt', str(offen)[:600])
        s.ruf('modAttrappe.AtSchalter', 'antworten', 'JJJJJ')
        msg = s.ruf('modUmbau.AusfuehrenLauf')
        t.pruefe(msg.startswith('Nichts zu tun') and s.zaehler()['save'] == '1', 'Zweites Ausführen: nichts zu tun, kein Save', msg)
    finally:
        s.ende()


def main():
    export, liste, arbeit = (os.path.abspath(x) for x in sys.argv[1:4])
    os.makedirs(arbeit, exist_ok=True)
    listen = aufraeumen.namensliste_lesen(liste)
    for ziel, schl in ((BES, 'bestand'), (MAK, 'makler')):
        try:
            lauf(export, liste, arbeit, ziel, listen[schl])
        except Exception as e:
            t.pruefe(False, 'Probelauf %s abgebrochen: %s' % (ziel.split('@')[0], str(e)[:500]))
    n_ok = sum(1 for ok, _ in t.ERGEBNISSE if ok)
    print('\nErgebnis: %d von %d Prüfungen bestanden' % (n_ok, len(t.ERGEBNISSE)))
    for ok, text in t.ERGEBNISSE:
        if not ok:
            print('  FEHLER:', text)
    sys.exit(0 if n_ok == len(t.ERGEBNISSE) else 1)


if __name__ == '__main__':
    main()
