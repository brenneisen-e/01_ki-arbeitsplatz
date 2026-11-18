# -*- coding: utf-8 -*-
"""Tests für aufraeumen.py: Zielreihenfolge, Urteil über Platztausch, verdeckte Regeln, Plan, Namensliste.

Läuft ohne Excel, Outlook und LibreOffice mit erfundenen Regeln (keine Daten eines Postfachs).
Aufruf: python3 test_aufraeumen.py [arbeitsordner]      Ende mit Exitcode 1, wenn eine Prüfung fehlschlägt.
"""
import os
import sys
import tempfile

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import aufraeumen as a                 # noqa: E402

ERGEBNISSE = []
PF = 'Bestandsuebertragungen@example.org'


def pruefe(ok, text, detail=''):
    ERGEBNISSE.append((bool(ok), text))
    print('  [%s] %s%s' % ('OK' if ok else 'FEHLER', text, '' if ok or not detail else '\n         ' + str(detail)))


def regel(name, reihe, bed=(), aus=(), akt=(('In Ordner verschieben', 'Ordner ' + 'A'),), aktiv='Ja', stopp='Ja',
          typ='Empfangen', pseudo=None):
    g = dict(name=name, reihe=reihe, postfach=PF, aktiv=aktiv, typ=typ, gueltig='Server (immer)', bed=list(bed),
             aus=list(aus), akt=list(akt) + ([('Keine weiteren Regeln anwenden', '')] if stopp == 'Ja' else []), stopp=stopp)
    if pseudo:
        g['pseudo'] = pseudo
    return g


def liste(paare, gewollt=()):
    n = a.Namensliste()
    n['bestand'] = list(paare)
    n.gewollt['bestand'] = set(gewollt)
    return n


def abbruch(f):
    """Meldung des SystemExit, mit dem f abbricht; '' wenn f durchläuft."""
    try:
        f()
    except SystemExit as e:
        return str(e)
    return ''


def ordner(x):
    return (('In Ordner verschieben', 'Ordner ' + x),)


# ---------------------------------------------------------------- Zielreihenfolge
print('\n== Zielreihenfolge')
f, nr = a.zielfolge([('c', '30 Drei'), ('a', '10 Eins'), ('b', '20 Zwei')])
pruefe(nr and [n for _, n in f] == ['10 Eins', '20 Zwei', '30 Drei'], 'Alle Namen mit Nummer: Die Nummer bestimmt den Platz')
f, nr = a.zielfolge([('c', '20 Drei'), ('a', '10 Eins'), ('b', '20 Zwei')])
pruefe([n for _, n in f] == ['10 Eins', '20 Drei', '20 Zwei'], 'Gleiche Nummer: Die Zeile entscheidet')
f, nr = a.zielfolge([('c', '9 Neun'), ('a', '10 Zehn')])
pruefe([n for _, n in f] == ['9 Neun', '10 Zehn'], 'Nummern zählen als Zahl, nicht als Text (9 vor 10)')
f, nr = a.zielfolge([('c', 'Drei'), ('a', 'Eins'), ('b', '1zu1 aussortieren')])
pruefe(not nr and [n for _, n in f] == ['Drei', 'Eins', '1zu1 aussortieren'],
       'Keine Nummern: Reihenfolge der Zeilen („1zu1 …“ ist keine Nummer)')
m = abbruch(lambda: a.zielfolge([('c', '30 Drei'), ('a', 'Eins')], 'Test'))
pruefe('keine Nummer' in m and '„Eins“' in m, 'Gemischt: Abbruch mit den Namen ohne Nummer', m)
pruefe(sorted(a._bleiben([1, 2, 6, 3, 4, 5])) == [0, 1, 3, 4, 5], 'Längste Teilfolge bleibt stehen: nur eine Regel wandert')

# ---------------------------------------------------------------- Folgerung zwischen Bedingungen
print('\n== Bedingungen')
B = 'Betreff enthält'
pruefe(a._folgt((B, '"Kennzeichnung konnte nicht", "KENNZEICHNUNG"'), (B, '"Kennzeichnung"')),
       'Text: Jeder Wert enthält einen Wert der allgemeineren Bedingung (ohne Groß/Klein)')
pruefe(not a._folgt((B, '"Kennzeichnung", "Sonstiges"'), (B, '"Kennzeichnung"')), 'Text: Ein Wert passt nicht – keine Folgerung')
pruefe(a._folgt(('Absender ist', 'Bot A'), ('Absender ist', 'Bot B; Bot A'))
       and not a._folgt(('Absender ist', 'Bot A; Bot C'), ('Absender ist', 'Bot B; Bot A')),
       'Personenliste: nur als Teil der größeren Liste')
pruefe(a._folgt((B, '"Rechnung 12"'), ('Betreff oder Mailtext enthält', '"rechnung"'))
       and not a._folgt(('Betreff oder Mailtext enthält', '"rechnung"'), (B, '"rechnung"')),
       '„Betreff enthält“ folgt „Betreff oder Mailtext enthält“, nicht umgekehrt')
pruefe(not a._folgt((B, '"x"'), ('Mailtext enthält', '"x"')), 'Verschiedene Arten: keine Folgerung')
pruefe(a._folgt(('Hat Anhang', ''), ('Hat Anhang', '')), 'Kennzeichen ohne Wert (Hat Anhang) folgt aus sich selbst')

# ---------------------------------------------------------------- verdeckte Regeln
print('\n== Verdeckt')
allg = regel('Allgemein', 1, bed=[(B, '"Kennzeichnung nicht umgesetzt", "Kennzeichnung"')], akt=ordner('A'))
spez = regel('Speziell', 2, bed=[('Gesendet an', 'Team X'), (B, '"Kennzeichnung", "Kennzeichnung nicht umgesetzt"')],
             aus=[('Gesendet an', 'Liste Y')], akt=ordner('B'))
pruefe(a.verdeckt(allg, spez), 'Speziellere Regel hinter der allgemeinen: greift nie (Werte in anderer Reihenfolge)')
pruefe(not a.verdeckt(spez, allg), 'Umgekehrt nicht: Die allgemeine fängt den Rest')
pruefe(not a.verdeckt(dict(allg, aktiv='Nein'), spez), 'Frühere Regel ausgeschaltet: verdeckt nichts')
pruefe(not a.verdeckt(regel('Ohne Stopp', 1, bed=allg['bed'], stopp='Nein'), spez), 'Frühere Regel ohne Stopp: verdeckt nichts')
pruefe(not a.verdeckt(dict(allg, aus=[('Absender ist', 'Chef')]), spez), 'Frühere Regel mit eigener Ausnahme: nicht sicher verdeckt')
pruefe(a.verdeckt(dict(allg, aus=[('Gesendet an', 'Liste Y')]), dict(spez, aus=[('Gesendet an', 'Liste Y; Liste Z')])),
       'Ausnahme der früheren steckt in der Ausnahme der späteren: verdeckt')
pruefe(not a.verdeckt(regel('Sammel', 1, bed=[]), spez), 'Regel ohne sichtbare Bedingung zählt hier nicht')
pruefe(not a.verdeckt(dict(allg, pseudo=[('Bedingung', 'Weitere Bedingung nicht lesbar')]), spez),
       'Frühere Regel nicht vollständig gelesen: kein Urteil')
pruefe(not a.verdeckt(dict(allg, typ='Senden'), spez), 'Anderer Regeltyp: verdeckt nichts')

# ---------------------------------------------------------------- Urteil über einen Platztausch
print('\n== Platztausch')
r1 = regel('Eins', 1, bed=[(B, '"Alpha"')], akt=ordner('A'))
r2 = regel('Zwei', 2, bed=[('Mailtext enthält', '"Beta"')], akt=ordner('B'))
pruefe(a.umkehr(r1, r2)[0] == a.PRUEFEN and '„Eins“' in a.umkehr(r1, r2)[1],
       'Verschiedene Felder, beide beenden die Kette: bitte prüfen (nennt, wer heute gewinnt)', a.umkehr(r1, r2))
u = a.umkehr(dict(r1, aktiv='Nein'), r2)
pruefe(u[0] == a.OHNE and u[1].startswith('„Eins“ ist ausgeschaltet') and 'eingeschaltet, zählt ihr neuer Platz' in u[1],
       'Eine Regel ausgeschaltet: ohne Wirkung – mit dem Hinweis, dass beim Einschalten der neue Platz zählt', u)
pruefe(a.umkehr(r1, dict(r2, akt=r1['akt']))[0] == a.OHNE, 'Beide tun dasselbe: ohne Wirkung')
k1 = regel('Kopie', 1, bed=r1['bed'], akt=(('In Ordner kopieren', 'Ordner K'),), stopp='Nein')
k2 = regel('Kategorie', 2, bed=r2['bed'], akt=(('Kategorie zuweisen', 'Blau'),), stopp='Nein')
pruefe(a.umkehr(k1, k2)[0] == a.OHNE, 'Keine beendet die Kette, keine räumt weg: ohne Wirkung')
pruefe(a.umkehr(k1, r2)[0] == a.PRUEFEN, 'Eine beendet die Kette: bitte prüfen')
m1 = regel('M1', 1, bed=r1['bed'], akt=ordner('A'), stopp='Nein')
m2 = regel('M2', 2, bed=r2['bed'], akt=ordner('B'), stopp='Nein')
pruefe(a.umkehr(m1, m2)[0] == a.PRUEFEN, 'Beide verschieben (ohne Stopp): bitte prüfen')
pruefe(a.umkehr(dict(r1, typ='Senden'), r2)[0] == a.OHNE, 'Verschiedene Regeltypen: ohne Wirkung')
e1 = regel('E1', 1, bed=[(B, '"Danke"')], aus=[(B, '"AW:", "WG:"')], akt=ordner('A'))
e2 = regel('E2', 2, bed=[(B, '"AW: Danke"')], akt=ordner('B'))
pruefe(a.umkehr(e1, e2)[0] == a.OHNE and 'Ausnahme' in a.umkehr(e1, e2)[1], 'Bedingung der einen ist Ausnahme der anderen: ohne Wirkung')
s1 = regel('S1', 1, bed=[('Absender ist', 'bot@example.org')], akt=ordner('A'))
s2 = regel('S2', 2, bed=[('Absender ist', 'info@example.com; team@example.com')], akt=ordner('B'))
pruefe(a.umkehr(s1, s2)[0] == a.OHNE, 'Verschiedene Absenderadressen: ohne Wirkung')
pruefe(a.umkehr(dict(s1, bed=[('Absender ist', 'Liste A')]), dict(s2, bed=[('Absender ist', 'Liste B')]))[0] == a.PRAKTISCH,
       'Verschiedene Absendernamen (Verteilerlisten möglich): praktisch ohne Wirkung')
pruefe(a.umkehr(dict(s1, bed=[('Absender ist', 'Liste A; Liste B')]), dict(s2, bed=[('Absender ist', 'Liste B')]))[0] == a.PRUEFEN,
       'Gemeinsamer Absender: bitte prüfen')
t1 = regel('T1', 1, bed=[('Absenderadresse enthält', '"kv@pool.example"')], akt=ordner('A'))
t2 = regel('T2', 2, bed=[('Absenderadresse enthält', '"finanz"'), (B, '"Erinnerung"')], akt=ordner('B'))
pruefe(a.umkehr(t1, t2)[0] == a.PRAKTISCH, 'Verschiedene Teile der Absenderadresse: praktisch ohne Wirkung')
pruefe(a.umkehr(t1, dict(t2, bed=[('Absenderadresse enthält', '"pool"')]))[0] == a.PRUEFEN,
       'Ein Adressteil steckt im anderen: bitte prüfen')
pruefe(a.umkehr(s1, t2)[0] == a.OHNE and a.umkehr(dict(s1, bed=[('Absender ist', 'x@finanz.example')]), t2)[0] == a.PRUEFEN,
       'Absenderadresse gegen Adressteil: ohne Wirkung nur, wenn der Teil nicht in der Adresse steckt')
u = a.umkehr(allg, spez)
pruefe(u[0] == a.PRUEFEN and 'greift „Speziell“ nie' in u[1], 'Verdeckte Regel nach vorn holen: bitte prüfen, mit Klartext', u)
pruefe(a.umkehr(dict(r1, pseudo=[('Bedingung', 'Bedingung nicht lesbar')]), s2)[0] == a.PRUEFEN,
       'Bedingung nicht lesbar: kein Urteil „getrennt“')

# ---------------------------------------------------------------- Plan
print('\n== Plan')
regeln = [
    regel('Abwesend', 1, bed=[('Formular / Nachrichtenklasse', '"IPM.Note.Rules.OofTemplate.Microsoft"')], akt=ordner('Auto')),
    regel('Fehler', 2, bed=[('Mailtext enthält', '"Hinweis vom System"')], akt=ordner('Fehler')),
    regel('Fehler', 3, bed=[('Mailtext enthält', '"Hinweis vom System"')], akt=ordner('Fehler')),
    regel('Fehler', 4, bed=[('Mailtext enthält', '"Hinweis vom System"')], akt=ordner('Fehler')),
    regel('Alt', 5, bed=[('Absenderadresse enthält', '"@alt.example"')], akt=ordner('Alt'), aktiv='Nein'),
    regel('Kennzeichnung', 6, bed=allg['bed'], akt=ordner('A')),
    regel('Verteilung', 7, bed=spez['bed'], aus=spez['aus'], akt=ordner('B')),
    regel('Rest', 8, bed=[], aus=[(B, '"Unzustellbar"')], akt=(('Umleiten an', 'Team'),)),
]
namen = [('Abwesend', '11 Aussortieren – Abwesend'), ('Fehler', '12 Aussortieren – Fehler'), ('Alt', '81 Alt'),
         ('Kennzeichnung', '31 Kennzeichnung'), ('Verteilung', '32 Verteilung'), ('Rest', '91 Rest')]
auf = a.auftrag(PF, regeln, liste(namen))
plan = [(p['aktion'], p['regel'], p['neu']) for p in auf['plan']]
pruefe(plan[0] == ('LOESCHEN', 'Fehler', 'Duplikate') and [p[0] for p in plan].count('UMBENENNEN') == 6
       and plan[-1] == ('POSITION', '81 Alt', 'nach: 32 Verteilung') and len(plan) == 8,
       'Plan: Duplikate löschen, alle umbenennen, eine Regel umstellen (hinter ihre neue Vorgängerin)', plan)
pruefe([p['nr'] for p in auf['plan']] == list(range(1, 9)) and all(p['ausf'] == 'Ja' for p in auf['plan']),
       'Plan: nummeriert, alle Zeilen eingeschaltet')
pruefe((auf['n_heute'], auf['n_danach'], auf['n_duplikate'], auf['n_umbenannt'], len(auf['umstellungen'])) == (8, 6, 2, 6, 1),
       'Kennzahlen: 8 Regeln, 6 danach, 2 Duplikate, 6 umbenannt, 1 umgestellt')
pruefe(len(auf['tausche']) == 2 and {t['stufe'] for t in auf['tausche']} == {a.OHNE} and not auf['offen'],
       'Die ausgeschaltete Regel tauscht mit zwei Regeln den Platz – ohne Wirkung')
pruefe('ohne Wirkung' in auf['plan'][-1]['warum'] and 'Nummer im Namen' in auf['plan'][-1]['warum'],
       'Begründung der Umstellung nennt das Urteil', auf['plan'][-1]['warum'])
pruefe([z['neu'] for z in auf['verdeckt']] == ['32 Verteilung'] and auf['verdeckt'][0]['verdeckt_von']['neu'] == '31 Kennzeichnung',
       'Meldet die Regel, die nie greift, und von wem sie verdeckt wird')
pruefe('Greift nie' in ' '.join(a.hinweise(auf['verdeckt'][0])) and 'Reihenfolge geprüft: 2 Platztausch(e) – 2 ohne Wirkung' in a.pruef_text(auf),
       'Hinweis und Zusammenfassung in Worten', a.pruef_text(auf))

# Verdeckte Regel nach vorn holen: nur mit Bestätigung
tausch = [(x, {'31 Kennzeichnung': '32 Kennzeichnung', '32 Verteilung': '31 Verteilung'}.get(n, n)) for x, n in namen]
m = abbruch(lambda: a.auftrag(PF, regeln, liste(tausch)))
pruefe('nicht bestätigt' in m and '„31 Verteilung“ läuft künftig vor „32 Kennzeichnung“' in m and 'Umstellung gewollt' in m,
       'Umstellung, die die Wirkung ändert: Der Bau bricht ohne Bestätigung ab', m)
lose = a.auftrag(PF, regeln, liste(tausch), streng=False)
pruefe(len(lose['offen']) == 1 and not lose['verdeckt'], 'Namensliste schreiben: meldet sie nur (und nichts ist mehr verdeckt)')
ok = a.auftrag(PF, regeln, liste(tausch, gewollt=['Verteilung']))
pruefe(not ok['offen'] and 'in der Namensliste bestätigt' in ' '.join(p['warum'] for p in ok['plan'] if p['aktion'] == 'POSITION'),
       'Mit „Umstellung gewollt“ = ja wird gebaut, die Begründung nennt die Bestätigung')
pruefe(a.auftrag(PF, regeln, liste(tausch, gewollt=['Kennzeichnung']))['offen'] == [], 'Die Bestätigung gilt an jeder der beiden Regeln')

# Sammelregel vor anderen Regeln
vorn = [(x, {'91 Rest': '05 Rest'}.get(n, n)) for x, n in namen]
sam = a.auftrag(PF, regeln, liste(vorn, gewollt=['Rest']))
pruefe(sum(1 for z in sam['zeilen'] if z['hinter_sammel'] is not None) == 4 and 'Sammelregel' in ' '.join(a.hinweise(sam['zeilen'][1])),
       'Eingeschaltete Sammelregel vorn: Hinweis an jeder eingeschalteten Regel dahinter')

# Namensliste passt nicht
m = abbruch(lambda: a.auftrag(PF, regeln, liste(namen[:-1])))
pruefe('„Rest“ steht 0-mal in der Namensliste' in m, 'Regel fehlt in der Namensliste: Abbruch', m)
m = abbruch(lambda: a.auftrag(PF, regeln, liste(namen + [('Gibt es nicht', '99 X')])))
pruefe('nicht im Export' in m, 'Unbekannte Regel in der Namensliste: Abbruch', m)
m = abbruch(lambda: a.auftrag(PF, regeln, liste(namen[:-1] + [('Rest', '81 Alt')])))
pruefe('mehrfach vergeben' in m, 'Neuer Name doppelt: Abbruch', m)
m = abbruch(lambda: a.auftrag(PF, regeln, liste(namen[:-1] + [('Rest', '')])))
pruefe('neuer Name fehlt' in m, 'Neuer Name leer: Abbruch', m)
m = abbruch(lambda: a.auftrag(PF, regeln, liste(namen[:-1] + [('Rest', 'Abwesend')])))
pruefe('Zwischenname' in m, 'Neuer Name heißt wie eine andere Regel von heute: Abbruch', m)
anders = regeln[:3] + [dict(regeln[3], akt=list(ordner('Anders')) + [('Keine weiteren Regeln anwenden', '')])] + regeln[4:]
m = abbruch(lambda: a.auftrag(PF, anders, liste(namen)))
pruefe('verschiedenem Inhalt' in m and '#n/m' in m, 'Gleicher Name, verschiedener Inhalt: Abbruch statt „Duplikate“', m)

# Ohne Nummern: Reihenfolge der Zeilen, nichts zu tun außer Duplikaten
ohne = a.auftrag(PF, regeln, liste([(g['name'], g['name']) for g in regeln if g['reihe'] not in (3, 4)]))
pruefe([(p['aktion'], p['neu']) for p in ohne['plan']] == [('LOESCHEN', 'Duplikate')] and not ohne['nach_nummer'],
       'Namen unverändert, keine Nummern: Der Plan löscht nur die Duplikate')

# ---------------------------------------------------------------- Namensliste schreiben und lesen
print('\n== Namensliste')
neu, hin = a.namensliste_aus_regeln({'bestand': regeln})
pruefe(neu['bestand'] == [(g['name'], g['name']) for g in regeln if g['reihe'] not in (3, 4)] and not hin,
       'Aus dem Export: jeder Name einmal, in der Reihenfolge von heute')
alt = liste(namen[:3] + [('Früher', '70 Früher')], gewollt=['Alt', 'Früher'])
neu, hin = a.namensliste_aus_regeln({'bestand': regeln}, alt)
pruefe(neu['bestand'][:3] == [('Abwesend', '11 Aussortieren – Abwesend'), ('Fehler', '12 Aussortieren – Fehler'), ('Alt', '81 Alt')]
       and neu['bestand'][3] == ('Kennzeichnung', 'Kennzeichnung') and neu.gewollt['bestand'] == {'Alt'},
       'Mit älterer Liste: übernimmt deren Namen und Bestätigungen, Unbekanntes behält den Namen')
pruefe(len(hin) == 4 and any('„Früher“' in h and 'nicht mehr' in h for h in hin), 'Meldet, was nicht zusammenpasst', hin)

arbeit = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='aufraeumen_')
os.makedirs(arbeit, exist_ok=True)
pfad = os.path.join(arbeit, 'Namensliste_Test.xlsx')
import xlsxwriter                      # noqa: E402
wb = xlsxwriter.Workbook(pfad)
mak = [dict(g, postfach='Maklerauftraege@example.org') for g in regeln[:2]]
a.liste_schreiben(wb, [a.auftrag(PF, regeln, liste(tausch, gewollt=['Verteilung']), streng=False),
                       a.auftrag('Maklerauftraege@example.org', mak,
                                 a.namensliste_aus_regeln({'makler': mak})[0], streng=False)], stand='01.01.2026 12:00')
wb.close()
gelesen = a.namensliste_lesen(pfad)
erwartet = sorted(tausch, key=lambda x: int(x[1].split()[0]))
pruefe(gelesen['bestand'] == erwartet and gelesen.gewollt['bestand'] == {'Verteilung'},
       'Geschriebene Liste wird wieder gelesen: Namen in neuer Reihenfolge, Bestätigung erhalten', gelesen['bestand'])
pruefe(gelesen['makler'] == [('Abwesend', 'Abwesend'), ('Fehler', 'Fehler')], 'Zweites Postfach im eigenen Blatt')
nochmal = a.auftrag(PF, regeln, gelesen)
pruefe([p['regel'] for p in nochmal['plan'] if p['aktion'] == 'POSITION'] == [p['regel'] for p in ok['plan'] if p['aktion'] == 'POSITION'],
       'Aus der gelesenen Liste entsteht derselbe Plan')

n_ok = sum(1 for o, _ in ERGEBNISSE if o)
print('\nErgebnis: %d von %d Prüfungen bestanden' % (n_ok, len(ERGEBNISSE)))
for o, text in ERGEBNISSE:
    if not o:
        print('  FEHLER:', text)
sys.exit(0 if n_ok == len(ERGEBNISSE) else 1)
