# -*- coding: utf-8 -*-
"""Verarbeitung der Rueckstandsabzuege (OPAG, Verbund) – Python-Spiegel der VBA-Logik in modLaden.

Liest Rohdaten-Blaetter (Kopf in den ersten Zeilen: "Rückstandsstichtag = Mittwoch, 23. September 2026",
Spaltenkoepfe in der Zeile mit "Themenpostkorb"), bildet je Stichtag und Quelle:
- Rueckstand je (Sparte, VSS, Themenpostkorb, GEVO_SL) mit Altersklassen,
- Eingaenge (Schluessel neu gegenueber dem Vortagsstand) und Abgaenge (Schluessel nicht mehr vorhanden,
  zugeordnet nach den Merkmalen des Vortags).
Der Schluessel ist bei Verbund (VSS, Ordnungsbegriff, VORG_VERBU_LNR), bei OPAG zusaetzlich OPS_AUFTR_ID und OPS_ARBGUT_LNR.
"""
import datetime as dt
import re
from collections import OrderedDict

MONATE = ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember']
SPARTE_STANDARD = OrderedDict([
    ('KV', 'KV'), ('LV', 'Leben'), ('LF', 'Leben'), ('LG', 'Leben'),
    ('SV', 'Komposit'), ('KR', 'Komposit'), ('DA', 'Komposit'), ('HA', 'Komposit'), ('AS', 'Komposit'),
    ('UV', 'Komposit'), ('GV', 'Komposit'), ('TR', 'Komposit'), ('IT', 'Komposit'),
])
OHNE_POSTKORB = '(ohne Postkorb)'


def stichtag_aus_text(text):
    """'Rückstandsstichtag = Mittwoch, 23. September 2026' -> date"""
    m = re.search(r'(\d{1,2})\.\s*([A-Za-zäöüÄÖÜ]+)\s+(\d{4})', str(text or ''))
    if not m:
        return None
    monat = m.group(2).lower()
    if monat not in MONATE:
        return None
    return dt.date(int(m.group(3)), MONATE.index(monat) + 1, int(m.group(1)))


def postkorb_norm(wert):
    t = re.sub(r'\s+', ' ', str(wert or '')).strip()
    return t if t else OHNE_POSTKORB


def gevo_typ(gevo_sl):
    """'SV 108 Bestandsübertragung' -> ('108 Bestandsübertragung', 108); '. Ohne Zuordnung' -> ('Ohne Zuordnung', 0)"""
    t = re.sub(r'\s+', ' ', str(gevo_sl or '')).strip()
    if not t:
        return ('(ohne GeVo)', 0)
    teile = t.split(' ', 1)
    if len(teile) == 2 and re.fullmatch(r'[A-Z]{2}', teile[0]):
        t = teile[1]
    t = t.lstrip('. ').strip()
    m = re.match(r'(\d+)\b', t)
    return (t, int(m.group(1)) if m else 0)


def alter_klasse(tage):
    try:
        t = int(tage)
    except (TypeError, ValueError):
        t = 0
    if t <= 7:
        return 0
    if t <= 30:
        return 1
    if t <= 90:
        return 2
    return 3


def blatt_lesen(zeilen):
    """zeilen: Liste von Zeilen (Listen) eines Rohdatenblatts. Liefert (stichtag, quelle, saetze) mit
    saetze = Liste von dict(key, sparte_vss, postkorb, gevo, alter)."""
    stichtag = None
    kopf_i = None
    for i, z in enumerate(zeilen[:15]):
        if stichtag is None:
            for c in z:
                if c is not None and 'stichtag' in str(c).lower():
                    stichtag = stichtag_aus_text(c)
        if any(str(c).strip() == 'Themenpostkorb' for c in z if c is not None):
            kopf_i = i
            break
    if kopf_i is None or stichtag is None:
        return None
    kopf = [str(c).strip() if c is not None else '' for c in zeilen[kopf_i]]
    ix = {h: i for i, h in enumerate(kopf)}
    quelle = 'OPAG' if 'OPS_AUFTR_ID' in ix else 'Verbund'
    n = {k.lower(): i for k, i in ix.items()}
    c_vss = n.get('verwaltungssystemschlüssel')
    c_ob, c_lnr, c_pk, c_alt, c_gevo = n['ordnungsbegriff'], n['vorg_verbu_lnr'], n['themenpostkorb'], n['rückstandsalter_tage'], n['gevo_sl']
    c_auf, c_arb = n.get('ops_auftr_id'), n.get('ops_arbgut_lnr')
    saetze = []
    for z in zeilen[kopf_i + 1:]:
        if c_vss is None or c_vss >= len(z) or z[c_vss] is None or str(z[c_vss]).strip() == '':
            continue
        vss = str(z[c_vss]).strip()
        key = '%s|%s|%s' % (vss, str(z[c_ob]).strip(), str(z[c_lnr]).strip())
        if quelle == 'OPAG':
            key += '|%s|%s' % (str(z[c_auf]).strip(), str(z[c_arb]).strip())
        saetze.append({'key': key, 'vss': vss, 'postkorb': postkorb_norm(z[c_pk]),
                       'gevo': re.sub(r'\s+', ' ', str(z[c_gevo] or '')).strip(), 'alter': alter_klasse(z[c_alt]),
                       'tage': int(z[c_alt]) if isinstance(z[c_alt], (int, float)) else 0})
    return stichtag, quelle, saetze


def verarbeiten(stichtag, quelle, saetze, snapshot, sparten=SPARTE_STANDARD):
    """snapshot: dict key -> (sparte, vss, postkorb, gevo, gevo_typ, gevo_nr) des Vortagsstands oder None.
    Liefert (fakten_zeilen, neuer_snapshot, kennzahlen)."""
    agg = OrderedDict()
    wechsel = OrderedDict()      # Schluessel in beiden Staenden, anderer Themenpostkorb oder GeVo (Blatt Umbuchungen)

    def zeile(sparte, vss, pk, gevo):
        k = (sparte, vss, pk, gevo)
        if k not in agg:
            typ, nr = gevo_typ(gevo)
            agg[k] = [stichtag, quelle, sparte, vss, pk, gevo, typ, nr, 0, 0, 0, 0, 0, 0, 0, 0, 0]    # [15] hoechstes Alter, [16] Summe der Alter (Tage)
        return agg[k]
    neu = {}
    for s in saetze:
        sparte = sparten.get(s['vss'], 'Sonstige')
        z = zeile(sparte, s['vss'], s['postkorb'], s['gevo'])
        z[8] += 1
        z[11 + s['alter']] += 1
        z[15] = max(z[15], s.get('tage', 0))
        z[16] += s.get('tage', 0)
        if snapshot is not None:
            m = snapshot.get(s['key'])
            if m is None:
                z[9] += 1
            elif (m[2], m[3]) != (s['postkorb'], s['gevo']):
                wk = (sparte, m[2], m[3], s['postkorb'], s['gevo'])
                wechsel[wk] = wechsel.get(wk, 0) + 1
        typ, nr = gevo_typ(s['gevo'])
        neu[s['key']] = (sparte, s['vss'], s['postkorb'], s['gevo'], typ, nr)
    if snapshot is not None:
        for key, m in snapshot.items():
            if key not in neu:
                zeile(m[0], m[1], m[2], m[3])[10] += 1
    fakten = list(agg.values())
    kenn = {'zeilen': len(saetze), 'rueckstand': sum(z[8] for z in fakten),
            'eingang': sum(z[9] for z in fakten), 'abgang': sum(z[10] for z in fakten),
            'umbuchungen': [(stichtag, quelle, sp, pv, gevo_typ(gv)[0], gevo_typ(gv)[1], ph, gevo_typ(gh)[0], gevo_typ(gh)[1], n)
                            for (sp, pv, gv, ph, gh), n in wechsel.items()]}
    return fakten, neu, kenn


def blaetter_aus_datei(pfad):
    import openpyxl
    wb = openpyxl.load_workbook(pfad, read_only=True, data_only=True)
    aus = []
    for ws in wb.worksheets:
        zeilen = [list(r) for r in ws.iter_rows(values_only=True)]
        erg = blatt_lesen(zeilen)
        if erg:
            aus.append((pfad, ws.title) + erg)
    wb.close()
    return aus


def anwesenheit_lesen(pfad, jahr):
    """Liest die MAK-Liste: Zeile mit 'Mitarbeiter' ist der Kopf; Spalten 'Makler BÜ Gesundheit' / 'Makler BÜ Komposit'
    geben die Sparte; Spalten 'NN KW' / 'NN. KW' die Wochenwerte (Zahl, 'Urlaub' oder leer)."""
    import openpyxl
    wb = openpyxl.load_workbook(pfad, read_only=True, data_only=True)
    ws = wb.worksheets[0]
    zeilen = [list(r) for r in ws.iter_rows(values_only=True)]
    kopf_i = next(i for i, z in enumerate(zeilen) if any(c is not None and 'mitarbeiter' in str(c).lower() for c in z))
    kopf = [str(c).replace('\n', ' ').strip() if c is not None else '' for c in zeilen[kopf_i]]
    c_ma = next(i for i, h in enumerate(kopf) if 'mitarbeiter' in h.lower())
    c_einheit = next((i for i, h in enumerate(kopf) if 'einheit' in h.lower()), None)
    c_ges = next((i for i, h in enumerate(kopf) if 'gesundheit' in h.lower()), None)
    c_kom = next((i for i, h in enumerate(kopf) if 'komposit' in h.lower()), None)
    kws = [(i, int(re.match(r'(\d{1,2})', h).group(1))) for i, h in enumerate(kopf) if re.match(r'\d{1,2}\.?\s*KW', h)]
    aus = []
    for z in zeilen[kopf_i + 1:]:
        ma = z[c_ma] if c_ma < len(z) else None
        if ma is None or str(ma).strip() == '' or str(ma).strip().upper() == 'MAK':
            continue
        einheit = str(z[c_einheit]).strip() if c_einheit is not None and z[c_einheit] is not None else ''
        ges = z[c_ges] if c_ges is not None else None
        sparte = 'Gesundheit' if isinstance(ges, (int, float)) and ges > 0 else 'Komposit'
        for ci, kw in kws:
            w = z[ci] if ci < len(z) else None
            # Wert: Zahl = MAK der Woche, 'U' = Urlaub, 'A' = sonstige Abwesenheit (Text), None = kein Eintrag (zaehlt als Kapazitaet)
            if isinstance(w, (int, float)):
                mak = float(w)
            elif w is None or str(w).strip() == '':
                mak = None
            elif 'urlaub' in str(w).lower():
                mak = 'U'
            else:
                mak = 'A'
            aus.append((einheit, str(ma).strip(), sparte, jahr, kw, mak))
    wb.close()
    return aus


def mitarbeiter_aus_anwesenheit(anwesenheit):
    """Stammdaten je Mitarbeiter aus den Wochenwerten: Kapazitaet = groesster Wochenwert. Liefert
    [(name, einheit, sparte, kapazitaet)] in Reihenfolge des ersten Auftretens und je Mitarbeiter {(jahr, kw): wert}."""
    reihenfolge, daten, wochen = [], {}, {}
    for einheit, name, sparte, jahr, kw, wert in anwesenheit:
        if name not in daten:
            reihenfolge.append(name)
            daten[name] = [name, einheit, sparte, 0.0]
            wochen[name] = {}
        if isinstance(wert, float) and wert > daten[name][3]:
            daten[name][3] = wert
        wochen[name][(jahr, kw)] = wert
    return [tuple(daten[n]) for n in reihenfolge], wochen
