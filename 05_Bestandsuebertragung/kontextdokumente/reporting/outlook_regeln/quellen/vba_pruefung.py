"""Statische Pruefung der VBA-Quellen vor dem Build.

LibreOffice kompiliert die Module nachsichtiger als Excel. Diese Pruefung faengt
die Fehler ab, die Excel beim Kompilieren meldet, LibreOffice aber durchlaesst:
- Mehrfachdeklaration im aktuellen Gueltigkeitsbereich (Dim/Const/Parameter doppelt)
- Mehrdeutiger Name auf Modulebene (Prozedur oder Variable doppelt)
- Deklarationen auf Modulebene nach der ersten Prozedur (Excel: Variable nicht definiert)
- Aufruf modX.Name (auch in OnAction/OnTime-Texten) auf fehlende oder private Prozedur
- Namen, die in einer Prozedur benutzt, aber nirgends deklariert sind (Excel prueft mit Option Explicit beim
  Kompilieren das ganze Modul - ein Treffer legt alle Makros lahm; LibreOffice merkt es erst, wenn die Zeile laeuft)
"""
import collections
import glob
import os
import re

KOPF = re.compile(r'(?:(?:Public|Private|Friend)\s+)?(?:Static\s+)?(Sub|Function|Property\s+(Get|Let|Set))\s+(\w+)\s*\((.*)\)', re.I)
ENDE = re.compile(r'End\s+(Sub|Function|Property)\b', re.I)


def _zeilen(pfad):
    text = open(pfad, encoding='utf-8').read().replace(' _\n', ' ').replace(' _\r\n', ' ')
    return [re.sub(r"'.*$", '', re.sub(r'"[^"]*"', '""', z)).strip() for z in text.split('\n')], text


def _namen(liste):
    """Namen aus einer Deklarationsliste 'a As Long, b() As String, c As Variant'."""
    tiefe, teil, teile = 0, '', []
    for ch in liste:
        if ch == '(':
            tiefe += 1
        elif ch == ')':
            tiefe -= 1
        if ch == ',' and tiefe == 0:
            teile.append(teil)
            teil = ''
        else:
            teil += ch
    teile.append(teil)
    namen = []
    for t in teile:
        t = re.sub(r'^\s*((Optional|ByVal|ByRef|ParamArray)\s+)+', '', t, flags=re.I)
        m = re.match(r'\s*(\w+)', t)
        if m:
            namen.append(m.group(1))
    return namen


# VBA-Schluesselwoerter: als Variablenname ein Syntaxfehler (VBA unterscheidet keine Gross-/Kleinschreibung, dO = Do)
RESERVIERT = set('''and as boolean byref byte byval call case const currency date declare dim do double each else elseif end enum
eqv erase error exit false for function get global gosub goto if imp in integer is let like long loop lset me mod new next not
nothing null on optional or paramarray preserve private property public raiseevent redim rem resume return rset select set
single static step stop string sub then to true type typeof until variant wend while with withevents xor'''.split())


# Eingebaute Namen (Schluesselwoerter, Funktionen, Konstanten), die die Module benutzen duerfen, ohne sie zu deklarieren
EINGEBAUT = RESERVIERT | set('''abs array asc ascw callbyname cbool cdate cdbl chr chrw cint clng createobject cstr dateserial datevalue
day empty err explicit fix format getobject hex hour iif instr instrrev int isarray isdate isempty iserror ismissing isnull
isnumeric isobject join lbound lcase left len ltrim mid minute month msgbox now object replace right rnd round rtrim second sgn
space split sqr str strcomp thisworkbook timer trim typename ubound ucase val vartype year application endif resume
vblf vbcr vbcrlf vbtab vbnewline vbnullstring vbyesno vbyes vbno vbquestion vbexclamation vbinformation vbcritical
vbdefaultbutton1 vbdefaultbutton2 vbokonly vbokcancel vbok vbcancel vbstring vbobjecterror vblet vbget vbset vbmethod
vbtextcompare vbbinarycompare'''.split())


def undeklariert(dateien):
    """Namen, die in einer Prozedur benutzt, aber weder dort noch auf Modulebene noch oeffentlich deklariert sind."""
    module = {}
    for pfad in dateien:
        zeilen, _ = _zeilen(pfad)
        module[os.path.splitext(os.path.basename(pfad))[0]] = zeilen
    welt = set(n.lower() for n in module)                    # Modul- und Klassennamen
    eigen = {}
    for name, zeilen in module.items():
        e, proc = set(), None
        for s in zeilen:
            k = KOPF.match(s)
            if k:
                proc = k.group(3)
                e.add(proc.lower())
                if not s.lower().startswith('private'):
                    welt.add(proc.lower())
                continue
            if ENDE.match(s):
                proc = None
                continue
            if proc is None:
                d = re.match(r'(Public|Global|Private|Dim|Const)\s+(?:Const\s+)?(.*)', s, re.I)
                if d and not re.match(r'(Sub|Function|Property|Declare|Enum|Type|Static)\b', d.group(2), re.I):
                    for n in _namen(d.group(2)):
                        e.add(n.lower())
                        if d.group(1).lower() in ('public', 'global'):
                            welt.add(n.lower())
        eigen[name] = e
    befunde = []
    for name, zeilen in module.items():
        proc, lokal = None, set()
        for nr, s in enumerate(zeilen, 1):
            k = KOPF.match(s)
            if k:
                proc = k.group(3)
                lokal = set(n.lower() for n in _namen(k.group(4))) | {proc.lower()}
                continue
            if ENDE.match(s):
                proc = None
                continue
            if proc is None or not s:
                continue
            for anw in re.split(r':(?!=)', s):
                d = re.match(r'(?:.*\bThen\s+)?(Dim|Static|Const)\s+(.*)', anw.strip(), re.I)
                if d:
                    lokal |= set(n.lower() for n in _namen(d.group(2)))
            marke = re.match(r'^(\w+):\s*$', s)
            if marke:
                lokal.add(marke.group(1).lower())
                continue
            code = re.sub(r'\b(GoTo|Resume)\s+\w+', ' ', s, flags=re.I)
            code = re.sub(r'\bAs\s+(New\s+)?\w+', ' ', code, flags=re.I)
            code = re.sub(r'\.\s*\w+', ' ', code)               # Mitglieder (obj.Name)
            code = re.sub(r'\b\w+\s*:=', ' ', code)             # benannte Argumente
            code = re.sub(r'&H[0-9A-Fa-f]+', ' ', code)
            for m in re.finditer(r'[A-Za-z_]\w*', code):
                w = m.group(0).lower()
                if w in EINGEBAUT or w in lokal or w in welt or w in eigen[name]:
                    continue
                befunde.append('%s:%d %s: %s nicht deklariert (Excel: Kompilierfehler)' % (name, nr, proc, m.group(0)))
    return befunde


def pruefe(verzeichnis):
    dateien = sorted(glob.glob(os.path.join(verzeichnis, '*.bas')) + glob.glob(os.path.join(verzeichnis, '*.cls')))
    befunde, oeffentlich, alle = [], {}, {}
    for pfad in dateien:
        modul = os.path.splitext(os.path.basename(pfad))[0].lower()
        zeilen, _ = _zeilen(pfad)
        modulnamen = collections.Counter()
        proc, lokal = None, {}
        for nr, s in enumerate(zeilen, 1):
            k = KOPF.match(s)
            if k:
                proc = k.group(3)
                schluessel = proc.lower() + ('|' + k.group(2).lower() if k.group(2) else '')
                modulnamen[schluessel] += 1
                alle.setdefault(modul, set()).add(proc.lower())
                if not s.lower().startswith('private'):
                    oeffentlich.setdefault(modul, set()).add(proc.lower())
                lokal = {}
                for n in _namen(k.group(4)):
                    if n.lower() in RESERVIERT:
                        befunde.append('%s:%d %s: Parameter %s ist ein VBA-Schluesselwort' % (os.path.basename(pfad), nr, proc, n))
                    if n.lower() in lokal:
                        befunde.append('%s:%d %s: Parameter %s doppelt' % (os.path.basename(pfad), nr, proc, n))
                    lokal[n.lower()] = nr
                continue
            if ENDE.match(s):
                proc = None
                continue
            if proc is None:
                if s and alle.get(modul) and not s.lower().startswith(('attribute', 'option')):
                    befunde.append('%s:%d Deklaration nach der ersten Prozedur (Excel: nur Kommentare erlaubt): %s'
                                   % (os.path.basename(pfad), nr, s[:60]))
                d = re.match(r'(?:(?:Dim|Private|Public|Global)\s+)?(?:Const\s+)?(.*)', s, re.I)
                if re.match(r'(Dim|Private|Public|Global|Const)\s', s, re.I) and not re.match(r'(Sub|Function|Property|Declare|Enum|Type|Static)\b', d.group(1), re.I):
                    for n in _namen(d.group(1)):
                        modulnamen[n.lower()] += 1
                        if s.lower().startswith(('public', 'global')):
                            oeffentlich.setdefault(modul, set()).add(n.lower())
                continue
            for anw in re.split(r':(?!=)', s):
                anw = re.sub(r'^.*\bThen\s+', '', anw.strip(), flags=re.I)
                d = re.match(r'(Dim|Static|Const)\s+(.*)', anw, re.I)
                if not d:
                    continue
                for n in _namen(d.group(2)):
                    if n.lower() in RESERVIERT:
                        befunde.append('%s:%d %s: Variable %s ist ein VBA-Schluesselwort' % (os.path.basename(pfad), nr, proc, n))
                    if n.lower() in lokal:
                        befunde.append('%s:%d %s: %s doppelt deklariert (zuerst Zeile %d)'
                                       % (os.path.basename(pfad), nr, proc, n, lokal[n.lower()]))
                    else:
                        lokal[n.lower()] = nr
        for n, anzahl in modulnamen.items():
            if anzahl > 1:
                befunde.append('%s: Name %s auf Modulebene %d-mal' % (os.path.basename(pfad), n, anzahl))
    for pfad in dateien:
        _, text = _zeilen(pfad)
        for nr, zeile in enumerate(text.split('\n'), 1):
            zeile = re.sub(r"'.*$", '', zeile) if '"' not in zeile else zeile
            for m in re.finditer(r'\b(mod\w+)\.(\w+)', zeile):
                mod, name = m.group(1).lower(), m.group(2).lower()
                if mod not in alle:
                    befunde.append('%s:%d Modul %s fehlt' % (os.path.basename(pfad), nr, m.group(1)))
                elif name not in oeffentlich.get(mod, set()):
                    befunde.append('%s:%d %s nicht vorhanden oder privat' % (os.path.basename(pfad), nr, m.group(0)))
    befunde += undeklariert(dateien)
    return befunde


if __name__ == '__main__':
    import sys
    b = pruefe(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vba'))
    print('\n'.join(b) if b else 'VBA-Quellen: keine Befunde')
    sys.exit(1 if b else 0)
