# -*- coding: utf-8 -*-
"""A4-Vorschau (PDF) des BÜ-Reporting-Fachkonzepts – inhaltsgleich zur .docx.
Eigener Flow-/Paginierungs-Renderer -> SVG-Seiten -> cairosvg PDF/PNG.
(LibreOffice Writer ist in dieser Umgebung nicht installiert; daher SVG-Route.)"""
import html
GREEN="#046A38"; DG2="#26890D"; GREY="#53565A"; DARK="#1A1A1A"
LGREEN="#E4F0E0"; HAIR="#C9CDD1"; ZEBRA="#F4F7F4"; JA="#1d6b2f"; NEIN="#8a2b1f"
PAGE_W=794; PAGE_H=1123; MARGIN=54; CW=PAGE_W-2*MARGIN
CHARW=0.535
def tw(s,fs): return len(s)*fs*CHARW
def wrap(text,maxw,fs):
    out=[]
    for para in text.split('\n'):
        words=para.split(' '); cur=''
        for w in words:
            t=(cur+' '+w).strip()
            if tw(t,fs)<=maxw or not cur: cur=t
            else: out.append(cur); cur=w
        out.append(cur)
    return out
def esc(s): return html.escape(s)

# Tabellenspalten (Summe = CW)
TCOLS=[("Segment",118),("Schlüssel",86),("Bezeichnung",186),("Quelle / Bestätigung",CW-118-86-186)]
TROWS=[
 ("Komposit / Leben","GeVo 469","Bestandsübertragung","MIS-O (HS); bestätigt S. Koeberer / D. Amend, 25.06."),
 ("Komposit / Leben","GeVo 108","Bestandsübertragung (2. Schlüssel)","MIS-O (HS); bestätigt S. Koeberer / D. Amend, 25.06."),
 ("KV / Gesundheit","ID 02015","Maklervollmacht","Betrieb Gesundheit – H. Andermann / M. Böttger, 27./29.06."),
 ("KV / Gesundheit","ID 06065","Betreuung / Anfrage Betreuung","Betrieb Gesundheit – H. Andermann / M. Böttger, 27./29.06."),
]

# Dokument als Elementliste
DOC=[
 ("title","BÜ-Reporting – Fachkonzept"),
 ("sub","Einheitliches, segmentübergreifendes Reporting der Makler-Bestandsübertragung"),
 ("meta","Stand: 29.06.2026  ·  Aktualisierung: GeVo-/ID-Schlüssel final bestätigt (Komposit/Leben und KV/Gesundheit)"),
 ("rule",),
 ("h","1. Zielbild"),
 ("p","Ein gemeinsames, segmentübergreifendes BÜ-Reporting mit einheitlicher Zähllogik über Komposit, Leben und KV. "
      "Die technische Umsetzung erfolgt über einen neuen MIS-O-Bericht oder alternativ über SAS Viya; die Variante "
      "wird im gemeinsamen Termin entschieden."),
 ("h","2. BÜ-Schlüssel je Segment (final bestätigt)"),
 ("p","Gezählt werden ausschließlich Vorgänge mit „Bestandsübertragung\"-Schlüssel. Die folgenden Schlüssel sind nun "
      "fachlich bestätigt:"),
 ("table",None),
 ("note","Korrektur gegenüber Erstfassung:","Der ursprünglich genannte Schlüssel „SV 496\" war ein Zahlendreher; "
      "korrekt ist GeVo 469. Der zweite Komposit/Leben-Schlüssel (108) sowie die KV-Schlüssel sind damit bestätigt – "
      "alle in der Erstfassung offenen Schlüssel-Punkte sind geklärt."),
 ("h","3. Zwei Berichte (identische Filter- und Drill-down-Logik)"),
 ("bullet","Bericht 1 – Wocheneingang","neu eingegangene BÜ-OPAGs der aktuellen Kalenderwoche."),
 ("bullet","Bericht 2 – Rückstand","VNR mit mindestens einem offenen BÜ-OPAG."),
 ("h","4. Zähllogik"),
 ("bullet",None,"Gezählt wird auf OPAG-Ebene, jedoch nur OPAGs mit „Bestandsübertragung\"-Schlüssel (BÜ-OPAGs) gemäß der Schlüsseltabelle in Abschnitt 2."),
 ("bullet",None,"Rückstand = VNR mit mindestens einem offenen BÜ-OPAG (ein „Rückstand von 3\" = 3 VNR mit aktuell offenem BÜ-Schriftwechsel)."),
 ("bullet",None,"Zähllebene „Verbund\": Ein Verbund besteht aus Verwaltungssystemschlüssel + Ordnungsbegriff (Leben/Komposit – VDB-Volumenstatistik) bzw. zusätzlich der Verbundlaufenden Nr. (Gesundheit – DMS-Statistik). GeVo = OPAG."),
 ("h","5. Filter / Drill-down (für beide Berichte gleich)"),
 ("bullet","Segment","Komposit / Leben / KV."),
 ("bullet","Vertriebsweg","Makler-Makler / Makler-AO – über die Postkörbe (in MIS-O nur der aktuell am Vertrag gespeicherte Vertriebsweg)."),
 ("bullet","Postkorb","einzeln und kumuliert; persönliche Postkörbe ausschließlich kumuliert ohne Personenbezug (falls möglich)."),
 ("h","6. Beteiligte Postkörbe"),
 ("bullet","Makler-Makler","Dienststellen-/Themenpostkörbe aus ODPD inkl. KBIG/MSUE (M. Koch, H. Klindworth) sowie die Mitarbeiter-Postkörbe (nur kumuliert)."),
 ("bullet","HS","Postkörbe aus HSB4 K (D. Amend) inkl. kumuliertem Mitarbeiterwert der Dienststelle 23724."),
 ("h","7. Offene Punkte (für den gemeinsamen Termin)"),
 ("bullet",None,"Report-Variante: neuer MIS-O-Bericht oder SAS Viya."),
 ("bullet",None,"Zähl-/Reportinglogik im Detail: Verbund vs. Verbundkette bzw. mehrere VNR je Verbund."),
 ("bullet",None,"Prüfen, ob neben den BÜ-Schlüsseln weitere GeVo (z. B. Vertragsänderungen) aufzunehmen sind, damit nicht sauber als BÜ klassifizierte Postkorb-Vorgänge nicht fehlen (Hinweis H. Klindworth) – aktuelle Sicht D. Amend: in MIS-O liegen für Komposit/Leben nur 469/108 mit der Bezeichnung Bestandsübertragung vor."),
]

# ---- Flow-Renderer mit Paginierung ----
pages=[]; cur=[]; y=MARGIN
BULLET_X=MARGIN+14; TEXT_X=MARGIN+26
def newpage():
    global cur,y
    pages.append(cur); cur=[]; y=MARGIN
def ensure(hpx):
    global y
    if y+hpx>PAGE_H-MARGIN: newpage()
def emit(s): cur.append(s)

for el in DOC:
    kind=el[0]
    if kind=="title":
        ensure(34); emit(f'<text x="{MARGIN}" y="{y+26}" font-size="26" font-weight="bold" fill="{GREEN}">{esc(el[1])}</text>'); y+=34
    elif kind=="sub":
        ensure(20); emit(f'<text x="{MARGIN}" y="{y+14}" font-size="13" font-style="italic" fill="{GREY}">{esc(el[1])}</text>'); y+=20
    elif kind=="meta":
        for ln in wrap(el[1],CW,10.5):
            ensure(15); emit(f'<text x="{MARGIN}" y="{y+11}" font-size="10.5" font-weight="bold" fill="{DG2}">{esc(ln)}</text>'); y+=15
        y+=4
    elif kind=="rule":
        ensure(10); emit(f'<line x1="{MARGIN}" y1="{y+3}" x2="{PAGE_W-MARGIN}" y2="{y+3}" stroke="{GREEN}" stroke-width="2"/>'); y+=12
    elif kind=="h":
        ensure(26); y+=8
        emit(f'<text x="{MARGIN}" y="{y+13}" font-size="14.5" font-weight="bold" fill="{GREEN}">{esc(el[1])}</text>'); y+=22
    elif kind=="p":
        for ln in wrap(el[1],CW,11):
            ensure(16); emit(f'<text x="{MARGIN}" y="{y+11}" font-size="11" fill="{DARK}">{esc(ln)}</text>'); y+=16
        y+=3
    elif kind=="note":
        lead,txt=el[1],el[2]
        full=lead+" "+txt
        first=True
        for ln in wrap(full,CW,10.5):
            ensure(15)
            if first:
                rest=ln[len(lead)+1:]
                emit(f'<text x="{MARGIN}" y="{y+11}" font-size="10.5"><tspan font-weight="bold" fill="{DG2}">{esc(lead)} </tspan><tspan fill="{DARK}">{esc(rest)}</tspan></text>')
                first=False
            else:
                emit(f'<text x="{MARGIN}" y="{y+11}" font-size="10.5" fill="{DARK}">{esc(ln)}</text>')
            y+=15
        y+=3
    elif kind=="bullet":
        lead,txt=el[1],el[2]
        prefix=(lead+": ") if lead else ""
        lines=wrap(prefix+txt,CW-(TEXT_X-MARGIN),11)
        ensure(16)
        emit(f'<circle cx="{BULLET_X}" cy="{y+7}" r="2.4" fill="{GREEN}"/>')
        first=True
        for ln in lines:
            ensure(16)
            if first and lead:
                rest=ln[len(lead)+2:]
                emit(f'<text x="{TEXT_X}" y="{y+11}" font-size="11"><tspan font-weight="bold" fill="{DG2}">{esc(lead)}: </tspan><tspan fill="{DARK}">{esc(rest)}</tspan></text>')
            else:
                emit(f'<text x="{TEXT_X}" y="{y+11}" font-size="11" fill="{DARK}">{esc(ln)}</text>')
            first=False; y+=16
        y+=3
    elif kind=="table":
        fs=9.5; padx=7; pady=6; lineh=13
        # Kopf
        def draw_header():
            global y
            ensure(24); x=MARGIN
            emit(f'<rect x="{MARGIN}" y="{y}" width="{CW}" height="22" fill="{GREEN}"/>')
            for name,w in TCOLS:
                emit(f'<text x="{x+padx}" y="{y+15}" font-size="{fs}" font-weight="bold" fill="white">{esc(name)}</text>'); x+=w
            y+=22
        draw_header()
        for ri,row in enumerate(TROWS):
            # Zeilenhöhe
            celllines=[]; mx=1
            for ci,(_,w) in enumerate(TCOLS):
                ls=wrap(row[ci],w-2*padx,fs); celllines.append(ls); mx=max(mx,len(ls))
            rh=mx*lineh+2*pady
            if y+rh>PAGE_H-MARGIN:
                newpage(); draw_header()
            if ri%2==1: emit(f'<rect x="{MARGIN}" y="{y}" width="{CW}" height="{rh}" fill="{ZEBRA}"/>')
            x=MARGIN
            for ci,(_,w) in enumerate(TCOLS):
                col=DARK; fw="normal"
                if ci==0: col=DARK; fw="bold"
                if ci==1: col=GREEN; fw="bold"
                if ci==3: col=GREY
                for li,ln in enumerate(celllines[ci]):
                    emit(f'<text x="{x+padx}" y="{y+pady+10+li*lineh}" font-size="{fs}" font-weight="{fw}" fill="{col}">{esc(ln)}</text>')
                x+=w
            emit(f'<line x1="{MARGIN}" y1="{y+rh}" x2="{MARGIN+CW}" y2="{y+rh}" stroke="{HAIR}" stroke-width="1"/>')
            y+=rh
        # vertikale Linien + Rahmen über die ganze Tabelle (nur grob: Rahmen)
        y+=4
pages.append(cur)

# SVG-Dateien schreiben
files=[]
for pi,page in enumerate(pages,1):
    S=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{PAGE_W}" height="{PAGE_H}" font-family="Arial, Helvetica, sans-serif">']
    S.append(f'<rect width="100%" height="100%" fill="white"/>')
    S.extend(page)
    # Fußzeile
    S.append(f'<text x="{MARGIN}" y="{PAGE_H-28}" font-size="8.5" fill="{GREY}">BÜ-Reporting – Fachkonzept · Stand 29.06.2026 · Seite {pi}/{len(pages)}</text>')
    S.append('</svg>')
    fn=f'fachkonzept_p{pi}.svg'; open(fn,'w').write('\n'.join(S)); files.append(fn)
print("Seiten:",len(pages),files)
