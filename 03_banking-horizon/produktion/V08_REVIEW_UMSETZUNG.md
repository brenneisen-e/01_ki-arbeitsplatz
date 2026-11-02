# v08 — was aus dem Review vom 25.08.2026 geworden ist

Grundlage: die 25 Kommentare und 5 Textfassungen aus der Review-Datenbank der
v07 (`/api/review`, Cloudflare KV) plus das Besprechungstranskript
„Review Feedback AI Vision Video" vom 25.08.2026, 07:31.

**v07 bleibt unverändert stehen** — Bilder, Wege, Texte und alle Kommentare.
v08 liegt daneben unter `/v08` bzw. `#/v08`.

---

## 1. Der Dreiklang heißt anders — und ist ein Vierklang, wo Kunden betroffen sind

Aus der Datenbank (s0): „Evidence & So What: Wording anpassen", „‚So What'
ändern in ‚Business Impact'". Aus dem Transkript: „So what klingt so ein
bisschen wie: heute habe ich nicht meine Hausaufgaben gemacht. So what?" und
„Evidence ist so ein bisschen, wo man sich fragt, was wir damit meinen."

| v07 | v08 |
|---|---|
| What changed | **Setting** — was man in dieser Szene überhaupt sieht, deskriptiv |
| Evidence | **On the screen** — was die Zahlen auf dem Bildschirm bedeuten |
| So what | **Business impact** — Autonomie und Human-in-the-Loop |
| — | **Client impact** — nur dort, wo Kunden wirklich betroffen sind |

Die vierte Marke steht auf 08:00, 08:05 und 08:10. Felix' Einwand („dann wird
das vielleicht ein bisschen zu breit, das ist noch mal eine andere Zielgruppe")
ist damit berücksichtigt: die Kundensicht kommt dort, wo sie etwas aussagt,
und sonst nicht.

**07:45 hat keinen Dreiklang mehr**, sondern eine einzige Marke. Eike: „auf der
07:45-Szene kann man es vielleicht sogar auch weglassen … die Szene spricht ja
für sich selber."

Technisch: Die Marke hängt jetzt am Beleg (`V08_BELEGE` in
`src/operationstag/v08.ts`), nicht mehr an seiner Position. Deshalb kann jede
Station so viele Marken tragen, wie sie braucht.

---

## 2. Der Overnight Report ist mit dem restlichen Tag verzahnt

Der schwerste Befund. Aus dem Transkript: „die ganzen Themen sind gar nicht
gelinkt zu dem, was wir dann in den späteren Szenen beschreiben … dass alles,
was da in diesem Overnight Report steht, sich in den späteren Szenen auch
wiederfindet."

Jede Zeile auf dem Telefon (`ui/handy_v08.html`) nennt jetzt selbst die
Uhrzeit, an der sie wiederkommt:

| Zeile im Report | kommt wieder |
|---|---|
| 99.4 % autonomous resolution | 08:00 |
| 5,284 cases resolved overnight | 08:00, 09:00, 16:00 |
| 3 patterns need your review | 08:15 |
| 168 remedies awaiting budget approval | 08:05, 08:10 |
| 7 detected / 4 resolved / 3 held back | 08:00, 16:00 |
| Agent workforce operating normally, 120 instances | 16:00 |
| Meeting briefing 09:00 | 09:00 |

Umgesetzte Einzelkommentare aus der Datenbank:

- „Top of the phone screen — ‚Overnight' → ‚Overnight Report'" ✔
- „First Box → ‚Overnight change to Performance'" mit den vier Unterpunkten ✔
- „Instead of ‚All fleets nominal' — ‚Agent workforce is operating normally'" ✔
  (Transkript: „All fleets nominal klingt mega spacy … ob die Leute das
  verstehen")
- „‚One pattern building in card disputes' → ‚Three patterns detected and
  escalated, awaiting review'" ✔
- „For your Judgement … dann ersetzen durch ‚Meeting Briefing für das in Szene
  09:00 stattfindende Team-Meeting'" ✔

---

## 3. Die Pattern-Zahlen stimmen jetzt

Aus der Datenbank (home, s1): „Wir zeigen 128 patterns detected, davon wurden
96 resolved overnight und 3 eskaliert. Was passiert mit den restlichen 29
patterns? Die Größenordnung fühlt sich hoch an." Und: „Würde vorschlagen wir
passen es auf die im screen dargestellten 7 patterns an."

Transkript: „Wir haben 7 Patterns detected, wir haben 4 resolved und 3
Judgments."

→ Überall **7 detected, 4 resolved, 3 escalated**. Die Tabelle um 08:00 zeigt
alle sieben; es bleibt keines unerklärt.

---

## 4. 08:05 zeigt alle Fälle, nicht einen

Aus der Datenbank (s2): „Ich würde vorschlagen wir passen die Storyline so an,
dass Mara hier die Budgets für alle Fälle der Szene 08:10 approved. Wir könnten
hier einen Link zum Operations/Case Budget herstellen." Und: „Die Budgets pro
Fall sind sehr hoch, wir sollten diese nach unten anpassen, auf ca. 2–25 EUR
pro Fall."

Transkript (Felix): „unten in der Ecke hast du das Gesamtbudget, was man
ausgeben würde. Und da würde ich vielleicht noch daneben legen, was die Bank
als Budget eingeplant hat."

Der Bildschirm zeigt jetzt:

- **neun namentliche Kunden** mit was passiert ist und was der Agent vorschlägt,
- je Fall **2 bis 25 EUR**,
- unten rechts **2,450 EUR vorgeschlagen gegen 3,000 EUR Tagesbudget**,
- **168 betroffene Kunden** insgesamt — die neun sind die, die um 08:10 auf den
  Kacheln erscheinen, mit denselben Beträgen.

Die Textfassung aus der Datenbank („… fairness and cost to serve" **ohne** die
2.450 EUR) ist übernommen: die Summe steht jetzt dort, wo sie hingehört — beim
Stapel, nicht beim Einzelfall.

---

## 5. Eine durchgehende Storyline von 08:15 bis 14:00

Aus dem Transkript: 08:15 ein eskaliertes Pattern → 09:00 Team-Meeting zu genau
diesem Pattern → ein Agent findet selbst einen Weg → 10:30 Mara prüft den Weg →
Three Lines of Defense laufen in Echtzeit mit, während sie die Garnishment-Logik
anpasst → Freigabe auf alle Agenten. „Ich würde die Szene 14:00 vor die 11:15
schieben … einfach 11:15 und 14:00 ist getauscht."

Der rote Faden in v08 ist **ein einziger Fall**, der sich durch den Tag zieht:

| Zeit | Was passiert |
|---|---|
| 07:00 | Der Report nennt drei eskalierte Patterns |
| 08:00 | Sieben Patterns, vier gelöst, drei eskaliert — eines davon: Garnishment-Freibetrag zu niedrig, weil Unterhaltsberechtigte aus der Akte statt aus dem Melderegister gelesen wurden |
| 08:15 | Mara öffnet genau dieses Pattern; 34 Fälle, Evidenz fertig zusammengestellt, zwei offene Fragen |
| 09:00 | Team-Meeting hat dieses Pattern auf der Tagesordnung, dazu die Kapazität der sechs Agentenrollen |
| 10:30 | Ein Agent hat selbst einen Weg gefunden: Melderegister-Abfrage mitten im Fall, Freibetrag neu gerechnet — 660 EUR pfändbar werden zu 130 EUR |
| **11:15** | Sie passt die Garnishment-Logik an; **2nd und 3rd Line prüfen live mit** (in v07 war das 14:00) |
| **14:00** | Sie zertifiziert v4.2 → v4.3. Geändert wird genau die eine Regel: „Retrieve dependants from the population register" (in v07 war das 11:15) |

Die Reihenfolge ist getauscht, **ohne dass ein Video neu erzeugt werden musste**:
die Räume und Wege bleiben, nur der Inhalt der Bildschirme und der Texte wandert.

Weitere umgesetzte Kommentare:

- s3: „Um es konsistent mit dem Briefing in Szene 07:00 zu machen würde ich auf
  dem Screen … eins der eskalierten Patterns" ✔
- s4: „‚1,582 decisions handled overnight; one agent flagged for attention' →
  wir zeigen hier keinen geflaggten Agent. Alternativ: Wir machen die
  aufgedeckten Pattern zum Thema des Team-Meeting oder eine Kapazitätsplanung"
  ✔ — beides steht jetzt auf der Wandanzeige
- s5: „Was reviewed Mara hier einen Case, eine Decision, einen Pattern? Der Link
  würde der Storyline helfen … In der Folgeszene approved sie das Vorgehen und
  updated darauf basierend die Garnishmentlogik" ✔
- s7: „Wir ziehen diesen Screen vor den 11:15 Screen. Und ändern den Screen in
  einen Screen der die vorgesehenen Änderungen an der Garnishment Policy in
  Real-Time durch 2nd und 3rd Line Agents überprüfen lässt" ✔

---

## 6. 15:30 — Behördenanfrage im Claude-Arbeitsstil

Aus der Datenbank (s8): „so that Mara is uploading a request (PDF-FILE) from
the Tax Authorities. The Agent reads the Document and then summarizes the
task/request and asks Mara for general directions/questions. Similar to a
claude-work environment look. The Agent then displays the upcoming milestones."

Aus dem Transkript zusätzlich: Verifikation der Behörde, beide Kanäle (Brief
heute, Schnittstelle morgen), und die RACI-Kette mit Namen, Abteilung und
Zeitstempel („der Felix aus der Finance … vor 3 Stunden schon bestätigt. Und
jetzt liegt die Anfrage bei dir, Mara").

Der Bildschirm zeigt jetzt: den eingescannten Brief mit Aktenzeichen,
„Sender authenticated" und „Legitimate interest established", den Chatverlauf
zwischen Agent und Mara (Zusammenfassung, zwei Rückfragen, ihre Antwort), die
Meilensteine bis zur Einreichung — und die Freigabekette Finance → Legal →
Data Protection → Operations mit Zeitstempeln.

---

## 7. 16:00 — Charts, die etwas sagen

Aus der Datenbank (s9): „Die Charts oben und rechts wirken informationsarm. Wir
könnten oben anpassen, indem wir beispielsweise Aktivität messen (bspw. 2
Agenten haben keine Aufgaben mehr) oder die in der Vorszene gezeigten KPIs zu
patterns und contact avoidance Rate."

Der Bildschirm zeigt jetzt Auslastung je Agentenrolle, **zwei Agenten ohne
offene Arbeit** (weil die Fixes des Vormittags ihre Ursache beseitigt haben),
und die Zahlen des Tages: 7 / 4 / 3, 5,284, 168 · 2,450 EUR. Die freie
Kapazität ist kein Personalthema, sondern eine Planungsfrage — genau der Punkt
der These.

---

## 8. Übernommene Textfassungen aus der Datenbank

| Station | Alt | Neu |
|---|---|---|
| home | „shares little more than its name with the job she trained for in 2018" | „**What awaits her there would be barely recognizable to the banker who began her career in 2018.**" (Option B) |
| s0 | Hypothese mit langem Gedankenstrich („sieht nach Copilot aus") | mit einfachem Bindestrich |
| s7 → s6 | „the three lines of defense will lose their relevance" | „the three lines of defense **work in real-time**" (nach Andreas Reus' Feedback) |
| s9 | „reading exceptions" | „**resolving** exceptions" |
| s10 | „Not one task today was case work." | „Not one task today was **standardized** case work." |
| s2 | „… cost to serve — 2,450 EUR." | ohne den Betrag; die Summe steht jetzt beim Stapel |

---

## 9. Behobener Fehler: Pfeiltasten im Review-Modus

Aus dem Transkript: „immer wenn du die Pfeiltasten benutzt hast beim Schreiben,
dann wechselt er auch in die nächste Szene … manchmal sind die Kommentare in
der falschen Szene abgespeichert."

Die Tastensteuerung ignoriert Pfeiltasten und Escape jetzt, solange der Fokus
in einem Eingabefeld liegt (`OperationsTag.tsx`). Das gilt für **alle**
Fassungen, auch v07 — es ist ein Fehler, keine Fassungsfrage.

---

## 10. Die Kommentare der v07 bleiben erhalten

Beide Fassungen teilen sich denselben Review-Speicher. Damit sich die Stände
nicht vermischen, tragen die Notizen und Textfassungen der v08 einen eigenen
Schlüsselraum (`v08:s3` statt `s3`). Ergebnis:

- In v07 steht jeder Kommentar unverändert dort, wo das Team ihn hinterlassen
  hat.
- v08 beginnt mit einem leeren Review-Bereich.
- Gelöscht wurde nichts.

---

## Offen — braucht Bildgenerierung

Aus der Datenbank (s3, s4), zweimal notiert: „@Eike: Können wir Holo-AI Agenten
hinter den jeweiligen menschlichen Mitarbeitern darstellen, um die Mixed
Workforce zu zeigen und zu zeigen, dass jeder Mitarbeiter eigene Agents führt?"

Das ist die eine Änderung, die **nicht** über einen Bildschirmtausch geht: die
Teamraum-Szene um 09:00 müsste neu generiert werden. Der Text der Szene nennt
die Agentenreihen bereits („Behind each person at the table stands the agent
team they lead"), das Bild noch nicht.

---

## Wie v08 neu gebaut wird

```bash
export SCRATCH=/pfad/zum/arbeitsverzeichnis
cp produktion/takes_v07/roh7_t_*.mp4 "$SCRATCH/"
mkdir -p "$SCRATCH/kling_v08"
cp "$SCRATCH/roh7_t_glas1.mp4" "$SCRATCH/kling_v08/glas1.mp4"

produktion/ui/alle_rendern_v08.sh     # Oberflaechen als Bildfolgen
python3 produktion/stills_v08.py      # Standbilder
python3 produktion/montage_v08.py     # Wege
npm run build                         # dist/ aktualisieren
```

Die Roh-Takes der v07 werden unverändert wiederverwendet — es wird kein Video
neu generiert. Wer nur einen Bildschirm ändern will, ändert
`produktion/ui/stationen_v08.py`, erzeugt daraus `stationen_v08.html` und lässt
die drei Schritte erneut laufen.
