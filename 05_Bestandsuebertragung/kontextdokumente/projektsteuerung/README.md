# Projektsteuerung Makler meets KI

`20260929_Projektplan_Anwesenheit_Budget.xlsx` – Anwesenheit je Tag bis zum Budgetende (Phase 2, Leistungszeitraum 10.08.–31.10.2026).
Build: `cd quellen && python3 projektplan_budget_build.py`, danach mit `recalc.py` nachrechnen.

- Blatt **Budget**: Angebot (je 43 PT; Project Leader 1.669 €, Consultant 1.224 €), August laut Rechnung vom 15.09.2026 (je 14 PT),
  September je 22 PT (Eingabe), Oktober aus dem Tagesplan; letzter Tag im Budget, Rest-PT und Euro.
- Blatt **Oktober**: Status je Tag und Person (Auswahlliste); ein Projekttag zählt nur, solange Rest-PT vorhanden sind.
- Blatt **Kalender**: Übersicht A/U/–/E/B je Person und Tag.

## Übergabedeck „Makler BÜ meets KI“ (16.10.2026)

`20261016_Uebergabe_Makler_BUE_meets_KI.pptx` wird von `quellen/uebergabe_deck_build.py` aus dem Originaldeck
`quellen/uebergabe_vorlage.pptx` gebaut: ERGO-Master, Titel, Logo und Titelfolie bleiben, alle Inhalte werden im
festen Raster neu gezeichnet (Status als Ringe, Erledigt/Offen-Marken, Gantt mit Heute-Linie KW 42). Folie 8 „Gesamtzeitplan bis Jahresende“ fasst die Termine aller Workstreams bis 31.12. zusammen (Liste `GESAMT` und `MEILENSTEINE` im Generator).
Neu bauen: `python3 quellen/uebergabe_deck_build.py`
