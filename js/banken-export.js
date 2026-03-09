// ========================================
// DASHBOARD SUMMARY DOWNLOAD
// ========================================

function downloadDashboardSummary() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit'
    });

    let summary = `
################################################################################
################################################################################
##                                                                            ##
##              COLLECTIONS MANAGEMENT - VOLLSTÄNDIGE DOKUMENTATION           ##
##                    Braunschweiger Sparkasse | Forderungsmanagement         ##
##                                                                            ##
################################################################################
################################################################################

Erstellt am: ${dateStr} um ${timeStr} Uhr
Dokumentversion: 2.1 - Vollständige UI/UX Dokumentation

================================================================================
================================================================================
                        TEIL A: BENUTZEROBERFLÄCHE & NAVIGATION
================================================================================
================================================================================

Diese Dokumentation beschreibt vollständig den Aufbau, die Struktur und alle
Interaktionsmöglichkeiten des Collections Management Dashboards.

================================================================================
                    A1. DASHBOARD-STRUKTUR (Von oben nach unten)
================================================================================

Das Dashboard ist wie folgt aufgebaut (in der Reihenfolge von oben nach unten):

┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. HEADER-BEREICH (Ganz oben)                                               │
│    └── Modul-Tabs: [Versicherung] [Banken] [Asset Manager]                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. NAVIGATIONS-KACHELN (4 Stück nebeneinander)                              │
│    └── [Kundensegmentierung] [Bestandskunden] [Offene Leads] [Prozesse]     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. KPI-BOXEN (4 Kennzahlen nebeneinander)                                   │
│    └── [Gesamtkredite] [Forderung] [Schulden/Kunde] [Aufgaben]              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. AKTIONS-LEISTE (Buttons für Hauptaktionen)                               │
│    └── [📷 Dokument scannen] [📥 Bulk-Import] [📄 Zusammenfassung]          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. CHART-BEREICH (2 große Grafiken nebeneinander)                           │
│    └── Links: Willingness/Ability Matrix | Rechts: Portfolio-Entwicklung    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. INFO-KARTEN (2 Karten nebeneinander)                                     │
│    └── Links: Neue Fälle (47) | Rechts: Zahlungseingänge (31)               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. KUNDENLISTE (Scrollbare Tabelle)                                         │
│    └── Liste aller Kunden mit Bewertung und Aktionen                        │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                         A2. MODUL-TABS (Header-Bereich)
================================================================================

Position: Ganz oben auf der Seite
Aussehen: 3 Tabs nebeneinander

┌─────────────────────────────────────────────────────────────────────────────┐
│ TAB                │ KLICK-FUNKTION                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Versicherung       │ Zeigt das Versicherungs-Dashboard mit Kundenseg-       │
│                    │ mentierung, Bestandsanalyse und Vertragsverwaltung     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Banken             │ Zeigt das Collections-Dashboard (dieses Dashboard)     │
│ (AKTIV)            │ mit Forderungsmanagement und Schuldenanalyse           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Asset Manager      │ Zeigt das Asset-Management-Dashboard mit Portfolio-    │
│                    │ übersicht und Vermögensverwaltung                      │
└─────────────────────────────────────────────────────────────────────────────┘

KLICK-VERHALTEN:
• Bei Klick auf einen Tab wird die CSS-Klasse "active" gesetzt
• Der entsprechende Modul-Content wird eingeblendet (display: block)
• Alle anderen Module werden ausgeblendet (display: none)
• Der aktive Tab wird visuell hervorgehoben

================================================================================
                      A3. NAVIGATIONS-KACHELN (4 Kacheln)
================================================================================

Position: Direkt unter dem Header
Aussehen: 4 quadratische Kacheln nebeneinander mit Icons

┌─────────────────────────────────────────────────────────────────────────────┐
│ KACHEL                  │ KLICK-FUNKTION                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Kundensegmentierung  │ Zeigt die Willingness/Ability-Matrix und alle     │
│    (AKTIV)              │ segmentierten Kunden. Hauptansicht für die        │
│                         │ KI-basierte Kundenklassifizierung.                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👥 Bestandskunden       │ Wechselt zur Bestandskundenübersicht mit          │
│                         │ allen aktiven Kundenbeziehungen und deren         │
│                         │ Vertragshistorie.                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📋 Offene Leads         │ Zeigt potentielle Neukunden und offene            │
│                         │ Vertriebschancen im Forderungsbereich.            │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚙️ Prozesse             │ Öffnet die Prozessübersicht mit laufenden         │
│                         │ Inkasso-Vorgängen und Mahnverfahren.              │
└─────────────────────────────────────────────────────────────────────────────┘

KLICK-VERHALTEN:
• Bei Klick wird die Kachel visuell als "aktiv" markiert
• Der zugehörige Content-Bereich wird eingeblendet
• Die Breadcrumb-Navigation wird aktualisiert
• Die URL wird ggf. mit einem Hash-Parameter versehen

================================================================================
                          A4. KPI-BOXEN (4 Kennzahlen)
================================================================================

Position: Unter den Navigations-Kacheln
Aussehen: 4 rechteckige Boxen nebeneinander mit großen Zahlen

┌─────────────────────────────────────────────────────────────────────────────┐
│ KPI-BOX                     │ ANGEZEIGTER WERT        │ KLICK-FUNKTION      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💰 Gesamtkredite            │ 10.234                  │ Filtert die Kunden- │
│    (Total Credits)          │ "+127 zur Vorwoche"     │ liste auf alle      │
│                             │                         │ Fälle               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Ausstehende              │ € 47,8 Mio.             │ Sortiert die Liste  │
│    Gesamtforderung          │ "+€ 1,2 Mio."           │ nach Forderungs-    │
│    (Outstanding)            │                         │ höhe absteigend     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👤 Schulden pro Kunde       │ € 4.672                 │ Zeigt Durchschnitts-│
│    (Avg. Debt per Customer) │ "-€ 89 (Verbesserung)"  │ berechnung-Details  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ Offene Bewertungs-       │ 156                     │ Filtert auf offene  │
│    aufgaben                 │ "23 überfällig"         │ Aufgaben, markiert  │
│    (Pending Tasks)          │                         │ überfällige rot     │
└─────────────────────────────────────────────────────────────────────────────┘

VISUELLES FEEDBACK:
• Hover-Effekt: Box wird leicht angehoben (transform: translateY(-2px))
• Positive Trends: Grüner Pfeil ↑ und grüne Schrift
• Negative Trends: Roter Pfeil ↓ und rote Schrift
• Überfällige Aufgaben: Orange/Rot hervorgehoben

================================================================================
                      A5. AKTIONS-LEISTE (Action Bar)
================================================================================

Position: Unter den KPI-Boxen
Aussehen: Horizontale Leiste mit 3 Buttons

┌─────────────────────────────────────────────────────────────────────────────┐
│ BUTTON                      │ KLICK-FUNKTION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📷 Dokument scannen         │ Öffnet den Document Scanner Modal             │
│    (Scan Document)          │ → Siehe Abschnitt A8 für Details              │
│                             │ JavaScript: openDocumentScanner()             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📥 Bulk-Import              │ Öffnet Datei-Dialog für CSV/Excel-Import      │
│    (Bulk Import)            │ Ermöglicht Massenimport von Kundendaten       │
│                             │ JavaScript: triggerBulkImport()               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📄 Zusammenfassung          │ Lädt diese TXT-Datei herunter                 │
│    (Download Summary)       │ Generiert vollständigen Dashboard-Report      │
│                             │ JavaScript: downloadDashboardSummary()        │
└─────────────────────────────────────────────────────────────────────────────┘

BUTTON-STYLING:
• Primärer Button: Blauer Hintergrund, weißer Text
• Hover: Dunklerer Blauton
• Icons: Font Awesome oder Unicode-Emojis

================================================================================
                     A6. CHART-BEREICH (2 Hauptgrafiken)
================================================================================

Position: Zentral im Dashboard, unter der Aktions-Leiste
Aussehen: 2 große Chart-Container nebeneinander (50%/50%)

┌─────────────────────────────────────────────────────────────────────────────┐
│ CHART                           │ BESCHREIBUNG & INTERAKTIONEN              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 WILLINGNESS vs. ABILITY      │                                           │
│    MATRIX (Links)               │ ANZEIGE:                                  │
│                                 │ • Scatter-Plot mit 4 Quadranten           │
│    X-Achse: Willingness to Pay  │ • Jeder Punkt = 1 Kunde                   │
│    Y-Achse: Ability to Pay      │ • Farben nach Segment (s. unten)          │
│    Größe: Score-Confidence      │                                           │
│                                 │ KLICK-FUNKTIONEN:                         │
│    Quadranten:                  │ • Klick auf Punkt: Öffnet Kunden-Popup    │
│    ┌─────────┬─────────┐        │ • Klick auf Quadrant: Filtert Liste       │
│    │ RESTRUK │ PRIORIT │        │ • Hover: Zeigt Kunden-Kurzinfo            │
│    │ (gelb)  │ (grün)  │        │ • Zoom: Mausrad zum Zoomen               │
│    ├─────────┼─────────┤        │ • Pan: Klicken und Ziehen                │
│    │ ESKALAT │ ABWICK- │        │                                           │
│    │ (orange)│ (rot)   │        │ JavaScript: initScatterPlot()             │
│    └─────────┴─────────┘        │ Bibliothek: Chart.js                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📈 PORTFOLIO-ENTWICKLUNG        │                                           │
│    (Rechts)                     │ ANZEIGE:                                  │
│                                 │ • Linien-Chart mit 12 Monaten             │
│    X-Achse: Monate (12)         │ • 4 farbige Linien (je Segment)           │
│    Y-Achse: Anzahl Fälle        │ • Gesamttrend als gestrichelte Linie      │
│                                 │                                           │
│    Linien:                      │ KLICK-FUNKTIONEN:                         │
│    ── Grün: Priorität           │ • Klick auf Legende: Ein-/Ausblenden      │
│    ── Gelb: Restrukturierung    │ • Hover auf Datenpunkt: Tooltip           │
│    ── Orange: Eskalation        │ • Doppelklick: Zoom auf Zeitraum          │
│    ── Rot: Abwicklung           │                                           │
│    ┄┄ Grau: Gesamt              │ JavaScript: initPortfolioChart()          │
│                                 │ Bibliothek: Chart.js                      │
└─────────────────────────────────────────────────────────────────────────────┘

CHART-INTERAKTIONEN IM DETAIL:

Willingness/Ability Matrix:
• KLICK auf Datenpunkt:
  → Öffnet kleines Popup mit: Name, Score, Segment
  → "Details"-Button im Popup öffnet volles CRM-Profil
• HOVER auf Datenpunkt:
  → Tooltip zeigt: Kundenname, Willingness%, Ability%, Forderung€
• KLICK in Quadrant (freie Fläche):
  → Filtert Kundenliste auf dieses Segment
  → Aktualisiert KPI-Anzeige für das Segment
• ZOOM mit Mausrad:
  → Vergrößert/Verkleinert die Ansicht
• DOPPELKLICK:
  → Setzt Zoom zurück auf Standardansicht

Portfolio-Entwicklung:
• KLICK auf Legende:
  → Blendet entsprechende Linie ein/aus
  → Ermöglicht Fokus auf einzelne Segmente
• HOVER auf Datenpunkt:
  → Zeigt exakten Wert und Monat
  → Zeigt Veränderung zum Vormonat

================================================================================
                       A7. INFO-KARTEN (2 Highlight-Boxen)
================================================================================

Position: Unter den Charts
Aussehen: 2 hervorgehobene Karten mit wichtigen Kennzahlen

┌─────────────────────────────────────────────────────────────────────────────┐
│ KARTE                         │ KLICK-FUNKTION                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🆕 NEUE FÄLLE SEIT LETZTEM    │ ANZEIGE:                                    │
│    LOGIN                      │ • Große Zahl: 47                            │
│                               │ • Untertitel: "Fälle"                       │
│    Badge: Blau                │ • KI-Bewertungsstatus                       │
│                               │                                             │
│                               │ KLICK:                                      │
│                               │ → Filtert Kundenliste auf neue Fälle        │
│                               │ → Sortiert nach Erfassungsdatum             │
│                               │ → Hebt neue Einträge gelb hervor            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💳 ZAHLUNGSEINGÄNGE           │ ANZEIGE:                                    │
│                               │ • Große Zahl: 31                            │
│    Badge: Grün                │ • Untertitel: "Zahlungen erhalten"          │
│                               │ • Trend-Indikator                           │
│                               │                                             │
│                               │ KLICK:                                      │
│                               │ → Filtert auf Kunden mit Zahlungen          │
│                               │ → Zeigt Zahlungshistorie                    │
│                               │ → Ermöglicht Segment-Upgrade                │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                    A8. DOCUMENT SCANNER (Modal-Dialog)
================================================================================

Aufruf: Klick auf "📷 Dokument scannen" in der Aktions-Leiste
Aussehen: Overlay-Modal in der Bildschirmmitte

┌─────────────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT SCANNER - 3-SCHRITT-PROZESS                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCHRITT 1: UPLOAD                                                          │
│  ─────────────────                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │     [📷 Foto aufnehmen]        [📄 PDF hochladen]                   │    │
│  │                                                                     │    │
│  │     ┌─────────────────────────────────────────────────────────┐     │    │
│  │     │                                                         │     │    │
│  │     │          Drag & Drop Zone                               │     │    │
│  │     │          Dokumente hier ablegen                         │     │    │
│  │     │          oder klicken zum Auswählen                     │     │    │
│  │     │                                                         │     │    │
│  │     └─────────────────────────────────────────────────────────┘     │    │
│  │                                                                     │    │
│  │     Unterstützte Formate: JPG, PNG, PDF                             │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  KLICK-FUNKTIONEN SCHRITT 1:                                                │
│  • "Foto aufnehmen": Aktiviert Kamera (falls verfügbar)                     │
│  • "PDF hochladen": Öffnet Datei-Auswahl-Dialog                             │
│  • Drag & Drop: Datei auf Zone ziehen → automatischer Upload                │
│  • Klick auf Zone: Öffnet Datei-Auswahl-Dialog                              │
│                                                                             │
│  JavaScript: handleFileSelect(), handleDragDrop()                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCHRITT 2: KI-ERKENNUNG                                                    │
│  ────────────────────────                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │     [Dokumentvorschau]         KI-Analyse läuft...                  │    │
│  │     ┌───────────────┐          ██████████████░░░░ 75%               │    │
│  │     │               │                                               │    │
│  │     │    Bild/PDF   │          Erkannte Daten:                      │    │
│  │     │               │          ✓ Name: Maria Musterfrau               │    │
│  │     └───────────────┘          ✓ Adresse: Musterstr. 1              │    │
│  │                                ✓ Geburtsdatum: 01.01.1980            │    │
│  │                                ✓ IBAN: DE89...                       │    │
│  │                                ✓ Forderung: € 5.230,00               │    │
│  │                                                                     │    │
│  │     [Erneut scannen]          [Daten übernehmen →]                  │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  AUTOMATISCHE AKTIONEN:                                                     │
│  • OCR-Texterkennung auf Dokument                                           │
│  • KI-Extraktion von: Name, Adresse, Geburtsdatum, IBAN, Beträge            │
│  • Validierung der erkannten Daten                                          │
│  • Confidence-Score für jedes Feld                                          │
│                                                                             │
│  KLICK-FUNKTIONEN SCHRITT 2:                                                │
│  • "Erneut scannen": Zurück zu Schritt 1                                    │
│  • "Daten übernehmen": Weiter zu Schritt 3                                  │
│  • Klick auf Feld: Manuelle Korrektur möglich                               │
│                                                                             │
│  JavaScript: startAIRecognition(), extractDocumentData()                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SCHRITT 3: KUNDE ANLEGEN                                                   │
│  ─────────────────────────                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │     NEUEN KUNDEN ANLEGEN                                            │    │
│  │                                                                     │    │
│  │     Vorname:     [Max____________]   Nachname: [Mustermann___]      │    │
│  │     Straße:      [Musterstraße 1_]   PLZ/Ort: [12345 Berlin_]       │    │
│  │     Geburtsdatum:[01.01.1980_____]   Telefon: [+49 123 456789]      │    │
│  │     E-Mail:      [max@example.de_]   IBAN:    [DE89...]             │    │
│  │                                                                     │    │
│  │     Forderungsdaten:                                                │    │
│  │     Betrag:      [€ 5.230,00_____]   Fälligkeit: [15.01.2025]       │    │
│  │     Produkt:     [Ratenkredit____▼]  Vertragsnr: [KR-2024-1234]     │    │
│  │                                                                     │    │
│  │     KI-Bewertung (automatisch):                                     │    │
│  │     Willingness: 65%  Ability: 72%  Segment: RESTRUKTURIERUNG       │    │
│  │                                                                     │    │
│  │     [Abbrechen]                           [✓ Kunde anlegen]         │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  KLICK-FUNKTIONEN SCHRITT 3:                                                │
│  • Jedes Feld: Editierbar, vorbefüllt mit KI-Daten                          │
│  • "Abbrechen": Schließt Modal ohne zu speichern                            │
│  • "Kunde anlegen": Erstellt neuen Kundendatensatz                          │
│    → Speichert in Datenbank                                                 │
│    → Fügt zur Kundenliste hinzu                                             │
│    → Zeigt Erfolgs-Notification                                             │
│    → Schließt Modal                                                         │
│                                                                             │
│  JavaScript: createNewCustomer(), saveCustomerData()                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

MODAL-STEUERUNG:
• ESC-Taste: Schließt das Modal
• Klick außerhalb: Schließt das Modal
• X-Button oben rechts: Schließt das Modal
• JavaScript: closeDocumentScanner()

================================================================================
                         A9. KUNDENLISTE (Scrollbare Tabelle)
================================================================================

Position: Unterer Bereich des Dashboards
Aussehen: Scrollbare Tabelle mit allen Kunden

┌─────────────────────────────────────────────────────────────────────────────┐
│                              KUNDENLISTE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SPALTENÜBERSCHRIFTEN (Klickbar zum Sortieren):                             │
│  ┌─────┬──────────────┬─────────────┬───────────┬───────────┬─────────────┐ │
│  │ ☐   │ Name       ↕ │ Segment   ↕ │ Score   ↕ │ Betrag  ↕ │ Aktionen    │ │
│  ├─────┼──────────────┼─────────────┼───────────┼───────────┼─────────────┤ │
│  │ ☐   │ Max Muster   │ 🟢 Priorit. │ 85/72     │ € 4.230   │ [👁][✏][📧] │ │
│  │ ☐   │ Anna Beisp.  │ 🟡 Restruk. │ 45/68     │ € 8.900   │ [👁][✏][📧] │ │
│  │ ☐   │ Peter Test   │ 🟠 Eskalat. │ 32/28     │ € 12.500  │ [👁][✏][📧] │ │
│  │ ☐   │ Maria Demo   │ 🔴 Abwickl. │ 72/15     │ € 3.200   │ [👁][✏][📧] │ │
│  │ ...  weitere Einträge ...                                               │ │
│  └─────┴──────────────┴─────────────┴───────────┴───────────┴─────────────┘ │
│                                                                             │
│  [1] [2] [3] ... [47]                              Zeige 1-20 von 10.234    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

SPALTEN-ERKLÄRUNG:
• ☐ Checkbox: Auswahl für Bulk-Aktionen
• Name: Kundenname (Klick → CRM-Profil)
• Segment: Farbiger Badge mit Segmentname
• Score: Willingness/Ability Score (z.B. 85/72)
• Betrag: Offene Forderung in Euro
• Aktionen: Icon-Buttons (siehe unten)

KLICK-FUNKTIONEN:

Spaltenüberschriften:
• Klick auf "Name": Sortiert alphabetisch A-Z / Z-A
• Klick auf "Segment": Gruppiert nach Segment
• Klick auf "Score": Sortiert nach Gesamt-Score
• Klick auf "Betrag": Sortiert nach Forderungshöhe

Zeilen:
• Klick auf Kundenname: Öffnet volles CRM-Profil (Abschnitt A10)
• Klick auf Zeile (nicht Aktionen): Öffnet kleines Info-Popup

Aktions-Buttons pro Zeile:
┌─────────────────────────────────────────────────────────────────────────────┐
│ ICON    │ FUNKTION                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👁 View │ Öffnet Kunden-Schnellansicht                                      │
│         │ → Popup mit Kerndaten und letzten Aktivitäten                     │
│         │ JavaScript: showCustomerQuickView(customerId)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✏ Edit  │ Öffnet Bearbeitungsmodus für Kundendaten                          │
│         │ → Inline-Editing oder Modal-Formular                              │
│         │ JavaScript: editCustomer(customerId)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📧 Mail │ Öffnet E-Mail-Composer mit Kundenadresse                          │
│         │ → Vorlagen-Auswahl für Mahnung/Angebot                            │
│         │ JavaScript: sendCustomerEmail(customerId)                         │
└─────────────────────────────────────────────────────────────────────────────┘

Checkbox-Funktionen:
• Einzelne Checkbox: Wählt Kunden für Bulk-Aktion
• Checkbox in Header: Wählt alle sichtbaren Kunden
• Nach Auswahl erscheint Bulk-Aktions-Leiste:
  → "E-Mail an Auswahl senden"
  → "Segment ändern"
  → "Exportieren"
  → "Löschen"

Pagination:
• Klick auf Seitenzahl: Springt zur Seite
• Klick auf "...": Öffnet Seitenauswahl-Input
• "Zeige X von Y": Klick öffnet Dropdown für 20/50/100 pro Seite

================================================================================
                      A10. CRM-PROFIL (Vollbild-Ansicht)
================================================================================

Aufruf: Klick auf Kundennamen in der Liste
Aussehen: Vollbild-Overlay mit Sidebar-Navigation

┌─────────────────────────────────────────────────────────────────────────────┐
│                         CRM KUNDENPROFIL - VOLLBILD                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────────────────────────────────────────────┐   │
│  │  SIDEBAR    │  │  CONTENT-BEREICH                                    │   │
│  │  NAVIGATION │  │                                                     │   │
│  │             │  │  (Wechselt je nach gewähltem Tab)                   │   │
│  │  [Übersicht]│  │                                                     │   │
│  │  [Stammd.]  │  │                                                     │   │
│  │  [Forder.]  │  │                                                     │   │
│  │  [Zahlungen]│  │                                                     │   │
│  │  [Kommunik.]│  │                                                     │   │
│  │  [Dokumente]│  │                                                     │   │
│  │  [Timeline] │  │                                                     │   │
│  │  [Notizen]  │  │                                                     │   │
│  │  [Analyse]  │  │                                                     │   │
│  │             │  │                                                     │   │
│  │  ─────────  │  │                                                     │   │
│  │  [Aktionen] │  │                                                     │   │
│  │  📧 E-Mail  │  │                                                     │   │
│  │  📞 Anrufen │  │                                                     │   │
│  │  📅 Termin  │  │                                                     │   │
│  │  📝 Notiz   │  │                                                     │   │
│  │             │  │                                                     │   │
│  └─────────────┘  └─────────────────────────────────────────────────────┘   │
│                                                                             │
│                                                          [X Schließen]      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

SIDEBAR-TABS UND IHRE INHALTE:

┌─────────────────────────────────────────────────────────────────────────────┐
│ TAB              │ CONTENT                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📊 Übersicht     │ Dashboard mit KI-Score, Segment-Badge, Key-Metrics       │
│                  │ Risikoampel, letzte Aktivität, Quick-Actions             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 👤 Stammdaten    │ Persönliche Daten: Name, Adresse, Kontakt, Geburtsdatum  │
│                  │ Bankverbindung, Arbeitgeber, Einkommen                   │
│                  │ [Bearbeiten]-Button zum Editieren                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💰 Forderungen   │ Tabelle aller offenen Forderungen                        │
│                  │ Vertragsdetails, Fälligkeiten, Mahnstatus                │
│                  │ IFRS 9 Stage, ECL-Berechnung                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💳 Zahlungen     │ Zahlungshistorie mit allen Ein- und Ausgängen            │
│                  │ Grafik der Zahlungsmuster                                │
│                  │ Ratenzahlungsvereinbarungen                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📧 Kommunikation │ E-Mail-Verlauf, Brief-Historie, Anrufprotokoll           │
│                  │ Versendete Mahnungen mit Datum                           │
│                  │ Schnellversand-Optionen                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📎 Dokumente     │ Vertragsunterlagen, Mahnschreiben, Nachweise             │
│                  │ Upload-Funktion für neue Dokumente                       │
│                  │ Vorschau-Funktion für PDFs                               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📅 Timeline      │ Chronologische Übersicht aller Ereignisse                │
│                  │ Farbkodiert nach Typ (Zahlung, Kontakt, Änderung)        │
│                  │ Filter nach Zeitraum und Ereignistyp                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📝 Notizen       │ Interne Notizen und Vermerke                             │
│                  │ Neue Notiz erstellen                                     │
│                  │ Notizen anderer Mitarbeiter sehen                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🤖 KI-Analyse    │ Detaillierte KI-Bewertung                                │
│                  │ Willingness/Ability Breakdown                            │
│                  │ Prognose und Empfehlungen                                │
│                  │ Confidence-Scores pro Faktor                             │
└─────────────────────────────────────────────────────────────────────────────┘

QUICK-ACTION BUTTONS IN SIDEBAR:
• 📧 E-Mail: Öffnet E-Mail-Composer → crmEmail()
• 📞 Anrufen: Zeigt Telefonnummer, Click-to-Call wenn verfügbar → crmCall()
• 📅 Termin: Öffnet Kalender-Integration → crmSchedule()
• 📝 Notiz: Öffnet Notiz-Editor → crmNote()

SCHLIESSEN DES CRM-PROFILS:
• X-Button oben rechts
• ESC-Taste
• Klick außerhalb des Modals
• JavaScript: closeCrmProfile()

================================================================================
                       A11. KEYBOARD-SHORTCUTS (Tastenkürzel)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ TASTENKÜRZEL      │ FUNKTION                                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ ESC               │ Schließt jedes geöffnete Modal/Overlay                  │
│ Ctrl + S          │ Speichert aktuelle Änderungen (wenn im Edit-Modus)      │
│ Ctrl + F          │ Öffnet Schnellsuche in der Kundenliste                  │
│ ↑ / ↓             │ Navigation in der Kundenliste                           │
│ Enter             │ Öffnet ausgewählten Kunden im CRM-Profil                │
│ Tab               │ Springt zum nächsten interaktiven Element               │
│ Ctrl + P          │ Druckt aktuelle Ansicht                                 │
│ ?                 │ Zeigt Hilfe-Overlay mit allen Shortcuts                 │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
================================================================================
                           TEIL B: PORTFOLIO-DATEN & ANALYSE
================================================================================
================================================================================

================================================================================
                              B1. EXECUTIVE SUMMARY
================================================================================

Dieses Dashboard bietet eine umfassende Übersicht über das Forderungsportfolio
der Braunschweiger Sparkasse. Die KI-gestützte Analyse klassifiziert jeden
Kunden anhand von Transaktionsmustern, externen Datenquellen und historischem
Verhalten nach Zahlungsbereitschaft (Willingness to Pay) und Zahlungsfähigkeit
(Ability to Pay).

================================================================================
                           B2. PORTFOLIO-KENNZAHLEN (KPIs)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ KENNZAHL                      │ AKTUELLER WERT     │ VERÄNDERUNG           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Gesamtkredite                 │ 10.234 Fälle       │ +127 zur Vorwoche     │
│ Ausstehende Gesamtforderung   │ € 47,8 Mio.        │ +€ 1,2 Mio. (Vorwoche)│
│ Ø Schulden pro Kunde          │ € 4.672            │ -€ 89 (Verbesserung)  │
│ Offene Bewertungsaufgaben     │ 156 Aufgaben       │ 23 überfällig         │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                     B3. KUNDENSEGMENTIERUNG (WILLINGNESS/ABILITY MATRIX)
================================================================================

Die Matrix segmentiert Kunden in vier Quadranten basierend auf ihrer
Zahlungsbereitschaft (X-Achse) und Zahlungsfähigkeit (Y-Achse):

┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  RESTRUKTURIERUNG (Oben Links)        │  PRIORITÄT (Oben Rechts)            │
│  • Hohe Ability, Niedrige Willingness │  • Hohe Ability, Hohe Willingness   │
│  • Anzahl: 3.120 Fälle                │  • Anzahl: 2.340 Fälle              │
│  • Strategie: Ratenzahlung,           │  • Strategie: Schnelle Vereinbarung │
│    Schuldnerberatung                  │    Zahlungsplan                     │
│                                       │                                     │
├───────────────────────────────────────┼─────────────────────────────────────┤
│                                       │                                     │
│  ESKALATION (Unten Links)             │  ABWICKLUNG (Unten Rechts)          │
│  • Niedrige Ability & Willingness     │  • Niedrige Ability, Hohe Willing.  │
│  • Anzahl: 1.890 Fälle                │  • Anzahl: 2.884 Fälle              │
│  • Strategie: Inkasso, Mahnverfahren, │  • Strategie: Verkauf, Abschreibung,│
│    Gerichtliche Schritte              │    Restrukturierung                 │
│                                       │                                     │
└─────────────────────────────────────────────────────────────────────────────┘

VERTEILUNG GESAMT:
• Priorität (Grün):         2.340 Fälle (22,9%)  - Schnellste Rückzahlung
• Restrukturierung (Gelb):  3.120 Fälle (30,5%)  - Mittleres Risiko
• Eskalation (Orange):      1.890 Fälle (18,5%)  - Hohes Risiko
• Abwicklung (Rot):         2.884 Fälle (28,2%)  - Kritisch

================================================================================
                           B4. PORTFOLIO-ENTWICKLUNG (12 MONATE)
================================================================================

Entwicklung des Forderungsportfolios in den letzten 12 Monaten:

┌─────────────────────────────────────────────────────────────────────────────┐
│ METRIK                        │ WERT                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Neuzugänge (pro Monat)        │ +847 Fälle durchschnittlich                 │
│ Abgänge (regulär)             │ -523 Fälle durchschnittlich                 │
│ Netto-Veränderung             │ +324 Fälle pro Monat                        │
│ Trend                         │ Ansteigend (Portfoliowachstum)              │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                      B5. NEUE FÄLLE SEIT LETZTEM LOGIN
================================================================================

Anzahl neuer Fälle seit dem letzten Dashboard-Aufruf: 47 Fälle

Diese neuen Fälle wurden automatisch durch die KI bewertet und den
entsprechenden Segmenten zugeordnet. Eine manuelle Überprüfung wird
für Fälle mit niedriger Confidence-Score empfohlen.

================================================================================
                           B6. ZAHLUNGSEINGÄNGE
================================================================================

Positive Entwicklungen - Kunden mit erfolgten Zahlungen: 31 Fälle

Diese Fälle zeigen Zahlungsaktivität und sollten ggf. im Segment
nach oben korrigiert werden.

================================================================================
                       B7. SEGMENTSPEZIFISCHE HANDLUNGSEMPFEHLUNGEN
================================================================================

PRIORITÄT (Grüne Zone - 2.340 Fälle):
────────────────────────────────────
✓ Schnelle Kontaktaufnahme für Zahlungsvereinbarung
✓ Flexible Ratenzahlungsangebote
✓ Hohe Erfolgswahrscheinlichkeit bei zeitnaher Bearbeitung
✓ Durchschnittliche Recovery Rate: 85-95%

RESTRUKTURIERUNG (Gelbe Zone - 3.120 Fälle):
────────────────────────────────────────────
✓ Individuelle Schuldnerberatung anbieten
✓ Langfristige Ratenpläne entwickeln
✓ Kontakt zu Sozialberatung bei Bedarf
✓ Durchschnittliche Recovery Rate: 60-75%

ESKALATION (Orange Zone - 1.890 Fälle):
───────────────────────────────────────
! Inkasso-Verfahren einleiten
! Gerichtliches Mahnverfahren prüfen
! Vermögensauskunft einholen
! Durchschnittliche Recovery Rate: 25-40%

ABWICKLUNG (Rote Zone - 2.884 Fälle):
─────────────────────────────────────
✗ Verkauf an Inkasso-Dienstleister prüfen
✗ Abschreibung nach Einzelfallprüfung
✗ Restschuldbefreiung bei Insolvenz
✗ Durchschnittliche Recovery Rate: 5-15%

================================================================================
                           B8. IFRS 9 STAGE KLASSIFIZIERUNG
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE       │ BESCHREIBUNG                  │ FÄLLE    │ VOLUMEN           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Stage 1     │ Performing (< 30 DPD)         │ 5.010    │ € 18,2 Mio.       │
│ Stage 2     │ Underperforming (30-90 DPD)   │ 2.880    │ € 15,4 Mio.       │
│ Stage 3     │ Non-Performing (> 90 DPD)     │ 2.344    │ € 14,2 Mio.       │
└─────────────────────────────────────────────────────────────────────────────┘

DPD = Days Past Due (Tage überfällig)

================================================================================
                           B9. ERWARTETE KREDITVERLUSTE (ECL)
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE       │ ECL-QUOTE      │ RÜCKSTELLUNG                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Stage 1     │ 0,8%           │ € 145.600                                   │
│ Stage 2     │ 8,5%           │ € 1.309.000                                 │
│ Stage 3     │ 45,2%          │ € 6.418.400                                 │
│ GESAMT      │                │ € 7.873.000                                 │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
                           B10. KI-MODELL PERFORMANCE
================================================================================

Accuracy der Segmentierung:          94,2%
Precision (Willingness to Pay):      91,8%
Precision (Ability to Pay):          93,5%
F1-Score gesamt:                     92,4%

Datenquellen für KI-Analyse:
• Transaktionshistorie (intern)
• SCHUFA-Score (extern)
• Kontoführungsverhalten (intern)
• Externe Wirtschaftsdaten
• Historisches Zahlungsverhalten

================================================================================
                              B11. OFFENE AUFGABEN
================================================================================

Meine aktuellen Aufgaben im Forderungsmanagement:

┌─────────────────────────────────────────────────────────────────────────────┐
│ PRIORITÄT   │ AUFGABE                                   │ FÄLLIGKEIT       │
├─────────────────────────────────────────────────────────────────────────────┤
│ HOCH        │ 23 überfällige Bewertungsaufgaben         │ Sofort           │
│ MITTEL      │ Neue Fälle prüfen (47 Stück)              │ Heute            │
│ MITTEL      │ Zahlungseingänge verifizieren (31 Stück)  │ Diese Woche      │
│ NIEDRIG     │ Portfolio-Review für Q4                   │ Ende des Monats  │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
================================================================================
                     TEIL C: JAVASCRIPT-FUNKTIONEN REFERENZ
================================================================================
================================================================================

Übersicht aller JavaScript-Funktionen und ihre Aufrufe:

┌─────────────────────────────────────────────────────────────────────────────┐
│ FUNKTION                        │ AUFRUF / TRIGGER                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ MODUL & NAVIGATION                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ initModuleSelector()            │ DOMContentLoaded Event                    │
│ switchModule(moduleId)          │ Klick auf Modul-Tab                       │
│ navigateToTile(tileId)          │ Klick auf Navigations-Kachel              │
├─────────────────────────────────────────────────────────────────────────────┤
│ CHARTS                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ initBankenCharts()              │ Nach Modul-Wechsel zu Banken              │
│ initScatterPlot()               │ Automatisch durch initBankenCharts        │
│ initPortfolioChart()            │ Automatisch durch initBankenCharts        │
├─────────────────────────────────────────────────────────────────────────────┤
│ DOCUMENT SCANNER                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ openDocumentScanner()           │ Klick auf "Dokument scannen" Button       │
│ closeDocumentScanner()          │ Klick auf X, ESC, oder außerhalb Modal    │
│ handleFileSelect(event)         │ Datei-Auswahl oder Drag & Drop            │
│ startAIRecognition()            │ Nach erfolgreichem Upload                 │
│ showRecognitionResults(data)    │ Nach KI-Analyse                           │
│ createNewCustomer()             │ Klick auf "Kunde anlegen" Button          │
├─────────────────────────────────────────────────────────────────────────────┤
│ CRM PROFIL                                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ openCrmProfile(customerId)      │ Klick auf Kundennamen in Liste            │
│ closeCrmProfile()               │ X-Button, ESC, oder außerhalb             │
│ showCrmSection(sectionId)       │ Klick auf Sidebar-Tab                     │
│ crmCall()                       │ Klick auf Anrufen-Button                  │
│ crmEmail()                      │ Klick auf E-Mail-Button                   │
│ crmSchedule()                   │ Klick auf Termin-Button                   │
│ crmNote()                       │ Klick auf Notiz-Button                    │
│ editStammdaten()                │ Klick auf Bearbeiten in Stammdaten        │
├─────────────────────────────────────────────────────────────────────────────┤
│ KUNDENLISTE                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ sortCustomerList(column)        │ Klick auf Spaltenüberschrift              │
│ filterBySegment(segment)        │ Klick auf Quadrant in Matrix              │
│ selectCustomer(customerId)      │ Klick auf Checkbox                        │
│ selectAllCustomers()            │ Klick auf Header-Checkbox                 │
│ showCustomerQuickView(id)       │ Klick auf Auge-Icon                       │
│ editCustomer(id)                │ Klick auf Stift-Icon                      │
│ sendCustomerEmail(id)           │ Klick auf Mail-Icon                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ UTILITIES                                                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ downloadDashboardSummary()      │ Klick auf "Zusammenfassung" Button        │
│ showNotification(msg, type)     │ Nach jeder wichtigen Aktion               │
│ triggerBulkImport()             │ Klick auf "Bulk-Import" Button            │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
================================================================================
                           TEIL D: SYSTEM-INFORMATIONEN
================================================================================
================================================================================

Dashboard-Version:      Collections Management v2.1
Datenstand:             ${dateStr}, ${timeStr}
Nächste Aktualisierung: Automatisch alle 15 Minuten
Datenquelle:            SAP Banking Core + KI-Modul
Benutzer:               [Aktueller Benutzer]

================================================================================
                              KONTAKT & SUPPORT
================================================================================

Bei Fragen zum Dashboard oder zur Segmentierung:
• IT-Support: support@braunschweiger-sparkasse.de
• Fachliche Fragen: collections@braunschweiger-sparkasse.de
• Notfall-Hotline: +49 531 XXX-XXXX

================================================================================
                                   DISCLAIMER
================================================================================

Dieses Dokument enthält vertrauliche Informationen und ist ausschließlich für
den internen Gebrauch bestimmt. Die KI-gestützten Empfehlungen dienen als
Entscheidungshilfe und ersetzen nicht die fachliche Einzelfallprüfung.

################################################################################
################################################################################
##                                                                            ##
##                    © 2025 Braunschweiger Sparkasse                         ##
##                       Collections Management System                        ##
##                         Vollständige Dokumentation                         ##
##                                                                            ##
################################################################################
################################################################################
`;

    // Create and download file
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collections-dashboard-zusammenfassung-${now.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Dashboard-Zusammenfassung wurde heruntergeladen', 'success');
}

// Export download function
window.downloadDashboardSummary = downloadDashboardSummary;
window.__registerModule('banken-export.js');
