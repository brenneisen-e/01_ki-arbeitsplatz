# Prueft die gebaute Mappe gegen den Export und (optional) gegen die .xlsx-Variante.
#
# 1. Wertetreue: jeder Wert jedes Export-Blatts (Uebersicht, Regel-Logik, Elemente, Zielordner, Pruefhinweise und -
#    im neuen Format - Diagnose) steht unveraendert in der neuen Datei (Zuordnung: Uebersicht B2:B5 -> C2:C5, sonst
#    gleiche Zelle); keine fremden Werte ausser den bekannten Zusaetzen.
# 2. Bei .xlsm: Blatt Umsetzung an zweiter, Ordner an dritter Stelle, Plaene (Regeln v2, Ordner 3.0), Namen und
#    Beschriftungen, Links, Knoepfe mit vorhandenen Makros, VBA-Module (Produktivdatei ohne Attrappe).
# 3. Mit drittem Argument (die .xlsx aus demselben Export): die erzeugten Blaetter Auf einen Blick, Vergleich und
#    Anlegen der .xlsm stimmen mit der .xlsx ueberein - bis auf eine Liste erlaubter Zusaetze (Links und Zeilen zum
#    Makro, erweiterter Hinweistext).
# Aufruf: python3 -I pruefe.py <export.xlsx> <ausgabe.xlsx|ausgabe.xlsm> [<vergleich.xlsx>]
import difflib, os, re, sys, zipfile, openpyxl, warnings
warnings.simplefilter('ignore')
src, out = sys.argv[1], sys.argv[2]
ref = sys.argv[3] if len(sys.argv) > 3 else None
a = openpyxl.load_workbook(src); b = openpyxl.load_workbook(out, data_only=True)
fehler = 0; n = 0


def summe_zeile(ws):
    return [r for r in range(1, ws.max_row + 1) if ws.cell(r, 1).value == 'Summe']


for ws in a:
    wt = b[ws.title]
    for row in ws.iter_rows():
        for c in row:
            if c.value is None: continue
            r, k = c.row, c.column
            if ws.title == 'Übersicht' and k == 2 and 2 <= r <= 5: k = 3
            v = wt.cell(r, k).value
            n += 1
            if v != c.value or type(v) != type(c.value):
                fehler += 1; print('ABWEICHUNG', ws.title, c.coordinate, repr(c.value)[:60], '->', repr(v)[:60])
    # keine fremden Werte in den Originalbereichen ausser den bekannten Zusaetzen
    erlaubt = {('Regel-Logik', 3, 1), ('Zielordner', 3, 1)}
    if ws.title == 'Zielordner':
        erlaubt |= {('Zielordner', r, 4) for r in summe_zeile(ws)}
    for row in wt.iter_rows():
        for c in row:
            if c.value is None: continue
            r, k = c.row, c.column
            q = (r, 2) if (ws.title == 'Übersicht' and k == 3 and 2 <= r <= 5) else (r, k)
            if ws.cell(*q).value is None and (ws.title, r, k) not in erlaubt:
                fehler += 1; print('ZUSATZ', ws.title, c.coordinate, repr(c.value)[:60])
print('Werte geprueft:', n, 'Fehler:', fehler, '(Blaetter: %s)' % ', '.join(ws.title for ws in a))
za, zb = zipfile.ZipFile(src), zipfile.ZipFile(out)
if 'docProps/custom.xml' in za.namelist():
    print('MIP-Label identisch:', za.read('docProps/custom.xml') == zb.read('docProps/custom.xml'))
    if za.read('docProps/custom.xml') != zb.read('docProps/custom.xml'):
        fehler += 1
else:
    print('MIP-Label: Export hat keine Kennzeichnung (docProps/custom.xml fehlt) – Ausgabe ebenfalls ohne:',
          'docProps/custom.xml' not in zb.namelist() or b'lpwstr' not in zb.read('docProps/custom.xml'))
fonts = set(re.findall(rb'<name val="([^"]+)"', zb.read('xl/styles.xml')))
print('Schriften:', fonts)
print('Blaetter:', b.sheetnames)


def check(bed, text):
    global fehler
    print('  [%s] %s' % ('OK' if bed else 'FEHLER', text))
    if not bed:
        fehler += 1


if out.lower().endswith('.xlsm'):
    import olefile
    hier = os.path.dirname(os.path.abspath(__file__))
    print('Makro-Mappe:')
    check(b.sheetnames[:4] == ['Auf einen Blick', 'Umsetzung', 'Ordner', 'Vergleich'],
          'Umsetzung ist das zweite Blatt, Ordner das dritte')
    check(b.sheetnames[-4:] == ['Live', 'Sicherung', 'Ordner-Sicherung', 'Protokoll'],
          'Live, Sicherung, Ordner-Sicherung, Protokoll am Ende')
    # Plan
    ws = b['Umsetzung']
    kopf = [r for r in range(1, ws.max_row + 1) if ws.cell(r, 2).value == 'Nr' and ws.cell(r, 4).value == 'Aktion'][0]
    kopfzeile = [ws.cell(kopf, c).value for c in range(2, 14)]
    print('    Kopf:', kopfzeile)
    check(kopfzeile[:7] == ['Nr', 'Ausführen', 'Aktion', 'Regel (im Zielpostfach)', 'Neuer Name / Position / Wert',
                            'Vorschau', 'Ergebnis'], 'Vorschau und Ergebnis direkt hinter Regel/Position (Spalten G, H)')
    plan = []
    for r in range(kopf + 1, kopf + 40):
        if ws.cell(r, 4).value:
            plan.append([ws.cell(r, c).value for c in range(2, 14)])
    for p in plan:
        print('    %2s %-4s %-27s %-44s | %s | %s | %s' % (p[0], p[1], p[2], str(p[3])[:44], str(p[4] or '')[:46],
                                                         str(p[7] or '')[:46], str(p[8] or '')[:30]))
    aktionen = [p[2] for p in plan]
    check(len(plan) == 14, 'Plan: 14 Zeilen')
    check([p[1] for p in plan] == ['Ja'] * 11 + ['Nein'] * 3, 'Ausführen: 1–11 Ja, 12–14 Nein')
    check(aktionen == ['ZIELORDNER', 'UMBENENNEN', 'KOPIEREN', 'POSITION', 'POSITION', 'KOPIEREN', 'POSITION',
                       'BEDINGUNG_WORT_ERGAENZEN', 'UMLEITEN_STATT_WEITERLEITEN', 'AUSNAHMEN_UEBERNEHMEN',
                       'AUSNAHMEN_UEBERNEHMEN', 'KOPIEREN', 'KOPIEREN', 'KOPIEREN'], 'Aktionen in Planreihenfolge (Plan v2)')
    check(not any('KV@Qualitypool' in str(p[3]) for p in plan), 'KV@Qualitypool nicht im Plan')
    check(all('||' in str(p[4]) for p in plan[12:]) and '||' in str(plan[4][4]),
          'Ausweich-Bezüge mit „||“ (Zeile 5 und Erinnerungsregeln)')
    # Namen und Beschriftungen
    wbx = zb.read('xl/workbook.xml').decode('utf-8')
    namen = dict(re.findall(r'<definedName name="(U[MO]_[A-Z_]+)">([^<]+)</definedName>', wbx))
    print('    Namen:', ', '.join('%s=%s' % kv for kv in sorted(namen.items())))
    check(set(namen) >= {'UM_ZIEL', 'UM_QUELLE', 'UM_TROTZ', 'UM_STATUS', 'UM_VORSCHAU_ZEIT', 'UM_PRUEFWERT',
                         'UM_AUSF_ZEIT', 'UM_PLANKOPF', 'UM_PLAN', 'UM_LIVE_ZEIT'}, 'Alle Namen definiert')

    def zelle(name):
        m = re.match(r"'?([^'!]+)'?!\$([A-Z]+)\$(\d+)", namen[name])
        return m.group(1), m.group(2), int(m.group(3))
    for nm, label, wert in (('UM_ZIEL', 'Zielpostfach (wird geändert)', 'Bestandsuebertragungen@ergo.de'),
                            ('UM_QUELLE', 'Quellpostfach (Regeln nur gelesen)', 'Maklerauftraege@ergo.de'),
                            ('UM_TROTZ', 'Trotz nicht lesbarer Bedingungen speichern (Sicherung als .rwz vorhanden)', 'Nein')):
        blatt, sp, zl = zelle(nm)
        check(b[blatt]['B%d' % zl].value == label and b[blatt]['%s%d' % (sp, zl)].value == wert,
              '%s: Beschriftung und Wert (%s)' % (nm, wert))
    check(re.match(r"'Umsetzung'!\$B\$%d:\$M\$%d" % (kopf + 1, kopf + 1 + 19), namen['UM_PLAN']) is not None
          and namen['UM_PLANKOPF'] == "'Umsetzung'!$B$%d:$M$%d" % (kopf, kopf), 'Plan-Bereich direkt unter der Kopfzeile')
    check(ws.cell(kopf, 12).value == 'Überspringen: nicht auflösbare Absender' and ws.cell(kopf, 13).value == 'Warum'
          and not any(p[10] for p in plan), 'Spalte L „Überspringen“ vorhanden und im Plan leer (Standard: blockieren)')
    sheetxml = None
    # Fixierung (Befund 13): Blatt Umsetzung ohne fixierte Zeilen
    rels = zb.read('xl/_rels/workbook.xml.rels').decode('utf-8')
    blattdatei = {}
    for name, rid in re.findall(r'<sheet name="([^"]+)" sheetId="\d+" r:id="(rId\d+)"', wbx):
        ziel = re.search(r'Id="%s" Type="[^"]+" Target="([^"]+)"' % rid, rels).group(1)
        blattdatei[name.replace('&amp;', '&')] = 'xl/' + ziel
    roh = {k: zb.read(v).decode('utf-8') for k, v in blattdatei.items()}
    check('state="frozen"' not in roh['Umsetzung'], 'Blatt Umsetzung ohne fixierte Zeilen')
    for blatt in ('Auf einen Blick', 'Anlegen'):
        check("location=\"'Umsetzung'!A1\"" in roh[blatt], 'Link auf Umsetzung in %s' % blatt)
    # Knoepfe je Blatt: Makros und Lage (Spalten B-D, oberhalb des Plans)
    wo = b['Ordner']
    okopf = [r for r in range(1, wo.max_row + 1) if wo.cell(r, 2).value == 'Nr' and wo.cell(r, 5).value == 'Aktion'][0]
    oeff = {}
    for modul in ('modUmbau', 'modOrdner'):
        quelle = open(os.path.join(hier, 'vba', modul + '.bas'), encoding='utf-8').read()
        oeff[modul] = set(re.findall(r'^Public Sub (\w+)\(\)', quelle, re.M))
    for blatt, plankopf, soll in (('Umsetzung', kopf, ['modUmbau.RegelnLesen', 'modUmbau.Vorschau', 'modUmbau.Ausfuehren']),
                                  ('Ordner', okopf, ['modOrdner.OrdnerVorschau', 'modOrdner.OrdnerAusfuehren',
                                                     'modOrdner.OrdnerRegelnPruefen', 'modOrdner.OrdnerZurueck'])):
        srels = blattdatei[blatt].replace('worksheets/', 'worksheets/_rels/') + '.rels'
        ziel = re.search(r'Target="\.\./drawings/(drawing\d+\.xml)"', zb.read(srels).decode('utf-8')).group(1)
        x = zb.read('xl/drawings/' + ziel).decode('utf-8')
        makros = re.findall(r'macro="\[0\]!([\w.]+)"', x)
        anker = [(int(c), int(r)) for c, r in re.findall(r'<xdr:from><xdr:col>(\d+)</xdr:col><xdr:colOff>\d+</xdr:colOff><xdr:row>(\d+)</xdr:row>', x)]
        print('    Knoepfe %s:' % blatt, ', '.join(makros), 'Anker (Spalte, Zeile, 0-basiert):', anker)
        check(sorted(makros) == sorted(soll) and all(m.split('.')[1] in oeff[m.split('.')[0]] for m in makros),
              '%s: %d Knöpfe, Makros vorhanden und öffentlich' % (blatt, len(soll)))
        check(all(c <= 3 and r < plankopf for c, r in anker), '%s: Knöpfe links (Spalten B–D) über dem Plan' % blatt)
    # Ordner-Plan 3.0
    oplan = [[wo.cell(r, c).value for c in range(2, 12)] for r in range(okopf + 1, okopf + 80) if wo.cell(r, 5).value]
    print('    Ordner-Kopf:', [wo.cell(okopf, c).value for c in range(2, 12)])
    for p in oplan:
        print('    %2s %-4s %-12s %-19s %-52s -> %s' % (p[0], p[1], str(p[2]).split('@')[0][:12], p[3], str(p[4] or '')[:52], p[5]))
    gruppen = ['01) Automatische Antworten', '02) Erinnerungen Pools', '03) BeMaS - eBIS', '04) Neuzugänge',
               '05) Weiterleitungen', '06) Technische Fehler']
    check([wo.cell(okopf, c).value for c in range(2, 12)] == ['Nr', 'Ausführen', 'Postfach', 'Aktion', 'Pfad heute', 'Pfad neu',
          'Vorschau', 'Ergebnis', 'Regeln mit Ziel in diesem Ordner (Pfad danach)', 'Warum'], 'Ordner: Kopfzeile')
    check(len(oplan) == 47 and all(p[1] == 'Ja' for p in oplan), 'Ordner-Plan: 47 Zeilen, alle Ja')
    for pf, n_ver, n_umb in (('Bestandsuebertragungen@ergo.de', 12, 11), ('Maklerauftraege@ergo.de', 12, 0)):
        z = [p for p in oplan if p[2] == pf]
        check([p[5] for p in z if p[3] == 'ORDNER_ANLEGEN'] == ['Archiv\\' + g for g in gruppen] and
              len([p for p in z if p[3] == 'ORDNER_VERSCHIEBEN']) == n_ver and
              len([p for p in z if p[3] == 'ORDNER_UMBENENNEN']) == n_umb and z[0][3] == 'ORDNER_ANLEGEN',
              '%s: 6 Gruppenordner zuerst, %d verschieben, %d umbenennen' % (pf.split('@')[0], n_ver, n_umb))
    heute = {(p[2].split('@')[0], p[4]): p[5] for p in oplan if p[4]}
    for (pf, h), n in ((('Maklerauftraege', 'Archiv\\Auotmatische Antworten'), 'Archiv\\01) Automatische Antworten\\Automatische Antworten'),
                       (('Bestandsuebertragungen', 'Archiv\\Archiv: BeMaS-Kennzeichen konnte nicht gesetzt werden'),
                        'Archiv\\03) BeMaS - eBIS\\BeMaS-Kennzeichen konnte nicht gesetzt werden'),
                       (('Bestandsuebertragungen', 'BÜ-Archiv: Weitergeleiteten Mails an Celonis'),
                        'Archiv\\05) Weiterleitungen\\Weitergeleitete Mails an Celonis'),
                       (('Bestandsuebertragungen', 'Rückläufer EPL und FL Verträge\\Nass-Kluske'), 'Rückläufer EPL und FL Verträge\\06) Nass-Kluske'),
                       (('Bestandsuebertragungen', 'UBR\\Witt'), 'UBR\\01) Witt'),
                       (('Maklerauftraege', 'Archiv\\Teil/Gesamt-BÜ nicht an KWAD sondern an Verwaltung'),
                        'Archiv\\05) Weiterleitungen\\Teil/Gesamt-BÜ nicht an KWAD sondern an Verwaltung')):
        check(heute.get((pf, h)) == n, 'Ordner-Plan: %s %s -> %s' % (pf, h, n))
    nicht = ('Vorabinfo', 'BÜ-Bot', 'Archiv zu den weitergeleiteten Mails an KWAD', 'Posteingang', 'Livelink',
             'Rückläufer FL Verträge (ODPB3D)')
    check(not any(w in str(p[4]) + str(p[5]) for p in oplan for w in nicht), 'Ordner-Plan: bewusst ausgelassene Ordner fehlen')
    check(set(namen) >= {'UO_STATUS', 'UO_VORSCHAU_ZEIT', 'UO_PRUEFWERT', 'UO_AUSF_ZEIT', 'UO_PLANKOPF', 'UO_PLAN'} and
          namen['UO_PLANKOPF'] == "'Ordner'!$B$%d:$K$%d" % (okopf, okopf) and
          re.match(r"'Ordner'!\$B\$%d:\$K\$%d" % (okopf + 1, okopf + 47 + 6), namen['UO_PLAN']) is not None,
          'Ordner: Namen UO_*, Plan direkt unter der Kopfzeile')
    oroh = roh['Ordner']
    check('state="frozen"' not in oroh, 'Blatt Ordner ohne fixierte Zeilen')
    # VBA-Module
    ole = olefile.OleFileIO(zb.read('xl/vbaProject.bin'))
    projekt = ole.openstream('PROJECT').read().decode('cp1252')
    module = re.findall(r'^(?:Module|Class|Document)=([^/\r\n]+)', projekt, re.M)
    print('    VBA-Module:', ', '.join(module))
    test = any(m.startswith(('clsAt', 'modAttrappe')) for m in module)
    if 'Test' in os.path.basename(out):
        check(test, 'Testvariante enthält die Attrappe')
    else:
        check(not test, 'Produktivdatei ohne Attrappe')
    check(all(m in module for m in ('modUmbau', 'modPlan', 'modModell', 'modOlLesen', 'modOlSchreiben', 'modOlZugang',
                                    'modDialog', 'modLayout', 'modOrdner')), 'Alle Produktivmodule enthalten')

if ref:
    # Erzeugte Blaetter der .xlsm gegen die .xlsx: gleich bis auf erlaubte Zusaetze
    print('Vergleich der erzeugten Blätter mit', os.path.basename(ref))
    c = openpyxl.load_workbook(ref, data_only=True)
    ZUSATZ_ZEILEN = {'Auf einen Blick': lambda z: z.get(2) in ('Umsetzung', 'Ordner', 'Live', 'Sicherung', 'Ordner-Sicherung',
                                                               'Protokoll'),
                     'Anlegen': lambda z: str(z.get(1, '')).startswith('Automatisch umsetzen: Blatt „Umsetzung“')}

    def zeilen(ws):
        out = []
        for row in ws.iter_rows():
            z = {cell.column: cell.value for cell in row if cell.value is not None}
            out.append(z)
        while out and not out[-1]:
            out.pop()
        return out

    def zelle_erlaubt(blatt, alt, neu):
        if alt is None and neu == 'Automatisch umsetzen (Makro)':
            return True                                    # Link auf Umsetzung neben Vergleich/Anlegen
        if isinstance(alt, str) and isinstance(neu, str) and neu.startswith(alt) and len(neu) > len(alt):
            return True                                    # Hinweistext in der .xlsm ergaenzt
        return False

    for blatt in ('Auf einen Blick', 'Vergleich', 'Anlegen'):
        za_, zb_ = zeilen(c[blatt]), zeilen(b[blatt])
        sa = [tuple(sorted(z.items(), key=lambda kv: kv[0])) for z in za_]
        sb = [tuple(sorted(z.items(), key=lambda kv: kv[0])) for z in zb_]
        sm = difflib.SequenceMatcher(None, [repr(x) for x in sa], [repr(x) for x in sb], autojunk=False)
        abw = []
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            if op == 'equal':
                continue
            if op == 'insert' and all(ZUSATZ_ZEILEN.get(blatt, lambda z: False)(zb_[j]) for j in range(j1, j2)):
                continue
            if op == 'replace' and (i2 - i1) == (j2 - j1):
                ok = True
                for i, j in zip(range(i1, i2), range(j1, j2)):
                    if not za_[i] and ZUSATZ_ZEILEN.get(blatt, lambda z: False)(zb_[j]):
                        continue                           # Leerzeile der .xlsx traegt in der .xlsm den Link
                    for col in set(za_[i]) | set(zb_[j]):
                        if za_[i].get(col) != zb_[j].get(col) and not zelle_erlaubt(blatt, za_[i].get(col), zb_[j].get(col)):
                            ok = False
                if ok:
                    continue
            abw.append((op, i1 + 1, i2, j1 + 1, j2))
        for x in abw[:8]:
            print('    Abweichung', blatt, x)
        check(not abw, '%s: gleich der .xlsx bis auf erlaubte Zusätze (Links/Zeilen zum Makro, erweiterter Hinweis)' % blatt)
print('Fehler gesamt:', fehler)
sys.exit(1 if fehler else 0)
