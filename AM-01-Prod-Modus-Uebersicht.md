# AM-01 Prod Modus - Sichten, Klickstrecken & Gap-Analyse

## Aktivierung

In den **Settings** (Zahnrad-Icon auf der Startseite) gibt es den Toggle **"AM-01 Prod Modus"**.
- **Toggle AUS**: AM-01 verhält sich wie bisher (klassische Portfolio-Tabelle)
- **Toggle AN**: AM-01 zeigt die neue Prod-Mode Oberfläche

---

## Gap-Analyse: PDF-Anforderungen vs. Implementation

> Abgleich der PDF-Slides (1–3) der Kollegin (Ursprungs-Screenshots aus A-02 mit Textbox-Annotationen
> für AM-Benennung) gegen die aktuelle Implementation. Stand: 24.02.2026

### Dashboard KPI-Kacheln (PDF Slide 1)

| # | Frage | Antwort | Status |
|---|-------|---------|--------|
| 1 | Die KPI-Kacheln im PDF haben Subtitel ("Neugeschäft YTD", "Storno-Quote") und Trend-Indikatoren (+5.7%, +10.8%). Sollen diese 1:1 übernommen werden? | **Nein.** Die PDF-Werte waren Platzhalter aus dem Versicherungstool (A-02). Die Kollegin hat mit Textboxen auf dem A-02-Screenshot markiert, wie es im AM-Tool heißen soll — die Subtitel und Trends aus dem Versicherungskontext sind nicht zu übernehmen. Aktuell implementiert: `Live Portfolios (735)`, `Requires Attention (dynamisch)`, `Draft Orders (12)`, `Cash Changes (8)`, `Completed Today (dynamisch)`. KPI-Kacheln könnten bei Bedarf AM-spezifische Subtitel bekommen (z.B. "Live Portfolios — live, +5 since last week"). | Geklärt |
| 2 | "Requires Attention" als eigene KPI steht nicht im PDF-Mockup. Bewusste Ergänzung? | **Ja, bewusste Ergänzung.** Im AM-Kontext ist das der zentrale Call-to-Action. Zeigt dynamisch die Anzahl der Workflows mit `status: 'attention'`. Wichtigster Indikator für den PM morgens. | Geklärt |
| 3 | "Progress" und "Amount" als Tabellenspalten stehen nicht im PDF. Sollen sie raus? | **Nein, bewusste Ergänzungen, beide sinnvoll.** "Progress" zeigt den Fortschritt als Dot-Timeline + "2/7"-Label — gibt dem PM auf einen Blick, wo der Workflow steht. "Amount" zeigt das Cashflow-Volumen; bei SOD Breaks und Rebalances steht "-". Für den PM essential. **Empfehlung: drinlassen.** | Geklärt |

### Workflow-Automatisierung (PDF Slide 2)

| # | Frage | Antwort | Status |
|---|-------|---------|--------|
| 4 | Die konkreten Step-Bezeichnungen (0/3, 1/3, etc.) — sind die in der Timeline sichtbar? | **Ja, vollständig sichtbar.** Im Modal werden alle Steps als vertikale Timeline gerendert mit Status `completed`/`current`/`upcoming`. In der Info-Grid steht "Progress: 4 / 7 steps". In der Tabellenzeile sieht man die Dot-Timeline mit Label "4/7". Jeder Step hat ein **Auto/Manual-Tag** (blau/gelb). | Umgesetzt |
| 5 | Der Drei-Stufen-Flow (Approve PTC → 4-eye check → Send orders) — wird das korrekt abgebildet oder zu einem "Advance"-Klick vereinfacht? | **Jetzt korrekt umgesetzt.** Cashflow-Workflows haben 7 Steps: 4 automatische (Wait → Publish → Optimize → Run PTC) + 3 manuelle (Approve PTC overrides → Request 4-eye check → Send orders). Pro Klick wird ein Step vorgerückt. Die manuellen Steps erfordern jeweils einen eigenen Modal-Approval-Zyklus. | Umgesetzt |
| 6 | Nach "Send orders" — wandert Portfolio automatisch von "Requires Attention" nach "Completed"? | **Ja, passiert automatisch.** Sobald `wf.step >= wf.totalSteps`: `status` wechselt auf `'completed'`, `action` auf `'Completed'`. Die Tabelle filtert nach Status, Portfolio erscheint sofort in der "Completed"-Tabelle. | Umgesetzt |

### Chatbot (PDF Slide 3)

| # | Frage | Antwort | Status |
|---|-------|---------|--------|
| 7 | Welche 4 Chatbot-Vorschläge sind implementiert? | 1. "Show me all portfolios with status trade required" 2. "Show me all draft orders" 3. "Which portfolios need attention today?" 4. "Show cash drift summary" — Die ersten zwei kommen aus dem PDF, die letzten zwei sind Ergänzungen. | Geklärt |
| 8 | Soll der Chatbot-Header "Active Equities Agent" heißen (wie auf PDF S.9)? | **Ja, umbenannt.** Header ist jetzt **"Active Equities Agent"** (vorher "Portfolio Assistant"). Placeholder: "Ask me about portfolios, cashflows, or workflows..." | Umgesetzt |

### Klickstrecken & fehlende Flows

| # | Frage | Antwort | Status |
|---|-------|---------|--------|
| 9 | Cashflow-Tab: Kann man dort auch den Workflow advancing machen? | **Ja, jetzt implementiert.** Cashflow-Zeilen sind klickbar und öffnen das Workflow-Modal für den zugehörigen Cashflow-Workflow (Verknüpfung über `portfolioId`). Kompletter Approval-Flow wie im Event Monitor. | Umgesetzt |
| 10 | SOD-Tab: Was passiert beim Klick auf einen SOD-Alert der Manual Review braucht? PDF S.8/9 beschreibt Chatbot mit prepopulated Prompts. | **Jetzt implementiert.** Klick auf "Manual Review"-Zeile öffnet den Chatbot automatisch mit: vorausgefüllter Analyse-Nachricht, portfolio-spezifischer Daten-Tabelle (NAV Delta, Position Count, Cash Balance für S0174901; Position Mismatch für S0174909), Empfohlene Aktionen als Text, und zwei Action-Buttons ("Mark as Change Reason A" / "Mark as Change Reason B"). | Umgesetzt |
| 11 | Kontextmenü: "Pause Workflow" und "Reset Workflow" — was passiert danach? | **Jetzt implementiert.** "Pause" → setzt Status auf `'paused'`, Action auf "Paused" (gelbes Badge), Workflow bleibt in "Requires Attention"-Tabelle. "Reset" → setzt Step auf 0, Status auf `'attention'`, Action auf ersten Step-Label (z.B. "Wait for all cashflows"). "View Portfolio" → wechselt zum Portfolios-Tab. "Advance Workflow" → öffnet jetzt das Approval-Modal (statt direkt zu advancen). | Umgesetzt |
| 12 | Error Handling: Kein Flow für Fehler definiert (Approval schlägt fehl, Netzwerkfehler). | **Nicht implementiert.** Da alles Mock-Daten sind, treten keine Fehler auf. Für eine Demo/Präsentation ist das OK. Für Produktion bräuchte es Error-States im Modal und in der Loading-Animation. | Offen (Demo OK) |
| 13 | Loading Screen → Dashboard: Zeitgesteuert oder event-basiert? Error State? | **Zeitgesteuert.** 5 Steps à 350ms (Loading portfolio data → Connecting to event monitor → Syncing cashflow data → Preparing workflows → Ready). Nach dem letzten Step 300ms Pause, dann Dashboard. **Kein Error State** — bei echten API-Calls bräuchte man Timeout + Fehlermeldung. | Geklärt (Demo OK) |

### Zusammenfassung der Gaps

| Gap | Kritikalität | Status |
|-----|-------------|--------|
| KPI-Kacheln Subtitel/Trends | Niedrig (Platzhalter aus A-02) | Geklärt — nicht übernommen |
| Drei-Stufen manueller Flow | **Hoch** | **Umgesetzt** (7 Steps mit Auto/Manual) |
| SOD-Tab + Chatbot-Integration | **Hoch** | **Umgesetzt** (Analyse + Action-Buttons) |
| Chatbot-Naming | Mittel | **Umgesetzt** ("Active Equities Agent") |
| Cashflow-Tab interaktiv | Mittel | **Umgesetzt** (klickbar → Modal) |
| Kontextmenü Pause/Reset | Niedrig | **Umgesetzt** |
| Error Handling | Niedrig (Demo) | Offen — für Demo nicht nötig |

---

## Sichten (Views)

### 1. Welcome Screen ("Welcome Doreen")
Erste Sicht nach Klick auf die Asset Management Kachel (bei aktivem Prod Modus).

**Layout (zentriert, vertikal):**
```
┌─────────────────────────────────────────┐
│                                         │
│            [Profilbild rund]            │
│          Doreen Duenscheude             │
│                                         │
│          Welcome Doreen                 │
│       Doreen Duenscheude                │
│         Portfolio Manager               │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │   735    │ │    5     │ │    12    ││
│  │Live Port.│ │Req.Attn. │ │Draft Ord.││
│  └──────────┘ └──────────┘ └──────────┘│
│                                         │
│       [ Enter Dashboard  → ]            │
│                                         │
└─────────────────────────────────────────┘
```

- **Profilbild**: Rundes Foto von Doreen Duenscheude (1623835026886.jpg)
- **Titel**: "Welcome Doreen" (h1)
- **Untertitel**: "Doreen Duenscheude" (Vollname)
- **Rolle**: "Portfolio Manager"
- **3 KPI-Kacheln** (nebeneinander):
  - Live Portfolios: **735**
  - Requires Attention: **5**
  - Draft Orders: **12**
- **Button**: "Enter Dashboard →" → startet Loading-Animation

### 2. Loading Screen
Übergangsanimation nach Klick auf "Enter Dashboard".

**Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│         [Chart-Icon]                    │
│  Portfolio Management Dashboard         │
│                                         │
│  ████████████████░░░░░░░░  65%          │
│  Syncing cashflow data...               │
│                                         │
└─────────────────────────────────────────┘
```

- **Logo**: Chart-Icon + "Portfolio Management Dashboard"
- **Progress-Bar**: Füllt sich schrittweise (5 Steps à 350ms):
  1. 20% — "Loading portfolio data..."
  2. 45% — "Connecting to event monitor..."
  3. 65% — "Syncing cashflow data..."
  4. 85% — "Preparing workflows..."
  5. 100% — "Ready"
- Nach 100%: 300ms Pause → automatischer Übergang zum Dashboard
- Kein Error State (Demo-Kontext)

### 3. Dashboard - Event Monitor Tab
Hauptansicht nach dem Loading. Header mit Profil-Info oben rechts.

**Dashboard-Header:**
```
┌─────────────────────────────────────────┐
│ [Chart] Active Equities  ●LIVE   [Avatar] Doreen  [← Back] │
└─────────────────────────────────────────┘
```
- Links: "Active Equities" Logo + grüner LIVE-Punkt
- Rechts: Profilbild + "Doreen" + "Back"-Button (zurück zur Startseite)

**Tab-Leiste:** Event Monitor | Cashflows | SOD | Portfolios

**Inhalt:**
- **KPI-Zeile**: Live Portfolios, Requires Attention, Draft Orders, Cash Changes, Completed Today
- **Requires Attention Tabelle**: Workflows mit `status: attention` oder `status: paused`
- **Completed Tabelle**: Abgeschlossene Workflows
- Jede Zeile zeigt: Workflow ID, Portfolio, Event, **Action (klickbar → Modal)**, Progress (Schritte), Amount
- Action Badges sind klickbar und öffnen das Approval-Modal

### 4. Dashboard - Cashflows Tab
- **KPI-Zeile**: Total Cashflows, Inflows, Outflows, Pending, Completed
- **Pending Cashflows Tabelle**: ID, Portfolio, Type (Inflow/Outflow), Amount, Value Date, Status, Progress
- **Completed Tabelle**: Abgeschlossene Cashflows
- **Zeilen sind klickbar** → öffnet das Workflow-Modal für den zugehörigen Cashflow-Workflow

### 5. Dashboard - SOD Tab (Start-of-Day)
- **KPI-Zeile**: SOD Alerts, Manual Review, Auto-Resolved, Total Items, High Severity
- **Requires Manual Review Tabelle**: Portfolio, Change Reason, Severity, Items, Status
  - **Zeilen sind klickbar** → öffnet Chatbot mit vorausgefüllter SOD-Analyse
  - Chatbot zeigt portfolio-spezifische Analyse (NAV Delta, Position Count, etc.)
  - Action-Buttons: "Mark as Change Reason A", "Mark as Change Reason B"
- **Auto-Resolved Tabelle**: Automatisch gelöste SOD-Alerts (nicht klickbar)

### 6. Dashboard - Portfolios Tab
- **KPI-Zeile**: Total Portfolios, Total AUM, Active, With Orders, Avg Cash %
- **Portfolio-Übersicht Tabelle**: ID, Portfolio, CCY, AUM, Cash %, Drift, Status, Orders

### 7. Chatbot Panel ("Active Equities Agent")
- Header: **"Active Equities Agent"**
- Beim Aufrufen des Dashboards direkt geöffnet (520×640px)
- "How can I help you today?" mit 4 vordefinierten Vorschlägen
- Interaktive Antworten mit Tabellen-Daten
- SOD-Integration: Wird automatisch mit Analyse befüllt wenn SOD-Zeile geklickt wird

---

## Klickstrecken (User Flows)

### A. Hauptnavigation
```
Startseite → Settings → AM-01 Prod Modus Toggle AN
→ Asset Management Kachel klicken
→ Welcome Screen
→ "Enter Dashboard" klicken
→ Loading Animation (5 Steps, zeitgesteuert)
→ Dashboard (Event Monitor Tab) + Chatbot direkt geöffnet
```

### B. Tab-Wechsel
```
Dashboard → Tab "Cashflows" klicken → Cashflow-Sicht
Dashboard → Tab "SOD" klicken → SOD-Sicht
Dashboard → Tab "Portfolios" klicken → Portfolio-Übersicht
Dashboard → Tab "Event Monitor" klicken → Zurück zur Workflow-Sicht
```

### C. Workflow Action Klick (Approval-Flow) — Cashflow-Beispiel
```
Event Monitor Tab → Action Badge klicken (z.B. "Draft", "Awaiting approval")
→ Modal öffnet sich mit:
   - Portfolio-Info (Name, ID, Event, Amount)
   - Workflow Progress Timeline (7 Steps für Cashflow):
     ┌─ AUTOMATISCH ─────────────────────────────┐
     │ 0. Wait for all cashflows          [Auto]  │
     │ 1. Publish cash & check portfolio  [Auto]  │
     │ 2. Optimize portfolio              [Auto]  │
     │ 3. Run PTC                         [Auto]  │
     ├─ MANUELL ─────────────────────────────────┤
     │ 4. Approve PTC overrides          [Manual] │
     │ 5. Request 4-eye check            [Manual] │
     │ 6. Send orders                    [Manual] │
     └────────────────────────────────────────────┘
   - Aktueller Schritt Beschreibung + Auto/Manual Tag
   - Vorschau auf nächste Action
→ "Approve & Advance" klicken
→ Bestätigungs-Zusammenfassung:
   - Workflow ID, Portfolio, Previous Action, New Action, Amount
→ "Confirm & Execute" klicken
→ Lade-Animation (Validating → Updating → Syncing)
→ Erfolgs-Meldung mit Action-Übergang (alter Badge → neuer Badge)
→ "Done" klicken → Modal schließt, Tabelle aktualisiert
→ Nach letztem Step ("Send orders"): Portfolio wandert automatisch
  von "Requires Attention" nach "Completed" (status: completed)
```

### D. Cashflow-Tab Klick
```
Cashflows Tab → Zeile klicken (z.B. "CF-001 AI and Robotics...")
→ Öffnet das gleiche Workflow-Modal wie in Klickstrecke C
→ Verknüpfung über portfolioId zum zugehörigen Workflow
→ Kompletter Approval-Flow wie oben
```

### E. SOD-Tab mit Chatbot-Integration
```
SOD Tab → "Manual Review" Zeile klicken (z.B. "AI and Robotics Equity Fund")
→ Chatbot öffnet sich automatisch mit:
   - User-Nachricht: "Analyze SOD break for [Portfolio] ([ID]) - [Change Reason]"
   - Agent-Antwort: Portfolio-spezifische Analyse-Tabelle
     (z.B. NAV Delta, Position Count, Cash Balance mit Expected/Actual/Diff)
   - Empfohlene Aktionen als Text
   - Zwei Action-Buttons:
     - "Mark as Change Reason A" → sendet Chat-Nachricht
     - "Mark as Change Reason B" → sendet Chat-Nachricht
→ Weiter-Chat möglich für tiefere Analyse
```

### F. Workflow Zeile aufklappen
```
Event Monitor Tab → Workflow-Zeile klicken
→ Detail-Panel klappt auf mit:
   - Workflow Steps (completed/current/upcoming)
   - "Approve & Advance" Button (bei attention) oder "View Details" (bei completed)
→ Erneut klicken → Detail-Panel schließt
```

### G. Kontextmenü
```
Event Monitor Tab → "..." Button in Workflow-Zeile klicken
→ Kontextmenü mit:
   - View Portfolio → Wechselt zum Portfolios-Tab
   - Advance Workflow → Öffnet Approval-Modal (Klickstrecke C)
   - Pause Workflow → Setzt Status auf "Paused" (gelbes Badge),
     Workflow bleibt in "Requires Attention" Tabelle
   - Reset Workflow → Setzt Step auf 0, Status auf "attention",
     Action auf ersten Step-Label (z.B. "Wait for all cashflows")
→ Option auswählen oder außerhalb klicken zum Schließen
```

### H. Chatbot
```
Dashboard → Chatbot ("Active Equities Agent") ist direkt geöffnet (rechts unten)
→ 4 vordefinierte Vorschläge:
   1. "Show me all portfolios with status trade required"
   2. "Show me all draft orders"
   3. "Which portfolios need attention today?"
   4. "Show cash drift summary"
→ Vorschlag klicken ODER Frage eintippen
→ Agent antwortet mit Text + Tabelle
→ Weitere Fragen stellen
→ "X" klicken → Chat schließen
→ "How can I help?" Button klicken → Chat wieder öffnen
```

### I. Zurück zur Startseite
```
Dashboard → "Back" Button (Header rechts)
→ Zurück zur Startseite/Landing Page
```

---

## Workflow-Schritte pro Event-Typ

### Cashflow (7 Steps)
| Step | Label | Typ |
|------|-------|-----|
| 0 | Wait for all cashflows | Auto |
| 1 | Publish cash & check portfolio | Auto |
| 2 | Optimize portfolio | Auto |
| 3 | Run PTC | Auto |
| 4 | Approve PTC overrides | **Manual** |
| 5 | Request 4-eye check | **Manual** |
| 6 | Send orders | **Manual** |

### SOD Break (2 Steps)
| Step | Label | Typ |
|------|-------|-----|
| 0 | Investigate change | - |
| 1 | Resolve & confirm | - |

### Rebalance (3 Steps)
| Step | Label | Typ |
|------|-------|-----|
| 0 | Analyze drift | - |
| 1 | Optimize allocation | - |
| 2 | Run PTC & trade | - |

---

## Datenübersicht

| Bereich | Anzahl Einträge |
|---------|----------------|
| Workflows (Event Monitor) | 8 (5 Attention, 3 Completed) |
| Cashflows | 8 (7 Pending, 1 Completed) |
| SOD Alerts | 6 (2 Manual Review, 4 Auto-Resolved) |
| Portfolios | 8 |
| Chatbot Vorschläge | 4 |
| Chatbot SOD-Analysen | 2 portfolio-spezifisch (S0174901, S0174909) |

---

## Workflow-Status Übersicht

| Status | Badge-Farbe | Bedeutung |
|--------|-------------|-----------|
| attention | — | Erfordert manuellen Eingriff |
| paused | Gelb | Workflow pausiert (via Kontextmenü) |
| completed | Grün | Workflow abgeschlossen |
