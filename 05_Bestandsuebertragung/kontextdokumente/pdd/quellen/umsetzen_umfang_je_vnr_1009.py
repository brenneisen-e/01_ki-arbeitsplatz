# -*- coding: utf-8 -*-
"""BUE_UMFANG nur noch Einzel und Gesamt; bei mehreren genannten Versicherungsnummern
eroeffnet Celonis je Nummer einen eigenen Postkorbvorgang (Vorschlag aus dem PDD-Touchpoint
vom 10.09.2026, zur Abstimmung an ODPB / Celonis). Die Pruefnotiz "Mehrere Versicherungsnummern"
entfaellt; BUE_VNR und BUE_VNR_2 bleiben als nachrichtliche Information."""
import sys, zipfile
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
    tr = [p for p in alle() if ptext(p) == text]
    assert len(tr) > nr, f'nicht gefunden: {text!r} ({len(tr)} Treffer)'
    return tr[nr]
def start(prefix, nr=0):
    tr = [p for p in alle() if ptext(p).startswith(prefix)]
    assert len(tr) > nr, f'nicht gefunden: {prefix!r}'
    return tr[nr]
def hat_anker(p):
    return any(e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd', W + 'commentReference') for e in p.iter())
def settext(p, text):
    """Text setzen; \n wird als Zeilenumbruch (w:br) gesetzt, Kommentaranker bleiben erhalten."""
    runs = [r for r in p.findall(W + 'r') if r.find(W + 't') is not None]
    for r in runs[1:]: p.remove(r)
    if runs: r = runs[0]
    else:
        r = etree.SubElement(p, W + 'r'); etree.SubElement(r, W + 't')
    for e in list(r):
        if e.tag in (W + 't', W + 'br'): r.remove(e)
    for i, teil in enumerate(text.split('\n')):
        if i: etree.SubElement(r, W + 'br')
        t = etree.SubElement(r, W + 't'); t.text = teil; t.set(XML + 'space', 'preserve')
    for e in p.findall(W + 'proofErr'): p.remove(e)
    protokoll.append('geändert: ' + text.replace('\n', ' ')[:80]); return p
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
    protokoll.append('gelöscht: ' + ptext(p)[:80])
    p.getparent().remove(p)
def klon(vorlage, text):
    import copy
    p = copy.deepcopy(vorlage)
    for e in list(p):
        if e.tag in (W + 'commentRangeStart', W + 'commentRangeEnd', W + 'bookmarkStart',
                     W + 'bookmarkEnd', W + 'proofErr'):
            p.remove(e)
        elif e.tag == W + 'r' and (e.find(W + 'commentReference') is not None or e.find(W + 't') is None):
            p.remove(e)
    settext(p, text)
    return p
def nach(p, *neue):
    for n in neue: p.addnext(n); p = n
    return p

# ------------------------------------------------------------------ 1. Vorprüfung: Block „Mehrere“ entfernen
blk = finde('<BUE_UMFANG> = „Mehrere“')
kopf = blk.getprevious()          # WENN
assert ptext(kopf) == 'WENN'
weg = [kopf, blk]
p = blk
for _ in range(3):
    p = p.getnext(); weg.append(p)
assert [ptext(x) for x in weg] == ['WENN', '<BUE_UMFANG> = „Mehrere“', 'DANN',
                                   'Merke Prüfnotiz „Mehrere Versicherungsnummern“ in <Fehlerliste>', 'Ende WENN'], [ptext(x) for x in weg]
for x in weg: loesche(x)

# ------------------------------------------------------------------ 2. Hinweis zum Umfang neu fassen
h = start('Hinweis: <BUE_UMFANG> = „Einzel“ und „Gesamt“ werden vollständig verarbeitet')
settext(h, 'Hinweis: <BUE_UMFANG> hat die Ausprägungen „Einzel“ und „Gesamt“; beide werden vollständig verarbeitet und '
           'in der Notiz unter „Betroffene VNR“ übernommen. Nennt der Auftrag mehrere Versicherungsnummern, eröffnet '
           'Celonis je Nummer einen eigenen Postkorbvorgang mit derselben E-Mail und einer eigenen führenden VNR; jeder '
           'dieser Vorgänge durchläuft den Prüf-Bot eigenständig. Für „Gesamt“ steht der Test zur parallelen Bearbeitung '
           'mehrerer Vorgänge durch den BÜ-Bot aus.')

# ------------------------------------------------------------------ 3. BE-Handling: Bedingung auf weitere VNR umstellen
b = finde('<BUE_UMFANG> = „Mehrere“')
settext(b, '<BUE_VNR> enthält mehr als eine Versicherungsnummer ODER <BUE_VNR_2> <> leer')
settext(finde('Weitere Versicherungsnummern aus <BUE_VNR> und <BUE_VNR_2> an den Bearbeitungshinweis anhängen'),
        'Alle im Auftrag genannten Versicherungsnummern aus <BUE_VNR> und <BUE_VNR_2> an den Bearbeitungshinweis anhängen')
vorlage_hinweis = start('Hinweis: Der Vorgang wird mit dem Bearbeitungshinweis an den Themenpostkorb')
nach(vorlage_hinweis, klon(vorlage_hinweis,
    'Hinweis: Nennt der Auftrag mehrere Versicherungsnummern, wird zu jeder Nummer ein eigener Vorgang geprüft. Die '
    'vollständige Liste wird nachrichtlich in den Bearbeitungshinweis übernommen, damit die Sachbearbeitung den '
    'Zusammenhang der Vorgänge erkennt.'))

# ------------------------------------------------------------------ 4. Prüfnotiz aus der Liste entfernen
loesche(finde('Mehrere Versicherungsnummern'))

# ------------------------------------------------------------------ 5. Datenfeldbeschreibungen
settext(start('Feld_Format CH. Gleiches Format wie BUE_VNR. Wird bei <BUE_UMFANG> = „Mehrere“'),
        'Feld_Format CH. Gleiches Format wie BUE_VNR. Nimmt die Versicherungsnummern auf, die in BUE_VNR nicht mehr '
        'in die Feldlänge passen. Wird zusammen mit BUE_VNR nachrichtlich in den Bearbeitungshinweis übernommen, wenn '
        'der Auftrag mehrere Versicherungsnummern nennt.')
settext(start('Feld_Format CH. Ausprägungen: Einzel (genau eine Versicherungsnummer), Gesamt'),
        'Feld_Format CH. Ausprägungen: Einzel (Übertragung der genannten Versicherungsnummer), Gesamt (Übertragung der '
        'gesamten Kundenverbindung). Nennt der Auftrag mehrere Versicherungsnummern, eröffnet Celonis je Nummer einen '
        'eigenen Vorgang; jeder trägt „Einzel“, bei zusätzlicher Nennung der gesamten Kundenverbindung „Gesamt“. '
        'Der Wert wird in der Notiz im Abschnitt „Betroffene VNR“ übernommen.')

# ------------------------------------------------------------------ 6. Eingangskanal: Eröffnung je VNR ergänzen
ek = start('Der Prozess startet mit der Eröffnung eines Postkorbvorgangs im EWMS.')
nach(ek, klon(ek, 'Nennt eine Makler-E-Mail mehrere Versicherungsnummern, eröffnet Celonis je Nummer einen eigenen '
                  'Postkorbvorgang mit derselben E-Mail und einer eigenen führenden VNR. Der Prüf-Bot verarbeitet jeden '
                  'dieser Vorgänge eigenständig und kennt den Zusammenhang nur über die Felder BUE_VNR und BUE_VNR_2.'))

# ------------------------------------------------------------------ 7. Ablaufdiagramm
settext(finde('AusschlusskriterienKein BÜ-Vorgang · BÜ-Wunsch fehlt · Reminder · Umfang „Mehrere“ · VNR nicht ermittelbar · '
              'Makler: Unterlagen unvollständig · MFA: Betreuungswunsch nicht auf MFA, Unterschrift VN fehlt'),
        'Ausschlusskriterien\nKein BÜ-Vorgang · BÜ-Wunsch fehlt · Reminder · VNR nicht ermittelbar · '
        'Makler: Unterlagen unvollständig · MFA: Betreuungswunsch nicht auf MFA, Unterschrift VN fehlt')
settext(finde('BE-Handling (zentral)Bearbeitungshinweis mit BE-Klassifikation, den Prüfnotizen der Fehlerliste und bei '
              'Umfang „Mehrere“ den weiteren VNR · Weiterleitung an den Themenpostkorb HSB4K MV · weiter mit dem nächsten Vorgang'),
        'BE-Handling (zentral)\nBearbeitungshinweis mit BE-Klassifikation, den Prüfnotizen der Fehlerliste und den weiteren '
        'im Auftrag genannten VNR · Weiterleitung an den Themenpostkorb HSB4K MV · weiter mit dem nächsten Vorgang')

# ------------------------------------------------------------------ Kontrolle
reste = [ptext(p) for p in alle() if 'Mehrere“' in ptext(p) or 'Mehrere Versicherungsnummern' in ptext(p)]
for r in reste: print('REST:', r[:200])

teile['word/document.xml'] = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
with zipfile.ZipFile(AUS, 'w', zipfile.ZIP_DEFLATED) as z:
    for n, d in teile.items(): z.writestr(n, d)
print('\n'.join(protokoll)); print('ok', AUS)
