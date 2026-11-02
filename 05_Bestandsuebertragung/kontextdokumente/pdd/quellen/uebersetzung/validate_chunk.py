# -*- coding: utf-8 -*-
"""Prueft eine uebersetzte Chunk-Datei: python3 validate_chunk.py chunk_NN_en.json

Erwartetes Format: Liste von {"de": ..., "en": ..., "art": "text"|"wert"}; jede DE-Zeichenkette aus chunk_NN_de.json
muss genau einmal vorkommen. Regeln: Variablen <...> identisch (Multimenge), BUE_-Feldnamen identisch, Inhalte in „…“
unveraendert, keine deutschen Steuerwoerter am Zeilenanfang, Werte (art=wert) beginnen mit dem deutschen Original.
"""
import json, re, sys, os
f = sys.argv[1]
de_f = f.replace('_en.json', '_de.json')
en = json.load(open(f, encoding='utf-8'))
de = json.load(open(de_f, encoding='utf-8'))
fehler = []
soll = [e['de'] for e in de]
ist = [e.get('de') for e in en]
if sorted(soll) != sorted(ist):
    fehlend = [t for t in soll if t not in ist]
    zuviel = [t for t in ist if t not in soll]
    fehler.append(f'DE-Menge weicht ab: fehlend={fehlend[:3]} zuviel={zuviel[:3]}')
VAR = re.compile(r'<[A-Za-z0-9_\-…]+>')
ANF = re.compile(r'„([^“]*)“')
DEUTSCH = ('WENN', 'DANN', 'SONST', 'Ende WENN', 'Hinweis:', 'Weiter zum', 'Weiter mit', 'Lese ', 'Öffne ', 'Merke ')
art = {e['de']: e.get('art', 'text') for e in de}
for e in en:
    d, t = e.get('de', ''), e.get('en', '')
    if not isinstance(t, str) or not t.strip():
        fehler.append(f'leer: {d[:60]}'); continue
    if sorted(VAR.findall(d)) != sorted(VAR.findall(t)):
        fehler.append(f'Variablen weichen ab: {d[:70]!r} -> {t[:70]!r}')
    if sorted(re.findall(r'\bBUE_[A-Z0-9_]+', d)) != sorted(re.findall(r'\bBUE_[A-Z0-9_]+', t)):
        fehler.append(f'BUE_-Felder weichen ab: {d[:70]!r}')
    if sorted(ANF.findall(d)) != sorted(ANF.findall(t)):
        fehler.append(f'Inhalt in „…“ veraendert: {d[:70]!r} -> {t[:70]!r}')
    if t.startswith(DEUTSCH) and art.get(d) != 'wert':
        fehler.append(f'deutsches Steuerwort/Formel am Anfang: {t[:60]!r}')
    if art.get(d) == 'wert' and not t.startswith(d):
        fehler.append(f'Wert muss mit dem deutschen Original beginnen: {d!r} -> {t[:60]!r}')
    if d == t and len(d) > 25 and re.search(r'[a-zäöü]{4,}\s[a-zäöü]{4,}', d) and art.get(d) != 'wert':
        fehler.append(f'unuebersetzt: {d[:70]!r}')
if fehler:
    print('FEHLER', len(fehler))
    print('\n'.join(fehler[:40]))
    sys.exit(1)
print('OK', len(en), 'Eintraege')
