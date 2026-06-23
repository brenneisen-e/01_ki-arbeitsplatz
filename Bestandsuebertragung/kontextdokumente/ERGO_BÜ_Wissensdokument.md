# ERGO Bestandsübertragung (BÜ) — Wissensdokument

> Zusammengetragen aus allen bisherigen Arbeitsständen und Gesprächen. Stand der Aufbereitung: 23.06.2026.
> Letzter inhaltlicher Arbeitsstand im Projekt: April 2026 (Azure-Architektur & Kick-off-Vorbereitung).

---

## 1. Steckbrief

| Feld | Inhalt |
|---|---|
| **Projektname** | ERGO Bestandsübertragung (BÜ) — Prozessoptimierung mit KI |
| **Phase-1-Titel** | „Makler meets KI" |
| **Projekt-ID (Phase 1)** | ERG00496 |
| **Kunde** | ERGO (Vertrieb / Personenversicherungsbereich) |
| **Beratung** | Deloitte Consulting, Financial Services — proaktiv verkauft |
| **Lead** | Eike (Opportunity-Treiber & Delivery) |
| **Laufzeit / Volumen** | ca. 2–4 Monate, 150–350k € (aus Year-End-Selbsteinschätzung) |
| **Struktur** | 3 Phasen über ca. 20 Wochen (W1–W20) |
| **Charakter** | KI-gestützte Dunkelverarbeitung von Bestandsübertragungs-Dokumenten; aus einem verkauften Demo-Prototyp herausgewachsen |

---

## 2. Fachlicher Kontext: Was ist eine Bestandsübertragung?

Eine Bestandsübertragung (BÜ) bezeichnet die Übertragung von Versicherungsverträgen bzw. der Betreuung dieser Verträge auf einen anderen Vermittler/Makler. Aus den Vorklärungen sind zwei Grundformen relevant:

- **Einzelbestandsübertragung** — Übertragung einzelner Verträge/Kunden.
- **Gesamtbestandsübertragung** — Übertragung eines kompletten Bestands.

**Pflichtanlage in beiden Fällen: die Maklervollmacht.** Ohne erteilte Maklervollmacht kann die Übertragung nicht wirksam werden. Der typische Prozessfluss läuft über mehrere Stationen:

1. **Maklervollmacht** beim aufnehmenden Vermittler einreichen → Versicherer prüft und erteilt.
2. **Courtagezusage** anfordern → Versicherer bestätigt die Vergütungsberechtigung.
3. **Wirksamkeit** zu einem Stichtag (z. B. zum Monatsersten).

### Typische Sonderfälle / Edge Cases (aus der Prozessanalyse)
- **Widerspruch des Versicherungsnehmers** → Übertragung kann nicht durchgeführt werden.
- **Bereits gekündigter Vertrag** → Übertragung nicht möglich.
- **Fehlende oder veraltete Stammdaten** (z. B. Adresse) → Rückfrage nötig, Vorgang wird geflaggt.

### Ausgangsproblem beim Kunden
- **Viele heterogene Eingangskanäle** für BÜ-Anfragen (E-Mail, Portale, Brief etc.).
- Für **Standardfälle existiert bereits Robotics** — der Mehrwert liegt in den Sonderfällen und der Vorqualifizierung.
- Hoher **manueller Aufwandstreiber** im Sales Back-Office; ein klassischer Kandidat für Dunkelverarbeitung.

---

## 3. Projektentstehung & Chronologie

### November 2025 — Opportunity-Entstehung
- **13.11.2025:** Erste Anfrage von **Klemens Steiner (ERGO)**: „Haben wir die Zurich bei BÜ beraten?". Eike schreibt eine Mail an **Lars** (Deloitte intern) zur Frage nach Vorerfahrungen für einen **Taskforce-Ansatz**. Themen: viele Eingangskanäle, vorhandene Standardfall-Robotics. → *Der ursprüngliche Entstehungskontext.*

### Dezember 2025 — Workshop-Planung & rechtliche Vorklärung
- **Round-Table-Absage & Workshop-Planung BÜ:** Neujahrsmail an **Klemens & Martin** mit u. a. der Verschiebung eines Round-Table-Termins und der Planung eines Workshops zur Bestandsübertragung sowie KI-Use-Cases für Provisionsprozesse.
- **15.12.2025 — Rechtliche Vorklärung:** Unterschied Einzel- vs. Gesamtbestandsübertragung, Maklervollmacht als Pflichtanlage, Anforderungen im Gothaer/BGAV-Kontext.
- **15.12.2025 — Prototyp (Demo):** Claude-Code-Spezifikation für ein **Bestandsübertragungs-Tool** mit Demo-Daten (siehe Abschnitt 6). Kunde explizit ERGO, ausschließlich moderne einfarbige Icons.

### Februar 2026 — Fachkonzeption
- **11.02.2026 — KI-Agent für Bestandsübertragungen:** Inhaltliche Folien-Ausarbeitung der BÜ-Lösung für einen **Bereichsleiter-Termin**.

### März 2026 — Vertragsanbahnung & Zuschlag
- **09.03.2026:** RfP-bezogene Arbeit (Suche nach älterem Stand).
- **19.03.2026 — Zuschlag Phase 1 „Makler meets KI":** Mail an **Nicole** mit Projektrahmen, Phasenplan (3 Phasen, W1–W20), den **drei Hebeln** und dem Dreiphasenmodell inkl. Sub-Phasen.

### April 2026 — Projektstart & aktive Umsetzung
- **01.04.2026 — Verschiebung:** Projektstart ERG00496 (Phase 1) auf den **13. April** verschoben wegen zusätzlichem **Vorstands-Review**.
- **20.04.2026 — Kick-off-Vorbereitung:** Optimierung **Folie 18** („Die ersten 3 Wochen" — 4 Swimlanes) und Antwortmail an **Martin Richarz** zum Kick-off (Unterlagenanforderung, Teams-Kanal-Thema).
- **22.04.2026 — Technische Tiefenanalyse:** Azure/Microsoft-Stack für die Dunkelverarbeitung (siehe Abschnitt 5).

---

## 4. Lösungskonzept: Die drei Hebel

Das Zielbild der Prozessoptimierung ruht auf drei Hebeln:

1. **Strukturiertes Eingangsformular**
   Standardisierte, maschinenlesbare Erfassung der BÜ-Anfragen an der Quelle — reduziert Varianten und schafft die Voraussetzung für Automatisierung.

2. **Dunkelverarbeitung für Großmakler**
   End-to-End-Automatisierung der Massenfälle großer Maklerpartner mit klaren Fachregeln, KI nur für Sonderfälle. Hier liegt der größte Effizienzhebel.

3. **KI-Agent**
   Agentenbasierte Verarbeitung komplexerer Vorgänge (Extraktion, Klassifikation, Plausibilisierung, Vorqualifizierung der Sonderfälle).

> Leitprinzip aus dem Operations-Kontext: **Erst Prozessreife, dann Automatisierung, dann KI.** Standardisierung und Variantenreduktion sind Voraussetzung, nicht Ergebnis wirksamer KI-Anwendung.

---

## 5. Technische Architektur (Azure/Microsoft-Stack)

Tiefenanalyse vom 22.04.2026 zum produktiven Stack für die Dunkelverarbeitung:

| Komponente | Rolle |
|---|---|
| **Azure Document Intelligence** | Extraktion strukturierter Daten aus eingehenden BÜ-Dokumenten (Vollmachten, Anschreiben, Nachträge) |
| **Foundry Agent Service** | Orchestrierung der agentenbasierten Verarbeitungsschritte |
| **Azure OpenAI** | LLM-gestützte Klassifikation, Extraktion aus Freitext, Plausibilisierung |

**Vorgehensmodell:** **PoC → MVP → Rollout** (stufenweiser Aufbau, schneller Piloteinsatz als Basis für die vollumfängliche Transformation).

**Realitätscheck** im Rahmen der Analyse: Bewertung von **Copilot Studio** und **ERGO GPT** als mögliche/ergänzende Bausteine im Kunden-Stack (Einordnung von Eignung und Grenzen für den produktiven Einsatz).

> Hinweis: Die detaillierten Schlussfolgerungen des Realitätschecks (Copilot Studio vs. ERGO GPT) liegen im zugehörigen Chat vom 22.04.2026 — bei Bedarf dort vertiefen.

---

## 6. Der Prototyp / die verkaufte Demo

Kern des „proaktiv verkauften" Ansatzes war ein lauffähiger Demo-Prototyp eines **Bestandsübertragungs-Tools** (Claude-Code-Spezifikation, Dez 2025). Diese Demo wurde — wie auch im Manager-Case als Beispiel genannt — „genau so an den Kunden verkauft".

### Architektur (zwei Bausteine)
1. **Web-App (Cloudflare Pages)** — Vorgangsmanagement mit Persistenz.
2. **HTA-Tool** — lokaler Outlook-Zugriff via COM (`ActiveXObject("Outlook.Application")`, MAPI), liest Postfächer/Posteingang/Gesendete, exportiert nach JSON.

### Funktionsumfang
- JSON-Import (Drag & Drop + Button)
- Automatische Zuordnung neuer Mails zu bestehenden Vorgängen
- Nicht zuordenbare Mails flaggen und anzeigen
- Manuelle Zuordnung zu bestehendem Vorgang
- Neuen Vorgang aus Mail erstellen
- Vorgangsdetails bearbeiten

### Datenmodell je Vorgang (Case)
`id`, `createdAt/updatedAt`, `kunde` (Name + Confidence + Source), `versicherungsnummer`, `versicherer` (oft aus E-Mail-Domain abgeleitet), `gueltigkeitsdatum`, `status`, `sparte`, `notes`, `flagged`, `conversationIds`, `messageIds`, `messages`, `statusHistory`.

- **Status-Werte:** `angefragt` → `in-bearbeitung` → `abgelehnt` (mit Status-Historie & Notizen).
- **Confidence-/Source-Logik:** automatische vs. manuelle Erkennung (z. B. Versicherer per E-Mail-Domain).
- **Keyword-Filter beim Export:** `bestandsübertragung`, `maklervollmacht`, `courtagezusage`.

### In den Demo-Daten abgebildete Versicherer
ERGO, AXA, HDI, Allianz, Generali, Signal Iduna, Nürnberger, Zurich — mit realistischen Sparten (Hausrat, Haftpflicht, Rechtsschutz, Leben) und typischen Antwortmustern (Eingangsbestätigung, Erteilung, Ablehnung wegen Kündigung/Widerspruch).

### Design-Vorgaben
Kunde ERGO, **ausschließlich moderne einfarbige Icons**, keine verspielten Elemente.

---

## 7. Rechtliche & fachliche Vorklärung (Detail)

Aus der Klärung vom 15.12.2025:
- **Maklervollmacht** ist Pflichtanlage jeder BÜ; ohne sie keine Wirksamkeit.
- **Einzel- vs. Gesamtbestandsübertragung** unterscheiden sich in Umfang und Handling.
- **Courtagezusage** als eigener Bestätigungsschritt der Vergütungsberechtigung.
- Querbezug zu **Gothaer/BGAV**-Anforderungen (aus dem parallelen BarmeniaGothaer-Kontext: Aufhebungsnachtrag, BGAV-Agenturvertrag, Überleitungsnachtrag als Übertragungslogik).

---

## 8. Phasenplan & Kommerzielles

- **Dreiphasenmodell** über **W1–W20** mit Sub-Phasen.
- **Phase 1 = „Makler meets KI"** (ERG00496) — der zugeschlagene Auftakt.
- **Kick-off-Detailplanung:** „Die ersten 3 Wochen" als 4 Swimlanes (Folie 18).
- **Kommerziell** (Selbsteinschätzung): 2–4 Monate, 150–350k €, proaktiv verkauft.

---

## 9. Stakeholder & Kontakte

### ERGO (Kundenseite)
| Person | Funktion / Rolle im Projekt | Kontakt |
|---|---|---|
| **Klemens Steiner** | PVD — Ursprung der Opportunity, erste BÜ-Anfrage | klemens.steiner@ergo.de |
| **Martin Richarz** | PVAK — Kick-off-Counterpart | martin.richarz@ergo.de |
| **Nicole** | Empfängerin der Projektrahmen-Kommunikation (Zuschlag) | — |

### Deloitte (Beratungsseite)
| Person | Rolle | Kontakt |
|---|---|---|
| **Eike** | Lead / Opportunity-Treiber / Delivery | — |
| **Lars** | interner Kollege (Vorerfahrungs-Abfrage Taskforce) | — |
| **Holger Duemler** | intern (u. a. cc im Round-Table-Kontext) | hduemler@deloitte.de |

---

## 10. Abgrenzung zu anderen ERGO-Themen

Wichtig, um Verwechslungen zu vermeiden — bei ERGO laufen mehrere Stränge parallel:

- **ERGO BÜ (dieses Dokument):** Prozessoptimierung Bestandsübertragung mit KI-Dunkelverarbeitung.
- **ERGO Sales Excellence / PMO-RfP (separat!):** PMO-Mandat analog ZAV, mit acht Workstreams (A Hybrider Kunde, B Vertriebssteuerung, C Kapazität & Ausbildung, D A-TOM, E Digital Interaction Program, F Sales Middle Layer, G Struktur, H Change & Einführung), Zielbild „Verdopplung der Vertriebspartnerproduktivität bis 2030", inkl. fachlichem Impuls „Vermittler-Journey 2030". **Das ist nicht das BÜ-Projekt.**
- **ERGO AO-Recruiting-Business-Case:** eigener Strang (Vertriebspartner-Recruiting, zero360/Klemens-Steiner-Quellen, 5.000 Vertriebspartner).
- **Insurance Round Table Sales Operations:** Veranstaltungsreihe, in der BÜ wiederkehrend als Pain-Point-Thema auftaucht.

---

## 11. Status & offene Punkte

- **Aktueller dokumentierter Stand:** Kick-off Phase 1 (ERG00496) angelaufen ab Mitte April 2026; technische Architektur (Azure) in der Tiefenausarbeitung.
- **Offen / zu vertiefen:**
  - Detaillierte Schlussfolgerungen des Azure-Realitätschecks (Copilot Studio vs. ERGO GPT).
  - Konkretisierung des strukturierten Eingangsformulars (Felddefinition, Quellsysteme).
  - Großmakler-Scope für die Dunkelverarbeitung (welche Partner, welche Volumina).
  - Übergang Demo-Prototyp → produktiver MVP auf Kunden-Stack.

> Dieses Dokument bildet den Stand bis April 2026 ab. Falls es seitdem neue Sessions gab, sind diese hier noch nicht enthalten — sag kurz Bescheid, dann ergänze ich.

---

## 12. Anhang: Quell-Chats

**Aktuell laufend (April 2026)**
- Azure-Lösung für BÜ-Projekt mit KI-Dokumentverarbeitung (22.04.2026) — https://claude.ai/chat/54922b9e-da8f-419b-a166-e041928258b4
- Makler meets KI Projekt Bestandsübertragung — Folie 18 & Kick-off-Mail (20.04.2026) — https://claude.ai/chat/eaf52f9b-f04c-43a7-b767-0260f8aee39f
- Year-end Bewertung (BÜ als externer Punkt, 04/2026) — https://claude.ai/chat/e4180f27-953f-4cfd-9eeb-a8bfb38a3e48
- ERGO Makler Meets KI — Projektstart verschoben (01.04.2026) — https://claude.ai/chat/a7d2688e-9f7d-4f86-b112-213a1add23c6

**Vertragsanbahnung (März 2026)**
- ERGO RfP zur BÜ-Prozessoptimierung — Zuschlag Phase 1 (19.03.2026) — https://claude.ai/chat/ac4ba13b-7be7-41c1-825a-33b6a0593154
- RFP ERGO BÜ process (09.03.2026) — https://claude.ai/chat/6b78e108-69db-468a-9a90-476813b5a070

**Fachkonzeption (Februar 2026)**
- KI-Agent für Bestandsübertragungen — Bereichsleiter-Termin (11.02.2026) — https://claude.ai/chat/cbec5783-570f-4e5a-87d6-2872dfa8b5ab

**Rechtliche Vorklärung & Prototyp (Dezember 2025)**
- Maklervollmacht bei Bestandsübertragung erforderlich (15.12.2025) — https://claude.ai/chat/41418fff-1477-4bf9-a281-bbeb83c6c7d9
- Bestandsübertragungen automatisieren mit Email-Parsing-Tool (15.12.2025) — https://claude.ai/chat/d9465b0a-0d10-4424-b317-13de869952af
- Round Table Absage und Workshop zur Bestandsübertragung (Jahreswechsel) — https://claude.ai/chat/e09c995c-395c-4a69-9cae-e80f8c0d740f

**Opportunity-Entstehung (November 2025)**
- Portfolio transfer optimization with AI and robotics — Mail an Lars (13.11.2025) — https://claude.ai/chat/0c661940-8baa-49aa-ae4a-0c443b0db5c1

**Übersichts-Chats**
- Ergo Bestandsübertragung Chats (Chronologie, 23.04.2026) — https://claude.ai/chat/343d5649-2e14-4431-b4eb-fd92268f6d14
- Ergo Bestandsübertragung Chat (05.05.2026) — https://claude.ai/chat/d3565ce3-6cca-4d95-8eae-47a86fffdbe3
