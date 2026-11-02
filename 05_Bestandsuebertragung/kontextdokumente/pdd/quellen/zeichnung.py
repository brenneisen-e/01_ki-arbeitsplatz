# -*- coding: utf-8 -*-
"""Editierbares Ablaufdiagramm (Word-Formen mit Verbindern) fuer das PDD Gesundheit/KV."""
from xml.sax.saxutils import escape
EMU = 360000  # je cm
NS = ('xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
      'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
      'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" '
      'xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"')
FARBEN = {'proc': ('DCE6F2', '4F81BD'), 'dec': ('FFF2CC', 'BF9000'), 'be': ('F8D7D7', 'C0504D'),
          'end': ('E2EFDA', '70AD47'), 'src': ('EDEDED', '7F7F7F')}
_id = [10]
def nid():
    _id[0] += 1; return _id[0]
def e(v): return str(int(round(v * EMU)))

def absatz(text, bold=False, sz=15, jc='center', color=None):
    runs = ''
    for k, zeile in enumerate(text.split('\n')):
        fett = '<w:b/>' if (bold and k == 0) else ''
        farbe = '<w:color w:val="%s"/>' % color if color else ''
        rpr = '<w:rPr>%s%s<w:sz w:val="%d"/><w:szCs w:val="%d"/></w:rPr>' % (fett, farbe, sz, sz)
        if k: runs += f'<w:r>{rpr}<w:br/></w:r>'
        runs += f'<w:r>{rpr}<w:t xml:space="preserve">{escape(zeile)}</w:t></w:r>'
    return f'<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="{jc}"/></w:pPr>{runs}</w:p>'

def form(name, x, y, w, h, text, art, prst='roundRect', sz=15, bold=True, jc='center', rand=True):
    fill, line = FARBEN[art] if art else (None, None)
    fx = f'<a:solidFill><a:srgbClr val="{fill}"/></a:solidFill>' if fill else '<a:noFill/>'
    ln = f'<a:ln w="12700"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill></a:ln>' if (fill and rand) else '<a:ln><a:noFill/></a:ln>'
    return (f'<wps:wsp><wps:cNvPr id="{nid()}" name="{escape(name)}"/><wps:cNvSpPr/>'
            f'<wps:spPr><a:xfrm><a:off x="{e(x)}" y="{e(y)}"/><a:ext cx="{e(w)}" cy="{e(h)}"/></a:xfrm>'
            f'<a:prstGeom prst="{prst}"><a:avLst/></a:prstGeom>{fx}{ln}</wps:spPr>'
            f'<wps:txbx><w:txbxContent>{absatz(text, bold, sz, jc, None if fill else "595959")}</w:txbxContent></wps:txbx>'
            f'<wps:bodyPr rot="0" vert="horz" wrap="square" lIns="36000" tIns="18000" rIns="36000" bIns="18000" anchor="ctr" anchorCtr="0"><a:noAutofit/></wps:bodyPr></wps:wsp>')

def pfeil(name, x1, y1, x2, y2):
    x, y, w, h = min(x1, x2), min(y1, y2), abs(x2 - x1), abs(y2 - y1)
    flip = ('' if x2 >= x1 else ' flipH="1"') + ('' if y2 >= y1 else ' flipV="1"')
    return (f'<wps:wsp><wps:cNvPr id="{nid()}" name="{escape(name)}"/><wps:cNvCnPr/>'
            f'<wps:spPr><a:xfrm{flip}><a:off x="{e(x)}" y="{e(y)}"/><a:ext cx="{e(w)}" cy="{e(h)}"/></a:xfrm>'
            f'<a:prstGeom prst="straightConnector1"><a:avLst/></a:prstGeom>'
            f'<a:ln w="15875"><a:solidFill><a:srgbClr val="404040"/></a:solidFill><a:tailEnd type="triangle" w="med" len="med"/></a:ln></wps:spPr>'
            f'<wps:bodyPr/></wps:wsp>')

def ablaufdiagramm():
    B, H, G = 32.0, 11.4, 0.9              # Breite, Hoehe, Luecke
    NW, NH, NY = 3.6, 2.6, 3.3             # Knoten
    X = [0.7 + i * (NW + G) for i in range(7)]
    cx = lambda i: X[i] + NW / 2
    s = [form('Titel', 0, 0, B, 0.7, 'Ablaufdiagramm Prüf-Bot Bestandsübertragung – Gesundheit / KV (Ausbaustufe 1)', None, 'rect', sz=20, jc='left', rand=False)]
    # Quellen
    s.append(form('Datenpool', X[1], 1.0, NW, 1.5, 'Datenpool\n35 Felder BUE_… je Vorgang, befüllt durch Celonis bei der Eröffnung', 'src', 'rect', sz=13))
    s.append(form('Ausschlusskriterien', X[2], 1.0, NW, 1.5, 'Ausschlusskriterien\nKein BÜ-Vorgang · BÜ-Wunsch fehlt · Reminder · VNR nicht ermittelbar · Makler: Unterlagen unvollständig · MFA: Betreuungswunsch nicht auf MFA, Unterschrift VN fehlt', 'src', 'rect', sz=11))
    s.append(form('Hostanwendungen', X[3], 1.0, 2 * NW + G, 1.5, 'Hostanwendungen\nVA230 · IS100 · OB726 · GH040 · EOS', 'src', 'rect', sz=13))
    # Hauptfluss
    s.append(form('Start', X[0], NY, NW, NH, 'Start\nEröffnung des Postkorbvorgangs im Themenpostkorb Prüf-Bot Gesundheit', 'end', sz=14))
    s.append(form('Vorgangsdaten lesen', X[1], NY, NW, NH, 'Vorgangsdaten lesen\nVorgang-VNR aus dem Postkorbvorgang, Felder BUE_… aus dem Datenpool', 'proc', sz=14))
    s.append(form('Entscheidung Ausschluss', X[2], NY, NW, NH, 'Ausschluss-\nkriterium erfüllt?', 'dec', 'flowChartDecision', sz=14))
    s.append(form('I. VN', X[3], NY, NW, NH, 'I. VN – Stammdaten + VNR\nVNR-Prüfung VA230 (harte BE) · Name, Geburtsdatum, Adresse IS100 (Prüfnotizen)', 'proc', sz=13))
    s.append(form('II. Makler', X[4], NY, NW, NH, 'II. Übernehmender Makler\nAgentur / PNR OB726 · Anbindung GH040 · Stammagentur EOS · Bestandsinhaber', 'proc', sz=13))
    s.append(form('Entscheidung Fehlerliste', X[5], NY, NW, NH, 'Fehlerliste gefüllt\noder Umfang „Gesamt“?', 'dec', 'flowChartDecision', sz=14))
    s.append(form('Ende', X[6], NY, NW, NH, 'Ende\nNotiz BOT2011 bestücken, Weiterleitung an den 72-Stunden-BOT', 'end', sz=14))
    # BE-Handling
    BY, BH = 7.6, 2.0
    s.append(form('BE-Handling', X[2], BY, X[5] + NW - X[2], BH,
                  'BE-Handling (zentral)\nBearbeitungshinweis mit BE-Klassifikation, den Prüfnotizen der Fehlerliste und den weiteren im Auftrag genannten VNR · Weiterleitung an den Themenpostkorb HSB4K MV · weiter mit dem nächsten Vorgang', 'be', sz=14))
    # Pfeile: Quellen -> Knoten
    for i in (1, 2): s.append(pfeil('Quelle', cx(i), 2.5, cx(i), NY))
    s.append(pfeil('Quelle', X[3] + (2 * NW + G) / 2, 2.5, X[3] + (2 * NW + G) / 2, NY))
    # Hauptfluss
    for i in range(6): s.append(pfeil('Fluss', X[i] + NW, NY + NH / 2, X[i + 1], NY + NH / 2))
    s.append(form('Label nein', X[2] + NW, NY + NH / 2 - 0.55, G, 0.5, 'nein', None, 'rect', sz=13, bold=False))
    s.append(form('Label leer', X[5] + NW, NY + NH / 2 - 0.55, G, 0.5, 'nein', None, 'rect', sz=13, bold=False))
    # BE-Pfeile nach unten
    for i, lab in ((2, 'ja'), (3, 'harte BE'), (4, 'harte BE'), (5, 'ja')):
        s.append(pfeil('BE', cx(i), NY + NH, cx(i), BY))
        s.append(form('Label ' + lab, cx(i) + 0.1, NY + NH + 0.25, 1.7, 0.5, lab, None, 'rect', sz=12, bold=False, jc='left'))
    # Legende
    LY, LH, LW = 10.3, 0.8, 3.0
    for k, (t, art, prst) in enumerate((('Datenquelle', 'src', 'rect'), ('Verarbeitung', 'proc', 'roundRect'), ('Entscheidung', 'dec', 'flowChartDecision'),
                                        ('Business Exception', 'be', 'roundRect'), ('Start / Ende', 'end', 'roundRect'))):
        s.append(form('Legende ' + t, 0.7 + k * (LW + 0.4), LY, LW, LH, t, art, prst, sz=12, bold=False))
    s.append(form('Legende Text', 18.0, LY, 13.3, LH, 'Harte BE: sofortiger Ausstieg in das BE-Handling. Weiche BE: Prüfnotiz in der Fehlerliste, die Prüfung läuft weiter; Test am Ende.', None, 'rect', sz=12, bold=False, jc='left'))
    grp = ''.join(s)
    return (f'<w:drawing {NS}><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{e(B)}" cy="{e(H)}"/>'
            f'<wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="9001" name="Ablaufdiagramm Prüf-Bot Gesundheit KV"/>'
            f'<wp:cNvGraphicFramePr/><a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup">'
            f'<wpg:wgp><wpg:cNvGrpSpPr/><wpg:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{e(B)}" cy="{e(H)}"/>'
            f'<a:chOff x="0" y="0"/><a:chExt cx="{e(B)}" cy="{e(H)}"/></a:xfrm></wpg:grpSpPr>{grp}</wpg:wgp>'
            f'</a:graphicData></a:graphic></wp:inline></w:drawing>')
