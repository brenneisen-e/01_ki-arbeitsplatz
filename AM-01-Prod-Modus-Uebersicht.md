# AM-01 Prod Modus - Sichten & Klickstrecken

## Aktivierung

In den **Settings** (Zahnrad-Icon auf der Startseite) gibt es den Toggle **"AM-01 Prod Modus"**.
- **Toggle AUS**: AM-01 verhält sich wie bisher (klassische Portfolio-Tabelle)
- **Toggle AN**: AM-01 zeigt die neue Prod-Mode Oberfläche

---

## Sichten (Views)

### 1. Welcome Screen
- Profilbild von Doreen Duenscheude
- "Welcome Doreen" mit Name und Rolle (Portfolio Manager)
- Drei KPI-Kacheln: Live Portfolios (735), Requires Attention (5), Draft Orders (12)
- Button "Enter Dashboard" zum Weiter

### 2. Loading Screen
- Progress-Bar mit Statusmeldungen (Loading portfolio data, Connecting to event monitor, etc.)
- Automatischer Übergang zum Dashboard (zeitgesteuert, 5 Steps à 350ms)

### 3. Dashboard - Event Monitor Tab
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
