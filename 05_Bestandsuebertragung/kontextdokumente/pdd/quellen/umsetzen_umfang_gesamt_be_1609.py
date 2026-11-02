# -*- coding: utf-8 -*-
"""BUE_UMFANG = Gesamt wird vollstaendig geprueft und anschliessend als Business Exception
ausgesteuert; nur Einzel-Vorgaenge mit positivem Ergebnis gehen an den 72-Stunden-BOT.
Grund: Der BUE-Bot verbucht bei mehreren Vorgaengen derselben Kundenverbindung die Abloese
mehrfach (Test ODPB/HSB4K vom 15.09.2026)."""
import sys, zipfile, copy
from lxml import etree
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
XML='{http://www.w3.org/XML/1998/namespace}'
EIN, AUS = sys.argv[1], sys.argv[2]
zin=zipfile.ZipFile(EIN); teile={n: zin.read(n) for n in zin.namelist()}
doc=etree.fromstring(teile['word/document.xml']); protokoll=[]

def ptext(p): return ''.join(t.text or '' for t in p.iter(W+'t'))
def alle(): return list(doc.iter(W+'p'))
def finde(text, nr=0):
    tr=[p for p in alle() if ptext(p)==text]; assert len(tr)>nr, (text, len(tr)); return tr[nr]
def start(prefix):
    tr=[p for p in alle() if ptext(p).startswith(prefix)]; assert len(tr)==1, (prefix, len(tr)); return tr[0]
def hat_anker(p):
    return any(e.tag in (W+'commentRangeStart', W+'commentRangeEnd', W+'commentReference') for e in p.iter())
def settext(p, text):
    runs=[r for r in p.findall(W+'r') if r.find(W+'t') is not None]
    for r in runs[1:]: p.remove(r)
    if runs: r=runs[0]
    else: r=etree.SubElement(p, W+'r'); etree.SubElement(r, W+'t')
    for e in list(r):
        if e.tag in (W+'t', W+'br'): r.remove(e)
    for i,teil in enumerate(text.split('\n')):
        if i: etree.SubElement(r, W+'br')
        t=etree.SubElement(r, W+'t'); t.text=teil; t.set(XML+'space','preserve')
    for e in p.findall(W+'proofErr'): p.remove(e)
    protokoll.append('geändert: '+text.replace('\n',' ')[:80]); return p
def loesche(p):
    ziel=p.getprevious()
    while ziel is not None and ziel.tag!=W+'p': ziel=ziel.getprevious()
    if ziel is None:
        ziel=p.getnext()
        while ziel.tag!=W+'p': ziel=ziel.getnext()
    if hat_anker(p):
        for e in list(p):
            if e.tag in (W+'commentRangeStart', W+'commentRangeEnd') or (e.tag==W+'r' and e.find(W+'commentReference') is not None): ziel.append(e)
    protokoll.append('gelöscht: '+ptext(p)[:80]); p.getparent().remove(p)
def klon(vorlage, text=None):
    p=copy.deepcopy(vorlage)
    for e in list(p):
        if e.tag in (W+'commentRangeStart', W+'commentRangeEnd', W+'bookmarkStart', W+'bookmarkEnd', W+'proofErr'): p.remove(e)
        elif e.tag==W+'r' and (e.find(W+'commentReference') is not None or e.find(W+'t') is None): p.remove(e)
    if text is not None: settext(p, text)
    else: protokoll.append('kopiert: '+ptext(p)[:80])
    return p
def nach(p, *neue):
    for n in neue: p.addnext(n); p=n
    return p

# ------------------------------------------------ 1. Kapitel III: Umfang Gesamt vor dem Fehlerlisten-Test
hinweis_iii = start('Hinweis: Alle Einzelprüfungen sind durchlaufen. Abweichungen aus den Einzelprüfungen')
settext(hinweis_iii, 'Hinweis: Alle Einzelprüfungen sind durchlaufen. Geprüft werden jetzt der Umfang der Übertragung und die in <Fehlerliste> gesammelten Prüfnotizen.')
wenn_fl = hinweis_iii.getnext(); assert ptext(wenn_fl)=='WENN'
bed_fl  = wenn_fl.getnext();   assert ptext(bed_fl)=='<Fehlerliste> <> leer'
dann_fl = bed_fl.getnext();    assert ptext(dann_fl)=='DANN'
kl_fl   = dann_fl.getnext();   assert ptext(kl_fl)=='<BE-Klassifikation> = „Nachprüfung erforderlich“'
link_fl = kl_fl.getnext();     assert ptext(link_fl)=='Weiter zum Kapitel „BE-Handling“'
ende_fl = link_fl.getnext();   assert ptext(ende_fl)=='Ende WENN'
neu = [klon(wenn_fl), klon(bed_fl, '<BUE_UMFANG> = „Gesamt“'), klon(dann_fl),
       klon(kl_fl, '<BE-Klassifikation> = „Gesamte Kundenverbindung“'), klon(link_fl), klon(ende_fl)]
# vor den bestehenden WENN-Block setzen
for n in neu: wenn_fl.addprevious(n)
nach(ende_fl, klon(hinweis_iii,
    'Hinweis: Vorgänge mit <BUE_UMFANG> = „Gesamt“ werden vollständig geprüft und anschließend ausgesteuert, weil der '
    'nachgelagerte BÜ-Bot bei mehreren Vorgängen derselben Kundenverbindung die Ablöse mehrfach verbucht und mehrere '
    'Anschreiben versendet. Die Übertragung der gesamten Kundenverbindung erfolgt manuell; der Bearbeitungshinweis '
    'enthält neben der BE-Klassifikation die Prüfnotizen der Fehlerliste, damit die Sachbearbeitung auf dem Prüfergebnis aufsetzt.'))
settext(finde('Weiter zum Kapitel „Weiterleitung an den BÜ-Bot“'), 'Weiter zum Kapitel „Weiterleitung an den BÜ-Bot“') if False else None

# ------------------------------------------------ 2. Notizbestueckung: nur noch Einzel
wenn_n = finde('<BUE_UMFANG> = „Gesamt“', 1).getprevious()   # zweites Vorkommen liegt in der Notizbestueckung
assert ptext(wenn_n)=='WENN'
bed_n = wenn_n.getnext(); dann_n = bed_n.getnext(); ges_n = dann_n.getnext(); sonst_n = ges_n.getnext(); einz_n = sonst_n.getnext(); ende_n = einz_n.getnext()
assert [ptext(x) for x in (dann_n, ges_n, sonst_n, ende_n)] == ['DANN', 'Feld „Betroffene VNR“ = „gesamte Kundenverbindung“', 'SONST', 'Ende WENN'], [ptext(x) for x in (dann_n, ges_n, sonst_n, ende_n)]
assert ptext(einz_n).startswith('Feld „Betroffene VNR“ = „angegebene VNR beachten“')
for x in (wenn_n, bed_n, dann_n, ges_n, sonst_n, ende_n): loesche(x)
settext(start('Hinweis: Es wurde keine BE festgestellt. Der Vorgang wird nach der Notizbestückung immer'),
        'Hinweis: Es wurde keine BE festgestellt und der Umfang ist „Einzel“. Der Vorgang wird nach der Notizbestückung '
        'immer an den 72-Stunden-BOT übergeben. Eine Prüfung des Vertriebskanals des abgebenden Bestandsinhabers erfolgt '
        'im Prüf-Bot nicht: Der 72-Stunden-BOT prüft selbst, ob der Bestandsinhaber der AO zugeordnet ist, gibt in diesem '
        'Fall die 72-Stunden-Information aus und leitet alle übrigen Vorgänge ohne Wartezeit an den BÜ-BOT weiter.')

# ------------------------------------------------ 3. Hinweis in der Vorpruefung
settext(start('Hinweis: <BUE_UMFANG> hat die Ausprägungen „Einzel“ und „Gesamt“; beide werden vollständig verarbeitet'),
        'Hinweis: <BUE_UMFANG> hat die Ausprägungen „Einzel“ und „Gesamt“. Beide durchlaufen alle Prüfschritte. „Einzel“ '
        'wird bei positivem Ergebnis an den 72-Stunden-BOT übergeben; „Gesamt“ wird nach der Prüfung im Kapitel „Test auf '
        'Fehlerliste“ ausgesteuert. Nennt der Auftrag mehrere Versicherungsnummern, eröffnet Celonis je Nummer einen eigenen '
        'Postkorbvorgang mit derselben E-Mail und einer eigenen führenden VNR; jeder dieser Vorgänge durchläuft den Prüf-Bot eigenständig.')

# ------------------------------------------------ 4. Feldbeschreibung BUE_UMFANG
settext(start('Feld_Format CH. Ausprägungen: Einzel (Übertragung der genannten Versicherungsnummer), Gesamt'),
        'Feld_Format CH. Ausprägungen: Einzel (Übertragung der genannten Versicherungsnummer), Gesamt (Übertragung der '
        'gesamten Kundenverbindung). Nennt der Auftrag mehrere Versicherungsnummern, eröffnet Celonis je Nummer einen eigenen '
        'Vorgang; jeder trägt „Einzel“, bei zusätzlicher Nennung der gesamten Kundenverbindung „Gesamt“. „Einzel“ wird bei '
        'positiver Prüfung an den 72-Stunden-BOT übergeben; „Gesamt“ wird nach vollständiger Prüfung als Business Exception '
        '„Gesamte Kundenverbindung“ ausgesteuert, weil der BÜ-Bot bei mehreren Vorgängen derselben Kundenverbindung die Ablöse mehrfach verbucht.')

# ------------------------------------------------ 5. Werteliste BE-Klassifikation
np_ = finde('Nachprüfung erforderlich')
nach(np_, klon(np_, 'Gesamte Kundenverbindung'))

# ------------------------------------------------ 6. Kurzbeschreibung
p=start('Weiterleitung an den BÜ-Bot: Alle freigegebenen Vorgänge werden mit vollständig bestückter Notiz')
settext(p, ptext(p).replace('Alle freigegebenen Vorgänge werden', 'Alle freigegebenen Vorgänge mit Umfang „Einzel“ werden'))
p=start('BE-Handling: Die gesammelten Ablehnungsgründe werden bewertet.')
settext(p, 'BE-Handling: Die gesammelten Ablehnungsgründe werden bewertet. Der Vorgang wird abgelehnt, ausgesteuert oder freigegeben; '
           'Vorgänge mit Umfang „Gesamt“ werden nach vollständiger Prüfung immer ausgesteuert.')

# ------------------------------------------------ 7. Ablaufdiagramm
settext(finde('Fehlerlistegefüllt?'), 'Fehlerliste gefüllt\noder Umfang „Gesamt“?')
settext(finde('leer'), 'nein')
settext(finde('gefüllt'), 'ja')

teile['word/document.xml']=etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
with zipfile.ZipFile(AUS,'w',zipfile.ZIP_DEFLATED) as z:
    for n,d in teile.items(): z.writestr(n,d)
print('\n'.join(protokoll)); print('ok', AUS)
