# -*- coding: utf-8 -*-
"""Weiterleitung immer an den 72-Stunden-BOT, Ermittlung des Vertriebskanals entfällt
(PDD-Touchpoint mit Robotics vom 10.09.2026: Der 72-Stunden-BOT verarbeitet alle Vorgänge und
erkennt AO-Bestandsinhaber selbst; eine Vorab-Prüfung im Prüf-Bot ist nicht nötig)."""
import zipfile, sys
from lxml import etree

W   = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
XML = '{http://www.w3.org/XML/1998/namespace}'
EIN, AUS = sys.argv[1], sys.argv[2]

zin = zipfile.ZipFile(EIN)
teile = {n: zin.read(n) for n in zin.namelist()}
doc = etree.fromstring(teile['word/document.xml'])
protokoll = []

def ptext(p): return ''.join(t.text or '' for t in p.iter(W + 't'))
def alle(): return list(doc.iter(W + 'p'))
def finde(text, nr=0):
    treffer = [p for p in alle() if ptext(p) == text]
    assert len(treffer) > nr, f'nicht gefunden: {text!r} ({len(treffer)} Treffer)'
    return treffer[nr]
def start(prefix, nr=0):
    treffer = [p for p in alle() if ptext(p).startswith(prefix)]
    assert len(treffer) > nr, f'nicht gefunden: {prefix!r}'
    return treffer[nr]
def hat_anker(p):
    return any(e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd', W + 'commentReference') for e in p.iter())
def settext(p, text):
    runs = [r for r in p.findall(W + 'r') if r.find(W + 't') is not None]
    for r in runs[1:]: p.remove(r)
    if runs: r = runs[0]
    else:
        r = etree.SubElement(p, W + 'r'); etree.SubElement(r, W + 't')
    for t in r.findall(W + 't')[1:]: r.remove(t)
    t = r.find(W + 't'); t.text = text; t.set(XML + 'space', 'preserve')
    for e in p.findall(W + 'proofErr'): p.remove(e)
    protokoll.append('geändert: ' + text[:70]); return p
def loesche(p):
    ziel = p.getprevious()
    while ziel is not None and ziel.tag != W + 'p': ziel = ziel.getprevious()
    if ziel is None:
        ziel = p.getnext()
        while ziel.tag != W + 'p': ziel = ziel.getnext()
    if hat_anker(p):
        for e in list(p):
            if e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd') or \
               (e.tag == W + 'r' and e.find(W + 'commentReference') is not None):
                ziel.append(e)
    protokoll.append('gelöscht: ' + ptext(p)[:70])
    p.getparent().remove(p)

# 1. Schritt „Ermittlung Vertriebskanal“ entfernen: Überschrift + Schritttabelle; der Verweis
#    „Weiter zum Kapitel Test auf Fehlerliste“ wandert ans Ende des vorherigen Schritts
kopf = finde('Ermittlung Vertriebskanal')
tbl = kopf.getnext(); assert tbl.tag == W + 'tbl'
weiter = next(p for p in tbl.iter(W + 'p') if ptext(p) == 'Weiter zum Kapitel „Test auf Fehlerliste“')
vorher = finde('Agentur-Nr. (A,…) des Bestandsinhabers ermitteln').getnext(); assert vorher.tag == W + 'tbl'
letzte_zelle = list(vorher.iter(W + 'tr'))[-1].findall(W + 'tc')[1]
assert ptext(list(letzte_zelle.iter(W + 'p'))[-1]) == 'Ende WENN'
letzte_zelle.append(weiter); protokoll.append('verschoben: Weiter zum Kapitel „Test auf Fehlerliste“')
assert not any(hat_anker(p) for p in tbl.iter(W + 'p'))
tbl.getparent().remove(tbl); protokoll.append('Schritttabelle gelöscht: Ermittlung Vertriebskanal')
loesche(kopf)

# Inhaltsverzeichnis: alter Feldwert entfernen (Word aktualisiert das Verzeichnis beim Öffnen)
loesche(start('10. Schritt: Ermittlung Vertriebskanal'))

# 2. Variablentabelle: Zeilen Vertriebskanal und Vorgangstyp-BUE entfernen
vt = next(tb for tb in doc.iter(W + 'tbl') if 'Variablenname' in ptext(list(tb.iter(W + 'tc'))[0]))
for name in ('Vertriebskanal', 'Vorgangstyp-BUE'):
    tr = next(tr for tr in vt.iter(W + 'tr') if ptext(list(tr.iter(W + 'tc'))[0]) == name)
    assert not any(hat_anker(p) for p in tr.iter(W + 'p'))
    tr.getparent().remove(tr); protokoll.append('Tabellenzeile gelöscht: ' + name)
settext(finde('Grundlage für die Ermittlung des Vertriebskanals; wird in die Notiz übernommen.'),
        'Einstieg für die Anbindungsprüfung des Bestandsinhabers in GH040.')

# 3. Reporting-Tags ohne Vertriebskanal
loesche(finde('Tag „Zielbot“: BOT2011 oder 72-Stunden-BOT'))
loesche(finde('Tag „Vorgangstyp“: Makler zu Makler oder AO zu Makler'))

# 4. Beschreibende Texte
settext(start('Nachgelagerter Bot für Vorgänge, bei denen der abgebende Bestandsinhaber'),
        'Nachgelagerter Bot, an den der Prüf-Bot alle freigegebenen Vorgänge übergibt. Er erkennt selbst, ob der abgebende '
        'Bestandsinhaber der Ausschließlichkeitsorganisation (AO) zugeordnet ist, wahrt in diesem Fall die 72-Stunden-Frist '
        'und gibt alle übrigen Vorgänge ohne Wartezeit an den BÜ-BOT weiter (spartenübergreifend).')
settext(start('Vorgänge, die alle harten Kriterien erfüllen, werden mit einer vollständig bestückten Notiz'),
        'Vorgänge, die alle harten Kriterien erfüllen, werden mit einer vollständig bestückten Notiz (BOT2011) an den '
        '72-Stunden-BOT übergeben, der die Weitergabe an den nachgelagerten BÜ-BOT steuert. Die Sachbearbeitung bearbeitet '
        'nur noch die fachlich begründeten Ausnahmen. Ablehnungen werden unmittelbar und ohne Liegezeit an den übernehmenden '
        'Vermittler kommuniziert.')
settext(start('Prüfung des übernehmenden Vermittlers in OB726 und GH040, Ermittlung von Stammagentur und Vertriebskanal'),
        'Prüfung des übernehmenden Vermittlers in OB726 und GH040, Ermittlung von Stammagentur und bisherigem '
        'Bestandsinhaber, Erstellung der Notiz für den BÜ-BOT bzw. Erstellung der Ablehnungsinformation.')
p = start('II. Übernehmender Makler – Agenturnummer/Vermittler-Nr. (PNR): Einstieg in OB726')
settext(p, ptext(p).replace('Ermittlung der Agentur-Nr. des Bestandsinhabers und des Vertriebskanals.',
                            'Ermittlung der Agentur-Nr. und des Anbindungsstatus des bisherigen Bestandsinhabers.'))
settext(start('Weiterleitung an den BÜ-Bot: Vorgänge mit AO-Bestandsinhaber laufen über den 72-Stunden-BOT'),
        'Weiterleitung an den BÜ-Bot: Alle freigegebenen Vorgänge werden mit vollständig bestückter Notiz (BOT2011) an den '
        '72-Stunden-BOT übergeben. Eine Prüfung des Vertriebskanals des Bestandsinhabers findet im Prüf-Bot nicht statt; '
        'der 72-Stunden-BOT erkennt AO-Bestandsinhaber selbst, wahrt die Frist und leitet alle übrigen Vorgänge direkt an '
        'den BÜ-BOT weiter.')
settext(finde('Nach erfolgreicher Verarbeitung ist der Vorgang mit bestückter Notiz an den BÜ-Bot bzw. den 72-Stunden-BOT übergeben.'),
        'Nach erfolgreicher Verarbeitung ist der Vorgang mit bestückter Notiz an den 72-Stunden-BOT übergeben.')
settext(start('Nein. Innerhalb des Prüf-Bots gibt es keine Wartezustände'),
        'Nein. Innerhalb des Prüf-Bots gibt es keine Wartezustände und keine Wiedervorlage. Die Weiterverarbeitung erfolgt '
        'asynchron durch den 72-Stunden-BOT und den nachgelagerten BÜ-BOT.')
settext(start('Hinweis: Es wurde keine BE festgestellt. Der Vorgang wird nach der Notizbestückung immer'),
        'Hinweis: Es wurde keine BE festgestellt. Der Vorgang wird nach der Notizbestückung immer an den 72-Stunden-BOT '
        'übergeben. Eine Prüfung des Vertriebskanals des abgebenden Bestandsinhabers erfolgt im Prüf-Bot nicht: Der '
        '72-Stunden-BOT prüft selbst, ob der Bestandsinhaber der AO zugeordnet ist, gibt in diesem Fall die '
        '72-Stunden-Information aus und leitet alle übrigen Vorgänge ohne Wartezeit an den BÜ-BOT weiter.')

# 5. Ablaufdiagramm (Text in der Zeichnung)
settext(finde('II. Übernehmender MaklerAgentur / PNR OB726 · Anbindung GH040 · Stammagentur EOS · Bestandsinhaber · Vertriebskanal'),
        'II. Übernehmender Makler\nAgentur / PNR OB726 · Anbindung GH040 · Stammagentur EOS · Bestandsinhaber')
# Zeilenumbruch in der Zeichnung als w:br wie im Original
p = finde('II. Übernehmender Makler\nAgentur / PNR OB726 · Anbindung GH040 · Stammagentur EOS · Bestandsinhaber')
r = [r for r in p.findall(W + 'r') if r.find(W + 't') is not None][0]
t = r.find(W + 't'); kopf, rest = t.text.split('\n')
t.text = kopf; br = etree.SubElement(r, W + 'br'); t2 = etree.SubElement(r, W + 't'); t2.text = rest; t2.set(XML + 'space', 'preserve')

# Kontrolle: keine Reste
reste = [ptext(p) for p in alle() if 'Vertriebskanal' in ptext(p) or 'Vorgangstyp' in ptext(p)]
for r_ in reste: print('REST:', r_[:160])

teile['word/document.xml'] = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
with zipfile.ZipFile(AUS, 'w', zipfile.ZIP_DEFLATED) as z:
    for n, d in teile.items(): z.writestr(n, d)
print('\n'.join(protokoll)); print('ok', AUS)
