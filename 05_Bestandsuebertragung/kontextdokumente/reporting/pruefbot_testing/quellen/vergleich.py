# Vergleicht die Original-Arbeitsmappe mit dem Neubau und meldet jede Abweichung.
#
# Aufruf:
#   python3 vergleich.py <original.xlsx> <neu.xlsm> [--zuordnung zuordnung.json] [--json bericht.json]
#                        [--streng] [--max N]
#
# Geprueft werden: Werte, Formeln (normalisiert, Praefixe _xlfn./_xlpm. muessen erhalten bleiben),
# zwischengespeicherte Formelergebnisse, Datumsformate, Tabellen (Name, Spalten, Zeilenzahl,
# Spaltenformeln), Datenueberpruefungen (Bereich + aufgeloeste Listenwerte), bedingte Formate
# (Regeln je Zelle, Reihenfolge, Format vorhanden), Kommentare und Hyperlinks.
#
# Tabellenzellen werden ueber Tabellenname + Spaltenname + Datenzeile verglichen, nicht ueber die
# Adresse: Tabellen duerfen im Neubau verschoben sein. Zellen ausserhalb von Tabellen werden an
# derselben Adresse gesucht, sonst ueber die Zuordnungsdatei, sonst ueber gleichen Inhalt auf dem Blatt
# (dann HINWEIS "verschoben"). Der Neubau darf zusaetzliche Blaetter, Formen und Kopfbereiche haben.
#
# zuordnung.json (optional):
#   {"blaetter": {"Altname": "Neuname"},
#    "zellen":   {"Start & Übersicht!B9": "Start & Übersicht!D12"},
#    "ignorieren": ["Start & Übersicht!A1", "Testfall-Matrix!A1"]}
#
# Ergebnis: FEHLER = inhaltliche Abweichung, HINWEIS = Layout/verschoben/zusaetzlich.
# Rueckgabewert 1, wenn es FEHLER gibt (mit --streng auch bei HINWEISEN).
import sys, os, re, json, argparse, collections, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xlsxroh import (Arbeitsmappe, bereich_split, sqref_zellen, adr, zelle_split, formel_norm, uebersetze,
                     relativ_zu, kommentar_norm, spalte_buchst)

ap = argparse.ArgumentParser()
ap.add_argument('original')
ap.add_argument('neu')
ap.add_argument('--zuordnung')
ap.add_argument('--json')
ap.add_argument('--streng', action='store_true')
ap.add_argument('--max', type=int, default=40, help='hoechstens so viele Einzelzeilen je Gruppe ausgeben')
args = ap.parse_args()

A = Arbeitsmappe(args.original)
N = Arbeitsmappe(args.neu)
zu = json.load(open(args.zuordnung, encoding='utf8')) if args.zuordnung else {}
blatt_map = zu.get('blaetter', {})
zellen_map = zu.get('zellen', {})
ignorieren = set(zu.get('ignorieren', []))

meldungen = []


def melde(stufe, kategorie, ort, text):
    meldungen.append({'stufe': stufe, 'kategorie': kategorie, 'ort': ort, 'text': text})


def nblatt(name):
    return blatt_map.get(name, name)


# ------------------------------------------------------------------ Hilfen
def tab_an(wb, blatt, r, c):
    for t in blatt['tabellen']:
        if t['r1'] <= r <= t['r2'] and t['c1'] <= c <= t['c2']:
            return t
    return None


def schluessel(wb, blatt, r, c):
    """Tabellenzelle -> ('T', tabelle, spalte, zeile); sonst ('Z', blatt, adresse)."""
    t = tab_an(wb, blatt, r, c)
    if t:
        sp = t['spalten'][c - t['c1']]['name']
        if r < t['r1'] + t['headerRowCount']:
            z = 'kopf'
        elif t['totalsRowCount'] and r > t['r2'] - t['totalsRowCount']:
            z = 'ergebnis'
        else:
            z = r - t['r1'] - t['headerRowCount'] + 1
        return ('T', t['name'].lower(), sp, z)
    return ('Z', blatt['name'], adr(r, c))


def schluessel_text(k):
    if k[0] == 'T':
        return '%s[%s] Zeile %s' % (k[1], k[2], k[3])
    return '%s!%s' % (k[1], k[2])


def zelle_von_schluessel(wb, k):
    """Liefert (blatt, adresse) im Workbook fuer einen Tabellenschluessel."""
    t = next((t for t in wb.tabellen.values() if t['name'].lower() == k[1]), None)
    if not t:
        return None, None
    namen = [s['name'] for s in t['spalten']]
    if k[2] not in namen:
        return None, None
    c = t['c1'] + namen.index(k[2])
    if k[3] == 'kopf':
        r = t['r1']
    elif k[3] == 'ergebnis':
        r = t['r2']
    else:
        r = t['r1'] + t['headerRowCount'] + k[3] - 1
        if r > t['r2'] - t['totalsRowCount']:
            return None, None
    return wb.blatt_nach_name[t['blatt']], adr(r, c)


def wert_norm(w):
    if w is None:
        return ''
    if isinstance(w, bool):
        return w
    if isinstance(w, (int, float)):
        return float(w)
    if isinstance(w, str):
        return w.replace('\r\n', '\n')
    return w


def werte_gleich(a, b):
    a, b = wert_norm(a), wert_norm(b)
    if isinstance(a, float) and isinstance(b, float):
        return math.isclose(a, b, rel_tol=1e-12, abs_tol=1e-9)
    return a == b


DATUM_RE = re.compile(r'(?<![\\"])[dmy]', re.I)


def ist_datumsformat(code):
    if not code or code == 'General':
        return False
    c = re.sub(r'"[^"]*"|\[[^\]]*\]|\\.', '', code)
    return bool(re.search(r'[dy]', c, re.I)) or bool(re.search(r'm', c, re.I) and not re.search(r'[hs]', c, re.I) and re.search(r'[dy]', c, re.I))


def numfmt(wb, z):
    if not z:
        return None
    s = z['s']
    return wb.xfs[s]['numFmt'] if s < len(wb.xfs) else None


def kurz(x, n=90):
    s = x if isinstance(x, str) and x.startswith('=') else repr(x)
    return s if len(s) <= n else s[:n] + '...'


def zelle_vergleichen(ort, za, zn, adr_a, adr_n, a_wb=A, n_wb=N):
    """Vergleicht Inhalt zweier Zellen (Original za an adr_a, Neubau zn an adr_n)."""
    fa = za['formel']['text'] if za and za['formel'] else None
    fn = zn['formel']['text'] if zn and zn['formel'] else None
    wa = za['wert'] if za else None
    wn = zn['wert'] if zn else None
    if fa:
        if not fn:
            melde('FEHLER', 'Formel', ort, 'Formel fehlt im Neubau (dort Wert %s). Original: %s' % (kurz(wn), kurz('=' + fa, 160)))
            return
        soll = uebersetze(fa, adr_a, adr_n) if adr_a != adr_n else fa
        if formel_norm(soll) != formel_norm(fn):
            melde('FEHLER', 'Formel', ort, 'Formel abweichend.\n      Original: %s\n      Neubau:   %s'
                  % (kurz('=' + soll, 400), kurz('=' + fn, 400)))
        if za['formel']['dynamisch'] != zn['formel']['dynamisch']:
            melde('FEHLER', 'Formel', ort, 'Dynamische Arrayformel (cm="1"): Original %s, Neubau %s'
                  % (za['formel']['dynamisch'], zn['formel']['dynamisch']))
        if (za['formel']['art'] == 'array') != (zn['formel']['art'] == 'array'):
            melde('FEHLER', 'Formel', ort, 'Formelart abweichend: Original %s, Neubau %s'
                  % (za['formel']['art'], zn['formel']['art']))
        if not werte_gleich(wa, wn):
            melde('FEHLER', 'Zwischenwert', ort, 'Zwischengespeichertes Ergebnis abweichend: Original %s, Neubau %s'
                  % (kurz(wa), kurz(wn)))
        elif za['t'] == 'e' and zn['t'] != 'e':
            melde('FEHLER', 'Zwischenwert', ort, 'Original ist Fehlerwert %s, Neubau nicht' % wa)
    else:
        if fn:
            melde('FEHLER', 'Formel', ort, 'Neubau hat Formel, Original einen festen Wert %s. Neubau: %s'
                  % (kurz(wa), kurz('=' + fn, 160)))
        if not werte_gleich(wa, wn):
            melde('FEHLER', 'Wert', ort, 'Wert abweichend: Original %s, Neubau %s' % (kurz(wa, 160), kurz(wn, 160)))
    # Zahl/Datum-Darstellung
    if isinstance(wert_norm(wa), float):
        da = ist_datumsformat(numfmt(a_wb, za))
        dn = ist_datumsformat(numfmt(n_wb, zn))
        if da and not dn:
            melde('FEHLER', 'Zahlenformat', ort, 'Original ist Datum (%s), Neubau zeigt kein Datumsformat (%s)'
                  % (numfmt(a_wb, za), numfmt(n_wb, zn)))
        elif dn and not da:
            melde('FEHLER', 'Zahlenformat', ort, 'Neubau zeigt Datum (%s), Original nicht (%s)'
                  % (numfmt(n_wb, zn), numfmt(a_wb, za)))
        elif da and dn and numfmt(n_wb, zn) and numfmt(n_wb, zn) != 'mm-dd-yy' \
                and not re.search(r'dd?\.mm\.yy', numfmt(n_wb, zn), re.I):
            # 'mm-dd-yy' ist das eingebaute Format 14 (kurzes Datum der Systemsprache, in Deutsch TT.MM.JJJJ)
            melde('HINWEIS', 'Zahlenformat', ort, 'Datumsformat im Neubau nicht TT.MM.JJJJ: %s' % numfmt(n_wb, zn))


# ------------------------------------------------------------------ A. Blaetter
for b in A.blaetter:
    nn = nblatt(b['name'])
    if nn not in N.blatt_nach_name:
        melde('FEHLER', 'Blatt', b['name'], 'Blatt fehlt im Neubau (gesucht: %s)' % nn)
        continue
    bn = N.blatt_nach_name[nn]
    if b['zustand'] != bn['zustand']:
        melde('HINWEIS', 'Blatt', b['name'], 'Sichtbarkeit: Original %s, Neubau %s' % (b['zustand'], bn['zustand']))
for b in N.blaetter:
    if b['name'] not in [nblatt(x['name']) for x in A.blaetter]:
        melde('HINWEIS', 'Blatt', b['name'], 'Zusaetzliches Blatt im Neubau (%s)' % b['zustand'])

# ------------------------------------------------------------------ B. Tabellen
n_tab = {t['name'].lower(): t for t in N.tabellen.values()}
for name, ta in A.tabellen.items():
    tn = n_tab.get(name.lower())
    ort = name
    if not tn:
        melde('FEHLER', 'Tabelle', ort, 'Tabelle fehlt im Neubau')
        continue
    if tn['name'] != ta['name']:
        melde('HINWEIS', 'Tabelle', ort, 'Schreibweise des Namens: %s' % tn['name'])
    if nblatt(ta['blatt']) != tn['blatt']:
        melde('HINWEIS', 'Tabelle', ort, 'Auf anderem Blatt: Original %s, Neubau %s' % (ta['blatt'], tn['blatt']))
    if ta['ref'] != tn['ref']:
        melde('HINWEIS', 'Tabelle', ort, 'Verschoben: Original %s, Neubau %s' % (ta['ref'], tn['ref']))
    for k in ('headerRowCount', 'totalsRowCount'):
        if ta[k] != tn[k]:
            melde('FEHLER', 'Tabelle', ort, '%s: Original %s, Neubau %s' % (k, ta[k], tn[k]))
    if ta['datenzeilen'] != tn['datenzeilen']:
        melde('FEHLER', 'Tabelle', ort, 'Datenzeilen: Original %d, Neubau %d' % (ta['datenzeilen'], tn['datenzeilen']))
    sa = [s['name'] for s in ta['spalten']]
    sn = [s['name'] for s in tn['spalten']]
    fehlend = [s for s in sa if s not in sn]
    extra = [s for s in sn if s not in sa]
    if fehlend:
        melde('FEHLER', 'Tabelle', ort, 'Spalten fehlen: %s' % fehlend)
    if extra:
        melde('HINWEIS', 'Tabelle', ort, 'Zusaetzliche Spalten: %s' % extra)
    if [s for s in sa if s in sn] != [s for s in sn if s in sa]:
        melde('HINWEIS', 'Tabelle', ort, 'Spaltenreihenfolge abweichend')
    if (ta['stil'] or {}).get('name') != (tn['stil'] or {}).get('name'):
        melde('HINWEIS', 'Tabelle', ort, 'Tabellenstil: Original %s, Neubau %s'
              % ((ta['stil'] or {}).get('name'), (tn['stil'] or {}).get('name')))
    if ta['autofilter'] != tn['autofilter']:
        melde('HINWEIS', 'Tabelle', ort, 'AutoFilter: Original %s, Neubau %s' % (ta['autofilter'], tn['autofilter']))
    ba = A.blatt_nach_name[ta['blatt']]
    bn = N.blatt_nach_name[tn['blatt']]
    for i, spa in enumerate(ta['spalten']):
        if spa['name'] not in sn:
            continue
        j = sn.index(spa['name'])
        spn = tn['spalten'][j]
        ca = ta['c1'] + i
        cn = tn['c1'] + j
        # Daten der Spalte im Original: berechnet oder Eingabe?
        erste_a = ta['r1'] + ta['headerRowCount']
        zellen_a = [ba['zellen'].get(adr(r, ca)) for r in range(erste_a, ta['r2'] - ta['totalsRowCount'] + 1)]
        alle_formel = zellen_a and all(z and z['formel'] for z in zellen_a)
        if spa['berechnet']:
            ort_s = '%s[%s]' % (name, spa['name'])
            if not spn['berechnet']:
                stufe = 'FEHLER' if alle_formel else 'HINWEIS'
                melde(stufe, 'Spaltenformel', ort_s, 'Berechnete Spalte (calculatedColumnFormula) fehlt im Neubau'
                      + ('' if alle_formel else ' (im Original stehen dort feste Werte, Spaltenformel ist ein Rest)'))
            else:
                soll = spa['berechnet']
                if formel_norm(soll) != formel_norm(spn['berechnet']):
                    melde('FEHLER', 'Spaltenformel', ort_s, 'Spaltenformel abweichend.\n      Original: %s\n      Neubau:   %s'
                          % (kurz(soll, 300), kurz(spn['berechnet'], 300)))
                if spa['berechnet_array'] != spn['berechnet_array']:
                    melde('FEHLER', 'Spaltenformel', ort_s, 'Array-Kennzeichen der Spaltenformel: Original %s, Neubau %s'
                          % (spa['berechnet_array'], spn['berechnet_array']))
        elif spn['berechnet']:
            melde('HINWEIS', 'Spaltenformel', '%s[%s]' % (name, spa['name']), 'Neubau hat Spaltenformel, Original nicht')
        # Zellen: Kopf + Daten + Ergebnis
        zeilen = [('kopf', ta['r1'], tn['r1'])]
        for k in range(1, min(ta['datenzeilen'], tn['datenzeilen']) + 1):
            zeilen.append((k, ta['r1'] + ta['headerRowCount'] + k - 1, tn['r1'] + tn['headerRowCount'] + k - 1))
        if ta['totalsRowCount'] and tn['totalsRowCount']:
            zeilen.append(('ergebnis', ta['r2'], tn['r2']))
        for k, ra, rn in zeilen:
            aa, an = adr(ra, ca), adr(rn, cn)
            if '%s!%s' % (ta['blatt'], aa) in ignorieren:
                continue
            za = ba['zellen'].get(aa)
            zn = bn['zellen'].get(an)
            ort_z = '%s[%s] Zeile %s (%s!%s -> %s!%s)' % (name, spa['name'], k, ta['blatt'], aa, tn['blatt'], an)
            if k == 'kopf':
                if not werte_gleich(za['wert'] if za else None, zn['wert'] if zn else None):
                    melde('FEHLER', 'Wert', ort_z, 'Kopfzelle abweichend: %s / %s' % (kurz(za and za['wert']), kurz(zn and zn['wert'])))
                continue
            zelle_vergleichen(ort_z, za, zn, aa, an)

# ------------------------------------------------------------------ C. Zellen ausserhalb von Tabellen


def inhalt_signatur(z):
    if not z:
        return None
    if z['formel']:
        return ('F', formel_norm(z['formel']['text']))
    w = wert_norm(z['wert'])
    if w == '':
        return None
    return ('W', w)


for ba in A.blaetter:
    nname = nblatt(ba['name'])
    bn = N.blatt_nach_name.get(nname)
    if not bn:
        continue
    for ref, za in ba['zellen'].items():
        r, c = zelle_split(ref)
        if tab_an(A, ba, r, c):
            continue
        sig = inhalt_signatur(za)
        if sig is None:
            continue
        voll = '%s!%s' % (ba['name'], ref)
        if voll in ignorieren:
            continue
        ort = voll
        if voll in zellen_map:
            ziel = zellen_map[voll]
            zb, zr = ziel.rsplit('!', 1)
            zbn = N.blatt_nach_name.get(zb)
            if not zbn:
                melde('FEHLER', 'Zelle', ort, 'Zuordnung zeigt auf fehlendes Blatt %s' % zb)
                continue
            zelle_vergleichen(ort + ' -> ' + ziel, za, zbn['zellen'].get(zr), ref, zr)
            continue
        zn = bn['zellen'].get(ref)
        if zn and not tab_an(N, bn, r, c) and inhalt_signatur(zn) == sig:
            zelle_vergleichen(ort, za, zn, ref, ref)
            continue
        # Suche nach gleichem Inhalt auf dem Blatt, dann in der ganzen Mappe
        treffer = None
        for kandidat_blatt in [bn] + [b for b in N.blaetter if b is not bn]:
            for rn, zk in kandidat_blatt['zellen'].items():
                if inhalt_signatur(zk) == sig:
                    treffer = (kandidat_blatt, rn, zk)
                    break
                if za['formel'] and zk['formel']:
                    # verschobene Formel mit A1-Bezuegen
                    if formel_norm(uebersetze(za['formel']['text'], ref, rn)) == formel_norm(zk['formel']['text']):
                        treffer = (kandidat_blatt, rn, zk)
                        break
            if treffer:
                break
        if treffer:
            kb, rn, zk = treffer
            melde('HINWEIS', 'Zelle verschoben', ort, 'gefunden in %s!%s' % (kb['name'], rn))
            zelle_vergleichen(ort + ' -> %s!%s' % (kb['name'], rn), za, zk, ref, rn)
        else:
            if zn:
                zelle_vergleichen(ort, za, zn, ref, ref)
            else:
                art = 'Formel' if za['formel'] else 'Wert'
                melde('FEHLER', 'Zelle fehlt', ort, '%s nicht im Neubau gefunden: %s' % (
                    art, kurz('=' + za['formel']['text'] if za['formel'] else za['wert'], 160)))

# ------------------------------------------------------------------ D. Datenueberpruefungen


def namen_aufloesen(wb, f, tiefe=0):
    f = (f or '').strip().lstrip('=')
    for d in wb.definierte_namen:
        if d['name'].lower() == f.lower() and d['localSheetId'] is None and tiefe < 5:
            return namen_aufloesen(wb, d['bezug'], tiefe + 1)
    return f


def liste_werte(wb, f):
    if f is None:
        return None
    f = namen_aufloesen(wb, f)
    if f.startswith('"'):
        return [x.strip() for x in f.strip('"').split(',')]
    m = re.match(r'^INDIRECT\("(.+)"\)$', f, re.I)
    if m:
        f = m.group(1)
    m = re.match(r'^(tbl\w+)\[([^\]]+)\]$', f)
    if m:
        t = next((t for t in wb.tabellen.values() if t['name'].lower() == m.group(1).lower()), None)
        if not t:
            return None
        namen = [s['name'] for s in t['spalten']]
        if m.group(2) not in namen:
            return None
        c = t['c1'] + namen.index(m.group(2))
        b = wb.blatt_nach_name[t['blatt']]
        return [wert_norm((b['zellen'].get(adr(r, c)) or {}).get('wert'))
                for r in range(t['r1'] + t['headerRowCount'], t['r2'] - t['totalsRowCount'] + 1)]
    m = re.match(r"^(?:'((?:[^']|'')+)'|([^!]+))!(.+)$", f)
    if not m:
        return None
    bname = (m.group(1) or m.group(2)).replace("''", "'")
    b = wb.blatt_nach_name.get(bname)
    if not b:
        return None
    r1, c1, r2, c2 = bereich_split(m.group(3))
    werte = []
    for r in range(r1, r2 + 1):
        for c in range(c1, c2 + 1):
            werte.append(wert_norm((b['zellen'].get(adr(r, c)) or {}).get('wert')))
    while werte and werte[-1] == '':
        werte.pop()
    return werte


def dv_karte(wb):
    karte = {}
    for b in wb.blaetter:
        for i, dv in enumerate(b['datenpruefungen']):
            beschr = {'typ': dv.get('type'), 'operator': dv.get('operator'),
                      'liste': liste_werte(wb, dv.get('formel1')) if dv.get('type') == 'list' else None,
                      'formel1': None if dv.get('type') == 'list' else dv.get('formel1'),
                      'formel2': dv.get('formel2'), 'allowBlank': dv.get('allowBlank') == '1',
                      'fehlermeldung': dv.get('showErrorMessage') == '1', 'roh': dv.get('formel1'),
                      'gruppe': '%s %s' % (b['name'], dv.get('sqref'))}
            for (r, c) in sqref_zellen(dv.get('sqref') or ''):
                karte[schluessel(wb, b, r, c)] = beschr
    return karte


dva = dv_karte(A)
dvn = dv_karte(N)


def nschluessel(k):
    return k if k[0] == 'T' else ('Z', nblatt(k[1]), k[2])


gruppen = collections.defaultdict(list)
for k, d in dva.items():
    dn = dvn.get(nschluessel(k))
    if not dn:
        gruppen[('FEHLER', d['gruppe'], 'Datenueberpruefung fehlt im Neubau (Liste %s)' % d['liste'])].append(k)
        continue
    if d['typ'] != dn['typ']:
        gruppen[('FEHLER', d['gruppe'], 'Typ abweichend: %s / %s' % (d['typ'], dn['typ']))].append(k)
        continue
    if d['typ'] == 'list':
        if d['liste'] != dn['liste']:
            gruppen[('FEHLER', d['gruppe'], 'Listenwerte abweichend: Original %s (%s), Neubau %s (%s)'
                     % (d['liste'], d['roh'], dn['liste'], dn['roh']))].append(k)
    elif (d['formel1'], d['formel2'], d['operator']) != (dn['formel1'], dn['formel2'], dn['operator']):
        gruppen[('FEHLER', d['gruppe'], 'Regel abweichend')].append(k)
    if d['allowBlank'] != dn['allowBlank'] or d['fehlermeldung'] != dn['fehlermeldung']:
        gruppen[('HINWEIS', d['gruppe'], 'Leer erlaubt/Fehlermeldung: Original %s/%s, Neubau %s/%s'
                 % (d['allowBlank'], d['fehlermeldung'], dn['allowBlank'], dn['fehlermeldung']))].append(k)
extra_dv = collections.defaultdict(list)
umgekehrt = {nschluessel(k) for k in dva}
for k, d in dvn.items():
    if k not in umgekehrt:
        extra_dv[d['gruppe'] + ' Liste %s' % d['liste']].append(k)
for (stufe, gruppe, text), ks in gruppen.items():
    beisp = ', '.join(schluessel_text(k) for k in ks[:4]) + (' ...' if len(ks) > 4 else '')
    melde(stufe, 'Datenueberpruefung', gruppe, '%s - %d Zellen, z. B. %s' % (text, len(ks), beisp))
for g, ks in extra_dv.items():
    melde('HINWEIS', 'Datenueberpruefung', g, 'Zusaetzlich im Neubau: %d Zellen, z. B. %s'
          % (len(ks), ', '.join(schluessel_text(k) for k in ks[:3])))

# ------------------------------------------------------------------ E. Bedingte Formate


def cf_karte(wb):
    karte = collections.defaultdict(list)
    for b in wb.blaetter:
        for cf in b['bed_formate']:
            teile = (cf['sqref'] or '').split()
            if not teile:
                continue
            r0, c0, _, _ = bereich_split(teile[0])
            anker = adr(r0, c0)
            for (r, c) in sqref_zellen(cf['sqref']):
                zelle = adr(r, c)
                formeln = [relativ_zu(uebersetze(f, anker, zelle), zelle) for f in cf['formeln']]
                fmt = cf.get('format') or {}
                hat_format = bool(fmt.get('fill') or (fmt.get('font') and (fmt['font'].get('color') or fmt['font'].get('b'))))
                karte[schluessel(wb, b, r, c)].append({
                    'sig': (cf['typ'], cf['operator'], tuple(formel_norm(f) for f in formeln), cf.get('text')),
                    'prio': cf['prioritaet'] if cf['prioritaet'] is not None else 10 ** 6,
                    'stop': cf.get('stopIfTrue') == '1', 'format': fmt, 'hat_format': hat_format,
                    'gruppe': '%s %s (Prio %s): %s' % (b['name'], cf['sqref'], cf['prioritaet'], ' | '.join(cf['formeln']))})
    for k in karte:
        karte[k].sort(key=lambda x: x['prio'])
    return karte


cfa = cf_karte(A)
cfn = cf_karte(N)
cf_gruppen = collections.defaultdict(list)
for k, regeln in cfa.items():
    rn = cfn.get(nschluessel(k), [])
    sig_n = [x['sig'] for x in rn]
    pos = []
    benutzt = set()
    for x in regeln:
        # gleiche Regel kann je Zelle mehrfach vorkommen (ueberlappende Bereiche): der Reihe nach zuordnen
        treffer = next((i for i, s in enumerate(sig_n) if s == x['sig'] and i not in benutzt), None)
        if treffer is None:
            cf_gruppen[('FEHLER', x['gruppe'], 'Regel fehlt im Neubau')].append(k)
            continue
        benutzt.add(treffer)
        y = rn[treffer]
        pos.append(treffer)
        if x['hat_format'] and not y['hat_format']:
            cf_gruppen[('FEHLER', x['gruppe'], 'Regel im Neubau ohne sichtbares Format')].append(k)
        elif x['format'] != y['format']:
            cf_gruppen[('HINWEIS', x['gruppe'], 'Format der Regel abweichend (Farben)')].append(k)
        if x['stop'] != y['stop']:
            cf_gruppen[('FEHLER', x['gruppe'], 'stopIfTrue abweichend')].append(k)
    if pos != sorted(pos):
        cf_gruppen[('FEHLER', regeln[0]['gruppe'], 'Reihenfolge (Prioritaet) der Regeln je Zelle abweichend')].append(k)
for k, regeln in cfn.items():
    sig_a = collections.Counter(x['sig'] for x in cfa.get(k if k[0] == 'T' else ('Z', next((a['name'] for a in A.blaetter if nblatt(a['name']) == k[1]), k[1]), k[2]), []))
    for y in regeln:
        if sig_a[y['sig']] > 0:
            sig_a[y['sig']] -= 1
        else:
            cf_gruppen[('HINWEIS', y['gruppe'], 'Zusaetzliche Regel im Neubau')].append(k)
for (stufe, gruppe, text), ks in cf_gruppen.items():
    beisp = ', '.join(schluessel_text(k) for k in ks[:4]) + (' ...' if len(ks) > 4 else '')
    melde(stufe, 'Bedingtes Format', gruppe, '%s - %d Zellen, z. B. %s' % (text, len(ks), beisp))

# ------------------------------------------------------------------ F. Kommentare und Hyperlinks


def kommentar_karte(wb):
    karte = {}
    for b in wb.blaetter:
        for k in b['kommentare']:
            r, c = zelle_split(k['ref'])
            karte[schluessel(wb, b, r, c)] = k['text_norm']
        for k in b['verkettete_kommentare']:
            if k.get('parentId'):
                continue
            r, c = zelle_split(k['ref'])
            karte[schluessel(wb, b, r, c)] = (k['text'] or '').strip()
    return karte


ka, kn = kommentar_karte(A), kommentar_karte(N)
for k, text in ka.items():
    t2 = kn.get(nschluessel(k))
    if t2 is None:
        melde('FEHLER', 'Kommentar', schluessel_text(k), 'Kommentar fehlt: %s' % kurz(text, 120))
    elif t2.strip() != text.strip():
        melde('FEHLER', 'Kommentar', schluessel_text(k), 'Kommentartext abweichend: %s / %s' % (kurz(text, 100), kurz(t2, 100)))


def link_karte(wb):
    karte = {}
    for b in wb.blaetter:
        for h in b['hyperlinks']:
            for (r, c) in sqref_zellen(h['ref']):
                karte[schluessel(wb, b, r, c)] = h.get('ziel') or ('#' + (h.get('location') or ''))
    return karte


la, ln = link_karte(A), link_karte(N)
for k, ziel in la.items():
    z2 = ln.get(nschluessel(k))
    if z2 is None:
        melde('FEHLER', 'Hyperlink', schluessel_text(k), 'Hyperlink fehlt: %s' % ziel)
    elif z2 != ziel:
        melde('FEHLER', 'Hyperlink', schluessel_text(k), 'Hyperlinkziel abweichend: %s / %s' % (ziel, z2))

# ------------------------------------------------------------------ G. Layout (nur Hinweise)
for ba in A.blaetter:
    bn = N.blatt_nach_name.get(nblatt(ba['name']))
    if not bn:
        continue
    fa = (ba['ansicht'] or {}).get('fixierung')
    fn = (bn['ansicht'] or {}).get('fixierung')
    if (fa or {}).get('state') == 'frozen' and (fn or {}).get('state') != 'frozen':
        melde('HINWEIS', 'Layout', ba['name'], 'Fixierung fehlt im Neubau (Original %s)' % fa)
    ma = set(m for m in ba['verbunden'] if not tab_an(A, ba, *zelle_split(m.split(':')[0])))
    mn = set(bn['verbunden'])
    fehl = sorted(ma - mn)
    if fehl:
        melde('HINWEIS', 'Layout', ba['name'], 'Verbundene Bereiche des Originals nicht im Neubau: %s' % fehl)

# ------------------------------------------------------------------ Ausgabe
fehler = [m for m in meldungen if m['stufe'] == 'FEHLER']
hinweise = [m for m in meldungen if m['stufe'] == 'HINWEIS']
print('Vergleich %s  ->  %s' % (os.path.basename(args.original), os.path.basename(args.neu)))
print('=' * 78)
for stufe, liste in (('FEHLER', fehler), ('HINWEIS', hinweise)):
    nach_kat = collections.OrderedDict()
    for m in liste:
        nach_kat.setdefault(m['kategorie'], []).append(m)
    for kat, ms in nach_kat.items():
        print('\n%s | %s (%d)' % (stufe, kat, len(ms)))
        for m in ms[:args.max]:
            print('  - %s: %s' % (m['ort'], m['text']))
        if len(ms) > args.max:
            print('  ... %d weitere' % (len(ms) - args.max))
print('\n' + '=' * 78)
print('Zusammenfassung: %d FEHLER, %d HINWEISE' % (len(fehler), len(hinweise)))
if args.json:
    json.dump(meldungen, open(args.json, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
sys.exit(1 if fehler or (args.streng and hinweise) else 0)
