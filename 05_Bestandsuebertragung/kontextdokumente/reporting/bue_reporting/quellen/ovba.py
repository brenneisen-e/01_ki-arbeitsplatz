# -*- coding: utf-8 -*-
"""Erzeugt aus VBA-Quelltexten ein vbaProject.bin (MS-OVBA in einem OLE2-Container), ohne Excel.

Aufbau:
- cfb_schreiben(): minimaler Writer fuer Compound File Binary (Version 3, 512-Byte-Sektoren,
  Mini-Stream fuer Streams unter 4096 Byte, sortierter Verzeichnisbaum).
- ovba_komprimieren(): MS-OVBA-Kompression mit reinen Literal-Tokens (gueltig, verlustfrei,
  Chunks zu hoechstens 3640 Byte Rohdaten).
- vba_projekt(): baut die Streams PROJECT, PROJECTwm, VBA/_VBA_PROJECT, VBA/dir und je Modul einen Stream.

Excel kompiliert die Module beim Oeffnen aus dem Quelltext neu (kein Performance-Cache noetig).
Pruefung: `python3 -m oletools.olevba vbaProject.bin` zeigt die Module und ihren Quelltext.
"""
import struct
import uuid

# ------------------------------------------------------------------ MS-OVBA Kompression (nur Literale)
def _chunk_komprimieren(stueck: bytes) -> bytes:
    """MS-OVBA 2.4.1.3.7 ff.: ein DecompressedChunk (<= 4096 Bytes) als Tokenfolgen mit Literal- und Kopier-Tokens."""
    n = len(stueck)
    aus = bytearray()
    pos = 0
    # Kandidaten fuer Treffer ueber ein 3-Byte-Praefix
    praefixe = {}
    while pos < n:
        flag = 0
        tokens = bytearray()
        for bit in range(8):
            if pos >= n:
                break
            # CopyToken-Hilfe (2.4.1.3.19): Bitaufteilung haengt von der Position im Chunk ab
            differenz = pos
            bitcount = 4
            while (1 << bitcount) < differenz:
                bitcount += 1
            max_laenge = (0xFFFF >> bitcount) + 3
            beste_l, beste_o = 0, 0
            if pos >= 1 and pos + 3 <= n:
                for start in reversed(praefixe.get(stueck[pos:pos + 3], ())):
                    l = 3
                    grenze = min(max_laenge, n - pos)
                    while l < grenze and stueck[start + l] == stueck[pos + l]:
                        l += 1
                    if l > beste_l:
                        beste_l, beste_o = l, pos - start
                        if l == grenze:
                            break
            if beste_l >= 3:
                token = ((beste_o - 1) << (16 - bitcount)) | (beste_l - 3)
                tokens += struct.pack('<H', token)
                flag |= (1 << bit)
                for k in range(pos, pos + beste_l):
                    if k + 3 <= n:
                        praefixe.setdefault(stueck[k:k + 3], []).append(k)
                pos += beste_l
            else:
                tokens.append(stueck[pos])
                if pos + 3 <= n:
                    praefixe.setdefault(stueck[pos:pos + 3], []).append(pos)
                pos += 1
        aus.append(flag)
        aus += tokens
    return bytes(aus)


def ovba_komprimieren(daten: bytes) -> bytes:
    """MS-OVBA 2.4.1: Container mit Chunks; jeder Chunk ausser dem letzten ergibt entpackt genau 4096 Bytes.
    Chunks werden echt komprimiert (Excel laedt rohe Chunks nicht); nur wenn ein Chunk nicht unter 4096 Bytes
    zu bringen ist (bei Quelltext nie), wird er roh abgelegt."""
    aus = bytearray(b'\x01')                     # Signatur des Containers
    pos = 0
    while True:
        stueck = daten[pos:pos + 4096]
        pos += 4096
        chunk = _chunk_komprimieren(stueck)
        if len(chunk) + 2 <= 4098:
            kopf = ((len(chunk) + 2 - 3) & 0x0FFF) | (0b011 << 12) | (1 << 15)
            aus += struct.pack('<H', kopf) + chunk
        else:
            if len(stueck) < 4096:
                raise ValueError('letzter Chunk nicht komprimierbar: %d Bytes' % len(stueck))
            aus += struct.pack('<H', (4095 & 0x0FFF) | (0b011 << 12)) + stueck      # roher Chunk, Flag 0
        if pos >= len(daten):
            break
    return bytes(aus)


def auffuellen(text: str) -> str:
    """Haengt Leerzeilen an, bis der letzte 4096er-Rest hoechstens 3640 Bytes hat (Literal-Chunk) oder null ist."""
    while True:
        rest = len(text.encode('cp1252')) % 4096
        if rest == 0 or rest <= 3640:
            return text
        text += '\r\n'


# ------------------------------------------------------------------ dir-Stream
def _rec(id_, payload: bytes) -> bytes:
    return struct.pack('<HI', id_, len(payload)) + payload


def _dir_stream(projektname: str, module, referenzen) -> bytes:
    cp = 'cp1252'
    d = bytearray()
    d += _rec(0x0001, struct.pack('<I', 3))                       # PROJECTSYSKIND: Win64
    d += _rec(0x0002, struct.pack('<I', 0x0409))                  # PROJECTLCID
    d += _rec(0x0014, struct.pack('<I', 0x0409))                  # PROJECTLCIDINVOKE
    d += _rec(0x0003, struct.pack('<H', 1252))                    # PROJECTCODEPAGE
    d += _rec(0x0004, projektname.encode(cp))                     # PROJECTNAME
    d += _rec(0x0005, b'') + _rec(0x0040, b'')                    # PROJECTDOCSTRING (+ Unicode)
    d += _rec(0x0006, b'') + _rec(0x003D, b'')                    # PROJECTHELPFILEPATH (+ 2)
    d += _rec(0x0007, struct.pack('<I', 0))                       # PROJECTHELPCONTEXT
    d += _rec(0x0008, struct.pack('<I', 0))                       # PROJECTLIBFLAGS
    d += struct.pack('<HI', 0x0009, 4) + struct.pack('<IH', 1, 0)  # PROJECTVERSION (Reserved=4, Major, Minor)
    d += _rec(0x000C, b'') + _rec(0x003C, b'')                    # PROJECTCONSTANTS (+ Unicode)
    for name, libid in referenzen:                                # REFERENCEREGISTERED je Referenz
        d += _rec(0x0016, name.encode(cp)) + _rec(0x003E, name.encode('utf-16-le'))
        lib = libid.encode(cp)
        d += _rec(0x000D, struct.pack('<I', len(lib)) + lib + struct.pack('<IH', 0, 0))
    d += _rec(0x000F, struct.pack('<H', len(module)))             # PROJECTMODULES
    d += _rec(0x0013, struct.pack('<H', 0xFFFF))                  # PROJECTCOOKIE
    for name, _quelle, dokument in module:
        d += _rec(0x0019, name.encode(cp))                        # MODULENAME
        d += _rec(0x0047, name.encode('utf-16-le'))               # MODULENAMEUNICODE
        d += _rec(0x001A, name.encode(cp)) + _rec(0x0032, name.encode('utf-16-le'))   # MODULESTREAMNAME (+ Unicode)
        d += _rec(0x001C, b'') + _rec(0x0048, b'')                # MODULEDOCSTRING (+ Unicode)
        d += _rec(0x0031, struct.pack('<I', 0))                   # MODULEOFFSET: Quelltext ab Byte 0
        d += _rec(0x001E, struct.pack('<I', 0))                   # MODULEHELPCONTEXT
        d += _rec(0x002C, struct.pack('<H', 0xFFFF))              # MODULECOOKIE
        d += _rec(0x0022 if dokument else 0x0021, b'')            # MODULETYPE: Dokument/Klasse bzw. Standard
        d += _rec(0x002B, b'')                                    # Ende Modul
    d += _rec(0x0010, b'')                                        # Ende dir
    return bytes(d)


def _verschluesseln(projekt_id: str, daten: bytes, seed: int = 0xF1) -> str:
    """MS-OVBA 2.4.3.2 Data Encryption: Hex-Text fuer CMG/DPB/GC im PROJECT-Stream.
    projekt_id ist der Wert der ID-Eigenschaft samt geschweiften Klammern; seed mit (seed AND 6) = 0, damit keine Fuellbytes noetig sind."""
    proj_key = sum(projekt_id.encode('cp1252')) & 0xFF
    version_enc = seed ^ 2
    proj_key_enc = seed ^ proj_key
    aus = [seed, version_enc, proj_key_enc]
    u1, e1, e2 = proj_key, proj_key_enc, version_enc
    for x in struct.pack('<I', len(daten)) + daten:
        y = x ^ ((e2 + u1) & 0xFF)
        aus.append(y)
        e2, e1, u1 = e1, y, x
    return bytes(aus).hex().upper()


def _entschluesseln(hexwert: str):
    b = bytes.fromhex(hexwert)
    seed, ve, pe = b[0], b[1], b[2]
    u1, e1, e2 = seed ^ pe, pe, ve
    roh = []
    for x in b[3:]:
        y = x ^ ((e2 + u1) & 0xFF)
        e2, e1, u1 = e1, x, y
        roh.append(y)
    roh = roh[(seed & 6) // 2:]
    n = int.from_bytes(bytes(roh[:4]), 'little')
    return seed ^ ve, seed ^ pe, bytes(roh[4:4 + n])


def _project_stream(projektname: str, module, guid: str) -> bytes:
    projekt_id = '{%s}' % guid.upper()
    zeilen = ['ID="%s"' % projekt_id]
    for name, _q, dokument in module:
        zeilen.append(('Document=%s/&H00000000' % name) if dokument else ('Module=%s' % name))
    # Schutzzustand (kein Schutz), Passwort (keines) und Sichtbarkeit (sichtbar) muessen verschluesselt vorliegen;
    # leere Werte liessen Excel das Projekt als "hidden module" behandeln.
    zeilen += ['Name="%s"' % projektname, 'HelpContextID="0"', 'VersionCompatible32="393222000"',
               'CMG="%s"' % _verschluesseln(projekt_id, b'\x00\x00\x00\x00'),
               'DPB="%s"' % _verschluesseln(projekt_id, b'\x00'),
               'GC="%s"' % _verschluesseln(projekt_id, b'\xff'),
               '', '[Host Extender Info]',
               '&H00000001={3832D640-CF90-11CF-8E43-00A0C911005A};VBE;&H00000000', '', '[Workspace]']
    for name, _q, _d in module:
        zeilen.append('%s=0, 0, 0, 0, C' % name)
    return ('\r\n'.join(zeilen) + '\r\n').encode('cp1252')


def _projectwm_stream(module) -> bytes:
    aus = bytearray()
    for name, _q, _d in module:
        aus += name.encode('cp1252') + b'\x00' + name.encode('utf-16-le') + b'\x00\x00'
    aus += b'\x00\x00'
    return bytes(aus)


# VB_Base: Arbeitsmappe 00020819, Tabellenblatt 00020820
DOKUMENT_ATTRIBUTE = ('Attribute VB_Name = "{name}"\r\n'
                      'Attribute VB_Base = "0{{{guid}}}"\r\n'
                      'Attribute VB_GlobalNameSpace = False\r\n'
                      'Attribute VB_Creatable = False\r\n'
                      'Attribute VB_PredeclaredId = True\r\n'
                      'Attribute VB_Exposed = True\r\n'
                      'Attribute VB_TemplateDerived = False\r\n'
                      'Attribute VB_Customizable = True\r\n')


def vba_projekt(module, projektname='BUEReporting') -> bytes:
    """module: Liste von (Name, Quelltext, ist_dokument). Quelltext ohne Attribute-Zeilen; sie werden ergaenzt."""
    referenzen = [                    # wie in jedem Excel-Projekt: VBA und Excel zuerst (ohne sie sind Worksheet, Workbook, xl-Konstanten unbekannt)
        ('VBA', r'*\G{000204EF-0000-0000-C000-000000000046}#4.2#9#C:\Program Files\Common Files\Microsoft Shared\VBA\VBA7.1\VBE7.DLL#Visual Basic For Applications'),
        ('Excel', r'*\G{00020813-0000-0000-C000-000000000046}#1.9#0#C:\Program Files\Microsoft Office\Root\Office16\EXCEL.EXE#Microsoft Excel 16.0 Object Library'),
        ('stdole', r'*\G{00020430-0000-0000-C000-000000000046}#2.0#0#C:\Windows\System32\stdole2.tlb#OLE Automation'),
        ('Office', r'*\G{2DF8D04C-5BFA-101B-BDE5-00AA0044DE52}#2.8#0#C:\Program Files\Common Files\Microsoft Shared\OFFICE16\MSO.DLL#Microsoft Office 16.0 Object Library'),
    ]
    guid = str(uuid.uuid4())
    streams = {}
    streams[('PROJECT',)] = _project_stream(projektname, module, guid)
    streams[('PROJECTwm',)] = _projectwm_stream(module)
    streams[('VBA', '_VBA_PROJECT')] = b'\xCC\x61\xFF\xFF\x00\x00\x00'
    streams[('VBA', 'dir')] = ovba_komprimieren(_dir_stream(projektname, module, referenzen))   # dir ist klein (ein Chunk)
    for name, quelle, dokument in module:
        if dokument:
            guid = '00020820-0000-0000-C000-000000000046' if dokument == 'sheet' else '00020819-0000-0000-C000-000000000046'
            kopf = DOKUMENT_ATTRIBUTE.format(name=name, guid=guid)
        else:
            kopf = 'Attribute VB_Name = "%s"\r\n' % name
        text = auffuellen(kopf + quelle.replace('\r\n', '\n').replace('\n', '\r\n'))
        streams[('VBA', name)] = ovba_komprimieren(text.encode('cp1252'))
    return cfb_schreiben(streams)


# ------------------------------------------------------------------ OLE2 / CFB Writer
ENDOFCHAIN = 0xFFFFFFFE
FREESECT = 0xFFFFFFFF
FATSECT = 0xFFFFFFFD
NOSTREAM = 0xFFFFFFFF


def _cfb_vergleich(name: str):
    return (len(name), name.upper())


class _Eintrag:
    def __init__(self, name, typ):
        self.name, self.typ = name, typ
        self.kinder = {}
        self.daten = b''
        self.id = None
        self.links = self.rechts = self.kind = NOSTREAM
        self.start = ENDOFCHAIN
        self.groesse = 0


def _baum(eintraege):
    """Sortierte Geschwister als balancierter Binaerbaum; liefert die Wurzel-ID."""
    if not eintraege:
        return NOSTREAM
    eintraege = sorted(eintraege, key=lambda e: _cfb_vergleich(e.name))
    m = len(eintraege) // 2
    wurzel = eintraege[m]
    wurzel.links = _baum(eintraege[:m])
    wurzel.rechts = _baum(eintraege[m + 1:])
    return wurzel.id


def cfb_schreiben(streams: dict) -> bytes:
    wurzel = _Eintrag('Root Entry', 5)
    for pfad, daten in streams.items():
        knoten = wurzel
        for teil in pfad[:-1]:
            if teil not in knoten.kinder:
                knoten.kinder[teil] = _Eintrag(teil, 1)
            knoten = knoten.kinder[teil]
        e = _Eintrag(pfad[-1], 2)
        e.daten = daten
        knoten.kinder[pfad[-1]] = e
    # IDs vergeben (Root = 0), dann Baeume je Storage
    alle = []

    def sammeln(k):
        k.id = len(alle)
        alle.append(k)
        for kind in sorted(k.kinder.values(), key=lambda e: _cfb_vergleich(e.name)):
            sammeln(kind)
    sammeln(wurzel)
    for k in alle:
        if k.kinder:
            k.kind = _baum(list(k.kinder.values()))
    # Mini-Stream (Streams < 4096) und grosse Streams
    SEKTOR, MINI = 512, 64
    mini = bytearray()
    minifat = []
    gross = []                     # (eintrag, daten)
    for k in alle:
        if k.typ != 2:
            continue
        k.groesse = len(k.daten)
        if k.groesse == 0:
            k.start = ENDOFCHAIN
        elif k.groesse < 4096:
            anz = -(-k.groesse // MINI)
            k.start = len(minifat)
            for i in range(anz):
                minifat.append(len(minifat) + 1 if i < anz - 1 else ENDOFCHAIN)
            mini += k.daten + b'\x00' * (anz * MINI - k.groesse)
        else:
            gross.append(k)
    wurzel.groesse = len(mini)
    # Sektorplanung: [FAT][Verzeichnis][MiniFAT][Mini-Stream][grosse Streams]
    dir_bytes = len(alle) * 128
    n_dir = max(1, -(-dir_bytes // SEKTOR))
    n_minifat = -(-len(minifat) * 4 // SEKTOR) if minifat else 0
    n_mini = -(-len(mini) // SEKTOR) if mini else 0
    n_gross = [-(-k.groesse // SEKTOR) for k in gross]
    n_fat = 1
    while True:
        gesamt = n_fat + n_dir + n_minifat + n_mini + sum(n_gross)
        if -(-gesamt // 128) <= n_fat:
            break
        n_fat += 1
    fat = [FREESECT] * (n_fat * 128)
    sek = 0
    for i in range(n_fat):
        fat[sek] = FATSECT; sek += 1
    dir_start = sek
    for i in range(n_dir):
        fat[sek] = sek + 1 if i < n_dir - 1 else ENDOFCHAIN; sek += 1
    minifat_start = sek if n_minifat else ENDOFCHAIN
    for i in range(n_minifat):
        fat[sek] = sek + 1 if i < n_minifat - 1 else ENDOFCHAIN; sek += 1
    if n_mini:
        wurzel.start = sek
        for i in range(n_mini):
            fat[sek] = sek + 1 if i < n_mini - 1 else ENDOFCHAIN; sek += 1
    for k, n in zip(gross, n_gross):
        k.start = sek
        for i in range(n):
            fat[sek] = sek + 1 if i < n - 1 else ENDOFCHAIN; sek += 1
    # Kopf
    kopf = bytearray(SEKTOR)
    struct.pack_into('<8s16sHHHHH6sIIIIIIIII', kopf, 0, b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1', b'\x00' * 16,
                     0x003E, 0x0003, 0xFFFE, 9, 6, b'\x00' * 6,
                     0, n_fat, dir_start, 0, 4096, minifat_start, n_minifat, ENDOFCHAIN, 0)
    difat = [fat_i for fat_i in range(n_fat)] + [FREESECT] * (109 - n_fat)
    struct.pack_into('<109I', kopf, 76, *difat)
    # Verzeichnis
    verz = bytearray()
    for k in alle:
        name16 = k.name.encode('utf-16-le') + b'\x00\x00'
        e = bytearray(128)
        e[0:len(name16)] = name16
        struct.pack_into('<H', e, 64, len(name16))
        e[66] = k.typ
        e[67] = 1                                                  # schwarz
        struct.pack_into('<III', e, 68, k.links, k.rechts, k.kind)
        struct.pack_into('<II', e, 116, k.start if k.typ != 1 else 0, k.groesse if k.typ != 1 else 0)
        verz += e
    verz += b'\x00' * (n_dir * SEKTOR - len(verz))
    # Zusammensetzen
    aus = bytearray(kopf)
    for i in range(n_fat):
        aus += struct.pack('<128I', *fat[i * 128:(i + 1) * 128])
    aus += verz
    if n_minifat:
        mf = list(minifat) + [FREESECT] * (n_minifat * 128 - len(minifat))
        aus += struct.pack('<%dI' % len(mf), *mf)
    if n_mini:
        aus += mini + b'\x00' * (n_mini * SEKTOR - len(mini))
    for k, n in zip(gross, n_gross):
        aus += k.daten + b'\x00' * (n * SEKTOR - k.groesse)
    return bytes(aus)


if __name__ == '__main__':
    import sys
    test = vba_projekt([('ThisWorkbook', 'Option Explicit\r\n', True),
                        ('modTest', 'Option Explicit\r\nPublic Sub Hallo()\r\n    MsgBox "Hallo Welt äöü"\r\nEnd Sub\r\n', False)])
    open(sys.argv[1] if len(sys.argv) > 1 else 'vbaProject_test.bin', 'wb').write(test)
    print('geschrieben', len(test), 'Byte')
