# Bestandsübertragung (BÜ) – Projektansatz & Lösungsoptionen

## Ausgangslage

Die ERGO bearbeitet jährlich eine **sechsstellige Anzahl an Bestandsübertragungen**, die überwiegend als unstrukturierte E-Mails über **Gruppenpostfächer** eingehen. Der heutige Prozess ist nahezu vollständig manuell:

1. **E-Mail-Eingang** – Unstrukturierte E-Mails mit heterogenen Anhängen (PDF, Word, Excel, Vollmachten) treffen über Gruppenpostfächer ein
2. **Postkorbsystem** – Manuelle Verteilung und Zuordnung der Vorgänge
3. **Manuelle Prüfung** – Jeder Vorgang durchläuft 3–4 Prüfschritte: Vollständigkeitsprüfung, Maklervollmacht, Vertragsnummernabgleich
4. **ERGO GPT** – Die bestehende KI-Lösung verarbeitet ausschließlich einfache Text-E-Mails ohne Anhänge und deckt nur einen Bruchteil der Vorgänge ab (nur Sonderfälle)
5. **Robotics / RPA** – Einziger automatisierter Schritt am Ende der Kette

**Kernprobleme:**
- Überwiegend manuelle Bearbeitung mit hohem Personalaufwand
- ERGO GPT nur eingeschränkt nutzbar (keine Anhänge, keine komplexen Formate)
- Unstrukturierte Eingangsdaten erschweren jede Form der Automatisierung
- Durchlaufzeiten im Bereich von Tagen statt Minuten

---

## Zielbild & Projektansatz

### KI-Agent für unstrukturierte E-Mails

Pragmatischer Einsatz eines KI-Agenten früh in der Prozesskette zur automatisierten Verarbeitung **aller** eingehenden E-Mails inklusive Anhänge (Word, Excel, PDF, Vollmachten). Der KI-Agent wird als dauerhafte Lösung für den E-Mail-Kanal aufgebaut – nicht als Interimslösung.

**Kernfähigkeiten:**
- Automatische Klassifikation eingehender BÜ-Vorgänge
- KI-Erkennung von Vollmachten
- Automatisches Splitting von Multi-Verträgen
- Direkte JSON-Ausgabe für Robotics / RPA

### Evaluierung: Strukturiertes Formular & API

Parallel wird im Projekt erarbeitet und bewertet, ob insbesondere Großmakler BÜ-Daten künftig über ein standardisiertes **Online-Formular** oder eine **API** liefern können. Ziel: Unstrukturierte Eingangsdaten an der Quelle reduzieren. Das Formular wäre direkt mit Robotics verbunden – ohne KI-Verarbeitung dazwischen.

**Zielzustand:** Hoher Automatisierungsgrad – Standardvorgänge vollautomatisch klassifiziert, extrahiert und an Robotics übergeben. Manuelle Prüfung nur noch für Sonderfälle. Durchlaufzeit von Tagen auf Minuten.

---

## SOLL-Prozess (zwei Kanäle)

### Pfad 1: E-Mail-Kanal
```
E-Mails via Gruppenpostfächer → KI-Agent → Auto. Klassifikation → Robotics / RPA
       [Automatisch]           [Automatisch]    [Automatisch]        [Automatisch]
```

### Pfad 2: Formular-Kanal (Evaluierung)
```
Formular / API  ──────────────────────────────→  Robotics / RPA
   [OPTION]                direkt                  [Automatisch]
```

---

## Lösungsoptionen (KI-Agent)

| Kriterium | Option A: ERGO-Plattform | Option B: Deloitte External API |
|---|---|---|
| **Hosting** | Auf interner ERGO-Infrastruktur | Externe Deloitte-Cloud-API |
| **Datenschutz** | Daten bleiben intern | Datenverarbeitungsvertrag nötig |
| **Flexibilität** | Abhängig von ERGO-IT-Kapazitäten | Schnellere Iteration möglich |
| **Integration** | Enge Anbindung an bestehende Systeme | API-basierte Integration |

Parallel: **Machbarkeitsanalyse für Formular/API-Kanal** als ergänzende Option.

---

## Projektplan

**Laufzeit:** 01.04.2026 – 30.09.2026 (6 Monate / 20 Kernwochen + Buffer)

### Phase 1: Initialisierung & Fachkonzept (W1–W8)
- Projekt-Setup, Stakeholder-Alignment
- IST-Prozessanalyse & Volumenerhebung
- Anforderungserhebung & SOLL-Design
- Architekturentscheidung (KI-Agent A/B, Formular/API)
- Fachkonzept & Business Case

### Phase 2: Implementierung (W7–W16)
- PoC KI-Agent (E-Mail + Anhänge)
- Produktiventwicklung & Integration
- Anbindung Postkorbsystem & Robotics
- Formular-/API-Konzept für Großmakler
- Sicherheits- & Datenschutzkonzept

### Phase 3: Test, Pilot & Rollout (W15–W20)
- Integrationstests & UAT
- Feintuning Erkennungsqualität
- Pilotbetrieb mit echtem Volumen
- Schulung & Übergabe an ERGO
- Hyper-Care & Dokumentation

### Meilensteine
| Meilenstein | Zeitpunkt |
|---|---|
| Fachkonzept abgeschlossen | W8 |
| Proof of Concept | W11 |
| Feature Complete | W16 |
| Go-Live | W20 |

---

## Staffing & Ressourcen

### Deloitte-Team

| Rolle | Level | Phase 1 (W1–8) | Phase 2 (W7–16) | Phase 3 (W15–20) |
|---|---|---|---|---|
| Projektleitung & Steuerung | Manager | aktiv | aktiv | aktiv |
| Fachkonzeption & Prozess | Senior Consultant | aktiv | – | – |
| KI / Data Engineer | Consultant | aktiv | aktiv | aktiv |
| Junior Support | Analyst / Praktikant | anteilig | anteilig | anteilig |

### Aufwandsschätzung (~310 Personentage)

| Phase | Team | Personentage |
|---|---|---|
| Phase 1: Initialisierung & Fachkonzept | 3 Pers. + Junior | ~140 PT |
| Phase 2: Implementierung | 2 Pers. + Junior | ~125 PT |
| Phase 3: Test, Pilot & Rollout | 2→1 Pers. + Hyper-Care | ~45 PT |
| **Gesamt** | | **~310 PT** |

### Monatsverteilung (Arbeitstage)

| Rolle | Apr (20) | Mai (18) | Jun (22) | Jul (23) | Aug (21) | Sep (22) | Summe |
|---|---|---|---|---|---|---|---|
| Manager | 12 | 12 | 11 | 10 | 9 | 6 | **60 PT** |
| Senior Consultant | 18 | 16 | 8 | 3 | 0 | 0 | **45 PT** |
| Consultant | 18 | 18 | 22 | 23 | 21 | 18 | **120 PT** |
| Praktikant | 10 | 10 | 16 | 18 | 16 | 15 | **85 PT** |
| **Gesamt/Monat** | **58** | **56** | **57** | **54** | **46** | **39** | **310 PT** |

---

*Deloitte 2026 – Vertriebskapazitätssteigerung @ ERGO*
