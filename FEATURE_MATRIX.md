# Feature-Matrix: KI-Vertriebsarbeitsplatz

> **Stand:** 2026-03-10 | **Bezug:** OPT-23-D

## Legende

| Symbol | Bedeutung |
|--------|-----------|
| + | Implementiert |
| - | Nicht vorhanden |
| ~ | Konfiguriert, nicht verdrahtet |
| . | Nicht relevant fuer dieses Modul |

## Uebersicht-Seiten (A-02, B-02, VV-02)

| Feature                     | A-02 | B-02 | VV-02 |
|-----------------------------|------|------|-------|
| KPI-Cockpit                 | + 9  | + 4  | + 6   |
| Tab-System                  | + 9  | + 7  | + 6   |
| KI-Chat (Mock)              | +    | +    | +     |
| Kundenliste/Mandatsliste    | +    | +    | +     |
| FIDA/Open Finance Tab       | +    | +    | .     |
| Impulse/Potentiale Tab      | +    | +    | +     |
| Kommunikation Tab           | +    | -    | .     |
| Compliance Tab              | .    | .    | +     |
| Pipeline Tab                | .    | .    | +     |
| Stammdaten-Overlay          | +    | +    | -     |
| Vertrags-Detail-Modal       | +    | -    | -     |
| Guided Tour                 | +    | ~    | +     |
| Notification-Bell           | -    | -    | +     |
| Potenzial-Scoring (Sterne)  | -    | -    | +     |
| Portfolio-Einzeiler         | -    | -    | +     |

## Detail-Seiten (A-10, B-10, VV-10)

| Feature                     | A-10 | B-10 | VV-10 |
|-----------------------------|------|------|-------|
| Tab-System                  | + 6  | + 6  | + 6   |
| Stammdaten/Client 360       | +    | +    | +     |
| Vertraege/Portfolio         | +    | +    | +     |
| FIDA/Open Finance Tab       | +    | +    | .     |
| Impulse/Potentiale          | +    | +    | +     |
| Finanzplanung/Bilanz        | +    | +    | +     |
| Kommunikation               | +    | +    | +     |
| CLV                         | +    | +    | .     |
| NPS                         | +    | +    | +     |
| Compliance Tab              | .    | .    | +     |
| Familien-Stammbaum          | -    | -    | +     |
| Vermoegensstruktur          | -    | -    | +     |
| PDF-Export                   | -    | -    | +     |
| Luecken-Leiste              | -    | -    | +     |

## Moduluebergreifende Features

| Feature                     | Status     | Implementiert in        |
|-----------------------------|------------|-------------------------|
| Kunden-ID Cross-Referenz    | Teilweise  | config.js (Vers<->Bank<->VV) |
| Mode-Config System          | Vollst.    | mode-config.js          |
| Guided Tour Engine          | Vollst.    | guided-tour.js          |
| FIDA-Datenmodell (einheitl.)| Vollst.    | { institut, typ, info, consent, gueltig } |
| Error-Handling (BUG-10)     | Offen      | Noch nicht implementiert |
| Load-Order (BUG-03)         | Offen      | load-order.js geplant   |

## Hinweise

1. VV-Chat wurde mit OPT-22-A implementiert (vorher nur Config definiert)
2. PDF-Export existiert nur in VV-10 (OPT-22-C). A-10/B-10 haben keinen PDF-Export
3. Notification-Bell und Potenzial-Sterne existieren nur in VV-02 (OPT-22-E)
4. FIDA ist fuer VV nicht relevant (`fidaMode: 'nicht_relevant'`), VV nutzt `fremdVermoegen[]`
5. Kommunikation in A-10 hat individuelle Eintraege pro Kunde (OPT-15 Zustand pruefen)
6. VV hat exklusive Features: Familien-Stammbaum, Vermoegensstruktur, Compliance-Tab, Pipeline
