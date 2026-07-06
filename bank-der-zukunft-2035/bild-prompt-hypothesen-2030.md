# Bild-Prompts — Hypothesen-Vergleichsbilder „Banking Horizon 2030"

Prompts zum Erzeugen der **Hypothesen-Bilder** `public/images/Kapitel N_M.png`.
Jedes ist ein **16:9-Bild, in zwei Hälften geteilt**: **links = Status Quo (2026)**,
**rechts = 2030**. Die App zeichnet die Trennlinie und die Labels „Status Quo" /
„2030" selbst als Overlay (bei 50 %) — deshalb **keine Beschriftung ins Bild
einbrennen**.

---

## Das Kern-Feedback: die 2030-Seite spielt 4–5 Jahre später

> Workshop-Feedback: Auf der **rechten (2030-)Hälfte** sollen wiederkehrende
> **Kund:innen sichtbar 4–5 Jahre älter** sein und **andere Kleidung** tragen —
> denn zwischen „Status Quo 2026" und „2030" liegen echte Jahre. Das macht den
> Zeitsprung im Bild spürbar.

**Verbindliche Regel für jedes Bild mit Personen:**

- **Gleiche, wiedererkennbare Person** links wie rechts (gleiche Identität,
  Gesichtszüge, Ethnie, Statur) — es ist derselbe Mensch, nur später.
- **Rechte Hälfte (2030): dieselbe Person 4–5 Jahre älter** — dezent gealtert
  (etwas reiferes Gesicht, evtl. wenige graue Haare, minimale Alterszeichen),
  **kein** anderer Mensch, keine Verjüngung.
- **Andere Kleidung rechts**: aktualisiertes, anderes Outfit als links — nicht
  dasselbe Kleidungsstück in beiden Hälften.
- **Umgebung rechts modernisiert**: Technik/Interieur auf 2030-Stand, passend zur
  jeweiligen Szene.
- Gilt primär für **Kund:innen**; wiederkehrende Mitarbeitende auf der 2030-Seite
  dürfen analog dezent altern und andere Kleidung tragen (Konsistenz).

---

## Einheitlicher Stil (wie Master-Strukturbild)

- Fotorealistisch, natürliches Tageslicht, ruhig, premium, professionell —
  Vorstands-Workshop-tauglich, keine verspielte oder cartoonhafte Anmutung.
- Akzentfarbe Deloitte-Grün **#046A38** (sekundär #86BC25), Screen-/Hologramm-
  Akzent Cyan **#7EC8FF** nur auf Displays. Monochrome, einfarbige Bildschirm-
  Grafiken — keine Multicolor-/Gradient-Icons.
- Format **16:9**, saubere Komposition, **linke 50 % = Status Quo, rechte 50 % =
  2030**, mittig ein unaufdringlicher Übergang (die harte Trennlinie kommt aus
  der App).
- **Keine eingebrannten Texte/Labels**, keine Logos, keine Emojis, keine
  Wortmarken auf Screens (nur abstrakte, monochrome UI-Andeutungen).

---

## Wiederverwendbares Prompt-Template (englisch)

```
Photorealistic 16:9 image split into two halves by a subtle vertical seam down
the center, same scene "before and after". Calm, premium, natural daylight,
corporate documentary style, boardroom-grade.

LEFT HALF — status quo, year 2026: {LINKS_SZENE}

RIGHT HALF — year 2030: {RECHTS_SZENE}

Continuity rule: it is the SAME recognizable person on both halves (same face,
same identity), but on the RIGHT half the person is 4-5 years older — subtly
aged, slightly more mature, and wearing DIFFERENT, updated clothing than on the
left. The right-side environment and technology are modernized to 2030.

Color accent deep green #046A38 with cyan screen glow #7EC8FF, monochrome
single-color on-screen graphics. No baked-in text or labels, no logos, no
watermark, no emojis. Aspect 16:9.
```

Negativ-Prompt:

```
no baked-in text, no captions, no labels, no logos, no watermark, no emojis,
no gibberish UI text, a DIFFERENT person on the right (forbidden), a younger
person on the right (forbidden), identical outfit on both halves (forbidden),
cartoon, illustration, neon cyberpunk, distorted faces, extra fingers.
```

---

## Szenen pro Bild (Links = Status Quo 2026 · Rechts = 2030)

Spalte „Alter+" = Kund:innen-Alterung/Kleidungswechsel anwenden (Kern-Feedback).
Quelle der Szenen: `alt`-Texte in `src/data/chapters.ts`.

### 01 Kundenperspektive (Filiale) — Kund:innen

| Bild | Alter+ | Links (2026) | Rechts (2030) |
|---|---|---|---|
| Kapitel 1_1 | ja | Kundin tippt aktiv in einer Banking-App | Dieselbe Kundin, 4–5 J. älter, anderes Outfit; persönlicher KI-Finanzassistent arbeitet unaufgefordert im Hintergrund auf Smartwatch und Smartphone |
| Kapitel 1_2 | ja | Kunde ratlos vor vielen Produktoptionen | Derselbe Kunde, älter, andere Kleidung; KI-Assistent präsentiert eine klare Empfehlung mit Simulation und Begründung |
| Kapitel 1_3 | ja | Kunde kontaktiert die Bank und wartet auf Reaktion | Derselbe Kunde, älter, andere Kleidung; autonomer KI-Agent erkennt ein Ereignis früh und handelt, der Kunde gibt frei |

### 02 Markt & Vertrieb (Advisory) — Kund:innen + Berater

| Bild | Alter+ | Links (2026) | Rechts (2030) |
|---|---|---|---|
| Kapitel 2_1 | ja | Produktzentriertes Verkaufsgespräch mit Broschüren | Derselbe Kunde (u. Berater) 4–5 J. älter, andere Kleidung; gemeinsam gestaltete maßgeschneiderte Lösung mit holografischem KI-Display |
| Kapitel 2_2 | ja | Standardisiertes Beratungsgespräch nach Skript, KI nur kleines Tool | Dieselben Personen, älter, andere Kleidung; Berater als KI-augmentierter Sparringspartner mit reichem KI-Kontext-Display |
| Kapitel 2_3 | ja | Punktueller, reaktiver Kundenkontakt an fragmentiertem CRM | Derselbe Kunde, älter, andere Kleidung; Agentensystem begleitet kanalübergreifend in Echtzeit auf mehreren Geräten |

### 03 Marktfolge (Backoffice) — überwiegend Mitarbeitende

| Bild | Alter+ | Links (2026) | Rechts (2030) |
|---|---|---|---|
| Kapitel 3_1 | (Mitarb.) | Back-Office bearbeitet manuell Papierakten an Legacy-Bildschirmen | Vollautonome Dunkelverarbeitung, Mensch nur bei einem komplexen Sonderfall |
| Kapitel 3_2 | – | Geschlossenes Back-Office, alles intern | Modulare externe Utility-Plattformen übernehmen Standardbetrieb, die Bank orchestriert ein Ökosystem |
| Kapitel 3_3 | – | Operations als interne Kostenstelle | Skalierbare Banking-as-a-Service-Plattform mit standardisierten Services für Dritte |
| Kapitel 3_4 | – | Nachgelagerte Compliance-Prüfung als separater Kontrollschritt | Regulatorik „compliant by design" direkt im automatisierten Prozess-Lifecycle |

### 04 Corporate Services / Organisationsentwicklung — Mitarbeitende

| Bild | Alter+ | Links (2026) | Rechts (2030) |
|---|---|---|---|
| Kapitel 4_1 | (Mitarb.) | Isoliertes Classroom-Training | Kontinuierlicher, personalisierter Skill-Aufbau mit adaptivem KI-Lernbegleiter |
| Kapitel 4_2 | – | Starres funktionales Organigramm mit Silos | Skills-getriebene, flexible Organisation, KI orchestriert Rollen/Teams als fluides Netzwerk |
| Kapitel 4_3 | – | Administrative, reaktive HR-Verwaltung | Datenbasierte, vorausschauende Workforce-Steuerung auf Predictive-Analytics-Dashboard |
| Kapitel 4_4 | (Mitarb.) | Klassisches Classroom-/E-Learning ohne Bezug zur Skill-Lücke | Mitarbeitende trainieren mit VR-Brille, KI leitet aus der Skill-Veränderung ein passgenaues Programm ab |
| Kapitel 4_5 | (Mitarb.) | Qualifizierung nur für junge Mitarbeitende | Gemischte, auch ältere Belegschaft lernt grundlegend neue Fähigkeiten mit KI-Lernbegleitung |

### 05 Technologie / IT (Serverraum) — Entwickler:innen

| Bild | Alter+ | Links (2026) | Rechts (2030) |
|---|---|---|---|
| Kapitel 5_1 | – | Entwickler schreiben und testen Software manuell | Selbstoptimierende AI-Delivery: Software baut/testet/deployt sich selbst, Mensch überwacht nur |
| Kapitel 5_2 | – | Regelbasierte IT mit manuellen Freigaben und Monolith | AI entscheidet autonom in Leitplanken, IT als modulare, API-basierte Plattform |
| Kapitel 5_3 | – | IT als separate Gatekeeper-Funktion, Fachbereich übergibt Anforderungen | Fachbereiche steuern AI-Systeme direkt selbst, Gatekeeping entfällt |

### 06 Compliance & Risk — Risikocontroller:innen

| Bild | Alter+ | Links (2026) | Rechts (2030) |
|---|---|---|---|
| Kapitel 6_1 | – | Ex-post-Compliance, nachträgliche Prüfung von Dokumenten/Stichproben | Echtzeit-Compliance direkt in den Systemen, Regeln im Live-Entscheidungs-Dashboard |
| Kapitel 6_2 | – | Drei getrennte Verteidigungslinien mit Stichproben | Integrierte, kontinuierliche Kontrolle im KI-überwachten Governance-Cockpit, CAIO im Zentrum |
| Kapitel 6_3 | – | Cyber-/Operational Risk als separate, perimeterorientierte Schutzfunktion | In das Betriebsmodell integriert, kontinuierliche Resilienzsteuerung im Live-Dashboard |
| Kapitel 6_4 | – | Innenrevision prüft nachgelagert und stichprobenartig mit Aktenordnern | Compliance/Revision als Enabler mit Explainability-Cockpit (wie/warum die KI einen Output erzeugt) |

### 07 Transformation (Glas-Aufzug) — Organisation

| Bild | Alter+ | Links (2026) | Rechts (2030) |
|---|---|---|---|
| Kapitel 7_1 | – | Intern fokussierte Transformation an fragmentierten IT-/Prozessprojekten | AI-getriebene Ökosystem-Plattform aus Daten, Partnern und eingebauter Compliance |
| Kapitel 7_2 | – | Produkt-/silogetriebene Organisation, in starren Strukturen gefangen | AI-natives Operating Model, Journey-Teams mit E2E-Ownership und Human-in-the-loop |
| Kapitel 7_3 | – | Technologiegetriebene Transformation in vielen isolierten Use Cases | Decision-first mit klarer Roadmap und skalierbarer Decision Spine vor dem AI-Rollout |
| Kapitel 7_4 | – | Neue Prozesse/Systeme geliefert, Verhaltens-/Kulturwandel verpufft | Change fest im Target Operating Model verankert — Governance, Rollen, Anreize sichern die Umsetzung |
| Kapitel 7_5 | – | Klassische Projektmethodik (Wasserfall/Stage-Gate) ohne Transformationspfad | AI-native Projektmethodik mit wiederverwendbaren Artefakten und klarem Pfad Reifegrad → nächste Schritte → Zielbild |

### 08 Produkte & Innovation (Projektraum) — teils Kund:innen

| Bild | Alter+ | Links (2026) | Rechts (2030) |
|---|---|---|---|
| Kapitel 8_1 | ja | Regal mit identischen Standard-Produktmappen, mehrere Kund:innen halten dieselbe Mappe | Dieselben Kund:innen 4–5 J. älter, andere Kleidung; jede/r sieht auf dem eigenen Gerät eine sichtbar andere, individuell komponierte Produktlösung |
| Kapitel 8_2 | ja | Dicker Papier-Vertragsordner wird geschlossen und ins Regal zu identischen Ordnern abgeheftet | Dieselbe Kundin, älter, andere Kleidung, im Umzug; entspannt vor Bildschirm, Produktparameter passen sich in Leitplanken selbst an |
| Kapitel 8_3 | – | Zähe Gremiensitzung über dicken Anforderungsstapeln und Wandplanungstafel | Kleines Produktteam im hellen Projektraum, KI simuliert parallel viele Varianten, Same-Day-Mockup auf dem Tisch |

---

## Anwendung

Für jedes Bild `{LINKS_SZENE}` / `{RECHTS_SZENE}` aus der Tabelle ins Template
einsetzen. Bei „Alter+ = ja" die Kern-Regel (4–5 Jahre älter + andere Kleidung
auf der 2030-Seite, gleiche Person) unbedingt mitgeben. Fertige PNGs unter
`public/images/Kapitel N_M.png` ablegen, dann `npm run build` — kein Code-Umbau
nötig, die Slots sind bereits in `chapters.ts` verdrahtet.
