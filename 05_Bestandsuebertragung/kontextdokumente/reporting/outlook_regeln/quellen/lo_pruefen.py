# -*- coding: utf-8 -*-
"""Kopie aus pruefbot_testing/quellen (nur Port, Profil und Standardaufrufe angepasst).

Laedt die xlsm in LibreOffice (VBA-Modus, eigenes Profil und eigener Port), prueft, dass alle Module kompilieren,
und ruft Funktionen auf.

Aufruf:
  python3 lo_pruefen.py <datei.xlsm> [--setze 'Blatt!Zelle=Wert' ...] [--ruf 'Modul.Funktion|arg1|arg2' ...]
                        [--ruf-json '["Modul.Funktion", "arg1", true]' ...] [--json ergebnis.json]

Ohne --ruf werden die Versionsfunktionen aufgerufen. Argumente: Text; 'wahr'/'falsch' werden zu Boolean. --ruf-json
nimmt Name und Argumente als JSON-Liste (fuer Texte mit | oder Zeilenumbruch); die Aufrufe laufen in der Reihenfolge
der Angaben.
--json schreibt je Aufruf {ruf, ok, ergebnis} in eine Datei (fuer Pruefungen, die Rueckgaben vergleichen).
--setze schreibt vor den Aufrufen Werte in Zellen (nur in der geladenen Kopie, nichts wird gespeichert).
Syntaxfehler in einem Modul erscheinen beim Aufruf als BASIC-Fehler. Beendet nur die eigene LibreOffice-Instanz.
"""
import json
import os
import subprocess
import sys
import time

import uno
from com.sun.star.beans import PropertyValue

# eigener Port und eigenes Profil; ueber LO_PORT / LO_PROFIL aenderbar (parallele Laeufe)
PORT = int(os.environ.get('LO_PORT', '2477'))
PROFIL = os.environ.get('LO_PROFIL', 'file:///tmp/lo_regeln_umbau')


def pv(n, v):
    p = PropertyValue()
    p.Name = n
    p.Value = v
    return p


def main():
    args = sys.argv[1:]
    pfad = os.path.abspath(args.pop(0))
    setzen, rufe, ergebnisse, json_datei = [], [], [], None
    while args:
        a = args.pop(0)
        if a == '--setze':
            setzen.append(args.pop(0))
        elif a == '--ruf':
            rufe.append(args.pop(0))
        elif a == '--ruf-json':
            rufe.append(json.loads(args.pop(0)))
        elif a == '--json':
            json_datei = args.pop(0)
    if not rufe:
        rufe = ['modUmbau.UmbauVersion', 'modPlan.PlanVersion', 'modOlLesen.LesenVersion', 'modOlSchreiben.SchreibenVersion']
    proc = subprocess.Popen(['soffice', '--headless', '--norestore', '--nologo', '-env:UserInstallation=' + PROFIL,
                             '--accept=socket,host=localhost,port=%d;urp;' % PORT],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    ctx = None
    for _ in range(90):
        try:
            local = uno.getComponentContext()
            resolver = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
            ctx = resolver.resolve('uno:socket,host=localhost,port=%d;urp;StarOffice.ComponentContext' % PORT)
            break
        except Exception:
            time.sleep(1)
    if ctx is None:
        proc.kill()
        raise SystemExit('LibreOffice antwortet nicht')
    desktop = ctx.ServiceManager.createInstanceWithContext('com.sun.star.frame.Desktop', ctx)
    try:
        doc = desktop.loadComponentFromURL(uno.systemPathToFileUrl(pfad), '_blank', 0,
                                           (pv('Hidden', True), pv('MacroExecutionMode', 4)))
        libs = doc.BasicLibraries
        for lib in libs.ElementNames:
            libs.loadLibrary(lib)
            print('Bibliothek', lib, 'Module:', ', '.join(libs.getByName(lib).ElementNames))
        bib = [l for l in libs.ElementNames if l != 'Standard'][0] if len(libs.ElementNames) > 1 else libs.ElementNames[0]
        for s in setzen:
            ziel, wert = s.split('=', 1)
            blatt, zelle = ziel.rsplit('!', 1)
            sh = doc.Sheets.getByName(blatt)
            c = sh.getCellRangeByName(zelle)
            if wert.replace('.', '', 1).isdigit():
                c.setValue(float(wert))
            else:
                c.setString(wert)
        sp = doc.getScriptProvider()
        for r in rufe:
            if isinstance(r, list):
                name, werte = r[0], list(r[1:])
                r = json.dumps(r, ensure_ascii=False)
            else:
                teile = r.split('|')
                name, werte = teile[0], []
                for w in teile[1:]:
                    werte.append(True if w == 'wahr' else False if w == 'falsch' else w)
            try:
                s = sp.getScript('vnd.sun.star.script:%s.%s?language=Basic&location=document' % (bib, name))
                t0 = time.time()
                erg = s.invoke(tuple(werte), (), ())
                print('OK  %s (%.2f s) -> %s' % (name, time.time() - t0, erg[0]))
                ergebnisse.append({'ruf': r, 'ok': True, 'ergebnis': erg[0]})
            except Exception as e:
                print('FEHLER %s -> %s' % (name, str(e)[:1500]))
                ergebnisse.append({'ruf': r, 'ok': False, 'ergebnis': str(e)[:1500]})
        doc.close(True)
        if json_datei:
            with open(json_datei, 'w', encoding='utf-8') as f:
                json.dump(ergebnisse, f, ensure_ascii=False, indent=1)
    finally:
        try:
            desktop.terminate()
        except Exception:
            pass
        try:
            proc.wait(timeout=30)
        except Exception:
            proc.kill()


if __name__ == '__main__':
    main()
