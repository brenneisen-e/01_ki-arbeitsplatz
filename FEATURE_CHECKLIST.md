# Feature-Checkliste: VSTEike → kiarbeitsplatz Refactoring

**KRITISCH: Alle Features müssen nach dem Refactoring 1:1 funktionieren!**

---

## 1. LANDING PAGE (index.html + landing.js)

### 1.1 Welcome Chat
- [ ] Chat-Widget öffnen/schließen
- [ ] Nachrichten senden
- [ ] Beispiel-Fragen anklicken
- [ ] Mock-Modus funktioniert
- [ ] KI-API Integration (wenn Token vorhanden)
- [ ] Typing-Indicator Animation

### 1.2 Quick Upload
- [ ] CSV Drag & Drop Upload
- [ ] Datei-Auswahl Dialog
- [ ] CSV-Parsing und Validierung
- [ ] Fortschrittsanzeige beim Laden

### 1.3 API Token Management
- [ ] Token speichern (localStorage)
- [ ] Token löschen
- [ ] Token anzeigen/verstecken Toggle

### 1.4 Modul-Switcher
- [ ] Versicherung-Modul öffnen
- [ ] Banken-Modul öffnen
- [ ] Risikoscoring-Modul öffnen
- [ ] PMO-Toolbox öffnen
- [ ] Bestandsübertragung öffnen
- [ ] Module korrekt laden (Lazy Loading)
- [ ] Zurück-Navigation funktioniert

### 1.5 Settings
- [ ] Benutzername speichern/laden
- [ ] Upload-Modus Toggle
- [ ] Logo-Upload
- [ ] Profilbild-Upload

---

## 2. VERSICHERUNG DASHBOARD (main.js, data.js, charts.js)

### 2.1 KPI-Grid
- [ ] Alle 9 KPIs werden angezeigt
- [ ] KPI-Werte aus CSV geladen
- [ ] Trend-Indikatoren (grün/rot Pfeile)
- [ ] Klick auf KPI → Chart anzeigen

### 2.2 Charts (Chart.js)
- [ ] Monats-Ansicht
- [ ] Tages-Ansicht
- [ ] Zeitnavigation (vor/zurück)
- [ ] Vollbild-Modus
- [ ] View-Toggle (Linie/Balken/Fläche)

### 2.3 Filter
- [ ] Jahr-Filter
- [ ] Silo-Filter (AO/Makler/Autohaus)
- [ ] Segment-Filter (Leben/Kranken/Schaden)
- [ ] Produkt-Filter
- [ ] Agentur-Filter (Einzelauswahl)
- [ ] Agentur-Multi-Filter (Mehrfachauswahl)
- [ ] Bundesland-Filter (über Karte)
- [ ] Filter-Reset-Button

### 2.4 Tabellen-Ansicht
- [ ] Dashboard ↔ Tabelle umschalten
- [ ] Spalten sortierbar
- [ ] Daten korrekt dargestellt
- [ ] Agent-Ansicht / Aggregat-Ansicht

### 2.5 Landkreis-Karte (Leaflet)
- [ ] Karte wird geladen
- [ ] GeoJSON Bundesländer
- [ ] GeoJSON Regierungsbezirke
- [ ] Klick auf Region → Filter
- [ ] Mehrfachauswahl auf Karte
- [ ] Selection löschen Button

### 2.6 Chat-Widget (chat.js)
- [ ] Chat öffnen/schließen/minimieren
- [ ] Nachrichten senden
- [ ] Mock-Responses
- [ ] KI-API Integration
- [ ] Filter-Befehle per Chat
- [ ] Datenkontext für KI

---

## 3. RISIKOSCORING (risikoscoring.js + partials/risikoscoring-module.html)

### 3.1 Vermittler-Tab
- [ ] Vermittler-Auswahl Dropdown
- [ ] 20+ Parameter-Slider
- [ ] Score-Berechnung
- [ ] Traffic-Light (A/B/C/D)
- [ ] Verteilungs-Chart
- [ ] Statistik-Tabelle

### 3.2 Unternehmen-Tab
- [ ] Silo-Toggle (AO/Makler/Autohaus/Alle)
- [ ] Maßnahmen-Panel
- [ ] Maßnahmen aktivieren/deaktivieren
- [ ] Before/After-Vergleich
- [ ] Distribution-Chart mit Tooltip

### 3.3 KPI-Schätzungen
- [ ] Neugeschäft-Schätzung
- [ ] Bestand-Schätzung
- [ ] Combined Ratio-Schätzung
- [ ] Ertrag-Schätzung
- [ ] Storno-Schätzung
- [ ] Cross-Selling-Schätzung

---

## 4. PROVISIONSSIMULATION (Provisionssimulation.html)

### 4.1 Vermittler-Tab
- [ ] Vermittler-Auswahl
- [ ] Zeitraum-Slider (1-5 Jahre)
- [ ] Segment-Slider (Leben/Kranken/Schaden)
- [ ] Alpha/Beta-Modell Vergleich
- [ ] Delta-Berechnung
- [ ] Segment-Chart
- [ ] Revers-Info aufklappen
- [ ] Commission-Rate Tabellen
- [ ] Reset-Button

### 4.2 Unternehmen-Tab
- [ ] Größenklasse-Auswahl
- [ ] Performer-Filter (High/Mid/Low)
- [ ] Kosten-Berechnung
- [ ] Segment-Kosten aufklappen
- [ ] Reset-Button

---

## 5. BANKEN-MODUL (banken.js + partials/banken-module.html)

### 5.1 Navigation
- [ ] Header-Navigation
- [ ] Dropdown-Menüs
- [ ] Section-Switching
- [ ] Zurück zur Versicherung

### 5.2 Segmentierung (section-segmentierung.html)
- [ ] Segment-Kacheln
- [ ] Klick → Filter aktiv
- [ ] Vollbild-Ansicht
- [ ] Chart-Popup

### 5.3 NPL Dashboard (section-npl.html)
- [ ] NPL-Statistiken
- [ ] NPL-Chart
- [ ] Filter-Optionen

### 5.4 Stage 2 (section-stage2.html)
- [ ] Stage 2 Metriken
- [ ] Trend-Chart

### 5.5 Aufgaben (section-aufgaben.html)
- [ ] Task-Listen (Todo/InProgress/Done)
- [ ] Task-Status ändern
- [ ] Prioritäten

### 5.6 Kunden-Modal (modal-customer-detail.html)
- [ ] Modal öffnen/schließen
- [ ] Kunden-Daten anzeigen
- [ ] Tab-Navigation
- [ ] Aktionen (Mahnung, Zahlungsplan, etc.)

### 5.7 CRM-Profil (crm-profile-view.html)
- [ ] Profil öffnen/schließen
- [ ] 9 Tabs navigieren
- [ ] Kredit-Produkte mit SVG-Charts
- [ ] Dokumente anzeigen/herunterladen
- [ ] KI-Analyse Tab
- [ ] Aktionen (Anruf, E-Mail, Termin)

### 5.8 Document Scanner (modal-document-scanner.html)
- [ ] Modal öffnen
- [ ] Datei-Upload
- [ ] Kamera-Zugriff
- [ ] OCR-Verarbeitung

### 5.9 Feedback-System
- [ ] Feedback-Panel öffnen/schließen
- [ ] Feedback-Typen (Verbesserung/Fehler/Frage/Lob)
- [ ] Feedback absenden
- [ ] Screenshot mit Annotation
- [ ] Feedback-Liste laden

### 5.10 Chat (banken-chat.js)
- [ ] Chat-Widget im Banken-Modul
- [ ] Nachrichten senden
- [ ] Mock/API-Modus

---

## 6. BESTANDSÜBERTRAGUNG (bestand-*.js + partials/bestandsuebertragung-module.html)

### 6.1 Dashboard
- [ ] KPI-Karten anzeigen
- [ ] Status-Verteilung

### 6.2 Vorgänge
- [ ] Vorgänge-Liste
- [ ] Validierung
- [ ] Status-Änderung

### 6.3 Makler-Verwaltung
- [ ] Makler-Liste
- [ ] Makler-Details

### 6.4 E-Mail-Verwaltung
- [ ] E-Mail-Templates
- [ ] E-Mail-Vorschau

### 6.5 Import/Export
- [ ] JSON-Import
- [ ] Demo-Daten laden
- [ ] Export-Funktionen

---

## 7. PMO TOOLBOX (partials/pmo-toolbox-module.html)

### 7.1 Dashboard
- [ ] Quick Stats (Grün/Gelb/Rot)
- [ ] Projekt-Übersicht
- [ ] Status-Karten

### 7.2 Timeline
- [ ] Timeline-Ansicht
- [ ] Meilensteine auf Timeline

### 7.3 Risiken & Issues
- [ ] Risiken-Liste
- [ ] Issue-Tracking

### 7.4 Meilensteine
- [ ] Meilensteine-Liste
- [ ] Status-Anzeige

### 7.5 Aktionen
- [ ] Suche öffnen
- [ ] Neuer Status Modal
- [ ] View-Switching

---

## 8. CSV-GENERATOR (csv-generator.html)

- [ ] Presets (Small/Medium/Large)
- [ ] Monat/Vermittler/Sampling-Eingabe
- [ ] KPI-Inputs
- [ ] Tägliche Daten generieren
- [ ] Monatliche Daten generieren
- [ ] CSV-Download (UTF-8 BOM)
- [ ] Statistik-Anzeige

---

## 9. GUIDED TOUR (guided-tour.js)

- [ ] Tour starten
- [ ] Spotlight-Effekt
- [ ] Tooltip-Anzeige
- [ ] Weiter/Zurück Navigation
- [ ] Progress-Bar
- [ ] Tour beenden

---

## 10. GEMEINSAME FEATURES

### 10.1 Responsive Design
- [ ] Desktop (1400px+)
- [ ] Tablet (768px-1200px)
- [ ] Mobile (< 768px)
- [ ] Touch-Optimierung

### 10.2 Animationen
- [ ] fadeIn
- [ ] slideUp/slideIn
- [ ] pulse
- [ ] shimmer
- [ ] typing

### 10.3 LocalStorage
- [ ] API-Token
- [ ] Benutzername
- [ ] Logo/Profilbild
- [ ] Bestandsübertragung-Daten

---

## VALIDIERUNGS-PROTOKOLL

Nach jedem Refactoring-Schritt:

1. [ ] Browser-Konsole prüfen (keine Errors)
2. [ ] Alle betroffenen Seiten laden
3. [ ] Alle Buttons/Links testen
4. [ ] Alle Formulare testen
5. [ ] Responsive Views prüfen
6. [ ] Animationen funktionieren
7. [ ] LocalStorage funktioniert

---

**Datum:** 2026-01-05
**Status:** PHASE 2 ABGESCHLOSSEN - Bereit für Refactoring
