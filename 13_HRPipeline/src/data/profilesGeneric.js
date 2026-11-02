// Industrieunspezifische Demo-Profile (Test-CVs) für die Zukunfts AG
// Drei Archetypen: Top-Kandidat, Quereinsteiger, Ablehnung

// Logo.dev token - produces clean branded logos for well-known software
export const LOGO_DEV_TOKEN = 'pk_H7vb5Y2lTsW47U4Xq-w3HA';

export function logoDevUrl(domain, size = 48) {
    return `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&size=${size}&format=png`;
}

export const HP_PROFILES_GENERIC = {
    laura: {
        id: 'laura',
        name: 'Laura Schneider',
        initials: 'LS',
        photo: './images/AdobeStock_252262042.jpeg',
        cvPdf: './cv/laura-schneider-cv.pdf',
        age: 34,
        city: 'Berlin',
        region: 'berlin',
        jobFamily: 'Human Resources',
        jobFamilyAffinities: ['Human Resources'],
        experience: '8 Jahre HR-Business-Partner (Tech-Scale-up + Unternehmensberatung)',
        experienceYears: 8,
        education: 'M.Sc. Arbeits- und Organisationspsychologie (HU Berlin)',
        skills: ['HR Business Partnering', 'Change Management', 'Arbeitsrecht', 'Talent Management', 'Stakeholder Management', 'Coaching'],
        techSkills: [
            { name: 'Workday', domain: 'workday.com', category: 'HR-Suite', level: 'fortgeschritten' },
            { name: 'Personio', domain: 'personio.de', category: 'HR-Suite', level: 'fortgeschritten' },
            { name: 'Microsoft 365', domain: 'microsoft.com', category: 'Office', level: 'expert' },
            { name: 'Miro', domain: 'miro.com', category: 'Collaboration', level: 'fortgeschritten' },
            { name: 'Slack', domain: 'slack.com', category: 'Collaboration', level: 'fortgeschritten' },
            { name: 'LinkedIn Learning', domain: 'linkedin.com', category: 'Learning', level: 'fortgeschritten' }
        ],
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
        counterfactual: 'Mit einem ergänzenden People-Analytics-Zertifikat einer renommierten Hochschule oder Weiterbildungsakademie (6 Monate) steigt der Score von 91 auf 95. Empfehlung: HR-Analytics-Weiterbildung im Rahmen des Onboardings.',
        interviewQuestions: {
            background: [
                { q: 'Ihr CV zeigt 8 Jahre HR mit Fokus BP — beschreiben Sie Ihr komplexestes Change-Projekt.', why: 'Verifizierung der Change-Management-Tiefe und Komplexitätsgrad' },
                { q: 'Wie haben Sie bei Ihrem aktuellen Arbeitgeber 120 Führungskräfte in HR-Themen beraten? Welche Strukturen haben Sie etabliert?', why: 'Skalierungsfähigkeit und Strukturdenken bewerten' },
                { q: 'Im CV finden wir bisher keine disziplinarische Personalverantwortung — wie würden Sie Ihren ersten Team-Lead-Schritt angehen und was haben Sie bereits an indirekter Führung geleistet?', why: 'Gap: Keine Führungserfahrung im CV. Für Senior-HR-BP-Rolle kritisch — Einschätzung der Bereitschaft und Reifegrad' }
            ],
            behavioral: [
                { q: 'Erzählen Sie von einer Situation, in der Sie einem Senior Leader widersprechen mussten. Wie sind Sie vorgegangen?', why: 'STAR-Methode: Stakeholder-Management und Rückgrat bei Senior Leaders' },
                { q: 'Beschreiben Sie einen Konflikt mit dem Betriebsrat, den Sie erfolgreich gelöst haben.', why: 'Sozialpartner-Kompetenz für deutsche Mitbestimmung' },
                { q: 'Ohne bisherige disziplinarische Führungsrolle: Wie haben Sie in Projekten laterale Führung oder Mentoring übernommen? Was lief gut, was würden Sie anders machen?', why: 'Indirekte Führungserfahrung als Ersatzsignal bei fehlender Team-Lead-Historie' }
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
            training: 'Empfehlung: Zertifikatskurs People Analytics an einer renommierten Hochschule oder Weiterbildungsakademie (ca. 6 Monate, ~2.800 €) → Score-Steigerung: +4 Punkte.'
        },
        cvSections: [
            { id: 'header', type: 'header', title: 'Laura Schneider', subtitle: 'Senior HR Business Partner', meta: 'Berlin  ·  34 Jahre  ·  8 Jahre Berufserfahrung' },
            { id: 'contact', type: 'list', title: 'Kontakt', items: ['laura.schneider@mail.de', '+49 151 23 45 67 89', 'Prenzlauer Berg, 10405 Berlin', 'linkedin.com/in/laura-schneider'] },
            { id: 'summary', type: 'paragraph', title: 'Profil', text: 'Erfahrene HR-Business-Partnerin mit 8 Jahren Track-Record in Tech-Scale-ups und Top-Managementberatung. Schwerpunkte: Change Management, Führungskräfteberatung und Aufbau skalierbarer HR-Strukturen. Akademischer Hintergrund in Arbeits- und Organisationspsychologie, kombiniert mit Systemischem Coaching. Begleitet Senior Leader bei komplexen Transformationen und Reorganisationen.' },
            { id: 'exp-1', type: 'experience', title: 'Senior HR Business Partner', company: 'FinTechNova GmbH · Tech Scale-up · Berlin', dates: '03/2021 – heute', bullets: [
                'HR-Partner für drei Business Units (Engineering, Product, GTM) mit ~120 Führungskräften und 520 Mitarbeitenden.',
                'Lead-HR-BP bei drei Reorganisationen (inkl. Post-Merger-Integration), Verhandlung mit Betriebsrat und Umsetzung der Zielstruktur.',
                'Aufbau eines Performance- und Compensation-Frameworks; Einführung strukturierter Salary Rounds und Karrierepfade.',
                'Coaching von 30+ Senior Leadern zu Führung, Konflikt und Change-Kommunikation.'
            ]},
            { id: 'exp-2', type: 'experience', title: 'HR Consultant', company: 'KPMG People & Change · Frankfurt / Berlin', dates: '01/2018 – 02/2021', bullets: [
                'Beratungs- und Transformationsprojekte bei DAX- und Mittelstandskunden (HR Target Operating Model, HR-IT, Org-Design).',
                'Projektleitung Workday-Rollout bei einem Industriekunden (~4.500 MA, 8-köpfiges Projektteam).',
                'Co-Autorin Benchmark-Studie „HR of the Future" (2020).'
            ]},
            { id: 'exp-3', type: 'experience', title: 'HR Junior Consultant', company: 'Mercer Deutschland · Frankfurt', dates: '08/2016 – 12/2017', bullets: [
                'Unterstützung bei Vergütungs- und Performance-Management-Projekten für internationale Konzerne.',
                'Datenanalyse, Benchmark-Reports und Stakeholder-Präsentationen.'
            ]},
            { id: 'edu-1', type: 'education', title: 'M.Sc. Arbeits- und Organisationspsychologie', institution: 'Humboldt-Universität zu Berlin', dates: '2014 – 2016', detail: 'Abschluss 1,4 · Schwerpunkt: Führung, Change & Diagnostik · Masterarbeit zu psychologischer Sicherheit in agilen Teams.' },
            { id: 'edu-2', type: 'education', title: 'B.Sc. Psychologie', institution: 'Universität Heidelberg', dates: '2010 – 2014', detail: 'Abschluss 1,7 · Auslandssemester: University of Edinburgh (2013).' },
            { id: 'skills', type: 'list', title: 'Skills', items: ['HR Business Partnering', 'Change Management & Reorganisation', 'Arbeitsrecht & Betriebsratsarbeit', 'Talent Management', 'Systemisches Coaching', 'People Analytics (Workday, Personio)', 'Stakeholder-Management'] },
            { id: 'certs', type: 'list', title: 'Zertifikate', items: ['SHRM-CP (2022)', 'Systemischer Business-Coach (IHK)', 'Agile Coach (ICAgile)'] },
            { id: 'projects', type: 'list', title: 'Projekte & Engagement', items: ['Speakerin HR Tech Conference 2024 & 2025', 'Ehrenamt: Mentoring @ Women in Tech Berlin'] },
            { id: 'languages', type: 'list', title: 'Sprachen', items: ['Deutsch (Muttersprache)', 'Englisch (C1)', 'Französisch (A2)'] }
        ],
        sourceMap: {
            summary: ['summary', 'exp-1', 'exp-2', 'edu-1'],
            experience: ['exp-1', 'exp-2', 'exp-3'],
            education: ['edu-1', 'edu-2'],
            'scores.vertrieb': ['exp-1', 'exp-2'],
            'scores.branche': ['exp-1', 'exp-2', 'skills'],
            'scores.qualifikation': ['edu-1', 'edu-2', 'certs'],
            'scores.standort': ['contact'],
            'scores.softskills': ['exp-1', 'certs', 'projects'],
            'strength.8J HR Business Partnering': ['exp-1', 'exp-2', 'exp-3'],
            'strength.Change Management': ['exp-1', 'exp-2'],
            'strength.Akademische Qualifikation (DQR 7)': ['edu-1', 'edu-2'],
            'strength.SHRM-CP & Coach-Zertifikat': ['certs'],
            'strength.Verhandlungssicher EN/DE': ['languages'],
            'neutral.Noch kein Team fachlich geführt': ['exp-1', 'exp-2', 'exp-3'],
            'skillGap.HR-Fachkompetenz': ['exp-1', 'exp-2', 'skills'],
            'skillGap.Berufserfahrung': ['exp-1', 'exp-2', 'exp-3'],
            'skillGap.Change-Management': ['exp-1', 'exp-2'],
            'skillGap.Digital-Kompetenz': ['skills', 'exp-2'],
            'skillGap.Führungskompetenz': ['exp-1', 'projects']
        }
    },

    jonas: {
        id: 'jonas',
        name: 'Jonas Weber',
        initials: 'JW',
        photo: './images/AdobeStock_624564221.jpeg',
        cvPdf: './cv/jonas-weber-cv.pdf',
        age: 28,
        city: 'Köln',
        region: 'nrw',
        jobFamily: 'Data & Analytics',
        jobFamilyAffinities: ['Data & Analytics', 'Finance'],
        experience: '4 Jahre Business Analyst (Management-Beratung), Transition in Richtung Data Analytics',
        experienceYears: 4,
        education: 'B.Sc. Wirtschaftsinformatik, laufend Master Data Science (berufsbegleitend)',
        skills: ['SQL', 'Excel (Advanced)', 'Power BI', 'Python Grundlagen', 'Prozessanalyse', 'Stakeholder-Kommunikation'],
        techSkills: [
            { name: 'Microsoft Power BI', domain: 'powerbi.microsoft.com', category: 'BI', level: 'expert' },
            { name: 'Snowflake', domain: 'snowflake.com', category: 'Data', level: 'fortgeschritten' },
            { name: 'PostgreSQL', domain: 'postgresql.org', category: 'Data', level: 'fortgeschritten' },
            { name: 'Python', domain: 'python.org', category: 'Programmierung', level: 'grundlagen' },
            { name: 'Microsoft Excel', domain: 'microsoft.com', category: 'Office', level: 'expert' },
            { name: 'JIRA', domain: 'atlassian.com', category: 'Projekt', level: 'fortgeschritten' },
            { name: 'Git / GitHub', domain: 'github.com', category: 'DevOps', level: 'fortgeschritten' },
            { name: 'Kaggle', domain: 'kaggle.com', category: 'Data Science', level: 'fortgeschritten' }
        ],
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
        },
        cvSections: [
            { id: 'header', type: 'header', title: 'Jonas Weber', subtitle: 'Business Analyst · angehender Data Analyst', meta: 'Köln  ·  28 Jahre  ·  4 Jahre Berufserfahrung' },
            { id: 'contact', type: 'list', title: 'Kontakt', items: ['jonas.weber@mail.de', '+49 176 55 44 33 22', 'Ehrenfeld, 50825 Köln', 'linkedin.com/in/jonas-weber-ba', 'github.com/jweber-data'] },
            { id: 'summary', type: 'paragraph', title: 'Profil', text: 'Analytisch geprägter Business Analyst mit 4 Jahren Beratungserfahrung und klarem Fokus auf Data Analytics. Power-BI-zertifiziert (PL-300) und berufsbegleitend im Master Data Science. Starke Kombination aus strukturierter Beratungsmethodik, solider SQL-/BI-Basis und hoher Lernkurve in Python.' },
            { id: 'exp-1', type: 'experience', title: 'Business Analyst', company: 'NorthStar Consulting GmbH · Köln', dates: '10/2021 – heute', bullets: [
                'Datengetriebene Beratungsprojekte für Finance-, Retail- und Industriekunden: Prozessanalyse, Reporting und BI-Dashboards.',
                'Konzeption und Umsetzung von Power-BI-Reportings (10+ produktive Dashboards) mit Fokus auf Vertriebs- und Finanz-KPIs.',
                'SQL-basierte Datenmodelle in Snowflake; Migration von Legacy-Excel-Reports auf zentrale Data Marts.',
                'Lead-Analyst im Projekt „Sales Performance Cockpit" für einen Konsumgüterhersteller (€1,8 Mio Projektvolumen).'
            ]},
            { id: 'exp-2', type: 'experience', title: 'Werkstudent Data Analytics', company: 'REWE Digital · Köln', dates: '04/2020 – 09/2021', bullets: [
                'Mitarbeit im E-Commerce-Analytics-Team: Tracking-Implementation, Ad-hoc-Analysen, A/B-Test-Auswertung.',
                'Aufbau eines wöchentlichen KPI-Reports für das Produktmanagement.'
            ]},
            { id: 'exp-3', type: 'experience', title: 'Praktikum Controlling', company: 'Bayer AG · Leverkusen', dates: '08/2019 – 01/2020', bullets: [
                'Unterstützung im Financial-Planning-Team bei Forecast- und Abweichungsanalysen.'
            ]},
            { id: 'edu-1', type: 'education', title: 'M.Sc. Data Science (berufsbegleitend)', institution: 'IU Internationale Hochschule', dates: '2023 – vsl. 2026', detail: 'Schwerpunkt: Machine Learning, Statistik, Data Engineering · Aktueller Notenschnitt 1,8.' },
            { id: 'edu-2', type: 'education', title: 'B.Sc. Wirtschaftsinformatik', institution: 'Technische Hochschule Köln', dates: '2016 – 2019', detail: 'Abschluss 2,0 · Bachelorarbeit: „Data-Warehouse-Architekturen im Retail-Umfeld".' },
            { id: 'skills', type: 'list', title: 'Skills', items: ['SQL (PostgreSQL, Snowflake)', 'Power BI & DAX', 'Excel (Advanced, VBA)', 'Python (Grundlagen, pandas)', 'Prozess- und Anforderungsanalyse', 'Stakeholder-Kommunikation', 'Agiles Arbeiten (Scrum)'] },
            { id: 'certs', type: 'list', title: 'Zertifikate', items: ['Microsoft PL-300 Power BI (2024)', 'Datacamp Data Scientist Track (70 %)', 'Scrum Fundamentals (2022)'] },
            { id: 'projects', type: 'list', title: 'Projekte & Engagement', items: ['Kaggle — House-Prices & Titanic Baselines (Top 25 %)', 'Meetup-Co-Organisator „Data Viz Cologne"'] },
            { id: 'languages', type: 'list', title: 'Sprachen', items: ['Deutsch (Muttersprache)', 'Englisch (C1)', 'Spanisch (A2)'] }
        ],
        sourceMap: {
            summary: ['summary', 'exp-1', 'edu-1', 'certs'],
            experience: ['exp-1', 'exp-2', 'exp-3'],
            education: ['edu-1', 'edu-2'],
            'scores.vertrieb': ['exp-1', 'exp-2'],
            'scores.branche': ['exp-1', 'skills'],
            'scores.qualifikation': ['edu-1', 'edu-2', 'certs'],
            'scores.standort': ['contact'],
            'scores.softskills': ['exp-1', 'projects'],
            'strength.4 Jahre Business-Analyse-Erfahrung': ['exp-1'],
            'strength.Power-BI-Zertifikat (PL-300)': ['certs', 'skills'],
            'strength.Laufender M.Sc. Data Science': ['edu-1'],
            'strength.Strukturierte Beratungsmethodik': ['exp-1'],
            'weakness.Python auf Einsteiger-Niveau': ['skills', 'certs'],
            'weakness.Keine reine Analyst-Rolle bisher': ['exp-1', 'exp-2', 'exp-3'],
            'skillGap.Analytics-Fachkompetenz': ['skills', 'certs'],
            'skillGap.Berufserfahrung': ['exp-1', 'exp-2', 'exp-3'],
            'skillGap.Branchen-/Domänenkenntnis': ['exp-1'],
            'skillGap.Digital-Kompetenz': ['skills', 'certs'],
            'skillGap.Soft Skills': ['exp-1', 'projects']
        }
    },

    peter: {
        id: 'peter',
        name: 'Peter Schmitt',
        initials: 'PS',
        photo: './images/AdobeStock_361342769.jpeg',
        cvPdf: './cv/peter-schmitt-cv.pdf',
        age: 54,
        city: 'Flensburg',
        region: 'nord',
        jobFamily: 'Operations',
        jobFamilyAffinities: [],
        experience: '22 Jahre Produktionshelfer, seit 18 Monaten arbeitslos',
        experienceYears: 22,
        education: 'Hauptschulabschluss, angelernte Fachkraft',
        skills: ['Fertigungsprozesse', 'Zuverlässigkeit', 'Teamarbeit'],
        techSkills: [],
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
        },
        cvSections: [
            { id: 'header', type: 'header', title: 'Peter Schmitt', subtitle: 'Produktionsmitarbeiter · angelernte Fachkraft', meta: 'Flensburg  ·  54 Jahre  ·  22 Jahre Berufserfahrung' },
            { id: 'contact', type: 'list', title: 'Kontakt', items: ['p.schmitt54@mail.de', '+49 461 22 11 33', 'Mürwik, 24944 Flensburg'] },
            { id: 'summary', type: 'paragraph', title: 'Profil', text: 'Zuverlässiger und erfahrener Produktionsmitarbeiter mit 22 Jahren Werkserfahrung in der Metallverarbeitung. Langjähriges Teammitglied, gewohnt an Schichtarbeit, Qualitätskontrolle und das strukturierte Abarbeiten klar definierter Aufgaben. Aktuell auf der Suche nach einer neuen Anstellung nach Werksschließung.' },
            { id: 'exp-1', type: 'experience', title: 'Produktionsmitarbeiter (angelernte Fachkraft)', company: 'Nordmetall GmbH · Metallverarbeitung · Flensburg', dates: '06/2001 – 10/2023', bullets: [
                '22 Jahre durchgehende Tätigkeit in der Serienfertigung (Dreh- und Frästeile).',
                'Bedienung von CNC-gestützten Maschinen nach Einweisung, Wechsel von Werkzeugen und Rohteilen.',
                'Sichtprüfung und Maßkontrolle fertiger Teile, Dokumentation auf Prüfprotokollen.',
                'Schichtarbeit im 3-Schicht-Modell, zuletzt als verlässlicher Springer in mehreren Werkhallen eingesetzt.',
                'Stelle im Rahmen einer Werksschließung im Oktober 2023 abgebaut.'
            ]},
            { id: 'exp-2', type: 'experience', title: 'Lagerhelfer', company: 'Nordfracht Spedition · Flensburg', dates: '01/1999 – 05/2001', bullets: [
                'Wareneingang und Kommissionierung, Bedienung eines Gabelstaplers.'
            ]},
            { id: 'edu-1', type: 'education', title: 'Hauptschulabschluss', institution: 'Hauptschule Flensburg-Mürwik', dates: '1982 – 1987', detail: '' },
            { id: 'edu-2', type: 'education', title: 'Angelernte Fachkraft Metallverarbeitung', institution: 'Nordmetall GmbH (betriebsintern)', dates: '2001 – 2002', detail: 'Sechsmonatige betriebliche Einarbeitung an CNC-gestützten Fertigungsanlagen.' },
            { id: 'skills', type: 'list', title: 'Skills', items: ['Fertigungs- und Montageprozesse', 'Maschinenbedienung', 'Qualitätskontrolle (Sichtprüfung)', 'Staplerschein (Klasse B)', 'Zuverlässigkeit & Sorgfalt', 'Teamarbeit'] },
            { id: 'certs', type: 'list', title: 'Zertifikate', items: ['Gabelstapler-Fahrerausweis (2005)', 'Unterweisung Arbeitssicherheit (jährlich)'] },
            { id: 'languages', type: 'list', title: 'Sprachen', items: ['Deutsch (Muttersprache)'] }
        ],
        sourceMap: {
            summary: ['summary', 'exp-1'],
            experience: ['exp-1', 'exp-2'],
            education: ['edu-1', 'edu-2'],
            'scores.vertrieb': ['exp-1', 'exp-2'],
            'scores.branche': ['exp-1', 'skills'],
            'scores.qualifikation': ['edu-1', 'edu-2', 'certs'],
            'scores.standort': ['contact'],
            'scores.softskills': ['exp-1', 'skills'],
            'strength.Langjährige Berufserfahrung': ['exp-1', 'exp-2'],
            'strength.Zuverlässigkeit': ['exp-1', 'skills'],
            'strength.Teamorientierung': ['exp-1', 'skills'],
            'weakness.Keine kaufmännische Qualifikation': ['edu-1', 'edu-2', 'certs'],
            'weakness.Keine Büroerfahrung': ['exp-1', 'exp-2'],
            'weakness.Keine IT-Grundkenntnisse nachgewiesen': ['skills', 'certs'],
            'weakness.Beschäftigungslücke': ['exp-1'],
            'skillGap.Fachkompetenz': ['edu-1', 'edu-2', 'skills'],
            'skillGap.Berufserfahrung': ['exp-1', 'exp-2'],
            'skillGap.Qualifikation': ['edu-1', 'edu-2', 'certs'],
            'skillGap.Digital-Kompetenz': ['skills', 'certs'],
            'skillGap.Soft Skills': ['exp-1', 'skills']
        }
    }
};
