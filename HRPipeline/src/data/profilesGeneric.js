// Industrieunspezifische Demo-Profile (Test-CVs) für die Zukunfts AG
// Drei Archetypen: Top-Kandidat, Quereinsteiger, Ablehnung

export const HP_PROFILES_GENERIC = {
    laura: {
        id: 'laura',
        name: 'Laura Schneider',
        initials: 'LS',
        photo: '../../assets/images/AdobeStock_252262042.jpeg',
        age: 34,
        city: 'Berlin',
        region: 'berlin',
        jobFamily: 'Human Resources',
        jobFamilyAffinities: ['Human Resources'],
        experience: '8 Jahre HR-Business-Partner (Tech-Scale-up + Unternehmensberatung)',
        experienceYears: 8,
        education: 'M.Sc. Arbeits- und Organisationspsychologie (HU Berlin)',
        skills: ['HR Business Partnering', 'Change Management', 'Arbeitsrecht', 'Talent Management', 'Stakeholder Management', 'Coaching'],
        certifications: ['M.Sc. Psychologie (DQR 7)', 'SHRM-CP (2022)', 'Systemischer Business-Coach (IHK)', 'Agile Coach (ICAgile)'],
        insuranceFlags: {
            green: ['8J HR-BP-Erfahrung', 'Studium (DQR 7)', 'Change-/Transformations-Track-Record', 'Senior-Stakeholder-Management'],
            neutral: ['Wechsel aus Beratung in Linie']
        },
        strengths: ['8J HR Business Partnering', 'Change Management', 'Akademische Qualifikation (DQR 7)', 'SHRM-CP & Coach-Zertifikat', 'Verhandlungssicher EN/DE'],
        weaknesses: [],
        neutrals: ['Noch kein Team fachlich geführt'],
        scores: { vertrieb: 88, branche: 85, qualifikation: 92, standort: 95, softskills: 90 },
        totalScore: 91,
        summary: '8 Jahre fundierte HR-Business-Partner-Erfahrung aus Tech-Scale-up und Top-Beratung. Masterabschluss in A&O-Psychologie (HU Berlin), SHRM-CP-zertifiziert und Systemischer Business-Coach. Nachgewiesene Track-Record in Change-Projekten und Reorganisationen. Idealer Fit für die Senior-HR-BP-Rolle in Berlin.',
        radarData: [88, 85, 92, 95, 90],
        waterfall: [
            { label: 'M.Sc. Psychologie (DQR 7)', points: 16, type: 'positive' },
            { label: '8 Jahre HR Business Partnering', points: 15, type: 'positive' },
            { label: 'Change-Projekte (3 Reorgs)', points: 12, type: 'positive' },
            { label: 'SHRM-CP Zertifikat', points: 10, type: 'positive' },
            { label: 'Standort Berlin (Match)', points: 8, type: 'positive' },
            { label: 'Systemischer Coach', points: 7, type: 'positive' },
            { label: 'Englisch verhandlungssicher', points: 6, type: 'positive' },
            { label: 'Keine direkte Teamführung', points: -4, type: 'neutral' }
        ],
        linkedinInsights: [
            { text: 'Nebentätigkeit: Speakerin auf HR Tech Conference (2024, 2025)', detail: 'Vorträge zu "AI in HR" — im CV nicht erwähnt, zeigt Thought Leadership und Netzwerk' },
            { text: 'Empfohlen für „Change Management" von 18 Kontakten', detail: '780+ Kontakte im HR- und Tech-Sektor bestätigen starkes Netzwerk in beiden Welten' }
        ],
        counterfactual: 'Wenn die Kandidatin zusätzlich ein People-Analytics-Zertifikat (z.B. Wharton, 6 Monate) erwirbt, steigt der Score von 91 auf 95. Empfehlung: HR Analytics-Weiterbildung im Rahmen des Onboardings.',
        interviewQuestions: {
            background: [
                { q: 'Ihr CV zeigt 8 Jahre HR mit Fokus BP — beschreiben Sie Ihr komplexestes Change-Projekt.', why: 'Verifizierung der Change-Management-Tiefe und Komplexitätsgrad' },
                { q: 'Wie haben Sie bei Ihrem aktuellen Arbeitgeber 120 Führungskräfte in HR-Themen beraten? Welche Strukturen haben Sie etabliert?', why: 'Skalierungsfähigkeit und Strukturdenken bewerten' }
            ],
            behavioral: [
                { q: 'Erzählen Sie von einer Situation, in der Sie einem Senior Leader widersprechen mussten. Wie sind Sie vorgegangen?', why: 'STAR-Methode: Stakeholder-Management und Rückgrat bei Senior Leaders' },
                { q: 'Beschreiben Sie einen Konflikt mit dem Betriebsrat, den Sie erfolgreich gelöst haben.', why: 'Sozialpartner-Kompetenz für deutsche Mitbestimmung' }
            ],
            technical: [
                { q: 'Wie würden Sie eine Salary-Round für 400 MA in einem Umfeld mit eingeschränktem Budget strukturieren?', why: 'Fachliches HR-Know-how und Business Sense' },
                { q: 'Welche Erfahrungen haben Sie mit People Analytics und Workforce Planning?', why: 'Datenkompetenz — wichtig für moderne HR Business Partner' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'HR-Fachkompetenz', current: 90, required: 85, reason: '8 Jahre BP-Erfahrung mit Schwerpunkt Arbeitsrecht und Organisationsentwicklung' },
                { label: 'Berufserfahrung', current: 88, required: 85, reason: 'Senior-Niveau erreicht, in zwei unterschiedlichen Kontexten (Beratung + Industrie)' },
                { label: 'Change-Management', current: 92, required: 80, reason: 'Drei erfolgreich abgeschlossene Reorganisationen als Lead-HR-BP' },
                { label: 'Digital-Kompetenz', current: 78, required: 75, reason: 'Erfahrung mit Workday, Personio und HR-Analytics-Tools' },
                { label: 'Führungskompetenz', current: 70, required: 70, reason: 'Mentoring und indirekte Führung über Projekte, noch keine disziplinarische Führung' }
            ],
            training: 'Empfehlung: People-Analytics-Weiterbildung (z.B. Wharton People Analytics, 6 Monate, ~2.800 €) → Score-Steigerung: +4 Punkte.'
        }
    },

    jonas: {
        id: 'jonas',
        name: 'Jonas Weber',
        initials: 'JW',
        photo: '../../assets/images/AdobeStock_624564221.jpeg',
        age: 28,
        city: 'Köln',
        region: 'nrw',
        jobFamily: 'Data & Analytics',
        jobFamilyAffinities: ['Data & Analytics', 'Finance'],
        experience: '4 Jahre Business Analyst (Management-Beratung), Transition in Richtung Data Analytics',
        experienceYears: 4,
        education: 'B.Sc. Wirtschaftsinformatik, laufend Master Data Science (berufsbegleitend)',
        skills: ['SQL', 'Excel (Advanced)', 'Power BI', 'Python Grundlagen', 'Prozessanalyse', 'Stakeholder-Kommunikation'],
        certifications: ['B.Sc. Wirtschaftsinformatik (DQR 6)', 'Microsoft PL-300 Power BI (2024)', 'Datacamp Data Scientist Track (70% abgeschlossen)'],
        insuranceFlags: {
            green: ['4J Beratungsprojekte mit Datenbezug', 'Power BI zertifiziert', 'Master Data Science (in Arbeit)'],
            red: ['Noch keine reine Data-Analyst-Rolle'],
            neutral: ['Branchenwechsel Beratung → Industrie']
        },
        strengths: ['4 Jahre Business-Analyse-Erfahrung', 'Power-BI-Zertifikat (PL-300)', 'Laufender M.Sc. Data Science', 'Strukturierte Beratungsmethodik'],
        weaknesses: ['Python auf Einsteiger-Niveau', 'Keine reine Analyst-Rolle bisher'],
        neutrals: ['Branchenwechsel von Beratung in Linie'],
        scores: { vertrieb: 70, branche: 55, qualifikation: 72, standort: 85, softskills: 75 },
        totalScore: 72,
        summary: 'Analytischer Kopf mit 4 Jahren Beratungserfahrung und klarem Fokus auf Data Analytics. Power-BI-zertifiziert (PL-300) und berufsbegleitender Master Data Science. Für die Data-Analyst-Rolle in Köln ein starker Kandidat mit Entwicklungsperspektive — Python-Skills sollten im Onboarding gezielt ausgebaut werden.',
        radarData: [70, 55, 72, 85, 75],
        waterfall: [
            { label: 'B.Sc. Wirtschaftsinformatik (DQR 6)', points: 10, type: 'positive' },
            { label: '4 Jahre Beratungserfahrung', points: 12, type: 'positive' },
            { label: 'PL-300 Power BI', points: 8, type: 'positive' },
            { label: 'Master Data Science (in Arbeit)', points: 7, type: 'positive' },
            { label: 'Standort Köln (Match)', points: 6, type: 'positive' },
            { label: 'Python nur Einsteiger', points: -5, type: 'negative' },
            { label: 'Keine reine Analyst-Rolle', points: -6, type: 'negative' }
        ],
        counterfactual: 'Nach Abschluss des Masters Data Science und 3 Monaten intensivem Python-Training steigt der Score von 72 auf ca. 85. Empfehlung: Einstieg als Data Analyst mit begleitetem Mentoring durch Senior Data Scientist.',
        interviewQuestions: {
            background: [
                { q: 'Sie wechseln aus der Beratung in eine Linien-Rolle als Data Analyst — was motiviert diesen Schritt?', why: 'Wechselmotivation bei Branchenwechsel verstehen' },
                { q: 'Beschreiben Sie Ihr bisher komplexestes Datenprojekt in der Beratung.', why: 'Fachliche Tiefe und Komplexitätsgrad der bisherigen Arbeit' }
            ],
            behavioral: [
                { q: 'Erzählen Sie von einer Situation, in der Sie ein Analyseergebnis gegen Widerstand im Kundenprojekt durchgesetzt haben.', why: 'Stakeholder-Management und Rückgrat gegenüber Fachbereichen' },
                { q: 'Wie priorisieren Sie, wenn mehrere Stakeholder parallel Ad-hoc-Analysen anfragen?', why: 'Selbstorganisation in einer Linienfunktion' }
            ],
            technical: [
                { q: 'Schreiben Sie uns pseudocodemäßig ein SQL, das monatliche Umsätze pro Produkt und Region pivotiert.', why: 'SQL-Tiefe verifizieren' },
                { q: 'Wie bauen Sie ein Dashboard auf, das sowohl Finance als auch Marketing gleichzeitig bedient?', why: 'Stakeholder-gerechtes Dashboard-Design' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'Analytics-Fachkompetenz', current: 68, required: 75, reason: 'SQL und Power BI stark, Python und Statistik auf Einsteiger-Niveau' },
                { label: 'Berufserfahrung', current: 70, required: 70, reason: '4 Jahre Business Analyst — Sollwert erreicht, aber nicht übertroffen' },
                { label: 'Branchen-/Domänenkenntnis', current: 55, required: 65, reason: 'Beratungsprojekte decken diverse Branchen ab, fehlende Linien-Erfahrung' },
                { label: 'Digital-Kompetenz', current: 80, required: 75, reason: 'Sicher in Power BI, Excel, SQL; modernes Data-Stack noch zu lernen' },
                { label: 'Soft Skills', current: 75, required: 70, reason: 'Beratungsbackground bringt Stakeholder- und Präsentations-Skills' }
            ],
            training: 'Empfehlung: Onboarding-Programm (3 Monate) mit Fokus auf Python, dbt und unserem Data Warehouse. ROI: interne Weiterqualifizierung deutlich günstiger als Senior-Neueinstellung.'
        }
    },

    peter: {
        id: 'peter',
        name: 'Peter Schmitt',
        initials: 'PS',
        photo: '../../assets/images/AdobeStock_361342769.jpeg',
        age: 54,
        city: 'Flensburg',
        region: 'nord',
        jobFamily: 'Operations',
        jobFamilyAffinities: [],
        experience: '22 Jahre Produktionshelfer, seit 18 Monaten arbeitslos',
        experienceYears: 22,
        education: 'Hauptschulabschluss, angelernte Fachkraft',
        skills: ['Fertigungsprozesse', 'Zuverlässigkeit', 'Teamarbeit'],
        certifications: [],
        insuranceFlags: {
            green: ['Langjährige Berufserfahrung', 'Nachgewiesene Zuverlässigkeit'],
            red: ['Keine kaufmännische/fachliche Qualifikation', 'Kein Bürohintergrund', 'Beschäftigungslücke (18 Monate)', 'Standort ohne offene Stellen']
        },
        strengths: ['Langjährige Berufserfahrung', 'Zuverlässigkeit', 'Teamorientierung'],
        weaknesses: ['Keine kaufmännische Qualifikation', 'Keine Büroerfahrung', 'Keine IT-Grundkenntnisse nachgewiesen', 'Beschäftigungslücke'],
        scores: { vertrieb: 15, branche: 8, qualifikation: 18, standort: 20, softskills: 40 },
        totalScore: 28,
        rejected: true,
        rejectionText: 'Auf Basis Ihres Profils können wir Ihnen derzeit leider keine passende Position anbieten. Für unsere offenen Stellen fehlen grundlegende Voraussetzungen wie eine kaufmännische/fachliche Qualifikation und einschlägige Büroerfahrung.',
        summary: '22 Jahre Berufserfahrung in der Fertigung, jedoch ohne Bezug zu den ausgeschriebenen Büro- und Fachpositionen. Es fehlen grundlegende Voraussetzungen: kaufmännische Ausbildung, IT-Grundkenntnisse und aktuelle Weiterbildungen. Standort Flensburg bietet für das ausgeschriebene Portfolio keine passenden Stellen. Empfehlung: Umschulung über die Bundesagentur für Arbeit.',
        radarData: [15, 8, 18, 20, 40],
        waterfall: [
            { label: 'Langjährige Berufserfahrung', points: 5, type: 'positive' },
            { label: 'Zuverlässigkeit / Sorgfalt', points: 4, type: 'positive' },
            { label: 'Keine kaufm./fachl. Qualifikation', points: -18, type: 'negative' },
            { label: 'Keine Büro-/IT-Erfahrung', points: -14, type: 'negative' },
            { label: 'Beschäftigungslücke (18 Monate)', points: -10, type: 'negative' },
            { label: 'Standort Flensburg (keine Stellen)', points: -10, type: 'negative' }
        ],
        counterfactual: 'Auch nach Abschluss einer kaufmännischen Umschulung (z.B. Kauffrau/-mann für Büromanagement, 24 Monate) würde der Score nur auf ca. 48 steigen. Ein Standortwechsel wäre zusätzlich erforderlich.',
        interviewQuestions: {
            background: [
                { q: 'Was motiviert Sie nach 22 Jahren Produktion zum Wechsel in eine Büroposition?', why: 'Wechselmotivation und Ernsthaftigkeit — kritisch bei so starkem Bruch' }
            ],
            behavioral: [
                { q: 'Wie gehen Sie mit längeren Phasen am Computer und komplexer Software um?', why: 'Kritische Lücke — digitale Arbeitsfähigkeit' }
            ],
            technical: [
                { q: 'Welche IT-Grundkenntnisse (Office, E-Mail, Teams) bringen Sie aktuell mit?', why: 'Digital Baseline prüfen' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'Fachkompetenz', current: 8, required: 70, reason: 'Keine fachliche oder kaufmännische Qualifikation im Zielprofil' },
                { label: 'Berufserfahrung', current: 15, required: 70, reason: 'Keine einschlägige Büro- oder Fachrollen-Erfahrung' },
                { label: 'Qualifikation', current: 18, required: 75, reason: 'Hauptschulabschluss und Anlernqualifikation ohne Weiterbildung' },
                { label: 'Digital-Kompetenz', current: 20, required: 70, reason: 'Keine IT-/Office-Kenntnisse im CV belegt' },
                { label: 'Soft Skills', current: 40, required: 60, reason: 'Zuverlässigkeit vorhanden, aber keine moderne Kommunikation/Zusammenarbeit nachgewiesen' }
            ],
            training: 'Erhebliche Lücken in allen relevanten Dimensionen. Empfehlung: Beratung durch Bundesagentur für Arbeit, ggf. geförderte Umschulung mit Schwerpunkt Bürokommunikation (ca. 24 Monate).'
        }
    }
};
