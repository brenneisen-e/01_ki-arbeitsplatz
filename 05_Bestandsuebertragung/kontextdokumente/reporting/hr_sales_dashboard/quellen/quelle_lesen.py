# -*- coding: utf-8 -*-
"""Liest das bisherige Dashboard (quelle/2025_Dashboard_HS_OPAG.xlsm) und liefert die Inhalte, die der Neubau uebernimmt:
Rohdaten, Rohdaten_2, Rohdaten_3 (Werte, Formeln, verbundene Zellen), Feiertage, die Kommentartexte der Folien und die
externe Verknuepfung (Mig-Max-Namensliste) fuer die MAK-Zeilen."""
import datetime as dt
import os
import re
import zipfile

import openpyxl
from lxml import etree

HIER = os.path.dirname(os.path.abspath(__file__))
QUELLE = os.path.join(HIER, 'quelle', '2025_Dashboard_HS_OPAG.xlsm')
# Nachtraege (07.10.2026): Basis bleibt die OPAG-Fassung (BUE-Zeilen 7VA..7OL). Neuere Werte kommen je Code und Datum dazu:
# - das vom Fachbereich weitergefuehrte alte Dashboard (alte Zeilenstruktur, BUE nur 7a..7f): alle Werte ausser 7V*/7O*,
#   Rohdaten_3 vollstaendig und die Kommentartexte der Folien
# - die Arbeitsfassung des neuen Dashboards: die BUE-Werte 7V*/7O* (zwischengespeicherte Werte der Verknuepfung zum BUE-Reporting)
NACHTRAG_HS = os.path.join(HIER, 'quelle', '2025_Dashboard_HS.xlsm')
NACHTRAG_BUE = os.path.join(HIER, 'quelle', '2026_HR_Sales_Dashboard_WIP2.xlsm')
# Nachtrag (09.10.2026): Arbeitsfassung WIP9 des neuen Dashboards, zuletzt vom Fachbereich gepflegt – neueste Quelle fuer die
# eingetippten Werte (Rohdaten, Rohdaten_3), die zwischengespeicherten MAK-Werte (Rohdaten_2), die Verantwortlichen (Spalte E),
# die Punkte in Zuständigkeiten (neue Kollegen) und die Pfade in der Konfiguration
# Ab der Umstellung auf den Meldetag Montag (erste Meldung Montag 19.10.2026 fuer KW 42) heisst jede Wochenspalte in Rohdaten wie
# ihr Meldetag: der Freitag der KW plus 3 Tage (19.10., 26.10., …). Die Wochen davor bleiben Freitage. Werte aus den Quelldateien
# werden vorher ueber die Freitage zugeordnet (dort sind alle Spalten Freitage).
UMSTELLUNG = dt.date(2026, 10, 19)


def montage(b):
    """Wochenspalten ab der Umstellung auf den Montag nach dem Freitag der KW setzen."""
    n = 0
    for c in b.datumsspalten():
        d = b.kopf[c]
        if d.weekday() == 4 and d.date() + dt.timedelta(days=3) >= UMSTELLUNG:
            b.kopf[c] = d + dt.timedelta(days=3)
            n += 1
    return n


NACHTRAG_WIP = os.path.join(HIER, 'quelle', '2026_HR_Sales_Dashboard_WIP9.xlsm')
# Arbeitsfassung WIP12 (12.10.2026, schon im neuen Aufbau: Monatsbloecke in Rohdaten, Blatt Kommentare): Werte, Verantwortliche,
# Punkte, Zyklus, Personen, Konfiguration und alle Kommentartexte; gilt nach WIP9 (neuer)
NACHTRAG_WIP12 = os.path.join(HIER, 'quelle', '2026_HR_Sales_Dashboard_WIP12.xlsm')

NS = {'xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
      'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'}


class Blatt:
    """Ein Datenblatt: Kopfzeile (Datum oder Δ je Spalte), Zellen (Wert oder Formel), verbundene Bereiche."""
    def __init__(self, name, ws_f, ws_v, letzte_zeile, letzte_spalte):
        self.name = name
        self.zeilen = letzte_zeile
        self.spalten = letzte_spalte
        self.kopf = {}                      # Spalte -> datetime | 'Δ' | Text
        self.zellen = {}                    # (zeile, spalte) -> Wert oder Formeltext ('=...')
        self.werte = {}                     # (zeile, spalte) -> zwischengespeicherter Wert (fuer Formeln)
        self.nachgetragen = set()           # (zeile, spalte): Zahl aus einem Nachtrag (nicht aus der Basisdatei)
        self.verbunden = [str(m) for m in ws_f.merged_cells.ranges]
        self.ausgeblendet = sorted(r for r, d in ws_f.row_dimensions.items() if d.hidden and r <= letzte_zeile)
        for c in range(1, letzte_spalte + 1):
            self.kopf[c] = ws_v.cell(1, c).value
        for r in range(1, letzte_zeile + 1):
            for c in range(1, letzte_spalte + 1):
                f = ws_f.cell(r, c).value
                if f is None:
                    continue
                if isinstance(f, str) and f.startswith('='):
                    self.zellen[(r, c)] = f
                    self.werte[(r, c)] = ws_v.cell(r, c).value
                elif isinstance(f, str):
                    t = f.replace('\xa0', ' ').strip()
                    if t:
                        self.zellen[(r, c)] = t
                else:
                    self.zellen[(r, c)] = f

    def datumsspalten(self):
        return [c for c in range(1, self.spalten + 1) if isinstance(self.kopf.get(c), dt.datetime)]

    def code_zeilen(self):
        """Code in Spalte A -> Zeile (Kleinschreibung als Schluessel)."""
        out = {}
        for r in range(3, self.zeilen + 1):
            v = self.zellen.get((r, 1))
            if v is not None and str(v).strip():
                out[str(v).strip().lower()] = r
        return out


def _kommentare(z):
    """Absaetze der Kommentar-Textfelder (Rectangle 8731) auf PPT_2 und PPT_3: [(fett, ebene, text)]."""
    out = {}
    for blatt, datei in (('PPT_2', 'xl/drawings/drawing3.xml'), ('PPT_3', 'xl/drawings/drawing4.xml')):
        t = etree.fromstring(z.read(datei))
        absaetze = []
        for sp in t.iter('{%s}sp' % NS['xdr']):
            if sp.find('.//xdr:cNvPr', NS).get('name') != 'Rectangle 8731':
                continue
            for p in sp.iter('{%s}p' % NS['a']):
                runs = p.findall('a:r', NS)
                text = ''.join(r.findtext('a:t', default='', namespaces=NS) for r in runs).strip()
                fett = any(r.find('a:rPr', NS) is not None and r.find('a:rPr', NS).get('b') == '1' for r in runs)
                pPr = p.find('a:pPr', NS)
                ebene = 0
                if pPr is not None:
                    ebene = int(pPr.get('lvl', '0'))
                    marl = int(pPr.get('marL', '0') or 0)
                    if marl > 300000:
                        ebene = max(ebene, 1)
                if text:
                    absaetze.append((fett, ebene, text))
        out[blatt] = absaetze
    return out


def _norm(v):
    """Beschriftung zum Vergleich wie modAltWerte.Norm: klein, nur Buchstaben und Ziffern, alles andere trennt."""
    if v is None:
        return ''
    return ' '.join(re.findall(r'[0-9a-zäöüßà-ÿ]+', str(v).lower()))


def schluessel(zeilen):
    """Schluessel je Zeile (ab Zeile 3) wie modAltWerte.Gliedern: Zeile mit Code -> (code, 0, ''); Zeile ohne Code -> (Code-Block,
    Abstand, Beschriftung). Code-Block = letzter Code darueber im selben Thema (Spalte B gilt bis zum naechsten Eintrag), sonst der
    erste darunter im selben Thema (Abstand dann negativ; z. B. „Provisionsreklamation EASY/Online“ vor 8a). zeilen: {r: (A, B, C, D)}."""
    nr, thema, n = {}, None, 0
    for r in sorted(zeilen):
        b = _norm(zeilen[r][1])
        if b and (b != thema or n == 0):
            n += 1
        if b:
            thema = b
        nr[r] = n
    code = {r: str(zeilen[r][0]).strip().lower() for r in zeilen if zeilen[r][0] not in (None, '') and str(zeilen[r][0]).strip()}
    out = {}
    folge = sorted(zeilen)
    for i, r in enumerate(folge):
        if r in code:
            out[r] = (code[r], 0, '')
            continue
        kopf = next((x for x in reversed(folge[:i]) if nr[x] == nr[r] and x in code), None)
        if kopf is None:
            kopf = next((x for x in folge[i + 1:] if nr[x] == nr[r] and x in code), None)
        lab = _norm(zeilen[r][2]) + '|' + _norm(zeilen[r][3])
        if kopf is not None and lab != '|':
            out[r] = (code[kopf], r - kopf, lab)
    return out


def _werte_je_code(datei, blatt, nur_werte=False, bis=None):
    """(schluessel, datum) -> Zahl aus einem Datenblatt mit Code in Spalte A und Datum in Zeile 1 (zwischengespeicherte Werte).
    Schluessel siehe schluessel(): auch Zeilen ohne Code (Eingabezeilen unter bzw. vor einer Summe). nur_werte: nur eingetippte
    Zahlen, keine Ergebnisse von Formeln (die Formeln schreibt der Build selbst fort)."""
    ws = openpyxl.load_workbook(datei, data_only=True, read_only=True)[blatt]
    zeilen = [list(z) for z in ws.iter_rows(values_only=True)]
    if nur_werte:
        wf = openpyxl.load_workbook(datei, read_only=True)[blatt]
        for i, z in enumerate(wf.iter_rows(values_only=True)):
            for j, v in enumerate(z):
                if isinstance(v, str) and v.startswith('=') and i < len(zeilen) and j < len(zeilen[i]):
                    zeilen[i][j] = None
    kopf = zeilen[0]
    if bis:                                   # nur die Wochenzeilen (darunter die Monatsbloecke mit eigener Kopfzeile)
        zeilen = zeilen[:bis]
    beschr = {i + 1: (tuple(z[:4]) + (None,) * 4)[:4] for i, z in enumerate(zeilen) if i + 1 >= 3 and z}
    sl = schluessel(beschr)
    out = {}
    for i, z in enumerate(zeilen):
        if i + 1 not in sl:
            continue
        for j, k in enumerate(kopf):
            if isinstance(k, dt.datetime) and j < len(z) and isinstance(z[j], (int, float)) and not isinstance(z[j], bool):
                out[(sl[i + 1], k)] = z[j]
    return out


def _nachtragen(b, werte, codes=None, ohne=()):
    """Traegt Werte je (schluessel, datum) in das Blatt b ein: nur Datumsspalten, nur Zellen ohne Formel; merkt die Zellen in
    b.nachgetragen und liefert die Zahl der Aenderungen."""
    spalte = {b.kopf[c]: c for c in b.datumsspalten()}
    beschr = {r: tuple(b.zellen.get((r, c)) for c in (1, 2, 3, 4)) for r in range(3, b.zeilen + 1)}
    zeile = {k: r for r, k in schluessel(beschr).items()}
    n = 0
    for (k, datum), v in werte.items():
        code = k[0]
        if (codes and not code.startswith(codes)) or code.startswith(ohne):
            continue
        r, c = zeile.get(k), spalte.get(datum)
        if r is None or c is None:
            continue
        alt = b.zellen.get((r, c))
        if isinstance(alt, str) and alt.startswith('='):
            continue
        if alt != v:
            b.zellen[(r, c)] = v
            b.nachgetragen.add((r, c))
            n += 1
    return n


def lesen():
    wb_f = openpyxl.load_workbook(QUELLE)
    wb_v = openpyxl.load_workbook(QUELLE, data_only=True)
    q = {}
    q['Rohdaten'] = Blatt('Rohdaten', wb_f['Rohdaten'], wb_v['Rohdaten'], 157, 322)
    q['Rohdaten_2'] = Blatt('Rohdaten_2', wb_f['Rohdaten_2'], wb_v['Rohdaten_2'], 5, wb_f['Rohdaten_2'].max_column)
    q['Rohdaten_3'] = Blatt('Rohdaten_3', wb_f['Rohdaten_3'], wb_v['Rohdaten_3'], 7, wb_f['Rohdaten_3'].max_column)
    fei = wb_v['Feiertage']
    q['Feiertage'] = [[fei.cell(r, c).value for c in range(1, fei.max_column + 1)] for r in range(1, fei.max_row + 1)]
    ueb = wb_f['Übersicht']
    q['Uebersicht_codes'] = [(str(ueb.cell(r, 2).value).strip(), ueb.cell(r, 3).value) for r in list(range(10, 35)) + list(range(36, 42))
                             if ueb.cell(r, 2).value is not None]
    z = zipfile.ZipFile(QUELLE)
    q['Kommentare'] = _kommentare(z)
    q['ExternerLink'] = {n: z.read(n) for n in z.namelist() if n.startswith('xl/externalLinks/')}
    z.close()
    q['Nachtrag'] = {}
    if os.path.exists(NACHTRAG_HS):
        q['Nachtrag']['Rohdaten (Dashboard HS)'] = _nachtragen(q['Rohdaten'], _werte_je_code(NACHTRAG_HS, 'Rohdaten'), ohne=('7v', '7o'))
        hs_f = openpyxl.load_workbook(NACHTRAG_HS)
        hs_v = openpyxl.load_workbook(NACHTRAG_HS, data_only=True)
        q['Rohdaten_3'] = Blatt('Rohdaten_3', hs_f['Rohdaten_3'], hs_v['Rohdaten_3'], 7, hs_f['Rohdaten_3'].max_column)
        z = zipfile.ZipFile(NACHTRAG_HS)
        q['Kommentare'] = _kommentare(z)
        z.close()
    if os.path.exists(NACHTRAG_BUE):
        q['Nachtrag']['BÜ 7V/7O (Arbeitsfassung)'] = _nachtragen(q['Rohdaten'], _werte_je_code(NACHTRAG_BUE, 'Rohdaten'), codes=('7v', '7o'))
    if os.path.exists(NACHTRAG_WIP):
        _wip_lesen(q, NACHTRAG_WIP, 'WIP9')
    if os.path.exists(NACHTRAG_WIP12):
        _wip_lesen(q, NACHTRAG_WIP12, 'WIP12')
    q['Montage'] = montage(q['Rohdaten'])
    return q


def _wip_lesen(q, pfad, name):
    """Arbeitsfassung uebernehmen (WIP9: Monatswerte in Rohdaten_2/_3; WIP12: neuer Aufbau mit Monatsbloecken in Rohdaten und
    Blatt Kommentare). Zeilen ueber den Schluessel (Code bzw. Code-Block, Abstand, Beschriftung), Spalten ueber das Datum."""
    b = q['Rohdaten']
    wf = openpyxl.load_workbook(pfad)
    wv = openpyxl.load_workbook(pfad, data_only=True)
    wr = wf['Rohdaten']
    monat_k = [r for r in range(3, wr.max_row + 1) if wr.cell(r, 1).value == 'Monat']      # Kopfzeilen der Monatsbloecke
    bis = (monat_k[0] - 1) if monat_k else None
    q['Nachtrag']['Rohdaten (Arbeitsfassung %s)' % name] = _nachtragen(b, _werte_je_code(pfad, 'Rohdaten', nur_werte=True, bis=bis))
    # Zeilen der WIP-Datei -> Zeilen hier (nur Wochenzeilen)
    wr_bis = bis or wr.max_row
    beschr_w = {r: tuple(wr.cell(r, c).value for c in (1, 2, 3, 4)) for r in range(3, wr_bis + 1)}
    beschr_h = {r: tuple(b.zellen.get((r, c)) for c in (1, 2, 3, 4)) for r in range(3, b.zeilen + 1)}
    hier = {k: r for r, k in schluessel(beschr_h).items()}
    w2h = {r: hier[k] for r, k in schluessel(beschr_w).items() if k in hier}
    # Verantwortlich (Spalte E)
    n = 0
    for rw, rh in w2h.items():
        v = wr.cell(rw, 5).value
        v = v.replace('\xa0', ' ').strip() if isinstance(v, str) else v
        if (v or None) != b.zellen.get((rh, 5)):
            if v:
                b.zellen[(rh, 5)] = v
            else:
                b.zellen.pop((rh, 5), None)
            n += 1
    q['Nachtrag']['Verantwortlich (%s)' % name] = n
    # Monatsbloecke (WIP12): Kopfzeile k (Spalte F = frueheres Blatt), k+1 Y/X, ab k+2 die Zeilen 3.. des frueheren Blatts
    blockzeile = {}
    for k in monat_k:
        quelle = wr.cell(k, 6).value
        if quelle in q:
            for orig in range(3, q[quelle].zeilen + 1):
                blockzeile[k + 2 + orig - 3] = (quelle, orig)
    # Punkte in Zuständigkeiten: Rohdaten-Zeile (Spalte A) -> Personen; Personenliste aus der Konfiguration
    wz = wv['Zuständigkeiten']
    koepfe = {c: wz.cell(4, c).value for c in range(9, 39) if wz.cell(4, c).value}
    q['Zuordnung'], q['Zyklus'], q['ZuordnungMonat'] = {}, {}, {}
    zyk_spalte = 7 if str(wz.cell(4, 7).value).strip() == 'Zyklus' else None
    for r in range(5, wz.max_row + 1):
        if wz.cell(r, 41).value != 'W' or not isinstance(wz.cell(r, 1).value, (int, float)):
            continue
        rw = int(wz.cell(r, 1).value)
        punkte = [p for c, p in koepfe.items() if wz.cell(r, c).value == '\u25cf']
        if rw in w2h:
            q['Zuordnung'][w2h[rw]] = punkte
            if zyk_spalte and wz.cell(r, zyk_spalte).value:
                q['Zyklus'][w2h[rw]] = wz.cell(r, zyk_spalte).value
        elif rw in blockzeile:
            q['ZuordnungMonat'][blockzeile[rw]] = punkte
    q['Personen'] = [wv['Konfiguration'].cell(r, 2).value for r in range(28, 58) if wv['Konfiguration'].cell(r, 2).value]
    q['Konfig'] = {z: wv['Konfiguration'][z].value for z in ('C10', 'C62', 'C9', 'F9', 'F10', 'C13')}
    # Kommentare (Blatt im neuen Aufbau): (Blatt, Kachel) -> (Nr, Ueberschrift, Text)
    if 'Kommentare' in wv.sheetnames:
        wk = wv['Kommentare']
        q['KommentareBlatt'] = {}
        for z in wk.iter_rows(min_row=4, values_only=True):
            if z and z[0] in ('PPT_2', 'PPT_3') and str(z[1] or '').strip().isdigit():
                q['KommentareBlatt'][(z[0], int(z[1]))] = (str(z[2] or z[1]), str(z[3] or ''), str(z[4] or ''))
    # Monatswerte aus den Bloecken (WIP12)
    for k in monat_k:
        quelle = wr.cell(k, 6).value
        if quelle not in q:
            continue
        mb, n = q[quelle], 0
        spalte = {mb.kopf[c]: c for c in mb.datumsspalten()}
        for c in range(1, wr.max_column + 1):
            ziel = spalte.get(wv['Rohdaten'].cell(k, c).value)
            if ziel is None:
                continue
            for orig in range(3, mb.zeilen + 1):
                r = k + 2 + orig - 3
                fx, wert = wr.cell(r, c).value, wv['Rohdaten'].cell(r, c).value
                alt = mb.zellen.get((orig, ziel))
                if isinstance(fx, str) and fx.startswith('='):
                    if isinstance(alt, str) and alt.startswith('=') and isinstance(wert, (int, float)):
                        mb.werte[(orig, ziel)] = wert
                    continue
                if isinstance(fx, (int, float)) and not isinstance(fx, bool) and not (isinstance(alt, str) and alt.startswith('=')) and alt != fx:
                    mb.zellen[(orig, ziel)] = fx
                    n += 1
        q['Nachtrag']['%s (%s, Monatsblock)' % (quelle, name)] = n
    # Monatsblaetter: eingetippte Zahlen (Rohdaten_3) und zwischengespeicherte Werte der Verknuepfung (Rohdaten_2), je Zeile und Monat
    for blatt in ('Rohdaten_2', 'Rohdaten_3'):
        if blatt not in wf.sheetnames:
            continue
        mb, f, v = q[blatt], wf[blatt], wv[blatt]
        spalte = {mb.kopf[c]: c for c in mb.datumsspalten()}
        n = 0
        for c in range(1, f.max_column + 1):
            ziel = spalte.get(f.cell(1, c).value)
            if ziel is None:
                continue
            for r in range(3, min(f.max_row, mb.zeilen) + 1):
                fx, wert = f.cell(r, c).value, v.cell(r, c).value
                alt = mb.zellen.get((r, ziel))
                if isinstance(fx, str) and fx.startswith('='):
                    if isinstance(alt, str) and alt.startswith('=') and isinstance(wert, (int, float)):
                        mb.werte[(r, ziel)] = wert
                    continue
                if isinstance(fx, (int, float)) and not isinstance(fx, bool) and not (isinstance(alt, str) and alt.startswith('=')) and alt != fx:
                    mb.zellen[(r, ziel)] = fx
                    n += 1
        q['Nachtrag']['%s (%s)' % (blatt, name)] = n


if __name__ == '__main__':
    q = lesen()
    r = q['Rohdaten']
    print(len(r.zellen), 'Zellen,', len(r.datumsspalten()), 'Datumsspalten, Codes:', len(r.code_zeilen()), 'Nachtrag:', q['Nachtrag'])
    print(q['Uebersicht_codes'])
    for b, a in q['Kommentare'].items():
        print(b, a[:3])
