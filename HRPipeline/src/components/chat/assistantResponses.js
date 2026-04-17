// Canned KI-Assistant responses for the demo.
// Separated per Mode (bewerber vs. arbeitgeber) and per Institut (insurance vs. generic).

const STARTERS = {
  bewerber: {
    insurance: [
      'Welche Stellen passen zu mir?',
      'Profil verbessern?',
      'Wie geht es nach der Bewerbung weiter?'
    ],
    generic: [
      'Welche Stellen passen zu mir?',
      'Profil verbessern?',
      'Wie geht es nach der Bewerbung weiter?'
    ]
  },
  arbeitgeber: {
    insurance: [
      'Top-3 Kandidaten für Agenturleiter Düsseldorf',
      'Wie ist der aktuelle Stand für Vertriebsspezialist Leben Köln?',
      'Wie lange ist die Stelle schon ausgeschrieben?'
    ],
    generic: [
      'Top-3 Kandidaten für Senior HR Business Partner',
      'Wie ist der aktuelle Stand für Senior HR Business Partner?',
      'Wie lange ist die Stelle schon ausgeschrieben?'
    ]
  },
  cockpit: {
    insurance: [
      'Welche Regionaldirektion hat den niedrigsten Health Score?',
      'Wo steigt die Fluktuation besonders stark?',
      'Welche Maßnahmen empfiehlst du kurzfristig?'
    ],
    generic: [
      'Welche Business Unit hat den niedrigsten Health Score?',
      'Wo ist die Fluktuation kritisch?',
      'Welche Maßnahmen empfiehlst du kurzfristig?'
    ]
  }
};

const WELCOME = {
  bewerber: {
    insurance: 'Willkommen! Ich bin der ERGO KI-Recruiting-Assistent und helfe Ihnen bei Fragen zu Stellen, Profil und Bewerbungsablauf.',
    generic: 'Willkommen! Ich bin der Zukunfts AG KI-Recruiting-Assistent und helfe bei Fragen zu Stellen, Profil und Bewerbungsablauf.'
  },
  arbeitgeber: {
    insurance: 'Willkommen im Recruiter-Cockpit. Ich unterstütze bei Kandidatenranking, Pipeline und Stellen-Status.',
    generic: 'Willkommen im Recruiter-Cockpit. Ich unterstütze bei Kandidatenranking, Pipeline und Stellen-Status.'
  },
  cockpit: {
    insurance: 'Willkommen im HR-Cockpit. Ich liefere KI-Analysen zu Health Score, Fluktuation und Frühwarnindikatoren der Regionaldirektionen.',
    generic: 'Willkommen im HR-Cockpit. Ich liefere KI-Analysen zu Health Score, Fluktuation und Frühwarnindikatoren der Business Units.'
  }
};

const FALLBACK =
`Dazu habe ich in diesem Demo-Umfeld noch keine hinterlegte Antwort. Versuchen Sie es mit einer der Vorschlagsfragen oder formulieren Sie Ihre Frage um.

Hinweis:
- Diese Demo zeigt KI-Antworten auf Basis hinterlegter Inhalte.
- In der Produktivversion antwortet ein mit unseren HR-Daten und Richtlinien trainiertes Modell.`;

const BEWERBER_INSURANCE = {
  'welche stellen': `Top-Matches basierend auf Ihrem Profil:

1. Agenturleiter Düsseldorf
- Score: 92
- Pendelweg: 0 km
- Warum empfohlen: **IHK §34d**, 8 Jahre AO-Vertrieb

2. Vertriebsspezialist Leben Köln
- Score: 85
- Pendelweg: 40 km
- Warum empfohlen: Leben-Fokus in Vorrolle, IHK §34d

3. Maklerbetreuer Essen
- Score: 80
- Pendelweg: 30 km
- Warum empfohlen: Erfahrung im Maklerkanal

Quellen:
- Profil-Analyse (CV + LinkedIn)
- Stellen-Matrix ERGO §34d-Rollen`,
  'profil verbessern': `Empfehlungen zur Score-Steigerung:

1. IHK §34d Sachkundeprüfung
- Erwarteter Effekt: **+15 Punkte**
- Dauer: 4–6 Wochen

2. IDD-Weiterbildung (15 h/Jahr)
- Erwarteter Effekt: **+4 Punkte**

3. Fachwirt für Versicherungen (IHK)
- Erwarteter Effekt: **+8 Punkte**
- Voraussetzung für Führungsrollen

Quellen:
- ERGO Skill-Matrix
- IHK Bildungsträger-Empfehlungen`,
  'wie geht es nach der bewerbung': `Typischer Ablauf nach Eingang Ihrer Bewerbung:

1. KI-Vorauswahl
- Dauer: innerhalb **24 h**
- Ergebnis: Shortlist an das Recruiting-Team

2. Recruiter-Review
- Dauer: 2–5 Werktage
- Qualifizierte Rückmeldung per E-Mail

3. Erstgespräch
- Format: Video-Interview, ca. 30 Min.
- Inhalt: Motivation, Profil, Erwartungen

4. Fachgespräch mit Fachbereich
- Format: vor Ort oder Video, ca. 60 Min.
- Inhalt: Fachfragen, Case Study

5. Entscheidung & Angebot
- Dauer: in der Regel **innerhalb einer Woche** nach dem Fachgespräch
- Ergebnis: Vertragsangebot oder strukturiertes Feedback

Quellen:
- ERGO Recruiting-Prozess
- EU AI Act §Art. 22 Human-in-the-Loop`
};

const BEWERBER_GENERIC = {
  'welche stellen': `Top-Matches basierend auf Ihrem Profil:

1. Senior HR Business Partner Berlin
- Score: 91
- Pendelweg: 0 km
- Warum empfohlen: **8 Jahre HR BP**, M.Sc. A&O-Psychologie

2. Data Analyst Köln
- Score: 80
- Pendelweg: 580 km
- Warum empfohlen: PL-300, M.Sc. Data Science in Arbeit

3. Junior Recruiter Berlin
- Score: 76
- Pendelweg: 0 km
- Warum empfohlen: HR-Hintergrund, Change-Erfahrung

Quellen:
- Profil-Analyse (CV + LinkedIn)
- Stellen-Matrix Zukunfts AG (alle Jobfamilien)`,
  'profil verbessern': `Empfehlungen zur Score-Steigerung:

1. Passende Zertifikate
- Beispiele: **PL-300**, AWS SA, SHRM-CP, Scrum
- Erwarteter Effekt: +4 bis +8 Punkte je Zertifikat

2. Führungs-/Projekterfahrung dokumentieren
- Lead-Rolle in zwei abgeschlossenen Projekten sichtbar machen
- Erwarteter Effekt: **+6 Punkte**

3. LinkedIn pflegen
- Empfehlungen einholen, Publikationen verlinken
- Erwarteter Effekt: +3 Punkte

Quellen:
- Zukunfts AG Skill-Matrix
- Interne Best Practices Talent Acquisition`,
  'wie geht es nach der bewerbung': `Typischer Ablauf nach Eingang Ihrer Bewerbung:

1. KI-Vorauswahl
- Dauer: innerhalb **24 h**
- Ergebnis: Shortlist an das Recruiting-Team

2. Recruiter-Review
- Dauer: 2–5 Werktage
- Qualifizierte Rückmeldung per E-Mail

3. Erstgespräch
- Format: Video-Interview, ca. 30 Min.
- Inhalt: Motivation, Profil, Erwartungen

4. Fachgespräch mit Hiring Manager
- Format: vor Ort oder Video, ca. 60–90 Min.
- Inhalt: Fachfragen, Case Study, Team-Fit

5. Entscheidung & Angebot
- Dauer: in der Regel **innerhalb einer Woche** nach dem Fachgespräch
- Ergebnis: Vertragsangebot oder strukturiertes Feedback

Quellen:
- Zukunfts AG Recruiting-Prozess
- EU AI Act Art. 22 Human-in-the-Loop`
};

const ARBEITGEBER_INSURANCE = {
  'top-3 kandidaten': `Top-3 Kandidaten für **Agenturleiter Düsseldorf**:

1. Max Berger
- Score: 92
- Highlights: 8J Allianz AO, IHK §34d, Fachwirt
- Pendelweg: 0 km

2. Julia Hoffmann
- Score: 88
- Highlights: 5J HDI Makler, §34d, Teamleitung
- Pendelweg: 40 km

3. Markus Scholz
- Score: 84
- Highlights: 6J Sparkasse, §34f, starkes Netzwerk
- Pendelweg: 60 km

Quellen:
- KI-Matching Pipeline (30 Tage)
- Recruiter-Review`,
  'aktuelle stand': `Aktueller Stand **Vertriebsspezialist Leben Köln**:

1. Bewerbungseingänge
- Gesamt: 14
- Empfohlen: 4, Prüfen: 6, Ablehnung empfohlen: 4

2. Nächste Schritte
- 2 Erstgespräche diese Woche geplant
- 1 Fachgespräch kommende Woche

3. Pipeline-Gesundheit
- Durchschnittliche Time-to-Shortlist: **3,4 Tage**

Quellen:
- Recruiting-Pipeline Köln-Leben
- Kalender Recruiting-Team`,
  'wie lange ist die stelle': `Ausschreibungszeit **Agenturleiter Düsseldorf**:

- Online seit: **18 Werktage**
- Benchmark Branche: 22 Werktage
- Status: im grünen Bereich

Empfehlung: Stelle noch 5 Werktage aktiv lassen und parallel die Top-3 in Erstgespräche bringen.

Quellen:
- Jobs-CMS
- Benchmarks Versicherungsbranche`
};

const ARBEITGEBER_GENERIC = {
  'top-3 kandidaten': `Top-3 Kandidaten für **Senior HR Business Partner Berlin**:

1. Laura Schneider
- Score: 91
- Highlights: 8J HR BP, M.Sc. A&O-Psychologie, SHRM-CP
- Pendelweg: 0 km

2. Anna Klein
- Score: 83
- Highlights: 6J HR Generalist, Change-Projekte
- Pendelweg: 0 km

3. Tobias Meier
- Score: 78
- Highlights: 5J HR BP mittelständisch, Coach-Ausbildung
- Pendelweg: 50 km

Quellen:
- KI-Matching Pipeline (30 Tage)
- Recruiter-Review`,
  'aktuelle stand': `Aktueller Stand **Senior HR Business Partner Berlin**:

1. Bewerbungseingänge
- Gesamt: 18
- Empfohlen: 5, Prüfen: 8, Ablehnung empfohlen: 5

2. Nächste Schritte
- 3 Erstgespräche diese Woche geplant
- 1 Fachgespräch mit Hiring Manager kommende Woche

3. Pipeline-Gesundheit
- Durchschnittliche Time-to-Shortlist: **3,1 Tage**

Quellen:
- Recruiting-Pipeline Berlin
- Kalender Recruiting-Team`,
  'wie lange ist die stelle': `Ausschreibungszeit **Senior HR Business Partner Berlin**:

- Online seit: **21 Werktage**
- Benchmark Markt: 28 Werktage
- Status: im grünen Bereich

Empfehlung: Stelle weitere 5 Werktage aktiv lassen und die Top-3 parallel ins Erstgespräch nehmen.

Quellen:
- Jobs-CMS
- Benchmarks Talent Market`
};

const COCKPIT_COMMON = {
  'niedrigsten health score': `Die drei kritischsten Einheiten (Health Score):

1. Kritische Einheit
- Health Score unter 40 → tiefrote Kategorie
- Treiber: **erhöhte Fluktuation**, Vakanzen und Engagement

2. Beobachtungsliste
- Health Score 40–60 → gelb
- Treiber: steigende Fluktuation, moderat angespannte Vakanzenquote

3. Empfohlene Maßnahmen
- Bleibegespräche mit Schlüsselpersonen priorisieren
- Vakanzen-Fast-Track aktivieren
- Führungskräfte-Coaching für betroffene Einheiten

Quellen:
- HR-Data Warehouse (90-Tage-Fenster)
- Frühwarnmodell (AUC 0.87)`,
  'fluktuation': `Fluktuations-Hotspots:

- Einheiten mit Fluktuationsrate > 14 % sind im roten Bereich.
- Kombination aus hoher Fluktuation **und** niedrigem Engagement ist der stärkste Frühindikator für Abgänge in den nächsten 4 Monaten.

Empfehlung:
- Zielgerichtete Bleibegespräche innerhalb von 14 Tagen
- Stay-Interviews in den drei kritischsten Einheiten
- Management-Briefing für den Vorstand

Quellen:
- HR-Data Warehouse
- Frühwarnmodell (Recall 82 %)`,
  'massnahmen': `Kurzfristige Empfehlungen (0–90 Tage):

1. Bleibegespräche in roten Einheiten
- Ziel: Top-20 Performer identifizieren und halten

2. Vakanzen-Fast-Track
- Fokus auf die drei am stärksten vakanten Einheiten
- Pipeline-Review im wöchentlichen Rhythmus

3. Führungs-Coaching
- 1-zu-1 Coaching für drei Führungskräfte in kritischen Einheiten

4. Management-Reporting
- Monatliches Frühwarn-Dashboard an Vorstand

Quellen:
- Retention Playbook
- Frühwarnmodell (Ø Vorwarnzeit 4,2 Monate)`
};

export function getStarterQuestions(mode, institutMode) {
  const m = institutMode === 'generic' ? 'generic' : 'insurance';
  return STARTERS[mode]?.[m] || [];
}

export function getWelcome(mode, institutMode) {
  const m = institutMode === 'generic' ? 'generic' : 'insurance';
  return WELCOME[mode]?.[m] || 'Willkommen!';
}

export function getAssistantResponses(mode, institutMode) {
  const m = institutMode === 'generic' ? 'generic' : 'insurance';
  let base = {};
  if (mode === 'bewerber') base = m === 'generic' ? BEWERBER_GENERIC : BEWERBER_INSURANCE;
  else if (mode === 'arbeitgeber') base = m === 'generic' ? ARBEITGEBER_GENERIC : ARBEITGEBER_INSURANCE;
  else if (mode === 'cockpit') base = COCKPIT_COMMON;
  return { ...base, __fallback__: FALLBACK };
}
