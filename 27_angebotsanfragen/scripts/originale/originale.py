#!/usr/bin/env python3
"""Originalseiten der Beispielanfragen für die App erzeugen.

Aus den PDF der Beispielanfragen (liegen NICHT im Repo) entstehen
  src/assets/originale/b2-1.webp           Seite 1 von Beispiel 2
  src/assets/originale/b2-1.neutral.webp   dieselbe Seite ohne Hausbegriffe und Logo (nur wo nötig)
  src/daten/originale.js                   Lage jeder Fundstelle auf den Seiten

Aufruf, aus dem Ordner der App:

  python3 scripts/originale/originale.py <Ordner mit Beispiel_1.pdf … Beispiel_5.pdf> [--kontrolle]

Ablauf
  1. Seiten rendern (pdftoppm, 150 dpi) und auf 1240 × 1754 px bringen.
  2. Wörter mit Position lesen: aus der Textebene (pdfplumber) oder, bei Scans, per Texterkennung (tesseract).
  3. Retuschen anwenden (retuschen.json): Reste echter Angaben, spätere Bearbeitungsvermerke und übereinander
     gedruckte Ersatzwerte; in der Fassung „neutral“ zusätzlich Hausbegriffe und Logo. Die Datei nennt nur
     Rechtecke und Ersatztexte, keine echten Angaben.
  4. Markierungen der nachgebauten Dokumente holen (marken.mjs liest src/daten/beispielN.js).
  5. Jede Markierung auf der Seite verorten (siehe verorte); was sich nicht eindeutig finden lässt, steht
     in korrektur.json.
  6. Bilder als WebP und die Rechtecke als originale.js ablegen.

Mit --kontrolle entstehen im Arbeitsordner Bilder mit eingezeichneten Rechtecken (kontrolle-b2-1.png …).
Danach `npm run datenpruefung`: Sie vergleicht originale.js mit den nachgebauten Dokumenten.

Braucht: pdfplumber, Pillow, poppler (pdftoppm), tesseract mit Sprachpaket deu, Node und die Schriften
Carlito, Liberation Sans, DejaVu Sans und Inter (für die Ersatztexte).
"""

import csv, glob, io, json, os, re, statistics, subprocess, sys, tempfile

import pdfplumber
from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HIER, '..', '..'))
BREITE, HOEHE = 1240, 1754
QUALITAET = 82
MARKE_DER_BEISPIELE = 'nuernberger'      # in dieser Marke erscheinen die Seiten wie geliefert

SCHRIFT = {
    'carlito': '/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf',
    'liberation': '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    'dejavu': '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    'inter': '/usr/share/fonts/opentype/inter/Inter-Regular.otf',
    'inter-fett': '/usr/share/fonts/opentype/inter/Inter-Bold.otf',
}


def schrift(name, px):
    return ImageFont.truetype(SCHRIFT[name], max(6, int(round(px))))


# ============================================================ 1 und 2: Seiten und Wörter

def lies_pdf(pfad, name, arbeit):
    """Rendert die Seiten und liefert je Seite { quelle, woerter: [[text, x0, y0, x1, y1], …] } in Seitenanteilen."""
    seiten = []
    with pdfplumber.open(pfad) as pdf:
        for i, p in enumerate(pdf.pages, 1):
            bild = os.path.join(arbeit, f'{name}-{i}.png')
            subprocess.run(['pdftoppm', '-r', '150', '-f', str(i), '-l', str(i), '-png', '-singlefile', pfad, bild[:-4]], check=True)
            im = Image.open(bild).convert('RGB')
            if im.size != (BREITE, HOEHE):
                im = im.resize((BREITE, HOEHE), Image.LANCZOS)
            im.save(bild)
            w = p.extract_words(x_tolerance=1.5, y_tolerance=2, keep_blank_chars=False)
            if w:
                seiten.append({'quelle': 'text', 'woerter': [[x['text'], x['x0'] / p.width, x['top'] / p.height, x['x1'] / p.width, x['bottom'] / p.height] for x in w]})
                continue
            # Scan: höher aufgelöst rendern und erkennen
            gross = os.path.join(arbeit, f'ocr-{name}-{i}')
            subprocess.run(['pdftoppm', '-r', '300', '-f', str(i), '-l', str(i), '-png', '-singlefile', pfad, gross], check=True)
            scan = Image.open(gross + '.png')
            tsv = subprocess.run(['tesseract', gross + '.png', 'stdout', '-l', 'deu', '--psm', '6' if scan.width < 3000 else '3', 'tsv'],
                                 capture_output=True, text=True, check=True).stdout
            woerter = []
            for z in csv.DictReader(io.StringIO(tsv), delimiter='\t', quoting=csv.QUOTE_NONE):
                if z['level'] != '5' or not z['text'].strip():
                    continue
                l, t, b, h = int(z['left']), int(z['top']), int(z['width']), int(z['height'])
                woerter.append([z['text'], l / scan.width, t / scan.height, (l + b) / scan.width, (t + h) / scan.height])
            seiten.append({'quelle': 'ocr', 'woerter': woerter})
    return seiten


def zeilen(seite, tol=0.006):
    """Wörter zeilenweise, jede Zeile von links nach rechts."""
    ws = sorted(seite['woerter'], key=lambda w: ((w[2] + w[4]) / 2, w[1]))
    aus, akt, y = [], [], None
    for w in ws:
        m = (w[2] + w[4]) / 2
        if y is None or abs(m - y) <= tol:
            akt.append(w)
            y = m if y is None else (y * (len(akt) - 1) + m) / len(akt)
        else:
            aus.append(sorted(akt, key=lambda w: w[1]))
            akt, y = [w], m
    if akt:
        aus.append(sorted(akt, key=lambda w: w[1]))
    return aus


# ============================================================ 3: Retuschen

def retusche_woerter(seite, ops):
    """Führt die Wortliste nach: Wörter im abgedeckten Rechteck entfallen, der Ersatztext kommt hinzu."""
    for op in ops:
        if op['variante'] != 'alle':
            continue        # markenabhängige Ersetzungen ändern die Lage der Fundstellen nicht
        r = op['rect']
        innen = lambda w: r[0] <= (w[1] + w[3]) / 2 <= r[2] and r[1] <= (w[2] + w[4]) / 2 <= r[3]
        seite['woerter'] = [w for w in seite['woerter'] if not innen(w)]
        if not op['text'] or op['schrift'] == 'logo':
            continue
        k = op['kasten']
        f = schrift(op['schrift'], op['px'])
        gesamt = f.getlength(op['text'])
        platz = (k[2] - k[0]) * BREITE + 2
        skala = 1.0 if op['frei'] or gesamt <= platz else platz / gesamt
        pos = 0
        for wort in op['text'].split(' '):
            start = f.getlength(op['text'][:pos]) * skala
            ende = f.getlength(op['text'][:pos + len(wort)]) * skala
            seite['woerter'].append([wort, k[0] + start / BREITE, k[1], k[0] + ende / BREITE, k[3]])
            pos += len(wort) + 1


def farben(im, box):
    """Textfarbe (Strichmitte der dunklen Pixel) und Hintergrund (heller Rand) im Rechteck."""
    x0, y0, x1, y1 = box
    hell = lambda p: (p[0] * 299 + p[1] * 587 + p[2] * 114) / 1000
    px = list(im.crop(box).get_flattened_data())
    dunkel = sorted((p for p in px if hell(p) < 150), key=hell)
    kern = dunkel[:max(4, len(dunkel) // 4)]
    text = tuple(int(statistics.median(c)) for c in zip(*kern)) if len(dunkel) > 8 else (0, 0, 0)
    rand = []
    for x in range(x0, x1):
        rand += [im.getpixel((x, max(0, y0 - 1))), im.getpixel((x, min(im.height - 1, y1)))]
    for y in range(y0, y1):
        rand += [im.getpixel((max(0, x0 - 1), y)), im.getpixel((min(im.width - 1, x1), y))]
    hellrand = [p for p in rand if hell(p) > 200] or rand
    return text, tuple(int(statistics.median(c)) for c in zip(*hellrand))


def retusche_bild(im, op):
    d = ImageDraw.Draw(im)
    r = op['rect']
    box = (int(r[0] * im.width), int(r[1] * im.height), int(r[2] * im.width) + 1, int(r[3] * im.height) + 1)
    text, grund = farben(im, box)
    if 'farbe' in op:
        text = tuple(op['farbe'])
    d.rectangle(box, fill=grund)
    if not op['text']:
        return
    if op['schrift'] == 'logo':
        # Neutrales Schriftlogo an der Stelle des Versichererlogos: Hauptzeile fett, Unterzeile gesperrt
        gross, klein = op['text'].split('|')
        f1, f2 = schrift('inter-fett', op['px']), schrift('inter', op['px'] * 0.5)
        farbe, mitte = (31, 41, 55), (box[1] + box[3]) / 2
        d.text((box[0] + 6, mitte - op['px'] * 0.32), gross, font=f1, fill=farbe, anchor='lm')
        frei = f1.getlength(gross) - sum(f2.getlength(c) for c in klein)
        x = box[0] + 6
        for c in klein:
            d.text((x, mitte + op['px'] * 0.52), c, font=f2, fill=farbe, anchor='lm')
            x += f2.getlength(c) + frei / max(1, len(klein) - 1)
        return
    groesse = op['px']
    f = schrift(op['schrift'], groesse)
    if not op['frei']:
        platz = op['breite'] * im.width + 2
        while f.getlength(op['text']) > platz and groesse > 6:
            groesse -= 0.5
            f = schrift(op['schrift'], groesse)
    d.text((op['x'] * im.width, op['y'] * im.height), op['text'], font=f, fill=text, anchor='ls')


# ============================================================ 5: Fundstellen verorten

def norm(s):
    s = s.lower().replace('ß', 'ss').replace('–', '-').replace('—', '-').replace('−', '-')
    s = re.sub(r'[„“”"\'‚‘’`´|]', '', s)
    return re.sub(r'\s+', '', s)


def bloecke(seite):
    """Wörter in Lesereihenfolge: Zeilen werden an großen Lücken geteilt, linksbündig untereinander
    stehende Stücke bilden einen Block (Absatz, Tabellenzelle)."""
    stuecke = []
    for z in zeilen(seite):
        akt = [z[0]]
        for w in z[1:]:
            if w[1] - akt[-1][3] > 0.022:
                stuecke.append(akt)
                akt = [w]
            else:
                akt.append(w)
        stuecke.append(akt)
    kasten = lambda st: (min(w[1] for w in st), min(w[2] for w in st), max(w[3] for w in st), max(w[4] for w in st))
    info = [{'w': st, 'k': kasten(st), 'nach': None, 'hat_vor': False} for st in stuecke]
    info.sort(key=lambda s: (s['k'][1], s['k'][0]))
    for i, s in enumerate(info):
        hoehe = s['k'][3] - s['k'][1]
        for t in info[i + 1:]:
            luecke = t['k'][1] - s['k'][3]
            if luecke > 1.25 * hoehe:
                break
            if luecke < -0.4 * hoehe or t['hat_vor']:
                continue
            if abs(t['k'][0] - s['k'][0]) < 0.012:
                s['nach'] = t
                t['hat_vor'] = True
                break
    aus = []
    for s in info:
        if s['hat_vor']:
            continue
        k = s
        while k:
            aus.extend(k['w'])
            k = k['nach']
    return aus


def strom(woerter):
    """Zeichenstrom ohne Leerraum, dazu je Zeichen (Wortindex, Stelle im Wort, Wortlänge)."""
    text, karte = [], []
    for wi, w in enumerate(woerter):
        n = norm(w[0])
        for ci, c in enumerate(n):
            text.append(c)
            karte.append((wi, ci, len(n)))
    return ''.join(text), karte


def alle_exakt(muster, text):
    aus, i = [], text.find(muster)
    while muster and i >= 0:
        aus.append(i)
        i = text.find(muster, i + 1)
    return aus


def unscharf(muster, text, max_fehler):
    """Beste Stelle mit höchstens max_fehler Abweichungen → (start, ende, fehler) oder None."""
    m = len(muster)
    if not m or not text:
        return None
    spalte, starts, beste = list(range(m + 1)), [0] * (m + 1), None
    for j, c in enumerate(text):
        neu, ns = [0] * (m + 1), [j + 1] * (m + 1)
        for i in range(1, m + 1):
            a, b, d = spalte[i - 1] + (muster[i - 1] != c), spalte[i] + 1, neu[i - 1] + 1
            if a <= b and a <= d:
                neu[i], ns[i] = a, starts[i - 1]
            elif b <= d:
                neu[i], ns[i] = b, starts[i]
            else:
                neu[i], ns[i] = d, ns[i - 1]
        spalte, starts = neu, ns
        if spalte[m] <= max_fehler and (beste is None or spalte[m] < beste[2]):
            beste = (starts[m], j + 1, spalte[m])
    return beste


def rechtecke(woerter, karte, start, ende):
    """Rechtecke je Zeile für die Zeichen start…ende des Stroms; angeschnittene Wörter anteilig."""
    teile = {}
    for k in range(start, ende):
        wi, ci, _ = karte[k]
        a, b = teile.get(wi, (ci, ci))
        teile[wi] = (min(a, ci), max(b, ci))
    boxen = []
    for wi, (a, b) in teile.items():
        w = woerter[wi]
        n = max(1, len(norm(w[0])))
        boxen.append([w[1] + (w[3] - w[1]) * a / n, w[2], w[1] + (w[3] - w[1]) * (b + 1) / n, w[4]])
    gruppen = []
    for r in sorted(boxen, key=lambda r: r[1]):
        for g in gruppen:
            ueber = min(g['y1'], r[3]) - max(g['y0'], r[1])
            if ueber > 0.4 * min(g['y1'] - g['y0'], r[3] - r[1]):
                g['r'].append(r)
                g['y0'], g['y1'] = min(g['y0'], r[1]), max(g['y1'], r[3])
                break
        else:
            gruppen.append({'y0': r[1], 'y1': r[3], 'r': [r]})
    zs = []
    for g in gruppen:
        akt = None
        for r in sorted(g['r'], key=lambda r: r[0]):
            if akt and r[0] - akt[2] < 0.05:
                akt[0], akt[1], akt[2], akt[3] = min(akt[0], r[0]), min(akt[1], r[1]), max(akt[2], r[2]), max(akt[3], r[3])
            else:
                akt = list(r)
                zs.append(akt)
    return zs


def huelle(rs):
    return [min(r[0] for r in rs), min(r[1] for r in rs), max(r[2] for r in rs), max(r[3] for r in rs)]


SATZZEICHEN = set('.,;:!?()[]/-%€<>')


def verorte(seite, marken, name, korrektur):
    """Je Markierung, in dieser Reihenfolge:
      1. Der Text kommt auf der Seite genau einmal vor (an Wortgrenzen).
      2. Der Text zusammen mit dem Text davor oder danach ist eindeutig.
      3. Tabellenzeile: Die Bezeichnung der Zeile wird gesucht, der Wert steht in ihrem Band rechts daneben.
      4. Die nächste Stelle nach der zuletzt gefundenen; bei Scans mit Toleranz für Erkennungsfehler.
    """
    woerter = bloecke(seite)
    text, karte = strom(woerter)
    ocr = seite['quelle'] == 'ocr'
    spiel = lambda s: (max(1, len(s) // 7) if ocr else 0)
    aus, letzte_y = [], 0.0

    def wortgenau(o, k=None, ws=None):
        k, ws = k or karte, ws or woerter
        wi, ci, _ = k[o[0]]
        wj, cj, _ = k[o[1] - 1]
        vorn, hinten = norm(ws[wi][0])[:ci], norm(ws[wj][0])[cj + 1:]
        return all(c in SATZZEICHEN for c in vorn) and all(c in SATZZEICHEN for c in hinten)

    def finde(muster):
        orte = [(i, i + len(muster)) for i in alle_exakt(muster, text)]
        orte = [o for o in orte if wortgenau(o)] or orte
        if not orte and ocr and len(muster) >= 4:
            t = unscharf(muster, text, spiel(muster))
            if t:
                orte = [(t[0], t[1])]
        return orte

    for nr, m in enumerate(marken):
        ziel, vor, nach, label = norm(m['text']), norm(m['vor']), norm(m['nach']), norm(m['label'])
        fest = korrektur.get(f'{name}#{nr}')
        if isinstance(fest, dict) and 'rects' in fest:
            aus.append({**m, 'weg': 'fest', 'rects': fest['rects']})
            continue
        if isinstance(fest, dict) and 'teile' in fest:
            rs = []
            for teil in fest['teile']:
                orte = finde(norm(teil))
                if orte:
                    rs += rechtecke(woerter, karte, *orte[0])
            aus.append({**m, 'weg': 'teile', 'rects': rs})
            continue

        treffer, weg = None, ''
        orte = finde(ziel)
        if len(orte) == 1:
            treffer, weg = orte[0], 'einzig'
        if not treffer and vor:
            for k in (40, 24, 12, 6):
                o = finde(vor[-k:] + ziel)
                if len(o) == 1:
                    treffer, weg = (o[0][1] - len(ziel), o[0][1]), 'vor'
                    break
        if not treffer and nach:
            for k in (30, 16, 8):
                o = finde(ziel + nach[:k])
                if len(o) == 1:
                    treffer, weg = (o[0][0], o[0][0] + len(ziel)), 'nach'
                    break
        if not treffer and label:
            lorte = finde(label) or finde(label[:28])
            if lorte:
                lo = lorte[m.get('labelNr', 0)] if len(lorte) > m.get('labelNr', 0) else lorte[-1]
                lk = huelle(rechtecke(woerter, karte, *lo))
                band = [(i, w) for i, w in enumerate(woerter)
                        if w[1] > lk[0] + 0.05 and lk[1] - 0.006 < (w[2] + w[4]) / 2 < lk[3] + 0.006 and not (w[1] < lk[2] and w[3] <= lk[2] + 0.002)]
                if band:
                    btext, bkarte = [], []
                    for i, w in band:
                        n = norm(w[0])
                        for ci, c in enumerate(n):
                            btext.append(c)
                            bkarte.append((i, ci, len(n)))
                    btext, bwoerter = ''.join(btext), {i: w for i, w in band}
                    stellen = [(j, j + len(ziel)) for j in alle_exakt(ziel, btext)]
                    stellen = [o for o in stellen if wortgenau(o, bkarte, bwoerter)] or stellen
                    t = (stellen[0][0], stellen[0][1]) if stellen else None
                    if not t and ocr:
                        u = unscharf(ziel, btext, max(1, len(ziel) // 5))
                        t = (u[0], u[1]) if u else None
                    if t:
                        aus.append({**m, 'weg': 'zeile', 'rects': rechtecke(woerter, bkarte, *t)})
                        letzte_y = aus[-1]['rects'][0][1]
                        continue
        if not treffer and orte:
            kand = [(o, huelle(rechtecke(woerter, karte, *o))[1]) for o in orte]
            danach = [k for k in kand if k[1] >= letzte_y - 0.004]
            treffer, weg = (danach[0][0] if danach else kand[0][0]), f'folge({len(orte)})'
        if not treffer:
            t = unscharf(ziel, text, max(1, len(ziel) // 5))
            if t:
                treffer, weg = (t[0], t[1]), f'unscharf({t[2]})'
        if treffer:
            rs = rechtecke(woerter, karte, *treffer)
            letzte_y = rs[0][1]
            aus.append({**m, 'weg': weg, 'rects': rs})
        else:
            aus.append({**m, 'weg': 'FEHLT', 'rects': []})
    return aus


def kontrollbild(im, treffer, ziel):
    farben_ = [(230, 60, 60), (40, 120, 220), (30, 160, 90), (200, 120, 20), (150, 60, 200)]
    im = im.copy()
    d = ImageDraw.Draw(im, 'RGBA')
    f = schrift('dejavu', 15)
    for i, t in enumerate(treffer):
        c = farben_[i % len(farben_)]
        for r in t['rects']:
            d.rectangle([r[0] * im.width - 2, r[1] * im.height - 2, r[2] * im.width + 2, r[3] * im.height + 2], fill=c + (60,), outline=c + (255,), width=2)
        if t['rects']:
            r = t['rects'][0]
            d.text((r[0] * im.width - 2, r[1] * im.height - 19), f"{i}:{'/'.join(t['felder'])[:14]}", fill=c + (255,), font=f)
    im.save(ziel)


# ============================================================ Ablauf

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        sys.exit(__doc__)
    quelle, kontrolle = args[0], '--kontrolle' in sys.argv
    arbeit = tempfile.mkdtemp(prefix='originale-')
    ops = json.load(open(os.path.join(HIER, 'retuschen.json')))
    korrektur = json.load(open(os.path.join(HIER, 'korrektur.json')))
    marken = json.loads(subprocess.run(['node', os.path.join(HIER, 'marken.mjs'), APP, MARKE_DER_BEISPIELE], capture_output=True, text=True, check=True).stdout)

    ziel = os.path.join(APP, 'src', 'assets', 'originale')
    os.makedirs(ziel, exist_ok=True)
    for alt in glob.glob(os.path.join(ziel, '*.webp')):
        os.remove(alt)

    daten, fehlt, gewicht = {}, 0, 0
    for name in sorted(marken):
        nr = name[1:]
        pfade = glob.glob(os.path.join(quelle, f'*Beispiel_{nr}.pdf'))
        if not pfade:
            sys.exit(f'Beispiel_{nr}.pdf fehlt in {quelle}')
        seiten = lies_pdf(pfade[0], name, arbeit)
        neutral, je_seite = [], []
        for s, seite in enumerate(seiten, 1):
            seiten_ops = ops.get(f'{name}-{s}', [])
            retusche_woerter(seite, seiten_ops)
            roh = Image.open(os.path.join(arbeit, f'{name}-{s}.png')).convert('RGB')
            for variante in ('nuernberger', 'neutral'):
                eigene = [o for o in seiten_ops if o['variante'] == 'neutral']
                if variante == 'neutral' and not eigene:
                    continue
                im = roh.copy()
                for op in seiten_ops:
                    if op['variante'] in ('alle', variante):
                        retusche_bild(im, op)
                datei = os.path.join(ziel, f"{name}-{s}{'.neutral' if variante == 'neutral' else ''}.webp")
                im.save(datei, 'WEBP', quality=QUALITAET, method=6)
                gewicht += os.path.getsize(datei)
                if variante == 'neutral':
                    neutral.append(s)
            m = marken[name]['seiten'][s - 1] if s <= len(marken[name]['seiten']) else []
            t = verorte(seite, m, f'{name}-{s}', korrektur)
            for i, x in enumerate(t):
                if x['weg'] == 'FEHLT':
                    fehlt += 1
                    print(f"  ✗ {name} Seite {s} [{i}] nicht gefunden: „{x['text'][:60]}“")
            if kontrolle and m:
                kontrollbild(roh, t, os.path.join(arbeit, f'kontrolle-{name}-{s}.png'))
            je_seite.append(t)
        if len(seiten) != len(marken[name]['seiten']):
            print(f"  ✗ {name}: PDF hat {len(seiten)} Seiten, der Nachbau {len(marken[name]['seiten'])}")
            fehlt += 1
        prozent = lambda v: round(v * 100, 2)
        rx, ry = 0.0022, 0.0016
        daten[marken[name]['id']] = {
            'kennung': name, 'neutral': neutral,
            'seiten': [[{'f': x['felder'], 'r': [[prozent(max(0, r[0] - rx)), prozent(max(0, r[1] - ry)), prozent(r[2] - r[0] + 2 * rx), prozent(r[3] - r[1] + 2 * ry)] for r in x['rects']]} for x in t] for t in je_seite]
        }
        print(f"{name}: {len(seiten)} Seiten, {sum(len(t) for t in je_seite)} Fundstellen")

    kopf = '''/**
 * Die Beispielanfragen im Original: Lage der Fundstellen auf den Seitenbildern.
 *
 * ERZEUGT von scripts/originale/originale.py – nicht von Hand ändern. Die
 * Seitenbilder liegen in src/assets/originale/ (b2-1.webp = Beispiel 2,
 * Seite 1); `neutral` nennt die Seiten, für die es eine eigene Fassung ohne
 * Hausbegriffe gibt.
 *
 * Je Seite stehen die Markierungen in derselben Reihenfolge wie im
 * nachgebauten Dokument (src/daten/beispielN.js):
 *   f  Feldschlüssel der Markierung
 *   r  Rechtecke [links, oben, Breite, Höhe] in Prozent der Seite, eines je Zeile
 */

export const SEITENFORMAT = { breite: %d, hoehe: %d }

export const ORIGINALE = ''' % (BREITE, HOEHE)
    rumpf = json.dumps(daten, ensure_ascii=False, separators=(',', ':')).replace('},"ANG', '},\n  "ANG').replace('{"ANG', '{\n  "ANG', 1)[:-1]
    with open(os.path.join(APP, 'src', 'daten', 'originale.js'), 'w') as f:
        f.write(kopf + rumpf + '\n}\n')
    print(f'{len(os.listdir(ziel))} Seitenbilder, {round(gewicht / 1024)} KB' + (f'; Kontrollbilder in {arbeit}' if kontrolle else ''))
    if fehlt:
        sys.exit(f'{fehlt} Befunde – bitte korrektur.json ergänzen')


if __name__ == '__main__':
    main()
