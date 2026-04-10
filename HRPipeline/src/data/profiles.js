export const HP_PROFILES = {
    max: {
        id: 'max',
        name: 'Max Berger',
        initials: 'MB',
        photo: './images/AdobeStock_624564221.jpeg',
        age: 34,
        city: 'Düsseldorf',
        region: 'nrw',
        experience: '8 Jahre Versicherungsvertrieb (Allianz AO)',
        experienceYears: 8,
        education: 'BWL-Studium (B.A.), IHK Versicherungsfachmann',
        skills: ['Kundenakquise', 'Bestandsmanagement', 'Führungserfahrung', 'Vertriebssteuerung', 'Kundenbindung'],
        certifications: ['IHK Versicherungsfachmann (§34d)', 'BWL Bachelor (DQR 6)', 'IDD Weiterbildung 2024'],
        insuranceFlags: {
            green: ['8J Allianz AO-Erfahrung', 'IHK §34d qualifiziert', 'Bestandsgröße 2.4 Mio €', 'Ø 115% Zielerreichung'],
            red: ['Kein Fachwirt IHK'],
            neutral: ['Keine ERGO-Erfahrung']
        },
        strengths: ['Kundenakquise', 'Bestandsmanagement', 'Führungserfahrung (3 MA)', 'IHK-qualifiziert', 'Allianz AO-Erfahrung'],
        weaknesses: ['Kein Fachwirt IHK'],
        neutrals: ['Keine ERGO-Erfahrung'],
        scores: { vertrieb: 95, branche: 90, qualifikation: 88, standort: 92, softskills: 85 },
        totalScore: 92,
        summary: '8 Jahre fundierte Vertriebserfahrung in der Allianz Ausschließlichkeitsorganisation. IHK-Qualifikation nach §34d, nachgewiesene Führungskompetenz über 3 Mitarbeiter und Bestandsvolumen von 2,4 Mio €. Durchschnittliche Zielerreichung von 115% belegt überdurchschnittliche Vertriebsleistung. Idealer Kandidat für die Agenturleitung.',
        radarData: [95, 90, 88, 92, 85],
        waterfall: [
            { label: 'IHK Versicherungsfachmann §34d', points: 18, type: 'positive' },
            { label: '8 Jahre AO-Erfahrung (Allianz)', points: 15, type: 'positive' },
            { label: 'Bestandsgröße 2,4 Mio €', points: 14, type: 'positive' },
            { label: 'Führungserfahrung (3 MA)', points: 12, type: 'positive' },
            { label: 'BWL-Studium (DQR 6)', points: 10, type: 'positive' },
            { label: 'Ø 115% Zielerreichung', points: 8, type: 'positive' },
            { label: 'IDD Weiterbildung aktuell', points: 5, type: 'positive' },
            { label: 'Standort Düsseldorf (Match)', points: 7, type: 'positive' },
            { label: 'Kein Fachwirt IHK', points: -7, type: 'negative' },
            { label: 'Keine ERGO-Erfahrung', points: -3, type: 'neutral' }
        ],
        linkedinInsights: [
            { text: 'Nebentätigkeit: Dozent IHK Düsseldorf (seit 2023)', detail: 'Hält Seminare zu Versicherungsvertrieb — im CV nicht erwähnt, zeigt Fachexpertise und Engagement' },
            { text: 'Empfohlen für „Vertriebsführung" von 12 Kontakten', detail: '520+ Kontakte im Versicherungs- und Finanzsektor bestätigen starkes Branchennetzwerk' }
        ],
        counterfactual: 'Wenn dieser Kandidat den Fachwirt für Versicherungen und Finanzen IHK (Bachelor Professional, DQR 6) abschließt, steigt sein Score von 92 auf 97. Empfehlung: DVA-Programm (24 Monate berufsbegleitend, ca. 3.500 €).',
        interviewQuestions: {
            background: [
                { q: 'Ihr CV zeigt 8 Jahre bei der Allianz AO — beschreiben Sie Ihren typischen Bestandskundenbetreuungsprozess.', why: 'Verifizierung der AO-Vertriebserfahrung und Bestandsmanagement-Kompetenz' },
                { q: 'Wie haben Sie Ihr Bestandsvolumen von 2,4 Mio € aufgebaut? Welche Akquise-Strategien waren am erfolgreichsten?', why: 'Quantifizierung der Vertriebsleistung und strategisches Denken' }
            ],
            behavioral: [
                { q: 'Erzählen Sie von einer Situation, in der Sie eine Deckungslücke bei einem Bestandskunden identifiziert haben. Wie sind Sie vorgegangen?', why: 'STAR-Methode: Bedarfsanalyse-Kompetenz und Beratungsqualität' },
                { q: 'Beschreiben Sie eine Herausforderung bei der Führung Ihres 3-köpfigen Teams. Wie haben Sie diese gelöst?', why: 'Führungskompetenz und Konfliktlösungsfähigkeit für Agenturleiter-Rolle' }
            ],
            technical: [
                { q: 'Wie würden Sie eine bAV-Beratung für ein mittelständisches Unternehmen mit 200 Mitarbeitern strukturieren?', why: 'Technisches Fachwissen und Beratungskompetenz im Firmenkundengeschäft' },
                { q: 'Welche Erfahrungen haben Sie mit BiPRO-Schnittstellen und digitalen Vergleichsrechnern?', why: 'Digitale Kompetenz — entscheidend für moderne Vertriebsprozesse' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 85, required: 80, reason: 'IHK §34d vorhanden, IDD aktuell — Fachwirt fehlt für höhere Einstufung' },
                { label: 'Vertriebserfahrung', current: 95, required: 85, reason: '8 Jahre AO mit nachweislich 2,4 Mio € Bestand und 115% Zielerreichung' },
                { label: 'Spartenkenntnis', current: 80, required: 75, reason: 'Komposit/Leben/Kranken im CV belegt, bAV-Tiefe nicht erkennbar' },
                { label: 'Digital-Kompetenz', current: 70, required: 80, reason: 'Keine Erwähnung digitaler Tools (CRM, BiPRO, Vergleichsrechner) im CV' },
                { label: 'Führungskompetenz', current: 78, required: 85, reason: '3 MA geführt — für Agenturleitung (5+ MA) ausbaufähig' }
            ],
            training: 'Empfehlung: Fachwirt für Versicherungen und Finanzen IHK (DVA, 24 Monate, ~3.500 €) → Score-Steigerung: +5 Punkte. ROI: Weiterbildungskosten 3.500 € vs. externe Neubesetzung ~18.000 €.'
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
