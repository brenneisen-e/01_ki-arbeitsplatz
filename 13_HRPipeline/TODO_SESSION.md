# HR Pipeline — offene Aufgaben (aus Nutzer-Backlog)

Session-Branch: `claude/show-cv-source-info-pmqgR`

## Bereits erledigt (Commit `c716b48`)
- [x] Strukturierte `cvSections` + `sourceMap` für laura / jonas / peter (`profilesGeneric.js`).
- [x] `techSkills`-Array + `logoDevUrl`-Helper (logo.dev-Logos für Microsoft, JIRA, Adobe, Power BI, Snowflake, …).
- [x] Laura: Interviewfrage zur fehlenden disziplinarischen Führungserfahrung ergänzt (Background + Behavioral).
- [x] Generischer Weiterbildungstext statt Nennung von „Wharton".
- [x] Neue `CvSourceViewer`-Komponente (render CV, Quellen-Highlight, Inline-Edit, Stations hinzufügen, Tech-Logos). Noch nicht eingebunden.

## Noch offen — in dieser Reihenfolge umsetzen

### 1. CV-Quellen-Highlight in der Bewerberansicht verdrahten
- [ ] In `BewerberMode.jsx` den `ResultsSection` um ein zweispaltiges Layout erweitern: links Analyse, rechts `CvSourceViewer`.
- [ ] Beim Hover/Klick auf ein Analyse-Item (`KiSummary`, `strengths`, `skillGap`-Dimension, Score-Balken, Waterfall-Position) die IDs aus `profile.sourceMap` an den Viewer geben → entsprechende Abschnitte werden hervorgehoben.
- [ ] Badge „Quelle anzeigen" an jedem Analyse-Item.

### 2. Bewerbung bearbeiten
- [ ] „Bewerbung anpassen"-Button aktiviert den Edit-Mode von `CvSourceViewer` (bereits vorhanden).
- [ ] Änderungen werden im lokalen State gehalten und beim Absenden an `onProfileSubmitted` übergeben.

### 3. Docked KI-Assistent (rechts angedockt, wie in `14_kreditanalyse/AIChatPanel.jsx`)
- [ ] Neue Komponente `DockedAIAssistant.jsx` (ersetzt den alten `ChatBot.jsx`).
- [ ] Breite 440 px / 620 px nach erster Assistenzantwort, volle Höhe, rechter Panel-Rahmen.
- [ ] Rich-Formatter: `**fett**`, nummerierte Abschnitte, Bullet-Listen, `Quellen:`-Karte (siehe `formatMessageHtml` in kreditanalyse).
- [ ] Getrennte Frage-Sets für Bewerber vs. Recruiter.
  - Bewerber-Start:
    - „Welche Stellen passen zu mir?"
    - „Profil verbessern?"
    - „Wie geht es nach der Bewerbung weiter?"  (neu — Antwort mit Schritt-Liste + Zeitrahmen)
  - Recruiter-Start (neu ergänzen):
    - „Top-3 Kandidaten für [Position X]"
    - „Wie ist der aktuelle Stand für *Senior HR Business Partner*?"
    - „Wie lange ist die Stelle schon ausgeschrieben?"
- [ ] App.jsx: `ChatBot` durch `DockedAIAssistant` ersetzen.
- [ ] CSS in `index.css`: `hp-ai-panel` (rechts angedockt), `hp-ai-msg-bubble` (User vs. Assistant), `hp-ai-sources`-Karte, Suggestion-Chips wie kreditanalyse.

### 4. Erfolgs-Animation nach Bewerbungsabsendung
- [ ] Neuer Zwischenstate `view === 'submitted'` in `BewerberMode`.
- [ ] Full-Screen-Overlay: animiertes Mail-SVG (Umschlag fliegt), Haken-Check, Text „Bewerbung erfolgreich gesendet".
- [ ] Darunter eine Preview-Karte mit der gesendeten Bestätigungs-E-Mail (Absender, Empfänger, Betreff, Body auf Deutsch).
- [ ] Button „Wie geht es weiter?" öffnet den Docked-Assistent mit der passenden Antwort (Next-Steps-Flow siehe oben).

### 5. Recruiter-Ansicht: Duplikate + Einladen-Status
- [ ] In `ArbeitgeberMode.jsx`: `applicants` filtern, damit der als `newApplicantProfile` eingehende Kandidat nicht gleichzeitig in der Liste auftaucht (Dedupe per `id`).
- [ ] Nach `InviteWorkflow.onConfirm` den Status des Applicants im State auf `invited` setzen und den Karten-/Badge-Status „Eingeladen" anzeigen (neuer Status-Badge `invited`, Farbe blau).
- [ ] Toast „Einladung gesendet" bleibt.

### 6. Cockpit-Frühwarnung auf Mitarbeiterebene
- [ ] In `CockpitMode.jsx` → `EarlyWarningView` eine neue Sektion „Individuelle Auffälligkeiten" mit pseudonymisierten / namentlich benannten Mitarbeitern.
- [ ] Felder je Mitarbeiter: Team, Signal (z. B. „Mitarbeiterbefragung negativer als Vorjahr", „niedriger Engagement-Score (FK-Feedback)", „+32 % Krankheitstage"), letzte Aktualisierung, empfohlene Maßnahme.
- [ ] Prominenter Disclaimer: **Hinweis Mitbestimmung** — „Individuelle HR-Analytics unterliegen dem BetrVG (§ 87 Abs. 1 Nr. 6 / § 80 Abs. 1 Nr. 1). Vor produktiver Nutzung ist eine Betriebsvereinbarung mit dem Betriebsrat erforderlich. Darstellung hier ausschließlich als Mockup."
- [ ] Zugriff nur in Demo-Modus, mit Icon `Shield` und rotem Rand.

### 7. Datenkonsistenz & Finetuning
- [ ] `skillGap` für alle Profile ohne Namensnennung externer Programme (analog zu Laura bereits erfolgt) prüfen.
- [ ] `LoadingSection`-Schritte ggf. um „Quellen-Mapping wird erstellt…" ergänzen.
- [ ] `LoadingSection` Schritte + `ui.loadingSteps` deutsch konsistent.

### 8. Styling-Ergänzungen (`13_HRPipeline/src/index.css`)
- [ ] `.cv-sv-*` Klassen (Viewer-Layout, Highlight, Tech-Chips, Edit-Form).
- [ ] `.hp-ai-panel` Panel (rechts), `.hp-ai-msg-*`, `.hp-ai-sources`, `.hp-ai-suggestion`.
- [ ] `.hp-submission-overlay`, `.hp-mail-flying` (CSS-Keyframes für Mail-Flug + Haken).
- [ ] `.hp-status-badge.invited` blau.
- [ ] `.hc-employee-warn-*` (Cockpit-Cards) + `.hc-mitbestimmung-note`.

### 9. Build & Deploy
- [ ] `cd HRPipeline && npm install && npm run build`
- [ ] `dist/` committen (gemäß CLAUDE.md-Konvention).
- [ ] Push auf `claude/show-cv-source-info-pmqgR`.

## Offene Rückfragen / Hinweise
- `logo.dev`-Token `pk_H7vb5Y2lTsW47U4Xq-w3HA` wird verwendet (aus `app.html` übernommen).
- Original-PDFs (`public/cv/*.pdf`) bleiben unverändert; CV-Viewer rendert den strukturierten Text — Link zum Original-PDF vorhanden.
- Beim Absenden „echter" Uploads (anstelle Demo-Profile) gibt es weiterhin kein echtes Parsing; CV-Sections kommen nur für die drei Demo-Profile (laura / jonas / peter).
