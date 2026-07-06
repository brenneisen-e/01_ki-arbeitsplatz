# -*- coding: utf-8 -*-
"""Handgebauter BPMN-Swimlane-Renderer (volle Layout-Kontrolle), Redesign:
- 6 Phasen-Baender oben (E-Mail -> Celonis -> Pruef-Bot -> Kriterien/Cockpit -> Postkorb -> Freigabe)
- Celonis-Lane mit Uebergabe-Datensatz (alle extrahierten + interpretierten Werte)
- Digitales Pruefdeckblatt am Ende der Pruefkette (hervorgehoben)
- Kriterien-Matrix: hart -> autom. Absage+Mail / weich -> manuelle Pruefung (Cockpit, in Pruefung) / optional -> Vollstaendigkeit
- Postkorb (AND): Archivierung + Roboter-Notiz als Entwurf -> Freigabe durch Mensch
Erzeugt bue_pruefbot.svg."""
import html

FS=13.0; FS_SYS=12.0; FS_LANE=13.0
CHARW=0.535
PAD_X=12; PAD_Y=9
LINEH=16
COL_GAP=34
LANE_PAD=18
HB=46                      # Hoehe Phasen-Header-Band
GREEN="#046A38"; DG2="#26890D"; GREY="#53565A"; DARK="#1A1A1A"
LIGHT="#F2F3F3"; LGREEN="#E4F0E0"; SYSFILL="#EAF1F7"; SYSBORD="#759"
HAIR="#C9CDD1"; RED="#8a2b1f"; AMBER="#9a6a00"; DECKFILL="#CDE6C6"
PHBG=["#fafcfa","#f3f7f4"]   # alternierende Phasen-Hintergruende (dezent)

def tw(s, fs=FS): return len(s)*fs*CHARW
def wrap(text, maxw, fs=FS):
    out=[]
    for para in str(text).split('\n'):
        words=para.split(' '); cur=''
        for w in words:
            while tw(w,fs)>maxw and len(w)>1:
                k=len(w)
                while k>1 and tw(w[:k],fs)>maxw: k-=1
                if cur: out.append(cur); cur=''
                out.append(w[:k]); w=w[k:]
            t=(cur+' '+w).strip()
            if tw(t,fs)<=maxw or not cur: cur=t
            else: out.append(cur); cur=w
        out.append(cur)
    return out

# ---- Modell ----------------------------------------------------------------
LANES=[('ein','Eingang & Eingangsmanagement · Outlook / EDM-KWAD'),
       ('cel','KI-Strukturierung & Deckblatt · Celonis'),
       ('sb','Sachbearbeitung · HITL'),
       ('bot','Prüf-Bot (System-Prüfung) · Blue Prism'),
       ('sys','Hostsysteme / Datenquellen'),
       ('ex','Ausführung · 72h-/BÜ-Bot · BeMaS')]
LANEY={k:i for i,(k,_) in enumerate(LANES)}

# nodes: id -> (lane, col, type, label)  type: start,end,task,gw,gwpar,event,check,data,ghost,deck
NODES={
 # Phase 1
 'start':('ein',0,'start','BÜ-Anfrage per Mail (Makler-Gruppenpostfach)'),
 'edm':('ein',1,'task','Mail in Postkorbvorgang umwandeln · Verbund & VNR (EDM/KWAD)'),
 # Phase 2 – Celonis
 'emma':('cel',0,'data','EMMA-Datenabzug · PNR / Partnerdaten'),
 'cel_struk':('cel',2,'task','Eingang strukturieren · Dokumente per Image/Jadice (OCR) lesen'),
 'cel_deck':('cel',3,'task','Werte extrahieren & interpretieren · KI-Deckblatt erstellen (Prüfschritte 1–5)'),
 'ablage':('cel',4,'task','Deckblatt & Übergabe-Datensatz ablegen · Übergabepunkt offen: ERGO Datapool, SharePoint oder anderes'),
 'gw_bue':('cel',5,'gw','BÜ-Wunsch vorhanden? (Deckblatt)'),
 'keinbue':('ein',5,'task','An Eingangsmanagement umrouten · kein BÜ-Wunsch (Umindizierung)'),
 'end_keinbue':('ein',6,'end','Zurück an Eingangsmanagement'),
 # Phase 3 – Prüf-Bot
 'abholen':('bot',6,'task','BÜ-Vorgang automatisch übernehmen · Umfang lt. Wunsch: einzelne VNR oder gesamte Kundenverbindung'),
 'c6':('bot',7,'check','6 · Vertrag aktiv?'),
 'c7':('bot',8,'check','7 · Vertrags-Identität (VN-Abgleich mit System)'),
 'c8':('bot',9,'check','8 · Vermittler-Status & Bestandstyp'),
 'c9ref':('bot',10,'ghost','9 · VVR (Untermakler) · von Robots laut VVR-AGB nicht erlaubt · manuell am Ende (HITL) – siehe Sachbearbeitung'),
 'c10':('bot',11,'check','10 · Hinterlegte MV / VA250-Bereinigung'),
 'c11':('bot',12,'check','11 · Widerruf prüfen'),
 'c12':('bot',13,'check','12 · Umfang & weitere VNRs · bei gesamter Kundenverbindung alle Verträge/Verbünde ermitteln & je Vertrag prüfen'),
 'c13':('bot',14,'check','13 · Agenturnummer aktiv?'),
 'c14':('bot',15,'check','14 · Rahmenvertrag / BÜ-Sperre'),
 'c15':('bot',16,'check','15 · Provisionshaftung'),
 'c16':('bot',17,'check','16 · Korrespondenzadresse Makler'),
 'vvr_hitl':('sb',18,'task','9 · VVR (Untermakler) prüfen — manuell (HITL), da Robots im Vermittlerregister nicht zulässig'),
 'pruefdeckblatt':('bot',19,'deck','Digitales Prüfdeckblatt erstellen · Ergebnis ALLER Prüfungen (1–16) je Vertrag'),
 # Phase 4 – Kriterien-Matrix + Cockpit/HITL
 'gw_matrix':('bot',20,'gw','Kriterien-Matrix: hart / weich / optional?'),
 'absage_auto':('ex',21,'task','Automatische Absage · Mail an Makler mit Begründung (hartes Kriterium verletzt)'),
 'manuelle_pruefung':('sb',21,'task','Manuelle Prüfung der geflaggten Fälle (SB · HITL) · Idee: Robotics Cockpit — techn. Machbarkeit durch Robotics zu prüfen'),
 'gw_entscheid':('sb',22,'gw','Nach Prüfung: freigeben oder ablehnen?'),
 'absage_manuell':('ex',23,'task','Absage nach manueller Entscheidung · Mail an Makler (Cockpit / SB)'),
 # Phase 5 – Postkorbvorgang über EMWS + zwei Weichen (abgelehnt / positiv)
 'emws':('bot',24,'task','Postkorbvorgang eröffnen · über EMWS'),
 'gw_ergebnis':('bot',25,'gw','BÜ-Vorgang: abgelehnt oder positiv?'),
 'direktablage':('ein',26,'task','Direktablagekennzeichen setzen · Vorgang direkt archivieren'),
 'end_archiv':('ein',27,'end','Direkt archiviert (Absage)'),
 'postkorb_notiz':('bot',26,'task','Postkorbvorgang mit ALLEN Prüfinformationen + Notiz eröffnen · Notiz belädt den bestehenden BÜ-Bot'),
 'gw_stufe':('bot',27,'gw','Umsetzungsstufe: Phase 1 (HITL) oder Zielbild (IKS)?'),
 # Phase 6 – Phase-1-Freigabe (HITL) bzw. Zielbild-Direktübergabe (IKS) an den BÜ-Bot
 'notiz_entwurf':('sb',28,'task','Phase 1: Notiz als Entwurf für Sachbearbeiter · Vorgang wird noch geprüft'),
 'notiz_frei':('sb',29,'task','Sachbearbeiter prüft & gibt Notiz frei (HITL)'),
 'iks_direkt':('bot',28,'task','Zielbild: richtig geprüfte Vorgänge direkt an den Roboter · IKS-Prozess'),
 'buebot':('ex',30,'task','Bestehender BÜ-Bot: BÜ ausführen · 1515 (KOM·LEB) / BeMaS 2011 (KV) · 72h-Vorabinfo bei AO-Bestand'),
 'qs':('bot',31,'task','18 · Bot-Ergebnis prüfen (QS) · Scout'),
 'info':('ex',32,'task','Makler informieren · Contex / E-Mail'),
 'end_ok':('ex',33,'end','BÜ ausgeführt · Makler informiert'),
}
# edges: (src,dst,label)
EDGES=[('start','edm',''),('edm','cel_struk',''),('emma','cel_deck',''),('cel_struk','cel_deck',''),
 ('cel_deck','ablage',''),('ablage','gw_bue',''),
 ('gw_bue','abholen','Ja'),('gw_bue','keinbue','Nein'),('keinbue','end_keinbue',''),
 ('abholen','c6',''),('c6','c7',''),('c7','c8',''),('c8','c9ref',''),('c9ref','c10',''),('c10','c11',''),('c11','c12',''),
 ('c12','c13',''),('c13','c14',''),('c14','c15',''),('c15','c16',''),('c16','vvr_hitl',''),
 ('vvr_hitl','pruefdeckblatt',''),('pruefdeckblatt','gw_matrix',''),
 ('gw_matrix','absage_auto','hart verletzt'),('absage_auto','emws',''),
 ('gw_matrix','manuelle_pruefung','weich verletzt'),('manuelle_pruefung','gw_entscheid',''),
 ('gw_entscheid','emws','freigegeben'),('gw_entscheid','absage_manuell','abgelehnt'),('absage_manuell','emws',''),
 ('gw_matrix','emws','erfüllt / nur optional'),
 ('emws','gw_ergebnis',''),
 ('gw_ergebnis','direktablage','abgelehnt'),('direktablage','end_archiv',''),
 ('gw_ergebnis','postkorb_notiz','positiv'),('postkorb_notiz','gw_stufe',''),
 ('gw_stufe','notiz_entwurf','Phase 1'),('notiz_entwurf','notiz_frei',''),('notiz_frei','buebot',''),
 ('gw_stufe','iks_direkt','Zielbild'),('iks_direkt','buebot',''),
 ('buebot','qs',''),('qs','info',''),('info','end_ok','')]
# systems per check (Hostsysteme-Lane)
SYS={'c6':['Scout','SV001'],'c7':['IS100','Scout'],'c8':['OB726','OB510','KV050/VA210'],
 'c10':['VA250','PDB'],'c11':['Scout'],'c12':['Scout'],
 'c13':['OB726','OB510','OB735'],'c14':['SV001','Scout'],'c15':['KV050'],'c16':['OB729','DiOrg/SAP']}

# Phasen (Startspalte) – fuer Header-Baender
PHASES=[('1 · E-Mail-Eingang bei ERGO',0),
        ('2 · Strukturierung durch Celonis · BÜ-Relevanz',2),
        ('3 · Prüf-Bot · Einzelprüfung + digitales Prüfdeckblatt',6),
        ('4 · Kriterien-Matrix · Cockpit / HITL (Idee · durch Robotics zu validieren)',20),
        ('5 · Postkorb · EMWS (abgelehnt: Direktablage / positiv: Notiz)',24),
        ('6 · Phase 1: SB-Freigabe / Zielbild: IKS · Übergabe an BÜ-Bot',28)]

# ---- Auto-Size je Node -----------------------------------------------------
TASK_TARGETW=190
size={}; nlines={}
for nid,(lane,col,typ,label) in NODES.items():
    if typ in ('gw','gwpar'):
        size[nid]=(46,46); nlines[nid]=[]
    elif typ in ('start','end','event'):
        size[nid]=(34,34); nlines[nid]=[]
    else:
        maxw=300
        lines=wrap(label,TASK_TARGETW)
        w=max(TASK_TARGETW, max((tw(l) for l in lines),default=0))+2*PAD_X
        w=min(w,maxw)
        lines=wrap(label,w-2*PAD_X)
        h=len(lines)*LINEH+2*PAD_Y
        size[nid]=(w,max(46,h)); nlines[nid]=lines

# system box sizes
sysbox={}
for cid,syslist in SYS.items():
    for s in syslist:
        w=tw(s,FS_SYS)+18; sysbox[(cid,s)]=(max(58,w),26)

# ---- Layout: Spalten-X -----------------------------------------------------
ncols=max(c for _,c,_,_ in NODES.values())+1
colw=[0]*ncols
for nid,(lane,col,typ,label) in NODES.items():
    colw[col]=max(colw[col],size[nid][0])
for cid,syslist in SYS.items():
    col=NODES[cid][1]
    for s in syslist: colw[col]=max(colw[col],sysbox[(cid,s)][0])
colx=[]; x=70
for c in range(ncols):
    colx.append(x); x+=colw[c]+COL_GAP
TOTALW=x+40

# ---- Layout: Lane-Y (dynamische Hoehe je Lane) -----------------------------
SYSLANE_H= max(26*len(v) for v in SYS.values())*1 + 40
CEL_H=210   # Platz fuer Uebergabe-Datensatz-Box unter den Celonis-Boxen
laneh={}
for k,_ in LANES:
    if k=='sys': laneh[k]=SYSLANE_H
    elif k=='cel': laneh[k]=CEL_H
    else:
        hs=[size[nid][1] for nid,(lane,_,_,_) in NODES.items() if lane==k]
        laneh[k]=max(132,(max(hs) if hs else 0)+30)
laney={}; y=HB+6
for k,_ in LANES:
    laney[k]=y; y+=laneh[k]
TOTALH=y+24
LABELW=150
OFFX=LABELW

def node_xy(nid):
    lane,col,typ,label=NODES[nid]; w,h=size[nid]
    cx=colx[col]+colw[col]/2
    if lane=='cel':
        cy=laney['cel']+46      # Celonis-Boxen oben in der Lane (Platz fuer Datensatz darunter)
    else:
        cy=laney[lane]+laneh[lane]/2
    return cx,cy,w,h

# ---- SVG zeichnen ----------------------------------------------------------
S=[]
S.append(f'<svg xmlns="http://www.w3.org/2000/svg" width="{int(TOTALW+LABELW)}" height="{int(TOTALH)}" font-family="Arial, sans-serif">')
S.append('<rect width="100%" height="100%" fill="white"/>')
S.append('<defs><marker id="arr" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="#333"/></marker>'
         '<marker id="arrsys" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 z" fill="#5577aa"/></marker></defs>')
def esc(s): return html.escape(str(s))

# Phasen-Grenzen (x) + Hintergrund + Header
phx=[]
for (_,sc) in PHASES:
    phx.append(OFFX+colx[sc]-COL_GAP/2)
phx.append(OFFX+TOTALW)
laneTop=laney[LANES[0][0]]; laneBot=laney[LANES[-1][0]]+laneh[LANES[-1][0]]
for i,(title,_) in enumerate(PHASES):
    x0=phx[i]; x1=phx[i+1]; w=x1-x0
    S.append(f'<rect x="{x0}" y="{laneTop}" width="{w}" height="{laneBot-laneTop}" fill="{PHBG[i%2]}"/>')
    # Header-Band
    hfill = GREEN if i%2==0 else DG2
    S.append(f'<rect x="{x0}" y="6" width="{w}" height="{HB-8}" fill="{hfill}"/>')
    for j,ln in enumerate(wrap(title, w-16, 13.5)):
        S.append(f'<text x="{x0+10}" y="{24+j*16}" font-size="13.5" font-weight="bold" fill="white">{esc(ln)}</text>')
    # vertikale Phasentrennlinie
    if i>0:
        S.append(f'<line x1="{x0}" y1="6" x2="{x0}" y2="{laneBot}" stroke="#9aa3ab" stroke-width="1" stroke-dasharray="2,3"/>')

# Lane-Baender + Labels
for k,name in LANES:
    ly=laney[k]; lh=laneh[k]
    S.append(f'<rect x="{OFFX}" y="{ly}" width="{TOTALW}" height="{lh}" fill="none" stroke="{HAIR}" stroke-width="1"/>')
    S.append(f'<rect x="{OFFX-LABELW}" y="{ly}" width="{LABELW}" height="{lh}" fill="#eef1f4" stroke="{HAIR}" stroke-width="1"/>')
    col= GREEN if k in('cel','bot') else (DG2 if k=='sys' else GREY)
    for i,ln in enumerate(wrap(name,lh-20,FS_LANE)):
        S.append(f'<text x="{OFFX-LABELW+10}" y="{ly+22+i*16}" font-size="{FS_LANE}" font-weight="bold" fill="{col}">{esc(ln)}</text>')

# Uebergabe-Datensatz (Celonis -> Pruef-Bot): alle extrahierten + interpretierten Werte
ub_x0=OFFX+colx[2]-6; ub_x1=OFFX+colx[5]+colw[5]+6
ub_y0=laney['cel']+92; ub_y1=laney['cel']+laneh['cel']-10
S.append(f'<rect x="{ub_x0}" y="{ub_y0}" width="{ub_x1-ub_x0}" height="{ub_y1-ub_y0}" rx="7" fill="#EAF1F7" stroke="#5577aa" stroke-width="1.3" stroke-dasharray="5,3"/>')
ubw=ub_x1-ub_x0-24
S.append(f'<text x="{ub_x0+12}" y="{ub_y0+18}" font-size="12.5" font-weight="bold" fill="#274">Übergabe-Datensatz (KI-Deckblatt) an den Prüf-Bot</text>')
ex_txt=("Extrahiert (OCR aus Dokument): Kundenname · Geburtsdatum · Adresse · Versicherungsnummer(n) · Sparte · "
        "Kunden-/Partnernummer (PNR aus EMMA) · VN laut MV · Pool · Vermittler · Agentur-/Personalnummer · "
        "Makler-Adresse · Auftragsdatum · MV-Inhalt & -Einschränkungen · Unterschrift Kunde/Makler")
ip_txt=("Interpretiert (KI): Vorgangstyp · Klassifikation · BÜ-Wunsch (ja/nein) · MV-Status (formal & inhaltlich) · "
        "MV vollumfänglich · Untervollmacht · Vollständigkeit der Unterlagen · Reminder/Wiedervorlage · "
        "BÜ-Ampel · Typ Makler/MFA · Zusammenfassung · Hinweis (Auffälligkeiten)")
yy=ub_y0+36
for i,ln in enumerate(wrap(ex_txt, ubw, 11.5)):
    fw='bold' if i==0 else 'normal'
    S.append(f'<text x="{ub_x0+12}" y="{yy}" font-size="11.5" fill="#1d4">{esc(ln)}</text>'); yy+=15
yy+=4
for i,ln in enumerate(wrap(ip_txt, ubw, 11.5)):
    S.append(f'<text x="{ub_x0+12}" y="{yy}" font-size="11.5" fill="#274">{esc(ln)}</text>'); yy+=15

def draw_box(nid):
    lane,col,typ,label=NODES[nid]; cx,cy,w,h=node_xy(nid); cx+=OFFX
    x=cx-w/2; y=cy-h/2
    if typ in('gw','gwpar'):
        sym='+' if typ=='gwpar' else '×'
        S.append(f'<path d="M{cx},{y} L{x+w},{cy} L{cx},{y+h} L{x},{cy} z" fill="white" stroke="{DARK}" stroke-width="1.6"/>')
        S.append(f'<text x="{cx}" y="{cy+6}" font-size="18" text-anchor="middle" fill="{DARK}">{sym}</text>')
        for i,ln in enumerate(wrap(label,170)):
            S.append(f'<text x="{cx}" y="{y+h+14+i*14}" font-size="11.5" text-anchor="middle" fill="{DARK}">{esc(ln)}</text>')
    elif typ=='data':
        S.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#EAF1F7" stroke="#5577aa" stroke-width="1.3" stroke-dasharray="5,3"/>')
        lines=nlines[nid]; ty=cy-(len(lines)-1)*LINEH/2
        for i,ln in enumerate(lines):
            S.append(f'<text x="{cx}" y="{ty+i*LINEH+4}" font-size="{FS}" text-anchor="middle" fill="#274">{esc(ln)}</text>')
    elif typ in('start','end','event'):
        sw=2.6 if typ=='end' else 1.6
        S.append(f'<circle cx="{cx}" cy="{cy}" r="{w/2}" fill="white" stroke="{GREEN if typ!="end" else "#8a1f1f"}" stroke-width="{sw}"/>')
        if typ=='event': S.append(f'<circle cx="{cx}" cy="{cy}" r="{w/2-4}" fill="none" stroke="{GREEN}" stroke-width="1.2"/>')
        for i,ln in enumerate(wrap(label,150)):
            S.append(f'<text x="{cx}" y="{y+h+13+i*13}" font-size="11" text-anchor="middle" fill="{DARK}">{esc(ln)}</text>')
    elif typ=='ghost':
        S.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9" fill="#f4f4f4" stroke="{GREY}" stroke-width="1.3" stroke-dasharray="5,3"/>')
        lines=nlines[nid]; ty=cy-(len(lines)-1)*LINEH/2
        for i,ln in enumerate(lines):
            fw='bold' if i==0 else 'normal'
            S.append(f'<text x="{cx}" y="{ty+i*LINEH+4}" font-size="{FS}" text-anchor="middle" font-weight="{fw}" fill="{GREY}">{esc(ln)}</text>')
    elif typ=='deck':
        S.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9" fill="{DECKFILL}" stroke="{GREEN}" stroke-width="2.8"/>')
        lines=nlines[nid]; ty=cy-(len(lines)-1)*LINEH/2
        for i,ln in enumerate(lines):
            S.append(f'<text x="{cx}" y="{ty+i*LINEH+4}" font-size="{FS}" text-anchor="middle" font-weight="bold" fill="{DARK}">{esc(ln)}</text>')
    else:
        fill= LGREEN if typ=='check' else ('#eef6ef' if lane in('cel','bot') else 'white')
        bord= GREEN if lane in('cel','bot') else GREY
        S.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9" fill="{fill}" stroke="{bord}" stroke-width="1.4"/>')
        lines=nlines[nid]; ty=cy-(len(lines)-1)*LINEH/2
        for i,ln in enumerate(lines):
            fw='bold' if (typ=='check' and i==0) else 'normal'
            S.append(f'<text x="{cx}" y="{ty+i*LINEH+4}" font-size="{FS}" text-anchor="middle" font-weight="{fw}" fill="{DARK}">{esc(ln)}</text>')

def anchor(nid,side):
    cx,cy,w,h=node_xy(nid); cx+=OFFX
    if side=='r': return cx+w/2,cy
    if side=='l': return cx-w/2,cy
    if side=='t': return cx,cy-h/2
    if side=='b': return cx,cy+h/2

# Sequenzfluss
for src,dst,lab in EDGES:
    sc=NODES[src][1]; dc=NODES[dst][1]; sl=NODES[src][0]; dl=NODES[dst][0]
    sx,sy=anchor(src,'r' if dc>=sc else 'l')
    if sl==dl:
        tx,ty=anchor(dst,'l' if dc>=sc else 'r')
        if abs(sy-ty)<2:
            S.append(f'<path d="M{sx},{sy} L{tx},{ty}" fill="none" stroke="#333" stroke-width="1.3" marker-end="url(#arr)"/>')
        else:
            midx=(sx+tx)/2
            S.append(f'<path d="M{sx},{sy} L{midx},{sy} L{midx},{ty} L{tx},{ty}" fill="none" stroke="#333" stroke-width="1.3" marker-end="url(#arr)"/>')
    else:
        sx,sy=anchor(src,'b' if LANEY[dl]>LANEY[sl] else 't')
        tx,ty=anchor(dst,'t' if LANEY[dl]>LANEY[sl] else 'b')
        if abs(sx-tx)<2:
            S.append(f'<path d="M{sx},{sy} L{tx},{ty}" fill="none" stroke="#333" stroke-width="1.3" marker-end="url(#arr)"/>')
        else:
            midy=(sy+ty)/2
            S.append(f'<path d="M{sx},{sy} L{sx},{midy} L{tx},{midy} L{tx},{ty}" fill="none" stroke="#333" stroke-width="1.3" marker-end="url(#arr)"/>')
    if lab:
        lc = RED if 'hart' in lab else (AMBER if 'weich' in lab or 'abgelehnt' in lab else GREY)
        S.append(f'<rect x="{sx+6}" y="{sy-17}" width="{tw(lab)+8}" height="14" fill="white" opacity="0.88"/>')
        S.append(f'<text x="{sx+10}" y="{sy-6}" font-size="11" font-weight="bold" fill="{lc}">{esc(lab)}</text>')

# Hostsysteme
for cid,syslist in SYS.items():
    cx,cy,w,h=node_xy(cid); cx+=OFFX
    bx0=anchor(cid,'b'); sy_top=laney['sys']+10; yy=sy_top
    S.append(f'<path d="M{cx},{bx0[1]} L{cx},{yy}" fill="none" stroke="#5577aa" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arrsys)"/>')
    for s in syslist:
        bw,bh=sysbox[(cid,s)]
        S.append(f'<rect x="{cx-bw/2}" y="{yy}" width="{bw}" height="{bh}" rx="5" fill="{SYSFILL}" stroke="#5577aa" stroke-width="1.2"/>')
        S.append(f'<text x="{cx}" y="{yy+17}" font-size="{FS_SYS}" text-anchor="middle" fill="#274">{esc(s)}</text>')
        yy+=bh+5

for nid in NODES: draw_box(nid)
S.append('</svg>')
open('bue_pruefbot.svg','w').write('\n'.join(S))
print('SVG geschrieben:', int(TOTALW+LABELW),'x',int(TOTALH))
