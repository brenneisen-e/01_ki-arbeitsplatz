# -*- coding: utf-8 -*-
"""Seite 2: Detailtabelle der Blue-Prism-Prüfschritte 6-16
(Was wird geprüft · Quellsystem · Ergebnis Ja · Ergebnis Nein). Erzeugt table.svg.
Ohne Pfeil-Kurzschreibweisen (kein →/↔), Konsequenzen ausformuliert.
Schritt-Spalte breiter + harter Wortumbruch, damit nichts überläuft."""
import html
FS=11.0; FSH=12.0; CHARW=0.535; LINEH=14; PADX=8; PADY=7
GREEN="#046A38"; DG2="#26890D"; GREY="#53565A"; DARK="#1A1A1A"; LGREEN="#E4F0E0"; HAIR="#C9CDD1"; ZEBRA="#F4F7F4"
def tw(s,fs=FS): return len(s)*fs*CHARW
def wrap(text,maxw,fs=FS):
    out=[]
    for para in text.split('\n'):
        words=para.split(' '); cur=''
        for w in words:
            # ueberlange Einzelwoerter hart umbrechen, damit sie nicht ueberlaufen
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

COLS=[('Schritt',172),('Was wird geprüft?',312),('Quellsystem',196),
      ('Ergebnis „Ja" (Merkmal erfüllt)',292),('Ergebnis „Nein" (Merkmal nicht erfüllt)',292)]
ROWS=[
 ['6 · Vertrag aktiv?','Ist der betroffene Vertrag noch in Bestand (nicht beendet / historisch)?',
  'Scout (Vertragsstatus / Beendigungsdatum) · SV001 (KOM·LEB)',
  'Status „aktiv" und kein Beendigungsdatum: BÜ ist möglich, der Vorgang läuft weiter.',
  'Vertrag beendet oder historisch: Aussteuerung, keine BÜ.'],
 ['7 · Vertrags-Identität','Ist der Unterzeichner der MV der Versicherungsnehmer des Vertrags? (Abgleich Deckblatt-Name und System-VN)',
  'IS100 · Scout',
  'VN aus der MV stimmt mit dem System-VN überein, der Vorgang läuft weiter.',
  'VN und Unterzeichner weichen ab: Klärung, gegebenenfalls Aussteuerung.'],
 ['8 · Vermittler-Status & Bestandstyp','Ist der Vermittler systemseitig Makler / Koop / MFA / AO – oder Sonderbestand (Mitarbeiter / Eigen / Gruppe KV180 / bKV)?',
  'OB726 · OB510 · KV050 (KV) / VA210 (KOM·LEB)',
  'Makler bzw. MFA und kein Sonderbestand, der Vorgang läuft weiter.',
  'Sonderbestand: fallspezifische, manuelle Bearbeitung.'],
 ['9 · Untermakler im VVR\n(manuell · HITL · v.a. KV-Fall)','Ist der Untermakler im Vermittlerregister als Makler eingetragen? (Robots laut VVR-AGB nicht erlaubt, daher manuell am Ende)',
  'VVR (extern, keine API): manuelle Prüfung durch SB; ggf. Großmakler-Whitelist',
  'Im VVR als Makler geführt oder auf der Whitelist: der Sachbearbeiter bestätigt (klickt OK).',
  'Nicht als Makler eingetragen: Klärung oder Ablehnung.'],
 ['10 · Hinterlegte MV / VA250\n(situativ)','Ist bereits eine andere / ältere MV hinterlegt oder ein Vermittler zu bereinigen?',
  'VA250 (LEB) · PDB (KV)',
  'Keine konkurrierende MV und saubere Hinterlegung, der Vorgang läuft weiter.',
  'Ältere oder andere MV bzw. zu löschender Eintrag: manuelle VA250-Bereinigung.'],
 ['11 · Widerruf-Check\n(situativ)','Liegt ein Kunden- / Makler-Widerruf zur VNR oder ein widersprüchlicher Verbund vor?',
  'Scout · Image/Jadice',
  'Kein Widerruf und kein Widerspruch, der Vorgang läuft weiter.',
  'Widerruf oder Widerspruch vorhanden: BÜ abbrechen, Aussteuerung.'],
 ['12 · Umfang & weitere Verträge / VNRs','Umfang des BÜ-Wunschs: einzelne VNR oder gesamte Kundenverbindung? Weitere VNRs / Verbünde des Kunden (Mehrfach-Verbund)? Alle auf dieselbe Agenturnummer?',
  'Scout (Außendienstübersicht)',
  'Gesamte Kundenverbindung gewünscht oder weitere VNRs vorhanden: der Bot ermittelt alle Verträge / VNRs / Verbünde des Kunden und durchläuft die Prüfung 6–16 je Vertrag (gleiche AGT).',
  'Nur die genannte VNR gewünscht und keine weiteren Verbünde: nur dieser Vorgang.'],
 ['13 · Agenturnummer aktiv?','Ist die genannte AGT aktiv (inkl. „alte" AgNr vor ZAV), Stammdaten korrekt, als Makler / MfA angebunden?',
  'OB726 · OB510 · OB735 (Bot-Sicht)',
  'AGT aktiv und angebunden: Übertrag auf diese AGT.',
  'AGT inaktiv oder Zahlendreher: Übertrag auf unbesetzte AGT bzw. Klärung.'],
 ['14 · Rahmenvertrag / BÜ-Sperre\n(situativ · KOM·LEB)','Liegt eine BÜ-Sperre via Rahmenvertrag / Sonderkondition (z. B. Rechtsschutz) vor?',
  'Scout (Versicherungsart) · SV001 (Feld „BÜ möglich")',
  'Keine Sperre und „BÜ möglich" ist gesetzt, der Vorgang läuft weiter.',
  'Sperre vorhanden oder unklar: Rücksprache mit der Sparte, gegebenenfalls Ablehnung.'],
 ['15 · Provisionshaftung','Liegt eine offene Provisionshaftung (Vorvermittler) vor, die der BÜ entgegensteht?',
  'KV050 (KV · manuell SB) · BÜ-Bot (LEB)',
  'Keine offene Haftung, der Vorgang läuft weiter.',
  'Offene Haftung: Übertragung nicht möglich, Routing gemäß Richtlinie.'],
 ['16 · Korrespondenzadresse Makler\n(KOM·LEB)','Korrespondenz- / Mailadresse des Maklers für das Bot-Ausgangsschreiben ermitteln',
  'OB729 (via OB510 / PF20) · DiOrg/SAP (Backup)',
  'Adresse ermittelt, sie wird für die Maklerinformation verwendet.',
  'Keine Adresse in OB729: Backup über DiOrg/SAP (KV: Mail über Kontext).'],
]
MX=40
tablew=sum(w for _,w in COLS)
W=tablew+2*MX
SUBT=("Prüfschritte 1–5 (BÜ-Wunsch · MV formal & inhaltlich · Pool/Untervollmacht · Unterschriften) "
      "liegen bereits im KI-Deckblatt vor. Schritt 9 (VVR) erfolgt am Ende als manuelle Bestätigung "
      "(HITL), da Robots im Vermittlerregister nicht zulässig sind.")
sublines=wrap(SUBT, W-2*MX, 13)
TOP=60+len(sublines)*17+14
# pre-wrap + row heights
wrapped=[]; rowh=[]
for r in ROWS:
    cells=[]; mx=0
    for ci,(_,cw) in enumerate(COLS):
        fs=FSH if ci==0 else FS
        lines=wrap(r[ci],cw-2*PADX,fs); cells.append(lines); mx=max(mx,len(lines))
    wrapped.append(cells); rowh.append(mx*LINEH+2*PADY)
HEADH=34
H=TOP+HEADH+sum(rowh)+MX
S=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{int(W)}" height="{int(H)}" font-family="Arial, sans-serif">']
S.append('<rect width="100%" height="100%" fill="white"/>')
def esc(s): return html.escape(s)
# Titel
S.append(f'<text x="{MX}" y="40" font-size="20" font-weight="bold" fill="{GREEN}">Prüfschritte 6–16 — Detailbeschreibung (Blue-Prism-System-Prüfung; Schritt 9 VVR manuell)</text>')
for li,ln in enumerate(sublines):
    S.append(f'<text x="{MX}" y="{60+li*17}" font-size="13" fill="{GREY}">{esc(ln)}</text>')
# Kopfzeile (zweizeilig erlaubt)
x=MX
S.append(f'<rect x="{MX}" y="{TOP}" width="{tablew}" height="{HEADH}" fill="{GREEN}"/>')
for (name,cw) in COLS:
    hlines=wrap(name,cw-2*PADX,FSH)
    for li,ln in enumerate(hlines):
        S.append(f'<text x="{x+PADX}" y="{TOP+15+li*14}" font-size="{FSH}" font-weight="bold" fill="white">{esc(ln)}</text>')
    x+=cw
# Zeilen
y=TOP+HEADH
for ri,cells in enumerate(wrapped):
    rh=rowh[ri]
    if ri%2==1: S.append(f'<rect x="{MX}" y="{y}" width="{tablew}" height="{rh}" fill="{ZEBRA}"/>')
    x=MX
    for ci,(_,cw) in enumerate(COLS):
        lines=cells[ci]; fs=FSH if ci==0 else FS
        col=GREEN if ci==0 else (DARK)
        fw='bold' if ci==0 else 'normal'
        if ci==3: col='#1d6b2f'
        if ci==4: col='#8a2b1f'
        for li,ln in enumerate(lines):
            S.append(f'<text x="{x+PADX}" y="{y+PADY+12+li*LINEH}" font-size="{fs}" font-weight="{fw}" fill="{col}">{esc(ln)}</text>')
        x+=cw
    S.append(f'<line x1="{MX}" y1="{y+rh}" x2="{MX+tablew}" y2="{y+rh}" stroke="{HAIR}" stroke-width="1"/>')
    y+=rh
# vertikale Spaltenlinien
x=MX
for (_,cw) in COLS:
    S.append(f'<line x1="{x}" y1="{TOP}" x2="{x}" y2="{y}" stroke="{HAIR}" stroke-width="1"/>'); x+=cw
S.append(f'<line x1="{x}" y1="{TOP}" x2="{x}" y2="{y}" stroke="{HAIR}" stroke-width="1"/>')
S.append(f'<rect x="{MX}" y="{TOP}" width="{tablew}" height="{y-TOP}" fill="none" stroke="{GREY}" stroke-width="1.2"/>')
S.append('</svg>')
open('table.svg','w').write('\n'.join(S))
print('table.svg', int(W),'x',int(H))
