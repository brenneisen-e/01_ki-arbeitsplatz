export const HP_PROFILES = {
    max: {
        id: 'max',
        name: 'Max Berger',
        initials: 'MB',
        photo: './images/AdobeStock_624564221.jpeg',
        age: 34,
        city: 'Düsseldorf',
        region: 'nrw',
        experience: '8 Jahre Industrievertrieb (Henkel AG, Key Account)',
        experienceYears: 8,
        education: 'BWL-Studium (B.A.), Ausbildung Industriekaufmann (IHK)',
        skills: ['Key Account Management', 'Angebotserstellung', 'Teamführung', 'SAP SD', 'Salesforce CRM'],
        certifications: ['IHK Industriekaufmann (DQR 4)', 'BWL Bachelor (DQR 6)', 'Salesforce Certified'],
        insuranceFlags: {
            green: ['8J B2B-Vertriebserfahrung', 'BWL-Studium (DQR 6)', 'Bestandsvolumen 2,4 Mio €', 'Ø 115% Zielerreichung', 'Führungserfahrung (3 MA)'],
            red: ['Keine Versicherungserfahrung', 'Keine IHK §34d'],
            neutral: ['Branchenwechsel aus Industrie']
        },
        strengths: ['Starke B2B-Vertriebserfahrung', 'BWL-Studium (DQR 6)', 'Führungserfahrung (3 MA)', 'Hohe Zielerreichung (115%)', 'CRM- & SAP-Kompetenz'],
        weaknesses: ['Keine Versicherungserfahrung', 'Keine IHK §34d-Qualifikation'],
        neutrals: ['Branchenwechsel aus Industrie'],
        scores: { vertrieb: 90, branche: 42, qualifikation: 85, standort: 92, softskills: 85 },
        totalScore: 78,
        summary: '8 Jahre Industrievertrieb bei Henkel AG als Key Account Manager. BWL-Bachelor (DQR 6), IHK Industriekaufmann und Salesforce-Zertifizierung. Bestandsvolumen 2,4 Mio. €, Führungserfahrung über 3 Mitarbeiter und Ø 115 % Zielerreichung. Starker Vertriebskandidat mit Branchenwechselpotenzial — §34d-Qualifikation über ERGO Einarbeitungsprogramm nachholen.',
        radarData: [90, 42, 85, 92, 85],
        waterfall: [
            { label: '8 Jahre Key Account B2B (Henkel)', points: 16, type: 'positive' },
            { label: 'Bestandsvolumen 2,4 Mio €', points: 14, type: 'positive' },
            { label: 'Führungserfahrung (3 MA)', points: 12, type: 'positive' },
            { label: 'BWL-Studium (DQR 6)', points: 10, type: 'positive' },
            { label: 'Ø 115% Zielerreichung', points: 9, type: 'positive' },
            { label: 'Salesforce CRM / SAP SD', points: 6, type: 'positive' },
            { label: 'Standort Düsseldorf (Match)', points: 7, type: 'positive' },
            { label: 'Keine Versicherungserfahrung', points: -14, type: 'negative' },
            { label: 'Keine IHK §34d Qualifikation', points: -10, type: 'negative' },
            { label: 'Branchenwechsel', points: -5, type: 'neutral' }
        ],
        linkedinInsights: [
            { text: 'Empfohlen für „Key Account Management" von 14 Kontakten', detail: '480+ Kontakte im Industrie- und B2B-Vertriebsumfeld belegen starkes Netzwerk' },
            { text: 'Aktiv in XING-Gruppe „Vertrieb & Sales NRW"', detail: 'Regelmäßige Beiträge zu Vertriebsstrategien — zeigt Eigeninitiative und Brancheninteresse' }
        ],
        counterfactual: 'Nach Abschluss der IHK-Sachkundeprüfung §34d (ERGO Einarbeitungsprogramm, 3 Monate) steigt der Score von 78 auf 89. Zusätzliche Spartenweiterbildung (DVA, 6 Monate) → Score 93. ROI: Einarbeitungskosten ~8.000 € vs. externe Neubesetzung mit Versicherungserfahrung ~22.000 €.',
        interviewQuestions: {
            background: [
                { q: 'Ihr CV zeigt 8 Jahre Key Account bei Henkel — wie haben Sie ein B2B-Bestandsportfolio von 2,4 Mio. € betreut?', why: 'Übertragbare Bestandsmanagement-Kompetenz und Vertriebsmethodik verifizieren' },
                { q: 'Was motiviert Sie zum Wechsel vom Industrievertrieb in die Versicherungsbranche?', why: 'Wechselmotivation und Ernsthaftigkeit der Bewerbung bewerten' }
            ],
            behavioral: [
                { q: 'Beschreiben Sie eine komplexe Preisverhandlung mit einem Key Account — wie haben Sie sich vorbereitet und was war das Ergebnis?', why: 'STAR-Methode: Verhandlungsstärke und strategisches Denken' },
                { q: 'Wie haben Sie Ihr 3-köpfiges Innendienst-Team motiviert, Umsatzziele zu erreichen?', why: 'Führungsstil und Teamsteuerung für mögliche Agenturleiter-Perspektive' }
            ],
            technical: [
                { q: 'Was unterscheidet aus Ihrer Sicht den Vertrieb im Industriebereich vom Versicherungsvertrieb?', why: 'Branchenverständnis und Reflexionsfähigkeit prüfen' },
                { q: 'Wie würden Sie in den ersten 90 Tagen als Vertriebspartner Ihren Bestand aufbauen?', why: 'Onboarding-Plan und Eigeninitiative — entscheidend bei Branchenquereinstieg' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 15, required: 80, reason: 'Keine §34d oder IHK-Versicherungsqualifikation — muss im Einarbeitungsprogramm erworben werden' },
                { label: 'Vertriebserfahrung', current: 90, required: 85, reason: '8 Jahre Key Account B2B mit 2,4 Mio. € Bestand und 115% Zielerreichung — stark übertragbar' },
                { label: 'Spartenkenntnis', current: 10, required: 65, reason: 'Kein Bezug zu Versicherungsprodukten im bisherigen Werdegang erkennbar' },
                { label: 'Digital-Kompetenz', current: 85, required: 75, reason: 'Salesforce CRM, SAP SD/MM, MS Office — digitale Kompetenz überdurchschnittlich' },
                { label: 'Führungskompetenz', current: 80, required: 75, reason: '3 MA Innendienst geführt — solide Grundlage für Agenturleiter-Perspektive' }
            ],
            training: 'Empfehlung: ERGO Einarbeitungsprogramm Branchenquereinstieg (3 Monate, §34d inkl.) → Score +11 Punkte. Anschließend DVA Spartenweiterbildung (6 Monate) → weitere +4 Punkte. ROI: Gesamtinvestition ~8.000 € vs. externe Neubesetzung ~22.000 €.'
        }
    },
    sarah: {
        id: 'sarah',
        name: 'Sarah Klein',
        initials: 'SK',
        photo: './images/AdobeStock_252262042.jpeg',
        age: 29,
        city: 'Köln',
        region: 'nrw',
        experience: '4 Jahre Einzelhandel (Teamleitung MediaMarkt)',
        experienceYears: 4,
        education: 'Ausbildung Einzelhandelskauffrau, Weiterbildung Vertrieb',
        skills: ['Teamführung', 'Kundenberatung', 'Vertriebsaffinität', 'Kommunikationsstärke'],
        certifications: ['Ausbildung Einzelhandelskauffrau (DQR 4)', 'Weiterbildung Vertrieb'],
        insuranceFlags: {
            green: ['Teamführungserfahrung (5 MA)', 'Vertriebsaffinität', 'Kommunikationsstärke'],
            red: ['Keine Versicherungserfahrung', 'Keine IHK §34d'],
            neutral: ['Branchenwechsel']
        },
        strengths: ['Teamführungserfahrung', 'Kommunikationsstärke', 'Vertriebsaffinität', 'Kundenorientierung'],
        weaknesses: ['Keine Versicherungserfahrung', 'Keine IHK-Qualifikation'],
        neutrals: ['Branchenwechsel'],
        scores: { vertrieb: 65, branche: 35, qualifikation: 55, standort: 88, softskills: 82 },
        totalScore: 68,
        summary: 'Motivierte Quereinsteigerin mit 4 Jahren Teamleitungserfahrung im Einzelhandel bei MediaMarkt. Führungskompetenz über 5 Mitarbeiter und ausgeprägte Kommunikationsstärke als solide Grundlage für den Versicherungsvertrieb. Fehlende §34d-Qualifikation kann über ERGO Trainee-Programm (6 Monate, IHK-Sachkundeprüfung inklusive) erworben werden.',
        radarData: [65, 35, 55, 88, 82],
        waterfall: [
            { label: 'Teamführung (5 MA)', points: 12, type: 'positive' },
            { label: 'Kommunikationsstärke', points: 10, type: 'positive' },
            { label: 'Vertriebsaffinität', points: 8, type: 'positive' },
            { label: 'Kundenberatungserfahrung', points: 7, type: 'positive' },
            { label: 'Standort Köln (NRW)', points: 6, type: 'positive' },
            { label: 'Kaufmännische Ausbildung', points: 5, type: 'positive' },
            { label: 'Keine Versicherungserfahrung', points: -12, type: 'negative' },
            { label: 'Keine IHK §34d Qualifikation', points: -10, type: 'negative' },
            { label: 'Branchenwechsel', points: -5, type: 'neutral' }
        ],
        counterfactual: 'Nach Abschluss der IHK-Sachkundeprüfung §34d (über ERGO Trainee-Programm, 6 Monate) steigt der Score von 68 auf 82. Prognose erstes Jahr Neugeschäft: 180.000 € Bestandsaufbau.',
        interviewQuestions: {
            background: [
                { q: 'Was motiviert Sie zum Wechsel vom Einzelhandel in den Versicherungsvertrieb?', why: 'Wechselmotivation und Ernsthaftigkeit der Bewerbung bewerten' },
                { q: 'Beschreiben Sie Ihren Führungsstil bei MediaMarkt und wie Sie Ihr 5-köpfiges Team motiviert haben.', why: 'Übertragbare Führungskompetenz für Versicherungsvertrieb' }
            ],
            behavioral: [
                { q: 'Erzählen Sie von einem schwierigen Kundengespräch im Einzelhandel und wie Sie es gelöst haben.', why: 'Beratungskompetenz und Konfliktlösung — übertragbar auf Versicherungsberatung' },
                { q: 'Wie gehen Sie mit Umsatzzielen um? Geben Sie ein konkretes Beispiel für Zielerreichung.', why: 'Vertriebsmentalität und Zielorientierung bewerten' }
            ],
            technical: [
                { q: 'Was wissen Sie über die Unterschiede zwischen Ausschließlichkeitsvertrieb und Maklervertrieb?', why: 'Grundlegendes Branchenverständnis für Quereinsteiger testen' },
                { q: 'Wie stellen Sie sich Ihren typischen Arbeitstag als Vertriebspartnerin vor?', why: 'Realistische Erwartungshaltung an die Rolle prüfen' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 20, required: 80, reason: 'Keine §34d oder IHK-Qualifikation — muss im Trainee-Programm erworben werden' },
                { label: 'Vertriebserfahrung', current: 65, required: 70, reason: '4 Jahre Einzelhandel mit Umsatzverantwortung — Versicherungsvertrieb fehlt' },
                { label: 'Spartenkenntnis', current: 15, required: 60, reason: 'Kein Bezug zu Versicherungsprodukten im bisherigen Werdegang' },
                { label: 'Digital-Kompetenz', current: 75, required: 65, reason: 'MediaMarkt-Erfahrung zeigt Umgang mit digitalen Systemen und POS' },
                { label: 'Führungskompetenz', current: 72, required: 60, reason: 'Teamleitung 5 MA bei MediaMarkt — übertragbare Führungserfahrung' }
            ],
            training: 'Empfehlung: ERGO Trainee-Programm (6 Monate, IHK §34d inkl.) → Score-Steigerung: +14 Punkte. ROI: Trainee-Kosten ~12.000 € vs. externe Besetzung erfahrener Kandidat ~22.000 €.'
        }
    },
    thomas: {
        id: 'thomas',
        name: 'Thomas Wendt',
        initials: 'TW',
        photo: './images/AdobeStock_361342769.jpeg',
        age: 52,
        city: 'Flensburg',
        region: 'nord',
        experience: '20 Jahre Sachbearbeitung Kommunalverwaltung',
        experienceYears: 20,
        education: 'Verwaltungsfachangestellter',
        skills: ['Verwaltung', 'Sachbearbeitung', 'Dokumentation'],
        certifications: ['Verwaltungsfachangestellter (DQR 4)'],
        insuranceFlags: {
            green: ['Langjährige Berufserfahrung', 'Zuverlässigkeit'],
            red: ['Keine Vertriebserfahrung', 'Keine Versicherungskenntnisse', 'Keine §34d', 'Standort ohne Stellen']
        },
        strengths: ['Langjährige Berufserfahrung', 'Zuverlässigkeit', 'Sorgfalt'],
        weaknesses: ['Keine Vertriebserfahrung', 'Keine Branchenkenntnisse', 'Keine kaufmännische Ausbildung', 'Fehlende Kundenorientierung', 'Standort ohne offene Stellen'],
        scores: { vertrieb: 10, branche: 5, qualifikation: 25, standort: 20, softskills: 35 },
        totalScore: 31,
        summary: '20 Jahre Erfahrung in der Kommunalverwaltung, jedoch ohne Bezug zum Vertrieb oder zur Versicherungsbranche. Es fehlen grundlegende Voraussetzungen: §34d-Qualifikation, Vertriebserfahrung und Kundenorientierung. Standort Flensburg bietet aktuell keine offenen Positionen. Quereinsteiger-Programm wäre einziger Einstiegspfad.',
        radarData: [10, 5, 25, 20, 35],
        rejected: true,
        rejectionText: 'Auf Basis Ihres Profils können wir Ihnen derzeit leider keine passende Vertriebsposition empfehlen. Es fehlen grundlegende Voraussetzungen: keine Vertriebserfahrung, keine §34d-Qualifikation, keine Branchenkenntnisse im Versicherungsbereich.',
        waterfall: [
            { label: 'Langjährige Berufserfahrung', points: 5, type: 'positive' },
            { label: 'Zuverlässigkeit / Sorgfalt', points: 4, type: 'positive' },
            { label: 'Verwaltungsausbildung (DQR 4)', points: 3, type: 'positive' },
            { label: 'Keine Vertriebserfahrung (0 J.)', points: -18, type: 'negative' },
            { label: 'Keine §34d Qualifikation', points: -15, type: 'negative' },
            { label: 'Keine Branchenkenntnisse', points: -12, type: 'negative' },
            { label: 'Standort Flensburg (keine Stellen)', points: -10, type: 'negative' },
            { label: 'Keine IDD-Weiterbildung', points: -5, type: 'negative' }
        ],
        counterfactual: 'Auch nach Abschluss des Quereinsteiger-Programms (6 Monate, IHK §34d) würde der Score nur auf ca. 52 steigen. Ein Standortwechsel nach Hamburg (+10 Punkte) wäre zusätzlich erforderlich.',
        interviewQuestions: {
            background: [
                { q: 'Was motiviert Sie nach 20 Jahren Verwaltung zum Wechsel in den Versicherungsvertrieb?', why: 'Wechselmotivation und Ernsthaftigkeit — kritisch bei so langem Verwaltungshintergrund' }
            ],
            behavioral: [
                { q: 'Beschreiben Sie eine Situation, in der Sie proaktiv auf einen Bürger zugegangen sind.', why: 'Kundenorientierung und Eigeninitiative — zentrale Schwächen im Profil' }
            ],
            technical: [
                { q: 'Was verstehen Sie unter einer Bedarfsanalyse im Versicherungskontext?', why: 'Grundlegendes Verständnis der Versicherungsberatung testen' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 5, required: 80, reason: 'Keine versicherungsrelevante Qualifikation oder Weiterbildung vorhanden' },
                { label: 'Vertriebserfahrung', current: 10, required: 70, reason: 'Lagermitarbeiter ohne Kundenkontakt — keine Vertriebserfahrung erkennbar' },
                { label: 'Spartenkenntnis', current: 5, required: 60, reason: 'Kein Bezug zur Versicherungs- oder Finanzbranche im Werdegang' },
                { label: 'Digital-Kompetenz', current: 30, required: 65, reason: 'Grundlegende PC-Kenntnisse aus Lagerverwaltung — keine CRM/Vertriebstools' },
                { label: 'Führungskompetenz', current: 15, required: 40, reason: 'Keine Führungsverantwortung im bisherigen Werdegang nachweisbar' }
            ],
            training: 'Erhebliche Lücken in allen Dimensionen. Mindestens Quereinsteiger-Programm (6 Monate) + Standortwechsel erforderlich. Geschätzte Gesamtinvestition: ~15.000 € bei unsicherer Erfolgsquote.'
        }
    }
};
