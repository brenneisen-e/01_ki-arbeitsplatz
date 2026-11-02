# -*- coding: utf-8 -*-
"""Baut die Zielprozess-Erklärung als Plaintext (.txt, neutrale Dokumentfassung) und
als HTML-EML mit persönlichem Einleitungstext an Dirk (Aptos, echte Bullets,
Prozessbild inline + als Anhang, Excel-Anhang, PDF-Anhang).
Eingang im Zielprozess: Mail geht wie bisher ein -> Umleitung an das neue
Gruppenpostfach bustrukturierung@ergo.de -> dort strukturiert ein Action Workflow
von Celonis (KI-Deckblatt je Vorgang + Excel über alle Vorgänge) und übergibt die
Daten an Robotics (Blue Prism) zum Prüfen."""
from email.message import EmailMessage
from email.utils import formatdate
from email import policy
import os

GREEN="#046A38"; DG2="#26890D"; GREY="#53565A"; DARK="#1A1A1A"
FONT="Aptos, 'Aptos Display', Calibri, 'Segoe UI', sans-serif"

INTRO=("Der Prüf-Bot automatisiert die Prüfung von Bestandsübertragungs-Anfragen (BÜ) von Maklern. Im Zielprozess wird "
       "jede eingehende Mail über einen Celonis Action Workflow strukturiert und als Datensatz an Robotics übergeben; "
       "der Bot (Blue Prism) prüft sie regelbasiert gegen die relevanten Hostsysteme, bündelt das Ergebnis in einem "
       "digitalen Prüfdeckblatt und übergibt saubere Vorgänge an den bestehenden BÜ-Bot.")
ABGRENZUNG=("Neu gegenüber heute: Die eingehende Mail wird an das neue Gruppenpostfach bustrukturierung@ergo.de "
       "umgeleitet, in dem ein Action Workflow von Celonis sie automatisch strukturiert (KI-Deckblatt je Vorgang plus "
       "Excel über alle Vorgänge) und an Robotics übergibt — anstelle der heutigen manuellen, unstrukturierten Indizierung.")
LESE=("Lesehilfe: „Heute“ = aktueller Start (Freigabe durch den Sachbearbeiter). „Zielbild“ = spätere Ausbaustufe "
      "(Direktübergabe an den Roboter). Mit „(offen)“ markierte Punkte sind noch nicht final entschieden.")

# Persönlicher Einleitungstext — nur in der EML (die reine TXT-Fassung bleibt neutral)
COVER_TO="Dirk"
COVER_GREETING="Hallo Dirk,"
COVER_P1=("anbei der aktuelle Diskussionsstand zum Sollprozess des BÜ-Prüf-Bots (Schritt für Schritt, fachlich und "
          "technisch). Bitte pflege ihn wie besprochen in Adonis ein und melde dich im Anschluss bei Frau Juraschek, "
          "damit auf dieser Basis die PDD-Entwicklung endlich losgehen kann.")
COVER_P2="Das Prozessbild sowie eine Excel mit allen Prozessschritten habe ich zusätzlich angehängt."
COVER_SIG_L1="Viele Grüße"
COVER_SIG_L2="Eike"

phases=[
 ("Phase 1 — Eingang und Umleitung an die Strukturierung","Die BÜ-Anfrage kommt herein und wird der automatischen Strukturierung zugeführt.",[
   ("Die BÜ-Anfrage geht wie bisher per Mail ein.","Outlook"),
   ("Die Mail wird an das neue Gruppenpostfach bustrukturierung@ergo.de umgeleitet, in dem ein Action Workflow von Celonis sitzt.","Gruppenpostfach bustrukturierung@ergo.de, Celonis Action Workflow"),
 ]),
 ("Phase 2 — Strukturierung durch den Celonis Action Workflow","Aus der Mail entsteht ein strukturierter, maschinenlesbarer Vorgang, der an Robotics übergeben wird.",[
   ("Der Action Workflow strukturiert die Mail (OCR der Dokumente) und reichert Partnerdaten an.","Celonis, Image/Jadice (OCR), EMMA (PNR / Partnerdaten)"),
   ("Er erzeugt zwei Artefakte: das KI-Deckblatt je Vorgang und eine Excel über alle Vorgänge. Das Deckblatt deckt bereits die Prüfschritte 1-5 ab (BÜ-Wunsch, MV formal und inhaltlich, Pool/Untervollmacht, Unterschriften).",None),
   ("Weiche - BÜ-Wunsch vorhanden? Nein: kein BÜ-Vorgang (raus aus der Kette). Ja: die strukturierten Daten werden an Robotics übergeben.","Übergabepunkt offen: ERGO Datapool, SharePoint oder anderes - Ansprechpartner Celonis: Stefan Schwarz"),
 ]),
 ("Phase 3 — Prüf-Bot: Einzelprüfung und digitales Prüfdeckblatt (Blue Prism)","Jeder Vorgang wird vollständig und regelbasiert gegen die Hostsysteme geprüft.",[
   ("Der Bot holt den strukturierten Vorgang vom Übergabepunkt ab und übernimmt ihn - Umfang laut Wunsch: einzelne VNR oder die gesamte Kundenverbindung (dann ermittelt der Bot selbst alle VNRs/Verbünde und prüft jeden Vertrag).","Blue Prism"),
   ("Der Bot durchläuft die System-Prüfschritte 6-16 je Vertrag (u. a. Vertrag aktiv, Vertrags-Identität, Vermittler-Status, hinterlegte MV, Widerruf, weitere VNRs, Agenturnummer, Rahmenvertrag/Sperre, Provisionshaftung, Korrespondenzadresse).","Scout, IS100, OB726/510/735/729, KV050, VA210/250, PDB, SV001, DiOrg/SAP"),
   ("Schritt 9 (Untermakler im Vermittlerregister VVR) erfolgt manuell durch den Sachbearbeiter (Human-in-the-Loop), da Robots im VVR nicht zulässig sind.",None),
   ("Der Bot erstellt das digitale Prüfdeckblatt: das Ergebnis ALLER Prüfungen (1-16) je Vertrag als eine einheitliche Entscheidungsgrundlage.",None),
 ]),
 ("Phase 4 — Kriterien-Matrix und Cockpit (Human-in-the-Loop)","Automatische Entscheidung, wie mit dem Vorgang zu verfahren ist. Grundlage: eine fachlich definierte Matrix (HS / KBI / ODPB) stuft jedes Kriterium als hart, weich oder optional ein.",[
   ("Hartes Kriterium verletzt: automatische Absage mit Begründung an den Makler.",None),
   ("Weiches Kriterium verletzt: der Vorgang wird geflaggt und manuell durch einen Menschen geprüft - geplant über ein Robotics Cockpit, in dem der Mitarbeiter vor dem Postkorb entscheidet: freigeben oder ablehnen (Cockpit = Idee; Machbarkeit durch das RCC zu prüfen).",None),
   ("Alle Kriterien erfüllt oder nur optionale verletzt: positiver Vorgang.",None),
 ]),
 ("Phase 5 — Postkorb über EMWS (zwei Weichen)","Für jeden Vorgang wird der Postkorbvorgang eröffnet und ergebnisabhängig behandelt.",[
   ("Der Postkorbvorgang wird über das EMWS eröffnet.","EMWS"),
   ("Abgelehnt: der Vorgang erhält ein Direktablagekennzeichen und wird direkt archiviert (keine weitere Bearbeitung, Ende).",None),
   ("Positiv: der Postkorbvorgang wird mit ALLEN Prüfinformationen und einer Notiz eröffnet. Die Notiz dient der Beladung des bestehenden BÜ-Bots.",None),
 ]),
 ("Phase 6 — Übergabe an den BÜ-Bot (heute vs. Zielbild)","Der positive Vorgang wird ausgeführt - heute mit Freigabe, im Zielbild direkt.",[
   ("Heute: Die Notiz wird als Entwurf für den Sachbearbeiter eingestellt, damit der Vorgang noch geprüft werden kann; der Sachbearbeiter prüft und gibt die Notiz frei (HITL).",None),
   ("Zielbild: Richtig geprüfte Vorgänge werden über einen IKS-Prozess direkt an den Roboter übergeben - ohne manuelle Freigabe.",None),
   ("Ausführung: der bestehende BÜ-Bot führt die Übertragung aus (1515 KOM/LEB bzw. BeMaS 2011 KV, inkl. 72h-Vorabinformation bei AO-Bestand); Abschluss: Bot-Ergebnis-QS (Schritt 18) und Maklerinformation über Contex.",None),
 ]),
]
HEUTE_ZIEL=[
 ("Heute","Der Bot prüft und bereitet vor; die Notiz geht als Entwurf an den Sachbearbeiter, der final freigibt. Der Mensch behält die Kontrolle."),
 ("Zielbild","Sauber geprüfte Vorgänge laufen ohne manuelle Freigabe über einen IKS-Prozess direkt in den Roboter. Der Mensch greift nur noch bei geflaggten Fällen ein."),
]
OFFEN=[
 "Übergabepunkt Celonis zu Robotics: ERGO Datapool, SharePoint oder anderes (Ansprechpartner: Stefan Schwarz).",
 "Robotics Cockpit (weiche Fälle) und Roboter-Notiz als Entwurf: technische Machbarkeit durch das Robotics Competence Center zu prüfen.",
 "Kriterien-Matrix (hart/weich/optional): fachliche Definition durch HS / KBI / ODPB.",
 "Zugriffsart auf die Hostsysteme (API vs. Oberfläche), Zielsystem der Notiz und Versandweg der Absage: im Rahmen der PDD-/ODD-Entwicklung zu klären.",
]

# ---------- Plaintext ----------
def line(w=70): return "="*w
P=["BÜ-PRÜF-BOT — ZIELPROZESS SCHRITT FÜR SCHRITT (fachlich und technisch)",""]
P+=["KURZ-EINORDNUNG",INTRO,"",ABGRENZUNG,"",LESE,""]
for title,ziel,steps in phases:
    P+=[line(),title.upper(),"Ziel: "+ziel,""]
    for text,sysinfo in steps:
        s="  - "+text
        if sysinfo: s+="  [System: "+sysinfo+"]"
        P.append(s)
    P.append("")
P+=[line(),"HEUTE VS. ZIELBILD - AUF EINEN BLICK"]
for k,v in HEUTE_ZIEL: P.append("  - "+k+": "+v)
P+=["","OFFENE PUNKTE"]
for o in OFFEN: P.append("  - "+o)
plain_doc="\n".join(P)+"\n"
open("BUE_Pruefbot_Zielprozess_Schritt_fuer_Schritt.txt","w",encoding="utf-8").write(plain_doc)
# EML-Plaintext = persönlicher Einleitungstext an Dirk + neutrale Dokumentfassung
cover_plain="\n".join([COVER_GREETING,"",COVER_P1,"",COVER_P2,"",COVER_SIG_L1,COVER_SIG_L2,"",line(),""])
plain_mail=cover_plain+plain_doc

# ---------- HTML ----------
H=[f'<div style="font-family:{FONT}; font-size:11pt; color:{DARK}; line-height:1.45;">']
# Persönlicher Einleitungstext an Dirk
H.append(f'<p style="margin:0 0 10px 0;">{COVER_GREETING}</p>')
H.append(f'<p style="margin:0 0 10px 0;">{COVER_P1}</p>')
H.append(f'<p style="margin:0 0 10px 0;">{COVER_P2}</p>')
H.append(f'<p style="margin:0 0 14px 0;">{COVER_SIG_L1}<br>{COVER_SIG_L2}</p>')
H.append('<hr style="border:none; border-top:1px solid #C9CDD1; margin:0 0 16px 0;">')
H.append(f'<p style="font-size:17pt; font-weight:bold; color:{GREEN}; margin:0 0 3px 0;">BÜ-Prüf-Bot — Zielprozess Schritt für Schritt</p>')
H.append(f'<p style="color:{GREY}; margin:0 0 12px 0;">Fachlich und technisch, vom Eingang bis zur Übergabe an den bestehenden BÜ-Bot.</p>')
H.append(f'<p style="margin:0 0 10px 0;">{INTRO}</p>')
H.append(f'<p style="margin:0 0 10px 0; padding:8px 12px; background:#F4F7F4; border-left:3px solid {GREEN};">{ABGRENZUNG}</p>')
H.append(f'<p style="margin:0 0 14px 0; color:{GREY};"><i>{LESE}</i></p>')
H.append('<p style="margin:0 0 16px 0;"><img src="cid:prozessbild" alt="BÜ-Prüf-Bot Prozessbild" style="width:100%; max-width:720px; border:1px solid #C9CDD1;"></p>')
for title,ziel,steps in phases:
    H.append(f'<p style="font-size:13pt; font-weight:bold; color:{GREEN}; margin:16px 0 2px 0;">{title}</p>')
    H.append(f'<p style="margin:0 0 5px 0; color:{DG2};"><i>Ziel: {ziel}</i></p>')
    H.append('<ul style="margin:0 0 10px 0; padding-left:22px;">')
    for text,sysinfo in steps:
        li=f'<li style="margin-bottom:5px;">{text}'
        if sysinfo: li+=f' <span style="color:{GREY};">System: {sysinfo}.</span>'
        H.append(li+'</li>')
    H.append('</ul>')
H.append(f'<p style="font-size:13pt; font-weight:bold; color:{GREEN}; margin:18px 0 2px 0;">Heute vs. Zielbild — auf einen Blick</p>')
H.append('<ul style="margin:0 0 10px 0; padding-left:22px;">')
for k,v in HEUTE_ZIEL: H.append(f'<li style="margin-bottom:5px;"><b>{k}:</b> {v}</li>')
H.append('</ul>')
H.append(f'<p style="font-size:13pt; font-weight:bold; color:{GREEN}; margin:18px 0 2px 0;">Offene Punkte</p>')
H.append('<ul style="margin:0 0 10px 0; padding-left:22px;">')
for o in OFFEN: H.append(f'<li style="margin-bottom:5px;">{o}</li>')
H.append('</ul></div>')
html_body="\n".join(H)

# ---------- EML ----------
pol=policy.default.clone(refold_source='none')
m=EmailMessage(policy=pol)
m['From']='Eike Brenneisen <ebrenneisen@deloitte.de>'
m['To']=COVER_TO
m['Subject']='BÜ-Prüf-Bot — Sollprozess (Diskussionsstand) zur Einpflege in Adonis'
m['Date']=formatdate(localtime=True); m['X-Unsent']='1'
m.set_content(plain_mail, subtype='plain', charset='utf-8', cte='8bit')
m.add_alternative(html_body, subtype='html', charset='utf-8', cte='8bit')
m.get_payload()[1].add_related(open('BUE_Pruefbot_Prozessbild.png','rb').read(),'image','png',cid='prozessbild')
# Anhänge: Prozessbild (als Datei), Excel (alle Prozessschritte), PDF (Sollbild + Detailtabelle)
m.add_attachment(open('BUE_Pruefbot_Prozessbild.png','rb').read(),maintype='image',subtype='png',filename='BUE_Pruefbot_Prozessbild.png')
m.add_attachment(open('BUE_Pruefbot_Prozessschritte.xlsx','rb').read(),maintype='application',subtype='vnd.openxmlformats-officedocument.spreadsheetml.sheet',filename='BUE_Pruefbot_Prozessschritte.xlsx')
m.add_attachment(open('BUE_Pruefbot_Prozess_final.pdf','rb').read(),maintype='application',subtype='pdf',filename='BUE_Pruefbot_Prozess.pdf')
open('BUE_Pruefbot_Zielprozess.eml','wb').write(bytes(m))
att=[p.get_filename() for p in m.iter_attachments() if p.get_filename()]
print('txt + eml neu ·', os.path.getsize('BUE_Pruefbot_Zielprozess.eml')//1024,'KB · Phasen:',len(phases),'· An:',COVER_TO,'· Anhänge:',att)
