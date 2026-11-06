// Steckbriefe aller Apps für DEX-Pakete.
//
// ordner    Ordnername (zugleich Webadresse: /<ordner>/download/<id>.zip)
// id        wird abgeleitet: Ordnername in Kleinbuchstaben (das Format erlaubt nur a-z 0-9 _ -)
// art       'vite' (Build mit Vite, Ausgabe in dist/) oder 'html' (reine HTML-App ohne Build)
// version   Mindestversion; pack.mjs zählt die dritte Stelle selbst hoch, sobald sich
//           der Inhalt des Pakets ändert (Stand in tools/dex/stand.json). Für einen
//           größeren Sprung hier z. B. '1.1.0' eintragen.
// start     Startadresse relativ zu app/ bzw. single.html
// single    false, wenn single.html nicht sinnvoll baubar ist (Videos, > 25 MB)
// api       Server-Funktionen der Plattform (Cloudflare functions/), die lokal fehlen
// benoetigtInternet  Schriften, Logos, Karten, CDNs oder direkte KI-Aufrufe aus dem Netz

const LISTE = [
  {
    ordner: '01_asset-management', art: 'vite', version: '1.0.0',
    titel: 'Active Equities',
    beschreibung: 'Portfolio-Management-Dashboard für einen Aktienfonds: Positionen, Performance, Risiko und Markt im Überblick.',
    start: 'index.html', benoetigtInternet: true, api: [],
  },
  {
    ordner: '02_BankenKPI', art: 'vite', version: '1.0.0',
    titel: 'Banken-KPI',
    beschreibung: 'Monatlicher KPI-Bericht einer Bank mit KI-Kommentar zu Ertrag, Risiko und Vertrieb.',
    start: 'index.html', benoetigtInternet: true, api: [],
  },
  {
    ordner: '03_banking-horizon', art: 'vite', version: '1.0.0',
    titel: 'Banking Horizon 2030',
    beschreibung: 'Begehbares Strukturbild der Bank 2030 mit acht Dimensionen, Hypothesen, Videos und eingebetteten Demos für Workshops.',
    start: 'index.html', single: false, benoetigtInternet: true,
    api: ['/api/content', '/api/review', '/api/upload'],
  },
  {
    ordner: '05_Bestandsuebertragung', art: 'vite', version: '1.0.0',
    titel: 'Bestandsübertragung',
    beschreibung: 'Portfolio Transfer Management: Vertragsübertragungen zwischen Vermittlern steuern, Dokumente per KI prüfen und Vorlagen erzeugen.',
    start: 'index.html', benoetigtInternet: true, api: [],
  },
  {
    ordner: '06_Collections', art: 'vite', version: '1.0.0',
    titel: 'Collections Management',
    beschreibung: 'AI Collections & Recovery: Cockpit mit Next-Best-Action-Queue, Agenten-Freigaben, Portfolio-Segmentierung und Risiko-Monitoring.',
    start: 'index.html', benoetigtInternet: true, api: [],
  },
  {
    ordner: '07_ControlHub', art: 'vite', version: '1.0.0',
    titel: 'ControlHub',
    beschreibung: 'KI-gestützte Analyse und Optimierung des internen Kontrollsystems (IKS).',
    start: 'index.html', benoetigtInternet: true, api: [],
  },
  {
    ordner: '13_HRPipeline', art: 'vite', version: '1.0.0',
    titel: 'HR Pipeline',
    beschreibung: 'Recruiting und Bewerbermanagement: Pipeline, Kandidatenprofile und Auswertungen.',
    start: 'index.html', benoetigtInternet: true, api: [],
  },
  {
    ordner: '14_kreditanalyse', art: 'vite', version: '1.0.0',
    titel: 'KI-Kreditanalyse',
    beschreibung: 'KI-gestützte Kreditbewertung für Firmenkunden: Antrag, Bilanzanalyse, Rating, Sicherheiten und Kreditrahmen.',
    start: 'index.html', benoetigtInternet: true, api: [],
  },
  {
    ordner: '15_pdfeditor', art: 'vite', version: '1.0.0',
    titel: 'PDF-Editor',
    beschreibung: 'Text in bestehenden PDFs ändern, verschieben, löschen und ergänzen, die Originalschrift bleibt erhalten; mit Stapelmodus.',
    start: 'index.html', benoetigtInternet: true, api: [],
  },
  {
    ordner: '16_PMOToolbox', art: 'html', version: '1.0.0',
    titel: 'PMO Toolbox',
    beschreibung: 'Steuerung eines Transformationsprogramms: Dashboard, KPI-Karten, Value Map, Frühwarnungen und Statusbericht als PowerPoint.',
    start: 'index.html', benoetigtInternet: false, api: [],
    html: {
      partial: 'partials/pmo-toolbox-module.html',
      container: 'pmoToolboxModule',
      module: ['js/modules/pmo-toolbox.esm.js'],
      dateien: { 'assets/2025_CPE_Status_Template.pptx': 'assets/2025_CPE_Status_Template.pptx' },
    },
  },
  {
    ordner: '17_provisionsreklamation', art: 'vite', version: '1.0.0',
    titel: 'Provisionsreklamation',
    beschreibung: 'KI-gestützte Prüfung von Provisionsreklamationen der Vermittler mit Analyse, Bewertung und Antwortentwurf.',
    start: 'index.html', benoetigtInternet: true, api: [],
  },
  {
    ordner: '18_Risikoscoring', art: 'html', version: '1.0.0',
    titel: 'Vermittler-Scoring',
    beschreibung: 'Risikobewertung von Vermittlern mit Scoring, Frühindikatoren und Analyse.',
    start: 'index.html', benoetigtInternet: false, api: [],
    html: {
      partial: 'partials/risikoscoring-module.html',
      container: 'risikoscoringModule',
      skripte: ['js/risikoscoring-data.js', 'js/risikoscoring-ui.js'],
      init: "if (typeof initRisikoscoring === 'function') initRisikoscoring();",
      ordner: ['18_Risikoscoring/fonts'],
    },
  },
  {
    ordner: '19_Versicherungs1x1', art: 'vite', version: '1.0.0',
    titel: 'Versicherungs-1×1',
    beschreibung: 'Wissensprodukt für neue Berater: 13 Kapitel zum deutschen Versicherungsmarkt in drei Tiefen, mit Wissenscheck und Glossar.',
    start: 'index.html', benoetigtInternet: false, api: [],
  },
  {
    ordner: '21_vertragsumstellung', art: 'vite', version: '1.0.0',
    titel: 'Vergütungswerk',
    beschreibung: 'Vergütungsmodell simulieren und umstellen: Simulationskasten für das Gesamtmodell und Umstellungstool je Institut mit Verhandlungsmodus.',
    start: 'index.html#/start', benoetigtInternet: false, api: [],
  },
  {
    ordner: '22_vertriebsarbeitsplatz', art: 'vite', version: '1.0.0',
    titel: 'KI-Vertriebsarbeitsplatz',
    beschreibung: 'Cockpit für Berater in Versicherung, Banking und Vermögensverwaltung: Kundenakte, KI-Leads, Termine und Vertriebsassistent.',
    start: 'index.html#/versicherung/landing', benoetigtInternet: true, api: ['/api/claude'],
  },
  {
    ordner: '23_VSTCockpit', art: 'vite', version: '1.0.0',
    titel: 'VST-Cockpit',
    beschreibung: 'Vertriebssteuerung mit Live-Strom der Abschlüsse, Kennzahlen zu Bestand und Neugeschäft und einem KI-Assistenten, der Dashboards baut.',
    start: 'index.html', benoetigtInternet: true, api: [],
  },
]

export const APPS = LISTE.map((a) => ({ ...a, id: a.ordner.toLowerCase() }))

export const appNach = (name) => APPS.find((a) => a.id === name.toLowerCase())
