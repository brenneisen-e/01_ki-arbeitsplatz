# -*- coding: utf-8 -*-
"""Bewertungsmatrix Kundenpruefung ueber IS011 – Folien im ERGO-Master."""
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn

SRC='20260916_Abstimmung_Budget_2027_Celonis_Vorlage.pptx'; OUT='../20260921_Kundenpruefung_IS011_Bewertungsmatrix.pptx'  # Aufruf aus pdd/quellen/
ROT=RGBColor(0xBF,0x15,0x28); ROTL=RGBColor(0xFB,0xEA,0xEC)
TEAL=RGBColor(0x0F,0x94,0xA7); TEALD=RGBColor(0x0B,0x6F,0x7D); TEALL=RGBColor(0xCC,0xEB,0xED); TEALT=RGBColor(0xE7,0xF4,0xF6)
GRUEN=RGBColor(0x1F,0x7A,0x3D); GRUENL=RGBColor(0xE8,0xF3,0xEB)
GELB=RGBColor(0xA9,0x66,0x0A); GELBL=RGBColor(0xFC,0xF2,0xE4)
GRAU=RGBColor(0x5E,0x63,0x66); GRAUM=RGBColor(0x8A,0x90,0x95); GRAUL=RGBColor(0xF2,0xF2,0xF2); SW=RGBColor(0x15,0x18,0x1A); WEISS=RGBColor(0xFF,0xFF,0xFF)
F='Arial'

prs=Presentation(SRC)
LAY={l.name:l for l in prs.slide_layouts}
for sh in prs.slide_master.shapes:
    if sh.has_text_frame and 'Zwischenbericht' in sh.text_frame.text:
        sh.width=Inches(7.5)
        for para in sh.text_frame.paragraphs:
            for i,r in enumerate(para.runs):
                r.text='ERGO | Makler BÜ meets KI – Kundenprüfung über IS011 (Vorschlag) - 21.09.2026' if i==0 else ''
sldIdLst=prs.slides._sldIdLst
for sldId in list(sldIdLst)[1:]:
    prs.part.drop_rel(sldId.rId); sldIdLst.remove(sldId)
for sh in prs.slides[0].shapes:
    if sh.has_text_frame and sh.text_frame.text.startswith('Makler BÜ meets KI'):
        r=sh.text_frame.paragraphs[0].runs[0]; r.text='Makler BÜ meets KI | Kundenprüfung über IS011 – Vorschlag zur Bestätigung'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text=''
    if sh.has_text_frame and sh.text_frame.text.strip()=='Budgetplanung 26/27':
        r=sh.text_frame.paragraphs[0].runs[0]; r.text='Bewertungsmatrix Kunde'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text=''
    if sh.has_text_frame and sh.text_frame.text.strip().startswith('17. September'):
        r=sh.text_frame.paragraphs[0].runs[0]; r.text='21. September 2026'
        for x in sh.text_frame.paragraphs[0].runs[1:]: x.text=''

def rect(s,x,y,w,h,fill,line=None,shape=MSO_SHAPE.RECTANGLE,lw=1.0):
    o=s.shapes.add_shape(shape,Inches(x),Inches(y),Inches(w),Inches(h))
    if fill is None: o.fill.background()
    else: o.fill.solid(); o.fill.fore_color.rgb=fill
    if line is None: o.line.fill.background()
    else: o.line.color.rgb=line; o.line.width=Pt(lw)
    o.shadow.inherit=False; o.text_frame.text=''
    return o

def runs_in(tf,paras,align=PP_ALIGN.LEFT,anchor=MSO_ANCHOR.TOP,space_after=1):
    tf.word_wrap=True; tf.vertical_anchor=anchor
    for i,para in enumerate(paras):
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph()
        p.alignment=align; p.space_after=Pt(space_after)
        for t,size,bold,color,italic in para:
            r=p.add_run(); r.text=t; r.font.size=Pt(size); r.font.bold=bold; r.font.name=F; r.font.color.rgb=color; r.font.italic=italic

def text(s,x,y,w,h,content,size=11,bold=False,color=SW,align=PP_ALIGN.LEFT,anchor=MSO_ANCHOR.TOP,bullets=False,space_after=4,italic=False):
    tb=s.shapes.add_textbox(Inches(x),Inches(y),Inches(w),Inches(h))
    tf=tb.text_frame; tf.word_wrap=True; tf.vertical_anchor=anchor
    tf.margin_left=tf.margin_right=tf.margin_top=tf.margin_bottom=0
    paras=content if isinstance(content,list) else [content]
    for i,para in enumerate(paras):
        p=tf.paragraphs[0] if i==0 else tf.add_paragraph()
        p.alignment=align; p.space_after=Pt(space_after)
        runs=para if isinstance(para,list) else [(para,bold)]
        if bullets:
            pPr=p._p.get_or_add_pPr(); pPr.set('marL',str(Inches(0.18))); pPr.set('indent',str(-Inches(0.18)))
            pPr.append(pPr.makeelement(qn('a:buChar'),{'char':'•'}))
        for t,b in runs:
            r=p.add_run(); r.text=t; r.font.size=Pt(size); r.font.bold=b; r.font.name=F; r.font.color.rgb=color; r.font.italic=italic
    return tb

def line(s,x1,y1,x2,y2,color=GRAU,width=1.0,arrow=False):
    c=s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,Inches(x1),Inches(y1),Inches(x2),Inches(y2))
    c.line.color.rgb=color; c.line.width=Pt(width)
    if arrow:
        ln=c.line._get_or_add_ln(); ln.append(ln.makeelement(qn('a:tailEnd'),{'type':'triangle','w':'med','len':'med'}))
    return c

def abschnitt(s,x,y,w,t):
    rect(s,x,y+0.03,0.31,0.31,TEALL)
    text(s,x+0.28,y,w,0.32,t,size=15,bold=True,anchor=MSO_ANCHOR.MIDDLE)
    line(s,x+0.08,y+0.3,x+w,y+0.3,TEAL,1)

def table(s,x,y,colw,rows,rowh=0.3,size=9,kopf=ROT):
    shp=s.shapes.add_table(len(rows),len(colw),Inches(x),Inches(y),Inches(sum(colw)),Inches(rowh*len(rows)))
    t=shp.table; t.first_row=False; t.horz_banding=False
    for j,w in enumerate(colw): t.columns[j].width=Inches(w)
    for i,row in enumerate(rows):
        t.rows[i].height=Inches(rowh)
        for j,cell in enumerate(row):
            tx,o=(cell if isinstance(cell,tuple) else (cell,{}))
            c=t.cell(i,j); c.margin_left=c.margin_right=Inches(0.06); c.margin_top=c.margin_bottom=Inches(0.03)
            c.vertical_anchor=MSO_ANCHOR.MIDDLE
            c.fill.solid(); c.fill.fore_color.rgb=o.get('fill', kopf if i==0 else WEISS)
            p=c.text_frame.paragraphs[0]; p.alignment=o.get('align',PP_ALIGN.CENTER if i>0 and j<5 else PP_ALIGN.LEFT)
            r=p.add_run(); r.text=tx or ' '; r.font.size=Pt(o.get('size',size)); r.font.name=F
            r.font.bold=o.get('bold', i==0); r.font.color.rgb=o.get('color', WEISS if i==0 else SW)
            p._p.append(p._p.makeelement(qn('a:endParaRPr'),{'sz':str(int(o.get('size',size)*100))}))
            c.text_frame.word_wrap=True
    return shp

def folie(layout,titel,kicker,tsize=18,tw=None):
    s=prs.slides.add_slide(LAY[layout])
    for ph in s.placeholders:
        if ph.placeholder_format.idx==0:
            if tw: ph.left=Inches(0.56); ph.top=Inches(0.52); ph.width=Inches(tw); ph.height=Inches(0.79)
            ph.text_frame.text=titel
            for p in ph.text_frame.paragraphs:
                for r in p.runs: r.font.size=Pt(tsize)
        elif ph.placeholder_format.idx==12:
            ph.text_frame.text=kicker
    return s

JA=lambda: ('passt',{'fill':GRUENL,'color':GRUEN,'bold':True,'size':9})
NE=lambda: ('abw.',{'fill':ROTL,'color':ROT,'bold':True,'size':9})
FE=lambda: ('fehlt',{'fill':GELBL,'color':GELB,'bold':True,'size':9})
EG=lambda: ('egal',{'fill':GRAUL,'color':GRAUM,'bold':False,'size':9})
LE=lambda t: (t,{'align':PP_ALIGN.LEFT,'size':9,'color':GRAU})
OK=lambda t: (t,{'align':PP_ALIGN.LEFT,'size':9,'bold':True,'color':GRUEN,'fill':GRUENL})
PN=lambda t: (t,{'align':PP_ALIGN.LEFT,'size':9,'bold':True,'color':GELB,'fill':GELBL})
BE=lambda t: (t,{'align':PP_ALIGN.LEFT,'size':9,'bold':True,'color':ROT,'fill':ROTL})

# ============================================== Folie 2: Kernbotschaft
s=folie('Only Title','Vorschlag: Die Identität des Kunden wird über eine Partnersuche in IS011 festgestellt – die Stammdaten entscheiden danach nur noch in der Kombination','KUNDENPRÜFUNG | KERNBOTSCHAFT',tsize=17)
kach=[('Heute in der PDD','5 Einzelvergleiche','Nachname, Vorname, Geburtsdatum, Straße und PLZ werden in IS100 zeichengenau verglichen. Jede Abweichung ist eine eigene Prüfnotiz — auch ein Umzug oder ein Rufname.',SW),
      ('Vorschlag','1 Suche und 1 Matrix','Partnersuche in IS011, Abgleich der Versicherungsnummer über die Kundennummer, danach Bewertung der Stammdaten in der Summe.',TEALD),
      ('Was dadurch entfällt','5 Prüfnotizen','Dazu der Aufruf des Scout-Service und die Normalisierungsregeln für die Straße („Straße“ zu „Str.“).',ROT)]
for i,(t,z,u,c) in enumerate(kach):
    x=0.56+i*4.1
    rect(s,x,1.6,3.9,1.75,GRAUL)
    text(s,x+0.22,1.72,3.4,0.28,t,size=10,color=GRAU)
    text(s,x+0.22,2.0,3.4,0.5,z,size=21,bold=True,color=c)
    text(s,x+0.22,2.55,3.45,0.75,u,size=9.5)
rect(s,0.56,3.6,12.2,1.35,TEALD)
text(s,0.8,3.7,3,0.28,'Der Kern des Vorschlags',size=10,bold=True,color=WEISS)
text(s,0.8,3.98,11.7,0.9,[[('Der Vertrag gehört zum Kunden, wenn eine Kundennummer mit dem Status „VN“ die Versicherungsnummer des Vorgangs führt. ',True),('Das ist der eigentliche Identitätsnachweis. Die Stammdaten dienen danach nur noch als Gegenprobe gegen den Fall „richtige Versicherungsnummer, falsche Person“ — bewertet in der Kombination statt Feld für Feld. Mehrfachtreffer sind unkritisch: Alle Kundennummern mit Status „VN“ werden geprüft.',False)]],size=12,color=WEISS)
abschnitt(s,0.56,5.15,4.0,'Warum das vorgeschlagen wird')
text(s,0.56,5.62,12.2,1.0,['Ein Zeichen Unterschied in der Straße erzeugt heute eine Prüfnotiz und am Ende eine Business Exception, obwohl es erkennbar derselbe Kunde ist.',
 'Umzüge, Rufnamen und Schreibweisen sind der Normalfall, nicht die Ausnahme — die Regel trifft also viele Vorgänge ohne fachlichen Grund.',
 'Die Suche über mehrere Merkmale zugleich beantwortet die fachliche Frage direkt: Gehört dieser Vertrag zu diesem Kunden?'],size=11,bullets=True,space_after=5)

# ============================================== Folie 3: Ablauf
s=folie('Only Title','So läuft die Prüfung des Kunden in fünf Teilschritten','KUNDENPRÜFUNG | ABLAUF IN SCHRITT 3',tsize=18)
schritte=[('1','Partner in IS011 suchen','Vorname, Nachname, Geburtsdatum, PLZ und die ersten zwei Buchstaben der Straße','kein Treffer: Abbruch'),
          ('2','Alle Treffer mit Status „VN“ übernehmen','Mehrfachtreffer sind unkritisch, jede Kundennummer wird weiterverfolgt','—'),
          ('3','Je Kundennummer die Versicherungsnummern abrufen','über eine Schnittstelle, die noch zu benennen ist','—'),
          ('4','Vorgangs-VNR unter den Treffern suchen','Führt eine Kundennummer die Nummer des Vorgangs, ist der Kunde bestätigt','keine passt: Abbruch'),
          ('5','Stammdaten und Vollmachtgeber bewerten','Bewertungsmatrix auf der nächsten Folie, dazu der Name auf der Maklervollmacht','je nach Matrix')]
bw=2.3; gap=0.16
for i,(n,t,d,a) in enumerate(schritte):
    x=0.56+i*(bw+gap)
    rect(s,x,1.6,bw,2.15,TEALT)
    kr=rect(s,x+0.18,1.78,0.38,0.38,TEALD,None,MSO_SHAPE.OVAL)
    runs_in(kr.text_frame,[[(n,11,True,WEISS,False)]],align=PP_ALIGN.CENTER,anchor=MSO_ANCHOR.MIDDLE)
    text(s,x+0.18,2.24,bw-0.36,0.6,t,size=10.5,bold=True,color=TEALD)
    text(s,x+0.18,2.84,bw-0.36,0.72,d,size=9,color=GRAU)
    if a!='—': text(s,x+0.18,3.45,bw-0.36,0.22,a,size=8.5,bold=True,color=ROT)
    if i<4: line(s,x+bw,2.67,x+bw+gap,2.67,GRAUM,1.25,arrow=True)
abschnitt(s,0.56,4.15,4.5,'Was sich gegenüber der PDD ändert')
rows=[[('Heute in der PDD',{}),('Vorschlag',{})],
      [LE('Namensprüfung (IS100) über den Scout-Service: Nachname und Vorname getrennt, je eigene Prüfnotiz'),LE('entfällt; der Name wird Suchkriterium in IS011')],
      [LE('Geburtsdatum (IS100): eigener Vergleich mit eigener Prüfnotiz'),LE('wird Suchkriterium und Merkmal der Matrix')],
      [LE('Adressprüfung (IS100): Straße zweistufig mit Normalisierung, PLZ getrennt'),LE('Straße nur noch mit zwei Buchstaben als Suchkriterium; Normalisierung entfällt')],
      [LE('kein Abgleich des Vollmachtgebers als eigener Schritt'),LE('neuer Schritt: Name auf der Maklervollmacht gegen den gefundenen Partner')]]
table(s,0.56,4.65,[6.1,6.1],rows,rowh=0.44,size=10)

# ============================================== Folie 4: Bewertungsmatrix
s=folie('Only Title','Vorschlag für die Bewertung: Welche Kombination der Stammdaten bestätigt den Kunden?','KUNDENPRÜFUNG | BEWERTUNGSMATRIX',tsize=18)
text(s,0.56,1.5,12.2,0.24,[[('Ausgangslage in allen Zeilen: ',True),('Die Versicherungsnummer des Vorgangs hängt an der gefundenen Kundennummer mit Status „VN“.',False)]],size=11,color=GRAU)
H=lambda t:(t,{'size':9.5})
rows=[[H('Nachname'),H('Vorname'),H('Geburts-\ndatum'),H('PLZ'),H('Straße'),H('Lesart'),H('Ergebnis')],
 [JA(),EG(),JA(),EG(),EG(),LE('Der Regelfall: zwei tragende Merkmale stimmen.'),OK('Kunde bestätigt, keine Notiz')],
 [JA(),NE(),JA(),NE(),NE(),LE('Rufname und Umzug — beides erklärbar.'),OK('Kunde bestätigt, keine Notiz')],
 [JA(),EG(),FE(),JA(),JA(),LE('Juristische Person ohne Geburtsdatum; die Adresse trägt den Nachweis.'),OK('Kunde bestätigt, keine Notiz')],
 [JA(),EG(),FE(),NE(),NE(),LE('Weder Geburtsdatum noch Adresse stützen den Treffer.'),PN('Prüfnotiz: Stammdaten unplausibel')],
 [JA(),EG(),NE(),JA(),JA(),LE('Tippfehler im Datum bei sonst stimmiger Person.'),PN('Prüfnotiz: Geburtsdatum abweichend')],
 [NE(),EG(),JA(),JA(),EG(),LE('Namensänderung, etwa durch Heirat.'),PN('Prüfnotiz: Nachname abweichend')],
 [NE(),EG(),JA(),NE(),NE(),LE('Nur das Geburtsdatum stützt den Treffer.'),PN('Prüfnotiz: Stammdaten unplausibel')],
 [NE(),EG(),NE(),EG(),EG(),LE('Beide tragenden Merkmale widersprechen — vermutlich ein Auftrag für eine andere Person.'),BE('Abbruch: Stammdaten widersprechen')],
 [NE(),EG(),FE(),EG(),EG(),LE('Kein tragendes Merkmal bestätigt die Person.'),BE('Abbruch: Stammdaten widersprechen')]]
table(s,0.56,1.85,[0.95,0.85,1.0,0.72,0.82,4.36,3.5],rows,rowh=0.4,size=9)
text(s,0.56,6.1,7.5,0.5,'„egal“: Das Merkmal ändert das Ergebnis in dieser Zeile nicht. „abw.“ umfasst auch ein leeres Pflichtfeld im Datenpool.',size=8.5,color=GRAUM)
rect(s,8.3,6.02,4.46,0.78,TEALT)
text(s,8.48,6.12,4.1,0.62,[[('Leitgedanke: ',True),('Nachname und Geburtsdatum sind die tragenden Merkmale. Adresse und Vorname sind zu unzuverlässig, um allein zu entscheiden.',False)]],size=9,color=TEALD)

# ============================================== Folie 5: Vollmachtgeber und offene Punkte
s=folie('Only Title','Zweiter Abgleich: Hat der Versicherungsnehmer die Vollmacht selbst erteilt?','KUNDENPRÜFUNG | VOLLMACHTGEBER UND OFFENE PUNKTE',tsize=18)
text(s,0.56,1.5,12.2,0.24,'Die Maklervollmacht nennt den Vollmachtgeber. Er muss der Versicherungsnehmer sein, sonst trägt die Vollmacht die Übertragung nicht.',size=11,color=GRAU)
rows=[[('Konstellation',{'size':9.5,'align':PP_ALIGN.LEFT}),('Lesart',{'size':9.5,'align':PP_ALIGN.LEFT}),('Ergebnis',{'size':9.5,'align':PP_ALIGN.LEFT})],
 [LE('Name des Vollmachtgebers stimmt mit dem Partner überein'),LE('Regelfall'),OK('weiter, keine Notiz')],
 [LE('Abweichende Schreibweise oder Namensänderung, Geburtsdatum und Adresse identisch'),LE('dieselbe Person'),PN('Prüfnotiz: Vollmachtgeber abweichend')],
 [LE('Vollmacht lautet auf eine Firma, Versicherungsnehmer ist eine natürliche Person oder umgekehrt'),LE('häufig bei Einzelunternehmen, fachlich zu klären'),PN('Prüfnotiz: Vollmachtgeber abweichend')],
 [LE('Vollmacht lautet auf eine erkennbar andere Person'),LE('Die Vollmacht hat nicht der Versicherungsnehmer erteilt'),BE('Abbruch: Vollmachtgeber ist nicht der VN')]]
table(s,0.56,1.85,[5.0,3.2,4.0],rows,rowh=0.46,size=9)
abschnitt(s,0.56,4.25,5.5,'Das bitten wir zu bestätigen')
text(s,0.56,4.75,6.0,2.0,['Reicht der Treffer über die Versicherungsnummer als Identitätsnachweis, oder braucht es die Stammdaten als Gegenprobe?',
 'Sind Nachname und Geburtsdatum die tragenden Merkmale, oder soll die Adresse stärker gewichtet werden?',
 'Wo verläuft die Grenze zwischen Prüfnotiz und Abbruch? Strenger hieße: Jede Zeile mit Prüfnotiz wird zum Abbruch.',
 'Wie wird der Name des Vollmachtgebers geprüft, und was gilt bei Firma gegenüber natürlicher Person?'],size=10.5,bullets=True,space_after=6)
abschnitt(s,7.0,4.25,5.5,'Offen auf technischer Seite')
text(s,7.0,4.75,5.76,2.0,['Pflichtfelder und Toleranz der Suche in IS011, Verhalten bei Namensvarianten und Umlauten.',
 'Lässt sich die Straße als Teilstring mit zwei Buchstaben suchen?',
 'Welche Schnittstelle liefert je Kundennummer die zugehörigen Versicherungsnummern?',
 'Gibt es eine sinnvolle Obergrenze, ab der die Trefferliste zu groß für die Einzelprüfung wird?'],size=10.5,bullets=True,space_after=6)
rect(s,0.56,6.5,12.2,0.42,ROT)
text(s,0.8,6.57,11.7,0.3,[[('Vorschlag, fachlich noch nicht abgestimmt. ',True),('Nach Bestätigung arbeite ich die Matrix in die PDD Gesundheit/KV ein und übernehme sie in die PDD Komposit/Leben.',False)]],size=11,color=WEISS)

prs.save(OUT); print('ok',OUT)
