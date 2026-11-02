import{c as S,d as O,f as W,r as h,N as U,H as G,j as e,b as $,P as q,R as J,a as _,S as T,e as Q}from"./kanal-4p3v2t3J.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=S("Link2Off",[["path",{d:"M9 17H7A5 5 0 0 1 7 7",key:"10o201"}],["path",{d:"M15 7h2a5 5 0 0 1 4 8",key:"1d3206"}],["line",{x1:"8",x2:"12",y1:"12",y2:"12",key:"rvw6j4"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=S("Link2",[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=S("LocateFixed",[["line",{x1:"2",x2:"5",y1:"12",y2:"12",key:"bvdh0s"}],["line",{x1:"19",x2:"22",y1:"12",y2:"12",key:"1tbv5k"}],["line",{x1:"12",x2:"12",y1:"2",y2:"5",key:"11lu5j"}],["line",{x1:"12",x2:"12",y1:"19",y2:"22",key:"x3vr5v"}],["circle",{cx:"12",cy:"12",r:"7",key:"fim9np"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne=S("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=S("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);function ie(r){const n=r.split(`
`),t=[];let a=0;for(;a<n.length;){const s=n[a];if(!s.trim()){a++;continue}if(s.startsWith("# ")){t.push({typ:"h1",text:s.slice(2).trim()}),a++;continue}if(s.startsWith("## ")){t.push({typ:"h2",text:s.slice(3).trim()}),a++;continue}if(s.trim()==="---"){t.push({typ:"hr"}),a++;continue}if(s.startsWith("|")){const o=[];for(;a<n.length&&n[a].startsWith("|");)/^\|\s*-/.test(n[a])||o.push(n[a].replace(/^\||\|$/g,"").split("|").map(p=>p.trim())),a++;t.push({typ:"tabelle",zeilen:o});continue}if(s.startsWith("- ")){const o=[];for(;a<n.length&&(n[a].startsWith("- ")||n[a].startsWith("  "));)n[a].startsWith("- ")?o.push(n[a].slice(2).trim()):o[o.length-1]+=" "+n[a].trim(),a++;t.push({typ:"liste",punkte:o});continue}const l=[];for(;a<n.length&&n[a].trim()&&!/^(#{1,2} |\||- |---$)/.test(n[a]);)l.push(n[a].trim()),a++;t.push({typ:"p",text:l.join(" ")})}return t}function re(r){const n=[[]];for(const t of r)t.typ==="hr"?n.push([]):n[n.length-1].push(t);return{vorspann:n[0]??[],rede:n[1]??[],anhang:n[2]??[]}}const ae=/^(\d+:\d\d)\s+(.+?)\s+\((.+)\)$/,se={vorstellung:"Vorstellung",einstieg:"Bühne",studie:"Studie",hypothesen:"Hypothesen",demo:"Demo",schluss:"Schluss",opening:"Opening",context:"Context",felder:"Four fields",openfinance:"Open Finance",closing:"Closing"};function L(r){const n=r.toLowerCase();return n.includes("opening")?"opening":n.includes("context")?"context":n.includes("four fields")?"felder":n.includes("open finance")?"openfinance":n.includes("closing")?"closing":n.includes("vorstellung")?"vorstellung":n.includes("einstieg")?"einstieg":n.includes("studie")?"studie":n.includes("hypothes")?"hypothesen":n.includes("demo")?"demo":n.includes("schluss")?"schluss":n.replace(/[^a-z0-9äöüß]+/g,"-").replace(/^-|-$/g,"")}function N(r){const n=r.match(ae);if(!n)return null;const t=L(n[2]);return{id:t,marke:n[1],titel:n[2],dauer:n[3],kurz:se[t]??n[2].split(/[\s:]/)[0]}}function oe(r){const n=r.match(/Hypothese\s+(\d)/);return n?`hypothese-${n[1]}`:/Klick auf das Stockwerk/i.test(r)?"einstieg-buehne":null}const le=[/z\. B\./g,/u\. a\./g,/d\. h\./g,/o\. Ä\./g,/i\. d\. R\./g],de=/(?:\bbzw|\bca|\bDr|\bProf|\bNr|\bMio|\bMrd|\bTsd|\bvs|\betc|\binkl|\bggf|\bevtl|\bsog|\busw|z\. B|u\. a|d\. h|o\. Ä|i\. d\. R)\.$/;function he(r){let n=r;for(const l of le)n=n.replace(l,o=>o.replace(/ /g," "));const t=n.split(/(?<=[.!?][“”"’)]?)\s+(?=[„"“(\[A-ZÄÖÜ0-9])/),a=[];for(const l of t){const o=a[a.length-1];o!==void 0&&de.test(o)?a[a.length-1]=o+" "+l:a.push(l)}const s=[];for(const l of a)s.length&&l.split(/\s+/).length<4?s[s.length-1]+=" "+l:s.push(l);return s.map(l=>l.replace(/ /g," "))}const ue=`# Speakernotes Vortrag: Banking Horizon, Stockwerk Markt & Vertrieb

Rahmen: Eike stellt sich vor und startet Banking Horizon mit dem
Einführungsvideo (48 Sekunden). Die Kollegin zeigt das Strukturbild und geht
alle Stockwerke durch. Danach zeigt Eike am Beispiel Markt & Vertrieb, wie
ein Stockwerk aufgebaut ist. Dauer rund 11 Minuten bei ruhigem Tempo;
gesprochen etwa 1.500 Wörter. Dramaturgie: kurze Vorstellung, Einstiegsbühne
(Vertrieb heute, was sich ändert, die Leitfrage der Bühne als Überleitung),
kurz die Studie (USA, für Deutschland konservativer, Botschaft gleich), dann
zwei ausgewählte Hypothesen, im Tool die zweite und die dritte, gesprochen
als erste und zweite (die erste im Tool wird nur durchgeklickt; je
Hypothese: Status quo aus der Praxis, was Digitalisierung und KI in den
nächsten Jahren daraus machen, warum wir daran glauben), am Ende die Antwort
auf die Leitfrage, dann die Demo des KI- Vertriebsarbeitsplatzes mit
Einordnung zu Claude und Salesforce. Wer auf 10 Minuten muss, kürzt in der
Demo die Stammdaten und die Radar-Beispiele auf je einen Satz.

Vorbereitung:

- Strukturbild offen, Stockwerk Markt & Vertrieb per Klick aus der Übersicht
  öffnen, damit die Einstiegsbühne erscheint (ein Deep-Link überspringt sie).
  Reihenfolge im Tool: Bühne, Studie (\`#/vertrieb\`), Hypothesen
  (\`#/vertrieb/1\` bis \`/3\`), Vertriebscockpit (\`#/vertrieb/4\`).
- Das Cockpit lädt im Hintergrund, sobald das Kapitel offen ist. „Vertriebscockpit
  im Vollbild“ schaltet den Browser in echtes Vollbild; Esc beendet es. Die
  Steuerpille oben in der Mitte blendet aus und kommt zurück, wenn der Zeiger
  an die obere Kante fährt. Fallback: Demo-URL in neuem Tab.
- Demo im Banking-Modus, Vorname für die Begrüßung ist hinterlegt. Das
  Institut einmal in den Einstellungen der Demo auf „Zukunftsbank“ stellen,
  die Wahl bleibt im Browser gespeichert.
- Falls es eine Vorstellungsfolie gibt: Name, Rolle, #aipioneer.
- Klickpfad Demo: Landing, Chip „Vertriebs-Cockpit“, Übersicht
  (Agenten-Leiste), KI-Vertriebsassistent unten rechts, Chip „Meine neuen
  Leads“ (erst Denken, dann Zahl mit Sprung zu „Leads“, dann Klaus Fischer
  als Karte mit Foto), „Kunden öffnen“, Reiter „Finanzübersicht“ (externe
  Verknüpfungen mit Consent-Status), Reiter „Leads“, „Kreditgespräch
  Immobilienfinanzierung“ aufklappen (KI-Zusammenfassung mit drei Signalen,
  Liquiditätsverlauf, Zins-Szenarien, Auf einen Blick, Aktionen).

---

## 0:00 Vorstellung (1 Minute)

[Kollegin übergibt. Das Strukturbild bleibt in der Übersicht stehen.]

Ja, auch ein herzliches Willkommen von meiner Seite: Ich bin Eike Brenneisen
und bin seit über fünf Jahren bei Deloitte in der Bankentransformation
unterwegs, aktuell vor allem mit dem Schwerpunkt AI-driven Banking. Ich habe
bei mir #AIPioneer, mit einem kleinen Augenzwinkern, dazugeschrieben. Was
meine ich damit?

Ich nutze Claude Code und OpenAI Codex seit dem Start im Mai 2025 privat und
beruflich zum Bauen von Apps und Websites und habe dabei schnell gemerkt,
dass dieser Teil von KI in einer ganz anderen Liga spielt als die reine
Chatfunktionalität von Copilot oder ChatGPT.

Mittlerweile ist das Thema Agentic AI, spätestens nun auch mit dem Start von
GPT Astra 6 in der letzten Woche, nahezu in allen Technologiedebatten
angekommen.

Deswegen freue ich mich auch sehr auf diesen gemeinsamen Webcast, bei dem
wir auch einen kurzen Einblick geben können, welche Use Cases wir für Banken
durch das neue Technologiezeitalter sehen werden.

Lasst uns gerne direkt in unsere Banking-Horizon-Demo einsteigen. Wir werden
in unserem Webcast heute nicht klassisch PowerPoint-Folien zeigen, sondern
etwas interaktiver unterwegs sein und starten nun einmal direkt mit einem
Introvideo.

[Banking Horizon öffnen, Kachel „Einführung ansehen“: 48 Sekunden Video im
Vollbild, am Ende bleibt das Standbild mit dem Blick auf den Horizont
stehen. Danach übernimmt Marie das Strukturbild.]

## 1:00 Einstiegsbühne: Markt & Vertrieb heute und die Trends (2 Minuten)

[Das Strukturbild bleibt zunächst in der Übersicht stehen.]

Vielen Dank, Marie, für die Vorstellung unseres Bankenstrukturbilds. Hier
steckt in jedem Stockwerk, in jedem Kapitel, ganz viel Leben und viele
spannende Inhalte drin. Da wir leider keine mehreren Stunden für diesen
Webcast haben, konzentrieren wir uns heute auf eines der wichtigsten
Kapitel: Markt und Vertrieb. Denn dort spürt der Kunde den Wandel als
Erstes.

Jedes Stockwerk in unserem Tool ist grundsätzlich ähnlich aufgebaut. Wir
sprechen über die aktuellen Trends, belegen sie mit einer Zahl, formulieren
unsere Hypothesen für die Veränderung bis 2030 und geben zum Abschluss immer
die Antwort auf die Frage „Was heißt das konkret?“. Dafür haben wir in der
Regel ein Tool direkt zum Anfassen.

[Klick auf das Stockwerk Markt & Vertrieb, Kameraflug, Einstiegsbühne mit
dem Raum „Advisory“ steht.]

Vertrieb als solches hat Jahrzehnte ähnlich funktioniert. Zumindest ist das
meine Wahrnehmung: Ich habe selbst 2016 meinen Bankkaufmann bei einer
Regionalbank in Niedersachsen abgeschlossen. Der Vertrieb in 2026 ist zwar
technologisierter und effizienter, aber noch sehr vergleichbar mit dem von
vor zehn Jahren.

Und genau das beginnt sich jetzt zu verändern, durch KI und Technologie. Der
Kunde kommt heute vorbereitet ins Gespräch, weil er sein Anliegen längst mit
einer KI durchgespielt hat, und die Bank sieht mit Open Finance und der
Einwilligung des Kunden erstmals das ganze Bild, auch die Konten und
Verträge bei Dritten.

Gleichzeitig wird KI vom Werkzeug zum Agenten, der erkennt, vorbereitet und
vorschlägt, während die Regulierung am Ende weiterhin einen Menschen
verlangt, der die Entscheidung verantwortet.

[Auf die Leitfrage der Bühne zeigen.]

Und das führt zu der Frage, die hier steht: Wenn die KI den Kunden besser
kennt als jeder Berater, worin liegt dann der Wert des Gesprächs?

Diese Frage nehmen wir mit.

Bevor wir sie mit zwei ausgewählten Hypothesen beantworten, ein kurzer Blick
darauf, was die Kunden selbst sagen.

## 3:00 Die Studie (1 Minute)

[Klick „Zu den Hypothesen“. Die Studien-Folie erscheint.]

Wir haben in diesem Sommer rund zweieinhalbtausend Bankkunden zum Thema
Banking und KI befragt. Und dabei kamen relativ klare Werte heraus: 58
Prozent der KI-Nutzer haben damit schon heute Bankprodukte auf Basis ihrer
eigenen Finanzsituation recherchiert.

Beim Vertrauen sieht es aber noch anders aus. Der Website der eigenen Bank
vertrauen 79 Prozent, der KI 49. Und 83 Prozent wollen nicht, dass ein
KI-Agent ohne ihre Freigabe in ihren Finanzen handelt. 66 Prozent halten das
Fehlerrisiko sogar für größer als den Nutzen.

Die Kunden sagen uns also zwei Dinge auf einmal: Nutzt KI, aber lasst mich
die Kontrolle behalten. Die Bank, die beides schafft, gewinnt.

Die Studie war in den USA. Für Deutschland würde ich die Zahlen noch etwas
konservativer einschätzen, die Botschaft bleibt aber dieselbe.

Und damit stellt sich die Frage: Worin liegt der Wert des Gesprächs, wenn
die KI den Kunden besser kennt? Das schauen wir uns einmal durch zwei
ausgewählte Hypothesen aus diesem Kapitel an.

## 4:00 Zwei Hypothesen (2 Minuten)

[Weiter. Hypothese 1 erscheint: Vom Produktvertrieb zum Lösungsorchestrator.
Direkt weiter.]

[Weiter. Im Tool Hypothese 2: Vom Kundenberater zum KI-augmentierten
Strategieberater.]

Die erste Hypothese: Vom Kundenberater zum KI-augmentierten
Strategieberater.

Heute verbringt der Berater den größten Teil seiner Zeit mit Vorbereitung,
Dokumentation und Systempflege, den kleinsten beim Kunden.

In den nächsten Jahren übernehmen Agenten diese Standardstrecke, von der
Terminvorbereitung bis zum Protokoll. Beim Berater bleibt, was menschliches
Urteil braucht: die komplexe Entscheidung, die Lebenssituation, die
Verantwortung. Gezieltere und komplexere Gespräche statt Standardstrecke.

Warum glauben wir daran? Weil die Kunden die KI zwar vorbereiten lassen, die
Entscheidung aber bei einem Menschen wollen: 83 Prozent wollen jede Aktion
eines Agenten selbst freigeben, 66 Prozent trauen Agenten mehr Fehler als
Nutzen zu. Genau diese Rolle, prüfen, erklären, verantworten, ist der neue
Berater. Keine Verdrängung, sondern Arbeitsteilung.

[Weiter. Im Tool Hypothese 3: Kundenschnittstelle wird permanent und
hyperpersonalisiert.]

Die zweite Hypothese: Die Kundenschnittstelle wird permanent und
hyperpersonalisiert.

Heute ist der Kontakt punktuell und reaktiv: Der Kunde meldet sich bei
Bedarf, die Bank zur Kampagne. Das CRM weiß, was vor drei Jahren
abgeschlossen wurde, aber nicht, was gerade im Leben des Kunden passiert.

Mit Open Finance sieht die Bank das ganze Bild, und Agenten erkennen die
Signale, Gehaltseingang, Umzug, Familienzuwachs, das Angebot der Konkurrenz,
und melden sich im richtigen Moment mit einem passenden Vorschlag. Betreuung
wie beim Privatbankier, nur für alle.

Warum glauben wir daran? Weil Vertrauen mit Nutzung wächst: Wer KI nutzt,
vertraut ihr zu 60 Prozent, wer nicht, zu 19. Vertrauen entsteht also im
täglichen Kontakt, und wer diese Schnittstelle mit verlässlichen Vorschlägen
besetzt, gewinnt es, wer sie anderen überlässt, verliert es.

[Die Leitfrage der Bühne aufgreifen.]

Damit ist auch die Frage vom Anfang beantwortet: Wenn die KI den Kunden
besser kennt als jeder Berater, liegt der Wert des Gesprächs nicht mehr im
Wissen, sondern im Urteil. Die KI kennt die Daten, der Berater kennt den
Menschen dahinter: Er ordnet ein, entscheidet mit ihm und verantwortet das
Ergebnis. Und genau das zeige ich Ihnen jetzt.

## 6:00 Demo KI-Vertriebsarbeitsplatz (4 Minuten)

[Weiter zur Aktivität, „Vertriebscockpit im Vollbild“. Landing mit
„Willkommen zurück“.]

Was heißt das in der Praxis? Das hier ist unser KI-Vertriebsarbeitsplatz,
eine Demo mit synthetischen Daten. Was wir hier gerade sehen, ist die
Landing Page des Beraters. Hier startet man nicht statisch, sondern
flexibel: Mit Chat- oder Voice-Funktion stellt man sich seine Masken und
Workflows dynamisch zusammen. Wir starten mit einer Zusammenfassung,
deswegen gebe ich hier „Zusammenfassung heutiger Tag“ ein und starte so mein
dynamisches Cockpit.

[Eingabe „Zu“, Vorschlag „Zusammenfassung heutiger Tag“ übernehmen.
Übersicht mit der Agenten-Leiste.]

Was ich hier sehe, sind sehr viele Datenkacheln, und über Nacht haben
Agenten gearbeitet: Signale zu Lebenslagen, Abwanderungsrisiken,
Kampagnentreffer, vorbereitete Termine. Der Berater sieht Ergebnisse, nicht
Rohdaten.

[Lebenslagen-Radar: Andrea Lang, Praxis-Erweiterung. Abwanderungsradar:
Stefan Braun.]

Ich sehe hier zum Beispiel im Lebenslagen-Radar, dass meine Kundin Andrea
Lang vermutlich ihre Praxis erweitert hat, mit den Datenpunkten, die zu
dieser Einschätzung geführt haben. Oder bei meinem Kunden Stefan Braun, dass
es ein Abwanderungsrisiko gibt.

Ich kann mir über KI aber auch grundsätzlich neue Vertriebsleads generieren
lassen, und das mache ich hier über meinen KI-Chatbot. Ich gehe einen Weg
mit Ihnen: vom Assistenten zum Kunden zum Lead.

[KI-Vertriebsassistent unten rechts öffnen, Chip „Meine neuen Leads“.]

Ich frage den Assistenten nach meinen neuen Leads. Er nennt die Zahl aus dem
nächtlichen Lauf und zeigt mir auch einen Top-Lead: Klaus Fischer,
Immobilienfinanzierung, mit Kurzfassung. Ein Klick, und ich bin in der Akte.

[„Kunden öffnen“, Reiter „Stammdaten“: Wohnsituation, Haustiere mit
erkannten Umsätzen.]

Hier sehe ich alle Datenpunkte, die inhouse und extern zusammenkommen, und
auch Hinweise aus den Kontotransaktionen, zur Wohnsituation oder zu
möglichen Haustieren. Im Haushaltsprofil kommen weitere Informationen dazu,
etwa erkannte Aktivitäten, die Einfluss auf die Versicherungslage haben
können.

[Reiter „Finanzübersicht“.]

In der Finanzübersicht sehe ich Konten, Depots und Verträge bei meinem
Institut, aber auch bei sieben Fremdinstituten. Mit PSD2 und der
Einwilligung des Kunden ist das schon heute möglich. Die KI rechnet daraus
Anlagevolumen, Kreditvolumen und Nettovermögen und gibt Hinweise, etwa auf
das Klumpenrisiko im Depot. Mit der diskutierten FiDA-Regulierung für den
Austausch von Finanzdaten, die aktuell in der EU auf Eis liegt, kämen per
Consent weitere Daten dazu, etwa zu Versicherungen.

[Reiter „Leads“: Bankprodukte, Anlageprodukte, Versicherungsprodukte.]

Wir wollen nun im Reiter „Leads“ sehen, welche Potenziale es gibt. Je
Cluster stehen hier unterschiedliche Leads, die die KI zu meinem Kunden
identifiziert hat. Und bedenken Sie bitte: Bei einem Kunden wäre es
vielleicht kein Problem, alle Daten im Blick zu haben. Als Bankberater, ob
Retail oder Corporate, hat man aber schnell eine drei-, wenn nicht
vierstellige Anzahl von Kunden, und diese Datenmengen kann eigentlich nur
noch eine KI sauber interpretieren.

[„Kreditgespräch Immobilienfinanzierung“ mit dem Badge „Top-Lead“
aufklappen.]

Wir klappen nun den Lead „Kreditgespräch Immobilienfinanzierung“ auf und
sehen, was die KI hergeleitet hat: drei unabhängige Signale. Die
Kontoumsätze, ein Ratenkredit endet in zwei Monaten, also frei werdende
Liquidität, proaktiv erkannt und nicht reaktiv; ein zuteilungsreifer
Bausparvertrag über 30.000 Euro; und ein Newsletter zu Immobilien, der
regelmäßig geöffnet wird.

[Aktion „Anschreiben formulieren“ zeigen. Dann die Uhr oben rechts im Kopf:
einen Tag weiter. Reiter „Stammdaten“, Aktivitäten: „Kunde hat
Beratungstermin bestätigt“, Klick öffnet die KI-Gesprächsvorbereitung.]

Ich kann den Kunden nun mit KI direkt anschreiben lassen. Wer möchte, lässt
so etwas natürlich über Agenten bereits automatisch laufen. Und wenn ich
jetzt auf den nächsten Tag gehe, sehe ich, dass mein Kunde auf meine Mail
reagiert hat, und mit einem Klick kann ich mir das Gespräch auch noch von
der KI vorbereiten lassen.

[Einordnung, Blick in die Kamera.]

Alles, was wir hier in unserer kleinen Demo gezeigt haben, ist keine
Zukunftsmusik 2030, sondern 2026. Seit einem Monat gibt es zum Beispiel
Claudeforce, Claude von Anthropic als Reasoning-Modell in Salesforce
Agentforce, mit fertigen Vertriebs-Skills. Was Sie hier sehen, lässt sich
also theoretisch heute schon mit Standardtechnologie im CRM einer Bank
bauen.

Die Geschwindigkeit, mit der KI über Konnektoren Einzug in Standardsoftware
hält und dort große Datenmengen sinnvoll strukturiert und interpretiert,
wird weiter zunehmen. Ich habe es eingangs erwähnt: Claude Code und OpenAI
Codex als mächtige KI-Coding-Werkzeuge gibt es erst seit anderthalb Jahren.
Deswegen ist die Debatte über die Nutzung von KI, heute erst wieder bei der
UN, aus meiner Sicht auch vollkommen richtig.

Grundsätzlich wirken diese Themen aber natürlich nicht nur im Bereich
Advisory, also Markt und Vertrieb, und deswegen haben wir unser Strukturbild
mit vielen weiteren Kapiteln ausgestattet.

## 10:00 Schluss (20 Sekunden)

Mein Fazit für dieses Stockwerk in einem Satz: Der Kunde will KI und
Kontrolle zugleich, und der Vertrieb 2030 liefert beides. Agenten, die
erkennen und vorbereiten. Berater, die entscheiden und verantworten. Genau
da liegt der Wert des Gesprächs. Und so ist jedes Stockwerk in Banking
Horizon gebaut: Beleg, Hypothese, Anwendung.

[Übergabe zurück an die Kollegin oder Überleitung in die Diskussion.]

---

## Zahlen für Rückfragen

Deloitte, „How much do bank customers trust gen AI?“ (Deloitte Insights,
27. August 2026, rund 2.600 Bankkunden in den USA):

| Aussage | Wert |
|---|---|
| KI-Nutzer, die Bankprodukte mit generativer KI recherchiert haben | 58 % |
| Nutzen Suchmaschinen für die Recherche | 84 % |
| Vertrauen: Website der eigenen Bank / Suchmaschinen / generative KI / soziale Medien | 79 / 67 / 49 / 28 % |
| Vertrauen der Genauigkeit von KI-Empfehlungen zu Bankprodukten | 46 % |
| Bedenken, die finanzielle Situation mit KI zu teilen | 72 % |
| Befürchten versteckte Voreingenommenheit | 64 % |
| Wären beunruhigt, wenn ein KI-Agent ohne Freigabe handelt | 83 % |
| Fehlerrisiko von KI-Agenten größer als Nutzen | 66 % |
| KI-Recherche: Gen Z / Babyboomer | 65 / 45 % |
| Vertrauen in KI-Empfehlungen: Millennials / Boomer | 55 / 34 % |
| Vertrauen in die Genauigkeit: KI-Nutzer / Nicht-Nutzer | 60 / 19 % |

Deloitte, „The agentic AI productivity wave is heading for wealth
management“ (Financial Services Industry Predictions 2026, 20. Mai 2026):
Berater 70 % Zeit hinter den Kulissen, 30 % beim Kunden; 25 bis 50 % der
Beraterzeit freisetzbar; Produktivitätssteigerung 30 bis 100 % bis 2032
(Stufen rund 32 %, 57 %, 103 %); 73 % der Beratungshäuser nutzen KI, 6 %
agentische Werkzeuge, 5 % systemübergreifend integriert.

Business Case im Tool (illustrativ, Kapitel 02): KI-augmentierte Beratung
plus 25 bis 30 % Beraterproduktivität, plus 10 bis 15 % Ertrag je Kunde, bei
400 Beratern rund 15 bis 20 Mio. EUR pro Jahr.

Anthropic und Salesforce: 14. Oktober 2025, erweiterte Partnerschaft für
regulierte Branchen, Claude als Basismodell der Agentforce-360-Plattform,
branchenspezifische Lösungen beginnend mit Finanzdienstleistern. 26. August
2026, „Claudeforce“: Claude als Reasoning-Modell der Atlas Reasoning Engine,
Standard in Agentforce Vibes und Agentforce Coworker, verfügbar im Agent
Builder; „Salesforce in Claude“ als Plugin mit 37 vorgefertigten
Vertriebs-Skills (Pilot, offene Beta ab September 2026); Claude innerhalb
der Salesforce Trust Boundary über Amazon Bedrock, auch für regulierte
Branchen.

Claude Code: 24. Februar 2025 als Research Preview zusammen mit Claude 3.7
Sonnet veröffentlicht, seit 22. Mai 2025 allgemein verfügbar (vorgestellt
auf der Entwicklerkonferenz „Code with Claude“, zusammen mit Claude Opus 4
und Sonnet 4).

Quellen:

- https://www.deloitte.com/us/en/insights/industry/financial-services/bank-customers-generative-ai-trust.html
- https://www.deloitte.com/us/en/insights/industry/financial-services/financial-services-industry-predictions/2026/agentic-ai-wealth-management-productivity.html
- https://www.salesforce.com/news/press-releases/2025/10/14/anthropic-regulated-industries-partnership-expansion-announcement/
- https://www.salesforce.com/news/press-releases/2026/08/26/salesforce-and-anthropic-announce-claudeforce/
- https://www.anthropic.com/news/salesforce-anthropic-expanded-partnership
- https://www.anthropic.com/news/claude-3-7-sonnet
- https://www.anthropic.com/news/claude-4
`,ce=`# Speaker notes: Claude Code pilot, food for thought (English)

Frame: Eike opens with the plan for today (possibilities of AI including
Claude Code, a short insight into a real demo, a pointer to the hackathon
planned in the background), then gives a short insight in the Claude Code
pilot into what AI can already build today, leads into the Open Finance
prototype and shows the AI sales workstation live. Duration about 9 minutes
at a calm pace, about 1,300 spoken words. Dramaturgy: context first (with AI
we build pitches, workshops and greenfield solutions ourselves; Eike in the
Claude Code pilot, larger company rollout planned; hackathon in Banking in
Q4 or Q1 2027 with Claude Code access for every participant; side note
Copilot and Mindflow for simple click paths and ready-made agents, the
missing backend via Claude Code), then the four fields on one slide
(workflows: used with ERGO for the target process, now in implementation;
video: the Mara scene, presented by Andreas and Stefanie, link into the
chat), then the focus on Open Finance (discussed with many clients, shown
today in the webcast with Marie, FiDA discussions, Claudeforce since a month
ago), then the 4-minute demo with the same click path as in Banking Horizon
2030, closing with the hackathon. Anyone who has to fit into 8 minutes cuts
the master data and the radar examples in the demo to one sentence each and
keeps only the first sentence of each of the four fields.

Preparation:

- Two links ready to paste into the chat: Banking Horizon 2030 itself (for
  the closing) and its Mara scene, route \`#/operations\` (the video runs full
  screen, station by station).
- Deck on slide 1. Second tab: Banking Horizon 2030, language EN, overview
  with the building; the AI sales workstation opens from the chapter "Sales &
  Distribution" (activity "Sales cockpit full screen", banking mode). In the
  workstation once: language EN, first name stored for the greeting,
  institution "Zukunftsbank" in the demo settings; the choice stays in the
  browser.
- Click path demo (as in Banking Horizon 2030): Landing, type "Su" and
  accept "Summary of today", Overview (agent bar), Life-Event Radar and Churn
  Radar, AI Sales Assistant bottom right, chip "My new leads" (first thinking,
  then the number with a jump to "Leads", then Klaus Fischer as a card with
  photo), "Open customer", tab "Master Data", tab "Financial Overview"
  (external links with consent status), tab "Leads", expand "Property
  financing consultation" (AI summary with three signals, liquidity trend,
  rate scenarios, at a glance, actions), "Draft letter", clock in the header
  one day ahead, Master Data activity "Customer confirmed consultation", click
  opens the AI meeting preparation.

---

## 0:00 Opening: what I will do today (30 seconds)

[Slide 1 is up.]

Thank you for having me. I would like to use the next few minutes for three
things. First, a short look at what is already possible with AI today,
including Claude Code, which is coming to all of us. Second, a short insight
into a real demo, so you see what this looks like in practice. And third, a
quick pointer to a hackathon that we are currently planning in the
background. Let me start with the possibilities.

## 0:30 Context: what AI can already build (1 minute)

AI changes how we work: we can now build pitches, workshops and greenfield
solutions ourselves, instead of only describing them on slides. I am
currently part of the Claude Code pilot myself, and through it I have been
able to build quite different things, some of which you see here. As far as
I understand, a larger company rollout is planned. Independently of that, we
are planning a hackathon in Banking in Q4 or maybe in Q1 2027, where every
participant will get Claude Code access to implement new use cases
themselves.

And as a side note: you do not have to wait for that. With Copilot and
Mindflow, simple click paths can already be built today, and there are
ready-made agents there that we can already use. What is missing at that
point is the backend: real data, logic and a working application behind the
screens. And that is exactly what Claude Code makes possible.

## 1:30 Slide 1: Four fields (2 minutes 15)

[Point to the four screenshots from left to right, top to bottom.]

Let me walk you quickly through four fields.

[Point to 01.]

First, interactive workshop formats. This is Banking Horizon 2030, and I
think Moritz and Christopher presented it in the last talent group call: a
bank building you can walk through, where every floor is a chapter with
trends, a data point, our hypotheses and a tool to touch. Marie, Thorsten
Gudjons and I also presented it today in the banking trend webcast. Instead
of forty slides, we walk clients through their own bank of the future.

[Point to 02.]

Second, prototypes of a target system. This is our AI sales workstation for
Open Finance, and I will show it to you live in a moment.

[Point to 03.]

Third, real workflows. We used this one with ERGO to walk through the target
process together with the client: a broker email arrives as free text, AI
structures it, builds a cover sheet, checks it and closes the case. That
target process is now being implemented, and the AI prototype really helped
throughout the entire ideation process.

[Point to 04.]

And fourth, image and video generation. This is the operations scene from
Banking Horizon, a day in the life of Mara in 2030. The scenes and the
transitions between them were generated with AI. Andreas and Stefanie have
now presented it on multiple occasions, with Deutsche Bank and tomorrow with
Ostsächsische Sparkasse Dresden, to show the world of tomorrow in
operations. I will also share the link here in the chat so you can watch it
yourselves. I think it is pretty cool.

[Right column.]

So the message is: AI can now orchestrate and build topics like these really
well. Copilot and Mindflow get you to the click path, and Claude Code adds
the backend and turns it into a working solution. That is where the real
magic happens.

[Hackathon box.]

And the hackathon in Q4, or maybe in Q1 2027, is exactly the place to try
this yourselves. As soon as we have a date and more information, we will
share it accordingly.

## 3:45 Slide 2: Focus on Open Finance (1 minute 15)

[Next slide.]

Now I would like to put the focus on Open Finance, and on a tool that we
have discussed with many clients over the last months to show the value of
AI in sales: our AI sales workstation. We also showcased it in the webcast
today. We used it above all for one thing: discussing Open Finance and AI
potential with clients. FiDA, the proposed EU regulation on Financial Data
Access, which is currently on hold at EU level, is a very abstract debate.
What does access to a customer's external financial data actually change in
sales? With the prototype, that question becomes tangible: signals, next
best actions, meeting preparation.

[Dark box.]

And one thing makes this very current: since a month ago there is
Claudeforce, the partnership between Anthropic and Salesforce. Claude works
inside Salesforce, and Salesforce inside Claude, on live CRM data. So what
you are about to see is not a vision for 2030. It can be built with standard
technology today. Let me show you.

## 5:00 Demo: AI sales workstation (4 minutes)

[Switch to the Banking Horizon tab, overview with the building. Click the
floor "Sales & Distribution", camera flight, entry stage.]

This is Banking Horizon, our interactive tool, and we have a chapter for
advisory, so let us open it. There is also a new study on AI usage covered
in here, and a few statements from our side, but I will jump to our tool
quickly.

[Click "To the hypotheses", straight through the study and the three
hypotheses to the activity "Sales cockpit full screen". Landing page with
"Welcome back".]

This is our AI sales workstation, a demo with synthetic data. What we see
here is the advisor's landing page. You do not start with a static menu but
flexibly: via chat or voice you put together your screens and workflows
dynamically. We start with a summary, so I type "Summary of today" and
launch my dynamic cockpit.

[Type "Su", accept the suggestion "Summary of today". Overview with the
agent bar.]

What I see here are many data tiles, and overnight, agents have been
working: signals about life events, churn risks, campaign matches, prepared
meetings. The advisor sees results, not raw data.

[Life-Event Radar: Andrea Lang, practice expansion. Churn Radar: Stefan
Braun.]

In the Life-Event Radar, for example, I see that my client Andrea Lang has
probably expanded her practice, together with the data points that led to
this assessment. Or for my client Stefan Braun, that there is a churn risk.

[Open the AI Sales Assistant bottom right, chip "My new leads".]

But I can also have AI generate completely new sales leads, and I do that
here via my AI chatbot. The assistant gives me the number from the overnight
run and also shows me a top lead: Klaus Fischer, property financing, with a
short summary. One click, and I am in his file.

["Open customer", tab "Master Data": living situation, pets with detected
transactions.]

Here I see all data points that come together in house and from outside,
including hints from account transactions about the living situation or
possible pets. The household profile adds further information, such as
detected activities that can affect the insurance situation.

[Tab "Financial Overview".]

In the financial overview I see accounts, securities accounts and contracts
at my own institution, but also at seven other institutions. With PSD2 and
the client's consent, this is already possible today. The AI calculates
investment volume, loan volume and net worth, and points out things like the
concentration risk in the securities account. With FiDA, further data would
be added with consent, for example on insurance.

[Tab "Leads": bank products, investment products, insurance products.]

In the Leads tab we now see where the potential lies. Per cluster there are
different leads the AI has identified for this client.

[Expand "Property financing consultation" with the "Top lead" badge.]

Let us expand the lead "Property financing consultation" and see what the AI
has derived: three independent signals. The account transactions show that
an instalment loan ends in two months, so liquidity is freed up, detected
proactively rather than reactively; a building savings contract of 30,000
euros is ready for allocation; and a newsletter on real estate is opened
regularly.

[Show the action "Draft letter". Then the clock top right in the header: one
day ahead. Tab "Master Data", activities: "Kunde hat Beratungstermin
bestätigt", click opens the AI meeting preparation.]

I can now have AI draft a letter to the client directly. Anyone who wants to
can of course let agents run this automatically. And if I now move to the
next day, I see that my client has replied to my email, and with one click
the AI prepares the meeting for me as well.

[Classification, look into the room.]

Everything we have shown in this small demo is not 2030, it is 2026. With
Claudeforce, what you see here can be built today with standard technology
in a bank's CRM.

## 9:00 Closing (30 seconds)

[Back to the deck, slide 1 or 2.]

My takeaway in one sentence: AI no longer just answers, it builds, from the
pitch and the workshop format to the working prototype. The pilot shows what
is possible, and the hackathon is your chance to try it yourselves. Thank
you. I will share the link to Banking Horizon in the chat, and if you have
follow-up questions, please hit me up.

---

## Facts for questions

Claudeforce: announced by Salesforce and Anthropic on 26 August 2026. Claude
works as a reasoning model inside Salesforce, and "Salesforce in Claude" is
a plugin with 37 prebuilt sales skills, among them meeting preparation, deal
health review, pipeline review, drafting emails and updating CRM records.
Available to select pilot customers first, open beta announced for September
2026. Source: Salesforce press release, 26 August 2026.

- https://www.salesforce.com/news/press-releases/2026/08/26/salesforce-and-anthropic-announce-claudeforce/

Earlier step: on 14 October 2025 Anthropic and Salesforce expanded their
partnership for regulated industries, with Claude as a foundation model of
the Agentforce 360 platform and industry solutions starting with financial
services.

FiDA: the proposed EU regulation on Financial Data Access. It would extend
the idea of open banking under PSD2 to further financial data, for example
insurance, investments and pensions, always based on the customer's consent.
The proposal is currently on hold at EU level.

Demo: all data in the AI sales workstation and in Banking Horizon 2030 is
synthetic. The live demo runs in banking mode with the institution
"Zukunftsbank" and the same click path as in the Banking Horizon 2030 talk.
`,ge={"markt-vertrieb":ue,"claude-code-pilot":ce},v=O.map(r=>({...r,markdown:ge[r.id]??""}));function R(){const r=new URLSearchParams(window.location.search).get("skript");let n=null;try{n=localStorage.getItem(W)}catch{}return v.find(t=>t.id===r)??v.find(t=>t.id===n)??v[0]}const me={de:{vorbereitung:"Vorbereitung",anhang:"Zahlen für Rückfragen",rahmen:"Rahmen: ",zurStelle:"Zur aktuellen Stelle",skript:"Skript wählen",folgt:"Folgt dem Strukturbild (F schaltet aus)",folgtNicht:"Folgt nicht (F schaltet ein)",timer:"Timer (T startet und pausiert)",kleiner:"Schrift kleiner (−)",groesser:"Schrift größer (+)",fenster:"Speakernotes"},en:{vorbereitung:"Preparation",anhang:"Facts for questions",rahmen:"Frame: ",zurStelle:"Back to the current spot",skript:"Choose script",folgt:"Follows the structure view (F turns off)",folgtNicht:"Not following (F turns on)",timer:"Timer (T starts and pauses)",kleiner:"Smaller type (−)",groesser:"Larger type (+)",fenster:"Speaker notes"}},M="bh-notizen-schrift",pe=1200;function fe(r){return r?r.kapitel===null?"vorstellung":r.kapitel!=="vertrieb"?null:r.einstieg?document.getElementById("einstieg-buehne")?"einstieg-buehne":"einstieg":r.step===0?"studie":r.step>=1&&r.step<=3?`hypothese-${r.step}`:r.step===4?"demo":"schluss":null}function ke(r){return`${Math.floor(r/60)}:${String(r%60).padStart(2,"0")}`}const be=/(\d[\d.,]*(?: (?:bis|to) \d[\d.,]*)? (?:Prozent|Euro|Bankkunden|percent|euros|clients))/;function we({text:r}){const n=r.split(be);return e.jsx(e.Fragment,{children:n.map((t,a)=>a%2?e.jsx("b",{children:t},a):t)})}function F({text:r}){return e.jsx("ul",{className:"rede",children:he(r).map((n,t)=>e.jsx("li",{children:e.jsx(we,{text:n})},t))})}function ye({bloecke:r}){const n=[];let t=0;for(const a of r){if(a.typ==="h2"){const o=N(a.text);n.push(e.jsxs("h2",{id:o?.id??L(a.text),children:[o?.marke&&e.jsx("span",{className:"marke",children:o.marke}),e.jsx("span",{children:o?.titel??a.text}),o?.dauer&&e.jsx("span",{className:"dauer",children:o.dauer})]},t++));continue}if(a.typ!=="p")continue;const s=a.text;if(/^\[[^\]]*\]$/.test(s)){n.push(e.jsx("p",{id:oe(s)??void 0,className:"regie",children:s.slice(1,-1)},t++));continue}const l=s.match(/^\[([^\]]*)\]\s*(.+)$/);if(l){const o=/^Optional/i.test(l[1]);n.push(e.jsxs("div",{className:`kasten${o?" optional":""}`,children:[e.jsx("span",{className:"etikett",children:l[1].replace(/[.:]$/,"")}),e.jsx(F,{text:l[2]})]},t++));continue}if(/^Die (erste|zweite|dritte) Hypothese:/.test(s)){n.push(e.jsx("p",{className:"titel",children:s},t++));continue}n.push(e.jsx(F,{text:s},t++))}return e.jsx(e.Fragment,{children:n})}function ve({bloecke:r}){return e.jsx(e.Fragment,{children:r.map((n,t)=>{if(n.typ==="h2")return null;if(n.typ==="p")return e.jsx("p",{children:n.text},t);if(n.typ==="liste")return e.jsx("ul",{className:"quellen",children:n.punkte.map((a,s)=>e.jsx("li",{children:/^https?:\/\//.test(a)?e.jsx("a",{href:a,target:"_blank",rel:"noopener noreferrer",children:a}):a},s))},t);if(n.typ==="tabelle"){const[a,...s]=n.zeilen;return e.jsxs("table",{className:"zahlen",children:[e.jsx("thead",{children:e.jsx("tr",{children:a.map((l,o)=>e.jsx("th",{children:l},o))})}),e.jsx("tbody",{children:s.map((l,o)=>e.jsx("tr",{children:l.map((p,k)=>e.jsx("td",{children:p},k))},o))})]},t)}return null})})}function ze(){const[r,n]=h.useState(R),t=me[r.sprache],{vorspann:a,rede:s,anhang:l}=h.useMemo(()=>re(ie(r.markdown)),[r]),o=a.find(i=>i.typ==="h1")?.text??t.fenster,p=h.useMemo(()=>s.flatMap(i=>i.typ==="h2"?[N(i.text)]:[]).filter(i=>i!==null),[s]),k=a.find(i=>i.typ==="p"&&i.text.startsWith(t.rahmen))?.text.slice(t.rahmen.length),I=a.find(i=>i.typ==="liste")?.punkte??[];h.useEffect(()=>{document.title=`${t.fenster} · ${o.replace(/^Speaker ?notes(?: Vortrag)?:\s*/i,"")}`},[o,t.fenster]),h.useEffect(()=>{try{localStorage.setItem(W,r.id)}catch{}const i=new URL(window.location.href);i.searchParams.get("skript")!==r.id&&(i.searchParams.set("skript",r.id),window.history.replaceState(null,"",i),window.scrollTo(0,0))},[r]);const[c,m]=h.useState(()=>{try{return Number(localStorage.getItem(M))||20}catch{return 20}});h.useEffect(()=>{try{localStorage.setItem(M,String(c))}catch{}},[c]);const[b,w]=h.useState(!1),[A,B]=h.useState(0);h.useEffect(()=>{if(!b)return;const i=window.setInterval(()=>B(d=>d+1),1e3);return()=>window.clearInterval(i)},[b]);const[z,D]=h.useState(!0),C=h.useRef(z);C.current=z;const[y,j]=h.useState(null),[P,K]=h.useState(!1),E=h.useRef(0),x=h.useCallback(i=>{const d=document.getElementById(i);d&&(E.current=Date.now(),d.scrollIntoView({behavior:"smooth",block:"start"}),K(!1))},[]);h.useEffect(()=>{const i=new BroadcastChannel(U),d=f=>{try{i.postMessage(f)}catch{}};d({typ:"offen"});const u=window.setInterval(()=>d({typ:"offen"}),G);i.onmessage=f=>{f.data?.typ==="scroll"&&(Date.now()-E.current<pe||window.scrollBy({top:f.data.deltaY,behavior:"auto"}))};const g=()=>d({typ:"zu"});return window.addEventListener("pagehide",g),()=>{window.clearInterval(u),window.removeEventListener("pagehide",g),g(),i.close()}},[]),h.useEffect(()=>{const i=()=>{try{const g=localStorage.getItem(T);return g?JSON.parse(g):null}catch{return null}},d=g=>{const f=fe(g);if(f){if(j(f),!C.current){K(!0);return}x(f)}};if(!r.folgtStrukturbild){j(null),K(!1);return}d(i());const u=g=>{g.key===T&&d(i())};return window.addEventListener("storage",u),()=>window.removeEventListener("storage",u)},[x,r]),h.useEffect(()=>{const i=d=>{d.target instanceof HTMLInputElement||d.target instanceof HTMLTextAreaElement||(d.key==="+"&&m(u=>Math.min(36,u+2)),d.key==="-"&&m(u=>Math.max(14,u-2)),(d.key==="t"||d.key==="T")&&w(u=>!u),(d.key==="f"||d.key==="F")&&D(u=>!u))};return window.addEventListener("keydown",i),()=>window.removeEventListener("keydown",i)},[]);const Z=i=>y!==null&&(y===i.id||i.id==="hypothesen"&&y.startsWith("hypothese-")||i.id==="einstieg"&&y==="einstieg-buehne");return e.jsxs(e.Fragment,{children:[e.jsxs("header",{className:"kopf",children:[e.jsxs("div",{className:"kopfZeile",children:[e.jsx("select",{className:"skriptWahl",value:r.id,onChange:i=>n(v.find(d=>d.id===i.target.value)??v[0]),"aria-label":t.skript,title:t.skript,children:v.map(i=>e.jsx("option",{value:i.id,children:i.titel},i.id))}),e.jsx("span",{className:"timer",title:t.timer,children:ke(A)}),e.jsx("button",{type:"button",className:"knopf",onClick:()=>w(i=>!i),"aria-label":b?"Timer pausieren":"Timer starten",title:b?"Timer pausieren (T)":"Timer starten (T)",children:b?e.jsx($,{size:15}):e.jsx(q,{size:15})}),e.jsx("button",{type:"button",className:"knopf",onClick:()=>{w(!1),B(0)},"aria-label":"Timer zurücksetzen",title:"Timer zurücksetzen",children:e.jsx(J,{size:15})}),e.jsx("span",{className:"trenner"}),e.jsx("button",{type:"button",className:"knopf",onClick:()=>m(i=>Math.max(14,i-2)),"aria-label":t.kleiner,title:t.kleiner,children:e.jsx(te,{size:15})}),e.jsx("span",{className:"schriftWert",children:c}),e.jsx("button",{type:"button",className:"knopf",onClick:()=>m(i=>Math.min(36,i+2)),"aria-label":t.groesser,title:t.groesser,children:e.jsx(_,{size:15})}),r.folgtStrukturbild&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"trenner"}),e.jsx("button",{type:"button",className:"knopf","data-an":z||void 0,onClick:()=>D(i=>!i),"aria-label":t.folgt,title:z?t.folgt:t.folgtNicht,children:z?e.jsx(X,{size:15}):e.jsx(Y,{size:15})}),y&&P&&e.jsxs("button",{type:"button",className:"knopf zurStelle",onClick:()=>x(y),children:[e.jsx(ee,{size:14})," ",t.zurStelle]})]})]}),e.jsx("nav",{className:"chips","aria-label":"Abschnitte",children:p.map(i=>e.jsxs("button",{type:"button",className:"chip","data-aktiv":Z(i)||void 0,onClick:()=>x(i.id),title:`${i.titel} (${i.dauer})`,children:[e.jsx("span",{className:"chipMarke",children:i.marke}),i.kurz]},i.id))})]}),e.jsxs("main",{style:{fontSize:c},children:[e.jsxs("details",{className:"vorspann",children:[e.jsx("summary",{children:t.vorbereitung}),k&&e.jsx("p",{children:k}),e.jsx("ul",{children:I.map((i,d)=>e.jsx("li",{children:i},d))})]}),e.jsx(ye,{bloecke:s}),e.jsxs("details",{className:"anhang",children:[e.jsx("summary",{children:t.anhang}),e.jsx(ve,{bloecke:l})]})]})]})}const V="bh-notizen-zugang",H="13ce54915d78cc23e2010f4715ff741baa89d3b248da570e8fef5cd6e66fc719";function Se(){try{return localStorage.getItem(V)===H}catch{return!1}}function Ie(){return typeof crypto<"u"&&!!crypto.subtle}async function xe(r){const n=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(r));return Array.from(new Uint8Array(n),t=>t.toString(16).padStart(2,"0")).join("")}async function Ae(r){const n=await xe(r.trim());if(n!==H)return!1;try{localStorage.setItem(V,n)}catch{}return!0}const Ke={de:{titel:"Speakernotes",text:"Die Notizen sind geschützt. Bitte das Kennwort eingeben.",feld:"Kennwort",knopf:"Öffnen",falsch:"Das Kennwort stimmt nicht.",unsicher:"Die Prüfung braucht eine sichere Verbindung (https oder localhost)."},en:{titel:"Speaker notes",text:"The notes are protected. Please enter the password.",feld:"Password",knopf:"Open",falsch:"That password is not correct.",unsicher:"The check needs a secure connection (https or localhost)."}};function Be({sprache:r,children:n}){const[t,a]=h.useState(Se),[s,l]=h.useState(""),[o,p]=h.useState(!1),[k,I]=h.useState(!1),c=Ke[r];if(t)return e.jsx(e.Fragment,{children:n});const m=Ie(),b=async w=>{if(w.preventDefault(),!m||k||!s)return;I(!0);const A=await Ae(s);if(I(!1),A){a(!0);return}p(!0),l("")};return e.jsx("div",{className:"zugang",children:e.jsxs("form",{className:"zugangKarte",onSubmit:b,children:[e.jsx("div",{className:"zugangIcon","aria-hidden":"true",children:e.jsx(ne,{size:18})}),e.jsx("h1",{children:c.titel}),e.jsx("p",{children:m?c.text:c.unsicher}),e.jsxs("label",{className:"zugangFeld",children:[e.jsx("span",{children:c.feld}),e.jsx("input",{type:"password",autoFocus:!0,autoComplete:"current-password",value:s,disabled:!m,"aria-invalid":o||void 0,onChange:w=>{l(w.target.value),p(!1)}})]}),o&&e.jsx("p",{className:"zugangFehler",role:"alert",children:c.falsch}),e.jsx("button",{type:"submit",className:"knopf zugangKnopf",disabled:!m||k||!s,children:c.knopf})]})})}Q.createRoot(document.getElementById("root")).render(e.jsx(h.StrictMode,{children:e.jsx(Be,{sprache:R().sprache,children:e.jsx(ze,{})})}));
