# Liest eine xlsx/xlsm direkt aus dem XML (ohne openpyxl), damit nichts verloren geht:
# Zellen (Wert, Typ, Formel, Formelart, zwischengespeicherter Wert, Stil), Tabellen (ListObjects),
# Datenueberpruefungen (normal + x14-Erweiterung), bedingte Formate (normal + x14), verbundene Zellen,
# Hyperlinks, Kommentare (Notizen + verkettete Kommentare), definierte Namen, Blattansicht, Spalten,
# Zeilen, Druckeinstellungen, Stile.
# Von inventar.py und vergleich.py gemeinsam genutzt.
import re, zipfile, posixpath, html
from lxml import etree

NS = {
    'm': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'rel': 'http://schemas.openxmlformats.org/package/2006/relationships',
    'x14': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/main',
    'xm': 'http://schemas.microsoft.com/office/excel/2006/main',
    'tc': 'http://schemas.microsoft.com/office/spreadsheetml/2018/threadedcomments',
}
M = '{%s}' % NS['m']
R_ID = '{%s}id' % NS['r']


def spalte_nr(buchst):
    n = 0
    for ch in buchst:
        n = n * 26 + (ord(ch.upper()) - 64)
    return n


def spalte_buchst(n):
    s = ''
    while n:
        n, rest = divmod(n - 1, 26)
        s = chr(65 + rest) + s
    return s


def zelle_split(ref):
    m = re.match(r'^\$?([A-Za-z]+)\$?(\d+)$', ref)
    return int(m.group(2)), spalte_nr(m.group(1))


def bereich_split(ref):
    """'A1:C5' -> (r1, c1, r2, c2); 'A1' -> (r,c,r,c); 'A:A' / '1:1' werden auf Grenzen erweitert."""
    ref = ref.replace('$', '')
    teile = ref.split(':')
    if len(teile) == 1:
        r, c = zelle_split(teile[0])
        return r, c, r, c
    a, b = teile
    if re.match(r'^[A-Za-z]+$', a):
        return 1, spalte_nr(a), 1048576, spalte_nr(b)
    if re.match(r'^\d+$', a):
        return int(a), 1, int(b), 16384
    r1, c1 = zelle_split(a)
    r2, c2 = zelle_split(b)
    return min(r1, r2), min(c1, c2), max(r1, r2), max(c1, c2)


def sqref_zellen(sqref, max_zellen=200000):
    zellen = []
    for teil in sqref.split():
        r1, c1, r2, c2 = bereich_split(teil)
        if (r2 - r1 + 1) * (c2 - c1 + 1) > max_zellen:
            r2 = min(r2, r1 + 2000)
        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                zellen.append((r, c))
    return zellen


def adr(r, c):
    return '%s%d' % (spalte_buchst(c), r)


class Arbeitsmappe:
    def __init__(self, pfad):
        self.pfad = pfad
        self.z = zipfile.ZipFile(pfad)
        self.namen = set(self.z.namelist())
        self._lese_shared_strings()
        self._lese_stile()
        self._lese_workbook()
        self.blaetter = []  # Liste von dicts
        for b in self.blatt_defs:
            self.blaetter.append(self._lese_blatt(b))
        self.blatt_nach_name = {b['name']: b for b in self.blaetter}
        self.tabellen = {}
        for b in self.blaetter:
            for t in b['tabellen']:
                self.tabellen[t['name']] = t

    # ------------------------------------------------------------------ Hilfen
    def xml(self, name):
        return etree.fromstring(self.z.read(name))

    def rels(self, teil):
        d, f = posixpath.split(teil)
        rp = posixpath.join(d, '_rels', f + '.rels')
        erg = {}
        if rp in self.namen:
            for rel in self.xml(rp):
                ziel = rel.get('Target')
                if rel.get('TargetMode') != 'External':
                    ziel = posixpath.normpath(posixpath.join(d, ziel)) if not ziel.startswith('/') else ziel.lstrip('/')
                erg[rel.get('Id')] = {'typ': rel.get('Type').rsplit('/', 1)[-1], 'ziel': ziel,
                                      'extern': rel.get('TargetMode') == 'External'}
        return erg

    def _lese_shared_strings(self):
        self.sst = []
        if 'xl/sharedStrings.xml' in self.namen:
            for si in self.xml('xl/sharedStrings.xml').findall(M + 'si'):
                # Phonetik (rPh) nicht mitlesen
                teile = []
                for t in si.iter(M + 't'):
                    eltern = t.getparent()
                    if eltern.tag == M + 'rPh':
                        continue
                    teile.append(t.text or '')
                self.sst.append(''.join(teile))

    def _farbe(self, el):
        if el is None:
            return None
        d = {k: v for k, v in el.attrib.items()}
        return d or None

    def _lese_stile(self):
        self.xfs = []
        self.dxfs = []
        self.numfmts = {}
        if 'xl/styles.xml' not in self.namen:
            return
        st = self.xml('xl/styles.xml')
        nf = st.find(M + 'numFmts')
        if nf is not None:
            for n in nf:
                self.numfmts[int(n.get('numFmtId'))] = n.get('formatCode')
        fonts = []
        for f in st.find(M + 'fonts'):
            d = {}
            for k in f:
                tag = etree.QName(k).localname
                if tag in ('b', 'i', 'strike', 'u'):
                    d[tag] = k.get('val', '1')
                elif tag == 'color':
                    d['farbe'] = self._farbe(k)
                elif tag in ('sz', 'name', 'family', 'scheme', 'vertAlign'):
                    d[tag] = k.get('val')
            fonts.append(d)
        fills = []
        for f in st.find(M + 'fills'):
            d = {}
            pf = f.find(M + 'patternFill')
            if pf is not None:
                d['muster'] = pf.get('patternType')
                d['vorne'] = self._farbe(pf.find(M + 'fgColor'))
                d['hinten'] = self._farbe(pf.find(M + 'bgColor'))
            if f.find(M + 'gradientFill') is not None:
                d['verlauf'] = True
            fills.append(d)
        borders = []
        for b in st.find(M + 'borders'):
            d = {}
            for seite in ('left', 'right', 'top', 'bottom'):
                s = b.find(M + seite)
                if s is not None and s.get('style'):
                    d[seite] = {'stil': s.get('style'), 'farbe': self._farbe(s.find(M + 'color'))}
            borders.append(d)
        for xf in st.find(M + 'cellXfs'):
            nid = int(xf.get('numFmtId', '0'))
            d = {'numFmtId': nid, 'numFmt': self.numfmts.get(nid, BUILTIN_NUMFMT.get(nid)),
                 'font': fonts[int(xf.get('fontId', '0'))], 'fill': fills[int(xf.get('fillId', '0'))],
                 'border': borders[int(xf.get('borderId', '0'))]}
            al = xf.find(M + 'alignment')
            if al is not None:
                d['ausrichtung'] = dict(al.attrib)
            pr = xf.find(M + 'protection')
            if pr is not None:
                d['schutz'] = dict(pr.attrib)
            self.xfs.append(d)
        dx = st.find(M + 'dxfs')
        if dx is not None:
            for x in dx:
                d = {}
                f = x.find(M + 'font')
                if f is not None:
                    fd = {}
                    for k in f:
                        tag = etree.QName(k).localname
                        fd[tag] = self._farbe(k) if tag == 'color' else k.get('val', '1')
                    d['font'] = fd
                fl = x.find(M + 'fill')
                if fl is not None:
                    pf = fl.find(M + 'patternFill')
                    if pf is not None:
                        d['fill'] = {'muster': pf.get('patternType'), 'vorne': self._farbe(pf.find(M + 'fgColor')),
                                     'hinten': self._farbe(pf.find(M + 'bgColor'))}
                n = x.find(M + 'numFmt')
                if n is not None:
                    d['numFmt'] = n.get('formatCode')
                b = x.find(M + 'border')
                if b is not None and len(b):
                    d['border'] = True
                self.dxfs.append(d)

    def _lese_workbook(self):
        wb = self.xml('xl/workbook.xml')
        rels = self.rels('xl/workbook.xml')
        self.blatt_defs = []
        for i, s in enumerate(wb.find(M + 'sheets')):
            rid = s.get(R_ID)
            self.blatt_defs.append({'name': s.get('name'), 'sheetId': s.get('sheetId'),
                                    'zustand': s.get('state', 'visible'), 'teil': rels[rid]['ziel'], 'pos': i})
        self.definierte_namen = []
        dn = wb.find(M + 'definedNames')
        if dn is not None:
            for d in dn:
                self.definierte_namen.append({'name': d.get('name'), 'bezug': d.text,
                                              'localSheetId': d.get('localSheetId'), 'hidden': d.get('hidden')})
        bv = wb.find(M + 'bookViews')
        self.aktives_blatt = None
        if bv is not None and len(bv):
            self.aktives_blatt = int(bv[0].get('activeTab', '0'))
        cp = wb.find(M + 'calcPr')
        self.calc = dict(cp.attrib) if cp is not None else {}
        self.vba = any(n.lower().endswith('vbaproject.bin') for n in self.namen)

    # ------------------------------------------------------------------ Blatt
    def _lese_blatt(self, bdef):
        teil = bdef['teil']
        x = self.xml(teil)
        rels = self.rels(teil)
        b = dict(bdef)
        sp = x.find(M + 'sheetPr')
        b['registerfarbe'] = None
        b['fitToPage'] = False
        if sp is not None:
            tc = sp.find(M + 'tabColor')
            if tc is not None:
                b['registerfarbe'] = dict(tc.attrib)
            ps = sp.find(M + 'pageSetUpPr')
            if ps is not None:
                b['fitToPage'] = ps.get('fitToPage') == '1'
        dim = x.find(M + 'dimension')
        b['dimension'] = dim.get('ref') if dim is not None else None
        # Ansicht
        b['ansicht'] = {}
        sv = x.find(M + 'sheetViews')
        if sv is not None and len(sv):
            v = sv[0]
            a = {k: v.get(k) for k in ('showGridLines', 'zoomScale', 'zoomScaleNormal', 'tabSelected', 'topLeftCell',
                                        'showRowColHeaders', 'view') if v.get(k) is not None}
            pane = v.find(M + 'pane')
            if pane is not None:
                a['fixierung'] = dict(pane.attrib)
            a['auswahl'] = [dict(s.attrib) for s in v.findall(M + 'selection')]
            b['ansicht'] = a
        sf = x.find(M + 'sheetFormatPr')
        b['standard_zeilenhoehe'] = sf.get('defaultRowHeight') if sf is not None else None
        b['standard_spaltenbreite'] = sf.get('defaultColWidth') if sf is not None else None
        b['spalten'] = []
        cols = x.find(M + 'cols')
        if cols is not None:
            for c in cols:
                b['spalten'].append({'von': int(c.get('min')), 'bis': int(c.get('max')),
                                     'von_b': spalte_buchst(int(c.get('min'))), 'bis_b': spalte_buchst(int(c.get('max'))),
                                     'breite': float(c.get('width')) if c.get('width') else None,
                                     'customWidth': c.get('customWidth') == '1', 'hidden': c.get('hidden') == '1',
                                     'style': int(c.get('style')) if c.get('style') else None})
        # Zellen
        b['zeilen'] = []
        b['zellen'] = {}
        sd = x.find(M + 'sheetData')
        shared_formeln = {}
        for row in sd:
            rnr = int(row.get('r'))
            zi = {'r': rnr}
            for k in ('ht', 'customHeight', 'hidden', 's', 'customFormat', 'outlineLevel'):
                if row.get(k) is not None:
                    zi[k] = row.get(k)
            if len(zi) > 1:
                b['zeilen'].append(zi)
            for c in row.findall(M + 'c'):
                ref = c.get('r')
                t = c.get('t', 'n')
                s = int(c.get('s', '0'))
                v = c.find(M + 'v')
                f = c.find(M + 'f')
                isel = c.find(M + 'is')
                wert = None
                if t == 's' and v is not None:
                    wert = self.sst[int(v.text)]
                elif t == 'inlineStr' and isel is not None:
                    wert = ''.join(tt.text or '' for tt in isel.iter(M + 't'))
                elif t in ('str', 'e'):
                    wert = v.text if v is not None and v.text is not None else ('' if v is not None else None)
                elif t == 'b' and v is not None:
                    wert = v.text == '1'
                elif v is not None and v.text is not None:
                    try:
                        wert = float(v.text)
                        if wert.is_integer() and 'E' not in v.text.upper() and '.' not in v.text:
                            wert = int(wert)
                    except ValueError:
                        wert = v.text
                formel = None
                if f is not None:
                    fa = f.get('t', 'normal')
                    ftext = f.text
                    if fa == 'shared':
                        si = f.get('si')
                        if ftext:
                            shared_formeln[si] = (ref, ftext)
                        else:
                            # geteilte Formel: aus Mutterzelle uebersetzen
                            mref, mtext = shared_formeln.get(si, (None, None))
                            ftext = uebersetze(mtext, mref, ref) if mtext else None
                    formel = {'text': ftext, 'art': fa, 'ref': f.get('ref'), 'dynamisch': c.get('cm') is not None,
                              'aca': f.get('aca')}
                if wert is None and formel is None and s == 0:
                    continue
                b['zellen'][ref] = {'t': t, 'wert': wert, 'formel': formel, 's': s}
        # Verbundene Zellen
        mc = x.find(M + 'mergeCells')
        b['verbunden'] = [m.get('ref') for m in mc] if mc is not None else []
        # Hyperlinks
        b['hyperlinks'] = []
        hl = x.find(M + 'hyperlinks')
        if hl is not None:
            for h in hl:
                d = {'ref': h.get('ref'), 'display': h.get('display'), 'location': h.get('location'),
                     'tooltip': h.get('tooltip')}
                if h.get(R_ID):
                    d['ziel'] = rels[h.get(R_ID)]['ziel']
                b['hyperlinks'].append(d)
        # Bedingte Formate (normal)
        b['bed_formate'] = []
        for cf in x.findall(M + 'conditionalFormatting'):
            for rule in cf.findall(M + 'cfRule'):
                b['bed_formate'].append(self._cf_regel(cf.get('sqref'), rule, M, quelle='normal'))
        # Datenueberpruefungen (normal)
        b['datenpruefungen'] = []
        dvs = x.find(M + 'dataValidations')
        if dvs is not None:
            for dv in dvs:
                d = {k: dv.get(k) for k in ('type', 'operator', 'allowBlank', 'showInputMessage', 'showErrorMessage',
                                            'errorStyle', 'promptTitle', 'prompt', 'errorTitle', 'error',
                                            'showDropDown') if dv.get(k) is not None}
                d['sqref'] = dv.get('sqref')
                f1 = dv.find(M + 'formula1'); f2 = dv.find(M + 'formula2')
                d['formel1'] = f1.text if f1 is not None else None
                d['formel2'] = f2.text if f2 is not None else None
                d['quelle'] = 'normal'
                b['datenpruefungen'].append(d)
        # extLst: x14-Datenueberpruefungen und x14-bedingte Formate
        ext = x.find(M + 'extLst')
        b['ext_uris'] = []
        if ext is not None:
            for e in ext:
                b['ext_uris'].append(e.get('uri'))
                for dv in e.iter('{%s}dataValidation' % NS['x14']):
                    d = {k: dv.get(k) for k in ('type', 'operator', 'allowBlank', 'showInputMessage', 'showErrorMessage',
                                                'errorStyle', 'promptTitle', 'prompt', 'errorTitle', 'error',
                                                'showDropDown') if dv.get(k) is not None}
                    sq = dv.find('{%s}sqref' % NS['xm'])
                    d['sqref'] = sq.text if sq is not None else None
                    f1 = dv.find('{%s}formula1/{%s}f' % (NS['x14'], NS['xm']))
                    f2 = dv.find('{%s}formula2/{%s}f' % (NS['x14'], NS['xm']))
                    d['formel1'] = f1.text if f1 is not None else None
                    d['formel2'] = f2.text if f2 is not None else None
                    d['quelle'] = 'x14'
                    b['datenpruefungen'].append(d)
                for cf in e.iter('{%s}conditionalFormatting' % NS['x14']):
                    sq = cf.find('{%s}sqref' % NS['xm'])
                    for rule in cf.findall('{%s}cfRule' % NS['x14']):
                        b['bed_formate'].append(self._cf_regel(sq.text if sq is not None else '', rule, None, quelle='x14'))
        # Druck
        pm = x.find(M + 'pageMargins')
        b['seitenraender'] = dict(pm.attrib) if pm is not None else None
        ps = x.find(M + 'pageSetup')
        b['seite'] = {k: v for k, v in ps.attrib.items() if not k.startswith('{')} if ps is not None else None
        po = x.find(M + 'printOptions')
        b['druckoptionen'] = dict(po.attrib) if po is not None else None
        hf = x.find(M + 'headerFooter')
        b['kopf_fuss'] = etree.tostring(hf, encoding='unicode') if hf is not None else None
        pr = x.find(M + 'sheetProtection')
        b['blattschutz'] = dict(pr.attrib) if pr is not None else None
        b['phonetik'] = x.find(M + 'phoneticPr') is not None
        # Tabellen
        b['tabellen'] = []
        tp = x.find(M + 'tableParts')
        if tp is not None:
            for t in tp:
                b['tabellen'].append(self._lese_tabelle(rels[t.get(R_ID)]['ziel'], b))
        # Kommentare
        b['kommentare'] = []
        b['verkettete_kommentare'] = []
        b['zeichnungen'] = []
        for rid, rel in rels.items():
            if rel['typ'] == 'comments':
                cx = self.xml(rel['ziel'])
                autoren = [a.text for a in cx.find(M + 'authors')]
                for cm in cx.find(M + 'commentList'):
                    text = ''.join(t.text or '' for t in cm.iter(M + 't'))
                    b['kommentare'].append({'ref': cm.get('ref'), 'autor': autoren[int(cm.get('authorId'))],
                                            'text': text, 'text_norm': kommentar_norm(text)})
            elif rel['typ'] == 'threadedComment':
                tx = self.xml(rel['ziel'])
                for tcm in tx.findall('{%s}threadedComment' % NS['tc']):
                    te = tcm.find('{%s}text' % NS['tc'])
                    b['verkettete_kommentare'].append({'ref': tcm.get('ref'), 'datum': tcm.get('dT'),
                                                       'personId': tcm.get('personId'), 'id': tcm.get('id'),
                                                       'parentId': tcm.get('parentId'),
                                                       'text': te.text if te is not None else ''})
            elif rel['typ'] in ('drawing', 'vmlDrawing'):
                b['zeichnungen'].append({'typ': rel['typ'], 'ziel': rel['ziel']})
        return b

    def _cf_regel(self, sqref, rule, ns, quelle):
        d = {'sqref': sqref, 'typ': rule.get('type'), 'operator': rule.get('operator'),
             'prioritaet': int(rule.get('priority')) if rule.get('priority') else None,
             'stopIfTrue': rule.get('stopIfTrue'), 'text': rule.get('text'), 'quelle': quelle,
             'dxfId': int(rule.get('dxfId')) if rule.get('dxfId') is not None else None}
        if quelle == 'normal':
            d['formeln'] = [f.text for f in rule.findall(M + 'formula')]
        else:
            d['formeln'] = [f.text for f in rule.iter('{%s}f' % NS['xm'])]
        d['format'] = self.dxfs[d['dxfId']] if d['dxfId'] is not None and d['dxfId'] < len(self.dxfs) else None
        rest = [etree.QName(k).localname for k in rule if etree.QName(k).localname not in ('formula', 'f')]
        if rest:
            d['weitere'] = etree.tostring(rule, encoding='unicode')
        return d

    def _lese_tabelle(self, teil, blatt):
        x = self.xml(teil)
        t = {'teil': teil, 'blatt': blatt['name'], 'name': x.get('name'), 'displayName': x.get('displayName'),
             'id': x.get('id'), 'ref': x.get('ref'), 'headerRowCount': int(x.get('headerRowCount', '1')),
             'totalsRowCount': int(x.get('totalsRowCount', '0')), 'totalsRowShown': x.get('totalsRowShown'),
             'autofilter': x.find(M + 'autoFilter') is not None}
        si = x.find(M + 'tableStyleInfo')
        t['stil'] = dict(si.attrib) if si is not None else None
        t['spalten'] = []
        for tc in x.find(M + 'tableColumns'):
            ccf = tc.find(M + 'calculatedColumnFormula')
            trf = tc.find(M + 'totalsRowFormula')
            t['spalten'].append({'id': tc.get('id'), 'name': tc.get('name'),
                                 'berechnet': ccf.text if ccf is not None else None,
                                 'berechnet_array': ccf is not None and ccf.get('array') == '1',
                                 'totalsRowFunction': tc.get('totalsRowFunction'),
                                 'totalsRowLabel': tc.get('totalsRowLabel'),
                                 'totalsRowFormula': trf.text if trf is not None else None})
        r1, c1, r2, c2 = bereich_split(t['ref'])
        t['r1'], t['c1'], t['r2'], t['c2'] = r1, c1, r2, c2
        t['datenzeilen'] = r2 - r1 + 1 - t['headerRowCount'] - t['totalsRowCount']
        return t


def kommentar_norm(text):
    """Entfernt den Hinweis-Vorspann, den Excel bei verketteten Kommentaren als Notiz-Ersatz schreibt."""
    if text is None:
        return ''
    m = re.search(r'\[Threaded comment\].*?Comment:\s*\n\s*(.*)$', text, re.S)
    if m:
        text = m.group(1)
    text = re.sub(r'\n\s*Reply:\s*', '\n', text)
    return text.strip()


BUILTIN_NUMFMT = {0: 'General', 1: '0', 2: '0.00', 3: '#,##0', 4: '#,##0.00', 9: '0%', 10: '0.00%', 11: '0.00E+00',
                  12: '# ?/?', 13: '# ??/??', 14: 'mm-dd-yy', 15: 'd-mmm-yy', 16: 'd-mmm', 17: 'mmm-yy',
                  18: 'h:mm AM/PM', 19: 'h:mm:ss AM/PM', 20: 'h:mm', 21: 'h:mm:ss', 22: 'm/d/yy h:mm', 37: '#,##0 ;(#,##0)',
                  38: '#,##0 ;[Red](#,##0)', 39: '#,##0.00;(#,##0.00)', 40: '#,##0.00;[Red](#,##0.00)', 45: 'mm:ss',
                  46: '[h]:mm:ss', 47: 'mmss.0', 48: '##0.0E+0', 49: '@'}


# ---------------------------------------------------------------------- Formeln
_STR = re.compile(r'"(?:[^"]|"")*"')
_REF = re.compile(r"(?<![A-Za-z0-9_.\[\]!'])(\$?)([A-Z]{1,3})(\$?)(\d{1,7})(?![A-Za-z0-9_(\[])")


def _teile(formel):
    """Zerlegt in (ist_string, text)-Stuecke, damit Zeichenketten und [..]-Spaltenbezuege unangetastet bleiben."""
    stuecke = []
    i = 0
    tiefe = 0
    puffer = ''
    while i < len(formel):
        ch = formel[i]
        if ch == '"' and tiefe == 0:
            if puffer:
                stuecke.append((False, puffer)); puffer = ''
            m = _STR.match(formel, i)
            stuecke.append((True, m.group(0)))
            i = m.end()
            continue
        if ch == "'" and tiefe == 0:
            # Blattname in Hochkommas
            j = i + 1
            while j < len(formel):
                if formel[j] == "'" and j + 1 < len(formel) and formel[j + 1] == "'":
                    j += 2; continue
                if formel[j] == "'":
                    break
                j += 1
            if puffer:
                stuecke.append((False, puffer)); puffer = ''
            stuecke.append((True, formel[i:j + 1]))
            i = j + 1
            continue
        if ch == '[':
            if tiefe == 0 and puffer:
                stuecke.append((False, puffer)); puffer = ''
            tiefe += 1
            puffer += ch
        elif ch == ']':
            tiefe -= 1
            puffer += ch
            if tiefe == 0:
                stuecke.append((True, puffer)); puffer = ''
        else:
            puffer += ch
        i += 1
    if puffer:
        stuecke.append((tiefe != 0, puffer))
    return stuecke


def uebersetze(formel, von, nach):
    """Verschiebt relative A1-Bezuege einer Formel von Zelle 'von' nach Zelle 'nach' (wie Kopieren)."""
    if formel is None:
        return None
    r0, c0 = zelle_split(von)
    r1, c1 = zelle_split(nach)
    dr, dc = r1 - r0, c1 - c0
    aus = []
    for ist_fest, text in _teile(formel):
        if ist_fest:
            aus.append(text); continue

        def rep(m):
            sc, col, sr, row = m.groups()
            cn = spalte_nr(col) + (0 if sc else dc)
            rn = int(row) + (0 if sr else dr)
            return '%s%s%s%d' % (sc, spalte_buchst(max(cn, 1)), sr, max(rn, 1))
        aus.append(_REF.sub(rep, text))
    return ''.join(aus)


def relativ_zu(formel, zelle):
    """Schreibt jeden A1-Bezug als Abstand zur Zelle (R[dr]C[dc]), $ wird ignoriert.
    So sind Formeln bedingter Formate vergleichbar, auch wenn die Tabelle verschoben wurde."""
    if formel is None:
        return None
    r0, c0 = zelle_split(zelle)
    aus = []
    for ist_fest, text in _teile(formel):
        if ist_fest:
            aus.append(text); continue

        def rep(m):
            sc, col, sr, row = m.groups()
            return 'R[%d]C[%d]' % (int(row) - r0, spalte_nr(col) - c0)
        aus.append(_REF.sub(rep, text))
    return ''.join(aus)


def formel_norm(formel):
    """Normalisiert eine Formel fuer den Vergleich: fuehrendes =, Leerraum ausserhalb von Zeichenketten,
    Grossschreibung von Funktionsnamen. Praefixe (_xlfn., _xlpm., _xlws.) bleiben erhalten, weil ihr
    Fehlen in Excel zu #NAME? fuehrt."""
    if formel is None:
        return None
    f = formel.strip()
    if f.startswith('='):
        f = f[1:]
    aus = []
    for ist_fest, text in _teile(f):
        if ist_fest:
            if text.startswith('['):
                # Spaltenbezug: Leerraum nach Kommas egal; #This Row Schreibweise vereinheitlichen
                text = re.sub(r',\s+', ',', text)
                text = text.replace('[#this row]', '[#This Row]')
            aus.append(text)
        else:
            text = re.sub(r'\s+', '', text)
            aus.append(text.upper())
    return ''.join(aus)


def strukturbezuege(formel):
    """Liefert die in einer Formel benutzten Tabellen und Tabellenspalten."""
    if not formel:
        return []
    erg = set()
    f = _STR.sub('""', formel)
    for m in re.finditer(r'(tbl[A-Za-z0-9_]+)\[(\[[^\]]*\](?:,\[[^\]]*\])*|[^\[\]]*)\]', f):
        tab = m.group(1)
        inhalt = m.group(2)
        spalten = re.findall(r'\[([^\]]*)\]', inhalt) if inhalt.startswith('[') else [inhalt]
        spalten = [s for s in spalten if not s.startswith('#')]
        if not spalten:
            erg.add((tab, None))
        for s in spalten:
            erg.add((tab, s))
    return sorted(erg, key=lambda x: (x[0], x[1] or ''))


def blattbezuege(formel):
    if not formel:
        return []
    f = _STR.sub('""', formel)
    return sorted(set(m.group(1) or m.group(2) for m in re.finditer(r"(?:'((?:[^']|'')+)'|([A-Za-z0-9_.]+))!", f)))


def funktionen(formel):
    if not formel:
        return []
    f = _STR.sub('""', formel)
    return sorted(set(m.group(1) for m in re.finditer(r'((?:_xlfn\.|_xlws\.)*[A-Z][A-Z0-9.]*)\(', f)))
