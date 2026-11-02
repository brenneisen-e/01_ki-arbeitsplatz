# -*- coding: utf-8 -*-
"""Abgleich <Vorgang-VNR> gegen <BUE_VNR> entfaellt. Celonis eroeffnet den Postkorbvorgang mit der
Nummer, die es selbst aus der Mail ermittelt hat; ein Vergleich zweier Felder derselben Quelle
kann nur bei einem technischen Fehler anschlagen und wuerde den Vorgang unnoetig aussteuern.
Der Bot arbeitet durchgehend mit <Vorgang-VNR>; BUE_VNR und BUE_VNR_2 sind nur noch
nachrichtliche Information fuer den Bearbeitungshinweis."""
import sys, zipfile
from lxml import etree
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
XML='{http://www.w3.org/XML/1998/namespace}'
EIN, AUS = sys.argv[1], sys.argv[2]
zin=zipfile.ZipFile(EIN); teile={n: zin.read(n) for n in zin.namelist()}
doc=etree.fromstring(teile['word/document.xml']); protokoll=[]

def ptext(p): return ''.join(t.text or '' for t in p.iter(W+'t'))
def alle(): return list(doc.iter(W+'p'))
def finde(text):
    tr=[p for p in alle() if ptext(p)==text]; assert len(tr)==1, (text, len(tr)); return tr[0]
def start(prefix):
    tr=[p for p in alle() if ptext(p).startswith(prefix)]; assert len(tr)==1, (prefix, len(tr)); return tr[0]
def hat_anker(p):
    return any(e.tag in (W+'commentRangeStart', W+'commentRangeEnd', W+'commentReference') for e in p.iter())
def settext(p, text):
    runs=[r for r in p.findall(W+'r') if r.find(W+'t') is not None]
    for r in runs[1:]: p.remove(r)
    r=runs[0]
    for t in r.findall(W+'t')[1:]: r.remove(t)
    t=r.find(W+'t'); t.text=text; t.set(XML+'space','preserve')
    for e in p.findall(W+'proofErr'): p.remove(e)
    protokoll.append('geändert: '+text[:80])
def loesche(p):
    ziel=p.getprevious()
    while ziel is not None and ziel.tag!=W+'p': ziel=ziel.getprevious()
    if ziel is None:
        ziel=p.getnext()
        while ziel.tag!=W+'p': ziel=ziel.getnext()
    if hat_anker(p):
        for e in list(p):
            if e.tag in (W+'commentRangeStart', W+'commentRangeEnd') or \
               (e.tag==W+'r' and e.find(W+'commentReference') is not None): ziel.append(e)
    protokoll.append('gelöscht: '+ptext(p)[:80]); p.getparent().remove(p)

# 1. Pruefblock samt Hinweis entfernen
blk=finde('<Vorgang-VNR> nicht in <BUE_VNR> und nicht in <BUE_VNR_2> enthalten')
weg=[blk.getprevious(), blk]
p=blk
for _ in range(3):
    p=p.getnext(); weg.append(p)
assert [ptext(x) for x in weg]==['WENN','<Vorgang-VNR> nicht in <BUE_VNR> und nicht in <BUE_VNR_2> enthalten','DANN',
    'Merke Prüfnotiz „VNR im Datenpool abweichend“ in <Fehlerliste>','Ende WENN'], [ptext(x) for x in weg]
weg.append(p.getnext())   # der erlaeuternde Hinweis
assert ptext(weg[-1]).startswith('Hinweis: <BUE_VNR> und <BUE_VNR_2> können mehrere')
for x in weg: loesche(x)

# 2. Pruefnotiz aus der Liste
loesche(finde('VNR im Datenpool abweichend'))

# 3. Hinweis im Startschritt
settext(start('Hinweis: <Vorgang-VNR> ist die Nummer, mit der Celonis den Vorgang eröffnet hat'),
        'Hinweis: <Vorgang-VNR> ist die Nummer, mit der Celonis den Vorgang eröffnet hat, bereits normiert auf zwei '
        'Buchstaben Spartenkürzel und neun Ziffern. Sie ist der Einstieg für alle Hostaufrufe und bleibt für den '
        'gesamten Vorgang die führende Nummer. <BUE_VNR> und <BUE_VNR_2> aus dem Datenpool werden nicht gegen sie '
        'geprüft; sie führen nachrichtlich alle im Auftrag genannten Nummern und gehen bei einer BE in den '
        'Bearbeitungshinweis ein.')

# 4. Feldbeschreibung BUE_VNR
settext(start('Feld_Format CH. Durch Celonis normiert: zwei Buchstaben Spartenkürzel und neun Ziffern (11 Zeichen)'),
        'Feld_Format CH. Durch Celonis normiert: zwei Buchstaben Spartenkürzel und neun Ziffern (11 Zeichen), mehrere '
        'Nummern semikolongetrennt; Ersatzwert „Manuelle Prüfung VNR/Sparte“. Wird nicht für die Hostaufrufe genutzt '
        '(dafür <Vorgang-VNR>) und nicht gegen diese abgeglichen, sondern führt nachrichtlich alle im Auftrag genannten '
        'Nummern für den Bearbeitungshinweis.')

reste=[ptext(p) for p in alle() if 'VNR im Datenpool' in ptext(p)]
for r in reste: print('REST:', r[:200])
teile['word/document.xml']=etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
with zipfile.ZipFile(AUS,'w',zipfile.ZIP_DEFLATED) as z:
    for n,d in teile.items(): z.writestr(n,d)
print('\n'.join(protokoll)); print('ok', AUS)
