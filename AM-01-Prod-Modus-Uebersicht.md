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
- Automatischer Übergang zum Dashboard

### 3. Dashboard - Event Monitor Tab
- **KPI-Zeile**: Live Portfolios, Requires Attention, Draft Orders, Cash Changes, Completed Today
- **Requires Attention Tabelle**: Workflows die manuellen Eingriff brauchen
- **Completed Tabelle**: Abgeschlossene Workflows
- Jede Zeile zeigt: Workflow ID, Portfolio, Event, Action, Progress (Schritte), Amount

### 4. Dashboard - Cashflows Tab
- **KPI-Zeile**: Total Cashflows, Inflows, Outflows, Pending, Completed
- **Pending Cashflows Tabelle**: ID, Portfolio, Type (Inflow/Outflow), Amount, Value Date, Status, Progress
- **Completed Tabelle**: Abgeschlossene Cashflows

### 5. Dashboard - SOD Tab (Start-of-Day)
- **KPI-Zeile**: SOD Alerts, Manual Review, Auto-Resolved, Total Items, High Severity
- **Requires Manual Review Tabelle**: Portfolio, Change Reason, Severity, Items, Status
- **Auto-Resolved Tabelle**: Automatisch gelöste SOD-Alerts

### 6. Dashboard - Portfolios Tab
- **KPI-Zeile**: Total Portfolios, Total AUM, Active, With Orders, Avg Cash %
- **Portfolio-Übersicht Tabelle**: ID, Portfolio, CCY, AUM, Cash %, Drift, Status, Orders

### 7. Chatbot Panel
- Beim Aufrufen des Dashboards direkt geöffnet
- "How can I help you today?" mit vordefinierten Vorschlägen
- Interaktive Antworten mit Tabellen-Daten

---

## Klickstrecken (User Flows)

### A. Hauptnavigation
```
Startseite → Settings → AM-01 Prod Modus Toggle AN
→ Asset Management Kachel klicken
→ Welcome Screen
→ "Enter Dashboard" klicken
→ Loading Animation
→ Dashboard (Event Monitor Tab)
```

### B. Tab-Wechsel
```
Dashboard → Tab "Cashflows" klicken → Cashflow-Sicht
Dashboard → Tab "SOD" klicken → SOD-Sicht
Dashboard → Tab "Portfolios" klicken → Portfolio-Übersicht
Dashboard → Tab "Event Monitor" klicken → Zurück zur Workflow-Sicht
```

### C. Workflow Action Klick (Approval-Flow)
```
Event Monitor Tab → Action Badge klicken (z.B. "Draft", "Awaiting approval")
→ Modal öffnet sich mit:
   - Portfolio-Info (Name, ID, Event, Amount)
   - Workflow Progress Timeline (alle Schritte)
   - Aktueller Schritt Beschreibung
   - Vorschau auf nächste Action
→ "Approve & Advance" klicken
→ Bestätigungs-Zusammenfassung (Previous Action → New Action)
→ "Confirm & Execute" klicken
→ Lade-Animation (Validating → Updating → Syncing)
→ Erfolgs-Meldung mit Action-Übergang
→ "Done" klicken → Modal schließt, Tabelle aktualisiert
```

### D. Workflow Zeile aufklappen
```
Event Monitor Tab → Workflow-Zeile klicken
→ Detail-Panel klappt auf mit:
   - Workflow Steps (completed/current/upcoming)
   - "Approve & Advance" Button (bei attention) oder "View Details" (bei completed)
→ Erneut klicken → Detail-Panel schließt
```

### E. Kontextmenü
```
Event Monitor Tab → "..." Button in Workflow-Zeile klicken
→ Kontextmenü mit:
   - View Portfolio
   - Advance Workflow
   - Pause Workflow
   - Reset Workflow
→ Option auswählen oder außerhalb klicken zum Schließen
```

### F. Chatbot
```
Dashboard → Chatbot ist direkt geöffnet (rechts unten)
→ Vordefinierten Vorschlag klicken ODER Frage eintippen
→ Chatbot antwortet mit Text + Tabelle
→ Weitere Fragen stellen
→ "X" klicken → Chat schließen
→ "How can I help?" Button klicken → Chat wieder öffnen
```

### G. Zurück zur Startseite
```
Dashboard → "Back" Button (Header rechts)
→ Zurück zur Startseite/Landing Page
```

---

## Datenübersicht

| Bereich | Anzahl Einträge |
|---------|----------------|
| Workflows (Event Monitor) | 8 (5 Attention, 3 Completed) |
| Cashflows | 8 (7 Pending, 1 Completed) |
| SOD Alerts | 6 (2 Manual Review, 4 Auto-Resolved) |
| Portfolios | 8 |
| Chatbot Vorschläge | 4 |
